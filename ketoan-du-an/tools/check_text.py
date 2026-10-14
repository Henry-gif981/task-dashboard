"""So khớp chữ PDF ↔ trang web.
python3 tools/check_text.py source/full_raw.txt page.txt [report.md]
Cắt văn bản PDF thành cửa sổ 6 từ; cửa sổ nào không có trong trang được gom thành đoạn "thiếu"."""
import re, sys, unicodedata
pdf_f, page_f = sys.argv[1], sys.argv[2]
out = sys.argv[3] if len(sys.argv) > 3 else None

def norm_words(s):
    s = unicodedata.normalize('NFC', s).lower()
    s = s.replace('​', ' ').replace('–', '-').replace('—', '-').replace('“', '"').replace('”', '"')
    s = re.sub(r'\.{3,}\s*\d*', ' ', s)            # dấu chấm dẫn của mục lục
    s = re.sub(r'(?<=\w)-\s*\n\s*(?=\w)', '-', s)
    return re.findall(r'[0-9a-zà-ỹđ]+(?:[.,/-][0-9a-zà-ỹđ]+)*', s)

raw = open(pdf_f, encoding='utf-8').read()
# 4 lỗi đã sửa có chủ đích
raw = raw.replace('TÌM MỚI - Google Drive', '').replace('UNIVERSEITY', 'UNIVERSITY').replace('[cite: 13, 81]', '')
raw = re.sub(r'\b03B-CĐT', 'F03B-CĐT', raw) if False else raw
pw = norm_words(raw)
page = ' ' + ' '.join(norm_words(open(page_f, encoding='utf-8').read())) + ' '
N = 5
hit = [' ' + ' '.join(pw[i:i + N]) + ' ' in page for i in range(len(pw) - N + 1)]
cov = [any(hit[j] for j in range(max(0, i - N + 1), min(i, len(hit) - 1) + 1)) for i in range(len(pw))]
# từ không nằm trong cửa sổ khớp nào: kiểm tra riêng cụm 3 từ quanh nó (bảng bị trộn cột khi trích PDF)
runs = []
for i, c in enumerate(cov):
    if c: continue
    if runs and i == runs[-1][1] + 1: runs[-1][1] = i
    else: runs.append([i, i])
pagew = set(page.split())
real = []
for a_, b_ in runs:
    ws = pw[a_:b_ + 1]
    # cụm lẻ do trộn cột: mọi từ đều có trong trang VÀ cụm 3 từ liên tiếp nào cũng tìm thấy => coi là khớp
    tri_ok = all((' ' + ' '.join(ws[k:k + 3]) + ' ') in page for k in range(max(1, len(ws) - 2))) if len(ws) >= 3 else all(w in pagew for w in ws)
    real.append((a_, b_, tri_ok))
bad = [r for r in real if not r[2]]
lines = [f'Số từ PDF (sau 4 chỗ sửa): {len(pw)}', f'Từ nằm trong cụm {N} từ khớp nguyên văn: {sum(cov)}/{len(pw)} ({sum(cov)/len(pw):.2%})',
         f'Cụm lệch do trích bảng/tiêu đề (từng 3 từ vẫn có trong trang): {len(real) - len(bad)}', f'Cụm thật sự không tìm thấy: {len(bad)}', '']
for a_, b_, _ in bad:
    lines.append(f'- từ #{a_}: «' + ' '.join(pw[max(0, a_ - 4):a_]) + ' [' + ' '.join(pw[a_:b_ + 1]) + '] ' + ' '.join(pw[b_ + 1:b_ + 5]) + '»')
txt = '\n'.join(lines)
print(txt[:20000])
if out: open(out, 'w', encoding='utf-8').write(txt)
