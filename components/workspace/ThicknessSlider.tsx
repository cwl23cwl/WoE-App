'use client'

import { useCallback } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThicknessSliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  color?: string
  label?: string
  className?: string
  tool?: 'pencil' | 'highlighter' | 'text'
}

export function ThicknessSlider({
  value,
  onChange,
  min = 1,
  max = 16,
  step = 1,
  color = '#000000',
  label,
  className,
  tool = 'pencil'
}: ThicknessSliderProps) {
  
  const handleDecrease = useCallback(() => {
    const newValue = Math.max(min, value - step)
    onChange(newValue)
  }, [value, min, step, onChange])

  const handleIncrease = useCallback(() => {
    const newValue = Math.min(max, value + step)
    onChange(newValue)
  }, [value, max, step, onChange])

  // Get visual size for preview circle
  const getPreviewSize = () => {
    const baseSize = tool === 'highlighter' ? value * 1.5 : value * 2
    return Math.max(8, Math.min(32, baseSize))
  }

  // Get opacity based on tool
  const getPreviewOpacity = () => {
    return tool === 'highlighter' ? 0.7 : 1
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="flex items-center bg-gray-50 rounded-xl border-2 border-gray-200 p-1 shadow-sm">
        {/* Decrease Button */}
        <button
          onClick={handleDecrease}
          disabled={value <= min}
          className={cn(
            "h-8 w-8 rounded-lg transition-all duration-200 flex items-center justify-center",
            value <= min
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-white hover:shadow-sm"
          )}
          title="Make thinner"
          aria-label="Decrease thickness"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Visual Preview */}
        <div className="flex items-center justify-center min-w-[40px] px-2">
          <div 
            className="transition-all duration-200 border border-gray-200"
            style={{
              width: `${getPreviewSize()}px`,
              height: `${getPreviewSize()}px`,
              backgroundColor: color,
              borderRadius: tool === 'pencil' ? '50%' : '20%',
              opacity: getPreviewOpacity()
            }}
            aria-label={`Current thickness: ${value}`}
          />
        </div>

        {/* Increase Button */}
        <button
          onClick={handleIncrease}
          disabled={value >= max}
          className={cn(
            "h-8 w-8 rounded-lg transition-all duration-200 flex items-center justify-center",
            value >= max
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-white hover:shadow-sm"
          )}
          title="Make thicker"
          aria-label="Increase thickness"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      {/* Label */}
      {label && (
        <span className="text-xs font-medium text-gray-600 mt-1 text-center">
          {label}
        </span>
      )}

      {/* Numeric Value */}
      <span className="text-xs text-gray-400 mt-0.5">
        {value}px
      </span>
    </div>
  )
}