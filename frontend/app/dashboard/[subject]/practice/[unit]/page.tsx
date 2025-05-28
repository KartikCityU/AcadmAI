'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, Clock, Flag, CheckCircle, XCircle, 
  RotateCcw, ArrowRight, BookOpen, Target, Award,
  Brain, Lightbulb, AlertCircle
} from 'lucide-react'

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
}

export default function PracticeQuestion() {
  const params = useParams()
  const router = useRouter()
  
  // Mock questions data
  const mockQuestions: Question[] = [
    {
      id: 1,
      question: "What is the derivative of f(x) = 3x² + 2x - 1?",
      options: ["6x + 2", "6x - 2", "3x + 2", "6x² + 2x"],
      correctAnswer: 0,
      explanation: "Using the power rule: d/dx(3x²) = 6x, d/dx(2x) = 2, d/dx(-1) = 0. Therefore, f'(x) = 6x + 2.",
      difficulty: "medium",
      topic: "Derivatives"
    },
    {
      id: 2,
      question: "Solve for x: 2x + 5 = 13",
      options: ["x = 4", "x = 3", "x = 5", "x = 6"],
      correctAnswer: 0,
      explanation: "Subtract 5 from both sides: 2x = 8. Then divide by 2: x = 4.",
      difficulty: "easy",
      topic: "Linear Equations"
    },
    {
      id: 3,
      question: "What is the area of a circle with radius 5 units?",
      options: ["25π", "10π", "5π", "15π"],
      correctAnswer: 0,
      explanation: "The area of a circle is πr². With r = 5, the area is π × 5² = 25π square units.",
      difficulty: "easy",
      topic: "Geometry"
    },
    {
      id: 4,
      question: "Factor the expression: x² - 9",
      options: ["(x + 3)(x - 3)", "(x - 3)²", "(x + 3)²", "x(x - 9)"],
      correctAnswer: 0,
      explanation: "This is a difference of squares: a² - b² = (a + b)(a - b). So x² - 9 = x² - 3² = (x + 3)(x - 3).",
      difficulty: "medium",
      topic: "Factoring"
    },
    {
      id: 5,
      question: "What is the value of sin(90°)?",
      options: ["1", "0", "√2/2", "-1"],
      correctAnswer: 0,
      explanation: "sin(90°) = 1. This is a fundamental trigonometric value that should be memorized.",
      difficulty: "easy",
      topic: "Trigonometry"
    }
  ]

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(new Array(mockQuestions.length).fill(false))
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentQuestion = mockQuestions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === mockQuestions.length - 1

  // Timer effect
  useEffect(() => {
    if (!isCompleted) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isCompleted])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return
    
    setShowResult(true)
    
    // Update answered questions
    const newAnsweredQuestions = [...answeredQuestions]
    newAnsweredQuestions[currentQuestionIndex] = true
    setAnsweredQuestions(newAnsweredQuestions)
    
    // Update score if correct
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1)
    }
  }

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      setIsCompleted(true)
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  const handleRetry = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setAnsweredQuestions(new Array(mockQuestions.length).fill(false))
    setTimeElapsed(0)
    setIsCompleted(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'hard': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (isCompleted) {
    const percentage = Math.round((score / mockQuestions.length) * 100)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 text-center">
          <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
            percentage >= 80 ? 'bg-green-100' : percentage >= 60 ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <Award className={`w-8 h-8 ${
              percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`} />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Practice Complete!</h2>
          <p className="text-gray-600 mb-6">Great job on completing the practice session</p>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(percentage)}`}>
                {score}/{mockQuestions.length} ({percentage}%)
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Time Taken</span>
              <span className="text-lg font-semibold text-gray-900">{formatTime(timeElapsed)}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Average per Question</span>
              <span className="text-lg font-semibold text-gray-900">
                {Math.round(timeElapsed / mockQuestions.length)}s
              </span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Practice Again
            </button>
            
            <button
              onClick={() => router.push(`/dashboard/${params.subject}`)}
              className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200"
            >
              Back to Subject
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push(`/dashboard/${params.subject}`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <Brain className="w-6 h-6 text-blue-600" />
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Practice Session</h1>
                  <p className="text-sm text-gray-500">Unit {params.unit} - Mathematics</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeElapsed)}</span>
              </div>
              
              <div className="text-sm text-gray-600">
                {currentQuestionIndex + 1} of {mockQuestions.length}
              </div>
              
              <div className="text-sm font-medium text-blue-600">
                Score: {score}/{answeredQuestions.filter(Boolean).length}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-1">
        <div
          className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / mockQuestions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>
              <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                {mockQuestions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentQuestionIndex(index)
                      setSelectedAnswer(null)
                      setShowResult(false)
                    }}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : answeredQuestions[index]
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span className="text-gray-600">Current</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span className="text-gray-600">Not Answered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Area */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-8">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-blue-600">Q{currentQuestionIndex + 1}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
                    {currentQuestion.difficulty}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {currentQuestion.topic}
                  </span>
                </div>
                
                <button className="p-2 text-gray-400 hover:text-yellow-500 transition-colors">
                  <Flag className="w-5 h-5" />
                </button>
              </div>

              {/* Question */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option, index) => {
                  let optionClass = "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 "
                  
                  if (showResult) {
                    if (index === currentQuestion.correctAnswer) {
                      optionClass += "border-green-500 bg-green-50 text-green-700"
                    } else if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
                      optionClass += "border-red-500 bg-red-50 text-red-700"
                    } else {
                      optionClass += "border-gray-200 bg-gray-50 text-gray-500"
                    }
                  } else {
                    if (selectedAnswer === index) {
                      optionClass += "border-blue-500 bg-blue-50 text-blue-700"
                    } else {
                      optionClass += "border-gray-200 hover:border-blue-300 hover:bg-blue-25"
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={optionClass}
                      disabled={showResult}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1">{option}</span>
                        {showResult && index === currentQuestion.correctAnswer && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {showResult && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Explanation (shown after answer) */}
              {showResult && (
                <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">Explanation</h3>
                      <p className="text-blue-800">{currentQuestion.explanation}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={() => router.push(`/dashboard/${params.subject}`)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Exit Practice
                </button>
                
                <div className="flex space-x-3">
                  {!showResult ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center"
                    >
                      {isLastQuestion ? 'Finish Practice' : 'Next Question'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
