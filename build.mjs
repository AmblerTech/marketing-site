import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const tag = `v${pkg.version}`;
const cdn = `https://cdn.jsdelivr.net/gh/AmblerTech/marketing-site@${tag}/dist/`;
const assetsCdn = `https://cdn.jsdelivr.net/gh/AmblerTech/marketing-site@${tag}/assets/`;
const alwaysOn = process.env.AMB_ALWAYS_ON === '1';
const target = ['chrome100', 'safari15', 'firefox100', 'edge100'];
mkdirSync('dist', { recursive: true });

await esbuild.build({
  entryPoints: ['src/index.css'], outfile: 'dist/ambler.css', bundle: true, minify: true, target,
  loader: { '.woff2': 'file' }, assetNames: 'fonts/[name]',
});
await esbuild.build({
  entryPoints: ['src/motion.js'], outfile: 'dist/ambler.js', bundle: true, minify: true, format: 'iife', target,
  footer: { js: 'window.__ambMotion&&window.__ambMotion.start(document,window);' },
  globalName: '__ambMotion',
});
const loader = await esbuild.build({
  entryPoints: ['src/loader-entry.js'], bundle: true, minify: true, format: 'iife', target, write: false,
  define: { __AMB_CDN__: JSON.stringify(cdn), __AMB_ALWAYS_ON__: String(alwaysOn) },
});
writeFileSync('dist/head-injection.html',
  `<!-- Ambler v2 loader ${tag}${alwaysOn ? ' (always on)' : ' (preview flag)'} -->\n` +
  `<style>html.amb-v2,html.amb-v2 body{background:#f4f4f0}</style>\n` +
  `<script>${loader.outputFiles[0].text.trim()}</script>\n`);

// The time-back calculator is Alexander's existing Squarespace code block (lead capture). It is never
// copied into this repo; the preview reads it from ambler-internal-tools so we restyle the real thing.
const calcPath = process.env.AMB_CALC_PATH || '../ambler-internal-tools/website/time-back-calculator/calculator.html';
const calc = existsSync(calcPath) ? readFileSync(calcPath, 'utf8') : null;
if (!calc) console.warn(`calculator not found at ${calcPath} — preview built without it`);
const block = (html) => `<section class="page-section" data-section-theme="white"><div class="content-wrapper"><div class="sqs-block-code">${html}</div></div></section>`;
// Sections use __ASSETS__/ for photos: the preview points at the local files, the paste-ready copies in
// dist/sections/ (what goes into Squarespace) point at jsDelivr for this tag.
const files = readdirSync('sections').filter((f) => f.endsWith('.html')).sort();
mkdirSync('dist/sections', { recursive: true });
for (const f of files) writeFileSync(`dist/sections/${f}`, readFileSync(`sections/${f}`, 'utf8').replaceAll('__ASSETS__/', assetsCdn));
const sections = files
  .flatMap((f) => [block(readFileSync(`sections/${f}`, 'utf8').replaceAll('__ASSETS__/', '../assets/')), ...(f.startsWith('03-') && calc ? [block(calc)] : [])])
  .join('\n');
mkdirSync('preview', { recursive: true });
writeFileSync('preview/index.html', `<!doctype html>
<html lang="en" class="amb-v2"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ambler v2 preview</title><link rel="stylesheet" href="../dist/ambler.css"></head>
<body><main id="page">${sections}</main><script src="../dist/ambler.js" defer></script></body></html>`);
console.log(`built ${tag} (alwaysOn=${alwaysOn})`);
