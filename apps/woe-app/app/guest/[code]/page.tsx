'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GuestSessionManager } from '@/lib/guest-session'

const guestNameSchema = z.object({
  name: z.string().min(2, 'Please enter your name (at least 2 characters)'),
})

type GuestNameForm = z.infer<typeof guestNameSchema>

export default function GuestCodeAccessPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [assignment, setAssignment] = useState<any>(null)
  const [isLoadingAssignment, setIsLoadingAssignment] = useState(true)

  const code = params.code as string
  const guestManager = GuestSessionManager.getInstance()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestNameForm>({
    resolver: zodResolver(guestNameSchema),
  })

  // Check if assignment exists and load it
  useEffect(() => {
    const loadAssignment = async () => {
      if (!code) return

      try {
        // First check if we already have a guest session for this code
        const existingSession = guestManager.getSessionByCode(code.toUpperCase())
        if (existingSession) {
          // Resume existing session
          guestManager.setCurrentGuestSession(existingSession.id)
          router.push(`/guest/assignment/${existingSession.assignmentId}`)
          return
        }

        // Fetch assignment by code
        const response = await fetch(`/api/assignments/by-code/${code.toUpperCase()}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Assignment code not found. Please check the code and try again.')
          } else {
            setError('Something went wrong. Please try again.')
          }
          return
        }

        const assignmentData = await response.json()
        setAssignment(assignmentData)
      } catch (error) {
        setError('Something went wrong. Please try again.')
      } finally {
        setIsLoadingAssignment(false)
      }
    }

    loadAssignment()
  }, [code, router, guestManager])

  const onSubmit = async (data: GuestNameForm) => {
    if (!assignment) return

    setIsLoading(true)
    setError('')

    try {
      // Create guest session
      const session = guestManager.createGuestSession(
        assignment.id,
        code.toUpperCase(),
        data.name
      )

      // Redirect to guest assignment interface
      router.push(`/guest/assignment/${assignment.id}`)
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingAssignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignment...</p>
        </div>
      </div>
    )
  }

  if (error && !assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <Logo size="lg" />
            </div>
            
            <div className="mb-6">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❌</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Assignment Not Found
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={() => router.push('/')}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                Go to Homepage
              </Button>
              <p className="text-sm text-gray-500">
                Need help? Ask your teacher for the correct assignment code.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!assignment) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to the Assignment!
          </h1>
          <p className="text-gray-600">
            You&apos;re about to start working on an English assignment
          </p>
        </div>

        {/* Assignment Preview */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">📝</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {assignment.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {assignment.description}
            </p>
            <div className="bg-orange-50 rounded-lg p-3">
              <p className="text-xs text-orange-700 font-medium">
                Assignment Code: {code.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Name Input Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                What&apos;s your name?
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                This helps your teacher know who did the work. You can create an account later to save all your assignments.
              </p>
              
              <Input
                {...register('name')}
                type="text"
                placeholder="Enter your name"
                className={errors.name ? 'border-red-300' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Starting Assignment...' : 'Start Assignment'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">✨ Guest Mode</h5>
            <p className="text-sm text-blue-700">
              You&apos;re working as a guest. You can save your progress and create an account anytime to keep all your work.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}