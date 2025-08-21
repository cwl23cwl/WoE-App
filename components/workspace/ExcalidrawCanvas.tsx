'use client'

import { useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useWorkspaceStore } from '@/stores/workspace'
import { useDebounce } from 'use-debounce'
import { WORKSPACE_DEFAULTS } from '@/lib/workspace-defaults'
import { HIGHLIGHTER_CONFIG, hexToRgba } from '@/lib/workspace-swatches'
// import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types'
type ExcalidrawImperativeAPI = any

// Import Excalidraw CSS
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

interface ExcalidrawCanvasProps {
  className?: string
}

export function ExcalidrawCanvas({ className = '' }: ExcalidrawCanvasProps) {
  const excalidrawRef = useRef<ExcalidrawImperativeAPI | null>(null)
  
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
    fillOpacity,
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
      }
    } else if (tool === 'highlighter') {
      return {
        color: strokeColor,
        opacity: Math.round(HIGHLIGHTER_CONFIG.opacity * 100), // Excalidraw uses 0-100
      }
    } else if (tool === 'text') {
      return {
        color: textColor,
        opacity: 100,
      }
    }
    return {
      color: strokeColor,
      opacity: 100,
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

  // Handle canvas changes
  const handleChange = useCallback((elements: any, appState: any, files: any) => {
    // Set saving state immediately
    setSaveState('saving')
    
    // Debounced save
    debouncedSave(elements, appState, files)
  }, [debouncedSave, setSaveState])

  // Get Excalidraw API reference
  const handleExcalidrawAPI = useCallback((api: ExcalidrawImperativeAPI) => {
    console.log('🎯 Excalidraw API initialized:', !!api)
    console.log('🔧 Current tool from store during API init:', tool)
    
    if (api) {
      console.log('🔧 Available API methods:', Object.keys(api).length)
      excalidrawRef.current = api
    }
  }, [tool])

  // Initial tool setup after API is available
  useEffect(() => {
    if (excalidrawRef.current) {
      const api = excalidrawRef.current
      
      // Map our tool names to Excalidraw tool names
      const toolMap = {
        select: 'selection',
        pencil: 'freedraw',
        highlighter: 'freedraw',
        text: 'text',
        eraser: 'eraser',
      } as const

      const excalidrawTool = toolMap[tool] || 'selection'
      
      // Use setTimeout to ensure API is fully ready
      const timer = setTimeout(() => {
        try {
          // Set tool
          api.setActiveTool({ type: excalidrawTool })
          console.log('✅ Successfully set tool to:', excalidrawTool)
          
          // Set initial appState for drawing
          api.updateScene({
            appState: {
              currentItemStrokeColor: strokeConfig.color,
              currentItemBackgroundColor: fillColor,
              currentItemStrokeWidth: tool === 'pencil' ? penWidth : 
                                    tool === 'highlighter' ? highlighterWidth :
                                    tool === 'text' ? shapeBorderWidth : 
                                    penWidth,
              currentItemOpacity: strokeConfig.opacity,
            }
          })
          console.log('✅ Successfully set initial appState')
        } catch (error) {
          console.error('❌ Failed to set tool/appState:', error)
        }
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [excalidrawRef.current, tool, strokeConfig, fillColor, penWidth, highlighterWidth, shapeBorderWidth])

  // Update tool settings when store changes
  useEffect(() => {
    if (excalidrawRef.current) {
      const api = excalidrawRef.current
      
      // Map our tool names to Excalidraw tool names
      const toolMap = {
        select: 'selection',
        pencil: 'freedraw',
        highlighter: 'freedraw', // Highlighter uses freedraw with special properties
        text: 'text',
        eraser: 'eraser',
      } as const

      const excalidrawTool = toolMap[tool] || 'selection'
      
      console.log('🔄 Updating Excalidraw tool:', excalidrawTool, 'from our tool:', tool)
      
      // Use setTimeout to avoid state issues
      setTimeout(() => {
        try {
          api.setActiveTool({ type: excalidrawTool })
          
          // Also update appState for the new tool
          api.updateScene({
            appState: {
              currentItemStrokeColor: strokeConfig.color,
              currentItemStrokeWidth: tool === 'pencil' ? penWidth : 
                                    tool === 'highlighter' ? highlighterWidth :
                                    tool === 'text' ? shapeBorderWidth : 
                                    penWidth,
              currentItemOpacity: strokeConfig.opacity,
            }
          })
          
          console.log('✅ Successfully updated tool to:', excalidrawTool)
        } catch (error) {
          console.error('❌ Failed to update tool:', error)
        }
      }, 50)
    }
  }, [tool, strokeConfig, penWidth, highlighterWidth, shapeBorderWidth])

  // Update stroke width when pen settings change
  useEffect(() => {
    if (excalidrawRef.current) {
      const api = excalidrawRef.current
      
      api.updateScene({
        appState: {
          currentItemStrokeWidth: tool === 'pencil' ? penWidth : 
                                 tool === 'highlighter' ? highlighterWidth :
                                 tool === 'text' ? shapeBorderWidth : 
                                 penWidth,
        },
      })
    }
  }, [penWidth, highlighterWidth, shapeBorderWidth, tool])

  // Update colors when color settings change
  useEffect(() => {
    if (excalidrawRef.current) {
      const api = excalidrawRef.current
      const strokeConfig = getStrokeConfig()
      
      // Update app state for new elements
      api.updateScene({
        appState: {
          currentItemStrokeColor: strokeConfig.color,
          currentItemBackgroundColor: fillColor,
          currentItemOpacity: strokeConfig.opacity,
        },
      })

      // Update selected elements with new colors
      const selectedElements = api.getAppState().selectedElementIds
      if (selectedElements && Object.keys(selectedElements).length > 0) {
        const elements = api.getSceneElements()
        const updatedElements = elements.map((element: any) => {
          if (selectedElements[element.id]) {
            // Update colors based on element type and current tool context
            const updatedElement = { ...element }
            
            // Update stroke color for all elements
            updatedElement.strokeColor = strokeConfig.color
            
            // Update opacity
            updatedElement.opacity = strokeConfig.opacity
            
            // Update text color for text elements
            if (element.type === 'text') {
              updatedElement.strokeColor = textColor
              updatedElement.opacity = 100 // Text should always be fully opaque
            }
            
            // Update background color for shapes (not for freedraw or text)
            if (element.type !== 'freedraw' && element.type !== 'text') {
              updatedElement.backgroundColor = fillColor
            }
            
            return updatedElement
          }
          return element
        })
        
        api.updateScene({
          elements: updatedElements,
        })
      }
    }
  }, [strokeColor, textColor, fillColor, fillOpacity, tool])

  return (
    <div className={`w-full h-full ${className}`} style={{ minHeight: '400px' }}>
      <Excalidraw
        excalidrawAPI={handleExcalidrawAPI}
        onChange={handleChange}
        initialData={initialData}
        viewModeEnabled={false}
        theme="light"
      />
    </div>
  )
}
