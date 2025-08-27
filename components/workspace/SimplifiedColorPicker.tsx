'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  hexToHsv,
  hsvToHex
} from '@/lib/color-utils'

interface SimplifiedColorPickerProps {
  value: string
  onChange: (color: string) => void
  onClose?: () => void
  className?: string
}

export function SimplifiedColorPicker({
  value,
  onChange,
  onClose,
  className = ''
}: SimplifiedColorPickerProps) {
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

  // Draw kid-friendly, vibrant color wheel
  const drawColorWheel = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = canvas.width
    const center = size / 2
    const radius = center - 15

    // Clear the canvas
    ctx.clearRect(0, 0, size, size)

    // Kid-friendly vibrant colors - use high brightness and saturation for better visibility
    const brightnessForWheel = Math.max(85, hsv[2]) // Ensure minimum 85% brightness for vibrant colors
    
    // Draw larger, more visible color segments
    const segments = 72 // Fewer segments for clearer, more distinct colors
    for (let i = 0; i < segments; i++) {
      const angle = (i * 360) / segments
      const startAngle = ((angle - 2.5) * Math.PI) / 180 // Wider segments
      const endAngle = ((angle + 2.5) * Math.PI) / 180

      // Create gradient from center to edge for each segment
      const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius)
      
      // Center: Lighter, more pastel version (70% saturation)
      gradient.addColorStop(0, hsvToHex(angle, 70, brightnessForWheel))
      
      // Middle: Medium saturation (85% saturation)
      gradient.addColorStop(0.6, hsvToHex(angle, 85, brightnessForWheel))
      
      // Edge: Full vibrant color (100% saturation)
      gradient.addColorStop(1, hsvToHex(angle, 100, brightnessForWheel))

      // Draw pie slice with gradient
      ctx.beginPath()
      ctx.moveTo(center, center)
      ctx.arc(center, center, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()
      
      // Add subtle border between segments for better visibility
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Add a nice border around the whole wheel
    ctx.beginPath()
    ctx.arc(center, center, radius, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.lineWidth = 2
    ctx.stroke()
  }, [hsv])

  useEffect(() => {
    drawColorWheel()
  }, [drawColorWheel])

  const handleWheelClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const size = rect.width
    const center = size / 2
    const radius = center - 15 // Match the drawing radius
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
      
      // For kid-friendly use: more saturated colors by default
      // Map distance to saturation: center = 70% (pastel), edge = 100% (vibrant)
      const saturation = Math.min(100, 70 + ((distance / radius) * 30))
      
      // Keep brightness high for visibility
      const brightness = Math.max(85, hsv[2])
      
      const newHsv: [number, number, number] = [hue, saturation, brightness]
      setHsv(newHsv)
      const newColor = hsvToHex(...newHsv)
      setCurrentColor(newColor)
      onChange(newColor)
    }
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-2xl p-3 w-52 ${className}`}>
      {/* Color Wheel - Simplified, no header */}
      <div className="mb-3 relative flex justify-center">
        <canvas
          ref={canvasRef}
          width={180}
          height={180}
          className="w-[180px] h-[180px] rounded-full border border-gray-200 cursor-crosshair"
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
        
        {/* Kid-friendly color indicator - bigger and more visible */}
        {(() => {
          const size = 180
          const center = size / 2
          const radius = center - 15 // Match the drawing radius
          
          // Calculate position based on current HSV values
          const hueAngle = (hsv[0] - 90) * Math.PI / 180 // Adjust for red at top
          // Map saturation back from our kid-friendly range (70-100%) to position (0-100%)
          const saturationForPosition = Math.max(0, (hsv[1] - 70) / 30) * 100
          const saturationDistance = (saturationForPosition / 100) * radius
          
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
              {/* Bigger, more visible indicator for kids */}
              <div className="w-5 h-5 border-3 border-white rounded-full shadow-xl bg-white/20">
                <div className="w-full h-full border-2 border-gray-900 rounded-full" 
                     style={{ backgroundColor: currentColor }} />
              </div>
            </div>
          )
        })()}
      </div>

      {/* Kid-friendly brightness slider - bigger and more visible */}
      <div className="mb-3">
        <div className="relative">
          <input
            type="range"
            min="60"
            max="100"
            value={hsv[2]}
            onChange={(e) => {
              const brightness = parseInt(e.target.value)
              const newHsv: [number, number, number] = [hsv[0], hsv[1], brightness]
              setHsv(newHsv)
              const newColor = hsvToHex(...newHsv)
              setCurrentColor(newColor)
              onChange(newColor)
            }}
            className="w-full h-3 rounded-full appearance-none cursor-pointer border border-gray-300"
            style={{
              background: `linear-gradient(to right, 
                ${hsvToHex(hsv[0], hsv[1], 60)}, 
                ${hsvToHex(hsv[0], hsv[1], 100)})`
            }}
          />
        </div>
      </div>

      {/* Current Color Preview - Kid-friendly and bigger */}
      <div className="flex justify-center">
        <div 
          className="w-12 h-8 rounded-lg border-2 border-gray-400 shadow-md"
          style={{ backgroundColor: currentColor }}
          title="Selected color"
        />
      </div>
    </div>
  )
}