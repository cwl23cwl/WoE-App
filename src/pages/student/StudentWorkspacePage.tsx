import React from 'react'
import { TopToolbar } from '../../features/workspace/TopToolbar'
import { CanvasShell } from '../../features/workspace/CanvasShell'
import { PageList } from '../../features/workspace/PageList'
import { InstructionsPanel } from '../../features/workspace/InstructionsPanel'
import { HelpCircle, User, MoreVertical } from 'lucide-react'

export function StudentWorkspacePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header 
        className="flex items-center justify-between px-4 sm:px-8 py-4 mb-4 shadow-sm border-b border-neutral-200 bg-white"
        role="banner"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full bg-support-yellow flex items-center justify-center text-lg font-bold text-support-navy"
            aria-hidden="true"
          >
            ●
          </div>
          <div>
            <h1 className="text-xl font-semibold text-text-main">My Work Space</h1>
            <span className="text-sm text-neutral-700">Student View</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-6">
          <span 
            className="text-sm flex items-center gap-1 text-support-teal"
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
            className="p-2 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors" 
            aria-label="Help"
            tabIndex={4}
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button 
            className="p-2 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors" 
            aria-label="My account"
            tabIndex={5}
          >
            <User className="w-5 h-5" />
          </button>
          <button 
            className="p-2 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors" 
            aria-label="More options"
            tabIndex={6}
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="px-4 sm:px-8 mb-4">
        <TopToolbar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-4 sm:px-8 pb-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Page List - Left Sidebar */}
          <div className="w-full lg:w-64 shrink-0">
            <PageList />
          </div>

          {/* Center: Canvas and Instructions */}
          <div className="flex-1 flex flex-col xl:flex-row gap-4 xl:gap-6 min-w-0">
            {/* Canvas Area */}
            <div className="flex-1 min-w-0">
              <CanvasShell />
            </div>

            {/* Instructions Panel - Right Side */}
            <div className="w-full xl:w-80 shrink-0">
              <InstructionsPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}