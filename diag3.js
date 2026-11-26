const puppeteer = require('/home/muse/bonjin-art/tools/node_modules/puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
    args: ['--no-sandbox', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=vulkan', '--window-size=1440,900', '--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8932/', { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));
  const info = await page.evaluate(() => {
    const d = document.createElement('div');
    d.style.cssText = 'height:100svh;width:10px;position:absolute;visibility:hidden';
    document.body.appendChild(d);
    const svh = d.getBoundingClientRect().height;
    const d2 = document.createElement('div');
    d2.style.cssText = 'height:100vh;width:10px;position:absolute;visibility:hidden';
    document.body.appendChild(d2);
    const vh = d2.getBoundingClientRect().height;
    return { innerH: window.innerHeight, clientH: document.documentElement.clientHeight, svh, vh,
             bodyZoom: getComputedStyle(document.body).zoom, dpr: window.devicePixelRatio };
  });
  console.log(JSON.stringify(info));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
