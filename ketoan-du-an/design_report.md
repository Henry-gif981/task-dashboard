# Báo cáo thiết kế: phong cách "fintech tối" theo ảnh mẫu

Ảnh mẫu (trang fintech nền đen xanh, khối lụa kim loại xanh, đường kẻ mảnh, nhãn nhỏ viết hoa, từ khóa in nghiêng) chỉ dùng làm cảm hứng bố cục và phong cách. Không dùng tên, logo, câu chữ hay khẩu hiệu nào của mẫu.
Bản trước được lưu ở `index.before_avalanche.html`; ảnh trước ở `before3/` (55 trang × 3 cỡ), sau ở `after3/` (54 trang × 1920×1080, 1366×768, 390×844; đoạn dẫn Chương 1 gộp lại vào trang bìa chương). Bản in (A4) 82 trang, nền trắng.

## 1. Phong cách

| Thành phần | Giá trị |
|---|---|
| Nền / panel | #070A12 → #0B1020; panel #0E1424; đường kẻ rgba(255,255,255,.10) |
| Chữ / chữ phụ | #F2F5FF (18,2:1 trên nền) / #9AA4BF (8,0:1) |
| Xanh điện (nút, khối đang chọn, cột BQLDA) | #2F4BFF; dải lụa #1A2A6C → #7F9CFF |
| Doanh nghiệp | đồng #E08B4F (chữ #E89A63) |
| Chữ | Be Vietnam Pro 300–400 cho tiêu đề lớn và thân bài (thêm bộ 300 có tiếng Việt), Playfair Display Italic cho từ then chốt in nghiêng (thêm 400/500 italic có tiếng Việt), IBM Plex Mono cho số và định khoản |
| Chế độ đọc | nền kem #F7F3EA, chữ #141821, chữ ×1,12, tắt 3D và chuyển động |

**Bố cục:** thanh trên mỏng (tên môn trái · bốn liên kết chương giữa · Mục lục, Trình chiếu, A−, A+ và nút trắng "Chế độ đọc" phải); hero có cột "Cuộn xuống" dọc bên trái, nhãn nhỏ viết hoa, tiêu đề đề tài nguyên văn với cụm "*chế độ kế toán*" in nghiêng serif, dòng nhóm/sinh viên/năm, hai nút "Vào bài →" và "Chế độ đọc", hàng "Văn bản trọng tâm" (TT 195/2012 · TT 200/2014 · TT 79/2019 · TT 99/2025) thay hàng logo của mẫu. Mỗi chương mở bằng hai cột: nhãn "CHƯƠNG n" và tên chương bên trái, đoạn dẫn của bài bên phải, dưới là lưới 3 cột kẻ mảnh cho các mục con. Mỗi trang có nhãn "CHƯƠNG n / x.y"; trang mở mục đặt tiêu đề trái, đoạn mô tả phải. Phần mở đầu và ba tình huống Bảng 2.12 dùng lưới 3 cột kẻ mảnh.

**Thành phần:**
- Hình 1.1: thanh ngang ba giai đoạn, giai đoạn đang chọn là khối xanh điện, nút ‹ › và chấm trang; hai cột nhiệm vụ trượt vào.
- Hình 1.3: thanh 5 bước (Bước 01–05), bước hiện tại khối xanh điện; vẫn có nút Bước trước / Bước tiếp / Hiện tất cả và phím Space.
- Bảng 1.4: danh sách năm tiêu chí có mũi tên →; rê chuột, bấm hoặc Tab mở khung bên phải so sánh BQLDA | Doanh nghiệp (nội dung chép từ chính bảng); bảng gốc vẫn ở dưới.
- Hình 1.2: cây ba nhánh, đường mảnh vẽ dần, nhánh chọn sáng lên và đường nối đậm hơn.
- Bảng: `<table>` thật, kẻ mảnh, đầu bảng cố định dưới thanh trên khi cuộn, số căn phải; ≤ 640px thành thẻ dọc.
- Ảnh chứng từ: khung viền mảnh, bóng nhẹ; hộp phóng to (lăn chuột, kéo, Esc).

## 2. Cảnh 3D "lụa chrome" (`assets/silk.js`)

Một canvas WebGL cố định phía sau nội dung. `THREE.ShaderMaterial` tự viết: lưới phẳng 180×68 ô dịch đỉnh bằng simplex noise 3D (hai tầng) cộng sóng chéo theo thời gian chậm; pháp tuyến tính lại từ đạo hàm; fragment giả phản chiếu môi trường (dải sáng ngang + trời tối theo hướng phản chiếu), fresnel, specular mềm, mép dải mờ dần. Dùng `three.min.js` r155 toàn cục (`vendor/`), không module, nên mở bằng file:// được.

- Theo mục đang xem, cùng một mesh nội suy vị trí/tỉ lệ/góc: **hero** (lớn, nửa phải) → **bìa chương** (bên phải) → **dải ngang** dưới các thanh bước (Hình 1.1, 1.3, Bảng 1.5) → **góc dưới phải, nhỏ, mờ** ở các mục có bảng/biểu đồ để không che số.
- Màu qua uniform: xanh (BQLDA) ở mục thường; đồng ở mục Doanh nghiệp (1.2.3); hai màu chia trái/phải ở các mục so sánh (bảng so sánh, Bảng 2.2, Chương 2).
- Chuột làm nghiêng nhẹ. Trần 60 FPS, pixel ratio ≤ 2, dừng khi tab ẩn hoặc bật Chế độ đọc; tự hạ lưới và độ phân giải khi FPS < 45.
- Dự phòng `.silk-fallback` (CSS gradient cùng vị trí hero) khi không có WebGL, `?no3d=1`, `prefers-reduced-motion` hoặc Chế độ đọc.

## 3. Trực quan hóa V1–V13

Mỗi biểu đồ là SVG có `data-viz="Vn"`, nằm trong panel có nhãn "HÌNH / <nguồn>", tiêu đề, đơn vị, nút "Xem bảng số liệu"; nét mảnh, lưới mờ, nhãn trực tiếp, mọc khi cuộn, tooltip tối viền mảnh, điểm dữ liệu nhận Tab và phím ← →.

| # | Biểu đồ | Nguồn số |
|---|---|---|
| V1 | Tiến độ: 186,743 + 4,582 = lũy kế 191,325 trên 312 tỷ đồng, 61,3%; mốc 2013–2016, 05/03/2013, 31/12/2015, 20/01/2016 | mục 2.1.1–2.1.2, Bảng 2.6.1, Bảng 2.7 |
| V2 | Thác nước TK 241: 121,586 → +69,739 → −4,582 → 186,743 | Bảng 2.8 |
| V3 | Thác nước B02-CĐT: 129,450 → +63,850 (60,650 tiền; 3,200 vật tư, thiết bị) → −4,582 → 188,717 | Bảng 2.5, 2.6, mục 2.1.2 |
| V4 | F02: 102,590 (54,4%) · 86,127 (45,6%) | Bảng 2.5, 2.6 |
| V5 | Bảng 2.2: 6,0/94,0 (XDCB 93,6); 5,4/94,6; 38,6/61,4 (XDCB 28,4); 48,9/51,1; kèm hình phân đôi kéo thanh ngăn | Bảng 2.2 |
| V6 | Thanh ngang đã sắp xếp: TK 241 theo nội dung chi phí và theo hạng mục (hạng mục 7 ghi riêng) | Bảng 2.8, 2.9 |
| V7 | Dumbbell 11 khoản 2014 → 2015, khoản 1 tách hàng với thang riêng; tổng 2.146,45 / 2.010,3; "tăng 6,8%", "47,4%" như bài | Bảng 2.10 |
| V8 | Cầu dòng tiền Hòa Phát: 12,252; +6,608; (29,788); +17,815; 6,888; ghi chú chưa gồm ảnh hưởng tỷ giá (Hình 2.9) | Bảng 2.5, Hình 2.9 |
| V9 | Doanh thu thuần 138,855 → giá vốn −120,358 → lợi nhuận gộp 18,498 (biên 13,3%); trước thuế 13,694; sau thuế 12,020 (8,7%); bảng đối chiếu các khoản khác | Bảng 2.7 |
| V10 | Bullet chart thời hạn: Hòa Phát 24/03/2025 · 83 ngày, hạn 90; BQLDA hạn 30, "Lập ngày 20/01/2016 · đúng hạn trong vòng 30 ngày" (không tính số ngày); Hình 1.4 vẽ lại 20/20/45 và 30/90/30 ngày, chú thích (*) nguyên văn | Bảng 2.6.3, Hình 1.4 |
| V11 | Tài khoản chữ T dạng SVG theo 4 nghiệp vụ, số hiện theo thứ tự định khoản, đường nối Nợ → Có | Bảng 1.5 |
| V12 | Dòng thời gian văn bản: trục 2012–2027 có dải theo văn bản, 4 cột thẻ (15/11/2012 & 01/01/2013 TT 195; 22/12/2014 & 01/01/2015 TT 200; 14/11/2019 TT 79; 27/10/2025 & 01/01/2026 TT 99) nối bằng đường đứt | mục 1.2.1–1.2.4, Bảng 1.3, TLTK [3]–[6] |
| V13 | Thẻ số lớn dạng SVG đếm lên khi cuộn: 199,464 · 191,325 · 224,490 · 93,6% · 94,6% · 28,4% · 188,717 · 186,743 · 12,020 · 61,3% · 83 ngày | Bảng 2.2, 2.5, 2.7, 2.8, 2.6.1, 2.6.3, mục 2.1.2 |

## 4. Kiểm tra

| Kiểm tra | Công cụ | Kết quả |
|---|---|---|
| Đủ V1–V13 | `tools/check_viz_dom.js` (selector `[data-viz]`) | 22 SVG, đủ **13/13**; 128 số hiển thị trên biểu đồ đều có trong `viz_data.json` (không tính mốc trục) |
| Số trong viz_data.json có trong PDF | `tools/check_viz_numbers.py` | **148/148** số khác nhau (240 lần xuất hiện) tìm thấy trong chữ PDF |
| Chữ trước/sau | `tools/snap_text.js`, `tools/compare_text.py` → `text_compare3.md` | Chữ nội dung **13.974/13.974 từ, 0 chỗ khác**; phần khác của innerText là nhãn giao diện ghi ở `added_content.md` mục 8 |
| Khả năng đọc | `tools/readability.js` → `readability_report.md` | 0 lỗi tương phản ở chế độ tối và Chế độ đọc; chữ nhỏ nhất 14px, nhãn biểu đồ 14,8px; thân bài 21px, line-height 1,62; ≤ 72 ký tự/dòng; 0 cuộn ngang ở 1366 và 390 |
| Tương tác | `tools/interact.js` | Đạt: tab Hình 1.1 và nút ‹ › (‹ khóa ở đầu), thanh 5 bước Hình 1.3 + Space, 6/6 hàng tiêu chí mở khung so sánh, cây Hình 1.2, 4 nghiệp vụ chữ T (4/4/5/4 tài khoản), 11 bảng so sánh, ghim hàng, thanh ngăn phân đôi, 13/13 "Xem bảng số liệu", tooltip bàn phím, 16/16 ảnh lightbox (phóng, kéo, Esc), ← → PageUp PageDown, Trình chiếu + Esc, Chế độ đọc (nhớ), A−/A+, "Vào bài →", màn mở đầu chỉ lần đầu; console 0 lỗi, 0 yêu cầu mạng |
| file:// | mọi script trên mở bằng `file://` | Không lỗi, không module/importmap |
| `?no3d=1`, `prefers-reduced-motion` | `tools/perf.js` | Dùng nền dự phòng, không tạo WebGL |

## 5. Hiệu năng (đo trong container không có GPU, WebGL qua SwiftShader = dựng hình bằng CPU 4 nhân)

| Khung | FPS cảnh lụa | Ghi chú |
|---|---|---|
| 1920×1080 | 12–19 | tự hạ xuống mức thấp nhất (lưới 72 ô, pixel ratio 0,6) |
| 1366×768 | 18–33 | mức thấp nhất |
| 390×844 (DPR 2) | 49–60 | đạt mục tiêu ≥ 50 sau vài giây |
| Tab ẩn | 0 khung | dừng vẽ |

**Mục tiêu ≥ 50 FPS ở 1920/1366 chưa xác nhận được** vì môi trường không có GPU; trên máy có card đồ họa, mở trang và xem `window.__silk.fps` trong console để đo.

## 6. Hạn chế

- FPS màn lớn như trên (chỉ đo được bằng CPU). Khi tự hạ chất lượng, mặt lụa thô hơn.
- Bản đồ ma trận V12 cũ (5 tiêu chí × 2 ô) được thay bằng danh sách tiêu chí + khung so sánh theo yêu cầu mới; V12 nay là dòng thời gian văn bản pháp lý.
- Ở màn ≤ 1100px các liên kết chương trên thanh trên ẩn (dùng nút "Mục lục"); ở ≤ 760px ẩn nút "Trình chiếu".
- Khi in: ẩn thanh trên, canvas, hàng "Văn bản trọng tâm", nút, thanh bước, danh sách tiêu chí; bảng và chữ giữ nguyên.
- Cảnh 3D chỉ trang trí, không mang số liệu; biểu đồ luôn là SVG phẳng.
