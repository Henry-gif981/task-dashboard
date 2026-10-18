# Chế độ trình chiếu: hướng dẫn nhanh cho nhóm

File: `EU_presentation_standalone_v3b.html` (bản v2b có thêm hình + chế độ trình chiếu). Mở thẳng bằng Chrome/Edge (file://), không cần mạng hay server. Trang vẫn cuộn như cũ; chế độ trình chiếu là một lớp bật thêm.

## Vào / ra
- **Vào:** bấm **Present ▶** trên thanh menu (chỉ hiện khi màn hình rộng hơn 760 px) hoặc phím **P**. Trang xin toàn màn hình và bắt đầu từ slide đang xem.
- **Ra:** **Esc** hoặc **P**. Trang trở lại như cũ, vẫn đứng ở slide đang chiếu. Thoát toàn màn hình bằng Esc cũng thoát luôn chế độ trình chiếu.
- Mỗi section là một slide (44 slide, gồm slide mới "Vietnam–EU in six numbers"). Mỗi lần bấm "tiếp" hiện thêm một khối: tiêu đề, một cụm thẻ, một bảng, một biểu đồ. Bảng và timeline không bao giờ bị tách theo dòng. Một slide có tối đa 6 bước. Chấm ●●○ ở thanh dưới cho biết còn mấy khối.
- Khối cao hơn màn hình (ví dụ timeline lịch sử EU, danh mục tài liệu) sẽ được cuộn từng trang trước khi sang khối kế.

## Phím tắt (bấm **?** khi đang chiếu để xem bảng này)
| Phím | Tác dụng |
|---|---|
| → Space PgDn ↓, bấm nửa phải, vuốt trái | Khối tiếp / slide kế |
| ← Shift+Space PgUp ↑, bấm nửa trái, vuốt phải | Lùi một khối / slide trước (hiện đủ) |
| Home / End | Slide đầu / cuối |
| gõ số + Enter | Nhảy tới slide (Backspace để sửa) |
| G | Lưới tổng quan theo chương (mũi tên + Enter, Esc đóng) |
| B hoặc . / W | Màn hình đen / trắng (bấm lại để trở về) |
| L | Bút laser |
| S | Presenter view |
| T / R | Đặt thời lượng (phút) / đặt lại đồng hồ |
| + / − | Phóng to / thu nhỏ chữ cho máy chiếu (được nhớ cho lần sau) |
| F | Bật / tắt toàn màn hình |

Bút trình chiếu thông thường gửi PgUp/PgDn và B/. nên dùng được ngay.

## Khi cắm máy chiếu: Presenter view
1. Cài đặt màn hình ở chế độ **Extend** (không phải Duplicate).
2. Mở file, bấm **P**, rồi bấm **S**: cửa sổ Presenter view mở ra (tiêu đề slide hiện tại và slide kế, ghi chú, bước, đồng hồ, nút ◀ Prev / Next ▶ / B / R).
3. Kéo **cửa sổ chính** sang màn hình máy chiếu và bấm **F** để toàn màn hình (mở cửa sổ phụ làm trình duyệt thoát toàn màn hình một lần). Giữ Presenter view trên laptop.
4. Điều khiển ở cửa sổ nào cũng được; hai cửa sổ tự đồng bộ. Thoát trình chiếu sẽ đóng Presenter view.

**Popup bị chặn?** Trang sẽ báo. Bấm biểu tượng chặn cửa sổ bật lên ở cuối thanh địa chỉ, chọn "Luôn cho phép cửa sổ bật lên…", rồi bấm **S** lại. Nên thử việc này một lần trên đúng máy sẽ dùng để bảo vệ.

## Đồng hồ
- Thanh dưới hiện thời gian đã nói (mm:ss). Bấm **T**, nhập số phút, Enter: đồng hồ chuyển sang đếm ngược, **vàng** khi đã dùng 80% thời gian, **đỏ** khi quá giờ. Nhập 0 để tắt đếm ngược.
- Đặt sẵn qua địa chỉ: thêm `?t=15` vào cuối đường dẫn file. **R** đặt lại đồng hồ về 0.
- Thanh dưới tự ẩn sau 2,5 giây không di chuột; di chuột để hiện lại.

## Sửa ghi chú diễn giả (`NOTES`)
Mở file HTML bằng trình soạn thảo văn bản, tìm `const NOTES = {`, nằm ở đầu khối script "Presentation mode". Mỗi dòng có dạng:
```js
"c3-trade": ["ý 1", "ý 2", "ý 3"],
```
Khóa là `id` của section (xem trong lưới **G** hoặc trên thanh địa chỉ khi đang chiếu, ví dụ `#c3-trade`). Giữ dấu ngoặc kép và dấu phẩy. Ghi chú chỉ hiện trong Presenter view, không bao giờ hiện cho khán giả và không có trong bản in. Slide không có ghi chú sẽ hiện "(chưa có ghi chú)".

Nếu sửa trong kho mã: sửa `v3/src/present.js`, rồi từ thư mục `eu-presentation/` chạy `python3 tools/inject_present.py v2b/src/index_v2b.html index.html` và `python3 tools/build_standalone.py v3b/EU_presentation_standalone_v3b.html`.

## Ép một slide hiện hết trong một lần
Thêm `data-build="all"` vào thẻ `<section>` của slide đó, ví dụ:
```html
<section class="sec auto" id="c2-trade" data-build="all" …>
```
Bìa, trang mục lục, bìa chương, References và slide cảm ơn đã mặc định hiện hết một lần. Slide ít nội dung (≤ 2 khối) cũng vậy.

## Khác
- Tải lại trang sẽ quay về slide vừa xem, nhưng chế độ trình chiếu không tự bật lại.
- Bản in (Ctrl+P) không đổi so với v2. Nếu đang chiếu mà in, trang tự thoát chế độ trình chiếu trước.
