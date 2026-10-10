// WCAG AA contrast check for every visible text element (HTML text and SVG chart labels),
// plus a rule that yellow/gold text never sits on a light background.
// Usage (from eu-presentation/):  node tools/check_contrast.js [page.html]
// Text over the transparent dark sections (3D canvas behind) is measured against #001A57.
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

(async () => {
  const file = path.resolve(process.argv[2] || path.join(__dirname, '..', 'index.html'));
  const browser = await chromium.launch();
  const results = [];
  for (const [w, h] of [[1920, 1080], [390, 844]]) {
    const p = await browser.newPage({ viewport: { width: w, height: h } });
    await p.route(/^https?:/, r => r.abort());
    await p.goto('file://' + file); await p.waitForTimeout(800);
    await p.evaluate(() => document.querySelectorAll('.rv').forEach(e => e.classList.add('in')));
    await p.waitForTimeout(600);
    const r = await p.evaluate(() => {
      const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 }; };
      const hex = h => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16), a: 1 });
      const lum = c => { const f = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
      const ratio = (a, b) => { const A = lum(a), B = lum(b); return (Math.max(A, B) + 0.05) / (Math.min(A, B) + 0.05); };
      const mix = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
      const isYellow = c => c.r > 200 && c.g > 160 && c.b < 90;
      function background(el) {
        if (el.dataset && el.dataset.bg) return hex(el.dataset.bg);
        const layers = [];
        for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
          if (e.matches && e.matches('.hero, .sec.dark')) { layers.push(hex('#001A57')); break; }
          const c = parse(getComputedStyle(e).backgroundColor); if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
        }
        let bg = layers.length && layers[layers.length - 1].a >= 1 ? layers.pop() : hex('#FBFCFE');
        while (layers.length) bg = mix(layers.pop(), bg);
        return bg;
      }
      const out = [];
      const els = [...document.querySelectorAll('body *')].filter(e => !e.closest('svg') || e.tagName.toLowerCase() === 'text');
      for (const el of els) {
        if (el.closest('[aria-hidden="true"], .sr-only, noscript, script, style')) continue;
        const own = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ');
        if (!own) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') continue;
        let op = 1; for (let e = el; e; e = e.parentElement) op *= parseFloat(getComputedStyle(e).opacity);
        if (op < 0.5) continue;                                  // hover-only tooltips etc.
        const rect = el.getBoundingClientRect(); if (!rect.width || !rect.height) continue;
        const isSvg = el.tagName.toLowerCase() === 'text';
        let fg = parse(isSvg ? cs.fill : cs.color); if (!fg) continue;
        const bg = background(el); fg = mix(fg, bg);
        const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700;
        const large = size >= 24 || (bold && size >= 18.66);
        const need = large ? 3 : 4.5, cr = ratio(fg, bg);
        const yellowOnLight = isYellow(fg) && lum(bg) > 0.4;
        if (cr < need || yellowOnLight) out.push({ text: own.slice(0, 50), ratio: +cr.toFixed(2), need, yellowOnLight, size: Math.round(size), sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').join('.') : '') });
      }
      return { checked: els.length, fails: out };
    });
    results.push([`${w}x${h}`, r]);
    await p.close();
  }
  await browser.close();
  let bad = 0;
  for (const [vp, r] of results) {
    console.log(`== ${vp}: ${r.fails.length} failing text elements ==`);
    r.fails.forEach(f => console.log(`  ${f.ratio}:1 (needs ${f.need}) ${f.yellowOnLight ? 'YELLOW ON LIGHT ' : ''}${f.sel} [${f.size}px] "${f.text}"`));
    bad += r.fails.length;
  }
  process.exit(bad ? 1 : 0);
})();
