import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface ToolPrefs {
  // Draw tool preferences
  drawSize: number
  drawColor: string
  drawOpacity: number
  drawSmoothness: boolean
  
  // Highlighter tool preferences
  highlighterSize: number
  highlighterColor: string
  highlighterOpacity: number
  
  // Text tool preferences
  textSize: number
  textColor: string
  textFamily: string
  textBold: boolean
  textItalic: boolean
  textUnderline: boolean
  textAlign: 'left' | 'center' | 'right'
  
  // Eraser tool preferences
  eraserSize: number
  eraserMode: 'stroke' | 'object'
}

export interface WorkspacePage {
  id: string
  scene: any
  orientation: 'portrait' | 'landscape'
  thumbnail?: string
}

export interface TextDefaults {
  fontFamily: string
  fontSize: number
  color: string
  bold: boolean
  italic: boolean
  underline: boolean
  lineHeight: number
  align: 'left' | 'center' | 'right'
}

export interface WorkspaceState {
  // UI State
  activeTool: 'select' | 'draw' | 'highlighter' | 'text' | 'erase' | 'shapes'
  activeDrawer: string | null
  zoom: number
  
  // Page State
  pages: WorkspacePage[]
  currentPageIndex: number
  
  // Save State
  saveState: 'saved' | 'saving' | 'unsaved' | 'error'
  isDirty: boolean
  
  // Tool Preferences (persisted to localStorage)
  toolPrefs: ToolPrefs
  
  // Recent colors (last 6 custom colors)
  recentColors: string[]
  
  // Canvas state
  canUndo: boolean
  canRedo: boolean
  
  // Selection and text editing state
  selectedElementIds: string[]
  editingTextId: string | null
  textDefaults: TextDefaults
}

export interface WorkspaceActions {
  // Tool actions
  setActiveTool: (tool: WorkspaceState['activeTool']) => void
  setActiveDrawer: (drawer: string | null) => void
  toggleDrawer: (drawer: string) => void
  
  // Zoom actions
  setZoom: (zoom: number) => void
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
  
  // Page actions
  setPages: (pages: WorkspacePage[]) => void
  setCurrentPageIndex: (index: number) => void
  nextPage: () => void
  prevPage: () => void
  jumpToPage: (index: number) => void
  addPage: (page: WorkspacePage) => void
  removePage: (index: number) => void
  
  // Save state actions
  setSaveState: (state: WorkspaceState['saveState']) => void
  setDirty: (dirty: boolean) => void
  
  // Tool preferences actions
  updateToolPref: <K extends keyof ToolPrefs>(key: K, value: ToolPrefs[K]) => void
  resetToolPrefs: () => void
  
  // Recent colors actions
  addRecentColor: (color: string) => void
  
  // Canvas history actions
  setCanUndo: (canUndo: boolean) => void
  setCanRedo: (canRedo: boolean) => void
  
  // Selection and text editing actions
  setSelectedElementIds: (ids: string[]) => void
  setEditingTextId: (id: string | null) => void
  updateTextDefaults: (patch: Partial<TextDefaults>) => void
  applyTextStyleToSelection: (patch: Partial<TextDefaults>, excalidrawAPI?: any) => void
}

// Default text styling
const DEFAULT_TEXT_DEFAULTS: TextDefaults = {
  fontFamily: 'Arial, sans-serif',
  fontSize: 20,
  color: '#000000',
  bold: false,
  italic: false,
  underline: false,
  lineHeight: 1.2,
  align: 'left'
}

// Default tool preferences
const DEFAULT_TOOL_PREFS: ToolPrefs = {
  // Draw defaults
  drawSize: 4,
  drawColor: '#000000',
  drawOpacity: 1.0,
  drawSmoothness: true,
  
  // Highlighter defaults
  highlighterSize: 12,
  highlighterColor: '#FACC15', // Yellow
  highlighterOpacity: 0.3,
  
  // Text defaults
  textSize: 18,
  textColor: '#000000',
  textFamily: 'system-ui, -apple-system, sans-serif',
  textBold: false,
  textItalic: false,
  textUnderline: false,
  textAlign: 'left',
  
  // Eraser defaults
  eraserSize: 8,
  eraserMode: 'stroke',
}

// Zoom presets
export const ZOOM_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5] as const
export type ZoomPreset = typeof ZOOM_PRESETS[number]

export type WorkspaceStore = WorkspaceState & WorkspaceActions

export const useWorkspaceStore = create<WorkspaceStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        activeTool: 'draw',
        activeDrawer: null,
        zoom: 1.0,
        pages: [],
        currentPageIndex: 0,
        saveState: 'saved',
        isDirty: false,
        toolPrefs: DEFAULT_TOOL_PREFS,
        recentColors: [],
        canUndo: false,
        canRedo: false,
        selectedElementIds: [],
        editingTextId: null,
        textDefaults: DEFAULT_TEXT_DEFAULTS,

        // Tool actions
        setActiveTool: (tool) => {
          const { activeDrawer } = get()
          set({ 
            activeTool: tool,
            // Close drawer if switching to a tool without options
            activeDrawer: ['select'].includes(tool) ? null : activeDrawer
          }, false, 'setActiveTool')
        },

        setActiveDrawer: (drawer) => set({ activeDrawer: drawer }, false, 'setActiveDrawer'),

        toggleDrawer: (drawer) => {
          const { activeDrawer } = get()
          set({ 
            activeDrawer: activeDrawer === drawer ? null : drawer 
          }, false, 'toggleDrawer')
        },

        // Zoom actions
        setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(3.0, zoom)) }, false, 'setZoom'),

        zoomIn: () => {
          const { zoom } = get()
          const currentIndex = ZOOM_PRESETS.findIndex(preset => preset >= zoom)
          const nextZoom = currentIndex >= 0 && currentIndex < ZOOM_PRESETS.length - 1 
            ? ZOOM_PRESETS[currentIndex + 1] 
            : Math.min(zoom * 1.25, 3.0)
          set({ zoom: nextZoom }, false, 'zoomIn')
        },

        zoomOut: () => {
          const { zoom } = get()
          const currentIndex = ZOOM_PRESETS.findIndex(preset => preset >= zoom)
          const prevZoom = currentIndex > 0 
            ? ZOOM_PRESETS[currentIndex - 1] 
            : Math.max(zoom / 1.25, 0.1)
          set({ zoom: prevZoom }, false, 'zoomOut')
        },

        resetZoom: () => set({ zoom: 1.0 }, false, 'resetZoom'),

        // Page actions
        setPages: (pages) => set({ pages }, false, 'setPages'),

        setCurrentPageIndex: (index) => {
          const { pages } = get()
          if (index >= 0 && index < pages.length) {
            set({ currentPageIndex: index }, false, 'setCurrentPageIndex')
          }
        },

        nextPage: () => {
          const { pages, currentPageIndex } = get()
          if (currentPageIndex < pages.length - 1) {
            set({ currentPageIndex: currentPageIndex + 1 }, false, 'nextPage')
          }
        },

        prevPage: () => {
          const { currentPageIndex } = get()
          if (currentPageIndex > 0) {
            set({ currentPageIndex: currentPageIndex - 1 }, false, 'prevPage')
          }
        },

        jumpToPage: (index) => {
          const { pages } = get()
          if (index >= 0 && index < pages.length) {
            set({ currentPageIndex: index }, false, 'jumpToPage')
          }
        },

        addPage: (page) => {
          const { pages, currentPageIndex } = get()
          const newPages = [...pages]
          newPages.splice(currentPageIndex + 1, 0, page)
          set({ 
            pages: newPages,
            currentPageIndex: currentPageIndex + 1,
            isDirty: true
          }, false, 'addPage')
        },

        removePage: (index) => {
          const { pages, currentPageIndex } = get()
          if (pages.length > 1 && index >= 0 && index < pages.length) {
            const newPages = pages.filter((_, i) => i !== index)
            const newCurrentIndex = index <= currentPageIndex && currentPageIndex > 0 
              ? currentPageIndex - 1 
              : Math.min(currentPageIndex, newPages.length - 1)
            
            set({ 
              pages: newPages,
              currentPageIndex: newCurrentIndex,
              isDirty: true
            }, false, 'removePage')
          }
        },

        // Save state actions
        setSaveState: (saveState) => set({ saveState }, false, 'setSaveState'),

        setDirty: (isDirty) => {
          set({ 
            isDirty,
            saveState: isDirty ? 'unsaved' : 'saved'
          }, false, 'setDirty')
        },

        // Tool preferences actions
        updateToolPref: (key, value) => {
          const { toolPrefs } = get()
          set({ 
            toolPrefs: { ...toolPrefs, [key]: value }
          }, false, 'updateToolPref')
        },

        resetToolPrefs: () => set({ toolPrefs: DEFAULT_TOOL_PREFS }, false, 'resetToolPrefs'),

        // Recent colors actions
        addRecentColor: (color) => {
          const { recentColors } = get()
          // Remove color if it already exists, then add to front
          const filteredColors = recentColors.filter(c => c !== color)
          const newRecentColors = [color, ...filteredColors].slice(0, 6)
          set({ recentColors: newRecentColors }, false, 'addRecentColor')
        },

        // Canvas history actions
        setCanUndo: (canUndo) => set({ canUndo }, false, 'setCanUndo'),
        setCanRedo: (canRedo) => set({ canRedo }, false, 'setCanRedo'),
        
        // Selection and text editing actions
        setSelectedElementIds: (selectedElementIds) => set({ selectedElementIds }, false, 'setSelectedElementIds'),
        setEditingTextId: (editingTextId) => set({ editingTextId }, false, 'setEditingTextId'),
        
        updateTextDefaults: (patch) => {
          const { textDefaults } = get()
          set({ 
            textDefaults: { ...textDefaults, ...patch }
          }, false, 'updateTextDefaults')
        },
        
        applyTextStyleToSelection: (patch, excalidrawAPI) => {
          const { selectedElementIds, textDefaults } = get()
          
          if (!excalidrawAPI) {
            // No API available, just update defaults
            const newDefaults = { ...textDefaults, ...patch }
            set({ textDefaults: newDefaults }, false, 'applyTextStyleToSelection-defaultsOnly')
            return
          }
          
          try {
            const elements = excalidrawAPI.getSceneElements()
            const selectedTextElements = elements.filter((el: any) => 
              selectedElementIds.includes(el.id) && el.type === 'text'
            )
            
            console.log('🎨 Applying text style:', {
              patch,
              selectedTextCount: selectedTextElements.length,
              selectedIds: selectedElementIds
            })
            
            if (selectedTextElements.length > 0) {
              // Apply to selected text elements
              const updatedElements = elements.map((el: any) => {
                if (selectedElementIds.includes(el.id) && el.type === 'text') {
                  const updatedElement = { ...el }
                  
                  // Map patch properties to Excalidraw element properties
                  if (patch.fontSize !== undefined) updatedElement.fontSize = patch.fontSize
                  if (patch.color !== undefined) updatedElement.strokeColor = patch.color
                  if (patch.fontFamily !== undefined) updatedElement.fontFamily = patch.fontFamily
                  if (patch.bold !== undefined) {
                    // Handle bold via fontFamily mapping (Excalidraw uses numeric family codes)
                    updatedElement.fontWeight = patch.bold ? 'bold' : 'normal'
                  }
                  if (patch.italic !== undefined) {
                    updatedElement.fontStyle = patch.italic ? 'italic' : 'normal'
                  }
                  if (patch.align !== undefined) updatedElement.textAlign = patch.align
                  
                  // Force layout recalculation
                  updatedElement.width = null
                  updatedElement.height = null
                  
                  return updatedElement
                }
                return el
              })
              
              excalidrawAPI.updateScene({ 
                elements: updatedElements,
                commitToHistory: true
              })
              
              // Force redraw
              setTimeout(() => excalidrawAPI.refresh(), 10)
              
              console.log(`✅ Applied style to ${selectedTextElements.length} text elements`)
            } else {
              // No text elements selected, update defaults
              const newDefaults = { ...textDefaults, ...patch }
              set({ textDefaults: newDefaults }, false, 'applyTextStyleToSelection-defaults')
              console.log('📝 Updated text defaults:', newDefaults)
            }
          } catch (error) {
            console.error('Error applying text style:', error)
          }
        },
      }),
      {
        name: 'workspace-tool-prefs',
        // Only persist tool preferences and recent colors
        partialize: (state) => ({
          toolPrefs: state.toolPrefs,
          recentColors: state.recentColors,
        }),
      }
    ),
    {
      name: 'workspace-store',
    }
  )
)

// Helper hooks for specific tool preferences
export const useDrawPrefs = () => {
  const { toolPrefs, updateToolPref } = useWorkspaceStore()
  return {
    size: toolPrefs.drawSize,
    color: toolPrefs.drawColor,
    opacity: toolPrefs.drawOpacity,
    smoothness: toolPrefs.drawSmoothness,
    updateSize: (size: number) => updateToolPref('drawSize', size),
    updateColor: (color: string) => updateToolPref('drawColor', color),
    updateOpacity: (opacity: number) => updateToolPref('drawOpacity', opacity),
    updateSmoothness: (smoothness: boolean) => updateToolPref('drawSmoothness', smoothness),
  }
}

export const useHighlighterPrefs = () => {
  const { toolPrefs, updateToolPref } = useWorkspaceStore()
  return {
    size: toolPrefs.highlighterSize,
    color: toolPrefs.highlighterColor,
    opacity: toolPrefs.highlighterOpacity,
    updateSize: (size: number) => updateToolPref('highlighterSize', size),
    updateColor: (color: string) => updateToolPref('highlighterColor', color),
    updateOpacity: (opacity: number) => updateToolPref('highlighterOpacity', opacity),
  }
}

export const useTextPrefs = () => {
  const { toolPrefs, updateToolPref } = useWorkspaceStore()
  return {
    size: toolPrefs.textSize,
    color: toolPrefs.textColor,
    family: toolPrefs.textFamily,
    bold: toolPrefs.textBold,
    italic: toolPrefs.textItalic,
    underline: toolPrefs.textUnderline,
    align: toolPrefs.textAlign,
    updateSize: (size: number) => updateToolPref('textSize', size),
    updateColor: (color: string) => updateToolPref('textColor', color),
    updateFamily: (family: string) => updateToolPref('textFamily', family),
    updateBold: (bold: boolean) => updateToolPref('textBold', bold),
    updateItalic: (italic: boolean) => updateToolPref('textItalic', italic),
    updateUnderline: (underline: boolean) => updateToolPref('textUnderline', underline),
    updateAlign: (align: 'left' | 'center' | 'right') => updateToolPref('textAlign', align),
  }
}

export const useEraserPrefs = () => {
  const { toolPrefs, updateToolPref } = useWorkspaceStore()
  return {
    size: toolPrefs.eraserSize,
    mode: toolPrefs.eraserMode,
    updateSize: (size: number) => updateToolPref('eraserSize', size),
    updateMode: (mode: 'stroke' | 'object') => updateToolPref('eraserMode', mode),
  }
}

// Selection-aware text style hooks
export const useTextSelection = () => {
  const { selectedElementIds, setSelectedElementIds, applyTextStyleToSelection } = useWorkspaceStore()
  return {
    selectedElementIds,
    setSelectedElementIds,
    applyTextStyleToSelection
  }
}

export const useDerivedTextStyle = (excalidrawAPI?: any) => {
  const { selectedElementIds, textDefaults } = useWorkspaceStore()
  
  if (!excalidrawAPI) {
    return {
      derivedStyle: textDefaults,
      isMixed: false,
      hasSelection: false
    }
  }
  
  try {
    const elements = excalidrawAPI.getSceneElements()
    const selectedTextElements = elements.filter((el: any) => 
      selectedElementIds.includes(el.id) && el.type === 'text'
    )
    
    if (selectedTextElements.length === 0) {
      // No text selected, return defaults
      return {
        derivedStyle: textDefaults,
        isMixed: false,
        hasSelection: false
      }
    }
    
    if (selectedTextElements.length === 1) {
      // Single selection, return its properties
      const element = selectedTextElements[0]
      return {
        derivedStyle: {
          fontFamily: element.fontFamily || textDefaults.fontFamily,
          fontSize: element.fontSize || textDefaults.fontSize,
          color: element.strokeColor || textDefaults.color,
          bold: element.fontWeight === 'bold',
          italic: element.fontStyle === 'italic',
          underline: false, // Excalidraw doesn't support underline natively
          lineHeight: textDefaults.lineHeight, // Use default for now
          align: element.textAlign || textDefaults.align
        },
        isMixed: false,
        hasSelection: true
      }
    }
    
    // Multiple selection, check for mixed values
    const firstElement = selectedTextElements[0]
    const isMixed = selectedTextElements.some((el: any) => 
      el.fontSize !== firstElement.fontSize ||
      el.strokeColor !== firstElement.strokeColor ||
      el.fontFamily !== firstElement.fontFamily ||
      el.fontWeight !== firstElement.fontWeight ||
      el.fontStyle !== firstElement.fontStyle ||
      el.textAlign !== firstElement.textAlign
    )
    
    if (isMixed) {
      return {
        derivedStyle: textDefaults, // Show defaults when mixed
        isMixed: true,
        hasSelection: true
      }
    }
    
    // All selected elements have same values
    return {
      derivedStyle: {
        fontFamily: firstElement.fontFamily || textDefaults.fontFamily,
        fontSize: firstElement.fontSize || textDefaults.fontSize,
        color: firstElement.strokeColor || textDefaults.color,
        bold: firstElement.fontWeight === 'bold',
        italic: firstElement.fontStyle === 'italic',
        underline: false,
        lineHeight: textDefaults.lineHeight,
        align: firstElement.textAlign || textDefaults.align
      },
      isMixed: false,
      hasSelection: true
    }
  } catch (error) {
    console.error('Error deriving text style:', error)
    return {
      derivedStyle: textDefaults,
      isMixed: false,
      hasSelection: false
    }
  }
}