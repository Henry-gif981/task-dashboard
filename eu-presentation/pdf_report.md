# Báo cáo xuất PDF

Xuất lại: `node scripts/export_pdf.mjs && python3 scripts/check_pdf.py` (chạy trong `eu-presentation/`, chi tiết ở `scripts/README.md`).

## Kết quả

| File | Khổ trang | Số trang | Dung lượng |
|---|---|---|---|
| `pdf/EU_presentation.pdf` | 16:9, 1920 × 1080 px (1440 × 810 pt) | 62 | 5,2 MB |
| `pdf/EU_presentation_A4.pdf` | A4 dọc, lề 15 mm | 57 | 3,0 MB |

Cả hai bản dưới 15 MB nên không cần nén thêm.

- **Offline:** 0 request mạng; mọi request http(s) bị chặn trong lúc xuất. Không có lỗi JavaScript.
- **Chân trang:** có trên mọi trang, gồm dòng "Student presentation by Group 4, National Economics University. Not an official publication of the European Union." và số trang "n / tổng". Trang bìa không hiện số trang.
- **PDF có tag:** Tagged: yes. Mỗi bản có 120 bookmark, sinh từ các tiêu đề.
- **Link:**
  - 29 URL khác nhau ở References, bấm được. Một URL bị ngắt dòng sẽ thành nhiều vùng bấm: 56 vùng ở bản 16:9 và 44 vùng ở bản A4.
  - 36 link nội bộ. Script đã thử từng link của mục lục: 35/35 link dẫn tới đúng trang có tiêu đề mục tương ứng.
- **Font:** tất cả đều được nhúng (kiểm tra bằng `pdffonts`).
  - Inter và Source Serif 4 lấy từ `fonts/`.
  - DejaVu Sans dùng cho dòng chân trang.
  - Liberation Sans/Serif là font thay thế cho ba ký hiệu không có trong bộ font đã cắt sẵn (→ U+2192, ≈ U+2248, ≤ U+2264).
- **Tiếng Việt có dấu:** tên thành viên, tên giảng viên và tiêu đề tiếng Việt trong References đều tìm thấy đúng trong chữ rút từ PDF.

## Đối chiếu nội dung (`scripts/check_pdf.py`)

Phép đối chiếu như sau:
- Dùng chữ trên màn hình của `index.html` (1319 dòng, các ô của bảng tách riêng), lưu ở `pdf/reference_text.json`.
- So với chữ rút bằng `pdftotext` từ từng bản PDF.
- Bỏ qua khoảng trắng, chữ hoa/thường (vì chữ in hoa nhỏ) và dấu gạch nối, vì `pdftotext` nối lại các từ bị ngắt dòng, ví dụ "non-" + "member" thành "nonmember".

| | 16:9 | A4 |
|---|---|---|
| Dòng chữ của trang bị thiếu | 0 | 0 |
| Mục References có trong PDF | 42/42 | 42/42 |
| Chữ thừa (không có trên trang, ngoài chân trang và số trang) | 0 | 1 (xem dưới) |

- **Cố ý không in (chỉ dùng khi trình chiếu):** thanh điều hướng ("NEU · Group 4", "Contents and Introduction"), bộ đếm "01 / 46", chữ "SCROLL", các nút "Contents" và "View data". Bảng "View data" vốn ẩn cũng không in; số liệu trong đó đã có sẵn trên hình và trong các bảng của trang.
- **Dòng "thừa" duy nhất ở bản A4** ("May 201730 Jun 2019 Aug 2026") không phải chữ mới. Đó là ba nhãn ngày nằm sát nhau trong hình timeline hai làn (mục 3.1.1), bị `pdftotext` đọc dính vào nhau.
- **Một số dòng chỉ bị đọc theo thứ tự khác** (cột đôi, nhãn biểu đồ): 18 dòng ở bản 16:9 và 4 ở bản A4. Mọi từ trong các dòng này đều có trên trang.

Các kiểm tra cũ của trang web vẫn đạt sau khi thêm CSS in:
- `tools/compare_text.js --without-visuals`: 750/750 dòng giống bản sao lưu.
- `tools/check_viz.js`: không có số lạ.
- `tools/check_contrast.js`: 0 lỗi.

## Kiểm tra hình ảnh

Mọi trang đã được render bằng `pdftoppm` và xem lại; ảnh ghép các trang nằm ở `screenshots/pdf/`. Script cũng đo phần có nội dung trên từng trang:
- **Bản 16:9:** trang 49 (mục 3.3) là một slide vốn chỉ có tiêu đề và một đoạn dẫn.
- **Bản A4:** trang 11 chỉ đầy một nửa vì hình timeline mục 1.2.1 được dồn trọn sang trang sau, không bị cắt.

Không còn trang chỉ có 1–2 dòng, chữ bị cắt hay chồng chữ, và chân trang không đè lên nội dung.

## Các lỗi đã sửa trong quá trình xuất

1. **Bản 16:9 bị áp bố cục điện thoại** (mục lục chỉ có 1 cột, 91 trang). Khi dùng `preferCSSPageSize`, Chromium tính media query theo khổ giấy mặc định (khoảng 816 px). Đã chuyển sang truyền kích thước trang trực tiếp (`width`/`height`).
2. **Bản A4 bị ra khổ ngang.** `@page size: 1920px 1080px` của bản 16:9 làm Chromium xoay giấy. Script A4 nay thêm `@page { size: A4 portrait }`.
3. **Ghép trang bìa làm hỏng trang 1.** Bước ghép bản bìa không số trang ghi `/Contents` thành stream trực tiếp. Đã sửa để giữ tham chiếu gián tiếp.
4. **Trang gần trống do section tràn một chút.** Script đo chiều cao từng section ở chế độ in. Nếu một section chỉ tràn một ít, script thu nhỏ nó bằng CSS zoom (không dưới 0,72), vẽ lại biểu đồ ở độ rộng mới rồi đo lại. Các section đã thu nhỏ:
   - 1.1.1: ×0,86; 1.2.3: ×0,97; 2.1.3: ×0,94
   - 2.2.1a: ×0,84; 2.2.2: ×0,83; 2.3.1: ×0,80; 2.4.1: ×0,74
   - 3.1.2a: ×0,97; 3.3.2a: ×0,93; 3.3.2b: ×0,76
5. **Nhãn mục (1.1.2, 2.1.3…) bị bỏ lại cuối trang.** Nhãn là `inline-block` nên `break-after: avoid` không có tác dụng. Khi in, nhãn chuyển thành `display: table`. Ngoài ra, tiêu đề, chú thích hình và mục danh sách không còn bị cắt ngang trang.
6. **Hộp nền xanh đậm** (callout, thẻ nổi bật) chuyển sang nền xanh rất nhạt, viền trái xanh EU, chữ tối.
7. **Bookmark bị mất dấu cách khi tiêu đề xuống dòng** ("understandingof"). Bước hậu xử lý thay tiêu đề bookmark bằng đúng chữ của tiêu đề trên trang.

## Những chỗ không thể làm hoàn hảo

- **Nền 3D (Three.js)** không in được ổn định nên bị ẩn khi in. Trang bìa và các trang mở chương dùng nền xanh rất nhạt kèm vòng 12 ngôi sao SVG tĩnh. Hình cầu thang 3D ở mục 1.1.2 được in bằng bản SVG 2D tương đương.
- **Mười section của bản 16:9 bị thu nhỏ** (danh sách ở mục 4 phía trên), nên chữ trong các slide đó nhỏ hơn các slide khác. Các section dài hơn (từ khoảng 1,4 trang trở lên) được để chảy qua 2–3 trang, nên trang cuối của chúng có thể còn nhiều khoảng trống.
- **Timeline cuộn ngang ở mục 1.2.1** khi in được xếp thành nhiều hàng. Thẻ chi tiết in mốc đầu tiên (1950); toàn bộ mốc kèm ý nghĩa đã có trong Table 1 ngay phía trên.
- **Chân trang dùng DejaVu Sans,** vì phần header/footer của Chromium không dùng được web font của trang.
- **Bố cục bookmark theo tiêu đề:** tiêu đề bìa (h1) là mục cấp trên cùng, các mục còn lại nằm bên dưới nó.
- **CSS `@page` 1920 × 1080 nằm trong `index.html`.** Nếu in thẳng từ trình duyệt (Ctrl+P) thì cũng ra khổ 16:9. Bản A4 nên xuất bằng script.
