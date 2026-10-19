# CHANGELOG_REVIEW: sửa theo danh sách review (10/2026)

**Phạm vi.** Chỉ sửa trang web, không sửa báo cáo Word.
- Nguồn trang: `eu-presentation/index.html`.
- Bản một tệp: `v3b/EU_presentation_standalone_v3b.html`.
- PDF trình chiếu: `v3b/EU_presentation_v3b_slides.pdf` (73 trang).
- Các thay đổi nằm trong 5 script `review/phase1.py` … `review/phase5.py` (mỗi script chạy một lần) và `scripts/export_slides.mjs`.
- Mỗi giai đoạn một commit.

**Đánh số slide.** "Slide N" trong danh sách review là trang N của bản PDF cũ (73 trang). Bản mới vẫn 73 trang nhưng ngắt trang khác, nên các bảng dưới ghi theo **số trang cũ** và kèm **mục** để dễ tìm.

**Cách kiểm link.** Môi trường làm việc không mở được trang ngoài (proxy chặn). Mọi link mới chỉ được kiểm qua kết quả tìm kiếm. Nhóm nên bấm thử từng link một lần.

---

## 1. Thay đổi theo slide

### Giai đoạn 1: lỗi hiển thị (Phần E)

| Slide cũ | Mục | Lỗi | Đã làm |
|---|---|---|---|
| 6 | 1.1.2 | Sơ đồ bậc thang chỉ còn số 1–5 | Khối 3D (WebGL) không in được ra PDF. Bản PDF dùng hình bậc thang vẽ sẵn (giống bản in). |
| 9–10 | 1.2.1 | Ô 2009/2013/2016/2020 trống; timeline cắt ở 1995 | Thẻ mốc không còn bị cắt giữa năm và nội dung. Timeline A1 xuống nhiều hàng trong PDF, đủ 21 mốc đến "2020–present". |
| 40–41 | 3.1.1 | 3 ô cuối Table 3.1 trống | Như trên: thẻ luôn nằm trọn một trang. |
| 24–25, 27–28, 34–35, 57–58, 60–61, 63–64 | | Bảng bị cắt đôi; slide 25 chỉ còn 1 dòng | Bảng vừa một trang thì không bao giờ bị cắt. Caption đi với bảng, dòng Source/ghi chú đi với bảng phía trên. Trang gần trống được thu nhỏ thêm (zoom tối thiểu 0,6) để gộp lại. |
| mọi trang nối tiếp | | Nhãn tiếng Việt "(TIẾP 2/2)" | Đổi thành "(cont.)". |
| 5 (và mọi tiêu đề 1.1/1.2…) | | "1.1Theoreticalbasis…" | Thêm dấu cách thật giữa số và tên mục. PDF giãn khoảng cách từ 5% để chép chữ không bị dính. |
| 31 | 2.2.2 | "Enhanced observer(2011)" | HTML vốn có dấu cách; lỗi do khoảng cách từ trong PDF. Đã sửa bằng giãn khoảng cách từ (kiểm bằng pdftotext). |
| 41 | 3.1.1 | "Jun 2018" và "30 Jun 2019" chồng nhau | Hộp nhãn tính rộng hơn, thêm hàng nhãn và vị trí đặt nhãn. |
| 20, 31, 34, 42, 44, 50, 52, 53, 59 | | Biểu tượng ↗ rơi xuống dòng riêng | Chữ cuối của link và ↗ được gói trong một `span` có `white-space: nowrap`. |
| 47 | 3.1.3b | Dòng Source của Table 3.4 nằm đầu slide sau; câu "asymmetric" lặp 2 lần | Source luôn đi cùng bảng. Bỏ dòng "so what" của biểu đồ A7b, giữ câu của báo cáo. |
| 18, 55 | 2.1.1b, 3.2.1d | Ghi chú nội bộ lọt lên slide | Ba ghi chú "renumbered Figure 2.1 here", "the report's figure also shows…", "read from the page image…" đã chuyển sang speaker notes (phím S). |
| 18, 24, 26, 55 | | Chữ số nhân đôi trong lớp chữ ("3,,442") | Nguyên nhân: nhãn có viền trắng (`paint-order: stroke`), PDF ghi mỗi ký tự hai lần. Đã bỏ viền; pdftotext không còn ",,", "..", "−−", "%%". |
| 39 | Key figures | €76,0 bn và US$56,2 bn đặt cạnh nhau | Mỗi số có dòng chú thích: hàng hóa, đơn vị, năm, nguồn thống kê. Thêm dòng ghi chú: hai số không so sánh trực tiếp được. |
| 63 | 3.3.2b | Table 3.11 và dự án JETP thiếu Source | Source nằm cùng trang với bảng. Thêm nguồn cho 3 dự án JETP: European Commission, Global Gateway: Vietnam JETP (trang EU liệt kê Bác Ái, mở rộng Trị An, điện gió Trà Vinh). |

### Giai đoạn 2: References và trích dẫn
- **References: 33 → 70 mục.** Đã thêm các nguồn được trích trên slide nhưng thiếu trong danh sách, mỗi mục có URL bài/trang cụ thể:
  - Eurostat (2 thông cáo 2026 + trang ASEAN-EU);
  - EEAS (3 trang);
  - DG Trade factsheet;
  - Access2Markets;
  - VietnamPlus (4 bài), Viet Nam News, EuroCham (BCI Q2/2025), Vietnam Briefing (2 bài), Vietnam Investment Review, Vietnam News Agency;
  - Sullivan & Cromwell, Bundesbank, DLA Piper, Ebner Stolz;
  - East Asia Forum, S&P Global, Upply;
  - MOIT, Thương hiệu & Công luận, Trung tâm WTO và Hội nhập;
  - TEU, TFEU, Luật Khí hậu, Green Deal, Nghị quyết LHQ 65/276, WTO;
  - nguồn mới của Giai đoạn 4.
- **Trung tâm WTO và Hội nhập:** không có bản 2026a, nên 2026b/2026c được đánh lại thành 2026a/2026b.
- **Marker "[2]" (slide 34, 35, 61)** chuyển sang dạng tác giả–năm:
  - "European Commission (n.d.-e, n.d.-g)";
  - Table 2.4: "European Commission (n.d.-b, n.d.-c, n.d.-d, n.d.-j)";
  - slide 61: hai cụm từ được link riêng.
- **Link trỏ về trang chủ chung đã bỏ:** customs.gov.vn, trang chủ CPI, ITA và Trung tâm WTO. Các nguồn này không còn link, chờ nhóm bổ sung (xem mục 3).
- **ĐỀ XUẤT – cần nhóm duyệt:** chèn trích dẫn References chưa dùng vào chỗ slide nêu đúng lập luận của tác giả:

  | Tác giả | Chỗ chèn |
  |---|---|
  | Balassa 1961 | 5 cấp độ hội nhập, 1.1.2 |
  | Bradford 2020; Börzel & Risse 2012; Damro 2012; Manners 2002 | thẻ "External influence", 1.1.3 |
  | Schimmelfennig & Sedelmeier 2004 | tiêu chí Copenhagen |
  | Lavenex 2004 | Chính sách láng giềng |
  | Meunier & Nicolaïdis 2006 | Chính sách thương mại chung |
  | Hettne & Söderbaum 2005 | đối tác liên khu vực (Table 2.5) |
  | Bull 1982 | thẻ "Less weight than its economy" |
  | Akin Gump 2025 | "calls for simplification", 2.2.3 |
  | Jones et al. 2016; Draghi 2024; Letta 2024; NextGenerationEU | đoạn đề xuất ở Giai đoạn 5 |

- **Kiểm link:** xem bảng ở mục 2b.

### Giai đoạn 3: số liệu và nhất quán

| Slide cũ | Mục | Đã làm | Nguồn |
|---|---|---|---|
| 53–55 | Table 3.7, A8 | **Số 2019** (2.240 dự án, 24,7 tỷ USD, 7,6%, 18/21 ngành, 54 tỉnh) không có trên trang FIA và không tìm thấy trong nguồn chính thức (báo cáo 9/2021 ghi 2.242 dự án, 22,24 tỷ USD). Đã bỏ gán nguồn FIA/MPI, ghi "as given in the authors' earlier draft (original source not confirmed)". Đã bỏ mục FIA khỏi References. | tìm kiếm |
| 55 | A8s | **Tỷ trọng FDI:** ghi rõ là vốn đăng ký; nói rõ ≈5,6% là số lệch mốc nên mức giảm có thể bị phóng đại. Bỏ câu "giảm vì nhà đầu tư châu Á tăng nhanh hơn" ở dạng khẳng định. "Rising" đổi thành "higher in 2024 than in 2022". **Chưa tính lại cùng mốc được** (không xác minh được tổng vốn FDI toàn quốc cuối 2022). | — |
| 46–47 | Table 3.4 + A7b | **Cùng một tiêu chí là số dòng thuế:** EU 85,6% → 99,2% sau 7 năm (2027); Việt Nam 48,5% → 91,8% sau 7 năm, phần còn lại đến 2030. Theo kim ngạch, ghi trong ngoặc: EU 70,3% → 99,7%; VN 64,5% → 97,1%. Tiêu đề, trục và chú thích biểu đồ đã sửa. | MOIT ([bài](https://moit.gov.vn/tin-tuc/70-nam-nganh-cong-thuong/hiep-dinh-evfta-va-ipa-viet-nam-va-eu-cam-ket-nhung-gi-.html)); số 91,8%/97,1% của Việt Nam lấy từ tóm tắt thứ cấp, còn TODO |
| 45 | Table 3.3 | Nhãn "Status (Oct 2026)" đổi thành "Status". Ô EVIPA ghi "20 of 27 … as of Nov 2025; France's ratification bill sent to Parliament on 27 Jul 2026". | VietnamPlus 28/11/2025; Sénat |
| 28, 41 | A4, B1 | **Timeline B1 (làn EVIPA):** mỗi mốc có nhãn sự kiện (Opinion 2/15, ký, EP, Council, VN phê chuẩn, EVFTA hiệu lực, DE trình Bundestag 7/2025, PL thứ 20 11/2025, FR trình dự luật 27/7/2026). **A4:** mốc chính có kèm mốc phụ (Mercosur "signed 17 January 2026"; Hàn Quốc, Anh, xem Giai đoạn 4). | như nội dung slide |
| 49–50 | Table 3.5, Fig 3.1 | **Năm 2019:** nhập khẩu của EU từ VN lấy thẳng từ Eurostat = **€34,4 tỷ** (trước là 34,5, suy ra). Tổng €45,6 tỷ (Upply). Xuất khẩu EU ≈11,2 và cán cân ≈−23,2 là số suy ra. % tính lại: **+86%, ≈+9%, +67%, ≈+123%**. Thêm dòng: tăng trưởng không chỉ do EVFTA (theo 3.4.1). | [Eurostat ASEAN-EU](https://ec.europa.eu/eurostat/statistics-explained/index.php/ASEAN-EU_-_international_trade_in_goods_statistics) |
| 51 | Table 3.6 | Ghi rõ cột 2019 (35,8/14,0) là số của bản nháp trước. Vietnam Briefing (trích Eurostat) cho 35,8 và 14,1, nên cột 2019 có thể không phải thống kê Việt Nam. | [Vietnam Briefing](https://www.vietnam-briefing.com/news/vietnam-eu-trade-surplus-underlines-growing-trade-relations.html/) |
| 52 | 3.2.1c | **C/O:** số 1,8 triệu bộ, >100 tỷ USD, +18%/+28% là của **mọi FTA năm 2024**, đúng với nguồn. Nhãn thẻ đổi thành "2024 · all of Vietnam's FTAs, not the EVFTA alone". | [Báo Đầu tư](https://baodautu.vn/hon-100-ty-usd-hang-xuat-khau-duoc-cap-co-uu-dai-d244235.html) |
| 24 | Table 2.3 | "Around 1.08–1.09": **chưa kiểm được** (không có số Eurostat ghi rõ năm và phạm vi). Để TODO, chưa đổi. | — |
| 56 | 3.2.2 | **Chỉ số giá trị gia tăng: chưa thêm.** Không tìm được số OECD TiVA/ADB đáng tin. Số "48% giá trị gia tăng nước ngoài (2020)" chỉ thấy trong một tài liệu vận động hành lang, không dùng. | — |
| 70 | Kết luận | "US$68 billion in 2024" → "about US$74 billion in 2025 (€76.0 billion in EU statistics)". Speaker notes sửa theo. | Table 3.5, 3.6 |

### Giai đoạn 4: Phần B (xem bảng 2)
- **Table 2.4 và timeline A4:**
  - Hàn Quốc: 1/7/2011 → 13/12/2015.
  - Anh: 1/1/2021 → 1/5/2021.
  - Thêm Singapore (21/11/2019).
- **Opinion 2/15:** ghi rõ "on the EU–Singapore FTA" (đoạn văn 3.1.3, sơ đồ, timeline).
- **CBAM:** mô tả lại theo quy định hiện hành (2.2.3b).
- **Mục tiêu 2040:** −90% ghi là đã thông qua 2026, sửa ở thẻ, biểu đồ A5 và ghi chú.
- **JETP:** ghi rõ cam kết ban đầu (12/2022) và việc Mỹ rút (3/2025), ở Table 3.1, Table 3.2 và timeline.
- **References:** thêm Toà án Công lý EU, MTI Singapore, EC (TCA), DEHSt, Hội đồng EU, CSIS, Sénat.

### Giai đoạn 5: nội dung đề xuất (ĐỀ XUẤT – cần nhóm duyệt)
Trên web, ba đoạn sau có nhãn vàng **"ĐỀ XUẤT – cần nhóm duyệt"**. Duyệt xong thì xoá `<span class="proposal">…</span>`.

1. **"Crises and reform"**, đặt cuối mục 2.1.1b. Mục đích: cho các ý "euro crisis, COVID-19, … the cost of its own regulation" trong Kết luận có chỗ dựa trong thân bài.
2. **"Prospects"**, cuối Chương 2, trước khung tóm tắt chương. Mục đích: chương đã hứa nói về "prospects".
3. **Khuyến nghị 8 về kỹ năng.** Lưới khuyến nghị giờ có 8 thẻ. Ma trận slide 69 có tiêu đề **"All five challenges are addressed"**, ô thách thức số 5 trỏ tới R8 (đề xuất) và R7.

**Phương án thay thế cho (1):** nếu không thêm đoạn này thì bỏ khỏi Kết luận (thẻ 1) cụm "by crises (the euro crisis, COVID-19)" và "the cost of its own regulation". Cụm "enlargement fatigue" cũng chưa có chỗ dựa: thêm một câu vào 2.1.2 hoặc bỏ khỏi Kết luận.

**Phương án thay thế cho (2):** bỏ chữ "prospects" khỏi mục tiêu Chương 2.

---

## 2. Kiểm chứng Phần B

| # | Mục | Kết quả | Nguồn |
|---|---|---|---|
| 1 | Hàn Quốc: áp dụng tạm thời 7/2011, hiệu lực 12/2015 | **Đã sửa.** Áp dụng tạm thời từ 1/7/2011, hiệu lực 13/12/2015. Một số tóm tắt của Nghị viện châu Âu ghi 1/10/2015: đó là ngày EU hoàn tất thủ tục kết thúc, không phải ngày hiệu lực. | [chronicle.lu](https://chronicle.lu/category/abroad/13478-final-entry-into-force-of-eu-south-korea-fta-could-see-trade-double-by-2030), [EP OEIL](https://oeil.europarl.europa.eu/oeil/en/document-summary?id=1413897) (chưa có trang EC trực tiếp: TODO) |
| 2 | Anh (TCA): tạm thời 1/1/2021, hiệu lực 1/5/2021 | **Đã sửa** | [European Commission](https://commission.europa.eu/strategy-and-policy/relations-united-kingdom/eu-uk-trade-and-cooperation-agreement_en) |
| 3 | Opinion 2/15 là về FTA EU–Singapore | **Đã sửa** (ý kiến ngày 16/5/2017) | [CJEU press release 52/17](https://curia.europa.eu/jcms/upload/docs/application/pdf/2017-05/cp170052en.pdf) |
| 4 | Singapore thiếu trong Table 2.4 / timeline | **Đã thêm**: hiệu lực 21/11/2019 | [MTI Singapore](https://www.mti.gov.sg/Newsroom/Press-Releases/2019/11/EUSFTA-Entry-Into-Force) |
| 5 | CBAM: mua/nộp chứng chỉ muộn hơn 2026 | **Đã sửa.** Áp dụng cho hàng nhập từ 2026; bán chứng chỉ từ 1/2/2027; nộp lần đầu trước 30/9/2027 (Quy định (EU) 2025/2083). | [DEHSt](https://www.dehst.de/EN/Topics/CBAM/CBAM-definitive-regime-2026/CBAM-certificates/cbam-certificates_node.html) |
| 6 | Mục tiêu 2040 (−90%) còn "proposed"? | **Đã sửa.** Đã thông qua: Hội đồng EU phê duyệt cuối cùng ngày 5/3/2026 (sửa Luật Khí hậu). | [Council of the EU](https://www.consilium.europa.eu/en/press/press-releases/2026/03/05/2040-climate-target-council-gives-final-green-light/) |
| 7 | JETP US$15,5 tỷ | **Đã sửa:** ghi "cam kết ban đầu (12/2022)", thêm việc Mỹ rút (6/3/2025). Số cam kết còn lại cho Việt Nam: **chưa kiểm được**. | [EEAS 2022](https://www.eeas.europa.eu/delegations/vietnam/international-agreement-support-viet-nams-ambitious-climate-and-energy-goals_en), [CSIS](https://www.csis.org/blogs/latest-southeast-asia/latest-southeast-asia-us-withdrawal-jetp) |
| 8a | Đối tác Chiến lược Toàn diện 29/1/2026 | **Giữ nguyên** (đúng) | [Viet Nam News, tuyên bố chung](https://vietnamnews.vn/politics-laws/1764824/joint-statement-on-upgrading-viet-nam-eu-ties-to-comprehensive-strategic-partnership.html) |
| 8b | Global Gateway > €560 triệu, 24/3/2026 | **Giữ nguyên** (đúng) | [EEAS](https://www.eeas.europa.eu/commissioner-sikela-business-forum-pr_en) |
| 8c | Mercosur ký 17/1/2026, tạm thời từ 1/5/2026 | **Giữ nguyên** (đúng) | [Houthoff](https://www.houthoff.com/actueel/nieuws/handelsovereenkomst-eu-mercosur-voorlopige-toepassing-vanaf-1-mei-2026/), [White & Case](https://www.whitecase.com/insight-alert/eu-provisionally-apply-eu-mercosur-interim-trade-agreement-pending-cjeu-opinion) (chưa có trang EC: TODO) |
| 8d | EU–Ấn Độ hoàn tất đàm phán 27/1/2026 | **Giữ nguyên** (đúng) | [Sullivan & Cromwell](https://www.sullcrom.com/insights/memo/2026/January/EU-Strikes-Major-Trade-Deals-Mercosur-India), [DLA Piper](https://www.dlapiper.com/en/insights/publications/2026/02/eu-and-india-free-trade-agreement) |
| 8e | Pháp trình dự luật EVIPA 27/7/2026 | **Giữ nguyên** (đúng); thêm nguồn chính thức | [Sénat, PJL n° 920](https://www.senat.fr/leg/pjl25-920.pdf) |
| 8f | Bulgaria dùng euro từ 1/1/2026 | **Giữ nguyên** (đúng theo trang EU "Countries using the euro" đã có trong References; không mở lại được trang) | [European Union (n.d.-a)](https://european-union.europa.eu/institutions-law-budget/euro/countries-using-euro_en) |
| 9 | Table 1.1: thêm mốc | **Chưa thêm** để giữ bảng khớp báo cáo. Đã kiểm: Ukraine thành ứng viên 23/6/2022 ([EEAS](https://www.eeas.europa.eu/delegations/australia/european-council-grants-eu-candidate-status-ukraine_en)); RRF/NextGenerationEU (Quy định (EU) 2021/241, 12/2/2021). **Chưa kiểm được bằng nguồn:** Schengen (1985/1995), Amsterdam (hiệu lực 1/5/1999), Nice (1/2/2003), khủng hoảng euro (từ 2010). Đề xuất nhóm thêm sau khi có nguồn. | |

### 2b. Kiểm link (References và dòng Source)
- **Hỏng hoặc redirect:** không kiểm được trực tiếp (proxy chặn mọi trang ngoài). Mọi URL mới đều xuất hiện trong kết quả tìm kiếm với đúng tiêu đề.
- **Trước đây trỏ trang chủ chung, nay đã bỏ link** (chờ URL cụ thể):
  - "Ministry of Industry and Trade / Vietnam Customs" (slide 39, 51);
  - Climate Policy Initiative, Italian Trade Agency, Trung tâm WTO 2026b (slide 68).
- **Vẫn là trang tổ chức** (dùng cho "materials" chung của Table 1.1, chấp nhận được, nhóm có thể thay):
  - European Parliament, European Council, European Central Bank;
  - EUR-Lex trang chủ ("Official EU legal texts", "official EU sources").
- **"EEAS" không ghi rõ trang:**
  - mặc định trỏ trang "The European Union and Vietnam" (trang chung về quan hệ, không phải bài cụ thể);
  - slide 39 trỏ thông cáo €560 triệu;
  - 2.2.2 trỏ trang Phái đoàn EU tại LHQ.
- **"Eurostat":** đã trỏ thẳng hai thông cáo (13/2/2026 và 26/3/2026). Thông cáo 26/3 nêu €128 tỷ, nhưng một trang Statistics Explained nêu €130 tỷ: nhóm xem lại.
- **VietnamPlus:** 4 bài cụ thể. Bài "Vietnam's trade surplus with EU expands…" được trích là (2025) nhưng có thể đăng năm 2026: TODO.
- **EuroCham:** đổi từ bài báo thứ cấp (trungtamwto.vn) sang trang BCI Q2/2025 của EuroCham. Con số 37% (định giá hải quan) có trong trang này. Việc trích "EuroCham" ở Table 3.2 có đúng bài này không thì chưa rõ: TODO.
- **Vietnam Briefing:** 2 bài cụ thể (n.d.-a, n.d.-b).
- **Access2Markets:** trang EVFTA cụ thể.
- **SAFE (Council, 27/5/2025):** URL đang nằm trên eeas.europa.eu (bản đăng lại của thông cáo Council). Không tìm được bản gốc trên consilium.europa.eu: TODO thay URL.

---

## 3. TODO(verify) còn lại (đánh dấu `<!-- TODO(verify) -->` trong `index.html`)

**Nguồn chưa xác định được**
1. Climate Policy Initiative (n.d.), Italian Trade Agency (2026), Trung tâm WTO và Hội nhập (2026b): chưa xác định được bài. Đang ở dạng ghi chú ẩn cuối References.

**Số liệu chưa có nguồn**
2. Số 2019 của Table 3.7 (2.240 dự án; 24,7 tỷ USD; 7,6%; 18/21 ngành; 54 tỉnh): cần nguồn gốc.
3. Cột 2019 của Table 3.6 (35,8 / 14,0): nguồn, và có phải thống kê Việt Nam không.
4. Xuất khẩu EU sang VN năm 2019 (EUR): hiện ≈11,2 là số suy ra.
5. Tỷ trọng FDI của EU cùng mốc: cần tổng vốn FDI toàn quốc và vốn EU cùng một ngày. Có số "2.836 dự án, 33,3 tỷ USD, khoảng 6%" (Bộ Tài chính) nhưng không rõ ngày chốt.
6. Table 2.3 "Around 1.08–1.09": năm, phạm vi, nguồn.
7. Chỉ số giá trị gia tăng cho slide 56 (OECD TiVA hoặc ADB MRIO).
8. Việt Nam 91,8% dòng thuế / 97,1% kim ngạch sau 7 năm: đối chiếu với văn bản MOIT.

**Trạng thái cần cập nhật**
9. Số nước đã phê chuẩn EVIPA sau 11/2025 (tình trạng của Đức mâu thuẫn).
10. Cam kết JETP còn lại cho Việt Nam sau khi Mỹ rút.

**Link cần thay**
11. URL gốc của thông cáo SAFE trên consilium.europa.eu; trang EC cho FTA EU–Hàn Quốc và cho Mercosur.
12. Năm đăng của "VietnamPlus (2025)" (bài thương mại) và "Vietnam Investment Review (2025)": có thể là 2026.
13. Tác giả của bài East Asia Forum (2026).

---

## 4. Cần sửa song song trong báo cáo Word
1. **Table 2.4:**
   - Hàn Quốc: "Provisionally applied from 1 July 2011; in force since 13 December 2015".
   - Anh: "Provisionally applied from 1 January 2021; in force since 1 May 2021".
   - Thêm hàng Singapore: "In force since 21 November 2019".
   - Đoạn văn 2.2.1 đã có Singapore (2019); nên ghi đủ ngày.
2. **3.1.3:** "Opinion 2/15 (on the EU–Singapore FTA)".
3. **2.2.3 (CBAM):** "…importers pay for the emissions embedded in goods imported from 2026 by buying and surrendering CBAM certificates; sales start on 1 February 2027 and the first surrender is due by 30 September 2027."
4. **2.2.3 (mục tiêu 2040):** "a 90% net reduction target for 2040, adopted in March 2026 as an amendment to the European Climate Law" thay cho "proposed by the Commission".
5. **JETP (3.1.1, Table 3.1; 3.3.2):** "an initial US$15.5 billion pledge (December 2022); the United States withdrew in March 2025".
6. **Table 3.3:** dòng Status ghi mốc "as of Nov 2025" và ngày 27/7/2026 của Pháp.
7. **Table 3.4:** dùng số dòng thuế cho cả hai bên (EU 85,6% → 99,2%; VN 48,5% → 91,8%, phần còn lại đến 2030), kim ngạch trong ngoặc.
8. **Table 3.5:**
   - 2019 nhập khẩu 34,4 (Eurostat), xuất khẩu ≈11,2, cán cân ≈−23,2;
   - % thay đổi: +86%, ≈+9%, +67%, ≈+123%;
   - sửa ghi chú *2019.
9. **Table 3.6:** ghi chú nguồn cột 2019. **Table 3.7:** bỏ "FIA/MPI" cho số 2019 nếu không có nguồn gốc.
10. **FDI:** câu "the share fell because Asian investors grew faster" → "the share appears lower, but the estimate mixes dates".
11. **Kết luận:** "from about US$49.8 billion in 2019 to about US$74 billion in 2025 (€76.0 billion in EU statistics)".
12. **References:** thêm các mục mới (xem danh sách trên web). Đánh lại Trung tâm WTO 2026a/2026b. Bỏ marker kiểu "[2]".
13. **Đoạn văn đề xuất** (nếu nhóm duyệt), sẵn để dán:

> **Crises and reform.** The euro-area debt crisis after 2010 exposed the gap between a common currency and national fiscal policies; the Union answered with new rescue and banking rules, a pattern Jones, Kelemen and Meunier (2016) call "failing forward". After COVID-19 it went further and borrowed jointly to finance NextGenerationEU (European Commission, n.d.-h). In 2024 the Letta and Draghi reports warned that a fragmented single market, slow innovation and the weight of regulation hold back European competitiveness (Letta, 2024; Draghi, 2024).

> **Prospects.** The EU's regional and global role will depend on whether it completes the single market and closes its competitiveness gap (Draghi, 2024; Letta, 2024), on how far its trade network widens (Mercosur and India, Table 2.4) while instruments such as CBAM raise the cost of carbon for its partners, and on whether it can match its regulatory weight with more united external action.

> **Recommendation 8. Build skills for green and digital jobs.** Vietnam should expand vocational and university programmes in green and digital fields together with EU partners, make fuller use of EU cooperation on education and skills (Table 3.10, "Education and skills"), and link training to the needs of EU-invested firms and their local suppliers. Better skills would address the shortage of skilled labour and innovation capacity identified in Section 3.4.2 and help more of the value created by EVFTA trade stay in Vietnam (European External Action Service, 2023).

---

## 5. References đề xuất bỏ (nhóm duyệt, chưa xoá)
Đây là các mục không có nội dung tương ứng trên slide hay trong báo cáo:
- **Brussels Times (2026)**, "EU GDP hits €18.8 trillion…": cả báo cáo lẫn web không dùng số GDP này.
- **European Commission Joint Research Centre (2025), EDGAR**: không có số phát thải nào được trích.
- **Council of the European Union (n.d.-b), EU sanctions against Russia** và **(n.d.-c), EU trade policy**: chưa thấy trích trực tiếp. Có thể giữ cho đoạn trừng phạt Nga (2.1.2) và 2.2.1 nếu nhóm thêm trích dẫn.
- **Council of the European Union (n.d.-a), Defence and security** và **(2025, May 27), SAFE**: chưa được trích, nhưng hợp với thẻ "A growing security dimension" (2.1.2, "ReArm Europe / Readiness 2030"). Nên **giữ và trích** ở đó.
- **Finnish Government (2025)**, ODA giảm 2024: chỉ hợp với thẻ "≈40% ODA" (2.2.2). Nên **giữ và trích** ở đó thay vì bỏ.

Các mục Balassa, Börzel & Risse, Bull, Damro, Hettne & Söderbaum, Lavenex, Manners, Meunier & Nicolaïdis, Schimmelfennig & Sedelmeier, Akin Gump, EU–Japan (n.d.-j), Draghi, Letta, Jones et al. và NextGenerationEU nay đã được trích (dạng đề xuất), nên không cần bỏ.
