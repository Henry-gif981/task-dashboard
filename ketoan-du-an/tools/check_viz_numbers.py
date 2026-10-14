"""Đối chiếu mọi số trong viz_data.json với chữ của PDF (pdftotext).

    python3 tools/check_viz_numbers.py [source/full_raw.txt] [viz_data.json] [report.md]

Lấy mọi chuỗi số (giữ nguyên dạng Việt Nam: 188,717 · 2.146,45 · 61,3% · 24/03/2025) trong các giá trị
của viz_data.json (bỏ các khóa cấu hình trục: y_max, max_days) rồi tìm đúng chuỗi đó trong chữ PDF.
Dấu "+", "−", "(…)" và chữ "ngày" được bỏ trước khi tìm. Số nào không thấy được liệt kê.
"""
import json, re, sys
pdf = sys.argv[1] if len(sys.argv) > 1 else "source/full_raw.txt"
viz = sys.argv[2] if len(sys.argv) > 2 else "viz_data.json"
out = sys.argv[3] if len(sys.argv) > 3 else None
text = open(pdf, encoding="utf-8").read()
flat = re.sub(r"\s+", " ", text)
SKIP_KEYS = {"y_max", "max_days", "src", "key", "type", "entity", "slide", "t", "_about", "series"}
NUM = r"\d{1,2}/\d{1,2}/\d{4}|\d+(?:[.,]\d+)*%?"
found, missing = [], []
def walk(o, path):
    if isinstance(o, dict):
        for k, v in o.items():
            if k in SKIP_KEYS:
                continue
            walk(v, path + "." + k)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            walk(v, f"{path}[{i}]")
    elif isinstance(o, str):
        for n in re.findall(NUM, o):
            # số thứ tự đầu nhãn ("1. Chi phí xây dựng") và năm trong nhãn không phải số liệu
            if re.fullmatch(r"\d{1,2}", n) and re.search(r"(^|\s)" + re.escape(n) + r"\.\s", o):
                continue
            hit = n in text or n in flat
            (found if hit else missing).append((path, n, o[:80]))
d = json.load(open(viz, encoding="utf-8"))
walk(d, "viz")
uniq = sorted({n for _, n, _ in found})
lines = [f"Chuỗi số trong viz_data.json: {len(found) + len(missing)} lần xuất hiện, {len(uniq) + len({n for _, n, _ in missing})} số khác nhau.",
         f"Tìm thấy trong PDF: {len(found)} lần ({len(uniq)} số). Không tìm thấy: {len(missing)}.", ""]
for p_, n, ctx in missing:
    lines.append(f"- KHÔNG THẤY `{n}` tại {p_}: «{ctx}»")
txt = "\n".join(lines)
print(txt)
if out:
    open(out, "w", encoding="utf-8").write(txt + "\n")
