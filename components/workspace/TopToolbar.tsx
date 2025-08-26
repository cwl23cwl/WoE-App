// components/workspace/TopToolbar.tsx - Fixed for Store Integration
'use client'

import React, { useCallback, useState } from 'react'
import { 
  MousePointer2, 
  Pen, 
  Highlighter, 
  Type, 
  Eraser, 
  Shapes,
  RotateCcw,
  RotateCw,
  Save,
  ChevronDown
} from 'lucide-react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { AccordionToolbar } from './AccordionToolbar'

interface TopToolbarProps {
  onUndo?: () => void
  onRedo?: () => void
  onLibraryOpen?: () => void
}

interface Tool {
  id: 'select' | 'draw' | 'highlighter' | 'text' | 'erase' | 'shapes'
  icon: React.ComponentType<any>
  label: string
  color: string
  excalidrawType: string
  description: string
  hasAccordion: boolean
}

const tools: Tool[] = [
  { 
    id: 'select', 
    icon: MousePointer2, 
    label: 'Select', 
    color: 'text-blue-600',
    excalidrawType: 'selection',
    description: 'Select and move objects',
    hasAccordion: false
  },
  { 
    id: 'draw', 
    icon: Pen, 
    label: 'Draw', 
    color: 'text-gray-700',
    excalidrawType: 'freedraw', 
    description: 'Draw with pencil',
    hasAccordion: true
  },
  { 
    id: 'highlighter', 
    icon: Highlighter, 
    label: 'Highlight', 
    color: 'text-yellow-600',
    excalidrawType: 'freedraw',
    description: 'Highlight important parts',
    hasAccordion: true
  },
  { 
    id: 'text', 
    icon: Type, 
    label: 'Text', 
    color: 'text-green-600',
    excalidrawType: 'text',
    description: 'Add text',
    hasAccordion: true
  },
  { 
    id: 'erase', 
    icon: Eraser, 
    label: 'Erase', 
    color: 'text-red-600',
    excalidrawType: 'eraser',
    description: 'Remove drawings',
    hasAccordion: false
  },
  { 
    id: 'shapes', 
    icon: Shapes, 
    label: 'Shapes', 
    color: 'text-purple-600',
    excalidrawType: 'rectangle',
    description: 'Draw shapes',
    hasAccordion: true
  }
]

export function TopToolbar({ onUndo, onRedo, onLibraryOpen }: TopToolbarProps) {
  const {
    // Current state
    activeTool,
    setActiveTool,
    saveState,
    canUndo,
    canRedo,
    
    // Excalidraw integration - GET FROM STORE
    excalidrawAPI,
    toolPrefs,
    
    // Store actions
    undo,
    redo,
    resetTextTool
  } = useWorkspaceStore()

  // Accordion state
  const [expandedTool, setExpandedTool] = useState<string | null>(null)

  // Tool selection with API integration
  const handleToolSelect = useCallback((tool: Tool) => {
    console.log(`🔧 TopToolbar: Switching to ${tool.label} tool`)
    
    try {
      // Configure tool with preferences
      if (excalidrawAPI) {
        const toolConfig: any = { type: tool.excalidrawType }
        
        // Apply tool-specific configurations
        if (tool.id === 'draw' && toolPrefs.drawColor) {
          excalidrawAPI.updateScene({
            appState: {
              currentItemStrokeColor: toolPrefs.drawColor,
              currentItemStrokeWidth: toolPrefs.drawSize || 4,
              currentItemOpacity: 100,
              currentItemStrokeStyle: 'solid', // Always use solid lines
              currentItemRoughness: 0 // Always smooth
            }
          })
        } else if (tool.id === 'highlighter' && toolPrefs.highlighterColor) {
          excalidrawAPI.updateScene({
            appState: {
              currentItemStrokeColor: toolPrefs.highlighterColor,
              currentItemStrokeWidth: toolPrefs.highlighterSize || 12,
              currentItemOpacity: Math.round((toolPrefs.highlighterOpacity || 0.3) * 100),
              currentItemStrokeStyle: 'solid', // Always use solid lines
              currentItemRoughness: 0 // Always smooth
            }
          })
        } else if (tool.id === 'text' && toolPrefs.textColor) {
          excalidrawAPI.updateScene({
            appState: {
              currentItemStrokeColor: toolPrefs.textColor,
              currentItemFontSize: toolPrefs.textSize || 24,
              currentItemStrokeStyle: 'solid' // Always use solid lines
            }
          })
        }
        
        excalidrawAPI.setActiveTool(toolConfig)
      } else {
        console.warn('⚠️ TopToolbar: Excalidraw API not available')
      }

      // Update store state
      setActiveTool(tool.id)
      console.log(`✅ TopToolbar: ${tool.label} tool configured successfully`)
      
    } catch (error) {
      console.error(`❌ TopToolbar: Failed to configure ${tool.label} tool:`, error)
      // Fallback to store-only update
      setActiveTool(tool.id)
    }
  }, [excalidrawAPI, toolPrefs, setActiveTool])

  // Handle tool button click with accordion logic
  const handleToolClick = useCallback((tool: Tool) => {
    // Always select the tool first
    handleToolSelect(tool)
    
    if (tool.hasAccordion) {
      // If clicking the same active tool, toggle accordion
      if (activeTool === tool.id && expandedTool === tool.id) {
        setExpandedTool(null)
      } else {
        // Show accordion for this tool
        setExpandedTool(tool.id)
      }
      
      // Fix coordinate precision after accordion animation
      setTimeout(() => {
        if (excalidrawAPI) {
          try {
            // Force coordinate system refresh
            const event = new Event('resize', { bubbles: true })
            window.dispatchEvent(event)
            
            // Additional coordinate fix
            setTimeout(() => {
              const currentState = excalidrawAPI.getAppState()
              excalidrawAPI.updateScene({
                appState: {
                  ...currentState,
                  // Force coordinate recalculation
                  timestamp: Date.now()
                }
              })
            }, 50)
          } catch (error) {
            console.warn('Coordinate refresh failed:', error)
          }
        }
      }, 600) // After accordion animation completes
      
    } else {
      // Non-accordion tools close any open accordion
      setExpandedTool(null)
      
      // Special handling for certain tools
      if (tool.id === 'text') {
        resetTextTool?.()
      }
    }
  }, [activeTool, expandedTool, handleToolSelect, resetTextTool, excalidrawAPI])

  // Undo with API integration
  const handleUndo = useCallback(() => {
    console.log('↶ TopToolbar: Undo action')
    
    if (excalidrawAPI) {
      try {
        excalidrawAPI.undo()
        console.log('✅ TopToolbar: Excalidraw undo executed')
      } catch (error) {
        console.error('❌ TopToolbar: Excalidraw undo failed:', error)
      }
    }
    
    // Also call store undo and any external handler
    undo()
    onUndo?.()
  }, [excalidrawAPI, undo, onUndo])

  // Redo with API integration
  const handleRedo = useCallback(() => {
    console.log('↷ TopToolbar: Redo action')
    
    if (excalidrawAPI) {
      try {
        excalidrawAPI.redo()
        console.log('✅ TopToolbar: Excalidraw redo executed')
      } catch (error) {
        console.error('❌ TopToolbar: Excalidraw redo failed:', error)
      }
    }
    
    // Also call store redo and any external handler  
    redo()
    onRedo?.()
  }, [excalidrawAPI, redo, onRedo])

  // Get tool preview color for visual indication
  const getToolPreviewColor = (tool: Tool) => {
    if (!tool.hasAccordion) return undefined
    
    switch (tool.id) {
      case 'draw':
        return toolPrefs.drawColor || '#111827'
      case 'highlighter':
        return toolPrefs.highlighterColor || '#FFF176'
      case 'text':
        return toolPrefs.textColor || '#111827'
      default:
        return undefined
    }
  }

  return (
    <div className="toolbar-container">
      {/* Main Toolbar */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-40" data-toolbar="true">
        <div className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
          
          {/* LEFT SECTION: Undo/Redo */}
          <div className="flex items-center gap-2" role="group" aria-label="History actions">
            <button 
              className={`p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                canUndo 
                  ? 'hover:bg-gray-100 text-gray-700' 
                  : 'opacity-40 cursor-not-allowed text-gray-400'
              }`}
              aria-label="Undo last action"
              disabled={!canUndo}
              onClick={handleUndo}
            >
              <RotateCcw className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
            </button>
            
            <button 
              className={`p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                canRedo 
                  ? 'hover:bg-gray-100 text-gray-700' 
                  : 'opacity-40 cursor-not-allowed text-gray-400'
              }`}
              aria-label="Redo last action"
              disabled={!canRedo}
              onClick={handleRedo}
            >
              <RotateCw className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

          {/* CENTER SECTION: Drawing Tools */}
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl" role="group" aria-label="Drawing tools">
            {tools.map((tool) => {
              const Icon = tool.icon
              const isActive = activeTool === tool.id
              const previewColor = getToolPreviewColor(tool)
              const hasExpandedAccordion = expandedTool === tool.id
              
              return (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool)}
                  className={`
                    flex flex-col items-center justify-center px-4 py-3 rounded-lg text-xs font-medium
                    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 relative group
                    ${isActive 
                      ? `bg-white shadow-sm ${tool.color} ring-1 ring-gray-200` 
                      : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-gray-700'
                    }
                    ${hasExpandedAccordion ? 'ring-2 ring-blue-300 bg-blue-50' : ''}
                  `}
                  aria-label={`${tool.label} tool`}
                  aria-pressed={isActive}
                  title={tool.description}
                >
                  <div className="flex items-center justify-center mb-1 relative">
                    <Icon className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
                    
                    {/* Color preview dot */}
                    {previewColor && (
                      <div 
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: previewColor }}
                      />
                    )}
                    
                    {/* Accordion indicator */}
                    {tool.hasAccordion && (
                      <ChevronDown 
                        className={`absolute -bottom-1 -right-1 w-3 h-3 transition-transform duration-200 ${
                          hasExpandedAccordion ? 'rotate-180 text-blue-600' : 'text-gray-400'
                        }`} 
                        strokeWidth={2}
                      />
                    )}
                  </div>
                  <span className="hidden sm:block">{tool.label}</span>
                </button>
              )
            })}
          </div>

          {/* RIGHT SECTION: Save Status */}
          <div className="flex items-center">
            <div 
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${saveState === 'saved' 
                  ? 'text-green-700 bg-green-50 border border-green-200' :
                  saveState === 'saving' 
                  ? 'text-blue-700 bg-blue-50 border border-blue-200' :
                  saveState === 'unsaved' 
                  ? 'text-amber-700 bg-amber-50 border border-amber-200' :
                  'text-red-700 bg-red-50 border border-red-200'
                }
              `}
              role="status"
              aria-live="polite"
            >
              <Save 
                className={`w-4 h-4 ${saveState === 'saving' ? 'animate-pulse' : ''}`} 
                aria-hidden="true" 
              />
              <span>
                {saveState === 'saved' && 'Saved'}
                {saveState === 'saving' && 'Saving...'}
                {saveState === 'unsaved' && 'Unsaved'}
                {saveState === 'error' && 'Save Error'}
              </span>
            </div>
          </div>

        </div>
      </nav>

      {/* Fixed Height Accordion Container - Prevents jumping */}
      <div className="accordion-container bg-white border-b border-gray-100 sticky top-[73px] z-30">
        <AccordionToolbar
          toolType={expandedTool as 'draw' | 'highlighter' | 'text' | 'shapes'}
          isExpanded={!!expandedTool}
        />
      </div>

      {/* Canvas Buffer Zone - Pushes canvas down to prevent interference */}
      <div className="canvas-buffer h-8 bg-gradient-to-b from-gray-50 to-white" />

      {/* Smooth Animation Styles */}
      <style jsx>{`
        .toolbar-container {
          position: relative;
        }

        .accordion-container {
          height: 90px; /* Increased height for more space */
          overflow: hidden;
          transition: none; /* Let the inner component handle transitions */
        }

        .canvas-buffer {
          position: relative;
          z-index: 5;
        }
      `}</style>
    </div>
  )
}