// Saves live pages, strips scripts, adds dist CSS.
import { writeFileSync, mkdirSync } from 'node:fs';
const pages = {
  home: '/', blog: '/blog', post: '/blog/what-is-music-metadata-registration',
  faq: '/faq', partner: '/become-design-partner', privacy: '/privacy',
};
mkdirSync('test/fixtures', { recursive: true });
for (const [name, path] of Object.entries(pages)) {
  const res = await fetch('https://www.useambler.io' + path, { headers: { 'user-agent': 'Mozilla/5.0' } });
  let html = await res.text();
  html = html.replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<img([^>]*?)data-src="([^"]+)"/gi, '<img$1src="$2"')
    .replace('</head>', '<link rel="stylesheet" href="../../dist/ambler.css"></head>')
    // Test-only: Squarespace's own JS reveals [data-animation-role] content; scripts are stripped, so show the revealed state.
    .replace('</head>', '<style data-fixture>[data-animation-role],.content-wrapper,article.blog-item{opacity:1!important;transform:none!important}</style></head>');
  writeFileSync(`test/fixtures/${name}.html`, html);
  writeFileSync(`test/fixtures/${name}.v2.html`, html.replace(/<html([^>]*)>/i, '<html$1 class="amb-v2">'));
  console.log(name, res.status, html.length);
}
