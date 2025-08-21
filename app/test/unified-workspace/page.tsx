'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TopToolbar } from '@/components/workspace/TopToolbar'
import { ToolOptionsDrawer } from '@/components/workspace/ToolOptionsDrawer'
import { PageCanvas } from '@/components/workspace/PageCanvas'
import { FloatingPageIndicator } from '@/components/workspace/FloatingPageIndicator'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { useRouter } from 'next/navigation'

// Mock Canvas Component for demonstration
const MockCanvas = ({ 
  width, 
  height, 
  zoom, 
  activeTool, 
  toolPrefs, 
  pageData, 
  onChange 
}: any) => {
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawings, setDrawings] = useState<Array<{x: number, y: number, tool: string, color: string, size: number}>>([])
  const [currentStroke, setCurrentStroke] = useState<Array<{x: number, y: number}>>([])

  const handleMouseDown = (e: React.MouseEvent) => {
    onChange?.()
    setIsDrawing(true)
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    if (activeTool === 'draw' || activeTool === 'highlighter') {
      setCurrentStroke([{ x, y }])
    } else if (activeTool === 'text') {
      // Add a text marker
      setDrawings(prev => [...prev, { 
        x, 
        y, 
        tool: activeTool, 
        color: toolPrefs.textColor, 
        size: toolPrefs.textSize 
      }])
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return
    if (activeTool !== 'draw' && activeTool !== 'highlighter') return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setCurrentStroke(prev => [...prev, { x, y }])
  }

  const handleMouseUp = () => {
    if (isDrawing && currentStroke.length > 0) {
      // Convert stroke to drawing points
      const color = activeTool === 'draw' ? toolPrefs.drawColor : toolPrefs.highlighterColor
      const size = activeTool === 'draw' ? toolPrefs.drawSize : toolPrefs.highlighterSize
      
      currentStroke.forEach(point => {
        setDrawings(prev => [...prev, { 
          ...point, 
          tool: activeTool, 
          color, 
          size 
        }])
      })
      setCurrentStroke([])
    }
    setIsDrawing(false)
  }

  const getCursor = () => {
    switch (activeTool) {
      case 'draw':
      case 'highlighter':
        return 'crosshair'
      case 'text':
        return 'text'
      case 'erase':
        return 'pointer'
      default:
        return 'default'
    }
  }

  return (
    <div 
      className="w-full relative bg-white select-none"
      style={{ 
        height: Math.max(height, 1400),
        cursor: getCursor()
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={(e) => {
        const touch = e.touches[0]
        const rect = e.currentTarget.getBoundingClientRect()
        handleMouseDown({
          ...e,
          clientX: touch.clientX,
          clientY: touch.clientY,
          currentTarget: e.currentTarget
        } as any)
      }}
    >
      {/* Render all drawings */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {drawings.map((drawing, index) => {
          if (drawing.tool === 'draw') {
            return (
              <circle
                key={index}
                cx={drawing.x}
                cy={drawing.y}
                r={drawing.size / 2}
                fill={drawing.color}
                opacity={1}
              />
            )
          } else if (drawing.tool === 'highlighter') {
            return (
              <circle
                key={index}
                cx={drawing.x}
                cy={drawing.y}
                r={drawing.size / 2}
                fill={drawing.color}
                opacity={0.3}
              />
            )
          } else if (drawing.tool === 'text') {
            return (
              <text
                key={index}
                x={drawing.x}
                y={drawing.y}
                fill={drawing.color}
                fontSize={drawing.size}
                className="pointer-events-none"
              >
                Text
              </text>
            )
          }
          return null
        })}
        
        {/* Current stroke being drawn */}
        {currentStroke.map((point, index) => {
          const color = activeTool === 'draw' ? toolPrefs.drawColor : toolPrefs.highlighterColor
          const size = activeTool === 'draw' ? toolPrefs.drawSize : toolPrefs.highlighterSize
          const opacity = activeTool === 'highlighter' ? 0.3 : 1
          
          return (
            <circle
              key={`current-${index}`}
              cx={point.x}
              cy={point.y}
              r={size / 2}
              fill={color}
              opacity={opacity}
            />
          )
        })}
      </svg>

      {/* Header section with tool info */}
      <div className="absolute top-4 left-4 right-4 border-2 border-dashed border-gray-200 rounded-lg p-6 bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="text-lg font-semibold mb-2">Interactive Mock Canvas - Try Drawing!</div>
          <div className="text-sm space-y-1">
            <div>Active Tool: <span className="font-semibold capitalize">{activeTool}</span></div>
            <div>Canvas: {width} × {Math.max(height, 1400)} | Zoom: {Math.round(zoom * 100)}%</div>
            <div>Drawings: {drawings.length} marks</div>
            {activeTool === 'draw' && (
              <div>Draw: {toolPrefs.drawColor}, {toolPrefs.drawSize}px</div>
            )}
            {activeTool === 'highlighter' && (
              <div>Highlight: {toolPrefs.highlighterColor}, {toolPrefs.highlighterSize}px</div>
            )}
            {activeTool === 'text' && (
              <div>Text: {toolPrefs.textSize}px, {toolPrefs.textColor}</div>
            )}
            {activeTool === 'erase' && (
              <div>Eraser: {toolPrefs.eraserSize}px, {toolPrefs.eraserMode} mode</div>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Click and drag to draw • Select different tools and options from toolbar above
          </div>
        </div>
      </div>

      {/* Middle content area to show the length */}
      <div className="absolute top-32 left-4 right-4 bottom-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center space-y-8 bg-white">
        <div className="text-gray-400 text-center">
          <div className="text-6xl mb-4">📝</div>
          <div className="text-xl font-medium">Extended Canvas Area</div>
          <div className="text-sm mt-2">Scroll to see the full length</div>
        </div>
        
        {/* Some placeholder content sections */}
        <div className="flex flex-col space-y-16 w-full max-w-2xl px-8">
          <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Content Section 1</span>
          </div>
          <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Content Section 2</span>
          </div>
          <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Content Section 3</span>
          </div>
          <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Content Section 4</span>
          </div>
          <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Content Section 5</span>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="absolute bottom-4 left-4 right-4 border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="text-center text-gray-400 text-sm">
          End of extended canvas - Total height: {Math.max(height, 1400)}px
        </div>
      </div>
    </div>
  )
}

export default function UnifiedWorkspacePage() {
  const router = useRouter()
  const { 
    setPages, 
    setSaveState, 
    setCanUndo, 
    setCanRedo, 
    setDirty,
    pages,
    saveState,
    isDirty
  } = useWorkspaceStore()

  // Initialize with sample pages
  useEffect(() => {
    const samplePages = [
      { 
        id: '1', 
        scene: { elements: [], background: '#ffffff' }, 
        orientation: 'portrait' as const 
      },
      { 
        id: '2', 
        scene: { elements: [], background: '#ffffff' }, 
        orientation: 'portrait' as const 
      },
      { 
        id: '3', 
        scene: { elements: [], background: '#ffffff' }, 
        orientation: 'landscape' as const 
      },
    ]
    
    setPages(samplePages)
    
    // Simulate undo/redo availability
    setCanUndo(true)
    setCanRedo(false)
  }, [setPages, setCanUndo, setCanRedo])

  // Mock handlers
  const handleUndo = () => {
    console.log('Undo action')
    setCanRedo(true)
    // In real implementation, this would undo the last action
  }

  const handleRedo = () => {
    console.log('Redo action')
    setCanUndo(true)
    // In real implementation, this would redo the last undone action
  }

  const handleLibraryOpen = () => {
    console.log('Library opened')
  }

  const handleCanvasChange = (isDirty: boolean) => {
    if (isDirty) {
      setSaveState('unsaved')
      
      // Simulate auto-save after delay
      setTimeout(() => {
        setSaveState('saving')
        setTimeout(() => {
          setSaveState('saved')
        }, 1500)
      }, 500)
    }
  }

  const simulateError = () => {
    setSaveState('error')
    setTimeout(() => {
      setSaveState('saved')
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Import workspace styles */}
      <style jsx global>{`
        @import url('/styles/workspace.css');
      `}</style>

      {/* Top Toolbar */}
      <TopToolbar
        onUndo={handleUndo}
        onRedo={handleRedo}
        onLibraryOpen={handleLibraryOpen}
      />

      {/* Tool Options Drawer */}
      <ToolOptionsDrawer />

      {/* Main Content Area */}
      <div className="relative">
        {/* Page Canvas */}
        <PageCanvas
          onDirtyChange={handleCanvasChange}
          canvasComponent={MockCanvas}
          showMargins={true}
          className="min-h-[calc(100vh-80px)]"
        />

        {/* Floating Page Indicator */}
        <FloatingPageIndicator />
      </div>

      {/* Development Controls */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        <Card className="p-4 bg-white/95 backdrop-blur-sm">
          <div className="space-y-2">
            <div className="text-sm font-semibold">Dev Controls</div>
            
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSaveState('saving')}
              >
                Test Saving
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={simulateError}
              >
                Test Error
              </Button>
            </div>
            
            <div className="text-xs text-gray-600">
              <div>Pages: {pages.length}</div>
              <div>Save: {saveState}</div>
              <div>Dirty: {isDirty ? 'Yes' : 'No'}</div>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.back()}
              className="w-full"
            >
              Back to Tests
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}