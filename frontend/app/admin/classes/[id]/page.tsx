'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { 
  Shield, 
  ArrowLeft,
  Users, 
  BookOpen, 
  User, 
  Edit, 
  Plus,
  Mail,
  Phone,
  Calendar,
  School,
  Settings,
  LogOut,
  ChevronRight,
  Star,
  TrendingUp,
  Award,
  Clock,
  Eye
} from 'lucide-react'
import { useAdminStore } from '@/lib/stores/adminStore'
import { adminApi } from '@/lib/api/admin'
import AddStudentModal from '@/components/admin/AddStudentModal'
import AssignTeacherModal from '@/components/admin/AssignTeacherModal'
import AddSubjectModal from '@/components/admin/AddSubjectModal'
import StudentDetailModal from '@/components/admin/StudentDetailModal'

interface ClassDetailData {
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
  students: Array<{
    id: string
    name: string
    email: string
    rollNumber: string | null
    parentPhone: string | null
    createdAt: string
  }>
  subjects: Array<{
    id: string
    name: string
    code: string | null
    icon: string
    color: string
    description?: string
    isCompulsory: boolean
    isActive: boolean
    subjectTeachers: Array<{
      teacher: {
        name: string
        email: string
      }
    }>
  }>
  _count: {
    students: number
    subjects: number
    subjectTeachers: number
  }
}

export default function ClassDetailPage() {
  const router = useRouter()
  const params = useParams()
  const classId = params?.id as string
  const { admin, logout, hasPermission } = useAdminStore()
  
  const [classData, setClassData] = useState<ClassDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'subjects' | 'analytics'>('overview')
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false)
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false)
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')

  useEffect(() => {
    if (!admin) {
      router.push('/admin/login')
      return
    }
    
    if (classId) {
      fetchClassDetails()
    }
  }, [admin, router, classId])

  // Debug log to see classData changes
  useEffect(() => {
    console.log('🔍 ClassData state changed:', classData)
    console.log('🔍 ClassData type:', typeof classData)
    console.log('🔍 ClassData is null:', classData === null)
  }, [classData])

  const fetchClassDetails = async () => {
    try {
      console.log('🔍 Starting fetchClassDetails')
      console.log('🔍 Class ID from params:', classId)
      
      if (!classId) {
        console.error('❌ No class ID found in params')
        setLoading(false)
        return
      }
      
      console.log('🔍 Making API call to getClassDetails with ID:', classId)
      const response = await adminApi.getClassDetails(classId)
      
      console.log('✅ Class details response received:', response)
      console.log('✅ Response.data:', response.data)
      console.log('✅ Setting classData to:', response.data)
      
      // The response.data should contain the class information
      if (response && response.data) {
        setClassData(response.data)
        console.log('✅ Class data set successfully')
      } else {
        console.error('❌ No data in response')
        setClassData(null)
      }
      
    } catch (error) {
      console.error('❌ Error in fetchClassDetails:', error)
      setClassData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudentSuccess = () => {
    // Refresh class details to show the new student
    fetchClassDetails()
    setShowAddStudentModal(false)
  }

  const handleAssignTeacherSuccess = () => {
    // Refresh class details to show the updated teacher
    fetchClassDetails()
    setShowAssignTeacherModal(false)
  }

  const handleAddSubjectSuccess = () => {
    // Refresh class details to show the new subject
    fetchClassDetails()
    setShowAddSubjectModal(false)
  }

  const handleStudentClick = (studentId: string) => {
    setSelectedStudentId(studentId)
    setShowStudentDetailModal(true)
  }

  const handleStudentDetailSuccess = () => {
    // Refresh class details if student was updated
    fetchClassDetails()
  }

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading class details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Class Not Found</h3>
            <p className="text-gray-600 mb-6">The requested class could not be found.</p>
            <button
              onClick={() => router.push('/admin/classes')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Classes
            </button>
          </div>
        </div>
      </div>
    )
  }

  const capacityPercentage = (classData._count.students / classData.maxStudents) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/classes')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Classes</span>
              </button>
              <div className="text-gray-300">•</div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {classData.name}
                  </h1>
                  <p className="text-sm text-gray-600">Grade {classData.grade} • {classData.academicYear.name}</p>
                </div>
              </div>
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
        {/* Class Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Students Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-gray-500">Students</span>
            </div>
            <div className="mb-2">
              <p className="text-2xl font-bold text-gray-900">{classData._count.students}</p>
              <p className="text-sm text-gray-600">of {classData.maxStudents} capacity</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Subjects Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs text-gray-500">Subjects</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">{classData._count.subjects}</p>
            <p className="text-sm text-gray-600">Active subjects</p>
          </div>

          {/* Teachers Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs text-gray-500">Teachers</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">{classData._count.subjectTeachers}</p>
            <p className="text-sm text-gray-600">Subject teachers</p>
          </div>

          {/* Class Teacher Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs text-gray-500">Class Teacher</span>
            </div>
            {classData.classTeacher ? (
              <div>
                <p className="text-sm font-semibold text-gray-900">{classData.classTeacher.name}</p>
                <p className="text-xs text-gray-600">{classData.classTeacher.email}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Not assigned</p>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 mb-8">
          <div className="flex space-x-1 p-1">
            {[
              { id: 'overview', label: 'Overview', icon: School },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'subjects', label: 'Subjects', icon: BookOpen },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Class Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Grade</p>
                  <p className="font-medium text-gray-900">{classData.grade}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Section</p>
                  <p className="font-medium text-gray-900">{classData.section || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Academic Year</p>
                  <p className="font-medium text-gray-900">{classData.academicYear.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Capacity</p>
                  <p className="font-medium text-gray-900">{classData.maxStudents} students</p>
                </div>
              </div>
            </div>

            {/* Class Teacher Section - UPDATED */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Class Teacher</h3>
                {hasPermission('manage_subjects') && (
                  <button 
                    onClick={() => setShowAssignTeacherModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{classData.classTeacher ? 'Change Teacher' : 'Assign Teacher'}</span>
                  </button>
                )}
              </div>
              
              {classData.classTeacher ? (
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{classData.classTeacher.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>{classData.classTeacher.email}</span>
                      </div>
                      {classData.classTeacher.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{classData.classTeacher.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Class Teacher Assigned</h4>
                  <p className="text-gray-600 mb-4">Assign a teacher to manage this class</p>
                  {hasPermission('manage_subjects') && (
                    <button 
                      onClick={() => setShowAssignTeacherModal(true)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Assign Teacher
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 text-center">
                <Award className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-gray-900">85%</p>
                <p className="text-sm text-gray-600">Average Performance</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 text-center">
                <Clock className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-gray-900">92%</p>
                <p className="text-sm text-gray-600">Attendance Rate</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 text-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-gray-900">+12%</p>
                <p className="text-sm text-gray-600">Growth This Month</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Students ({classData.students.length})</h3>
              {hasPermission('manage_subjects') && (
                <button 
                  onClick={() => setShowAddStudentModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Student</span>
                </button>
              )}
            </div>

            {classData.students.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Students Enrolled</h4>
                <p className="text-gray-600 mb-6">Start by adding students to this class</p>
                {hasPermission('manage_subjects') && (
                  <button 
                    onClick={() => setShowAddStudentModal(true)}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add First Student
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {classData.students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{student.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{student.email}</span>
                          {student.rollNumber && <span>Roll: {student.rollNumber}</span>}
                          {student.parentPhone && (
                            <span className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>{student.parentPhone}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Joined {new Date(student.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleStudentClick(student.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="View student details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {hasPermission('manage_subjects') && (
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all">
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Subjects ({classData.subjects.length})</h3>
              {hasPermission('manage_subjects') && (
                <button 
                  onClick={() => setShowAddSubjectModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Subject</span>
                </button>
              )}
            </div>

            {classData.subjects.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Subjects Added</h4>
                <p className="text-gray-600 mb-6">Add subjects to start teaching this class</p>
                {hasPermission('manage_subjects') && (
                  <button 
                    onClick={() => setShowAddSubjectModal(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add First Subject
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classData.subjects.map((subject) => (
                  <div key={subject.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-lg shadow-sm"
                          style={{ backgroundColor: subject.color }}
                        >
                          {subject.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{subject.name}</h4>
                          {subject.code && <p className="text-xs text-gray-600 font-mono">{subject.code}</p>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {subject.isCompulsory && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                            Compulsory
                          </span>
                        )}
                        {hasPermission('manage_subjects') && (
                          <button className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Subject Description */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {subject.description || 'No description available'}
                    </p>
                    
                    {/* Subject Teachers */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Teachers</span>
                        {hasPermission('manage_subjects') && (
                          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                            + Assign
                          </button>
                        )}
                      </div>
                      {subject.subjectTeachers.length > 0 ? (
                        <div className="space-y-1">
                          {subject.subjectTeachers.map((st, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                              <User className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{st.teacher.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No teacher assigned</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Class Analytics</h3>
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h4>
              <p className="text-gray-600">Detailed performance analytics will be available here</p>
            </div>
          </div>
        )}
      </main>

      {/* Add Student Modal */}
      {classData && (
        <AddStudentModal
          isOpen={showAddStudentModal}
          onClose={() => setShowAddStudentModal(false)}
          onSuccess={handleAddStudentSuccess}
          classId={classData.id}
          className={classData.name}
          currentStudentCount={classData._count.students}
          maxStudents={classData.maxStudents}
        />
      )}

      {/* Assign Teacher Modal */}
      {classData && (
        <AssignTeacherModal
          isOpen={showAssignTeacherModal}
          onClose={() => setShowAssignTeacherModal(false)}
          classId={classData.id}
          className={classData.name}
          currentTeacher={classData.classTeacher}
          onSuccess={handleAssignTeacherSuccess}
        />
      )}

      {/* Add Subject Modal */}
      {classData && (
        <AddSubjectModal
          isOpen={showAddSubjectModal}
          onClose={() => setShowAddSubjectModal(false)}
          classId={classData.id}
          className={classData.name}
          onSuccess={handleAddSubjectSuccess}
        />
      )}

      {/* Student Detail Modal */}
      {selectedStudentId && (
        <StudentDetailModal
          isOpen={showStudentDetailModal}
          onClose={() => {
            setShowStudentDetailModal(false)
            setSelectedStudentId('')
          }}
          studentId={selectedStudentId}
          onSuccess={handleStudentDetailSuccess}
        />
      )}
    </div>
  )
}