// Export the deck as a PDF, one 1920×1080 page per slide (vector text, live links).
//   npm start            (in another terminal)
//   node tools/export-pdf.mjs [url] [out.pdf]
// Needs Playwright (npm i -D playwright, or a global install via PLAYWRIGHT_PATH).
import { createRequire } from "node:module";
import { resolve } from "node:path";

const url = process.argv[2] || "http://localhost:5173/";
const out = resolve(process.argv[3] || resolve(import.meta.dirname, "../dist/mne-website.pdf"));
const require = createRequire(import.meta.url);
let pw;
try { pw = require("playwright"); } catch { pw = require(process.env.PLAYWRIGHT_PATH || "/opt/node22/lib/node_modules/playwright"); }

const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, reducedMotion: "reduce" });
const errors = [];
page.on("pageerror", e => errors.push(e.message));
await page.goto(url, { waitUntil: "networkidle" });
const n = await page.evaluate(async () => {
  document.documentElement.classList.add("printing");
  document.querySelectorAll("img[loading=lazy]").forEach(i => (i.loading = "eager"));
  document.querySelectorAll("#deck > .slide").forEach(s => s.classList.add("is-in"));
  await document.fonts.ready;
  window.MNE?.drawLinks?.();
  await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
  return document.querySelectorAll("#deck > .slide").length;
});
await page.waitForTimeout(300);
await page.emulateMedia({ media: "screen" });
await page.pdf({ path: out, width: "1920px", height: "1080px", printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await browser.close();
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`${out}: ${n} slides`);
