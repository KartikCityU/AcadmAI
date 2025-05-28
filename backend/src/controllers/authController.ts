// backend/src/controllers/authController.ts - Complete Corrected Version
import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import Joi from 'joi'

const prisma = new PrismaClient()

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  rollNumber: Joi.string().optional(),
  classId: Joi.string().required(), // Now required - students must be assigned to a class
  parentPhone: Joi.string().optional()
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

// Register user (student)
export const register = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body)
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details
      })
    }

    const { name, email, password, rollNumber, classId, parentPhone } = value

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      })
    }

    // Verify class exists and get academic year
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        academicYear: true,
        _count: {
          select: { students: true }
        }
      }
    })

    if (!classData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class selected'
      })
    }

    if (!classData.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Selected class is not active'
      })
    }

    // Check class capacity
    if (classData._count.students >= classData.maxStudents) {
      return res.status(400).json({
        success: false,
        message: 'Class is at maximum capacity'
      })
    }

    // Check roll number uniqueness within class
    if (rollNumber) {
      const existingRollNumber = await prisma.user.findFirst({
        where: {
          rollNumber,
          classId
        }
      })

      if (existingRollNumber) {
        return res.status(409).json({
          success: false,
          message: 'Roll number already exists in this class'
        })
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        rollNumber,
        classId,
        academicYearId: classData.academicYearId,
        parentPhone
      },
      select: {
        id: true,
        email: true,
        name: true,
        rollNumber: true,
        parentPhone: true,
        createdAt: true,
        class: {
          select: {
            id: true,
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

    // Auto-enroll in compulsory subjects for the class
    const compulsorySubjects = await prisma.subject.findMany({
      where: {
        classId,
        isCompulsory: true,
        isActive: true
      }
    })

    for (const subject of compulsorySubjects) {
      await prisma.subjectEnrollment.create({
        data: {
          userId: user.id,
          subjectId: subject.id
        }
      })
    }

    // Generate JWT token - FIXED: Use user.class.id instead of user.classId
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        classId: user.class.id 
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body)
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details
      })
    }

    const { email, password } = value

    // Find user by email with class information
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        rollNumber: true,
        parentPhone: true,
        createdAt: true,
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
            section: true,
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
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check if academic year is active
    if (!user.class.academicYear.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Academic year is not active. Please contact your administrator.'
      })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Generate JWT token - FIXED: Use user.class.id instead of user.classId
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        classId: user.class.id 
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    )

    // Remove password from response
    const { password: _, ...userData } = user

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Get user profile
export const getProfile = async (req: Request, res: Response) => {
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
        parentPhone: true,
        avatar: true,
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

// Get available classes for registration
export const getAvailableClasses = async (req: Request, res: Response) => {
  try {
    const classes = await prisma.class.findMany({
      where: {
        isActive: true,
        academicYear: {
          isActive: true
        }
      },
      include: {
        academicYear: {
          select: {
            name: true
          }
        },
        classTeacher: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            students: true
          }
        }
      },
      orderBy: [
        { grade: 'asc' },
        { section: 'asc' }
      ]
    })

    // Filter out full classes and format response
    const availableClasses = classes
      .filter(cls => cls._count.students < cls.maxStudents)
      .map(cls => ({
        id: cls.id,
        name: cls.name,
        grade: cls.grade,
        section: cls.section,
        academicYear: cls.academicYear.name,
        classTeacher: cls.classTeacher?.name || 'Not assigned',
        currentStudents: cls._count.students,
        maxStudents: cls.maxStudents,
        availableSpots: cls.maxStudents - cls._count.students
      }))

    res.json({
      success: true,
      data: availableClasses
    })

  } catch (error) {
    console.error('Error fetching available classes:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}