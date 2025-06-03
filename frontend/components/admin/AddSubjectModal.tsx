import React, { useState } from 'react';
import { X, BookOpen, AlertCircle, CheckCircle, Palette } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
  onSuccess: () => void;
}

// Predefined subject icons and colors
const SUBJECT_OPTIONS = [
  { icon: '📚', name: 'Mathematics', color: '#3B82F6' },
  { icon: '🧪', name: 'Science', color: '#10B981' },
  { icon: '📖', name: 'English', color: '#8B5CF6' },
  { icon: '🌍', name: 'Geography', color: '#F59E0B' },
  { icon: '⏰', name: 'History', color: '#EF4444' },
  { icon: '🎨', name: 'Art', color: '#EC4899' },
  { icon: '🎵', name: 'Music', color: '#06B6D4' },
  { icon: '⚽', name: 'Physical Education', color: '#84CC16' },
  { icon: '💻', name: 'Computer Science', color: '#6366F1' },
  { icon: '🔬', name: 'Physics', color: '#0EA5E9' },
  { icon: '⚗️', name: 'Chemistry', color: '#059669' },
  { icon: '🧬', name: 'Biology', color: '#DC2626' },
  { icon: '📊', name: 'Economics', color: '#D97706' },
  { icon: '🏛️', name: 'Civics', color: '#7C3AED' }
];

const COLORS = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444',
  '#EC4899', '#06B6D4', '#84CC16', '#6366F1', '#0EA5E9',
  '#059669', '#DC2626', '#D97706', '#7C3AED', '#6B7280'
];

const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  classId,
  className,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    icon: '📚',
    color: '#3B82F6',
    isCompulsory: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showCustomIcon, setShowCustomIcon] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    setError(''); // Clear error when user types
  };

  const handlePredefinedSubject = (subject: typeof SUBJECT_OPTIONS[0]) => {
    setFormData(prev => ({
      ...prev,
      name: subject.name,
      icon: subject.icon,
      color: subject.color,
      code: subject.name.toUpperCase().replace(/\s+/g, '').substring(0, 6)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Subject name is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Subject description is required');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔍 Adding subject to class:', classId, formData);
      const response = await adminApi.addSubjectToClass(classId, {
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        description: formData.description.trim(),
        icon: formData.icon,
        color: formData.color,
        isCompulsory: formData.isCompulsory
      });

      console.log('✅ Subject added successfully:', response);
      setSuccess(`Successfully added ${formData.name} to the class`);
      
      // Reset form
      setFormData({
        name: '',
        code: '',
        description: '',
        icon: '📚',
        color: '#3B82F6',
        isCompulsory: true
      });

      // Close modal and refresh data after short delay
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error('❌ Error adding subject:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add subject. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        code: '',
        description: '',
        icon: '📚',
        color: '#3B82F6',
        isCompulsory: true
      });
      setError('');
      setSuccess('');
      setShowCustomIcon(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add Subject</h2>
            <p className="text-sm text-gray-600 mt-1">Class: {className}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
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

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Quick Subject Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Select (Optional)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {SUBJECT_OPTIONS.map((subject, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handlePredefinedSubject(subject)}
                      className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                    >
                      <span className="text-lg">{subject.icon}</span>
                      <span className="text-sm font-medium text-gray-700 truncate">{subject.name}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Click to auto-fill details, then customize as needed</p>
              </div>

              {/* Subject Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Mathematics, Physics, English Literature"
                  required
                />
              </div>

              {/* Subject Code */}
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Code (Optional)
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., MATH101, PHY201, ENG301"
                  maxLength={10}
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Icon *
                </label>
                <div className="flex items-center space-x-3 mb-2">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-xl border-2"
                    style={{ backgroundColor: formData.color + '20', borderColor: formData.color }}
                  >
                    {formData.icon}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCustomIcon(!showCustomIcon)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {showCustomIcon ? 'Hide' : 'Custom Icon'}
                  </button>
                </div>
                
                {showCustomIcon && (
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter emoji or text (e.g., 📚, ⚗️, 🎵)"
                    maxLength={4}
                  />
                )}
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Color *
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.color === color 
                          ? 'border-gray-400 scale-110 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="mt-2 w-16 h-8 border border-gray-300 rounded cursor-pointer"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of what this subject covers..."
                  required
                />
              </div>

              {/* Subject Type */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isCompulsory"
                    checked={formData.isCompulsory}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Compulsory Subject
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Compulsory subjects are automatically assigned to all students in this class
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.name.trim() || !formData.description.trim()}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Adding Subject...</span>
                    </div>
                  ) : (
                    'Add Subject'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddSubjectModal;