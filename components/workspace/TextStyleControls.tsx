// components/workspace/TextStyleControls.tsx - Enhanced with comprehensive text functionality
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useWorkspaceStore, useDerivedTextStyle } from '@/stores/useWorkspaceStore';
import { 
  Type, 
  Bold, 
  Italic, 
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Square,
  RectangleHorizontal as BorderAll,
  RotateCcw
} from 'lucide-react';

const TEXT_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'Dark Gray', hex: '#374151' },
  { name: 'Primary', hex: '#EC5D3A' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Purple', hex: '#9333EA' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Orange', hex: '#EA580C' },
] as const;

const BACKGROUND_FILLS = [
  { name: 'None', hex: 'transparent', preview: 'none' },
  { name: 'Light Yellow', hex: '#FEF3C7', preview: 'solid' },
  { name: 'Light Blue', hex: '#DBEAFE', preview: 'solid' },
  { name: 'Light Green', hex: '#D1FAE5', preview: 'solid' },
  { name: 'Light Purple', hex: '#E9D5FF', preview: 'solid' },
  { name: 'Light Pink', hex: '#FCE7F3', preview: 'solid' },
] as const;

const FONT_FAMILIES = [
  { name: 'Arial', value: 'Arial, sans-serif', display: 'Arial' },
  { name: 'Georgia', value: 'Georgia, serif', display: 'Georgia' },
  { name: 'Times', value: 'Times New Roman, serif', display: 'Times' },
  { name: 'Courier', value: 'Courier New, monospace', display: 'Courier' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif', display: 'Helvetica' },
] as const;

interface TextStyleControlsProps {
  onBoldToggle: (bold: boolean) => void;
  onItalicToggle: (italic: boolean) => void;
  onUnderlineToggle: (underline: boolean) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderlined?: boolean;
  isMixed?: boolean;
  hasSelection?: boolean;
}

export function TextStyleControls({
  onBoldToggle,
  onItalicToggle,
  onUnderlineToggle,
  fontSize,
  onFontSizeChange,
  isBold = false,
  isItalic = false,
  isUnderlined = false,
  isMixed = false,
  hasSelection = false,
}: TextStyleControlsProps) {
  const { 
    toolPrefs, 
    updateToolPref, 
    applyTextStyleToSelection,
    resetTextTool,
    excalidrawAPI 
  } = useWorkspaceStore();

  // Get derived styles from selection
  const { derivedStyle, isMixed: selectionMixed } = useDerivedTextStyle(excalidrawAPI);
  
  // Use derived styles when available, fall back to tool prefs with safe defaults
  const currentStyles = {
    fontSize: derivedStyle?.fontSize ?? toolPrefs.textSize ?? 24,
    color: derivedStyle?.color ?? toolPrefs.textColor ?? '#000000',
    fontFamily: derivedStyle?.fontFamily ?? toolPrefs.textFamily ?? 'Arial, sans-serif',
    fontWeight: derivedStyle?.fontWeight ?? (toolPrefs.textBold ? 'bold' : 'normal'),
    fontStyle: derivedStyle?.fontStyle ?? (toolPrefs.textItalic ? 'italic' : 'normal'),
    textDecoration: derivedStyle?.textDecoration ?? (toolPrefs.textUnderlined ? 'underline' : 'none'),
    textAlign: derivedStyle?.textAlign ?? toolPrefs.textAlign ?? 'left',
    backgroundColor: derivedStyle?.backgroundColor ?? toolPrefs.textBackgroundFill ?? 'transparent',
    borderColor: derivedStyle?.borderColor ?? toolPrefs.textBorderColor ?? '#000000',
    borderWidth: derivedStyle?.borderWidth ?? toolPrefs.textBorderWidth ?? 0,
  };

  const actuallyMixed = isMixed || selectionMixed;

  // Color picker state
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);

  // Handle font family change
  const handleFontFamilyChange = useCallback((fontFamily: string) => {
    updateToolPref('textFamily', fontFamily);
    applyTextStyleToSelection({ fontFamily });
  }, [updateToolPref, applyTextStyleToSelection]);

  // Handle text color change
  const handleTextColorChange = useCallback((color: string) => {
    updateToolPref('textColor', color);
    applyTextStyleToSelection({ color });
    setShowColorPicker(false);
  }, [updateToolPref, applyTextStyleToSelection]);

  // Handle background fill change
  const handleBackgroundChange = useCallback((backgroundColor: string) => {
    updateToolPref('textBackgroundFill', backgroundColor);
    applyTextStyleToSelection({ backgroundColor });
    setShowBackgroundPicker(false);
  }, [updateToolPref, applyTextStyleToSelection]);

  // Handle border toggle
  const handleBorderToggle = useCallback(() => {
    const currentBorderWidth = currentStyles.borderWidth ?? 0;
    const newBorderWidth = currentBorderWidth > 0 ? 0 : 2;
    updateToolPref('textBorderWidth', newBorderWidth);
    applyTextStyleToSelection({ borderWidth: newBorderWidth });
  }, [currentStyles.borderWidth, updateToolPref, applyTextStyleToSelection]);

  // Handle alignment change
  const handleAlignmentChange = useCallback((textAlign: 'left' | 'center' | 'right') => {
    updateToolPref('textAlign', textAlign);
    applyTextStyleToSelection({ textAlign });
  }, [updateToolPref, applyTextStyleToSelection]);

  // Enhanced style toggle handlers
  const handleBoldClick = useCallback(() => {
    const newBold = currentStyles.fontWeight !== 'bold';
    updateToolPref('textBold', newBold);
    applyTextStyleToSelection({ fontWeight: newBold ? 'bold' : 'normal' });
    onBoldToggle(newBold);
  }, [currentStyles.fontWeight, updateToolPref, applyTextStyleToSelection, onBoldToggle]);

  const handleItalicClick = useCallback(() => {
    const newItalic = currentStyles.fontStyle !== 'italic';
    updateToolPref('textItalic', newItalic);
    applyTextStyleToSelection({ fontStyle: newItalic ? 'italic' : 'normal' });
    onItalicToggle(newItalic);
  }, [currentStyles.fontStyle, updateToolPref, applyTextStyleToSelection, onItalicToggle]);

  const handleUnderlineClick = useCallback(() => {
    const newUnderline = currentStyles.textDecoration !== 'underline';
    updateToolPref('textUnderlined', newUnderline);
    applyTextStyleToSelection({ textDecoration: newUnderline ? 'underline' : 'none' });
    onUnderlineToggle(newUnderline);
  }, [currentStyles.textDecoration, updateToolPref, applyTextStyleToSelection, onUnderlineToggle]);

  return (
    <div className="flex items-center gap-4">
      
      {/* Font Family Selector */}
      <div className="flex items-center gap-2">
        <Type className="w-4 h-4 text-gray-500" />
        <select
          value={currentStyles.fontFamily}
          onChange={(e) => handleFontFamilyChange(e.target.value)}
          className={`text-sm px-2 py-1 border border-border rounded-sm bg-background ${
            actuallyMixed ? 'opacity-50 italic' : ''
          }`}
          title={actuallyMixed ? "Mixed font families selected" : "Font family"}
        >
          {actuallyMixed && <option value="">Mixed</option>}
          {FONT_FAMILIES.map((font) => (
            <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.display}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size Control with Quick Sizes */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[16, 20, 24, 32].map((size) => (
            <button
              key={size}
              onClick={() => onFontSizeChange(size)}
              className={`px-2 py-1 rounded-sm text-xs font-medium transition-colors ${
                Math.abs((currentStyles.fontSize ?? 24) - size) < 1
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-input text-muted-foreground hover:bg-gray-200'
              } ${actuallyMixed ? 'opacity-50' : ''}`}
              title={`Font size ${size}px`}
            >
              {size}
            </button>
          ))}
        </div>
        
        {/* Size slider and input */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onFontSizeChange(Math.max(8, (currentStyles.fontSize ?? 24) - 2))}
            className="w-6 h-6 rounded-sm bg-muted hover:bg-gray-200 text-muted-foreground font-bold text-sm flex items-center justify-center transition-colors"
            title="Decrease font size"
          >
            -
          </button>
          <input
            type="number"
            min="8"
            max="72"
            value={currentStyles.fontSize ?? 24}
            onChange={(e) => onFontSizeChange(parseInt(e.target.value) || 24)}
            className={`w-12 h-6 text-xs text-center border border-border rounded-sm bg-background ${
              actuallyMixed ? 'opacity-50' : ''
            }`}
            title={actuallyMixed ? "Mixed font sizes selected" : `Current font size: ${currentStyles.fontSize ?? 24}px`}
          />
          <button
            onClick={() => onFontSizeChange(Math.min(72, (currentStyles.fontSize ?? 24) + 2))}
            className="w-6 h-6 rounded-sm bg-muted hover:bg-gray-200 text-muted-foreground font-bold text-sm flex items-center justify-center transition-colors"
            title="Increase font size"
          >
            +
          </button>
        </div>
      </div>

      {/* Text Style Toggles */}
      <div className="flex gap-1 border-l border-border pl-3">
        <button
          onClick={handleBoldClick}
          className={`w-8 h-8 rounded-md font-bold text-sm flex items-center justify-center transition-colors ${
            currentStyles.fontWeight === 'bold'
              ? 'bg-primary text-primary-foreground shadow-soft' 
              : 'bg-muted text-muted-foreground hover:bg-gray-200'
          } ${actuallyMixed ? 'opacity-50' : ''}`}
          title={actuallyMixed ? "Bold (mixed)" : "Bold"}
        >
          <Bold className="w-4 h-4" />
        </button>
        
        <button
          onClick={handleItalicClick}
          className={`w-8 h-8 rounded-md text-sm flex items-center justify-center transition-colors ${
            currentStyles.fontStyle === 'italic'
              ? 'bg-primary text-primary-foreground shadow-soft' 
              : 'bg-muted text-muted-foreground hover:bg-gray-200'
          } ${actuallyMixed ? 'opacity-50' : ''}`}
          title={actuallyMixed ? "Italic (mixed)" : "Italic"}
        >
          <Italic className="w-4 h-4" />
        </button>
        
        <button
          onClick={handleUnderlineClick}
          className={`w-8 h-8 rounded-md text-sm flex items-center justify-center transition-colors ${
            currentStyles.textDecoration === 'underline'
              ? 'bg-primary text-primary-foreground shadow-soft' 
              : 'bg-muted text-muted-foreground hover:bg-gray-200'
          } ${actuallyMixed ? 'opacity-50' : ''}`}
          title={actuallyMixed ? "Underline (mixed)" : "Underline"}
        >
          <Underline className="w-4 h-4" />
        </button>
      </div>

      {/* Text Alignment */}
      <div className="flex gap-1 border-l border-border pl-3">
        <button
          onClick={() => handleAlignmentChange('left')}
          className={`w-8 h-8 rounded-md text-sm flex items-center justify-center transition-colors ${
            currentStyles.textAlign === 'left'
              ? 'bg-secondary text-secondary-foreground' 
              : 'bg-muted text-muted-foreground hover:bg-gray-200'
          } ${actuallyMixed ? 'opacity-50' : ''}`}
          title="Align left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => handleAlignmentChange('center')}
          className={`w-8 h-8 rounded-md text-sm flex items-center justify-center transition-colors ${
            currentStyles.textAlign === 'center'
              ? 'bg-secondary text-secondary-foreground' 
              : 'bg-muted text-muted-foreground hover:bg-gray-200'
          } ${actuallyMixed ? 'opacity-50' : ''}`}
          title="Align center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => handleAlignmentChange('right')}
          className={`w-8 h-8 rounded-md text-sm flex items-center justify-center transition-colors ${
            currentStyles.textAlign === 'right'
              ? 'bg-secondary text-secondary-foreground' 
              : 'bg-muted text-muted-foreground hover:bg-gray-200'
          } ${actuallyMixed ? 'opacity-50' : ''}`}
          title="Align right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
      </div>

      {/* Text Color Picker */}
      <div className="relative border-l border-border pl-3">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="flex items-center gap-2 px-2 py-1 rounded-md border border-border hover:bg-muted transition-colors"
          title="Text color"
        >
          <div className="flex items-center gap-1">
            <Palette className="w-4 h-4 text-gray-500" />
            <div 
              className="w-4 h-4 rounded border border-gray-300 shadow-sm"
              style={{ backgroundColor: currentStyles.color }}
            />
          </div>
          <span className="text-xs font-medium text-foreground">Color</span>
        </button>
        
        {showColorPicker && (
          <div className="absolute top-full left-0 mt-2 p-2 bg-white rounded-lg border border-border shadow-lg z-50">
            <div className="grid grid-cols-4 gap-2">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => handleTextColorChange(color.hex)}
                  className={`w-8 h-8 rounded-md border-2 transition-all hover:scale-110 ${
                    currentStyles.color === color.hex 
                      ? 'border-ring shadow-brand scale-105' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Background Fill Picker */}
      <div className="relative">
        <button
          onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
          className="flex items-center gap-2 px-2 py-1 rounded-md border border-border hover:bg-muted transition-colors"
          title="Background fill"
        >
          <div className="flex items-center gap-1">
            <Square className="w-4 h-4 text-gray-500" />
            <div 
              className="w-4 h-4 rounded border border-gray-300 shadow-sm"
              style={{ 
                backgroundColor: currentStyles.backgroundColor === 'transparent' ? '#ffffff' : currentStyles.backgroundColor,
                backgroundImage: currentStyles.backgroundColor === 'transparent' 
                  ? 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)'
                  : 'none',
                backgroundSize: currentStyles.backgroundColor === 'transparent' ? '4px 4px' : 'auto',
                backgroundPosition: currentStyles.backgroundColor === 'transparent' ? '0 0, 0 2px, 2px -2px, -2px 0px' : 'auto'
              }}
            />
          </div>
          <span className="text-xs font-medium text-foreground">Fill</span>
        </button>
        
        {showBackgroundPicker && (
          <div className="absolute top-full left-0 mt-2 p-2 bg-white rounded-lg border border-border shadow-lg z-50">
            <div className="grid grid-cols-3 gap-2">
              {BACKGROUND_FILLS.map((fill) => (
                <button
                  key={fill.hex}
                  onClick={() => handleBackgroundChange(fill.hex)}
                  className={`w-8 h-8 rounded-md border-2 transition-all hover:scale-110 ${
                    currentStyles.backgroundColor === fill.hex 
                      ? 'border-ring shadow-brand scale-105' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ 
                    backgroundColor: fill.hex === 'transparent' ? '#ffffff' : fill.hex,
                    backgroundImage: fill.hex === 'transparent' 
                      ? 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)'
                      : 'none',
                    backgroundSize: fill.hex === 'transparent' ? '4px 4px' : 'auto',
                    backgroundPosition: fill.hex === 'transparent' ? '0 0, 0 2px, 2px -2px, -2px 0px' : 'auto'
                  }}
                  title={fill.name}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Border Toggle */}
      <div>
        <button
          onClick={handleBorderToggle}
          className={`flex items-center gap-2 px-2 py-1 rounded-md border transition-colors ${
            (currentStyles.borderWidth ?? 0) > 0
              ? 'bg-accent text-accent-foreground border-accent-foreground/20'
              : 'border-border hover:bg-muted'
          }`}
          title={(currentStyles.borderWidth ?? 0) > 0 ? "Remove border" : "Add border"}
        >
          <BorderAll className="w-4 h-4" />
          <span className="text-xs font-medium">
            {(currentStyles.borderWidth ?? 0) > 0 ? 'Border' : 'No Border'}
          </span>
        </button>
      </div>

      {/* Reset Text Tool */}
      <div className="border-l border-border pl-3">
        <button
          onClick={resetTextTool}
          className="flex items-center gap-1 px-2 py-1 rounded-md border border-border hover:bg-muted transition-colors"
          title="Reset text tool to defaults"
        >
          <RotateCcw className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-medium text-muted-foreground">Reset</span>
        </button>
      </div>

      {/* Selection Status Indicator */}
      {hasSelection && (
        <div className="border-l border-border pl-3">
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-md">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-xs font-medium text-blue-700">
              {actuallyMixed ? 'Mixed Selection' : 'Selection Active'}
            </span>
          </div>
        </div>
      )}

      {/* Click outside handlers */}
      {(showColorPicker || showBackgroundPicker) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowColorPicker(false);
            setShowBackgroundPicker(false);
          }}
        />
      )}
    </div>
  );
}