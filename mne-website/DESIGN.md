# DESIGN — "The Multinational Enterprises"

Visual language borrowed from the reference deck *Mẫu đabien.jpg* (a vintage,
anatomy-engraving presentation). Only the **style** is borrowed: no portrait,
anatomy plate or text from the reference is reused. All illustrations on this
site are original SVG engravings on the MNE theme (globe, merchant ship,
factory and gears, port crane and containers, trade-route map).

## 1. What the reference does

| Observation in the reference | How this site applies it |
|---|---|
| Slides alternate a warm cream paper and a grey-blue watercolour wash | Sections alternate `--paper` and `--wash` backgrounds; every section is a rounded "slide" panel |
| Giant, thin, high-contrast capital titles; an engraving cut-out sits **on top of** part of the title ("ОТКРЫТИЯ") | Chapter openers: oversized small-caps title with an SVG engraving overlapping the middle letters (`.opener`) |
| Script-like italic for emphasis words and quotations | `Cormorant Garamond Italic` for kickers, pull quotes, the conclusion slide and "Thank you" |
| Small, clean sans for body copy, often in short blocks beside an image | `Be Vietnam Pro` 16–17px body, max ~68ch, two-column text / image grid |
| Sepia / monochrome engravings cut out from their background, some bleeding off the slide edge | Monochrome ink SVGs (`--ink` lines + cross-hatching), positioned to overflow panel edges on desktop |
| Faint repeated engravings in the background | Low-opacity tiled pattern (compass roses, ships, gears) `assets/img/pattern.svg` |
| Small blurred red dots (blood cells) as accents | Blurred brick-red "wax seal" dots `.dot`, used sparingly (max 3 per slide) |
| Tiny captions under images (e.g. "Абсорбциометр") | `.fig-cap` 12px uppercase tracking captions under illustrations and charts |
| Opening slide, quote slide, thank-you slide | Hero, Conclusion pull-quote slide, Thank-you slide |

## 2. Tokens (`css/style.css :root`)

### Colour
| Token | Value | Use |
|---|---|---|
| `--paper` | `#F4EBD0` | cream slide background |
| `--paper-hi` | `#FBF4E2` | cards / table rows on cream |
| `--paper-lo` | `#E9DDBC` | rules, card borders on cream |
| `--wash-1` | `#7C93A8` | watercolour wash, light blotches (decoration only) |
| `--wash-2` | `#5B7391` | watercolour wash, base |
| `--wash-3` | `#4A6280` | watercolour wash, deep (behind text) |
| `--slate` | `#3C5675` | titles, links, table header, accents on cream |
| `--slate-ink` | `#24364D` | darkest text on cream / engraving ink |
| `--text` | `#33404F` | body text on cream (≈ 9:1 on paper) |
| `--text-soft` | `#55606C` | captions on cream (≥ 4.5:1) |
| `--on-wash` | `#FBF4E2` | text on the blue wash |
| `--red` | `#9E3B3B` | rare accent: dots, negative values, "−" |
| `--red-soft` | `#B9605A` | blurred dots |

Body text sits only on `--paper`, `--paper-hi` or on the wash darkened by an
overlay (`.slide--deep`, and a top/bottom gradient on the hero, the blue
chapter opener and the thank-you slide). `tools/check.mjs` measures every text
element against the rendered background: all 612 pass WCAG AA.

### Typography
Fonts are self-hosted (`assets/fonts`, `@font-face` at the top of `css/style.css`).

| Role | Family | Size (fluid) |
|---|---|---|
| Display / chapter titles | **Cormorant SC** 500–600, letter-spacing −0.01em | `clamp(3.2rem, 11vw, 10rem)` |
| Section titles (h2/h3) | Cormorant SC 600 | `clamp(1.9rem, 4vw, 3rem)` / `1.5rem` |
| Italic emphasis, quotes | **Cormorant Garamond Italic** 500–600 | `clamp(1.4rem, 3vw, 2.4rem)` |
| Body | **Be Vietnam Pro** 400 / 600, line-height 1.7 | `clamp(1rem, .95rem + .2vw, 1.0625rem)` |
| Captions, labels | Be Vietnam Pro 600, uppercase, tracking .12em | `.75rem` |

All three families ship Vietnamese subsets (checked with "Đặng Việt Hoàng,
Lê Trung Kiên, Ngô Anh Tuấn, Nguyễn Thị Mai Hoa, Việt Nam").

### Shape, space, texture
- Slide panel: radius `14px`, inner padding `clamp(24px, 5vw, 72px)`, gap
  between slides `clamp(16px, 2.5vw, 28px)`, max width `1280px`.
- Hairline rules `1px` in `--paper-lo` (cream) or `rgba(251,244,226,.28)` (wash).
- Paper grain: `assets/img/paper.webp` (fine noise, multiply).
- Watercolour: `assets/img/wash.webp` (pre-rendered turbulence blotches) under
  a `--wash-2 → --wash-3` gradient.
- Engravings: single-colour SVG, stroke `--slate-ink`, hatching for shade.

### Motion
- Reveal on scroll: 14px rise + fade, 600ms, `cubic-bezier(.2,.7,.2,1)`.
- Count-up for key numbers, 1.2s ease-out; final value is in the HTML.
- Hover: cards lift 2px, links underline from left.
- `prefers-reduced-motion: reduce` → no transforms, no count-up, no parallax.

## 3. Slide stage (paper v2)

Every slide is a `<section class="slide">` with a fixed **1920×1080** design size
(padding 84/120/92 px). Body text 26 px, lead 30 px, cards 23 px, tables 20 px (≥ 18 px),
titles 66 px; nothing scrolls inside a slide and no slide continues onto the next one:
long sections are split into meaningful units (one paragraph pair, one card group, one
table, one figure) marked "(cont.)". `tools/check-layout.mjs` enforces it.

Chrome added to every slide by `js/main.js` (all with morph keys): background layer
(`bg`, paper or watercolour), three red dots in the margins (`dot-1…3`), chapter tag and
small engraving top-right (`ctag`, `emblem`), page counter `n / N` (`pno`, computed).

Views: scroll view zooms the stage to the column (`--z`), presentation letterboxes it
(`--pz`), print uses it 1:1 on a 1920×1080 page; below 760 px the scroll view reflows
(stage size released, grids to one column, tables scroll sideways).

Figures 1.1–1.3 are HTML diagrams (boxes + SVG connectors drawn by `drawLinks`), Figure
1.3 doubles as the interactive I-R matrix linked to Table 1.4; Figures 2.1–2.2 are HTML
bar charts (each bar and value label is a morph key). New engravings for v2: telescope
(1.3.3), chain and cog (1.3.5); the factory smoke was redrawn as one clean billow.

The slide-by-slide list is generated into `SLIDES.md`; transitions are described in `MORPH.md`.
