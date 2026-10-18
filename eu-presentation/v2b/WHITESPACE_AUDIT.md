# WHITESPACE_AUDIT: measured empty space per slide, before (v2) and after (v2b)

Measured with `tools/whitespace.js` in Chromium (Playwright), file:// and offline, at 1920×1080, 1440×900 and 1280×720. Each section's top is put at the top of the screen; content = text line boxes plus every painted box (cards, tables, figures, SVG) on a 16 px grid; the section background, `.wrap` and `.panel` do not count. Raw numbers for all three sizes: `visual_tests/whitespace_before.json`, `visual_tests/whitespace_after.json`. Screenshots: `visual_tests/before/` (1440, every section) and `visual_tests/after/<size>/` (every changed section).

Columns (1440×900): **empty** share of the first screen / **right half** empty / **largest empty rectangle**, as shares of the first screen. Rule: fill when the first screen is ≥ 40% empty or the right half ≥ 45% empty, unless the space belongs to the 3D scene of a dark cover. On this page 3D runs only behind the dark covers (`data-scene` hero/chapter); there are no hub/ladder/members/globe/bridge scenes, so an empty right half on a light slide is never intended.

| Section | Before (v2) | After (v2b) | Decision |
|---|---|---|---|
| `home` | 69% / 99% / 49% | 69% / 99% / 49% | keep: cover; the 3D star ring fills the right half on purpose |
| `contents` | 26% / 25% / 12% | 26% / 25% / 12% | enough: ≤ 33% empty; tables or cards fill the slide |
| `introduction` | 57% / 90% / 41% | 23% / 20% / 13% | filled: B1 "EU at a glance" + route of the report (right column) |
| `ch1` | 88% / 87% / 43% | 88% / 87% / 43% | keep: chapter cover, 3D scene |
| `c1-concept` | 61% / 93% / 41% | 22% / 12% / 8% | filled: B2 nested scopes + benefits/costs (right column) |
| `c1-levels` | 36% / 48% / 22% | 36% / 48% / 22% | enough: staircase visual + level cards (36% is the narrow lead line) |
| `c1-model` | 36% / 49% / 21% | 37% / 49% / 21% | enough: five cards across (37%); not on the list |
| `c1-history` | 29% / 35% / 17% | 29% / 35% / 17% | enough: ≤ 33% empty; tables or cards fill the slide |
| `c1-institutions` | 28% / 35% / 17% | 28% / 35% / 17% | enough: ≤ 33% empty; tables or cards fill the slide |
| `c1-principles` | 30% / 38% / 16% | 30% / 38% / 16% | added: B8 Chapter 1 takeaway at the end |
| `ch2` | 88% / 88% / 43% | 88% / 88% / 43% | keep: chapter cover, 3D scene |
| `c2-economic` | 30% / 37% / 15% | 30% / 37% / 15% | enough: ≤ 33% empty; tables or cards fill the slide |
| `c2-economic-b` | 28% / 33% / 17% | 28% / 33% / 17% | enough: ≤ 33% empty; tables or cards fill the slide |
| `c2-political` | 23% / 16% / 6% | 22% / 16% / 6% | enough: ≤ 33% empty; tables or cards fill the slide |
| `c2-waves` | 24% / 29% / 16% | 24% / 29% / 16% | enough (24%): the "stability toolkit" is already three cards (B3 skipped) |
| `c2-trade` | 37% / 50% / 18% | 37% / 26% / 13% | filled: A2 one voice + one seventh, beside the bullets (right half 50% → 26%) |
| `c2-trade-balance` | 20% / 27% / 13% | 20% / 27% / 13% | enough: ≤ 33% empty; tables or cards fill the slide |
| `c2-agreements` | 27% / 35% / 13% | 27% / 35% / 13% | enough: ≤ 33% empty; tables or cards fill the slide |
| `c2-governance` | 30% / 40% / 16% | 31% / 40% / 16% | added: A3 seat matrix beside the WTO note |
| `c2-development` | 26% / 33% / 17% | 27% / 33% / 17% | enough: ≤ 33% empty; tables or cards fill the slide |
| `c2-standards` | 35% / 44% / 15% | 35% / 44% / 15% | added: A4 time line of Table 2.6 under the Brussels-effect flow |
| `c2-climate` | 23% / 18% / 11% | 23% / 18% / 11% | added: B8 Chapter 2 takeaway at the end |
| `ch3` | 80% / 79% / 43% | 80% / 79% / 43% | keep: chapter cover, 3D scene |
| `c3-numbers` | – | 31% / 40% / 13% | new slide: A1 six numbers |
| `c3-milestones` | 36% / 47% / 18% | 46% / 33% / 18% | filled: A5 trade 2020 vs 2025 beside the lead; KPI chips on two milestones |
| `c3-importance` | 34% / 42% / 17% | 30% / 37% / 17% | added: A6 two-way ranking after the lead |
| `c3-frameworks` | 35% / 46% / 16% | 35% / 46% / 16% | added: A7a Opinion 2/15 branching, full width under the lead |
| `c3-evfta` | 29% / 29% / 18% | 29% / 29% / 18% | added: A7b tariff-path chart |
| `c3-evipa` | 26% / 32% / 17% | 25% / 32% / 17% | enough: ≤ 33% empty; tables or cards fill the slide |
| `c3-trade` | 25% / 29% / 18% | 24% / 29% / 18% | enough: ≤ 33% empty; tables or cards fill the slide |
| `c3-trade-vn` | 27% / 32% / 18% | 28% / 32% / 18% | enough: ≤ 33% empty; tables or cards fill the slide |
| `c3-structure` | 21% / 12% / 6% | 20% / 12% / 6% | enough: ≤ 33% empty; tables or cards fill the slide |
| `c3-investment` | 40% / 56% / 20% | 39% / 54% / 19% | filled: A8 KPI tiles (row under the bullets); share and inflow charts under Table 3.7 |
| `c3-reform` | 34% / 46% / 19% | 32% / 35% / 19% | filled: B4 smile curve (schematic) beside the lead and the stacked channel cards |
| `c3-broader` | 80% / 97% / 42% | 40% / 22% / 12% | filled: B5 two channels → net zero (right column) |
| `c3-standards` | 32% / 41% / 17% | 31% / 41% / 17% | enough: ≤ 33% empty; tables or cards fill the slide |
| `c3-cooperation` | 34% / 46% / 16% | 34% / 46% / 16% | enough: Table 3.10 fills the slide (34% is the lead line) |
| `c3-green` | 25% / 29% / 17% | 25% / 29% / 17% | enough (25%): JETP projects and the three mechanisms are already cards (B6 exists) |
| `c3-opportunities` | 21% / 24% / 19% | 21% / 24% / 19% | enough: ≤ 33% empty; tables or cards fill the slide |
| `c3-challenges` | 24% / 26% / 20% | 24% / 26% / 20% | enough: ≤ 33% empty; tables or cards fill the slide |
| `c3-recommendations` | 24% / 29% / 17% | 24% / 29% / 17% | added: A9 opportunity → challenge → recommendation matrix |
| `conclusion` | 20% / 25% / 13% | 20% / 25% / 13% | enough: ≤ 33% empty; tables or cards fill the slide |
| `references` | 37% / 40% / 15% | 37% / 40% / 15% | enough: two-column reference list |
| `qa` | 87% / 87% / 35% | 87% / 87% / 35% | keep: closing slide, 3D scene |

## Summary
- Light slides, mean empty share of the first screen at 1440×900: **32% → 29%** (new slide `c3-numbers` included).
- Emptiest slides, 1440×900: `introduction` 57% → 23% (right half 90% → 20%); `c1-concept` 61% → 22% (right half 93% → 12%); `c3-broader` 80% → 40% (right half 97% → 22%); `c2-trade` 37% → 37% (right half 50% → 26%); `c3-investment` 40% → 39% (right half 56% → 54%); `c3-reform` 34% → 32% (right half 46% → 35%).
- 1920×1080: `introduction` 63% → 34% (right half 92% → 31%); `c1-concept` 66% → 31% (right half 95% → 23%); `c3-broader` 83% → 54% (right half 98% → 39%); `c2-trade` 41% → 42% (right half 51% → 35%); `c3-investment` 44% → 43% (right half 56% → 54%); `c3-reform` 44% → 40% (right half 52% → 42%).
- 1280×720: `introduction` 57% → 25% (right half 93% → 22%); `c1-concept` 59% → 24% (right half 93% → 17%); `c3-broader` 72% → 28% (right half 96% → 10%); `c2-trade` 41% → 33% (right half 56% → 28%); `c3-investment` 46% → 43% (right half 63% → 60%); `c3-reform` 40% → 39% (right half 54% → 44%).
- `c2-trade` keeps its first-screen figure (the bullets are long) but its right half is now used. `c3-milestones`, `c3-frameworks`, `c3-importance` get longer: their first screen is unchanged or slightly emptier on this measure because the new visual sits below the fold; the whole-section share (`wholeEmpty` in the JSON) shows the gain.
- No horizontal overflow at 1920, 1440, 1280 or 390 px; no console errors.

## Print (PDF made with `scripts/export_pdf.mjs`)
See `visual_tests/print_fill.txt` (pages whose content stops above half height, excluding the last page). A4 report PDF: 5 → 3 such pages (59 → 71 pages; mean fill 80% → 80%): short tables, figures and cards now stay in one piece, long tables (> 7 rows) break between rows with a repeated header. Slide PDF (each section starts a new page): 15 → 21 such pages (69 → 79), because longer sections end on a part-filled page; see OPEN_ISSUES.md.
