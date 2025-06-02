// frontend/lib/api/admin.ts - Updated with Class Detail Functions
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
}

export interface CreateClassData {
  name: string
  grade: string
  section?: string
  maxStudents: number
  classTeacherId?: string
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
  getClasses: async (params?: { grade?: string; academicYear?: string }): Promise<{ data: ClassData[] }> => {
    // Build query string if parameters provided
    const queryParams = new URLSearchParams()
    if (params?.grade) queryParams.append('grade', params.grade)
    if (params?.academicYear) queryParams.append('academicYear', params.academicYear)
    
    const queryString = queryParams.toString()
    const url = queryString ? `/admin/classes?${queryString}` : '/admin/classes'
    
    console.log('🔍 Making API call to:', url)
    const response = await api.get(url)
    console.log('🔍 Raw API response:', response)
    
    // Return the response as-is, since api.get already extracts .data
    return response
  },

  getClassDetails: async (classId: string): Promise<{ data: ClassDetail }> => {
    console.log('🔍 API: Calling getClassDetails with ID:', classId)
    const response = await api.get(`/admin/classes/${classId}`)
    console.log('🔍 API: Raw response from backend:', response)
    return response  // Should return the response as-is since api.get already extracts .data
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

  // Teachers
  getAvailableTeachers: async (): Promise<{ data: Teacher[] }> => {
    const response = await api.get('/admin/teachers/available')
    return response.data
  },

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

  // Students
  addStudentToClass: async (classId: string, studentData: {
    name: string
    email: string
    password: string
    rollNumber?: string
    parentPhone?: string
  }) => {
    const response = await api.post(`/admin/classes/${classId}/students`, studentData)
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

  // Subjects
  addSubjectToClass: async (classId: string, subjectData: {
    name: string
    code?: string
    icon: string
    color: string
    description: string
    isCompulsory: boolean
  }) => {
    const response = await api.post(`/admin/classes/${classId}/subjects`, subjectData)
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