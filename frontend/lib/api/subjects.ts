import { api } from './client'

export interface Subject {
  id: string
  name: string
  grade: string
  board: string
  icon?: string
  color?: string
  description?: string
  totalQuestions: number
  completedQuestions: number
  progress: number
  units: Unit[]
  createdAt: string
  updatedAt: string
}

export interface Unit {
  id: string
  name: string
  order: number
  questionCount: number
}

export const subjectsApi = {
  getAll: () =>
    api.get<{ subjects: Subject[] }>('/subjects'),

  getById: (id: string) =>
    api.get<{ subject: Subject }>(`/subjects/${id}`),
}
