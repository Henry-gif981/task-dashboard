// Export the presentation to PDF, fully offline.
//   node scripts/export_pdf.mjs            (from eu-presentation/)
// Output: pdf/EU_presentation.pdf      16:9 slides, 1920 x 1080 px pages
//         pdf/EU_presentation_A4.pdf   A4 portrait report, 15 mm margins
// Uses Playwright's Chromium; no network requests are allowed (fonts and
// vendor/three.min.js are local). The page text is not changed: only the
// print CSS in index.html (@media print) and the steps below are used.
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }   // preinstalled copy

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'pdf');
const SRC = pathToFileURL(path.join(ROOT, 'index.html')).href;
const DISCLAIMER = 'Student presentation by Group 4, National Economics University. Not an official publication of the European Union.';
fs.mkdirSync(OUT, { recursive: true });

const VARIANTS = [
  {
    file: 'EU_presentation.pdf', a4: false,
    viewport: { width: 1920, height: 1080 },
    // page size passed here, not via preferCSSPageSize: with that option Chromium evaluates the
    // print media queries against its default paper width (about 816 px), i.e. the phone layout
    pdf: { width: '1920px', height: '1080px', margin: { top: '40px', bottom: '80px', left: '0px', right: '0px' } },
    footer: { size: 15, padX: 96 },
    fitHeight: 960                                   // 1080 - 40 - 80 px of margins
  },
  {
    file: 'EU_presentation_A4.pdf', a4: true,
    viewport: { width: 680, height: 1009 },          // A4 content box: 180 x 267 mm at 96 dpi
    pageCss: '@page { size: A4 portrait; }',       // overrides the 1920 x 1080 @page of index.html
    pdf: { width: '210mm', height: '297mm', margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' } },
    footer: { size: 7.5, padX: 57 }
  }
];

const footerTemplate = (f, number) => `<div style="width:100%;box-sizing:border-box;padding:0 ${f.padX}px;font-family:'DejaVu Sans',Arial,sans-serif;font-size:${f.size}px;color:#4A5A78;display:flex;justify-content:space-between;align-items:center;gap:16px">` +
  `<span>${DISCLAIMER}</span>` + (number ? `<span style="white-space:nowrap"><span class="pageNumber"></span> / <span class="totalPages"></span></span>` : '<span></span>') + `</div>`;

// Text of the web page as shown on screen, and of the elements that only exist for on-screen
// use (navigation, buttons); scripts/check_pdf.py compares the PDFs with it.
const UI_ONLY = '.nav, .dots, .scroll-hint, .counter, .star-progress, .btn, .actions, .vz-btn, .vz-tip, .vz-table, .sr-only';
async function screenText(page) {
  await page.goto(SRC, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  return page.evaluate(sel => ({
    screen: document.body.innerText,
    uiOnly: [...document.querySelectorAll(sel)].map(e => e.innerText).filter(Boolean),
    references: [...document.querySelectorAll('#references .refs li')].map(li => li.innerText)
  }), UI_ONLY);
}

async function prepare(page, v) {
  await page.goto(SRC, { waitUntil: 'load' });
  if (v.a4) await page.evaluate(() => document.documentElement.classList.add('pdf-a4'));
  if (v.pageCss) await page.addStyleTag({ content: v.pageCss });
  await page.emulateMedia({ media: 'print', reducedMotion: 'reduce' });
  await page.evaluate(async () => {
    // every font face used, including the Vietnamese subsets
    const sample = 'Đặng Việt Hoàng Nguyễn Thị Mai Hoa Báo Công Thương đề xuất doanh nghiệp được tự chứng nhận xuất xứ hàng hóa';
    await Promise.all(['400 16px Inter', '500 16px Inter', '600 16px Inter', '700 16px Inter', '800 16px Inter', 'italic 400 16px Inter',
      '400 16px "Source Serif 4"', '600 16px "Source Serif 4"', 'italic 400 16px "Source Serif 4"'].map(f => document.fonts.load(f, sample)));
    await document.fonts.ready;
    await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
    // final state of every effect: reveals, draw-in, count-ups
    document.querySelectorAll('.rv').forEach(e => e.classList.add('in'));
    document.querySelectorAll('.vz-anim').forEach(e => e.classList.add('drawn'));
    dispatchEvent(new Event('resize'));        // redraw the charts at the print width
  });
  await page.waitForTimeout(700);
  await page.evaluate(() => dispatchEvent(new Event('beforeprint')));
  if (v.fitHeight) v.zoomed = await fitSections(page, v.fitHeight);
  await page.waitForTimeout(200);
}

// Slide PDF: a section that runs a little over a page boundary (and would leave an almost
// empty page) is scaled down with CSS zoom until it fills a whole number of pages.
// Nothing is removed; only sections whose zoom stays at or above 0.72 are touched.
async function fitSections(page, H) {
  const out = [];
  const ids = await page.evaluate(H => [...document.querySelectorAll('main > section')].filter(s => {
    const h = s.getBoundingClientRect().height, n = Math.ceil(h / (H * .97));
    return n >= 2 && h - (n - 1) * H < H * .4 && (n - 1) * H * .93 / h >= .72;
  }).map(s => s.id), H);
  for (const id of ids) {
    // charts are redrawn at the new width after each change, so measure again until it fits
    let z = 1;
    for (let k = 0; k < 6; k++) {
      const h = await page.evaluate(id => document.getElementById(id).getBoundingClientRect().height, id);
      const n = Math.ceil(h / (H * .97)); if (h <= (n - 1 || 1) * H * .95 && k) break;
      const target = Math.max(1, Math.ceil(h / H) - 1) * H * .94;
      if (h <= target) break;
      z = Math.max(.7, z * target / h);
      await page.evaluate(([id, z]) => { document.getElementById(id).style.zoom = z.toFixed(3); dispatchEvent(new Event('resize')); }, [id, z]);
      await page.waitForTimeout(350);
    }
    const h = await page.evaluate(id => document.getElementById(id).getBoundingClientRect().height, id);
    out.push(`${id} x${z.toFixed(2)} (${Math.round(h)}px)`);
  }
  return out;
}

const browser = await chromium.launch();
const results = [];
for (const v of VARIANTS) {
  const ctx = await browser.newContext({ viewport: v.viewport, reducedMotion: 'reduce' });
  const blocked = [];
  await ctx.route(/^https?:/, r => { blocked.push(r.request().url()); r.abort(); });
  const page = await ctx.newPage();
  if (!v.a4) fs.writeFileSync(path.join(OUT, 'reference_text.json'), JSON.stringify(await screenText(page), null, 1));
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await prepare(page, v);
  const common = { ...v.pdf, printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>', tagged: true, outline: true };
  const target = path.join(OUT, v.file);
  await page.pdf({ ...common, path: target, footerTemplate: footerTemplate(v.footer, true) });
  // cover page again without the page number, then scripts/pdf_postprocess.py splices it in
  // and restores the spaces in the bookmark titles
  const cover = path.join(OUT, '.cover.pdf'), heads = path.join(OUT, '.headings.json');
  await page.pdf({ ...common, path: cover, pageRanges: '1', footerTemplate: footerTemplate(v.footer, false) });
  fs.writeFileSync(heads, JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map(h => h.innerText))));
  let post = '';
  try { post = execFileSync('python3', [path.join(ROOT, 'scripts', 'pdf_postprocess.py'), target, cover, heads], { encoding: 'utf8' }).trim(); }
  catch (e) { console.warn('  post-processing skipped (needs python3 + pypdf): cover keeps its page number:', String(e.stderr || e.message).trim().split('\n').pop()); }
  fs.rmSync(cover, { force: true }); fs.rmSync(heads, { force: true });
  const coverDone = post.startsWith('cover');
  results.push({ file: path.relative(ROOT, target), sizeKB: Math.round(fs.statSync(target).size / 1024), coverWithoutNumber: coverDone, networkRequests: blocked.length, pageErrors: errors.length });
  await ctx.close();
}
await browser.close();
console.table(results);
