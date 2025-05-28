// backend/src/routes/admin.ts
import { Router } from 'express'
import { adminLogin, adminRegister, getAdminProfile } from '../controllers/adminAuthController'
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

// TODO: Subject management routes (we'll add these next)
// router.get('/subjects', authenticateAdmin, getAllSubjects)
// router.post('/subjects', authenticateAdmin, requirePermission('manage_subjects'), createSubject)

export default router