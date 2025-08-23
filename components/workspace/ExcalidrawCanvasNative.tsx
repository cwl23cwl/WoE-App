'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

// Dynamic import of Excalidraw to prevent SSR issues
const Excalidraw = dynamic(
  async () => {
    const module = await import('@excalidraw/excalidraw')
    // Import CSS dynamically as well
    await import('@excalidraw/excalidraw/index.css')
    return module.Excalidraw
  },
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="text-gray-500">Loading canvas...</div>
      </div>
    ),
  }
)

// Enhanced component with zoom control and browser zoom passthrough
// Prevents internal canvas zoom while allowing browser/page zoom

interface ExcalidrawCanvasNativeProps {
  className?: string
}

export function ExcalidrawCanvasNative({ className = '' }: ExcalidrawCanvasNativeProps) {
  const excalidrawRef = useRef<any>(null)
  const canvasWrapperRef = useRef<HTMLDivElement>(null)
  
  // Store access for tool synchronization
  const { 
    setExcalidrawAPI, 
    activeTool, 
    setActiveTool,
    toolPrefs, 
    editingTextId, 
    selectedElementIds, 
    setEditingTextId, 
    setSelectedElementIds 
  } = useWorkspaceStore()

  // Zoom control constants
  const LOCKED_ZOOM = 1.0 // Keep canvas at 100% zoom

  // Stable initialData
  const initialData = {
    elements: [],
    appState: {
      viewBackgroundColor: '#ffffff',
    },
  }

  // Helper function to map store tools to Excalidraw tools
  const mapToolToExcalidraw = (tool: string) => {
    switch (tool) {
      case 'select': return 'selection'
      case 'draw': return 'freedraw'
      case 'text': return 'text'
      case 'erase': return 'eraser'
      case 'highlighter': return 'freedraw'
      default: return 'freedraw'
    }
  }

  // Helper function to map Excalidraw tools back to store tools
  const mapToolFromExcalidraw = (excalidrawTool: string) => {
    switch (excalidrawTool) {
      case 'selection': return 'select'
      case 'freedraw': return 'draw' // Default to draw for freedraw
      case 'text': return 'text'
      case 'eraser': return 'erase'
      default: return 'select'
    }
  }

  // Track previous elements to detect new text creation
  const prevElementsRef = useRef<any[]>([])
  
  // Change handler with state tracking and zoom lock
  const handleChange = useCallback((elements: any, appState: any, files: any) => {
    // Minimal logging for debugging
    if (elements.length !== prevElementsRef.current.length) {
      console.log('📊 Elements:', elements.length, 'Text:', elements.filter(el => el.type === 'text').length)
    }
    // ZOOM CONTROL: Lock canvas at 100% zoom
    const currentZoom = appState.zoom?.value || 1.0
    if (Math.abs(currentZoom - LOCKED_ZOOM) > 0.01) {
      // Zoom has changed, snap it back
      console.log('🔒 Locking zoom at 100% (was:', currentZoom, ')')
      if (excalidrawRef.current) {
        setTimeout(() => {
          excalidrawRef.current.updateScene({
            appState: { zoom: { value: LOCKED_ZOOM } }
          })
        }, 0)
      }
    }
    
    // Track text editing state changes
    const currentEditingTextId = appState.editingElement?.id || null
    const currentSelectedIds = appState.selectedElementIds || []
    
    // Smart tool sync: Keep text tool active when working with text
    const excalidrawActiveTool = appState.activeTool?.type
    if (excalidrawActiveTool) {
      // Check if we're working with text elements
      const isEditingText = currentEditingTextId !== null
      const hasSelectedText = currentSelectedIds.length > 0 && elements.some((el: any) => 
        currentSelectedIds.includes(el.id) && el.type === 'text'
      )
      
      // If we're editing or have selected text, ensure Text tool stays active in UI
      if ((isEditingText || hasSelectedText) && activeTool !== 'text') {
        console.log('🔄 Auto-switching to text tool - editing:', isEditingText, 'selected text:', hasSelectedText)
        setActiveTool('text')
      }
    }
    
    // Update store if text editing state has changed
    if (currentEditingTextId !== editingTextId) {
      setEditingTextId(currentEditingTextId)
    }
    
    // Update store if selection has changed
    if (JSON.stringify(currentSelectedIds) !== JSON.stringify(selectedElementIds)) {
      setSelectedElementIds(currentSelectedIds)
    }
    
    
    // Update the previous elements reference
    prevElementsRef.current = elements
  }, [editingTextId, activeTool, setEditingTextId, setSelectedElementIds, setActiveTool, selectedElementIds])

  // API handler with tool setup and zoom initialization
  const handleExcalidrawAPI = useCallback((api: any) => {
    excalidrawRef.current = api
    
    if (api) {
      setExcalidrawAPI(api)
      
      // Set initial tool and zoom after delay
      setTimeout(() => {
        try {
          const excalidrawTool = mapToolToExcalidraw(activeTool)
          api.setActiveTool({ type: excalidrawTool })
          
          // Set initial zoom lock
          api.updateScene({
            appState: { zoom: { value: LOCKED_ZOOM } }
          })
          console.log('🔒 Initial zoom locked at 100%')
        } catch (error) {
          console.error('❌ Initial tool/zoom setup failed:', error)
        }
      }, 100)
    }
  }, [setExcalidrawAPI, activeTool])
  
  // BROWSER ZOOM PASSTHROUGH & SCROLL CONTROL: Handle wheel events
  useEffect(() => {
    const canvasWrapper = canvasWrapperRef.current
    if (!canvasWrapper) return
    
    const handleWheel = (event: WheelEvent) => {
      // Check if this is a browser zoom gesture (Ctrl/Cmd + wheel)
      if (event.ctrlKey || event.metaKey) {
        console.log('🔄 Browser zoom wheel detected, allowing passthrough')
        // Stop propagation so Excalidraw doesn't see it
        event.stopPropagation()
        // DON'T preventDefault - let browser handle the zoom
        return
      }
      
      // Allow all scrolling - let page scroll naturally
      // Note: Removed vertical scroll blocking to allow page scrolling
      
      // Allow horizontal scroll - let Excalidraw handle it for panning
      console.log('✅ Allowing horizontal scroll for canvas panning')
    }
    
    // Use capture phase to intercept before Excalidraw
    canvasWrapper.addEventListener('wheel', handleWheel, { capture: true, passive: false })
    
    return () => {
      canvasWrapper.removeEventListener('wheel', handleWheel, { capture: true } as any)
    }
  }, [])
  
  // BROWSER ZOOM PASSTHROUGH: Handle keyboard shortcuts (Ctrl/Cmd + +/-/0)
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const isZoomKey = (event.ctrlKey || event.metaKey) && 
        (event.key === '+' || event.key === '=' || event.key === '-' || event.key === '0')
      
      if (isZoomKey) {
        console.log('🔄 Browser zoom key detected:', event.key, 'allowing passthrough')
        // Stop propagation so Excalidraw doesn't see it
        event.stopPropagation()
        // DON'T preventDefault - let browser handle the zoom
        return
      }
    }
    
    // Use capture phase on document to catch before any other handlers
    document.addEventListener('keydown', handleKeydown, { capture: true })
    
    return () => {
      document.removeEventListener('keydown', handleKeydown, { capture: true })
    }
  }, [])
  
  // LAYOUT RESPONSIVENESS: Handle container resize and layout changes
  useEffect(() => {
    const canvasWrapper = canvasWrapperRef.current
    if (!canvasWrapper) return
    
    let resizeTimeout: NodeJS.Timeout
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        console.log('📏 Canvas container resized:', { width, height })
        
        // Debounce multiple rapid resizes
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(() => {
          // Force Excalidraw to recalculate dimensions
          if (excalidrawRef.current) {
            try {
              // Multiple refresh approaches for robustness
              excalidrawRef.current.refresh?.()
              
              // Also try triggering a scene update to force re-render
              excalidrawRef.current.updateScene?.({
                appState: { zoom: { value: LOCKED_ZOOM } }
              })
              
              console.log('🔄 Excalidraw refreshed after resize')
            } catch (error) {
              console.warn('⚠️ Excalidraw refresh failed:', error)
            }
          }
        }, 150) // Debounce resizes
      }
    })
    
    resizeObserver.observe(canvasWrapper)
    
    // Also listen for window resize as backup
    const handleWindowResize = () => {
      if (typeof window === 'undefined') return
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        console.log('🪟 Window resized, refreshing canvas')
        if (excalidrawRef.current) {
          try {
            excalidrawRef.current.refresh?.()
          } catch (error) {
            console.warn('⚠️ Window resize refresh failed:', error)
          }
        }
      }, 200)
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleWindowResize)
    }
    
    return () => {
      clearTimeout(resizeTimeout)
      resizeObserver.disconnect()
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleWindowResize)
      }
    }
  }, [])
  
  // BREAKPOINT RESPONSIVENESS: Handle xl breakpoint changes (sidebar position)
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const mediaQuery = window.matchMedia('(min-width: 1280px)') // xl breakpoint
    
    const handleBreakpointChange = (e: MediaQueryListEvent) => {
      console.log('📱 Breakpoint changed - xl:', e.matches)
      
      // Give layout time to settle, then refresh canvas
      setTimeout(() => {
        if (excalidrawRef.current) {
          try {
            excalidrawRef.current.refresh?.()
            excalidrawRef.current.updateScene?.({
              appState: { zoom: { value: LOCKED_ZOOM } }
            })
            console.log('🔄 Canvas refreshed after breakpoint change')
          } catch (error) {
            console.warn('⚠️ Breakpoint refresh failed:', error)
          }
        }
      }, 300)
    }
    
    // Listen for breakpoint changes
    mediaQuery.addEventListener('change', handleBreakpointChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleBreakpointChange)
    }
  }, [])

  // Tool synchronization
  useEffect(() => {
    if (excalidrawRef.current && activeTool) {
      try {
        const excalidrawTool = mapToolToExcalidraw(activeTool)
        excalidrawRef.current.setActiveTool({ type: excalidrawTool })
      } catch (error) {
        console.error('❌ Tool sync failed:', error)
      }
    }
  }, [activeTool])

  // Text tool reset handling
  useEffect(() => {
    if (excalidrawRef.current && activeTool === 'text') {
      if (!editingTextId && selectedElementIds.length === 0) {
        try {
          excalidrawRef.current.setActiveTool({ type: 'text' })
        } catch (error) {
          console.error('❌ Text tool refresh failed:', error)
        }
      }
    }
  }, [activeTool, editingTextId, selectedElementIds])

  // Tool properties handling
  useEffect(() => {
    if (excalidrawRef.current && activeTool) {
      try {
        const updates: any = {}
        
        if (activeTool === 'highlighter') {
          updates.currentItemStrokeColor = toolPrefs.highlighterColor || '#FACC15'
          updates.currentItemOpacity = (toolPrefs.highlighterOpacity || 0.3) * 100
          updates.currentItemStrokeWidth = toolPrefs.highlighterSize || 12
        } else if (activeTool === 'draw') {
          updates.currentItemStrokeColor = toolPrefs.drawColor || '#000000'
          updates.currentItemOpacity = 100
          updates.currentItemStrokeWidth = toolPrefs.drawSize || 4
        } else if (activeTool === 'text') {
          updates.currentItemStrokeColor = toolPrefs.textColor || '#000000'
          updates.currentItemFontSize = toolPrefs.textSize || 24
          updates.currentItemFontFamily = toolPrefs.textFamily || '"Times New Roman", Georgia, serif'
        }
        
        if (Object.keys(updates).length > 0) {
          excalidrawRef.current.updateScene({ appState: updates })
        }
      } catch (error) {
        console.error('❌ Tool properties update failed:', error)
      }
    }
  }, [activeTool, toolPrefs.highlighterColor, toolPrefs.highlighterOpacity, toolPrefs.highlighterSize, toolPrefs.drawColor, toolPrefs.drawSize, toolPrefs.textColor, toolPrefs.textSize, toolPrefs.textFamily])

  return (
    <div 
      ref={canvasWrapperRef}
      className={`w-full h-full ${className}`} 
      style={{ 
        minHeight: '600px',
        touchAction: 'pan-x pan-y', // Allow browser pinch-zoom on mobile
        overflowY: 'hidden', // Disable vertical scrolling
        overflowX: 'auto' // Allow horizontal scrolling if needed
      }}
    >
      <Excalidraw
        excalidrawAPI={handleExcalidrawAPI}
        onChange={handleChange}
        initialData={initialData}
        viewModeEnabled={false}
        UIOptions={{
          canvasActions: {
            saveToActiveFile: false,
            loadScene: false,
            export: false,
            toggleTheme: false,
            clearCanvas: false,
            // Hide zoom controls
            changeViewBackgroundColor: false
          },
          tools: {
            image: false
          }
        }}
        renderTopRightUI={() => null}
        renderFooter={() => null}
        renderSidebar={() => null}
      />
      <style jsx global>{`
        /* Hide all Excalidraw UI elements */
        .excalidraw .layer-ui__wrapper > * {
          display: none !important;
        }
        .excalidraw .layer-ui__wrapper {
          pointer-events: none !important;
        }
        .excalidraw .Island {
          display: none !important;
        }
        .excalidraw [data-testid*="toolbar"] {
          display: none !important;
        }
        .excalidraw [data-testid="tools-panel"] {
          display: none !important;
        }
        .excalidraw .App-toolbar {
          display: none !important;
        }
        .excalidraw .App-bottom-bar {
          display: none !important;
        }
        
        /* Hide zoom-specific UI elements */
        .excalidraw [data-testid*="zoom"] {
          display: none !important;
        }
        .excalidraw .zoom-actions {
          display: none !important;
        }
        .excalidraw [aria-label*="zoom"] {
          display: none !important;
        }
        .excalidraw [title*="zoom"] {
          display: none !important;
        }
        .excalidraw [data-testid="zoom-in-button"],
        .excalidraw [data-testid="zoom-out-button"],
        .excalidraw [data-testid="reset-zoom-button"],
        .excalidraw [data-testid="zoom-to-fit-button"] {
          display: none !important;
        }
        
        /* Ensure mobile touch handling works for browser zoom */
        .excalidraw canvas {
          touch-action: pan-x pan-y !important;
        }
        
        /* Disable vertical scrolling on canvas */
        .excalidraw,
        .excalidraw .excalidraw-canvas {
          overflow-y: hidden !important;
          overflow-x: auto !important;
        }
        
        /* Prevent vertical scrolling via CSS on the main canvas container */
        .excalidraw .layer-ui__wrapper__top-left,
        .excalidraw .layer-ui__wrapper__top-right,
        .excalidraw .layer-ui__wrapper__bottom-left,
        .excalidraw .layer-ui__wrapper__bottom-right {
          overflow-y: hidden !important;
        }
      `}</style>
    </div>
  )
}