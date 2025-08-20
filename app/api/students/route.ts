import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { generateStudentCredentials, generateInviteToken } from '@/lib/utils/generators'

const createStudentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  sendInvite: z.boolean().optional(),
  generateCredentials: z.boolean().optional(),
  classIds: z.array(z.string()),
  schedules: z.array(z.object({
    dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
    startTime: z.string(),
    endTime: z.string(),
    title: z.string().optional(),
    notes: z.string().optional()
  })).optional()
})

const getStudentsSchema = z.object({
  search: z.string().optional(),
  classId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INVITED', 'INACTIVE']).optional(),
  page: z.string().optional(),
  limit: z.string().optional()
})

// GET /api/students - Get students with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const params = getStudentsSchema.parse({
      search: searchParams.get('search'),
      classId: searchParams.get('classId'),
      status: searchParams.get('status'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit')
    })

    const page = parseInt(params.page || '1')
    const limit = parseInt(params.limit || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      role: 'STUDENT'
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } }
      ]
    }

    if (params.status) {
      where.status = params.status
    }

    if (params.classId) {
      where.enrollments = {
        some: {
          classId: params.classId,
          isActive: true
        }
      }
    }

    // Get total count
    const total = await prisma.user.count({ where })

    // Get students with relationships
    const students = await prisma.user.findMany({
      where,
      include: {
        enrollments: {
          include: {
            class: true
          }
        },
        schedules: true,
        submissions: {
          where: {
            status: 'GRADED'
          },
          select: {
            score: true,
            maxScore: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    // Calculate analytics for each student
    const studentsWithAnalytics = students.map(student => {
      const completedAssignments = student.submissions.length
      const totalScore = student.submissions.reduce((sum, sub) => sum + (sub.score || 0), 0)
      const maxPossible = student.submissions.reduce((sum, sub) => sum + (sub.maxScore || 0), 0)
      const averageScore = maxPossible > 0 ? (totalScore / maxPossible) * 100 : undefined

      return {
        ...student,
        completedAssignments,
        averageScore,
        scheduleConflicts: false // TODO: Implement conflict detection
      }
    })

    return NextResponse.json({
      data: studentsWithAnalytics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Failed to fetch students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

// POST /api/students - Create new student
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createStudentSchema.parse(body)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      )
    }

    // Verify all classes exist and belong to teacher
    if (data.classIds.length > 0) {
      const existingClasses = await prisma.class.findMany({
        where: {
          id: { in: data.classIds },
          teacherId: session.user.id
        }
      })

      if (existingClasses.length !== data.classIds.length) {
        return NextResponse.json(
          { error: 'One or more classes not found or access denied' },
          { status: 404 }
        )
      }
    }

    // Generate credentials
    const credentials = generateStudentCredentials()
    const hashedPassword = await bcrypt.hash(credentials.password, 12)

    // Generate invite token if needed
    const inviteToken = data.sendInvite ? generateInviteToken() : undefined
    const inviteExpiry = data.sendInvite ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined // 7 days

    // Create student user
    const student = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'STUDENT',
        status: data.sendInvite ? 'INVITED' : 'ACTIVE',
        loginCode: credentials.loginCode,
        inviteToken,
        inviteExpiry
      }
    })

    // Create class enrollments
    if (data.classIds.length > 0) {
      await prisma.enrollment.createMany({
        data: data.classIds.map(classId => ({
          studentId: student.id,
          classId,
          isActive: true
        }))
      })
    }

    // Create schedules
    if (data.schedules && data.schedules.length > 0) {
      await prisma.schedule.createMany({
        data: data.schedules.map(schedule => ({
          studentId: student.id,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          title: schedule.title,
          notes: schedule.notes
        }))
      })
    }

    // TODO: Send email invitation if requested
    if (data.sendInvite) {
      // Implement email sending logic here
      console.log(`Would send invite email to ${data.email} with token ${inviteToken}`)
    }

    // Fetch the created student with relationships
    const createdStudent = await prisma.user.findUnique({
      where: { id: student.id },
      include: {
        enrollments: {
          include: {
            class: true
          }
        },
        schedules: true
      }
    })

    return NextResponse.json({
      data: createdStudent,
      credentials: data.generateCredentials ? {
        loginCode: credentials.loginCode,
        displayPassword: credentials.displayPassword
      } : undefined,
      message: 'Student created successfully'
    })

  } catch (error) {
    console.error('Failed to create student:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    )
  }
}