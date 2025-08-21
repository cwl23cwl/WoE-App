import { render, screen } from '@testing-library/react'
import { StudentWorkspacePage } from '../../src/pages/student/StudentWorkspacePage'

// Mock Lucide React icons to avoid issues with SVG rendering in tests
jest.mock('lucide-react', () => ({
  HelpCircle: () => <div data-testid="help-icon" />,
  User: () => <div data-testid="user-icon" />,
  MoreVertical: () => <div data-testid="menu-icon" />,
  MousePointer: () => <div data-testid="select-icon" />,
  Pencil: () => <div data-testid="pencil-icon" />,
  Type: () => <div data-testid="text-icon" />,
  Eraser: () => <div data-testid="eraser-icon" />,
  Highlighter: () => <div data-testid="highlighter-icon" />,
  RotateCcw: () => <div data-testid="undo-icon" />,
  RotateCw: () => <div data-testid="redo-icon" />,
  ZoomOut: () => <div data-testid="zoom-out-icon" />,
  ZoomIn: () => <div data-testid="zoom-in-icon" />,
  ChevronLeft: () => <div data-testid="prev-icon" />,
  ChevronRight: () => <div data-testid="next-icon" />,
  Trash2: () => <div data-testid="clear-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Volume2: () => <div data-testid="volume-icon" />,
  BookOpen: () => <div data-testid="book-icon" />,
}))

describe('StudentWorkspacePage', () => {
  it('renders without crashing', () => {
    render(<StudentWorkspacePage />)
    
    // Check that main elements are present
    expect(screen.getByText('My Work Space')).toBeInTheDocument()
    expect(screen.getByText('Student View')).toBeInTheDocument()
  })

  it('displays the main workspace sections', () => {
    render(<StudentWorkspacePage />)
    
    // Check for main workspace sections
    expect(screen.getByText('Pages')).toBeInTheDocument()
    expect(screen.getByText('My Canvas')).toBeInTheDocument()
    expect(screen.getByText('What to do')).toBeInTheDocument()
  })

  it('has drawing tools in the toolbar', () => {
    render(<StudentWorkspacePage />)
    
    // Check for drawing tools
    expect(screen.getByLabelText('Select tool')).toBeInTheDocument()
    expect(screen.getByLabelText('Draw tool')).toBeInTheDocument()
    expect(screen.getByLabelText('Text tool')).toBeInTheDocument()
    expect(screen.getByLabelText('Erase tool')).toBeInTheDocument()
    expect(screen.getByLabelText('Mark tool')).toBeInTheDocument()
  })

  it('shows canvas placeholder content', () => {
    render(<StudentWorkspacePage />)
    
    expect(screen.getByText('Start drawing here')).toBeInTheDocument()
    expect(screen.getByText('Pick a tool from above and start creating')).toBeInTheDocument()
  })

  it('has accessible buttons with proper labels', () => {
    render(<StudentWorkspacePage />)
    
    // Check for accessible buttons
    expect(screen.getByLabelText('Help')).toBeInTheDocument()
    expect(screen.getByLabelText('Add page')).toBeInTheDocument()
    expect(screen.getByLabelText('Turn in')).toBeInTheDocument()
    expect(screen.getByLabelText('Listen to instructions')).toBeInTheDocument()
  })

  it('shows the saved status indicator', () => {
    render(<StudentWorkspacePage />)
    
    // Check for status indicator - it shows as checkmark on mobile, "Saved" on desktop
    const statusElement = screen.getByRole('status')
    expect(statusElement).toBeInTheDocument()
    expect(statusElement).toHaveAttribute('aria-live', 'polite')
  })

  it('has proper heading structure', () => {
    render(<StudentWorkspacePage />)
    
    // Check for proper heading hierarchy
    expect(screen.getByRole('heading', { level: 1, name: 'My Work Space' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Pages' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'My Canvas' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'What to do' })).toBeInTheDocument()
  })

  it('includes canvas area ready for Konva integration', () => {
    render(<StudentWorkspacePage />)
    
    // Check for canvas container
    const canvasContainer = screen.getByLabelText('Drawing area')
    expect(canvasContainer).toBeInTheDocument()
    expect(canvasContainer).toHaveAttribute('role', 'application')
    
    // Check for Konva stage container
    const konvaStage = document.getElementById('konva-stage')
    expect(konvaStage).toBeInTheDocument()
  })
})