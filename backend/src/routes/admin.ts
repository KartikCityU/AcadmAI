// backend/src/routes/admin.ts
import { Router } from 'express'
import { adminLogin, adminRegister, getAdminProfile } from '../controllers/adminAuthController'
import { 
  getDashboardStats, 
  getAllClasses, 
  createClass, 
  getClassDetails, 
  getAvailableTeachers 
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
router.get('/teachers/available', authenticateAdmin, getAvailableTeachers)

export default router