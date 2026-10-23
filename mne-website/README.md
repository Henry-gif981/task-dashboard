# The Multinational Enterprises — website

Single-page, scroll-down website presenting the paper **"Multilateral Investment
System and Multinational Enterprises – Topic: The Multinational Enterprises"**
(Group 4, National Economics University – AEP, Investment Economics 65;
lecturer Nguyễn Thị Mai Hoa; Ha Noi, 10/2026).

The visual style follows the vintage engraving deck *Mẫu đabien.jpg* (cream
paper alternating with blue watercolour slides, giant small-caps titles with
cut-out engravings on top, calligraphic italics). See [DESIGN.md](DESIGN.md).

## Run locally

Requires Node.js ≥ 20.11. No dependencies to install.

```bash
cd mne-website
npm start            # → http://localhost:5173
```

Any static server works too, e.g. `python3 -m http.server 5173`.

To get a single file that opens without a server (fonts, images, CSS and JS
inlined): `python3 tools/standalone.py` → `dist/mne-website.html`.

## Folder structure

```
mne-website/
├── index.html            # the whole page (all content of the paper, semantic HTML)
├── css/style.css         # design tokens, layout, components, @font-face
├── js/main.js            # nav menu, scroll-spy, progress bar, reveal, count-up,
│                         # SVG charts, I-R matrix ↔ Table 1.3
├── js/present.js         # presentation mode + print deck for the PDF
├── assets/
│   ├── fonts/            # Cormorant SC, Cormorant Garamond, Be Vietnam Pro (woff2,
│   │                     # latin + latin-ext + vietnamese subsets)
│   └── img/              # engravings (SVG), watercolour/paper textures (WebP), logo
├── content/content.md    # full text of the paper extracted from the PDF
├── DESIGN.md             # design analysis and tokens
└── tools/
    ├── serve.mjs         # zero-dependency static server (gzip)
    ├── check.mjs         # content / contrast / console / overflow checks
    ├── png.mjs           # tiny PNG decoder used by check.mjs
    ├── standalone.py     # builds dist/mne-website.html (one self-contained file)
    ├── export-pdf.mjs    # builds dist/mne-website.pdf (16:9, one page per screen)
    ├── engrave.py        # draws the SVG engravings (globe, ship, factory, port…)
    ├── textures.py       # renders the watercolour and paper textures
    └── data/             # Natural Earth coastlines (world-atlas, public domain)
```

## Presenting

Press **Present** in the menu bar (or the **P** key, or open `index.html?present`).
One slide fills the screen at a time; long slides are split into screen-sized
pages at block boundaries, so no paragraph, card or table row is cut.

| Key | Action |
|---|---|
| → ↓ Space PageDown Enter, swipe | next page / slide |
| ← ↑ Shift+Space PageUp, swipe | previous |
| Home / End | first / last slide |
| F | full screen |
| Esc | leave (first leaves full screen) |

The control bar hides itself after a few seconds without mouse movement.

## PDF

```bash
npm start                 # in another terminal
node tools/export-pdf.mjs # → dist/mne-website.pdf
```

Same pages as the presentation, 16:9 (1600×900 px), vector text with live links.

## Checks

With the server running:

```bash
npm i -D playwright      # once (or set PLAYWRIGHT_PATH to a global install)
npm run check
```

`tools/check.mjs` verifies that every sentence, table cell and reference of
`content/content.md` is on the page (423/423), that every text element meets
WCAG AA contrast against its rendered background (612/612), and that there are
no console errors or horizontal overflow at 390, 768 and 1440 px.

Lighthouse (local, gzip): Performance 93–95 mobile / 100 desktop; Accessibility,
Best Practices and SEO 100.

## Regenerate the artwork

```bash
pip install numpy pillow   # textures only
npm run art                # python3 tools/engrave.py && python3 tools/textures.py
```

## Deploy

**Vercel** — import the repository, set *Root Directory* to `mne-website`,
*Framework Preset* "Other", no build command, output directory `.`.

**GitHub Pages** — Pages can only publish the repository root or `/docs`, so
use a workflow that uploads this folder, e.g. `.github/workflows/pages.yml`:

```yaml
name: Deploy MNE site
on: { push: { branches: [main] }, workflow_dispatch: {} }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: "${{ steps.d.outputs.page_url }}" }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/upload-pages-artifact@v3
        with: { path: mne-website }
      - id: d
        uses: actions/deploy-pages@v4
```

then choose *Settings → Pages → Source: GitHub Actions*.

## Credits

- Content: the paper by Group 4 (Đặng Việt Hoàng, Lê Trung Kiên, Ngô Anh Tuấn);
  sources as listed in its References.
- Illustrations: original vector engravings drawn by `tools/engrave.py`;
  coastlines from Natural Earth (public domain) via world-atlas (ISC).
- Logo: National Economics University, from the paper's cover page, rendered
  as a single-colour stamp.
- Fonts: Cormorant SC and Cormorant Garamond (Christian Thalmann), Be Vietnam Pro
  (Lâm Bảo, Tony Le, ViệtAnh Nguyễn) — SIL Open Font License 1.1.
