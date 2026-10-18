// Every text block of the old page must still be on the new page (visuals may add text, never remove it).
//   node tools/check_text_kept.js old.html new.html
let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const path = require('path');
(async () => {
  const [a, b] = process.argv.slice(2), br = await pw.chromium.launch();
  const grab = async f => { const p = await br.newPage(); await p.goto('file://' + path.resolve(f)); await p.waitForTimeout(1000);
    const r = await p.evaluate(() => ({ blocks: [...document.querySelectorAll('main p, main li, main td, main th, main h1, main h2, main h3, main dt, main dd, main caption, main .toc a')].filter(e => !e.closest('figure.vz, .vz-table, .chart [data-chart]')).map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean), all: document.querySelector('main').textContent.replace(/\s+/g, ' ') }));
    await p.close(); return r; };
  const A = await grab(a), B = await grab(b);
  const lost = A.blocks.filter(t => !B.all.includes(t));
  console.log(`${A.blocks.length} text blocks on the old page; ${A.blocks.length - lost.length} found unchanged on the new page`);
  lost.forEach(t => console.log('  MISSING: ' + t.slice(0, 120)));
  await br.close(); process.exit(lost.length ? 1 : 0);
})();
