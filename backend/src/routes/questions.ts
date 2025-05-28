// backend/src/routes/questions.ts - Updated for Class-Based System
import { Router } from 'express'
import { 
  getQuestions, 
  getQuestionById, 
  submitTest, 
  getTestHistory, 
  getUserProgress 
} from '../controllers/questionController'
import { authenticate } from '../middleware/auth'

const router = Router()

// Get questions (with optional subject and unit filters)
// GET /api/questions?subjectId=xxx&unitId=xxx&limit=10
router.get('/', authenticate, getQuestions)

// Get single question by ID
// GET /api/questions/:id
router.get('/:id', authenticate, getQuestionById)

// Submit test answers
// POST /api/questions/submit
router.post('/submit', authenticate, submitTest)

// Get user's test history
// GET /api/questions/history?subjectId=xxx&limit=10
router.get('/history', authenticate, getTestHistory)

// Get user progress
// GET /api/questions/progress?subjectId=xxx
router.get('/progress', authenticate, getUserProgress)

export default router