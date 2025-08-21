'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useEditingTextStore } from '@/stores/editingTextStore';

interface RichTextOverlayProps {
  /** Excalidraw API instance */
  excalidrawAPI: any;
  /** Whether the component is mounted */
  isMounted: boolean;
  /** Callback when overlay content changes */
  onContentChange?: (html: string, textContent: string) => void;
  /** Callback when selection changes */
  onSelectionChange?: (selection: Selection | null) => void;
  /** Ref callback for the overlay element */
  onRef?: (element: HTMLElement | null) => void;
  /** Force update trigger - increment this to force overlay recalculation */
  forceUpdateTrigger?: number;
}

interface TextEditingState {
  elementId: string;
  element: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  transform: { scale: number; rotation: number };
  zoom: number;
  initialContent: string;
}

export function RichTextOverlay({ 
  excalidrawAPI, 
  isMounted, 
  onContentChange,
  onSelectionChange,
  onRef,
  forceUpdateTrigger
}: RichTextOverlayProps) {
  const [editingState, setEditingState] = useState<TextEditingState | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { setEditingTextId } = useEditingTextStore();
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const lastElementStateRef = useRef<any>(null);

  // Force immediate overlay update when element properties change
  const forceOverlayUpdate = useCallback(() => {
    console.log('🔄 Forcing overlay update');
    setEditingState(prev => prev ? { ...prev } : null);
  }, []);

  // Monitor Excalidraw for text editing with immediate element change detection
  useEffect(() => {
    if (!excalidrawAPI || !isMounted) return;

    const checkTextEditing = () => {
      try {
        const appState = excalidrawAPI.getAppState();
        const elements = excalidrawAPI.getSceneElements();
        
        if (appState.editingElement) {
          const editingElement = elements.find((el: any) => el.id === appState.editingElement);
          
          if (editingElement && editingElement.type === 'text') {
            const canvasBounds = excalidrawAPI.getAppState();
            const zoom = canvasBounds.zoom?.value || 1;
            const scrollX = canvasBounds.scrollX || 0;
            const scrollY = canvasBounds.scrollY || 0;
            
            // Calculate overlay position with zoom and scroll
            const x = (editingElement.x * zoom) + scrollX;
            const y = (editingElement.y * zoom) + scrollY;
            // Use more flexible width/height calculation for better font size handling
            const width = editingElement.width ? 
              editingElement.width * zoom : 
              Math.max(editingElement.fontSize * 10, 200);
            // Calculate height with more generous spacing for font size changes
            const baseHeight = editingElement.fontSize ? editingElement.fontSize * 1.4 : 24;
            const height = editingElement.height ? 
              editingElement.height * zoom : 
              Math.max(baseHeight * zoom, baseHeight);
            
            // Check if this is a new editing session or if element properties changed significantly
            const isNewSession = !editingState;
            const hasElementChanged = editingState && (
              Math.abs(editingState.element.fontSize - editingElement.fontSize) > 1 ||
              editingState.element.fontWeight !== editingElement.fontWeight ||
              editingState.element.fontStyle !== editingElement.fontStyle ||
              editingState.element.strokeColor !== editingElement.strokeColor ||
              Math.abs(height - editingState.size.height) > 5
            );

            if (isNewSession || hasElementChanged) {
              console.log('📝 Setting up/updating rich text overlay:', {
                elementId: editingElement.id,
                position: { x, y },
                size: { width, height },
                zoom,
                fontSize: editingElement.fontSize,
                isNewSession,
                hasElementChanged,
                trigger: forceUpdateTrigger
              });

              setEditingState({
                elementId: editingElement.id,
                element: editingElement,
                position: { x, y },
                size: { width, height },
                transform: { 
                  scale: zoom, 
                  rotation: editingElement.angle || 0 
                },
                zoom,
                initialContent: editingElement.text || ''
              });

              setEditingTextId(editingElement.id);
            }
            return;
          }
        }
        
        // Not editing text anymore
        if (editingState) {
          console.log('📝 Closing rich text overlay');
          setEditingState(null);
          setEditingTextId(null);
        }
      } catch (error) {
        console.error('Error checking text editing state:', error);
      }
    };

    // Check immediately and then periodically
    checkTextEditing();
    const interval = setInterval(checkTextEditing, 50); // Reduced to 50ms for faster response

    return () => {
      clearInterval(interval);
    };
  }, [excalidrawAPI, isMounted, editingState, setEditingTextId, forceUpdateTrigger]); // Added forceUpdateTrigger

  // Focus overlay when editing starts and provide ref
  useEffect(() => {
    if (editingState && overlayRef.current) {
      // Provide ref to parent
      onRef?.(overlayRef.current);
      
      setTimeout(() => {
        overlayRef.current?.focus();
        
        // Set initial content
        if (overlayRef.current) {
          overlayRef.current.innerHTML = convertTextToHTML(editingState.initialContent);
          
          // Place cursor at end
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(overlayRef.current);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }, 10);
    } else {
      // Clear ref when not editing
      onRef?.(null);
    }
  }, [editingState, onRef]);

  // Handle content changes
  const handleInput = useCallback(() => {
    if (!overlayRef.current) return;
    
    const html = overlayRef.current.innerHTML;
    const textContent = overlayRef.current.textContent || '';
    
    console.log('📝 Overlay content changed:', {
      html: html.substring(0, 100) + '...',
      textLength: textContent.length
    });
    
    onContentChange?.(html, textContent);
  }, [onContentChange]);

  // Handle selection changes
  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    
    if (selection && overlayRef.current?.contains(selection.anchorNode)) {
      console.log('📝 Selection changed:', {
        collapsed: selection.isCollapsed,
        anchorOffset: selection.anchorOffset,
        focusOffset: selection.focusOffset
      });
      
      onSelectionChange?.(selection);
    }
  }, [onSelectionChange]);

  // Listen for selection changes
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [handleSelectionChange]);

  // Live tracking of element properties and canvas state with immediate updates
  useEffect(() => {
    if (!excalidrawAPI || !editingState) return;

    const updateOverlayPosition = (forceUpdate = false) => {
      try {
        const appState = excalidrawAPI.getAppState();
        const elements = excalidrawAPI.getSceneElements();
        const currentElement = elements.find((el: any) => el.id === editingState.elementId);
        
        if (!currentElement || currentElement.type !== 'text') return;
        
        // Get current canvas state
        const zoom = appState.zoom?.value || 1;
        const scrollX = appState.scrollX || 0;
        const scrollY = appState.scrollY || 0;
        
        // Get canvas container for precise positioning
        const canvasContainer = document.querySelector('.excalidraw .excalidraw-wrapper canvas');
        if (!canvasContainer) return;
        
        const canvasRect = canvasContainer.getBoundingClientRect();
        
        // Calculate precise overlay position using canvas bounds
        const elementX = currentElement.x * zoom + scrollX + canvasRect.left;
        const elementY = currentElement.y * zoom + scrollY + canvasRect.top;
        // Be more flexible with width/height calculations for font size changes
        const elementWidth = Math.max(
          currentElement.width ? currentElement.width * zoom : currentElement.fontSize * 10,
          100
        );
        // Calculate height based on font size for better responsiveness
        const baseHeight = currentElement.fontSize ? currentElement.fontSize * 1.4 : 24; // More generous height
        const elementHeight = Math.max(
          currentElement.height ? currentElement.height * zoom : baseHeight * zoom,
          baseHeight // Ensure minimum height scales with font size
        );
        
        // Check if any values have changed significantly (including font size changes)
        const elementStateChanged = 
          currentElement.fontSize !== lastElementStateRef.current?.fontSize ||
          currentElement.fontWeight !== lastElementStateRef.current?.fontWeight ||
          currentElement.fontStyle !== lastElementStateRef.current?.fontStyle ||
          currentElement.width !== lastElementStateRef.current?.width ||
          currentElement.height !== lastElementStateRef.current?.height;

        // Update last element state for comparison
        if (elementStateChanged) {
          lastElementStateRef.current = {
            fontSize: currentElement.fontSize,
            fontWeight: currentElement.fontWeight,
            fontStyle: currentElement.fontStyle,
            width: currentElement.width,
            height: currentElement.height
          };
        }

        const positionChanged = forceUpdate || elementStateChanged ||
          Math.abs(elementX - editingState.position.x) > 1 ||
          Math.abs(elementY - editingState.position.y) > 1 ||
          Math.abs(elementWidth - editingState.size.width) > 1 ||
          Math.abs(elementHeight - editingState.size.height) > 1 ||
          Math.abs(zoom - editingState.zoom) > 0.01;
        
        if (positionChanged) {
          console.log('📍 Updating overlay position:', {
            x: elementX,
            y: elementY,
            width: elementWidth,
            height: elementHeight,
            fontSize: currentElement.fontSize,
            zoom,
            reason: forceUpdate ? 'forced' : 'changed'
          });
          
          setEditingState(prev => prev ? {
            ...prev,
            element: currentElement, // Update element reference
            position: { x: elementX, y: elementY },
            size: { width: elementWidth, height: elementHeight },
            transform: { scale: zoom, rotation: currentElement.angle || 0 },
            zoom
          } : null);
        }
      } catch (error) {
        console.error('Error updating overlay position:', error);
      }
    };

    // Immediate update on mount
    updateOverlayPosition(true);

    // High-frequency updates for smooth tracking during interactions
    const interval = setInterval(() => updateOverlayPosition(false), 16); // ~60fps
    
    // Also update on window resize
    const handleResize = () => updateOverlayPosition(true);
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearInterval(interval);
    };
  }, [excalidrawAPI, isMounted, editingState, setEditingTextId, forceUpdateTrigger]); // Added forceUpdateTrigger

  // Convert plain text to HTML
  const convertTextToHTML = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  };

  if (!editingState) {
    return null;
  }

  const { position, size, transform, element } = editingState;

  // Get the current element data directly from Excalidraw for real-time updates
  let currentElement = element;
  if (excalidrawAPI && isMounted) {
    try {
      const elements = excalidrawAPI.getSceneElements();
      const liveElement = elements.find((el: any) => el.id === editingState.elementId);
      if (liveElement && liveElement.type === 'text') {
        currentElement = liveElement; // Use live element data for immediate updates
        
        // Debug log to see when font size changes
        if (element.fontSize !== liveElement.fontSize) {
          console.log('🔄 Overlay detected font size change:', {
            oldFontSize: element.fontSize,
            newFontSize: liveElement.fontSize,
            elementId: editingState.elementId
          });
        }
      }
    } catch (error) {
      console.warn('Could not get live element data, using cached:', error);
    }
  }

  // Calculate pixel-perfect positioning to match Excalidraw text
  const overlayStyle: React.CSSProperties = {
    position: 'fixed', // Use fixed positioning for precise alignment
    left: position.x,
    top: position.y,
    minWidth: Math.max(size.width, 100), // Minimum width but allow expansion
    width: 'auto', // Allow width to grow with content
    minHeight: (currentElement.fontSize * 1.4) || 24, // Use ONLY current font size for immediate height response
    height: 'auto', // Allow height to grow with content
    fontSize: currentElement.fontSize || 20, // Use CURRENT fontSize for immediate updates
    fontFamily: currentElement.fontFamily || 'Arial, sans-serif',
    color: currentElement.strokeColor || '#000000',
    fontWeight: currentElement.fontWeight || 'normal',
    fontStyle: currentElement.fontStyle || 'normal',
    textAlign: currentElement.textAlign || 'left',
    lineHeight: '1.4', // Slightly more generous line height
    padding: '4px', // Slightly more padding for better appearance
    border: '1px dashed #3B82F6',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 10000,
    outline: 'none',
    overflow: 'visible', // Allow text to expand
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    // Remove transform scaling for font size changes to prevent conflicts
    transform: transform.rotation ? `rotate(${transform.rotation}rad)` : undefined,
    transformOrigin: 'top left',
    pointerEvents: 'auto',
    cursor: 'text',
    // Ensure consistent sizing regardless of zoom level
    maxWidth: 'calc(100vw - 20px)', // Prevent overflow beyond viewport
    resize: 'none', // Disable manual resizing to prevent conflicts
    // Ensure smooth transitions during updates
    transition: 'none', // Disable transitions for immediate updates
    // Match Excalidraw text rendering
    fontSmooth: 'auto',
    WebkitFontSmoothing: 'auto'
  };

  return (
    <div
      ref={overlayRef}
      contentEditable
      suppressContentEditableWarning
      style={overlayStyle}
      onInput={handleInput}
      onBlur={() => {
        console.log('📝 Overlay blur - committing changes');
        // Don't close immediately, let RichTextManager handle it
      }}
      onKeyDown={(e) => {
        // Prevent Excalidraw shortcuts while editing
        e.stopPropagation();
        
        if (e.key === 'Escape') {
          overlayRef.current?.blur();
        }
      }}
      // Comprehensive event isolation to prevent Stage interactions
      onPointerDown={(e) => {
        console.log('🎯 Overlay pointer down - preventing Stage bubbling');
        e.stopPropagation();
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        console.log('🎯 Overlay mouse down - preventing Stage bubbling');
        e.stopPropagation();
      }}
      onMouseMove={(e) => {
        e.stopPropagation();
      }}
      onMouseUp={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        console.log('🎯 Overlay click - preventing Stage bubbling');
        e.stopPropagation();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
      }}
      onContextMenu={(e) => {
        e.stopPropagation();
      }}
      onWheel={(e) => {
        // Allow scroll in text areas but prevent canvas zoom
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          e.stopPropagation();
        } else {
          e.stopPropagation();
        }
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
      }}
      onTouchMove={(e) => {
        e.stopPropagation();
      }}
      onTouchEnd={(e) => {
        e.stopPropagation();
      }}
      onDragStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.stopPropagation();
      }}
      data-rich-text-overlay="true"
    />
  );
}