# Báo cáo bộ biểu đồ V1–V13

Mọi biểu đồ là SVG/HTML tự viết trong `assets/app.js` (không thư viện, không CDN), số lấy từ `viz_data.json` (đúng dạng in trong bài, có trường `src`).
Quy tắc chung đã áp dụng: nét mảnh, lưới mờ, nhãn trực tiếp, cột/thanh bắt đầu từ 0, không 3D, không biểu đồ tròn; cột/thanh "mọc" khi vào màn hình (tắt khi giảm chuyển động / Chế độ đọc); tooltip hiện số gốc; mỗi điểm dữ liệu nhận tiêu điểm bàn phím (Tab), phím ← → chuyển điểm, Esc rời; mỗi biểu đồ có tiêu đề, đơn vị, nguồn và nút **"Xem bảng số liệu"** mở bảng đúng các số đã vẽ (12/12 biểu đồ có số).

**Kiểm tra số:** `tools/check_viz_numbers.py` lấy mọi chuỗi số trong `viz_data.json` và tìm đúng chuỗi đó trong chữ PDF (`source/full_raw.txt`, pdftotext): **148/148 số khác nhau (240 lần xuất hiện) đều có trong bài, 0 số không tìm thấy** (`viz_numbers_check.md`). Không có số nào do trang tự tính để hiển thị; chiều dài cột chỉ là vị trí vẽ.

| # | Biểu đồ | Vị trí | Số dùng | Nguồn |
|---|---|---|---|---|
| V1 | Tiến độ dự án: thanh lũy kế 191,325 trên tổng mức 312 tỷ đồng, nhãn 61,3%; hai đoạn 186,743 (dư chi phí dở dang) + 4,582 (đã quyết toán, bàn giao); trục 2013–2016 với mốc 05/03/2013 (thành lập Ban, QĐ 45/QĐ-HĐQT), 31/12/2015, 20/01/2016 | Mục 2.1.2 (trang "Số liệu tổng quát") | 312; 191,325; 61,3%; 186,743; 4,582; 2013, 2016; 05/03/2013; 31/12/2015; 20/01/2016 | mục 2.1.1, mục 2.1.2, Bảng 2.6.1, Bảng 2.7, Bảng 2.1 |
| V2 | Thác nước TK 241 năm 2015: 121,586 → +69,739 → −4,582 → 186,743 | Trang Bảng 2.8 | như trên | Bảng 2.8 (dòng Cộng) |
| V3 | Thác nước B02-CĐT: 129,450 → +63,850 (đoạn tăng chia 60,650 tiền và 3,200 vật tư, thiết bị) → −4,582 → 188,717 | Trang 2.3 (biểu đồ) | như trên | Bảng 2.5, Bảng 2.6, mục 2.1.2 |
| V4 | F02: thanh 100% hai đoạn 102,590 (54,4%) và 86,127 (45,6%), tổng 188,717 | Trang 2.3 | như trên | Bảng 2.5, Bảng 2.6 |
| V5 | Bảng 2.2: hai cặp thanh 100% (tài sản ngắn/dài hạn, trong đó XDCB; nợ phải trả / vốn), kèm hình so sánh phân đôi và số lớn 93,6%, 94,6%, 28,4% | Trang Bảng 2.2 và trang biểu đồ Bảng 2.2 | 6,0%; 94,0%; 93,6%; 5,4%; 94,6%; 38,6%; 61,4%; 28,4%; 48,9%; 51,1% (+ số tuyệt đối trong tooltip) | Bảng 2.2 |
| V6 | Thanh ngang đã sắp xếp: TK 241 theo nội dung chi phí (60,5%; 23,3%; 5,9%; 5,2%; 3,1%; 2,0%) và theo hạng mục (44,2%; 16,2%; 16,2%; 10,0%; 8,8%; 4,6%); hạng mục 7 ghi riêng "số dư cuối năm \"-\"" | Trang Bảng 2.8, Bảng 2.9 | số dư cuối năm và % in sẵn | Bảng 2.8, Bảng 2.9 |
| V7 | Dumbbell 11 khoản chi phí Ban, 2014 → 2015; khoản 1 (1.018,4 · 962,3) tách hàng riêng với thang 0–1.100, 10 khoản còn lại thang 0–300; dòng tổng 2.146,45 / 2.010,3; số lớn "tăng 6,8%" và "47,4%" như bài | Trang Bảng 2.10 | 22 số của bảng + 2 tổng + 6,8%, 47,4% | Bảng 2.10, lời văn mục 2.4 |
| V8 | Cầu dòng tiền Hòa Phát 2024: 12,252; +6,608; (29,788); +17,815; 6,888 nghìn tỷ đồng; ghi chú tăng giảm thuần (5,365) và ghi chú "chưa gồm dòng ảnh hưởng của thay đổi tỷ giá… (Hình 2.9)" | Trang 2.3 | như trên | Bảng 2.5; Hình 2.9 (ảnh chứng từ có dòng "Ảnh hưởng của thay đổi tỷ giá…"), không lấy số từ dòng này |
| V9 | Hòa Phát 2024: doanh thu thuần 138,855 → giá vốn −120,358 → lợi nhuận gộp 18,498 (biên 13,3%); lợi nhuận trước thuế 13,694 và sau thuế 12,020 (8,7% doanh thu thuần) vẽ từ 0, không nối bậc; bảng đối chiếu bên cạnh: doanh thu tài chính 2,619, thu nhập khác 1,160, chi phí bán hàng 2,337, quản lý doanh nghiệp 1,546, tài chính 3,967 | Trang 2.4 (sau Bảng 2.7) | như trên | Bảng 2.7 |
| V10 | Bullet chart thời hạn BCTC năm: Hòa Phát 24/03/2025 · 83 ngày, vạch hạn 90 ngày; BQLDA vạch hạn 30 ngày, ghi "Lập ngày 20/01/2016 · đúng hạn trong vòng 30 ngày" (**không** đặt vị trí theo số ngày tự tính); kèm Hình 1.4 vẽ lại (quý 20 / 20 / 45; năm 30 / 90 / 30 ngày, chú thích (*) nguyên văn) | Trang 2.6.3; trang Hình 1.4 | như trên | Bảng 2.6.3; Hình 1.4 |
| V11 | Tài khoản chữ T theo từng nghiệp vụ (4 tab), số hiện dần theo thứ tự định khoản, mũi tên nối Nợ → Có, màu theo BQLDA/Doanh nghiệp; Hình 1.3 chạy từng bước (nút và phím Space) | Trang Bảng 1.5, Hình 1.3 | 2.000; 1.000; 50; 1.050 (triệu đồng) | Bảng 1.5, Hình 1.3 |
| V12 | Bản đồ 5 tiêu chí × 2 chế độ: bấm ô → lọc Bảng 1.4 đúng tiêu chí và chỉ hiện cột tương ứng; nút "Hiện lại toàn bộ bảng" | Trang Bảng 1.4 | không có số | Bảng 1.4 |
| V13 | Thẻ số nổi bật (serif lớn, đơn vị nhỏ, nguồn), đếm lên trong 1,1 giây khi cuộn tới: 188,717 tỷ đồng; 186,743 tỷ đồng; 93,6%; 94,6%; 28,4%; 61,3%; 83 ngày; 12,020 nghìn tỷ đồng (cùng 199,464 · 191,325 · 224,490 đã có ở mục 2.1.2) | Đầu các trang Bảng 2.2 (biểu đồ), 2.3, Bảng 2.8, 2.4, 2.6, 2.6.3 | như trên | Bảng 2.2, 2.5, 2.8, 2.7, 2.6.1, 2.6.3 |

Dòng thời gian văn bản pháp lý (2012–2026) và thanh tiến độ 61,3% của mục 2.6.1 được giữ, đổi màu theo bảng màu mới.

## Chưa làm được / bài thiếu số

- **V1:** bài không nêu ngày khởi công hay ngày kết thúc cụ thể ngoài "từ năm 2013 đến năm 2016"; trục chỉ đánh dấu năm và ba ngày bài có ghi.
- **V8:** bốn số không cộng khít 6,888 (12,252 + 6,608 − 29,788 + 17,815 = 6,887) vì báo cáo gốc còn dòng ảnh hưởng tỷ giá (Hình 2.9). Phần chữ của bài không ghi số này nên biểu đồ không thêm bước đó, chỉ ghi chú.
- **V9:** bài không nêu các khoản giữa lợi nhuận gộp và lợi nhuận trước thuế theo đúng cấu trúc báo cáo (có doanh thu tài chính, thu nhập khác, các chi phí nhưng không có chi phí khác, lãi/lỗ công ty liên kết…), nên lợi nhuận trước thuế và sau thuế vẽ thành cột độc lập từ 0, không làm thác nước nối liền; các khoản đã có số đặt ở bảng đối chiếu.
- **V10:** bài không ghi số ngày của BQLDA (chỉ "đúng hạn trong vòng 30 ngày"), nên BQLDA chỉ có vạch hạn và dấu tích, không có thanh độ dài.
- **V7:** dùng hai thang đo riêng (0–1.100 cho khoản 1, 0–300 cho 10 khoản còn lại) và ghi rõ trên hình, vì khoản 1 lớn hơn hẳn.
- Biểu đồ không vẽ được khi tắt JavaScript (khi đó vẫn còn bảng số gốc trong trang). Khi in, nút "Xem bảng số liệu" và bản đồ V12 bị ẩn.

## Bố cục theo bề rộng

- Khung biểu đồ hẹp hơn 480px (điện thoại): thác nước V2, V3, V8, V9 chuyển sang dạng **nằm ngang** (mỗi bước một hàng, nhãn trên thanh); đoạn tăng của V3 khi đó không tô hai màu mà ghi thành dòng "Tăng trong năm 63,850: 60,650 bằng tiền · 3,200 bằng vật tư, thiết bị".
- Dưới 640px: dumbbell V7, thanh V6, thời hạn V10, tiến độ V1, F02 đưa nhãn lên trên thanh và tự xuống dòng theo bề rộng thật.
