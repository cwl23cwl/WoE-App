'use client'

import { FixedStageCanvas } from '@/components/workspace/FixedStageCanvas'
import { useWorkspaceStore } from '@/stores/workspace'
import { useEffect } from 'react'

export default function WorkspaceTestPage() {
  const { setRole, setPages, setSaveState, saveState } = useWorkspaceStore()

  // Initialize test data
  useEffect(() => {
    setRole('STUDENT')
    setPages([
      { id: 'page1', scene: null, orientation: 'portrait' },
      { id: 'page2', scene: null, orientation: 'portrait' },
      { id: 'page3', scene: null, orientation: 'portrait' },
    ])
    setSaveState('saved')
  }, [setRole, setPages, setSaveState])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header without complex toolbar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 rounded-full p-2">
              <span className="text-lg">🎨</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Assignment Workspace</h1>
              <p className="text-sm text-gray-500">Student View - Native Excalidraw Controls</p>
            </div>
          </div>

          {/* Simple save status indicator */}
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
          </div>
        </div>
      </header>

      {/* Main canvas area */}
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
          <FixedStageCanvas className="workspace-test-canvas" />
        </div>
      </main>
    </div>
  )
}
