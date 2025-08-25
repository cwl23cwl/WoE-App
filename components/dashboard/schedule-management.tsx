'use client'

import { useState } from 'react'
import { Schedule, Class, User } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Users, Plus, Edit, Trash2, AlertCircle } from 'lucide-react'

interface ScheduleWithDetails extends Schedule {
  student: User
  class: Class
}

interface ScheduleConflict {
  schedule1: ScheduleWithDetails
  schedule2: ScheduleWithDetails
  conflictType: 'time_overlap' | 'same_student_multiple_classes'
}

interface ScheduleManagementProps {
  schedules: ScheduleWithDetails[]
  classes: Class[]
  onCreateSchedule: () => void
  onEditSchedule: (scheduleId: string) => void
  onDeleteSchedule: (scheduleId: string) => void
  isLoading?: boolean
}

const DAYS_OF_WEEK = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
]

const DAY_LABELS = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue', 
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun'
}

export function ScheduleManagement({
  schedules,
  classes,
  onCreateSchedule,
  onEditSchedule,
  onDeleteSchedule,
  isLoading = false
}: ScheduleManagementProps) {
  const [selectedDay, setSelectedDay] = useState<string>('')
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')

  // Detect schedule conflicts
  const detectConflicts = (): ScheduleConflict[] => {
    const conflicts: ScheduleConflict[] = []
    
    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const schedule1 = schedules[i]
        const schedule2 = schedules[j]
        
        // Check for time overlap on same day
        if (schedule1.dayOfWeek === schedule2.dayOfWeek) {
          const time1Start = timeToMinutes(schedule1.startTime)
          const time1End = timeToMinutes(schedule1.endTime)
          const time2Start = timeToMinutes(schedule2.startTime)
          const time2End = timeToMinutes(schedule2.endTime)
          
          if (time1Start < time2End && time1End > time2Start) {
            conflicts.push({
              schedule1,
              schedule2,
              conflictType: 'time_overlap'
            })
          }
        }
        
        // Check for same student in multiple classes at same time
        if (schedule1.student.id === schedule2.student.id && 
            schedule1.class.id !== schedule2.class.id &&
            schedule1.dayOfWeek === schedule2.dayOfWeek) {
          const time1Start = timeToMinutes(schedule1.startTime)
          const time1End = timeToMinutes(schedule1.endTime)
          const time2Start = timeToMinutes(schedule2.startTime)
          const time2End = timeToMinutes(schedule2.endTime)
          
          if (time1Start < time2End && time1End > time2Start) {
            conflicts.push({
              schedule1,
              schedule2,
              conflictType: 'same_student_multiple_classes'
            })
          }
        }
      }
    }
    
    return conflicts
  }

  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours * 60 + minutes
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Filter schedules based on selected filters
  const filteredSchedules = schedules.filter(schedule => {
    const matchesDay = !selectedDay || schedule.dayOfWeek === selectedDay
    const matchesClass = !selectedClass || schedule.class.id === selectedClass
    return matchesDay && matchesClass
  })

  // Group schedules by day for calendar view
  const schedulesByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = filteredSchedules.filter(schedule => schedule.dayOfWeek === day)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
    return acc
  }, {} as Record<string, ScheduleWithDetails[]>)

  const conflicts = detectConflicts()

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-7 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Schedule Management</h3>
            <p className="text-sm text-gray-500">
              {filteredSchedules.length} schedules
              {conflicts.length > 0 && (
                <span className="text-red-600 ml-2">
                  • {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex rounded-md overflow-hidden border border-gray-300">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="rounded-none"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Calendar
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <Users className="w-4 h-4 mr-1" />
                List
              </Button>
            </div>
            <Button 
              onClick={onCreateSchedule}
              className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Schedule
            </Button>
          </div>
        </div>

        {/* Conflicts Alert */}
        {conflicts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900 mb-2">Schedule Conflicts Detected</h4>
                <div className="space-y-2">
                  {conflicts.slice(0, 3).map((conflict, index) => (
                    <div key={index} className="text-sm text-red-700">
                      {conflict.conflictType === 'time_overlap' ? (
                        <>Time overlap: {conflict.schedule1.class.name} and {conflict.schedule2.class.name} on {DAY_LABELS[conflict.schedule1.dayOfWeek as keyof typeof DAY_LABELS]}</>
                      ) : (
                        <>Student conflict: {conflict.schedule1.student.name} has overlapping classes</>
                      )}
                    </div>
                  ))}
                  {conflicts.length > 3 && (
                    <div className="text-sm text-red-600">
                      +{conflicts.length - 3} more conflicts
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Days</option>
            {DAYS_OF_WEEK.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Classes</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="grid grid-cols-7 gap-4">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="space-y-2">
                <h4 className="font-medium text-gray-900 text-center py-2 bg-gray-50 rounded">
                  {DAY_LABELS[day as keyof typeof DAY_LABELS]}
                </h4>
                <div className="space-y-2 min-h-[200px]">
                  {schedulesByDay[day].map(schedule => (
                    <div
                      key={schedule.id}
                      className="p-2 rounded border text-xs"
                      style={{ borderLeftColor: schedule.class.color, borderLeftWidth: '4px' }}
                    >
                      <div className="font-medium truncate">{schedule.class.name}</div>
                      <div className="text-gray-600 truncate">{schedule.student.name}</div>
                      <div className="text-gray-500">
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </div>
                      {schedule.title && (
                        <div className="text-gray-600 truncate mt-1">{schedule.title}</div>
                      )}
                      <div className="flex gap-1 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditSchedule(schedule.id)}
                          className="p-0.5 h-auto"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteSchedule(schedule.id)}
                          className="p-0.5 h-auto text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {filteredSchedules.map(schedule => (
              <div key={schedule.id} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: schedule.class.color }}
                  ></div>
                  <div>
                    <div className="font-medium text-gray-900">{schedule.class.name}</div>
                    <div className="text-sm text-gray-600">{schedule.student.name}</div>
                    {schedule.title && (
                      <div className="text-sm text-gray-500">{schedule.title}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <Badge variant="outline">
                    {DAY_LABELS[schedule.dayOfWeek as keyof typeof DAY_LABELS]}
                  </Badge>
                  <div className="text-sm text-gray-600">
                    {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditSchedule(schedule.id)}
                      className="p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteSchedule(schedule.id)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredSchedules.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg mb-2">No schedules found</p>
                <p className="text-sm">
                  {selectedDay || selectedClass 
                    ? 'Try adjusting your filters'
                    : 'Create your first schedule to get started'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}