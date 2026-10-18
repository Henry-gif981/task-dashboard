# CHANGELOG: EU presentation v1 → v2 (aligned with "BTL Đa biên – Nhóm 4" v5, 45 pages)

Source of truth: `BTL_Đa_biên_-_Nhóm_4_5.pdf`. Web source edited: `eu-presentation/index.html`; the single-file build is `v2/EU_presentation_standalone_v2.html` (made by `tools/build_standalone.py`, which inlines Three.js and fonts without touching the library code).

Actions: **keep** (kept as is) · **edit** (same place, content updated) · **new** (new section) · **merge** (content moved into another section) · **drop** (removed from the page; old HTML saved in `v2/removed_sections.html`).

## 1. Section map

| BTL heading (v5) | Web section id (v2) | v1 id(s) | Action | What changed |
|---|---|---|---|---|
| Cover | `home` | `home` | keep | – |
| Table of contents | `contents` | `contents` | edit | Rebuilt from the v5 table of contents (3 levels); Conclusion added; dropped headings removed |
| Introduction | `introduction` | `introduction` | edit | Rewritten from the new Introduction (3 paragraphs: integration context, the EU and Vietnam, chapter plan) |
| Chapter 1 cover | `ch1` | `ch1` | keep | – |
| 1.1.1 Concept | `c1-concept` | `c1-concept` | keep | Checked against v5; unchanged |
| (no heading in v5) | – | `c1-theories` | drop | Viner/Balassa "Supplement" is not in v5 (Balassa only remains in the reference list) |
| 1.1.2 Levels | `c1-levels` | `c1-levels` | keep | Checked; unchanged (B4 staircase kept) |
| 1.1.3 EU as a model | `c1-model` | `c1-model` | keep | Checked; unchanged |
| 1.2.1 Formation (Table 1.1) | `c1-history` | `c1-history` | edit | Caption "Table 1." → "Table 1.1"; 21 milestones checked against Table 1.1 |
| 1.2.2 Institutional structure | `c1-institutions` | `c1-institutions` | keep | Checked; unchanged (B5 schematic kept) |
| 1.2.3 Objectives, Principles and Core Policies | `c1-principles` | `c1-principles` + `c1-mechanisms` | edit + merge | Now 6 TEU Art. 3 objectives, 6 principles (Art. 2 values, conferral, subsidiarity, proportionality, solidarity, sincere cooperation) and 10 core policies; "1.2.4 Core Mechanisms" no longer exists in v5 and its ideas are covered by "Core Policies" |
| Chapter 2 cover | `ch2` | `ch2` | edit | Sub-headings now 2.1 The EU in Regional Integration · 2.2 The EU in Global Integration |
| 2.1.1 Economic Integration (Table 2.1, Figure 1) | `c2-economic`, `c2-economic-b` | `c2-deepening` | new (replaces) | Treaty of Paris/Rome, SEA, Table 2.1 four freedoms, intra-EU trade ≈ EUR 4.14 trillion (+2.6%), euro area 21 members from 1 Jan 2026 (Bulgaria), ≈82% of EU GDP, 6 outside, cohesion ≈ one third of budget; Figure "1" redrawn as **Figure 2.1**; euro star grid (A2) kept |
| 2.1.2 Political Cooperation and Regional Stability (Figure 2.2, Table 2.2) | `c2-political`, `c2-waves` | `c2-enlargement`, `c2-waves`, `c2-neighbourhood`, `c2-challenges` | edit + merge | Schuman 9 May 1950, Nobel 2012, Copenhagen 1993; Figure 2.2 (members 1957–2026); Table 2.2 rebuilt with v5 columns (members after, context); CFSP/CSDP, sanctions, ReArm Europe / Readiness 2030 (up to EUR 800 bn); Brexit, rule of law, Article 7 moved here from v1 2.1.3 |
| – | – | `c2-neighbourhood` (candidate list, ENP tracks, EPC), `c2-challenges` (euro crisis cards, Draghi/Letta box, B6) | drop (partly merged) | Candidate list, 2025 Enlargement Package, ENP sub-tracks, Draghi EUR 750–800 bn are not in v5 |
| 2.2.1 Global Trade and Investment (Tables 2.3, 2.4; Figures 2.3, 2.4) | `c2-trade`, `c2-trade-balance`, `c2-agreements` | `c2-trade`, `c2-agreements` | edit | Exclusive competence; ≈ one seventh of world goods trade; Table 2.3 (2025 indicators) + Figure 2.3; Figure 2.4 (balance by product group 2015/2025); Table 2.4 (8 agreements: Korea, CETA, Japan, Vietnam, UK, NZ, Mercosur, India); FDI screening, FSR, IPI, ACI, Economic Security Strategy; investment and EVIPA. **Philippines removed**; v1 stats 15.8%, 40+, EUR 18.8 trillion, 30 million jobs removed (not in v5) |
| 2.2.2 International Cooperation and Global Governance (Table 2.5) | `c2-governance`, `c2-development` | `c2-development`, `c2-security` | edit + merge | Table 2.5 (UN, WTO, G7/G20, IMF/WB, Paris, FAO, ASEAN); WTO Appellate Body; ODA ≈ 40% (replaces USD 88.7 bn / 42%); Global Gateway up to EUR 300 bn by 2027; Ukraine response; reasons for limited weight. Waffle (B3a) and Global Gateway bar (B3b) dropped |
| – | – | `c2-security` (22 CSDP missions 13+8+1, 21 sanctions packages, EUR 210 bn, SAFE EUR 150 bn, A6 donut) | drop | Numbers not in v5 |
| 2.2.3 Global Standards and Sustainable Development (Table 2.6) | `c2-standards`, `c2-climate` | `c2-regulatory`, `c2-climate` | edit + merge | Brussels effect (Bradford 2020) de facto / de jure; GDPR, REACH, CE/NLF, DSA/DMA, AI Act; Table 2.6 (10 instruments); 55% by 2030, **proposed** 90% for 2040, 2050 neutrality; ETS 2005; CBAM definitive 2026; standard-setting bodies. A5 target path redrawn without the "≈ 35% below 1990" point and with 2040 marked "proposed" |
| – | – | `c2-model` (Börzel & Risse, AU, Mercosur), `c2-assessment` (Table 2.3 strengths/limits), `c2-prospects` | drop | Not in v5. The "structural strengths / political limits" idea now appears in the Conclusion, as in v5 |
| Chapter 3 cover | `ch3` | `ch3` | edit | Sub-headings now 3.1 Overview · 3.2 Economic influence · 3.3 Broader influence · 3.4 Opportunities, challenges and recommendations |
| 3.1.1 Milestones (Table 3.1) | `c3-milestones` | `c3-milestones` | edit | Table 3.1 checked (11 rows); EVFTA paragraph added; B1 two-lane timeline: lower lane rebuilt from v5 (Opinion 2/15 May 2017, signature, EP 12 Feb 2020, Council 30 Mar 2020, NA Jun 2020, entry into force, Bundestag Jul 2025, Poland 20th Nov 2025, France bill 27 Jul 2026) |
| 3.1.2 Strategic importance (Table 3.2) | `c3-importance` | – (v1 3.1.2 was "Trade and investment status") | new | 3rd export market (≈12–13%), 4th import source, 6th FDI source; largest EU goods partner in ASEAN, 9th import source, 14th partner (2025); Table 3.2 |
| 3.1.3 Major frameworks (Tables 3.3, 3.4) | `c3-frameworks`, `c3-evfta`, `c3-evipa` | `c3-evfta` | new + merge | Table 3.3 EVFTA vs EVIPA; EVFTA content incl. 169 EU / 39 Vietnamese GIs; Table 3.4 tariff commitments (84–86%, ≈99% by 2027; Vietnam ≈65%, rest by 2030); EVIPA status (20 of 27, Poland Nov 2025; France bill 27 Jul 2026; not in force); B2 dot grid kept. v1 milestones 2010 / 2012 / Dec 2015 dropped (not in v5) |
| 3.2.1 Impact of the EVFTA on bilateral trade (Tables 3.5–3.7, Figures 3.1, 3.2) | `c3-trade`, `c3-trade-vn`, `c3-structure`, `c3-investment` | `c3-trade`, `c3-structure`, `c3-investment`, `c3-impact-trade`, `c3-impact-investment` | edit + merge | Table 3.5 (EUR, Eurostat, 2019*–2025) + Figure 3.1 redrawn in EUR; Table 3.6 (USD, 2019/2024/2025) + dumbbell 2019→2025; channels (1.8 million C/O, EuroCham 61% and 8.7%); product composition 2025 + Figure 3.2 (6 SITC groups, 2025); FDI paragraph + Table 3.7 (7 rows, dates shown). v1 USD 2020–2024 chart, Korea/Singapore bars (A8b), tariff milestones 85.6/99.2% (A7) dropped |
| 3.2.2 Influence on economic structure and competitiveness (Table 3.8) | `c3-reform` | `c3-reform` | edit | Three channels (export structure and value chains, institutional and regulatory reform, green transition); Table 3.8 (7 rows incl. 37% customs-valuation discrepancies); procurement example |
| 3.3 Broader influence (intro) | `c3-broader` | `c3-broader` | edit | New two-dimension lead (standards; development cooperation; net zero 2050) |
| 3.3.1 Standards (Table 3.9) | `c3-standards` | `c3-standards`, `c3-standards-b` | edit | Table renumbered 3.6 → **3.9**; 2026 cooperation sentence; SME adjustment burden. v1 "Table 3.7 Opportunities and Challenges from EU Standards" dropped (not in v5) |
| 3.3.2 Development Cooperation and Green Transition (Tables 3.10, 3.11) | `c3-cooperation`, `c3-green` | `c3-cooperation`, `c3-green` | edit | Tables renumbered 3.8 → **3.10** and 3.9 → **3.11**; PCA in force 2016; Global Gateway €560 m (Mar 2026); JETP projects |
| 3.4.1 Opportunities | `c3-opportunities` | `c3-opportunities` | edit | 5 items in v5 order ("First … Fifth"), text re-condensed |
| 3.4.2 Challenges | `c3-challenges` | `c3-challenges` | edit | 5 items in v5 order |
| 3.4.3 Recommendations | `c3-recommendations` | `c3-recommendations` | edit | 7 cards; wording and citations replaced with those in v5 |
| Conclusion | `conclusion` | – | new | 3 parts: nature of the EU, relationship with Vietnam, recommendations |
| Reference | `references` | `references` | edit | Replaced with the 33 entries of the v5 REFERENCE list (APA, alphabetical, links kept) |
| (closing slide) | `qa` | `qa` | keep | – |

## 2. Navigation, counter, dots
- Top nav: Chapter 1 · Chapter 2 · Chapter 3 · **Conclusion** · References · Contents.
- Right-hand dots: Cover · Contents and Introduction · Chapter 1 · Chapter 2 · Chapter 3 · **Conclusion** · References. The active-dot logic (`chapterOf` in the content script) now knows the `conclusion` id.
- Section counter is computed from `main > section` at run time, so it follows the new section count automatically.
- The v1 page has no separate "agenda" or "Explore chapter" block; chapter covers carry the sub-heading list and were updated.

## 3. Figures and tables (v5 numbering)

| v5 | Web | Built with |
|---|---|---|
| Table 1.1 | `c1-history` timeline + A1 | `.tl` + timeline visual |
| Table 2.1 | `c2-economic` | `.tbl` |
| Figure 1 (→ Figure 2.1) | `c2-economic-b` | new `vbars` renderer, two panels |
| Figure 2.2 | `c2-political` | existing step chart, extended to 2026 |
| Table 2.2 | `c2-waves` | `.tbl` |
| Table 2.3 | `c2-trade` | `.tbl` |
| Figure 2.3 | `c2-trade` | `vbars` |
| Figure 2.4 | `c2-trade-balance` | `vbars` (grouped, negative values) |
| Table 2.4 | `c2-agreements` | `.tbl` + A4 status timeline (8 partners, 2011–2026) |
| Table 2.5 | `c2-governance` | `.tbl` |
| Table 2.6 | `c2-standards` | `.tbl` |
| Table 3.1 | `c3-milestones` | `.tl` + B1 |
| Table 3.2 | `c3-importance` | `.tbl` |
| Table 3.3 | `c3-frameworks` | `.tbl` |
| Table 3.4 | `c3-evfta` | `.tbl` |
| Table 3.5 / Figure 3.1 | `c3-trade` | `.tbl` + stacked bars (EUR) |
| Table 3.6 | `c3-trade-vn` | `.tbl` + dumbbell |
| Figure 3.2 | `c3-structure` | paired bars (2025) |
| Table 3.7 | `c3-investment` | `.tbl` |
| Table 3.8 | `c3-reform` | `.tbl` |
| Table 3.9 | `c3-standards` | `.tbl` |
| Table 3.10 | `c3-cooperation` | `.tbl` |
| Table 3.11 | `c3-green` | `.tbl` |

Values printed as labels on the v5 figures but not in the v5 text (Figure 2.1 intra-EU values and balances, Figure 3.2 SITC values other than 32.4 and 18.7, Figure 2.4 "other goods") are taken from the figure labels; the extra-EU export and import bars of v5 Figure 1 carry no labels and were not redrawn (only the labelled balances are shown).

## 4. Removed visuals
A6 (CSDP donut and counters), A7 (tariff milestones 85.6/99.2%), A8b (Korea/Singapore/EU bars), B3a (ODA waffle 42%), B3b (Global Gateway EUR 306 bn), B6 (Draghi ranges): their numbers are not in v5. Their specs are kept in `v2/viz_data.v1.backup.json`.
