'use client'

import { useEffect } from 'react'
import { useWorkspaceStore } from '@/stores/workspace'
import dynamic from 'next/dynamic'
import '@excalidraw/excalidraw/index.css'

const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  { ssr: false }
)

export default function FixedCanvasTestPage() {
  const { setRole, setPages, setSaveState } = useWorkspaceStore()

  // Initialize test data
  useEffect(() => {
    setRole('STUDENT')
    setPages([
      { id: 'page1', scene: null, orientation: 'portrait' },
    ])
    setSaveState('saved')
  }, [setRole, setPages, setSaveState])

  const handleAPI = (api: any) => {
    console.log('🎯 Fixed Canvas API loaded:', !!api)
    
    if (api) {
      setTimeout(() => {
        try {
          api.setActiveTool({ type: 'freedraw' })
          console.log('✅ Fixed Canvas tool set to freedraw')
        } catch (error) {
          console.error('❌ Fixed Canvas failed to set tool:', error)
        }
      }, 100)
    }
  }

  const handleChange = (elements: any) => {
    console.log('📝 Fixed Canvas elements changed:', elements?.length || 0)
    if (elements && elements.length > 0) {
      console.log('🎨 Drawing detected! Last element:', elements[elements.length - 1]?.type)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Fixed Canvas Test</h1>
      <p className="mb-4 text-gray-600">Testing simplified approach with workspace store</p>
      
      <div className="border border-gray-300" style={{ height: '600px', width: '100%' }}>
        <Excalidraw
          excalidrawAPI={handleAPI}
          onChange={handleChange}
          viewModeEnabled={false}
          theme="light"
        />
      </div>
    </div>
  )
}