// backend/src/controllers/adminClassController.ts
import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Get dashboard stats for class-based system
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const adminId = req.admin?.id

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Admin not authenticated'
      })
    }

    // Get current academic year
    const activeAcademicYear = await prisma.academicYear.findFirst({
      where: { isActive: true }
    })

    if (!activeAcademicYear) {
      return res.status(404).json({
        success: false,
        message: 'No active academic year found'
      })
    }

    // Get stats for the active academic year
    const [classes, teachers, students, subjects] = await Promise.all([
      prisma.class.count({
        where: { academicYearId: activeAcademicYear.id, isActive: true }
      }),
      prisma.teacher.count({
        where: { academicYearId: activeAcademicYear.id, isActive: true }
      }),
      prisma.user.count({
        where: { academicYearId: activeAcademicYear.id }
      }),
      prisma.subject.count({
        where: { 
          class: { academicYearId: activeAcademicYear.id },
          isActive: true 
        }
      })
    ])

    // Get recent classes with details
    const recentClasses = await prisma.class.findMany({
      where: { 
        academicYearId: activeAcademicYear.id,
        isActive: true 
      },
      include: {
        classTeacher: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            students: true,
            subjects: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    res.json({
      success: true,
      data: {
        stats: {
          totalClasses: classes,
          totalTeachers: teachers,
          totalStudents: students,
          totalSubjects: subjects
        },
        recentClasses,
        activeAcademicYear
      }
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Get all classes
export const getAllClasses = async (req: Request, res: Response) => {
  try {
    const { academicYear, grade } = req.query

    const where: any = {
      isActive: true
    }

    if (academicYear) {
      where.academicYear = { name: academicYear as string }
    } else {
      // Default to active academic year
      where.academicYear = { isActive: true }
    }

    if (grade) {
      where.grade = grade as string
    }

    const classes = await prisma.class.findMany({
      where,
      include: {
        academicYear: {
          select: {
            name: true,
            isActive: true
          }
        },
        classTeacher: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        _count: {
          select: {
            students: true,
            subjects: true,
            subjectTeachers: true
          }
        }
      },
      orderBy: [
        { grade: 'asc' },
        { section: 'asc' }
      ]
    })

    res.json({
      success: true,
      data: classes
    })

  } catch (error) {
    console.error('Error fetching classes:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Create new class
export const createClass = async (req: Request, res: Response) => {
  try {
    const { name, grade, section, classTeacherId, maxStudents, academicYearId } = req.body
    const adminId = req.admin?.id

    // Validation
    if (!name || !grade) {
      return res.status(400).json({
        success: false,
        message: 'Name and grade are required'
      })
    }

    // Get active academic year if not provided
    let targetAcademicYearId = academicYearId
    if (!targetAcademicYearId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { isActive: true }
      })
      if (!activeYear) {
        return res.status(400).json({
          success: false,
          message: 'No active academic year found'
        })
      }
      targetAcademicYearId = activeYear.id
    }

    // Check if class teacher is already assigned to another class
    if (classTeacherId) {
      const existingAssignment = await prisma.class.findFirst({
        where: {
          classTeacherId,
          academicYearId: targetAcademicYearId,
          isActive: true,
          id: { not: undefined } // Exclude current class if updating
        }
      })

      if (existingAssignment) {
        return res.status(400).json({
          success: false,
          message: 'This teacher is already assigned as class teacher to another class'
        })
      }
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        grade,
        section,
        academicYearId: targetAcademicYearId,
        classTeacherId,
        maxStudents: maxStudents || 40,
        createdById: adminId
      },
      include: {
        academicYear: {
          select: {
            name: true
          }
        },
        classTeacher: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            students: true,
            subjects: true
          }
        }
      }
    })

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: newClass
    })

} catch (error) {
    console.error('Error creating class:', error)
    
    // Handle Prisma unique constraint errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: { target?: string[] } }
      if (prismaError.code === 'P2002') {
        return res.status(400).json({ 
          error: 'A class with this name already exists in the academic year' 
        })
      }
    }
    
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get class details with students and subjects
export const getClassDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const classDetails = await prisma.class.findUnique({
      where: { id },
      include: {
        academicYear: true,
        classTeacher: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        students: {
          select: {
            id: true,
            name: true,
            email: true,
            rollNumber: true,
            parentPhone: true,
            createdAt: true
          },
          orderBy: { rollNumber: 'asc' }
        },
        subjects: {
          include: {
            subjectTeachers: {
              include: {
                teacher: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            },
            _count: {
              select: {
                questions: true,
                enrollments: true
              }
            }
          }
        },
        _count: {
          select: {
            students: true,
            subjects: true,
            subjectTeachers: true
          }
        }
      }
    })

    if (!classDetails) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      })
    }

    res.json({
      success: true,
      data: classDetails
    })

  } catch (error) {
    console.error('Error fetching class details:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Get available teachers for class assignment
export const getAvailableTeachers = async (req: Request, res: Response) => {
  try {
    const { academicYearId } = req.query

    // Get active academic year if not provided
    let targetAcademicYearId = academicYearId as string
    if (!targetAcademicYearId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { isActive: true }
      })
      if (!activeYear) {
        return res.status(400).json({
          success: false,
          message: 'No active academic year found'
        })
      }
      targetAcademicYearId = activeYear.id
    }

    const teachers = await prisma.teacher.findMany({
      where: {
        academicYearId: targetAcademicYearId,
        isActive: true
      },
      include: {
        primaryClass: {
          select: {
            id: true,
            name: true
          }
        },
        subjectTeaching: {
          include: {
            subject: {
              select: {
                name: true
              }
            },
            class: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    res.json({
      success: true,
      data: teachers
    })

  } catch (error) {
    console.error('Error fetching teachers:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}