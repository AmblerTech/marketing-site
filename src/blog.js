// The Squarespace blog list template renders every post title as an h1, so /blog has a dozen of them
// and no page heading. Titles become h2s (Squarespace styles them by class, so nothing moves) and the
// list gets one h1 of its own. Post pages use h1.entry-title and are left alone.
export function fixBlogHeadings(doc) {
  const titles = doc.querySelectorAll('h1.blog-title');
  if (!titles.length) return;
  titles.forEach((h1) => {
    const h2 = doc.createElement('h2');
    for (const a of h1.attributes) h2.setAttribute(a.name, a.value);
    // Squarespace's fade-in keeps animating the old h1, so a copied pre-animation class (preFlex, preFade…)
    // would leave the h2 at opacity 0 for good.
    [...h2.classList].filter((c) => /^pre[A-Z]/.test(c)).forEach((c) => h2.classList.remove(c));
    while (h1.firstChild) h2.appendChild(h1.firstChild);
    h1.replaceWith(h2);
  });
  if (doc.querySelector('h1')) return;
  const first = doc.querySelector('article.blog-item');
  if (!first) return;
  const h1 = doc.createElement('h1');
  h1.className = 'amb-h1 amb-blog-h1';
  h1.innerHTML = 'Music registration,<br> <span class="amb-accent">explained.</span>';
  first.before(h1);
}
