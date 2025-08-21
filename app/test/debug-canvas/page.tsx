'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import '@excalidraw/excalidraw/index.css'

const Excalidraw = dynamic(
  async () => {
    console.log('Loading Excalidraw module...')
    const module = await import('@excalidraw/excalidraw')
    console.log('Excalidraw module loaded:', module)
    return module.Excalidraw
  },
  {
    ssr: false,
    loading: () => {
      console.log('Excalidraw loading...')
      return <div className="p-4">Loading Excalidraw...</div>
    }
  }
)

export default function DeepDebugCanvas() {
  const [logs, setLogs] = useState<string[]>([])
  const [apiState, setApiState] = useState<any>(null)
  const [apiTrigger, setApiTrigger] = useState(0)
  const isMountedRef = useRef(false)
  const apiRef = useRef<any>(null)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    console.log(logMessage)
    
    // Only update state if component is mounted
    if (isMountedRef.current) {
      setLogs(prev => [...prev.slice(-9), logMessage])
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    addLog('Component mounted')
    
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Move API from ref to state after mounting
  useEffect(() => {
    if (apiRef.current && !apiState && isMountedRef.current) {
      setApiState(apiRef.current)
      addLog('🎯 Excalidraw API moved to state')
      addLog(`API methods: ${Object.keys(apiRef.current).length} available`)
    }
  }, [apiTrigger, apiState])

  const handleExcalidrawAPI = (api: any) => {
    console.log('🎯 Excalidraw API callback triggered')
    console.log(`API is: ${api ? 'defined' : 'undefined'}`)
    
    if (api) {
      console.log(`API methods: ${Object.keys(api).join(', ')}`)
      
      // Store in ref immediately (no state update during mount)
      apiRef.current = api
      
      // Trigger useEffect after mounting is complete
      setTimeout(() => {
        if (isMountedRef.current) {
          setApiTrigger(prev => prev + 1)
        }
      }, 100)
    }
  }

  // Separate effect to handle tool setting after API and mounting
  useEffect(() => {
    if (apiState && isMountedRef.current) {
      // Use setTimeout to ensure everything is fully initialized
      const timer = setTimeout(() => {
        try {
          addLog('🎨 Attempting to set freedraw tool...')
          apiState.setActiveTool({ type: 'freedraw' })
          addLog('✅ Successfully set freedraw tool')
          
          // Check current state
          if (apiState.getAppState) {
            const appState = apiState.getAppState()
            addLog(`Current tool: ${appState.activeTool?.type || 'unknown'}`)
          }
        } catch (error) {
          addLog(`❌ Failed to set tool: ${error}`)
        }
      }, 200)
      
      return () => clearTimeout(timer)
    }
  }, [apiState])

  const handleChange = (elements: any, appState: any) => {
    addLog(`📝 Canvas changed: ${elements?.length || 0} elements`)
    if (elements && elements.length > 0) {
      addLog(`Last element type: ${elements[elements.length - 1]?.type || 'unknown'}`)
    }
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <h1 className="text-xl font-bold mb-2">Deep Debug Canvas</h1>
          <p className="text-sm text-gray-600 mb-4">
            Maximum logging to understand what's happening with Excalidraw
          </p>
        </div>
        <div className="bg-gray-100 p-3 rounded max-h-40 overflow-y-auto">
          <h3 className="font-semibold text-sm mb-2">Live Debug Log:</h3>
          {logs.map((log, i) => (
            <div key={i} className="text-xs mb-1 font-mono">{log}</div>
          ))}
        </div>
      </div>

      <div className="border-2 border-blue-300 rounded" style={{ height: '400px' }}>
        <Excalidraw
          excalidrawAPI={handleExcalidrawAPI}
          onChange={handleChange}
          initialData={{
            elements: [],
            appState: {}
          }}
        />
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">API Status:</h3>
        <p>API Loaded: {apiState ? '✅ Yes' : '❌ No'}</p>
        {apiState && (
          <>
            <p>Available Methods: {Object.keys(apiState).length}</p>
            <details>
              <summary className="cursor-pointer text-sm text-blue-600">Show all API methods</summary>
              <pre className="text-xs mt-2 bg-white p-2 rounded overflow-x-auto">
                {Object.keys(apiState).join('\n')}
              </pre>
            </details>
          </>
        )}
      </div>
    </div>
  )
}
