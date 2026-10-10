"""Copy viz_data.json into index.html (script#viz-data), so the page also works from file:// without fetch.

Usage: python3 tools/embed_viz_data.py [--check]
--check: exit 1 if the embedded copy differs from viz_data.json.
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "index.html"
OPEN = '<script type="application/json" id="viz-data">'

data = json.loads((ROOT / "viz_data.json").read_text(encoding="utf-8"))
payload = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
html = HTML.read_text(encoding="utf-8")
m = re.search(re.escape(OPEN) + r"(.*?)</script>", html, re.S)
if not m:
    sys.exit("script#viz-data not found in index.html")
if "--check" in sys.argv:
    same = json.loads(m.group(1)) == data
    print("viz-data in index.html matches viz_data.json" if same else "viz-data in index.html is OUT OF DATE")
    sys.exit(0 if same else 1)
HTML.write_text(html[:m.start(1)] + payload + html[m.end(1):], encoding="utf-8")
print(f"embedded {len(data['visuals'])} visuals ({len(payload)} bytes)")
