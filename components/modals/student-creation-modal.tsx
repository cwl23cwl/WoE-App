'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Plus, Trash2, Calendar, Clock, Mail, UserPlus, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StudentCreationForm, ScheduleInput, Class, LoadingState, NotificationState } from '@/lib/types'
import { generateStudentCredentials, hasScheduleConflict, isValidEmail, isValidTimeFormat } from '@/lib/utils/generators'

const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: 'Monday', short: 'Mon' },
  { value: 'TUESDAY', label: 'Tuesday', short: 'Tue' },
  { value: 'WEDNESDAY', label: 'Wednesday', short: 'Wed' },
  { value: 'THURSDAY', label: 'Thursday', short: 'Thu' },
  { value: 'FRIDAY', label: 'Friday', short: 'Fri' },
  { value: 'SATURDAY', label: 'Saturday', short: 'Sat' },
  { value: 'SUNDAY', label: 'Sunday', short: 'Sun' }
]

const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  sendInvite: z.boolean(),
  generateCredentials: z.boolean(),
  classIds: z.array(z.string()).min(1, 'Please select at least one class'),
  schedules: z.array(z.object({
    dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    title: z.string().optional(),
    notes: z.string().optional()
  })).optional()
})

type StudentFormData = z.infer<typeof studentSchema>

interface StudentCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: StudentCreationForm) => Promise<void>
  classes: Class[]
  loading: LoadingState
  notification?: NotificationState
}

export function StudentCreationModal({
  isOpen,
  onClose,
  onSubmit,
  classes,
  loading,
  notification
}: StudentCreationModalProps) {
  const [step, setStep] = useState<'details' | 'schedule' | 'review'>('details')
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    loginCode: string
    password: string
    displayPassword: string
  } | null>(null)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid }
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: '',
      email: '',
      sendInvite: true,
      generateCredentials: true,
      classIds: [],
      schedules: []
    }
  })

  const { fields: scheduleFields, append: appendSchedule, remove: removeSchedule } = useFieldArray({
    control,
    name: 'schedules'
  })

  const watchedValues = watch()
  const selectedClasses = classes.filter(cls => watchedValues.classIds.includes(cls.id))

  const addScheduleSlot = () => {
    appendSchedule({
      dayOfWeek: 'MONDAY',
      startTime: '09:00',
      endTime: '10:00',
      title: '',
      notes: ''
    })
  }

  const handleFormSubmit = async (data: StudentFormData) => {
    try {
      let credentials = null
      if (data.generateCredentials) {
        credentials = generateStudentCredentials()
        setGeneratedCredentials(credentials)
      }

      await onSubmit({
        ...data,
        schedules: data.schedules || []
      })

      if (data.generateCredentials && credentials) {
        setStep('review')
      } else {
        handleClose()
      }
    } catch (error) {
      console.error('Failed to create student:', error)
    }
  }

  const handleClose = () => {
    reset()
    setStep('details')
    setGeneratedCredentials(null)
    onClose()
  }

  const toggleClassSelection = (classId: string) => {
    const currentIds = watchedValues.classIds
    if (currentIds.includes(classId)) {
      setValue('classIds', currentIds.filter(id => id !== classId))
    } else {
      setValue('classIds', [...currentIds, classId])
    }
  }

  const checkScheduleConflicts = (scheduleIndex: number) => {
    const currentSchedule = watchedValues.schedules?.[scheduleIndex]
    if (!currentSchedule) return false

    const otherSchedules = watchedValues.schedules?.filter((_, index) => index !== scheduleIndex) || []
    return hasScheduleConflict(currentSchedule, otherSchedules)
  }

  const downloadLoginCard = () => {
    if (!generatedCredentials) return

    const cardData = {
      studentName: watchedValues.name,
      loginCode: generatedCredentials.loginCode,
      password: generatedCredentials.displayPassword,
      schoolName: 'Write on English',
      instructions: 'Use these credentials to log into your student account'
    }

    // Create a printable login card (simplified version)
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #E55A3C; border-radius: 10px; max-width: 400px;">
        <h2 style="color: #E55A3C; margin-bottom: 20px;">Write on English - Student Login Card</h2>
        <p><strong>Student:</strong> ${cardData.studentName}</p>
        <p><strong>Login Code:</strong> <span style="font-size: 18px; font-weight: bold;">${cardData.loginCode}</span></p>
        <p><strong>Password:</strong> <span style="font-size: 18px; font-weight: bold;">${cardData.password}</span></p>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">${cardData.instructions}</p>
      </div>
    `
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Student</h2>
              <p className="text-sm text-gray-500">
                {step === 'details' && 'Enter student information'}
                {step === 'schedule' && 'Set up class schedule'}
                {step === 'review' && 'Review and download credentials'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            {['details', 'schedule', 'review'].map((stepName, index) => {
              const isActive = step === stepName
              const isCompleted = ['details', 'schedule'].indexOf(step) > ['details', 'schedule'].indexOf(stepName)
              
              return (
                <div key={stepName} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isActive ? 'bg-orange-500 text-white' :
                    isCompleted ? 'bg-green-500 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`ml-2 text-sm ${isActive ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
                    {stepName === 'details' && 'Details'}
                    {stepName === 'schedule' && 'Schedule'}
                    {stepName === 'review' && 'Review'}
                  </span>
                  {index < 2 && <div className="w-12 h-px bg-gray-300 mx-4" />}
                </div>
              )
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Step 1: Student Details */}
            {step === 'details' && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Name *
                    </label>
                    <Input
                      {...register('name')}
                      placeholder="Enter student's full name"
                      className={errors.name ? 'border-red-300' : ''}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      {...register('email')}
                      type="email"
                      placeholder="student@example.com"
                      className={errors.email ? 'border-red-300' : ''}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Class Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Assign to Classes *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {classes.map((cls) => (
                      <div
                        key={cls.id}
                        onClick={() => toggleClassSelection(cls.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          watchedValues.classIds.includes(cls.id)
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: cls.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{cls.name}</p>
                            <p className="text-sm text-gray-500">{cls.level}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.classIds && (
                    <p className="mt-2 text-sm text-red-600">{errors.classIds.message}</p>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      {...register('sendInvite')}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Send email invitation</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      {...register('generateCredentials')}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Generate printable login card</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Schedule */}
            {step === 'schedule' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Class Schedule</h3>
                    <p className="text-sm text-gray-500">Set up when this student has classes</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addScheduleSlot}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Time Slot
                  </Button>
                </div>

                <div className="space-y-4">
                  {scheduleFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Time Slot {index + 1}</h4>
                        {scheduleFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSchedule(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Day of Week
                          </label>
                          <select
                            {...register(`schedules.${index}.dayOfWeek`)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                          >
                            {DAYS_OF_WEEK.map((day) => (
                              <option key={day.value} value={day.value}>
                                {day.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Time
                          </label>
                          <Input
                            type="time"
                            {...register(`schedules.${index}.startTime`)}
                            className={errors.schedules?.[index]?.startTime ? 'border-red-300' : ''}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Time
                          </label>
                          <Input
                            type="time"
                            {...register(`schedules.${index}.endTime`)}
                            className={errors.schedules?.[index]?.endTime ? 'border-red-300' : ''}
                          />
                        </div>
                      </div>

                      {checkScheduleConflicts(index) && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-600">
                            ⚠️ This schedule conflicts with another time slot
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes (optional)
                        </label>
                        <Input
                          {...register(`schedules.${index}.notes`)}
                          placeholder="Any additional notes..."
                        />
                      </div>
                    </div>
                  ))}

                  {scheduleFields.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No schedule set up yet</p>
                      <p className="text-sm">Click "Add Time Slot" to create a schedule</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Review & Credentials */}
            {step === 'review' && generatedCredentials && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Student Created Successfully!</h3>
                  <p className="text-sm text-gray-500">Login credentials have been generated</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Student Login Credentials</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Student Name:</span>
                      <span className="text-sm font-medium">{watchedValues.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Login Code:</span>
                      <span className="text-sm font-mono font-bold">{generatedCredentials.loginCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Password:</span>
                      <span className="text-sm font-mono font-bold">{generatedCredentials.displayPassword}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={downloadLoginCard}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Login Card
                  </Button>
                  <Button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
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
              <div>
                {step === 'schedule' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('details')}
                  >
                    Back
                  </Button>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                
                {step === 'details' && (
                  <Button
                    type="button"
                    onClick={() => setStep('schedule')}
                    disabled={!watchedValues.name || !watchedValues.email || watchedValues.classIds.length === 0}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Next: Schedule
                  </Button>
                )}
                
                {step === 'schedule' && (
                  <Button
                    type="submit"
                    disabled={loading.isLoading}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {loading.isLoading ? 'Creating...' : 'Create Student'}
                  </Button>
                )}
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