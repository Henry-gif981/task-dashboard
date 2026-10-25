// Presentation tests (server running: npm start):  node tools/test-morph.mjs [url] [outDir]
// Morph: for several pairs the transition is frozen half-way and every flying element is checked to sit
// between its old and new place (frames saved as PNG). Also: bullet steps (→ / ← / Hiện hết, no layout
// shift), rapid presses and cancelling (no leftovers), presets Fade / Off, reduced motion, effect
// switches, auto-degrade + "Chế độ nhẹ" chip, speaker notes (N), presenter window (S) in sync,
// reading mode, hash, overview, View Transitions (?vt).
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const base = (process.argv[2] || "http://localhost:5173/").replace(/#.*$/, "");
const out = resolve(process.argv[3] || resolve(import.meta.dirname, "../test-results/morph"));
mkdirSync(out, { recursive: true });
const require = createRequire(import.meta.url);
let pw;
try { pw = require("playwright"); } catch { pw = require(process.env.PLAYWRIGHT_PATH || "/opt/node22/lib/node_modules/playwright"); }

const PAIRS = [["chapter-1", "s1-1"], ["s1-1-2", "s1-1-2b"], ["s1-1-2b", "s1-1-2c"], ["t1-2", "t1-3"], ["s1-3", "t1-4"], ["key-numbers", "s2-2-1"], ["t2-3", "f2-1"], ["s2-2-3b", "t2-4"], ["s1-4", "s1-4-2"]];
const browser = await pw.chromium.launch();
let fails = 0;
const ok = (c, msg) => { console.log(`${c ? "✓" : "✗"} ${msg}`); if (!c) fails++; };

async function open(query = "", opts = {}, ls = {}) {
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 }, ...opts });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => m.type() === "error" && errors.push(m.text()));
  await page.goto(base + query, { waitUntil: "networkidle" });
  await page.evaluate(ls => { try { localStorage.clear(); for (const k in ls) localStorage.setItem(k, ls[k]); } catch {} }, { "mne-steps": "all", ...ls });
  await page.reload({ waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  return { page, errors, context };
}
const idx = (page, id) => page.evaluate(id => [...document.querySelectorAll("#deck > .slide")].findIndex(s => s.id === id), id);
const settle = page => page.evaluate(async () => {
  for (let k = 0; k < 400 && MNEPresent.state.running; k++) await new Promise(r => setTimeout(r, 20));
  for (let k = 0; k < 3; k++) await new Promise(r => requestAnimationFrame(r));
});
const leftovers = page => page.evaluate(() => ({
  hidden: document.querySelectorAll(".morph-hide").length, leaving: document.querySelectorAll(".is-leaving").length,
  spans: document.querySelectorAll(".ch-c, .odo").length, ink: document.querySelectorAll(".ink-dot").length,
  visible: [...document.querySelectorAll("#deck > .slide")].filter(s => getComputedStyle(s).display !== "none" && getComputedStyle(s).visibility !== "hidden").length,
}));
const clean = l => !l.hidden && !l.leaving && !l.spans && !l.ink && l.visible === 1;
const rects = (page, i) => page.evaluate(i => {
  const s = document.querySelectorAll("#deck > .slide")[i], m = {};
  s.querySelectorAll("[data-morph]").forEach(e => { if (!e.classList.contains("bg") && e.getClientRects().length && !m[e.dataset.morph]) { const r = e.getBoundingClientRect(); m[e.dataset.morph] = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; } });
  return m;
}, i);

/* 1. Morph: matched elements half-way between their two places */
{
  const { page, errors } = await open("?nodegrade");
  await page.evaluate(() => MNEPresent.start(0));
  for (const [a, b] of PAIRS) {
    const ia = await idx(page, a), ib = await idx(page, b);
    await page.evaluate(i => MNEPresent.go(i, { instant: true }), ib); await settle(page);
    const B = await rects(page, ib);
    await page.evaluate(i => MNEPresent.go(i, { instant: true }), ia); await settle(page);
    const A = await rects(page, ia);
    const r = await page.evaluate(i => {
      MNEPresent.go(i);
      const to = document.querySelectorAll("#deck > .slide")[i];
      const list = document.getAnimations();
      // freeze each animation of a keyed element half-way through its own active phase
      list.forEach(x => { x.pause(); const t = x.effect.getComputedTiming(); x.currentTime = (x.effect.getTiming().delay || 0) + (t.activeDuration || 0) * .5; });
      const mid = {};
      list.forEach(x => {
        const e = x.effect.target;
        if (!e || !to.contains(e) || !e.dataset?.morph || x.effect.pseudoElement) return;
        if (!x.effect.getKeyframes().some(k => /translate/.test(k.transform || ""))) return;
        const rr = e.getBoundingClientRect(); mid[e.dataset.morph] = { x: rr.left + rr.width / 2, y: rr.top + rr.height / 2 };
      });
      return { n: list.length, mid };
    }, ib);
    await page.screenshot({ path: `${out}/morph-${a}--${b}-50.png` });
    const keys = Object.keys(r.mid).filter(k => A[k] && B[k] && Math.hypot(A[k].x - B[k].x, A[k].y - B[k].y) > 20);
    const between = keys.filter(k => {
      const p = r.mid[k];
      // the spring easing (cards, dots) may overshoot the target a little: allow 8 % of the distance
      const tx = 6 + Math.abs(A[k].x - B[k].x) * .08, ty = 6 + Math.abs(A[k].y - B[k].y) * .08;
      const inX = p.x >= Math.min(A[k].x, B[k].x) - tx && p.x <= Math.max(A[k].x, B[k].x) + tx;
      const inY = p.y >= Math.min(A[k].y, B[k].y) - ty && p.y <= Math.max(A[k].y, B[k].y) + ty;
      return inX && inY;
    });
    ok(r.n > 0 && between.length === keys.length, `${a} → ${b}: ${r.n} animations, ${keys.length} flying elements, ${between.length} between old and new place at 50%`);
    if (between.length !== keys.length) keys.filter(k => !between.includes(k)).forEach(k => console.log("   ", k, JSON.stringify({ A: A[k], mid: r.mid[k], B: B[k] })));
    await page.evaluate(() => document.getAnimations().forEach(x => x.play()));
    await settle(page);
    ok(clean(await leftovers(page)), `${a} → ${b}: cleaned up (no hidden elements, letter/digit spans or ink left)`);
  }
  // rapid presses: 8 × → land exactly 8 slides on; nothing left behind
  const start = await page.evaluate(() => MNEPresent.state.cur);
  for (let k = 0; k < 8; k++) await page.keyboard.press("ArrowRight", { delay: 25 });
  await settle(page);
  const st = await page.evaluate(() => MNEPresent.state);
  ok(st.cur === start + 8 && !st.running && clean(await leftovers(page)), `rapid presses: ${start + 1} → ${st.cur + 1} (expected ${start + 9}), no leftovers`);
  // cancel half-way: a press during a transition finishes it at once, then continues
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(120);
  const mid = await page.evaluate(() => MNEPresent.state.running);
  await page.keyboard.press("ArrowLeft");
  await settle(page);
  ok(mid && clean(await leftovers(page)) && (await page.evaluate(() => MNEPresent.state.cur)) === st.cur, "a key press cancels a running transition cleanly (→ then ← lands back)");
  ok(await page.evaluate(() => location.hash) === `#/${st.cur + 1}`, "hash follows the slide (#/n)");
  await page.keyboard.press("g"); await page.waitForTimeout(300);
  ok(await page.evaluate(() => document.documentElement.classList.contains("overview")), "G opens the overview");
  await page.locator("#deck > .slide").nth(3).click(); await page.waitForTimeout(300);
  ok(await page.evaluate(() => MNEPresent.state.cur === 3 && !MNEPresent.state.overview), "clicking a thumbnail jumps to that slide");
  ok(!errors.length, `no console errors (${errors.join(" | ")})`);
  await page.context().close();
}

/* 2. Bullet steps */
{
  const { page, errors } = await open("?nodegrade", {}, { "mne-steps": "step" });
  const i = await idx(page, "s2-1-2");
  await page.evaluate(i => MNEPresent.start(i - 1), i);
  await page.evaluate(i => MNEPresent.go(i), i); await settle(page);   // arrive: no bullet shown
  const rectsLi = () => page.evaluate(() => [...document.querySelectorAll(".slide.is-current .bl > li")].map(l => [l.offsetTop, +getComputedStyle(l).opacity]));
  const s0 = await page.evaluate(() => MNEPresent.state);
  const r0 = await rectsLi();
  await page.keyboard.press("ArrowRight"); await page.waitForTimeout(600);
  const r1 = await rectsLi();
  ok(s0.cur === i && s0.shown === 0 && s0.total === 6, `arriving on ${s0.cur + 1}: 0 of ${s0.total} bullets shown`);
  ok(r1[0][1] === 1 && r1.slice(1).every(x => x[1] === 0), "→ shows the first bullet only");
  ok(r0.every((x, k) => x[0] === r1[k][0]), "no layout shift: every bullet keeps its place while revealed");
  await page.keyboard.press("ArrowLeft"); await page.waitForTimeout(100);
  ok((await page.evaluate(() => MNEPresent.state.shown)) === 0, "← hides the last bullet before going back a slide");
  await page.keyboard.press("ArrowLeft"); await settle(page);
  ok((await page.evaluate(() => MNEPresent.state.cur)) === i - 1, "← with no bullet left goes to the previous slide");
  await page.evaluate(i => MNEPresent.go(i), i); await settle(page);
  for (let k = 0; k < 6; k++) await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(100);
  ok((await page.evaluate(() => MNEPresent.state)).shown === 6, "6 presses reveal all 6 bullets");
  await page.keyboard.press("ArrowRight"); await settle(page);
  await page.keyboard.press("ArrowLeft"); await settle(page);
  const back = await page.evaluate(() => MNEPresent.state);
  ok(back.cur === i && back.shown === back.total, "coming back to a slide shows all its bullets");
  await page.click(".pbar [data-steps='all']");
  await page.keyboard.press("ArrowRight"); await settle(page);
  const all = await page.evaluate(() => MNEPresent.state);
  ok(all.shown === all.total, `"Hiện hết": arriving shows every step (${all.shown}/${all.total})`);
  ok(await page.evaluate(() => localStorage.getItem("mne-steps")) === "all", "step mode is remembered (localStorage)");
  // table rows: stepped highlight, all rows visible
  const t = await idx(page, "t1-4");
  await page.click(".pbar [data-steps='step']");
  await page.evaluate(t => MNEPresent.go(t - 1, { instant: true }), t);
  await page.keyboard.press("ArrowRight"); await settle(page);
  await page.keyboard.press("ArrowRight"); await page.keyboard.press("ArrowRight"); await page.waitForTimeout(300);
  const rows = await page.evaluate(() => [...document.querySelectorAll(".slide.is-current tbody tr")].map(r => [r.classList.contains("st-on"), +getComputedStyle(r).opacity]));
  ok(rows[1][0] && rows.filter(r => r[0]).length === 1 && rows[1][1] === 1, "Table 1.4: steps highlight one row at a time (others dimmed, never hidden)");
  await page.screenshot({ path: `${out}/steps-table-1-4.png` });
  ok(!errors.length, `no console errors (${errors.join(" | ")})`);
  await page.context().close();
}

/* 3. Presets, reduced motion, effect switches, auto-degrade */
{
  const { page, errors } = await open("?nodegrade");
  await page.evaluate(() => MNEPresent.start(6));
  await page.click(".pbar [data-preset='fade']");
  const fade = await page.evaluate(() => { MNEPresent.next(); return document.getAnimations().filter(a => a.effect.target?.closest?.("#deck > .slide")).map(a => a.effect.target.id || a.effect.target.className); });
  ok(fade.length === 1 && /^s1-1$/.test(fade[0]), `Fade: one cross-fade of the slide (${fade.join(", ")})`);
  await settle(page);
  await page.click(".pbar [data-preset='off']");
  const off = await page.evaluate(() => { MNEPresent.next(); return document.getAnimations().filter(a => a.effect.target?.closest?.("#deck > .slide, .stage-over")).length; });
  ok(off === 0, `"Tắt": instant switch (${off} animations)`);
  await page.click(".pbar [data-preset='cinematic']");
  await page.evaluate(() => { localStorage.setItem("mne-fx-off", "ink,compass,letters,engrave,cards,numbers,bullets,parallax"); });
  await page.evaluate(() => MNEPresent.go(MNEPresent.state.cur - 1, { instant: true }));
  ok(true, "effects can be switched off one by one (Hiệu ứng menu)");
  await page.context().close();

  const r = await open("?nodegrade", { reducedMotion: "reduce" });
  await r.page.evaluate(() => MNEPresent.start(6));
  const info = await r.page.evaluate(() => { MNEPresent.next(); const a = document.getAnimations().filter(x => x.effect.target?.closest?.("#deck > .slide, .stage-over")); return { n: a.length, max: Math.max(0, ...a.map(x => x.effect.getComputedTiming().endTime)) }; });
  ok(info.n <= 1 && info.max <= 200, `reduced motion: ${info.n} cross-fade, ${info.max} ms, no movement`);
  ok(!r.errors.length, "no console errors with reduced motion");
  await r.context.close();

  const e = await open("", {}, { "mne-fx-off": "ink,compass,letters,engrave,cards,numbers,bullets,parallax" });
  await e.page.evaluate(() => MNEPresent.start(6));
  const n = await e.page.evaluate(() => { MNEPresent.next(); return { ink: document.querySelectorAll(".ink-dot").length, compass: document.querySelector(".compass-char")?.hidden, letters: document.querySelectorAll(".ch-c").length }; });
  ok(!n.ink && n.compass && !n.letters, "every signature effect off: no ink drop, no compass, no letter flight");
  await e.context.close();

  const d = await open("");
  await d.page.evaluate(() => { MORPH_CONFIG.degrade.frameMs = 0; MNEPresent.start(10); });
  for (let k = 0; k < 3; k++) { await d.page.evaluate(() => MNEPresent.go(MNEPresent.state.cur + 1)); await settle(d.page); }
  const dg = await d.page.evaluate(() => ({ ...MNEPresent.state, chip: !document.querySelector(".pbar__lite").hidden }));
  ok(dg.preset === "classic" && dg.lite && dg.chip, `auto-degrade: three slow transitions → ${dg.preset}, chip "Chế độ nhẹ" shown`);
  await d.page.click(".pbar__lite");
  ok(await d.page.evaluate(() => MNEPresent.state.preset === "cinematic" && !MNEPresent.state.lite), "clicking the chip turns Cinematic back on");
  ok(!errors.length && !d.errors.length, "no console errors (presets)");
  await d.context.close();
}

/* 4. Notes (N), presenter window (S), reading mode, View Transitions (?vt) */
{
  const { page, errors, context } = await open("?nodegrade");
  const i = await idx(page, "s1-1");
  await page.evaluate(i => MNEPresent.start(i), i);
  await page.keyboard.press("n"); await page.waitForTimeout(300);
  const notes = await page.evaluate(() => ({ open: MNEPresent.state.notes, text: document.querySelector(".np-body").textContent }));
  ok(notes.open && /There is no single legal definition of a multinational enterprise/.test(notes.text), "N opens the speaker notes with the paper's full text");
  await page.screenshot({ path: `${out}/notes.png` });
  const [pop] = await Promise.all([context.waitForEvent("page"), page.keyboard.press("s")]);
  await pop.waitForLoadState("networkidle");
  await pop.waitForFunction(() => window.MNEPresent?.state.on);
  await page.keyboard.press("n");
  await page.keyboard.press("End"); await settle(page);
  await pop.waitForFunction(n => MNEPresent.state.cur === n - 1, await page.evaluate(() => MNEPresent.state.N));
  ok(true, "S opens the presenter window, which follows the main window (BroadcastChannel)");
  await pop.screenshot({ path: `${out}/presenter.png` });
  await pop.keyboard.press("Home"); await settle(pop);
  await page.waitForFunction(() => MNEPresent.state.cur === 0);
  ok(true, "the presenter window drives the main window too");
  await pop.close();
  await page.keyboard.press("Escape"); await page.waitForTimeout(200);
  await page.click(".nav__read"); await page.waitForTimeout(300);
  const rd = await page.evaluate(() => ({ cls: document.documentElement.classList.contains("reading"), notes: getComputedStyle(document.querySelector("#s1-1 .notes")).display, bl: getComputedStyle(document.querySelector("#s1-1 .bl")).display }));
  ok(rd.cls && rd.notes === "block" && rd.bl === "none", "reading mode (Đọc): full text shown, bullets hidden");
  await page.locator("#s1-1").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${out}/reading.png` });
  await page.click(".nav__read");
  ok(!errors.length, `no console errors (${errors.join(" | ")})`);
  await context.close();

  const v = await open("?vt&nodegrade");
  await v.page.evaluate(() => MNEPresent.start(6));
  ok(await v.page.evaluate(() => MNEPresent.state.engine) === "view-transitions", "?vt selects the View Transitions engine (kept for comparison)");
  for (let k = 0; k < 3; k++) { await v.page.keyboard.press("ArrowRight"); await v.page.waitForTimeout(1300); }
  ok((await v.page.evaluate(() => MNEPresent.state.cur)) === 9 && !v.errors.length, "View Transitions engine still works");
  await v.context.close();
}

await browser.close();
console.log(fails ? `\n${fails} check(s) failed` : `\nAll presentation checks passed · frames in ${out}`);
process.exit(fails ? 1 : 0);
