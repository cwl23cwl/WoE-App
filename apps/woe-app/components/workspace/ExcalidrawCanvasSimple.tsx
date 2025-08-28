'use client'

import { useRef, useCallback, useEffect, useState, useMemo } from 'react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { throttle, shallowArrayEqual } from '../../src/utils/reactGuards'
import React from 'react'

// Clean, simple Excalidraw component without complex workspace packages
let ExcalidrawComponent: any = null

interface ExcalidrawCanvasSimpleProps {
  className?: string
}

export function ExcalidrawCanvasSimple({ className = '' }: ExcalidrawCanvasSimpleProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [elements, setElements] = useState<any[]>([])
  const [appState, setAppState] = useState<any>({})
  
  const excalidrawRef = useRef(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const elementsRef = useRef<any[]>([])
  const appStateRef = useRef<any>({})
  const syncingRef = useRef(false)

  // Keep refs in sync with state
  useEffect(() => { elementsRef.current = elements }, [elements])
  useEffect(() => { appStateRef.current = appState }, [appState])
  
  const {
    activeTool,
    showMarginGuides,
    pages,
    currentPageIndex,
    setExcalidrawAPI,
    setCanUndo,
    setCanRedo,
  } = useWorkspaceStore()
  
  // Get current page orientation
  const currentPage = pages[currentPageIndex]
  const orientation = currentPage?.orientation || 'portrait'
  
  // Calculate page dimensions based on orientation (memoized to prevent infinite loops)
  const getPageDimensions = useMemo(() => {
    return (containerWidth: number, containerHeight: number) => {
      // Much more conservative limits to prevent canvas size errors
      const MAX_WIDTH = 600  // Safe browser limit
      const MAX_HEIGHT = 500 // Safe browser limit
      
      const availableWidth = Math.min(containerWidth - 40, MAX_WIDTH)
      const availableHeight = Math.min(containerHeight - 40, MAX_HEIGHT)
      
      if (orientation === 'landscape') {
        // Landscape: wider than tall but within safe limits
        const aspectRatio = 4 / 3  // More conservative ratio
        const width = Math.min(availableWidth, availableHeight * aspectRatio, MAX_WIDTH)
        const height = Math.min(availableHeight, width / aspectRatio, MAX_HEIGHT)
        return { width, height }
      } else {
        // Portrait: taller than wide but within safe limits  
        const aspectRatio = 3 / 4  // More conservative ratio
        const height = Math.min(availableHeight, availableWidth / aspectRatio, MAX_HEIGHT)
        const width = Math.min(availableWidth, height * aspectRatio, MAX_WIDTH)
        return { width, height }
      }
    }
  }, [orientation])

  // Load Excalidraw dynamically - simple approach
  useEffect(() => {
    const loadExcalidraw = async () => {
      try {
        const { Excalidraw } = await import('@excalidraw/excalidraw')
        ExcalidrawComponent = Excalidraw
        setIsLoaded(true)
        console.log('✅ Excalidraw loaded successfully')
      } catch (err) {
        console.error('❌ Failed to load Excalidraw:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }
    
    loadExcalidraw()
  }, [])

  // Use ResizeObserver to manage canvas dimensions safely
  useEffect(() => {
    if (!containerRef.current || !isLoaded) return

    let timeoutId: NodeJS.Timeout | null = null

    const resizeObserver = new ResizeObserver((entries) => {
      // Throttle updates to prevent excessive re-renders
      if (timeoutId) clearTimeout(timeoutId)
      
      timeoutId = setTimeout(() => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect
          
          // Skip updates if dimensions are too small or invalid
          if (width < 100 || height < 100) return
          
          // Calculate page dimensions based on orientation and available space
          const pageDimensions = getPageDimensions(width, height)
          
          // Only update if dimensions actually changed to prevent infinite loops
          setDimensions(prev => {
            const widthDiff = Math.abs(prev.width - pageDimensions.width)
            const heightDiff = Math.abs(prev.height - pageDimensions.height)
            
            // Only update if there's a meaningful difference (> 5px)
            if (widthDiff > 5 || heightDiff > 5) {
              return pageDimensions
            }
            return prev
          })
        }
      }, 100) // 100ms throttle
    })

    resizeObserver.observe(containerRef.current)
    return () => {
      resizeObserver.disconnect()
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isLoaded, getPageDimensions])

  // Guarded onChange handler with throttling and reentrancy protection
  const handleChangeGuarded = useMemo(() => throttle((nextElements: any[], nextAppState: any) => {
    if (syncingRef.current) return;

    // Avoid no-op updates
    const sameEls = shallowArrayEqual(elementsRef.current, nextElements || []);
    const sameState = JSON.stringify(appStateRef.current) === JSON.stringify(nextAppState || {}); // coarse but effective
    if (sameEls && sameState) return;

    try {
      syncingRef.current = true;
      if (!sameEls) setElements(nextElements || []);
      if (!sameState) setAppState(nextAppState || {});
      
      // Update undo/redo state
      if (nextAppState) {
        setCanUndo(nextAppState.canUndo || false)
        setCanRedo(nextAppState.canRedo || false)
      }
    } finally {
      syncingRef.current = false;
    }
  }, 150), [setCanUndo, setCanRedo])

  const onChange = useCallback((elementsOrApi: any, state?: any) => {
    // Debug: count renders to spot runaway loops during dev
    console.count && console.count("onChange:ExcalidrawCanvasSimple");
    
    // Handle both old and new Excalidraw signatures
    if (Array.isArray(elementsOrApi)) {
      // Old signature: (elements, appState)
      handleChangeGuarded(elementsOrApi, state);
    } else if (elementsOrApi && typeof elementsOrApi === 'object') {
      // New signature: single object with elements and appState
      handleChangeGuarded(elementsOrApi.elements || [], elementsOrApi.appState || elementsOrApi);
    }
  }, [handleChangeGuarded])

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 ${className}`}>
        <div className="text-red-600 p-4 rounded bg-white shadow">
          <h3 className="font-bold mb-2">Failed to load canvas</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!isLoaded || !ExcalidrawComponent) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="text-gray-600 p-4">
          Loading canvas...
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        maxWidth: '1600px',
        maxHeight: '1000px',
        minWidth: '300px',
        minHeight: '200px',
        position: 'relative',
        overflow: 'auto', // Allow vertical scrolling for long pages
        backgroundColor: '#f5f5f5', // Subtle background around the page
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      {/* Page Container - White background with border and shadow */}
      <div
        style={{
          width: dimensions.width,
          height: dimensions.height,
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5e5', // 1px neutral border
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // Subtle outer shadow
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* PDF Background Support - rendered under drawing layers */}
        {currentPage?.pdfBackground && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url(${currentPage.pdfBackground})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              opacity: 0.8,
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
        )}
        
        {/* Faint dotted margin guides - toggleable */}
        {showMarginGuides && (
          <div
            style={{
              position: 'absolute',
              top: '24px',
              left: '24px',
              right: '24px',
              bottom: '24px',
              border: '1px dotted rgba(0, 0, 0, 0.15)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        )}
        
        {/* Excalidraw Canvas */}
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <ExcalidrawComponent
            ref={(api: any) => {
              excalidrawRef.current = api
              if (api) {
                setExcalidrawAPI(api)
              }
            }}
            width={Math.min(dimensions.width, 600)}
            height={Math.min(dimensions.height, 500)}
            initialData={{
              elements: elements,
              appState: {
                ...appState,
                theme: 'light',
                viewBackgroundColor: 'transparent', // Transparent so we see the white page background
                zoom: { value: 1 },
                gridSize: null,
              },
            }}
            onChange={process.env.NEXT_PUBLIC_NOOP_EXCALIDRAW ? undefined : onChange}
            UIOptions={{
              canvasActions: {
                loadScene: false,
                saveScene: false,
                export: false,
                toggleTheme: false,
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}