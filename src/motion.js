// Progressive enhancement only. HTML already holds final states;
// we rewind them only when we are sure we can animate forward again.
export const STATUS_STEPS = [
  // Labels and colours as the app's registration-status-badge.tsx renders them.
  { key: 'draft', label: 'Draft', cls: 'amb-badge--draft' },
  { key: 'artist_input', label: 'Sent to Artist', cls: 'amb-badge--blue' },
  { key: 'contributor_input', label: 'Contributor Input', cls: 'amb-badge--purple' },
  { key: 'qa_review', label: 'Pending Approval', cls: 'amb-badge--progress' },
  { key: 'ready_to_ship', label: 'Ready to Ship', cls: 'amb-badge--shipped' },
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
  doc.querySelectorAll('[data-demo]').forEach((d) => finishDemo(d));
  doc.querySelectorAll('[data-status-card]').forEach((c) => finishCard(c));
  doc.querySelectorAll('[data-count]').forEach((el) => { el.textContent = formatCount(Number(el.dataset.count), countOpts(el)); });
  doc.querySelectorAll('[data-split]').forEach((el) => el.style.setProperty('--amb-fill', `${el.dataset.split}%`));
  doc.querySelectorAll('[data-confirm]').forEach((el) => el.classList.add('is-confirmed'));
}

const T = { first: 1400, fill: 550, glide: 1100, settle: 600, press: 450, accept: 900, toDeliver: 900, step: 1000 };
const timers = new WeakMap();

function clearDemo(demo, win) {
  (timers.get(demo) || []).forEach((id) => win.clearTimeout(id));
  timers.set(demo, []);
}

function show(demo, name) {
  demo.querySelectorAll('[data-screen]').forEach((el) => el.classList.toggle('is-active', el.dataset.screen === name));
  const screen = demo.querySelector(`[data-screen="${name}"]`);
  const caption = demo.querySelector('[data-caption-out]');
  if (caption && screen && screen.dataset.caption) caption.textContent = screen.dataset.caption;
  demo.querySelectorAll('[data-demo-tab]').forEach((el) => el.classList.toggle('is-active', el.dataset.demoTab === name));
}

// Keep the field being filled (or the card being accepted) in the middle of its scrolling panel.
function scrollToField(el) {
  const scroller = el.closest('[data-scroll]');
  if (scroller) scroller.scrollTop = Math.max(0, el.offsetTop + el.offsetHeight / 2 - scroller.clientHeight / 2);
}

function finishDemo(demo) {
  demo.querySelectorAll('[data-fill], [data-tick]').forEach((el) => el.classList.add('is-filled'));
  demo.querySelectorAll('[data-accept]').forEach((el) => el.classList.add('is-accepted'));
  demo.querySelectorAll('[data-press]').forEach((el) => el.classList.remove('is-pressed'));
  demo.querySelectorAll('[data-status-card]').forEach((c) => finishCard(c));
  show(demo, 'deliver');
  const btn = demo.querySelector('[data-replay]');
  if (btn) btn.textContent = 'Replay';
}

function finishCard(card) {
  setStatus(card, STATUS_STEPS.length - 1);
}

// Back to an empty Create screen at Draft. The button plays it on demand.
function rewind(demo, win, label) {
  clearDemo(demo, win);
  demo.querySelectorAll('[data-fill], [data-tick]').forEach((el) => el.classList.remove('is-filled'));
  demo.querySelectorAll('[data-prefilled]').forEach((el) => el.classList.remove('is-flash'));
  demo.querySelectorAll('[data-accept]').forEach((el) => el.classList.remove('is-accepted'));
  demo.querySelectorAll('[data-status-card]').forEach((c) => setStatus(c, 0));
  demo.querySelectorAll('[data-scroll]').forEach((el) => { el.scrollTop = 0; });
  show(demo, 'create');
  const btn = demo.querySelector('[data-replay]');
  if (!btn) return null;
  btn.textContent = label;
  if (!btn.dataset.bound) {
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      if (btn.textContent === 'Skip') { clearDemo(demo, win); finishDemo(demo); } else play(demo, win);
    });
  }
  return btn;
}

// One pass, the video's spine: the label creates (most fields already there) → the artist accepts the
// label's suggested splits → the registration moves through review and ships. Ends on Shipped.
export function play(demo, win) {
  const btn = rewind(demo, win, 'Skip');
  const row = demo.querySelector('[data-status-card]');
  // What Ambler already knows is there when the modal opens; a brief highlight points it out.
  demo.querySelectorAll('[data-prefilled]').forEach((el) => el.classList.add('is-flash'));
  const ids = [];
  let t = T.first;
  const at = (fn) => ids.push(win.setTimeout(fn, t));

  const fills = [...demo.querySelectorAll('[data-fill], [data-tick]')].sort((a, b) => Number(a.dataset.fillOrder) - Number(b.dataset.fillOrder));
  fills.forEach((el) => { at(() => { el.classList.add('is-filled'); scrollToField(el); }); t += T.fill; });
  // Glide past everything that was already filled in, down to the invite.
  const prefilled = [...demo.querySelectorAll('[data-scroll] [data-prefilled]')];
  [prefilled[Math.floor(prefilled.length / 2)], prefilled[prefilled.length - 1]].filter(Boolean).forEach((el) => { t += T.glide; at(() => scrollToField(el)); });
  const press = demo.querySelector('[data-press]');
  t += T.settle; at(() => press && press.classList.add('is-pressed'));
  t += T.press; at(() => { if (press) press.classList.remove('is-pressed'); show(demo, 'confirm'); if (row) setStatus(row, 1); });
  demo.querySelectorAll('[data-accept]').forEach((el) => {
    t += T.accept / 2; at(() => scrollToField(el));
    t += T.accept / 2; at(() => el.classList.add('is-accepted'));
  });
  t += T.toDeliver; at(() => { show(demo, 'deliver'); if (row) setStatus(row, 2); });
  for (let i = 3; i < STATUS_STEPS.length; i++) {
    t += T.step;
    const last = i === STATUS_STEPS.length - 1;
    at(() => { if (row) setStatus(row, i); if (last) { timers.set(demo, []); if (btn) btn.textContent = 'Replay'; } });
  }
  timers.set(demo, ids);
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
      if (el.matches('[data-demo]')) play(el, win);
      io.unobserve(el);
    }
  }, { threshold: 0.2 });

  doc.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
  doc.querySelectorAll('[data-count]').forEach((el) => { el.textContent = formatCount(0, countOpts(el)); io.observe(el); });
  doc.querySelectorAll('[data-split]').forEach((el) => { if (!el.closest('[data-status-card]')) { el.style.setProperty('--amb-fill', '0%'); io.observe(el); } });

  // The hero plays when it is first seen (on phones it sits below the headline).
  doc.querySelectorAll('[data-demo]').forEach((demo) => { rewind(demo, win, 'Play'); io.observe(demo); });
  return 'animated';
}

// Bundle entry. The loader inserts ambler.js from script, so `defer` is ignored and the file can run
// before the body is parsed — wait for DOMContentLoaded in that case.
export function start(doc, win) {
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', () => init(doc, win), { once: true });
  else init(doc, win);
}
