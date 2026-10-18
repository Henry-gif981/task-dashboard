# OPEN_ISSUES: points in BTL v5 to fix in the Word/PDF, and points for the group to confirm

The web page (v2) already shows the corrected form for every item marked **web: fixed**. Page numbers refer to `BTL_Đa_biên_-_Nhóm_4_5.pdf` (45 pages).

## A. Errors in the report (fix in Word)

| # | Where (page) | What the report says | Should be | Web |
|---|---|---|---|---|
| A1 | 2.2.1, p. 18 | "Table 2.6 presents key indicators of the EU's external trade in 2025" | "Table 2.3 presents…" (Table 2.6 is the standards table in 2.2.3) | fixed (no wrong cross-reference) |
| A2 | 2.2.1, p. 19 | "…particularly from China (Figure 3)" | "(Figure 2.4)" | fixed |
| A3 | 2.1.1, p. 14 | Caption "Figure 1. EU trade in goods, 2021–2025" | "Figure 2.1" (it sits before Figure 2.2; Chapter 2 otherwise uses 2.x) | fixed: shown as Figure 2.1 (a) and (b) |
| A4 | 3.2.1, p. 32 | "Table 3.8 compares the position before and after the EVFTA" | "Table 3.7 compares…" | fixed |
| A5 | 3.2.2, p. 34 | "…align its legal framework with international commitments (Table 3.9)" | "(Table 3.8)" | fixed |
| A6 | 3.3.2, p. 38 | Caption "Table 3.11rrrrrrrrrrrrrrrrrrrrr." | "Table 3.11." | fixed |
| A7 | Table 3.7, p. 33 | Row "Annual European FDI inflow" is a broken equation object: "US2. 5𝑏𝑛(2022)→𝑈𝑆3.25 bn (2024)" | "US$2.5 bn (2022) → US$3.25 bn (2024)" (confirmed from the page image) | fixed |
| A8 | Table 3.7 source, p. 33 | Broken equation: "US27. 8𝑏𝑛(𝑒𝑛𝑑 − 2022)÷𝑈𝑆496.7 bn" | "US$27.8 bn (end-2022) ÷ US$496.7 bn (total at 30 Nov 2024)" = 5.60% (checked) | fixed |
| A9 | Sources of Tables 3.6 and 3.7 | "as given in the authors' earlier draft" (draft trace) | Name the original source of the 2019 figures (MOIT/Customs; FIA/MPI) | removed on the web; wording to be decided |
| A10 | 2.2.1, p. 20 | "…the one concluded with Vietnam, which to the author's knowledge was still awaiting ratification" (draft trace, singular "author") | "…which was still awaiting ratification by Member States (see Section 3.1.3)" | fixed |
| A11 | Several sources | "compiled by the author", "author's chart" | "the authors" (group report) | fixed on the web |
| A12 | Table 3.1, p. 27 | 1995 row: "Framework cooperation arrangements; start of the thirty-year trade series" | The second half is unclear (no thirty-year series appears in the report). Suggest deleting it or explaining it | web shows only "Framework cooperation arrangements" |
| A13 | Table 3.1 | No source line under the table (every other table has one) | Add a source (e.g. EEAS; European Commission; VietnamPlus) | web shows no source (nothing to quote) |
| A14 | 3.2.2, p. 33 | Announces three channels ("…and the green transition") but only develops two sub-headings | Add a short "Green transition" paragraph or say it is treated in 3.3 | web: third card points to Section 3.3 |
| A15 | 3.4.3, p. 43 | Last recommendation ends "…using industry associations for technical training" with no full stop and no citation | Finish the sentence; add a citation if intended | web shows the sentence with a full stop |
| A16 | Reference list, pp. 44–45 | Only 33 entries, ending at "Schimmelfennig". Cited in the text but **missing from the list**: East Asia Forum (2026); S&P Global (2025); Trung tâm WTO và Hội nhập (2026b, 2026c); Vietnam News Agency (2026); Thương hiệu & Công luận (2026); Climate Policy Initiative (n.d.); Italian Trade Agency (2026); Vietnam Investment Review (2025); Sullivan & Cromwell (2026); Bundesbank (2026); DLA Piper (2026); Ebner Stolz (2026); Upply (2025); plus table sources EEAS, VietnamPlus, Viet Nam News, EuroCham, Vietnam Briefing. Conversely, many listed works are no longer cited (Bull, Damro, Manners, Lavenex, Börzel & Risse, Hettne & Söderbaum, Meunier & Nicolaïdis, Schimmelfennig & Sedelmeier, Jones et al., Draghi, Letta…). Entries T–Z may have been cut off | Complete the list (the v1 `references.md` has full entries for several of these) and decide whether to keep uncited works | web shows exactly the 33 entries of v5, as instructed; in-text citations kept as in v5 |
| A17 | Figure 1 vs Table 2.3 | Figure shows 2024 extra-EU balance "+147"; Table 2.3 says 2024 surplus "EUR 136 billion" | Use one vintage, or add a note | web shows both, with a note |
| A18 | Table 3.5 | Rounding: 2020 balance −25.8 (parts give −25.7); 2021 total 49.2 (49.1); 2023 balance −36.4 (−36.3); 2024 total 67.4 (67.3); 2025 total 76.0 (76.1) | Normal Eurostat rounding; a footnote "totals may not add due to rounding" would help | web keeps the printed values; note under Figure 3.1 |
| A19 | Table 3.6 | 2025 total "≈74" while 56.2 + 17.6 = 73.8; change "+49%" (73.8 → +48.2%; 74 → +48.6%) | Print 73.8 and +48%, or keep ≈74 and +49% | web keeps the printed values |
| A20 | Table 2.3 | US share 355.5 / (559.4/22.3%) = 14.2% vs printed 14.1% | Within rounding of the source; no action needed unless the source says otherwise | – |
| A21 | Table 3.7 | Mixed dates in one table: 2019 vs end-2022 vs 2025; the 5.6% share combines end-2022 capital with a 30 Nov 2024 total | Say so in the table (as the web does) | web: "Latest (date of each figure)" column and note |
| A22 | Chapter 1 numbering | Table 1.1 "1986-1987" uses a hyphen, other ranges use en dashes | Typographic | – |

Full arithmetic output: `v2/table_math_check.txt` (from `tools/check_tables_v2.py`).

## B. Decisions for the group

| # | Question | Default used on the web |
|---|---|---|
| B1 | **Conclusion** still uses 2019–2024 (US$49.8 bn → about US$68 bn) although Table 3.6 now has 2025 (≈US$74 bn). Update to 2025? | Kept as in v5 (2019–2024) |
| B2 | Old web content with no counterpart in v5 (saved in `v2/removed_sections.html`): Viner/Balassa theory card; "Core Mechanisms" 1.2.4; NGEU EUR 800 bn; candidate list and 2025 Enlargement Package; Draghi EUR 750–800 bn and Letta; CSDP 22 missions; 21 sanctions packages, EUR 210 bn assets, SAFE EUR 150 bn; Börzel & Risse / African Union / Mercosur as models; strengths-and-limitations table; future prospects; 15.8% of world trade, 40+ agreements, EUR 18.8 trillion GDP, 30 million jobs; Korea/Singapore investment comparison; tariff milestones 85.6% / 99.2%; Table "Opportunities and Challenges from EU Standards". Restore any? | Removed |
| B3 | Old v1 values replaced by v5 values (all now one value, from v5): ODA "USD 88.7 bn = 42%" → "≈40%"; 2040 target "adopted March 2026 (85% + 5% credits)" → "proposed 90%"; "22 CSDP missions (13 civilian, 8 military, 1 civilian-military)" → removed (v1 did add up, 13 + 8 + 1 = 22, because of the third category; v5 gives no mission numbers); 2024 trade "US$68.3 bn" → "US$68.4 bn" (Table 3.6), Vietnam's 2024 exports 51.6 → 51.7 and surplus 34.9 → 35.0; EVFTA tariff lines 85.6% / 99.2% → "about 84–86%" / "≈99%"; France EVIPA bill "Aug 2026" → "27 July 2026"; Figure 3.1 USD 2020–2024 (values read from a chart) → EUR 2019–2025 (Table 3.5) | v5 values |
| B4 | Figure 2.2 in v5 has no marker at 2026 (the line simply runs to 2026). Web extends the axis to 2026 with 27 members | As v5 |
| B5 | The extra-EU export/import bars of Figure 1 have no value labels in v5; the web draws only the labelled balances and the intra-EU bars | As described |

## C. 2026 events: check against original sources

Web searches made on 18 Oct 2026 (secondary sources; please confirm with the official texts before submission).

| Claim in v5 | Result |
|---|---|
| Bulgaria joined the euro area on 1 January 2026 as the 21st member | **Confirmed** (ECB press release 1 Jan 2026; European Parliament EPRS) |
| Mercosur: signed 17 January 2026; interim trade agreement applied provisionally from 1 May 2026; EP asked the CJEU for an opinion | **Consistent**: provisional application from 1 May 2026 for Mercosur states that had notified (Argentina, Brazil, Uruguay; Paraguay later); CJEU opinion pending (EC Representation in Luxembourg; Houthoff; Thomson Reuters). Signature date not re-checked |
| India: negotiations concluded 27 January 2026 | **Mostly confirmed**: announced at the 27 Jan 2026 summit in New Delhi; one report dates the close of talks to 26 Jan (European Commission IP Helpdesk; 3tres3). Signature not found |
| Vietnam–EU Comprehensive Strategic Partnership on 29 January 2026 during António Costa's visit to Hanoi | **Confirmed** (Viet Nam News; Euronews; VnEconomy) |
| EU announces more than €560 million in Global Gateway commitments for Vietnam on 24 March 2026 | **Confirmed** by Vietnamese government and business media (Báo Chính phủ; VnEconomy); Commission release not found |
| Poland the 20th member state to ratify the EVIPA (November 2025) | **Confirmed**: presidential signature 27 Nov 2025 (VNA; Viet Nam News) |
| France: government approved the EVIPA ratification bill on 27 July 2026 and sent it to Parliament | **Confirmed** (VietnamPlus, 2 Aug 2026; QDND). No parliamentary vote found. Note: the French government is quoted describing the dispute mechanism differently from Table 3.3 (ICS); worth re-reading the original |
| Commission proposed a 90% reduction target for 2040 | **Consistent**: Council general approach on 90% (incl. up to 5% international credits) on 5 Nov 2025; final adoption by Parliament and Council not confirmed in these results. v5 wording "proposed" is safe |
| ReArm Europe / Readiness 2030 up to EUR 800 bn (2025) | Consistent with the Commission's March 2025 plan (not re-searched) |
| Germany: EVIPA submitted to the Bundestag in July 2025; conflicting reports in March 2026 | Not verified |
| 1.8 million certificates of origin (2024); EuroCham 2025 survey (61%, 8.7%, 37%) | Not verified |

Sources used: [ECB, Bulgaria](https://www.ecb.europa.eu/press/pr/date/2026/html/ecb.pr260101~c830245e42.en.html) · [EPRS, Bulgaria](https://www.europarl.europa.eu/thinktank/en/document/EPRS_ATA(2025)775850) · [EC Luxembourg, Mercosur](https://luxembourg.representation.ec.europa.eu/actualites-et-evenements/actualites/eu-mercosur-agreement-provisionally-apply-1-may-2026-2026-03-23_fr) · [Houthoff](https://www.houthoff.com/actueel/nieuws/handelsovereenkomst-eu-mercosur-voorlopige-toepassing-vanaf-1-mei-2026/) · [Thomson Reuters](https://www.thomsonreuters.com/en-us/help/onesource-global-trade/regulatory-insights/2026/may-8th/eu-mercosur-trade-agreement-application.html) · [EC IP Helpdesk, India](https://intellectual-property-helpdesk.ec.europa.eu/news-events/news/eu-india-free-trade-agreement-concluded-major-global-trade-milestone-2026-01-29_en) · [3tres3](https://www.3tres3.com/en/print/22146) · [Viet Nam News, CSP](https://vietnamnews.vn/politics-laws/1764809/viet-nam-european-union-upgrade-ties-to-comprehensive-strategic-partnership.html) · [Euronews](https://euronews.com/2026/01/29/eu-and-vietnam-elevate-ties-to-comprehensive-strategic-partnership) · [VnEconomy, €560 m](https://en.vneconomy.vn/the-eu-to-invest-560-million-in-vietnam-with-new-focus-on-modern-transport.htm) · [Báo Chính phủ](https://en.baochinhphu.vn/eu-to-invest-560-million-in-viet-nam-with-new-focus-on-modern-transport-111260324152114674.htm) · [VNA, Poland](https://vietnam.vnanet.vn/english/tin-tuc/poland-ratifies-eu-vietnam-investment-protection-agreement-415905.html) · [VietnamPlus, France](https://en.vietnamplus.vn/france-takes-step-toward-ratification-of-eu-vietnam-investment-protection-agreement-post349357.vnp) · [QDND](https://en.qdnd.vn/economy/international-cooperation/france-takes-step-toward-ratification-of-e-u-vietnam-investment-protection-agreement-593661) · [Linklaters, 2040 target](https://sustainablefutures.linklaters.com/post/102ltze/eu-council-reaches-agreement-on-new-2035-and-2040-climate-targets) · [SolarPower Europe](https://www.solarpowereurope.org/press-releases/statement-council-adopts-2040-climate-target)

## D. Web-only notes
- The Figure 2.1 intra-EU values (3,442 … 4,143), the balances (+55 … +128), Figure 2.4 "other goods" (9.5, 20.7) and the Figure 3.2 values other than 32.4 and 18.7 come from the labels printed on the report's figures (status "figure label" in `viz_data.json`); they are not in the report text.
- `tools/check_citations.py` and `tools/check_viz.js` were written for v1 (references.md, 42 entries; v1 page text) and are not meaningful for v2; v2 uses `tools/check_v2.js`, `tools/check_page.js` and `tools/check_tables_v2.py`.
