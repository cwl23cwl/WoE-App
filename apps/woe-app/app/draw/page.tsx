'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { useOptionA } from './useOptionA';

export default function DrawPage() {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const [ready, setReady] = useState(false);

  const { syncAll, toggleForSelection } = useOptionA(apiRef.current);

  const setApi = useCallback((api: ExcalidrawImperativeAPI) => {
    apiRef.current = api;
    setReady(true);
    console.log('[excalidraw:ready]', {
      hasApi: true,
      canUpdate: !!api.updateScene,
      elements: api.getSceneElements()?.length ?? 0,
    });
    syncAll();
  }, [syncAll]);

  const handleChange = useCallback(() => {
    if (!apiRef.current) return;
    syncAll();
  }, [syncAll]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleForSelection();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleForSelection]);

  return (
    <div style={{ height: '100dvh', display: 'grid', gridTemplateRows: '40px 1fr' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '0 8px' }}>
        <button
          onClick={toggleForSelection}
          style={{ padding: '6px 10px', border: '1px solid #444', borderRadius: 8 }}
          title="Alt+B"
        >
          Toggle BG (Alt+B)
        </button>
      </div>
      <Excalidraw excalidrawAPI={setApi} onChange={handleChange} />
    </div>
  );
}
