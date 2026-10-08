// Check the rendered page against the report PDF.
//   1. every number / year / percentage shown on the page must appear in the PDF text
//   2. every href="#..." must point to an existing id
// Usage (from eu-presentation/):  node tools/check_page.js "<path to BTL Đa biên - Nhóm 4.pdf>" [page.html]
// Needs: Node, Playwright (npm i playwright) and pdftotext (poppler-utils).
const { execFileSync } = require('child_process');
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const NUM = /\d+(?:[.,]\d+)*/g;
const norm = t => t.replace(/[‐-―]/g, '-');

(async () => {
  const pdf = process.argv[2];
  const page = path.resolve(process.argv[3] || path.join(__dirname, '..', 'index.html'));
  if (!pdf) { console.error('usage: node tools/check_page.js <report.pdf> [page.html]'); process.exit(2); }
  const pdfText = norm(execFileSync('pdftotext', ['-layout', pdf, '-'], { maxBuffer: 1 << 26 }).toString());
  const pdfNums = new Set(pdfText.match(NUM));

  const browser = await chromium.launch();
  const p = await browser.newPage();
  await p.route(/^https?:/, r => r.abort());          // offline: page must not need the network
  await p.goto('file://' + page);
  await p.waitForTimeout(800);
  const res = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('main > section').forEach(sec => {
      const svgText = [...sec.querySelectorAll('svg text')].map(t => t.textContent).join(' ');
      out.push({ id: sec.id, text: sec.innerText + ' ' + svgText });
    });
    const ids = new Set([...document.querySelectorAll('[id]')].map(e => e.id));
    const badLinks = [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href').slice(1)).filter(h => h && !ids.has(h));
    const links = document.querySelectorAll('a[href^="#"]').length;
    return { sections: out, badLinks, links };
  });
  await browser.close();

  let missing = 0;
  console.log('== Numbers on the page that do not appear in the PDF ==');
  for (const s of res.sections) {
    const nums = [...new Set(norm(s.text).match(NUM) || [])];
    const bad = nums.filter(n => !pdfNums.has(n));
    if (bad.length) { missing += bad.length; console.log(`#${s.id}: ${bad.join(', ')}`); }
  }
  if (!missing) console.log('(none)');
  console.log(`\n== Anchor links: ${res.links} checked ==`);
  console.log(res.badLinks.length ? 'BROKEN: ' + res.badLinks.join(', ') : 'all href="#..." targets exist');
  process.exit(res.badLinks.length ? 1 : 0);
})();
