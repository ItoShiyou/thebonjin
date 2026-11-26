const puppeteer = require('/home/muse/bonjin-art/tools/node_modules/puppeteer-core');
(async () => {
  const OUT = '/home/muse/bonjin-site2/shots';
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
    args: ['--no-sandbox', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=vulkan', '--window-size=1440,900', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  page.on('pageerror', e => console.log('[pageerror]', String(e).slice(0, 160)));
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const shot = async n => { await page.screenshot({ path: `${OUT}/${n}.jpg`, type: 'jpeg', quality: 86 }); console.log('shot', n); };

  await page.goto('http://localhost:8932/', { waitUntil: 'load', timeout: 60000 });
  await wait(7000);
  // TAP = strike on the cover
  await page.mouse.click(500, 400);
  await wait(450); await shot('v3-tap-strike');
  await wait(2500);
  // DRAG LEFT on the cover = committed excursion to tochuu
  await page.mouse.move(720, 450); await page.mouse.down();
  await page.mouse.move(300, 450, { steps: 16 }); await page.mouse.up();
  await wait(3400); await shot('v3-excursion');
  await wait(4200); await shot('v3-excursion-return');
  // log section (strikethrough edit trace)
  await page.evaluate(() => document.querySelector('#log').scrollIntoView());
  await wait(800); await shot('v3-log');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
