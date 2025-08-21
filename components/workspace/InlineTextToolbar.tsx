'use client';

import { useState, useRef, useEffect } from 'react';
import { TextMarks, TextSelection } from '@/lib/rich-text-types';
import { ColorPopover } from './ColorPopover';

interface InlineTextToolbarProps {
  /** Text element being edited */
  elementId: string;
  /** Current selection in the text */
  selection: TextSelection | null;
  /** Current marks at cursor/selection */
  currentMarks: TextMarks;
  /** Position to show toolbar (relative to text element) */
  position: { x: number; y: number } | null;
  /** Whether the toolbar should be visible */
  visible: boolean;
  /** Callbacks for mark changes */
  onFontSizeChange: (fontSize: number) => void;
  onColorChange: (color: string) => void;
  onBoldToggle: () => void;
  onItalicToggle: () => void;
  onUnderlineToggle: () => void;
  onFontFamilyChange: (fontFamily: string) => void;
  /** Callback when toolbar should close */
  onClose: () => void;
}

export function InlineTextToolbar({
  elementId,
  selection,
  currentMarks,
  position,
  visible,
  onFontSizeChange,
  onColorChange,
  onBoldToggle,
  onItalicToggle,
  onUnderlineToggle,
  onFontFamilyChange,
  onClose
}: InlineTextToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [localFontSize, setLocalFontSize] = useState(currentMarks.fontSize || 16);

  // Update local font size when currentMarks change
  useEffect(() => {
    setLocalFontSize(currentMarks.fontSize || 16);
  }, [currentMarks.fontSize]);

  // Close toolbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [visible, onClose]);

  if (!visible || !position) {
    return null;
  }

  const hasSelection = selection && selection.start !== selection.end;
  const selectionLength = hasSelection ? selection.end - selection.start : 0;

  const handleFontSizeChange = (newSize: number) => {
    setLocalFontSize(newSize);
    onFontSizeChange(newSize);
  };

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 bg-white border border-border rounded-lg shadow-lg p-2 flex items-center gap-2 text-sm"
      style={{
        left: position.x,
        top: position.y - 50, // Position above the text
        minWidth: '300px'
      }}
    >
      {/* Selection Info */}
      <div className="text-xs text-muted-foreground px-2 border-r border-border">
        {hasSelection ? `${selectionLength} chars` : 'Cursor'}
      </div>

      {/* Font Size Controls */}
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium text-foreground">Size:</span>
        <button
          onClick={() => handleFontSizeChange(Math.max(8, localFontSize - 2))}
          className="w-6 h-6 rounded-sm bg-muted hover:bg-gray-200 text-muted-foreground font-bold text-xs flex items-center justify-center transition-colors"
          title="Decrease font size"
        >
          -
        </button>
        <input
          type="number"
          min="8"
          max="72"
          value={localFontSize}
          onChange={(e) => handleFontSizeChange(parseInt(e.target.value) || 16)}
          className="w-12 h-6 text-xs text-center border border-border rounded-sm bg-background"
        />
        <button
          onClick={() => handleFontSizeChange(Math.min(72, localFontSize + 2))}
          className="w-6 h-6 rounded-sm bg-muted hover:bg-gray-200 text-muted-foreground font-bold text-xs flex items-center justify-center transition-colors"
          title="Increase font size"
        >
          +
        </button>
      </div>

      {/* Font Size Presets */}
      <div className="flex gap-1 border-l border-border pl-2">
        {[12, 16, 20, 24, 32].map((size) => (
          <button
            key={size}
            onClick={() => handleFontSizeChange(size)}
            className={`px-2 py-1 rounded-sm text-xs font-medium transition-colors ${
              localFontSize === size 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-input text-muted-foreground hover:bg-gray-200'
            }`}
            title={`Font size ${size}px`}
          >
            {size}
          </button>
        ))}
      </div>

      {/* Text Style Toggles */}
      <div className="flex gap-1 border-l border-border pl-2">
        <button
          onClick={onBoldToggle}
          className={`w-6 h-6 rounded-sm font-bold text-xs flex items-center justify-center transition-colors ${
            currentMarks.bold
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground hover:bg-gray-200'
          }`}
          title="Bold"
        >
          B
        </button>
        
        <button
          onClick={onItalicToggle}
          className={`w-6 h-6 rounded-sm italic font-medium text-xs flex items-center justify-center transition-colors ${
            currentMarks.italic
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground hover:bg-gray-200'
          }`}
          title="Italic"
        >
          I
        </button>
        
        <button
          onClick={onUnderlineToggle}
          className={`w-6 h-6 rounded-sm font-medium text-xs flex items-center justify-center transition-colors underline ${
            currentMarks.underline
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground hover:bg-gray-200'
          }`}
          title="Underline"
        >
          U
        </button>
      </div>

      {/* Color Picker */}
      <div className="border-l border-border pl-2">
        <ColorPopover
          currentColor={currentMarks.color || '#000000'}
          onColorSelect={onColorChange}
          label="Color"
          buttonSize="sm"
        />
      </div>

      {/* Font Family Selector */}
      <div className="border-l border-border pl-2">
        <select
          value={currentMarks.fontFamily || 'Arial'}
          onChange={(e) => onFontFamilyChange(e.target.value)}
          className="text-xs px-2 py-1 border border-border rounded-sm bg-background text-foreground"
          title="Font family"
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier</option>
          <option value="Verdana">Verdana</option>
        </select>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="w-6 h-6 rounded-sm bg-muted hover:bg-gray-200 text-muted-foreground text-xs flex items-center justify-center transition-colors ml-auto"
        title="Close toolbar"
      >
        ×
      </button>
    </div>
  );
}