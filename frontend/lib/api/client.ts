// frontend/lib/api/client.ts - Complete Corrected Version with Route-Aware Token Logic
import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token (route-aware)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check if this is an admin route
    const isAdminRoute = config.url?.includes('/admin/')
    
    if (isAdminRoute) {
      // For admin routes, check admin token first
      const adminToken = localStorage.getItem('edupractice-admin')
      if (adminToken) {
        try {
          const parsedAdminData = JSON.parse(adminToken)
          if (parsedAdminData?.state?.token) {
            config.headers.Authorization = `Bearer ${parsedAdminData.state.token}`
            return config
          }
        } catch (e) {
          console.error('Error parsing admin auth token:', e)
        }
      }
    } else {
      // For student routes, check student token first
      const studentToken = localStorage.getItem('edu_auth_token')
      if (studentToken) {
        try {
          const parsedData = JSON.parse(studentToken)
          if (parsedData?.state?.token) {
            config.headers.Authorization = `Bearer ${parsedData.state.token}`
            return config
          }
        } catch (e) {
          console.error('Error parsing student auth token:', e)
        }
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const { response } = error

    // Handle authentication errors
    if (response?.status === 401) {
      // Check if this is an admin route
      const isAdminRoute = error.config?.url?.includes('/admin/')
      
      if (isAdminRoute) {
        // Clear admin token and redirect to admin login
        localStorage.removeItem('edupractice-admin')
        window.location.href = '/admin/login'
      } else {
        // Clear student token and redirect to student login
        localStorage.removeItem('edu_auth_token')
        window.location.href = '/login'
      }
      
      return Promise.reject(new Error('Session expired. Please log in again.'))
    }

    // Handle network errors
    if (!response) {
      return Promise.reject(new Error('Network error. Please check your connection.'))
    }

    // Handle server errors
    if (response.status >= 500) {
      return Promise.reject(new Error('Server error. Please try again later.'))
    }

    // Handle validation errors
    if (response.status === 400) {
      const errorMessage = (response.data as any)?.message || 'Invalid request'
      return Promise.reject(new Error(errorMessage))
    }

    // Handle forbidden errors (permissions)
    if (response.status === 403) {
      const errorMessage = (response.data as any)?.message || 'Access denied. Insufficient permissions.'
      return Promise.reject(new Error(errorMessage))
    }

    return Promise.reject(error)
  }
)

// API response wrapper
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data: T
}

// Generic API methods
export const api = {
  get: <T>(url: string): Promise<ApiResponse<T>> =>
    apiClient.get(url).then((response) => response.data),

  post: <T>(url: string, data?: any): Promise<ApiResponse<T>> =>
    apiClient.post(url, data).then((response) => response.data),

  put: <T>(url: string, data?: any): Promise<ApiResponse<T>> =>
    apiClient.put(url, data).then((response) => response.data),

  patch: <T>(url: string, data?: any): Promise<ApiResponse<T>> =>
    apiClient.patch(url, data).then((response) => response.data),

  delete: <T>(url: string): Promise<ApiResponse<T>> =>
    apiClient.delete(url, data).then((response) => response.data),
}

// Helper functions for token management
export const getActiveUserType = (): 'student' | 'admin' | null => {
  const studentToken = localStorage.getItem('edu_auth_token')
  const adminToken = localStorage.getItem('edupractice-admin')
  
  if (studentToken) {
    try {
      const parsedData = JSON.parse(studentToken)
      if (parsedData?.state?.token) return 'student'
    } catch (e) {
      // Invalid student token
    }
  }
  
  if (adminToken) {
    try {
      const parsedData = JSON.parse(adminToken)
      if (parsedData?.state?.token) return 'admin'
    } catch (e) {
      // Invalid admin token
    }
  }
  
  return null
}

export const clearAllTokens = () => {
  localStorage.removeItem('edu_auth_token')
  localStorage.removeItem('edupractice-admin')
}

export default apiClient