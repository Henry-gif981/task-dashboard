"""Build dist/mne-website.html: one self-contained file (CSS, JS, fonts and images inlined).

    python3 tools/standalone.py
"""
import base64, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
TYPES = {".svg": "image/svg+xml", ".webp": "image/webp", ".woff2": "font/woff2"}


def data_uri(path):
    p = (ROOT / path).resolve()
    return f"data:{TYPES[p.suffix]};base64,{base64.b64encode(p.read_bytes()).decode()}"


html = (ROOT / "index.html").read_text()
css = (ROOT / "css/style.css").read_text()
css = re.sub(r'url\("?\.\./(assets/[^")]+)"?\)', lambda m: f'url("{data_uri(m.group(1))}")', css)

html = re.sub(r'<link rel="preload"[^>]*>\n', "", html)
html = html.replace('<link rel="stylesheet" href="css/style.css">', f"<style>\n{css}</style>")
html = re.sub(r'<script src="(js/[^"]+)" defer></script>', lambda m: f"<script>\n{(ROOT / m.group(1)).read_text()}</script>", html)
html = re.sub(r'(src|href)="(assets/img/[^"]+)"', lambda m: f'{m.group(1)}="{data_uri(m.group(2))}"', html)

out = ROOT / "dist" / "mne-website.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html)
print(out, out.stat().st_size // 1024, "KB")
