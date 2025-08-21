'use client'

import { useEffect, useState } from 'react'

export default function ExcalidrawTestPage() {
  const [Excalidraw, setExcalidraw] = useState<any>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    async function loadExcalidraw() {
      try {
        console.log('Starting to load Excalidraw...')
        const excalidrawModule = await import('@excalidraw/excalidraw')
        console.log('Excalidraw module loaded:', excalidrawModule)
        setExcalidraw(() => excalidrawModule.Excalidraw)
        console.log('Excalidraw component set successfully')
      } catch (err) {
        console.error('Failed to load Excalidraw:', err)
        setError(`Failed to load Excalidraw: ${err}`)
      }
    }

    loadExcalidraw()
  }, [])

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold text-red-600">Error Loading Excalidraw</h1>
        <p className="mt-4 text-sm text-gray-600">{error}</p>
        <p className="mt-2 text-sm text-gray-500">Check the browser console for more details.</p>
      </div>
    )
  }

  if (!Excalidraw) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold">Loading Excalidraw...</h1>
        <p className="mt-4 text-sm text-gray-600">Please wait while we load the drawing canvas.</p>
      </div>
    )
  }

  return (
    <div className="h-screen bg-white">
      <div className="p-4">
        <h1 className="text-xl font-bold">Excalidraw Test - Super Simple</h1>
        <p className="text-sm text-gray-600 mb-4">Try drawing with the tools in the left sidebar</p>
      </div>
      <div className="h-[calc(100vh-100px)] border-2 border-gray-300">
        <Excalidraw />
      </div>
    </div>
  )
}
