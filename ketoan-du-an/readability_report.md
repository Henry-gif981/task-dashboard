# Báo cáo khả năng đọc (thiết kế "fintech tối")

Đo bằng `tools/readability.js` (Playwright/Chromium, chặn mạng, `?nointro=1&no3d=1`, mở hết "Xem chi tiết") trên `index.html` hiện tại; kết quả trong `readability_after3.json`. Chế độ đọc đo thêm bằng `?reading=1`.

## 1. Kết quả

| Tiêu chí | Ngưỡng | Chế độ tối (mặc định) | Chế độ đọc (nền kem) |
|---|---|---|---|
| Phần tử chữ dưới ngưỡng tương phản (4,5:1; chữ lớn 3:1) | 0 | **0** / 1.396 | **0** / 1.396 |
| Màu chữ chính / phụ trên nền | ≥ 7:1 / ≥ 4,5:1 | #F2F5FF trên #070A12 ≈ 18:1; #9AA4BF trên #070A12 ≈ 8:1 | #141821 trên #F7F3EA ≈ 16:1; #4F5868 ≈ 6,5:1 |
| Cỡ chữ HTML nhỏ nhất (1920×1080) | ≥ 14px | **14px** | **14px** |
| Nhãn trên biểu đồ (cỡ hiển thị thật) | ≥ 14px | **14,8px** | **14,8px** |
| Thân bài | 20–22px | **21px** | 23,5px (chữ to hơn một cấp, theo yêu cầu) |
| Line-height thân bài | 1,55–1,65 | **1,62** | 1,62 |
| Ký tự mỗi dòng (54 đoạn ≥ 3 dòng) | ~70 | trung vị **62**, lớn nhất **72** | (cột hẹp hơn tương đối vì chữ to) |
| Cuộn ngang 1366×768 / 390×844 | 0 | **0 / 0** | – |

Tương phản tính theo WCAG từ màu nền thật của các lớp phía sau chữ. Không đo được bằng công cụ này: chữ trong ảnh chứng từ (scan) và chữ nằm trong SVG (đã xem bằng mắt: nhãn SVG nằm trên nền panel đặc #0E1424, hoặc chữ trắng trên cột xanh điện/đồng).

## 2. Cách đạt

- Chữ nội dung luôn nằm trên mặt phẳng đặc: khối `.wrap` mỗi mục, khối chữ hero và hàng "Văn bản trọng tâm" có nền #070A12 đặc; canvas lụa nằm phía sau (z-index 0) và chỉ hiện ở lề. Không parallax trên chữ.
- Chữ phụ #9AA4BF (không dùng xám mờ hơn), nhãn nhỏ viết hoa tối thiểu 14px (lớn hơn ảnh mẫu). Màu xanh điện #2F4BFF chỉ dùng làm nền nút/khối đang chọn/cột BQLDA với chữ trắng; chữ xanh trên nền tối dùng #93A6FF; chữ đồng #E89A63.
- Đầu bảng nền xanh đậm/đồng đậm với chữ #F2F5FF; hàng so le dùng hai sắc panel gần nhau.
- Thân bài Be Vietnam Pro 300 ở 21px; tối đa 52ch (≈ 62–72 ký tự/dòng tiếng Việt).
- Chế độ đọc: nền kem #F7F3EA, chữ #141821, chữ ×1,12, tắt cảnh 3D (dùng nền đặc), tắt chuyển động; A−/A+ 5 bậc; cả hai nhớ bằng localStorage (try/catch).

## 3. Hạn chế

- Ở Chế độ đọc, thân bài 23,5px vượt khoảng 20–22px vì yêu cầu "chữ lớn hơn một cấp"; dùng A− để về 21px.
- Ở 390px, `thead` của bảng chữ bị ẩn có chủ đích (bảng chuyển thành thẻ, nhãn cột hiện trong từng ô) nên công cụ báo `thead` là "bị cắt".
