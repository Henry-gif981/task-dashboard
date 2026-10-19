  /* ---------- "View data" panels (v3b update): everything behind a visual, written out ----------
     Header: what the visual shows, what is measured, where it is in the report (section, table or
     figure, page of the report PDF), the source (linked by sources.js), every note.
     Then the data table with units, a table of the calculations made from those values (formula
     shown, "derived" = calculated here, not printed in the report), and what each status means. */
  const r1 = n => (Math.round(n * 10) / 10).toFixed(1);
  const sgn = (n, d = 1) => (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n).toFixed(d);
  const pct = (a, b) => sgn((a - b) / Math.abs(b) * 100) + "%";
  const P = o => o && typeof o === "object" ? (o.txt != null ? o.txt : String(o.v)) : String(o);   // a value as the report prints it
  const yoy = (cats, objs, unit) => cats.slice(1).map((c, i) => [`${cats[i]} → ${c}`, `${P(objs[i + 1])} − ${P(objs[i])}`, sgn(V(objs[i + 1]) - V(objs[i]), objs.every(o => Number.isInteger(V(o))) ? 0 : 1) + " " + unit, pct(V(objs[i + 1]), V(objs[i]))]);
  const DETAILS = {
    A1: { where: "Section 1.2.1, Table 1.1 \"Key Milestones in the Historical Development of the European Union\" (report PDF pp. 7–8)",
      calc: s => { const j = s.items.filter(i => i.mark === "join"), l = s.items.filter(i => i.mark === "leave");
        return { head: ["Count", "Milestones", "Number"], rows: [["Milestones in Table 1.1", "all rows", String(s.items.length)], ["Enlargements (members join)", j.map(i => V(i.year)).join(", "), String(j.length)], ["A member leaves", l.map(i => V(i.year)).join(", "), String(l.length)]] }; } },
    B4: { where: "Section 1.1.2 \"Levels of regional economic integration\" (report PDF p. 5); the five levels follow Balassa (1961)" },
    B5: { where: "Section 1.2.2 \"Institutional structure\" (report PDF p. 9); arrows only where the text states the relation" },
    A2: { where: "Section 2.1.1, paragraph on monetary integration (report PDF p. 14)",
      calc: s => ({ head: ["Calculation", "Formula", "Result"], rows: [["Member states outside the euro", `${V(s.total)} − ${V(s.euro)}`, String(V(s.total) - V(s.euro))], ["Share of member states using the euro", `${V(s.euro)} ÷ ${V(s.total)}`, r1(V(s.euro) / V(s.total) * 100) + "%"]] }) },
    "F2.1a": { where: "Section 2.1.1, \"Figure 1. EU trade in goods, 2021–2025 (EUR billion)\" of the report (report PDF p. 14), left part",
      calc: s => ({ head: ["Period", "Formula (EUR billion)", "Change", "Change (%)"], rows: yoy(s.cats, s.values.map(r => r[0]), "bn") }) },
    "F2.1b": { where: "Section 2.1.1, \"Figure 1. EU trade in goods, 2021–2025 (EUR billion)\" of the report (report PDF p. 14), balance labels",
      calc: s => ({ head: ["Year", "Balance (EUR billion)", "Surplus or deficit", "Change on previous year"], rows: s.cats.map((c, i) => { const v = V(s.values[i][0]), p = i ? V(s.values[i - 1][0]) : null; return [c, sgn(v, 0), v >= 0 ? "surplus" : "deficit", p == null ? "—" : `${sgn(v, 0)} − (${sgn(p, 0)}) = ${sgn(v - p, 0)}`]; }) }) },
    "F2.2": { where: "Section 2.1.2, Figure 2.2 \"Number of EU Member States, 1957–2026\" and Table 2.2 \"Waves of enlargement of the EU\" (report PDF p. 16)",
      calc: s => ({ head: ["Year", "Members before → after", "Change"], rows: s.points.slice(1).map((p, i) => [String(V(p.year)), `${V(s.points[i].members)} → ${V(p.members)}`, sgn(V(p.members) - V(s.points[i].members), 0)]) }) },
    "F2.3": { where: "Section 2.2.1, Figure 2.3 \"EU imports of goods from its three largest partners, 2025\" (report PDF p. 19); the same values are in Table 2.3 (report PDF p. 18)",
      calc: s => { const v = s.values.map(r => V(r[0])), sh = s.values.map(r => parseFloat(r[0].sub)); return { head: ["Calculation", "Formula", "Result"], rows: [
        ["Imports from the three partners together", v.join(" + "), r1(v.reduce((a, b) => a + b, 0)) + " EUR bn"],
        ["Their combined share of EU imports", sh.join("% + ") + "%", r1(sh.reduce((a, b) => a + b, 0)) + "%"],
        ["China compared with the United States", `${v[0]} ÷ ${v[1]}`, (v[0] / v[1]).toFixed(2) + " times"]] }; } },
    "F2.4": { where: "Section 2.2.1, Figure 2.4 \"EU trade balance by product group, 2015 and 2025\" (report PDF p. 19); text and Table 2.3 (report PDF p. 18)",
      calc: s => ({ head: ["Product group", "Formula: 2025 − 2015 (EUR billion)", "Change", "Reading"], rows: s.cats.map((c, i) => { const a = V(s.values[i][0]), b = V(s.values[i][1]);
        return [c, `${sgn(b)} − (${sgn(a)})`, sgn(b - a), a < 0 && b < 0 ? "deficit widened" : a >= 0 && b < 0 ? "surplus turned into a deficit" : b > a ? "surplus grew" : "surplus shrank"]; }) }) },
    A4: { where: "Section 2.2.1, Table 2.4 \"Selected EU trade agreements and their status\" (report PDF p. 20)",
      calc: s => { const c = {}; s.rows.forEach(r => { const k = s.statuses[r.status]; c[k] = (c[k] || []).concat(r.partner); });
        return { head: ["Latest status", "Agreements", "Number"], rows: Object.entries(c).map(([k, v]) => [k, v.join(", "), String(v.length)]) }; } },
    A5: { where: "Section 2.2.3 \"Global Standards and Sustainable Development\" (report PDF pp. 24–25)" },
    B1: { where: "Section 3.1.1, Table 3.1 \"Key milestones in Vietnam–EU relations\" (report PDF p. 26) and Section 3.1.3 (report PDF pp. 28–30)" },
    A7b: { where: "Section 3.1.3, Table 3.4 \"Main tariff commitments under the EVFTA\" (report PDF p. 29)" },
    B2: { where: "Section 3.1.3, paragraph on the EVIPA (report PDF p. 30)",
      calc: s => ({ head: ["Calculation", "Formula", "Result"], rows: [["Member states that have not ratified", `${V(s.total)} − ${V(s.euro)}`, String(V(s.total) - V(s.euro))], ["Share that have ratified", `${V(s.euro)} ÷ ${V(s.total)}`, r1(V(s.euro) / V(s.total) * 100) + "%"]] }) },
    "F3.1": { where: "Section 3.2.1, Table 3.5 \"EU–Vietnam trade in goods, 2019–2025\" and Figure 3.1 (report PDF p. 30)",
      calc: s => ({ head: ["Year", "Vietnam's surplus = EU imports − EU exports (EUR bn)", "Total trade, change on previous year"], rows: s.bars.map((b, i) => { const e = V(b.exports), m = V(b.imports), t = V(b.total), p = i ? V(s.bars[i - 1].total) : null;
        return [String(V(b.year)), `${P(b.exports)} − ${P(b.imports)} = ${r1(e - m)}`, p == null ? "—" : `${P(b.total)} vs ${P(s.bars[i - 1].total)}: ${sgn(t - p)} bn (${pct(t, p)})`]; }).concat([["2019 → 2025", "", `${P(s.bars[s.bars.length - 1].total)} vs ${P(s.bars[0].total)}: ${sgn(V(s.bars[s.bars.length - 1].total) - V(s.bars[0].total))} bn (${pct(V(s.bars[s.bars.length - 1].total), V(s.bars[0].total))})`]]) }) },
    A8a: { where: "Section 3.2.1, Table 3.6 \"Vietnam–EU trade in goods, Vietnamese statistics\" (report PDF p. 31)",
      calc: s => ({ head: ["Indicator", "Formula: 2025 − 2019 (US$ billion)", "Change", "Change in Table 3.6"], rows: s.rows.map(r => [r.name, `${P(r.b)} − ${P(r.a)}`, (r.b.s === "approximate" ? "≈ " : "") + sgn(V(r.b) - V(r.a)), V(r.change)]) }) },
    "F3.2": { where: "Section 3.2.1, Figure 3.2 \"Main product groups in EU–Vietnam trade, 2025\" (report PDF p. 32)",
      calc: s => ({ head: ["Product group", "Vietnam's surplus = EU imports − EU exports (EUR bn)", "EU imports per euro of EU exports"], rows: s.rows.map(r => [r.name, `${P(r.a)} − ${P(r.b)} = ${sgn(V(r.a) - V(r.b))}`, (V(r.a) / V(r.b)).toFixed(1) + "×"]) }) },
    A8s: { where: "Section 3.2.1, Table 3.7 \"EU investment in Vietnam before and after the EVFTA\" (report PDF pp. 32–33)",
      calc: s => ({ head: ["Calculation", "Formula", "Result"], rows: [["Change in the EU share", `${P(s.values[1][0])} − ${P(s.values[0][0])}`, "≈ " + sgn(V(s.values[1][0]) - V(s.values[0][0])) + " percentage points"], ["Latest share as estimated in the report", "27.8 ÷ 496.7 (US$ bn)", "≈ " + r1(27.8 / 496.7 * 100) + "%"]] }) },
    A8i: { where: "Section 3.2.1, Table 3.7, row \"Annual European FDI inflow\" (report PDF pp. 32–33)",
      calc: s => { const a = V(s.values[0][0]), b = V(s.values[1][0]); return { head: ["Calculation", "Formula", "Result"], rows: [["Change 2022 → 2024", `${b} − ${a}`, sgn(b - a, 2) + " US$ bn"], ["Change in %", `(${b} − ${a}) ÷ ${a}`, pct(b, a)]] }; } }
  };
  const STATUS_KEY = [["exact", "the number is printed in the report's text or tables"], ["figure label", "read from the value label in the report's figure"],
    ["≈", "approximate, as the report gives it"], ["derived", "calculated from numbers of the report; the formula is shown"]];
  const tableHtml = (tb, unit) => {
    const n = tb.num || [];
    const head = tb.head.map((h, i) => n.includes(i) && unit && !/[(%]/.test(h) ? `${h} (${unit})` : h);
    return `<div class="vd-tw"><table><caption>${esc(tb.cap)}</caption><thead><tr>${head.map((h, i) => `<th scope="col"${n.includes(i) ? ' class="num"' : ""}>${esc(h)}</th>`).join("")}</tr></thead><tbody>${tb.rows.map(r => `<tr>${r.map((c, i) => `<td${n.includes(i) ? ' class="num"' : i === r.length - 1 && tb.status ? ' class="st"' : ""}>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  };
  function fillTable(root, tb, s) {
    s = s || {};
    const d = DETAILS[s.key] || {}, fig = root.closest("figure") || root.parentElement.closest("figure");
    const cap = fig && fig.querySelector(":scope > figcaption:not(.vz-head)");
    const title = s.title ? (s.label ? s.label + ": " : "") + s.title : cap ? cap.textContent.replace(/\s+/g, " ").trim() : tb.cap;
    let src = s.source;
    if (!src) { let e = fig && fig.querySelector(":scope > .src") || (fig || root).nextElementSibling; while (e && !e.matches(".src")) e = e.nextElementSibling; src = e ? e.textContent.replace(/^\s*Sources?:\s*/, "").trim() : ""; }
    const meta = [["Visual", title], ["What is measured", s.unit], ["In the report", d.where], ["Source", src]].filter(m => m[1]);
    const calc = d.calc ? d.calc(s) : null;
    const stats = new Set(tb.status ? tb.rows.map(r => String(r[r.length - 1])) : []);
    const key = STATUS_KEY.filter(([k]) => [...stats].some(x => x.includes(k)));
    root.querySelector(".vz-table").innerHTML = `<div class="vd-sheet">` +
      `<dl class="vd-meta">${meta.map(([k, v]) => `<dt>${k}</dt><dd${k === "Source" ? ' class="vd-src"' : ""}>${esc(v)}</dd>`).join("")}` +
      (s.notes ? `<dt>Notes</dt><dd><ul>${s.notes.map(x => `<li>${esc(x)}</li>`).join("")}</ul></dd>` : "") +
      (s.sowhat ? `<dt>Reading</dt><dd>${esc(s.sowhat)}</dd>` : "") + `</dl>` +
      `<h4 class="vd-h">Data shown in the visual</h4>` + tableHtml(tb, s.unitShort) +
      (calc ? `<h4 class="vd-h">Calculated from these values <span>(derived: not printed in the report)</span></h4>` + tableHtml({ cap: "Calculations: " + title, head: calc.head, rows: calc.rows, num: [] }) : "") +
      (key.length ? `<p class="vd-key"><b>Status:</b> ${key.map(([k, v]) => `<i>${esc(k)}</i> = ${esc(v)}`).join("; ")}.</p>` : "") +
      `</div>`;
    if (window.linkSources) window.linkSources(root.querySelector(".vz-table"));
  }
