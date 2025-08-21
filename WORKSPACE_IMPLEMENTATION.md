# Unified Workspace Implementation

## Overview

This document outlines the complete implementation of the unified workspace system with a modern, centered top toolbar, contextual sub-toolbars, and a clean page canvas.

## Architecture

### Components Structure

```
components/workspace/
├── TopToolbar.tsx              # Main toolbar with three groups
├── ToolOptionsDrawer.tsx       # Contextual sub-toolbars
├── PageCanvas.tsx              # Clean page canvas with borders
├── FloatingPageIndicator.tsx   # Page navigation indicator
└── [supporting components...]

stores/
└── useWorkspaceStore.ts        # Enhanced Zustand store

styles/
└── workspace.css               # Custom workspace styles

__tests__/workspace/
├── useWorkspaceStore.test.ts   # Store tests
├── TopToolbar.test.tsx         # Toolbar tests
├── ToolOptionsDrawer.test.tsx  # Drawer tests
└── FloatingPageIndicator.test.tsx # Indicator tests
```

## Core Components

### 1. TopToolbar Component

**File**: `components/workspace/TopToolbar.tsx`

The main toolbar with three distinct groups as specified:

#### Left Group: Tools
- Select, Draw, Highlighter, Text, Erase, Shapes
- Color picker icon showing current tool color
- Size controls with +/- buttons

#### Center Group: Navigation & Actions
- Zoom dropdown (50%, 75%, 100%, 125%, 150%)
- Undo button (with state management)
- Redo button (with state management)

#### Right Group: Status & Library
- Page navigation (prev/next + page count)
- Save status indicator ("Saved", "Saving...", "Unsaved", "Error")
- Library button (optional)

**Features:**
- Full keyboard accessibility (Tab order, ARIA labels)
- Keyboard shortcuts (V, P, H, T, E, S for tools; Ctrl+Z/Y for undo/redo)
- Responsive design with mobile considerations
- High contrast focus rings
- ESL-friendly labels and descriptions

### 2. ToolOptionsDrawer Component

**File**: `components/workspace/ToolOptionsDrawer.tsx`

Contextual sub-toolbars that slide down from the toolbar:

#### Draw Options
- Brush size slider (1-24px)
- Color swatches with brand colors
- Recent colors (last 6 used)
- Opacity slider (0.1-1.0)
- Smoothness toggle
- Hex color input

#### Highlighter Options
- Thickness slider (4-32px)
- Highlighter-specific color palette
- Multiply blend mode for text marking
- Fixed opacity (~0.3)

#### Text Options
- Font size slider (8-72px)
- Font family dropdown (System, Arial, Times, Courier)
- Style toggles (Bold, Italic, Underline)
- Text alignment buttons (Left, Center, Right)
- Text color picker

#### Eraser Options
- Eraser size slider (2-50px)
- Mode toggle (Stroke erase vs Object erase)
- Visual feedback for mode selection

**Features:**
- Only one drawer open at a time
- Click active tool to toggle drawer
- Click outside or Escape to close
- Persistent settings via localStorage
- Portal rendering to avoid layout shift
- Focus trap for accessibility

### 3. PageCanvas Component

**File**: `components/workspace/PageCanvas.tsx`

Clean, bordered canvas with professional appearance:

**Features:**
- White background with 1px neutral border
- Subtle outer shadow for depth
- Responsive sizing (fits viewport width, scrollable vertically)
- Portrait/landscape orientation support
- Optional margin guides (dotted lines)
- PDF background support (renders under drawing layers)
- Proper hit regions for drawing tools
- Loading states during resize operations

**Specifications:**
- Default page size: 850x1100 logical units (US Letter aspect ratio)
- Scales to fit viewport with 40px padding
- Respects zoom level from store
- Accessibility support with screen reader announcements

### 4. FloatingPageIndicator Component

**File**: `components/workspace/FloatingPageIndicator.tsx`

Small floating indicator below the toolbar:

**Features:**
- Shows "Page X of Y" format
- Auto-hide after 3 seconds of inactivity
- Keyboard navigation (Left/Right arrows for navigation)
- Click to open page picker with thumbnails
- Smooth animations and transitions
- Accessibility compliant

**Interaction:**
- Appears on mouse movement or scroll
- Remains visible while focused
- Page picker shows grid of page numbers
- Keyboard: Enter/Space to open picker, Escape to close

### 5. Enhanced Workspace Store

**File**: `stores/useWorkspaceStore.ts`

Comprehensive Zustand store with localStorage persistence:

#### State Management
- Tool selection and active drawer state
- Zoom controls with preset values
- Page management (add, remove, navigate)
- Save state tracking
- Canvas history (undo/redo capabilities)

#### Tool Preferences (Persisted)
- Draw: size, color, opacity, smoothness
- Highlighter: size, color, opacity
- Text: size, color, family, bold, italic, underline, alignment
- Eraser: size, mode

#### Recent Colors
- Tracks last 6 used colors
- Automatically managed (moves existing to front)
- Persisted across sessions

**Helper Hooks:**
- `useDrawPrefs()` - Draw tool preferences
- `useHighlighterPrefs()` - Highlighter preferences  
- `useTextPrefs()` - Text tool preferences
- `useEraserPrefs()` - Eraser preferences

## Styling

### Custom CSS

**File**: `styles/workspace.css`

Includes:
- Custom slider thumb styles
- Canvas scroll behavior
- Toolbar animations (slide-down/up)
- Focus trap styles
- Color swatch animations
- Tool button hover effects
- Responsive breakpoints
- High contrast mode support
- Reduced motion support
- Print styles

### Tailwind Integration

All components use Tailwind CSS with custom utilities:
- Consistent spacing and colors
- Dark mode ready (future enhancement)
- Mobile-first responsive design
- Accessibility-focused color contrast

## Testing

### Unit Tests Coverage

**Store Tests** (`__tests__/workspace/useWorkspaceStore.test.ts`):
- ✅ Initial state validation
- ✅ Tool management
- ✅ Zoom functionality
- ✅ Page management
- ✅ Tool preferences
- ✅ Recent colors
- ✅ Save state management
- ✅ Canvas history

**TopToolbar Tests** (`__tests__/workspace/TopToolbar.test.tsx`):
- ✅ Component rendering
- ✅ Tool selection
- ✅ Size controls
- ✅ Zoom controls
- ✅ Undo/redo functionality
- ✅ Page navigation
- ✅ Save state indicators
- ✅ Keyboard shortcuts
- ✅ Accessibility

**ToolOptionsDrawer Tests** (`__tests__/workspace/ToolOptionsDrawer.test.tsx`):
- ✅ Drawer rendering for each tool
- ✅ Draw options functionality
- ✅ Text options functionality
- ✅ Eraser options functionality
- ✅ User interactions
- ✅ Accessibility compliance

**FloatingPageIndicator Tests** (`__tests__/workspace/FloatingPageIndicator.test.tsx`):
- ✅ Page indicator rendering
- ✅ Navigation functionality
- ✅ Page picker interactions
- ✅ Keyboard navigation
- ✅ Auto-hide behavior
- ✅ Accessibility features

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Usage Example

### Basic Implementation

```tsx
import { TopToolbar } from '@/components/workspace/TopToolbar'
import { ToolOptionsDrawer } from '@/components/workspace/ToolOptionsDrawer'
import { PageCanvas } from '@/components/workspace/PageCanvas'
import { FloatingPageIndicator } from '@/components/workspace/FloatingPageIndicator'

function WorkspacePage() {
  const handleUndo = () => {
    // Implement undo logic
  }

  const handleRedo = () => {
    // Implement redo logic  
  }

  const handleCanvasChange = (isDirty: boolean) => {
    // Handle canvas dirty state
    if (isDirty) {
      // Trigger auto-save, etc.
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Toolbar */}
      <TopToolbar
        onUndo={handleUndo}
        onRedo={handleRedo}
        onLibraryOpen={() => console.log('Library opened')}
      />

      {/* Tool Options Drawer */}
      <ToolOptionsDrawer />

      {/* Main Canvas Area */}
      <PageCanvas
        onDirtyChange={handleCanvasChange}
        canvasComponent={YourCanvasComponent}
        showMargins={true}
      />

      {/* Floating Page Indicator */}
      <FloatingPageIndicator />
    </div>
  )
}
```

### Canvas Integration

```tsx
// Example canvas component integration
function MyCanvasComponent({ 
  width, 
  height, 
  zoom, 
  activeTool, 
  toolPrefs, 
  pageData, 
  onChange 
}) {
  // Your canvas implementation (Konva, Fabric, etc.)
  return (
    <div 
      className="w-full h-full"
      onMouseDown={() => onChange?.()}
    >
      {/* Your canvas content */}
    </div>
  )
}
```

## Migration Guide

### From Existing Workspace

1. **Replace old toolbar** with `<TopToolbar />`
2. **Remove existing tool panels** and use `<ToolOptionsDrawer />`
3. **Wrap canvas** with `<PageCanvas />` component
4. **Add page indicator** with `<FloatingPageIndicator />`
5. **Update store imports** to use new `useWorkspaceStore`
6. **Import workspace styles** in your app

### State Migration

```tsx
// Old store usage
const { tool, setTool, zoom, setZoom } = useOldStore()

// New store usage  
const { 
  activeTool, 
  setActiveTool, 
  zoom, 
  setZoom,
  toolPrefs,
  updateToolPref 
} = useWorkspaceStore()
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `V` | Select tool |
| `P` | Draw tool |
| `H` | Highlighter tool |
| `T` | Text tool |
| `E` | Eraser tool |
| `S` | Shapes tool |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl++` | Zoom in |
| `Ctrl+-` | Zoom out |
| `Ctrl+0` | Reset zoom |
| `Escape` | Close drawer |
| `←/→` | Navigate pages (when page indicator focused) |

## Accessibility Features

### WCAG AA Compliance
- ✅ Color contrast ratios meet AA standards
- ✅ Focus indicators with high contrast rings  
- ✅ Large click targets (minimum 44px)
- ✅ Screen reader support with proper ARIA labels
- ✅ Keyboard navigation for all functionality
- ✅ Focus trap in modal dialogs

### Screen Reader Support
- Tool buttons announce current state
- Sliders announce values and changes
- Page navigation announces current page
- Drawer opening/closing is announced
- Canvas changes are announced to assistive technology

### Motor Accessibility  
- Large hit targets for all interactive elements
- Hover states don't require precise positioning
- Keyboard alternatives for all mouse interactions
- No drag-and-drop requirements for core functionality

## Performance Considerations

### Optimizations
- ✅ Debounced localStorage writes
- ✅ Portal rendering prevents layout shift
- ✅ Memoized expensive calculations
- ✅ Efficient re-rendering with targeted state updates
- ✅ Lazy loading of non-critical components

### Bundle Size
- Tree-shakeable exports
- Minimal external dependencies
- CSS purging for unused styles
- Icon loading optimization

## Browser Support

### Modern Browser Features Used
- CSS Grid and Flexbox
- CSS Custom Properties
- ResizeObserver (with polyfill)
- IntersectionObserver (with polyfill)
- localStorage (with fallback)

### Supported Browsers
- Chrome 88+
- Firefox 85+ 
- Safari 14+
- Edge 88+

## Future Enhancements

### Planned Features
- [ ] Page thumbnails in page picker
- [ ] Drag-and-drop page reordering
- [ ] Custom color palette creation
- [ ] Workspace themes (dark mode)
- [ ] Collaborative cursors
- [ ] Advanced text formatting
- [ ] Shape library integration
- [ ] Export/import workspace settings

### Performance Improvements
- [ ] Virtual scrolling for large page counts
- [ ] Web Workers for heavy computations
- [ ] Service Worker for offline functionality
- [ ] Progressive loading of page content

## Deployment Notes

### Build Requirements
- Next.js 15.1+
- React 19+
- TypeScript 5.7+
- Tailwind CSS 3.4+

### Environment Setup
1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Run tests: `npm test`
4. Build for production: `npm run build`

### Production Considerations
- Enable gzip compression
- Configure proper cache headers for assets
- Monitor performance with Core Web Vitals
- Test with assistive technologies

---

This implementation provides a complete, production-ready workspace system that meets all specified requirements while maintaining high standards for accessibility, performance, and user experience.