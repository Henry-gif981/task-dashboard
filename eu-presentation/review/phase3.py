#!/usr/bin/env python3
"""Review 2026-10, phase 3: figures and consistency. Run once from eu-presentation/."""
import html as H, json, re
from pathlib import Path
from urllib.parse import unquote
ROOT = Path(__file__).resolve().parent.parent
P = ROOT / "index.html"; h = P.read_text(encoding="utf-8")
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:110])
    return s.replace(a, b)
def viz(fn):
    global h
    m = re.search(r'(<script type="application/json" id="viz-data">)(.*?)(</script>)', h, re.S)
    d = json.loads(m.group(2)); fn({x["key"]: x for x in d["visuals"]})
    h = h[:m.start(2)] + json.dumps(d, ensure_ascii=False) + h[m.end(2):]
def ref_li(text, url):
    shown = H.escape(unquote(url)).replace("/", "/<wbr>").replace("-", "-<wbr>").replace("/<wbr>/<wbr>", "//")
    return f'      <li>{H.escape(text, quote=False)} <a class="ref-url" href="{url}" target="_blank" rel="noopener">{shown}</a></li>'
def add_refs(entries, drop=()):
    global h
    m = re.search(r'(<ul class="refs mt">\n)(.*?)(\n      <!-- TODO\(verify\))', h, re.S)
    items = [i for i in m.group(2).split("\n") if not any(d in i for d in drop)]
    items += [ref_li(t, u) for t, u in entries]
    items.sort(key=lambda s: re.sub(r"<[^>]+>", "", s).strip().lower())
    h = h[:m.start(2)] + "\n".join(items) + h[m.end(2):]

# ---- A. 2019 investment figures (Table 3.7, slides 53–55): the FIA page does not carry them -> authors' draft ----
TODO19 = "<!-- TODO(verify): 2019 EU investment figures (> 2,240 projects, US$24.7 bn, ≈7.6%, 18 of 21 sectors, 54 provinces): not found on the FIA page (fia.mpi.gov.vn/tinbai/4019) nor in official 2019 releases; the Sept 2021 government report gives 2,242 projects and US$22.24 bn. -->"
h = rep(h, "<p class=\"src\"><b>Source:</b> EEAS; Foreign Investment Agency/MPI (2019 figures); compiled by the authors (Table 3.7).</p>",
           "<p class=\"src\"><b>Source:</b> EEAS; 2019 figures as given in the authors' earlier draft (original source not confirmed); compiled by the authors (Table 3.7).</p>" + TODO19)
h = rep(h, "<p class=\"src\"><b>Source:</b> Foreign Investment Agency/MPI (2019 figures); EEAS; VietnamPlus (Sept 2025); Vietnam Briefing.",
           "<p class=\"src\"><b>Source:</b> 2019 column as given in the authors' earlier draft (original source not confirmed); EEAS; VietnamPlus (Sept 2025); Vietnam Briefing.")
add_refs([], drop=["Foreign Investment Agency, Ministry of Planning and Investment"])

# ---- B. FDI share (slide 55): registered capital, mixed dates stated, no over-claiming ----
h = rep(h, "<td>≈ 5.6% (indicative; end-2022 capital ÷ total at 30 Nov 2024)</td><td>Share lower as Asian investors grew faster</td>",
           "<td>≈ 5.6% (indicative; end-2022 EU capital ÷ total at 30 Nov 2024)</td><td>Appears lower; the two figures refer to different dates, so the size of the fall is uncertain</td>")
h = rep(h, "<td>US$2.5 bn (2022) → US$3.25 bn (2024)</td><td>Rising</td>", "<td>US$2.5 bn (2022) → US$3.25 bn (2024)</td><td>Higher in 2024 than in 2022</td>")
h = rep(h, "<tr><td>EU share of Vietnam's cumulative FDI</td>", "<tr><td>EU share of Vietnam's cumulative registered FDI</td>")
def fdi(V):
    s = V["A8s"]
    s["title"] = "EU share of Vietnam's cumulative registered FDI: ≈7.6% in 2019, ≈5.6% in a mixed-date estimate"
    s["notes"] = ["Registered (not disbursed) capital. ≈5.6% is the authors' estimate in the report: US$27.8 bn (end-2022) ÷ US$496.7 bn (total at 30 Nov 2024), so the two figures refer to different dates and the fall may be overstated.",
                  "A same-date share (EU capital and national total at the same date) could not be verified; the 2019 value is from the authors' earlier draft."]
    s["source"] = "2019: authors' earlier draft (original source not confirmed); EEAS; authors' estimate (Table 3.7)."
    s["sowhat"] = "EU registered capital keeps growing; its share appears lower, but the estimate mixes dates."
    s["aria"] = "Bars: EU share of Vietnam's cumulative registered FDI, about 7.6% in 2019 and about 5.6% in a mixed-date estimate (end-2022 EU capital divided by the national total at 30 November 2024)."
    V["A8i"]["sowhat"] = "Annual European inflows were higher in 2024 than in 2022; two years are not a trend."
viz(fdi)

# ---- C. Table 3.4 and its chart (slides 46–47): one criterion for both sides (share of tariff lines) ----
h = rep(h, "<td>At entry into force (1 Aug 2020)</td><td>About 84–86% of tariff lines duty-free (≈70% of Vietnam's export value)</td><td>About 65% of duties removed</td>",
           "<td>At entry into force (1 Aug 2020)</td><td>85.6% of tariff lines duty-free (70.3% of Vietnam's export value to the EU)</td><td>48.5% of tariff lines duty-free (64.5% of EU export value to Vietnam)</td>")
h = rep(h, "<td>Final phase-out</td><td>≈99% of lines (≈99.7% of export value) after 7 years (by 2027)</td><td>Remaining duties removed by 2030 (up to 10 years)</td>",
           "<td>Final phase-out</td><td>99.2% of tariff lines (99.7% of export value) after 7 years (by 2027)</td><td>91.8% of tariff lines (97.1% of export value) after 7 years; remaining duties removed by 2030 (up to 10 years)</td>")
h = rep(h, "<p class=\"src\"><b>Source:</b> European Commission, Access2Markets; Ministry of Industry and Trade of Vietnam. Percentages of tariff lines and trade value are official approximations and differ slightly between sources.</p>",
           "<p class=\"src\"><b>Source:</b> Ministry of Industry and Trade of Vietnam; European Commission, Access2Markets. Both sides are given as shares of tariff lines, with the share of trade value in brackets.</p>"
           "<!-- TODO(verify): Vietnam 91.8% of lines / 97.1% of value after 7 years is quoted from secondary summaries of the MOIT commitments (fili.vn, Lai Chau DOST); check against the MOIT article text. -->")
def tariff(V):
    s = V["A7b"]
    s["title"] = "Measured the same way, the EU opens faster: 99.2% of tariff lines by 2027, Vietnam 91.8% (the rest by 2030)"
    s["unit"] = "Share of tariff lines duty-free, both parties (Ministry of Industry and Trade of Vietnam)."
    s["aria"] = "Bars on a 0–100% scale, share of tariff lines duty-free. EU on Vietnamese goods: 85.6% at entry into force on 1 August 2020, 99.2% after seven years (2027). Vietnam on EU goods: 48.5% at entry into force, 91.8% after seven years, the remaining lines by 2030."
    s["rows"][0]["entry"] = {"v": {"v": 85.6, "s": "exact"}, "short": "85.6%", "label": "85.6% of lines duty-free at entry"}
    s["rows"][0]["final"] = {"v": {"v": 99.2, "s": "exact"}, "label": "99.2% of lines by 2027"}
    s["rows"][1]["entry"] = {"v": {"v": 48.5, "s": "exact"}, "short": "48.5%", "label": "48.5% of lines duty-free at entry"}
    s["rows"][1]["final"] = {"v": {"v": 91.8, "s": "exact"}, "label": "91.8% of lines by 2027; the rest by 2030"}
    s["notes"] = ["Same criterion for both sides: share of tariff lines. By trade value: EU 70.3% at entry and 99.7% after 7 years; Vietnam 64.5% at entry and 97.1% after 7 years."]
    s["source"] = "Ministry of Industry and Trade of Vietnam; European Commission, Access2Markets (Table 3.4)."
viz(tariff)

# ---- D. Table 3.5 and Figure 3.1 (slides 49–50): 2019 EU imports straight from Eurostat, percentages recomputed ----
h = rep(h, '<tr><td>2019*</td><td class="num">34.5</td><td class="num">11.1</td><td class="num">45.6</td><td class="num">–23.4</td></tr>',
           '<tr><td>2019*</td><td class="num">34.4</td><td class="num">≈11.2</td><td class="num">45.6</td><td class="num">≈–23.2</td></tr>')
h = rep(h, '<tr><td>Change 2019–2025</td><td class="num">+85%</td><td class="num">+10%</td><td class="num">+67%</td><td class="num">deficit more than doubled (+121%)</td></tr>',
           '<tr><td>Change 2019–2025</td><td class="num">+86%</td><td class="num">≈+9%</td><td class="num">+67%</td><td class="num">deficit more than doubled (≈+123%)</td></tr>')
h = rep(h, '<p class="tnote">*2019 is approximate: derived from a total of €45.6 bn and a deficit of €23.4 bn reported by Upply (2025), also based on Eurostat. "EU imports from Vietnam" are Vietnam\'s exports to the EU.</p>',
           '<p class="tnote">*2019: EU imports from Vietnam €34.4 bn (Eurostat, ASEAN-EU international trade in goods statistics); total €45.6 bn as reported by Upply (2025), based on Eurostat; EU exports (≈11.2) and the balance (≈–23.2) are derived from these two figures (Upply gives a deficit of €23.4 bn; the gap is rounding). "EU imports from Vietnam" are Vietnam\'s exports to the EU.</p>'
           '<!-- TODO(verify): 2019 EU exports to Vietnam in EUR not found as a single Eurostat figure; replace the derived ≈11.2 when the DG Trade factsheet table is read. -->'
           '\n    <p class="tnote">Growth since 2020 is not due to the EVFTA alone: as Section 3.4.1 notes, trade growth reflects the EVFTA together with global demand, supply chains and wider integration.</p>')
h = rep(h, "<tr><td>2019*</td><td>34.5</td><td>11.1</td><td>45.6</td></tr>", "<tr><td>2019*</td><td>34.4</td><td>≈11.2</td><td>45.6</td></tr>")
def t35(V):
    b = V["F3.1"]["bars"][0]
    b["exports"] = {"v": 34.4, "s": "exact", "txt": "34.4"}; b["imports"] = {"v": 11.2, "s": "derived", "txt": "11.2", "from": "45.6 − 34.4"}
    V["F3.1"]["notes"][0] = "*2019: EU imports from Vietnam €34.4 bn (Eurostat); total €45.6 bn (Upply, based on Eurostat); EU exports derived (45.6 − 34.4 ≈ 11.2); see the note to Table 3.5."
viz(t35)
add_refs([("Eurostat. (n.d.). ASEAN-EU – international trade in goods statistics. Statistics Explained.", "https://ec.europa.eu/eurostat/statistics-explained/index.php/ASEAN-EU_-_international_trade_in_goods_statistics"),
          ("Vietnam Briefing. (n.d.-b). Vietnam-EU trade surplus underlines growing trade, relations.", "https://www.vietnam-briefing.com/news/vietnam-eu-trade-surplus-underlines-growing-trade-relations.html/")])
h = rep(h, "Vietnam Briefing. (n.d.). What EU's sustained investment", "Vietnam Briefing. (n.d.-a). What EU's sustained investment")

# ---- E. Table 3.6 (slide 51): where the 2019 column comes from ----
h = rep(h, "VietnamPlus (2025). 2019 figures on an EU-27 basis; changes calculated by the authors.</p>",
           "VietnamPlus (2025). 2019 figures on an EU-27 basis, as given in the authors' earlier draft; Vietnam Briefing (n.d.-b) reports US$35.8 bn and US$14.1 bn for 2019 citing Eurostat, so the 2019 column may not be Vietnamese statistics. Changes calculated by the authors.</p>"
           "<!-- TODO(verify): source of the 2019 column of Table 3.6 (35.8 / 14.0). -->")

# ---- F. Slide 45: the EVIPA status is that of Nov 2025 ----
h = rep(h, "<tr><td>Status (Oct 2026)</td><td>In force since 1 Aug 2020</td><td>Not in force; 20 of 27 ratified by Nov 2025, France's bill before Parliament (Jul 2026)</td></tr>",
           "<tr><td>Status</td><td>In force since 1 Aug 2020</td><td>Not in force; 20 of 27 member states had ratified as of Nov 2025; France's ratification bill sent to Parliament on 27 Jul 2026</td></tr>"
           "<!-- TODO(verify): number of member states that have ratified the EVIPA after Nov 2025 (Germany's status is reported inconsistently). -->")

# ---- G. Slide 52: the certificates of origin are for all FTAs ----
h = rep(h, '<p class="tag">2024 · all FTAs</p><h3>About 1.8 million certificates of origin</h3>',
           '<p class="tag">2024 · all of Vietnam\'s FTAs, not the EVFTA alone</p><h3>About 1.8 million certificates of origin</h3>')

# ---- H. Conclusion: the latest year of the body text ----
h = rep(h, "bilateral trade rose from about US$49.8 billion in 2019 to about US$68 billion in 2024,",
           "bilateral trade rose from about US$49.8 billion in 2019 to about US$74 billion in 2025 (€76.0 billion in EU statistics),")
h = re.sub(r"(Với Việt Nam: thương mại tăng từ khoảng 49,8 tỷ USD \(2019\) lên )khoảng 68 tỷ USD \(2024\)", r"\1khoảng 74 tỷ USD (2025; 76,0 tỷ euro theo số liệu EU)", h)
h = rep(h, "Nhập khẩu của EU từ Việt Nam tăng 85%; thâm hụt của EU tăng hơn gấp đôi.", "Nhập khẩu của EU từ Việt Nam tăng 86% (2019: 34,4 tỷ euro theo Eurostat); thâm hụt của EU tăng hơn gấp đôi.")

# ---- I. Table 2.3 ratio and value-added indicator: not verified, left as TODO ----
h = rep(h, "<tr><td>Ratio of exports to imports of goods and services</td><td>Around 1.08–1.09</td></tr>",
           "<tr><td>Ratio of exports to imports of goods and services</td><td>Around 1.08–1.09</td></tr><!-- TODO(verify): year, scope (goods or goods and services) and source of this ratio; no Eurostat figure found. -->")
P.write_text(h, encoding="utf-8")
print("ok")
# appended manually: tariff-path legend shows the hatched "range" key only when a range is drawn
