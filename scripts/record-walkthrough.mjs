// Records a click-through of the v2 preview + reskinned pages, desktop and phone.
// Usage: node scripts/record-walkthrough.mjs <outDir>   (needs `npm run serve` on :4173)
import { chromium } from '@playwright/test';
import { mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs';

const out = process.argv[2] || 'test-results/recordings';
const base = 'http://localhost:4173';
const runs = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, step: 120 },
  { name: 'phone', viewport: { width: 390, height: 844 }, step: 90, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
];

// A visible cursor so the clicks show up in the recording.
const cursor = `(() => { const c = document.createElement('div'); c.id='__cursor';
  Object.assign(c.style,{position:'fixed',width:'18px',height:'18px',borderRadius:'50%',background:'rgba(251,124,140,.85)',
  border:'2px solid #fff',zIndex:2147483647,pointerEvents:'none',transform:'translate(-50%,-50%)',left:'-40px',top:'-40px',transition:'left .25s,top .25s'});
  document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(c));
  addEventListener('mousemove',e=>{c.style.left=e.clientX+'px';c.style.top=e.clientY+'px';},true);
  addEventListener('pointerdown',e=>{c.style.left=e.clientX+'px';c.style.top=e.clientY+'px';c.style.transform='translate(-50%,-50%) scale(.6)';},true);
  addEventListener('pointerup',()=>{c.style.transform='translate(-50%,-50%)';},true); })()`;

async function slowScroll(page, step, pause = 140) {
  for (;;) {
    const done = await page.evaluate(() => innerHeight + scrollY >= document.documentElement.scrollHeight - 2);
    if (done) break;
    await page.mouse.wheel(0, step);
    await page.waitForTimeout(pause);
  }
}
async function clickOn(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 12 });
  await page.waitForTimeout(300);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
for (const r of runs) {
  const tmp = `${out}/.tmp-${r.name}`; rmSync(tmp, { recursive: true, force: true });
  const ctx = await browser.newContext({ viewport: r.viewport, isMobile: r.isMobile, hasTouch: r.hasTouch, deviceScaleFactor: r.deviceScaleFactor, recordVideo: { dir: tmp, size: r.viewport } });
  await ctx.addInitScript(cursor);
  const page = await ctx.newPage();

  // 1. Homepage: watch the hero play out, Replay, then Skip.
  await page.goto(`${base}/preview/index.html`);
  await page.mouse.move(r.viewport.width / 2, r.viewport.height / 2);
  if (r.name === 'phone') { await page.waitForTimeout(1200); await page.locator('[data-demo]').scrollIntoViewIfNeeded(); }
  await page.waitForTimeout(21000);
  await clickOn(page, page.locator('[data-replay]'));     // Replay
  await page.waitForTimeout(2500);
  await clickOn(page, page.locator('[data-replay]'));     // Skip
  await page.waitForTimeout(1500);
  // 2. Time-back calculator: answer the three questions, show the result and the email prompt. Never submits.
  const calc = page.locator('#ambler-calc');
  if (await calc.count()) {
    await calc.scrollIntoViewIfNeeded(); await page.waitForTimeout(800);
    for (let i = 0; i < 3; i++) { await clickOn(page, calc.locator('#ac-next')); await page.waitForTimeout(1100); }
    await calc.locator('#ac-result-wrap').scrollIntoViewIfNeeded(); await page.waitForTimeout(1500);
    await calc.locator('#ac-form').scrollIntoViewIfNeeded(); await page.waitForTimeout(1800);
  }
  // 3. Scroll the whole page; hover the audience cards on desktop.
  await page.evaluate(() => scrollTo({ top: 0 })); await page.waitForTimeout(600);
  await slowScroll(page, r.step);
  await page.waitForTimeout(1200);
  if (r.name === 'desktop') {
    const aud = page.locator('.amb-aud');
    for (let i = 0; i < await aud.count(); i++) { await aud.nth(i).scrollIntoViewIfNeeded(); await aud.nth(i).hover(); await page.waitForTimeout(500); }
  }
  // 4. Reskinned pages (saved copies of the live site with the v2 class).
  for (const f of ['blog', 'post', 'faq']) {
    await page.goto(`${base}/test/fixtures/${f}.v2.html`);
    await page.waitForTimeout(1200);
    await slowScroll(page, r.step * 2, 110);
    await page.waitForTimeout(800);
  }
  await ctx.close();
  const vid = readdirSync(tmp).find((f) => f.endsWith('.webm'));
  renameSync(`${tmp}/${vid}`, `${out}/walkthrough-${r.name}.webm`);
  rmSync(tmp, { recursive: true, force: true });
  console.log('recorded', r.name);
}
await browser.close();
