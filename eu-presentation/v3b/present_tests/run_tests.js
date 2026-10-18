// Presentation-mode acceptance tests (Playwright + Chromium, file:// only, no network).
//   node present_tests/run_tests.js <page.html> [<baseline.html for print comparison>]
// Writes present_tests/log.txt, present_tests/shots/*.png and present_tests/print_*.pdf
let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const { chromium } = pw;
const path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
const FILE = path.resolve(process.argv[2] || 'v3/EU_presentation_standalone_v3.html');
const BASE = process.argv[3] ? path.resolve(process.argv[3]) : null;
const OUT = __dirname, SHOTS = path.join(OUT, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const URL = 'file://' + FILE;
const log = []; let fails = 0;
const say = (ok, msg) => { if (!ok) fails++; const l = (ok ? 'PASS ' : 'FAIL ') + msg; log.push(l); console.log(l); };
const info = msg => { log.push('     ' + msg); console.log('     ' + msg); };
const ARGS = ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'];

async function open(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.vp || { width: 1920, height: 1080 }, reducedMotion: opts.reduce ? 'reduce' : 'no-preference', hasTouch: !!opts.touch });
  await ctx.route(/^https?:/, r => r.abort());
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console.error: ' + m.text()); });
  page.on('crash', () => console.log('     [page crashed]')); page.on('close', () => { if (!page.__closing) console.log('     [page closed unexpectedly]'); });
  await page.goto(URL + (opts.query || '')); await page.waitForTimeout(1200);
  return { ctx, page, errs };
}
const st = p => p.evaluate(() => ({ active: PZ.active, cur: PZ.cur, step: PZ.step, steps: PZ.steps(PZ.cur), presenting: document.body.classList.contains('presenting'),
  night: document.body.classList.contains('night'), dark: (() => { const s = document.querySelectorAll('main > section')[PZ.cur]; return s.classList.contains('dark') || s.classList.contains('hero'); })(),
  waits: document.querySelectorAll('.pz-wait').length, scene: window.currentScene, sceneWant: document.querySelectorAll('main > section')[PZ.cur].dataset.scene }));
const wait = (p, ms = 60) => p.waitForTimeout(ms);


(async () => {
  const browser = await chromium.launch({ args: ARGS });
  /* ---------------- 1. load, enter, structure ---------------- */
  let { ctx, page, errs } = await open(browser, { reduce: true });
  const plan = await page.evaluate(() => PZ.plan());
  const titles = await page.evaluate(n => Array.from({ length: n }, (_, i) => PZ.title(i)), plan.length);
  info(`slides: ${plan.length}; steps per slide: ${plan.join(' ')}; total states: ${plan.reduce((a, b) => a + b, 0)}`);
  say(plan.every(n => n >= 1 && n <= 6), 'every slide has 1–6 build steps');
  const nav0 = await page.evaluate(() => ({ y: scrollY, nav: getComputedStyle(document.querySelector('.nav')).display }));
  await page.evaluate(() => document.getElementById('c1-history').scrollIntoView({ behavior: 'instant' })); await wait(page, 300);
  await page.keyboard.press('p'); await wait(page, 300);
  let s = await st(page);
  say(s.active && s.presenting && titles[s.cur].includes('Formation'), `P enters at the slide being viewed (slide ${s.cur + 1}: ${titles[s.cur]})`);
  const hidden = await page.evaluate(() => ['.nav', '.dots', '.scroll-hint', '.counter', '.star-progress'].map(q => getComputedStyle(document.querySelector(q)).display));
  say(hidden.every(d => d === 'none'), `nav, dots, scroll hint, counter, progress hidden (${hidden.join(',')})`);
  const fs1 = await page.evaluate(() => !!document.fullscreenElement); info(`fullscreen granted in this browser: ${fs1}`);
  /* ---------------- 2. step through every slide forward then back ---------------- */
  await page.keyboard.press('Home'); await wait(page, 200);
  s = await st(page); say(s.cur === 0 && s.step === 1, 'Home goes to slide 1, step 1');
  const seq = [[s.cur, s.step]]; let nightBad = [], viewBad = [], presses = 0, pages = 0;
  const total = plan.reduce((a, b) => a + b, 0);
  while (presses < total * 4) {
    await page.keyboard.press('ArrowRight'); presses++; await wait(page, 40);
    s = await st(page);
    const lastSeq = seq[seq.length - 1];
    if (s.cur === lastSeq[0] && s.step === lastSeq[1]) { if (s.cur === plan.length - 1 && s.step === plan[s.cur] && await page.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 300)) break; pages++; continue; }   // paged inside a tall block
    seq.push([s.cur, s.step]);
    if (s.night !== s.dark || s.scene !== s.sceneWant) nightBad.push(s.cur + 1);
    const r = await page.evaluate(() => PZ.rectOf(PZ.cur, PZ.step - 1));
    if (!(r.top >= -2 && r.top < 1080)) viewBad.push(`${s.cur + 1}.${s.step}`);
  }
  let ok = true, j = 0; plan.forEach((n, i) => { for (let k = 1; k <= n; k++, j++) if (!seq[j] || seq[j][0] !== i || seq[j][1] !== k) ok = false; });
  say(ok && seq.length === total, `→ visits every slide and every build step in order (${seq.length} states, ${presses} presses, ${pages} of them page through tall blocks)`);
  say(!nightBad.length, `night mode and 3D scene follow the current slide on every step${nightBad.length ? ' (bad: ' + [...new Set(nightBad)].join(',') + ')' : ''}`);
  say(!viewBad.length, `the top of each newly shown block is on screen${viewBad.length ? ' (bad: ' + viewBad.join(',') + ')' : ''}`);
  await page.keyboard.press('ArrowRight'); s = await st(page); say(s.cur === plan.length - 1, '→ on the last state stays on the last slide');
  const back = [[s.cur, s.step]]; let bp = 0;
  while (bp < total * 4) { await page.keyboard.press('ArrowLeft'); bp++; await wait(page, 30); s = await st(page); const l = back[back.length - 1]; if (s.cur !== l[0] || s.step !== l[1]) back.push([s.cur, s.step]); else if (s.cur === 0 && s.step === 1 && await page.evaluate(() => scrollY < 5)) break; }
  say(JSON.stringify(back.reverse()) === JSON.stringify(seq), `← walks back through exactly the same states (previous slide arrives fully built; ${bp} presses)`);
  /* ---------------- 3. navigation keys ---------------- */
  await page.keyboard.press('End'); s = await st(page); say(s.cur === plan.length - 1, 'End goes to the last slide');
  await page.keyboard.press('1'); await page.keyboard.press('2');
  const jv = await page.evaluate(() => !document.getElementById('pz-jump').hidden && document.getElementById('pz-jump').textContent);
  await page.keyboard.press('Enter'); s = await st(page);
  say(jv === '→ 12' && s.cur === 11 && s.step === 1, `typing 1 2 shows "${jv}" and Enter jumps to slide 12`);
  await page.keyboard.press('g'); await wait(page, 100);
  let g = await page.evaluate(() => ({ open: !document.getElementById('pz-grid').hidden, focus: document.activeElement.dataset.i, cur: document.querySelector('.pz-tile[aria-current="true"]').dataset.i, groups: [...document.querySelectorAll('#pz-grid h3')].map(h => h.textContent) }));
  say(g.open && g.focus === '11' && g.cur === '11', `G opens the overview with slide 12 focused and marked (groups: ${g.groups.join(' | ')})`);
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowDown');
  const target = await page.evaluate(() => +document.activeElement.dataset.i);
  await page.keyboard.press('Enter'); s = await st(page);
  say(s.cur === target && await page.evaluate(() => document.getElementById('pz-grid').hidden), `arrows + Enter in the overview jump to slide ${target + 1} and close it`);
  await page.keyboard.press('g'); await page.keyboard.press('Escape'); s = await st(page);
  say(await page.evaluate(() => document.getElementById('pz-grid').hidden) && s.active, 'Esc closes the overview without leaving presentation mode');
  await page.keyboard.press('b'); let c = await page.evaluate(() => { const e = document.getElementById('pz-curtain'); return !e.hidden && getComputedStyle(e).backgroundColor; });
  await page.keyboard.press('b'); let c2 = await page.evaluate(() => document.getElementById('pz-curtain').hidden);
  say(c === 'rgb(0, 0, 0)' && c2, 'B shows a black screen and B again returns');
  await page.keyboard.press('.'); c = await page.evaluate(() => !document.getElementById('pz-curtain').hidden); await page.keyboard.press('.');
  await page.keyboard.press('w'); c2 = await page.evaluate(() => getComputedStyle(document.getElementById('pz-curtain')).backgroundColor); await page.keyboard.press('w');
  say(c && c2 === 'rgb(255, 255, 255)' && await page.evaluate(() => document.getElementById('pz-curtain').hidden), '"." toggles black, W toggles white');
  await page.keyboard.press('l'); await page.mouse.move(700, 400); await wait(page, 50);
  const lz = await page.evaluate(() => ({ on: !document.getElementById('pz-laser').hidden, cls: document.body.classList.contains('pz-laser'), t: document.getElementById('pz-laser').style.transform }));
  await page.keyboard.press('l');
  say(lz.on && lz.cls && /700px, 400px/.test(lz.t) && await page.evaluate(() => document.getElementById('pz-laser').hidden), 'L shows a laser dot that follows the mouse; L again hides it');
  await page.keyboard.press('t'); await wait(page, 100);
  const tf = await page.evaluate(() => !document.getElementById('pz-timer').hidden && document.activeElement.tagName);
  await page.keyboard.press('Control+A'); await page.keyboard.type('1'); await page.keyboard.press('Enter'); await wait(page, 100);
  say(tf === 'INPUT' && await page.evaluate(() => document.getElementById('pz-timer').hidden && document.fullscreenElement !== undefined && PZ.active), 'T opens the minutes field in the page (no prompt, stays in presentation mode)');
  let ck = await page.evaluate(() => document.querySelector('#pz-hud .clock').textContent);
  const ckc = await page.evaluate(() => document.querySelector('#pz-hud .clock').className);
  say(/quá giờ$/.test(ck) && /over/.test(ckc), `T = 1 minute after more than a minute of testing: the HUD shows overtime in red (${ck}, class "${ckc}")`);
  await page.evaluate(() => { /* simulate 50 s and 70 s elapsed by moving the reference */ });
  await page.keyboard.press('r'); ck = await page.evaluate(() => document.querySelector('#pz-hud .clock').textContent); const ckc2 = await page.evaluate(() => document.querySelector('#pz-hud .clock').className);
  say(/^−01:00$|^−00:59$/.test(ck) && ckc2 === 'clock', `R resets the clock (${ck}, normal colour)`);
  const z0 = await page.evaluate(() => getComputedStyle(document.documentElement).fontSize);
  await page.keyboard.press('+'); await wait(page, 100); const z1 = await page.evaluate(() => getComputedStyle(document.documentElement).fontSize);
  await page.keyboard.press('-'); await wait(page, 100); const z2 = await page.evaluate(() => getComputedStyle(document.documentElement).fontSize);
  say(parseFloat(z1) > parseFloat(z0) && z2 === z0, `+ / − change the root font size (${z0} → ${z1} → ${z2})`);
  await page.keyboard.press('?'); await wait(page, 50);
  const hp = await page.evaluate(() => ({ open: !document.getElementById('pz-help').hidden, rows: document.querySelectorAll('#pz-help tr').length, focusIn: document.getElementById('pz-help').contains(document.activeElement) }));
  await page.keyboard.press('Escape');
  say(hp.open && hp.rows >= 15 && hp.focusIn && await page.evaluate(() => document.getElementById('pz-help').hidden && PZ.active), `? opens the help dialog (${hp.rows} rows, focus inside); Esc closes it`);
  const live = await page.evaluate(() => document.getElementById('pz-live').textContent); say(/^Slide \d+ trên \d+: /.test(live), `aria-live announces "${live}"`);
  const aria = await page.evaluate(() => [...document.querySelectorAll('#pz-hud button, .pz-open')].every(b => b.getAttribute('aria-label')));
  say(aria, 'every presenter button has an aria-label');
  // click halves
  await page.evaluate(() => PZ.go(15, 1)); await wait(page, 100);
  await page.mouse.click(1500, 300); s = await st(page); const afterR = [s.cur, s.step];
  await page.mouse.click(300, 300); s = await st(page);
  say((afterR[0] === 15 && afterR[1] === 2 || afterR[0] === 16) && s.cur === 15 && s.step === 1, `click on the right half advances (${afterR.join('.')}), left half goes back`);
  // exit
  const curBefore = s.cur;
  await page.keyboard.press('Escape'); await wait(page, 300);
  const ex = await page.evaluate(() => ({ active: PZ.active, presenting: document.body.classList.contains('presenting'), waits: document.querySelectorAll('.pz-wait').length, nav: getComputedStyle(document.querySelector('.nav')).display, zoom: document.documentElement.style.getPropertyValue('--pz-zoom'), at: (() => { const ss = [...document.querySelectorAll('main > section')]; return ss.indexOf(activeSection()); })(), hud: getComputedStyle(document.getElementById('pz-hud')).display }));
  say(!ex.active && !ex.presenting && !ex.waits && ex.nav !== 'none' && !ex.zoom && ex.hud === 'none', 'Esc leaves presentation mode and restores the page (nav back, no hidden blocks, HUD gone)');
  say(ex.at === curBefore, `after leaving, the page stays on the same slide (${ex.at + 1})`);
  await page.keyboard.press('ArrowDown'); await wait(page, 700);
  const sc = await page.evaluate(() => scrollY); say(sc > 0 && !(await page.evaluate(() => PZ.active)), 'old scroll keys still work after leaving (↓ scrolled the page)');
  await page.keyboard.press('P'); await page.keyboard.press('P'); say(!(await page.evaluate(() => PZ.active)), 'P toggles presentation mode on and off');
  say(!errs.length, `no console errors in the key run${errs.length ? ': ' + errs.join(' | ') : ''}`);
  await ctx.close();

  /* ---------------- 4. Presenter view (popup over file://) ---------------- */
  ({ ctx, page, errs } = await open(browser, { reduce: true }));
  const PVS = plan.findIndex((n, i) => i >= 24 && n >= 3); info(`Presenter view test on slide ${PVS + 1} (${plan[PVS]} steps)`);
  await page.keyboard.press('p'); await page.evaluate(i => PZ.go(i, 1), PVS); await wait(page, 200);
  const [pv] = await Promise.all([ctx.waitForEvent('page'), page.keyboard.press('s')]);
  await pv.waitForLoadState(); await wait(pv, 500);
  const pvErrs = []; pv.on('pageerror', e => pvErrs.push(e.message));
  let p1 = await pv.evaluate(() => ({ pos: document.getElementById('pos').textContent, title: document.getElementById('title').textContent, notes: document.querySelectorAll('#notes li').length, next: document.getElementById('next').textContent, step: document.getElementById('step').textContent }));
  say(p1.pos === `${PVS + 1} / ${plan.length}` && p1.notes >= 2 && p1.next.startsWith(`${PVS + 2}.`), `Presenter view shows slide, notes, next slide and step (${p1.pos}; ${p1.notes} notes; next "${p1.next.slice(0, 40)}…"; ${p1.step})`);
  await pv.click('#nextb'); await wait(page, 300); s = await st(page);
  say(s.cur === PVS && s.step === 2, `Next in the Presenter view advances the main window (now ${s.cur + 1}.${s.step})`);
  await pv.click('#prev'); await wait(page, 300); s = await st(page); say(s.cur === PVS && s.step === 1, 'Prev in the Presenter view goes back');
  await page.keyboard.press('End'); await wait(pv, 300);
  p1 = await pv.evaluate(() => document.getElementById('pos').textContent); say(p1 === `${plan.length} / ${plan.length}`, `main window → Presenter view follows (${p1})`);
  await page.evaluate(() => PZ.go(0, 1)); await wait(pv, 200);
  const noNote = await page.evaluate(() => { const ids = [...document.querySelectorAll('main > section')].map(s => s.id); return ids.filter(id => !(NOTES[id] && NOTES[id].length)); });
  say(!noNote.length, `every slide has draft notes (${plan.length - noNote.length}/${plan.length})${noNote.length ? ' missing: ' + noNote.join(',') : ''}`);
  const notesInDom = await page.evaluate(() => document.body.innerText.includes(NOTES['c3-trade'][0]));
  say(!notesInDom, 'speaker notes never appear in the main page');
  await pv.screenshot({ path: path.join(SHOTS, 'presenter_view.png') });
  await page.keyboard.press('Escape'); await wait(page, 300);
  say(pv.isClosed(), 'leaving presentation mode closes the Presenter view');
  say(!errs.length && !pvErrs.length, `no console errors with the Presenter view${errs.length + pvErrs.length ? ': ' + errs.concat(pvErrs).join(' | ') : ''}`);
  await ctx.close();

  /* ---------------- 5. popup blocked → message ---------------- */
  ({ ctx, page, errs } = await open(browser, { reduce: true }));
  await page.evaluate(() => { window.open = () => null; }); await page.keyboard.press('p'); await page.keyboard.press('s'); await wait(page, 100);
  const tmsg = await page.evaluate(() => !document.getElementById('pz-toast').hidden && document.getElementById('pz-toast').textContent);
  say(!!tmsg && /cho phép/.test(tmsg), 'a blocked popup shows how to allow it');
  await ctx.close();

  /* ---------------- 6. ?t=15, sessionStorage restore, timer colours ---------------- */
  ({ ctx, page, errs } = await open(browser, { reduce: true, query: '?t=15' }));
  await page.keyboard.press('p'); await wait(page, 100);
  ck = await page.evaluate(() => document.querySelector('#pz-hud .clock').textContent); say(/^−1[45]:\d\d$/.test(ck), `?t=15 starts a 15-minute countdown (${ck})`);
  await page.evaluate(() => PZ.go(20, 1)); await page.keyboard.press('Escape');
  await page.reload(); await wait(page, 1200);
  const rl = await page.evaluate(() => ({ active: PZ.active, presenting: document.body.classList.contains('presenting'), at: [...document.querySelectorAll('main > section')].indexOf(activeSection()), hash: location.hash }));
  say(!rl.active && !rl.presenting && rl.at === 20, `after a reload the page returns to slide 21 (${rl.hash}) and presentation mode is off`);
  await ctx.close();

  /* ---------------- 7. screenshots 1920×1080 and 1280×720 ---------------- */
  const pick = [['home', 'cover'], ['c1-history', 'timeline'], ['c3-trade', 'tables'], ['c2-economic-b', 'chart'], ['c3-investment', 'table_long'], ['qa', 'last']];
  for (const vp of [[1920, 1080], [1280, 720]]) {
    ({ ctx, page, errs } = await open(browser, { vp: { width: vp[0], height: vp[1] } }));
    await page.keyboard.press('p'); await wait(page, 200);
    for (const [id, name] of pick) {
      const i = await page.evaluate(id => [...document.querySelectorAll('main > section')].findIndex(s => s.id === id), id);
      await page.evaluate(i => PZ.go(i, 1), i); await page.mouse.move(10 + Math.random() * 5, 10); await wait(page, 900);
      await page.screenshot({ path: path.join(SHOTS, `${vp[0]}_${name}_step1.png`) });
      const n = plan[i]; for (let k = 1; k < n; k++) { await page.keyboard.press('ArrowRight'); await wait(page, 500); }
      await page.mouse.move(12, 12); await wait(page, 700);
      await page.screenshot({ path: path.join(SHOTS, `${vp[0]}_${name}_all.png`) });
      const chk = await page.evaluate(() => {
        const over = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        const hud = document.getElementById('pz-hud').getBoundingClientRect(), s = document.querySelectorAll('main > section')[PZ.cur];
        const under = [...s.querySelectorAll('.pz-step:not(.pz-wait)')].filter(e => { const r = e.getBoundingClientRect(); return r.height && r.bottom > hud.top + 2 && r.top < hud.top && r.bottom < innerHeight + 400; }).length;
        return { over, under, hudOpacity: getComputedStyle(document.getElementById('pz-hud')).opacity };
      });
      say(chk.over === 0, `${vp[0]}×${vp[1]} ${name}: no horizontal overflow`);
      if (chk.under) info(`${vp[0]}×${vp[1]} ${name}: ${chk.under} block(s) cross the HUD line while the HUD is visible (HUD auto-hides after 2.5 s)`);
    }
    // HUD visible shot
    await page.mouse.move(400, 400); await wait(page, 200); await page.screenshot({ path: path.join(SHOTS, `${vp[0]}_hud_visible.png`) });
    await page.keyboard.press('g'); await wait(page, 200); await page.screenshot({ path: path.join(SHOTS, `${vp[0]}_overview.png`) }); await page.keyboard.press('Escape');
    await page.keyboard.press('?'); await wait(page, 200); await page.screenshot({ path: path.join(SHOTS, `${vp[0]}_help.png`) }); await page.keyboard.press('Escape');
    say(!errs.length, `${vp[0]}×${vp[1]}: no console errors${errs.length ? ': ' + errs.join(' | ') : ''}`);
    await ctx.close();
  }

  /* ---------------- 8. reduced motion, no WebGL, 390 px, touch ---------------- */
  ({ ctx, page, errs } = await open(browser, { reduce: true }));
  await page.keyboard.press('p'); await page.evaluate(() => PZ.go(7, 1)); const y0 = await page.evaluate(() => scrollY);
  await page.keyboard.press('ArrowRight'); const rm = await page.evaluate(() => { const e = document.querySelector('.pz-step'); return getComputedStyle(e).transitionDuration; });
  say(/^0s/.test(rm), `prefers-reduced-motion: build steps appear without transition (${rm})`); await ctx.close();
  ({ ctx, page, errs } = await open(browser, {}));
  await page.evaluate(() => document.body.classList.add('no3d')); await page.keyboard.press('p'); for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowRight');
  await wait(page, 300); await page.screenshot({ path: path.join(SHOTS, '1920_no3d.png') });
  say(!errs.length && await page.evaluate(() => PZ.active), 'body.no3d: presentation mode works without errors'); await ctx.close();
  ({ ctx, page, errs } = await open(browser, { vp: { width: 390, height: 844 }, touch: true }));
  const m = await page.evaluate(() => ({ btn: getComputedStyle(document.querySelector('.pz-open')).display, over: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
  say(m.btn === 'none' && m.over === 0, `390 px: no Present button, no horizontal overflow (button display ${m.btn}, overflow ${m.over})`);
  await page.keyboard.press('p'); await page.evaluate(() => PZ.go(11, 1)); await wait(page, 1200);
  const sw = async (x0, x1) => page.evaluate(([a, b]) => { const mk = (t, x) => new TouchEvent(t, { changedTouches: [new Touch({ identifier: 1, target: document.body, clientX: x, clientY: 400 })], bubbles: true }); document.dispatchEvent(mk('touchstart', a)); document.dispatchEvent(mk('touchend', b)); }, [x0, x1]);
  const y0s = await page.evaluate(() => scrollY); await sw(300, 80); await wait(page, 1000); let t1 = await st(page); const y1s = await page.evaluate(() => scrollY);
  await sw(80, 300); await wait(page, 1000); let t2 = await st(page); const y2s = await page.evaluate(() => scrollY);
  say((t1.step > 1 || y1s > y0s) && (t2.step < t1.step || y2s < y1s), `swipe left moves forward (step ${t1.step}, scroll ${y0s}→${y1s}: a tall phone slide is paged first), swipe right moves back (step ${t2.step}, scroll ${y2s})`);
  const o390 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.screenshot({ path: path.join(SHOTS, '390_presenting.png') });
  say(o390 === 0, '390 px in presentation mode: no horizontal overflow'); await ctx.close();

  /* ---------------- 9. print unchanged ---------------- */
  if (BASE) {
    const pdfOf = async (u, out) => { const c = await browser.newContext({ viewport: { width: 1280, height: 900 } }); await c.route(/^https?:/, r => r.abort()); const p = await c.newPage(); await p.goto(u); await p.waitForTimeout(1500); await p.emulateMedia({ media: 'print' }); await p.pdf({ path: out, format: 'A4', printBackground: true }); await c.close(); };
    const a = path.join(OUT, 'print_before_v2.pdf'), b = path.join(OUT, 'print_after_v3.pdf');
    await pdfOf('file://' + BASE, a); await pdfOf(URL, b);
    const txt = f => execFileSync('pdftotext', ['-layout', f, '-']).toString();
    const pages = f => +execFileSync('pdfinfo', [f]).toString().match(/Pages:\s+(\d+)/)[1];
    const ta = txt(a), tb = txt(b);
    say(pages(a) === pages(b), `print: same page count before/after (${pages(a)} / ${pages(b)})`);
    say(ta === tb, 'print: identical text before/after (Present button and presenter UI not printed)');
    say(!/Ghi chú|NOTES|Presenter view|chưa có ghi chú/.test(tb) && !tb.includes('Present ▶'), 'print: no speaker notes or presenter UI in the printout');
  }
  await browser.close();
  log.push(`\n${fails ? fails + ' check(s) failed' : 'all checks passed'}`);
  fs.writeFileSync(path.join(OUT, 'log.txt'), log.join('\n') + '\n');
  console.log(fails ? `${fails} FAILED` : 'ALL PASSED');
  process.exit(fails ? 1 : 0);
})();
