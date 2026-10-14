import { test, expect } from '@playwright/test';
import { noHorizontalScroll, lowContrast, visibleTextCount } from './helpers.js';

const pages = ['home', 'blog', 'post', 'faq', 'partner', 'privacy', 'kitchen'];
const widths = [375, 1440];

for (const name of pages) {
  test(`${name}: without the flag, dist CSS changes nothing visible`, async ({ page }) => {
    await page.goto(`/test/fixtures/${name}.html`);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).not.toBe('rgb(11, 11, 15)');
  });
  for (const w of widths) {
    test(`${name} @${w}: dark, readable, no sideways scroll`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto(`/test/fixtures/${name}.v2.html`);
      await page.waitForLoadState('networkidle');
      expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(11, 11, 15)');
      expect(await visibleTextCount(page)).toBeGreaterThan(20); // contrast check must see real content
      expect(await lowContrast(page)).toEqual([]);
      expect(await noHorizontalScroll(page)).toBe(true);
    });
  }
}

test('blog list: posts render as light cards', async ({ page }) => {
  await page.goto('/test/fixtures/blog.v2.html');
  const bg = await page.locator('.view-list article.blog-item').first().evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(bg).toBe('rgb(255, 255, 255)');
});

test('blog post: article sits on a light reading panel', async ({ page }) => {
  await page.goto('/test/fixtures/post.v2.html');
  const bg = await page.locator('.blog-item-content-wrapper').first().evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(bg).toBe('rgb(255, 255, 255)');
});
