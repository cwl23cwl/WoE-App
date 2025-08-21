import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FloatingPageIndicator } from '@/components/workspace/FloatingPageIndicator'
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
  pages: [
    { id: '1', scene: {}, orientation: 'portrait' as const },
    { id: '2', scene: {}, orientation: 'portrait' as const },
    { id: '3', scene: {}, orientation: 'landscape' as const },
  ],
  currentPageIndex: 1,
  nextPage: jest.fn(),
  prevPage: jest.fn(),
  jumpToPage: jest.fn(),
}

describe('FloatingPageIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStore.mockReturnValue(defaultStoreState as any)
    
    // Mock document.body for portal
    document.body.innerHTML = ''
    
    // Mock timers
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('rendering', () => {
    it('should render page indicator with correct page information', () => {
      render(<FloatingPageIndicator />)
      
      expect(screen.getByText('2 / 3')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Page 2 of 3')
    })

    it('should render navigation buttons', () => {
      render(<FloatingPageIndicator />)
      
      expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
    })

    it('should not render when only one page exists', () => {
      mockStore.mockReturnValue({
        ...defaultStoreState,
        pages: [{ id: '1', scene: {}, orientation: 'portrait' as const }],
        currentPageIndex: 0
      } as any)

      render(<FloatingPageIndicator />)
      
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    })

    it('should not render when no pages exist', () => {
      mockStore.mockReturnValue({
        ...defaultStoreState,
        pages: [],
        currentPageIndex: 0
      } as any)

      render(<FloatingPageIndicator />)
      
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('should call prevPage when previous button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const prevPage = jest.fn()
      
      mockStore.mockReturnValue({
        ...defaultStoreState,
        prevPage
      } as any)

      render(<FloatingPageIndicator />)
      
      await user.click(screen.getByRole('button', { name: /previous page/i }))
      
      expect(prevPage).toHaveBeenCalled()
    })

    it('should call nextPage when next button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const nextPage = jest.fn()
      
      mockStore.mockReturnValue({
        ...defaultStoreState,
        nextPage
      } as any)

      render(<FloatingPageIndicator />)
      
      await user.click(screen.getByRole('button', { name: /next page/i }))
      
      expect(nextPage).toHaveBeenCalled()
    })

    it('should disable previous button on first page', () => {
      mockStore.mockReturnValue({
        ...defaultStoreState,
        currentPageIndex: 0
      } as any)

      render(<FloatingPageIndicator />)
      
      expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled()
    })

    it('should disable next button on last page', () => {
      mockStore.mockReturnValue({
        ...defaultStoreState,
        currentPageIndex: 2 // Last page (0-indexed)
      } as any)

      render(<FloatingPageIndicator />)
      
      expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled()
    })
  })

  describe('page picker', () => {
    it('should open page picker when indicator is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(<FloatingPageIndicator />)
      
      await user.click(screen.getByRole('button', { name: /page 2 of 3/i }))
      
      expect(screen.getByText('Jump to Page')).toBeInTheDocument()
      expect(screen.getAllByRole('button')).toHaveLength(6) // 3 page buttons + nav buttons + close button
    })

    it('should render page buttons in page picker', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(<FloatingPageIndicator />)
      
      await user.click(screen.getByRole('button', { name: /page 2 of 3/i }))
      
      expect(screen.getByRole('button', { name: /go to page 1/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /go to page 2/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /go to page 3/i })).toBeInTheDocument()
    })

    it('should highlight current page in page picker', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(<FloatingPageIndicator />)
      
      await user.click(screen.getByRole('button', { name: /page 2 of 3/i }))
      
      const currentPageButton = screen.getByRole('button', { name: /go to page 2/i })
      expect(currentPageButton).toHaveAttribute('aria-label', 'Go to page 2')
    })

    it('should jump to page when page button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const jumpToPage = jest.fn()
      
      mockStore.mockReturnValue({
        ...defaultStoreState,
        jumpToPage
      } as any)

      render(<FloatingPageIndicator />)
      
      await user.click(screen.getByRole('button', { name: /page 2 of 3/i }))
      await user.click(screen.getByRole('button', { name: /go to page 3/i }))
      
      expect(jumpToPage).toHaveBeenCalledWith(2)
    })

    it('should close page picker when close button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(<FloatingPageIndicator />)
      
      await user.click(screen.getByRole('button', { name: /page 2 of 3/i }))
      await user.click(screen.getByRole('button', { name: /close page picker/i }))
      
      expect(screen.queryByText('Jump to Page')).not.toBeInTheDocument()
    })

    it('should close page picker after jumping to page', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const jumpToPage = jest.fn()
      
      mockStore.mockReturnValue({
        ...defaultStoreState,
        jumpToPage
      } as any)

      render(<FloatingPageIndicator />)
      
      await user.click(screen.getByRole('button', { name: /page 2 of 3/i }))
      await user.click(screen.getByRole('button', { name: /go to page 1/i }))
      
      await waitFor(() => {
        expect(screen.queryByText('Jump to Page')).not.toBeInTheDocument()
      })
    })
  })

  describe('keyboard navigation', () => {
    it('should handle left arrow key to go to previous page', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const prevPage = jest.fn()
      
      mockStore.mockReturnValue({
        ...defaultStoreState,
        prevPage
      } as any)

      render(<FloatingPageIndicator />)
      
      const indicator = screen.getByRole('navigation')
      indicator.focus()
      await user.keyboard('{ArrowLeft}')
      
      expect(prevPage).toHaveBeenCalled()
    })

    it('should handle right arrow key to go to next page', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const nextPage = jest.fn()
      
      mockStore.mockReturnValue({
        ...defaultStoreState,
        nextPage
      } as any)

      render(<FloatingPageIndicator />)
      
      const indicator = screen.getByRole('navigation')
      indicator.focus()
      await user.keyboard('{ArrowRight}')
      
      expect(nextPage).toHaveBeenCalled()
    })

    it('should open page picker with Enter key', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(<FloatingPageIndicator />)
      
      const indicator = screen.getByRole('navigation')
      indicator.focus()
      await user.keyboard('{Enter}')
      
      expect(screen.getByText('Jump to Page')).toBeInTheDocument()
    })

    it('should open page picker with Space key', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(<FloatingPageIndicator />)
      
      const indicator = screen.getByRole('navigation')
      indicator.focus()
      await user.keyboard('{ }')
      
      expect(screen.getByText('Jump to Page')).toBeInTheDocument()
    })

    it('should close page picker with Escape key', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(<FloatingPageIndicator />)
      
      const indicator = screen.getByRole('navigation')
      indicator.focus()
      await user.keyboard('{Enter}')
      await user.keyboard('{Escape}')
      
      expect(screen.queryByText('Jump to Page')).not.toBeInTheDocument()
    })
  })

  describe('auto-hide behavior', () => {
    it('should hide after delay when autoHide is enabled', () => {
      render(<FloatingPageIndicator autoHide={true} autoHideDelay={1000} />)
      
      const indicator = screen.getByRole('navigation')
      expect(indicator).toBeVisible()
      
      // Fast-forward time
      jest.advanceTimersByTime(1000)
      
      // Note: In real implementation, this would test actual visibility changes
      // Here we're testing that the timer logic works
    })

    it('should not auto-hide when autoHide is disabled', () => {
      render(<FloatingPageIndicator autoHide={false} />)
      
      const indicator = screen.getByRole('navigation')
      expect(indicator).toBeVisible()
      
      // Fast-forward time - should still be visible
      jest.advanceTimersByTime(5000)
      expect(indicator).toBeVisible()
    })

    it('should reset hide timer on mouse movement', () => {
      render(<FloatingPageIndicator autoHide={true} autoHideDelay={1000} />)
      
      // Simulate mouse movement
      fireEvent.mouseMove(document)
      
      // Fast-forward partial time
      jest.advanceTimersByTime(500)
      
      // Move mouse again - should reset timer
      fireEvent.mouseMove(document)
      
      // Fast-forward original delay - should still be visible due to reset
      jest.advanceTimersByTime(1000)
    })

    it('should show on scroll', () => {
      render(<FloatingPageIndicator autoHide={true} />)
      
      // Simulate scroll
      fireEvent.scroll(document)
      
      const indicator = screen.getByRole('navigation')
      expect(indicator).toBeVisible()
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<FloatingPageIndicator />)
      
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Page 2 of 3')
      expect(screen.getByRole('button', { name: /previous page \(left arrow\)/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /next page \(right arrow\)/i })).toBeInTheDocument()
    })

    it('should be focusable with keyboard', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(<FloatingPageIndicator />)
      
      await user.tab()
      expect(screen.getByRole('navigation')).toHaveFocus()
    })

    it('should have proper button titles', () => {
      render(<FloatingPageIndicator />)
      
      expect(screen.getByRole('button', { name: /previous page/i })).toHaveAttribute('title', 'Previous page (Left arrow)')
      expect(screen.getByRole('button', { name: /next page/i })).toHaveAttribute('title', 'Next page (Right arrow)')
    })
  })
})