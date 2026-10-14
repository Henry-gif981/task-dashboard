// node tools/shoot_ids.js <file> <outdir> <w> <h> <id,id,...> — chụp lại một số trang (cùng cách với shoot.js)
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const [file, out, w, h, idlist] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +w, height: +h } }); await p.route(/^https?:/, r => r.abort());
  await p.goto('file://' + path.resolve(file) + '?nointro=1'); await p.waitForTimeout(1500);
  const all = await p.$$eval('main > .slide', s => s.map(x => x.id));
  for (const id of idlist.split(',')) {
    const i = all.indexOf(id);
    await p.evaluate(id => { document.documentElement.style.scrollBehavior = 'auto'; const el = document.getElementById(id); el.scrollIntoView(); el.querySelectorAll('.rv').forEach(x => x.classList.add('in')); el.classList.add('in'); el.querySelectorAll('[data-chart].armed, .tl-wrap.armed, .progress-261.armed').forEach(x => { x.classList.remove('armed'); x.dataset.drawn = '1'; }); }, id);
    await p.waitForTimeout(1300);
    await (await p.$('#' + id)).screenshot({ path: `${out}/${String(i).padStart(2, '0')}-${id}.png` });
  }
  await b.close();
})();
