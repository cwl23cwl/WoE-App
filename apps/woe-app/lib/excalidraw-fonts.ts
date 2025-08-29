// lib/excalidraw-fonts.ts - Custom font configuration for Excalidraw
export const FONT_FAMILY = {
  Virgil: 1,
  Helvetica: 2,
  Cascadia: 3,
  "Comic Shanns": 4,
} as const;

// Override Excalidraw's font loading to use system fonts
export const getFontString = (fontFamily: number, fontSize: number) => {
  let font;
  switch (fontFamily) {
    case FONT_FAMILY.Virgil:
      font = '"Open Sans", "Segoe UI", Tahoma, sans-serif';
      break;
    case FONT_FAMILY.Helvetica:
      font = '"Open Sans", "Segoe UI", Tahoma, sans-serif';
      break;
    case FONT_FAMILY.Cascadia:
      font = '"Consolas", "Monaco", "Courier New", monospace';
      break;
    case FONT_FAMILY["Comic Shanns"]:
      font = '"Comic Sans MS", "Chalkboard SE", "Bradley Hand", cursive';
      break;
    default:
      font = '"Open Sans", "Segoe UI", Tahoma, sans-serif';
  }
  return `${fontSize}px ${font}`;
};

// Font face definitions using system fonts only
export const SYSTEM_FONTS = {
  1: '"Open Sans", "Segoe UI", Tahoma, sans-serif', // Virgil replacement
  2: '"Open Sans", "Segoe UI", Tahoma, sans-serif', // Helvetica replacement  
  3: '"Consolas", "Monaco", "Courier New", monospace', // Cascadia replacement
  4: '"Comic Sans MS", "Chalkboard SE", "Bradley Hand", cursive', // Comic Shanns replacement
} as const;