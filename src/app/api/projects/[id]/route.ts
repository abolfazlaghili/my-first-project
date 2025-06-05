import { surrealdb } from '@/lib/surrealdb'
import { NextResponse } from 'next/server'
import { RecordId, RecordIdValue } from 'surrealdb'

interface Project {
  id: string
  name: string
  title: string
  description: string
  owner: RecordId
  members: RecordId[]
  createdAt: Date
  updatedAt: Date
  endTime: Date
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    const db = await surrealdb()
    const projectId = new RecordId('Project', id)
    const project = await db.select(projectId)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    return NextResponse.json({ project })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await Promise.resolve(params)
    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }
    const db = await surrealdb()
    const body: Partial<Project> = await request.json()
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
    if (body.members !== undefined) {
      patchOps.push({
        op: 'replace',
        path: '/members',
        value: body.members.map(
          (m: any) => new RecordId('User', m.includes(':') ? m.split(':')[1] : m)
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

    const updatedProject = await db.patch(new RecordId('Project', id), patchOps as any)

    if (!updatedProject) {
      return NextResponse.json({ error: 'Failed to update Project' }, { status: 400 })
    }

    return NextResponse.json({ message: 'Project updated successfully', project: updatedProject })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await Promise.resolve(params)
    const db = await surrealdb()
    await db.delete(new RecordId('Project', id))
    return NextResponse.json({ message: 'Project successfully deleted' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
