// components/workspace/ToolDrawer.tsx - Dropdown drawer system for toolbar tools
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  Palette, 
  Sliders, 
  X,
  Pen,
  Type,
  Highlighter,
  Shapes
} from 'lucide-react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

// Brand colors based on your existing swatches
const BRAND_SWATCHES = [
  { name: 'Primary', color: '#EC5D3A' },
  { name: 'Primary 600', color: '#EB5733' },
  { name: 'Accent', color: '#FFD166' },
  { name: 'Teal', color: '#3AAFA9' },
  { name: 'Navy', color: '#1B2A49' },
  { name: 'Black', color: '#111827' }
]

interface ToolDrawerProps {
  isOpen: boolean
  onClose: () => void
  toolType: 'draw' | 'highlighter' | 'text' | 'shapes'
  anchorRef: React.RefObject<HTMLElement>
}

export function ToolDrawer({ isOpen, onClose, toolType, anchorRef }: ToolDrawerProps) {
  const [customColor, setCustomColor] = useState('#000000')
  const drawerRef = useRef<HTMLDivElement>(null)
  
  const { toolPrefs, updateToolPref } = useWorkspaceStore()

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, anchorRef])

  // Position drawer below the anchor element
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (isOpen && anchorRef.current && drawerRef.current) {
      const anchorRect = anchorRef.current.getBoundingClientRect()
      const drawerRect = drawerRef.current.getBoundingClientRect()
      
      // Position below the anchor, centered
      let left = anchorRect.left + (anchorRect.width / 2) - (drawerRect.width / 2)
      let top = anchorRect.bottom + 8

      // Keep drawer on screen
      const padding = 16
      if (left < padding) left = padding
      if (left + drawerRect.width > window.innerWidth - padding) {
        left = window.innerWidth - drawerRect.width - padding
      }

      setPosition({ top, left })
    }
  }, [isOpen, anchorRef])

  if (!isOpen) return null

  const getToolConfig = () => {
    switch (toolType) {
      case 'draw':
        return {
          title: 'Draw Settings',
          icon: Pen,
          color: toolPrefs.drawColor || '#000000',
          size: toolPrefs.drawSize || 4,
          colorKey: 'drawColor' as const,
          sizeKey: 'drawSize' as const,
          minSize: 1,
          maxSize: 20,
          sizeLabel: 'Pen Width'
        }
      case 'highlighter':
        return {
          title: 'Highlighter Settings',
          icon: Highlighter,
          color: toolPrefs.highlighterColor || '#FFF176',
          size: toolPrefs.highlighterSize || 12,
          colorKey: 'highlighterColor' as const,
          sizeKey: 'highlighterSize' as const,
          minSize: 8,
          maxSize: 30,
          sizeLabel: 'Highlighter Width'
        }
      case 'text':
        return {
          title: 'Text Settings',
          icon: Type,
          color: toolPrefs.textColor || '#111827',
          size: toolPrefs.textSize || 24,
          colorKey: 'textColor' as const,
          sizeKey: 'textSize' as const,
          minSize: 8,
          maxSize: 72,
          sizeLabel: 'Font Size'
        }
      case 'shapes':
        return {
          title: 'Shape Settings',
          icon: Shapes,
          color: toolPrefs.drawColor || '#000000',
          size: toolPrefs.drawSize || 2,
          colorKey: 'drawColor' as const,
          sizeKey: 'drawSize' as const,
          minSize: 1,
          maxSize: 10,
          sizeLabel: 'Stroke Width'
        }
    }
  }

  const config = getToolConfig()
  const IconComponent = config.icon

  const handleColorChange = (newColor: string) => {
    updateToolPref(config.colorKey, newColor)
  }

  const handleSizeChange = (newSize: number) => {
    updateToolPref(config.sizeKey, newSize)
  }

  const handleCustomColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value
    setCustomColor(newColor)
    handleColorChange(newColor)
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" />
      
      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed z-50 bg-white rounded-lg border border-gray-200 shadow-xl"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: '320px'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <IconComponent className="w-5 h-5 text-gray-600" strokeWidth={2} />
            <h3 className="font-semibold text-gray-800">{config.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Color Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Color</span>
            </div>
            
            {/* Brand Color Swatches */}
            <div className="grid grid-cols-6 gap-2 mb-4">
              {BRAND_SWATCHES.map((swatch) => {
                const isSelected = swatch.color === config.color
                return (
                  <button
                    key={swatch.color}
                    onClick={() => handleColorChange(swatch.color)}
                    className={`
                      w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 hover:shadow-md
                      ${isSelected 
                        ? 'border-blue-500 ring-2 ring-blue-200 scale-105' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                    style={{ backgroundColor: swatch.color }}
                    title={swatch.name}
                  />
                )
              })}
            </div>

            {/* Custom Color Picker */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-8 h-8 rounded-md border border-gray-300 cursor-pointer"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value)
                    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                      handleColorChange(e.target.value)
                    }
                  }}
                  placeholder="#000000"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <span className="text-xs text-gray-500">Custom</span>
            </div>
          </div>

          {/* Size/Width Control */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{config.sizeLabel}</span>
            </div>
            
            <div className="space-y-3">
              {/* Slider */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-6">{config.minSize}</span>
                <input
                  type="range"
                  min={config.minSize}
                  max={config.maxSize}
                  value={config.size}
                  onChange={(e) => handleSizeChange(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-gray-500 w-6">{config.maxSize}</span>
              </div>
              
              {/* Current value */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Current: {config.size}px</span>
                
                {/* Visual preview */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Preview:</span>
                  <div
                    className="rounded-full"
                    style={{
                      width: `${Math.max(config.size, 4)}px`,
                      height: `${Math.max(config.size, 4)}px`,
                      backgroundColor: config.color,
                      opacity: toolType === 'highlighter' ? 0.6 : 1
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tool-specific additional options */}
          {toolType === 'highlighter' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700">Opacity</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">10%</span>
                <input
                  type="range"
                  min={10}
                  max={80}
                  value={Math.round((toolPrefs.highlighterOpacity || 0.3) * 100)}
                  onChange={(e) => updateToolPref('highlighterOpacity', Number(e.target.value) / 100)}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-500">80%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom slider styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </>
  )
}