import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { generateAssignmentCode } from '@/lib/utils/generators'

const createAssignmentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  type: z.enum(['DRAWING', 'WRITING', 'VOCABULARY', 'SPEAKING']),
  classId: z.string().min(1, 'Class ID is required'),
  folderId: z.string().optional(),
  template: z.enum(['BLANK', 'LINED', 'GRID', 'CUSTOM']),
  templateData: z.any().optional(),
  dueDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  maxScore: z.number().min(1).max(1000).optional(),
  instructions: z.string().optional(),
  instructionsTTS: z.boolean().default(false),
  allowLateSubmission: z.boolean().default(true),
  allowCollaboration: z.boolean().default(false),
  timeLimit: z.number().min(1).max(480).optional(),
  resources: z.array(z.object({
    title: z.string().min(1, 'Resource title is required'),
    url: z.string().url('Please enter a valid URL'),
    type: z.enum(['link', 'file', 'video'])
  })).optional(),
  saveAsDraft: z.boolean().default(false)
})

const getAssignmentsSchema = z.object({
  search: z.string().optional(),
  classId: z.string().optional(),
  folderId: z.string().optional(),
  type: z.enum(['DRAWING', 'WRITING', 'VOCABULARY', 'SPEAKING']).optional(),
  status: z.enum(['draft', 'published', 'due_soon', 'overdue']).optional(),
  page: z.string().optional(),
  limit: z.string().optional()
})

// GET /api/assignments - Get assignments with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const params = getAssignmentsSchema.parse({
      search: searchParams.get('search'),
      classId: searchParams.get('classId'),
      folderId: searchParams.get('folderId'),
      type: searchParams.get('type'),
      status: searchParams.get('status'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit')
    })

    const page = parseInt(params.page || '1')
    const limit = parseInt(params.limit || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      teacherId: session.user.id
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } }
      ]
    }

    if (params.type) {
      where.type = params.type
    }

    if (params.classId) {
      where.classId = params.classId
    }

    if (params.folderId) {
      where.folderId = params.folderId
    }

    // Handle status filtering
    const now = new Date()
    switch (params.status) {
      case 'draft':
        where.isDraft = true
        break
      case 'published':
        where.isDraft = false
        where.isPublished = true
        break
      case 'due_soon':
        where.isDraft = false
        where.dueDate = {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        }
        break
      case 'overdue':
        where.isDraft = false
        where.dueDate = {
          lt: now
        }
        break
    }

    // Get total count
    const total = await prisma.assignment.count({ where })

    // Get assignments with relationships
    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        folder: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        submissions: {
          select: {
            id: true,
            status: true,
            score: true,
            maxScore: true,
            submittedAt: true,
            student: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            submissions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    // Calculate analytics for each assignment
    const assignmentsWithAnalytics = assignments.map(assignment => {
      const totalSubmissions = assignment.submissions.length
      const submittedCount = assignment.submissions.filter(sub => 
        sub.status === 'SUBMITTED' || sub.status === 'GRADED' || sub.status === 'RETURNED'
      ).length
      
      const gradedSubmissions = assignment.submissions.filter(sub => 
        sub.status === 'GRADED' && sub.score !== null && sub.maxScore !== null
      )
      
      const averageScore = gradedSubmissions.length > 0 
        ? gradedSubmissions.reduce((sum, sub) => sum + ((sub.score! / sub.maxScore!) * 100), 0) / gradedSubmissions.length
        : undefined

      const completionRate = totalSubmissions > 0 ? (submittedCount / totalSubmissions) * 100 : 0

      return {
        ...assignment,
        analytics: {
          totalSubmissions,
          completionRate,
          averageScore
        }
      }
    })

    return NextResponse.json({
      data: assignmentsWithAnalytics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Failed to fetch assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}

// POST /api/assignments - Create new assignment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createAssignmentSchema.parse(body)

    // Verify class ownership
    const classExists = await prisma.class.findFirst({
      where: {
        id: data.classId,
        teacherId: session.user.id
      }
    })

    if (!classExists) {
      return NextResponse.json(
        { error: 'Class not found or access denied' },
        { status: 404 }
      )
    }

    // Verify folder ownership if provided
    if (data.folderId) {
      const folderExists = await prisma.assignmentFolder.findFirst({
        where: {
          id: data.folderId,
          teacherId: session.user.id,
          classId: data.classId
        }
      })

      if (!folderExists) {
        return NextResponse.json(
          { error: 'Folder not found or access denied' },
          { status: 404 }
        )
      }
    }

    // Generate assignment access code and QR code
    const accessCode = generateAssignmentCode()
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const qrCode = `data:image/svg+xml;base64,${btoa(`<svg>QR Code for ${baseUrl}/assignment/${accessCode}</svg>`)}`

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        template: data.template,
        templateData: data.templateData,
        accessCode,
        qrCode,
        dueDate: data.dueDate,
        maxScore: data.maxScore || 100,
        instructions: data.instructions,
        instructionsTTS: data.instructionsTTS,
        allowLateSubmission: data.allowLateSubmission,
        allowCollaboration: data.allowCollaboration,
        timeLimit: data.timeLimit,
        resources: data.resources,
        isDraft: data.saveAsDraft,
        isPublished: !data.saveAsDraft,
        teacherId: session.user.id,
        classId: data.classId,
        folderId: data.folderId
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        folder: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    })

    return NextResponse.json({
      data: assignment,
      accessCode,
      qrCode,
      message: `Assignment ${data.saveAsDraft ? 'saved as draft' : 'created and published'} successfully`
    })

  } catch (error) {
    console.error('Failed to create assignment:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    )
  }
}