// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { STATUS_STEPS, nextIndex, isrcShown, confirmedCount, formatCount, applyFinal, init } from '../../src/motion.js';

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
  it('follows the real registration states', () => {
    expect(STATUS_STEPS.map((s) => s.label)).toEqual(['Draft', 'Artist input', 'Contributor input', 'QA review', 'Ready to ship', 'Shipped']);
  });
  it('loops', () => { expect(nextIndex(0)).toBe(1); expect(nextIndex(5)).toBe(0); });
  it('ISRC appears at Ready to ship (where the app mints it)', () => {
    expect(isrcShown(3)).toBe(false); expect(isrcShown(4)).toBe(true); expect(isrcShown(5)).toBe(true);
  });
});

describe('card footer follows the animation', () => {
  beforeEach(() => { document.body.innerHTML = card; });
  it('mid-sequence: footer matches bar and says waiting', () => {
    const win = { matchMedia: () => ({ matches: false }), IntersectionObserver: class { observe() {} unobserve() {} }, setInterval: () => 1, requestAnimationFrame: () => 1 };
    init(document, win); // sets step 0 (Draft)
    const c = document.querySelector('[data-status-card]');
    const fill = c.querySelector('[data-split]').style.getPropertyValue('--amb-fill');
    expect(c.querySelector('[data-confirm-pct]').textContent).toBe(fill);
    expect(c.querySelector('[data-confirm-label]').textContent).toBe('Waiting for contributors');
  });
  it('final: all confirmed, 100%', () => {
    applyFinal(document);
    const c = document.querySelector('[data-status-card]');
    expect(c.querySelector('[data-confirm-pct]').textContent).toBe('100%');
    expect(c.querySelector('[data-confirm-label]').textContent).toBe('Confirmed by all contributors');
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
    const win = { matchMedia: () => ({ matches: false }), IntersectionObserver: class { observe() {} unobserve() {} }, setInterval: () => 1, requestAnimationFrame: () => 1 };
    expect(init(document, win)).toBe('animated');
    expect(document.documentElement.classList.contains('amb-motion')).toBe(true);
  });
});
