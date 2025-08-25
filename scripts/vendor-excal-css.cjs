const fs = require("fs");
const path = require("path");

function walk(dir, acc = [], depth = 0, maxDepth = 5) {
  if (depth > maxDepth) return acc;
  let list;
  try { list = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return acc; }
  for (const d of list) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) walk(p, acc, depth + 1, maxDepth);
    else if (d.isFile() && /\.css$/i.test(p)) acc.push(p);
  }
  return acc;
}

const base = require.resolve("@excalidraw/excalidraw", { paths: ["packages/woe-excalidraw"] });
const pkgRoot = path.resolve(path.dirname(base), "..");

const searchRoots = [
  path.dirname(base),
  pkgRoot,
  path.join(pkgRoot, "dist"),
  path.join(pkgRoot, "dist", "prod"),
  path.join(pkgRoot, "dist", "dev"),
];

const allCss = [...new Set(searchRoots.flatMap((d) => walk(d)))];

// Prefer minified prod file, then prod, then dev, then any index.css
const score = (p) => {
  const f = p.replace(/\\/g, "/");
  if (/dist\/prod\/excalidraw\.min\.css$/.test(f)) return 100;
  if (/dist\/prod\/excalidraw\.css$/.test(f)) return 90;
  if (/dist\/dev\/index\.css$/.test(f)) return 80;
  if (/\/index\.css$/.test(f)) return 70;
  if (/excalidraw\.css$/.test(f)) return 60;
  return 10;
};

const sorted = allCss.sort((a, b) => score(b) - score(a));
const src = sorted[0];

if (!src) {
  console.error("Could not find any Excalidraw CSS under:", searchRoots);
  process.exit(1);
}

const dst = path.join(process.cwd(), "packages/woe-excalidraw", "excalidraw-vendored.css");
fs.copyFileSync(src, dst);
console.log("Vendored CSS:", src, "→", dst);
