#!/usr/bin/env python3
"""Build the v4 page (engraving theme) from the v3b source.

    python3 v4/build_v4.py            (from eu-presentation/)

Input : index.html (v3b source: v2b visuals + presentation mode)
        v4/src/theme.css, v4/src/enhance.js, v4/src/source_urls.json, v4/art/*.svg
Output: v4/EU_presentation_v4.html (standalone: fonts and drawings inline, no network)

The text of the report is not touched; only styles, the top bar, the drawings,
source links, the references layout and an appendix are added.
"""
import base64, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
V4 = ROOT / "v4"
SRC = ROOT / "index.html"
OUT = V4 / "EU_presentation_v4.html"
FONTS = Path("/usr/share/fonts/truetype/liberation")
C = "#2B35D6"

# slides of the PDF per section (the numbering of the 73-slide deck; scripts/export_slides.mjs uses the same list)
ALLOC = [("home", 1), ("contents", 1), ("introduction", 1), ("ch1", 1), ("c1-concept", 1), ("c1-levels", 2), ("c1-model", 1),
         ("c1-history", 2), ("c1-institutions", 2), ("c1-principles", 2), ("ch2", 1), ("c2-economic", 2), ("c2-economic-b", 2),
         ("c2-political", 1), ("c2-waves", 2), ("c2-trade", 3), ("c2-trade-balance", 1), ("c2-agreements", 3), ("c2-governance", 2),
         ("c2-development", 1), ("c2-standards", 3), ("c2-climate", 2), ("ch3", 1), ("c3-numbers", 1), ("c3-milestones", 2),
         ("c3-importance", 2), ("c3-frameworks", 2), ("c3-evfta", 2), ("c3-evipa", 1), ("c3-trade", 2), ("c3-trade-vn", 1),
         ("c3-structure", 1), ("c3-investment", 3), ("c3-reform", 3), ("c3-broader", 1), ("c3-standards", 2), ("c3-cooperation", 1),
         ("c3-green", 2), ("c3-opportunities", 1), ("c3-challenges", 1), ("c3-recommendations", 3), ("conclusion", 1),
         ("references", 2), ("qa", 1)]


def pages():
    out, p = {}, 1
    for sid, n in ALLOC:
        out[sid] = [p, n]
        p += n
    return out, p - 1


def font_faces():
    css = []
    for file, weight, style in [("Regular", 400, "normal"), ("Bold", 700, "normal"), ("Italic", 400, "italic"), ("BoldItalic", 700, "italic")]:
        data = base64.b64encode((FONTS / f"LiberationSerif-{file}.ttf").read_bytes()).decode()
        local = {"Regular": 'local("Times New Roman"), local("TimesNewRomanPSMT")',
                 "Bold": 'local("Times New Roman Bold"), local("TimesNewRomanPS-BoldMT")',
                 "Italic": 'local("Times New Roman Italic"), local("TimesNewRomanPS-ItalicMT")',
                 "BoldItalic": 'local("Times New Roman Bold Italic"), local("TimesNewRomanPS-BoldItalicMT")'}[file]
        # the family is called "Times New Roman": the real font is used where installed, otherwise the
        # embedded Liberation Serif (metric-compatible with Times New Roman, SIL Open Font License)
        css.append(f'@font-face {{ font-family: "Times New Roman"; font-weight: {weight}; font-style: {style}; font-display: block; '
                   f'src: {local}, url(data:font/ttf;base64,{data}) format("truetype"); }}')
    return "\n".join(css)


def sprite():
    defs = [f'<pattern id="v4-hatch" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#FFFFFF"/>'
            f'<path d="M-2 2l4-4M0 8l8-8M6 10l4-4" stroke="{C}" stroke-width="1.6"/></pattern>',
            f'<pattern id="v4-dots" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#FFFFFF"/>'
            f'<circle cx="3.5" cy="3.5" r="1.25" fill="{C}"/></pattern>']
    syms = []
    names = ["frame_cover", "frame_ch1", "frame_ch2", "frame_ch3", "band_ch1", "band_ch2", "band_ch3", "band_end",
             "corner_ch1", "corner_ch2", "corner_ch3", "organic_curve", "monogram_g4"]
    for n in names:
        f = V4 / "art" / f"{n}.svg"
        sid = "art-" + {"frame_cover": "frame-cover", "organic_curve": "organic", "monogram_g4": "monogram"}.get(n, n.replace("_", "-"))
        if not f.exists():
            print("  missing drawing:", f.name, file=sys.stderr)
            syms.append(f'<symbol id="{sid}" viewBox="0 0 10 10"></symbol>')
            continue
        s = f.read_text(encoding="utf-8")
        s = re.sub(r"<\?xml[^>]*>|<!--.*?-->", "", s, flags=re.S).strip()
        m = re.match(r"<svg\b([^>]*)>(.*)</svg>\s*$", s, flags=re.S)
        vb = re.search(r'viewBox="([^"]+)"', m.group(1)).group(1)
        body = m.group(2)
        # ids inside a drawing (clip paths, patterns) must stay unique in the page
        body = re.sub(r'id="([^"]+)"', lambda k: f'id="{sid}-{k.group(1)}"', body)
        body = re.sub(r'url\(#([^)]+)\)', lambda k: f'url(#{sid}-{k.group(1)})', body)
        body = re.sub(r'href="#([^"]+)"', lambda k: f'href="#{sid}-{k.group(1)}"', body)
        syms.append(f'<symbol id="{sid}" viewBox="{vb}">{body}</symbol>')
    return (f'<svg id="v4-sprite" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">'
            f'<defs>{"".join(defs)}</defs>{"".join(syms)}</svg>')


NAV = """<header class="nav" id="nav">
  <nav class="nav-links" id="nav-links" aria-label="Chapters">
    <a href="#contents">Contents</a>
    <a href="#ch1">Chapter 1</a>
    <a href="#ch2">Chapter 2</a>
    <a href="#ch3">Chapter 3</a>
    <a href="#references">References</a>
  </nav>
  <a href="#home" class="brand" aria-label="Group 4: back to the cover"><svg viewBox="0 0 120 120" role="img" aria-label="Monogram G4"><use href="#art-monogram"/></svg><svg style="display:none" aria-hidden="true"><g id="mini-ring"></g></svg></a>
  <div class="nav-right">
    <span class="pageno">1 / 73</span>
    <button type="button" class="btn-soft pz-open" aria-label="Start presentation mode (P)" title="Presentation mode (P)">Present <svg viewBox="0 0 10 10" width="9" height="9" aria-hidden="true"><path d="M2 1l7 4-7 4z" fill="currentColor"/></svg></button>
    <button class="nav-toggle" type="button" aria-label="Menu" aria-expanded="false" aria-controls="nav-links"><span></span></button>
  </div>
</header>"""


def main():
    html = SRC.read_text(encoding="utf-8")
    n0 = len(html)
    # fonts: drop the Inter / Source Serif faces, add Times New Roman (embedded Liberation Serif)
    html, k = re.subn(r"^@font-face \{ font-family: '(?:Inter|Source Serif 4)';[^\n]*\n", "", html, flags=re.M)
    assert k >= 6, k
    # chart palette: one ink colour; gold stays as a marker that enhance.js turns into hatching
    html, k = re.subn(r'const K = \{ blue: "#003399", gold: "#FFCC00", navy: "#001A57", grid: "#E3E9F4", axis: "#4A5A78", ink: "#0B1B3A", tint: "#E8EEF9", tint2: "#F4F7FC", line: "#D3DCEC", white: "#FFFFFF" \};',
                      f'const K = {{ blue: "{C}", gold: "#FFCC00", navy: "{C}", grid: "#D5D7F7", axis: "{C}", ink: "{C}", tint: "#E5E6FA", tint2: "#F1F1FC", line: "#B8BCF2", white: "#FFFFFF" }};', html)
    assert k == 1
    # no 3D scene
    html, k = re.subn(r'<script src="vendor/three\.min\.js"></script>\n?', "", html)
    assert k == 1
    # top bar
    html, k = re.subn(r'<header class="nav" id="nav">.*?</header>', NAV, html, count=1, flags=re.S)
    assert k == 1
    pg, total = pages()
    assert total == 73, total
    urls = json.loads((V4 / "src" / "source_urls.json").read_text(encoding="utf-8"))
    data = json.dumps({"urls": [{k2: u.get(k2) for k2 in ("key", "source", "url", "title", "status")} for u in urls], "pages": pg, "total": total}, ensure_ascii=False)
    theme = (V4 / "src" / "theme.css").read_text(encoding="utf-8")
    enhance = (V4 / "src" / "enhance.js").read_text(encoding="utf-8")
    html = html.replace("</head>", f"<style id=\"v4-fonts\">\n{font_faces()}\n</style>\n<style id=\"v4-theme\">\n{theme}\n</style>\n</head>", 1)
    html = re.sub(r"(<body[^>]*>)", lambda m: m.group(1) + "\n" + sprite(), html, count=1)
    tail = f'\n<script type="application/json" id="v4-data">{data}</script>\n<script id="v4-enhance">\n{enhance}\n</script>'
    html, k = re.subn(r"</footer>", lambda m: m.group(0) + tail, html, count=1)
    assert k == 1
    OUT.write_text(html, encoding="utf-8")
    print(f"{OUT.relative_to(ROOT)}: {len(html) // 1024} KB (source {n0 // 1024} KB); pages {total}")


if __name__ == "__main__":
    main()
