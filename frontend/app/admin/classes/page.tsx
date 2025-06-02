'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  Users, 
  BookOpen, 
  User, 
  Edit, 
  Eye,
  ChevronDown,
  Calendar,
  School,
  Settings,
  LogOut,
  X,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useAdminStore } from '@/lib/stores/adminStore'
import { adminApi } from '@/lib/api/admin'

interface ClassData {
  id: string
  name: string
  grade: string
  section: string | null
  maxStudents: number
  isActive: boolean
  academicYear: {
    name: string
    isActive: boolean
  }
  classTeacher: {
    id: string
    name: string
    email: string
    phone: string | null
  } | null
  _count: {
    students: number
    subjects: number
    subjectTeachers: number
  }
}

interface Teacher {
  id: string
  name: string
  email: string
  phone: string | null
  primaryClass?: {
    id: string
    name: string
  } | null
}

interface FormData {
  name: string
  grade: string
  section: string
  maxStudents: number
  classTeacherId: string
}

interface FormErrors {
  name?: string
  grade?: string
  section?: string
  maxStudents?: string
  classTeacherId?: string
}

// Create Class Modal Component
function CreateClassModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void 
}) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    grade: '',
    section: '',
    maxStudents: 40,
    classTeacherId: ''
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(false)
  const [teachersLoading, setTeachersLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Fetch available teachers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableTeachers()
      // Reset form when modal opens
      setFormData({
        name: '',
        grade: '',
        section: '',
        maxStudents: 40,
        classTeacherId: ''
      })
      setErrors({})
      setSubmitStatus('idle')
    }
  }, [isOpen])

  // Auto-generate class name when grade/section changes
  useEffect(() => {
    if (formData.grade && formData.section) {
      const generatedName = `Grade ${formData.grade}-${formData.section}`
      setFormData(prev => ({ ...prev, name: generatedName }))
    }
  }, [formData.grade, formData.section])

  const fetchAvailableTeachers = async () => {
    try {
      setTeachersLoading(true)
      console.log('🔍 Fetching available teachers...')
      const response = await adminApi.getAvailableTeachers()
      console.log('✅ Available teachers:', response.data)
      setAvailableTeachers(response.data || [])
    } catch (error) {
      console.error('❌ Error fetching teachers:', error)
      setAvailableTeachers([])
    } finally {
      setTeachersLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Class name is required'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Class name must be at least 3 characters'
    }

    // Grade validation
    if (!formData.grade.trim()) {
      newErrors.grade = 'Grade is required'
    } else if (!/^(9|10|11|12)$/.test(formData.grade.trim())) {
      newErrors.grade = 'Grade must be 9, 10, 11, or 12'
    }

    // Section validation
    if (!formData.section.trim()) {
      newErrors.section = 'Section is required'
    } else if (formData.section.trim().length > 20) {
      newErrors.section = 'Section must be less than 20 characters'
    }

    // Max students validation
    if (formData.maxStudents < 1) {
      newErrors.maxStudents = 'Capacity must be at least 1'
    } else if (formData.maxStudents > 100) {
      newErrors.maxStudents = 'Capacity cannot exceed 100'
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
      
      console.log('🔍 Creating class with data:', formData)
      
      const createData = {
        name: formData.name.trim(),
        grade: formData.grade.trim(),
        section: formData.section.trim(),
        maxStudents: formData.maxStudents,
        ...(formData.classTeacherId && { classTeacherId: formData.classTeacherId })
      }

      const response = await adminApi.createClass(createData)
      console.log('✅ Class created successfully:', response)
      
      setSubmitStatus('success')
      
      // Close modal after short delay to show success
      setTimeout(() => {
        onClose()
        onSuccess()
      }, 1500)
      
    } catch (error) {
      console.error('❌ Error creating class:', error)
      setSubmitStatus('error')
      
      // Handle specific error messages
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          setErrors({ name: 'A class with this name already exists' })
        } else if (error.message.includes('teacher is already assigned')) {
          setErrors({ classTeacherId: 'This teacher is already assigned to another class' })
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New Class</h2>
              <p className="text-sm text-gray-600">Add a new class to the academic year</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success/Error Status */}
          {submitStatus === 'success' && (
            <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Class created successfully!</span>
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">Failed to create class. Please try again.</span>
            </div>
          )}

          {/* Grade and Section Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade *
              </label>
              <select
                value={formData.grade}
                onChange={(e) => handleInputChange('grade', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.grade ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">Select Grade</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
              {errors.grade && (
                <p className="text-red-600 text-sm mt-1">{errors.grade}</p>
              )}
            </div>

            {/* Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section *
              </label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => handleInputChange('section', e.target.value)}
                placeholder="e.g., A, B, Science, Commerce"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.section ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.section && (
                <p className="text-red-600 text-sm mt-1">{errors.section}</p>
              )}
            </div>
          </div>

          {/* Class Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Grade 10-A"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Auto-generated from grade and section, but you can customize it
            </p>
          </div>

          {/* Max Students */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Students *
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={formData.maxStudents}
                onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value) || 0)}
                min="1"
                max="100"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.maxStudents ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              />
            </div>
            {errors.maxStudents && (
              <p className="text-red-600 text-sm mt-1">{errors.maxStudents}</p>
            )}
          </div>

          {/* Class Teacher */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Teacher (Optional)
            </label>
            {teachersLoading ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
                <span className="text-gray-600">Loading teachers...</span>
              </div>
            ) : (
              <select
                value={formData.classTeacherId}
                onChange={(e) => handleInputChange('classTeacherId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.classTeacherId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">Select a teacher (optional)</option>
                {availableTeachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} - {teacher.email}
                    {teacher.primaryClass && ` (Currently: ${teacher.primaryClass.name})`}
                  </option>
                ))}
              </select>
            )}
            {errors.classTeacherId && (
              <p className="text-red-600 text-sm mt-1">{errors.classTeacherId}</p>
            )}
            {availableTeachers.length === 0 && !teachersLoading && (
              <p className="text-gray-500 text-sm mt-1">
                No available teachers found. You can assign a teacher later.
              </p>
            )}
          </div>

          {/* Academic Year Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-blue-800 font-medium">Academic Year: 2024-25</span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              This class will be created for the current academic year
            </p>
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
              disabled={loading || submitStatus === 'success'}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : submitStatus === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Created!</span>
                </>
              ) : (
                <>
                  <School className="w-4 h-4" />
                  <span>Create Class</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Main Classes Component
export default function AdminClasses() {
  const router = useRouter()
  const { admin, logout, hasPermission } = useAdminStore()
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (!admin) {
      router.push('/admin/login')
      return
    }
    
    fetchClasses()
  }, [admin, router])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching classes with grade:', selectedGrade)
      
      const response = await adminApi.getClasses({ 
        grade: selectedGrade || undefined 
      })
      
      console.log('✅ Classes API response:', response)
      
      if (response.data && Array.isArray(response.data)) {
        console.log('✅ Setting classes from response.data:', response.data.length, 'items')
        setClasses(response.data)
      } else {
        console.log('❌ Could not find classes array in response')
        setClasses([])
      }
      
    } catch (error) {
      console.error('❌ Error fetching classes:', error)
      setClasses([])
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.grade.includes(searchTerm) ||
    cls.classTeacher?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const uniqueGrades = [...new Set(classes.map(cls => cls.grade))].sort()

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    EduPractice Admin
                  </h1>
                </div>
              </button>
              <div className="text-gray-300">•</div>
              <h2 className="text-lg font-semibold text-gray-700">Class Management</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{admin.role.replace('_', ' ')}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
            <p className="text-gray-600 mt-1">Manage classes, teachers, and student assignments</p>
          </div>
          
          {hasPermission('manage_subjects') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Class</span>
            </button>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search classes, grades, or teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Grade Filter */}
            <div className="relative">
              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value)
                  fetchClasses()
                }}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Grades</option>
                {uniqueGrades.map(grade => (
                  <option key={grade} value={grade}>Grade {grade}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Academic Year Badge */}
            <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Academic Year 2024-25</span>
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-12 text-center">
            <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Classes Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedGrade ? 'Try adjusting your search criteria' : 'Get started by creating your first class'}
            </p>
            {hasPermission('manage_subjects') && !searchTerm && !selectedGrade && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Create First Class
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((classItem) => (
              <div
                key={classItem.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 group"
              >
                {/* Class Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {classItem.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Grade {classItem.grade} • {classItem.academicYear.name}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push(`/admin/classes/${classItem.id}`)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {hasPermission('manage_subjects') && (
                      <button
                        onClick={() => router.push(`/admin/classes/${classItem.id}/edit`)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        title="Edit Class"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Class Teacher */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {classItem.classTeacher?.name || 'No Class Teacher'}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {classItem.classTeacher?.email || 'Teacher not assigned'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-1">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{classItem._count.students}</p>
                    <p className="text-xs text-gray-600">Students</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-1">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{classItem._count.subjects}</p>
                    <p className="text-xs text-gray-600">Subjects</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mx-auto mb-1">
                      <User className="w-4 h-4 text-orange-600" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{classItem._count.subjectTeachers}</p>
                    <p className="text-xs text-gray-600">Teachers</p>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Capacity</span>
                    <span className="text-xs text-gray-600">
                      {classItem._count.students}/{classItem.maxStudents}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min((classItem._count.students / classItem.maxStudents) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => router.push(`/admin/classes/${classItem.id}`)}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Create Class Modal */}
        <CreateClassModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            // Refresh the classes list after successful creation
            fetchClasses()
          }}
        />
      </main>
    </div>
  )
}