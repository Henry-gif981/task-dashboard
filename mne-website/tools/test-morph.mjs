// Morph tests (server running: npm start):  node tools/test-morph.mjs [url] [outDir]
// For several pairs of slides the transition is frozen at 50% and every matched element is
// checked to sit between its old and new position; frames are saved as PNG. Also tested:
// going back, rapid key presses, the FLIP fallback (?flip) and prefers-reduced-motion.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const base = (process.argv[2] || "http://localhost:5173/").replace(/#.*$/, "");
const out = resolve(process.argv[3] || resolve(import.meta.dirname, "../test-results/morph"));
mkdirSync(out, { recursive: true });
const require = createRequire(import.meta.url);
let pw;
try { pw = require("playwright"); } catch { pw = require(process.env.PLAYWRIGHT_PATH || "/opt/node22/lib/node_modules/playwright"); }

const PAIRS = [["chapter-1", "s1-1"], ["s1-1-2", "s1-1-2b"], ["t1-2", "t1-3"], ["s1-3", "t1-4"], ["key-numbers", "s2-2-1"], ["t2-3", "f2-1"], ["t2-4", "f2-2"], ["s2-2", "key-numbers"]];
const browser = await pw.chromium.launch();
let fails = 0;
const ok = (c, msg) => { console.log(`${c ? "✓" : "✗"} ${msg}`); if (!c) fails++; };

async function open(query = "", opts = {}) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, ...opts });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => m.type() === "error" && errors.push(m.text()));
  await page.goto(base + query, { waitUntil: "networkidle" });
  await page.evaluate(() => { try { localStorage.setItem("mne-fx", "morph"); localStorage.setItem("mne-ms", "1000"); } catch {} });
  await page.reload({ waitUntil: "networkidle" });
  return { page, errors };
}
const idx = (page, id) => page.evaluate(id => [...document.querySelectorAll("#deck > .slide")].findIndex(s => s.id === id), id);

// freeze the running transition at fraction f and return geometry of matched elements
async function freezeAt(page, f) {
  return page.evaluate(async f => {
    const flip = MNEPresent.state.engine === "flip";
    const anims = () => document.getAnimations().filter(a => a.effect && (flip ? a.effect.target?.closest?.(".morph-layer, #deck > .slide") && !a.effect.target.closest(".chart") : /^::view-transition/.test(a.effect.pseudoElement || "")));
    for (let k = 0; k < 60 && !anims().length; k++) await new Promise(r => requestAnimationFrame(r));
    const list = anims();
    list.forEach(a => { a.pause(); a.currentTime = (a.effect.getComputedTiming().duration || 0) * f; });
    await new Promise(r => requestAnimationFrame(r));
    const groups = {};
    for (const a of list) {
      const pe = a.effect.pseudoElement || "";
      const m = pe.match(/^::view-transition-group\((m-[^)]+)\)$/);
      if (m) {
        const cs = getComputedStyle(document.documentElement, pe);
        const t = new DOMMatrix(cs.transform === "none" ? undefined : cs.transform);
        groups[m[1]] = { x: t.e, y: t.f, w: parseFloat(cs.width), h: parseFloat(cs.height) };
      }
    }
    return { n: list.length, groups };
  }, f);
}
const rectsOf = (page, i) => page.evaluate(i => {
  const s = document.querySelectorAll("#deck > .slide")[i], m = {};
  s.querySelectorAll("[data-morph]").forEach(e => { if (e.getClientRects().length && !m["m-" + e.dataset.morph]) { const r = e.getBoundingClientRect(); m["m-" + e.dataset.morph.replace(/[^a-zA-Z0-9_-]/g, "_")] = { x: r.left, y: r.top, w: r.width, h: r.height }; } });
  return m;
}, i);
const settle = page => page.evaluate(async () => {
  document.getAnimations().forEach(a => { try { a.finish(); } catch {} });
  for (let k = 0; k < 6; k++) await new Promise(r => requestAnimationFrame(r));
});

/* 1. View Transitions: mid-frames for several pairs, forward and back */
{
  const { page, errors } = await open();
  await page.evaluate(() => MNEPresent.start(0));
  for (const [a, b] of PAIRS) {
    const ia = await idx(page, a), ib = await idx(page, b);
    await page.evaluate(i => MNEPresent.go(i), ia); await settle(page);
    const A = await rectsOf(page, ia);
    await page.evaluate(i => MNEPresent.go(i), ib); await settle(page);
    const B = await rectsOf(page, ib);
    await page.evaluate(i => MNEPresent.go(i), ia); await settle(page);
    await page.evaluate(i => { MNEPresent.go(i); }, ib);
    const g = await freezeAt(page, .5);
    await page.screenshot({ path: `${out}/vt-${a}--${b}-50.png` });
    const shared = Object.keys(A).filter(k => B[k] && g.groups[k]);
    let between = 0, moved = 0;
    for (const k of shared) {
      const p = g.groups[k], cx = p.x + p.w / 2, cA = A[k].x + A[k].w / 2, cB = B[k].x + B[k].w / 2;
      const lo = Math.min(cA, cB) - 3, hi = Math.max(cA, cB) + 3;
      if (cx >= lo && cx <= hi) between++;
      if (Math.abs(cA - cB) > 20 || Math.abs((A[k].y + A[k].h / 2) - (B[k].y + B[k].h / 2)) > 20) moved++;
    }
    ok(shared.length >= 3 && between === shared.length, `VT ${a} → ${b}: ${shared.length} matched groups, ${between} between old and new at 50%, ${moved} visibly moving`);
    await settle(page);
  }
  // backwards
  const i2 = await idx(page, "t1-3");
  await page.evaluate(i => MNEPresent.go(i), i2); await settle(page);
  await page.keyboard.press("ArrowLeft");
  const gb = await freezeAt(page, .5);
  await page.screenshot({ path: `${out}/vt-back-t1-3--t1-2-50.png` });
  ok(gb.n > 0 && Object.keys(gb.groups).length >= 3, `backwards (ArrowLeft) animates ${Object.keys(gb.groups).length} matched groups`);
  await settle(page);
  // rapid presses: 8 × → in quick succession must land exactly 8 slides on, nothing stuck
  const start = await page.evaluate(() => MNEPresent.state.cur);
  for (let k = 0; k < 8; k++) await page.keyboard.press("ArrowRight", { delay: 20 });
  await page.waitForTimeout(1600);
  const st = await page.evaluate(() => ({ ...MNEPresent.state, visible: [...document.querySelectorAll("#deck > .slide")].filter(s => getComputedStyle(s).display !== "none").length, named: [...document.querySelectorAll("[style*='view-transition-name']")].filter(e => e.style.viewTransitionName).length }));
  ok(st.cur === start + 8 && !st.running && st.visible === 1 && st.named === 0, `rapid presses: ${start + 1} → ${st.cur + 1} (expected ${start + 9}), running=${st.running}, visible slides=${st.visible}, leftover names=${st.named}`);
  // hash, overview and exit
  ok(await page.evaluate(() => location.hash) === `#/${st.cur + 1}`, "hash follows the slide (#/n)");
  await page.keyboard.press("g"); await page.waitForTimeout(1300);
  ok(await page.evaluate(() => document.documentElement.classList.contains("overview")), "G opens the overview");
  await page.screenshot({ path: `${out}/overview.png` });
  await page.locator("#deck > .slide").nth(3).click(); await page.waitForTimeout(1300);
  ok(await page.evaluate(() => MNEPresent.state.cur === 3 && !MNEPresent.state.overview), "clicking a thumbnail jumps to that slide");
  await page.keyboard.press("Escape"); await page.waitForTimeout(300);
  ok(await page.evaluate(() => !document.documentElement.classList.contains("presenting")), "Esc leaves the presentation");
  ok(!errors.length, `no console errors (${errors.join(" | ")})`);
  await page.close();
}

/* 2. FLIP fallback (?flip) */
{
  const { page, errors } = await open("?flip");
  await page.evaluate(() => MNEPresent.start(0));
  ok(await page.evaluate(() => MNEPresent.state.engine) === "flip", "?flip selects the FLIP engine");
  for (const [a, b] of PAIRS.slice(0, 5)) {
    const ia = await idx(page, a), ib = await idx(page, b);
    await page.evaluate(i => MNEPresent.go(i), ia); await settle(page);
    await page.evaluate(i => MNEPresent.go(i), ib);
    const g = await freezeAt(page, .5);
    const clones = await page.evaluate(() => document.querySelectorAll(".morph-layer > *").length);
    await page.screenshot({ path: `${out}/flip-${a}--${b}-50.png` });
    ok(g.n > 0 && clones >= 6, `FLIP ${a} → ${b}: ${clones / 2} matched elements flying, ${g.n} animations`);
    await settle(page);
    const left = await page.evaluate(() => ({ layer: !!document.querySelector(".morph-layer"), hidden: document.querySelectorAll(".morph-hide").length, leaving: document.querySelectorAll(".is-leaving").length }));
    ok(!left.layer && !left.hidden && !left.leaving, `FLIP cleans up after ${a} → ${b}`);
  }
  for (let k = 0; k < 6; k++) await page.keyboard.press("ArrowRight", { delay: 15 });
  await page.waitForTimeout(1500);
  const st = await page.evaluate(() => ({ ...MNEPresent.state, layer: !!document.querySelector(".morph-layer"), visible: [...document.querySelectorAll("#deck > .slide")].filter(s => getComputedStyle(s).display !== "none").length }));
  ok(!st.running && !st.layer && st.visible === 1, `FLIP rapid presses settle cleanly (slide ${st.cur + 1})`);
  ok(!errors.length, `no console errors with FLIP (${errors.join(" | ")})`);
  await page.close();
}

/* 3. prefers-reduced-motion: short cross-fade, no morph groups */
{
  const { page, errors } = await open("", { reducedMotion: "reduce" });
  await page.evaluate(() => MNEPresent.start(6));
  await page.keyboard.press("ArrowRight");
  const info = await page.evaluate(async () => {
    for (let k = 0; k < 10; k++) await new Promise(r => requestAnimationFrame(r));
    const a = document.getAnimations().filter(x => /^::view-transition/.test(x.effect.pseudoElement || "") || x.effect.target?.closest?.(".morph-layer, #deck > .slide"));
    return { groups: a.filter(x => /group\(m-/.test(x.effect.pseudoElement || "")).length, maxDur: Math.max(0, ...a.map(x => x.effect.getComputedTiming().duration || 0)) };
  });
  ok(info.groups === 0 && info.maxDur <= 250, `reduced motion: ${info.groups} morph groups, longest animation ${info.maxDur}ms`);
  await page.click(".pbar__fx button[data-fx='off']");
  await page.keyboard.press("ArrowRight");
  const n = await page.evaluate(async () => { await new Promise(r => requestAnimationFrame(r)); return document.getAnimations().filter(x => /^::view-transition/.test(x.effect.pseudoElement || "") || x.effect.target?.closest?.(".morph-layer")).length; });
  ok(n === 0, `"Off" switches instantly (${n} animations)`);
  ok(!errors.length, "no console errors with reduced motion");
  await page.close();
}

await browser.close();
console.log(fails ? `\n${fails} morph check(s) failed` : `\nAll morph checks passed · frames in ${out}`);
process.exit(fails ? 1 : 0);
