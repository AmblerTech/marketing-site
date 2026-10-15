// Resize + convert photos to JPEG ≤ 200 KB with macOS sips; crops remove AI watermarks (✦).
// Usage: node scripts/optimize-images.mjs
import { execFileSync } from 'node:child_process';
import { statSync, mkdirSync } from 'node:fs';
const HOME = process.env.HOME;
const DP = `${HOME}/Desktop/claude-agents/demo-pack`;
const DECK = `${HOME}/Desktop/claude-agents/_shared/preseed-deck-html/.superpowers/brainstorm/57217-1791448526/content`;
const BLOG = 'https://images.squarespace-cdn.com/content/v1/68da5cb1661bbe41f3f1fb06';
// [name, source, longest edge, crop as fractions {x, y, w, h} or null]
const jobs = [
  ['kayo', `${DP}/cast/press-photos/kayo-press-01.png`, 900, { x: 0.09, y: 0, w: 0.8, h: 1 }],
  ['amara', `${DP}/cast/press-photos/Amara.jpg`, 900, null],
  ['tobs', `${DP}/cast/press-photos/Tobs.jpg`, 900, null],
  ['selasi', `${DP}/cast/press-photos/Selasi.jpg`, 900, null],
  ['nia', `${DP}/cast/press-photos/Nia_press-01.png`, 1200, { x: 0, y: 0, w: 1, h: 0.86 }],
  ['midnight', `${DP}/releases/midnight/midnight-cover.jpg`, 600, { x: 0.07, y: 0, w: 0.86, h: 0.86 }],
  ['honey-season', `${DP}/releases/honey-season/Nia-Honey_Season_artwork.png`, 600, { x: 0, y: 0, w: 1, h: 0.86 }],
  ['team-alexander', `${DECK}/team-alexander.png`, 900, null],
  ['team-kristian', `${DECK}/team-kristian.png`, 900, null],
  ['team-selim', `${DECK}/team-selim.png`, 900, null],
  ['scene-chaos', `${BLOG}/1777639951383-0CN9HIXUZY5BZMVIII6N/luis-villasmil-mlVbMbxfWI4-unsplash.jpg`, 1400, null],
  ['scene-studio', `${BLOG}/1775657804867-TIFR0P22VGF9P7PCHQ2D/brooke-balentine-KoLjKwc629M-unsplash.jpg`, 1400, null],
];
mkdirSync('assets', { recursive: true });
const sips = (...a) => execFileSync('sips', a, { stdio: 'pipe' }).toString();
const dims = (f) => { const o = sips('-g', 'pixelWidth', '-g', 'pixelHeight', f); return [+o.match(/pixelWidth: (\d+)/)[1], +o.match(/pixelHeight: (\d+)/)[1]]; };
for (const [name, src0, edge, crop] of jobs) {
  let src = src0;
  if (src.startsWith('http')) { src = `/tmp/amb-${name}`; execFileSync('curl', ['-sL', '-o', src, `${src0}?format=2500w`]); }
  const dst = `assets/${name}.jpg`;
  sips('-s', 'format', 'jpeg', src, '--out', dst);
  if (crop) {
    const [w, h] = dims(dst);
    sips('--cropOffset', String(Math.round(h * crop.y)), String(Math.round(w * crop.x)), '-c', String(Math.round(h * crop.h)), String(Math.round(w * crop.w)), dst);
  }
  sips('-Z', String(edge), dst);
  const master = `/tmp/amb-master-${name}.png`; sips('-s', 'format', 'png', dst, '--out', master);
  for (const q of [80, 70, 60, 50, 40]) { sips('-s', 'format', 'jpeg', '-s', 'formatOptions', String(q), master, '--out', dst); if (statSync(dst).size <= 200 * 1024) break; }
  const [w, h] = dims(dst);
  console.log(`${name}.jpg ${w}x${h} ${Math.round(statSync(dst).size / 1024)} KB`);
}
