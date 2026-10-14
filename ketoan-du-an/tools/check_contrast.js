// node tools/check_contrast.js <file> — tỷ lệ tương phản chữ/nền (WCAG AA) ở nền sáng và nền tối
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + require('path').resolve(process.argv[2] || 'index.html')); await p.waitForTimeout(800);
  for (const theme of ['light', 'dark']) {
    const res = await p.evaluate(theme => {
      document.documentElement.dataset.theme = theme;
      document.querySelectorAll('details').forEach(d => d.open = true);
      document.querySelectorAll('.rv').forEach(x => x.classList.add('in')); document.querySelectorAll('.seg button').forEach(x => x.setAttribute('aria-pressed', 'true'));
      const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: v[0], g: v[1], b: v[2], a: v[3] == null ? 1 : v[3] }; };
      const lum = c => { const f = x => { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
      const bgOf = el => { let stack = []; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a >= 1) break; } if (getComputedStyle(e).backgroundImage !== 'none' && e !== document.body && e !== document.documentElement) return null; } let out = { r: 255, g: 255, b: 255 }; for (const c of stack.reverse()) out = { r: c.r * c.a + out.r * (1 - c.a), g: c.g * c.a + out.g * (1 - c.a), b: c.b * c.a + out.b * (1 - c.a) }; return out; };
      const bad = []; let n = 0;
      document.querySelectorAll('main *, .tools *, aside *').forEach(el => {
        if (![...el.childNodes].some(t => t.nodeType === 3 && t.textContent.trim())) return;
        if (el.closest('svg') || el.closest('.sr-only') || el.closest('[hidden]')) return;
        const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return;
        if (el.closest('.flow-row.pending') || el.closest('.dim')) return; // trạng thái làm mờ có chủ đích
        const fg = parse(cs.color), bg = bgOf(el); if (!fg || !bg) return; n++;
        const f = fg.a < 1 ? { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) } : fg;
        const L1 = lum(f), L2 = lum(bg), cr = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
        const big = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && +cs.fontWeight >= 700);
        if (cr < (big ? 3 : 4.5)) bad.push(`${cr.toFixed(2)} ${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${el.textContent.trim().slice(0, 40)}"`);
      });
      return { n, bad: [...new Set(bad)] };
    }, theme);
    console.log(theme, 'checked', res.n, 'fail', res.bad.length); res.bad.slice(0, 40).forEach(x => console.log('  ', x));
  }
  await b.close();
})();
