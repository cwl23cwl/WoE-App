'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { ExcalidrawFallback } from './ExcalidrawFallback'

// Import Excalidraw CSS
import '@excalidraw/excalidraw/index.css'

// Simple dynamic import - back to basics to avoid hanging
const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then(mod => ({ default: mod.Excalidraw })),
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

// Text box creation fix: Enhanced component with state tracking and reset functionality

interface ExcalidrawCanvasNativeProps {
  className?: string
}

export function ExcalidrawCanvasNative({ className = '' }: ExcalidrawCanvasNativeProps) {
  const excalidrawRef = useRef<any>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  
  // Minimal store access - only what we absolutely need
  const { setExcalidrawAPI, activeTool, toolPrefs, editingTextId, selectedElementIds, setEditingTextId, setSelectedElementIds } = useWorkspaceStore()
  

  // Stable initialData - no dependencies on changing store values
  const initialData = {
    elements: [],
    appState: {
      viewBackgroundColor: '#ffffff',
    },
  }

  // Helper function to map store tools to Excalidraw tools
  const mapToolToExcalidraw = (tool: string) => {
    switch (tool) {
      case 'select': return 'selection'
      case 'draw': return 'freedraw'
      case 'text': return 'text'
      case 'erase': return 'eraser'
      case 'highlighter': return 'freedraw'
      default: return 'freedraw'
    }
  }

  // Enhanced change handler with text editing state tracking and dynamic font sizing
  const handleChange = useCallback((elements: any, appState: any, files: any) => {
    // Track text editing state changes
    const currentEditingTextId = appState.editingElement?.id || null
    const currentSelectedIds = appState.selectedElementIds || []
    
    // Update store if text editing state has changed
    if (currentEditingTextId !== editingTextId) {
      setEditingTextId(currentEditingTextId)
      if (currentEditingTextId) {
        console.log(`📝 Started editing text element: ${currentEditingTextId}`)
      } else {
        console.log('📝 Finished editing text element')
      }
    }
    
    // Update store if selection has changed
    if (JSON.stringify(currentSelectedIds) !== JSON.stringify(selectedElementIds)) {
      setSelectedElementIds(currentSelectedIds)
      console.log(`🎯 Selection changed: ${currentSelectedIds.length} elements selected`)
    }
    
    
    // Log overall changes for debugging
    console.log('Canvas changed - elements:', elements.length)
  }, [editingTextId, selectedElementIds, setEditingTextId, setSelectedElementIds])

  // API handler with initial tool setup
  const handleExcalidrawAPI = useCallback((api: any) => {
    console.log('🎯 Native Excalidraw API initialized:', !!api)
    excalidrawRef.current = api
    
    // Store the API reference and initialize tool
    if (api) {
      setExcalidrawAPI(api)
      
      // Set initial tool after a short delay to ensure API is ready
      setTimeout(() => {
        try {
          const excalidrawTool = mapToolToExcalidraw(activeTool)
          api.setActiveTool({ type: excalidrawTool })
          console.log(`✅ Initial tool set: ${activeTool} -> ${excalidrawTool}`)
          
        } catch (error) {
          console.error('❌ Initial tool setup failed:', error)
        }
      }, 100)
      
      console.log('🎨 UI Hidden - Custom toolbar is now the only control interface')
    }
  }, [setExcalidrawAPI, activeTool])

  // Simple tool synchronization - only when tool changes
  useEffect(() => {
    if (excalidrawRef.current && activeTool) {
      try {
        const excalidrawTool = mapToolToExcalidraw(activeTool)
        excalidrawRef.current.setActiveTool({ type: excalidrawTool })
      } catch (error) {
        console.error('❌ Tool sync failed:', error)
      }
    }
  }, [activeTool])

  // Enhanced text tool state monitoring for better reset handling
  useEffect(() => {
    if (excalidrawRef.current && activeTool === 'text') {
      // If we have no editing text and no selection, ensure we're ready for new text creation
      if (!editingTextId && selectedElementIds.length === 0) {
        try {
          // Ensure text tool is properly activated for new text creation
          excalidrawRef.current.setActiveTool({ type: 'text' })
          console.log('📝 Text tool refreshed for new text box creation')
        } catch (error) {
          console.error('❌ Text tool refresh failed:', error)
        }
      }
    }
  }, [activeTool, editingTextId, selectedElementIds])

  // Handle tool-specific properties (like highlighter opacity)
  useEffect(() => {
    if (excalidrawRef.current && activeTool) {
      try {
        const updates: any = {}
        
        if (activeTool === 'highlighter') {
          // Set highlighter properties
          updates.currentItemStrokeColor = toolPrefs.highlighterColor || '#FACC15'
          updates.currentItemOpacity = (toolPrefs.highlighterOpacity || 0.3) * 100
          updates.currentItemStrokeWidth = toolPrefs.highlighterSize || 12
        } else if (activeTool === 'draw') {
          // Reset to normal drawing properties
          updates.currentItemStrokeColor = toolPrefs.drawColor || '#000000'
          updates.currentItemOpacity = 100
          updates.currentItemStrokeWidth = toolPrefs.drawSize || 4
        } else if (activeTool === 'text') {
          // Set text properties with enhanced font handling
          updates.currentItemStrokeColor = toolPrefs.textColor || '#000000'
          updates.currentItemFontSize = toolPrefs.textSize || 24
          updates.currentItemFontFamily = toolPrefs.textFamily || '"Times New Roman", Georgia, serif'
        }
        
        if (Object.keys(updates).length > 0) {
          excalidrawRef.current.updateScene({ 
            appState: updates 
          })
          console.log(`🎨 Tool properties updated for ${activeTool}`)
        }
      } catch (error) {
        console.error('❌ Tool properties update failed:', error)
      }
    }
  }, [activeTool, toolPrefs.highlighterColor, toolPrefs.highlighterOpacity, toolPrefs.highlighterSize, toolPrefs.drawColor, toolPrefs.drawSize, toolPrefs.textColor, toolPrefs.textSize, toolPrefs.textFamily])



  // Error boundary fallback - use basic canvas fallback
  if (loadError) {
    console.warn('Excalidraw failed to load, using fallback canvas:', loadError)
    return <ExcalidrawFallback className={className} />
  }

  return (
    <div 
      className={`w-full h-full ${className} excalidraw-container`} 
      style={{ minHeight: '600px' }}
    >
{/* Temporarily commented out CSS to test if it's interfering
      <style jsx global>{`
        .excalidraw-container .excalidraw,
        .excalidraw-container .excalidraw__canvas {
          pointer-events: auto !important;
        }
      `}</style>
      */}
      
      <Excalidraw
        excalidrawAPI={handleExcalidrawAPI}
        onChange={handleChange}
        viewModeEnabled={false}
      />
    </div>
  )
}