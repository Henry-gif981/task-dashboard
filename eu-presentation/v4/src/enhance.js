/* v4: engraving theme behaviour.
   - engraved frames on the cover and chapter openings, transition panels for the take-aways and the closing slide
   - top bar page number "n / 73" (the slide numbering of the PDF)
   - charts and diagrams in one ink colour: the second series is hatched, the third dotted, lines dashed
   - every "Source:" line gets clickable links (URL shown short) or a [n] pointer into References;
     sources without a verified URL are marked "[link: cần bổ sung]"
   - References: alphabetical, numbered [n], hanging indent, URL on its own line, two columns
   - hidden appendix #source-check (not one of the 73 slides)
   No text of the report is changed. */
(function () {
  "use strict";
  const C = "#2B35D6";
  const DATA = JSON.parse(document.getElementById("v4-data").textContent);
  const URLS = Object.fromEntries(DATA.urls.map(u => [u.key, u]));
  const PAGES = DATA.pages;                        // section id -> [first PDF page, number of pages]
  const TOTAL = DATA.total;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const art = (id, cls, vb, par) => `<svg class="${cls}" viewBox="${vb}" preserveAspectRatio="${par || "xMidYMid slice"}" aria-hidden="true" focusable="false"><use href="#${id}"/></svg>`;
  const EXT = `<svg class="ext" viewBox="0 0 12 12" aria-hidden="true"><path d="M4.5 2.5h5v5M9.5 2.5 3 9" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`;
  const DOWN = `<svg class="down-arrow" viewBox="0 0 22 34" aria-hidden="true"><path d="M11 1v31M2 23l9 9 9-9" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`;
  const sections = $$("main > section");
  const chapterOf = id => { let ch = 0; for (const s of sections) { if (s.id === "ch1") ch = 1; if (s.id === "ch2") ch = 2; if (s.id === "ch3") ch = 3; if (s.id === "conclusion") ch = 4; if (s.id === id) return ch; } return ch; };
  const ROMAN = ["", "I", "II", "III"];

  /* ---------- cover and chapter openings ---------- */
  const home = $("#home");
  if (home) {
    home.insertAdjacentHTML("afterbegin", art("art-frame-cover", "toile", "0 0 1920 1080"));
    const h1 = $("h1", home); if (h1) h1.insertAdjacentHTML("afterend", DOWN);
    $$(".cover-meta dd", home).forEach(dd => dd.innerHTML = dd.innerHTML.replace(/<br\s*\/?>/g, '<span class="sep"></span>'));
  }
  [1, 2, 3].forEach(n => {
    const s = $("#ch" + n); if (!s) return;
    s.insertAdjacentHTML("afterbegin", art("art-frame-ch" + n, "toile", "0 0 1920 1080"));
    const eb = $(".eyebrow", s); if (eb) eb.textContent = eb.textContent.replace(/Chapter\s+(\d)/, (m, d) => "Chapter " + ROMAN[+d]);
    const h = $("h2", s); if (h) h.insertAdjacentHTML("afterend", DOWN);
  });

  /* ---------- transition panels: chapter take-aways ---------- */
  $$(".takeaway").forEach(t => {
    const sec = t.closest("section"), ch = chapterOf(sec.id), chTitle = ($("#ch" + ch + " h2") || {}).textContent || "";
    const wrap = el("div", "trans");
    t.parentNode.insertBefore(wrap, t);
    wrap.insertAdjacentHTML("beforeend", art("art-band-ch" + ch, "band", "0 0 1920 640", "xMidYMin slice") + art("art-organic", "blue", "0 0 1920 600", "none"));
    wrap.appendChild(t);
    const right = el("div", "tk-right");
    [...t.children].forEach(c => right.appendChild(c));
    const name = el("div", "chap-name", `<small>Chapter ${ROMAN[ch]}</small>${chTitle}`);
    name.setAttribute("aria-hidden", "true");
    t.append(name, right);
  });

  /* ---------- closing slide ---------- */
  const qa = $("#qa");
  if (qa) {
    const w = $(".wrap", qa), body = el("div", "qa-body"), left = el("div", "qa-l"), right = el("div", "qa-r");
    [...w.children].forEach(c => { if (c.classList.contains("chno")) return; (c.classList.contains("no") ? left : right).appendChild(c); });
    const eb = $(".eyebrow", right); if (eb) left.prepend(eb);
    body.append(left, right);
    const box = el("div", "qa-trans");
    box.innerHTML = art("art-band-end", "band", "0 0 1920 640", "xMidYMin slice") + art("art-organic", "blue", "0 0 1920 600", "none");
    box.appendChild(body); w.appendChild(box);
  }

  /* ---------- small corner engravings on content sections ---------- */
  sections.forEach(s => {
    if (s.matches(".hero, .intro, #contents, #references, #qa")) return;
    const ch = chapterOf(s.id); if (!ch || ch > 3) return;
    s.style.position = "relative";
    s.insertAdjacentHTML("beforeend", art("art-corner-ch" + ch, "corner-art", "0 0 420 420", "xMaxYMax meet"));
  });

  /* ---------- References ---------- */
  const decode = u => { try { return decodeURI(u); } catch (e) { return u; } };
  const breakable = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/([\/\-]+)/g, "$1<wbr>");   // line breaks only after "/" or "-"
  const refIndex = {};                               // "European Union. (n.d.-a)" -> number
  const refsUl = $("#references ul.refs");
  if (refsUl) {
    const items = $$("li", refsUl).map(li => {
      const a = $("a", li), url = a ? a.getAttribute("href") : null;
      const c = li.cloneNode(true); $$("a", c).forEach(x => x.remove());
      return { cite: c.innerHTML.trim(), text: c.textContent.trim(), url };
    }).sort((a, b) => a.text.localeCompare(b.text, "en", { sensitivity: "base" }));
    const ol = el("ol", "refs4");
    items.forEach((it, i) => {
      const n = i + 1, li = el("li");
      li.id = "ref-" + n;
      li.innerHTML = `<span class="rn">[${n}]</span>${it.cite}` + (it.url ? `<span class="ru"><a href="${it.url}" target="_blank" rel="noopener">${breakable(decode(it.url))}</a></span>` : "");
      ol.appendChild(li);
      const key = it.text.match(/^(.+?\(\s*(?:n\.d\.[^)]*|\d{4}[^)]*)\))/); if (key) refIndex[key[1].replace(/\s+/g, " ")] = n;
    });
    refsUl.replaceWith(ol);
  }
  const ref = k => { for (const [t, n] of Object.entries(refIndex)) if (t.startsWith(k)) return n; return null; };

  /* ---------- Sources ---------- */
  // each rule: pattern in the source line -> one or more targets; a target is a key of DATA.urls,
  // {ref: "<start of a reference>"}, {url, label} for an official home page, or null (no verified URL)
  const EC_BY_SECTION = { "c2-agreements": { ref: "European Commission. (n.d.-b)" }, "c2-economic": null, "c2-standards": [{ ref: "European Commission. (n.d.-e)" }, { ref: "European Commission. (n.d.-g)" }],
    "c3-green": { ref: "European Commission. (n.d.-f)" }, "c3-cooperation": { ref: "European Commission. (n.d.-f)" }, "c3-broader": { ref: "European Commission. (n.d.-f)" } };
  const EEAS_BY_SECTION = { "c2-governance": "eeas-eu-un", "c3-numbers": "eeas-global-gateway-560" };
  const EUROSTAT_BY_SECTION = { "c2-economic-b": "eurostat-intra", "c2-trade": "eurostat-extra-2025", "c2-trade-balance": "eurostat-extra-2025" };
  const RULES = [
    [/European Commission, DG Trade (?:country )?factsheet(?: on Vietnam)?(?: \(\d+ \w+ \d{4}\))?(?:, based on Eurostat Comext| \(Eurostat Comext\))?/, "dgtrade-vn-factsheet"],
    [/European Commission \((?:Eurostat(?: data)?)\)/, "dgtrade-vn-factsheet"],
    [/European Commission, Access2Markets/, "access2markets-evfta"],
    [/(?:European Commission|European Union|Council of the European Union) \(n\.d\.-[a-j]\)/, m => ({ ref: m.replace(/ \(/, ". (") })],
    [/Eurostat data \(2025\)|Eurostat data|Eurostat, as reported by the European Commission and specialised media|Eurostat/, (m, sec) => EUROSTAT_BY_SECTION[sec] || "eurostat-extra-2025"],
    [/Treaty on the Functioning of the European Union/, "eurlex-tfeu"],
    [/Treaty on European Union/, "eurlex-teu"],
    [/European Climate Law \(2021\)/, "eurlex-climate-law"],
    [/European Green Deal \(2019\)/, "eurlex-green-deal"],
    [/European Union official website/, { ref: "European Union. (n.d.-b)" }],
    [/European Union(?! \(n\.d)(?= ?[,;.])/, { ref: "European Union. (n.d.-b)" }],
    [/European Parliament/, { url: "https://www.europarl.europa.eu/", label: "europarl.europa.eu", home: 1 }],
    [/European Council/, { url: "https://www.consilium.europa.eu/en/european-council/", label: "consilium.europa.eu", home: 1 }],
    [/European Central Bank/, { url: "https://www.ecb.europa.eu/", label: "ecb.europa.eu", home: 1 }],
    [/Official EU legal texts/, { url: "https://eur-lex.europa.eu/", label: "eur-lex.europa.eu", home: 1 }],
    [/European Commission publications/, [{ ref: "European Commission. (n.d.-e)" }, { ref: "European Commission. (n.d.-g)" }]],
    [/European External Action Service|EEAS/, (m, sec) => EEAS_BY_SECTION[sec] || "eeas-eu-vietnam"],
    [/United Nations/, "un-res-65-276"],
    [/\bWTO\b(?! và)/, "wto-eu"],
    [/Sullivan & Cromwell \(2026\)/, "sullcrom-2026"], [/Bundesbank \(2026\)/, "bundesbank-2026"], [/DLA Piper \(2026\)/, "dlapiper-2026"], [/Ebner Stolz \(2026\)/, "ebnerstolz-2026"],
    [/Ministry of Industry and Trade of Vietnam/, "moit-evfta"],
    [/Ministry of Industry and Trade \/ Vietnam Customs/, null],
    [/Viet Nam News(?: \(June 2026\))?/, "vns-trade-june2026"],
    [/VietnamPlus \(Sept 2025\)/, "vnplus-eu-fdi"],
    [/VietnamPlus \(2025\)/, "vnplus-trade-2025"],
    [/VietnamPlus \(28 Nov 2025, 2 Aug 2026\)/, ["vnplus-evipa-poland", "vnplus-evfta-6yrs"]],
    [/VietnamPlus/, "vnplus-evipa-poland"],
    [/EuroCham(?: \(2025\))?/, "eurocham-2025"],
    [/Foreign Investment Agency\/MPI(?: \(2019(?: figures)?\))?/, "fia-mpi"],
    [/Vietnam Briefing/, "vietnam-briefing-eu-fdi"],
    [/Vietnamese Government implementation plan/, null],
    [/EU–Vietnam cooperation documents and the EVFTA sustainable development framework/, null],
    [/East Asia Forum \(2026\)/, "eaf-2026"], [/S&P Global \(2025\)/, "spglobal-2025"],
    [/Trung tâm WTO và Hội nhập \(2026b, 2026c\)/, ["ttwto-2026b", null]],
    [/Vietnam News Agency \(2026\)/, "vna-2026-iuu"], [/Thương hiệu & Công luận \(2026\)/, "thcl-2026"],
    [/Climate Policy Initiative \(n\.d\.\)/, null], [/Italian Trade Agency \(2026\)/, null], [/Vietnam Investment Review \(2025\)/, "vir-2025"],
    [/Upply \(2025\)/, "upply-2025"],
    [/European Commission/, (m, sec) => sec in EC_BY_SECTION ? EC_BY_SECTION[sec] : (/^c3-/.test(sec) ? { ref: "European Commission. (n.d.-i)" } : null)]
  ];
  const shortUrl = u => { try { const x = new URL(u); const seg = x.pathname.split("/").filter(Boolean)[0]; return x.hostname.replace(/^www\./, "") + (seg ? "/" + seg : ""); } catch (e) { return u; } };
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const check = [];                                   // rows of the appendix
  function resolve(t) {
    if (t == null) return { status: "need" };
    if (typeof t === "string") { const u = URLS[t]; return u && u.url ? { url: u.url, status: u.status, key: t, title: u.title } : { status: "need", key: t }; }
    if (t.ref) { const n = ref(t.ref); if (!n) return { status: "need" }; const li = document.getElementById("ref-" + n), a = li && $(".ru a", li); return { n, url: a ? a.href : null, status: "reference" }; }
    if (t.url) return { url: t.url, status: "official-home", label: t.label };
    return { status: "need" };
  }
  function render(name, targets) {
    const list = (Array.isArray(targets) ? targets : [targets]).map(resolve);
    const parts = list.map((r, i) => {
      const label = list.length > 1 ? (name.match(/\(([^)]*)\)/) || [, ""])[1].split(/,\s*/)[i] || "" : "";
      if (r.status === "need") return `<span class="need">${label ? esc(label) + " " : ""}[link: cần bổ sung]</span>`;
      const ext = r.url ? `<a class="srcl" href="${r.url}" target="_blank" rel="noopener">${label ? esc(label) + ": " : ""}<span class="dom">${esc(r.label || shortUrl(r.url))}</span>${EXT}</a>` : "";
      const rn = r.n ? ` <a class="refno" href="#ref-${r.n}">[${r.n}]</a>` : "";
      return ext + rn;
    });
    const sep = list.length === 1 && list[0].status === "need" ? " " : " — ";
    return { html: esc(name) + sep + parts.join("; "), list };
  }
  function linkify(node, secId, fig, srcText) {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const texts = []; while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach(tn => {
      if (tn.parentNode.closest("a")) return;
      let s = tn.nodeValue, out = "", used = false;
      while (s.length) {
        let best = null;
        for (const [re, tg] of RULES) { const m = s.match(re); if (m && (best === null || m.index < best.m.index)) best = { m, tg }; }
        if (!best) { out += esc(s); break; }
        const name = best.m[0], tgt = typeof best.tg === "function" ? best.tg(name, secId) : best.tg;
        const r = render(name, tgt);
        out += esc(s.slice(0, best.m.index)) + r.html; used = true;
        r.list.forEach(x => check.push({ sec: secId, fig, source: name, url: x.url || "", status: x.status, n: x.n || "", line: srcText }));
        s = s.slice(best.m.index + name.length);
      }
      if (used) { const span = document.createElement("span"); span.innerHTML = out; tn.replaceWith(span); }
    });
  }
  const figureOf = e => {
    const f = e.closest("figure");
    if (f) { const t = $(".vz-title, figcaption", f); return (t ? t.textContent : "").trim(); }
    let p = e.previousElementSibling; while (p && !p.matches(".tbl-wrap, figure, .grid, .kpis, .cols, .vz-pair, .tl, .flow, .vb-pair")) p = p.previousElementSibling;
    const cap = p && $("caption, .vz-title, figcaption", p);
    if (cap) return cap.textContent.trim();
    const s = e.closest("section"), h = s && $("h2", s); return h ? h.textContent.trim() : "";
  };
  $$("main .src, main p, main li, main small, main td").filter(e => /^\s*Sources?:/.test(e.textContent) && !e.querySelector(".src") || (e.matches(".tnote, small, li, p") && /Upply \(2025\)/.test(e.textContent) && !$(".src", e)))
    .forEach(e => { const sec = e.closest("section"), k0 = check.length; linkify(e, sec ? sec.id : "", figureOf(e), e.textContent.trim().replace(/\s+/g, " ")); if (check.length > k0) e.dataset.sc = k0 + "-" + check.length; });

  /* ---------- appendix: source check ---------- */
  const app = el("section", "sec auto");
  app.id = "source-check"; app.setAttribute("aria-label", "Source check (appendix, not part of the presentation)");
  const rangeOf = id => { const p = PAGES[id]; return p ? (p[1] > 1 ? `${p[0]}–${p[0] + p[1] - 1}` : String(p[0])) : ""; };
  const ST = { "article-verified": "has link (article)", "page-verified": "has link (page)", "reference": "has link (References)", "official-home": "has link (official site)", "need": "cần bổ sung" };
  app.innerHTML = `<div class="wrap panel"><p class="eyebrow">Appendix · not one of the 73 slides</p><h2 class="h">Source check</h2>
    <p class="lead">Every source named in a "Source:" line, with its link. "has link (article)": the search result shows the page with this figure; "has link (page)": the right page or database, the exact figure not confirmed; "cần bổ sung": no verified URL yet. The pages could not be opened from this environment, so every link was checked through search results only.</p>
    <table><thead><tr><th>Slide</th><th>Figure / table</th><th>Source</th><th>URL</th><th>Status</th></tr></thead><tbody>${check.map(r =>
      `<tr><td>${rangeOf(r.sec)}</td><td>${esc(r.fig)}</td><td>${esc(r.source)}${r.n ? ` [${r.n}]` : ""}</td><td>${r.url ? `<a href="${r.url}" target="_blank" rel="noopener">${esc(decode(r.url))}</a>` : "—"}</td><td class="${r.status === "need" ? "st-need" : ""}">${ST[r.status] || r.status}</td></tr>`).join("")}</tbody></table></div>`;
  document.querySelector("main").after(app);
  window.V4_SOURCE_CHECK = check;
  const openApp = () => { app.classList.toggle("open", location.hash === "#source-check"); };
  addEventListener("hashchange", openApp); openApp();

  /* ---------- page number of the PDF in the top bar ---------- */
  const pageno = $(".nav .pageno");
  function pageNow() {
    const mid = innerHeight * .4; let cur = sections[0];
    for (const s of sections) { if (s.getBoundingClientRect().top <= mid) cur = s; else break; }
    const p = PAGES[cur.id] || [1, 1], r = cur.getBoundingClientRect();
    const f = Math.max(0, Math.min(.999, (mid - r.top) / Math.max(1, r.height)));
    return p[0] + Math.floor(f * p[1]);
  }
  const navLinks = $$(".nav .nav-links a");
  function onScroll() {
    if (pageno && !document.documentElement.classList.contains("pdfs")) pageno.textContent = pageNow() + " / " + TOTAL;
    const n = pageNow(), at = [["contents", 2], ["ch1", 4], ["ch2", 15], ["ch3", 38], ["references", 71]];
    let on = null; at.forEach(([id, p]) => { if (n >= p) on = id; });
    if (n >= 70 && n < 71) on = null;
    navLinks.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + on));
  }
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); onScroll();

  /* ---------- one ink colour for charts and diagrams ---------- */
  const rgb = s => { const m = s && s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(",").map(x => parseFloat(x)); return v.length > 3 && v[3] === 0 ? null : v; };
  function kind(v) {
    if (!v) return null;
    const [r, g, b] = v;
    if (r > 236 && g > 236 && b > 236) return "white";
    if (r > 200 && g > 150 && b < 120) return "gold";
    if (Math.abs(r - 43) < 3 && Math.abs(g - 53) < 3 && Math.abs(b - 214) < 3) return "ink";
    if (r > 195 && g > 195 && b > 225) return "tint";
    if (Math.abs(r - g) < 22 && b - r < 40 && r > 90) return "grey";
    return "ink";
  }
  const bgOf = e => { for (let x = e; x && x !== document.documentElement; x = x.parentElement) { const v = rgb(getComputedStyle(x).backgroundColor); if (v) return kind(v); if (getComputedStyle(x).backgroundImage.includes("svg")) return "white"; } return "white"; };
  // hatching drawn as real lines clipped to the shape (a PDF keeps them as vectors; SVG patterns would be rasterised)
  const NS = "http://www.w3.org/2000/svg";
  let hid = 0;
  function hatch(n, dots) {
    let bb; try { bb = n.getBBox(); } catch (e) { return; }
    if (!bb.width || !bb.height) return;
    const m = n.getScreenCTM(), sc = m ? Math.hypot(m.a, m.b) || 1 : 1, step = (dots ? 6 : 7) / sc;
    const id = "v4c" + (++hid), cp = document.createElementNS(NS, "clipPath"), sh = n.cloneNode(false);
    sh.removeAttribute("id"); sh.removeAttribute("class"); sh.removeAttribute("transform"); sh.removeAttribute("style"); sh.setAttribute("fill", "#000"); cp.id = id; cp.appendChild(sh);
    const g = document.createElementNS(NS, "g"); g.setAttribute("clip-path", `url(#${id})`); g.setAttribute("class", "v4h"); g.setAttribute("aria-hidden", "true");
    const tf = n.getAttribute("transform"); if (tf) { g.setAttribute("transform", tf); }
    let d = "";
    if (dots) for (let y = bb.y + step / 2; y < bb.y + bb.height; y += step) d += `M${(bb.x).toFixed(1)} ${y.toFixed(1)}H${(bb.x + bb.width).toFixed(1)}`;
    else for (let x = bb.x - bb.height; x < bb.x + bb.width; x += step) d += `M${x.toFixed(1)} ${(bb.y + bb.height).toFixed(1)}L${(x + bb.height).toFixed(1)} ${bb.y.toFixed(1)}`;
    const p = document.createElementNS(NS, "path"); p.setAttribute("d", d); p.setAttribute("fill", "none"); p.setAttribute("stroke", C);
    p.setAttribute("stroke-width", ((dots ? 2 : 1.4) / sc).toFixed(2));
    if (dots) { p.setAttribute("stroke-dasharray", `0 ${step.toFixed(2)}`); p.setAttribute("stroke-linecap", "round"); }
    g.appendChild(p);
    n.after(cp, g);
  }
  function mono(root) {
    $$("rect, path, circle, ellipse, polygon, polyline, line", root).forEach(n => {
      if (n.closest("symbol, pattern, clipPath, .v4h, .toile, .band, .blue, .corner-art, .brand") || n.dataset.v4h) return;
      const cs = getComputedStyle(n), f = /^url\(/.test(cs.fill) ? "gold" : kind(rgb(cs.fill)), s = kind(rgb(cs.stroke));
      if (f === "gold" || f === "grey") {
        n.dataset.v4h = "1"; hatch(n, f === "grey"); n.style.fill = "#FFFFFF";
        if (!rgb(cs.stroke) || s === "white" || s === "gold" || s === "grey") { n.style.stroke = C; n.style.strokeWidth = "1"; }
        return;
      }
      if (s === "gold") { n.style.stroke = C; if (!n.getAttribute("stroke-dasharray")) n.style.strokeDasharray = "7 4"; }
      else if (s === "grey") { n.style.stroke = C; if (!n.getAttribute("stroke-dasharray")) n.style.strokeDasharray = "2 3"; }
    });
    $$("text", root).forEach(t => {
      const f = kind(rgb(getComputedStyle(t).fill));
      if (f !== "white") t.style.fill = C;   // no stroked halo: a stroked copy of the text would be extracted twice from the PDF
    });
    $$("*", root).forEach(e => {
      if (e instanceof SVGElement) return;
      const cs = getComputedStyle(e), b = kind(rgb(cs.backgroundColor));
      if (b === "gold") e.classList.add("v4-hatch");
      else if (b === "grey") e.style.backgroundColor = "#E5E6FA";
      const fg = kind(rgb(cs.color));
      if (fg === "gold" || fg === "grey") e.style.color = bgOf(e) === "ink" ? "#FFFFFF" : C;
      else if (fg === "ink" && bgOf(e) === "ink" && e.childNodes.length && [...e.childNodes].some(x => x.nodeType === 3 && x.nodeValue.trim())) e.style.color = "#FFFFFF";
    });
  }
  let pend = null;
  const run = () => { pend = null; mo.disconnect(); $$("main figure, main .vz, main .vz-root, main .kpis, main .ranks, main .ocr, main .branch, main .vb, main .takeaway, main .callout, main .card.hl").forEach(mono); mo.observe(document.querySelector("main"), { childList: true, subtree: true }); };
  const mo = new MutationObserver(() => { if (!pend) pend = setTimeout(run, 120); });
  if (document.readyState === "complete") setTimeout(run, 300); else addEventListener("load", () => setTimeout(run, 300));
  window.V4_MONO = run;
})();
