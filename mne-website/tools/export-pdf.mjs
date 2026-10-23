// Export the site as a 16:9 PDF, one page per presentation screen (vector text, live links).
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

const W = 1600, H = 900;
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, reducedMotion: "reduce" });
const errors = [];
page.on("pageerror", e => errors.push(e.message));
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
const pages = await page.evaluate(() => window.MNEPresent.buildDeck());
await page.waitForLoadState("networkidle");
await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));
await page.emulateMedia({ media: "screen" });
await page.pdf({ path: out, width: `${W}px`, height: `${H}px`, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await browser.close();
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`${out}: ${pages} pages`);
