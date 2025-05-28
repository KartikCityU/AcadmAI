import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Get questions for a specific unit
export const getQuestionsByUnit = async (req: Request, res: Response) => {
  try {
    const { unitId } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    if (!unitId) {
      return res.status(400).json({
        success: false,
        message: 'Unit ID is required'
      })
    }

    const questions = await prisma.question.findMany({
      where: {
        unitId: unitId
      },
      include: {
        unit: {
          select: {
            name: true,
            subject: {
              select: {
                name: true,
                icon: true,
                color: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    if (!questions.length) {
      return res.status(404).json({
        success: false,
        message: 'No questions found for this unit'
      })
    }

    // Format questions for frontend
    const formattedQuestions = questions.map(question => ({
      id: question.id,
      text: question.text,
      type: question.type,
      // Since options is already a JSON field in Prisma, no need to parse
      options: question.options || null,
      explanation: question.explanation,
      difficulty: question.difficulty,
      topic: question.topic,
      unit: question.unit,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt
      // Note: We don't send correctAnswer to frontend for security
    }))

    res.json({
      success: true,
      data: formattedQuestions
    })

  } catch (error) {
    console.error('Error fetching questions:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Submit answers and get results
export const submitAnswers = async (req: Request, res: Response) => {
  try {
    const { answers, unitId, testType = 'practice', timeSpent = 0 } = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Answers array is required'
      })
    }

    // Get questions with correct answers
    const questionIds = answers.map(answer => answer.questionId)
    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds }
      },
      select: {
        id: true,
        correctAnswer: true,
        subjectId: true,
        unitId: true
      }
    })

    // Calculate score
    let correctAnswers = 0
    const results = answers.map(userAnswer => {
      const question = questions.find(q => q.id === userAnswer.questionId)
      let isCorrect = false

      if (question) {
        // Handle different answer types
        if (typeof question.correctAnswer === 'string') {
          isCorrect = userAnswer.answer === question.correctAnswer
        } else if (typeof question.correctAnswer === 'boolean') {
          isCorrect = userAnswer.answer === question.correctAnswer
        } else if (Array.isArray(question.correctAnswer)) {
          // For multiple answer questions
          isCorrect = JSON.stringify(userAnswer.answer) === JSON.stringify(question.correctAnswer)
        }
      }

      if (isCorrect) correctAnswers++

      return {
        questionId: userAnswer.questionId,
        userAnswer: userAnswer.answer,
        isCorrect,
        correctAnswer: question?.correctAnswer
      }
    })

    const totalQuestions = answers.length
    const score = (correctAnswers / totalQuestions) * 100

    // Get subject info for the first question (assuming all questions are from same subject)
    const firstQuestion = questions[0]
    const subjectId = firstQuestion?.subjectId

    // Save test result
    const testResult = await prisma.testResult.create({
      data: {
        userId,
        testType,
        subjectId: subjectId!,
        unitId: unitId || firstQuestion?.unitId,
        score,
        totalQuestions,
        correctAnswers,
        timeSpent,
        answers: results
      }
    })

    // Update user progress
    if (subjectId) {
      const existingProgress = await prisma.userProgress.findUnique({
        where: {
          userId_subjectId: {
            userId,
            subjectId
          }
        }
      })

      if (existingProgress) {
        // Update existing progress
        const newCompletedQuestions = existingProgress.completedQuestions + totalQuestions
        const newCorrectAnswers = existingProgress.correctAnswers + correctAnswers
        const newTotalQuestions = Math.max(existingProgress.totalQuestions, newCompletedQuestions)
        const newProgress = (newCompletedQuestions / newTotalQuestions) * 100

        await prisma.userProgress.update({
          where: {
            userId_subjectId: {
              userId,
              subjectId
            }
          },
          data: {
            progress: Math.min(newProgress, 100),
            totalQuestions: newTotalQuestions,
            completedQuestions: newCompletedQuestions,
            correctAnswers: newCorrectAnswers,
            lastStudied: new Date()
          }
        })
      } else {
        // Create new progress record
        await prisma.userProgress.create({
          data: {
            userId,
            subjectId,
            progress: (totalQuestions / totalQuestions) * 100,
            totalQuestions,
            completedQuestions: totalQuestions,
            correctAnswers,
            lastStudied: new Date()
          }
        })
      }
    }

    res.json({
      success: true,
      data: {
        testResultId: testResult.id,
        score,
        totalQuestions,
        correctAnswers,
        incorrectAnswers: totalQuestions - correctAnswers,
        percentage: Math.round(score),
        results,
        timeSpent
      }
    })

  } catch (error) {
    console.error('Error submitting answers:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Get question by ID (for practice mode)
export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        unit: {
          select: {
            name: true,
            subject: {
              select: {
                name: true,
                icon: true,
                color: true
              }
            }
          }
        }
      }
    })

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      })
    }

    // Format question (exclude correct answer for security)
    const formattedQuestion = {
      id: question.id,
      text: question.text,
      type: question.type,
      options: question.options,
      explanation: question.explanation,
      difficulty: question.difficulty,
      topic: question.topic,
      unit: question.unit,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt
    }

    res.json({
      success: true,
      data: formattedQuestion
    })

  } catch (error) {
    console.error('Error fetching question:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}