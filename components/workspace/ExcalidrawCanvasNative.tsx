'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import React from 'react'

// Simple Error Boundary for debugging provider issues
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ExcalidrawCanvas Error Boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full bg-red-50 border-2 border-red-200">
          <div className="text-center p-6">
            <div className="text-red-600 text-lg font-semibold mb-2">
              ⚠️ Canvas Loading Error
            </div>
            <div className="text-red-500 text-sm mb-3">
              {this.state.error?.message || 'Unknown error occurred'}
            </div>
            <div className="text-red-400 text-xs">
              Check console for details. Your WoeExcalidraw fork may need additional setup.
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Type definitions for WoeExcalidraw integration
type WoeToolType = 'select' | 'draw' | 'text' | 'erase' | 'highlighter'

interface WoeExcalidrawAPI {
  updateScene: (updates: any) => void
  getSceneElements: () => any[]
  setActiveTool: (tool: any) => void
}

interface NonDeletedExcalidrawElement {
  id: string
  type: string
  [key: string]: any
}

interface AppState {
  editingTextElement?: { id: string } | null
  selectedElementIds: string[]
  currentItemStrokeColor?: string
  currentItemOpacity?: number
  currentItemStrokeWidth?: number
  currentItemFontSize?: number
  currentItemFontFamily?: string
  [key: string]: any
}

interface BinaryFiles {
  [key: string]: any
}

interface ExcalidrawCanvasNativeProps {
  className?: string
  maxWidth?: number
  maxHeight?: number
  minWidth?: number
  minHeight?: number
}

export function ExcalidrawCanvasNative({ 
  className = '',
  maxWidth = 16384,
  maxHeight = 16384,
  minWidth = 400,
  minHeight = 300
}: ExcalidrawCanvasNativeProps) {
  const [WoeExcalidraw, setWoeExcalidraw] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)
  const woeExcalidrawRef = useRef<any>(null)

  // Store access for tool synchronization - MUST be before early returns
  const { 
    setExcalidrawAPI, 
    activeTool, 
    setActiveTool,
    toolPrefs, 
    editingTextId, 
    selectedElementIds, 
    setEditingTextId, 
    setSelectedElementIds 
  } = useWorkspaceStore()

  // ALL useCallback hooks must be defined before early returns
  // Change handler - dramatically simplified
  const handleChange = useCallback((
    elements: readonly NonDeletedExcalidrawElement[], 
    appState: AppState, 
    files: BinaryFiles
  ) => {
    // Track text editing state changes
    const currentEditingTextId = appState.editingTextElement?.id || null
    const currentSelectedIds = appState.selectedElementIds || []
    
    // Smart tool sync: Keep text tool active when working with text
    const isEditingText = currentEditingTextId !== null
    const hasSelectedText = currentSelectedIds.length > 0 && elements.some((el: any) => 
      currentSelectedIds.includes(el.id) && el.type === 'text'
    )
    
    // Auto-switch to text tool when working with text
    if ((isEditingText || hasSelectedText) && activeTool !== 'text') {
      console.log('🔄 Auto-switching to text tool')
      setActiveTool('text')
    }
    
    // Update store states
    if (currentEditingTextId !== editingTextId) {
      setEditingTextId(currentEditingTextId)
    }
    
    if (JSON.stringify(currentSelectedIds) !== JSON.stringify(selectedElementIds)) {
      setSelectedElementIds(currentSelectedIds)
    }
  }, [editingTextId, activeTool, setEditingTextId, setSelectedElementIds, setActiveTool, selectedElementIds])

  // API handler - set up store integration
  const handleWoeExcalidrawAPI = useCallback((api: WoeExcalidrawAPI | null) => {
    woeExcalidrawRef.current = api
    
    if (api) {
      setExcalidrawAPI(api as any) // Bridge to existing store interface
      console.log('✅ WoeExcalidraw API initialized')
    }
  }, [setExcalidrawAPI])

  // Tool change handler from WoE system
  const handleToolChange = useCallback((woeTool: WoeToolType) => {
    console.log('🔧 WoE tool changed to:', woeTool)
    // Update store if needed (usually the store drives this)
    if (activeTool !== woeTool) {
      setActiveTool(woeTool)
    }
  }, [activeTool, setActiveTool])

  // Apply tool properties when tools/prefs change
  const applyToolProperties = useCallback(() => {
    if (!woeExcalidrawRef.current) return
    
    try {
      const updates: Partial<AppState> = {}
      
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
        woeExcalidrawRef.current.updateScene({ appState: updates as AppState })
      }
    } catch (error) {
      console.error('❌ Tool properties update failed:', error)
    }
  }, [activeTool, toolPrefs])

  // Ensure component only renders on client
  useEffect(() => {
    setIsClient(true)
    
    // Dynamically import WoeExcalidraw to avoid SSR issues
    const loadWoeExcalidraw = async () => {
      try {
        const module = await import('@woe/excalidraw')
        console.log('🔍 WoeExcalidraw module loaded:', module)
        console.log('📋 Available exports:', Object.keys(module))
        
        // Let's also check for nested properties and descriptors
        const allExports = Object.getOwnPropertyNames(module)
        console.log('🔎 All property names:', allExports)
        
        // Check every export more thoroughly for any provider-related functionality
        console.log('🔬 Detailed export analysis:')
        for (const exportName of allExports) {
          if (exportName.startsWith('_') || exportName === '__esModule') continue
          
          try {
            const exportValue = (module as any)[exportName]
            const exportType = typeof exportValue
            console.log(`  📤 ${exportName}: ${exportType}`)
            
            // Check if this export has provider-related properties
            if (exportType === 'object' || exportType === 'function') {
              const props = Object.getOwnPropertyNames(exportValue)
              const suspiciousProps = props.filter(prop => 
                prop.toLowerCase().includes('provider') ||
                prop.toLowerCase().includes('isolation') ||
                prop.toLowerCase().includes('scope') ||
                prop.toLowerCase().includes('context')
              )
              
              if (suspiciousProps.length > 0) {
                console.log(`    � ${exportName} has suspicious props:`, suspiciousProps)
              }
            }
          } catch (error) {
            console.log(`    ❌ Could not analyze ${exportName}:`, (error as Error).message)
          }
        }
        
        // Let's also check what the Excalidraw export contains
        if (module.WoeExcalidraw || module.Excalidraw) {
          const excalidrawComponent = module.WoeExcalidraw || module.Excalidraw
          console.log('🧩 Excalidraw component type:', typeof excalidrawComponent)
          console.log('🧩 Excalidraw component props:', Object.getOwnPropertyNames(excalidrawComponent))
          
          // Check if the component itself has provider properties
          if ((excalidrawComponent as any).Provider) {
            console.log('✅ Found Provider on Excalidraw component!')
            setWoeExcalidraw(() => excalidrawComponent)
            return
          }
        }
        
        // The error mentions jotai-scope and createIsolation
        // Let's check for jotai-scope related exports more thoroughly
        const possibleProviders = [
          'createIsolation',      // Direct jotai-scope function
          'JotaiScopeProvider',   // Possible custom wrapper
          'ScopeProvider',        // Generic scope provider
          'WoeProvider',          // Custom WoE provider
          'ExcalidrawProvider',   // Standard provider
          'Provider',             // Generic provider
          'IsolationProvider',    // Isolation-specific provider
          'createScope',          // Alternative scope creation
          'isolationScope',       // Pre-created scope
          'defaultScope'          // Default scope
        ]
        
        let foundProvider = null
        let providerName = ''
        
        for (const name of possibleProviders) {
          if ((module as any)[name]) {
            console.log(`✅ Found ${name} - will use as provider`)
            foundProvider = (module as any)[name]
            providerName = name
            break
          }
        }
        
        // If no obvious provider found, let's check if we can create an isolation context
        if (!foundProvider) {
          console.log('🔍 No obvious provider found, checking for createIsolation pattern...')
        
        // CRITICAL DISCOVERY: WoeExcalidraw fork has EditorJotaiProvider in editor-jotai.ts
        // Let's try to access it directly from the fork
        try {
          // Try to access the EditorJotaiProvider from WoeExcalidraw's editor-jotai module
          const editorJotaiPath = '@woe/excalidraw/editor-jotai'
          // @ts-ignore - Dynamic import path
          const editorJotai = await import(editorJotaiPath)
          console.log('📦 EditorJotai module loaded from WoeExcalidraw')
          console.log('🔧 EditorJotai exports:', Object.keys(editorJotai))
          
          if (editorJotai.EditorJotaiProvider) {
            console.log('🎯 Found EditorJotaiProvider from WoeExcalidraw!')
            setWoeExcalidraw(() => ({ 
              Component: module.WoeExcalidraw || module.Excalidraw,
              Provider: editorJotai.EditorJotaiProvider 
            }))
            return
          }
        } catch (editorJotaiError) {
          console.log('⚠️ Could not access EditorJotaiProvider:', (editorJotaiError as Error).message)
        }
          
          // CRITICAL: We must use the same jotai-scope instance that WoeExcalidraw uses!
          // The error shows WoeExcalidraw uses: ../woe-excalidraw/node_modules/jotai-scope
          // We need to access that exact instance, not our local one
          
          try {
            // First try to access jotai-scope through the WoeExcalidraw module path
            // This ensures we use the SAME jotai-scope instance
            const jotaiScopePath = '@woe/excalidraw/node_modules/jotai-scope'
            // @ts-ignore - Dynamic import path
            const jotaiScope = await import(jotaiScopePath)
            console.log('📦 jotai-scope imported from WoeExcalidraw path (CRITICAL - same instance)')
            console.log('🔧 WoeExcalidraw jotai-scope exports:', Object.keys(jotaiScope))
            
            if (jotaiScope.createIsolation) {
              console.log('🎯 Creating isolation context using WoeExcalidraw jotai-scope instance')
              const isolation = jotaiScope.createIsolation()
              console.log('✅ Isolation created from WoeExcalidraw jotai-scope:', isolation)
              
              setWoeExcalidraw(() => ({ 
                Component: module.WoeExcalidraw || module.Excalidraw,
                Provider: isolation.Provider 
              }))
              return
            }
          } catch (woeJotaiError) {
            console.log('⚠️ Could not import jotai-scope from WoeExcalidraw path:', woeJotaiError)
            
            // Fallback: try our local jotai-scope (this was failing before due to instance mismatch)
            try {
              // @ts-ignore - We're trying to access jotai-scope which may not be in our types
              const jotaiScope = await import('jotai-scope')
              console.log('📦 jotai-scope imported from local (may cause instance mismatch)')
              console.log('� Local jotai-scope exports:', Object.keys(jotaiScope))
              
              if (jotaiScope.createIsolation) {
                console.log('🎯 Creating isolation context for WoeExcalidraw (LOCAL - may fail)')
                const isolation = jotaiScope.createIsolation()
                console.log('✅ Local isolation created:', isolation)
                
                // The isolation returns { Provider, useStore, useAtom, etc. }
                setWoeExcalidraw(() => ({ 
                  Component: module.WoeExcalidraw || module.Excalidraw,
                  Provider: isolation.Provider 
                }))
                return
              }
            } catch (localJotaiError) {
              console.log('⚠️ Local jotai-scope import also failed:', localJotaiError)
            }
          }
        }
        
        if (foundProvider) {
          console.log(`🏗️ Using ${providerName} to wrap WoeExcalidraw`)
          
          // If it's createIsolation, we need to call it to create the provider
          if (providerName === 'createIsolation') {
            try {
              const isolation = foundProvider()
              console.log('🎯 Isolation created from module export')
              setWoeExcalidraw(() => ({ 
                Component: module.WoeExcalidraw || module.Excalidraw,
                Provider: isolation.Provider 
              }))
            } catch (error) {
              console.error('❌ Failed to create isolation provider:', error)
              setWoeExcalidraw(() => module.WoeExcalidraw || module.Excalidraw)
            }
          } else {
            setWoeExcalidraw(() => ({ 
              Component: module.WoeExcalidraw || module.Excalidraw,
              Provider: foundProvider 
            }))
          }
        } else {
          console.log('⚠️ No provider found - using component directly (may cause isolation errors)')
          setWoeExcalidraw(() => module.WoeExcalidraw || module.Excalidraw)
        }
      } catch (error) {
        console.error('❌ Failed to load WoeExcalidraw:', error)
      }
    }
    
    loadWoeExcalidraw()
  }, [])

  // Don't render anything on server or before WoeExcalidraw is loaded
  if (!isClient || !WoeExcalidraw) {
    return (
      <div 
        className={`w-full h-full ${className}`}
        style={{ minHeight: '600px' }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading canvas...</div>
        </div>
      </div>
    )
  }

  // Stable initial data
  const initialData = {
    elements: [],
    appState: {
      viewBackgroundColor: '#ffffff',
    },
  }

  // Map WoE APP tools to WoE tool system
  const mapToWoeTool = (tool: string): WoeToolType => {
    switch (tool) {
      case 'select': return 'select'
      case 'draw': return 'draw'
      case 'text': return 'text'
      case 'erase': return 'erase'
      case 'highlighter': return 'highlighter'
      default: return 'select'
    }
  }

  return (
    <div 
      className={`w-full h-full ${className}`}
      style={{ 
        minHeight: '600px',
        maxWidth: `${maxWidth}px`,
        maxHeight: `${maxHeight}px`,
        minWidth: `${minWidth}px`
      }}
    >
      {/* WoeExcalidraw should now have proper EditorJotaiProvider internally */}
      <WoeExcalidraw
        ref={handleWoeExcalidrawAPI}
        tools={{
          select: true,
          draw: true, 
          text: true,
          erase: true,
          highlighter: true,
        }}
        zoomConfig={{
          zoomLocked: true,
          lockedZoomValue: 100,
          allowBrowserZoom: true,
          blockInternalZoom: true,
        }}
        onChange={handleChange}
        onToolChange={handleToolChange}
        initialData={initialData}
        theme="light"
        detectScroll={true}
        handleKeyboardGlobally={false}
        autoFocus={false}
      />
    </div>
  )
}