'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Calendar, Clock, BookOpen, Volume2, Copy, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AssignmentCreationForm, Class, AssignmentFolder, LoadingState, NotificationState } from '@/lib/types'
import { generateAssignmentCode } from '@/lib/utils/generators'

const ASSIGNMENT_TYPES = [
  { value: 'DRAWING', label: 'Drawing', icon: '🎨', description: 'Visual artwork and illustrations' },
  { value: 'WRITING', label: 'Writing', icon: '✍️', description: 'Essays, stories, and text composition' },
  { value: 'VOCABULARY', label: 'Vocabulary', icon: '📚', description: 'Word learning and practice' },
  { value: 'SPEAKING', label: 'Speaking', icon: '🗣️', description: 'Oral presentations and discussions' }
]

const TEMPLATES = [
  { value: 'BLANK', label: 'Blank Canvas', description: 'Empty workspace for free creation' },
  { value: 'LINED', label: 'Lined Paper', description: 'Traditional ruled lines for writing' },
  { value: 'GRID', label: 'Grid Paper', description: 'Square grid for structured layouts' },
  { value: 'CUSTOM', label: 'Custom Template', description: 'Design your own template' }
]

const ESL_CATEGORIES = [
  'Grammar Practice',
  'Vocabulary Building',
  'Writing Skills',
  'Reading Comprehension',
  'Speaking Practice',
  'Listening Skills',
  'Cultural Topics',
  'Creative Expression'
]

const assignmentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  type: z.enum(['DRAWING', 'WRITING', 'VOCABULARY', 'SPEAKING']),
  classId: z.string().min(1, 'Please select a class'),
  folderId: z.string().optional(),
  template: z.enum(['BLANK', 'LINED', 'GRID', 'CUSTOM']),
  dueDate: z.string().optional(),
  maxScore: z.number().min(1).max(1000).optional(),
  instructions: z.string().optional(),
  instructionsTTS: z.boolean(),
  allowLateSubmission: z.boolean(),
  saveAsDraft: z.boolean()
})

type AssignmentFormData = z.infer<typeof assignmentSchema>

interface AssignmentCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AssignmentCreationForm) => Promise<void>
  classes: Class[]
  folders: AssignmentFolder[]
  loading: LoadingState
  notification?: NotificationState
  duplicateFrom?: string // Assignment ID to duplicate from
}

export function AssignmentCreationModal({
  isOpen,
  onClose,
  onSubmit,
  classes,
  folders,
  loading,
  notification,
  duplicateFrom
}: AssignmentCreationModalProps) {
  const [step, setStep] = useState<'details' | 'review'>('details')
  const [generatedCode, setGeneratedCode] = useState<string>('')

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid }
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'DRAWING',
      classId: '',
      folderId: '',
      template: 'BLANK',
      instructions: '',
      instructionsTTS: false,
      allowLateSubmission: true,
      saveAsDraft: false
    }
  })

  const watchedValues = watch()
  const selectedClass = classes.find(cls => cls.id === watchedValues.classId)
  const availableFolders = folders.filter(folder => folder.classId === watchedValues.classId)

  const handleFormSubmit = async (data: AssignmentFormData) => {
    try {
      const assignmentData: AssignmentCreationForm = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        resources: []
      }

      await onSubmit(assignmentData)
      
      // Generate assignment code for review
      const code = generateAssignmentCode()
      setGeneratedCode(code)
      setStep('review')
    } catch (error) {
      console.error('Failed to create assignment:', error)
    }
  }

  const handleClose = () => {
    reset()
    setStep('details')
    setGeneratedCode('')
    onClose()
  }

  const copyAssignmentCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode)
    }
  }

  const getSelectedTypeInfo = () => {
    return ASSIGNMENT_TYPES.find(type => type.value === watchedValues.type)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {duplicateFrom ? 'Duplicate Assignment' : 'Create New Assignment'}
              </h2>
              <p className="text-sm text-gray-500">
                {step === 'details' && 'Enter assignment details'}
                {step === 'review' && 'Review and publish'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-center">
            {['details', 'review'].map((stepName, index) => {
              const isActive = step === stepName
              const isCompleted = step === 'review' && stepName === 'details'
              
              return (
                <div key={stepName} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isActive ? 'bg-blue-500 text-white' :
                    isCompleted ? 'bg-green-500 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`ml-2 text-sm ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    {stepName.charAt(0).toUpperCase() + stepName.slice(1)}
                  </span>
                  {index < 1 && <div className="w-16 h-px bg-gray-300 mx-4" />}
                </div>
              )
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            
            {/* Step 1: Assignment Details */}
            {step === 'details' && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assignment Title *
                      </label>
                      <Input
                        {...register('title')}
                        placeholder="Enter assignment title"
                        className={errors.title ? 'border-red-300' : ''}
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        {...register('description')}
                        rows={3}
                        placeholder="Describe what students should do..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Class *
                      </label>
                      <select
                        {...register('classId')}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          errors.classId ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select a class</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} ({cls.level})
                          </option>
                        ))}
                      </select>
                      {errors.classId && (
                        <p className="mt-1 text-sm text-red-600">{errors.classId.message}</p>
                      )}
                    </div>

                    {availableFolders.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Folder (optional)
                        </label>
                        <select
                          {...register('folderId')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">No folder</option>
                          {availableFolders.map((folder) => (
                            <option key={folder.id} value={folder.id}>
                              {folder.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Assignment Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Assignment Type *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {ASSIGNMENT_TYPES.map((type) => (
                          <div key={type.value}>
                            <input
                              type="radio"
                              {...register('type')}
                              value={type.value}
                              id={`type-${type.value}`}
                              className="sr-only"
                            />
                            <label
                              htmlFor={`type-${type.value}`}
                              className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                watchedValues.type === type.value
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="text-center">
                                <div className="text-2xl mb-2">{type.icon}</div>
                                <div className="font-medium text-gray-900">{type.label}</div>
                                <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Template Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Page Template
                      </label>
                      <div className="space-y-2">
                        {TEMPLATES.map((template) => (
                          <div key={template.value}>
                            <input
                              type="radio"
                              {...register('template')}
                              value={template.value}
                              id={`template-${template.value}`}
                              className="sr-only"
                            />
                            <label
                              htmlFor={`template-${template.value}`}
                              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                                watchedValues.template === template.value
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{template.label}</div>
                                <div className="text-sm text-gray-500">{template.description}</div>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions for Students
                  </label>
                  <textarea
                    {...register('instructions')}
                    rows={4}
                    placeholder="Provide clear instructions for students..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="checkbox"
                      {...register('instructionsTTS')}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Enable text-to-speech for instructions</span>
                    </div>
                  </div>
                </div>

                {/* Additional Settings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date (optional)
                    </label>
                    <Input
                      type="datetime-local"
                      {...register('dueDate')}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Score
                    </label>
                    <Input
                      type="number"
                      {...register('maxScore', { valueAsNumber: true })}
                      min="1"
                      max="1000"
                      placeholder="100"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Assignment Options */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Assignment Options</h4>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      {...register('allowLateSubmission')}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Allow late submissions</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      {...register('saveAsDraft')}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Save as draft (don't publish yet)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 'review' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Assignment Created Successfully!</h3>
                  <p className="text-sm text-gray-500">Students can access this assignment using the code below</p>
                </div>

                {generatedCode && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Assignment Access Code</h4>
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-3xl font-mono font-bold text-blue-600">{generatedCode}</div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={copyAssignmentCode}
                          className="flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Copy
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <QrCode className="w-4 h-4" />
                          QR Code
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Assignment Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Title:</span>
                        <span className="font-medium">{watchedValues.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{getSelectedTypeInfo()?.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Class:</span>
                        <span className="font-medium">{selectedClass?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Template:</span>
                        <span className="font-medium">{watchedValues.template}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Settings</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Due Date:</span>
                        <span className="font-medium">
                          {watchedValues.dueDate ? new Date(watchedValues.dueDate).toLocaleDateString() : 'No due date'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Score:</span>
                        <span className="font-medium">{watchedValues.maxScore || 100}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium">
                          {watchedValues.saveAsDraft ? 'Draft' : 'Published'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('details')}
                    className="flex-1"
                  >
                    Edit Assignment
                  </Button>
                  <Button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {step !== 'review' && (
            <div className="border-t bg-gray-50 px-6 py-4 flex justify-between">
              <div></div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  disabled={loading.isLoading || !watchedValues.title || !watchedValues.classId}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {loading.isLoading ? 'Creating...' : 'Create Assignment'}
                </Button>
              </div>
            </div>
          )}
        </form>

        {/* Notification */}
        {notification && (
          <div className={`p-4 ${
            notification.type === 'success' ? 'bg-green-50 border-green-200' :
            notification.type === 'error' ? 'bg-red-50 border-red-200' :
            'bg-blue-50 border-blue-200'
          } border-t`}>
            <p className={`text-sm ${
              notification.type === 'success' ? 'text-green-600' :
              notification.type === 'error' ? 'text-red-600' :
              'text-blue-600'
            }`}>
              {notification.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}