import React, { useEffect, useRef, useState, ReactNode } from 'react'
import { Portal } from './portal'

interface FloatingMenuProps {
  isOpen: boolean
  onClose: () => void
  trigger: React.RefObject<HTMLElement>
  children: ReactNode
  placement?: 'bottom' | 'top' | 'auto'
  offset?: number
  className?: string
}

export function FloatingMenu({
  isOpen,
  onClose,
  trigger,
  children,
  placement = 'auto',
  offset = 8,
  className = ''
}: FloatingMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0, placement: 'bottom' })

  // Calculate position
  useEffect(() => {
    if (!isOpen || !trigger.current) return

    const updatePosition = () => {
      const triggerRect = trigger.current!.getBoundingClientRect()
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      }

      // Get scroll positions to account for page scrolling
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft
      const scrollY = window.pageYOffset || document.documentElement.scrollTop

      // Calculate position relative to viewport
      let x = triggerRect.left
      let y = triggerRect.bottom + offset
      let finalPlacement = 'bottom'

      // Auto-flip logic - estimate menu height as 150px if not rendered yet
      const estimatedMenuHeight = menuRef.current?.getBoundingClientRect().height || 150
      
      if (placement === 'auto') {
        const spaceBelow = viewport.height - triggerRect.bottom
        const spaceAbove = triggerRect.top
        
        if (spaceBelow < estimatedMenuHeight + offset && spaceAbove > spaceBelow) {
          y = triggerRect.top - estimatedMenuHeight - offset
          finalPlacement = 'top'
        }
      } else if (placement === 'top') {
        y = triggerRect.top - estimatedMenuHeight - offset
        finalPlacement = 'top'
      }

      // Keep menu within viewport horizontally
      const estimatedMenuWidth = menuRef.current?.getBoundingClientRect().width || 250
      if (x + estimatedMenuWidth > viewport.width) {
        x = viewport.width - estimatedMenuWidth - 8
      }
      if (x < 8) {
        x = 8
      }

      // Ensure minimum distance from edges
      x = Math.max(8, Math.min(x, viewport.width - estimatedMenuWidth - 8))
      y = Math.max(8, Math.min(y, viewport.height - estimatedMenuHeight - 8))

      setPosition({ x, y, placement: finalPlacement })
    }

    // Initial position calculation
    updatePosition()
    
    // Recalculate when menu dimensions are available
    const timer = setTimeout(updatePosition, 0)
    
    // Update on scroll/resize
    const handleUpdate = () => requestAnimationFrame(updatePosition)
    window.addEventListener('scroll', handleUpdate, true)
    window.addEventListener('resize', handleUpdate)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleUpdate, true)
      window.removeEventListener('resize', handleUpdate)
    }
  }, [isOpen, trigger, offset, placement])

  // Click outside handler
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        trigger.current &&
        !trigger.current.contains(target)
      ) {
        onClose()
      }
    }

    // Escape key handler
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        trigger.current?.focus()
      }
    }

    // Tool switch handler
    const handleClose = () => {
      onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    window.addEventListener('closeFloatingMenus', handleClose)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      window.removeEventListener('closeFloatingMenus', handleClose)
    }
  }, [isOpen, onClose, trigger])

  // Focus management
  useEffect(() => {
    if (isOpen && menuRef.current) {
      // Focus first focusable element
      const focusable = menuRef.current.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
      if (focusable instanceof HTMLElement) {
        focusable.focus()
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <Portal>
      <div
        ref={menuRef}
        className={`
          fixed bg-white border border-neutral-200 rounded-md shadow-lg
          pointer-events-auto
          ${className}
        `}
        style={{
          left: position.x,
          top: position.y,
          zIndex: 900, // Use CSS variable value directly
        }}
        role="menu"
        aria-hidden={!isOpen}
      >
        {children}
      </div>
    </Portal>
  )
}