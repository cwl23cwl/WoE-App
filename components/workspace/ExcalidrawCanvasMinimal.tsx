// components/workspace/ExcalidrawCanvasMinimal.tsx - PRECISION FIX
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
  const containerRef = useRef<HTMLDivElement>(null)

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

  // CRITICAL: API callback with precision fixes
  const handleExcalidrawAPI = useCallback((api: any) => {
    if (api && api !== apiRef.current) {
      console.log('🎯 ExcalidrawCanvasMinimal: API initialized')
      apiRef.current = api
      
      // CRITICAL: Ensure proper canvas setup for precision
      const setupPrecision = () => {
        try {
          // Ensure canvas has proper pixel ratio and no scaling issues
          const canvas = containerRef.current?.querySelector('canvas')
          if (canvas) {
            // Force proper canvas sizing to match display size
            const rect = canvas.getBoundingClientRect()
            const devicePixelRatio = window.devicePixelRatio || 1
            
            console.log(`🎯 Canvas setup - Display: ${rect.width}x${rect.height}, DPR: ${devicePixelRatio}`)
            
            // Excalidraw should handle this internally, but we ensure it's correct
            if (canvas.width !== rect.width * devicePixelRatio || 
                canvas.height !== rect.height * devicePixelRatio) {
              console.log('⚠️ Canvas size mismatch detected - Excalidraw will handle internally')
            }
          }

          // Set initial app state to prevent coordinate issues
          api.updateScene({
            appState: {
              // CRITICAL: Disable internal zoom/pan that can cause precision issues
              zenModeEnabled: false,
              gridSize: null,
              // Start with clean coordinate system
              scrollX: 0,
              scrollY: 0,
              zoom: { value: 1 },
              // Ensure proper cursor behavior
              activeTool: { type: 'selection' },
              // Disable any potential coordinate transformations
              offsetLeft: 0,
              offsetTop: 0
            }
          })

          console.log('✅ Precision setup complete')
        } catch (error) {
          console.error('❌ Precision setup failed:', error)
        }
      }

      // Use RAF to ensure DOM is ready
      requestAnimationFrame(() => {
        setupPrecision()
        
        // Pass API to parent
        if (onExcalidrawAPI) {
          onExcalidrawAPI(api)
        }
      })
    }
  }, [onExcalidrawAPI])

  // CRITICAL: Minimal onChange to prevent loops but maintain functionality
  const handleChange = useCallback((elements: any, appState: any) => {
    // Only log significant changes to avoid spam
    if (elements && elements.length > 0) {
      console.log(`📝 Canvas updated: ${elements.length} elements`)
    }
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
      ref={containerRef}
      className={`excalidraw-minimal-wrapper ${className}`}
      style={{ 
        width, 
        height,
        // CRITICAL: Ensure no CSS transforms that interfere with coordinates
        transform: 'none',
        position: 'relative',
        // Prevent any potential scaling issues
        minWidth: 0,
        minHeight: 0,
      }}
    >
      <ExcalidrawComponent
        excalidrawAPI={handleExcalidrawAPI}
        onChange={handleChange}
        initialData={{ 
          elements: [], 
          appState: {
            // CRITICAL: Clean initial state for precision
            currentItemStrokeColor: '#000000',
            currentItemStrokeWidth: 2,
            currentItemOpacity: 100,
            theme: 'light',
            viewBackgroundColor: 'transparent',
            // Ensure clean coordinate system
            zoom: { value: 1 },
            scrollX: 0,
            scrollY: 0,
            // Disable features that can cause precision issues
            zenModeEnabled: false,
            gridSize: null,
            snapToGrid: false,
          }
        }}
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
        zenModeEnabled={false}
        gridModeEnabled={false}
        theme="light"
        viewModeEnabled={false}
        detectScroll={false}
        handleKeyboardGlobally={false}
        autoFocus={false}
      />

      {/* CRITICAL: CSS to hide UI and ensure precision */}
      <style jsx>{`
        .excalidraw-minimal-wrapper :global(.App-toolbar),
        .excalidraw-minimal-wrapper :global(.App-menu),
        .excalidraw-minimal-wrapper :global(.App-bottom-bar),
        .excalidraw-minimal-wrapper :global(.FixedSideContainer),
        .excalidraw-minimal-wrapper :global(.Island),
        .excalidraw-minimal-wrapper :global(.welcome-screen-center),
        .excalidraw-minimal-wrapper :global(.welcome-screen-title),
        .excalidraw-minimal-wrapper :global(.welcome-screen-subtitle) {
          display: none !important;
        }

        /* CRITICAL: Ensure canvas takes full space without scaling issues */
        .excalidraw-minimal-wrapper :global(.excalidraw) {
          width: 100% !important;
          height: 100% !important;
          /* Remove any transforms that could affect precision */
          transform: none !important;
          /* Ensure proper positioning */
          position: relative !important;
        }

        /* CRITICAL: Canvas precision fixes */
        .excalidraw-minimal-wrapper :global(.App-canvas) {
          pointer-events: auto !important;
          cursor: crosshair;
          /* Ensure no CSS scaling */
          transform: none !important;
          /* Proper canvas sizing */
          width: 100% !important;
          height: 100% !important;
          /* Remove any positioning offsets */
          left: 0 !important;
          top: 0 !important;
        }

        /* CRITICAL: Ensure canvas container has no transforms */
        .excalidraw-minimal-wrapper :global(.excalidraw-wrapper),
        .excalidraw-minimal-wrapper :global(.App),
        .excalidraw-minimal-wrapper :global(.App-canvas-container) {
          transform: none !important;
          position: relative !important;
          width: 100% !important;
          height: 100% !important;
        }

        /* Remove any zoom-related UI that might interfere */
        .excalidraw-minimal-wrapper :global(.zoom-ui),
        .excalidraw-minimal-wrapper :global(.scroll-buttons) {
          display: none !important;
        }
      `}</style>
    </div>
  )
}