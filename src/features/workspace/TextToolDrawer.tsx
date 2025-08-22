import React from 'react'
import { Bold, Italic, Underline, PaintBucket, Square } from 'lucide-react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

const FONT_FAMILIES = [
  { value: 'sans-serif', label: 'Sans', style: 'font-family: system-ui, -apple-system, sans-serif' },
  { value: '"Times New Roman", Georgia, serif', label: 'Serif', style: 'font-family: "Times New Roman", Georgia, serif' },
  { value: '"Comic Sans MS", cursive', label: 'Comic', style: 'font-family: "Comic Sans MS", cursive' },
  { value: '"Courier New", monospace', label: 'Mono', style: 'font-family: "Courier New", monospace' },
  { value: 'OpenDyslexic, sans-serif', label: 'Dyslexia', style: 'font-family: OpenDyslexic, sans-serif' },
]

const FONT_SIZES = [12, 14, 16, 18, 24, 36]
const BORDER_THICKNESSES = [1, 2, 4, 6]

const TEXT_COLORS = [
  '#1a1a1a', // Black
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#f59e0b', // Orange
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
]

export function TextToolDrawer() {
  const { toolPrefs, updateToolPref } = useWorkspaceStore()

  return (
    <div className="flex items-center gap-6 overflow-x-auto">
      {/* Font Family Dropdown */}
      <select
          value={toolPrefs.textFamily}
          onChange={(e) => updateToolPref('textFamily', e.target.value)}
          className="px-3 py-1.5 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary min-w-[80px]"
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.label}
            </option>
          ))}
        </select>

      {/* Font Size Dropdown */}
      <select
          value={toolPrefs.textSize}
          onChange={(e) => updateToolPref('textSize', Number(e.target.value))}
          className="px-3 py-1.5 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary min-w-[60px]"
        >
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

      {/* Style Toggles */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => updateToolPref('textBold', !toolPrefs.textBold)}
          className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary ${
            toolPrefs.textBold 
              ? 'bg-brand-primary text-white' 
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
          aria-label="Bold"
          title="Bold"
        >
          <Bold className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <button
          onClick={() => updateToolPref('textItalic', !toolPrefs.textItalic)}
          className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary ${
            toolPrefs.textItalic 
              ? 'bg-brand-primary text-white' 
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
          aria-label="Italic"
          title="Italic"
        >
          <Italic className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <button
          onClick={() => updateToolPref('textUnderline', !toolPrefs.textUnderline)}
          className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary ${
            toolPrefs.textUnderline 
              ? 'bg-brand-primary text-white' 
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
          aria-label="Underline"
          title="Underline"
        >
          <Underline className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>

      {/* Text Color Picker */}
      <div className="flex items-center gap-1">
          {/* Color Palette */}
          <div className="flex gap-1">
            {TEXT_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => updateToolPref('textColor', color)}
                className={`w-6 h-6 rounded border-2 transition-all ${
                  toolPrefs.textColor === color 
                    ? 'border-brand-primary scale-110' 
                    : 'border-neutral-300 hover:border-neutral-400'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Set text color to ${color}`}
                title={`Color: ${color}`}
              />
            ))}
          </div>
          {/* Custom Color Picker */}
          <div className="relative">
            <input
              type="color"
              value={toolPrefs.textColor}
              onChange={(e) => updateToolPref('textColor', e.target.value)}
              className="w-6 h-6 rounded border border-neutral-300 cursor-pointer"
              title="Custom color"
            />
            <PaintBucket className="w-3 h-3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-neutral-600" />
          </div>
      </div>



      {/* Background Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateToolPref('textBackgroundEnabled', !toolPrefs.textBackgroundEnabled)}
          className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary ${
            toolPrefs.textBackgroundEnabled 
              ? 'bg-brand-primary text-white' 
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
          aria-label="Toggle background"
          title="Text background"
        >
          <Square className="w-5 h-5" fill="currentColor" />
        </button>
        {toolPrefs.textBackgroundEnabled && (
          <input
            type="color"
            value={toolPrefs.textBackgroundColor}
            onChange={(e) => updateToolPref('textBackgroundColor', e.target.value)}
            className="w-6 h-6 rounded border border-neutral-300 cursor-pointer"
            title="Background color"
          />
        )}
      </div>

      {/* Border Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateToolPref('textBorderEnabled', !toolPrefs.textBorderEnabled)}
          className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary ${
            toolPrefs.textBorderEnabled 
              ? 'bg-brand-primary text-white' 
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
          aria-label="Toggle border"
          title="Text border"
        >
          <Square className="w-5 h-5" />
        </button>
        {toolPrefs.textBorderEnabled && (
          <>
            {/* Border Color Picker */}
            <input
              type="color"
              value={toolPrefs.textBorderColor}
              onChange={(e) => updateToolPref('textBorderColor', e.target.value)}
              className="w-6 h-6 rounded border border-neutral-300 cursor-pointer"
              title="Border color"
            />
            {/* Border Thickness Slider */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-neutral-600 whitespace-nowrap">{toolPrefs.textBorderThickness}px</span>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={toolPrefs.textBorderThickness}
                onChange={(e) => {
                  const thickness = Number(e.target.value)
                  // Snap to allowed values
                  const snappedThickness = BORDER_THICKNESSES.reduce((prev, curr) =>
                    Math.abs(curr - thickness) < Math.abs(prev - thickness) ? curr : prev
                  )
                  updateToolPref('textBorderThickness', snappedThickness)
                }}
                className="w-16 accent-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                title={`Border thickness: ${toolPrefs.textBorderThickness}px`}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}