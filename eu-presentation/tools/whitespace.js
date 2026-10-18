// Measure unintended empty space per section, on screen, at several viewport sizes.
//   node tools/whitespace.js <page.html> <out.json> [shotDir]
// For each <section> in main: scroll its top to the top of the viewport and look at the first screen
// (the part of the viewport covered by the section, below the 72 px nav). Content = text line boxes
// (Range.getClientRects) + boxes of elements that are visibly painted (background, border, svg, canvas,
// img, table). The section, .wrap and .panel backgrounds do not count. On a 16 px grid we report:
//   empty      share of the first screen with no content
//   maxRect    largest empty rectangle, as a share of the first screen (and its size)
//   rightEmpty share of the right half that is empty
//   wholeEmpty share of the whole section (all its height) that is empty
let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const path = require('path'), fs = require('fs');
const [file, out, shotDir] = process.argv.slice(2);
const SIZES = [[1920, 1080], [1440, 900], [1280, 720]];
(async () => {
  const b = await pw.chromium.launch();
  const res = {};
  for (const [W, H] of SIZES) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, reducedMotion: 'reduce' });
    await ctx.route(/^https?:/, r => r.abort());
    const p = await ctx.newPage();
    await p.goto('file://' + path.resolve(file)); await p.waitForTimeout(1200);
    const total = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += H * .8) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(30); }
    const ids = await p.$$eval('main > section', s => s.map(x => x.id));
    res[`${W}x${H}`] = {};
    for (const id of ids) {
      await p.evaluate(i => { const s = document.getElementById(i); scrollTo(0, s.getBoundingClientRect().top + scrollY); }, id);
      await p.waitForTimeout(60);
      const m = await p.evaluate(({ id, NAV }) => {
        const sec = document.getElementById(id), sr = sec.getBoundingClientRect();
        const cs = getComputedStyle(sec), padL = parseFloat(cs.paddingLeft), padR = parseFloat(cs.paddingRight);
        const boxes = [];
        const walker = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT, { acceptNode: n => n.textContent.trim() ? 1 : 2 });
        let n; while ((n = walker.nextNode())) { const el = n.parentElement; if (el.closest('noscript, script, [hidden], .vz-table, .chno') || getComputedStyle(el).visibility === 'hidden') continue; const r = document.createRange(); r.selectNodeContents(n); for (const q of r.getClientRects()) if (q.width > 1 && q.height > 1) boxes.push([q.left, q.top, q.right, q.bottom]); }
        sec.querySelectorAll('*').forEach(el => {
          if (el === sec || el.matches('.wrap, .panel, noscript, script, .chno') || el.closest('[hidden], .vz-table')) return;
          const c = getComputedStyle(el); if (c.display === 'none' || c.visibility === 'hidden') return;
          const painted = /^(svg|canvas|img|table)$/i.test(el.tagName) || (c.backgroundColor !== 'rgba(0, 0, 0, 0)' && c.backgroundColor !== 'transparent') || parseFloat(c.borderTopWidth) + parseFloat(c.borderLeftWidth) > 0;
          if (!painted || el.closest('svg') && el.tagName.toLowerCase() !== 'svg') return;
          const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
          if (r.width * r.height > sr.width * sr.height * .9) return;
          boxes.push([r.left, r.top, r.right, r.bottom]);
        });
        const C = 16;
        function grid(x0, y0, x1, y1) {
          const cols = Math.max(1, Math.floor((x1 - x0) / C)), rows = Math.max(1, Math.floor((y1 - y0) / C));
          const g = Array.from({ length: rows }, () => new Uint8Array(cols));
          boxes.forEach(([l, t, r, bb]) => { const c0 = Math.max(0, Math.floor((l - x0) / C)), c1 = Math.min(cols - 1, Math.floor((r - x0) / C)), r0 = Math.max(0, Math.floor((t - y0) / C)), r1 = Math.min(rows - 1, Math.floor((bb - y0) / C)); for (let i = r0; i <= r1; i++) for (let j = c0; j <= c1; j++) g[i][j] = 1; });
          let filled = 0, rightFilled = 0; const half = Math.floor(cols / 2);
          g.forEach(row => row.forEach((v, j) => { filled += v; if (j >= half) rightFilled += v; }));
          // largest empty rectangle (histogram method)
          const h = new Array(cols).fill(0); let best = 0, bw = 0, bh = 0;
          for (let i = 0; i < rows; i++) { for (let j = 0; j < cols; j++) h[j] = g[i][j] ? 0 : h[j] + 1; const st = []; for (let j = 0; j <= cols; j++) { const hh = j === cols ? 0 : h[j]; while (st.length && h[st[st.length - 1]] >= hh) { const top = st.pop(), w = st.length ? j - st[st.length - 1] - 1 : j; if (h[top] * w > best) { best = h[top] * w; bw = w; bh = h[top]; } } st.push(j); } }
          return { cells: rows * cols, filled, empty: 1 - filled / (rows * cols), rightEmpty: 1 - rightFilled / (rows * (cols - half)), maxRect: best / (rows * cols), maxW: bw * C, maxH: bh * C };
        }
        // first screen: section ∩ viewport, below the nav, inside the section's side padding
        const y0 = Math.max(sr.top, NAV), y1 = Math.min(sr.bottom, innerHeight), x0 = sr.left + padL, x1 = sr.right - padR;
        const screen = grid(x0, y0, x1, y1);
        const whole = grid(x0, sr.top + parseFloat(cs.paddingTop) * .5, x1, sr.bottom - parseFloat(cs.paddingBottom) * .5);
        return { h: Math.round(sr.height), screens: +(sr.height / innerHeight).toFixed(2), scene: sec.dataset.scene, dark: sec.classList.contains('dark') || sec.classList.contains('hero'), auto: sec.classList.contains('auto'),
          empty: +screen.empty.toFixed(3), maxRect: +screen.maxRect.toFixed(3), maxW: screen.maxW, maxH: screen.maxH, rightEmpty: +screen.rightEmpty.toFixed(3), wholeEmpty: +whole.empty.toFixed(3), wholeMaxRect: +whole.maxRect.toFixed(3), title: (sec.querySelector('.eyebrow') || {}).textContent || '' };
      }, { id, NAV: 72 });
      res[`${W}x${H}`][id] = m;
      if (shotDir && W === 1440) { fs.mkdirSync(shotDir, { recursive: true }); await p.screenshot({ path: path.join(shotDir, `${id}.jpg`), type: 'jpeg', quality: 60 }); }
    }
    await ctx.close();
  }
  await b.close();
  fs.writeFileSync(out, JSON.stringify(res, null, 1));
  const r = res['1440x900'];
  console.log('id'.padEnd(20), 'screens', 'empty', 'maxRect', 'right', 'whole');
  for (const [id, m] of Object.entries(r)) console.log(id.padEnd(20), String(m.screens).padStart(7), (m.empty * 100).toFixed(0).padStart(5) + '%', (m.maxRect * 100).toFixed(0).padStart(6) + '%', (m.rightEmpty * 100).toFixed(0).padStart(5) + '%', (m.wholeEmpty * 100).toFixed(0).padStart(5) + '%', m.dark ? 'dark' : '');
})();
