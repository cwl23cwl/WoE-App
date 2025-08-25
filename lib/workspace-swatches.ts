// lib/workspace-swatches.ts
export type ColorSwatch = { name: string; hex: string };

// Pen / free-draw colors (opaque)
export const PEN_SWATCHES: ColorSwatch[] = [
  { name: "Primary", hex: "#EC5D3A" },   // var(--primary)
  { name: "Primary 600", hex: "#EB5733" },// var(--primary-600)
  { name: "Accent", hex: "#FFD166" },    // var(--accent)
  { name: "Teal", hex: "#3AAFA9" },      // var(--support-teal)
  { name: "Navy", hex: "#1B2A49" },      // var(--support-navy)
  { name: "Gray 700", hex: "#6B7280" },  // var(--neutral-700)
  { name: "Black", hex: "#111827" },
  { name: "White", hex: "#FFFFFF" },
  // add any others you want visible in the row
];

// Text colors (solid)
export const TEXT_SWATCHES: ColorSwatch[] = [
  { name: "Text", hex: "#111827" },      // var(--text)
  { name: "Primary", hex: "#EC5D3A" },
  { name: "Accent", hex: "#FFD166" },
  { name: "Teal", hex: "#3AAFA9" },
  { name: "Navy", hex: "#1B2A49" },
  { name: "Gray 700", hex: "#6B7280" },
  { name: "White", hex: "#FFFFFF" },
];

// Highlighter colors (will render slightly translucent in the toolbar)
export const HIGHLIGHTER_SWATCHES: ColorSwatch[] = [
  { name: "Yellow HL", hex: "#FFF176" },
  { name: "Green HL", hex: "#A5D6A7" },
  { name: "Blue HL",  hex: "#90CAF9" },
  { name: "Pink HL",  hex: "#F48FB1" },
  { name: "Orange HL",hex: "#FFCC80" },
];
