'use client'

import { useState } from 'react'
import { Class, Assignment, SortConfig, AssignmentFolder } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AssignmentFolderTabs } from './assignment-folder-tabs'
import { formatDistanceToNow } from 'date-fns'

interface RefinedClassCardProps {
  classData: Class
  onStudentClick?: (studentId: string) => void
  onMoveAssignment?: (assignmentId: string, folderId: string | null) => void
  onCreateFolder?: (classId: string, name: string, color: string) => void
  onUpdateFolder?: (id: string, updates: Partial<AssignmentFolder>) => void
  onDeleteFolder?: (id: string) => void
  isLoading?: boolean
  renderHeaderOnly?: boolean
  renderContentOnly?: boolean
  disableInteractions?: boolean // For accordion usage to prevent nested buttons
}

function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  })
}

function getAssignmentTypeColor(type: string) {
  switch (type) {
    case 'DRAWING': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'WRITING': return 'bg-green-100 text-green-800 border-green-200'
    case 'VOCABULARY': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'SPEAKING': return 'bg-orange-100 text-orange-800 border-orange-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function LoadingSkeleton() {
  return (
    <div className="rounded-2xl border shadow-sm bg-white/70 backdrop-blur p-5 lg:p-6">
      <div className="animate-pulse">
        <div className="grid grid-cols-[auto,1fr,auto] items-center gap-4 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="space-y-1">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function RefinedClassCard({ 
  classData, 
  onStudentClick, 
  onMoveAssignment,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  isLoading = false,
  renderHeaderOnly = false,
  renderContentOnly = false,
  disableInteractions = false
}: RefinedClassCardProps) {
  const [viewMode, setViewMode] = useState<'list' | 'folders'>('list')
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' })
  const [showAllAssignments, setShowAllAssignments] = useState(false)
  const [showFolderManager, setShowFolderManager] = useState(false)

  if (isLoading) {
    return <LoadingSkeleton />
  }

  const student = classData.enrollments[0]?.student
  if (!student) return null

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const sortedAssignments = [...classData.assignments].sort((a, b) => {
    let aValue: any = a[sortConfig.key]
    let bValue: any = b[sortConfig.key]

    if (sortConfig.key === 'dueDate' || sortConfig.key === 'createdAt') {
      aValue = aValue ? new Date(aValue).getTime() : 0
      bValue = bValue ? new Date(bValue).getTime() : 0
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const displayedAssignments = showAllAssignments ? sortedAssignments : sortedAssignments.slice(0, 3)

  const getSortIcon = (key: SortConfig['key']) => {
    if (sortConfig.key !== key) return '↕️'
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  const getLastAccessed = (assignment: Assignment) => {
    const submission = assignment.submissions.find(s => s.studentId === student.id)
    if (!submission) return 'Never'
    
    const lastDate = submission.updatedAt
    return formatDistanceToNow(new Date(lastDate), { addSuffix: true })
  }


  const CardHeader = () => (
    <div className="grid grid-cols-[auto,1fr,auto] items-center gap-4">
      {/* Avatar */}
      <div 
        className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-medium cursor-pointer hover:scale-105 transition-transform"
        onClick={() => onStudentClick?.(student.id)}
        aria-label={`View ${student.name}'s profile`}
      >
        {student.name.charAt(0).toUpperCase()}
      </div>

      {/* Student Info */}
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <h3 
            className="text-lg font-semibold leading-tight text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => onStudentClick?.(student.id)}
          >
            {student.name}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground leading-tight truncate">
          {student.email}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <div 
              className="w-2 h-2 rounded-full flex-shrink-0" 
              style={{ backgroundColor: classData.color }}
            />
            <span>{classData.name}</span>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            <span>{classData.level}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {!disableInteractions && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            aria-label="Class options"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              className="w-4 h-4"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="1"/>
              <circle cx="12" cy="5" r="1"/>
              <circle cx="12" cy="19" r="1"/>
            </svg>
          </Button>
        </div>
      )}
    </div>
  )

  const AssignmentsSection = () => (
    <div className="space-y-3 sm:space-y-4">
      {classData.assignments.length > 0 ? (
        <>
          {/* Two-Row Toolbar */}
          <div className="space-y-3">
            {/* Row 1: Fixed toolbar - always visible */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h4 className="text-sm font-medium text-gray-900">Assignments</h4>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                {/* View Mode Toggle - Always visible */}
                <div className="inline-flex items-center gap-1 rounded-lg border p-1">
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'ghost'}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setViewMode('list')}
                    aria-pressed={viewMode === 'list'}
                  >
                    <span className="inline-flex items-center gap-1 align-middle">
                      <svg className="icon-16 w-3 h-3" aria-hidden="true">
                        <rect x="2" y="3" width="12" height="2" fill="currentColor"/>
                        <rect x="2" y="7" width="12" height="2" fill="currentColor"/>
                        <rect x="2" y="11" width="12" height="2" fill="currentColor"/>
                      </svg>
                      <span className="hidden sm:inline">List</span>
                    </span>
                  </Button>
                  <Button
                    variant={viewMode === 'folders' ? 'primary' : 'ghost'}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setViewMode('folders')}
                    aria-pressed={viewMode === 'folders'}
                  >
                    <span className="inline-flex items-center gap-1 align-middle">
                      <svg className="icon-16 w-3 h-3" aria-hidden="true">
                        <path d="M3 7V3h4l2 2h6v9H3V7z" stroke="currentColor" fill="none"/>
                      </svg>
                      <span className="hidden sm:inline">Folders</span>
                    </span>
                  </Button>
                </div>
                
                {/* Persistent Sort Actions - Always visible */}
                <div className="inline-flex items-center gap-1 rounded-lg border p-1">
                  {(['title', 'dueDate', 'createdAt'] as const).map((key) => (
                    <button 
                      key={key}
                      onClick={() => handleSort(key)}
                      className="inline-flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded text-xs text-gray-600 align-middle disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={viewMode === 'folders'}
                      title={viewMode === 'folders' ? 'Sorting not available in folders view' : ''}
                    >
                      <span className="hidden sm:inline">
                        {key === 'title' ? 'Name' : key === 'dueDate' ? 'Due' : 'Created'}
                      </span>
                      <span className="sm:hidden">
                        {key === 'title' ? 'N' : key === 'dueDate' ? 'D' : 'C'}
                      </span>
                      <span className="icon-16 text-xs">{getSortIcon(key)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Sub-toolbar - slides in/out based on view mode */}
            <div className="space-y-2">
              {/* List View Sub-toolbar */}
              <div 
                className={`toolbar-transition overflow-hidden ${
                  viewMode === 'list' ? 'toolbar-row-visible' : 'toolbar-row-hidden'
                }`}
                data-state={viewMode === 'list' ? 'open' : 'closed'}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="text-xs text-gray-500">
                    Showing {displayedAssignments.length} of {classData.assignments.length} assignments
                  </div>
                  <div className="flex items-center gap-2">
                    {classData.assignments.length > 3 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowAllAssignments(!showAllAssignments)}
                        className="text-xs h-6 px-2"
                      >
                        {showAllAssignments 
                          ? `Show less` 
                          : `Show ${classData.assignments.length - 3} more`
                        }
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Folders View Sub-toolbar */}
              <div 
                className={`toolbar-transition overflow-hidden ${
                  viewMode === 'folders' ? 'toolbar-row-visible' : 'toolbar-row-hidden'
                }`}
                data-state={viewMode === 'folders' ? 'open' : 'closed'}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="text-xs text-gray-500">
                    {classData.folders?.length || 0} folders • Drag assignments to organize
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFolderManager(!showFolderManager)}
                    className="text-xs h-6 px-2"
                  >
                    <svg className="icon-16 w-3 h-3 mr-1" aria-hidden="true">
                      <path d="M12 5v6m3-3H9M5 21V3h14v18H5z" stroke="currentColor" fill="none"/>
                    </svg>
                    <span className="hidden sm:inline">Manage </span>Folders
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment Content */}
          {viewMode === 'folders' ? (
            <AssignmentFolderTabs
              assignments={classData.assignments}
              folders={classData.folders || []}
              onMoveAssignment={onMoveAssignment || (() => {})}
              onCreateFolder={(name, color) => onCreateFolder?.(classData.id, name, color)}
              onUpdateFolder={onUpdateFolder || (() => {})}
              onDeleteFolder={onDeleteFolder || (() => {})}
              showFolderManager={showFolderManager}
              onToggleFolderManager={() => setShowFolderManager(!showFolderManager)}
            />
          ) : (
            <>
              <div className="space-y-2">
                {displayedAssignments.map((assignment) => {
                  const submission = assignment.submissions.find(s => s.studentId === student.id)
                  
                  return (
                    <div key={assignment.id} className="rounded-xl border p-4 sm:p-5 flex flex-col gap-2 bg-white hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-gray-900 truncate">
                              {assignment.title}
                            </h5>
                            <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${getAssignmentTypeColor(assignment.type)}`}>
                              {assignment.type}
                            </div>
                            {assignment.folder && (
                              <div className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: assignment.folder.color }}
                                />
                                <span>{assignment.folder.name}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {assignment.dueDate && (
                              <span className="inline-flex items-center gap-1 align-middle">
                                <svg width="16" height="16" className="w-3 h-3" aria-hidden="true">
                                  <circle cx="8" cy="8" r="6" stroke="currentColor" fill="none"/>
                                  <path d="M8 4v4l3 2" stroke="currentColor"/>
                                </svg>
                                Due: {formatDate(assignment.dueDate)}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 align-middle">
                              <svg width="16" height="16" className="w-3 h-3" aria-hidden="true">
                                <path d="M8 2v6l4 2" stroke="currentColor" fill="none"/>
                                <circle cx="8" cy="8" r="6" stroke="currentColor" fill="none"/>
                              </svg>
                              Created: {formatDate(assignment.createdAt)}
                            </span>
                            <span className="inline-flex items-center gap-1 align-middle">
                              <svg width="16" height="16" className="w-3 h-3" aria-hidden="true">
                                <path d="M12 1v6M6 1v6M4 7h16M4 7v11a2 2 0 002 2h12a2 2 0 002-2V7" stroke="currentColor" fill="none"/>
                              </svg>
                              Last: {getLastAccessed(assignment)}
                            </span>
                          </div>
                          
                          {submission && (
                            <div className="mt-2">
                              <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${
                                submission.status === 'GRADED' 
                                  ? 'bg-green-100 text-green-800 border-green-200' 
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              }`}>
                                {submission.status}
                                {submission.score !== undefined && submission.maxScore && 
                                  ` (${submission.score}/${submission.maxScore})`
                                }
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <div className="space-y-2">
            <svg width="48" height="48" className="w-12 h-12 mx-auto text-gray-300" aria-hidden="true">
              <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" fill="none"/>
              <path d="M16 20h16M16 28h8" stroke="currentColor"/>
            </svg>
            <p className="text-sm">No assignments yet</p>
            <Button variant="outline" size="sm" className="mt-2">
              Create Assignment
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  // Handle special rendering modes
  if (renderHeaderOnly) {
    return <CardHeader />
  }

  if (renderContentOnly) {
    return <AssignmentsSection />
  }


  return (
    <div className="rounded-2xl border shadow-sm bg-white/70 backdrop-blur p-5 lg:p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        <CardHeader />
        <AssignmentsSection />
      </div>
    </div>
  )
}