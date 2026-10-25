/* Presentation mode: one 1920×1080 slide at a time, letterboxed to the window.
   Morph engine (default): compositor-only choreography written with the Web Animations API.
   Only transform, opacity and clip-path are animated; nothing is cloned; the old slide stays still
   underneath while its content fades, matched elements (same data-morph key, at most
   MORPH_CONFIG.maxMorph per pair) glide from their old box, the new background is revealed by a
   wipe or an ink drop, and the eight signature effects run in phase-offset layers.
   Also here: bullet steps, speaker notes (N), presenter window (S), presets, auto-degrade.
   Settings: js/morph.config.js · documentation: MORPH.md · measurements: PERF.md */
(() => {
  "use strict";
  const CFG = window.MORPH_CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const slides = $$("#deck > .slide");
  const N = slides.length;
  const Q = new URLSearchParams(location.search);
  const reduceMQ = matchMedia("(prefers-reduced-motion: reduce)");
  const store = {
    get(k, d) { try { const v = localStorage.getItem("mne-" + k); return v == null ? d : v; } catch { return d; } },
    set(k, v) { try { localStorage.setItem("mne-" + k, v); } catch { /* private mode: keep in memory */ } },
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  let on = false, cur = 0, bar = null, idle = 0, overview = false, notesOpen = false;
  let preset = store.get("preset", CFG.defaultPreset);
  if (!CFG.presets[preset]) preset = CFG.defaultPreset;
  let speed = clamp(+store.get("speed", 1) || 1, .5, 2);
  let stepMode = store.get("steps", "step") === "all" ? "all" : "step";
  let lite = store.get("lite", "") === "1";
  let fxOff = new Set((store.get("fx-off", "") || "").split(",").filter(Boolean));
  let running = null, slowRuns = 0;
  const shown = new Map();                                   // slide → number of steps shown
  const useVT = Q.has("vt") && typeof document.startViewTransition === "function";
  const isPresenter = Q.has("presenter");
  const noDegrade = Q.has("nodegrade");
  const reduced = () => reduceMQ.matches;
  const mode = () => (preset === "off" ? "off" : reduced() ? "reduced" : preset);
  const effectOn = (m, k) => !!CFG.presets[m]?.effects?.[k] && !fxOff.has(k);
  const tpl = s => s.dataset.tpl || "bullets";
  // section key: "1.2" from "1.2.1. …", else the chapter
  const sec = s => s.dataset.sec ?? (s.dataset.sec = ((($(".st", s) || {}).textContent || s.dataset.title || "").match(/^\s*(\d\.\d)/) || [])[1] || s.dataset.ch || "");
  const strongPair = (a, b) => sec(a) !== sec(b) || /^(opener|cover|thanks)$/.test(tpl(a) + "|" + tpl(b)) || tpl(a) === "opener" || tpl(b) === "opener" || tpl(a) === "cover" || tpl(b) === "thanks";

  /* ------------------------------------------------ layout */
  let pzv = 1;
  function layout() {
    const w = isPresenter ? innerWidth * .62 : innerWidth, h = isPresenter ? innerHeight * .7 : innerHeight;
    pzv = Math.min(w / 1920, h / 1080);
    root.style.setProperty("--pz", pzv.toFixed(5));
    const cols = innerWidth < 700 ? 2 : innerWidth < 1200 ? 3 : 4;
    root.style.setProperty("--oz", ((innerWidth - 48 - 18 * (cols - 1)) / cols / 1920).toFixed(5));
  }

  /* ------------------------------------------------ overlay on the stage: compass + ink */
  let over = null, compass = null, compassAt = null;
  function buildOver() {
    over = document.createElement("div");
    over.className = "stage-over";
    over.setAttribute("aria-hidden", "true");
    over.innerHTML = `<img class="compass-char" src="assets/img/compass.svg" alt="" width="200" height="200">`;
    document.body.appendChild(over);
    compass = $(".compass-char", over);
  }
  // compass place per template (stage px): kept in the margins, large on openers
  const COMPASS = {
    opener: { x: 70, y: 66, s: 210 }, cover: { x: 1840, y: 990, s: 0 }, thanks: { x: 1840, y: 990, s: 0 },
    default: { x: 30, y: 984, s: 66 },
  };
  function compassPose(s) {
    const p = COMPASS[tpl(s)] || COMPASS.default;
    // the needle points at the slide's main content
    const body = $(".body, .stage, h1", s);
    let a = 0;
    if (body && p.s) {
      const sr = s.getBoundingClientRect(), br = body.getBoundingClientRect();
      const tx = (br.left + br.width / 2 - sr.left) / pzv, ty = (br.top + br.height / 2 - sr.top) / pzv;
      a = Math.atan2(ty - (p.y + p.s / 2), tx - (p.x + p.s / 2)) * 180 / Math.PI + 90;
    }
    return { x: p.x, y: p.y, k: p.s / 200, a: Math.round(a), o: p.s ? 1 : 0 };
  }
  const poseT = p => `translate(${p.x + p.k * 100 - 100}px, ${p.y + p.k * 100 - 100}px) rotate(${p.a}deg) scale(${p.k || .001})`;
  function placeCompass(s) {
    if (!compass) return;
    const show = on && effectOn(mode(), "compass") && !overview;
    compass.hidden = !show;
    if (!show) return;
    compassAt = compassPose(s);
    compass.style.transform = poseT(compassAt);
    compass.style.opacity = compassAt.o;
  }

  /* ------------------------------------------------ steps (bullets, cards, table rows) */
  const stepsOf = s => $$(".bl > li[data-step], [data-steps] > *", s).filter(e => !e.closest(".notes"));
  const isHl = e => e.parentElement.dataset.steps === "hl";
  function setSteps(s, n, animate) {
    const st = stepsOf(s);
    n = clamp(n, 0, st.length);
    st.forEach((e, k) => {
      if (isHl(e)) { e.classList.toggle("st-on", k === n - 1); return; }
      const hide = k >= n;
      e.classList.toggle("st-hide", hide);
      if (!hide && animate && k === n - 1) {
        e.classList.remove("st-in"); void e.offsetWidth;
        e.classList.add("st-in");
        e.classList.toggle("st-ink", effectOn(mode(), "bullets"));
        e.addEventListener("animationend", () => e.classList.remove("st-in", "st-ink"), { once: true });
      }
    });
    shown.set(s, n);
    updateBar();
  }
  const clearSteps = s => stepsOf(s).forEach(e => e.classList.remove("st-hide", "st-on", "st-in", "st-ink"));
  function prepareSteps(s, dir) {
    const total = stepsOf(s).length;
    setSteps(s, stepMode === "all" || dir < 0 ? total : 0, false);
  }

  /* ------------------------------------------------ state */
  let touched = [];                                         // only these slides carry state classes
  function setCurrent(i) {
    const near = [i - 1, i + 1].filter(k => k >= 0 && k < N);
    for (const k of touched) if (k !== i && !near.includes(k)) slides[k].classList.remove("is-current", "is-near");
    near.forEach(k => { slides[k].classList.remove("is-current"); slides[k].classList.add("is-near"); });   // laid out in advance, invisible
    slides[i].classList.remove("is-near"); slides[i].classList.add("is-current");
    touched = [i, ...near];
    cur = i;
    preload(i);
    updateBar();
    updateNotes();
    if (on) history.replaceState(null, "", location.search + "#/" + (i + 1));
    send();
  }
  function preload(i) {
    for (const k of [i + 1, i - 1, i + 2]) {
      const s = slides[k];
      if (!s || s.dataset.decoded) continue;
      s.dataset.decoded = "1";
      $$("img", s).forEach(im => { im.loading = "eager"; im.decode?.().catch(() => {}); });
    }
  }
  const title = s => s.dataset.title || ($("h1,h2,h3,h4,h5", s) || {}).textContent || "";
  function updateBar() {
    if (!bar) return;
    const s = slides[cur], tot = stepsOf(s).length, n = shown.get(s) ?? tot;
    $(".pbar__title", bar).textContent = title(s);
    $(".pbar__count", bar).textContent = `${cur + 1} / ${N}`;
    $(".pbar__steps", bar).textContent = tot && stepMode === "step" ? `· ${n}/${tot}` : "";
    $(".pbar__fill", bar).style.transform = `scaleX(${(cur + 1) / N})`;
    $(".pbar__prev", bar).disabled = cur === 0 && !n;
    $(".pbar__next", bar).disabled = cur === N - 1 && n >= tot;
  }

  /* ------------------------------------------------ morph keys */
  const keysOf = s => {
    const m = new Map();
    $$("[data-morph]", s).forEach(e => {
      if (e.classList.contains("bg") || e.closest(".notes") || !e.getClientRects().length) return;   // backgrounds: wipe / ink, never morphed
      const k = e.dataset.morph;
      if (!m.has(k)) m.set(k, e);
    });
    return m;
  };
  // what to keep when there are more than maxMorph matches: chrome and headings first
  const PRIO = ["ctag", "title", "eyebrow", "emblem", "dot-1", "dot-2", "dot-3", "pno"];
  const prio = k => { const i = PRIO.indexOf(k); return i < 0 ? 20 : i; };
  const BOX = ".card, .tframe, .fpanel, .art, .dot, .emblem, img, .callout, .nums .n, .rec, .threshold, .box, .q, .toc > a, .ladder > li, .pane, .mini-ir > *, .inst, .big, .globe, .sh, .split-bar";
  const CARDKEY = /^(char|form|vc|rec|comp|adv|dis|mode|type|s|q|toc|card)-/;

  /* ------------------------------------------------ transitions */
  function go(i, o = {}) {
    i = clamp(i, 0, N - 1);
    if (running) running.finish();
    if (i === cur && !o.force) return;
    const from = slides[cur], to = slides[i], dir = i >= cur ? 1 : -1;
    const m = mode();
    prepareSteps(to, dir);
    if (!on || m === "off" || o.instant || overview) { setCurrent(i); placeCompass(to); return; }
    if (useVT) return viaVT(from, to, i);
    if (m === "fade" || m === "reduced") return viaFade(from, to, i, m);
    return morph(from, to, i, dir, m);
  }

  function viaFade(from, to, i, m) {
    const D = m === "reduced" ? CFG.reducedMs : Math.round(CFG.presets.fade.light * speed);
    from.classList.add("is-leaving");
    setCurrent(i);
    placeCompass(to);
    const a = to.animate([{ opacity: 0 }, { opacity: 1 }], { duration: D, easing: "ease", fill: "both" });
    return track({ anims: [a], done() { from.classList.remove("is-leaving"); } });
  }

  // one running transition; finish() lands it on its last frame (rapid presses: no queue)
  function track(t) {
    let over_ = false;
    const stopMon = monitor();
    const end = natural => {
      if (over_) return; over_ = true;
      const avg = stopMon();
      t.anims.forEach(a => a.cancel());
      t.done?.();
      if (running === rec) running = null;
      if (natural && t.cinematic && !noDegrade) watchFrames(avg);
    };
    const rec = { finish: () => end(false) };
    running = rec;
    Promise.all(t.anims.map(a => a.finished)).then(() => end(true), () => end(false));
    return rec;
  }
  function monitor() {
    const ts = []; let go_ = true;
    const f = t => { ts.push(t); if (go_) requestAnimationFrame(f); };
    requestAnimationFrame(f);
    return () => { go_ = false; const dt = ts.slice(2).map((x, k) => x - ts[k + 1]); return dt.length ? dt.reduce((a, b) => a + b, 0) / dt.length : 0; };
  }
  // auto-degrade: three slow Cinematic transitions in a row → Classic + chip "Chế độ nhẹ"
  function watchFrames(avg) {
    slowRuns = avg > CFG.degrade.frameMs ? slowRuns + 1 : 0;
    if (slowRuns >= CFG.degrade.transitions && preset === "cinematic") {
      slowRuns = 0; lite = true; store.set("lite", "1");
      preset = "classic"; store.set("preset", preset);
      showFx();
    }
  }

  function morph(from, to, i, dir, m) {
    const strong = strongPair(from, to);
    const D = Math.round((strong ? CFG.presets[m].strong : CFG.presets[m].light) * speed);
    const E = CFG.easing, PH = CFG.phase, SG = CFG.stagger;
    const fx = k => effectOn(m, k);
    const sameTpl = tpl(from) === tpl(to) && !strong;
    const z = pzv;
    const at = (ph, extra = {}) => ({ delay: Math.round(D * ph[0]) + (extra.delay || 0), duration: Math.max(60, Math.round(D * (ph[1] - ph[0]))), easing: extra.easing || E.move, fill: "both" });
    const anims = [], undo = [];
    const hide = e => { e.classList.add("morph-hide"); undo.push(() => e.classList.remove("morph-hide")); };

    /* ---------- read: both slides are laid out (the next one is pre-laid-out invisible) */
    to.classList.add("is-near");
    const A = keysOf(from), B = keysOf(to);
    const rects = new Map(), R = e => { let r = rects.get(e); if (!r) rects.set(e, r = e.getBoundingClientRect()); return r; };
    let pairs = [];
    B.forEach((b, k) => { const a = A.get(k); if (a) pairs.push({ k, a, b }); });
    pairs.sort((x, y) => prio(x.k) - prio(y.k));
    pairs = pairs.slice(0, CFG.maxMorph);
    pairs.forEach(p => { p.ra = R(p.a); p.rb = R(p.b); });
    const eq = (x, y) => Math.abs(x.left - y.left) < 1.5 && Math.abs(x.top - y.top) < 1.5 && Math.abs(x.width - y.width) < 1.5 && Math.abs(x.height - y.height) < 1.5;
    const sameC = (a, b) => a.tagName === b.tagName && a.textContent.trim() === b.textContent.trim() && a.className === b.className;
    const isWord = e => e.matches(".opener .word");
    for (const p of pairs) {
      const { a, b, ra, rb } = p;
      if (p.k === "ctag" && (isWord(a) || isWord(b)) && fx("letters")) p.kind = "letters";
      else if (p.k === "title" && fx("letters") && a.matches(".st") && b.matches(".st") && Math.abs(ra.left - rb.left) < 3 && Math.abs(ra.top - rb.top) < 3 && getComputedStyle(a).fontSize === getComputedStyle(b).fontSize && a.textContent !== b.textContent) p.kind = "flap";
      else if (eq(ra, rb)) p.kind = sameC(a, b) ? "stay" : "swap";
      else if (!b.matches(BOX) && Math.abs(ra.height - rb.height) / rb.height > .06) p.kind = "xfade";
      else if (!sameC(a, b) && b.matches(".tframe, .fpanel") ) p.kind = "frame";   // big panels: never two of them blended
      else p.kind = sameC(a, b) ? "fly" : "flyx";
    }
    const bgKind = s => (s.classList.contains("is-wash") ? "w" : "p") + (s.classList.contains("is-light") ? "l" : "");
    const bgSame = bgKind(from) === bgKind(to);
    const ink = strong && fx("ink");
    let inkFrom = null;
    if (ink) {                                          // the dot on the side we travel to
      const dots = $$(".dot", from).filter(d => d.getClientRects().length);
      dots.sort((x, y) => (R(y).left - R(x).left) * dir);
      if (dots[0]) inkFrom = R(dots[0]);
    }
    const sr = R(from);                                 // stage origin (both slides share it)
    // every other read happens here too, before the first write (no forced style / layout later)
    const base = e => { const t = getComputedStyle(e).transform; return t && t !== "none" ? " " + t : ""; };
    pairs.forEach(p => { if (p.kind !== "stay") { p.ab = base(p.a); p.bb = base(p.b); } });
    const blockedA = new Set(), blockedB = new Set();
    for (const p of pairs) { blockedA.add(p.a); blockedB.add(p.b); }
    const leave = free(from, blockedA), arrive = free(to, blockedB, true);
    const useCompass = fx("compass") && compass && !compass.hidden;
    const cp0 = useCompass && (compassAt || compassPose(from)), cp1 = useCompass && compassPose(to);

    /* ---------- write: show the new slide above the old one */
    from.classList.add("is-leaving");
    setCurrent(i);
    const toBg = $(":scope > .bg", to);

    // letters: split the opener word and the chapter tag into letters (measured below)
    const splits = [];
    const split = (e, cls) => {
      const html = e.innerHTML;
      const chars = [];
      const walk = n => {
        for (const c of [...n.childNodes]) {
          if (c.nodeType === 3) {
            const frag = document.createDocumentFragment();
            for (const w of c.textContent.split(/(\s+)/)) {
              if (!w) continue;
              if (/^\s+$/.test(w)) { frag.append(w); continue; }
              const word = document.createElement("span");
              word.className = "ch-w";
              for (const ch of w) { const sp = document.createElement("span"); sp.className = cls; sp.textContent = ch; word.append(sp); chars.push(sp); }
              frag.append(word);
            }
            c.replaceWith(frag);
          } else if (c.nodeType === 1 && !c.matches(".sep, .sr-only")) walk(c);
        }
      };
      walk(e);
      splits.push(() => { e.innerHTML = html; });
      return chars;
    };
    const letterJobs = [], flapJobs = [];
    for (const p of pairs) {
      if (p.kind === "letters") letterJobs.push({ p, big: isWord(p.a) ? p.a : p.b, small: isWord(p.a) ? p.b : p.a, out: isWord(p.a) });
      if (p.kind === "flap") flapJobs.push(p);
    }
    letterJobs.forEach(j => { j.bc = split(j.big, "ch-c"); j.sc = split(j.small, "ch-c"); });
    flapJobs.forEach(p => { p.chars = split(p.b, "ch-c"); });
    // odometer on the numbers that arrive
    const odo = [];
    if (fx("numbers")) for (const p of pairs) if (/^num-/.test(p.k)) { const v = $(".v", p.b) || p.b; odo.push(...digits(v, splits)); }

    /* ---------- read again: letters (one layout) */
    letterJobs.forEach(j => { j.br = j.bc.map(c => c.getBoundingClientRect()); j.sr2 = j.sc.map(c => c.getBoundingClientRect()); });

    /* ---------- background: wipe, ink drop, or nothing (same paper) */
    if (ink) {
      anims.push(toBg.animate([{ clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(0% at 50% 50%)", offset: .2 }, { clipPath: "circle(75% at 50% 50%)" }], { duration: D, easing: E.bg, fill: "both" }));
      const dot = document.createElement("span");
      dot.className = "ink-dot";
      over.appendChild(dot);
      undo.push(() => dot.remove());
      const x0 = inkFrom ? (inkFrom.left + inkFrom.width / 2 - sr.left) / z : 960 + 700 * dir, y0 = inkFrom ? (inkFrom.top + inkFrom.height / 2 - sr.top) / z : 540;
      anims.push(dot.animate([
        { transform: `translate(${x0}px, ${y0}px) scale(.7)`, opacity: .9 },
        { transform: "translate(960px, 540px) scale(1)", opacity: 1, offset: .22, easing: E.bg },
        { transform: "translate(960px, 540px) scale(22)", opacity: 0 },
      ], { duration: Math.round(D * .7), easing: E.move, fill: "both" }));
    } else if (!bgSame) {
      const start = dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)";
      anims.push(toBg.animate([{ clipPath: start }, { clipPath: "inset(0 0 0 0)" }], at(PH.bg, { easing: E.bg })));
    } else hide(toBg);

    /* ---------- matched elements */
    const cx = r => r.left + r.width / 2, cy = r => r.top + r.height / 2;
    let card = 0;
    for (const p of pairs) {
      const { a, b, ra, rb, k } = p;
      const dx = (cx(ra) - cx(rb)) / z, dy = (cy(ra) - cy(rb)) / z;
      const kk = clamp(Math.sqrt((ra.width * ra.height) / Math.max(1, rb.width * rb.height)), .2, 5);
      const isCard = CARDKEY.test(k) && fx("cards");
      const delay = isCard ? (card++) * SG.cards : 0;
      const ease = isCard || /^dot-/.test(k) ? E.spring : E.move;
      const bb = p.bb, ab = p.ab;
      if (p.kind === "stay") { hide(a); continue; }
      if (p.kind === "swap") {
        anims.push(a.animate([{ opacity: 1 }, { opacity: 0 }], at([0, .5], { easing: E.out })));
        anims.push(b.animate([{ opacity: 0 }, { opacity: 1 }], at([.3, .9], { easing: E.in })));
        continue;
      }
      if (p.kind === "letters" || p.kind === "flap") continue;
      if (p.kind === "frame") {
        // table / figure frame: the new frame takes the old one's box and settles (transform only);
        // its rows arrive one after another (the old frame is hidden at once: no big cross-fade)
        hide(a);
        // a near-same-size frame only translates (resampling a large textured layer every frame costs more)
        const fk = Math.abs(kk - 1) < .15 ? 1 : kk;
        if (fk !== 1 || Math.hypot(dx, dy) > 140) anims.push(b.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${fk})${bb}` }, { transform: bb.trim() || "none" }], at(PH.move, { easing: ease })));
        const parts = b.matches(".tframe") ? $$("caption, tr, .tsrc", b) : [...b.children];
        if (!Q.has("norows")) parts.forEach((r, n) => anims.push(r.animate([{ opacity: 0 }, { opacity: 1 }], at([.2, .62], { delay: n * SG.rows, easing: E.in }))));
        continue;
      }
      if (p.kind === "fly") {
        hide(a);
        anims.push(b.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${kk})${bb}` }, { transform: bb.trim() || "none" }], at(PH.move, { delay, easing: ease })));
        continue;
      }
      // flyx: both move, the old fades out, the new fades in · xfade: same without scaling (text)
      const s1 = p.kind === "flyx" ? kk : 1;
      anims.push(a.animate([{ transform: `translate(0px, 0px) scale(1)${ab}`, opacity: 1 }, { opacity: 0, offset: .55 }, { transform: `translate(${-dx}px, ${-dy}px) scale(${1 / s1})${ab}`, opacity: 0 }], at(PH.move, { delay, easing: ease })));
      anims.push(b.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${s1})${bb}`, opacity: 0 }, { opacity: 0, offset: .25 }, { transform: `none${bb}`, opacity: 1 }], at(PH.move, { delay, easing: ease })));
    }

    // giant letters: the opener word flies into the chapter tag (or back), one letter after another
    for (const j of letterJobs) {
      hide(j.small);                                  // the small tag shows again when the letters have landed
      j.bc.forEach((c, n) => {
        const big = j.br[n], small = j.sr2[Math.min(n, j.sr2.length - 1)];
        if (!big || !small) return;
        const k2 = small.height / Math.max(1, big.height);
        const moved = `translate(${(small.left - big.left) / z}px, ${(small.top - big.top) / z}px) scale(${k2})`;
        c.style.transformOrigin = "0 0";
        // always the big letters move (scaled down they stay crisp)
        const kf = j.out ? [{ transform: "none" }, { transform: moved }] : [{ transform: moved, opacity: 0 }, { transform: moved, opacity: 1, offset: .12 }, { transform: "none", opacity: 1 }];
        anims.push(c.animate(kf, at([.02, .86], { delay: n * SG.letters, easing: E.move })));
      });
    }
    // split-flap: characters that differ between two titles in the same place roll over
    for (const p of flapJobs) {
      hide(p.a);
      const oldT = p.a.textContent, newT = p.b.textContent;
      let same = 0; while (same < oldT.length && oldT[same] === newT[same]) same++;
      let n = 0, pos = 0;
      const changed = [];
      for (const c of p.chars) {
        while (pos < newT.length && newT[pos] !== c.textContent) pos++;
        if (pos++ >= same) changed.push(c);
      }
      // a long change rolls word by word (fewer layers), a short one letter by letter
      const units = changed.length <= 14 ? changed : [...new Set(changed.map(c => c.parentElement))];
      if (units !== changed) units.forEach(w => { w.style.display = "inline-block"; });
      for (const c of units) {
        anims.push(c.animate([{ transform: "perspective(500px) rotateX(-88deg)", opacity: 0 }, { transform: "perspective(500px) rotateX(12deg)", opacity: 1, offset: .7 }, { transform: "none", opacity: 1 }], at([.08, .55], { delay: (n++) * SG.flap, easing: E.move })));
      }
    }

    /* ---------- the rest: old content leaves, new content arrives (layers drift by parallax) */
    const dist = e => (sameTpl ? CFG.distance.same : fx("parallax") && e.matches(".art, .big, .globe, figure, .fpanel, .chart, img") ? CFG.distance.art : CFG.distance.text);
    // large blocks (a whole table, a figure) only fade: moving them costs a resample of a big layer per frame
    const big = e => { const r = e.getBoundingClientRect(); return r.width * r.height > 450000 * z * z; };
    leave.forEach(({ e }) => anims.push(e.animate(big(e) ? [{ opacity: 1 }, { opacity: 0 }] : [{ opacity: 1, transform: "none" }, { opacity: 0, transform: `translateX(${-dist(e) * dir}px)` }], at(PH.leave, { easing: E.out }))));
    let nArr = 0;
    arrive.forEach(({ e, stagger }) => {
      const engr = fx("engrave") && e.matches(".art, .stage, figure.art") && $("img", e);
      if (engr) {                                       // engraving: drawn in by a wipe once the morph has settled
        const from_ = dir > 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)";
        anims.push(e.animate([{ clipPath: from_, opacity: 1 }, { clipPath: "inset(0 0 0 0)", opacity: 1 }], at(PH.after, { easing: E.bg })));
        return;
      }
      const d = stagger ? (nArr++) * (stagger === "bullet" ? SG.bullets : SG.cards) : 0;
      const kf = big(e) ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: `translateX(${dist(e) * dir}px)` }, { opacity: 1, transform: "none" }];
      anims.push(e.animate(kf, at(PH.arrive, { delay: d, easing: stagger === "card" && fx("cards") ? E.spring : E.in })));
      if (stagger === "bullet" && fx("bullets")) { e.classList.add("st-sweep"); e.style.setProperty("--sw-d", Math.round(D * PH.arrive[0] + d) + "ms"); e.style.setProperty("--sw-t", Math.round(D * .5) + "ms"); undo.push(() => { e.classList.remove("st-sweep"); e.style.removeProperty("--sw-d"); e.style.removeProperty("--sw-t"); }); }
    });

    // bars grow from the axis once the labels have landed; 2025 last, with a spring
    if (fx("numbers")) $$(".chart .bar", to).forEach((b, n, all) => {
      b.classList.add("growing");
      b.style.setProperty("--bd", Math.round(D * PH.after[0] + n * SG.bars) + "ms");
      b.style.setProperty("--bt", Math.round(D * .55) + "ms");
      undo.push(() => { b.classList.remove("growing"); b.style.removeProperty("--bd"); b.style.removeProperty("--bt"); });
      if (n === all.length - 1) anims.push(b.animate([{ opacity: 1 }, { opacity: 1 }], { duration: Math.round(D * PH.after[0] + n * SG.bars + D * .55) }));
    });
    odo.forEach((col, n) => anims.push(col.strip.animate([{ transform: `translateY(0)` }, { transform: `translateY(${-col.to}em)` }], at([.3, .95], { delay: n * SG.digits, easing: E.move }))));

    // compass: travels, turns towards the new content, grows on openers
    if (useCompass) {
      const p0 = cp0, p1 = cp1;
      const mid = { ...p1, a: p1.a + 360 * (strong ? dir : 0) + 24 * dir };
      anims.push(compass.animate([{ transform: poseT(p0), opacity: p0.o }, { transform: poseT(mid), opacity: Math.max(p0.o, p1.o), offset: .7 }, { transform: poseT(p1), opacity: p1.o }], { duration: D, easing: E.spring, fill: "both" }));
      compassAt = p1;
      undo.push(() => { compass.style.transform = poseT(p1); compass.style.opacity = p1.o; });
    }

    return track({
      anims, cinematic: m === "cinematic",
      done() {
        undo.forEach(f => f());
        splits.forEach(f => f());
        letterJobs.forEach(j => [...j.bc].forEach(c => { c.style.transformOrigin = ""; }));
        from.classList.remove("is-leaving");
        if (slides[cur] === to) window.MNE?.drawLinks?.(to);
      },
    });
  }

  // elements to fade: the largest subtrees that hold no matched element; lists, card grids and
  // table bodies are opened so their items can arrive one after another
  const STAGGER = "ul.bl, [data-steps]:not([data-steps=hl]), .cards, .recs, .nums, .callouts, .toc, .ladder, .mini-ir";
  function free(s, blocked, arriving) {
    const out = [], B = [...blocked];
    const walk = el => {
      for (const c of el.children) {
        if (blocked.has(c) || c.matches(".bg, .notes, .st-hide") || !c.getClientRects().length) continue;
        if (B.some(m => c.contains(m))) { walk(c); continue; }
        if (arriving && c.matches(STAGGER) && c.children.length > 1 && c.children.length <= 12) {
          const kind = c.matches("ul.bl") ? "bullet" : "card";
          for (const g of c.children) if (!g.classList.contains("st-hide") && g.getClientRects().length) out.push({ e: g, stagger: kind });
          continue;
        }
        if (arriving && c.matches(".body, .stack, .cols, .split, .split-r, .split-w, .tx, .label") && c.children.length <= 8) { walk(c); continue; }
        out.push({ e: c });
      }
    };
    walk(s);
    return out;
  }

  // odometer: each digit becomes a short strip 0…d that rolls up (restored afterwards)
  function digits(v, splits) {
    const cols = [];
    const html = v.innerHTML;
    const walk = n => {
      for (const c of [...n.childNodes]) {
        if (c.nodeType === 3 && /\d/.test(c.textContent)) {
          const frag = document.createDocumentFragment();
          for (const ch of c.textContent) {
            if (!/\d/.test(ch)) { frag.append(ch); continue; }
            const d = +ch, box = document.createElement("span"), strip = document.createElement("span");
            box.className = "odo"; strip.className = "odo-s";
            strip.innerHTML = Array.from({ length: d + 1 }, (_, k) => `<span>${k}</span>`).join("");
            box.append(strip); frag.append(box);
            cols.push({ strip, to: d });
          }
          c.replaceWith(frag);
        } else if (c.nodeType === 1 && !c.matches("small")) walk(c);
      }
    };
    walk(v);
    splits.push(() => { v.innerHTML = html; });
    return cols;
  }

  /* ------------------------------------------------ View Transitions (kept for comparison: ?vt) */
  const vtName = k => "m-" + k.replace(/[^a-zA-Z0-9_-]/g, "_");
  function viaVT(from, to, i) {
    const a = keysOf(from);
    root.style.setProperty("--morph-ms", Math.round(CFG.presets.cinematic.light * 1.6 * speed) + "ms");
    a.forEach((e, k) => { e.style.viewTransitionName = vtName(k); });
    let b = null;
    const vt = document.startViewTransition(() => {
      a.forEach(e => { e.style.viewTransitionName = ""; });
      setCurrent(i);
      b = keysOf(to); b.forEach((e, k) => { e.style.viewTransitionName = vtName(k); });
    });
    const clear = () => { a.forEach(e => { e.style.viewTransitionName = ""; }); b?.forEach(e => { e.style.viewTransitionName = ""; }); };
    const rec = { finish() { vt.skipTransition(); clear(); if (running === rec) running = null; } };
    running = rec;
    vt.finished.finally(() => { clear(); if (running === rec) running = null; });
    vt.ready.catch(() => {});
    return rec;
  }

  /* ------------------------------------------------ navigation with steps */
  function next() {
    if (running) running.finish();
    const s = slides[cur], tot = stepsOf(s).length, n = shown.get(s) ?? tot;
    if (stepMode === "step" && n < tot) { setSteps(s, n + 1, true); send(); return; }
    go(cur + 1);
  }
  function prev() {
    if (running) running.finish();
    const s = slides[cur], n = shown.get(s) ?? 0;
    if (stepMode === "step" && n > 0) { setSteps(s, n - 1, false); send(); return; }
    go(cur - 1);
  }

  /* ------------------------------------------------ speaker notes (N) */
  let notes = null;
  function buildNotes() {
    notes = document.createElement("aside");
    notes.className = "notes-panel";
    notes.setAttribute("aria-label", "Speaker notes: the paper's full text for this slide");
    notes.innerHTML = `<header><b>Ghi chú</b><span class="np-title"></span><button type="button" class="np-close" aria-label="Close notes (N)">×</button></header><div class="np-body" tabindex="0"></div>`;
    document.body.appendChild(notes);
    $(".np-close", notes).onclick = () => toggleNotes(false);
    notes.addEventListener("click", e => e.stopPropagation());
  }
  function notesHTML(s) {
    const n = $(".notes", s);
    let h = n ? n.innerHTML : "";
    const cells = $$(".cf", s).map(c => { const row = c.closest("tr"); const th = row && $("th", row); return `<li><b>${th ? th.textContent : ""}</b> — ${c.innerHTML}</li>`; });
    if (cells.length) h += `<p class="np-k">Full table cells (shortened on the slide)</p><ul>${cells.join("")}</ul>`;
    return h || `<p class="np-empty">No notes: everything on this slide is shown as in the paper.</p>`;
  }
  function updateNotes() {
    if (!notes || !notesOpen) return;
    const s = slides[cur];
    $(".np-title", notes).textContent = `${cur + 1} / ${N} · ${title(s)}`;
    $(".np-body", notes).innerHTML = notesHTML(s);
    $(".np-body", notes).scrollTop = 0;
  }
  function toggleNotes(force) {
    notesOpen = force ?? !notesOpen;
    if (!notes) buildNotes();
    root.classList.toggle("notes-open", notesOpen);
    updateNotes();
    bar && $(".pbar__notes", bar).setAttribute("aria-pressed", String(notesOpen));
  }

  /* ------------------------------------------------ presenter window (S) + sync between windows */
  const chan = "BroadcastChannel" in window ? new BroadcastChannel("mne-deck") : null;
  const me = Math.random().toString(36).slice(2);
  let applying = false;
  function send() { if (chan && on && !applying) chan.postMessage({ from: me, i: cur, n: shown.get(slides[cur]) ?? 0 }); }
  chan && chan.addEventListener("message", ({ data }) => {
    if (!on || !data || data.from === me) return;
    applying = true;
    if (data.i !== cur) go(data.i, { instant: isPresenter });
    setSteps(slides[cur], data.n, false);
    applying = false;
    if (isPresenter) updatePresenter();
  });
  function openPresenter() {
    window.open(location.pathname + "?presenter#/" + (cur + 1), "mne-presenter", "width=1280,height=800");
  }
  let clock0 = Date.now(), pres = null;
  function buildPresenter() {
    root.classList.add("presenter");
    pres = document.createElement("div");
    pres.className = "pres";
    pres.innerHTML = `<div class="pres__meta"><span class="pres__clock">00:00</span><button type="button" class="pres__reset">Đặt lại giờ</button><span class="pres__pos"></span></div>
      <div class="pres__next"><span>Tiếp theo</span><b></b></div>`;
    document.body.appendChild(pres);
    $(".pres__reset", pres).onclick = () => { clock0 = Date.now(); };
    setInterval(() => { const t = Math.floor((Date.now() - clock0) / 1000); $(".pres__clock", pres).textContent = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`; }, 1000);
    toggleNotes(true);
  }
  function updatePresenter() {
    if (!pres) return;
    const s = slides[cur], tot = stepsOf(s).length;
    $(".pres__pos", pres).textContent = `Slide ${cur + 1} / ${N}${tot ? ` · bước ${shown.get(s) ?? 0}/${tot}` : ""}`;
    $(".pres__next b", pres).textContent = slides[cur + 1] ? title(slides[cur + 1]) : "—";
  }

  /* ------------------------------------------------ control bar */
  function buildBar() {
    bar = document.createElement("div");
    bar.className = "pbar";
    bar.setAttribute("role", "toolbar");
    bar.setAttribute("aria-label", "Presentation controls");
    const presets = Object.entries(CFG.presets).map(([k, p]) => `<button type="button" data-preset="${k}">${p.label}</button>`).join("");
    const fxList = Object.entries(CFG.effects).map(([k, l]) => `<label><input type="checkbox" data-fx="${k}"> ${l}</label>`).join("");
    bar.innerHTML = `
      <span class="pbar__fill" aria-hidden="true"></span>
      <p class="pbar__title" aria-live="polite"></p>
      <div class="pbar__nav">
        <button type="button" class="pbar__prev" aria-label="Previous (←)"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
        <span class="pbar__count"></span><span class="pbar__steps"></span>
        <button type="button" class="pbar__next" aria-label="Next (→ or Space)"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
      </div>
      <div class="pbar__tools">
        <button type="button" class="pbar__lite" hidden title="Cinematic was too slow on this device: switched to Classic. Click to try Cinematic again.">Chế độ nhẹ</button>
        <div class="pbar__seg pbar__stepmode" role="group" aria-label="Bullets"><button type="button" data-steps="step">Từng bước</button><button type="button" data-steps="all">Hiện hết</button></div>
        <div class="pbar__seg pbar__fx" role="group" aria-label="Transition preset">${presets}</div>
        <details class="pbar__more"><summary aria-label="Effects and speed">Hiệu ứng</summary>
          <div class="pbar__menu">${fxList}
            <label class="pbar__dur">Tốc độ <input type="range" min="0.5" max="2" step="0.1" aria-label="Transition duration multiplier"><output></output></label>
          </div></details>
        <button type="button" class="pbar__notes" aria-pressed="false" aria-label="Speaker notes (N)" title="Ghi chú (N)"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 4h9l3 3v13H6zM9 10h6M9 14h6M9 18h4"/></svg></button>
        <button type="button" class="pbar__pres" aria-label="Presenter window (S)" title="Presenter view (S)"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 5h18v11H3zM8 20h8M12 16v4"/></svg></button>
        <button type="button" class="pbar__grid" aria-label="Overview (G)"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></svg></button>
        <button type="button" class="pbar__fs" aria-label="Full screen (F)"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>
        <button type="button" class="pbar__exit" aria-label="Exit presentation (Esc)"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </div>`;
    document.body.appendChild(bar);
    $(".pbar__prev", bar).onclick = prev;
    $(".pbar__next", bar).onclick = next;
    $(".pbar__exit", bar).onclick = stop;
    $(".pbar__fs", bar).onclick = fullscreen;
    $(".pbar__grid", bar).onclick = () => toggleOverview();
    $(".pbar__notes", bar).onclick = () => toggleNotes();
    $(".pbar__pres", bar).onclick = openPresenter;
    $(".pbar__lite", bar).onclick = () => { lite = false; store.set("lite", ""); preset = "cinematic"; store.set("preset", preset); showFx(); };
    $$("[data-preset]", bar).forEach(b => b.onclick = () => { preset = b.dataset.preset; store.set("preset", preset); if (preset === "cinematic") { lite = false; store.set("lite", ""); } showFx(); placeCompass(slides[cur]); });
    $$("[data-steps]", bar).forEach(b => b.onclick = () => { stepMode = b.dataset.steps; store.set("steps", stepMode); if (stepMode === "all") setSteps(slides[cur], 99, false); showFx(); });
    $$("[data-fx]", bar).forEach(c => c.onchange = () => { c.checked ? fxOff.delete(c.dataset.fx) : fxOff.add(c.dataset.fx); store.set("fx-off", [...fxOff].join(",")); placeCompass(slides[cur]); });
    const range = $(".pbar__dur input", bar);
    range.oninput = () => { speed = +range.value; store.set("speed", speed); showFx(); };
    bar.addEventListener("click", e => e.stopPropagation());
    showFx();
  }
  function showFx() {
    if (!bar) return;
    $$("[data-preset]", bar).forEach(b => b.setAttribute("aria-pressed", String(b.dataset.preset === preset)));
    $$("[data-steps]", bar).forEach(b => b.setAttribute("aria-pressed", String(b.dataset.steps === stepMode)));
    $$("[data-fx]", bar).forEach(c => { c.checked = !fxOff.has(c.dataset.fx); c.disabled = !CFG.presets[preset]?.effects?.[c.dataset.fx]; });
    const range = $(".pbar__dur input", bar);
    range.value = speed.toFixed(1); $(".pbar__dur output", bar).textContent = "×" + speed.toFixed(1);
    $(".pbar__lite", bar).hidden = !lite;
    updateBar();
  }

  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else root.requestFullscreen?.().catch(() => {});
  }
  function wake() {
    root.classList.remove("present-idle");
    clearTimeout(idle);
    idle = setTimeout(() => { if (!overview && !$(".pbar__more[open]")) root.classList.add("present-idle"); }, 3000);
  }

  /* ------------------------------------------------ overview (G) */
  function toggleOverview(force) {
    const want = force ?? !overview;
    if (want === overview) return;
    if (running) running.finish();
    overview = want;
    root.classList.toggle("overview", want);
    placeCompass(slides[cur]);
    if (want) requestAnimationFrame(() => slides[cur].scrollIntoView({ block: "center" }));
  }
  function pickFromOverview(i) {
    overview = false; root.classList.remove("overview");
    prepareSteps(slides[i], 1);
    setCurrent(i);
    placeCompass(slides[i]);
  }

  /* ------------------------------------------------ input */
  function onKey(e) {
    if (!on || e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.key, inCtl = e.target.closest?.("button, a, input, summary");
    if (overview) {
      if (k === "Escape" || k === "g" || k === "G") { e.preventDefault(); toggleOverview(false); }
      else if (k === "ArrowRight" || k === "ArrowDown") { e.preventDefault(); setCurrent(Math.min(N - 1, cur + 1)); slides[cur].scrollIntoView({ block: "nearest" }); }
      else if (k === "ArrowLeft" || k === "ArrowUp") { e.preventDefault(); setCurrent(Math.max(0, cur - 1)); slides[cur].scrollIntoView({ block: "nearest" }); }
      else if (k === "Enter") { e.preventDefault(); pickFromOverview(cur); }
      return;
    }
    if (["ArrowRight", "ArrowDown", "PageDown"].includes(k) || (k === " " && !e.shiftKey && !inCtl) || (k === "Enter" && !inCtl)) { e.preventDefault(); next(); }
    else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(k) || (k === " " && e.shiftKey)) { e.preventDefault(); prev(); }
    else if (k === "Home") { e.preventDefault(); go(0); }
    else if (k === "End") { e.preventDefault(); go(N - 1); }
    else if (k === "Escape" && notesOpen && !isPresenter) toggleNotes(false);
    else if (k === "Escape" && !document.fullscreenElement && !isPresenter) stop();
    else if (k === "f" || k === "F") fullscreen();
    else if (k === "g" || k === "G") toggleOverview(true);
    else if (k === "n" || k === "N") toggleNotes();
    else if (k === "s" || k === "S") { if (!isPresenter) openPresenter(); }
    wake();
  }
  function onClick(e) {
    if (!on) return;
    const s = e.target.closest?.("#deck > .slide");
    if (overview) { if (s) { e.preventDefault(); pickFromOverview(slides.indexOf(s)); } return; }
    const a = e.target.closest?.("a[href^='#']");
    if (a) {
      const t = document.getElementById(a.hash.slice(1));
      const ts = t && (t.matches("#deck > .slide") ? t : t.closest("#deck > .slide"));
      if (ts) { e.preventDefault(); go(slides.indexOf(ts)); }
      return;
    }
    if (e.target.closest?.("button, a, input, label, summary, details, .pbar, .notes-panel, .pres")) return;
    if (s) next();
  }
  let wheelAt = 0, tx = 0, ty = 0;
  function onWheel(e) {
    if (!on || overview || e.target.closest?.(".notes-panel, .pbar")) return;
    e.preventDefault();
    const now = Date.now();
    if (Math.abs(e.deltaY) < 12 || now - wheelAt < 600) return;
    wheelAt = now;
    e.deltaY > 0 ? next() : prev();
  }
  const onTouchStart = e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; };
  function onTouchEnd(e) {
    if (overview || e.target.closest?.(".notes-panel, .pbar")) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 45) return;
    (Math.abs(dx) > Math.abs(dy) ? dx < 0 : dy < 0) ? next() : prev();
  }
  const onResize = () => { if (on) { layout(); placeCompass(slides[cur]); } };
  const onHash = () => {
    const m = location.hash.match(/^#\/(\d+)$/);
    if (on && m && +m[1] - 1 !== cur) go(+m[1] - 1);
  };

  /* ------------------------------------------------ start / stop */
  function start(i) {
    if (on) return;
    on = true;
    if (i == null) {
      const line = scrollY + innerHeight * .4;
      i = 0;
      slides.forEach((s, k) => { if (s.getBoundingClientRect().top + scrollY <= line) i = k; });
    }
    root.classList.remove("reading");
    root.classList.add("presenting");
    window.MNE?.reflow?.();
    window.MNE?.pauseScroll?.(true);                     // no scroll-view observers while presenting
    slides.forEach(s => s.classList.add("is-in"));
    if (!bar) buildBar();
    if (!over) buildOver();
    if (isPresenter && !pres) buildPresenter();
    layout();
    prepareSteps(slides[i], 1);
    setCurrent(i);
    window.MNE?.drawLinks?.();
    placeCompass(slides[i]);
    addEventListener("keydown", onKey);
    addEventListener("click", onClick, true);
    addEventListener("wheel", onWheel, { passive: false });
    addEventListener("touchstart", onTouchStart, { passive: true });
    addEventListener("touchend", onTouchEnd, { passive: true });
    addEventListener("resize", onResize);
    addEventListener("mousemove", wake);
    addEventListener("hashchange", onHash);
    wake();
    updatePresenter();
    $(".pbar__next", bar).focus({ preventScroll: true });
  }
  function stop() {
    if (!on) return;
    if (running) running.finish();
    on = false; overview = false;
    const s = slides[cur];
    toggleNotes(false);
    root.classList.remove("presenting", "present-idle", "overview");
    slides.forEach(x => { x.classList.remove("is-current", "is-leaving", "is-near"); clearSteps(x); });
    shown.clear();
    placeCompass(s);
    removeEventListener("keydown", onKey);
    removeEventListener("click", onClick, true);
    removeEventListener("wheel", onWheel);
    removeEventListener("touchstart", onTouchStart);
    removeEventListener("touchend", onTouchEnd);
    removeEventListener("resize", onResize);
    removeEventListener("mousemove", wake);
    removeEventListener("hashchange", onHash);
    if (document.fullscreenElement) document.exitFullscreen();
    history.replaceState(null, "", location.pathname + "#" + (s.id || ""));
    window.MNE?.pauseScroll?.(false);
    window.MNE?.reflow?.();
    window.MNE?.fit?.();
    requestAnimationFrame(() => { window.scrollTo({ top: s.getBoundingClientRect().top + scrollY - 70, behavior: "instant" }); window.MNE?.drawLinks?.(); });
    $(".nav__present")?.focus({ preventScroll: true });
  }

  /* ------------------------------------------------ entry points */
  $$(".nav__present").forEach(b => b.addEventListener("click", () => start()));
  addEventListener("keydown", e => {
    if (!on && (e.key === "p" || e.key === "P") && !e.ctrlKey && !e.metaKey && !e.altKey && !e.target.closest("input, textarea, [contenteditable]")) start();
  });
  const startAt = () => {
    const m = location.hash.match(/^#\/(\d+)$/);
    if (m) start(Math.min(N, Math.max(1, +m[1])) - 1);
    else if (Q.has("present") || isPresenter) start(0);
  };
  // transitions wait for the web fonts (text measured with fallback fonts would jump)
  const ready = () => (document.fonts ? document.fonts.ready : Promise.resolve()).then(startAt);
  if (document.readyState === "complete") ready(); else addEventListener("load", ready);

  window.MNEPresent = {
    start, stop, next, prev, go, toggleOverview, toggleNotes,
    setPreset(p) { if (CFG.presets[p]) { preset = p; store.set("preset", p); showFx(); } },
    setSteps(m) { stepMode = m === "all" ? "all" : "step"; store.set("steps", stepMode); showFx(); },
    get state() {
      const s = slides[cur];
      return { on, cur, N, preset, mode: mode(), speed, steps: stepMode, shown: shown.get(s) ?? 0, total: stepsOf(s).length, overview, notes: notesOpen, lite,
        engine: useVT ? "view-transitions" : "waapi", running: !!running };
    },
  };
})();
