'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useWorkspaceStore } from '@/stores/workspace'
import { useDebounce } from 'use-debounce'
import { HIGHLIGHTER_CONFIG } from '@/lib/workspace-swatches'

// Import Excalidraw CSS
import '@excalidraw/excalidraw/index.css'

// Dynamic import Excalidraw with no SSR
const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then((mod) => ({ default: mod.Excalidraw })),
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

interface ExcalidrawCanvasFixedProps {
  className?: string
}

export function ExcalidrawCanvasFixed({ className = '' }: ExcalidrawCanvasFixedProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null)
  
  const { 
    pages, 
    pageIndex, 
    tool, 
    penWidth, 
    highlighterWidth, 
    shapeBorderWidth,
    strokeColor,
    textColor,
    fillColor,
    setSceneForPage, 
    setSaveState 
  } = useWorkspaceStore()

  // Get current page data
  const currentPage = pages[pageIndex]
  
  // Determine stroke color and opacity based on tool
  const getStrokeConfig = () => {
    if (tool === 'pencil') {
      return {
        color: strokeColor,
        opacity: 100,
        roughness: 1,
      }
    } else if (tool === 'highlighter') {
      return {
        color: strokeColor,
        opacity: Math.round(HIGHLIGHTER_CONFIG.opacity * 100),
        roughness: 0,
      }
    } else if (tool === 'text') {
      return {
        color: textColor,
        opacity: 100,
        roughness: 1,
      }
    }
    return {
      color: strokeColor,
      opacity: 100,
      roughness: 1,
    }
  }

  const strokeConfig = getStrokeConfig()
  
  // Simplified initialData to prevent drawing issues
  const initialData = currentPage?.scene || {
    elements: [],
    appState: {
      viewBackgroundColor: '#ffffff',
    },
  }

  // Debounced save function
  const [debouncedSave] = useDebounce((elements: any, appState: any, files: any) => {
    if (currentPage) {
      const sceneData = {
        elements,
        appState,
        files,
      }
      
      setSceneForPage(pageIndex, sceneData)
      setSaveState('saved')
    }
  }, 800)

  // Handle canvas changes with diagnostics
  const handleChange = useCallback((elements: any, appState: any, files: any) => {
    const elementCount = elements.length
    console.log('📝 onChange fired - elements:', elementCount, 'items')
    
    // Log element count delta
    if ((window as any).lastElementCount !== undefined) {
      const delta = elementCount - (window as any).lastElementCount
      if (delta !== 0) {
        console.log('📊 Element delta:', delta > 0 ? `+${delta}` : delta)
      }
    }
    (window as any).lastElementCount = elementCount

    // Set saving state immediately
    setSaveState('saving')
    
    // Debounced save
    debouncedSave(elements, appState, files)
  }, [debouncedSave, setSaveState])

  // Tool change handler
  const handleToolChange = useCallback((toolType: string) => {
    if (excalidrawAPI) {
      console.log('🔧 Setting active tool to:', toolType)
      
      // Small delay to ensure API is ready for updates
      setTimeout(() => {
        try {
          // Map our tool names to Excalidraw tool names
          const toolMap: Record<string, string> = {
            select: 'selection',
            pencil: 'freedraw',
            highlighter: 'freedraw', // Highlighter uses freedraw with special properties
            text: 'text',
            eraser: 'eraser',
          }

          const excalidrawTool = toolMap[toolType] || 'selection'
          const toolSettings = getToolSettings(toolType)
          const currentWidth = toolType === 'pencil' ? penWidth : 
                             toolType === 'highlighter' ? highlighterWidth :
                             toolType === 'text' ? shapeBorderWidth : 
                             penWidth

          // Update the tool
          excalidrawAPI.setActiveTool({ type: excalidrawTool })
          
          // Update app state for better tool switching
          const currentAppState = excalidrawAPI.getAppState()
          excalidrawAPI.updateScene({
            appState: {
              ...currentAppState,
              activeTool: { type: excalidrawTool },
              currentItemStrokeWidth: currentWidth,
              ...toolSettings,
            }
          })
          
          console.log('✅ setActiveTool completed successfully')
          console.log('📊 Current active tool:', excalidrawAPI.getAppState()?.activeTool?.type)
        } catch (error) {
          console.error('❌ setActiveTool error:', error)
        }
      }, 10) // Very small delay to ensure API readiness
    }
  }, [excalidrawAPI, strokeConfig, penWidth, highlighterWidth, shapeBorderWidth])

  const getToolSettings = (toolType: string) => {
    const config = getStrokeConfig()
    return {
      currentItemStrokeColor: config.color,
      currentItemBackgroundColor: fillColor,
      currentItemOpacity: config.opacity,
      currentItemRoughness: config.roughness,
    }
  }

  // Get Excalidraw API reference with diagnostics
  const handleExcalidrawAPIReady = useCallback((api: any) => {
    console.log('🚀 Excalidraw API ready:', api)
    setExcalidrawAPI(api)
    
    // Delay initialization to ensure component is fully mounted
    setTimeout(() => {
      try {
        const config = getStrokeConfig()
        api.updateScene({ 
          appState: { 
            viewBackgroundColor: '#ffffff',
            // Set initial drawing defaults
            currentItemStrokeColor: config.color,
            currentItemBackgroundColor: fillColor,
            currentItemStrokeWidth: penWidth,
            currentItemRoughness: config.roughness,
            currentItemOpacity: config.opacity,
            // Ensure editor is editable
            viewModeEnabled: false,
            zenModeEnabled: false,
          } 
        })
        console.log('✅ Initial app state set successfully')
      } catch (error) {
        console.error('❌ updateScene error:', error)
      }
    }, 100) // Small delay to ensure mounting is complete
  }, [strokeConfig, fillColor, penWidth])

  // Handle Tab key for text indentation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && excalidrawAPI) {
        const appState = excalidrawAPI.getAppState()
        const elements = excalidrawAPI.getSceneElements()
        
        // Check if we're in text editing mode
        const editingElement = elements.find((el: any) => el.id === appState.editingElement)
        if (editingElement && editingElement.type === 'text') {
          e.preventDefault()
          console.log('🔤 Tab intercepted in text mode')
          
          // Insert spaces (4 spaces for tab)
          const textElement = editingElement
          const currentText = textElement.text || ''
          const spaces = '    ' // 4 spaces for tab
          
          // Simple approach - add spaces to end
          const updatedText = currentText + spaces
          
          // Update the text element
          const updatedElements = elements.map((el: any) => {
            if (el.id === editingElement.id) {
              return { ...el, text: updatedText }
            }
            return el
          })
          
          excalidrawAPI.updateScene({ elements: updatedElements })
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [excalidrawAPI])

  // Update tool when store changes
  useEffect(() => {
    handleToolChange(tool)
  }, [tool, handleToolChange])

  // Update stroke width when pen settings change
  useEffect(() => {
    if (excalidrawAPI) {
      const currentWidth = tool === 'pencil' ? penWidth : 
                         tool === 'highlighter' ? highlighterWidth :
                         tool === 'text' ? shapeBorderWidth : 
                         penWidth

      const currentAppState = excalidrawAPI.getAppState()
      excalidrawAPI.updateScene({
        appState: {
          ...currentAppState,
          currentItemStrokeWidth: currentWidth,
        },
      })

      // Also update selected elements
      const selectedElements = excalidrawAPI.getSceneElements().filter((el: any) => el.isSelected)
      if (selectedElements.length > 0) {
        const updatedElements = excalidrawAPI.getSceneElements().map((el: any) => {
          if (el.isSelected) {
            return { ...el, strokeWidth: currentWidth }
          }
          return el
        })
        excalidrawAPI.updateScene({ elements: updatedElements })
      }
    }
  }, [excalidrawAPI, penWidth, highlighterWidth, shapeBorderWidth, tool])

  // Update colors when color settings change
  useEffect(() => {
    if (excalidrawAPI) {
      const config = getStrokeConfig()
      
      // Update app state for new elements
      const currentAppState = excalidrawAPI.getAppState()
      excalidrawAPI.updateScene({
        appState: {
          ...currentAppState,
          currentItemStrokeColor: config.color,
          currentItemBackgroundColor: fillColor,
          currentItemOpacity: config.opacity,
          currentItemRoughness: config.roughness,
        },
      })

      // Update selected elements with new colors
      const selectedElements = excalidrawAPI.getSceneElements().filter((el: any) => el.isSelected)
      if (selectedElements.length > 0) {
        const updatedElements = excalidrawAPI.getSceneElements().map((el: any) => {
          if (el.isSelected) {
            const updatedElement = { ...el }
            
            // Update stroke color
            updatedElement.strokeColor = config.color
            updatedElement.opacity = config.opacity
            
            // Update text color for text elements
            if (el.type === 'text') {
              updatedElement.strokeColor = textColor
              updatedElement.opacity = 100
            }
            
            // Update background color for shapes
            if (el.type !== 'freedraw' && el.type !== 'text') {
              updatedElement.backgroundColor = fillColor
            }
            
            return updatedElement
          }
          return el
        })
        
        excalidrawAPI.updateScene({ elements: updatedElements })
      }
    }
  }, [excalidrawAPI, strokeColor, textColor, fillColor, tool])

  return (
    <div className={`w-full h-full ${className}`} style={{ minHeight: '400px' }}>
      {/* Hide native toolbar and ensure pointer events */}
      <style jsx>{`
        .excalidraw-container :global(.App-toolbar) {
          display: none !important;
        }
        .excalidraw-container :global(.App-toolbar-content) {
          display: none !important;
        }
        .excalidraw-container :global(.excalidraw) {
          pointer-events: auto !important;
        }
        .excalidraw-container :global(.excalidraw .excalidraw-wrapper) {
          pointer-events: auto !important;
        }
      `}</style>
      <div className="excalidraw-container w-full h-full">
        <Excalidraw
          excalidrawAPI={handleExcalidrawAPIReady}
          onChange={handleChange}
          initialData={initialData}
          viewModeEnabled={false}
          theme="light"
          UIOptions={{
            canvasActions: {
              toggleTheme: false,
              saveToActiveFile: false,
              loadScene: false,
              export: false,
            },
          }}
        />
      </div>
    </div>
  )
}