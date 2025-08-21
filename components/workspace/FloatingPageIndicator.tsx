'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Grid3X3, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { cn } from '@/lib/utils'

interface FloatingPageIndicatorProps {
  className?: string
  autoHide?: boolean
  autoHideDelay?: number
}

export function FloatingPageIndicator({
  className,
  autoHide = true,
  autoHideDelay = 3000
}: FloatingPageIndicatorProps) {
  const {
    pages,
    currentPageIndex,
    nextPage,
    prevPage,
    jumpToPage
  } = useWorkspaceStore()

  const [isVisible, setIsVisible] = useState(true)
  const [showPagePicker, setShowPagePicker] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const hideTimeoutRef = useRef<NodeJS.Timeout>()
  const indicatorRef = useRef<HTMLDivElement>(null)

  // Auto-hide functionality
  const resetHideTimer = useCallback(() => {
    if (!autoHide) return

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }

    hideTimeoutRef.current = setTimeout(() => {
      if (!isFocused && !showPagePicker) {
        setIsVisible(false)
      }
    }, autoHideDelay)
  }, [autoHide, autoHideDelay, isFocused, showPagePicker])

  const showIndicator = useCallback(() => {
    setIsVisible(true)
    resetHideTimer()
  }, [resetHideTimer])

  // Show indicator on mouse movement or page changes
  useEffect(() => {
    const handleMouseMove = () => showIndicator()
    const handleScroll = () => showIndicator()

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('scroll', handleScroll)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('scroll', handleScroll)
    }
  }, [showIndicator])

  // Reset timer when pages change
  useEffect(() => {
    showIndicator()
  }, [currentPageIndex, showIndicator])

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isFocused) return

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        prevPage()
        showIndicator()
        break
      case 'ArrowRight':
        e.preventDefault()
        nextPage()
        showIndicator()
        break
      case 'Escape':
        setShowPagePicker(false)
        indicatorRef.current?.blur()
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        setShowPagePicker(!showPagePicker)
        break
    }
  }, [isFocused, prevPage, nextPage, showPagePicker, showIndicator])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Handle focus management
  const handleFocus = () => {
    setIsFocused(true)
    showIndicator()
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (autoHide) {
      resetHideTimer()
    }
  }

  // Page picker component
  const PagePicker = () => {
    if (!showPagePicker) return null

    return (
      <Card className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm shadow-xl border rounded-xl min-w-[300px]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-900">Jump to Page</h3>
            <button
              onClick={() => setShowPagePicker(false)}
              className="p-1 hover:bg-gray-100 rounded text-gray-500"
              aria-label="Close page picker"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
            {pages.map((page, index) => (
              <button
                key={page.id || index}
                onClick={() => {
                  jumpToPage(index)
                  setShowPagePicker(false)
                  showIndicator()
                }}
                className={cn(
                  "aspect-square p-2 rounded-lg border-2 transition-all text-xs font-medium",
                  "flex items-center justify-center min-h-[40px]",
                  currentPageIndex === index
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                )}
                aria-label={`Go to page ${index + 1}`}
                title={`Page ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  const IndicatorContent = () => (
    <div className="relative">
      <Card
        ref={indicatorRef}
        className={cn(
          "bg-black/80 text-white border-black/20 rounded-full shadow-lg transition-all duration-300",
          "backdrop-blur-sm",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          className
        )}
        tabIndex={0}
        role="navigation"
        aria-label={`Page ${currentPageIndex + 1} of ${pages.length}`}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseEnter={() => {
          showIndicator()
          if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current)
          }
        }}
        onMouseLeave={() => {
          if (autoHide && !isFocused && !showPagePicker) {
            resetHideTimer()
          }
        }}
      >
        <div className="flex items-center px-4 py-2 space-x-3">
          {/* Previous button */}
          <button
            onClick={() => {
              prevPage()
              showIndicator()
            }}
            disabled={currentPageIndex === 0}
            className={cn(
              "p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50",
              currentPageIndex === 0
                ? "text-white/30 cursor-not-allowed"
                : "text-white/70 hover:text-white hover:bg-white/10"
            )}
            aria-label="Previous page"
            title="Previous page (Left arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page indicator button */}
          <button
            onClick={() => setShowPagePicker(!showPagePicker)}
            className="flex items-center space-x-2 px-2 py-1 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label={`Page ${currentPageIndex + 1} of ${pages.length}. Click to open page picker`}
            title="Click to jump to page"
          >
            <Grid3X3 className="w-3 h-3" />
            <span className="text-sm font-medium min-w-[40px]">
              {currentPageIndex + 1} / {pages.length}
            </span>
          </button>

          {/* Next button */}
          <button
            onClick={() => {
              nextPage()
              showIndicator()
            }}
            disabled={currentPageIndex === pages.length - 1}
            className={cn(
              "p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50",
              currentPageIndex === pages.length - 1
                ? "text-white/30 cursor-not-allowed"
                : "text-white/70 hover:text-white hover:bg-white/10"
            )}
            aria-label="Next page"
            title="Next page (Right arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </Card>

      {/* Page picker dropdown */}
      <PagePicker />
    </div>
  )

  // Don't show if only one page or no pages
  if (pages.length <= 1) return null

  // Render with portal for proper positioning
  return createPortal(
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
      <div className="pointer-events-auto">
        <IndicatorContent />
      </div>
    </div>,
    document.body
  )
}

// Helper hook for page indicator management
export const usePageIndicator = () => {
  const { pages, currentPageIndex, jumpToPage, nextPage, prevPage } = useWorkspaceStore()

  const goToFirstPage = useCallback(() => {
    if (pages.length > 0) {
      jumpToPage(0)
    }
  }, [pages.length, jumpToPage])

  const goToLastPage = useCallback(() => {
    if (pages.length > 0) {
      jumpToPage(pages.length - 1)
    }
  }, [pages.length, jumpToPage])

  const hasNextPage = currentPageIndex < pages.length - 1
  const hasPrevPage = currentPageIndex > 0

  return {
    currentPage: currentPageIndex + 1,
    totalPages: pages.length,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    jumpToPage,
    goToFirstPage,
    goToLastPage
  }
}