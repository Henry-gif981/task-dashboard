// Every number shown in the v2b visuals must appear in the report text (or be listed as derived/axis).
//   node tools/check_new_numbers.js page.html report.pdf
let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const path = require('path'), { execFileSync } = require('child_process');
const DERIVED = { '1/7': 'one seventh (words in the report)', '#1': 'rank: "largest goods-trade partner in ASEAN"', '#3': 'rank: "third-largest export destination"', '#4': 'rank: "fourth-largest source of imports"', '#6': 'rank: "sixth-largest source of FDI"', '#9': 'rank: "9th-largest import source"', '#14': 'rank: "14th-largest trading partner"', '8': 'count of Table 2.6 instruments dated 2018 or later (derived)', '10': 'number of instruments in Table 2.6 (derived)' };
(async () => {
  const [file, pdf] = process.argv.slice(2);
  const T = execFileSync('pdftotext', ['-layout', pdf, '-']).toString().replace(/[‐-―−]/g, '-').replace(/\s+/g, ' ');
  const b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await p.goto('file://' + path.resolve(file)); await p.waitForTimeout(1500);
  const items = await p.evaluate(() => [...document.querySelectorAll('.vb, .takeaway, #c3-numbers, .tl-kpi, [data-viz="A7b"], [data-viz="A8s"], [data-viz="A8i"]')].map(e => ({ id: (e.closest('section') || {}).id, label: (e.querySelector('.vz-lbl, .lbl2, .eyebrow') || {}).textContent || e.className, text: [e.innerText, ...[...e.querySelectorAll('svg text, title')].map(t => t.textContent)].join(' ') })));
  await b.close();
  let miss = 0, n = 0;
  for (const it of items) {
    const toks = [...new Set((it.text.replace(/[‐-―−]/g, '-').match(/#?\d[\d,]*(?:\.\d+)?(?:\/\d+)?%?/g) || []))].filter(t => !/^(19|20)\d\d$/.test(t) || true);
    const bad = [];
    for (const t of toks) {
      n++;
      if (DERIVED[t]) continue;
      if (/^\d\.\d\.\d/.test(t)) continue;                                   // section numbers
      const core = t.replace(/%$/, '').replace(/^#/, '');
      const re = new RegExp('(^|[^\\d.,])' + core.replace(/[.$/]/g, '\\$&') + '(?![\\d])');
      if (!re.test(T)) bad.push(t);
    }
    if (bad.length) { miss += bad.length; console.log(`${it.id} · ${it.label.trim().slice(0, 50)}: not in the report text: ${bad.join(', ')}`); }
  }
  console.log(`${items.length} new visuals, ${n} number tokens checked, ${miss} not found verbatim`);
})();
