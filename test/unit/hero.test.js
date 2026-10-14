// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { play, applyFinal } from '../../src/motion.js';

const card = `
<div data-status-card>
  <span class="amb-badge amb-badge--shipped" data-status-badge>Shipped</span>
  <span data-fill data-fill-order="1" class="is-filled">Kayo</span>
  <span data-fill data-fill-order="2" class="is-filled">105</span>
  <span data-fill data-fill-order="3" class="is-filled">HRM-026</span>
  <span data-isrc data-shown="true">GB-K3A-26-00109</span>
  <span class="amb-avatar is-confirmed" data-confirm>K</span><span class="amb-avatar is-confirmed" data-confirm>A</span>
  <div class="amb-bar"><span data-split="100"></span></div>
  <span data-confirm-label>Confirmed by all contributors</span><b data-confirm-pct>100%</b>
  <button type="button" data-replay>Replay</button>
</div>`;

const badge = () => document.querySelector('[data-status-badge]').textContent;
const filled = () => [...document.querySelectorAll('[data-fill]')].filter((e) => e.classList.contains('is-filled')).length;
const button = () => document.querySelector('[data-replay]');

describe('hero sequence (returning label)', () => {
  beforeEach(() => { vi.useFakeTimers(); document.body.innerHTML = card; });
  afterEach(() => vi.useRealTimers());

  it('starts empty at Draft', () => {
    play(document.querySelector('[data-status-card]'), window);
    expect(badge()).toBe('Draft');
    expect(filled()).toBe(0);
    expect(document.querySelector('[data-isrc]').dataset.shown).toBe('false');
    expect(button().textContent).toBe('Skip');
  });

  it('prefills everything before the artist is asked for input', () => {
    play(document.querySelector('[data-status-card]'), window);
    let seenArtistInputWith = null;
    for (let t = 0; t < 20000 && seenArtistInputWith === null; t += 50) {
      vi.advanceTimersByTime(50);
      if (badge() === 'Artist input') seenArtistInputWith = filled();
    }
    expect(seenArtistInputWith).toBe(3);
  });

  it('plays once, ends on Shipped, and stops', () => {
    play(document.querySelector('[data-status-card]'), window);
    vi.advanceTimersByTime(30000);
    expect(badge()).toBe('Shipped');
    expect(document.querySelector('[data-isrc]').dataset.shown).toBe('true');
    expect(button().textContent).toBe('Replay');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('Skip jumps to the end and clears timers; Replay starts again', () => {
    const c = document.querySelector('[data-status-card]');
    play(c, window);
    vi.advanceTimersByTime(600);
    button().click();
    expect(badge()).toBe('Shipped');
    expect(filled()).toBe(3);
    expect(vi.getTimerCount()).toBe(0);
    expect(button().textContent).toBe('Replay');
    button().click();
    expect(badge()).toBe('Draft');
    expect(vi.getTimerCount()).toBeGreaterThan(0);
  });

  it('applyFinal fills every prefilled field', () => {
    document.querySelectorAll('[data-fill]').forEach((e) => e.classList.remove('is-filled'));
    applyFinal(document);
    expect(filled()).toBe(3);
  });
});
