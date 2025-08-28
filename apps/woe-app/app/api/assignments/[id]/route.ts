import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignmentId = params.id

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      )
    }

    // Find assignment by ID
    const assignment = await prisma.assignment.findUnique({
      where: {
        id: assignmentId,
        isPublished: true // Only published assignments
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            code: true,
            level: true,
            teacher: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found or not available' },
        { status: 404 }
      )
    }

    // Return assignment data
    const publicAssignment = {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      type: assignment.type,
      instructions: assignment.instructions,
      excalidrawData: assignment.excalidrawData,
      canvasWidth: assignment.canvasWidth,
      canvasHeight: assignment.canvasHeight,
      dueDate: assignment.dueDate,
      maxScore: assignment.maxScore,
      resources: assignment.resources,
      class: {
        name: assignment.class.name,
        code: assignment.class.code,
        level: assignment.class.level,
        teacher: assignment.class.teacher.name
      }
    }

    return NextResponse.json(publicAssignment)

  } catch (error) {
    console.error('Error fetching assignment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}