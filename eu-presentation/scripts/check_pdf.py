"""Check the exported PDFs against the web page.

Usage (from eu-presentation/, after `node scripts/export_pdf.mjs`):
    python3 scripts/check_pdf.py            -> prints the report, exit 1 on missing text
Needs poppler-utils (pdfinfo, pdftotext, pdffonts) and pypdf.

Text comparison: every line of the page's on-screen text (pdf/reference_text.json, written by
the export script) must appear in the PDF text. Whitespace is ignored on both sides (PDF line
wrapping, letter spacing) and case is ignored (small caps). Table rows are split into cells.
Lines that belong only to on-screen controls (navigation, buttons) are listed separately.
Extra text: PDF lines that are not part of the page text (other than the page footer).
"""
import json, re, subprocess, sys, unicodedata
from pathlib import Path
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent.parent
PDF_DIR = ROOT / "pdf"
FILES = ["EU_presentation.pdf", "EU_presentation_A4.pdf"]
FOOTER = "Student presentation by Group 4, National Economics University. Not an official publication of the European Union."


def norm(s):
    # pdftotext joins a word split at a line-end hyphen ("non-" + "member" -> "nonmember"),
    # so hyphens are dropped on both sides before comparing
    s = unicodedata.normalize("NFKC", s).replace("­", "").lower()
    return re.sub(r"[\s\-‐‑]+", "", s)


def words(s):
    return re.findall(r"\w+", unicodedata.normalize("NFKC", s).lower().replace("-", ""))


def run(*args):
    return subprocess.run(args, capture_output=True, text=True, check=True).stdout


HTML = (ROOT / "index.html").read_text(encoding="utf-8")


def count_outline(o):
    return sum(count_outline(x) if isinstance(x, list) else 1 for x in o)


ref = json.loads((PDF_DIR / "reference_text.json").read_text(encoding="utf-8"))
ui = set()
for t in ref["uiOnly"]:
    ui.update(l.strip() for l in t.split("\n") if l.strip())
lines = []
for l in ref["screen"].split("\n"):
    for cell in l.split("\t"):
        cell = cell.strip()
        if cell:
            lines.append(cell)
ref_all = norm(" ".join(lines))
ref_words = set(words(" ".join(lines)))
ok = True
out = []
for name in FILES:
    pdf = PDF_DIR / name
    info = run("pdfinfo", str(pdf))
    pages = int(re.search(r"Pages:\s+(\d+)", info).group(1))
    size = re.search(r"Page size:\s+(.+)", info).group(1).strip()
    text = run("pdftotext", "-enc", "UTF-8", str(pdf), "-")
    t = norm(text)
    missing, ui_missing = [], []
    for l in lines:
        if norm(l) in t:
            continue
        (ui_missing if l in ui else missing).append(l)
    refs_missing = [r for r in ref["references"] if norm(r) not in t]
    extra, reordered = [], 0
    for l in text.split("\n"):
        l = l.strip()
        if not l or norm(l) in ref_all or norm(l) in norm(FOOTER) or re.fullmatch(r"\d+\s*/\s*\d+", l):
            continue
        if all(w in ref_words for w in words(l)):
            reordered += 1          # page words read in another order (columns, chart labels)
        else:
            extra.append(l)
    # links
    reader = PdfReader(str(pdf))
    uri, internal = [], 0
    for p in reader.pages:
        for a in p.get("/Annots") or []:
            a = a.get_object()
            if a.get("/Subtype") != "/Link":
                continue
            act = a.get("/A")
            if act and act.get_object().get("/URI"):
                uri.append(str(act.get_object()["/URI"]))
            elif a.get("/Dest") is not None or (act and act.get_object().get("/S") == "/GoTo"):
                internal += 1
    outline = len(reader.outline)
    # table of contents: each internal link must land on the page that holds its section title
    toc = re.findall(r'<a (?:class="[^"]*" )?href="#([^"]+)"(?: class="[^"]*")?>([^<]+)</a>', HTML[HTML.index('class="toc'):HTML.index('</nav>', HTML.index('class="toc'))])
    page_text = [norm(pg) for pg in text.split("\f")]
    toc_links = []
    for i, p in enumerate(reader.pages[:6]):
        for a in p.get("/Annots") or []:
            a = a.get_object()
            if a.get("/Subtype") == "/Link" and a.get("/Dest") is not None:
                d = a["/Dest"]
                d = reader.named_destinations[str(d)] if not isinstance(d, list) and str(d) in reader.named_destinations else d
                pg = reader.get_destination_page_number(d) if not isinstance(d, list) else reader.get_page_number(d[0].get_object())
                toc_links.append(pg)
    # a section entry (1.1, 2.1 ...) points at its first subsection: it must land on the same page
    title_ok = lambda label, pg: norm(re.sub(r"^(\d+(\.\d+)*|Supplement:)\s*", "", label).split(":")[-1]) in page_text[pg]
    toc_ok = sum(1 for k, ((hid, label), pg) in enumerate(zip(toc, toc_links))
                 if title_ok(label, pg) or (k + 1 < len(toc) and toc[k + 1][0] == hid and toc_links[k + 1] == pg))
    fonts = run("pdffonts", str(pdf)).splitlines()[2:]
    not_embedded = [f for f in fonts if f.split()[-5] != "yes"]
    families = sorted({re.sub(r"^[A-Z]{6}\+", "", f.split()[0]) for f in fonts})
    footer_pages = sum(1 for pg in text.split("\f") if norm(FOOTER) in norm(pg))
    viet = [w for w in ["Đặng Việt Hoàng", "Nguyễn Thị Mai Hoa", "Ngô Anh Tuấn", "Lê Trung Kiên", "hàng hóa", "Thế Hải"] if norm(w) not in t]
    mb = pdf.stat().st_size / 1e6
    out.append(f"## {name}\n- pages: {pages} ({size}); size {mb:.1f} MB\n"
               f"- page-text lines checked: {len(lines)}; missing: {len(missing)}; on-screen controls not printed: {len(ui_missing)} ({', '.join(sorted(set(ui_missing)))})\n"
               f"- References: {len(ref['references'])} entries on the page, missing in PDF: {len(refs_missing)}\n"
               f"- Vietnamese test strings missing: {viet or 'none'}\n"
               f"- extra text not on the page (besides footer and page numbers): {len(extra)}; lines that only mix page words in another reading order (multi-column, chart labels): {reordered}\n"
               f"- footer line on {footer_pages}/{pages} pages\n"
               f"- links: {len(uri)} external link areas ({len(set(uri))} distinct URLs), {internal} internal; table of contents: {toc_ok}/{len(toc)} links land on the page with their section title; bookmarks: {count_outline(reader.outline)}\n"
               f"- fonts ({len(fonts)} entries, all embedded: {not not_embedded}): {', '.join(families)}")
    for l in missing:
        out.append(f"  MISSING: {l}")
    for l in refs_missing:
        out.append(f"  MISSING REFERENCE: {l[:90]}")
    for l in extra:
        out.append(f"  EXTRA: {l}")
    if missing or refs_missing or not_embedded or viet:
        ok = False
print("\n".join(out))
sys.exit(0 if ok else 1)
