// backend/src/routes/subjects.ts - Updated for Class-Based System
import { Router } from 'express'
import { 
  getSubjects, 
  getSubjectById, 
  getAvailableSubjects, 
  enrollInSubject 
} from '../controllers/subjectController'
import { authenticate } from '../middleware/auth'

const router = Router()

// Get subjects for user's class
router.get('/', authenticate, getSubjects)

// Get specific subject details
router.get('/:id', authenticate, getSubjectById)

// Get available subjects for enrollment (optional subjects)
router.get('/available/enrollment', authenticate, getAvailableSubjects)

// Enroll in optional subject
router.post('/enroll', authenticate, enrollInSubject)

export default router