// backend/src/controllers/questionController.ts - Updated for Class-Based System
import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import Joi from 'joi'

const prisma = new PrismaClient()

// Get questions by subject and unit
export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { subjectId, unitId, limit = 10 } = req.query
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    // Get user's class to verify access
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { class: true }
    })

    if (!user || !user.classId) {
      return res.status(400).json({ error: 'User not assigned to any class' })
    }

    // Verify subject belongs to user's class
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId as string,
        classId: user.classId
      }
    })

    if (!subject) {
      return res.status(403).json({ error: 'Subject not available for your class' })
    }

    const questions = await prisma.question.findMany({
      where: {
        subjectId: subjectId as string,
        ...(unitId && { unitId: unitId as string }),
        isActive: true
      },
      take: parseInt(limit as string),
      orderBy: { createdAt: 'asc' },
      include: {
        unit: {
          select: {
            id: true,
            name: true,
            order: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    })

    res.json({ questions })
  } catch (error) {
    console.error('Error fetching questions:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get question by ID
export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    // Get user's class
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { classId: true }
    })

    if (!user || !user.classId) {
      return res.status(400).json({ error: 'User not assigned to any class' })
    }

    const question = await prisma.question.findFirst({
      where: {
        id,
        isActive: true,
        subject: {
          classId: user.classId
        }
      },
      include: {
        unit: {
          select: {
            id: true,
            name: true,
            order: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    })

    if (!question) {
      return res.status(404).json({ error: 'Question not found or not accessible' })
    }

    res.json({ question })
  } catch (error) {
    console.error('Error fetching question:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Submit test answers
export const submitTest = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    // Validation schema
    const submitTestSchema = Joi.object({
      subjectId: Joi.string().required(),
      unitId: Joi.string().optional(),
      testType: Joi.string().valid('practice', 'quiz', 'exam').required(),
      answers: Joi.array().items(
        Joi.object({
          questionId: Joi.string().required(),
          userAnswer: Joi.alternatives().try(Joi.string(), Joi.number()).required()
        })
      ).required(),
      timeSpent: Joi.number().min(0).required()
    })

    const { error, value } = submitTestSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { subjectId, unitId, testType, answers, timeSpent } = value

    // Get user's class
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { class: true }
    })

    if (!user || !user.classId) {
      return res.status(400).json({ error: 'User not assigned to any class' })
    }

    // Verify subject belongs to user's class
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        classId: user.classId
      }
    })

    if (!subject) {
      return res.status(403).json({ error: 'Subject not available for your class' })
    }

    // Get questions with correct answers
    const questionIds = answers.map((answer: any) => answer.questionId)
    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
        subjectId: subjectId,
        isActive: true
      }
    })

    if (questions.length !== answers.length) {
      return res.status(400).json({ error: 'Some questions not found' })
    }

    // Calculate score
    let correctAnswers = 0
    const detailedAnswers = answers.map((answer: any) => {
      const question = questions.find(q => q.id === answer.questionId)
      const isCorrect = question && question.correctAnswer === answer.userAnswer
      if (isCorrect) correctAnswers++

      return {
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        isCorrect,
        correctAnswer: question?.correctAnswer
      }
    })

    const score = Math.round((correctAnswers / answers.length) * 100)

    // Save test result with classId
    const testResult = await prisma.testResult.create({
      data: {
        userId,
        classId: user.classId, // Add classId here
        testType,
        subjectId,
        unitId,
        score,
        totalQuestions: answers.length,
        correctAnswers,
        timeSpent,
        answers: detailedAnswers
      }
    })

    // Update or create user progress with classId
    const existingProgress = await prisma.userProgress.findFirst({
      where: {
        userId,
        subjectId,
        classId: user.classId
      }
    })

    if (existingProgress) {
      await prisma.userProgress.update({
        where: { id: existingProgress.id },
        data: {
          totalQuestions: existingProgress.totalQuestions + answers.length,
          completedQuestions: existingProgress.completedQuestions + answers.length,
          correctAnswers: existingProgress.correctAnswers + correctAnswers,
          progress: Math.min(100, ((existingProgress.completedQuestions + answers.length) / (existingProgress.totalQuestions + answers.length)) * 100),
          lastStudied: new Date()
        }
      })
    } else {
      await prisma.userProgress.create({
        data: {
          userId,
          classId: user.classId, // Add classId here
          subjectId,
          progress: (correctAnswers / answers.length) * 100,
          totalQuestions: answers.length,
          completedQuestions: answers.length,
          correctAnswers,
          lastStudied: new Date()
        }
      })
    }

    res.json({
      testResult: {
        id: testResult.id,
        score,
        correctAnswers,
        totalQuestions: answers.length,
        timeSpent,
        answers: detailedAnswers
      }
    })
  } catch (error) {
    console.error('Error submitting test:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get user's test history
export const getTestHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const { subjectId, limit = 10 } = req.query

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    // Get user's class
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { classId: true }
    })

    if (!user || !user.classId) {
      return res.status(400).json({ error: 'User not assigned to any class' })
    }

    const testResults = await prisma.testResult.findMany({
      where: {
        userId,
        classId: user.classId,
        ...(subjectId && { subjectId: subjectId as string })
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        unit: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    res.json({ testResults })
  } catch (error) {
    console.error('Error fetching test history:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get user progress
export const getUserProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const { subjectId } = req.query

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    // Get user's class
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { classId: true }
    })

    if (!user || !user.classId) {
      return res.status(400).json({ error: 'User not assigned to any class' })
    }

    const whereClause = {
      userId,
      classId: user.classId,
      ...(subjectId && { subjectId: subjectId as string })
    }

    const progress = await prisma.userProgress.findMany({
      where: whereClause,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            icon: true,
            color: true
          }
        }
      },
      orderBy: { lastStudied: 'desc' }
    })

    res.json({ progress })
  } catch (error) {
    console.error('Error fetching user progress:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}