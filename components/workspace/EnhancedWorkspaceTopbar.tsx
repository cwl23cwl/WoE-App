'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageIndicator } from './PageIndicator'
import { ModernToolbar } from './ModernToolbar'
import { useWorkspaceStore } from '@/stores/workspace'
import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Minus, Plus } from 'lucide-react'

interface EnhancedWorkspaceTopbarProps {
  onBack?: () => void
  excalidrawRef?: React.RefObject<any>
  className?: string
}

export function EnhancedWorkspaceTopbar({ 
  onBack,
  excalidrawRef,
  className = ''
}: EnhancedWorkspaceTopbarProps) {
  const { 
    zoom, 
    setZoom, 
    pages, 
    pageIndex, 
    jumpTo,
    saveState,
    role 
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
          <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
            ⚠ Error
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className={`bg-gray-50/80 backdrop-blur-sm border-b border-gray-200 ${className}`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 py-2">
        {/* Left Section - Back Button */}
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
        </div>

        {/* Center Section - Modern Toolbar */}
        <div className="flex-1 flex justify-center max-w-4xl mx-8">
          <ModernToolbar
            excalidrawRef={excalidrawRef}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            placement="top"
            isTeacher={role === "TEACHER"}
            className="shadow-sm border-gray-200/50"
          />
        </div>

        {/* Right Section - Zoom, Pages, Save */}
        <div className="flex items-center space-x-3">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-white/80 rounded-xl border border-gray-200 p-1 shadow-sm">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="p-2 h-8 w-8"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-xs font-medium min-w-[40px] text-center text-gray-600">
              {Math.round(zoom * 100)}%
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleZoomIn}
              disabled={zoom >= 2}
              className="p-2 h-8 w-8"
            >
              <Plus className="w-3 h-3" />
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