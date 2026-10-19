#!/usr/bin/env python3
"""Review 2026-10, phase 1 (display errors, list part E). Run once from eu-presentation/."""
import json, re
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent

def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:90])
    return s.replace(a, b)

# ---------- index.html ----------
p = ROOT / "index.html"; h = p.read_text(encoding="utf-8")

# slide 5 (and every part heading): a real space between number and title, so copied text is "1.1 Theoretical ..."
h = re.sub(r'(<span class="no">\d\.\d</span>)(<span class="tt">)', r'\1 \2', h)
h = rep(h, ".part-h { display: flex; align-items: baseline; gap: 14px;", ".part-h { display: block;")
h = rep(h, ".part-h .no { flex: none;", ".part-h .no { display: inline-block; margin-right: 6px; vertical-align: 2px;")

# slides 18, 24, 26, 55: value labels were drawn with a white stroke halo (paint-order: stroke), which puts
# every glyph twice into the PDF text layer ("3,,442"). Labels are drawn once, without halo.
h = rep(h, '`<g class="pop" style="--i:6;paint-order:stroke" pointer-events="none" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round">${labs}</g>`',
           '`<g class="pop" style="--i:6" pointer-events="none">${labs}</g>`')

# slide 41: date labels of the two-lane timeline overlapped ("Jun 2018" / "30 Jun 2019"): wider label boxes, one more row
h = rep(h, "const fs = FS(.58), r = Math.max(5.5, fs * .42), narrow = w < 640, lh = fs * 1.3, rowsL = narrow ? 2 : 3;",
           "const fs = FS(.58), r = Math.max(5.5, fs * .42), narrow = w < 640, lh = fs * 1.3, rowsL = narrow ? 3 : 4;")
h = rep(h, "const lab = V(it.date), tw = textW(lab, fs) + 4, cands = [];",
           "const lab = V(it.date), tw = textW(lab, fs) * 1.2 + 10, cands = [];   // generous width: the estimate is per character")

# internal notes on slides 18 and 55 -> speaker notes (presenter view)
m = re.search(r'(<script type="application/json" id="viz-data">)(.*?)(</script>)', h, re.S)
d = json.loads(m.group(2))
V = {x["key"]: x for x in d["visuals"]}
moved = []
for key, start in [("F2.1a", "Numbered \"Figure 1\" in the report"), ("F2.1b", "The report's figure also shows"), ("A8i", "Row \"Annual European FDI inflow\" of Table 3.7, read from")]:
    keep = [n for n in V[key]["notes"] if not n.startswith(start)]
    gone = [n for n in V[key]["notes"] if n.startswith(start)]
    assert len(gone) == 1, key
    moved.append((key, gone[0]))
    if keep: V[key]["notes"] = keep
    else: del V[key]["notes"]
# slide 47: "asymmetric in favour of Vietnam" said twice (visual's so-what line + the report's sentence below) -> keep the report's sentence
del V["A7b"]["sowhat"]
h = h[:m.start(2)] + json.dumps(d, ensure_ascii=False) + h[m.end(2):]
NOTE_ADD = {"c2-economic-b": "Ghi chú dữ liệu (không đọc lên): Hình 2.1 là \"Figure 1\" trong báo cáo, đánh số lại theo Chương 2; hình gốc còn có cột xuất/nhập khẩu ngoài khối không ghi số, ở đây chỉ vẽ cán cân có ghi số.",
            "c3-investment": "Ghi chú dữ liệu (không đọc lên): dòng \"Annual European FDI inflow\" của Bảng 3.7 được đọc từ ảnh trang báo cáo vì lớp chữ của PDF bị lỗi."}
for sec, txt in NOTE_ADD.items():
    h = rep(h, f'  "{sec}": [', f'  "{sec}": [{json.dumps(txt, ensure_ascii=False)}, ')

# slide 39: the first two big numbers come from different statistics -> say so under each number
h = rep(h, '<p class="l">EU–Vietnam trade in goods, 2025</p><p class="s">Table 3.5 (Eurostat)</p>',
           '<p class="l">EU–Vietnam trade in goods (exports + imports), 2025</p><p class="s">Goods only · EUR · EU statistics (Eurostat), Table 3.5</p>')
h = rep(h, "<p class=\"l\">Vietnam&#x27;s exports to the EU, 2025</p><p class=\"s\">Table 3.6 (Vietnamese statistics)</p>",
           "<p class=\"l\">Vietnam&#x27;s exports of goods to the EU, 2025</p><p class=\"s\">Goods only · US$ · Vietnamese statistics (MOIT / Customs), Table 3.6</p>")
h = rep(h, '    <p class="vz-sowhat rv" style="max-width:80ch">The EU is one of Vietnam\'s top three markets',
           '    <p class="tnote rv">The first two figures come from different statistical systems (EU data in euro, Vietnamese data in US dollars) and are not directly comparable.</p>\n    <p class="vz-sowhat rv" style="max-width:80ch">The EU is one of Vietnam\'s top three markets')

# slide 63: the JETP projects card had no source of its own
h = rep(h, '    <p class="src"><b>Source:</b> European Commission and EEAS.</p>\n    <p class="note rv mt">Global Gateway provides',
           '    <p class="src"><b>Source:</b> European Commission and EEAS (Table 3.11); JETP projects: European Commission, Global Gateway: Vietnam Just Energy Transition Partnership.</p>\n    <p class="note rv mt">Global Gateway provides')

# Source lines: the ↗ icon stays on the line of the last word of the link
CSS_ADD = "a.srcl .nw { white-space: nowrap; }\n"
h = rep(h, "a.srcl:hover, a.srcl:focus-visible {", CSS_ADD + "a.srcl:hover, a.srcl:focus-visible {")
p.write_text(h, encoding="utf-8")

# ---------- source links (page copy and v3b/src copy) ----------
OLD_LINK = ': `<a class="srcl" href="${esc(r.url)}" target="_blank" rel="noopener" title="${esc(r.tip)}">${esc(text)}${EXT}</a>`;'
NEW_LINK = (': `<a class="srcl" href="${esc(r.url)}" target="_blank" rel="noopener" title="${esc(r.tip)}">${tail(text)}</a>`;\n'
            '  // the last word and the ↗ icon never part at a line break\n'
            '  function tail(t) { const s = esc(t), i = s.lastIndexOf(" "); return (i < 0 ? "" : s.slice(0, i + 1)) + `<span class="nw">${s.slice(i + 1)}${EXT}</span>`; }')
RULE_ADD = '    [/Global Gateway: Vietnam Just Energy Transition Partnership/, "ec-gg-jetp"],\n'
for f in [ROOT / "index.html", ROOT / "v3b" / "src" / "sources.js"]:
    s = f.read_text(encoding="utf-8")
    s = rep(s, OLD_LINK, NEW_LINK)
    s = rep(s, '    [/European Commission, Access2Markets/, "access2markets-evfta"],\n', '    [/European Commission, Access2Markets/, "access2markets-evfta"],\n' + RULE_ADD)
    f.write_text(s, encoding="utf-8")

# URL for the JETP projects (EU page that lists Bac Ai, Tri An expansion, Tra Vinh wind)
NEWURL = {"key": "ec-gg-jetp", "source": "European Commission, Global Gateway: Vietnam Just Energy Transition Partnership",
          "url": "https://international-partnerships.ec.europa.eu/policies/global-gateway/vietnam-just-energy-transition-partnership_en",
          "title": "Global Gateway: Vietnam Just Energy Transition Partnership (Bac Ai pumped storage, Tri An expansion, Tra Vinh wind)", "status": "article-verified"}
uj = ROOT / "v3b" / "src" / "source_urls.json"; urls = json.loads(uj.read_text(encoding="utf-8")); urls.append(NEWURL)
uj.write_text(json.dumps(urls, ensure_ascii=False, indent=1), encoding="utf-8")
h = (ROOT / "index.html").read_text(encoding="utf-8")
m = re.search(r'(<script type="application/json" id="src-urls">)(.*?)(</script>)', h, re.S)
h = h[:m.start(2)] + json.dumps(urls, ensure_ascii=False) + h[m.end(2):]
(ROOT / "index.html").write_text(h, encoding="utf-8")
print("moved notes:", moved)
