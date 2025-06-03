'use client'

import { useState, useEffect } from 'react'
import { X, User, Mail, Phone, Hash, AlertCircle, CheckCircle, Users, Eye, EyeOff } from 'lucide-react'
import { adminApi } from '@/lib/api/admin'

interface AddStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  classId: string
  className: string
  currentStudentCount: number
  maxStudents: number
}

interface StudentFormData {
  name: string
  email: string
  password: string
  rollNumber: string
  parentPhone: string
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  rollNumber?: string
  parentPhone?: string
  general?: string
}

export default function AddStudentModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  classId, 
  className, 
  currentStudentCount, 
  maxStudents 
}: AddStudentModalProps) {
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    parentPhone: ''
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [showPassword, setShowPassword] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Generate suggested roll number
      const suggestedRollNumber = String(currentStudentCount + 1).padStart(2, '0')
      
      setFormData({
        name: '',
        email: '',
        password: 'student123', // Default password
        rollNumber: suggestedRollNumber,
        parentPhone: ''
      })
      setErrors({})
      setSubmitStatus('idle')
    }
  }, [isOpen, currentStudentCount])

  // Auto-generate email when name changes
  useEffect(() => {
    if (formData.name) {
      const nameParts = formData.name.toLowerCase().split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts[1] || ''
      const emailSuggestion = lastName 
        ? `${firstName}.${lastName}@student.com`
        : `${firstName}@student.com`
      
      setFormData(prev => ({ ...prev, email: emailSuggestion }))
    }
  }, [formData.name])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Student name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'Name can only contain letters and spaces'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // Roll number validation
    if (!formData.rollNumber.trim()) {
      newErrors.rollNumber = 'Roll number is required'
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.rollNumber.trim())) {
      newErrors.rollNumber = 'Roll number can only contain letters and numbers'
    }

    // Parent phone validation (optional but if provided, must be valid)
    if (formData.parentPhone.trim() && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.parentPhone.trim())) {
      newErrors.parentPhone = 'Please enter a valid phone number'
    }

    // Check capacity
    if (currentStudentCount >= maxStudents) {
      newErrors.general = `Class is at full capacity (${maxStudents} students)`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setSubmitStatus('idle')
      
      console.log('🔍 Adding student to class:', classId, 'with data:', formData)
      
      const studentData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        rollNumber: formData.rollNumber.trim(),
        ...(formData.parentPhone.trim() && { parentPhone: formData.parentPhone.trim() })
      }

      const response = await adminApi.addStudentToClass(classId, studentData)
      console.log('✅ Student added successfully:', response)
      
      setSubmitStatus('success')
      
      // Close modal after short delay to show success
      setTimeout(() => {
        onClose()
        onSuccess()
      }, 1500)
      
    } catch (error) {
      console.error('❌ Error adding student:', error)
      setSubmitStatus('error')
      
      // Handle specific error messages
      if (error instanceof Error) {
        if (error.message.includes('email already exists') || error.message.includes('already registered')) {
          setErrors({ email: 'A student with this email already exists' })
        } else if (error.message.includes('roll number') && error.message.includes('exists')) {
          setErrors({ rollNumber: 'This roll number is already taken in this class' })
        } else if (error.message.includes('capacity') || error.message.includes('full')) {
          setErrors({ general: 'Class has reached maximum capacity' })
        } else {
          setErrors({ general: error.message || 'Failed to add student' })
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }))
    }
  }

  const generateRandomPassword = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let password = ''
    for (let i = 0; i < 8; i++) {
      password += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    setFormData(prev => ({ ...prev, password }))
  }

  if (!isOpen) return null

  const isAtCapacity = currentStudentCount >= maxStudents

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add Student</h2>
              <p className="text-sm text-gray-600">Add a new student to {className}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Capacity Warning */}
        {isAtCapacity && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-red-800 font-medium">Class at Full Capacity</p>
                <p className="text-red-700 text-sm">
                  This class has {currentStudentCount} of {maxStudents} students. Cannot add more students.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Capacity Info */}
        {!isAtCapacity && (
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-blue-800 font-medium">Class Capacity</p>
                  <p className="text-blue-700 text-sm">
                    {currentStudentCount} of {maxStudents} students ({maxStudents - currentStudentCount} spots remaining)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="w-24 bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStudentCount / maxStudents) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success/Error Status */}
          {submitStatus === 'success' && (
            <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Student added successfully!</span>
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">
                {errors.general || 'Failed to add student. Please try again.'}
              </span>
            </div>
          )}

          {/* Student Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter student's full name"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading || isAtCapacity}
              />
            </div>
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="student@example.com"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading || isAtCapacity}
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Auto-generated from name, but you can customize it
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter password"
                className={`w-full pl-3 pr-24 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading || isAtCapacity}
              />
              <div className="absolute right-3 top-2.5 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={loading || isAtCapacity}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  disabled={loading || isAtCapacity}
                >
                  Generate
                </button>
              </div>
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Roll Number and Parent Phone Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Roll Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roll Number *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.rollNumber}
                  onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                  placeholder="01"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.rollNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={loading || isAtCapacity}
                />
              </div>
              {errors.rollNumber && (
                <p className="text-red-600 text-sm mt-1">{errors.rollNumber}</p>
              )}
            </div>

            {/* Parent Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Phone (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.parentPhone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={loading || isAtCapacity}
                />
              </div>
              {errors.parentPhone && (
                <p className="text-red-600 text-sm mt-1">{errors.parentPhone}</p>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || submitStatus === 'success' || isAtCapacity}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 focus:ring-4 focus:ring-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : submitStatus === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  <span>Add Student</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}