import { api } from './client'

export interface Question {
  id: string
  text: string
  type: 'MCQ' | 'SINGLE_ANSWER' | 'MULTIPLE_ANSWER' | 'TRUE_FALSE'
  options?: string[]
  correctAnswer: string
  explanation?: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  topic?: string
}

export interface QuestionAnswer {
  questionId: string
  selectedAnswer: string
  timeSpent?: number
}

export interface SubmitAnswersRequest {
  subjectId: string
  unitId?: string
  answers: QuestionAnswer[]
  timeSpent: number
  testType?: 'PRACTICE' | 'MOCK_TEST' | 'PAST_PAPER'
}

export interface TestResult {
  id: string
  score: number
  totalQuestions: number
  correctAnswers: number
  timeSpent: number
  percentage: number
}

export const questionsApi = {
  getByUnit: (unitId: string, params?: { limit?: number; difficulty?: string }) =>
    api.get<{ questions: Question[] }>(`/questions/unit/${unitId}?${new URLSearchParams(params as any).toString()}`),

  submitAnswers: (data: SubmitAnswersRequest) =>
    api.post<{ testResult: TestResult }>('/questions/submit', data),
}
