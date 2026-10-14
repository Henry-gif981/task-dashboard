// node tools/check_viz_dom.js <file> — nghiệm thu bộ biểu đồ:
// 1) đếm đủ V1–V13 theo selector [data-viz];
// 2) (nhãn trục: <text class="muted mono"> và dòng "Thang đo …" không tính) mọi số liệu hiển thị trong mỗi biểu đồ (chuỗi có dấu phẩy thập phân, dấu chấm hàng nghìn, % hoặc ngày dd/mm/yyyy)
//    phải có trong viz_data.json. Số mốc trục (0, 50, 100, 2013…) không tính.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const file = process.argv[2] || 'index.html';
  const vp = path.join(path.dirname(path.resolve(file)), 'viz_data.json'); const viz = fs.readFileSync(fs.existsSync(vp) ? vp : path.join(__dirname, '..', 'viz_data.json'), 'utf8');
  const NUM = /\d{1,2}\/\d{1,2}\/\d{4}|\d+(?:[.,]\d+)+%?|\d+%/g;
  const vizNums = new Set((viz.match(NUM) || []));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.route(/^https?:/, r => r.abort());
  await p.goto('file://' + path.resolve(file) + '?nointro=1&no3d=1'); await p.waitForTimeout(2000);
  await p.evaluate(() => { document.querySelectorAll('.count').forEach(c => c.textContent = c.dataset.v); });
  const items = await p.evaluate(() => [...document.querySelectorAll('[data-viz]')].map(s => ({ v: s.dataset.viz, key: s.dataset.key || '', text: [...s.querySelectorAll('text')].filter(t => !(t.classList.contains('muted') && t.classList.contains('mono')) && !/^Thang đo/.test(t.textContent)).map(t => t.textContent).join(' | ') + ' ' + (s.getAttribute('aria-label') || '') })));
  const want = Array.from({ length: 13 }, (_, i) => 'V' + (i + 1));
  const found = [...new Set(items.map(i => i.v))];
  const missing = want.filter(v => !found.includes(v));
  const bad = []; const perViz = {};
  items.forEach(it => {
    const nums = (it.text.match(NUM) || []).map(n => n.replace(/^[−+]/, ''));
    perViz[it.v] = (perViz[it.v] || 0) + nums.length;
    nums.forEach(n => { const bare = n.replace('%', ''); if (!vizNums.has(n) && !vizNums.has(bare) && !vizNums.has(bare + '%')) bad.push(`${it.v}${it.key ? '(' + it.key + ')' : ''}: ${n}`); });
  });
  const out = { svgCount: items.length, found: found.sort((a, b) => +a.slice(1) - +b.slice(1)), missing, numbersCheckedPerViz: perViz, numbersNotInVizData: [...new Set(bad)] };
  console.log(JSON.stringify(out, null, 1));
  await b.close();
  process.exit(missing.length || bad.length ? 1 : 0);
})();
