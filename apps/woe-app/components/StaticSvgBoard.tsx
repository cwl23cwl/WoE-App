// components/StaticSvgBoard.tsx
import * as React from "react";

/** Background options for the board. Extend as needed. */
export type BoardBackground = "none" | "grid" | "ruled" | "pdf";

/** Props the WorkspaceClient’s inspector already expects. */
export type StaticSvgBoardProps = {
  width?: number;            // total SVG width in px
  height?: number;           // total SVG height in px
  padding?: number;          // inner margin for content
  background?: BoardBackground;
  /** Optional prompt text rendered near the top-left inside the padding. */
  prompt?: string;
  /** Optional a11y metadata for screen readers. */
  title?: string;
  desc?: string;
  /** Show a dashed safe area outline (useful during layout/design). */
  showSafeArea?: boolean;
  /** Font size for prompt text. */
  promptFontSize?: number;   // px
  /** Max characters per line for prompt wrapping. If omitted, it’s estimated from width. */
  promptMaxCharsPerLine?: number;
};

/**
 * Simple word-wrap that splits by words and constrains by maxChars per line.
 * This avoids foreignObject/HTML and keeps us in pure SVG <text>/<tspan>.
 */
function wrapByWords(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (test.length > maxChars) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Light/dark-neutral palette tuned for dark page shells. Adjust freely. */
const COLORS = {
  boardBg: "#0b0b0c",
  boardStroke: "#2e2e33",
  safeArea: "#4b5563", // dashed outline
  promptText: "#e5e7eb",
  promptBox: "#111114",
  promptStroke: "#2b2b2f",
  gridLine: "#24262b",
  gridSubLine: "#1a1c20",
  ruledLine: "#202226",
  pdfPlaceholder: "#131318",
  pdfText: "#9ca3af",
};

/**
 * StaticSvgBoard – a reusable, pure-SVG “canvas”.
 * No Konva, no foreignObject. Tablet-friendly, deterministic rendering.
 */
export default function StaticSvgBoard({
  width = 1200,
  height = 800,
  padding = 24,
  background = "none",
  prompt = "",
  title = "Workspace Page",
  desc = "A static SVG workspace page.",
  showSafeArea = false,
  promptFontSize = 20,
  promptMaxCharsPerLine,
}: StaticSvgBoardProps) {
  const innerX = padding;
  const innerY = padding;
  const innerW = Math.max(0, width - padding * 2);
  const innerH = Math.max(0, height - padding * 2);

  // Estimate max chars per line if not provided (rough 0.58em width per character).
  const estimatedMaxChars =
    promptMaxCharsPerLine ??
    Math.max(8, Math.floor(innerW / (promptFontSize * 0.58)));

  const lines = prompt
    ? wrapByWords(prompt, estimatedMaxChars)
    : [];

  // Prompt box metrics
  const lineHeight = Math.round(promptFontSize * 1.35);
  const promptPadX = 16;
  const promptPadY = 12;
  const promptBoxW = Math.min(innerW, Math.max(280, Math.ceil(lines.reduce((m, l) => Math.max(m, l.length), 0) * promptFontSize * 0.58) + promptPadX * 2));
  const promptBoxH = lines.length > 0 ? lines.length * lineHeight + promptPadY * 2 : 0;

  // IDs for <defs> patterns/filters – scoped by dimensions to reduce collisions if many boards render on a page.
  const uid = React.useMemo(() => Math.random().toString(36).slice(2), []);
  const gridId = `grid-${uid}`;
  const ruledId = `ruled-${uid}`;
  const dropId = `drop-${uid}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-labelledby={`title-${uid} desc-${uid}`}
    >
      <title id={`title-${uid}`}>{title}</title>
      <desc id={`desc-${uid}`}>{desc}</desc>

      {/* --- Defs: shadows and backgrounds --- */}
      <defs>
        {/* Square grid (major + minor) */}
        <pattern id={gridId} width="64" height="64" patternUnits="userSpaceOnUse">
          <rect width="64" height="64" fill={COLORS.boardBg} />
          {/* minor lines every 16px */}
          <path d="M16 0 V64 M32 0 V64 M48 0 V64 M0 16 H64 M0 32 H64 M0 48 H64"
                stroke={COLORS.gridSubLine} strokeWidth="1" shapeRendering="crispEdges" />
          {/* major lines */}
          <path d="M0 0 H64 M0 0 V64" stroke={COLORS.gridLine} strokeWidth="1.5" shapeRendering="crispEdges" />
          <path d="M0 64 H64" stroke={COLORS.gridLine} strokeWidth="1.5" shapeRendering="crispEdges" />
          <path d="M64 0 V64" stroke={COLORS.gridLine} strokeWidth="1.5" shapeRendering="crispEdges" />
        </pattern>

        {/* Ruled background (horizontal lines) */}
        <pattern id={ruledId} width="8" height="40" patternUnits="userSpaceOnUse">
          <rect width="8" height="40" fill={COLORS.boardBg} />
          <line x1="0" y1="40" x2="8" y2="40" stroke={COLORS.ruledLine} strokeWidth="1" shapeRendering="crispEdges" />
        </pattern>

        {/* Soft drop shadow for the main board */}
        <filter id={dropId} x="-20%" y="-20%" width="140%" height="140%">
          <feOffset in="SourceAlpha" dx="0" dy="2" result="off" />
          <feGaussianBlur in="off" stdDeviation="2" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 .35 0"
            result="shadow"
          />
          <feBlend in="SourceGraphic" in2="shadow" mode="normal" />
        </filter>
      </defs>

      {/* --- Board background (full canvas) --- */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={
          background === "grid"
            ? `url(#${gridId})`
            : background === "ruled"
            ? `url(#${ruledId})`
            : background === "pdf"
            ? COLORS.pdfPlaceholder
            : COLORS.boardBg
        }
      />

      {/* Optional PDF placeholder text */}
      {background === "pdf" && (
        <g aria-label="PDF background">
          <rect
            x={innerX}
            y={innerY}
            width={innerW}
            height={innerH}
            fill="none"
            stroke={COLORS.boardStroke}
            strokeDasharray="4 4"
          />
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            fontSize={16}
            fill={COLORS.pdfText}
          >
            PDF page background goes here
          </text>
        </g>
      )}

      {/* --- Inner board (content area) --- */}
      <g filter={`url(#${dropId})`}>
        {/* Safe content area outline (for layout debugging) */}
        {showSafeArea && (
          <rect
            x={innerX}
            y={innerY}
            width={innerW}
            height={innerH}
            fill="none"
            stroke={COLORS.safeArea}
            strokeDasharray="6 6"
            rx={8}
            ry={8}
          />
        )}

        {/* Prompt bubble (optional) */}
        {lines.length > 0 && (
          <>
            <rect
              x={innerX}
              y={innerY}
              width={promptBoxW}
              height={promptBoxH}
              rx={10}
              ry={10}
              fill={COLORS.promptBox}
              stroke={COLORS.promptStroke}
            />
            <text
              x={innerX + promptPadX}
              y={innerY + promptPadY + promptFontSize}
              fontSize={promptFontSize}
              fill={COLORS.promptText}
            >
              {lines.map((line, i) => (
                <tspan
                  key={i}
                  x={innerX + promptPadX}
                  y={innerY + promptPadY + promptFontSize + i * lineHeight}
                >
                  {line}
                </tspan>
              ))}
            </text>
          </>
        )}

        {/* Example writing area frame (feel free to remove/replace) */}
        <rect
          x={innerX}
          y={innerY + (promptBoxH ? promptBoxH + 12 : 0)}
          width={innerW}
          height={innerH - (promptBoxH ? promptBoxH + 12 : 0)}
          fill="none"
          stroke={COLORS.boardStroke}
          rx={12}
          ry={12}
        />
      </g>
    </svg>
  );
}