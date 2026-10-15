import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { noHorizontalScroll, lowContrast } from './helpers.js';

const html = readdirSync('sections').filter((f) => f.endsWith('.html')).map((f) => readFileSync(`sections/${f}`, 'utf8')).join('\n');
const text = html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

test('copy is server-rendered HTML (crawler-visible)', () => {
  for (const s of ['Register releases.', 'Confirm credits.', 'Ship clean data.', 'One single.', 'Four people.', 'One record.',
    'Metadata work costs hours', 'on every release.', 'One workflow.', 'Confirmed at source.', 'Built for labels.',
    'Free for everyone else.', 'Register once.', 'Ship everywhere.', 'We did this job by hand.', 'Then we built the fix.',
    'Now accepting', 'Cohort 2.', '3-month trial — then 50% off for the first year', 'CWR · DDEX ERN · DDEX RDR-N',
    "We don't release music, collect royalties or publish. We make sure the data is right.", 'Label creates', 'Data delivered']) expect(text).toContain(s);
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
    await expect(page.locator('h1')).toHaveText(/Register releases\.\s*Confirm credits\.\s*Ship clean data\./);
  });
}

test('mobile: hero card sits below the headline', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/preview/index.html');
  const h1 = await page.locator('h1').boundingBox();
  const card = await page.locator('[data-demo]').boundingBox();
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
  await expect(page.locator('[data-status-badge]')).toHaveText('Sent to Artist', { timeout: 8000 });
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

test('hero: create (prefilled) → artist confirms → ships once, then offers Replay', async ({ page }) => {
  await page.goto('/preview/index.html');
  const demo = page.locator('[data-demo]');
  await expect(demo.locator('[data-replay]')).toHaveText('Skip');
  await expect(demo.locator('[data-screen="create"]')).toHaveClass(/is-active/);
  await expect(demo.locator('[data-screen="confirm"]')).toHaveClass(/is-active/, { timeout: 8000 });
  expect(await demo.locator('[data-fill]:not(.is-filled)').count()).toBe(0);
  await expect(demo.locator('[data-screen="confirm"]')).toContainText('Suggested by Harmattan Records');
  await expect(demo.locator('[data-screen="deliver"]')).toHaveClass(/is-active/, { timeout: 6000 });
  await expect(page.locator('[data-status-badge]')).toHaveText('Shipped', { timeout: 6000 });
  await expect(demo.locator('[data-replay]')).toHaveText('Replay');
});

test('hero: Skip stops the animation on the final state', async ({ page }) => {
  await page.goto('/preview/index.html');
  await page.locator('[data-replay]').click();
  await expect(page.locator('[data-status-badge]')).toHaveText('Shipped');
  await page.waitForTimeout(2500);
  await expect(page.locator('[data-status-badge]')).toHaveText('Shipped');
});

test('hero @375: the three step tabs fit inside the demo', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/preview/index.html');
  const fits = await page.evaluate(() => {
    const d = document.querySelector('[data-demo]').getBoundingClientRect();
    return [...document.querySelectorAll('[data-demo-tab]')].every((t) => t.getBoundingClientRect().right <= d.right + 1);
  });
  expect(fits).toBe(true);
});

test('grounds alternate ink / paper / ink as specified', async ({ page }) => {
  await page.goto('/preview/index.html');
  const grounds = await page.$$eval('.amb-sec', (els) => els.map((e) => [...e.classList].find((c) => c.startsWith('amb-sec--'))));
  expect(grounds).toEqual(['amb-sec--ink', 'amb-sec--paper', 'amb-sec--ink', 'amb-sec--ink', 'amb-sec--paper', 'amb-sec--ink', 'amb-sec--paper', 'amb-sec--coral']);
});

test('@375 with fonts blocked: Anton fallback keeps headlines inside the viewport', async ({ page }) => {
  await page.route('**/*.woff2', (r) => r.abort());
  await page.setViewportSize({ width: 375, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/preview/index.html');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const clipped = await page.$$eval('.amb-h1, .amb-h2', (els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1).length);
  expect(clipped).toBe(0);
});

test('coral text on paper uses coral-deep', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/preview/index.html');
  // Coral #F0747E is only allowed where the text actually sits on ink (e.g. the featured black card).
  const bad = await page.$$eval('.amb-sec--paper *', (els) => els.filter((e) => {
    if (getComputedStyle(e).color !== 'rgb(240, 116, 126)' || !e.textContent.trim()) return false;
    for (let a = e; a; a = a.parentElement) { const bg = getComputedStyle(a).backgroundColor; if (bg !== 'rgba(0, 0, 0, 0)') return bg !== 'rgb(12, 12, 12)'; }
    return true;
  }).map((e) => e.textContent.trim().slice(0, 30)));
  expect(bad).toEqual([]);
});
