// node tools/perf.js <file> — đo FPS cảnh hero, thử ?no3d=1 và prefers-reduced-motion, chặn mạng
// Chromium headless trong môi trường này không có GPU: WebGL chạy bằng SwiftShader (dựng hình bằng CPU).
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const file = 'file://' + path.resolve(process.argv[2] || 'index.html');
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const out = {};
  async function run(name, q, vp, opts = {}) {
    const ctx = await b.newContext({ viewport: vp, reducedMotion: opts.reduce ? 'reduce' : 'no-preference', deviceScaleFactor: opts.dpr || 1 });
    const net = []; await ctx.route(/^https?:/, r => { net.push(r.request().url()); r.abort(); });
    const p = await ctx.newPage(); const logs = [];
    p.on('console', m => { if (['error', 'warning'].includes(m.type())) logs.push(m.text().slice(0, 160)); });
    p.on('pageerror', e => logs.push('pageerror: ' + e.message));
    await p.goto(file + q); await p.waitForTimeout(opts.wait || 9000);
    const r = await p.evaluate(() => {
      const h = window.__silk || window.__hero3d || {}; const c = document.querySelector('.silk-canvas') || document.querySelector('.hero-canvas');
      return { mode: h.mode, reason: h.reason, quality: h.quality, fps: (h.fps || []).slice(), canvas: c ? [c.width, c.height] : null, fallbackVisible: !document.documentElement.classList.contains('silk-on') && getComputedStyle(document.querySelector('.silk-fallback')).display !== 'none', introHidden: document.getElementById('intro').hidden };
    });
    // FPS khi cuộn qua nội dung (không có cảnh 3D trên màn hình): đếm requestAnimationFrame
    r.scrollFps = await p.evaluate(() => new Promise(res => { document.documentElement.style.scrollBehavior = 'auto'; let n = 0; const t0 = performance.now(); scrollTo(0, innerHeight * 3); (function f(t) { n++; scrollBy(0, 12); if (t - t0 < 2000) requestAnimationFrame(f); else res(Math.round(n * 1000 / (t - t0))); })(t0); }));
    // dừng render khi hero ra khỏi màn hình
    const before = await p.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); return (window.__silk || {}).frames || 0; }); await p.waitForTimeout(1500);
    r.framesWhileTabHidden = (await p.evaluate(() => (window.__silk || {}).frames || 0)) - before; r.scrollYAfter = await p.evaluate(() => Math.round(scrollY));
    r.net = net.length; r.console = logs;
    out[name] = r; await ctx.close();
  }
  await run('webgl_1920x1080', '?nointro=1', { width: 1920, height: 1080 });
  await run('webgl_1366x768', '?nointro=1', { width: 1366, height: 768 });
  await run('webgl_390x844_dpr2', '?nointro=1', { width: 390, height: 844 }, { dpr: 2 });
  await run('no3d', '?nointro=1&no3d=1', { width: 1920, height: 1080 }, { wait: 2500 });
  await run('reduced_motion', '', { width: 1920, height: 1080 }, { reduce: true, wait: 2500 });
  await run('intro_default', '', { width: 1920, height: 1080 }, { wait: 2600 });
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
