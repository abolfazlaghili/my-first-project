import { surrealdb } from '@/lib/surrealdb'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { RecordId } from 'surrealdb'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await surrealdb()
    const [orders] = await db.query('SELECT * FROM Order WHERE userId = $userId FETCH productId;', {
      userId,
    })
    return NextResponse.json({ orders: orders || [] })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { shippingInfoName, shippingInfoAdress, shippingInfoPhone } = await request.json()
    if (!shippingInfoName || !shippingInfoAdress || !shippingInfoPhone) {
      return NextResponse.json({ error: 'Missing shipping information' }, { status: 400 })
    }

    const db = await surrealdb()

    // 1. دریافت محصولات سبد خرید کاربر
    const [cartItems]: [
      {
        productId: {
          id: any
          stock: number
          name: string
          price: number
        }
        quantity: number
      }[]
    ] = await db.query('SELECT * FROM Cart WHERE userId = $userId FETCH productId;', { userId })
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // 2. ثبت سفارش برای هر محصول در سبد خرید
    const orders = []
    for (const item of cartItems) {
      const product = item.productId
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product: ${product.name}` },
          { status: 400 }
        )
      }

      // 2. ثبت سفارش برای هر محصول در سبد خرید
      const orders = []
      for (const item of cartItems) {
        const product = item.productId // این یه شیء کامل از جدول Product هست
        if (product.stock < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for product: ${product.name}` },
            { status: 400 }
          )
        }

        // محاسبه مبلغ کل
        const total = product.price * item.quantity

        // استخراج آیدی محصول و پردازش آن
        let productIdStr = product.id.id // آیدی به صورت رشته (مثلاً "Product:123" یا فقط "123")
        if (typeof productIdStr !== 'string') {
          productIdStr = productIdStr.toString() // تبدیل به رشته اگر عدد یا شیء باشه
        }
        const productIdValue = productIdStr.includes(':')
          ? productIdStr.split(':')[1]
          : productIdStr

        // ثبت سفارش
        const newOrder = await db.create('Order', {
          productId: new RecordId('Product', productIdValue),
          quantity: item.quantity,
          status: 'pending',
          createdAt: new Date(),
          userId,
          total,
          shippingInfoName,
          shippingInfoAdress,
          shippingInfoPhone,
        })

        // آپدیت موجودی محصول
        await db.merge(new RecordId('Product', productIdValue), {
          stock: product.stock - item.quantity,
        })

        orders.push(newOrder)
        await db.query('DELETE FROM Cart WHERE userId = $userId;', { userId })
        console.log('Cart deleted for user:', userId)
      }

      // Return the created orders
      return NextResponse.json({ orders })
    }
  } catch (error) {
    console.error('Error processing order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
