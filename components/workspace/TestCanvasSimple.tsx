'use client'

import { useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useWorkspaceStore } from '@/stores/workspace'

// Import Excalidraw CSS
import '@excalidraw/excalidraw/index.css'

// Dynamic import Excalidraw with no SSR
const Excalidraw = dynamic(
  async () => {
    const excalidrawModule = await import('@excalidraw/excalidraw')
    return excalidrawModule.Excalidraw
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading canvas...</p>
        </div>
      </div>
    ),
  }
)

interface TestCanvasProps {
  className?: string
}

export function TestCanvas({ className = '' }: TestCanvasProps) {
  const excalidrawRef = useRef<any>(null)
  const { tool } = useWorkspaceStore()

  // Get Excalidraw API reference
  const handleExcalidrawAPI = useCallback((api: any) => {
    console.log('Excalidraw API received:', api)
    excalidrawRef.current = api
    
    // Wait a bit for Excalidraw to be fully ready
    setTimeout(() => {
      try {
        console.log('Setting initial tool to freedraw')
        api.setActiveTool({ type: 'freedraw' })
      } catch (error) {
        console.error('Error setting initial tool:', error)
      }
    }, 1000)
  }, [])

  // Simple tool switching
  useEffect(() => {
    if (!excalidrawRef.current) return

    const toolMap = {
      select: 'selection',
      pencil: 'freedraw',
      highlighter: 'freedraw',
      text: 'text',
      eraser: 'eraser',
    } as const

    const excalidrawTool = toolMap[tool] || 'selection'
    
    console.log('Switching to tool:', excalidrawTool)
    
    try {
      excalidrawRef.current.setActiveTool({ type: excalidrawTool })
      console.log('Tool switched successfully to:', excalidrawTool)
    } catch (error) {
      console.error('Error switching tool:', error)
    }
  }, [tool])

  return (
    <div className={`w-full h-full ${className}`} style={{ minHeight: '500px' }}>
      <h3 className="text-sm text-gray-600 mb-2">Test Canvas (Simplified)</h3>
      <div className="border-2 border-gray-300 rounded-lg" style={{ height: '450px' }}>
        <Excalidraw
          excalidrawAPI={handleExcalidrawAPI}
          viewModeEnabled={false}
          zenModeEnabled={false}
          gridModeEnabled={false}
          theme="light"
        />
      </div>
    </div>
  )
}
