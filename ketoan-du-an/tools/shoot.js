// node tools/shoot.js <file> <outdir> <w> <h> [reduce]
// Chụp từng slide, ghi lỗi console và request mạng (bị chặn).
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const [file, out, w, h, mode, query] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: +w, height: +h }, reducedMotion: mode === 'reduce' ? 'reduce' : 'no-preference' });
  const net = []; await ctx.route(/^https?:/, r => { net.push(r.request().url()); r.abort(); });
  const p = await ctx.newPage(); const logs = [];
  p.on('console', m => { if (['error', 'warning'].includes(m.type())) logs.push(m.type() + ': ' + m.text().slice(0, 200)); });
  p.on('pageerror', e => logs.push('pageerror: ' + e.stack.slice(0, 300)));
  await p.goto('file://' + path.resolve(file) + (query || '?nointro=1')); await p.waitForTimeout(1500);
  const ids = await p.$$eval('main > .slide', s => s.map(x => x.id));
  for (let i = 0; i < ids.length; i++) {
    await p.evaluate(id => { document.documentElement.style.scrollBehavior = 'auto'; const el = document.getElementById(id); el.scrollIntoView(); el.querySelectorAll('.rv').forEach(x => x.classList.add('in')); el.classList.add('in'); el.querySelectorAll('[data-chart].armed, .tl-wrap.armed, .progress-261.armed').forEach(x => { x.classList.remove('armed'); x.dataset.drawn = '1'; }); }, ids[i]);
    await p.waitForTimeout(1300);
    const el = await p.$('#' + ids[i]);
    await el.screenshot({ path: `${out}/${String(i).padStart(2, '0')}-${ids[i]}.png` });
  }
  const info = await p.evaluate(() => ({ hOverflow: document.documentElement.scrollWidth - innerWidth, fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight).filter((v, i, a) => a.indexOf(v) === i) }));
  console.log(JSON.stringify({ slides: ids.length, info, net, logs }, null, 1));
  await b.close();
})();
