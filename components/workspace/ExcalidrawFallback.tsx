'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

interface ExcalidrawFallbackProps {
  className?: string
}

export function ExcalidrawFallback({ className = '' }: ExcalidrawFallbackProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null)
  
  const { activeTool, toolPrefs } = useWorkspaceStore()

  // Basic drawing functionality as fallback
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'draw') return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setIsDrawing(true)
    setLastPoint({ x, y })
  }, [activeTool])

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool !== 'draw') return
    
    const canvas = canvasRef.current
    if (!canvas || !lastPoint) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    ctx.beginPath()
    ctx.moveTo(lastPoint.x, lastPoint.y)
    ctx.lineTo(x, y)
    ctx.strokeStyle = toolPrefs.drawColor
    ctx.lineWidth = toolPrefs.drawSize
    ctx.lineCap = 'round'
    ctx.stroke()
    
    setLastPoint({ x, y })
  }, [isDrawing, activeTool, lastPoint, toolPrefs.drawColor, toolPrefs.drawSize])

  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
    setLastPoint(null)
  }, [])

  // Add text functionality
  const addText = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'text') return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const text = prompt('Enter text:')
    if (text) {
      ctx.font = `${toolPrefs.textSize}px ${toolPrefs.textFamily}`
      ctx.fillStyle = toolPrefs.textColor
      ctx.fillText(text, x, y)
    }
  }, [activeTool, toolPrefs.textSize, toolPrefs.textFamily, toolPrefs.textColor])

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    
    // Clear canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'text') {
      addText(e)
    }
  }, [activeTool, addText])

  return (
    <div className={`w-full h-full ${className} relative`} style={{ minHeight: '600px' }}>
      <div className="absolute top-4 left-4 bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded-md shadow-md max-w-md">
        <div className="flex items-center">
          <div className="text-yellow-600 mr-2">⚠️</div>
          <div>
            <p className="text-sm font-medium text-yellow-800">Fallback Canvas Active</p>
            <p className="text-xs text-yellow-700 mt-1">
              The main canvas failed to load. This basic canvas supports drawing and text.
            </p>
          </div>
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        className="w-full h-full border border-gray-200 rounded-lg cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onClick={handleCanvasClick}
        style={{ 
          cursor: activeTool === 'text' ? 'text' : activeTool === 'draw' ? 'crosshair' : 'default'
        }}
      />
    </div>
  )
}