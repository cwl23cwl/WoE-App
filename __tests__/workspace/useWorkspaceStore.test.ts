import { renderHook, act } from '@testing-library/react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useWorkspaceStore', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    localStorageMock.clear.mockClear()
  })

  describe('initial state', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      expect(result.current.activeTool).toBe('draw')
      expect(result.current.activeDrawer).toBe(null)
      expect(result.current.zoom).toBe(1.0)
      expect(result.current.pages).toEqual([])
      expect(result.current.currentPageIndex).toBe(0)
      expect(result.current.saveState).toBe('saved')
      expect(result.current.isDirty).toBe(false)
    })

    it('should initialize with default tool preferences', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      expect(result.current.toolPrefs.drawSize).toBe(4)
      expect(result.current.toolPrefs.drawColor).toBe('#000000')
      expect(result.current.toolPrefs.highlighterSize).toBe(12)
      expect(result.current.toolPrefs.highlighterColor).toBe('#FACC15')
      expect(result.current.toolPrefs.textSize).toBe(18)
      expect(result.current.toolPrefs.eraserMode).toBe('stroke')
    })
  })

  describe('tool management', () => {
    it('should change active tool', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      act(() => {
        result.current.setActiveTool('highlighter')
      })
      
      expect(result.current.activeTool).toBe('highlighter')
    })

    it('should close drawer when switching to select tool', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      act(() => {
        result.current.setActiveDrawer('draw')
        result.current.setActiveTool('select')
      })
      
      expect(result.current.activeDrawer).toBe(null)
    })

    it('should toggle drawer correctly', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      // Open drawer
      act(() => {
        result.current.toggleDrawer('draw')
      })
      expect(result.current.activeDrawer).toBe('draw')
      
      // Close drawer
      act(() => {
        result.current.toggleDrawer('draw')
      })
      expect(result.current.activeDrawer).toBe(null)
      
      // Switch to different drawer
      act(() => {
        result.current.toggleDrawer('draw')
        result.current.toggleDrawer('highlighter')
      })
      expect(result.current.activeDrawer).toBe('highlighter')
    })
  })

  describe('zoom functionality', () => {
    it('should set zoom within bounds', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      act(() => {
        result.current.setZoom(2.0)
      })
      expect(result.current.zoom).toBe(2.0)
      
      // Test upper bound
      act(() => {
        result.current.setZoom(5.0)
      })
      expect(result.current.zoom).toBe(3.0)
      
      // Test lower bound
      act(() => {
        result.current.setZoom(0.05)
      })
      expect(result.current.zoom).toBe(0.1)
    })

    it('should zoom in correctly', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      act(() => {
        result.current.zoomIn()
      })
      expect(result.current.zoom).toBe(1.25)
      
      act(() => {
        result.current.zoomIn()
      })
      expect(result.current.zoom).toBe(1.5)
    })

    it('should zoom out correctly', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      act(() => {
        result.current.setZoom(1.5)
        result.current.zoomOut()
      })
      expect(result.current.zoom).toBe(1.25)
    })

    it('should reset zoom to 1.0', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      act(() => {
        result.current.setZoom(2.0)
        result.current.resetZoom()
      })
      expect(result.current.zoom).toBe(1.0)
    })
  })

  describe('page management', () => {
    const samplePages = [
      { id: '1', scene: {}, orientation: 'portrait' as const },
      { id: '2', scene: {}, orientation: 'landscape' as const },
      { id: '3', scene: {}, orientation: 'portrait' as const },
    ]

    it('should set pages', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      act(() => {
        result.current.setPages(samplePages)
      })
      
      expect(result.current.pages).toEqual(samplePages)
    })

    it('should navigate to next page', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      act(() => {
        result.current.setPages(samplePages)
        result.current.nextPage()
      })
      
      expect(result.current.currentPageIndex).toBe(1)
    })

    it('should navigate to previous page', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      act(() => {
        result.current.setPages(samplePages)
        result.current.setCurrentPageIndex(2)
        result.current.prevPage()
      })
      
      expect(result.current.currentPageIndex).toBe(1)
    })

    it('should not navigate beyond bounds', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      act(() => {
        result.current.setPages(samplePages)
      })
      
      // Try to go before first page
      act(() => {
        result.current.prevPage()
      })
      expect(result.current.currentPageIndex).toBe(0)
      
      // Try to go past last page
      act(() => {
        result.current.setCurrentPageIndex(2)
        result.current.nextPage()
      })
      expect(result.current.currentPageIndex).toBe(2)
    })

    it('should jump to specific page', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      act(() => {
        result.current.setPages(samplePages)
        result.current.jumpToPage(1)
      })
      
      expect(result.current.currentPageIndex).toBe(1)
    })

    it('should add new page', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      const newPage = { id: '4', scene: {}, orientation: 'portrait' as const }
      
      act(() => {
        result.current.setPages(samplePages)
        result.current.setCurrentPageIndex(1)
        result.current.addPage(newPage)
      })
      
      expect(result.current.pages).toHaveLength(4)
      expect(result.current.currentPageIndex).toBe(2)
      expect(result.current.isDirty).toBe(true)
    })

    it('should remove page', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      act(() => {
        result.current.setPages(samplePages)
        result.current.setCurrentPageIndex(1)
        result.current.removePage(1)
      })
      
      expect(result.current.pages).toHaveLength(2)
      expect(result.current.currentPageIndex).toBe(1)
      expect(result.current.isDirty).toBe(true)
    })
  })

  describe('tool preferences', () => {
    it('should update draw preferences', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      act(() => {
        result.current.updateToolPref('drawSize', 8)
        result.current.updateToolPref('drawColor', '#ff0000')
      })
      
      expect(result.current.toolPrefs.drawSize).toBe(8)
      expect(result.current.toolPrefs.drawColor).toBe('#ff0000')
    })

    it('should update highlighter preferences', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      act(() => {
        result.current.updateToolPref('highlighterSize', 16)
        result.current.updateToolPref('highlighterColor', '#00ff00')
      })
      
      expect(result.current.toolPrefs.highlighterSize).toBe(16)
      expect(result.current.toolPrefs.highlighterColor).toBe('#00ff00')
    })

    it('should update text preferences', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      act(() => {
        result.current.updateToolPref('textSize', 24)
        result.current.updateToolPref('textBold', true)
        result.current.updateToolPref('textAlign', 'center')
      })
      
      expect(result.current.toolPrefs.textSize).toBe(24)
      expect(result.current.toolPrefs.textBold).toBe(true)
      expect(result.current.toolPrefs.textAlign).toBe('center')
    })

    it('should reset tool preferences', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      act(() => {
        result.current.updateToolPref('drawSize', 20)
        result.current.updateToolPref('textSize', 30)
        result.current.resetToolPrefs()
      })
      
      expect(result.current.toolPrefs.drawSize).toBe(4)
      expect(result.current.toolPrefs.textSize).toBe(18)
    })
  })

  describe('recent colors', () => {
    it('should add recent colors', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      act(() => {
        result.current.addRecentColor('#ff0000')
        result.current.addRecentColor('#00ff00')
      })
      
      expect(result.current.recentColors).toEqual(['#00ff00', '#ff0000'])
    })

    it('should limit recent colors to 6', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff']
      
      act(() => {
        colors.forEach(color => result.current.addRecentColor(color))
      })
      
      expect(result.current.recentColors).toHaveLength(6)
      expect(result.current.recentColors[0]).toBe('#ffffff') // Most recent first
    })

    it('should move existing color to front', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      act(() => {
        result.current.addRecentColor('#ff0000')
        result.current.addRecentColor('#00ff00')
        result.current.addRecentColor('#ff0000') // Add again
      })
      
      expect(result.current.recentColors).toEqual(['#ff0000', '#00ff00'])
    })
  })

  describe('save state management', () => {
    it('should update save state', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      act(() => {
        result.current.setSaveState('saving')
      })
      
      expect(result.current.saveState).toBe('saving')
    })

    it('should update dirty state', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      act(() => {
        result.current.setDirty(true)
      })
      
      expect(result.current.isDirty).toBe(true)
      expect(result.current.saveState).toBe('unsaved')
      
      act(() => {
        result.current.setDirty(false)
      })
      
      expect(result.current.isDirty).toBe(false)
      expect(result.current.saveState).toBe('saved')
    })
  })

  describe('canvas history', () => {
    it('should update undo/redo state', () => {
      const { result } = renderHook(() => useWorkspaceStore())
      
      act(() => {
        result.current.setCanUndo(true)
        result.current.setCanRedo(true)
      })
      
      expect(result.current.canUndo).toBe(true)
      expect(result.current.canRedo).toBe(true)
    })
  })
})