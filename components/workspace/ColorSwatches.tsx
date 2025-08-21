'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, Palette } from 'lucide-react'
import { useWorkspaceStore } from '@/stores/workspace'
import {
  PEN_SWATCHES,
  TEXT_SWATCHES,
  HIGHLIGHTER_SWATCHES,
  ColorSwatch,
  HIGHLIGHTER_CONFIG,
  hexToRgba
} from '@/lib/workspace-swatches'

interface ColorSwatchesProps {
  mode: 'pen' | 'text' | 'highlighter'
  className?: string
}

export function ColorSwatches({ mode, className = '' }: ColorSwatchesProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const {
    strokeColor,
    textColor,
    fillColor,
    tool,
    setStroke,
    setTextColor,
    setFill,
    setHighlighter,
  } = useWorkspaceStore()

  // Determine which swatches to show based on mode
  const getSwatches = (): ColorSwatch[] => {
    switch (mode) {
      case 'text': return TEXT_SWATCHES
      case 'highlighter': return HIGHLIGHTER_SWATCHES
      case 'pen':
      default: return PEN_SWATCHES
    }
  }

  // Get current color based on mode
  const getCurrentColor = (): string => {
    switch (mode) {
      case 'text': return textColor
      case 'highlighter': return strokeColor
      case 'pen':
      default: return strokeColor
    }
  }

  // Handle color selection
  const handleColorSelect = (hex: string) => {
    switch (mode) {
      case 'text':
        setTextColor(hex)
        break
      case 'highlighter':
        setHighlighter(hex)
        break
      case 'pen':
      default:
        setStroke(hex)
        break
    }
    setIsOpen(false)
  }

  const swatches = getSwatches()
  const currentColor = getCurrentColor()

  // Get display style for current color (with opacity for highlighter)
  const getCurrentColorStyle = () => {
    if (mode === 'highlighter') {
      return {
        backgroundColor: hexToRgba(currentColor, HIGHLIGHTER_CONFIG.opacity),
      }
    }
    return {
      backgroundColor: currentColor,
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Color Picker Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2"
        title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} color`}
      >
        <div
          className="w-4 h-4 rounded border border-gray-300"
          style={getCurrentColorStyle()}
        />
        <span className="text-xs font-medium capitalize">
          {mode}
        </span>
        <ChevronDown
          className={`w-3 h-3 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </Button>

      {/* Color Picker Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[280px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700 flex items-center">
              <Palette className="w-4 h-4 mr-2" />
              {mode.charAt(0).toUpperCase() + mode.slice(1)} Colors
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              ×
            </Button>
          </div>

          {/* Color Grid */}
          <div className="grid grid-cols-7 gap-2">
            {swatches.map((swatch, index) => {
              const isSelected = swatch.hex === currentColor
              const displayStyle = mode === 'highlighter' 
                ? { backgroundColor: hexToRgba(swatch.hex, HIGHLIGHTER_CONFIG.opacity) }
                : { backgroundColor: swatch.hex }
              
              return (
                <button
                  key={`${swatch.hex}-${index}`}
                  onClick={() => handleColorSelect(swatch.hex)}
                  className={`
                    w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 hover:shadow-md
                    ${isSelected 
                      ? 'border-blue-500 ring-2 ring-blue-200 scale-105' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                  style={displayStyle}
                  title={swatch.name}
                  aria-label={`Select ${swatch.name} color`}
                />
              )
            })}
          </div>

          {/* Current Color Info */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Current: {currentColor}</span>
              {mode === 'highlighter' && (
                <span>Opacity: {Math.round(HIGHLIGHTER_CONFIG.opacity * 100)}%</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
