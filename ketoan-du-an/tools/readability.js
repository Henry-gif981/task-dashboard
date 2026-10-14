// node tools/readability.js <file> [out.json]
// Đo khả năng đọc: tương phản (sáng/tối), cỡ chữ nhỏ nhất (HTML + nhãn SVG), cỡ thân bài, line-height,
// độ dài dòng (ký tự/dòng), cuộn ngang ở 1366×768 và 390×844. Chặn mạng, tắt 3D, bỏ màn mở đầu.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const file = 'file://' + path.resolve(process.argv[2] || 'index.html');
  const outFile = process.argv[3];
  const b = await chromium.launch();
  const R = {};
  async function page(w, h) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.route(/^https?:/, r => r.abort());
    await p.goto(file + '?nointro=1&no3d=1'); await p.waitForTimeout(1500);
    await p.evaluate(() => { document.querySelectorAll('details').forEach(d => d.open = true); document.querySelectorAll('.rv,[data-chart].armed').forEach(x => { x.classList.add('in'); x.classList.remove('armed'); }); });
    await p.waitForTimeout(600);
    return p;
  }
  // ---------- 1920×1080: cỡ chữ, độ dài dòng, tương phản ----------
  const p = await page(1920, 1080);
  for (const theme of ['light', 'dark']) {
    await p.evaluate(t => { document.documentElement.dataset.theme = t; document.body.classList.remove('on-dark'); }, theme);
    await p.waitForTimeout(900);
    R['contrast_' + theme] = await p.evaluate(() => {
      const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: v[0], g: v[1], b: v[2], a: v[3] == null ? 1 : v[3] }; };
      const lum = c => { const f = x => { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
      const bgOf = el => { const st = []; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c.a > 0) { st.push(c); if (c.a >= 1) break; } } let o = { r: 255, g: 255, b: 255 }; for (const c of st.reverse()) o = { r: c.r * c.a + o.r * (1 - c.a), g: c.g * c.a + o.g * (1 - c.a), b: c.b * c.a + o.b * (1 - c.a) }; return o; };
      let n = 0; const bad = [];
      document.querySelectorAll('body *').forEach(el => {
        if (!['SCRIPT', 'STYLE'].includes(el.tagName) && ![...el.childNodes].some(t => t.nodeType === 3 && t.textContent.trim())) return;
        if (el.closest('svg, .sr-only, [hidden], .intro, .lightbox:not(.open), .tip')) return;
        const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return;
        if (el.closest('.flow-row.pending, .dim')) return;
        const fg = parse(cs.color); if (!fg || fg.a === 0 || cs.webkitTextFillColor === 'rgba(0, 0, 0, 0)') return;
        const bg = bgOf(el); n++;
        const L1 = lum(fg), L2 = lum(bg), cr = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
        const fs = parseFloat(cs.fontSize), big = fs >= 24 || (fs >= 18.66 && +cs.fontWeight >= 700);
        if (cr < (big ? 3 : 4.5)) bad.push(`${cr.toFixed(2)} ${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${el.textContent.trim().slice(0, 30)}"`);
      });
      return { checked: n, fail: bad.length, examples: [...new Set(bad)].slice(0, 15) };
    });
  }
  await p.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
  await p.waitForTimeout(600);
  Object.assign(R, await p.evaluate(() => {
    const vis = el => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0 && !el.closest('.sr-only, [hidden], .intro, .lightbox:not(.open), .tip, .icon-sprite'); };
    // cỡ chữ nhỏ nhất (HTML)
    const small = []; let minHtml = 99;
    document.querySelectorAll('body *').forEach(el => {
      if (el.closest('svg')) return;
      if (![...el.childNodes].some(t => t.nodeType === 3 && t.textContent.trim())) return;
      if (!vis(el)) return;
      const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < minHtml) minHtml = fs;
      if (fs < 14) small.push(`${fs.toFixed(1)}px ${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${el.textContent.trim().slice(0, 24)}"`);
    });
    // nhãn SVG trong biểu đồ (cỡ hiển thị thật = font-size × tỉ lệ co giãn của SVG)
    const smallSvg = []; let minSvg = 99;
    document.querySelectorAll('svg text').forEach(t => {
      if (!vis(t) || !t.textContent.trim()) return;
      const s = t.ownerSVGElement; const vb = s.viewBox && s.viewBox.baseVal; const k = vb && vb.width ? s.getBoundingClientRect().width / vb.width : 1;
      const fs = parseFloat(getComputedStyle(t).fontSize) * k; if (fs < minSvg) minSvg = fs;
      if (fs < 14) smallSvg.push(`${fs.toFixed(1)}px "${t.textContent.trim().slice(0, 24)}"`);
    });
    // thân bài: đoạn văn trong nội dung
    const paras = [...document.querySelectorAll('main .wrap > p, main .lead-block p, main details.more p, main .conclusion p, main .rec p, main .remark')].filter(vis).filter(p => p.textContent.trim().length > 60);
    const sizes = paras.map(p => parseFloat(getComputedStyle(p).fontSize));
    const lhs = paras.map(p => { const cs = getComputedStyle(p); return parseFloat(cs.lineHeight) / parseFloat(cs.fontSize); });
    // độ dài dòng: số ký tự / số dòng (đoạn ≥ 3 dòng)
    const cpl = [];
    paras.forEach(p => { const cs = getComputedStyle(p); const lines = Math.round(p.getBoundingClientRect().height / parseFloat(cs.lineHeight)); if (lines >= 3) cpl.push(Math.round(p.textContent.trim().length / lines)); });
    cpl.sort((a, b) => a - b);
    const q = a => a.length ? a[Math.floor(a.length / 2)] : null;
    return {
      font_min_html_px: +minHtml.toFixed(1), font_lt14_html: small.length, font_lt14_html_examples: [...new Set(small)].slice(0, 12),
      font_min_svg_px: +minSvg.toFixed(1), font_lt14_svg: smallSvg.length, font_lt14_svg_examples: [...new Set(smallSvg)].slice(0, 12),
      body_font_px: { min: Math.min(...sizes), max: Math.max(...sizes) },
      body_line_height: { min: +Math.min(...lhs).toFixed(2), max: +Math.max(...lhs).toFixed(2) },
      chars_per_line: { paragraphs: cpl.length, median: q(cpl), max: cpl[cpl.length - 1] },
      root_font_px: parseFloat(getComputedStyle(document.documentElement).fontSize)
    };
  }));
  await p.close();
  for (const [w, h] of [[1366, 768], [390, 844]]) {
    const q = await page(w, h);
    R[`hOverflow_${w}`] = await q.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    R[`clipped_${w}`] = await q.evaluate(() => { const out = []; document.querySelectorAll('main *').forEach(el => { const cs = getComputedStyle(el); if (cs.overflow === 'hidden' && el.scrollWidth > el.clientWidth + 2 && el.textContent.trim() && !el.closest('svg, .split, .chev, .tl-wrap, .sp-seg, .sr-only') && !el.matches('section.slide')) out.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`); }); return [...new Set(out)].slice(0, 10); });
    await q.close();
  }
  await b.close();
  const s = JSON.stringify(R, null, 1); console.log(s); if (outFile) fs.writeFileSync(outFile, s);
})();
