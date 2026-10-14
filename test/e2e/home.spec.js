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

test('reduced motion: final states, nothing hidden', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/preview/index.html');
  await expect(page.locator('[data-status-badge]')).toHaveText('Shipped');
  const hidden = await page.$$eval('[data-reveal]', (els) => els.filter((e) => getComputedStyle(e).opacity !== '1').length);
  expect(hidden).toBe(0);
});

test('JS blocked: all copy visible', async ({ page }) => {
  await page.route('**/dist/ambler.js', (r) => r.abort());
  await page.goto('/preview/index.html');
  const hidden = await page.$$eval('[data-reveal]', (els) => els.filter((e) => getComputedStyle(e).opacity !== '1').length);
  expect(hidden).toBe(0);
  await expect(page.locator('[data-count="93"]')).toHaveText('93%');
});

test('animated: badge cycles and no console errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto('/preview/index.html');
  await expect(page.locator('[data-status-badge]')).toHaveText('Draft');
  await expect(page.locator('[data-status-badge]')).toHaveText('Artist input', { timeout: 7000 });
  await page.locator('[data-count="93"]').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-count="93"]')).toHaveText('93%', { timeout: 4000 });
  expect(errors).toEqual([]);
});

test('animated @375: no sideways scroll mid-animation', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/preview/index.html');
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('animated: reveals start hidden and come in on scroll', async ({ page }) => {
  await page.goto('/preview/index.html');
  const last = page.locator('[data-reveal]').last();
  expect(await last.evaluate((e) => getComputedStyle(e).opacity)).toBe('0');
  await last.scrollIntoViewIfNeeded();
  await expect.poll(() => last.evaluate((e) => getComputedStyle(e).opacity), { timeout: 3000 }).toBe('1');
});

test('hero: prefilled fields arrive first, then it ships once and offers Replay', async ({ page }) => {
  await page.goto('/preview/index.html');
  const card = page.locator('[data-status-card]');
  await expect(card.locator('[data-replay]')).toHaveText('Skip');
  await expect(page.locator('[data-status-badge]')).toHaveText('Artist input', { timeout: 7000 });
  expect(await card.locator('[data-fill]:not(.is-filled)').count()).toBe(0);
  await expect(page.locator('[data-status-badge]')).toHaveText('Shipped', { timeout: 10000 });
  await expect(card.locator('[data-replay]')).toHaveText('Replay');
  await expect(card.locator('[data-isrc]')).toBeVisible();
});

test('hero: Skip stops the animation on the final state', async ({ page }) => {
  await page.goto('/preview/index.html');
  await page.locator('[data-replay]').click();
  await expect(page.locator('[data-status-badge]')).toHaveText('Shipped');
  await page.waitForTimeout(2500);
  await expect(page.locator('[data-status-badge]')).toHaveText('Shipped');
});
