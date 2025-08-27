// components/workspace/TopToolbar.tsx - Enhanced with auto text tool functionality
'use client';

import React, { useCallback, useState, useMemo } from 'react';
import {
  MousePointer2,
  Pen,
  Highlighter,
  Type as TypeIcon,
  Eraser,
  Shapes,
  RotateCcw,
  RotateCw,
  Save,
  ChevronDown,
  Palette,
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { AccordionToolbar } from './AccordionToolbar';

type UIToolId = 'select' | 'draw' | 'highlighter' | 'text' | 'erase' | 'shapes';

interface Tool {
  id: UIToolId;
  icon: React.ComponentType<any>;
  label: string;
  color: string;
  excalidrawType: string;
  description: string;
  hasAccordion: boolean;
}

const tools: Tool[] = [
  {
    id: 'select',
    icon: MousePointer2,
    label: 'Select',
    color: 'text-blue-600',
    excalidrawType: 'selection',
    description: 'Select and move objects',
    hasAccordion: false,
  },
  {
    id: 'draw',
    icon: Pen,
    label: 'Draw',
    color: 'text-gray-700',
    excalidrawType: 'freedraw',
    description: 'Draw with pencil',
    hasAccordion: true,
  },
  {
    id: 'highlighter',
    icon: Highlighter,
    label: 'Highlight',
    color: 'text-yellow-600',
    excalidrawType: 'freedraw',
    description: 'Highlight important parts',
    hasAccordion: true,
  },
  {
    id: 'text',
    icon: TypeIcon,
    label: 'Text',
    color: 'text-green-600',
    excalidrawType: 'text',
    description: 'Add text - or click any text color to auto-switch',
    hasAccordion: true,
  },
  {
    id: 'erase',
    icon: Eraser,
    label: 'Erase',
    color: 'text-red-600',
    excalidrawType: 'eraser',
    description: 'Remove drawings',
    hasAccordion: false,
  },
  {
    id: 'shapes',
    icon: Shapes,
    label: 'Shapes',
    color: 'text-purple-600',
    excalidrawType: 'rectangle',
    description: 'Draw shapes',
    hasAccordion: true,
  },
];

// Quick color swatches for immediate text tool activation
const QUICK_TEXT_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Orange', hex: '#EC5D3A' },
];

interface TopToolbarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  onLibraryOpen?: () => void;
}

export function TopToolbar({ onUndo, onRedo }: TopToolbarProps) {
  const {
    activeTool,
    setActiveTool,
    saveState,
    excalidrawAPI,
    toolPrefs,
    updateToolPref,
  } = useWorkspaceStore();

  const [expandedTool, setExpandedTool] = useState<UIToolId | null>(null);
  const [showQuickColors, setShowQuickColors] = useState(false);

  // Enhanced quick color handler that auto-switches to text tool
  const handleQuickTextColor = useCallback(
    (colorHex: string) => {
      console.log('🎨 Quick text color selected:', colorHex);
      
      // Update text color preference
      updateToolPref('textColor', colorHex);
      
      // Check if we have text elements selected
      let appliedToSelection = false;
      if (excalidrawAPI) {
        try {
          const elements = excalidrawAPI.getSceneElements();
          const appState = excalidrawAPI.getAppState();
          const selectedIds = Object.keys(appState?.selectedElementIds || {});
          const selectedTextElements = elements.filter((el: any) => 
            selectedIds.includes(el.id) && el.type === 'text'
          );
          
          if (selectedTextElements.length > 0) {
            // Apply to selected text elements
            const updatedElements = elements.map((el: any) => {
              if (selectedIds.includes(el.id) && el.type === 'text') {
                return { ...el, strokeColor: colorHex };
              }
              return el;
            });
            
            excalidrawAPI.updateScene({ 
              elements: updatedElements,
              appState: { 
                currentItemStrokeColor: colorHex,
                selectedElementIds: appState.selectedElementIds,
              },
              commitToHistory: true 
            });
            appliedToSelection = true;
          }
        } catch (error) {
          console.error('Error applying color to selection:', error);
        }
      }
      
      // Auto-switch to text tool if no selection was updated
      if (!appliedToSelection) {
        console.log('🔄 Auto-switching to text tool via quick color');
        handleToolSelect(tools.find(t => t.id === 'text')!);
        setExpandedTool('text');
      }
      
      setShowQuickColors(false);
    },
    [excalidrawAPI, updateToolPref, setActiveTool]
  );

  const hasAPI = !!excalidrawAPI;
  const canUndo = hasAPI;
  const canRedo = hasAPI;

  const handleToolSelect = useCallback(
    (tool: Tool) => {
      try {
        if (excalidrawAPI) {
          // update current defaults per tool
          if (tool.id === 'draw') {
            excalidrawAPI.updateScene?.({
              appState: {
                currentItemStrokeColor: toolPrefs.drawColor ?? '#111827',
                currentItemStrokeWidth: toolPrefs.drawSize ?? 4,
                currentItemOpacity: 100,
                currentItemStrokeStyle: 'solid',
                currentItemRoughness: 0,
              },
            });
          } else if (tool.id === 'highlighter') {
            excalidrawAPI.updateScene?.({
              appState: {
                currentItemStrokeColor: toolPrefs.highlighterColor ?? '#FFF176',
                currentItemStrokeWidth: toolPrefs.highlighterSize ?? 12,
                currentItemOpacity: Math.round(((toolPrefs.highlighterOpacity ?? 0.3) * 100)),
                currentItemStrokeStyle: 'solid',
                currentItemRoughness: 0,
              },
            });
          } else if (tool.id === 'text') {
            excalidrawAPI.updateScene?.({
              appState: {
                currentItemStrokeColor: toolPrefs.textColor ?? '#111827',
                currentItemFontSize: toolPrefs.textSize ?? 24,
                currentItemStrokeStyle: 'solid',
              },
            });
          }

          // switch tool in Excalidraw
          excalidrawAPI.setActiveTool?.({ type: tool.excalidrawType });
        }

        // update app store's notion of active tool
        setActiveTool(tool.id as any);
      } catch (e) {
        console.error('TopToolbar: tool select failed:', e);
        setActiveTool(tool.id as any);
      }
    },
    [excalidrawAPI, toolPrefs, setActiveTool],
  );

  const handleToolClick = useCallback(
    (tool: Tool) => {
      // Always select/configure the tool
      handleToolSelect(tool);

      if (tool.hasAccordion) {
        if (expandedTool === tool.id) return; // keep it open on same-tool click
        setExpandedTool(tool.id);

        // optional micro refresh after accordion opens
        setTimeout(() => {
          if (excalidrawAPI) {
            try {
              window.dispatchEvent(new Event('resize', { bubbles: true }));
              setTimeout(() => {
                const st = excalidrawAPI.getAppState?.();
                excalidrawAPI.updateScene?.({ appState: { ...st, timestamp: Date.now() } });
              }, 50);
            } catch {}
          }
        }, 600);
      } else {
        // close any open accordion for tools without panels
        setExpandedTool(null);
      }
    },
    [expandedTool, handleToolSelect, excalidrawAPI],
  );

  const handleUndo = useCallback(() => {
    if (excalidrawAPI?.undo) {
      try {
        excalidrawAPI.undo();
      } catch (e) {
        console.error('TopToolbar: Excalidraw undo failed', e);
      }
    }
    onUndo?.();
  }, [excalidrawAPI, onUndo]);

  const handleRedo = useCallback(() => {
    if (excalidrawAPI?.redo) {
      try {
        excalidrawAPI.redo();
      } catch (e) {
        console.error('TopToolbar: Excalidraw redo failed', e);
      }
    }
    onRedo?.();
  }, [excalidrawAPI, onRedo]);

  const getToolPreviewColor = useCallback(
    (tool: Tool) => {
      if (!tool.hasAccordion) return undefined;
      switch (tool.id) {
        case 'draw':
          return toolPrefs.drawColor || '#111827';
        case 'highlighter':
          return toolPrefs.highlighterColor || '#FFF176';
        case 'text':
          return toolPrefs.textColor || '#111827';
        default:
          return undefined;
      }
    },
    [toolPrefs],
  );

  // map SaveState to UI
  const saveBadge = useMemo(() => {
    if (saveState === 'saved') {
      return { cls: 'text-green-700 bg-green-50 border border-green-200', text: 'Saved' };
    }
    if (saveState === 'saving') {
      return { cls: 'text-blue-700 bg-blue-50 border border-blue-200', text: 'Saving...' };
    }
    if (saveState === 'error') {
      return { cls: 'text-red-700 bg-red-50 border border-red-200', text: 'Save Error' };
    }
    return { cls: 'text-gray-700 bg-gray-50 border border-gray-200', text: 'Ready' };
  }, [saveState]);

  return (
    <div className="toolbar-container">
      {/* Main Toolbar */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-40" data-toolbar="true">
        <div className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">

          {/* LEFT: Undo/Redo */}
          <div className="flex items-center gap-2" role="group" aria-label="History actions">
            <button
              className={`p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                canUndo ? 'hover:bg-gray-100 text-gray-700' : 'opacity-40 cursor-not-allowed text-gray-400'
              }`}
              aria-label="Undo last action"
              disabled={!canUndo}
              onClick={handleUndo}
              type="button"
            >
              <RotateCcw className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
            </button>

            <button
              className={`p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                canRedo ? 'hover:bg-gray-100 text-gray-700' : 'opacity-40 cursor-not-allowed text-gray-400'
              }`}
              aria-label="Redo last action"
              disabled={!canRedo}
              onClick={handleRedo}
              type="button"
            >
              <RotateCw className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

          {/* CENTER: Tools + Quick Text Colors */}
          <div className="flex items-center gap-4">
            {/* Main Tools */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl" role="group" aria-label="Drawing tools">
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === (tool.id as any);
                const previewColor = getToolPreviewColor(tool);
                const hasExpandedAccordion = expandedTool === tool.id;

                return (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool)}
                    className={`flex flex-col items-center justify-center px-4 py-3 rounded-lg text-xs font-medium
                      transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 relative group
                      ${isActive ? `bg-white shadow-sm ${tool.color} ring-1 ring-gray-200` : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-gray-700'}
                      ${hasExpandedAccordion ? 'ring-2 ring-blue-300 bg-blue-50' : ''}
                    `}
                    aria-label={`${tool.label} tool`}
                    aria-pressed={isActive}
                    title={tool.description}
                    type="button"
                  >
                    <div className="flex items-center justify-center mb-1 relative">
                      <Icon className="w-5 h-5" strokeWidth={2} aria-hidden="true" />

                      {/* Color preview dot */}
                      {previewColor && (
                        <div
                          className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: previewColor }}
                        />
                      )}

                      {/* Accordion indicator */}
                      {tool.hasAccordion && (
                        <ChevronDown
                          className={`absolute -bottom-1 -right-1 w-3 h-3 transition-transform duration-200 ${
                            hasExpandedAccordion ? 'rotate-180 text-blue-600' : 'text-gray-400'
                          }`}
                          strokeWidth={2}
                        />
                      )}
                    </div>
                    <span className="hidden sm:block">{tool.label}</span>
                  </button>
                );
              })}
            </div>

            {/* QUICK TEXT COLORS - Auto Text Tool Activation */}
            <div className="relative">
              <button
                onClick={() => setShowQuickColors(!showQuickColors)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 border-2 relative
                  ${showQuickColors ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}
                `}
                title="Quick text colors - Auto-switches to text tool"
                type="button"
              >
                <Palette className="w-4 h-4" />
                <span className="hidden md:inline">Quick Colors</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showQuickColors ? 'rotate-180' : ''}`} />
                
                {/* Auto-switch indicator */}
                {activeTool !== 'text' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                    <TypeIcon className="w-2 h-2 text-white" />
                  </div>
                )}
              </button>

              {/* Quick Colors Dropdown */}
              {showQuickColors && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-lg border border-gray-200 shadow-lg z-50 min-w-[200px]">
                  <div className="text-xs text-gray-600 mb-3 text-center">
                    Click any color to set text color and switch to text tool
                  </div>
                  <div className="flex gap-2 justify-center">
                    {QUICK_TEXT_COLORS.map((color) => (
                      <button
                        key={color.hex}
                        onClick={() => handleQuickTextColor(color.hex)}
                        className="relative w-8 h-8 rounded-md border-2 border-gray-300 hover:border-gray-400 transition-all hover:scale-110"
                        style={{ backgroundColor: color.hex }}
                        title={`${color.name} - Auto-switch to text tool`}
                        type="button"
                      >
                        {/* Auto-switch indicator on each color */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border border-white rounded-full flex items-center justify-center">
                          <TypeIcon className="w-2 h-2 text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-center text-gray-500 mt-2">
                    Or use the full color palette in Text tool →
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Save Status */}
          <div className="flex items-center">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${saveBadge.cls}`}
              role="status"
              aria-live="polite"
            >
              <Save className={`w-4 h-4 ${saveState === 'saving' ? 'animate-pulse' : ''}`} aria-hidden="true" />
              <span>{saveBadge.text}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Accordion row (fixed height to prevent jumping) */}
      <div className="accordion-container bg-white border-b border-gray-100 sticky top-[73px] z-30">
        {expandedTool && (
          <AccordionToolbar
            toolType={expandedTool as 'draw' | 'highlighter' | 'text' | 'shapes'}
            isExpanded={true}
          />
        )}
      </div>

      {/* Canvas buffer */}
      <div className="canvas-buffer h-8 bg-gradient-to-b from-gray-50 to-white" />

      {/* Click outside to close quick colors */}
      {showQuickColors && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowQuickColors(false)}
        />
      )}

      <style jsx>{`
        .toolbar-container {
          position: relative;
        }
        .accordion-container {
          height: 90px;
          overflow: hidden;
          transition: none;
        }
        .canvas-buffer {
          position: relative;
          z-index: 5;
        }
      `}</style>
    </div>
  );
}