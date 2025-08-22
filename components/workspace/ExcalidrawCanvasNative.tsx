'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

// Import Excalidraw CSS
import '@excalidraw/excalidraw/index.css'

// Text box creation fix: Enhanced component with state tracking and reset functionality

interface ExcalidrawCanvasNativeProps {
  className?: string
}

export function ExcalidrawCanvasNative({ className = '' }: ExcalidrawCanvasNativeProps) {
  const excalidrawRef = useRef<any>(null)
  
  // Store access for tool synchronization
  const { 
    setExcalidrawAPI, 
    activeTool, 
    toolPrefs, 
    editingTextId, 
    selectedElementIds, 
    setEditingTextId, 
    setSelectedElementIds 
  } = useWorkspaceStore()

  // Stable initialData
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

  // Change handler with state tracking
  const handleChange = useCallback((elements: any, appState: any, files: any) => {
    // Track text editing state changes
    const currentEditingTextId = appState.editingElement?.id || null
    const currentSelectedIds = appState.selectedElementIds || []
    
    // Update store if text editing state has changed
    if (currentEditingTextId !== editingTextId) {
      setEditingTextId(currentEditingTextId)
    }
    
    // Update store if selection has changed
    if (JSON.stringify(currentSelectedIds) !== JSON.stringify(selectedElementIds)) {
      setSelectedElementIds(currentSelectedIds)
    }
  }, [editingTextId, selectedElementIds, setEditingTextId, setSelectedElementIds])

  // API handler with tool setup
  const handleExcalidrawAPI = useCallback((api: any) => {
    excalidrawRef.current = api
    
    if (api) {
      setExcalidrawAPI(api)
      
      // Set initial tool after delay
      setTimeout(() => {
        try {
          const excalidrawTool = mapToolToExcalidraw(activeTool)
          api.setActiveTool({ type: excalidrawTool })
        } catch (error) {
          console.error('❌ Initial tool setup failed:', error)
        }
      }, 100)
    }
  }, [setExcalidrawAPI, activeTool])

  // Tool synchronization
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

  // Text tool reset handling
  useEffect(() => {
    if (excalidrawRef.current && activeTool === 'text') {
      if (!editingTextId && selectedElementIds.length === 0) {
        try {
          excalidrawRef.current.setActiveTool({ type: 'text' })
        } catch (error) {
          console.error('❌ Text tool refresh failed:', error)
        }
      }
    }
  }, [activeTool, editingTextId, selectedElementIds])

  // Tool properties handling
  useEffect(() => {
    if (excalidrawRef.current && activeTool) {
      try {
        const updates: any = {}
        
        if (activeTool === 'highlighter') {
          updates.currentItemStrokeColor = toolPrefs.highlighterColor || '#FACC15'
          updates.currentItemOpacity = (toolPrefs.highlighterOpacity || 0.3) * 100
          updates.currentItemStrokeWidth = toolPrefs.highlighterSize || 12
        } else if (activeTool === 'draw') {
          updates.currentItemStrokeColor = toolPrefs.drawColor || '#000000'
          updates.currentItemOpacity = 100
          updates.currentItemStrokeWidth = toolPrefs.drawSize || 4
        } else if (activeTool === 'text') {
          updates.currentItemStrokeColor = toolPrefs.textColor || '#000000'
          updates.currentItemFontSize = toolPrefs.textSize || 24
          updates.currentItemFontFamily = toolPrefs.textFamily || '"Times New Roman", Georgia, serif'
        }
        
        if (Object.keys(updates).length > 0) {
          excalidrawRef.current.updateScene({ appState: updates })
        }
      } catch (error) {
        console.error('❌ Tool properties update failed:', error)
      }
    }
  }, [activeTool, toolPrefs.highlighterColor, toolPrefs.highlighterOpacity, toolPrefs.highlighterSize, toolPrefs.drawColor, toolPrefs.drawSize, toolPrefs.textColor, toolPrefs.textSize, toolPrefs.textFamily])

  return (
    <div 
      className={`w-full h-full ${className}`} 
      style={{ minHeight: '600px' }}
    >
      <Excalidraw
        excalidrawAPI={handleExcalidrawAPI}
        onChange={handleChange}
        initialData={initialData}
        viewModeEnabled={false}
        UIOptions={{
          canvasActions: {
            saveToActiveFile: false,
            loadScene: false,
            export: false,
            toggleTheme: false,
            clearCanvas: false
          },
          tools: {
            image: false
          }
        }}
        renderTopRightUI={() => null}
        renderFooter={() => null}
        renderSidebar={() => null}
      />
      <style jsx global>{`
        .excalidraw .layer-ui__wrapper > * {
          display: none !important;
        }
        .excalidraw .layer-ui__wrapper {
          pointer-events: none !important;
        }
        .excalidraw .Island {
          display: none !important;
        }
        .excalidraw [data-testid*="toolbar"] {
          display: none !important;
        }
        .excalidraw [data-testid="tools-panel"] {
          display: none !important;
        }
        .excalidraw .App-toolbar {
          display: none !important;
        }
        .excalidraw .App-bottom-bar {
          display: none !important;
        }
      `}</style>
    </div>
  )
}