import { test, expect } from '@playwright/test';

test('real loader, JS arrives before the body: content still reveals and animates', async ({ page }) => {
  await page.goto('http://localhost:4174/?v2=1');
  await expect(page.locator('html')).toHaveClass(/amb-v2/);
  const first = page.locator('[data-reveal]').first();
  await expect.poll(() => first.evaluate((e) => getComputedStyle(e).opacity), { timeout: 4000 }).toBe('1');
  await expect(page.locator('[data-status-badge]')).not.toHaveText('Shipped', { timeout: 4000 });
});

test('real loader without the flag: no class, nothing loaded', async ({ page }) => {
  const requests = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.goto('http://localhost:4174/');
  await expect(page.locator('html')).not.toHaveClass(/amb-v2/);
  expect(requests.filter((u) => /ambler\.(css|js)/.test(u))).toEqual([]);
});
