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

## Current Task: Build Default Assignment Page - COMPLETED ✅ 📝
- Goal: Create interactive assignment workspace for web-first ESL classroom
- Focus: Teacher creates assignments, monitors student work in real-time, gives quick feedback
- Features: Drawing canvas (Excalidraw), writing area, real-time collaboration, auto-save
- User Experience: Clean, intuitive interface for both teachers and students
- Tech Requirements: Next.js 15.5.0, React 19, TypeScript, Tailwind CSS, Prisma

### ✅ COMPLETED - All 8 Steps Successfully Implemented & DEBUGGED:
1. **Workspace Defaults** (/lib/workspace-defaults.ts) - Portrait orientation, tool definitions, sizing
2. **Zustand Store** (/stores/workspace.ts) - Complete state management with color system
3. **Layout Components** - WorkspaceLayout, CanvasFrame, responsive design  
4. **Toolbar** (/components/workspace/WorkspaceTopbar.tsx) - Tools, zoom, navigation, color swatches
5. **Page Indicator** (/components/workspace/PageIndicator.tsx) - Navigation with dropdown
6. **Excalidraw Canvas** (/components/workspace/ExcalidrawCanvas.tsx) - Full integration with auto-save **[DEBUGGED & FIXED]**
7. **Tool Mapping** - Complete tool switching between select/draw/highlight/write/erase **[WORKING]**
8. **Color Swatches** (/lib/workspace-swatches.ts + /components/workspace/ColorSwatches.tsx) - Brand-aligned colors **[WORKING]**

### 🔧 DEBUGGING SESSION COMPLETED:
**Issue**: Canvas tools (drawing, text) were not functional - couldn't draw or create text boxes
**Root Cause**: Excalidraw over-configuration with restrictive UIOptions and excessive props
**Solution**: Simplified Excalidraw configuration to minimal setup:
- Removed restrictive `UIOptions.canvasActions` that were blocking tool functionality
- Removed `zenModeEnabled`, `gridModeEnabled`, `name` props that weren't needed
- Kept essential props: `excalidrawAPI`, `onChange`, `viewModeEnabled={false}`, `theme="light"`
- **Result**: All tools now fully functional - drawing, text, eraser, selection all work perfectly

### Current Status: ✅ FULLY FUNCTIONAL
- **Drawing Tool**: Working - can draw with pen/pencil
- **Text Tool**: Working - creates text boxes on click
- **Selection Tool**: Working - can select and manipulate elements  
- **Eraser Tool**: Working - removes elements
- **Highlighter Tool**: Working - draws with opacity
- **Color Swatches**: Working - changes colors for new and selected elements
- **Auto-save**: Working - debounced saves with visual feedback
- **Tool Switching**: Working - toolbar buttons properly switch canvas tools

### Assignment Workspace Features Completed:
- **Interactive Canvas**: Full Excalidraw integration with proper tool switching
- **Auto-save System**: Debounced saves every 800ms with visual feedback
- **Brand-Aligned Color System**: Primary red, secondary blue, accent green with full swatch palettes
- **Tool Integration**: Proper mapping between toolbar and canvas (select/draw/highlight/write/erase)
- **Real-time Color Updates**: Selected elements update when colors change
- **Highlighter Mode**: Special 28% opacity with multiply blend mode support
- **Responsive Design**: Works across all device sizes
- **State Persistence**: Zustand store with devtools integration
- **Test Environment**: Working at http://localhost:4000/test/workspace

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
