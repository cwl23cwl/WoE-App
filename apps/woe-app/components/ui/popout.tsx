import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface PopoutProps {
  isOpen: boolean
  onClose: () => void
  anchorEl: HTMLElement | null
  children: React.ReactNode
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
  offset?: number
  withCaret?: boolean
  className?: string
  zIndex?: number
}

export function Popout({
  isOpen,
  onClose,
  anchorEl,
  children,
  placement = 'bottom-start',
  offset = 10,
  withCaret = true,
  className = '',
  zIndex = 900
}: PopoutProps) {
  const [popoutElement, setPopoutElement] = useState<HTMLDivElement | null>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [actualPlacement, setActualPlacement] = useState(placement)

  // Calculate position with proper viewport handling
  useEffect(() => {
    if (!isOpen || !anchorEl) return

    const calculatePosition = () => {
      const anchorRect = anchorEl.getBoundingClientRect()
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      }
      
      // Start with basic positioning
      let top = anchorRect.bottom + offset
      let left = anchorRect.left
      let finalPlacement = placement

      // Handle different placement options
      switch (placement) {
        case 'bottom-start':
          top = anchorRect.bottom + offset
          left = anchorRect.left
          break
        case 'bottom-end':
          top = anchorRect.bottom + offset
          left = anchorRect.right - 180 // Reasonable estimate for popout width
          break
        case 'top-start':
          top = anchorRect.top - offset - 80 // Reasonable estimate for popout height
          left = anchorRect.left
          break
        case 'top-end':
          top = anchorRect.top - offset - 80
          left = anchorRect.right - 180
          break
      }

      // Simple viewport constraints - keep it minimal to avoid issues
      const minMargin = 16
      
      // Horizontal bounds
      if (left < minMargin) {
        left = minMargin
      } else if (left + 180 > viewport.width - minMargin) {
        left = viewport.width - 180 - minMargin
      }
      
      // Vertical bounds - flip if needed
      if (placement.includes('bottom') && top + 80 > viewport.height - minMargin) {
        // Flip to top
        top = anchorRect.top - offset - 80
        if (placement === 'bottom-start') finalPlacement = 'top-start'
        if (placement === 'bottom-end') finalPlacement = 'top-end'
      } else if (placement.includes('top') && top < minMargin) {
        // Flip to bottom
        top = anchorRect.bottom + offset
        if (placement === 'top-start') finalPlacement = 'bottom-start'
        if (placement === 'top-end') finalPlacement = 'bottom-end'
      }

      setPosition({ top, left })
      setActualPlacement(finalPlacement)
    }

    // Calculate immediately
    calculatePosition()
    
    // Recalculate on scroll and resize
    const handleUpdate = () => requestAnimationFrame(calculatePosition)
    window.addEventListener('scroll', handleUpdate, true)
    window.addEventListener('resize', handleUpdate)
    
    return () => {
      window.removeEventListener('scroll', handleUpdate, true)
      window.removeEventListener('resize', handleUpdate)
    }
  }, [isOpen, anchorEl, placement, offset])

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoutElement && 
        !popoutElement.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        // Return focus to anchor
        if (anchorEl) {
          anchorEl.focus()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose, anchorEl, popoutElement])

  // Create portal root if needed
  useEffect(() => {
    let portalRoot = document.getElementById('ui-overlays')
    if (!portalRoot) {
      portalRoot = document.createElement('div')
      portalRoot.id = 'ui-overlays'
      portalRoot.style.position = 'relative'
      portalRoot.style.zIndex = '900'
      document.body.appendChild(portalRoot)
    }
  }, [])

  if (!isOpen) return null

  const portalRoot = document.getElementById('ui-overlays')
  if (!portalRoot) return null

  const caretClasses = withCaret ? {
    'bottom-start': 'after:absolute after:-top-1 after:left-4 after:w-2 after:h-2 after:bg-white after:border-l after:border-t after:border-neutral-200 after:rotate-45',
    'bottom-end': 'after:absolute after:-top-1 after:right-4 after:w-2 after:h-2 after:bg-white after:border-l after:border-t after:border-neutral-200 after:rotate-45',
    'top-start': 'before:absolute before:-bottom-1 before:left-4 before:w-2 before:h-2 before:bg-white before:border-r before:border-b before:border-neutral-200 before:rotate-45',
    'top-end': 'before:absolute before:-bottom-1 before:right-4 before:w-2 before:h-2 before:bg-white before:border-r before:border-b before:border-neutral-200 before:rotate-45'
  } : {}

  return createPortal(
    <div
      ref={setPopoutElement}
      className={`
        fixed bg-white rounded-lg border border-neutral-200 shadow-lg
        transform transition-all duration-150 ease-out
        scale-100 opacity-100
        ${caretClasses[actualPlacement] || ''}
        ${className}
      `}
      style={{
        top: position.top,
        left: position.left,
        zIndex
      }}
    >
      {children}
    </div>,
    portalRoot
  )
}