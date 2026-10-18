// v2 acceptance checks on the rendered page.
//   node tools/check_v2.js <page.html> <report.pdf> [--sample 15]
// 1. every href="#x" points to an existing id; no duplicate ids
// 2. section labels (eyebrows such as 2.2.1a) are unique; their base numbers match the table of contents
// 3. strings that must be gone: [to be completed], [initials], 68.3, 13 civilian, 88.7, Philippines, Source: Table,
//    and "approximate" inside chart figures (captions, units, notes, sources)
// 4. random sample of numbers shown on the page, each looked up in the report text (with context)
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { execFileSync } = require('child_process');
const path = require('path'), fs = require('fs');
(async () => {
  const [file, pdf] = process.argv.slice(2);
  const nSample = +(process.argv[process.argv.indexOf('--sample') + 1] || 15);
  const raw = fs.readFileSync(file, 'utf8');
  const pdfText = execFileSync('pdftotext', ['-layout', pdf, '-']).toString().replace(/[‐-―−]/g, '-').replace(/\s+/g, ' ');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.route(/^https?:/, r => r.abort());
  await p.goto('file://' + path.resolve(file)); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
    const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
    const set = new Set(ids);
    const bad = [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href').slice(1)).filter(h => h && !set.has(h));
    const eyebrows = [...document.querySelectorAll('main > section .eyebrow')].map(e => e.textContent.trim()).filter(t => /^\d/.test(t));
    const toc = [...document.querySelectorAll('.toc a')].map(a => (a.textContent.match(/^(\d+(?:\.\d+)+)/) || [])[1]).filter(Boolean);
    const figText = [...document.querySelectorAll('figure.vz, figure.chart')].map(f => [...f.querySelectorAll('figcaption, .vz-unit, .vz-notes, .src, svg text')].map(e => e.textContent).join(' ')).join(' ');
    const text = [...document.querySelectorAll('main > section:not(#references):not(#contents)')].map(s => { const c = s.cloneNode(true); c.querySelectorAll('figure, .eyebrow, .subs').forEach(f => f.remove()); document.body.appendChild(c); const t = c.innerText; c.remove(); return t; }).join('\n');   // figures are checked against viz_data.json
    return { dup: [...new Set(dup)], bad, eyebrows, toc, figText, text, sections: document.querySelectorAll('main > section').length };
  });
  await b.close();
  let fail = 0; const say = (ok, msg) => { if (!ok) fail++; console.log((ok ? 'PASS ' : 'FAIL ') + msg); };
  say(!r.bad.length, `anchor links resolve (${r.bad.length ? 'broken: ' + r.bad.join(', ') : 'all OK'})`);
  say(!r.dup.length, `no duplicate ids ${r.dup.length ? r.dup.join(', ') : ''}`);
  const ebDup = r.eyebrows.filter((x, i) => r.eyebrows.indexOf(x) !== i);
  say(!ebDup.length, `section labels unique (${r.eyebrows.length} labels) ${ebDup.join(', ')}`);
  const base = [...new Set(r.eyebrows.map(e => e.replace(/[a-z]$/, '')))];
  const tocSet = new Set(r.toc);
  const notInToc = base.filter(x => !tocSet.has(x)), notOnPage = r.toc.filter(x => !base.includes(x) && !/^\d+\.\d+$/.test(x));
  say(!notInToc.length && !notOnPage.length, `section labels match the table of contents (labels not in TOC: ${notInToc.join(', ') || 'none'}; TOC entries with no labelled section: ${notOnPage.join(', ') || 'none'})`);
  for (const s of ['[to be completed]', '[initials]', '68.3', '13 civilian', '88.7', 'Philippines', 'Source: Table'])
    say(!raw.includes(s), `string absent from the file: "${s}"`);
  say(!/approximate/i.test(r.figText), 'no "approximate" in chart captions, units, notes, sources or labels');
  // random sample of numbers with context
  const toks = [...r.text.matchAll(/(?:US\$|EUR |€)?\d[\d,]*(?:\.\d+)?%?(?: (?:billion|bn|trillion|million|MW))?/g)].map(m => ({ t: m[0], i: m.index })).filter(o => /%|billion|bn|million|trillion|MW|\d,\d{3}|\d{2,}\.\d/.test(o.t));   // data values only, not section numbers
  let seed = 20261018; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const pick = new Set(); while (pick.size < Math.min(nSample, toks.length)) pick.add(Math.floor(rnd() * toks.length));
  console.log(`\nRandom sample of ${pick.size} figures (page → report):`);
  let miss = 0;
  for (const k of pick) {
    const o = toks[k], unit = (o.t.match(/ (billion|bn|trillion|million|MW)$/) || [])[1];
    const num = o.t.replace(/^(US\$|EUR |€)/, '').replace(/ (billion|bn|trillion|million|MW)$/, '').replace(/%$/, '');
    const esc = s => s.replace(/[.$]/g, '\\$&');
    // a value with a unit must appear with that unit (bn = billion); a percentage as "%" or "per cent"
    const tail = unit ? '\\s*(?:' + (unit === 'bn' || unit === 'billion' ? 'bn|billion' : unit) + ')' : /%$/.test(o.t) ? '\\s*(?:%|per cent)' : '(?![\\d])';
    const m = new RegExp('(^|[^\\d.,%])' + esc(num) + tail).exec(pdfText), at = m ? m.index + m[1].length : -1, core = num;
    if (at < 0) miss++;
    const pc = r.text.slice(Math.max(0, o.i - 45), o.i + o.t.length + 25).replace(/\s+/g, ' ');
    console.log(`  ${at >= 0 ? 'found ' : 'MISSING'} ${o.t.padEnd(16)} page: …${pc}…` + (at >= 0 ? `\n${' '.repeat(26)}report: …${pdfText.slice(Math.max(0, at - 45), at + core.length + 25)}…` : ''));
  }
  say(!miss, `random sample: ${pick.size - miss}/${pick.size} found in the report text`);
  console.log(`\n${r.sections} sections; ${fail ? fail + ' check(s) failed' : 'all checks passed'}`);
  process.exit(fail ? 1 : 0);
})();
