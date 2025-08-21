'use client'

import React, { useRef, useEffect } from 'react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

// Temporary: Using HTML5 Canvas to avoid React version conflicts
// TODO: Replace with Excalidraw when React 19 support is available

export function CanvasShell() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const strokes = useRef<any[]>([])
  
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

  // Initialize canvas and API
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set up canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize pages if empty
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

    // Create compatible API for the store
    const canvasAPI = {
      setActiveTool: (tool: any) => {
        console.log('🎯 Canvas tool set to:', tool.type)
      },
      updateScene: (scene: any) => {
        if (scene.elements && scene.elements.length === 0) {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          strokes.current = []
          setCanUndo(false)
          setCanRedo(false)
          console.log('✅ Canvas cleared')
        }
      },
      history: {
        undo: () => {
          if (strokes.current.length > 0) {
            strokes.current.pop()
            redrawCanvas()
            setCanUndo(strokes.current.length > 0)
            console.log('⬅️ Undo performed')
          }
        },
        redo: () => {
          console.log('➡️ Redo (not implemented in simple version)')
        }
      },
      getAppState: () => ({ zoom: { value: zoom } }),
      setZoom: (newZoom: number) => setZoom(newZoom)
    }
    
    setExcalidrawAPI(canvasAPI)

    const redrawCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      strokes.current.forEach(stroke => {
        ctx.beginPath()
        ctx.strokeStyle = stroke.color
        ctx.lineWidth = stroke.width
        ctx.globalAlpha = stroke.opacity
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        
        stroke.points.forEach((point: any, index: number) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y)
          } else {
            ctx.lineTo(point.x, point.y)
          }
        })
        ctx.stroke()
      })
      ctx.globalAlpha = 1
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [pages.length, setPages, setExcalidrawAPI, zoom, setZoom, setCanUndo, setCanRedo])

  // Drawing functionality
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const startDrawing = (e: MouseEvent) => {
      if (activeTool !== 'draw' && activeTool !== 'highlighter') return
      
      isDrawing.current = true
      const rect = canvas.getBoundingClientRect()
      lastPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }

      // Start new stroke
      const strokeColor = activeTool === 'draw' ? toolPrefs.drawColor : toolPrefs.highlighterColor
      const strokeWidth = activeTool === 'draw' ? toolPrefs.drawSize : toolPrefs.highlighterSize
      const strokeOpacity = activeTool === 'draw' ? toolPrefs.drawOpacity : toolPrefs.highlighterOpacity

      strokes.current.push({
        color: strokeColor,
        width: strokeWidth,
        opacity: strokeOpacity,
        points: [{ ...lastPos.current }]
      })
      
      setCanUndo(true)
      setSaveState('saving')
    }

    const draw = (e: MouseEvent) => {
      if (!isDrawing.current || strokes.current.length === 0) return
      
      const rect = canvas.getBoundingClientRect()
      const currentPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }

      // Add point to current stroke
      const currentStroke = strokes.current[strokes.current.length - 1]
      currentStroke.points.push({ ...currentPos })

      // Draw the line segment
      ctx.beginPath()
      ctx.moveTo(lastPos.current.x, lastPos.current.y)
      ctx.lineTo(currentPos.x, currentPos.y)
      ctx.strokeStyle = currentStroke.color
      ctx.lineWidth = currentStroke.width
      ctx.globalAlpha = currentStroke.opacity
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()

      lastPos.current = currentPos
    }

    const stopDrawing = () => {
      if (isDrawing.current) {
        isDrawing.current = false
        ctx.globalAlpha = 1
        setSaveState('saved')
      }
    }

    canvas.addEventListener('mousedown', startDrawing)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', stopDrawing)
    canvas.addEventListener('mouseout', stopDrawing)

    return () => {
      canvas.removeEventListener('mousedown', startDrawing)
      canvas.removeEventListener('mousemove', draw)
      canvas.removeEventListener('mouseup', stopDrawing)
      canvas.removeEventListener('mouseout', stopDrawing)
    }
  }, [activeTool, toolPrefs, setSaveState, setCanUndo])

  // Get cursor style based on active tool
  const getCursorStyle = () => {
    switch (activeTool) {
      case 'draw':
        return 'crosshair'
      case 'highlighter':
        return 'crosshair'
      case 'text':
        return 'text'
      case 'erase':
        return 'grab'
      case 'select':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <section 
      className="w-full min-h-[500px] bg-white rounded-2xl shadow-lg border border-neutral-200 flex flex-col overflow-hidden canvas-container"
      role="main"
      aria-label="Drawing canvas"
      tabIndex={2}
    >
      {/* Canvas Header */}
      <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 rounded-t-2xl">
        <h2 className="text-sm font-medium text-text-main">My Canvas</h2>
        <p className="text-xs text-gray-500">
          React 19 Compatible • {activeTool} tool • {strokes.current.length} strokes
        </p>
      </div>
      
      {/* Canvas Content */}
      <div className="flex-1 relative min-h-[400px] p-4">
        <canvas
          ref={canvasRef}
          className="w-full h-full border border-gray-200 rounded bg-white"
          style={{ 
            cursor: getCursorStyle(),
            minHeight: '400px',
            touchAction: 'none' // Prevent scrolling on touch devices
          }}
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