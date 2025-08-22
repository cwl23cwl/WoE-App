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

  // Calculate position immediately when opening
  useEffect(() => {
    if (!isOpen || !anchorEl) return

    const anchorRect = anchorEl.getBoundingClientRect()
    let top = anchorRect.bottom + offset
    let left = anchorRect.left

    // Immediate position set - no waiting for element
    setPosition({ top, left })
    setActualPlacement(placement)
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
        ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
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