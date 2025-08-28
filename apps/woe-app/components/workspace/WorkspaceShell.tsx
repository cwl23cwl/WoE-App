"use client";

import React from "react";
import TopBar from "./TopBar";
import PageList from "./PageList";
import Inspector from "./Inspector";

/**
 * Shell layout:
 *  ┌────────────────────────────────────────── TopBar (56px) ──────────────────────────────────────────┐
 *  │                                                                                                   │
 *  ├─ PageList (260px) ────────────────┬────────────── Center (Board) ───────────────┬── Inspector (320px) ─┤
 *  │                                    │                                            │                     │
 *  │                                    │                                            │                     │
 *  └────────────────────────────────────┴────────────────────────────────────────────┴─────────────────────┘
 */
export default function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-neutral-50 text-neutral-900">
      {/* Grid: rows [topbar, body], cols [left, center, right] */}
      <div className="grid h-full grid-rows-[56px_1fr] grid-cols-[260px_1fr_320px]">
        {/* TopBar spans all columns */}
        <header className="col-span-3 border-b bg-white">
          <TopBar />
        </header>

        {/* Left: Pages */}
        <aside className="border-r bg-white overflow-y-auto">
          <PageList />
        </aside>

        {/* Center: Your board mounts here */}
        <main className="bg-neutral-50 overflow-hidden">
          <div className="h-full w-full">{children}</div>
        </main>

        {/* Right: Inspector */}
        <aside className="border-l bg-white overflow-y-auto">
          <Inspector />
        </aside>
      </div>
    </div>
  );
}