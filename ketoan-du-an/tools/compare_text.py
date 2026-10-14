"""So sánh chữ trước/sau khi đổi giao diện.

    python3 tools/compare_text.py before_text after_text [report.md]

Đọc <prefix>_content.txt (chữ nội dung trong <main>, bỏ [data-ui], biểu đồ sinh bằng JS, svg, .sr-only)
và <prefix>.txt (innerText toàn trang). So sánh theo chuỗi từ (bỏ khác biệt khoảng trắng / xuống dòng
và chữ hoa do CSS text-transform). Phần nội dung phải trùng 100%; khác biệt của innerText toàn trang
được liệt kê để đối chiếu với nhãn giao diện khai trong added_content.md.
"""
import difflib, re, sys, unicodedata

def words(path):
    t = unicodedata.normalize("NFC", open(path, encoding="utf-8").read())
    return re.findall(r"\S+", t.lower())

def diff(a, b):
    out = []
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            continue
        out.append((op, " ".join(a[i1:i2]), " ".join(b[j1:j2])))
    return out

pa, pb = sys.argv[1], sys.argv[2]
rep = sys.argv[3] if len(sys.argv) > 3 else None
lines = []
ca, cb = words(pa + "_content.txt"), words(pb + "_content.txt")
d = diff(ca, cb)
lines.append(f"## 1. Chữ nội dung trong <main> (bắt buộc trùng 100%)\n\nTrước: {len(ca)} từ · Sau: {len(cb)} từ · Số chỗ khác: {len(d)}\n")
for op, x, y in d:
    lines.append(f"- {op}: «{x[:300]}» → «{y[:300]}»")
ia, ib = words(pa + ".txt"), words(pb + ".txt")
d2 = diff(ia, ib)
lines.append(f"\n## 2. innerText toàn trang\n\nTrước: {len(ia)} từ · Sau: {len(ib)} từ · Số chỗ khác: {len(d2)}\n")
for op, x, y in d2:
    lines.append(f"- {op}: «{x[:240]}» → «{y[:240]}»")
txt = "\n".join(lines)
print(txt)
if rep:
    open(rep, "w", encoding="utf-8").write("# So sánh chữ trước / sau\n\n" + txt + "\n")
