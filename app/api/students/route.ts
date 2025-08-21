import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { generateStudentCredentials, generateInviteToken } from '@/lib/utils/generators'

const createStudentSchema = z.object({
  name: z.string().min(2),
  email: z.string().optional().refine((email) => {
    if (!email || email.trim() === '') return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, 'Please enter a valid email address'),
  timezone: z.string().optional(),
  generateOwnClass: z.boolean().optional(),
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

    // Check if email already exists (only if email is provided)
    if (data.email && data.email.trim() !== '') {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'A user with this email already exists' },
          { status: 400 }
        )
      }
    }

    // Generate credentials for the student
    const credentials = generateStudentCredentials()
    const hashedPassword = await bcrypt.hash(credentials.password, 12)

    // Prepare student data - handle optional email properly
    const studentData: any = {
      name: data.name,
      password: hashedPassword,
      role: 'STUDENT',
      status: 'ACTIVE', // Always active in simplified version
      loginCode: credentials.loginCode
    }

    // Only set email if it's provided and not empty
    if (data.email && data.email.trim() !== '') {
      studentData.email = data.email
    }

    // Create student user
    const student = await prisma.user.create({
      data: studentData
    })

    // Create a dedicated class for this student (1:1 relationship)
    let studentClass = null
    if (data.generateOwnClass !== false) { // Default to true
      // Generate a unique class code
      const classCode = `${credentials.loginCode}-CLASS`
      
      studentClass = await prisma.class.create({
        data: {
          name: `${data.name}'s Class`,
          description: `Personalized class for ${data.name}`,
          code: classCode,
          level: 'BEGINNER', // Default level, can be updated later
          color: '#E55A3C', // Default orange color
          teacherId: session.user.id,
          isActive: true
        }
      })

      // Enroll student in their own class
      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          classId: studentClass.id,
          isActive: true
        }
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
      credentials: {
        loginCode: credentials.loginCode,
        displayPassword: credentials.displayPassword
      },
      message: 'Student created successfully with their own dedicated class'
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