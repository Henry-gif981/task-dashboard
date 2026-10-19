#!/usr/bin/env python3
"""Review 2026-10, phase 3 (cont.): event names on the EVIPA lane (slide 41) and on Mercosur (slide 28)."""
import json, re
from pathlib import Path
P = Path(__file__).resolve().parent.parent / "index.html"; h = P.read_text(encoding="utf-8")
def rep(s, a, b):
    assert s.count(a) == 1, a[:90]; return s.replace(a, b)
h = rep(h, "const lab = V(it.date), tw = textW(lab, fs) * 1.2 + 10, cands = [];",
           "const lab = V(it.date) + (it.short ? \" · \" + it.short : \"\"), tw = textW(lab, fs) * 1.2 + 10, cands = [];   // date and, where given, the event")
h = rep(h, "const k = ev.findIndex(e => e.type === row.status), lx = xs[k], lab = V(ev[k].date), tw = textW(lab, fs, 1);",
           "const k = ev.findIndex(e => e.type === row.status), lx = xs[k], lab = V(ev[k].date) + (ev.length > 1 ? \" (\" + ev.filter((_, j) => j !== k).map(e => e.what.toLowerCase() + \" \" + V(e.date)).join(\"; \") + \")\" : \"\"), tw = textW(lab, fs, 1);")
m = re.search(r'(<script type="application/json" id="viz-data">)(.*?)(</script>)', h, re.S)
d = json.loads(m.group(2)); V = {x["key"]: x for x in d["visuals"]}
SHORT = ["Opinion 2/15", "both signed", "EP consent", "Council (EVFTA)", "VN ratifies both", "EVFTA in force", "DE: to Bundestag", "PL: 20th ratification", "FR: bill to Parliament"]
items = V["B1"]["lanes"][1]["items"]; assert len(items) == len(SHORT)
for it, sh in zip(items, SHORT): it["short"] = sh
h = h[:m.start(2)] + json.dumps(d, ensure_ascii=False) + h[m.end(2):]
h = rep(h, "lh = fs * 1.3, rowsL = narrow ? 3 : 4;", "lh = fs * 1.3, rowsL = narrow ? 5 : 6;   // room for date + event labels")
P.write_text(h, encoding="utf-8")

# label candidates: also 80% / 20% to the left of the mark; width estimate x1.1 (labels at the right edge found no room)
h = P.read_text(encoding="utf-8")
for a, b in [("lh = fs * 1.3, rowsL = narrow ? 5 : 6;   // room for date + event labels", "lh = fs * 1.3, rowsU = narrow ? 3 : 4, rowsL = narrow ? 7 : 9;   // label rows above the upper lane, below the lower lane (date + event)"),
             ("const laneY = [titleH + rowsL * lh + r * 6.5, 0];", "const laneY = [titleH + rowsU * lh + r * 6.5, 0];"),
             ("for (let k = 0; k < rowsL; k++) {", "for (let k = 0; k < (li ? rowsL : rowsU); k++) {")]:
    h = rep(h, a, b)
P.write_text(h, encoding="utf-8")
