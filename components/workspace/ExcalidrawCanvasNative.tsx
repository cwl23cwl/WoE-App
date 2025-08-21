'use client'

import { useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useWorkspaceStore } from '@/stores/workspace'
import { useDebounce } from 'use-debounce'

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

interface ExcalidrawCanvasNativeProps {
  className?: string
}

export function ExcalidrawCanvasNative({ className = '' }: ExcalidrawCanvasNativeProps) {
  const excalidrawRef = useRef<any>(null)
  
  const { 
    pages, 
    pageIndex, 
    setSceneForPage, 
    setSaveState 
  } = useWorkspaceStore()

  // Get current page data
  const currentPage = pages[pageIndex]
  
  // Minimal initialData - let Excalidraw handle everything else
  const initialData = currentPage?.scene || {
    elements: [],
    appState: {
      viewBackgroundColor: '#ffffff',
    },
  }

  // Debounced save function
  const [debouncedSave] = useDebounce((elements: any, appState: any, files: any) => {
    if (currentPage) {
      const sceneData = {
        elements,
        appState,
        files,
      }
      
      setSceneForPage(pageIndex, sceneData)
      setSaveState('saved')
    }
  }, 800)

  // Handle canvas changes
  const handleChange = useCallback((elements: any, appState: any, files: any) => {
    // Set saving state immediately
    setSaveState('saving')
    
    // Debounced save
    debouncedSave(elements, appState, files)
  }, [debouncedSave, setSaveState])

  // Get Excalidraw API reference - minimal intervention
  const handleExcalidrawAPI = useCallback((api: any) => {
    console.log('🎯 Native Excalidraw API initialized:', !!api)
    excalidrawRef.current = api
    
    // Set initial tool to freedraw after short delay
    if (api) {
      setTimeout(() => {
        try {
          api.setActiveTool({ type: 'freedraw' })
          console.log('✅ Native canvas set to freedraw')
        } catch (error) {
          console.error('❌ Native canvas tool setting failed:', error)
        }
      }, 100)
    }
  }, [])

  return (
    <div className={`w-full h-full ${className}`} style={{ minHeight: '400px' }}>
      <Excalidraw
        excalidrawAPI={handleExcalidrawAPI}
        onChange={handleChange}
        initialData={initialData}
        viewModeEnabled={false}
        theme="light"
        // No custom props that might interfere with native behavior
      />
    </div>
  )
}