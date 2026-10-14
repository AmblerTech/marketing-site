// Progressive enhancement only. HTML already holds final states;
// we rewind them only when we are sure we can animate forward again.
export const STATUS_STEPS = [
  { key: 'draft', label: 'Draft', cls: 'amb-badge--draft' },
  { key: 'artist_input', label: 'Artist input', cls: 'amb-badge--progress' },
  { key: 'contributor_input', label: 'Contributor input', cls: 'amb-badge--progress' },
  { key: 'qa_review', label: 'QA review', cls: 'amb-badge--progress' },
  { key: 'ready_to_ship', label: 'Ready to ship', cls: 'amb-badge--ready' },
  { key: 'shipped', label: 'Shipped', cls: 'amb-badge--shipped' },
];
const READY = STATUS_STEPS.findIndex((s) => s.key === 'ready_to_ship');
const BADGE_CLASSES = [...new Set(STATUS_STEPS.map((s) => s.cls))];

export const nextIndex = (i) => (i + 1) % STATUS_STEPS.length;
export const isrcShown = (i) => i >= READY;
const QA = STATUS_STEPS.findIndex((s) => s.key === 'qa_review');
// Draft: nobody. Artist input: the main artist. Contributor input: all but the last. QA onwards: everyone.
export function confirmedCount(i, total) {
  if (i <= 0) return 0;
  if (i >= QA) return total;
  return i === 1 ? 1 : total - 1;
}
export function formatCount(v, { prefix = '', suffix = '', decimals = 0 } = {}) {
  return `${prefix}${Number(v).toFixed(decimals)}${suffix}`;
}
const countOpts = (el) => ({ prefix: el.dataset.prefix || '', suffix: el.dataset.suffix || '', decimals: Number(el.dataset.decimals || 0) });

function setStatus(card, i) {
  const s = STATUS_STEPS[i];
  const badge = card.querySelector('[data-status-badge]');
  if (badge) { badge.classList.remove(...BADGE_CLASSES); badge.classList.add(s.cls); badge.dataset.key = s.key; badge.textContent = s.label; }
  const isrc = card.querySelector('[data-isrc]');
  if (isrc) isrc.dataset.shown = String(isrcShown(i));
  const avatars = card.querySelectorAll('[data-confirm]');
  const done = confirmedCount(i, avatars.length);
  avatars.forEach((a, n) => a.classList.toggle('is-confirmed', n < done));
  const pct = `${avatars.length ? Math.round((done / avatars.length) * 100) : 100}%`;
  const bar = card.querySelector('[data-split]');
  if (bar) bar.style.setProperty('--amb-fill', pct);
  const pctEl = card.querySelector('[data-confirm-pct]');
  if (pctEl) pctEl.textContent = pct;
  const label = card.querySelector('[data-confirm-label]');
  if (label) label.textContent = pct === '100%' ? 'Confirmed by all contributors' : 'Waiting for contributors';
}

export function applyFinal(doc) {
  doc.querySelectorAll('[data-status-card]').forEach((c) => setStatus(c, STATUS_STEPS.length - 1));
  doc.querySelectorAll('[data-count]').forEach((el) => { el.textContent = formatCount(Number(el.dataset.count), countOpts(el)); });
  doc.querySelectorAll('[data-split]').forEach((el) => el.style.setProperty('--amb-fill', `${el.dataset.split}%`));
  doc.querySelectorAll('[data-confirm]').forEach((el) => el.classList.add('is-confirmed'));
}

function countUp(el, win) {
  const target = Number(el.dataset.count); const opts = countOpts(el); const start = performance.now(); const dur = 1200;
  const tick = (now) => {
    const t = Math.min(1, (now - start) / dur); const eased = 1 - (1 - t) ** 3;
    el.textContent = formatCount(target * eased, opts);
    if (t < 1) win.requestAnimationFrame(tick);
  };
  win.requestAnimationFrame(tick);
}

export function init(doc, win) {
  const reduced = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || typeof win.IntersectionObserver !== 'function') { applyFinal(doc); return 'final'; }
  doc.documentElement.classList.add('amb-motion');

  const io = new win.IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      el.classList.add('is-in');
      if (el.matches('[data-count]')) countUp(el, win);
      if (el.matches('[data-split]') && !el.closest('[data-status-card]')) el.style.setProperty('--amb-fill', `${el.dataset.split}%`);
      io.unobserve(el);
    }
  }, { threshold: 0.2 });

  doc.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
  doc.querySelectorAll('[data-count]').forEach((el) => { el.textContent = formatCount(0, countOpts(el)); io.observe(el); });
  doc.querySelectorAll('[data-split]').forEach((el) => { if (!el.closest('[data-status-card]')) { el.style.setProperty('--amb-fill', '0%'); io.observe(el); } });

  doc.querySelectorAll('[data-status-card]').forEach((card) => {
    let i = 0; setStatus(card, i);
    win.setInterval(() => { i = nextIndex(i); setStatus(card, i); }, 1800);
  });
  return 'animated';
}
