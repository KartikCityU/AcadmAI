// backend/src/controllers/userController.ts - Updated for Class-Based System
import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Get user dashboard statistics
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const userClassId = req.user?.class?.id

    if (!userId || !userClassId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated or class not assigned'
      })
    }

    // Get user's enrolled subjects count
    const enrolledSubjects = await prisma.subjectEnrollment.count({
      where: {
        userId,
        isActive: true
      }
    })

    // Get user's test results for average score
    const testResults = await prisma.testResult.findMany({
      where: {
        userId,
        classId: userClassId
      },
      select: {
        score: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate average score
    const averageScore = testResults.length > 0 
      ? testResults.reduce((sum, test) => sum + test.score, 0) / testResults.length 
      : 0

    // Get this week's tests for improvement calculation
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const thisWeekTests = testResults.filter(test => test.createdAt >= oneWeekAgo)
    const lastWeekTests = testResults.filter(test => {
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
      return test.createdAt >= twoWeeksAgo && test.createdAt < oneWeekAgo
    })

    const thisWeekAvg = thisWeekTests.length > 0 
      ? thisWeekTests.reduce((sum, test) => sum + test.score, 0) / thisWeekTests.length 
      : 0

    const lastWeekAvg = lastWeekTests.length > 0 
      ? lastWeekTests.reduce((sum, test) => sum + test.score, 0) / lastWeekTests.length 
      : 0

    const weeklyImprovement = thisWeekAvg - lastWeekAvg

    // Get recent activity
    const recentTests = await prisma.testResult.findMany({
      where: {
        userId,
        classId: userClassId
      },
      include: {
        subject: {
          select: {
            name: true,
            icon: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    const recentActivity = recentTests.map(test => ({
      id: test.id,
      subject: test.subject.name,
      activity: `${test.testType === 'practice' ? 'Completed practice' : 'Took mock test'}`,
      score: Math.round(test.score),
      time: test.createdAt,
      icon: test.subject.icon
    }))

    // Get user progress for enrolled subjects
    const userProgress = await prisma.userProgress.findMany({
      where: {
        userId,
        classId: userClassId
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true
          }
        }
      }
    })

    const stats = {
      activeSubjects: enrolledSubjects,
      averageScore: Math.round(averageScore),
      weeklyImprovement: Math.round(weeklyImprovement),
      totalTests: testResults.length,
      recentActivity,
      userProgress: userProgress.map(progress => ({
        subject: progress.subject,
        progress: progress.progress,
        completedQuestions: progress.completedQuestions,
        totalQuestions: progress.totalQuestions,
        correctAnswers: progress.correctAnswers,
        lastStudied: progress.lastStudied
      }))
    }

    res.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error fetching user stats:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Get user profile with class information
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        rollNumber: true,
        avatar: true,
        parentPhone: true,
        createdAt: true,
        updatedAt: true,
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
            section: true,
            classTeacher: {
              select: {
                name: true,
                email: true,
                phone: true
              }
            },
            academicYear: {
              select: {
                name: true,
                isActive: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      data: { user }
    })

  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const { name, avatar, parentPhone } = req.body

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
        ...(parentPhone && { parentPhone })
      },
      select: {
        id: true,
        email: true,
        name: true,
        rollNumber: true,
        avatar: true,
        parentPhone: true,
        createdAt: true,
        updatedAt: true,
        class: {
          select: {
            name: true,
            grade: true,
            section: true
          }
        }
      }
    })

    res.json({
      success: true,
      data: { user: updatedUser },
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Error updating user profile:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}