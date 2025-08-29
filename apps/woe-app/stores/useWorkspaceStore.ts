'use client';

import React from 'react';
import { create } from 'zustand';

/** ====== Tooling Types ====== */
export type ToolType = 'select' | 'draw' | 'highlighter' | 'text' | 'erase' | 'shapes';
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/** A single “page” in your workspace */
export type Page = {
  id: string;
  name: string;
  title?: string;                 // <- added to satisfy page.tsx reads
  elements: any[];
  appState?: Record<string, any>;
  files?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
};

/** Optional payload for applying text styles to selection */
type TextStylePayload = Partial<{
  color: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  textAlign: 'left' | 'center' | 'right';
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
}>;

/** A read-only snapshot of current selection’s text styles */
export type DerivedTextStyle = Partial<{
  fontSize: number;
  color: string;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  textAlign: 'left' | 'center' | 'right';
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
}>;

/** ====== Font Mapping ====== */

// Extract actual font name for direct use
function extractFontName(uiFontFamily: string): string {
  // If it's already a clean font name, return as-is
  if (typeof uiFontFamily === 'string' && !uiFontFamily.includes(',')) {
    return uiFontFamily;
  }
  
  // Extract the first font name from font-family string
  const fontName = uiFontFamily.split(',')[0].replace(/['"]/g, '').trim();
  
  // Map special cases
  if (uiFontFamily.includes('Comic Sans')) {
    return 'Comic Sans MS';
  }
  if (uiFontFamily.includes('Courier') || uiFontFamily.includes('monospace')) {
    return 'Courier New';
  }
  
  return fontName;
}

/** ====== Canvas Background Types ====== */
export type CanvasBackgroundType = 'solid' | 'grid' | 'dots';
export type BackgroundMode = 'text' | 'canvas';

export type CanvasBackground = {
  enabled: boolean;
  type: CanvasBackgroundType;
  color: string;
  density: number;  // Grid/dot spacing in pixels (4-40)
  opacity: number;  // 0-1
  snap: boolean;    // Snap-to-grid functionality
};

/** ====== Defaults ====== */
const DEFAULT_TOOL_PREFS = {
  textColor: '#111827',
  textSize: 24,
  textFamily: 'Open Sans, sans-serif',
  textBold: false,
  textItalic: false,
  textUnderlined: false,
  textAlign: 'left' as const,
  textBackgroundFill: 'transparent',
  textBackgroundColor: 'transparent',
  textBorderColor: '#000000',
  textBorderWidth: 0,
  drawColor: '#111827',
  drawSize: 4,
  highlighterColor: '#FFF176',
  highlighterSize: 12,
  highlighterOpacity: 0.3,
  shapeColor: '#111827',
  shapeSize: 4,
};

const DEFAULT_CANVAS_BACKGROUND: CanvasBackground = {
  enabled: false,
  type: 'solid',
  color: '#ffffff',
  density: 20,
  opacity: 1.0,
  snap: false,
};

/** ====== Utils ====== */
const uid = (p = 'pg') => `${p}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
const now = () => Date.now();

/** ====== Store Shape ====== */
type WorkspaceState = {
  // Tool/UI
  activeTool: ToolType;
  expandedTool: ToolType | null;
  toolPrefs: Record<string, any>;
  excalidrawAPI: any | null;

  // Background controls
  backgroundMode: BackgroundMode;
  canvasBackground: CanvasBackground;
  setBackgroundMode: (mode: BackgroundMode) => void;
  updateCanvasBackground: (updates: Partial<CanvasBackground>) => void;

  // Selection / editing (needed by page.tsx)
  selectedElementIds: string[];                      // <- added
  setSelectedElementIds: (ids: string[]) => void;    // <- added
  editingTextId: string | null;                      // <- added (Excalidraw editing element id or null)
  setEditingTextId: (id: string | null) => void;     // <- added

  // Save state
  saveState: SaveState;
  setSaveState: (s: SaveState) => void;

  // Pages
  pages: Page[];
  currentPageIndex: number;

  // Tool actions
  setActiveTool: (tool: ToolType) => void;
  selectTool: (tool: ToolType) => void;
  setExpandedTool: (tool: ToolType | null) => void;
  updateToolPref: (key: string, value: any) => void;
  setExcalidrawAPI: (api: any | null) => void;

  // Text helpers
  applyTextStyleToSelection: (payload: TextStylePayload) => void;
  resetTextTool: () => void;

  // Page actions
  jumpToPage: (index: number) => void;
  addPage: (name?: string) => void;
  deletePage: (index?: number) => void;
  duplicatePage: (index?: number) => void;

  /**
   * updateCurrentPage can be called either with:
   *  - (elements, appState)  — as done in page.tsx
   *  - (partialPage)         — to merge a custom partial
   */
  updateCurrentPage: (...args: any[]) => void;
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  /** ====== Initial State ====== */
  activeTool: 'draw',
  expandedTool: null,
  toolPrefs: { ...DEFAULT_TOOL_PREFS },
  excalidrawAPI: null,

  // Background controls
  backgroundMode: 'text',
  canvasBackground: { ...DEFAULT_CANVAS_BACKGROUND },
  setBackgroundMode: (mode) => set({ backgroundMode: mode }),
  updateCanvasBackground: (updates) => set((state) => ({
    canvasBackground: { ...state.canvasBackground, ...updates }
  })),

  selectedElementIds: [],
  setSelectedElementIds: (ids) => set({ selectedElementIds: ids }),
  editingTextId: null,
  setEditingTextId: (id) => set({ editingTextId: id }),

  saveState: 'idle',
  setSaveState: (s) => set({ saveState: s }),

  // starter page
  pages: [
    {
      id: uid(),
      name: 'Page 1',
      title: 'Page 1',
      elements: [],
      appState: {},
      files: {},
      createdAt: now(),
      updatedAt: now(),
    },
  ],
  currentPageIndex: 0,

  /** ====== Tool Actions ====== */
  setActiveTool: (tool) => {
    set({ activeTool: tool });
    const api = get().excalidrawAPI;
    try {
      const map: Record<ToolType, string> = {
        select: 'selection',
        draw: 'freedraw',
        highlighter: 'freedraw',
        text: 'text',
        erase: 'eraser',
        shapes: 'rectangle',
      };
      api?.setActiveTool?.({ type: map[tool] ?? 'freedraw' });
    } catch {}
  },

  selectTool: (tool) => {
    const { activeTool, expandedTool, toolPrefs, excalidrawAPI: api } = get();
    if (activeTool !== tool) get().setActiveTool(tool);

    // push defaults into appState when selecting a tool
    try {
      if (api) {
        if (tool === 'draw') {
          api.updateScene?.({
            appState: {
              currentItemStrokeColor: toolPrefs.drawColor ?? '#111827',
              currentItemStrokeWidth: toolPrefs.drawSize ?? 4,
              currentItemOpacity: 100,
              currentItemStrokeStyle: 'solid',
              currentItemRoughness: 0,
            },
          });
        } else if (tool === 'highlighter') {
          api.updateScene?.({
            appState: {
              currentItemStrokeColor: toolPrefs.highlighterColor ?? '#FFF176',
              currentItemStrokeWidth: toolPrefs.highlighterSize ?? 12,
              currentItemOpacity: Math.round(((toolPrefs.highlighterOpacity ?? 0.3) * 100)),
              currentItemStrokeStyle: 'solid',
              currentItemRoughness: 0,
            },
          });
        } else if (tool === 'text') {
          api.updateScene?.({
            appState: {
              currentItemStrokeColor: toolPrefs.textColor ?? '#111827',
              currentItemFontSize: toolPrefs.textSize ?? 24,
              currentItemStrokeStyle: 'solid',
            },
          });
        }
      }
    } catch {}

    // Accordion rule: same tool keeps open; different tool switches; none -> open
    if (expandedTool === null) set({ expandedTool: tool });
    else if (expandedTool !== tool) set({ expandedTool: tool });
    else {
      // same tool -> keep open
    }
  },

  setExpandedTool: (tool) => set({ expandedTool: tool }),

  updateToolPref: (key, value) =>
    set((state) => ({ toolPrefs: { ...state.toolPrefs, [key]: value } })),

  setExcalidrawAPI: (api) => set({ excalidrawAPI: api }),

  /** ====== Text Styling ====== */
  applyTextStyleToSelection: (payload) => {
    const api = get().excalidrawAPI;
    if (!api) return;

    try {
      const elements = api.getSceneElements?.() ?? [];
      const appState = api.getAppState?.();
      const selectedIds = Object.keys(appState?.selectedElementIds ?? {});
      if (selectedIds.length === 0) return;

      const updated = elements.map((el: any) => {
        if (selectedIds.includes(el.id) && el.type === 'text') {
          const next: any = { ...el };
          if (payload.color != null) next.strokeColor = payload.color;
          if (payload.fontSize != null) next.fontSize = payload.fontSize;
          if (payload.fontFamily != null) next.fontFamily = extractFontName(payload.fontFamily);
          if (payload.fontWeight != null) next.fontWeight = payload.fontWeight;
          if (payload.fontStyle != null) next.fontStyle = payload.fontStyle;
          if (payload.textDecoration != null) next.textDecoration = payload.textDecoration;
          if (payload.textAlign != null) next.textAlign = payload.textAlign;
          
          // Handle textbox background properties using new text element fields
          if (payload.backgroundColor != null) {
            next.textBoxBackgroundColor = payload.backgroundColor === 'transparent' ? null : payload.backgroundColor;
            // Set default opacity when background is set
            if (payload.backgroundColor !== 'transparent' && next.textBoxBackgroundOpacity == null) {
              next.textBoxBackgroundOpacity = 1;
            }
          }
          
          if (payload.borderColor != null) next.strokeColor = payload.borderColor;
          if (payload.borderWidth != null) next.strokeWidth = payload.borderWidth;
          return next;
        }
        return el;
      });

      api.updateScene?.({ elements: updated, commitToHistory: true });

      const appDefaults: any = {};
      if (payload.color != null) appDefaults.currentItemStrokeColor = payload.color;
      if (payload.fontSize != null) appDefaults.currentItemFontSize = payload.fontSize;
      if (payload.fontFamily != null) appDefaults.currentItemFontFamily = extractFontName(payload.fontFamily);
      if (payload.fontWeight != null) appDefaults.currentItemFontWeight = payload.fontWeight;
      if (payload.fontStyle != null) appDefaults.currentItemFontStyle = payload.fontStyle;
      if (payload.textAlign != null) appDefaults.currentItemTextAlign = payload.textAlign;
      if (payload.backgroundColor != null) appDefaults.currentItemBackgroundColor = payload.backgroundColor;
      if (payload.borderWidth != null) appDefaults.currentItemStrokeWidth = payload.borderWidth;

      if (Object.keys(appDefaults).length) api.updateScene?.({ appState: appDefaults });
    } catch (err) {
      console.error('applyTextStyleToSelection failed:', err);
    }
  },

  resetTextTool: () => {
    const { toolPrefs } = get();
    const d = DEFAULT_TOOL_PREFS;
    const merged = {
      textColor: d.textColor,
      textSize: d.textSize,
      textFamily: d.textFamily,
      textBold: d.textBold,
      textItalic: d.textItalic,
      textUnderlined: d.textUnderlined,
      textAlign: d.textAlign,
      textBackgroundFill: d.textBackgroundFill,
      textBorderColor: d.textBorderColor,
      textBorderWidth: d.textBorderWidth,
    };
    set({ toolPrefs: { ...toolPrefs, ...merged } });

    const api = get().excalidrawAPI;
    try {
      api?.updateScene?.({
        appState: {
          currentItemStrokeColor: merged.textColor,
          currentItemFontSize: merged.textSize,
          currentItemFontFamily: extractFontName(merged.textFamily),
          currentItemFontWeight: merged.textBold ? 'bold' : 'normal',
          currentItemFontStyle: merged.textItalic ? 'italic' : 'normal',
          currentItemTextAlign: merged.textAlign,
          currentItemBackgroundColor:
            merged.textBackgroundFill === 'transparent' ? 'transparent' : merged.textBackgroundFill,
          currentItemStrokeWidth: merged.textBorderWidth,
        },
      });
    } catch {}
  },

  /** ====== Pages ====== */
  jumpToPage: (index) => {
    const state = get();
    if (index < 0 || index >= state.pages.length) return;
    set({ currentPageIndex: index });
    const api = state.excalidrawAPI;
    const target = state.pages[index];
    try {
      api?.updateScene?.({
        elements: target.elements ?? [],
        appState: { ...(target.appState ?? {}), timestamp: Date.now() },
        files: target.files ?? {},
        commitToHistory: true,
      });
    } catch (e) {
      console.error('jumpToPage: failed to update scene', e);
    }
  },

  addPage: (name) => {
    const state = get();
    const n = name || `Page ${state.pages.length + 1}`;
    const newPage: Page = {
      id: uid(),
      name: n,
      title: n,
      elements: [],
      appState: {},
      files: {},
      createdAt: now(),
      updatedAt: now(),
    };
    const pages = [...state.pages, newPage];
    const newIndex = pages.length - 1;

    set({ pages, currentPageIndex: newIndex });

    try {
      state.excalidrawAPI?.updateScene?.({
        elements: [],
        appState: { timestamp: Date.now() },
        files: {},
        commitToHistory: true,
      });
    } catch (e) {
      console.error('addPage: failed to clear scene', e);
    }
  },

  deletePage: (index) => {
    const state = get();
    const pages = [...state.pages];
    const idx = typeof index === 'number' ? index : state.currentPageIndex;
    if (pages.length <= 1 || idx < 0 || idx >= pages.length) return;

    pages.splice(idx, 1);
    const nextIndex = Math.min(idx, pages.length - 1);
    set({ pages, currentPageIndex: nextIndex });

    const api = state.excalidrawAPI;
    const target = pages[nextIndex];
    try {
      api?.updateScene?.({
        elements: target.elements ?? [],
        appState: { ...(target.appState ?? {}), timestamp: Date.now() },
        files: target.files ?? {},
        commitToHistory: true,
      });
    } catch (e) {
      console.error('deletePage: failed to update scene', e);
    }
  },

  duplicatePage: (index) => {
    const state = get();
    const srcIndex = typeof index === 'number' ? index : state.currentPageIndex;
    if (srcIndex < 0 || srcIndex >= state.pages.length) return;

    const src = state.pages[srcIndex];
    const name = `${src.name} (copy)`;
    const copy: Page = {
      id: uid(),
      name,
      title: name,
      elements: JSON.parse(JSON.stringify(src.elements ?? [])),
      appState: JSON.parse(JSON.stringify(src.appState ?? {})),
      files: JSON.parse(JSON.stringify(src.files ?? {})),
      createdAt: now(),
      updatedAt: now(),
    };

    const pages = [...state.pages];
    pages.splice(srcIndex + 1, 0, copy);
    set({ pages, currentPageIndex: srcIndex + 1 });

    try {
      state.excalidrawAPI?.updateScene?.({
        elements: copy.elements ?? [],
        appState: { ...(copy.appState ?? {}), timestamp: Date.now() },
        files: copy.files ?? {},
        commitToHistory: true,
      });
    } catch (e) {
      console.error('duplicatePage: failed to update scene', e);
    }
  },

  /**
   * updateCurrentPage can accept:
   *   - (elements, appState)  // what page.tsx calls
   *   - (partialPage)         // manual merge
   */
  updateCurrentPage: (...args: any[]) => {
    const state = get();
    const idx = state.currentPageIndex;
    const pages = [...state.pages];
    const current = { ...pages[idx] };

    try {
      if (args.length >= 2 && Array.isArray(args[0])) {
        // elements, appState
        const elements = args[0] as any[];
        const appState = args[1] as Record<string, any>;
        const files = state.excalidrawAPI?.getFiles?.() ?? {};
        current.elements = elements ?? [];
        current.appState = appState ?? {};
        current.files = files;
      } else if (args.length === 1 && typeof args[0] === 'object') {
        const partial = args[0] as Partial<Page>;
        if (partial.name != null) { current.name = partial.name; current.title = partial.name; }
        if (partial.title != null) current.title = partial.title;
        if (partial.elements != null) current.elements = partial.elements;
        if (partial.appState != null) current.appState = partial.appState;
        if (partial.files != null) current.files = partial.files as any;
      } else {
        // No args: capture directly from canvas
        const api = state.excalidrawAPI;
        const elements = api?.getSceneElements?.() ?? [];
        const appState = api?.getAppState?.() ?? {};
        const files = api?.getFiles?.() ?? {};
        current.elements = elements;
        current.appState = appState;
        current.files = files;
      }

      current.updatedAt = now();
      pages[idx] = current;
      set({ pages });
    } catch (e) {
      console.error('updateCurrentPage failed:', e);
    }
  },
}));

/** ====== Helper hook for TextStyleControls ====== */
export function useDerivedTextStyle(excalidrawAPI: any): {
  derivedStyle: DerivedTextStyle | null;
  isMixed: boolean;
} {
  const [derived, setDerived] = React.useState<DerivedTextStyle | null>(null);
  const [mixed, setMixed] = React.useState(false);

  React.useEffect(() => {
    if (!excalidrawAPI) { setDerived(null); setMixed(false); return; }
    try {
      const elements = excalidrawAPI.getSceneElements?.() ?? [];
      const appState = excalidrawAPI.getAppState?.();
      const selectedIds = Object.keys(appState?.selectedElementIds ?? {});
      const texts = elements.filter((el: any) => selectedIds.includes(el.id) && el.type === 'text');
      if (texts.length === 0) { setDerived(null); setMixed(false); return; }

      const b = texts[0];
      const acc: DerivedTextStyle = {
        fontSize: b.fontSize,
        color: b.strokeColor,
        fontFamily: b.fontFamily,
        fontWeight: b.fontWeight,
        fontStyle: b.fontStyle,
        textDecoration: b.textDecoration,
        textAlign: b.textAlign,
        backgroundColor: b.backgroundColor,
        borderColor: b.strokeColor,
        borderWidth: b.strokeWidth,
      };

      let mixedLocal = false;
      for (const t of texts.slice(1)) {
        if (acc.fontSize !== t.fontSize) mixedLocal = true;
        if (acc.color !== t.strokeColor) mixedLocal = true;
        if (acc.fontFamily !== t.fontFamily) mixedLocal = true;
        if (acc.fontWeight !== t.fontWeight) mixedLocal = true;
        if (acc.fontStyle !== t.fontStyle) mixedLocal = true;
        if (acc.textDecoration !== t.textDecoration) mixedLocal = true;
        if (acc.textAlign !== t.textAlign) mixedLocal = true;
        if (acc.backgroundColor !== t.backgroundColor) mixedLocal = true;
        if (acc.borderColor !== t.strokeColor) mixedLocal = true;
        if (acc.borderWidth !== t.strokeWidth) mixedLocal = true;
      }
      setDerived(acc);
      setMixed(mixedLocal);
    } catch {
      setDerived(null);
      setMixed(false);
    }
  }, [excalidrawAPI]);

  return { derivedStyle: derived, isMixed: mixed };
}
