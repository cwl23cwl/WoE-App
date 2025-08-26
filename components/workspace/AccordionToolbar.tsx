// components/workspace/AccordionToolbar.tsx - Clean & Fixed
'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

// Brand color swatches
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
  { name: 'Purple', hex: '#9333EA' }
]

interface AccordionToolbarProps {
  toolType: 'draw' | 'highlighter' | 'text' | 'shapes'
  isExpanded: boolean
  className?: string
}

export function AccordionToolbar({ toolType, isExpanded, className = '' }: AccordionToolbarProps) {
  // Get API and store functions directly from the store
  const { toolPrefs, updateToolPref, excalidrawAPI, activeTool } = useWorkspaceStore()

  // Debug API availability
  useEffect(() => {
    console.log('🔍 AccordionToolbar: API status:', {
      hasAPI: !!excalidrawAPI,
      toolType,
      isExpanded,
      activeTool,
      toolPrefs: {
        drawColor: toolPrefs?.drawColor,
        drawSize: toolPrefs?.drawSize,
        highlighterColor: toolPrefs?.highlighterColor,
        highlighterSize: toolPrefs?.highlighterSize
      }
    })
  }, [excalidrawAPI, toolType, isExpanded, activeTool, toolPrefs])

  // Get current tool preferences with proper typing
  const getCurrentPrefs = () => {
    switch (toolType) {
      case 'draw':
        return {
          color: toolPrefs?.drawColor || '#111827',
          size: toolPrefs?.drawSize || 4,
          colorKey: 'drawColor' as keyof typeof toolPrefs,
          sizeKey: 'drawSize' as keyof typeof toolPrefs,
          minSize: 1,
          maxSize: 20
        }
      case 'highlighter':
        return {
          color: toolPrefs?.highlighterColor || '#FFF176',
          size: toolPrefs?.highlighterSize || 12,
          colorKey: 'highlighterColor' as keyof typeof toolPrefs,
          sizeKey: 'highlighterSize' as keyof typeof toolPrefs,
          minSize: 6,
          maxSize: 30
        }
      case 'text':
        return {
          color: toolPrefs?.textColor || '#111827',
          size: toolPrefs?.textSize || 24,
          colorKey: 'textColor' as keyof typeof toolPrefs,
          sizeKey: 'textSize' as keyof typeof toolPrefs,
          minSize: 8,
          maxSize: 72
        }
      default:
        return {
          color: '#111827',
          size: 4,
          colorKey: 'drawColor' as keyof typeof toolPrefs,
          sizeKey: 'drawSize' as keyof typeof toolPrefs,
          minSize: 1,
          maxSize: 20
        }
    }
  }

  const prefs = getCurrentPrefs()

  // Handle color selection with immediate Excalidraw update
  const handleColorChange = useCallback((newColor: string) => {
    console.log(`🎨 Changing ${toolType} color to:`, newColor)
    
    // Update store first
    if (updateToolPref) {
      try {
        updateToolPref(prefs.colorKey, newColor)
        console.log(`✅ Updated store with ${prefs.colorKey} = ${newColor}`)
      } catch (error) {
        console.error(`❌ Failed to update store:`, error)
        return // Don't proceed if store update failed
      }
    } else {
      console.error(`❌ updateToolPref function is not available`)
      return
    }
    
    // Update Excalidraw immediately if API is available
    if (excalidrawAPI) {
      try {
        const updatePayload: any = { 
          currentItemStrokeColor: newColor,
          currentItemStrokeStyle: 'solid' // Always use solid lines
        }
        
        // For highlighter, also set opacity
        if (toolType === 'highlighter') {
          updatePayload.currentItemOpacity = Math.round((toolPrefs?.highlighterOpacity || 0.3) * 100)
        }
        
        console.log(`🎯 Updating Excalidraw with:`, updatePayload)
        
        excalidrawAPI.updateScene({
          appState: updatePayload
        })
        
        console.log(`✅ Updated Excalidraw ${toolType} color successfully`)
      } catch (error) {
        console.error('❌ Failed to update Excalidraw color:', error)
      }
    } else {
      console.warn(`⚠️ excalidrawAPI is not available - color will apply on next tool selection`)
    }
  }, [toolType, prefs.colorKey, updateToolPref, excalidrawAPI, toolPrefs])

  // Handle size change with immediate Excalidraw update
  const handleSizeChange = useCallback((newSize: number) => {
    console.log(`📏 Changing ${toolType} size to:`, newSize)
    
    // Update store first
    if (updateToolPref) {
      try {
        updateToolPref(prefs.sizeKey, newSize)
        console.log(`✅ Updated store with ${prefs.sizeKey} = ${newSize}`)
      } catch (error) {
        console.error(`❌ Failed to update store:`, error)
        return
      }
    } else {
      console.error(`❌ updateToolPref function is not available`)
      return
    }
    
    // Update Excalidraw immediately if API is available
    if (excalidrawAPI) {
      try {
        excalidrawAPI.updateScene({
          appState: { 
            currentItemStrokeWidth: newSize,
            currentItemStrokeStyle: 'solid' // Always use solid lines
          }
        })
        
        console.log(`✅ Updated Excalidraw ${toolType} size successfully`)
      } catch (error) {
        console.error('❌ Failed to update Excalidraw size:', error)
      }
    } else {
      console.warn(`⚠️ excalidrawAPI is not available - size will apply on next tool selection`)
    }
  }, [toolType, prefs.sizeKey, updateToolPref, excalidrawAPI])

  if (!isExpanded) return null

  return (
    <div className={`accordion-toolbar ${className}`}>
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          
          {/* Draw Tool Content */}
          {toolType === 'draw' && (
            <div className="flex items-center justify-center gap-16">
              
              {/* Color Swatches - Fixed Width */}
              <div className="flex items-center gap-3" style={{ width: '460px' }}>
                {DRAW_COLORS.map((color) => {
                  const isSelected = color.hex === prefs.color
                  return (
                    <button
                      key={color.hex}
                      onClick={() => handleColorChange(color.hex)}
                      className={`
                        w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg
                        ${isSelected 
                          ? 'border-blue-500 ring-2 ring-blue-200 scale-105 shadow-md' 
                          : 'border-gray-300 hover:border-gray-400'
                        }
                      `}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  )
                })}
              </div>

              {/* Elegant Divider */}
              <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />

              {/* Size Control with Preview - Fixed Width Container */}
              <div className="flex items-center gap-4" style={{ width: '240px' }}>
                {/* Slider Container */}
                <div className="flex items-center gap-3" style={{ width: '140px' }}>
                  {/* Min value */}
                  <span className="text-xs text-gray-400 w-4 text-center">{prefs.minSize}</span>
                  
                  {/* Slider with dynamic thumb value */}
                  <div className="relative flex-1">
                    <input
                      type="range"
                      min={prefs.minSize}
                      max={prefs.maxSize}
                      value={prefs.size}
                      onChange={(e) => handleSizeChange(Number(e.target.value))}
                      className="w-full h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full appearance-none cursor-pointer slider-premium-dynamic focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                      style={{
                        '--thumb-value': `"${prefs.size}"`,
                      } as React.CSSProperties}
                    />
                  </div>
                  
                  {/* Max value */}
                  <span className="text-xs text-gray-400 w-4 text-center">{prefs.maxSize}</span>
                </div>
                
                {/* Preview Container - Fixed Size, Aligned with Slider Center */}
                <div className="flex items-center justify-center" style={{ width: '80px', height: '20px' }}>
                  <div
                    className="rounded-full bg-current transition-all duration-200 shadow-sm"
                    style={{
                      width: `${Math.max(prefs.size * 1.5, 6)}px`,
                      height: `${Math.max(prefs.size * 1.5, 6)}px`,
                      color: prefs.color,
                      maxWidth: '30px',
                      maxHeight: '30px'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Highlighter Tool Content */}
          {toolType === 'highlighter' && (
            <div className="flex items-center justify-center gap-16">
              
              {/* Color Swatches - Fixed Width */}
              <div className="flex items-center gap-3" style={{ width: '276px' }}>
                {[
                  { name: 'Yellow', hex: '#FFF176' },
                  { name: 'Green', hex: '#C8E6C9' },
                  { name: 'Blue', hex: '#BBDEFB' },
                  { name: 'Pink', hex: '#F8BBD9' },
                  { name: 'Orange', hex: '#FFE0B2' },
                  { name: 'Purple', hex: '#E1BEE7' }
                ].map((color) => {
                  const isSelected = color.hex === prefs.color
                  return (
                    <button
                      key={color.hex}
                      onClick={() => handleColorChange(color.hex)}
                      className={`
                        w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg
                        ${isSelected 
                          ? 'border-blue-500 ring-2 ring-blue-200 scale-105 shadow-md' 
                          : 'border-gray-300 hover:border-gray-400'
                        }
                      `}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  )
                })}
              </div>

              {/* Elegant Divider */}
              <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />

              {/* Size Control with Preview - Fixed Width Container */}
              <div className="flex items-center gap-4" style={{ width: '240px' }}>
                <div className="flex items-center gap-3" style={{ width: '140px' }}>
                  <span className="text-xs text-gray-400 w-4 text-center">{prefs.minSize}</span>
                  <div className="relative flex-1">
                    <input
                      type="range"
                      min={prefs.minSize}
                      max={prefs.maxSize}
                      value={prefs.size}
                      onChange={(e) => handleSizeChange(Number(e.target.value))}
                      className="w-full h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full appearance-none cursor-pointer slider-premium-dynamic focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                      style={{
                        '--thumb-value': `"${prefs.size}"`,
                      } as React.CSSProperties}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-4 text-center">{prefs.maxSize}</span>
                </div>
                
                {/* Preview Container - Fixed Size, Aligned with Slider Center */}
                <div className="flex items-center justify-center" style={{ width: '80px', height: '20px' }}>
                  <div
                    className="rounded-sm bg-current transition-all duration-200 shadow-sm opacity-60"
                    style={{
                      width: `${Math.max(prefs.size * 1.2, 8)}px`,
                      height: `${Math.max(prefs.size * 0.8, 4)}px`,
                      color: prefs.color,
                      maxWidth: '36px',
                      maxHeight: '20px'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Text Tool Content */}
          {toolType === 'text' && (
            <div className="flex items-center justify-center gap-16">
              
              {/* Color Swatches - Fixed Width */}
              <div className="flex items-center gap-3" style={{ width: '460px' }}>
                {DRAW_COLORS.map((color) => {
                  const isSelected = color.hex === prefs.color
                  return (
                    <button
                      key={color.hex}
                      onClick={() => handleColorChange(color.hex)}
                      className={`
                        w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg
                        ${isSelected 
                          ? 'border-blue-500 ring-2 ring-blue-200 scale-105 shadow-md' 
                          : 'border-gray-300 hover:border-gray-400'
                        }
                      `}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  )
                })}
              </div>

              {/* Elegant Divider */}
              <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />

              {/* Size Control with Preview - Fixed Width Container */}
              <div className="flex items-center gap-4" style={{ width: '240px' }}>
                <div className="flex items-center gap-3" style={{ width: '140px' }}>
                  <span className="text-xs text-gray-400 w-4 text-center">{prefs.minSize}</span>
                  <div className="relative flex-1">
                    <input
                      type="range"
                      min={prefs.minSize}
                      max={prefs.maxSize}
                      value={prefs.size}
                      onChange={(e) => handleSizeChange(Number(e.target.value))}
                      className="w-full h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full appearance-none cursor-pointer slider-premium-dynamic focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                      style={{
                        '--thumb-value': `"${prefs.size}"`,
                      } as React.CSSProperties}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-4 text-center">{prefs.maxSize}</span>
                </div>
                
                {/* Text Preview Container - Fixed Size, Aligned with Slider Center */}
                <div className="flex items-center justify-center" style={{ width: '80px', height: '20px' }}>
                  <div
                    className="font-medium transition-all duration-200 select-none"
                    style={{
                      fontSize: `${Math.min(Math.max(prefs.size * 0.6, 12), 24)}px`,
                      color: prefs.color,
                      lineHeight: '1'
                    }}
                  >
                    Aa
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shapes Tool Content */}
          {toolType === 'shapes' && (
            <div className="flex items-center justify-center gap-16">
              
              {/* Color Swatches - Fixed Width */}
              <div className="flex items-center gap-3" style={{ width: '460px' }}>
                {DRAW_COLORS.map((color) => {
                  const isSelected = color.hex === prefs.color
                  return (
                    <button
                      key={color.hex}
                      onClick={() => handleColorChange(color.hex)}
                      className={`
                        w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg
                        ${isSelected 
                          ? 'border-blue-500 ring-2 ring-blue-200 scale-105 shadow-md' 
                          : 'border-gray-300 hover:border-gray-400'
                        }
                      `}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  )
                })}
              </div>

              {/* Elegant Divider */}
              <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />

              {/* Size Control with Preview - Fixed Width Container */}
              <div className="flex items-center gap-4" style={{ width: '240px' }}>
                <div className="flex items-center gap-3" style={{ width: '140px' }}>
                  <span className="text-xs text-gray-400 w-4 text-center">{prefs.minSize}</span>
                  <div className="relative flex-1">
                    <input
                      type="range"
                      min={prefs.minSize}
                      max={prefs.maxSize}
                      value={prefs.size}
                      onChange={(e) => handleSizeChange(Number(e.target.value))}
                      className="w-full h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full appearance-none cursor-pointer slider-premium-dynamic focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                      style={{
                        '--thumb-value': `"${prefs.size}"`,
                      } as React.CSSProperties}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-4 text-center">{prefs.maxSize}</span>
                </div>
                
                {/* Shape Preview Container - Fixed Size, Aligned with Slider Center */}
                <div className="flex items-center justify-center" style={{ width: '80px', height: '20px' }}>
                  <div
                    className="border-2 transition-all duration-200"
                    style={{
                      width: `${Math.max(prefs.size * 1.5, 8)}px`,
                      height: `${Math.max(prefs.size * 1.5, 8)}px`,
                      borderColor: prefs.color,
                      backgroundColor: 'transparent',
                      maxWidth: '24px',
                      maxHeight: '24px'
                    }}
                  />
                </div>
              </div>
            </div>
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
          content: var(--thumb-value);
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

        .slider-premium-dynamic::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.9);
          border-color: #1d4ed8;
        }

        .slider-premium-dynamic::-webkit-slider-thumb:active {
          transform: scale(0.95);
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.5), 0 0 0 3px rgba(59, 130, 246, 0.2);
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

        .slider-premium-dynamic::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
        }

        .slider-premium-dynamic:focus::-webkit-slider-thumb {
          border-color: #1d4ed8;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4), 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        /* For Firefox - alternative approach using data attribute */
        .slider-premium-dynamic::-moz-range-thumb::before {
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
      `}</style>
    </div>
  )
}