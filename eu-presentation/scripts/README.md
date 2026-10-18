# PDF export

Run from `eu-presentation/` to export both PDFs again:

```
node scripts/export_pdf.mjs && python3 scripts/check_pdf.py
```

- Output: `pdf/EU_presentation.pdf` (16:9 slides, 1920 × 1080 px pages) and `pdf/EU_presentation_A4.pdf` (A4 portrait, 15 mm margins).
- Requirements: Node 18+ and Playwright with its Chromium (`npm i -D playwright` if it is not installed; on this machine the preinstalled copy in `/opt/node22/lib/node_modules/playwright` is used, without `playwright install`). Python 3 with `pypdf` (`pip install pypdf`) for the cover page without a page number and for the bookmark titles; without it the PDFs are still written. `check_pdf.py` also needs poppler-utils (`pdfinfo`, `pdftotext`, `pdffonts`).
- Offline: every http(s) request is blocked during the export; fonts and `vendor/three.min.js` are local.
- What the export changes: only the print stylesheet in `index.html` (`@media print`, section "10. PDF export") and the steps in `export_pdf.mjs` (final state of all effects, charts redrawn at the page width, some slide sections scaled with CSS zoom so they fill whole pages). The page text is not changed.

## Slide-deck PDF (`export_slides.mjs`)

    node scripts/export_slides.mjs [source.html] [output.pdf]

Defaults: `v3b/EU_presentation_standalone_v3b.html` → `v3b/EU_presentation_v3b_slides.pdf`.
The page as it looks on screen (not the print stylesheet), one 1920 × 1080 page per slide:

- the dark slides (cover, chapter openings, Q&A) get a photograph of the 3D scene behind them as background;
- a slide taller than the screen is scaled down with CSS zoom (not below 0.68; 0.6 only where that avoids cutting through a block);
- if it still does not fit, it continues on the next page, cut only between blocks (paragraphs, cards, figures, table rows; a table keeps its caption, header and first rows together), with "<title> (tiếp n/m)" at the top;
- page numbers bottom right (none on the cover), bookmarks for every slide.

Result for v3b: 44 slides on 73 pages (21 slides need 2 or 3 pages), no network requests, no page errors; every text line of the page is in the PDF.
