'use client'

import { useCallback, useEffect, useRef } from 'react'
import { 
  MousePointer2, 
  Pen, 
  Highlighter, 
  Type, 
  Eraser,
  Shapes,
  Palette,
  Plus,
  Minus,
  Undo2,
  Redo2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  AlertCircle,
  BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkspaceStore, ZOOM_PRESETS, ZoomPreset } from '@/stores/useWorkspaceStore'
import { cn } from '@/lib/utils'

interface TopToolbarProps {
  className?: string
  onUndo?: () => void
  onRedo?: () => void
  onLibraryOpen?: () => void
}

export function TopToolbar({
  className,
  onUndo,
  onRedo,
  onLibraryOpen
}: TopToolbarProps) {
  const {
    activeTool,
    setActiveTool,
    activeDrawer,
    toggleDrawer,
    setActiveDrawer,
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    pages,
    currentPageIndex,
    nextPage,
    prevPage,
    saveState,
    canUndo,
    canRedo,
    toolPrefs
  } = useWorkspaceStore()

  const toolbarRef = useRef<HTMLDivElement>(null)

  // Tool definitions
  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Select', hasOptions: false },
    { id: 'draw', icon: Pen, label: 'Draw', hasOptions: true },
    { id: 'highlighter', icon: Highlighter, label: 'Highlight', hasOptions: true },
    { id: 'text', icon: Type, label: 'Text', hasOptions: true },
    { id: 'erase', icon: Eraser, label: 'Erase', hasOptions: true },
    { id: 'shapes', icon: Shapes, label: 'Shapes', hasOptions: true },
  ] as const

  // Get current tool color for color picker display
  const getCurrentToolColor = () => {
    switch (activeTool) {
      case 'draw':
        return toolPrefs.drawColor
      case 'highlighter':
        return toolPrefs.highlighterColor
      case 'text':
        return toolPrefs.textColor
      default:
        return '#000000'
    }
  }

  // Get current tool size for size display
  const getCurrentToolSize = () => {
    switch (activeTool) {
      case 'draw':
        return toolPrefs.drawSize
      case 'highlighter':
        return toolPrefs.highlighterSize
      case 'erase':
        return toolPrefs.eraserSize
      default:
        return 4
    }
  }

  // Handle tool selection
  const handleToolSelect = useCallback((toolId: string) => {
    setActiveTool(toolId as any)
    
    // Toggle drawer for tools with options
    const tool = tools.find(t => t.id === toolId)
    if (tool?.hasOptions) {
      toggleDrawer(toolId)
    } else {
      setActiveDrawer(null)
    }
  }, [setActiveTool, toggleDrawer, setActiveDrawer, tools])

  // Handle size adjustment
  const handleSizeChange = useCallback((delta: number) => {
    const currentSize = getCurrentToolSize()
    let newSize = currentSize + delta
    
    // Size limits based on tool
    switch (activeTool) {
      case 'draw':
        newSize = Math.max(1, Math.min(24, newSize))
        break
      case 'highlighter':
        newSize = Math.max(4, Math.min(32, newSize))
        break
      case 'erase':
        newSize = Math.max(2, Math.min(50, newSize))
        break
    }
    
    // Update store based on active tool
    if (activeTool === 'draw') {
      useWorkspaceStore.getState().updateToolPref('drawSize', newSize)
    } else if (activeTool === 'highlighter') {
      useWorkspaceStore.getState().updateToolPref('highlighterSize', newSize)
    } else if (activeTool === 'erase') {
      useWorkspaceStore.getState().updateToolPref('eraserSize', newSize)
    }
  }, [activeTool, getCurrentToolSize])

  // Handle zoom from dropdown
  const handleZoomSelect = useCallback((zoomValue: number) => {
    setZoom(zoomValue)
  }, [setZoom])

  // Format zoom percentage
  const formatZoom = (value: number) => `${Math.round(value * 100)}%`

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Close drawer on Escape
      if (e.key === 'Escape') {
        setActiveDrawer(null)
        return
      }

      // Tool shortcuts
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
            handleToolSelect('select')
            break
          case 'p':
            handleToolSelect('draw')
            break
          case 'h':
            handleToolSelect('highlighter')
            break
          case 't':
            handleToolSelect('text')
            break
          case 'e':
            handleToolSelect('erase')
            break
          case 's':
            if (!e.shiftKey) {
              handleToolSelect('shapes')
            }
            break
        }
      }

      // Zoom shortcuts
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault()
          zoomIn()
        } else if (e.key === '-') {
          e.preventDefault()
          zoomOut()
        } else if (e.key === '0') {
          e.preventDefault()
          setZoom(1.0)
        }
      }

      // Undo/Redo shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          onRedo?.()
        } else {
          onUndo?.()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleToolSelect, zoomIn, zoomOut, setZoom, setActiveDrawer, onUndo, onRedo])

  // Save state indicator
  const SaveStateIndicator = () => {
    switch (saveState) {
      case 'saving':
        return (
          <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-sm font-medium">Saving...</span>
          </div>
        )
      case 'saved':
        return (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <Check className="w-3 h-3" />
            <span className="text-sm font-medium">Saved</span>
          </div>
        )
      case 'unsaved':
        return (
          <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-amber-600 rounded-full" />
            <span className="text-sm font-medium">Unsaved</span>
          </div>
        )
      case 'error':
        return (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
            <AlertCircle className="w-3 h-3" />
            <span className="text-sm font-medium">Error</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div 
      ref={toolbarRef}
      className={cn(
        "sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b shadow-sm",
        className
      )}
    >
      <div className="max-w-screen-xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between space-x-6">
          
          {/* Left Group: Tools, Color, Size */}
          <div className="flex items-center space-x-2">
            {/* Tool Buttons */}
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolSelect(tool.id)}
                className={cn(
                  "relative p-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  "min-w-[48px] min-h-[48px] flex flex-col items-center justify-center",
                  activeTool === tool.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
                aria-label={`${tool.label} tool`}
                aria-pressed={activeTool === tool.id}
                title={`${tool.label} (${tool.id.charAt(0).toUpperCase()})`}
              >
                <tool.icon className="w-5 h-5" />
                <span className="text-xs mt-0.5">{tool.label}</span>
                
                {/* Drawer indicator */}
                {tool.hasOptions && activeDrawer === tool.id && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}

            {/* Divider */}
            <div className="h-8 w-px bg-gray-200 mx-2" />

            {/* Color Picker */}
            <button
              onClick={() => toggleDrawer('color')}
              className={cn(
                "p-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "min-w-[48px] min-h-[48px] flex flex-col items-center justify-center",
                "bg-gray-50 hover:bg-gray-100 text-gray-700"
              )}
              aria-label="Color picker"
              title="Color"
            >
              <div className="relative">
                <Palette className="w-5 h-5" />
                <div 
                  className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                  style={{ backgroundColor: getCurrentToolColor() }}
                />
              </div>
              <span className="text-xs mt-0.5">Color</span>
            </button>

            {/* Size Controls */}
            <div className="flex items-center bg-gray-50 rounded-xl">
              <button
                onClick={() => handleSizeChange(-1)}
                className="p-2 hover:bg-gray-100 rounded-l-xl transition-colors"
                aria-label="Decrease size"
                title="Decrease size"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="px-3 py-2 min-w-[40px] text-center text-sm font-medium">
                {getCurrentToolSize()}
              </div>
              <button
                onClick={() => handleSizeChange(1)}
                className="p-2 hover:bg-gray-100 rounded-r-xl transition-colors"
                aria-label="Increase size"
                title="Increase size"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Group: Zoom, Undo, Redo */}
          <div className="flex items-center space-x-2">
            {/* Zoom Dropdown */}
            <div className="relative">
              <select
                value={zoom}
                onChange={(e) => handleZoomSelect(Number(e.target.value))}
                className="appearance-none bg-gray-50 hover:bg-gray-100 px-4 py-2 pr-8 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                aria-label="Zoom level"
              >
                {ZOOM_PRESETS.map((preset) => (
                  <option key={preset} value={preset}>
                    {formatZoom(preset)}
                  </option>
                ))}
                {!ZOOM_PRESETS.includes(zoom as ZoomPreset) && (
                  <option value={zoom}>{formatZoom(zoom)}</option>
                )}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Undo */}
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={cn(
                "p-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "min-w-[48px] min-h-[48px] flex items-center justify-center",
                canUndo
                  ? "bg-gray-50 hover:bg-gray-100 text-gray-700"
                  : "bg-gray-25 text-gray-300 cursor-not-allowed"
              )}
              aria-label="Undo"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-5 h-5" />
            </button>

            {/* Redo */}
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={cn(
                "p-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "min-w-[48px] min-h-[48px] flex items-center justify-center",
                canRedo
                  ? "bg-gray-50 hover:bg-gray-100 text-gray-700"
                  : "bg-gray-25 text-gray-300 cursor-not-allowed"
              )}
              aria-label="Redo"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 className="w-5 h-5" />
            </button>
          </div>

          {/* Right Group: Page Navigation, Save Status, Library */}
          <div className="flex items-center space-x-4">
            {/* Page Navigation */}
            {pages.length > 1 && (
              <div className="flex items-center bg-gray-50 rounded-xl">
                <button
                  onClick={prevPage}
                  disabled={currentPageIndex === 0}
                  className={cn(
                    "p-2 rounded-l-xl transition-colors",
                    currentPageIndex === 0
                      ? "text-gray-300 cursor-not-allowed"
                      : "hover:bg-gray-100 text-gray-700"
                  )}
                  aria-label="Previous page"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-3 py-2 text-sm font-medium min-w-[60px] text-center">
                  {currentPageIndex + 1} / {pages.length}
                </div>
                <button
                  onClick={nextPage}
                  disabled={currentPageIndex === pages.length - 1}
                  className={cn(
                    "p-2 rounded-r-xl transition-colors",
                    currentPageIndex === pages.length - 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "hover:bg-gray-100 text-gray-700"
                  )}
                  aria-label="Next page"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Save Status */}
            <SaveStateIndicator />

            {/* Library Button (optional) */}
            {onLibraryOpen && (
              <button
                onClick={onLibraryOpen}
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-[48px] min-h-[48px] flex items-center justify-center"
                aria-label="Open library"
                title="Library"
              >
                <BookOpen className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}