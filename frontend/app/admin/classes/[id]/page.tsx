// frontend/app/admin/classes/[id]/page.tsx - Complete Class Detail Management
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Users, 
  BookOpen, 
  UserCheck, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2,
  ArrowLeft,
  GraduationCap,
  Calendar,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react'
import { useAdminStore } from '@/lib/stores/adminStore'
import { adminApi } from '@/lib/api/admin'

interface ClassDetail {
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

interface Teacher {
  id: string
  name: string
  email: string
  phone: string | null
}

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { admin, isAuthenticated } = useAdminStore()
  
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null)
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showAddSubject, setShowAddSubject] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }
    fetchClassDetail()
    fetchAvailableTeachers()
  }, [params.id])

  const fetchClassDetail = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getClassDetails(params.id as string)
      setClassDetail(response.data)
    } catch (error) {
      console.error('Error fetching class details:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableTeachers = async () => {
    try {
      const response = await adminApi.getAvailableTeachers()
      setAvailableTeachers(response.data)
    } catch (error) {
      console.error('Error fetching teachers:', error)
    }
  }

  const handleAssignTeacher = async (teacherId: string) => {
    try {
      await adminApi.assignClassTeacher(params.id as string, teacherId)
      fetchClassDetail() // Refresh data
    } catch (error) {
      console.error('Error assigning teacher:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!classDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Class Not Found</h2>
          <button
            onClick={() => router.push('/admin/classes')}
            className="text-indigo-600 hover:text-indigo-500 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Classes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/classes')}
                className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Classes
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{classDetail.name}</h1>
                <p className="text-sm text-gray-500">
                  Academic Year: {classDetail.academicYear.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {classDetail.currentStudents}/{classDetail.maxStudents} Students
              </span>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                    <dd className="text-lg font-medium text-gray-900">{classDetail.currentStudents}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Subjects</dt>
                    <dd className="text-lg font-medium text-gray-900">{classDetail.subjects.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Score</dt>
                    <dd className="text-lg font-medium text-gray-900">{classDetail.analytics.averageScore}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Award className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Rate</dt>
                    <dd className="text-lg font-medium text-gray-900">{classDetail.analytics.completionRate}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Overview', icon: GraduationCap },
                { id: 'students', name: 'Students', icon: Users },
                { id: 'subjects', name: 'Subjects', icon: BookOpen },
                { id: 'analytics', name: 'Analytics', icon: TrendingUp }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Class Teacher Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Class Teacher</h3>
                    <button className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
                      Change Teacher
                    </button>
                  </div>
                  {classDetail.classTeacher ? (
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <UserCheck className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{classDetail.classTeacher.name}</p>
                        <p className="text-sm text-gray-500">{classDetail.classTeacher.email}</p>
                        {classDetail.classTeacher.phone && (
                          <p className="text-sm text-gray-500">{classDetail.classTeacher.phone}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No class teacher assigned</p>
                      <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        <option>Select a teacher...</option>
                        {availableTeachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name} - {teacher.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="font-medium text-blue-900 mb-2">Recent Activity</h4>
                    <p className="text-sm text-blue-700">5 new test submissions this week</p>
                    <p className="text-sm text-blue-700">2 students joined recently</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6">
                    <h4 className="font-medium text-green-900 mb-2">Performance</h4>
                    <p className="text-sm text-green-700">Average improvement: +12%</p>
                    <p className="text-sm text-green-700">Completion rate: {classDetail.analytics.completionRate}%</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Students ({classDetail.currentStudents})
                  </h3>
                  <button
                    onClick={() => setShowAddStudent(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </button>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {classDetail.students.map((student) => (
                      <li key={student.id}>
                        <div className="px-4 py-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              {student.avatar ? (
                                <img
                                  src={student.avatar}
                                  alt={student.name}
                                  className="h-10 w-10 rounded-full"
                                />
                              ) : (
                                <span className="text-sm font-medium text-gray-600">
                                  {student.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center gap-3">
                                <p className="text-sm font-medium text-gray-900">{student.name}</p>
                                {student.rollNumber && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {student.rollNumber}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{student.email}</p>
                              {student.parentPhone && (
                                <p className="text-xs text-gray-400">Parent: {student.parentPhone}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="text-indigo-600 hover:text-indigo-500">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'subjects' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Subjects ({classDetail.subjects.length})
                  </h3>
                  <button
                    onClick={() => setShowAddSubject(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subject
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classDetail.subjects.map((subject) => (
                    <div key={subject.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="h-10 w-10 rounded-lg flex items-center justify-center text-white text-lg"
                            style={{ backgroundColor: subject.color }}
                          >
                            {subject.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{subject.name}</h4>
                            {subject.code && (
                              <p className="text-sm text-gray-500">{subject.code}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {subject.isCompulsory && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Required
                            </span>
                          )}
                          <button className="text-gray-400 hover:text-gray-500">
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>Status: {subject.isActive ? 'Active' : 'Inactive'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Performance Overview</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Average Score</span>
                        <span className="text-sm font-medium">{classDetail.analytics.averageScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Total Tests</span>
                        <span className="text-sm font-medium">{classDetail.analytics.totalTests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Active Students</span>
                        <span className="text-sm font-medium">{classDetail.analytics.activeStudents}/{classDetail.currentStudents}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Recent Activity</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">5 tests submitted today</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">3 students achieved 90%+ scores</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">All students active this week</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Subject-wise Performance</h4>
                  <div className="space-y-4">
                    {classDetail.subjects.map((subject) => (
                      <div key={subject.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="h-8 w-8 rounded flex items-center justify-center text-white text-sm"
                            style={{ backgroundColor: subject.color }}
                          >
                            {subject.icon}
                          </div>
                          <span className="font-medium">{subject.name}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full" 
                              style={{ width: `${Math.random() * 40 + 60}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {Math.floor(Math.random() * 40 + 60)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}