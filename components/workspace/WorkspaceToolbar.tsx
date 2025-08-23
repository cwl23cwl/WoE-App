'use client'

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

export function WorkspaceToolbar() {
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
    clearCanvas,
    createTextWithPlaceholder
  } = useWorkspaceStore()

  const tools = [
    { id: 'select' as Tool, icon: MousePointer, label: 'Select', color: 'text-foreground' },
    { id: 'draw' as Tool, icon: Pencil, label: 'Draw', color: 'text-primary' },
    { id: 'text' as Tool, icon: Type, label: 'Text', color: 'text-secondary' },
    { id: 'erase' as Tool, icon: Eraser, label: 'Eraser', color: 'text-muted-foreground' },
    { id: 'highlighter' as Tool, icon: Highlighter, label: 'Highlighter', color: 'text-accent' },
  ]

  const handleToolClick = (toolId: Tool) => {
    setActiveTool(toolId)
  }

  const totalPages = pages.length
  const currentPage = currentPageIndex + 1

  return (
    <nav className="flex flex-wrap items-center gap-3 px-8 py-3 mb-4 bg-card border border-border rounded-xl shadow-sm mx-8">
      {/* Tool Buttons */}
      <div className="flex gap-2">
        {tools.map((tool) => {
          const Icon = tool.icon
          const isActive = activeTool === tool.id
          
          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`flex flex-col items-center px-3 py-2 text-xs rounded-md transition-all ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : `${tool.color} hover:bg-muted`
              }`}
              title={tool.label}
              aria-label={`Select ${tool.label.toLowerCase()} tool`}
              aria-pressed={isActive}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span>{tool.label}</span>
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-border mx-2" />

      {/* Color & Width Controls */}
      <div className="flex items-center gap-2">
        {activeTool !== 'select' && activeTool !== 'erase' && (
          <label className="flex items-center gap-1 text-sm">
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
              className="w-6 h-6 rounded border border-border cursor-pointer"
              title={`${activeTool === 'text' ? 'Text' : activeTool === 'highlighter' ? 'Highlighter' : 'Pen'} color`}
            />
            {activeTool === 'text' ? 'Text' : activeTool === 'highlighter' ? 'Highlighter' : 'Pen'}
          </label>
        )}
        
        {(activeTool === 'draw' || activeTool === 'highlighter' || activeTool === 'erase') && (
          <label className="flex items-center gap-1 text-sm">
            {activeTool === 'erase' ? 'Size:' : 'Width:'}{' '}
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
              className="w-20 accent-primary"
              aria-label={`${activeTool} size: ${
                activeTool === 'draw' ? toolPrefs.drawSize :
                activeTool === 'highlighter' ? toolPrefs.highlighterSize :
                activeTool === 'erase' ? toolPrefs.eraserSize :
                toolPrefs.drawSize
              } pixels`}
            />
            <span className="text-xs text-muted-foreground min-w-[2ch]">
              {activeTool === 'draw' ? toolPrefs.drawSize :
               activeTool === 'highlighter' ? toolPrefs.highlighterSize :
               activeTool === 'erase' ? toolPrefs.eraserSize :
               toolPrefs.drawSize}
            </span>
          </label>
        )}
        
        {activeTool === 'text' && (
          <>
            <label className="flex items-center gap-1 text-sm">
              Size:{' '}
              <input
                type="range"
                min="8"
                max="72"
                value={toolPrefs.textSize}
                onChange={(e) => updateToolPref('textSize', Number(e.target.value))}
                className="w-20 accent-primary"
                aria-label={`Text size: ${toolPrefs.textSize} pixels`}
              />
              <span className="text-xs text-muted-foreground min-w-[2ch]">
                {toolPrefs.textSize}
              </span>
            </label>
            
            {/* Quick Text Creation Button */}
            <button
              onClick={() => createTextWithPlaceholder()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm"
              title="Create text box with placeholder"
            >
              <Type className="w-3.5 h-3.5" />
              <span className="font-medium">Write!</span>
            </button>
            
            {/* Helpful Tip */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground border border-border/50">
              <span>💡</span>
              <span>Click on canvas and start typing, or use "Write!" button</span>
            </div>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-border mx-2" />

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        <button 
          className={`p-2 rounded-md transition-colors ${
            canUndo ? 'hover:bg-muted' : 'opacity-50 cursor-not-allowed'
          }`}
          title="Undo last action"
          aria-label="Undo last action"
          disabled={!canUndo}
          onClick={undo}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        
        <button 
          className={`p-2 rounded-md transition-colors ${
            canRedo ? 'hover:bg-muted' : 'opacity-50 cursor-not-allowed'
          }`}
          title="Redo last action"
          aria-label="Redo last action"
          disabled={!canRedo}
          onClick={redo}
        >
          <RotateCw className="w-4 h-4" />
        </button>
        
        <button 
          className="p-2 rounded-md hover:bg-muted transition-colors"
          title="Zoom out"
          aria-label="Zoom out"
          onClick={zoomOut}
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        
        <span className="text-sm font-medium min-w-[3rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        
        <button 
          className="p-2 rounded-md hover:bg-muted transition-colors"
          title="Zoom in"
          aria-label="Zoom in"
          onClick={zoomIn}
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        
        <span className="text-sm font-medium min-w-[3rem] text-center">
          {currentPage} / {totalPages || 1}
        </span>
        
        <button 
          className="p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous page"
          aria-label="Go to previous page"
          disabled={currentPage <= 1}
          onClick={prevPage}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <button 
          className="p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next page"
          aria-label="Go to next page"
          disabled={currentPage >= totalPages}
          onClick={nextPage}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        
        <button 
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
          title="Clear canvas"
          aria-label="Clear the entire canvas"
          onClick={clearCanvas}
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>
    </nav>
  )
}