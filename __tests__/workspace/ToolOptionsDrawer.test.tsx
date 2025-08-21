import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToolOptionsDrawer } from '@/components/workspace/ToolOptionsDrawer'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

// Mock the store
jest.mock('@/stores/useWorkspaceStore')
const mockStore = useWorkspaceStore as jest.MockedFunction<typeof useWorkspaceStore>

// Mock createPortal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => children,
}))

const defaultStoreState = {
  activeDrawer: null,
  setActiveDrawer: jest.fn(),
  addRecentColor: jest.fn(),
  recentColors: ['#ff0000', '#00ff00'],
  activeTool: 'draw' as const,
  toolPrefs: {
    drawSize: 4,
    drawColor: '#000000',
    drawOpacity: 1.0,
    drawSmoothness: true,
    highlighterSize: 12,
    highlighterColor: '#FACC15',
    highlighterOpacity: 0.3,
    textSize: 18,
    textColor: '#000000',
    textFamily: 'system-ui, -apple-system, sans-serif',
    textBold: false,
    textItalic: false,
    textUnderline: false,
    textAlign: 'left' as const,
    eraserSize: 8,
    eraserMode: 'stroke' as const,
  },
  updateToolPref: jest.fn(),
}

describe('ToolOptionsDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStore.mockReturnValue(defaultStoreState as any)
    
    // Mock document.body for portal
    document.body.innerHTML = ''
  })

  describe('rendering', () => {
    it('should not render when no active drawer', () => {
      render(<ToolOptionsDrawer />)
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should render draw options when drawer is "draw"', () => {
      mockStore.mockReturnValue({
        ...defaultStoreState,
        activeDrawer: 'draw'
      } as any)

      render(<ToolOptionsDrawer />)
      
      expect(screen.getByRole('dialog', { name: /draw options/i })).toBeInTheDocument()
      expect(screen.getByText('Brush Size')).toBeInTheDocument()
      expect(screen.getByText('Color')).toBeInTheDocument()
      expect(screen.getByText('Opacity')).toBeInTheDocument()
      expect(screen.getByText('Smoothness')).toBeInTheDocument()
    })

    it('should render highlighter options when drawer is "highlighter"', () => {
      mockStore.mockReturnValue({
        ...defaultStoreState,
        activeDrawer: 'highlighter'
      } as any)

      render(<ToolOptionsDrawer />)
      
      expect(screen.getByRole('dialog', { name: /highlighter options/i })).toBeInTheDocument()
      expect(screen.getByText('Thickness')).toBeInTheDocument()
      expect(screen.getByText('Mark Over Text')).toBeInTheDocument()
    })

    it('should render text options when drawer is "text"', () => {
      mockStore.mockReturnValue({
        ...defaultStoreState,
        activeDrawer: 'text'
      } as any)

      render(<ToolOptionsDrawer />)
      
      expect(screen.getByRole('dialog', { name: /text options/i })).toBeInTheDocument()
      expect(screen.getByText('Font Size')).toBeInTheDocument()
      expect(screen.getByText('Font Family')).toBeInTheDocument()
      expect(screen.getByText('Style')).toBeInTheDocument()
      expect(screen.getByText('Alignment')).toBeInTheDocument()
    })

    it('should render eraser options when drawer is "erase"', () => {
      mockStore.mockReturnValue({
        ...defaultStoreState,
        activeDrawer: 'erase'
      } as any)

      render(<ToolOptionsDrawer />)
      
      expect(screen.getByRole('dialog', { name: /eraser options/i })).toBeInTheDocument()
      expect(screen.getByText('Eraser Size')).toBeInTheDocument()
      expect(screen.getByText('Erase Mode')).toBeInTheDocument()
    })

    it('should render color options when drawer is "color"', () => {
      mockStore.mockReturnValue({
        ...defaultStoreState,
        activeDrawer: 'color'
      } as any)

      render(<ToolOptionsDrawer />)
      
      expect(screen.getByRole('dialog', { name: /color picker/i })).toBeInTheDocument()
      expect(screen.getByText('Color Palette')).toBeInTheDocument()
      expect(screen.getByText('Recent Colors')).toBeInTheDocument()
      expect(screen.getByText('Custom Color')).toBeInTheDocument()
    })
  })

  describe('draw options', () => {
    beforeEach(() => {
      mockStore.mockReturnValue({
        ...defaultStoreState,
        activeDrawer: 'draw'
      } as any)
    })

    it('should display current brush size', () => {
      render(<ToolOptionsDrawer />)
      
      expect(screen.getByDisplayValue('4')).toBeInTheDocument()
    })

    it('should update brush size when slider changes', async () => {
      const user = userEvent.setup()
      const updateToolPref = jest.fn()
      
      mockStore.mockReturnValue({
        ...defaultStoreState,
        activeDrawer: 'draw',
        updateToolPref
      } as any)

      render(<ToolOptionsDrawer />)
      
      const slider = screen.getByRole('slider', { name: /brush size/i })
      await user.clear(slider)
      await user.type(slider, '8')
      fireEvent.change(slider, { target: { value: '8' } })
      
      expect(updateToolPref).toHaveBeenCalledWith('drawSize', 8)
    })

    it('should update opacity when slider changes', async () => {
      const updateToolPref = jest.fn()
      
      mockStore.mockReturnValue({
        ...defaultStoreState,
        activeDrawer: 'draw',
        updateToolPref
      } as any)

      render(<ToolOptionsDrawer />)
      
      const slider = screen.getByRole('slider', { name: /opacity/i })
      fireEvent.change(slider, { target: { value: '0.5' } })
      
      expect(updateToolPref).toHaveBeenCalledWith('drawOpacity', 0.5)
    })

    it('should toggle smoothness', async () => {
      const user = userEvent.setup()
      const updateToolPref = jest.fn()
      
      mockStore.mockReturnValue({
        ...defaultStoreState,
        activeDrawer: 'draw',
        updateToolPref
      } as any)

      render(<ToolOptionsDrawer />)
      
      const toggle = screen.getByRole('button', { name: /toggle smoothness/i })
      await user.click(toggle)
      
      expect(updateToolPref).toHaveBeenCalledWith('drawSmoothness', false)
    })

    it('should add recent color when color is selected', async () => {
      const user = userEvent.setup()
      const updateToolPref = jest.fn()
      const addRecentColor = jest.fn()
      
      mockStore.mockReturnValue({
        ...defaultStoreState,
        activeDrawer: 'draw',
        updateToolPref,
        addRecentColor
      } as any)

      render(<ToolOptionsDrawer />)
      
      const colorSwatch = screen.getAllByRole('button')[1] // First color swatch
      await user.click(colorSwatch)
      
      expect(addRecentColor).toHaveBeenCalled()
    })
  })

  describe('text options', () => {
    beforeEach(() => {
      mockStore.mockReturnValue({
        ...defaultStoreState,
        activeDrawer: 'text'
      } as any)
    })

    it('should display current font size', () => {
      render(<ToolOptionsDrawer />)
      
      expect(screen.getByDisplayValue('18')).toBeInTheDocument()
    })

    it('should update font family when select changes', async () => {
      const user = userEvent.setup()
      const updateToolPref = jest.fn()
      
      mockStore.mockReturnValue({
        ...defaultStoreState,
        activeDrawer: 'text',
        updateToolPref
      } as any)

      render(<ToolOptionsDrawer />)
      
      const select = screen.getByRole('combobox')
      await user.selectOptions(select, 'Arial, sans-serif')
      
      expect(updateToolPref).toHaveBeenCalledWith('textFamily', 'Arial, sans-serif')
    })

    it('should toggle bold style', async () => {
      const user = userEvent.setup()
      const updateToolPref = jest.fn()
      
      mockStore.mockReturnValue({
        ...defaultStoreState,
        activeDrawer: 'text',
        updateToolPref
      } as any)

      render(<ToolOptionsDrawer />)
      
      const boldButton = screen.getByRole('button', { name: /bold/i })
      await user.click(boldButton)
      
      expect(updateToolPref).toHaveBeenCalledWith('textBold', true)
    })

    it('should update text alignment', async () => {
      const user = userEvent.setup()
      const updateToolPref = jest.fn()
      
      mockStore.mockReturnValue({
        ...defaultStoreState,
        activeDrawer: 'text',
        updateToolPref
      } as any)

      render(<ToolOptionsDrawer />)
      
      const centerAlign = screen.getByRole('button', { name: /align center/i })
      await user.click(centerAlign)
      
      expect(updateToolPref).toHaveBeenCalledWith('textAlign', 'center')
    })
  })

  describe('eraser options', () => {
    beforeEach(() => {
      mockStore.mockReturnValue({
        ...defaultStoreState,
        activeDrawer: 'erase'
      } as any)
    })

    it('should display current eraser size', () => {
      render(<ToolOptionsDrawer />)
      
      expect(screen.getByDisplayValue('8')).toBeInTheDocument()
    })

    it('should toggle eraser mode', async () => {
      const user = userEvent.setup()
      const updateToolPref = jest.fn()
      
      mockStore.mockReturnValue({
        ...defaultStoreState,
        activeDrawer: 'erase',
        updateToolPref
      } as any)

      render(<ToolOptionsDrawer />)
      
      const objectMode = screen.getByRole('button', { name: /erase objects/i })
      await user.click(objectMode)
      
      expect(updateToolPref).toHaveBeenCalledWith('eraserMode', 'object')
    })
  })

  describe('interaction', () => {
    it('should close drawer when close button is clicked', async () => {
      const user = userEvent.setup()
      const setActiveDrawer = jest.fn()
      
      mockStore.mockReturnValue({
        ...defaultStoreState,
        activeDrawer: 'draw',
        setActiveDrawer
      } as any)

      render(<ToolOptionsDrawer />)
      
      const closeButton = screen.getByRole('button', { name: /close options/i })
      await user.click(closeButton)
      
      expect(setActiveDrawer).toHaveBeenCalledWith(null)
    })

    it('should close drawer on escape key', () => {
      const setActiveDrawer = jest.fn()
      
      mockStore.mockReturnValue({
        ...defaultStoreState,
        activeDrawer: 'draw',
        setActiveDrawer
      } as any)

      render(<ToolOptionsDrawer />)
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      expect(setActiveDrawer).toHaveBeenCalledWith(null)
    })

    it('should close drawer when clicking outside', async () => {
      const setActiveDrawer = jest.fn()
      
      mockStore.mockReturnValue({
        ...defaultStoreState,
        activeDrawer: 'draw',
        setActiveDrawer
      } as any)

      render(<ToolOptionsDrawer />)
      
      // Simulate clicking outside the drawer
      fireEvent.mouseDown(document.body)
      
      await waitFor(() => {
        expect(setActiveDrawer).toHaveBeenCalledWith(null)
      })
    })
  })

  describe('accessibility', () => {
    it('should have proper dialog role and label', () => {
      mockStore.mockReturnValue({
        ...defaultStoreState,
        activeDrawer: 'draw'
      } as any)

      render(<ToolOptionsDrawer />)
      
      const dialog = screen.getByRole('dialog', { name: /draw options/i })
      expect(dialog).toBeInTheDocument()
    })

    it('should have proper button labels', () => {
      mockStore.mockReturnValue({
        ...defaultStoreState,
        activeDrawer: 'text'
      } as any)

      render(<ToolOptionsDrawer />)
      
      expect(screen.getByRole('button', { name: /bold/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /italic/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /underline/i })).toBeInTheDocument()
    })

    it('should have proper slider labels', () => {
      mockStore.mockReturnValue({
        ...defaultStoreState,
        activeDrawer: 'draw'
      } as any)

      render(<ToolOptionsDrawer />)
      
      expect(screen.getByRole('slider', { name: /brush size/i })).toBeInTheDocument()
      expect(screen.getByRole('slider', { name: /opacity/i })).toBeInTheDocument()
    })
  })
})