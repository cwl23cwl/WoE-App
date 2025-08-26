// app/workspace-editor/page.tsx - Enhanced with integrated page indicator
'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import ExcalidrawCanvasMinimal from '@/components/workspace/ExcalidrawCanvasMinimal'
import { TopToolbar } from '@/components/workspace/TopToolbar'  // Your existing full toolbar
import { PageIndicator } from '@/components/workspace/PageIndicator'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

export default function WorkspaceEditorPage() {
  const [isCanvasReady, setIsCanvasReady] = useState(false)
  const excalidrawAPIRef = useRef<any>(null)

  // Get workspace store state and actions
  const {
    pages,
    currentPageIndex,
    setExcalidrawAPI,
    jumpToPage,
    addPage,
    deletePage,
    duplicatePage,
    updateCurrentPage
  } = useWorkspaceStore()

  // Get current page info
  const currentPage = pages[currentPageIndex]
  const [mounted, setMounted] = useState(false)

  // Fix hydration by ensuring client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle Excalidraw API with store integration
  const handleExcalidrawAPI = useCallback((api: any) => {
    console.log('Canvas: API received:', !!api)
    if (api) {
      excalidrawAPIRef.current = api
      
      // Store the API in the workspace store so TopToolbar can access it
      setExcalidrawAPI(api)
      
      setIsCanvasReady(true)
      
      // Load current page data if available
      if (currentPage) {
        setTimeout(() => {
          try {
            api.updateScene({
              elements: currentPage.elements || [],
              appState: currentPage.appState || { zenModeEnabled: false }
            })
            console.log('Loaded page data:', currentPage.title)
          } catch (error) {
            console.error('Failed to load page data:', error)
          }
        }, 100)
      }
      
      // Set initial tool
      setTimeout(() => {
        try {
          api.setActiveTool({ type: 'freedraw' })
          console.log('Initial tool set to draw')
        } catch (error) {
          console.error('Failed to set initial tool:', error)
        }
      }, 200)
    }
  }, [setExcalidrawAPI, currentPage])

  // Auto-save current page when canvas changes
  const handleCanvasChange = useCallback((elements: any[], appState: any) => {
    if (isCanvasReady && elements && appState) {
      // Debounced save to store
      const timeoutId = setTimeout(() => {
        updateCurrentPage(elements, appState)
      }, 500)
      
      return () => clearTimeout(timeoutId)
    }
  }, [isCanvasReady, updateCurrentPage])

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
              <div className={`text-sm ${isCanvasReady ? 'text-green-600' : 'text-orange-600'}`}>
                {isCanvasReady ? '✅ Canvas Ready' : '⏳ Loading Canvas...'}
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
            <div className="text-sm text-gray-600">
              Universal workspace for all assignments
            </div>
          </div>
        </div>
      </header>

      {/* UNIFIED TOOLBAR - Use your existing full toolbar */}
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

      {/* PAGE INDICATOR SECTION - Positioned between accordion and canvas */}
      <div className="bg-gradient-to-b from-white to-gray-50 border-b border-gray-100 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Spacer for visual breathing room */}
          <div className="h-6"></div>
          
          {/* Page Indicator Container */}
          <div className="flex items-center justify-center relative pb-6">
            {/* Page Indicator - centered */}
            <PageIndicator
              index={currentPageIndex}
              count={pages.length}
              onJumpTo={jumpToPage}
            />
            
            {/* Page Management Controls - positioned on right */}
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
              // Ensure stable positioning for coordinates
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
      
      {/* Status Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>Workspace Editor - Consistent across all assignments</span>
            {mounted && currentPage && (
              <span className="text-gray-400">
                Page updated: {new Date(currentPage.updatedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>
              Status: {isCanvasReady ? 'Ready for drawing' : 'Initializing...'}
            </span>
            <span className="text-gray-400">
              {pages.length} page{pages.length !== 1 ? 's' : ''} total
            </span>
          </div>
        </div>
      </footer>

      {/* Canvas Coordinate Fix Styles */}
      <style jsx>{`
        .canvas-wrapper {
          /* Prevent coordinate system issues */
          isolation: isolate;
        }

        /* Force coordinate recalculation on layout changes */
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

        /* Smooth transitions for page indicator section */
        .bg-white {
          transition: all 0.2s ease;
        }

        /* Ensure proper layering */
        .canvas-wrapper {
          z-index: 1;
        }
      `}</style>
    </div>
  )
}