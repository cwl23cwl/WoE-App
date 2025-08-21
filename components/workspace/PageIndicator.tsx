'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

interface PageIndicatorProps {
  index: number
  count: number
  onJumpTo: (index: number) => void
}

export function PageIndicator({ index, count, onJumpTo }: PageIndicatorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const canGoPrevious = index > 0
  const canGoNext = index < count - 1

  const handlePrevious = () => {
    if (canGoPrevious) {
      onJumpTo(index - 1)
    }
  }

  const handleNext = () => {
    if (canGoNext) {
      onJumpTo(index + 1)
    }
  }

  const handlePageSelect = (pageIndex: number) => {
    onJumpTo(pageIndex)
    setIsDropdownOpen(false)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  if (count <= 1) {
    return null
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Previous Arrow */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePrevious}
        disabled={!canGoPrevious}
        className="p-2"
        title="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* Page Display with Dropdown */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleDropdown}
          className="flex items-center space-x-2 min-w-[80px] justify-center"
        >
          <span className="font-medium">
            {index + 1} / {count}
          </span>
          <ChevronDown 
            className={`w-3 h-3 transition-transform ${
              isDropdownOpen ? 'rotate-180' : ''
            }`} 
          />
        </Button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full mt-1 left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[120px]">
            <div className="py-1 max-h-64 overflow-y-auto">
              {Array.from({ length: count }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageSelect(i)}
                  className={`
                    w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors
                    ${i === index ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}
                  `}
                >
                  Page {i + 1}
                  {i === index && (
                    <span className="ml-2 text-blue-400">•</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Next Arrow */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNext}
        disabled={!canGoNext}
        className="p-2"
        title="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  )
}
