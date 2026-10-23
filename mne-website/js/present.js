/* Presentation mode: one slide at a time, scaled to the screen; long slides are paged
   at block boundaries. Also builds the print deck used by tools/export-pdf.mjs. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const slides = $$("main > .slide");
  const DESIGN_W = 1320, BAR = 58;
  const INNER = ":scope > .slide__inner, :scope > .hero__inner, :scope > .opener__inner, :scope > .thanks__title, :scope > .thanks__by";
  const BLOCKS = ".rv, .card, .impact, .step, tr, .refs li, .num, .chart-card, .ladder li, .eprg li, .owner li, .prose > p, .ledger__col > p, h3, h4, .fold";

  let on = false, cur = 0, page = 0, stops = [0], Z = 1, bar = null, idle;

  const zoomFor = (w, h) => (w < 900 ? 1 : Math.min(w / DESIGN_W, (h + 160) / 900, 1.7));
  const inners = s => $$(INNER, s);
  const title = s => {
    const h = s.querySelector("h1, h2, h3, h4");
    const t = s.id === "top" ? "The Multinational Enterprises" : (h ? h.textContent.replace(/\s+/g, " ").trim() : s.id);
    return t.length > 70 ? t.slice(0, 68) + "…" : t;
  };

  /* page stops (in unzoomed px) for one visible slide; a slide only a little taller
     than the screen is shrunk to fit (--fit) instead of getting a near-empty page */
  function measure(s, viewH) {
    s.style.setProperty("--fit", 1);
    const box = s.querySelector(INNER);
    if (!box) return [0];
    const r0 = box.getBoundingClientRect(), H = r0.height / Z, view = viewH / Z;
    if (H <= view + 2) return [0];
    if (H <= view * 1.3) { s.style.setProperty("--fit", (view / H).toFixed(4)); return [0]; }
    const blocks = $$(BLOCKS, box).map(b => { const r = b.getBoundingClientRect(); return [(r.top - r0.top) / Z, (r.bottom - r0.top) / Z]; })
      .filter(([t, b]) => b - t > 4);
    const out = [0];
    let c = 0;
    while (c + view < H - 2 && out.length < 40) {
      const cut = blocks.filter(([t, b]) => t > c + 12 && b > c + view - 2).map(([t]) => t);
      let next = cut.length ? Math.min(...cut) - 22 : c + view * .85;
      if (next - c < view * .35) next = c + view * .85;  // block taller than a screen
      c = next;
      out.push(c);
    }
    return out;
  }

  function layout(barH = BAR) {
    Z = zoomFor(innerWidth, innerHeight);
    root.style.setProperty("--pz", Z);
    root.style.setProperty("--vhl", ((innerHeight - barH) / Z) + "px");
  }

  function show(i, p = 0, instant = false) {
    cur = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach((s, k) => s.classList.toggle("is-current", k === cur));
    const s = slides[cur];
    s.classList.add("is-in");
    $$(".rv, .chart, .owner, .share", s).forEach(e => e.classList.add("is-in"));
    stops = measure(s, innerHeight - BAR);
    page = p < 0 ? stops.length - 1 : Math.min(p, stops.length - 1);
    apply(instant);
  }

  // offset of a page and the height it may show (content from the next page's start is hidden)
  const setPage = (el, list, p) => {
    el.style.setProperty("--off", list[p]);
    el.style.setProperty("--top", p ? 22 : 0);  // hide the tail of the block above the page start
    el.style.setProperty("--cut", p < list.length - 1 ? list[p + 1] + 16 - list[p] : 1e5);
  };

  function apply(instant) {
    const s = slides[cur];
    inners(s).forEach(el => {
      el.style.transition = instant ? "none" : "";
      setPage(el, stops, page);
    });
    if (bar) {
      $(".pbar__title", bar).textContent = title(s);
      $(".pbar__count", bar).textContent = `${cur + 1} / ${slides.length}` + (stops.length > 1 ? ` · ${page + 1}/${stops.length}` : "");
      $(".pbar__fill", bar).style.transform = `scaleX(${(cur + (page + 1) / stops.length) / slides.length})`;
      $(".pbar__prev", bar).disabled = cur === 0 && page === 0;
      $(".pbar__next", bar).disabled = cur === slides.length - 1 && page === stops.length - 1;
    }
    history.replaceState(null, "", "#" + s.id);
  }

  const next = () => page < stops.length - 1 ? (page++, apply()) : cur < slides.length - 1 && show(cur + 1, 0);
  const prev = () => page > 0 ? (page--, apply()) : cur > 0 && show(cur - 1, -1);

  function buildBar() {
    bar = document.createElement("div");
    bar.className = "pbar";
    bar.setAttribute("role", "toolbar");
    bar.setAttribute("aria-label", "Presentation controls");
    bar.innerHTML = `
      <span class="pbar__fill" aria-hidden="true"></span>
      <p class="pbar__title" aria-live="polite"></p>
      <div class="pbar__nav">
        <button type="button" class="pbar__prev" aria-label="Previous (←)"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
        <span class="pbar__count"></span>
        <button type="button" class="pbar__next" aria-label="Next (→ or Space)"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
      </div>
      <div class="pbar__tools">
        <button type="button" class="pbar__fs" aria-label="Full screen (F)"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>
        <button type="button" class="pbar__exit" aria-label="Exit presentation (Esc)"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </div>`;
    document.body.appendChild(bar);
    $(".pbar__prev", bar).onclick = prev;
    $(".pbar__next", bar).onclick = next;
    $(".pbar__exit", bar).onclick = stop;
    $(".pbar__fs", bar).onclick = fullscreen;
  }

  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else root.requestFullscreen?.().catch(() => {});
  }

  function wake() {
    root.classList.remove("present-idle");
    clearTimeout(idle);
    idle = setTimeout(() => root.classList.add("present-idle"), 2600);
  }

  function onKey(e) {
    if (!on || e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.key, inButton = e.target.closest?.("button, summary, a");
    if (["ArrowRight", "ArrowDown", "PageDown"].includes(k) || (k === " " && !e.shiftKey && !inButton) || (k === "Enter" && !inButton)) { e.preventDefault(); next(); }
    else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(k) || (k === " " && e.shiftKey)) { e.preventDefault(); prev(); }
    else if (k === "Home") { e.preventDefault(); show(0); }
    else if (k === "End") { e.preventDefault(); show(slides.length - 1, -1); }
    else if (k === "Escape" && !document.fullscreenElement) stop();
    else if (k === "f" || k === "F") fullscreen();
    wake();
  }

  let wheelAt = 0, touchX = 0, touchY = 0;
  function onWheel(e) {
    if (!on) return;
    e.preventDefault();
    const now = Date.now();
    if (Math.abs(e.deltaY) < 12 || now - wheelAt < 550) return;
    wheelAt = now;
    e.deltaY > 0 ? next() : prev();
  }
  const onTouchStart = e => { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; };
  function onTouchEnd(e) {
    const dx = e.changedTouches[0].clientX - touchX, dy = e.changedTouches[0].clientY - touchY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 45) return;
    (Math.abs(dx) > Math.abs(dy) ? dx < 0 : dy < 0) ? next() : prev();
  }
  const onResize = () => { if (on) { layout(); show(cur, 0, true); } };

  function start(i) {
    if (on) return;
    on = true;
    if (i == null) {  // start from the slide currently on screen
      const line = scrollY + innerHeight * 0.35;
      i = 0;
      slides.forEach((s, k) => { if (s.offsetTop <= line) i = k; });
    }
    root.classList.add("presenting");
    $$("img[loading=lazy]").forEach(im => (im.loading = "eager"));
    if (!bar) buildBar();
    layout();
    show(i, 0, true);
    addEventListener("keydown", onKey);
    addEventListener("wheel", onWheel, { passive: false });
    addEventListener("touchstart", onTouchStart, { passive: true });
    addEventListener("touchend", onTouchEnd, { passive: true });
    addEventListener("resize", onResize);
    addEventListener("mousemove", wake);
    wake();
    $(".pbar__next", bar).focus({ preventScroll: true });
  }

  function stop() {
    if (!on) return;
    on = false;
    const s = slides[cur];
    root.classList.remove("presenting", "present-idle");
    slides.forEach(x => { x.classList.remove("is-current"); x.style.removeProperty("--fit"); inners(x).forEach(el => { el.style.removeProperty("--off"); el.style.removeProperty("--cut"); }); });
    removeEventListener("keydown", onKey);
    removeEventListener("wheel", onWheel);
    removeEventListener("touchstart", onTouchStart);
    removeEventListener("touchend", onTouchEnd);
    removeEventListener("resize", onResize);
    removeEventListener("mousemove", wake);
    if (document.fullscreenElement) document.exitFullscreen();
    scrollTo({ top: s.offsetTop - 70, behavior: "instant" });
    $(".nav__present")?.focus({ preventScroll: true });
  }

  /* print deck: every (slide, page) becomes one 16:9 page; used by tools/export-pdf.mjs */
  function buildDeck() {
    root.classList.add("presenting");
    $$("img[loading=lazy]").forEach(im => (im.loading = "eager"));
    layout(0);
    const plan = slides.map((s, i) => { show(i, 0, true); return measure(s, innerHeight); });
    const fits = slides.map(s => s.style.getPropertyValue("--fit") || 1);
    slides.forEach(s => s.classList.remove("is-current"));
    root.classList.add("exporting");
    const deck = document.createElement("div");
    deck.className = "print-deck";
    let n = 0;
    const total = plan.reduce((a, p) => a + p.length, 0);
    plan.forEach((pages, i) => pages.forEach((off, p) => {
      const pg = document.createElement("section");
      pg.className = "print-page";
      const c = slides[i].cloneNode(true);
      c.removeAttribute("id");
      c.querySelectorAll("[id]").forEach(e => e.removeAttribute("id"));
      c.classList.add("is-current");
      c.style.setProperty("--fit", fits[i]);
      inners(c).forEach(el => { el.style.transition = "none"; setPage(el, pages, p); });
      pg.appendChild(c);
      if (++n > 1) pg.insertAdjacentHTML("beforeend", `<span class="print-no">${n} / ${total}</span>`);
      deck.appendChild(pg);
    }));
    $("main").after(deck);
    return total;
  }

  /* entry points */
  $$(".nav__present").forEach(b => b.addEventListener("click", () => start()));
  addEventListener("keydown", e => {
    if (!on && (e.key === "p" || e.key === "P") && !e.ctrlKey && !e.metaKey && !e.altKey && !e.target.closest("input, textarea, [contenteditable]")) start();
  });
  window.MNEPresent = { start, stop, next, prev, buildDeck };
  if (/[?&]present\b/.test(location.search)) addEventListener("load", () => start(Math.max(0, slides.findIndex(s => "#" + s.id === location.hash))));
})();
