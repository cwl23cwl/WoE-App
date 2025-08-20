import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create teacher user
  const teacherPassword = await bcrypt.hash('teacher123', 10)
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: {
      email: 'teacher@example.com',
      name: 'Sarah Johnson',
      password: teacherPassword,
      role: 'TEACHER',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher',
    },
  })

  // Create student users
  const student1Password = await bcrypt.hash('student123', 10)
  const student1 = await prisma.user.upsert({
    where: { email: 'student1@example.com' },
    update: {},
    create: {
      email: 'student1@example.com',
      name: 'Emily Chen',
      password: student1Password,
      role: 'STUDENT',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student1',
    },
  })

  const student2Password = await bcrypt.hash('student123', 10)
  const student2 = await prisma.user.upsert({
    where: { email: 'student2@example.com' },
    update: {},
    create: {
      email: 'student2@example.com',
      name: 'Jun Kim',
      password: student2Password,
      role: 'STUDENT',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student2',
    },
  })

  // Create sample class
  const sampleClass = await prisma.class.upsert({
    where: { code: 'BEGINNER001' },
    update: {},
    create: {
      name: 'Beginning Writing Class',
      description: 'Learn to write sentences and tell stories. We use pictures and words to share ideas.',
      code: 'BEGINNER001',
      level: 'Beginner',
      color: '#E55A3C',
      teacherId: teacher.id,
      maxStudents: 20,
    },
  })

  // Enroll students in the class
  await prisma.enrollment.upsert({
    where: {
      studentId_classId: {
        studentId: student1.id,
        classId: sampleClass.id,
      },
    },
    update: {},
    create: {
      studentId: student1.id,
      classId: sampleClass.id,
    },
  })

  await prisma.enrollment.upsert({
    where: {
      studentId_classId: {
        studentId: student2.id,
        classId: sampleClass.id,
      },
    },
    update: {},
    create: {
      studentId: student2.id,
      classId: sampleClass.id,
    },
  })

  // Create sample assignment with Excalidraw data
  const sampleExcalidrawData = {
    type: "excalidraw",
    version: 2,
    source: "https://excalidraw.com",
    elements: [
      {
        id: "sample-text-1",
        type: "text",
        x: 100,
        y: 100,
        width: 200,
        height: 25,
        angle: 0,
        strokeColor: "#1e1e1e",
        backgroundColor: "transparent",
        fillStyle: "hachure",
        strokeWidth: 1,
        strokeStyle: "solid",
        roughness: 1,
        opacity: 100,
        text: "Write your story here!",
        fontSize: 20,
        fontFamily: 1,
        textAlign: "left",
        verticalAlign: "top",
      },
      {
        id: "sample-rect-1",
        type: "rectangle",
        x: 50,
        y: 200,
        width: 300,
        height: 200,
        angle: 0,
        strokeColor: "#E55A3C",
        backgroundColor: "#FDF7F2",
        fillStyle: "hachure",
        strokeWidth: 2,
        strokeStyle: "solid",
        roughness: 1,
        opacity: 100,
      }
    ],
    appState: {
      gridSize: null,
      viewBackgroundColor: "#ffffff"
    },
    files: {}
  }

  const assignment = await prisma.assignment.upsert({
    where: { id: 'sample-assignment-1' },
    update: {},
    create: {
      id: 'sample-assignment-1',
      title: 'My First Story',
      description: 'Draw a picture and write about it. Tell us what is happening in your drawing.',
      type: 'DRAWING',
      excalidrawData: sampleExcalidrawData,
      canvasWidth: 800,
      canvasHeight: 600,
      maxScore: 100,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      isPublished: true,
      allowLateSubmission: true,
      instructions: 'Draw a picture first. Then write 3 sentences about your picture. Have fun!',
      resources: [
        {
          type: 'link',
          title: 'How to Draw Simple Pictures',
          url: 'https://example.com/drawing-tips',
          description: 'Easy tips for drawing'
        },
        {
          type: 'video',
          title: 'Writing About Pictures',
          url: 'https://example.com/story-basics',
          description: 'How to write about what you see'
        }
      ],
      teacherId: teacher.id,
      classId: sampleClass.id,
    },
  })

  // Create sample submissions
  await prisma.submission.upsert({
    where: {
      studentId_assignmentId: {
        studentId: student1.id,
        assignmentId: assignment.id,
      },
    },
    update: {},
    create: {
      studentId: student1.id,
      assignmentId: assignment.id,
      status: 'SUBMITTED',
      excalidrawData: {
        ...sampleExcalidrawData,
        elements: [
          ...sampleExcalidrawData.elements,
          {
            id: "student-story-1",
            type: "text",
            x: 60,
            y: 300,
            width: 280,
            height: 100,
            text: "There is a little cat in the garden. The cat likes the pretty flower. The cat is very happy.",
            fontSize: 16,
            fontFamily: 1,
            textAlign: "left",
            verticalAlign: "top",
          }
        ]
      },
      textContent: "There is a little cat in the garden. The cat likes the pretty flower. The cat is very happy.",
      submittedAt: new Date(),
    },
  })

  await prisma.submission.upsert({
    where: {
      studentId_assignmentId: {
        studentId: student2.id,
        assignmentId: assignment.id,
      },
    },
    update: {},
    create: {
      studentId: student2.id,
      assignmentId: assignment.id,
      status: 'DRAFT',
      excalidrawData: {
        ...sampleExcalidrawData,
        elements: [
          ...sampleExcalidrawData.elements.slice(0, 1), // Keep the instruction text
          {
            id: "student-drawing-2",
            type: "freedraw",
            x: 100,
            y: 250,
            width: 200,
            height: 150,
            points: [[0, 0], [50, 20], [100, 10], [150, 30], [200, 0]],
            strokeColor: "#7BA05B",
            strokeWidth: 3,
          }
        ]
      },
      textContent: "I am still working on this...",
    },
  })

  // Create student progress records
  await prisma.studentProgress.upsert({
    where: {
      studentId_classId: {
        studentId: student1.id,
        classId: sampleClass.id,
      },
    },
    update: {},
    create: {
      studentId: student1.id,
      classId: sampleClass.id,
      assignmentId: assignment.id,
      completedAssignments: 1,
      averageScore: 85.0,
      streakDays: 3,
      drawingSkillLevel: 2,
      writingSkillLevel: 3,
      vocabularySkillLevel: 2,
    },
  })

  await prisma.studentProgress.upsert({
    where: {
      studentId_classId: {
        studentId: student2.id,
        classId: sampleClass.id,
      },
    },
    update: {},
    create: {
      studentId: student2.id,
      classId: sampleClass.id,
      assignmentId: assignment.id,
      completedAssignments: 0,
      averageScore: null,
      streakDays: 0,
      drawingSkillLevel: 1,
      writingSkillLevel: 1,
      vocabularySkillLevel: 1,
    },
  })

  console.log('✅ Seed completed successfully!')
  console.log(`
📊 Created:
  👩‍🏫 1 Teacher: ${teacher.email}
  👨‍🎓 2 Students: ${student1.email}, ${student2.email}
  📚 1 Class: ${sampleClass.name} (${sampleClass.code})
  📝 1 Assignment: ${assignment.title}
  📄 2 Submissions (1 submitted, 1 draft)
  📈 2 Progress records

🔐 Login credentials:
  Teacher: teacher@example.com / teacher123
  Student 1: student1@example.com / student123
  Student 2: student2@example.com / student123
  `)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })