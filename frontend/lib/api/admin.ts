// frontend/lib/api/admin.ts - COMPLETE UPDATED VERSION

import { api } from './client'

export interface ClassStats {
  totalClasses: number
  totalStudents: number
  totalTeachers: number
  activeAcademicYear: string
}

export interface Class {
  id: string
  name: string
  grade: string
  section: string | null
  currentStudents: number
  maxStudents: number
  classTeacher: {
    name: string
    email: string
  } | null
  academicYear: {
    name: string
  }
}

export interface ClassDetail {
  id: string
  name: string
  grade: string
  section: string | null
  maxStudents: number
  currentStudents: number
  academicYear: {
    name: string
  }
  classTeacher: {
    id: string
    name: string
    email: string
    phone: string | null
  } | null
  students: Array<{
    id: string
    name: string
    email: string
    rollNumber: string | null
    avatar: string | null
    parentPhone: string | null
    createdAt: string
  }>
  subjects: Array<{
    id: string
    name: string
    code: string | null
    icon: string
    color: string
    isCompulsory: boolean
    isActive: boolean
  }>
  analytics: {
    averageScore: number
    totalTests: number
    activeStudents: number
    completionRate: number
  }
}

export interface Teacher {
  id: string
  name: string
  email: string
  phone: string | null
  subject?: string
  isAssigned?: boolean
  assignedClassName?: string
}

export interface CreateClassData {
  name: string
  grade: string
  section?: string
  maxStudents: number
  classTeacherId?: string
}

export interface TeacherAssignmentResponse {
  success: boolean
  message: string
  class?: {
    id: string
    name: string
    teacher: {
      id: string
      name: string
      email: string
      subject?: string
    } | null
    studentCount: number
    subjectCount: number
  }
}

export const adminApi = {
  // Authentication
  login: async (email: string, password: string) => {
    const response = await api.post('/admin/auth/login', { email, password })
    return response.data
  },

  // Dashboard
  getDashboardStats: async (): Promise<{ data: ClassStats }> => {
    const response = await api.get('/admin/dashboard/stats')
    return response.data
  },

  // Classes
  getClasses: async (params?: { grade?: string; academicYear?: string }): Promise<{ data: any[] }> => {
    const queryParams = new URLSearchParams()
    if (params?.grade) queryParams.append('grade', params.grade)
    if (params?.academicYear) queryParams.append('academicYear', params.academicYear)
    
    const queryString = queryParams.toString()
    const url = queryString ? `/admin/classes?${queryString}` : '/admin/classes'
    
    console.log('🔍 Making API call to:', url)
    const response = await api.get(url)
    console.log('🔍 Raw API response:', response)
    
    return response
  },

  getClassDetails: async (classId: string): Promise<{ data: ClassDetail }> => {
    console.log('🔍 API: Calling getClassDetails with ID:', classId)
    const response = await api.get(`/admin/classes/${classId}`)
    console.log('🔍 API: Raw response from backend:', response)
    return response
  },

  createClass: async (classData: CreateClassData) => {
    const response = await api.post('/admin/classes', classData)
    return response.data
  },

  updateClass: async (classId: string, classData: Partial<CreateClassData>) => {
    const response = await api.put(`/admin/classes/${classId}`, classData)
    return response.data
  },

  deleteClass: async (classId: string) => {
    const response = await api.delete(`/admin/classes/${classId}`)
    return response.data
  },

  // Teachers - UPDATED WITH NEW FUNCTIONALITY
  getAvailableTeachers: async (): Promise<{ data: Teacher[] }> => {
    const response = await api.get('/admin/teachers/available')
    return response.data
  },

  // NEW: Assign teacher to class
  assignTeacherToClass: async (classId: string, teacherId: string): Promise<TeacherAssignmentResponse> => {
    const response = await api.put(`/admin/classes/${classId}/assign-teacher`, {
      teacherId
    })
    return response.data
  },

  // NEW: Remove teacher from class
  removeTeacherFromClass: async (classId: string): Promise<TeacherAssignmentResponse> => {
    const response = await api.delete(`/admin/classes/${classId}/remove-teacher`)
    return response.data
  },

  // DEPRECATED: Legacy methods - keeping for backward compatibility
  assignClassTeacher: async (classId: string, teacherId: string) => {
    const response = await api.post(`/admin/classes/${classId}/assign-teacher`, {
      teacherId
    })
    return response.data
  },

  removeClassTeacher: async (classId: string) => {
    const response = await api.delete(`/admin/classes/${classId}/teacher`)
    return response.data
  },

  // Students - UPDATED
  addStudentToClass: async (classId: string, studentData: {
    name: string
    email: string
    password: string
    rollNumber?: string
    parentPhone?: string
  }) => {
    console.log('🔍 API: Adding student to class', classId, studentData)
    const response = await api.post(`/admin/classes/${classId}/students`, studentData)
    console.log('✅ API: Student added successfully', response)
    return response.data
  },

  getStudentDetails: async (studentId: string) => {
    console.log('🔍 API: Getting student details for ID:', studentId)
    const response = await api.get(`/admin/students/${studentId}`)
    console.log('✅ API: Student details received:', response)
    return response.data
  },

  updateStudentInfo: async (studentId: string, studentData: {
    name?: string
    email?: string
    rollNumber?: string
    parentPhone?: string
  }) => {
    console.log('🔍 API: Updating student info for ID:', studentId, studentData)
    const response = await api.put(`/admin/students/${studentId}`, studentData)
    console.log('✅ API: Student updated successfully:', response)
    return response.data
  },

  getStudentAnalytics: async (studentId: string, period: string = '30') => {
    console.log('🔍 API: Getting student analytics for ID:', studentId)
    const response = await api.get(`/admin/students/${studentId}/analytics?period=${period}`)
    console.log('✅ API: Student analytics received:', response)
    return response.data
  },

  removeStudentFromClass: async (classId: string, studentId: string) => {
    const response = await api.delete(`/admin/classes/${classId}/students/${studentId}`)
    return response.data
  },

  updateStudent: async (studentId: string, studentData: {
    name?: string
    email?: string
    rollNumber?: string
    parentPhone?: string
  }) => {
    const response = await api.put(`/admin/students/${studentId}`, studentData)
    return response.data
  },

  // Subjects - UPDATED
  addSubjectToClass: async (classId: string, subjectData: {
    name: string
    code?: string
    icon: string
    color: string
    description: string
    isCompulsory: boolean
  }) => {
    console.log('🔍 API: Adding subject to class', classId, subjectData)
    const response = await api.post(`/admin/classes/${classId}/subjects`, subjectData)
    console.log('✅ API: Subject added successfully', response)
    return response.data
  },

  removeSubjectFromClass: async (classId: string, subjectId: string) => {
    const response = await api.delete(`/admin/classes/${classId}/subjects/${subjectId}`)
    return response.data
  },

  updateSubject: async (subjectId: string, subjectData: {
    name?: string
    code?: string
    icon?: string
    color?: string
    description?: string
    isCompulsory?: boolean
    isActive?: boolean
  }) => {
    const response = await api.put(`/admin/subjects/${subjectId}`, subjectData)
    return response.data
  },

  // Subject Teachers
  assignSubjectTeacher: async (subjectId: string, teacherId: string) => {
    const response = await api.post(`/admin/subjects/${subjectId}/assign-teacher`, {
      teacherId
    })
    return response.data
  },

  removeSubjectTeacher: async (subjectId: string, teacherId: string) => {
    const response = await api.delete(`/admin/subjects/${subjectId}/teachers/${teacherId}`)
    return response.data
  },

  // Analytics
  getClassAnalytics: async (classId: string) => {
    const response = await api.get(`/admin/classes/${classId}/analytics`)
    return response.data
  },

  getSubjectAnalytics: async (subjectId: string) => {
    const response = await api.get(`/admin/subjects/${subjectId}/analytics`)
    return response.data
  },

  getStudentAnalytics: async (studentId: string) => {
    const response = await api.get(`/admin/students/${studentId}/analytics`)
    return response.data
  },

  // Academic Years
  getAcademicYears: async () => {
    const response = await api.get('/admin/academic-years')
    return response.data
  },

  createAcademicYear: async (yearData: {
    name: string
    startDate: string
    endDate: string
  }) => {
    const response = await api.post('/admin/academic-years', yearData)
    return response.data
  },

  setActiveAcademicYear: async (yearId: string) => {
    const response = await api.post(`/admin/academic-years/${yearId}/activate`)
    return response.data
  },

  // Bulk Operations
  bulkAddStudents: async (classId: string, studentsData: Array<{
    name: string
    email: string
    password: string
    rollNumber?: string
    parentPhone?: string
  }>) => {
    const response = await api.post(`/admin/classes/${classId}/students/bulk`, {
      students: studentsData
    })
    return response.data
  },

  bulkUpdateGrades: async (classId: string, gradesData: Array<{
    studentId: string
    subjectId: string
    grade: number
    testType: string
  }>) => {
    const response = await api.post(`/admin/classes/${classId}/grades/bulk`, {
      grades: gradesData
    })
    return response.data
  },

  // Reports
  generateClassReport: async (classId: string, reportType: 'performance' | 'attendance' | 'progress') => {
    const response = await api.get(`/admin/classes/${classId}/reports/${reportType}`)
    return response.data
  },

  generateStudentReport: async (studentId: string, reportType: 'transcript' | 'progress' | 'performance') => {
    const response = await api.get(`/admin/students/${studentId}/reports/${reportType}`)
    return response.data
  },

  exportClassData: async (classId: string, format: 'csv' | 'excel' | 'pdf') => {
    const response = await api.get(`/admin/classes/${classId}/export?format=${format}`, {
      responseType: 'blob'
    })
    return response.data
  },

  // Search and Filters
  searchStudents: async (query: string, classId?: string) => {
    const params = new URLSearchParams({ query })
    if (classId) params.append('classId', classId)
    const response = await api.get(`/admin/students/search?${params}`)
    return response.data
  },

  searchTeachers: async (query: string) => {
    const response = await api.get(`/admin/teachers/search?query=${query}`)
    return response.data
  },

  filterClasses: async (filters: {
    grade?: string
    academicYear?: string
    hasTeacher?: boolean
    minStudents?: number
    maxStudents?: number
  }) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString())
    })
    const response = await api.get(`/admin/classes/filter?${params}`)
    return response.data
  },

  // Notifications
  sendClassNotification: async (classId: string, notification: {
    title: string
    message: string
    type: 'info' | 'warning' | 'success' | 'error'
    recipients: 'all' | 'students' | 'teachers'
  }) => {
    const response = await api.post(`/admin/classes/${classId}/notifications`, notification)
    return response.data
  },

  getNotifications: async (page = 1, limit = 20) => {
    const response = await api.get(`/admin/notifications?page=${page}&limit=${limit}`)
    return response.data
  },

  markNotificationRead: async (notificationId: string) => {
    const response = await api.put(`/admin/notifications/${notificationId}/read`)
    return response.data
  }
}