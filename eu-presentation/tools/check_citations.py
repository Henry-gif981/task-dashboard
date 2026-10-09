"""Two-way check between the author-year citations on the page and references.md.

  (a) every citation on the page must match exactly one entry of references.md
  (b) every entry of references.md must be cited at least once on the page
  (c) the reference list shown on the page must equal references.md (same 42 entries, same text)

Usage (from eu-presentation/):  python3 tools/check_citations.py
Scans the text and the title / aria-label attributes of <main> in index.html.
Prints mismatches; exits with 1 if any are found. Changes nothing.
"""
import html, pathlib, re, sys
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent.parent
LBL = r"(?:n\.d\.(?:-[a-h])?|\d{4}[a-c]?)"

# ---------- references.md ----------
entries = [re.sub(r"^\d+\.\s+", "", l.rstrip("\n"))
           for l in (ROOT / "references.md").read_text(encoding="utf-8").splitlines() if re.match(r"^\d+\.\s", l)]
refs = {}                      # (display author, label) -> entry
for e in entries:
    author, rest = e.split(" (", 1)
    label = rest.split(")", 1)[0].split(",")[0].strip()
    if re.match(r"^[^,]+, [A-Z]\.", author):                 # person(s): "Surname, X., & Surname, Y."
        surnames = [p.split(",")[0].strip() for p in re.split(r",\s*&\s*|,\s*(?=[A-ZÀ-Ỹ][^.,]+, [A-Z]\.)", author)]
        disp = surnames[0] if len(surnames) == 1 else (f"{surnames[0]} and {surnames[1]}" if len(surnames) == 2 else f"{surnames[0]} et al.")
    else:
        disp = author.rstrip(".")                              # organisation: "European Commission."
    refs[(disp, label)] = e
aliases = sorted({a for a, _ in refs}, key=len, reverse=True)

# ---------- page ----------
class Main(HTMLParser):
    def __init__(self):
        super().__init__(); self.depth = 0; self.text = []; self.reflist = []; self.in_ref = False; self.cur = None
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "main": self.depth = 1
        if not self.depth: return
        if tag == "section": self.in_ref = a.get("id") == "references"
        if self.in_ref and tag == "li": self.cur = []
        for k in ("title", "aria-label"):
            if a.get(k) and not self.in_ref: self.text.append(" " + a[k] + " ")
        if tag in ("p", "li", "td", "th", "div", "h1", "h2", "h3", "figcaption", "caption", "br"): self.text.append(" \n ")
    def handle_endtag(self, tag):
        if tag == "main": self.depth = 0
        if self.in_ref and tag == "li" and self.cur is not None:
            self.reflist.append("".join(self.cur).strip()); self.cur = None
    def handle_data(self, d):
        if not self.depth: return
        if self.cur is not None: self.cur.append(d)
        elif not self.in_ref: self.text.append(d)

m = Main(); m.feed((ROOT / "index.html").read_text(encoding="utf-8"))
text = re.sub(r"[ \t]+", " ", html.unescape("".join(m.text)))

problems = 0
found, used = [], set()
masked = text
for al in aliases:
    pre = r"(?<!\w)(?<!of the )" if al == "European Union" else r"(?<!\w)"
    post = r"(?! Joint)" if al == "European Commission" else ""
    pat = re.compile(pre + re.escape(al) + post + r"(?P<sep> \(|, )(?P<labels>" + LBL + r"(?:, " + LBL + r")*)")
    for hit in pat.finditer(masked):
        for lab in hit.group("labels").split(", "):
            found.append((al, lab, hit.group(0)))
    masked = pat.sub(lambda h: "#" * len(h.group(0)), masked)

print("== (a) Citations on the page without a matching entry in references.md ==")
bad = [(a, l, ctx) for a, l, ctx in found if (a, l) not in refs]
for a, l, ctx in bad: print(f"  {a} ({l})   in: {ctx}")
print("  (none)" if not bad else ""); problems += len(bad)
used = {(a, l) for a, l, _ in found if (a, l) in refs}

# author-like "Name (year)" / "(Name, year)" left over = citation of an author that is not in references.md
NOT_CITATIONS = {"UK", "Greece", "Portugal", "Mercosur", "The African Union", "African Union", "Eastern Partnership",
                 "Union for the Mediterranean", "Mediterranean", "Strategic Compass", "Candidates"}
left = re.findall(r"((?:[A-ZÀ-Ỹ][\w&.'À-ỹ-]*\s){1,6})\((" + LBL + r"(?:, " + LBL + r")*)\)", masked)
left += [(n + " ", y) for n, y in re.findall(r"\(([A-ZÀ-Ỹ][^(),;#\n]{1,60}), (" + LBL + r")", masked)]
unknown = sorted({(n.strip(), y) for n, y in left if n.strip() not in NOT_CITATIONS and not n.strip().startswith(tuple(NOT_CITATIONS))})
print("== (a') Author-year citations whose author is not in references.md ==")
for n, y in unknown: print(f"  {n} ({y})")
print("  (none)" if not unknown else ""); problems += len(unknown)

print("== (b) Entries in references.md never cited on the page ==")
never = [e for k, e in refs.items() if k not in used]
for e in never: print("  " + e[:110])
print("  (none)" if not never else ""); problems += len(never)

print("== (c) Reference list on the page vs references.md ==")
shown = [re.sub(r"\s+", " ", html.unescape(x)) for x in m.reflist]
diff = sorted(set(entries) ^ set(shown))
print(f"  page: {len(shown)} entries, references.md: {len(entries)} entries")
for d in diff: print("  differs: " + d[:110])
print("  identical text" if not diff and len(shown) == len(entries) else ""); problems += len(diff)

orgs = sorted(set(re.findall(r"Source:\s*([^\n]+)", text)))
print("== Source notes of tables/figures (organisations, no References entry needed) ==")
for o in orgs:
    if not re.search(LBL + r"\)", o): print("  " + o.strip())
sys.exit(1 if problems else 0)
