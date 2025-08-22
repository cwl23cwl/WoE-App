import React, { useState, useRef, useEffect } from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  Palette,
  Square,
  Minus,
  Plus,
  SlashIcon,
  Check
} from 'lucide-react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { FontPicker } from '@/components/ui/font-picker'
import { FloatingMenu } from '@/components/ui/floating-menu'
import { Popout } from '@/components/ui/popout'

export function TextDrawerContent() {
  const { 
    textDefaults, 
    updateTextDefaults,
    excalidrawAPI,
    applyTextStyleToSelection,
    recentColors,
    addRecentColor,
    activeTool,
    openDrawer
  } = useWorkspaceStore()

  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showBackgroundPopout, setShowBackgroundPopout] = useState(false)
  const [showBorderPopout, setShowBorderPopout] = useState(false)
  const [showBackgroundColorWheel, setShowBackgroundColorWheel] = useState(false)
  const [showBorderColorWheel, setShowBorderColorWheel] = useState(false)
  
  const colorPickerButtonRef = useRef<HTMLButtonElement>(null)
  const backgroundIconRef = useRef<HTMLButtonElement>(null)
  const borderIconRef = useRef<HTMLButtonElement>(null)
  const backgroundColorWheelRef = useRef<HTMLButtonElement>(null)
  const borderColorWheelRef = useRef<HTMLButtonElement>(null)

  // Close all popouts on tool change or drawer close
  useEffect(() => {
    if (activeTool !== 'text' || openDrawer !== 'text') {
      setShowColorPicker(false)
      setShowBackgroundPopout(false)
      setShowBorderPopout(false)
      setShowBackgroundColorWheel(false)
      setShowBorderColorWheel(false)
    }
  }, [activeTool, openDrawer])

  // One-at-a-time rule for popouts
  const closeAllPopouts = () => {
    setShowColorPicker(false)
    setShowBackgroundPopout(false)
    setShowBorderPopout(false)
    setShowBackgroundColorWheel(false)
    setShowBorderColorWheel(false)
  }

  // Coerce existing text elements to 1pt border thickness when drawer opens
  useEffect(() => {
    if (openDrawer === 'text' && excalidrawAPI) {
      try {
        const elements = excalidrawAPI.getSceneElements()
        const textElementsWithBorders = elements.filter((el: any) => 
          el.type === 'text' && el.strokeWidth && el.strokeWidth !== 1
        )
        
        if (textElementsWithBorders.length > 0) {
          const updatedElements = elements.map((el: any) => {
            if (el.type === 'text' && el.strokeWidth && el.strokeWidth !== 1) {
              return { ...el, strokeWidth: 1 }
            }
            return el
          })
          
          excalidrawAPI.updateScene({ 
            elements: updatedElements,
            commitToHistory: false // Don't add coercion to history
          })
          
          console.log(`🔧 Coerced ${textElementsWithBorders.length} text elements to 1pt border thickness`)
        }
      } catch (error) {
        console.error('Error coercing border thickness:', error)
      }
    }
  }, [openDrawer, excalidrawAPI])

  // Escape key handler for color picker
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showColorPicker) {
        setShowColorPicker(false)
        colorPickerButtonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showColorPicker])

  const handleStyleChange = (patch: Partial<typeof textDefaults>) => {
    // Always enforce 1pt border thickness when border settings change
    if (patch.borderOn !== undefined || patch.borderColor !== undefined) {
      patch = { ...patch, borderThickness: 1 }
    }
    
    updateTextDefaults(patch)
    applyTextStyleToSelection(patch, excalidrawAPI)
    
    // Add color to recent colors if it's a custom color (not in presets)
    if (patch.textColor && !colorPresets.includes(patch.textColor)) {
      addRecentColor(patch.textColor)
    }
  }


  // Brand color presets as specified
  const colorPresets = [
    '#000000', // Black
    '#EC5D3A', // Primary (brand)
    '#2563EB', // Blue
    '#16A34A', // Green
    '#FFD166', // Accent (brand)
    '#8B5CF6', // Purple
    '#3AAFA9', // Secondary Teal (brand)
    '#1B2A49', // Navy/Foreground (brand)
  ]

  const backgroundColors = ['#000000', '#ffffff']
  const borderColors = ['#000000', '#EC5D3A', '#8B5CF6']

  return (
    <div className="w-full h-full flex items-center justify-center px-4">
      {/* Three-Zone Grid: Font | Colors | Background/Border */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 w-full max-w-5xl">
        
        {/* LEFT ZONE - Font Controls */}
        <div className="flex items-center gap-3 justify-self-end">
          <FontPicker
            value={textDefaults.fontFamily}
            onChange={(fontFamily) => handleStyleChange({ fontFamily })}
          />

          {/* Font Size Stepper */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleStyleChange({ fontSize: Math.max(8, textDefaults.fontSize - 2) })}
              className="p-2 rounded-md hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-support-teal text-neutral-600 hover:text-neutral-700"
              title="Decrease font size"
            >
              <Minus className="w-4 h-4" strokeWidth={2.5} />
            </button>
            <span className="text-sm font-medium text-neutral-700 w-8 text-center">
              {textDefaults.fontSize}
            </span>
            <button
              onClick={() => handleStyleChange({ fontSize: Math.min(96, textDefaults.fontSize + 2) })}
              className="p-2 rounded-md hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-support-teal text-neutral-600 hover:text-neutral-700"
              title="Increase font size"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>

          {/* Text Style Toggles */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleStyleChange({ bold: !textDefaults.bold })}
              className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-support-teal ${
                textDefaults.bold 
                  ? 'bg-brand-primary text-white' 
                  : 'hover:bg-neutral-100 text-neutral-600 hover:text-neutral-700'
              }`}
              title="Bold"
              aria-pressed={textDefaults.bold}
            >
              <Bold className="w-4 h-4" strokeWidth={2.5} />
            </button>
            
            <button
              onClick={() => handleStyleChange({ italic: !textDefaults.italic })}
              className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-support-teal ${
                textDefaults.italic 
                  ? 'bg-brand-primary text-white' 
                  : 'hover:bg-neutral-100 text-neutral-600 hover:text-neutral-700'
              }`}
              title="Italic"
              aria-pressed={textDefaults.italic}
            >
              <Italic className="w-4 h-4" strokeWidth={2.5} />
            </button>
            
            <button
              onClick={() => handleStyleChange({ underline: !textDefaults.underline })}
              className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-support-teal ${
                textDefaults.underline 
                  ? 'bg-brand-primary text-white' 
                  : 'hover:bg-neutral-100 text-neutral-600 hover:text-neutral-700'
              }`}
              title="Underline"
              aria-pressed={textDefaults.underline}
            >
              <Underline className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* CENTER ZONE - Text Colors (Visual Anchor) */}
        <div className="flex items-center gap-2">
          {/* Color Swatches - Responsive sizing */}
          {colorPresets.map((color) => (
            <button
              key={color}
              onClick={() => {
                handleStyleChange({ textColor: color })
                if (showColorPicker) setShowColorPicker(false)
              }}
              className={`w-10 h-10 rounded border-2 transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary hover:scale-105 ${
                textDefaults.textColor === color 
                  ? 'border-brand-primary ring-2 ring-brand-primary/20' 
                  : 'border-neutral-300 hover:border-neutral-400'
              }`}
              style={{ backgroundColor: color }}
              title={`Text color: ${color}`}
            />
          ))}
          
          {/* Recent Colors */}
          {recentColors.slice(0, 3).map((color, index) => (
            <button
              key={`recent-${index}`}
              onClick={() => handleStyleChange({ textColor: color })}
              className={`w-8 h-8 rounded border-2 transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary hover:scale-105 ${
                textDefaults.textColor === color 
                  ? 'border-brand-primary ring-2 ring-brand-primary/20' 
                  : 'border-neutral-300 hover:border-neutral-400'
              }`}
              style={{ backgroundColor: color }}
              title={`Recent color: ${color}`}
            />
          ))}

          {/* Color Picker */}
          <div>
            <button
              ref={colorPickerButtonRef}
              onClick={() => {
                closeAllPopouts()
                setShowColorPicker(!showColorPicker)
              }}
              className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-support-teal ${
                showColorPicker 
                  ? 'bg-brand-primary text-white ring-2 ring-brand-primary/30' 
                  : 'hover:bg-neutral-100 text-neutral-600 hover:text-neutral-700'
              }`}
              title="Custom color picker"
              aria-expanded={showColorPicker}
              aria-haspopup="dialog"
            >
              <Palette className="w-5 h-5" strokeWidth={2.5} />
            </button>

            <FloatingMenu
              isOpen={showColorPicker}
              onClose={() => setShowColorPicker(false)}
              trigger={colorPickerButtonRef}
              className="p-3"
            >
              <div className="flex flex-col gap-2">
                <input
                  type="color"
                  value={textDefaults.textColor}
                  onChange={(e) => {
                    handleStyleChange({ textColor: e.target.value })
                  }}
                  onMouseUp={() => {
                    setShowColorPicker(false)
                    colorPickerButtonRef.current?.focus()
                  }}
                  onTouchEnd={() => {
                    setShowColorPicker(false)
                    colorPickerButtonRef.current?.focus()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setShowColorPicker(false)
                      colorPickerButtonRef.current?.focus()
                    }
                  }}
                  className="w-12 h-8 border border-neutral-300 rounded cursor-pointer"
                  aria-label="Custom color picker"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-24 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                  title="Brightness"
                  aria-label="Color brightness"
                />
                <span className="text-xs text-neutral-600 text-center">Custom</span>
              </div>
            </FloatingMenu>
          </div>
        </div>

        {/* RIGHT ZONE - Background & Border */}
        <div className="flex items-center gap-4 justify-self-start">
          
          {/* Background Icon - Static with Popout */}
          <button
            ref={backgroundIconRef}
            onClick={() => {
              closeAllPopouts()
              setShowBackgroundPopout(true)
            }}
            className={`w-10 h-10 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-support-teal flex items-center justify-center ${
              showBackgroundPopout
                ? 'bg-brand-primary text-white ring-2 ring-brand-primary/30'
                : textDefaults.backgroundOn 
                  ? 'bg-brand-primary text-white' 
                  : 'hover:bg-neutral-100 text-neutral-400 hover:text-neutral-500'
            }`}
            title="Text background"
            aria-expanded={showBackgroundPopout}
          >
            <div className="relative w-5 h-5">
              <Square 
                className="w-5 h-5" 
                strokeWidth={2.5}
                fill="none"
              />
              {/* Diagonal stripes pattern - always visible */}
              <div 
                className={`absolute inset-0.5 ${
                  textDefaults.backgroundOn ? 'opacity-80' : 'opacity-40'
                }`}
                style={{
                  background: `repeating-linear-gradient(
                    45deg, 
                    transparent, 
                    transparent 1.5px, 
                    currentColor 1.5px, 
                    currentColor 3px
                  )`
                }}
              />
            </div>
          </button>

          {/* Border Icon - Static with Popout */}
          <button
            ref={borderIconRef}
            onClick={() => {
              closeAllPopouts()
              setShowBorderPopout(true)
            }}
            className={`w-10 h-10 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-support-teal flex items-center justify-center ${
              showBorderPopout
                ? 'bg-brand-primary text-white ring-2 ring-brand-primary/30'
                : textDefaults.borderOn 
                  ? 'bg-brand-primary text-white' 
                  : 'hover:bg-neutral-100 text-neutral-400 hover:text-neutral-500'
            }`}
            title="Text border"
            aria-expanded={showBorderPopout}
          >
            <Square 
              className="w-5 h-5" 
              strokeWidth={2.5}
              strokeDasharray="3,2"
              fill="none"
            />
          </button>

        </div>

        {/* Background Popout */}
        <Popout
          isOpen={showBackgroundPopout}
          onClose={() => setShowBackgroundPopout(false)}
          anchorEl={backgroundIconRef.current}
          className="p-3"
        >
          <div className="flex items-center gap-2">
            {/* None Option */}
            <button
              onClick={() => {
                handleStyleChange({ backgroundOn: false })
                setShowBackgroundPopout(false)
                backgroundIconRef.current?.focus()
              }}
              className={`w-10 h-10 rounded border-2 transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary hover:scale-105 flex items-center justify-center ${
                !textDefaults.backgroundOn
                  ? 'border-brand-primary ring-2 ring-brand-primary/20 bg-brand-primary/10' 
                  : 'border-neutral-300 hover:border-neutral-400'
              }`}
              title="No background"
            >
              <div className="relative w-5 h-5">
                <Square className="w-5 h-5" strokeWidth={2} fill="none" />
                <SlashIcon className="w-5 h-5 absolute inset-0" strokeWidth={2} />
              </div>
            </button>
            
            {/* Black & White Options */}
            {backgroundColors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  handleStyleChange({ backgroundOn: true, backgroundColor: color })
                  setShowBackgroundPopout(false)
                  backgroundIconRef.current?.focus()
                }}
                className={`w-10 h-10 rounded border-2 transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary hover:scale-105 relative ${
                  textDefaults.backgroundOn && textDefaults.backgroundColor === color 
                    ? 'border-brand-primary ring-2 ring-brand-primary/20' 
                    : color === '#ffffff' 
                      ? 'border-neutral-400' 
                      : 'border-neutral-300'
                }`}
                style={{ 
                  backgroundColor: color,
                  outline: color === '#ffffff' ? '1px solid #e5e7eb' : undefined
                }}
                title={`Background: ${color === '#ffffff' ? 'White' : 'Black'}`}
              >
                {textDefaults.backgroundOn && textDefaults.backgroundColor === color && (
                  <Check className="w-4 h-4 absolute inset-0 m-auto text-white drop-shadow" strokeWidth={3} />
                )}
              </button>
            ))}

            {/* Color Wheel */}
            <button
              ref={backgroundColorWheelRef}
              onClick={() => {
                setShowBackgroundColorWheel(true)
              }}
              className="p-2 rounded-md hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-support-teal text-neutral-600 hover:text-neutral-700"
              title="Custom background color"
            >
              <Palette className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </Popout>

        {/* Border Popout */}
        <Popout
          isOpen={showBorderPopout}
          onClose={() => setShowBorderPopout(false)}
          anchorEl={borderIconRef.current}
          className="p-3"
        >
          <div className="flex items-center gap-2">
            {/* None Option */}
            <button
              onClick={() => {
                handleStyleChange({ borderOn: false })
                setShowBorderPopout(false)
                borderIconRef.current?.focus()
              }}
              className={`w-10 h-10 rounded border-2 transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary hover:scale-105 flex items-center justify-center ${
                !textDefaults.borderOn
                  ? 'border-brand-primary ring-2 ring-brand-primary/20 bg-brand-primary/10' 
                  : 'border-neutral-300 hover:border-neutral-400'
              }`}
              title="No border"
            >
              <div className="relative w-5 h-5">
                <Square className="w-5 h-5" strokeWidth={2} strokeDasharray="3,2" fill="none" />
                <SlashIcon className="w-5 h-5 absolute inset-0" strokeWidth={2} />
              </div>
            </button>
            
            {/* Border Color Options */}
            {borderColors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  handleStyleChange({ borderOn: true, borderColor: color })
                  setShowBorderPopout(false)
                  borderIconRef.current?.focus()
                }}
                className={`w-10 h-10 rounded border-2 transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary hover:scale-105 relative ${
                  textDefaults.borderOn && textDefaults.borderColor === color 
                    ? 'border-brand-primary ring-2 ring-brand-primary/20' 
                    : 'border-neutral-300'
                }`}
                style={{ backgroundColor: color }}
                title={`Border: ${color}`}
              >
                {textDefaults.borderOn && textDefaults.borderColor === color && (
                  <Check className="w-4 h-4 absolute inset-0 m-auto text-white drop-shadow" strokeWidth={3} />
                )}
              </button>
            ))}

            {/* Color Wheel */}
            <button
              ref={borderColorWheelRef}
              onClick={() => {
                setShowBorderColorWheel(true)
              }}
              className="p-2 rounded-md hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-support-teal text-neutral-600 hover:text-neutral-700"
              title="Custom border color"
            >
              <Palette className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </Popout>

        {/* Background Color Wheel Sub-Popout */}
        <Popout
          isOpen={showBackgroundColorWheel}
          onClose={() => setShowBackgroundColorWheel(false)}
          anchorEl={backgroundColorWheelRef.current}
          className="p-3"
          zIndex={950}
        >
          <div className="flex flex-col gap-2">
            <input
              type="color"
              value={textDefaults.backgroundColor}
              onChange={(e) => {
                // Apply live while dragging
                handleStyleChange({ backgroundOn: true, backgroundColor: e.target.value })
              }}
              onMouseUp={() => {
                // Close on pointer-up (drag complete)
                setShowBackgroundColorWheel(false)
                setShowBackgroundPopout(false)
                backgroundIconRef.current?.focus()
              }}
              onTouchEnd={() => {
                // Close on touch end
                setShowBackgroundColorWheel(false)
                setShowBackgroundPopout(false)
                backgroundIconRef.current?.focus()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setShowBackgroundColorWheel(false)
                  setShowBackgroundPopout(false)
                  backgroundIconRef.current?.focus()
                }
              }}
              className="w-12 h-8 border border-neutral-300 rounded cursor-pointer"
              aria-label="Custom background color picker"
            />
            <span className="text-xs text-neutral-600 text-center">Custom</span>
          </div>
        </Popout>

        {/* Border Color Wheel Sub-Popout */}
        <Popout
          isOpen={showBorderColorWheel}
          onClose={() => setShowBorderColorWheel(false)}
          anchorEl={borderColorWheelRef.current}
          className="p-3"
          zIndex={950}
        >
          <div className="flex flex-col gap-2">
            <input
              type="color"
              value={textDefaults.borderColor}
              onChange={(e) => {
                // Apply live while dragging
                handleStyleChange({ borderOn: true, borderColor: e.target.value })
              }}
              onMouseUp={() => {
                // Close on pointer-up (drag complete)
                setShowBorderColorWheel(false)
                setShowBorderPopout(false)
                borderIconRef.current?.focus()
              }}
              onTouchEnd={() => {
                // Close on touch end
                setShowBorderColorWheel(false)
                setShowBorderPopout(false)
                borderIconRef.current?.focus()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setShowBorderColorWheel(false)
                  setShowBorderPopout(false)
                  borderIconRef.current?.focus()
                }
              }}
              className="w-12 h-8 border border-neutral-300 rounded cursor-pointer"
              aria-label="Custom border color picker"
            />
            <span className="text-xs text-neutral-600 text-center">Custom</span>
          </div>
        </Popout>

      </div>
    </div>
  )
}