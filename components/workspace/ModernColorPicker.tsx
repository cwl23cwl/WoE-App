'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Palette, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  PEN_SWATCHES, 
  HIGHLIGHTER_SWATCHES, 
  TEXT_SWATCHES,
  type ColorSwatch
} from '@/lib/workspace-swatches'

interface ModernColorPickerProps {
  value: string
  onChange: (color: string) => void
  mode: 'pen' | 'text' | 'highlighter'
  label?: string
  className?: string
  isESL?: boolean
}

export function ModernColorPicker({
  value,
  onChange,
  mode,
  label = 'Color',
  className,
  isESL = true
}: ModernColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Get appropriate swatches based on mode
  const getSwatches = useCallback((): ColorSwatch[] => {
    switch (mode) {
      case 'text':
        return TEXT_SWATCHES.slice(0, isESL ? 6 : 12) // Fewer colors for ESL
      case 'highlighter':
        return HIGHLIGHTER_SWATCHES.slice(0, isESL ? 6 : 12)
      default:
        return PEN_SWATCHES.slice(0, isESL ? 8 : 16)
    }
  }, [mode, isESL])

  const swatches = getSwatches()

  const handleColorSelect = useCallback((color: string) => {
    onChange(color)
    setIsOpen(false)
  }, [onChange])

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Get the selected swatch info
  const selectedSwatch = swatches.find(swatch => swatch.hex.toLowerCase() === value.toLowerCase())

  return (
    <div ref={containerRef} className={cn("relative flex flex-col items-center", className)}>
      {/* Color Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-12 w-12 rounded-xl border-2 border-gray-200 shadow-sm transition-all duration-200 relative overflow-hidden",
          "hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20",
          isOpen && "ring-2 ring-primary/40 scale-105"
        )}
        style={{ backgroundColor: value }}
        title={`${label} - ${selectedSwatch?.name || 'Custom color'}`}
        aria-label={`Choose ${label.toLowerCase()}, current: ${selectedSwatch?.name || 'custom color'}`}
        aria-expanded={isOpen}
      >
        {/* Palette icon overlay with good contrast */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Palette className="w-4 h-4 text-white drop-shadow-md" />
        </div>
      </button>
      
      {/* Label */}
      <span className="text-xs font-medium text-gray-600 mt-1 text-center">
        {label}
      </span>

      {/* Color Picker Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 z-50 animate-in slide-in-from-top-2 duration-200">
          <Card className="shadow-xl border-2 min-w-[240px]">
            <CardContent className="p-4">
              {/* ESL-friendly header */}
              <div className="text-sm font-medium text-gray-700 mb-3 text-center">
                Choose {mode === 'pen' ? 'Drawing' : mode === 'highlighter' ? 'Highlight' : 'Text'} Color
              </div>
              
              {/* Color Grid */}
              <div className={cn(
                "grid gap-3",
                isESL ? "grid-cols-3" : "grid-cols-4" // Simpler grid for ESL
              )}>
                {swatches.map((swatch) => {
                  const isSelected = swatch.hex.toLowerCase() === value.toLowerCase()
                  
                  return (
                    <button
                      key={swatch.hex}
                      onClick={() => handleColorSelect(swatch.hex)}
                      className={cn(
                        "relative w-12 h-12 rounded-xl border-2 transition-all duration-200",
                        "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/40",
                        isSelected 
                          ? "border-primary shadow-md scale-105" 
                          : "border-gray-200 hover:border-gray-400 shadow-sm hover:shadow-md"
                      )}
                      style={{ backgroundColor: swatch.hex }}
                      title={swatch.name}
                      aria-label={`Select ${swatch.name}`}
                    >
                      {/* Checkmark for selected color */}
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow-md" />
                        </div>
                      )}
                      
                      {/* ESL-friendly color name tooltip */}
                      {isESL && (
                        <span className="sr-only">{swatch.name}</span>
                      )}
                    </button>
                  )
                })}
              </div>
              
              {/* ESL-friendly color name display */}
              {isESL && selectedSwatch && (
                <div className="text-xs text-center text-gray-500 mt-3 p-2 bg-gray-50 rounded-lg">
                  Current: <span className="font-medium">{selectedSwatch.name}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}