const puppeteer = require('/home/muse/bonjin-art/tools/node_modules/puppeteer-core');
const wait = ms => new Promise(r => setTimeout(r, ms));
function analyze(trace, label) {
  const f = trace.filter(s => s.mode === 'flight' || s.mode.startsWith('excursion'));
  if (!f.length) { console.log(label, 'NO FLIGHT CAPTURED'); return; }
  const t0 = f[0].t;
  const target = f[f.length - 1].yaw;
  let valleys = 0, prev = null, minA = 1;
  for (let i = 1; i < f.length - 1; i++) {
    if (f[i].align < 0.25 && f[i].align <= f[i-1].align && f[i].align < f[i+1].align) valleys++;
    minA = Math.min(minA, f[i].align);
  }
  let maxV = 0, maxJ = 0, pv = 0;
  for (let i = 1; i < f.length; i++) {
    const dt = (f[i].t - f[i-1].t) / 1000; if (dt <= 0) continue;
    const v = (f[i].yaw - f[i-1].yaw) / dt;
    maxV = Math.max(maxV, Math.abs(v));
    if (i > 1) maxJ = Math.max(maxJ, Math.abs(v - pv) / dt);
    pv = v;
  }
  const dir = Math.sign(target - f[0].yaw) || 1;
  const overshoot = Math.max(...f.map(s => (s.yaw - target) * dir)) ;
  let settle = null;
  for (let i = f.length - 1; i >= 0; i--) { if (Math.abs(f[i].yaw - target) > 0.01) { settle = (f[i].t - t0) / 1000; break; } }
  console.log(label, JSON.stringify({ dur_s: +((f[f.length-1].t - t0)/1000).toFixed(2), from: +f[0].yaw.toFixed(2), to: +target.toFixed(2), alignValleys: valleys, alignMin: +minA.toFixed(3), maxVel_rad_s: +maxV.toFixed(2), maxJerk: +maxJ.toFixed(1), overshoot_rad: +overshoot.toFixed(3), settle_s: settle }));
}
(async () => {
  const OUT = '/home/muse/bonjin-site2/shots';
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
    args: ['--no-sandbox', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=vulkan', '--window-size=1440,900', '--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  page.on('pageerror', e => console.log('[pageerror]', String(e).slice(0, 160)));

  // --- standalone flight (270 deg) ---
  await page.goto('http://localhost:8932/art/02-kyujudo/index.html', { waitUntil: 'load', timeout: 60000 });
  await wait(7000);
  await page.evaluate(() => { window.__trace = []; const rec = () => { window.__trace.push({ t: performance.now(), yaw: window.__art.yaw, align: window.__art.align, mode: window.__art.mode }); requestAnimationFrame(rec); }; requestAnimationFrame(rec); });
  await page.mouse.move(720, 450); await page.mouse.down();
  await page.mouse.move(300, 450, { steps: 20 }); await page.mouse.up();
  for (const [i, ms] of [400, 900, 1400, 1900, 2400, 3000].entries()) { await wait(i === 0 ? 400 : 500); await page.screenshot({ path: `${OUT}/v5-f${i}.jpg`, type: 'jpeg', quality: 82 }); }
  await wait(5000);
  const trace1 = await page.evaluate(() => window.__trace);
  analyze(trace1, 'FLIGHT-270');

  // --- site excursion (cover drag) ---
  await page.goto('http://localhost:8932/', { waitUntil: 'load', timeout: 60000 });
  await wait(7000);
  const fr = page.frames().find(f => f.url().includes('02-kyujudo'));
  await fr.evaluate(() => { window.__trace = []; const rec = () => { window.__trace.push({ t: performance.now(), yaw: window.__art.yaw, align: window.__art.align, mode: window.__art.mode }); requestAnimationFrame(rec); }; requestAnimationFrame(rec); });
  await page.mouse.move(720, 450); await page.mouse.down();
  await page.mouse.move(300, 450, { steps: 20 }); await page.mouse.up();
  await wait(11000);
  const trace2 = await fr.evaluate(() => window.__trace);
  const modes = [...new Set(trace2.map(s => s.mode))];
  console.log('EXCURSION modes seen:', modes.join(' -> '));
  analyze(trace2, 'EXCURSION');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
