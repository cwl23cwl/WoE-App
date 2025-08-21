'use client'

import React from 'react'
import { TopToolbar } from '../../../src/features/workspace/TopToolbar'

export default function ToolbarOnlyTestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-2xl font-bold mb-8">Toolbar Only Test</h1>
      <p className="mb-4">Testing toolbar without Excalidraw integration</p>
      
      <div className="mb-8">
        <TopToolbar />
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Debug Info:</h2>
        <p>This page tests the toolbar in isolation without loading Excalidraw.</p>
        <p>If this works, the issue is specifically with Excalidraw's React version conflicts.</p>
      </div>
    </div>
  )
}