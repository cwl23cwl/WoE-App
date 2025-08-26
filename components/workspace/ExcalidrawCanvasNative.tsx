// In your ExcalidrawCanvasNative.tsx file, replace or enhance the existing implementation:

import React, { useEffect, useRef, useCallback } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'

export default function ExcalidrawCanvasNative({ /* your existing props */ }) {
  const isMountedRef = useRef(true)

  // Enhanced scroll button removal
  useEffect(() => {
    const removeScrollBackButton = () => {
      const selectors = [
        '.excalidraw__scroll-back-to-content',
        '[class*="scroll-back"]',
        '[data-testid*="scroll-back"]',
        '[aria-label*="scroll back" i]',
        '[title*="scroll back" i]',
        '.scroll-to-content',
        '.scrollBackToContent',
        // Additional patterns
        '[class*="back-to-content"]',
        '[class*="scroll-to-content"]'
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element && element.parentNode) {
            element.remove();
          }
        });
      });

      // Remove by content
      const buttons = document.querySelectorAll('button, [role="button"]');
      buttons.forEach(button => {
        const text = (button.textContent || '').toLowerCase();
        const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
        const title = (button.getAttribute('title') || '').toLowerCase();
        
        if (
          text.includes('scroll back') ||
          text.includes('back to content') ||
          ariaLabel.includes('scroll back') ||
          ariaLabel.includes('back to content') ||
          title.includes('scroll back') ||
          title.includes('back to content')
        ) {
          button.remove();
        }
      });
    };

    // Initial removal
    removeScrollBackButton();

    // MutationObserver for dynamic content
    const observer = new MutationObserver(() => {
      removeScrollBackButton();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Periodic cleanup
    const interval = setInterval(removeScrollBackButton, 2000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="excalidraw-canvas-wrapper w-full h-full relative overflow-hidden bg-white">
      <Excalidraw
        // ... your existing props
        detectScroll={false}
        UIOptions={{
          canvasActions: {
            toggleTheme: false,
            saveToActiveFile: false,
            loadScene: false,
            export: false,
            // Explicitly disable scroll actions
          },
        }}
      />

      {/* Enhanced CSS - replace your existing style block */}
      <style jsx>{`
        /* ===== COMPREHENSIVE SCROLL BUTTON HIDING ===== */
        .excalidraw-canvas-wrapper :global(.excalidraw__scroll-back-to-content),
        .excalidraw-canvas-wrapper :global([class*="scroll-back"]),
        .excalidraw-canvas-wrapper :global([data-testid*="scroll-back"]),
        .excalidraw-canvas-wrapper :global([aria-label*="scroll back"]),
        .excalidraw-canvas-wrapper :global([aria-label*="Scroll back"]),
        .excalidraw-canvas-wrapper :global([title*="scroll back"]),
        .excalidraw-canvas-wrapper :global([title*="Scroll back"]),
        .excalidraw-canvas-wrapper :global(.scroll-to-content),
        .excalidraw-canvas-wrapper :global(.scrollBackToContent),
        .excalidraw-canvas-wrapper :global([class*="back-to-content"]),
        .excalidraw-canvas-wrapper :global([class*="scroll-to-content"]) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          position: absolute !important;
          left: -99999px !important;
          width: 0 !important;
          height: 0 !important;
          z-index: -999 !important;
        }

        /* ===== HIDE FLOATING ACTION BUTTONS ===== */
        .excalidraw-canvas-wrapper :global(button[class*="floating"]),
        .excalidraw-canvas-wrapper :global(button[class*="fab"]),
        .excalidraw-canvas-wrapper :global(.floating-action-button) {
          display: none !important;
        }

        /* ===== PREVENT SCROLL DETECTION ===== */
        .excalidraw-canvas-wrapper :global(.excalidraw) {
          --scroll-detection: disabled;
          overflow: hidden !important;
        }

        /* ===== YOUR EXISTING STYLES ===== */
        /* Keep all your existing toolbar and UI hiding styles */
        .excalidraw-canvas-wrapper :global(.App-toolbar),
        .excalidraw-canvas-wrapper :global(.App-toolbar-content),
        /* ... rest of your existing styles ... */
      `}</style>
    </div>
  )
}