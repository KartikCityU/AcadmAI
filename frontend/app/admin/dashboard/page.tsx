'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Shield, 
  Plus,
  Eye,
  Edit,
  ChevronRight,
  GraduationCap,
  School,
  TrendingUp
} from 'lucide-react'
import { useAdminStore } from '@/lib/stores/adminStore'
import { adminApi } from '@/lib/api/admin'

interface DashboardStats {
  totalSubjects: number
  totalStudents: number
  totalQuestions: number
  activeEnrollments: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const { admin, logout, hasPermission } = useAdminStore()
  const [stats, setStats] = useState<DashboardStats>({
    totalSubjects: 0,
    totalStudents: 0,
    totalQuestions: 0,
    activeEnrollments: 0
  })
  const [recentSubjects, setRecentSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!admin) {
      router.push('/admin/login')
      return
    }
    
    fetchDashboardData()
  }, [admin, router])

  const fetchDashboardData = async () => {
    try {
      // Fetch subjects to get basic stats
      const subjectsResponse = await adminApi.getSubjects()
      const subjects = subjectsResponse.data || []
      
      // Calculate basic stats from subjects
      setStats({
        totalSubjects: subjects.length,
        totalStudents: subjects.reduce((sum: number, subject: any) => sum + (subject._count?.enrollments || 0), 0),
        totalQuestions: subjects.reduce((sum: number, subject: any) => sum + (subject._count?.questions || 0), 0),
        activeEnrollments: subjects.reduce((sum: number, subject: any) => sum + (subject._count?.enrollments || 0), 0)
      })
      
      // Set recent subjects (first 5)
      setRecentSubjects(subjects.slice(0, 5))
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EduPractice Admin
                </h1>
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
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {admin.name.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your educational platform today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalSubjects}</h3>
                <p className="text-sm text-gray-600 font-medium">Total Subjects</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.activeEnrollments}</h3>
                <p className="text-sm text-gray-600 font-medium">Active Enrollments</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</h3>
                <p className="text-sm text-gray-600 font-medium">Total Questions</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">85%</h3>
                <p className="text-sm text-gray-600 font-medium">Avg Performance</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="space-y-4">
              {hasPermission('manage_subjects') && (
                <button
                  onClick={() => router.push('/admin/subjects')}
                  className="w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-4 hover:shadow-xl transition-all duration-300 flex items-center space-x-4 group"
                >
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-gray-900">Create Subject</h4>
                    <p className="text-sm text-gray-600">Add new subjects for students</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </button>
              )}

              {hasPermission('manage_enrollments') && (
                <button
                  onClick={() => router.push('/admin/enrollments')}
                  className="w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-4 hover:shadow-xl transition-all duration-300 flex items-center space-x-4 group"
                >
                  <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-gray-900">Enroll Students</h4>
                    <p className="text-sm text-gray-600">Assign subjects to students</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </button>
              )}

              <button
                onClick={() => router.push('/admin/subjects')}
                className="w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-4 hover:shadow-xl transition-all duration-300 flex items-center space-x-4 group"
              >
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gray-900">View Subjects</h4>
                  <p className="text-sm text-gray-600">Manage existing subjects</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* Recent Subjects */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Recent Subjects</h3>
              <button
                onClick={() => router.push('/admin/subjects')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : recentSubjects.length === 0 ? (
                <div className="text-center py-8">
                  <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No subjects created yet</p>
                  {hasPermission('manage_subjects') && (
                    <button
                      onClick={() => router.push('/admin/subjects')}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                    >
                      Create Your First Subject
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSubjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50/80 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${subject.color} rounded-xl flex items-center justify-center text-white text-xl shadow-lg`}>
                          {subject.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{subject.name}</h4>
                          <p className="text-sm text-gray-600">{subject.grade} • {subject.board}</p>
                          <p className="text-xs text-gray-500">
                            {subject._count?.questions || 0} questions • {subject._count?.enrollments || 0} students
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/admin/subjects/${subject.id}`)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {hasPermission('manage_subjects') && (
                          <button
                            onClick={() => router.push(`/admin/subjects/${subject.id}/edit`)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                            title="Edit Subject"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}