'use client'

import { useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useWorkspaceStore } from '@/stores/workspace'
// import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types'
type ExcalidrawImperativeAPI = any

// Import Excalidraw CSS
import '@excalidraw/excalidraw/index.css'

// Dynamic import Excalidraw with no SSR
const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
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
  const excalidrawRef = useRef<ExcalidrawImperativeAPI | null>(null)
  const { tool } = useWorkspaceStore()

  // Get Excalidraw API reference
  const handleExcalidrawAPI = useCallback((api: ExcalidrawImperativeAPI) => {
    console.log('🎯 Test Canvas API received:', !!api)
    excalidrawRef.current = api
  }, [])

  // Tool switching
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
    
    console.log('🔄 Test Canvas switching to tool:', excalidrawTool)
    
    setTimeout(() => {
      try {
        excalidrawRef.current?.setActiveTool({ type: excalidrawTool })
        console.log('✅ Test Canvas tool switched successfully to:', excalidrawTool)
      } catch (error) {
        console.error('❌ Test Canvas error switching tool:', error)
      }
    }, 50)
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