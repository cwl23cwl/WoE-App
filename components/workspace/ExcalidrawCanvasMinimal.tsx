// components/workspace/ExcalidrawCanvasMinimal.tsx - CRITICAL React 19 Fix
'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'

interface ExcalidrawCanvasMinimalProps {
  onExcalidrawAPI?: (api: any) => void
  className?: string
  width?: string | number
  height?: string | number
}

export function ExcalidrawCanvasMinimal({ 
  onExcalidrawAPI,
  className = "",
  width = "100%", 
  height = "calc(100vh - 140px)"
}: ExcalidrawCanvasMinimalProps) {
  const [ExcalidrawComponent, setExcalidrawComponent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const apiRef = useRef<any>(null)
  const isMountedRef = useRef(true)

  // Load Excalidraw module
  useEffect(() => {
    let mounted = true

    const loadExcalidraw = async () => {
      try {
        console.log('🔄 Loading Excalidraw...')
        const module = await import('@excalidraw/excalidraw')
        
        if (mounted) {
          console.log('✅ Excalidraw loaded')
          setExcalidrawComponent(() => module.Excalidraw)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('❌ Failed to load Excalidraw:', error)
        if (mounted) setIsLoading(false)
      }
    }

    loadExcalidraw()
    return () => { mounted = false }
  }, [])

  // CRITICAL: Minimal API callback - NO state updates whatsoever
  const handleExcalidrawAPI = useCallback((api: any) => {
    if (api) {
      console.log('🎯 API initialized')
      apiRef.current = api
      
      // Pass to parent without any state updates
      if (onExcalidrawAPI) {
        onExcalidrawAPI(api)
      }
    }
  }, [onExcalidrawAPI])

  // CRITICAL: No onChange handler to prevent infinite loops
  // Remove onChange entirely for now to test basic functionality

  // Component cleanup
  useEffect(() => {
    isMountedRef.current = true
    return () => { isMountedRef.current = false }
  }, [])

  if (isLoading || !ExcalidrawComponent) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-50 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Loading canvas...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`excalidraw-minimal-wrapper ${className}`}
      style={{ width, height }}
    >
      <ExcalidrawComponent
        excalidrawAPI={handleExcalidrawAPI}
        initialData={{ elements: [], appState: {} }}
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
          tools: { image: false }
        }}
        renderTopRightUI={() => null}
        renderCustomStats={() => null}
        zenModeEnabled={true}
        gridModeEnabled={false}
        theme="light"
        viewModeEnabled={false}
        detectScroll={false}
        handleKeyboardGlobally={false}
        autoFocus={false}
      />

      {/* Minimal CSS to hide native UI */}
      <style jsx>{`
        .excalidraw-minimal-wrapper :global(.App-toolbar),
        .excalidraw-minimal-wrapper :global(.App-menu),
        .excalidraw-minimal-wrapper :global(.App-bottom-bar),
        .excalidraw-minimal-wrapper :global(.FixedSideContainer),
        .excalidraw-minimal-wrapper :global(.Island),
        .excalidraw-minimal-wrapper :global(.welcome-screen-center) {
          display: none !important;
        }

        .excalidraw-minimal-wrapper :global(.excalidraw) {
          width: 100% !important;
          height: 100% !important;
        }

        .excalidraw-minimal-wrapper :global(.App-canvas) {
          pointer-events: auto !important;
          cursor: crosshair;
        }
      `}</style>
    </div>
  )
}