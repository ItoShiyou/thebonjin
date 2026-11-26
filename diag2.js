const puppeteer = require('/home/muse/bonjin-art/tools/node_modules/puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
    args: ['--no-sandbox', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=vulkan', '--window-size=1440,900', '--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8932/', { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2500));
  const info = await page.evaluate(() => {
    const st = document.querySelector('.stage');
    const out = { stage: st.getBoundingClientRect().height, kids: [] };
    for (const el of st.children) {
      const cs = getComputedStyle(el);
      out.kids.push({ tag: el.tagName, id: el.id, disp: cs.display, h: el.getBoundingClientRect().height, cssH: cs.height });
    }
    return out;
  });
  console.log(JSON.stringify(info, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
