// backend/src/middleware/adminAuth.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface AdminJwtPayload {
  adminId: string
  email: string
  role: string
}

// Extend Express Request type to include admin
declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string
        email: string
        name: string
        role: string
        schoolName: string | null
        permissions: any
      }
    }
  }
}

// Admin authentication middleware
export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AdminJwtPayload

    console.log('🔍 JWT Token:', token.substring(0, 50) + '...')
    console.log('🔍 Decoded JWT:', decoded)
    console.log('🔍 AdminId from JWT:', decoded.adminId)
    
    // Get admin from database
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        schoolName: true,
        permissions: true
      }
    })

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      })
    }

    // Add admin to request object
    req.admin = admin
    next()

  } catch (error) {
    console.error('Admin authentication error:', error)
    
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

// Permission checking middleware
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const admin = req.admin

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not authenticated'
      })
    }

    // Super admin has all permissions
    if (admin.role === 'super_admin' || 
        (Array.isArray(admin.permissions) && admin.permissions.includes('*'))) {
      return next()
    }

    // Check if admin has required permission
    if (Array.isArray(admin.permissions) && admin.permissions.includes(permission)) {
      return next()
    }

    return res.status(403).json({
      success: false,
      message: `Insufficient permissions. Required: ${permission}`
    })
  }
}