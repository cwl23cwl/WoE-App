/**
 * Rich Text Support for Excalidraw Text Elements
 * 
 * Replaces simple string text with structured rich text document
 * made of spans/runs with individual styling.
 */

export interface TextMarks {
  fontSize?: number;
  fontFamily?: string;
  /** CSS font-weight value (e.g. '400', 'bold') */
  fontWeight?: string | number;
  /** additional spacing between letters in px */
  letterSpacing?: number;
  /** line-height multiplier applied to fontSize */
  lineHeight?: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
}

export interface TextRun {
  text: string;
  marks: TextMarks;
}

export interface RichTextDocument {
  runs: TextRun[];
  version: number; // For versioning/migration
}

export interface TextSelection {
  start: number; // Character position
  end: number;   // Character position  
  direction: 'forward' | 'backward' | 'none';
}

export interface TextElement {
  id: string;
  type: 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  // Rich text content
  richText: RichTextDocument;
  // Fallback for compatibility
  text: string; // Plain text representation
  // Default styling for new text
  defaultMarks: TextMarks;
  // Selection state
  selection?: TextSelection;
  isEditing: boolean;
}

/**
 * Utility functions for rich text manipulation
 */
export class RichTextUtils {
  /**
   * Convert rich text document to plain text string
   */
  static toPlainText(richText: RichTextDocument): string {
    return richText.runs.map(run => run.text).join('');
  }

  /**
   * Create rich text document from plain text with default marks
   */
  static fromPlainText(text: string, defaultMarks: TextMarks = {}): RichTextDocument {
    return {
      runs: text ? [{ text, marks: defaultMarks }] : [],
      version: 1
    };
  }

  /**
   * Insert text at position with given marks
   */
  static insertText(
    richText: RichTextDocument, 
    position: number, 
    text: string, 
    marks: TextMarks
  ): RichTextDocument {
    if (!text) return richText;
    
    let currentPos = 0;
    const newRuns: TextRun[] = [];
    let inserted = false;

    for (const run of richText.runs) {
      const runEnd = currentPos + run.text.length;
      
      if (!inserted && position <= currentPos) {
        // Insert before this run
        newRuns.push({ text, marks });
        newRuns.push(run);
        inserted = true;
      } else if (!inserted && position < runEnd) {
        // Insert within this run
        const offset = position - currentPos;
        const before = run.text.substring(0, offset);
        const after = run.text.substring(offset);
        
        if (before) newRuns.push({ text: before, marks: run.marks });
        newRuns.push({ text, marks });
        if (after) newRuns.push({ text: after, marks: run.marks });
        inserted = true;
      } else {
        // Keep existing run
        newRuns.push(run);
      }
      
      currentPos = runEnd;
    }

    // Insert at end if not yet inserted
    if (!inserted) {
      newRuns.push({ text, marks });
    }

    return {
      runs: newRuns,
      version: richText.version
    };
  }

  /**
   * Delete text in range
   */
  static deleteRange(
    richText: RichTextDocument, 
    start: number, 
    end: number
  ): RichTextDocument {
    if (start >= end) return richText;
    
    let currentPos = 0;
    const newRuns: TextRun[] = [];

    for (const run of richText.runs) {
      const runStart = currentPos;
      const runEnd = currentPos + run.text.length;
      
      if (runEnd <= start || runStart >= end) {
        // Run is outside deletion range
        newRuns.push(run);
      } else if (runStart >= start && runEnd <= end) {
        // Run is completely within deletion range - skip it
        continue;
      } else {
        // Run is partially within deletion range
        const deleteStart = Math.max(0, start - runStart);
        const deleteEnd = Math.min(run.text.length, end - runStart);
        
        const before = run.text.substring(0, deleteStart);
        const after = run.text.substring(deleteEnd);
        
        if (before) newRuns.push({ text: before, marks: run.marks });
        if (after) newRuns.push({ text: after, marks: run.marks });
      }
      
      currentPos = runEnd;
    }

    return {
      runs: newRuns,
      version: richText.version
    };
  }

  /**
   * Apply marks to text range
   */
  static applyMarks(
    richText: RichTextDocument, 
    start: number, 
    end: number, 
    marks: Partial<TextMarks>
  ): RichTextDocument {
    if (start >= end) return richText;
    
    let currentPos = 0;
    const newRuns: TextRun[] = [];

    for (const run of richText.runs) {
      const runStart = currentPos;
      const runEnd = currentPos + run.text.length;
      
      if (runEnd <= start || runStart >= end) {
        // Run is outside mark range
        newRuns.push(run);
      } else if (runStart >= start && runEnd <= end) {
        // Run is completely within mark range
        newRuns.push({
          text: run.text,
          marks: { ...run.marks, ...marks }
        });
      } else {
        // Run is partially within mark range
        const markStart = Math.max(0, start - runStart);
        const markEnd = Math.min(run.text.length, end - runStart);
        
        const before = run.text.substring(0, markStart);
        const marked = run.text.substring(markStart, markEnd);
        const after = run.text.substring(markEnd);
        
        if (before) newRuns.push({ text: before, marks: run.marks });
        if (marked) newRuns.push({ text: marked, marks: { ...run.marks, ...marks } });
        if (after) newRuns.push({ text: after, marks: run.marks });
      }
      
      currentPos = runEnd;
    }

    return {
      runs: this.mergeAdjacentRuns(newRuns),
      version: richText.version
    };
  }

  /**
   * Merge adjacent runs with identical marks to reduce fragmentation
   */
  static mergeAdjacentRuns(runs: TextRun[]): TextRun[] {
    if (runs.length <= 1) return runs;
    
    const merged: TextRun[] = [];
    let current = runs[0];
    
    for (let i = 1; i < runs.length; i++) {
      const next = runs[i];
      
      // Check if marks are identical
      if (this.areMarksEqual(current.marks, next.marks)) {
        // Merge with current run
        current = {
          text: current.text + next.text,
          marks: current.marks
        };
      } else {
        // Push current and start new run
        merged.push(current);
        current = next;
      }
    }
    
    // Don't forget the last run
    merged.push(current);
    
    return merged;
  }

  /**
   * Check if two marks objects are identical
   */
  static areMarksEqual(marks1: TextMarks, marks2: TextMarks): boolean {
    const keys1 = Object.keys(marks1);
    const keys2 = Object.keys(marks2);
    
    if (keys1.length !== keys2.length) return false;
    
    return keys1.every(key => marks1[key as keyof TextMarks] === marks2[key as keyof TextMarks]);
  }

  /**
   * Get marks at position (for cursor formatting)
   */
  static getMarksAtPosition(
    richText: RichTextDocument, 
    position: number
  ): TextMarks {
    let currentPos = 0;
    
    for (const run of richText.runs) {
      const runEnd = currentPos + run.text.length;
      
      if (position <= runEnd) {
        return run.marks;
      }
      
      currentPos = runEnd;
    }
    
    // Default marks if position is at end
    return richText.runs.length > 0 
      ? richText.runs[richText.runs.length - 1].marks 
      : {};
  }

  /**
   * Merge adjacent runs with identical marks
   */
  static normalize(richText: RichTextDocument): RichTextDocument {
    // First remove empty runs
    const nonEmptyRuns = richText.runs.filter(run => run.text.length > 0);
    
    if (nonEmptyRuns.length <= 1) return {
      runs: nonEmptyRuns,
      version: richText.version + 1
    };
    
    const newRuns: TextRun[] = [];
    let current = nonEmptyRuns[0];
    
    for (let i = 1; i < nonEmptyRuns.length; i++) {
      const next = nonEmptyRuns[i];
      
      if (this.areMarksEqual(current.marks, next.marks)) {
        // Merge with current
        current = {
          text: current.text + next.text,
          marks: current.marks
        };
      } else {
        // Push current and start new
        newRuns.push(current);
        current = next;
      }
    }
    
    newRuns.push(current);
    
    return {
      runs: newRuns,
      version: richText.version
    };
  }

}