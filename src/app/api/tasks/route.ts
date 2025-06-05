import { surrealdb } from '@/lib/surrealdb'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { RecordId } from 'surrealdb'

export async function GET() {
  try {
    const db = await surrealdb()
    // using select for fetching all Tasks
    const tasks = await db.select('Tasks')
    return NextResponse.json({ tasks }, { status: 200 })
  } catch (error) {
    console.error('Error fetching Tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { name, title, description, endTime, assignees, project } = await request.json()
    if (!name || !title || !description || !assignees || !project) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const db = await surrealdb()

    const assigneesIds = assignees.map((assigneesidraw: any) => {
      const assigneesactualId = assigneesidraw.includes(':')
        ? assigneesidraw.split(':')[1]
        : assignees
      return new RecordId('User', assigneesactualId)
    })

    const actualId = project.includes(':') ? project.split(':')[1] : project
    const projectref = new RecordId('Project', actualId)

    const newProject = await db.create('Tasks', {
      name,
      title,
      description: description || '',
      updatedAt: new Date(),
      createdAt: new Date(),
      endTime: new Date(),
      assignees: assigneesIds,
      project: projectref,
    })

    return NextResponse.json(newProject, { status: 201 })
  } catch (error) {
    console.error('Error adding project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
