'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { WORKSPACE_DEFAULTS } from '@/lib/workspace-defaults'
import { cn } from '@/lib/utils'

interface PageCanvasProps {
  className?: string
  onDirtyChange?: (isDirty: boolean) => void
  children?: React.ReactNode
  canvasComponent?: React.ComponentType<any>
  showMargins?: boolean
}

export function PageCanvas({
  className,
  onDirtyChange,
  children,
  canvasComponent: CanvasComponent,
  showMargins = false
}: PageCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [isResizing, setIsResizing] = useState(false)
  
  const {
    pages,
    currentPageIndex,
    zoom,
    setDirty,
    isDirty,
    toolPrefs,
    activeTool
  } = useWorkspaceStore()

  const currentPage = pages[currentPageIndex]

  // Calculate canvas dimensions based on viewport and zoom
  const calculateCanvasSize = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    
    // Get base page dimensions from defaults
    const baseWidth = WORKSPACE_DEFAULTS.pageSize.w
    const baseHeight = WORKSPACE_DEFAULTS.pageSize.h
    
    // Calculate scale to fit within container width with padding
    const padding = 40 // 20px on each side
    const availableWidth = containerRect.width - padding
    const availableHeight = Math.max(600, containerRect.height - padding)
    
    // Scale to fit width, but respect zoom
    const scaleToFit = Math.min(availableWidth / baseWidth, 1.0)
    const finalScale = scaleToFit * zoom
    
    const scaledWidth = baseWidth * finalScale
    const scaledHeight = baseHeight * finalScale
    
    setCanvasSize({
      width: scaledWidth,
      height: scaledHeight
    })
  }, [zoom])

  // Recalculate size on mount and when dependencies change
  useEffect(() => {
    calculateCanvasSize()
  }, [calculateCanvasSize])

  // Handle window resize
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout

    const handleResize = () => {
      setIsResizing(true)
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        calculateCanvasSize()
        setIsResizing(false)
      }, 150)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimer)
    }
  }, [calculateCanvasSize])

  // Handle canvas content changes
  const handleCanvasChange = useCallback(() => {
    if (!isDirty) {
      setDirty(true)
      onDirtyChange?.(true)
    }
  }, [isDirty, setDirty, onDirtyChange])

  // Get current page orientation
  const getPageOrientation = () => {
    return currentPage?.orientation || WORKSPACE_DEFAULTS.orientation
  }

  // Apply orientation to canvas dimensions
  const getOrientedDimensions = () => {
    const orientation = getPageOrientation()
    if (orientation === 'landscape') {
      return {
        width: Math.max(canvasSize.width, canvasSize.height),
        height: Math.min(canvasSize.width, canvasSize.height)
      }
    }
    return {
      width: canvasSize.width,
      height: canvasSize.height
    }
  }

  const orientedSize = getOrientedDimensions()

  // CSS custom properties for canvas styling
  const canvasStyles = {
    '--canvas-width': `${orientedSize.width}px`,
    '--canvas-height': `${orientedSize.height}px`,
    '--zoom-level': zoom,
  } as React.CSSProperties

  // Margin guides (dotted lines)
  const MarginGuides = () => {
    if (!showMargins) return null

    const marginSize = 60 // 60px margin guides
    
    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Top margin */}
        <div 
          className="absolute top-0 left-0 right-0 border-t border-dotted border-gray-300"
          style={{ marginTop: `${marginSize}px` }}
        />
        
        {/* Bottom margin */}
        <div 
          className="absolute bottom-0 left-0 right-0 border-b border-dotted border-gray-300"
          style={{ marginBottom: `${marginSize}px` }}
        />
        
        {/* Left margin */}
        <div 
          className="absolute top-0 bottom-0 left-0 border-l border-dotted border-gray-300"
          style={{ marginLeft: `${marginSize}px` }}
        />
        
        {/* Right margin */}
        <div 
          className="absolute top-0 bottom-0 right-0 border-r border-dotted border-gray-300"
          style={{ marginRight: `${marginSize}px` }}
        />
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex-1 overflow-auto bg-gray-100 p-4",
        className
      )}
      style={canvasStyles}
    >
      <div className="flex justify-center">
        <div
          ref={canvasRef}
          className={cn(
            "relative bg-white border border-gray-300 shadow-lg rounded-lg overflow-hidden transition-all duration-200",
            isResizing && "transition-none",
            // Page-like shadow effect
            "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.05)]"
          )}
          style={{
            width: orientedSize.width,
            height: orientedSize.height,
            minHeight: '600px', // Minimum height for usability
          }}
          role="application"
          aria-label={`Page ${currentPageIndex + 1} canvas`}
          tabIndex={0}
        >
          {/* PDF Background Layer (if applicable) */}
          {currentPage?.scene?.pdfBackground && (
            <div className="absolute inset-0 z-0">
              {/* PDF background would be rendered here */}
            </div>
          )}

          {/* Margin Guides */}
          <MarginGuides />

          {/* Canvas Content */}
          <div 
            className="absolute inset-0 z-10"
            onMouseDown={handleCanvasChange}
            onTouchStart={handleCanvasChange}
          >
            {CanvasComponent ? (
              <CanvasComponent
                width={orientedSize.width}
                height={orientedSize.height}
                zoom={zoom}
                activeTool={activeTool}
                toolPrefs={toolPrefs}
                pageData={currentPage}
                onChange={handleCanvasChange}
              />
            ) : (
              children
            )}
          </div>

          {/* Loading overlay during resize */}
          {isResizing && (
            <div className="absolute inset-0 z-50 bg-white/50 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-lg px-4 py-2">
                <span className="text-sm text-gray-600">Resizing...</span>
              </div>
            </div>
          )}

          {/* Page info overlay (for debugging) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="absolute top-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
              {orientedSize.width.toFixed(0)} × {orientedSize.height.toFixed(0)} 
              <span className="ml-2">({Math.round(zoom * 100)}%)</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Canvas Info Bar (for accessibility) */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Page {currentPageIndex + 1} of {pages.length}, 
        {orientedSize.width.toFixed(0)} by {orientedSize.height.toFixed(0)} pixels,
        zoom {Math.round(zoom * 100)} percent,
        {getPageOrientation()} orientation
      </div>
    </div>
  )
}

// Helper component for canvas hit areas
export const CanvasHitArea = ({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "absolute inset-0 cursor-crosshair",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Hook for canvas interactions
export const useCanvasInteraction = (
  canvasRef: React.RefObject<HTMLElement>,
  onDirtyChange?: (isDirty: boolean) => void
) => {
  const { activeTool, toolPrefs, setDirty } = useWorkspaceStore()
  const [isDrawing, setIsDrawing] = useState(false)

  const startInteraction = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true)
    setDirty(true)
    onDirtyChange?.(true)
    
    // Tool-specific interaction logic would go here
    console.log('Start interaction with tool:', activeTool, 'at:', {
      x: 'clientX' in event ? event.clientX : event.touches[0].clientX,
      y: 'clientY' in event ? event.clientY : event.touches[0].clientY
    })
  }, [activeTool, setDirty, onDirtyChange])

  const continueInteraction = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    
    // Tool-specific drawing logic would go here
  }, [isDrawing])

  const endInteraction = useCallback(() => {
    setIsDrawing(false)
    
    // Finalize drawing operation
  }, [])

  return {
    startInteraction,
    continueInteraction,
    endInteraction,
    isDrawing,
    activeTool,
    toolPrefs
  }
}