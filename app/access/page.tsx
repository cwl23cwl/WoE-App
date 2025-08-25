'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const accessCodeSchema = z.object({
  code: z.string().min(1, 'Please enter an assignment code').toUpperCase(),
})

type AccessCodeForm = z.infer<typeof accessCodeSchema>

export default function AccessPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccessCodeForm>({
    resolver: zodResolver(accessCodeSchema),
  })

  const onSubmit = async (data: AccessCodeForm) => {
    setIsLoading(true)
    setError('')

    try {
      // Redirect to guest access page with the code
      router.push(`/guest/${data.code}`)
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Access Assignment
          </h1>
          <p className="text-gray-600">
            Enter your assignment code to start working
          </p>
        </div>

        {/* Access Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Code Input */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Code
              </label>
              <Input
                {...register('code')}
                type="text"
                id="code"
                placeholder="Enter your code (e.g., BEGINNER001)"
                className={`text-center text-lg font-mono uppercase ${errors.code ? 'border-red-300' : ''}`}
                style={{ textTransform: 'uppercase' }}
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Ask your teacher for the assignment code
              </p>
            </div>

            {/* Access Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Checking Code...' : 'Access Assignment'}
            </Button>
          </form>

          {/* Info Section */}
          <div className="mt-6 space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">🎯 Quick Access</h3>
              <p className="text-sm text-blue-800">
                You can start working right away! No account needed to begin.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">💾 Save Your Work</h3>
              <p className="text-sm text-green-800">
                Create an account anytime to save your progress permanently.
              </p>
            </div>
          </div>

          {/* Alternative Actions */}
          <div className="mt-8 text-center space-y-3">
            <div className="border-t pt-6">
              <p className="text-sm text-gray-600 mb-4">
                Already have an account?
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => router.push('/auth/signin')}
                  variant="outline"
                  className="flex-1"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => router.push('/auth/signup')}
                  variant="outline"
                  className="flex-1"
                >
                  Create Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}