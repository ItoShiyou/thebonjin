const puppeteer = require('/home/muse/bonjin-art/tools/node_modules/puppeteer-core');
const wait = ms => new Promise(r => setTimeout(r, ms));
function maxJump(trace) {
  let m = 0, at = null;
  for (let i = 1; i < trace.length; i++) { const d = Math.abs(trace[i].yaw - trace[i-1].yaw); if (d > m) { m = d; at = trace[i]; } }
  return { maxFrameJump_rad: +m.toFixed(3), atMode: at && at.mode };
}
const recJS = `window.__trace = []; const rec = () => { window.__trace.push({ t: performance.now(), yaw: window.__art.yaw, mode: window.__art.mode }); requestAnimationFrame(rec); }; requestAnimationFrame(rec);`;
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
    args: ['--no-sandbox', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=vulkan', '--window-size=1440,900', '--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  page.on('pageerror', e => console.log('[pageerror]', String(e).slice(0, 160)));

  // standalone: throw -> catch mid-flight -> small release -> throw again -> catch again
  await page.goto('http://localhost:8932/art/02-kyujudo/index.html', { waitUntil: 'load', timeout: 60000 });
  await wait(7000);
  await page.evaluate(recJS);
  await page.mouse.move(720, 450); await page.mouse.down(); await page.mouse.move(300, 450, { steps: 16 }); await page.mouse.up();
  await wait(1200); // mid-flight
  await page.mouse.move(720, 450); await page.mouse.down(); // CATCH
  await wait(300);
  await page.mouse.move(640, 450, { steps: 6 }); await page.mouse.up(); // small release -> spring
  await wait(2500);
  await page.mouse.move(720, 450); await page.mouse.down(); await page.mouse.move(1140, 450, { steps: 16 }); await page.mouse.up(); // throw right
  await wait(1000);
  await page.mouse.move(720, 450); await page.mouse.down(); // CATCH 2
  await wait(400); await page.mouse.up();
  await wait(2500);
  console.log('STANDALONE', JSON.stringify(maxJump(await page.evaluate(() => window.__trace))));

  // site cover (BG): throw -> catch during go -> re-throw -> catch during back
  await page.goto('http://localhost:8932/', { waitUntil: 'load', timeout: 60000 });
  await wait(7000);
  const fr = page.frames().find(f => f.url().includes('02-kyujudo'));
  await fr.evaluate(recJS);
  await page.mouse.move(720, 450); await page.mouse.down(); await page.mouse.move(300, 450, { steps: 16 }); await page.mouse.up();
  await wait(1100); // excursion go
  await page.mouse.move(720, 450); await page.mouse.down(); // CATCH during go
  await wait(300);
  await page.mouse.move(280, 450, { steps: 14 }); await page.mouse.up(); // re-throw left
  let mode = '';
  for (let i = 0; i < 40; i++) { mode = await fr.evaluate(() => window.__art.mode); if (mode === 'excursion-back') break; await wait(300); }
  console.log('reached mode:', mode);
  await page.mouse.move(720, 450); await page.mouse.down(); // CATCH during back
  await wait(400); await page.mouse.up();
  await wait(2500);
  console.log('BG-SITE', JSON.stringify(maxJump(await fr.evaluate(() => window.__trace))));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
