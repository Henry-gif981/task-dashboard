# VISUALS_CHANGELOG: visuals added in v2b

Base: `EU_presentation_standalone_v2.html` (unchanged copy: `v2b/EU_presentation_standalone_v2.backup.html`). Output: `v2b/EU_presentation_standalone_v2b.html`, built by `python3 v2b/build_v2b.py` (sources in `v2b/src/`). No existing text or number was changed: all 1,011 text blocks of v2 are present unchanged (`visual_tests/text_kept.txt`). Every new visual sits in one top-level block of its section's `.wrap`, has an insight title, a "so what" line and a Source line; schematic ones carry "Schematic".

## Where each visual is

| # | Title | Section / place | Form |
|---|---|---|---|
| A1 | Vietnam–EU in six numbers (new slide) | `c3-numbers`, after the Chapter 3 cover; listed in the table of contents under Chapter 3 | Count-up KPI tiles (0.8 s, off with reduced motion) |
| A2 | The EU negotiates trade with one voice for all 27 | `c2-trade` (2.2.1a), right of the two bullets | Three-step flow (Council → Commission → Parliament) + 7 squares, 1 gold (≈ 1/7) |
| A3 | The EU sits at the table in trade and climate, but not in the IMF or the World Bank | `c2-governance` (2.2.2a), right of the WTO note | Seat matrix, 8 rows, 3 status chips (shape + text, not colour only) |
| A4 | Eight of the ten instruments in Table 2.6 date from 2018 or later | `c2-standards` (2.2.3a), under the Brussels-effect flow | SVG time line 2005–2026 in four lanes; list version below 680 px |
| A5 | Trade in goods rose from €43.3 bn in 2020 … to €76.0 bn in 2025 | `c3-milestones` (3.1.1), right of the lead; KPI chips on the 1 Aug 2020 and 1 Aug 2026 milestones | Two bars (SVG, `<title>` tooltips) |
| A6 | The EU is Vietnam's 3rd export market; Vietnam is the EU's 1st goods partner in ASEAN | `c3-importance` (3.1.2), after the lead | Two-way ranking badges |
| A7a | One package, two paths: the Court's Opinion 2/15 split the EVFTA from the EVIPA | `c3-frameworks` (3.1.3a), under the lead | Branching diagram, left to right (stacks below 900 px) |
| A7b | The EU opens faster: ≈99% of tariff lines by 2027; Vietnam removes the rest by 2030 | `c3-evfta` (3.1.3b), under Table 3.4 | Chart from `viz_data.json` (kind `tariff-path`), ranges kept as ranges |
| A8 | EU investors are spread across Vietnam, but mostly in manufacturing + two charts | `c3-investment` (3.2.1d): tiles under the bullets; share and inflow charts under Table 3.7 | KPI tiles + two `vbars` charts from `viz_data.json` (A8s, A8i) |
| A9 | Four of the five challenges have a matching recommendation; skills do not | `c3-recommendations` (3.4.3), at the end | Opportunity → challenge → recommendation matrix (authors' matching, labelled) |
| B1 | From six coal-and-steel partners to a 27-member union | `introduction`, right column | KPI tiles + route of the report |
| B2 | Regional integration is integration among neighbours, inside the global system | `c1-concept` (1.1.1), right column | Schematic nested scopes + benefits/costs lists |
| B4 | Assembly sits at the low point of the value chain | `c3-reform` (3.2.2), right of the lead and the (now stacked) channel cards | Schematic smile curve, marked "Schematic, not measured" |
| B5 | Two channels, one goal: standards and finance both push toward net zero by 2050 | `c3-broader` (3.3), right column | Schematic convergence diagram |
| B8 | Chapter 1 and Chapter 2 takeaways | end of `c1-principles` and of `c2-climate` | Dark takeaway band: one sentence + three numbers |

Not done: B3 (stability toolkit: `c2-waves` already shows it as three cards and is only 24% empty), B6 (JETP: `c3-green` already has the three projects and the three mechanisms as cards), B7 (compliance matrix: the report has no CBAM/EUDR/IUU analysis to source it; see OPEN_ISSUES.md), B8 for Chapter 3 (the Conclusion slide plays that role and A9 closes Section 3.4).

## Every number on the new visuals and its place in the report

| Visual | Value shown | Report (BTL v5) |
|---|---|---|
| B1 Introduction | 1951; six-country community | Introduction, p. 2 |
| B1 Introduction | 27 member states | Introduction, p. 2 |
| B1 Introduction | 21 euro members since 1 January 2026 (Bulgaria) | Section 2.1.1, p. 14 |
| B8 Chapter 1 takeaway | 1951, six countries; 28 members (2013); 27 since 2020 | Table 1.1, pp. 8–9 |
| A2 2.2.1 | Council mandate → Commission negotiates for all 27 → Parliament consent | Section 2.2.1, p. 17 |
| A2 2.2.1 | ≈ one seventh of global trade in goods | Section 2.2.1, p. 17 |
| A3 2.2.2 | UN General Assembly: Enhanced observer (2011) | Table 2.5, p. 21 |
| A3 2.2.2 | World Trade Organization: Full member | Table 2.5, p. 21 |
| A3 2.2.2 | G7: Participates | Table 2.5, p. 21 |
| A3 2.2.2 | G20: Full member | Table 2.5, p. 21 |
| A3 2.2.2 | IMF: Not a member | Table 2.5, p. 21 |
| A3 2.2.2 | World Bank: Not a member | Table 2.5, p. 21 |
| A3 2.2.2 | FAO: Member organisation | Table 2.5, p. 21 |
| A3 2.2.2 | Paris Agreement: Party | Table 2.5, p. 21 |
| A4 2.2.3 | 2005: EU Emissions Trading System, the world's first large carbon market | Table 2.6, pp. 25–26; CBAM dates also Section 2.2.3, p. 26 |
| A4 2.2.3 | 2019: European Green Deal, strategy for climate neutrality by 2050 | Table 2.6, pp. 25–26; CBAM dates also Section 2.2.3, p. 26 |
| A4 2.2.3 | 2020: EU Taxonomy for sustainable finance | Table 2.6, pp. 25–26; CBAM dates also Section 2.2.3, p. 26 |
| A4 2.2.3 | 2021: European Climate Law, climate neutrality by 2050 and −55% net by 2030 | Table 2.6, pp. 25–26; CBAM dates also Section 2.2.3, p. 26 |
| A4 2.2.3 | 2022: Corporate Sustainability Reporting Directive | Table 2.6, pp. 25–26; CBAM dates also Section 2.2.3, p. 26 |
| A4 2.2.3 | CBAM: transitional phase 2023–2025 (from October 2023), definitive regime from 2026 | Table 2.6, pp. 25–26; CBAM dates also Section 2.2.3, p. 26 |
| A4 2.2.3 | 2018: General Data Protection Regulation | Table 2.6, pp. 25–26; CBAM dates also Section 2.2.3, p. 26 |
| A4 2.2.3 | 2024: Artificial Intelligence Act | Table 2.6, pp. 25–26; CBAM dates also Section 2.2.3, p. 26 |
| A4 2.2.3 | 2007: REACH Regulation on chemicals | Table 2.6, pp. 25–26; CBAM dates also Section 2.2.3, p. 26 |
| A4 2.2.3 | 2021: Global Gateway, up to EUR 300 billion by 2027 | Table 2.6, pp. 25–26; CBAM dates also Section 2.2.3, p. 26 |
| A4 2.2.3 | 8 of 10 instruments from 2018 or later (derived count) | Table 2.6 |
| B8 Chapter 2 takeaway | ≈EUR 4.14 trillion intra-EU trade 2025 | Section 2.1.1 / Table 2.3 |
| B8 Chapter 2 takeaway | ≈ one seventh of global goods trade | Section 2.2.1 |
| B8 Chapter 2 takeaway | ≈40% of global ODA | Section 2.2.2, p. 22 |
| A1 Six numbers | €76.0 bn | Table 3.5, p. 30 |
| A1 Six numbers | US$56.2 bn | Table 3.6, p. 31 |
| A1 Six numbers | ≈12–13% | Section 3.1.2 / Table 3.2, p. 28 |
| A1 Six numbers | ≈2,450 | Section 3.2.1 / Table 3.7, p. 32 |
| A1 Six numbers | 20 / 27 | Section 3.1.3 / Table 3.3, p. 30 |
| A1 Six numbers | > €560 m | Table 3.1, p. 27; Section 3.3.2, p. 37 |
| A5 3.1.1 | €43.3 bn (2020); €76.0 bn (2025) | Table 3.5, p. 30 |
| A6 3.1.2 | #3 export destination, ≈12–13% | Section 3.1.2 and Table 3.2, p. 28 |
| A6 3.1.2 | #4 source of imports | Section 3.1.2 and Table 3.2, p. 28 |
| A6 3.1.2 | #6 FDI source, > US$27.8 bn, > 60% manufacturing | Section 3.1.2 and Table 3.2, p. 28 |
| A6 3.1.2 | #1 goods-trade partner in ASEAN | Section 3.1.2 and Table 3.2, p. 28 |
| A6 3.1.2 | #9 import source (2025) | Section 3.1.2 and Table 3.2, p. 28 |
| A6 3.1.2 | #14 trading partner (2025), €76.0 bn | Section 3.1.2 and Table 3.2, p. 28 |
| A6 3.1.2 | US$56.2 bn exports 2025 | Section 3.1.2 and Table 3.2, p. 28 |
| A7a 3.1.3 | Signed 30 June 2019, Hanoi | Section 3.1.3 and Table 3.3, pp. 29–30 |
| A7a 3.1.3 | Opinion 2/15, May 2017 | Section 3.1.3 and Table 3.3, pp. 29–30 |
| A7a 3.1.3 | EP 12 Feb 2020; Council 30 Mar 2020 | Section 3.1.3 and Table 3.3, pp. 29–30 |
| A7a 3.1.3 | EVFTA in force 1 Aug 2020 | Section 3.1.3 and Table 3.3, pp. 29–30 |
| A7a 3.1.3 | EVIPA 20 of 27 by Nov 2025 | Section 3.1.3 and Table 3.3, pp. 29–30 |
| A7a 3.1.3 | France bill 27 Jul 2026 | Section 3.1.3 and Table 3.3, pp. 29–30 |
| A7b 3.1.3 | EU ≈84–86% of lines at entry; ≈99% by 2027 | Table 3.4, p. 30 |
| A7b 3.1.3 | Vietnam ≈65% at entry; rest by 2030 | Table 3.4, p. 30 |
| A8 3.2.1 tiles | > US$27.8 bn (end-2022) | Section 3.2.1 and Table 3.7, pp. 32–33 |
| A8 3.2.1 tiles | ≈ 2,450 projects (end-2022) | Section 3.2.1 and Table 3.7, pp. 32–33 |
| A8 3.2.1 tiles | > 60% manufacturing | Section 3.2.1 and Table 3.7, pp. 32–33 |
| A8 3.2.1 tiles | 18 of 21 sectors (2019) | Section 3.2.1 and Table 3.7, pp. 32–33 |
| A8 3.2.1 tiles | 54 provinces (2019) | Section 3.2.1 and Table 3.7, pp. 32–33 |
| A8 3.2.1 tiles | 6th FDI source | Section 3.2.1 and Table 3.7, pp. 32–33 |
| A8s share chart | ≈7.6% (2019) → ≈5.6% (indicative; end-2022 capital ÷ total at 30 Nov 2024) | Table 3.7, p. 32 (and note p. 33) |
| A8i inflow chart | US$2.5 bn (2022) → US$3.25 bn (2024) | Table 3.7, p. 33 (row confirmed from the page image) |
| B5 3.3 | more than €560 m Global Gateway (March 2026) | Section 3.3.2, p. 37; Table 3.1 |
| B5 3.3 | JETP initial US$15.5 bn pledge | Table 3.1, p. 27; Table 3.2 |
| B5 3.3 | net zero by 2050 | Section 3.3, p. 36 |
| A7b | ≈84–86% / ≈99% (2027); ≈65% / rest by 2030 | Table 3.4, p. 30 |
| A8s | ≈7.6% (2019) → ≈5.6% (indicative, mixed dates) | Table 3.7, pp. 32–33 |
| A8i | US$2.5 bn (2022) → US$3.25 bn (2024) | Table 3.7, p. 33 — row confirmed from the page image (the text layer is a broken equation) |
| A9 | R1–R7 names; five opportunity/challenge pairs | Sections 3.4.1–3.4.3, pp. 40–43; pairing by the authors |

## Checks
- `tools/check_new_numbers.js`: 205 number tokens in the 20 new visuals; all found verbatim in the report text except axis ticks (2008, 2014, 75%), two tokens cut at a comma ("2020,", "1," of "≈ 1/7,") and the derived rank/count labels listed in the script (`visual_tests/new_numbers_check.txt`).
- `tools/check_v2b_math.py`: 8 of 10 instruments from 2018 on; bar ratio 43.3/76.0; 27 − 21 = 6; 27 − 20 = 7; 27.8 ÷ 496.7 = 5.60% (`visual_tests/math_check.txt`).
- `tools/check_v2.js` on v2b: links, unique ids, unique section labels matching the table of contents, banned strings, random sample of 15 page numbers vs report: all pass (`visual_tests/check_v2b.txt`).
- `node --check` on every inline script; no console errors at 1920×1080, 1440×900, 1280×720, 390×844; no horizontal overflow.
