import React from 'react'
import { 
  MousePointer, 
  Pencil, 
  Type, 
  Eraser, 
  Highlighter,
  RotateCcw,
  RotateCw,
  ZoomOut,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

type Tool = 'select' | 'draw' | 'text' | 'erase' | 'highlighter'

export function TopToolbar() {
  const { 
    activeTool, 
    setActiveTool, 
    zoom, 
    zoomIn, 
    zoomOut,
    pages,
    currentPageIndex,
    prevPage,
    nextPage,
    canUndo,
    canRedo,
    toolPrefs,
    updateToolPref,
    undo,
    redo,
    clearCanvas
  } = useWorkspaceStore()

  const toolButtons = [
    { id: 'select' as Tool, icon: MousePointer, label: 'Select', color: 'text-text-main' },
    { id: 'draw' as Tool, icon: Pencil, label: 'Draw', color: 'text-brand-primary' },
    { id: 'text' as Tool, icon: Type, label: 'Text', color: 'text-support-teal' },
    { id: 'erase' as Tool, icon: Eraser, label: 'Erase', color: 'text-neutral-700' },
    { id: 'highlighter' as Tool, icon: Highlighter, label: 'Mark', color: 'text-support-yellow' },
  ]

  const handleToolClick = (toolId: Tool) => {
    setActiveTool(toolId)
  }

  const totalPages = pages.length
  const currentPage = currentPageIndex + 1

  return (
    <nav 
      className="flex flex-wrap items-center gap-2 sm:gap-3 px-2 sm:px-4 py-3 bg-white border border-neutral-200 rounded-xl shadow-sm"
      role="toolbar"
      aria-label="Drawing tools"
    >
      {/* Tool Buttons */}
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
              <Icon className="w-4 h-4 mb-1" aria-hidden="true" />
              <span>{tool.label}</span>
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-neutral-200 mx-1 hidden sm:block" aria-hidden="true" />

      {/* Color & Width Controls */}
      <div className="flex items-center gap-2" role="group" aria-label="Tool settings">
        {activeTool !== 'select' && activeTool !== 'erase' && (
          <label className="flex items-center gap-1 text-sm text-text-main">
            <input
              type="color"
              value={
                activeTool === 'draw' ? toolPrefs.drawColor :
                activeTool === 'highlighter' ? toolPrefs.highlighterColor :
                activeTool === 'text' ? toolPrefs.textColor :
                toolPrefs.drawColor
              }
              onChange={(e) => {
                const color = e.target.value
                if (activeTool === 'draw') {
                  updateToolPref('drawColor', color)
                } else if (activeTool === 'highlighter') {
                  updateToolPref('highlighterColor', color)
                } else if (activeTool === 'text') {
                  updateToolPref('textColor', color)
                }
              }}
              className="w-6 h-6 rounded border border-neutral-200 cursor-pointer"
              title={`${activeTool === 'text' ? 'Text' : activeTool === 'highlighter' ? 'Highlighter' : 'Pen'} color`}
            />
            <span className="hidden sm:inline">{activeTool === 'text' ? 'Text' : activeTool === 'highlighter' ? 'Highlighter' : 'Pen'}</span>
          </label>
        )}
        
        {(activeTool === 'draw' || activeTool === 'highlighter' || activeTool === 'erase') && (
          <label className="flex items-center gap-1 text-sm text-text-main">
            <span className="hidden sm:inline">{activeTool === 'erase' ? 'Size:' : 'Width:'}</span>
            <input
              type="range"
              min="1"
              max={activeTool === 'highlighter' ? "30" : "20"}
              value={
                activeTool === 'draw' ? toolPrefs.drawSize :
                activeTool === 'highlighter' ? toolPrefs.highlighterSize :
                activeTool === 'erase' ? toolPrefs.eraserSize :
                toolPrefs.drawSize
              }
              onChange={(e) => {
                const size = Number(e.target.value)
                if (activeTool === 'draw') {
                  updateToolPref('drawSize', size)
                } else if (activeTool === 'highlighter') {
                  updateToolPref('highlighterSize', size)
                } else if (activeTool === 'erase') {
                  updateToolPref('eraserSize', size)
                }
              }}
              className="w-16 sm:w-20 accent-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              aria-label={`${activeTool} size: ${
                activeTool === 'draw' ? toolPrefs.drawSize :
                activeTool === 'highlighter' ? toolPrefs.highlighterSize :
                activeTool === 'erase' ? toolPrefs.eraserSize :
                toolPrefs.drawSize
              } pixels`}
              tabIndex={3}
            />
          </label>
        )}
        
        {activeTool === 'text' && (
          <label className="flex items-center gap-1 text-sm text-text-main">
            <span className="hidden sm:inline">Size:</span>
            <input
              type="range"
              min="8"
              max="72"
              value={toolPrefs.textSize}
              onChange={(e) => updateToolPref('textSize', Number(e.target.value))}
              className="w-16 sm:w-20 accent-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              aria-label={`Text size: ${toolPrefs.textSize} pixels`}
              tabIndex={3}
            />
          </label>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-neutral-200 mx-1 hidden sm:block" aria-hidden="true" />

      {/* Action Controls */}
      <div className="flex items-center gap-1 sm:gap-2" role="group" aria-label="Actions">
        <button 
          className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary ${
            canUndo ? 'hover:bg-neutral-50' : 'opacity-50 cursor-not-allowed'
          }`}
          aria-label="Undo"
          tabIndex={3}
          disabled={!canUndo}
          onClick={undo}
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
        </button>
        <button 
          className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary ${
            canRedo ? 'hover:bg-neutral-50' : 'opacity-50 cursor-not-allowed'
          }`}
          aria-label="Redo"
          tabIndex={3}
          disabled={!canRedo}
          onClick={redo}
        >
          <RotateCw className="w-4 h-4" aria-hidden="true" />
        </button>
        <button 
          className="p-2 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors" 
          aria-label="Make smaller"
          onClick={zoomOut}
          tabIndex={3}
        >
          <ZoomOut className="w-4 h-4" aria-hidden="true" />
        </button>
        <span className="text-sm font-medium text-text-main min-w-[3rem] text-center" aria-label={`Zoom level: ${Math.round(zoom * 100)} percent`}>
          {Math.round(zoom * 100)}%
        </span>
        <button 
          className="p-2 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors" 
          aria-label="Make bigger"
          onClick={zoomIn}
          tabIndex={3}
        >
          <ZoomIn className="w-4 h-4" aria-hidden="true" />
        </button>
        <span className="text-sm font-medium text-text-main min-w-[3rem] text-center" aria-label={`Page ${currentPage} of ${totalPages || 1}`}>
          {currentPage} / {totalPages || 1}
        </span>
        <button 
          className="p-2 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors disabled:opacity-50" 
          aria-label="Previous page"
          disabled={currentPage <= 1}
          onClick={prevPage}
          tabIndex={3}
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </button>
        <button 
          className="p-2 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors disabled:opacity-50" 
          aria-label="Next page"
          disabled={currentPage >= totalPages}
          onClick={nextPage}
          tabIndex={3}
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
        <button 
          className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-md bg-support-yellow text-support-navy hover:bg-support-yellow/90 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors" 
          aria-label="Clear all"
          onClick={clearCanvas}
          tabIndex={3}
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>
    </nav>
  )
}