// Morph performance profile (server running: npm start)
//   node tools/perf-morph.mjs [url] [--engine=vt] [--preset=cinematic|classic|fade] [--off=ink,…] [--all] [--rates=1,4] [--out=file.json]
//   --all: every adjacent pair instead of the eight representative ones; --off: effects switched off
// For each representative pair of slides, at 1920×1080 and CPU throttling 1× and 4×, it records
// (in the page, with requestAnimationFrame) every frame from the key press to the end of the
// transition, plus long tasks, press → first animated frame latency, named / animated elements,
// DOM nodes, composited layers (CDP LayerTree) and JS heap (CDP Performance.getMetrics).
// A Chrome trace of the first pair is summarised to show where frame time goes.
import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const args = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith("--")).map(a => { const [k, ...v] = a.slice(2).split("="); return [k, v.length ? v.join("=") : true]; }));
const base = (process.argv.slice(2).find(a => !a.startsWith("--")) || "http://localhost:5173/").replace(/#.*$/, "");
const require = createRequire(import.meta.url);
let pw;
try { pw = require("playwright"); } catch { pw = require(process.env.PLAYWRIGHT_PATH || "/opt/node22/lib/node_modules/playwright"); }

// representative pairs: text-heavy, cream ↔ wash, table, engraving SVG, chapter opener, chart, figure, key numbers
const PAIRS = (args.pairs ? args.pairs.split(",").map(p => p.split(">")) : [
  ["s1-1", "s1-1-1b"],        // text-heavy, cream → wash
  ["t1-2", "t1-3"],           // table → table, cream → wash
  ["s1-3-3", "t1-5"],         // engraving (telescope) → table
  ["chapter-1", "s1-1"],      // chapter opener (ship) → text
  ["t2-3", "f2-1"],           // table → chart
  ["s1-2", "f1-1"],           // cards → figure 1.1
  ["key-numbers", "s2-2-1"],  // key numbers → table
  ["top", "contents"],        // cover (globe) → contents, wash → cream
]);
const RATES = args.rates ? args.rates.split(",").map(Number) : [1, 4];
const query = args.engine === "vt" ? "?vt" : args.engine === "flip" ? "?flip" : "";

const browser = await pw.chromium.launch();
const results = [];
for (const rate of RATES) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Performance.enable");
  await cdp.send("LayerTree.enable");
  let layers = 0, maxLayers = 0;
  cdp.on("LayerTree.layerTreeDidChange", e => { if (e.layers) { layers = e.layers.length; maxLayers = Math.max(maxLayers, layers); } });
  await page.goto(base + (query || "?") + (query ? "&" : "") + "nodegrade" + (args.q ? "&" + args.q : ""), { waitUntil: "networkidle" });
  await page.evaluate(([p, off]) => { try { localStorage.setItem("mne-fx", "morph"); localStorage.setItem("mne-ms", "900"); localStorage.setItem("mne-preset", p || "cinematic"); localStorage.setItem("mne-steps", "all"); localStorage.removeItem("mne-lite"); localStorage.setItem("mne-fx-off", off || ""); } catch {} }, [args.preset, args.off]);
  await page.reload({ waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => MNEPresent.start(0));
  await page.waitForTimeout(800);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate });

  // --all: every adjacent pair of the deck (64), in order
  const list = args.all ? await page.evaluate(() => [...document.querySelectorAll("#deck > .slide")].map(s => s.id)).then(ids => ids.slice(0, -1).map((id, k) => [id, ids[k + 1]])) : PAIRS;
  for (const [a, b] of list) {
    const ia = await page.evaluate(id => [...document.querySelectorAll("#deck > .slide")].findIndex(s => s.id === id), a);
    const ib = await page.evaluate(id => [...document.querySelectorAll("#deck > .slide")].findIndex(s => s.id === id), b);
    if (ia < 0 || ib < 0) { console.log(`skip ${a} → ${b} (missing)`); continue; }
    await page.evaluate(i => MNEPresent.go(i, { instant: true }), ia);
    await page.waitForTimeout(1200);
    const traceThis = rate === 1 && results.length === 0;
    if (traceThis) await browser.startTracing(page, { categories: ["devtools.timeline", "disabled-by-default-devtools.timeline", "blink", "cc", "viz"] });
    maxLayers = layers;
    const m0 = await cdp.send("Performance.getMetrics");
    const r = await page.evaluate(async ({ ib, b, adjacent }) => {
      const frames = [], long = [];
      const po = new PerformanceObserver(l => l.getEntries().forEach(e => long.push(Math.round(e.duration))));
      try { po.observe({ type: "longtask" }); } catch {}
      let t0 = 0, first = 0, named = 0, animated = 0, running = true;
      const isAnimating = () => document.getAnimations().some(x => x.playState === "running" && (x.currentTime || 0) > 0);
      const tick = t => {
        frames.push(t);
        if (t0 && !first && isAnimating()) first = t;
        named = Math.max(named, [...document.querySelectorAll("[style*='view-transition-name']")].filter(e => e.style.viewTransitionName).length);
        animated = Math.max(animated, new Set(document.getAnimations().map(x => x.effect && (x.effect.pseudoElement || x.effect.target))).size);
        if (running) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      t0 = performance.now();
      if (adjacent) document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      else MNEPresent.go(ib);                                         // pairs that are not neighbours
      // wait for the transition to end (+ 150 ms of after-effects)
      const tEnd = performance.now() + 6000;
      while (performance.now() < tEnd) {
        await new Promise(r => setTimeout(r, 50));
        if (performance.now() - t0 > 200 && !MNEPresent.state.running && !isAnimating()) break;
      }
      await new Promise(r => setTimeout(r, 150));
      running = false; po.disconnect();
      const f = frames.filter(t => t >= t0);
      const dt = f.slice(1).map((t, i) => t - f[i]);
      const s = [...dt].sort((x, y) => x - y);
      const dur = f.length > 1 ? f[f.length - 1] - f[0] : 0;
      return {
        pair: b, frames: dt.length, durMs: Math.round(dur),
        fps: dt.length ? +(1000 * dt.length / dur).toFixed(1) : 0,
        p95: s.length ? +s[Math.min(s.length - 1, Math.floor(s.length * .95))].toFixed(1) : 0,
        max: s.length ? +s[s.length - 1].toFixed(1) : 0,
        over33: dt.filter(x => x > 33.4).length,
        firstFrameMs: first ? Math.round(first - t0) : null,
        longTasks: long, named, animated,
        nodes: document.getElementsByTagName("*").length,
      };
    }, { ib, b, adjacent: ib === ia + 1 });
    const m1 = await cdp.send("Performance.getMetrics");
    const metric = (m, k) => (m.metrics.find(x => x.name === k) || {}).value || 0;
    r.layers = maxLayers;
    r.heapMB = +(metric(m1, "JSHeapUsedSize") / 1048576).toFixed(1);
    r.layoutMs = Math.round((metric(m1, "LayoutDuration") - metric(m0, "LayoutDuration")) * 1000);
    r.styleMs = Math.round((metric(m1, "RecalcStyleDuration") - metric(m0, "RecalcStyleDuration")) * 1000);
    r.scriptMs = Math.round((metric(m1, "ScriptDuration") - metric(m0, "ScriptDuration")) * 1000);
    r.from = a; r.cpu = rate; r.engine = await page.evaluate(() => MNEPresent.state.engine + (MNEPresent.state.preset ? "/" + MNEPresent.state.preset : ""));
    if (traceThis) {
      const buf = await browser.stopTracing();
      const ev = JSON.parse(buf.toString()).traceEvents.filter(e => e.ph === "X" && e.dur);
      const by = {};
      for (const e of ev) if (["Paint", "PaintImage", "RasterTask", "Layout", "UpdateLayoutTree", "Layerize", "UpdateLayer", "CompositeLayers", "PrePaint", "Commit", "FunctionCall", "TimerFire", "FireAnimationFrame", "Decode Image", "ImageDecodeTask", "ViewTransition", "CaptureSnapshot", "DrawFrame", "ScheduledActionDraw", "GPUTask", "HitTest", "ParseHTML"].includes(e.name) || /ViewTransition|Snapshot|Raster|Paint/.test(e.name)) by[e.name] = (by[e.name] || 0) + e.dur / 1000;
      r.trace = Object.fromEntries(Object.entries(by).sort((x, y) => y[1] - x[1]).slice(0, 14).map(([k, v]) => [k, Math.round(v)]));
    }
    results.push(r);
    console.log(`cpu ${rate}× ${a} → ${b}: ${r.fps} fps, p95 ${r.p95} ms, max ${r.max} ms, >33ms ${r.over33}, first ${r.firstFrameMs} ms, long ${JSON.stringify(r.longTasks)}, named ${r.named}, animated ${r.animated}, layers ${r.layers}, nodes ${r.nodes}, heap ${r.heapMB} MB, layout ${r.layoutMs} ms, style ${r.styleMs} ms, script ${r.scriptMs} ms`);
    if (r.trace) console.log("  trace (ms, first pair):", JSON.stringify(r.trace));
  }
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  await page.close();
}
await browser.close();
const sum = rate => {
  const rs = results.filter(r => r.cpu === rate);
  const avg = k => +(rs.reduce((a, r) => a + (r[k] || 0), 0) / (rs.length || 1)).toFixed(1);
  return { fpsAvg: avg("fps"), fpsMin: Math.min(...rs.map(r => r.fps)), p95Max: Math.max(...rs.map(r => r.p95)), maxFrame: Math.max(...rs.map(r => r.max)), over33: rs.reduce((a, r) => a + r.over33, 0), firstFrameMax: Math.max(...rs.map(r => r.firstFrameMs || 0)), longTasksMax: Math.max(0, ...rs.flatMap(r => r.longTasks)), namedMax: Math.max(...rs.map(r => r.named)) };
};
const summary = Object.fromEntries(RATES.map(r => ["cpu" + r, sum(r)]));
if (args.all) console.log("worst pairs:", results.slice().sort((x, y) => x.fps - y.fps).slice(0, 8).map(r => `${r.from}→${r.pair} ${r.fps}fps p95 ${r.p95}`).join(" · "));
console.log("\nsummary", JSON.stringify(summary));
if (args.out) { mkdirSync(dirname(resolve(args.out)), { recursive: true }); writeFileSync(resolve(args.out), JSON.stringify({ base, query, preset: args.preset || null, summary, results }, null, 1)); }
