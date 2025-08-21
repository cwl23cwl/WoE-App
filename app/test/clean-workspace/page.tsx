'use client'

import React from 'react'
import { WorkspaceCanvas } from '@/components/workspace/WorkspaceCanvas'
import { WorkspaceToolbar } from '@/components/workspace/WorkspaceToolbar'

export default function CleanWorkspace() {
  return (
    <div className="min-h-screen bg-neutral-50 text-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 mb-4 shadow-sm border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-lg font-bold text-blue-900">
            ●
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">My Work Space</h1>
            <span className="text-sm text-gray-600">Student View</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-6">
          <span className="text-sm flex items-center gap-1 text-teal-600">
            <svg width="10" height="10" fill="currentColor">
              <circle cx="5" cy="5" r="5" />
            </svg>
            <span className="hidden sm:inline">Saved</span>
            <span className="sm:hidden">✓</span>
          </span>
          <button className="p-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors">
            Help
          </button>
          <button className="p-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors">
            Account
          </button>
          <button className="p-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors">
            Menu
          </button>
        </div>
      </header>

      {/* Toolbar - Using new component */}
      <WorkspaceToolbar />

      {/* Main Content Area */}
      <div className="flex-1 px-4 sm:px-8 pb-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Page List - Left Sidebar */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="w-full bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-sm font-medium text-gray-900 mb-3">Pages</h2>
              <div className="space-y-2">
                <button className="w-full h-20 border rounded-md flex items-center justify-center text-xs bg-orange-600 text-white border-orange-600">
                  Page 1
                </button>
              </div>
              <button className="w-full mt-3 px-3 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center gap-2">
                + Add page
              </button>
            </div>
          </div>

          {/* Center: Canvas and Instructions */}
          <div className="flex-1 flex flex-col xl:flex-row gap-4 xl:gap-6 min-w-0">
            {/* Canvas Area - Using new component */}
            <div className="flex-1 min-w-0">
              <WorkspaceCanvas />
            </div>

            {/* Instructions Panel - Right Side */}
            <div className="w-full xl:w-80 shrink-0">
              <div className="w-full bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 text-orange-600">📖</span>
                  <h2 className="text-sm font-medium text-gray-900">What to do</h2>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Write about your favorite activity. Use complete sentences and describe why you enjoy it.
                  </p>
                  
                  <button className="flex items-center gap-2 px-3 py-2 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors">
                    <span className="w-4 h-4">🔊</span>
                    Listen
                  </button>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <h3 className="text-xs font-medium text-gray-900 mb-2">Tips</h3>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Start with a topic sentence</li>
                      <li>• Add details and examples</li>
                      <li>• Check your spelling</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}