// Serves the real dist/head-injection.html (CDN → local dist on :4173), flushes the head,
// then sends the preview body 1.5 s later — reproduces a cached ambler.js running before the body parses.
import http from 'node:http';
import { readFileSync } from 'node:fs';

http.createServer((req, res) => {
  const head = readFileSync('dist/head-injection.html', 'utf8')
    .replace(/https:\/\/cdn\.jsdelivr\.net\/gh\/AmblerTech\/marketing-site@[^/]+\/dist\//g, 'http://localhost:4173/dist/');
  const preview = readFileSync('preview/index.html', 'utf8');
  const body = preview.slice(preview.indexOf('<body>') + 6, preview.indexOf('<script'));
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${head}</head><body>`);
  setTimeout(() => res.end(`${body}</body></html>`), 1500);
}).listen(4174);
