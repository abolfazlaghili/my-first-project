import { surrealdb } from '@/lib/surrealdb'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { RecordId } from 'surrealdb'

export async function GET() {
  try {
    const db = await surrealdb()
    // using select for fetching all Projects
    const Projects = await db.select('Project')
    return NextResponse.json({ Projects }, { status: 200 })
  } catch (error) {
    console.error('Error fetching Project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { name, title, description, members, endTime } = await request.json()
    if (!name || !title || !description || !members) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const memberIds = members.map((memberIdRaw: any) => {
      let memberId = typeof memberIdRaw === 'string' ? memberIdRaw : memberIdRaw.toString()
      const actualId = memberId.includes(':') ? memberId.split(':')[1] : memberId
      return new RecordId('User', actualId)
    })
    const ownerId = 'User:mv85gesz2gfncqde2tbr'
    const actualOwnerId = ownerId.includes(':') ? ownerId.split(':')[1] : ownerId
    const ownerRef = new RecordId('User', actualOwnerId)

    const db = await surrealdb()

    const newProject = await db.create('Project', {
      name,
      title,
      description: description || '',
      updatedAt: new Date(),
      createdAt: new Date(),
      endTime: new Date(),
      owner: ownerRef,
      members: memberIds,
    })

    return NextResponse.json(newProject, { status: 201 })
  } catch (error) {
    console.error('Error adding project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
