/* The Multinational Enterprises — slide chrome, scroll view and generated lists (no dependencies). */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const slides = $$("#deck > .slide");
  const N = slides.length;

  /* ------------------------------------------------ chrome injected into every slide
     bg / dots / chapter tag / emblem / page number all carry morph keys, so they glide between slides */
  const CH = {
    cover: null,
    intro: ["Introduction", "assets/img/compass.svg"],
    ch1: ["Theory", "assets/img/ship.webp"],
    ch2a: ["Impacts", "assets/img/scale.webp"],
    ch2b: ["Viet Nam", "assets/img/port.webp"],
    end: ["Conclusion", "assets/img/compass.svg"],
    refs: ["References", "assets/img/compass.svg"],
  };
  // slide templates (morph choreography: same template = subtle, new template = stronger)
  const tplOf = s => s.matches(".hero") ? "cover" : s.matches(".thanks") ? "thanks" : s.matches(".opener") ? "opener"
    : s.querySelector(".quote") ? "quote" : s.querySelector(".chart") ? "chart" : s.querySelector(".tframe") ? "table"
    : s.querySelector(".fpanel, .ir") ? "figure" : s.querySelector(".nums, .callout") ? "numbers"
    : s.querySelector(".refs, .abbr, .toc-lists") ? "list" : s.querySelector(".cards, .recs, .toc, .ladder, .mini-ir, .evo") ? "cards" : "bullets";
  // dot positions (stage px) per template, so neighbours of the same template keep their dots still;
  // only in the margins (x < 100 or x > 1820), away from the compass (bottom left) and the page number
  const DOTS = {
    bullets: [[1846, 300], [30, 420], [1836, 800]],
    cards: [[30, 300], [1846, 860], [1840, 170]],
    table: [[1848, 190], [24, 700], [1844, 520]],
    figure: [[40, 190], [1846, 640], [22, 560]],
    chart: [[1846, 400], [30, 240], [1840, 760]],
    numbers: [[30, 560], [1846, 300], [1836, 860]],
    list: [[1846, 520], [30, 620], [1840, 880]],
    quote: [[1846, 300], [40, 560], [1836, 820]],
    opener: [[1846, 300], [40, 560], [1836, 820]],
    cover: [[1846, 300], [60, 560], [1836, 820]],
    thanks: [[1846, 300], [60, 560], [1836, 820]],
  };
  const el = (tag, cls, attrs = {}) => { const e = document.createElement(tag); e.className = cls; for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  slides.forEach((s, i) => {
    const tpl = s.dataset.tpl || (s.dataset.tpl = tplOf(s));
    if (!$(":scope > .bg", s)) s.prepend(el("div", "bg", { "data-morph": "bg", "aria-hidden": "true" }));
    DOTS[tpl].forEach(([x, y], k) => { s.style.setProperty(`--d${k + 1}x`, x + "px"); s.style.setProperty(`--d${k + 1}y`, y + "px"); });
    [1, 2, 3].forEach(k => s.append(el("span", `dot d${k}`, { "data-morph": `dot-${k}`, "aria-hidden": "true" })));
    const ch = CH[s.dataset.ch];
    const special = s.matches(".hero, .opener, .thanks");
    if (ch && !special) {
      const tag = el("p", "ctag", { "data-morph": "ctag", "aria-hidden": "true", "data-web": "" });
      tag.textContent = s.dataset.tag || ch[0];
      const em = el("img", "emblem", { "data-morph": "emblem", src: ch[1], alt: "", width: "84", height: "84", loading: "lazy" });
      s.append(tag, em);
    }
    const pno = el("p", "pno", { "data-morph": "pno", "aria-hidden": "true", "data-web": "" });
    pno.textContent = `${i + 1} / ${N}`;
    s.append(pno);
    s.dataset.n = i + 1;
  });

  /* ------------------------------------------------ reflow (phone width) and reading mode
     Reading mode ("Đọc", R): the slides become a scrolling article with the paper's full text
     (the speaker notes) in place of the bullets; the same DOM, nothing duplicated. */
  const store = {
    get(k) { try { return localStorage.getItem("mne-" + k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem("mne-" + k, v); } catch { /* private mode */ } },
  };
  function reflow() {
    const busy = root.classList.contains("presenting") || root.classList.contains("printing");
    root.classList.toggle("reflow", !busy && (innerWidth <= 760 || root.classList.contains("reading")));
  }
  const readBtn = $(".nav__read");
  function setReading(onR) {
    root.classList.toggle("reading", onR);
    readBtn?.setAttribute("aria-pressed", String(onR));
    store.set("read", onR ? "1" : "");
    reflow();
    linksNow();
  }
  if (store.get("read") === "1" || /[?&]read\b/.test(location.search)) root.classList.add("reading");
  readBtn?.setAttribute("aria-pressed", String(root.classList.contains("reading")));
  readBtn?.addEventListener("click", () => {
    const top = slides.find(s => s.getBoundingClientRect().bottom > 80);
    setReading(!root.classList.contains("reading"));
    top && requestAnimationFrame(() => top.scrollIntoView({ block: "start" }));
  });
  document.addEventListener("keydown", e => {
    if ((e.key === "r" || e.key === "R") && !e.ctrlKey && !e.metaKey && !e.altKey && !root.classList.contains("presenting") && !e.target.closest("input, textarea, [contenteditable]")) readBtn?.click();
  });
  reflow();
  addEventListener("resize", reflow);

  /* ------------------------------------------------ scroll view: zoom the 1920×1080 stage to the column */
  function fit() {
    const gap = Math.max(10, Math.min(24, innerWidth * .02));
    const w = Math.min(1360, innerWidth - gap * 2);
    root.style.setProperty("--z", (w / 1920).toFixed(4));
  }
  fit();
  addEventListener("resize", fit);

  /* ------------------------------------------------ connectors of the HTML organisation charts (Figures 1.1, 1.2)
     drawn in the slide's own (unzoomed) coordinates, so they stay right in every view */
  function drawLinks(scope = document) {
    $$(".fpanel", scope).forEach(panel => {
      const kids = $$("[data-from]", panel);
      if (!kids.length) return;
      const pr = panel.getBoundingClientRect();
      if (!pr.width) return;
      const k = pr.width / panel.offsetWidth || 1;
      const pos = e => { const r = e.getBoundingClientRect(); return { x: (r.left - pr.left) / k, y: (r.top - pr.top) / k, w: r.width / k, h: r.height / k }; };
      let svg = $(":scope > svg.links", panel);
      if (!svg) { svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.setAttribute("class", "links"); svg.setAttribute("aria-hidden", "true"); panel.prepend(svg); }
      const paths = kids.map(c => {
        const p = document.getElementById(c.dataset.from); if (!p) return "";
        const a = pos(p), b = pos(c);
        const x1 = a.x + a.w / 2, y1 = a.y + a.h, x2 = b.x + b.w / 2, y2 = b.y, my = y1 + (y2 - y1) / 2;
        const d = Math.abs(x1 - x2) < 2 ? `M${x1} ${y1}V${y2}` : `M${x1} ${y1}V${my}H${x2}V${y2}`;
        return `<path class="${c.dataset.link === "dash" ? "dash" : ""}" d="${d}"/>`;
      });
      svg.innerHTML = paths.join("");
    });
  }
  function linksNow() { if (!root.classList.contains("reflow")) drawLinks(); }
  document.fonts.ready.then(linksNow);
  addEventListener("resize", linksNow);

  /* ------------------------------------------------ generated lists (tables, figures, abbreviations) */
  const tables = $$(".tbl caption").filter(c => /^Table \d/.test(c.textContent.trim()));
  const figures = $$("figcaption.fcap").filter(c => /^Figure \d/.test(c.textContent.trim()));
  const item = (cap) => {
    const t = cap.textContent.replace(/\s+/g, " ").trim();
    const m = t.match(/^((?:Table|Figure) \d\.\d)\.?\s*(.*)$/);
    const s = cap.closest(".slide");
    return `<li><a href="#${s.id}"><b>${m ? m[1] : ""}</b><span>${m ? m[2] : t}</span></a></li>`;
  };
  const lt = $("#list-tables"), lf = $("#list-figures");
  if (lt) lt.innerHTML = tables.map(item).join("");
  if (lf) lf.innerHTML = figures.map(item).join("");
  $$("[data-count]").forEach(e => {
    const what = e.dataset.count;
    e.textContent = what === "tables" ? tables.length : what === "figures" ? figures.length : $$("#abbr-list > div").length;
  });

  /* ------------------------------------------------ mobile menu */
  const toggle = $(".nav__toggle"), menu = $("#nav-menu");
  const setMenu = open => { toggle.setAttribute("aria-expanded", String(open)); menu.classList.toggle("is-open", open); $(".sr-only", toggle).textContent = open ? "Close contents" : "Open contents"; };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && menu.classList.contains("is-open")) { setMenu(false); toggle.focus(); } });

  /* ------------------------------------------------ scroll-spy + reading progress */
  const links = $$(".nav__menu a");
  const order = links.map(a => a.hash.slice(1));
  const bar = $("#progress");
  let ticking = false, paused = false;
  function onScroll() {
    ticking = false;
    if (paused) return;
    const y = scrollY, max = root.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    const line = y + innerHeight * .35;
    let g = null;
    for (const id of order) { const t = document.getElementById(id); if (t && t.getBoundingClientRect().top + y <= line) g = id; }
    links.forEach(a => a.hash === "#" + g ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current"));
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ------------------------------------------------ count-up (scroll view only) */
  const fmt = (v, e) => e.dataset.sep ? Math.round(v).toLocaleString("en-US") : v.toFixed(+(e.dataset.dec || 0));
  function countUp(e) {
    if (e.dataset.done || reduce || root.classList.contains("presenting") || root.classList.contains("printing")) return;
    e.dataset.done = "1";
    const to = parseFloat(e.dataset.to), t0 = performance.now(), D = 1100;
    (function tick(t) {
      const k = Math.min(1, (t - t0) / D);
      e.textContent = fmt(to * (1 - Math.pow(1 - k, 3)), e);
      if (k < 1) requestAnimationFrame(tick); else e.textContent = fmt(to, e);
    })(t0);
  }

  /* ------------------------------------------------ I-R matrix (Figure 1.3) ↔ Table 1.4 */
  const t14 = Object.fromEntries($$("#t1-4 tbody tr").map(r => [r.dataset.q, r]));
  const note = $(".irnote");
  $$(".ir .q").forEach(btn => btn.addEventListener("click", e => {
    e.stopPropagation();
    const on = btn.getAttribute("aria-pressed") !== "true";
    $$(".ir .q").forEach(b => b.setAttribute("aria-pressed", "false"));
    Object.values(t14).forEach(r => r.classList.remove("is-active"));
    if (!on || !note) { if (note) note.innerHTML = note.dataset.empty; return; }
    btn.setAttribute("aria-pressed", "true");
    const r = t14[btn.dataset.q];
    if (!r) return;
    r.classList.add("is-active");
    const [name, logic, adv, dis, ex] = [...r.children].map(c => c.textContent);
    note.innerHTML = `<b>${name}</b> — ${logic}. <i>Advantages:</i> ${adv}. <i>Disadvantages:</i> ${dis}. <i>Typical examples:</i> ${ex}. <small>(Table 1.4)</small>`;
  }));
  if (note) note.dataset.empty = note.innerHTML;

  /* ------------------------------------------------ reveal + count-up as slides enter */
  const counts = $$(".count");
  let io = null;
  if (!("IntersectionObserver" in window) || reduce) {
    slides.forEach(s => s.classList.add("is-in"));
  } else {
    io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      $$(".count", e.target).forEach(countUp);
      io.unobserve(e.target);
    }), { threshold: .08 });
    slides.forEach(s => io.observe(s));
  }
  // presentation mode: no scroll-spy, no observers (MNEPresent marks every slide is-in)
  function pauseScroll(p) {
    paused = p;
    if (p && io) { io.disconnect(); io = null; }
  }
  window.MNE = { slides, N, fit, counts, drawLinks, reflow, pauseScroll, tplOf };
})();
