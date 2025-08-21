export const WORKSPACE_DEFAULTS = {
  layoutPreset: "default" as const,
  orientation: "portrait" as const,
  frame: { maxWidth: 980 },
  tools: ["select","pencil","text","eraser"] as const,
  zoom: 1,
  pageSize: { w: 850, h: 1100 }, // logical units
};
