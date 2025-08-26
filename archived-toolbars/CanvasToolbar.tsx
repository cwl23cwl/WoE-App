"use client";

import React from "react";
import { Upload } from "lucide-react"; // optional, if you have lucide-react

type Props = {
  onTool: (tool: "selection" | "text" | "draw" | "rectangle" | "diamond" | "ellipse" | "line") => void;
  onUndo: () => void;
  onRedo: () => void;
  onUploadImage: (file: File) => void;
};

export default function CanvasToolbar({ onTool, onUndo, onRedo, onUploadImage }: Props) {
  return (
    <div className="pointer-events-auto rounded-full border bg-background/90 backdrop-blur px-2 py-1 shadow-md flex items-center gap-1">
      <button className="px-2 py-1 text-sm rounded-md hover:bg-muted" onClick={() => onTool("selection")} title="Select">Select</button>
      <button className="px-2 py-1 text-sm rounded-md hover:bg-muted" onClick={() => onTool("draw")} title="Pen">Pen</button>
      <button className="px-2 py-1 text-sm rounded-md hover:bg-muted" onClick={() => onTool("text")} title="Text">Text</button>
      <button className="px-2 py-1 text-sm rounded-md hover:bg-muted" onClick={() => onTool("rectangle")} title="Rect">Rect</button>
      <button className="px-2 py-1 text-sm rounded-md hover:bg-muted" onClick={() => onTool("ellipse")} title="Ellipse">Ellipse</button>
      <div className="mx-1 w-px h-5 bg-border" />
      <button className="px-2 py-1 text-sm rounded-md hover:bg-muted" onClick={onUndo} title="Undo">Undo</button>
      <button className="px-2 py-1 text-sm rounded-md hover:bg-muted" onClick={onRedo} title="Redo">Redo</button>
      <div className="mx-1 w-px h-5 bg-border" />
      <label className="px-2 py-1 text-sm rounded-md hover:bg-muted cursor-pointer" title="Upload image">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUploadImage(f);
            e.currentTarget.value = "";
          }}
          className="hidden"
        />
        <span className="inline-flex items-center gap-1">
          {/** optional icon */}{/* <Upload size={14}/> */}
          Image
        </span>
      </label>
    </div>
  );
}
