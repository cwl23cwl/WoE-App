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
  onRef
}: RichTextOverlayProps) {
  const [editingState, setEditingState] = useState<TextEditingState | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { setEditingTextId } = useEditingTextStore();
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Monitor Excalidraw for text editing
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
            const width = (editingElement.width || 200) * zoom;
            const height = (editingElement.height || editingElement.fontSize || 20) * zoom;
            
            console.log('📝 Setting up rich text overlay:', {
              elementId: editingElement.id,
              position: { x, y },
              size: { width, height },
              zoom,
              fontSize: editingElement.fontSize
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
    const interval = setInterval(checkTextEditing, 100);

    return () => {
      clearInterval(interval);
    };
  }, [excalidrawAPI, isMounted, editingState, setEditingTextId]);

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

  // Live tracking of element properties and canvas state
  useEffect(() => {
    if (!excalidrawAPI || !editingState) return;

    const updateOverlayPosition = () => {
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
        const elementWidth = Math.max((currentElement.width || 200) * zoom, 100);
        const elementHeight = Math.max((currentElement.height || currentElement.fontSize || 20) * zoom, 24);
        
        // Check if any values have changed significantly
        const positionChanged = 
          Math.abs(elementX - editingState.position.x) > 1 ||
          Math.abs(elementY - editingState.position.y) > 1 ||
          Math.abs(elementWidth - editingState.size.width) > 1 ||
          Math.abs(elementHeight - editingState.size.height) > 1 ||
          Math.abs(zoom - editingState.zoom) > 0.01 ||
          currentElement.fontSize !== editingState.element.fontSize;
        
        if (positionChanged) {
          console.log('📍 Updating overlay position:', {
            x: elementX,
            y: elementY,
            width: elementWidth,
            height: elementHeight,
            fontSize: currentElement.fontSize,
            zoom
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

    // High-frequency updates for smooth tracking during interactions
    const interval = setInterval(updateOverlayPosition, 16); // ~60fps
    
    // Also update on window resize
    const handleResize = () => updateOverlayPosition();
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [excalidrawAPI, editingState]);

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

  // Calculate pixel-perfect positioning to match Excalidraw text
  const overlayStyle: React.CSSProperties = {
    position: 'fixed', // Use fixed positioning for precise alignment
    left: position.x,
    top: position.y,
    width: Math.max(size.width, 100), // Minimum width for editing
    minHeight: size.height,
    fontSize: element.fontSize || 20, // Use actual fontSize, not scaled
    fontFamily: element.fontFamily || 'Arial, sans-serif',
    color: element.strokeColor || '#000000',
    fontWeight: element.fontWeight || 'normal',
    fontStyle: element.fontStyle || 'normal',
    textAlign: element.textAlign || 'left',
    lineHeight: '1.2',
    padding: '2px',
    border: '1px dashed #3B82F6',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 10000,
    outline: 'none',
    overflow: 'visible', // Allow text to expand
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    transform: transform.rotation ? `rotate(${transform.rotation}rad) scale(${transform.scale})` : `scale(${transform.scale})`,
    transformOrigin: 'top left',
    pointerEvents: 'auto',
    cursor: 'text',
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