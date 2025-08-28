// components/workspace/ExcalidrawCanvasFixed.tsx - React 19 Compatible
'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

interface ExcalidrawCanvasFixedProps {
  onCanvasChange?: (elements: any[], appState: any) => void
  className?: string
  width?: string | number
  height?: string | number
}

export function ExcalidrawCanvasFixed({ 
  onCanvasChange, 
  className = "",
  width = "100%",
  height = "calc(100vh - 140px)"
}: ExcalidrawCanvasFixedProps) {
  const [ExcalidrawComponent, setExcalidrawComponent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const apiRef = useRef<any>(null)
  const isMountedRef = useRef(true)
  const initializationCompleteRef = useRef(false)
  const changeTimeoutRef = useRef<NodeJS.Timeout>()

  const {
    pages,
    currentPageIndex,
    setExcalidrawAPI,
    activeTool
  } = useWorkspaceStore()

  // Dynamic Excalidraw import
  useEffect(() => {
    let mounted = true

    const loadExcalidraw = async () => {
      try {
        console.log('🔄 ExcalidrawCanvas: Loading Excalidraw module...')
        const module = await import('@excalidraw/excalidraw')
        
        if (mounted && isMountedRef.current) {
          console.log('✅ ExcalidrawCanvas: Module loaded successfully')
          setExcalidrawComponent(() => module.Excalidraw)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('❌ ExcalidrawCanvas: Failed to load Excalidraw:', error)
        if (mounted && isMountedRef.current) {
          setIsLoading(false)
        }
      }
    }

    loadExcalidraw()
    return () => { mounted = false }
  }, [])

  // CRITICAL: API callback with NO state updates
  const handleExcalidrawAPI = useCallback((api: any) => {
    console.log('🎯 ExcalidrawCanvas: API callback triggered:', !!api)
    
    if (api) {
      // ONLY assign to ref - absolutely NO state updates in callback
      apiRef.current = api
      console.log('📦 ExcalidrawCanvas: API stored in ref')
    }
  }, []) // Empty dependency array

  // Separate effect to initialize API after mounting completes
  useEffect(() => {
    if (apiRef.current && !initializationCompleteRef.current && isMountedRef.current) {
      // Mark initialization as started to prevent duplicate runs
      initializationCompleteRef.current = true
      
      // Delay initialization to ensure React mounting is complete
      const timer = setTimeout(() => {
        if (isMountedRef.current && apiRef.current) {
          try {
            console.log('🔧 ExcalidrawCanvas: Initializing API (post-mount)')
            
            // Pass API to store
            setExcalidrawAPI(apiRef.current)
            
            console.log('✅ ExcalidrawCanvas: API integration complete')
          } catch (error) {
            console.error('❌ ExcalidrawCanvas: Post-mount initialization failed:', error)
          }
        }
      }, 300) // Generous delay for React 19

      return () => clearTimeout(timer)
    }
  }, [setExcalidrawAPI])

  // CRITICAL: Simplified onChange handler to prevent infinite loops
  const handleCanvasChange = useCallback((elements: any[], appState: any, files: any) => {
    if (!isMountedRef.current) return

    // Clear any existing timeout
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current)
    }

    // Debounce changes to prevent infinite loops
    changeTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        const elementCount = elements?.length || 0
        console.log(`📝 ExcalidrawCanvas: Debounced change - ${elementCount} elements`)
        
        // Call external handler if provided
        if (onCanvasChange) {
          onCanvasChange(elements, appState)
        }
      }
    }, 150) // Debounce by 150ms

  }, [onCanvasChange])

  // Component lifecycle
  useEffect(() => {
    isMountedRef.current = true
    
    return () => {
      isMountedRef.current = false
      initializationCompleteRef.current = false
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current)
      }
    }
  }, [])

  // Get current page data safely
  const currentPageData = pages[currentPageIndex]?.scene || { elements: [], appState: {} }

  // Loading state
  if (isLoading || !ExcalidrawComponent) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-50 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center p-8">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Canvas</h3>
          <p className="text-gray-600">Preparing drawing tools...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`excalidraw-canvas-wrapper relative ${className} tool-${activeTool}`}
      style={{ width, height }}
    >
        <ExcalidrawComponent
          excalidrawAPI={handleExcalidrawAPI}
          initialData={currentPageData}
          onChange={handleCanvasChange}
          UIOptions={{
            canvasActions: {
              toggleTheme: false,
              clearCanvas: false,
              export: false,
              loadScene: false,
              saveToActiveFile: false,
              saveAsImage: false,
              changeViewBackgroundColor: false
            },
            tools: {
              image: false
            }
          }}
          renderTopRightUI={() => null}
          renderCustomStats={() => null}
          zenModeEnabled={true}
          gridModeEnabled={false}
          theme="light"
          name="workspace-canvas"
          viewModeEnabled={false}
          detectScroll={false}
          handleKeyboardGlobally={false} // Changed to false to prevent conflicts
          autoFocus={false}
        />
      </div>
    )
  }