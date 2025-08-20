'use client'

import { useState } from 'react'
import { Assignment, Class, AssignmentFolder } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, BookOpen, Copy, QrCode, Edit, Trash2, Eye, Users, Calendar, Clock } from 'lucide-react'

interface AssignmentWithDetails extends Assignment {
  class: Class
  folder?: AssignmentFolder
  submissionCount?: number
  completionRate?: number
  averageScore?: number
}

interface AssignmentManagementProps {
  assignments: AssignmentWithDetails[]
  classes: Class[]
  folders: AssignmentFolder[]
  onCreateAssignment: () => void
  onEditAssignment: (assignmentId: string) => void
  onDeleteAssignment: (assignmentId: string) => void
  onDuplicateAssignment: (assignmentId: string) => void
  onViewSubmissions: (assignmentId: string) => void
  onCopyCode: (code: string) => void
  onShowQRCode: (code: string) => void
  isLoading?: boolean
}

export function AssignmentManagement({
  assignments,
  classes,
  folders,
  onCreateAssignment,
  onEditAssignment,
  onDeleteAssignment,
  onDuplicateAssignment,
  onViewSubmissions,
  onCopyCode,
  onShowQRCode,
  isLoading = false
}: AssignmentManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  // Filter assignments based on search and filters
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesClass = !selectedClass || assignment.classId === selectedClass
    const matchesType = !selectedType || assignment.type === selectedType
    
    let matchesStatus = true
    if (selectedStatus) {
      const now = new Date()
      switch (selectedStatus) {
        case 'draft':
          matchesStatus = assignment.isDraft
          break
        case 'published':
          matchesStatus = assignment.isPublished && !assignment.isDraft
          break
        case 'due_soon':
          matchesStatus = assignment.dueDate && new Date(assignment.dueDate) > now && 
                         new Date(assignment.dueDate).getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000
          break
        case 'overdue':
          matchesStatus = assignment.dueDate && new Date(assignment.dueDate) < now
          break
      }
    }

    return matchesSearch && matchesClass && matchesType && matchesStatus
  })

  const getStatusColor = (assignment: AssignmentWithDetails) => {
    if (assignment.isDraft) return 'bg-gray-100 text-gray-800'
    
    const now = new Date()
    if (assignment.dueDate && new Date(assignment.dueDate) < now) {
      return 'bg-red-100 text-red-800'
    }
    
    if (assignment.dueDate && new Date(assignment.dueDate).getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000) {
      return 'bg-yellow-100 text-yellow-800'
    }
    
    return 'bg-green-100 text-green-800'
  }

  const getStatusLabel = (assignment: AssignmentWithDetails) => {
    if (assignment.isDraft) return 'Draft'
    
    const now = new Date()
    if (assignment.dueDate && new Date(assignment.dueDate) < now) {
      return 'Overdue'
    }
    
    if (assignment.dueDate && new Date(assignment.dueDate).getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000) {
      return 'Due Soon'
    }
    
    return 'Published'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DRAWING': return '🎨'
      case 'WRITING': return '✍️'
      case 'VOCABULARY': return '📚'
      case 'SPEAKING': return '🗣️'
      default: return '📝'
    }
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'No due date'
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
            <h3 className="text-lg font-semibold text-gray-900">Assignment Management</h3>
            <p className="text-sm text-gray-500">
              {filteredAssignments.length} of {assignments.length} assignments
            </p>
          </div>
          <Button 
            onClick={onCreateAssignment}
            className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Create Assignment
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
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

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="DRAWING">Drawing</option>
            <option value="WRITING">Writing</option>
            <option value="VOCABULARY">Vocabulary</option>
            <option value="SPEAKING">Speaking</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="due_soon">Due Soon</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {/* Assignment List */}
        <div className="space-y-3">
          {filteredAssignments.map(assignment => (
            <div key={assignment.id} className="bg-white border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(assignment.type)}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-1" 
                          style={{ backgroundColor: assignment.class.color }}
                        ></span>
                        {assignment.class.name}
                        {assignment.folder && (
                          <>
                            <span>•</span>
                            <span>{assignment.folder.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {assignment.description && (
                    <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
                  )}

                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(assignment.dueDate)}
                    </div>
                    
                    {assignment.submissionCount !== undefined && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {assignment.submissionCount} submissions
                      </div>
                    )}
                    
                    {assignment.completionRate !== undefined && (
                      <div className="flex items-center gap-1">
                        <span>{Math.round(assignment.completionRate)}% complete</span>
                      </div>
                    )}
                    
                    {assignment.averageScore !== undefined && (
                      <div className="flex items-center gap-1">
                        <span>Avg: {Math.round(assignment.averageScore)}%</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 ml-4">
                  <Badge className={getStatusColor(assignment)}>
                    {getStatusLabel(assignment)}
                  </Badge>
                  
                  {assignment.accessCode && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCopyCode(assignment.accessCode!)}
                        className="p-1"
                        title="Copy access code"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onShowQRCode(assignment.accessCode!)}
                        className="p-1"
                        title="Show QR code"
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewSubmissions(assignment.id)}
                      className="p-1"
                      title="View submissions"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditAssignment(assignment.id)}
                      className="p-1"
                      title="Edit assignment"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDuplicateAssignment(assignment.id)}
                      className="p-1"
                      title="Duplicate assignment"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteAssignment(assignment.id)}
                      className="p-1 text-red-600 hover:text-red-700"
                      title="Delete assignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredAssignments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">No assignments found</p>
              <p className="text-sm">
                {searchTerm || selectedClass || selectedType || selectedStatus
                  ? 'Try adjusting your filters'
                  : 'Create your first assignment to get started'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}