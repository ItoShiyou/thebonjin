const puppeteer = require('/home/muse/bonjin-art/tools/node_modules/puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
    args: ['--no-sandbox', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=vulkan', '--window-size=1440,900', '--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  page.on('pageerror', e => console.log('[pageerror]', String(e).slice(0, 160)));
  await page.goto('http://localhost:8932/', { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 9000));
  const fr = page.frames().find(f => f.url().includes('02-kyujudo'));
  const info = await fr.evaluate(() => {
    const say = document.getElementById('say');
    const spans = say.querySelectorAll('span');
    const inCount = say.querySelectorAll('span.in').length;
    return { spans: spans.length, inCount, text: say.textContent.slice(0, 30), bodyClass: document.body.className };
  });
  console.log(JSON.stringify(info));
  await page.screenshot({ path: '/home/muse/bonjin-site2/shots/v3-cover-late.jpg', type: 'jpeg', quality: 86 });
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
