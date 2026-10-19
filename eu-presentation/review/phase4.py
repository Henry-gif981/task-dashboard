#!/usr/bin/env python3
"""Review 2026-10, phase 4: fact checks of part B. Run once from eu-presentation/."""
import html as H, json, re
from pathlib import Path
from urllib.parse import unquote
ROOT = Path(__file__).resolve().parent.parent
P = ROOT / "index.html"; h = P.read_text(encoding="utf-8")
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:110]); return s.replace(a, b)
def viz(fn):
    global h
    m = re.search(r'(<script type="application/json" id="viz-data">)(.*?)(</script>)', h, re.S)
    d = json.loads(m.group(2)); fn({x["key"]: x for x in d["visuals"]})
    h = h[:m.start(2)] + json.dumps(d, ensure_ascii=False) + h[m.end(2):]
def add_refs(entries):
    global h
    m = re.search(r'(<ul class="refs mt">\n)(.*?)(\n      <!-- TODO\(verify\))', h, re.S)
    items = m.group(2).split("\n")
    for t, u in entries:
        shown = H.escape(unquote(u)).replace("/", "/<wbr>").replace("-", "-<wbr>").replace("/<wbr>/<wbr>", "//")
        items.append(f'      <li>{H.escape(t, quote=False)} <a class="ref-url" href="{u}" target="_blank" rel="noopener">{shown}</a></li>')
    items.sort(key=lambda s: re.sub(r"<[^>]+>", "", s).strip().lower())
    h = h[:m.start(2)] + "\n".join(items) + h[m.end(2):]

# B1 South Korea: provisional application 1 July 2011, in force 13 December 2015
h = rep(h, "<tr><td>South Korea</td><td>Provisionally applied from 2011</td>", "<tr><td>South Korea</td><td>Provisionally applied from 1 July 2011; in force since 13 December 2015</td>")
# B2 United Kingdom: provisional application 1 January 2021, in force 1 May 2021
h = rep(h, "<tr><td>United Kingdom (TCA)</td><td>Applied since 1 May 2021</td>", "<tr><td>United Kingdom (TCA)</td><td>Provisionally applied from 1 January 2021; in force since 1 May 2021</td>")
# B4 Singapore: in the report's paragraph (2019) but missing from Table 2.4 and its timeline
h = rep(h, "<tr><td>Vietnam (EVFTA)</td><td>In force since 1 August 2020</td>",
           "<tr><td>Singapore</td><td>In force since 21 November 2019</td><td>Removal of remaining tariffs; services, public procurement and intellectual property; investment protection in a separate agreement, not yet in force</td></tr>\n        <tr><td>Vietnam (EVFTA)</td><td>In force since 1 August 2020</td>")
h = rep(h, "Sullivan &amp; Cromwell (2026); Bundesbank (2026); DLA Piper (2026); Ebner Stolz (2026).</p>",
           "Sullivan &amp; Cromwell (2026); Bundesbank (2026); DLA Piper (2026); Ebner Stolz (2026); European Commission (2021); Ministry of Trade and Industry Singapore (2019).</p>")
def a4(V):
    s = V["A4"]
    s["source"] += "" if "Singapore" in s["source"] else ""
    s["source"] = s["source"].rstrip(".") + "; European Commission (2021); Ministry of Trade and Industry Singapore (2019)."
    rows = {r["partner"]: r for r in s["rows"]}
    rows["South Korea"]["status"] = "force"
    rows["South Korea"]["events"] = [{"date": {"v": "1 July 2011", "s": "exact", "pos": "2011-07-01"}, "what": "Provisionally applied", "type": "step"},
                                     {"date": {"v": "13 December 2015", "s": "exact", "pos": "2015-12-13"}, "what": "In force", "type": "force"}]
    rows["United Kingdom (TCA)"]["events"] = [{"date": {"v": "1 January 2021", "s": "exact", "pos": "2021-01-01"}, "what": "Provisionally applied", "type": "step"},
                                              {"date": {"v": "1 May 2021", "s": "exact", "pos": "2021-05-01"}, "what": "In force", "type": "force"}]
    i = [r["partner"] for r in s["rows"]].index("Vietnam (EVFTA)")
    s["rows"].insert(i, {"partner": "Singapore", "status": "force", "events": [{"date": {"v": "21 November 2019", "s": "exact", "pos": "2019-11-21"}, "what": "In force", "type": "force"}]})
    if "notes" in s: s["notes"] = [n for n in s["notes"] if not n.startswith("South Korea: Table 2.4 gives the year only")] or None
    if not s.get("notes"): s.pop("notes", None)
    s["aria"] = ("Timeline of the nine agreements in Table 2.4: South Korea provisionally applied from 1 July 2011 and in force since 13 December 2015; Canada (CETA) provisionally applied since September 2017; "
                 "Japan in force since 1 February 2019; Singapore in force since 21 November 2019; Vietnam (EVFTA) in force since 1 August 2020; United Kingdom (TCA) provisionally applied from 1 January 2021 and in force since 1 May 2021; "
                 "New Zealand in force since 1 May 2024; Mercosur signed 17 January 2026 and interim agreement provisionally applied from 1 May 2026; India negotiations concluded 27 January 2026.")
viz(a4)

# B3 Opinion 2/15 concerned the EU–Singapore FTA (Court of Justice, 16 May 2017)
h = rep(h, "In May 2017 the Court of Justice of the EU (Opinion 2/15) ruled", "In May 2017 the Court of Justice of the EU (Opinion 2/15, on the EU–Singapore FTA) ruled")
h = rep(h, "<b>CJEU Opinion 2/15 · May 2017</b>", "<b>CJEU Opinion 2/15 (on the EU–Singapore FTA) · May 2017</b>")
h = rep(h, '"text": "CJEU Opinion 2/15: investment protection is a shared competence; the package is split"', '"text": "CJEU Opinion 2/15 on the EU–Singapore FTA (16 May 2017): investment protection is a shared competence; the package is split"')

# B5 CBAM: definitive period from 2026, certificates sold from 1 Feb 2027, first surrender by 30 Sep 2027
h = rep(h, "CBAM moved from a reporting phase (October 2023 to end-2025) to a definitive regime in 2026: importers of certain carbon-intensive products must buy certificates.",
           "CBAM moved from a reporting phase (October 2023 to end-2025) to a definitive regime in 2026: importers of certain carbon-intensive products pay for the emissions embedded in goods imported from 2026 by buying and surrendering CBAM certificates; sales start on 1 February 2027 and the first surrender is due by 30 September 2027 (DEHSt, n.d.).")
h = rep(h, "CBAM chuyển sang giai đoạn chính thức năm 2026;", "CBAM chuyển sang giai đoạn chính thức năm 2026 (hàng nhập từ 2026; chứng chỉ bán từ 1/2/2027, nộp lần đầu trước 30/9/2027);")

# B6 2040 target: adopted (Council final approval 5 March 2026, amending the European Climate Law)
h = rep(h, '<p class="l">reduction target for 2040 proposed by the Commission</p>', '<p class="l">net reduction target for 2040, written into the European Climate Law in 2026</p>')
h = rep(h, "mục tiêu 90% cho 2040 do Ủy ban đề xuất", "mục tiêu 90% cho 2040 (đã thông qua: Hội đồng EU phê duyệt cuối cùng ngày 5/3/2026)")
def a5(V):
    s = V["A5"]
    s["title"] = "EU climate targets: at least −55% by 2030, −90% by 2040 (adopted in 2026), neutrality by 2050"
    s["aria"] = s["aria"].replace("10 in 2040 (90% reduction proposed by the Commission)", "10 in 2040 (90% reduction, adopted in 2026)")
    s["notes"] = [n.replace("2040 = 100 − 90 (target proposed by the Commission, as stated in the report)", "2040 = 100 − 90 (adopted on 5 March 2026 by amending the European Climate Law; the report still describes it as proposed)") for n in s["notes"]]
    s["source"] = s["source"].rstrip(".") + "; Council of the European Union (2026)."
    for p in s["points"]:
        if p["type"] == "proposed":
            p["type"] = "target"; p["label"] = "Target: −90% (adopted 2026)"; p["short"] = "−90%"; p["index"]["from"] = "100 − 90 (90% net reduction, adopted 2026)"
viz(a5)

# B7 JETP: the US$15.5 bn is the initial pledge of December 2022; the United States withdrew in March 2025
h = rep(h, '<p class="t">JETP launched with an initial US$15.5 billion pledge; first flagship projects announced in 2025</p>',
           '<p class="t">JETP launched (December 2022) with an initial US$15.5 billion pledge; the United States withdrew in March 2025; first flagship projects announced in 2025</p>'
           '<!-- TODO(verify): remaining JETP pledge for Vietnam after the US withdrawal (no official figure found). -->')
h = rep(h, "<td>Finance and technology (JETP US$15.5 bn; Global Gateway &gt; €560 m)</td>", "<td>Finance and technology (JETP: initial US$15.5 bn pledge, 2022; Global Gateway &gt; €560 m)</td>")
def b1(V):
    for lane in V["B1"]["lanes"]:
        for it in lane["items"]:
            if it["text"].startswith("JETP launched with an initial US$15.5 billion pledge"):
                it["text"] = "JETP launched (December 2022) with an initial US$15.5 billion pledge; the United States withdrew in March 2025; first flagship projects announced in 2025"
viz(b1)

# B8 2026 events: all confirmed; France's bill: official Senate record added as a source
def b2(V):
    V["B2"]["source"] = V["B2"]["source"].rstrip(".") + "; Sénat (2026)."
viz(b2)

add_refs([
 ("Court of Justice of the European Union. (2017, May 16). The free trade agreement with Singapore cannot, in its current form, be concluded by the EU alone [Press release No 52/17, Opinion 2/15].", "https://curia.europa.eu/jcms/upload/docs/application/pdf/2017-05/cp170052en.pdf"),
 ("Ministry of Trade and Industry Singapore. (2019, November). The EU-Singapore Free Trade Agreement enters into force [Press release].", "https://www.mti.gov.sg/Newsroom/Press-Releases/2019/11/EUSFTA-Entry-Into-Force"),
 ("European Commission. (2021). EU-UK Trade and Cooperation Agreement.", "https://commission.europa.eu/strategy-and-policy/relations-united-kingdom/eu-uk-trade-and-cooperation-agreement_en"),
 ("DEHSt [German Emissions Trading Authority]. (n.d.). CBAM certificates: CBAM definitive regime from 2026.", "https://www.dehst.de/EN/Topics/CBAM/CBAM-definitive-regime-2026/CBAM-certificates/cbam-certificates_node.html"),
 ("Council of the European Union. (2026, March 5). 2040 climate target: Council gives final green light [Press release].", "https://www.consilium.europa.eu/en/press/press-releases/2026/03/05/2040-climate-target-council-gives-final-green-light/"),
 ("Center for Strategic and International Studies. (2025, March). The latest on Southeast Asia: U.S. withdrawal from JETP.", "https://www.csis.org/blogs/latest-southeast-asia/latest-southeast-asia-us-withdrawal-jetp"),
 ("Sénat. (2026, July 27). Projet de loi n° 920 autorisant la ratification de l'accord de protection des investissements entre l'Union européenne et ses États membres et le Viet Nam.", "https://www.senat.fr/leg/pjl25-920.pdf"),
])
P.write_text(h, encoding="utf-8")

# source links for the new citations
EXTRA = ['    [/European Commission \\(2021\\)/, { url: "https://commission.europa.eu/strategy-and-policy/relations-united-kingdom/eu-uk-trade-and-cooperation-agreement_en", title: "European Commission: EU-UK Trade and Cooperation Agreement" }],',
         '    [/Ministry of Trade and Industry Singapore \\(2019\\)/, { url: "https://www.mti.gov.sg/Newsroom/Press-Releases/2019/11/EUSFTA-Entry-Into-Force", title: "MTI Singapore: The EU-Singapore FTA enters into force (21 November 2019)" }],',
         '    [/Council of the European Union \\(2026\\)/, { url: "https://www.consilium.europa.eu/en/press/press-releases/2026/03/05/2040-climate-target-council-gives-final-green-light/", title: "Council of the EU, 5 March 2026: 2040 climate target, final green light" }],',
         '    [/Sénat \\(2026\\)/, { url: "https://www.senat.fr/leg/pjl25-920.pdf", title: "Sénat, projet de loi n° 920 (27 July 2026): ratification of the EU–Vietnam investment protection agreement" }],']
for f in [P, ROOT / "v3b" / "src" / "sources.js"]:
    s = f.read_text(encoding="utf-8")
    s = rep(s, '    [/European Commission, Access2Markets/, "access2markets-evfta"],\n', '    [/European Commission, Access2Markets/, "access2markets-evfta"],\n' + "\n".join(EXTRA) + "\n")
    f.write_text(s, encoding="utf-8")
print("ok")
