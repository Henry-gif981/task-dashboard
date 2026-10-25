// Content check: paper v2 (PDF) ↔ website (DOM): the `full` text of every slide (speaker notes / reading
// mode), table cells in full, figure labels and references. Bullets (data-sum) are checked against `full`
// by scripts/verify-bullets.mjs.
//   npm start                                    (in another terminal)
//   node scripts/verify-content.mjs [paper.pdf] [url]
// Needs `pdftotext` (poppler-utils) and Playwright.
//
// Both texts are normalised (case, quotes, dashes, whitespace, words the PDF splits across lines,
// page numbers). Then, in both directions, every paragraph sentence, table cell and reference is
// looked up: MISSING = in the paper but not on the site; EXTRA = on the site (outside elements
// marked data-web, i.e. website additions) but not in the paper. Accepted differences are the
// corrections listed in content/ISSUES.md (#8–#10); they are applied to the paper text first.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const pdf = resolve(process.argv[2] || resolve(import.meta.dirname, "../reference/paper-v2.pdf"));
const url = process.argv[3] || "http://localhost:5173/";
if (!existsSync(pdf)) { console.error(`Paper not found: ${pdf}\nPut the PDF at reference/paper-v2.pdf or pass its path.`); process.exit(2); }
const require = createRequire(import.meta.url);
let pw;
try { pw = require("playwright"); } catch { pw = require(process.env.PLAYWRIGHT_PATH || "/opt/node22/lib/node_modules/playwright"); }

/* ---------------- accepted corrections (content/ISSUES.md #8–#10) */
const CORRECTIONS = [   // applied to the normalised (lower-case) paper text
  ["tax issues discussed in section 2.3.", "tax issues discussed in section 2.1.2."],
  ["summarized in table 8.", "summarized in table 1.5."],
  ["table 2.2 summarises these effects.", "table 2.1 summarises these effects."],
];
// table cells that the PDF splits across a page break (Table 1.5, row 1; checked on the page images)
const PAGE_SPLIT_CELLS = [
  ["access to large or growing consumer", "markets; avoiding trade barriers"],
  ["toyota and honda plants in emerging", "markets; coca-cola bottlers"],
];

const norm = s => s
  .replace(/[​­]/g, "")
  .replace(/[“”„]/g, '"').replace(/[‘’`]/g, "'").replace(/[–—−]/g, "-")
  .replace(/\s*-\s*\n\s*/g, "-")                     // hyphen at a line end
  .replace(/•/g, " ")
  .replace(/\s+/g, " ").trim().toLowerCase();

/* ---------------- paper text */
const raw = execFileSync("pdftotext", ["-raw", pdf, "-"], { encoding: "utf8" });
let paper = raw.split("\f").map((pg, i) => {
  if (i === 0) return pg.split("\n").map(l => l.trim()).filter(l => l && !/^-+$/.test(l)).join("\n§\n");   // cover: every line is a unit
  if (i === 1) return "";                            // p. 2: the paper's own, out-of-date table of contents
  let lines = pg.split("\n").filter(l => !/^\s*\d{1,2}\s*$/.test(l));   // page numbers
  if (i === 2) lines = lines.slice(lines.findIndex(l => /LIST OF ABBREVIATIONS/.test(l)));   // p. 3: drop the out-of-date list of tables
  // headings, bullet labels and captions are separate units (the PDF runs them into the next sentence)
  lines = lines.map(l => /^(\d\.\d(\.\d)?\.?\s|-\u200b|-\s|Figure \d|Table \d|CHAPTER|INTRODUCTION|CONCLUSION|\d\. [A-Z])/.test(l.trim()) ? "§\n" + l + "\n§" : l);
  return lines.join("\n");
}).join("\n");
// words the PDF breaks inside table cells
paper = paper.replace(/Resource-seeki\s*\n?\s*ng/g, "Resource-seeking").replace(/Efficiency-seek\s*\n?\s*ing/g, "Efficiency-seeking")
  .replace(/2020-presen\s*\n?\s*t/g, "2020-present").replace(/Strategic-asset-\s*\n\s*seeking/g, "Strategic-asset-seeking");
// split the paper into checkable units: body sentences (outside tables), table rows/cells, references
const refStart = paper.lastIndexOf("REFERENCES");
const refsText = paper.slice(refStart + "REFERENCES".length);
const bodyText = paper.slice(0, refStart);

// a URL that the PDF wraps continues on a line holding a single token
const joinUrls = t => t.replace(/(https?:\/\/\S+)\n(?!https?:)(\S+)(?=\n|$)/g, "$1$2");
const refs = joinUrls(refsText).split(/\n(?=[A-Z][^\n]{2,90}?\(\d{4}[a-c]?[,)])/).map(s => s.replace(/\n/g, " ").replace(/(https?:\S+)\s+(\S)/g, (m, u, n) => /[a-z0-9-]$/i.test(u) && !/^[A-Z]/.test(n) ? u + n : m)).map(s => s.trim()).filter(s => s.length > 30);

let bodyNorm = norm(bodyText)
  .replace(/ : /g, ": ")
  // Table 2.1 repeats its header row after the page break (p. 22)
  .replace("tax-base erosion through profit shifting positive impacts negative impacts host country", "tax-base erosion through profit shifting host country")
  // Table 1.5, row 1 is split by the page break (p. 14–15): rebuild the cells
  .replace("access to large or growing consumer market size, income growth, tariffs, local competition toyota and honda plants in emerging markets; avoiding trade barriers markets; coca-cola bottlers",
    "access to large or growing consumer markets; avoiding trade barriers market size, income growth, tariffs, local competition toyota and honda plants in emerging markets; coca-cola bottlers");
for (const [a, b] of CORRECTIONS) bodyNorm = bodyNorm.replace(a, b);
const sentences = bodyNorm.split(/\s*§\s*|(?<=[.;:?])\s+(?=[a-z0-9("'])/).map(s => s.replace(/^-\s*/, "").trim()).filter(s => s.split(" ").length >= 2);

/* ---------------- site text */
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(url, { waitUntil: "networkidle" });
const site = await page.evaluate(() => {
  const deck = document.getElementById("deck").cloneNode(true);
  deck.querySelectorAll("br").forEach(b => b.replaceWith(" "));
  deck.querySelectorAll("[data-fig]").forEach(e => e.remove());   // figure labels: images in the PDF, checked separately
  // slides show bullets (data-sum: written for the slide); the paper's text is in the notes (full) and full table cells
  deck.querySelectorAll("[data-sum]").forEach(e => e.remove());
  deck.querySelectorAll("[data-web], .pno, .ctag, .emblem, .dot, .bg, script, [aria-hidden='true'], .sr-only, .irnote").forEach(e => e.remove());
  // block elements → line breaks, so cells do not run together
  deck.querySelectorAll("p, li, td, th, h1, h2, h3, h4, h5, dt, dd, caption, figcaption, blockquote, div, span, b, i, a").forEach(e => { if (e.closest("p, li, td, th, dd, figcaption, caption, blockquote") === e || !e.closest("p, li, td, th, dd, figcaption, caption, blockquote")) e.append("\n"); });
  const refs = [...document.querySelectorAll(".refs li")].map(li => li.textContent);
  const cells = [...document.querySelectorAll("#deck table td, #deck table th, #deck .abbr dt, #deck .abbr dd")].filter(e => !e.closest("[data-web]")).map(e => { const c = e.cloneNode(true); c.querySelectorAll("[data-web], [data-sum]").forEach(x => x.remove()); return c.textContent; });
  const figs = [...document.querySelectorAll("[data-fig]")].map(f => { const c = f.cloneNode(true); c.querySelectorAll("br").forEach(b => b.replaceWith(" ")); c.querySelectorAll("*").forEach(e => e.append("\n")); return c.textContent; }).join("\n");
  return { text: deck.textContent, refs, cells, figs };
});
await browser.close();

const siteNorm = norm(site.text);
const grams = (s, n = 4) => { const w = s.split(" "), g = new Set(); for (let i = 0; i + n <= w.length; i++) g.add(w.slice(i, i + n).join(" ")); return g; };
const siteGrams = grams(siteNorm.replace(/[^\p{L}\p{N}%$.,'"()/&+-]+/gu, " "));
let paperNorm = bodyNorm + " " + norm(joinUrls(refsText));
for (const [a, b] of PAGE_SPLIT_CELLS) paperNorm += ` ${a} ${b} `;
const paperGrams = grams(paperNorm.replace(/[^\p{L}\p{N}%$.,'"()/&+-]+/gu, " "));
const cover = (s, set) => {
  const g = [...grams(s.replace(/[^\p{L}\p{N}%$.,'"()/&+-]+/gu, " "))];
  if (!g.length) return set === siteGrams ? (siteNorm.includes(s) ? 1 : 0) : (paperNorm.includes(s) ? 1 : 0);
  return g.filter(x => set.has(x)).length / g.length;
};

/* ---------------- 1. paper → site (MISSING) */
const missing = [];
// a sentence counts as present when ≥ 85% of its 4-word sequences are on the site (headings that the
// PDF runs into the next sentence and cells of the same table row only change the boundary sequences)
for (const s of sentences) if (!siteNorm.includes(s) && cover(s, siteGrams) < .85) missing.push(s);
const refMissing = refs.filter(r => !site.refs.some(x => norm(x) === norm(r)));

/* ---------------- 2. site → paper (EXTRA) */
const siteUnits = site.text.split(/\n+/).map(norm).filter(s => s.split(" ").length >= 3);
const extra = [...new Set(siteUnits.filter(s => !paperNorm.includes(s) && cover(s, paperGrams) < .9))];
const cellsExtra = [...new Set(site.cells.map(norm).filter(c => c && !paperNorm.includes(c) && cover(c, paperGrams) < .9))];
const refExtra = site.refs.filter(x => !refs.some(r => norm(x) === norm(r)));

/* ---------------- report */
const show = (title, list) => { console.log(`\n${title}: ${list.length}`); list.slice(0, 40).forEach(s => console.log("  · " + s.slice(0, 170))); };
console.log(`Paper: ${sentences.length} sentences and table cells, ${refs.length} references · Site: ${siteUnits.length} text blocks, ${site.cells.length} table cells, ${site.refs.length} references`);
console.log(`Accepted corrections (ISSUES.md #8–#10): ${CORRECTIONS.length}`);
show("MISSING on the site (paper text not found)", missing);
show("MISSING references", refMissing);
show("EXTRA on the site (not in the paper, outside data-web)", extra);
show("EXTRA table cells", cellsExtra);
show("EXTRA references", refExtra);
const figLabels = site.figs.split(/\n+/).map(s => s.trim()).filter(Boolean);
console.log(`\nFigure labels redrawn from the PDF images (Figures 1.1–1.3, 2.1–2.2, not in the PDF text layer; compared by eye with the page images): ${figLabels.length}`);
const bad = missing.length + refMissing.length + extra.length + cellsExtra.length + refExtra.length;
console.log(bad ? `\n${bad} difference(s)` : "\nContent matches the paper (apart from the corrections in ISSUES.md)");
process.exit(bad ? 1 : 0);
