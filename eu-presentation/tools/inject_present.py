"""Add presentation mode (v3/src/present.css + present.js) to a page built without it.

Usage (from eu-presentation/):  python3 tools/inject_present.py v3/index.v2.backup.html index.html
Inserts: the CSS before the first </style>, the "Present ▶" nav button, a guard at the top of
activeSection(), one line at the top of the page's keydown listener, and the script after the
content script. Fails loudly if an anchor is missing, so it never half-applies.
"""
import pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
src, dst = (pathlib.Path(a) for a in sys.argv[1:3])
h = src.read_text(encoding="utf-8")
assert "pz-open" not in h, "page already has presentation mode"
def rep(a, b):
    global h
    assert h.count(a) == 1, f"anchor not found once: {a[:60]!r}"
    h = h.replace(a, b)
css = (ROOT / "v3/src/present.css").read_text(encoding="utf-8")
js = (ROOT / "v3/src/present.js").read_text(encoding="utf-8")
assert "</script" not in js
i = h.index("</style>"); h = h[:i] + css + h[i:]
rep('    <a href="#contents" class="btn-soft">Contents</a>\n  </nav>',
    '    <button type="button" class="btn-soft pz-open" aria-label="Start presentation mode (P)" title="Presentation mode (P)">Present ▶</button>\n    <a href="#contents" class="btn-soft">Contents</a>\n  </nav>')
rep('function activeSection() { const mid = innerHeight * .5; let best = sections[0];',
    'function activeSection() { if (window.PZ && PZ.active) return sections[PZ.cur];   // presentation mode: the current slide, even when a tall slide is scrolled\n  const mid = innerHeight * .5; let best = sections[0];')
rep('addEventListener("keydown", e => {\n  if (e.ctrlKey || e.metaKey || e.altKey) return;\n  const k = e.key;',
    'addEventListener("keydown", e => {\n  if (window.PZ && PZ.key(e)) return;      // presentation mode (P) handles its keys first; this stays the page\'s only key listener\n  if (e.ctrlKey || e.metaKey || e.altKey) return;\n  const k = e.key;')
rep('</script>\n\n<!-- Data for every visual',
    '</script>\n\n<!-- Presentation mode: speaker notes (NOTES), build steps, HUD, overview, presenter view -->\n<script>' + js + '</script>\n\n<!-- Data for every visual')
dst.write_text(h, encoding="utf-8")
print(f"{dst}: presentation mode added ({len(css)} B CSS, {len(js)} B JS)")
