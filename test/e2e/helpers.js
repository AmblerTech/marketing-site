export const noHorizontalScroll = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

export const lowContrast = (page, min = 4.5) => page.evaluate((min) => {
  const parse = (c) => { const m = c.match(/[\d.]+/g); return m ? m.map(Number) : [0, 0, 0, 0]; };
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const bgOf = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.backgroundImage !== 'none' && !/url\(/.test(s.backgroundImage)) return null; // gradient: skip, checked visually
      const c = parse(s.backgroundColor);
      if ((c[3] ?? 1) > 0.5) return c;
    }
    return parse(getComputedStyle(document.documentElement).backgroundColor);
  };
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const t = walker.currentNode; const el = t.parentElement;
    if (!t.textContent.trim() || !el) continue;
    const s = getComputedStyle(el); const r = el.getBoundingClientRect();
    if (s.visibility === 'hidden' || s.display === 'none' || r.width === 0 || Number(s.opacity) === 0) continue;
    if (s.color === 'rgba(0, 0, 0, 0)') continue; // gradient text
    // Text drawn over a photo (e.g. a Squarespace text block layered on an image block) can't be measured from colours.
    const cx = r.left + Math.min(r.width, 40) / 2, cy = r.top + r.height / 2;
    if (cx >= 0 && cy >= 0 && cx <= innerWidth && cy <= innerHeight && document.elementsFromPoint(cx, cy).some((x) => x.tagName === 'IMG')) continue;
    const bg = bgOf(el); if (!bg) continue;
    const a = lum(parse(s.color)); const b = lum(bg);
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    const large = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.66 && Number(s.fontWeight) >= 700);
    if (ratio < (large ? 3 : min)) out.push({ text: t.textContent.trim().slice(0, 60), ratio: +ratio.toFixed(2), fg: s.color, bg: `rgb(${bg.slice(0, 3)})` });
  }
  return out;
}, min);

export const visibleTextCount = (page) => page.evaluate(() => {
  let n = 0;
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) {
    const el = w.currentNode.parentElement;
    if (w.currentNode.textContent.trim().length > 3 && el && el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) n++;
  }
  return n;
});
