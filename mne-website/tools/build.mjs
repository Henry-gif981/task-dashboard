// Build index.html from the single content source.
//   node tools/build.mjs            (writes index.html)
//   node tools/build.mjs --check    (exit 1 if index.html is out of date)
//
// content/deck.json   every slide in order: id, classes, attributes, `bullets` (what the slide shows)
//                     and `full` (the paper's text, verbatim, shown in the speaker notes and in
//                     reading mode)
// content/slides/<id>.html   the slide's layout (tables, figures, cards); prose is never written here:
//                     {{b:key}}            → bullet list `bullets[key]` (one reveal step per bullet)
//                     {{b:key|nostep}}     → same, without reveal steps (bullets inside a card)
//                     {{b:key|cls=plus}}   → extra class on the list (plus / minus ledgers)
//                     {{b:key|nomorph}}    → no data-morph on the list (default: data-morph="key"
//                                            for p-a, p-b, p-c)
//                     {{lede:key}}         → one-line summary `bullets[key][0]` in a <p class="lede">
// content/shell.html  the page around the slides (<head>, nav, footer); <!--SLIDES--> marks the deck.
//
// Bullet markup: **bold**, inline HTML allowed (<i>, <a>, &amp;). An item is a string or
// { "t": "…", "morph": "key", "sub": ["…", …] } (one sub-level, at most 3 children).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const dir = resolve(import.meta.dirname, "..");
const deck = JSON.parse(readFileSync(resolve(dir, "content/deck.json"), "utf8"));
const shell = readFileSync(resolve(dir, "content/shell.html"), "utf8");

const esc = s => String(s).replace(/&(?![a-z]+;|#\d+;)/g, "&amp;");
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
const attr = v => String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const MORPH_DEFAULT = new Set(["p-a", "p-b", "p-c"]);

function list(slide, key, opts) {
  const items = slide.bullets?.[key];
  if (!items) throw new Error(`${slide.id}: no bullets["${key}"]`);
  const step = !opts.has("nostep");
  const cls = ["bl", ...[...opts].filter(o => o.startsWith("cls=")).map(o => o.slice(4))].join(" ");
  const morph = !opts.has("nomorph") && MORPH_DEFAULT.has(key) ? ` data-morph="${key}"` : "";
  const li = items.map(it => {
    const o = typeof it === "string" ? { t: it } : it;
    const sub = o.sub ? `<ul class="bl2">${o.sub.map(s => `<li>${md(s)}</li>`).join("")}</ul>` : "";
    return `<li${step ? " data-step" : ""}${o.morph ? ` data-morph="${o.morph}"` : ""}>${md(o.t)}${sub}</li>`;
  }).join("\n      ");
  return `<ul class="${cls}" data-sum${morph}>\n      ${li}\n    </ul>`;
}

function render(slide) {
  const file = resolve(dir, "content/slides", slide.id + ".html");
  if (!existsSync(file)) throw new Error(`missing ${file}`);
  let html = readFileSync(file, "utf8").trim();
  html = html.replace(/\{\{(b|lede):([\w-]+)((?:\|[\w=-]+)*)\}\}/g, (m, kind, key, rest) => {
    const opts = new Set(rest.split("|").filter(Boolean));
    if (kind === "lede") {
      const t = slide.bullets?.[key]?.[0];
      if (!t) throw new Error(`${slide.id}: no lede bullets["${key}"]`);
      return `<p class="lede" data-sum${opts.has("nomorph") ? "" : ` data-morph="${key}"`}>${md(t)}</p>`;
    }
    return list(slide, key, opts);
  });
  const left = html.match(/\{\{[^}]*\}\}/);
  if (left) throw new Error(`${slide.id}: unknown placeholder ${left[0]}`);
  const attrs = Object.entries(slide.attrs || {}).map(([k, v]) => v === true ? ` ${k}` : ` ${k}="${attr(v)}"`).join("");
  const cls = ["slide", ...(slide.class ? slide.class.split(" ") : [])].join(" ");
  const notes = (slide.full || []).length
    ? `\n  <aside class="notes" aria-label="Full text (speaker notes)">\n    ${slide.full.map(p => `<p>${p}</p>`).join("\n    ")}\n  </aside>`
    : "";
  return `<section class="${cls}" id="${slide.id}"${attrs}>\n  ${html}${notes}\n</section>`;
}

const out = shell.replace("<!--SLIDES-->", deck.slides.map(render).join("\n\n"));
const target = resolve(dir, "index.html");
if (process.argv.includes("--check")) {
  const same = existsSync(target) && readFileSync(target, "utf8") === out;
  console.log(same ? "index.html is up to date" : "index.html is out of date: run node tools/build.mjs");
  process.exit(same ? 0 : 1);
}
writeFileSync(target, out);
console.log(`index.html: ${deck.slides.length} slides from content/deck.json`);
