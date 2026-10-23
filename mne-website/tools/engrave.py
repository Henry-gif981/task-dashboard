"""Generate the site's vintage "engraving" illustrations as single-colour SVGs.

Every picture is drawn here from code (outline + parallel hatching for shade), so
the site uses no third-party images. Coastlines come from Natural Earth via the
world-atlas package (public domain / ISC, see tools/data/world-atlas-LICENSE).

    python3 tools/engrave.py            # writes assets/img/*.svg
"""
import json, math, pathlib, random

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "img"
DATA = pathlib.Path(__file__).resolve().parent / "data"
INK = "#24364D"
PAPER = "#F4EBD0"
RED = "#9E3B3B"
random.seed(7)


def f(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


def pts(p):
    return " ".join(f"{f(x)},{f(y)}" for x, y in p)


def poly(p, close=True):
    return "M" + " L".join(f"{f(x)} {f(y)}" for x, y in p) + (" Z" if close else "")


class Svg:
    def __init__(self, w, h, title, prefix):
        self.w, self.h, self.title, self.p = w, h, title, prefix
        self.defs, self.body, self.n = [], [], 0

    def id(self):
        self.n += 1
        return f"{self.p}{self.n}"

    def clip(self, d):
        i = self.id()
        inner = f'<use href="#{d[1:]}"/>' if d.startswith("#") else f'<path d="{d}"/>'
        self.defs.append(f'<clipPath id="{i}">{inner}</clipPath>')
        return i

    def shape(self, d):
        """Store a long path once in <defs>; returns '#id' usable by clip() and use()."""
        i = self.id()
        self.defs.append(f'<path id="{i}" d="{d}"/>')
        return "#" + i

    def add(self, s):
        self.body.append(s)

    def path(self, d, sw=1.2, fill="none", stroke=INK, extra=""):
        self.add(f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>')

    def hatch(self, clip_d, angle, gap, sw=0.7, box=None, op=1, wobble=0.0):
        """Parallel lines at `angle` degrees, `gap` px apart, clipped to clip_d."""
        cid = self.clip(clip_d)
        x0, y0, x1, y1 = box or (0, 0, self.w, self.h)
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        r = math.hypot(x1 - x0, y1 - y0) / 2 + 2
        a = math.radians(angle)
        dx, dy = math.cos(a), math.sin(a)
        nx, ny = -dy, dx
        d, t = [], -r
        while t <= r:
            px, py = cx + nx * t, cy + ny * t
            d.append(f"M{f(px - dx * r)} {f(py - dy * r)}L{f(px + dx * r)} {f(py + dy * r)}")
            t += gap * (1 + random.uniform(-wobble, wobble))
        o = f' opacity="{op}"' if op != 1 else ""
        self.add(f'<g clip-path="url(#{cid})"{o}><path d="{"".join(d)}" stroke="{INK}" stroke-width="{sw}" fill="none"/></g>')

    def lines(self, segs, sw=0.7, clip_d=None, op=1):
        d = "".join(f"M{f(a)} {f(b)}L{f(c)} {f(e)}" for a, b, c, e in segs)
        o = f' opacity="{op}"' if op != 1 else ""
        if clip_d:
            cid = self.clip(clip_d)
            self.add(f'<g clip-path="url(#{cid})"{o}><path d="{d}" stroke="{INK}" stroke-width="{sw}" fill="none" stroke-linecap="round"/></g>')
        else:
            self.add(f'<path d="{d}" stroke="{INK}" stroke-width="{sw}" fill="none" stroke-linecap="round"{o}/>')

    def polylines(self, runs, sw=0.7, clip_d=None, op=1):
        d = "".join("M" + "L".join(f"{f(x)} {f(y)}" for x, y in r) for r in runs if len(r) > 1)
        o = f' opacity="{op}"' if op != 1 else ""
        c = f' clip-path="url(#{self.clip(clip_d)})"' if clip_d else ""
        self.add(f'<g{c}{o}><path d="{d}" stroke="{INK}" stroke-width="{sw}" fill="none"/></g>')

    def write(self, name):
        s = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {self.h}" role="img">'
             f"<title>{self.title}</title><defs>{''.join(self.defs)}</defs>"
             f'<g stroke-linejoin="round">{"".join(self.body)}</g></svg>')
        (OUT / name).write_text(s)
        print(f"{name}: {len(s) // 1024} KB")


# ---------------------------------------------------------------- geo helpers
def topo_polys(fname, obj, pick=None):
    t = json.loads((DATA / fname).read_text())
    sx, sy = t["transform"]["scale"]
    tx, ty = t["transform"]["translate"]
    arcs = []
    for arc in t["arcs"]:
        x = y = 0
        a = []
        for dx, dy in arc:
            x += dx
            y += dy
            a.append((x * sx + tx, y * sy + ty))
        arcs.append(a)

    def ring(ix):
        out = []
        for i in ix:
            a = arcs[i] if i >= 0 else arcs[~i][::-1]
            out.extend(a if not out else a[1:])
        return out

    polys = []
    for g in t["objects"][obj]["geometries"]:
        if pick and g.get("id") != pick:
            continue
        if g["type"] == "Polygon":
            polys.append([ring(r) for r in g["arcs"]])
        elif g["type"] == "MultiPolygon":
            polys.extend([[ring(r) for r in p] for p in g["arcs"]])
    return polys


def thin(q, eps=1.3):
    out = [q[0]]
    for p in q[1:]:
        if math.hypot(p[0] - out[-1][0], p[1] - out[-1][1]) >= eps:
            out.append(p)
    return out


def densify(r, step=1.5):
    out = []
    for (a, b), (c, d) in zip(r, r[1:] + r[:1]):
        n = max(1, int(math.hypot(c - a, d - b) / step))
        out.extend((a + (c - a) * k / n, b + (d - b) * k / n) for k in range(n))
    return out


def ortho(lon0, lat0, R, cx, cy):
    l0, p0 = math.radians(lon0), math.radians(lat0)

    def pr(lon, lat, rim=True):
        l, p = math.radians(lon), math.radians(lat)
        cosc = math.sin(p0) * math.sin(p) + math.cos(p0) * math.cos(p) * math.cos(l - l0)
        x = math.cos(p) * math.sin(l - l0)
        y = math.cos(p0) * math.sin(p) - math.sin(p0) * math.cos(p) * math.cos(l - l0)
        if cosc < 0:
            if not rim:
                return None
            n = math.hypot(x, y) or 1
            x, y = x / n, y / n  # push hidden points onto the horizon
        return cx + R * x, cy - R * y, cosc >= 0
    return pr


def coast_ripples(svg, ref, widths, clip):
    """Engraver's water lines: concentric offsets of the coast, drawn outside the land."""
    cid = svg.clip(clip)
    g = []
    for w, op in widths:
        g.append(f'<use href="{ref}" fill="none" stroke="{INK}" stroke-width="{w + 0.9}" opacity="{op}"/>'
                 f'<use href="{ref}" fill="none" stroke="{PAPER}" stroke-width="{w}"/>')
    svg.add(f'<g clip-path="url(#{cid})" stroke-linejoin="round">{"".join(g[::-1])}</g>')


# ---------------------------------------------------------------- globe
def globe():
    W, H = 560, 660
    cx, cy, R = 280, 270, 200
    s = Svg(W, H, "Engraving of a terrestrial globe on a turned stand, centred on Viet Nam", "g")
    pr = ortho(106, 14, R, cx, cy)
    circle = f"M{cx - R} {cy}a{R} {R} 0 1 0 {2 * R} 0a{R} {R} 0 1 0 {-2 * R} 0Z"

    # stand: pedestal (behind), horizon ring back half
    ped = [(cx - 16, 470), (cx - 24, 500), (cx - 12, 520), (cx - 34, 560), (cx - 70, 585), (cx - 110, 598),
           (cx + 110, 598), (cx + 70, 585), (cx + 34, 560), (cx + 12, 520), (cx + 24, 500), (cx + 16, 470)]
    pd = poly(ped)
    s.path(pd, 1.4, PAPER)
    segs = []
    for k in range(40):
        t = k / 39
        x = cx - 110 + 220 * (t ** 0.75)
        segs.append((x, 465, x, 600))
    s.lines(segs, 0.6, pd, 0.85)
    s.path(f"M{cx - 150} 598 Q{cx} 640 {cx + 150} 598 L{cx + 150} 612 Q{cx} 654 {cx - 150} 612Z", 1.4, PAPER)
    s.hatch(f"M{cx - 150} 598 Q{cx} 640 {cx + 150} 598 L{cx + 150} 612 Q{cx} 654 {cx - 150} 612Z", 90, 3.2, 0.6)
    s.path(f"M{cx - 150} 598 Q{cx} 556 {cx + 150} 598 Q{cx} 640 {cx - 150} 598Z", 1.2, PAPER)

    # meridian ring (annulus) with tick marks
    Ro, Ri = R + 26, R + 12
    ann = (f"M{cx - Ro} {cy}a{Ro} {Ro} 0 1 0 {2 * Ro} 0a{Ro} {Ro} 0 1 0 {-2 * Ro} 0Z"
           f"M{cx - Ri} {cy}a{Ri} {Ri} 0 1 1 {2 * Ri} 0a{Ri} {Ri} 0 1 1 {-2 * Ri} 0Z")
    s.path(ann, 1.3, PAPER, extra='fill-rule="evenodd"')
    tk = []
    for k in range(180):
        a = math.radians(k * 2)
        r2 = Ri + (8 if k % 5 == 0 else 4)
        tk.append((cx + Ri * math.cos(a), cy + Ri * math.sin(a), cx + r2 * math.cos(a), cy + r2 * math.sin(a)))
    s.lines(tk, 0.5)
    s.hatch(ann, 35, 3.4, 0.5, (cx - Ro, cy - Ro, cx + Ro, cy + Ro), 0.55)

    # sphere: sea
    s.path(circle, 1.6, PAPER)
    def runs(cells):
        out, cur = [], []
        for p in cells:
            if p:
                cur.append(p[:2])
            elif cur:
                out.append(cur); cur = []
        if cur:
            out.append(cur)
        return out
    sea = []
    for lat in range(-80, 81, 4):  # engraved sea: fine parallels
        sea += runs([pr(lon, lat, rim=False) for lon in range(-180, 181, 4)])
    s.polylines(sea, 0.45, circle, 0.7)

    # land
    land = topo_polys("land-110m.json", "land")
    d = []
    for p in land:
        for r in p:
            q = [pr(lon, lat) for lon, lat in densify(r, 3)]
            if not any(v[2] for v in q):
                continue
            d.append(poly(thin([(x, y) for x, y, _ in q])))
    ld = s.shape("".join(d))
    coast_ripples(s, ld, [(5, 0.55), (10, 0.4), (16, 0.25)], circle)
    cid = s.clip(circle)
    s.add(f'<g clip-path="url(#{cid})"><use href="{ld}" fill="{PAPER}" stroke="{INK}" stroke-width="1.1"/></g>')
    # stipple inland
    rnd = []
    for _ in range(420):
        lon, lat = random.uniform(40, 180), random.uniform(-45, 70)
        p = pr(lon, lat, rim=False)
        if p:
            rnd.append((p[0], p[1], p[0] + 0.6, p[1] + 0.4))
    s.lines(rnd, 1.1, ld, 0.5)

    # graticule
    g = []
    for lon in range(-180, 180, 15):
        g += runs([pr(lon, lat, rim=False) for lat in range(-90, 91, 3)])
    for lat in range(-75, 76, 15):
        g += runs([pr(lon, lat, rim=False) for lon in range(-180, 181, 3)])
    s.polylines(g, 0.8, circle, 0.9)

    # Viet Nam
    vn = topo_polys("countries-110m.json", "countries", "704")
    vd = "".join(poly([pr(lon, lat)[:2] for lon, lat in r]) for p in vn for r in p)
    s.add(f'<path d="{vd}" fill="{RED}" stroke="{RED}" stroke-width="1" opacity=".9"/>')

    # terminator shading (cross-hatched crescent, lower right)
    sh = f"{circle}M{cx - R - 60} {cy - 40}a{R + 10} {R + 10} 0 1 1 {2 * R + 20} 0a{R + 10} {R + 10} 0 1 1 {-2 * R - 20} 0Z"
    cid = s.clip(circle)
    s.add(f'<g clip-path="url(#{cid})">')
    s.hatch(sh.replace("Z", "Z", 1), 130, 3.0, 0.6, (cx - R, cy - R, cx + R, cy + R))
    s.add("</g>")
    sh2 = f"{circle}M{cx - R - 110} {cy - 80}a{R + 40} {R + 40} 0 1 1 {2 * R + 80} 0a{R + 40} {R + 40} 0 1 1 {-2 * R - 80} 0Z"
    cid = s.clip(circle)
    s.add(f'<g clip-path="url(#{cid})">')
    s.hatch(sh2, 45, 3.6, 0.55, (cx - R, cy - R, cx + R, cy + R))
    s.add("</g>")
    s.path(circle, 1.8)
    # fix the evenodd clip of crescents
    s.defs = [x.replace("<path d=", '<path clip-rule="evenodd" d=') for x in s.defs]

    # horizon ring front half
    hr = (f"M{cx - R - 48} {cy + 30} A{R + 48} 34 0 0 0 {cx + R + 48} {cy + 30}"
          f" L{cx + R + 48} {cy + 42} A{R + 48} 34 0 0 1 {cx - R - 48} {cy + 42}Z")
    s.path(hr, 1.3, PAPER)
    tk = []
    for k in range(0, 181, 3):
        a = math.radians(k)
        x = cx - (R + 48) * math.cos(a)
        y = cy + 30 + 34 * math.sin(a)
        tk.append((x, y, x, y + (12 if k % 15 == 0 else 6)))
    s.lines(tk, 0.55)
    s.write("globe.svg")


# ---------------------------------------------------------------- ship
def ship():
    W, H = 640, 600
    s = Svg(W, H, "Engraving of a three-masted merchant ship under sail", "s")
    # sky streaks
    s.lines([(40 + random.uniform(0, 40), y, 600 - random.uniform(0, 80), y) for y in range(40, 200, 9)], 0.4, None, 0.35)
    masts = [(210, 92), (330, 56), (440, 108)]
    deck = lambda x: 404 - 0.00022 * (x - 330) ** 2 * 100 / 100 - (x - 330) * -0.0  # gentle sheer
    # sails (behind rigging, in front of masts)
    for mx, top in masts:
        h = 404 - top
        yards = [top + 18 + h * k for k in (0, .22, .45, .70)]
        widths = [70, 110, 140, 168]
        for i in range(3):
            y0, y1 = yards[i], yards[i + 1] - 6
            w0, w1 = widths[i], widths[i + 1]
            bul = 16 + i * 5
            d = (f"M{f(mx - w0 / 2)} {f(y0)} L{f(mx + w0 / 2)} {f(y0)} L{f(mx + w1 / 2)} {f(y1)} "
                 f"Q{f(mx)} {f(y1 + bul)} {f(mx - w1 / 2)} {f(y1)}Z")
            s.path(d, 1.2, PAPER)
            segs = []
            for k in range(26):
                t = k / 25
                u = 0.55 + 0.45 * t ** 0.7
                xa = mx - w0 / 2 + w0 * u
                xb = mx - w1 / 2 + w1 * u
                yb = y1 + bul * 4 * u * (1 - u) * 0.98
                segs.append((xa, y0 + 1, xb, yb - 1))
            s.lines(segs, 0.55, d)
            seams = []
            for k in range(1, 4):
                yy = y0 + (y1 - y0) * k / 4
                ww = w0 + (w1 - w0) * k / 4
                seams.append((mx - ww / 2, yy, mx + ww / 2, yy + 3 * k / 4))
            s.lines(seams, 0.5, d, 0.7)
            s.lines([(mx - w0 / 2 - 6, y0, mx + w0 / 2 + 6, y0)], 2.2)
        s.lines([(mx, top, mx, 410)], 3.2)
        s.add(f'<path d="M{mx} {top} l0 -14 q12 -2 24 3 q-12 4 -24 2" fill="{PAPER}" stroke="{INK}" stroke-width="1"/>')
    # jibs
    for k, (bx, by) in enumerate([(612, 330), (590, 342)]):
        d = f"M{440} {130 + k * 40} L{bx} {by} L{455} {372 - k * 10}Z"
        s.path(d, 1.1, PAPER)
        s.hatch(d, 70, 4.5, 0.5, (440, 120, 620, 380), 0.8)
    # rigging
    rig = []
    for mx, top in masts:
        for k in range(5):
            rig.append((mx, top + 20, mx - 46 + k * 4, 398))
            rig.append((mx, top + 20, mx + 30 + k * 4, 398))
    rig += [(210, 100, 330, 64), (330, 64, 440, 112), (440, 112, 618, 344), (210, 100, 96, 342)]
    s.lines(rig, 0.45)
    # hull
    hull = ("M96 336 L134 340 Q330 398 520 368 L612 344 L596 356 Q560 396 520 432 "
            "Q330 470 168 448 Q132 438 112 408 Z")
    s.path(hull, 1.6, PAPER)
    s.hatch(hull, 0, 4.2, 0.6, (90, 330, 620, 470))
    planks = [(118 + k * 2, 360 + k * 13, 560 - k * 14, 380 + k * 9) for k in range(6)]
    s.lines(planks, 0.5, hull, 0.0)
    # shade lower hull
    low = "M112 408 Q132 438 168 448 Q330 470 520 432 Q560 396 596 356 L560 380 Q330 430 150 410Z"
    s.hatch(low, 25, 2.6, 0.6, (100, 350, 600, 470))
    # gun ports and wale
    s.path("M134 372 Q330 424 560 380", 2.2)
    s.path("M128 356 Q330 410 586 360", 1.0)
    for k in range(10):
        x = 170 + k * 38
        y = 384 + 0.00012 * (x - 340) ** 2 * -1 + (24 - abs(x - 340) / 18)
        s.add(f'<rect x="{f(x)}" y="{f(y)}" width="13" height="10" fill="{INK}"/>')
    # stern castle
    s.path("M96 336 L92 300 L150 304 L156 346", 1.3, PAPER)
    s.hatch("M96 336 L92 300 L150 304 L156 346Z", 90, 3.4, 0.55)
    s.path("M612 344 L640 322", 2.0)
    # sea
    waves = []
    for row in range(9):
        y = 430 + row * 18
        x = -20 + (row % 2) * 30
        while x < W + 20:
            w = random.uniform(46, 70)
            a = random.uniform(5, 9)
            waves.append(f"M{f(x)} {f(y)} q{f(w * .3)} {f(-a)} {f(w * .55)} {f(-a * .4)} q{f(w * .15)} {f(a * .3)} {f(w * .05)} {f(a * .7)}")
            waves.append(f"M{f(x + w * .55)} {f(y - a * .4)} q{f(w * .25)} {f(a)} {f(w * .45)} {f(a * .4)}")
            x += w
    s.add(f'<path d="{"".join(waves)}" fill="none" stroke="{INK}" stroke-width="1"/>')
    s.lines([(random.uniform(0, 600), y, random.uniform(0, 600) + 30, y) for y in range(440, 600, 6) for _ in range(3)], 0.5, None, 0.6)
    s.write("ship.svg")


# ---------------------------------------------------------------- factory with gears
def gear_path(cx, cy, r, teeth, depth, hole):
    p = []
    for i in range(teeth * 4):
        a = 2 * math.pi * i / (teeth * 4)
        rr = r if i % 4 in (0, 1) else r - depth
        p.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    d = poly(p)
    d += f"M{f(cx - hole)} {f(cy)}a{hole} {hole} 0 1 0 {2 * hole} 0a{hole} {hole} 0 1 0 {-2 * hole} 0Z"
    return d


def factory():
    W, H = 640, 560
    s = Svg(W, H, "Engraving of a factory with chimneys and large cog-wheels", "f")
    # smoke
    puffs = []
    for k in range(11):
        t = k / 10
        x = 438 - t * 300 + random.uniform(-8, 8)
        y = 70 - t * 30 + math.sin(t * 6) * 10
        rr = 18 + t * 30
        puffs.append((x, y, rr))
    blobs = []
    for x, y, rr in puffs:
        for _ in range(2):
            r2 = rr * random.uniform(.6, .85)
            blobs.append((x + random.uniform(-rr, rr) * .6, y + random.uniform(-rr, rr) * .45, r2))
    circ = lambda x, y, r: f"M{f(x - r)} {f(y)}a{f(r)} {f(r)} 0 1 0 {f(2 * r)} 0a{f(r)} {f(r)} 0 1 0 {f(-2 * r)} 0Z"
    sd = "".join(circ(*b) for b in blobs)
    s.add(f'<path d="{sd}" fill="none" stroke="{INK}" stroke-width="2.2"/><path d="{sd}" fill="{PAPER}"/>')
    lower = "".join(circ(x, y + r * .45, r * .85) for x, y, r in blobs)
    s.add(f'<g clip-path="url(#{s.clip(sd)})">')
    s.hatch(lower, 0, 3.2, 0.5, (100, 0, 520, 140), 0.85)
    s.add("</g>")
    curls = []
    for x, y, r in blobs[::2]:
        curls.append(f"M{f(x - r * .5)} {f(y - r * .1)}a{f(r * .5)} {f(r * .5)} 0 0 1 {f(r * .7)} {f(-r * .3)}")

    # chimneys
    for x, top, w in [(420, 60, 34), (480, 110, 28)]:
        d = f"M{x - w / 2 - 6} 300 L{x - w / 2} {top} L{x + w / 2} {top} L{x + w / 2 + 6} 300Z"
        s.path(d, 1.4, PAPER)
        segs = []
        for k in range(18):
            t = k / 17
            u = t ** 0.6
            segs.append((x - w / 2 + w * u, top, x - w / 2 - 6 + (w + 12) * u, 300))
        s.lines(segs, 0.6, d)
        for b in range(top + 16, 300, 46):
            s.lines([(x - w / 2 - 3, b, x + w / 2 + 3, b)], 2.2)
        s.add(f'<rect x="{x - w / 2 - 5}" y="{top - 8}" width="{w + 10}" height="10" fill="{PAPER}" stroke="{INK}" stroke-width="1.4"/>')
    # main building with saw-tooth roof
    x0, x1, base, eave = 40, 560, 470, 270
    roof = [(x0, eave)]
    tooth = 65
    x = x0
    while x < x1:
        roof += [(x, eave - 46), (x + tooth, eave)]
        x += tooth
    body = poly(roof + [(x1, eave), (x1, base), (x0, base)])
    s.path(body, 1.6, PAPER)
    # glazing on saw-tooth (vertical faces) and roof hatching
    x = x0
    while x < x1:
        tri = poly([(x, eave), (x, eave - 46), (x + tooth, eave)])
        s.hatch(tri, -35, 3.2, 0.55, (x, eave - 50, x + tooth, eave))
        s.lines([(x + 3, eave - 40 + k * 9, x + 3, eave - 32 + k * 9) for k in range(4)], 1.2)
        x += tooth
    # bricks
    wall = poly([(x0, eave), (x1, eave), (x1, base), (x0, base)])
    br = [(x0, y, x1, y) for y in range(eave + 8, base, 8)]
    for i, y in enumerate(range(eave, base, 8)):
        for xx in range(x0 + (i % 2) * 9, x1, 18):
            br.append((xx, y, xx, y + 8))
    s.lines(br, 0.35, wall, 0.75)
    # arched windows
    for i in range(7):
        wx = x0 + 34 + i * 72
        for row, wy in enumerate((300, 380)):
            d = f"M{wx} {wy + 50} L{wx} {wy + 14} A20 14 0 0 1 {wx + 40} {wy + 14} L{wx + 40} {wy + 50}Z"
            s.path(d, 1.3, PAPER)
            s.hatch(d, 0, 2.2, 0.7, (wx, wy, wx + 40, wy + 50))
            s.lines([(wx + 20, wy, wx + 20, wy + 50), (wx, wy + 30, wx + 40, wy + 30)], 1.6)
    s.path(wall, 1.6)
    # ground
    s.lines([(0, base, W, base)], 1.6)
    s.lines([(random.uniform(0, W - 60), y, random.uniform(0, W - 60) + 50, y) for y in range(476, 560, 7) for _ in range(4)], 0.5, None, 0.6)
    # gears in front (cut-out)
    for cx, cy, r, n, rot in [(150, 440, 112, 16, 0), (318, 486, 70, 11, 8)]:
        d = gear_path(cx, cy, r, n, 15, r * 0.18)
        s.add(f'<g transform="rotate({rot} {cx} {cy})">')
        s.path(d, 1.6, PAPER, extra='fill-rule="evenodd"')
        s.hatch(d, 40, 3.0, 0.6, (cx - r, cy - r, cx + r, cy + r))
        rim = r - 30
        inner = f"M{cx - rim} {cy}a{rim} {rim} 0 1 0 {2 * rim} 0a{rim} {rim} 0 1 0 {-2 * rim} 0Z"
        s.path(inner, 1.4, PAPER)
        for k in range(5):
            a = 2 * math.pi * k / 5 + 0.3
            hb = r * 0.18 + 6
            sp = poly([(cx + hb * math.cos(a - .5), cy + hb * math.sin(a - .5)),
                       (cx + rim * math.cos(a - .14), cy + rim * math.sin(a - .14)),
                       (cx + rim * math.cos(a + .14), cy + rim * math.sin(a + .14)),
                       (cx + hb * math.cos(a + .5), cy + hb * math.sin(a + .5))])
            s.path(sp, 1.2, PAPER)
            s.hatch(sp, 130, 2.6, 0.55, (cx - rim, cy - rim, cx + rim, cy + rim))
        hub = r * 0.18 + 8
        s.path(f"M{cx - hub} {cy}a{hub} {hub} 0 1 0 {2 * hub} 0a{hub} {hub} 0 1 0 {-2 * hub} 0Z", 1.4, PAPER)
        s.path(f"M{cx - r * .12} {cy}a{r * .12} {r * .12} 0 1 0 {r * .24} 0a{r * .12} {r * .12} 0 1 0 {-r * .24} 0Z", 1, INK)
        s.add("</g>")
    s.defs = [x.replace("<path d=", '<path clip-rule="evenodd" d=') for x in s.defs]
    s.write("factory.svg")


# ---------------------------------------------------------------- port: crane + containers
def port():
    W, H = 680, 560
    s = Svg(W, H, "Engraving of a port gantry crane lifting a shipping container", "p")
    # sky streaks
    s.lines([(random.uniform(0, 300), y, random.uniform(380, 680), y) for y in range(30, 140, 10)], 0.4, None, 0.3)
    # crane legs (A-frame) as lattice
    def truss(a, b, c, d, n, sw=1.3):
        # two chords a->b and c->d with zig-zag bracing
        s.lines([(*a, *b), (*c, *d)], sw)
        seg = []
        for k in range(n):
            t0, t1 = k / n, (k + 1) / n
            p0 = (a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0)
            q1 = (c[0] + (d[0] - c[0]) * t1, c[1] + (d[1] - c[1]) * t1)
            p1 = (a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1)
            seg += [(*p0, *q1), (*q1, *p1)]
        s.lines(seg, 0.8)
    truss((420, 470), (440, 150), (446, 470), (458, 150), 14)
    truss((560, 470), (520, 150), (586, 470), (538, 150), 14)
    truss((410, 330), (590, 330), (410, 342), (590, 342), 8)
    # boom
    truss((60, 140), (660, 140), (60, 162), (660, 162), 34)
    s.lines([(470, 140, 490, 60), (510, 140, 490, 60), (490, 60, 120, 140), (490, 60, 660, 140)], 1.0)
    s.add(f'<rect x="452" y="96" width="76" height="44" fill="{PAPER}" stroke="{INK}" stroke-width="1.4"/>')
    s.hatch("M452 96h76v44h-76Z", 90, 3, 0.6)
    s.add(f'<rect x="210" y="162" width="36" height="22" fill="{PAPER}" stroke="{INK}" stroke-width="1.2"/>')
    s.lines([(220, 184, 214, 268), (236, 184, 242, 268)], 0.8)
    # hanging container
    def container(x, y, w, h, dark=False, sw=1.4):
        d = f"M{x} {y}h{w}v{h}h{-w}Z"
        s.path(d, sw, PAPER)
        s.lines([(x + k, y + 2, x + k, y + h - 2) for k in range(4, int(w), 5)], 0.6, d)
        if dark:
            s.hatch(d, 0, 2.4, 0.5, (x, y, x + w, y + h))
        s.lines([(x, y + 4, x + w, y + 4), (x, y + h - 4, x + w, y + h - 4)], 1.0)
    container(170, 268, 116, 44)
    s.lines([(170, 268, 228, 252), (286, 268, 228, 252)], 0.8)
    # ship hull at left with stacked containers
    hull = "M0 412 L330 412 L312 470 L0 470Z"
    for row in range(3):
        for col in range(5):
            container(8 + col * 60, 358 - row * 32, 58, 30, (row + col) % 3 == 0, 1.1)
    s.path(hull, 1.6, PAPER)
    s.hatch(hull, 0, 3.0, 0.6, (0, 410, 340, 470))
    s.add(f'<rect x="0" y="412" width="324" height="8" fill="{INK}"/>')
    # quay stacks at right
    for row in range(2):
        for col in range(2):
            container(600 + col * 0, 404 - row * 32 - col * 0, 80, 30, row == 1)
    s.lines([(330, 470, 680, 470)], 1.6)
    # water
    waves = []
    for y in range(480, 560, 9):
        x = random.uniform(-30, 0)
        while x < W:
            w = random.uniform(30, 60)
            waves.append(f"M{f(x)} {f(y)}q{f(w / 2)} {f(-4)} {f(w)} 0")
            x += w + random.uniform(4, 16)
    s.add(f'<path d="{"".join(waves)}" fill="none" stroke="{INK}" stroke-width=".8"/>')
    s.write("port.svg")


# ---------------------------------------------------------------- compass rose
def rose_path(cx, cy, R, n=8):
    out = []
    for k in range(n):
        a = 2 * math.pi * k / n - math.pi / 2
        r = R if k % 2 == 0 else R * .62
        w = .2 if k % 2 == 0 else .26
        tip = (cx + r * math.cos(a), cy + r * math.sin(a))
        l = (cx + r * .2 * math.cos(a - math.pi / 2), cy + r * .2 * math.sin(a - math.pi / 2))
        rr = (cx + r * .2 * math.cos(a + math.pi / 2), cy + r * .2 * math.sin(a + math.pi / 2))
        out.append((tip, l, rr, w))
    return out


def compass(s, cx, cy, R, sw=1.1):
    s.path(f"M{cx - R * 1.08} {cy}a{R * 1.08} {R * 1.08} 0 1 0 {R * 2.16} 0a{R * 1.08} {R * 1.08} 0 1 0 {-R * 2.16} 0Z", sw, PAPER)
    s.path(f"M{cx - R * .98} {cy}a{R * .98} {R * .98} 0 1 0 {R * 1.96} 0a{R * .98} {R * .98} 0 1 0 {-R * 1.96} 0Z", sw * .6)
    tk = []
    for k in range(64):
        a = 2 * math.pi * k / 64
        tk.append((cx + R * .98 * math.cos(a), cy + R * .98 * math.sin(a), cx + R * (1.08 if k % 8 == 0 else 1.03) * math.cos(a), cy + R * (1.08 if k % 8 == 0 else 1.03) * math.sin(a)))
    s.lines(tk, sw * .5)
    for tip, l, r, _ in sorted(rose_path(cx, cy, R), key=lambda t: -math.hypot(t[0][0] - cx, t[0][1] - cy)):
        s.path(poly([tip, l, (cx, cy)]), sw, PAPER)
        half = poly([tip, r, (cx, cy)])
        s.path(half, sw, INK)
    s.path(f"M{cx - 3} {cy}a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z", sw, PAPER)


def rose():
    s = Svg(200, 200, "Compass rose", "r")
    compass(s, 100, 100, 88)
    s.write("compass.svg")


# ---------------------------------------------------------------- antique trade map
def tradmap():
    W, H = 1000, 520
    s = Svg(W, H, "Antique-style world map with trade routes converging on Viet Nam", "m")
    def pr(lon, lat):
        return 500 + lon / 180 * 480, 270 - lat / 90 * 240

    frame = "M20 30h960v460h-960Z"
    s.path(frame, 1.6, PAPER)
    s.lines([(20, y, 980, y) for y in range(34, 490, 5)], 0.45, frame, 0.55)
    land = topo_polys("land-110m.json", "land")
    d = []
    for p in land:
        for r in p:
            if min(lat for _, lat in r) < -60:  # leave Antarctica off the chart
                continue
            u, off = [], 0  # unwrap longitudes so rings crossing 180° stay continuous
            for i, (lon, lat) in enumerate(r):
                if i and abs(lon + off - u[-1][0]) > 180:
                    off += 360 if u[-1][0] > lon + off else -360
                u.append((lon + off, lat))
            for shift in {0, -360 if max(l for l, _ in u) > 180 else 0, 360 if min(l for l, _ in u) < -180 else 0}:
                d.append(poly(thin([pr(lon + shift, lat) for lon, lat in u], 1.0)))
    ld = s.shape("".join(d))
    coast_ripples(s, ld, [(4, 0.6), (8, 0.4)], frame)
    cid = s.clip(frame)
    s.add(f'<g clip-path="url(#{cid})"><use href="{ld}" fill="{PAPER}" stroke="{INK}" stroke-width="1"/></g>')
    # graticule
    g = []
    for lon in range(-180, 181, 30):
        x, _ = pr(lon, 0)
        g.append((x, 30, x, 490))
    for lat in range(-60, 81, 30):
        _, y = pr(0, lat)
        g.append((20, y, 980, y))
    s.lines(g, 0.6, frame, 0.6)
    # routes into Viet Nam
    vn = pr(106.7, 10.8)
    hubs = [(103.8, 1.35), (139.7, 35.7), (126.9, 37.5), (121.5, 25.0), (114.2, 22.3), (8.7, 50.1), (-0.1, 51.5), (18.1, 59.3), (-74, 40.7), (-118.2, 34)]
    rd = []
    for lon, lat in hubs:
        a = pr(lon, lat)
        mx, my = (a[0] + vn[0]) / 2, (a[1] + vn[1]) / 2 - abs(a[0] - vn[0]) * .18 - 20
        rd.append(f"M{f(a[0])} {f(a[1])}Q{f(mx)} {f(my)} {f(vn[0])} {f(vn[1])}")
        s.add(f'<circle cx="{f(a[0])}" cy="{f(a[1])}" r="3.4" fill="{PAPER}" stroke="{INK}" stroke-width="1.2"/>')
    s.add(f'<path d="{"".join(rd)}" fill="none" stroke="{RED}" stroke-width="1.6" stroke-dasharray="5 4" opacity=".9"/>')
    vnp = topo_polys("countries-110m.json", "countries", "704")
    s.add(f'<path d="{"".join(poly([pr(lo, la) for lo, la in r]) for p in vnp for r in p)}" fill="{RED}" stroke="{RED}"/>')
    s.add(f'<circle cx="{f(vn[0])}" cy="{f(vn[1])}" r="6" fill="{RED}" stroke="{PAPER}" stroke-width="2"/>')
    compass(s, 110, 400, 56, 0.9)
    s.path(frame, 2.2)
    s.path("M12 22h976v476h-976Z", 0.8)
    s.write("trade-map.svg")


# ---------------------------------------------------------------- background pattern tile
def pattern():
    s = Svg(360, 360, "", "t")
    compass(s, 90, 90, 46, 0.9)
    d = gear_path(270, 250, 52, 12, 9, 12)
    s.path(d, 1.0, PAPER, extra='fill-rule="evenodd"')
    s.path("M240 250a30 30 0 1 0 60 0a30 30 0 1 0 -60 0Z", 0.8)
    # small anchor
    s.path("M80 230v80M64 246h32M48 286q32 44 64 0M48 286l-6 8M112 286l6 8M80 222a8 8 0 1 0 0.1 0Z", 1.4)
    s.path("M230 60q20 -20 40 0t40 0M230 76q20 -20 40 0t40 0", 0.9)
    (OUT / "pattern.svg").write_text(
        "".join(s.body) and
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360" width="360" height="360"><g stroke-linejoin="round" opacity=".9">{"".join(s.body)}</g></svg>'
        .replace(f'fill="{PAPER}"', 'fill="none"'))
    print("pattern.svg")

# ---------------------------------------------------------------- balance scale
def scale():
    W, H = 520, 520
    s = Svg(W, H, "Engraving of a balance scale, slightly tipped", "b")
    cx = 260
    # base and column
    s.path(f"M{cx - 120} 488 Q{cx} 510 {cx + 120} 488 L{cx + 110} 470 Q{cx} 488 {cx - 110} 470Z", 1.4, PAPER)
    s.hatch(f"M{cx - 120} 488 Q{cx} 510 {cx + 120} 488 L{cx + 110} 470 Q{cx} 488 {cx - 110} 470Z", 90, 3, 0.6)
    col = poly([(cx - 14, 470), (cx - 9, 140), (cx + 9, 140), (cx + 14, 470)])
    s.path(col, 1.4, PAPER)
    s.lines([(cx - 9 + 18 * (k / 13) ** .7, 140, cx - 14 + 28 * (k / 13) ** .7, 470) for k in range(14)], 0.6, col)
    for y in (180, 300, 430):
        s.path(f"M{cx - 20} {y}h40v10h-40Z", 1.2, PAPER)
    s.path(f"M{cx - 16} 470 Q{cx} 440 {cx + 16} 470Z", 1.2, PAPER)
    # beam, tipped
    tilt = math.radians(6)
    L = 168
    ends = [(cx - L * math.cos(tilt), 132 - L * math.sin(tilt)), (cx + L * math.cos(tilt), 132 + L * math.sin(tilt))]
    s.lines([(*ends[0], *ends[1])], 5)
    s.path(f"M{cx - 14} 132a14 14 0 1 0 28 0a14 14 0 1 0 -28 0Z", 1.4, PAPER)
    s.path(f"M{cx} 92 L{cx - 8} 118 L{cx + 8} 118Z", 1.2, INK)
    for (ex, ey) in ends:
        s.path(f"M{f(ex - 6)} {f(ey)}a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z", 1.2, PAPER)
        py = ey + 170
        s.lines([(ex, ey + 6, ex - 64, py), (ex, ey + 6, ex + 64, py), (ex, ey + 6, ex, py + 4)], 0.9)
        pan = f"M{f(ex - 76)} {f(py)} Q{f(ex)} {f(py + 70)} {f(ex + 76)} {f(py)}Z"
        s.path(pan, 1.5, PAPER)
        s.hatch(pan, 0, 2.6, 0.6, (ex - 90, py, ex + 90, py + 60))
        s.path(f"M{f(ex - 76)} {f(py)} Q{f(ex)} {f(py - 12)} {f(ex + 76)} {f(py)} Q{f(ex)} {f(py + 12)} {f(ex - 76)} {f(py)}Z", 1.2, PAPER)
    # coins on the heavier (right) pan
    ex, ey = ends[1]
    py = ey + 170
    for i, (dx, dy) in enumerate([(-30, -8), (0, -8), (30, -8), (-15, -20), (15, -20), (0, -32)]):
        x, y = ex + dx, py + dy
        s.path(f"M{f(x - 16)} {f(y)}a16 6 0 1 0 32 0a16 6 0 1 0 -32 0Z", 1.1, PAPER)
        s.lines([(x - 16, y, x - 16, y + 5), (x + 16, y, x + 16, y + 5)], 1)
    s.write("scale.svg")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    globe(); ship(); factory(); port(); rose(); tradmap(); pattern(); scale()
