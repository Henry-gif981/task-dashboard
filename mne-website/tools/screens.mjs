// Screenshots for review: presentation mode at 1920×1080 and 1440×900, scroll view at 390 px.
//   node tools/screens.mjs [url] [outDir]
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
const base = (process.argv[2] || "http://localhost:5173/").replace(/#.*$/, "");
const out = resolve(process.argv[3] || resolve(import.meta.dirname, "../test-results/views"));
mkdirSync(out, { recursive: true });
const require = createRequire(import.meta.url);
let pw;
try { pw = require("playwright"); } catch { pw = require(process.env.PLAYWRIGHT_PATH || "/opt/node22/lib/node_modules/playwright"); }
const browser = await pw.chromium.launch();
const pick = [1, 7, 15, 17, 20, 39, 43, 47, 56, 63];
for (const [w, h] of [[1920, 1080], [1440, 900]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
  await page.goto(base, { waitUntil: "networkidle" });
  for (const n of pick) {
    await page.evaluate(n => { if (!MNEPresent.state.on) MNEPresent.start(n - 1); else MNEPresent.go(n - 1); }, n);
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${out}/present-${w}-${String(n).padStart(2, "0")}.png` });
  }
  await page.close();
}
const m = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await m.goto(base, { waitUntil: "networkidle" });
const H = await m.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < H; y += 800) { await m.evaluate(v => scrollTo({ top: v, behavior: "instant" }), y); await m.waitForTimeout(40); }
await m.evaluate(() => scrollTo({ top: 0, behavior: "instant" })); await m.waitForTimeout(400);
await m.screenshot({ path: `${out}/mobile-390-full.png`, fullPage: true });
await browser.close();
console.log("screenshots in " + out);
