// components/workspace/AccordionToolbar.tsx
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

const BACKGROUND_FILLS = [
  { name: 'None', hex: 'transparent', preview: 'none' },
  { name: 'Light Yellow', hex: '#FEF3C7', preview: 'solid' },
  { name: 'Light Blue', hex: '#DBEAFE', preview: 'solid' },
  { name: 'Light Green', hex: '#D1FAE5', preview: 'solid' },
  { name: 'Light Purple', hex: '#E9D5FF', preview: 'solid' },
  { name: 'Light Pink', hex: '#FCE7F3', preview: 'solid' },
  { name: 'Light Gray', hex: '#F3F4F6', preview: 'solid' },
  { name: 'Light Orange', hex: '#FED7AA', preview: 'solid' },
  { name: 'Light Red', hex: '#FECACA', preview: 'solid' },
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

/* ===== small reusable row (declare BEFORE usage to keep parser happy) ===== */

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
              value={Number.isFinite(size) ? size : min}
              onChange={(e) => onSize(Number(e.target.value))}
              className="slider-premium-dynamic h-2 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-gray-200 to-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
              data-value={String(size)}
            />
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

/* ===== main component ===== */

export function AccordionToolbar({
  toolType,
  isExpanded,
  className = '',
}: AccordionToolbarProps) {
  const { toolPrefs, updateToolPref, excalidrawAPI, activeTool } = useWorkspaceStore.getState();

  // canonical defaults per tool
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

  // local state
  const [localColor, setLocalColor] = useState<string>(defaults.color);
  const [localSize, setLocalSize] = useState<number>(defaults.size);
  const [localFontFamily, setLocalFontFamily] = useState<string>('Arial, sans-serif');
  const [localBackgroundFill, setLocalBackgroundFill] = useState<string>('transparent');
  const [localBorderColor, setLocalBorderColor] = useState<string>('#000000');
  const [localBorderWidth, setLocalBorderWidth] = useState<number>(0);
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUnderlined, setIsUnderlined] = useState<boolean>(false); // may not be supported by Excalidraw
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');

  // dropdowns
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
  const [showBackgroundOptions, setShowBackgroundOptions] = useState(false);
  const [showBorderOptions, setShowBorderOptions] = useState(false);

  // selection status
  const hasSelectedText = useMemo(() => {
    if (!excalidrawAPI) return false;
    try {
      const appState = excalidrawAPI.getAppState();
      const elements = excalidrawAPI.getSceneElements();
      const selectedElementIds = Object.keys(appState.selectedElementIds || {});
      return selectedElementIds.some((id) => {
        const el = elements.find((e: any) => e.id === id);
        return el && el.type === 'text';
      });
    } catch {
      return false;
    }
  }, [excalidrawAPI, activeTool]);

  const selectedTextProperties = useMemo(() => {
    if (!excalidrawAPI || !hasSelectedText) return null;
    try {
      const appState = excalidrawAPI.getAppState();
      const elements = excalidrawAPI.getSceneElements();
      const selectedElementIds = Object.keys(appState.selectedElementIds || {});
      const firstText = elements.find(
        (el: any) => selectedElementIds.includes(el.id) && el.type === 'text',
      );
      if (firstText) {
        return {
          color: firstText.strokeColor ?? '#000000',
          fontSize: firstText.fontSize ?? 24,
          fontWeight: firstText.fontWeight ?? 'normal',
          fontStyle: firstText.fontStyle ?? 'normal',
          textAlign: firstText.textAlign ?? 'left',
        };
      }
    } catch (e) {
      console.error('Error getting selected text properties:', e);
    }
    return null;
  }, [excalidrawAPI, hasSelectedText, activeTool]);

  // debug
  useEffect(() => {
    console.log('🔍 AccordionToolbar: API status:', {
      hasAPI: !!excalidrawAPI,
      toolType,
      isExpanded,
      activeTool,
      localColor,
      localSize,
      hasSelectedText,
      selectedTextProperties,
    });
  }, [
    excalidrawAPI,
    toolType,
    isExpanded,
    activeTool,
    localColor,
    localSize,
    hasSelectedText,
    selectedTextProperties,
  ]);

  // sync from store
  useEffect(() => {
    const colorFromStore =
      (toolPrefs?.[defaults.colorKey as keyof typeof toolPrefs] as string | undefined) ??
      defaults.color;
    const sizeFromStore =
      (toolPrefs?.[defaults.sizeKey as keyof typeof toolPrefs] as number | undefined) ??
      defaults.size;

    setLocalColor(colorFromStore);
    setLocalSize(Number.isFinite(sizeFromStore) ? (sizeFromStore as number) : defaults.size);

    if (toolType === 'text') {
      setLocalFontFamily(toolPrefs?.textFamily || 'Arial, sans-serif');
      setLocalBackgroundFill(toolPrefs?.textBackgroundFill || 'transparent');
      setLocalBorderColor(toolPrefs?.textBorderColor || '#000000');
      setLocalBorderWidth(toolPrefs?.textBorderWidth || 0);
      setIsBold(!!toolPrefs?.textBold);
      setIsItalic(!!toolPrefs?.textItalic);
      setIsUnderlined(!!toolPrefs?.textUnderlined);
      setTextAlign((toolPrefs?.textAlign as 'left' | 'center' | 'right') || 'left');
    }
  }, [toolPrefs, defaults, toolType]);

  const applyToExcalidraw = useCallback((payload: Record<string, any>) => {
    if (!excalidrawAPI) return;
    try {
      excalidrawAPI.updateScene({ appState: payload });
    } catch (err) {
      console.error('⚠ Excalidraw update failed:', err);
    }
  }, [excalidrawAPI]);

  /* ===== text handlers ===== */

  const handleTextColorChange = useCallback(
    (hex: string) => {
      setLocalColor(hex);
      updateToolPref?.('textColor', hex);
      applyToExcalidraw({ currentItemStrokeColor: hex });

      if (excalidrawAPI) {
        try {
          const elements = excalidrawAPI.getSceneElements();
          const appState = excalidrawAPI.getAppState();
          const selectedElementIds = Object.keys(appState.selectedElementIds || {});
          if (selectedElementIds.length > 0) {
            const updatedElements = elements.map((el: any) =>
              selectedElementIds.includes(el.id) && el.type === 'text'
                ? { ...el, strokeColor: hex }
                : el,
            );
            excalidrawAPI.updateScene({ elements: updatedElements, commitToHistory: true });
          }
        } catch (e) {
          console.error('Error applying color to selected text:', e);
        }
      }
    },
    [updateToolPref, applyToExcalidraw, excalidrawAPI],
  );

  const handleTextColorChangeWithToolSwitch = useCallback(
    (hex: string) => {
      handleTextColorChange(hex);
      if (activeTool !== 'text' && excalidrawAPI) {
        try {
          excalidrawAPI.setActiveTool({ type: 'text' });
          const { setActiveTool } = useWorkspaceStore.getState();
          setActiveTool('text');
        } catch (e) {
          console.error('Error switching to text tool:', e);
        }
      }
    },
    [handleTextColorChange, activeTool, excalidrawAPI],
  );

  const handleFontSizeChange = useCallback(
    (size: number) => {
      const clamped = Math.max(8, Math.min(72, size));
      setLocalSize(clamped);
      updateToolPref?.('textSize', clamped);
      applyToExcalidraw({ currentItemFontSize: clamped });

      if (excalidrawAPI) {
        try {
          const elements = excalidrawAPI.getSceneElements();
          const appState = excalidrawAPI.getAppState();
          const selectedElementIds = Object.keys(appState.selectedElementIds || {});
          if (selectedElementIds.length > 0) {
            const updatedElements = elements.map((el: any) =>
              selectedElementIds.includes(el.id) && el.type === 'text'
                ? { ...el, fontSize: clamped }
                : el,
            );
            excalidrawAPI.updateScene({ elements: updatedElements, commitToHistory: true });
          }
        } catch (e) {
          console.error('Error applying font size to selected text:', e);
        }
      }
    },
    [updateToolPref, applyToExcalidraw, excalidrawAPI],
  );

  const handleFontFamilyChange = useCallback(
    (fontFamily: string) => {
      setLocalFontFamily(fontFamily);
      updateToolPref?.('textFamily', fontFamily);
      applyToExcalidraw({ currentItemFontFamily: fontFamily });
    },
    [updateToolPref, applyToExcalidraw],
  );

  const handleBackgroundFillChange = useCallback(
    (fill: string) => {
      setLocalBackgroundFill(fill);
      updateToolPref?.('textBackgroundFill', fill);
      applyToExcalidraw({
        currentItemBackgroundColor: fill === 'transparent' ? 'transparent' : fill,
      });
    },
    [updateToolPref, applyToExcalidraw],
  );

  const handleBorderChange = useCallback(
    (color: string, width: number) => {
      setLocalBorderColor(color);
      setLocalBorderWidth(width);
      updateToolPref?.('textBorderColor', color);
      updateToolPref?.('textBorderWidth', width);
      applyToExcalidraw({
        currentItemStrokeColor: width > 0 ? color : 'transparent',
        currentItemStrokeWidth: width,
      });
    },
    [updateToolPref, applyToExcalidraw],
  );

  const handleStyleToggle = useCallback(
    (style: 'bold' | 'italic' | 'underline') => {
      let newValue: boolean;
      switch (style) {
        case 'bold':
          newValue = !isBold;
          setIsBold(newValue);
          updateToolPref?.('textBold', newValue);
          break;
        case 'italic':
          newValue = !isItalic;
          setIsItalic(newValue);
          updateToolPref?.('textItalic', newValue);
          break;
        case 'underline':
          newValue = !isUnderlined;
          setIsUnderlined(newValue);
          updateToolPref?.('textUnderlined', newValue);
          break;
      }
      const fontWeight = (style === 'bold' ? !isBold : isBold) ? 'bold' : 'normal';
      const fontStyle = (style === 'italic' ? !isItalic : isItalic) ? 'italic' : 'normal';
      applyToExcalidraw({ currentItemFontWeight: fontWeight, currentItemFontStyle: fontStyle });
    },
    [isBold, isItalic, isUnderlined, updateToolPref, applyToExcalidraw],
  );

  const handleStyleToggleWithSelection = useCallback(
    (style: 'bold' | 'italic' | 'underline') => {
      handleStyleToggle(style);
      if (excalidrawAPI) {
        try {
          const elements = excalidrawAPI.getSceneElements();
          const appState = excalidrawAPI.getAppState();
          const selectedElementIds = Object.keys(appState.selectedElementIds || {});
          if (selectedElementIds.length > 0) {
            const updatedElements = elements.map((el: any) => {
              if (selectedElementIds.includes(el.id) && el.type === 'text') {
                const updates: any = {};
                if (style === 'bold') {
                  updates.fontWeight = el.fontWeight === 'bold' ? 'normal' : 'bold';
                } else if (style === 'italic') {
                  updates.fontStyle = el.fontStyle === 'italic' ? 'normal' : 'italic';
                } else if (style === 'underline') {
                  // Excalidraw may not support underline natively; this assumes textDecoration is respected.
                  updates.textDecoration = el.textDecoration === 'underline' ? 'none' : 'underline';
                }
                return { ...el, ...updates };
              }
              return el;
            });
            excalidrawAPI.updateScene({ elements: updatedElements, commitToHistory: true });
          }
        } catch (e) {
          console.error(`Error applying ${style} to selected text:`, e);
        }
      }
    },
    [handleStyleToggle, excalidrawAPI],
  );

  const handleAlignmentChange = useCallback(
    (align: 'left' | 'center' | 'right') => {
      setTextAlign(align);
      updateToolPref?.('textAlign', align);
      applyToExcalidraw({ currentItemTextAlign: align });

      if (excalidrawAPI) {
        try {
          const elements = excalidrawAPI.getSceneElements();
          const appState = excalidrawAPI.getAppState();
          const selectedElementIds = Object.keys(appState.selectedElementIds || {});
          if (selectedElementIds.length > 0) {
            const updatedElements = elements.map((el: any) =>
              selectedElementIds.includes(el.id) && el.type === 'text'
                ? { ...el, textAlign: align }
                : el,
            );
            excalidrawAPI.updateScene({ elements: updatedElements, commitToHistory: true });
          }
        } catch (e) {
          console.error('Error applying text alignment to selected text:', e);
        }
      }
    },
    [updateToolPref, applyToExcalidraw, excalidrawAPI],
  );

  /* ===== non-text handlers ===== */

  const handleColorChange = useCallback(
    (hex: string) => {
      setLocalColor(hex);
      updateToolPref?.(defaults.colorKey as any, hex);
      const payload: any = { currentItemStrokeColor: hex, currentItemStrokeStyle: 'solid' };
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
      const clamped = Math.min(Math.max(n, defaults.min), defaults.max);
      setLocalSize(clamped);
      updateToolPref?.(defaults.sizeKey as any, clamped);
      applyToExcalidraw({ currentItemStrokeWidth: clamped, currentItemStrokeStyle: 'solid' });
    },
    [defaults.min, defaults.max, defaults.sizeKey, updateToolPref, applyToExcalidraw],
  );

  if (!isExpanded) return null;

  return (
    <div className={`accordion-toolbar ${className}`}>
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          {/* ===== TEXT TOOL ===== */}
          {toolType === 'text' && (
            <div className="space-y-3">
              {hasSelectedText && (
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
                {/* LEFT: Font & Size */}
                <div className="flex items-center gap-3">
                  {/* Font Family */}
                  <div className="relative">
                    <select
                      value={localFontFamily}
                      onChange={(e) => handleFontFamilyChange(e.target.value)}
                      className="text-sm px-3 py-2 border border-gray-300 rounded-md bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      style={{ fontFamily: localFontFamily, minWidth: '100px' }}
                    >
                      {TEXT_FONT_FAMILIES.map((font) => (
                        <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                          {font.display}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Font Size */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFontSizeChange(Math.max(8, localSize - 2))}
                      className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm flex items-center justify-center transition-colors"
                      title="Decrease font size"
                      type="button"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={8}
                      max={72}
                      value={localSize}
                      onChange={(e) => handleFontSizeChange(parseInt(e.target.value, 10) || 24)}
                      className="w-14 h-7 text-sm text-center border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleFontSizeChange(Math.min(72, localSize + 2))}
                      className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm flex items-center justify-center transition-colors"
                      title="Increase font size"
                      type="button"
                    >
                      +
                    </button>
                  </div>

                  {/* Styles */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleStyleToggleWithSelection('bold')}
                      className={`w-7 h-7 rounded-md font-bold text-sm flex items-center justify-center transition-colors ${
                        isBold ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title="Bold"
                      type="button"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStyleToggleWithSelection('italic')}
                      className={`w-7 h-7 rounded-md text-sm flex items-center justify-center transition-colors ${
                        isItalic ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title="Italic"
                      type="button"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStyleToggleWithSelection('underline')}
                      className={`w-7 h-7 rounded-md text-sm flex items-center justify-center transition-colors ${
                        isUnderlined ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title="Underline"
                      type="button"
                    >
                      <Underline className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Align */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleAlignmentChange('left')}
                      className={`w-7 h-7 rounded-md text-sm flex items-center justify-center transition-colors ${
                        textAlign === 'left' ? 'bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title="Align left"
                      type="button"
                    >
                      <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAlignmentChange('center')}
                      className={`w-7 h-7 rounded-md text-sm flex items-center justify-center transition-colors ${
                        textAlign === 'center' ? 'bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title="Align center"
                      type="button"
                    >
                      <AlignCenter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAlignmentChange('right')}
                      className={`w-7 h-7 rounded-md text-sm flex items-center justify-center transition-colors ${
                        textAlign === 'right' ? 'bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title="Align right"
                      type="button"
                    >
                      <AlignRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-gray-300" />

                {/* MIDDLE: Text Colors */}
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
                        onClick={() => handleTextColorChangeWithToolSwitch(color.hex)}
                        className={`h-7 w-7 rounded-md border-2 transition-all hover:scale-110 ${
                          selected ? 'border-blue-500 ring-2 ring-blue-200 scale-105' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                        type="button"
                      />
                    );
                  })}

                  {/* Custom Color Picker */}
                  <div className="relative">
                    <button
                      onClick={() => setShowCustomColorPicker((s) => !s)}
                      className="h-7 w-7 rounded-md border-2 border-gray-300 hover:border-gray-400 bg-white flex items-center justify-center transition-all hover:scale-110"
                      title="Custom color"
                      type="button"
                    >
                      <Palette className="w-4 h-4 text-gray-600" />
                    </button>

                    {showCustomColorPicker && (
                      <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
                        <div className="grid grid-cols-6 gap-2 mb-3">
                          {TEXT_COLORS.slice(5).map((color) => (
                            <button
                              key={color.hex}
                              onClick={() => {
                                handleTextColorChangeWithToolSwitch(color.hex);
                                setShowCustomColorPicker(false);
                              }}
                              className={`h-6 w-6 rounded border-2 transition-all hover:scale-110 ${
                                localColor === color.hex ? 'border-blue-500 ring-1 ring-blue-200' : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: color.hex }}
                              title={color.name}
                              type="button"
                            />
                          ))}
                        </div>
                        <input
                          type="color"
                          value={localColor}
                          onChange={(e) => {
                            handleTextColorChangeWithToolSwitch(e.target.value);
                            setShowCustomColorPicker(false);
                          }}
                          className="w-full h-8 rounded border border-gray-300 cursor-pointer"
                          title="Custom color picker"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-gray-300" />

                {/* RIGHT: BG & Border */}
                <div className="flex items-center gap-2">
                  {/* Background Fill */}
                  <div className="relative">
                    <button
                      onClick={() => setShowBackgroundOptions((s) => !s)}
                      className={`h-7 w-7 rounded-md border-2 transition-all hover:scale-110 flex items-center justify-center ${
                        localBackgroundFill !== 'transparent'
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-300 hover:border-gray-400 bg-white text-gray-600'
                      }`}
                      title="Background fill"
                      type="button"
                    >
                      <Square className="w-4 h-4" />
                    </button>

                    {showBackgroundOptions && (
                      <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-lg border border-gray-200 shadow-lg z-50 min-w-[120px]">
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              handleBackgroundFillChange('transparent');
                              setShowBackgroundOptions(false);
                            }}
                            className={`w-full h-8 rounded border-2 transition-all flex items-center justify-center ${
                              localBackgroundFill === 'transparent'
                                ? 'border-blue-500 ring-1 ring-blue-200'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            style={{
                              background:
                                'repeating-conic-gradient(#f0f0f0 0% 25%, transparent 0% 50%) 50% / 8px 8px',
                            }}
                            title="No background"
                            type="button"
                          >
                            <span className="text-xs text-gray-600">None</span>
                          </button>

                          {BACKGROUND_FILLS.slice(1, 4).map((fill) => (
                            <button
                              key={fill.hex}
                              onClick={() => {
                                handleBackgroundFillChange(fill.hex);
                                setShowBackgroundOptions(false);
                              }}
                              className={`w-full h-8 rounded border-2 transition-all ${
                                localBackgroundFill === fill.hex
                                  ? 'border-blue-500 ring-1 ring-blue-200'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                              style={{ backgroundColor: fill.hex }}
                              title={fill.name}
                              type="button"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Border */}
                  <div className="relative">
                    <button
                      onClick={() => setShowBorderOptions((s) => !s)}
                      className={`h-7 w-7 rounded-md border-2 transition-all hover:scale-110 flex items-center justify-center ${
                        localBorderWidth > 0
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-300 hover:border-gray-400 bg-white text-gray-600'
                      }`}
                      title="Text border"
                      type="button"
                    >
                      <BorderAll className="w-4 h-4" />
                    </button>

                    {showBorderOptions && (
                      <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-lg border border-gray-200 shadow-lg z-50 min-w-[120px]">
                        <div className="space-y-2">
                          <div className="text-xs text-gray-600 mb-2">Border Width:</div>
                          <div className="flex gap-1">
                            {[0, 1, 2, 3].map((width) => (
                              <button
                                key={width}
                                onClick={() => {
                                  handleBorderChange(localBorderColor, width);
                                  if (width === 0) setShowBorderOptions(false);
                                }}
                                className={`px-2 py-1 rounded text-xs transition-colors ${
                                  localBorderWidth === width
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                                type="button"
                              >
                                {width === 0 ? 'Off' : width}
                              </button>
                            ))}
                          </div>

                          {localBorderWidth > 0 && (
                            <>
                              <div className="text-xs text-gray-600 mt-3 mb-2">Border Color:</div>
                              <div className="grid grid-cols-3 gap-1">
                                {[
                                  { name: 'Black', hex: '#000000' },
                                  { name: 'Gray', hex: '#6B7280' },
                                  { name: 'Blue', hex: '#2563EB' },
                                ].map((color) => (
                                  <button
                                    key={color.hex}
                                    onClick={() => {
                                      handleBorderChange(color.hex, localBorderWidth);
                                      setShowBorderOptions(false);
                                    }}
                                    className={`h-6 w-6 rounded border-2 transition-all ${
                                      localBorderColor === color.hex
                                        ? 'border-blue-500 ring-1 ring-blue-200'
                                        : 'border-gray-300'
                                    }`}
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                    type="button"
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
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
                      textDecoration: isUnderlined ? 'underline' : 'none', // may be ignored by Excalidraw
                      color: localColor,
                      backgroundColor:
                        localBackgroundFill === 'transparent' ? 'transparent' : localBackgroundFill,
                      border:
                        localBorderWidth > 0
                          ? `${localBorderWidth}px solid ${localBorderColor}`
                          : 'none',
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
          )}

          {/* ===== NON-TEXT TOOLS ===== */}
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

      {/* global click-out to close popovers */}
      {(showCustomColorPicker || showBackgroundOptions || showBorderOptions) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowCustomColorPicker(false);
            setShowBackgroundOptions(false);
            setShowBorderOptions(false);
          }}
        />
      )}

      {/* slider styles */}
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
