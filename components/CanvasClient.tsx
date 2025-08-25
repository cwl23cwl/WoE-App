// components/CanvasClient.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Text as KText, Transformer } from "react-konva";

// (this is exactly the canvas MVP you pasted earlier; keep it as-is)
// If you lost it, tell me and I'll re-drop the full file.
// The key is this file has "use client" and imports from react-konva directly.
export default function CanvasClient() {
  // ---- minimal proof it's working ----
  const [w, setW] = useState(800);
  const [h, setH] = useState(500);
  const stageRef = useRef<any>(null);

  useEffect(() => {
    const onResize = () => setW(Math.min(1000, window.innerWidth - 48));
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="rounded-2xl border bg-white shadow-lg overflow-hidden">
      <Stage ref={stageRef} width={w} height={h} style={{ touchAction: "none" }}>
        <Layer>
          <Rect x={0} y={0} width={w} height={h} fill="#f8fafc" />
          <KText x={24} y={24} text="Konva ✅ (React 18)" fontSize={24} fill="#111827" />
          <Rect x={24} y={70} width={180} height={120} cornerRadius={12} fill="#ffffff" stroke="#111827" strokeWidth={2}/>
        </Layer>
      </Stage>
    </div>
  );
}