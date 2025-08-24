import { useEffect, useLayoutEffect, useState } from "react";
import { MAX_CANVAS_EDGE_PX } from "./limits";

export function useCappedSize(ref: React.RefObject<HTMLElement>) {
  const [size, setSize] = useState<{w:number; h:number}>({ w: 800, h: 600 });
  useLayoutEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      // Cap width/height so Excalidraw never requests a >MAX edge canvas
      const w = Math.min(Math.max(1, Math.floor(r.width)), MAX_CANVAS_EDGE_PX);
      const h = Math.min(Math.max(1, Math.floor(r.height)), MAX_CANVAS_EDGE_PX);
      setSize({ w, h });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  // Also react to DPR changes
  useEffect(() => {
    const mq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const onChange = () => {
      if (ref.current) {
        const r = ref.current.getBoundingClientRect();
        setSize({ 
          w: Math.min(Math.floor(r.width),  MAX_CANVAS_EDGE_PX),
          h: Math.min(Math.floor(r.height), MAX_CANVAS_EDGE_PX)
        });
      }
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [ref]);
  return size;
}
