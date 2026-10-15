import { test, expect } from '@playwright/test';
import { noHorizontalScroll, lowContrast } from './helpers.js';

// The calculator is Alexander's existing Squarespace code block, included unchanged in the preview.
// We only restyle it. These tests walk to the result and the email form (never submitting).
for (const w of [375, 1440]) {
  test(`calculator @${w}: sits after the problem section, walks to the email form, readable`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/preview/index.html');
    const calc = page.locator('#ambler-calc');
    await expect(calc).toHaveCount(1);
    const order = await page.evaluate(() => {
      const all = [...document.querySelectorAll('.amb-sec, #ambler-calc')];
      return all.map((e) => (e.id === 'ambler-calc' ? 'calc' : e.querySelector('h1,h2')?.textContent.slice(0, 12)));
    });
    expect(order.indexOf('calc')).toBe(3); // hero, people, problem, calculator, workflow…
    expect(await lowContrast(page)).toEqual([]);
    for (let i = 0; i < 3; i++) await calc.locator('#ac-next').click();
    await expect(calc.locator('#ac-result-wrap')).toBeVisible();
    await expect(calc.locator('#ac-form')).toBeVisible();
    await expect(calc.locator('#ac-email')).toBeVisible();
    expect(await lowContrast(page)).toEqual([]);
    expect(await noHorizontalScroll(page)).toBe(true);
  });
}

test('calculator: restyled Brute Mono (square, Roboto, Anton title, coral button)', async ({ page }) => {
  await page.goto('/preview/index.html');
  const calc = page.locator('#ambler-calc');
  const s = await calc.evaluate((el) => {
    const cs = getComputedStyle(el); const btn = getComputedStyle(el.querySelector('#ac-next'));
    return { radius: cs.borderTopLeftRadius, font: cs.fontFamily, btnBg: btn.backgroundImage, btnRadius: btn.borderTopLeftRadius };
  });
  expect(s.radius).toBe('0px');
  expect(s.font).toMatch(/Roboto/);
  expect(s.btnBg).toBe('none');
  expect(parseFloat(s.btnRadius)).toBe(0);
  const title = await calc.evaluate((el) => getComputedStyle(el.querySelector('h2')).fontFamily);
  expect(title).toMatch(/Anton/);
});

test('calculator: its Squarespace section adds no template padding or extra gap', async ({ page }) => {
  await page.goto('/preview/index.html');
  const s = await page.locator('#ambler-calc').evaluate((el) => {
    const sec = el.closest('.page-section');
    return { pt: getComputedStyle(sec).paddingTop, pb: getComputedStyle(sec).paddingBottom, mb: getComputedStyle(el).marginBottom };
  });
  expect(s).toEqual({ pt: '0px', pb: '0px', mb: '0px' });
});

test('calculator: progress shows how far you are (filled vs unfilled differ)', async ({ page }) => {
  await page.goto('/preview/index.html');
  const calc = page.locator('#ambler-calc');
  await calc.locator('#ac-next').click();
  // the widget fades segment colours over 0.2s — wait for it to settle
  await expect.poll(() => calc.locator('.ac-progress span').evaluateAll((els) => new Set(els.map((e) => getComputedStyle(e).backgroundColor)).size)).toBe(2);
});
