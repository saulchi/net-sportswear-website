import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const server = process.env.PREVIEW_URL ? null : spawn('npm', ['run', 'preview', '--', '--port', '4175', '--strictPort'], { stdio: 'ignore' });
let browser;
try {
  const url = process.env.PREVIEW_URL || 'http://127.0.0.1:4175/net-sportswear-website/';
  if (process.env.EXPECTED_REVISION) {
    let deployed = false;
    for (let attempt = 0; attempt < 24; attempt++) {
      try {
        const versionUrl = new URL('preview-version.json', url);
        versionUrl.searchParams.set('revision', process.env.EXPECTED_REVISION);
        const version = await (await fetch(versionUrl, { cache: 'no-store' })).json();
        deployed = version.revision === process.env.EXPECTED_REVISION;
      } catch {}
      if (deployed) break;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    assert(deployed, 'GitHub Pages must serve the expected deployed revision');
    console.log('Verified deployed revision:', process.env.EXPECTED_REVISION);
  }
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    try { ready = (await fetch(url)).ok; } catch {}
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert(ready, 'Production preview must start');
  const executablePath = process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const clockStart = new Date('2026-01-01T00:00:00Z');
  await page.clock.install({ time: clockStart });
  await page.clock.pauseAt(new Date(clockStart.getTime() + 1000));
  await page.goto(url, { waitUntil: 'networkidle' });
  assert(await page.locator('.hero-image').evaluateAll(images => images.length === 3 && images.every(image => image.complete && image.naturalWidth > 0)));
  const active = () => page.locator('.hero-tab[aria-pressed="true"]').getAttribute('data-slide');
  // Reproduce the old failure: keep the mouse over the hero throughout playback.
  await page.locator('.hero').hover();
  assert.equal(await active(), '0');
  await page.clock.runFor(4999); assert.equal(await active(), '0');
  await page.clock.runFor(1); assert.equal(await active(), '1');
  await page.clock.runFor(5000); assert.equal(await active(), '2');
  await page.clock.runFor(5000); assert.equal(await active(), '0');
  // Keep focus on the toggle: Play must restart without moving the mouse or focus.
  await page.locator('.hero-pause').click();
  assert.equal(await page.locator('.hero-pause').textContent(), 'Play');
  await page.clock.runFor(15000); assert.equal(await active(), '0');
  await page.locator('[data-slide="2"]').click();
  await page.clock.runFor(5000); assert.equal(await active(), '2');
  await page.locator('.hero-pause').click();
  assert.equal(await page.locator('.hero-pause').textContent(), 'Pause');
  await page.clock.runFor(5000); assert.equal(await active(), '0');
  await page.locator('[data-slide="1"]').click();
  await page.clock.runFor(5000); assert.equal(await active(), '2');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.runFor(5000); assert.equal(await active(), '0');
  await page.setViewportSize({ width: 390, height: 844 });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  // Send touch gestures to the actual mobile swipe handlers in both directions.
  const swipe = async (start, end) => page.locator('.hero').evaluate((hero, [start, end]) => {
    const touch = x => new Touch({ identifier: 1, target: hero, clientX: x, clientY: 300 });
    hero.dispatchEvent(new TouchEvent('touchstart', { changedTouches: [touch(start)], bubbles: true }));
    hero.dispatchEvent(new TouchEvent('touchend', { changedTouches: [touch(end)], bubbles: true }));
  }, [start, end]);
  await swipe(300, 100); assert.equal(await active(), '1');
  await swipe(100, 300); assert.equal(await active(), '0');
  await page.clock.runFor(5000); assert.equal(await active(), '1');
  assert.deepEqual(errors, []);
  console.log('PASS: 5-second autoplay on load, continuous loop while hovered, Pause/Play while focused, manual selection, mobile swipes, reduced motion and no browser errors.');
} finally {
  await browser?.close();
  server?.kill('SIGTERM');
}
