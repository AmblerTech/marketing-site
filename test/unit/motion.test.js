// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { STATUS_STEPS, nextIndex, isrcShown, confirmedCount, formatCount, applyFinal, init, start } from '../../src/motion.js';

const card = `
  <div data-status-card><span class="amb-badge amb-badge--draft" data-status-badge data-key="draft">Draft</span>
  <span data-isrc data-shown="false">GB-K3A-26-00109</span>
  <span class="amb-avatar" data-confirm>K</span><span class="amb-avatar" data-confirm>A</span>
  <div class="amb-bar"><span data-split="100"></span></div>
  <span data-confirm-label>Confirmed by all contributors</span><b data-confirm-pct>100%</b></div>
  <p data-count="93" data-suffix="%">0%</p>
  <div class="amb-bar"><span data-split="100" style="--amb-fill: 0%"></span></div>
  <span class="amb-avatar" data-confirm>K</span>
  <div data-reveal>Hello</div>`;

describe('status sequence', () => {
  it('follows the real registration states, with the app badge labels', () => {
    expect(STATUS_STEPS.map((s) => s.label)).toEqual(['Draft', 'Sent to Artist', 'Contributor Input', 'Pending Approval', 'Ready to Ship', 'Shipped']);
  });
  it('loops', () => { expect(nextIndex(0)).toBe(1); expect(nextIndex(5)).toBe(0); });
  it('ISRC appears at Ready to ship (where the app mints it)', () => {
    expect(isrcShown(3)).toBe(false); expect(isrcShown(4)).toBe(true); expect(isrcShown(5)).toBe(true);
  });
});

describe('confirmations follow the workflow', () => {
  it('nobody at draft, the artist at artist input, all four before QA', () => {
    expect(confirmedCount(0, 4)).toBe(0);
    expect(confirmedCount(1, 4)).toBe(1);
    expect(confirmedCount(2, 4)).toBe(3);
    for (const i of [3, 4, 5]) expect(confirmedCount(i, 4)).toBe(4);
  });
});

describe('formatCount', () => {
  it('formats', () => {
    expect(formatCount(93, { suffix: '%' })).toBe('93%');
    expect(formatCount(12, { suffix: '+' })).toBe('12+');
    expect(formatCount(4.5, { decimals: 1 })).toBe('4.5');
  });
});

describe('applyFinal / init', () => {
  beforeEach(() => { document.body.innerHTML = card; document.documentElement.className = 'amb-v2'; });
  it('applyFinal shows every end state', () => {
    applyFinal(document);
    const b = document.querySelector('[data-status-badge]');
    expect(b.textContent).toBe('Shipped'); expect(b.className).toContain('amb-badge--shipped');
    expect(document.querySelector('[data-isrc]').dataset.shown).toBe('true');
    expect(document.querySelector('[data-count]').textContent).toBe('93%');
    expect(document.querySelector('[data-split]').style.getPropertyValue('--amb-fill')).toBe('100%');
    expect(document.querySelector('[data-confirm]').classList.contains('is-confirmed')).toBe(true);
  });
  it('reduced motion → final, no amb-motion class', () => {
    const win = { matchMedia: () => ({ matches: true }), IntersectionObserver: function () {} };
    expect(init(document, win)).toBe('final');
    expect(document.documentElement.classList.contains('amb-motion')).toBe(false);
  });
  it('no IntersectionObserver → final', () => {
    const win = { matchMedia: () => ({ matches: false }) };
    expect(init(document, win)).toBe('final');
  });
  it('normal → animated, amb-motion class set', () => {
    const win = { matchMedia: () => ({ matches: false }), IntersectionObserver: class { observe() {} unobserve() {} }, setTimeout: () => 1, clearTimeout() {}, requestAnimationFrame: () => 1 };
    expect(init(document, win)).toBe('animated');
    expect(document.documentElement.classList.contains('amb-motion')).toBe(true);
  });
});

describe('start (bundle entry)', () => {
  const win = { matchMedia: () => ({ matches: false }), IntersectionObserver: class { observe() {} unobserve() {} }, setTimeout: () => 1, clearTimeout() {}, requestAnimationFrame: () => 1 };
  beforeEach(() => { document.documentElement.className = 'amb-v2'; });
  it('waits for DOMContentLoaded while the document is still loading', () => {
    const listeners = {};
    const doc = ({
      readyState: 'loading',
      addEventListener: (t, fn) => { listeners[t] = fn; },
      documentElement: document.documentElement,
      querySelectorAll: (s) => document.querySelectorAll(s),
    });
    start(doc, win);
    expect(document.documentElement.classList.contains('amb-motion')).toBe(false);
    listeners.DOMContentLoaded();
    expect(document.documentElement.classList.contains('amb-motion')).toBe(true);
  });
  it('runs immediately once the document is parsed', () => {
    start(document, win);
    expect(document.documentElement.classList.contains('amb-motion')).toBe(true);
  });
});

describe('image retry (jsDelivr cold-cache 503s)', () => {
  it('retries a failed CDN image once after a delay, with a cache-buster', async () => {
    const { retryImages } = await import('../../src/motion.js');
    document.body.innerHTML = '<img id="a" src="https://cdn.jsdelivr.net/gh/x/y@v1/assets/k.jpg"><img id="b" src="https://example.com/k.jpg">';
    const timers = [];
    const win = { setTimeout: (fn, ms) => { timers.push([fn, ms]); return 1; } };
    retryImages(document, win);
    document.getElementById('a').dispatchEvent(new Event('error'));
    document.getElementById('b').dispatchEvent(new Event('error'));
    expect(timers.length).toBe(1);
    expect(timers[0][1]).toBe(1500);
    timers[0][0]();
    expect(document.getElementById('a').getAttribute('src')).toBe('https://cdn.jsdelivr.net/gh/x/y@v1/assets/k.jpg?retry=1');
    document.getElementById('a').dispatchEvent(new Event('error'));
    expect(timers.length).toBe(1); // only one retry
  });
});
