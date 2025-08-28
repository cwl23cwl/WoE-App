// apps/woe-app/app/workspace-editor/page.tsx - Migrated with enhanced text functionality
'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import ExcalidrawCanvasMinimal from '@/components/workspace/ExcalidrawCanvasMinimal'
import { TopToolbar } from '@/components/workspace/TopToolbar'  // This will use the enhanced AccordionToolbar
import { PageIndicator } from '@/components/workspace/PageIndicator'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore' // This is now the enhanced store

export default function WorkspaceEditorPage() {
  const [isCanvasReady, setIsCanvasReady] = useState(false)
  const excalidrawAPIRef = useRef<any>(null)

  // Get workspace store state and actions - now with enhanced text functionality
  const {
    pages,
    currentPageIndex,
    setExcalidrawAPI,
    jumpToPage,
    addPage,
    deletePage,
    duplicatePage,
    updateCurrentPage,
    // New text-related state
    activeTool,
    setActiveTool,
    selectedElementIds,
    setSelectedElementIds,
    editingTextId,
    setEditingTextId,
  } = useWorkspaceStore()

  // Get current page info
  const currentPage = pages[currentPageIndex]
  const [mounted, setMounted] = useState(false)

  // Fix hydration by ensuring client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle Excalidraw API with enhanced store integration
  const handleExcalidrawAPI = useCallback((api: any) => {
    console.log('Canvas: API received:', !!api)
    if (api) {
      excalidrawAPIRef.current = api
      
      // Store the API in the enhanced workspace store
      setExcalidrawAPI(api)
      
      setIsCanvasReady(true)
      
      // Load current page data if available - with proper mounting check
      if (currentPage && mounted) {
        // Use longer delay to ensure proper mounting
        setTimeout(() => {
          try {
            // Double-check that API is still available and component is mounted
            if (excalidrawAPIRef.current && mounted) {
              excalidrawAPIRef.current.updateScene({
                elements: currentPage.elements || [],
                appState: currentPage.appState || { zenModeEnabled: false }
              })
              console.log('Loaded page data:', currentPage.title)
            }
          } catch (error) {
            console.error('Failed to load page data:', error)
          }
        }, 300) // Increased delay for proper mounting
      }
      
      // Set initial tool with proper mounting check
      if (mounted) {
        setTimeout(() => {
          try {
            // Double-check mounting and API availability
            if (excalidrawAPIRef.current && mounted) {
              const excalidrawToolMap: Record<string, string> = {
                'select': 'selection',
                'draw': 'freedraw', 
                'text': 'text',
                'highlighter': 'freedraw',
                'erase': 'eraser',
                'shapes': 'rectangle'
              }
              
              const excalidrawTool = excalidrawToolMap[activeTool] || 'freedraw'
              excalidrawAPIRef.current.setActiveTool({ type: excalidrawTool })
              console.log(`Initial tool set to ${activeTool} (${excalidrawTool})`)
            }
          } catch (error) {
            console.error('Failed to set initial tool:', error)
          }
        }, 400) // Even longer delay for tool setting
      }
    }
  }, [setExcalidrawAPI, currentPage, activeTool, mounted]) // Added mounted as dependency

  // Enhanced canvas change handler with text selection tracking
  const handleCanvasChange = useCallback((elements: any[], appState: any) => {
    // Only proceed if component is mounted and canvas is ready
    if (!mounted || !isCanvasReady || !elements || !appState) {
      return
    }

    try {
      // Track text selection changes for the enhanced toolbar
      const selectedIds = Object.keys(appState?.selectedElementIds || {})
      if (JSON.stringify(selectedIds) !== JSON.stringify(selectedElementIds)) {
        setSelectedElementIds(selectedIds)
      }
      
      // Track text editing state
      const editingElement = appState?.editingElement
      if (editingElement !== editingTextId) {
        setEditingTextId(editingElement)
      }
      
      // Debounced save to store
      const timeoutId = setTimeout(() => {
        if (mounted) { // Check mounting again before saving
          updateCurrentPage(elements, appState)
        }
      }, 500)
      
      return () => clearTimeout(timeoutId)
    } catch (error) {
      console.error('Error in canvas change handler:', error)
    }
  }, [mounted, isCanvasReady, updateCurrentPage, selectedElementIds, setSelectedElementIds, editingTextId, setEditingTextId])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Unified Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              ✏️
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Assignment Workspace</h1>
              <div className="flex items-center gap-3">
                <div className={`text-sm ${isCanvasReady ? 'text-green-600' : 'text-orange-600'}`}>
                  {isCanvasReady ? '✅ Canvas Ready' : '⏳ Loading Canvas...'}
                </div>
                {/* Show current tool for debugging */}
                {mounted && (
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Tool: {activeTool}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Current page info */}
            {currentPage && mounted && (
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                Editing: <span className="font-medium">{currentPage.title}</span>
              </div>
            )}
            {/* Text selection status */}
            {selectedElementIds.length > 0 && (
              <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {selectedElementIds.length} selected
              </div>
            )}
            <div className="text-sm text-gray-600">
              Enhanced workspace with text tools
            </div>
          </div>
        </div>
      </header>

      {/* ENHANCED TOOLBAR - Now includes text accordion functionality */}
      <TopToolbar 
        onUndo={() => {
          if (excalidrawAPIRef.current) {
            try {
              excalidrawAPIRef.current.undo()
              console.log('Undo executed')
            } catch (error) {
              console.error('Undo failed:', error)
            }
          }
        }}
        onRedo={() => {
          if (excalidrawAPIRef.current) {
            try {
              excalidrawAPIRef.current.redo()
              console.log('Redo executed')
            } catch (error) {
              console.error('Redo failed:', error)
            }
          }
        }}
      />

      {/* PAGE INDICATOR SECTION */}
      <div className="bg-gradient-to-b from-white to-gray-50 border-b border-gray-100 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-6"></div>
          
          <div className="flex items-center justify-center relative pb-6">
            <PageIndicator
              index={currentPageIndex}
              count={pages.length}
              onJumpTo={jumpToPage}
            />
            
            <div className="absolute right-0 flex items-center gap-2">
              <button
                onClick={() => addPage()}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-white hover:shadow-sm rounded-md transition-all border border-gray-200 bg-white/60 backdrop-blur-sm"
                title="Add new page"
              >
                + Page
              </button>
              
              {pages.length > 1 && (
                <>
                  <button
                    onClick={() => duplicatePage(currentPageIndex)}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-white hover:shadow-sm rounded-md transition-all border border-gray-200 bg-white/60 backdrop-blur-sm"
                    title="Duplicate current page"
                  >
                    Duplicate
                  </button>
                  
                  <button
                    onClick={() => {
                      if (pages.length > 1 && window.confirm('Delete this page? This cannot be undone.')) {
                        deletePage(currentPageIndex)
                      }
                    }}
                    className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 hover:shadow-sm rounded-md transition-all border border-red-200 bg-white/60 backdrop-blur-sm"
                    title="Delete current page"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 canvas-wrapper" 
            style={{ 
              height: '600px',
              position: 'relative',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          >
            <ExcalidrawCanvasMinimal
              onExcalidrawAPI={handleExcalidrawAPI}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
      
      {/* Enhanced Status Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>Enhanced Workspace Editor with Text Tools</span>
            {mounted && currentPage && (
              <span className="text-gray-400">
                Page updated: {new Date(currentPage.updatedAt).toLocaleTimeString()}
              </span>
            )}
            {/* Text tool status */}
            {editingTextId && (
              <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
                Editing Text
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>
              Status: {isCanvasReady ? 'Ready for drawing & text' : 'Initializing...'}
            </span>
            <span className="text-gray-400">
              {pages.length} page{pages.length !== 1 ? 's' : ''} total
            </span>
            {selectedElementIds.length > 0 && (
              <span className="text-blue-600">
                {selectedElementIds.length} element{selectedElementIds.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
        </div>
      </footer>

      {/* Enhanced Canvas Styles */}
      <style jsx>{`
        .canvas-wrapper {
          /* Enhanced coordinate system stability */
          isolation: isolate;
          contain: layout style;
        }

        .canvas-wrapper :global(.excalidraw) {
          position: relative !important;
          width: 100% !important;
          height: 100% !important;
        }

        .canvas-wrapper :global(.App-canvas) {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          transform: none !important;
        }

        /* Prevent text selection conflicts */
        .canvas-wrapper :global(.excalidraw .App-canvas) {
          user-select: none;
        }

        /* Enhanced transitions */
        .bg-white {
          transition: all 0.2s ease;
        }

        /* Text editing mode styles */
        .canvas-wrapper.text-editing {
          outline: 2px solid #3b82f6;
          outline-offset: -2px;
        }

        /* Proper layering for text controls */
        .canvas-wrapper {
          z-index: 1;
        }
      `}</style>
    </div>
  )
}