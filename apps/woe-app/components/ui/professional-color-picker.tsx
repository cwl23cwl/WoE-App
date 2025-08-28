'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Palette } from 'lucide-react'
import {
  hexToHsv,
  hsvToHex
} from '@/lib/color-utils'

interface ProfessionalColorPickerProps {
  value: string
  onChange: (color: string) => void
  onClose?: () => void
  className?: string
  recentColors?: string[]
  onAddRecentColor?: (color: string) => void
}

export function ProfessionalColorPicker({
  value,
  onChange,
  onClose,
  className = '',
  recentColors = [],
  onAddRecentColor
}: ProfessionalColorPickerProps) {
  const [currentColor, setCurrentColor] = useState(value)
  const [hsv, setHsv] = useState<[number, number, number]>(() => hexToHsv(value))
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDraggingRef = useRef(false)

  // Update HSV when value prop changes
  useEffect(() => {
    if (value !== currentColor) {
      setCurrentColor(value)
      setHsv(hexToHsv(value))
    }
  }, [value, currentColor])

  // Draw simplified color wheel - single disc with hue+saturation
  const drawColorWheel = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = canvas.width
    const center = size / 2
    const radius = center - 10

    // Clear the canvas
    ctx.clearRect(0, 0, size, size)

    // Draw color wheel using conic gradient for hues and radial gradient for saturation
    // Create a temporary canvas for better performance
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = size
    tempCanvas.height = size
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return

    // Draw hue wheel with segments for better performance
    const segments = 360 // One segment per degree
    for (let i = 0; i < segments; i++) {
      const angle = (i * 360) / segments
      const startAngle = ((angle - 0.5) * Math.PI) / 180
      const endAngle = ((angle + 0.5) * Math.PI) / 180

      // Draw pie slice
      tempCtx.beginPath()
      tempCtx.moveTo(center, center)
      tempCtx.arc(center, center, radius, startAngle, endAngle)
      tempCtx.closePath()
      
      // Fill with pure hue color at current brightness
      tempCtx.fillStyle = hsvToHex(angle, 100, hsv[2])
      tempCtx.fill()
    }

    // Apply radial saturation gradient (white in center, transparent at edge)
    const saturationGradient = tempCtx.createRadialGradient(center, center, 0, center, center, radius)
    saturationGradient.addColorStop(0, 'rgba(255, 255, 255, 1)') // White center (no saturation)
    saturationGradient.addColorStop(1, 'rgba(255, 255, 255, 0)') // Transparent edge (full saturation)

    tempCtx.globalCompositeOperation = 'source-atop'
    tempCtx.beginPath()
    tempCtx.arc(center, center, radius, 0, Math.PI * 2)
    tempCtx.fillStyle = saturationGradient
    tempCtx.fill()

    // Copy to main canvas
    ctx.drawImage(tempCanvas, 0, 0)
  }, [hsv])

  // No separate hue bar needed - it's part of the wheel
  const drawHueBar = useCallback(() => {
    // Empty - hue is now part of the main wheel
  }, [])

  useEffect(() => {
    drawColorWheel()
  }, [drawColorWheel])

  const handleWheelClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const size = rect.width
    const center = size / 2
    const radius = center - 10
    const x = event.clientX - rect.left - center
    const y = event.clientY - rect.top - center
    
    const distance = Math.sqrt(x * x + y * y)

    // Only respond to clicks within the circle
    if (distance <= radius) {
      // Calculate hue from angle
      let hue = Math.atan2(y, x) * 180 / Math.PI
      if (hue < 0) hue += 360
      // Adjust to start red at top
      hue = (hue + 90) % 360
      
      // Calculate saturation from distance (center = 0%, edge = 100%)
      const saturation = Math.min(100, (distance / radius) * 100)
      
      // Preserve current brightness level
      const brightness = hsv[2]
      
      const newHsv: [number, number, number] = [hue, saturation, brightness]
      setHsv(newHsv)
      const newColor = hsvToHex(...newHsv)
      setCurrentColor(newColor)
      onChange(newColor)
      onAddRecentColor?.(newColor)
    }
  }



  return (
    <div className={`bg-white rounded-xl border border-neutral-200 shadow-xl p-4 w-64 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-brand-primary" strokeWidth={2} />
          <h3 className="font-medium text-neutral-800 text-sm">Colors</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
            title="Close"
          >
            ×
          </button>
        )}
      </div>

      {/* Color Wheel */}
      <div className="mb-4 relative flex justify-center">
        <canvas
          ref={canvasRef}
          width={220}
          height={220}
          className="w-[220px] h-[220px] rounded-full border border-neutral-200 cursor-crosshair"
          onClick={handleWheelClick}
          onMouseMove={(e) => {
            if (isDraggingRef.current) {
              handleWheelClick(e)
            }
          }}
          onMouseDown={() => { isDraggingRef.current = true }}
          onMouseUp={() => { isDraggingRef.current = false }}
          onMouseLeave={() => { isDraggingRef.current = false }}
        />
        
        {/* Color wheel indicator */}
        {(() => {
          const size = 220
          const center = size / 2
          const radius = center - 10
          
          // Calculate position based on current HSV values
          const hueAngle = (hsv[0] - 90) * Math.PI / 180 // Adjust for red at top
          const saturationDistance = (hsv[1] / 100) * radius
          
          const indicatorX = center + Math.cos(hueAngle) * saturationDistance
          const indicatorY = center + Math.sin(hueAngle) * saturationDistance
          
          return (
            <div 
              className="absolute pointer-events-none"
              style={{ 
                left: `${indicatorX}px`,
                top: `${indicatorY}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="w-4 h-4 border-2 border-white rounded-full shadow-lg">
                <div className="w-full h-full border border-neutral-800/50 rounded-full" />
              </div>
            </div>
          )
        })()}
      </div>

      {/* Brightness Slider */}
      <div className="mb-4">
        <label className="text-xs font-medium text-neutral-600 mb-2 block">Brightness</label>
        <div className="relative">
          <input
            type="range"
            min="5"
            max="100"
            value={hsv[2]}
            onChange={(e) => {
              const brightness = parseInt(e.target.value)
              const newHsv: [number, number, number] = [hsv[0], hsv[1], brightness]
              setHsv(newHsv)
              const newColor = hsvToHex(...newHsv)
              setCurrentColor(newColor)
              onChange(newColor)
              onAddRecentColor?.(newColor)
            }}
            className="w-full h-3 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, 
                ${hsvToHex(hsv[0], hsv[1], 5)}, 
                ${hsvToHex(hsv[0], hsv[1], 100)})`
            }}
          />
          <div className="flex justify-between text-xs text-neutral-500 mt-1">
            <span>Dark</span>
            <span>{hsv[2]}%</span>
            <span>Bright</span>
          </div>
        </div>
      </div>

    </div>
  )
}