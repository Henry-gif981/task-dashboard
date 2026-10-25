# PERF — Morph transitions, measured before and after

Script: `node tools/perf-morph.mjs [--engine=vt|flip] [--preset=…] [--out=file.json]` (server on
`:5173`). For eight representative pairs of slides it records, in the page, every
`requestAnimationFrame` from the key press to the end of the transition (+150 ms), long tasks
(`PerformanceObserver`), the delay from the key press to the first animated frame, the number of
`view-transition-name` / animated elements, DOM nodes, composited layers (CDP `LayerTree`), JS heap
(CDP `Performance.getMetrics`), and a Chrome trace of the first pair. Each run is done at CPU
throttling 1× and 4× (`Emulation.setCPUThrottlingRate`), at 1920×1080.

Pairs: `s1-1 → s1-1-1b` (text, cream → wash), `t1-2 → t1-3` (table → table), `s1-3-3 → t1-5`
(engraving → table), `chapter-1 → s1-1` (opener → text), `t2-3 → f2-1` (table → chart),
`s1-2 → f1-1` (cards → Figure 1.1), `key-numbers → s2-2-1` (numbers → table), `top → contents`
(cover globe → contents).

**Environment.** Headless Chromium (Playwright) in a cloud container, no GPU: the compositor draws
with the software renderer (SwiftShader / `SoftwareRenderer`). That is much slower than a laptop
GPU, so the numbers are a worst case; they are useful to compare engines and to find what costs
frames, and the targets below were checked here, in the slow environment.

## 1. Before (commit f81bf8e, Morph 900 ms)

### View Transitions engine (the default before)

| CPU | avg FPS | min FPS (pair) | p95 frame | frames > 33 ms | press → 1st frame | long tasks | named elements | layers |
|---|---|---|---|---|---|---|---|---|
| 1× | **8.0** | 6.8 | 466.7 ms | 55 | 154–514 ms | none | 11–31 | 91–215 |
| 4× | **7.8** | 6.7 | 333.3 ms | 60 | 386–635 ms | up to 98 ms | 10–31 | 91–215 |

DOM: 2,253 elements, JS heap ~1 MB. Worst pairs: `t2-3 → f2-1` (31 names, 74 animated
pseudo-elements, 215 layers) and `top → contents` (first frame after 514 / 635 ms).

### FLIP fallback (`?flip`)

| CPU | avg FPS | min FPS (pair) | p95 frame | max frame | frames > 33 ms | press → 1st frame | long tasks |
|---|---|---|---|---|---|---|---|
| 1× | **33.1** | 25.2 (`s1-2 → f1-1`) | 66.7 ms | 133 ms | 78 | 49–166 ms | up to 108 ms |
| 4× | **31.5** | 25.7 | 83.4 ms | 100 ms | 85 | 97–215 ms | up to 118 ms |

Layers 27–49, animated elements 19–41.

Raw data: `test-results/perf/before-vt.json`, `before-flip.json` (not committed).

### Where the time goes (traces)

* **View Transitions**: every transition captures *full-page* snapshots of the old and the new
  state plus one snapshot per named element (up to 31), all of which must be rasterised before the
  first frame (raster ≈ 80 ms per transition on the worker, `ViewTransition::ProcessCurrentState`,
  then 91–215 composited layers). The slides are textured (paper grain, watercolour, cross-hatched
  SVG engravings), so the snapshots are large textures. Each frame then draws every pseudo-element
  quad: compositor `DirectRenderer::DrawFrame` ≈ 36 ms per frame, 2,929 quads drawn in 24 frames
  in the first pair. Result: 7–9 FPS and 0.4–0.6 s before anything moves.
* **FLIP**: `cloneNode` copies of up to 20 elements (with copied computed styles) are new layers that
  must be painted and rasterised at the start (`RasterTask` ≈ 78 ms, the 97–118 ms long task at 4×),
  and **both whole slides** fade and slide at the same time: two 1920×1080 textured layers blended
  every frame (measured alone: one full textured layer fading = 42 FPS here, two = less), plus
  the clones on top.
* **Isolated tests** (`scratchpad`, same environment): a full-screen textured layer revealed with an
  animated `clip-path: circle()` runs at **60 FPS** (p95 16.8 ms); scaling a circular textured layer
  52 FPS; fading a full textured layer 42 FPS; translating it 40 FPS. Small layers (cards, titles,
  dots) moving with `transform` cost almost nothing.
* Main thread: style/layout ≤ 20 ms per transition; scripts 26–42 ms (FLIP clone set-up).
* No web fonts or images were loading during the measured transitions (fonts.ready awaited); the
  engravings are SVG `<img>` and are not re-rasterised unless their layer is scaled.

**Causes, in order:** (1) full-page snapshots / full-slide cross-fades = several full-screen textured
layers blended every frame; (2) up to 31 named elements → hundreds of quads; (3) clones and
snapshots rasterised at the key press (long task, late first frame); (4) scaled text snapshots
(blurry and re-rastered). Animated properties were already transform/opacity: layout properties were
not the problem.

## 2. What was changed (B2)

| Cause | Fix |
|---|---|
| Full-page snapshots (View Transitions) | New default engine (`js/present.js`): Web Animations on the real elements, no snapshot, no clone. View Transitions kept only for comparison (`?vt`). |
| Two whole slides cross-fading | The old slide stays still underneath; only its content blocks fade, and only during the first 42 % (`phase.leave`). Same paper on both sides → the new background is not drawn at all until the end; different paper → a clip-path wipe or the ink drop (measured 60 FPS alone). |
| Up to 31 named elements | At most `maxMorph` = 12 matched elements per pair (chrome and headings first, the rest fade). |
| Big panels blended twice | A table / figure frame is never cross-faded with the previous one: the new frame takes the old box (transform only, no scale when the sizes are close) and its rows fade in 30 ms apart. Large blocks (> 450 000 px²) only fade, never move. |
| Heavy engravings rasterised at the key press (≈ 0.8 s for the globe) | Globe, ship, port, scale, factory, trade map, telescope, chain pre-rendered to 2× WebP (`tools/prerender.mjs`); runtime `filter: drop-shadow` removed from every image. |
| Main-thread work at the key press | All reads (rects, computed transforms, fade sets, compass pose) before the first write; only the three slides around the current one carry state classes; neighbours stay laid out (`is-near`, `visibility: hidden`) and their images are decoded in advance (`img.decode()`); notes updated only when open; no scroll observers while presenting; transitions wait for `document.fonts.ready`. |
| Text scaled in snapshots | Text is never scaled: a heading that changes size cross-fades while moving; only boxes (cards, frames, images, dots) scale, uniformly. |
| Heavy work during the transition | Bars, odometer, engraving draw-in start at 50 % (`phase.after`) and are CSS/WAAPI transform or clip-path animations. |
| Rapid presses | A key press during a transition finishes it at once (no queue) and continues. |
| Slow device | Auto-degrade: three Cinematic transitions in a row with average frame > 24 ms → Classic, chip "Chế độ nhẹ" in the bar (click = Cinematic again). |

`will-change` is never set permanently: the Web Animations API promotes an element to its own layer only
while its animation runs.

## 3. After (Cinematic preset, all eight effects on)

Same script, same pairs, same machine. This container's software compositor varies from run to run by
a few FPS (the same build gave 59.3, 57.7 and 57.9 FPS average at 1× in three consecutive runs), so
three full runs are given.

| Run | CPU | avg FPS | min FPS | p95 frame (worst pair) | frames > 33 ms | press → 1st frame | long tasks during the transition |
|---|---|---|---|---|---|---|---|
| A | 1× | **58.0** | 53.8 | 33.3 ms | 6 | ≤ 83 ms | none |
| B | 1× | 54.3 | 50.7 | 33.4 ms | 6 | ≤ 133 ms | ≤ 90 ms |
| C | 1× | 56.8 | 52.8 | 33.3 ms | 7 | ≤ 99 ms | ≤ 59 ms |
| 1×, rates only | 1× | 59.3 / 57.7 / 57.9 | 57.0 / 54.6 / 54.6 | 33.3–33.4 ms | 0 / 6 / 7 | ≤ 66–116 ms | none / none / 65 ms |
| A | 4× | **51.3** | 35.2 | 83.4 ms | 13 | ≤ 265 ms | ≤ 212 ms |
| B | 4× | 52.2 | 48.0 | 50 ms | 22 | ≤ 279 ms | ≤ 179 ms |
| C | 4× | 56.1 | 52.3 | 33.4 ms | 10 | ≤ 198 ms | ≤ 129 ms |

Per pair, run A at 1× (FPS · p95 · first frame): text cream → wash 54.9 · 33.3 · 49 ms; table → table
60 · 16.7 · 49; engraving → table 60 · 16.7 · 49; chapter opener → text 60 · 16.8 · 48; table → chart
58.5 · 16.8 · 83; cards → Figure 1.1 60 · 16.8 · 49; key numbers → table 53.8 · 33.3 · 49; cover →
contents 57.2 · 16.8 · 63. Named view-transition elements: 0; animated elements 17–52; layers 29–93
(was 91–215); DOM 2,854 elements (bullets, notes and the full text added); heap 1.2–1.8 MB.

All 64 adjacent pairs at 1× (`--all`): average **57.4–59.3 FPS** over two runs, worst pairs 46–55 FPS
(`t1-6 → s1-3-4b`, `t1-3 → s1-3`, `s2-2-4 → s2-2-4b`), first frame ≤ 82 ms, no long task.

Reference points in the same environment: **Fade** preset (one cross-fade of the slide) 56.0 FPS,
**Classic** 57.1 FPS (1×) / 55.0 (4×). The eight effects cost no more than a plain cross-fade here: what
remains is the price of blending a full 1920×1080 textured slide in software.

### Against the targets (B3)

| Target | Before | After | |
|---|---|---|---|
| 1×: ≥ 58 FPS average | 8.0 (VT) / 33.1 (FLIP) | 54.3–59.3 (median ≈ 58) | met in about half of the runs; within 4 FPS otherwise |
| 1×: no frame > 33 ms | 55 / 78 frames | 0–7 frames over 8 transitions (each a single missed vsync of 33.4–50 ms, rarely more) | not fully met |
| 1×: p95 ≤ 20 ms | 466.7 / 66.7 ms | ≤ 16.8 ms on 5–7 of 8 pairs; 33.3 ms on the others | met on most pairs |
| 4×: ≥ 45 FPS, readable | 7.8 / 31.5 | 51.3–56.1 average (one pair 35 FPS in one run) | met on average |
| press → first frame ≤ 100 ms | 154–514 / 49–166 ms | 48–83 ms typical, ≤ 133 ms worst run | met at 1× except one run |
| no long task > 50 ms during a transition | up to 98 / 118 ms | none in the best runs at 1×; up to 90 ms in the worst; 50–212 ms at 4× | met at 1× in most runs |

These are software-rendering numbers (no GPU in the container). On a laptop with a GPU the compositor
cost that limits the last frames here largely disappears; the main-thread figures (first frame, long
tasks) are the ones that transfer, and they improved 3–6×.

Raw data (not committed): `test-results/perf/after*.json`, `after-all.json`, `after-classic.json`.
