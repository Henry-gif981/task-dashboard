/* Source links (v3b update).
   Every source named on a "Source:" line, in a table note or in a "View data" panel becomes a link:
   the name itself opens the page the information comes from (new tab). A source that is also an
   entry of References opens that entry's URL; the tooltip shows the full reference.
   "Section 2.1.1 of the report" etc. jump to that part of this page.
   URLs: src-urls (v3b/src/source_urls.json; checked through search results, see v4/SOURCE_CHECK.md).
   No text is changed: only links are added around the existing words. */
(function () {
  "use strict";
  const DATA = JSON.parse(document.getElementById("src-urls").textContent);
  const URLS = Object.fromEntries(DATA.map(u => [u.key, u]));
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const EXT = `<svg class="ext" viewBox="0 0 12 12" aria-hidden="true"><path d="M4.5 2.5h5v5M9.5 2.5 3 9" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>`;

  /* References: "European Commission. (n.d.-b)" -> { url, text } */
  const REFS = {};
  $$("#references .refs li").forEach((li, i) => {
    li.id = li.id || "ref-" + (i + 1);
    const a = $("a", li), c = li.cloneNode(true); $$("a", c).forEach(x => x.remove());
    const text = c.textContent.replace(/\s+/g, " ").trim(), k = text.match(/^(.+?\(\s*(?:n\.d\.[^)]*|\d{4}[^)]*)\))/);
    if (k) REFS[k[1]] = { url: a ? a.getAttribute("href") : null, text, id: li.id };
  });
  const ref = k => { for (const [t, r] of Object.entries(REFS)) if (t.startsWith(k)) return r; return null; };

  /* sections of this page by number: "2.1.1" -> id (eyebrows "2.1.1a" count for 2.1.1, first one wins) */
  const SEC = {};
  $$("main > section").forEach(s => {
    $$(".eyebrow, .part-h .no", s).forEach(e => { const m = e.textContent.trim().match(/^(\d\.\d(?:\.\d)?)[a-z]?$/); if (m && !SEC[m[1]]) SEC[m[1]] = e.closest(".part-h") ? e.closest(".part-h").id : s.id; });
  });

  // pattern -> target(s); a target is a key of src-urls, {ref: "<start of a reference>"} or null
  const EC_BY_SECTION = { "c2-agreements": { ref: "European Commission. (n.d.-b)" }, "c2-economic": "ec-single-market", "c2-standards": [{ ref: "European Commission. (n.d.-e)" }, { ref: "European Commission. (n.d.-g)" }],
    "c3-green": { ref: "European Commission. (n.d.-f)" }, "c3-cooperation": { ref: "European Commission. (n.d.-f)" }, "c3-broader": { ref: "European Commission. (n.d.-f)" } };
  const EEAS_BY_SECTION = { "c2-governance": "eeas-eu-un", "c3-numbers": "eeas-global-gateway-560" };
  const EUROSTAT_BY_SECTION = { "c2-economic-b": "eurostat-intra", "c2-trade": "eurostat-extra-2025", "c2-trade-balance": "eurostat-extra-2025", "c3-trade": "dgtrade-vn-factsheet" };
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
    [/European Parliament/, { url: "https://www.europarl.europa.eu/", title: "European Parliament, official site" }],
    [/European Council/, { url: "https://www.consilium.europa.eu/en/european-council/", title: "European Council, official site" }],
    [/European Central Bank/, { url: "https://www.ecb.europa.eu/", title: "European Central Bank, official site" }],
    [/Official EU legal texts|official EU sources/, { url: "https://eur-lex.europa.eu/", title: "EUR-Lex: official EU legal texts" }],
    [/European Commission publications/, [{ ref: "European Commission. (n.d.-e)" }, { ref: "European Commission. (n.d.-g)" }]],
    [/European External Action Service|EEAS/, (m, sec) => EEAS_BY_SECTION[sec] || "eeas-eu-vietnam"],
    [/United Nations/, "un-res-65-276"],
    [/\bWTO\b(?! và)/, "wto-eu"],
    [/Sullivan & Cromwell \(2026\)/, "sullcrom-2026"], [/Bundesbank \(2026\)/, "bundesbank-2026"], [/DLA Piper \(2026\)/, "dlapiper-2026"], [/Ebner Stolz \(2026\)/, "ebnerstolz-2026"],
    [/Ministry of Industry and Trade of Vietnam/, "moit-evfta"],
    [/Ministry of Industry and Trade \/ Vietnam Customs/, "customs-vn"],
    [/Viet Nam News(?: \(June 2026\))?/, "vns-trade-june2026"],
    [/VietnamPlus \(Sept 2025\)/, "vnplus-eu-fdi"],
    [/VietnamPlus \(2025\)/, "vnplus-trade-2025"],
    [/VietnamPlus \(28 Nov 2025, 2 Aug 2026\)/, ["vnplus-evipa-poland", "vnplus-evfta-6yrs"]],
    [/VietnamPlus/, "vnplus-evipa-poland"],
    [/EuroCham(?: \(2025\))?/, "eurocham-2025"],
    [/Foreign Investment Agency\/MPI(?: \(2019(?: figures)?\))?/, "fia-mpi"],
    [/Vietnam Briefing/, "vietnam-briefing-eu-fdi"],
    [/Vietnamese Government implementation plan/, "gov-1201"],
    [/EU–Vietnam cooperation documents and the EVFTA sustainable development framework/, ["eeas-eu-vietnam", "access2markets-evfta"]],
    [/East Asia Forum \(2026\)/, "eaf-2026"], [/S&P Global \(2025\)/, "spglobal-2025"],
    [/Trung tâm WTO và Hội nhập \(2026b, 2026c\)/, ["ttwto-2026b", "ttwto-2026c"]],
    [/Vietnam News Agency \(2026\)/, "vna-2026-iuu"], [/Thương hiệu & Công luận \(2026\)/, "thcl-2026"],
    [/Climate Policy Initiative \(n\.d\.\)/, "cpi-nd"], [/Italian Trade Agency \(2026\)/, "ita-2026"], [/Vietnam Investment Review \(2025\)/, "vir-2025"],
    [/Upply \(2025\)/, "upply-2025"],
    [/European Commission/, (m, sec) => sec in EC_BY_SECTION ? EC_BY_SECTION[sec] : (/^c3-/.test(sec) ? { ref: "European Commission. (n.d.-i)" } : "ec-single-market")],
    [/Sections? \d\.\d(?:\.\d)?(?:(?:,| and) \d\.\d(?:\.\d)?)*/, m => ({ sections: m })]
  ];
  const NOTE = { "article-verified": "the page with this figure or statement", "page-verified": "the page or database this comes from", "official-site": "official site (the exact page is not named in the report)" };
  function resolve(t) {
    if (t == null) return null;
    if (typeof t === "string") { const u = URLS[t]; return u && u.url ? { url: u.url, tip: (u.title || "") + " — " + (NOTE[u.status] || "") } : null; }
    if (t.ref) { const r = ref(t.ref); return r && r.url ? { url: r.url, tip: "References: " + r.text } : r ? { url: "#" + r.id, tip: "References: " + r.text, internal: 1 } : null; }
    if (t.url) return { url: t.url, tip: t.title };
    return null;
  }
  const link = (text, r) => r.internal ? `<a class="srcl int" href="${esc(r.url)}" title="${esc(r.tip)}">${esc(text)}</a>`
    : `<a class="srcl" href="${esc(r.url)}" target="_blank" rel="noopener" title="${esc(r.tip)}">${esc(text)}${EXT}</a>`;
  function render(name, tgt) {
    if (tgt && tgt.sections) {        // "Sections 1.1.3 and 1.2.1" -> each number jumps to that part of the page
      return name.replace(/\d\.\d(?:\.\d)?/g, n => SEC[n] ? `<a class="srcl int" href="#${SEC[n]}" title="Go to ${n} in this page">${n}</a>` : n);
    }
    const list = (Array.isArray(tgt) ? tgt : [tgt]).map(resolve);
    if (!list[0]) return esc(name);
    if (list.length === 1) return link(name, list[0]);
    // several pages: link each date inside the brackets if they match, else the name plus [2], [3]
    const m = name.match(/^(.*?\()([^)]*)(\).*)$/), parts = m ? m[2].split(/,\s*/) : [];
    if (m && parts.length === list.length) return esc(m[1]) + parts.map((p, i) => list[i] ? link(p, list[i]) : esc(p)).join(", ") + esc(m[3]);
    return link(name, list[0]) + list.slice(1).map((r, i) => r ? ` <a class="srcl more" href="${esc(r.url)}" target="_blank" rel="noopener" title="${esc(r.tip)}">[${i + 2}]</a>` : "").join("");
  }
  function linkify(node, sec) {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT), texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach(tn => {
      if (tn.parentNode.closest("a, b")) return;
      let s = tn.nodeValue, out = "", used = false;
      while (s.length) {
        let best = null;
        for (const [re, tg] of RULES) { const m = s.match(re); if (m && (best === null || m.index < best.m.index)) best = { m, tg }; }
        if (!best) { out += esc(s); break; }
        const name = best.m[0], tgt = typeof best.tg === "function" ? best.tg(name, sec) : best.tg;
        out += esc(s.slice(0, best.m.index)) + render(name, tgt); used = true;
        s = s.slice(best.m.index + name.length);
      }
      if (used) { const span = document.createElement("span"); span.innerHTML = out; tn.replaceWith(span); }
    });
  }
  const isSource = e => /^\s*Sources?:/.test(e.textContent) || e.matches(".vd-src") || (e.matches(".tnote, small, li, p") && /Upply \(2025\)/.test(e.textContent));
  window.linkSources = root => $$(".src, p, li, small, td, dd", root).filter(e => !e.dataset.linked && isSource(e) && !$(".src, p", e) && !e.closest("#references"))
    .forEach(e => { e.dataset.linked = "1"; const s = e.closest("section"); linkify(e, s ? s.id : ""); });
  window.linkSources(document.querySelector("main"));
})();
