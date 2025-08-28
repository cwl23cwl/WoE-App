// components/workspace/PageIndicator.tsx - Enhanced version
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

type PageIndicatorProps = {
  index: number;      // zero-based current page index
  count: number;      // total pages (>= 1)
  onJumpTo: (pageIndex: number) => void;
};

export function PageIndicator({ index, count, onJumpTo }: PageIndicatorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const canGoPrevious = index > 0;
  const canGoNext = index < count - 1;

  // Debug to ensure it mounts
  useEffect(() => {
    console.log('[PageIndicator] mounted with props', { index, count });
  }, [index, count]);

  const handlePrevious = useCallback(() => {
    if (canGoPrevious) {
      console.log('[PageIndicator] Going to previous page:', index - 1);
      onJumpTo(index - 1);
    }
  }, [canGoPrevious, index, onJumpTo]);

  const handleNext = useCallback(() => {
    if (canGoNext) {
      console.log('[PageIndicator] Going to next page:', index + 1);
      onJumpTo(index + 1);
    }
  }, [canGoNext, index, onJumpTo]);

  const handlePageSelect = useCallback((pageIndex: number) => {
    console.log('[PageIndicator] Jumping to page:', pageIndex);
    onJumpTo(pageIndex);
    setIsDropdownOpen(false);
  }, [onJumpTo]);

  const toggleDropdown = useCallback(() => {
    if (count === 1) return; // Don't open dropdown for single page
    setIsDropdownOpen(v => !v);
  }, [count]);

  // Close dropdown on escape or outside click
  useEffect(() => {
    if (!isDropdownOpen) return;
    
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-sm overflow-hidden">
        
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          className={`
            flex items-center justify-center w-10 h-10 transition-all duration-200
            ${canGoPrevious 
              ? 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer' 
              : 'text-gray-300 cursor-not-allowed'
            }
          `}
          title={canGoPrevious ? "Previous page" : "No previous page"}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
        </button>

        {/* Current Page Display / Dropdown Trigger */}
        <button
          onClick={toggleDropdown}
          className={`
            flex items-center justify-center px-4 h-10 min-w-[80px]
            text-sm font-semibold text-gray-800 transition-all duration-200
            ${count > 1 
              ? 'hover:bg-gray-50 cursor-pointer' 
              : 'cursor-default'
            }
          `}
          aria-haspopup={count > 1 ? "listbox" : undefined}
          aria-expanded={isDropdownOpen}
          aria-label={count === 1 ? 'Page number' : 'Select page'}
          disabled={count === 1}
        >
          <span className="tabular-nums">
            {index + 1} / {count}
          </span>
          
          {count > 1 && (
            <ChevronDown
              className={`
                ml-2 w-3 h-3 transition-transform duration-200
                ${isDropdownOpen ? 'rotate-180' : ''}
              `}
              strokeWidth={2.5}
            />
          )}
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={`
            flex items-center justify-center w-10 h-10 transition-all duration-200
            ${canGoNext 
              ? 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer' 
              : 'text-gray-300 cursor-not-allowed'
            }
          `}
          title={canGoNext ? "Next page" : "No next page"}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isDropdownOpen && count > 1 && (
        <div
          className="absolute left-1/2 top-full z-50 mt-2 min-w-[160px] -translate-x-1/2 rounded-lg border border-gray-200 bg-white shadow-lg"
          role="listbox"
          aria-label="Pages"
        >
          <div className="max-h-64 overflow-y-auto py-1">
            {Array.from({ length: count }, (_, i) => {
              const isActive = i === index;
              return (
                <button
                  key={i}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handlePageSelect(i)}
                  className={`
                    w-full px-4 py-2.5 text-left text-sm transition-all duration-150
                    hover:bg-gray-50 focus:bg-gray-50 focus:outline-none
                    ${isActive 
                      ? 'bg-blue-50 font-semibold text-blue-700 border-r-2 border-blue-500' 
                      : 'text-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>Page {i + 1}</span>
                    {isActive && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Default export for compatibility
export default PageIndicator;