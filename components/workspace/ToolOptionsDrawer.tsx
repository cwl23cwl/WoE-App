'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { 
  X, 
  Minus, 
  Plus, 
  Bold, 
  Italic, 
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ToggleLeft,
  ToggleRight,
  Type
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  useWorkspaceStore, 
  useDrawPrefs, 
  useHighlighterPrefs, 
  useTextPrefs, 
  useEraserPrefs 
} from '@/stores/useWorkspaceStore'
import { cn } from '@/lib/utils'
import { PEN_SWATCHES, HIGHLIGHTER_SWATCHES, TEXT_SWATCHES } from '@/lib/workspace-swatches'

interface ToolOptionsDrawerProps {
  className?: string
}

// Color Swatch Component
const ColorSwatch = ({ 
  color, 
  isActive, 
  onClick, 
  size = 'md' 
}: { 
  color: string
  isActive: boolean
  onClick: () => void
  size?: 'sm' | 'md' | 'lg'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        sizeClasses[size],
        isActive 
          ? "border-blue-600 shadow-lg scale-110" 
          : "border-gray-200 hover:border-gray-300 hover:scale-105"
      )}
      style={{ backgroundColor: color }}
      aria-label={`Select color ${color}`}
    />
  )
}

// Slider Component
const Slider = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  showValue = true,
  unit = 'px',
  className
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  showValue?: boolean
  unit?: string
  className?: string
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {showValue && (
          <span className="text-sm text-gray-500 min-w-[50px] text-right">
            {value}{unit}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          disabled={value <= min}
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          <Minus className="w-3 h-3" />
        </button>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
          aria-label={label}
        />
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          disabled={value >= max}
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

// Toggle Button Component
const ToggleButton = ({
  active,
  onClick,
  children,
  label,
  className
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  label: string
  className?: string
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-2 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "min-w-[36px] min-h-[36px] flex items-center justify-center",
        active 
          ? "bg-blue-600 text-white border-blue-600" 
          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50",
        className
      )}
      aria-label={label}
      aria-pressed={active}
      title={label}
    >
      {children}
    </button>
  )
}

export function ToolOptionsDrawer({ className }: ToolOptionsDrawerProps) {
  const { activeDrawer, setActiveDrawer, addRecentColor, recentColors } = useWorkspaceStore()
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close drawer on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setActiveDrawer(null)
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDrawer(null)
      }
    }

    if (activeDrawer) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [activeDrawer, setActiveDrawer])

  // Don't render if no active drawer
  if (!activeDrawer) return null

  const renderDrawerContent = () => {
    switch (activeDrawer) {
      case 'draw':
        return <DrawOptions />
      case 'highlighter':
        return <HighlighterOptions />
      case 'text':
        return <TextOptions />
      case 'erase':
        return <EraseOptions />
      case 'color':
        return <ColorOptions />
      case 'shapes':
        return <ShapeOptions />
      default:
        return null
    }
  }

  const getDrawerTitle = () => {
    switch (activeDrawer) {
      case 'draw':
        return 'Draw Options'
      case 'highlighter':
        return 'Highlighter Options'
      case 'text':
        return 'Text Options'
      case 'erase':
        return 'Eraser Options'
      case 'color':
        return 'Color Picker'
      case 'shapes':
        return 'Shape Options'
      default:
        return 'Tool Options'
    }
  }

  // Use portal to render as a secondary toolbar directly below the main toolbar
  return createPortal(
    <div className="fixed top-20 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-screen-xl mx-auto px-4 pointer-events-auto">
        <Card 
          ref={drawerRef}
          className={cn(
            "bg-white/95 backdrop-blur-sm border shadow-lg rounded-b-2xl rounded-t-none",
            "animate-in slide-in-from-top-2 duration-200",
            className
          )}
          role="dialog"
          aria-label={getDrawerTitle()}
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <span>{getDrawerTitle()}</span>
              </h3>
              <button
                onClick={() => setActiveDrawer(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                aria-label="Close options"
                title="Close options (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="border-t pt-4">
              {renderDrawerContent()}
            </div>
          </div>
        </Card>
      </div>
    </div>,
    document.body
  )
}

// Draw Options Component
function DrawOptions() {
  const { size, color, opacity, smoothness, updateSize, updateColor, updateOpacity, updateSmoothness } = useDrawPrefs()
  const { addRecentColor, recentColors } = useWorkspaceStore()

  const handleColorChange = (newColor: string) => {
    updateColor(newColor)
    addRecentColor(newColor)
  }

  return (
    <div className="flex items-center space-x-8">
      {/* Brush Size */}
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-700 min-w-[80px]">Brush Size</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => updateSize(Math.max(1, size - 1))}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            disabled={size <= 1}
            aria-label="Decrease brush size"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-sm font-mono w-6 text-center">{size}</span>
          <button
            onClick={() => updateSize(Math.min(24, size + 1))}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            disabled={size >= 24}
            aria-label="Increase brush size"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Color Swatches */}
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-700">Color</span>
        <div className="flex space-x-1">
          {PEN_SWATCHES.slice(0, 8).map((swatch) => (
            <ColorSwatch
              key={swatch.hex}
              color={swatch.hex}
              isActive={color === swatch.hex}
              onClick={() => handleColorChange(swatch.hex)}
              size="sm"
            />
          ))}
        </div>
        {/* Recent Colors */}
        {recentColors.length > 0 && (
          <>
            <div className="w-px h-6 bg-gray-300" />
            <div className="flex space-x-1">
              {recentColors.slice(0, 3).map((recentColor, index) => (
                <ColorSwatch
                  key={`${recentColor}-${index}`}
                  color={recentColor}
                  isActive={color === recentColor}
                  onClick={() => handleColorChange(recentColor)}
                  size="sm"
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Opacity */}
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-700 min-w-[60px]">Opacity</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => updateOpacity(Math.max(0.1, opacity - 0.1))}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            disabled={opacity <= 0.1}
            aria-label="Decrease opacity"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-sm font-mono w-8 text-center">{Math.round(opacity * 100)}%</span>
          <button
            onClick={() => updateOpacity(Math.min(1.0, opacity + 0.1))}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            disabled={opacity >= 1.0}
            aria-label="Increase opacity"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Smoothness Toggle */}
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-700">Smooth</span>
        <button
          onClick={() => updateSmoothness(!smoothness)}
          className={cn(
            "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            smoothness ? "bg-blue-600" : "bg-gray-200"
          )}
          aria-pressed={smoothness}
          aria-label="Toggle smoothness"
        >
          <span
            className={cn(
              "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
              smoothness ? "translate-x-5" : "translate-x-1"
            )}
          />
        </button>
      </div>
    </div>
  )
}

// Highlighter Options Component
function HighlighterOptions() {
  const { size, color, opacity, updateSize, updateColor, updateOpacity } = useHighlighterPrefs()
  const { addRecentColor, recentColors } = useWorkspaceStore()

  const handleColorChange = (newColor: string) => {
    updateColor(newColor)
    addRecentColor(newColor)
  }

  return (
    <div className="flex items-center space-x-8">
      {/* Thickness */}
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-700 min-w-[80px]">Thickness</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => updateSize(Math.max(4, size - 1))}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            disabled={size <= 4}
            aria-label="Decrease thickness"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-sm font-mono w-6 text-center">{size}</span>
          <button
            onClick={() => updateSize(Math.min(32, size + 1))}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            disabled={size >= 32}
            aria-label="Increase thickness"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Color Swatches */}
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-700">Color</span>
        <div className="flex space-x-1">
          {HIGHLIGHTER_SWATCHES.slice(0, 8).map((swatch) => (
            <ColorSwatch
              key={swatch.hex}
              color={swatch.hex}
              isActive={color === swatch.hex}
              onClick={() => handleColorChange(swatch.hex)}
              size="sm"
            />
          ))}
        </div>
      </div>

      {/* Blend Mode Info */}
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-500">
          <span className="font-medium">Multiply Blend</span> - marks over text
        </span>
      </div>
    </div>
  )
}

// Text Options Component
function TextOptions() {
  const { 
    size, color, family, bold, italic, underline, align,
    updateSize, updateColor, updateFamily, updateBold, updateItalic, updateUnderline, updateAlign 
  } = useTextPrefs()
  const { addRecentColor, recentColors } = useWorkspaceStore()

  const handleColorChange = (newColor: string) => {
    updateColor(newColor)
    addRecentColor(newColor)
  }

  const fontFamilies = [
    { label: 'System Default', value: 'system-ui, -apple-system, sans-serif' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Times', value: 'Times, serif' },
    { label: 'Courier', value: 'Courier, monospace' },
  ]

  return (
    <div className="space-y-6">
      {/* Font Size */}
      <Slider
        label="Font Size"
        value={size}
        min={8}
        max={72}
        onChange={updateSize}
      />

      {/* Font Family */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Font Family</label>
        <select
          value={family}
          onChange={(e) => updateFamily(e.target.value)}
          className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {fontFamilies.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      {/* Text Styling */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Style</label>
        <div className="flex space-x-2">
          <ToggleButton
            active={bold}
            onClick={() => updateBold(!bold)}
            label="Bold"
          >
            <Bold className="w-4 h-4" />
          </ToggleButton>
          
          <ToggleButton
            active={italic}
            onClick={() => updateItalic(!italic)}
            label="Italic"
          >
            <Italic className="w-4 h-4" />
          </ToggleButton>
          
          <ToggleButton
            active={underline}
            onClick={() => updateUnderline(!underline)}
            label="Underline"
          >
            <Underline className="w-4 h-4" />
          </ToggleButton>
        </div>
      </div>

      {/* Text Alignment */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Alignment</label>
        <div className="flex space-x-2">
          <ToggleButton
            active={align === 'left'}
            onClick={() => updateAlign('left')}
            label="Align left"
          >
            <AlignLeft className="w-4 h-4" />
          </ToggleButton>
          
          <ToggleButton
            active={align === 'center'}
            onClick={() => updateAlign('center')}
            label="Align center"
          >
            <AlignCenter className="w-4 h-4" />
          </ToggleButton>
          
          <ToggleButton
            active={align === 'right'}
            onClick={() => updateAlign('right')}
            label="Align right"
          >
            <AlignRight className="w-4 h-4" />
          </ToggleButton>
        </div>
      </div>

      {/* Text Color */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Text Color</label>
        <div className="grid grid-cols-8 gap-2">
          {TEXT_SWATCHES.slice(0, 16).map((swatch) => (
            <ColorSwatch
              key={swatch.hex}
              color={swatch.hex}
              isActive={color === swatch.hex}
              onClick={() => handleColorChange(swatch.hex)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Eraser Options Component
function EraseOptions() {
  const { size, mode, updateSize, updateMode } = useEraserPrefs()

  return (
    <div className="space-y-6">
      {/* Eraser Size */}
      <Slider
        label="Eraser Size"
        value={size}
        min={2}
        max={50}
        onChange={updateSize}
      />

      {/* Eraser Mode */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Erase Mode</label>
        <div className="flex space-x-2">
          <ToggleButton
            active={mode === 'stroke'}
            onClick={() => updateMode('stroke')}
            label="Erase strokes"
            className="flex-1"
          >
            <span className="text-sm">Stroke</span>
          </ToggleButton>
          
          <ToggleButton
            active={mode === 'object'}
            onClick={() => updateMode('object')}
            label="Erase objects"
            className="flex-1"
          >
            <span className="text-sm">Object</span>
          </ToggleButton>
        </div>
        <p className="text-xs text-gray-500">
          Stroke mode erases partial lines, Object mode erases entire elements
        </p>
      </div>
    </div>
  )
}

// Color Options Component (for standalone color picker)
function ColorOptions() {
  const { activeTool, toolPrefs, updateToolPref, addRecentColor, recentColors } = useWorkspaceStore()

  const getCurrentColor = () => {
    switch (activeTool) {
      case 'draw':
        return toolPrefs.drawColor
      case 'highlighter':
        return toolPrefs.highlighterColor
      case 'text':
        return toolPrefs.textColor
      default:
        return '#000000'
    }
  }

  const handleColorChange = (newColor: string) => {
    switch (activeTool) {
      case 'draw':
        updateToolPref('drawColor', newColor)
        break
      case 'highlighter':
        updateToolPref('highlighterColor', newColor)
        break
      case 'text':
        updateToolPref('textColor', newColor)
        break
    }
    addRecentColor(newColor)
  }

  const getSwatches = () => {
    switch (activeTool) {
      case 'highlighter':
        return HIGHLIGHTER_SWATCHES
      case 'text':
        return TEXT_SWATCHES
      default:
        return PEN_SWATCHES
    }
  }

  const currentColor = getCurrentColor()

  return (
    <div className="space-y-6">
      {/* Color Swatches */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Color Palette</label>
        <div className="grid grid-cols-8 gap-2">
          {getSwatches().map((swatch) => (
            <ColorSwatch
              key={swatch.hex}
              color={swatch.hex}
              isActive={currentColor === swatch.hex}
              onClick={() => handleColorChange(swatch.hex)}
            />
          ))}
        </div>
      </div>

      {/* Recent Colors */}
      {recentColors.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Recent Colors</label>
          <div className="flex space-x-2">
            {recentColors.map((recentColor, index) => (
              <ColorSwatch
                key={`${recentColor}-${index}`}
                color={recentColor}
                isActive={currentColor === recentColor}
                onClick={() => handleColorChange(recentColor)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Hex Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Custom Color</label>
        <div className="flex space-x-2">
          <input
            type="color"
            value={currentColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-12 h-10 border border-gray-200 rounded cursor-pointer"
          />
          <input
            type="text"
            value={currentColor.toUpperCase()}
            onChange={(e) => {
              const hex = e.target.value
              if (/^#[0-9A-F]{6}$/i.test(hex)) {
                handleColorChange(hex)
              }
            }}
            placeholder="#000000"
            className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>
      </div>
    </div>
  )
}

// Shape Options Component
function ShapeOptions() {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <Type className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Shape options coming soon...</p>
      </div>
    </div>
  )
}