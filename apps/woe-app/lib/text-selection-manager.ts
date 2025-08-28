/**
 * Text Selection State Manager
 * 
 * Maintains robust selection state for rich text editing
 * Handles cursor position, text selection ranges, and selection stability
 */

export interface SelectionRange {
  start: number;
  end: number;
  direction: 'forward' | 'backward' | 'none';
}

export interface SelectionState {
  elementId: string;
  range: SelectionRange | null;
  isCollapsed: boolean;
  anchorOffset: number;
  focusOffset: number;
  lastUpdate: number;
}

export class TextSelectionManager {
  private selectionState: Map<string, SelectionState> = new Map();
  private activeElementId: string | null = null;
  private selectionCheckInterval: NodeJS.Timeout | null = null;
  private observers: ((elementId: string, selection: SelectionState | null) => void)[] = [];

  /**
   * Start monitoring selection for a text element
   */
  startMonitoring(elementId: string): void {
    this.activeElementId = elementId;
    
    if (this.selectionCheckInterval) {
      clearInterval(this.selectionCheckInterval);
    }
    
    // Check selection every 50ms for responsiveness
    this.selectionCheckInterval = setInterval(() => {
      this.updateSelection();
    }, 50);
    
    // Initial selection check
    this.updateSelection();
  }

  /**
   * Stop monitoring selection
   */
  stopMonitoring(): void {
    if (this.selectionCheckInterval) {
      clearInterval(this.selectionCheckInterval);
      this.selectionCheckInterval = null;
    }
    
    this.activeElementId = null;
  }

  /**
   * Get current selection for an element
   */
  getSelection(elementId: string): SelectionState | null {
    return this.selectionState.get(elementId) || null;
  }

  /**
   * Set selection programmatically
   */
  setSelection(elementId: string, range: SelectionRange): void {
    const now = Date.now();
    const selectionState: SelectionState = {
      elementId,
      range,
      isCollapsed: range.start === range.end,
      anchorOffset: range.direction === 'backward' ? range.end : range.start,
      focusOffset: range.direction === 'backward' ? range.start : range.end,
      lastUpdate: now
    };
    
    this.selectionState.set(elementId, selectionState);
    this.notifyObservers(elementId, selectionState);
    
    // Apply selection to DOM if this is the active element
    if (elementId === this.activeElementId) {
      this.applySelectionToDOM(range);
    }
  }

  /**
   * Clear selection for an element
   */
  clearSelection(elementId: string): void {
    this.selectionState.delete(elementId);
    this.notifyObservers(elementId, null);
  }

  /**
   * Subscribe to selection changes
   */
  subscribe(callback: (elementId: string, selection: SelectionState | null) => void): () => void {
    this.observers.push(callback);
    
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  /**
   * Update selection from DOM
   */
  private updateSelection(): void {
    if (!this.activeElementId) return;
    
    try {
      const domSelection = this.getDOMSelection();
      
      if (domSelection) {
        const now = Date.now();
        const existing = this.selectionState.get(this.activeElementId);
        
        // Only update if selection has changed
        if (!existing || 
            existing.range?.start !== domSelection.start || 
            existing.range?.end !== domSelection.end ||
            now - existing.lastUpdate > 100) {
          
          const selectionState: SelectionState = {
            elementId: this.activeElementId,
            range: domSelection,
            isCollapsed: domSelection.start === domSelection.end,
            anchorOffset: domSelection.direction === 'backward' ? domSelection.end : domSelection.start,
            focusOffset: domSelection.direction === 'backward' ? domSelection.start : domSelection.end,
            lastUpdate: now
          };
          
          this.selectionState.set(this.activeElementId, selectionState);
          this.notifyObservers(this.activeElementId, selectionState);
        }
      } else {
        // No selection
        const existing = this.selectionState.get(this.activeElementId);
        if (existing) {
          this.clearSelection(this.activeElementId);
        }
      }
    } catch (error) {
      console.warn('Error updating text selection:', error);
    }
  }

  /**
   * Get selection from DOM (textarea or contenteditable)
   */
  private getDOMSelection(): SelectionRange | null {
    const selection = window.getSelection();
    const activeElement = document.activeElement;
    
    // Handle textarea
    if (activeElement && activeElement.tagName === 'TEXTAREA') {
      const textarea = activeElement as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const direction = textarea.selectionDirection === 'backward' ? 'backward' : 'forward';
      
      return { start, end, direction };
    }
    
    // Handle contenteditable
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      
      // Find the text content and calculate offsets
      const textContent = container.textContent || '';
      const start = this.getTextOffset(container, range.startContainer, range.startOffset);
      const end = this.getTextOffset(container, range.endContainer, range.endOffset);
      
      if (start !== null && end !== null) {
        const direction = start > end ? 'backward' : (start < end ? 'forward' : 'none');
        return { 
          start: Math.min(start, end), 
          end: Math.max(start, end), 
          direction 
        };
      }
    }
    
    return null;
  }

  /**
   * Apply selection to DOM
   */
  private applySelectionToDOM(range: SelectionRange): void {
    try {
      const activeElement = document.activeElement;
      
      // Handle textarea
      if (activeElement && activeElement.tagName === 'TEXTAREA') {
        const textarea = activeElement as HTMLTextAreaElement;
        textarea.setSelectionRange(range.start, range.end, range.direction);
        return;
      }
      
      // Handle contenteditable (more complex - would need actual DOM nodes)
      // For now, we'll rely on the existing Excalidraw text editing
      
    } catch (error) {
      console.warn('Error applying selection to DOM:', error);
    }
  }

  /**
   * Calculate text offset within a container
   */
  private getTextOffset(container: Node, targetNode: Node, offset: number): number | null {
    let textOffset = 0;
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let node = walker.nextNode();
    while (node) {
      if (node === targetNode) {
        return textOffset + offset;
      }
      
      textOffset += node.textContent?.length || 0;
      node = walker.nextNode();
    }
    
    return null;
  }

  /**
   * Notify observers of selection changes
   */
  private notifyObservers(elementId: string, selection: SelectionState | null): void {
    this.observers.forEach(callback => {
      try {
        callback(elementId, selection);
      } catch (error) {
        console.error('Error in selection observer:', error);
      }
    });
  }

  /**
   * Get human-readable selection info
   */
  getSelectionInfo(elementId: string): string {
    const selection = this.getSelection(elementId);
    
    if (!selection || !selection.range) {
      return 'No selection';
    }
    
    if (selection.isCollapsed) {
      return `Cursor at ${selection.range.start}`;
    }
    
    const length = selection.range.end - selection.range.start;
    return `${length} char${length === 1 ? '' : 's'} selected`;
  }

  /**
   * Check if a position is within current selection
   */
  isPositionSelected(elementId: string, position: number): boolean {
    const selection = this.getSelection(elementId);
    
    if (!selection || !selection.range || selection.isCollapsed) {
      return false;
    }
    
    return position >= selection.range.start && position < selection.range.end;
  }

  /**
   * Expand selection to word boundaries
   */
  expandToWordBoundaries(elementId: string, text: string): SelectionRange | null {
    const selection = this.getSelection(elementId);
    
    if (!selection || !selection.range) {
      return null;
    }
    
    const { start, end } = selection.range;
    
    // Find word start
    let wordStart = start;
    while (wordStart > 0 && /\w/.test(text[wordStart - 1])) {
      wordStart--;
    }
    
    // Find word end
    let wordEnd = end;
    while (wordEnd < text.length && /\w/.test(text[wordEnd])) {
      wordEnd++;
    }
    
    return {
      start: wordStart,
      end: wordEnd,
      direction: 'forward'
    };
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stopMonitoring();
    this.selectionState.clear();
    this.observers.length = 0;
  }
}