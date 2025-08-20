'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GuestSession, GuestSessionManager } from '@/lib/guest-session'

interface SaveProgressModalProps {
  guestSession: GuestSession
  onClose: () => void
  onContinueGuest: () => void
}

const createAccountSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type CreateAccountForm = z.infer<typeof createAccountSchema>

export function SaveProgressModal({ guestSession, onClose, onContinueGuest }: SaveProgressModalProps) {
  const [step, setStep] = useState<'prompt' | 'create-account'>('prompt')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const guestManager = GuestSessionManager.getInstance()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAccountForm>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: guestSession.tempName || '',
    },
  })

  const handleCreateAccount = async (data: CreateAccountForm) => {
    setIsLoading(true)
    setError('')

    try {
      // Get session data for conversion
      const sessionData = guestManager.getSessionDataForConversion(guestSession.id)
      if (!sessionData) {
        throw new Error('Session data not found')
      }

      // Create account with guest data
      const response = await fetch('/api/auth/convert-guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          guestSessionData: sessionData,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Something went wrong')
        return
      }

      // Clear guest session
      guestManager.clearGuestSession(guestSession.id)

      // Sign in the new user automatically
      const { signIn } = await import('next-auth/react')
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInResult?.ok) {
        // Redirect to student dashboard
        router.push('/student/dashboard')
      } else {
        // If auto sign-in fails, redirect to sign-in page
        router.push('/auth/signin')
      }

    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {step === 'prompt' ? (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💾</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Save Your Progress
              </h3>
              <p className="text-gray-600">
                You&apos;ve been working hard! Would you like to create an account to save your work permanently?
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">✨ With an account you get:</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Save all your assignments forever</li>
                  <li>• Track your learning progress</li>
                  <li>• Get feedback from your teacher</li>
                  <li>• Access to all your classes</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => setStep('create-account')}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                Create Account & Save Progress
              </Button>
              <Button
                onClick={onContinueGuest}
                variant="outline"
                className="w-full"
              >
                Continue as Guest
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full text-gray-500"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Create Your Account
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(handleCreateAccount)} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  {...register('name')}
                  type="text"
                  id="name"
                  placeholder="Enter your full name"
                  className={errors.name ? 'border-red-300' : ''}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  {...register('email')}
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className={errors.email ? 'border-red-300' : ''}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  {...register('password')}
                  type="password"
                  id="password"
                  placeholder="Create a password (6+ characters)"
                  className={errors.password ? 'border-red-300' : ''}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <Input
                  {...register('confirmPassword')}
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  className={errors.confirmPassword ? 'border-red-300' : ''}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep('prompt')}
                  variant="outline"
                  disabled={isLoading}
                >
                  Back
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}