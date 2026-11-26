const puppeteer = require('/home/muse/bonjin-art/tools/node_modules/puppeteer-core');
const fs = require('fs');
(async () => {
  fs.mkdirSync('/home/muse/bonjin-site2/shots', { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome', headless: 'new',
    args: ['--no-sandbox', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=vulkan', '--window-size=1440,900', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('[console]', m.type(), m.text().slice(0, 160)); });
  page.on('pageerror', e => console.log('[pageerror]', String(e).slice(0, 200)));
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const shot = async n => { await page.screenshot({ path: `/home/muse/bonjin-site2/shots/${n}.jpg`, type: 'jpeg', quality: 88 }); console.log('shot', n); };
  const scrollTo = async sel => { await page.evaluate(s => { document.querySelector(s).scrollIntoView(); }, sel); await wait(600); };
  await page.goto('http://localhost:8932/', { waitUntil: 'load', timeout: 60000 });
  await wait(7000); await shot('s2-hero');
  await scrollTo('.hero'); await shot('s2-lead');
  await scrollTo('#manifesto'); await wait(1200); await shot('s2-manifesto');
  await page.evaluate(() => { document.querySelectorAll('.stage')[1].scrollIntoView(); });
  await wait(6000); await shot('s2-ashiato');
  await page.evaluate(() => { document.querySelectorAll('.stage')[2].scrollIntoView(); });
  await wait(11000); await shot('s2-itteki');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
