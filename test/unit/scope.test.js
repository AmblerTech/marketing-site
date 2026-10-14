import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';

describe('dist/ambler.css scoping', () => {
  const root = postcss.parse(readFileSync('dist/ambler.css', 'utf8'));
  it('every rule is under .amb-v2', () => {
    const bad = [];
    root.walkRules((rule) => {
      if (rule.parent?.type === 'atrule' && /keyframes/.test(rule.parent.name)) return;
      for (const sel of rule.selectors) {
        if (!/^(html)?\.amb-v2(?![\w-])/.test(sel.trim())) bad.push(sel);
      }
    });
    expect(bad).toEqual([]);
  });
  it('defines the base utilities', () => {
    const css = readFileSync('dist/ambler.css', 'utf8');
    for (const cls of ['.amb-btn', '.amb-btn--primary', '.amb-wrap', '.amb-h1', '.amb-h2', '.amb-lede']) expect(css).toContain(cls);
  });
});
