import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Clock, 
  Edit,
  AlertCircle, 
  CheckCircle,
  BarChart3,
  Target,
  Activity,
  GraduationCap,
  Users
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  onSuccess?: () => void;
}

interface StudentDetail {
  id: string;
  name: string;
  email: string;
  rollNumber: string | null;
  parentPhone: string | null;
  avatar: string | null;
  createdAt: string;
  class: {
    id: string;
    name: string;
    grade: string;
    section: string | null;
  };
  academicYear: {
    name: string;
  };
  subjectEnrollments: Array<{
    id: string;
    enrolledAt: string;
    isActive: boolean;
    subject: {
      id: string;
      name: string;
      code: string | null;
      icon: string;
      color: string;
      isCompulsory: boolean;
    };
  }>;
  testResults: Array<{
    id: string;
    testType: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number;
    createdAt: string;
    subject: {
      name: string;
      icon: string;
      color: string;
    };
  }>;
  userProgress: Array<{
    id: string;
    progress: number;
    totalQuestions: number;
    completedQuestions: number;
    correctAnswers: number;
    lastStudied: string;
    subject: {
      name: string;
      icon: string;
      color: string;
    };
  }>;
  statistics?: {
    totalTests: number;
    averageScore: number;
    totalSubjects: number;
    compulsorySubjects: number;
    totalTimeSpent: number;
  };
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  studentId,
  onSuccess
}) => {
  const [studentData, setStudentData] = useState<StudentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'subjects' | 'activity'>('overview');

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentDetails();
    }
  }, [isOpen, studentId]);

  const fetchStudentDetails = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔍 Fetching student details for ID:', studentId);
      const response = await adminApi.getStudentDetails(studentId);
      console.log('✅ Full API response:', response);
      
      // Handle the actual response format from your API
      if (response && response.data) {
        // Your API returns the data directly in response.data
        console.log('✅ Setting student data from response.data:', response.data);
        setStudentData(response.data);
      } else if (response && response.id) {
        // Handle case where response is the student data directly
        console.log('✅ Setting student data directly from response:', response);
        setStudentData(response);
      } else {
        console.error('❌ Unexpected response format:', response);
        setError('Received unexpected data format from server');
      }
    } catch (err: any) {
      console.error('❌ Error fetching student details:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load student details';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStudentData(null);
    setError('');
    setActiveTab('overview');
    onClose();
  };

  // Debug log to see what data we have
  useEffect(() => {
    console.log('🔍 StudentData state:', studentData);
    console.log('🔍 StudentData type:', typeof studentData);
    console.log('🔍 Is studentData null?', studentData === null);
  }, [studentData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isLoading ? 'Loading...' : studentData?.name || 'Student Details'}
              </h2>
              {studentData && (
                <p className="text-sm text-gray-600">
                  {studentData.class?.name} • {studentData.academicYear?.name}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading student details...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Debug Info - Remove this after testing */}
          {!isLoading && !error && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Debug: Student data loaded = {studentData ? 'Yes' : 'No'}
                {studentData && ` | Student name: ${studentData.name}`}
              </p>
            </div>
          )}

          {/* Student Data */}
          {studentData && !isLoading && (
            <>
              {/* Tabs */}
              <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'performance', label: 'Performance', icon: TrendingUp },
                  { id: 'subjects', label: 'Subjects', icon: BookOpen },
                  { id: 'activity', label: 'Activity', icon: Activity }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">{studentData.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <GraduationCap className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Roll Number</p>
                          <p className="font-medium text-gray-900">{studentData.rollNumber || 'Not assigned'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Parent Phone</p>
                          <p className="font-medium text-gray-900">{studentData.parentPhone || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Joined</p>
                          <p className="font-medium text-gray-900">
                            {new Date(studentData.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Test Results</p>
                          <p className="text-2xl font-bold text-blue-900">{studentData.testResults?.length || 0}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 font-medium">Subjects Enrolled</p>
                          <p className="text-2xl font-bold text-green-900">
                            {studentData.subjectEnrollments?.filter(e => e.isActive).length || 0}
                          </p>
                        </div>
                        <BookOpen className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600 font-medium">Average Score</p>
                          <p className="text-2xl font-bold text-purple-900">
                            {studentData.statistics?.averageScore ? Math.round(studentData.statistics.averageScore) + '%' : 'N/A'}
                          </p>
                        </div>
                        <Award className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
                    {studentData.testResults && studentData.testResults.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Total Tests</p>
                            <p className="text-2xl font-bold text-gray-900">{studentData.testResults.length}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Average Score</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {studentData.statistics?.averageScore ? Math.round(studentData.statistics.averageScore) + '%' : 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Recent Test Results</h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {studentData.testResults.slice(-10).reverse().map((result) => (
                              <div key={result.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                <div className="flex items-center space-x-3">
                                  <div 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                                    style={{ backgroundColor: result.subject.color }}
                                  >
                                    {result.subject.icon}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{result.subject.name}</p>
                                    <p className="text-sm text-gray-600">
                                      {result.testType} • {new Date(result.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900">{Math.round(result.score)}%</p>
                                  <p className="text-sm text-gray-600">
                                    {result.correctAnswers}/{result.totalQuestions}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600">No test results available yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'subjects' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Enrollments</h3>
                    {studentData.subjectEnrollments && studentData.subjectEnrollments.length > 0 ? (
                      <div className="space-y-4">
                        {studentData.subjectEnrollments.filter(e => e.isActive).map((enrollment) => (
                          <div key={enrollment.id} className="bg-white rounded-lg p-4 border">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div 
                                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                                  style={{ backgroundColor: enrollment.subject.color }}
                                >
                                  {enrollment.subject.icon}
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{enrollment.subject.name}</h4>
                                  <p className="text-sm text-gray-600">
                                    {enrollment.subject.code && `Code: ${enrollment.subject.code} • `}
                                    Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {enrollment.subject.isCompulsory && (
                                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                    Compulsory
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600">No subjects enrolled yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {/* Show a simple message for now */}
                      <div className="text-center py-8">
                        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600">Activity tracking coming soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-6 border-t border-gray-200">
                <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Edit className="w-4 h-4" />
                  <span>Edit Student</span>
                </button>
                <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <TrendingUp className="w-4 h-4" />
                  <span>View Report</span>
                </button>
              </div>
            </>
          )}

          {/* Show message if no data and not loading */}
          {!studentData && !isLoading && !error && (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Student Data</h3>
              <p className="text-gray-600">Unable to load student information.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;