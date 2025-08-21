import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { DEFAULT_COLORS, HIGHLIGHTER_CONFIG } from '@/lib/workspace-swatches'

export interface WorkspacePage {
  id: string
  scene: any
  orientation?: 'portrait' | 'landscape'
}

export interface WorkspaceState {
  role: "TEACHER" | "STUDENT"
  pages: WorkspacePage[]
  pageIndex: number
  tool: 'select' | 'pencil' | 'text' | 'eraser' | 'highlighter'
  zoom: number
  saveState: 'saved' | 'saving' | 'error'
  penWidth: number
  highlighterWidth: number
  shapeBorderWidth: number
  
  // Color states
  strokeColor: string
  textColor: string
  fillColor: string
  fillOpacity: number
}

export interface WorkspaceActions {
  setRole: (role: "TEACHER" | "STUDENT") => void
  setPages: (pages: WorkspacePage[]) => void
  setPageIndex: (pageIndex: number) => void
    setTool: (tool: 'select' | 'pencil' | 'text' | 'eraser' | 'highlighter') => void
  setZoom: (zoom: number) => void
  setSaveState: (saveState: 'saved' | 'saving' | 'error') => void
  setPenWidth: (penWidth: number) => void
  setHighlighterWidth: (highlighterWidth: number) => void
  setShapeBorderWidth: (shapeBorderWidth: number) => void
  jumpTo: (pageIndex: number) => void
  setSceneForPage: (pageIndex: number, scene: any) => void
  
  // Color actions
  setStroke: (hex: string) => void
  setTextColor: (hex: string) => void
  setFill: (hex: string, opacity?: number) => void
  
  // Highlighter helper (sets stroke with special properties)
  setHighlighter: (hex: string) => void
}

export type WorkspaceStore = WorkspaceState & WorkspaceActions

export const useWorkspaceStore = create<WorkspaceStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      role: "STUDENT",
      pages: [],
      pageIndex: 0,
      tool: 'pencil', // Changed from 'select' to 'pencil' for immediate drawing
      zoom: 1,
      saveState: 'saved',
      penWidth: 2,
      highlighterWidth: 8,
      shapeBorderWidth: 1,
      
      // Color initial state
      strokeColor: DEFAULT_COLORS.stroke,
      textColor: DEFAULT_COLORS.text,
      fillColor: DEFAULT_COLORS.fill,
      fillOpacity: 1,

      // Actions
      setRole: (role) => set({ role }, false, 'setRole'),
      
      setPages: (pages) => set({ pages }, false, 'setPages'),
      
      setPageIndex: (pageIndex) => set({ pageIndex }, false, 'setPageIndex'),
      
      setTool: (tool) => set({ tool }, false, 'setTool'),
      
      setZoom: (zoom) => set({ zoom }, false, 'setZoom'),
      
      setSaveState: (saveState) => set({ saveState }, false, 'setSaveState'),
      
      setPenWidth: (penWidth) => set({ penWidth }, false, 'setPenWidth'),
      
      setHighlighterWidth: (highlighterWidth) => set({ highlighterWidth }, false, 'setHighlighterWidth'),
      
      setShapeBorderWidth: (shapeBorderWidth) => set({ shapeBorderWidth }, false, 'setShapeBorderWidth'),
      
      jumpTo: (pageIndex) => {
        const { pages } = get()
        if (pageIndex >= 0 && pageIndex < pages.length) {
          set({ pageIndex }, false, 'jumpTo')
        }
      },
      
      setSceneForPage: (pageIndex, scene) => {
        const { pages } = get()
        if (pageIndex >= 0 && pageIndex < pages.length) {
          const updatedPages = [...pages]
          updatedPages[pageIndex] = { ...updatedPages[pageIndex], scene }
          set({ pages: updatedPages }, false, 'setSceneForPage')
        }
      },
      
      // Color actions
      setStroke: (hex) => set({ strokeColor: hex }, false, 'setStroke'),
      
      setTextColor: (hex) => set({ textColor: hex }, false, 'setTextColor'),
      
      setFill: (hex, opacity = 1) => set({ 
        fillColor: hex, 
        fillOpacity: opacity 
      }, false, 'setFill'),
      
      setHighlighter: (hex) => {
        // Set stroke color and switch to highlighter properties
        set({ 
          strokeColor: hex,
          // Could also switch tool to pencil automatically for highlighting
        }, false, 'setHighlighter')
      },
    }),
    {
      name: 'workspace-store', // Name for devtools
    }
  )
)
