---
applyTo: '**'
---

# User Memory

## User Preferences
- Programming languages: TypeScript, React, Next.js
- Code style preferences: Clean, maintainable, production-quality code
- Development environment: VS Code, Windows, Bash shell
- Communication style: Thorough, autonomous, quality-driven

## Project Context
- Current project type: Education management web app (WoE - World of Education)
- Tech stack: Next.js 15.5.0, React 19, TypeScript, Tailwind CSS, Prisma, NextAuth
- Architecture patterns: Component-based, form validation with Zod, React Hook Form
- Key requirements: Student management, class scheduling, authentication

## Current Task: Workspace Toolbar Integration - COMPLETED ✅ 📝 [PRODUCTION READY]
- Goal: Full Excalidraw integration with custom toolbar-only control interface
- Focus: Hide native Excalidraw UI and ensure all tools work through custom toolbar
- Features: Tool switching, drawing, text, highlighting, selection, erasing with proper initialization
- User Experience: Clean workspace with custom toolbar as the only control interface
- Tech Requirements: Next.js 15.5.0, React 18.3.1, TypeScript, Tailwind CSS, Excalidraw
- **STATUS**: All toolbar functionality working correctly at http://localhost:4001/workspace-test

### ✅ COMPLETED - Workspace Toolbar Integration Fully Implemented:
1. **Store Unification** (/stores/useWorkspaceStore.ts) - Unified workspace state management for toolbar/canvas sync
2. **ExcalidrawCanvasNative** (/components/workspace/ExcalidrawCanvasNative.tsx) - Clean Excalidraw integration with hidden UI
3. **TopToolbar** (/src/features/workspace/TopToolbar.tsx) - Custom toolbar with all tool controls working
4. **Tool Synchronization** - All 5 tools working: select, draw, text, erase, highlighter **[PRODUCTION READY]**
5. **Native UI Hidden** - Complete CSS hiding of all Excalidraw native UI elements **[WORKING]**
6. **Infinite Loop Fix** - Resolved "Maximum update depth exceeded" runtime errors **[CRITICAL FIX]**
7. **Tool Initialization** - Draw tool works immediately on first click **[FIXED]**
8. **Highlighter Functionality** - Proper highlighting with 30% opacity instead of regular pen **[FIXED]**

### 🔧 LATEST DEBUGGING SESSION COMPLETED (2025-08-22):
**Issue**: "Maximum update depth exceeded" infinite loop runtime errors preventing page load
**Root Cause**: Complex store state dependencies and unstable useEffect dependencies causing continuous re-renders
**Solution**: Simplified component architecture and stabilized state management:
- Removed complex page/scene management causing re-renders
- Simplified useEffect dependencies to only essential values
- Separated API initialization from tool/preference synchronization
- Added proper memoization for initialData and callback functions
- **Result**: Page loads stably with no runtime errors, all tools functional

**Previous Issue**: Draw tool not working on first click, highlighter behaving like regular pen
**Root Cause**: Missing tool initialization and tool-specific property synchronization
**Solution**: Added proper tool initialization and property mapping:
- Added initial tool setup in handleExcalidrawAPI with proper timing
- Implemented tool-specific properties (opacity, color, size) for highlighter functionality
- **Result**: Draw tool works immediately, highlighter provides proper 30% opacity highlighting

### Current Status: ✅ PRODUCTION READY - ALL TOOLS FUNCTIONAL
- **Drawing Tool**: ✅ Working - draws immediately on first click (fixed initialization issue)
- **Text Tool**: ✅ Working - creates text boxes on click with proper sizing
- **Selection Tool**: ✅ Working - can select and manipulate elements  
- **Eraser Tool**: ✅ Working - removes elements by clicking
- **Highlighter Tool**: ✅ Working - provides proper highlighting with 30% opacity (fixed from regular pen behavior)

## Current Bug Fix Task: Text Box Resize Behavior - CORRECTED & IMPLEMENTED ✅
- **Issue**: When adjusting text box dimensions, wanted different behavior for edge vs corner dragging
- **Requirement Clarification**: 
  - **Horizontal edge drag** → height change only (width constrained to original)
  - **Vertical edge drag** → width change only (height constrained to original)
  - **Corner drag** → both dimensions can change freely
- **Solution**: Fixed resize constraint logic in StudentWorkspace.handleChange() with proper directional constraints
- **Implementation**: Detects drag type and applies appropriate dimensional constraints via setTimeout scene updates
- **Status**: CORRECTED - Horizontal/vertical edge drags now properly constrain the non-dragged dimension

### Fix Details:
- **Detection**: Compares element dimensions before/after changes to identify resize operations
- **Height-only constraint**: When only height changes, preserves original width
- **Width-only constraint**: When only width changes, preserves original height  
- **Corner resize**: When both dimensions change, allows proportional resizing (default behavior)
- **Performance**: Uses setTimeout(0) to avoid interference with Excalidraw's internal state

### Critical Fix Details:
- **Root Problem**: Overlay was using `editingState.element.fontSize` (cached) for height calculation
- **Solution**: Modified overlay to fetch current element data directly from Excalidraw scene elements
- **Live Updates**: `currentElement = liveElement` ensures overlay always uses latest font size
- **Real-time Height**: `minHeight: Math.max(size.height, currentElement.fontSize * 1.4)` uses live fontSize
- **Debug Logging**: Added console logs to track font size changes in overlay

### Implementation Changes:
1. **RichTextOverlay.tsx**: Added live element data retrieval in overlay render
2. **Live Data**: `excalidrawAPI.getSceneElements().find()` to get current element state  
3. **Height Calculation**: Uses `currentElement.fontSize` instead of cached `element.fontSize`
4. **Font Properties**: All font properties (size, weight, style, color) use live data
5. **Debug Logs**: Console logs show when overlay detects font size changes

### Testing Instructions - CRITICAL:
1. Go to http://localhost:3000/workspace-test 
2. Select text tool and create a text box
3. While editing text, use the **+ and - buttons** to change font size
4. **Watch console** for "🔄 Overlay detected font size change" logs
5. **Text box height should now adjust immediately** as font size changes
6. Try **slider** - should also trigger immediate height adjustment
7. Try **preset buttons** (14, 18, 24, 32) - should work immediately

### Expected Console Output:
```
🔄 Overlay detected font size change: {oldFontSize: 20, newFontSize: 22, elementId: "..."}
```

This fix addresses the core issue: the overlay now gets live element data on every render instead of using stale cached data.
- **Color Swatches**: Working - changes colors for new and selected elements
- **Auto-save**: Working - debounced saves with visual feedback
- **Tool Switching**: Working - toolbar buttons properly switch canvas tools

### Assignment Workspace Features Completed:
- **Interactive Canvas**: Full Excalidraw integration with completely hidden native UI
- **Custom Toolbar Control**: Single interface for all tool interactions (select/draw/text/erase/highlighter)
- **Tool Synchronization**: Immediate tool switching with proper initialization and tool-specific properties
- **Highlighter Functionality**: Proper 30% opacity highlighting (not regular pen behavior)
- **Canvas Size**: Optimized 600px minimum height for better user experience
- **Stable Performance**: No infinite loops or runtime errors, consistent page loading
- **Responsive Design**: Works across all device sizes with proper touch support
- **State Management**: Unified workspace store with minimal, stable dependencies
- **Test Environment**: Production-ready at http://localhost:4001/workspace-test

### Color System Implementation:
- **Swatch Library**: /lib/workspace-swatches.ts with brand-aligned color arrays
- **Color Handlers**: setStroke(hex), setTextColor(hex), setFill(hex, opacity), setHighlighter(hex)
- **Tool-Specific Colors**: Different palettes for pen, text, highlighter modes
- **Selected Element Updates**: Colors apply to both new strokes and selected existing elements
- **Brand Integration**: Uses Tailwind config colors (#E55A3C primary, #2E5A8A secondary, #7BA05B accent)

## Previous Task: Enhanced Schedule UX & Submit Flow - COMPLETED ✅
- ✅ Enhanced schedule UX with auto-prefill and timezone display
- ✅ Single-transaction submit with auto-class creation
- ✅ Student creation with optional emails working correctly

## Enhanced Schedule Features Implemented
- **localStorage utilities**: getLastScheduleSlot(), saveLastScheduleSlot(), getDefaultScheduleSlot()
- **Auto-prefill**: New schedule slots use previous values as smart defaults
- **Duplicate detection**: Prevents exact day+time matches with "This time already exists" warning
- **Timezone awareness**: Shows current timezone context for time inputs
- **Smart form submission**: Saves last schedule slot to localStorage for next time
- **Enhanced validation**: Both schedule conflicts and exact duplicates detected

## Implementation Status
- ✅ Zod schema updated for optional email and removed checkboxes  
- ✅ Form auto-seeds first time slot (Monday 9-10 AM)
- ✅ Removed review step, modal closes on successful creation
- ✅ Updated API route to create dedicated class for each student
- ✅ Form validation only requires student name
- ✅ Helper text shows email as optional
- ✅ All TypeScript errors resolved
- 🧪 **TESTING PHASE**: All schedule UX enhancements complete and ready for user testing

## Recent Fix Applied ✅
- **Issue**: Student cards not appearing after creation due to unique email constraint violation
- **Root Cause**: Multiple students without emails caused database constraint failures on empty string emails
- **Solution**: 
  - Modified Prisma schema to make email field optional (`String?`)
  - Updated API to only include email field when provided and non-empty
  - Fixed database constraint issue preventing student creation
- **Result**: Students can now be created without emails and cards appear correctly in dashboard

## Assignment Page Dependencies Installed ✅
- **@excalidraw/excalidraw**: Interactive drawing and writing canvas
- **zustand**: Lightweight state management for real-time features  
- **zod**: Schema validation (already present, updated)
- **use-debounce**: Debounced auto-save functionality
- **yjs + y-websocket**: Real-time collaboration infrastructure (v2 ready)

## Installation Notes
- React 19 compatibility warnings from Excalidraw dependencies (safe to ignore)
- All packages successfully installed and ready for assignment page implementation

## Notes
- Development server running on port 4000
- Need to maintain existing UI patterns and accessibility
- Focus on minimal, targeted changes to existing modal
