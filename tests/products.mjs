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
  assert.deepEqual(await page.locator('.mega-trigger').allTextContents(), ['SKI+', 'CYCLING+', 'OUTDOOR+']);
  assert(!/golf|Ski & Snowboard|Road & Mountain Biking|Outdoor & Lifestyle/i.test(await page.locator('body').innerText()));
  for (const [category, types] of Object.entries(expected)) {
    const trigger = page.getByRole('button', {name: category, exact:true});
    await trigger.hover();
    const panel = page.locator(`#mega-${category.toLowerCase()}`);
    assert.equal(await trigger.getAttribute('aria-expanded'),'true');
    assert(await panel.isVisible());
    assert.deepEqual(await panel.locator('h3').allTextContents(),['MEN','WOMEN']);
    for (const column of await panel.locator('.mega-column').all()) assert.deepEqual(await column.locator('a').allTextContents(),types);
    const bounds = await panel.boundingBox();assert(bounds.width >= 1438 && bounds.x >= 0);
    for (const gender of ['Men','Women']) {
      for (const type of types) {
        await page.locator(`button[aria-controls="mega-${category.toLowerCase()}"]`).hover();
        await page.getByRole('region', {name:`${category} ${gender}`,exact:true}).getByRole('link',{name:type,exact:true}).click();
        assert.equal(await page.locator('h1').innerText(),category);
        assert.equal(await page.locator('#product-heading').innerText(),type);
        assert.equal(await page.locator('.product-card').count(),1);
        assert.equal(await page.locator('.product-card').getAttribute('data-gender'),gender);
        assert.equal(await page.locator('.product-filters, .gender-options, #subcategory, .filter-reset').count(),0);
        await page.reload({waitUntil:'networkidle'});
        assert.equal(await page.locator('.product-card').count(),1);
      }
    }
    assert(await page.locator('#category-image').evaluate(i => i.complete && i.naturalWidth > 0));
  }
  // Keyboard disclosures: Enter/Space, ArrowDown, normal Tab, and Escape restores focus.
  const skiTrigger = page.locator('[aria-controls="mega-ski"]');
  await page.mouse.move(0,0);await skiTrigger.focus();await skiTrigger.press('Enter');
  assert.equal(await skiTrigger.getAttribute('aria-expanded'),'true');
  await skiTrigger.press('ArrowDown');
  assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Jackets');
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Pants');
  await page.keyboard.press('Escape');assert.equal(await skiTrigger.getAttribute('aria-expanded'),'false');assert(await skiTrigger.evaluate(el=>el===document.activeElement));
  await skiTrigger.press('Space');assert.equal(await skiTrigger.getAttribute('aria-expanded'),'true');
  await page.locator('#product-heading').click();assert.equal(await skiTrigger.getAttribute('aria-expanded'),'false');
  await skiTrigger.click();assert.equal(await skiTrigger.getAttribute('aria-expanded'),'true');
  await skiTrigger.click();assert.equal(await skiTrigger.getAttribute('aria-expanded'),'false');
  if (!process.env.CI && !process.env.PREVIEW_URL) { await page.mouse.move(0,0);await skiTrigger.hover();assert(await page.locator('#mega-ski').isVisible());await page.screenshot({path:'/tmp/net-mega-desktop.png'}); }
  await page.goto(`${url}products.html?category=OUTDOOR&gender=Women&subcategory=Softshell+Jackets`,{waitUntil:'networkidle'});
  await page.locator('.product-card a').click();
  assert.equal(await page.locator('[name=category]').inputValue(),'OUTDOOR');
  assert.match(await page.locator('[name=message]').inputValue(),/OUTDOOR \/ Softshell Jackets \/ Women/);
  await page.locator('[name=name]').fill('Alex Morgan');await page.locator('[name=email]').fill('alex@example.com');await page.locator('[name=company]').fill('Example Brand');await page.locator('[type=checkbox]').check();
  const download=page.waitForEvent('download');await page.locator('[type=submit]').click();assert.equal((await download).suggestedFilename(),'net-sportswear-inquiry.txt');
  for (const width of [390,320]) {
    await page.setViewportSize({width,height:844});await page.goto(url,{waitUntil:'networkidle'});
    await page.locator('.menu-toggle').click();
    const outdoor = page.locator('[aria-controls="mega-outdoor"]');
    await outdoor.click();assert.equal(await outdoor.getAttribute('aria-expanded'),'true');
    if (!process.env.CI && !process.env.PREVIEW_URL) await page.screenshot({path:'/tmp/net-mega-mobile.png'});
    await page.getByRole('region',{name:'OUTDOOR Women',exact:true}).getByRole('link',{name:'Hardshell Jackets',exact:true}).click();
    assert.equal(await page.locator('#product-heading').innerText(),'Hardshell Jackets');
    assert.equal(await page.locator('.product-card').getAttribute('data-gender'),'Women');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.locator('.menu-toggle').click();await page.locator('[aria-controls="mega-ski"]').click();
    assert.equal(await page.locator('[aria-controls="mega-ski"]').getAttribute('aria-expanded'),'true');
    await page.locator('[aria-controls="mega-ski"]').click();assert.equal(await page.locator('[aria-controls="mega-ski"]').getAttribute('aria-expanded'),'false');
    await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
  }
  await page.goto(`${url}products.html?category=unknown&gender=invalid&subcategory=invalid`,{waitUntil:'networkidle'});
  assert.equal(await page.locator('h1').innerText(),'SKI');assert.equal(await page.locator('.product-card').count(),8);
  if (!process.env.CI && !process.env.PREVIEW_URL) await page.screenshot({path:'/tmp/net-products-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('PASS: full-width mega menus, all 24 direct MEN/WOMEN links, desktop hover/click, keyboard and Escape, mobile accordions at 390/320px, no filters, direct-page refresh, inquiry download and fallback.');
} finally { await browser?.close();server?.kill('SIGTERM'); }
