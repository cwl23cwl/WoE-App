/**
 * Color swatches for workspace drawing tools
 * Aligned with Write on English brand colors and Tailwind tokens
 */

export interface ColorSwatch {
  name: string
  hex: string
  category: 'primary' | 'secondary' | 'neutral' | 'accent' | 'semantic'
}

// Primary brand colors (main drawing colors)
export const PRIMARY_SWATCHES: ColorSwatch[] = [
  { name: 'Primary Red', hex: '#E55A3C', category: 'primary' },
  { name: 'Primary Light', hex: '#F47B5C', category: 'primary' },
  { name: 'Primary Dark', hex: '#C4472B', category: 'primary' },
  { name: 'Secondary Blue', hex: '#2E5A8A', category: 'primary' },
  { name: 'Secondary Light', hex: '#5B9BD5', category: 'primary' },
  { name: 'Accent Green', hex: '#7BA05B', category: 'primary' },
  { name: 'Accent Light', hex: '#A8C686', category: 'primary' },
]

// Essential colors for drawing
export const ESSENTIAL_SWATCHES: ColorSwatch[] = [
  { name: 'Black', hex: '#000000', category: 'neutral' },
  { name: 'Dark Gray', hex: '#374151', category: 'neutral' },
  { name: 'Medium Gray', hex: '#6B7280', category: 'neutral' },
  { name: 'Light Gray', hex: '#9CA3AF', category: 'neutral' },
  { name: 'White', hex: '#FFFFFF', category: 'neutral' },
]

// Semantic status colors
export const SEMANTIC_SWATCHES: ColorSwatch[] = [
  { name: 'Success', hex: '#7BA05B', category: 'semantic' },
  { name: 'Warning', hex: '#F59E0B', category: 'semantic' },
  { name: 'Error', hex: '#EF4444', category: 'semantic' },
  { name: 'Info', hex: '#5B9BD5', category: 'semantic' },
]

// Extended color palette for creativity
export const EXTENDED_SWATCHES: ColorSwatch[] = [
  // Warm colors
  { name: 'Deep Red', hex: '#DC2626', category: 'accent' },
  { name: 'Orange', hex: '#EA580C', category: 'accent' },
  { name: 'Yellow', hex: '#FACC15', category: 'accent' },
  { name: 'Amber', hex: '#F59E0B', category: 'accent' },
  
  // Cool colors
  { name: 'Purple', hex: '#9333EA', category: 'accent' },
  { name: 'Indigo', hex: '#4F46E5', category: 'accent' },
  { name: 'Teal', hex: '#0D9488', category: 'accent' },
  { name: 'Cyan', hex: '#0891B2', category: 'accent' },
  
  // Nature colors
  { name: 'Emerald', hex: '#059669', category: 'accent' },
  { name: 'Lime', hex: '#65A30D', category: 'accent' },
  { name: 'Pink', hex: '#EC4899', category: 'accent' },
  { name: 'Rose', hex: '#F43F5E', category: 'accent' },
]

// Combined swatch arrays for different UI contexts
export const PEN_SWATCHES = [
  ...PRIMARY_SWATCHES,
  ...ESSENTIAL_SWATCHES,
  ...EXTENDED_SWATCHES,
]

export const TEXT_SWATCHES = [
  ...ESSENTIAL_SWATCHES,
  ...PRIMARY_SWATCHES,
  ...SEMANTIC_SWATCHES,
]

export const HIGHLIGHTER_SWATCHES = [
  ...PRIMARY_SWATCHES,
  ...SEMANTIC_SWATCHES,
  ...EXTENDED_SWATCHES.slice(0, 8), // First 8 extended colors
]

// Default colors for different tools
export const DEFAULT_COLORS = {
  stroke: '#000000', // Black for pen/pencil
  text: '#374151',   // Dark gray for text
  fill: '#E55A3C',   // Brand primary for shapes
  highlighter: '#FACC15', // Yellow for highlighting
} as const

// Highlighter specific settings
export const HIGHLIGHTER_CONFIG = {
  opacity: 0.28,      // 28% opacity for highlighting effect
  blendMode: 'multiply' as const,
  defaultWidth: 8,
} as const

/**
 * Convert hex color to rgba with opacity
 */
export function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

/**
 * Get all swatches organized by category
 */
export function getSwatchesByCategory() {
  return {
    primary: PRIMARY_SWATCHES,
    essential: ESSENTIAL_SWATCHES,
    semantic: SEMANTIC_SWATCHES,
    extended: EXTENDED_SWATCHES,
  }
}

/**
 * Find a swatch by hex color
 */
export function findSwatchByHex(hex: string): ColorSwatch | undefined {
  const allSwatches = [...PEN_SWATCHES, ...TEXT_SWATCHES, ...HIGHLIGHTER_SWATCHES]
  return allSwatches.find(swatch => swatch.hex.toLowerCase() === hex.toLowerCase())
}
