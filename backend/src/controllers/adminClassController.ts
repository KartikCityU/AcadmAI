// backend/src/controllers/adminClassController.ts - FIXED FOR PRISMA SCHEMA

import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Get dashboard stats for class-based system
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const adminId = req.admin?.id

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Admin not authenticated'
      })
    }

    // Get current academic year
    const activeAcademicYear = await prisma.academicYear.findFirst({
      where: { isActive: true }
    })

    if (!activeAcademicYear) {
      return res.status(404).json({
        success: false,
        message: 'No active academic year found'
      })
    }

    // Get stats for the active academic year
    const [classes, teachers, students, subjects] = await Promise.all([
      prisma.class.count({
        where: { academicYearId: activeAcademicYear.id, isActive: true }
      }),
      prisma.teacher.count({
        where: { academicYearId: activeAcademicYear.id, isActive: true }
      }),
      prisma.user.count({
        where: { academicYearId: activeAcademicYear.id }
      }),
      prisma.subject.count({
        where: { 
          class: { academicYearId: activeAcademicYear.id },
          isActive: true 
        }
      })
    ])

    // Get recent classes with details
    const recentClasses = await prisma.class.findMany({
      where: { 
        academicYearId: activeAcademicYear.id,
        isActive: true 
      },
      include: {
        classTeacher: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            students: true,
            subjects: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    res.json({
      success: true,
      data: {
        stats: {
          totalClasses: classes,
          totalTeachers: teachers,
          totalStudents: students,
          totalSubjects: subjects
        },
        recentClasses,
        activeAcademicYear
      }
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Get all classes
export const getAllClasses = async (req: Request, res: Response) => {
  try {
    const { academicYear, grade } = req.query

    const where: any = {
      isActive: true
    }

    if (academicYear) {
      where.academicYear = { name: academicYear as string }
    } else {
      // Default to active academic year
      where.academicYear = { isActive: true }
    }

    if (grade) {
      where.grade = grade as string
    }

    const classes = await prisma.class.findMany({
      where,
      include: {
        academicYear: {
          select: {
            name: true,
            isActive: true
          }
        },
        classTeacher: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        _count: {
          select: {
            students: true,
            subjects: true,
            subjectTeachers: true
          }
        }
      },
      orderBy: [
        { grade: 'asc' },
        { section: 'asc' }
      ]
    })

    res.json({
      success: true,
      data: classes
    })

  } catch (error) {
    console.error('Error fetching classes:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Create new class
export const createClass = async (req: Request, res: Response) => {
  try {
    const { name, grade, section, classTeacherId, maxStudents, academicYearId } = req.body
    const adminId = req.admin?.id

    // Validation
    if (!name || !grade) {
      return res.status(400).json({
        success: false,
        message: 'Name and grade are required'
      })
    }

    // Get active academic year if not provided
    let targetAcademicYearId = academicYearId
    if (!targetAcademicYearId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { isActive: true }
      })
      if (!activeYear) {
        return res.status(400).json({
          success: false,
          message: 'No active academic year found'
        })
      }
      targetAcademicYearId = activeYear.id
    }

    // Check if class teacher is already assigned to another class
    if (classTeacherId) {
      const existingAssignment = await prisma.class.findFirst({
        where: {
          classTeacherId,
          academicYearId: targetAcademicYearId,
          isActive: true,
          id: { not: undefined } // Exclude current class if updating
        }
      })

      if (existingAssignment) {
        return res.status(400).json({
          success: false,
          message: 'This teacher is already assigned as class teacher to another class'
        })
      }
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        grade,
        section,
        academicYearId: targetAcademicYearId,
        classTeacherId,
        maxStudents: maxStudents || 40,
        createdById: adminId
      },
      include: {
        academicYear: {
          select: {
            name: true
          }
        },
        classTeacher: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            students: true,
            subjects: true
          }
        }
      }
    })

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: newClass
    })

  } catch (error) {
    console.error('Error creating class:', error)
    
    // Handle Prisma unique constraint errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: { target?: string[] } }
      if (prismaError.code === 'P2002') {
        return res.status(400).json({ 
          error: 'A class with this name already exists in the academic year' 
        })
      }
    }
    
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get class details with students and subjects
export const getClassDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const classDetails = await prisma.class.findUnique({
      where: { id },
      include: {
        academicYear: true,
        classTeacher: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        students: {
          select: {
            id: true,
            name: true,
            email: true,
            rollNumber: true,
            parentPhone: true,
            createdAt: true
          },
          orderBy: { rollNumber: 'asc' }
        },
        subjects: {
          include: {
            subjectTeachers: {
              include: {
                teacher: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            },
            _count: {
              select: {
                questions: true,
                enrollments: true
              }
            }
          }
        },
        _count: {
          select: {
            students: true,
            subjects: true,
            subjectTeachers: true
          }
        }
      }
    })

    if (!classDetails) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      })
    }

    res.json({
      success: true,
      data: classDetails
    })

  } catch (error) {
    console.error('Error fetching class details:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Get available teachers with assignment status - FIXED FOR PRISMA SCHEMA
export const getAvailableTeachers = async (req: Request, res: Response) => {
  try {
    const { academicYearId } = req.query

    // Get active academic year if not provided
    let targetAcademicYearId = academicYearId as string
    if (!targetAcademicYearId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { isActive: true }
      })
      if (!activeYear) {
        return res.status(400).json({
          success: false,
          message: 'No active academic year found'
        })
      }
      targetAcademicYearId = activeYear.id
    }

    // Fetch all teachers with their current class assignments
    const teachers = await prisma.teacher.findMany({
      where: {
        academicYearId: targetAcademicYearId,
        isActive: true
      },
      include: {
        primaryClass: {
          select: {
            id: true,
            name: true
          }
        },
        subjectTeaching: {
          include: {
            subject: {
              select: {
                name: true
              }
            },
            class: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Transform the data to include assignment status for the new modal
    const teachersWithStatus = teachers.map(teacher => ({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      // Note: Removed subject field as it doesn't exist in Teacher model
      isAssigned: teacher.primaryClass.length > 0,
      assignedClassName: teacher.primaryClass.length > 0 
        ? teacher.primaryClass[0].name 
        : undefined,
      // Keep original structure for backward compatibility
      primaryClass: teacher.primaryClass,
      subjectTeaching: teacher.subjectTeaching
    }))

    res.json({
      success: true,
      data: teachersWithStatus,
      teachers: teachersWithStatus // Also include as 'teachers' for the new modal
    })

  } catch (error) {
    console.error('Error fetching teachers:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// NEW: Assign teacher to class - FIXED FOR PRISMA SCHEMA
export const assignTeacherToClass = async (req: Request, res: Response) => {
  try {
    const { id: classId } = req.params
    const { teacherId } = req.body

    // Validation
    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID is required'
      })
    }

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        classTeacher: true
      }
    })

    if (!existingClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      })
    }

    // Check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        primaryClass: true
      }
    })

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      })
    }

    // Check if teacher is already assigned to another class
    if (teacher.primaryClass.length > 0 && teacher.primaryClass[0].id !== classId) {
      return res.status(400).json({
        success: false,
        message: `Teacher is already assigned to class: ${teacher.primaryClass[0].name}`
      })
    }

    // If class already has a teacher and it's different, we need to unassign the current teacher first
    if (existingClass.classTeacher && existingClass.classTeacher.id !== teacherId) {
      await prisma.class.update({
        where: { id: classId },
        data: {
          classTeacherId: null
        }
      })
    }

    // Assign the new teacher to the class - FIXED INCLUDE
    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: {
        classTeacherId: teacherId
      },
      include: {
        classTeacher: {
          select: {
            id: true,
            name: true,
            email: true
            // Note: Removed subject field as it doesn't exist in Teacher model
          }
        },
        _count: {
          select: {
            students: true,
            subjects: true
          }
        }
      }
    })

    res.json({
      success: true,
      message: 'Teacher assigned successfully',
      class: {
        id: updatedClass.id,
        name: updatedClass.name,
        teacher: updatedClass.classTeacher,
        studentCount: updatedClass._count.students,
        subjectCount: updatedClass._count.subjects
      }
    })

  } catch (error) {
    console.error('Error assigning teacher:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to assign teacher'
    })
  }
}

// NEW: Remove teacher from class - FIXED FOR PRISMA SCHEMA
export const removeTeacherFromClass = async (req: Request, res: Response) => {
  try {
    const { id: classId } = req.params

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        classTeacher: true
      }
    })

    if (!existingClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      })
    }

    if (!existingClass.classTeacher) {
      return res.status(400).json({
        success: false,
        message: 'Class does not have a teacher assigned'
      })
    }

    // Remove teacher from class - FIXED INCLUDE
    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: {
        classTeacherId: null
      },
      include: {
        _count: {
          select: {
            students: true,
            subjects: true
          }
        }
      }
    })

    res.json({
      success: true,
      message: 'Teacher removed successfully',
      class: {
        id: updatedClass.id,
        name: updatedClass.name,
        teacher: null,
        studentCount: updatedClass._count.students,
        subjectCount: updatedClass._count.subjects
      }
    })

  } catch (error) {
    console.error('Error removing teacher:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to remove teacher'
    })
  }
}

// Add student to class
export const addStudentToClass = async (req: Request, res: Response) => {
  try {
    const { id: classId } = req.params
    const { name, email, password, rollNumber, parentPhone } = req.body
    const adminId = req.admin?.id

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      })
    }

    // Get class details
    const classDetails = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        academicYear: true,
        _count: {
          select: { students: true }
        }
      }
    })

    if (!classDetails) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      })
    }

    // Check capacity
    if (classDetails._count.students >= classDetails.maxStudents) {
      return res.status(400).json({
        success: false,
        message: 'Class has reached maximum capacity'
      })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A student with this email already exists'
      })
    }

    // Check if roll number already exists in this class (if provided)
    if (rollNumber) {
      const existingRollNumber = await prisma.user.findFirst({
        where: {
          rollNumber,
          classId,
          academicYearId: classDetails.academicYearId
        }
      })

      if (existingRollNumber) {
        return res.status(400).json({
          success: false,
          message: 'This roll number is already taken in this class'
        })
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create student
    const newStudent = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        rollNumber: rollNumber?.trim() || null,
        parentPhone: parentPhone?.trim() || null,
        classId,
        academicYearId: classDetails.academicYearId
      },
      select: {
        id: true,
        name: true,
        email: true,
        rollNumber: true,
        parentPhone: true,
        createdAt: true
      }
    })

    // Auto-enroll in compulsory subjects
    const compulsorySubjects = await prisma.subject.findMany({
      where: {
        classId,
        isCompulsory: true,
        isActive: true
      }
    })

    if (compulsorySubjects.length > 0) {
      await prisma.subjectEnrollment.createMany({
        data: compulsorySubjects.map(subject => ({
          userId: newStudent.id,
          subjectId: subject.id
        }))
      })
    }

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: newStudent
    })

  } catch (error) {
    console.error('Error adding student to class:', error)
    
    // Handle Prisma unique constraint errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: { target?: string[] } }
      if (prismaError.code === 'P2002') {
        const target = prismaError.meta?.target?.[0]
        if (target === 'email') {
          return res.status(400).json({ 
            success: false,
            message: 'A student with this email already exists' 
          })
        } else if (target === 'rollNumber') {
          return res.status(400).json({ 
            success: false,
            message: 'This roll number is already taken in this class' 
          })
        }
      }
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    })
  }
}

// NEW: Add subject to class
export const addSubjectToClass = async (req: Request, res: Response) => {
  try {
    const { id: classId } = req.params
    const { name, code, description, icon, color, isCompulsory } = req.body
    const adminId = req.admin?.id

    // Validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Subject name and description are required'
      })
    }

    if (!icon || !color) {
      return res.status(400).json({
        success: false,
        message: 'Subject icon and color are required'
      })
    }

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        academicYear: true,
        _count: {
          select: { subjects: true }
        }
      }
    })

    if (!existingClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      })
    }

    // Check if subject with same name already exists in this class
    const existingSubject = await prisma.subject.findFirst({
      where: {
        name: name.trim(),
        classId,
        isActive: true
      }
    })

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'A subject with this name already exists in this class'
      })
    }

    // Check if subject code already exists in this class (if provided)
    if (code && code.trim()) {
      const existingCode = await prisma.subject.findFirst({
        where: {
          code: code.trim().toUpperCase(),
          classId,
          isActive: true
        }
      })

      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: 'A subject with this code already exists in this class'
        })
      }
    }

    // Create the subject
    const newSubject = await prisma.subject.create({
      data: {
        name: name.trim(),
        code: code?.trim().toUpperCase() || null,
        description: description.trim(),
        icon: icon.trim(),
        color: color.trim(),
        isCompulsory: Boolean(isCompulsory),
        classId,
        createdById: adminId
      },
      include: {
        class: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            questions: true,
            subjectTeachers: true
          }
        }
      }
    })

    // If subject is compulsory, auto-enroll all existing students in the class
    if (isCompulsory) {
      const classStudents = await prisma.user.findMany({
        where: { classId },
        select: { id: true }
      })

      if (classStudents.length > 0) {
        await prisma.subjectEnrollment.createMany({
          data: classStudents.map(student => ({
            userId: student.id,
            subjectId: newSubject.id
          })),
          skipDuplicates: true // In case of any existing enrollments
        })
      }
    }

    res.status(201).json({
      success: true,
      message: 'Subject added successfully',
      data: {
        id: newSubject.id,
        name: newSubject.name,
        code: newSubject.code,
        description: newSubject.description,
        icon: newSubject.icon,
        color: newSubject.color,
        isCompulsory: newSubject.isCompulsory,
        isActive: newSubject.isActive,
        className: newSubject.class.name,
        enrollmentCount: newSubject._count.enrollments,
        questionCount: newSubject._count.questions,
        teacherCount: newSubject._count.subjectTeachers
      }
    })

  } catch (error) {
    console.error('Error adding subject to class:', error)
    
    // Handle Prisma unique constraint errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: { target?: string[] } }
      if (prismaError.code === 'P2002') {
        const target = prismaError.meta?.target?.[0]
        if (target === 'name') {
          return res.status(400).json({ 
            success: false,
            message: 'A subject with this name already exists in this class' 
          })
        } else if (target === 'code') {
          return res.status(400).json({ 
            success: false,
            message: 'A subject with this code already exists in this class' 
          })
        }
      }
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    })
  }
}

// NEW: Remove subject from class
export const removeSubjectFromClass = async (req: Request, res: Response) => {
  try {
    const { id: classId, subjectId } = req.params

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: classId }
    })

    if (!existingClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      })
    }

    // Check if subject exists and belongs to this class
    const existingSubject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        classId,
        isActive: true
      }
    })

    if (!existingSubject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found in this class'
      })
    }

    // Soft delete the subject (set isActive to false)
    const updatedSubject = await prisma.subject.update({
      where: { id: subjectId },
      data: { isActive: false },
      select: {
        id: true,
        name: true
      }
    })

    // Also deactivate all enrollments for this subject
    await prisma.subjectEnrollment.updateMany({
      where: { subjectId },
      data: { isActive: false }
    })

    res.json({
      success: true,
      message: 'Subject removed successfully',
      data: updatedSubject
    })

  } catch (error) {
    console.error('Error removing subject from class:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to remove subject'
    })
  }
}

// NEW: Update subject in class
export const updateSubjectInClass = async (req: Request, res: Response) => {
  try {
    const { id: classId, subjectId } = req.params
    const { name, code, description, icon, color, isCompulsory, isActive } = req.body

    // Check if subject exists and belongs to this class
    const existingSubject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        classId
      }
    })

    if (!existingSubject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found in this class'
      })
    }

    // Check for duplicate name/code if they're being changed
    if (name && name !== existingSubject.name) {
      const duplicateName = await prisma.subject.findFirst({
        where: {
          name: name.trim(),
          classId,
          isActive: true,
          id: { not: subjectId }
        }
      })

      if (duplicateName) {
        return res.status(400).json({
          success: false,
          message: 'A subject with this name already exists in this class'
        })
      }
    }

    if (code && code !== existingSubject.code) {
      const duplicateCode = await prisma.subject.findFirst({
        where: {
          code: code.trim().toUpperCase(),
          classId,
          isActive: true,
          id: { not: subjectId }
        }
      })

      if (duplicateCode) {
        return res.status(400).json({
          success: false,
          message: 'A subject with this code already exists in this class'
        })
      }
    }

    // Update the subject
    const updatedSubject = await prisma.subject.update({
      where: { id: subjectId },
      data: {
        ...(name && { name: name.trim() }),
        ...(code !== undefined && { code: code?.trim().toUpperCase() || null }),
        ...(description && { description: description.trim() }),
        ...(icon && { icon: icon.trim() }),
        ...(color && { color: color.trim() }),
        ...(typeof isCompulsory === 'boolean' && { isCompulsory }),
        ...(typeof isActive === 'boolean' && { isActive })
      },
      include: {
        _count: {
          select: {
            enrollments: true,
            questions: true,
            subjectTeachers: true
          }
        }
      }
    })

    // If subject became compulsory, enroll all class students
    if (isCompulsory && !existingSubject.isCompulsory) {
      const classStudents = await prisma.user.findMany({
        where: { classId },
        select: { id: true }
      })

      if (classStudents.length > 0) {
        await prisma.subjectEnrollment.createMany({
          data: classStudents.map(student => ({
            userId: student.id,
            subjectId: subjectId
          })),
          skipDuplicates: true
        })
      }
    }

    res.json({
      success: true,
      message: 'Subject updated successfully',
      data: {
        id: updatedSubject.id,
        name: updatedSubject.name,
        code: updatedSubject.code,
        description: updatedSubject.description,
        icon: updatedSubject.icon,
        color: updatedSubject.color,
        isCompulsory: updatedSubject.isCompulsory,
        isActive: updatedSubject.isActive,
        enrollmentCount: updatedSubject._count.enrollments,
        questionCount: updatedSubject._count.questions,
        teacherCount: updatedSubject._count.subjectTeachers
      }
    })

  } catch (error) {
    console.error('Error updating subject:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update subject'
    })
  }
}

export const getStudentDetails = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params

    // Get comprehensive student data
    const studentData = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
            section: true
          }
        },
        academicYear: {
          select: {
            name: true,
            isActive: true
          }
        },
        subjectEnrollments: {
          where: { isActive: true },
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
                icon: true,
                color: true,
                isCompulsory: true,
                description: true
              }
            }
          },
          orderBy: {
            enrolledAt: 'desc'
          }
        },
        testResults: {
          include: {
            subject: {
              select: {
                name: true,
                icon: true,
                color: true
              }
            },
            unit: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 50 // Limit to recent 50 test results
        },
        userProgress: {
          include: {
            subject: {
              select: {
                name: true,
                icon: true,
                color: true
              }
            }
          },
          orderBy: {
            lastStudied: 'desc'
          }
        }
      }
    })

    if (!studentData) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      })
    }

    // Calculate additional statistics
    const stats = {
      totalTests: studentData.testResults.length,
      averageScore: studentData.testResults.length > 0 
        ? studentData.testResults.reduce((sum, result) => sum + result.score, 0) / studentData.testResults.length
        : 0,
      totalSubjects: studentData.subjectEnrollments.length,
      compulsorySubjects: studentData.subjectEnrollments.filter(e => e.subject.isCompulsory).length,
      totalTimeSpent: studentData.testResults.reduce((sum, result) => sum + result.timeSpent, 0),
      recentPerformance: studentData.testResults.slice(0, 5).map(result => ({
        score: result.score,
        subject: result.subject.name,
        date: result.createdAt
      }))
    }

    // Subject-wise performance
    const subjectPerformance = studentData.subjectEnrollments.map(enrollment => {
      const subjectTests = studentData.testResults.filter(
        result => result.subjectId === enrollment.subject.id
      )
      const subjectProgress = studentData.userProgress.find(
        progress => progress.subjectId === enrollment.subject.id
      )

      return {
        subject: enrollment.subject,
        testsCompleted: subjectTests.length,
        averageScore: subjectTests.length > 0 
          ? subjectTests.reduce((sum, test) => sum + test.score, 0) / subjectTests.length
          : 0,
        progress: subjectProgress?.progress || 0,
        lastActivity: subjectProgress?.lastStudied || enrollment.enrolledAt,
        enrolledAt: enrollment.enrolledAt
      }
    })

    res.json({
      success: true,
      data: {
        // Basic student info
        id: studentData.id,
        name: studentData.name,
        email: studentData.email,
        rollNumber: studentData.rollNumber,
        parentPhone: studentData.parentPhone,
        avatar: studentData.avatar,
        createdAt: studentData.createdAt,
        
        // Class and academic year info
        class: studentData.class,
        academicYear: studentData.academicYear,
        
        // Subject enrollments
        subjectEnrollments: studentData.subjectEnrollments,
        
        // Test results
        testResults: studentData.testResults,
        
        // Progress data
        userProgress: studentData.userProgress,
        
        // Calculated statistics
        statistics: stats,
        
        // Subject-wise performance
        subjectPerformance
      }
    })

  } catch (error) {
    console.error('Error fetching student details:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// NEW: Update student information
export const updateStudentInfo = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params
    const { name, email, rollNumber, parentPhone } = req.body

    // Check if student exists
    const existingStudent = await prisma.user.findUnique({
      where: { id: studentId },
      include: { class: true }
    })

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      })
    }

    // Check for duplicate email (if email is being changed)
    if (email && email !== existingStudent.email) {
      const duplicateEmail = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      })

      if (duplicateEmail) {
        return res.status(400).json({
          success: false,
          message: 'A student with this email already exists'
        })
      }
    }

    // Check for duplicate roll number in the same class (if roll number is being changed)
    if (rollNumber && rollNumber !== existingStudent.rollNumber) {
      const duplicateRollNumber = await prisma.user.findFirst({
        where: {
          rollNumber: rollNumber.trim(),
          classId: existingStudent.classId,
          id: { not: studentId }
        }
      })

      if (duplicateRollNumber) {
        return res.status(400).json({
          success: false,
          message: 'This roll number is already taken in this class'
        })
      }
    }

    // Update student information
    const updatedStudent = await prisma.user.update({
      where: { id: studentId },
      data: {
        ...(name && { name: name.trim() }),
        ...(email && { email: email.toLowerCase().trim() }),
        ...(rollNumber !== undefined && { rollNumber: rollNumber?.trim() || null }),
        ...(parentPhone !== undefined && { parentPhone: parentPhone?.trim() || null })
      },
      select: {
        id: true,
        name: true,
        email: true,
        rollNumber: true,
        parentPhone: true,
        class: {
          select: {
            name: true
          }
        }
      }
    })

    res.json({
      success: true,
      message: 'Student information updated successfully',
      data: updatedStudent
    })

  } catch (error) {
    console.error('Error updating student:', error)
    
    // Handle Prisma unique constraint errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: { target?: string[] } }
      if (prismaError.code === 'P2002') {
        const target = prismaError.meta?.target?.[0]
        if (target === 'email') {
          return res.status(400).json({ 
            success: false,
            message: 'A student with this email already exists' 
          })
        } else if (target === 'rollNumber') {
          return res.status(400).json({ 
            success: false,
            message: 'This roll number is already taken in this class' 
          })
        }
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update student information'
    })
  }
}

// NEW: Remove student from class
export const removeStudentFromClass = async (req: Request, res: Response) => {
  try {
    const { id: classId, studentId } = req.params

    // Check if student exists and belongs to this class
    const existingStudent = await prisma.user.findFirst({
      where: {
        id: studentId,
        classId
      },
      include: {
        class: {
          select: {
            name: true
          }
        }
      }
    })

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found in this class'
      })
    }

    // Instead of deleting, we could move them to a "removed" state
    // For now, we'll actually delete but you might want to soft delete
    await prisma.user.delete({
      where: { id: studentId }
    })

    res.json({
      success: true,
      message: `Successfully removed ${existingStudent.name} from ${existingStudent.class.name}`,
      data: {
        studentId,
        studentName: existingStudent.name,
        className: existingStudent.class.name
      }
    })

  } catch (error) {
    console.error('Error removing student from class:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to remove student from class'
    })
  }
}

// NEW: Get student performance analytics
export const getStudentAnalytics = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params
    const { period = '30' } = req.query // Days to look back

    const daysBack = parseInt(period as string)
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - daysBack)

    // Get student with recent test results
    const studentData = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        testResults: {
          where: {
            createdAt: {
              gte: fromDate
            }
          },
          include: {
            subject: {
              select: {
                name: true,
                icon: true,
                color: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        userProgress: {
          include: {
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

    if (!studentData) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      })
    }

    // Calculate performance trends
    const performanceByDate = studentData.testResults.reduce((acc, result) => {
      const date = result.createdAt.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { totalScore: 0, count: 0, tests: [] }
      }
      acc[date].totalScore += result.score
      acc[date].count += 1
      acc[date].tests.push({
        subject: result.subject.name,
        score: result.score,
        time: result.timeSpent
      })
      return acc
    }, {} as Record<string, any>)

    const dailyAverages = Object.entries(performanceByDate).map(([date, data]) => ({
      date,
      averageScore: data.totalScore / data.count,
      testCount: data.count,
      tests: data.tests
    }))

    // Subject-wise performance
    const subjectStats = studentData.testResults.reduce((acc, result) => {
      const subjectName = result.subject.name
      if (!acc[subjectName]) {
        acc[subjectName] = {
          subject: result.subject,
          scores: [],
          totalTime: 0,
          testCount: 0
        }
      }
      acc[subjectName].scores.push(result.score)
      acc[subjectName].totalTime += result.timeSpent
      acc[subjectName].testCount += 1
      return acc
    }, {} as Record<string, any>)

    const subjectPerformance = Object.values(subjectStats).map((stat: any) => ({
      subject: stat.subject,
      averageScore: stat.scores.reduce((sum: number, score: number) => sum + score, 0) / stat.scores.length,
      bestScore: Math.max(...stat.scores),
      worstScore: Math.min(...stat.scores),
      averageTime: stat.totalTime / stat.testCount,
      testCount: stat.testCount,
      trend: stat.scores.length > 1 ? 
        (stat.scores[stat.scores.length - 1] > stat.scores[0] ? 'improving' : 
         stat.scores[stat.scores.length - 1] < stat.scores[0] ? 'declining' : 'stable') : 'insufficient_data'
    }))

    res.json({
      success: true,
      data: {
        studentInfo: {
          id: studentData.id,
          name: studentData.name
        },
        period: `${daysBack} days`,
        summary: {
          totalTests: studentData.testResults.length,
          averageScore: studentData.testResults.length > 0 
            ? studentData.testResults.reduce((sum, result) => sum + result.score, 0) / studentData.testResults.length
            : 0,
          totalTimeSpent: studentData.testResults.reduce((sum, result) => sum + result.timeSpent, 0),
          subjectsActive: subjectPerformance.length
        },
        dailyPerformance: dailyAverages,
        subjectPerformance,
        progressData: studentData.userProgress
      }
    })

  } catch (error) {
    console.error('Error fetching student analytics:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student analytics'
    })
  }
}