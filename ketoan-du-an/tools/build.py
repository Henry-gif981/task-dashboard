"""Ghép trang và tạo bản một file.

    python3 tools/build.py
-> index.html            (src/head.html + src/parts/*.html theo thứ tự tên + src/tail.html)
-> assets/viz_data.js    (bản sao của viz_data.json để chạy được khi mở bằng file://)
-> dist/KeToanDuAn_standalone.html  (CSS, JS, dữ liệu, font và ảnh nhúng base64)
"""
import base64, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
parts = sorted((ROOT / "src" / "parts").glob("*.html"))
html = (ROOT / "src/head.html").read_text("utf-8") + "\n".join(p.read_text("utf-8") for p in parts) + (ROOT / "src/tail.html").read_text("utf-8")
(ROOT / "index.html").write_text(html, "utf-8")
data = json.loads((ROOT / "viz_data.json").read_text("utf-8"))
(ROOT / "assets/viz_data.js").write_text("/* bản sao tự sinh từ viz_data.json (tools/build.py) */\nwindow.VIZ = " + json.dumps(data, ensure_ascii=False) + ";\n", "utf-8")

def b64(path, mime):
    return f"data:{mime};base64," + base64.b64encode((ROOT / path).read_bytes()).decode()

fonts = (ROOT / "fonts/fonts.css").read_text("utf-8")
fonts = re.sub(r"url\((?!data:)([^)]+\.woff2)\)", lambda m: f"url({b64('fonts/' + m.group(1), 'font/woff2')})", fonts)
style = (ROOT / "assets/style.css").read_text("utf-8")
one = html.replace('<link rel="stylesheet" href="fonts/fonts.css">', "<style>\n" + fonts + "</style>")
one = one.replace('<link rel="stylesheet" href="assets/style.css">', "<style>\n" + style + "</style>")
one = one.replace('<script src="assets/viz_data.js"></script>', "<script>\n" + (ROOT / "assets/viz_data.js").read_text("utf-8") + "</script>")
one = one.replace('<script src="assets/app.js"></script>', "<script>\n" + (ROOT / "assets/app.js").read_text("utf-8").replace("</script", "<\\/script") + "</script>")
for js in ("vendor/three.min.js", "assets/hero3d.js", "assets/silk.js"):
    one = one.replace(f'<script src="{js}"></script>', "<script>\n" + (ROOT / js).read_text("utf-8").replace("</script", "<\\/script") + "\n</script>")
mimes = {".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}
cache = {}
def img(m):
    p = m.group(1)
    if p not in cache:
        cache[p] = b64(p, mimes[Path(p).suffix])
    return cache[p]
# ảnh dùng nhiều lần (thumbnail + lightbox) được gom vào một bảng để không nhúng hai lần
paths = sorted(set(re.findall(r'(assets/(?:scans/[^"]+\.jpg|logo-neu\.png))', one)))
table = {p: b64(p, mimes[Path(p).suffix]) for p in paths}
for p in paths:
    one = one.replace(f'src="{p}"', f'src="" data-embed="{p}"')
    one = one.replace(f'data-img="{p}"', f'data-img="" data-embed-lb="{p}"')
loader = "<script>window.__IMG=" + json.dumps(table) + ";document.querySelectorAll('[data-embed]').forEach(function(e){e.src=window.__IMG[e.dataset.embed];});document.querySelectorAll('[data-embed-lb]').forEach(function(e){e.dataset.img=window.__IMG[e.dataset.embedLb];});</script>"
one = one.replace("<script>\n/* bản sao tự sinh", loader + "\n<script>\n/* bản sao tự sinh", 1)
(ROOT / "dist").mkdir(exist_ok=True)
out = ROOT / "dist/KeToanDuAn_standalone.html"
out.write_text(one, "utf-8")
print(f"index.html: {len(parts)} phần; standalone {out.stat().st_size / 1e6:.2f} MB")
