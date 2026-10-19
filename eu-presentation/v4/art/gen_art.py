#!/usr/bin/env python3
"""Engraving / toile-de-Jouy line art for the v4 deck, drawn procedurally (original drawings).

    python3 v4/art/gen_art.py

Writes the SVG files next to this script. One ink: everything uses currentColor
(the page sets it to #2B35D6); "knock-out" fills use #FFFFFF where a foreground
object must hide the lines behind it. Shading is real hatching: parallel strokes
clipped to each shape by geometry (no SVG patterns, no clip paths), so the lines
stay vectors in a PDF. Deterministic (seeded random).
"""
import math, random
from pathlib import Path

OUT = Path(__file__).resolve().parent
R = random.Random(20261019)


PREC = [0]


def f(v):
    return str(int(round(v))) if PREC[0] == 0 else f"{v:.1f}".rstrip("0").rstrip(".")


class Pic:
    def __init__(self, w, h, empty=None):
        self.w, self.h, self.empty = w, h, empty
        self.layers = []                       # (kind, data, width): kind path|fill|knock|text

    # ---------- primitives ----------
    def _ok(self, pts):
        if not self.empty:
            return True
        x0, y0, x1, y1 = self.empty
        return not any(x0 <= x <= x1 and y0 <= y <= y1 for x, y in pts)

    def line(self, pts, w=1.0, close=False):
        if len(pts) < 2:
            return
        if self.empty:                          # split strokes at the empty zone
            seg = []
            for p in pts:
                if self._ok([p]):
                    seg.append(p)
                else:
                    if len(seg) > 1:
                        self.layers.append(("path", seg, w, False))
                    seg = []
            if len(seg) > 1:
                self.layers.append(("path", seg, w, close and len(seg) == len(pts)))
            return
        self.layers.append(("path", pts, w, close))

    def knock(self, pts):
        if self._ok(pts):
            self.layers.append(("knock", pts, 0, True))

    def shape(self, pts, w=1.0):
        """white-filled outlined polygon (hides what is behind it)."""
        if self._ok(pts):
            self.layers.append(("shape", pts, w, True))

    def fill(self, pts):
        if self._ok(pts):
            self.layers.append(("fill", pts, 0, True))

    def dot(self, x, y, r=1.0):
        if self._ok([(x, y)]):
            self.layers.append(("dot", (x, y, r), 0, True))

    def text(self, x, y, s, size):
        self.layers.append(("text", (x, y, s, size), 0, True))

    # ---------- hatching clipped to a polygon ----------
    def hatch(self, poly, ang=45, gap=5.0, w=0.7, wobble=0.0, dash=None):
        a = math.radians(ang)
        ca, sa = math.cos(a), math.sin(a)
        rot = [(x * ca + y * sa, -x * sa + y * ca) for x, y in poly]      # hatch lines become horizontal
        ys = [p[1] for p in rot]
        y = min(ys) + gap / 2
        n = len(rot)
        while y < max(ys):
            xs = []
            for i in range(n):
                (x1, y1), (x2, y2) = rot[i], rot[(i + 1) % n]
                if (y1 <= y < y2) or (y2 <= y < y1):
                    xs.append(x1 + (y - y1) * (x2 - x1) / (y2 - y1))
            xs.sort()
            for i in range(0, len(xs) - 1, 2):
                xa, xb = xs[i], xs[i + 1]
                if xb - xa < 1:
                    continue
                yy = y + (R.uniform(-wobble, wobble) if wobble else 0)
                pts = [(xa * ca - yy * sa, xa * sa + yy * ca), (xb * ca - yy * sa, xb * sa + yy * ca)]
                if dash:
                    L = xb - xa
                    t = 0
                    while t < L:
                        u = min(L, t + dash[0])
                        self.line([((xa + t) * ca - yy * sa, (xa + t) * sa + yy * ca), ((xa + u) * ca - yy * sa, (xa + u) * sa + yy * ca)], w)
                        t = u + dash[1]
                else:
                    self.line(pts, w)
            y += gap

    def stipple(self, poly, n, r=0.8):
        xs = [p[0] for p in poly]
        ys = [p[1] for p in poly]
        k = 0
        for _ in range(n * 4):
            if k >= n:
                break
            x, y = R.uniform(min(xs), max(xs)), R.uniform(min(ys), max(ys))
            if inside(poly, x, y):
                self.dot(x, y, r * R.uniform(.6, 1.2))
                k += 1

    # ---------- output ----------
    def svg(self, extra_style=""):
        PREC[0] = 1 if self.w <= 420 else 0          # small drawings keep one decimal
        out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {self.h}">']
        groups = {}
        for kind, d, w, close in self.layers:
            if kind == "path":
                s = "M" + " L".join(f"{f(x)} {f(y)}" for x, y in d) + (" Z" if close else "")
                groups.setdefault(round(w, 1), []).append(s)
        for kind, d, w, close in self.layers:
            if kind == "knock":
                out.append(f'<path d="M{" L".join(f"{f(x)} {f(y)}" for x, y in d)} Z" fill="#FFFFFF"/>')
        # knock-outs first would hide earlier lines only; draw in painter's order instead
        out = [out[0]]
        cur_w, buf = None, []

        def flush():
            if buf:
                out.append(f'<path d="{" ".join(buf)}" fill="none" stroke="currentColor" stroke-width="{cur_w}" stroke-linecap="round" stroke-linejoin="round"/>')
                buf.clear()
        for kind, d, w, close in self.layers:
            if kind == "path":
                ww = round(w, 1)
                if ww != cur_w:
                    flush()
                    cur_w = ww
                buf.append("M" + " L".join(f"{f(x)} {f(y)}" for x, y in d) + (" Z" if close else ""))
            else:
                flush()
                cur_w = None
                if kind == "shape":
                    out.append(f'<path d="M{" L".join(f"{f(x)} {f(y)}" for x, y in d)}Z" fill="#FFFFFF" stroke="currentColor" stroke-width="{round(w, 1)}" stroke-linejoin="round"/>')
                elif kind == "knock":
                    out.append(f'<path d="M{" L".join(f"{f(x)} {f(y)}" for x, y in d)} Z" fill="#FFFFFF"/>')
                elif kind == "fill":
                    out.append(f'<path d="M{" L".join(f"{f(x)} {f(y)}" for x, y in d)} Z" fill="currentColor"/>')
                elif kind == "dot":
                    x, y, r = d
                    out.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}" fill="currentColor"/>')
                elif kind == "text":
                    x, y, s, size = d
                    out.append(f'<text x="{f(x)}" y="{f(y)}" text-anchor="middle" font-family="&quot;Times New Roman&quot;, Times, &quot;Liberation Serif&quot;, serif" font-size="{size}" fill="currentColor">{s}</text>')
        flush()
        out.append("</svg>")
        return "\n".join(out)


def inside(poly, x, y):
    c = False
    n = len(poly)
    for i in range(n):
        (x1, y1), (x2, y2) = poly[i], poly[(i + 1) % n]
        if (y1 > y) != (y2 > y) and x < x1 + (y - y1) * (x2 - x1) / (y2 - y1):
            c = not c
    return c


def ellipse(cx, cy, rx, ry, a0=0, a1=360, n=48, rot=0):
    pts = []
    r = math.radians(rot)
    for i in range(n + 1):
        t = math.radians(a0 + (a1 - a0) * i / n)
        x, y = rx * math.cos(t), ry * math.sin(t)
        pts.append((cx + x * math.cos(r) - y * math.sin(r), cy + x * math.sin(r) + y * math.cos(r)))
    return pts


def bez(p0, p1, p2, p3, n=20):
    out = []
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        out.append((u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0],
                    u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1]))
    return out


def rect(x, y, w, h):
    return [(x, y), (x + w, y), (x + w, y + h), (x, y + h)]


# ======================= motifs =======================
def leaf(p, x, y, L, W, ang, shade=True, w=0.8):
    """lanceolate leaf from its base (x, y), pointing at angle ang (degrees)."""
    a = math.radians(ang)
    ux, uy = math.cos(a), math.sin(a)
    nx, ny = -uy, ux
    tip = (x + ux * L, y + uy * L)
    left = bez((x, y), (x + ux * L * .25 + nx * W, y + uy * L * .25 + ny * W), (x + ux * L * .7 + nx * W * .8, y + uy * L * .7 + ny * W * .8), tip, 7)
    right = bez(tip, (x + ux * L * .7 - nx * W * .8, y + uy * L * .7 - ny * W * .8), (x + ux * L * .25 - nx * W, y + uy * L * .25 - ny * W), (x, y), 7)
    poly = left + right[1:]
    p.shape(poly, w)
    p.line([(x, y), (x + ux * L * .92, y + uy * L * .92)], w * .7)        # midrib
    for t in ((.3, .6) if L < 30 else (.25, .42, .58, .74)):               # veins
        bx, by = x + ux * L * t, y + uy * L * t
        for s in (1, -1):
            p.line([(bx, by), (bx + ux * L * .12 + s * nx * W * .7, by + uy * L * .12 + s * ny * W * .7)], w * .5)
    if shade:
        p.hatch(right, ang + 70, 2.6 if L < 30 else 2.2, .45)


def olive_branch(p, x, y, L, ang, n=9, sc=1.0):
    a = math.radians(ang)
    pts = []
    for i in range(30):
        t = i / 29
        bend = math.sin(t * math.pi) * 18 * sc
        pts.append((x + math.cos(a) * L * t - math.sin(a) * bend, y + math.sin(a) * L * t + math.cos(a) * bend))
    p.line(pts, 1.6 * sc)
    for i in range(n):
        t = .12 + .85 * i / n
        k = int(t * 29)
        bx, by = pts[k]
        side = 1 if i % 2 else -1
        leaf(p, bx, by, 44 * sc * R.uniform(.85, 1.1), 7 * sc, ang + side * R.uniform(35, 55), True, .8)
        if i % 3 == 1:                                                  # olives
            ox, oy = bx + side * 10 * sc, by + 10 * sc
            e = ellipse(ox, oy, 5 * sc, 7 * sc, n=18, rot=ang)
            p.shape(e, .9); p.hatch(e, ang + 30, 1.6, .4)


def column(p, x, base, h, w, shade=True):
    """Ionic column: base slabs, fluted shaft, capital with volutes."""
    # base
    for i, (dw, hh) in enumerate([(1.35, 10), (1.2, 8), (1.1, 6)]):
        y0 = base - sum(t[1] for t in [(1.35, 10), (1.2, 8), (1.1, 6)][:i + 1])
        r = rect(x - w * dw / 2, y0, w * dw, hh)
        p.shape(r, 1.1)
        if shade:
            p.hatch(r[1:3] + [(x, y0 + hh), (x, y0)], 0, 2.4, .5)
    top = base - 24 - h
    shaft = [(x - w / 2, base - 24), (x - w * .44, top), (x + w * .44, top), (x + w / 2, base - 24)]
    p.shape(shaft, 1.2)
    for k in range(1, 8):                                               # flutes
        fx0 = x - w / 2 + w * k / 8
        fx1 = x - w * .44 + w * .88 * k / 8
        p.line([(fx0, base - 26), (fx1, top + 2)], .6)
    if shade:
        p.hatch([(x + w * .18, base - 24), (x + w * .16, top), (x + w * .44, top), (x + w / 2, base - 24)], 80, 2.6, .5)
    # capital
    cap = rect(x - w * .75, top - 12, w * 1.5, 12)
    p.shape(cap, 1.1); p.hatch(cap, 0, 3, .5)
    aba = rect(x - w * .62, top - 20, w * 1.24, 8)
    p.shape(aba, 1.0)
    for s in (-1, 1):                                                    # volutes
        cx, cy = x + s * w * .62, top - 4
        sp = [(cx + s * (7 - t * .9) * math.cos(t), cy + (7 - t * .9) * math.sin(t)) for t in [i * .25 for i in range(30)]]
        p.line(sp, .9)
    return top - 20


def temple(p, x, base, W, H, cols=6):
    # steps
    for i in range(3):
        r = rect(x - W / 2 - 18 + i * 8, base - (i + 1) * 9, W + 36 - i * 16, 9)
        p.shape(r, 1.1); p.hatch(r, 0, 3, .45)
    floor = base - 27
    cw = W / (cols * 2.1)
    top = None
    for i in range(cols):
        cx = x - W / 2 + cw + i * (W - 2 * cw) / (cols - 1)
        top = column(p, cx, floor, H, cw)
    # cella shadow behind columns
    # entablature
    ent = rect(x - W / 2 - 6, top - 34, W + 12, 34)
    p.shape(ent, 1.3)
    p.line([(x - W / 2 - 6, top - 22), (x + W / 2 + 6, top - 22)], .8)
    for k in range(int(W / 14)):                                         # triglyphs
        tx = x - W / 2 + 4 + k * 14
        p.line([(tx, top - 21), (tx, top - 2)], .6); p.line([(tx + 4, top - 21), (tx + 4, top - 2)], .6)
    # pediment
    ped = [(x - W / 2 - 14, top - 34), (x, top - 34 - W * .22), (x + W / 2 + 14, top - 34)]
    p.shape(ped, 1.4)
    inner = [(x - W / 2 + 10, top - 40), (x, top - 34 - W * .22 + 12), (x + W / 2 - 10, top - 40)]
    p.line(inner, .8, True)
    p.hatch(inner, 0, 2.6, .5)
    # acroteria
    for ax, ay in [(x, top - 34 - W * .22), (x - W / 2 - 14, top - 34), (x + W / 2 + 14, top - 34)]:
        leaf(p, ax, ay, 16, 5, -90, False, .7)


def star(cx, cy, R1, r1, rot=-90):
    return [(cx + (R1 if i % 2 == 0 else r1) * math.cos(math.radians(rot + i * 36)), cy + (R1 if i % 2 == 0 else r1) * math.sin(math.radians(rot + i * 36))) for i in range(10)]


def star_ring(p, cx, cy, rad, size):
    for i in range(12):
        a = math.radians(i * 30 - 90)
        s = star(cx + rad * math.cos(a), cy + rad * math.sin(a), size, size * .42)
        p.shape(s, .9); p.hatch(s, 60, 1.8, .45)


def scroll(p, x, y, W, H):
    body = rect(x, y, W, H)
    p.shape(body, 1.1)
    for k in range(int(H / 11) - 1):                                     # writing
        yy = y + 14 + k * 11
        xx = x + 18
        while xx < x + W - 30:
            L = R.uniform(10, 34)
            p.line([(xx, yy), (xx + L * .3, yy - 1.2), (xx + L * .6, yy + .6), (xx + L, yy)], .55)
            xx += L + R.uniform(4, 8)
    for ry in (y, y + H):                                                 # rolled ends
        e = ellipse(x + W / 2, ry, W / 2 + 8, 9, n=40)
        p.shape(e, 1.1); p.hatch(e[len(e) // 2:] + [e[0]], 0, 2, .5)
        p.line(ellipse(x + W / 2, ry, W / 2 + 2, 4, n=40), .6, True)
    seal = ellipse(x + W - 34, y + H - 26, 16, 16, n=30)
    p.shape(seal, 1.2); p.hatch(seal, 30, 1.8, .5)
    p.line(ellipse(x + W - 34, y + H - 26, 10, 10, n=30), .8, True)
    for s in (-1, 1):
        p.line([(x + W - 34 + s * 6, y + H - 12), (x + W - 34 + s * 14, y + H + 22)], 1.0)


def compass(p, cx, cy, r):
    p.line(ellipse(cx, cy, r, r, n=60), 1.0, True)
    p.line(ellipse(cx, cy, r * .82, r * .82, n=60), .6, True)
    for i in range(32):
        a = math.radians(i * 360 / 32)
        p.line([(cx + r * .82 * math.cos(a), cy + r * .82 * math.sin(a)), (cx + r * math.cos(a), cy + r * math.sin(a))], .5)
    for i in range(8):
        a = math.radians(i * 45 - 90)
        L = r * (1.0 if i % 2 == 0 else .62)
        b1 = math.radians(i * 45 - 90 + 90)
        tri = [(cx, cy), (cx + L * math.cos(a), cy + L * math.sin(a)), (cx + r * .12 * math.cos(b1), cy + r * .12 * math.sin(b1))]
        tri2 = [(cx, cy), (cx + L * math.cos(a), cy + L * math.sin(a)), (cx - r * .12 * math.cos(b1), cy - r * .12 * math.sin(b1))]
        p.knock(tri + tri2[2:]); p.line(tri, .8, True); p.line(tri2, .8, True); p.hatch(tri, i * 45, 1.6, .45)


def coast_map(p, x, y, W, H):
    fr = rect(x, y, W, H)
    p.shape(fr, 1.2); p.line(rect(x + 6, y + 6, W - 12, H - 12), .6, True)
    # rhumb lines from a point
    ox, oy = x + W * .62, y + H * .55
    for i in range(16):
        a = math.radians(i * 22.5)
        L = max(W, H)
        ex, ey = ox + L * math.cos(a), oy + L * math.sin(a)
        # clip to frame
        t = 1.0
        for (lim, d, o) in [(x + 8, ex - ox, ox), (x + W - 8, ex - ox, ox)]:
            pass
        pts = [(ox, oy)]
        k = 0
        while k < 60:
            px, py = ox + (ex - ox) * k / 60, oy + (ey - oy) * k / 60
            if not (x + 8 < px < x + W - 8 and y + 8 < py < y + H - 8):
                break
            pts.append((px, py)); k += 1
        p.line(pts, .4)
    # coastline (an imaginary peninsula)
    pts = []
    for i in range(60):
        t = i / 59
        pts.append((x + 10 + t * (W * .55), y + H * .25 + math.sin(t * 7) * 14 + R.uniform(-3, 3) + t * H * .45))
    land = pts + [(x + 10, y + H - 10)]
    p.knock(land + [(x + 10, y + H * .25)])
    p.line(pts, 1.1)
    for off in (5, 10, 16):
        p.line([(px + off * .6, py + off) for px, py in pts[::2]], .45)
    p.hatch(land + [(x + 10, y + H * .25)], 20, 3.2, .45)
    compass(p, ox, oy, min(W, H) * .2)


def waves(p, x0, x1, y, rows, gap=7, amp=2.5, w=.7):
    for r in range(rows):
        yy = y + r * gap
        ph = R.uniform(0, 6)
        p.line([(xx, yy + amp * math.sin(xx / 9 + ph + r)) for xx in range(int(x0), int(x1), 4)], w)


def container_ship(p, x, base, L, H):
    hull = [(x, base - H * .45), (x + L * .93, base - H * .45), (x + L, base - H * .62), (x + L * .97, base - H * .1), (x + L * .9, base), (x + L * .06, base), (x + L * .02, base - H * .2)]
    p.shape(hull, 1.4)
    p.hatch(hull, 0, 2.6, .5)
    p.line([(x + L * .02, base - H * .3), (x + L * .97, base - H * .3)], .7)
    # containers
    cw, ch = L * .06, H * .14
    for row in range(3):
        for k in range(11 - row):
            cx = x + L * .12 + k * cw * 1.02 + row * cw * .5
            cy = base - H * .45 - (row + 1) * ch
            r = rect(cx, cy, cw, ch)
            p.shape(r, .8)
            for j in range(1, 6):
                p.line([(cx + cw * j / 6, cy + 1.5), (cx + cw * j / 6, cy + ch - 1.5)], .4)
            if (k + row) % 3 == 0:
                p.hatch(r, 90, 2.2, .45)
    # bridge
    br = rect(x + L * .8, base - H * .45 - H * .55, L * .1, H * .55)
    p.shape(br, 1.0)
    for j in range(4):
        p.line([(x + L * .81, base - H * .9 + j * H * .1), (x + L * .89, base - H * .9 + j * H * .1)], .6)
    p.hatch(br[1:3] + [(x + L * .85, base - H * .45), (x + L * .85, base - H)], 80, 2.2, .45)
    mast = [(x + L * .86, base - H), (x + L * .86, base - H * 1.25)]
    p.line(mast, 1.0)
    waves(p, x - 30, x + L + 40, base + 4, 5, 6, 2.2, .6)


def crane(p, x, base, H, reach):
    """harbour crane: lattice tower with X bracing, jib towards `reach` (negative = left)."""
    w = 26
    for s_ in (0, w):
        p.line([(x + s_, base), (x + s_, base - H)], 1.3)
    y = base
    while y > base - H + 18:
        p.line([(x, y), (x + w, y - 18)], .5); p.line([(x + w, y), (x, y - 18)], .5); p.line([(x, y - 18), (x + w, y - 18)], .6)
        y -= 18
    top = base - H
    cab = rect(x - 8, top - 30, w + 16, 30)
    p.shape(cab, 1.0); p.hatch(cab, 90, 2, .45)
    tip = x + w / 2 + reach
    back = x + w / 2 - reach * .3
    for yy in (top - 30, top - 40):
        p.line([(back, yy), (tip, yy)], 1.1)
    xa, xb = sorted((back, tip))
    xx = xa
    while xx < xb - 12:
        p.line([(xx, top - 30), (xx + 12, top - 40)], .45); xx += 12
    p.line([(x + w / 2, top - 30), (x + w / 2, top - 86)], 1.0)
    p.line([(x + w / 2, top - 86), (tip, top - 40)], .7); p.line([(x + w / 2, top - 86), (back, top - 40)], .7)
    hx = x + w / 2 + reach * .75
    p.line([(hx, top - 30), (hx, top + 40)], .6)
    box = rect(hx - 16, top + 40, 32, 18)
    p.shape(box, .8)
    for j in range(1, 6):
        p.line([(hx - 16 + 32 * j / 6, top + 42), (hx - 16 + 32 * j / 6, top + 56)], .4)


def turbine(p, x, base, H, ang=12):
    tower = [(x - 6, base), (x - 2.5, base - H), (x + 2.5, base - H), (x + 6, base)]
    p.shape(tower, 1.0); p.hatch([(x, base), (x, base - H), (x + 2.5, base - H), (x + 6, base)], 80, 2, .45)
    hx, hy = x, base - H
    for i in range(3):
        a = math.radians(ang + i * 120)
        L = H * .45
        bx, by = math.cos(a), math.sin(a)
        nx, ny = -by, bx
        blade = [(hx, hy), (hx + bx * L * .25 + nx * 6, hy + by * L * .25 + ny * 6), (hx + bx * L, hy + by * L), (hx + bx * L * .3 - nx * 2, hy + by * L * .3 - ny * 2)]
        p.shape(blade, .9); p.hatch(blade, ang + i * 120, 2.2, .4)
    hub = ellipse(hx, hy, 4.5, 4.5, n=16)
    p.shape(hub, .9)


def hill(p, x0, x1, base, top, w=1.0, shade=True):
    pts = [(xx, base - (top) * math.sin(math.pi * (xx - x0) / (x1 - x0)) ** 1.5 - R.uniform(0, 2)) for xx in range(int(x0), int(x1) + 1, 6)]
    poly = pts + [(x1, base), (x0, base)]
    p.knock(poly); p.line(pts, w)
    if shade:
        p.hatch(poly, 8, 4.5, .45, wobble=.6)
        p.stipple(poly, 60, .7)
    return pts


def globe(p, cx, cy, r):
    c = ellipse(cx, cy, r, r, n=80)
    p.shape(c, 1.3)
    for k in range(-3, 4):                                               # parallels
        yy = cy + k * r / 4
        rr = math.sqrt(max(0, r * r - (yy - cy) ** 2))
        p.line([(cx - rr, yy), (cx + rr, yy)], .5)
    for k in range(1, 6):                                                # meridians
        rx = r * math.cos(math.radians(k * 30))
        p.line(ellipse(cx, cy, rx, r, n=60), .5, True)
    p.hatch(ellipse(cx + r * .1, cy, r, r, -60, 60, n=40), 80, 2.2, .45)
    # flight network
    nodes = [(cx + r * math.cos(t) * .75, cy + r * math.sin(t) * .6) for t in [.3, 1.4, 2.5, 3.6, 4.4, 5.4]]
    for i, (a, b) in enumerate([(0, 2), (1, 4), (2, 5), (3, 0), (4, 1), (5, 3), (0, 4)]):
        (x1, y1), (x2, y2) = nodes[a], nodes[b]
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2 - r * .55
        arc = bez((x1, y1), (mx, my), (mx, my), (x2, y2), 30)
        for j in range(0, len(arc) - 1, 2):
            p.line([arc[j], arc[j + 1]], .8)
    for nx, ny in nodes:
        e = ellipse(nx, ny, 3.5, 3.5, n=12)
        p.knock(e); p.fill(e)
    plane = [(nodes[1][0] + 30, nodes[1][1] - 60), (nodes[1][0] + 46, nodes[1][1] - 56), (nodes[1][0] + 30, nodes[1][1] - 52)]
    p.fill(plane)


def scales(p, cx, top, W):
    p.line([(cx, top), (cx, top + W * 1.2)], 1.6)
    base = rect(cx - W * .3, top + W * 1.2, W * .6, 10)
    p.shape(base, 1.1); p.hatch(base, 0, 2.4, .5)
    beam = [(cx - W * .8, top + 18), (cx + W * .8, top + 10)]
    p.line(beam, 1.6)
    knob = ellipse(cx, top, 6, 6, n=14); p.shape(knob, 1)
    for s, yy in ((-1, top + 18), (1, top + 10)):
        px = cx + s * W * .8
        for d in (-18, 0, 18):
            p.line([(px, yy), (px + d, yy + W * .55)], .6)
        pan = ellipse(px, yy + W * .55, 22, 7, 0, 180, n=20)
        p.knock(pan + [pan[0]]); p.line(pan, 1.1); p.line([pan[0], pan[-1]], 1.0); p.hatch(pan + [pan[0]], 0, 2, .45)


def terraces(p, x0, x1, base, top, n=7):
    prev = None
    for i in range(n):
        y = base - (base - top) * i / n
        pts = [(xx, y - 10 * math.sin((xx - x0) / 70 + i) - 6 * math.sin((xx - x0) / 23)) for xx in range(int(x0) + i * 10, int(x1) - i * 14, 5)]
        if not pts:
            break
        if prev:
            poly = pts + list(reversed([q for q in prev if pts[0][0] <= q[0] <= pts[-1][0]]))
            p.knock(poly)
        p.line(pts, 1.0)
        p.line([(xx, yy + 4) for xx, yy in pts], .5)                        # terrace wall
        for xx, yy in pts[::2]:                                             # rice
            if R.random() < .8:
                h = R.uniform(5, 9)
                p.line([(xx, yy - 6), (xx + R.uniform(-1.5, 1.5), yy - 6 - h)], .45)
        prev = pts


def non_la(p, cx, by, W):
    apex = (cx, by - W * .45)
    rim = ellipse(cx, by, W / 2, W * .09, n=50)
    body = [apex] + rim[0:26]
    p.knock(body + rim); p.line(rim, 1.2, True)
    p.line([apex, rim[0]], 1.1); p.line([apex, rim[25]], 1.1)
    for k in range(1, 12):                                               # ribs
        q = rim[int(25 * k / 12)]
        p.line([apex, q], .5)
    for k in range(1, 6):                                                # rings
        t = k / 6
        p.line([(apex[0] + (q[0] - apex[0]) * t, apex[1] + (q[1] - apex[1]) * t) for q in rim[0:26]], .45)
    p.hatch([apex, rim[0], rim[6], rim[12]], 75, 2.2, .45)
    p.line(bez((cx - W * .25, by + 4), (cx - W * .1, by + W * .3), (cx + W * .1, by + W * .3), (cx + W * .25, by + 4), 20), .7)


def junk(p, x, base, L):
    hull = bez((x, base - 18), (x + L * .3, base + 6), (x + L * .7, base + 6), (x + L, base - 26), 24) + [(x + L * .92, base - 22), (x + L * .1, base - 14)]
    p.shape(hull, 1.3); p.hatch(hull, 0, 2.4, .5)
    for k, (mx, mh) in enumerate([(x + L * .35, 1.0), (x + L * .62, .82)]):
        H = L * .62 * mh
        p.line([(mx, base - 16), (mx, base - 16 - H)], 1.1)
        sail = [(mx, base - 22 - H), (mx + L * .24, base - 30 - H * .8), (mx + L * .26, base - 26), (mx, base - 24)]
        p.shape(sail, 1.0)
        for j in range(1, 7):                                            # battens
            t = j / 7
            a = (mx, base - 22 - H + (H - 2) * t)
            b = (mx + L * .24 + L * .02 * t, base - 30 - H * .8 + (H * .8 - 4) * t)
            p.line([a, b], .6)
        p.hatch(sail, 100, 3, .4)
    waves(p, x - 20, x + L + 20, base + 6, 4, 6, 2, .6)


def solar(p, x, base, n=4):
    for i in range(n):
        x0 = x + i * 66
        panel = [(x0, base - 34), (x0 + 54, base - 50), (x0 + 62, base - 22), (x0 + 8, base - 6)]
        p.shape(panel, 1.0)
        for j in range(1, 4):
            t = j / 4
            p.line([(x0 + 54 * t, base - 34 - 16 * t), (x0 + 8 + 54 * t, base - 6 - 16 * t)], .5)
        for j in range(1, 3):
            t = j / 3
            p.line([(x0 + 8 * t, base - 34 + 28 * t), (x0 + 54 + 8 * t, base - 50 + 28 * t)], .5)
        p.hatch(panel, 30, 2.2, .4)
        p.line([(x0 + 30, base - 12), (x0 + 30, base + 6)], .9)


def bamboo(p, x, base, H, lean=0, w=9):
    segs = int(H / 46)
    pts = []
    for k in range(segs + 1):
        pts.append((x + lean * k / segs, base - k * H / segs))
    for k in range(segs):
        (x1, y1), (x2, y2) = pts[k], pts[k + 1]
        stalk = [(x1 - w / 2, y1 - 2), (x2 - w / 2, y2 + 2), (x2 + w / 2, y2 + 2), (x1 + w / 2, y1 - 2)]
        p.shape(stalk, .9)
        p.hatch([(x1 + w * .1, y1 - 2), (x2 + w * .1, y2 + 2), (x2 + w / 2, y2 + 2), (x1 + w / 2, y1 - 2)], 85, 1.8, .45)
        p.line([(x2 - w / 2 - 1, y2 + 1), (x2 + w / 2 + 1, y2 + 1)], 1.1)
        if k > segs * .4 and R.random() < .6:                             # leaves
            side = R.choice((-1, 1))
            for j in range(R.randint(2, 4)):
                leaf(p, x2 + side * w / 2, y2, R.uniform(38, 58), 5.5, (0 if side > 0 else 180) + side * R.uniform(10, 60), True, .7)


def lotus(p, cx, by, s=1.0, bud=False):
    stem = bez((cx, by + 80 * s), (cx + 6, by + 50 * s), (cx - 4, by + 20 * s), (cx, by), 16)
    p.line(stem, 1.2)
    if bud:
        b = bez((cx, by), (cx - 16 * s, by - 18 * s), (cx - 6 * s, by - 40 * s), (cx, by - 48 * s), 14) + bez((cx, by - 48 * s), (cx + 6 * s, by - 40 * s), (cx + 16 * s, by - 18 * s), (cx, by), 14)
        p.shape(b, 1.0); p.hatch(b[14:], 70, 1.8, .45); p.line([(cx, by - 4), (cx, by - 44 * s)], .5)
        return
    for ang, L in [(-150, 40), (-30, 40), (-125, 52), (-55, 52), (-90, 60), (-105, 56), (-75, 56)]:
        a = math.radians(ang)
        ux, uy = math.cos(a), math.sin(a)
        nx, ny = -uy, ux
        W, LL = 13 * s, L * s
        tip = (cx + ux * LL, by + uy * LL)
        pet = bez((cx, by), (cx + ux * LL * .3 + nx * W, by + uy * LL * .3 + ny * W), (cx + ux * LL * .8 + nx * W * .6, by + uy * LL * .8 + ny * W * .6), tip, 12) + \
            bez(tip, (cx + ux * LL * .8 - nx * W * .6, by + uy * LL * .8 - ny * W * .6), (cx + ux * LL * .3 - nx * W, by + uy * LL * .3 - ny * W), (cx, by), 12)[1:]
        p.shape(pet, 1.0)
        for t in (.3, .55):                                              # contour lines along the petal
            p.line([(cx + ux * LL * t * .9 + nx * W * .5 * k, by + uy * LL * t * .9 + ny * W * .5 * k) for k in (-1, -.5, 0, .5, 1)], .4)
        p.hatch(pet[12:], ang + 75, 1.8, .4)


def lotus_pad(p, cx, cy, rx, ry):
    pad = ellipse(cx, cy, rx, ry, 10, 350, n=40) + [(cx, cy)]
    p.shape(pad, 1.0)
    for k in range(12):
        a = math.radians(15 + k * 28)
        p.line([(cx, cy), (cx + rx * .92 * math.cos(a), cy + ry * .92 * math.sin(a))], .45)
    p.hatch(pad, -10, 3, .4)


def foliage(p, cx, cy, r, n=30, sc=1.0):
    """a dense clump: twigs radiating from the centre, each carrying small overlapping leaves."""
    twigs = max(5, n // 5)
    for t in range(twigs):
        a = 2 * math.pi * t / twigs + R.uniform(-.3, .3)
        L = r * R.uniform(.6, 1.0)
        pts = [(cx + L * k / 6 * math.cos(a) + math.sin(k) * 2, cy + L * k / 6 * math.sin(a)) for k in range(7)]
        p.line(pts, .7)
        for k in range(1, 7):
            bx, by = pts[k]
            for side in (-1, 1):
                if R.random() < .7:
                    leaf(p, bx, by, R.uniform(16, 26) * sc, R.uniform(3.5, 5.5) * sc, math.degrees(a) + side * R.uniform(25, 70), True, .55)


def tree(p, x, base, h, r, sc=1.0):
    """trunk with bark hatching and a crown of dense clumps."""
    trunk = [(x - 10 * sc, base), (x - 5 * sc, base - h * .55), (x - 3 * sc, base - h * .7), (x + 4 * sc, base - h * .7), (x + 6 * sc, base - h * .55), (x + 12 * sc, base)]
    p.shape(trunk, 1.1)
    p.hatch(trunk, 95, 2.0, .5, wobble=.6)
    for bx, ang in ((x, -120), (x, -60), (x, -95)):
        p.line([(bx, base - h * .5), (bx + math.cos(math.radians(ang)) * r * .7, base - h * .5 + math.sin(math.radians(ang)) * r * .7)], 1.0)
    cy = base - h * .7 - r * .4
    for k in range(9):
        a = 2 * math.pi * k / 9
        foliage(p, x + r * .62 * math.cos(a), cy + r * .5 * math.sin(a), r * .5, 22, sc)
    foliage(p, x, cy, r * .55, 26, sc)


def bush(p, x, base, r, sc=.9):
    for k in range(4):
        foliage(p, x + (k - 1.5) * r * .55, base - r * .35 - (k % 2) * r * .2, r * .5, 18, sc)


def grass(p, x0, x1, y, n=60):
    for _ in range(n):
        x = R.uniform(x0, x1)
        h = R.uniform(6, 16)
        p.line([(x, y), (x + R.uniform(-4, 4), y - h)], .5)


def ground(p, x0, x1, y, depth=40):
    for k in range(5):
        yy = y + 6 + k * 8
        p.line([(xx, yy + 1.5 * math.sin(xx / 30 + k)) for xx in range(int(x0), int(x1), 8) if R.random() < .93], .45)
    p.stipple([(x0, y), (x1, y), (x1, y + depth), (x0, y + depth)], int((x1 - x0) / 5), .55)
    grass(p, x0, x1, y + 4, int((x1 - x0) / 6))


def wreath(p, cx, cy, r, sc=.6):
    for side in (-1, 1):
        for i in range(10):
            a = math.radians(90 + side * (20 + i * 15))
            x, y = cx + r * math.cos(a), cy + r * math.sin(a)
            leaf(p, x, y, 18 * sc * 2, 4 * sc * 2, math.degrees(a) + side * 100, True, .6)


# ======================= compositions =======================
EMPTY = (420, 230, 1500, 760)


def frame_base(theme, empty=EMPTY):
    p = Pic(1920, 1080, empty)
    # light rule around the empty zone corners (engraved border flourishes)
    ground(p, 0, 1920, 1020, 60)
    return p


def frame_cover():
    # the cover carries more text: a larger empty zone (x 380-1540, y 150-880)
    p = frame_base("cover", (380, 150, 1540, 880))
    tree(p, 300, 1010, 300, 80)
    temple(p, 190, 975, 290, 330, 5)
    bush(p, 60, 1010, 90); bush(p, 340, 1012, 60)
    tree(p, 80, 330, 200, 100, .9)
    olive_branch(p, 200, 60, 300, 12, 10, .9)
    star_ring(p, 960, 76, 56, 10)
    olive_branch(p, 760, 120, 140, -12, 6, .8); olive_branch(p, 1160, 120, 140, 192, 6, .8)
    foliage(p, 560, 80, 60, 28); foliage(p, 1360, 80, 60, 28)
    tree(p, 1800, 430, 230, 100, .9)
    crane(p, 1800, 830, 280, -180)
    container_ship(p, 1560, 960, 340, 100)
    bamboo(p, 1580, 1020, 420, 8)
    for k, x in enumerate([470, 560, 700, 1220, 1330, 1450]):
        lotus(p, x, 960 - (k % 2) * 14, .7, bud=k in (1, 4))
    for x in (520, 650, 1270, 1400):
        lotus_pad(p, x, 1004, 44, 10)
    bush(p, 960, 1010, 110, .8)
    foliage(p, 1700, 90, 110, 46)
    return p


def frame_ch1():
    p = frame_base("ch1")
    tree(p, 320, 1010, 300, 95)
    temple(p, 210, 975, 320, 360, 5)
    bush(p, 60, 1012, 80)
    tree(p, 80, 300, 180, 100, .9)
    coast_map(p, 1540, 70, 330, 220)
    olive_branch(p, 300, 120, 360, 6, 12, 1.0); olive_branch(p, 1460, 300, 300, 160, 10, .9)
    star_ring(p, 960, 122, 70, 11)
    foliage(p, 640, 110, 70, 30); foliage(p, 1280, 110, 70, 30)
    column(p, 1700, 990, 360, 44); column(p, 1810, 990, 290, 40)
    tree(p, 1560, 1010, 260, 110, .9)
    scroll(p, 660, 830, 600, 140)
    olive_branch(p, 470, 900, 170, -30, 7, .85); olive_branch(p, 1450, 900, 170, 210, 7, .85)
    bush(p, 1880, 1012, 70)
    return p


def frame_ch2():
    p = frame_base("ch2")
    crane(p, 300, 840, 380, -60); crane(p, 160, 860, 300, -110)
    container_ship(p, 20, 990, 400, 120)
    tree(p, 90, 320, 200, 100, .9)
    hill(p, 1480, 1920, 1010, 240)
    for x, h in [(1560, 300), (1690, 360), (1820, 290)]:
        turbine(p, x, 1010 - 230 * math.sin(math.pi * (x - 1480) / 440) ** 1.5 + 6, h, R.uniform(0, 100))
    globe(p, 960, 120, 96)
    foliage(p, 700, 120, 80, 34); foliage(p, 1220, 120, 80, 34)
    scales(p, 1700, 70, 110)
    for k in range(3):
        for j in range(5 - k):
            r = rect(560 + j * 70 + k * 35, 970 - (k + 1) * 34, 68, 34)
            p.shape(r, .9)
            for t in range(1, 9):
                p.line([(r[0][0] + 68 * t / 9, r[0][1] + 2), (r[0][0] + 68 * t / 9, r[0][1] + 32)], .4)
            if (j + k) % 2:
                p.hatch(r, 90, 2.2, .4)
    waves(p, 900, 1460, 990, 5, 6, 2.2, .6)
    junk(p, 1040, 970, 200)
    foliage(p, 1840, 600, 70, 26); bush(p, 1880, 1012, 60)
    return p


def frame_ch3():
    p = frame_base("ch3")
    terraces(p, 0, 430, 1010, 600, 10)
    terraces(p, 1480, 1920, 1010, 620, 10)
    non_la(p, 230, 560, 220)
    bamboo(p, 50, 1020, 600, 10); bamboo(p, 104, 1020, 500, -10, 8); bamboo(p, 1868, 1020, 600, -12); bamboo(p, 1818, 1020, 500, 8, 8)
    tree(p, 260, 300, 200, 110, .9)
    solar(p, 1530, 330, 5)
    tree(p, 1700, 220, 150, 100, .85)
    junk(p, 600, 970, 230)
    container_ship(p, 1000, 950, 300, 90)
    for k, x in enumerate([480, 1400, 1450]):
        lotus(p, x, 880 + k * 10, .8, bud=k == 1)
    lotus_pad(p, 520, 1000, 50, 13); lotus_pad(p, 1420, 1000, 46, 12)
    star_ring(p, 960, 122, 64, 10)
    olive_branch(p, 600, 150, 220, -10, 8, .8); olive_branch(p, 1320, 150, 220, 190, 8, .8)
    foliage(p, 520, 90, 60, 26); foliage(p, 1400, 90, 60, 26)
    return p


def band(theme):
    p = Pic(1920, 640, None)
    ground(p, 0, 1920, 600, 40)
    if theme == "ch1":
        temple(p, 1340, 600, 360, 300, 6)
        column(p, 1700, 600, 330, 44); column(p, 1800, 600, 260, 40)
        olive_branch(p, 980, 180, 300, 20, 11, 1.0)
        scroll(p, 960, 380, 220, 140)
        coast_map(p, 1560, 40, 300, 190)
        foliage(p, 1880, 420, 80, 30)
    elif theme == "ch2":
        hill(p, 900, 1500, 600, 200)
        for x, h in [(1000, 260), (1180, 330), (1360, 270)]:
            turbine(p, x, 600 - 180 * math.sin(math.pi * (x - 900) / 600) ** 1.5 + 4, h, R.uniform(0, 100))
        container_ship(p, 1480, 590, 360, 110)
        crane(p, 1860, 480, 300, -150)
        globe(p, 760, 170, 110)
        scales(p, 1260, 40, 80)
    elif theme == "ch3":
        terraces(p, 900, 1920, 600, 260, 10)
        non_la(p, 1180, 250, 200)
        bamboo(p, 1880, 610, 520, -10); bamboo(p, 1830, 610, 420, 8, 8)
        junk(p, 960, 590, 220)
        solar(p, 1400, 200, 5)
        lotus(p, 1600, 540, .9); lotus(p, 1700, 560, .8, True)
    else:
        temple(p, 1380, 600, 300, 260, 5)
        bamboo(p, 1860, 610, 520, -8); bamboo(p, 1810, 610, 430, 8, 8)
        olive_branch(p, 960, 160, 280, 15, 10, 1.0)
        lotus(p, 1050, 560, .9); lotus(p, 1130, 580, .8, True); lotus_pad(p, 1080, 610, 50, 12)
        container_ship(p, 1540, 590, 230, 80)
        star_ring(p, 1180, 120, 60, 10)
    # the left part stays light (the chapter name sits below it on the blue)
    tree(p, 760, 600, 260, 120, .9); bush(p, 560, 600, 80)
    foliage(p, 60, 90, 70, 26, .9)
    olive_branch(p, 120, 60, 380, 12, 12, .9)
    return p


def corner(theme):
    p = Pic(420, 420, None)
    if theme == "ch1":
        column(p, 330, 430, 240, 40)
        olive_branch(p, 420, 260, 300, 200, 10, .9)
        foliage(p, 390, 400, 50, 18, .8)
    elif theme == "ch2":
        for k in range(3):
            for j in range(3 - k):
                r = rect(190 + j * 74 + k * 36, 420 - (k + 1) * 36, 72, 36)
                p.shape(r, .9)
                for t in range(1, 9):
                    p.line([(r[0][0] + 72 * t / 9, r[0][1] + 2), (r[0][0] + 72 * t / 9, r[0][1] + 34)], .4)
                if (j + k) % 2 == 0:
                    p.hatch(r, 90, 2.2, .4)
        crane(p, 360, 310, 200, -150)
        waves(p, 150, 420, 410, 2, 6, 2, .5)
    else:
        bamboo(p, 380, 430, 400, -10, 9); bamboo(p, 330, 430, 300, 6, 8)
        lotus(p, 230, 360, .8); lotus_pad(p, 250, 410, 60, 12)
    return p


def organic():
    p = Pic(1920, 600, None)
    pts = [(0, 600), (0, 96)]
    for x in range(0, 1921, 20):
        y = 70 + 40 * math.sin(x / 260) + 26 * math.sin(x / 97 + 1.3) + 12 * math.sin(x / 41)
        pts.append((x, y))
    pts += [(1920, 600)]
    p.fill(pts)
    return p


def monogram():
    p = Pic(120, 120, None)
    p.line(ellipse(60, 60, 57, 57, n=90), 1.4, True)
    p.line(ellipse(60, 60, 53, 53, n=90), .6, True)
    p.line(ellipse(60, 60, 41, 41, n=90), .6, True)
    p.line(ellipse(60, 60, 38, 38, n=90), 1.1, True)
    for k in range(72):                                                  # hatched band
        a = math.radians(k * 5)
        p.line([(60 + 41.5 * math.cos(a), 60 + 41.5 * math.sin(a)), (60 + 52.5 * math.cos(a + .05), 60 + 52.5 * math.sin(a + .05))], .45)
    for k in range(12):                                                  # small stars on the band
        a = math.radians(k * 30 - 90)
        s = star(60 + 47 * math.cos(a), 60 + 47 * math.sin(a), 3.6, 1.5)
        p.shape(s, .5)
    p.text(60, 75, "G4", 40)
    return p


def main():
    files = {
        "frame_cover.svg": frame_cover(), "frame_ch1.svg": frame_ch1(), "frame_ch2.svg": frame_ch2(), "frame_ch3.svg": frame_ch3(),
        "band_ch1.svg": band("ch1"), "band_ch2.svg": band("ch2"), "band_ch3.svg": band("ch3"), "band_end.svg": band("end"),
        "corner_ch1.svg": corner("ch1"), "corner_ch2.svg": corner("ch2"), "corner_ch3.svg": corner("ch3"),
        "organic_curve.svg": organic(), "monogram_g4.svg": monogram(),
    }
    for name, pic in files.items():
        s = pic.svg()
        (OUT / name).write_text(s, encoding="utf-8")
        print(f"{name}: {len(s) // 1024} KB")


if __name__ == "__main__":
    main()
