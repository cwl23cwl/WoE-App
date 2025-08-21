'use client'

import { WorkspaceTopbar } from '@/components/workspace/WorkspaceTopbar'
import { ExcalidrawCanvas } from '@/components/workspace/ExcalidrawCanvas'
import { useWorkspaceStore } from '@/stores/workspace'
import { useEffect } from 'react'

export default function WorkspaceDebugTestPage() {
  const { setRole, setPages, setSaveState, tool, setTool } = useWorkspaceStore()

  // Initialize test data
  useEffect(() => {
    setRole('STUDENT')
    setPages([
      { id: 'page1', scene: null, orientation: 'portrait' },
    ])
    setSaveState('saved')
  }, [setRole, setPages, setSaveState])

  // Debug tool changes
  useEffect(() => {
    console.log('🔧 [DEBUG] Current tool in store:', tool)
  }, [tool])

  const handleBack = () => {
    console.log('Back clicked')
  }

  const handleUndo = () => {
    console.log('Undo clicked')
  }

  const handleRedo = () => {
    console.log('Redo clicked')
  }

  const handleToolChange = (newTool: string) => {
    console.log('🔧 [DEBUG] Manual tool change:', newTool)
    setTool(newTool as any)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WorkspaceTopbar 
        onBack={handleBack}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={true}
        canRedo={false}
      />
      
      {/* Debug info */}
      <div className="p-4 bg-yellow-100 border-b">
        <h2 className="font-bold">DEBUG INFO</h2>
        <p>Current tool: <strong>{tool}</strong></p>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => handleToolChange('pencil')}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Set Pencil
          </button>
          <button 
            onClick={() => handleToolChange('text')}
            className="px-3 py-1 bg-green-500 text-white rounded"
          >
            Set Text
          </button>
          <button 
            onClick={() => handleToolChange('select')}
            className="px-3 py-1 bg-gray-500 text-white rounded"
          >
            Set Select
          </button>
        </div>
      </div>
      
      {/* Direct canvas */}
      <div className="p-4">
        <div className="bg-white rounded-lg border shadow-sm" style={{ height: '600px', width: '100%' }}>
          <ExcalidrawCanvas />
        </div>
      </div>
    </div>
  )
}