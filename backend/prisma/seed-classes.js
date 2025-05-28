// backend/prisma/seed-classes.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🏫 Starting Class-Based School System Seed...')

  try {
    // 1. Create Academic Year
    console.log('📅 Creating Academic Year...')
    const academicYear = await prisma.academicYear.upsert({
      where: { name: '2024-25' },
      update: {},
      create: {
        name: '2024-25',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        isActive: true
      }
    })
    console.log('✅ Academic Year 2024-25 created')

    // 2. Create Admin
    console.log('👨‍💼 Creating Admin...')
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.admin.upsert({
      where: { email: 'admin@edupractice.com' },
      update: {},
      create: {
        email: 'admin@edupractice.com',
        password: adminPassword,
        name: 'School Principal',
        role: 'super_admin',
        schoolName: 'EduPractice High School',
        permissions: ['*']
      }
    })
    console.log('✅ Admin created')

    // 3. Create Teachers
    console.log('👨‍🏫 Creating Teachers...')
    const teacherPassword = await bcrypt.hash('teacher123', 10)
    
    const mathTeacher = await prisma.teacher.upsert({
      where: { email: 'math.teacher@edupractice.com' },
      update: {},
      create: {
        email: 'math.teacher@edupractice.com',
        password: teacherPassword,
        name: 'Ms. Sarah Johnson',
        phone: '+1-555-0101',
        academicYearId: academicYear.id
      }
    })

    const scienceTeacher = await prisma.teacher.upsert({
      where: { email: 'science.teacher@edupractice.com' },
      update: {},
      create: {
        email: 'science.teacher@edupractice.com',
        password: teacherPassword,
        name: 'Mr. David Wilson',
        phone: '+1-555-0102',
        academicYearId: academicYear.id
      }
    })

    const englishTeacher = await prisma.teacher.upsert({
      where: { email: 'english.teacher@edupractice.com' },
      update: {},
      create: {
        email: 'english.teacher@edupractice.com',
        password: teacherPassword,
        name: 'Mrs. Emily Davis',
        phone: '+1-555-0103',
        academicYearId: academicYear.id
      }
    })
    console.log('✅ Teachers created')

    // 4. Create Classes
    console.log('🏛️ Creating Classes...')
    const class10A = await prisma.class.upsert({
      where: { 
        name_academicYearId: { 
          name: 'Grade 10-A', 
          academicYearId: academicYear.id 
        } 
      },
      update: {},
      create: {
        name: 'Grade 10-A',
        grade: '10',
        section: 'A',
        academicYearId: academicYear.id,
        classTeacherId: mathTeacher.id,
        maxStudents: 35,
        createdById: admin.id
      }
    })

    const class10B = await prisma.class.upsert({
      where: { 
        name_academicYearId: { 
          name: 'Grade 10-B', 
          academicYearId: academicYear.id 
        } 
      },
      update: {},
      create: {
        name: 'Grade 10-B',
        grade: '10',
        section: 'B',
        academicYearId: academicYear.id,
        classTeacherId: scienceTeacher.id,
        maxStudents: 35,
        createdById: admin.id
      }
    })

    const class11Science = await prisma.class.upsert({
      where: { 
        name_academicYearId: { 
          name: 'Grade 11-Science', 
          academicYearId: academicYear.id 
        } 
      },
      update: {},
      create: {
        name: 'Grade 11-Science',
        grade: '11',
        section: 'Science',
        academicYearId: academicYear.id,
        classTeacherId: englishTeacher.id,
        maxStudents: 30,
        createdById: admin.id
      }
    })
    console.log('✅ Classes created')

    // 5. Create Students
    console.log('👨‍🎓 Creating Students...')
    const studentPassword = await bcrypt.hash('student123', 10)

    // Students for Grade 10-A
    const students10A = [
      { name: 'Alice Johnson', email: 'alice@student.com', rollNumber: '10A001' },
      { name: 'Bob Smith', email: 'bob@student.com', rollNumber: '10A002' },
      { name: 'Charlie Brown', email: 'charlie@student.com', rollNumber: '10A003' }
    ]

    for (const studentData of students10A) {
      await prisma.user.upsert({
        where: { email: studentData.email },
        update: {},
        create: {
          email: studentData.email,
          password: studentPassword,
          name: studentData.name,
          rollNumber: studentData.rollNumber,
          classId: class10A.id,
          academicYearId: academicYear.id,
          parentPhone: '+1-555-0200'
        }
      })
    }

    // Students for Grade 10-B
    const students10B = [
      { name: 'Diana Prince', email: 'diana@student.com', rollNumber: '10B001' },
      { name: 'Ethan Hunt', email: 'ethan@student.com', rollNumber: '10B002' }
    ]

    for (const studentData of students10B) {
      await prisma.user.upsert({
        where: { email: studentData.email },
        update: {},
        create: {
          email: studentData.email,
          password: studentPassword,
          name: studentData.name,
          rollNumber: studentData.rollNumber,
          classId: class10B.id,
          academicYearId: academicYear.id,
          parentPhone: '+1-555-0300'
        }
      })
    }

    // Students for Grade 11-Science
    const students11Science = [
      { name: 'Frank Miller', email: 'frank@student.com', rollNumber: '11S001' },
      { name: 'Grace Lee', email: 'grace@student.com', rollNumber: '11S002' }
    ]

    for (const studentData of students11Science) {
      await prisma.user.upsert({
        where: { email: studentData.email },
        update: {},
        create: {
          email: studentData.email,
          password: studentPassword,
          name: studentData.name,
          rollNumber: studentData.rollNumber,
          classId: class11Science.id,
          academicYearId: academicYear.id,
          parentPhone: '+1-555-0400'
        }
      })
    }
    console.log('✅ Students created')

    // 6. Create Subjects for each class
    console.log('📚 Creating Subjects...')

    // Subjects for Grade 10-A
    const mathSubject10A = await prisma.subject.upsert({
      where: { 
        name_classId: { 
          name: 'Mathematics', 
          classId: class10A.id 
        } 
      },
      update: {},
      create: {
        name: 'Mathematics',
        code: 'MATH10',
        classId: class10A.id,
        icon: '📐',
        color: 'from-blue-500 to-blue-600',
        description: 'Algebra, Geometry, and Basic Calculus',
        isCompulsory: true,
        createdById: admin.id
      }
    })

    const scienceSubject10A = await prisma.subject.upsert({
      where: { 
        name_classId: { 
          name: 'Science', 
          classId: class10A.id 
        } 
      },
      update: {},
      create: {
        name: 'Science',
        code: 'SCI10',
        classId: class10A.id,
        icon: '🔬',
        color: 'from-green-500 to-green-600',
        description: 'Physics, Chemistry, and Biology basics',
        isCompulsory: true,
        createdById: admin.id
      }
    })

    // Subjects for Grade 11-Science (more advanced)
    const advMath11 = await prisma.subject.upsert({
      where: { 
        name_classId: { 
          name: 'Advanced Mathematics', 
          classId: class11Science.id 
        } 
      },
      update: {},
      create: {
        name: 'Advanced Mathematics',
        code: 'AMATH11',
        classId: class11Science.id,
        icon: '📊',
        color: 'from-purple-500 to-purple-600',
        description: 'Calculus, Statistics, and Advanced Algebra',
        isCompulsory: true,
        createdById: admin.id
      }
    })

    const physics11 = await prisma.subject.upsert({
      where: { 
        name_classId: { 
          name: 'Physics', 
          classId: class11Science.id 
        } 
      },
      update: {},
      create: {
        name: 'Physics',
        code: 'PHY11',
        classId: class11Science.id,
        icon: '⚛️',
        color: 'from-red-500 to-red-600',
        description: 'Mechanics, Thermodynamics, and Waves',
        isCompulsory: true,
        createdById: admin.id
      }
    })
    console.log('✅ Subjects created')

    // 7. Assign Teachers to Subjects
    console.log('👨‍🏫 Assigning Teachers to Subjects...')
    
    // Math teacher teaches math in Grade 10-A
    await prisma.subjectTeacher.upsert({
      where: {
        teacherId_subjectId_classId: {
          teacherId: mathTeacher.id,
          subjectId: mathSubject10A.id,
          classId: class10A.id
        }
      },
      update: {},
      create: {
        teacherId: mathTeacher.id,
        subjectId: mathSubject10A.id,
        classId: class10A.id
      }
    })

    // Science teacher teaches science in Grade 10-A and physics in Grade 11
    await prisma.subjectTeacher.upsert({
      where: {
        teacherId_subjectId_classId: {
          teacherId: scienceTeacher.id,
          subjectId: scienceSubject10A.id,
          classId: class10A.id
        }
      },
      update: {},
      create: {
        teacherId: scienceTeacher.id,
        subjectId: scienceSubject10A.id,
        classId: class10A.id
      }
    })

    await prisma.subjectTeacher.upsert({
      where: {
        teacherId_subjectId_classId: {
          teacherId: scienceTeacher.id,
          subjectId: physics11.id,
          classId: class11Science.id
        }
      },
      update: {},
      create: {
        teacherId: scienceTeacher.id,
        subjectId: physics11.id,
        classId: class11Science.id
      }
    })
    console.log('✅ Teachers assigned to subjects')

    // 8. Auto-enroll all students in compulsory subjects
    console.log('📝 Auto-enrolling students in compulsory subjects...')
    
    // Get all students and their class subjects
    const allStudents = await prisma.user.findMany({
      include: {
        class: {
          include: {
            subjects: {
              where: { isCompulsory: true }
            }
          }
        }
      }
    })

    for (const student of allStudents) {
      for (const subject of student.class.subjects) {
        await prisma.subjectEnrollment.upsert({
          where: {
            userId_subjectId: {
              userId: student.id,
              subjectId: subject.id
            }
          },
          update: {},
          create: {
            userId: student.id,
            subjectId: subject.id
          }
        })
      }
    }
    console.log('✅ Students auto-enrolled in compulsory subjects')

    console.log('\n🎉 Class-Based School System Seed Complete!')
    console.log('\n📊 Summary:')
    console.log('📅 Academic Year: 2024-25')
    console.log('🏛️ Classes: Grade 10-A, Grade 10-B, Grade 11-Science')
    console.log('👨‍🏫 Teachers: 3 (Math, Science, English)')
    console.log('👨‍🎓 Students: 7 total across all classes')
    console.log('📚 Subjects: Assigned per class with teacher mapping')
    
    console.log('\n👤 Demo Accounts:')
    console.log('🏫 Admin: admin@edupractice.com / admin123')
    console.log('👨‍🏫 Math Teacher: math.teacher@edupractice.com / teacher123 (Class Teacher of 10-A)')
    console.log('👨‍🏫 Science Teacher: science.teacher@edupractice.com / teacher123 (Class Teacher of 10-B)')
    console.log('👨‍🏫 English Teacher: english.teacher@edupractice.com / teacher123 (Class Teacher of 11-Science)')
    console.log('👨‍🎓 Student: alice@student.com / student123 (Grade 10-A)')
    console.log('👨‍🎓 Student: diana@student.com / student123 (Grade 10-B)')
    console.log('👨‍🎓 Student: frank@student.com / student123 (Grade 11-Science)')

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })