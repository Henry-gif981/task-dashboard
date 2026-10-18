"""Build dist/EU_presentation_standalone.html: one self-contained file
(Three.js and fonts inlined) that can be sent on its own and still shows the 3D scenes.

Usage (from eu-presentation/):  python3 tools/build_standalone.py [output.html]
"""
import base64, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
html = (ROOT / "index.html").read_text(encoding="utf-8")

# 1. fonts -> data URIs
def font_uri(m):
    data = (ROOT / m.group(1)).read_bytes()
    return "url(data:font/woff2;base64," + base64.b64encode(data).decode() + ")"
html, n_fonts = re.subn(r"url\((fonts/[\w.-]+\.woff2)\)", font_uri, html)

# 2. Three.js inline (escape any closing script tag inside the library)
three = (ROOT / "vendor" / "three.min.js").read_text(encoding="utf-8").replace("</script", "<\\/script")
tag = '<script src="vendor/three.min.js"></script>'
assert html.count(tag) == 1, "three.js script tag not found"
html = html.replace(tag, "<script>/* three.js r159, MIT licence (see vendor/THREE-LICENSE.txt) */\n" + three + "\n</script>")

import sys
out = pathlib.Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / "dist" / "EU_presentation_standalone.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf-8")
print(f"{out}: {out.stat().st_size / 1024:.0f} KB, {n_fonts} fonts inlined")
