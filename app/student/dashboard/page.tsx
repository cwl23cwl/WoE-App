'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'
import { Logo } from '@/components/ui/logo'
import { LogoutButton } from '@/components/ui/logout-button'
import { Button } from '@/components/ui/button'

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'STUDENT') {
      router.push('/teacher/dashboard')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'STUDENT') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Logo />
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Image
                  src={session.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`}
                  alt={session.user.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                  unoptimized={true}
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                  <p className="text-xs text-gray-500">Student</p>
                </div>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hi {session.user.name}! 👨‍🎓
          </h1>
          <p className="text-lg text-gray-600">
            Ready to practice your English writing today?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">My Assignments</h3>
                <p className="text-sm text-gray-600">Work on your writing tasks</p>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              View Assignments
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">My Classes</h3>
                <p className="text-sm text-gray-600">See your class progress</p>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              View Classes
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-full p-3 mr-4">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">My Progress</h3>
                <p className="text-sm text-gray-600">Track your learning</p>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              View Progress
            </Button>
          </div>
        </div>

        {/* Current Assignment */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Assignment</h2>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">My First Story</h3>
                <p className="text-gray-600 mb-4">
                  Draw a picture and write about it. Tell us what is happening in your drawing.
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mr-3">
                    Due in 5 days
                  </span>
                  <span>Beginning Writing Class</span>
                </div>
              </div>
              <Button className="bg-orange-500 hover:bg-orange-600">
                Start Writing
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Work */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Work</h2>
          <div className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <p>Your completed assignments will appear here.</p>
              <p className="text-sm mt-2">Start working on &quot;My First Story&quot; to see your progress!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}