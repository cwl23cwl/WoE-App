import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET /api/classes - Get teacher's classes with students and assignments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get classes with all related data
    const classes = await prisma.class.findMany({
      where: {
        teacherId: session.user.id
      },
      include: {
        enrollments: {
          where: { isActive: true },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                status: true,
                loginCode: true,
                createdAt: true
              }
            }
          }
        },
        folders: {
          include: {
            assignments: {
              include: {
                submissions: {
                  select: {
                    id: true,
                    status: true,
                    studentId: true
                  }
                }
              }
            }
          }
        },
        assignments: {
          where: {
            folderId: null // Assignments not in folders
          },
          include: {
            submissions: {
              select: {
                id: true,
                status: true,
                studentId: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      data: classes
    })

  } catch (error) {
    console.error('Failed to fetch classes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    )
  }
}