import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { noHorizontalScroll, lowContrast } from './helpers.js';

const html = readdirSync('sections').filter((f) => f.endsWith('.html')).map((f) => readFileSync(`sections/${f}`, 'utf8')).join('\n');
const text = html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

test('copy is server-rendered HTML (crawler-visible)', () => {
  for (const s of ['Register releases. Confirm credits. Ship clean data.', 'One workflow. Every stakeholder.',
    'Built for labels. Free for everyone else.', 'Validated by the industry', 'CWR · DDEX ERN · DDEX RDR-N',
    'Free during the pilot, then 50% off for 12 months.', 'Label creates', 'Data delivered']) expect(text).toContain(s);
});
test('no prices, no retired formats, fictional data only', () => {
  expect(html).not.toMatch(/€|EUR|\bMWN\b|\bRIN\b/);
  expect(html).toContain('Harmattan Records');
  expect(html).toContain('GB-K3A-26-00109');
});
test('every image has alt text', () => {
  for (const img of html.match(/<img\b[^>]*>/g) ?? []) expect(img).toMatch(/\balt="[^"]+"/);
});

for (const w of [375, 768, 1440]) {
  test(`preview @${w}: readable, no sideways scroll, hero first`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/preview/index.html');
    expect(await noHorizontalScroll(page)).toBe(true);
    expect(await lowContrast(page)).toEqual([]);
    await expect(page.locator('h1')).toHaveText('Register releases. Confirm credits. Ship clean data.');
  });
}

test('mobile: hero card sits below the headline', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/preview/index.html');
  const h1 = await page.locator('h1').boundingBox();
  const card = await page.locator('[data-status-card]').boundingBox();
  expect(card.y).toBeGreaterThan(h1.y + h1.height);
});
