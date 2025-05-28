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
  LogOut
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
      
      // Call the API with proper parameters
      const response = await adminApi.getClasses({ 
        grade: selectedGrade || undefined 
      })
      
      console.log('✅ Full API response:', JSON.stringify(response, null, 2))
      console.log('✅ Response type:', typeof response)
      console.log('✅ Response keys:', Object.keys(response))
      
      // Try different ways to access the data
      console.log('✅ response.data:', response.data)
      console.log('✅ response.data type:', typeof response.data)
      console.log('✅ response.data is array:', Array.isArray(response.data))
      
      if (response.data && Array.isArray(response.data)) {
        console.log('✅ Setting classes from response.data:', response.data.length, 'items')
        setClasses(response.data)
      } else if (Array.isArray(response)) {
        console.log('✅ Setting classes from response directly:', response.length, 'items')
        setClasses(response)
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
  
  // Also add this to see the current state:
  console.log('🔍 Current classes state:', classes)
  console.log('🔍 Classes length:', classes.length)
  console.log('🔍 Loading state:', loading)

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

        {/* Create Class Modal Placeholder */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Class</h3>
              <p className="text-gray-600 mb-4">
                Class creation form will be implemented next...
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}