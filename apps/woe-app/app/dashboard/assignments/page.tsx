'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { ResponsiveLayout } from '@/components/dashboard/responsive-layout'
import { AssignmentFolderTabs } from '@/components/dashboard/assignment-folder-tabs'
import { Assignment, AssignmentFolder, Class, DashboardStats } from '@/lib/types'
import { Card } from '@/components/ui/Card'

export default function AssignmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [folders, setFolders] = useState<AssignmentFolder[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [showFolderManager, setShowFolderManager] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    totalStudents: 0,
    pendingSubmissions: 0,
    upcomingAssignments: 0
  })

  const fetchData = useCallback(async () => {
    if (!session?.user) return
    
    try {
      setIsLoading(true)
      
      // TODO: Replace with actual API calls
      // Mock data for demonstration
      const mockFolders: AssignmentFolder[] = [
        {
          id: 'folder1',
          name: 'Creative Writing',
          description: 'Creative writing assignments and exercises',
          color: '#EC4899',
          position: 0,
          teacherId: session.user.id,
          teacher: session.user as any,
          classId: 'class1',
          class: {} as any,
          assignments: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'folder2',
          name: 'Grammar Exercises',
          description: 'Grammar practice and drills',
          color: '#8B5CF6',
          position: 1,
          teacherId: session.user.id,
          teacher: session.user as any,
          classId: 'class1',
          class: {} as any,
          assignments: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      const mockAssignments: Assignment[] = [
        {
          id: 'assign1',
          title: 'Introduction Essay',
          description: 'Write a short essay about yourself',
          type: 'WRITING',
          isPublished: true,
          allowLateSubmission: true,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          teacherId: session.user.id,
          teacher: session.user as any,
          classId: 'class1',
          class: {} as any,
          folderId: 'folder1',
          folder: mockFolders[0],
          submissions: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'assign2',
          title: 'Vocabulary Quiz',
          description: 'Basic vocabulary assessment',
          type: 'VOCABULARY',
          isPublished: true,
          allowLateSubmission: false,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          teacherId: session.user.id,
          teacher: session.user as any,
          classId: 'class1',
          class: {} as any,
          folderId: 'folder2',
          folder: mockFolders[1],
          submissions: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'assign3',
          title: 'Free Drawing',
          description: 'Express yourself through art',
          type: 'DRAWING',
          isPublished: false,
          allowLateSubmission: true,
          teacherId: session.user.id,
          teacher: session.user as any,
          classId: 'class1',
          class: {} as any,
          submissions: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      // Update folder assignments
      mockFolders[0].assignments = [mockAssignments[0]]
      mockFolders[1].assignments = [mockAssignments[1]]

      setFolders(mockFolders)
      setAssignments(mockAssignments)
      setStats({
        totalClasses: 1,
        totalStudents: 1,
        pendingSubmissions: 0,
        upcomingAssignments: 2
      })

    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [session])

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

    fetchData()
  }, [session, status, router, fetchData])

  const handleMoveAssignment = async (assignmentId: string, folderId: string | null) => {
    try {
      // TODO: Replace with actual API call
      console.log('Moving assignment', assignmentId, 'to folder', folderId)
      
      // Update local state for demo
      setAssignments(prev => prev.map(assignment => 
        assignment.id === assignmentId 
          ? { 
              ...assignment, 
              folderId, 
              folder: folderId ? folders.find(f => f.id === folderId) : undefined 
            }
          : assignment
      ))
      
      // Update folder assignments
      setFolders(prev => prev.map(folder => ({
        ...folder,
        assignments: assignments.filter(a => a.folderId === folder.id)
      })))

    } catch (error) {
      console.error('Failed to move assignment:', error)
    }
  }

  const handleCreateFolder = async (name: string, color: string) => {
    try {
      // TODO: Replace with actual API call
      const newFolder: AssignmentFolder = {
        id: `folder_${Date.now()}`,
        name,
        color,
        position: folders.length,
        teacherId: session!.user.id,
        teacher: session!.user as any,
        classId: 'class1', // This would come from context
        class: {} as any,
        assignments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      setFolders(prev => [...prev, newFolder])
    } catch (error) {
      console.error('Failed to create folder:', error)
    }
  }

  const handleUpdateFolder = async (id: string, updates: Partial<AssignmentFolder>) => {
    try {
      // TODO: Replace with actual API call
      setFolders(prev => prev.map(folder => 
        folder.id === id ? { ...folder, ...updates } : folder
      ))
    } catch (error) {
      console.error('Failed to update folder:', error)
    }
  }

  const handleDeleteFolder = async (id: string) => {
    try {
      // TODO: Replace with actual API call
      // Move assignments to uncategorized
      setAssignments(prev => prev.map(assignment => 
        assignment.folderId === id 
          ? { ...assignment, folderId: null, folder: undefined }
          : assignment
      ))
      
      setFolders(prev => prev.filter(folder => folder.id !== id))
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
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Assignments</h1>
            <p className="text-gray-600">
              Manage and organize all assignments across your classes
            </p>
          </div>
        </div>

        <Card className="p-6">
          <AssignmentFolderTabs
            assignments={assignments}
            folders={folders}
            onMoveAssignment={handleMoveAssignment}
            onCreateFolder={handleCreateFolder}
            onUpdateFolder={handleUpdateFolder}
            onDeleteFolder={handleDeleteFolder}
            showFolderManager={showFolderManager}
            onToggleFolderManager={() => setShowFolderManager(!showFolderManager)}
          />
        </Card>
      </div>
    </ResponsiveLayout>
  )
}