import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const tag = `v${pkg.version}`;
const cdn = `https://cdn.jsdelivr.net/gh/AmblerTech/marketing-site@${tag}/dist/`;
const alwaysOn = process.env.AMB_ALWAYS_ON === '1';
const target = ['chrome100', 'safari15', 'firefox100', 'edge100'];
mkdirSync('dist', { recursive: true });

await esbuild.build({
  entryPoints: ['src/index.css'], outfile: 'dist/ambler.css', bundle: true, minify: true, target,
  loader: { '.woff2': 'file' }, assetNames: 'fonts/[name]',
});
await esbuild.build({
  entryPoints: ['src/motion.js'], outfile: 'dist/ambler.js', bundle: true, minify: true, format: 'iife', target,
  footer: { js: 'window.__ambMotion&&window.__ambMotion.init(document,window);' },
  globalName: '__ambMotion',
});
const loader = await esbuild.build({
  entryPoints: ['src/loader-entry.js'], bundle: true, minify: true, format: 'iife', target, write: false,
  define: { __AMB_CDN__: JSON.stringify(cdn), __AMB_ALWAYS_ON__: String(alwaysOn) },
});
writeFileSync('dist/head-injection.html',
  `<!-- Ambler v2 loader ${tag}${alwaysOn ? ' (always on)' : ' (preview flag)'} -->\n` +
  `<style>html.amb-v2,html.amb-v2 body{background:#0b0b0f}</style>\n` +
  `<script>${loader.outputFiles[0].text.trim()}</script>\n`);

const sections = readdirSync('sections').filter((f) => f.endsWith('.html')).sort()
  .map((f) => `<section class="page-section" data-section-theme="white"><div class="content-wrapper"><div class="sqs-block-code">${readFileSync(`sections/${f}`, 'utf8')}</div></div></section>`)
  .join('\n');
mkdirSync('preview', { recursive: true });
writeFileSync('preview/index.html', `<!doctype html>
<html lang="en" class="amb-v2"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ambler v2 preview</title><link rel="stylesheet" href="../dist/ambler.css"></head>
<body><main id="page">${sections}</main><script src="../dist/ambler.js" defer></script></body></html>`);
console.log(`built ${tag} (alwaysOn=${alwaysOn})`);
