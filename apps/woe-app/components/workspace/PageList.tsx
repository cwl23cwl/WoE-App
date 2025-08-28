"use client";

import React from "react";

export default function PageList() {
  const [pages, setPages] = React.useState(
    Array.from({ length: 5 }, (_, i) => ({ id: i + 1, title: `Page ${i + 1}` }))
  );
  const [active, setActive] = React.useState(1);

  return (
    <div className="p-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Pages</h2>
        <button
          className="rounded-lg border px-2 py-1 text-sm bg-white hover:bg-neutral-50"
          onClick={() =>
            setPages(p => [...p, { id: p.length + 1, title: `Page ${p.length + 1}` }])
          }
        >
          + Add
        </button>
      </div>

      <ul className="space-y-1">
        {pages.map(p => (
          <li key={p.id}>
            <button
              className={
                "w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-neutral-50 " +
                (active === p.id ? "bg-neutral-100 font-medium" : "bg-white")
              }
              onClick={() => setActive(p.id)}
            >
              {p.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}