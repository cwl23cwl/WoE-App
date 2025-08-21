'use client'

import dynamic from 'next/dynamic'
import '@excalidraw/excalidraw/index.css'

// Dynamic import Excalidraw with no SSR
const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading canvas...</p>
        </div>
      </div>
    ),
  }
)

export default function SimpleCanvasTest() {
  const handleChange = (elements: any, appState: any) => {
    console.log('Canvas changed - elements count:', elements?.length || 0)
  }

  const handleExcalidrawAPI = (api: any) => {
    console.log('Excalidraw API loaded:', api)
    console.log('API methods:', Object.keys(api))
    
    // Try to set freedraw tool
    try {
      api.setActiveTool({ type: 'freedraw' })
      console.log('Set tool to freedraw')
    } catch (error) {
      console.error('Failed to set tool:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Simple Canvas Test</h1>
        <p className="text-sm text-gray-600 mb-2">
          This is the most basic Excalidraw implementation. If this doesn't work, the issue is fundamental.
        </p>
        <div className="p-3 bg-yellow-100 border border-yellow-300 rounded">
          <p className="text-sm font-medium text-yellow-800">
            ⚠️ Test Instructions:
          </p>
          <ol className="text-sm text-yellow-700 mt-1 ml-4 list-decimal">
            <li>Open browser console (F12)</li>
            <li>Look for "Excalidraw API loaded" message</li>
            <li>Try clicking and dragging to draw</li>
            <li>Look for "Canvas changed" messages in console</li>
          </ol>
        </div>
      </div>
      
      <div className="w-full border-2 border-gray-300 rounded" style={{ height: '500px' }}>
        <Excalidraw
          excalidrawAPI={handleExcalidrawAPI}
          onChange={handleChange}
          initialData={{
            elements: [],
            appState: {
              currentItemStrokeColor: '#000000',
              currentItemStrokeWidth: 2
            }
          }}
        />
      </div>
    </div>
  )
}
