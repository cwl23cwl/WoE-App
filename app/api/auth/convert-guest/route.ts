import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const convertGuestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  guestSessionData: z.object({
    assignmentId: z.string(),
    assignmentCode: z.string(),
    workData: z.any().optional(),
    tempName: z.string().optional(),
    startedAt: z.string(),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = convertGuestSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Start a transaction to create user and submission
    const result = await prisma.$transaction(async (tx) => {
      // Create user account
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          role: 'STUDENT',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${validatedData.email}`,
        },
      })

      // Get assignment details to find the class
      const assignment = await tx.assignment.findUnique({
        where: { id: validatedData.guestSessionData.assignmentId },
        include: { class: true }
      })

      if (!assignment) {
        throw new Error('Assignment not found')
      }

      // Auto-enroll student in the class
      await tx.enrollment.create({
        data: {
          studentId: user.id,
          classId: assignment.classId,
        },
      })

      // Create submission with guest work data if any
      let submission = null
      if (validatedData.guestSessionData.workData) {
        submission = await tx.submission.create({
          data: {
            studentId: user.id,
            assignmentId: validatedData.guestSessionData.assignmentId,
            status: 'DRAFT',
            excalidrawData: validatedData.guestSessionData.workData.excalidrawData,
            textContent: validatedData.guestSessionData.workData.textContent || null,
            notes: validatedData.guestSessionData.workData.notes || null,
          },
        })
      }

      // Create initial progress record
      await tx.studentProgress.create({
        data: {
          studentId: user.id,
          classId: assignment.classId,
          assignmentId: assignment.id,
          completedAssignments: 0,
          streakDays: 0,
          drawingSkillLevel: 1,
          writingSkillLevel: 1,
          vocabularySkillLevel: 1,
        },
      })

      return { user, submission, assignment }
    })

    return NextResponse.json({
      message: 'Account created successfully and guest work saved',
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
      submission: result.submission ? {
        id: result.submission.id,
        status: result.submission.status,
      } : null,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Guest conversion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}