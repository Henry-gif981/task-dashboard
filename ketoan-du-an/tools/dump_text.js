// node tools/dump_text.js <file> <out.txt> — xuất toàn bộ chữ trong trang (kể cả phần "Xem chi tiết" đang đóng)
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => { const [file, out] = process.argv.slice(2); const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + require('path').resolve(file)); await p.waitForTimeout(800);
  const t = await p.evaluate(() => { document.querySelectorAll('details').forEach(d => d.open = true);
    const parts = []; const walk = n => { if (n.nodeType === 3) parts.push(n.textContent); else if (n.nodeType === 1 && !['SCRIPT', 'STYLE'].includes(n.tagName)) { n.childNodes.forEach(walk); if (/^(P|LI|TD|TH|H\d|DIV|FIGCAPTION|DT|DD|TEXT|BUTTON|SPAN)$/i.test(n.tagName)) parts.push(' '); } };
    walk(document.body); return parts.join(''); });
  require('fs').writeFileSync(out, t); await b.close(); })();
