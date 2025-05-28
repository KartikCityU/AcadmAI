import { api } from './client'

export interface DashboardStats {
  totalSubjects: number
  activeSubjects: number
  totalQuestions: number
  completedQuestions: number
  averageScore: number
  weeklyProgress: number
  streak: number
  rank: number
}

export const usersApi = {
  getStats: () =>
    api.get<{ stats: DashboardStats }>('/users/stats'),
}
