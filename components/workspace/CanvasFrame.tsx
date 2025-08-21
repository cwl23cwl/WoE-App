'use client'

import { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { WORKSPACE_DEFAULTS } from '@/lib/workspace-defaults'
import { useWorkspaceStore } from '@/stores/workspace'

interface CanvasFrameProps {
  children: ReactNode
  className?: string
}

export function CanvasFrame({ children, className = '' }: CanvasFrameProps) {
  const { zoom } = useWorkspaceStore()

  return (
    <div className="flex justify-center items-start min-h-[600px] p-6">
      {/* Temporarily replace Card with simple div to test pointer events */}
      <div 
        className={`
          bg-white shadow-lg rounded-lg border
          ${className}
        `}
        style={{
          maxWidth: `${WORKSPACE_DEFAULTS.frame.maxWidth}px`,
          width: '100%',
        }}
      >
        {/* Page Content - remove padding and simplify */}
        <div 
          className="bg-white w-full h-full"
          style={{
            minHeight: `${WORKSPACE_DEFAULTS.pageSize.h}px`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
