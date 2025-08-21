'use client'

import { useCallback, useState } from 'react'
import { 
  MousePointer2, 
  Pen, 
  Highlighter, 
  Type, 
  Eraser,
  Undo2,
  Redo2,
  Circle,
  Square,
  Triangle,
  Image
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useWorkspaceStore } from '@/stores/workspace'
import { cn } from '@/lib/utils'
import { ThicknessSlider } from './ThicknessSlider'
import { ModernColorPicker } from './ModernColorPicker'

interface ModernToolbarProps {
  className?: string
  excalidrawRef?: React.RefObject<any>
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  placement?: 'top' | 'left' | 'floating'
  isTeacher?: boolean
}

interface ToolConfig {
  id: 'select' | 'pencil' | 'highlighter' | 'text' | 'eraser'
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  shortcut?: string
}

interface ShapeConfig {
  id: 'rectangle' | 'ellipse' | 'triangle'
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

export function ModernToolbar({
  className,
  excalidrawRef,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  placement = 'top',
  isTeacher = false
}: ModernToolbarProps) {
  const { 
    tool, 
    setTool, 
    penWidth, 
    setPenWidth,
    highlighterWidth,
    setHighlighterWidth,
    strokeColor,
    textColor,
    setStroke,
    setTextColor,
    role
  } = useWorkspaceStore()

  const [colorMode, setColorMode] = useState<'pen' | 'text' | 'highlighter'>('pen')

  // ESL-friendly tool definitions with intuitive icons
  const tools: ToolConfig[] = [
    {
      id: 'select',
      label: 'Select',
      icon: MousePointer2,
      description: 'Click and move things',
      shortcut: 'V'
    },
    {
      id: 'pencil',
      label: 'Draw',
      icon: Pen,
      description: 'Draw with pencil',
      shortcut: 'P'
    },
    {
      id: 'highlighter',
      label: 'Highlight',
      icon: Highlighter,
      description: 'Mark important parts',
      shortcut: 'H'
    },
    {
      id: 'text',
      label: 'Text',
      icon: Type,
      description: 'Add words',
      shortcut: 'T'
    },
    {
      id: 'eraser',
      label: 'Erase',
      icon: Eraser,
      description: 'Remove drawings',
      shortcut: 'E'
    }
  ]

  // Shape tools for teacher mode
  const shapes: ShapeConfig[] = [
    {
      id: 'rectangle',
      label: 'Box',
      icon: Square,
      description: 'Draw a box'
    },
    {
      id: 'ellipse',
      label: 'Circle',
      icon: Circle,
      description: 'Draw a circle'
    },
    {
      id: 'triangle',
      label: 'Triangle',
      icon: Triangle,
      description: 'Draw a triangle'
    }
  ]

  const handleToolChange = useCallback((toolId: typeof tool) => {
    setTool(toolId)
    
    // Auto-open color picker for color-dependent tools
    if (toolId === 'pencil' || toolId === 'highlighter' || toolId === 'text') {
      setColorMode(toolId === 'text' ? 'text' : toolId === 'highlighter' ? 'highlighter' : 'pen')
    }
  }, [setTool])

  const handleColorChange = useCallback((color: string) => {
    if (colorMode === 'text') {
      setTextColor(color)
    } else {
      setStroke(color)
    }
  }, [colorMode, setStroke, setTextColor])

  const getActiveColor = () => {
    switch (tool) {
      case 'text':
        return textColor
      case 'pencil':
      case 'highlighter':
        return strokeColor
      default:
        return strokeColor
    }
  }

  const getColorMode = () => {
    switch (tool) {
      case 'text':
        return 'text' as const
      case 'highlighter':
        return 'highlighter' as const
      default:
        return 'pen' as const
    }
  }

  const getCurrentWidth = () => {
    return tool === 'highlighter' ? highlighterWidth : penWidth
  }

  const handleWidthChange = (newWidth: number) => {
    if (tool === 'highlighter') {
      setHighlighterWidth(newWidth)
    } else {
      setPenWidth(newWidth)
    }
  }

  // Responsive classes based on placement
  const getToolbarClasses = () => {
    const baseClasses = "bg-white/95 backdrop-blur-sm border shadow-lg"
    
    switch (placement) {
      case 'left':
        return cn(
          baseClasses,
          "rounded-r-2xl border-l-0 p-3 flex flex-col space-y-2 max-h-screen overflow-y-auto",
          className
        )
      case 'floating':
        return cn(
          baseClasses,
          "rounded-2xl p-4 max-w-lg",
          className
        )
      default: // top
        return cn(
          baseClasses,
          "rounded-b-2xl border-t-0 p-3 flex items-center justify-between",
          className
        )
    }
  }

  const getButtonClasses = (isActive: boolean) => {
    const baseClasses = "h-12 min-w-[48px] rounded-xl transition-all duration-200 border-2"
    const roleStyles = isTeacher 
      ? "border-dashed border-blue-200 hover:border-blue-300" 
      : "border-solid border-gray-200 hover:border-gray-300"
    
    if (isActive) {
      return cn(
        baseClasses,
        roleStyles,
        "bg-primary text-white border-primary shadow-md scale-105"
      )
    }
    
    return cn(
      baseClasses,
      roleStyles,
      "bg-white hover:bg-gray-50 text-gray-700 shadow-sm hover:shadow-md hover:scale-105"
    )
  }

  const ToolButton = ({ tool: toolConfig, isActive }: { tool: ToolConfig, isActive: boolean }) => (
    <div className="flex flex-col items-center">
      <button
        onClick={() => handleToolChange(toolConfig.id)}
        className={getButtonClasses(isActive)}
        title={`${toolConfig.label} - ${toolConfig.description}${toolConfig.shortcut ? ` • ${toolConfig.shortcut}` : ''}`}
        aria-label={`${toolConfig.label} tool - ${toolConfig.description}`}
        aria-pressed={isActive}
      >
        <toolConfig.icon className="w-6 h-6" />
      </button>
      <span className="text-xs font-medium text-gray-600 mt-1 max-w-[64px] text-center leading-tight">
        {toolConfig.label}
      </span>
    </div>
  )

  const ActionButton = ({ 
    onClick, 
    disabled, 
    icon: Icon, 
    label, 
    description 
  }: {
    onClick: () => void
    disabled: boolean
    icon: React.ComponentType<{ className?: string }>
    label: string
    description: string
  }) => (
    <div className="flex flex-col items-center">
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "h-12 min-w-[48px] rounded-xl transition-all duration-200 border-2 border-gray-200",
          disabled 
            ? "bg-gray-50 text-gray-300 cursor-not-allowed"
            : "bg-white hover:bg-gray-50 text-gray-700 shadow-sm hover:shadow-md hover:scale-105 hover:border-gray-300"
        )}
        title={`${label} - ${description}`}
        aria-label={`${label} - ${description}`}
      >
        <Icon className="w-6 h-6" />
      </button>
      <span className="text-xs font-medium text-gray-600 mt-1 max-w-[64px] text-center leading-tight">
        {label}
      </span>
    </div>
  )

  if (placement === 'top') {
    return (
      <Card className={getToolbarClasses()}>
        <CardContent className="p-0 flex items-center justify-between">
          {/* Main Tools */}
          <div className="flex items-end space-x-4">
            {tools.map((toolConfig) => (
              <ToolButton
                key={toolConfig.id}
                tool={toolConfig}
                isActive={tool === toolConfig.id}
              />
            ))}
          </div>

          {/* Color & Width Controls */}
          <div className="flex items-center space-x-4">
            {(tool === 'pencil' || tool === 'highlighter' || tool === 'text') && (
              <>
                {/* Modern Color Picker */}
                <ModernColorPicker
                  value={getActiveColor()}
                  onChange={handleColorChange}
                  mode={getColorMode()}
                  label="Color"
                  isESL={true}
                />

                {/* Thickness Slider for drawing tools */}
                {(tool === 'pencil' || tool === 'highlighter') && (
                  <ThicknessSlider
                    value={getCurrentWidth()}
                    onChange={handleWidthChange}
                    min={tool === 'highlighter' ? 4 : 1}
                    max={tool === 'highlighter' ? 16 : 8}
                    color={getActiveColor()}
                    label="Size"
                    tool={tool}
                  />
                )}
              </>
            )}
          </div>

          {/* Action Controls */}
          <div className="flex items-end space-x-4">
            <ActionButton
              onClick={onUndo || (() => {})}
              disabled={!canUndo}
              icon={Undo2}
              label="Undo"
              description="Go back one step"
            />
            <ActionButton
              onClick={onRedo || (() => {})}
              disabled={!canRedo}
              icon={Redo2}
              label="Redo"
              description="Go forward one step"
            />
          </div>
        </CardContent>

      </Card>
    )
  }

  // Left sidebar layout for teacher mode
  if (placement === 'left') {
    return (
      <Card className={getToolbarClasses()}>
        <CardContent className="p-0 space-y-3">
          {/* Main Tools - Vertical Stack */}
          <div className="space-y-3">
            {tools.map((toolConfig) => (
              <ToolButton
                key={toolConfig.id}
                tool={toolConfig}
                isActive={tool === toolConfig.id}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 mx-2" />

          {/* Color & Width Controls - Vertical */}
          {(tool === 'pencil' || tool === 'highlighter' || tool === 'text') && (
            <div className="space-y-3">
              <ModernColorPicker
                value={getActiveColor()}
                onChange={handleColorChange}
                mode={getColorMode()}
                label="Color"
                isESL={true}
              />

              {(tool === 'pencil' || tool === 'highlighter') && (
                <ThicknessSlider
                  value={getCurrentWidth()}
                  onChange={handleWidthChange}
                  min={tool === 'highlighter' ? 4 : 1}
                  max={tool === 'highlighter' ? 16 : 8}
                  color={getActiveColor()}
                  label="Size"
                  tool={tool}
                />
              )}
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-gray-200 mx-2" />

          {/* Action Controls - Vertical */}
          <div className="space-y-3">
            <ActionButton
              onClick={onUndo || (() => {})}
              disabled={!canUndo}
              icon={Undo2}
              label="Undo"
              description="Go back one step"
            />
            <ActionButton
              onClick={onRedo || (() => {})}
              disabled={!canRedo}
              icon={Redo2}
              label="Redo"
              description="Go forward one step"
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Floating toolbar for flexible positioning
  if (placement === 'floating') {
    return (
      <Card className={getToolbarClasses()}>
        <CardContent className="p-0">
          {/* Compact horizontal layout */}
          <div className="flex items-center justify-between space-x-2">
            {/* Essential tools only */}
            <div className="flex items-center space-x-1">
              {tools.slice(0, 3).map((toolConfig) => (
                <button
                  key={toolConfig.id}
                  onClick={() => handleToolChange(toolConfig.id)}
                  className={cn(
                    "h-10 w-10 rounded-lg transition-all duration-200 border-2",
                    tool === toolConfig.id
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
                  )}
                  title={toolConfig.label}
                  aria-label={toolConfig.label}
                >
                  <toolConfig.icon className="w-5 h-5" />
                </button>
              ))}
            </div>

            {/* Color picker */}
            {(tool === 'pencil' || tool === 'highlighter' || tool === 'text') && (
              <ModernColorPicker
                value={getActiveColor()}
                onChange={handleColorChange}
                mode={getColorMode()}
                label=""
                isESL={true}
                className="scale-75" // Smaller for floating toolbar
              />
            )}

            {/* Undo/Redo */}
            <div className="flex items-center space-x-1">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className={cn(
                  "h-10 w-10 rounded-lg transition-all duration-200 border-2",
                  canUndo
                    ? "bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
                    : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                )}
                title="Undo"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className={cn(
                  "h-10 w-10 rounded-lg transition-all duration-200 border-2",
                  canRedo
                    ? "bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
                    : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                )}
                title="Redo"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default fallback (shouldn't reach here)
  return null
}