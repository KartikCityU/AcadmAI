// backend/src/middleware/auth.ts - Updated for Class-Based System
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface JwtPayload {
  userId: string
  email: string
  classId: string
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        name: string
        rollNumber: string | null
        class: {
          id: string
          name: string
          grade: string
          section: string | null
        }
      }
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header missing'
      })
    }

    const token = authHeader.split(' ')[1] // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token missing'
      })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    
    // Get user from database with class information
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        rollNumber: true,
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
            section: true
          }
        }
      }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      })
    }

    // Add user to request object
    req.user = user
    next()

  } catch (error) {
    console.error('Authentication error:', error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    })
  }
}