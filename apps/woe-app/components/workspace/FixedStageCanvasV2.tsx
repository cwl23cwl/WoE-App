'use client'

import { useRef, useCallback, useEffect, useState, useMemo } from 'react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { throttle, shallowArrayEqual } from '../../src/utils/reactGuards'
import React from 'react'

// Fixed stage constants - no more dynamic sizing
const STAGE_WIDTH = 1200
const STAGE_HEIGHT = 800

// Clean, simple Excalidraw component without complex workspace packages
let ExcalidrawComponent: any = null

interface FixedStageCanvasV2Props {
  className?: string
}

export function FixedStageCanvasV2({ className = '' }: FixedStageCanvasV2Props) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
  
  // Get current page
  const currentPage = pages[currentPageIndex]

  // Load Excalidraw dynamically - simple approach (copied from working component)
  useEffect(() => {
    const loadExcalidraw = async () => {
      try {
        const { Excalidraw } = await import('@excalidraw/excalidraw')
        ExcalidrawComponent = Excalidraw
        setIsLoaded(true)
        console.log('✅ FixedStageCanvasV2 Excalidraw loaded successfully')
      } catch (err) {
        console.error('❌ Failed to load Excalidraw in FixedStageCanvasV2:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }
    
    loadExcalidraw()
  }, [])

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
    console.count && console.count("onChange:FixedStageCanvasV2");
    
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
      className={`fixed-stage-container ${className}`}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '20px',
        backgroundColor: '#f8f9fa', // Light background around the stage
        overflow: 'auto', // Allow document scrolling if needed
      }}
    >
      {/* Fixed Stage - The "page" that never changes size */}
      <div
        className="fixed-stage"
        style={{
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
          minWidth: STAGE_WIDTH,
          minHeight: STAGE_HEIGHT,
          maxWidth: STAGE_WIDTH,
          maxHeight: STAGE_HEIGHT,
          backgroundColor: '#ffffff',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          overflow: 'hidden', // KEY: No internal scrolling
          // Responsive scaling for smaller screens using CSS transform
          transformOrigin: 'top center',
          transform: `scale(min(1, calc((100vw - 80px) / ${STAGE_WIDTH}), calc((100vh - 200px) / ${STAGE_HEIGHT})))`,
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
              top: '32px',
              left: '32px',
              right: '32px',
              bottom: '32px',
              border: '1px dotted rgba(0, 0, 0, 0.15)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        )}
        
        {/* Excalidraw Canvas - Fixed size, no internal zoom/pan */}
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <ExcalidrawComponent
            ref={(api: any) => {
              excalidrawRef.current = api
              if (api) {
                setExcalidrawAPI(api)
              }
            }}
            width={STAGE_WIDTH}
            height={STAGE_HEIGHT}
            initialData={{
              elements: elements,
              appState: {
                ...appState,
                theme: 'light',
                viewBackgroundColor: 'transparent',
                // Lock zoom and pan to prevent user confusion
                zoom: { value: 1 }, // Always 100% zoom
                scrollX: 0,
                scrollY: 0,
                zenModeEnabled: false,
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
                changeViewBackgroundColor: false,
              },
              tools: {
                image: false, // Often causes zoom issues
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}