// apps/woe-app/app/draw/useOptionA.ts
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';

// Minimal element shapes (avoid relying on internal Excalidraw types)
type AnyEl = {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  isDeleted?: boolean;
  groupIds?: string[];
  frameId?: string | null;
  link?: string | null;
  backgroundColor?: string;
  fillStyle?: 'solid' | 'hachure' | 'cross-hatch';
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  roundness?: { type: number; value?: number };
  opacity?: number; // 0..100
  seed?: number;
  version?: number;
  versionNonce?: number;
  boundElements?: any[];
  updated?: number;
  strokeSharpness?: 'sharp' | 'round';
  customData?: Record<string, any>;
  [k: string]: any;
};

type TextEl = AnyEl & { type: 'text' };

type BgSettings = {
  enabled: boolean;
  padding: number;          // px
  radius: number;           // px
  bgColor: string;          // hex
  bgOpacity: number;        // 0..100
  strokeColor: string;      // hex
  strokeWidth: number;      // px
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  strokeOpacity: number;    // 0..100 (note: Excalidraw uses one opacity; we apply to bg rect)
};

const DEFAULTS: BgSettings = {
  enabled: true,
  padding: 8,
  radius: 8,
  bgColor: '#FFF4C2',
  bgOpacity: 80,
  strokeColor: '#EC5D3A',
  strokeWidth: 2,
  strokeStyle: 'solid',
  strokeOpacity: 100,
};

// We identify bg-rects we create with this tag in `link`
const BG_TAG = 'woe/bg-for:';

// simple local guard to prevent updateScene -> onChange -> updateScene loops
let isSyncing = false;

export function useOptionA(api: ExcalidrawImperativeAPI | null) {
  const makeRectId = (textId: string) => `woe-bg-${textId}`; // stable id per text

  const rectPropsForText = (t: TextEl, cfg: BgSettings) => {
    const custom = t.customData?.woeBg ?? {};
    const pad = custom.padding ?? cfg.padding;

    const width = t.width + pad * 2;
    const height = t.height + pad * 2;

    return {
      x: t.x - pad,
      y: t.y - pad,
      width,
      height,
      angle: t.angle,
      backgroundColor: custom.bgColor ?? cfg.bgColor,
      fillStyle: 'solid' as const,
      strokeColor: custom.strokeColor ?? cfg.strokeColor,
      strokeWidth: custom.strokeWidth ?? cfg.strokeWidth,
      strokeStyle: custom.strokeStyle ?? cfg.strokeStyle,
      roundness: { type: 3, value: custom.radius ?? cfg.radius },
      opacity: custom.bgOpacity ?? cfg.bgOpacity,
    };
  };

  const shallowEqualRect = (a: AnyEl, b: Partial<AnyEl>) => {
    return (
      a.x === b.x &&
      a.y === b.y &&
      a.width === b.width &&
      a.height === b.height &&
      a.angle === b.angle &&
      a.backgroundColor === b.backgroundColor &&
      a.strokeColor === b.strokeColor &&
      a.strokeWidth === b.strokeWidth &&
      a.strokeStyle === b.strokeStyle &&
      (a.roundness?.value ?? undefined) === (b.roundness as any)?.value &&
      a.opacity === b.opacity
    );
  };

  const syncAll = (settings: Partial<BgSettings> = {}) => {
    if (!api || isSyncing) return;

    const cfg: BgSettings = { ...DEFAULTS, ...settings };
    const els = (api.getSceneElements() ?? []) as AnyEl[];

    // Build helpers
    const isOurBg = (el: AnyEl) =>
      el.type === 'rectangle' && typeof el.link === 'string' && el.link.startsWith(BG_TAG);

    const next: AnyEl[] = [];
    const existingBgByTextId = new Map<string, AnyEl>();

    // collect existing backgrounds and remove them from base list
    for (const el of els) {
      if (isOurBg(el)) {
        const textId = (el.link as string).slice(BG_TAG.length);
        existingBgByTextId.set(textId, el);
        continue; // don’t copy to next; we’ll reinsert in correct z-order below
      }
      next.push(el);
    }

    const textEls = els.filter((e): e is TextEl => e.type === 'text');

    let changed = false;
    const toInsert: { rect: AnyEl; beforeId: string }[] = [];

    for (const t of textEls) {
      const custom = t.customData?.woeBg ?? {};
      const enabled: boolean = (custom.enabled ?? cfg.enabled) === true;
      const rectTag = `${BG_TAG}${t.id}`;
      const desired = rectPropsForText(t, cfg);

      if (!enabled) {
        // If a bg existed before for this text, its removal is a change
        if (existingBgByTextId.has(t.id)) changed = true;
        continue;
      }

      const existing = existingBgByTextId.get(t.id);
      let rect: AnyEl;

      if (existing) {
        // keep same id/seed to avoid churn
        if (!shallowEqualRect(existing, desired)) {
          rect = {
            ...existing,
            ...desired,
            link: rectTag,
            updated: Date.now(),
          };
          changed = true;
        } else {
          rect = existing; // reuse as-is
        }
      } else {
        rect = {
          type: 'rectangle',
          id: makeRectId(t.id),
          link: rectTag,
          seed: Math.floor(Math.random() * 2 ** 31),
          version: 1,
          versionNonce: Math.floor(Math.random() * 2 ** 31),
          isDeleted: false,
          groupIds: t.groupIds ?? [],
          boundElements: [],
          frameId: t.frameId ?? null,
          strokeSharpness: 'sharp',
          updated: Date.now(),
          ...desired,
        };
        changed = true;
      }

      // insert rect just before its text to keep z-index below
      toInsert.push({ rect, beforeId: t.id });
    }

    // If no diffs (no rects added/removed/changed), bail out to avoid loop
    if (!changed) return;

    // Build final array with correct z-order: insert each bg right before its text
    for (const { rect, beforeId } of toInsert) {
      const idx = next.findIndex((e) => e.id === beforeId);
      if (idx >= 0) next.splice(idx, 0, rect);
      else next.unshift(rect);
    }

    // Apply guarded scene update
    isSyncing = true;
    api.updateScene({ elements: next as any });
    // release guard on next tick to ignore the immediate onChange
    // (rAF is safer than setTimeout 0 in React dev/strict)
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        isSyncing = false;
      });
    } else {
      isSyncing = false;
    }
  };

  const toggleForSelection = () => {
    if (!api) return;
    const ids = api.getAppState().selectedElementIds ?? {};
    const scene = (api.getSceneElements() ?? []) as AnyEl[];

    let flipped = false;

    for (const el of scene) {
      if (!ids[el.id] || el.type !== 'text') continue;
      const current = el.customData?.woeBg ?? {};
      const nextCfg = { ...DEFAULTS, ...current, enabled: !current.enabled };
      el.customData = { ...(el.customData ?? {}), woeBg: nextCfg };
      flipped = true;
    }

    if (flipped) syncAll();
  };

  return { syncAll, toggleForSelection };
}
