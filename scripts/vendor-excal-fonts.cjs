// scripts/vendor-excal-fonts.cjs
const fs = require("fs");
const path = require("path");

function copyDir(src, dst) {
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(dst, { recursive: true });
  // Node 16+: fs.cpSync exists; fallback to manual copy if needed
  if (fs.cpSync) {
    fs.cpSync(src, dst, { recursive: true });
    return true;
  }
  // fallback
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
  return true;
}

const baseMain = require.resolve("@excalidraw/excalidraw", {
  paths: ["packages/woe-excalidraw"],
});
const dist = path.dirname(baseMain);
const roots = [
  path.join(dist, "prod", "fonts"),
  path.join(dist, "dev", "fonts"),
  path.join(dist, "fonts"),
  path.join(path.resolve(dist, ".."), "fonts"),
];

const srcFonts = roots.find((p) => fs.existsSync(p));
if (!srcFonts) {
  console.error("Could not find Excalidraw fonts. Checked:\n" + roots.join("\n"));
  process.exit(1);
}

const dstFonts = path.join(process.cwd(), "packages/woe-excalidraw", "fonts");
copyDir(srcFonts, dstFonts);
console.log("Copied fonts:", srcFonts, "→", dstFonts);
