/* Morph choreography: every duration, easing, stagger and effect switch in one place (MORPH.md).
   Durations are in ms at speed ×1 (the control bar multiplies them by 0.5–2). */
window.MORPH_CONFIG = {
  defaultPreset: "cinematic",

  // light = next slide in the same section · strong = new section / chapter (and openers)
  presets: {
    cinematic: { label: "Cinematic", light: 560, strong: 1100,
      effects: { ink: true, compass: true, letters: true, engrave: true, cards: true, numbers: true, bullets: true, parallax: true } },
    classic: { label: "Classic", light: 480, strong: 760,
      effects: { ink: false, compass: true, letters: false, engrave: false, cards: true, numbers: false, bullets: true, parallax: false } },
    fade: { label: "Fade", light: 320, strong: 420, effects: {} },
    off: { label: "Tắt", light: 0, strong: 0, effects: {} },
  },

  // the eight signature effects (each can be switched off in the control bar → "Hiệu ứng")
  effects: {
    ink: "Giọt mực (ink drop)",
    compass: "La bàn dẫn đường",
    letters: "Chữ bay / bảng lật",
    engrave: "Khắc hình (draw-in)",
    cards: "Thẻ sắp xếp lại",
    numbers: "Số nhảy và cột mọc",
    bullets: "Bullet quét mực",
    parallax: "Thị sai nhẹ",
  },

  easing: {
    bg: "cubic-bezier(.65, 0, .35, 1)",        // background: smooth in-out, the slowest layer
    move: "cubic-bezier(.45, 0, .15, 1)",      // matched elements
    spring: "cubic-bezier(.34, 1.36, .64, 1)", // cards, dots, compass: slight overshoot
    out: "cubic-bezier(.4, 0, .9, .6)",        // leaving content
    in: "cubic-bezier(.15, .6, .3, 1)",        // arriving content
  },

  // when each layer runs, as [start, end] fractions of the transition (phase offset)
  phase: {
    bg: [0, 1],          // background wipe / ink circle
    leave: [0, .42],     // old content fades out
    move: [.04, .92],    // matched elements glide
    arrive: [.34, 1],    // new content fades in
    after: [.5, 1],      // draw-in, bars, odometer: start once the morph has settled
  },

  stagger: { cards: 55, letters: 38, flap: 30, rows: 30, bullets: 70, digits: 45, bars: 60 },
  distance: { text: 36, art: 22, same: 12 },   // px of drift (parallax by layer)
  maxMorph: 12,                                // matched elements animated per pair (the rest fade)
  stepMs: 460,                                 // one bullet / card / row step
  degrade: { frameMs: 24, transitions: 3 },    // auto-switch Cinematic → Classic
  reducedMs: 200,                              // prefers-reduced-motion: cross-fade only
};
