# Báo cáo dựng trang — "Kế toán dự án đầu tư xây dựng" (Nhóm 2)

Nguồn duy nhất: `source/KT_T4_KeToanDuAnDauTu.pdf` (42 trang).

## 1. Sản phẩm

| Tệp | Mô tả |
|---|---|
| `index.html` | Trang trình bày một trang cuộn, 54 trang chiếu. Mở bằng nhấp đúp, chạy ngoại tuyến. |
| `assets/` | `style.css`, `app.js`, `viz_data.js` (sinh từ `viz_data.json`), `logo-neu.png` (cắt từ trang 1 PDF, nền trong suốt), `scans/hinh-2-01…15.jpg` (15 ảnh chứng từ) |
| `fonts/` | Source Serif 4, Be Vietnam Pro, IBM Plex Mono (woff2, bộ ký tự vietnamese / latin-ext / latin; giấy phép OFL trong `LICENSE-OFL.txt`) |
| `viz_data.json` | Toàn bộ số liệu biểu đồ, số ghi đúng dạng in trong bài, có trường `src` |
| `dist/KeToanDuAn_standalone.html` | Một tệp duy nhất (phông, CSS, JS, ảnh nhúng base64), 2,0 MB |
| `added_content.md` | Danh sách chữ thêm vào |
| `content_flags.md` | 4 lỗi đã sửa, 16 điểm nghi vấn giữ nguyên, kiểm tra tổng và chênh lệch làm tròn |
| `src/`, `tools/` | Mã nguồn từng phần và công cụ dựng/kiểm tra (`python3 tools/build.py` dựng lại `index.html` và bản standalone) |

## 2. Cấu trúc

Thanh điều hướng cố định bên trái (thành ngăn kéo "Mục lục" khi màn hình ≤ 1200 px), thanh tiến độ ở mép trên.

| Phần | Trang chiếu |
|---|---|
| 0. Bìa | Logo NEU, tên trường, môn, chủ đề, nhóm, sinh viên, năm (đọc từ `window.COVER`; dòng Giảng viên trống nên ẩn) |
| 1. Mục lục, Phần mở đầu | Mục lục 3 cấp (chương → 1.1, 2.1…), Danh mục từ viết tắt (trống), 3 đầu mục Phần mở đầu |
| 2. Chương 1 | 1.1 (Bảng 1.1, 1.2, Hình 1.1), 1.1.4, 1.2 (Bảng 1.3 + dòng thời gian), 1.2.2, 1.2.3, 1.2.4 (Hình 1.2 + khung lưu ý hiệu lực), 1.3 (Bảng 1.4), Hình 1.3, Bảng 1.5 + tài khoản chữ T, Hình 1.4, 1.3.3, Tóm tắt chương |
| 3. Chương 2 | 2.1 (Bảng 2.1), 2.1.2, số liệu tổng quát, Bảng 2.2 + biểu đồ, 2.2 (Bảng 2.3), nhận xét + Hình 2.1–2.5, Bảng 2.4, 2.3 (Bảng 2.5), biểu đồ thác nước, Bảng 2.6 + Hình 2.6–2.9, 2.4 (Bảng 2.7 + Hình 2.10–2.12), Bảng 2.8, 2.9, 2.10, F03D/F03C + Hình 2.13–2.14, 2.5 (Bảng 2.11 + Hình 2.15/2.16, 2.17), các tình huống + Bảng 2.12, Tóm tắt chương (giữ vị trí trước 2.6 như bài), 2.6.1–2.6.3 (Bảng 2.6.1–2.6.3) |
| 4. Chương 3, Kết luận, Phụ lục, TLTK | 3.1 (Bảng 3.1), 3.2 (Bảng 3.2), 3.3, Kết luận, Phụ lục (3 dòng), Tài liệu tham khảo [1]–[6] |

Đủ 22 bảng của bài (1.1–1.5; 2.1–2.12; 2.6.1–2.6.3; 3.1–3.2) dưới dạng `<table>` thật, có `th scope`. Đoạn văn dài nằm trong "Xem chi tiết" (`<details>`), tự mở khi in. Toàn bộ chữ nằm trong DOM.

**Chế độ trình chiếu:** nút "Trình chiếu" ẩn thanh điều hướng; ← → / PageUp PageDown chuyển trang chiếu (trang dài thì cuộn trong trang trước), F toàn màn hình, Esc thoát.

## 3. Hình vẽ lại và biểu đồ (SVG/HTML tự viết, không dùng thư viện, không CDN)

| Hình | Dạng | Số liệu / nguồn |
|---|---|---|
| Hình 1.1 | 3 nút giai đoạn (tab) → hai cột "Công việc quản lý dự án" / "Nhiệm vụ của kế toán dự án" | Chữ chép từ Hình 1.1 |
| Hình 1.2 | Cây A/B/C bấm mở từng nhánh + khung vàng "Lưu ý về hiệu lực pháp lý" | Hình 1.2; lưu ý lấy từ mục 1.2.4 |
| Hình 1.3 | Hai cột song song 5 bước, nút "Bước tiếp" | Hình 1.3 |
| Bảng 1.5 | Tài khoản chữ T cho 4 nghiệp vụ, BQLDA và DN cạnh nhau | `taccounts` ← Bảng 1.5 (triệu đồng) |
| Hình 1.4 | Cột nhóm (quý 20/20/45; năm 30/90/30 ngày), cột "trường hợp riêng" gạch chéo + ghi chú (*) | `h14` ← Hình 1.4 |
| Dòng thời gian | Trục năm tỉ lệ + 4 thẻ văn bản: 15/11/2012, 01/01/2013, 22/12/2014, 01/01/2015, 14/11/2019, 27/10/2025, 01/01/2026 | `timeline` ← mục 1.2.1–1.2.4, Bảng 1.3, TLTK [3]–[6] |
| Bảng 2.2 | Thanh chồng 100% (tài sản / nguồn vốn của hai đơn vị), rê chuột xem số tuyệt đối | `b22` ← Bảng 2.2 |
| B02-CĐT | Thác nước 129,450 → +63,850 → −4,582 → 188,717 tỷ đồng | `wf_b02` ← Bảng 2.5, 2.6 |
| Dòng tiền Hòa Phát | Thác nước 12,252; +6,608; (29,788); +17,815; 6,888 nghìn tỷ đồng; ghi chú tăng giảm thuần (5,365) | `wf_cash` ← Bảng 2.5 |
| F02-CĐT | Thanh chia đôi 102,590 (54,4%) / 86,127 (45,6%) | `f02` ← Bảng 2.5, 2.6 |
| Bảng 2.8 | Thanh ngang số dư cuối năm theo nội dung chi phí, % in sẵn; tổng 186,743 | `b28` ← Bảng 2.8 |
| Bảng 2.9 | Thanh ngang theo công trình, hạng mục (hạng mục 7 "-", đã bàn giao) | `b29` ← Bảng 2.9 |
| Bảng 2.10 | Thanh đôi 11 khoản năm 2015 / 2014 + ô "tăng 6,8%" và "47,4%" | `b210` ← Bảng 2.10, lời văn mục 2.4 |
| Bảng 2.12 | 3 thẻ tình huống + dòng thận trọng | Bảng 2.12 và đoạn văn ngay sau |
| Mục 2.6.1 | Thanh tiến độ 61,3% | Bảng 2.6.1 |
| Mục 2.6.2 | Hai thẻ luồng thuế GTGT (2,34 tỷ đồng; 6.636 tỷ đồng) | Bảng 2.6.2 |
| Mục 2.6.3 | Thanh thời hạn: BQLDA 20/01/2016 (hạn 30 ngày), Hòa Phát 24/03/2025 (83 ngày, hạn 90) | `deadline` ← Bảng 2.6.3 |
| Bảng so sánh (11 bảng) | 1.4, 2.3, 2.4, 2.5, 2.7, 2.11, 2.6.1, 2.6.2, 2.6.3, 3.1, 3.2: công tắc "So sánh / Chỉ xem …" và bộ lọc "Tiêu chí" | Nguyên văn bảng |

Quy tắc biểu đồ: không 3D, không biểu đồ tròn, trục bắt đầu từ 0, nhãn số đặt trực tiếp, mỗi biểu đồ có tiêu đề, đơn vị, nguồn "(Bảng x.x)" và mô tả ẩn cho trình đọc màn hình. Số hiển thị là chuỗi gốc trong `viz_data.json`; trang chỉ đọc chuỗi ra số (`"188,717"` → 188,717; `"2.146,45"` → 2146,45) để tính chiều dài cột, không in ra số tính thêm.

**Chứng từ gốc:** 15 ảnh (Hình 2.1–2.15) trong các bộ ảnh, mở to bằng hộp xem ảnh (Esc đóng, trả tiêu điểm về ô ảnh). Hình 2.15/2.16 hiện một ảnh với hai chú thích; Hình 2.17 mở lại ảnh Hình 2.3, kèm ghi chú "xuất hiện hai lần trong bài".

## 4. Thiết kế

Giấy sổ kế toán (#FAF8F3) với dòng kẻ ngang mờ và lề đỏ; BQLDA xanh navy #1F4E79, doanh nghiệp cam #C55A11 (chữ cam đậm #A94A0B, nền tiêu đề cột #A94A0B để đạt AA), nhánh B xanh lá dịu. Tiêu đề Source Serif 4, chữ giao diện Be Vietnam Pro, số và tài khoản IBM Plex Mono; số trong bảng căn phải, `tabular-nums`, dòng tổng gạch chân đôi; bút toán viết "Nợ TK 241 / Có TK 336" với nhãn tài khoản dạng chip. Nền tối bật bằng nút "Nền tối" (mặc định nền sáng). Chuyển động nhẹ (hiện dần, cột mọc, số chạy) và tắt hết khi hệ thống bật `prefers-reduced-motion`.

## 5. Kiểm tra đã chạy

| Kiểm tra | Công cụ | Kết quả |
|---|---|---|
| (a) Chữ PDF → trang | `tools/dump_text.js` + `tools/check_text.py` (cửa sổ 5 từ, kể cả "Xem chi tiết" đang đóng) | 12.647/12.683 từ (99,72%) khớp nguyên văn trong cụm 5 từ. 11 cụm còn lại: 7 cụm do PDF trộn cột bảng khi trích chữ (từng cụm 3 từ vẫn có trên trang), 3 cụm cùng nguyên nhân ở Bảng 1.3, 1.5, 2.1, và 1 cụm là chỗ sửa "03B-CĐT" → "F03B-CĐT". Không thiếu đoạn nào; đủ 22 bảng và 2 phần tóm tắt chương (tóm tắt Chương 1 và 2). |
| (a') Trang → PDF | Chữ không gắn `data-added` so với PDF | Chỉ lệch ở chữ chép từ Hình 1.1–1.3 (ảnh trong PDF nên không có lớp chữ), ô bảng bị trộn cột khi trích, và chỗ bỏ "[cite: 13, 81]". |
| (b) Số liệu | `tools/check_numbers.py` | 339/339 con số khác nhau trong PDF (không tính số trang mục lục) đều có trên trang đúng dạng gốc. Mọi số trong `viz_data.json` có trong PDF (trừ 120 là mốc trục Hình 1.4). Tổng in sẵn đã kiểm, chênh lệch ghi ở `content_flags.md` mục C (đều 0,001). |
| (c) Ảnh chụp | `tools/shoot.js` ở 1920×1080, 1366×768, 390×844, xem lại từng trang | Không cuộn ngang ở cả 3 cỡ (hOverflow = 0); 10 kiểu phông đều tải. Đã sửa: dòng thời gian chồng nhãn → làm lại thành trục + 4 thẻ; biểu đồ Bảng 2.2 chật → tách trang chiếu riêng; nhãn chồng nhau trên điện thoại ở Hình 1.4, Bảng 2.2, thác nước dòng tiền, F02, Bảng 2.8, 2.9, 2.10, thanh thời hạn → thêm cách bố trí cho màn hẹp; tiêu đề "Mục lục" lặp; vị trí số 61,3%; dòng "Giảng viên" trống vẫn hiện. |
| (c') Tương tác | `tools/interact.js` | Tab Hình 1.1, 3 nhánh Hình 1.2, Bước tiếp/trước/Hiện tất cả, 4 tab tài khoản chữ T, 11 bảng so sánh (3 chế độ cột + lọc tiêu chí), 16/16 ô ảnh mở và đóng bằng Esc, phím ← → PageUp PageDown, thanh tiến độ, Trình chiếu + Esc, Nền tối, sự kiện in mở hết "Xem chi tiết": đều chạy. Console: 0 lỗi, 0 cảnh báo. Chặn mạng: 0 yêu cầu ra ngoài (cả `index.html` lẫn bản standalone). |
| Tương phản | `tools/check_contrast.js` | 1.017 phần tử chữ, nền sáng và nền tối: 0 phần tử dưới mức AA (sau khi làm đậm nền tiêu đề cột cam và nút đang chọn). |
| Truy cập | trong `interact.js` | 0 ảnh thiếu `alt`, 0 `th` thiếu `scope`; 61 điểm dữ liệu biểu đồ nhận tiêu điểm bàn phím, có `aria-label`. |
| In | Playwright `emulateMedia('print')` → PDF A4 | 65 trang: nền trắng, không thanh điều hướng, mỗi phần sang trang mới, bảng không bị cắt ngang, "Xem chi tiết" mở, ảnh chứng từ hiện (ảnh tải chậm được chuyển sang tải ngay khi in). |
| Standalone | `dist/KeToanDuAn_standalone.html` | 2,0 MB (giới hạn 15 MB); chạy cùng các kiểm tra tương tác, ảnh chụp, phông: kết quả như `index.html`. |

## 6. Việc còn mở

- Các điểm nghi vấn trong `content_flags.md` mục B được giữ nguyên theo yêu cầu (không sửa nội dung bài).
- Chữ trong Hình 1.1, 1.2, 1.3 được chép tay từ ảnh trong PDF vì các hình này không có lớp chữ; công cụ so khớp tự động không kiểm được phần này, đã đối chiếu bằng mắt.
- Chế độ toàn màn hình (phím F) cần trình duyệt cho phép; trong trình duyệt không giao diện dùng để thử, chỉ kiểm được nút "Trình chiếu" và phím Esc.
