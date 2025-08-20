'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { ResponsiveLayout } from '@/components/dashboard/responsive-layout'
import { OverviewHeader } from '@/components/dashboard/overview-header'
import { ClassCardsAccordion } from '@/components/dashboard/class-cards-accordion'
import { CalendarView } from '@/components/dashboard/calendar-view'
import { Class, DashboardStats, AssignmentFolder, StudentCreationForm, AssignmentCreationForm, LoadingState, NotificationState } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StudentCreationModal } from '@/components/modals/student-creation-modal'
import { AssignmentCreationModal } from '@/components/modals/assignment-creation-modal'

export default function TeacherDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar'>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [classes, setClasses] = useState<Class[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    totalStudents: 0,
    pendingSubmissions: 0,
    upcomingAssignments: 0
  })

  // Modal states
  const [studentModalOpen, setStudentModalOpen] = useState(false)
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false })
  const [notification, setNotification] = useState<NotificationState | undefined>()
  const [folders, setFolders] = useState<AssignmentFolder[]>([])

  const fetchDashboardData = useCallback(async () => {
    if (!session?.user) return
    
    try {
      setIsLoading(true)
      
      // Fetch real data from API
      const classesResponse = await fetch('/api/classes')
      const classesData = await classesResponse.json()
      
      if (!classesResponse.ok) {
        throw new Error(classesData.error || 'Failed to fetch classes')
      }
      
      const classes = classesData.data || []
      
      // Extract folders from classes
      const allFolders = classes.flatMap((cls: any) => cls.folders || [])
      
      // Calculate dashboard stats
      const stats: DashboardStats = {
        totalClasses: classes.length,
        totalStudents: classes.reduce((acc: number, cls: any) => acc + (cls.enrollments?.length || 0), 0),
        pendingSubmissions: classes.reduce((acc: number, cls: any) => {
          const allAssignments = [...(cls.assignments || []), ...(cls.folders?.flatMap((f: any) => f.assignments || []) || [])]
          return acc + allAssignments.reduce((subAcc: number, assignment: any) => 
            subAcc + (assignment.submissions?.filter((sub: any) => sub.status === 'SUBMITTED').length || 0), 0
          )
        }, 0),
        upcomingAssignments: classes.reduce((acc: number, cls: any) => {
          const allAssignments = [...(cls.assignments || []), ...(cls.folders?.flatMap((f: any) => f.assignments || []) || [])]
          return acc + allAssignments.filter((assignment: any) => 
            assignment.dueDate && new Date(assignment.dueDate) > new Date()
          ).length
        }, 0)
      }

      setClasses(classes)
      setStats(stats)
      setFolders(allFolders)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [session])

  // Student creation handler
  const handleCreateStudent = async (data: StudentCreationForm) => {
    try {
      setLoading({ isLoading: true, message: 'Creating student...' })
      
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create student')
      }

      setNotification({
        type: 'success',
        message: result.message || 'Student created successfully'
      })

      // Refresh dashboard data
      fetchDashboardData()
      
      setTimeout(() => setNotification(undefined), 3000)
    } catch (error) {
      console.error('Failed to create student:', error)
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to create student'
      })
      setTimeout(() => setNotification(undefined), 5000)
    } finally {
      setLoading({ isLoading: false })
    }
  }

  // Assignment creation handler
  const handleCreateAssignment = async (data: AssignmentCreationForm) => {
    try {
      setLoading({ isLoading: true, message: 'Creating assignment...' })
      
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create assignment')
      }

      setNotification({
        type: 'success',
        message: result.message || 'Assignment created successfully'
      })

      // Refresh dashboard data
      fetchDashboardData()
      
      setTimeout(() => setNotification(undefined), 3000)
    } catch (error) {
      console.error('Failed to create assignment:', error)
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to create assignment'
      })
      setTimeout(() => setNotification(undefined), 5000)
    } finally {
      setLoading({ isLoading: false })
    }
  }

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'TEACHER') {
      router.push('/student/dashboard')
      return
    }

    fetchDashboardData()
  }, [session, status, router, fetchDashboardData])

  const handleStudentClick = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}` as any)
  }

  const handleDateClick = (date: Date, classes: Class[]) => {
    console.log('Date clicked:', date, 'Classes:', classes)
  }

  const handleMoveAssignment = async (assignmentId: string, folderId: string | null) => {
    try {
      // TODO: Replace with actual API call
      setClasses(prev => prev.map(classItem => {
        const updatedAssignments = classItem.assignments.map(assignment => 
          assignment.id === assignmentId 
            ? { 
                ...assignment, 
                folderId, 
                folder: folderId ? classItem.folders.find(f => f.id === folderId) : undefined 
              }
            : assignment
        )
        
        // Update folder assignments too
        const updatedFolders = classItem.folders.map(folder => ({
          ...folder,
          assignments: updatedAssignments.filter(a => a.folderId === folder.id)
        }))

        return {
          ...classItem,
          assignments: updatedAssignments,
          folders: updatedFolders
        }
      }))
    } catch (error) {
      console.error('Failed to move assignment:', error)
    }
  }

  const handleCreateFolder = async (classId: string, name: string, color: string) => {
    try {
      // TODO: Replace with actual API call
      const newFolder: AssignmentFolder = {
        id: `folder_${Date.now()}`,
        name,
        color,
        position: 0,
        teacherId: session!.user.id,
        teacher: session!.user as any,
        classId,
        class: {} as any,
        assignments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      setClasses(prev => prev.map(classItem => 
        classItem.id === classId 
          ? { ...classItem, folders: [...classItem.folders, newFolder] }
          : classItem
      ))
    } catch (error) {
      console.error('Failed to create folder:', error)
    }
  }

  const handleUpdateFolder = async (id: string, updates: Partial<AssignmentFolder>) => {
    try {
      // TODO: Replace with actual API call
      setClasses(prev => prev.map(classItem => ({
        ...classItem,
        folders: classItem.folders.map(folder => 
          folder.id === id ? { ...folder, ...updates } : folder
        )
      })))
    } catch (error) {
      console.error('Failed to update folder:', error)
    }
  }

  const handleDeleteFolder = async (id: string) => {
    try {
      // TODO: Replace with actual API call
      setClasses(prev => prev.map(classItem => ({
        ...classItem,
        assignments: classItem.assignments.map(assignment => 
          assignment.folderId === id 
            ? { ...assignment, folderId: null, folder: undefined }
            : assignment
        ),
        folders: classItem.folders.filter(folder => folder.id !== id)
      })))
    } catch (error) {
      console.error('Failed to delete folder:', error)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <ResponsiveLayout
        pendingSubmissions={stats.pendingSubmissions}
        totalClasses={stats.totalClasses}
        totalStudents={stats.totalStudents}
      >
        <OverviewHeader 
          userName="Loading..." 
          stats={stats} 
          isLoading={true}
          onCreateStudent={() => setStudentModalOpen(true)}
          onCreateAssignment={() => setAssignmentModalOpen(true)}
        />
        <ClassCardsAccordion
          classes={[]}
          isLoading={true}
          defaultOpenFirst={true}
        />
      </ResponsiveLayout>
    )
  }

  if (!session || session.user.role !== 'TEACHER') {
    return null
  }

  return (
    <ResponsiveLayout
      pendingSubmissions={stats.pendingSubmissions}
      totalClasses={stats.totalClasses}
      totalStudents={stats.totalStudents}
    >
      <div className="space-y-6">
        <OverviewHeader 
          userName={session.user.name} 
          stats={stats} 
          isLoading={isLoading}
          onCreateStudent={() => setStudentModalOpen(true)}
          onCreateAssignment={() => setAssignmentModalOpen(true)}
        />

        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === 'overview' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </Button>
          <Button
            variant={activeTab === 'calendar' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('calendar')}
          >
            📅 Calendar
          </Button>
        </div>

        {activeTab === 'overview' ? (
          <div className="space-y-6">
            {classes.length > 0 ? (
              <ClassCardsAccordion
                classes={classes}
                onStudentClick={handleStudentClick}
                onMoveAssignment={handleMoveAssignment}
                onCreateFolder={handleCreateFolder}
                onUpdateFolder={handleUpdateFolder}
                onDeleteFolder={handleDeleteFolder}
                isLoading={isLoading}
                defaultOpenFirst={true}
              />
            ) : (
              <Card className="p-12 text-center">
                <div className="text-gray-500 space-y-4">
                  <div className="text-6xl">📚</div>
                  <h3 className="text-xl font-medium">No classes yet</h3>
                  <p className="text-gray-400">
                    Create your first class to start teaching!
                  </p>
                  <Button className="mt-4">
                    Create Your First Class
                  </Button>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <CalendarView
            classes={classes}
            onDateClick={handleDateClick}
            onStudentClick={handleStudentClick}
            isLoading={isLoading}
          />
        )}

        {/* Modals */}
        <StudentCreationModal
          isOpen={studentModalOpen}
          onClose={() => setStudentModalOpen(false)}
          onSubmit={handleCreateStudent}
          classes={classes}
          loading={loading}
          notification={notification}
        />

        <AssignmentCreationModal
          isOpen={assignmentModalOpen}
          onClose={() => setAssignmentModalOpen(false)}
          onSubmit={handleCreateAssignment}
          classes={classes}
          folders={folders}
          loading={loading}
          notification={notification}
        />
      </div>
    </ResponsiveLayout>
  )
}