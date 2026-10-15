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
