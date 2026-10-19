# v4: giao diện "khắc đồng / toile" (một màu cobalt, Times New Roman)

Trang web được thiết kế lại theo ảnh mẫu, rồi xuất ra PDF trình chiếu 73 trang. Nội dung, số liệu, thứ tự và cấu trúc chương giữ nguyên; chỉ đổi giao diện, bố cục, font, cách hiển thị nguồn và References.

| Tệp | Là gì |
|---|---|
| `EU_presentation_v4.html` | Trang web hoàn chỉnh, một tệp, chạy offline (font và hình vẽ nằm trong tệp). Chế độ trình chiếu: phím **P**, rồi ←/→ (các phím khác: `?`). |
| `EU_presentation_v4_slides.pdf` | PDF 16:9, đúng 73 trang, đánh số "n / 73", link bấm được (link ngoài và link nội bộ: thanh trên cùng, mục lục, [n] → References), bookmark từng mục. |
| `SOURCE_CHECK.md` | Phụ lục "Source check": slide, số liệu, nguồn, URL, trạng thái. Trên web là slide ẩn: mở `EU_presentation_v4.html#source-check`. |
| `build_v4.py` | Dựng trang v4 từ `../index.html` (bản v3b) + `src/theme.css` + `src/enhance.js` + `src/source_urls.json` + `art/*.svg`. |
| `export_v4.mjs` | Xuất PDF 73 trang (Playwright, offline). |
| `art/gen_art.py` | Sinh các hình khắc đồng (SVG, vẽ theo thủ tục, hình gốc). |

Chạy lại: `python3 v4/art/gen_art.py && python3 v4/build_v4.py && node v4/export_v4.mjs` (từ thư mục `eu-presentation/`).

## Thiết kế
- **Màu:** một màu mực #2B35D6 trên nền ngà #FBF8F1. Màu phụ duy nhất là xanh nhạt khoảng 6–12% cho ô/hàng bảng. Không còn vàng/navy, không bóng đổ, không gradient, bo góc tối đa 2px, đường kẻ 1px.
- **Biểu đồ:** đơn sắc. Chuỗi thứ hai gạch chéo, chuỗi thứ ba chấm, đường nét đứt. Vân gạch được vẽ bằng nét vector thật nên PDF vẫn là vector.
- **Font:** "Times New Roman" cho mọi chữ. Máy dựng không có Times New Roman, nên trang nhúng Liberation Serif (cùng số đo từng ký tự với Times New Roman, giấy phép OFL) dưới tên "Times New Roman". Máy nào có Times New Roman thật thì trình duyệt dùng font thật (`local()` được ưu tiên). PDF hiện tại vì vậy chứa Liberation Serif. Muốn PDF chứa đúng Times New Roman: chạy `export_v4.mjs` trên máy có cài font đó. Dấu tiếng Việt hiển thị đúng.
- **Minh hoạ khắc đồng (SVG gốc):**
  - Bìa: đền cột Hy Lạp, vòng 12 sao, cành ô liu, tàu container, cần cẩu, sen, tre.
  - Chương I: đền, cột, ô liu, bản đồ cổ có hoa gió, cuộn hiệp ước.
  - Chương II: tàu hàng, container, cần cẩu, tua-bin gió, quả địa cầu có đường bay, cân công lý.
  - Chương III: ruộng bậc thang, nón lá, thuyền buồm và tàu container, pin mặt trời, tre, sen.
  - Ngoài ra có hình nhỏ ở góc các slide nội dung, và con dấu "G4" ở giữa thanh điều hướng.
- **Slide bìa và mở chương:** tiêu đề chữ hoa căn giữa trong khung minh hoạ, nhãn "CHAPTER I/II/III", mũi tên ↓.
- **Slide chuyển chương (14, 37) và slide cảm ơn (73):** nền xanh đặc, mép trên lượn sóng, tên chương / "THANK YOU" chữ trắng lớn ở góc dưới trái.
- **Thanh trên cùng:** Contents · Chapter 1 · Chapter 2 · Chapter 3 · References; con dấu G4 ở giữa; "n / 73" ở góc phải (trên web, số này theo vị trí đang đọc).

## Các slide đã sửa
- **Bảng bị cắt đôi** (cũ: 24–25, 27–28, 34–35, 53–54, 57–58, 60–61, 63–64): mỗi bảng giờ nằm trọn trên một slide.
  - Bảng 2.3 → slide 24; Bảng 2.4 → 28; Bảng 2.6 → 35; Bảng 3.7 → 54; Bảng 3.8 → 58; Bảng 3.9 → 61; Bảng 3.11 → 64.
  - Dòng "Source:" luôn đi cùng bảng của nó.
  - Slide nối tiếp ghi "(cont.)" thay cho "(TIẾP)".
- **Khối trống:** không còn khối rỗng nào.
  - Slide 6: sơ đồ bậc thang vẽ bằng SVG (bản cũ là 3D không in được).
  - Slide 9–10: đủ các mốc, 2009/2013/2016/2020 nằm ở slide 10 kèm nội dung.
  - Slide 16: bỏ khung trống.
  - Slide 40–41: các mốc 29 Jan 2026, 24 Mar 2026, 1 Aug 2026 hiển thị đầy đủ ở đầu slide 41.
- **Lỗi kiểu "3,,442", "−−226..4", "GlobalTrade", "Court of Justice ofthe":** không có trong văn bản gốc. Chúng xuất hiện khi chép chữ từ PDF cũ, vì nhãn biểu đồ có viền trắng nên bị in hai lần. Đã bỏ viền đó và kiểm tra chữ trích từ PDF mới: không còn các lỗi này.
- **References (slide 71–72):**
  - 33 mục xếp ABC, đánh số [1]–[33], thụt lề treo.
  - URL nằm dòng riêng, chữ nhỏ hơn, chỉ xuống dòng sau "/" hoặc "-".
  - "%E2%82%AC" hiển thị thành "€" (link giữ URL gốc).
  - Hai cột, chia đều trên hai slide.

## Link nguồn
- **84 lần nêu nguồn** trong các dòng "Source:", ghi chú bảng và thẻ số liệu. **76 đã có link**:
  - nguồn có trong References: hiện link và [n] trỏ tới mục References;
  - nguồn tìm được qua tìm kiếm: hiện link kèm URL rút gọn ↗.
- **Còn thiếu link ("[link: cần bổ sung]")**:
  - Ministry of Industry and Trade / Vietnam Customs (slide 39, 51)
  - "European Commission" của Bảng 2.1 (slide 17)
  - Vietnamese Government implementation plan (slide 58)
  - "EU–Vietnam cooperation documents and the EVFTA sustainable development framework" (slide 61)
  - Climate Policy Initiative (n.d.), Italian Trade Agency (2026) và Trung tâm WTO và Hội nhập (2026c) (slide 68)
- Các nguồn ngoài References chỉ kiểm qua kết quả tìm kiếm, vì môi trường dựng không mở được trang. Trạng thái từng link nằm trong `SOURCE_CHECK.md`. Nên mở thử từng link một lần trước khi thuyết trình.
- **Điểm lệch giữa slide và nguồn, nhóm nên xem lại (nội dung không bị sửa):**
  - EuroCham: con số 61% là của các doanh nghiệp được khảo sát nói chung, không riêng SME. Con số 8,7% không tìm thấy.
  - "≈2.450 dự án" không tìm được trang EEAS; con số này có trong tin về EuroCham.
  - Không tìm thấy thứ hạng EU (thị trường xuất khẩu thứ 3, nguồn nhập khẩu thứ 4) trong bài Viet Nam News 6/2026.
  - Bốn nguồn luật/Bundesbank không đề cập EU–Indonesia CEPA.
  - Bài Vietnam Investment Review và bài VietnamPlus về thương mại được ghi "(2025)" nhưng có vẻ đăng năm 2026.

## Giới hạn
- Để giữ đúng 73 slide mà mỗi bảng vẫn trọn một trang, nhiều slide phải thu nhỏ: 0,69–0,89 lần.
  - Ví dụ: slide 18–19, 27–35, 40–58.
  - Ở các slide đó, chữ nội dung khoảng 12,5–16pt, thấp hơn mức 16pt mong muốn.
  - Muốn đủ 16pt ở mọi slide thì cần thêm slide.
- Hình minh hoạ được vẽ bằng thủ tục, theo tinh thần toile. Độ dày chi tiết chưa bằng tranh khắc tay trong ảnh mẫu.
