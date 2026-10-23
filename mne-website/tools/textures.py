"""Generate the watercolour wash and paper-grain textures (assets/img/*.webp).

    python3 tools/textures.py
"""
import pathlib
import numpy as np
from PIL import Image, ImageFilter

OUT = pathlib.Path(__file__).resolve().parent.parent / "assets" / "img"
rng = np.random.default_rng(11)


def noise(h, w, scale, octaves=4, seed=0):
    r = np.random.default_rng(seed)
    acc = np.zeros((h, w))
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        s = max(2, int(scale / 2 ** o))
        small = r.random((h // s + 2, w // s + 2))
        img = Image.fromarray((small * 255).astype(np.uint8)).resize((w + s, h + s), Image.BICUBIC)
        acc += amp * np.asarray(img, float)[:h, :w] / 255
        tot += amp
        amp *= 0.5
    acc /= tot
    return (acc - acc.min()) / (acc.max() - acc.min())


def hexc(s):
    return np.array([int(s[i:i + 2], 16) for i in (1, 3, 5)], float)


def wash(w=1600, h=900):
    y, x = np.mgrid[0:h, 0:w]
    g = (x / w * .6 + y / h * .4)[..., None]
    img = hexc("#56718F") * (1 - g) + hexc("#445C7A") * g
    # soft mottling
    m = noise(h, w, 420, 5, 1)[..., None]
    img = img * (1 - .55 * m ** 2) + hexc("#7C93A8") * (.55 * m ** 2)
    # blooms: thresholded noise with darker pooled edges
    for seed, thr, col, a in [(2, .62, "#7F96AB", .55), (3, .66, "#3F5775", .45), (4, .7, "#8BA0B3", .35)]:
        n = noise(h, w, 360, 5, seed)
        mask = np.clip((n - thr) / .05, 0, 1)
        mi = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
        mask = np.asarray(mi, float) / 255
        edge = np.asarray(mi.filter(ImageFilter.FIND_EDGES).filter(ImageFilter.GaussianBlur(1.6)), float) / 255
        mask = mask[..., None]
        img = img * (1 - a * mask) + hexc(col) * (a * mask)
        img -= (edge[..., None] * 60 * a)
    # vignette (keeps the centre, where text sits, the darkest)
    d = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2)[..., None]
    img = img * (1 - .06 * np.clip(1.2 - d, 0, 1))
    # granulation
    img += (rng.random((h, w, 1)) - .5) * 9
    img += (noise(h, w, 6, 2, 7)[..., None] - .5) * 10
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))


def paper(s=512):
    img = np.ones((s, s, 3)) * hexc("#F4EBD0")
    fib = noise(s, s, 64, 4, 21)
    img -= (fib[..., None] - .5) * hexc("#28200A") * .10
    img += (rng.random((s, s, 1)) - .5) * 7
    # wrap edges so the tile repeats without seams
    t = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    a = np.asarray(t, float)
    k = 48
    for i in range(k):
        wgt = i / k
        a[i] = a[i] * wgt + a[s - k + i] * (1 - wgt)
        a[:, i] = a[:, i] * wgt + a[:, s - k + i] * (1 - wgt)
    return Image.fromarray(np.clip(a[:s - k, :s - k], 0, 255).astype(np.uint8))


if __name__ == "__main__":
    wv = wash()
    wv.save(OUT / "wash.webp", quality=78, method=6)
    wv.resize((800, 450), Image.LANCZOS).save(OUT / "wash-sm.webp", quality=74, method=6)
    paper().save(OUT / "paper.webp", quality=72, method=6)
    for n in ("wash.webp", "wash-sm.webp", "paper.webp"):
        print(n, (OUT / n).stat().st_size // 1024, "KB")
