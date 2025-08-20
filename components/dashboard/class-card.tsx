'use client'

import { useState } from 'react'
import { Class, Assignment, SortConfig, AssignmentFolder } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AssignmentFolderTabs } from './assignment-folder-tabs'
import { formatDistanceToNow } from 'date-fns'

interface ClassCardProps {
  classData: Class
  onStudentClick?: (studentId: string) => void
  onMoveAssignment?: (assignmentId: string, folderId: string | null) => void
  onCreateFolder?: (classId: string, name: string, color: string) => void
  onUpdateFolder?: (id: string, updates: Partial<AssignmentFolder>) => void
  onDeleteFolder?: (id: string) => void
  isLoading?: boolean
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
    case 'DRAWING': return 'bg-blue-100 text-blue-800'
    case 'WRITING': return 'bg-green-100 text-green-800'
    case 'VOCABULARY': return 'bg-purple-100 text-purple-800'
    case 'SPEAKING': return 'bg-orange-100 text-orange-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function ClassCard({ 
  classData, 
  onStudentClick, 
  onMoveAssignment,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  isLoading 
}: ClassCardProps) {
  const [viewMode, setViewMode] = useState<'list' | 'folders'>('list')
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' })
  const [showAllAssignments, setShowAllAssignments] = useState(false)
  const [showFolderManager, setShowFolderManager] = useState(false)

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
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

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0" 
              style={{ backgroundColor: classData.color }}
            />
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {classData.name}
            </h3>
          </div>
          
          <div 
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg -ml-2"
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
        </div>
        
        <Badge variant="outline" className="ml-2">
          {classData.level}
        </Badge>
      </div>

      {classData.assignments.length > 0 ? (
        <>
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Assignments</h4>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    📋 List
                  </Button>
                  <Button
                    variant={viewMode === 'folders' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('folders')}
                  >
                    📁 Folders
                  </Button>
                </div>
                
                {viewMode === 'list' && (
                  <div className="flex gap-1 text-xs ml-2">
                    <button 
                      onClick={() => handleSort('title')}
                      className="px-2 py-1 hover:bg-gray-100 rounded text-gray-600"
                    >
                      Name {getSortIcon('title')}
                    </button>
                    <button 
                      onClick={() => handleSort('dueDate')}
                      className="px-2 py-1 hover:bg-gray-100 rounded text-gray-600"
                    >
                      Due {getSortIcon('dueDate')}
                    </button>
                    <button 
                      onClick={() => handleSort('createdAt')}
                      className="px-2 py-1 hover:bg-gray-100 rounded text-gray-600"
                    >
                      Created {getSortIcon('createdAt')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

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
              <div className="space-y-2 mb-4">
                {displayedAssignments.map((assignment) => {
                  const submission = assignment.submissions.find(s => s.studentId === student.id)
                  
                  return (
                    <div key={assignment.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-gray-900 truncate">
                              {assignment.title}
                            </h5>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getAssignmentTypeColor(assignment.type)}`}
                            >
                              {assignment.type}
                            </Badge>
                            {assignment.folder && (
                              <div className="flex items-center gap-1">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: assignment.folder.color }}
                                />
                                <span className="text-xs text-gray-500">{assignment.folder.name}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {assignment.dueDate && (
                              <span>Due: {formatDate(assignment.dueDate)}</span>
                            )}
                            <span>Created: {formatDate(assignment.createdAt)}</span>
                            <span>Last accessed: {getLastAccessed(assignment)}</span>
                          </div>
                          
                          {submission && (
                            <div className="mt-2">
                              <Badge 
                                variant={submission.status === 'GRADED' ? 'primary' : 'secondary'}
                                className="text-xs"
                              >
                                {submission.status}
                                {submission.score !== undefined && submission.maxScore && 
                                  ` (${submission.score}/${submission.maxScore})`
                                }
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {classData.assignments.length > 3 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAllAssignments(!showAllAssignments)}
                  className="w-full"
                >
                  {showAllAssignments 
                    ? `Show less` 
                    : `Show ${classData.assignments.length - 3} more assignments`
                  }
                </Button>
              )}
            </>
          )}
        </>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">No assignments yet</p>
          <Button variant="outline" size="sm" className="mt-2">
            Create Assignment
          </Button>
        </div>
      )}
    </Card>
  )
}