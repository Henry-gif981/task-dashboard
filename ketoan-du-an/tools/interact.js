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
  await p.goto('file://' + path.resolve(file)); await p.waitForTimeout(700);
  const R = {}; const ok = (k, v) => { R[k] = v; };
  // tab Hình 1.1
  const tabsN = await p.$$eval('.cycle-steps [role=tab]', x => x.length);
  for (let i = 0; i < tabsN; i++) { await p.locator('.cycle-steps [role=tab]').nth(i).scrollIntoViewIfNeeded(); await p.locator('.cycle-steps [role=tab]').nth(i).click(); }
  ok('h11_tabs', await p.$$eval('.cycle-steps [role=tab]', x => x.map(t => t.getAttribute('aria-selected')).join(',')));
  // nhánh A/B/C
  const br = p.locator('.branch .br-head'); const nb = await br.count();
  for (let i = 0; i < nb; i++) { await br.nth(i).scrollIntoViewIfNeeded(); await br.nth(i).click(); }
  ok('h12_open', await p.$$eval('.branch .br-head', x => x.map(h => h.getAttribute('aria-expanded')).join(',')));
  // stepper
  const nx = p.locator('[data-stepper] [data-a=next]'); await nx.scrollIntoViewIfNeeded();
  for (let i = 0; i < 6; i++) if (await nx.isEnabled()) await nx.click();
  ok('h13_pending_after_next', await p.$$eval('.flow-row.pending', x => x.length));
  await p.locator('[data-stepper] [data-a=prev]').click(); ok('h13_after_prev', await p.$$eval('.flow-row.pending', x => x.length));
  await p.locator('[data-stepper] [data-a=all]').click(); ok('h13_all', await p.$$eval('.flow-row.pending', x => x.length));
  // T-accounts
  const tt = p.locator('.t-tabs [role=tab]'); const nt = await tt.count(); const tres = [];
  for (let i = 0; i < nt; i++) { await tt.nth(i).scrollIntoViewIfNeeded(); await tt.nth(i).click(); tres.push(await p.$$eval('#t-stage .tacc', x => x.length)); }
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
  await p.click('#btn-present'); const pr1 = await p.evaluate(() => document.body.classList.contains('present'));
  const sideHidden = await p.evaluate(() => { const s = document.querySelector('.side'); return getComputedStyle(s).display === 'none' || s.getBoundingClientRect().right <= 0; });
  await p.keyboard.press('Escape'); const pr2 = await p.evaluate(() => document.body.classList.contains('present'));
  ok('present', `on=${pr1} sideHidden=${sideHidden} afterEsc=${pr2}`);
  // nền tối
  await p.click('#btn-theme'); ok('theme', await p.evaluate(() => document.documentElement.dataset.theme + ' bg=' + getComputedStyle(document.body).backgroundColor));
  await p.click('#btn-theme');
  // in: details mở
  await p.evaluate(() => dispatchEvent(new Event('beforeprint'))); ok('print_details_closed', await p.$$eval('details:not([open])', x => x.length));
  await p.evaluate(() => dispatchEvent(new Event('afterprint')));
  // ô nhập liệu / tiêu điểm bàn phím
  ok('focusable_marks', await p.$$eval('.mark[tabindex]', x => x.length));
  ok('img_no_alt', await p.$$eval('img', x => x.filter(i => !i.hasAttribute('alt')).length));
  ok('th_no_scope', await p.$$eval('table th', x => x.filter(t => !t.getAttribute('scope')).length));
  ok('hOverflow', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  ok('net', net); ok('console', logs);
  console.log(JSON.stringify(R, null, 1));
  await b.close();
})();
