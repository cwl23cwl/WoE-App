'use client'

import React, { useRef, useEffect } from 'react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

export function SimpleCanvasShell() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  
  const { 
    activeTool,
    toolPrefs,
    setExcalidrawAPI
  } = useWorkspaceStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set up canvas
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Create a simple API-like object for the store
    const simpleAPI = {
      setActiveTool: (tool: any) => {
        console.log('🎯 Simple canvas tool set to:', tool.type)
      },
      updateScene: (scene: any) => {
        if (scene.elements && scene.elements.length === 0) {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          console.log('✅ Canvas cleared')
        }
      },
      history: {
        undo: () => console.log('⬅️ Undo (simple implementation)'),
        redo: () => console.log('➡️ Redo (simple implementation)')
      }
    }
    
    setExcalidrawAPI(simpleAPI)

    const startDrawing = (e: MouseEvent) => {
      if (activeTool !== 'draw' && activeTool !== 'highlighter') return
      
      isDrawing.current = true
      const rect = canvas.getBoundingClientRect()
      lastPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }

    const draw = (e: MouseEvent) => {
      if (!isDrawing.current) return
      
      const rect = canvas.getBoundingClientRect()
      const currentPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }

      ctx.beginPath()
      ctx.moveTo(lastPos.current.x, lastPos.current.y)
      ctx.lineTo(currentPos.x, currentPos.y)
      
      // Apply tool settings
      if (activeTool === 'draw') {
        ctx.strokeStyle = toolPrefs.drawColor
        ctx.lineWidth = toolPrefs.drawSize
        ctx.globalAlpha = toolPrefs.drawOpacity
      } else if (activeTool === 'highlighter') {
        ctx.strokeStyle = toolPrefs.highlighterColor
        ctx.lineWidth = toolPrefs.highlighterSize
        ctx.globalAlpha = toolPrefs.highlighterOpacity
      }
      
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()

      lastPos.current = currentPos
    }

    const stopDrawing = () => {
      isDrawing.current = false
      ctx.globalAlpha = 1 // Reset alpha
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
  }, [activeTool, toolPrefs, setExcalidrawAPI])

  // Update cursor based on active tool
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
        <h2 className="text-sm font-medium text-text-main">My Canvas (Simple Version)</h2>
        <p className="text-xs text-gray-500">React 19 compatible - {activeTool} tool active</p>
      </div>
      
      {/* Canvas Content */}
      <div className="flex-1 relative min-h-[400px] p-4">
        <canvas
          ref={canvasRef}
          className="w-full h-full border border-gray-200 rounded"
          style={{ 
            cursor: getCursorStyle(),
            minHeight: '400px'
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