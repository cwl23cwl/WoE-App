// components/workspace/AccordionToolbar.tsx - Enhanced with auto text tool activation
'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import {
  Type,
  Bold,
  Italic,
  Underline,
  Palette,
  Square,
  RectangleHorizontal as BorderAll,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

/* ===== constants ===== */

const TEXT_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'Dark Gray', hex: '#374151' },
  { name: 'Primary', hex: '#EC5D3A' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Purple', hex: '#9333EA' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Orange', hex: '#EA580C' },
  { name: 'Teal', hex: '#0891B2' },
  { name: 'Pink', hex: '#DB2777' },
] as const;

const TEXT_FONT_FAMILIES = [
  { name: 'Arial', value: 'Arial, sans-serif', display: 'Arial' },
  { name: 'Georgia', value: 'Georgia, serif', display: 'Georgia' },
  { name: 'Times', value: 'Times New Roman, serif', display: 'Times' },
  { name: 'Courier', value: 'Courier New, monospace', display: 'Courier' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif', display: 'Helvetica' },
  { name: 'Verdana', value: 'Verdana, sans-serif', display: 'Verdana' },
] as const;

/* ===== types ===== */

type ToolType = 'draw' | 'highlighter' | 'text' | 'shapes';

interface AccordionToolbarProps {
  toolType: ToolType;
  isExpanded: boolean;
  className?: string;
}

/* ===== Enhanced color application with immediate text tool activation ===== */

function applyColorDirectlyToSelectedElements(excalidrawAPI: any, color: string): boolean {
  if (!excalidrawAPI) return false;

  try {
    // Get current state immediately
    const elements = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    const selectedElementIds = Object.keys(appState?.selectedElementIds || {});

    console.log('🎯 IMMEDIATE capture - Selected IDs:', selectedElementIds);
    
    if (selectedElementIds.length === 0) {
      console.log('📝 No immediate selection - updating defaults');
      excalidrawAPI.updateScene({ 
        appState: { currentItemStrokeColor: color }
      });
      return false;
    }

    // Find selected text elements immediately
    const selectedTextElements = elements.filter((el: any) => 
      selectedElementIds.includes(el.id) && el.type === 'text'
    );

    if (selectedTextElements.length === 0) {
      console.log('📝 No text elements in immediate selection');
      excalidrawAPI.updateScene({ 
        appState: { currentItemStrokeColor: color }
      });
      return false;
    }

    console.log(`🎨 IMMEDIATE update of ${selectedTextElements.length} text elements`);

    // Update elements immediately
    const updatedElements = elements.map((el: any) => {
      if (selectedElementIds.includes(el.id) && el.type === 'text') {
        return { ...el, strokeColor: color };
      }
      return el;
    });

    // CRITICAL: Update scene while preserving the original selection
    excalidrawAPI.updateScene({ 
      elements: updatedElements,
      appState: { 
        currentItemStrokeColor: color,
        selectedElementIds: appState.selectedElementIds, // Preserve selection!
      },
      commitToHistory: true 
    });

    console.log('✅ IMMEDIATE color application successful');
    return true;
  } catch (error) {
    console.error('❌ Immediate color application failed:', error);
    return false;
  }
}

/* ===== Enhanced color change handler with auto text tool activation ===== */

function createAutoTextToolColorHandler(
  excalidrawAPI: any,
  updateToolPref: any,
  setActiveTool: any,
  activeTool: string
) {
  return (hex: string) => {
    console.log('🎨 ENHANCED color change with auto text tool:', hex);
    console.log('🎯 Current active tool:', activeTool);
    console.log('🔧 setActiveTool function available:', typeof setActiveTool);
    
    // Step 1: Update tool preferences
    updateToolPref?.('textColor', hex);
    
    // Step 2: Apply color to any selected elements immediately
    const appliedToSelection = applyColorDirectlyToSelectedElements(excalidrawAPI, hex);
    
    // Step 3: AUTO-SWITCH TO TEXT TOOL if not already active and no selection was updated
    if (activeTool !== 'text' && !appliedToSelection) {
      console.log('🔄 Auto-switching to text tool after color selection');
      
      // Switch to text tool in Excalidraw
      if (excalidrawAPI) {
        try {
          excalidrawAPI.setActiveTool({ type: 'text' });
          
          // Update the app state with the new color
          excalidrawAPI.updateScene({
            appState: {
              activeTool: { type: 'text' },
              currentItemStrokeColor: hex,
              currentItemFontSize: 24, // Ensure reasonable default
            }
          });
          
          console.log('✅ Excalidraw tool set to text with color:', hex);
        } catch (e) {
          console.error('Error switching to text tool:', e);
        }
      }
      
      // Update workspace store - call the function directly
      console.log('🔄 Calling setActiveTool with text...');
      setActiveTool('text');
      
      console.log('✅ Auto-switched to text tool - ready to create text box');
    }
    
    // Step 4: Provide user feedback
    if (appliedToSelection) {
      console.log('✅ Color applied to selected text');
    } else {
      console.log('ℹ️ Color set for next text element - text tool activated');
    }
  };
}

/* ===== main component ===== */

export function AccordionToolbar({
  toolType,
  isExpanded,
  className = '',
}: AccordionToolbarProps) {
  const { 
    toolPrefs, 
    updateToolPref, 
    excalidrawAPI, 
    activeTool,
    setActiveTool 
  } = useWorkspaceStore(); // Remove .getState() - this was the bug!

  // Local state for text tool
  const [localColor, setLocalColor] = useState<string>('#111827');
  const [localSize, setLocalSize] = useState<number>(24);
  const [localFontFamily, setLocalFontFamily] = useState<string>('Arial, sans-serif');
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');

  // Dropdown state
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);

  // Selection status for display
  const [hasSelection, setHasSelection] = useState(false);

  // Check selection periodically just for UI display
  useEffect(() => {
    if (!excalidrawAPI || toolType !== 'text') return;

    const checkSelection = () => {
      try {
        const appState = excalidrawAPI.getAppState();
        const elements = excalidrawAPI.getSceneElements();
        const selectedIds = Object.keys(appState?.selectedElementIds || {});
        const hasTextSelected = selectedIds.some(id => {
          const el = elements.find((e: any) => e.id === id);
          return el && el.type === 'text';
        });
        setHasSelection(hasTextSelected);
      } catch (error) {
        setHasSelection(false);
      }
    };

    const interval = setInterval(checkSelection, 500);
    return () => clearInterval(interval);
  }, [excalidrawAPI, toolType]);

  // Sync from store
  useEffect(() => {
    if (toolType === 'text') {
      setLocalColor(toolPrefs?.textColor || '#111827');
      setLocalSize(toolPrefs?.textSize || 24);
      setLocalFontFamily(toolPrefs?.textFamily || 'Arial, sans-serif');
      setIsBold(!!toolPrefs?.textBold);
      setIsItalic(!!toolPrefs?.textItalic);
      setTextAlign((toolPrefs?.textAlign as 'left' | 'center' | 'right') || 'left');
    }
  }, [toolPrefs, toolType]);

  // ENHANCED: Create the auto text tool color handler
  const handleTextColorChange = useCallback(
    (hex: string) => {
      console.log('🎨 ENHANCED color change with auto text tool:', hex);
      console.log('🎯 Current active tool:', activeTool);
      console.log('🔧 setActiveTool function available:', typeof setActiveTool);
      
      // DEBUG: Check Excalidraw's actual tool state
      if (excalidrawAPI) {
        try {
          const appState = excalidrawAPI.getAppState();
          console.log('🔍 Excalidraw actual tool state:', appState?.activeTool);
          console.log('🔍 Excalidraw full appState keys:', Object.keys(appState || {}));
        } catch (e) {
          console.log('🔍 Could not read Excalidraw state:', e);
        }
      }
      
      // Step 1: Update tool preferences
      updateToolPref?.('textColor', hex);
      
      // Step 2: Apply color to any selected elements immediately
      const appliedToSelection = applyColorDirectlyToSelectedElements(excalidrawAPI, hex);
      
      // Step 3: AUTO-SWITCH TO TEXT TOOL if not already active and no selection was updated
      if (activeTool !== 'text' && !appliedToSelection) {
        console.log('🔄 Auto-switching to text tool after color selection');
        
        // Use the store's selectTool method which handles both Excalidraw and store state
        try {
          // Try using the store's selectTool if available, otherwise use setActiveTool
          const store = useWorkspaceStore.getState();
          if (store.selectTool && typeof store.selectTool === 'function') {
            console.log('🔄 Using store.selectTool method');
            store.selectTool('text');
          } else {
            console.log('🔄 Using setActiveTool method');
            setActiveTool('text');
            
            // Manually handle Excalidraw tool switch
            if (excalidrawAPI) {
              excalidrawAPI.setActiveTool({ type: 'text' });
              excalidrawAPI.updateScene({
                appState: {
                  activeTool: { type: 'text' },
                  currentItemStrokeColor: hex,
                  currentItemFontSize: 24,
                }
              });
            }
          }
          
          console.log('✅ Auto-switched to text tool - ready to create text box');
        } catch (e) {
          console.error('Error during tool switch:', e);
        }
      } else if (activeTool === 'text' && !appliedToSelection) {
        // FORCE EXCALIDRAW TOOL SYNC - even if store thinks we're already on text tool
        console.log('🔄 Already on text tool, but forcing Excalidraw sync');
        if (excalidrawAPI) {
          try {
            excalidrawAPI.setActiveTool({ type: 'text' });
            excalidrawAPI.updateScene({
              appState: {
                activeTool: { type: 'text' },
                currentItemStrokeColor: hex,
                currentItemFontSize: 24,
              }
            });
            console.log('🔄 Forced Excalidraw tool sync to text');
            
            // DEBUG: Verify the sync worked
            setTimeout(() => {
              try {
                const newAppState = excalidrawAPI.getAppState();
                console.log('🔍 After sync - Excalidraw tool:', newAppState?.activeTool);
              } catch (e) {
                console.log('🔍 Could not verify sync:', e);
              }
            }, 100);
          } catch (e) {
            console.error('Error forcing Excalidraw tool sync:', e);
          }
        }
      }
      
      // Step 4: Provide user feedback
      if (appliedToSelection) {
        console.log('✅ Color applied to selected text');
      } else {
        console.log('ℹ️ Color set for next text element - text tool activated');
      }
    },
    [excalidrawAPI, updateToolPref, setActiveTool, activeTool],
  );

  // Helper function for other text properties
  const applyTextProperty = useCallback((property: string, value: any) => {
    if (!excalidrawAPI) return;

    try {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const selectedIds = Object.keys(appState?.selectedElementIds || {});
      
      const updatedElements = elements.map((el: any) => {
        if (selectedIds.includes(el.id) && el.type === 'text') {
          return { ...el, [property]: value };
        }
        return el;
      });

      const appStateUpdate: any = {};
      appStateUpdate[`currentItem${property.charAt(0).toUpperCase() + property.slice(1)}`] = value;

      excalidrawAPI.updateScene({ 
        elements: updatedElements,
        appState: {
          ...appStateUpdate,
          selectedElementIds: appState.selectedElementIds,
        },
        commitToHistory: true 
      });
    } catch (error) {
      console.error('Error applying text property:', error);
    }
  }, [excalidrawAPI]);

  if (!isExpanded || toolType !== 'text') return null;

  return (
    <div className={`accordion-toolbar ${className}`}>
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="space-y-3">
            {/* Selection Status Indicator */}
            {hasSelection && (
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-blue-700">
                    Text Selected - Changes apply immediately
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-6">
              {/* Font Controls */}
              <div className="flex items-center gap-3">
                <select
                  value={localFontFamily}
                  onChange={(e) => {
                    const newFamily = e.target.value;
                    setLocalFontFamily(newFamily);
                    updateToolPref?.('textFamily', newFamily);
                    applyTextProperty('fontFamily', newFamily);
                  }}
                  className="text-sm px-3 py-2 border border-gray-300 rounded-md bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  style={{ fontFamily: localFontFamily, minWidth: '100px' }}
                >
                  {TEXT_FONT_FAMILIES.map((font) => (
                    <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                      {font.display}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newSize = Math.max(8, localSize - 2);
                      setLocalSize(newSize);
                      updateToolPref?.('textSize', newSize);
                      applyTextProperty('fontSize', newSize);
                    }}
                    className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm flex items-center justify-center transition-colors"
                    type="button"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={8}
                    max={72}
                    value={localSize}
                    onChange={(e) => {
                      const newSize = parseInt(e.target.value, 10) || 24;
                      setLocalSize(newSize);
                      updateToolPref?.('textSize', newSize);
                      applyTextProperty('fontSize', newSize);
                    }}
                    className="w-14 h-7 text-sm text-center border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      const newSize = Math.min(72, localSize + 2);
                      setLocalSize(newSize);
                      updateToolPref?.('textSize', newSize);
                      applyTextProperty('fontSize', newSize);
                    }}
                    className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm flex items-center justify-center transition-colors"
                    type="button"
                  >
                    +
                  </button>
                </div>

                {/* Style toggles */}
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      const newBold = !isBold;
                      setIsBold(newBold);
                      updateToolPref?.('textBold', newBold);
                      applyTextProperty('fontWeight', newBold ? 'bold' : 'normal');
                    }}
                    className={`w-7 h-7 rounded-md font-bold text-sm flex items-center justify-center transition-colors ${
                      isBold ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    type="button"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const newItalic = !isItalic;
                      setIsItalic(newItalic);
                      updateToolPref?.('textItalic', newItalic);
                      applyTextProperty('fontStyle', newItalic ? 'italic' : 'normal');
                    }}
                    className={`w-7 h-7 rounded-md text-sm flex items-center justify-center transition-colors ${
                      isItalic ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    type="button"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                </div>

                {/* Alignment */}
                <div className="flex gap-1">
                  {(['left', 'center', 'right'] as const).map((align) => {
                    const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
                    return (
                      <button
                        key={align}
                        onClick={() => {
                          setTextAlign(align);
                          updateToolPref?.('textAlign', align);
                          applyTextProperty('textAlign', align);
                        }}
                        className={`w-7 h-7 rounded-md text-sm flex items-center justify-center transition-colors ${
                          textAlign === align ? 'bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                        type="button"
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-gray-300" />

              {/* ENHANCED: Color application buttons with auto text tool activation */}
              <div className="flex items-center gap-2">
                <div className="text-xs font-medium text-gray-600 mb-1">
                  Click color → Auto-switch to text tool:
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {[
                  { name: 'Black', hex: '#000000' },
                  { name: 'Red', hex: '#DC2626' },
                  { name: 'Brand Orange', hex: '#EC5D3A' },
                  { name: 'Blue', hex: '#2563EB' },
                  { name: 'Green', hex: '#16A34A' },
                ].map((color) => {
                  const selected = color.hex === localColor;
                  return (
                    <button
                      key={color.hex}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        console.log(`🎨 ENHANCED color click: ${color.name} (${color.hex})`);
                        
                        // Update local state
                        setLocalColor(color.hex);
                        
                        // Apply with auto text tool activation
                        handleTextColorChange(color.hex);
                      }}
                      className={`h-8 w-8 rounded-md border-2 transition-all hover:scale-110 relative ${
                        selected ? 'border-blue-500 ring-2 ring-blue-200 scale-105' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={`${color.name} - Click to set color and switch to text tool`}
                      type="button"
                    >
                      {/* Auto-switch indicator */}
                      {!selected && activeTool !== 'text' && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border border-white rounded-full flex items-center justify-center">
                          <Type className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* Custom Color Picker with Auto Text Tool */}
                <div className="relative">
                  <button
                    onClick={() => setShowCustomColorPicker((s) => !s)}
                    className="h-8 w-8 rounded-md border-2 border-gray-300 hover:border-gray-400 bg-white flex items-center justify-center transition-all hover:scale-110 relative"
                    title="Custom color - Auto-switches to text tool"
                    type="button"
                  >
                    <Palette className="w-4 h-4 text-gray-600" />
                    {activeTool !== 'text' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border border-white rounded-full flex items-center justify-center">
                        <Type className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </button>

                  {showCustomColorPicker && (
                    <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
                      <div className="mb-2 text-xs text-gray-600">
                        Selecting color will switch to text tool automatically
                      </div>
                      <div className="grid grid-cols-6 gap-2 mb-3">
                        {TEXT_COLORS.slice(5).map((color) => (
                          <button
                            key={color.hex}
                            onClick={() => {
                              console.log(`🎨 Custom color: ${color.name} (${color.hex})`);
                              setLocalColor(color.hex);
                              handleTextColorChange(color.hex);
                              setShowCustomColorPicker(false);
                            }}
                            className={`h-6 w-6 rounded border-2 transition-all hover:scale-110 ${
                              localColor === color.hex ? 'border-blue-500 ring-1 ring-blue-200' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={`${color.name} - Auto-switch to text tool`}
                            type="button"
                          />
                        ))}
                      </div>
                      <input
                        type="color"
                        value={localColor}
                        onChange={(e) => {
                          console.log(`🎨 Color input: ${e.target.value}`);
                          setLocalColor(e.target.value);
                          handleTextColorChange(e.target.value);
                          setShowCustomColorPicker(false);
                        }}
                        className="w-full h-8 rounded border border-gray-300 cursor-pointer"
                        title="Custom color picker - Auto-switch to text tool"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-px bg-gray-300" />
                <div
                  className="px-3 py-1 rounded text-sm select-none"
                  style={{
                    fontFamily: localFontFamily,
                    fontSize: `${Math.min(localSize * 0.6, 16)}px`,
                    fontWeight: isBold ? 'bold' : 'normal',
                    fontStyle: isItalic ? 'italic' : 'normal',
                    color: localColor,
                    textAlign,
                    minWidth: '60px',
                  }}
                  title="Live preview"
                >
                  Sample
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {showCustomColorPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowCustomColorPicker(false)}
        />
      )}
    </div>
  );
}