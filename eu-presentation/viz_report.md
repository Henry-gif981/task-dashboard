# Data visuals added to the presentation

This file declares the data visuals that are **not in the original report** (*BTL Đa biên - Nhóm 4.pdf*).
All of them are additions placed next to existing content; no existing text, number, table, citation or reference was changed.
Figures 2.1, 3.1 and 3.2 were redrawn with the same data, captions, sources and "≈" labels.

- Data for every visual: `viz_data.json` (status of each value: exact / approximate / derived / axis). The page reads an embedded copy (`script#viz-data`); `python3 tools/embed_viz_data.py` re-embeds it, `--check` verifies it.
- Checks: `node tools/check_viz.js` (numbers), `node tools/compare_text.js index.backup.html index.html --without-visuals` (all other text unchanged).
- Each new visual is labelled "Visual · Section X.Y.Z" on the page (not "Figure"), so the report's figure numbering is unchanged.

## Visuals

| Key | Visual | Section (anchor) | Position | Source line shown |
|---|---|---|---|---|
| A1 | Interactive milestone timeline (Table 1) | 1.2.1 (`#c1-history`) | after the Table 1 milestone cards and their source line | European Union, European Parliament, European Council, and European Central Bank materials. |
| A2 | 21 of 27: one star per member state | 2.1.1 (`#c2-deepening`) | right-hand column, beside the text | Balassa (1961); European Union (2026); Jones et al. (2016); European Commission (n.d.-e). |
| F2.1 | Figure 2.1 remade as a step chart | 2.1.2 (`#c2-enlargement`) | existing Figure 2.1 (same caption, data and source) | existing figure source |
| A4 | Status timeline of the Table 2.2 agreements | 2.2.1 (`#c2-agreements`) | below Table 2.2 | European Commission (n.d.-c, n.d.-d, n.d.-f). Agreement count as stated in Section 2.2.1. |
| A5 | Path to climate neutrality (index 1990 = 100) | 2.3.1 (`#c2-climate`) | right-hand column, beside the text | European Commission (2026a); European Commission Joint Research Centre (2025). |
| A6 | CSDP donut + count-up figures | 2.3.2 (`#c2-security`) | below the three cards | Council of the European Union (2025, 2026a, 2026b). |
| A7 | EU tariff-elimination milestones (EU side only) | 3.2.3 (`#c3-impact-trade`) | below the two tariff statistics (where the EU tariff figures appear on the page) | Ministry of Industry and Trade of Vietnam. |
| A8a | Dumbbell 2019 → 2024 (Table 3.4) | 3.2.3 (`#c3-impact-trade`) | beside the tariff milestones, below Table 3.4 | Ministry of Industry and Trade of Vietnam. |
| A8b | Registered investment comparison (horizontal bars) | 3.2.3 (`#c3-impact-investment`) | below the EVIPA callout | Foreign Investment Agency/MPI and European External Action Service. |
| B1 | Two-lane timeline (Tables 3.1 and 3.3) | 3.1.1 (`#c3-milestones`) | below Table 3.1 | Compiled by the authors from the data in Sections 3.1.1 and 3.2.1. |
| B2 | EVIPA ratification: 20 of 27 dots | 3.2.1 (`#c3-evfta`) | below Table 3.3 | Compiled by the authors from the data in Section 3.2.1. |
| B3a | Waffle: 42% of global assistance | 2.2.3 (`#c2-development`) | left column, under the USD 88.7 billion statistic | Finnish Government (2025); European Commission (2026b). |
| B3b | Global Gateway: target vs mobilised | 2.2.3 (`#c2-development`) | right column, under the Global Gateway card | Finnish Government (2025); European Commission (2026b). |
| B4 | 3D staircase of integration levels (2D fallback) — *Schematic* | 1.1.2 (`#c1-levels`) | between the introductory text and the five cards | Compiled by the authors from the data in Section 1.1.2. |
| B5 | Institutions diagram — *Schematic* | 1.2.2 (`#c1-institutions`) | below the six institution cards | Compiled by the authors from the data in Section 1.2.2. |
| B6 | Draghi (2024) investment ranges | 2.1.3 (`#c2-challenges`) | beside the Competitiveness callout | Draghi (2024). |
| F3.1 | Figure 3.1 remade (same stacked bars) | 3.1.2 (`#c3-trade`) | existing Figure 3.1 (same caption, data and source) | existing figure source |
| F3.2 | Figure 3.2 remade (same paired bars) | 3.1.2 (`#c3-structure`) | existing Figure 3.2 (same caption, data and source) | existing figure source |

## Derived and approximate values shown

| Visual | Value | Status | Derivation / note |
|---|---|---|---|
| A2 | 6 | derived | 27 − 21 |
| A5 | 100 | derived | index base: 1990 = 100 |
| A5 | 65 | derived (approximate) | 100 − about 35% ("about 35% below 1990 levels") |
| A5 | 45 | derived | 100 − 55 ("at least 55%") |
| A5 | 10 | derived | 100 − 90 ("90% net reduction") |
| A5 | 0 | derived | climate neutrality = net zero |
| A6 | 210 | approximate |  |
| A8a | 21.8 | approximate |  |
| A8b | 83.13 | approximate |  |
| A8b | 30.6 | approximate |  |
| B2 | 7 | derived | 27 − 20 |
| F3.1 | 40 | approximate |  |
| F3.1 | 15 | approximate |  |
| F3.1 | 55 | derived (approximate) | 40 + 15 |
| F3.1 | 40 | approximate |  |
| F3.1 | 16 | approximate |  |
| F3.1 | 56 | derived (approximate) | 40 + 16 |
| F3.1 | 47 | approximate |  |
| F3.1 | 17 | approximate |  |
| F3.1 | 64 | derived (approximate) | 47 + 17 |
| F3.1 | 44 | approximate |  |
| F3.1 | 16 | approximate |  |
| F3.1 | 60 | derived (approximate) | 44 + 16 |
| F3.2 | 26.6 | approximate |  |
| F3.2 | 4.2 | approximate |  |
| F3.2 | 5.0 | approximate |  |
| F3.2 | 0.6 | approximate |  |
| F3.2 | 5.0 | approximate |  |
| F3.2 | 1.8 | approximate |  |
| F3.2 | 1.0 | approximate |  |
| F3.2 | 3.7 | approximate |  |
| F3.2 | 0.4 | approximate |  |
| F3.2 | 0.2 | approximate |  |

## New text on the page (for review)

Text written for the visuals. Event names, dates and descriptions shown inside the visuals are copied from the existing tables and cards and are not repeated here.

### A1
- Label: Visual · Section 1.2.1
- Title: Enlargement milestones run through the whole history of integration
- Unit line: Milestones from Table 1; spacing is by order, not to scale. Select a milestone to read it.
- Source line: European Union, European Parliament, European Council, and European Central Bank materials.
- Screen-reader description: Scrollable timeline of the milestones in Table 1, from 1950 to 2020–present; membership changes are marked with stars.
- Legend: Enlargement (members join)
- Legend: Brexit (a member leaves)
- Legend: Other milestone

### A2
- Label: Visual · Section 2.1.1
- Title: 21 of 27 member states use the euro as official currency
- Unit line: One star = one member state. Stars are not linked to particular countries.
- Note: 6 = 27 − 21 (derived).
- Source line: Balassa (1961); European Union (2026); Jones et al. (2016); European Commission (n.d.-e).
- Screen-reader description: Twenty-seven stars, one per member state: 21 filled gold stars use the euro, 6 outlined stars do not. Stars are not assigned to named countries.
- Group labels: use the euro; do not use the euro (derived)

### F2.1
- Unit line: Number of member states. Wave notes from Table 2.1.
- Screen-reader description: Step chart of EU members after each enlargement: 6 in 1957, 9 in 1973, 10 in 1981, 12 in 1986, 15 in 1995, 25 in 2004, 27 in 2007, 28 in 2013 and 27 in 2020 after the UK withdrawal.

### A4
- Label: Visual · Section 2.2.1
- Title: The EU's trade network keeps widening, with agreements at every stage
- Unit line: Dates from Table 2.2 (status as of October 2026). Shape and label show the latest status.
- Source line: European Commission (n.d.-c, n.d.-d, n.d.-f). Agreement count as stated in Section 2.2.1.
- Screen-reader description: Timeline of the five agreements in Table 2.2. Japan in force since 1 February 2019; Vietnam (EVFTA) in force since 1 August 2020; Mercosur political agreement 6 December 2024, signed 17 January 2026, provisionally applied from 1 May 2026; India negotiations concluded 27 January 2026, presented to the Council 11 September 2026; Philippines substantial agreement announced 22 September 2026.
- Status names: In force; Provisionally applied; Negotiations concluded; Substantial agreement announced; Earlier step
- Context line: The EU has 40+ agreements in place with about 80 partners (Section 2.2.1).

### A5
- Label: Visual · Section 2.3.1
- Title: EU climate targets step down from 1990 levels to climate neutrality in 2050
- Unit line: Index, net greenhouse-gas emissions, 1990 = 100.
- Note: Targets, not projections; straight lines are schematic.
- Note: Derived: 2030 = 100 − 55 (at least 55% reduction, so at most 45); 2040 = 100 − 90 (90% net reduction: 85% domestic and up to 5% international carbon credits); 2050 = 0 (climate neutrality); latest ≈ 65 = 100 − about 35%.
- Note: The latest level is placed at 2024, the year of the emissions-share figure in Section 2.3.1.
- Source line: European Commission (2026a); European Commission Joint Research Centre (2025).
- Screen-reader description: Index of net greenhouse-gas emissions, 1990 = 100. Latest reported level about 65 (about 35% below 1990). Targets: 45 or less in 2030, 10 in 2040, 0 (climate neutrality) in 2050. All values except 1990 are derived from the stated percentages; these are targets, not projections.
- Point labels: 1990 base; about 35% below 1990; at least −55%; −90% net; climate neutrality (each target followed by ", derived")

### A6
- Label: Visual · Section 2.3.2
- Title: Most CSDP missions are civilian; since 2022 the EU has added sanctions and defence finance
- Unit line: Missions and operations: count. Money: EUR billion.
- Source line: Council of the European Union (2025, 2026a, 2026b).
- Screen-reader description: Donut chart of 22 CSDP missions and operations: 13 civilian, 8 military, 1 civilian-military. Beside it: 21 sanctions packages against Russia by July 2026, about EUR 210 billion in Russian central bank assets immobilised, and the EUR 150 billion SAFE loan instrument.
- Counter captions: sanctions packages against Russia, by {date}; Russian central bank assets immobilised in the EU (about EUR 210 billion); SAFE loan instrument, adopted on {date}

### A7
- Label: Visual · Section 3.2.3 (a)
- Title: The EU removes most tariffs on Vietnamese goods at entry into force and almost all within seven years
- Unit line: Share eliminated by the EU, %.
- Note: Milestones, not annual data; dashed lines only connect the two milestones.
- Source line: Ministry of Industry and Trade of Vietnam.
- Screen-reader description: EU tariff elimination for Vietnamese goods under the EVFTA. Upon entry into force: 85.6% of tariff lines, 70.3% of Vietnam's export value. After seven years: 99.2% of tariff lines, 99.7% of export value.
- Milestone labels: Upon entry into force; After seven years

### A8a
- Label: Visual · Section 3.2.3 (b)
- Title: All three trade indicators rose from 2019 to 2024, the surplus fastest
- Unit line: US$ billion. Change as in Table 3.4.
- Note: The 2019 surplus is approximate (≈), as in Table 3.4.
- Source line: Ministry of Industry and Trade of Vietnam.
- Screen-reader description: Dumbbell chart, US$ billion, 2019 to 2024: total Vietnam–EU trade 49.8 to 68.3 (+37.1%); Vietnam's exports to the EU 35.8 to 51.6 (+44.1%); Vietnam's trade surplus with the EU about 21.8 to 34.9 (+60.1%).

### A8b
- Label: Visual · Section 3.2.3 (c)
- Title: EU registered investment in Vietnam is far below that of South Korea and Singapore
- Unit line: Cumulative registered investment in Vietnam, US$ billion.
- Note: Figures come from different sources; the comparison is indicative only (see the note under Table 3.5).
- Note: An open bar end means "more than".
- Source line: Foreign Investment Agency/MPI and European External Action Service.
- Screen-reader description: Cumulative registered investment in Vietnam, US$ billion: South Korea more than 92 (end of 2024); Singapore about 83.13 (end of 2024); EU about 30.6 (2024). Figures come from different sources.

### B1
- Label: Visual · Sections 3.1.1 and 3.2.1
- Title: The EVFTA and EVIPA process runs alongside the deepening of Vietnam–EU relations
- Unit line: Time axis to scale; dates as given in Tables 3.1 and 3.3. Ranges are drawn as bars.
- Source line: Compiled by the authors from the data in Sections 3.1.1 and 3.2.1.
- Screen-reader description: Two-lane timeline. Upper lane: Vietnam–EU relations from Table 3.1, 1990 to 1 Aug 2026. Lower lane: EVFTA and EVIPA milestones from Table 3.3, 2010 to Aug 2026.

### B2
- Label: Visual · Section 3.2.1
- Title: 20 member states had ratified the EVIPA by November 2025; it is not yet in force
- Unit line: One dot = one member state. Dots are not linked to particular countries.
- Note: As reported, Nov 2025; not yet in force as of Oct 2026.
- Note: 7 = 27 − 20 (derived).
- Source line: Compiled by the authors from the data in Section 3.2.1.
- Screen-reader description: Twenty-seven dots, one per member state: 20 filled dots have ratified the EVIPA (Poland was the 20th, in November 2025); 7 outlined dots have not. As reported in November 2025; not yet in force as of October 2026.
- Group labels: have ratified (Poland the 20th, Nov 2025); not yet (derived)

### B3a
- Label: Visual · Section 2.2.3 (a)
- Title: EU countries in the DAC gave 42% of global development assistance in 2024
- Unit line: 100 squares = global assistance of USD 212 billion (2024).
- Source line: Finnish Government (2025); European Commission (2026b).
- Screen-reader description: Waffle chart of 100 squares for global assistance of USD 212 billion: 42 gold squares are the USD 88.7 billion given by EU countries in the OECD Development Assistance Committee, 8.6% less than in 2023.

### B3b
- Label: Visual · Section 2.2.3 (b)
- Title: Global Gateway mobilisation has passed its EUR 300 billion target
- Unit line: EUR billion. An open bar end means "more than".
- Source line: Finnish Government (2025); European Commission (2026b).
- Screen-reader description: Bar chart: Global Gateway target of mobilising up to EUR 300 billion; Team Europe had mobilised more than EUR 306 billion for over 250 projects by 2026.
- Bar labels: Target: up to EUR 300 bn; Mobilised by 2026: more than EUR 306 bn; over 250 projects

### B4
- Label: Visual · Section 1.1.2 · Schematic
- Title: Each level of integration builds on the one below
- Unit line: Schematic: block heights show order only, not a measured quantity. Select a level to read its description.
- Source line: Compiled by the authors from the data in Section 1.1.2.
- Screen-reader description: Schematic staircase of five levels of regional economic integration: Free Trade Area, Customs Union, Common Market, Economic Union, Economic and Monetary Union. Not a measurement.

### B5
- Label: Visual · Section 1.2.2 · Schematic
- Title: The Commission proposes; the Parliament and the Council adopt
- Unit line: Schematic: only the relations stated in the text of Section 1.2.2 are drawn.
- Source line: Compiled by the authors from the data in Section 1.2.2.
- Screen-reader description: Schematic of the relations stated in Section 1.2.2: the European Council defines overall political direction and priorities; the European Commission proposes legislation; the European Parliament and the Council of the European Union adopt EU legislation together; the Court of Justice of the European Union ensures EU law is interpreted and applied consistently; the European Central Bank is responsible for monetary policy in the euro area.

### B6
- Label: Visual · Section 2.1.3
- Title: Draghi (2024): the EU needs to invest EUR 750–800 billion a year
- Unit line: Ranges as stated; no single point estimate is chosen.
- Source line: Draghi (2024).
- Screen-reader description: Range bars: EUR 750 to 800 billion a year, equal to 4.4 to 4.7% of EU GDP in 2023 (Draghi, 2024). Both are ranges, not single estimates.
- Row names: Investment need, EUR billion a year; Share of 2023 GDP, %

### F3.1
- Note: ≈ = approximate (2020–2023, read from the original chart). Totals above the bars are derived (exports + imports).
- Screen-reader description: Stacked bars, billion USD: exports to the EU and imports from the EU, 2020 to 2024. 2020: about 40 and 15; 2021: about 40 and 16; 2022: about 47 and 17; 2023: about 44 and 16; 2024: 51.6 and 16.7.

### F3.2
- Note: All values approximate (≈), read from the original chart.
- Screen-reader description: Paired horizontal bars, billion EUR, 2024, all values approximate: machinery and transport equipment 26.6 EU imports from Vietnam, 4.2 EU exports to Vietnam; textiles and clothing 5.0 and 0.6; food and agricultural products 5.0 and 1.8; chemicals 1.0 and 3.7; fuels and mining 0.4 and 0.2.

Interface words used by several visuals: "View data" / "Hide data", "Status as of October 2026", "Change", "Total above each bar", "Schematic straight line", "Range of years", "derived", "Target", "1990 base", "Latest reported (approximate)", "Mobilised (open end: more than)", "Rest of global assistance", "EU countries in the DAC".

## Visuals not made

- **A7, Vietnam side** (48.5% / 64.5% at entry into force, about 99% / 99.8% within ten years): these figures do not appear anywhere on the page, so under rule 1 they were not drawn. Only the EU side (85.6% / 70.3% → 99.2% / 99.7%) is shown. A7 is placed in Section 3.2.3, where those EU figures are, instead of 3.2.1.
- **B7, map of Europe by accession wave**: not made. The page does not name the ten countries of the 2004 enlargement (Table 2.1 says only "Ten countries in 2004"), so a map would add country information that is not on the page; no boundary data is bundled offline either. No country shapes were drawn by hand.
- **Radar charts or scores for strengths/limitations**: not made (no such data).
