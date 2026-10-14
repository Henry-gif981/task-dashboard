/* =========================================================
   Trang trình bày – điều hướng, trình chiếu, hình tương tác,
   biểu đồ SVG tự vẽ. Số liệu biểu đồ: window.VIZ (bản sao của
   viz_data.json). Số được ghi kiểu Việt Nam và đọc bằng vn().
   ========================================================= */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const VIZ = window.VIZ || {};
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- số kiểu Việt Nam ---------- */
  // "188,717" -> 188.717 ; "2.146,45" -> 2146.45 ; "1.000" -> 1000 ; "-" -> null
  const vn = s => { s = String(s).trim(); if (!s || s === "-") return null; return parseFloat(s.replace(/[()+%\s]/g, "").replace(/\./g, "").replace(",", ".")); };
  const decimals = s => { const m = String(s).match(/,(\d+)/); return m ? m[1].length : 0; };
  function toVN(n, dec) {
    const neg = n < 0; n = Math.abs(n);
    let [i, d] = n.toFixed(dec).split(".");
    i = i.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return (neg ? "−" : "") + i + (d ? "," + d : "");
  }

  /* ---------- bìa: từ cấu hình window.COVER ---------- */
  const C = window.COVER || {};
  $$("[data-cover]").forEach(el => { const v = C[el.dataset.cover]; el.textContent = v || ""; });
  const lect = $('[data-row="lecturer"]'); if (lect && !(C.lecturer || "").trim()) lect.hidden = true;

  /* ---------- thanh điều hướng trái ---------- */
  const slides = $$("main > .slide");
  const nav = $("#side-nav");
  if (nav) {
    nav.innerHTML = slides.map(s => {
      const grp = s.classList.contains("chapter") || ["bia", "muc-luc", "mo-dau", "ket-luan", "phu-luc"].includes(s.id);
      return `<li class="${grp ? "grp" : ""}"><a href="#${s.id}">${esc(s.dataset.nav || s.id)}</a></li>`;
    }).join("");
    nav.addEventListener("click", e => { if (e.target.closest("a")) document.body.classList.remove("menu-open"); });
  }
  const navLinks = nav ? $$("a", nav) : [];
  const bar = $(".progress");
  function current() { const mid = innerHeight * .35; let cur = 0; slides.forEach((s, i) => { if (s.getBoundingClientRect().top <= mid) cur = i; }); return cur; }
  let lastCur = -1;
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.width = (max > 0 ? Math.min(100, scrollY / max * 100) : 0) + "%";
    const c = current();
    if (c !== lastCur) {
      lastCur = c;
      navLinks.forEach((a, i) => a.setAttribute("aria-current", i === c ? "true" : "false"));
      const a = navLinks[c]; if (a && nav) { const r = a.getBoundingClientRect(), nr = nav.parentElement.getBoundingClientRect(); if (r.top < nr.top + 40 || r.bottom > nr.bottom - 40) a.scrollIntoView({ block: "center" }); }
    }
  }
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); onScroll();

  /* ---------- công cụ: menu, trình chiếu, sáng/tối ---------- */
  $("#btn-menu")?.addEventListener("click", () => { const o = document.body.classList.toggle("menu-open"); $("#btn-menu").setAttribute("aria-expanded", String(o)); });
  const presentBtn = $("#btn-present");
  function setPresent(on) { document.body.classList.toggle("present", on); presentBtn?.setAttribute("aria-pressed", String(on)); }
  presentBtn?.addEventListener("click", () => setPresent(!document.body.classList.contains("present")));
  const themeBtn = $("#btn-theme");
  function setTheme(t) { document.documentElement.dataset.theme = t; themeBtn?.setAttribute("aria-pressed", String(t === "dark")); try { localStorage.setItem("kt-theme", t); } catch (e) {} redrawAll(); }
  let savedTheme = "light"; try { savedTheme = localStorage.getItem("kt-theme") || "light"; } catch (e) {}
  document.documentElement.dataset.theme = savedTheme; themeBtn?.setAttribute("aria-pressed", String(savedTheme === "dark"));
  themeBtn?.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

  /* ---------- phím trình chiếu ---------- */
  function go(dir) {
    const c = current(), s = slides[c], r = s.getBoundingClientRect();
    if (dir > 0 && r.bottom > innerHeight + 30) { scrollBy({ top: Math.min(innerHeight * .85, r.bottom - innerHeight + 10), behavior: REDUCE ? "auto" : "smooth" }); return; }
    if (dir < 0 && r.top < -30) { scrollBy({ top: Math.max(-innerHeight * .85, r.top - 10), behavior: REDUCE ? "auto" : "smooth" }); return; }
    const t = slides[Math.max(0, Math.min(slides.length - 1, c + dir))];
    t.scrollIntoView({ behavior: REDUCE ? "auto" : "smooth" });
  }
  addEventListener("keydown", e => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = (e.target.tagName || "").toLowerCase();
    if (["input", "select", "textarea"].includes(tag) || e.target.isContentEditable) return;
    if (lb.classList.contains("open")) { if (e.key === "Escape") closeLB(); return; }
    if (e.target.closest && e.target.closest('[role="tablist"]') && ["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); go(1); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(-1); }
    else if (e.key === "f" || e.key === "F") { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {}); else document.exitFullscreen?.(); }
    else if (e.key === "Escape") { if (document.body.classList.contains("present")) setPresent(false); document.body.classList.remove("menu-open"); }
  });
  document.addEventListener("fullscreenchange", () => setPresent(!!document.fullscreenElement));

  /* ---------- hiện dần khi cuộn ---------- */
  const revealables = $$(".slide .wrap > *");
  revealables.forEach(el => el.classList.add("rv"));
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: .08 });
  revealables.forEach(el => REDUCE ? el.classList.add("in") : io.observe(el));

  /* ---------- "Xem chi tiết": mở hết khi in ---------- */
  let closedDetails = [];
  addEventListener("beforeprint", () => { $$("img[loading=lazy]").forEach(i => i.loading = "eager"); closedDetails = $$("details:not([open])"); closedDetails.forEach(d => d.open = true); revealables.forEach(el => el.classList.add("in")); finishCounts(); });
  addEventListener("afterprint", () => { closedDetails.forEach(d => d.open = false); });

  /* ---------- Hình 1.1: tab giai đoạn ---------- */
  function tabs(list, onChange) {
    const btns = $$('[role="tab"]', list);
    const sel = i => { btns.forEach((b, j) => { b.setAttribute("aria-selected", String(i === j)); b.tabIndex = i === j ? 0 : -1; const p = document.getElementById(b.getAttribute("aria-controls")); if (p) p.hidden = i !== j; }); onChange && onChange(i); };
    btns.forEach((b, i) => {
      b.addEventListener("click", () => sel(i));
      b.addEventListener("keydown", e => {
        let k = null;
        if (e.key === "ArrowRight") k = (i + 1) % btns.length; else if (e.key === "ArrowLeft") k = (i - 1 + btns.length) % btns.length; else if (e.key === "Home") k = 0; else if (e.key === "End") k = btns.length - 1;
        if (k != null) { e.preventDefault(); sel(k); btns[k].focus(); }
      });
    });
    return sel;
  }
  $$(".cycle-steps").forEach(l => tabs(l));

  /* ---------- Hình 1.2: nhánh A/B/C ---------- */
  $$(".branch").forEach(br => {
    const h = $(".br-head", br);
    br.classList.add("closed"); h.setAttribute("aria-expanded", "false");
    h.addEventListener("click", () => { const open = br.classList.toggle("closed") === false; h.setAttribute("aria-expanded", String(open)); });
  });

  /* ---------- Hình 1.3: chạy từng bước ---------- */
  $$("[data-stepper]").forEach(st => {
    const rows = $$(".flow-row", st.closest("figure")); let n = 1;
    st.innerHTML = `<button type="button" class="btn ghost" data-a="prev">Bước trước</button><button type="button" class="btn" data-a="next">Bước tiếp</button><button type="button" class="btn ghost" data-a="all">Hiện tất cả</button><span class="sr-only" aria-live="polite"></span>`;
    const live = $(".sr-only", st), prev = $('[data-a="prev"]', st), next = $('[data-a="next"]', st);
    const paint = () => { rows.forEach((r, i) => r.classList.toggle("pending", i >= n)); prev.disabled = n <= 1; next.disabled = n >= rows.length; live.textContent = `Bước ${n} / ${rows.length}`; };
    st.addEventListener("click", e => { const a = e.target.closest("button")?.dataset.a; if (!a) return; n = a === "next" ? Math.min(rows.length, n + 1) : a === "prev" ? Math.max(1, n - 1) : rows.length; paint(); });
    paint();
  });

  /* ---------- bảng so sánh: lọc tiêu chí + công tắc cột ---------- */
  $$("figure.cmp").forEach((fig, k) => {
    const table = $("table", fig), ths = $$("thead th", table);
    const headA = $("thead th.c-a", table).textContent, headB = $("thead th.c-b", table).textContent;
    const short = t => t.replace(/\s*\(.*\)\s*$/, "").trim();
    const rows = $$("tbody tr", table);
    const ctl = document.createElement("div"); ctl.className = "cmp-ctl";
    const order = ths[1].classList.contains("c-a") ? ["a", "b"] : ["b", "a"];
    const lab = { a: short(headA), b: short(headB) };
    ctl.innerHTML = `<div class="seg" role="group" aria-label="Chế độ xem bảng"><button type="button" aria-pressed="true" data-v="both">So sánh</button>${order.map(x => `<button type="button" class="s${x}" aria-pressed="false" data-v="${x}">Chỉ xem ${esc(lab[x])}</button>`).join("")}</div>` +
      `<label>Tiêu chí <select aria-label="Lọc theo tiêu chí"><option value="">Tất cả</option>${rows.map((r, i) => `<option value="${i}">${esc($("th", r).textContent.trim())}</option>`).join("")}</select></label>`;
    fig.insertBefore(ctl, $(".tbl-scroll", fig));
    ctl.addEventListener("click", e => { const b = e.target.closest("button[data-v]"); if (!b) return; $$("button", ctl).forEach(x => x.setAttribute("aria-pressed", String(x === b))); fig.classList.toggle("only-a", b.dataset.v === "a"); fig.classList.toggle("only-b", b.dataset.v === "b"); });
    $("select", ctl).addEventListener("change", e => { const v = e.target.value; rows.forEach((r, i) => r.classList.toggle("dim", v !== "" && String(i) !== v)); });
  });

  /* ---------- lightbox "Chứng từ gốc" ---------- */
  const lb = document.createElement("div");
  lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Ảnh chứng từ phóng to");
  lb.innerHTML = `<button type="button" class="lb-close">Đóng (Esc)</button><div class="lb-inner"><img alt=""><p class="lb-cap"></p></div>`;
  document.body.appendChild(lb);
  let lbReturn = null;
  function openLB(btn) {
    const img = $("img", btn); lbReturn = btn;
    $("img", lb).src = btn.dataset.img; $("img", lb).alt = img ? img.alt : "";
    $(".lb-cap", lb).textContent = $$(".thumb-cap, .thumb-note", btn).map(x => x.textContent).join(" · ");
    lb.classList.add("open"); $(".lb-close", lb).focus();
  }
  function closeLB() { lb.classList.remove("open"); if (lbReturn) lbReturn.focus(); }
  lb.addEventListener("click", e => { if (e.target === lb || e.target.closest(".lb-close")) closeLB(); });
  lb.addEventListener("keydown", e => { if (e.key === "Tab") { e.preventDefault(); $(".lb-close", lb).focus(); } });
  document.addEventListener("click", e => {
    const t = e.target.closest(".thumb"); if (!t) return;
    if (t.dataset.ref) { const ref = document.getElementById(t.dataset.ref); if (ref) { const keep = $(".thumb-cap", t).textContent; openLB(ref); $(".lb-cap", lb).textContent = keep + " · " + $$(".thumb-cap, .thumb-note", ref).map(x => x.textContent).join(" · "); lbReturn = t; } return; }
    openLB(t);
  });

  /* ---------- số chạy lên giá trị cuối ---------- */
  const counts = $$(".count");
  function finishCounts() { counts.forEach(c => c.textContent = c.dataset.v); }
  const cio = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return; cio.unobserve(en.target);
    const el = en.target, to = vn(el.dataset.v), dec = decimals(el.dataset.v), t0 = performance.now(), D = 900;
    (function tick(t) { const p = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - p, 3); el.textContent = p < 1 ? toVN(to * e, dec) : el.dataset.v; if (p < 1) requestAnimationFrame(tick); })(t0);
  }), { threshold: .4 });
  counts.forEach(c => REDUCE ? 0 : cio.observe(c));

  /* =========================================================
     BIỂU ĐỒ (SVG tự vẽ, vẽ lại theo độ rộng thật)
     ========================================================= */
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const FS = k => Math.max(12, Math.round(rem() * k));
  const f1 = n => (+n).toFixed(1);
  const lin = (d0, d1, r0, r1) => v => r0 + (v - d0) / (d1 - d0) * (r1 - r0);
  const tw = (s, fs, b) => String(s).length * fs * (b ? .6 : .54);
  function T(x, y, s, o = {}) {
    return `<text x="${f1(x)}" y="${f1(y)}"${o.a ? ` text-anchor="${o.a}"` : ""} font-size="${o.fs || FS(.62)}"${o.w ? ` font-weight="${o.w}"` : ""}${o.cls ? ` class="${o.cls}"` : ""}${o.fill ? ` style="fill:${o.fill}"` : ""}>${esc(s)}</text>`;
  }
  function mark(inner, tip, hit) {
    return `<g class="mark" tabindex="0" role="img" aria-label="${esc(tip.replace(/\n/g, "; "))}" data-tip="${esc(tip)}">${hit ? `<rect class="hit" x="${f1(hit[0])}" y="${f1(hit[1])}" width="${f1(hit[2])}" height="${f1(hit[3])}" rx="3"/>` : ""}${inner}</g>`;
  }
  const svg = (w, h, body, defs = "") => `<svg class="chart-svg" viewBox="0 0 ${Math.round(w)} ${Math.round(h)}" width="${Math.round(w)}" height="${Math.round(h)}" role="group" aria-hidden="false"><defs>${defs}</defs>${body}</svg>`;
  let UID = 0;
  const hatch = (id, color, bg) => `<pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="${bg}"/><line x1="2" y1="0" x2="2" y2="8" stroke="${color}" stroke-width="2.4"/></pattern>`;
  const col = k => ({ bq: css("--bq"), dn: css("--dn"), dn_special: css("--dn"), green: css("--green"), ink: css("--ink"), ink2: css("--ink-2"), rule: css("--rule"), card: css("--card"), bqSoft: css("--bq-soft"), dnSoft: css("--dn-soft"), bqMid: css("--bq-mid"), dnMid: css("--dn-mid") }[k]);
  const onColor = () => document.documentElement.dataset.theme === "dark" ? "#111" : "#fff";

  /* tooltip */
  const tip = document.createElement("div"); tip.className = "tip"; tip.setAttribute("aria-hidden", "true"); document.body.appendChild(tip);
  let tipFor = null;
  function showTip(m) {
    const [h, ...rest] = m.dataset.tip.split("\n"); tip.innerHTML = `<b>${esc(h)}</b>${rest.map(esc).join("<br>")}`; tip.classList.add("show"); tipFor = m;
    const r = m.getBoundingClientRect(), w = tip.offsetWidth, hh = tip.offsetHeight;
    let x = r.left + r.width / 2 - w / 2, y = r.top - hh - 8; if (y < 8) y = r.bottom + 8;
    tip.style.left = Math.max(8, Math.min(innerWidth - w - 8, x)) + "px"; tip.style.top = y + "px";
  }
  const hideTip = () => { tip.classList.remove("show"); tipFor = null; };
  document.addEventListener("pointerover", e => { const m = e.target.closest?.(".mark"); if (m) showTip(m); });
  document.addEventListener("pointerout", e => { const m = e.target.closest?.(".mark"); if (m && !m.contains(e.relatedTarget)) hideTip(); });
  document.addEventListener("focusin", e => { const m = e.target.closest?.(".mark"); if (m) showTip(m); });
  document.addEventListener("focusout", e => { if (e.target.closest?.(".mark")) hideTip(); });
  addEventListener("scroll", () => { if (tipFor) hideTip(); }, { passive: true });

  const R = {};

  /* Hình 1.4: cột nhóm thời hạn nộp BCTC */
  R.h14 = (d, w) => {
    const fs = FS(.6), H = Math.round(Math.max(300, Math.min(440, w * .52))), L = fs * 3.4, Rr = 8, Tp = fs * 1.6, B = fs * (w < 640 ? 4 : 2.6);
    const ymax = vn(d.y_max), y = lin(0, ymax, H - B, Tp), base = y(0), id = "h" + (++UID);
    let g = "";
    for (let t = 0; t <= ymax; t += 20) g += `<line class="grid" x1="${L}" x2="${w - Rr}" y1="${f1(y(t))}" y2="${f1(y(t))}"/>` + T(L - 8, y(t) + fs * .35, String(t), { a: "end", fs, cls: "muted" });
    g += `<text transform="translate(${f1(fs * .9)},${f1((Tp + base) / 2)}) rotate(-90)" text-anchor="middle" font-size="${fs}" class="muted">${esc(d.y_label)}</text>`;
    const gw = (w - L - Rr) / d.groups.length, bw = Math.min(gw * .24, 120);
    d.groups.forEach((grp, gi) => {
      const cx = L + gw * gi + gw / 2;
      grp.bars.forEach((b, bi) => {
        const x = cx + (bi - 1) * bw - bw / 2, v = vn(b.v), yt = y(v);
        const fill = b.key === "dn_special" ? `url(#${id})` : col(b.key);
        const lg = d.legend.find(l => l.key === b.key).label;
        g += mark(`<rect class="grow" x="${f1(x + 1)}" y="${f1(yt)}" width="${f1(bw - 2)}" height="${f1(base - yt)}" fill="${fill}" stroke="${b.key === "dn_special" ? col("dn") : "none"}"/>` + T(x + bw / 2, yt - 7, tw(b.v + " ngày", FS(.62), 1) > bw + 4 ? b.v : b.v + " ngày", { a: "middle", fs: FS(.62), w: 700 }),
          `${grp.label}\n${lg}: ${b.v} ngày`, [x, yt - fs * 1.4, bw, base - yt + fs * 1.4]);
      });
      wrap(grp.label, gw - 8, FS(.66)).forEach((ln, li) => { g += T(cx, base + fs * 1.7 + li * FS(.66) * 1.2, ln, { a: "middle", fs: FS(.66) }); });
    });
    g += `<line class="axis" x1="${L}" x2="${w - Rr}" y1="${f1(base)}" y2="${f1(base)}"/>`;
    const legend = `<div class="legend">${d.legend.map(l => `<span><i style="background:${l.key === "dn_special" ? `repeating-linear-gradient(45deg, ${col("dnSoft")} 0 3px, ${col("dn")} 3px 5px)` : col(l.key)}"></i>${esc(l.label)}</span>`).join("")}</div>`;
    return svg(w, H, g, hatch(id, col("dn"), col("dnSoft"))) + legend;
  };

  /* dòng thời gian văn bản pháp lý */
  const dt = s => { const [d, m, y] = s.split("/").map(Number); return y + (m - 1) / 12 + (d - 1) / 365; };
  R.timeline = d => {
    const docs = []; d.events.forEach(e => { let g = docs.find(x => x.doc === e.doc); if (!g) docs.push(g = { doc: e.doc, key: e.key, ev: [] }); g.ev.push(e); });
    const y0 = 2012, y1 = 2027, pos = t => ((t - y0) / (y1 - y0) * 100).toFixed(2) + "%";
    let ticks = ""; for (let t = 2013; t <= 2026; t++) ticks += `<span class="tl-tick${t % 2 ? "" : " minor"}" style="left:${pos(t)}"><i></i>${t % 2 ? t : ""}</span>`;
    const seg = docs.map((g, i) => { const a = dt(g.ev[0].date), b = dt(g.ev[g.ev.length - 1].date);
      return `<span class="tl-seg k-${g.key}" style="left:${pos(a)};width:calc(${pos(b)} - ${pos(a)} + 12px)"></span><span class="tl-lab k-${g.key}${i % 2 ? " lo" : ""}" style="left:${pos(a)}">${esc(g.doc.replace(/^Thông tư (\d+)\/(\d+)\/TT-BTC$/, "TT $1/$2"))}</span>`; }).join("");
    const cards = docs.map(g => `<li class="tl-card k-${g.key}"><h5>${esc(g.doc)}</h5><ul>${g.ev.map(e => `<li><span class="tl-date">${esc(e.date)}</span> ${esc(e.text)}</li>`).join("")}</ul></li>`).join("");
    return `<div class="tl-axis" aria-hidden="true"><div class="tl-line"></div>${ticks}${seg}</div><ol class="tl-cards">${cards}</ol>`;
  };

  /* Bảng 1.5: tài khoản chữ T */
  function renderT(host) {
    const d = VIZ.taccounts, fig = host.closest("figure"), tabsEl = $(".t-tabs", fig);
    tabsEl.innerHTML = d.ops.map((o, i) => `<button type="button" role="tab" id="tt-${i}" aria-controls="t-stage" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}">${esc(o.name)}</button>`).join("");
    host.id = "t-stage"; host.setAttribute("role", "tabpanel");
    const panel = (side, op) => {
      const acc = {}; const order = [];
      op[side].entries.forEach((e, k) => { [["dr", e.dr], ["cr", e.cr]].forEach(([s, a]) => { if (!acc[a]) { acc[a] = { dr: [], cr: [] }; order.push(a); } acc[a][s].push({ v: e.v, k }); }); });
      const title = side === "bq" ? "BQLDA (Thông tư 195)" : "Doanh nghiệp (Thông tư 200)";
      return `<div class="t-panel ${side}"><h5>${title}</h5><p class="t-note">${esc(op[side].note)}</p><div class="t-grid">${order.map(a => `<div class="tacc"><div class="tacc-h">${esc(a)}</div><div class="tacc-b"><div><span class="side-k">Nợ</span>${acc[a].dr.map(x => `<span class="t-amt new">${esc(x.v)}</span>`).join("")}</div><div><span class="side-k">Có</span>${acc[a].cr.map(x => `<span class="t-amt new">${esc(x.v)}</span>`).join("")}</div></div></div>`).join("")}</div></div>`;
    };
    const sel = i => { host.innerHTML = panel("bq", d.ops[i]) + panel("dn", d.ops[i]); host.setAttribute("aria-labelledby", "tt-" + i); };
    tabsEl.setAttribute("role", "tablist");
    tabs(tabsEl, sel); sel(0);
  }

  /* Bảng 2.2: cột chồng 100% */
  R.b22 = (d, w) => {
    const fs = FS(w < 620 ? .6 : .72), narrow = w < 620, Lc = narrow ? 0 : fs * 11, rowH = fs * (narrow ? 7 : 4.4), bh = fs * 1.9, Tp = 4, B = fs * 2.2;
    const H = Tp + d.bars.length * rowH + fs * 1.2 + B, x = lin(0, 100, Lc + 4, w - 8), id = "h" + (++UID), id2 = "h" + (++UID);
    let g = ""; [0, 25, 50, 75, 100].forEach(t => { g += `<line class="grid" x1="${f1(x(t))}" x2="${f1(x(t))}" y1="${Tp}" y2="${f1(H - B)}"/>` + T(x(t), H - B + fs * 1.4, t + "%", { a: "middle", fs, cls: "muted" }); });
    d.bars.forEach((b, i) => {
      const y0 = Tp + i * rowH + (i >= 2 ? fs * 1.2 : 0) + (narrow ? fs * 1.6 : fs * .5), unit = d.units[b.entity], ent = b.entity;
      g += narrow ? T(4, y0 - fs * .45, `${b.label} · ${b.side}`, { fs, w: 700 }) : T(Lc - 8, y0 + bh * .42, b.label, { a: "end", fs, w: 700 }) + T(Lc - 8, y0 + bh * .42 + fs * 1.15, b.side, { a: "end", fs, cls: "muted" });
      let acc = 0;
      b.parts.forEach((p, k) => {
        const pv = vn(p.pct), x0 = x(acc), x1 = x(acc + pv); acc += pv;
        const strong = k === b.parts.length - 1 || (b.side === "Tài sản" && k === 1);
        const fill = strong ? col(ent) : (ent === "bq" ? col("bqSoft") : col("dnSoft"));
        const inside = x1 - x0 > tw(p.pct, fs, 1) + 10;
        const tipTxt = `${b.label} · ${b.side}\n${p.label}: ${p.v} ${unit} (${p.pct})` + (p.inner ? `\n${p.inner.label}: ${p.inner.v} ${unit} (${p.inner.pct})` : "") + (b.total ? `\n${b.total.label}: ${b.total.v} ${unit}` : "");
        let inner = `<rect class="growx" x="${f1(x0)}" y="${f1(y0)}" width="${f1(x1 - x0)}" height="${f1(bh)}" fill="${fill}" stroke="${col(ent)}" stroke-width="1"/>`;
        inner += inside ? T((x0 + x1) / 2, y0 + bh / 2 + fs * .36, p.pct, { a: "middle", fs, w: 700, fill: strong ? onColor() : col("ink") }) : narrow ? T(x0, y0 + bh + fs * 1.65, p.pct, { fs, w: 700 }) : T(x1 + 4, y0 - 4, p.pct, { fs, w: 700 });
        if (p.inner) { const xi = x(acc - pv + vn(p.inner.pct)); inner += `<rect x="${f1(x0)}" y="${f1(y0 + bh + 3)}" width="${f1(xi - x0)}" height="5" fill="url(#${ent === "bq" ? id : id2})" stroke="${col(ent)}" stroke-width=".8"/>` + (() => { const lt = `${p.inner.label.replace("Trong đó: ", "trong đó ")} ${p.inner.pct}`, fi = Math.max(12, fs - 1), st = x0 + String(lt).length * fi * .58 <= w - 4; return T(st ? x0 : w - 4, y0 + bh + fs * (narrow ? 2.8 : 1.75), lt, { a: st ? "start" : "end", fs: fi, cls: "muted" }); })(); }
        g += mark(inner, tipTxt, [x0, y0 - 2, x1 - x0, bh + 4]);
      });
    });
    const legend = `<div class="legend"><span><i style="background:${col("bq")}"></i>BQLDA</span><span><i style="background:${col("dn")}"></i>Hòa Phát</span><span><i style="background:${col("bqSoft")}"></i>Tài sản ngắn hạn / Nợ phải trả</span><span><i style="background:repeating-linear-gradient(45deg, ${col("card")} 0 3px, ${col("ink2")} 3px 5px)"></i>Trong đó: xây dựng cơ bản dở dang</span></div>`;
    return svg(w, H, g, hatch(id, col("bq"), col("card")) + hatch(id2, col("dn"), col("card"))) + legend;
  };

  /* thác nước (B02-CĐT và lưu chuyển tiền tệ) */
  function waterfall(d, w) {
    const fs = FS(.58), L = fs * 3, Rr = 6, Tp = fs * 2, nL = Math.max(...d.steps.map(s => wrap(s.label, (w - L - Rr) / d.steps.length - 6, fs).length)), B = fs * (1.4 + nL * 1.2), H = Math.round(Math.max(300, Math.min(420, w * .62)) + B - fs * 3.4);
    const ent = d.entity; let run = 0; const pts = d.steps.map(s => { const v = vn(s.v); let a, b; if (s.type === "total") { a = 0; b = v; run = v; } else if (s.type === "up") { a = run; b = run + v; run = b; } else { a = run - v; b = run; run = a; } return { s, a, b }; });
    let lo = Math.min(0, ...pts.map(p => p.a)), hi = Math.max(...pts.map(p => p.b));
    const step = hi - lo > 120 ? 50 : 10; lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
    const y = lin(lo, hi, H - B, Tp), n = pts.length, sw = (w - L - Rr) / n, bw = Math.min(sw * .58, 110);
    let g = ""; for (let t = lo; t <= hi; t += step) g += `<line class="${t === 0 ? "axis" : "grid"}" x1="${L}" x2="${w - Rr}" y1="${f1(y(t))}" y2="${f1(y(t))}"/>` + T(L - 6, y(t) + fs * .35, toVN(t, 0), { a: "end", fs, cls: "muted" });
    pts.forEach((p, i) => {
      const cx = L + sw * i + sw / 2, x0 = cx - bw / 2, ya = y(p.b), yb = y(p.a), up = p.s.type === "up", down = p.s.type === "down";
      const fill = p.s.type === "total" ? col(ent) : up ? (ent === "bq" ? col("bqMid") : col("dnMid")) : `url(#wfd${UID})`;
      const lab = p.s.shown || (down ? "−" + p.s.v : up ? "+" + p.s.v : p.s.v);
      g += mark(`<rect class="grow" x="${f1(x0)}" y="${f1(ya)}" width="${f1(bw)}" height="${f1(Math.max(2, yb - ya))}" fill="${fill}" stroke="${col(ent)}" stroke-width="1"/>` + T(cx, (down ? yb + fs * 1.25 : ya - 6), lab, { a: "middle", fs: FS(.62), w: 700, cls: "mono" }),
        `${p.s.label}: ${lab} ${d.unit}` + (p.s.detail ? `\n(${p.s.detail})` : ""), [x0 - 4, ya - fs * 1.4, bw + 8, yb - ya + fs * 2.8]);
      const lines = wrap(p.s.label, sw - 6, fs);
      lines.forEach((l, k) => { g += T(cx, H - B + fs * (1.4 + k * 1.2), l, { a: "middle", fs, cls: "muted" }); });
      if (i < n - 1) { const nx = L + sw * (i + 1) + sw / 2 - bw / 2, yy = y(p.s.type === "down" ? p.a : p.b); g += `<line x1="${f1(x0 + bw)}" x2="${f1(nx)}" y1="${f1(yy)}" y2="${f1(yy)}" stroke="${col("ink2")}" stroke-dasharray="3 3"/>`; }
    });
    const defs = `<pattern id="wfd${UID}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="${col("card")}"/><line x1="2" y1="0" x2="2" y2="8" stroke="${col("ink2")}" stroke-width="2"/></pattern>`;
    return svg(w, H, g, defs) + (d.note ? `<p class="unit">${esc(d.note)}</p>` : "");
  }
  function wrap(s, maxW, fs) { const out = []; let cur = ""; String(s).split(" ").forEach(wd => { const t = cur ? cur + " " + wd : wd; if (cur && tw(t, fs) > maxW) { out.push(cur); cur = wd; } else cur = t; }); if (cur) out.push(cur); return out; }
  R.wf_b02 = (d, w) => { UID++; return waterfall(d, w); };
  R.wf_cash = (d, w) => { UID++; return waterfall(d, w); };

  /* F02: hai nguồn hình thành */
  R.f02 = (d, w) => {
    const fs = FS(.6), nar = w < 640, bh = fs * 2.4, H = bh + fs * (nar ? 6.4 : 5), x = lin(0, 100, 2, w - 2);
    let acc = 0, g = "";
    d.parts.forEach((p, k) => {
      const pv = vn(p.pct), x0 = x(acc), x1 = x(acc + pv); acc += pv;
      const fill = k ? col("bqMid") : col("bq");
      g += mark(`<rect class="growx" x="${f1(x0)}" y="${fs * 2.2}" width="${f1(x1 - x0 - 2)}" height="${f1(bh)}" fill="${fill}"/>` + T(x0 + 10, fs * 2.2 + bh / 2 + fs * .4, `${p.v} · ${p.pct}`, { fs: FS(.66), w: 700, cls: "mono", fill: k ? col("ink") : onColor() }) + T(k ? x1 - 2 : x0, k && nar ? fs * 2.2 + bh + fs * 1.4 : fs * 1.4, p.label, { a: k ? "end" : "start", fs, w: 600 }),
        `${p.label}\n${p.v} ${d.unit} (${p.pct})`, [x0, fs * .3, x1 - x0, bh + fs * 2]);
    });
    g += T(w - 2, fs * 2.2 + bh + fs * (nar ? 3 : 1.6), `${d.total.label}: ${d.total.v} ${d.unit}`, { a: "end", fs, cls: "muted" });
    return svg(w, H, g);
  };

  /* cột ngang có % in sẵn (Bảng 2.8, 2.9) */
  function hbars(d, w, ent) {
    const fs = FS(.6), narrow = w < 640, Lc = narrow ? 0 : Math.min(w * .38, fs * 17), rowH = fs * (narrow ? 3.4 : 2.3), bh = fs * 1.25;
    const labs = d.rows.map(r => narrow ? wrap(r.label, w - 6, fs) : [r.label]), offs = []; let yo = 0;
    labs.forEach(l => { offs.push(yo + (narrow ? fs * (.3 + l.length * 1.2) : fs * .5)); yo += rowH + (narrow ? (l.length - 1) * fs * 1.2 : 0); });
    const H = yo + fs * 2.8, max = Math.max(...d.rows.map(r => vn(r.v) || 0)), lwMax = Math.max(...d.rows.map(r => tw(`${r.v} · ${r.pct}`, fs, 1))), x = lin(0, max, Lc + 2, w - lwMax - 12);
    let g = "";
    d.rows.forEach((r, i) => {
      const y0 = offs[i], v = vn(r.v);
      g += narrow ? labs[i].map((l, k) => T(2, y0 - fs * .35 - (labs[i].length - 1 - k) * fs * 1.2, l, { fs })).join("") : wrap(r.label, Lc - 12, fs).slice(0, 2).map((l, k, arr) => T(Lc - 10, y0 + bh / 2 + fs * .35 + (k - (arr.length - 1) / 2) * fs * 1.1, l, { a: "end", fs })).join("");
      if (v == null) { g += T(Lc + 6, y0 + bh / 2 + fs * .35, "– (đã bàn giao)", { fs, cls: "muted" }); return; }
      const xe = x(v);
      g += mark(`<rect class="growx" x="${f1(Lc + 2)}" y="${f1(y0)}" width="${f1(xe - Lc - 2)}" height="${f1(bh)}" fill="${col(ent)}"/>` + T(xe + 6, y0 + bh / 2 + fs * .35, `${r.v} · ${r.pct}`, { fs, w: 700, cls: "mono" }),
        `${r.label}\n${r.v} ${d.unit} (${r.pct} số dư cuối năm)`, [Lc, y0 - 3, w - Lc - 2, bh + 6]);
    });
    g += `<line class="axis" x1="${f1(Lc + 2)}" x2="${f1(Lc + 2)}" y1="0" y2="${f1(H - fs * 2.2)}"/>` + T(w - 4, H - fs * .6, `${d.total.label}: ${d.total.v} ${d.unit} (${d.total.pct})`, { a: "end", fs, cls: "muted" });
    return svg(w, H, g);
  }
  R.b28 = (d, w) => hbars(d, w, "bq");
  R.b29 = (d, w) => hbars(d, w, "bq");

  /* Bảng 2.10: 11 khoản, 2015 so với 2014 */
  R.b210 = (d, w) => {
    const fs = FS(.56), narrow = w < 640, Lc = narrow ? 0 : Math.min(w * .42, fs * 19), bh = fs * .95, rowH = bh * 2 + fs * (narrow ? 2.6 : 1.1);
    const labs = d.rows.map(r => narrow ? wrap(r.label, w - 6, Math.max(12, fs)) : [r.label]), offs = []; let yo = 0;
    labs.forEach(l => { offs.push(yo + (narrow ? fs * (.2 + l.length * 1.2) : fs * .3)); yo += rowH + (narrow ? (l.length - 1) * fs * 1.25 : 0); });
    const H = yo + fs * 2.6, x = lin(0, 1100, Lc + 2, w - fs * 4.5), id = "h" + (++UID);
    let g = ""; [0, 250, 500, 750, 1000].forEach(t => { g += `<line class="grid" x1="${f1(x(t))}" x2="${f1(x(t))}" y1="0" y2="${f1(H - fs * 2)}"/>` + T(x(t), H - fs * .6, toVN(t, 0), { a: "middle", fs, cls: "muted" }); });
    d.rows.forEach((r, i) => {
      const y0 = offs[i];
      g += narrow ? labs[i].map((l, k) => T(2, y0 - fs * .3 - (labs[i].length - 1 - k) * Math.max(12, fs) * 1.2, l, { fs: Math.max(12, fs) })).join("") : wrap(r.label, Lc - 12, fs).slice(0, 2).map((l, k, arr) => T(Lc - 10, y0 + bh + fs * .35 + (k - (arr.length - 1) / 2) * fs * 1.1, l, { a: "end", fs })).join("");
      r.v.forEach((v, k) => {
        const yy = y0 + k * (bh + 2), xe = x(vn(v));
        g += mark(`<rect class="growx" x="${f1(Lc + 2)}" y="${f1(yy)}" width="${f1(xe - Lc - 2)}" height="${f1(bh)}" fill="${k ? `url(#${id})` : col("bq")}" stroke="${col("bq")}" stroke-width=".8"/>` + T(xe + 5, yy + bh * .82, v, { fs: Math.max(12, fs - 1), cls: "mono", w: k ? 400 : 700 }),
          `${r.label}\n${d.years[k]}: ${v} ${d.unit}`, [Lc, yy - 1, w - Lc - 2, bh + 2]);
      });
    });
    const legend = `<div class="legend"><span><i style="background:${col("bq")}"></i>${esc(d.years[0])}</span><span><i style="background:repeating-linear-gradient(45deg, ${col("bqSoft")} 0 3px, ${col("bq")} 3px 5px)"></i>${esc(d.years[1])}</span><span>${esc(d.total.label)}: ${esc(d.total.v[0])} / ${esc(d.total.v[1])} ${esc(d.unit)}</span></div>`;
    return svg(w, H, g, hatch(id, col("bq"), col("bqSoft"))) + legend;
  };

  /* Mục 2.6: thời hạn nộp BCTC năm */
  R.deadline = (d, w) => {
    const fs = FS(.6), rowH = fs * 5.2, Lc = w < 640 ? 0 : fs * 11, H = d.rows.length * rowH + fs * 2.4, max = vn(d.max_days), x = lin(0, max, Lc + 6, w - fs * 1.5);
    let g = ""; [0, 30, 60, 90].forEach(t => { g += `<line class="grid" x1="${f1(x(t))}" x2="${f1(x(t))}" y1="0" y2="${f1(H - fs * 2)}"/>` + T(x(t), H - fs * .6, t + " ngày", { a: "middle", fs, cls: "muted" }); });
    d.rows.forEach((r, i) => {
      const y0 = i * rowH + fs * 2.2, ent = r.entity, lim = vn(r.limit);
      const days = r.days ? vn(r.days) : (dt(r.date) - dt(r.period_end)) * 365;   // vị trí vẽ; chỉ hiển thị số ngày khi bài có ghi
      g += Lc ? T(Lc - 8, y0 + fs * .9, r.label, { a: "end", fs, w: 700 }) : T(2, y0 - fs * .7, r.label + " · hạn " + r.limit + " ngày", { fs, w: 700 });
      g += `<rect x="${f1(x(0))}" y="${f1(y0)}" width="${f1(x(lim) - x(0))}" height="${f1(fs * 1.3)}" fill="${ent === "bq" ? col("bqSoft") : col("dnSoft")}" stroke="${col(ent)}" stroke-dasharray="4 3"/>` + (Lc ? T(x(lim) - 4, y0 - 5, "hạn " + r.limit + " ngày", { a: "end", fs: Math.max(12, fs - 1), cls: "muted" }) : "");
      g += mark(`<rect class="growx" x="${f1(x(0))}" y="${f1(y0 + fs * .25)}" width="${f1(x(days) - x(0))}" height="${f1(fs * .8)}" fill="${col(ent)}"/><circle cx="${f1(x(days))}" cy="${f1(y0 + fs * .65)}" r="7" fill="${col(ent)}" stroke="${col("card")}" stroke-width="2"/>` +
        T(x(days) + (ent === "bq" ? 12 : -12), y0 + fs * 2.6, r.date + (r.days ? ` · ${r.days} ngày` : ""), { a: ent === "bq" ? "start" : "end", fs, w: 700, cls: "mono" }),
        `${r.label}\n${r.shown}`, [x(0), y0 - 4, x(Math.max(days, lim)) - x(0) + 10, fs * 3]);
    });
    return svg(w, H, g);
  };

  /* ---------- vẽ & vẽ lại ---------- */
  const hosts = $$("[data-chart]");
  const lastW = new Map();
  function draw(host, force) {
    const k = host.dataset.chart; if (k === "taccounts") return;
    const w = Math.round(host.clientWidth); if (!w || (!force && lastW.get(host) === w)) return; lastW.set(host, w);
    host.innerHTML = R[k](VIZ[k], w);
    if (!REDUCE && !host.dataset.drawn) { host.classList.add("armed"); }
  }
  function redrawAll() { hosts.forEach(h => draw(h, true)); }
  hosts.forEach(h => { if (h.dataset.chart === "taccounts") renderT(h); else draw(h); });
  let rT; addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(() => hosts.forEach(h => draw(h)), 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => redrawAll());
  // cột mọc khi cuộn tới (một lần)
  const gio = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.dataset.drawn = "1"; en.target.classList.remove("armed"); en.target.classList.add("drawn"); gio.unobserve(en.target); } }), { threshold: .25 });
  hosts.forEach(h => REDUCE ? 0 : gio.observe(h));
})();
