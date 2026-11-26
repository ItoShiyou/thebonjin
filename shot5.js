const puppeteer = require('/home/muse/bonjin-art/tools/node_modules/puppeteer-core');
(async () => {
  const OUT = '/home/muse/bonjin-site2/shots';
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
    args: ['--no-sandbox', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=vulkan', '--window-size=1440,900', '--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  page.on('pageerror', e => console.log('[pageerror]', String(e).slice(0, 150)));
  const wait = ms => new Promise(r => setTimeout(r, ms));
  await page.goto('http://localhost:8932/apps.html', { waitUntil: 'load', timeout: 60000 });
  await wait(1500); await page.screenshot({ path: `${OUT}/v4-apps.jpg`, type: 'jpeg', quality: 87 }); console.log('apps');
  await page.evaluate(() => { document.querySelector('#hikari').scrollIntoView(); const d = document.querySelector('#hikari details'); if (d) d.open = true; });
  await wait(900); await page.screenshot({ path: `${OUT}/v4-apps-hikari.jpg`, type: 'jpeg', quality: 87 }); console.log('hikari');
  await page.goto('http://localhost:8932/members/ozono.html', { waitUntil: 'load', timeout: 60000 });
  await wait(1200); await page.screenshot({ path: `${OUT}/v4-ozono.jpg`, type: 'jpeg', quality: 87 }); console.log('ozono');
  await page.goto('http://localhost:8932/members/gitpullpull.html', { waitUntil: 'load', timeout: 60000 });
  await wait(1200); await page.screenshot({ path: `${OUT}/v4-gpp.jpg`, type: 'jpeg', quality: 87 }); console.log('gpp');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
