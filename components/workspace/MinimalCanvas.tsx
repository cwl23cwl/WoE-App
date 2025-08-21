'use client'

import { useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import '@excalidraw/excalidraw/index.css'

const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  { ssr: false }
)

interface MinimalCanvasProps {
  className?: string
}

export function MinimalCanvas({ className = '' }: MinimalCanvasProps) {
  const excalidrawRef = useRef<any>(null)

  const handleExcalidrawAPI = useCallback((api: any) => {
    console.log('🎯 Minimal Canvas API loaded:', !!api)
    excalidrawRef.current = api
  }, [])

  // Set freedraw tool after API loads
  useEffect(() => {
    if (excalidrawRef.current) {
      setTimeout(() => {
        try {
          excalidrawRef.current.setActiveTool({ type: 'freedraw' })
          console.log('✅ Minimal Canvas set to freedraw')
        } catch (error) {
          console.error('❌ Minimal Canvas tool setting failed:', error)
        }
      }, 100)
    }
  }, [excalidrawRef.current])

  const handleChange = useCallback((elements: any) => {
    console.log('📝 Minimal Canvas elements changed:', elements?.length || 0)
    if (elements && elements.length > 0) {
      console.log('🎨 Drawing detected! Last element:', elements[elements.length - 1]?.type)
    }
  }, [])

  return (
    <div className={`w-full h-full ${className}`} style={{ minHeight: '400px' }}>
      <Excalidraw
        excalidrawAPI={handleExcalidrawAPI}
        onChange={handleChange}
        viewModeEnabled={false}
        theme="light"
      />
    </div>
  )
}
