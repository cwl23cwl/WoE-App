'use client'

import React from 'react'

export default function MinimalWorkspace() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <h1 className="text-2xl font-bold text-brand-primary mb-4">
          Minimal Workspace Test
        </h1>
        <div className="flex gap-4 mb-6">
          <div className="w-8 h-8 bg-brand-primary rounded"></div>
          <div className="w-8 h-8 bg-support-teal rounded"></div>
          <div className="w-8 h-8 bg-support-yellow rounded"></div>
          <div className="w-8 h-8 bg-support-navy rounded"></div>
        </div>
        <p className="text-neutral-700">
          If you can see this with proper brand colors, the React version is working.
        </p>
      </div>
    </div>
  )
}