import React from 'react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { TextDrawerContent } from './TextDrawerContent'

export function ToolDrawer() {
  const { openDrawer } = useWorkspaceStore()
  
  const isOpen = openDrawer !== 'none'
  
  return (
    <div 
      className={`
        w-full 
        bg-white 
        border-l border-r border-b border-neutral-200 
        shadow-sm 
        transition-all duration-150 ease-out
        overflow-visible
        ${isOpen 
          ? 'h-14 opacity-100' 
          : 'h-0 opacity-0'
        }
      `}
      style={{
        borderRadius: '0 0 12px 12px',
      }}
    >
      <div className="h-14 flex items-center px-4 overflow-visible">
        {openDrawer === 'text' && <TextDrawerContent />}
        {openDrawer === 'draw' && <div className="text-sm text-neutral-600">Draw options coming soon...</div>}
        {openDrawer === 'highlight' && <div className="text-sm text-neutral-600">Highlight options coming soon...</div>}
      </div>
    </div>
  )
}