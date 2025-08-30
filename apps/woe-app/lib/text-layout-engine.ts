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
  let lineRuns: RunLayout[] = [];
  let lineWidth = 0;
  let lineTop = 0;
  let lineHeightPx = 0;
  let lineIndex = 0;

  for (let runIndex = 0; runIndex < richText.runs.length; runIndex++) {
    const run = richText.runs[runIndex];
    if (!run.text) continue;

    const parts = run.text.split('\n');
    for (let partIndex = 0; partIndex < parts.length; partIndex++) {
      const part = parts[partIndex];

      if (partIndex > 0) {
        if (lineRuns.length > 0) {
          lines.push(this.finalizeLine(
            lineRuns,
            lineTop,
            lineIndex,
            Number.isFinite(maxWidth) ? maxWidth : undefined
          ));
          lineTop += lineHeightPx;
          lineIndex++;
        }
        lineRuns = [];
        lineWidth = 0;
        lineHeightPx = 0;
      }

      if (part.length === 0) continue;

      const words = part.split(/(\s+)/);
      let currentWord = '';

      for (const word of words) {
        const testText = currentWord + word;
        const runWithText = { ...run, text: testText };
        const metrics = this.measureRun(runWithText);
        const fontSize = run.marks.fontSize || 16;
        const lh = run.marks.lineHeight ?? lineHeight;
        const runHeight = lh * fontSize;

        if (lineWidth + metrics.width > maxWidth && lineRuns.length > 0) {
          if (currentWord) {
            const finalRun = { ...run, text: currentWord };
            const finalMetrics = this.measureRun(finalRun);
            const baseline =
              (runHeight - (finalMetrics.ascent + finalMetrics.descent)) / 2 +
              finalMetrics.ascent;
            lineRuns.push({
              run: finalRun,
              x: lineWidth,
              y: lineTop,
              width: finalMetrics.width,
              height: runHeight,
              baseline,
              lineIndex,
              runIndex,
            });
            lineWidth += finalMetrics.width;
          }

          lines.push(this.finalizeLine(
            lineRuns,
            lineTop,
            lineIndex,
            Number.isFinite(maxWidth) ? maxWidth : undefined
          ));
          lineTop += lineHeightPx;
          lineIndex++;
          lineRuns = [];
          lineWidth = 0;
          lineHeightPx = 0;
          currentWord = word.trim();
        } else {
          currentWord = testText;
        }

        lineHeightPx = Math.max(lineHeightPx, runHeight);
      }

      if (currentWord) {
        const finalRun = { ...run, text: currentWord };
        const finalMetrics = this.measureRun(finalRun);
        const fontSize = run.marks.fontSize || 16;
        const lh = run.marks.lineHeight ?? lineHeight;
        const runHeight = lh * fontSize;
        const baseline =
          (runHeight - (finalMetrics.ascent + finalMetrics.descent)) / 2 +
          finalMetrics.ascent;
        lineRuns.push({
          run: finalRun,
          x: lineWidth,
          y: lineTop,
          width: finalMetrics.width,
          height: runHeight,
          baseline,
          lineIndex,
          runIndex,
        });
        lineWidth += finalMetrics.width;
        lineHeightPx = Math.max(lineHeightPx, runHeight);
      }
    }
  }

  if (lineRuns.length > 0) {
    lines.push(this.finalizeLine(
      lineRuns,
      lineTop,
      lineIndex,
      Number.isFinite(maxWidth) ? maxWidth : undefined
    ));
    lineTop += lineHeightPx;
  }

  const totalWidth = lines.reduce((max, line) => Math.max(max, line.width), 0);
  const totalHeight = lineTop;

  return {
    lines,
    totalWidth,
    totalHeight,
    version: richText.version,
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

  if (!this.ctx) {
    this.initializeCanvas();
  }

  const fontSize = run.marks.fontSize || 16;

  if (!this.ctx) {
    const approximateWidth = run.text.length * fontSize * 0.6;
    const metrics: TextMetrics = {
      width: approximateWidth,
      height: fontSize * 1.2,
      ascent: fontSize * 0.8,
      descent: fontSize * 0.2,
    };
    return metrics;
  }

  this.ctx.font = this.getCanvasFont(run.marks);

  const textMetrics = this.ctx.measureText(run.text);

  const letterSpacing = run.marks.letterSpacing || 0;
  const metrics: TextMetrics = {
    width: textMetrics.width + letterSpacing * Math.max(0, run.text.length - 1),
    height: fontSize * (run.marks.lineHeight || 1.2),
    ascent: textMetrics.actualBoundingBoxAscent || fontSize * 0.8,
    descent: textMetrics.actualBoundingBoxDescent || fontSize * 0.2,
  };

  this.measurementCache[cacheKey] = metrics;
  return metrics;
}

/**
 * Render a laid out text block centered at the given position.
 *
 * The function assumes the element's local origin is the center of the
 * text block. It draws an optional background rectangle using the layout's
 * measured width/height plus padding and then renders each run using
 * `textAlign="center"` and `textBaseline="middle"`.
 */
renderTextLayout(
  ctx: CanvasRenderingContext2D,
  layout: TextLayout,
  offsetX: number = 0,
  offsetY: number = 0,
  options: {
    selection?: { start: number; end: number };
    backgroundColor?: string;
    padding?: number;
    backgroundOpacity?: number;
    containerWidth?: number;
  } = {}
): void {
  const { selection, backgroundColor, padding = 0, backgroundOpacity = 1, containerWidth } = options;

  const width = containerWidth ?? layout.totalWidth;
  const height = layout.totalHeight;

  const originX = offsetX - width / 2;
  const originY = offsetY - height / 2;

  if (backgroundColor && backgroundColor !== 'transparent') {
    ctx.save();
    const prevAlpha = ctx.globalAlpha;
    ctx.globalAlpha = backgroundOpacity;
    ctx.fillStyle = backgroundColor;
    const rectX = Math.round(originX - padding);
    const rectY = Math.round(originY - padding);
    const rectW = Math.round(width + padding * 2) + 1;
    const rectH = Math.round(height + padding * 2) + 1;
    ctx.fillRect(rectX, rectY, rectW, rectH);
    ctx.globalAlpha = prevAlpha;
    ctx.restore();
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let charPosition = 0;

  for (const line of layout.lines) {
    for (const runLayout of line.runs) {
      const { run, x, y, baseline } = runLayout;

      ctx.font = this.getCanvasFont(run.marks);
      ctx.fillStyle = run.marks.color || '#000000';

      if (selection) {
        const runStart = charPosition;
        const runEnd = charPosition + run.text.length;

        if (selection.start < runEnd && selection.end > runStart) {
          const selStart = Math.max(0, selection.start - runStart);
          const selEnd = Math.min(run.text.length, selection.end - runStart);

          if (selStart < selEnd) {
            const beforeText = run.text.substring(0, selStart);
            const selectedText = run.text.substring(selStart, selEnd);

            const ls = run.marks.letterSpacing || 0;
            const beforeWidth = beforeText
              ? ctx.measureText(beforeText).width + ls * Math.max(0, beforeText.length - 1)
              : 0;
            const selectedWidth =
              ctx.measureText(selectedText).width + ls * Math.max(0, selectedText.length - 1);

            ctx.fillStyle = '#3B82F6';
            ctx.fillRect(
              originX + x + beforeWidth,
              originY + y,
              selectedWidth,
              runLayout.height
            );
            ctx.fillStyle = run.marks.color || '#000000';
          }
        }
      }

      if (run.marks.bold) {
        ctx.font = ctx.font.replace('normal', 'bold');
      }

      const runCenterX = originX + x + runLayout.width / 2;
      const runCenterY = originY + y + runLayout.height / 2;

      if (run.marks.letterSpacing) {
        let cursorX = originX + x;
        for (const ch of run.text) {
          const chWidth = ctx.measureText(ch).width;
          ctx.fillText(ch, cursorX + chWidth / 2, runCenterY);
          cursorX += chWidth + run.marks.letterSpacing;
        }
      } else {
        ctx.fillText(run.text, runCenterX, runCenterY);
      }

      if (run.marks.underline) {
        ctx.strokeStyle = run.marks.color || '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const baseY = originY + y + baseline;
        ctx.moveTo(originX + x, baseY + 2);
        ctx.lineTo(originX + x + runLayout.width, baseY + 2);
        ctx.stroke();
      }

      if (run.marks.strikethrough) {
        ctx.strokeStyle = run.marks.color || '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const baseY = originY + y + baseline;
        const strikeY = baseY - runLayout.height * 0.3;
        ctx.moveTo(originX + x, strikeY);
        ctx.lineTo(originX + x + runLayout.width, strikeY);
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

private finalizeLine(
  runs: RunLayout[],
  y: number,
  lineIndex: number,
  containerWidth?: number
): LineLayout {
  const width = runs.reduce((sum, run) => sum + run.width, 0);
  const height = runs.reduce((max, run) => Math.max(max, run.height), 0);
  const baseline = runs.reduce((max, run) => Math.max(max, run.baseline), 0);
  const offsetX = containerWidth !== undefined ? (containerWidth - width) / 2 : 0;

  for (const run of runs) {
    run.x += offsetX;
    run.y = y;
    run.lineIndex = lineIndex;
  }

  return {
    runs,
    x: offsetX,
    y,
    width,
    height,
    baseline,
    lineIndex,
  };
}

private getRunCacheKey(run: TextRun): string {
  const marks = run.marks;
  const weight = marks.fontWeight || (marks.bold ? 'bold' : 'normal');
  const italic = marks.italic ? 'italic' : 'normal';
  const ls = marks.letterSpacing || 0;
  const lh = marks.lineHeight || 1.2;
  return `${run.text}|${marks.fontSize || 16}|${marks.fontFamily || 'Arial'}|${weight}|${italic}|ls:${ls}|lh:${lh}|v${this.cacheVersion}`;
}

private getCanvasFont(marks: TextMarks): string {
  const fontSize = marks.fontSize || 16;
  const fontFamily = marks.fontFamily || 'Arial, sans-serif';
  const weight = marks.fontWeight || (marks.bold ? 'bold' : 'normal');
  const style = marks.italic ? 'italic' : 'normal';
  return `${style} ${weight} ${fontSize}px ${fontFamily}`;
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