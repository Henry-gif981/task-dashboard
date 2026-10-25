# MORPH — presentation transitions

Press **Present** (or **P**). Each slide is a 1920×1080 stage letterboxed to the window. Moving between
slides plays a choreographed *Morph*: elements whose `data-morph` key exists on both slides glide from
their old box to the new one; everything else leaves and arrives in layers, each with its own timing.
All settings are in **`js/morph.config.js`**; measurements are in [PERF.md](PERF.md).

## Engine (`js/present.js`)

* **Web Animations, compositor-only.** Only `transform`, `opacity` and `clip-path` are animated, on the
  real elements (no snapshots, no clones). The old slide stays still underneath; the new one is shown
  above it. `will-change` is never set by hand (an animation promotes its element only while it runs).
* **Read, then write.** Every rect, computed transform and fade set is read before the first DOM write.
  The two neighbours of the current slide stay laid out invisibly (`.is-near`) and their images are
  decoded in advance; transitions wait for the web fonts.
* **At most 12 matched elements per pair** (`maxMorph`): chapter tag, title, eyebrow, emblem, dots,
  page number first; the rest fade.
* **Kinds of match** — `stay` (same box and content: nothing moves), `swap` (same box, new content:
  cross-fade in place), `fly` (same content, new box: the new element starts from the old box,
  translate + *uniform* scale), `flyx` (box with new content: both move, cross-fade), `xfade` (text of
  another size: moves and cross-fades, never scaled), `frame` (a table or figure panel: the new frame
  takes the old box, its rows fade in one after another), `letters`, `flap` (below).
* **Cancelable.** A key press during a transition finishes it at once (no queue) and continues; every
  temporary span, class and style is removed when a transition ends or is cut short.
* **Auto-degrade.** Three Cinematic transitions in a row with an average frame over 24 ms → Classic and a
  chip "Chế độ nhẹ" in the bar (click it to try Cinematic again). `?nodegrade` disables this (tests).
* `prefers-reduced-motion: reduce` → a 200 ms cross-fade of the slide, nothing moves.
* `?vt` uses the old View Transitions engine, kept only for comparison (PERF.md).

## Presets (control bar)

| Preset | Light (same section) | Strong (new section / chapter, openers) | Effects |
|---|---|---|---|
| **Cinematic** (default) | 560 ms | 1100 ms | all eight |
| **Classic** | 480 ms | 760 ms | compass, cards, bullets |
| **Fade** | 320 ms | 420 ms | one cross-fade of the slide |
| **Tắt** | — | — | instant |

"Strong" = the section number in the title changes (1.1 → 1.2), or one side is an opener, the cover or
the thank-you slide. **Tốc độ** (in "Hiệu ứng") multiplies every duration by 0.5–2. Preset, speed,
step mode and switched-off effects are remembered (`localStorage`, wrapped in try/catch).

## Layers and timing (`phase` in morph.config.js)

| Layer | When (fraction of the transition) | Easing |
|---|---|---|
| background (wipe or ink drop) | 0 → 1, the slowest | `bg` smooth in-out |
| old content leaves (fade + drift) | 0 → 0.42 | `out` |
| matched elements glide | 0.04 → 0.92 | `move`; cards and dots `spring` (slight overshoot) |
| new content arrives (fade + drift, staggered) | 0.34 → 1 | `in`; cards `spring` |
| after-effects (bars, digits, engravings) | 0.5 → 1 | — |

Drift distances (`distance`): text 36 px, images 22 px (parallax), 12 px between two slides of the same
template. Large blocks (a whole table or figure) only fade: moving them would resample a large layer
every frame.

## The eight signature effects (each can be switched off in "Hiệu ứng")

| Key | Effect | How |
|---|---|---|
| `ink` | **Ink drop.** On a strong transition the red dot on the side you travel to drifts to the centre and spreads; the new page is revealed by a growing circle. | `clip-path: circle()` on the new background + a scaled dot |
| `compass` | **Compass guide.** One compass rose (overlay, not part of any slide) travels the margins, turns to point at the next slide's content, grows large on chapter openers, hides on the cover and the last slide. | transform (spring) |
| `letters` | **Flying letters / split-flap.** The giant opener word (THEORY, IMPACTS, VIET NAM) splits into letters that fly and shrink into the chapter tag of the next slide, 38 ms apart (and back). Two titles in the same place keep their common start; the characters that differ roll over like a railway board, 30 ms apart (word by word when more than 14 change). | temporary letter spans, transform |
| `engrave` | **Draw-in.** An engraving arriving on a slide is uncovered left-to-right (direction-aware) once the morph has settled; a leaving one drifts out the way you travel. | `clip-path: inset()` |
| `cards` | **Cards re-arrange.** Matched cards (characteristics, legal forms, strategies, recommendations, ledger items, table rows) fly to their new place 55 ms apart with a spring; new cards rise one after another. | transform |
| `numbers` | **Numbers and bars.** Matched key numbers roll like an odometer (digit by digit, 45 ms apart); chart bars grow from the axis after the labels have landed, the 2025 bar last with a stronger spring; table frames morph and their rows appear 30 ms apart. | transform (digit strips, `::before` of the bars) |
| `bullets` | **Ink sweep.** Each bullet slides in 16 px while a slate band sweeps off it. | CSS animation on `::after` (transform) |
| `parallax` | **Light parallax.** Images drift 22 px, text 36 px, the background not at all. | transform |

## Bullet steps

Every first-level bullet (`.bl > li[data-step]`), every card of a `[data-steps]` group and every row of a
`tbody[data-steps="hl"]` is a step. → / Space shows the next step before going to the next slide;
← hides the last step before going back; arriving backwards shows all steps. **Từng bước | Hiện hết** in
the bar switches between step-by-step (default) and everything at once. Hidden steps keep their space
(opacity + transform only), so nothing shifts. Table rows are highlighted one at a time (the others are
dimmed, never hidden). Print / PDF and the scroll view always show everything.

## Notes, presenter view

**N** opens the speaker notes: the paper's full text for the slide (`full` in `content/deck.json`) plus
the full text of shortened table cells. **S** opens a presenter window (current slide, notes, clock,
next slide); both windows stay in sync through a `BroadcastChannel`, either one can drive.

## Controls

Bar at the bottom (hidden after 3 s without mouse movement): previous / next, `n / N` and step count,
Từng bước | Hiện hết, Cinematic | Classic | Fade | Tắt, Hiệu ứng (eight switches + speed), notes,
presenter window, overview, full screen, exit.

Keys: → ↓ Space PageDown Enter = next · ← ↑ Shift+Space PageUp Backspace = previous · Home / End ·
**N** notes · **S** presenter window · **F** full screen · **G** overview · **Esc** exit. Swipe, wheel and
click also work. The URL hash follows the slide (`#/12`).

## Add a key

1. Put `data-morph="<key>"` on the element on **both** slides (in `content/slides/<id>.html`, or as
   `"morph"` of a bullet item in `content/deck.json`). Keys are unique within a slide.
2. Prefer boxes (cards, frames, numbers) to long text; a slide pair keeps at most 12 matches.
3. `node tools/build.mjs`, then `node tools/test-morph.mjs` and `node tools/slides-md.mjs`.

## Tests

`node tools/test-morph.mjs` freezes nine transitions half-way and checks that every flying element is
between its old and new place (frames in `test-results/morph/`), then checks clean-up, rapid presses,
cancelling, steps (→, ←, no layout shift, Hiện hết, table rows), Fade / Tắt, reduced motion, effect
switches, auto-degrade, notes, the presenter window in both directions, reading mode, the overview and
`?vt`. `node tools/perf-morph.mjs` measures frame rates (PERF.md).
