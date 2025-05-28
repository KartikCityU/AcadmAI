'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BookOpen, User, Award, TrendingUp, Settings, LogOut, Target, Brain, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/authStore'
import { api } from '@/lib/api/client'

interface UserStats {
  activeSubjects: number
  averageScore: number
  weeklyImprovement: number
  totalTests: number
  recentActivity: Array<{
    id: string
    subject: string
    activity: string
    score: number
    time: string
    icon: string
  }>
  userProgress: Array<{
    subject: {
      id: string
      name: string
      icon: string
      color: string
    }
    progress: number
    completedQuestions: number
    totalQuestions: number
    correctAnswers: number
    lastStudied: string
  }>
}

export default function Dashboard() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Fallback to demo data if user not loaded yet
  const displayName = user?.name || 'Loading...'
  const displayGrade = user?.grade || '11'
  const displayBoard = user?.board || 'CBSE'

  // Fetch real user stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get<UserStats>('/users/stats')
        setStats(response.data)
      } catch (error) {
        console.error('Error fetching stats:', error)
        // Set default stats if API fails
        setStats({
          activeSubjects: 0,
          averageScore: 0,
          weeklyImprovement: 0,
          totalTests: 0,
          recentActivity: [],
          userProgress: []
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user])

  const handleSubjectClick = (subjectId: string) => {
    router.push(`/dashboard/${subjectId}`)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // Get user's first name for welcome message
  const firstName = displayName.split(' ')[0]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduPractice
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500">Grade {displayGrade} • {displayBoard}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
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
        <div className="relative mb-8 p-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white mb-2">
              Welcome back, {firstName}! 🌟
            </h2>
            <p className="text-blue-100 text-lg">Ready to continue your learning journey and achieve your goals?</p>
          </div>
          <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-4 right-12 w-12 h-12 bg-white/10 rounded-full"></div>
          <div className="absolute top-12 right-24 w-6 h-6 bg-white/20 rounded-full"></div>
        </div>

        {/* Dynamic Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats?.activeSubjects || 0}</h3>
                <p className="text-sm text-gray-600 font-medium">Active Subjects</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                <Award className="w-7 h-7 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{Math.round(stats?.averageScore || 0)}%</h3>
                <p className="text-sm text-gray-600 font-medium">Average Score</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats?.weeklyImprovement >= 0 ? '+' : ''}{Math.round(stats?.weeklyImprovement || 0)}%
                </h3>
                <p className="text-sm text-gray-600 font-medium">This Week</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dynamic Subjects Grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Your Subjects</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Target className="w-4 h-4" />
                <span>Click to practice</span>
              </div>
            </div>
            
            {stats?.userProgress.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 text-center">
                <p className="text-gray-500 mb-4">No subjects enrolled yet</p>
                <button 
                  onClick={() => router.push('/subjects')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Browse Subjects
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {stats?.userProgress.map((progress) => (
                  <div
                    key={progress.subject.id}
                    onClick={() => handleSubjectClick(progress.subject.id)}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-14 h-14 bg-gradient-to-r ${progress.subject.color} rounded-xl flex items-center justify-center text-white text-2xl shadow-lg`}>
                            {progress.subject.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{progress.subject.name}</h4>
                            <p className="text-sm text-gray-600">{progress.completedQuestions}/{progress.totalQuestions} questions</p>
                          </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{Math.round(progress.progress)}% Complete</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            Level {Math.floor(progress.progress / 20) + 1}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-3 bg-gradient-to-r ${progress.subject.color} rounded-full transition-all duration-500 ease-out shadow-sm`}
                            style={{ width: `${Math.min(progress.progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Activity Sidebar */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h3>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
              {stats?.recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No recent activity</p>
                  <p className="text-sm text-gray-400">Start practicing to see your activity here!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4 p-3 rounded-xl hover:bg-gray-50/80 transition-colors">
                      <div className="text-2xl">{activity.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{activity.subject}</p>
                        <p className="text-sm text-gray-600">{activity.activity}</p>
                        <p className="text-xs text-gray-500">{new Date(activity.time).toLocaleString()}</p>
                        {activity.score && (
                          <p className="text-xs text-green-600 font-medium">Score: {activity.score}%</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors">
                View All Activity →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}