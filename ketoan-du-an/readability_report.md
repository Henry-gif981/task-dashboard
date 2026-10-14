# Báo cáo kiểm toán khả năng đọc

Đo bằng `tools/readability.js` (Playwright/Chromium, chặn mạng, tắt 3D, bỏ màn mở đầu, mở hết "Xem chi tiết", hiện hết hiệu ứng).
- **Trước:** `index.before_luxury.html` (bản "Sổ cái 3D", lưu ở `readability_before.json`).
- **Sau:** `index.html` hiện tại (`readability_after.json`).

## 1. Kết quả đo

| Tiêu chí | Ngưỡng yêu cầu | Trước | Sau |
|---|---|---|---|
| Phần tử chữ dưới ngưỡng tương phản, nền sáng (4,5:1; chữ lớn 3:1) | 0 | **25** (bìa Chương 2 chữ tối trên nền tối, danh sách mục con, nhãn hình phân đôi…) | **0** / 1.438 phần tử |
| Như trên, nền tối | 0 | 0 | **0** / 1.438 |
| Cỡ chữ HTML nhỏ nhất (1920×1080) | ≥ 14px | 12,6px; **37** phần tử < 14px | **14px; 0** phần tử < 14px |
| Nhãn trên biểu đồ SVG nhỏ nhất (cỡ hiển thị thật) | ≥ 14px | 12px; **129** nhãn < 14px | **14,8px; 0** nhãn < 14px |
| Cỡ thân bài (đoạn văn > 60 ký tự) | 20–22px | 22,05px | **21,84px** (đoạn dẫn đầu chương 29,8px là cỡ "lead" có chủ đích) |
| Line-height thân bài | 1,55–1,65 | 1,45–1,68 | **1,55–1,60** |
| Ký tự mỗi dòng (52 đoạn ≥ 3 dòng) | ~70 tối đa | trung vị 71, lớn nhất 78 | **trung vị 65, lớn nhất 73** |
| Cuộn ngang 1366×768 / 390×844 | 0 | 0 / 0 | **0 / 0** |
| Chữ bị cắt (overflow hidden) 1366 / 390 | 0 | 0 / `thead` | 0 / `thead`: ở 390px `thead` của bảng chữ được ẩn có chủ đích (bảng chuyển thành thẻ, nhãn cột hiện trong từng ô), không phải chữ bị cắt |

Tương phản tính theo công thức WCAG (độ chói tương đối) với nền ghép từ các lớp nền thật; bỏ qua chữ số viền trang trí `aria-hidden` ("01", "02", "03") và hàng được làm mờ có chủ đích (bước chưa tới ở Hình 1.3, hàng bị lọc).

## 2. Đã sửa

- **Bảng màu mới** (biến CSS sáng/tối): Midnight #0A1626/#0E1D33, Ivory #F7F3EA, Paper #FFFDF8, Ink #141821, Muted #5B6472, Champagne #C8A45D (chỉ dùng làm đường kẻ, chấm, viền, hoặc chữ trên nền Midnight nơi đạt ≥ 4,5:1), Gold-deep #9C7A32 không dùng cho chữ thân; chữ vàng trên nền kem dùng #7A5E22. BQLDA Sapphire #2F5D8C (nền tối #6FA3D6); Doanh nghiệp Copper #B8672E làm màu tô, chữ đồng trên nền sáng dùng #93501E (đạt AA), nền tối #E08B4F.
- **Chữ:** mọi cỡ `rem` nhỏ được kẹp `max(14px, …)`; nhãn biểu đồ tối thiểu 15px trong mã (hiển thị ≥ 14,8px sau khi SVG co theo khung); thân bài 1,04rem (21,8px ở 1920), line-height 1,6, tối đa 64ch.
- **Playfair Display** (có bộ chữ tiếng Việt) chỉ dùng cho tiêu đề và số lớn (≥ 40px ở 1920); bật chữ số thẳng hàng (`lnum`) vì chữ số kiểu cổ làm "B03" trông như "Bo3". Tiêu đề nhỏ, thân bài: Source Serif 4 / Be Vietnam Pro; số liệu và định khoản: IBM Plex Mono. Nhãn nhỏ dạng chữ in hoa cách chữ.
- **Chữ luôn trên mặt phẳng đặc:** hero đặt khối chữ trên nền Midnight đặc, cảnh 3D chỉ ở nửa phải (mờ 85%); bỏ lưới kẻ sổ sau chữ, bỏ parallax số chương, bỏ hiệu ứng mở khung `clip-path` trên bìa chương.
- **Giảm "ồn":** bỏ bóng đổ thẻ, viền kép, lề kẻ đôi, dòng kẻ nền slide, góc gấp và độ nghiêng của ảnh chứng từ, ghim/con dấu của khung lưu ý; viền còn 1px (champagne 40–60% cho đường ngăn), bo góc 4–6px; các khoảng đệm mới thêm theo bội 8px (8/16/24/32/40/48); một số khoảng cách cũ tính bằng rem chưa quy hết về lưới 8px.
- **Mỗi màn một điểm nhấn:** thẻ số lớn chỉ đặt ở đầu mục chính; màu nổi trên một màn tối đa xanh BQLDA, đồng Doanh nghiệp và champagne.
- **Bảng:** đầu bảng `position: sticky` khi cuộn (tắt ở ≤ 900px và khi in), hàng so le nhẹ, số căn phải `tabular-nums`, dòng tổng gạch dưới kép, hover sáng nhẹ, đệm ô 12×16px; ≤ 640px bảng chữ thành thẻ dọc.
- **Chế độ đọc** (nút ở thanh điều hướng): tắt cảnh 3D (dùng hình tĩnh), mọi chuyển động và màn mở đầu; nền kem đặc; chữ to hơn một cấp (×1,12); ghi nhớ bằng `localStorage` (bọc try/catch).
- **A− / A+:** 5 bậc cỡ chữ (90%–130%), ghi nhớ bằng `localStorage`; biểu đồ vẽ lại theo cỡ mới.
- **Điều hướng gọn:** mỗi mục hiện số + tên ngắn (số bằng mono), mục hiện tại có nền thẻ, chữ đậm và vạch màu theo đơn vị; thêm nút "Về mục lục".
- **Màn mở đầu:** chỉ chạy lần đầu (nhớ bằng `localStorage`), có nút "Bỏ qua".
- **Hero 3D:** khối chảy chậm hơn (≈ 0,6 lần), nghiêng theo chuột ít hơn, mờ 85%; vẫn dừng hẳn khi cuộn qua hero, khi tab ẩn, khi bật Chế độ đọc, `prefers-reduced-motion` hoặc `?no3d=1`.

## 3. Thử đọc ở 1366×768 và 390×844

Đã xem ảnh từng mục trong `after2/1366x768` và `after2/390x844`: không cuộn ngang; ở 390px các biểu đồ chuyển bố cục riêng (thác nước nằm ngang, nhãn tự xuống dòng, dumbbell nhãn ở trên, mốc thời gian xếp tầng) để nhãn không chồng/cắt.

## 4. Còn hạn chế

- Đoạn dẫn đầu Chương 1 (cỡ "lead" ~29,8px) vượt khoảng 20–22px có chủ đích; các đoạn thân bài khác 21,8px.
- Ảnh chứng từ (scan) là ảnh nên không đo được tương phản/cỡ chữ; xem bằng hộp phóng to.
- Đo tương phản dựa trên màu nền thật của phần tử cha; chữ đè lên biểu đồ SVG không đo bằng công cụ này (nhãn SVG đặt trên nền thẻ đặc hoặc trên cột tô đậm với chữ #FFFDF8, đã xem bằng mắt).
