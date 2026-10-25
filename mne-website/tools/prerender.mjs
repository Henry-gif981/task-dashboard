// Pre-render the heavy engravings (SVG with thousands of hatching paths) to 2× WebP with alpha.
// Rasterising them at the start of a transition cost up to 0.8 s in software (PERF.md); an image
// layer is decoded once and then only moved by the compositor. Text, tables and charts stay vector.
//   node tools/prerender.mjs [url]   (server running: npm start; needs python3 + Pillow for the WebP encode)
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { mkdirSync, rmSync } from "node:fs";
const require = createRequire(import.meta.url);
let pw;
try { pw = require("playwright"); } catch { pw = require(process.env.PLAYWRIGHT_PATH || "/opt/node22/lib/node_modules/playwright"); }
const base = (process.argv[2] || "http://localhost:5173/").replace(/#.*$/, "");
const dir = resolve(import.meta.dirname, "../assets/img");
// name → largest width on the 1920 stage (rendered at 2×)
const ART = { globe: 640, ship: 760, port: 820, scale: 580, factory: 660, "trade-map": 1000, telescope: 580, chain: 660 };
const tmp = resolve(import.meta.dirname, "../test-results/prerender");
mkdirSync(tmp, { recursive: true });
const browser = await pw.chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 2200, height: 1400 } });
for (const [name, w] of Object.entries(ART)) {
  await page.goto(base + "assets/img/favicon.svg").catch(() => {});
  await page.goto(base + "README.md");
  await page.setContent(`<body style="margin:0;background:transparent"><img id="i" src="${base}assets/img/${name}.svg" style="display:block;width:${w}px;height:auto"></body>`);
  await page.waitForFunction(() => { const i = document.getElementById("i"); return i.complete && i.naturalWidth > 0; });
  const png = resolve(tmp, name + ".png");
  await (await page.$("#i")).screenshot({ path: png, omitBackground: true });
  execFileSync("python3", ["-c", `from PIL import Image; im=Image.open(${JSON.stringify(png)}); im.save(${JSON.stringify(resolve(dir, name + ".webp"))}, "WEBP", quality=84, method=6)`]);
  console.log(name + ".webp", w * 2 + "px");
}
await browser.close();
rmSync(tmp, { recursive: true, force: true });
