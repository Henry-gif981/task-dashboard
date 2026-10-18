# OPEN_ISSUES (v2b visuals): points for the group to decide

The report-level issues of v2 (table numbering, broken equations, missing references, etc.) are still listed in `v2/OPEN_ISSUES.md`; this file adds what came up while drawing the new visuals.

## 1. A recommendation on skills and human capital (A9)
Section 3.4 lists five opportunities and five challenges. The authors' matching in the new matrix finds a recommendation for four of the five pairs; **"Human capital and technology ↔ Shortages of skills and innovation capacity" has none**, apart from "using industry associations for technical training" inside Recommendation 7. The matrix shows this gap openly ("No dedicated recommendation yet").
**Suggestion:** add a Recommendation 8 on skills (vocational training for green and digital industries, cooperation in education, science and innovation with the EU), which Sections 3.3.2 (Table 3.10, "Education and skills") and 3.4.1 already support. Then replace the dashed cell with "R8".

## 2. The matching itself is the authors' reading
A9 pairs opportunities, challenges and recommendations; the report does not state these pairs. The figure says so ("Authors' matching, not in the report"; Source: "… compiled by the authors"). Please check the pairs: R3/R4/R7 ↔ market access; R6/R4 ↔ investment; R5/R2 ↔ green transition; R1/R2/R3 ↔ institutions.

## 3. Compliance matrix CBAM / EUDR / IUU (B7): not drawn
The report names EUDR (coffee, rubber, timber) and IUU (fleet monitoring) only inside Recommendation 3, and CBAM only in Chapter 2 (sectors: steel, cement, aluminium, fertilisers, electricity, hydrogen) without saying which Vietnamese exports are affected. A sector × instrument matrix would therefore go beyond the report. **If the group adds a short paragraph on CBAM/EUDR/IUU exposure of Vietnamese exports to Section 3.3.1, the matrix can be built from it.**

## 4. Annual FDI inflow (A8i)
"US$2.5 bn (2022) → US$3.25 bn (2024)" comes from the "Annual European FDI inflow" row of Table 3.7, whose text in the PDF is a broken equation; the values were read from the page image (p. 33). Please fix the row in Word (see v2/OPEN_ISSUES.md, A7) and confirm the source (VietnamPlus, Sept 2025 / Vietnam Briefing).

## 5. Mixed dates in the FDI share (A8s)
The ≈5.6% share divides end-2022 EU capital by Vietnam's total at 30 Nov 2024, as the report says. The chart labels it "Latest (mixed dates)" and repeats the note. If the group finds a consistent-date figure, replace it.

## 6. Interpretive titles and "so what" lines
Insight titles are short readings of the report's own figures. Three go one small step beyond a single sentence of the report and should be checked:
- A6: "Each matters to the other, but the EU weighs more in Vietnam's trade than Vietnam does in the EU's" (from rank 3 vs rank 14 in Table 3.2).
- A4: "Eight of the ten instruments in Table 2.6 date from 2018 or later" (a count; CBAM counted from its 2023 transitional phase).
- A5: "The upgrade … in 2026 came on top of six years of fast-growing trade" (2020 €43.3 bn → 2025 €76.0 bn, Table 3.5; 2020 is the entry-into-force year, not a full EVFTA year).

## 7. Schematic figures
B2 (nested scopes, benefits/costs), B4 (smile curve) and B5 (two channels) are concepts, not data, and are marked "Schematic" (B4: "Schematic, not measured"). The smile curve illustrates a sentence of Section 3.2.2; the report has no value-added data by stage.

## 8. Slide PDF gets more part-empty pages
In the A4 report PDF, part-empty pages fell from 5 to 3. In the 16:9 slide PDF (each section starts a new page) they rose from 15 to 21, because longer sections now end on a part-filled page. Options: accept (the slide PDF is a handout), or let `scripts/export_pdf.mjs` scale more sections (its `fitSections` only touches sections that need ≥ 72% zoom).

## 9. Not changed on purpose
- Section 3.1.1 timeline was not turned into a zigzag: on screen it is already a full-width four-column grid (the "tiny timeline" impression came from the print layout). It got two KPI chips and a trade bar chart instead.
- The new slide "Vietnam–EU in six numbers" has no section number (eyebrow "Chapter 3 · Key figures") and appears in the table of contents as an unnumbered entry, so the numbering of the report is unchanged.
- The page source here is v2 (without presentation mode). To add presentation mode to v2b: `python3 tools/inject_present.py v2b/src/index_v2b.html index.html` and then `python3 tools/build_standalone.py <output.html>`; add `NOTES["c3-numbers"]` for the new slide.
