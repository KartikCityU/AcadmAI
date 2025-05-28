import { Router } from 'express'
import { getSubjects, getSubjectById } from '../controllers/subjectController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(authenticate) // All subject routes require authentication

router.get('/', getSubjects)
router.get('/:id', getSubjectById)

export default router
