'use client'

import React from 'react'
import { StreamlinedWorkspace } from '@/components/workspace/StreamlinedWorkspace'

export default function StreamlinedWorkspaceTestPage() {
  return (
    <div className="h-screen bg-gray-100">
      <div className="h-full max-w-7xl mx-auto">
        <StreamlinedWorkspace />
      </div>
    </div>
  )
}