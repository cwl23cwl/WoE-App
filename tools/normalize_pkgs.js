const fs = require('fs'), path = require('path');
const SECS = ['dependencies','devDependencies','peerDependencies','optionalDependencies'];
function eachPkg(root) {
  const out = [];
  (function walk(dir){
    for (const e of fs.readdirSync(dir, {withFileTypes:true})) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile() && e.name === 'package.json') out.push(full);
    }
  })(root);
  return out;
}
for (const file of eachPkg('packages')) {
  const data = JSON.parse(fs.readFileSync(file,'utf8'));

  for (const sec of SECS) {
    if (!data[sec]) continue;

    // delete unwanted fork subpackages
    delete data[sec]['@woe-app/math'];
    delete data[sec]['@woe-app/element'];
    delete data[sec]['@woe-app/excalidraw'];

    // map excalidraw to wrapper
    if (data[sec]['excalidraw']) {
      data[sec]['@woe/excalidraw'] = 'workspace:*';
      delete data[sec]['excalidraw'];
    }

    // standardize versions for internal scopes
    for (const k of Object.keys(data[sec])) {
      if (k.startsWith('@woe/') || k.startsWith('@woe-app/') || k.startsWith('@excalidraw/')) {
        data[sec][k] = 'workspace:*';
      }
    }
  }

  // ensure package marked private
  if (!data.private) data.private = true;

  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log('>>> normalized', file);
}
