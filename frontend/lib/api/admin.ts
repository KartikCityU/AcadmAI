// frontend/lib/api/admin.ts
import { api } from './client'

export interface AdminLoginCredentials {
  email: string
  password: string
}

export interface AdminRegisterData {
  name: string
  email: string
  password: string
  schoolName?: string
  role?: 'admin' | 'super_admin' | 'teacher'
}

export interface Admin {
  id: string
  email: string
  name: string
  role: string
  schoolName: string | null
  permissions: string[]
  createdAt: string
  updatedAt: string
}

export interface AdminAuthResponse {
  admin: Admin
  token: string
}

export interface Subject {
  id: string
  name: string
  grade: string
  board: string
  icon: string
  color: string
  description: string
  isActive: boolean
  createdById: string | null
  createdAt: string
  updatedAt: string
  createdBy?: {
    name: string
    email: string
  }
  _count?: {
    units: number
    questions: number
    enrollments: number
  }
}

export interface Student {
  id: string
  name: string
  email: string
  grade: string
  board: string
  createdAt: string
  enrollments: Array<{
    subjectId: string
    subject: {
      name: string
    }
  }>
}

export interface SubjectEnrollment {
  id: string
  userId: string
  subjectId: string
  enrolledAt: string
  isActive: boolean
  user: {
    id: string
    name: string
    email: string
    grade: string
    board: string
  }
}

export interface CreateSubjectData {
  name: string
  grade: string
  board: string
  icon: string
  color: string
  description: string
}

export interface EnrollStudentsData {
  subjectId: string
  userIds: string[]
}

export const adminApi = {
  // Authentication
  login: (credentials: AdminLoginCredentials) =>
    api.post<AdminAuthResponse>('/admin/auth/login', credentials),

  register: (data: AdminRegisterData) =>
    api.post<AdminAuthResponse>('/admin/auth/register', data),

  getProfile: () =>
    api.get<{ admin: Admin }>('/admin/auth/profile'),

  // Subject Management
  getSubjects: (params?: { grade?: string; board?: string; active?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params?.grade) searchParams.append('grade', params.grade)
    if (params?.board) searchParams.append('board', params.board)
    if (params?.active !== undefined) searchParams.append('active', params.active.toString())
    
    const query = searchParams.toString()
    return api.get<Subject[]>(`/admin/subjects${query ? `?${query}` : ''}`)
  },

  createSubject: (data: CreateSubjectData) =>
    api.post<Subject>('/admin/subjects', data),

  updateSubject: (id: string, data: Partial<CreateSubjectData>) =>
    api.put<Subject>(`/admin/subjects/${id}`, data),

  deleteSubject: (id: string) =>
    api.delete(`/admin/subjects/${id}`),

  // Student Management
  getStudents: (params?: { grade?: string; board?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.grade) searchParams.append('grade', params.grade)
    if (params?.board) searchParams.append('board', params.board)
    
    const query = searchParams.toString()
    return api.get<Student[]>(`/admin/students${query ? `?${query}` : ''}`)
  },

  // Enrollment Management
  enrollStudents: (data: EnrollStudentsData) =>
    api.post<{ successful: number; failed: number; total: number }>('/admin/enrollments', data),

  getSubjectEnrollments: (subjectId: string) =>
    api.get<SubjectEnrollment[]>(`/admin/subjects/${subjectId}/enrollments`),

  // Bulk Operations
  bulkEnrollStudents: async (enrollments: Array<{ subjectId: string; userIds: string[] }>) => {
    const results = await Promise.allSettled(
      enrollments.map(enrollment => adminApi.enrollStudents(enrollment))
    )
    
    return results.map((result, index) => ({
      ...enrollments[index],
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value.data : null,
      error: result.status === 'rejected' ? result.reason : null
    }))
  }
}