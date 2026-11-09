import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { collections } from '../src/catalog.js';
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4177/net-sportswear-website/';
const server = process.env.PREVIEW_URL ? null : spawn('npm',['run','preview','--','--port','4177','--strictPort'],{stdio:'ignore'});
let browser;
try {
  let ready = false;
  for (let i=0;i<50;i++) { try {ready=(await fetch(base)).ok;} catch {} if(ready)break;await new Promise(resolve=>setTimeout(resolve,100)); }
  assert(ready);
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for (const [category,collection] of Object.entries(collections)) for (const subcategory of Object.keys(collection.types)) for (const gender of ['Men','Women']) {
    const query=new URLSearchParams({category,subcategory,gender});
    await page.goto(`${base}detail.html?${query}`);
    await page.locator('#product-detail[aria-busy="false"]').waitFor();
    assert((await page.locator('h1').innerText()).startsWith(`${gender}'s `));
    await page.locator('#detail-image').evaluate(image=>image.decode());
    assert.equal(await page.locator('#detail-image').getAttribute('class'),gender==='Women'?'pair-right':'pair-left');
    const back=new URL(await page.locator('#detail-back').getAttribute('href'),base);assert.equal(back.searchParams.get('category'),category);assert.equal(back.searchParams.get('subcategory'),subcategory);
  }
  const query=new URLSearchParams({category:'OUTDOOR',gender:'Men',subcategory:'Padded Jackets'});
  await page.goto(`${base}products.html?${query}`,{waitUntil:'networkidle'});
  await page.locator('.product-visual').click();await page.locator('#product-detail[aria-busy="false"]').waitFor();
  assert.equal(await page.locator('h1').innerText(),"Men's Padded Jacket");
  await page.locator('[data-view="close"]').click();assert(await page.locator('#detail-photo').evaluate(el=>el.classList.contains('is-close-up')));
  await page.locator('.detail-zoom').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.detail-zoom').getAttribute('aria-pressed'),'false');
  await page.locator('[data-colour="Olive"]').click();assert.equal(await page.locator('#selected-colour').innerText(),'Olive');
  await page.locator('[data-size="M"]').click();assert.equal(await page.locator('[data-size="M"]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-size="M"]').click();assert.equal(await page.locator('[data-size="M"]').getAttribute('aria-pressed'),'false');
  await page.locator('[data-size="L"]').focus();await page.keyboard.press('Space');assert.equal(await page.locator('[data-size="L"]').getAttribute('aria-pressed'),'true');
  const material=page.locator('details').filter({has:page.getByText('Materials & construction',{exact:true})});await material.locator('summary').click();assert(await material.getAttribute('open')!==null);
  if(!process.env.CI&&!process.env.PREVIEW_URL){await page.locator('#detail-image').evaluate(image=>image.decode());await page.screenshot({path:'/tmp/net-detail-desktop.png',fullPage:true});}
  await page.locator('#detail-inquiry').click();await page.waitForFunction(()=>document.querySelector('[name=category]')?.value==='OUTDOOR');
  const message=await page.locator('[name=message]').inputValue();assert.match(message,/OUTDOOR \/ Padded Jackets \/ Men/);assert.match(message,/Colour direction: Olive/);assert.match(message,/Development size: L/);
  for(const width of [390,320]) {
    await page.setViewportSize({width,height:844});await page.goto(`${base}detail.html?${query}`,{waitUntil:'networkidle'});
    await page.locator('#product-detail[aria-busy="false"]').waitFor();
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert.equal(await page.locator('.detail-layout').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),1);
    await page.locator('[data-view="close"]').click();assert.equal(await page.locator('[data-view="close"]').getAttribute('aria-pressed'),'true');
    await page.locator('[data-view="full"]').click();await page.locator('[data-size="Custom range"]').click();
    assert(new URL(await page.locator('#detail-inquiry').getAttribute('href'),base).searchParams.get('size')==='Custom range');
    if(!process.env.CI&&!process.env.PREVIEW_URL&&width===390)await page.screenshot({path:'/tmp/net-detail-mobile.png',fullPage:true});
  }
  await page.goto(`${base}detail.html?category=invalid&subcategory=invalid&gender=invalid`,{waitUntil:'networkidle'});assert.equal(await page.locator('h1').innerText(),"Men's Hardshell Jacket");
  assert.deepEqual(errors,[]);console.log('PASS: all 24 product details, listing-to-detail links, image views/zoom, keyboard, colour/size brief, accordions, inquiry prefill, mobile and fallback.');
} catch(error) { if(process.env.CI)console.log(`::error title=Detail verification failure::${String(error.stack||error).replaceAll('%','%25').replaceAll('\r','%0D').replaceAll('\n','%0A')}`);throw error; }
finally{await browser?.close();server?.kill('SIGTERM');}
