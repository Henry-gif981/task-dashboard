// Slide-deck PDF: the page as it looks on screen in presentation mode, one 16:9 page
// (1920 x 1080 px) per slide, fully offline.
//   node scripts/export_slides.mjs [source.html] [output.pdf]
// Defaults: v3b/EU_presentation_standalone_v3b.html -> v3b/EU_presentation_v3b_slides.pdf
// A section taller than the screen is first scaled down (CSS zoom, not below 0.68, or 0.6
// where that avoids cutting through a block);
// if it still does not fit, it continues on the next page, cut only between blocks
// (paragraphs, cards, figures, whole tables), with "(cont.)" at the top. No text is changed.
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }   // preinstalled copy

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.resolve(process.argv[2] || path.join(ROOT, 'v3b', 'EU_presentation_standalone_v3b.html'));
const OUT = path.resolve(process.argv[3] || path.join(ROOT, 'v3b', 'EU_presentation_v3b_slides.pdf'));
const W = 1920, H = 1080, TOP = 96, BOTTOM = 64, MINZOOM = .68, HARDMIN = .6;   // HARDMIN: only to avoid cutting through a block or an almost empty last page

const CSS = `
  html { scroll-behavior: auto !important; }
  .nav, .dots, .scroll-hint, .counter, .star-progress, .vz-btn, .vz-tip, .pz-ui, #pz-hud, #pz-laser, .to-top, .site-foot, #progress { display: none !important; }
  html.pdfs main > section:not(.pdf-cur) { display: none !important; }
  html.pdfs, html.pdfs body { height: ${H}px !important; overflow: hidden !important; }
  .pdf-hide { visibility: hidden !important; }
  #pdf-cont { position: fixed; top: 30px; left: 96px; right: 96px; font: 600 15px/1.2 Inter, Arial, sans-serif; letter-spacing: .12em; text-transform: uppercase; z-index: 99; }
  #pdf-num { position: fixed; bottom: 22px; right: 40px; font: 500 15px/1 Inter, Arial, sans-serif; z-index: 99; }
  #pdf-cont, #pdf-num { color: var(--pdf-ink); }
  @page { size: ${W}px ${H}px; margin: 0; }
  /* a page cannot hold a WebGL canvas: use the drawn fallback of the 3D visuals, as the print stylesheet does */
  .vz-stage canvas, .vz-stage .tag3d { display: none !important; }
  .vz-stage svg.iso { visibility: visible !important; }
  /* the milestone strip scrolls sideways on screen; on a page it wraps onto several rows */
  .vz-strip { overflow: visible !important; }
  .vz-strip ol { flex-wrap: wrap; width: auto !important; row-gap: 14px; }
  .vz-strip ol::before { display: none; }
  /* slightly wider word gaps so that text copied from the PDF keeps its spaces */
  html.pdfs body { word-spacing: .05em; }
`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, reducedMotion: 'reduce' });
const blocked = [];
await ctx.route(/^https?:/, r => { blocked.push(r.request().url()); r.abort(); });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto(pathToFileURL(SRC).href, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForLoadState('load', { timeout: 30000 }).catch(() => {});
await page.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
await page.addStyleTag({ content: CSS });
// the dark slides (cover, chapter openings, Q&A) are drawn over the fixed 3D canvas, which a PDF
// page does not capture: photograph the canvas behind each one and use it as its background
const darkIds = await page.evaluate(() => [...document.querySelectorAll('main > section.dark, main > section.hero')].map(s => s.id));
await page.addStyleTag({ content: '.pdf-bgshot .wrap, .pdf-bgshot .hero-anchor { visibility: hidden !important; }' });
const backgrounds = {};
for (const id of darkIds) {
  await page.evaluate(id => { document.body.classList.add('pdf-bgshot'); scrollTo(0, document.getElementById(id).getBoundingClientRect().top + scrollY); }, id);
  await page.waitForTimeout(1500);
  backgrounds[id] = 'data:image/jpeg;base64,' + (await page.screenshot({ type: 'jpeg', quality: 88 })).toString('base64');
}
await page.evaluate(bgs => {
  document.body.classList.remove('pdf-bgshot');
  for (const [id, url] of Object.entries(bgs)) document.getElementById(id).style.cssText += `;background: var(--navy) url(${url}) center top / cover no-repeat !important;`;
}, backgrounds);
await page.evaluate(async () => {
  await document.fonts.ready;
  document.querySelectorAll('.rv').forEach(e => e.classList.add('in'));
  document.querySelectorAll('.vz-anim').forEach(e => e.classList.add('drawn'));
  document.documentElement.classList.add('pdfs');
  // References are set in two columns: split the list in two halves so the page break falls
  // between two complete blocks instead of through an entry
  const ul = document.querySelector('#references ul.refs');
  if (ul) { const li = [...ul.children], ul2 = ul.cloneNode(false); li.slice(Math.ceil(li.length / 2)).forEach(x => ul2.appendChild(x)); ul.after(ul2); }
  for (const id of ['pdf-cont', 'pdf-num']) { const d = document.createElement('div'); d.id = id; document.body.append(d); }
});
await page.waitForTimeout(1500);

const ids = await page.evaluate(() => [...document.querySelectorAll('main > section')].map(s => s.id));
const show = async (id, zoom) => {
  await page.evaluate(([id, z]) => {
    document.querySelectorAll('main > section').forEach(s => { s.classList.toggle('pdf-cur', s.id === id); s.style.zoom = ''; s.style.transform = ''; });
    const s = document.getElementById(id); if (z !== 1) s.style.zoom = z.toFixed(3);
    document.querySelectorAll('.pdf-hide').forEach(e => e.classList.remove('pdf-hide'));
    scrollTo(0, 0); dispatchEvent(new Event('resize'));    // charts redraw at the new width
  }, [id, zoom]);
  await page.waitForTimeout(400);
};
const height = id => page.evaluate(id => document.getElementById(id).getBoundingClientRect().height, id);

// 1. plan: zoom and page breaks of every section
const plan = [];
for (const id of ids) {
  let z = 1; await show(id, 1);
  let h = await height(id);
  // room on n pages: continuation pages keep a band at the top, and breaks fall between blocks
  const room = n => n === 1 ? H - 2 : (H - BOTTOM + (n - 1) * (H - TOP - BOTTOM)) * .92;
  let need = 1; while (room(need) < h) need++;
  // fewer pages if a zoom >= MINZOOM is enough; charts re-layout, so measure again
  let pages = need;
  for (let n = 1; n < need; n++) {
    let zz = 1, hh = h;
    for (let k = 0; k < 6 && hh > room(n); k++) { zz = zz * (room(n) - 4) / hh; if (zz < MINZOOM) break; await show(id, zz); hh = await height(id); }
    if (zz >= MINZOOM && hh <= room(n)) { z = zz; h = hh; pages = n; break; }
    await show(id, 1);
  }
  if (z !== 1) await show(id, z);
  // break points: the top of a block that nothing atomic straddles
  const cutsAt = () => page.evaluate(([id, H, TOP, BOTTOM]) => {
    const s = document.getElementById(id), st = s.getBoundingClientRect().top, sh = s.getBoundingClientRect().height;
    if (sh <= H + 2) return { cuts: [], forced: 0, tail: 0 };
    const atoms = [...s.querySelectorAll('figure, svg, img, canvas, tr, .card, p, li, h1, h2, h3, h4, h5, blockquote, .kpi, .takeaway, .tnote, .src, .cap, .lead, dt, dd, .vz, [role=listitem], .tl .m, .vz-strip')]
      .map(e => e.getBoundingClientRect()).filter(r => r.height).map(r => [r.top - st, r.bottom - st]);
    // a table keeps its caption, header and first two rows together
    // a table that fits on one page is never split (with its caption); a longer one keeps caption, header and first rows together
    const room = H - TOP - BOTTOM - 8;
    s.querySelectorAll('table').forEach(t => {
      const box = t.closest('.tbl-wrap') || t, tr = box.getBoundingClientRect(), r = t.querySelectorAll('tbody tr, tr'), last = r[Math.min(2, r.length - 1)];
      if (tr.height <= room) atoms.push([tr.top - st, tr.bottom - st]);
      else if (last) atoms.push([tr.top - st, last.getBoundingClientRect().bottom - st]);
    });
    // a caption stays with the block below it; a "Source:" line or table note stays with the block above it
    s.querySelectorAll('.cap').forEach(c => { const n = c.nextElementSibling; if (n) { const a = c.getBoundingClientRect(), b = n.getBoundingClientRect(); if (b.bottom - a.top <= room) atoms.push([a.top - st, Math.min(b.bottom, a.top + room) - st]); } });
    s.querySelectorAll('.src, .tnote').forEach(c => { const n = c.previousElementSibling; if (n) { const a = n.getBoundingClientRect(), b = c.getBoundingClientRect(), whole = n.matches('figure, table, .tbl-wrap, .vz, .chart, .src, .tnote'); atoms.push([(whole ? Math.max(a.top, b.bottom - room) : Math.max(a.top, b.top - 60)) - st, b.bottom - st]); } });
    const cand = [...new Set(atoms.map(a => Math.round(a[0])))].filter(y => y > TOP && !atoms.some(([t, b]) => t < y - 1 && b > y + 1)).sort((a, b) => a - b);
    const out = []; let start = 0, forced = 0;
    while (sh - start > (start ? H - TOP : H) + 2) {
      const limit = start + H - BOTTOM - (start ? TOP : 0);
      const ok = cand.filter(y => y > start + (limit - start) * .4 && y <= limit);   // never leave a page more than 60% empty
      const y = ok.length ? ok[ok.length - 1] : limit;          // no clean break: cut at the limit
      if (!ok.length) forced++;
      out.push(y); start = y;
      if (out.length > 12) break;
    }
    return { cuts: out, forced, tail: (sh - start) / H };
  }, [id, H, TOP, BOTTOM]);
  let best = await cutsAt();
  // shrink a little more while that saves a page (breaks between blocks may need one page more
  // than planned, or leave an almost empty last page) or avoids a cut through a block
  const worse = (c, b) => c.forced < b.forced || (c.forced === b.forced && c.cuts.length < b.cuts.length);
  const goal = b => b.cuts.length + 1 > pages || b.forced > 0 || (b.cuts.length && b.tail < .3);
  for (let zz = z * .96; goal(best) && zz >= (best.forced || (best.cuts.length && best.tail < .3) ? HARDMIN : MINZOOM); zz *= .96) {
    await show(id, zz); const c = await cutsAt();
    if (worse(c, best)) { z = zz; h = await height(id); best = c; }
  }
  await show(id, z);
  const cuts = best.cuts;
  plan.push({ id, zoom: z, height: Math.round(h), cuts, forced: best.forced });
}

// 2. render: one PDF page per slide or continuation
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'slides-'));
const files = [], toc = [];
const total = plan.reduce((a, p) => a + p.cuts.length + 1, 0);
let n = 0;
for (const p of plan) {
  await show(p.id, p.zoom);
  const title = await page.evaluate(id => { const h = document.getElementById(id).querySelector('h1, h2'); return (h ? h.innerText : id).replace(/\s+/g, ' ').trim(); }, p.id);
  toc.push([n, title]);
  const bounds = [0, ...p.cuts, Infinity];
  for (let j = 0; j < bounds.length - 1; j++) {
    const a = bounds[j], b = bounds[j + 1], shift = j ? a - TOP : 0;
    await page.evaluate(([id, a, b, shift, z, cont, num]) => {
      const s = document.getElementById(id), st = s.getBoundingClientRect().top;
      s.querySelectorAll('.pdf-hide').forEach(e => e.classList.remove('pdf-hide'));
      // hide what belongs to the previous or the next page
      s.querySelectorAll('*').forEach(e => { const r = e.getBoundingClientRect(); if (!r.height) return; const t = r.top - st, bt = r.bottom - st; if (t >= b - 1 || (cont && bt <= a + 1)) e.classList.add('pdf-hide'); });
      s.style.transform = shift ? `translateY(${-shift / z}px)` : '';   // transform lengths are scaled by the zoom
      // label colour follows the section background
      const bg = getComputedStyle(s).backgroundColor.match(/\d+/g) || [255, 255, 255], lum = (+bg[0] * .3 + +bg[1] * .59 + +bg[2] * .11);
      document.documentElement.style.setProperty('--pdf-ink', lum < 128 ? 'rgba(255,255,255,.75)' : '#4A5A78');
      document.getElementById('pdf-cont').textContent = cont;
      document.getElementById('pdf-num').textContent = num;
    }, [p.id, a, b, shift, p.zoom, j ? `${title} (cont.)` : '', n ? `${n + 1} / ${total}` : '']);
    await page.waitForTimeout(80);
    const f = path.join(tmp, `p${String(n).padStart(3, '0')}.pdf`);
    await page.pdf({ path: f, width: `${W}px`, height: `${H}px`, margin: { top: 0, right: 0, bottom: 0, left: 0 }, printBackground: true, pageRanges: '1', tagged: true });
    files.push(f); n++;
  }
}
await browser.close();

// 3. merge with bookmarks (python3 + pypdf)
const merge = `
import json, sys
from pypdf import PdfWriter, PdfReader
files, toc, out = json.loads(sys.argv[1]), json.loads(sys.argv[2]), sys.argv[3]
w = PdfWriter()
for f in files: w.append(PdfReader(f))
for i, t in toc: w.add_outline_item(t, i)
w.add_metadata({'/Title': 'EU and Vietnam: slides', '/Author': 'Group 4, National Economics University'})
with open(out, 'wb') as fh: w.write(fh)
`;
execFileSync('python3', ['-c', merge, JSON.stringify(files), JSON.stringify(toc), OUT]);
fs.rmSync(tmp, { recursive: true, force: true });
console.table(plan.map(p => ({ id: p.id, zoom: p.zoom.toFixed(2), px: p.height, pages: p.cuts.length + 1, forced: p.forced })));
console.log({ out: path.relative(ROOT, OUT), pages: total, sizeKB: Math.round(fs.statSync(OUT).size / 1024), networkRequests: blocked.length, pageErrors: errors });
