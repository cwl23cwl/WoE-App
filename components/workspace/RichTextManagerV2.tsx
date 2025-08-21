'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RichTextOverlay } from './RichTextOverlay';
import { RichTextHTML, TextStyle, SelectionInfo } from '@/lib/rich-text-html';
import { InlineTextToolbar } from './InlineTextToolbar';
import { useEditingTextStore } from '@/stores/editingTextStore';

interface RichTextManagerV2Props {
  /** Excalidraw API instance */
  excalidrawAPI: any;
  /** Whether the component is mounted */
  isMounted: boolean;
}

interface EditingState {
  elementId: string;
  element: any;
  overlayContent: string;
  selection: SelectionInfo | null;
  currentStyles: TextStyle;
  showToolbar: boolean;
}

export function RichTextManagerV2({ excalidrawAPI, isMounted }: RichTextManagerV2Props) {
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const overlayElementRef = useRef<HTMLElement | null>(null);
  const { editingTextId, setEditingTextId } = useEditingTextStore();
  const commitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle overlay content changes
  const handleContentChange = useCallback((html: string, textContent: string) => {
    if (!editingState) return;

    console.log('📝 Overlay content updated:', {
      textLength: textContent.length,
      hasHTML: html !== textContent
    });

    setEditingState(prev => prev ? {
      ...prev,
      overlayContent: html
    } : null);

    // Debounced commit to Excalidraw
    if (commitTimeoutRef.current) {
      clearTimeout(commitTimeoutRef.current);
    }

    commitTimeoutRef.current = setTimeout(() => {
      commitToExcalidraw(html, textContent);
    }, 500);
  }, [editingState]);

  // Handle selection changes in overlay
  const handleSelectionChange = useCallback((selection: Selection | null) => {
    if (!editingState || !overlayElementRef.current) return;

    const selectionInfo = selection ? RichTextHTML.getSelectionInfo(overlayElementRef.current) : null;
    const currentStyles = selection ? RichTextHTML.getStylesAtCursor(overlayElementRef.current) : {};

    console.log('📝 Selection changed:', {
      hasSelection: !!selectionInfo,
      collapsed: selectionInfo?.collapsed,
      selectedText: selectionInfo?.selectedText
    });

    setEditingState(prev => prev ? {
      ...prev,
      selection: selectionInfo,
      currentStyles,
      showToolbar: !!(selectionInfo && !selectionInfo.collapsed) || !!editingTextId
    } : null);
  }, [editingState, editingTextId]);

  // Commit changes to Excalidraw element
  const commitToExcalidraw = useCallback((html: string, textContent: string) => {
    if (!excalidrawAPI || !editingState) return;

    try {
      const elements = excalidrawAPI.getSceneElements();
      const updatedElements = elements.map((el: any) => {
        if (el.id === editingState.elementId) {
          return {
            ...el,
            text: textContent, // Fallback plain text
            richText: RichTextHTML.hasRichFormatting(overlayElementRef.current!) ? 
              RichTextHTML.serializeHTML(overlayElementRef.current!) : undefined
          };
        }
        return el;
      });

      excalidrawAPI.updateScene({ 
        elements: updatedElements,
        commitToHistory: false // Don't spam undo history during typing
      });

      console.log('📝 Rich text committed to Excalidraw');
    } catch (error) {
      console.error('Error committing rich text:', error);
    }
  }, [excalidrawAPI, editingState]);

  // Monitor for editing state from overlay
  useEffect(() => {
    if (!excalidrawAPI || !isMounted) return;

    const checkEditingState = () => {
      const appState = excalidrawAPI.getAppState();
      const elements = excalidrawAPI.getSceneElements();
      
      if (appState.editingElement) {
        const editingElement = elements.find((el: any) => el.id === appState.editingElement);
        
        if (editingElement && editingElement.type === 'text') {
          if (!editingState || editingState.elementId !== editingElement.id) {
            console.log('📝 Starting rich text editing for element:', editingElement.id);
            
            setEditingState({
              elementId: editingElement.id,
              element: editingElement,
              overlayContent: editingElement.text || '',
              selection: null,
              currentStyles: {
                fontSize: editingElement.fontSize,
                color: editingElement.strokeColor,
                fontFamily: editingElement.fontFamily
              },
              showToolbar: false
            });
          } else {
            // Update existing editing state with current element properties
            const stylesChanged = 
              editingState.currentStyles.fontSize !== editingElement.fontSize ||
              editingState.currentStyles.color !== editingElement.strokeColor ||
              editingState.currentStyles.fontFamily !== editingElement.fontFamily;
            
            if (stylesChanged) {
              console.log('📝 Updating editing state styles:', {
                oldFontSize: editingState.currentStyles.fontSize,
                newFontSize: editingElement.fontSize
              });
              
              setEditingState(prev => prev ? {
                ...prev,
                element: editingElement,
                currentStyles: {
                  fontSize: editingElement.fontSize,
                  color: editingElement.strokeColor,
                  fontFamily: editingElement.fontFamily
                }
              } : null);
              
              // Update overlay style immediately if it exists
              if (overlayElementRef.current) {
                const overlay = overlayElementRef.current;
                overlay.style.fontSize = `${editingElement.fontSize}px`;
                overlay.style.color = editingElement.strokeColor || '#000000';
                overlay.style.fontFamily = editingElement.fontFamily || 'Arial, sans-serif';
              }
            }
          }
          return;
        }
      }
      
      // No longer editing
      if (editingState) {
        console.log('📝 Stopping rich text editing');
        
        // Final commit before closing
        if (overlayElementRef.current) {
          const html = overlayElementRef.current.innerHTML;
          const text = overlayElementRef.current.textContent || '';
          commitToExcalidraw(html, text);
        }
        
        setEditingState(null);
        setEditingTextId(null);
      }
    };

    const interval = setInterval(checkEditingState, 50); // Faster updates for style sync
    return () => clearInterval(interval);
  }, [excalidrawAPI, isMounted, editingState, commitToExcalidraw, setEditingTextId]);

  // Store reference to overlay element
  const handleOverlayRef = useCallback((element: HTMLElement | null) => {
    overlayElementRef.current = element;
  }, []);

  // Sync overlay styles immediately when editing state changes
  useEffect(() => {
    if (!editingState || !overlayElementRef.current) return;

    const overlay = overlayElementRef.current;
    const { currentStyles, element } = editingState;

    // Apply current styles to overlay with fallbacks from element
    const fontSize = currentStyles.fontSize || element.fontSize || 20;
    const color = currentStyles.color || element.strokeColor || '#000000';
    const fontFamily = currentStyles.fontFamily || element.fontFamily || 'Arial, sans-serif';

    overlay.style.fontSize = `${fontSize}px`;
    overlay.style.color = color;
    overlay.style.fontFamily = fontFamily;
    
    // Ensure overlay stays in sync with element properties
    overlay.style.fontWeight = element.fontWeight || 'normal';
    overlay.style.fontStyle = element.fontStyle || 'normal';
    overlay.style.textAlign = element.textAlign || 'left';
    
    console.log('🎨 Synced overlay styles with element:', {
      fontSize,
      color,
      fontFamily,
      elementProps: {
        fontSize: element.fontSize,
        strokeColor: element.strokeColor,
        fontFamily: element.fontFamily
      }
    });
  }, [editingState?.currentStyles, editingState?.element]);

  // Style application handlers
  const applyStyles = useCallback((styles: TextStyle) => {
    if (!editingState || !overlayElementRef.current) return;

    console.log('🎨 Applying styles:', styles);

    const selection = window.getSelection();
    RichTextHTML.applyStylesToSelection(overlayElementRef.current, styles, selection || undefined);

    // Update current styles in state
    const newStyles = RichTextHTML.getStylesAtCursor(overlayElementRef.current);
    setEditingState(prev => prev ? {
      ...prev,
      currentStyles: newStyles,
      overlayContent: overlayElementRef.current!.innerHTML
    } : null);

    // Immediate commit for style changes
    const html = overlayElementRef.current.innerHTML;
    const text = overlayElementRef.current.textContent || '';
    commitToExcalidraw(html, text);
  }, [editingState, commitToExcalidraw]);

  // Individual style handlers
  const handleFontSizeChange = useCallback((fontSize: number) => {
    // Update overlay immediately for instant feedback
    if (overlayElementRef.current) {
      overlayElementRef.current.style.fontSize = `${fontSize}px`;
      console.log('🎨 RichText overlay font size updated immediately:', fontSize);
    }
    
    // Also apply through normal style system
    applyStyles({ fontSize });
  }, [applyStyles]);

  const handleColorChange = useCallback((color: string) => {
    applyStyles({ color });
  }, [applyStyles]);

  const handleBoldToggle = useCallback(() => {
    const currentWeight = editingState?.currentStyles.fontWeight;
    applyStyles({ fontWeight: currentWeight === 'bold' ? 'normal' : 'bold' });
  }, [applyStyles, editingState?.currentStyles.fontWeight]);

  const handleItalicToggle = useCallback(() => {
    const currentStyle = editingState?.currentStyles.fontStyle;
    applyStyles({ fontStyle: currentStyle === 'italic' ? 'normal' : 'italic' });
  }, [applyStyles, editingState?.currentStyles.fontStyle]);

  const handleUnderlineToggle = useCallback(() => {
    const currentDecoration = editingState?.currentStyles.textDecoration;
    applyStyles({ textDecoration: currentDecoration === 'underline' ? 'none' : 'underline' });
  }, [applyStyles, editingState?.currentStyles.textDecoration]);

  const handleFontFamilyChange = useCallback((fontFamily: string) => {
    applyStyles({ fontFamily });
  }, [applyStyles]);

  if (!editingState) {
    return null;
  }

  return (
    <>
      {/* Rich Text Overlay - positioned over Excalidraw text */}
      <RichTextOverlay
        excalidrawAPI={excalidrawAPI}
        isMounted={isMounted}
        onContentChange={handleContentChange}
        onSelectionChange={handleSelectionChange}
        onRef={handleOverlayRef}
      />

      {/* Floating Toolbar - shown when text is selected or editing */}
      {editingState.showToolbar && (
        <InlineTextToolbar
          elementId={editingState.elementId}
          selection={editingState.selection ? {
            start: editingState.selection.start,
            end: editingState.selection.end,
            direction: 'forward'
          } : null}
          currentMarks={{
            fontSize: editingState.currentStyles.fontSize || 16,
            color: editingState.currentStyles.color || '#000000',
            fontFamily: editingState.currentStyles.fontFamily || 'Arial',
            bold: editingState.currentStyles.fontWeight === 'bold',
            italic: editingState.currentStyles.fontStyle === 'italic',
            underline: editingState.currentStyles.textDecoration === 'underline'
          }}
          position={{ x: 100, y: 50 }} // TODO: Calculate proper position
          visible={editingState.showToolbar}
          onFontSizeChange={handleFontSizeChange}
          onColorChange={handleColorChange}
          onBoldToggle={handleBoldToggle}
          onItalicToggle={handleItalicToggle}
          onUnderlineToggle={handleUnderlineToggle}
          onFontFamilyChange={handleFontFamilyChange}
          onClose={() => setEditingState(prev => prev ? { ...prev, showToolbar: false } : null)}
        />
      )}
    </>
  );
}