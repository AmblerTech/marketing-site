// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { play, applyFinal, init } from '../../src/motion.js';

// Three real screens: label creates (desktop modal) → artist confirms (phone) → registration ships (list row).
const demo = `
<div data-demo>
  <ol><li data-demo-tab="create"></li><li data-demo-tab="confirm"></li><li data-demo-tab="deliver"></li></ol>
  <section data-screen="create" data-caption="Most of it is already there"><div data-scroll>
    <span data-prefilled>Harmattan Records Ltd</span>
    <span data-fill data-fill-order="1" class="is-filled">Midnight</span>
    <span data-fill data-fill-order="2" class="is-filled">98%</span>
    <span data-fill data-fill-order="3" class="is-filled">Kayo</span>
    <button data-press>Send invite</button>
  </div></section>
  <section data-screen="confirm" data-caption="The artist accepts"><div data-scroll id="phone">
    <div data-accept><button>Accept</button></div>
    <div data-accept id="second"><button>Accept</button></div>
  </div></section>
  <section data-screen="deliver" class="is-active" data-caption="Type it once">
    <div data-status-card><span class="amb-badge amb-badge--shipped" data-status-badge>Shipped</span></div>
  </section>
  <p data-caption-out>Type it once</p>
  <button type="button" data-replay>Replay</button>
</div>`;

const $ = (s) => document.querySelector(s);
const screen = () => $('[data-screen].is-active')?.dataset.screen;
const badge = () => $('[data-status-badge]').textContent;
const filled = () => document.querySelectorAll('[data-fill].is-filled').length;
const accepted = () => document.querySelectorAll('[data-accept].is-accepted').length;
const button = () => $('[data-replay]');
const run = (until) => { for (let t = 0; t < 30000; t += 50) { vi.advanceTimersByTime(50); if (until()) return true; } return false; };

describe('hero demo: create → confirm → deliver', () => {
  beforeEach(() => { vi.useFakeTimers(); document.body.innerHTML = demo; });
  afterEach(() => vi.useRealTimers());

  it('starts on the create screen, empty, at Draft', () => {
    play($('[data-demo]'), window);
    expect(screen()).toBe('create');
    expect(filled()).toBe(0);
    expect(badge()).toBe('Draft');
    expect(button().textContent).toBe('Skip');
    expect($('[data-demo-tab="create"]').classList.contains('is-active')).toBe(true);
  });

  it('prefilled fields are there from the start and get a highlight; the caption follows the screen', () => {
    play($('[data-demo]'), window);
    expect($('[data-prefilled]').classList.contains('is-flash')).toBe(true);
    expect($('[data-caption-out]').textContent).toBe('Most of it is already there');
    expect(run(() => screen() === 'confirm')).toBe(true);
    expect($('[data-caption-out]').textContent).toBe('The artist accepts');
    expect(run(() => screen() === 'deliver')).toBe(true);
    expect($('[data-caption-out]').textContent).toBe('Type it once');
  });

  it('every field is filled before the invite goes to the artist', () => {
    play($('[data-demo]'), window);
    expect(run(() => screen() === 'confirm')).toBe(true);
    expect(filled()).toBe(3);
    expect(badge()).toBe('Sent to Artist');
  });

  it('the artist accepts both suggestions before it moves on', () => {
    play($('[data-demo]'), window);
    expect(run(() => screen() === 'deliver')).toBe(true);
    expect(accepted()).toBe(2);
  });

  it('the phone scrolls to each card as the artist accepts it', () => {
    const phone = $('#phone');
    Object.defineProperty($('#second'), 'offsetTop', { value: 300 });
    Object.defineProperty(phone, 'clientHeight', { value: 200 });
    play($('[data-demo]'), window);
    expect(run(() => $('#second').classList.contains('is-accepted'))).toBe(true);
    expect(phone.scrollTop).toBe(200);
  });

  it('plays once, ends shipped on the deliver screen, and stops', () => {
    play($('[data-demo]'), window);
    vi.advanceTimersByTime(40000);
    expect(screen()).toBe('deliver');
    expect(badge()).toBe('Shipped');
    expect(button().textContent).toBe('Replay');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('Skip jumps to the end and clears timers; Replay starts again', () => {
    play($('[data-demo]'), window);
    vi.advanceTimersByTime(700);
    button().click();
    expect(screen()).toBe('deliver');
    expect(badge()).toBe('Shipped');
    expect(filled()).toBe(3);
    expect(accepted()).toBe(2);
    expect(vi.getTimerCount()).toBe(0);
    button().click();
    expect(screen()).toBe('create');
    expect(vi.getTimerCount()).toBeGreaterThan(0);
  });

  it('applyFinal shows the finished state', () => {
    document.querySelectorAll('[data-fill]').forEach((e) => e.classList.remove('is-filled'));
    applyFinal(document);
    expect(screen()).toBe('deliver');
    expect(filled()).toBe(3);
    expect(accepted()).toBe(2);
  });
});

describe('hero starts when it is seen', () => {
  it('waits for the demo to enter the viewport', () => {
    document.body.innerHTML = demo;
    document.documentElement.className = 'amb-v2';
    const observers = [];
    const win = {
      matchMedia: () => ({ matches: false }), requestAnimationFrame: () => 1,
      setTimeout: (fn, ms) => setTimeout(fn, ms), clearTimeout: (id) => clearTimeout(id),
      IntersectionObserver: class { constructor(cb) { this.cb = cb; this.els = []; observers.push(this); } observe(el) { this.els.push(el); } unobserve() {} },
    };
    init(document, win);
    const d = $('[data-demo]');
    expect(screen()).toBe('create');
    expect(button().textContent).toBe('Play');
    const obs = observers.find((o) => o.els.includes(d));
    expect(obs).toBeTruthy();
    obs.cb([{ target: d, isIntersecting: true }]);
    expect(button().textContent).toBe('Skip');
  });
});

describe('staging modal sequence', () => {
  const html = `<div data-demo>
    <section data-screen="create" data-caption="c"><div data-scroll>
      <span data-prefilled>Harmattan Records Ltd</span>
      <span data-fill data-fill-order="1" class="is-filled">Midnight</span>
      <span data-tick data-fill-order="2" class="is-filled"></span>
      <button data-press>Send invite</button></div></section>
    <section data-screen="confirm" data-caption="f"><div data-scroll><div data-accept></div></div></section>
    <section data-screen="deliver" class="is-active" data-caption="d"><div data-status-card><span data-status-badge>Shipped</span><span data-isrc data-shown="true">GB-K3A-26-00109</span></div></section>
    <p data-caption-out></p><button data-replay>Replay</button></div>`;
  beforeEach(() => { vi.useFakeTimers(); document.body.innerHTML = html; });
  afterEach(() => vi.useRealTimers());
  it('ticks are cleared on rewind and set in fill order', () => {
    play(document.querySelector('[data-demo]'), window);
    expect(document.querySelector('[data-tick]').classList.contains('is-filled')).toBe(false);
    vi.advanceTimersByTime(30000);
    expect(document.querySelector('[data-tick]').classList.contains('is-filled')).toBe(true);
  });
  it('ISRC is hidden until Ready to Ship, then shown', () => {
    play(document.querySelector('[data-demo]'), window);
    expect(document.querySelector('[data-isrc]').dataset.shown).toBe('false');
    for (let t = 0; t < 30000; t += 50) { vi.advanceTimersByTime(50); if (document.querySelector('[data-status-badge]').textContent === 'Pending Approval') break; }
    expect(document.querySelector('[data-isrc]').dataset.shown).toBe('false');
    vi.advanceTimersByTime(30000);
    expect(document.querySelector('[data-isrc]').dataset.shown).toBe('true');
  });
});
