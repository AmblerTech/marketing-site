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
  doc.querySelectorAll('[data-status-card]').forEach((c) => finishCard(c));
  doc.querySelectorAll('[data-count]').forEach((el) => { el.textContent = formatCount(Number(el.dataset.count), countOpts(el)); });
  doc.querySelectorAll('[data-split]').forEach((el) => el.style.setProperty('--amb-fill', `${el.dataset.split}%`));
  doc.querySelectorAll('[data-confirm]').forEach((el) => el.classList.add('is-confirmed'));
}

const FILL_MS = 280;      // gap between prefilled fields appearing
const STEP_MS = 1100;     // gap between status changes
const timers = new WeakMap();

function clearCard(card, win) {
  (timers.get(card) || []).forEach((id) => win.clearTimeout(id));
  timers.set(card, []);
}

function finishCard(card) {
  card.querySelectorAll('[data-fill]').forEach((el) => el.classList.add('is-filled'));
  setStatus(card, STATUS_STEPS.length - 1);
  const btn = card.querySelector('[data-replay]');
  if (btn) btn.textContent = 'Replay';
}

// Empty card at Draft, waiting to be seen. The button plays it on demand.
function rewind(card, win, label) {
  clearCard(card, win);
  card.querySelectorAll('[data-fill]').forEach((el) => el.classList.remove('is-filled'));
  setStatus(card, 0);
  const btn = card.querySelector('[data-replay]');
  if (!btn) return null;
  btn.textContent = label;
  if (!btn.dataset.bound) {
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      if (btn.textContent === 'Skip') { clearCard(card, win); finishCard(card); } else play(card, win);
    });
  }
  return btn;
}

// One pass: everything Ambler already knows fills in, then people confirm, then it ships. Ends on Shipped.
export function play(card, win) {
  const btn = rewind(card, win, 'Skip');
  const fills = [...card.querySelectorAll('[data-fill]')].sort((a, b) => Number(a.dataset.fillOrder) - Number(b.dataset.fillOrder));
  const ids = [];
  const at = (ms, fn) => ids.push(win.setTimeout(fn, ms));
  fills.forEach((el, n) => at(400 + n * FILL_MS, () => el.classList.add('is-filled')));
  const prefilledBy = 400 + fills.length * FILL_MS;
  for (let i = 1; i < STATUS_STEPS.length; i++) {
    const last = i === STATUS_STEPS.length - 1;
    at(prefilledBy + i * STEP_MS, () => { setStatus(card, i); if (last) { timers.set(card, []); if (btn) btn.textContent = 'Replay'; } });
  }
  timers.set(card, ids);
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
      if (el.matches('[data-status-card]')) play(el, win);
      io.unobserve(el);
    }
  }, { threshold: 0.2 });

  doc.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
  doc.querySelectorAll('[data-count]').forEach((el) => { el.textContent = formatCount(0, countOpts(el)); io.observe(el); });
  doc.querySelectorAll('[data-split]').forEach((el) => { if (!el.closest('[data-status-card]')) { el.style.setProperty('--amb-fill', '0%'); io.observe(el); } });

  // The hero plays when it is first seen (on phones it sits below the headline).
  doc.querySelectorAll('[data-status-card]').forEach((card) => { rewind(card, win, 'Play'); io.observe(card); });
  return 'animated';
}

// Bundle entry. The loader inserts ambler.js from script, so `defer` is ignored and the file can run
// before the body is parsed — wait for DOMContentLoaded in that case.
export function start(doc, win) {
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', () => init(doc, win), { once: true });
  else init(doc, win);
}
