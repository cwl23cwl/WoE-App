'use client'

import { WorkspaceTopbar } from '@/components/workspace/WorkspaceTopbar'
import { ExcalidrawCanvas } from '@/components/workspace/ExcalidrawCanvas'
import { MinimalCanvas } from '@/components/workspace/MinimalCanvas'
import { useWorkspaceStore } from '@/stores/workspace'
import { useEffect } from 'react'

export default function DirectCanvasTestPage() {
  const { setRole, setPages, setSaveState, pageIndex } = useWorkspaceStore()

  // Initialize test data
  useEffect(() => {
    setRole('STUDENT')
    setPages([
      { id: 'page1', scene: null, orientation: 'portrait' },
    ])
    setSaveState('saved')
  }, [setRole, setPages, setSaveState])

  const handleBack = () => {
    console.log('Back clicked')
  }

  const handleUndo = () => {
    console.log('Undo clicked')
  }

  const handleRedo = () => {
    console.log('Redo clicked')
  }

  return (
    <div className="h-screen bg-gray-100">
      <WorkspaceTopbar 
        onBack={handleBack}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={true}
        canRedo={false}
      />
      
      {/* Test both versions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-80px)]">
        <div className="bg-white border-2 border-blue-300">
          <h3 className="p-2 bg-blue-100 text-sm font-medium">Minimal Canvas (Basic)</h3>
          <div className="h-[calc(100%-32px)]">
            <MinimalCanvas />
          </div>
        </div>
        <div className="bg-white border-2 border-red-300">
          <h3 className="p-2 bg-red-100 text-sm font-medium">ExcalidrawCanvas (Complex)</h3>
          <div className="h-[calc(100%-32px)]">
            <ExcalidrawCanvas />
          </div>
        </div>
      </div>
    </div>
  )
}
