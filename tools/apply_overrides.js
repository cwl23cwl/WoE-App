const fs = require('fs');
const p = 'package.json';
const j = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p,'utf8')) : { name:'root', private:true };
j.private = true;
j.pnpm = j.pnpm || {};
j.pnpm.overrides = Object.assign({}, j.pnpm.overrides, {
  '@woe/*': 'workspace:*',
  '@woe-app/*': 'workspace:*',
  '@excalidraw/*': 'workspace:*'
});
fs.writeFileSync(p, JSON.stringify(j, null, 2));
console.log('>>> wrote pnpm.overrides to root package.json');
