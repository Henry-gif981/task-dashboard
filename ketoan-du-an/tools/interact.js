// node tools/interact.js <file> — bấm thử mọi điều khiển, in kết quả kiểm tra
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const file = process.argv[2] || 'index.html';
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 768 } });
  const net = []; await ctx.route(/^https?:/, r => { net.push(r.request().url()); r.abort(); });
  const p = await ctx.newPage(); const logs = [];
  p.on('console', m => { if (['error', 'warning'].includes(m.type())) logs.push(m.text().slice(0, 200)); });
  p.on('pageerror', e => logs.push('pageerror: ' + e.message));
  await p.goto('file://' + path.resolve(file) + '?nointro=1&no3d=1'); await p.waitForTimeout(900);
  const R = {}; const ok = (k, v) => { R[k] = v; };
  // tab Hình 1.1
  const tabsN = await p.$$eval('.cycle-steps [role=tab]', x => x.length);
  for (let i = 0; i < tabsN; i++) { await p.locator('.cycle-steps [role=tab]').nth(i).scrollIntoViewIfNeeded(); await p.locator('.cycle-steps [role=tab]').nth(i).click(); }
  ok('h11_tabs', await p.$$eval('.cycle-steps [role=tab]', x => x.map(t => t.getAttribute('aria-selected')).join(',')));
  // nhánh A/B/C
  const br = p.locator('.branch .br-head'); const nb = await br.count();
  for (let i = 0; i < nb; i++) { await br.nth(i).scrollIntoViewIfNeeded(); await br.nth(i).click(); }
  ok('h12_focus_class', await p.$eval('.fig.tree', t => t.classList.contains('focus') + ' sel=' + document.querySelectorAll('.branch.sel').length));
  ok('h12_open', await p.$$eval('.branch .br-head', x => x.map(h => h.getAttribute('aria-expanded')).join(',')));
  // stepper
  const nx = p.locator('[data-stepper] [data-a=next]'); await nx.scrollIntoViewIfNeeded();
  for (let i = 0; i < 6; i++) if (await nx.isEnabled()) await nx.click();
  ok('h13_pending_after_next', await p.$$eval('.flow-row.pending', x => x.length));
  await p.locator('[data-stepper] [data-a=prev]').click(); ok('h13_after_prev', await p.$$eval('.flow-row.pending', x => x.length));
  await p.locator('[data-stepper] [data-a=all]').click(); ok('h13_all', await p.$$eval('.flow-row.pending', x => x.length));
  // phím Space: lùi về bước 1 rồi nhấn Space 2 lần
  for (let i = 0; i < 5; i++) await p.locator('[data-stepper] [data-a=prev]').click().catch(() => {});
  await p.evaluate(() => { document.activeElement.blur(); document.getElementById('hinh-1-3').scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(300);
  await p.keyboard.press('Space'); await p.keyboard.press('Space');
  ok('h13_space_pending_after_2', await p.$$eval('.flow-row.pending', x => x.length));
  // ghim hàng
  const pin = p.locator('#bang-1-4 .pin').first(); await pin.scrollIntoViewIfNeeded(); await pin.click();
  ok('pin', await p.$$eval('#bang-1-4 tr.pinned', x => x.length) + ' / pressed=' + await pin.getAttribute('aria-pressed')); await pin.click();
  // thanh ngăn phân đôi
  const rg = p.locator('.split-range'); await rg.scrollIntoViewIfNeeded(); await p.waitForTimeout(1600);
  await rg.focus(); await p.keyboard.press('Home'); const x1 = await p.$eval('.split', e => e.style.getPropertyValue('--x'));
  await p.keyboard.press('End'); const x2 = await p.$eval('.split', e => e.style.getPropertyValue('--x'));
  ok('split_slider', x1 + ' -> ' + x2);
  // T-accounts
  const tt = p.locator('.t-tabs [role=tab]'); const nt = await tt.count(); const tres = [];
  for (let i = 0; i < nt; i++) { await tt.nth(i).scrollIntoViewIfNeeded(); await tt.nth(i).click(); tres.push(await p.$$eval('#t-stage svg[data-viz=V11] text', x => x.filter(t => t.textContent === 'NỢ').length)); }
  ok('t_accounts_per_tab', tres.join(','));
  // bảng so sánh
  const figs = await p.$$('figure.cmp'); const cm = [];
  for (const f of figs) {
    const id = await f.getAttribute('id'); await f.scrollIntoViewIfNeeded();
    const btns = await f.$$('.cmp-ctl button'); const r = [];
    for (const bt of btns) { await bt.click(); r.push(await f.evaluate(el => { const vis = [...el.querySelectorAll('thead th')].filter(t => getComputedStyle(t).display !== 'none').length; return vis; })); }
    await btns[0].click();
    const sel = await f.$('select'); const nopt = await sel.$$eval('option', o => o.length);
    await sel.selectOption({ index: 1 }); const dim = await f.$$eval('tbody tr.dim', x => x.length); await sel.selectOption({ index: 0 });
    cm.push(`${id}: cols ${r.join('/')} · rows ${nopt - 1} · dim ${dim}`);
  }
  ok('cmp', cm);
  // lightbox
  const th = p.locator('.thumb'); const nth = await th.count(); let lbok = 0;
  for (let i = 0; i < nth; i++) {
    await th.nth(i).scrollIntoViewIfNeeded(); await th.nth(i).click(); await p.waitForTimeout(120);
    const st = await p.evaluate(() => { const lb = document.querySelector('.lightbox'), im = lb.querySelector('img'); return { open: lb.classList.contains('open'), w: im.naturalWidth, cap: lb.querySelector('.lb-cap').textContent.slice(0, 50) }; });
    if (i === 0) { // phóng bằng lăn chuột, nút, kéo thả
      const z0 = await p.$eval('.lb-zoom', e => e.textContent);
      const box = await p.$eval('.lb-stage', e => { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
      await p.mouse.move(box[0], box[1]); await p.mouse.wheel(0, -300); await p.waitForTimeout(100);
      const z1 = await p.$eval('.lb-zoom', e => e.textContent);
      const t0 = await p.$eval('.lb-stage img', e => e.style.transform);
      await p.mouse.down(); await p.mouse.move(box[0] + 80, box[1] + 40, { steps: 5 }); await p.mouse.up();
      const t1 = await p.$eval('.lb-stage img', e => e.style.transform);
      await p.click('.lb-btns [data-z=fit]'); const z2 = await p.$eval('.lb-zoom', e => e.textContent);
      ok('lightbox_zoom', `fit ${z0} → wheel ${z1} → drag ${t0 !== t1 ? 'moved' : 'NOT moved'} → fit ${z2}`);
    }
    await p.keyboard.press('Escape'); await p.waitForTimeout(80);
    const closed = await p.evaluate(() => !document.querySelector('.lightbox').classList.contains('open'));
    if (st.open && st.w > 0 && closed) lbok++; else console.log('LB fail', i, st, closed);
  }
  ok('lightbox', `${lbok}/${nth}`);
  // phím
  await p.waitForTimeout(800); await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.activeElement.blur(); scrollTo(0, 0); }); await p.waitForTimeout(400);
  const ks = [Math.round(await p.evaluate(() => scrollY))];
  ok('slideTops', (await p.$$eval('main > .slide', s => s.slice(0, 4).map(x => Math.round(x.getBoundingClientRect().top + scrollY)))).join(','));
  for (const k of ['ArrowRight', 'ArrowRight', 'PageDown', 'ArrowLeft', 'PageUp']) { await p.keyboard.press(k); await p.waitForTimeout(900); ks.push(Math.round(await p.evaluate(() => scrollY))); }
  ok('keys_scrollY', ks.join(','));
  ok('progress', await p.$eval('#progress, .progress', e => e.getAttribute('style') || getComputedStyle(e).transform).catch(() => 'n/a'));
  // trình chiếu + Esc
  await p.click('#btn-present'); await p.waitForTimeout(600); const pr1 = await p.evaluate(() => document.body.classList.contains('present'));
  const sideHidden = await p.evaluate(() => { const s = document.querySelector('.side'); return getComputedStyle(s).display === 'none' || s.getBoundingClientRect().right <= 0; });
  await p.keyboard.press('Escape'); const pr2 = await p.evaluate(() => document.body.classList.contains('present'));
  ok('present', `on=${pr1} sideHidden=${sideHidden} afterEsc=${pr2}`);
  // nền tối
  ok('theme_default', await p.evaluate(() => document.documentElement.dataset.theme + ' bg=' + getComputedStyle(document.body).backgroundColor));
  // in: details mở
  await p.evaluate(() => dispatchEvent(new Event('beforeprint'))); ok('print_details_closed', await p.$$eval('details:not([open])', x => x.length));
  await p.evaluate(() => dispatchEvent(new Event('afterprint')));
  // ô nhập liệu / tiêu điểm bàn phím
  ok('focusable_marks', await p.$$eval('.mark[tabindex]', x => x.length));
  ok('img_no_alt', await p.$$eval('img', x => x.filter(i => !i.hasAttribute('alt')).length));
  ok('th_no_scope', await p.$$eval('table th', x => x.filter(t => !t.getAttribute('scope')).length));
  ok('hOverflow', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  // Xem bảng số liệu (mọi biểu đồ)
  const vb = p.locator('.vz-btn'); const nvb = await vb.count(); let vbok = 0;
  for (let i = 0; i < nvb; i++) { await vb.nth(i).scrollIntoViewIfNeeded(); await vb.nth(i).click(); const o = await vb.nth(i).evaluate(b => !b.nextElementSibling.hidden && b.nextElementSibling.querySelectorAll('tbody tr').length > 0); await vb.nth(i).click(); const cl = await vb.nth(i).evaluate(b => b.nextElementSibling.hidden); if (o && cl) vbok++; }
  ok('data_tables', `${vbok}/${nvb}`);
  // tooltip bằng bàn phím trên điểm dữ liệu + phím mũi tên
  const mk = p.locator('.mark').first(); await mk.scrollIntoViewIfNeeded(); await p.waitForTimeout(400); await mk.focus(); await p.waitForTimeout(100); const t1 = await p.$eval('.tip', t => t.classList.contains('show') + ' ' + t.textContent.slice(0, 40));
  await p.keyboard.press('ArrowRight'); const t2 = await p.$eval('.tip', t => t.textContent.slice(0, 40)); await p.keyboard.press('Escape');
  ok('tooltip_keyboard', t1 + ' → ' + t2);
  // ma trận 5 tiêu chí
  // Bảng 1.4: hàng danh sách → khung so sánh
  const cr = p.locator('.crit-list button'); const ncr = await cr.count(); const crs = [];
  for (let i = 0; i < ncr; i++) { await cr.nth(i).scrollIntoViewIfNeeded(); await cr.nth(i).hover(); crs.push((await p.$eval('.cp-name', e => e.textContent)) === (await cr.nth(i).textContent()) ? 1 : 0); }
  ok('criteria_rows', `${crs.reduce((a, b) => a + b, 0)}/${ncr}`);
  // Hình 1.1 nút ‹ › và Hình 1.3 thanh bước
  await p.locator('.step-ctl [data-d="1"]').first().scrollIntoViewIfNeeded(); await p.click('.step-ctl [data-d="-1"]'); await p.click('.step-ctl [data-d="-1"]'); const atStart = await p.$eval('.step-ctl [data-d="-1"]', b => b.disabled); await p.click('.step-ctl [data-d="1"]');
  ok('cycle_prev_disabled_at_start', atStart);
  ok('cycle_next', await p.$$eval('.cycle-steps [role=tab]', x => x.map(t => t.getAttribute('aria-selected')).join(',')));
  await p.locator('.flowbar button').nth(3).scrollIntoViewIfNeeded(); await p.locator('.flowbar button').nth(3).click();
  ok('flowbar', await p.$$eval('.flow-row.pending', x => x.length) + ' pending, current=' + await p.$eval('.flowbar [aria-current=true]', b => b.textContent));
  // nút trên hero
  await p.evaluate(() => scrollTo(0, 0)); await p.click('.btn-w'); await p.waitForTimeout(800); ok('hero_enter', await p.evaluate(() => Math.round(document.getElementById('muc-luc').getBoundingClientRect().top)));
  // A−/A+ và Chế độ đọc (ghi nhớ)
  await p.evaluate(() => scrollTo(0, 0)); const fz0 = await p.evaluate(() => getComputedStyle(document.documentElement).fontSize);
  await p.click('#fz-up'); await p.click('#fz-up'); const fz1 = await p.evaluate(() => getComputedStyle(document.documentElement).fontSize);
  await p.click('#fz-dn'); await p.click('#fz-dn');
  await p.click('#btn-reading'); await p.waitForTimeout(300);
  const rd = await p.evaluate(() => ({ cls: document.documentElement.classList.contains('reading'), fs: getComputedStyle(document.documentElement).fontSize, stored: localStorage.getItem('kt-reading'), hero: (window.__hero3d || {}).mode }));
  await p.click('#btn-reading');
  ok('font_scale', `${fz0} → A+×2 ${fz1}`); ok('reading_mode', JSON.stringify(rd));
  // màn mở đầu: nút Bỏ qua
  const ctx2 = await b.newContext(); await ctx2.route(/^https?:/, r => r.abort()); const p2 = await ctx2.newPage(); await p2.goto('file://' + path.resolve(file) + '?no3d=1'); await p2.waitForTimeout(300);
  const playing = await p2.evaluate(() => document.getElementById('intro').classList.contains('play'));
  await p2.click('.intro-skip'); await p2.waitForTimeout(700);
  ok('intro', `play=${playing} afterSkip.hidden=${await p2.evaluate(() => document.getElementById('intro').hidden)} heroReady=${await p2.evaluate(() => document.querySelector('.hero').classList.contains('ready'))}`);
  await p2.reload(); await p2.waitForTimeout(400); ok('intro_second_visit_hidden', await p2.evaluate(() => document.getElementById('intro').hidden));
  await p2.close(); await ctx2.close();
  ok('net', net); ok('console', logs);
  console.log(JSON.stringify(R, null, 1));
  await b.close();
})();
