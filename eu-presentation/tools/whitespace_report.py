"""Write v2b/WHITESPACE_AUDIT.md from visual_tests/whitespace_before.json and whitespace_after.json.  python3 tools/whitespace_report.py"""
import json
B = json.load(open('visual_tests/whitespace_before.json')); A = json.load(open('visual_tests/whitespace_after.json'))
dec = {
 'home': 'keep: cover; the 3D star ring fills the right half on purpose', 'ch1': 'keep: chapter cover, 3D scene', 'ch2': 'keep: chapter cover, 3D scene', 'ch3': 'keep: chapter cover, 3D scene', 'qa': 'keep: closing slide, 3D scene',
 'introduction': 'filled: B1 "EU at a glance" + route of the report (right column)', 'c1-concept': 'filled: B2 nested scopes + benefits/costs (right column)',
 'c1-principles': 'added: B8 Chapter 1 takeaway at the end', 'c2-trade': 'filled: A2 one voice + one seventh, beside the bullets (right half 50% → 26%)',
 'c2-governance': 'added: A3 seat matrix beside the WTO note', 'c2-standards': 'added: A4 time line of Table 2.6 under the Brussels-effect flow',
 'c2-climate': 'added: B8 Chapter 2 takeaway at the end', 'c3-numbers': 'new slide: A1 six numbers',
 'c3-milestones': 'filled: A5 trade 2020 vs 2025 beside the lead; KPI chips on two milestones', 'c3-importance': 'added: A6 two-way ranking after the lead',
 'c3-frameworks': 'added: A7a Opinion 2/15 branching, full width under the lead', 'c3-evfta': 'added: A7b tariff-path chart',
 'c3-investment': 'filled: A8 KPI tiles (row under the bullets); share and inflow charts under Table 3.7', 'c3-reform': 'filled: B4 smile curve (schematic) beside the lead and the stacked channel cards',
 'c3-broader': 'filled: B5 two channels → net zero (right column)', 'c3-recommendations': 'added: A9 opportunity → challenge → recommendation matrix',
 'c1-levels': 'enough: staircase visual + level cards (36% is the narrow lead line)', 'c1-model': 'enough: five cards across (37%); not on the list',
 'c3-cooperation': 'enough: Table 3.10 fills the slide (34% is the lead line)', 'c3-green': 'enough (25%): JETP projects and the three mechanisms are already cards (B6 exists)',
 'c2-waves': 'enough (24%): the "stability toolkit" is already three cards (B3 skipped)', 'references': 'enough: two-column reference list'}
f = lambda m: '–' if not m else f"{m['empty']*100:.0f}% / {m['rightEmpty']*100:.0f}% / {m['maxRect']*100:.0f}%"
rows = [f"| `{k}` | {f(B['1440x900'].get(k))} | {f(a)} | {dec.get(k, 'enough: ≤ 33% empty; tables or cards fill the slide')} |" for k, a in A['1440x900'].items()]
light = lambda D: [m['empty'] for m in D['1440x900'].values() if not m['dark']]
avg = lambda L: sum(L) / len(L)
top = ['introduction', 'c1-concept', 'c3-broader', 'c2-trade', 'c3-investment', 'c3-reform']
cmp = lambda size: "; ".join(f"`{k}` {B[size][k]['empty']*100:.0f}% → {A[size][k]['empty']*100:.0f}% (right half {B[size][k]['rightEmpty']*100:.0f}% → {A[size][k]['rightEmpty']*100:.0f}%)" for k in top)
L = ["# WHITESPACE_AUDIT: measured empty space per slide, before (v2) and after (v2b)", "",
 "Measured with `tools/whitespace.js` in Chromium (Playwright), file:// and offline, at 1920×1080, 1440×900 and 1280×720. Each section's top is put at the top of the screen; content = text line boxes plus every painted box (cards, tables, figures, SVG) on a 16 px grid; the section background, `.wrap` and `.panel` do not count. Raw numbers for all three sizes: `visual_tests/whitespace_before.json`, `visual_tests/whitespace_after.json`. Screenshots: `visual_tests/before/` (1440, every section) and `visual_tests/after/<size>/` (every changed section).", "",
 "Columns (1440×900): **empty** share of the first screen / **right half** empty / **largest empty rectangle**, as shares of the first screen. Rule: fill when the first screen is ≥ 40% empty or the right half ≥ 45% empty, unless the space belongs to the 3D scene of a dark cover. On this page 3D runs only behind the dark covers (`data-scene` hero/chapter); there are no hub/ladder/members/globe/bridge scenes, so an empty right half on a light slide is never intended.", "",
 "| Section | Before (v2) | After (v2b) | Decision |", "|---|---|---|---|"] + rows + ["",
 "## Summary", f"- Light slides, mean empty share of the first screen at 1440×900: **{avg(light(B))*100:.0f}% → {avg(light(A))*100:.0f}%** (new slide `c3-numbers` included).",
 "- Emptiest slides, 1440×900: " + cmp('1440x900') + ".", "- 1920×1080: " + cmp('1920x1080') + ".", "- 1280×720: " + cmp('1280x720') + ".",
 "- `c2-trade` keeps its first-screen figure (the bullets are long) but its right half is now used. `c3-milestones`, `c3-frameworks`, `c3-importance` get longer: their first screen is unchanged or slightly emptier on this measure because the new visual sits below the fold; the whole-section share (`wholeEmpty` in the JSON) shows the gain.",
 "- No horizontal overflow at 1920, 1440, 1280 or 390 px; no console errors.", "",
 "## Print (PDF made with `scripts/export_pdf.mjs`)", "See `visual_tests/print_fill.txt` (pages whose content stops above half height, excluding the last page). A4 report PDF: 5 → 3 such pages (59 → 71 pages; mean fill 80% → 80%): short tables, figures and cards now stay in one piece, long tables (> 7 rows) break between rows with a repeated header. Slide PDF (each section starts a new page): 15 → 21 such pages (69 → 79), because longer sections end on a part-filled page; see OPEN_ISSUES.md."]
open('v2b/WHITESPACE_AUDIT.md', 'w', encoding='utf-8').write("\n".join(L) + "\n"); print("written")
