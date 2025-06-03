// backend/src/routes/admin.ts - COMPLETE UPDATED VERSION

import { Router } from 'express'
import { adminLogin, adminRegister, getAdminProfile } from '../controllers/adminAuthController'
import { 
  getDashboardStats, 
  getAllClasses, 
  createClass, 
  getClassDetails, 
  getAvailableTeachers,
  addStudentToClass,
  assignTeacherToClass,
  removeTeacherFromClass,
  addSubjectToClass,
  removeSubjectFromClass,
  updateSubjectInClass,
  getStudentDetails,
  updateStudentInfo,
  removeStudentFromClass,
  getStudentAnalytics
} from '../controllers/adminClassController'
import { authenticateAdmin, requirePermission } from '../middleware/adminAuth'

const router = Router()

// Test route to verify admin routes are working
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Admin routes working!' })
})

// Auth routes
router.post('/auth/login', adminLogin)
router.post('/auth/register', adminRegister)
router.get('/auth/profile', authenticateAdmin, getAdminProfile)

// Dashboard routes
router.get('/dashboard/stats', authenticateAdmin, getDashboardStats)

// Class management routes
router.get('/classes', authenticateAdmin, getAllClasses)
router.post('/classes', authenticateAdmin, requirePermission('manage_subjects'), createClass)
router.get('/classes/:id', authenticateAdmin, getClassDetails)

// Teacher management routes
router.get('/teachers/available', authenticateAdmin, getAvailableTeachers)
router.put('/classes/:id/assign-teacher', authenticateAdmin, requirePermission('manage_subjects'), assignTeacherToClass)
router.delete('/classes/:id/remove-teacher', authenticateAdmin, requirePermission('manage_subjects'), removeTeacherFromClass)

// Student management routes
router.post('/classes/:id/students', authenticateAdmin, requirePermission('manage_subjects'), addStudentToClass)
router.get('/students/:studentId', authenticateAdmin, getStudentDetails)
router.put('/students/:studentId', authenticateAdmin, requirePermission('manage_subjects'), updateStudentInfo)
router.delete('/classes/:id/students/:studentId', authenticateAdmin, requirePermission('manage_subjects'), removeStudentFromClass)
router.get('/students/:studentId/analytics', authenticateAdmin, getStudentAnalytics)

// Subject management routes
router.post('/classes/:id/subjects', authenticateAdmin, requirePermission('manage_subjects'), addSubjectToClass)
router.delete('/classes/:id/subjects/:subjectId', authenticateAdmin, requirePermission('manage_subjects'), removeSubjectFromClass)
router.put('/classes/:id/subjects/:subjectId', authenticateAdmin, requirePermission('manage_subjects'), updateSubjectInClass)

export default router