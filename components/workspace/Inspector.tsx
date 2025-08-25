"use client";

import React from "react";

export default function Inspector() {
  return (
    <div className="p-3 space-y-3">
      <h2 className="text-sm font-semibold">Inspector</h2>
      <div className="rounded-xl border bg-white p-3">
        <p className="text-sm text-neutral-700">
          Select an item to edit its properties. This panel can host options like fill, border,
          font, stickers, comments, etc.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-3">
        <h3 className="text-sm font-medium mb-2">Page Settings</h3>
        <div className="flex items-center gap-2">
          <label className="text-sm">Orientation</label>
          <select className="rounded-lg border bg-white px-2 py-1 text-sm">
            <option>Portrait</option>
            <option>Landscape</option>
          </select>
        </div>
      </div>
    </div>
  );
}