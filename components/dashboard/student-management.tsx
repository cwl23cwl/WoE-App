'use client'

import { useState } from 'react'
import { User, Schedule, Class } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Download, Mail, UserPlus, Edit, Trash2, Calendar } from 'lucide-react'

interface StudentWithDetails extends User {
  schedules: Schedule[]
  enrollments: {
    class: Class
    joinedAt: Date
    isActive: boolean
  }[]
}

interface StudentManagementProps {
  students: StudentWithDetails[]
  classes: Class[]
  onCreateStudent: () => void
  onEditStudent: (studentId: string) => void
  onDeleteStudent: (studentId: string) => void
  onSendInvite: (studentId: string) => void
  onExportLoginCards: (studentIds: string[]) => void
  isLoading?: boolean
}

export function StudentManagement({
  students,
  classes,
  onCreateStudent,
  onEditStudent,
  onDeleteStudent,
  onSendInvite,
  onExportLoginCards,
  isLoading = false
}: StudentManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  // Filter students based on search and filters
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesClass = !selectedClass || 
                        student.enrollments.some(enrollment => enrollment.class.id === selectedClass)
    
    const matchesStatus = !selectedStatus || student.status === selectedStatus

    return matchesSearch && matchesClass && matchesStatus
  })

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'INVITED': return 'bg-yellow-100 text-yellow-800'
      case 'INACTIVE': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatSchedule = (schedules: Schedule[]) => {
    if (schedules.length === 0) return 'No schedule'
    return schedules.map(schedule => 
      `${schedule.dayOfWeek} ${schedule.startTime}-${schedule.endTime}`
    ).join(', ')
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
            <h3 className="text-lg font-semibold text-gray-900">Student Management</h3>
            <p className="text-sm text-gray-500">
              {filteredStudents.length} of {students.length} students
            </p>
          </div>
          <div className="flex gap-3">
            {selectedStudents.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExportLoginCards(selectedStudents)}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Login Cards ({selectedStudents.length})
              </Button>
            )}
            <Button 
              onClick={onCreateStudent}
              className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search students..."
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
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INVITED">Invited</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {/* Student List */}
        <div className="space-y-3">
          {/* Header Row */}
          <div className="flex items-center gap-4 py-2 px-4 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex-1">Name & Email</div>
            <div className="w-32">Status</div>
            <div className="w-48">Classes</div>
            <div className="w-48">Schedule</div>
            <div className="w-32">Actions</div>
          </div>

          {/* Student Rows */}
          {filteredStudents.map(student => (
            <div key={student.id} className="flex items-center gap-4 py-3 px-4 bg-white border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={selectedStudents.includes(student.id)}
                onChange={() => handleSelectStudent(student.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              
              <div className="flex-1">
                <div className="font-medium text-gray-900">{student.name}</div>
                <div className="text-sm text-gray-500">{student.email}</div>
                {student.loginCode && (
                  <div className="text-xs text-blue-600 font-mono">Code: {student.loginCode}</div>
                )}
              </div>

              <div className="w-32">
                <Badge className={getStatusColor(student.status || 'INACTIVE')}>
                  {student.status || 'INACTIVE'}
                </Badge>
              </div>

              <div className="w-48">
                <div className="space-y-1">
                  {student.enrollments.map(enrollment => (
                    <div key={enrollment.class.id} className="text-sm">
                      <span 
                        className="inline-block w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: enrollment.class.color }}
                      ></span>
                      {enrollment.class.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-48">
                <div className="text-sm text-gray-600">
                  {formatSchedule(student.schedules)}
                </div>
              </div>

              <div className="w-32 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditStudent(student.id)}
                  className="p-1"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                
                {student.status === 'INVITED' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSendInvite(student.id)}
                    className="p-1"
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteStudent(student.id)}
                  className="p-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {filteredStudents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">No students found</p>
              <p className="text-sm">
                {searchTerm || selectedClass || selectedStatus 
                  ? 'Try adjusting your filters'
                  : 'Create your first student to get started'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}