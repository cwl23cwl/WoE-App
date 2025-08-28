'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Assignment, AssignmentFolder } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/Card'
import { formatDistanceToNow } from 'date-fns'

interface DraggableAssignmentItemProps {
  assignment: Assignment
  folder?: AssignmentFolder
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

function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  })
}

export function DraggableAssignmentItem({ assignment, folder }: DraggableAssignmentItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: assignment.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const submittedCount = assignment.submissions.filter(s => s.status === 'SUBMITTED').length
  const gradedCount = assignment.submissions.filter(s => s.status === 'GRADED').length
  const totalSubmissions = assignment.submissions.length

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50 scale-105' : ''
      }`}
    >
      <Card className={`p-4 transition-all duration-200 hover:shadow-md ${
        isDragging ? 'shadow-lg border-blue-300' : ''
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="secondary" 
                className={`text-xs ${getAssignmentTypeColor(assignment.type)}`}
              >
                {assignment.type}
              </Badge>
              
              {folder && (
                <div className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: folder.color }}
                  />
                  <span className="text-xs text-gray-500">{folder.name}</span>
                </div>
              )}

              {!assignment.isPublished && (
                <Badge variant="outline" className="text-xs">
                  Draft
                </Badge>
              )}
            </div>

            <h4 className="font-medium text-gray-900 mb-1 truncate">
              {assignment.title}
            </h4>
            
            {assignment.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {assignment.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Created: {formatDate(assignment.createdAt)}</span>
              
              {assignment.dueDate && (
                <span>Due: {formatDate(assignment.dueDate)}</span>
              )}
              
              <span>Updated: {formatDistanceToNow(new Date(assignment.updatedAt), { addSuffix: true })}</span>
            </div>

            {totalSubmissions > 0 && (
              <div className="mt-3 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-gray-600">Submissions:</span>
                  <Badge variant="secondary" className="text-xs">
                    {totalSubmissions}
                  </Badge>
                </div>
                
                {submittedCount > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-orange-600">Pending:</span>
                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                      {submittedCount}
                    </Badge>
                  </div>
                )}
                
                {gradedCount > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-green-600">Graded:</span>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      {gradedCount}
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 ml-4">
            <div className="text-xs text-gray-400">
              📋 Drag to move
            </div>
            
            {assignment.maxScore && (
              <div className="text-sm text-gray-500">
                Max: {assignment.maxScore} pts
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}