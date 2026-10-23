// Quality checks for the page (run while `npm start` is serving):
//   node tools/check.mjs [url]
// 1. every sentence, table cell and reference of content/content.md appears on the page
// 2. WCAG contrast of every text element, measured against the rendered background
// 3. console errors, failed requests and horizontal overflow at 390 / 768 / 1440 px
// Needs Playwright (npm i -D playwright, or a global install via PLAYWRIGHT_PATH).
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createRequire } from "node:module";

const url = process.argv[2] || "http://localhost:5173/";
const require = createRequire(import.meta.url);
let pw;
try { pw = require("playwright"); } catch { pw = require(process.env.PLAYWRIGHT_PATH || "/opt/node22/lib/node_modules/playwright"); }

const norm = s => s.replace(/[*_`]/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
  .replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const low = s => norm(s).toLowerCase();

const md = await readFile(resolve(import.meta.dirname, "../content/content.md"), "utf8");
const needles = [];
let section = "";
for (const raw of md.split("\n")) {
  const line = raw.trim();
  if (line.startsWith("## ")) section = line;
  if (!line || line.startsWith("#") || /^(Extracted|Vietnamese|Page numbers|\(Order)/.test(line)) continue;
  if (section.startsWith("## Table of contents") || section.startsWith("## List of tables") || section.startsWith("## Cover")) continue;
  if (line.startsWith("|")) {
    if (/^\|[-| ]+\|$/.test(line)) continue;
    line.split("|").map(c => low(c)).filter(Boolean).forEach(c => needles.push(c));
  } else if (/^\d+\. /.test(line)) {
    needles.push(low(line.replace(/^\d+\. /, "")));
  } else {
    norm(line).split(/(?<=[.;:])\s+(?=[A-Z(])/).forEach(s => s.length > 3 && needles.push(s.toLowerCase()));
  }
}

const browser = await pw.chromium.launch();
let failures = 0;
for (const width of [1440, 768, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
  const errors = [];
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", e => errors.push(e.message));
  page.on("requestfailed", r => errors.push("request failed: " + r.url()));
  await page.goto(url, { waitUntil: "networkidle" });
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 700) { await page.evaluate(v => scrollTo(0, v), y); await page.waitForTimeout(40); }
  await page.evaluate(() => { document.querySelectorAll("details").forEach(d => (d.open = true)); scrollTo(0, 0); });
  await page.waitForTimeout(400);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(`\n[${width}px] console/network errors: ${errors.length}${errors.length ? "\n  " + errors.join("\n  ") : ""}; horizontal overflow: ${overflow}px`);
  failures += errors.length + (overflow > 0 ? 1 : 0);

  if (width === 1440) {
    // 1. content
    const text = low(await page.evaluate(() => document.body.innerText));
    const missing = needles.filter(n => !text.includes(n));
    console.log(`content: ${needles.length - missing.length}/${needles.length} sentences, cells and references found`);
    missing.forEach(m => console.log("  MISSING: " + m.slice(0, 140)));
    failures += missing.length;

    // 2. contrast: screenshot with text, then with transparent text, compare per element
    const items = await page.evaluate(() => {
      const out = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const seen = new Set();
      while (walker.nextNode()) {
        const t = walker.currentNode;
        if (!t.textContent.trim()) continue;
        const el = t.parentElement;
        if (seen.has(el) || el.closest("svg, .sr-only, .skip, [aria-hidden=true], .nav")) continue;
        seen.add(el);
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || +cs.opacity === 0) continue;
        el.scrollIntoView({ block: "center" });
        const r = document.createRange(); r.selectNodeContents(t);
        const b = r.getBoundingClientRect();
        if (b.width < 2 || b.height < 2) continue;
        const px = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 600;
        // sample only points where the text is actually on top (not covered by an illustration)
        const pts = [];
        for (let yy = b.top + 1; yy < b.bottom - 1; yy += 3) for (let xx = b.left + 1; xx < b.right - 1; xx += 4) {
          const hit = document.elementFromPoint(xx, yy);
          if (hit && (hit === el || el.contains(hit) || hit.contains(el))) pts.push([xx + scrollX, yy + scrollY]);
        }
        if (pts.length) out.push({ text: t.textContent.trim().slice(0, 50), color: cs.color, pts, large: px >= 24 || (bold && px >= 18.66) });
      }
      return out;
    });
    await page.addStyleTag({ content: "*, *::before, *::after { color: transparent !important; text-shadow: none !important; -webkit-text-fill-color: transparent !important; text-decoration-color: transparent !important; } .nav { display: none !important; } .card__stats span, .chapter-links a { color: transparent !important; }" });
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(200);
    const shot = await page.screenshot({ fullPage: true, type: "png" });
    const { PNG } = await import("./png.mjs");
    const img = PNG.decode(shot);
    const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
    const ratio = (a, b) => { const [h, l] = a > b ? [a, b] : [b, a]; return (h + .05) / (l + .05); };
    let bad = 0;
    for (const it of items) {
      const fg = it.color.match(/[\d.]+/g).map(Number);
      if (fg[3] !== undefined && fg[3] < .99) continue; // translucent text is decorative
      const L = lum(fg);
      let worst = Infinity;
      for (const [xx, yy] of it.pts) {
        const p = img.pixel(Math.round(xx), Math.round(yy)); if (!p) continue;
        worst = Math.min(worst, ratio(L, lum(p)));
      }
      const need = it.large ? 3 : 4.5;
      if (worst < need) { bad++; if (bad <= 25) console.log(`  LOW CONTRAST ${worst.toFixed(2)} < ${need}: "${it.text}"`); }
    }
    console.log(`contrast: ${items.length - bad}/${items.length} text elements pass WCAG AA`);
    failures += bad;
  }
  await page.close();
}
await browser.close();
console.log(failures ? `\n${failures} problem(s) found` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
