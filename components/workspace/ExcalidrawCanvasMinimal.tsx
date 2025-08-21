'use client'

import { useRef, useCallback, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import dynamic from 'next/dynamic'

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

interface ExcalidrawCanvasMinimalProps {
  className?: string
  width?: string | number
  height?: string | number
}

export interface ExcalidrawCanvasMinimalRef {
  excalidrawAPI: any
}

export const ExcalidrawCanvasMinimal = forwardRef<ExcalidrawCanvasMinimalRef, ExcalidrawCanvasMinimalProps>(({ 
  className = '',
  width = '100%',
  height = '600px',
}, ref) => {
  const excalidrawRef = useRef<any>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Ensure component is mounted before API calls
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Static initial data - never changes
  const initialData = {
    elements: [],
    appState: {
      viewBackgroundColor: '#ffffff',
    },
  }

  // API reference handler
  const handleExcalidrawAPI = useCallback((api: any) => {
    console.log('🎯 Minimal Excalidraw API initialized:', !!api)
    excalidrawRef.current = api
  }, [])

  // Expose API through ref
  useImperativeHandle(ref, () => ({
    excalidrawAPI: excalidrawRef.current
  }), [])

  // Empty change handler - no state updates to prevent loops
  const handleChange = useCallback(() => {
    // Do nothing - this prevents infinite loops
    console.log('📝 Canvas changed (no state update)')
  }, [])

  // Hide ALL native UI
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
      className={`${className} excalidraw-minimal-wrapper`} 
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        minHeight: '400px'
      }}
    >
      <style jsx global>{`
        /* Hide ALL Excalidraw UI elements */
        .excalidraw-minimal-wrapper .Island,
        .excalidraw-minimal-wrapper .App-menu,
        .excalidraw-minimal-wrapper .App-menu_top,
        .excalidraw-minimal-wrapper .App-toolbar,
        .excalidraw-minimal-wrapper .App-toolbar-content,
        .excalidraw-minimal-wrapper .layer-ui__wrapper,
        .excalidraw-minimal-wrapper .layer-ui__wrapper > .Island,
        .excalidraw-minimal-wrapper .excalidraw .Island,
        .excalidraw-minimal-wrapper [data-testid="toolbar"],
        .excalidraw-minimal-wrapper [data-testid="main-menu"],
        .excalidraw-minimal-wrapper [data-testid="canvas-menu"],
        .excalidraw-minimal-wrapper .ToolIcon,
        .excalidraw-minimal-wrapper .App-bottom-bar,
        .excalidraw-minimal-wrapper .excalidraw .layer-ui__wrapper .Island:not(.zen-mode-transition) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        
        .excalidraw-minimal-wrapper .excalidraw {
          --ui-font: inherit;
          position: relative !important;
        }
        
        .excalidraw-minimal-wrapper .excalidraw > .layer-ui__wrapper {
          display: none !important;
        }
      `}</style>
      <Excalidraw
        excalidrawAPI={handleExcalidrawAPI}
        onChange={handleChange}
        initialData={initialData}
        viewModeEnabled={false}
        zenModeEnabled={true}
        gridModeEnabled={false}
        theme="light"
        UIOptions={uiOptions}
        renderTopRightUI={() => null}
        renderCustomStats={() => null}
        renderFooter={() => null}
      />
    </div>
  )
})

ExcalidrawCanvasMinimal.displayName = 'ExcalidrawCanvasMinimal'