// Screenshot every slide at 1920×1080 (all bullets shown, as in print) → test-results/slides/NN-id.png
//   node tools/shots.mjs [url] [--only=id,id]
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
const args = process.argv.slice(2);
const url = (args.find(a => !a.startsWith("--")) || "http://localhost:5173/").replace(/#.*$/, "");
const only = (args.find(a => a.startsWith("--only=")) || "").slice(7).split(",").filter(Boolean);
const out = resolve(import.meta.dirname, "../test-results/slides");
mkdirSync(out, { recursive: true });
const require = createRequire(import.meta.url);
let pw;
try { pw = require("playwright"); } catch { pw = require(process.env.PLAYWRIGHT_PATH || "/opt/node22/lib/node_modules/playwright"); }
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, reducedMotion: "reduce" });
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(() => { document.documentElement.classList.add("printing"); window.MNE.reflow(); window.MNE.drawLinks(); });
await page.evaluate(() => document.fonts.ready);
const ids = await page.evaluate(() => [...document.querySelectorAll("#deck > .slide")].map(s => s.id));
let n = 0;
for (const [i, id] of ids.entries()) {
  if (only.length && !only.includes(id)) continue;
  const el = await page.$(`#deck > .slide:nth-child(${i + 1})`);
  await el.scrollIntoViewIfNeeded();
  await el.screenshot({ path: `${out}/${String(i + 1).padStart(2, "0")}-${id}.png` });
  n++;
}
await browser.close();
console.log(`${n} slide screenshots in ${out}`);
