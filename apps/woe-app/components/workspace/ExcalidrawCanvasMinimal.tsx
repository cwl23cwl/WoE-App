// components/workspace/ExcalidrawCanvasMinimal.tsx - Simplified compatible version with custom fonts
"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from 'next/dynamic';
import { useWorkspaceStore, type CanvasBackground } from '@/stores/useWorkspaceStore';

// Dynamically import our CUSTOM Excalidraw wrapper with fonts and background support
const ExcalidrawComponent = dynamic(
  () => import("@woe/excalidraw-wrapper").then((mod) => ({ default: mod.CustomExcalidraw })),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading CUSTOM canvas wrapper...</p>
        </div>
      </div>
    )
  }
);

interface ExcalidrawCanvasMinimalProps {
  onExcalidrawAPI?: (api: any) => void;
  className?: string;
}

function ExcalidrawCanvasMinimal({ 
  onExcalidrawAPI, 
  className = "" 
}: ExcalidrawCanvasMinimalProps) {
  const [mounted, setMounted] = useState(false);
  const excalidrawAPIRef = useRef<any>(null);
  
  // Get canvas background configuration from store
  const { canvasBackground } = useWorkspaceStore();

  // Ensure component is mounted client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle API callback
  const handleAPIReady = useCallback((api: any) => {
    if (api) {
      console.log('Canvas: API ready');
      excalidrawAPIRef.current = api;
      
      // Notify parent component that API is available
      if (onExcalidrawAPI) {
        onExcalidrawAPI(api);
      }

      // Initial setup
      setTimeout(() => {
        try {
          if (api.updateScene) {
            api.updateScene({
              appState: {
                zenModeEnabled: false,
                viewBackgroundColor: '#ffffff',
                defaultSidebarDockedPreference: false,
                currentItemFontFamily: "Open Sans", // Direct font name
                currentItemFontSize: 16,
              },
            });
            console.log('Canvas: Set default font to Open Sans');
          }
          console.log('Canvas: Initial setup complete');
        } catch (error) {
          console.error('Canvas: Setup failed:', error);
        }
      }, 100);
    }
  }, [onExcalidrawAPI]);

  // Enhanced scroll button removal
  useEffect(() => {
    if (!mounted) return;

    const removeScrollBackButton = () => {
      const selectors = [
        '.excalidraw__scroll-back-to-content',
        '[class*="scroll-back"]',
        '[data-testid*="scroll-back"]',
        '[aria-label*="scroll back" i]',
        '[title*="scroll back" i]',
        '.scroll-to-content',
        '.scrollBackToContent'
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element && element.parentNode) {
            element.remove();
          }
        });
      });
    };

    // Initial removal after a delay
    const initialTimer = setTimeout(removeScrollBackButton, 1000);

    // Periodic cleanup
    const interval = setInterval(removeScrollBackButton, 3000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [mounted]);

  // Don't render until mounted client-side
  if (!mounted) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`excalidraw-canvas-wrapper w-full h-full relative overflow-hidden bg-white ${className}`}>
      <ExcalidrawComponent
        excalidrawAPI={handleAPIReady}
        canvasBackground={canvasBackground}
        initialData={{
          appState: { 
            zenModeEnabled: false, 
            viewBackgroundColor: '#ffffff',
            currentItemFontFamily: "Open Sans", // Direct font name
          },
          elements: [],
        }}
        UIOptions={{
          canvasActions: {
            toggleTheme: false,
            saveToActiveFile: false,
            loadScene: false,
            export: false,
            saveAsImage: false
          }
        }}
      />

      {/* Enhanced CSS - Comprehensive UI hiding */}
      <style jsx>{`
        /* ===== HIDE DEFAULT TOOLBAR AND MENUS ===== */
        .excalidraw-canvas-wrapper :global(.App-toolbar),
        .excalidraw-canvas-wrapper :global(.App-toolbar-content),
        .excalidraw-canvas-wrapper :global(.App-top-bar),
        .excalidraw-canvas-wrapper :global(.ToolIcon),
        .excalidraw-canvas-wrapper :global(.App-menu),
        .excalidraw-canvas-wrapper :global(.App-menu_top),
        .excalidraw-canvas-wrapper :global(.excalidraw-button),
        .excalidraw-canvas-wrapper :global([data-testid="main-menu-trigger"]),
        .excalidraw-canvas-wrapper :global([data-testid*="menu"]) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }

        /* ===== HIDE SCROLL BACK BUTTONS ===== */
        .excalidraw-canvas-wrapper :global(.excalidraw__scroll-back-to-content),
        .excalidraw-canvas-wrapper :global([class*="scroll-back"]),
        .excalidraw-canvas-wrapper :global([data-testid*="scroll-back"]),
        .excalidraw-canvas-wrapper :global([aria-label*="scroll back" i]),
        .excalidraw-canvas-wrapper :global([title*="scroll back" i]),
        .excalidraw-canvas-wrapper :global(.scroll-to-content),
        .excalidraw-canvas-wrapper :global(.scrollBackToContent) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          position: absolute !important;
          left: -99999px !important;
          z-index: -999 !important;
        }

        /* ===== HIDE FLOATING BUTTONS AND OVERLAYS ===== */
        .excalidraw-canvas-wrapper :global(button[class*="floating"]),
        .excalidraw-canvas-wrapper :global(.floating-action-button),
        .excalidraw-canvas-wrapper :global([class*="fab"]),
        .excalidraw-canvas-wrapper :global(.App-menu_top) {
          display: none !important;
        }

        /* ===== HIDE WELCOME SCREEN AND LIBRARY ===== */
        .excalidraw-canvas-wrapper :global(.welcome-screen),
        .excalidraw-canvas-wrapper :global(.library-menu),
        .excalidraw-canvas-wrapper :global([data-testid="library-menu"]) {
          display: none !important;
        }

        /* ===== CANVAS POSITIONING AND LAYERING ===== */
        .excalidraw-canvas-wrapper :global(.excalidraw) {
          position: relative !important;
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
        }

        .excalidraw-canvas-wrapper :global(.App-canvas) {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          transform: none !important;
        }

        /* ===== HIDE ZOOM CONTROLS ===== */
        .excalidraw-canvas-wrapper :global(.zoom-menu),
        .excalidraw-canvas-wrapper :global([data-testid*="zoom"]) {
          display: none !important;
        }

        /* ===== HIDE HELP AND SHORTCUTS ===== */
        .excalidraw-canvas-wrapper :global(.help-icon),
        .excalidraw-canvas-wrapper :global([data-testid="help"]),
        .excalidraw-canvas-wrapper :global(.shortcuts-dialog) {
          display: none !important;
        }

        /* ===== FORCE CLEAN LAYOUT ===== */
        .excalidraw-canvas-wrapper :global(.App) {
          --ui-pointerEvents: none !important;
        }

        /* Hide any remaining UI elements by common patterns */
        .excalidraw-canvas-wrapper :global([class*="menu"]),
        .excalidraw-canvas-wrapper :global([class*="toolbar"]),
        .excalidraw-canvas-wrapper :global([class*="button"]):not([class*="canvas"]) {
          display: none !important;
        }

        /* Ensure canvas takes full space */
        .excalidraw-canvas-wrapper :global(.excalidraw-wrapper) {
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
    </div>
  );
}

// Export both named and default
export { ExcalidrawCanvasMinimal };
export default ExcalidrawCanvasMinimal;