/**
 * Minimal throttle (no deps): invokes fn at most once every wait ms.
 * Drops intermediate calls but commits the latest args at the next tick.
 */
export function throttle<T extends (...args: any[]) => void>(fn: T, wait = 150) {
  let last = 0, timer: any = null, queued: any[] | null = null;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn(...args);
    } else {
      queued = args;
      clearTimeout(timer);
      timer = setTimeout(() => {
        last = Date.now();
        if (queued) fn(...queued);
        queued = null;
      }, wait - (now - last));
    }
  };
}

/** Shallow compare of arrays-of-plain-objects (fast path). */
export function shallowArrayEqual(a: any[], b: any[]): boolean {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i], y = b[i];
    if (x === y) continue;
    if (typeof x !== 'object' || typeof y !== 'object' || x == null || y == null) return false;
    // Compare a few hot keys used by Excalidraw elements to avoid deep clone churn.
    // Fall back to JSON length compare as a coarse guard.
    const keys = ['id','type','x','y','width','height','version','versionNonce','seed','isDeleted','groupIds','locked'];
    for (const k of keys) {
      if ((x as any)[k] !== (y as any)[k]) return false;
    }
  }
  return true;
}