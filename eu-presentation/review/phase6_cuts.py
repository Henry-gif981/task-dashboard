#!/usr/bin/env python3
"""Cuts requested on 19 Oct 2026 (items 0–16). Run once from eu-presentation/.
Table and figure numbers are kept as in the Word report; only references to removed tables are adjusted."""
import json, re
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
P = ROOT / "index.html"; h = P.read_text(encoding="utf-8")
LOG = []

def rep(a, b, n=1):
    global h
    assert h.count(a) == n, (h.count(a), a[:120]); h = h.replace(a, b)

def element_end(s, i):
    """index just after the element that starts at s[i] ('<tag ...'), counting nested tags of the same name"""
    tag = re.match(r"<([a-zA-Z0-9]+)", s[i:]).group(1)
    depth, j = 0, i
    for m in re.finditer(rf"<(/?){tag}\b[^>]*>", s[i:]):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return i + m.end()
    raise ValueError(tag)

def cut(start_marker, what, extra_trailing_ws=True, first=False):
    """remove the element that starts with start_marker (must be unique)"""
    global h
    assert h.count(start_marker) == 1 or (first and h.count(start_marker) > 1), (h.count(start_marker), start_marker[:100])
    i = h.index(start_marker); j = element_end(h, i)
    # take the indentation before and the newline after
    k = h.rfind("\n", 0, i) + 1
    if h[k:i].strip() == "": i = k
    if extra_trailing_ws and h[j:j + 1] == "\n": j += 1
    LOG.append(what); h = h[:i] + h[j:]

def section(sid):
    m = re.search(rf'<section[^>]*id="{sid}"', h); i = m.start(); return i, element_end(h, i)

def viz(fn):
    global h
    m = re.search(r'(<script type="application/json" id="viz-data">)(.*?)(</script>)', h, re.S)
    d = json.loads(m.group(2)); fn(d, {x["key"]: x for x in d["visuals"]})
    h = h[:m.start(2)] + json.dumps(d, ensure_ascii=False) + h[m.end(2):]

def drop_note(sid):
    global h
    h, k = re.subn(rf'\n  "{re.escape(sid)}": \[.*?\],?(?=\n)', "", h, count=1)
    assert k == 1, sid

# ---- 0. Introduction ----
i, j = section("introduction"); h = h[:i] + h[j:].lstrip("\n"); LOG.append("0: slide Introduction (#introduction)")
rep('        <a class="toc-h" href="#introduction">Introduction</a>\n', "")
drop_note("introduction")

# ---- 2. proposals ----
cut('<p class="note rv mt proposal-block">', "2: note 'ĐỀ XUẤT – Crises and reform' (2.1.1b)", first=True)
cut('<p class="note rv mt proposal-block">', "2: note 'ĐỀ XUẤT – Prospects' (end of Chapter 2)")
cut('<div class="card rv proposal-block"', "2: card 'ĐỀ XUẤT – Recommendation 8: Build skills for green and digital jobs' (3.4.3)")
h, k = re.subn(r'"ĐỀ XUẤT – cần nhóm duyệt: Khuyến nghị 8[^"]*(?:\\"[^"]*)*", ', "", h); assert k == 1
LOG.append("2: presenter note 'ĐỀ XUẤT – Khuyến nghị 8' (3.4.3)")
rep(".proposal { display: inline-block;", "/* .proposal removed */ .proposal-unused { display: inline-block;")

# ---- 6. 2.1.1b: only Figure 2.1(a) and 2.1(b) ----
cut('<div class="grid g4 mt">\n      <div class="stat rv"><p class="v">≈450 million</p>', "6: 2.1.1b four key-figure boxes (450 million, EUR 4.14 trillion, 21 members, one third)")
cut('<p class="src"><b>Source:</b> Eurostat; European Union (n.d.-a).</p>', "6: 2.1.1b source line of those boxes")
cut('<div class="vz-pair mt">\n      <figure class="vz rv" data-viz="A2"></figure>', "6: 2.1.1b visual '21 of 27 member states use the euro' + boxes 'Monetary integration' and 'From \"negative\" to \"positive\" integration'")

# ---- 7. Table 2.3 out, Figure 2.4 in its place; 2.2.1b callouts out ----
cut('<div class="tbl-wrap tbl-long rv"><table class="tbl" style="min-width:0">\n        <caption><span class="lbl">Table 2.3.</span>', "7: Table 2.3 (Key indicators of EU external trade, 2025)")
rep('      <figure class="vz rv" style="margin-top:0" data-viz="F2.3"></figure>',
    '      <figure class="vz rv" style="margin-top:0" data-viz="F2.4"></figure>\n      <figure class="vz rv" style="margin-top:0" data-viz="F2.3"></figure>')
rep('<div class="cols c21 mt">\n      <figure class="vz rv" style="margin-top:0" data-viz="F2.4"></figure>', '<div class="vz-pair mt">\n      <figure class="vz rv" style="margin-top:0" data-viz="F2.4"></figure>')
cut('<p class="src"><b>Source:</b> Eurostat, as reported by the European Commission and specialised media (see References).</p>', "7: source line of Table 2.3")
cut('<div class="callout rv"><h3>Vulnerabilities</h3>', "7: 2.2.1b box 'Vulnerabilities'")
cut('<div class="callout rv" style="--d:1"><h3>Concentration</h3>', "7: 2.2.1b box 'Concentration'")
# what is left of 2.2.1b is one sentence: it moves under the two figures of 2.2.1a and the empty slide goes
m = re.search(r'\s*<p class="note rv">More than half \(54\.4%\) of extra-EU goods trade[^<]*</p>', h); note = m.group(0).strip(); h = h[:m.start()] + h[m.end():]
i, j = section("c2-trade-balance"); h = h[:i] + h[j:].lstrip("\n"); LOG.append("7: slide 2.2.1b (#c2-trade-balance) removed after Figure 2.4 moved up and its boxes were deleted")
drop_note("c2-trade-balance")
# the moved figure order: Figure 2.3 first, then Figure 2.4 (report order)
rep('<div class="vz-pair mt">\n      <figure class="vz rv" style="margin-top:0" data-viz="F2.4"></figure>\n      <figure class="vz rv" style="margin-top:0" data-viz="F2.3"></figure>',
    '<div class="vz-pair mt">\n      <figure class="vz rv" style="margin-top:0" data-viz="F2.3"></figure>\n      <figure class="vz rv" style="margin-top:0" data-viz="F2.4"></figure>')
i, j = section("c2-trade"); sec = h[i:j]
k = sec.rindex("  </div>\n</section>")
sec = sec[:k] + "    " + note.replace('class="note rv"', 'class="note rv mt"') + "\n" + sec[k:]
h = h[:i] + sec + h[j:]
rep('data-pdf="2.2.1 Global Trade and Investment (Table 2.3, Figure 2.3)"', 'data-pdf="2.2.1 Global Trade and Investment (Figures 2.3 and 2.4)"')
# sub-letters of 2.2.1 follow the slides again
rep('<p class="eyebrow rv">2.2.1c</p>', '<p class="eyebrow rv">2.2.1b</p>')

# ---- 8. 2.2.2a: intro paragraph and Table 2.5 only ----
i, j = section("c2-governance"); sec = h[i:j]
a = sec.index('    <div class="vb-pair wide-right">'); b = element_end(sec, a + 4)
sec = sec[:a] + sec[b:].lstrip("\n"); h = h[:i] + sec + h[j:]
LOG.append("8: 2.2.2a note on the WTO Appellate Body + visual 'The EU sits at the table in trade and climate, but not in the IMF or the World Bank'")

# ---- 9. Chapter 3 key figures ----
i, j = section("c3-numbers"); h = h[:i] + h[j:].lstrip("\n"); LOG.append("9: slide 'Chapter 3 · Key figures – Vietnam–EU in six numbers' (#c3-numbers)")
rep('        <a href="#c3-numbers" class="toc-sub">Vietnam–EU in six numbers</a>\n', "")
drop_note("c3-numbers")

# ---- 10. 3.1.1: Visual · Section 3.1.1 ----
cut('<figure class="vz vb rv " aria-label="Trade in goods rose from €43.3 bn in 2020', "10: 3.1.1 visual 'Trade in goods rose from €43.3 bn in 2020 … to €76.0 bn in 2025'")

# ---- 11. 3.1.3c: Visual · Section 3.1.3 ----
cut('<figure class="vz rv" data-viz="B2"></figure>', "11: 3.1.3c visual '20 member states had ratified the EVIPA by November 2025'")

# ---- 12. 3.2.1a: Table 3.5 ----
i, j = section("c3-trade"); sec = h[i:j]
a = sec.index('<div class="tbl-wrap tbl-long rv"><table class="tbl" style="min-width:0">'); b = element_end(sec, a)
m = re.compile(r'\s*<p class="src"><b>Source:</b> European Commission, DG Trade country factsheet on Vietnam \(20 May 2026\), based on Eurostat Comext\.</p>\s*<p class="tnote">\*2019:.*?</p>(<!--.*?-->)?', re.S).match(sec, b)
sec = sec[:sec.rfind("\n", 0, a) + 1] + sec[m.end():].lstrip("\n")
h = h[:i] + sec + h[j:]
LOG.append("12: 3.2.1a Table 3.5 with its source line and 2019 note")
rep("*2019 ≈ (see the note to Table 3.5).</p>", "*2019 ≈ (see the note below the chart).</p>")
rep('data-pdf="3.2.1 The impact of the EVFTA on bilateral trade (Table 3.5, Figure 3.1)"', 'data-pdf="3.2.1 The impact of the EVFTA on bilateral trade (Figure 3.1)"')
def f31(d, V):
    s = V["F3.1"]; s["unit"] = "EUR billion (Eurostat). Totals above the bars."
    s["notes"] = ["*2019: EU imports from Vietnam €34.4 bn (Eurostat); total €45.6 bn (Upply, based on Eurostat); EU exports derived (45.6 − 34.4 ≈ 11.2).",
                  "Totals are those reported by Eurostat; some differ by 0.1 from the sum of the rounded parts."]
viz(f31)

# ---- 13. 3.2.1b: Visual · Section 3.2.1 (and with it the slide's only View data, item 5) ----
cut('<figure class="vz rv" style="margin-top:0" data-viz="A8a"></figure>', "13: 3.2.1b visual 'Vietnam's trade with the EU rose on every indicator' (its View data goes with it, item 5)")
rep('<div class="cols c21 mt">\n      <div>\n        <div class="tbl-wrap rv"><table class="tbl" style="min-width:0">', '<div class="mt">\n      <div>\n        <div class="tbl-wrap rv"><table class="tbl" style="min-width:0">')
rep("<p class=\"tnote\">Table 3.5 uses EU statistics in EUR; Table 3.6 uses Vietnamese statistics in US$, so the two series are not directly comparable.</p>",
    "<p class=\"tnote\">Figure 3.1 uses EU statistics in EUR; Table 3.6 uses Vietnamese statistics in US$, so the two series are not directly comparable.</p>")

# ---- 14. 3.2.1d: Table 3.7 and the two visuals under it ----
i, j = section("c3-investment"); sec = h[i:j]
a = sec.index('    <div class="tbl-wrap rv mt"><table class="tbl">\n      <caption><span class="lbl">Table 3.7.</span>')
b = sec.index('<div class="vz-pair mt"><figure class="vz rv" data-viz="A8s"></figure><figure class="vz rv" data-viz="A8i"></figure></div>')
b = b + len('<div class="vz-pair mt"><figure class="vz rv" data-viz="A8s"></figure><figure class="vz rv" data-viz="A8i"></figure></div>') + 1
sec = sec[:a] + sec[b:]; h = h[:i] + sec + h[j:]
LOG.append("14: 3.2.1d Table 3.7 with its source line, and the two visuals under it (EU share of FDI; annual European FDI inflow)")
rep("compiled by the authors (Table 3.7).</p>", "compiled by the authors.</p>")

# ---- 15. Table 3.8 ----
i, j = section("c3-reform"); sec = h[i:j]
a = sec.index('    <div class="tbl-wrap rv mt"><table class="tbl">\n      <caption><span class="lbl">Table 3.8.</span>')
b = element_end(sec, a + 4)
m = re.compile(r'\s*<p class="src"><b>Source:</b> European Commission, Access2Markets; EuroCham \(2025\); Vietnamese Government implementation plan; compiled by the authors[^<]*</p>').match(sec, b)
sec = sec[:a] + sec[m.end():].lstrip("\n"); h = h[:i] + sec + h[j:]
LOG.append("15: Table 3.8 (Channels of institutional influence of the EVFTA and EVIPA) with its source line")

# ---- 16. 3.4.3: Visual · Section 3.4 ----
cut('<figure class="vz vb rv vb-long" aria-label="All five challenges are addressed">', "16: 3.4.3 visual 'Section 3.4' (opportunities–challenges–recommendations matrix)")

P.write_text(h, encoding="utf-8")
print("\n".join(LOG))
