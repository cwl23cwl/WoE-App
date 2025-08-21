'use client'

import dynamic from 'next/dynamic'
import '@excalidraw/excalidraw/index.css'

const Excalidraw = dynamic(
  async () => {
    const module = await import('@excalidraw/excalidraw')
    return module.Excalidraw
  },
  { ssr: false }
)

export default function MinimalTestPage() {
  const handleAPI = (api: any) => {
    console.log('🎯 API loaded:', !!api)
    console.log('🔧 API methods:', api ? Object.keys(api).length : 0)
    
    if (api) {
      setTimeout(() => {
        try {
          api.setActiveTool({ type: 'freedraw' })
          console.log('✅ Tool set to freedraw')
        } catch (error) {
          console.error('❌ Failed to set tool:', error)
        }
      }, 100)
    }
  }

  const handleChange = (elements: any) => {
    console.log('📝 Elements changed:', elements?.length || 0)
    if (elements && elements.length > 0) {
      console.log('🎨 Drawing detected! Last element:', elements[elements.length - 1]?.type)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Minimal Canvas Test</h1>
      <p className="mb-4 text-gray-600">Check console (F12) and try drawing</p>
      
      <div className="border border-gray-300" style={{ height: '500px', width: '100%' }}>
        <Excalidraw
          excalidrawAPI={handleAPI}
          onChange={handleChange}
        />
      </div>
    </div>
  )
}
