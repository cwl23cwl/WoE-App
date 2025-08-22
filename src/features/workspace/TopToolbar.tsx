import React, { useEffect } from 'react'
import { 
  MousePointer, 
  Pencil, 
  Type, 
  Eraser, 
  Highlighter,
  RotateCcw,
  RotateCw,
  Trash2
} from 'lucide-react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

type Tool = 'select' | 'draw' | 'text' | 'erase' | 'highlighter'

export function TopToolbar() {
  const { 
    activeTool, 
    setActiveTool,
    openDrawer,
    toggleDrawer,
    resetTextTool,
    canUndo,
    canRedo,
    undo,
    redo,
    clearCanvas,
    toolPrefs,
    updateToolPref
  } = useWorkspaceStore()

  // Close any floating menus when tools change
  useEffect(() => {
    const closeMenus = () => {
      // Dispatch custom event to close all floating menus
      window.dispatchEvent(new CustomEvent('closeFloatingMenus'))
    }
    
    closeMenus()
  }, [activeTool, openDrawer])

  const toolButtons = [
    { id: 'select' as Tool, icon: MousePointer, label: 'Select', color: 'text-neutral-800' },
    { id: 'draw' as Tool, icon: Pencil, label: 'Draw', color: 'text-brand-primary' },
    { id: 'erase' as Tool, icon: Eraser, label: 'Erase', color: 'text-neutral-800' },
    { id: 'text' as Tool, icon: Type, label: 'Text', color: 'text-support-teal' },
    { id: 'highlighter' as Tool, icon: Highlighter, label: 'Highlight', color: 'text-amber-600' },
  ]

  const handleToolClick = (toolId: Tool) => {
    // Handle special text tool behavior: if clicking text while text is active and drawer is open
    if (toolId === 'text' && activeTool === 'text' && openDrawer === 'text') {
      resetTextTool()
      return
    }
    
    // Handle drawer toggle logic for tools with options
    if (['text', 'draw', 'highlighter'].includes(toolId)) {
      if (activeTool === toolId) {
        // Same tool clicked - toggle drawer
        toggleDrawer(toolId)
      } else {
        // Different tool clicked - set active tool (drawer will open automatically)
        setActiveTool(toolId)
      }
    } else {
      // Tools without drawers (select, erase) - just set active tool
      setActiveTool(toolId)
    }
  }

  return (
    <nav 
      className="flex items-center justify-between px-2 sm:px-4 py-3 bg-white border border-neutral-200 rounded-xl shadow-sm"
      role="toolbar"
      aria-label="Drawing tools"
    >
      {/* Left Section: Undo/Redo */}
      <div className="flex items-center gap-1 sm:gap-2" role="group" aria-label="History">
        <button 
          className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary ${
            canUndo ? 'hover:bg-neutral-50' : 'opacity-50 cursor-not-allowed'
          }`}
          aria-label="Undo"
          disabled={!canUndo}
          onClick={undo}
        >
          <RotateCcw className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
        </button>
        <button 
          className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary ${
            canRedo ? 'hover:bg-neutral-50' : 'opacity-50 cursor-not-allowed'
          }`}
          aria-label="Redo"
          disabled={!canRedo}
          onClick={redo}
        >
          <RotateCw className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
        </button>
      </div>

      {/* Center Section: Main Tools */}
      <div className="flex gap-1 sm:gap-2" role="group" aria-label="Drawing tools">
        {toolButtons.map((tool, index) => {
          const Icon = tool.icon
          const isActive = activeTool === tool.id
          
          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`flex flex-col items-center px-2 sm:px-3 py-2 text-xs rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                isActive 
                  ? 'bg-brand-primary text-white shadow-sm' 
                  : `${tool.color} hover:bg-neutral-50`
              }`}
              aria-label={`${tool.label} tool`}
              aria-pressed={isActive}
              tabIndex={3 + index}
            >
              <Icon className="w-5 h-5 mb-1" strokeWidth={2.5} aria-hidden="true" />
              <span>{tool.label}</span>
            </button>
          )
        })}
      </div>

      {/* Right Section: Clear */}
      <div className="flex items-center" role="group" aria-label="Actions">
        <button 
          className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-md bg-support-yellow text-support-navy hover:bg-support-yellow/90 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors" 
          aria-label="Clear all"
          onClick={clearCanvas}
        >
          <Trash2 className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>
    </nav>
  )
}