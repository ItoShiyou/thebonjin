const puppeteer = require('/home/muse/bonjin-art/tools/node_modules/puppeteer-core');
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const OUT = '/home/muse/bonjin-site2/shots';
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
    args: ['--no-sandbox', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=vulkan', '--window-size=1440,900', '--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
  await page.goto('http://localhost:8932/', { waitUntil: 'load', timeout: 60000 });
  await wait(2500);
  await page.evaluate(() => document.querySelector('#about').scrollIntoView());
  await wait(900); await page.screenshot({ path: `${OUT}/v6-about.jpg`, type: 'jpeg', quality: 87 }); console.log('about');
  await page.evaluate(() => document.querySelector('#members').scrollIntoView());
  await wait(900); await page.screenshot({ path: `${OUT}/v6-members.jpg`, type: 'jpeg', quality: 87 }); console.log('members');
  await page.evaluate(() => { const rows = document.querySelectorAll('#ledger .row'); rows[3] && rows[3].querySelector('.row-main').click(); });
  await wait(800); await page.screenshot({ path: `${OUT}/v6-itou.jpg`, type: 'jpeg', quality: 87 }); console.log('itou row');
  const counts = await page.evaluate(() => ({ rows: document.querySelectorAll('#ledger .row').length,
    manifesto: !!document.querySelector('#manifesto'), log: !!document.querySelector('#log'), bangai: !!document.querySelector('#bangai') }));
  console.log('DOM:', JSON.stringify(counts));
  console.log('ERRORS:', errs.length ? errs.join(' | ') : 'none');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
