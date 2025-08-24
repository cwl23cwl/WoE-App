const fs = require('fs');
const path = require('path');
const glob = (d) => {
  const out = [];
  const walk = (p) => {
    for (const e of fs.readdirSync(p, {withFileTypes:true})) {
      const full = path.join(p, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile() && e.name === 'package.json') out.push(full);
    }
  };
  walk(d);
  return out;
};
const PKG_SECTIONS = ['dependencies','devDependencies','peerDependencies','optionalDependencies'];
for (const file of glob('packages')) {
  const data = JSON.parse(fs.readFileSync(file,'utf8'));
  for (const sec of PKG_SECTIONS) {
    if (!data[sec]) continue;
    for (const k of Object.keys(data[sec])) {
      if (k.startsWith('@woe-app/') || k.startsWith('@excalidraw/') || k.startsWith('@woe/')) {
        data[sec][k] = 'workspace:*';
      }
    }
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log('>>> normalized deps in', file);
}
