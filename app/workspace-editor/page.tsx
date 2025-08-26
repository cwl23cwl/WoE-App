// app/workspace-editor/page.tsx - CRITICAL Fix for React 19 Infinite Loop
'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { ExcalidrawCanvasMinimal } from '@/components/workspace/ExcalidrawCanvasMinimal'
import { 
  MousePointer2, 
  Pen, 
  Highlighter, 
  Type, 
  Eraser, 
  Shapes,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Trash2
} from 'lucide-react'

interface Tool {
  id: string
  icon: React.ComponentType<any>
  label: string
  excalidrawType: string
}

const tools: Tool[] = [
  { id: 'select', icon: MousePointer2, label: 'Select', excalidrawType: 'selection' },
  { id: 'draw', icon: Pen, label: 'Draw', excalidrawType: 'freedraw' },
  { id: 'highlight', icon: Highlighter, label: 'Highlight', excalidrawType: 'freedraw' },
  { id: 'text', icon: Type, label: 'Text', excalidrawType: 'text' },
  { id: 'erase', icon: Eraser, label: 'Erase', excalidrawType: 'eraser' },
  { id: 'shapes', icon: Shapes, label: 'Shapes', excalidrawType: 'rectangle' }
]

export default function WorkspaceEditorPage() {
  const [activeTool, setActiveTool] = useState('draw')
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [isCanvasReady, setIsCanvasReady] = useState(false)
  
  const excalidrawAPIRef = useRef<any>(null)

  // Handle Excalidraw API with minimal state updates
  const handleExcalidrawAPI = useCallback((api: any) => {
    console.log('🎯 Workspace: API received:', !!api)
    
    if (api) {
      excalidrawAPIRef.current = api
      
      // Use setTimeout to prevent state update during mounting
      setTimeout(() => {
        setIsCanvasReady(true)
        console.log('✅ Workspace: Canvas ready')
      }, 100)
    }
  }, [])

  // Tool selection handler
  const handleToolSelect = useCallback((tool: Tool) => {
    console.log(`🔧 Selecting tool: ${tool.label}`)
    
    if (!excalidrawAPIRef.current) {
      console.warn('⚠️ API not ready')
      setActiveTool(tool.id)
      return
    }

    try {
      if (tool.id === 'highlight') {
        // Configure highlighter
        excalidrawAPIRef.current.updateScene({
          appState: {
            currentItemStrokeColor: strokeColor,
            currentItemStrokeWidth: Math.max(strokeWidth * 2, 8),
            currentItemOpacity: 30
          }
        })
        excalidrawAPIRef.current.setActiveTool({ type: 'freedraw' })
      } else {
        // Standard tool
        excalidrawAPIRef.current.updateScene({
          appState: {
            currentItemStrokeColor: strokeColor,
            currentItemStrokeWidth: strokeWidth,
            currentItemOpacity: 100
          }
        })
        excalidrawAPIRef.current.setActiveTool({ type: tool.excalidrawType })
      }
      
      setActiveTool(tool.id)
      console.log(`✅ Tool switched to: ${tool.label}`)
    } catch (error) {
      console.error('❌ Tool switch failed:', error)
    }
  }, [strokeColor, strokeWidth])

  // Color change handler
  const handleColorChange = useCallback((color: string) => {
    setStrokeColor(color)
    
    if (excalidrawAPIRef.current) {
      try {
        excalidrawAPIRef.current.updateScene({
          appState: { currentItemStrokeColor: color }
        })
      } catch (error) {
        console.error('❌ Color change failed:', error)
      }
    }
  }, [])

  // Stroke width handler
  const handleStrokeWidthChange = useCallback((width: number) => {
    setStrokeWidth(width)
    
    if (excalidrawAPIRef.current) {
      try {
        const finalWidth = activeTool === 'highlight' ? Math.max(width * 2, 8) : width
        excalidrawAPIRef.current.updateScene({
          appState: { currentItemStrokeWidth: finalWidth }
        })
      } catch (error) {
        console.error('❌ Stroke width change failed:', error)
      }
    }
  }, [activeTool])

  // Action handlers
  const handleUndo = useCallback(() => {
    if (excalidrawAPIRef.current) {
      try {
        excalidrawAPIRef.current.undo()
      } catch (error) {
        console.error('❌ Undo failed:', error)
      }
    }
  }, [])

  const handleRedo = useCallback(() => {
    if (excalidrawAPIRef.current) {
      try {
        excalidrawAPIRef.current.redo()
      } catch (error) {
        console.error('❌ Redo failed:', error)
      }
    }
  }, [])

  const handleZoomIn = useCallback(() => {
    if (excalidrawAPIRef.current) {
      try {
        const state = excalidrawAPIRef.current.getAppState()
        const currentZoom = state?.zoom?.value || 1
        excalidrawAPIRef.current.updateScene({
          appState: { zoom: { value: Math.min(currentZoom * 1.2, 3) } }
        })
      } catch (error) {
        console.error('❌ Zoom in failed:', error)
      }
    }
  }, [])

  const handleZoomOut = useCallback(() => {
    if (excalidrawAPIRef.current) {
      try {
        const state = excalidrawAPIRef.current.getAppState()
        const currentZoom = state?.zoom?.value || 1
        excalidrawAPIRef.current.updateScene({
          appState: { zoom: { value: Math.max(currentZoom * 0.8, 0.1) } }
        })
      } catch (error) {
        console.error('❌ Zoom out failed:', error)
      }
    }
  }, [])

  const handleClear = useCallback(() => {
    if (excalidrawAPIRef.current && window.confirm('Clear canvas?')) {
      try {
        excalidrawAPIRef.current.updateScene({
          elements: [],
          commitToHistory: true
        })
      } catch (error) {
        console.error('❌ Clear failed:', error)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simplified Header */}
      <div className="bg-white border-b p-4">
        <h1 className="text-xl font-bold text-gray-800">Workspace Editor</h1>
        <div className={`text-sm ${isCanvasReady ? 'text-green-600' : 'text-orange-600'}`}>
          {isCanvasReady ? '✅ Canvas Ready' : '⏳ Loading...'}
        </div>
      </div>

      {/* Minimal Toolbar */}
      <div className="bg-white border-b p-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          
          {/* Tools */}
          <div className="flex gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon
              const isActive = activeTool === tool.id
              
              return (
                <button
                  key={tool.id}
                  onClick={() => handleToolSelect(tool)}
                  disabled={!isCanvasReady}
                  className={`
                    flex flex-col items-center p-3 rounded-lg border transition-all
                    min-w-[60px] min-h-[60px]
                    ${isActive 
                      ? 'bg-blue-500 text-white border-blue-600' 
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                    }
                    ${!isCanvasReady ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                  `}
                  aria-label={tool.label}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{tool.label}</span>
                </button>
              )
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Color Picker */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Color:</span>
              <div className="flex gap-1">
                {['#000000', '#dc2626', '#2563eb', '#16a34a', '#ca8a04', '#9333ea'].map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`w-8 h-8 rounded border-2 ${
                      strokeColor === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select ${color} color`}
                  />
                ))}
              </div>
            </div>

            {/* Stroke Width */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Size:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={strokeWidth}
                onChange={(e) => handleStrokeWidthChange(parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-sm w-8">{strokeWidth}px</span>
            </div>

            {/* Actions */}
            <div className="flex gap-1">
              <button
                onClick={handleUndo}
                disabled={!isCanvasReady}
                className="p-2 rounded border hover:bg-gray-50 disabled:opacity-50"
                aria-label="Undo"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={!isCanvasReady}
                className="p-2 rounded border hover:bg-gray-50 disabled:opacity-50"
                aria-label="Redo"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                disabled={!isCanvasReady}
                className="p-2 rounded border hover:bg-gray-50 disabled:opacity-50"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomIn}
                disabled={!isCanvasReady}
                className="p-2 rounded border hover:bg-gray-50 disabled:opacity-50"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleClear}
                disabled={!isCanvasReady}
                className="p-2 rounded border bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                aria-label="Clear canvas"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="p-4">
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <ExcalidrawCanvasMinimal
            onExcalidrawAPI={handleExcalidrawAPI}
            width="100%"
            height="100%"
          />
        </div>
      </div>
    </div>
  )
}