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

## 3. Page structure

Like the reference, slides are mostly but not strictly alternating.

| # | Slide (`id`) | Background | Components |
|---|---|---|---|
| 0 | Navbar (fixed) | paper, blurred | chapter links, scroll-spy, reading-progress bar, mobile menu |
| 1 | Hero `#top` | wash | NEU stamp + AEP, course name, giant "Multinational Enterprises" with the globe cut-out on top, italic subtitle, group / class / lecturer / date |
| 2 | Introduction `#introduction` | paper | 1 Rationale + compass rose, 2 Objectives (+3 numbered cards), 3 Scope, 4 Methodology, 5 Structure (+chapter links) |
| 3 | Chapter 1 opener `#chapter-1` | paper | giant "Theory" with the merchant ship over it (the reference's "ОТКРЫТИЯ" slide) |
| 4 | 1.1.1–1.1.2 `#s1-1` | wash (deep) | concept, 10% FDI threshold bar, pull quote, 6 characteristic cards |
| 5 | 1.1.3 `#s1-1-3` | paper | OLI Venn diagram, Table 1.1, 4 motive cards |
| 6 | 1.2 `#s1-2` | wash (deep) | ownership forms (bars), Table 1.2, EPRG cards |
| 7 | 1.3.1 `#s1-3` | paper | interactive I-R 2×2 matrix ↔ Table 1.3 |
| 8 | 1.3.2–1.3.3 `#s1-3-2` | wash (deep) | entry-mode staircase, 3 trend cards (16% → 44% bars) |
| 9 | Chapter 2 opener `#chapter-2` | wash | giant "Impacts" with the balance scale over it |
| 10 | 2.1 `#s2-1` | paper | advantages (+) / disadvantages (−) ledger, Table 2.1 |
| 11 | 2.2–2.3 `#s2-2`, `#s2-3` | wash (deep) | home-country text + factory engraving, host-country positive / negative, Table 2.2 |
| 12 | Chapter 3 opener `#chapter-3` | paper | giant "Viet Nam" with the port crane over it |
| 13 | 3.1 `#s3-1` | wash (deep) | overview, 7 key numbers (count-up), 3 SVG charts, Table 3.1 |
| 14 | 3.2 `#s3-2` | paper | 5 numbered impacts, ">20% of GDP" and Samsung "≈13%" callouts |
| 15 | 3.3 `#s3-3` | wash (deep) | 5 impact cards, Samsung share bar, global-minimum-tax callout |
| 16 | 3.4 `#s3-4` | paper | 5 numbered policy steps on a dotted timeline |
| 17 | Conclusion `#conclusion` | wash (deep) | large italic pull-quote, antique trade-route map, full conclusion |
| 18 | References `#references` | paper | 27 APA entries (paper order and italics, live links); collapsible List of abbreviations and List of tables |
| 19 | Thank you `#thanks` | wash | "Thank you *for your* attention" |
| 20 | Footer | paper | credits |

Tables are real `<table>` elements with a slate header and hairline rows.
Below 720px each row becomes a card (cell labels from `data-label`), so nothing
scrolls sideways.

## 4. Charts (hand-drawn SVG, no library)

All values come from the paper; derived values are labelled "derived".
1. **FDI into Viet Nam** — registered vs disbursed, 2025 vs 9M 2026 (USD bn).
2. **Exports 2025** — FDI sector USD 367.1 bn (77.3%) vs domestic sector
   USD 107.9 bn (derived: 475 − 367.1).
3. **Trade balance 2025** — FDI +49.5, domestic −29.4, national ≈ +20 (USD bn).
4. **Strategic sectors' share of global greenfield value** — 16% (2020) → 44% (2025).
