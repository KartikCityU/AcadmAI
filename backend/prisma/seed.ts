import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin users first
  const adminPassword = await bcrypt.hash('admin123', 10)

  const superAdmin = await prisma.admin.upsert({
    where: { email: 'admin@edupractice.com' },
    update: {},
    create: {
      email: 'admin@edupractice.com',
      password: adminPassword,
      name: 'Super Administrator',
      role: 'super_admin',
      schoolName: 'EduPractice Academy',
      permissions: ['*']
    }
  })

  const schoolAdmin = await prisma.admin.upsert({
    where: { email: 'teacher@edupractice.com' },
    update: {},
    create: {
      email: 'teacher@edupractice.com',
      password: adminPassword,
      name: 'School Teacher',
      role: 'teacher',
      schoolName: 'EduPractice Academy',
      permissions: ['manage_questions', 'view_analytics']
    }
  })

  console.log('✅ Created admin users')

  // Create demo student
  const studentPassword = await bcrypt.hash('demo123', 10)
  const demoStudent = await prisma.user.upsert({
    where: { email: 'demo@edupractice.com' },
    update: {},
    create: {
      email: 'demo@edupractice.com',
      password: studentPassword,
      name: 'Demo Student',
      grade: 'Grade 11',
      board: 'CBSE'
    }
  })

  console.log('✅ Created demo student')

  // Create subjects for CBSE Grade 11
  const mathSubject = await prisma.subject.upsert({
    where: { 
      name_grade_board: { 
        name: 'Mathematics', 
        grade: 'Grade 11', 
        board: 'CBSE' 
      } 
    },
    update: {},
    create: {
      name: 'Mathematics',
      grade: 'Grade 11',
      board: 'CBSE',
      icon: '📐',
      color: 'from-blue-500 to-blue-600',
      description: 'Master mathematical concepts with comprehensive practice',
      createdById: superAdmin.id
    }
  })

  const physicsSubject = await prisma.subject.upsert({
    where: { 
      name_grade_board: { 
        name: 'Physics', 
        grade: 'Grade 11', 
        board: 'CBSE' 
      } 
    },
    update: {},
    create: {
      name: 'Physics',
      grade: 'Grade 11',
      board: 'CBSE',
      icon: '⚛️',
      color: 'from-purple-500 to-purple-600',
      description: 'Explore the fundamental laws of nature through practice',
      createdById: superAdmin.id
    }
  })

  const chemistrySubject = await prisma.subject.upsert({
    where: { 
      name_grade_board: { 
        name: 'Chemistry', 
        grade: 'Grade 11', 
        board: 'CBSE' 
      } 
    },
    update: {},
    create: {
      name: 'Chemistry',
      grade: 'Grade 11',
      board: 'CBSE',
      icon: '🧪',
      color: 'from-green-500 to-green-600',
      description: 'Master chemical principles and reactions',
      createdById: superAdmin.id
    }
  })

  console.log('✅ Created subjects')

  // Create units for Mathematics
  const algebraUnit = await prisma.unit.upsert({
    where: { id: 'math-algebra-unit' },
    update: {},
    create: {
      id: 'math-algebra-unit',
      name: 'Algebra',
      order: 1,
      subjectId: mathSubject.id
    }
  })

  const calculusUnit = await prisma.unit.upsert({
    where: { id: 'math-calculus-unit' },
    update: {},
    create: {
      id: 'math-calculus-unit',
      name: 'Calculus',
      order: 2,
      subjectId: mathSubject.id
    }
  })

  // Create units for Physics
  const mechanicsUnit = await prisma.unit.upsert({
    where: { id: 'physics-mechanics-unit' },
    update: {},
    create: {
      id: 'physics-mechanics-unit',
      name: 'Mechanics',
      order: 1,
      subjectId: physicsSubject.id
    }
  })

  console.log('✅ Created units')

  // Create sample questions for Mathematics
  const algebraQuestions = [
    {
      id: 'question-derivative-basic',
      text: "What is the derivative of f(x) = 3x² + 2x - 1?",
      type: 'mcq',
      options: ["6x + 2", "6x - 2", "3x + 2", "6x² + 2x"],
      correctAnswer: "6x + 2",
      explanation: "Using the power rule: d/dx(3x²) = 6x, d/dx(2x) = 2, d/dx(-1) = 0. Therefore, f'(x) = 6x + 2.",
      difficulty: 'medium',
      topic: 'Derivatives',
      subjectId: mathSubject.id,
      unitId: calculusUnit.id,
      createdById: schoolAdmin.id
    },
    {
      id: 'question-linear-equation',
      text: "Solve for x: 2x + 5 = 13",
      type: 'mcq',
      options: ["x = 4", "x = 3", "x = 5", "x = 6"],
      correctAnswer: "x = 4",
      explanation: "Subtract 5 from both sides: 2x = 8. Then divide by 2: x = 4.",
      difficulty: 'easy',
      topic: 'Linear Equations',
      subjectId: mathSubject.id,
      unitId: algebraUnit.id,
      createdById: schoolAdmin.id
    },
    {
      id: 'question-factoring',
      text: "Factor the expression: x² - 9",
      type: 'mcq',
      options: ["(x + 3)(x - 3)", "(x - 3)²", "(x + 3)²", "x(x - 9)"],
      correctAnswer: "(x + 3)(x - 3)",
      explanation: "This is a difference of squares: a² - b² = (a + b)(a - b). So x² - 9 = x² - 3² = (x + 3)(x - 3).",
      difficulty: 'medium',
      topic: 'Factoring',
      subjectId: mathSubject.id,
      unitId: algebraUnit.id,
      createdById: schoolAdmin.id
    },
    {
      id: 'question-trigonometry',
      text: "What is the value of sin(90°)?",
      type: 'true_false',
      options: null,
      correctAnswer: true, // True that sin(90°) = 1
      explanation: "sin(90°) = 1. This is a fundamental trigonometric value.",
      difficulty: 'easy',
      topic: 'Trigonometry',
      subjectId: mathSubject.id,
      unitId: algebraUnit.id,
      createdById: schoolAdmin.id
    },
    {
      id: 'question-circle-area',
      text: "What is the area of a circle with radius 5 units?",
      type: 'mcq',
      options: ["25π", "10π", "5π", "15π"],
      correctAnswer: "25π",
      explanation: "The area of a circle is πr². With r = 5, the area is π × 5² = 25π square units.",
      difficulty: 'easy',
      topic: 'Geometry',
      subjectId: mathSubject.id,
      unitId: algebraUnit.id,
      createdById: schoolAdmin.id
    }
  ]

  // Create sample questions for Physics
  const physicsQuestions = [
    {
      id: 'question-newtons-law',
      text: "What is Newton's second law of motion?",
      type: 'mcq',
      options: ["F = ma", "F = mv", "F = mv²", "F = m/a"],
      correctAnswer: "F = ma",
      explanation: "Newton's second law states that the force acting on an object is equal to its mass times its acceleration (F = ma).",
      difficulty: 'easy',
      topic: 'Laws of Motion',
      subjectId: physicsSubject.id,
      unitId: mechanicsUnit.id,
      createdById: schoolAdmin.id
    },
    {
      id: 'question-acceleration',
      text: "If a car accelerates from 0 to 60 m/s in 10 seconds, what is its acceleration?",
      type: 'mcq',
      options: ["6 m/s²", "60 m/s²", "600 m/s²", "0.6 m/s²"],
      correctAnswer: "6 m/s²",
      explanation: "Acceleration = (final velocity - initial velocity) / time = (60 - 0) / 10 = 6 m/s²",
      difficulty: 'medium',
      topic: 'Kinematics',
      subjectId: physicsSubject.id,
      unitId: mechanicsUnit.id,
      createdById: schoolAdmin.id
    }
  ]

  // Insert questions
  for (const question of algebraQuestions) {
    await prisma.question.upsert({
      where: { id: question.id },
      update: {},
      create: question
    })
  }

  for (const question of physicsQuestions) {
    await prisma.question.upsert({
      where: { id: question.id },
      update: {},
      create: question
    })
  }

  console.log('✅ Created questions')

  // Enroll demo student in subjects
  await prisma.subjectEnrollment.upsert({
    where: {
      userId_subjectId: {
        userId: demoStudent.id,
        subjectId: mathSubject.id
      }
    },
    update: {},
    create: {
      userId: demoStudent.id,
      subjectId: mathSubject.id
    }
  })

  await prisma.subjectEnrollment.upsert({
    where: {
      userId_subjectId: {
        userId: demoStudent.id,
        subjectId: physicsSubject.id
      }
    },
    update: {},
    create: {
      userId: demoStudent.id,
      subjectId: physicsSubject.id
    }
  })

  console.log('✅ Created subject enrollments')

  // Create user progress for demo student
  await prisma.userProgress.upsert({
    where: {
      userId_subjectId: {
        userId: demoStudent.id,
        subjectId: mathSubject.id
      }
    },
    update: {},
    create: {
      userId: demoStudent.id,
      subjectId: mathSubject.id,
      progress: 75.5,
      totalQuestions: 20,
      completedQuestions: 15,
      correctAnswers: 12
    }
  })

  await prisma.userProgress.upsert({
    where: {
      userId_subjectId: {
        userId: demoStudent.id,
        subjectId: physicsSubject.id
      }
    },
    update: {},
    create: {
      userId: demoStudent.id,
      subjectId: physicsSubject.id,
      progress: 60.0,
      totalQuestions: 15,
      completedQuestions: 9,
      correctAnswers: 7
    }
  })

  console.log('✅ Created user progress')

  console.log('🎉 Database seeded successfully!')
  console.log('📚 Created subjects: Mathematics, Physics, Chemistry')
  console.log('📖 Created units and sample questions')
  console.log(`📊 Total questions created: ${algebraQuestions.length + physicsQuestions.length}`)
  console.log('\n👤 Demo Accounts Created:')
  console.log('🎓 Student: demo@edupractice.com / demo123')
  console.log('👨‍💼 Admin: admin@edupractice.com / admin123')
  console.log('👨‍🏫 Teacher: teacher@edupractice.com / admin123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })