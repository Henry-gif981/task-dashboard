"""Mọi con số trong PDF phải xuất hiện trên trang, đúng dạng gốc (dấu chấm/phẩy, %).
python3 tools/check_numbers.py source/full_raw.txt page.txt"""
import re, sys, collections
raw = open(sys.argv[1], encoding='utf-8').read()
raw = raw.replace('[cite: 13, 81]', '')
raw = re.sub(r'\.{4,}\s*\d+', ' ', raw)   # số trang trong mục lục (không hiển thị)
page = open(sys.argv[2], encoding='utf-8').read()
NUM = r'(?<![\w.,])\d+(?:[.,]\d+)*%?(?![\w])'
pdf_nums = collections.Counter(re.findall(NUM, raw))
page_nums = collections.Counter(re.findall(NUM, page))
miss = sorted(n for n in pdf_nums if n not in page_nums)
print(f'Số khác nhau trong PDF: {len(pdf_nums)}; có trên trang: {len(pdf_nums) - len(miss)}; thiếu: {len(miss)}')
for n in miss:
    ctx = [m.start() for m in re.finditer(re.escape(n), raw)][:2]
    print(' -', n, '|', ' / '.join(raw[max(0, c - 50):c + 30].replace('\n', ' ') for c in ctx))
