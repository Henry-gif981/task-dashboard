/* =========================================================
   Trang trình bày – điều hướng, trình chiếu, hình tương tác,
   biểu đồ SVG tự vẽ. Số liệu biểu đồ: window.VIZ (bản sao của
   viz_data.json). Số được ghi kiểu Việt Nam và đọc bằng vn().
   Mọi phần tử do tệp này thêm vào chỉ là trang trí / nhãn giao
   diện và được gắn data-ui (không mang nội dung của bài).
   ========================================================= */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const Q = new URLSearchParams(location.search);
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches || (function () { try { return localStorage.getItem("kt-reading") === "1"; } catch (e) { return false; } })() || /[?&]reading/.test(location.search);
  const TOUCH = matchMedia("(pointer: coarse)").matches;
  const VIZ = window.VIZ || {};
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const icon = (id, cls = "ic") => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;

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

  /* ---------- bìa / hero: từ cấu hình window.COVER ---------- */
  const C = window.COVER || {};
  $$("[data-cover]").forEach(el => { const v = C[el.dataset.cover]; el.textContent = v || ""; });
  const lect = $('[data-row="lecturer"]'); if (lect && !(C.lecturer || "").trim()) lect.hidden = true;
  const hero = $(".hero");
  // tiêu đề hiện từng dòng (mask reveal): tách theo dòng hiển thị thật, chữ giữ nguyên
  function splitLines(el) {
    const text = el.textContent; el.textContent = "";
    const words = text.split(" "); const spans = words.map((w, i) => { const s = document.createElement("span"); s.textContent = w + (i < words.length - 1 ? " " : ""); el.appendChild(s); return s; });
    const lines = []; let top = null;
    spans.forEach(s => { const t = s.offsetTop; if (top === null || Math.abs(t - top) > 4) { lines.push([]); top = t; } lines[lines.length - 1].push(s.textContent); });
    el.innerHTML = lines.map((l, i) => `<span class="ln"><span style="transition-delay:${200 + i * 90}ms">${esc(l.join(""))}</span></span>`).join("");
  }
  const topic = $(".cover-topic");
  const splitDone = (topic && !REDUCE) ? (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => splitLines(topic)) : Promise.resolve();
  $$(".hero .cover-uni, .hero .cover-subject, .hero .cover-topic-label, .hero .cover-foot").forEach((el, i) => { el.classList.add("reveal-up"); el.style.transitionDelay = (120 + i * 80) + "ms"; });

  /* ---------- ghi nhớ (localStorage, bọc try/catch) ---------- */
  function storeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function storeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  /* ---------- Chế độ đọc + cỡ chữ A−/A+ ---------- */
  const FZ = [.9, 1, 1.1, 1.2, 1.3];
  let fzI = Math.max(0, FZ.indexOf(+(storeGet("kt-fz") || 1))); if (fzI < 0) fzI = 1;
  const setFz = i => { fzI = Math.max(0, Math.min(FZ.length - 1, i)); document.documentElement.style.setProperty("--fz-user", FZ[fzI]); storeSet("kt-fz", FZ[fzI]); };
  setFz(fzI);
  let READING = storeGet("kt-reading") === "1" || Q.has("reading");
  document.documentElement.classList.toggle("reading", READING);

  /* ---------- màn mở đầu 1,5 giây ---------- */
  const intro = $("#intro");
  function heroReady() { splitDone.then(() => requestAnimationFrame(() => requestAnimationFrame(() => hero && hero.classList.add("ready")))); }
  function endIntro() { if (!intro || intro.classList.contains("done")) return; intro.classList.add("done"); setTimeout(() => { intro.hidden = true; }, 500); heroReady(); }
  if (intro) {
    const skip = Q.has("nointro") || REDUCE || READING || storeGet("kt-intro");
    if (skip) { intro.hidden = true; requestAnimationFrame(heroReady); }
    else {
      intro.classList.add("play"); $(".intro-skip", intro).tabIndex = 0;
      $(".intro-skip", intro).addEventListener("click", endIntro);
      addEventListener("keydown", function k(e) { if (!intro.classList.contains("done")) { endIntro(); removeEventListener("keydown", k); } });
      setTimeout(endIntro, 1500);
      storeSet("kt-intro", "1");
    }
  }


  /* ---------- slide: tông màu, mốc số mục bên lề ---------- */
  const slides = $$("main > .slide");
  const DN_SLIDES = ["muc-1-2-3"];
  slides.forEach(s => {
    if (DN_SLIDES.includes(s.id)) s.classList.add("t-dn");
    s.dataset.tone = s.classList.contains("t-dn") ? "dn" : ($(".cmp, .fig-pair, .vat-flow, .split-fig", s) || s.classList.contains("ch-2")) ? "mix" : "bq";
  });
  // chương chứa slide
  let ch = ""; const chOf = new Map();
  slides.forEach(s => { if (s.classList.contains("chapter")) ch = s.dataset.nav; if (["ket-luan", "phu-luc", "bia", "muc-luc", "mo-dau"].includes(s.id)) ch = ""; chOf.set(s, ch); });
  // số mục: lấy từ tên mục bắt đầu bằng số (1.2.4 …); trang "Bảng x.x / Hình x.x" dùng số của mục đang đứng trước
  const SEC = new Map(); { let last = ""; slides.forEach(s => { const nav = s.dataset.nav || ""; const m = nav.match(/^(\d+(?:\.\d+)+)/); if (m) last = m[1]; if (s.classList.contains("chapter") || ["bia", "muc-luc", "mo-dau", "ket-luan", "phu-luc", "chuong-1-mo"].includes(s.id) || /^Tóm tắt/.test(nav)) { if (!m) { SEC.set(s, ""); if (s.classList.contains("chapter")) last = ""; return; } } SEC.set(s, m ? m[1] : last); }); }
  const secNo = s => SEC.get(s) || "";
  slides.forEach(s => {
    if (s.classList.contains("chapter") || s.classList.contains("hero")) return;
    const n = secNo(s); if (!n) return;
    const mk = document.createElement("div"); mk.className = "sec-mark"; mk.setAttribute("aria-hidden", "true"); mk.dataset.ui = "";
    mk.dataset.n = n; mk.dataset.c = chOf.get(s) || ""; mk.innerHTML = "<i></i>";   // chữ hiển thị bằng CSS (attr), không chen vào nội dung
    s.prepend(mk);
  });
  // tiêu đề quá dài: cỡ chữ nhỏ hơn một bậc
  $$(".h-sec").forEach(h => { if (h.textContent.trim().length > 70) h.classList.add("long"); });
  // trang bìa chương: dòng nhãn + danh sách mục con (nhãn giao diện, lấy từ tên mục)
  $$(".chapter").forEach(cs => {
    const n = (cs.id.match(/\d+/) || [""])[0];
    const kick = document.createElement("p"); kick.className = "ch-kicker"; kick.dataset.ui = ""; kick.setAttribute("aria-hidden", "true"); kick.dataset.t = "Chương " + n;
    $(".h-chapter", cs).before(kick);
    const subs = slides.filter(s => new RegExp("^muc-" + n + "-\\d+$").test(s.id));
    if (subs.length) {
      const ul = document.createElement("ol"); ul.className = "ch-subs"; ul.dataset.ui = ""; ul.setAttribute("aria-label", "Các mục của chương");
      ul.innerHTML = subs.map(s => { const t = s.dataset.nav || ""; const k = t.split(" ")[0]; return `<li><b>${esc(s.id.replace("muc-", "").replace(/-/g, "."))}</b><a href="#${s.id}">${esc(t.slice(k.length).trim())}</a></li>`; }).join("");
      $(".wrap", cs).append(ul);
    }
    if (!REDUCE) cs.classList.add("clip");
  });

  /* ---------- thanh điều hướng "mục lục sổ cái" ---------- */
  const nav = $("#side-nav");
  if (nav) {
    nav.innerHTML = slides.map(s => {
      const grp = s.classList.contains("chapter") || ["bia", "muc-luc", "mo-dau", "ket-luan", "phu-luc"].includes(s.id);
      const cls = [grp ? "grp" : "", s.classList.contains("chapter") ? "ch" : "", "t-" + s.dataset.tone].join(" ").trim();
      const nv = s.dataset.nav || s.id, m = nv.match(/^(\d+(?:\.\d+)+)\s+(.*)$/);
      return `<li class="${cls}"><a href="#${s.id}">${m ? `<span class="nn">${esc(m[1])}</span><span>${esc(m[2])}</span>` : `<span>${esc(nv)}</span>`}</a></li>`;
    }).join("");
    nav.addEventListener("click", e => { if (e.target.closest("a")) { document.body.classList.remove("menu-open"); $("#btn-menu")?.setAttribute("aria-expanded", "false"); } });
  }
  const side = $("#side");
  if (side) {
    const st = document.createElement("div"); st.className = "side-tools"; st.dataset.ui = "";
    st.innerHTML = `<a href="#muc-luc" class="to-toc">Về mục lục</a><button type="button" id="btn-reading" aria-pressed="${READING}">Chế độ đọc</button><button type="button" class="fz" id="fz-dn" aria-label="Giảm cỡ chữ">A−</button><button type="button" class="fz" id="fz-up" aria-label="Tăng cỡ chữ">A+</button>`;
    $(".side-brand", side).after(st);
    $(".to-toc", st).addEventListener("click", () => document.body.classList.remove("menu-open"));
    $("#btn-reading", st).addEventListener("click", e => { READING = !READING; document.documentElement.classList.toggle("reading", READING); e.currentTarget.setAttribute("aria-pressed", String(READING)); storeSet("kt-reading", READING ? "1" : "0"); window.dispatchEvent(new CustomEvent("kt-reading", { detail: READING })); if (READING) { revealables.forEach(el => el.classList.add("in")); finishCounts(); } setTimeout(redrawAll, 60); });
    $("#fz-dn", st).addEventListener("click", () => { setFz(fzI - 1); setTimeout(redrawAll, 60); });
    $("#fz-up", st).addEventListener("click", () => { setFz(fzI + 1); setTimeout(redrawAll, 60); });
  }
  const navLinks = nav ? $$("a", nav) : [];
  const bar = $(".progress"), where = $(".where"), whereSec = $(".where-sec"), whereCh = $(".where-ch");
  function current() { const mid = innerHeight * .35; let cur = 0; slides.forEach((s, i) => { if (s.getBoundingClientRect().top <= mid) cur = i; }); return cur; }
  let lastCur = -1;
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.width = (max > 0 ? Math.min(100, scrollY / max * 100) : 0) + "%";
    const c = current();
    if (c !== lastCur) {
      lastCur = c;
      navLinks.forEach((a, i) => { a.setAttribute("aria-current", i === c ? "true" : "false"); a.parentElement.classList.toggle("seen", i < c); });
      const a = navLinks[c]; if (a && nav) { const r = a.getBoundingClientRect(), nr = nav.parentElement.getBoundingClientRect(); if (r.top < nr.top + 60 || r.bottom > nr.bottom - 60) a.scrollIntoView({ block: "center" }); }
      const s = slides[c];
      document.body.classList.toggle("on-dark", s.classList.contains("hero") || (s.classList.contains("chapter") && !s.classList.contains("ch-3")));
      if (where) {
        const lab = secNo(s) || (s.classList.contains("hero") ? "" : (s.dataset.nav || ""));
        whereSec.textContent = lab; whereCh.textContent = chOf.get(s) && chOf.get(s) !== s.dataset.nav ? "/ " + chOf.get(s) : "";
        where.classList.toggle("show", !!lab && !s.classList.contains("hero"));
      }
    }
  }
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); onScroll();

  /* ---------- công cụ: menu, trình chiếu, sáng/tối ---------- */
  $("#btn-menu")?.addEventListener("click", () => { const o = document.body.classList.toggle("menu-open"); $("#btn-menu").setAttribute("aria-expanded", String(o)); });
  const presentBtn = $("#btn-present");
  function setPresent(on) { document.body.classList.toggle("present", on); presentBtn?.setAttribute("aria-pressed", String(on)); setTimeout(() => { hosts && hosts.forEach(h => draw(h)); }, 450); }
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
    if (lb.classList.contains("open")) { lbKey(e); return; }
    if (e.target.closest && e.target.closest('[role="tablist"]') && ["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    if (e.key === " " && stepSpace(e)) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); go(1); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(-1); }
    else if (e.key === "f" || e.key === "F") { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {}); else document.exitFullscreen?.(); }
    else if (e.key === "Escape") { if (document.body.classList.contains("present")) setPresent(false); document.body.classList.remove("menu-open"); }
  });
  document.addEventListener("fullscreenchange", () => setPresent(!!document.fullscreenElement));

  /* ---------- hiện dần khi cuộn: một bảng thời gian chung ---------- */
  const revealables = $$(".slide:not(.hero) .wrap > *:not(.ch-no)");
  revealables.forEach(el => { el.classList.add("rv"); const sib = [...el.parentElement.children].indexOf(el); el.style.setProperty("--i", Math.min(sib, 8)); });
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: .06 });
  revealables.forEach(el => REDUCE ? el.classList.add("in") : io.observe(el));
  const cio2 = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); cio2.unobserve(en.target); } }), { threshold: .2 });
  $$(".chapter.clip").forEach(c => cio2.observe(c));
  // parallax nhẹ: số chương cực lớn
  const pars = $$(".chapter .ch-no");
  if (false && pars.length) {   // không parallax trên chữ (yêu cầu khả năng đọc)
    let tk = false;
    addEventListener("scroll", () => { if (tk) return; tk = true; requestAnimationFrame(() => { tk = false; pars.forEach(p => { const r = p.parentElement.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; p.style.setProperty("--py", (r.top * -.18).toFixed(1) + "px"); }); }); }, { passive: true });
  }

  /* ---------- "Xem chi tiết": mở hết khi in ---------- */
  let closedDetails = [];
  addEventListener("beforeprint", () => { $$("img[loading=lazy]").forEach(i => i.loading = "eager"); closedDetails = $$("details:not([open])"); closedDetails.forEach(d => d.open = true); revealables.forEach(el => el.classList.add("in")); finishCounts(); heroReady(); });
  addEventListener("afterprint", () => { closedDetails.forEach(d => d.open = false); });

  /* ---------- tab dùng chung ---------- */
  function tabs(list, onChange) {
    const btns = $$('[role="tab"]', list);
    const sel = i => { btns.forEach((b, j) => { b.setAttribute("aria-selected", String(i === j)); b.tabIndex = i === j ? 0 : -1; const p = document.getElementById(b.getAttribute("aria-controls")); if (p) { p.hidden = i !== j; if (i === j && !REDUCE) { p.classList.remove("anim"); void p.offsetWidth; p.classList.add("anim"); } } }); onChange && onChange(i); };
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
  /* Hình 1.1: chevron + đường sáng chạy theo giai đoạn */
  $$(".cycle-steps").forEach(l => {
    const rail = document.createElement("span"); rail.className = "cycle-rail"; rail.dataset.ui = ""; rail.setAttribute("aria-hidden", "true"); rail.innerHTML = "<i></i>"; l.append(rail);
    tabs(l, i => { $("i", rail).style.transform = `translateX(${i * 100}%)`; });
  });

  /* ---------- Hình 1.2: cây A/B/C, đường nối vẽ dần, nhánh chọn nổi lên ---------- */
  $$(".fig.tree").forEach(tree => {
    const lines = $(".tree-lines", tree), brs = $$(".branch", tree);
    function drawLines() {
      if (!lines || getComputedStyle(lines).display === "none") return;
      const W = lines.clientWidth, H = lines.clientHeight, lr = lines.getBoundingClientRect();
      const xs = brs.map(b => { const r = b.getBoundingClientRect(); return r.left + r.width / 2 - lr.left; });
      const sel = brs.findIndex(b => b.classList.contains("sel"));
      lines.querySelector("svg")?.remove();
      lines.insertAdjacentHTML("beforeend", `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${xs.map((x, i) => `<path class="${i === sel ? "on" : ""}" style="stroke:${["var(--bq-fill)", "var(--green)", "var(--dn-fill)"][i]}" d="M${W / 2} 0 V${H * .45} H${x.toFixed(1)} V${H}"/>`).join("")}</svg>`);
    }
    drawLines(); addEventListener("resize", drawLines);
    new IntersectionObserver((es, o) => es.forEach(en => { if (en.isIntersecting) { tree.classList.add("drawn"); o.disconnect(); } }), { threshold: .3 }).observe(tree);
    if (REDUCE) tree.classList.add("drawn");
    brs.forEach(br => {
      const h = $(".br-head", br);
      br.classList.add("closed"); h.setAttribute("aria-expanded", "false");
      h.addEventListener("click", () => {
        const open = br.classList.toggle("closed") === false; h.setAttribute("aria-expanded", String(open));
        brs.forEach(b => b.classList.toggle("sel", b === br && open));
        tree.classList.toggle("focus", open);
        drawLines();
      });
    });
  });

  /* ---------- Hình 1.3: chạy từng bước (nút lớn + phím Space) ---------- */
  const steppers = [];
  $$("[data-stepper]").forEach(st => {
    const fig = st.closest("figure"), rows = $$(".flow-row", fig), list = $(".flow-steps", fig); let n = 1;
    st.dataset.ui = "";
    st.innerHTML = `<button type="button" class="btn ghost" data-a="prev">Bước trước</button><button type="button" class="btn" data-a="next">Bước tiếp</button><button type="button" class="btn ghost" data-a="all">Hiện tất cả</button><span class="hint" aria-hidden="true">Space</span><span class="sr-only" aria-live="polite"></span>`;
    const live = $(".sr-only", st), prev = $('[data-a="prev"]', st), next = $('[data-a="next"]', st);
    const paint = () => { rows.forEach((r, i) => { r.classList.toggle("pending", i >= n); r.classList.toggle("now", i === n - 1); }); prev.disabled = n <= 1; next.disabled = n >= rows.length; live.textContent = `Bước ${n} / ${rows.length}`; list.style.setProperty("--fp", (n / rows.length * 100) + "%"); };
    st.addEventListener("click", e => { const a = e.target.closest("button")?.dataset.a; if (!a) return; n = a === "next" ? Math.min(rows.length, n + 1) : a === "prev" ? Math.max(1, n - 1) : rows.length; paint(); });
    paint();
    steppers.push({ fig, step: () => { if (n >= rows.length) return false; n++; paint(); return true; } });
  });
  function stepSpace(e) {
    const tag = (e.target.tagName || "").toLowerCase(); if (tag === "button" || tag === "summary" || tag === "a") return false;
    for (const s of steppers) { const r = s.fig.getBoundingClientRect(); if (r.top < innerHeight * .7 && r.bottom > innerHeight * .3) { if (s.step()) { e.preventDefault(); return true; } } }
    return false;
  }

  /* ---------- bảng: nhãn cột cho dạng thẻ, ghim hàng ---------- */
  $$("figure.tbl").forEach(fig => {
    const table = $("table", fig); if (!table) return;
    if ($(".numtbl", fig)) fig.classList.add("numfig");
    const heads = $$("thead th", table).map(th => th.textContent.trim());
    $$("tbody tr", table).forEach(tr => {
      [...tr.children].forEach((c, i) => { if (c.tagName === "TD" && heads[i]) c.dataset.label = heads[i]; });
      const th = $("th", tr); if (!th || tr.classList.contains("total")) return;
      const b = document.createElement("button"); b.type = "button"; b.className = "pin"; b.dataset.ui = ""; b.setAttribute("aria-label", "Ghim hàng"); b.setAttribute("aria-pressed", "false"); b.innerHTML = icon("pin");
      b.addEventListener("click", () => { const on = tr.classList.toggle("pinned"); b.setAttribute("aria-pressed", String(on)); });
      th.prepend(b);
    });
  });

  /* ---------- bảng so sánh: lọc tiêu chí + công tắc cột ---------- */
  $$("figure.cmp").forEach((fig, k) => {
    const table = $("table", fig), ths = $$("thead th", table);
    const headA = $("thead th.c-a", table).textContent, headB = $("thead th.c-b", table).textContent;
    const short = t => t.replace(/\s*\(.*\)\s*$/, "").trim();
    const rows = $$("tbody tr", table);
    const ctl = document.createElement("div"); ctl.className = "cmp-ctl"; ctl.dataset.ui = "";
    const order = ths[1].classList.contains("c-a") ? ["a", "b"] : ["b", "a"];
    const lab = { a: short(headA), b: short(headB) };
    ctl.innerHTML = `<div class="seg" role="group" aria-label="Chế độ xem bảng"><button type="button" aria-pressed="true" data-v="both">So sánh</button>${order.map(x => `<button type="button" class="s${x}" aria-pressed="false" data-v="${x}">Chỉ xem ${esc(lab[x])}</button>`).join("")}</div>` +
      `<label>Tiêu chí <select aria-label="Lọc theo tiêu chí"><option value="">Tất cả</option>${rows.map((r, i) => `<option value="${i}">${esc($("th", r).textContent.trim())}</option>`).join("")}</select></label>`;
    fig.insertBefore(ctl, $(".tbl-scroll", fig));
    ctl.addEventListener("click", e => { const b = e.target.closest("button[data-v]"); if (!b) return; $$("button", ctl).forEach(x => x.setAttribute("aria-pressed", String(x === b))); fig.classList.toggle("only-a", b.dataset.v === "a"); fig.classList.toggle("only-b", b.dataset.v === "b"); });
    $("select", ctl).addEventListener("change", e => { const v = e.target.value; rows.forEach((r, i) => r.classList.toggle("dim", v !== "" && String(i) !== v)); });
  });

  /* ---------- lightbox "Chứng từ gốc": phóng bằng lăn chuột, kéo thả ---------- */
  const lb = document.createElement("div");
  lb.className = "lightbox"; lb.dataset.ui = ""; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Ảnh chứng từ phóng to");
  lb.innerHTML = `<button type="button" class="lb-close">Đóng (Esc)</button><div class="lb-stage"><img alt="" draggable="false"></div><div class="lb-bar"><p class="lb-cap"></p><span class="lb-zoom" aria-live="polite"></span><div class="lb-btns"><button type="button" data-z="out" aria-label="Thu nhỏ">−</button><button type="button" data-z="fit">Vừa khung</button><button type="button" data-z="in" aria-label="Phóng to">+</button></div></div>`;
  document.body.appendChild(lb);
  const stage = $(".lb-stage", lb), lbImg = $("img", lb), zoomLab = $(".lb-zoom", lb);
  let lbReturn = null, Z = { s: 1, x: 0, y: 0, fit: 1 };
  function applyZ() { lbImg.style.transform = `translate(${Z.x}px, ${Z.y}px) scale(${Z.s})`; zoomLab.textContent = Math.round(Z.s / Z.fit * 100) + "%"; }
  function fitZ() {
    const W = stage.clientWidth, H = stage.clientHeight, iw = lbImg.naturalWidth || 800, ih = lbImg.naturalHeight || 600;
    Z.fit = Math.min((W - 48) / iw, (H - 48) / ih, 3); Z.s = Z.fit; Z.x = -iw * Z.s / 2; Z.y = -ih * Z.s / 2; applyZ();
  }
  function zoomAt(f, cx, cy) {
    const r = stage.getBoundingClientRect(); cx = cx == null ? r.width / 2 : cx - r.left; cy = cy == null ? r.height / 2 : cy - r.top;
    const ns = Math.max(Z.fit * .5, Math.min(Z.fit * 8, Z.s * f)), k = ns / Z.s;
    const ox = cx - r.width / 2, oy = cy - r.height / 2; Z.x = ox - (ox - Z.x) * k; Z.y = oy - (oy - Z.y) * k; Z.s = ns; applyZ();
  }
  stage.addEventListener("wheel", e => { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY); }, { passive: false });
  let drag = null;
  stage.addEventListener("pointerdown", e => { drag = { x: e.clientX - Z.x, y: e.clientY - Z.y }; stage.classList.add("drag"); stage.setPointerCapture(e.pointerId); });
  stage.addEventListener("pointermove", e => { if (!drag) return; Z.x = e.clientX - drag.x; Z.y = e.clientY - drag.y; applyZ(); });
  const endDrag = () => { drag = null; stage.classList.remove("drag"); };
  stage.addEventListener("pointerup", endDrag); stage.addEventListener("pointercancel", endDrag);
  stage.addEventListener("dblclick", e => zoomAt(2, e.clientX, e.clientY));
  $(".lb-btns", lb).addEventListener("click", e => { const z = e.target.closest("button")?.dataset.z; if (z === "in") zoomAt(1.4); else if (z === "out") zoomAt(1 / 1.4); else if (z === "fit") fitZ(); });
  function openLB(btn) {
    const img = $("img", btn); lbReturn = btn;
    lbImg.onload = fitZ; lbImg.src = btn.dataset.img; lbImg.alt = img ? img.alt : "";
    $(".lb-cap", lb).textContent = $$(".thumb-cap, .thumb-note", btn).map(x => x.textContent).join(" · ");
    lb.classList.add("open"); $(".lb-close", lb).focus(); if (lbImg.complete) fitZ();
  }
  function closeLB() { lb.classList.remove("open"); if (lbReturn) lbReturn.focus(); }
  function lbKey(e) {
    if (e.key === "Escape") closeLB();
    else if (e.key === "+" || e.key === "=") zoomAt(1.25); else if (e.key === "-") zoomAt(1 / 1.25); else if (e.key === "0") fitZ();
    else if (e.key.startsWith("Arrow")) { e.preventDefault(); const d = 40; if (e.key === "ArrowLeft") Z.x += d; if (e.key === "ArrowRight") Z.x -= d; if (e.key === "ArrowUp") Z.y += d; if (e.key === "ArrowDown") Z.y -= d; applyZ(); }
  }
  lb.addEventListener("click", e => { if (e.target.closest(".lb-close")) closeLB(); });
  lb.addEventListener("keydown", e => { if (e.key === "Tab") { const f = $$("button", lb); const i = f.indexOf(document.activeElement); e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); } });
  addEventListener("resize", () => { if (lb.classList.contains("open")) fitZ(); });
  document.addEventListener("click", e => {
    const t = e.target.closest(".thumb"); if (!t) return;
    if (t.dataset.ref) { const ref = document.getElementById(t.dataset.ref); if (ref) { const keep = $(".thumb-cap", t).textContent; openLB(ref); $(".lb-cap", lb).textContent = keep + " · " + $$(".thumb-cap, .thumb-note", ref).map(x => x.textContent).join(" · "); lbReturn = t; } return; }
    openLB(t);
  });

  /* ---------- số chạy lên giá trị cuối ---------- */
  const counts = $$(".count");
  function finishCounts() { counts.forEach(c => c.textContent = c.dataset.v); }
  function countUp(el) {
    const to = vn(el.dataset.v), dec = decimals(el.dataset.v), t0 = performance.now(), D = 1100;
    (function tick(t) { const p = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - p, 3); el.textContent = p < 1 ? toVN(to * e, dec) : el.dataset.v; if (p < 1) requestAnimationFrame(tick); })(t0);
  }
  const cio = new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting) return; cio.unobserve(en.target); countUp(en.target); }), { threshold: .4 });

  /* ---------- thẻ số nổi bật (trang trí, chỉ số in trong bài) ---------- */
  const BIG = {}; (VIZ.v13 || []).forEach(it => { (BIG[it.slide] = BIG[it.slide] || []).push([it.t, it.v, it.u || "", it.k + " (" + it.src + ")"]); });
  Object.entries(BIG).forEach(([id, items]) => {
    const s = document.getElementById(id); if (!s) return;
    const box = document.createElement("div"); box.className = "bignums"; box.dataset.ui = ""; box.setAttribute("aria-hidden", "true");
    box.innerHTML = items.map(([t, v, u, k]) => `<div class="bn ${t}"><p class="bn-k">${esc(k)}</p><p class="bn-v"><span class="count" data-v="${esc(v.replace("%", ""))}">${esc(v.replace("%", ""))}</span>${v.endsWith("%") ? "%" : ""}${u ? `<span class="bn-u">${esc(u)}</span>` : ""}</p></div>`).join("");
    const w = $(".wrap", s); w.insertBefore(box, w.firstElementChild?.classList.contains("h-sec") ? w.firstElementChild.nextSibling : w.firstElementChild);
  });
  $$(".count").forEach(c => { if (!counts.includes(c)) counts.push(c); REDUCE ? 0 : cio.observe(c); });

  /* ---------- 2.6.1: thanh tiến độ chạy khi vào màn hình ---------- */
  $$(".progress-261").forEach(p => { if (REDUCE) return; p.classList.add("armed"); new IntersectionObserver((es, o) => es.forEach(en => { if (en.isIntersecting) { p.classList.remove("armed"); o.disconnect(); } }), { threshold: .4 }).observe(p); });

  /* ---------- biểu tượng nét mảnh ở một số tiêu đề ---------- */
  $$(".case-tag").forEach(t => t.insertAdjacentHTML("afterbegin", icon(t.closest(".case.yes") ? "check" : "ledger")));
  $$("#muc-2-6-3 figcaption, .fig.timeline figcaption").forEach(f => f.insertAdjacentHTML("afterbegin", icon("clock") + " "));
  $$(".gal-h").forEach(g => g.insertAdjacentHTML("afterbegin", icon("ledger")));

  /* ---------- con trỏ: vòng sáng nhỏ trong hero ---------- */
  const ring = $(".cursor-ring");
  if (ring && hero && !TOUCH && !REDUCE) {
    hero.addEventListener("pointermove", e => { ring.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; ring.classList.add("on"); });
    hero.addEventListener("pointerleave", () => ring.classList.remove("on"));
  }

  /* =========================================================
     BIỂU ĐỒ (SVG tự vẽ, vẽ lại theo độ rộng thật)
     ========================================================= */
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const FS = k => Math.max(15, Math.round(rem() * k));   // nhãn biểu đồ không dưới 14px (15 để còn dư khi SVG co theo khung)
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
  // gradient dùng chung (màu theo biến CSS, đổi theo nền sáng/tối)
  document.body.insertAdjacentHTML("beforeend", `<svg class="grad-defs" width="0" height="0" style="position:absolute" aria-hidden="true" data-ui><defs>
    <linearGradient id="gv-bq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--bq-fill-2)"/><stop offset="1" style="stop-color:var(--bq-fill)"/></linearGradient>
    <linearGradient id="gv-dn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--dn-fill-2)"/><stop offset="1" style="stop-color:var(--dn-fill)"/></linearGradient>
    <linearGradient id="gh-bq" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(--bq-fill)"/><stop offset="1" style="stop-color:var(--bq-fill-2)"/></linearGradient>
    <linearGradient id="gh-dn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(--dn-fill)"/><stop offset="1" style="stop-color:var(--dn-fill-2)"/></linearGradient>
  </defs></svg>`);
  const GV = k => `url(#gv-${k === "bq" ? "bq" : "dn"})`, GH = k => `url(#gh-${k === "bq" ? "bq" : "dn"})`;
  const hatch = (id, color, bg) => `<pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="${bg}"/><line x1="2" y1="0" x2="2" y2="8" stroke="${color}" stroke-width="2.4"/></pattern>`;
  const col = k => ({ bq: css("--bq-fill"), dn: css("--dn-fill"), dn_special: css("--dn-fill"), green: css("--green"), ink: css("--ink"), ink2: css("--ink-2"), rule: css("--rule"), card: css("--card"), bqSoft: css("--bq-soft"), dnSoft: css("--dn-soft"), bqMid: css("--bq-mid"), dnMid: css("--dn-mid") }[k]);
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

  /* dòng thời gian văn bản pháp lý */
  const dt = s => { const [d, m, y] = s.split("/").map(Number); return y + (m - 1) / 12 + (d - 1) / 365; };
  R.timeline = d => {
    const docs = []; d.events.forEach(e => { let g = docs.find(x => x.doc === e.doc); if (!g) docs.push(g = { doc: e.doc, key: e.key, ev: [] }); g.ev.push(e); });
    const y0 = 2012, y1 = 2027, pos = t => ((t - y0) / (y1 - y0) * 100).toFixed(2) + "%";
    let ticks = ""; for (let t = 2013; t <= 2026; t++) ticks += `<span class="tl-tick${t % 2 ? "" : " minor"}" style="left:${pos(t)}"><i></i>${t % 2 ? t : ""}</span>`;
    const seg = docs.map((g, i) => { const a = dt(g.ev[0].date), b = dt(g.ev[g.ev.length - 1].date);
      return `<span class="tl-seg k-${g.key}" data-i="${i}" style="left:${pos(a)};width:calc(${pos(b)} - ${pos(a)} + 16px)"></span><span class="tl-lab k-${g.key}" style="left:${pos(a)}">${esc(g.doc.replace(/^Thông tư (\d+)\/(\d+)\/TT-BTC$/, "TT $1/$2"))}</span>`; }).join("");
    const cards = docs.map((g, i) => `<li class="tl-card k-${g.key}" data-i="${i}" style="transition-delay:${300 + i * 120}ms"><h5>${esc(g.doc)}</h5><ul>${g.ev.map(e => `<li><span class="tl-date">${esc(e.date)}</span> ${esc(e.text)}</li>`).join("")}</ul></li>`).join("");
    return `<div class="tl-wrap${REDUCE ? "" : " armed"}"><div class="tl-track"><div class="tl-axis" aria-hidden="true"><div class="tl-line"><i></i></div>${ticks}${seg}</div><svg class="tl-links" aria-hidden="true"></svg><ol class="tl-cards">${cards}</ol></div></div>`;
  };
  R.timeline.after = host => {
    const track = $(".tl-track", host), svgL = $(".tl-links", host); if (!track) return;
    const tr = track.getBoundingClientRect();
    svgL.setAttribute("viewBox", `0 0 ${tr.width} ${tr.height}`);
    svgL.innerHTML = $$(".tl-seg", host).map(s => { const i = s.dataset.i, card = $(`.tl-card[data-i="${i}"]`, host), r = s.getBoundingClientRect(), cr = card.getBoundingClientRect();
      const x1 = r.left - tr.left + 8, y1 = r.bottom - tr.top + 2, x2 = cr.left - tr.left + cr.width / 2, y2 = cr.top - tr.top;
      const k = [...s.classList].find(x => x.startsWith("k-"));
      return `<path class="${k}" d="M${f1(x1)} ${f1(y1)} C ${f1(x1)} ${f1(y1 + (y2 - y1) * .6)}, ${f1(x2)} ${f1(y1 + (y2 - y1) * .4)}, ${f1(x2)} ${f1(y2)}"/>`; }).join("");
    const wrapEl = $(".tl-wrap", host);
    if (wrapEl.classList.contains("armed")) new IntersectionObserver((es, o) => es.forEach(en => { if (en.isIntersecting) { wrapEl.classList.remove("armed"); o.disconnect(); } }), { threshold: .3 }).observe(wrapEl);
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
      return `<div class="t-panel ${side}"><h5>${title}</h5><p class="t-note">${esc(op[side].note)}</p><div class="t-grid">${order.map(a => `<div class="tacc"><div class="tacc-h">${esc(a)}</div><div class="tacc-b"><div><span class="side-k">Nợ</span>${acc[a].dr.map(x => `<span class="t-amt new pop" data-k="${x.k}" data-s="dr" style="animation-delay:${x.k * 160}ms">${esc(x.v)}</span>`).join("")}</div><div><span class="side-k">Có</span>${acc[a].cr.map(x => `<span class="t-amt new pop" data-k="${x.k}" data-s="cr" style="animation-delay:${x.k * 160 + 80}ms">${esc(x.v)}</span>`).join("")}</div></div></div>`).join("")}</div></div>`;
    };
    // mũi tên động nối số bên Nợ sang số bên Có của cùng một định khoản
    const arrows = () => {
      $(".t-arrows", host)?.remove();
      const hr = host.getBoundingClientRect(); let out = "";
      $$(".t-panel", host).forEach(p => {
        const side = p.classList.contains("bq") ? "bq" : "dn";
        $$('.t-amt[data-s="dr"]', p).forEach(dr => {
          const cr = $(`.t-amt[data-s="cr"][data-k="${dr.dataset.k}"]`, p); if (!cr) return;
          const a = dr.getBoundingClientRect(), b = cr.getBoundingClientRect();
          const x1 = a.right - hr.left + 2, y1 = a.top + a.height / 2 - hr.top, x2 = b.left - hr.left - 4, y2 = b.top + b.height / 2 - hr.top;
          const lift = Math.max(18, Math.abs(x2 - x1) * .12), my = Math.max(y1, y2) + lift, len = Math.hypot(x2 - x1, y2 - y1) * 1.5 + lift * 2, dl = 300 + (+dr.dataset.k) * 160;
          out += `<path class="${side}" style="--len:${f1(len)};animation-delay:${dl}ms" d="M${f1(x1)} ${f1(y1)} C ${f1(x1 + 10)} ${f1(my)}, ${f1(x2 - 10)} ${f1(my)}, ${f1(x2)} ${f1(y2)}"/><path class="head ${side}" style="animation-delay:${dl}ms" d="M${f1(x2)} ${f1(y2)} l-7 -5 v10 z" transform="rotate(${f1(Math.atan2(y2 - my, 10) * 180 / Math.PI)} ${f1(x2)} ${f1(y2)})"/>`;
        });
      });
      host.insertAdjacentHTML("beforeend", `<svg class="t-arrows" aria-hidden="true" data-ui viewBox="0 0 ${f1(hr.width)} ${f1(hr.height)}">${out}</svg>`);
    };
    const sel = i => { host.innerHTML = panel("bq", d.ops[i]) + panel("dn", d.ops[i]); host.setAttribute("aria-labelledby", "tt-" + i); requestAnimationFrame(arrows); };
    addEventListener("resize", () => requestAnimationFrame(arrows));
    tabsEl.setAttribute("role", "tablist");
    tabs(tabsEl, sel); sel(0);
  }

  /* =========================================================
     BỘ BIỂU ĐỒ (SVG tự vẽ). Quy tắc: nét mảnh, lưới rất mờ, nhãn trực tiếp,
     cột bắt đầu từ 0, số hiển thị đúng chuỗi in trong bài (viz_data.json).
     ========================================================= */
  const CV = n => css(n);
  function wrap(s, maxW, fs) { const out = []; let cur = ""; String(s).split(" ").forEach(wd => { const t = cur ? cur + " " + wd : wd; if (cur && tw(t, fs) > maxW) { out.push(cur); cur = wd; } else cur = t; }); if (cur) out.push(cur); return out; }
  const fillOf = k => k === "dn" || k === "dn_special" ? CV("--dn-fill") : k === "bq" ? CV("--bq-fill") : CV("--ink-2");
  const softOf = k => k === "dn" ? CV("--dn-soft") : CV("--bq-soft");
  const textOf = k => k === "dn" ? CV("--dn-text") : CV("--bq");
  const champ = () => CV("--champagne");

  /* V10b · Hình 1.4: cột nhóm thời hạn nộp BCTC (nhãn trực tiếp trên cột) */
  R.h14 = (d, w) => {
    const fs = FS(.62), narrow = w < 640, H = Math.round(Math.max(320, Math.min(440, w * .46))), L = fs * 3.2, Rr = 8, Tp = fs * (narrow ? 3.4 : 2), B = fs * (narrow ? 4.2 : 2.8);
    const ymax = vn(d.y_max), y = lin(0, ymax, H - B, Tp), base = y(0), id = "h" + (++UID);
    let g = "";
    for (let t = 0; t <= ymax; t += 30) g += `<line class="grid" x1="${L}" x2="${w - Rr}" y1="${f1(y(t))}" y2="${f1(y(t))}"/>` + T(L - 8, y(t) + fs * .35, String(t), { a: "end", fs, cls: "muted mono" });
    const gw = (w - L - Rr) / d.groups.length, bw = Math.min(gw * .22, 96);
    d.groups.forEach((grp, gi) => {
      const cx = L + gw * gi + gw / 2;
      grp.bars.forEach((b, bi) => {
        const x = cx + (bi - 1) * (bw + 6) - bw / 2, v = vn(b.v), yt = y(v);
        const fill = b.key === "dn_special" ? `url(#${id})` : fillOf(b.key);
        const lg = d.legend.find(l => l.key === b.key).label;
        const lab = tw(b.v + " ngày", fs, 1) > bw + 10 ? b.v : b.v + " ngày";
        g += mark(`<rect class="grow" x="${f1(x)}" y="${f1(yt)}" width="${f1(bw)}" height="${f1(base - yt)}" rx="2" fill="${fill}" stroke="${b.key === "dn_special" ? fillOf("dn") : "none"}"/>` + T(x + bw / 2, yt - 8, lab, { a: "middle", fs, w: 600, cls: "lbl mono" }),
          `${grp.label}\n${lg}: ${b.v} ngày`, [x - 3, yt - fs * 1.6, bw + 6, base - yt + fs * 1.6]);
      });
      wrap(grp.label, gw - 8, fs).forEach((ln, li) => { g += T(cx, base + fs * 1.6 + li * fs * 1.2, ln, { a: "middle", fs, w: 600 }); });
    });
    const yl = wrap(d.y_label, w - L - 8, fs); g += `<line class="axis" x1="${L}" x2="${w - Rr}" y1="${f1(base)}" y2="${f1(base)}"/>` + yl.map((l, k) => T(L, Tp - fs * (.8 + (yl.length - 1 - k) * 1.2), l, { fs, cls: "muted" })).join("");
    const legend = `<div class="legend">${d.legend.map(l => `<span><i style="background:${l.key === "dn_special" ? `repeating-linear-gradient(45deg, ${CV("--dn-soft")} 0 3px, ${fillOf("dn")} 3px 5px)` : fillOf(l.key)}"></i>${esc(l.label)}</span>`).join("")}</div>`;
    return svg(w, H, g, hatch(id, fillOf("dn"), CV("--dn-soft"))) + legend;
  };
  R.h14.rows = d => [["Nhóm", "Đối tượng", "Số ngày"], ...d.groups.flatMap(g => g.bars.map(b => [g.label, d.legend.find(l => l.key === b.key).label, b.v]))];

  /* V5 · Bảng 2.2: hai cặp thanh 100% (tài sản / nguồn vốn), nhãn % trực tiếp */
  R.b22 = (d, w) => {
    const fs = FS(w < 620 ? .6 : .66), narrow = w < 620, Lc = narrow ? 0 : fs * 11.5, rowH = fs * (narrow ? 7 : 4.6), bh = fs * 2, Tp = 4, B = fs * 2.2;
    const H = Tp + d.bars.length * rowH + fs * 1.6 + B, x = lin(0, 100, Lc + 4, w - 8), id = "h" + (++UID), id2 = "h" + (++UID);
    let g = ""; [0, 25, 50, 75, 100].forEach(t => { g += `<line class="grid" x1="${f1(x(t))}" x2="${f1(x(t))}" y1="${Tp}" y2="${f1(H - B)}"/>` + T(x(t), H - B + fs * 1.4, t + "%", { a: "middle", fs, cls: "muted mono" }); });
    d.bars.forEach((b, i) => {
      const y0 = Tp + i * rowH + (i >= 2 ? fs * 1.6 : 0) + (narrow ? fs * 1.7 : fs * .5), unit = d.units[b.entity], ent = b.entity;
      g += narrow ? T(2, y0 - fs * .5, `${b.label} · ${b.side}`, { fs, w: 600 }) : T(Lc - 10, y0 + bh * .45, b.label, { a: "end", fs, w: 600 }) + T(Lc - 10, y0 + bh * .45 + fs * 1.2, b.side, { a: "end", fs, cls: "muted" });
      let acc = 0;
      b.parts.forEach((p, k) => {
        const pv = vn(p.pct), x0 = x(acc), x1 = x(acc + pv); acc += pv;
        const strong = k === b.parts.length - 1;
        const fill = strong ? fillOf(ent) : softOf(ent);
        const inside = x1 - x0 > tw(p.pct, fs, 1) + 14;
        const tipTxt = `${b.label} · ${b.side}\n${p.label}: ${p.v} ${unit} (${p.pct})` + (p.inner ? `\n${p.inner.label}: ${p.inner.v} ${unit} (${p.inner.pct})` : "") + (b.total ? `\n${b.total.label}: ${b.total.v} ${unit}` : "");
        let inner = `<rect class="growx" x="${f1(x0)}" y="${f1(y0)}" width="${f1(Math.max(1, x1 - x0 - 1))}" height="${f1(bh)}" fill="${fill}" stroke="${fillOf(ent)}" stroke-width="1"/>`;
        inner += inside ? T((x0 + x1) / 2, y0 + bh / 2 + fs * .36, p.pct, { a: "middle", fs, w: 600, cls: "mono lbl", fill: strong ? "#FFFDF8" : CV("--ink") }) : T(narrow ? x0 : x1 + 6, narrow ? y0 + bh + fs * 1.3 : y0 + bh / 2 + fs * .36, p.pct, { fs, w: 600, cls: "mono lbl" });
        if (p.inner) {
          const xi = x(acc - pv + vn(p.inner.pct));
          inner += `<rect x="${f1(x0)}" y="${f1(y0 + bh + 4)}" width="${f1(xi - x0)}" height="5" fill="url(#${ent === "bq" ? id : id2})" stroke="${fillOf(ent)}" stroke-width=".8"/>`;
          const lt = `${p.inner.label.replace("Trong đó: ", "trong đó ")} ${p.inner.pct}`, st = x0 + lt.length * fs * .55 <= w - 4;
          inner += T(st ? x0 : w - 4, y0 + bh + fs * (narrow ? 2.9 : 1.8), lt, { a: st ? "start" : "end", fs, cls: "muted" });
        }
        g += mark(inner, tipTxt, [x0, y0 - 2, x1 - x0, bh + 4]);
      });
    });
    const legend = `<div class="legend"><span><i style="background:${fillOf("bq")}"></i>BQLDA</span><span><i style="background:${fillOf("dn")}"></i>Hòa Phát</span><span><i style="background:${softOf("bq")}"></i>Tài sản ngắn hạn / Nợ phải trả</span><span><i style="background:repeating-linear-gradient(45deg, ${CV("--card")} 0 3px, ${CV("--ink-2")} 3px 5px)"></i>Trong đó: xây dựng cơ bản dở dang</span></div>`;
    return svg(w, H, g, hatch(id, fillOf("bq"), CV("--card")) + hatch(id2, fillOf("dn"), CV("--card"))) + legend;
  };
  R.b22.rows = d => [["Đơn vị · bên", "Chỉ tiêu", "Giá trị", "% tổng tài sản"], ...d.bars.flatMap(b => [...b.parts.flatMap(p => [[`${b.label} · ${b.side}`, p.label, `${p.v} ${d.units[b.entity]}`, p.pct], ...(p.inner ? [[`${b.label} · ${b.side}`, p.inner.label, `${p.inner.v} ${d.units[b.entity]}`, p.inner.pct]] : [])]), ...(b.total ? [[`${b.label} · ${b.side}`, b.total.label, `${b.total.v} ${d.units[b.entity]}`, b.total.pct]] : [])])];

  /* V2, V3, V8, V9 · thác nước / bậc thang: tổng (từ 0), tăng, giảm, mức (từ 0, không nối) */
  // màn hẹp: thác nước nằm ngang (mỗi bước một hàng, nhãn ở trên thanh)
  function waterfallH(d, w) {
    const fs = FS(.6), ent = d.entity, bh = fs * 1.5, rowH = fs * 4.1, id = "wf" + (++UID);
    let run = 0; const pts = d.steps.map(s => { const v = vn(s.v); let a, b; if (s.type === "total" || s.type === "level") { a = 0; b = v; run = v; } else if (s.type === "up") { a = run; b = run + v; run = b; } else { a = run - v; b = run; run = a; } return { s, a, b }; });
    const lo = Math.min(0, ...pts.map(p => p.a)), hi = Math.max(...pts.map(p => p.b)), x = lin(lo, hi, 4, w - fs * 5.2);
    let g = "", y = fs * 1.2;
    pts.forEach((p, i) => {
      const up = p.s.type === "up", down = p.s.type === "down", lab = p.s.shown || (down ? "−" + p.s.v : up ? "+" + p.s.v : p.s.v);
      const fill = p.s.type === "total" ? fillOf(ent) : p.s.type === "level" ? softOf(ent) : up ? (ent === "bq" ? CV("--bq-mid") : CV("--dn-mid")) : `url(#${id})`;
      const x0 = x(Math.min(p.a, p.b)), x1 = x(Math.max(p.a, p.b));
      g += T(4, y, p.s.label + (p.s.pct ? ` · ${p.s.pct}` : ""), { fs });
      g += mark(`<rect class="growx" x="${f1(x0)}" y="${f1(y + fs * .5)}" width="${f1(Math.max(2, x1 - x0))}" height="${f1(bh)}" fill="${fill}" stroke="${fillOf(ent)}" stroke-width="1"/>` + T(x1 + 6, y + fs * .5 + bh / 2 + fs * .36, lab, { fs, w: 600, cls: "mono lbl" }),
        `${p.s.label}: ${lab} ${d.unit}` + (p.s.parts ? "\n" + p.s.parts.map(q => `${q.label}: ${q.v}`).join("; ") : "") + (p.s.pct ? `\n${p.s.pct}` : ""), [0, y - fs, w, rowH - 4]);
      y += rowH;
    });
    if (lo < 0) for (let k = 0; k < pts.length; k++) { const yy = fs * 1.2 + k * rowH + fs * .3; g += `<line class="axis" x1="${f1(x(0))}" x2="${f1(x(0))}" y1="${f1(yy)}" y2="${f1(yy + bh + fs * .4)}"/>`; }
    const defs = `<pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="${CV("--card")}"/><line x1="2" y1="0" x2="2" y2="8" stroke="${CV("--ink-2")}" stroke-width="2"/></pattern>`;
    return svg(w, y - fs, g, defs);
  }
  function waterfall(d, w) {
    if (w < 480) { const ent = d.entity, h = waterfallH(d, w); const partsNote = d.steps.filter(s => s.parts).map(s => `<p class="vz-parts"><b>${esc(s.label)} ${esc(s.v)}:</b> ${s.parts.map(q => `<span>${esc(q.v)} ${esc(q.label)}</span>`).join(" · ")}</p>`).join(""); return h + partsNote + (d.note ? `<p class="unit">${esc(d.note)}</p>` : "") + (d.note2 ? `<p class="unit vz-note">${esc(d.note2)}</p>` : ""); }
    const fs = FS(.6), L = fs * 3.4, Rr = 8, Tp = fs * 2.4, n = d.steps.length, sw = (w - L - Rr) / n;
    const nL = Math.max(...d.steps.map(s => wrap(s.label, sw - 8, fs).length)), B = fs * (1.6 + nL * 1.2 + (d.steps.some(s => s.pct) ? 1.2 : 0));
    const H = Math.round(Math.max(320, Math.min(440, w * .5)) + B - fs * 3.4), ent = d.entity, id = "wf" + (++UID);
    let run = 0; const pts = d.steps.map(s => { const v = vn(s.v); let a, b; if (s.type === "total" || s.type === "level") { a = 0; b = v; run = v; } else if (s.type === "up") { a = run; b = run + v; run = b; } else { a = run - v; b = run; run = a; } return { s, a, b }; });
    let lo = Math.min(0, ...pts.map(p => p.a)), hi = Math.max(...pts.map(p => p.b));
    const step = hi - lo > 120 ? 50 : hi - lo > 40 ? 10 : 5; lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
    const y = lin(lo, hi, H - B, Tp), bw = Math.min(sw * .5, 96);
    let g = ""; for (let t = lo; t <= hi; t += step) g += `<line class="${t === 0 ? "axis" : "grid"}" x1="${L}" x2="${w - Rr}" y1="${f1(y(t))}" y2="${f1(y(t))}"/>` + T(L - 8, y(t) + fs * .35, toVN(t, 0), { a: "end", fs, cls: "muted mono" });
    pts.forEach((p, i) => {
      const cx = L + sw * i + sw / 2, x0 = cx - bw / 2, ya = y(p.b), yb = y(p.a), up = p.s.type === "up", down = p.s.type === "down";
      const fill = p.s.type === "total" ? fillOf(ent) : p.s.type === "level" ? softOf(ent) : up ? (ent === "bq" ? CV("--bq-mid") : CV("--dn-mid")) : `url(#${id})`;
      const lab = p.s.shown || (down ? "−" + p.s.v : up ? "+" + p.s.v : p.s.v);
      let inner = "";
      if (up && p.s.parts) {   // tăng chia đoạn (V3: tiền / vật tư, thiết bị)
        let accY = yb; p.s.parts.forEach((q, k) => { const hq = (yb - ya) * vn(q.v) / vn(p.s.v); inner += `<rect class="grow" x="${f1(x0)}" y="${f1(accY - hq)}" width="${f1(bw)}" height="${f1(Math.max(1.5, hq))}" fill="${k ? CV("--champagne") : (ent === "bq" ? CV("--bq-mid") : CV("--dn-mid"))}" stroke="${fillOf(ent)}" stroke-width="1"/>`; accY -= hq; });

      } else inner += `<rect class="grow${down ? " down" : ""}" x="${f1(x0)}" y="${f1(ya)}" width="${f1(bw)}" height="${f1(Math.max(2, yb - ya))}" fill="${fill}" stroke="${fillOf(ent)}" stroke-width="1"/>`;
      inner += T(cx, down ? yb + fs * 1.35 : ya - 8, lab, { a: "middle", fs, w: 600, cls: "mono lbl" });
      const tipT = `${p.s.label}: ${lab} ${d.unit}` + (p.s.detail ? `\n(${p.s.detail})` : "") + (p.s.parts ? "\n" + p.s.parts.map(q => `${q.label}: ${q.v}`).join("; ") : "") + (p.s.pct ? `\n${p.s.pct}` : "");
      g += mark(inner, tipT, [x0 - 4, Math.min(ya, yb) - fs * 1.6, bw + 8, Math.abs(yb - ya) + fs * 3.2]);
      wrap(p.s.label, sw - 8, fs).forEach((l, k) => { g += T(cx, H - B + fs * (1.5 + k * 1.2), l, { a: "middle", fs }); });
      if (p.s.pct) g += T(cx, H - B + fs * (1.5 + nL * 1.2), p.s.pct, { a: "middle", fs, w: 600, fill: textOf(ent) });
      const nx = pts[i + 1];
      if (nx && nx.s.type !== "level" && p.s.type !== "level") { const yy = y(p.s.type === "down" ? p.a : p.b), nx0 = L + sw * (i + 1) + sw / 2 - bw / 2; g += `<line x1="${f1(x0 + bw)}" x2="${f1(nx0)}" y1="${f1(yy)}" y2="${f1(yy)}" stroke="${champ()}" stroke-width="1.2" stroke-dasharray="3 3"/>`; }
    });
    const defs = `<pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="${CV("--card")}"/><line x1="2" y1="0" x2="2" y2="8" stroke="${CV("--ink-2")}" stroke-width="2"/></pattern>`;
    const partsNote = d.steps.filter(s => s.parts).map(s => `<p class="vz-parts"><b>${esc(s.label)} ${esc(s.v)}:</b> ${s.parts.map((q, k) => `<span><i style="background:${k ? CV("--champagne") : (ent === "bq" ? CV("--bq-mid") : CV("--dn-mid"))}"></i>${esc(q.v)} ${esc(q.label)}</span>`).join(" ")}</p>`).join("");
    return svg(w, H, g, defs) + partsNote + (d.note ? `<p class="unit">${esc(d.note)}</p>` : "") + (d.note2 ? `<p class="unit vz-note">${esc(d.note2)}</p>` : "");
  }
  const wfRows = d => [["Bước", "Giá trị", "Đơn vị"], ...d.steps.flatMap(s => [[s.label + (s.pct ? ` (${s.pct})` : ""), s.shown || s.v, d.unit], ...(s.parts || []).map(q => ["  trong đó " + q.label, q.v, d.unit])]), ...(d.side || []).map(s => [s.label, s.v, d.unit])];
  ["wf_b02", "wf_cash", "v2", "v9"].forEach(k => { R[k] = (d, w) => waterfall(d, w); R[k].rows = wfRows; });
  // V9: bảng đối chiếu bên cạnh (chi phí, doanh thu khác) – số đúng Bảng 2.7
  R.v9 = (d, w) => {
    const side = `<table class="vz-side"><caption>Các khoản khác trong Bảng 2.7 (${esc(d.unit)})</caption><tbody>${d.side.map(s => `<tr><th scope="row">${esc(s.label)}</th><td class="num">${esc(s.v)}</td></tr>`).join("")}</tbody></table>`;
    return `<div class="vz-split"><div class="vz-main">${waterfall(d, w > 760 ? w * .68 : w)}</div>${side}</div>`;
  };
  R.v9.rows = wfRows;

  /* V4 · F02: thanh 100% hai đoạn */
  R.f02 = (d, w) => {
    const fs = FS(.66), nar = w < 640, bh = fs * 2.6, H = bh + fs * (nar ? 9.4 : 5.2), x = lin(0, 100, 2, w - 2);
    let acc = 0, g = "";
    d.parts.forEach((p, k) => {
      const pv = vn(p.pct), x0 = x(acc), x1 = x(acc + pv); acc += pv;
      const fill = k ? softOf("bq") : fillOf("bq");
      g += mark(`<rect class="growx" x="${f1(x0)}" y="${fs * 2.2}" width="${f1(x1 - x0 - 2)}" height="${f1(bh)}" fill="${fill}" stroke="${fillOf("bq")}"/>` + T(x0 + 12, fs * 2.2 + bh / 2 + fs * .4, `${p.v} · ${p.pct}`, { fs, w: 600, cls: "mono lbl", fill: k ? CV("--ink") : "#FFFDF8" }) + (nar ? wrap(p.label, w - 4, fs).map((l, j) => T(2, k ? fs * 2.2 + bh + fs * (1.4 + j * 1.2) : fs * (1.4 - j * 0), l, { fs, w: 600 })).slice(0, k ? 3 : 1).join("") : T(k ? x1 - 2 : x0, fs * 1.4, p.label, { a: k ? "end" : "start", fs, w: 600 })),
        `${p.label}\n${p.v} ${d.unit} (${p.pct})`, [x0, fs * .3, x1 - x0, bh + fs * 2]);
    });
    g += nar ? wrap(`${d.total.label}: ${d.total.v} ${d.unit}`, w - 4, fs).map((l, j) => T(2, fs * 2.2 + bh + fs * (4.4 + j * 1.2), l, { fs, cls: "muted" })).join("") : T(w - 2, fs * 2.2 + bh + fs * 1.7, `${d.total.label}: ${d.total.v} ${d.unit}`, { a: "end", fs, cls: "muted" });
    return svg(w, H, g);
  };
  R.f02.rows = d => [["Nguồn", "Giá trị", "Tỷ lệ"], ...d.parts.map(p => [p.label, `${p.v} ${d.unit}`, p.pct]), [d.total.label, `${d.total.v} ${d.unit}`, "100%"]];

  /* V6 · thanh ngang đã sắp xếp, nhãn trực tiếp (Bảng 2.8, 2.9) */
  function hbars(d, w, ent) {
    const fs = FS(.62), narrow = w < 640, Lc = narrow ? 0 : Math.min(w * .4, fs * 18), rowH = fs * (narrow ? 3.4 : 2.4), bh = fs * 1.15;
    const rows = d.rows.filter(r => vn(r.v) != null).sort((a, b) => vn(b.v) - vn(a.v)), rest = d.rows.filter(r => vn(r.v) == null);
    const labs = rows.map(r => narrow ? wrap(r.label, w - 6, fs) : [r.label]), offs = []; let yo = 0;
    labs.forEach(l => { offs.push(yo + (narrow ? fs * (.3 + l.length * 1.2) : fs * .6)); yo += rowH + (narrow ? (l.length - 1) * fs * 1.2 : 0); });
    const H = yo + fs * (rest.length ? (narrow ? 6 : 3.6) : 2.4), max = Math.max(...rows.map(r => vn(r.v))), lwMax = Math.max(...rows.map(r => tw(`${r.v} · ${r.pct}`, fs, 1))), x = lin(0, max, Lc + 2, w - lwMax - 14);
    let g = "";
    rows.forEach((r, i) => {
      const y0 = offs[i], v = vn(r.v), xe = x(v);
      g += narrow ? labs[i].map((l, k) => T(2, y0 - fs * .35 - (labs[i].length - 1 - k) * fs * 1.2, l, { fs })).join("") : wrap(r.label, Lc - 14, fs).slice(0, 2).map((l, k, arr) => T(Lc - 10, y0 + bh / 2 + fs * .35 + (k - (arr.length - 1) / 2) * fs * 1.1, l, { a: "end", fs })).join("");
      g += mark(`<rect class="growx" x="${f1(Lc + 2)}" y="${f1(y0)}" width="${f1(xe - Lc - 2)}" height="${f1(bh)}" rx="1.5" fill="${i === 0 ? fillOf(ent) : CV("--bq-mid")}"/>` + T(xe + 8, y0 + bh / 2 + fs * .35, `${r.v} · ${r.pct}`, { fs, w: 600, cls: "mono lbl" }),
        `${r.label}\n${r.v} ${d.unit} (${r.pct} số dư cuối năm)`, [Lc, y0 - 3, w - Lc - 2, bh + 6]);
    });
    g += `<line class="axis" x1="${f1(Lc + 2)}" x2="${f1(Lc + 2)}" y1="0" y2="${f1(yo)}"/>`;
    let ry = yo + fs * 1.4; rest.forEach(r => { wrap(`${r.label}: số dư cuối năm "-"`, w - (narrow ? 4 : Lc + 12), fs).forEach(l => { g += T(narrow ? 2 : Lc + 8, ry, l, { fs, cls: "muted" }); ry += fs * 1.2; }); });
    g += T(w - 4, H - fs * .4, `${d.total.label}: ${d.total.v} ${d.unit} (${d.total.pct})`, { a: "end", fs, cls: "muted" });
    return svg(w, H, g);
  }
  R.b28 = (d, w) => hbars(d, w, "bq");
  R.b29 = (d, w) => hbars(d, w, "bq");
  R.b28.rows = R.b29.rows = d => [["Khoản mục", "Số dư cuối năm", "% số dư cuối năm"], ...d.rows.map(r => [r.label, r.v === "-" ? "-" : `${r.v} ${d.unit}`, r.pct]), [d.total.label, `${d.total.v} ${d.unit}`, d.total.pct]];

  /* V7 · Bảng 2.10: dumbbell 2014 → 2015; khoản 1 tách hàng riêng với thang đo riêng */
  R.b210 = (d, w) => {
    const fs = FS(.6), narrow = w < 640, Lc = narrow ? 0 : Math.min(w * .44, fs * 19), valW = fs * 7.2, rowH = fs * (narrow ? 4.4 : 2.2);
    const first = d.rows[0], rest = d.rows.slice(1).slice().sort((a, b) => vn(b.v[0]) - vn(a.v[0]));
    const X1 = lin(0, 1100, Lc + 8, w - valW - 10), X2 = lin(0, 300, Lc + 8, w - valW - 10);
    let g = "", y0 = fs * 1.6;
    g += T(narrow ? 2 : Lc + 8, fs * .9, "Thang đo 0–1.100", { fs, cls: "muted" });
    const row = (r, y, X) => {
      const a = vn(r.v[1]), b = vn(r.v[0]), xa = X(a), xb = X(b);
      let s = narrow ? wrap(r.label, w - 6, fs).map((l, k, arr) => T(2, y - fs * (1 + (arr.length - 1 - k) * 1.15), l, { fs })).join("") : wrap(r.label, Lc - 12, fs).slice(0, 2).map((l, k, arr) => T(Lc - 8, y + fs * .35 + (k - (arr.length - 1) / 2) * fs * 1.1, l, { a: "end", fs })).join("");
      s += mark(`<line class="growx" x1="${f1(xa)}" x2="${f1(xb)}" y1="${f1(y)}" y2="${f1(y)}" stroke="${CV("--bq-mid")}" stroke-width="3"/><circle cx="${f1(xa)}" cy="${f1(y)}" r="5" fill="${CV("--card")}" stroke="${CV("--ink-2")}" stroke-width="1.5"/><circle cx="${f1(xb)}" cy="${f1(y)}" r="6" fill="${fillOf("bq")}"/>` +
        T(w - 4, y + fs * .35, `${r.v[0]} · ${r.v[1]}`, { a: "end", fs, cls: "mono lbl" }), `${r.label}\n${d.years[0]}: ${r.v[0]} ${d.unit}\n${d.years[1]}: ${r.v[1]} ${d.unit}`, [narrow ? 0 : Lc, y - fs * .8, w - (narrow ? 0 : Lc), fs * 1.6]);
      return s;
    };
    const axis = (X, max, step, y) => { let s = ""; for (let t = 0; t <= max; t += step) s += `<line class="grid" x1="${f1(X(t))}" x2="${f1(X(t))}" y1="${f1(y - rowH * .5)}" y2="${f1(y + rowH * .4)}"/>` + T(X(t), y + rowH * .4 + fs * 1.1, toVN(t, 0), { a: "middle", fs, cls: "muted mono" }); return s; };
    y0 += narrow ? fs * 1.4 : fs * .4;
    g += axis(X1, 1000, narrow ? 500 : 250, y0 + rowH * .5) + row(first, y0 + rowH * .5, X1);
    y0 += rowH + fs * 2.6;
    const sl = wrap("Thang đo 0–300 (10 khoản còn lại, xếp theo năm 2015)", w - (narrow ? 4 : Lc + 12), fs);
    g += `<line x1="0" x2="${w}" y1="${f1(y0 - fs * .9)}" y2="${f1(y0 - fs * .9)}" stroke="${champ()}" stroke-opacity=".6"/>` + sl.map((l, k) => T(narrow ? 2 : Lc + 8, y0 + fs * (.3 + k * 1.2), l, { fs, cls: "muted" })).join("");
    y0 += (sl.length - 1) * fs * 1.2;
    y0 += fs * 1.4 + (narrow ? fs * 1.2 : 0);
    const top = y0;
    rest.forEach((r, i) => { g += row(r, y0 + rowH * .5, X2); y0 += rowH; });
    for (let t = 0; t <= 300; t += 100) g += `<line class="grid" x1="${f1(X2(t))}" x2="${f1(X2(t))}" y1="${f1(top)}" y2="${f1(y0)}"/>` + T(X2(t), y0 + fs * 1.2, toVN(t, 0), { a: "middle", fs, cls: "muted mono" });
    const H = y0 + fs * 2;
    const legend = `<div class="legend"><span><i style="background:${fillOf("bq")};border-radius:50%"></i>${esc(d.years[0])}</span><span><i style="background:${CV("--card")};border:1.5px solid ${CV("--ink-2")};border-radius:50%"></i>${esc(d.years[1])}</span><span>Số bên phải: ${esc(d.years[0])} · ${esc(d.years[1])}</span><span>${esc(d.total.label)}: ${esc(d.total.v[0])} / ${esc(d.total.v[1])} ${esc(d.unit)}</span></div>`;
    return svg(w, H, g) + legend;
  };
  R.b210.rows = d => [["Khoản", d.years[0], d.years[1]], ...d.rows.map(r => [r.label, r.v[0], r.v[1]]), [d.total.label, d.total.v[0], d.total.v[1]]];

  /* V10a · thời hạn nộp BCTC năm: bullet chart (BQLDA không tính số ngày) */
  R.deadline = (d, w) => {
    const fs = FS(.62), narrow = w < 640, Lc = narrow ? 0 : Math.max(...d.rows.map(r => tw(r.label, fs, 1))) + 16, rowH = fs * (narrow ? 7.6 : 5.2), max = vn(d.max_days), x = lin(0, max, Lc + 6, w - fs * 3.2);
    const H = d.rows.length * rowH + fs * 2.8;
    let g = ""; [0, 30, 60, 90].forEach(t => { g += `<line class="grid" x1="${f1(x(t))}" x2="${f1(x(t))}" y1="0" y2="${f1(H - fs * 2.2)}"/>` + T(x(t), H - fs * .6, t + " ngày", { a: "middle", fs, cls: "muted mono" }); });
    d.rows.forEach((r, i) => {
      const y0 = i * rowH + fs * (narrow ? 2.4 : 1.6), ent = r.entity, lim = vn(r.limit), bh = fs * 1.6;
      g += narrow ? T(2, y0 - fs * .7, r.label + " · hạn " + r.limit + " ngày", { fs, w: 600 }) : T(Lc - 10, y0 + bh * .7, r.label, { a: "end", fs, w: 600 });
      g += `<rect x="${f1(x(0))}" y="${f1(y0)}" width="${f1(x(lim) - x(0))}" height="${f1(bh)}" fill="${softOf(ent)}"/><line x1="${f1(x(lim))}" x2="${f1(x(lim))}" y1="${f1(y0 - 5)}" y2="${f1(y0 + bh + 5)}" stroke="${CV("--ink")}" stroke-width="2"/>` + (narrow ? "" : T(x(lim) - 4, y0 - 6, "hạn " + r.limit + " ngày", { a: "end", fs, cls: "muted" }));
      if (r.days) {   // Hòa Phát: bài ghi rõ 83 ngày
        const days = vn(r.days);
        g += mark(`<rect class="growx" x="${f1(x(0))}" y="${f1(y0 + bh * .3)}" width="${f1(x(days) - x(0))}" height="${f1(bh * .4)}" fill="${fillOf(ent)}"/>` + T(x(days) - 6, y0 + bh + fs * 1.3, `${r.date} · ${r.days} ngày`, { a: "end", fs, w: 600, cls: "mono lbl" }), `${r.label}\n${r.shown}`, [x(0), y0 - 4, x(lim) - x(0), bh + 8]);
      } else {         // BQLDA: chỉ ghi "đúng hạn trong vòng 30 ngày", không đặt vị trí theo số ngày tự tính
        g += mark(`<path d="M${f1(x(0) + 10)} ${f1(y0 + bh / 2)} l5 5 l10 -10" fill="none" stroke="${fillOf(ent)}" stroke-width="2"/>` + wrap(`Lập ngày ${r.date} · đúng hạn trong vòng ${r.limit} ngày`, w - x(0) - 8, fs).map((l, k) => T(x(0) + 4, y0 + bh + fs * (1.3 + k * 1.2), l, { fs, w: 600, fill: textOf(ent) })).join(""), `${r.label}\n${r.shown}`, [x(0), y0 - 4, x(lim) - x(0), bh + 8]);
      }
    });
    return svg(w, H, g);
  };
  R.deadline.rows = d => [["Đơn vị", "Kết thúc kỳ", "Ngày lập", "Hạn (ngày)", "Bài ghi"], ...d.rows.map(r => [r.label, r.period_end, r.date, r.limit, r.shown])];

  /* V1 · tiến độ dự án: lũy kế 191,325 / tổng mức 312; hai đoạn 186,743 + 4,582; mốc 2013–2016 */
  const ddate = s => { const [dd, mm, yy] = s.split("/").map(Number); return yy + (mm - 1) / 12 + (dd - 1) / 365; };
  R.v1 = (d, w) => {
    const fs = FS(.62), narrow = w < 640, x = lin(0, vn(d.total.v), 2, w - 2), bh = fs * 2.4, y0 = fs * 2.6;
    const a = vn(d.parts[0].v), b = vn(d.parts[1].v), done = vn(d.done.v);
    let g = "";
    // thanh tiến độ trên nền tổng mức đầu tư
    g += `<rect x="${f1(x(0))}" y="${f1(y0)}" width="${f1(x(vn(d.total.v)) - x(0))}" height="${f1(bh)}" fill="${CV("--paper-2")}" stroke="${CV("--line-2")}"/>`;
    g += mark(`<rect class="growx" x="${f1(x(0))}" y="${f1(y0)}" width="${f1(x(a) - x(0))}" height="${f1(bh)}" fill="${fillOf("bq")}"/>`, `${d.parts[0].label}\n${d.parts[0].v} ${d.unit}`, [x(0), y0, x(a) - x(0), bh]);
    g += mark(`<rect class="growx" x="${f1(x(a))}" y="${f1(y0)}" width="${f1(Math.max(3, x(a + b) - x(a)))}" height="${f1(bh)}" fill="${champ()}"/>`, `${d.parts[1].label}\n${d.parts[1].v} ${d.unit}`, [x(a) - 4, y0, Math.max(10, x(a + b) - x(a)) + 8, bh]);
    g += T(x(0) + 12, y0 + bh / 2 + fs * .36, `${d.parts[0].v}`, { fs, w: 600, cls: "mono lbl", fill: "#FFFDF8" });
    if (narrow) g += T(x(0), y0 - 8, `${d.done.pct} · lũy kế ${d.done.v} / ${d.total.v}`, { fs, w: 600, cls: "lbl", fill: CV("--bq") });
    else { g += T(x(done) + 10, y0 + bh / 2 + fs * .36, `${d.done.pct} · lũy kế ${d.done.v}`, { fs, w: 600, cls: "lbl", fill: CV("--ink") }); g += T(x(vn(d.total.v)) - 8, y0 - 8, `${d.total.label}: ${d.total.v} ${d.unit}`, { a: "end", fs, cls: "muted" }); }
    // chú giải hai đoạn, dưới thanh
    const ly = y0 + bh + fs * 1.6;
    const L1 = wrap(`${d.parts[0].v} · ${d.parts[0].label}`, narrow ? w - fs * 2 : w * .48, fs), L2 = wrap(`${d.parts[1].v} · ${d.parts[1].label}`, narrow ? w - fs * 2 : w * .44, fs);
    g += `<rect x="${f1(x(0))}" y="${f1(ly - fs * .8)}" width="${f1(fs * .9)}" height="${f1(fs * .9)}" fill="${fillOf("bq")}"/>` + L1.map((l, k) => T(x(0) + fs * 1.4, ly + k * fs * 1.2, l, { fs })).join("");
    const l2y = narrow ? ly + fs * 1.3 * L1.length + fs * .3 : ly, l2x = narrow ? x(0) : w * .52;
    g += `<rect x="${f1(l2x)}" y="${f1(l2y - fs * .8)}" width="${f1(fs * .9)}" height="${f1(fs * .9)}" fill="${champ()}"/>` + L2.map((l, k) => T(l2x + fs * 1.4, l2y + k * fs * 1.2, l, { fs })).join("");
    if (narrow) g += T(x(0), l2y + fs * 1.3 * L2.length + fs * .2, `${d.total.label}: ${d.total.v} ${d.unit}`, { fs, cls: "muted" });
    // trục thời gian 2013–2016, nhãn sự kiện xếp tầng bên dưới, không chồng
    const ty = l2y + fs * (narrow ? 2.4 + 1.3 * L2.length + 1.6 : 3.4), t0 = +d.timeline.from, t1 = +d.timeline.to + 1, X = lin(t0, t1, fs * .5, w - fs * .5);
    g += `<line x1="${f1(X(t0))}" x2="${f1(X(t1))}" y1="${f1(ty)}" y2="${f1(ty)}" stroke="${CV("--ink-2")}"/>`;
    for (let t = t0; t <= t1; t++) g += `<line x1="${f1(X(t))}" x2="${f1(X(t))}" y1="${f1(ty - 5)}" y2="${f1(ty + 5)}" stroke="${CV("--ink-2")}"/>` + (t < t1 ? T(X(t + .5), ty - fs * .7, String(t), { a: "middle", fs, cls: "muted mono" }) : "");
    let evY = ty + fs * 1.8;
    d.timeline.events.forEach((e, i) => {
      const px = X(ddate(e.date)), anchor = px > w * .62 ? "end" : "start", tx = px + (anchor === "end" ? -10 : 10);
      const avail = anchor === "end" ? tx - 2 : w - tx - 2, tl = wrap(e.text, avail, fs);
      const ry = evY; evY += fs * (1.4 + tl.length * 1.2 + .6);
      g += mark(`<line x1="${f1(px)}" x2="${f1(px)}" y1="${f1(ty)}" y2="${f1(ry + fs * .2)}" stroke="${champ()}"/><circle cx="${f1(px)}" cy="${f1(ty)}" r="5" fill="${i === 0 ? champ() : fillOf("bq")}"/>` +
        T(tx, ry, e.date, { a: anchor, fs, w: 600, cls: "mono" }) + tl.map((l, k) => T(tx, ry + fs * 1.2 * (k + 1), l, { a: anchor, fs, cls: "muted" })).join(""), `${e.date}\n${e.text}`, [px - 10, ty - 10, 20, 20]);
    });
    const H = evY;
    return svg(w, H, g);
  };
  R.v1.rows = d => [["Chỉ tiêu", "Giá trị", "Nguồn"], [d.total.label, `${d.total.v} ${d.unit}`, d.total.src], [d.done.label, `${d.done.v} ${d.unit} (${d.done.pct})`, d.done.src], ...d.parts.map(p => [p.label, `${p.v} ${d.unit}`, p.src]), ["Thời gian thực hiện", `${d.timeline.from}–${d.timeline.to}`, d.timeline.src], ...d.timeline.events.map(e => [e.text, e.date, e.src])];

  /* ---------- khung biểu đồ mới (V1, V2, V9) và ma trận V12 ---------- */
  const NEWFIG = [
    { slide: "muc-2-1-2b", after: ".stats", key: "v1", title: "Tiến độ dự án: lũy kế vốn đầu tư thực hiện so với tổng mức đầu tư", lead: "Lũy kế vốn đầu tư thực hiện bằng dư chi phí đầu tư xây dựng dở dang cộng giá trị hạng mục đã quyết toán, bàn giao.", unit: "Đơn vị: tỷ đồng; 61,3% in sẵn trong bài. Nguồn: mục 2.1.1, mục 2.1.2, Bảng 2.6.1." },
    { slide: "bang-2-8-slide", after: "figure.tbl", key: "v2", title: "Biến động TK 241 năm 2015: từ số dư đầu năm đến số dư cuối năm", lead: "Dòng \"Cộng\" của Bảng 2.8.", unit: "Đơn vị: tỷ đồng. Nguồn: Bảng 2.8." },
    { slide: "muc-2-4", after: "figure.tbl", key: "v9", title: "Hòa Phát 2024: từ doanh thu thuần đến lợi nhuận sau thuế", lead: "Số liệu cột Doanh nghiệp của Bảng 2.7; lợi nhuận trước thuế và sau thuế vẽ từ 0, không nối bậc vì bài không nêu đủ các khoản ở giữa.", unit: "Đơn vị: nghìn tỷ đồng; biên 13,3% và 8,7% in sẵn trong bài. Nguồn: Bảng 2.7." }
  ];
  NEWFIG.forEach(f => {
    const s = document.getElementById(f.slide); if (!s) return; const w = $(".wrap", s), ref = $(f.after, w);
    const fig = document.createElement("figure"); fig.className = "fig chart vz"; fig.dataset.ui = "";
    fig.innerHTML = `<figcaption><span class="cap-no">Biểu đồ</span> ${esc(f.title)}</figcaption><p class="vz-lead">${esc(f.lead)}</p><div data-chart="${f.key}"></div><p class="unit">${esc(f.unit)}</p>`;
    if (ref) ref.after(fig); else w.append(fig);
  });
  // V12 · ma trận 5 tiêu chí × 2 chế độ (điều hướng vào Bảng 1.4)
  (function matrix() {
    const fig14 = document.getElementById("bang-1-4"); if (!fig14) return;
    const rows = $$("tbody tr", fig14).map((tr, i) => ({ i, name: $("th", tr).textContent.trim() })).filter(r => /^\d\./.test(r.name));
    const box = document.createElement("figure"); box.className = "fig vz vz-matrix"; box.dataset.ui = "";
    box.innerHTML = `<figcaption><span class="cap-no">Bản đồ</span> Năm tiêu chí so sánh · bấm một ô để mở dòng tương ứng của Bảng 1.4</figcaption>
      <div class="mx" role="grid" aria-label="Năm tiêu chí so sánh"><div class="mx-h" role="row"><span role="columnheader"></span><span role="columnheader" class="mx-bq">BQLDA (Thông tư 195)</span><span role="columnheader" class="mx-dn">Doanh nghiệp (Thông tư 200)</span></div>
      ${rows.map(r => `<div class="mx-r" role="row"><span class="mx-k" role="rowheader">${esc(r.name)}</span><button type="button" class="mx-c bq" data-row="${r.i}" data-col="a">${icon("ledger")} Xem cột BQLDA</button><button type="button" class="mx-c dn" data-row="${r.i}" data-col="b">${icon("build")} Xem cột Doanh nghiệp</button></div>`).join("")}</div>
      <p class="unit">Không có số liệu; chỉ là lối vào Bảng 1.4. <button type="button" class="mx-all">Hiện lại toàn bộ bảng</button></p>`;
    fig14.before(box);
    const sel = $("select", fig14), seg = $$(".seg button", fig14);
    box.addEventListener("click", e => {
      const c = e.target.closest(".mx-c"), all = e.target.closest(".mx-all");
      if (all) { sel.value = ""; sel.dispatchEvent(new Event("change")); seg[0].click(); $$(".mx-c", box).forEach(b => b.classList.remove("on")); return; }
      if (!c) return;
      sel.value = c.dataset.row; sel.dispatchEvent(new Event("change"));
      const target = seg.find(b => b.dataset.v === c.dataset.col); if (target) target.click();
      $$(".mx-c", box).forEach(b => b.classList.toggle("on", b === c));
      fig14.scrollIntoView({ behavior: REDUCE ? "auto" : "smooth", block: "start" });
    });
  })();

  /* ---------- "Xem bảng số liệu" cho mọi biểu đồ có số ---------- */
  function dataTable(k) {
    const d = VIZ[k], f = R[k] && R[k].rows; if (!d || !f) return "";
    const [head, ...body] = f(d);
    return `<table class="vz-data"><caption>Số liệu dùng cho biểu đồ · nguồn: ${esc(d.src || "")}</caption><thead><tr>${head.map(h => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${body.map(r => `<tr>${r.map((c, i) => i ? `<td>${esc(c)}</td>` : `<th scope="row">${esc(c)}</th>`).join("")}</tr>`).join("")}</tbody></table>`;
  }
  $$("[data-chart]").forEach((h, i) => {
    const k = h.dataset.chart; if (!R[k] || !R[k].rows) return;
    const id = "vzt-" + k + "-" + i;
    const box = document.createElement("div"); box.className = "vz-tools"; box.dataset.ui = "";
    box.innerHTML = `<button type="button" class="vz-btn" aria-expanded="false" aria-controls="${id}">Xem bảng số liệu</button><div class="vz-table" id="${id}" hidden>${dataTable(k)}</div>`;
    h.after(box);
    $(".vz-btn", box).addEventListener("click", e => { const t = $(".vz-table", box), o = t.hidden; t.hidden = !o; e.currentTarget.setAttribute("aria-expanded", String(o)); e.currentTarget.textContent = o ? "Ẩn bảng số liệu" : "Xem bảng số liệu"; });
  });
  // bàn phím trong biểu đồ: ← → chuyển giữa các điểm dữ liệu, Esc rời biểu đồ
  document.addEventListener("keydown", e => {
    const m = e.target.closest && e.target.closest(".mark"); if (!m) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") { const all = $$(".mark", m.ownerSVGElement); const i = all.indexOf(m) + (e.key === "ArrowRight" ? 1 : -1); if (all[i]) { e.preventDefault(); all[i].focus(); } }
    else if (e.key === "Escape") { m.blur(); }
  }, true);

  /* ---------- Bảng 2.2: so sánh phân đôi BQLDA | Hòa Phát (kéo thanh ngăn) ---------- */
  (function split() {
    const slide = document.getElementById("bang-2-2-slide"), d = VIZ.b22; if (!slide || !d) return;
    const pane = ent => {
      const bars = d.bars.filter(b => b.entity === ent);
      return `<div class="split-pane ${ent}"><p class="sp-title">${esc(bars[0].label)}</p>${bars.map(b => `<div class="sp-col"><div class="sp-stack">${b.parts.map((p, k) => { const pv = vn(p.pct); return `<div class="sp-seg s${k}${pv < 12 ? " thin" : ""}" style="flex:${pv} 0 0"><span><b>${esc(p.pct)}</b><small>${esc(p.label)}</small></span></div>`; }).join("")}</div><p>${esc(b.side)}</p></div>`).join("")}</div>`;
    };
    const fig = document.createElement("figure"); fig.className = "split-fig"; fig.dataset.ui = "";
    fig.innerHTML = `<figcaption><span class="cap-no">${icon("scale")}</span> So sánh phân đôi cơ cấu (% tổng tài sản) · kéo thanh ngăn</figcaption>
      <div class="split" style="--x:50%">${pane("bq")}${pane("dn")}<input class="split-range" type="range" min="4" max="96" value="50" aria-label="Thanh ngăn so sánh BQLDA và Hòa Phát"><span class="split-handle" aria-hidden="true"></span></div>
      <p class="unit">Đơn vị: % tổng tài sản. Nguồn: Bảng 2.2. Trái: BQLDA 31/12/2015 · Phải: Hòa Phát 31/12/2024.</p>`;
    $(".wrap", slide).append(fig);
    const sp = $(".split", fig), rg = $(".split-range", fig);
    rg.addEventListener("input", () => sp.style.setProperty("--x", rg.value + "%"));
    if (!REDUCE) new IntersectionObserver((es, o) => es.forEach(en => { if (!en.isIntersecting) return; o.disconnect(); const t0 = performance.now(); (function k(t) { const p = Math.min(1, (t - t0) / 1400), v = 50 + Math.sin(p * Math.PI * 2) * 18 * (1 - p); sp.style.setProperty("--x", v + "%"); rg.value = v; if (p < 1) requestAnimationFrame(k); })(t0); }), { threshold: .5 }).observe(sp);
  })();

  /* ---------- vẽ & vẽ lại ---------- */
  const hosts = $$("[data-chart]");
  const lastW = new Map();
  function draw(host, force) {
    const k = host.dataset.chart; if (k === "taccounts") return;
    const w = Math.round(host.clientWidth); if (!w || (!force && lastW.get(host) === w)) return; lastW.set(host, w);
    host.innerHTML = R[k](VIZ[k], w);
    if (R[k].after) requestAnimationFrame(() => R[k].after(host));
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
