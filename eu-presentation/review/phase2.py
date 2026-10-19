#!/usr/bin/env python3
"""Review 2026-10, phase 2: References and citations. Run once from eu-presentation/."""
import html as H, json, re
from pathlib import Path
from urllib.parse import unquote
ROOT = Path(__file__).resolve().parent.parent
P = ROOT / "index.html"; h = P.read_text(encoding="utf-8")

def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:100])
    return s.replace(a, b)

# ---------- 1. References: sources cited on the slides but missing from the list ----------
NEW = [  # (entry text, URL or None). Dates and titles as published; see CHANGELOG_REVIEW.md for open points.
 ("Bundesbank. (2026). EU trade agreements with Mercosur and India: A signal for global cooperation. Deutsche Bundesbank.", "https://www.bundesbank.de/en/tasks/topics/eu-trade-agreements-with-mercosur-and-india-a-signal-for-global-cooperation-990258"),
 ("DLA Piper. (2026, February). EU and India Free Trade Agreement.", "https://www.dlapiper.com/en/insights/publications/2026/02/eu-and-india-free-trade-agreement"),
 ("East Asia Forum. (2026, March 6). Vietnam's carbon market faces a reality check.", "https://eastasiaforum.org/2026/03/06/vietnams-carbon-market-faces-a-reality-check/"),
 ("Ebner Stolz. (2026). EU-Mercosur-Abkommen und EU-Indien-Freihandelsabkommen [EU–Mercosur agreement and EU–India free trade agreement].", "https://www.ebnerstolz.de/de/unser-angebot/leistungen/steuerberatung/zollrecht-energiesteuer-aussenwirtschaft/eu-mercosur-abkommen-eu-indien-freihandelsabkommen-103968.html"),
 ("EuroCham Vietnam. (2025, June 30). EuroCham Vietnam Business Confidence Index Q2 2025: European businesses reaffirm Vietnam's long-term potential.", "https://eurochamvn.org/eurocham-vietnam-business-confidence-index-q2-2025-european-businesses-reaffirm-vietnams-long-term-potential/"),
 ("European Commission. (n.d.-k). EU–Vietnam Free Trade Agreement. Access2Markets.", "https://trade.ec.europa.eu/access-to-markets/en/content/eu-vietnam-free-trade-agreement"),
 ("European Commission. (n.d.-l). Global Gateway: Vietnam Just Energy Transition Partnership. International Partnerships.", "https://international-partnerships.ec.europa.eu/policies/global-gateway/vietnam-just-energy-transition-partnership_en"),
 ("European Commission. (2019). The European Green Deal (COM(2019) 640 final).", "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52019DC0640"),
 ("European Commission, Directorate-General for Trade. (2026, May 20). European Union, trade in goods with Viet Nam [Country factsheet, Eurostat Comext data].", "https://webgate.ec.europa.eu/isdb_results/factsheets/country/details_vietnam_en.pdf"),
 ("European External Action Service. (2023, July 6). The European Union and Vietnam.", "https://www.eeas.europa.eu/vietnam/european-union-and-vietnam_en"),
 ("European External Action Service. (2026, March 24). Global Gateway: The European Union to invest €560 million in Vietnam with new focus on modern transport [Press release].", "https://www.eeas.europa.eu/commissioner-sikela-business-forum-pr_en"),
 ("European External Action Service. (n.d.). Who we are: Delegation of the European Union to the United Nations in New York.", "https://www.eeas.europa.eu/un-new-york/who-we-are_en"),
 ("European Union. (2016a). Consolidated version of the Treaty on European Union. Official Journal of the European Union, C 202, 7 June 2016.", "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:12016M/TXT"),
 ("European Union. (2016b). Consolidated version of the Treaty on the Functioning of the European Union. Official Journal of the European Union, C 202, 7 June 2016.", "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:12016E/TXT"),
 ("European Union. (2021). Regulation (EU) 2021/1119 establishing the framework for achieving climate neutrality (European Climate Law). Official Journal of the European Union, L 243, 9 July 2021.", "https://eur-lex.europa.eu/eli/reg/2021/1119/oj/eng"),
 ("Eurostat. (2026a, February 13). Euro area international trade in goods surplus €12.6 bn [Euro indicators news release].", "https://ec.europa.eu/eurostat/web/products-euro-indicators/w/6-13022026-bp"),
 ("Eurostat. (2026b, March 26). EU trade in goods surplus down to €128 billion in 2025 [Eurostat news].", "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20260326-4"),
 ("Foreign Investment Agency, Ministry of Planning and Investment. (n.d.). Đầu tư của EU tại Việt Nam [EU investment in Vietnam].", "http://fia.mpi.gov.vn/tinbai/4019/Dau-tu-cua-EU-tai-Viet-Nam"),
 ("Ministry of Industry and Trade of Vietnam. (n.d.). Hiệp định EVFTA và IPA: Việt Nam và EU cam kết những gì? [The EVFTA and the IPA: What have Vietnam and the EU committed to?].", "https://moit.gov.vn/tin-tuc/70-nam-nganh-cong-thuong/hiep-dinh-evfta-va-ipa-viet-nam-va-eu-cam-ket-nhung-gi-.html"),
 ("S&P Global Commodity Insights. (2025, June 11). Vietnam to start pilot emission trading in 2025, allow offsetting 30% emissions.", "https://www.spglobal.com/energy/en/news-research/latest-news/energy-transition/061125-vietnam-to-start-pilot-emission-trading-in-2025-allow-offsetting-30-emissions"),
 ("Sullivan & Cromwell. (2026, January). EU strikes major trade deals with Mercosur and India.", "https://www.sullcrom.com/insights/memo/2026/January/EU-Strikes-Major-Trade-Deals-Mercosur-India"),
 ("Thương hiệu & Công luận. (2026). EVFTA bước vào giai đoạn mới: Khi lợi thế thuế quan không còn là yếu tố quyết định [The EVFTA enters a new stage: when tariff advantages are no longer decisive].", "https://thuonghieucongluan.com.vn/evfta-buoc-vao-giai-doan-moi-khi-loi-the-thue-quan-khong-con-la-yeu-to-quyet-dinh-a328862.html"),
 ("Trung tâm WTO và Hội nhập. (2026a). Từ \"thẻ vàng\" đến \"thẻ xanh\": Cơ hội tái định vị ngành thủy sản [From the \"yellow card\" to the \"green card\": An opportunity to reposition the seafood industry].", "https://trungtamwto.vn/tin-tuc/32123-tu-the-vang-den-the-xanh-co-hoi-tai-dinh-vi-nganh-thuy-san"),
 ("United Nations General Assembly. (2011). Participation of the European Union in the work of the United Nations (A/RES/65/276).", "https://digitallibrary.un.org/record/702981"),
 ("Upply. (2025). Review of the EU-Vietnam Free Trade Agreement 5 years on.", "https://market-insights.upply.com/en/review-of-the-eu-vietnam-free-trade-agreement-5-years-on"),
 ("Viet Nam News. (2026, June 18). Việt Nam's trade surplus with EU expands amid economic headwinds.", "https://vietnamnews.vn/economy/1783697/viet-nam-s-trade-surplus-with-eu-expands-amid-economic-headwinds.html"),
 ("Vietnam Briefing. (n.d.). What EU's sustained investment tells us about Vietnam's business environment.", "https://www.vietnam-briefing.com/news/what-eus-sustained-investment-tells-us-about-vietnams-business-environment.html/"),
 ("Vietnam Investment Review. (2025). EVFTA is a meaningful increase in both volume and quality.", "https://vir.com.vn/evfta-is-a-meaningful-increase-in-both-volume-and-quality-159288.html"),
 ("Vietnam News Agency. (2026, August 10). Action plan issued to address EC recommendations on combating IUU fishing. VietnamPlus.", "https://en.vietnamplus.vn/action-plan-issued-to-address-ec-recommendations-on-combating-iuu-fishing-post349844.vnp"),
 ("VietnamPlus. (2025a, September). Vietnam sees rising European investment inflows.", "https://en.vietnamplus.vn/vietnam-sees-rising-european-investment-inflows-post326745.vnp"),
 ("VietnamPlus. (2025b, November 28). Poland ratifies EU-Vietnam Investment Protection Agreement.", "https://en.vietnamplus.vn/poland-ratifies-eu-vietnam-investment-protection-agreement-post333411.vnp"),
 ("VietnamPlus. (2025c). Vietnam's trade surplus with EU expands amid economic headwinds.", "https://en.vietnamplus.vn/vietnams-trade-surplus-with-eu-expands-amid-economic-headwinds-post344737.vnp"),
 ("VietnamPlus. (2026, August). EVFTA deliver tangible gains for Vietnam-EU trade after six years.", "https://en.vietnamplus.vn/evfta-deliver-tangible-gains-for-vietnam-eu-trade-after-six-years-post349353.vnp"),
 ("World Trade Organization. (n.d.). The European Union and the WTO: Member information.", "https://www.wto.org/english/thewto_e/countries_e/european_communities_e.htm"),
]
TODO_REFS = [  # cited on the slides, publication not identified: kept out of the visible list
 "Climate Policy Initiative. (n.d.): cited in Recommendation 5; the publication (title, URL) could not be identified.",
 "Italian Trade Agency. (2026): cited in Recommendation 6; the publication could not be identified (ITA Vietnam pages and 2026 news found, no report).",
 "Trung tâm WTO và Hội nhập. (2026b) [cited as 2026c before]: cited in Recommendation 5 (JETP / Global Gateway project pipeline); no matching 2026 article found on trungtamwto.vn.",
]
def li(text, url):
    t = H.escape(text, quote=False)
    if not url: return f"      <li>{t}</li>"
    shown = H.escape(unquote(url)).replace("/", "/<wbr>").replace("-", "-<wbr>").replace("/<wbr>/<wbr>", "//")
    return f'      <li>{t} <a class="ref-url" href="{url}" target="_blank" rel="noopener">{shown}</a></li>'
m = re.search(r'(<ul class="refs mt">\n)(.*?)(\n    </ul>)', h, re.S)
items = m.group(2).split("\n")
assert len(items) == 33, len(items)
key = lambda s: re.sub(r"<[^>]+>", "", s).strip().lower()
items += [li(t, u) for t, u in NEW]
items.sort(key=key)
items.append("      <!-- TODO(verify): sources cited on the slides whose publication is not identified yet:\n" + "\n".join("           - " + H.escape(t, quote=False) for t in TODO_REFS) + "\n      -->")
h = h[:m.start(2)] + "\n".join(items) + h[m.end(2):]
h = rep(h, 'data-pdf="REFERENCE (33 entries, as listed in the report)"', 'data-pdf="REFERENCES (33 entries of the report + sources cited on the slides)"')

# ---------- 2. citation markers and author–year form ----------
# "[2]" after a source name -> author–year with the reference letters
h = rep(h, "Official EU legal texts and European Commission publications; compiled by the authors (Table 2.6).",
           "Official EU legal texts and European Commission (n.d.-e, n.d.-g); compiled by the authors (Table 2.6).")
h = rep(h, "Official EU legal texts and European Commission publications; compiled by the authors.",
           "Official EU legal texts and European Commission (n.d.-e, n.d.-g); compiled by the authors.")
# Table 2.4 and its timeline: the Commission pages on the agreements that are in References
h = rep(h, '<p class="src"><b>Source:</b> European Commission; Sullivan &amp; Cromwell (2026);', '<p class="src"><b>Source:</b> European Commission (n.d.-b, n.d.-c, n.d.-d, n.d.-j); Sullivan &amp; Cromwell (2026);')
h = rep(h, '"source": "European Commission; Sullivan & Cromwell (2026);', '"source": "European Commission (n.d.-b, n.d.-c, n.d.-d, n.d.-j); Sullivan & Cromwell (2026);')
# Trung tâm WTO: there is no 2026a -> letters a and b
h = rep(h, "Trung tâm WTO và Hội nhập, 2026b", "Trung tâm WTO và Hội nhập, 2026a")
h = rep(h, "Trung tâm WTO và Hội nhập, 2026c", "Trung tâm WTO và Hội nhập, 2026b")
h = rep(h, "Trung tâm WTO và Hội nhập (2026b, 2026c)", "Trung tâm WTO và Hội nhập (2026a, 2026b)")

# ---------- 3. references that the slides never cited: citations where the slide states their argument ----------
# (ĐỀ XUẤT – cần nhóm duyệt; listed in CHANGELOG_REVIEW.md)
h = rep(h, '"source": "Compiled by the authors from the data in Section 1.1.2."', '"source": "Compiled by the authors from the data in Section 1.1.2; the five levels follow Balassa (1961)."')
h = rep(h, 'EU rules and standards can influence companies and countries outside its borders, the "Brussels Effect".',
           'EU rules and standards can influence companies and countries outside its borders, the "Brussels Effect" (Bradford, 2020; Börzel &amp; Risse, 2012; Damro, 2012; Manners, 2002).')
h = rep(h, "a functioning market economy; the ability to take on the acquis.</li>", "a functioning market economy; the ability to take on the acquis (Schimmelfennig &amp; Sedelmeier, 2004).</li>")
h = rep(h, "<li>European Neighbourhood Policy, association and partnership agreements, conditional financial support</li>",
           "<li>European Neighbourhood Policy, association and partnership agreements, conditional financial support (Lavenex, 2004)</li>")
h = rep(h, "and the European Parliament consents to the final agreements.</li>", "and the European Parliament consents to the final agreements (Meunier &amp; Nicolaïdis, 2006).</li>")
h = rep(h, "<td>ASEAN and other regional partners</td><td>Strategic partnerships and region-to-region dialogues</td>",
           "<td>ASEAN and other regional partners</td><td>Strategic partnerships and region-to-region dialogues (Hettne &amp; Söderbaum, 2005)</td>")
h = rep(h, "<li>Unanimity in foreign and security policy</li>", "<li>Unanimity in foreign and security policy; a civilian rather than a military power (Bull, 1982)</li>")
h = rep(h, "are still developing abroad, amid calls for simplification.</p>", "are still developing abroad, amid calls for simplification (Akin Gump, 2025).</p>")
P.write_text(h, encoding="utf-8")

# ---------- 4. source links ----------
EXTRA = [
 '    [/European Commission \\(n\\.d\\.-e, n\\.d\\.-g\\)/, [{ ref: "European Commission. (n.d.-e)" }, { ref: "European Commission. (n.d.-g)" }]],',
 '    [/European Commission \\(n\\.d\\.-b, n\\.d\\.-c, n\\.d\\.-d, n\\.d\\.-j\\)/, [{ ref: "European Commission. (n.d.-b)" }, { ref: "European Commission. (n.d.-c)" }, { ref: "European Commission. (n.d.-d)" }, { ref: "European Commission. (n.d.-j)" }]],',
 '    [/Balassa \\(1961\\)/, { ref: "Balassa, B. (1961)" }],',
 '    [/EU–Vietnam cooperation documents/, "eeas-eu-vietnam"],',
 '    [/EVFTA sustainable development framework/, "access2markets-evfta"],',
 '    [/EuroCham(?: \\(2025\\))?/, "eurocham-bci-q2-2025"],',
]
for f in [P, ROOT / "v3b" / "src" / "sources.js"]:
    s = f.read_text(encoding="utf-8")
    s = rep(s, '    [/European Commission, Access2Markets/, "access2markets-evfta"],\n', '    [/European Commission, Access2Markets/, "access2markets-evfta"],\n' + "\n".join(EXTRA) + "\n")
    s = rep(s, '    [/EuroCham(?: \\(2025\\))?/, "eurocham-2025"],\n', "")
    s = rep(s, '    [/EU–Vietnam cooperation documents and the EVFTA sustainable development framework/, ["eeas-eu-vietnam", "access2markets-evfta"]],\n', "")
    s = rep(s, '    [/European Commission publications/, [{ ref: "European Commission. (n.d.-e)" }, { ref: "European Commission. (n.d.-g)" }]],\n', "")
    s = rep(s, '    [/Trung tâm WTO và Hội nhập \\(2026b, 2026c\\)/, ["ttwto-2026b", "ttwto-2026c"]],', '    [/Trung tâm WTO và Hội nhập \\(2026a, 2026b\\)/, ["ttwto-2026b", null]],')
    # general home pages are not sources: no link (listed as TODO in the review)
    s = rep(s, '[/Ministry of Industry and Trade \\/ Vietnam Customs/, "customs-vn"]', '[/Ministry of Industry and Trade \\/ Vietnam Customs/, null]')
    s = rep(s, '[/Climate Policy Initiative \\(n\\.d\\.\\)/, "cpi-nd"], [/Italian Trade Agency \\(2026\\)/, "ita-2026"]', '[/Climate Policy Initiative \\(n\\.d\\.\\)/, null], [/Italian Trade Agency \\(2026\\)/, null]')
    f.write_text(s, encoding="utf-8")
uj = ROOT / "v3b" / "src" / "source_urls.json"; urls = json.loads(uj.read_text(encoding="utf-8"))
urls.append({"key": "eurocham-bci-q2-2025", "source": "EuroCham (2025)", "url": "https://eurochamvn.org/eurocham-vietnam-business-confidence-index-q2-2025-european-businesses-reaffirm-vietnams-long-term-potential/",
             "title": "EuroCham Vietnam Business Confidence Index Q2 2025 (customs valuation reported by 37% of respondents)", "status": "article-verified"})
uj.write_text(json.dumps(urls, ensure_ascii=False, indent=1), encoding="utf-8")
h = P.read_text(encoding="utf-8")
m = re.search(r'(<script type="application/json" id="src-urls">)(.*?)(</script>)', h, re.S)
h = h[:m.start(2)] + json.dumps(urls, ensure_ascii=False) + h[m.end(2):]
P.write_text(h, encoding="utf-8")
print("references:", len(items) - 1)
