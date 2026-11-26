const puppeteer = require('/home/muse/bonjin-art/tools/node_modules/puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
    args: ['--no-sandbox', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=vulkan', '--window-size=1440,900', '--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8932/', { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));
  const info = await page.evaluate(() => {
    const st = document.querySelector('.stage');
    const fr = document.querySelector('#hero-frame');
    const r = st.getBoundingClientRect(), rf = fr.getBoundingClientRect();
    return { stageH: r.height, stageTop: r.top, iframeH: rf.height, docH: document.documentElement.scrollHeight,
             stagePos: getComputedStyle(st).position, iframePos: getComputedStyle(fr).position };
  });
  console.log(JSON.stringify(info));
  await page.evaluate(() => window.scrollTo(0, 1400));
  await new Promise(r => setTimeout(r, 800));
  const y = await page.evaluate(() => window.scrollY);
  console.log('scrollY', y);
  await page.screenshot({ path: '/home/muse/bonjin-site2/shots/s2-diag.jpg', type: 'jpeg', quality: 85 });
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
