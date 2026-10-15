import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const html = readFileSync('pages/faq.html', 'utf8');
const clean = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/\s+/g, ' ').trim();

test('FAQ has one h1 and every question is an h2 with an answer', () => {
  expect(html.match(/<h1\b/g)?.length).toBe(1);
  const qs = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => clean(m[1]));
  expect(qs.length).toBeGreaterThanOrEqual(6);
  for (const q of qs) expect(q.endsWith('?')).toBe(true);
});

test('FAQPage schema matches the visible questions and answers exactly', () => {
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  expect(ld['@type']).toBe('FAQPage');
  const items = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>\s*<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => [clean(m[1]), clean(m[2])]);
  expect(ld.mainEntity.map((q) => [q.name, q.acceptedAnswer.text])).toEqual(items);
});

test('FAQ copy follows the claim rules', () => {
  const text = clean(html);
  expect(text).not.toMatch(/€|\bEUR\b|\bMWN\b|\bRIN\b/);
  expect(text).not.toMatch(/directly to|the only|first time, every time|all data is hosted/i);
  for (const s of ['neutral by design', '4–5 hours', 'under five minutes', 'Design Partner Programme']) expect(text).toContain(s);
});
