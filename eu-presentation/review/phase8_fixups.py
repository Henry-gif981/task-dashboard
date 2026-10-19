"""Phase 8 follow-ups: Source lines on one line, 3.1.1 wrapper, 3.2.1a note order."""
import re, pathlib
p = pathlib.Path(__file__).resolve().parent.parent / "index.html"
s = p.read_text()

def rep(a, b):
    global s
    if a not in s and b in s:  # already applied (script is re-runnable)
        return
    assert s.count(a) == 1, a[:60]
    s = s.replace(a, b)

# item 4: the external-link icon was display:block (global svg rule) -> broke the line
rep("a.srcl .ext { width: .72em; height: .72em; margin-left: 2px; vertical-align: baseline; }",
    "a.srcl .ext { display: inline; width: .72em; height: .72em; margin-left: 2px; vertical-align: baseline; }")

# 3.1.1: the visual beside the lead was removed (item 10) -> drop the empty pair wrapper
rep('''    <div class="vb-pair">
    <p class="lead rv" style="--d:2">Since diplomatic relations were established in 1990''',
    '''    <p class="lead rv" style="--d:2">Since diplomatic relations were established in 1990''')
rep('''education and sustainable development.</p>
    </div>
    <p class="cap rv mt"><span class="lbl">Table 3.1</span>''',
    '''education and sustainable development.</p>
    <p class="cap rv mt"><span class="lbl">Table 3.1</span>''')

# 3.2.1a: Table 3.5 removed (item 12) -> growth note now follows Figure 3.1
note = '''    <p class="tnote">Growth since 2020 is not due to the EVFTA alone: as Section 3.4.1 notes, trade growth reflects the EVFTA together with global demand, supply chains and wider integration.</p>\n'''
rep('''    <div class="mt">
      <div>
''' + note + '''      </div>
      <figure class="chart rv mt" style="--d:2">''', '''    <div class="mt">
      <figure class="chart rv mt" style="--d:2">''')
i = s.index('<span class="lbl">Figure 3.1.</span> EU–Vietnam trade in goods')
j = s.index('</figure>', i) + len('</figure>\n')
if not s[j:].startswith(note):
    s = s[:j] + note + s[j:]
p.write_text(s)
print("ok")

# presenter notes: drop references to the removed Tables 2.3, 3.5, 3.7, 3.8
s = p.read_text()
rep('"Bảng 2.3: thặng dư 128 tỷ euro', '"Hình 2.4 và Mục 2.2.1: thặng dư 128 tỷ euro')
rep('"Bảng 3.5 (Eurostat, euro): thương mại', '"Hình 3.1 (Eurostat, euro): thương mại')
rep('["Ghi chú dữ liệu (không đọc lên): dòng \\"Annual European FDI inflow\\" của Bảng 3.7 được đọc từ ảnh trang báo cáo vì lớp chữ của PDF bị lỗi.", "EU đã đầu tư',
    '["EU đã đầu tư')
rep('"Bảng 3.7: tỷ trọng của EU giảm', '"Tỷ trọng của EU giảm')
rep('"Bảng 3.8: rà soát pháp luật', '"Cải cách thể chế: rà soát pháp luật')
p.write_text(s)
print("notes ok")
