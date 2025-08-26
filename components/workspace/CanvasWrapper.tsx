// components/workspace/CanvasWrapper.tsx
'use client'

import React from 'react'
import PageIndicator from '@/components/workspace/PageIndicator'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

interface CanvasWrapperProps {
  children: React.ReactNode
  className?: string
}

export function CanvasWrapper({ children, className = '' }: CanvasWrapperProps) {
  const { pages, currentPageIndex, jumpToPage } = useWorkspaceStore()

  return (
    <div className={`canvas-container ${className}`}>
      {/* Fixed spacer to prevent accordion jumping */}
      <div className="toolbar-spacer h-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100" />

      {/* Canvas content */}
      <div className="canvas-content bg-white min-h-screen relative">
        {/* 🔴 PageIndicator overlay at top-center */}
        <div className="pointer-events-auto absolute left-1/2 top-3 z-[100] -translate-x-1/2">
          <PageIndicator
            index={currentPageIndex ?? 0}
            count={Math.max(1, pages?.length ?? 1)}
            onJumpTo={jumpToPage}
          />
        </div>

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
