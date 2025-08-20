import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code

    if (!code) {
      return NextResponse.json(
        { error: 'Assignment code is required' },
        { status: 400 }
      )
    }

    // Find assignment by class code (assignments belong to classes with codes)
    const assignment = await prisma.assignment.findFirst({
      where: {
        isPublished: true, // Only published assignments can be accessed by guests
        class: {
          code: code.toUpperCase(),
          isActive: true
        }
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
      },
      orderBy: {
        createdAt: 'desc' // Get the most recent assignment for this class
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found or not available for guest access' },
        { status: 404 }
      )
    }

    // Return assignment data without sensitive information
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
    console.error('Error fetching assignment by code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}