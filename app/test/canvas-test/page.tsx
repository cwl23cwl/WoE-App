'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Import Excalidraw with no SSR
const Excalidraw = dynamic(
  async () => {
    const module = await import('@excalidraw/excalidraw')
    return module.Excalidraw
  },
  { ssr: false }
)

export default function CanvasTestPage() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null)

  const handlePointerDown = (e: any) => {
    console.log('Pointer down event:', e)
  }

  const handlePointerMove = (e: any) => {
    console.log('Pointer move event:', e)
  }

  const handleChange = (elements: any, appState: any) => {
    console.log('Canvas changed:', { elements, appState })
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Canvas Test Page</h1>
        <p className="text-sm text-gray-600">
          Try drawing on the canvas below. Check console for events.
        </p>
        <div className="mt-2 p-2 bg-yellow-100 rounded">
          <p className="text-sm">
            <strong>Test:</strong> Click and drag to draw. If nothing happens, there's still an issue.
          </p>
        </div>
      </div>
      
      <div 
        className="w-full h-96 border-2 border-gray-300 rounded"
        style={{ minHeight: '400px' }}
      >
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          onChange={handleChange}
          initialData={{
            elements: [],
            appState: {}
          }}
        />
      </div>
      
      <div className="mt-4 p-4 bg-white rounded border">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p>API Loaded: {excalidrawAPI ? 'Yes' : 'No'}</p>
        <p>Open browser console (F12) to see interaction events</p>
      </div>
    </div>
  )
}
