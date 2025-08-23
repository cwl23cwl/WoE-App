/**
 * Color utility functions for the professional color picker
 */

// Convert hex to HSV color space
export function hexToHsv(hex: string): [number, number, number] {
  // Remove # if present
  const cleanHex = hex.replace('#', '')
  
  // Validate hex format
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    throw new Error('Invalid hex color format')
  }

  const r = parseInt(cleanHex.slice(0, 2), 16) / 255
  const g = parseInt(cleanHex.slice(2, 4), 16) / 255
  const b = parseInt(cleanHex.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min

  let h = 0
  if (diff !== 0) {
    switch (max) {
      case r: h = ((g - b) / diff) % 6; break
      case g: h = (b - r) / diff + 2; break
      case b: h = (r - g) / diff + 4; break
    }
  }
  h = Math.round(h * 60)
  if (h < 0) h += 360

  const s = max === 0 ? 0 : Math.round((diff / max) * 100)
  const v = Math.round(max * 100)

  return [h, s, v]
}

// Convert HSV to hex
export function hsvToHex(h: number, s: number, v: number): string {
  h = h / 360
  s = s / 100
  v = v / 100

  const c = v * s
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
  const m = v - c

  let r = 0, g = 0, b = 0
  if (h < 1/6) { r = c; g = x; b = 0 }
  else if (h < 2/6) { r = x; g = c; b = 0 }
  else if (h < 3/6) { r = 0; g = c; b = x }
  else if (h < 4/6) { r = 0; g = x; b = c }
  else if (h < 5/6) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }

  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Convert hex to RGB
export function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '')
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    throw new Error('Invalid hex color format')
  }
  
  const r = parseInt(cleanHex.slice(0, 2), 16)
  const g = parseInt(cleanHex.slice(2, 4), 16)
  const b = parseInt(cleanHex.slice(4, 6), 16)
  return [r, g, b]
}

// Convert hex to HSL
export function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex)
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  const diff = max - min

  let h = 0
  if (diff !== 0) {
    switch (max) {
      case rNorm: h = ((gNorm - bNorm) / diff) % 6; break
      case gNorm: h = (bNorm - rNorm) / diff + 2; break
      case bNorm: h = (rNorm - gNorm) / diff + 4; break
    }
  }
  h = Math.round(h * 60)
  if (h < 0) h += 360

  const l = Math.round(((max + min) / 2) * 100)
  const s = Math.round((diff === 0 ? 0 : diff / (1 - Math.abs(2 * (l / 100) - 1))) * 100)

  return [h, s, l]
}

// Convert RGB to hex
export function rgbToHex(r: number, g: number, b: number): string {
  const rHex = Math.round(r).toString(16).padStart(2, '0')
  const gHex = Math.round(g).toString(16).padStart(2, '0')
  const bHex = Math.round(b).toString(16).padStart(2, '0')
  return `#${rHex}${gHex}${bHex}`
}

// Validate hex color
export function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex)
}

// Get color brightness (for determining text color)
export function getColorBrightness(hex: string): number {
  try {
    const [r, g, b] = hexToRgb(hex)
    // Using relative luminance formula
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255
  } catch {
    return 0.5 // Default to medium brightness
  }
}

// Get contrasting text color (black or white)
export function getContrastingTextColor(backgroundColor: string): string {
  return getColorBrightness(backgroundColor) > 0.5 ? '#000000' : '#ffffff'
}

// Color harmony generators
export function generateComplementary(hex: string): string[] {
  try {
    const [h, s, v] = hexToHsv(hex)
    const complementary = (h + 180) % 360
    return [hsvToHex(complementary, s, v)]
  } catch {
    return []
  }
}

export function generateTriadic(hex: string): string[] {
  try {
    const [h, s, v] = hexToHsv(hex)
    return [
      hsvToHex((h + 120) % 360, s, v),
      hsvToHex((h + 240) % 360, s, v)
    ]
  } catch {
    return []
  }
}

export function generateAnalogous(hex: string): string[] {
  try {
    const [h, s, v] = hexToHsv(hex)
    return [
      hsvToHex((h + 30) % 360, s, v),
      hsvToHex((h - 30 + 360) % 360, s, v),
      hsvToHex((h + 60) % 360, s, v),
      hsvToHex((h - 60 + 360) % 360, s, v)
    ]
  } catch {
    return []
  }
}

export function generateMonochromatic(hex: string): string[] {
  try {
    const [h, s, v] = hexToHsv(hex)
    return [
      hsvToHex(h, s, Math.max(10, v - 30)),
      hsvToHex(h, s, Math.max(10, v - 15)),
      hsvToHex(h, s, Math.min(100, v + 15)),
      hsvToHex(h, s, Math.min(100, v + 30))
    ]
  } catch {
    return []
  }
}

// Enhanced preset colors with better variety and organization
export const COLOR_PRESETS = {
  // Brand colors (from your app)
  brand: [
    '#EC5D3A', // Primary (brand)
    '#FFD166', // Accent (brand) 
    '#3AAFA9', // Secondary Teal (brand)
    '#1B2A49', // Navy/Foreground (brand)
  ],
  
  // Essential colors
  essential: [
    '#000000', // Black
    '#FFFFFF', // White
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
  ],
  
  // Extended palette
  extended: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7',
    '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6'
  ]
}

// Get all presets as flat array
export function getAllPresets(): string[] {
  return [
    ...COLOR_PRESETS.brand,
    ...COLOR_PRESETS.essential,
    ...COLOR_PRESETS.extended
  ]
}