import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Get all subjects for user's grade and board
export const getSubjects = async (req: Request, res: Response) => {
  try {
    const { grade, board } = req.query

    if (!grade || !board) {
      return res.status(400).json({
        success: false,
        message: 'Grade and board are required'
      })
    }

    const subjects = await prisma.subject.findMany({
      where: {
        grade: grade as string,
        board: board as string
      },
      include: {
        userProgress: {
          where: {
            userId: req.user?.id // From auth middleware
          }
        },
        _count: {
          select: {
            questions: true
          }
        }
      }
    })

    const subjectsWithProgress = subjects.map(subject => {
      const userProgress = subject.userProgress[0] // Get user's progress for this subject
      const totalQuestions = subject._count.questions

      return {
        id: subject.id,
        name: subject.name,
        icon: subject.icon,
        color: subject.color,
        description: subject.description,
        grade: subject.grade,
        board: subject.board,
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

// Get specific subject with units
export const getSubjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        units: {
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
        _count: {
          select: {
            questions: true
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

    const userProgress = subject.userProgress[0]
    const totalQuestions = subject._count.questions

    const subjectWithProgress = {
      id: subject.id,
      name: subject.name,
      icon: subject.icon,
      color: subject.color,
      description: subject.description,
      grade: subject.grade,
      board: subject.board,
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