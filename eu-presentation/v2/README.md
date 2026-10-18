# EU presentation v2 (aligned with BTL v5)

| File | What it is |
|---|---|
| `EU_presentation_standalone_v2.html` | The updated single-file page (fonts and Three.js inlined; opens offline) |
| `EU_presentation_standalone.backup.html` | Unchanged copy of the v1 standalone file |
| `index.v1.backup.html`, `viz_data.v1.backup.json` | v1 source page and chart data |
| `removed_sections.html` | v1 sections dropped from v2, and the v1 versions of rewritten sections |
| `CHANGELOG.md` | Report section → web section → action |
| `OPEN_ISSUES.md` | Errors in the report to fix in Word, decisions for the group, check of 2026 events |
| `EU_presentation_v2.pdf`, `EU_presentation_A4_v2.pdf` | Print-to-PDF of v2 (16:9 and A4); the v1 PDFs stay in `../pdf/` |
| `table_math_check.txt` | Sums, differences and % changes of Tables 3.5, 3.6 (and notes) recomputed |
| `check_v2_index.txt`, `check_v2_standalone.txt`, `check_page_standalone.txt` | Link/id/label/forbidden-string checks, random number sample, numbers vs report |
| `screens/1440`, `screens/390`, `screens/no3d-1440` | Screenshots of every section (`-full` = whole section) |
| `new_main.html` | The rewritten `<main>` before assembly (kept sections appear as `<!--KEEP:id-->`) |

Rebuild: edit `../index.html` (and `../viz_data.json`, then `python3 tools/embed_viz_data.py`), then `python3 tools/build_standalone.py v2/EU_presentation_standalone_v2.html` from `eu-presentation/`.
Checks: `node tools/check_v2.js index.html <BTL.pdf>`, `node tools/check_page.js <BTL.pdf>`, `python3 tools/check_tables_v2.py`.
