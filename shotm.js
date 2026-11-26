const puppeteer = require('/home/muse/bonjin-art/tools/node_modules/puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
    args: ['--no-sandbox', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=vulkan', '--window-size=390,844', '--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  page.on('pageerror', e => console.log('[pageerror]', String(e).slice(0, 150)));
  await page.goto('http://localhost:8932/', { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 8000));
  await page.screenshot({ path: '/home/muse/bonjin-site2/shots/s2-mobile-hero.jpg', type: 'jpeg', quality: 85 });
  await page.evaluate(() => window.scrollTo(0, 1000));
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: '/home/muse/bonjin-site2/shots/s2-mobile-lead.jpg', type: 'jpeg', quality: 85 });
  console.log('done');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
