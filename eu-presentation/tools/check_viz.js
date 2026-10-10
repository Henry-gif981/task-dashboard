// Checks the data visuals against viz_data.json and the original page text.
//   node tools/check_viz.js [new.html] [original.html]
// 1. script#viz-data in the page equals viz_data.json
// 2. every "exact" value (and every verbatim text field that carries numbers) appears word for word in the original page text
// 3. every number shown in a visual (text, tooltips, aria-labels, "View data" tables) matches a value in viz_data.json
// 4. a visual that shows a derived value also shows the word "derived"
// Section, table and figure numbers and citation years like "(2024)" are not data and are ignored.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const NEW = path.resolve(process.argv[2] || path.join(ROOT, 'index.html'));
const OLD = path.resolve(process.argv[3] || path.join(ROOT, 'index.backup.html'));
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'viz_data.json'), 'utf8'));
const VERBATIM = ['event', 'meaning', 'text', 'wave', 'name', 'partner'];
const NUM = /\d[\d,]*(?:\.\d+)?/g;
const nums = s => (String(s).match(NUM) || []).map(t => t.replace(/,/g, ''));
const strip = s => String(s)
  .replace(/Sections? \d+(?:\.\d+)*(?:\s*(?:and|,)\s*\d+(?:\.\d+)*)*/g, ' ')
  .replace(/Tables? \d+(?:\.\d+)*(?:\s*and\s*\d+(?:\.\d+)*)?/g, ' ')
  .replace(/Figure \d+(?:\.\d+)*/g, ' ')
  .replace(/\(\d{4}[a-z]?(?:,\s*\d{4}[a-z]?)*\)/g, ' ')
  .replace(/n\.d\.-[a-z]/g, ' ');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, reducedMotion: 'reduce' });
  await ctx.route(/^https?:/, r => r.abort());
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  // original text
  await page.goto('file://' + OLD); await page.waitForTimeout(800);
  const original = (await page.evaluate(() => document.body.innerText + '\n' + [...document.querySelectorAll('[aria-label]')].map(e => e.getAttribute('aria-label')).join('\n'))).replace(/\s+/g, ' ');

  // embedded copy
  await page.goto('file://' + NEW); await page.waitForTimeout(1500);
  const embedded = JSON.parse(await page.$eval('#viz-data', e => e.textContent));
  const embedOK = JSON.stringify(embedded) === JSON.stringify(DATA);

  // allowed numbers + exact-value check
  const allowed = new Set(), missingExact = [], nonVerbatim = [], counts = { exact: 0, approximate: 0, derived: 0, axis: 0 };
  const derivedShown = {};
  function walk(o, key, spec) {
    if (Array.isArray(o)) return o.forEach(x => walk(x, key, spec));
    if (!o || typeof o !== 'object') {
      if (typeof o === 'string' && VERBATIM.includes(key) && /\d/.test(o)) {
        if (original.includes(o)) nums(o).forEach(n => allowed.add(+n)); else nonVerbatim.push([spec, key, o]);
      }
      return;
    }
    if ('v' in o && 's' in o) {
      counts[o.s] = (counts[o.s] || 0) + 1;
      [o.v, o.txt].filter(x => x != null).forEach(x => nums(x).forEach(n => allowed.add(+n)));
      if (o.s === 'derived') derivedShown[spec] = true;
      if (o.s === 'exact') {
        const t = String(o.txt != null ? o.txt : o.v);
        if (!original.includes(t)) missingExact.push(`${spec}: "${t}"`);
      }
    }
    for (const k of Object.keys(o)) if (k !== 'v' && k !== 'pos') walk(o[k], k, spec);
  }
  DATA.visuals.forEach(v => walk(v, '', v.key));
  // a reworded text field may only carry numbers that are values in viz_data.json
  const reworded = nonVerbatim.filter(([, , t]) => nums(strip(t)).some(n => !allowed.has(+n))).map(([sp, k, t]) => `${sp}: ${k} = "${t}"`);

  // numbers shown in each visual
  const shown = await page.evaluate(() => [...document.querySelectorAll('.vz-root')].map(root => {
    const parts = [];
    root.querySelectorAll('.src').forEach(e => e.setAttribute('data-skip', '1'));
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n; (n = walker.nextNode());) if (!n.parentElement.closest('[data-skip], script, style, noscript')) parts.push(n.textContent);
    root.querySelectorAll('[data-tip]').forEach(e => parts.push(e.getAttribute('data-tip')));
    root.querySelectorAll('[aria-label]').forEach(e => parts.push(e.getAttribute('aria-label')));
    const host = root.closest('figure'); if (host && host !== root && host.getAttribute('aria-label')) parts.push(host.getAttribute('aria-label'));
    if (root.getAttribute('aria-label')) parts.push(root.getAttribute('aria-label'));
    return { key: root.dataset.viz || { members: 'F2.1', trade: 'F3.1', products: 'F3.2' }[root.dataset.chart], text: parts.join('\n') };
  }));
  const bad = [], noDerived = [];
  for (const f of shown) {
    const t = strip(f.text);
    const unknown = [...new Set(nums(t).filter(n => !allowed.has(+n)))];
    if (unknown.length) bad.push(`${f.key}: ${unknown.join(', ')}`);
    if (derivedShown[f.key] && !/derived/i.test(f.text)) noDerived.push(f.key);
  }
  console.log('Visuals found on the page:', shown.length, '/', DATA.visuals.length);
  console.log('Embedded data equals viz_data.json:', embedOK);
  console.log('Value objects:', JSON.stringify(counts));
  console.log('Exact values not found word for word in the original page text:', missingExact.length ? '\n  ' + missingExact.join('\n  ') : 'none');
  console.log('Reworded text fields (' + nonVerbatim.length + ') carrying numbers that are not data values:', reworded.length ? '\n  ' + reworded.join('\n  ') : 'none');
  console.log('Numbers shown in visuals that are not in viz_data.json:', bad.length ? '\n  ' + bad.join('\n  ') : 'none');
  console.log('Visuals with derived values but no "derived" label:', noDerived.length ? noDerived.join(', ') : 'none');
  console.log('Page errors:', errors.length ? errors.join(' | ') : 'none');
  await browser.close();
  process.exit(embedOK && !missingExact.length && !bad.length && !noDerived.length && !errors.length && !reworded.length ? 0 : 1);
})();
