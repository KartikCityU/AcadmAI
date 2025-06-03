import React, { useState, useEffect } from 'react';
import { X, User, AlertCircle, CheckCircle } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject?: string;
  isAssigned?: boolean;
  assignedClassName?: string;
}

interface AssignTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
  currentTeacher?: {
    id: string;
    name: string;
    email: string;
  } | null;
  onSuccess: () => void;
}

const AssignTeacherModal: React.FC<AssignTeacherModalProps> = ({
  isOpen,
  onClose,
  classId,
  className,
  currentTeacher,
  onSuccess
}) => {
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Fetch available teachers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableTeachers();
      setSelectedTeacherId(currentTeacher?.id || '');
      setError('');
      setSuccess('');
    }
  }, [isOpen, currentTeacher]);

  const fetchAvailableTeachers = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔍 Fetching available teachers...');
      const response = await adminApi.getAvailableTeachers();
      console.log('✅ Teachers response:', response);
      
      // Handle both possible response formats
      const teachersData = response.data || response.teachers || [];
      setAvailableTeachers(teachersData);
      console.log('✅ Teachers set:', teachersData);
    } catch (err) {
      console.error('❌ Error fetching teachers:', err);
      setError('Failed to load teachers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedTeacherId) {
      setError('Please select a teacher to assign');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔍 Assigning teacher:', selectedTeacherId, 'to class:', classId);
      const response = await adminApi.assignTeacherToClass(classId, selectedTeacherId);
      console.log('✅ Teacher assigned successfully:', response);

      const assignedTeacher = availableTeachers.find(t => t.id === selectedTeacherId);
      setSuccess(`Successfully assigned ${assignedTeacher?.name} as class teacher`);
      
      // Close modal and refresh data after short delay
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error('❌ Error assigning teacher:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to assign teacher. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveTeacher = async () => {
    if (!currentTeacher) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔍 Removing teacher from class:', classId);
      const response = await adminApi.removeTeacherFromClass(classId);
      console.log('✅ Teacher removed successfully:', response);

      setSuccess(`Successfully removed ${currentTeacher.name} from class`);
      
      // Close modal and refresh data after short delay
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error('❌ Error removing teacher:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to remove teacher. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {currentTeacher ? 'Change Class Teacher' : 'Assign Class Teacher'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Class: {className}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Teacher Info */}
          {currentTeacher && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Current Class Teacher</h3>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">{currentTeacher.name}</p>
                  <p className="text-sm text-blue-700">{currentTeacher.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Teacher Selection */}
          {!success && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Teacher
                </label>
                
                {isLoading ? (
                  <div className="border border-gray-300 rounded-lg p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading teachers...</p>
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                    {availableTeachers.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No teachers available</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {availableTeachers.map((teacher) => (
                          <label
                            key={teacher.id}
                            className={`flex items-center space-x-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                              teacher.isAssigned && teacher.id !== currentTeacher?.id
                                ? 'opacity-60'
                                : ''
                            }`}
                          >
                            <input
                              type="radio"
                              name="teacher"
                              value={teacher.id}
                              checked={selectedTeacherId === teacher.id}
                              onChange={(e) => setSelectedTeacherId(e.target.value)}
                              disabled={teacher.isAssigned && teacher.id !== currentTeacher?.id}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {teacher.name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {teacher.email}
                              </p>
                              {teacher.subject && (
                                <p className="text-xs text-blue-600 mt-1">
                                  Subject: {teacher.subject}
                                </p>
                              )}
                              {teacher.isAssigned && teacher.id !== currentTeacher?.id && (
                                <p className="text-xs text-orange-600 mt-1">
                                  Already assigned to {teacher.assignedClassName}
                                </p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                {currentTeacher && (
                  <button
                    onClick={handleRemoveTeacher}
                    disabled={isSubmitting || isLoading}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 
                             disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                             focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Removing...</span>
                      </div>
                    ) : (
                      'Remove Teacher'
                    )}
                  </button>
                )}
                
                <button
                  onClick={handleAssignTeacher}
                  disabled={isSubmitting || isLoading || !selectedTeacherId}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Assigning...</span>
                    </div>
                  ) : (
                    currentTeacher ? 'Change Teacher' : 'Assign Teacher'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignTeacherModal;