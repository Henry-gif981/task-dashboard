#!/usr/bin/env python3
"""Requests of 19 Oct 2026, items 1, 3, 4, 6 and the references to removed tables. Run once from eu-presentation/."""
import json, re
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
P = ROOT / "index.html"; h = P.read_text(encoding="utf-8")
def rep(a, b, n=1):
    global h
    assert h.count(a) == n, (h.count(a), a[:120]); h = h.replace(a, b)
def viz(fn):
    global h
    m = re.search(r'(<script type="application/json" id="viz-data">)(.*?)(</script>)', h, re.S)
    d = json.loads(m.group(2)); fn({x["key"]: x for x in d["visuals"]})
    h = h[:m.start(2)] + json.dumps(d, ensure_ascii=False) + h[m.end(2):]

# ---- 1. View data: no "Visual / What is measured / In the report / Source" rows ----
rep('    const meta = [["Visual", title], ["What is measured", s.unit], ["In the report", d.where], ["Source", src]].filter(m => m[1]);',
    '    const meta = [];   // the panel shows notes, data and calculations only')
for f in [ROOT / "v3b" / "src" / "viewdata.js"]:
    s = f.read_text(encoding="utf-8")
    a = '    const meta = [["Visual", title], ["What is measured", s.unit], ["In the report", d.where], ["Source", src]].filter(m => m[1]);'
    assert s.count(a) == 1; f.write_text(s.replace(a, '    const meta = [];   // the panel shows notes, data and calculations only'), encoding="utf-8")

# ---- 6. Figure 2.1(b) as in the report: extra-EU exports and imports, balance above each year ----
rep("const B = fs * (1.6 + 1.25 * Math.max(...catL.map(l => l.length))) + (ns > 1 ? fv * 2.4 : 0), Tp = fs * (s.values.some(r => r.some(v => v.sub)) ? 2.8 : 1.8) + (ns > 1 ? fv * 1.2 : 0);",
    "const B = fs * (1.6 + 1.25 * Math.max(...catL.map(l => l.length))) + (ns > 1 ? fv * 2.4 : 0), Tp = fs * (s.values.some(r => r.some(v => v.sub)) ? 2.8 : 1.8) + (ns > 1 ? fv * 1.2 : 0) + (s.groupNotes ? fv * 2.6 : 0);")
rep("const H = Math.round(Math.max(300, Math.min(440, w * .7))), L = fs * 3.2, Rr = fs * .6;",
    "const H = Math.round(Math.max(300, Math.min(440, w * .7))), L = fs * (s.axisTitle ? 4.6 : 3.2), Rr = fs * .6;")
rep("        labs += T(xx + bw / 2 - 1, ly, t, { anchor: \"middle\", size: fv, weight: 700 })",
    "        if (!s.hideValues) labs += T(xx + bw / 2 - 1, ly, t, { anchor: \"middle\", size: fv, weight: 700 })")
rep("    const body = g + bars + `<line x1=\"${f1(L)}\" x2=\"${f1(w - Rr)}\" y1=\"${f1(zero)}\" y2=\"${f1(zero)}\" stroke=\"${K.axis}\" stroke-width=\"1.4\"/>` + `<g class=\"pop\" style=\"--i:6\" pointer-events=\"none\">${labs}</g>`;",
    "    // optional: a note above each group (Figure 2.1(b): the balance) and an axis title\n"
    "    if (s.groupNotes) s.groupNotes.forEach((gn, i) => { const cx = L + i * st + st / 2, c = gn.tone === \"neg\" ? \"#B3261E\" : \"#1E7F4F\";\n"
    "      labs += T(cx, fv * 1.1, gn.label, { anchor: \"middle\", size: fv, weight: 700, fill: c }) + T(cx, fv * 2.3, gn.value, { anchor: \"middle\", size: fv, weight: 700, fill: c }); });\n"
    "    if (s.axisTitle) labs += `<text transform=\"translate(${f1(fs * .9)} ${f1((Tp + H - B) / 2)}) rotate(-90)\" text-anchor=\"middle\" font-size=\"${fs}\" fill=\"${K.axis}\">${esc(s.axisTitle)}</text>`;\n"
    "    const body = g + bars + `<line x1=\"${f1(L)}\" x2=\"${f1(w - Rr)}\" y1=\"${f1(zero)}\" y2=\"${f1(zero)}\" stroke=\"${K.axis}\" stroke-width=\"1.4\"/>` + `<g class=\"pop\" style=\"--i:6\" pointer-events=\"none\">${labs}</g>`;")
# the tooltip of an unlabelled bar says it was read from the chart
rep("`${s.cats[i]}${ns > 1 ? \", \" + s.series[j].name : \"\"}\\n${t} ${s.unitShort}${v.sub ? \" (\" + v.sub + \" of EU imports)\" : \"\"}` + (v.s === \"figure label\" ? \"\\n(label of the report's figure)\" : \"\")",
    "`${s.cats[i]}${ns > 1 ? \", \" + s.series[j].name : \"\"}\\n${t} ${s.unitShort}${v.sub ? \" (\" + v.sub + \" of EU imports)\" : \"\"}` + (v.s === \"figure label\" ? \"\\n(label of the report's figure)\" : v.s === \"read\" ? \"\\n(read from the bar of the report's figure; not labelled there)\" : \"\")")

# bar heights measured on the report's Figure 1 (left panel), constrained by the labelled balances
READ = {"2021": (2175, 2120), "2022": (2570, 3005), "2023": (2550, 2509), "2024": (2580, 2433), "2025*": (2630, 2502)}
BAL = {"2021": "+55", "2022": "-435", "2023": "+41", "2024": "+147", "2025*": "+128"}
def f21b(V):
    s = V["F2.1b"]
    s.update({
        "title": "Extra-EU trade in goods and trade balance, 2021–2025",
        "unit": "EUR billion. Extra-EU exports and imports; the balance is written above each year, as in the report's figure.",
        "unitShort": "EUR billion", "signed": False, "hideValues": True, "axisTitle": "EUR billion",
        "notes": ["*2025 exports and imports derived from reported shares and balance; vintages of earlier years differ slightly (note of the report's figure).",
                  "The report's figure labels only the balances; bar heights are read from it (≈, rounded to the nearest 5) so that each pair matches the labelled balance."],
        "source": "Eurostat.",
        "cats": list(READ),
        "series": [{"name": "Extra-EU exports", "fill": "blue"}, {"name": "Extra-EU imports", "fill": "gold"}],
        "values": [[{"v": READ[c][0], "s": "read", "txt": f"≈{READ[c][0]:,}"}, {"v": READ[c][1], "s": "read", "txt": f"≈{READ[c][1]:,}"}] for c in READ],
        "groupNotes": [{"label": "Balance", "value": BAL[c], "tone": "neg" if BAL[c].startswith("-") else "pos"} for c in READ],
        "axis": {"y": {"min": {"v": 0, "s": "axis"}, "max": {"v": 3500, "s": "axis"}, "ticks": [{"v": t, "s": "axis"} for t in range(0, 3501, 500)]}},
        "aria": "Grouped bars, EUR billion, extra-EU exports and imports of goods, 2021 to 2025, with the trade balance above each year: 2021 +55, 2022 −435, 2023 +41, 2024 +147, 2025 +128 (2025 derived).",
    })
viz(f21b)
# the data table of the panel: balance column, "≈" status explained
rep("const STATUS_KEY = [[\"exact\", \"the number is printed in the report's text or tables\"],",
    "const STATUS_KEY = [[\"read\", \"read from the bar of the report's figure (≈), not labelled there\"], [\"exact\", \"the number is printed in the report's text or tables\"],")
rep("    \"F2.1b\": { where:", "    \"F2.1b\": { where0:")
h = re.sub(r'(    "F2\.1b": \{ where0: [^\n]*\n)\s*calc: s => \(\{ head: \["Year", "Balance \(EUR billion\)".*?\}\) \},\n',
           lambda m: '    "F2.1b": { calc: s => ({ head: ["Year", "Exports − imports (≈, EUR billion)", "Balance in the report"], rows: s.cats.map((c, i) => [c, `${P(s.values[i][0])} − ${P(s.values[i][1])}`, s.groupNotes[i].value]) }) },\n', h, count=1, flags=re.S)
assert '"F2.1b": { calc:' in h

# ---- 3. Timeline of 3.1.1 / 3.1.3 as cards: date + event, 3 columns, nothing positioned on top of anything ----
CSS = """
/* B1 (3.1.1 and 3.1.3): events as cards, one per event, in date order */
.evg-lane + .evg-lane { margin-top: var(--s3); }
.evg-lane h4 { display: flex; align-items: center; gap: 8px; font: 700 .78rem/1.3 var(--sans); color: var(--navy); margin: 0 0 var(--s1); }
.evg-lane h4 i { width: 12px; height: 12px; border-radius: 50%; background: var(--blue); flex: none; }
.evg-lane.alt h4 i { border-radius: 2px; transform: rotate(45deg); background: var(--gold); border: 1px solid var(--navy); width: 10px; height: 10px; }
.evg { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.evg li { border: 1px solid var(--line); border-left: 3px solid var(--blue); background: var(--white); padding: 8px 10px; min-width: 0; }
.evg-lane.alt .evg li { border-left-color: var(--gold); }
.evg time { display: block; font: 700 .74rem/1.3 var(--sans); color: var(--blue); font-feature-settings: "lnum"; }
.evg span { display: block; font-size: .74rem; line-height: 1.4; color: var(--ink); overflow-wrap: break-word; }
@media (max-width: 900px) { .evg { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) { .evg { grid-template-columns: 1fr; } }
"""
rep("a.srcl .nw { white-space: nowrap; }\n", "a.srcl .nw { white-space: nowrap; }\n" + CSS)
EVG = '''  /* B1 (redesigned): one card per event, grouped by lane, 3 columns; no absolute positions */
  R["event-grid"] = s => ({
    html: s.lanes.map((l, li) => `<div class="evg-lane${li ? " alt" : ""}"><h4><i aria-hidden="true"></i>${esc(l.name)}</h4><ol class="evg">` +
      l.items.map(it => `<li><time>${esc(V(it.date))}</time><span>${esc(it.text)}</span></li>`).join("") + `</ol></div>`).join(""),
    table: { cap: s.title, head: ["Lane", "Date", "Milestone"], rows: s.lanes.flatMap(l => l.items.map(it => [l.name, V(it.date), it.text])) }
  });
  R["event-grid"].once = true;

'''
rep("  /* ======================================================\n     MOUNT:", EVG + "  /* ======================================================\n     MOUNT:")
def b1(V):
    s = V["B1"]; s["kind"] = "event-grid"
    s["unit"] = "Events of Table 3.1 and Section 3.1.3, in date order; one card per event."
    for lane in s["lanes"]:
        for it in lane["items"]: it.pop("short", None)
viz(b1)

# ---- 4. Source lines on one line: no wrapping, smaller type if needed, then an ellipsis (full text in the tooltip) ----
rep(".src { margin-top: var(--s3); font-size: .74rem; color: var(--ink-2); font-style: italic; max-width: 110ch; }",
    ".src { margin-top: var(--s3); font-size: .74rem; color: var(--ink-2); font-style: italic; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n"
    ".vz-foot .src { flex: 1 1 0; min-width: 0; }")
FIT = '''
<script id="source-one-line">
/* every "Source:" line stays on one line: the type shrinks a little (to 85%) before an ellipsis cuts it; the full text is in the tooltip */
(function () {
  "use strict";
  function fit() {
    document.querySelectorAll("main .src").forEach(p => {
      if (!p.title) p.title = p.textContent.replace(/\\s+/g, " ").trim();
      p.style.fontSize = "";
      if (!p.clientWidth) return;
      const base = parseFloat(getComputedStyle(p).fontSize);
      for (let k = 1; k <= 3 && p.scrollWidth > p.clientWidth + 1; k++) p.style.fontSize = (base * (1 - .05 * k)).toFixed(2) + "px";
    });
  }
  fit(); addEventListener("resize", () => { clearTimeout(fit.t); fit.t = setTimeout(fit, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.fitSources = fit;
})();
</script>
'''
rep("\n<!-- Three.js: local copy", FIT + "\n<!-- Three.js: local copy")

# ---- references to removed tables ----
viz(lambda V: V["F2.4"].update({"notes": [n.replace("the other values also appear in the text and Table 2.3.", "the other values also appear in the text of Section 2.2.1.") for n in V["F2.4"]["notes"]]}))
rep('title="Table 3.5">Trade 2020: €43.3 bn</p>', 'title="Figure 3.1">Trade 2020: €43.3 bn</p>')
rep('title="Table 3.5">Trade 2025: €76.0 bn</p>', 'title="Figure 3.1">Trade 2025: €76.0 bn</p>')
rep('<span class="vz-lbl">Visual · Section 3.2.1 (Table 3.7)</span><span class="vz-title">EU investors are spread', '<span class="vz-lbl">Visual · Section 3.2.1</span><span class="vz-title">EU investors are spread')
rep("act as external drivers of change (Table 3.8).", "act as external drivers of change.")
rep('data-pdf="3.2.1 The impact of the EVFTA on bilateral trade (foreign direct investment, Table 3.7)"', 'data-pdf="3.2.1 The impact of the EVFTA on bilateral trade (foreign direct investment)"')
h = h.replace("competitiveness (Table 3.8)\"", "competitiveness\"")
P.write_text(h, encoding="utf-8")
print("ok")
