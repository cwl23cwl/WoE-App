'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageIndicator } from './PageIndicator'
import { ColorSwatches } from './ColorSwatches'
import { useWorkspaceStore } from '@/stores/workspace'
import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Undo, Redo, MousePointer, Pencil, Type, Eraser, Minus, Plus, Highlighter } from 'lucide-react'

interface WorkspaceTopbarProps {
  onBack?: () => void
  excalidrawRef?: React.RefObject<any>
  className?: string
}

export function WorkspaceTopbar({ 
  onBack,
  excalidrawRef,
  className = ''
}: WorkspaceTopbarProps) {
  const { 
    tool, 
    setTool, 
    zoom, 
    setZoom, 
    pages, 
    pageIndex, 
    jumpTo,
    saveState 
  } = useWorkspaceStore()

  // Handle undo/redo with Excalidraw API
  const handleUndo = useCallback(() => {
    if (excalidrawRef?.current) {
      try {
        excalidrawRef.current.history.undo()
        console.log('↩️ Undo executed')
      } catch (error) {
        console.error('❌ Undo failed:', error)
      }
    }
  }, [excalidrawRef])

  const handleRedo = useCallback(() => {
    if (excalidrawRef?.current) {
      try {
        excalidrawRef.current.history.redo()
        console.log('↪️ Redo executed')
      } catch (error) {
        console.error('❌ Redo failed:', error)
      }
    }
  }, [excalidrawRef])

  // Check if undo/redo is available
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  
  useEffect(() => {
    if (excalidrawRef?.current) {
      const checkHistory = () => {
        try {
          const history = excalidrawRef.current?.history
          if (history) {
            setCanUndo(history.canUndo())
            setCanRedo(history.canRedo())
          }
        } catch (error) {
          // Silently fail - history might not be available yet
        }
      }
      
      // Check initially and set up interval
      checkHistory()
      const interval = setInterval(checkHistory, 500)
      
      return () => clearInterval(interval)
    }
  }, [excalidrawRef])

  const tools = [
    { id: 'select' as const, label: 'Select', icon: MousePointer },
    { id: 'pencil' as const, label: 'Draw', icon: Pencil },
    { id: 'highlighter' as const, label: 'Highlight', icon: Highlighter },
    { id: 'text' as const, label: 'Write', icon: Type },
    { id: 'eraser' as const, label: 'Erase', icon: Eraser },
  ]

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.5))
  }

  const getSaveStateDisplay = () => {
    switch (saveState) {
      case 'saving':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
            Saving...
          </Badge>
        )
      case 'saved':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
            ✓ Saved
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="error" className="bg-red-100 text-red-700 border-red-200">
            ⚠ Error
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className={`bg-white border-b border-gray-200 px-4 py-3 ${className}`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Section - Back & History */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleUndo}
            disabled={!canUndo}
            className="p-2"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRedo}
            disabled={!canRedo}
            className="p-2"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>

        {/* Center Section - Tools & Colors */}
        <div className="flex items-center space-x-4">
          {/* Drawing Tools */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {tools.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={tool === id ? "primary" : "ghost"}
                size="sm"
                onClick={() => setTool(id)}
                className={`
                  flex flex-col items-center space-y-1 min-w-[60px] h-12
                  ${tool === id ? 'bg-white shadow-sm' : 'hover:bg-white/50'}
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{label}</span>
              </Button>
            ))}
          </div>

          {/* Color Swatches - Show based on current tool */}
          <div className="flex items-center space-x-2">
            {tool === 'pencil' && (
              <ColorSwatches mode="pen" />
            )}
            {tool === 'highlighter' && (
              <ColorSwatches mode="highlighter" />
            )}
            {tool === 'text' && (
              <ColorSwatches mode="text" />
            )}
          </div>
        </div>

        {/* Right Section - Zoom, Pages, Save */}
        <div className="flex items-center space-x-3">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="p-2"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleZoomIn}
              disabled={zoom >= 2}
              className="p-2"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Page Navigation */}
          <PageIndicator 
            index={pageIndex}
            count={pages.length}
            onJumpTo={jumpTo}
          />

          {/* Save State */}
          {getSaveStateDisplay()}
        </div>
      </div>
    </div>
  )
}
