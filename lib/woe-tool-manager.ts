/**
 * WoE Tool Management System
 * 
 * Simplifies tool state management and provides clean integration
 * between WoE APP's toolbar and Excalidraw canvas.
 */

export type WoeToolType = 'select' | 'draw' | 'text' | 'erase' | 'highlighter'

export interface WoeToolPrefs {
  // Draw tool
  drawColor: string
  drawSize: number
  
  // Text tool  
  textColor: string
  textSize: number
  textFamily: string
  
  // Highlighter tool
  highlighterColor: string
  highlighterOpacity: number
  highlighterSize: number
  
  // Background and border colors (independent)
  backgroundColor: string
  borderColor: string
  borderWidth: number
}

export const DEFAULT_TOOL_PREFS: WoeToolPrefs = {
  drawColor: '#000000',
  drawSize: 4,
  textColor: '#000000', 
  textSize: 24,
  textFamily: '"Times New Roman", Georgia, serif',
  highlighterColor: '#FACC15',
  highlighterOpacity: 0.3,
  highlighterSize: 12,
  backgroundColor: 'transparent',
  borderColor: '#000000',
  borderWidth: 1,
}

/**
 * WoE Tool Manager
 * Centralizes tool state and provides clean API for tool switching
 */
export class WoeToolManager {
  private activeTool: WoeToolType = 'select'
  private toolPrefs: WoeToolPrefs = { ...DEFAULT_TOOL_PREFS }
  private listeners: Array<(tool: WoeToolType) => void> = []
  
  // Tool change listeners
  onToolChange(listener: (tool: WoeToolType) => void) {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) this.listeners.splice(index, 1)
    }
  }
  
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.activeTool))
  }
  
  // Tool management
  setActiveTool(tool: WoeToolType) {
    if (this.activeTool !== tool) {
      this.activeTool = tool
      this.notifyListeners()
    }
  }
  
  getActiveTool(): WoeToolType {
    return this.activeTool
  }
  
  // Tool preferences
  updateToolPrefs(updates: Partial<WoeToolPrefs>) {
    this.toolPrefs = { ...this.toolPrefs, ...updates }
  }
  
  getToolPrefs(): WoeToolPrefs {
    return { ...this.toolPrefs }
  }
  
  // Specific tool preference getters
  getDrawPrefs() {
    return {
      color: this.toolPrefs.drawColor,
      size: this.toolPrefs.drawSize,
    }
  }
  
  getTextPrefs() {
    return {
      color: this.toolPrefs.textColor,
      size: this.toolPrefs.textSize,
      family: this.toolPrefs.textFamily,
    }
  }
  
  getHighlighterPrefs() {
    return {
      color: this.toolPrefs.highlighterColor,
      opacity: this.toolPrefs.highlighterOpacity,
      size: this.toolPrefs.highlighterSize,
    }
  }
  
  // Color system - independent text and border colors
  setTextColor(color: string) {
    this.toolPrefs.textColor = color
  }
  
  setBorderColor(color: string) {
    this.toolPrefs.borderColor = color
  }
  
  setBackgroundColor(color: string) {
    this.toolPrefs.backgroundColor = color
  }
  
  // Reset tool (for text tool multiple usage)
  resetTextTool() {
    if (this.activeTool === 'text') {
      // Trigger re-initialization of text tool
      this.notifyListeners()
    }
  }
}

// Singleton instance for global tool management
let globalToolManager: WoeToolManager | null = null

export function getWoeToolManager(): WoeToolManager {
  if (!globalToolManager) {
    globalToolManager = new WoeToolManager()
  }
  return globalToolManager
}

// Utility functions
export const WoeToolUtils = {
  isDrawingTool: (tool: WoeToolType) => ['draw', 'highlighter'].includes(tool),
  isSelectionTool: (tool: WoeToolType) => tool === 'select',
  isTextTool: (tool: WoeToolType) => tool === 'text',
  isEraseTool: (tool: WoeToolType) => tool === 'erase',
  
  getToolDisplayName: (tool: WoeToolType) => {
    const names: Record<WoeToolType, string> = {
      select: 'Select',
      draw: 'Draw', 
      text: 'Text',
      erase: 'Erase',
      highlighter: 'Highlight',
    }
    return names[tool]
  },
}