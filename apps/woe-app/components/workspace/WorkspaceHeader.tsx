'use client'

import React from 'react'
import { HelpCircle, User, MoreVertical } from 'lucide-react'

export function WorkspaceHeader() {
  return (
    <header className="flex items-center justify-between px-8 py-4 mb-4 shadow-sm border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-lg font-bold text-accent-foreground">
          ●
        </div>
        <div>
          <h1 className="text-xl font-semibold text-card-foreground">Assignment Workspace</h1>
          <span className="text-sm text-muted-foreground">Student View</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <span className="text-sm flex items-center gap-1 text-accent">
          <svg width="10" height="10" fill="currentColor" className="text-accent">
            <circle cx="5" cy="5" r="5" />
          </svg> 
          Saved
        </span>
        
        <button 
          className="p-2 rounded-md hover:bg-muted transition-colors"
          title="Help"
          aria-label="Get help with the workspace"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
        
        <button 
          className="p-2 rounded-md hover:bg-muted transition-colors"
          title="Account"
          aria-label="View account settings"
        >
          <User className="w-5 h-5" />
        </button>
        
        <button 
          className="p-2 rounded-md hover:bg-muted transition-colors"
          title="Menu"
          aria-label="Open menu"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}