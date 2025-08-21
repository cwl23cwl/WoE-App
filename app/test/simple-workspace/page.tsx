'use client'

import React from 'react'

// Ultra-simple test page to check if basic components work
export default function SimpleWorkspaceTest() {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
        <p className="font-bold">🧪 Simple Test</p>
        <p className="text-sm">Basic workspace test with brand colors</p>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 mb-4 shadow-sm border-b border-neutral-200 bg-white rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-lg font-bold text-white">
            ●
          </div>
          <div>
            <h1 className="text-xl font-semibold text-text-main">My Work Space</h1>
            <span className="text-sm text-neutral-700">Student View</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm text-support-teal">✓ Saved</span>
          <button className="p-2 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-primary">
            Help
          </button>
        </div>
      </header>

      {/* Simple Toolbar */}
      <nav className="flex flex-wrap items-center gap-3 px-8 py-3 mb-4 bg-white border border-neutral-200 rounded-xl shadow-sm">
        <button className="flex flex-col items-center px-3 py-2 text-xs rounded-md bg-brand-primary text-white">
          Select
        </button>
        <button className="flex flex-col items-center px-3 py-2 text-xs rounded-md text-brand-primary hover:bg-neutral-50">
          Draw
        </button>
        <button className="flex flex-col items-center px-3 py-2 text-xs rounded-md text-support-teal hover:bg-neutral-50">
          Text
        </button>
        <div className="w-px h-8 bg-neutral-200 mx-2" />
        <button className="px-3 py-2 rounded-md bg-support-yellow text-support-navy">
          Clear
        </button>
      </nav>

      {/* Simple Canvas */}
      <div className="flex gap-4">
        {/* Left Panel */}
        <div className="w-48 bg-white border border-neutral-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-text-main mb-3">Pages</h3>
          <div className="w-full h-20 bg-brand-primary text-white rounded-md flex items-center justify-center text-xs">
            Page 1
          </div>
          <button className="w-full mt-3 px-3 py-2 text-sm bg-brand-primary text-white rounded-md">
            Add page
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 min-h-[500px] bg-white rounded-2xl shadow-lg border border-neutral-200 flex flex-col">
          <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 rounded-t-2xl">
            <h2 className="text-sm font-medium text-text-main">My Canvas</h2>
          </div>
          <div className="flex-1 flex items-center justify-center text-neutral-500">
            <div className="text-center">
              <div className="text-4xl mb-4">✏️</div>
              <p className="text-lg font-medium text-text-main mb-2">Start drawing here</p>
              <p className="text-sm text-neutral-700">Pick a tool and start creating</p>
            </div>
          </div>
          <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50 rounded-b-2xl">
            <button className="px-4 py-2 bg-support-teal text-white rounded-md">
              Turn in
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-64 bg-white border border-neutral-200 rounded-lg p-4">
          <h2 className="text-sm font-medium text-text-main mb-3">What to do</h2>
          <p className="text-sm text-neutral-700 mb-3">
            Write about your favorite activity. Use complete sentences.
          </p>
          <button className="flex items-center gap-2 px-3 py-2 text-sm bg-support-teal text-white rounded-md">
            Listen
          </button>
        </div>
      </div>
    </div>
  )
}