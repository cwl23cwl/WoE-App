/**
 * Rich Text HTML Utilities
 * Handles selection-aware style application and HTML normalization
 */

export interface TextStyle {
  fontSize?: number;
  color?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  fontFamily?: string;
}

export interface SelectionInfo {
  start: number;
  end: number;
  collapsed: boolean;
  selectedText: string;
}

export class RichTextHTML {
  /**
   * Apply styles to current selection or whole content
   */
  static applyStylesToSelection(
    element: HTMLElement,
    styles: TextStyle,
    selection?: Selection
  ): void {
    if (!selection || selection.isCollapsed) {
      // No selection - apply to whole element
      console.log('📝 Applying styles to whole element:', styles);
      this.applyStylesToElement(element, styles);
    } else {
      // Apply styles to selection only
      console.log('📝 Applying styles to selection:', {
        styles,
        selectedText: selection.toString()
      });
      this.applyStylesToRange(selection, styles);
    }
    
    // Normalize HTML after applying styles
    this.normalizeHTML(element);
  }

  /**
   * Apply styles to entire element
   */
  private static applyStylesToElement(element: HTMLElement, styles: TextStyle): void {
    Object.entries(styles).forEach(([key, value]) => {
      if (value !== undefined) {
        const cssKey = this.toCSSProperty(key);
        element.style.setProperty(cssKey, String(value));
      }
    });
  }

  /**
   * Apply styles to selected range using spans
   */
  private static applyStylesToRange(selection: Selection, styles: TextStyle): void {
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    // Create a span with the new styles
    const span = document.createElement('span');
    Object.entries(styles).forEach(([key, value]) => {
      if (value !== undefined) {
        const cssKey = this.toCSSProperty(key);
        span.style.setProperty(cssKey, String(value));
      }
    });

    try {
      // Surround the selection with the styled span
      range.surroundContents(span);
      
      // Clear selection to prevent further operations
      selection.removeAllRanges();
      
      console.log('✅ Applied styles to range successfully');
    } catch (error) {
      // Fallback: extract contents and wrap
      console.log('📝 Using fallback styling method');
      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);
      selection.removeAllRanges();
    }
  }

  /**
   * Normalize HTML by merging adjacent spans and removing empty ones
   */
  static normalizeHTML(element: HTMLElement): void {
    console.log('🔧 Normalizing HTML...');
    
    // Remove empty spans
    this.removeEmptySpans(element);
    
    // Merge adjacent spans with identical styles
    this.mergeAdjacentSpans(element);
    
    console.log('✅ HTML normalized');
  }

  /**
   * Remove empty spans
   */
  private static removeEmptySpans(element: HTMLElement): void {
    const emptySpans = element.querySelectorAll('span:empty');
    emptySpans.forEach(span => span.remove());
  }

  /**
   * Merge adjacent spans with identical styles
   */
  private static mergeAdjacentSpans(element: HTMLElement): void {
    const spans = Array.from(element.querySelectorAll('span'));
    
    for (let i = 0; i < spans.length - 1; i++) {
      const current = spans[i];
      const next = spans[i + 1];
      
      if (this.areAdjacentSiblings(current, next) && this.haveSameStyles(current, next)) {
        // Merge next into current
        while (next.firstChild) {
          current.appendChild(next.firstChild);
        }
        next.remove();
        
        // Update the array to reflect the change
        spans.splice(i + 1, 1);
        i--; // Recheck the current span with the new next span
      }
    }
  }

  /**
   * Check if two elements are adjacent siblings
   */
  private static areAdjacentSiblings(el1: Element, el2: Element): boolean {
    return el1.nextSibling === el2;
  }

  /**
   * Check if two spans have the same computed styles
   */
  private static haveSameStyles(span1: HTMLSpanElement, span2: HTMLSpanElement): boolean {
    const style1 = span1.style;
    const style2 = span2.style;
    
    if (style1.length !== style2.length) return false;
    
    for (let i = 0; i < style1.length; i++) {
      const prop = style1[i];
      if (style1.getPropertyValue(prop) !== style2.getPropertyValue(prop)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get current selection info
   */
  static getSelectionInfo(element: HTMLElement): SelectionInfo | null {
    const selection = window.getSelection();
    
    if (!selection || selection.rangeCount === 0) {
      return null;
    }
    
    const range = selection.getRangeAt(0);
    
    // Check if selection is within our element
    if (!element.contains(range.commonAncestorContainer)) {
      return null;
    }
    
    const textContent = element.textContent || '';
    const selectedText = selection.toString();
    
    // Calculate text offsets
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(element);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    const end = start + selectedText.length;
    
    return {
      start,
      end,
      collapsed: selection.isCollapsed,
      selectedText
    };
  }

  /**
   * Get styles at current cursor position
   */
  static getStylesAtCursor(element: HTMLElement): TextStyle {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return this.getElementStyles(element);
    }
    
    const range = selection.getRangeAt(0);
    let targetNode: Node | null = range.startContainer;
    
    // Find the closest element node
    while (targetNode && targetNode.nodeType === Node.TEXT_NODE) {
      targetNode = targetNode.parentNode;
    }
    
    if (targetNode && targetNode instanceof HTMLElement) {
      return this.getElementStyles(targetNode);
    }
    
    return this.getElementStyles(element);
  }

  /**
   * Extract styles from element
   */
  private static getElementStyles(element: HTMLElement): TextStyle {
    const computed = window.getComputedStyle(element);
    
    return {
      fontSize: parseInt(computed.fontSize) || undefined,
      color: computed.color || undefined,
      fontWeight: computed.fontWeight as 'normal' | 'bold' || undefined,
      fontStyle: computed.fontStyle as 'normal' | 'italic' || undefined,
      textDecoration: computed.textDecoration.includes('underline') ? 'underline' : 'none',
      fontFamily: computed.fontFamily || undefined
    };
  }

  /**
   * Convert camelCase to CSS property
   */
  private static toCSSProperty(camelCase: string): string {
    return camelCase.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  /**
   * Convert HTML to plain text
   */
  static htmlToPlainText(html: string): string {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  }

  /**
   * Serialize HTML to a structured format for persistence
   */
  static serializeHTML(element: HTMLElement): any {
    return {
      html: element.innerHTML,
      text: element.textContent || '',
      timestamp: Date.now()
    };
  }

  /**
   * Check if content has rich formatting
   */
  static hasRichFormatting(element: HTMLElement): boolean {
    return element.children.length > 0 || element.innerHTML !== element.textContent;
  }
}