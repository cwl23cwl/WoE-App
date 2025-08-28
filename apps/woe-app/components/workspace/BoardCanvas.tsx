"use client";

import React from "react";
import StaticSvgBoard from "../StaticSvgBoard"; // ⬅️ go up one level

export default function BoardCanvas() {
  return (
    <div className="h-full w-full">
      <StaticSvgBoard />
    </div>
  );
}