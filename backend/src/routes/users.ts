// backend/src/routes/users.ts - Updated for Class-Based System
import { Router } from 'express'
import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// Get user dashboard statistics
const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const userClassId = req.user?.class?.id

    if (!userId || !userClassId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated or class not assigned'
      })
    }

    // Get user with progress for their class subjects
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userProgress: {
          where: {
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
        },
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
        }
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Get test results from last 7 days for this class
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)

    const recentTests = await prisma.testResult.findMany({
      where: {
        userId,
        classId: userClassId,
        createdAt: {
          gte: lastWeek
        }
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
      take: 10
    })

    // Calculate average score for this class
    const allTests = await prisma.testResult.findMany({
      where: { 
        userId,
        classId: userClassId
      },
      select: {
        score: true
      }
    })

    const averageScore = allTests.length > 0 
      ? allTests.reduce((sum, test) => sum + test.score, 0) / allTests.length 
      : 0

    // Calculate this week's improvement
    const thisWeekTests = recentTests.filter(test => {
      const testDate = new Date(test.createdAt)
      const thisWeekStart = new Date()
      thisWeekStart.setDate(thisWeekStart.getDate() - 7)
      return testDate >= thisWeekStart
    })

    const lastWeekTests = await prisma.testResult.findMany({
      where: {
        userId,
        classId: userClassId,
        createdAt: {
          gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
          lt: lastWeek
        }
      }
    })

    const thisWeekAvg = thisWeekTests.length > 0 
      ? thisWeekTests.reduce((sum, test) => sum + test.score, 0) / thisWeekTests.length 
      : 0

    const lastWeekAvg = lastWeekTests.length > 0 
      ? lastWeekTests.reduce((sum, test) => sum + test.score, 0) / lastWeekTests.length 
      : 0

    const weeklyImprovement = thisWeekAvg - lastWeekAvg

    // Format recent activity
    const recentActivity = recentTests.slice(0, 5).map(test => ({
      id: test.id,
      subject: test.subject.name,
      activity: `${test.testType === 'practice' ? 'Completed practice' : 'Took mock test'}`,
      score: Math.round(test.score),
      time: test.createdAt,
      icon: test.subject.icon
    }))

    const stats = {
      activeSubjects: user.userProgress.length,
      averageScore: Math.round(averageScore),
      weeklyImprovement: Math.round(weeklyImprovement),
      totalTests: allTests.length,
      recentActivity,
      userProgress: user.userProgress.map(progress => ({
        subject: {
          id: progress.subject.id,
          name: progress.subject.name,
          icon: progress.subject.icon,
          color: progress.subject.color
        },
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

// Get user profile
const getUserProfile = async (req: Request, res: Response) => {
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
const updateUserProfile = async (req: Request, res: Response) => {
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

// Routes
router.get('/stats', authenticate, getUserStats)
router.get('/profile', authenticate, getUserProfile)
router.put('/profile', authenticate, updateUserProfile)

export default router