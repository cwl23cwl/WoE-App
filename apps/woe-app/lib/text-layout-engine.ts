/**
 * Text Layout Engine
 * 
 * Handles text measurement, line wrapping, and rendering for rich text with runs
 * Optimized with caching and invalidation strategies
 */

import { RichTextDocument, TextRun, TextMarks } from './rich-text-types';

export interface TextMetrics {
  width: number;
  height: number;
  ascent: number;
  descent: number;
}

export interface RunLayout {
  run: TextRun;
  x: number;
  y: number;
  width: number;
  height: number;
  baseline: number;
  lineIndex: number;
  runIndex: number;
}

export interface LineLayout {
  runs: RunLayout[];
  x: number;
  y: number;
  width: number;
  height: number;
  baseline: number;
  lineIndex: number;
}

export interface TextLayout {
  lines: LineLayout[];
  totalWidth: number;
  totalHeight: number;
  version: number;
}

interface MeasurementCache {
  [key: string]: TextMetrics;
}

export class TextLayoutEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private measurementCache: MeasurementCache = {};
  private cacheVersion = 0;

  constructor() {
    // Lazy initialization for SSR compatibility
    this.initializeCanvas();
  }

  private initializeCanvas() {
    if (typeof window === 'undefined') return; // Skip on server
    
    try {
      // Create offscreen canvas for text measurement
      this.canvas = document.createElement('canvas');
      this.canvas.width = 1;
      this.canvas.height = 1;
      this.ctx = this.canvas.getContext('2d');
    } catch (error) {
      console.warn('Failed to initialize text layout canvas:', error);
    }
  }

  /**
   * Layout rich text document within given constraints
   */
  layoutText(
    richText: RichTextDocument, 
    maxWidth: number, 
    lineHeight: number = 1.2
  ): TextLayout {
    const lines: LineLayout[] = [];
    let currentLine: RunLayout[] = [];
    let lineWidth = 0;
    let lineY = 0;
    let lineIndex = 0;

    // Process each run
    for (let runIndex = 0; runIndex < richText.runs.length; runIndex++) {
      const run = richText.runs[runIndex];
      
      if (!run.text) continue;

      // Handle line breaks in text
      const textParts = run.text.split('\n');
      
      for (let partIndex = 0; partIndex < textParts.length; partIndex++) {
        const text = textParts[partIndex];
        
        if (partIndex > 0) {
          // New line - finish current line and start new one
          if (currentLine.length > 0) {
            lines.push(this.finalizeLine(currentLine, lineY, lineIndex, lineHeight));
            lineIndex++;
          }
          currentLine = [];
          lineWidth = 0;
          lineY = lines.length * lineHeight * this.getLineHeight(run.marks);
        }

        if (text.length === 0) continue;

        // Word wrap handling
        const words = text.split(/(\s+)/);
        let currentWord = '';
        
        for (const word of words) {
          const testText = currentWord + word;
          const runWithText = { ...run, text: testText };
          const metrics = this.measureRun(runWithText);
          
          if (lineWidth + metrics.width > maxWidth && currentLine.length > 0) {
            // Word wrap - finish current line
            if (currentWord) {
              const finalRun = { ...run, text: currentWord };
              const finalMetrics = this.measureRun(finalRun);
              currentLine.push({
                run: finalRun,
                x: lineWidth,
                y: lineY,
                width: finalMetrics.width,
                height: finalMetrics.height,
                baseline: finalMetrics.ascent,
                lineIndex,
                runIndex
              });
            }
            
            lines.push(this.finalizeLine(currentLine, lineY, lineIndex, lineHeight));
            lineIndex++;
            currentLine = [];
            lineWidth = 0;
            lineY = lines.length * lineHeight * this.getLineHeight(run.marks);
            currentWord = word.trim();
          } else {
            currentWord = testText;
          }
        }
        
        // Add remaining text to current line
        if (currentWord) {
          const finalRun = { ...run, text: currentWord };
          const finalMetrics = this.measureRun(finalRun);
          currentLine.push({
            run: finalRun,
            x: lineWidth,
            y: lineY,
            width: finalMetrics.width,
            height: finalMetrics.height,
            baseline: finalMetrics.ascent,
            lineIndex,
            runIndex
          });
          lineWidth += finalMetrics.width;
        }
      }
    }

    // Finish last line
    if (currentLine.length > 0) {
      lines.push(this.finalizeLine(currentLine, lineY, lineIndex, lineHeight));
    }

    // Calculate total dimensions
    const totalWidth = lines.reduce((max, line) => Math.max(max, line.width), 0);
    const totalHeight = lines.length > 0 ? 
      lines[lines.length - 1].y + lines[lines.length - 1].height : 0;

    return {
      lines,
      totalWidth,
      totalHeight,
      version: richText.version
    };
  }

  /**
   * Measure a single text run
   */
  measureRun(run: TextRun): TextMetrics {
    const cacheKey = this.getRunCacheKey(run);
    
    if (this.measurementCache[cacheKey]) {
      return this.measurementCache[cacheKey];
    }

    // Ensure canvas is initialized
    if (!this.ctx) {
      this.initializeCanvas();
    }

    const fontSize = run.marks.fontSize || 16;
    
    // Fallback metrics if canvas not available
    if (!this.ctx) {
      const approximateWidth = run.text.length * fontSize * 0.6; // Rough approximation
      const metrics: TextMetrics = {
        width: approximateWidth,
        height: fontSize * 1.2,
        ascent: fontSize * 0.8,
        descent: fontSize * 0.2
      };
      return metrics;
    }

    // Set canvas font
    this.ctx.font = this.getCanvasFont(run.marks);
    
    // Measure text
    const textMetrics = this.ctx.measureText(run.text);
    
    const metrics: TextMetrics = {
      width: textMetrics.width,
      height: fontSize * 1.2, // Approximate line height
      ascent: textMetrics.actualBoundingBoxAscent || fontSize * 0.8,
      descent: textMetrics.actualBoundingBoxDescent || fontSize * 0.2
    };

    // Cache the result
    this.measurementCache[cacheKey] = metrics;
    
    return metrics;
  }

  /**
   * Render text layout to canvas context
   */
  renderTextLayout(
    ctx: CanvasRenderingContext2D,
    layout: TextLayout,
    offsetX: number = 0,
    offsetY: number = 0,
    selection?: { start: number; end: number }
  ): void {
    let charPosition = 0;
    
    for (const line of layout.lines) {
      for (const runLayout of line.runs) {
        const { run, x, y, baseline } = runLayout;
        
        // Set text styling
        ctx.font = this.getCanvasFont(run.marks);
        ctx.fillStyle = run.marks.color || '#000000';
        ctx.textBaseline = 'alphabetic';

        // Handle selection highlighting
        if (selection) {
          const runStart = charPosition;
          const runEnd = charPosition + run.text.length;
          
          if (selection.start < runEnd && selection.end > runStart) {
            // Measure partial text for selection highlighting
            const selStart = Math.max(0, selection.start - runStart);
            const selEnd = Math.min(run.text.length, selection.end - runStart);
            
            if (selStart < selEnd) {
              const beforeText = run.text.substring(0, selStart);
              const selectedText = run.text.substring(selStart, selEnd);
              
              const beforeWidth = beforeText ? ctx.measureText(beforeText).width : 0;
              const selectedWidth = ctx.measureText(selectedText).width;
              
              // Draw selection background
              ctx.fillStyle = '#3B82F6'; // Blue selection
              ctx.fillRect(
                offsetX + x + beforeWidth,
                offsetY + y,
                selectedWidth,
                runLayout.height
              );
            }
          }
        }

        // Draw text
        ctx.fillStyle = run.marks.color || '#000000';
        
        // Handle text styling
        if (run.marks.bold) {
          ctx.font = ctx.font.replace('normal', 'bold');
        }
        
        ctx.fillText(run.text, offsetX + x, offsetY + y + baseline);
        
        // Handle underline
        if (run.marks.underline) {
          ctx.strokeStyle = run.marks.color || '#000000';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(offsetX + x, offsetY + y + baseline + 2);
          ctx.lineTo(offsetX + x + runLayout.width, offsetY + y + baseline + 2);
          ctx.stroke();
        }
        
        // Handle strikethrough
        if (run.marks.strikethrough) {
          ctx.strokeStyle = run.marks.color || '#000000';
          ctx.lineWidth = 1;
          ctx.beginPath();
          const strikeY = offsetY + y + baseline - (runLayout.height * 0.3);
          ctx.moveTo(offsetX + x, strikeY);
          ctx.lineTo(offsetX + x + runLayout.width, strikeY);
          ctx.stroke();
        }
        
        charPosition += run.text.length;
      }
    }
  }

  /**
   * Get character position from pixel coordinates
   */
  getCharacterFromPosition(layout: TextLayout, x: number, y: number): number {
    let charPosition = 0;
    
    for (const line of layout.lines) {
      if (y >= line.y && y < line.y + line.height) {
        // Found the correct line
        for (const runLayout of line.runs) {
          if (x >= runLayout.x && x < runLayout.x + runLayout.width) {
            // Found the correct run
            return charPosition + this.getCharacterWithinRun(runLayout.run, x - runLayout.x);
          }
          charPosition += runLayout.run.text.length;
        }
        // Past end of line
        return charPosition;
      }
      
      // Add all characters in this line
      for (const runLayout of line.runs) {
        charPosition += runLayout.run.text.length;
      }
    }
    
    return charPosition;
  }

  /**
   * Get pixel position from character index
   */
  getPositionFromCharacter(layout: TextLayout, charIndex: number): { x: number; y: number } | null {
    let charPosition = 0;
    
    for (const line of layout.lines) {
      for (const runLayout of line.runs) {
        const runEnd = charPosition + runLayout.run.text.length;
        
        if (charIndex >= charPosition && charIndex <= runEnd) {
          const offsetInRun = charIndex - charPosition;
          const partialText = runLayout.run.text.substring(0, offsetInRun);
          
          // Measure partial text width
          if (!this.ctx) {
            this.initializeCanvas();
          }
          
          let partialWidth = 0;
          if (this.ctx && partialText) {
            this.ctx.font = this.getCanvasFont(runLayout.run.marks);
            partialWidth = this.ctx.measureText(partialText).width;
          } else if (partialText) {
            // Fallback approximation
            const fontSize = runLayout.run.marks.fontSize || 16;
            partialWidth = partialText.length * fontSize * 0.6;
          }
          
          return {
            x: runLayout.x + partialWidth,
            y: runLayout.y + runLayout.baseline
          };
        }
        
        charPosition = runEnd;
      }
    }
    
    return null;
  }

  /**
   * Invalidate measurement cache
   */
  invalidateCache(): void {
    this.measurementCache = {};
    this.cacheVersion++;
  }

  /**
   * Invalidate cache for specific font properties
   */
  invalidateCacheForMarks(marks: Partial<TextMarks>): void {
    const keys = Object.keys(this.measurementCache);
    
    for (const key of keys) {
      if (this.cacheKeyMatchesMarks(key, marks)) {
        delete this.measurementCache[key];
      }
    }
  }

  // Private helper methods

  private finalizeLine(runs: RunLayout[], y: number, lineIndex: number, lineHeight: number): LineLayout {
    const width = runs.reduce((sum, run) => sum + run.width, 0);
    const height = runs.reduce((max, run) => Math.max(max, run.height), lineHeight);
    const baseline = runs.reduce((max, run) => Math.max(max, run.baseline), height * 0.8);
    
    return {
      runs,
      x: 0,
      y,
      width,
      height,
      baseline,
      lineIndex
    };
  }

  private getRunCacheKey(run: TextRun): string {
    const marks = run.marks;
    return `${run.text}|${marks.fontSize || 16}|${marks.fontFamily || 'Arial'}|${marks.bold ? 'b' : ''}|${marks.italic ? 'i' : ''}|v${this.cacheVersion}`;
  }

  private getCanvasFont(marks: TextMarks): string {
    const fontSize = marks.fontSize || 16;
    const fontFamily = marks.fontFamily || 'Arial, sans-serif';
    const weight = marks.bold ? 'bold' : 'normal';
    const style = marks.italic ? 'italic' : 'normal';
    
    return `${style} ${weight} ${fontSize}px ${fontFamily}`;
  }

  private getLineHeight(marks: TextMarks): number {
    return (marks.fontSize || 16) * 1.2;
  }

  private getCharacterWithinRun(run: TextRun, x: number): number {
    if (!this.ctx) {
      this.initializeCanvas();
    }
    
    if (!this.ctx) {
      // Fallback: rough approximation
      const fontSize = run.marks.fontSize || 16;
      const charWidth = fontSize * 0.6;
      return Math.min(run.text.length, Math.floor(x / charWidth));
    }
    
    this.ctx.font = this.getCanvasFont(run.marks);
    
    for (let i = 0; i <= run.text.length; i++) {
      const partialText = run.text.substring(0, i);
      const width = partialText ? this.ctx.measureText(partialText).width : 0;
      
      if (width >= x) {
        return Math.max(0, i - 1);
      }
    }
    
    return run.text.length;
  }

  private cacheKeyMatchesMarks(cacheKey: string, marks: Partial<TextMarks>): boolean {
    // Simple implementation - could be more sophisticated
    return Object.keys(marks).some(key => cacheKey.includes(String(marks[key as keyof TextMarks])));
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.measurementCache = {};
  }
}