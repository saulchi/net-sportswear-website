import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4179/net-sportswear-website/';
const server=process.env.PREVIEW_URL?null:spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4179','--strictPort'],{stdio:'ignore'});
let browser;
try {
  const manifest=JSON.parse(readFileSync(new URL('../public/images/products/MH0002/source-manifest.json',import.meta.url),'utf8'));
  assert.equal(manifest.image_count,5);assert.equal(manifest.files.length,5);
  for(const file of manifest.files) assert.equal(createHash('sha256').update(readFileSync(new URL(`../public/images/products/MH0002/${file.file}`,import.meta.url))).digest('hex'),file.sha256);
  let ready=false;for(let i=0;i<50;i++){try{ready=(await fetch(base)).ok;}catch{}if(ready)break;await new Promise(resolve=>setTimeout(resolve,100));}assert(ready);
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const query of ['category=OUTDOOR','category=OUTDOOR&gender=Men','category=OUTDOOR&gender=Men&subcategory=Hardshell+Jackets']) {
    await page.goto(`${base}products.html?${query}`,{waitUntil:'networkidle'});await page.locator('#product-grid[aria-busy="false"]').waitFor();
    assert.equal(await page.locator('[data-product="MH0002"]').count(),1);
    assert.equal(await page.locator('[data-product="MH0002"]').getAttribute('data-gender'),'Men');
    assert.equal(await page.locator('[data-product="MH0002"] .concept-badge').innerText(),'Nano');
    assert(!(await page.locator('[data-product="MH0002"] img').getAttribute('alt')).includes('AI'));
  }
  assert.match(await page.locator('#product-count').innerText(),/2 products/);
  assert.equal(await page.locator('.product-card').count(),2);
  assert.equal(await page.locator('[data-product="MH0001"]').count(),1);
  await page.locator('[data-product="MH0002"] .product-visual').click();await page.locator('#product-detail[aria-busy="false"]').waitFor();
  assert(new URL(page.url()).searchParams.get('product')==='Nano');
  assert.match(await page.locator('h1').innerText(),/Nano Men's/);assert.match(await page.locator('#detail-reference').innerText(),/Style number \/ Nano/);
  assert.equal(await page.locator('.detail-thumb').count(),5);
  assert(!(await page.locator('.detail-image-note').innerText()).includes('AI'));
  const sources=new Set();
  for(let i=0;i<5;i++) {
    await page.locator(`[data-image="${i}"]`).click();await page.locator('#detail-image').evaluate(image=>image.decode());
    const src=await page.locator('#detail-image').getAttribute('src');sources.add(src);assert(src.endsWith(i === 0 ? '/MH0002/01-display.png' : `/MH0002/${String(i+1).padStart(2,'0')}.jpg`));
    assert.equal(await page.locator('#detail-image').evaluate(image=>getComputedStyle(image).objectFit),'contain');
    assert.equal(await page.locator('.detail-thumb[aria-pressed="true"]').count(),1);
    assert.match(await page.locator('.gallery-status').innerText(),new RegExp(`${i+1} / 5`));
  }
  assert.equal(sources.size,5);
  await page.locator('.gallery-next').click();assert.equal(await page.locator('.detail-gallery').getAttribute('data-active-image'),'0');
  await page.locator('.gallery-prev').click();assert.equal(await page.locator('.detail-gallery').getAttribute('data-active-image'),'4');
  await page.locator('.gallery-next').focus();await page.keyboard.press('Home');assert.equal(await page.locator('.detail-gallery').getAttribute('data-active-image'),'0');
  await page.keyboard.press('End');assert.equal(await page.locator('.detail-gallery').getAttribute('data-active-image'),'4');
  await page.locator('[data-image="0"]').click();await page.locator('#detail-image').evaluate(image=>image.decode());
  const alpha = await page.locator('#detail-image').evaluate(image=>{
    const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
    const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
    return [[0,0],[canvas.width-1,0],[0,canvas.height-1],[canvas.width-1,canvas.height-1]].map(([x,y])=>ctx.getImageData(x,y,1,1).data[3]);
  });assert.deepEqual(alpha,[0,0,0,0]);
  await page.locator('[data-image="4"]').click();
  await page.locator('.detail-zoom').click();assert.equal(await page.locator('.detail-zoom').getAttribute('aria-pressed'),'true');
  await page.locator('.gallery-next').click();assert.equal(await page.locator('.detail-zoom').getAttribute('aria-pressed'),'false');
  if(!process.env.CI&&!process.env.PREVIEW_URL)await page.screenshot({path:'/tmp/net-mh0002-desktop.png',fullPage:true});
  await page.locator('#detail-inquiry').click();await page.waitForFunction(()=>document.querySelector('[name=message]')?.value.includes('Nano'));
  assert.equal(await page.locator('[name=category]').inputValue(),'OUTDOOR');assert.match(await page.locator('[name=message]').inputValue(),/Nano \/ OUTDOOR \/ Hardshell Jackets \/ Men/);
  await page.locator('[name=name]').fill('Alex Morgan');await page.locator('[name=email]').fill('alex@example.com');await page.locator('[name=company]').fill('Example Brand');await page.locator('[type=checkbox]').check();
  const downloaded=page.waitForEvent('download');await page.locator('[type=submit]').click();const draft=await downloaded;assert.match(readFileSync(await draft.path(),'utf8'),/Nano/);
  for(const width of [390,320]){
    await page.setViewportSize({width,height:844});await page.goto(`${base}detail.html?product=Nano`,{waitUntil:'networkidle'});await page.locator('#product-detail[aria-busy="false"]').waitFor();
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.locator('#detail-photo').evaluate(photo=>{const t=x=>new Touch({identifier:1,target:photo,clientX:x,clientY:300});photo.dispatchEvent(new TouchEvent('touchstart',{changedTouches:[t(200)],bubbles:true}));photo.dispatchEvent(new TouchEvent('touchend',{changedTouches:[t(70)],bubbles:true}));});
    assert.equal(await page.locator('.detail-gallery').getAttribute('data-active-image'),'1');
    await page.locator('[data-image="4"]').click();assert.equal(await page.locator('.detail-gallery').getAttribute('data-active-image'),'4');
    if(!process.env.CI&&!process.env.PREVIEW_URL&&width===390)await page.screenshot({path:'/tmp/net-mh0002-mobile.png',fullPage:true});
  }
  for(const query of ['category=OUTDOOR&gender=Women','category=SKI','category=CYCLING']) {
    await page.goto(`${base}products.html?${query}`,{waitUntil:'networkidle'});assert.equal(await page.locator('[data-product="MH0002"]').count(),0);
  }
  await page.goto(`${base}detail.html?product=MH0002&category=CYCLING&gender=Women`,{waitUntil:'networkidle'});assert.match(await page.locator('h1').innerText(),/Men's/);assert.equal(await page.locator('#detail-category').innerText(),'OUTDOOR / OEM & ODM');
  assert.match(await page.locator('h1').innerText(),/Nano/);
  assert(!(await page.locator('main').innerText()).includes('MH0002'));
  assert.deepEqual(errors,[]);console.log('PASS: MH0002 is one OUTDOOR/MEN product, all five original files preserved, one five-photo gallery, desktop/mobile arrows/swipe/keyboard/zoom, style-specific inquiry and no women/other-category listing.');
} catch(error){if(process.env.CI)console.log(`::error title=MH0002 verification failure::${String(error.stack||error).replaceAll('%','%25').replaceAll('\r','%0D').replaceAll('\n','%0A')}`);throw error;}
finally{await browser?.close();server?.kill('SIGTERM');}
