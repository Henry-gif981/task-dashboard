// node tools/snap_text.js <file> <out_prefix>
// Ghi 2 tệp: <prefix>.txt = innerText của body (mở hết "Xem chi tiết", bỏ hiệu ứng ẩn)
//            <prefix>_content.txt = chữ nội dung trong <main> (kể cả tab đang ẩn), bỏ nhãn giao diện [data-ui], biểu đồ sinh bằng JS và script
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const [file, out] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.route(/^https?:/, r => r.abort());
  await p.goto('file://' + require('path').resolve(file) + '?no3d=1&nointro=1'); await p.waitForTimeout(2000);
  const r = await p.evaluate(() => {
    document.querySelectorAll('details').forEach(d => d.open = true);
    document.querySelectorAll('.rv, [data-rv]').forEach(x => x.classList.add('in'));
    const inner = document.body.innerText;
    const m = document.querySelector('main').cloneNode(true);
    m.querySelectorAll('script,style,[data-ui],[data-chart],.cmp-ctl,[data-stepper],.t-tabs,svg,.sr-only').forEach(e => e.remove());
    const parts = []; const walk = n => { if (n.nodeType === 3) parts.push(n.textContent); else if (n.nodeType === 1) { n.childNodes.forEach(walk); parts.push(' '); } };
    walk(m);
    return { inner, content: parts.join('').replace(/\s+/g, ' ').trim() };
  });
  require('fs').writeFileSync(out + '.txt', r.inner); require('fs').writeFileSync(out + '_content.txt', r.content);
  await b.close();
})();
