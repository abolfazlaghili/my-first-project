import { surrealdb } from '@/lib/surrealdb'
import { NextResponse } from 'next/server'
import { RecordId } from 'surrealdb'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    const db = await surrealdb()
    const taskId = new RecordId('Tasks', id)
    const task = await db.select(taskId)
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    return NextResponse.json({ task })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

interface Task {
  id: string
  name: string
  title: string
  description: string
  assignees: RecordId[]
  project: RecordId
  createdAt: Date
  updatedAt: Date
  endTime: Date
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await Promise.resolve(params)
    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }
    const db = await surrealdb()
    const body: Partial<Task> = await request.json()
    const patchOps = []

    if (body.name !== undefined) {
      patchOps.push({ op: 'replace', path: '/name', value: body.name })
    }
    if (body.title !== undefined) {
      patchOps.push({ op: 'replace', path: '/title', value: body.title })
    }
    if (body.description !== undefined) {
      patchOps.push({ op: 'replace', path: '/description', value: body.description })
    }
    if (body.assignees !== undefined) {
      patchOps.push({
        op: 'replace',
        path: '/assignees',
        value: body.assignees.map(
          (a: any) => new RecordId('User', a.includes(':') ? a.split(':')[1] : a)
        ),
      })
    }
    if (body.endTime !== undefined) {
      patchOps.push({ op: 'replace', path: '/endTime', value: new Date(body.endTime) })
    }

    patchOps.push({ op: 'replace', path: '/updatedAt', value: new Date() })

    if (patchOps.length === 0) {
      return NextResponse.json({ error: 'No fields provided for update' }, { status: 400 })
    }

    const updatedTask = await db.patch(new RecordId('Tasks', id), patchOps as any)

    if (!updatedTask) {
      return NextResponse.json({ error: 'Failed to update Task' }, { status: 400 })
    }

    return NextResponse.json({ message: 'Task updated successfully', task: updatedTask })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await Promise.resolve(params)
    const db = await surrealdb()
    await db.delete(new RecordId('Tasks', id))
    return NextResponse.json({ message: 'Task successfully deleted' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
