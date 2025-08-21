'use client';

import { useState, useRef, useEffect } from 'react';

// Brand-aligned color swatches using Tailwind tokens
export const BRAND_SWATCHES = [
  // Primary colors
  { color: '#E55A3C', name: 'Primary Orange', css: 'bg-primary' },
  { color: '#F47B5C', name: 'Light Orange', css: 'bg-primary-light' },
  
  // Secondary colors
  { color: '#2E5A8A', name: 'Secondary Blue', css: 'bg-secondary' },
  { color: '#5B9BD5', name: 'Light Blue', css: 'bg-secondary-light' },
  
  // Accent colors
  { color: '#7BA05B', name: 'Accent Green', css: 'bg-accent' },
  { color: '#A8C686', name: 'Light Green', css: 'bg-accent-light' },
  
  // Semantic colors
  { color: '#F59E0B', name: 'Warning', css: 'bg-warning' },
  { color: '#EF4444', name: 'Error', css: 'bg-error' },
  
  // Neutrals
  { color: '#374151', name: 'Dark Gray', css: 'bg-gray-800' },
  { color: '#000000', name: 'Black', css: 'bg-black' },
];

interface ColorPopoverProps {
  currentColor: string;
  onColorSelect: (color: string) => void;
  label?: string;
  buttonSize?: 'default' | 'sm';
}

export function ColorPopover({ currentColor, onColorSelect, label = 'Color', buttonSize = 'default' }: ColorPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const handleColorSelect = (color: string) => {
    onColorSelect(color);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`flex items-center gap-2 rounded-md border border-border hover:bg-muted transition-colors ${
          buttonSize === 'sm' ? 'px-2 py-1' : 'px-3 py-2'
        }`}
        title={`${label}: ${currentColor}`}
      >
        <div 
          className={`rounded-sm border border-gray-300 shadow-sm ${
            buttonSize === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
          }`}
          style={{ backgroundColor: currentColor }}
        />
        <span className={`font-medium text-foreground ${
          buttonSize === 'sm' ? 'text-xs' : 'text-sm'
        }`}>{label}</span>
        <svg 
          className={`text-muted-foreground transition-transform ${
            buttonSize === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
          } ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          ref={popoverRef}
          className="absolute top-full left-0 mt-2 p-3 bg-white rounded-lg border border-border shadow-brand z-50 min-w-[200px]"
        >
          <div className="grid grid-cols-5 gap-2">
            {BRAND_SWATCHES.map((swatch) => (
              <button
                key={swatch.color}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleColorSelect(swatch.color);
                }}
                className={`w-8 h-8 rounded-md border-2 transition-all hover:scale-110 ${
                  currentColor === swatch.color 
                    ? 'border-ring shadow-brand' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ backgroundColor: swatch.color }}
                title={swatch.name}
              />
            ))}
          </div>
          
          {/* Custom color input */}
          <div className="mt-3 pt-3 border-t border-border">
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Custom Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentColor}
                onMouseDown={(e) => e.preventDefault()}
                onChange={(e) => {
                  e.stopPropagation();
                  handleColorSelect(e.target.value);
                }}
                className="w-8 h-8 rounded-md border border-border cursor-pointer"
              />
              <input
                type="text"
                value={currentColor}
                onMouseDown={(e) => e.preventDefault()}
                onChange={(e) => {
                  e.stopPropagation();
                  handleColorSelect(e.target.value);
                }}
                placeholder="#000000"
                className="flex-1 px-2 py-1 text-xs border border-border rounded-sm bg-input focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}