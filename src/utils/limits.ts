export const MAX_CANVAS_EDGE_PX = 4096;   // conservative, well under FF/Chrome limits
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 3.0;

export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
export const clampZoom = (z?: number) => clamp(z ?? 1, MIN_ZOOM, MAX_ZOOM);
