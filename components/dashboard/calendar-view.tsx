'use client'

import { useState } from 'react'
import { Class, CalendarDay } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isSameDay, 
  isToday, 
  addMonths, 
  subMonths,
  getDay,
  startOfWeek,
  endOfWeek
} from 'date-fns'

interface CalendarViewProps {
  classes: Class[]
  onDateClick?: (date: Date, classes: Class[]) => void
  onStudentClick?: (studentId: string) => void
  isLoading?: boolean
}

export function CalendarView({ classes, onDateClick, onStudentClick, isLoading }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(42)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  })

  const getClassesForDate = (date: Date): Class[] => {
    return classes.filter(classItem => {
      return classItem.assignments.some(assignment => {
        if (!assignment.dueDate) return false
        return isSameDay(new Date(assignment.dueDate), date)
      })
    })
  }

  const getCalendarDay = (date: Date): CalendarDay => {
    const dayClasses = getClassesForDate(date)
    return {
      date,
      isToday: isToday(date),
      hasClasses: dayClasses.length > 0,
      classes: dayClasses
    }
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    const dayClasses = getClassesForDate(date)
    onDateClick?.(date, dayClasses)
  }

  const handlePreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1))
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const selectedDateClasses = selectedDate ? getClassesForDate(selectedDate) : []

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              ←
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              →
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date) => {
            const calendarDay = getCalendarDay(date)
            const isCurrentMonth = date.getMonth() === currentDate.getMonth()
            const isSelected = selectedDate && isSameDay(date, selectedDate)
            
            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                className={`
                  relative p-2 h-16 text-sm border rounded-lg transition-all duration-200
                  ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                  ${calendarDay.isToday ? 'bg-blue-100 border-blue-300 font-semibold' : 'border-gray-200'}
                  ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                  ${calendarDay.hasClasses ? 'bg-orange-50 border-orange-200' : ''}
                  hover:bg-gray-50 hover:border-gray-300
                `}
              >
                <span className="block">{format(date, 'd')}</span>
                
                {calendarDay.hasClasses && (
                  <div className="absolute bottom-1 left-1 right-1">
                    <div className="flex justify-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </Card>

      {selectedDate && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          
          {selectedDateClasses.length > 0 ? (
            <div className="space-y-4">
              {selectedDateClasses.map((classItem) => {
                const student = classItem.enrollments[0]?.student
                const dueTodayAssignments = classItem.assignments.filter(a => 
                  a.dueDate && isSameDay(new Date(a.dueDate), selectedDate)
                )
                
                return (
                  <div key={classItem.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: classItem.color }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{classItem.name}</h4>
                          <Badge variant="outline" className="mt-1">
                            {classItem.level}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {student && (
                      <div 
                        className="flex items-center gap-2 mb-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg -ml-2"
                        onClick={() => onStudentClick?.(student.id)}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">Assignments due today:</h5>
                      {dueTodayAssignments.map((assignment) => (
                        <div key={assignment.id} className="bg-orange-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{assignment.title}</p>
                              <p className="text-sm text-gray-600">{assignment.description}</p>
                            </div>
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              {assignment.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>No classes or assignments due on this date</p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}