'use client'

import React, { useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { useDebounce } from 'use-debounce'

// Import Excalidraw CSS
import '@excalidraw/excalidraw/index.css'

// Dynamic import Excalidraw with no SSR
const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-2"></div>
          <p className="text-sm text-neutral-600">Loading canvas...</p>
        </div>
      </div>
    ),
  }
)

export function WorkspaceCanvas() {
  const excalidrawRef = useRef<any>(null)
  
  const { 
    pages, 
    currentPageIndex, 
    setPages,
    setSaveState,
    activeTool,
    toolPrefs,
    zoom,
    setZoom,
    setCanUndo,
    setCanRedo,
    setExcalidrawAPI
  } = useWorkspaceStore()

  // Initialize pages if empty
  useEffect(() => {
    if (pages.length === 0) {
      const initialPage = {
        id: 'page-1',
        scene: {
          elements: [],
          appState: {
            viewBackgroundColor: '#ffffff',
          },
        },
        orientation: 'landscape' as const
      }
      setPages([initialPage])
    }
  }, [pages.length, setPages])

  // Get current page data
  const currentPage = pages[currentPageIndex] || pages[0]
  
  // Initial data for Excalidraw
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
      
      // Update the current page's scene data
      const updatedPages = [...pages]
      if (updatedPages[currentPageIndex]) {
        updatedPages[currentPageIndex] = {
          ...updatedPages[currentPageIndex],
          scene: sceneData
        }
        setPages(updatedPages)
        setSaveState('saved')
      }
    }
  }, 800)

  // Handle canvas changes
  const handleChange = useCallback((elements: any, appState: any, files: any) => {
    setSaveState('saving')
    debouncedSave(elements, appState, files)
    
    // Update undo/redo state
    if (excalidrawRef.current) {
      try {
        const history = excalidrawRef.current.history
        if (history) {
          setCanUndo(history.canUndo())
          setCanRedo(history.canRedo())
        }
      } catch (error) {
        // Silently handle - history API might not be available
      }
      
      // Sync zoom changes from canvas back to store
      if (appState?.zoom?.value && Math.abs(appState.zoom.value - zoom) > 0.01) {
        setZoom(appState.zoom.value)
      }
    }
  }, [debouncedSave, setSaveState, setCanUndo, setCanRedo, zoom, setZoom])

  // Handle Excalidraw API initialization
  const handleExcalidrawAPI = useCallback((api: any) => {
    console.log('🎯 Excalidraw API initialized:', !!api)
    excalidrawRef.current = api
    setExcalidrawAPI(api) // Store API in workspace store
    
    // Set initial tool and properties based on workspace store
    if (api) {
      setTimeout(() => {
        try {
          // Map workspace tools to Excalidraw tools
          let excalidrawTool = 'freedraw' // default
          
          switch (activeTool) {
            case 'draw':
              excalidrawTool = 'freedraw'
              break
            case 'text':
              excalidrawTool = 'text'
              break
            case 'select':
              excalidrawTool = 'selection'
              break
            case 'erase':
              excalidrawTool = 'eraser'
              break
            case 'highlighter':
              excalidrawTool = 'freedraw' // Excalidraw doesn't have dedicated highlighter, use freedraw with different properties
              break
            case 'shapes':
              excalidrawTool = 'rectangle'
              break
            default:
              excalidrawTool = 'freedraw'
          }
          
          // Set tool
          api.setActiveTool({ type: excalidrawTool })
          
          // Set tool properties based on current tool
          const toolProperties: any = {}
          
          if (activeTool === 'draw') {
            toolProperties.strokeColor = toolPrefs.drawColor
            toolProperties.strokeWidth = toolPrefs.drawSize
            toolProperties.strokeOpacity = toolPrefs.drawOpacity * 100 // Excalidraw uses 0-100
          } else if (activeTool === 'highlighter') {
            toolProperties.strokeColor = toolPrefs.highlighterColor
            toolProperties.strokeWidth = toolPrefs.highlighterSize
            toolProperties.strokeOpacity = toolPrefs.highlighterOpacity * 100
          } else if (activeTool === 'text') {
            toolProperties.strokeColor = toolPrefs.textColor
            toolProperties.fontSize = toolPrefs.textSize
            toolProperties.fontFamily = toolPrefs.textFamily
          }
          
          // Apply tool properties
          if (Object.keys(toolProperties).length > 0) {
            api.updateScene({ 
              appState: toolProperties
            })
          }
          
          // Sync zoom
          const currentZoom = api.getAppState()?.zoom?.value || 1
          if (Math.abs(currentZoom - zoom) > 0.01) {
            api.zoomToFit()
            setTimeout(() => {
              api.setZoom(zoom)
            }, 50)
          }
          
          console.log(`✅ Canvas tool set to: ${excalidrawTool} (from ${activeTool})`)
        } catch (error) {
          console.error('❌ Canvas tool setting failed:', error)
        }
      }, 100)
    }
  }, [activeTool, toolPrefs, zoom, setExcalidrawAPI])

  // Update Excalidraw tool and properties when workspace changes
  useEffect(() => {
    if (excalidrawRef.current) {
      let excalidrawTool = 'freedraw'
      
      switch (activeTool) {
        case 'draw':
          excalidrawTool = 'freedraw'
          break
        case 'text':
          excalidrawTool = 'text'
          break
        case 'select':
          excalidrawTool = 'selection'
          break
        case 'erase':
          excalidrawTool = 'eraser'
          break
        case 'highlighter':
          excalidrawTool = 'freedraw' // Use freedraw with highlighter properties
          break
        case 'shapes':
          excalidrawTool = 'rectangle'
          break
      }
      
      try {
        // Set tool
        excalidrawRef.current.setActiveTool({ type: excalidrawTool })
        
        // Update tool properties
        const toolProperties: any = {}
        
        if (activeTool === 'draw') {
          toolProperties.strokeColor = toolPrefs.drawColor
          toolProperties.strokeWidth = toolPrefs.drawSize
          toolProperties.strokeOpacity = toolPrefs.drawOpacity * 100
        } else if (activeTool === 'highlighter') {
          toolProperties.strokeColor = toolPrefs.highlighterColor
          toolProperties.strokeWidth = toolPrefs.highlighterSize
          toolProperties.strokeOpacity = toolPrefs.highlighterOpacity * 100
        } else if (activeTool === 'text') {
          toolProperties.strokeColor = toolPrefs.textColor
          toolProperties.fontSize = toolPrefs.textSize
          toolProperties.fontFamily = toolPrefs.textFamily
        }
        
        // Apply tool properties
        if (Object.keys(toolProperties).length > 0) {
          excalidrawRef.current.updateScene({ 
            appState: toolProperties
          })
        }
        
      } catch (error) {
        console.error('Error updating canvas tool:', error)
      }
    }
  }, [activeTool, toolPrefs])

  // Sync zoom changes
  useEffect(() => {
    if (excalidrawRef.current && zoom) {
      try {
        const currentZoom = excalidrawRef.current.getAppState()?.zoom?.value || 1
        if (Math.abs(currentZoom - zoom) > 0.01) {
          excalidrawRef.current.setZoom(zoom)
        }
      } catch (error) {
        console.error('Error updating canvas zoom:', error)
      }
    }
  }, [zoom])

  return (
    <section 
      className="w-full max-w-5xl min-h-[60vh] bg-white rounded-2xl shadow border border-border flex flex-col overflow-hidden"
      role="main"
      aria-label="Student workspace canvas area"
    >
      {/* Canvas Header */}
      <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 rounded-t-2xl">
        <h2 className="text-sm font-medium text-text-main">My Canvas</h2>
      </div>
      
      {/* Canvas Content - Excalidraw Integration */}
      <div 
        className="flex-1 relative min-h-[400px]"
        style={{ minHeight: '400px' }}
      >
        <Excalidraw
          excalidrawAPI={handleExcalidrawAPI}
          onChange={handleChange}
          initialData={initialData}
          viewModeEnabled={false}
          theme="light"
        />
      </div>
      
      {/* Turn in button */}
      <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50 rounded-b-2xl">
        <button 
          className="px-4 py-2 bg-support-teal text-white rounded-md hover:bg-support-teal/90 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors font-medium"
          aria-label="Turn in assignment"
          tabIndex={2}
        >
          Turn in
        </button>
      </div>
    </section>
  )
}