/* Presentation mode with PowerPoint-style Morph transitions.
   One <section class="slide"> on screen at a time, a 1920×1080 stage letterboxed to the window.
   Elements carrying the same data-morph key on two consecutive slides glide, scale and recolour
   from one to the other; elements present on only one side fade (and drift 24px with the direction).
   Engine: View Transitions API; FLIP fallback (Web Animations) for browsers without it.
   Keys, durations and how to add new ones: MORPH.md. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const slides = $$("#deck > .slide");
  const N = slides.length;
  const reduceMQ = matchMedia("(prefers-reduced-motion: reduce)");
  const store = {
    get(k, d) { try { const v = localStorage.getItem("mne-" + k); return v == null ? d : v; } catch { return d; } },
    set(k, v) { try { localStorage.setItem("mne-" + k, v); } catch { /* private mode: keep in memory */ } },
  };

  let on = false, cur = 0, bar = null, idle = 0, overview = false;
  let fx = store.get("fx", "morph");                 // morph | fade | off
  let ms = Math.min(2000, Math.max(500, +store.get("ms", 900) || 900));
  let running = null;                                // { vt } or { finish() } of the transition in flight
  let target = null;                                 // slide being transitioned to (cur updates only in the DOM-update step)
  const supportsVT = typeof document.startViewTransition === "function";
  const forceFlip = /[?&]flip\b/.test(location.search);

  /* ------------------------------------------------ layout */
  function layout() {
    const z = Math.min(innerWidth / 1920, innerHeight / 1080);
    root.style.setProperty("--pz", z.toFixed(5));
    const cols = innerWidth < 700 ? 2 : innerWidth < 1200 ? 3 : 4;
    root.style.setProperty("--oz", ((innerWidth - 48 - 18 * (cols - 1)) / cols / 1920).toFixed(5));
  }
  const effMs = () => (reduceMQ.matches && fx === "morph" ? 200 : fx === "off" ? 0 : ms);
  const effFx = () => (fx === "off" ? "off" : reduceMQ.matches ? "fade" : fx);
  function applyTiming() {
    root.style.setProperty("--morph-ms", effMs() + "ms");
    root.classList.toggle("vt-fade", effFx() === "fade");
  }

  /* ------------------------------------------------ state */
  function setCurrent(i) {
    slides.forEach((s, k) => s.classList.toggle("is-current", k === i));
    const s = slides[i];
    s.classList.add("is-in");
    cur = i;
    updateBar();
    history.replaceState(null, "", "#/" + (i + 1));
  }
  const title = s => s.dataset.title || (s.querySelector("h1,h2,h3,h4,h5") || {}).textContent || "";
  function updateBar() {
    if (!bar) return;
    $(".pbar__title", bar).textContent = title(slides[cur]);
    $(".pbar__count", bar).textContent = `${cur + 1} / ${N}`;
    $(".pbar__fill", bar).style.transform = `scaleX(${(cur + 1) / N})`;
    $(".pbar__prev", bar).disabled = cur === 0;
    $(".pbar__next", bar).disabled = cur === N - 1;
  }

  /* ------------------------------------------------ morph keys */
  const keysOf = s => {
    const m = new Map();
    $$("[data-morph]", s).forEach(e => {
      if (!e.getClientRects().length) return;                  // hidden in this layout
      const k = e.dataset.morph;
      if (!m.has(k)) m.set(k, e);
    });
    return m;
  };
  const vtName = k => "m-" + k.replace(/[^a-zA-Z0-9_-]/g, "_");
  const setNames = (map, onlyKeys) => map.forEach((e, k) => { if (!onlyKeys || onlyKeys.has(k)) e.style.viewTransitionName = vtName(k); });
  const clearNames = map => map.forEach(e => { e.style.viewTransitionName = ""; });

  /* ------------------------------------------------ transitions */
  function go(i, opts = {}) {
    i = Math.max(0, Math.min(N - 1, i));
    if (running) cancelRunning();
    if (target != null && target !== cur) setCurrent(target);   // a skipped transition lands on its slide first
    target = null;
    if (i === cur && !opts.force) return;
    const from = slides[cur], to = slides[i], dir = i >= cur ? 1 : -1;
    root.style.setProperty("--vt-dir", dir);
    applyTiming();
    const mode = effFx();
    if (mode === "off" || !on) { setCurrent(i); return; }
    if (supportsVT && !forceFlip) return viaVT(from, to, i, mode);
    return viaFlip(from, to, i, mode, dir);
  }

  // a transition replaced by a newer one is marked stale: its late clean-up must not touch
  // names that the newer transition has already put on the same elements
  function cancelRunning() {
    const r = running;
    running = null;
    if (!r) return;
    if (r.vt) { r.stale = true; clearNames(r.a); if (r.b) clearNames(r.b); r.vt.skipTransition(); }
    else r.finish();
  }

  function viaVT(from, to, i, mode) {
    const a = keysOf(from);
    if (mode === "morph") setNames(a);
    target = i;
    const rec = { a, b: null, stale: false };
    const vt = document.startViewTransition(() => {
      clearNames(a);
      if (cur !== i) setCurrent(i);
      if (target === i) target = null;
      if (mode === "morph" && !rec.stale) { rec.b = keysOf(to); setNames(rec.b); }
    });
    rec.vt = vt;
    running = rec;
    vt.finished.finally(() => {
      if (rec.stale) return;
      if (rec.b) clearNames(rec.b);
      clearNames(a);
      if (running === rec) running = null;
    });
    vt.ready.catch(() => {});                          // a skipped transition rejects ready
    return vt;
  }

  // Fallback: clones of matched elements fly from the old box to the new one (cross-fading),
  // while the rest of the old slide fades out and the new one fades in.
  function viaFlip(from, to, i, mode, dir) {
    const D = effMs();
    const ease = "cubic-bezier(.65,0,.35,1)";
    const a = mode === "morph" ? keysOf(from) : new Map();
    const z = parseFloat(getComputedStyle(root).getPropertyValue("--pz")) || 1;
    const rectA = new Map([...a].map(([k, e]) => [k, e.getBoundingClientRect()]));
    from.classList.add("is-leaving");
    setCurrent(i);
    const b = mode === "morph" ? keysOf(to) : new Map();
    const layer = document.createElement("div");
    layer.className = "morph-layer";
    document.body.appendChild(layer);
    const anims = [], hidden = [];
    const clone = (el, r) => {
      const c = el.cloneNode(true);
      c.removeAttribute("id"); c.querySelectorAll("[id]").forEach(x => x.removeAttribute("id"));
      const cs = getComputedStyle(el);
      for (const p of ["color", "backgroundColor", "backgroundImage", "border", "borderRadius", "font", "lineHeight", "letterSpacing", "textAlign", "padding", "display", "gridTemplateColumns", "gap", "alignItems", "justifyContent", "boxShadow"]) c.style[p] = cs[p];
      c.style.width = r.width / z + "px"; c.style.height = r.height / z + "px";
      c.style.viewTransitionName = "";
      layer.appendChild(c);
      return c;
    };
    const T = (r, w, h) => `translate(${r.left}px, ${r.top}px) scale(${(r.width / w) || z}, ${(r.height / h) || z})`;
    b.forEach((nb, k) => {
      const oa = a.get(k); if (!oa) return;
      const ra = rectA.get(k), rb = nb.getBoundingClientRect();
      const ca = clone(oa, ra), cb = clone(nb, rb);
      const wa = ra.width / z, ha = ra.height / z, wb = rb.width / z, hb = rb.height / z;
      anims.push(ca.animate([{ transform: T(ra, wa, ha), opacity: 1 }, { transform: T(rb, wa, ha), opacity: 0 }], { duration: D, easing: ease, fill: "both" }));
      anims.push(cb.animate([{ transform: T(ra, wb, hb), opacity: 0 }, { transform: T(rb, wb, hb), opacity: 1 }], { duration: D, easing: ease, fill: "both" }));
      oa.classList.add("morph-hide"); nb.classList.add("morph-hide"); hidden.push(oa, nb);
    });
    anims.push(from.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: `translateX(${-24 * dir}px)` }], { duration: D, easing: ease, fill: "both" }));
    anims.push(to.animate([{ opacity: 0, transform: `translateX(${24 * dir}px)` }, { opacity: 1, transform: "none" }], { duration: D, easing: ease, fill: "both" }));
    let done = false;
    const finish = () => {
      if (done) return; done = true;
      anims.forEach(x => x.cancel());
      hidden.forEach(e => e.classList.remove("morph-hide"));
      from.classList.remove("is-leaving");
      layer.remove();
      if (running && running.finish === finish) running = null;
    };
    running = { finish };
    Promise.all(anims.map(x => x.finished)).then(finish, finish);
    return { finish };
  }

  const next = () => go((target ?? cur) + 1);
  const prev = () => go((target ?? cur) - 1);

  /* ------------------------------------------------ control bar */
  function buildBar() {
    bar = document.createElement("div");
    bar.className = "pbar";
    bar.setAttribute("role", "toolbar");
    bar.setAttribute("aria-label", "Presentation controls");
    bar.innerHTML = `
      <span class="pbar__fill" aria-hidden="true"></span>
      <p class="pbar__title" aria-live="polite"></p>
      <div class="pbar__nav">
        <button type="button" class="pbar__prev" aria-label="Previous slide (←)"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
        <span class="pbar__count"></span>
        <button type="button" class="pbar__next" aria-label="Next slide (→ or Space)"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
      </div>
      <div class="pbar__tools">
        <div class="pbar__fx" role="group" aria-label="Transition effect">
          <button type="button" data-fx="morph">Morph</button><button type="button" data-fx="fade">Fade</button><button type="button" data-fx="off">Off</button>
        </div>
        <label class="pbar__dur">Duration <input type="range" min="0.5" max="2" step="0.1" aria-label="Transition duration in seconds"><output></output></label>
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
    const range = $(".pbar__dur input", bar), out = $(".pbar__dur output", bar);
    const showFx = () => {
      $$(".pbar__fx button", bar).forEach(b => b.setAttribute("aria-pressed", String(b.dataset.fx === fx)));
      range.value = (ms / 1000).toFixed(1); out.textContent = range.value + " s";
      range.disabled = fx === "off";
    };
    $$(".pbar__fx button", bar).forEach(b => b.onclick = () => { fx = b.dataset.fx; store.set("fx", fx); applyTiming(); showFx(); });
    range.oninput = () => { ms = Math.round(+range.value * 1000); store.set("ms", ms); applyTiming(); showFx(); };
    bar.addEventListener("click", e => e.stopPropagation());
    showFx();
  }

  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else root.requestFullscreen?.().catch(() => {});
  }
  function wake() {
    root.classList.remove("present-idle");
    clearTimeout(idle);
    idle = setTimeout(() => { if (!overview) root.classList.add("present-idle"); }, 3000);
  }

  /* ------------------------------------------------ overview (G) */
  function toggleOverview(force) {
    const want = force ?? !overview;
    if (want === overview) return;
    const s = slides[cur];
    const swap = () => {
      overview = want;
      root.classList.toggle("overview", want);
      if (want) requestAnimationFrame(() => s.scrollIntoView({ block: "center" }));
    };
    if (supportsVT && effFx() !== "off") {
      s.style.viewTransitionName = "m-slide";
      const vt = document.startViewTransition(swap);
      vt.finished.finally(() => { s.style.viewTransitionName = ""; });
    } else swap();
  }
  function pickFromOverview(i) {
    const s = slides[i];
    const swap = () => { overview = false; root.classList.remove("overview"); setCurrent(i); };
    if (supportsVT && effFx() !== "off") {
      s.style.viewTransitionName = "m-slide";
      const vt = document.startViewTransition(swap);
      vt.finished.finally(() => { s.style.viewTransitionName = ""; });
    } else swap();
  }

  /* ------------------------------------------------ input */
  function onKey(e) {
    if (!on || e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.key, inCtl = e.target.closest?.("button, a, input, summary");
    if (overview) {
      if (k === "Escape" || k === "g" || k === "G") { e.preventDefault(); toggleOverview(false); }
      else if (k === "ArrowRight" || k === "ArrowDown") { e.preventDefault(); cur = Math.min(N - 1, cur + 1); setCurrent(cur); slides[cur].scrollIntoView({ block: "nearest" }); }
      else if (k === "ArrowLeft" || k === "ArrowUp") { e.preventDefault(); cur = Math.max(0, cur - 1); setCurrent(cur); slides[cur].scrollIntoView({ block: "nearest" }); }
      else if (k === "Enter") { e.preventDefault(); pickFromOverview(cur); }
      return;
    }
    if (["ArrowRight", "ArrowDown", "PageDown"].includes(k) || (k === " " && !e.shiftKey && !inCtl) || (k === "Enter" && !inCtl)) { e.preventDefault(); next(); }
    else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(k) || (k === " " && e.shiftKey)) { e.preventDefault(); prev(); }
    else if (k === "Home") { e.preventDefault(); go(0); }
    else if (k === "End") { e.preventDefault(); go(N - 1); }
    else if (k === "Escape" && !document.fullscreenElement) stop();
    else if (k === "f" || k === "F") fullscreen();
    else if (k === "g" || k === "G") toggleOverview(true);
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
    if (e.target.closest?.("button, a, input, label, summary, .pbar")) return;
    if (s) next();
  }
  let wheelAt = 0, tx = 0, ty = 0;
  function onWheel(e) {
    if (!on || overview) return;
    e.preventDefault();
    const now = Date.now();
    if (Math.abs(e.deltaY) < 12 || now - wheelAt < 600) return;
    wheelAt = now;
    e.deltaY > 0 ? next() : prev();
  }
  const onTouchStart = e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; };
  function onTouchEnd(e) {
    if (overview) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 45) return;
    (Math.abs(dx) > Math.abs(dy) ? dx < 0 : dy < 0) ? next() : prev();
  }
  const onResize = () => { if (on) layout(); };
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
    root.classList.add("presenting");
    $$("img[loading=lazy]").forEach(im => (im.loading = "eager"));
    if (!bar) buildBar();
    layout(); applyTiming();
    setCurrent(i);
    window.MNE?.drawLinks?.();
    addEventListener("keydown", onKey);
    addEventListener("click", onClick, true);
    addEventListener("wheel", onWheel, { passive: false });
    addEventListener("touchstart", onTouchStart, { passive: true });
    addEventListener("touchend", onTouchEnd, { passive: true });
    addEventListener("resize", onResize);
    addEventListener("mousemove", wake);
    addEventListener("hashchange", onHash);
    wake();
    $(".pbar__next", bar).focus({ preventScroll: true });
  }
  function stop() {
    if (!on) return;
    if (running) cancelRunning();
    on = false; overview = false;
    const s = slides[cur];
    root.classList.remove("presenting", "present-idle", "overview");
    slides.forEach(x => x.classList.remove("is-current", "is-leaving"));
    removeEventListener("keydown", onKey);
    removeEventListener("click", onClick, true);
    removeEventListener("wheel", onWheel);
    removeEventListener("touchstart", onTouchStart);
    removeEventListener("touchend", onTouchEnd);
    removeEventListener("resize", onResize);
    removeEventListener("mousemove", wake);
    removeEventListener("hashchange", onHash);
    if (document.fullscreenElement) document.exitFullscreen();
    history.replaceState(null, "", "#" + (s.id || ""));
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
    else if (/[?&]present\b/.test(location.search)) start(0);
  };
  if (document.readyState === "complete") startAt(); else addEventListener("load", startAt);

  window.MNEPresent = { start, stop, next, prev, go, toggleOverview, get state() { return { on, cur, N, fx, ms, overview, engine: supportsVT && !forceFlip ? "view-transitions" : "flip", running: !!running }; } };
})();
