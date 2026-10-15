import { test, expect } from '@playwright/test';
import { noHorizontalScroll, lowContrast, visibleTextCount } from './helpers.js';

const pages = ['home', 'blog', 'post', 'faq', 'partner', 'privacy', 'kitchen', 'homev2'];
const widths = [375, 1440];

for (const name of pages) {
  test(`${name}: without the flag, dist CSS changes nothing visible`, async ({ page }) => {
    await page.goto(`/test/fixtures/${name}.html`);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).not.toBe('rgb(244, 244, 240)');
  });
  for (const w of widths) {
    test(`${name} @${w}: paper, readable, no sideways scroll`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto(`/test/fixtures/${name}.v2.html`);
      await page.waitForLoadState('networkidle');
      expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(244, 244, 240)');
      expect(await visibleTextCount(page)).toBeGreaterThan(20); // contrast check must see real content
      expect(await lowContrast(page)).toEqual([]);
      expect(await noHorizontalScroll(page)).toBe(true);
    });
  }
}

test('blog list: posts are square 1.5px boxes', async ({ page }) => {
  await page.goto('/test/fixtures/blog.v2.html');
  const s = await page.locator('.view-list article.blog-item').first().evaluate((e) => { const c = getComputedStyle(e); return [c.borderTopWidth, c.borderTopLeftRadius]; });
  expect(['1px', '1.5px']).toContain(s[0]); expect(s[1]).toBe('0px'); // 1.5px rounds to 1px on 1x screens
});

test('blog post: article in a square 1.5px reading column', async ({ page }) => {
  await page.goto('/test/fixtures/post.v2.html');
  const s = await page.locator('.blog-item-content-wrapper').first().evaluate((e) => { const c = getComputedStyle(e); return [c.borderTopWidth, c.borderTopLeftRadius]; });
  expect(['1px', '1.5px']).toContain(s[0]); expect(s[1]).toBe('0px'); // 1.5px rounds to 1px on 1x screens
});

test('header logo: uses the dark-background logo file, not a filtered (flattened) light one', async ({ page }) => {
  await page.goto('/test/fixtures/blog.v2.html');
  const s = await page.locator('#header .header-title-logo img').first().evaluate((img) => {
    const cs = getComputedStyle(img);
    return { filter: cs.filter, bg: cs.backgroundImage, objectPosition: cs.objectPosition, alt: img.alt };
  });
  expect(s.filter).toBe('none');
  expect(s.bg).toContain('bafa68d3-4b56-4028-9b4d-d0ab0fad905b');
  expect(s.objectPosition).toBe('-9999px 0px');
  expect(s.alt.length).toBeGreaterThan(0);
});

test('FAQ page title is Anton; Design Partner form card is square', async ({ page }) => {
  await page.goto('/test/fixtures/faq.v2.html');
  expect(await page.locator('h3', { hasText: 'Frequently Asked Questions' }).evaluate((e) => getComputedStyle(e).fontFamily)).toMatch(/Anton/);
  await page.goto('/test/fixtures/partner.v2.html');
  const radii = await page.$$eval('.sqs-block-form', (els) => els.map((e) => getComputedStyle(e).borderTopLeftRadius));
  expect(radii.every((r) => r === '0px')).toBe(true);
});
