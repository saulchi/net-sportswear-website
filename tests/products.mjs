import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
const url = process.env.PREVIEW_URL || 'http://127.0.0.1:4176/net-sportswear-website/';
const server = process.env.PREVIEW_URL ? null : spawn('npm', ['run', 'preview', '--', '--port', '4176', '--strictPort'], { stdio: 'ignore' });
const expected = {
  SKI: ['Jackets', 'Pants', 'One-Piece Suits', 'Midlayers'],
  CYCLING: ['Jackets & Vests', 'Pants & Shorts', 'Jerseys'],
  OUTDOOR: ['Hardshell Jackets', 'Softshell Jackets', 'Lightweight Jackets', 'Padded Jackets', 'Pants & Shorts'],
};
let browser;
try {
  let ready = false;
  for (let i = 0; i < 50; i++) {
    try { ready = (await fetch(url)).ok; } catch {}
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert(ready);
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];page.on('pageerror', e => errors.push(e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  assert.deepEqual(await page.locator('.collection h3').allTextContents(), Object.keys(expected));
  assert.deepEqual(await page.locator('.hero-tab span').allTextContents(), Object.keys(expected));
  assert.deepEqual(await page.locator('#navigation a').allTextContents(), ['SKI', 'CYCLING', 'OUTDOOR', 'OEM / ODM', 'About us']);
  assert(!/golf|Ski & Snowboard|Road & Mountain Biking|Outdoor & Lifestyle/i.test(await page.locator('body').innerText()));
  await page.locator('.collection').first().click();assert.equal(new URL(page.url()).searchParams.get('category'), 'SKI');
  for (const [category, types] of Object.entries(expected)) {
    await page.goto(`${url}products.html?category=${category}`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('h1').innerText(), category);
    assert.deepEqual(await page.locator('#subcategory option').allTextContents(), ['All product types', ...types]);
    assert.equal(await page.locator('.product-card').count(), types.length * 2);
    assert(await page.locator('#category-image').evaluate(i => i.complete && i.naturalWidth > 0));
    for (const gender of ['Men', 'Women']) {
      await page.locator(`button[data-gender="${gender}"]`).click();
      assert.equal(await page.locator('.product-card').count(), types.length);
      assert(await page.locator('.product-card').evaluateAll((cards, gender) => cards.every(c => c.dataset.gender === gender), gender));
      for (const type of types) {
        await page.locator('#subcategory').selectOption(type);
        assert.equal(await page.locator('.product-card').count(), 1);
        assert.equal(await page.locator('.product-card h3').innerText(), type);
      }
      await page.locator('#subcategory').selectOption('All');
    }
    await page.reload({waitUntil:'networkidle'});
    assert.equal(await page.locator('button[data-gender="Women"]').getAttribute('aria-pressed'), 'true', `${category}: ${page.url()}`);
    await page.locator('.filter-reset').click();assert.equal(await page.locator('.product-card').count(), types.length * 2);
    await page.goBack();assert.equal(await page.locator('.product-card').count(), types.length);
  }
  await page.goto(`${url}products.html?category=OUTDOOR&gender=Women&subcategory=Softshell+Jackets`,{waitUntil:'networkidle'});
  await page.locator('.product-card a').click();
  assert.equal(await page.locator('[name=category]').inputValue(),'OUTDOOR');
  assert.match(await page.locator('[name=message]').inputValue(),/OUTDOOR \/ Softshell Jackets \/ Women/);
  await page.locator('[name=name]').fill('Alex Morgan');await page.locator('[name=email]').fill('alex@example.com');await page.locator('[name=company]').fill('Example Brand');await page.locator('[type=checkbox]').check();
  const download=page.waitForEvent('download');await page.locator('[type=submit]').click();assert.equal((await download).suggestedFilename(),'net-sportswear-inquiry.txt');
  for (const width of [390, 320]) {
    await page.setViewportSize({width,height:844});
    await page.goto(url,{waitUntil:'networkidle'});await page.locator('.menu-toggle').click();await page.locator('#navigation a').nth(1).click();
    assert.equal(await page.locator('h1').innerText(),'CYCLING');
    await page.locator('button[data-gender="Men"]').click();await page.locator('#subcategory').selectOption('Jerseys');
    assert.equal(await page.locator('.product-card').count(),1);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  await page.goto(`${url}products.html?category=unknown&gender=invalid&subcategory=invalid`,{waitUntil:'networkidle'});
  assert.equal(await page.locator('h1').innerText(),'SKI');assert.equal(await page.locator('.product-card').count(),8);
  if (!process.env.CI && !process.env.PREVIEW_URL) await page.screenshot({path:'/tmp/net-products-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('PASS: exact categories, all 12 subcategories for Men/Women, combined filters, refresh/back/reset, homepage/navigation links, inquiry download, mobile 390/320px, invalid-query fallback.');
} finally { await browser?.close();server?.kill('SIGTERM'); }
