// backend/src/controllers/subjectController.ts - Updated for Class-Based System
import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Get all subjects for user's class
export const getSubjects = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const userClassId = req.user?.class?.id

    if (!userId || !userClassId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated or class not assigned'
      })
    }

    // Get subjects for the user's class
    const subjects = await prisma.subject.findMany({
      where: {
        classId: userClassId,
        isActive: true
      },
      include: {
        class: {
          select: {
            name: true,
            grade: true,
            section: true,
            academicYear: {
              select: {
                name: true
              }
            }
          }
        },
        userProgress: {
          where: {
            userId: userId
          }
        },
        enrollments: {
          where: {
            userId: userId,
            isActive: true
          }
        },
        _count: {
          select: {
            questions: true,
            enrollments: true
          }
        }
      }
    })

    const subjectsWithProgress = subjects.map(subject => {
      const userProgress = subject.userProgress[0] // Get user's progress for this subject
      const totalQuestions = subject._count.questions
      const isEnrolled = subject.enrollments.length > 0

      return {
        id: subject.id,
        name: subject.name,
        code: subject.code,
        icon: subject.icon,
        color: subject.color,
        description: subject.description,
        isCompulsory: subject.isCompulsory,
        isEnrolled: isEnrolled,
        // Class information instead of grade/board
        class: {
          name: subject.class.name,
          grade: subject.class.grade,
          section: subject.class.section,
          academicYear: subject.class.academicYear.name
        },
        progress: userProgress?.progress || 0,
        totalQuestions,
        completedQuestions: userProgress?.completedQuestions || 0,
        correctAnswers: userProgress?.correctAnswers || 0,
        lastStudied: userProgress?.lastStudied || null,
        createdAt: subject.createdAt,
        updatedAt: subject.updatedAt
      }
    })

    res.json({
      success: true,
      data: subjectsWithProgress
    })

  } catch (error) {
    console.error('Error fetching subjects:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Get specific subject with units (for user's class)
export const getSubjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id
    const userClassId = req.user?.class?.id

    if (!userId || !userClassId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated or class not assigned'
      })
    }

    const subject = await prisma.subject.findFirst({
      where: { 
        id,
        classId: userClassId, // Ensure subject belongs to user's class
        isActive: true
      },
      include: {
        class: {
          select: {
            name: true,
            grade: true,
            section: true,
            academicYear: {
              select: {
                name: true
              }
            }
          }
        },
        units: {
          where: {
            isActive: true
          },
          orderBy: {
            order: 'asc'
          },
          include: {
            _count: {
              select: {
                questions: true
              }
            }
          }
        },
        userProgress: {
          where: {
            userId
          }
        },
        enrollments: {
          where: {
            userId: userId,
            isActive: true
          }
        },
        _count: {
          select: {
            questions: true,
            enrollments: true
          }
        }
      }
    })

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found or not accessible'
      })
    }

    // Check if user is enrolled in this subject
    const isEnrolled = subject.enrollments.length > 0
    if (!isEnrolled && !subject.isCompulsory) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this subject'
      })
    }

    const userProgress = subject.userProgress[0]
    const totalQuestions = subject._count.questions

    const subjectWithProgress = {
      id: subject.id,
      name: subject.name,
      code: subject.code,
      icon: subject.icon,
      color: subject.color,
      description: subject.description,
      isCompulsory: subject.isCompulsory,
      isEnrolled: isEnrolled,
      class: {
        name: subject.class.name,
        grade: subject.class.grade,
        section: subject.class.section,
        academicYear: subject.class.academicYear.name
      },
      progress: userProgress?.progress || 0,
      totalQuestions,
      completedQuestions: userProgress?.completedQuestions || 0,
      correctAnswers: userProgress?.correctAnswers || 0,
      lastStudied: userProgress?.lastStudied || null,
      units: subject.units.map((unit: any) => ({
        id: unit.id,
        name: unit.name,
        order: unit.order,
        totalQuestions: unit._count.questions,
        createdAt: unit.createdAt,
        updatedAt: unit.updatedAt
      })),
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt
    }

    res.json({
      success: true,
      data: subjectWithProgress
    })

  } catch (error) {
    console.error('Error fetching subject:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Get subjects available for enrollment (optional subjects in user's class)
export const getAvailableSubjects = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const userClassId = req.user?.class?.id

    if (!userId || !userClassId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated or class not assigned'
      })
    }

    // Get all subjects for user's class that are optional (not compulsory)
    const subjects = await prisma.subject.findMany({
      where: {
        classId: userClassId,
        isActive: true,
        isCompulsory: false // Only optional subjects
      },
      include: {
        class: {
          select: {
            name: true,
            grade: true,
            section: true
          }
        },
        enrollments: {
          where: {
            userId: userId,
            isActive: true
          }
        },
        _count: {
          select: {
            questions: true,
            enrollments: true
          }
        }
      }
    })

    const availableSubjects = subjects.map(subject => ({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      icon: subject.icon,
      color: subject.color,
      description: subject.description,
      totalQuestions: subject._count.questions,
      totalEnrollments: subject._count.enrollments,
      isEnrolled: subject.enrollments.length > 0,
      class: subject.class
    }))

    res.json({
      success: true,
      data: availableSubjects
    })

  } catch (error) {
    console.error('Error fetching available subjects:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Enroll in optional subject
export const enrollInSubject = async (req: Request, res: Response) => {
  try {
    const { subjectId } = req.body
    const userId = req.user?.id
    const userClassId = req.user?.class?.id

    if (!userId || !userClassId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated or class not assigned'
      })
    }

    if (!subjectId) {
      return res.status(400).json({
        success: false,
        message: 'Subject ID is required'
      })
    }

    // Verify subject exists and belongs to user's class
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        classId: userClassId,
        isActive: true,
        isCompulsory: false // Can only enroll in optional subjects
      }
    })

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found or not available for enrollment'
      })
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.subjectEnrollment.findUnique({
      where: {
        userId_subjectId: {
          userId,
          subjectId
        }
      }
    })

    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: 'Already enrolled in this subject'
      })
    }

    // Create enrollment
    const enrollment = await prisma.subjectEnrollment.create({
      data: {
        userId,
        subjectId
      }
    })

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in subject',
      data: enrollment
    })

  } catch (error) {
    console.error('Error enrolling in subject:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}