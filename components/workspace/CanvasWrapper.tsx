// components/workspace/CanvasWrapper.tsx - Prevents canvas jumping during accordion animations
'use client'

import React from 'react'

interface CanvasWrapperProps {
  children: React.ReactNode
  className?: string
}

export function CanvasWrapper({ children, className = '' }: CanvasWrapperProps) {
  return (
    <div className={`canvas-container ${className}`}>
      {/* Fixed spacer to prevent accordion jumping */}
      <div className="toolbar-spacer h-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100" />
      
      {/* Canvas content */}
      <div className="canvas-content bg-white min-h-screen">
        {children}
      </div>

      <style jsx>{`
        .canvas-container {
          position: relative;
          transition: padding-top 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .toolbar-spacer {
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .canvas-content {
          position: relative;
          z-index: 5;
        }
      `}</style>
    </div>
  )
}