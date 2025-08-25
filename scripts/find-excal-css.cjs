// Recursively list every .css shipped with @excalidraw/excalidraw (as seen from your fork)
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
// base will be something like .../@excalidraw/excalidraw/dist/index.js
const pkgRoot = path.resolve(path.dirname(base), ".."); // go one up from dist
const dirsToScan = [
  path.dirname(base),
  pkgRoot,
  path.join(pkgRoot, "dist"),
  path.join(pkgRoot, "dist", "prod"),
  path.join(pkgRoot, "dist", "dev"),
];

const found = [...new Set(dirsToScan.flatMap((d) => walk(d)))];
if (!found.length) {
  console.error("No CSS files found under:", dirsToScan);
  process.exit(1);
}
console.log("FOUND CSS FILES:\n" + found.join("\n"));
