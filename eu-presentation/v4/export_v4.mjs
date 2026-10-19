// Slide PDF of the v4 page: 73 pages of 1920 x 1080 px, the on-screen design, fully offline.
//   node v4/export_v4.mjs [source.html] [output.pdf]
// Defaults: v4/EU_presentation_v4.html -> v4/EU_presentation_v4_slides.pdf
// Each section gets the number of slides fixed in the deck (v4-data "pages", 73 in all). Its content
// is cut only between blocks (a table, card, figure or paragraph is never cut), the cuts are balanced
// across the slides, and the content is scaled (CSS zoom) just enough to fit. Continuation slides are
// labelled "(cont.)". Links: external links stay clickable; links inside the deck (top bar,
// contents, [n] pointers to References) are added as PDF links to the right page.
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(process.argv[2] || path.join(HERE, 'EU_presentation_v4.html'));
const OUT = path.resolve(process.argv[3] || path.join(HERE, 'EU_presentation_v4_slides.pdf'));
const W = 1920, H = 1080, TOP = 124, FIRST = 100, BOTTOM = 52, MINZOOM = .5;

const CSS = `
  html { scroll-behavior: auto !important; }
  .pz-open, .nav-toggle, #progress, .site-foot, .vz-btn, .vz-tip, .pz-ui, #pz-hud, #pz-laser, #source-check, .skip { display: none !important; }
  .nav { position: fixed !important; top: 0; left: 0; right: 0; z-index: 50; }
  html.pdfs main > section:not(.pdf-cur):not(#pdf-none) { display: none !important; }
  html.pdfs, html.pdfs body { height: ${H}px !important; overflow: hidden !important; }
  html.pdfs main > section { min-height: 0 !important; padding-top: ${FIRST}px !important; padding-bottom: ${BOTTOM}px !important; }
  html.pdfs main > section.hero, html.pdfs main > section.intro, html.pdfs main > section#qa { height: ${H}px !important; min-height: ${H}px !important; padding: 0 !important; }
  html.pdfs main > section#qa > .wrap, html.pdfs main > section#qa .qa-trans { position: absolute !important; inset: 0; min-height: 0; }
  html.pdfs .trans { margin: 0 !important; height: ${H - 64}px; min-height: 0; }
  html.pdfs .sec:not(#qa) > .wrap { max-width: 1680px !important; padding-left: 0 !important; padding-right: 0 !important; margin: 0 auto; }
  html.pdfs #qa > .wrap { max-width: none !important; width: 100% !important; padding: 0 !important; margin: 0 !important; }
  html.pdfs .corner-art { position: fixed !important; right: 0; bottom: 0; }
  html.pdfs .corner-art { width: 130px !important; }
  .pdf-hide { visibility: hidden !important; }
  #pdf-cont { position: fixed; top: 82px; left: 120px; right: 120px; font: 400 15px/1.2 "Times New Roman", Times, "Liberation Serif", serif; letter-spacing: .16em; text-transform: uppercase; color: #2B35D6; z-index: 60; }
  #pdf-cont:empty { display: none; }
  @page { size: ${W}px ${H}px; margin: 0; }
`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, reducedMotion: 'reduce' });
const blocked = [];
await ctx.route(/^https?:/, r => { blocked.push(r.request().url()); r.abort(); });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto(pathToFileURL(SRC).href, { waitUntil: 'load', timeout: 120000 });
await page.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
await page.addStyleTag({ content: CSS });
await page.evaluate(async () => {
  await document.fonts.ready;
  document.querySelectorAll('.rv').forEach(e => e.classList.add('in'));
  document.querySelectorAll('.vz-anim').forEach(e => e.classList.add('drawn'));
  document.documentElement.classList.add('pdfs');
  const d = document.createElement('div'); d.id = 'pdf-cont'; document.body.append(d);
  // a table set beside another block is stacked above it, so the slides can break between them;
  // the table's source line moves up to sit right under the table
  const PG = JSON.parse(document.getElementById('v4-data').textContent).pages;
  document.querySelectorAll('main .cols').forEach(c => {
    const sec = c.closest('section'); if (!sec || !PG[sec.id] || PG[sec.id][1] < 2) return;
    const t = c.querySelector(':scope > .tbl-wrap, :scope > div > .tbl-wrap'); if (!t) return;
    c.style.display = 'block'; [...c.children].forEach(x => { x.style.marginTop = '24px'; x.style.maxWidth = 'none'; });
    const src = c.nextElementSibling;
    if (src && src.matches('p.src') && !t.closest('.cols > div:not(.tbl-wrap)')) t.after(src);
  });
  // a take-away panel is a slide of its own and is not scaled with the section
  document.querySelectorAll('.trans').forEach(t => t.closest('section').appendChild(t));
});
await page.waitForTimeout(1500);

const info = await page.evaluate(() => {
  const d = JSON.parse(document.getElementById('v4-data').textContent);
  return { pages: d.pages, total: d.total, ids: [...document.querySelectorAll('main > section')].map(s => s.id) };
});

const show = async (id, zoom) => {
  await page.evaluate(([id, z]) => {
    document.querySelectorAll('main > section').forEach(s => { s.classList.toggle('pdf-cur', s.id === id); s.style.transform = ''; });
    const s = document.getElementById(id), w = s.querySelector(':scope > .wrap');
    if (w) w.style.zoom = z === 1 ? '' : z.toFixed(3);
    document.querySelectorAll('.pdf-hide').forEach(e => e.classList.remove('pdf-hide'));
    document.querySelectorAll('ol.refs4 li').forEach(li => li.style.display = '');
    scrollTo(0, 0); dispatchEvent(new Event('resize'));
  }, [id, zoom]);
  await page.waitForTimeout(350);
  await page.evaluate(() => window.V4_MONO && window.V4_MONO());
};

// clean break points of a section (section coordinates) and the bottom of its content
const measure = id => page.evaluate(id => {
  const s = document.getElementById(id), st = s.getBoundingClientRect().top;
  const w = s.querySelector(':scope > .wrap'); if (!w) return { cuts: [], end: 0, top: [] };
  const end = w.getBoundingClientRect().bottom - st;
  const vis = c => c && c !== 'transparent' && !/rgba\(\d+, \d+, \d+, 0\)/.test(c);
  const boxy = e => { const cs = getComputedStyle(e); return parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0 || parseFloat(cs.borderBottomWidth) > 0 || vis(cs.backgroundColor); };
  const atoms = [];
  w.querySelectorAll('*').forEach(e => {
    const r = e.getBoundingClientRect(); if (!r.height || !r.width) return;
    if (e.matches('figure, svg, img, canvas, tr, p, li, h1, h2, h3, h4, h5, blockquote, dt, dd, table, .tbl-wrap, .card, .stat, .kpi, .takeaway, .callout, .vz, .m') || boxy(e))
      atoms.push([r.top - st, r.bottom - st, e.matches('.tbl-wrap, table')]);
  });
  // keep a source line or note with the block above it, a caption with the block below, a heading with what follows
  const R = e => e.getBoundingClientRect();
  w.querySelectorAll('p.src, .tnote').forEach(e => { if (!e.closest('figure')) atoms.push([R(e).top - st - 40, R(e).bottom - st]); });
  w.querySelectorAll('.cap, h2, .eyebrow').forEach(e => { const n = e.nextElementSibling; if (n) atoms.push([R(e).top - st, Math.min(R(n).bottom, R(n).top + 160) - st]); });
  const tops = [...w.children].map(c => Math.round(c.getBoundingClientRect().top - st));
  const cand = [...new Set(atoms.map(a => Math.round(a[0])))].filter(y => y > 0 && !atoms.some(([t, b]) => t < y - 1 && b > y + 1)).sort((a, b) => a - b);
  return { cuts: cand, end, top: tops };
}, id);

// k slides: choose k-1 cuts that fit and balance the slides (dynamic programming); null if impossible
function partition(m, k) {
  const capFirst = H - BOTTOM, capCont = H - TOP - BOTTOM;
  const pts = [FIRST - 1];
  for (const y of m.cuts) if (y > FIRST + 20 && y < m.end - 60 && y - pts[pts.length - 1] >= 60) pts.push(y);   // no near-empty slides
  pts.push(m.end);
  if (k === 1) return m.end <= capFirst ? [] : null;
  const n = pts.length, INF = 1e12, major = new Set(m.top);
  // best[j][i]: minimal cost with j cuts, the last at pts[i]; page heights ≤ capacity
  const cost = (a, b, first) => { const h = pts[b] - (first ? 0 : pts[a]); const cap = first ? capFirst : capCont; return h > cap ? INF : (h / cap) ** 2 + (h < cap * .25 ? 2 : 0); };
  let best = Array(n).fill(INF), from = [];
  for (let i = 1; i < n - 1; i++) best[i] = cost(0, i, true) + (major.has(pts[i]) ? 0 : .08);
  for (let j = 2; j < k; j++) {
    const nb = Array(n).fill(INF), fr = Array(n).fill(-1);
    for (let i = 1; i < n - 1; i++) for (let p = 1; p < i; p++) {
      if (best[p] >= INF) continue;
      const c = best[p] + cost(p, i, false) + (major.has(pts[i]) ? 0 : .08);
      if (c < nb[i]) { nb[i] = c; fr[i] = p; }
    }
    from.push(fr); best = nb;
  }
  let bi = -1, bc = INF;
  for (let i = 1; i < n - 1; i++) { const c = best[i] + cost(i, n - 1, false); if (c < bc) { bc = c; bi = i; } }
  if (bi < 0 || bc >= INF) return null;
  const cuts = [pts[bi]];
  for (let j = from.length - 1; j >= 0; j--) { bi = from[j][bi]; cuts.unshift(pts[bi]); }
  return cuts;
}

// 1. plan
const plan = [];
for (const id of info.ids) {
  const [first, k0] = info.pages[id];
  const hasTrans = await page.evaluate(id => !!document.querySelector('#' + id + ' > .trans'), id);
  const k = hasTrans ? k0 - 1 : k0;
  if (id === 'references') { plan.push({ id, first, k: k0, refs: true }); continue; }
  if (id === 'qa') { plan.push({ id, first, k: 1, zoom: 1, cuts: [] }); continue; }
  let z = 1, cuts = null;
  await show(id, 1);
  for (; z >= MINZOOM; z *= .96) {
    if (z !== 1) await show(id, z);
    const m = await measure(id);
    if (m.end === 0) { cuts = []; break; }
    cuts = partition(m, k);
    if (cuts) break;
  }
  if (!cuts) { z = MINZOOM; await show(id, z); cuts = partition(await measure(id), k) || []; console.warn('  no clean partition:', id); }
  plan.push({ id, first, k: k0, zoom: z, cuts, trans: hasTrans });
}

// references: split the list between the slides, balanced by height
async function refsSplit(p) {
  await show('references', 1);
  const hs = await page.evaluate(() => [...document.querySelectorAll('ol.refs4 li')].map(li => li.getBoundingClientRect().height + 14));
  const total = hs.reduce((a, b) => a + b, 0); let acc = 0, at = hs.length;
  for (let i = 0; i < hs.length; i++) { acc += hs[i]; if (acc >= total / p.k) { at = i + 1; break; } }
  return [0, at, hs.length];
}

// 2. render
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'v4pdf-'));
const files = [], toc = [], links = [], where = {}, scPage = {};
let n = 0;
async function snap(contLabel, num) {
  const r = await page.evaluate(([cont, num]) => {
    document.getElementById('pdf-cont').textContent = cont;
    const pn = document.querySelector('.nav .pageno'); if (pn) pn.textContent = num;
    const k = parseInt(num, 10); let on = null;
    [['contents', 2], ['ch1', 4], ['ch2', 15], ['ch3', 38], ['references', 71]].forEach(([id, p]) => { if (k >= p) on = id; });
    if (k === 70 || k === 73) on = null;
    document.querySelectorAll('.nav .nav-links a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + on));
    // links inside the deck, with their position on this slide
    return [...document.querySelectorAll('a[href^="#"]')].filter(a => {
      const r = a.getBoundingClientRect(); if (!r.width || r.bottom < 0 || r.top > innerHeight) return false;
      for (let x = a; x; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.display === 'none' || cs.visibility === 'hidden') return false; }
      return true;
    }).map(a => { const r = a.getBoundingClientRect(); return { href: a.getAttribute('href').slice(1), x: r.left, y: r.top, w: r.width, h: r.height }; });
  }, [contLabel, num]);
  const sc = await page.evaluate(() => [...document.querySelectorAll('section.pdf-cur [data-sc]')].filter(e => { const r = e.getBoundingClientRect(); if (!r.height || r.bottom < 0 || r.top > innerHeight) return false; for (let x = e; x; x = x.parentElement) if (getComputedStyle(x).visibility === 'hidden') return false; return true; }).map(e => e.dataset.sc));
  sc.forEach(k => { const [a, b] = k.split('-').map(Number); for (let i = a; i < b; i++) if (!(i in scPage)) scPage[i] = n + 1; });
  const ids = await page.evaluate(() => [...document.querySelectorAll('ol.refs4 li[id]')].filter(li => li.style.display !== 'none' && li.closest('section.pdf-cur')).map(li => li.id));
  const f = path.join(tmp, `p${String(n).padStart(3, '0')}.pdf`);
  await page.pdf({ path: f, width: `${W}px`, height: `${H}px`, margin: { top: 0, right: 0, bottom: 0, left: 0 }, printBackground: true, pageRanges: '1', tagged: true });
  files.push(f); links.push(r); ids.forEach(i => where[i] = n); n++;
}
for (const p of plan) {
  const title = await page.evaluate(id => { const s = document.getElementById(id), e = s.querySelector('.eyebrow'), h = s.querySelector('h1, h2'); return { eb: e ? e.textContent.trim() : '', h: h ? h.textContent.replace(/\s+/g, ' ').trim() : id }; }, p.id);
  toc.push([n, (title.eb && !/^chapter/i.test(title.eb) ? title.eb + ' ' : '') + title.h]);
  where[p.id] = n;
  const cont = j => j ? `${title.eb ? title.eb + ' · ' : ''}${title.h} (cont.)` : '';
  if (p.refs) {
    const [a, b, c] = await refsSplit(p);
    for (let j = 0; j < 2; j++) {
      await show('references', 1);
      await page.evaluate(([lo, hi]) => document.querySelectorAll('ol.refs4 li').forEach((li, i) => li.style.display = i >= lo && i < hi ? '' : 'none'), j ? [b, c] : [a, b]);
      await page.evaluate(j => { const h = document.querySelector('#references h2'); if (h) h.style.visibility = j ? 'hidden' : ''; }, j);
      // fit the slide
      let z = 1;
      for (let t = 0; t < 6; t++) { const end = await page.evaluate(() => { const s = document.getElementById('references'); return s.querySelector('.wrap').getBoundingClientRect().bottom - s.getBoundingClientRect().top; }); if (end <= H - BOTTOM) break; z *= (H - BOTTOM - 4) / end; await page.evaluate(z => document.querySelector('#references > .wrap').style.zoom = z.toFixed(3), z); await page.waitForTimeout(150); }
      p.zoom = Math.min(p.zoom || 1, z);
      await snap(cont(j), `${n + 1} / ${info.total}`);
      await page.evaluate(() => { const h = document.querySelector('#references h2'); if (h) h.style.visibility = ''; });
    }
    continue;
  }
  await show(p.id, p.zoom);
  const bounds = [0, ...p.cuts, Infinity];
  const pagesHere = p.cuts.length + 1;
  for (let j = 0; j < pagesHere; j++) {
    const a = bounds[j], b = bounds[j + 1], shift = j ? a - TOP : 0;
    await page.evaluate(([id, a, b, shift, cont]) => {
      const s = document.getElementById(id), st = s.getBoundingClientRect().top;
      s.querySelectorAll('.pdf-hide').forEach(e => e.classList.remove('pdf-hide'));
      const w = s.querySelector(':scope > .wrap');
      if (w) w.querySelectorAll('*').forEach(e => { const r = e.getBoundingClientRect(); if (!r.height) return; const t = r.top - st, bt = r.bottom - st; if (t >= b - 1 || (cont && bt <= a + 1)) e.classList.add('pdf-hide'); });
      s.querySelectorAll(':scope > .trans').forEach(t => t.classList.add('pdf-hide'));
      s.style.transform = shift ? `translateY(${-shift}px)` : '';
    }, [p.id, a, b, shift, j ? 1 : 0]);
    await snap(cont(j), `${n + 1} / ${info.total}`);
  }
  if (p.trans) {
    await page.evaluate(id => {
      const s = document.getElementById(id), t = s.querySelector(':scope > .trans'), st = s.getBoundingClientRect().top;
      s.querySelectorAll('.pdf-hide').forEach(e => e.classList.remove('pdf-hide'));
      s.querySelectorAll(':scope > .wrap, :scope > .corner-art').forEach(e => e.classList.add('pdf-hide'));
      s.style.transform = `translateY(${-(t.getBoundingClientRect().top - st - 64)}px)`;
    }, p.id);
    await snap('', `${n + 1} / ${info.total}`);
  }
}
const checkRows = await page.evaluate(() => window.V4_SOURCE_CHECK || []);
await browser.close();
// source check table with the slide each source line is printed on
{
  const ST = { 'article-verified': 'has link (article)', 'page-verified': 'has link (page, figure not confirmed)', 'reference': 'has link (References)', 'official-home': 'has link (official site)', 'need': '**cần bổ sung**' };
  const esc = s => String(s).replace(/\|/g, '\\|');
  const rows = checkRows.map((r, i) => `| ${scPage[i] || '–'} | ${esc(r.fig)} | ${esc(r.source)}${r.n ? ` [${r.n}]` : ''} | ${r.url ? esc(decodeURI(r.url)) : '—'} | ${ST[r.status] || r.status} |`);
  const need = checkRows.filter(r => r.status === 'need').length;
  fs.writeFileSync(path.join(HERE, 'SOURCE_CHECK.md'), `# Source check (appendix, not one of the 73 slides)\n\nEvery source named in a "Source:" line of the slides, with the slide it appears on, the link it now carries and its status. ${checkRows.length} entries, ${need} still without a link ("cần bổ sung").\n\nStatus: *article* = a search result shows the page with this figure or claim; *page* = the right page or database, the exact figure not confirmed; *References* = the URL of the numbered entry in References; *official site* = the organisation's home page (cited only as an institution). The pages could not be opened from the build environment, so links were checked through search results only. Please open each link once before presenting.\n\n| Slide | Figure / table | Source | URL | Status |\n|---|---|---|---|---|\n${rows.join('\n')}\n`);
}
if (n !== info.total) console.warn(`  ${n} pages, expected ${info.total}`);

// 3. merge, bookmarks, links inside the deck
const merge = `
import json, sys
from pypdf import PdfWriter, PdfReader
from pypdf.generic import ArrayObject, DictionaryObject, FloatObject, NameObject, NumberObject
files, toc, links, where, out = json.loads(sys.argv[1]), json.loads(sys.argv[2]), json.loads(sys.argv[3]), json.loads(sys.argv[4]), sys.argv[5]
w = PdfWriter()
for f in files: w.append(PdfReader(f))
for i, t in toc: w.add_outline_item(t, i)
added = 0
for i, ls in enumerate(links):
    pg = w.pages[i]; ph = float(pg.mediabox.height); k = ph / 1080.0
    for l in ls:
        tgt = where.get(l['href'])
        if tgt is None: continue
        rect = [l['x'] * k, ph - (l['y'] + l['h']) * k, (l['x'] + l['w']) * k, ph - l['y'] * k]
        a = DictionaryObject({NameObject('/Type'): NameObject('/Annot'), NameObject('/Subtype'): NameObject('/Link'),
            NameObject('/Rect'): ArrayObject([FloatObject(v) for v in rect]), NameObject('/Border'): ArrayObject([NumberObject(0)] * 3),
            NameObject('/Dest'): ArrayObject([w.pages[tgt].indirect_reference, NameObject('/Fit')])})
        if '/Annots' not in pg: pg[NameObject('/Annots')] = ArrayObject()
        pg['/Annots'].append(w._add_object(a)); added += 1
w.add_metadata({'/Title': 'The European Union and its influence on Vietnam (slides)', '/Author': 'Group 4, National Economics University'})
with open(out, 'wb') as fh: w.write(fh)
print(added)
`;
const added = execFileSync('python3', ['-c', merge, JSON.stringify(files), JSON.stringify(toc), JSON.stringify(links), JSON.stringify(where), OUT], { maxBuffer: 1 << 26 }).toString().trim();
fs.rmSync(tmp, { recursive: true, force: true });
fs.writeFileSync(path.join(HERE, 'export_plan.json'), JSON.stringify(plan.map(p => ({ id: p.id, first: p.first, slides: p.k, zoom: +(p.zoom || 1).toFixed(3), cuts: p.cuts })), null, 1));
console.table(plan.map(p => ({ id: p.id, first: p.first, slides: p.k, zoom: (p.zoom || 1).toFixed(2) })));
console.log({ out: path.relative(process.cwd(), OUT), pages: n, sizeKB: Math.round(fs.statSync(OUT).size / 1024), internalLinks: +added, networkRequests: blocked.length, pageErrors: errors });
