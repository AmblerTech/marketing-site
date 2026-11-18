// After pushing a tag: request every file jsDelivr will serve until each answers 200, so no visitor
// meets the cold-cache 503s (seen once on team-kristian.jpg). Usage: node scripts/warm-cdn.mjs
import { readFileSync, readdirSync } from 'node:fs';
const tag = `v${JSON.parse(readFileSync('package.json', 'utf8')).version}`;
const base = `https://cdn.jsdelivr.net/gh/AmblerTech/marketing-site@${tag}/`;
const files = ['dist/ambler.css', 'dist/ambler.js',
  ...readdirSync('dist/fonts').map((f) => `dist/fonts/${f}`),
  ...readdirSync('assets').filter((f) => /\.(jpg|png)$/.test(f)).map((f) => `assets/${f}`)];
let bad = 0;
for (const f of files) {
  let status = 0;
  for (let i = 0; i < 20 && status !== 200; i++) {
    status = (await fetch(base + f)).status;
    if (status !== 200) await new Promise((r) => setTimeout(r, 6000));
  }
  console.log(`${status} ${f}`);
  if (status !== 200) bad++;
}
if (bad) { console.error(`${bad} file(s) not served — do not paste the loader yet`); process.exit(1); }
console.log(`all ${files.length} files warm on ${tag}`);
