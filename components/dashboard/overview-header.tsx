'use client'

import { DashboardStats } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus, BookOpen } from 'lucide-react'

interface OverviewHeaderProps {
  userName: string
  stats: DashboardStats
  isLoading?: boolean
  onCreateStudent?: () => void
  onCreateAssignment?: () => void
}

export function OverviewHeader({ userName, stats, isLoading, onCreateStudent, onCreateAssignment }: OverviewHeaderProps) {
  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {userName}! 👩‍🏫
            </h1>
            <p className="text-lg text-gray-600">
              Ready to inspire your students today?
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={onCreateStudent}
              className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Students
            </Button>
            <Button 
              onClick={onCreateAssignment}
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Create Assignment
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Total Classes</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalClasses}</p>
            </div>
            <div className="text-2xl">📚</div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Total Students</p>
              <p className="text-2xl font-bold text-green-900">{stats.totalStudents}</p>
            </div>
            <div className="text-2xl">👥</div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 mb-1">Pending Submissions</p>
              <p className="text-2xl font-bold text-orange-900">{stats.pendingSubmissions}</p>
            </div>
            <div className="text-2xl">📝</div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Upcoming Assignments</p>
              <p className="text-2xl font-bold text-purple-900">{stats.upcomingAssignments}</p>
            </div>
            <div className="text-2xl">⏰</div>
          </div>
        </Card>
      </div>
    </div>
  )
}