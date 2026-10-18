"""Build EU_presentation_standalone_v2b.html: v2 + visuals that fill the empty space of sparse slides.

Usage (from eu-presentation/):  python3 v2b/build_v2b.py
Input : v3/index.v2.backup.html (v2 source page) and viz_data.json (v2 chart data)
Output: v2b/src/index_v2b.html (source, next to the fonts/vendor folders it expects via ROOT),
        v2b/src/viz_data_v2b.json, v2b/EU_presentation_standalone_v2b.html (single file)
Every number below is taken from "BTL Đa biên – Nhóm 4" v5; see v2b/VISUALS_CHANGELOG.md.
"""
import base64, html, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "v3" / "index.v2.backup.html"
h = SRC.read_text(encoding="utf-8")
E = html.escape

def section(sid):
    m = re.search(r'<section[^>]*\bid="%s"[^>]*>.*?</section>' % re.escape(sid), h, re.S)
    assert m, sid
    return m

def edit(sid, fn):
    global h
    m = section(sid); new = fn(m.group(0)); assert new != m.group(0), f"no change in {sid}"
    h = h[:m.start()] + new + h[m.end():]

def once(s, a, b):
    assert s.count(a) == 1, (s.count(a), a[:80])
    return s.replace(a, b)

def fig(label, title, body, sowhat, source, schematic=False, cls="", extra_attr=""):
    sch = '<p class="vz-schematic">Schematic, not measured</p>' if schematic is True else (f'<p class="vz-schematic">{E(schematic)}</p>' if schematic else "")
    return (f'<figure class="vz vb rv {cls}" aria-label="{E(title)}"{extra_attr}>'
            f'<figcaption class="vz-head"><span class="vz-lbl">{E(label)}</span><span class="vz-title">{E(title)}</span></figcaption>'
            f'{sch}{body}<p class="vz-sowhat">{sowhat}</p><p class="src"><b>Source:</b> {source}</p></figure>')

def svg(vb_w, vb_h, inner, label, maxw=None):
    st = f' style="max-width:{maxw}px;margin:0 auto"' if maxw else ""
    return f'<svg viewBox="0 0 {vb_w} {vb_h}" role="img" aria-label="{E(label)}"{st}>{inner}</svg>'

def txt(x, y, s, size=15, anchor="start", weight=400, fill="#0B1B3A", extra=""):
    a = f' text-anchor="{anchor}"' if anchor != "start" else ""
    w = f' font-weight="{weight}"' if weight != 400 else ""
    return f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}"{a}{w} fill="{fill}"{extra}>{E(s)}</text>'

BLUE, GOLD, NAVY, INK, INK2, TINT, TINT2, LINE, GREY = "#003399", "#FFCC00", "#001A57", "#0B1B3A", "#4A5A78", "#E8EEF9", "#F4F7FC", "#D3DCEC", "#7C879C"
LOG = []   # (visual, shown value, source in the report)
def log(v, shown, src): LOG.append((v, shown, src))

# =====================================================================
# B1 · Introduction: "EU at a glance" + the three-chapter path
# =====================================================================
b1 = fig("Visual · Introduction", "From six coal-and-steel partners to a 27-member union",
  '<div class="kpis small">'
  '<div class="kpi"><p class="v"><span class="kv" data-to="1951">1951</span></p><p class="l">a six-country community for coal and steel</p></div>'
  '<div class="kpi"><p class="v"><span class="kv" data-to="27">27</span></p><p class="l">member states today, with a single market and a common trade policy</p></div>'
  '<div class="kpi gold"><p class="v"><span class="kv" data-to="21">21</span></p><p class="l">use the euro since Bulgaria joined on 1 January 2026</p></div></div>'
  '<p class="cap" style="margin-top:var(--s3)"><span class="lbl">Route of the report</span></p>'
  '<div class="vb-steps" role="list" aria-label="Three chapters">'
  '<div class="st" role="listitem"><i>Chapter 1</i><b>Theory and overview</b><span>Levels of integration; formation, institutions, policies</span></div><div class="ar" aria-hidden="true">→</div>'
  '<div class="st" role="listitem"><i>Chapter 2</i><b>Region and world</b><span>Economic and political integration; trade, governance, standards</span></div><div class="ar" aria-hidden="true">→</div>'
  '<div class="st" role="listitem" style="border-top-color:var(--gold)"><i>Chapter 3</i><b>Vietnam</b><span>EVFTA and EVIPA, standards, green transition, recommendations</span></div></div>',
  "The EU is the most advanced and most institutionalised model of regional integration, and Vietnam meets it as market, investor and standard-setter.",
  "Introduction and Section 2.1.1 of the report; compiled by the authors.")
log("B1 Introduction", "1951; six-country community", "Introduction, p. 2")
log("B1 Introduction", "27 member states", "Introduction, p. 2")
log("B1 Introduction", "21 euro members since 1 January 2026 (Bulgaria)", "Section 2.1.1, p. 14")
edit("introduction", lambda s: once(once(s, '<div class="wrap">\n    <div class="copy">', '<div class="wrap">\n    <div class="vz-split even">\n    <div class="copy">'),
     '    </div>\n  </div>\n</section>', '    </div>\n    ' + b1 + '\n    </div>\n  </div>\n</section>'))

# =====================================================================
# B2 · 1.1.1 Concept: nested scopes + benefits / costs
# =====================================================================
b2_svg = svg(440, 250,
  f'<g><title>Global (multilateral) integration: common rules for trade and investment through multilateral institutions and agreements</title><rect x="2" y="2" width="436" height="246" rx="16" fill="{TINT2}" stroke="{BLUE}" stroke-width="1.5"/>'
  + txt(18, 30, "GLOBAL LEVEL", 13, weight=700, fill=BLUE) + txt(18, 50, "multilateral institutions and agreements", 15, fill=INK2) + '</g>'
  f'<g><title>Regional integration: neighbouring countries remove barriers through preferential arrangements, common policies or shared institutions</title><rect x="48" y="74" width="344" height="156" rx="12" fill="{TINT}" stroke="{BLUE}" stroke-width="1.5"/>'
  + txt(66, 102, "REGIONAL LEVEL", 13, weight=700, fill=BLUE) + txt(66, 124, "a smaller group of neighbouring countries", 15, fill=INK)
  + txt(66, 146, "preferential trade arrangements,", 15, fill=INK2) + txt(66, 166, "common policies, shared institutions", 15, fill=INK2) + '</g>'
  f'<g><title>The EU: the most advanced example of regional integration</title><rect x="232" y="182" width="142" height="34" rx="17" fill="{BLUE}"/>' + txt(303, 204, "e.g. the EU", 15, "middle", 700, "#FFFFFF", ' data-bg="#003399"') + '</g>',
  "Global integration contains regional integration; the EU is an example of the regional level.", 560)
b2 = fig("Visual · Section 1.1.1 · Schematic", "Regional integration is integration among neighbours, inside the global system", b2_svg +
  '<div class="vb-pair" style="margin-top:var(--s3);gap:var(--s3)">'
  '<div><p class="cap"><span class="lbl">Benefits</span></p><ul class="bul" style="margin-top:8px;gap:6px"><li>Economic efficiency and specialisation</li><li>Larger markets and economies of scale</li><li>More trade and investment; competitiveness</li><li>Peace, stability and bargaining power</li></ul></div>'
  '<div><p class="cap"><span class="lbl">Costs</span></p><ul class="bul" style="margin-top:8px;gap:6px"><li>Stronger competition for domestic firms</li><li>Adjustment costs for workers</li><li>Policy responsibilities shared with regional institutions</li></ul></div></div>',
  "Regional integration is not simply an economic process: it also has political and institutional dimensions.",
  "Compiled by the authors from Section 1.1.1 of the report.", schematic=True)
edit("c1-concept", lambda s: once(once(s, '<div class="wrap">\n    <div class="copy">', '<div class="wrap">\n    <div class="vz-split even">\n    <div class="copy">'),
     '    </div>\n  </div>\n</section>', '    </div>\n    ' + b2 + '\n    </div>\n  </div>\n</section>'))

# =====================================================================
# B8 · Chapter 1 takeaway (end of 1.2.3)
# =====================================================================
def takeaway(chap, sentence, nums, source):
    return ('<div class="takeaway rv" role="group" aria-label="%s takeaway"><div><span class="lbl2">%s · takeaway</span><p>%s</p></div><div class="nums">%s</div><p class="src"><b>Source:</b> %s</p></div>'
            % (E(chap), E(chap), sentence, "".join(f"<div><b>{E(v)}</b><span>{E(l)}</span></div>" for v, l in nums), source))
t1 = takeaway("Chapter 1", "The EU is not simply a trade bloc but a multidimensional system: economic integration, law, institutions, political coordination and external relations.",
  [("1951", "six founding countries (ECSC)"), ("28", "members at the peak (2013–2020)"), ("27", "member states since Brexit (2020)")],
  "Sections 1.1.3 and 1.2.1 (Table 1.1) of the report.")
log("B8 Chapter 1 takeaway", "1951, six countries; 28 members (2013); 27 since 2020", "Table 1.1, pp. 8–9")
edit("c1-principles", lambda s: once(s, '<p class="src"><b>Source:</b> Treaty on European Union (Articles 2 and 3).</p>\n  </div>',
     '<p class="src"><b>Source:</b> Treaty on European Union (Articles 2 and 3).</p>\n    ' + t1 + '\n  </div>'))

# =====================================================================
# A2 · 2.2.1a: one voice + one seventh
# =====================================================================
tiles = "".join(f'<g><title>{"The EU: about one seventh of global trade in goods" if i == 0 else "Rest of the world (one seventh)"}</title><rect x="{4 + i * 62}" y="4" width="54" height="54" rx="4" fill="{GOLD if i == 0 else TINT}" stroke="{NAVY if i == 0 else LINE}" stroke-width="1.5"/></g>' for i in range(7))
a2 = fig("Visual · Section 2.2.1", "The EU negotiates trade with one voice for all 27",
  '<div class="vb-steps" role="list" aria-label="How an EU trade agreement is made">'
  '<div class="st" role="listitem"><i>1 · Council</i><b>Gives the mandate</b><span>Member States authorise the negotiation</span></div><div class="ar" aria-hidden="true">→</div>'
  '<div class="st" role="listitem"><i>2 · Commission</i><b>Negotiates for all 27</b><span>Member States may not conclude their own agreements</span></div><div class="ar" aria-hidden="true">→</div>'
  '<div class="st" role="listitem"><i>3 · Parliament</i><b>Gives its consent</b><span>to the final agreement</span></div></div>'
  '<div style="display:grid;grid-template-columns:auto 1fr;gap:var(--s3);align-items:center;margin-top:var(--s3)">'
  + svg(440, 62, tiles, "Seven squares, one gold: the EU accounts for roughly one seventh of global trade in goods", 300) +
  '<p style="margin:0;font-size:.9rem;color:var(--ink)"><b style="font:600 1.6rem/1 var(--serif);color:var(--blue)">≈ 1/7</b><br>of global trade in goods: one of the three largest trading powers, with the United States and China</p></div>',
  "Speaking with one voice gives the Union a bargaining power that no individual Member State could match.",
  "Section 2.2.1 of the report (Common Commercial Policy); compiled by the authors.")
log("A2 2.2.1", "Council mandate → Commission negotiates for all 27 → Parliament consent", "Section 2.2.1, p. 17")
log("A2 2.2.1", "≈ one seventh of global trade in goods", "Section 2.2.1, p. 17")
edit("c2-trade", lambda s: re.sub(r'(    <ul class="bul">.*?</ul>)', lambda m: '    <div class="vb-pair wide-right">\n' + m.group(1) + '\n    ' + a2 + '\n    </div>', s, count=1, flags=re.S))

# =====================================================================
# A3 · 2.2.2a: where the EU has a seat (Table 2.5)
# =====================================================================
SEATS = [("UN General Assembly", "part", "Enhanced observer (2011)", "can speak and propose, cannot vote"),
         ("World Trade Organization", "full", "Full member", "alongside its 27 Member States"),
         ("G7", "part", "Participates", "represented by the two Presidents"),
         ("G20", "full", "Full member", "represented by the two Presidents"),
         ("IMF", "none", "Not a member", "Member States have separate chairs"),
         ("World Bank", "none", "Not a member", "Member States have separate chairs"),
         ("FAO", "full", "Member organisation", "a rare full member of a UN agency"),
         ("Paris Agreement", "full", "Party", "joint nationally determined contribution")]
rows = "".join(f'<div class="org">{E(o)}</div><div><span class="chip {c}" title="{E(o)}: {E(l)}; {E(d)}">{E(l)}</span></div>' for o, c, l, d in SEATS)
a3 = fig("Visual · Section 2.2.2 (Table 2.5)", "The EU sits at the table in trade and climate, but not in the IMF or the World Bank",
  f'<div class="seats" role="table" aria-label="EU status in eight international organisations"><div class="org" style="font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--blue)">Organisation</div><div style="font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--blue);font-weight:700">EU status</div>{rows}</div>'
  '<div class="chip-legend"><span class="chip full">Full member / party</span><span class="chip part">Observer / participant</span><span class="chip none">Not a member</span></div>',
  "The EU's weight in global governance is lower than its economic weight would suggest.",
  "United Nations; WTO; European External Action Service; compiled by the authors (Table 2.5).")
for o, c, l, d in SEATS: log("A3 2.2.2", f"{o}: {l}", "Table 2.5, p. 21")
edit("c2-governance", lambda s: re.sub(r'(    <p class="note rv mt">In the WTO.*?</p>)', lambda m: '    <div class="vb-pair wide-right">\n' + m.group(1).replace('class="note rv mt"', 'class="note rv"') + '\n    ' + a3 + '\n    </div>', s, count=1, flags=re.S))

# =====================================================================
# A4 · 2.2.3a: standard-setting instruments on a time line, by field (Table 2.6)
# =====================================================================
X0, X1, Y0 = 200, 985, 2004
xy = lambda yr: X0 + (yr - Y0) * (X1 - X0) / (2027 - Y0)
LANES = [("Climate and finance", BLUE, "#FFFFFF", [("EU ETS", 2005, "a1"), ("Green Deal", 2019, "a1"), ("EU Taxonomy", 2020, "b1"), ("Climate Law", 2021, "a2"), ("CSRD", 2022, "b2"), ("CBAM", (2023.75, 2026), "b1")], 150),
         ("Data and digital", NAVY, "#FFFFFF", [("GDPR", 2018, "a1"), ("AI Act", 2024, "a1")], 80),
         ("Chemicals and products", GREY, "#FFFFFF", [("REACH", 2007, "a1")], 80),
         ("External action", GOLD, NAVY, [("Global Gateway", 2021, "a1")], 80)]
DESC = {"EU ETS": "2005: EU Emissions Trading System, the world's first large carbon market", "Green Deal": "2019: European Green Deal, strategy for climate neutrality by 2050",
        "EU Taxonomy": "2020: EU Taxonomy for sustainable finance", "Climate Law": "2021: European Climate Law, climate neutrality by 2050 and −55% net by 2030",
        "CSRD": "2022: Corporate Sustainability Reporting Directive", "CBAM": "CBAM: transitional phase 2023–2025 (from October 2023), definitive regime from 2026",
        "GDPR": "2018: General Data Protection Regulation", "AI Act": "2024: Artificial Intelligence Act", "REACH": "2007: REACH Regulation on chemicals",
        "Global Gateway": "2021: Global Gateway, up to EUR 300 billion by 2027"}
y, inner = 10, ""
for t in range(2005, 2027, 3):
    inner += f'<line x1="{xy(t):.1f}" x2="{xy(t):.1f}" y1="6" y2="{sum(l[4] for l in LANES) + 8}" stroke="{LINE}"/>'
for name, col, tcol, items, hgt in LANES:
    cy = y + hgt / 2
    inner += f'<rect x="0" y="{y}" width="{X1 + 10}" height="{hgt - 6}" fill="{TINT2}" rx="4"/>' + txt(10, cy + 5, name, 15, weight=700, fill=INK)
    inner += f'<line x1="{X0 - 8}" x2="{X1}" y1="{cy}" y2="{cy}" stroke="{LINE}" stroke-width="2"/>'
    for lab, yr, pos in items:
        d = {"a1": -18, "a2": -42, "b1": 32, "b2": 56}[pos]
        if isinstance(yr, tuple):
            xa, xb = xy(yr[0]), xy(yr[1]); xc = (xa + xb) / 2
            inner += f'<g><title>{E(DESC[lab])}</title><rect x="{xa:.1f}" y="{cy - 7}" width="{xb - xa:.1f}" height="14" rx="7" fill="{col}" fill-opacity=".35" stroke="{col}" stroke-dasharray="4 3"/><circle cx="{xb:.1f}" cy="{cy}" r="8" fill="{col}" stroke="{NAVY}" stroke-width="1.5"/>' + txt(xc, cy + d, "CBAM 2023 → 2026", 14, "middle", 700) + '</g>'
        else:
            x = xy(yr)
            inner += f'<g><title>{E(DESC[lab])}</title><line x1="{x:.1f}" x2="{x:.1f}" y1="{cy}" y2="{cy + d + (6 if d < 0 else -16)}" stroke="{LINE}"/><circle cx="{x:.1f}" cy="{cy}" r="8" fill="{col}" stroke="{NAVY}" stroke-width="1.5"/>' + txt(x, cy + d, f"{lab} {yr}", 14, "middle", 700) + '</g>'
    y += hgt
for t in range(2005, 2027, 3):
    inner += txt(xy(t), y + 18, str(t), 13, "middle", fill=INK2)
alt = '<ol class="bul vb-alt" style="margin-top:0">' + "".join(f"<li>{E(DESC[k])}</li>" for k in ["EU ETS", "REACH", "GDPR", "Green Deal", "EU Taxonomy", "Climate Law", "Global Gateway", "CSRD", "CBAM", "AI Act"]) + "</ol>"
a4 = fig("Visual · Section 2.2.3 (Table 2.6)", "Eight of the ten instruments in Table 2.6 date from 2018 or later",
  '<div class="vb-svgwide">' + svg(1000, y + 26, inner, "Time line 2005 to 2026 of ten EU instruments in four fields: climate and finance (ETS 2005, Green Deal 2019, Taxonomy 2020, Climate Law 2021, CSRD 2022, CBAM transitional 2023 and definitive 2026), data and digital (GDPR 2018, AI Act 2024), chemicals and products (REACH 2007), external action (Global Gateway 2021).") + '</div>' + alt,
  "The EU's rule-making reach has widened fast, from chemicals and data to carbon (CBAM) and artificial intelligence.",
  "Official EU legal texts and European Commission publications; compiled by the authors (Table 2.6).")
for k, v in DESC.items(): log("A4 2.2.3", v, "Table 2.6, pp. 25–26; CBAM dates also Section 2.2.3, p. 26")
log("A4 2.2.3", "8 of 10 instruments from 2018 or later (derived count)", "Table 2.6")
edit("c2-standards", lambda s: once(s, '    <div class="tbl-wrap rv mt"><table class="tbl">\n      <caption><span class="lbl">Table 2.6.</span>', '    ' + a4 + '\n    <div class="tbl-wrap rv mt"><table class="tbl">\n      <caption><span class="lbl">Table 2.6.</span>'))

# =====================================================================
# B8 · Chapter 2 takeaway (end of 2.2.3b)
# =====================================================================
t2 = takeaway("Chapter 2", "The Union's influence is strongest where it can act through law, regulation and markets, and weaker where unanimity is needed.",
  [("≈EUR 4.14 tn", "intra-EU trade in goods, 2025"), ("≈ 1/7", "of global trade in goods"), ("≈40%", "of global official development assistance")],
  "Sections 2.1.1, 2.2.1 and 2.2.2 of the report.")
log("B8 Chapter 2 takeaway", "≈EUR 4.14 trillion intra-EU trade 2025", "Section 2.1.1 / Table 2.3")
log("B8 Chapter 2 takeaway", "≈ one seventh of global goods trade", "Section 2.2.1")
log("B8 Chapter 2 takeaway", "≈40% of global ODA", "Section 2.2.2, p. 22")
edit("c2-climate", lambda s: once(s, '    <figure class="vz rv" data-viz="A5"></figure>\n    </div>\n  </div>', '    <figure class="vz rv" data-viz="A5"></figure>\n    </div>\n    ' + t2 + '\n  </div>'))

# =====================================================================
# A1 · new slide after the Chapter 3 cover: six numbers
# =====================================================================
K6 = [("€", "76.0", " bn", "76.0", 1, "EU–Vietnam trade in goods, 2025", "Table 3.5 (Eurostat)", ""),
      ("US$", "56.2", " bn", "56.2", 1, "Vietnam's exports to the EU, 2025", "Table 3.6 (Vietnamese statistics)", ""),
      ("≈", "12–13", "%", None, 0, "of Vietnam's exports go to the EU, its 3rd-largest market", "Section 3.1.2 and Table 3.2", ""),
      ("≈", "2,450", "", "2450", 0, "EU investment projects in Vietnam (end-2022)", "Section 3.2.1 (EEAS)", ""),
      ("", "20", " / 27", "20", 0, "member states have ratified the EVIPA (Nov 2025)", "Section 3.1.3", "gold"),
      ("> €", "560", " m", "560", 0, "new Global Gateway commitments, March 2026", "Table 3.1", "gold")]
kp = "".join(f'<div class="kpi {g}"><p class="v">{E(p)}<span class="kv"{"" if to is None else f" data-to=" + chr(34) + to + chr(34) + f" data-dec=" + chr(34) + str(dec) + chr(34)}>{E(v)}</span>{E(sfx)}</p><p class="l">{E(l)}</p><p class="s">{E(srcx)}</p></div>' for p, v, sfx, to, dec, l, srcx, g in K6)
a1 = ('<section class="sec" id="c3-numbers" data-scene="none" data-pdf="Chapter 3: key figures (compiled from Sections 3.1–3.3)">\n  <div class="wrap">\n'
      '    <p class="eyebrow rv">Chapter 3 · Key figures</p>\n    <h2 class="h rv" style="--d:1">Vietnam–EU in six numbers</h2>\n'
      f'    <div class="kpis rv" style="--d:2" role="list" aria-label="Six key figures of Vietnam–EU relations">{kp.replace("<div class=" + chr(34) + "kpi", "<div role=" + chr(34) + "listitem" + chr(34) + " class=" + chr(34) + "kpi")}</div>\n'
      '    <p class="vz-sowhat rv" style="max-width:80ch">The EU is one of Vietnam\'s top three markets, and the relationship now spans trade, investment, law and climate finance.</p>\n'
      '    <p class="src"><b>Source:</b> European Commission, DG Trade factsheet (Eurostat Comext); Ministry of Industry and Trade / Vietnam Customs; EEAS; VietnamPlus; compiled by the authors.</p>\n'
      '  </div>\n</section>\n\n')
for p, v, sfx, *_ in K6: log("A1 Six numbers", f"{p}{v}{sfx}", {"76.0": "Table 3.5, p. 30", "56.2": "Table 3.6, p. 31", "12–13": "Section 3.1.2 / Table 3.2, p. 28", "2,450": "Section 3.2.1 / Table 3.7, p. 32", "20": "Section 3.1.3 / Table 3.3, p. 30", "560": "Table 3.1, p. 27; Section 3.3.2, p. 37"}[v])
m = section("ch3"); h = h[:m.end()] + "\n\n" + a1.rstrip() + h[m.end():]
h = once(h, '        <a class="toc-l2" href="#c3-milestones">3.1 Overview of Vietnam–EU relations</a>', '        <a href="#c3-numbers" class="toc-sub">Vietnam–EU in six numbers</a>\n        <a class="toc-l2" href="#c3-milestones">3.1 Overview of Vietnam–EU relations</a>')

# =====================================================================
# A5 · 3.1.1: trade then and now beside the lead; KPI chips on two milestones
# =====================================================================
bars = (f'<g><title>2020 (EVFTA in force from 1 August): EU–Vietnam trade in goods EUR 43.3 billion</title><rect x="90" y="10" width="{43.3 / 76.0 * 300:.1f}" height="34" fill="{BLUE}"/>' + txt(80, 33, "2020", 15, "end", 700) + txt(90 + 43.3 / 76.0 * 300 + 8, 33, "€43.3 bn", 16, weight=700) + '</g>'
        f'<g><title>2025: EU–Vietnam trade in goods EUR 76.0 billion</title><rect x="90" y="58" width="300" height="34" fill="{BLUE}"/>' + txt(80, 81, "2025", 15, "end", 700) + txt(398, 81, "€76.0 bn", 16, weight=700) + '</g>')
a5 = fig("Visual · Section 3.1.1", "Trade in goods rose from €43.3 bn in 2020, when the EVFTA entered into force, to €76.0 bn in 2025",
  svg(480, 100, bars, "Bars: EU–Vietnam trade in goods, EUR 43.3 billion in 2020 and EUR 76.0 billion in 2025", 520),
  "The upgrade to a Comprehensive Strategic Partnership in 2026 came on top of six years of fast-growing trade.",
  "European Commission, DG Trade country factsheet on Vietnam (Eurostat Comext), Table 3.5.")
log("A5 3.1.1", "€43.3 bn (2020); €76.0 bn (2025)", "Table 3.5, p. 30")
def a5_edit(s):
    s = once(s, '    <p class="lead rv" style="--d:2">Since diplomatic relations were established in 1990', '    <div class="vb-pair">\n    <p class="lead rv" style="--d:2">Since diplomatic relations were established in 1990')
    s = once(s, 'education and sustainable development.</p>\n', 'education and sustainable development.</p>\n    ' + a5 + '\n    </div>\n')
    s = once(s, '<p class="y">1 Aug 2020</p><p class="t">EVFTA enters into force</p>', '<p class="y">1 Aug 2020</p><p class="t">EVFTA enters into force</p><p class="tl-kpi" title="Table 3.5">Trade 2020: €43.3 bn</p>')
    s = once(s, '<p class="y">1 Aug 2026</p><p class="t">EVFTA completed six years in force</p>', '<p class="y">1 Aug 2026</p><p class="t">EVFTA completed six years in force</p><p class="tl-kpi" title="Table 3.5">Trade 2025: €76.0 bn</p>')
    return s
edit("c3-milestones", a5_edit)

# =====================================================================
# A6 · 3.1.2: the ranking seen from each side (Table 3.2)
# =====================================================================
def rk(no, b, sp, top=False): return f'<div class="rank{" top" if top else ""}" role="listitem"><span class="no" aria-hidden="true">#{no}</span><span class="tx"><b>{E(b)}</b><span>{E(sp)}</span></span></div>'
a6 = fig("Visual · Section 3.1.2 (Table 3.2)", "The EU is Vietnam's 3rd export market; Vietnam is the EU's 1st goods partner in ASEAN",
  '<div class="ranks"><div role="list" aria-label="How Vietnam ranks the EU"><h4>Vietnam looks at the EU</h4>'
  + rk(3, "export destination", "≈12–13% of Vietnam's exports; US$56.2 bn in 2025", True) + rk(4, "source of imports", "fourth-largest supplier") + rk(6, "source of FDI", "> US$27.8 bn invested, > 60% in manufacturing") +
  '</div><div role="list" aria-label="How the EU ranks Vietnam"><h4>The EU looks at Vietnam</h4>'
  + rk(1, "goods-trade partner in ASEAN", "largest in the region", True) + rk(9, "import source (2025)", "ninth-largest worldwide") + rk(14, "trading partner overall (2025)", "€76.0 bn of trade") + '</div></div>',
  "Each matters to the other, but the EU weighs more in Vietnam's trade than Vietnam does in the EU's.",
  "EEAS; European Commission (Eurostat); EuroCham; Viet Nam News; compiled by the authors (Table 3.2).")
for v in ["#3 export destination, ≈12–13%", "#4 source of imports", "#6 FDI source, > US$27.8 bn, > 60% manufacturing", "#1 goods-trade partner in ASEAN", "#9 import source (2025)", "#14 trading partner (2025), €76.0 bn", "US$56.2 bn exports 2025"]: log("A6 3.1.2", v, "Section 3.1.2 and Table 3.2, p. 28")
edit("c3-importance", lambda s: once(s, '    <div class="grid g2 mt">\n      <div class="card rv"><p class="tag">For Vietnam</p>', '    ' + a6 + '\n    <div class="grid g2 mt">\n      <div class="card rv"><p class="tag">For Vietnam</p>'))

# =====================================================================
# A7a · 3.1.3a: Opinion 2/15 splits the package
# =====================================================================
a7a = fig("Visual · Section 3.1.3", "One package, two paths: the Court's Opinion 2/15 split the EVFTA from the EVIPA",
  '<div class="branch wide" role="group" aria-label="Opinion 2/15 split the package into the EVFTA and the EVIPA">'
  '<div class="node"><b>One negotiated package</b>Trade and investment protection, signed together in Hanoi on 30 June 2019</div><div class="down" aria-hidden="true">↓</div>'
  '<div class="node court"><b>CJEU Opinion 2/15 · May 2017</b>Investment protection with arbitration-style dispute settlement is a shared competence</div>'
  '<div class="two"><div class="down" aria-hidden="true">↙</div><div class="down" aria-hidden="true">↘</div>'
  '<div class="node ok"><b>EVFTA · trade</b>EU-level approval only: Parliament 12 Feb 2020, Council 30 Mar 2020<br><span class="tag">In force since 1 Aug 2020</span></div>'
  '<div class="node wait"><b>EVIPA · investment protection</b>Ratification by all 27 member states: 20 of 27 by Nov 2025; France\'s bill sent to Parliament 27 Jul 2026<br><span class="tag">Not yet in force</span></div></div></div>',
  "Trade liberalisation took effect in 2020; investment protection still waits for national ratifications.",
  "European Commission; EEAS; VietnamPlus (28 Nov 2025, 2 Aug 2026).")
for v in ["Signed 30 June 2019, Hanoi", "Opinion 2/15, May 2017", "EP 12 Feb 2020; Council 30 Mar 2020", "EVFTA in force 1 Aug 2020", "EVIPA 20 of 27 by Nov 2025", "France bill 27 Jul 2026"]: log("A7a 3.1.3", v, "Section 3.1.3 and Table 3.3, pp. 29–30")
edit("c3-frameworks", lambda s: re.sub(r'(    <p class="lead rv" style="--d:2">Two agreements signed together.*?</p>)', lambda m: m.group(1) + '\n    ' + a7a, s, count=1, flags=re.S))

# A7b · 3.1.3b: tariff path chart (viz-data, kind "tariff-path")
edit("c3-evfta", lambda s: once(s, '    <p class="note rv mt">The tariff commitments are asymmetric in favour of Vietnam.</p>', '    <figure class="vz rv" data-viz="A7b"></figure>\n    <p class="note rv mt">The tariff commitments are asymmetric in favour of Vietnam.</p>'))
log("A7b 3.1.3", "EU ≈84–86% of lines at entry; ≈99% by 2027", "Table 3.4, p. 30")
log("A7b 3.1.3", "Vietnam ≈65% at entry; rest by 2030", "Table 3.4, p. 30")

# =====================================================================
# A8 · 3.2.1d FDI: KPI tiles beside the bullets; share and inflow charts under the table
# =====================================================================
K8 = [("> US$", "27.8", " bn", "27.8", 1, "invested by EU investors (end-2022)"), ("≈", "2,450", "", "2450", 0, "EU projects (end-2022)"),
      ("> ", "60", "%", "60", 0, "of EU capital in manufacturing"), ("", "18", " of 21", "18", 0, "sectors with EU presence (2019)"),
      ("", "54", "", "54", 0, "provinces with EU projects (2019)"), ("#", "6", "", "6", 0, "the EU's rank among FDI sources")]
k8 = "".join(f'<div class="kpi"><p class="v">{E(p)}<span class="kv" data-to="{to}" data-dec="{d}">{E(v)}</span>{E(sfx)}</p><p class="l">{E(l)}</p></div>' for p, v, sfx, to, d, l in K8)
a8 = fig("Visual · Section 3.2.1 (Table 3.7)", "EU investors are spread across Vietnam, but mostly in manufacturing",
  f'<div class="kpis small">{k8}</div>',
  "European capital reaches most sectors and provinces; its weight lies in manufacturing.",
  "EEAS; Foreign Investment Agency/MPI (2019 figures); compiled by the authors (Table 3.7).")
for v in ["> US$27.8 bn (end-2022)", "≈ 2,450 projects (end-2022)", "> 60% manufacturing", "18 of 21 sectors (2019)", "54 provinces (2019)", "6th FDI source"]: log("A8 3.2.1 tiles", v, "Section 3.2.1 and Table 3.7, pp. 32–33")
def a8_edit(s):
    s = re.sub(r'(    <ul class="bul">.*?</ul>)', lambda m: m.group(1) + '\n    ' + a8, s, count=1, flags=re.S)
    return once(s, '    <div class="callout rv mt"><h3>Quality may matter more than quantity</h3>', '    <div class="vz-pair mt"><figure class="vz rv" data-viz="A8s"></figure><figure class="vz rv" data-viz="A8i"></figure></div>\n    <div class="callout rv mt"><h3>Quality may matter more than quantity</h3>')
edit("c3-investment", a8_edit)
log("A8s share chart", "≈7.6% (2019) → ≈5.6% (indicative; end-2022 capital ÷ total at 30 Nov 2024)", "Table 3.7, p. 32 (and note p. 33)")
log("A8i inflow chart", "US$2.5 bn (2022) → US$3.25 bn (2024)", "Table 3.7, p. 33 (row confirmed from the page image)")

# =====================================================================
# B4 · 3.2.2: the smile curve (schematic)
# =====================================================================
sm = (f'<line x1="40" y1="230" x2="500" y2="230" stroke="{INK2}"/><line x1="40" y1="230" x2="40" y2="20" stroke="{INK2}"/>'
      + txt(30, 26, "Value", 13, "end", fill=INK2) + txt(30, 42, "added", 13, "end", fill=INK2)
      + f'<path d="M60,50 C160,230 380,230 480,50" fill="none" stroke="{BLUE}" stroke-width="4"/>'
      + f'<g><title>Higher value added: research and development, design</title><circle cx="70" cy="68" r="7" fill="{BLUE}"/>' + txt(84, 64, "R&D, design", 15, weight=700) + '</g>'
      + f'<g><title>Higher value added: brands, distribution, services</title><circle cx="470" cy="68" r="7" fill="{BLUE}"/>' + txt(456, 64, "Brands, distribution", 15, "end", 700) + '</g>'
      + f'<g><title>Low point: assembly of imported components, where much of Vietnam\'s export growth comes from</title><circle cx="270" cy="184" r="10" fill="{GOLD}" stroke="{NAVY}" stroke-width="2"/>' + txt(270, 214, "Assembly of imported components", 15, "middle", 700) + '</g>'
      + f'<path d="M300,170 Q360,150 395,120" fill="none" stroke="{NAVY}" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#smArr)"/>' + txt(405, 150, "upgrading", 14, fill=NAVY)
      + txt(270, 252, "Stages of the value chain →", 13, "middle", fill=INK2))
b4 = fig("Visual · Section 3.2.2 · Schematic", "Assembly sits at the low point of the value chain",
  svg(520, 260, f'<defs><marker id="smArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0L10,5L0,10Z" fill="{NAVY}"/></marker></defs>' + sm,
      "Schematic smile curve: value added is high at R&D and design and at brands and distribution, low at assembly of imported components; an arrow shows upgrading.", 620),
  "Much export growth comes from assembling imported components, so the value captured in Vietnam is lower than headline figures suggest; moving up the chain is the main long-term question.",
  "Compiled by the authors from Section 3.2.2 of the report (an idea stated in words; the curve is not data).", schematic=True)
def b4_edit(s):
    m = re.search(r'(    <p class="lead rv" style="--d:2">By attaching conditions.*?</p>)\n(    <div class="grid g3 mt">.*?\n    </div>)\n', s, re.S)
    left = m.group(1) + '\n' + m.group(2).replace('<div class="grid g3 mt">', '<div class="stack mt">', 1)
    return s[:m.start()] + '    <div class="vb-pair">\n    <div>\n' + left + '\n    </div>\n    ' + b4 + '\n    </div>\n' + s[m.end():]
edit("c3-reform", b4_edit)

# =====================================================================
# B5 · 3.3: two channels, one goal
# =====================================================================
b5 = fig("Visual · Section 3.3 · Schematic", "Two channels, one goal: standards and finance both push toward net zero by 2050",
  '<div class="branch" role="group" aria-label="Two channels of EU influence converge on modernisation and net zero by 2050"><div class="two">'
  '<div class="node ok"><b>Standards and regulatory alignment</b>EVFTA Chapter 13: labour rights, environment, climate; product quality, traceability and carbon pricing (Section 3.3.1)</div>'
  '<div class="node ok"><b>Development cooperation</b>Global Gateway: more than €560 m (March 2026); JETP: initial US$15.5 bn pledge (Section 3.3.2)</div>'
  '<div class="down" aria-hidden="true">↘</div><div class="down" aria-hidden="true">↙</div></div>'
  '<div class="node court"><b>Modernisation and net-zero emissions by 2050</b>Financing, technology and institutional capacity building</div></div>',
  "The two channels work together: rules set the bar, cooperation helps firms and institutions reach it.",
  "European External Action Service and European Commission; compiled by the authors (Sections 3.3.1–3.3.2).", schematic="Schematic")
log("B5 3.3", "more than €560 m Global Gateway (March 2026)", "Section 3.3.2, p. 37; Table 3.1")
log("B5 3.3", "JETP initial US$15.5 bn pledge", "Table 3.1, p. 27; Table 3.2")
log("B5 3.3", "net zero by 2050", "Section 3.3, p. 36")
edit("c3-broader", lambda s: once(once(s, '<div class="wrap">\n    <div class="copy">', '<div class="wrap">\n    <div class="vz-split even">\n    <div class="copy">'),
     '    </div>\n  </div>\n</section>', '    </div>\n    ' + b5 + '\n    </div>\n  </div>\n</section>'))

# =====================================================================
# A9 · 3.4: opportunity → challenge → recommendation (the authors' reading)
# =====================================================================
REC = {1: "R1 EVIPA and surplus", 2: "R2 Carbon pricing and data", 3: "R3 Traceability (EUDR, IUU)", 4: "R4 EVFTA utilisation", 5: "R5 Bankable JETP and Global Gateway", 6: "R6 Higher-quality EU FDI", 7: "R7 Firms: compliance"}
OCR = [("Greater access to the European market", "Compliance costs for enterprises", [3, 4, 7]),
       ("Higher-quality investment and technology", "Limited domestic capacity", [6, 4]),
       ("Support for the green transition", "Financing and infrastructure constraints", [5, 2]),
       ("Better institutional and regulatory quality", "Pressure for regulatory adjustment", [1, 2, 3]),
       ("Human capital and technology", "Shortages of skills and innovation capacity", [])]
cells = '<div class="hd">Opportunity (3.4.1)</div><div></div><div class="hd">Challenge (3.4.2)</div><div></div><div class="hd">Recommendations (3.4.3)</div>'
for o, c, rs in OCR:
    rc = "".join(f'<span class="rec" title="{E(REC[r])}">{E(REC[r])}</span>' for r in rs) if rs else '<span style="font-size:.84rem"><b>No dedicated recommendation yet.</b> Only "technical training" through industry associations, inside R7.</span>'
    cells += f'<div class="c o">{E(o)}</div><div class="ar" aria-hidden="true">↔</div><div class="c ch">{E(c)}</div><div class="ar" aria-hidden="true">→</div><div class="c r{"" if rs else " gap"}">{rc}</div>'
a9 = fig("Visual · Section 3.4 · compiled by the authors", "Four of the five challenges have a matching recommendation; skills do not",
  f'<div class="ocr" role="table" aria-label="Opportunities, challenges and recommendations, matched by the authors">{cells}</div>',
  "A recommendation on skills and human capital would close the one gap between the analysis and the proposals.",
  "Sections 3.4.1–3.4.3 of the report; the pairing is the authors' reading, compiled by the authors.", schematic="Authors' matching, not in the report", cls="vb-long")
edit("c3-recommendations", lambda s: once(s, '(2026); Climate Policy Initiative (n.d.); Italian Trade Agency (2026); Vietnam Investment Review (2025).</p>\n  </div>',
     '(2026); Climate Policy Initiative (n.d.); Italian Trade Agency (2026); Vietnam Investment Review (2025).</p>\n    ' + a9 + '\n  </div>'))

# print: long tables may break between rows (rows stay whole, header repeats); short ones stay in one piece
def mark_long(m):
    rows = m.group(0).count("<tr>") - 1
    return m.group(0).replace('<div class="tbl-wrap', '<div class="tbl-wrap tbl-long', 1) if rows > 7 else m.group(0)
h = re.sub(r'<div class="tbl-wrap[^"]*"><table class="tbl".*?</table></div>', mark_long, h, flags=re.S)
h = h.replace('<figure class="vz vb rv " aria-label="Four of the five', '<figure class="vz vb rv vb-long" aria-label="Four of the five')
# =====================================================================
# CSS, renderer, count-up script, chart data
# =====================================================================
css = (ROOT / "v2b/src/visuals.css").read_text(encoding="utf-8") + "\n.vz-split.even > .vz.vb { margin-top: 0; }\n"
i = h.index("</style>"); h = h[:i] + css + h[i:]
h = once(h, '''(s.notes ? `<ul class="vz-notes">${s.notes.map(n => `<li>${esc(n)}</li>`).join("")}</ul>` : "") +
      `<div class="vz-foot"><p class="src">''', '''(s.notes ? `<ul class="vz-notes">${s.notes.map(n => `<li>${esc(n)}</li>`).join("")}</ul>` : "") + (s.sowhat ? `<p class="vz-sowhat">${esc(s.sowhat)}</p>` : "") +
      `<div class="vz-foot"><p class="src">''')
h = once(h, '  /* A1: scrollable milestone strip with a detail card */', (ROOT / "v2b/src/renderers.js").read_text(encoding="utf-8") + '  /* A1: scrollable milestone strip with a detail card */')
h = once(h, '</script>\n\n<!-- Data for every visual', '</script>\n\n<!-- v2b: count-up of the big numbers -->\n<script>' + (ROOT / "v2b/src/countup.js").read_text(encoding="utf-8") + '</script>\n\n<!-- Data for every visual')
data = json.loads((ROOT / "viz_data.json").read_text(encoding="utf-8"))
ax = lambda *t: [dict(v=x, s="axis") for x in t]
data["visuals"] += [
  dict(key="A7b", kind="tariff-path", label="Visual · Section 3.1.3 (Table 3.4)", title="The EU opens faster: ≈99% of tariff lines by 2027; Vietnam removes the rest by 2030",
       placement=dict(section="3.1.3", anchor="c3-evfta"), aria="Bars on a 0–100% scale. EU duties on Vietnamese goods: about 84–86% of tariff lines duty-free at entry into force on 1 August 2020, about 99% after seven years (by 2027). Vietnam's duties on EU goods: about 65% removed at entry into force, the remaining duties removed by 2030.",
       unit="Share of tariff lines (EU) or of duties (Vietnam) removed. Official approximations; they differ slightly between sources.",
       notes=["The hatched band shows the 84–86% range; no single value is chosen.", "\"Rest by 2030\" is drawn to the end of the scale: the report says the remaining duties are removed, without a percentage."],
       source="European Commission, Access2Markets; Ministry of Industry and Trade of Vietnam (Table 3.4).", sowhat="The commitments are asymmetric in favour of Vietnam: the EU opens almost fully within seven years, Vietnam within ten.",
       axis=dict(x=dict(ticks=ax(0, 25, 50, 75, 100))),
       rows=[dict(party="EU (on Vietnamese goods)", entry=dict(lo=dict(v=84, s="approximate"), hi=dict(v=86, s="approximate"), short="≈84–86%", label="≈84–86% of lines duty-free at entry"), final=dict(v=dict(v=99, s="approximate"), label="≈99% of lines by 2027")),
             dict(party="Vietnam (on EU goods)", entry=dict(v=dict(v=65, s="approximate"), short="≈65%", label="≈65% of duties removed at entry"), final=dict(rest=True, label="rest removed by 2030"))]),
  dict(key="A8s", kind="vbars", label="Visual · Section 3.2.1 (Table 3.7)", title="EU share of Vietnam's cumulative FDI: ≈7.6% in 2019, ≈5.6% later (indicative)",
       placement=dict(section="3.2.1", anchor="c3-investment"), aria="Bars: EU share of Vietnam's cumulative FDI, about 7.6% in 2019 and about 5.6% in the latest estimate, which divides end-2022 EU capital by the total at 30 November 2024.",
       unit="% of Vietnam's cumulative registered FDI.", unitShort="%",
       notes=["≈5.6% is the authors' estimate in the report: US$27.8 bn (end-2022) ÷ US$496.7 bn (total at 30 Nov 2024), so the dates are mixed.", "The share fell as Asian investors grew faster (Table 3.7)."],
       source="Foreign Investment Agency/MPI (2019); EEAS; authors' estimate (Table 3.7).", sowhat="EU capital keeps growing, but its share fell because Asian investors grew faster.", axis=dict(y=dict(min=dict(v=0, s="axis"), max=dict(v=9, s="axis"), ticks=ax(0, 2, 4, 6, 8))),
       cats=["2019", "Latest (mixed dates)"], series=[dict(name="EU share", fill="blue")],
       values=[[dict(v=7.6, s="approximate", txt="7.6%")], [dict(v=5.6, s="approximate", txt="5.6%", fill="gold")]]),
  dict(key="A8i", kind="vbars", label="Visual · Section 3.2.1 (Table 3.7)", title="Annual European FDI inflow rose from US$2.5 bn (2022) to US$3.25 bn (2024)",
       placement=dict(section="3.2.1", anchor="c3-investment"), aria="Bars: annual European FDI inflow into Vietnam, US$2.5 billion in 2022 and US$3.25 billion in 2024.",
       unit="US$ billion per year.", unitShort="US$ billion", notes=["Row \"Annual European FDI inflow\" of Table 3.7, read from the page image because the text layer is broken."],
       source="VietnamPlus (Sept 2025); Vietnam Briefing (Table 3.7).", sowhat="Annual European inflows are rising, from a modest base.", axis=dict(y=dict(min=dict(v=0, s="axis"), max=dict(v=4, s="axis"), ticks=ax(0, 1, 2, 3, 4))),
       cats=["2022", "2024"], series=[dict(name="Annual inflow", fill="blue")], values=[[dict(v=2.5, s="exact")], [dict(v=3.25, s="exact")]])]
(ROOT / "v2b/src/viz_data_v2b.json").write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
payload = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
OPEN = '<script type="application/json" id="viz-data">'
m = re.search(re.escape(OPEN) + r"(.*?)</script>", h, re.S); h = h[:m.start(1)] + payload + h[m.end(1):]

# write the source page at the project root level (fonts/ and vendor/ resolve), then the single file

(ROOT / "v2b/src/index_v2b.html").write_text(h, encoding="utf-8")
def font_uri(m): return "url(data:font/woff2;base64," + base64.b64encode((ROOT / m.group(1)).read_bytes()).decode() + ")"
sa = re.sub(r"url\((fonts/[\w.-]+\.woff2)\)", font_uri, h)
three = (ROOT / "vendor" / "three.min.js").read_text(encoding="utf-8").replace("</script", "<\\/script")
sa = once(sa, '<script src="vendor/three.min.js"></script>', "<script>/* three.js r159, MIT licence (see vendor/THREE-LICENSE.txt) */\n" + three + "\n</script>")
out = ROOT / "v2b/EU_presentation_standalone_v2b.html"; out.write_text(sa, encoding="utf-8")
(ROOT / "v2b/src/visual_log.json").write_text(json.dumps(LOG, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"{out.name}: {out.stat().st_size / 1024:.0f} KB; {len(LOG)} logged values; sections: {len(re.findall(r'<section ', h))}")
