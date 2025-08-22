import React from 'react'

interface ToolDrawerProps {
  isOpen: boolean
  children: React.ReactNode
  className?: string
}

export function ToolDrawer({ isOpen, children, className = '' }: ToolDrawerProps) {
  return (
    <div
      className={`
        overflow-hidden transition-all duration-200 ease-out
        ${isOpen ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'}
        ${className}
      `}
      style={{
        transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
      }}
    >
      <div className="h-16 px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center gap-4">
        {children}
      </div>
    </div>
  )
}