  /* A7b (v2b): tariff elimination path under the EVFTA, Table 3.4. Ranges stay ranges; "the rest" has no number. */
  R["tariff-path"] = (s, w) => {
    const fs = FS(.66), fv = FS(.72), id = "vzh" + (++UID), narrow = w < 640;
    const L = narrow ? 4 : Math.min(w * .24, fs * 12), Rr = fs * 1.2, rowH = fs * (narrow ? 8.6 : 7), Tp = fs * 1.2, B = fs * 2.6;
    const H = Tp + s.rows.length * rowH + B, x = lin(0, 100, L + 2, w - Rr);
    let g = gridX(s.axis.x.ticks, x, 0, H - B, fs, "%"), body = "";
    s.rows.forEach((r, i) => {
      const y0 = Tp + i * rowH + (narrow ? fs * 3 : fs * 1.6), bh = Math.max(26, fs * 2.1);
      const lo = V(r.entry.lo != null ? r.entry.lo : r.entry.v), hi = V(r.entry.hi != null ? r.entry.hi : r.entry.v);
      const fin = r.final.rest ? 100 : V(r.final.v);
      body += narrow ? T(2, y0 - fs * 1.85, r.party, { size: fs, weight: 700 }) : T(L - 10, y0 + bh * .7, wrap(r.party, L - 14, fs, 1), { anchor: "end", size: fs, weight: 700 });
      body += `<rect x="${f1(x(0))}" y="${f1(y0)}" width="${f1(x(100) - x(0))}" height="${f1(bh)}" fill="${K.tint2}" stroke="${K.line}"/>`;
      // final phase-out: dashed outline from the entry level to the final level
      body += mark(`<rect class="grow-x" style="--i:${stagger(i * 2 + 1, 4)}" x="${f1(x(hi))}" y="${f1(y0)}" width="${f1(x(fin) - x(hi))}" height="${f1(bh)}" fill="none" stroke="${K.blue}" stroke-width="1.8" stroke-dasharray="5 4"/>` +
        T(Math.min(x(fin), w - Rr), y0 + bh + fs * 1.35, r.final.label, { anchor: "end", size: fs, fill: K.axis }),
        `${r.party}\nFinal phase-out: ${r.final.label}`, [x(hi), y0 - 4, x(fin) - x(hi), bh + fs * 1.6]);
      // at entry into force: solid to the lower bound, hatched over the range
      body += mark(`<rect class="grow-x" style="--i:${stagger(i * 2, 4)}" x="${f1(x(0))}" y="${f1(y0)}" width="${f1(x(lo) - x(0))}" height="${f1(bh)}" fill="${K.blue}"/>` +
        (hi > lo ? `<rect x="${f1(x(lo))}" y="${f1(y0)}" width="${f1(x(hi) - x(lo))}" height="${f1(bh)}" fill="url(#${id})" stroke="${K.navy}" stroke-width="1"/>` : "") +
        T(x(0) + 8, y0 + bh / 2 + fv * .36, r.entry.short, { size: fv, weight: 700, fill: K.white, bg: K.blue }) +
        T(x(0), y0 - fs * .45, r.entry.label, { size: fs, fill: K.ink }),
        `${r.party}\nAt entry into force (1 Aug 2020): ${r.entry.label}`, [x(0), y0 - fs * 1.3, x(hi) - x(0), bh + fs * 1.3]);
    });
    return {
      html: svg(w, H, g + body, s.aria, hatch(id)),
      legend: legendItem(swatch(K.blue), "Duty-free at entry into force (1 Aug 2020)") + legendItem(hatchSwatch(), "Range given by the sources") + legendItem(`<rect x="-8" y="-6" width="16" height="12" fill="none" stroke="${K.blue}" stroke-width="1.8" stroke-dasharray="4 3"/>`, "Phased out later"),
      table: { cap: s.title, head: ["Party", "At entry into force (1 Aug 2020)", "Final phase-out"], rows: s.rows.map(r => [r.party, r.entry.label, r.final.label]) }
    };
  };

