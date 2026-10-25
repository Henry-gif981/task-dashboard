# MORPH — presentation transitions

Press **Present** (or **P**). Each `<section class="slide">` is a 1920×1080 stage,
letterboxed to the window (`--pz`). Moving between slides plays a transition
equivalent to PowerPoint's *Morph*:

* an element whose `data-morph` key also exists on the other slide **glides, scales
  and re-colours** from its old box to its new one (PowerPoint's `!!name` convention);
* an element present on only one side **fades** out / in and drifts 24 px in the
  direction of travel (reversed when going back).

## Engine (`js/present.js`)

| Situation | What runs |
|---|---|
| Browser with the View Transitions API (Chrome/Edge 111+, Safari 18+) | `document.startViewTransition`. Before the call every keyed element of the **current** slide gets `view-transition-name: m-<key>`; inside the update callback those names are removed, the new slide is shown and its keyed elements get the same names. Names are removed when `transition.finished` settles. |
| No View Transitions, or `?flip` in the URL | FLIP fallback: matched elements are cloned into an overlay and animated with the Web Animations API from the old box to the new one (transform + cross-fade, colours carried by the clones); the rest of the old slide fades out, the new one in. |
| `prefers-reduced-motion: reduce` | Morph becomes a plain cross-fade of at most 200 ms (no movement). |
| Effect **Off** | Instant switch. |
| Key pressed while a transition runs | The running transition is skipped (`skipTransition()` / FLIP `finish()`), lands on its slide, and the next one starts; a stale transition can no longer clear names (fixed race, see `cancelRunning`). |

Text and images keep their proportions while a box changes shape:
`::view-transition-old/new(*) { height: 100%; width: auto; object-fit: contain }`.
The background (`m-bg`) and the whole slide in the overview (`m-slide`) are allowed to stretch.

## Controls

The bar at the bottom (hidden after 3 s without mouse movement): previous / next,
`n / N`, progress, **Morph | Fade | Off**, **Duration 0.5–2 s**, overview, full screen,
exit. Effect and duration are stored in `localStorage` (`mne-fx`, `mne-ms`; wrapped in
try/catch, so private windows simply forget them).

Keys: → ↓ Space PageDown Enter = next · ← ↑ Shift+Space PageUp Backspace = previous ·
Home / End · **F** full screen · **G** overview (click a thumbnail or press Enter) ·
**Esc** exit. Swipe on touch screens, click on a slide = next. The URL hash follows the
slide (`#/12`); opening `index.html#/12` starts the presentation on slide 12.

## Change duration or easing

* Default duration: `--morph-ms` in `css/style.css` (`:root`) and `ms` in `js/present.js`
  (900 ms); the control bar overrides it per browser.
* Easing: `--morph-ease` in `css/style.css` (default `cubic-bezier(.65, 0, .35, 1)`, an
  ease-in-out like PowerPoint) and `ease` inside `viaFlip()` for the fallback.
* Fade distance for unmatched elements: `24px` in `@keyframes vt-out / vt-in` and in `viaFlip()`.

## Add a key

1. Put `data-morph="<key>"` on the element on **both** slides. Keys are unique within a
   slide (`tools/test-morph.mjs` and `node tools/slides-md.mjs` report duplicates);
   letters, digits, `-` and `_`.
2. Keep it to about 25 keyed elements per slide (the current maximum is 22) and avoid
   heavy `filter` / blur on keyed elements.
3. Elements hidden in a layout (`display: none`) are ignored automatically.
4. Run `node tools/test-morph.mjs` and `node tools/slides-md.mjs` (refreshes SLIDES.md).

## Keys in use

Every slide shares at least **7** keys with its neighbour (minimum measured by the test):

| Key | Element | Effect |
|---|---|---|
| `bg` | slide background (paper ↔ watercolour) | cross-fade in place |
| `dot-1`, `dot-2`, `dot-3` | red wax dots in the margins | slide to the next slide's positions |
| `ctag` | chapter tag top-right ↔ the giant word of a chapter opener ("THEORY", "IMPACTS", "VIET NAM") | the giant word shrinks into the tag |
| `emblem` | small engraving top-right ↔ the big cut-out of an opener (globe, ship, scale, crane) | the cut-out flies into the corner |
| `pno` | page number "n / N" | stays, number cross-fades |
| `eyebrow`, `title` | section line and slide title | move / resize between title styles |
| `p-a`, `p-b` | first / second text block | reflow between layouts |
| `card-1…3`, `char-1…6` | objective cards; the six characteristics (list ↔ detailed cards) | cards re-arrange |
| `type-1…4`, `form-1…4`, `parent` | Table 1.1 rows; legal forms ↔ boxes of Figure 1.1 | cards become diagram boxes |
| `s-a…s-d` | Stopford & Wells steps ↔ Figure 1.2 panels ↔ Table 1.2 rows | diagram ↔ table |
| `q-int`, `q-multi`, `q-global`, `q-trans` | Figure 1.3 quadrants ↔ Table 1.4 rows ↔ summary cards | quadrant flies into its table row |
| `comp-1…3`, `vc-1…6`, `adv-1…6`, `dis-1…6`, `mode-1…5`, `rec-1…6` | strategy cards; ledger items ↔ Table 1.7 cells; Table 1.6 rows ↔ entry ladder | list ↔ table |
| `tframe`, `fpanel`, `art`, `threshold`, `sub` | table frame, figure panel, illustration, 10 % panel, sub-heading | frame resizes between tables / figures |
| `num-reg`, `num-dis`, `num-gdp`, `num-share`, `num-surplus`, `num-jobs`, `num-local`, `num-imports` | Key numbers tiles ↔ the callouts on the detail slides (38.42, 27.62, >20 %, 77.3 %, ~49.5, 4.6 million, 26.6 %, 317.6) | the number flies to its slide |
| `reg-2021…2025`, `dis-2021…2025`, `ex-2019…2025` | Table 2.3 / 2.4 value cells ↔ value labels of Figures 2.1 / 2.2 | each number moves onto its bar |
| `bar-reg-…`, `bar-dis-…`, `bar-ex-…` | the bars themselves | appear on the chart slides |
| `toc-intro`, `toc-ch1`, `toc-ch2`, `toc-end` | Contents cards ↔ chapter links | card shrinks into the heading |
| `m-slide` (overview only) | the chosen thumbnail | zooms to full screen |

The full key list per slide is in `SLIDES.md`.

## Tests

`node tools/test-morph.mjs` freezes eight transitions at 50 % and checks that every
matched element sits between its old and new position (frames saved in
`test-results/morph/`), then tests going back, eight rapid key presses, the hash, the
overview, the FLIP fallback (`?flip`), reduced motion and the "Off" setting.
