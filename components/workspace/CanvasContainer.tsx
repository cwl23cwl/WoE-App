// components/workspace/CanvasContainer.tsx - Fixes coordinate precision issues
'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

interface CanvasContainerProps {
  children: React.ReactNode
  className?: string
}

export function CanvasContainer({ children, className = '' }: CanvasContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { excalidrawAPI } = useWorkspaceStore()

  // Force Excalidraw to recalculate viewport coordinates
  const recalculateCoordinates = useCallback(() => {
    if (excalidrawAPI && containerRef.current) {
      try {
        // Force Excalidraw to refresh its viewport calculations
        const event = new Event('resize', { bubbles: true, cancelable: true })
        window.dispatchEvent(event)
        
        // Small delay to ensure DOM has settled
        setTimeout(() => {
          if (excalidrawAPI) {
            // Trigger a scene update to refresh coordinate system
            const currentState = excalidrawAPI.getAppState()
            excalidrawAPI.updateScene({
              appState: {
                ...currentState,
                // This forces a coordinate recalculation
                timestamp: Date.now()
              }
            })
          }
        }, 100)
      } catch (error) {
        console.warn('Failed to recalculate coordinates:', error)
      }
    }
  }, [excalidrawAPI])

  // Recalculate coordinates when layout changes
  useEffect(() => {
    // Use ResizeObserver to detect any size changes to the container
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Debounce the coordinate recalculation
        clearTimeout(recalculateTimeout)
        recalculateTimeout = setTimeout(recalculateCoordinates, 50)
      }
    })

    let recalculateTimeout: NodeJS.Timeout

    resizeObserver.observe(containerRef.current)

    return () => {
      clearTimeout(recalculateTimeout)
      resizeObserver.disconnect()
    }
  }, [recalculateCoordinates])

  // Also recalculate when the component mounts
  useEffect(() => {
    const timer = setTimeout(recalculateCoordinates, 200)
    return () => clearTimeout(timer)
  }, [recalculateCoordinates])

  return (
    <div 
      ref={containerRef}
      className={`canvas-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        // Ensure consistent positioning
        transform: 'translateZ(0)', // Force hardware acceleration
        backfaceVisibility: 'hidden', // Prevent subpixel issues
      }}
    >
      {children}

      <style jsx>{`
        .canvas-container {
          /* Ensure canvas gets proper coordinate system */
          isolation: isolate;
        }

        /* Ensure Excalidraw canvas is properly positioned */
        .canvas-container :global(.excalidraw) {
          position: relative !important;
          transform: none !important;
        }

        .canvas-container :global(.excalidraw-wrapper) {
          position: relative !important;
          transform: none !important;
        }

        /* Prevent coordinate issues from transforms */
        .canvas-container :global(.App-canvas) {
          transform: none !important;
          position: relative !important;
        }
      `}</style>
    </div>
  )
}