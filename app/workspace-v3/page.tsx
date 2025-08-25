"use client";

import React from "react";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import BoardCanvas from "@/components/workspace/BoardCanvas";

export default function WorkspaceV3Page() {
  return (
    <WorkspaceShell>
      <BoardCanvas />
    </WorkspaceShell>
  );
}
