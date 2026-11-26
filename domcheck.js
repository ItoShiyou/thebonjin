const puppeteer = require('/home/muse/bonjin-art/tools/node_modules/puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:8932/', { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1200));
  const log = await page.evaluate(() => { const el = document.querySelector('#log-list s'); return el ? el.outerHTML : 'NO <s> FOUND'; });
  console.log('log strike:', log);
  await page.goto('http://localhost:8932/apps.html', { waitUntil: 'load', timeout: 60000 });
  const btn = await page.evaluate(() => { const b = document.querySelector('.app-btn'); const cs = getComputedStyle(b); return { bg: cs.backgroundColor, color: cs.color }; });
  console.log('app btn:', JSON.stringify(btn));
  const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily.slice(0, 40));
  console.log('body font:', font);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
