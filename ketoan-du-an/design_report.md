# Báo cáo nâng cấp giao diện "Sổ cái 3D"

Trang: `index.html` (+ `assets/`, `fonts/`, `vendor/`), bản một tệp `dist/KeToanDuAn_standalone.html`.
Nội dung bài không đổi; chỉ đổi cấu trúc HTML trình bày, CSS, JS hiển thị và thêm yếu tố trang trí không mang số liệu.

## 1. Phong cách

**Ý tưởng:** hai dòng vốn đối lập chạy suốt trang: **xanh navy = BQLDA** (hạch toán "vốn"), **cam = Doanh nghiệp** (hạch toán "kết quả"). Mọi trang trí xoay quanh hai biểu tượng của nghề: **tài khoản chữ T (Nợ | Có)** và **dòng kẻ sổ**. Vàng sổ (#E8B84A) chỉ dùng để nhấn: ghim, gạch dưới kép, kẻ lề.

| Vai trò | Nền sáng (nội dung) | Nền tối |
|---|---|---|
| Nền giấy / thẻ | #FAF8F3 / #FFFFFF | #0D1626 / #14223A |
| Mực / mực phụ | #12151C / #4A505C | #E9EEF5 / #A9B6C8 |
| Đường kẻ | #E6ECF3, #CDD6E1 | #22324B, #33476A |
| BQLDA (chữ / tô) | #1F4E79 / #1F4E79 → #3B82C4 | #8CC0F0 / #3B82C4 → #74ADE6 |
| Doanh nghiệp (chữ / tô) | #A94A0B / #C55A11 → #F08A3C | #F5A266 / #E07A35 → #F5A266 |
| Hero, bìa chương | Navy sâu #0B1F3A (luôn tối) | như bên trái |

Khai báo bằng CSS custom properties trong `:root` và `:root[data-theme="dark"]`.

**Chữ** (tự host, đủ bộ ký tự tiếng Việt): tiêu đề **Fraunces** (serif có cá tính; thêm 300/400/600/700 từ `@fontsource/fraunces` 5.3.0, giấy phép OFL, bổ sung vào `fonts/LICENSE-OFL.txt`); đoạn văn Source Serif 4; giao diện Be Vietnam Pro; số và định khoản IBM Plex Mono, `tabular-nums`. Thang chữ ở 1920×1080: chữ gốc 21px, tiêu đề mục ~64px (tiêu đề dài trên 70 ký tự ~50px để không quá 4 dòng), tên chương ~69px, số mục bên lề 36px, thẻ số nổi bật ~123px.

**Bố cục:** lưới 12 cột (khung nội dung tối đa 1240px), đoạn văn chiếm 9 cột, hình/bảng 12 cột; lề trái có số mục lớn (1.1, 2.3…) kiểu chú thích sổ cái, cạnh đường kẻ lề đôi màu vàng; nền mỗi trang có dòng kẻ ngang rất mờ. Bo góc 4–6px, đường kẻ mảnh, bóng nhẹ hai lớp; không gradient tím–hồng, không kính mờ, không emoji, không khẩu hiệu.

## 2. Thay đổi chính

| Phần | Đã làm |
|---|---|
| **Màn mở đầu** | 1,5 giây: nét chữ T được vẽ (thanh ngang → thân → gạch dưới xanh/cam), rồi mở vào hero. Nút "Bỏ qua", phím bất kỳ cũng bỏ qua; chỉ chạy lần đầu trong phiên; tắt khi `prefers-reduced-motion` hoặc `?nointro=1`. |
| **Hero 3D** (`assets/hero3d.js`, Three.js r155 bản local `vendor/three.min.js`) | Chữ "T" đùn khối có vát cạnh, gạch dưới kép vàng và đường kẻ Nợ/Có; hai dòng khối nhỏ (InstancedMesh) chảy vào hai đầu thanh ngang: trái xanh (vốn), phải cam (kết quả). Đèn chính đổ bóng mềm (PCFSoft), đèn viền xanh bên trái, cam bên phải, sương mù theo độ sâu, hai lớp hạt bụi sáng (gần: to, mờ; xa: nhỏ, sắc) để gợi độ sâu trường ảnh. Chuột làm cảnh nghiêng nhẹ; cuộn trang làm máy ảnh lùi và cảnh mờ dần. Chữ hero: tên trường, môn, chủ đề (nguyên văn, hiện từng dòng bằng mask), Nhóm 2, sinh viên + MSSV, năm 2026, logo NEU; chỉ báo "cuộn xuống" là một vạch chạy; vòng sáng nhỏ quanh con trỏ chỉ trong hero (tắt trên màn cảm ứng). |
| **Hiệu năng 3D** | Trần 60 FPS; dừng vẽ khi tab ẩn, khi hero ra khỏi màn hình (IntersectionObserver + vị trí cuộn); pixel ratio tối đa 2; tự hạ chất lượng khi FPS < 45 (bước 1: pixel ratio 1, bóng thường; bước 2: bỏ bóng, vật liệu Lambert, bỏ đèn điểm và lớp hạt gần, pixel ratio 0,75). Dự phòng **SVG tĩnh cùng bố cục** khi: không có WebGL, `navigator.hardwareConcurrency ≤ 2` hoặc `deviceMemory ≤ 2`, `prefers-reduced-motion`, hoặc `?no3d=1` (`?force3d=1` để ép 3D trên máy yếu). |
| **Trang bìa chương** | Toàn màn hình, số chương cực lớn dạng viền mờ (parallax nhẹ khi cuộn), dòng "Chương n", tên chương, danh sách mục con có liên kết. Chương 1 navy, Chương 2 chia đôi chéo xanh/cam, Chương 3 kem. Vào màn hình bằng hiệu ứng mở khung `clip-path`. Đoạn dẫn nhập Chương 1 được tách sang trang ngay sau bìa (thứ tự giữ nguyên). |
| **Điều hướng** | Cột trái "mục lục sổ cái": chấm tiến độ trên một đường kẻ dọc, mục đã qua tô xám, mục đang xem sáng màu theo ngữ cảnh (xanh, cam, hoặc nửa xanh nửa cam ở trang so sánh); thu thành ngăn kéo "Mục lục" khi màn hình ≤ 1200px. Thanh tiến độ mảnh phía trên chuyển xanh → cam; nhãn vị trí "1.2.4 / Chương 1". Chân trang theo yêu cầu. |
| **Bảng** | Giữ `<table>` thật; đầu cột BQLDA navy có gạch xanh sáng, Doanh nghiệp cam đậm có gạch cam sáng; dòng kẻ sổ; hàng sáng nhẹ khi rê chuột; dòng tổng gạch dưới kép; nút **ghim hàng** (biểu tượng ghim) để giữ một hàng nổi bật khi trình chiếu. Trên điện thoại (≤ 640px) bảng chữ chuyển thành **thẻ xếp dọc**, mỗi ô có nhãn cột màu xanh/cam; bảng số giữ dạng bảng cuộn ngang. |
| **Thẻ, danh sách** | Mẫu biểu B01…B04 có số tem 01–05; kiến nghị 01/02 số viền lớn; "Nhận xét", "Tóm tắt chương" thành thẻ kết chương với dấu tick kiểu sổ, viền trái nửa xanh nửa cam. |
| **Hình 1.1** | Chevron lớn, chọn giai đoạn thì một vệt sáng vàng quét qua chevron và một thanh sáng chạy dưới hàng chevron; hai cột công việc trượt vào. |
| **Hình 1.2** | Đường nối từ gốc tới ba nhánh vẽ dần khi vào màn hình (SVG theo vị trí thật); chọn một nhánh thì nhánh đó phóng nhẹ, hai nhánh còn lại mờ đi, đường nối của nhánh được tô đậm. |
| **Lưu ý hiệu lực pháp lý** | Ghi chú giấy vàng sổ, ghim tròn, con dấu vòng tròn mờ, nghiêng −0,4°. |
| **Hình 1.3** | Đường dẫn vàng giữa hai cột lớn dần theo bước, số bước hiện tại sáng vàng; nút lớn "Bước trước / Bước tiếp / Hiện tất cả"; phím **Space** chạy bước tiếp khi Hình 1.3 đang ở giữa màn hình. |
| **Bảng 1.5 (chữ T)** | Kẻ T đậm 3px; số hiện dần theo thứ tự định khoản và **mũi tên động** nối số bên Nợ sang số bên Có của cùng một định khoản, màu theo BQLDA/Doanh nghiệp. |
| **Biểu đồ** | Vẫn là SVG phẳng tự vẽ, trục từ 0, nhãn trực tiếp. Lưới mờ hơn, cột có gradient nhẹ cùng màu, cột/thanh mọc khi vào màn hình rồi nhãn số hiện sau, tooltip nền navy viền vàng hiện số gốc. Áp dụng cho Hình 1.4, Bảng 2.2, thác nước B02, dòng tiền Hòa Phát, F02, Bảng 2.8, 2.9, 2.10, thanh thời hạn 30/90 ngày. |
| **Thẻ số nổi bật** | 199,464 · 191,325 · 224,490 (đã có), thêm 93,6% · 94,6% · 28,4% (Bảng 2.2), 188,717 tỷ đồng (Bảng 2.5), 186,743 tỷ đồng (Bảng 2.8), 61,3% (thanh tiến độ). Cỡ ~123px ở 1920px, đếm lên khi cuộn tới, đơn vị và nguồn ghi rõ. Chỉ dùng số in trong bài. |
| **So sánh phân đôi** | Cạnh Bảng 2.2: hai cột cơ cấu Tài sản/Nguồn vốn của BQLDA (nền xanh) và Hòa Phát (nền cam) chồng lên nhau, kéo thanh ngăn vàng ở giữa (hoặc phím mũi tên) để so; lần đầu vào màn hình thanh ngăn tự lắc nhẹ để gợi ý. Chỉ dùng % của Bảng 2.2. |
| **Dòng thời gian** | Trục ngang tỉ lệ 2012–2027, cuộn ngang trên màn hẹp; đường trục chạy dần, bốn thẻ văn bản hiện lần lượt, đường nối nét đứt từ mốc tới thẻ. |
| **Chứng từ gốc** | Mỗi ảnh là một "tờ giấy" có góc gấp, nghiêng ±1°, bóng nghiêng; rê chuột thì nâng lên và thẳng lại. Hộp xem ảnh mới: nền tối, lăn chuột để phóng (quanh vị trí con trỏ), kéo thả, nhấp đúp phóng 2×, nút −/Vừa khung/+, phím + − 0 và mũi tên, Esc đóng, Tab vòng trong hộp. |
| **Biểu tượng** | Bộ SVG tự vẽ nét 1,5px: sổ cái, công trình, dấu tích, đồng hồ, mũi tên, ghim, chữ T, cân. |
| **Chuyển động** | Một bảng thời gian chung: `cubic-bezier(.2,.7,.2,1)`, 500–700ms, các phần tử trong một trang lệch nhau 60ms. Không nhấp nháy, không xoay liên tục. `prefers-reduced-motion`: tắt màn mở đầu, cảnh 3D (thay SVG tĩnh), hiện dần, clip-path, mọc cột, mũi tên, parallax, vòng con trỏ. |
| **Sáng/tối** | Mặc định sáng cho nội dung; hero và bìa chương luôn tối; nút "Nền tối" lưu bằng `localStorage` (bọc try/catch). |
| **In** | Ẩn màn mở đầu, canvas, thanh điều hướng, thẻ trang trí, hình phân đôi; hero in thành bìa chữ đen; mỗi trang một phần, bảng không tách, "Xem chi tiết" mở hết, ảnh tải ngay. |

## 3. Kiểm tra

| Kiểm tra | Cách làm | Kết quả |
|---|---|---|
| (a) Chữ trước/sau | `tools/snap_text.js` lưu `before_text.txt` (innerText) và `before_text_content.txt` (chữ trong `<main>`, kể cả tab ẩn, bỏ `[data-ui]`, biểu đồ sinh bằng JS, `svg`, `.sr-only`) trước khi sửa; chạy lại sau khi sửa (`after_text*.txt`); `tools/compare_text.py` so theo chuỗi từ (bỏ khác biệt khoảng trắng và chữ hoa do CSS) → `text_compare.md`. | Nội dung: **13.974 / 13.974 từ, 0 chỗ khác**. innerText toàn trang: các chỗ thêm đều là nhãn giao diện đã khai trong `added_content.md` mục 6 (tên mục trên bìa chương, nhãn "Chương 1 · Dẫn nhập", "Space", hình phân đôi, thẻ số nổi bật, chân trang). |
| (b) Ảnh chụp | `tools/shoot.js` từng trang ở 1920×1080, 1366×768, 390×844 → `after/`; ảnh trước khi sửa ở `before/` (1920×1080, 390×844). | 55 trang × 3 kích thước = 165 ảnh (JPEG). Không cuộn ngang ở cả 3 cỡ (`scrollWidth − innerWidth = 0`), 0 lỗi console, 0 yêu cầu mạng, đủ 14 kiểu phông (gồm Fraunces 300/400/600/700). Đã xem từng ảnh và sửa: số mục bên lề của trang "Bảng/Hình" lấy nhầm số bảng (nay dùng số mục đứng trước); số chương viền bị lệch vào giữa; nhãn so sánh phân đôi bị cắt trên điện thoại; Bảng 2.2 bị chật khi đặt cạnh hình phân đôi ở 1366px (nay xếp dọc dưới 1500px); chữ T che tiêu đề ở 1366px và điện thoại (thu hẹp canvas, lùi máy ảnh theo tỉ lệ khung); mũi tên chữ T đi qua tiêu đề tài khoản (nay vòng xuống dưới). Biểu đồ trong ảnh được chụp ở trạng thái đã mọc xong (script bỏ trạng thái chờ cuộn). |
| (c) Hiệu năng | `tools/perf.js`, Chromium headless **không có GPU** (WebGL chạy bằng SwiftShader, dựng hình bằng CPU 4 nhân). | FPS cảnh hero (SwiftShader, sau khi tự hạ chất lượng): 1920×1080: 10–16; 1366×768: 16–26; 390×844 (DPR 2): 54–58. Khi hero ra khỏi màn hình: 0 khung được vẽ thêm. `?no3d=1` và `prefers-reduced-motion`: dùng SVG dự phòng, không tạo WebGL. Chặn mạng: 0 yêu cầu; console sạch ở mọi trường hợp. FPS khi cuộn nội dung (requestAnimationFrame, cuộn 12px/khung, dựng hình bằng CPU): 61 với giảm chuyển động; 28–44 với `?no3d=1`; 12–20 khi trang vừa tải xong ở 1920/1366 (đang chạy các hiệu ứng hiện dần). **Mục tiêu ≥ 50 FPS trên máy thường (có GPU) chưa đo được trong môi trường này**; số trên là cận dưới trên CPU. |
| (d) Tương tác | `tools/interact.js` | Đạt: 3 tab Hình 1.1; 3 nhánh Hình 1.2 (nhánh chọn nổi lên, lớp `focus`); Bước tiếp/Bước trước/Hiện tất cả và phím Space (2 lần Space → còn 2 bước chờ); 4 tab chữ T; 11 bảng so sánh × 3 chế độ cột + lọc tiêu chí; ghim hàng; thanh ngăn phân đôi (4% → 96% bằng phím Home/End); 16/16 ô ảnh mở/đóng bằng Esc; lăn chuột phóng 100% → 115%, kéo thả có dịch, "Vừa khung" về 100%; ← → PageUp PageDown; Trình chiếu ẩn thanh trái, Esc thoát; Nền tối; sự kiện in mở hết "Xem chi tiết"; màn mở đầu chạy và nút Bỏ qua hoạt động. 0 ảnh thiếu alt, 0 `th` thiếu scope, 61 điểm dữ liệu biểu đồ nhận tiêu điểm bàn phím. |
| Tương phản | `tools/check_contrast.js` (sau 0,9 giây để hết hiệu ứng chuyển màu) | Nền sáng 1.229 phần tử chữ, nền tối 1.309: **0 phần tử dưới mức AA**. Bỏ qua chữ số viền trong suốt mang tính trang trí ("01", "02", "03" trên bìa chương, `aria-hidden`). Đã sửa trong quá trình làm: nút công cụ trên nền tối, chữ trắng trên cột xanh/cam của hình phân đôi, số mục vàng trên bìa Chương 3, số thứ tự Phần mở đầu. |
| (e) Bản một tệp | `python3 tools/build.py` nhúng font, CSS, JS, Three.js, ảnh (base64) | `dist/KeToanDuAn_standalone.html` 2,95 MB (giới hạn 15 MB, không cần giảm chất lượng ảnh). Chặn mạng vẫn chạy: chữ nội dung trùng 100% với bản trước, cảnh 3D chạy (WebGL), 16/16 ảnh, hình phân đôi, ghim, màn mở đầu; console sạch. |

## 4. Hạn chế, chưa làm được

- **FPS trên máy có GPU chưa đo được**: container không có GPU, WebGL chạy bằng SwiftShader nên cảnh hero chỉ đạt 10–26 FPS ở 1920/1366 (54–58 FPS ở khung điện thoại). Trang tự hạ chất lượng (bỏ bóng, vật liệu đơn giản hơn) để giữ cảnh; trên máy thật nên mở trang, xem `window.__hero3d.fps` trong console để kiểm tra mục tiêu ≥ 50 FPS. Khi bị hạ xuống mức thấp nhất, chữ T trông tối hơn vì dùng vật liệu Lambert.
- **Độ sâu trường ảnh** là giả lập (sương mù theo độ sâu + hai lớp hạt kích thước khác nhau), không dùng bộ lọc bokeh hậu kỳ vì bản `three.min.js` không kèm các pass hậu kỳ.
- `three.min.js` r155 tự in một cảnh báo "build/three.min.js deprecated" khi tải; trang lọc riêng câu cảnh báo đó (bọc `console.warn` trong lúc nạp rồi trả lại) để console sạch. Không sửa tệp thư viện.
- Cuộn trang khi dựng hình bằng CPU còn 12–44 FPS tùy kích thước (dòng kẻ nền, hiệu ứng hiện dần); đã bỏ `mask-image`, `backdrop-filter` để nhẹ hơn (30 → 44 FPS ở 1920 với `?no3d=1`).
- innerText toàn trang có thêm các nhãn giao diện liệt kê ở `added_content.md` mục 6 (danh sách mục con trên bìa chương, thẻ số nổi bật, hình phân đôi, chân trang, "Space", "Chương 1 · Dẫn nhập"); chữ nội dung trong `<main>` trùng 100%.
- Ảnh `before/` chỉ chụp ở 1920×1080 và 390×844 (chưa có 1366×768 trước khi sửa). Ảnh lưu JPEG (chất lượng 68) để kho nhẹ hơn.
- Khi in, hình so sánh phân đôi, thẻ số nổi bật và mũi tên chữ T bị ẩn (chỉ là trang trí trùng số với bảng); biểu đồ thác nước in ra khá lớn.
- Trên điện thoại, bảng số (Bảng 2.2, 2.6, 2.8, 2.9, 2.10) vẫn là bảng cuộn ngang, không chuyển thành thẻ, để giữ cột số thẳng hàng.
- Màn mở đầu chỉ chạy lần đầu trong phiên (sessionStorage); thêm `?nointro=1` để bỏ hẳn.
