// stores/useWorkspaceStore.ts - Enhanced to match your existing toolbar components
'use client'

import { create } from 'zustand'

// Types
type SaveState = 'saved' | 'saving' | 'unsaved' | 'error'
type ToolType = 'select' | 'draw' | 'highlighter' | 'text' | 'erase' | 'shapes'

interface Page {
  id: string
  title: string
  elements: any[]
  appState: any
  createdAt: Date
  updatedAt: Date
}

interface ToolPrefs {
  drawColor?: string
  drawSize?: number
  highlighterColor?: string
  highlighterSize?: number
  highlighterOpacity?: number
  textColor?: string
  textSize?: number
}

interface WorkspaceState {
  // Page Management
  pages: Page[]
  currentPageIndex: number
  
  // Tool State  
  activeTool: ToolType
  toolPrefs: ToolPrefs
  
  // Excalidraw Integration
  excalidrawAPI: any | null
  
  // Save State
  saveState: SaveState
  canUndo: boolean
  canRedo: boolean
  
  // Actions
  setActiveTool: (tool: ToolType) => void
  updateToolPref: <K extends keyof ToolPrefs>(key: K, value: ToolPrefs[K]) => void
  setExcalidrawAPI: (api: any) => void
  
  // Page Actions
  addPage: (title?: string) => void
  deletePage: (index: number) => void
  duplicatePage: (index: number) => void
  jumpToPage: (index: number) => void
  updatePageTitle: (index: number, title: string) => void
  updateCurrentPage: (elements: any[], appState: any) => void
  
  // Save Actions
  setSaveState: (state: SaveState) => void
  undo: () => void
  redo: () => void
  resetTextTool: () => void
}

// Helper to create a new page
const createPage = (title: string = 'New Page'): Page => ({
  id: Math.random().toString(36).slice(2),
  title,
  elements: [],
  appState: {
    zenModeEnabled: false,
    viewBackgroundColor: '#ffffff'
  },
  createdAt: new Date(),
  updatedAt: new Date()
})

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  // Initial State
  pages: [createPage('Page 1')],
  currentPageIndex: 0,
  
  activeTool: 'draw',
  toolPrefs: {
    drawColor: '#111827',
    drawSize: 4,
    highlighterColor: '#FFF176', 
    highlighterSize: 12,
    highlighterOpacity: 0.3,
    textColor: '#111827',
    textSize: 24
  },
  
  excalidrawAPI: null,
  saveState: 'saved',
  canUndo: false,
  canRedo: false,
  
  // Basic Actions
  setActiveTool: (tool) => set({ activeTool: tool }),
  
  updateToolPref: (key, value) => set(state => ({
    toolPrefs: { ...state.toolPrefs, [key]: value }
  })),
  
  setExcalidrawAPI: (api) => {
    console.log('Store: Setting Excalidraw API:', !!api)
    set({ excalidrawAPI: api })
  },
  
  // Page Management Actions
  addPage: (title) => {
    const state = get()
    
    // FIRST: Save current page state before creating new page
    if (state.excalidrawAPI) {
      try {
        const elements = state.excalidrawAPI.getSceneElements()
        const appState = state.excalidrawAPI.getAppState()
        get().updateCurrentPage(elements, appState)
        console.log('Saved current page before adding new page')
      } catch (error) {
        console.error('Failed to save current page before adding new:', error)
      }
    }
    
    // THEN: Create and add new page
    const newTitle = title || `Page ${state.pages.length + 1}`
    const newPage = createPage(newTitle)
    
    set(state => ({
      pages: [...state.pages, newPage],
      currentPageIndex: state.pages.length,
      saveState: 'unsaved'
    }))
    
    // FINALLY: Clear canvas for new page after a short delay
    setTimeout(() => {
      if (get().excalidrawAPI) {
        try {
          get().excalidrawAPI.updateScene({
            elements: [], // Blank canvas
            appState: {
              zenModeEnabled: false,
              viewBackgroundColor: '#ffffff'
            }
          })
          console.log('New page loaded with blank canvas')
        } catch (error) {
          console.error('Failed to load blank canvas for new page:', error)
        }
      }
    }, 100)
  },
  
  deletePage: (index) => {
    const state = get()
    if (state.pages.length <= 1) return
    
    const newPages = state.pages.filter((_, i) => i !== index)
    let newCurrentIndex = state.currentPageIndex
    
    if (index < state.currentPageIndex) {
      newCurrentIndex = state.currentPageIndex - 1
    } else if (index === state.currentPageIndex) {
      newCurrentIndex = Math.min(state.currentPageIndex, newPages.length - 1)
    }
    
    set({
      pages: newPages,
      currentPageIndex: newCurrentIndex,
      saveState: 'unsaved'
    })
  },
  
  duplicatePage: (index) => {
    const state = get()
    const sourcePage = state.pages[index]
    if (!sourcePage) return
    
    const duplicatedPage = createPage(`${sourcePage.title} (Copy)`)
    duplicatedPage.elements = [...sourcePage.elements]
    duplicatedPage.appState = { ...sourcePage.appState }
    
    const newPages = [...state.pages]
    newPages.splice(index + 1, 0, duplicatedPage)
    
    set({
      pages: newPages,
      currentPageIndex: index + 1,
      saveState: 'unsaved'
    })
  },
  
  jumpToPage: (index) => {
    const state = get()
    if (index < 0 || index >= state.pages.length) {
      console.warn('Invalid page index:', index)
      return
    }
    
    // If we're already on this page, do nothing
    if (index === state.currentPageIndex) {
      return
    }
    
    // Save current page state before switching
    if (state.excalidrawAPI) {
      try {
        const elements = state.excalidrawAPI.getSceneElements()
        const appState = state.excalidrawAPI.getAppState()
        
        // Only save if we have actual content
        if (elements && appState) {
          get().updateCurrentPage(elements, appState)
          console.log(`Saved page ${state.currentPageIndex + 1} before switching to page ${index + 1}`)
        }
      } catch (error) {
        console.error('Failed to save current page before switch:', error)
      }
    }
    
    // Update current page index
    set({ currentPageIndex: index })
    
    // Load the new page into Excalidraw
    const newPage = state.pages[index]
    if (state.excalidrawAPI && newPage) {
      setTimeout(() => {
        try {
          state.excalidrawAPI.updateScene({
            elements: newPage.elements || [],
            appState: {
              ...newPage.appState,
              zenModeEnabled: false,
              viewBackgroundColor: '#ffffff'
            }
          })
          console.log(`Loaded page ${index + 1}: ${newPage.title}`)
        } catch (error) {
          console.error('Failed to load new page:', error)
        }
      }, 50)
    }
  },
  
  updatePageTitle: (index, title) => {
    set(state => ({
      pages: state.pages.map((page, i) => 
        i === index 
          ? { ...page, title, updatedAt: new Date() }
          : page
      ),
      saveState: 'unsaved'
    }))
  },
  
  updateCurrentPage: (elements, appState) => {
    const state = get()
    const currentIndex = state.currentPageIndex
    
    // Set saving state first
    set({ saveState: 'saving' })
    
    // Update the page data
    set(state => ({
      pages: state.pages.map((page, i) =>
        i === currentIndex
          ? { ...page, elements, appState, updatedAt: new Date() }
          : page
      )
    }))
    
    // Simulate save completion and set to saved
    setTimeout(() => {
      set({ saveState: 'saved' })
    }, 500)
  },
  
  // Save Actions
  setSaveState: (saveState) => set({ saveState }),
  undo: () => set({ canUndo: false }),
  redo: () => set({ canRedo: false }), 
  resetTextTool: () => console.log('Text tool reset')
}))