'use client';

import { useState, useRef, useEffect } from 'react';

export const BRAND_SWATCHES = [
  { color: '#E55A3C', name: 'Primary Orange' },
  { color: '#F47B5C', name: 'Light Orange' },
  { color: '#2E5A8A', name: 'Secondary Blue' },
  { color: '#5B9BD5', name: 'Light Blue' },
  { color: '#7BA05B', name: 'Accent Green' },
  { color: '#A8C686', name: 'Light Green' },
  { color: '#F59E0B', name: 'Warning' },
  { color: '#EF4444', name: 'Error' },
  { color: '#374151', name: 'Dark Gray' },
  { color: '#000000', name: 'Black' },
];

type Props = {
  currentColor: string;
  onColorSelect: (hex: string) => void;
  label?: string;
  buttonSize?: 'default' | 'sm';
  isMixed?: boolean;
};

export function ColorPopover({
  currentColor,
  onColorSelect,
  label = 'Color',
  buttonSize = 'default',
  isMixed = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(t) &&
        buttonRef.current &&
        !buttonRef.current.contains(t)
      ) {
        setIsOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
    if (isOpen) {
      document.addEventListener('mousedown', onDocDown);
      document.addEventListener('keydown', onEsc);
    }
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [isOpen]);

  const pick = (hex: string) => {
    onColorSelect(hex);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onPointerDownCapture={(e) => { e.stopPropagation(); e.preventDefault(); }}
        onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
        onClick={(e) => { e.stopPropagation(); setIsOpen((v) => !v); }}
        className={`flex items-center gap-2 rounded-md border border-border hover:bg-muted transition-colors ${
          buttonSize === 'sm' ? 'px-2 py-1' : 'px-3 py-2'
        }`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        title={`${label}: ${isMixed ? 'Mixed' : currentColor}`}
      >
        <div
          className={`rounded-sm border border-gray-300 shadow-sm ${buttonSize === 'sm' ? 'w-4 h-4' : 'w-5 h-5'}`}
          style={{ backgroundColor: isMixed ? 'transparent' : currentColor }}
        />
        <span className={`${buttonSize === 'sm' ? 'text-xs' : 'text-sm'} font-medium`}>
          {isMixed ? `${label}: Mixed` : label}
        </span>
        <svg className={`${buttonSize === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={`${label} popover`}
          onPointerDownCapture={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-full left-0 mt-2 p-3 bg-white rounded-lg border border-border shadow-lg z-50 min-w-[220px]"
        >
          <div className="grid grid-cols-5 gap-2">
            {BRAND_SWATCHES.map((s) => (
              <button
                key={s.color}
                title={s.name}
                className="w-8 h-8 rounded-md border border-gray-300 hover:scale-105 transition-transform"
                style={{ backgroundColor: s.color }}
                onPointerDownCapture={(e) => { e.stopPropagation(); e.preventDefault(); }}
                onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
                onClick={(e) => { e.stopPropagation(); pick(s.color); }}
              />
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
            <input
              type="color"
              value={currentColor}
              onPointerDownCapture={(e) => { e.stopPropagation(); e.preventDefault(); }}
              onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
              onChange={(e) => { e.stopPropagation(); pick(e.target.value); }}
              className="w-10 h-8 p-0 border border-border rounded-sm bg-input"
            />
            <input
              type="text"
              placeholder="#000000"
              defaultValue={currentColor}
              onPointerDownCapture={(e) => { e.stopPropagation(); e.preventDefault(); }}
              onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) pick(val);
                }
              }}
              className="flex-1 px-2 py-1 text-xs border border-border rounded-sm bg-input focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      )}
    </div>
  );
}
