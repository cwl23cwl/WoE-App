import React from 'react'
import { TopToolbar } from '../../features/workspace/TopToolbar'
import { ToolDrawer } from '../../features/workspace/ToolDrawer'
import { ExcalidrawCanvasSimple as ExcalidrawCanvasNative } from '../../../components/workspace/ExcalidrawCanvasSimple'
import { InstructionsPanel } from '../../features/workspace/InstructionsPanel'
import { HelpCircle, User, MoreVertical } from 'lucide-react'

export function StudentWorkspacePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header 
        className="flex items-center justify-between px-4 sm:px-8 py-4 mb-4 shadow-sm border-b border-border bg-card"
        role="banner"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-lg font-bold text-accent-foreground"
            aria-hidden="true"
          >
            ●
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Workspace Editor</h1>
            <span className="text-sm text-muted-foreground">Main Canvas</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-6">
          <span 
            className="text-sm flex items-center gap-1 text-secondary"
            role="status"
            aria-live="polite"
          >
            <svg width="10" height="10" fill="currentColor" aria-hidden="true">
              <circle cx="5" cy="5" r="5" />
            </svg>
            <span className="hidden sm:inline">Saved</span>
            <span className="sm:hidden">✓</span>
          </span>
          <button 
            className="p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring transition-colors" 
            aria-label="Help"
            tabIndex={4}
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button 
            className="p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring transition-colors" 
            aria-label="My account"
            tabIndex={5}
          >
            <User className="w-5 h-5" />
          </button>
          <button 
            className="p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring transition-colors" 
            aria-label="More options"
            tabIndex={6}
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Sticky Header Container - Toolbar + Drawer */}
      <div className="sticky top-0 z-header bg-background px-4 sm:px-8 mb-4 overflow-visible">
        <div className="flex flex-col overflow-visible">
          <TopToolbar />
          <ToolDrawer />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-4 sm:px-8 pb-8">
        <div className="flex flex-col xl:flex-row gap-4 xl:gap-6">
          {/* Canvas Area */}
          <div 
            className="flex-1 min-w-0" 
            style={{ 
              minHeight: '400px', 
              height: '60vh', 
              maxHeight: '800px',
              width: '100%',
              maxWidth: '1400px'
            }}
          >
            <ExcalidrawCanvasNative className="canvas-container w-full h-full" />
          </div>

          {/* Instructions Panel - Right Side */}
          <div className="w-full xl:w-80 shrink-0">
            <InstructionsPanel />
          </div>
        </div>
      </div>
    </div>
  )
}