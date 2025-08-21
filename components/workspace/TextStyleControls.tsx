'use client';

import { useState } from 'react';

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
  const handleBoldClick = () => {
    onBoldToggle(!isBold);
  };

  const handleItalicClick = () => {
    onItalicToggle(!isItalic);
  };

  const handleUnderlineClick = () => {
    onUnderlineToggle(!isUnderlined);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Font Size Control */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">Size:</span>
        <div className="flex items-center gap-1">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))}
            className="w-6 h-6 rounded-sm bg-muted hover:bg-gray-200 text-muted-foreground font-bold text-sm flex items-center justify-center transition-colors"
            title="Decrease font size"
          >
            -
          </button>
          <input
            type="range"
            min="12"
            max="48"
            value={fontSize}
            onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
            onMouseDown={(e) => e.preventDefault()}
            className="w-16 accent-primary"
          />
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onFontSizeChange(Math.min(48, fontSize + 2))}
            className="w-6 h-6 rounded-sm bg-muted hover:bg-gray-200 text-muted-foreground font-bold text-sm flex items-center justify-center transition-colors"
            title="Increase font size"
          >
            +
          </button>
          <span className="text-sm text-muted-foreground w-8 text-center">{fontSize}</span>
        </div>
      </div>

      {/* Text Style Toggles */}
      <div className="flex gap-1 border-l border-border pl-3">
        <button
          onClick={handleBoldClick}
          className={`w-8 h-8 rounded-md font-bold text-sm flex items-center justify-center transition-colors ${
            isBold 
              ? 'bg-primary text-primary-foreground shadow-soft' 
              : 'bg-muted text-muted-foreground hover:bg-gray-200'
          } ${isMixed ? 'opacity-50' : ''}`}
          title={isMixed ? "Bold (mixed)" : "Bold"}
        >
          B
        </button>
        
        <button
          onClick={handleItalicClick}
          className={`w-8 h-8 rounded-md italic font-medium text-sm flex items-center justify-center transition-colors ${
            isItalic 
              ? 'bg-primary text-primary-foreground shadow-soft' 
              : 'bg-muted text-muted-foreground hover:bg-gray-200'
          } ${isMixed ? 'opacity-50' : ''}`}
          title={isMixed ? "Italic (mixed)" : "Italic"}
        >
          I
        </button>
        
        <button
          onClick={handleUnderlineClick}
          className={`w-8 h-8 rounded-md font-medium text-sm flex items-center justify-center transition-colors underline ${
            isUnderlined 
              ? 'bg-primary text-primary-foreground shadow-soft' 
              : 'bg-muted text-muted-foreground hover:bg-gray-200'
          } ${isMixed ? 'opacity-50' : ''}`}
          title={isMixed ? "Underline (mixed)" : "Underline"}
        >
          U
        </button>
      </div>

      {/* Font Size Presets */}
      <div className="flex gap-1 border-l border-border pl-3">
        {[14, 18, 24, 32].map((size) => (
          <button
            key={size}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onFontSizeChange(size)}
            className={`px-2 py-1 rounded-sm text-xs font-medium transition-colors ${
              fontSize === size 
                ? 'bg-secondary text-secondary-foreground' 
                : 'bg-input text-muted-foreground hover:bg-gray-200'
            }`}
            title={`Font size ${size}px`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}