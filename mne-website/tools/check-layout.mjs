// Layout test: every slide must fit its 1920×1080 stage with nothing clipped.
//   node tools/check-layout.mjs [url]   (server running: npm start)
// Fails when content reaches below the safe area (y > 1000) or beyond the sides, when any
// element clips its own text (scrollHeight > clientHeight), or when body text / table text is
// smaller than 22px / 18px on the stage.
import { createRequire } from "node:module";

const url = process.argv[2] || "http://localhost:5173/";
const require = createRequire(import.meta.url);
let pw;
try { pw = require("playwright"); } catch { pw = require(process.env.PLAYWRIGHT_PATH || "/opt/node22/lib/node_modules/playwright"); }

const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, reducedMotion: "reduce" });
const errors = [];
page.on("pageerror", e => errors.push(e.message));
page.on("console", m => m.type() === "error" && errors.push(m.text()));
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(() => { document.documentElement.classList.add("printing"); });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);

const report = await page.evaluate(() => {
  const SAFE_B = 1004, SAFE_R = 1920, out = [];
  const skip = e => e.closest(".bg, .dot, .pno, .ctag, .emblem, .brand, .links, .sr-only, .sep, [data-deco]");
  for (const s of document.querySelectorAll("#deck > .slide")) {
    const r0 = s.getBoundingClientRect();
    let maxB = 0, maxR = 0, minL = 1e9, worst = null, wideR = null;
    const clipped = [], small = [];
    for (const e of s.querySelectorAll("*")) {
      if (skip(e)) continue;
      const cs = getComputedStyle(e);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      const r = e.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const leaf = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) || e.matches("img, svg, canvas, .card, .box, .bar, .tframe, .callout, .n, .toc a, li, tr, .fpanel, .threshold");
      if (!leaf) continue;
      const b = r.bottom - r0.top, rr = r.right - r0.left, l = r.left - r0.left;
      if (b > maxB) { maxB = b; worst = e.tagName.toLowerCase() + "." + [...e.classList].join("."); }
      if (rr > maxR) { maxR = rr; wideR = e.tagName.toLowerCase() + "." + [...e.classList].join("."); }
      minL = Math.min(minL, l);
      if (["hidden", "clip", "auto", "scroll"].includes(cs.overflowY) && e.scrollHeight > e.clientHeight + 2 && !e.matches(".slide")) clipped.push(e.className || e.tagName);
      const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 20);
      if (own && e.closest(".body")) {
        const px = parseFloat(cs.fontSize), inTable = e.closest("table, .fig, .ir");
        if (!e.closest("[data-web], .cap, .tsrc, .fsrc, .nsrc, figcaption, .legend, .refs, .chart, .fpanel, .box") && px < (inTable ? 18 : 22) - .01) small.push(`${px}px ${e.tagName.toLowerCase()}: ${e.textContent.trim().slice(0, 40)}`);
      }
    }
    out.push({ n: s.dataset.n, id: s.id || "", title: s.dataset.title || "", maxB: Math.round(maxB), maxR: Math.round(maxR), wideR, minL: Math.round(minL), worst, over: maxB > SAFE_B || maxR > SAFE_R + 1 || minL < -1, clipped, small: small.slice(0, 3), sh: s.scrollHeight, sw: s.scrollWidth });
  }
  return out;
});
await browser.close();

let bad = 0;
for (const r of report) {
  const issues = [];
  if (r.over) issues.push(`content to y=${r.maxB} x=${r.minL}..${r.maxR} (bottom: ${r.worst}; right: ${r.wideR})`);
  if (r.sh > 1080 || r.sw > 1920) issues.push(`stage scroll ${r.sw}×${r.sh}`);
  if (r.clipped.length) issues.push("clipped: " + r.clipped.slice(0, 3).join(", "));
  if (r.small.length) issues.push("small text: " + r.small.join(" | "));
  if (issues.length) bad++;
  console.log(`${String(r.n).padStart(2)} ${issues.length ? "✗" : "✓"} ${r.id.padEnd(14)} bottom ${String(r.maxB).padStart(4)}  ${r.title.slice(0, 48)}${issues.length ? "\n     " + issues.join("\n     ") : ""}`);
}
if (errors.length) { console.log("page errors:\n  " + errors.join("\n  ")); bad++; }
console.log(bad ? `\n${bad} slide(s) with layout problems` : `\nAll ${report.length} slides fit the stage`);
process.exit(bad ? 1 : 0);
