#!/usr/bin/env python3
"""Update the v3b page (index.html = v3b source) as asked on 19 Oct 2026, then rebuild the standalone.

    python3 v3b/update_v3b.py          (from eu-presentation/; runs once, refuses a second run)

1. References: URL on its own line, breaks only after "/" or "-" (no more words cut in the middle).
2. Source links: v3b/src/sources.js + v3b/src/source_urls.json (source names become links).
3. Headings 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 3.4 above 1.1.1, 1.2.1, 2.1.1a, 2.2.1a, 3.1.1, 3.2.1a, 3.4.1.
4. "View data" panels: v3b/src/viewdata.js (full details, calculations, status key).
Backups: v3b/index.v3b-before-update.backup.html, v3b/EU_presentation_standalone_v3b.backup.html.
"""
import html as H, json, re, shutil, subprocess, sys
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent.parent
V = ROOT / "v3b"
SRC = ROOT / "index.html"
page = SRC.read_text(encoding="utf-8")
if 'id="src-urls"' in page:
    sys.exit("index.html already updated")
shutil.copy(SRC, V / "index.v3b-before-update.backup.html")
shutil.copy(V / "EU_presentation_standalone_v3b.html", V / "EU_presentation_standalone_v3b.backup.html")


def sub1(pat, repl, s, flags=0, count=1):
    out, k = re.subn(pat, repl, s, count=count, flags=flags)
    assert k == (count or k) and k, pat
    return out


# ---- 3. part headings ------------------------------------------------------------------
PARTS = [("c1-concept", "1.1.1", "s1-1", "1.1", "Theoretical basis of regional economic integration"),
         ("c1-history", "1.2.1", "s1-2", "1.2", "Overview of the European Union"),
         ("c2-economic", "2.1.1a", "s2-1", "2.1", "The EU in Regional Integration"),
         ("c2-trade", "2.2.1a", "s2-2", "2.2", "The EU in Global Integration"),
         ("c3-milestones", "3.1.1", "s3-1", "3.1", "Overview of Vietnam–EU relations"),
         ("c3-trade", "3.2.1a", "s3-2", "3.2", "The EU’s economic influence on Vietnam"),
         ("c3-opportunities", "3.4.1", "s3-4", "3.4", "Opportunities, challenges and policy recommendations")]
for sec, eb, pid, no, title in PARTS:
    m = re.search(rf'<section[^>]*id="{sec}".*?</section>', page, re.S)
    body = m.group(0)
    new = sub1(rf'(\n(\s*)<p class="eyebrow rv">{re.escape(eb)}</p>\n\s*<h2 class="h rv")',
               lambda k: f'\n{k.group(2)}<p class="part-h rv" id="{pid}" role="heading" aria-level="2"><span class="no">{no}</span><span class="tt">{H.escape(title)}</span></p>' + k.group(1).replace('<h2 class="h rv"', '<h2 aria-level="3" class="h rv"'), body)
    page = page.replace(body, new)
    # contents: the chapter-part entry points at the new heading
    page = sub1(rf'<a class="toc-l2" href="#{sec}">{re.escape(no)} ', f'<a class="toc-l2" href="#{pid}">{no} ', page)

# presentation mode: the part heading belongs to the title block of the slide
page = sub1(r'if \(el\.matches\("\.eyebrow, \.h, h1, h2"\)', 'if (el.matches(".part-h, .eyebrow, .h, h1, h2")', page)
page = sub1(r'el\.querySelector\(":scope > \.eyebrow, :scope > \.h"\)', 'el.querySelector(":scope > .part-h, :scope > .eyebrow, :scope > .h")', page)

# ---- 1. references -----------------------------------------------------------------------
def ref_link(m):
    href, text = m.group(1), H.unescape(m.group(2))
    shown = unquote(text)
    shown = H.escape(shown).replace("/", "/<wbr>").replace("-", "-<wbr>").replace("/<wbr>/<wbr>", "//")
    return f'<a class="ref-url" href="{href}" target="_blank" rel="noopener">{shown}</a>'
refs = re.search(r'<ul class="refs mt">.*?</ul>', page, re.S).group(0)
page = page.replace(refs, re.sub(r'<a href="([^"]+)" rel="noopener">([^<]+)</a>', ref_link, refs))

# ---- 4. view data ---------------------------------------------------------------------------
vd = (V / "src" / "viewdata.js").read_text(encoding="utf-8")
page = sub1(r'  function fillTable\(root, tb\) \{\n.*?\n  \}\n', lambda m: vd, page, flags=re.S)
page = sub1(r'fillTable\(root, out\.table\)', 'fillTable(root, out.table, s)', page)

# ---- 2. source links (after the visuals script, so the View data panels exist) ----------------
urls = json.loads((V / "src" / "source_urls.json").read_text(encoding="utf-8"))
js = (V / "src" / "sources.js").read_text(encoding="utf-8")
block = (f'<script type="application/json" id="src-urls">{json.dumps(urls, ensure_ascii=False)}</script>\n'
         f'<script id="source-links">\n{js}</script>\n\n')
page = sub1(r'(<!-- Three\.js: local copy)', lambda m: block + m.group(1), page)

# ---- CSS ---------------------------------------------------------------------------------------
CSS = """
/* ===== v3b update (19 Oct 2026): part headings, source links, references, View data ===== */
.part-h { display: flex; align-items: baseline; gap: 14px; margin: 0 0 var(--s3); padding-bottom: 12px; border-bottom: 1px solid var(--line); font: 600 clamp(1.05rem, 1.25vw, 1.45rem)/1.3 var(--serif); color: var(--blue); max-width: 62ch; }
.part-h .no { flex: none; font: 700 .74rem/1 var(--sans); letter-spacing: .04em; color: var(--navy); background: var(--gold); padding: 6px 9px; border-radius: 2px; }
.part-h + .eyebrow { margin-top: 0; }
a.srcl { color: var(--blue); text-decoration: underline; text-decoration-color: rgba(0,51,153,.35); text-underline-offset: 2px; }
a.srcl:hover, a.srcl:focus-visible { text-decoration-color: var(--gold); text-decoration-thickness: 2px; }
a.srcl .ext { width: .72em; height: .72em; margin-left: 2px; vertical-align: baseline; }
a.srcl.more { text-decoration: none; font-style: normal; }
.dark a.srcl, .takeaway a.srcl { color: var(--on-dark); text-decoration-color: rgba(255,255,255,.5); }
.refs li { overflow-wrap: break-word; word-break: normal; hyphens: none; }
.refs a.ref-url { display: block; text-indent: 0; margin-top: 2px; font-size: .9em; overflow-wrap: normal; word-break: normal; }
.vd-sheet { border: 1px solid var(--line); border-top: 3px solid var(--blue); background: var(--white); padding: var(--s2) var(--s2) var(--s1); margin-top: var(--s1); font-size: .8rem; color: var(--ink); }
.vd-meta { display: grid; grid-template-columns: minmax(110px, auto) 1fr; gap: 6px var(--s2); margin-bottom: var(--s2); line-height: 1.5; }
.vd-meta dt { font: 600 .7rem/1.6 var(--sans); letter-spacing: .05em; text-transform: uppercase; color: var(--ink-2); }
.vd-meta dd ul { padding-left: 18px; }
.vd-h { font: 700 .78rem/1.3 var(--sans); color: var(--navy); margin: var(--s2) 0 6px; }
.vd-h span { font-weight: 400; color: var(--ink-2); }
.vz-table .vd-sheet table caption { caption-side: top; text-align: left; font: italic .72rem/1.4 var(--sans); color: var(--ink-2); padding-bottom: 4px; }
.vz-table .vd-sheet table { font-size: .78rem; }
.vd-tw { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.vd-tw table { min-width: 480px; }
.vd-key { margin-top: var(--s2); font-size: .74rem; color: var(--ink-2); line-height: 1.5; }
.vd-key i { font-style: normal; font-weight: 600; color: var(--ink); }
@media (max-width: 640px) { .vd-meta { grid-template-columns: 1fr; gap: 2px; } .vd-meta dd { margin-bottom: 8px; } }
@media print { a.srcl .ext { display: none; } .part-h .no { background: none; border: 1px solid var(--blue); } }
"""
page = sub1(r'(</style>)', lambda m: CSS + m.group(1), page)

SRC.write_text(page, encoding="utf-8")
print("index.html updated:", len(page) // 1024, "KB")
subprocess.run([sys.executable, str(ROOT / "tools" / "build_standalone.py"), str(V / "EU_presentation_standalone_v3b.html")], check=True, cwd=ROOT)
