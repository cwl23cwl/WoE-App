// components/workspace/ExcalidrawCanvasNative.tsx - Enhanced with Complete UI Hiding
'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

interface ExcalidrawCanvasNativeProps {
  onCanvasChange?: (elements: any[], appState: any) => void
  className?: string
  width?: string | number
  height?: string | number
}

export function ExcalidrawCanvasNative({ 
  onCanvasChange, 
  className = "",
  width = "100%",
  height = "calc(100vh - 140px)"
}: ExcalidrawCanvasNativeProps) {
  const [ExcalidrawComponent, setExcalidrawComponent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  
  const apiRef = useRef<any>(null)
  const isMountedRef = useRef(true)
  const lastChangeTimeRef = useRef(Date.now())

  const {
    pages,
    currentPageIndex,
    setExcalidrawAPI,
    setCanUndo,
    setCanRedo,
    setSaveState,
    activeTool
  } = useWorkspaceStore()

  // Dynamic Excalidraw import with error handling
  useEffect(() => {
    let mounted = true

    const loadExcalidraw = async () => {
      try {
        console.log('🔄 ExcalidrawCanvas: Loading Excalidraw module...')
        setIsLoading(true)
        setLoadError(null)
        
        const module = await import('@excalidraw/excalidraw')
        
        if (mounted && isMountedRef.current) {
          console.log('✅ ExcalidrawCanvas: Module loaded successfully')
          setExcalidrawComponent(() => module.Excalidraw)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('❌ ExcalidrawCanvas: Failed to load Excalidraw:', error)
        if (mounted && isMountedRef.current) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load canvas')
          setIsLoading(false)
        }
      }
    }

    loadExcalidraw()

    return () => {
      mounted = false
    }
  }, [])

  // Handle Excalidraw API initialization with React 19 compatibility
  const handleExcalidrawAPI = useCallback((api: any) => {
    console.log('🎯 ExcalidrawCanvas: API callback triggered:', !!api)
    
    if (api) {
      // ONLY store API reference in callback - NO state updates
      apiRef.current = api
      console.log('📦 ExcalidrawCanvas: API stored in ref')
    }
  }, []) // No dependencies to prevent re-creation

  // Separate useEffect to handle API initialization after mounting
  useEffect(() => {
    if (apiRef.current && isMountedRef.current) {
      const api = apiRef.current
      
      // Use a longer delay to ensure React mounting is complete
      const initTimer = setTimeout(() => {
        if (isMountedRef.current) {
          try {
            console.log('🔧 ExcalidrawCanvas: Post-mount API initialization')
            
            // Pass API to store
            setExcalidrawAPI(api)
            
            // Set initial tool (try-catch for safety)
            try {
              api.setActiveTool({ type: 'freedraw' })
            } catch (toolError) {
              console.warn('⚠️ ExcalidrawCanvas: Initial tool setting failed (non-critical):', toolError)
            }
            
            // Update initial state
            setCanUndo(false)
            setCanRedo(false)
            
            console.log('✅ ExcalidrawCanvas: API integration complete')
          } catch (error) {
            console.error('❌ ExcalidrawCanvas: API initialization failed:', error)
          }
        }
      }, 200) // Increased delay for React 19

      return () => clearTimeout(initTimer)
    }
  }, [setExcalidrawAPI, setCanUndo, setCanRedo]) // Stable dependencies

  // Handle canvas changes with debouncing and infinite loop prevention
  const handleCanvasChange = useCallback((elements: any[], appState: any, files: any) => {
    if (!isMountedRef.current) return

    const now = Date.now()
    const elementCount = elements?.length || 0
    
    // Prevent infinite loops by checking if this is actually a meaningful change
    const lastElementCountRef = useRef(0)
    const lastUpdateTimeRef = useRef(0)
    
    // Skip if this is the same element count and happened very recently (< 50ms)
    if (elementCount === lastElementCountRef.current && 
        (now - lastUpdateTimeRef.current) < 50) {
      return
    }
    
    lastElementCountRef.current = elementCount
    lastUpdateTimeRef.current = now
    lastChangeTimeRef.current = now

    console.log(`📝 ExcalidrawCanvas: Meaningful canvas change - ${elementCount} elements`)

    // Update undo/redo state (with error handling)
    try {
      if (apiRef.current) {
        // Simple heuristic for undo/redo availability
        const hasElements = elementCount > 0
        
        // Only update state if it actually changed
        setTimeout(() => {
          if (isMountedRef.current) {
            setCanUndo(hasElements)
            setCanRedo(false) // Excalidraw doesn't expose redo state reliably
          }
        }, 0)
      }
    } catch (error) {
      console.warn('⚠️ ExcalidrawCanvas: Could not update undo/redo state:', error)
    }

    // Only mark as unsaved if we actually have elements or this is a real change
    if (elementCount > 0 || lastElementCountRef.current !== elementCount) {
      setTimeout(() => {
        if (isMountedRef.current) {
          setSaveState('unsaved')
        }
      }, 0)
    }

    // Call external change handler (debounced)
    if (onCanvasChange) {
      setTimeout(() => {
        if (lastChangeTimeRef.current === now && isMountedRef.current) {
          onCanvasChange(elements, appState)
        }
      }, 100)
    }

    // Debounced auto-save trigger (only for meaningful changes)
    if (elementCount > 0) {
      setTimeout(() => {
        if (lastChangeTimeRef.current === now && isMountedRef.current) {
          setSaveState('saving')
          
          // Simulate save operation
          setTimeout(() => {
            if (isMountedRef.current) {
              setSaveState('saved')
              console.log('💾 ExcalidrawCanvas: Auto-save completed')
            }
          }, 500)
        }
      }, 1200) // Longer delay to prevent excessive saves
    }
  }, [onCanvasChange, setCanUndo, setCanRedo, setSaveState])

  // Component mounting effect
  useEffect(() => {
    isMountedRef.current = true
    
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Get current page data
  const currentPageData = pages[currentPageIndex]?.scene || { elements: [], appState: {} }

  // Loading state
  if (isLoading) {
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

  // Error state
  if (loadError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-50 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center p-8 bg-white rounded-lg border border-red-200 shadow-sm">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Canvas Load Error</h3>
          <p className="text-gray-600 mb-4">Failed to load drawing canvas: {loadError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  // No component loaded yet
  if (!ExcalidrawComponent) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-50 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center p-8">
          <p className="text-gray-600">Initializing canvas...</p>
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
        handleKeyboardGlobally={true}
        autoFocus={false}
      />

      {/* Comprehensive CSS to hide ALL native Excalidraw UI */}
      <style jsx>{`
        /* ===== COMPLETE TOOLBAR HIDING ===== */
        .excalidraw-canvas-wrapper :global(.App-toolbar),
        .excalidraw-canvas-wrapper :global(.App-toolbar-content),
        .excalidraw-canvas-wrapper :global(.App-toolbar-content__left),
        .excalidraw-canvas-wrapper :global(.App-toolbar-content__center), 
        .excalidraw-canvas-wrapper :global(.App-toolbar-content__right),
        .excalidraw-canvas-wrapper :global(.ToolIcon),
        .excalidraw-canvas-wrapper :global(.ToolIcon__icon),
        .excalidraw-canvas-wrapper :global(.ToolIcon__label),
        .excalidraw-canvas-wrapper :global(.Island) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          position: absolute !important;
          left: -99999px !important;
          width: 0 !important;
          height: 0 !important;
        }

        /* ===== MENU AND UI HIDING ===== */
        .excalidraw-canvas-wrapper :global(.App-menu),
        .excalidraw-canvas-wrapper :global(.App-menu_top),
        .excalidraw-canvas-wrapper :global(.App-menu_bottom), 
        .excalidraw-canvas-wrapper :global(.App-menu_left),
        .excalidraw-canvas-wrapper :global(.App-menu_right),
        .excalidraw-canvas-wrapper :global(.App-bottom-bar),
        .excalidraw-canvas-wrapper :global(.buttonList),
        .excalidraw-canvas-wrapper :global(.panelColumn),
        .excalidraw-canvas-wrapper :global(.FixedSideContainer),
        .excalidraw-canvas-wrapper :global(.layer-ui__wrapper),
        .excalidraw-canvas-wrapper :global(.Stack) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }

        /* ===== WELCOME SCREEN HIDING ===== */
        .excalidraw-canvas-wrapper :global(.welcome-screen-center),
        .excalidraw-canvas-wrapper :global(.welcome-screen-menu-trigger),
        .excalidraw-canvas-wrapper :global(.welcome-screen-decor),
        .excalidraw-canvas-wrapper :global(.welcome-screen-decor-arrow),
        .excalidraw-canvas-wrapper :global(.welcome-screen-title),
        .excalidraw-canvas-wrapper :global(.welcome-screen-subtitle) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }

        /* ===== STATS AND HINTS HIDING ===== */
        .excalidraw-canvas-wrapper :global(.HintViewer),
        .excalidraw-canvas-wrapper :global(.Stats),
        .excalidraw-canvas-wrapper :global(.StatsRows),
        .excalidraw-canvas-wrapper :global(.excalidraw__scroll-back-to-content) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }

        /* ===== DROPDOWN AND CONTEXT MENUS ===== */
        .excalidraw-canvas-wrapper :global(.dropdown-menu),
        .excalidraw-canvas-wrapper :global(.dropdown-menu-content),
        .excalidraw-canvas-wrapper :global(.context-menu),
        .excalidraw-canvas-wrapper :global(.popover) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }

        /* ===== ENSURE CANVAS IS FULLY INTERACTIVE ===== */
        .excalidraw-canvas-wrapper :global(.excalidraw) {
          --ui-font: "Inter", system-ui, sans-serif;
          width: 100% !important;
          height: 100% !important;
          pointer-events: auto !important;
          background: white !important;
        }

        .excalidraw-canvas-wrapper :global(.App-canvas) {
          pointer-events: auto !important;
          width: 100% !important;
          height: 100% !important;
          cursor: crosshair;
        }

        /* ===== TOOL-SPECIFIC CURSORS ===== */
        .excalidraw-canvas-wrapper.tool-select :global(.App-canvas) {
          cursor: default;
        }

        .excalidraw-canvas-wrapper.tool-draw :global(.App-canvas) {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="2" fill="black"/></svg>'), crosshair;
        }

        .excalidraw-canvas-wrapper.tool-text :global(.App-canvas) {
          cursor: text;
        }

        .excalidraw-canvas-wrapper.tool-erase :global(.App-canvas) {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><rect x="4" y="4" width="12" height="12" fill="white" stroke="black" stroke-width="2" rx="2"/></svg>'), auto;
        }

        .excalidraw-canvas-wrapper.tool-highlighter :global(.App-canvas) {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><rect x="2" y="14" width="16" height="4" fill="yellow" opacity="0.8"/></svg>'), crosshair;
        }

        .excalidraw-canvas-wrapper.tool-shapes :global(.App-canvas) {
          cursor: crosshair;
        }

        /* ===== MOBILE OPTIMIZATION ===== */
        @media (max-width: 768px) {
          .excalidraw-canvas-wrapper {
            touch-action: none;
          }
          
          .excalidraw-canvas-wrapper :global(.App-canvas) {
            touch-action: none;
          }
        }

        /* ===== ACCESSIBILITY ===== */
        .excalidraw-canvas-wrapper :global(.App-canvas):focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* ===== HIDE ANY REMAINING UI BY ATTRIBUTE ===== */
        .excalidraw-canvas-wrapper :global([class*="toolbar"]),
        .excalidraw-canvas-wrapper :global([class*="menu"]),
        .excalidraw-canvas-wrapper :global([class*="panel"]),
        .excalidraw-canvas-wrapper :global([class*="sidebar"]),
        .excalidraw-canvas-wrapper :global([data-testid*="toolbar"]),
        .excalidraw-canvas-wrapper :global([data-testid*="menu"]) {
          display: none !important;
        }

        /* ===== PREVENT SCROLL ISSUES ===== */
        .excalidraw-canvas-wrapper {
          overflow: hidden;
        }

        .excalidraw-canvas-wrapper :global(.excalidraw) {
          overflow: hidden !important;
        }

        /* ===== CANVAS FOCUS AND BACKGROUND ===== */
        .excalidraw-canvas-wrapper :global(.excalidraw .App-canvas) {
          background: white !important;
        }

        /* ===== HIDE WELCOME SCREEN COMPONENTS ===== */
        .excalidraw-canvas-wrapper :global(.welcome-screen),
        .excalidraw-canvas-wrapper :global(.welcome-screen-center),
        .excalidraw-canvas-wrapper :global(.welcome-screen-menu),
        .excalidraw-canvas-wrapper :global([class*="welcome"]) {
          display: none !important;
        }
      `}</style>
    </div>
  )

  // Component cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])
}