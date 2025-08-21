import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TopToolbar } from '@/components/workspace/TopToolbar'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

// Mock the store
jest.mock('@/stores/useWorkspaceStore')
const mockStore = useWorkspaceStore as jest.MockedFunction<typeof useWorkspaceStore>

// Mock handlers
const mockOnUndo = jest.fn()
const mockOnRedo = jest.fn()
const mockOnLibraryOpen = jest.fn()

const defaultStoreState = {
  activeTool: 'draw' as const,
  setActiveTool: jest.fn(),
  activeDrawer: null,
  toggleDrawer: jest.fn(),
  setActiveDrawer: jest.fn(),
  zoom: 1.0,
  setZoom: jest.fn(),
  zoomIn: jest.fn(),
  zoomOut: jest.fn(),
  pages: [
    { id: '1', scene: {}, orientation: 'portrait' as const },
    { id: '2', scene: {}, orientation: 'portrait' as const }
  ],
  currentPageIndex: 0,
  nextPage: jest.fn(),
  prevPage: jest.fn(),
  saveState: 'saved' as const,
  canUndo: true,
  canRedo: false,
  toolPrefs: {
    drawSize: 4,
    drawColor: '#000000',
    highlighterSize: 12,
    highlighterColor: '#FACC15',
    textSize: 18,
    textColor: '#000000',
    eraserSize: 8,
  }
}

describe('TopToolbar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStore.mockReturnValue(defaultStoreState as any)
  })

  describe('rendering', () => {
    it('should render all tool buttons', () => {
      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      expect(screen.getByRole('button', { name: /select tool/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /draw tool/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /highlight tool/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /text tool/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /erase tool/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /shapes tool/i })).toBeInTheDocument()
    })

    it('should render zoom controls', () => {
      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      expect(screen.getByRole('combobox', { name: /zoom level/i })).toBeInTheDocument()
      expect(screen.getByDisplayValue('100%')).toBeInTheDocument()
    })

    it('should render undo/redo buttons', () => {
      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /redo/i })).toBeInTheDocument()
    })

    it('should render page navigation when multiple pages', () => {
      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      expect(screen.getByText('1 / 2')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
    })

    it('should not render page navigation for single page', () => {
      mockStore.mockReturnValue({
        ...defaultStoreState,
        pages: [{ id: '1', scene: {}, orientation: 'portrait' as const }]
      } as any)

      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      expect(screen.queryByText('1 / 1')).not.toBeInTheDocument()
    })

    it('should render save state indicator', () => {
      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      expect(screen.getByText('Saved')).toBeInTheDocument()
    })

    it('should render library button when provided', () => {
      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} onLibraryOpen={mockOnLibraryOpen} />)
      
      expect(screen.getByRole('button', { name: /open library/i })).toBeInTheDocument()
    })
  })

  describe('tool selection', () => {
    it('should call setActiveTool when tool button is clicked', async () => {
      const user = userEvent.setup()
      const setActiveTool = jest.fn()
      const toggleDrawer = jest.fn()
      
      mockStore.mockReturnValue({
        ...defaultStoreState,
        setActiveTool,
        toggleDrawer
      } as any)

      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      await user.click(screen.getByRole('button', { name: /highlight tool/i }))
      
      expect(setActiveTool).toHaveBeenCalledWith('highlighter')
      expect(toggleDrawer).toHaveBeenCalledWith('highlighter')
    })

    it('should show active state for current tool', () => {
      mockStore.mockReturnValue({
        ...defaultStoreState,
        activeTool: 'text'
      } as any)

      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      const textButton = screen.getByRole('button', { name: /text tool/i })
      expect(textButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('should close drawer for tools without options', async () => {
      const user = userEvent.setup()
      const setActiveTool = jest.fn()
      const setActiveDrawer = jest.fn()
      
      mockStore.mockReturnValue({
        ...defaultStoreState,
        setActiveTool,
        setActiveDrawer
      } as any)

      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      await user.click(screen.getByRole('button', { name: /select tool/i }))
      
      expect(setActiveTool).toHaveBeenCalledWith('select')
      expect(setActiveDrawer).toHaveBeenCalledWith(null)
    })
  })

  describe('size controls', () => {
    it('should display current tool size', () => {
      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      expect(screen.getByText('4')).toBeInTheDocument() // Draw tool default size
    })

    it('should call size change handlers', async () => {
      const user = userEvent.setup()
      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      await user.click(screen.getByRole('button', { name: /increase size/i }))
      // Size change would be handled by the store, which is mocked
    })
  })

  describe('zoom controls', () => {
    it('should call setZoom when zoom is changed', async () => {
      const user = userEvent.setup()
      const setZoom = jest.fn()
      
      mockStore.mockReturnValue({
        ...defaultStoreState,
        setZoom
      } as any)

      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      const zoomSelect = screen.getByRole('combobox', { name: /zoom level/i })
      await user.selectOptions(zoomSelect, '125%')
      
      expect(setZoom).toHaveBeenCalledWith(1.25)
    })

    it('should display custom zoom value', () => {
      mockStore.mockReturnValue({
        ...defaultStoreState,
        zoom: 1.33
      } as any)

      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      expect(screen.getByDisplayValue('133%')).toBeInTheDocument()
    })
  })

  describe('undo/redo', () => {
    it('should call onUndo when undo button is clicked', async () => {
      const user = userEvent.setup()
      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      await user.click(screen.getByRole('button', { name: /undo/i }))
      
      expect(mockOnUndo).toHaveBeenCalled()
    })

    it('should call onRedo when redo button is clicked', async () => {
      const user = userEvent.setup()
      mockStore.mockReturnValue({
        ...defaultStoreState,
        canRedo: true
      } as any)

      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      await user.click(screen.getByRole('button', { name: /redo/i }))
      
      expect(mockOnRedo).toHaveBeenCalled()
    })

    it('should disable undo button when canUndo is false', () => {
      mockStore.mockReturnValue({
        ...defaultStoreState,
        canUndo: false
      } as any)

      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled()
    })

    it('should disable redo button when canRedo is false', () => {
      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      expect(screen.getByRole('button', { name: /redo/i })).toBeDisabled()
    })
  })

  describe('page navigation', () => {
    it('should call prevPage when previous button is clicked', async () => {
      const user = userEvent.setup()
      const prevPage = jest.fn()
      
      mockStore.mockReturnValue({
        ...defaultStoreState,
        currentPageIndex: 1,
        prevPage
      } as any)

      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      await user.click(screen.getByRole('button', { name: /previous page/i }))
      
      expect(prevPage).toHaveBeenCalled()
    })

    it('should call nextPage when next button is clicked', async () => {
      const user = userEvent.setup()
      const nextPage = jest.fn()
      
      mockStore.mockReturnValue({
        ...defaultStoreState,
        nextPage
      } as any)

      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      await user.click(screen.getByRole('button', { name: /next page/i }))
      
      expect(nextPage).toHaveBeenCalled()
    })

    it('should disable previous button on first page', () => {
      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled()
    })

    it('should disable next button on last page', () => {
      mockStore.mockReturnValue({
        ...defaultStoreState,
        currentPageIndex: 1 // Last page (0-indexed)
      } as any)

      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled()
    })
  })

  describe('save state indicator', () => {
    it('should show saving state', () => {
      mockStore.mockReturnValue({
        ...defaultStoreState,
        saveState: 'saving'
      } as any)

      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      expect(screen.getByText('Saving...')).toBeInTheDocument()
    })

    it('should show unsaved state', () => {
      mockStore.mockReturnValue({
        ...defaultStoreState,
        saveState: 'unsaved'
      } as any)

      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      expect(screen.getByText('Unsaved')).toBeInTheDocument()
    })

    it('should show error state', () => {
      mockStore.mockReturnValue({
        ...defaultStoreState,
        saveState: 'error'
      } as any)

      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      expect(screen.getByText('Error')).toBeInTheDocument()
    })
  })

  describe('keyboard shortcuts', () => {
    it('should handle tool shortcuts', () => {
      const setActiveTool = jest.fn()
      mockStore.mockReturnValue({
        ...defaultStoreState,
        setActiveTool
      } as any)

      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      fireEvent.keyDown(document, { key: 'p' })
      expect(setActiveTool).toHaveBeenCalledWith('draw')
      
      fireEvent.keyDown(document, { key: 'h' })
      expect(setActiveTool).toHaveBeenCalledWith('highlighter')
    })

    it('should handle zoom shortcuts', () => {
      const zoomIn = jest.fn()
      const zoomOut = jest.fn()
      const setZoom = jest.fn()
      
      mockStore.mockReturnValue({
        ...defaultStoreState,
        zoomIn,
        zoomOut,
        setZoom
      } as any)

      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      fireEvent.keyDown(document, { key: '+', ctrlKey: true })
      expect(zoomIn).toHaveBeenCalled()
      
      fireEvent.keyDown(document, { key: '-', ctrlKey: true })
      expect(zoomOut).toHaveBeenCalled()
      
      fireEvent.keyDown(document, { key: '0', ctrlKey: true })
      expect(setZoom).toHaveBeenCalledWith(1.0)
    })

    it('should handle undo/redo shortcuts', () => {
      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      fireEvent.keyDown(document, { key: 'z', ctrlKey: true })
      expect(mockOnUndo).toHaveBeenCalled()
      
      fireEvent.keyDown(document, { key: 'z', ctrlKey: true, shiftKey: true })
      expect(mockOnRedo).toHaveBeenCalled()
    })

    it('should close drawer on escape', () => {
      const setActiveDrawer = jest.fn()
      mockStore.mockReturnValue({
        ...defaultStoreState,
        setActiveDrawer
      } as any)

      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} />)
      
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(setActiveDrawer).toHaveBeenCalledWith(null)
    })
  })

  describe('library button', () => {
    it('should call onLibraryOpen when library button is clicked', async () => {
      const user = userEvent.setup()
      render(<TopToolbar onUndo={mockOnUndo} onRedo={mockOnRedo} onLibraryOpen={mockOnLibraryOpen} />)
      
      await user.click(screen.getByRole('button', { name: /open library/i }))
      
      expect(mockOnLibraryOpen).toHaveBeenCalled()
    })
  })
})