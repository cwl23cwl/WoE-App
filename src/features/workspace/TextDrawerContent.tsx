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
import { ProfessionalColorPicker } from '@/components/ui/professional-color-picker'

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
  const [capturedSelection, setCapturedSelection] = useState<string[]>([])
  
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
    
    if (!excalidrawAPI) {
      console.log('📝 No Excalidraw API - only updating defaults')
      return
    }
    
    try {
      const elements = excalidrawAPI.getSceneElements()
      const appState = excalidrawAPI.getAppState()
      const currentSelection = appState.selectedElementIds || []
      const editingTextId = appState.editingElement?.id
      
      // Find text elements to target (prioritize current selection, then editing element, then captured selection)
      let targetTextElements: any[] = []
      let targetSource = 'none'
      
      // 1. Check if we have currently selected text elements
      // Ensure currentSelection is an array
      const selectionArray = Array.isArray(currentSelection) ? currentSelection : Object.keys(currentSelection)
      if (selectionArray.length > 0) {
        const selectedTextElements = elements.filter((el: any) => 
          selectionArray.includes(el.id) && el.type === 'text'
        )
        if (selectedTextElements.length > 0) {
          targetTextElements = selectedTextElements
          targetSource = 'current-selection'
        }
      }
      
      // 2. If no current selection, check if we're editing a text element
      if (targetTextElements.length === 0 && editingTextId) {
        const editingElement = elements.find((el: any) => el.id === editingTextId && el.type === 'text')
        if (editingElement) {
          targetTextElements = [editingElement]
          targetSource = 'editing-element'
        }
      }
      
      // 3. If no current targets, use captured selection
      if (targetTextElements.length === 0 && capturedSelection.length > 0) {
        const capturedTextElements = elements.filter((el: any) => 
          capturedSelection.includes(el.id) && el.type === 'text'
        )
        if (capturedTextElements.length > 0) {
          targetTextElements = capturedTextElements
          targetSource = 'captured-selection'
        }
      }
      
      // 4. If still no targets, provide user choice for targeting strategy
      if (targetTextElements.length === 0) {
        const textElements = elements.filter((el: any) => el.type === 'text')
        if (textElements.length > 0) {
          if (textElements.length === 1) {
            // Only one text element - target it
            targetTextElements = textElements
            targetSource = 'single-text'
          } else {
            // Multiple text elements - target the most recently created one
            // Sort by creation time (Excalidraw elements have versionNonce that increases over time)
            const sortedTextElements = textElements.sort((a: any, b: any) => {
              return (b.versionNonce || 0) - (a.versionNonce || 0)
            })
            
            targetTextElements = [sortedTextElements[0]]
            targetSource = 'most-recent-text'
          }
        }
      }
      
      // Debug: Show all text elements for troubleshooting
      const allTextElements = elements.filter((el: any) => el.type === 'text')
      const textElementsInfo = allTextElements.map((el: any) => ({
        id: el.id.substring(0, 8),
        versionNonce: el.versionNonce,
        text: el.text?.substring(0, 20) || 'empty',
        strokeColor: el.strokeColor,
        strokeWidth: el.strokeWidth
      }))
      
      console.log('🎯 Color targeting strategy:', {
        patch,
        targetSource,
        targetCount: targetTextElements.length,
        currentSelection,
        editingTextId,
        capturedSelection,
        totalElements: elements.length
      })
      
      console.log('📝 Available text elements:', textElementsInfo)
      console.log('🎯 Target elements:', targetTextElements.map(el => el.id.substring(0, 8)))
      
      if (targetTextElements.length > 0) {
        // Apply to target text elements
        const targetElementIds = targetTextElements.map((el: any) => el.id)
        const updatedElements = elements.map((el: any) => {
          if (targetElementIds.includes(el.id) && el.type === 'text') {
            const updatedElement = { ...el }
            
            // Apply all supported style properties
            if (patch.fontSize !== undefined) updatedElement.fontSize = patch.fontSize
            if (patch.fontFamily !== undefined) updatedElement.fontFamily = patch.fontFamily
            if (patch.bold !== undefined) {
              updatedElement.fontWeight = patch.bold ? 'bold' : 'normal'
            }
            if (patch.italic !== undefined) {
              updatedElement.fontStyle = patch.italic ? 'italic' : 'normal'
            }
            if (patch.align !== undefined) updatedElement.textAlign = patch.align
            
            // Handle background
            if (patch.backgroundOn !== undefined) {
              updatedElement.backgroundColor = patch.backgroundOn ? 
                (patch.backgroundColor || textDefaults.backgroundColor) : 'transparent'
            }
            if (patch.backgroundColor !== undefined && (patch.backgroundOn !== false)) {
              updatedElement.backgroundColor = patch.backgroundColor
            }
            
            // Handle text color and border independently
            const finalBorderOn = patch.borderOn !== undefined ? patch.borderOn : textDefaults.borderOn
            const finalTextColor = patch.textColor !== undefined ? patch.textColor : textDefaults.textColor
            const finalBorderColor = patch.borderColor !== undefined ? patch.borderColor : textDefaults.borderColor
            
            // Always set text color using color property (for fillStyle)
            updatedElement.color = finalTextColor
            
            // Handle border independently  
            if (finalBorderOn) {
              // Border is on - use strokeColor for border
              updatedElement.strokeColor = finalBorderColor
              updatedElement.strokeWidth = 1
              updatedElement.strokeStyle = 'solid'
            } else {
              // No border - disable stroke
              updatedElement.strokeWidth = 0
              updatedElement.strokeStyle = 'solid'
            }
            
            console.log('🎨 Applied style to element:', {
              elementId: updatedElement.id,
              textColor: updatedElement.color,
              borderColor: updatedElement.strokeColor,
              borderWidth: updatedElement.strokeWidth,
              borderOn: finalBorderOn,
              targetSource
            })
            
            return updatedElement
          }
          return el
        })
        
        excalidrawAPI.updateScene({ 
          elements: updatedElements,
          commitToHistory: targetSource !== 'editing-element' // Don't commit to history when editing
        })
        
        console.log(`✅ Applied style to ${targetTextElements.length} text elements via ${targetSource}`)
      } else {
        // No text elements found to target - just update defaults
        console.log('📝 No text elements to target - updated defaults only')
      }
    } catch (error) {
      console.error('❌ Error in handleStyleChange:', error)
      // Fallback to the original method
      applyTextStyleToSelection(patch, excalidrawAPI)
    }
    
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
                // Capture fresh selection when color swatch is clicked
                if (excalidrawAPI) {
                  try {
                    const elements = excalidrawAPI.getSceneElements()
                    const appState = excalidrawAPI.getAppState()
                    const currentSelection = appState.selectedElementIds || []
                    const editingTextId = appState.editingElement?.id
                    
                    // Ensure currentSelection is an array
                    const selectionArray = Array.isArray(currentSelection) ? currentSelection : Object.keys(currentSelection)
                    
                    const selectedTextIds = elements
                      .filter((el: any) => selectionArray.includes(el.id) && el.type === 'text')
                      .map((el: any) => el.id)
                    
                    let freshCapturedIds = selectedTextIds
                    if (freshCapturedIds.length === 0 && editingTextId) {
                      const editingElement = elements.find((el: any) => el.id === editingTextId && el.type === 'text')
                      if (editingElement) {
                        freshCapturedIds = [editingTextId]
                      }
                    }
                    
                    setCapturedSelection(freshCapturedIds)
                    console.log('🎨 Fresh selection captured for color:', { color, freshCapturedIds })
                  } catch (error) {
                    console.error('Failed to capture fresh selection:', error)
                  }
                }
                
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
              onClick={() => {
                // Capture fresh selection when recent color is clicked
                if (excalidrawAPI) {
                  try {
                    const elements = excalidrawAPI.getSceneElements()
                    const appState = excalidrawAPI.getAppState()
                    const currentSelection = appState.selectedElementIds || []
                    const editingTextId = appState.editingElement?.id
                    
                    // Ensure currentSelection is an array
                    const selectionArray = Array.isArray(currentSelection) ? currentSelection : Object.keys(currentSelection)
                    
                    const selectedTextIds = elements
                      .filter((el: any) => selectionArray.includes(el.id) && el.type === 'text')
                      .map((el: any) => el.id)
                    
                    let freshCapturedIds = selectedTextIds
                    if (freshCapturedIds.length === 0 && editingTextId) {
                      const editingElement = elements.find((el: any) => el.id === editingTextId && el.type === 'text')
                      if (editingElement) {
                        freshCapturedIds = [editingTextId]
                      }
                    }
                    
                    setCapturedSelection(freshCapturedIds)
                    console.log('🎨 Fresh selection captured for recent color:', { color, freshCapturedIds })
                  } catch (error) {
                    console.error('Failed to capture fresh selection for recent color:', error)
                  }
                }
                
                handleStyleChange({ textColor: color })
              }}
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
                
                // Capture current selection before opening color picker
                if (!showColorPicker && excalidrawAPI) {
                  try {
                    const elements = excalidrawAPI.getSceneElements()
                    const appState = excalidrawAPI.getAppState()
                    const currentSelection = appState.selectedElementIds || []
                    const editingTextId = appState.editingElement?.id
                    
                    // Capture both selected and editing text elements
                    // Ensure currentSelection is an array
                    const selectionArray = Array.isArray(currentSelection) ? currentSelection : Object.keys(currentSelection)
                    
                    const selectedTextIds = elements
                      .filter((el: any) => selectionArray.includes(el.id) && el.type === 'text')
                      .map((el: any) => el.id)
                    
                    // If no selected text but we're editing text, capture that
                    let capturedIds = selectedTextIds
                    if (capturedIds.length === 0 && editingTextId) {
                      const editingElement = elements.find((el: any) => el.id === editingTextId && el.type === 'text')
                      if (editingElement) {
                        capturedIds = [editingTextId]
                      }
                    }
                    
                    setCapturedSelection(capturedIds)
                    console.log('📋 Captured text selection:', {
                      selectedTextIds,
                      editingTextId,
                      finalCaptured: capturedIds
                    })
                  } catch (error) {
                    console.error('Failed to capture selection:', error)
                    setCapturedSelection([])
                  }
                } else {
                  setCapturedSelection([])
                }
                
                setShowColorPicker(!showColorPicker)
              }}
              className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-support-teal ${
                showColorPicker 
                  ? 'bg-brand-primary text-white ring-2 ring-brand-primary/30' 
                  : 'hover:bg-neutral-100 text-neutral-600 hover:text-neutral-700'
              }`}
              title="Professional color picker"
              aria-expanded={showColorPicker}
              aria-haspopup="dialog"
            >
              <Palette className="w-5 h-5" strokeWidth={2.5} />
            </button>

            <FloatingMenu
              isOpen={showColorPicker}
              onClose={() => {
                setShowColorPicker(false)
                setCapturedSelection([]) // Clear captured selection when closing
              }}
              trigger={colorPickerButtonRef}
              className="p-0"
            >
              <ProfessionalColorPicker
                value={textDefaults.textColor}
                onChange={(color) => {
                  handleStyleChange({ textColor: color })
                }}
                onClose={() => {
                  setShowColorPicker(false)
                  setCapturedSelection([]) // Clear captured selection
                  colorPickerButtonRef.current?.focus()
                }}
                recentColors={recentColors}
                onAddRecentColor={addRecentColor}
              />
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
          className="p-0"
          zIndex={950}
        >
          <ProfessionalColorPicker
            value={textDefaults.backgroundColor}
            onChange={(color) => {
              handleStyleChange({ backgroundOn: true, backgroundColor: color })
            }}
            onClose={() => {
              setShowBackgroundColorWheel(false)
              setShowBackgroundPopout(false)
              backgroundIconRef.current?.focus()
            }}
            recentColors={recentColors}
            onAddRecentColor={addRecentColor}
          />
        </Popout>

        {/* Border Color Wheel Sub-Popout */}
        <Popout
          isOpen={showBorderColorWheel}
          onClose={() => setShowBorderColorWheel(false)}
          anchorEl={borderColorWheelRef.current}
          className="p-0"
          zIndex={950}
        >
          <ProfessionalColorPicker
            value={textDefaults.borderColor}
            onChange={(color) => {
              handleStyleChange({ borderOn: true, borderColor: color })
            }}
            onClose={() => {
              setShowBorderColorWheel(false)
              setShowBorderPopout(false)
              borderIconRef.current?.focus()
            }}
            recentColors={recentColors}
            onAddRecentColor={addRecentColor}
          />
        </Popout>

      </div>
    </div>
  )
}