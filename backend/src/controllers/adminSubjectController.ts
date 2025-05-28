import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schemas
const createSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  grade: z.string().min(1, 'Grade is required'),
  board: z.string().min(1, 'Board is required'),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().min(1, 'Color is required'),
  description: z.string().min(1, 'Description is required')
})

const updateSubjectSchema = createSubjectSchema.partial()

const enrollStudentsSchema = z.object({
  subjectId: z.string().min(1, 'Subject ID is required'),
  userIds: z.array(z.string()).min(1, 'At least one user ID is required')
})

// Get all subjects (admin view)
export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const { grade, board, active } = req.query

    const where: any = {}
    
    if (grade) where.grade = grade as string
    if (board) where.board = board as string
    if (active !== undefined) where.isActive = active === 'true'

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            units: true,
            questions: true,
            enrollments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({
      success: true,
      data: subjects
    })

  } catch (error) {
    console.error('Error fetching subjects:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Create new subject
export const createSubject = async (req: Request, res: Response) => {
  try {
    const { success, data, error } = createSubjectSchema.safeParse(req.body)
    
    if (!success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      })
    }

    const adminId = req.admin?.id

    const subject = await prisma.subject.create({
      data: {
        ...data,
        createdById: adminId
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject
    })

  } catch (error) {
    console.error('Error creating subject:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Update subject
export const updateSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { success, data, error } = updateSubjectSchema.safeParse(req.body)
    
    if (!success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      })
    }

    const subject = await prisma.subject.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            units: true,
            questions: true,
            enrollments: true
          }
        }
      }
    })

    res.json({
      success: true,
      message: 'Subject updated successfully',
      data: subject
    })

  } catch (error) {
    console.error('Error updating subject:', error)
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Delete subject
export const deleteSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Check if subject exists and has enrollments
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            enrollments: true,
            userProgress: true
          }
        }
      }
    })

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      })
    }

    // If subject has enrollments, deactivate instead of delete
    if (subject._count.enrollments > 0 || subject._count.userProgress > 0) {
      const updatedSubject = await prisma.subject.update({
        where: { id },
        data: { isActive: false }
      })

      return res.json({
        success: true,
        message: 'Subject deactivated (has enrolled students)',
        data: updatedSubject
      })
    }

    // Safe to delete if no enrollments
    await prisma.subject.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: 'Subject deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting subject:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Get students available for enrollment
export const getAvailableStudents = async (req: Request, res: Response) => {
  try {
    const { grade, board } = req.query

    const where: any = {}
    if (grade) where.grade = grade as string
    if (board) where.board = board as string

    const students = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        grade: true,
        board: true,
        createdAt: true,
        enrollments: {
          select: {
            subjectId: true,
            subject: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    res.json({
      success: true,
      data: students
    })

  } catch (error) {
    console.error('Error fetching students:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Enroll students in subject
export const enrollStudents = async (req: Request, res: Response) => {
  try {
    const { success, data, error } = enrollStudentsSchema.safeParse(req.body)
    
    if (!success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      })
    }

    const { subjectId, userIds } = data

    // Verify subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId }
    })

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      })
    }

    // Create enrollments (ignore duplicates)
    const enrollments = await Promise.allSettled(
      userIds.map(userId =>
        prisma.subjectEnrollment.create({
          data: {
            userId,
            subjectId
          }
        })
      )
    )

    const successful = enrollments.filter(result => result.status === 'fulfilled').length
    const failed = enrollments.length - successful

    res.json({
      success: true,
      message: `Enrolled ${successful} students successfully${failed > 0 ? ` (${failed} already enrolled)` : ''}`,
      data: {
        successful,
        failed,
        total: enrollments.length
      }
    })

  } catch (error) {
    console.error('Error enrolling students:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Get subject enrollments
export const getSubjectEnrollments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const enrollments = await prisma.subjectEnrollment.findMany({
      where: {
        subjectId: id,
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            grade: true,
            board: true
          }
        }
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    })

    res.json({
      success: true,
      data: enrollments
    })

  } catch (error) {
    console.error('Error fetching enrollments:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}