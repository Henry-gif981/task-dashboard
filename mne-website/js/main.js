/* The Multinational Enterprises — page behaviour (no dependencies). */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------ mobile menu */
  const toggle = $(".nav__toggle"), menu = $("#nav-menu");
  const setMenu = open => {
    toggle.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
    $(".sr-only", toggle).textContent = open ? "Close contents" : "Open contents";
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
  });

  /* ------------------------------------------------ scroll-spy + reading progress */
  const links = $$(".nav__menu a");
  const groupOf = id => /^s1-/.test(id) ? "chapter-1" : /^s2-/.test(id) ? "chapter-2" : /^s3-/.test(id) ? "chapter-3"
    : id === "thanks" ? "references" : id;
  const slides = $$("main > .slide");
  const bar = $("#progress");
  let ticking = false;
  function onScroll() {
    ticking = false;
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    const line = y + innerHeight * 0.35;
    let cur = null;
    for (const s of slides) { if (s.offsetTop <= line) cur = s; else break; }
    const g = cur ? groupOf(cur.id) : null;
    links.forEach(a => a.hash === "#" + g ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current"));
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ------------------------------------------------ count-up */
  const fmt = (v, el) => {
    const dec = +(el.dataset.dec || 0);
    return el.dataset.sep ? Math.round(v).toLocaleString("en-US") : v.toFixed(dec);
  };
  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    const to = parseFloat(el.dataset.to);
    if (reduce) { el.textContent = fmt(to, el); return; }
    const t0 = performance.now(), D = 1200;
    (function tick(t) {
      const k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(to * e, el);
      if (k < 1) requestAnimationFrame(tick); else el.textContent = fmt(to, el);
    })(t0);
  }

  /* ------------------------------------------------ charts (inline SVG) */
  const NS = "http://www.w3.org/2000/svg";
  const C = { slate: "#3C5675", ink: "#24364D", wash: "#7C93A8", red: "#9E3B3B", lo: "#E2D4AE", soft: "#55606C" };
  const svg = (w, h, label, inner) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" xmlns="${NS}">
    <defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="${C.wash}"/><line x1="0" y1="0" x2="0" y2="6" stroke="${C.slate}" stroke-width="1.6"/></pattern></defs>${inner}</svg>`;
  const legend = items => `<div class="legend">${items.map(([c, t]) => `<span><i style="background:${c}"></i>${t}</span>`).join("")}</div>`;

  const charts = {
    fdi() {
      const W = 360, H = 250, B = 210, top = 30, max = 60;
      const y = v => B - (v / max) * (B - top);
      const groups = [
        { name: "2025", reg: 38.4, dis: 27.6, regNote: "", disNote: "+9%" },
        { name: "9M 2026", reg: 50.36, dis: 21.07, regNote: "+76.4%", disNote: "+12.1%" }];
      let g = "";
      for (const v of [0, 20, 40, 60]) g += `<line class="c-axis" x1="34" x2="${W - 6}" y1="${y(v)}" y2="${y(v)}"/><text class="c-lbl" x="28" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
      groups.forEach((d, i) => {
        const x0 = 70 + i * 150, bw = 52;
        [["reg", C.slate, d.reg, d.regNote], ["dis", "url(#hatch)", d.dis, d.disNote]].forEach(([k, fill, v, note], j) => {
          const x = x0 + j * (bw + 8);
          g += `<rect class="c-grow c-grow--y" x="${x}" y="${y(v)}" width="${bw}" height="${B - y(v)}" fill="${fill}" stroke="${C.ink}" stroke-width=".8"/>`;
          g += `<text class="c-val" x="${x + bw / 2}" y="${y(v) - 7}" text-anchor="middle">${v}</text>`;
          if (note) g += `<text class="c-lbl" x="${x + bw / 2}" y="${y(v) + 16}" text-anchor="middle" style="fill:${j ? C.ink : "#FBF4E2"};font-weight:600">${note}</text>`;
        });
        g += `<text class="c-lbl" x="${x0 + bw + 4}" y="${B + 20}" text-anchor="middle" style="font-weight:600;fill:${C.ink}">${d.name}</text>`;
      });
      g += `<line x1="34" x2="${W - 6}" y1="${B}" y2="${B}" stroke="${C.ink}"/>`;
      return svg(W, H + 4, "Registered FDI: 38.4 billion USD in 2025 and 50.36 billion in the first nine months of 2026; disbursed FDI: 27.6 and 21.07 billion", g)
        + legend([[C.slate, "Registered"], [C.wash, "Disbursed"]]);
    },
    exports() {
      const W = 360, H = 220, cx = 110, cy = 110, r = 84, sw = 34;
      const total = 475, fdi = 367.1, dom = +(total - fdi).toFixed(1), share = 77.3;
      const L = 2 * Math.PI * r, a = L * share / 100;
      let g = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.lo}" stroke-width="${sw}"/>`;
      g += `<circle class="c-ring" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.slate}" stroke-width="${sw}" stroke-dasharray="${a} ${L}" transform="rotate(-90 ${cx} ${cy})" style="--len:${a}"/>`;
      g += `<text x="${cx}" y="${cy + 4}" text-anchor="middle" style="font:500 34px 'Cormorant SC',serif;fill:${C.ink}">77.3%</text>`;
      g += `<text class="c-lbl" x="${cx}" y="${cy + 24}" text-anchor="middle">FDI sector</text>`;
      const rows = [["FDI sector", fdi, C.slate, "77.3%"], ["Domestic sector", dom, C.lo, "22.7%*"], ["Total exports", total, "none", "+17% y/y"]];
      rows.forEach(([n, v, c, p], i) => {
        const yy = 62 + i * 46;
        g += `<rect x="222" y="${yy - 11}" width="12" height="12" rx="2" fill="${c}" stroke="${c === "none" ? C.ink : "none"}"/>`;
        g += `<text class="c-lbl" x="240" y="${yy}">${n}</text><text class="c-val" x="240" y="${yy + 18}">${v} <tspan class="c-lbl">· ${p}</tspan></text>`;
      });
      return svg(W, H, "Exports 2025: total 475 billion USD; FDI sector 367.1 billion (77.3%); domestic sector 107.9 billion", g)
        + `<p class="chart__src" style="margin-top:2px">* derived: 107.9 / 475.</p>`;
    },
    balance() {
      const W = 360, H = 226, zero = 128, k = 2.75;
      const rows = [["FDI sector", 49.5, C.slate, "nearly +49.5"], ["Domestic sector", -29.4, C.red, "−29.4"], ["Viet Nam (national)", 20, "url(#hatch)", "about +20"]];
      let g = `<line x1="${zero}" x2="${zero}" y1="8" y2="${H - 20}" stroke="${C.ink}"/>`;
      g += `<text class="c-lbl" x="${zero}" y="${H - 4}" text-anchor="middle">0</text>`;
      rows.forEach(([n, v, c, lbl], i) => {
        const y = 26 + i * 66, w = Math.abs(v) * k, x = v >= 0 ? zero : zero - w;
        g += `<text class="c-lbl" x="${v >= 0 ? zero + 2 : zero - 2}" y="${y - 7}" text-anchor="${v >= 0 ? "start" : "end"}" style="fill:${C.ink};font-weight:600">${n}</text>`;
        g += `<rect class="c-grow ${v >= 0 ? "c-grow--x" : "c-grow--xr"}" x="${x}" y="${y}" width="${w}" height="26" fill="${c}" stroke="${C.ink}" stroke-width=".8"/>`;
        g += `<text class="c-val" x="${v >= 0 ? x + w + 6 : x - 6}" y="${y + 18}" text-anchor="${v >= 0 ? "start" : "end"}" style="fill:${v < 0 ? C.red : C.ink}">${lbl}</text>`;
      });
      return svg(W, H, "Trade balance 2025: FDI sector surplus of nearly 49.5 billion USD; domestic sector deficit of 29.4 billion; national surplus of about 20 billion", g);
    },
    greenfield() {
      const W = 300, H = 92, x0 = 46, w = 230;
      let g = "";
      [["2020", 16, C.wash], ["2025", 44, C.red]].forEach(([yr, v, c], i) => {
        const y = 10 + i * 38;
        g += `<text x="0" y="${y + 17}" style="font:600 13px var(--f-body)">${yr}</text>`;
        g += `<rect x="${x0}" y="${y}" width="${w}" height="24" rx="3" fill="none" stroke="${C.lo}"/>`;
        g += `<rect class="c-grow c-grow--x" x="${x0}" y="${y}" width="${w * v / 100}" height="24" rx="3" fill="${c}"/>`;
        g += `<text x="${x0 + w * v / 100 + 6}" y="${y + 17}" style="font:600 14px var(--f-body);fill:${C.ink}">${v}%</text>`;
      });
      return svg(W, H, "Strategic sectors' share of global greenfield investment value: 16% in 2020, 44% in 2025", g);
    }
  };
  $$("[data-chart]").forEach(el => {
    const fn = charts[el.dataset.chart];
    if (fn) el.insertAdjacentHTML(el.tagName === "FIGURE" ? "afterbegin" : "beforeend", fn());
    el.classList.add("chart");
  });

  /* ------------------------------------------------ I-R matrix ↔ Table 1.3 */
  const rows = Object.fromEntries($$("#table-1-3 tbody tr").map(r => [r.dataset.row, r]));
  const detail = $(".ir__detail");
  $$(".ir__q").forEach(btn => btn.addEventListener("click", () => {
    const key = btn.dataset.row, on = btn.getAttribute("aria-pressed") !== "true";
    $$(".ir__q").forEach(b => b.setAttribute("aria-pressed", "false"));
    Object.values(rows).forEach(r => r.classList.remove("is-active"));
    if (!on) { detail.innerHTML = "<p>Select a strategy above.</p>"; return; }
    btn.setAttribute("aria-pressed", "true");
    const r = rows[key]; r.classList.add("is-active");
    const [name, pr, feat, ex] = [...r.children].map(c => c.textContent);
    detail.innerHTML = `<p><b>${name}</b> · <span>${pr}</span></p><p>${feat}.</p><p><i>Typical example:</i> ${ex}.</p>`;
  }));

  /* ------------------------------------------------ reveal on scroll */
  const targets = $$(".rv, .opener, .chart, .owner, .share, .count");
  if (!("IntersectionObserver" in window) || reduce) {
    targets.forEach(t => t.classList.add("is-in"));
    $$(".count").forEach(countUp);
    return;
  }
  $$(".count").forEach(c => { c.dataset.final = c.textContent; });
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const t = e.target;
      t.classList.add("is-in");
      if (t.classList.contains("count")) countUp(t);
      io.unobserve(t);
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  targets.forEach(t => io.observe(t));
})();
