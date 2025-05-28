// backend/src/controllers/adminAuthController.ts
import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Simple validation helper
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Admin login
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    console.log('Admin login attempt:', { email })

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      })
    }

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        schoolName: true,
        permissions: true,
        createdAt: true
      }
    })

    console.log('Admin found:', admin ? 'Yes' : 'No')

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, admin.password)
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        email: admin.email,
        role: admin.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    // Remove password from response
    const { password: _, ...adminData } = admin

    console.log('Admin login successful:', adminData.email)

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        admin: adminData,
        token
      }
    })

  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Admin registration (for creating new admins)
export const adminRegister = async (req: Request, res: Response) => {
  try {
    const { name, email, password, schoolName, role = 'admin' } = req.body

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      })
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    })

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Admin with this email already exists'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Set default permissions based on role
    const defaultPermissions = {
      admin: ['manage_subjects', 'manage_questions', 'view_analytics', 'manage_enrollments'],
      teacher: ['manage_questions', 'view_analytics'],
      super_admin: ['*'] // All permissions
    }

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        schoolName,
        role,
        permissions: defaultPermissions[role as keyof typeof defaultPermissions]
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        schoolName: true,
        permissions: true,
        createdAt: true
      }
    })

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        email: admin.email,
        role: admin.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        admin,
        token
      }
    })

  } catch (error) {
    console.error('Admin registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Get admin profile
export const getAdminProfile = async (req: Request, res: Response) => {
  try {
    const adminId = req.admin?.id

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Admin not authenticated'
      })
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        schoolName: true,
        permissions: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      })
    }

    res.json({
      success: true,
      data: { admin }
    })

  } catch (error) {
    console.error('Error fetching admin profile:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}