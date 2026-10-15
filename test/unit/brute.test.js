import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

const tokens = readFileSync('src/tokens.css', 'utf8');

describe('Brute Mono tokens', () => {
  it('defines the exact palette', () => {
    for (const [k, v] of Object.entries({
      '--amb-ink': '#0c0c0c', '--amb-paper': '#f4f4f0', '--amb-rule': '#e3e3de', '--amb-coral': '#f0747e',
      '--amb-coral-deep': '#d9545f', '--amb-grey': '#6e6e68', '--amb-on-ink-muted': '#c9c9c3',
    })) expect(tokens.toLowerCase()).toContain(`${k}: ${v}`);
  });
  it('self-hosts Anton and Roboto (no Google Fonts)', () => {
    for (const f of ['anton-latin-400-normal', 'roboto-latin-400-normal', 'roboto-latin-500-normal', 'roboto-latin-700-normal']) {
      expect(existsSync(`fonts/${f}.woff2`)).toBe(true);
      expect(tokens).toContain(`${f}.woff2`);
    }
    expect(tokens).not.toMatch(/fonts\.googleapis|fonts\.gstatic/);
  });
  it('display stack falls back to condensed faces', () => {
    expect(tokens).toMatch(/--amb-display:\s*'Anton', Impact, 'Arial Narrow Bold', sans-serif/);
  });
});

import { readdirSync, statSync } from 'node:fs';

describe('assets', () => {
  const required = ['kayo', 'amara', 'tobs', 'selasi', 'midnight', 'scene-chaos', 'scene-studio', 'team-alexander', 'team-kristian', 'team-selim'];
  it('every required photo exists and is ≤ 200 KB', () => {
    for (const n of required) {
      const p = `assets/${n}.jpg`;
      expect(existsSync(p), p).toBe(true);
      expect(statSync(p).size, p).toBeLessThanOrEqual(200 * 1024);
    }
  });
  it('no unused assets (every asset is referenced by a section)', () => {
    const html = readdirSync('sections').map((f) => readFileSync(`sections/${f}`, 'utf8')).join('');
    for (const f of readdirSync('assets').filter((f) => f.endsWith('.jpg'))) expect(html, f).toContain(`__ASSETS__/${f}`);
  });
  it('every asset has a credit line', () => {
    const credits = readFileSync('assets/CREDITS.md', 'utf8');
    for (const f of readdirSync('assets').filter((f) => f.endsWith('.jpg'))) expect(credits, f).toContain(f);
  });
});

import postcss from 'postcss';
describe('square edges', () => {
  it('no border-radius outside app screens', () => {
    const root = postcss.parse(readFileSync('dist/ambler.css', 'utf8'));
    const bad = [];
    root.walkDecls(/^border(-.*)?-radius$/, (d) => {
      const sel = d.parent.selector || '';
      const allowed = /\.amb-screen|\.amb-m\b|\.amb-m__|\.amb-phone|\.amb-rc|\.amb-list|\.amb-badge|\.amb-f__|\.amb-radio|\.amb-cb|\.amb-tg|\.amb-isrc|#ambler-calc input\[type=range\]|\.amb-avatar|\.amb-step3/.test(sel);
      if (!allowed && d.value.trim() !== '0' && d.value.trim() !== '0px') bad.push(`${sel} { ${d.prop}: ${d.value} }`);
    });
    expect(bad).toEqual([]);
  });
});
