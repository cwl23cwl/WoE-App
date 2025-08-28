/**
 * Simplified WoE Workspace Store
 * 
 * Streamlined state management using the WoeToolManager
 * Reduces complexity and eliminates mapping conflicts
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { getWoeToolManager, type WoeToolType, type WoeToolPrefs, DEFAULT_TOOL_PREFS } from '@/lib/woe-tool-manager'
import type { WoeExcalidrawAPI } from '@/components/workspace/WoeExcalidraw'

// Simplified page structure
export interface WoeWorkspacePage {
  id: string
  scene: any
  thumbnail?: string
}

// Core workspace state - much simpler than original
export interface WoeWorkspaceState {
  // Canvas API reference
  excalidrawAPI: WoeExcalidrawAPI | null
  
  // Page management
  pages: WoeWorkspacePage[]
  currentPageIndex: number
  
  // Save state
  saveState: 'saved' | 'saving' | 'unsaved' | 'error'
  isDirty: boolean
  
  // UI state
  textDrawerOpen: boolean
  
  // Canvas state
  canUndo: boolean
  canRedo: boolean
  
  // Text editing state
  selectedElementIds: string[]
  editingTextId: string | null
  
  // Recent colors for quick access
  recentColors: string[]
}

export interface WoeWorkspaceActions {
  // API management
  setExcalidrawAPI: (api: WoeExcalidrawAPI | null) => void
  
  // Tool management (delegates to WoeToolManager)
  setActiveTool: (tool: WoeToolType) => void
  getActiveTool: () => WoeToolType
  resetTextTool: () => void
  
  // Tool preferences (delegates to WoeToolManager)
  updateToolPrefs: (updates: Partial<WoeToolPrefs>) => void
  getToolPrefs: () => WoeToolPrefs
  
  // Color management
  setTextColor: (color: string) => void
  setBorderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  addRecentColor: (color: string) => void
  
  // Page management
  addPage: () => void
  deletePage: (index: number) => void
  setCurrentPage: (index: number) => void
  getCurrentPage: () => WoeWorkspacePage | null
  
  // Save state
  setSaveState: (state: WoeWorkspaceState['saveState']) => void
  setIsDirty: (dirty: boolean) => void
  
  // UI state
  setTextDrawerOpen: (open: boolean) => void
  toggleTextDrawer: () => void
  
  // Canvas state
  setCanUndo: (canUndo: boolean) => void
  setCanRedo: (canRedo: boolean) => void
  setSelectedElementIds: (ids: string[]) => void
  setEditingTextId: (id: string | null) => void
  
  // Canvas operations
  undo: () => void
  redo: () => void
  clearCanvas: () => void
}

// Default state
const createDefaultPage = (): WoeWorkspacePage => ({
  id: `page-${Date.now()}`,
  scene: { elements: [], appState: {} },
})

const initialState: WoeWorkspaceState = {
  excalidrawAPI: null,
  pages: [createDefaultPage()],
  currentPageIndex: 0,
  saveState: 'saved',
  isDirty: false,
  textDrawerOpen: false,
  canUndo: false,
  canRedo: false,
  selectedElementIds: [],
  editingTextId: null,
  recentColors: [],
}

// Create the store
export const useWoeWorkspaceStore = create<WoeWorkspaceState & WoeWorkspaceActions>()(
  devtools(
    persist(
      (set, get) => {
        const toolManager = getWoeToolManager()
        
        return {
          ...initialState,
          
          // API management
          setExcalidrawAPI: (api) => set({ excalidrawAPI: api }),
          
          // Tool management - delegates to WoeToolManager
          setActiveTool: (tool) => {
            toolManager.setActiveTool(tool)
            // Update API if available
            const api = get().excalidrawAPI
            if (api) {
              api.setWoeTool(tool)
            }
          },
          
          getActiveTool: () => toolManager.getActiveTool(),
          
          resetTextTool: () => {
            toolManager.resetTextTool()
            // Re-activate text tool on canvas
            const api = get().excalidrawAPI
            if (api) {
              api.setWoeTool('text')
            }
          },
          
          // Tool preferences
          updateToolPrefs: (updates) => {
            toolManager.updateToolPrefs(updates)
          },
          
          getToolPrefs: () => toolManager.getToolPrefs(),
          
          // Color management
          setTextColor: (color) => {
            toolManager.setTextColor(color)
            get().addRecentColor(color)
          },
          
          setBorderColor: (color) => {
            toolManager.setBorderColor(color) 
            get().addRecentColor(color)
          },
          
          setBackgroundColor: (color) => {
            toolManager.setBackgroundColor(color)
            get().addRecentColor(color)
          },
          
          addRecentColor: (color) => {
            if (color === 'transparent') return
            
            set((state) => {
              const colors = state.recentColors.filter(c => c !== color)
              return {
                recentColors: [color, ...colors].slice(0, 6)
              }
            })
          },
          
          // Page management
          addPage: () => {
            set((state) => ({
              pages: [...state.pages, createDefaultPage()],
              currentPageIndex: state.pages.length,
              isDirty: true,
            }))
          },
          
          deletePage: (index) => {
            set((state) => {
              if (state.pages.length <= 1) return state
              
              const newPages = state.pages.filter((_, i) => i !== index)
              const newIndex = Math.min(state.currentPageIndex, newPages.length - 1)
              
              return {
                pages: newPages,
                currentPageIndex: newIndex,
                isDirty: true,
              }
            })
          },
          
          setCurrentPage: (index) => {
            set({ currentPageIndex: index })
          },
          
          getCurrentPage: () => {
            const state = get()
            return state.pages[state.currentPageIndex] || null
          },
          
          // Save state
          setSaveState: (saveState) => set({ saveState }),
          setIsDirty: (isDirty) => set({ isDirty }),
          
          // UI state
          setTextDrawerOpen: (textDrawerOpen) => set({ textDrawerOpen }),
          toggleTextDrawer: () => set((state) => ({ textDrawerOpen: !state.textDrawerOpen })),
          
          // Canvas state
          setCanUndo: (canUndo) => set({ canUndo }),
          setCanRedo: (canRedo) => set({ canRedo }),
          setSelectedElementIds: (selectedElementIds) => set({ selectedElementIds }),
          setEditingTextId: (editingTextId) => set({ editingTextId }),
          
          // Canvas operations
          undo: () => {
            const api = get().excalidrawAPI
            if (api && (api as any).history) {
              (api as any).history.undo()
            }
          },
          
          redo: () => {
            const api = get().excalidrawAPI
            if (api && (api as any).history) {
              (api as any).history.redo()
            }
          },
          
          clearCanvas: () => {
            const api = get().excalidrawAPI
            if (api && (api as any).updateScene) {
              (api as any).updateScene({ elements: [] })
            }
          },
        }
      },
      {
        name: 'woe-workspace',
        partialize: (state) => ({
          // Persist only essential state
          pages: state.pages,
          currentPageIndex: state.currentPageIndex,
          recentColors: state.recentColors,
        }),
      }
    ),
    { name: 'woe-workspace' }
  )
)

// Hook for tool manager integration
export function useWoeToolManager() {
  return getWoeToolManager()
}