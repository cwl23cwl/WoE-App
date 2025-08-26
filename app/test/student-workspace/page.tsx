'use client'

import React, { useState } from 'react'
import { TopToolbar } from '../../../src/features/workspace/TopToolbar'
import { ToolDrawer } from '../../../src/features/workspace/ToolDrawer'
import { FixedStageCanvas } from '../../../components/workspace/FixedStageCanvas'
import { InstructionsPanel } from '../../../src/features/workspace/InstructionsPanel'
import { HelpCircle, User, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react'

// Test page that bypasses authentication to preview the student workspace
export default function TestStudentWorkspacePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Dev notice */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
        <p className="font-bold">🧪 Test Environment</p>
        <p className="text-sm">This is a test version of the student workspace that bypasses authentication.</p>
      </div>

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

      {/* Sticky Header Container - Toolbar + Drawer */}
      <div className="sticky top-0 z-header bg-background px-4 sm:px-8 mb-4 overflow-visible">
        <div className="flex flex-col overflow-visible">
          <TopToolbar />
          <ToolDrawer />
        </div>
      </div>

      {/* Fixed Instructions Panel - Always on Right Side */}
      <div className={`fixed top-0 right-0 w-64 lg:w-80 h-screen bg-white border-l border-neutral-200 shadow-lg z-40 overflow-y-auto transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-3 lg:p-4 border-b border-neutral-200">
          <h3 className="font-semibold text-neutral-800">What to do</h3>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded hover:bg-neutral-100 transition-colors"
            aria-label="Close sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {/* Sidebar Content */}
        <div className="p-3 lg:p-4">
          <InstructionsPanel />
        </div>
      </div>

      {/* Sidebar Toggle Button - Shows when closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-1/2 right-4 -translate-y-1/2 bg-brand-primary text-white p-2 rounded-l-lg shadow-lg z-30 hover:bg-brand-primary/90 transition-colors"
          aria-label="Open sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Main Content Area - Adjusted for Fixed Sidebar */}
      <div className={`flex-1 px-4 sm:px-8 pb-8 transition-all duration-300 ${
        sidebarOpen ? 'pr-64 lg:pr-80' : 'pr-4 sm:pr-8'
      }`}>
        <div className="w-full h-full">
          {/* Canvas Area - Fixed Stage */}
          <div className="w-full h-[calc(100vh-200px)] flex justify-center items-start">
            <FixedStageCanvas className="fixed-stage-test" />
          </div>
        </div>
      </div>
    </div>
  )
}