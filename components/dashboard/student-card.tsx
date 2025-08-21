'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Assignment, SortConfig } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface Student {
  id: string
  name: string
  email?: string // Made optional for alignment consistency
  status?: string
  loginCode?: string
  createdAt: Date | string
  enrollments?: {
    class: {
      id: string
      name: string
      color: string
      level: string
    }
  }[]
  submissions?: {
    id: string
    status: string
    studentId: string
    updatedAt: Date | string
  }[]
}

interface StudentCardProps {
  student: Student
  assignments?: Assignment[]
  onStudentClick?: (studentId: string) => void
  density?: 'compact' | 'expanded'
  isLoading?: boolean
  className?: string
}

function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  })
}

function getLastAccessed(student: Student): string {
  if (!student.submissions || student.submissions.length === 0) return 'Never'
  
  const lastSubmission = student.submissions
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
  
  const date = new Date(lastSubmission.updatedAt)
  if (isNaN(date.getTime())) return 'Never'
  
  return formatDistanceToNow(date, { addSuffix: true })
}

export function StudentCard({ 
  student, 
  assignments = [],
  onStudentClick, 
  density = 'expanded',
  isLoading = false,
  className = ''
}: StudentCardProps) {
  const [showAllAssignments, setShowAllAssignments] = useState(false)
  const isCompact = density === 'compact'

  if (isLoading) {
    return (
      <div className={`flex flex-col h-full rounded-2xl border shadow-sm bg-white/70 backdrop-blur ${isCompact ? 'p-3' : 'p-5'} ${className}`}>
        <div className="animate-pulse flex flex-col h-full">
          {/* Header skeleton with fixed heights */}
          <div className="relative grid grid-cols-[auto,1fr] items-start gap-3 mb-4">
            <div className={`${isCompact ? 'w-8 h-8' : 'w-10 h-10'} bg-gray-200 rounded-full flex-shrink-0`}></div>
            <div className="space-y-2 min-w-0">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div> {/* Name slot */}
              <div className="h-5 bg-gray-200 rounded w-1/2"></div> {/* Email slot */}
              <div className="flex gap-2 min-h-7"> {/* Chips slot */}
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-12"></div>
              </div>
            </div>
            {/* Status badge position */}
            <div className="absolute right-0 top-0 w-16 h-6 bg-gray-200 rounded-full"></div>
          </div>
          
          {!isCompact && (
            <>
              {/* Metrics skeleton */}
              <div className="grid grid-cols-3 text-center py-3 mb-4">
                <div className="space-y-1">
                  <div className="h-5 bg-gray-200 rounded w-8 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-5 bg-gray-200 rounded w-8 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-5 bg-gray-200 rounded w-16 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                </div>
              </div>
              
              {/* Actions skeleton */}
              <div className="mt-auto flex gap-3">
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  const primaryClass = student.enrollments?.[0]?.class
  const studentAssignments = assignments.filter(a => 
    student.submissions?.some(s => s.studentId === student.id && a.id === s.id)
  )

  return (
    <div className={`flex flex-col h-full rounded-2xl border bg-white/70 shadow-sm hover:shadow-md transition-shadow relative ${isCompact ? 'p-3' : 'p-5'} ${className}`}>
      {/* Status badge - absolutely positioned to prevent layout shift */}
      {student.status && (
        <div className="absolute right-4 top-4 z-10">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            student.status === 'ACTIVE' 
              ? 'bg-green-100 text-green-700 border border-green-200'
              : student.status === 'INVITED'
              ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}>
            {student.status}
          </span>
        </div>
      )}

      {/* Header with fixed slots */}
      <div className="grid grid-cols-[auto,1fr] items-start gap-3 mb-4">
        {/* Avatar - fixed size */}
        <div 
          className={`${isCompact ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium cursor-pointer hover:scale-105 transition-transform flex-shrink-0`}
          onClick={() => onStudentClick?.(student.id)}
          aria-label={`View ${student.name}'s profile`}
        >
          {student.name.charAt(0).toUpperCase()}
        </div>

        {/* Student Info - fixed height slots */}
        <div className="min-w-0 space-y-2">
          {/* Name slot - fixed height */}
          <h3 
            className="text-base font-semibold leading-6 text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors h-6"
            onClick={() => onStudentClick?.(student.id)}
            title={student.name}
          >
            {student.name}
          </h3>
          
          {/* Email slot - always present to maintain layout */}
          {student.email ? (
            <p className="text-sm text-gray-500 leading-5 truncate h-5" title={student.email}>
              {student.email}
            </p>
          ) : (
            <span className="block h-5" aria-hidden="true"></span>
          )}
          
          {/* Chips row - fixed minimum height */}
          <div className="flex flex-wrap items-center gap-2 min-h-7">
            {primaryClass && (
              <div className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                <div 
                  className="w-2 h-2 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: primaryClass.color }}
                />
                <span className="truncate max-w-20">{primaryClass.name}</span>
              </div>
            )}
            {primaryClass?.level && (
              <div className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                <span>{primaryClass.level}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded content only */}
      {!isCompact && (
        <>
          {/* Metrics row - consistent baselines */}
          <div className="grid grid-cols-3 text-center py-3 mb-4">
            <div>
              <div className="text-sm font-medium leading-5 h-5 text-gray-900">
                {student.submissions?.length || 0}
              </div>
              <div className="text-[11px] leading-5 text-gray-500 h-5">Submissions</div>
            </div>
            <div>
              <div className="text-sm font-medium leading-5 h-5 text-gray-900">
                {student.submissions?.filter(s => s.status === 'GRADED').length || 0}
              </div>
              <div className="text-[11px] leading-5 text-gray-500 h-5">Graded</div>
            </div>
            <div>
              <div className="text-sm font-medium leading-5 h-5 text-gray-900 truncate" title={getLastAccessed(student)}>
                {getLastAccessed(student)}
              </div>
              <div className="text-[11px] leading-5 text-gray-500 h-5">Last Active</div>
            </div>
          </div>

          {/* Actions pinned to bottom */}
          <div className="mt-auto flex gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 h-8"
              onClick={() => onStudentClick?.(student.id)}
            >
              View Profile
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 h-8"
            >
              Message
            </Button>
          </div>
        </>
      )}

      {/* Compact mode actions */}
      {isCompact && (
        <div className="mt-auto flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="text-xs px-3 py-1 h-7"
            onClick={() => onStudentClick?.(student.id)}
          >
            View
          </Button>
        </div>
      )}
    </div>
  )
}