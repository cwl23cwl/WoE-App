import React, { useRef, useState, useEffect } from 'react'
import { Check, Type } from 'lucide-react'
import { FloatingMenu } from './floating-menu'

interface FontOption {
  id: string
  name: string
  label: string
  fontFamily: string
  category: 'sans' | 'serif' | 'mono' | 'comic' | 'dyslexia'
}

interface FontPickerProps {
  value: string
  onChange: (fontFamily: string) => void
  className?: string
}

const FONT_OPTIONS: FontOption[] = [
  {
    id: 'open-sans',
    name: 'Open Sans',
    label: 'Open Sans',
    fontFamily: 'Open Sans',
    category: 'sans'
  },
  {
    id: 'comic-sans',
    name: 'Comic Sans',
    label: 'Comic Sans',
    fontFamily: 'Comic Sans MS',
    category: 'comic'
  },
  {
    id: 'calibri',
    name: 'Calibri',
    label: 'Calibri',
    fontFamily: 'Calibri',
    category: 'sans'
  },
  {
    id: 'tahoma',
    name: 'Tahoma',
    label: 'Tahoma',
    fontFamily: 'Tahoma',
    category: 'sans'
  },
  {
    id: 'arial',
    name: 'Arial',
    label: 'Arial',
    fontFamily: 'Arial',
    category: 'sans'
  },
  {
    id: 'times',
    name: 'Times New Roman',
    label: 'Times New Roman',
    fontFamily: 'Times New Roman',
    category: 'serif'
  },
  {
    id: 'georgia',
    name: 'Georgia',
    label: 'Georgia',
    fontFamily: 'Georgia',
    category: 'serif'
  },
  {
    id: 'courier',
    name: 'Courier',
    label: 'Courier',
    fontFamily: 'Courier New',
    category: 'mono'
  },
  {
    id: 'verdana',
    name: 'Verdana',
    label: 'Verdana',
    fontFamily: 'Verdana',
    category: 'sans'
  },
  {
    id: 'helvetica',
    name: 'Helvetica',
    label: 'Helvetica',
    fontFamily: 'Helvetica',
    category: 'sans'
  },
]

export function FontPicker({ value, onChange, className = '' }: FontPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [previewMode, setPreviewMode] = useState<'Aa' | 'Abc'>('Aa')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Find current font index
  const currentFontIndex = FONT_OPTIONS.findIndex(font => 
    value.includes(font.fontFamily) || value.toLowerCase().includes(font.fontFamily.toLowerCase())
  )

  useEffect(() => {
    if (currentFontIndex >= 0) {
      setSelectedIndex(currentFontIndex)
    }
  }, [currentFontIndex])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault()
          setSelectedIndex(prev => prev > 0 ? prev - 1 : FONT_OPTIONS.length - 1)
          break
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault()
          setSelectedIndex(prev => prev < FONT_OPTIONS.length - 1 ? prev + 1 : 0)
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          handleSelect(FONT_OPTIONS[selectedIndex])
          break
        case 'Escape':
          event.preventDefault()
          setIsOpen(false)
          // Don't focus to avoid tool state changes
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex])

  const handleSelect = (font: FontOption) => {
    onChange(font.fontFamily)
    setIsOpen(false)
    // Don't focus the trigger to avoid interfering with text tool state
  }

  const getCurrentFontLabel = () => {
    const current = FONT_OPTIONS.find(font => 
      value.includes(font.fontFamily) || value.toLowerCase().includes(font.fontFamily.toLowerCase())
    )
    return current?.label || 'Font'
  }

  return (
    <div className={className}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 p-2 rounded-md hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-support-teal text-neutral-600 hover:text-neutral-700"
        title="Font"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Font: ${getCurrentFontLabel()}`}
      >
        <Type className="w-5 h-5" strokeWidth={2.5} />
      </button>

      <FloatingMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        trigger={triggerRef}
        className="p-3"
        placement="auto"
      >
        <div ref={panelRef} className="relative">
          {/* Optional preview mode toggle */}
          <div className="flex justify-center mb-3">
            <button
              onClick={() => setPreviewMode(previewMode === 'Aa' ? 'Abc' : 'Aa')}
              className="text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
              title="Toggle preview text"
            >
              {previewMode === 'Aa' ? 'Aa' : 'Abc'}
            </button>
          </div>

          {/* Font grid */}
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {FONT_OPTIONS.map((font, index) => {
              const isSelected = currentFontIndex === index
              const isFocused = selectedIndex === index
              
              return (
                <button
                  key={font.id}
                  onClick={() => handleSelect(font)}
                  className={`
                    relative rounded-lg border-2 transition-all focus:outline-none
                    flex flex-col items-center justify-center gap-1 bg-white
                    hover:border-neutral-300 hover:shadow-sm
                    ${isSelected 
                      ? 'border-brand-primary bg-brand-primary/5' 
                      : 'border-neutral-200'
                    }
                    ${isFocused 
                      ? 'ring-2 ring-support-teal ring-offset-2' 
                      : ''
                    }
                  `}
                  style={{ width: '100px', height: '60px' }}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={isFocused ? 0 : -1}
                >
                  {/* Font preview */}
                  <div 
                    className="text-2xl font-medium text-neutral-800"
                    style={{ fontFamily: `${font.fontFamily}, sans-serif` }}
                  >
                    {previewMode}
                  </div>
                  
                  {/* Font label */}
                  <div className="text-xs text-neutral-600 font-medium">
                    {font.label}
                  </div>

                  {/* Selected check mark */}
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-brand-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Subtle caret pointing to trigger */}
          <div className="absolute -top-1 left-4 w-3 h-3 bg-white border-l border-t border-neutral-200 transform rotate-45 -translate-y-1/2" />
        </div>
      </FloatingMenu>
    </div>
  )
}