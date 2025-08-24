const fs = require('fs'), path = require('path');
const SECS = ['dependencies','devDependencies','peerDependencies','optionalDependencies'];
function eachPkg(root) {
  const out = [];
  (function walk(dir){
    for (const e of fs.readdirSync(dir, {withFileTypes:true})) {
      const full = path.join(dir, e.name);
      if (e.name === 'node_modules') continue;
      if (e.isDirectory()) walk(full);
      else if (e.isFile() && e.name === 'package.json') out.push(full);
    }
  })(root);
  return out;
}
let hits = [];
for (const file of eachPkg('.')) {
  const data = JSON.parse(fs.readFileSync(file,'utf8'));
  let changed = false;

  // rename package if it WAS the fork name
  if (data.name === '@woe-app/excalidraw') {
    data.name = '@woe/excalidraw';
    changed = true;
  }

  for (const sec of SECS) {
    if (!data[sec]) continue;

    // Remove fork subpackages
    ['@woe-app/math','@woe-app/element'].forEach(k=>{
      if (data[sec][k]) { delete data[sec][k]; changed = true; }
    });

    // Replace fork excalidraw dep with wrapper
    if (data[sec]['@woe-app/excalidraw']) {
      delete data[sec]['@woe-app/excalidraw'];
      data[sec]['@woe/excalidraw'] = 'workspace:*';
      changed = true;
      hits.push(file);
    }

    // If any package depends on raw 'excalidraw', prefer wrapper
    if (data[sec]['excalidraw']) {
      delete data[sec]['excalidraw'];
      data[sec]['@woe/excalidraw'] = 'workspace:*';
      changed = true;
    }

    // Normalize versions for internal scopes
    for (const k of Object.keys(data[sec])) {
      if (k.startsWith('@woe/') || k.startsWith('@woe-app/') || k.startsWith('@excalidraw/')) {
        data[sec][k] = 'workspace:*';
      }
    }
  }

  if (!data.private) { data.private = true; changed = true; }

  if (changed) fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
if (hits.length) {
  console.log('>>> replaced @woe-app/excalidraw in:');
  hits.forEach(h=>console.log('   -', h));
} else {
  console.log('>>> no @woe-app/excalidraw references found in package.json files');
}
