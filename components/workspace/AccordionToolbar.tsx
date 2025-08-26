'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';

const DRAW_COLORS = [
  { name: 'Black', hex: '#111827' },
  { name: 'Primary', hex: '#EC5D3A' },
  { name: 'Accent', hex: '#FFD166' },
  { name: 'Teal', hex: '#3AAFA9' },
  { name: 'Navy', hex: '#1B2A49' },
  { name: 'Gray', hex: '#6B7280' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Purple', hex: '#9333EA' },
] as const;

type ToolType = 'draw' | 'highlighter' | 'text' | 'shapes';

interface AccordionToolbarProps {
  toolType: ToolType;
  isExpanded: boolean;
  className?: string;
}

export function AccordionToolbar({
  toolType,
  isExpanded,
  className = '',
}: AccordionToolbarProps) {
  const { toolPrefs, updateToolPref, excalidrawAPI, activeTool } =
    useWorkspaceStore();

  // Derive canonical defaults per tool
  const defaults = useMemo(() => {
    switch (toolType) {
      case 'draw':
        return { colorKey: 'drawColor', sizeKey: 'drawSize', color: '#111827', size: 4, min: 1, max: 20 };
      case 'highlighter':
        return { colorKey: 'highlighterColor', sizeKey: 'highlighterSize', color: '#FFF176', size: 12, min: 6, max: 30 };
      case 'text':
        return { colorKey: 'textColor', sizeKey: 'textSize', color: '#111827', size: 24, min: 8, max: 72 };
      case 'shapes':
      default:
        return { colorKey: 'drawColor', sizeKey: 'drawSize', color: '#111827', size: 4, min: 1, max: 20 };
    }
  }, [toolType]);

  // Local, always-controlled mirrors (prevents value -> undefined transitions)
  const [localColor, setLocalColor] = useState<string>(defaults.color);
  const [localSize, setLocalSize] = useState<number>(defaults.size);

  // Sync local mirrors from store when tool or prefs change (with fallbacks)
  useEffect(() => {
    const colorFromStore =
      (toolPrefs?.[defaults.colorKey as keyof typeof toolPrefs] as string | undefined) ??
      defaults.color;
    const sizeFromStore =
      (toolPrefs?.[defaults.sizeKey as keyof typeof toolPrefs] as number | undefined) ??
      defaults.size;

    setLocalColor(colorFromStore);
    setLocalSize(
      Number.isFinite(sizeFromStore) ? (sizeFromStore as number) : defaults.size,
    );
  }, [toolPrefs, defaults]);

  // Debug
  useEffect(() => {
    console.log('🔍 AccordionToolbar: API status:', {
      hasAPI: !!excalidrawAPI,
      toolType,
      isExpanded,
      activeTool,
      localColor,
      localSize,
    });
  }, [excalidrawAPI, toolType, isExpanded, activeTool, localColor, localSize]);

  const applyToExcalidraw = useCallback(
    (payload: Record<string, any>) => {
      if (!excalidrawAPI) return;
      try {
        excalidrawAPI.updateScene({ appState: payload });
      } catch (err) {
        console.error('❌ Excalidraw update failed:', err);
      }
    },
    [excalidrawAPI],
  );

  const handleColorChange = useCallback(
    (hex: string) => {
      setLocalColor(hex); // stay controlled instantly

      if (updateToolPref) {
        try {
          updateToolPref(defaults.colorKey as any, hex);
        } catch (err) {
          console.error('❌ Failed to update store color:', err);
        }
      }

      const payload: any = {
        currentItemStrokeColor: hex,
        currentItemStrokeStyle: 'solid',
      };
      if (toolType === 'highlighter') {
        const hlOpacity = Math.round(((toolPrefs?.highlighterOpacity ?? 0.3) as number) * 100);
        payload.currentItemOpacity = hlOpacity;
      }
      applyToExcalidraw(payload);
    },
    [defaults.colorKey, updateToolPref, toolType, toolPrefs, applyToExcalidraw],
  );

  const handleSizeChange = useCallback(
    (n: number) => {
      // clamp for safety
      const clamped = Math.min(Math.max(n, defaults.min), defaults.max);
      setLocalSize(clamped);

      if (updateToolPref) {
        try {
          updateToolPref(defaults.sizeKey as any, clamped);
        } catch (err) {
          console.error('❌ Failed to update store size:', err);
        }
      }

      applyToExcalidraw({
        currentItemStrokeWidth: clamped,
        currentItemStrokeStyle: 'solid',
      });
    },
    [defaults.min, defaults.max, defaults.sizeKey, updateToolPref, applyToExcalidraw],
  );

  if (!isExpanded) return null;

  return (
    <div className={`accordion-toolbar ${className}`}>
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          {/* Draw */}
          {toolType === 'draw' && (
            <Row
              swatches={DRAW_COLORS}
              selected={localColor}
              onSelect={handleColorChange}
              size={localSize}
              onSize={handleSizeChange}
              min={defaults.min}
              max={defaults.max}
              preview={({ color, size }) => (
                <div
                  className="rounded-full bg-current transition-all duration-200 shadow-sm"
                  style={{
                    width: `${Math.max(size * 1.5, 6)}px`,
                    height: `${Math.max(size * 1.5, 6)}px`,
                    color,
                    maxWidth: '30px',
                    maxHeight: '30px',
                  }}
                />
              )}
            />
          )}

          {/* Highlighter */}
          {toolType === 'highlighter' && (
            <Row
              swatches={[
                { name: 'Yellow', hex: '#FFF176' },
                { name: 'Green', hex: '#C8E6C9' },
                { name: 'Blue', hex: '#BBDEFB' },
                { name: 'Pink', hex: '#F8BBD9' },
                { name: 'Orange', hex: '#FFE0B2' },
                { name: 'Purple', hex: '#E1BEE7' },
              ]}
              selected={localColor}
              onSelect={handleColorChange}
              size={localSize}
              onSize={handleSizeChange}
              min={defaults.min}
              max={defaults.max}
              preview={({ color, size }) => (
                <div
                  className="rounded-sm bg-current transition-all duration-200 shadow-sm opacity-60"
                  style={{
                    width: `${Math.max(size * 1.2, 8)}px`,
                    height: `${Math.max(size * 0.8, 4)}px`,
                    color,
                    maxWidth: '36px',
                    maxHeight: '20px',
                  }}
                />
              )}
            />
          )}

          {/* Text */}
          {toolType === 'text' && (
            <Row
              swatches={DRAW_COLORS}
              selected={localColor}
              onSelect={handleColorChange}
              size={localSize}
              onSize={handleSizeChange}
              min={defaults.min}
              max={defaults.max}
              preview={({ color, size }) => (
                <div
                  className="select-none font-medium transition-all duration-200"
                  style={{
                    fontSize: `${Math.min(Math.max(size * 0.6, 12), 24)}px`,
                    color,
                    lineHeight: '1',
                  }}
                >
                  Aa
                </div>
              )}
            />
          )}

          {/* Shapes */}
          {toolType === 'shapes' && (
            <Row
              swatches={DRAW_COLORS}
              selected={localColor}
              onSelect={handleColorChange}
              size={localSize}
              onSize={handleSizeChange}
              min={defaults.min}
              max={defaults.max}
              preview={({ color, size }) => (
                <div
                  className="transition-all duration-200"
                  style={{
                    width: `${Math.max(size * 1.5, 8)}px`,
                    height: `${Math.max(size * 1.5, 8)}px`,
                    border: '2px solid',
                    borderColor: color,
                    backgroundColor: 'transparent',
                    maxWidth: '24px',
                    maxHeight: '24px',
                  }}
                />
              )}
            />
          )}
        </div>
      </div>

      {/* Premium Slider Styles with Dynamic Thumb Values */}
      <style jsx>{`
        .slider-premium-dynamic {
          background: linear-gradient(to right, #f3f4f6 0%, #e5e7eb 100%);
          border-radius: 10px;
          outline: none;
          transition: all 0.3s ease;
        }
        .slider-premium-dynamic:hover {
          background: linear-gradient(to right, #e5e7eb 0%, #d1d5db 100%);
        }
        .slider-premium-dynamic::-webkit-slider-thumb {
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          cursor: pointer;
          border: 2px solid #3b82f6;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.8);
          transition: all 0.2s ease;
          position: relative;
        }
        .slider-premium-dynamic::-webkit-slider-thumb::before {
          content: attr(data-value);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 10px;
          font-weight: 600;
          color: #3b82f6;
          text-align: center;
          line-height: 1;
          pointer-events: none;
        }
        .slider-premium-dynamic::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          cursor: pointer;
          border: 2px solid #3b82f6;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
          transition: all 0.2s ease;
          position: relative;
        }
      `}</style>
    </div>
  );
}

/** Reusable row with swatches + size slider + preview */
function Row({
  swatches,
  selected,
  onSelect,
  size,
  onSize,
  min,
  max,
  preview,
}: {
  swatches: readonly { name: string; hex: string }[];
  selected: string;
  onSelect: (hex: string) => void;
  size: number;
  onSize: (n: number) => void;
  min: number;
  max: number;
  preview: (p: { color: string; size: number }) => React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center gap-16">
      {/* Swatches */}
      <div className="flex items-center gap-3" style={{ width: '460px' }}>
        {swatches.map((c) => {
          const isSelected = c.hex === selected;
          return (
            <button
              key={c.hex}
              onClick={() => onSelect(c.hex)}
              className={`h-10 w-10 rounded-full border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg ${
                isSelected
                  ? 'scale-105 border-blue-500 ring-2 ring-blue-200 shadow-md'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
              type="button"
            />
          );
        })}
      </div>

      {/* Divider */}
      <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />

      {/* Size + Preview */}
      <div className="flex items-center gap-4" style={{ width: '240px' }}>
        <div className="flex items-center gap-3" style={{ width: '140px' }}>
          <span className="w-4 text-center text-xs text-gray-400">{min}</span>
          <div className="relative flex-1">
<input
  type="range"
  min={min}
  max={max}
  // Always keep the slider controlled
  value={Number.isFinite(size) ? size : min}
  onChange={(e) => onSize(Number(e.target.value))}
  className="slider-premium-dynamic h-2 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-gray-200 to-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
  data-value={String(size)}
/>
  {/* For WebKit thumb label */}
          </div>
          <span className="w-4 text-center text-xs text-gray-400">{max}</span>
        </div>

        <div className="flex h-5 w-20 items-center justify-center">
          {preview({ color: selected, size })}
        </div>
      </div>
    </div>
  );
}
