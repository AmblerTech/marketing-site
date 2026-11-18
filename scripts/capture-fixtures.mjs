// Saves live pages, strips scripts, adds dist CSS.
import { writeFileSync, mkdirSync } from 'node:fs';
const pages = {
  home: '/', blog: '/blog', post: '/blog/what-is-music-metadata-registration',
  faq: '/faq', partner: '/become-design-partner', privacy: '/privacy', homev2: '/home-v2',
};
mkdirSync('test/fixtures', { recursive: true });
for (const [name, path] of Object.entries(pages)) {
  const res = await fetch('https://www.useambler.io' + path, { headers: { 'user-agent': 'Mozilla/5.0' } });
  let html = await res.text();
  html = html.replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style>html\.amb-v2[^<]*<\/style>/g, '') // the live loader's pre-paint style (test-only removal)
    .replace(/<img([^>]*?)data-src="([^"]+)"/gi, '<img$1src="$2"')
    .replace('</head>', '<link rel="stylesheet" href="../../dist/ambler.css"></head>')
    // Test-only: Squarespace's own JS reveals [data-animation-role] content; scripts are stripped, so show the revealed state.
    .replace('</head>', '<style data-fixture>[data-animation-role],.content-wrapper,article.blog-item{opacity:1!important;transform:none!important}</style></head>');
  writeFileSync(`test/fixtures/${name}.html`, html);
  writeFileSync(`test/fixtures/${name}.v2.html`, html.replace(/<html([^>]*)>/i, '<html$1 class="amb-v2">'));
  console.log(name, res.status, html.length);
}

// Kitchen sink: blocks Alexander may add later, inside the light post panel and on the dark page.
import { readFileSync } from 'node:fs';
const blocks = `
<div class="sqs-block quote-block sqs-block-quote"><div class="sqs-block-content"><figure><blockquote><span>“</span>A very long quotation that someone might add to a post later on.<span>”</span></blockquote><figcaption>— <cite>Jane Source</cite></figcaption></figure></div></div>
<div class="sqs-block summary-v2-block sqs-block-summary-v2"><div class="summary-item"><div class="summary-title"><a href="#">Summary item title</a></div><div class="summary-metadata"><span class="summary-metadata-item">14 Oct 2026</span></div><p>Summary excerpt text.</p></div></div>
<figure><div class="image-caption"><p><span>Caption under an image</span></p></div></figure>
<h2>A very long blog title withanunbreakablewordthatgoesonandonandonforeverandeverandever</h2>`;
const post = readFileSync('test/fixtures/post.v2.html', 'utf8');
writeFileSync('test/fixtures/kitchen.v2.html', post
  .replace(/(<div class="blog-item-content-wrapper"[^>]*>)/, `$1${blocks}`)
  .replace(/(<main[^>]*>)/, `$1${blocks}`));
writeFileSync('test/fixtures/kitchen.html', readFileSync('test/fixtures/post.html', 'utf8'));
console.log('kitchen sink written');
