'use client'

import React from 'react'
import { TopToolbar } from '../../../src/features/workspace/TopToolbar'
import { ToolDrawer } from '../../../src/features/workspace/ToolDrawer'
import { SimpleCanvasShell } from '../../../src/features/workspace/SimpleCanvasShell'

export default function SimpleIntegrationTestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 mb-4 shadow-sm border-b border-neutral-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-support-yellow flex items-center justify-center text-lg font-bold text-support-navy">
            ●
          </div>
          <div>
            <h1 className="text-xl font-semibold text-text-main">Simple Integration Test</h1>
            <span className="text-sm text-neutral-700">React 19 Compatible Version</span>
          </div>
        </div>
      </header>

      {/* Sticky Header Container - Toolbar + Drawer */}
      <div className="sticky top-0 z-header bg-background px-8 mb-4 overflow-visible">
        <div className="flex flex-col overflow-visible">
          <TopToolbar />
          <ToolDrawer />
        </div>
      </div>

      {/* Canvas */}
      <div className="px-8 pb-8">
        <SimpleCanvasShell />
      </div>
      
      {/* Instructions */}
      <div className="px-8 pb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-blue-900 mb-2">Testing Instructions:</h2>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Click different tools in the toolbar</li>
            <li>• Try changing colors and sizes</li>
            <li>• Use Draw or Highlighter tools to draw on canvas</li>
            <li>• Test undo/redo and clear buttons</li>
            <li>• This version avoids React 19/Excalidraw conflicts</li>
          </ul>
        </div>
      </div>
    </div>
  )
}