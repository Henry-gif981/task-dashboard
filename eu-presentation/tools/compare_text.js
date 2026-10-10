// Compare the visible text of two pages (innerText of <body>, markup ignored).
// Usage (from eu-presentation/):  node tools/compare_text.js index.backup.html index.html
// text-transform is neutralised in both pages before reading, so CSS case changes
// (e.g. small caps, uppercase labels) are not reported; only the words themselves are compared.
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

async function grab(browser, file) {
  const p = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.route(/^https?:/, r => r.abort());
  await p.goto('file://' + path.resolve(file));
  await p.waitForTimeout(800);
  await p.addStyleTag({ content: '*, *::before, *::after { text-transform: none !important; }' });
  const t = await p.evaluate(() => document.body.innerText);
  await p.close();
  return t.split('\n').map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
}

(async () => {
  const [a, b] = process.argv.slice(2);
  const browser = await chromium.launch();
  const A = await grab(browser, a), B = await grab(browser, b);
  await browser.close();
  // line diff (LCS)
  const n = A.length, m = B.length, L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = []; let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) out.push('- ' + A[i++]); else out.push('+ ' + B[j++]);
  }
  while (i < n) out.push('- ' + A[i++]); while (j < m) out.push('+ ' + B[j++]);
  console.log(`${a}: ${n} lines, ${b}: ${m} lines, identical lines: ${L[0][0]}`);
  console.log(out.length ? 'DIFFERENCES:\n' + out.join('\n') : 'IDENTICAL');
  process.exit(out.length ? 1 : 0);
})();
