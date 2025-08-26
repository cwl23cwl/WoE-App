// components/workspace/TopToolbar.tsx - Enhanced with Excalidraw API Integration
'use client'

import React, { useCallback } from 'react'
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
  Trash2,
  Save,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

interface TopToolbarProps {
  onUndo?: () => void
  onRedo?: () => void
  onLibraryOpen?: () => void
}

interface Tool {
  id: 'select' | 'draw' | 'highlighter' | 'text' | 'erase' | 'shapes'
  icon: React.ComponentType<any>
  label: string
  color: string
  excalidrawType: string
  description: string
}

const tools: Tool[] = [
  { 
    id: 'select', 
    icon: MousePointer2, 
    label: 'Select', 
    color: 'text-blue-600',
    excalidrawType: 'selection',
    description: 'Select and move objects'
  },
  { 
    id: 'draw', 
    icon: Pen, 
    label: 'Draw', 
    color: 'text-gray-700',
    excalidrawType: 'freedraw', 
    description: 'Draw with pencil'
  },
  { 
    id: 'highlighter', 
    icon: Highlighter, 
    label: 'Highlight', 
    color: 'text-yellow-600',
    excalidrawType: 'freedraw',
    description: 'Highlight important parts'
  },
  { 
    id: 'text', 
    icon: Type, 
    label: 'Text', 
    color: 'text-green-600',
    excalidrawType: 'text',
    description: 'Add text'
  },
  { 
    id: 'erase', 
    icon: Eraser, 
    label: 'Erase', 
    color: 'text-red-600',
    excalidrawType: 'eraser',
    description: 'Remove drawings'
  },
  { 
    id: 'shapes', 
    icon: Shapes, 
    label: 'Shapes', 
    color: 'text-purple-600',
    excalidrawType: 'rectangle',
    description: 'Draw shapes'
  }
]

export function TopToolbar({ onUndo, onRedo, onLibraryOpen }: TopToolbarProps) {
  const {
    // Current state
    activeTool,
    setActiveTool,
    zoom,
    setZoom,
    pages,
    currentPageIndex,
    setCurrentPageIndex,
    saveState,
    canUndo,
    canRedo,
    excalidrawAPI,
    
    // Tool preferences
    toolPrefs,
    updateToolPref,
    
    // Actions
    clearCanvas: clearCanvasStore,
    undo: undoStore,
    redo: redoStore,
    zoomIn: zoomInStore,
    zoomOut: zoomOutStore,
    toggleDrawer,
    resetTextTool
  } = useWorkspaceStore()

  // Tool selection with Excalidraw API integration
  const handleToolSelect = useCallback((tool: Tool) => {
    console.log(`🔧 TopToolbar: Selecting ${tool.label} tool`)
    
    if (!excalidrawAPI) {
      console.warn('⚠️ TopToolbar: Excalidraw API not available')
      setActiveTool(tool.id)
      return
    }

    try {
      // Handle special tool configurations
      if (tool.id === 'highlighter') {
        console.log('🖊️ Configuring highlighter mode')
        
        // Configure highlighter with transparency and increased width
        excalidrawAPI.updateScene({
          appState: {
            currentItemStrokeColor: toolPrefs.highlighter.color,
            currentItemBackgroundColor: 'transparent',
            currentItemStrokeWidth: Math.max(toolPrefs.highlighter.size * 1.5, 8),
            currentItemOpacity: 30, // 30% opacity for highlighting
            currentItemRoughness: 0, // Smooth for clean highlighting
            currentItemStrokeStyle: 'solid'
          }
        })
        
        // Use freedraw tool for highlighting
        excalidrawAPI.setActiveTool({ type: 'freedraw' })
        
      } else if (tool.id === 'text') {
        console.log('📝 Configuring text tool')
        
        // Configure text tool with current preferences
        excalidrawAPI.updateScene({
          appState: {
            currentItemFontFamily: toolPrefs.text.fontFamily,
            currentItemFontSize: toolPrefs.text.fontSize,
            currentItemStrokeColor: toolPrefs.text.color,
            currentItemTextAlign: toolPrefs.text.align,
            currentItemOpacity: 100
          }
        })
        
        excalidrawAPI.setActiveTool({ type: 'text' })
        
      } else if (tool.id === 'draw') {
        console.log('✏️ Configuring draw tool')
        
        // Configure standard drawing
        excalidrawAPI.updateScene({
          appState: {
            currentItemStrokeColor: toolPrefs.draw.color,
            currentItemStrokeWidth: toolPrefs.draw.size,
            currentItemOpacity: Math.round(toolPrefs.draw.opacity * 100),
            currentItemRoughness: toolPrefs.draw.roughness,
            currentItemStrokeStyle: 'solid'
          }
        })
        
        excalidrawAPI.setActiveTool({ type: 'freedraw' })
        
      } else {
        console.log(`🔧 Configuring ${tool.label} tool`)
        
        // Standard tool configuration
        excalidrawAPI.updateScene({
          appState: {
            currentItemStrokeColor: toolPrefs.draw.color,
            currentItemStrokeWidth: toolPrefs.draw.size,
            currentItemOpacity: 100,
            currentItemRoughness: 1
          }
        })
        
        excalidrawAPI.setActiveTool({ type: tool.excalidrawType })
      }

      // Update store state
      setActiveTool(tool.id)
      console.log(`✅ TopToolbar: ${tool.label} tool configured successfully`)
      
    } catch (error) {
      console.error(`❌ TopToolbar: Failed to configure ${tool.label} tool:`, error)
      // Fallback to store-only update
      setActiveTool(tool.id)
    }
  }, [excalidrawAPI, toolPrefs, setActiveTool])

  // Handle tool button click (includes drawer toggle for active tool)
  const handleToolClick = useCallback((tool: Tool) => {
    if (activeTool === tool.id) {
      // Clicking active tool toggles its drawer
      if (tool.id === 'text') {
        toggleDrawer('text')
        resetTextTool() // Reset text tool for new text creation
      } else if (tool.id === 'draw') {
        toggleDrawer('draw')
      } else if (tool.id === 'highlighter') {
        toggleDrawer('highlight')
      }
    } else {
      // Switch to new tool
      handleToolSelect(tool)
    }
  }, [activeTool, toggleDrawer, resetTextTool, handleToolSelect])

  // Undo with API integration
  const handleUndo = useCallback(() => {
    console.log('↶ TopToolbar: Undo action')
    
    if (excalidrawAPI) {
      try {
        excalidrawAPI.undo()
        console.log('✅ TopToolbar: Excalidraw undo executed')
      } catch (error) {
        console.error('❌ TopToolbar: Excalidraw undo failed:', error)
      }
    }
    
    // Also call store undo and any external handler
    undoStore()
    onUndo?.()
  }, [excalidrawAPI, undoStore, onUndo])

  // Redo with API integration
  const handleRedo = useCallback(() => {
    console.log('↷ TopToolbar: Redo action')
    
    if (excalidrawAPI) {
      try {
        excalidrawAPI.redo()
        console.log('✅ TopToolbar: Excalidraw redo executed')
      } catch (error) {
        console.error('❌ TopToolbar: Excalidraw redo failed:', error)
      }
    }
    
    // Also call store redo and any external handler  
    redoStore()
    onRedo?.()
  }, [excalidrawAPI, redoStore, onRedo])

  // Zoom with API integration
  const handleZoomIn = useCallback(() => {
    console.log('🔍 TopToolbar: Zoom in')
    
    if (excalidrawAPI) {
      try {
        const currentAppState = excalidrawAPI.getAppState()
        const currentZoom = currentAppState?.zoom?.value || 1
        const newZoom = Math.min(currentZoom * 1.25, 5) // Max 500%
        
        excalidrawAPI.updateScene({
          appState: { zoom: { value: newZoom } }
        })
        
        console.log(`✅ TopToolbar: Zoomed in to ${Math.round(newZoom * 100)}%`)
      } catch (error) {
        console.error('❌ TopToolbar: Zoom in failed:', error)
      }
    }
    
    zoomInStore()
  }, [excalidrawAPI, zoomInStore])

  const handleZoomOut = useCallback(() => {
    console.log('🔍 TopToolbar: Zoom out')
    
    if (excalidrawAPI) {
      try {
        const currentAppState = excalidrawAPI.getAppState()
        const currentZoom = currentAppState?.zoom?.value || 1
        const newZoom = Math.max(currentZoom * 0.8, 0.1) // Min 10%
        
        excalidrawAPI.updateScene({
          appState: { zoom: { value: newZoom } }
        })
        
        console.log(`✅ TopToolbar: Zoomed out to ${Math.round(newZoom * 100)}%`)
      } catch (error) {
        console.error('❌ TopToolbar: Zoom out failed:', error)
      }
    }
    
    zoomOutStore()
  }, [excalidrawAPI, zoomOutStore])

  // Clear canvas with API integration
  const handleClearCanvas = useCallback(() => {
    if (!window.confirm('Clear all drawings? This cannot be undone.')) {
      return
    }
    
    console.log('🗑️ TopToolbar: Clearing canvas')
    
    if (excalidrawAPI) {
      try {
        excalidrawAPI.updateScene({
          elements: [],
          commitToHistory: true
        })
        console.log('✅ TopToolbar: Canvas cleared via API')
      } catch (error) {
        console.error('❌ TopToolbar: API clear failed:', error)
      }
    }
    
    clearCanvasStore()
  }, [excalidrawAPI, clearCanvasStore])

  // Page navigation
  const handlePrevPage = useCallback(() => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1)
    }
  }, [currentPageIndex, setCurrentPageIndex])

  const handleNextPage = useCallback(() => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1)
    }
  }, [currentPageIndex, pages.length, setCurrentPageIndex])

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-40" data-toolbar="true">
      <div className="flex items-center justify-between px-4 py-2 max-w-7xl mx-auto">
        
        {/* Left Section: Undo/Redo */}
        <div className="flex items-center gap-1" role="group" aria-label="History actions">
          <button 
            className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary ${
              canUndo ? 'hover:bg-neutral-50' : 'opacity-50 cursor-not-allowed'
            }`}
            aria-label="Undo last action"
            disabled={!canUndo}
            onClick={handleUndo}
          >
            <RotateCcw className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
          </button>
          <button 
            className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary ${
              canRedo ? 'hover:bg-neutral-50' : 'opacity-50 cursor-not-allowed'
            }`}
            aria-label="Redo last action"
            disabled={!canRedo}
            onClick={handleRedo}
          >
            <RotateCw className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>

        {/* Center Section: Main Tools */}
        <div className="flex gap-1 sm:gap-2" role="group" aria-label="Drawing tools">
          {tools.map((tool, index) => {
            const Icon = tool.icon
            const isActive = activeTool === tool.id
            
            return (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                className={`flex flex-col items-center px-2 sm:px-3 py-2 text-xs rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                  isActive 
                    ? 'bg-brand-primary text-white shadow-sm' 
                    : `${tool.color} hover:bg-neutral-50`
                }`}
                aria-label={tool.description}
                aria-pressed={isActive}
                tabIndex={3 + index}
                title={tool.description}
              >
                <Icon className="w-5 h-5 mb-1" strokeWidth={2.5} aria-hidden="true" />
                <span>{tool.label}</span>
              </button>
            )
          })}
        </div>

        {/* Right Section: Zoom, Pages, Actions */}
        <div className="flex items-center gap-3">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1" role="group" aria-label="Zoom controls">
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-md hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
            </button>
            
            <span className="text-sm font-medium text-gray-600 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-md hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>

          {/* Page Navigation */}
          {pages.length > 1 && (
            <div className="flex items-center gap-2" role="group" aria-label="Page navigation">
              <button
                onClick={handlePrevPage}
                disabled={currentPageIndex === 0}
                className={`p-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                  currentPageIndex === 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-neutral-50'
                }`}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
              </button>
              
              <span className="text-sm font-medium text-gray-600">
                Page {currentPageIndex + 1} of {pages.length}
              </span>
              
              <button
                onClick={handleNextPage}
                disabled={currentPageIndex === pages.length - 1}
                className={`p-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                  currentPageIndex === pages.length - 1 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-neutral-50'
                }`}
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          )}

          {/* Save Status */}
          <div className={`
            flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium
            ${saveState === 'saved' ? 'text-green-700 bg-green-50' :
              saveState === 'saving' ? 'text-blue-700 bg-blue-50' :
              saveState === 'unsaved' ? 'text-yellow-700 bg-yellow-50' :
              'text-red-700 bg-red-50'
            }
          `}>
            <Save className="w-3 h-3" />
            <span>
              {saveState === 'saved' && 'Saved'}
              {saveState === 'saving' && 'Saving...'}
              {saveState === 'unsaved' && 'Unsaved'}
              {saveState === 'error' && 'Error'}
            </span>
          </div>

          {/* Clear Button */}
          <button 
            className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-md bg-support-yellow text-support-navy hover:bg-support-yellow/90 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors" 
            aria-label="Clear all drawings"
            onClick={handleClearCanvas}
          >
            <Trash2 className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>
    </nav>
  )
}