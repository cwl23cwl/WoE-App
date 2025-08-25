'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Plus, Trash2, Calendar, Clock, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/badge'
import { StudentCreationForm, ScheduleInput, Class, LoadingState, NotificationState } from '@/lib/types'
import { hasScheduleConflict, isValidTimeFormat } from '@/lib/utils/generators'

// Schedule localStorage utilities
const LAST_SCHEDULE_KEY = 'woe-last-schedule-slot'

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'

interface LastScheduleSlot {
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  title?: string
  notes?: string
}

function getLastScheduleSlot(): LastScheduleSlot | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(LAST_SCHEDULE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveLastScheduleSlot(slot: LastScheduleSlot) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LAST_SCHEDULE_KEY, JSON.stringify(slot))
  } catch {
    // Ignore localStorage errors
  }
}

function getDefaultScheduleSlot(): LastScheduleSlot {
  const lastSlot = getLastScheduleSlot()
  if (lastSlot) return lastSlot

  // Default to today's weekday and 21:00 (9 PM)
  const today = new Date()
  const dayNames: LastScheduleSlot['dayOfWeek'][] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  
  return {
    dayOfWeek: dayNames[today.getDay()],
    startTime: '21:00',
    endTime: '22:00'
  }
}

function getTeacherTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

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
  email: z.string().optional().refine((email) => {
    if (!email || email.trim() === '') return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, 'Please enter a valid email address'),
  timezone: z.string().optional(),
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
  const [step, setStep] = useState<'details' | 'schedule'>('details')
  
  // Get default schedule slot
  const defaultSlot = getDefaultScheduleSlot()

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
      timezone: getTeacherTimezone(),
      schedules: [defaultSlot] // Auto-populate first slot
    }
  })

  const { fields: scheduleFields, append: appendSchedule, remove: removeSchedule } = useFieldArray({
    control,
    name: 'schedules'
  })

  const watchedValues = watch()

  const addScheduleSlot = () => {
    // Get default values, preferring last used schedule slot
    const defaultSlot = getDefaultScheduleSlot()
    
    appendSchedule({
      dayOfWeek: defaultSlot.dayOfWeek,
      startTime: defaultSlot.startTime,
      endTime: defaultSlot.endTime,
      title: defaultSlot.title || '',
      notes: defaultSlot.notes || ''
    })
  }

  const handleFormSubmit = async (data: StudentFormData) => {
    try {
      // Save the last schedule slot for next time if we have schedules
      if (data.schedules && data.schedules.length > 0) {
        const lastSchedule = data.schedules[data.schedules.length - 1]
        saveLastScheduleSlot({
          dayOfWeek: lastSchedule.dayOfWeek,
          startTime: lastSchedule.startTime,
          endTime: lastSchedule.endTime,
          title: lastSchedule.title,
          notes: lastSchedule.notes
        })
      }

      // Create a unique class for this student (1:1 relationship)
      const studentClassData = {
        ...data,
        schedules: data.schedules || [],
        // Auto-generate a class for this student
        generateOwnClass: true
      }

      await onSubmit(studentClassData as StudentCreationForm)
      
      // Close modal on success
      handleClose()
    } catch (error) {
      console.error('Failed to create student:', error)
    }
  }

  const handleClose = () => {
    reset()
    setStep('details')
    onClose()
  }

  const checkScheduleConflicts = (scheduleIndex: number) => {
    const currentSchedule = watchedValues.schedules?.[scheduleIndex]
    if (!currentSchedule) return false

    const otherSchedules = watchedValues.schedules?.filter((_, index) => index !== scheduleIndex) || []
    return hasScheduleConflict(currentSchedule, otherSchedules)
  }

  const checkDuplicateSchedule = (scheduleIndex: number) => {
    const currentSchedule = watchedValues.schedules?.[scheduleIndex]
    if (!currentSchedule) return false

    const otherSchedules = watchedValues.schedules?.filter((_, index) => index !== scheduleIndex) || []
    return otherSchedules.some(schedule => 
      schedule.dayOfWeek === currentSchedule.dayOfWeek &&
      schedule.startTime === currentSchedule.startTime &&
      schedule.endTime === currentSchedule.endTime
    )
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
            {['details', 'schedule'].map((stepName, index) => {
              const isActive = step === stepName
              const isCompleted = step === 'schedule' && stepName === 'details'
              
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
                  </span>
                  {index < 1 && <div className="w-12 h-px bg-gray-300 mx-4" />}
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
                      Email Address
                    </label>
                    <Input
                      {...register('email')}
                      type="email"
                      placeholder="student@example.com"
                      className={errors.email ? 'border-red-300' : ''}
                    />
                    <p className="mt-1 text-sm text-gray-500">Optional</p>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      {...register('timezone')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                        {Intl.DateTimeFormat().resolvedOptions().timeZone} (Default)
                      </option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="America/Chicago">America/Chicago</option>
                      <option value="America/Denver">America/Denver</option>
                      <option value="America/Los_Angeles">America/Los_Angeles</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="Europe/Paris">Europe/Paris</option>
                      <option value="Asia/Tokyo">Asia/Tokyo</option>
                    </select>
                    <p className="mt-1 text-sm text-gray-500">Optional - defaults to your timezone</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Each student will automatically get their own dedicated class for personalized learning.
                  </p>
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
                    <p className="text-xs text-gray-400 mt-1">
                      Times shown in {Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </p>
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

                      {checkDuplicateSchedule(index) && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-700">
                            ⚠️ This time already exists. Pick a different time.
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
          </div>

          {/* Footer */}
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
                  disabled={!watchedValues.name}
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