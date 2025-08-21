'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RichTextDocument, TextMarks, TextSelection, RichTextUtils } from '@/lib/rich-text-types';
import { TextSelectionManager, SelectionState } from '@/lib/text-selection-manager';
import { TextLayoutEngine } from '@/lib/text-layout-engine';
import { InlineTextToolbar } from './InlineTextToolbar';
import { useEditingTextStore } from '@/stores/editingTextStore';

interface RichTextManagerProps {
  /** Excalidraw API instance */
  excalidrawAPI: any;
  /** Whether the component is mounted */
  isMounted: boolean;
}

interface EditingTextState {
  elementId: string;
  richText: RichTextDocument;
  selection: TextSelection | null;
  position: { x: number; y: number } | null;
  defaultMarks: TextMarks;
}

export function RichTextManager({ excalidrawAPI, isMounted }: RichTextManagerProps) {
  const [editingText, setEditingText] = useState<EditingTextState | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const { setEditingTextId } = useEditingTextStore();
  const selectionManager = useRef<TextSelectionManager>(new TextSelectionManager());
  const layoutEngine = useRef<TextLayoutEngine>(new TextLayoutEngine());
  const undoHistoryRef = useRef<RichTextDocument[]>([]);
  const redoHistoryRef = useRef<RichTextDocument[]>([]);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectionCheckRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor for text editing state
  useEffect(() => {
    if (!excalidrawAPI || !isMounted) return;

    const checkTextEditing = () => {
      try {
        const appState = excalidrawAPI.getAppState();
        const elements = excalidrawAPI.getSceneElements();
        
        if (appState.editingElement) {
          const editingElement = elements.find((el: any) => el.id === appState.editingElement);
          
          if (editingElement && editingElement.type === 'text') {
            // Text element is being edited
            const elementBounds = excalidrawAPI.getSceneElementsIncludingDeleted()
              .find((el: any) => el.id === editingElement.id);
            
            if (elementBounds) {
              // Convert current text to rich text if needed
              const richText = editingElement.richText || 
                RichTextUtils.fromPlainText(editingElement.text || '', {
                  fontSize: editingElement.fontSize || 16,
                  fontFamily: editingElement.fontFamily || 'Arial',
                  color: editingElement.strokeColor || '#000000'
                });

              console.log('📝 Text editing detected:', {
                elementId: editingElement.id,
                text: editingElement.text,
                hasRichText: !!editingElement.richText,
                richTextRuns: richText.runs.length,
                plainText: RichTextUtils.toPlainText(richText)
              });

              const position = {
                x: elementBounds.x,
                y: elementBounds.y
              };

              setEditingText({
                elementId: editingElement.id,
                richText,
                selection: getTextSelection(),
                position,
                defaultMarks: {
                  fontSize: editingElement.fontSize || 16,
                  fontFamily: editingElement.fontFamily || 'Arial',
                  color: editingElement.strokeColor || '#000000'
                }
              });

              // Set global editing state
              setEditingTextId(editingElement.id);

              // Check for text selection periodically
              if (selectionCheckRef.current) {
                clearInterval(selectionCheckRef.current);
              }
              
              selectionCheckRef.current = setInterval(() => {
                const newSelection = getTextSelection();
                setEditingText(prev => prev ? {
                  ...prev,
                  selection: newSelection
                } : null);
              }, 100);

            } else {
              setEditingText(null);
              setShowToolbar(false);
              setEditingTextId(null);
            }
          } else {
            setEditingText(null);
            setShowToolbar(false);
            setEditingTextId(null);
          }
        } else {
          setEditingText(null);
          setShowToolbar(false);
          setEditingTextId(null);
          
          if (selectionCheckRef.current) {
            clearInterval(selectionCheckRef.current);
            selectionCheckRef.current = null;
          }
        }
      } catch (error) {
        console.error('Error checking text editing state:', error);
      }
    };

    // Check immediately and then periodically
    checkTextEditing();
    const interval = setInterval(checkTextEditing, 200);

    return () => {
      clearInterval(interval);
      if (selectionCheckRef.current) {
        clearInterval(selectionCheckRef.current);
      }
    };
  }, [excalidrawAPI, isMounted]);

  // Get current text selection from DOM
  const getTextSelection = (): TextSelection | null => {
    try {
      const activeElement = document.activeElement;

      // Handle textarea (Excalidraw text editing)
      if (activeElement && activeElement.tagName === 'TEXTAREA') {
        const textarea = activeElement as HTMLTextAreaElement;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const direction = textarea.selectionDirection === 'backward' ? 'backward' : 'forward';
        
        return { start, end, direction };
      }

      // Handle contenteditable or other selection types
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Try to get text offsets relative to the text content
        let start = 0;
        let end = 0;
        
        try {
          const textContent = range.commonAncestorContainer.textContent || '';
          start = range.startOffset;
          end = range.endOffset;
          
          // If start > end, swap them
          if (start > end) {
            [start, end] = [end, start];
          }
          
          return {
            start,
            end,
            direction: start === end ? 'none' : 'forward'
          };
        } catch (err) {
          // Fallback: assume cursor at end
          return { start: 0, end: 0, direction: 'none' };
        }
      }

      // No selection detected - assume cursor at end of text
      return { start: 0, end: 0, direction: 'none' };
    } catch (error) {
      console.warn('Error getting text selection:', error);
      return { start: 0, end: 0, direction: 'none' };
    }
  };

  // Show toolbar for text selection or cursor positioning
  const handleShowToolbar = useCallback(() => {
    if (editingText) {
      setShowToolbar(true);
    }
  }, [editingText]);

  // Handle keyboard shortcut to show toolbar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show toolbar with Ctrl/Cmd + Shift + T
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        handleShowToolbar();
      }
      
      // Show toolbar when selecting text with shift + arrow keys
      if (e.shiftKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        setTimeout(handleShowToolbar, 50);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleShowToolbar]);

  // Handle mouse selection
  useEffect(() => {
    const handleMouseUp = () => {
      if (editingText) {
        const selection = getTextSelection();
        if (selection && selection.start !== selection.end) {
          setTimeout(handleShowToolbar, 50);
        }
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [editingText, handleShowToolbar]);

  // Save current state to undo history
  const saveToUndoHistory = useCallback((richText: RichTextDocument) => {
    undoHistoryRef.current.push(richText);
    // Limit undo history to last 50 operations
    if (undoHistoryRef.current.length > 50) {
      undoHistoryRef.current.shift();
    }
    // Clear redo history when making new changes
    redoHistoryRef.current = [];
  }, []);

  // Debounced autosave
  const scheduleAutosave = useCallback((newRichText: RichTextDocument) => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    
    autosaveTimeoutRef.current = setTimeout(() => {
      if (excalidrawAPI && editingText) {
        try {
          const elements = excalidrawAPI.getSceneElements();
          const updatedElements = elements.map((el: any) => {
            if (el.id === editingText.elementId) {
              return {
                ...el,
                richText: newRichText,
                text: RichTextUtils.toPlainText(newRichText) // Fallback plain text
              };
            }
            return el;
          });

          excalidrawAPI.updateScene({ elements: updatedElements });
          console.log('📝 Rich text auto-saved');
        } catch (error) {
          console.error('Error in autosave:', error);
        }
      }
    }, 800); // 800ms debounce
  }, [excalidrawAPI, editingText]);

  // Apply rich text changes to Excalidraw element
  const updateElementRichText = useCallback((newRichText: RichTextDocument, immediate: boolean = false) => {
    if (!excalidrawAPI || !editingText) return;

    try {
      // Save current state for undo
      saveToUndoHistory(editingText.richText);
      
      setEditingText(prev => prev ? {
        ...prev,
        richText: newRichText
      } : null);

      if (immediate) {
        // Immediate update (for undo/redo)
        const elements = excalidrawAPI.getSceneElements();
        const updatedElements = elements.map((el: any) => {
          if (el.id === editingText.elementId) {
            return {
              ...el,
              richText: newRichText,
              text: RichTextUtils.toPlainText(newRichText)
            };
          }
          return el;
        });

        excalidrawAPI.updateScene({ elements: updatedElements });
      } else {
        // Debounced autosave
        scheduleAutosave(newRichText);
      }
    } catch (error) {
      console.error('Error updating rich text:', error);
    }
  }, [excalidrawAPI, editingText, saveToUndoHistory, scheduleAutosave]);

  // Apply marks to current selection or cursor position
  const applyMarks = useCallback((marks: Partial<TextMarks>) => {
    if (!editingText) return;

    const { selection, richText } = editingText;
    const plainText = RichTextUtils.toPlainText(richText);
    
    console.log('🎨 applyMarks called:', {
      marks,
      selection,
      richTextRuns: richText.runs.length,
      plainText,
      hasSelection: selection && selection.start !== selection.end
    });
    
    if (!selection || selection.start === selection.end) {
      // UX Rule: No selection → apply to whole text box
      const hasContent = richText.runs.length > 0 && richText.runs.some(run => run.text.length > 0);
      
      console.log('📝 No selection detected, hasContent:', hasContent);
      
      if (!hasContent) {
        // No content yet - just update default marks for future typing
        console.log('📝 No content - updating default marks only');
        setEditingText(prev => prev ? {
          ...prev,
          defaultMarks: { ...prev.defaultMarks, ...marks }
        } : null);
      } else {
        // Apply to entire text content (whole text box styling)
        console.log('📝 Applying to whole text content');
        const updatedRichText = RichTextUtils.applyMarks(
          richText,
          0,
          plainText.length,
          marks
        );
        
        console.log('📝 Updated rich text (whole):', {
          originalRuns: richText.runs.length,
          updatedRuns: updatedRichText.runs.length,
          mergedContent: RichTextUtils.toPlainText(updatedRichText)
        });
        
        updateElementRichText(RichTextUtils.normalize(updatedRichText));
        
        // Also update default marks for future typing
        setEditingText(prev => prev ? {
          ...prev,
          defaultMarks: { ...prev.defaultMarks, ...marks }
        } : null);
      }
    } else {
      // UX Rule: Selection exists → apply to selection only
      console.log('📝 Applying to selected range:', selection.start, 'to', selection.end);
      console.log('📝 Selected text:', plainText.substring(selection.start, selection.end));
      
      const updatedRichText = RichTextUtils.applyMarks(
        richText,
        selection.start,
        selection.end,
        marks
      );
      
      console.log('📝 Updated rich text (selection):', {
        originalRuns: richText.runs.length,
        updatedRuns: updatedRichText.runs.length,
        selectionLength: selection.end - selection.start,
        mergedContent: RichTextUtils.toPlainText(updatedRichText)
      });
      
      updateElementRichText(RichTextUtils.normalize(updatedRichText));
      
      // Preserve selection after applying marks
      setEditingText(prev => prev ? {
        ...prev,
        richText: updatedRichText,
        selection: selection // Keep selection intact
      } : null);
    }
  }, [editingText, updateElementRichText]);

  // Get current marks at cursor/selection
  const getCurrentMarks = useCallback((): TextMarks => {
    if (!editingText) return {};

    const { selection, richText, defaultMarks } = editingText;
    
    if (!selection || selection.start === selection.end) {
      // No selection - use default marks
      return defaultMarks;
    } else {
      // Get marks at selection start
      return RichTextUtils.getMarksAtPosition(richText, selection.start);
    }
  }, [editingText]);

  // Toolbar event handlers
  const handleFontSizeChange = useCallback((fontSize: number) => {
    applyMarks({ fontSize });
  }, [applyMarks]);

  const handleColorChange = useCallback((color: string) => {
    applyMarks({ color });
  }, [applyMarks]);

  const handleBoldToggle = useCallback(() => {
    const currentMarks = getCurrentMarks();
    applyMarks({ bold: !currentMarks.bold });
  }, [applyMarks, getCurrentMarks]);

  const handleItalicToggle = useCallback(() => {
    const currentMarks = getCurrentMarks();
    applyMarks({ italic: !currentMarks.italic });
  }, [applyMarks, getCurrentMarks]);

  const handleUnderlineToggle = useCallback(() => {
    const currentMarks = getCurrentMarks();
    applyMarks({ underline: !currentMarks.underline });
  }, [applyMarks, getCurrentMarks]);

  const handleFontFamilyChange = useCallback((fontFamily: string) => {
    applyMarks({ fontFamily });
  }, [applyMarks]);

  const handleCloseToolbar = useCallback(() => {
    setShowToolbar(false);
  }, []);

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    if (!editingText || undoHistoryRef.current.length === 0) return;
    
    const previousState = undoHistoryRef.current.pop()!;
    redoHistoryRef.current.push(editingText.richText);
    
    updateElementRichText(previousState, true);
  }, [editingText, updateElementRichText]);

  const handleRedo = useCallback(() => {
    if (!editingText || redoHistoryRef.current.length === 0) return;
    
    const nextState = redoHistoryRef.current.pop()!;
    undoHistoryRef.current.push(editingText.richText);
    
    updateElementRichText(nextState, true);
  }, [editingText, updateElementRichText]);

  // Handle keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editingText) return;
      
      const isCmdCtrl = e.metaKey || e.ctrlKey;
      
      if (isCmdCtrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (isCmdCtrl && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingText, handleUndo, handleRedo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      selectionManager.current.dispose();
      layoutEngine.current.dispose();
      
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  if (!editingText) {
    return null;
  }

  return (
    <InlineTextToolbar
      elementId={editingText.elementId}
      selection={editingText.selection}
      currentMarks={getCurrentMarks()}
      position={editingText.position}
      visible={showToolbar}
      onFontSizeChange={handleFontSizeChange}
      onColorChange={handleColorChange}
      onBoldToggle={handleBoldToggle}
      onItalicToggle={handleItalicToggle}
      onUnderlineToggle={handleUnderlineToggle}
      onFontFamilyChange={handleFontFamilyChange}
      onClose={handleCloseToolbar}
    />
  );
}