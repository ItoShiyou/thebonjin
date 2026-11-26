const puppeteer = require('/home/muse/bonjin-art/tools/node_modules/puppeteer-core');
const fs = require('fs');
(async () => {
  const OUT = '/home/muse/bonjin-site2/shots';
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
    args: ['--no-sandbox', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=vulkan', '--window-size=1440,900', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  page.on('console', m => { if (m.type() === 'error') console.log('[console]', m.text().slice(0, 150)); });
  page.on('pageerror', e => console.log('[pageerror]', String(e).slice(0, 200)));
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const shot = async n => { await page.screenshot({ path: `${OUT}/${n}.jpg`, type: 'jpeg', quality: 86 }); console.log('shot', n); };

  // 1) index: cover, then scrolled positions (bg rotation follows scroll)
  await page.goto('http://localhost:8932/', { waitUntil: 'load', timeout: 60000 });
  await wait(6000); await shot('v3-cover');
  await page.evaluate(() => { const m = document.documentElement.scrollHeight - innerHeight; window.scrollTo(0, m * 0.30); });
  await wait(3500); await shot('v3-scroll30');
  await page.evaluate(() => { const m = document.documentElement.scrollHeight - innerHeight; window.scrollTo(0, m * 0.52); });
  await wait(3500); await shot('v3-scroll52');

  // 2) standalone kyujudo: drag LEFT (negative) from bonjin -> should sweep -270deg to tochuu
  await page.goto('http://localhost:8932/art/02-kyujudo/index.html', { waitUntil: 'load', timeout: 60000 });
  await wait(6500); await shot('v3-drag-before');
  await page.mouse.move(720, 450);
  await page.mouse.down();
  await page.mouse.move(300, 450, { steps: 18 });
  await page.mouse.up();
  await wait(4200); await shot('v3-drag-after-left');
  // drag RIGHT (positive) from tochuu -> sweep +270deg back to bonjin
  await page.mouse.move(720, 450);
  await page.mouse.down();
  await page.mouse.move(1140, 450, { steps: 18 });
  await page.mouse.up();
  await wait(4200); await shot('v3-drag-after-right');

  // 3) apps page
  await page.goto('http://localhost:8932/apps.html', { waitUntil: 'load', timeout: 60000 });
  await wait(1500); await shot('v3-apps-top');
  await page.evaluate(() => document.querySelector('#hikari').scrollIntoView());
  await wait(900); await shot('v3-apps-hikari');

  // 4) member page
  await page.goto('http://localhost:8932/members/ozono.html', { waitUntil: 'load', timeout: 60000 });
  await wait(1200); await shot('v3-member-ozono');

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
