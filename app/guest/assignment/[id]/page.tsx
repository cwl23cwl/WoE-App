'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/Button'
import { GuestSessionManager, GuestSession } from '@/lib/guest-session'
import { SaveProgressModal } from '@/components/guest/save-progress-modal'

export default function GuestAssignmentPage() {
  const params = useParams()
  const router = useRouter()
  const [assignment, setAssignment] = useState<any>(null)
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [workData, setWorkData] = useState({
    excalidrawData: null,
    textContent: '',
    notes: ''
  })
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)

  const assignmentId = params.id as string
  const guestManager = GuestSessionManager.getInstance()

  // Load assignment and guest session
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check for current guest session
        const currentSession = guestManager.getCurrentGuestSession()
        if (!currentSession || currentSession.assignmentId !== assignmentId) {
          // No valid session, redirect back
          router.push('/')
          return
        }

        setGuestSession(currentSession)

        // Load existing work data if any
        if (currentSession.workData) {
          setWorkData({
            excalidrawData: currentSession.workData.excalidrawData || null,
            textContent: currentSession.workData.textContent || '',
            notes: currentSession.workData.notes || ''
          })
        }

        // Fetch assignment details
        const response = await fetch(`/api/assignments/${assignmentId}`)
        if (!response.ok) {
          throw new Error('Failed to load assignment')
        }

        const assignmentData = await response.json()
        setAssignment(assignmentData)

        // Initialize canvas data if empty
        if (!currentSession.workData?.excalidrawData && assignmentData.excalidrawData) {
          setWorkData(prev => ({
            ...prev,
            excalidrawData: assignmentData.excalidrawData
          }))
        }

      } catch (error) {
        setError('Failed to load assignment. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [assignmentId, router, guestManager])

  // Auto-save work data
  const saveWork = useCallback(() => {
    if (guestSession && autoSaveEnabled) {
      guestManager.updateGuestWork(guestSession.id, workData)
      
      // Check if we should prompt for account creation
      if (guestManager.shouldPromptAccountCreation(guestSession.id)) {
        setAutoSaveEnabled(false) // Don't prompt multiple times
        setShowSaveModal(true)
      }
    }
  }, [guestSession, workData, autoSaveEnabled, guestManager])

  // Auto-save on work changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveWork()
    }, 2000) // Save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId)
  }, [workData, saveWork])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWorkData(prev => ({
      ...prev,
      textContent: e.target.value
    }))
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWorkData(prev => ({
      ...prev,
      notes: e.target.value
    }))
  }

  const handleSaveProgress = () => {
    setShowSaveModal(true)
  }

  const handleContinueGuest = () => {
    setShowSaveModal(false)
    setAutoSaveEnabled(false) // Don't prompt again this session
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignment...</p>
        </div>
      </div>
    )
  }

  if (error || !assignment || !guestSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'Failed to load assignment'}
            </p>
            <Button 
              onClick={() => router.push('/')}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Logo />
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-sm">👋</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {guestSession.tempName}
                  </p>
                  <p className="text-xs text-gray-500">Guest</p>
                </div>
              </div>
              <Button
                onClick={handleSaveProgress}
                className="bg-green-500 hover:bg-green-600"
              >
                Save Progress
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Assignment Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Assignment Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {assignment.title}
              </h1>
              <p className="text-gray-600 mb-4">
                {assignment.description}
              </p>
              {assignment.instructions && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
                  <p className="text-blue-800 text-sm">
                    {assignment.instructions}
                  </p>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="bg-orange-100 rounded-lg p-3">
                <p className="text-xs text-orange-700 font-medium">
                  Class: {assignment.class?.name}
                </p>
                <p className="text-xs text-orange-600">
                  Code: {guestSession.assignmentCode}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Drawing/Canvas Area */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Drawing Area
            </h3>
            <div className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 aspect-[4/3] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <span className="text-4xl mb-2 block">🎨</span>
                <p className="text-sm">Drawing canvas will be integrated here</p>
                <p className="text-xs mt-1">
                  (This will use Excalidraw for drawing and writing)
                </p>
              </div>
            </div>
          </div>

          {/* Text Area */}
          <div className="space-y-6">
            {/* Writing Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Writing
              </h3>
              <textarea
                value={workData.textContent}
                onChange={handleTextChange}
                placeholder="Write your story here... Tell us about your drawing!"
                className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                {workData.textContent.length} characters
              </p>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Notes & Ideas
              </h3>
              <textarea
                value={workData.notes}
                onChange={handleNotesChange}
                placeholder="Write any notes or ideas here..."
                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              />
            </div>

            {/* Auto-save indicator */}
            {autoSaveEnabled && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">💾</span>
                  <p className="text-sm text-green-700">
                    Your work is being saved automatically
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Save Progress Modal */}
      {showSaveModal && (
        <SaveProgressModal
          guestSession={guestSession}
          onClose={() => setShowSaveModal(false)}
          onContinueGuest={handleContinueGuest}
        />
      )}
    </div>
  )
}