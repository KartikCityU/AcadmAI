'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, BookOpen, FileText, Target, Clock, 
  TrendingUp, Award, Users, Play, ChevronRight 
} from 'lucide-react'

export default function SubjectPage() {
  const params = useParams()
  const router = useRouter()
  
  // Mock subject data - in real app, this would come from API
  const subjects = {
    '1': { 
      name: 'Mathematics', 
      icon: '📐', 
      color: 'from-blue-500 to-blue-600',
      description: 'Master mathematical concepts with comprehensive practice',
      totalQuestions: 450,
      completedQuestions: 351,
      progress: 78,
      units: [
        { id: 1, name: 'Algebra', questions: 120, completed: 95, difficulty: 'medium' },
        { id: 2, name: 'Geometry', questions: 100, completed: 78, difficulty: 'hard' },
        { id: 3, name: 'Trigonometry', questions: 90, completed: 82, difficulty: 'medium' },
        { id: 4, name: 'Calculus', questions: 140, completed: 96, difficulty: 'hard' }
      ]
    },
    '2': { 
      name: 'Physics', 
      icon: '⚛️', 
      color: 'from-purple-500 to-purple-600',
      description: 'Explore the fundamental laws of nature through practice',
      totalQuestions: 380,
      completedQuestions: 247,
      progress: 65,
      units: [
        { id: 1, name: 'Mechanics', questions: 95, completed: 68, difficulty: 'medium' },
        { id: 2, name: 'Thermodynamics', questions: 85, completed: 52, difficulty: 'hard' },
        { id: 3, name: 'Optics', questions: 70, completed: 48, difficulty: 'easy' },
        { id: 4, name: 'Modern Physics', questions: 130, completed: 79, difficulty: 'hard' }
      ]
    }
    // Add more subjects as needed
  }

  const subject = subjects[params.subject as keyof typeof subjects] || subjects['1']
  
  const [activeTab, setActiveTab] = useState('practice')

  const pastPapers = [
    { year: 2023, difficulty: 'Medium', duration: '3 hours', questions: 50, completed: true },
    { year: 2022, difficulty: 'Hard', duration: '3 hours', questions: 45, completed: true },
    { year: 2021, difficulty: 'Medium', duration: '3 hours', questions: 48, completed: false },
    { year: 2020, difficulty: 'Easy', duration: '3 hours', questions: 42, completed: false }
  ]

  const mockTests = [
    { id: 1, name: 'Full Syllabus Test 1', questions: 100, duration: 180, difficulty: 'Medium', attempts: 2 },
    { id: 2, name: 'Unit-wise Test: Algebra', questions: 50, duration: 90, difficulty: 'Hard', attempts: 1 },
    { id: 3, name: 'Quick Practice Test', questions: 25, duration: 45, difficulty: 'Easy', attempts: 0 },
    { id: 4, name: 'Advanced Problem Solving', questions: 75, duration: 120, difficulty: 'Hard', attempts: 0 }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'hard': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handlePracticeClick = (unitId: number) => {
    router.push(`/dashboard/${params.subject}/practice/${unitId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${subject.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                  {subject.icon}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{subject.name}</h1>
                  <p className="text-sm text-gray-500">{subject.progress}% Complete</p>
                </div>
              </div>
            </div>
            
            <Link href="/dashboard">
              <button className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Subject Hero */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <div className={`w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl`}>
              {subject.icon}
            </div>
            <h1 className="text-4xl font-bold mb-2">{subject.name}</h1>
            <p className="text-blue-100 text-lg mb-6">{subject.description}</p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold">{subject.completedQuestions}</div>
                <div className="text-blue-200 text-sm">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{subject.totalQuestions}</div>
                <div className="text-blue-200 text-sm">Total Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{subject.progress}%</div>
                <div className="text-blue-200 text-sm">Progress</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-white/70 backdrop-blur-sm rounded-xl p-1 border border-gray-200/50">
          {[
            { id: 'practice', label: 'Practice Questions', icon: BookOpen },
            { id: 'papers', label: 'Past Papers', icon: FileText },
            { id: 'tests', label: 'Mock Tests', icon: Target }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white shadow-sm text-blue-600 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Practice Questions Tab */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Practice by Units</h2>
              <div className="text-sm text-gray-500">
                {subject.units.length} units available
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subject.units.map((unit) => (
                <div
                  key={unit.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => handlePracticeClick(unit.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{unit.name}</h3>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                    <span>{unit.completed}/{unit.questions} questions completed</span>
                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(unit.difficulty)}`}>
                       {unit.difficulty}
                     </span>
                   </div>
                   
                   <div className="w-full bg-gray-200 rounded-full h-2">
                     <div
                       className={`h-2 bg-gradient-to-r ${subject.color} rounded-full transition-all duration-300`}
                       style={{ width: `${Math.round((unit.completed / unit.questions) * 100)}%` }}
                     ></div>
                   </div>
                   
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-gray-500">
                       {Math.round((unit.completed / unit.questions) * 100)}% complete
                     </span>
                     <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                       Start Practice
                       <Play className="w-4 h-4 ml-1" />
                     </button>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </div>
       )}

       {/* Past Papers Tab */}
       {activeTab === 'papers' && (
         <div className="space-y-6">
           <div className="flex items-center justify-between">
             <h2 className="text-2xl font-bold text-gray-900">Past Year Papers</h2>
             <div className="text-sm text-gray-500">
               {pastPapers.length} papers available
             </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {pastPapers.map((paper) => (
               <div
                 key={paper.year}
                 className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
               >
                 <div className="flex items-center justify-between mb-4">
                   <div>
                     <h3 className="text-xl font-semibold text-gray-900">{paper.year} Paper</h3>
                     <p className="text-gray-600">{paper.questions} questions • {paper.duration}</p>
                   </div>
                   <div className="flex items-center space-x-2">
                     {paper.completed && (
                       <Award className="w-5 h-5 text-green-500" />
                     )}
                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(paper.difficulty)}`}>
                       {paper.difficulty}
                     </span>
                   </div>
                 </div>
                 
                 <div className="flex items-center justify-between">
                   <div className="flex items-center space-x-4 text-sm text-gray-500">
                     <div className="flex items-center">
                       <Clock className="w-4 h-4 mr-1" />
                       {paper.duration}
                     </div>
                     <div className="flex items-center">
                       <FileText className="w-4 h-4 mr-1" />
                       {paper.questions} questions
                     </div>
                   </div>
                   <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                     {paper.completed ? 'Review' : 'Start'}
                   </button>
                 </div>
               </div>
             ))}
           </div>
         </div>
       )}

       {/* Mock Tests Tab */}
       {activeTab === 'tests' && (
         <div className="space-y-6">
           <div className="flex items-center justify-between">
             <h2 className="text-2xl font-bold text-gray-900">Mock Tests</h2>
             <div className="text-sm text-gray-500">
               {mockTests.length} tests available
             </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {mockTests.map((test) => (
               <div
                 key={test.id}
                 className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300"
               >
                 <div className="flex items-center justify-between mb-4">
                   <div>
                     <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
                     <p className="text-gray-600">{test.questions} questions • {test.duration} minutes</p>
                   </div>
                   <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                     {test.difficulty}
                   </span>
                 </div>
                 
                 <div className="space-y-3">
                   <div className="flex items-center justify-between text-sm">
                     <div className="flex items-center space-x-4 text-gray-500">
                       <div className="flex items-center">
                         <Clock className="w-4 h-4 mr-1" />
                         {test.duration} min
                       </div>
                       <div className="flex items-center">
                         <Users className="w-4 h-4 mr-1" />
                         {test.attempts} attempts
                       </div>
                     </div>
                   </div>
                   
                   <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium">
                     {test.attempts > 0 ? 'Retake Test' : 'Start Test'}
                   </button>
                 </div>
               </div>
             ))}
           </div>
         </div>
       )}
     </div>
   </div>
 )
}
