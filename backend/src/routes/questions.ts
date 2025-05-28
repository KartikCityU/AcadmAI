import { Router } from 'express'
import { getQuestionsByUnit, submitAnswers } from '../controllers/questionController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(authenticate) // All question routes require authentication

router.get('/unit/:unitId', getQuestionsByUnit)
router.post('/submit', submitAnswers)

export default router
