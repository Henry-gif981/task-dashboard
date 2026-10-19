#!/usr/bin/env python3
"""Review 2026-10, phase 5: proposed content (ĐỀ XUẤT – cần nhóm duyệt). Run once from eu-presentation/."""
from pathlib import Path
P = Path(__file__).resolve().parent.parent / "index.html"; h = P.read_text(encoding="utf-8")
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:110]); return s.replace(a, b)
TAG = '<span class="proposal" title="Proposed in the review of October 2026; remove this tag once the group approves the text">ĐỀ XUẤT – cần nhóm duyệt</span>'

# 1. Crises and reform (2.1.1): gives the Conclusion's "euro crisis, COVID-19 ... the cost of its own regulation" a basis in the body
CRISES = ('    <p class="note rv mt proposal-block">' + TAG + ' <b>Crises and reform.</b> The euro-area debt crisis after 2010 exposed the gap between a common currency and national fiscal policies; '
          'the Union answered with new rescue and banking rules, a pattern Jones, Kelemen and Meunier (2016) call "failing forward". After COVID-19 it went further and borrowed jointly to finance '
          'NextGenerationEU (European Commission, n.d.-h). In 2024 the Letta and Draghi reports warned that a fragmented single market, slow innovation and the weight of regulation hold back '
          'European competitiveness (Letta, 2024; Draghi, 2024).</p>\n')
s0 = h.index('id="c2-economic-b"'); s1 = h.index("</section>", s0)
sec = h[s0:s1]
i = sec.rindex("  </div>\n")   # end of .wrap
sec2 = sec[:i] + CRISES + sec[i:]
h = h[:s0] + sec2 + h[s1:]

# 2. Prospects (end of Chapter 2, before its takeaway): the chapter promises "strengths, limitations and prospects"
PROSPECTS = ('    <p class="note rv mt proposal-block">' + TAG + ' <b>Prospects.</b> The EU\'s regional and global role will depend on whether it completes the single market and closes its competitiveness gap '
             '(Draghi, 2024; Letta, 2024), on how far its trade network widens (Mercosur and India, Table 2.4) while instruments such as CBAM raise the cost of carbon for its partners, '
             'and on whether it can match its regulatory weight with more united external action.</p>\n')
h = rep(h, '    <div class="takeaway rv" role="group" aria-label="Chapter 2 takeaway">', PROSPECTS + '    <div class="takeaway rv" role="group" aria-label="Chapter 2 takeaway">')

# 3. Recommendation 8 on skills (challenge 5), and the matrix of slide 69
R8 = ('      <div class="card rv proposal-block" style="--d:3"><p class="n">8</p>' + TAG + '<h3>Build skills for green and digital jobs</h3><p>Expand vocational and university programmes in green and digital fields with EU partners, '
      'use EU cooperation on education and skills (Table 3.10, "Education and skills") and link training to the needs of EU-invested firms and their local suppliers, so that more of the value of EVFTA trade stays in Vietnam (European External Action Service, 2023).</p></div>\n')
h = rep(h, "using industry associations for technical training.</p></div>\n    </div>", "using industry associations for technical training.</p></div>\n" + R8 + "    </div>")
h = rep(h, 'aria-label="Four of the five challenges have a matching recommendation; skills do not"', 'aria-label="All five challenges are addressed"')
h = rep(h, '<span class="vz-title">Four of the five challenges have a matching recommendation; skills do not</span>', '<span class="vz-title">All five challenges are addressed</span>')
h = rep(h, '<div class="c r gap"><span style="font-size:.84rem"><b>No dedicated recommendation yet.</b> Only "technical training" through industry associations, inside R7.</span></div>',
           '<div class="c r"><span class="rec" title="R8 Skills for green and digital jobs (proposed)">R8 Skills (proposed)</span><span class="rec" title="R7 Firms: compliance and technical training">R7 Firms: training</span></div>')
h = rep(h, '<p class="vz-sowhat">A recommendation on skills and human capital would close the one gap between the analysis and the proposals.</p>',
           '<p class="vz-sowhat">With the proposed Recommendation 8 on skills, every challenge has at least one matching recommendation.</p>')

# style of the proposal tag
h = rep(h, "a.srcl .nw { white-space: nowrap; }\n", "a.srcl .nw { white-space: nowrap; }\n"
        ".proposal { display: inline-block; font: 700 .62rem/1 var(--sans); letter-spacing: .04em; color: #7A4B00; background: #FFF4CC; border: 1px solid #E8C55A; border-radius: 2px; padding: 3px 6px; margin-right: 6px; vertical-align: 2px; }\n"
        ".card .proposal { margin: 0 0 6px; }\n")
# presenter notes
h = rep(h, '  "c3-recommendations": [', '  "c3-recommendations": ["ĐỀ XUẤT – cần nhóm duyệt: Khuyến nghị 8 về kỹ năng xanh và số (gắn với \\"Education and skills\\" ở Bảng 3.10), để cả năm thách thức đều có khuyến nghị tương ứng.", ')
P.write_text(h, encoding="utf-8")
print("ok")
