// components/workspace/AccordionToolbar.tsx - Enhanced with auto text tool activation
'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useWorkspaceStore, type BackgroundMode, type CanvasBackgroundType } from '@/stores/useWorkspaceStore';
import { SimplifiedColorPicker } from '@/components/workspace/SimplifiedColorPicker';
import {
  Type,
  Bold,
  Italic,
  Underline,
  Palette,
  Square,
  RectangleHorizontal as BorderAll,
  Grid3x3,
  Circle,
  ToggleLeft,
  ToggleRight,
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

const TEXT_BACKGROUND_COLORS = [
  { name: 'None', hex: 'transparent', preview: null },
  { name: 'Light Yellow', hex: '#FEF3C7', preview: '#FEF3C7' },
  { name: 'Light Blue', hex: '#DBEAFE', preview: '#DBEAFE' },
  { name: 'Light Green', hex: '#D1FAE5', preview: '#D1FAE5' },
  { name: 'Light Purple', hex: '#E9D5FF', preview: '#E9D5FF' },
  { name: 'Light Pink', hex: '#FCE7F3', preview: '#FCE7F3' },
  { name: 'Light Gray', hex: '#F3F4F6', preview: '#F3F4F6' },
] as const;

const TEXT_FONT_FAMILIES = [
  // Default font - Open Sans (kid-friendly, highly readable)
  { name: 'Open Sans', value: 'Open Sans, sans-serif', display: '📖 Open Sans' },
  
  // Kid-friendly options
  { name: 'Comic Sans', value: 'Comic Sans MS, cursive', display: '🎨 Comic Sans' },
  { name: 'Calibri', value: 'Calibri, sans-serif', display: '✏️ Calibri' },
  { name: 'Tahoma', value: 'Tahoma, sans-serif', display: '👀 Tahoma' },
  
  // Classic readable fonts
  { name: 'Arial', value: 'Arial, sans-serif', display: '📝 Arial' },
  { name: 'Times New Roman', value: 'Times New Roman, serif', display: '🏛️ Times New Roman' },
  
  // Existing favorites
  { name: 'Georgia', value: 'Georgia, serif', display: '📚 Georgia' },
  { name: 'Courier', value: 'Courier New, monospace', display: '💻 Courier' },
  { name: 'Verdana', value: 'Verdana, sans-serif', display: '🔍 Verdana' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif', display: '✨ Helvetica' },
] as const;

/* ===== types ===== */

type ToolType = 'draw' | 'highlighter' | 'text' | 'shapes';

interface AccordionToolbarProps {
  toolType: ToolType;
  isExpanded: boolean;
  className?: string;
}

/* ===== Font mapping for Excalidraw compatibility ===== */

// Extract actual font name from font-family string
function extractFontName(uiFontFamily: string): string {
  // Extract the first font name from the font-family string
  const fontName = uiFontFamily.split(',')[0].replace(/['"]/g, '').trim();
  
  // Map some special cases to better font names for canvas rendering
  if (uiFontFamily.includes('Comic Sans')) {
    return 'Comic Sans MS';
  }
  
  if (uiFontFamily.includes('Courier') || uiFontFamily.includes('monospace')) {
    return 'Courier New';
  }
  
  // Return the actual font name for direct use
  return fontName;
}

/* ===== Enhanced color application with immediate text tool activation ===== */

function applyColorDirectlyToSelectedElements(excalidrawAPI: any, color: string): boolean {
  if (!excalidrawAPI) return false;

  try {
    const elements = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    const selectedElementIds = Object.keys(appState?.selectedElementIds || {});
    
    if (selectedElementIds.length === 0) {
      excalidrawAPI.updateScene({ 
        appState: { currentItemStrokeColor: color }
      });
      return false;
    }

    const selectedTextElements = elements.filter((el: any) => 
      selectedElementIds.includes(el.id) && el.type === 'text'
    );

    if (selectedTextElements.length === 0) {
      excalidrawAPI.updateScene({ 
        appState: { currentItemStrokeColor: color }
      });
      return false;
    }

    const updatedElements = elements.map((el: any) => {
      if (selectedElementIds.includes(el.id) && el.type === 'text') {
        return { ...el, strokeColor: color };
      }
      return el;
    });

    excalidrawAPI.updateScene({ 
      elements: updatedElements,
      appState: { 
        currentItemStrokeColor: color,
        selectedElementIds: appState.selectedElementIds,
      },
      commitToHistory: true 
    });

    return true;
  } catch (error) {
    console.error('Error applying color:', error);
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
    setActiveTool,
    applyTextStyleToSelection,
    backgroundMode,
    canvasBackground,
    setBackgroundMode,
    updateCanvasBackground
  } = useWorkspaceStore();

  // Local state for text tool
  const [localColor, setLocalColor] = useState<string>('#111827');
  const [localSize, setLocalSize] = useState<number>(24);
  const [localFontFamily, setLocalFontFamily] = useState<string>('Open Sans, sans-serif');
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUnderline, setIsUnderline] = useState<boolean>(false);
  const [hasBackground, setHasBackground] = useState<boolean>(false);
  const [textBackgroundColor, setTextBackgroundColor] = useState<string>('transparent');
  const [hasBorder, setHasBorder] = useState<boolean>(false);

  // Dropdown state
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [pickerPosition, setPickerPosition] = useState({ x: 0, y: 0 });
  const [previewColor, setPreviewColor] = useState<string>('');
  const paletteButtonRef = useRef<HTMLButtonElement>(null);


  // Sync from store
  useEffect(() => {
    if (toolType === 'text') {
      setLocalColor(toolPrefs?.textColor || '#111827');
      setLocalSize(toolPrefs?.textSize || 24);
      setLocalFontFamily(toolPrefs?.textFamily || 'Open Sans, sans-serif');
      setIsBold(!!toolPrefs?.textBold);
      setIsItalic(!!toolPrefs?.textItalic);
      setIsUnderline(!!toolPrefs?.textUnderline);
      setHasBackground(!!toolPrefs?.textBackground);
      setTextBackgroundColor(toolPrefs?.textBackgroundColor || 'transparent');
      setHasBorder(!!toolPrefs?.textBorder);
    }
  }, [toolPrefs, toolType]);

  // ENHANCED: Create the auto text tool color handler
  const handleTextColorChange = useCallback(
    (hex: string) => {
      // Step 1: Update tool preferences
      updateToolPref?.('textColor', hex);
      
      // Step 2: Apply color to any selected elements immediately
      const appliedToSelection = applyColorDirectlyToSelectedElements(excalidrawAPI, hex);
      
      // Step 3: AUTO-SWITCH TO TEXT TOOL if not already active and no selection was updated
      if (activeTool !== 'text' && !appliedToSelection) {
        // Use the store's selectTool method which handles both Excalidraw and store state
        try {
          const store = useWorkspaceStore.getState();
          if (store.selectTool && typeof store.selectTool === 'function') {
            store.selectTool('text');
          } else {
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
        } catch (e) {
          console.error('Error during tool switch:', e);
        }
      } else if (activeTool === 'text' && !appliedToSelection) {
        // FORCE EXCALIDRAW TOOL SYNC - even if store thinks we're already on text tool
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
          } catch (e) {
            console.error('Error forcing Excalidraw tool sync:', e);
          }
        }
      }
    },
    [excalidrawAPI, updateToolPref, setActiveTool, activeTool],
  );


  // Enhanced background toggle handlers for both text and canvas modes
  const handleBackgroundToggle = useCallback(() => {
    if (backgroundMode === 'text') {
      // Text background mode - existing functionality
      const newBackground = !hasBackground;
      setHasBackground(newBackground);
      updateToolPref?.('textBackground', newBackground);
      
      // Apply to selected elements or set default
      if (newBackground) {
        applyTextStyleToSelection({ backgroundColor: '#ffffff' });
      } else {
        applyTextStyleToSelection({ backgroundColor: 'transparent' });
      }
    } else {
      // Canvas background mode - new functionality
      const newEnabled = !canvasBackground.enabled;
      updateCanvasBackground({ enabled: newEnabled });
      
      // Apply to Excalidraw canvas
      if (excalidrawAPI) {
        try {
          const bgColor = newEnabled ? canvasBackground.color : '#ffffff';
          excalidrawAPI.updateScene({
            appState: {
              viewBackgroundColor: bgColor
            }
          });
        } catch (error) {
          console.error('Failed to update canvas background:', error);
        }
      }
    }
  }, [backgroundMode, hasBackground, canvasBackground, updateToolPref, applyTextStyleToSelection, updateCanvasBackground, excalidrawAPI]);

  // Text background color handler
  const handleTextBackgroundColorChange = useCallback((color: string) => {
    setTextBackgroundColor(color);
    const isEnabled = color !== 'transparent';
    setHasBackground(isEnabled);
    updateToolPref?.('textBackground', isEnabled);
    updateToolPref?.('textBackgroundColor', color);
    
    // Apply to selected text elements
    applyTextStyleToSelection({ backgroundColor: color });
    
    console.log('Text background color changed to:', color);
  }, [updateToolPref, applyTextStyleToSelection]);

  // Background mode toggle handler
  const handleBackgroundModeToggle = useCallback(() => {
    const newMode: BackgroundMode = backgroundMode === 'text' ? 'canvas' : 'text';
    setBackgroundMode(newMode);
  }, [backgroundMode, setBackgroundMode]);

  // Canvas background type handler
  const handleCanvasBackgroundTypeChange = useCallback((type: CanvasBackgroundType) => {
    updateCanvasBackground({ type });
  }, [updateCanvasBackground]);

  const handleBorderToggle = useCallback(() => {
    const newBorder = !hasBorder;
    setHasBorder(newBorder);
    updateToolPref?.('textBorder', newBorder);
    
    // Apply border styling to selected elements
    if (newBorder) {
      applyTextStyleToSelection({ borderWidth: 2 });
    } else {
      applyTextStyleToSelection({ borderWidth: 0 });
    }
  }, [hasBorder, updateToolPref, applyTextStyleToSelection]);

  // Handle adding recent colors
  const handleAddRecentColor = useCallback((color: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color);
      return [color, ...filtered].slice(0, 8); // Keep max 8 recent colors
    });
  }, []);

  // Calculate position for portal color picker
  const handleOpenColorPicker = useCallback(() => {
    if (paletteButtonRef.current) {
      const rect = paletteButtonRef.current.getBoundingClientRect();
      setPickerPosition({
        x: rect.left,
        y: rect.bottom + 8 // 8px gap below button
      });
    }
    setPreviewColor(localColor); // Set initial preview to current color
    setShowCustomColorPicker(true);
  }, [localColor]);

  // Handle color preview (while exploring colors)
  const handleColorPreview = useCallback((color: string) => {
    setPreviewColor(color);
    // Don't apply yet - just preview
  }, []);

  // Handle color apply (when clicking outside to close)
  const handleColorApply = useCallback(() => {
    if (previewColor && previewColor !== localColor) {
      setLocalColor(previewColor);
      handleTextColorChange(previewColor);
      handleAddRecentColor(previewColor);
    }
    setShowCustomColorPicker(false);
  }, [previewColor, localColor, handleTextColorChange, handleAddRecentColor]);

  if (!isExpanded || toolType !== 'text') return null;

  return (
    <div className={`accordion-toolbar ${className}`}>
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-8 py-4">
          {/* Three-section layout: LEFT (Font) | CENTER (Colors) | RIGHT (Background/Border) */}
          <div className="grid grid-cols-3 items-center gap-8 min-h-[56px]">
            {/* LEFT SECTION: Font Controls */}
            <div className="flex items-center gap-3 justify-start">
                <select
                  value={localFontFamily}
                  onChange={(e) => {
                    const newFamily = e.target.value;
                    setLocalFontFamily(newFamily);
                    updateToolPref?.('textFamily', newFamily);
                    // Extract the actual font name
                    const fontName = extractFontName(newFamily);
                    console.log(`Font changed: ${newFamily} → ${fontName}`);
                    
                    // Update CSS variable to reflect selected font
                    document.documentElement.style.setProperty('--selected-font-family', `"${fontName}"`);
                    
                    // Apply font directly to canvas using font name
                    if (excalidrawAPI) {
                      excalidrawAPI.updateScene({
                        appState: {
                          currentItemFontFamily: fontName
                        }
                      });
                    }
                    
                    // Also apply to selected text elements
                    applyTextStyleToSelection({ fontFamily: fontName });
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

                {/* Font Size Controls - Improved spacing and intuitive design */}
                <div className="flex items-center gap-1 bg-gray-50 border border-gray-300 rounded-lg px-1 py-1">
                  <button
                    onClick={() => {
                      const newSize = Math.max(8, localSize - 2);
                      setLocalSize(newSize);
                      updateToolPref?.('textSize', newSize);
                      applyTextStyleToSelection({ fontSize: newSize });
                    }}
                    className="w-6 h-6 rounded-md bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-800 text-xs font-medium flex items-center justify-center transition-all border border-gray-200 hover:border-gray-300 shadow-sm"
                    type="button"
                    title="Decrease font size"
                  >
                    −
                  </button>
                  
                  <div className="flex items-center bg-white border border-gray-200 rounded px-2 py-0.5 min-w-[48px] justify-center">
                    <span className="text-xs font-medium text-gray-700 select-none">
                      {localSize}pt
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      const newSize = Math.min(72, localSize + 2);
                      setLocalSize(newSize);
                      updateToolPref?.('textSize', newSize);
                      applyTextStyleToSelection({ fontSize: newSize });
                    }}
                    className="w-6 h-6 rounded-md bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-800 text-xs font-medium flex items-center justify-center transition-all border border-gray-200 hover:border-gray-300 shadow-sm"
                    type="button"
                    title="Increase font size"
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
                      applyTextStyleToSelection({ fontWeight: newBold ? 'bold' : 'normal' });
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
                      applyTextStyleToSelection({ fontStyle: newItalic ? 'italic' : 'normal' });
                    }}
                    className={`w-7 h-7 rounded-md text-sm flex items-center justify-center transition-colors ${
                      isItalic ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    type="button"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const newUnderline = !isUnderline;
                      setIsUnderline(newUnderline);
                      updateToolPref?.('textUnderline', newUnderline);
                      applyTextStyleToSelection({ textDecoration: newUnderline ? 'underline' : 'none' });
                    }}
                    className={`w-7 h-7 rounded-md text-sm flex items-center justify-center transition-colors ${
                      isUnderline ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    type="button"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                </div>
            </div>

            {/* CENTER SECTION: Colors - Centered under main toolbar */}
            <div className="flex items-center justify-center gap-2 px-4">
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
                        
                        setLocalColor(color.hex);
                        handleTextColorChange(color.hex);
                        handleAddRecentColor(color.hex);
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

                {/* Subtle divider before recent colors */}
                {recentColors.length > 0 && (
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                )}

                {/* Recent Colors - Show last 2 recent colors */}
                {recentColors.slice(0, 2).map((color, index) => {
                  const selected = color === localColor;
                  return (
                    <button
                      key={`recent-${index}-${color}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        setLocalColor(color);
                        handleTextColorChange(color);
                        handleAddRecentColor(color);
                      }}
                      className={`h-8 w-8 rounded-md border-2 transition-all hover:scale-110 relative ${
                        selected ? 'border-blue-500 ring-2 ring-blue-200 scale-105' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Recent color - Click to set color and switch to text tool`}
                      type="button"
                    >
                      {/* Recent indicator */}
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-purple-500 border border-white rounded-full" />
                      
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
                    ref={paletteButtonRef}
                    onClick={handleOpenColorPicker}
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

                </div>
            </div>

            {/* RIGHT SECTION: Enhanced Background Controls */}
            <div className="flex items-center justify-end gap-2 px-2">
                {/* Background Mode Toggle */}
                <button
                  onClick={handleBackgroundModeToggle}
                  className={`h-8 px-3 rounded-md text-xs font-medium flex items-center justify-center transition-all border ${
                    backgroundMode === 'canvas'
                      ? 'bg-purple-500 text-white border-purple-500' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                  title={`Switch to ${backgroundMode === 'text' ? 'canvas' : 'text'} background mode`}
                  type="button"
                >
                  {backgroundMode === 'text' ? (
                    <>
                      <Type className="w-3 h-3 mr-1" />
                      Text
                    </>
                  ) : (
                    <>
                      <Square className="w-3 h-3 mr-1" />
                      Canvas
                    </>
                  )}
                </button>

                {/* Pattern Selection (Canvas Mode Only) */}
                {backgroundMode === 'canvas' && (
                  <div className="flex gap-1">
                    {/* Solid Pattern */}
                    <button
                      onClick={() => handleCanvasBackgroundTypeChange('solid')}
                      className={`w-7 h-7 rounded-md text-sm flex items-center justify-center transition-colors ${
                        canvasBackground.type === 'solid'
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title="Solid background"
                      type="button"
                    >
                      <Square className="w-3 h-3" />
                    </button>
                    
                    {/* Grid Pattern */}
                    <button
                      onClick={() => handleCanvasBackgroundTypeChange('grid')}
                      className={`w-7 h-7 rounded-md text-sm flex items-center justify-center transition-colors ${
                        canvasBackground.type === 'grid'
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title="Grid background"
                      type="button"
                    >
                      <Grid3x3 className="w-3 h-3" />
                    </button>
                    
                    {/* Dots Pattern */}
                    <button
                      onClick={() => handleCanvasBackgroundTypeChange('dots')}
                      className={`w-7 h-7 rounded-md text-sm flex items-center justify-center transition-colors ${
                        canvasBackground.type === 'dots'
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title="Dots background"
                      type="button"
                    >
                      <Circle className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Text Background Color Picker - Text Mode Only */}
                {backgroundMode === 'text' && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-600 mr-1">Background:</span>
                    <div className="flex gap-1">
                      {TEXT_BACKGROUND_COLORS.map((bgColor) => (
                        <button
                          key={bgColor.hex}
                          onClick={() => handleTextBackgroundColorChange(bgColor.hex)}
                          className={`w-6 h-6 rounded border-2 transition-all ${
                            textBackgroundColor === bgColor.hex
                              ? 'border-blue-500 ring-1 ring-blue-300'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{
                            backgroundColor: bgColor.preview || '#ffffff',
                            backgroundImage: bgColor.hex === 'transparent' 
                              ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                              : 'none',
                            backgroundSize: bgColor.hex === 'transparent' ? '4px 4px' : 'auto',
                            backgroundPosition: bgColor.hex === 'transparent' ? '0 0, 0 2px, 2px -2px, -2px 0px' : 'auto',
                          }}
                          title={`${bgColor.name} background`}
                          type="button"
                        >
                          {bgColor.hex === 'transparent' && (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-xs text-gray-600">×</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Canvas Background Controls - Canvas Mode Only */}
                {backgroundMode === 'canvas' && (
                  <button
                    onClick={handleBackgroundToggle}
                    className={`w-8 h-8 rounded-md text-sm flex items-center justify-center transition-colors border-2 ${
                      canvasBackground.enabled
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                    title={canvasBackground.enabled ? "Disable canvas background" : "Enable canvas background"}
                    type="button"
                  >
                    <Square className="w-4 h-4" />
                  </button>
                )}

                {/* Border Toggle (Text Mode Only) */}
                {backgroundMode === 'text' && (
                  <button
                    onClick={handleBorderToggle}
                    className={`w-8 h-8 rounded-md text-sm flex items-center justify-center transition-colors ${
                      hasBorder 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    title={hasBorder ? "Remove border" : "Add border"}
                    type="button"
                  >
                    <BorderAll className="w-4 h-4" />
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Portal-based Color Picker */}
      {showCustomColorPicker && typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop - Click outside to apply and close */}
          <div 
            className="fixed inset-0 z-[9999] bg-black/10" 
            onClick={handleColorApply}
          />
          
          {/* Color Picker */}
          <div 
            className="fixed z-[10000]"
            style={{
              left: `${pickerPosition.x}px`,
              top: `${pickerPosition.y}px`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <SimplifiedColorPicker
              value={previewColor || localColor}
              onChange={handleColorPreview} // Preview only, don't apply
              onClose={handleColorApply} // Apply when explicitly closing
              className=""
            />
          </div>
        </>,
        document.body
      )}
    </div>
  );
}