'use client'

import { useRef, useCallback, useEffect, useState, useMemo, forwardRef, useImperativeHandle } from 'react'
import dynamic from 'next/dynamic'
import { useWorkspaceStore } from '@/stores/workspace'
import { useDebounce } from 'use-debounce'
import { HIGHLIGHTER_CONFIG } from '@/lib/workspace-swatches'

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

interface ExcalidrawCanvasCustomProps {
  className?: string
  width?: string | number
  height?: string | number
  showToolbar?: boolean
  showMobileMenu?: boolean
  showThemeToggle?: boolean
  showExportDialog?: boolean
  zenMode?: boolean
  gridMode?: boolean
}

export interface ExcalidrawCanvasCustomRef {
  excalidrawAPI: any
}

export const ExcalidrawCanvasCustom = forwardRef<ExcalidrawCanvasCustomRef, ExcalidrawCanvasCustomProps>(({ 
  className = '',
  width = '100%',
  height = '600px',
  showToolbar = true,
  showMobileMenu = true,
  showThemeToggle = false,
  showExportDialog = true,
  zenMode = false,
  gridMode = false
}, ref) => {
  const excalidrawRef = useRef<any>(null)
  const [isMounted, setIsMounted] = useState(false)
  const isConfiguredRef = useRef(false)
  
  const { 
    pages, 
    pageIndex, 
    tool,
    strokeColor,
    textColor,
    fillColor,
    fillOpacity,
    penWidth,
    highlighterWidth,
    zoom,
    setSceneForPage, 
    setSaveState 
  } = useWorkspaceStore()

  // Ensure component is mounted before API calls
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Get current page data
  const currentPage = pages[pageIndex]
  
  // Static initialData to prevent re-renders completely
  const initialData = useMemo(() => {
    // Always return base data - we'll load scene data through the API later
    return {
      elements: [],
      appState: {
        viewBackgroundColor: '#ffffff',
        gridSize: gridMode ? 20 : null,
      },
    }
  }, [gridMode]) // Only depend on gridMode to prevent loops

  // Use a ref to prevent save loops
  const saveInProgressRef = useRef(false)

  // Debounced save function with loop prevention
  const [debouncedSave] = useDebounce((elements: any, appState: any, files: any) => {
    if (currentPage && !saveInProgressRef.current) {
      saveInProgressRef.current = true
      
      const sceneData = {
        elements,
        appState,
        files,
      }
      
      setSceneForPage(pageIndex, sceneData)
      setSaveState('saved')
      
      // Reset the flag after a delay
      setTimeout(() => {
        saveInProgressRef.current = false
      }, 100)
    }
  }, 800)

  // Handle canvas changes with loop prevention
  const handleChange = useCallback((elements: any, appState: any, files: any) => {
    if (!saveInProgressRef.current) {
      setSaveState('saving')
      debouncedSave(elements, appState, files)
    }
  }, [debouncedSave, setSaveState])

  // API reference with minimal intervention
  const handleExcalidrawAPI = useCallback((api: any) => {
    console.log('🎯 Custom Excalidraw API initialized:', !!api)
    excalidrawRef.current = api
  }, [])

  // Expose API through ref
  useImperativeHandle(ref, () => ({
    excalidrawAPI: excalidrawRef.current
  }), [])

  // Map workspace tools to Excalidraw tools
  const mapWorkspaceToolToExcalidraw = useCallback((workspaceTool: string) => {
    switch (workspaceTool) {
      case 'select': return { type: 'selection' }
      case 'pencil': return { type: 'freedraw' }
      case 'text': return { type: 'text' }
      case 'eraser': return { type: 'eraser' }
      case 'highlighter': return { type: 'freedraw' } // Use freedraw with highlighter styles
      default: return { type: 'freedraw' }
    }
  }, [])

  // Handle tool changes from workspace store
  useEffect(() => {
    if (isMounted && excalidrawRef.current && isConfiguredRef.current && !saveInProgressRef.current) {
      const api = excalidrawRef.current
      
      try {
        // Block saves during tool/style updates
        saveInProgressRef.current = true
        
        const excalidrawTool = mapWorkspaceToolToExcalidraw(tool)
        api.setActiveTool(excalidrawTool)
        console.log(`🎯 Tool changed to: ${tool} -> ${excalidrawTool.type}`)
        
        // Apply color and styling based on current tool
        const appStateUpdates: any = {}
        
        if (tool === 'pencil') {
          appStateUpdates.currentItemStrokeColor = strokeColor
          appStateUpdates.currentItemStrokeWidth = penWidth
          appStateUpdates.currentItemRoughness = 1
        } else if (tool === 'highlighter') {
          appStateUpdates.currentItemStrokeColor = strokeColor
          appStateUpdates.currentItemStrokeWidth = highlighterWidth
          appStateUpdates.currentItemOpacity = HIGHLIGHTER_CONFIG.opacity * 100 // Excalidraw uses 0-100
        } else if (tool === 'text') {
          appStateUpdates.currentItemStrokeColor = textColor
          appStateUpdates.currentItemFontSize = 20
        }
        
        if (Object.keys(appStateUpdates).length > 0) {
          api.updateScene({ appState: appStateUpdates })
        }
        
        // Unblock saves after a delay
        setTimeout(() => {
          saveInProgressRef.current = false
        }, 100)
        
      } catch (error) {
        console.error('❌ Tool change failed:', error)
        saveInProgressRef.current = false
      }
    }
  }, [isMounted, tool, strokeColor, textColor, penWidth, highlighterWidth]) // mapWorkspaceToolToExcalidraw is stable

  // Handle initial API configuration (run only once)
  useEffect(() => {
    if (isMounted && excalidrawRef.current && !isConfiguredRef.current) {
      const api = excalidrawRef.current
      isConfiguredRef.current = true
      
      setTimeout(() => {
        try {
          // Load scene data if it exists
          if (currentPage?.scene) {
            api.updateScene(currentPage.scene)
            console.log('✅ Loaded scene data for page:', pageIndex)
          }
          
          // Set initial tool based on workspace state
          const excalidrawTool = mapWorkspaceToolToExcalidraw(tool)
          api.setActiveTool(excalidrawTool)
          console.log('✅ Custom canvas initialized with tool:', tool)
          
          if (gridMode) {
            api.updateScene({
              appState: { gridSize: 20 }
            })
          }
        } catch (error) {
          console.error('❌ Custom canvas setup failed:', error)
        }
      }, 100)
    }
  }, [isMounted]) // Only depend on isMounted to run once

  // Handle page changes separately to avoid initial data loops
  useEffect(() => {
    if (isMounted && excalidrawRef.current && isConfiguredRef.current) {
      const api = excalidrawRef.current
      
      try {
        // Block saves during page changes
        saveInProgressRef.current = true
        
        if (currentPage?.scene) {
          api.updateScene(currentPage.scene)
          console.log('✅ Switched to page:', pageIndex)
        } else {
          // Clear canvas for empty pages
          api.updateScene({
            elements: [],
            appState: {
              viewBackgroundColor: '#ffffff',
              gridSize: gridMode ? 20 : null,
            },
          })
          console.log('✅ Cleared canvas for empty page:', pageIndex)
        }
        
        // Unblock saves after a delay
        setTimeout(() => {
          saveInProgressRef.current = false
        }, 200)
        
      } catch (error) {
        console.error('❌ Page switch failed:', error)
        saveInProgressRef.current = false
      }
    }
  }, [isMounted, pageIndex, gridMode]) // React to page changes only

  // Handle zoom changes from workspace store
  useEffect(() => {
    if (isMounted && excalidrawRef.current && isConfiguredRef.current && !saveInProgressRef.current) {
      try {
        // Block saves during zoom changes
        saveInProgressRef.current = true
        
        const api = excalidrawRef.current
        api.updateScene({
          appState: {
            zoom: { value: zoom }
          }
        })
        console.log(`🔍 Zoom changed to: ${zoom}`)
        
        // Unblock saves after a delay
        setTimeout(() => {
          saveInProgressRef.current = false
        }, 100)
        
      } catch (error) {
        console.error('❌ Zoom change failed:', error)
        saveInProgressRef.current = false
      }
    }
  }, [isMounted, zoom])

  // Custom UI options - COMPLETELY HIDE all native Excalidraw UI
  const uiOptions = {
    canvasActions: {
      toggleMenu: false,
      changeViewBackgroundColor: false,
      clearCanvas: false,
      export: false,
      loadScene: false,
      saveToActiveFile: false,
      toggleTheme: false,
      saveAsImage: false,
      toggleShortcuts: false,
    },
  }

  return (
    <div 
      className={`${className} excalidraw-custom-wrapper`} 
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        minHeight: '400px'
      }}
    >
      <style jsx global>{`
        /* Hide ALL Excalidraw UI elements */
        .excalidraw-custom-wrapper .Island,
        .excalidraw-custom-wrapper .App-menu,
        .excalidraw-custom-wrapper .App-menu_top,
        .excalidraw-custom-wrapper .App-toolbar,
        .excalidraw-custom-wrapper .App-toolbar-content,
        .excalidraw-custom-wrapper .layer-ui__wrapper,
        .excalidraw-custom-wrapper .layer-ui__wrapper > .Island,
        .excalidraw-custom-wrapper .excalidraw .Island,
        .excalidraw-custom-wrapper [data-testid="toolbar"],
        .excalidraw-custom-wrapper [data-testid="main-menu"],
        .excalidraw-custom-wrapper [data-testid="canvas-menu"],
        .excalidraw-custom-wrapper .ToolIcon,
        .excalidraw-custom-wrapper .App-bottom-bar,
        .excalidraw-custom-wrapper .excalidraw .layer-ui__wrapper .Island:not(.zen-mode-transition) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        
        /* Ensure canvas area takes full space */
        .excalidraw-custom-wrapper .excalidraw {
          --ui-font: inherit;
          position: relative !important;
        }
        
        .excalidraw-custom-wrapper .excalidraw > .layer-ui__wrapper {
          display: none !important;
        }
      `}</style>
      <Excalidraw
        excalidrawAPI={handleExcalidrawAPI}
        onChange={handleChange}
        initialData={initialData}
        viewModeEnabled={false}
        zenModeEnabled={true} // Force zen mode to hide ALL UI
        gridModeEnabled={gridMode}
        theme="light"
        UIOptions={uiOptions}
        renderTopRightUI={() => null}
        renderCustomStats={() => null}
        renderFooter={() => null}
      />
    </div>
  )
})

ExcalidrawCanvasCustom.displayName = 'ExcalidrawCanvasCustom'