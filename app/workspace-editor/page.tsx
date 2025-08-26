// app/workspace-editor/page.tsx - Fixed API Store Integration
'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { ExcalidrawCanvasMinimal } from '@/components/workspace/ExcalidrawCanvasMinimal'
import { TopToolbar } from '@/components/workspace/TopToolbar'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

export default function WorkspaceEditorPage() {
  const [isCanvasReady, setIsCanvasReady] = useState(false)
  const excalidrawAPIRef = useRef<any>(null)

  // Get the store's setExcalidrawAPI function
  const { setExcalidrawAPI } = useWorkspaceStore()

  // Handle Excalidraw API with store integration
  const handleExcalidrawAPI = useCallback((api: any) => {
    console.log('🎯 Workspace: API received:', !!api)
    if (api) {
      excalidrawAPIRef.current = api
      
      // CRITICAL: Store the API in the workspace store so TopToolbar can access it
      setExcalidrawAPI(api)
      
      setIsCanvasReady(true)
      
      // Set initial tool
      setTimeout(() => {
        try {
          api.setActiveTool({ type: 'freedraw' })
          console.log('✅ Initial tool set to draw')
        } catch (error) {
          console.error('❌ Failed to set initial tool:', error)
        }
      }, 100)
    }
  }, [setExcalidrawAPI]) // Add setExcalidrawAPI dependency

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Unified Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              ✏️
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Assignment Workspace</h1>
              <div className={`text-sm ${isCanvasReady ? 'text-green-600' : 'text-orange-600'}`}>
                {isCanvasReady ? '✅ Canvas Ready' : '⏳ Loading Canvas...'}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Universal workspace for all assignments
          </div>
        </div>
      </header>

      {/* UNIFIED TOOLBAR - Now has access to store API */}
      <TopToolbar 
        onUndo={() => {
          if (excalidrawAPIRef.current) {
            try {
              excalidrawAPIRef.current.undo()
              console.log('↶ Undo executed')
            } catch (error) {
              console.error('❌ Undo failed:', error)
            }
          }
        }}
        onRedo={() => {
          if (excalidrawAPIRef.current) {
            try {
              excalidrawAPIRef.current.redo()
              console.log('↷ Redo executed')
            } catch (error) {
              console.error('❌ Redo failed:', error)
            }
          }
        }}
      />

      {/* Canvas */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 canvas-wrapper" 
            style={{ 
              height: '600px',
              // Ensure stable positioning for coordinates
              position: 'relative',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          >
            <ExcalidrawCanvasMinimal
              onExcalidrawAPI={handleExcalidrawAPI}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
      
      {/* Status Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-600">
          <div>
            Workspace Editor - Consistent across all assignments
          </div>
          <div>
            Status: {isCanvasReady ? 'Ready for drawing' : 'Initializing...'}
          </div>
        </div>
      </footer>

      {/* Canvas Coordinate Fix Styles */}
      <style jsx>{`
        .canvas-wrapper {
          /* Prevent coordinate system issues */
          isolation: isolate;
        }

        /* Force coordinate recalculation on layout changes */
        .canvas-wrapper :global(.excalidraw) {
          position: relative !important;
          width: 100% !important;
          height: 100% !important;
        }

        .canvas-wrapper :global(.App-canvas) {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          transform: none !important;
        }
      `}</style>
    </div>
  )
}