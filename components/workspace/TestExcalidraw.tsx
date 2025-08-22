'use client'

import React from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'

export function TestExcalidraw() {
  return (
    <div style={{ height: '500px', width: '100%' }}>
      <h3>🧪 DIRECT EXCALIDRAW TEST (No Dynamic Import)</h3>
      <Excalidraw />
    </div>
  )
}