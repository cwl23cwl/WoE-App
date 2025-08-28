'use client'

import { ReactNode } from 'react'
import { useWorkspaceStore } from '@/stores/workspace'

interface WorkspaceLayoutProps {
  children: ReactNode
  className?: string
}

export function WorkspaceLayout({ children, className = '' }: WorkspaceLayoutProps) {
  const { role, saveState } = useWorkspaceStore()

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 rounded-full p-2">
              <span className="text-lg">🎨</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Assignment Workspace</h1>
              <p className="text-sm text-gray-500">
                {role === 'TEACHER' ? 'Teacher View' : 'Student View'}
              </p>
            </div>
          </div>

          {/* Save Status Indicator */}
          <div className="flex items-center space-x-2">
            {saveState === 'saving' && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Saving...</span>
              </div>
            )}
            {saveState === 'saved' && (
              <div className="flex items-center space-x-2 text-green-600">
                <span className="text-sm">✓</span>
                <span className="text-sm">Saved</span>
              </div>
            )}
            {saveState === 'error' && (
              <div className="flex items-center space-x-2 text-red-600">
                <span className="text-sm">⚠</span>
                <span className="text-sm">Save Error</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {children}
        </div>
      </main>
    </div>
  )
}
