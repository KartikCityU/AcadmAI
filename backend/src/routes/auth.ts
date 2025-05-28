// backend/src/routes/auth.ts - Add this route
import { Router } from 'express'
import { register, login, getProfile, getAvailableClasses } from '../controllers/authController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/profile', authenticate, getProfile)
router.get('/classes/available', getAvailableClasses) // New route for registration

export default router