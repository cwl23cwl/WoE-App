import React from 'react'
import { Volume2, BookOpen } from 'lucide-react'

export function InstructionsPanel() {
  return (
    <aside 
      className="w-full xl:w-64 bg-white border border-neutral-200 rounded-lg p-4"
      aria-labelledby="instructions-heading"
      role="complementary"
    >
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-5 h-5 text-brand-primary" aria-hidden="true" />
        <h2 id="instructions-heading" className="text-sm font-medium text-text-main">
          What to do
        </h2>
      </div>
      
      <div className="space-y-3">
        <p className="text-sm text-neutral-700" id="main-instructions">
          Write about your favorite activity. Use complete sentences and describe why you enjoy it.
        </p>
        
        <button 
          className="flex items-center gap-2 px-3 py-2 text-sm bg-support-teal text-white rounded-md hover:bg-support-teal/90 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors"
          aria-label="Listen to instructions"
          aria-describedby="main-instructions"
          tabIndex={3}
        >
          <Volume2 className="w-4 h-4" aria-hidden="true" />
          Listen
        </button>
        
        <div className="pt-3 border-t border-neutral-200">
          <h3 className="text-xs font-medium text-text-main mb-2">Tips</h3>
          <ul className="text-xs text-neutral-700 space-y-1" role="list">
            <li role="listitem">• Start with a topic sentence</li>
            <li role="listitem">• Add details and examples</li>
            <li role="listitem">• Check your spelling</li>
          </ul>
        </div>
      </div>
    </aside>
  )
}