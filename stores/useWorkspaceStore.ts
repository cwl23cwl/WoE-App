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
  textLineSpacing: number
  textBackgroundColor: string
  textBackgroundEnabled: boolean
  textBorderEnabled: boolean
  textBorderColor: string
  textBorderThickness: number
  
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
  bold: boolean
  italic: boolean
  underline: boolean
  textColor: string
  backgroundOn: boolean
  backgroundColor: string
  borderOn: boolean
  borderColor: string
  borderThickness: number
  align: 'left' | 'center' | 'right'
}

export interface WorkspaceState {
  // UI State
  activeTool: 'select' | 'draw' | 'highlighter' | 'text' | 'erase' | 'shapes'
  activeDrawer: 'none' | 'text' | 'draw' | 'highlight' | null
  openDrawer: 'none' | 'text' | 'draw' | 'highlight'
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
  excalidrawAPI: any // Reference to Excalidraw API
  
  // Selection and text editing state
  selectedElementIds: string[]
  editingTextId: string | null
  textDefaults: TextDefaults
}

export interface WorkspaceActions {
  // Tool actions
  setActiveTool: (tool: WorkspaceState['activeTool']) => void
  setActiveDrawer: (drawer: string | null) => void
  setOpenDrawer: (drawer: 'none' | 'text' | 'draw' | 'highlight') => void
  toggleDrawer: (drawer: string) => void
  resetTextTool: () => void
  
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
  setExcalidrawAPI: (api: any) => void
  
  // Canvas operations (requires Excalidraw API)
  undo: () => void
  redo: () => void
  clearCanvas: () => void
  
  // Selection and text editing actions
  setSelectedElementIds: (ids: string[]) => void
  setEditingTextId: (id: string | null) => void
  updateTextDefaults: (patch: Partial<TextDefaults>) => void
  applyTextStyleToSelection: (patch: Partial<TextDefaults>, excalidrawAPI?: any) => void
}

// Default text styling - Classic, simple, readable fonts
const DEFAULT_TEXT_DEFAULTS: TextDefaults = {
  fontFamily: 'Times New Roman',
  fontSize: 24,
  bold: false,
  italic: false,
  underline: false,
  textColor: '#1a1a1a',
  backgroundOn: false,
  backgroundColor: '#ffffff',
  borderOn: false,
  borderColor: '#000000',
  borderThickness: 1,
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
  
  // Text defaults - Classic, readable font at 24pt
  textSize: 24,
  textColor: '#1a1a1a',
  textFamily: '"Times New Roman", Georgia, serif',
  textBold: false,
  textItalic: false,
  textUnderline: false,
  textAlign: 'left',
  textLineSpacing: 1.0,
  textBackgroundColor: '#ffffff',
  textBackgroundEnabled: false,
  textBorderEnabled: false,
  textBorderColor: '#000000',
  textBorderThickness: 2,
  
  // Eraser defaults
  eraserSize: 8,
  eraserMode: 'stroke',
}

// Zoom presets
export const ZOOM_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5] as const
export type ZoomPreset = typeof ZOOM_PRESETS[number]

export type WorkspaceStore = WorkspaceState & WorkspaceActions

// Helper function to migrate tool preferences
const migrateToolPrefs = (stored: any): ToolPrefs => {
  const migrated = { ...DEFAULT_TOOL_PREFS }
  
  if (stored && typeof stored === 'object') {
    // Copy over valid preferences, ignore deprecated ones
    Object.keys(DEFAULT_TOOL_PREFS).forEach(key => {
      if (stored[key] !== undefined) {
        (migrated as any)[key] = stored[key]
      }
    })
  }
  
  return migrated
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        activeTool: 'draw',
        activeDrawer: null,
        openDrawer: 'none',
        zoom: 1.0,
        pages: [],
        currentPageIndex: 0,
        saveState: 'saved',
        isDirty: false,
        toolPrefs: DEFAULT_TOOL_PREFS,
        recentColors: [],
        canUndo: false,
        canRedo: false,
        excalidrawAPI: null,
        selectedElementIds: [],
        editingTextId: null,
        textDefaults: DEFAULT_TEXT_DEFAULTS,

        // Tool actions
        setActiveTool: (tool) => {
          const { openDrawer } = get()
          
          // Determine if this tool should open a drawer
          const shouldOpenDrawer = ['text', 'draw', 'highlighter'].includes(tool)
          const newDrawerState = shouldOpenDrawer ? tool as 'text' | 'draw' | 'highlight' : 'none'
          
          set({ 
            activeTool: tool,
            openDrawer: newDrawerState
          }, false, 'setActiveTool')
        },

        setActiveDrawer: (drawer) => set({ activeDrawer: drawer }, false, 'setActiveDrawer'),

        setOpenDrawer: (drawer) => set({ openDrawer: drawer }, false, 'setOpenDrawer'),

        toggleDrawer: (drawer) => {
          const { openDrawer } = get()
          set({ 
            openDrawer: openDrawer === drawer ? 'none' : drawer as 'text' | 'draw' | 'highlight'
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
          // Filter out deprecated preferences
          const validKeys = Object.keys(DEFAULT_TOOL_PREFS)
          if (validKeys.includes(key)) {
            set({ 
              toolPrefs: { ...toolPrefs, [key]: value }
            }, false, 'updateToolPref')
          }
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
        setExcalidrawAPI: (excalidrawAPI) => set({ excalidrawAPI }, false, 'setExcalidrawAPI'),
        
        // Text tool reset for new text box creation - KEY FIX for multiple text boxes
        resetTextTool: () => {
          const { excalidrawAPI } = get()
          
          // Clear text editing state
          set({ 
            editingTextId: null,
            selectedElementIds: []
          }, false, 'resetTextTool')
          
          // Force Excalidraw to exit any text editing mode and reinitialize text tool
          if (excalidrawAPI) {
            try {
              // First, temporarily switch to selection tool to clear any text editing state
              excalidrawAPI.setActiveTool({ type: 'selection' })
              
              // Then switch back to text tool to enable new text creation
              setTimeout(() => {
                if (excalidrawAPI.setActiveTool) {
                  excalidrawAPI.setActiveTool({ type: 'text' })
                  console.log('✅ Text tool reset for new text box creation')
                }
              }, 50)
            } catch (error) {
              console.error('❌ Text tool reset failed:', error)
            }
          }
        },
        
        // Canvas operations
        undo: () => {
          const { excalidrawAPI } = get()
          if (!excalidrawAPI) {
            console.warn('Undo failed: Excalidraw API not available')
            return
          }
          
          try {
            if (excalidrawAPI.history?.undo) {
              excalidrawAPI.history.undo()
              console.log('✅ Undo performed')
            } else {
              console.warn('Undo not available - no history API')
            }
          } catch (error) {
            console.error('❌ Error performing undo:', error)
            // Fallback: try direct undo if available
            try {
              if (excalidrawAPI.undo) {
                excalidrawAPI.undo()
              }
            } catch (fallbackError) {
              console.error('❌ Fallback undo also failed:', fallbackError)
            }
          }
        },
        
        redo: () => {
          const { excalidrawAPI } = get()
          if (!excalidrawAPI) {
            console.warn('Redo failed: Excalidraw API not available')
            return
          }
          
          try {
            if (excalidrawAPI.history?.redo) {
              excalidrawAPI.history.redo()
              console.log('✅ Redo performed')
            } else {
              console.warn('Redo not available - no history API')
            }
          } catch (error) {
            console.error('❌ Error performing redo:', error)
            // Fallback: try direct redo if available
            try {
              if (excalidrawAPI.redo) {
                excalidrawAPI.redo()
              }
            } catch (fallbackError) {
              console.error('❌ Fallback redo also failed:', fallbackError)
            }
          }
        },
        
        clearCanvas: () => {
          const { excalidrawAPI, pages, currentPageIndex } = get()
          
          if (!excalidrawAPI) {
            console.warn('Clear canvas failed: Excalidraw API not available')
            return
          }
          
          if (!pages[currentPageIndex]) {
            console.warn('Clear canvas failed: No current page')
            return
          }
          
          try {
            // Confirm with user (optional - you can remove this if you want instant clear)
            const shouldClear = confirm('Are you sure you want to clear the entire canvas? This action cannot be undone.')
            if (!shouldClear) {
              return
            }
            
            excalidrawAPI.updateScene({ 
              elements: [],
              commitToHistory: true
            })
            
            // Update the page data
            const updatedPages = [...pages]
            if (updatedPages[currentPageIndex]) {
              updatedPages[currentPageIndex] = {
                ...updatedPages[currentPageIndex],
                scene: {
                  elements: [],
                  appState: {
                    viewBackgroundColor: '#ffffff',
                  },
                }
              }
              set({ pages: updatedPages, isDirty: true }, false, 'clearCanvas')
            }
            
            console.log('✅ Canvas cleared successfully')
          } catch (error) {
            console.error('❌ Error clearing canvas:', error)
            // Show user-friendly error message
            alert('Failed to clear canvas. Please try again or refresh the page.')
          }
        },
        
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
          const { selectedElementIds, editingTextId, textDefaults } = get()
          
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
            
            // If no elements selected but we're editing a text element, target that element
            let targetElements = selectedTextElements
            let isEditingTarget = false
            
            if (selectedTextElements.length === 0 && editingTextId) {
              const editingElement = elements.find((el: any) => el.id === editingTextId && el.type === 'text')
              if (editingElement) {
                targetElements = [editingElement]
                isEditingTarget = true
              }
            }
            
            console.log('🎨 Applying text style:', {
              patch,
              selectedTextCount: selectedTextElements.length,
              editingTextId,
              targetElementsCount: targetElements.length,
              isEditingTarget,
              selectedIds: selectedElementIds
            })
            
            if (targetElements.length > 0) {
              // Apply to target text elements (selected or editing)
              const targetElementIds = targetElements.map((el: any) => el.id)
              const updatedElements = elements.map((el: any) => {
                if (targetElementIds.includes(el.id) && el.type === 'text') {
                  const updatedElement = { ...el }
                  
                  // Map patch properties to Excalidraw element properties
                  if (patch.fontSize !== undefined) updatedElement.fontSize = patch.fontSize
                  if (patch.textColor !== undefined) updatedElement.strokeColor = patch.textColor
                  if (patch.fontFamily !== undefined) updatedElement.fontFamily = patch.fontFamily
                  if (patch.bold !== undefined) {
                    updatedElement.fontWeight = patch.bold ? 'bold' : 'normal'
                  }
                  if (patch.italic !== undefined) {
                    updatedElement.fontStyle = patch.italic ? 'italic' : 'normal'
                  }
                  if (patch.align !== undefined) updatedElement.textAlign = patch.align
                  
                  // Handle background properties
                  if (patch.backgroundOn !== undefined) {
                    updatedElement.backgroundColor = patch.backgroundOn ? (patch.backgroundColor || textDefaults.backgroundColor) : 'transparent'
                  }
                  if (patch.backgroundColor !== undefined && textDefaults.backgroundOn) {
                    updatedElement.backgroundColor = patch.backgroundColor
                  }
                  
                  // Handle border properties - always enforce 1pt thickness
                  if (patch.borderOn !== undefined || patch.borderColor !== undefined || patch.borderThickness !== undefined) {
                    // Always set border thickness to 1 (1pt)
                    updatedElement.strokeWidth = 1
                    
                    if (patch.borderOn !== undefined) {
                      if (patch.borderOn) {
                        updatedElement.strokeColor = patch.borderColor || textDefaults.borderColor || '#000000'
                        updatedElement.strokeStyle = 'solid'
                      } else {
                        updatedElement.strokeStyle = 'none'
                      }
                    }
                    if (patch.borderColor !== undefined && (patch.borderOn !== false && textDefaults.borderOn)) {
                      updatedElement.strokeColor = patch.borderColor
                    }
                  }
                  
                  // Let Excalidraw handle the layout recalculation naturally.
                  // Forcing it by nulling width/height is unstable.
                  
                  return updatedElement
                }
                return el
              })
              
              excalidrawAPI.updateScene({ 
                elements: updatedElements,
                commitToHistory: !isEditingTarget // Don't add to history during editing
              })
              
              // After updating the scene, give Excalidraw a moment to process
              // the changes before we might need to read the updated element state.
              setTimeout(() => {
                if (excalidrawAPI && excalidrawAPI.refresh) {
                  excalidrawAPI.refresh();
                }
              }, 50);

              if (isEditingTarget) {
                console.log(`✅ Applied style to editing text element: ${editingTextId}`)
              } else {
                console.log(`✅ Applied style to ${targetElements.length} selected text elements`)
              }
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
        // Migrate old preferences when loading from storage
        migrate: (persistedState: any, version: number) => {
          if (persistedState && persistedState.toolPrefs) {
            persistedState.toolPrefs = migrateToolPrefs(persistedState.toolPrefs)
          }
          return persistedState
        },
        version: 1, // Increment when making breaking changes
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
  const { selectedElementIds, editingTextId, textDefaults } = useWorkspaceStore()
  
  if (!excalidrawAPI) {
    return {
      derivedStyle: textDefaults || DEFAULT_TEXT_DEFAULTS,
      isMixed: false,
      hasSelection: false
    }
  }
  
  try {
    const elements = excalidrawAPI.getSceneElements()
    const selectedTextElements = elements.filter((el: any) => 
      selectedElementIds.includes(el.id) && el.type === 'text'
    )
    
    // If no elements selected but we're editing a text element, use that for display
    let targetElements = selectedTextElements
    let isEditingTarget = false
    
    if (selectedTextElements.length === 0 && editingTextId) {
      const editingElement = elements.find((el: any) => el.id === editingTextId && el.type === 'text')
      if (editingElement) {
        targetElements = [editingElement]
        isEditingTarget = true
      }
    }
    
    if (targetElements.length === 0) {
      // No text selected or editing, return defaults
      return {
        derivedStyle: textDefaults || DEFAULT_TEXT_DEFAULTS,
        isMixed: false,
        hasSelection: false
      }
    }
    
    if (targetElements.length === 1) {
      // Single element (selected or editing), return its properties
      const element = targetElements[0]
      return {
        derivedStyle: {
          fontFamily: element.fontFamily || textDefaults?.fontFamily || DEFAULT_TEXT_DEFAULTS.fontFamily,
          fontSize: element.fontSize || textDefaults?.fontSize || DEFAULT_TEXT_DEFAULTS.fontSize,
          textColor: element.strokeColor || textDefaults?.textColor || DEFAULT_TEXT_DEFAULTS.textColor,
          bold: element.fontWeight === 'bold',
          italic: element.fontStyle === 'italic',
          underline: false, // Excalidraw doesn't support underline natively
          backgroundOn: textDefaults?.backgroundOn || DEFAULT_TEXT_DEFAULTS.backgroundOn,
          backgroundColor: textDefaults?.backgroundColor || DEFAULT_TEXT_DEFAULTS.backgroundColor,
          borderOn: textDefaults?.borderOn || DEFAULT_TEXT_DEFAULTS.borderOn,
          borderColor: textDefaults?.borderColor || DEFAULT_TEXT_DEFAULTS.borderColor,
          borderThickness: textDefaults?.borderThickness || DEFAULT_TEXT_DEFAULTS.borderThickness,
          align: element.textAlign || textDefaults?.align || DEFAULT_TEXT_DEFAULTS.align
        },
        isMixed: false,
        hasSelection: true
      }
    }
    
    // Multiple selection, check for mixed values
    const firstElement = targetElements[0]
    const isMixed = targetElements.some((el: any) => 
      el.fontSize !== firstElement.fontSize ||
      el.strokeColor !== firstElement.strokeColor ||
      el.fontFamily !== firstElement.fontFamily ||
      el.fontWeight !== firstElement.fontWeight ||
      el.fontStyle !== firstElement.fontStyle ||
      el.textAlign !== firstElement.textAlign
    )
    
    if (isMixed) {
      return {
        derivedStyle: textDefaults || DEFAULT_TEXT_DEFAULTS, // Show defaults when mixed
        isMixed: true,
        hasSelection: true
      }
    }
    
    // All target elements have same values
    return {
      derivedStyle: {
        fontFamily: firstElement.fontFamily || textDefaults?.fontFamily || DEFAULT_TEXT_DEFAULTS.fontFamily,
        fontSize: firstElement.fontSize || textDefaults?.fontSize || DEFAULT_TEXT_DEFAULTS.fontSize,
        textColor: firstElement.strokeColor || textDefaults?.textColor || DEFAULT_TEXT_DEFAULTS.textColor,
        bold: firstElement.fontWeight === 'bold',
        italic: firstElement.fontStyle === 'italic',
        underline: false,
        backgroundOn: textDefaults?.backgroundOn || DEFAULT_TEXT_DEFAULTS.backgroundOn,
        backgroundColor: textDefaults?.backgroundColor || DEFAULT_TEXT_DEFAULTS.backgroundColor,
        borderOn: textDefaults?.borderOn || DEFAULT_TEXT_DEFAULTS.borderOn,
        borderColor: textDefaults?.borderColor || DEFAULT_TEXT_DEFAULTS.borderColor,
        borderThickness: textDefaults?.borderThickness || DEFAULT_TEXT_DEFAULTS.borderThickness,
        align: firstElement.textAlign || textDefaults?.align || DEFAULT_TEXT_DEFAULTS.align
      },
      isMixed: false,
      hasSelection: true
    }
  } catch (error) {
    console.error('Error deriving text style:', error)
    return {
      derivedStyle: textDefaults || DEFAULT_TEXT_DEFAULTS,
      isMixed: false,
      hasSelection: false
    }
  }
}