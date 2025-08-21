'use client'

import { useState } from 'react'
import { ModernToolbar } from '@/components/workspace/ModernToolbar'
import { useWorkspaceStore } from '@/stores/workspace'
import { Button } from '@/components/ui/button'

export default function ToolbarDemoPage() {
  const { setRole, role, pages, setPages } = useWorkspaceStore()
  const [canUndo, setCanUndo] = useState(true)
  const [canRedo, setCanRedo] = useState(false)

  // Initialize pages if empty
  if (pages.length === 0) {
    setPages([
      { id: '1', scene: { elements: [], appState: { viewBackgroundColor: '#ffffff' } } }
    ])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Modern Toolbar Demo</h1>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => setRole('STUDENT')} variant={role === 'STUDENT' ? 'primary' : 'outline'}>
              Student Mode
            </Button>
            <Button onClick={() => setRole('TEACHER')} variant={role === 'TEACHER' ? 'primary' : 'outline'}>
              Teacher Mode
            </Button>
          </div>
          <p className="text-gray-600 mt-2">Current role: {role}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Top Toolbar</h2>
          <ModernToolbar
            placement="top"
            isTeacher={role === 'TEACHER'}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={() => setCanUndo(false)}
            onRedo={() => setCanRedo(true)}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Left Sidebar</h2>
          <div className="flex">
            <ModernToolbar
              placement="left"
              isTeacher={role === 'TEACHER'}
              canUndo={canUndo}
              canRedo={canRedo}
            />
            <div className="ml-4 flex-1 h-64 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
              <p className="text-gray-500">Canvas area</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Floating Toolbar</h2>
          <div className="relative h-32 bg-gray-100 rounded border-2 border-dashed border-gray-300">
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <ModernToolbar
                placement="floating"
                isTeacher={role === 'TEACHER'}
                canUndo={canUndo}
                canRedo={canRedo}
              />
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">✅ Modern Lucide icons</p>
          <p className="text-sm text-gray-600">✅ ESL-friendly labels</p>
          <p className="text-sm text-gray-600">✅ Large hit targets (48px)</p>
          <p className="text-sm text-gray-600">✅ Role-based styling</p>
          <p className="text-sm text-gray-600">✅ Interactive color picker</p>
          <p className="text-sm text-gray-600">✅ Thickness slider</p>
        </div>
      </div>
    </div>
  )
}