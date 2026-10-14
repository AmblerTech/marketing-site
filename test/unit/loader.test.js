// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { shouldEnable, boot } from '../../src/loader.js';

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}
const throwing = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };

describe('shouldEnable', () => {
  it('is off by default', () => expect(shouldEnable('', memoryStorage())).toBe(false));
  it('?v2=1 turns on and remembers', () => {
    const s = memoryStorage();
    expect(shouldEnable('?v2=1', s)).toBe(true);
    expect(shouldEnable('', s)).toBe(true);
  });
  it('?v2=0 turns off and forgets', () => {
    const s = memoryStorage();
    shouldEnable('?v2=1', s);
    expect(shouldEnable('?v2=0', s)).toBe(false);
    expect(shouldEnable('', s)).toBe(false);
  });
  it('reads the flag among other params', () => expect(shouldEnable('?utm_source=x&v2=1', memoryStorage())).toBe(true));
  it('ignores look-alike params', () => expect(shouldEnable('?v2=10', memoryStorage())).toBe(false));
  it('blocked storage: no throw, ?v2=1 still works for this view', () => {
    expect(shouldEnable('?v2=1', throwing)).toBe(true);
    expect(shouldEnable('', throwing)).toBe(false);
  });
  it('null storage is safe', () => expect(shouldEnable('', null)).toBe(false));
});

describe('boot', () => {
  beforeEach(() => { document.documentElement.className = ''; document.head.innerHTML = ''; localStorage.clear(); });
  const opts = { cdn: 'https://cdn.example/dist/', alwaysOn: false };

  it('without the flag touches nothing', () => {
    expect(boot(window, document, opts)).toBe(false);
    expect(document.documentElement.classList.contains('amb-v2')).toBe(false);
    expect(document.head.children.length).toBe(0);
  });
  it('alwaysOn adds class, stylesheet and deferred script', () => {
    expect(boot(window, document, { ...opts, alwaysOn: true })).toBe(true);
    expect(document.documentElement.classList.contains('amb-v2')).toBe(true);
    expect(document.head.querySelector('link[rel=stylesheet]').href).toBe('https://cdn.example/dist/ambler.css');
    const s = document.head.querySelector('script');
    expect(s.src).toBe('https://cdn.example/dist/ambler.js');
    expect(s.defer).toBe(true);
  });
  it('remembered flag enables', () => {
    localStorage.setItem('amb-v2', '1');
    expect(boot(window, document, opts)).toBe(true);
  });
});
