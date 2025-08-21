import React, { useState } from 'react'
import { Plus } from 'lucide-react'

export function PageList() {
  const [currentPage, setCurrentPage] = useState(1)

  return (
    <aside 
      className="w-full lg:w-48 bg-white border border-neutral-200 rounded-lg p-4"
      aria-label="Pages"
      role="navigation"
    >
      <h2 className="text-sm font-medium text-text-main mb-3">Pages</h2>
      <div className="space-y-2" role="list">
        <button
          className={`w-full h-20 border rounded-md flex items-center justify-center text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary ${
            currentPage === 1 
              ? 'bg-brand-primary text-white border-brand-primary' 
              : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
          }`}
          onClick={() => setCurrentPage(1)}
          aria-label="Go to page 1"
          aria-current={currentPage === 1 ? 'page' : undefined}
          tabIndex={1}
          role="listitem"
        >
          Page 1
        </button>
        {/* Additional page thumbnails would go here */}
      </div>
      <button 
        className="w-full mt-3 px-3 py-2 text-sm bg-brand-primary text-white rounded-md hover:bg-brand-primary-600 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors flex items-center justify-center gap-2"
        aria-label="Add page"
        tabIndex={1}
      >
        <Plus className="w-4 h-4" />
        Add page
      </button>
    </aside>
  )
}