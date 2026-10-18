
/* ======================================================
   PRESENTATION MODE
   = the scrolling page + build steps + HUD + speaker notes.
   P / "Present ▶" to start; ? in presentation mode lists every key.
   Speaker notes: edit NOTES below (key = section id). They are only
   shown in the Presenter view window (S), never on the page or in print.
   To show a whole slide in one step, add data-build="all" to its <section>.
   ====================================================== */
const NOTES = {
  "home": ["Chào thầy cô và các bạn; nhóm 4 lớp Kinh tế Đầu tư 65.", "Đề tài: hiểu biết về Liên minh châu Âu, vai trò và ảnh hưởng của EU với khu vực, thế giới và Việt Nam.", "Giới thiệu nhanh 3 thành viên và phân công phần trình bày."],
  "contents": ["Bài gồm 3 chương và phần kết luận.", "Chương 1: cơ sở lý thuyết và tổng quan EU; Chương 2: vai trò của EU trong hội nhập khu vực và toàn cầu; Chương 3: ảnh hưởng của EU tới Việt Nam."],
  "introduction": ["EU là mô hình hội nhập khu vực sâu nhất: bắt đầu năm 1951 với 6 nước (than, thép), nay 27 thành viên.", "Với Việt Nam, EU vừa là thị trường xuất khẩu lớn, vừa là nguồn vốn, công nghệ và là bên đặt chuẩn, nhất là từ EVFTA và EVIPA.", "Nhóm dùng lý thuyết hội nhập, văn bản chính sách của EU, tài liệu học thuật và số liệu thương mại, đầu tư."],
  "ch1": ["Chương 1 có hai phần: cơ sở lý thuyết của hội nhập kinh tế khu vực (1.1) và tổng quan về EU (1.2)."],
  "c1-concept": ["Hội nhập kinh tế quốc tế: các nước giảm dần rào cản với hàng hóa, dịch vụ, vốn, con người, đôi khi cả chính sách.", "Hội nhập khu vực: các nước láng giềng tạo thị trường khu vực thống nhất hơn; mục tiêu là hiệu quả, mở rộng thị trường, sức cạnh tranh, và cả hòa bình, ổn định.", "Lưu ý mặt trái: cạnh tranh mạnh hơn với doanh nghiệp trong nước, chi phí điều chỉnh cho người lao động, phải chuyển một phần thẩm quyền chính sách."],
  "c1-levels": ["Năm cấp độ, mỗi cấp sâu hơn cấp trước: khu vực thương mại tự do, liên minh thuế quan, thị trường chung, liên minh kinh tế, liên minh kinh tế và tiền tệ.", "Liên minh chính trị là mức sâu hơn nữa nhưng hiếm khi đạt được.", "Đây không phải trình tự bắt buộc; khung này giúp giải thích vì sao EU hội nhập sâu hơn hẳn các tổ chức khác."],
  "c1-model": ["EU không chỉ là một khối thương mại mà là hội nhập đa chiều.", "Năm đặc điểm: thị trường chung châu Âu, chính sách chung, liên minh kinh tế và tiền tệ, thể chế siêu quốc gia, và ảnh hưởng ra bên ngoài (Brussels Effect)."],
  "c1-history": ["Hai quá trình song song: đào sâu (từ ECSC tới thị trường chung, đồng euro, thể chế siêu quốc gia) và mở rộng (từ 6 lên 28 rồi 27 thành viên).", "Các mốc chính: Tuyên bố Schuman 1950, Hiệp ước Rome 1957, Maastricht 1992–1993, đồng euro 1999/2002, mở rộng 2004, Lisbon 2009, Brexit 2020.", "Ý chính: EU chưa bao giờ là dự án thuần kinh tế; hợp tác kinh tế ban đầu là công cụ để giữ hòa bình."],
  "c1-institutions": ["Ủy ban châu Âu đề xuất luật và đại diện lợi ích chung; Nghị viện đại diện công dân; Hội đồng EU đại diện chính phủ các nước.", "Hội đồng châu Âu (nguyên thủ) định hướng chính trị; Tòa án Công lý bảo đảm áp dụng luật thống nhất; ECB điều hành chính sách tiền tệ khu vực euro.", "Điểm đặc trưng: kết hợp yếu tố siêu quốc gia và liên chính phủ."],
  "c1-principles": ["Mục tiêu theo Điều 3 TEU: hòa bình, không gian tự do, an ninh, công lý, thị trường nội khối, phát triển bền vững, gắn kết, vai trò toàn cầu.", "Nguyên tắc: giá trị nền tảng (Điều 2 TEU), trao quyền, bổ trợ (subsidiarity), tương xứng, đoàn kết, hợp tác chân thành.", "Mười chính sách cốt lõi biến cam kết thành hành động, từ thị trường chung, CAP tới chính sách đối ngoại và an ninh."],
  "ch2": ["Chương 2 đã được viết lại với hai nhánh: EU trong hội nhập khu vực (2.1) và EU trong hội nhập toàn cầu (2.2)."],
  "c2-economic": ["Hội nhập kinh tế là động lực của dự án châu Âu: Hiệp ước Paris 1951, Rome 1957; thuế nội khối xóa bỏ năm 1968.", "Đạo luật châu Âu thống nhất 1986: hoàn thiện thị trường nội khối đến cuối 1992 bằng công nhận lẫn nhau và gỡ gần 300 rào cản.", "Bảng 2.1: bốn quyền tự do (hàng hóa, dịch vụ, vốn, con người) và các công cụ hỗ trợ."],
  "c2-economic-b": ["Khoảng 450 triệu người tiêu dùng; thương mại nội khối 2025 khoảng 4,14 nghìn tỷ euro, tăng 2,6%.", "Khu vực đồng euro có 21 thành viên từ 1/1/2026 (Bulgaria), chiếm khoảng 82% GDP EU; còn 6 nước ngoài.", "Hình 2.1: thương mại nội khối luôn lớn hơn xuất hay nhập khẩu với bên ngoài; cán cân ngoại khối thâm hụt năm 2022 rồi thặng dư trở lại.", "Chính sách gắn kết chiếm khoảng một phần ba ngân sách: hội nhập 'tích cực', không chỉ gỡ rào cản."],
  "c2-political": ["Mục đích gốc là hòa bình: Tuyên bố Schuman 9/5/1950; EU nhận Nobel Hòa bình năm 2012.", "Mở rộng là công cụ mạnh nhất để lan tỏa ổn định; tiêu chí Copenhagen 1993.", "Hình 2.2: số thành viên từ 6 (1957) lên 28 (2013), còn 27 từ Brexit 2020 đến 2026."],
  "c2-waves": ["Bảng 2.2: các đợt mở rộng và bối cảnh, lớn nhất là năm 2004 với 10 nước.", "Ngoài mở rộng: chính sách láng giềng, CFSP/CSDP; NATO vẫn là khuôn khổ phòng thủ chính.", "Từ 2022: trừng phạt Nga, hỗ trợ Ukraine, kế hoạch ReArm Europe / Readiness 2030 tới 800 tỷ euro.", "Thách thức nội tại: Brexit, pháp quyền (Điều 7), yêu cầu đồng thuận."],
  "c2-trade": ["Chính sách thương mại chung là thẩm quyền độc quyền của EU: Ủy ban đàm phán cho cả 27 nước.", "EU chiếm khoảng 1/7 thương mại hàng hóa thế giới.", "Bảng 2.3: thặng dư 128 tỷ euro năm 2025; Trung Quốc là nguồn nhập khẩu lớn nhất (559,4 tỷ euro, 22,3%); Mỹ là thị trường xuất khẩu lớn nhất (21%)."],
  "c2-trade-balance": ["Hình 2.4: thâm hụt năng lượng tăng từ 226 lên 299 tỷ euro (2015–2025).", "Nhóm 'hàng chế tạo khác' chuyển từ thặng dư 11,3 tỷ sang thâm hụt 37,6 tỷ, phản ánh cạnh tranh nhập khẩu, nhất là từ Trung Quốc.", "Năm đối tác lớn nhất chiếm hơn nửa thương mại hàng hóa, nên đa dạng hóa là ưu tiên."],
  "c2-agreements": ["Bảng 2.4: các hiệp định 'thế hệ mới' từ Hàn Quốc (2011) tới Mercosur (áp dụng tạm thời từ 1/5/2026) và Ấn Độ (kết thúc đàm phán 27/1/2026).", "Việt Nam: EVFTA có hiệu lực từ 1/8/2020.", "EU cũng tăng công cụ tự vệ: sàng lọc FDI, chống cưỡng ép (2023), Chiến lược An ninh Kinh tế: 'tự chủ chiến lược mở'."],
  "c2-governance": ["EU ủng hộ chủ nghĩa đa phương hiệu quả, có mặt ở hầu hết diễn đàn lớn nhưng với tư cách khác nhau.", "Bảng 2.5: quan sát viên tăng cường tại Đại hội đồng LHQ từ 2011; thành viên đầy đủ WTO và G20; không phải thành viên IMF.", "Cơ quan Phúc thẩm WTO tê liệt từ 2019; EU thúc đẩy cơ chế phúc thẩm tạm thời."],
  "c2-development": ["EU và các nước thành viên cung cấp khoảng 40% ODA toàn cầu.", "Global Gateway (12/2021): huy động tới 300 tỷ euro đến 2027.", "Giới hạn: không có ghế ở IMF, Hội đồng Bảo an; đối ngoại cần đồng thuận; ảnh hưởng mạnh nhất qua luật, quy định và thị trường."],
  "c2-standards": ["'Hiệu ứng Brussels' (Bradford, 2020): doanh nghiệp áp chuẩn EU trên toàn cầu (de facto), chính phủ sao chép luật EU (de jure).", "Ví dụ: GDPR, REACH, CE marking, DSA/DMA, Đạo luật AI.", "Bảng 2.6: các công cụ từ ETS (2005) đến CBAM, giai đoạn chính thức từ 2026."],
  "c2-climate": ["Mục tiêu: giảm ít nhất 55% vào 2030, mục tiêu 90% cho 2040 do Ủy ban đề xuất, trung hòa khí hậu 2050.", "CBAM chuyển sang giai đoạn chính thức năm 2026; bị một số nước, nhất là Ấn Độ, phê phán là rào cản đơn phương.", "Ảnh hưởng mạnh nhất khi quyền lực quy định, đàm phán đa phương và hỗ trợ phát triển bổ trợ nhau."],
  "ch3": ["Chương 3 xét ảnh hưởng của EU tới Việt Nam: tổng quan quan hệ, ảnh hưởng kinh tế, ảnh hưởng rộng hơn, rồi cơ hội, thách thức và khuyến nghị."],
  "c3-numbers": ["Sáu con số tóm tắt quan hệ: thương mại hàng hóa €76.0 tỷ (2025, Eurostat); Việt Nam xuất sang EU 56,2 tỷ USD (2025).", "EU nhận khoảng 12–13% xuất khẩu của Việt Nam, là thị trường lớn thứ 3; khoảng 2.450 dự án FDI của EU (cuối 2022).", "20/27 nước đã phê chuẩn EVIPA (11/2025); hơn €560 triệu Global Gateway mới (3/2026). Ý chính: quan hệ trải rộng từ thương mại, đầu tư, pháp lý tới tài chính khí hậu."],
  "c3-milestones": ["Bảng 3.1: từ thiết lập quan hệ ngoại giao 1990 đến EVFTA có hiệu lực 1/8/2020.", "Năm 2026: nâng cấp thành Đối tác Chiến lược Toàn diện (29/1) và hơn 560 triệu euro Global Gateway (24/3).", "EVFTA là bước ngoặt: vượt ra ngoài cắt giảm thuế, kèm cam kết lao động, môi trường, sở hữu trí tuệ."],
  "c3-importance": ["Với Việt Nam: EU là thị trường xuất khẩu thứ 3 (khoảng 12–13%), nguồn nhập khẩu thứ 4, nguồn FDI thứ 6.", "Với EU: Việt Nam là đối tác hàng hóa lớn nhất trong ASEAN, nguồn nhập khẩu thứ 9, đối tác thương mại thứ 14 (2025).", "Bảng 3.2 tóm lợi ích hai bên về thương mại, đầu tư, mô hình kinh tế, chuyển đổi xanh, địa chính trị."],
  "c3-frameworks": ["Hai hiệp định ký cùng ngày 30/6/2019 tại Hà Nội.", "Ý kiến 2/15 của Tòa án EU (5/2017) buộc tách gói: EVFTA chỉ cần EU phê chuẩn, EVIPA cần đủ 27 nước.", "Bảng 3.3 so sánh phạm vi, cấu trúc, phê chuẩn, cơ chế giải quyết tranh chấp và tình trạng."],
  "c3-evfta": ["EVFTA là hiệp định thế hệ mới: hàng hóa, dịch vụ, mua sắm công, sở hữu trí tuệ (169 chỉ dẫn địa lý của EU, 39 của Việt Nam), chương phát triển bền vững.", "Bảng 3.4: EU xóa khoảng 84–86% dòng thuế ngay khi có hiệu lực, khoảng 99% sau 7 năm; Việt Nam xóa khoảng 65%, phần còn lại đến 2030.", "Cam kết bất đối xứng, có lợi cho Việt Nam."],
  "c3-evipa": ["EVIPA thay thế 21 hiệp định đầu tư song phương; dùng Hệ thống Tòa án Đầu tư.", "20/27 nước đã phê chuẩn, Ba Lan là nước thứ 20 (11/2025); Pháp trình dự luật ngày 27/7/2026.", "Theo các báo cáo mới nhất, EVIPA chưa có hiệu lực."],
  "c3-trade": ["Bảng 3.5 (Eurostat, euro): thương mại song phương tăng từ 45,6 tỷ (2019) lên 76,0 tỷ euro (2025), tăng 67%.", "Nhập khẩu của EU từ Việt Nam tăng 85%; thâm hụt của EU tăng hơn gấp đôi.", "Hình 3.1: số 2019 là ước tính (dấu *)."],
  "c3-trade-vn": ["Bảng 3.6 (số liệu Việt Nam, USD): xuất khẩu sang EU từ 35,8 lên 56,2 tỷ USD (+57%); thặng dư từ 21,8 lên 38,6 tỷ (+77%).", "Kênh tác động: ưu đãi thuế quan; khoảng 1,8 triệu C/O ưu đãi năm 2024; khảo sát EuroCham: 61% doanh nghiệp nhỏ và vừa coi giảm thuế là lợi ích chính.", "Lưu ý: hai bảng dùng hai nguồn, hai đơn vị khác nhau."],
  "c3-structure": ["Hai nền kinh tế bổ sung cho nhau.", "Năm 2025, máy móc và thiết bị vận tải chiếm khoảng 51% nhập khẩu của EU từ Việt Nam (32,4 tỷ euro); giày dép, quần áo, đồ gỗ khoảng 29%.", "EU xuất sang Việt Nam hàng hàm lượng công nghệ cao hơn: máy móc 36%, hóa chất và dược phẩm 26%."],
  "c3-investment": ["EU đã đầu tư hơn 27,8 tỷ USD vào khoảng 2.450 dự án đến cuối 2022, trên 60% vào chế tạo; là nguồn FDI thứ 6.", "Bảng 3.7: tỷ trọng của EU giảm từ khoảng 7,6% xuống khoảng 5,6% (ước tính, mốc thời gian khác nhau) vì nhà đầu tư châu Á tăng nhanh hơn.", "Chất lượng vốn quan trọng hơn quy mô: công nghệ, quản trị, chuẩn môi trường."],
  "c3-reform": ["Ba kênh: cơ cấu xuất khẩu và chuỗi giá trị, cải cách thể chế, chuyển đổi xanh.", "Bảng 3.8: rà soát pháp luật, minh bạch, mua sắm công, lao động và môi trường, sở hữu trí tuệ; khoảng 37% doanh nghiệp vẫn gặp chênh lệch trị giá hải quan.", "Câu hỏi dài hạn: Việt Nam có leo lên được nấc cao hơn trong chuỗi giá trị không."],
  "c3-broader": ["Ngoài thương mại và đầu tư, EU ảnh hưởng qua hai chiều: tiêu chuẩn, quy định và hợp tác phát triển.", "Gắn với cam kết phát thải ròng bằng 0 vào năm 2050 của Việt Nam."],
  "c3-standards": ["Chương 13 EVFTA: quyền lao động, môi trường, khí hậu, trách nhiệm xã hội; đối thoại qua Nhóm Tư vấn trong nước.", "Bảng 3.9: bảy lĩnh vực chuẩn, từ môi trường, lao động tới kinh tế tuần hoàn.", "Ảnh hưởng lan tới cả nhà cung cấp trong nước; gánh nặng lớn với doanh nghiệp nhỏ và vừa."],
  "c3-cooperation": ["EU viện trợ cho Việt Nam từ năm 1990; Hiệp định Đối tác và Hợp tác có hiệu lực năm 2016.", "Tháng 3/2026: gói hơn 560 triệu euro cho giao thông bền vững và năng lượng sạch.", "Bảng 3.10: sáu kênh hợp tác phát triển."],
  "c3-green": ["JETP: dự án thủy điện tích năng Bác Ái 1.200 MW, mở rộng thủy điện Trị An, điện gió gần bờ Trà Vinh.", "Ba cơ chế: tài chính, công nghệ, nâng cao năng lực thể chế.", "Bảng 3.11: tám hướng hỗ trợ chuyển đổi xanh."],
  "c3-opportunities": ["Năm cơ hội: tiếp cận thị trường và đa dạng hóa xuất khẩu; đầu tư và công nghệ chất lượng cao; hỗ trợ chuyển đổi xanh; cải thiện thể chế; phát triển nhân lực.", "Nhấn mạnh: tăng trưởng thương mại không chỉ do EVFTA mà còn do cầu thế giới và chuỗi cung ứng."],
  "c3-challenges": ["Năm thách thức: chi phí tuân thủ, năng lực trong nước hạn chế, áp lực điều chỉnh thể chế, vốn và hạ tầng cho chuyển đổi xanh, thiếu nhân lực chất lượng cao.", "Doanh nghiệp nhỏ và vừa chịu áp lực lớn nhất."],
  "c3-recommendations": ["Bảy khuyến nghị: hoàn tất EVIPA và quản lý thặng dư; vận hành định giá carbon; hệ thống truy xuất cho EUDR và IUU.", "Tăng tận dụng EVFTA; làm cho vốn JETP và Global Gateway khả thi về ngân hàng; thu hút FDI chất lượng.", "Với doanh nghiệp: đầu tư cho tuân thủ và đa dạng hóa."],
  "conclusion": ["EU là hệ thống hội nhập đa chiều: mạnh về cấu trúc (thị trường, luật lệ), hạn chế về chính trị (đồng thuận 27 nước, phụ thuộc NATO).", "Với Việt Nam: thương mại tăng từ khoảng 49,8 tỷ USD (2019) lên khoảng 68 tỷ USD (2024), nhưng lợi ích không tự đến.", "Thông điệp cuối: hội nhập chỉ bền khi có thể chế tốt và chính sách chia sẻ lợi ích, giảm chi phí."],
  "references": ["Danh mục 33 tài liệu theo báo cáo; không cần đọc, chỉ lướt qua."],
  "qa": ["Cảm ơn thầy cô và các bạn đã lắng nghe.", "Mời đặt câu hỏi; dùng G để mở tổng quan nếu cần quay lại slide nào."]
};

(function () {
  const body = document.body, root = document.documentElement;
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const BEH = REDUCE ? "instant" : "smooth";
  const IDLE_MS = 2500, MAX_STEPS = 6;
  const N = sections.length;
  const store = (kind, k, v) => { try { const s = kind === "s" ? sessionStorage : localStorage; if (v === undefined) return s.getItem(k); s.setItem(k, v); } catch (e) { return null; } };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const CH = { home: "Opening", contents: "Opening", ch1: "Chapter 1", ch2: "Chapter 2", ch3: "Chapter 3", conclusion: "Conclusion", references: "Conclusion" };
  const chapter = s => CH[chapterOf(s.id)] || "";
  function title(s) {
    if (s.id === "home") return "Cover";
    if (s.id === "qa") return "Thank you · Questions and answers";
    const h = s.querySelector(".h, h1, h2"), eb = s.querySelector(".eyebrow");
    const t = (h ? h.textContent : s.id).replace(/\s+/g, " ").trim();
    const n = eb && /^\d/.test(eb.textContent.trim()) ? eb.textContent.trim() + " " : eb && s.classList.contains("intro") ? eb.textContent.trim() + ": " : "";
    return (n + t).slice(0, 110);
  }

  /* ---------- build steps: top-level blocks of each section's .wrap ---------- */
  const kids = el => [...el.children].filter(c => !c.matches("noscript, script, template, .hero-anchor, .chno") && c.getAttribute("aria-hidden") !== "true");
  function groupsOf(sec) {
    let c = sec.querySelector(".wrap"); if (!c) return [[sec]];
    let k = kids(c);
    while (k.length === 1 && k[0].matches(".copy, .cols, .vz-split, div:not([class])")) { c = k[0]; k = kids(c); }
    if (sec.dataset.build === "all" || sec.matches(".hero, .intro") || sec.id === "contents" || sec.id === "references") return [k];
    const items = [];
    const flat = el => (el.matches(".copy, div:not([class])") && el.querySelector(":scope > .eyebrow, :scope > .h")) || el.matches('div[class="mt"]');   // layout-only wrappers
    const walk = el => flat(el) ? kids(el).forEach(walk) : items.push(el);
    k.forEach(walk);
    const G = []; let pend = [];
    items.forEach(el => {
      const last = G[G.length - 1];
      if (el.matches(".eyebrow, .h, h1, h2") || (el.matches(".lead") && last && last.head && G.length === 1 && !last.some(e => e.matches(".lead")))) { if (last && last.head) last.push(el); else { const g = [el]; g.head = true; G.push(g); } return; }
      if (el.matches(".src, .tnote") && last) { last.push(el); return; }       // sources and table notes stay with their table/figure
      if (el.matches(".cap")) { pend.push(el); return; }                         // a caption opens the next block (table, timeline)
      G.push([...pend, el]); pend = [];
    });
    if (pend.length) G.push(pend);
    while (G.length > MAX_STEPS) { const b = G.pop(); G[G.length - 1].push(...b); }
    const hasFig = G.some(g => g.some(e => e.matches("figure, .vz, .takeaway") || e.querySelector("figure, .vz")));
    if (G.length <= 2 && !hasFig) return [G.flat()];                           // little content and no figure: one step
    return G;
  }
  const PLAN = sections.map(groupsOf);
  PLAN.forEach(gs => gs.forEach(g => g.forEach(el => el.classList.add("pz-step"))));

  /* ---------- state ---------- */
  let active = false, cur = 0, k = 1, fsByUs = false, t0 = 0, target = 0, zoom = 1, jump = "", pop = null, bc = null;
  const timers = new Set(), offs = [];
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); };
  { const q = new URLSearchParams(location.search).get("t"); if (q && +q > 0) target = +q; }
  { const z = parseFloat(store("l", "eu-pres-zoom")); if (z >= .6 && z <= 1.8) zoom = z; }

  /* ---------- UI elements (created once, hidden until used) ---------- */
  const ui = (tag, id, html, attrs = {}) => { const e = document.createElement(tag); e.id = id; e.className = "pz-ui"; if (html) e.innerHTML = html; Object.entries(attrs).forEach(([a, v]) => e.setAttribute(a, v)); body.appendChild(e); return e; };
  const hud = ui("div", "pz-hud", `<div class="bar"><i></i></div><div class="row"><span class="n" aria-hidden="true"></span><span class="ch"></span><span class="tt"></span><span class="steps" aria-label="Build steps"></span><span class="clock" title="Elapsed or remaining time (T to set, R to reset)"></span><button type="button" data-act="grid" aria-label="Slide overview (G)">G</button><button type="button" data-act="help" aria-label="Keyboard shortcuts (?)">?</button><button type="button" data-act="exit" aria-label="Exit presentation mode (Esc)">✕</button></div>`, { role: "status" });
  const live = ui("div", "pz-live", "", { "aria-live": "polite", class: "sr-only" }); live.className = "sr-only pz-ui";
  const jumpEl = ui("div", "pz-jump", "", { hidden: "", "aria-hidden": "true" });
  const curtain = ui("div", "pz-curtain", "", { hidden: "", "aria-hidden": "true" });
  const laser = ui("div", "pz-laser", "", { hidden: "", "aria-hidden": "true" });
  const toastEl = ui("div", "pz-toast", "", { hidden: "", role: "alert" });
  const grid = ui("div", "pz-grid", "", { hidden: "", role: "dialog", "aria-modal": "true", "aria-label": "Tổng quan slide" }); grid.classList.add("pz-dlg");
  const timerDlg = ui("div", "pz-timer", "", { hidden: "", role: "dialog", "aria-modal": "true", "aria-label": "Đặt thời lượng" }); timerDlg.classList.add("pz-dlg", "pz-small");
  const help = ui("div", "pz-help", "", { hidden: "", role: "dialog", "aria-modal": "true", "aria-label": "Phím tắt trình chiếu" }); help.classList.add("pz-dlg");
  const [hudBar, hudN, hudCh, hudTt, hudSteps, hudClock] = ["i", ".n", ".ch", ".tt", ".steps", ".clock"].map(s => hud.querySelector(s));
  hud.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; e.stopPropagation(); ({ grid: openGrid, help: openHelp, exit: exit })[b.dataset.act](); });

  function toast(msg, ms = 6000) { toastEl.textContent = msg; toastEl.hidden = false; later(() => { toastEl.hidden = true; }, ms); }

  /* ---------- applying a state ---------- */
  const groupsAt = i => PLAN[i];
  function rect(els) { let t = 1e9, b = -1e9; els.forEach(e => { const r = e.getBoundingClientRect(); if (r.height) { t = Math.min(t, r.top); b = Math.max(b, r.bottom); } }); return { top: t, bottom: b }; }
  const hudH = () => 56;
  function scrollToY(y) { scrollTo({ top: Math.max(0, y), behavior: BEH }); }
  function paint(newly) {
    PLAN.forEach((gs, i) => gs.forEach((g, j) => {
      const show = i !== cur || j < k;
      g.forEach(el => {
        el.classList.toggle("pz-wait", !show);
        if (show && i === cur) { if (el.classList.contains("rv")) el.classList.add("in"); el.querySelectorAll(".rv").forEach(r => r.classList.add("in")); el.querySelectorAll(".vz-anim").forEach(v => v.classList.add("drawn")); }
      });
    }));
    if (newly && !REDUCE) {
      newly.forEach(el => { el.classList.remove("pz-fade"); el.classList.add("pz-new"); });
      later(() => newly.forEach(el => el.classList.add("pz-fade")), 60);
      later(() => newly.forEach(el => el.classList.remove("pz-new", "pz-fade")), 1300);
    }
  }
  function frame(mode) {           // mode: "top" | "end" | "block"
    const s = sections[cur], top = s.getBoundingClientRect().top + scrollY, h = s.offsetHeight, vh = innerHeight - hudH();
    if (mode === "top" || h <= innerHeight + 2) { scrollToY(top); return; }
    if (mode === "end") { scrollToY(top + h - innerHeight); return; }
    const g = groupsAt(cur)[k - 1], r = rect(g);
    if (r.bottom > vh - 8) scrollToY(scrollY + Math.min(r.bottom - vh + 24, r.top - 24));   // bring the new block fully into view (top first if it is taller than the screen)
    else if (r.top < 0) scrollToY(scrollY + r.top - 24);
  }
  function go(i, kk, mode) {
    i = Math.max(0, Math.min(N - 1, i));
    const changed = i !== cur; cur = i;
    const n = groupsAt(cur).length; k = Math.max(1, Math.min(n, kk == null ? 1 : kk));
    paint(null); frame(mode || "top");
    if (changed || mode) announce();
    update(); flashHud();
    store("s", "eu-pres-slide", sections[cur].id);
    try { history.replaceState(null, "", "#" + sections[cur].id); } catch (e) {}
  }
  // a block (or a one-step slide) taller than the screen is paged through before the next block appears
  function pageWithin(dir) {
    const vh = innerHeight - hudH(), r = rect(groupsAt(cur).slice(0, k).flat());
    if (dir > 0 && r.bottom > vh + 4) { scrollToY(scrollY + Math.min(vh * .8, r.bottom - vh + 24)); return true; }
    const g = rect(groupsAt(cur)[k - 1]);
    if (dir < 0 && g.top < -4 && (k > 1 || r.top < -4)) { scrollToY(scrollY + Math.max(-vh * .8, (k > 1 ? g.top : r.top) - 24)); return true; }
    return false;
  }
  function next() {
    if (pageWithin(1)) { flashHud(); return; }
    const n = groupsAt(cur).length;
    if (k < n) { k++; paint(groupsAt(cur)[k - 1]); frame("block"); update(); }
    else if (cur < N - 1) go(cur + 1, 1, "top");
  }
  function prev() {
    if (pageWithin(-1)) { flashHud(); return; }
    if (k > 1) { k--; paint(null); frame("block"); update(); }
    else if (cur > 0) go(cur - 1, groupsAt(cur - 1).length, "end");
  }
  function announce() { live.textContent = `Slide ${cur + 1} trên ${N}: ${title(sections[cur])}`; }

  /* ---------- HUD, clock ---------- */
  const mmss = ms => { const s = Math.max(0, Math.round(ms / 1000)); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); };
  function clock() {
    const el = performance.now() - t0;
    if (!target) return { text: mmss(el), cls: "" };
    const T = target * 60000, left = T - el;
    return { text: left >= 0 ? "−" + mmss(left) : "+" + mmss(-left) + " quá giờ", cls: el > T ? "over" : el >= .8 * T ? "warn" : "" };
  }
  function update() {
    const s = sections[cur], n = groupsAt(cur).length, c = clock();
    hudN.textContent = `${cur + 1} / ${N}`; hudCh.textContent = chapter(s); hudTt.textContent = title(s);
    hudSteps.textContent = n > 1 ? "●".repeat(k) + "○".repeat(n - k) : "";
    hudSteps.setAttribute("aria-label", `Bước ${k} trên ${n}`);
    hudClock.textContent = c.text; hudClock.className = "clock" + (c.cls ? " " + c.cls : "");
    hudBar.style.width = ((cur + (n > 1 ? (k - 1) / (n - 1) : 1)) / N * 100) + "%";
    push();
  }
  let idleT = 0;
  function flashHud() { body.classList.remove("pz-hud-off", "pz-idle"); clearTimeout(idleT); idleT = setTimeout(() => { if (active) body.classList.add("pz-hud-off", "pz-idle"); }, IDLE_MS); }

  /* ---------- zoom (+ / -) ---------- */
  function setZoom(z) { zoom = Math.round(Math.max(.6, Math.min(1.8, z)) * 100) / 100; root.style.setProperty("--pz-zoom", zoom); store("l", "eu-pres-zoom", String(zoom)); dispatchEvent(new Event("resize")); later(() => frame(k > 1 ? "block" : "top"), 200); toast(`Cỡ chữ ${Math.round(zoom * 100)}%`, 1500); }

  /* ---------- curtain, laser ---------- */
  function setCurtain(kind) { const off = !curtain.hidden && curtain.classList.contains("white") === (kind === "white"); curtain.hidden = off; curtain.classList.toggle("white", kind === "white"); }
  function moveLaser(e) { laser.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; }
  function toggleLaser() { const onL = laser.hidden; laser.hidden = !onL; body.classList.toggle("pz-laser", onL); }

  /* ---------- dialogs: overview (G) and help (?) ---------- */
  let dlg = null, dlgReturn = null;
  function openDlg(d) { closeDlg(); dlgReturn = document.activeElement; d.hidden = false; dlg = d; flashHud(); }
  function closeDlg() { if (!dlg) return; dlg.hidden = true; dlg = null; if (dlgReturn && dlgReturn.focus) dlgReturn.focus(); }
  function openGrid() {
    const groups = {}; sections.forEach((s, i) => (groups[chapter(s)] = groups[chapter(s)] || []).push(i));
    grid.innerHTML = `<h2>Tổng quan slide <button type="button" class="x" data-close aria-label="Đóng tổng quan (Esc)">Đóng (Esc)</button></h2>` +
      Object.entries(groups).map(([g, ids]) => `<h3>${esc(g)}</h3><div class="pz-tiles">${ids.map(i => `<button type="button" class="pz-tile" data-i="${i}"${i === cur ? ' aria-current="true"' : ""} aria-label="Slide ${i + 1}: ${esc(title(sections[i]))}"><b>${i + 1}</b>${esc(title(sections[i]))}</button>`).join("")}</div>`).join("");
    openDlg(grid); grid.querySelector(`[data-i="${cur}"]`).focus();
  }
  grid.addEventListener("click", e => { const t = e.target.closest(".pz-tile"); if (t) { closeDlg(); go(+t.dataset.i, 1, "top"); } else if (e.target.closest("[data-close]")) closeDlg(); e.stopPropagation(); });
  function gridKey(e) {
    const tiles = [...grid.querySelectorAll(".pz-tile")], i = tiles.indexOf(document.activeElement);
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault(); let j = i < 0 ? cur : i;
      if (e.key === "ArrowLeft") j--; else if (e.key === "ArrowRight") j++;
      else {                                                          // same column on the next / previous row
        const r0 = tiles[j].getBoundingClientRect(), dir = e.key === "ArrowDown" ? 1 : -1;
        const cand = tiles.map((t, n) => ({ n, r: t.getBoundingClientRect() })).filter(o => dir > 0 ? o.r.top > r0.top + 4 : o.r.top < r0.top - 4);
        if (cand.length) { const row = dir > 0 ? Math.min(...cand.map(o => o.r.top)) : Math.max(...cand.map(o => o.r.top)); j = cand.filter(o => Math.abs(o.r.top - row) < 4).sort((a, b) => Math.abs(a.r.left - r0.left) - Math.abs(b.r.left - r0.left))[0].n; }
      }
      tiles[Math.max(0, Math.min(tiles.length - 1, j))].focus(); tiles[Math.max(0, Math.min(tiles.length - 1, j))].scrollIntoView({ block: "nearest" });
      return true;
    }
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (i >= 0) { closeDlg(); go(+tiles[i].dataset.i, 1, "top"); } return true; }
    return trapTab(e, grid);
  }
  function trapTab(e, d) {
    if (e.key !== "Tab") return true;                                 // every other key is swallowed while a dialog is open
    const f = [...d.querySelectorAll("button, input")]; if (!f.length) return true;
    const i = f.indexOf(document.activeElement); e.preventDefault();
    f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); return true;
  }
  const KEYS = [
    [["P"], "Vào / thoát chế độ trình chiếu"], [["Esc"], "Đóng hộp thoại hoặc màn che; nếu không có thì thoát trình chiếu"],
    [["→", "Space", "PgDn", "↓"], "Hiện khối tiếp theo; hết khối thì sang slide kế (hoặc bấm/chạm nửa phải màn hình, vuốt sang trái)"],
    [["←", "Shift+Space", "PgUp", "↑"], "Ẩn khối vừa hiện; hết khối thì về slide trước (hoặc bấm/chạm nửa trái, vuốt sang phải)"],
    [["Home", "End"], "Slide đầu / slide cuối"], [["số", "Enter"], "Gõ số slide rồi Enter để nhảy tới (Backspace để sửa)"],
    [["G"], "Lưới tổng quan theo chương; mũi tên + Enter để chọn"], [["B", "."], "Màn hình đen (bấm lại để trở về)"], [["W"], "Màn hình trắng"],
    [["L"], "Bút laser"], [["S"], "Mở cửa sổ Presenter view (ghi chú, slide kế, đồng hồ)"], [["T"], "Đặt thời lượng mục tiêu (phút)"], [["R"], "Đặt lại đồng hồ"],
    [["+", "−"], "Phóng to / thu nhỏ chữ (lưu lại cho lần sau)"], [["F"], "Bật / tắt toàn màn hình"], [["?"], "Bảng này"]];
  function openHelp() {
    help.innerHTML = `<h2>Phím tắt trình chiếu <button type="button" class="x" data-close aria-label="Đóng (Esc)">Đóng (Esc)</button></h2><table class="pz-keys"><tbody>${KEYS.map(([ks, d]) => `<tr><th>${ks.map(x => `<kbd>${esc(x)}</kbd>`).join(" ")}</th><td>${esc(d)}</td></tr>`).join("")}</tbody></table>`;
    openDlg(help); help.querySelector("[data-close]").focus();
  }
  help.addEventListener("click", e => { if (e.target.closest("[data-close]")) closeDlg(); e.stopPropagation(); });
  // T: target duration, asked in the page (window.prompt would leave fullscreen)
  function openTimer() {
    timerDlg.innerHTML = `<h2>Thời lượng mục tiêu <button type="button" class="x" data-close aria-label="Đóng (Esc)">Đóng (Esc)</button></h2><label class="pz-field">Số phút (0 = tắt đếm ngược) <input type="number" min="0" max="240" step="1" value="${target || 15}" aria-label="Số phút"></label><p class="pz-hint">Enter để áp dụng · Esc để huỷ</p><button type="button" class="x" data-ok>Áp dụng</button>`;
    openDlg(timerDlg); const inp = timerDlg.querySelector("input"); inp.focus(); inp.select();
  }
  function applyTimer() { const m = parseFloat(String(timerDlg.querySelector("input").value).replace(",", ".")); target = m > 0 ? m : 0; closeDlg(); update(); toast(target ? `Mục tiêu ${target} phút` : "Đã tắt đếm ngược", 1500); }
  timerDlg.addEventListener("click", e => { if (e.target.closest("[data-ok]")) applyTimer(); else if (e.target.closest("[data-close]")) closeDlg(); e.stopPropagation(); });

  /* ---------- Presenter view (S): popup + postMessage (BroadcastChannel as fallback) ---------- */
  function state() {
    const s = sections[cur], nx = sections[cur + 1], n = groupsAt(cur).length, c = clock();
    return { type: "pz-state", idx: cur + 1, total: N, title: title(s), chapter: chapter(s), next: nx ? `${cur + 2}. ${title(nx)}` : "(hết)", notes: NOTES[s.id] || null, step: k, steps: n, clock: c.text, clockCls: c.cls, target };
  }
  function push() { const st = state(); try { if (pop && !pop.closed) pop.postMessage(st, "*"); } catch (e) {} try { bc && bc.postMessage(st); } catch (e) {} }
  const PV = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Presenter view · EU</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>
body{margin:0;font:16px/1.5 Inter,"Segoe UI",Arial,sans-serif;background:#00104A;color:#fff;display:grid;grid-template-rows:auto 1fr auto;min-height:100vh}
header,footer{display:flex;gap:16px;align-items:center;padding:12px 20px;background:#001A57}header b{color:#FFCC00}
main{display:grid;grid-template-columns:2fr 1fr;gap:20px;padding:20px}h1{font:600 26px/1.25 Georgia,serif;margin:0 0 6px}
.lbl{font:700 11px/1 Arial;letter-spacing:.14em;text-transform:uppercase;color:#FFCC00;margin:18px 0 8px}ul{margin:0;padding-left:22px;font-size:20px;line-height:1.5}li{margin-bottom:8px}
.next{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);border-radius:6px;padding:14px;font-size:17px}.muted{color:#C9D5F0}
.clock{font:700 34px/1 Arial;font-variant-numeric:tabular-nums;padding:8px 14px;border-radius:8px;background:rgba(255,255,255,.1)}.clock.warn{background:#FFCC00;color:#001A57}.clock.over{background:#C8102E}
button{font:600 18px/1 Arial;padding:14px 22px;border-radius:999px;border:1px solid rgba(255,255,255,.4);background:rgba(255,255,255,.1);color:#fff;cursor:pointer}button:hover,button:focus-visible{background:#FFCC00;color:#001A57}
.dots{color:#FFCC00;letter-spacing:.2em}.warn-msg{color:#FFCC00}@media(max-width:700px){main{grid-template-columns:1fr}}
</style></head><body><header><b id="pos">–</b><span id="chap" class="muted"></span><span style="flex:1"></span><span id="dots" class="dots" aria-label="Bước"></span><span id="clock" class="clock">00:00</span></header>
<main><section><div class="lbl">Slide hiện tại</div><h1 id="title">Đang chờ cửa sổ chính…</h1><div class="lbl">Ghi chú diễn giả</div><ul id="notes"></ul></section>
<aside><div class="lbl">Slide kế tiếp</div><div id="next" class="next muted">–</div><div class="lbl">Bước</div><div id="step" class="muted">–</div><p id="link" class="warn-msg" hidden>Mất liên lạc với cửa sổ chính.</p></aside></main>
<footer><button id="prev" aria-label="Slide hoặc bước trước">◀ Prev</button><button id="nextb" aria-label="Bước hoặc slide tiếp">Next ▶</button><span style="flex:1"></span><button id="black" aria-label="Màn hình đen">B</button><button id="reset" aria-label="Đặt lại đồng hồ">R</button></footer>
<script>
(function(){var bc=null;try{bc=new BroadcastChannel("eu-present")}catch(e){}
function send(c){var m={type:"pz-cmd",cmd:c};try{if(window.opener&&!window.opener.closed){window.opener.postMessage(m,"*");return}}catch(e){}try{bc&&bc.postMessage(m)}catch(e){}document.getElementById("link").hidden=false}
function show(s){if(!s||s.type!=="pz-state")return;document.getElementById("link").hidden=true;
document.getElementById("pos").textContent=s.idx+" / "+s.total;document.getElementById("chap").textContent=s.chapter;document.getElementById("title").textContent=s.title;
var ul=document.getElementById("notes");ul.innerHTML="";var ns=s.notes&&s.notes.length?s.notes:["(chưa có ghi chú)"];ns.forEach(function(t){var li=document.createElement("li");li.textContent=t;ul.appendChild(li)});
document.getElementById("next").textContent=s.next;document.getElementById("step").textContent="Bước "+s.step+" / "+s.steps;
document.getElementById("dots").textContent=s.steps>1?new Array(s.step+1).join("●")+new Array(s.steps-s.step+1).join("○"):"";
var c=document.getElementById("clock");c.textContent=s.clock;c.className="clock"+(s.clockCls?" "+s.clockCls:"");document.title=s.idx+"/"+s.total+" · Presenter view"}
window.addEventListener("message",function(e){show(e.data)});if(bc)bc.onmessage=function(e){show(e.data)};
document.getElementById("prev").onclick=function(){send("prev")};document.getElementById("nextb").onclick=function(){send("next")};
document.getElementById("black").onclick=function(){send("black")};document.getElementById("reset").onclick=function(){send("reset")};
document.addEventListener("keydown",function(e){var k=e.key;if(k==="ArrowRight"||k==="PageDown"||k===" "||k==="ArrowDown"){e.preventDefault();send(e.shiftKey&&k===" "?"prev":"next")}else if(k==="ArrowLeft"||k==="PageUp"||k==="ArrowUp"){e.preventDefault();send("prev")}else if(k==="b"||k==="B"||k==="."){send("black")}});
send("hello")})();
<\/script></body></html>`;
  function openPresenter() {
    if (pop && !pop.closed) { pop.focus(); push(); return; }
    let w = null;
    fsByUs = false;      // opening a window ends fullscreen in most browsers; that must not end the presentation (press F on the projector window to go fullscreen again)
    try { w = window.open("", "eu-presenter", "popup=yes,width=1000,height=700"); } catch (e) { w = null; }
    if (!w) { toast("Trình duyệt đã chặn cửa sổ Presenter view. Bấm biểu tượng chặn cửa sổ bật lên ở cuối thanh địa chỉ, chọn \"Luôn cho phép cửa sổ bật lên\" cho trang này, rồi bấm S lại.", 9000); return; }
    pop = w;
    try { pop.document.open(); pop.document.write(PV); pop.document.close(); }
    catch (e) { toast("Không ghi được vào cửa sổ Presenter view (trình duyệt chặn). Hãy cho phép cửa sổ bật lên rồi thử lại.", 8000); return; }
    later(push, 150);
    later(() => { if (active && !document.fullscreenElement) toast("Presenter view đã mở. Kéo cửa sổ này sang màn hình máy chiếu và bấm F để toàn màn hình; giữ Presenter view trên laptop.", 7000); }, 400);
  }
  function onMessage(e) {
    const d = e.data; if (!d || d.type !== "pz-cmd") return;
    if (d.cmd === "next") next(); else if (d.cmd === "prev") prev(); else if (d.cmd === "black") setCurtain("black"); else if (d.cmd === "reset") { t0 = performance.now(); update(); } else push();
  }

  /* ---------- pointer: idle cursor, laser, click halves, swipe ---------- */
  function onMove(e) { flashHud(); if (!laser.hidden) moveLaser(e); }
  function onClick(e) {
    if (dlg || e.defaultPrevented || e.button) return;
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (a) { const i = sections.findIndex(s => s.id === a.getAttribute("href").slice(1)); if (i >= 0) { e.preventDefault(); go(i, 1, "top"); } return; }
    if (e.target.closest && e.target.closest("a, button, input, select, textarea, label, summary, .vz-mark, .vz-btn, .vz-table, .vz-strip, .vz-stairs, #pz-hud, .pz-dlg")) return;
    if (!curtain.hidden) { curtain.hidden = true; return; }
    if (e.clientX >= innerWidth / 2) next(); else prev();
  }
  let tx = 0, ty = 0, swiped = false;
  function onTouchStart(e) { const t = e.changedTouches[0]; tx = t.clientX; ty = t.clientY; swiped = false; }
  function onTouchEnd(e) { const t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) { swiped = true; dx < 0 ? next() : prev(); } }
  function onFs() { if (!document.fullscreenElement && active && fsByUs) { fsByUs = false; exit(); } }

  /* ---------- enter / exit ---------- */
  function enter() {
    if (active) return;
    cur = Math.max(0, sections.indexOf(activeSection()));           // read the slide on screen before activeSection() switches to PZ.cur
    active = true; window.PZ.active = true;
    root.classList.add("pz-on"); root.style.setProperty("--pz-zoom", zoom); body.classList.add("presenting");
    if (!t0) t0 = performance.now();
    if (root.requestFullscreen && !document.fullscreenElement) root.requestFullscreen().then(() => { fsByUs = true; }).catch(() => {});
    try { bc = new BroadcastChannel("eu-present"); bc.onmessage = e => onMessage(e); } catch (e) { bc = null; }
    on(document, "mousemove", onMove, { passive: true }); on(document, "click", onClick, true);
    on(document, "touchstart", onTouchStart, { passive: true }); on(document, "touchend", onTouchEnd, { passive: true });
    on(document, "fullscreenchange", onFs); on(window, "message", onMessage); on(window, "beforeprint", exit); on(window, "pagehide", closePop);
    const tick = setInterval(update, 1000); offs.push(() => clearInterval(tick));
    dispatchEvent(new Event("resize"));
    go(cur, 1, "top"); announce();
  }
  function closePop() { try { if (pop && !pop.closed) pop.close(); } catch (e) {} pop = null; }
  function exit() {
    if (!active) return;
    const keep = sections[cur];
    active = false; window.PZ.active = false;
    closeDlg(); curtain.hidden = true; laser.hidden = true; jumpEl.hidden = true; toastEl.hidden = true; jump = "";
    body.classList.remove("presenting", "pz-idle", "pz-hud-off", "pz-laser"); root.classList.remove("pz-on"); root.style.removeProperty("--pz-zoom");
    document.querySelectorAll(".pz-wait, .pz-new").forEach(el => el.classList.remove("pz-wait", "pz-new", "pz-fade"));
    offs.splice(0).forEach(f => f()); timers.forEach(clearTimeout); timers.clear(); clearTimeout(idleT);
    closePop(); try { bc && bc.close(); } catch (e) {} bc = null;
    if (document.fullscreenElement && fsByUs) document.exitFullscreen().catch(() => {});
    fsByUs = false;
    dispatchEvent(new Event("resize"));
    keep.scrollIntoView({ behavior: "instant" }); onScroll();
    live.textContent = "Đã thoát chế độ trình chiếu";
  }

  /* ---------- keys: called first by the single keydown listener of the page ---------- */
  function key(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return false;
    const kk = e.key;
    if (active && dlg === timerDlg) {                                 // typing in the minutes field
      if (kk === "Escape") { e.preventDefault(); closeDlg(); } else if (kk === "Enter") { e.preventDefault(); applyTimer(); } else if (kk === "Tab") trapTab(e, timerDlg);
      return true;
    }
    if (e.target && e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return false;
    if (!active) { if (kk === "p" || kk === "P") { e.preventDefault(); enter(); return true; } return false; }
    if (dlg) {
      if (kk === "Escape" || (dlg === help && kk === "?") || (dlg === grid && (kk === "g" || kk === "G"))) { e.preventDefault(); closeDlg(); return true; }
      return dlg === grid ? gridKey(e) : trapTab(e, help);
    }
    if (/^[0-9]$/.test(kk)) { jump += kk; jumpEl.textContent = "→ " + jump; jumpEl.hidden = false; e.preventDefault(); return true; }
    if (jump && kk === "Backspace") { jump = jump.slice(0, -1); jumpEl.textContent = "→ " + jump; jumpEl.hidden = !jump; e.preventDefault(); return true; }
    if (jump && kk === "Enter") { const n = parseInt(jump, 10); jump = ""; jumpEl.hidden = true; e.preventDefault(); if (n >= 1 && n <= N) go(n - 1, 1, "top"); else toast(`Không có slide ${n} (1–${N})`, 2000); return true; }
    if (jump && kk === "Escape") { jump = ""; jumpEl.hidden = true; e.preventDefault(); return true; }
    let done = true;
    if (["ArrowRight", "ArrowDown", "PageDown"].includes(kk) || (kk === " " && !e.shiftKey)) next();
    else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(kk) || (kk === " " && e.shiftKey)) prev();
    else if (kk === "Home") go(0, 1, "top");
    else if (kk === "End") go(N - 1, 1, "top");
    else if (kk === "Escape") { if (!curtain.hidden) curtain.hidden = true; else if (!laser.hidden) toggleLaser(); else exit(); }
    else if (kk === "p" || kk === "P") exit();
    else if (kk === "g" || kk === "G") openGrid();
    else if (kk === "?" || (kk === "/" && e.shiftKey)) openHelp();
    else if (kk === "b" || kk === "B" || kk === ".") setCurtain("black");
    else if (kk === "w" || kk === "W") setCurtain("white");
    else if (kk === "l" || kk === "L") toggleLaser();
    else if (kk === "s" || kk === "S") openPresenter();
    else if (kk === "r" || kk === "R") { t0 = performance.now(); update(); toast("Đã đặt lại đồng hồ", 1500); }
    else if (kk === "t" || kk === "T") openTimer();
    else if (kk === "+" || kk === "=") setZoom(zoom + .1);
    else if (kk === "-" || kk === "_") setZoom(zoom - .1);
    else if (kk === "f" || kk === "F") { if (!document.fullscreenElement) root.requestFullscreen?.().then(() => { fsByUs = true; }).catch(() => {}); else { fsByUs = false; document.exitFullscreen?.(); } }
    else done = false;                                                 // other keys (Tab, F5, …) keep their default action
    if (done) e.preventDefault();
    return true;
  }

  /* ---------- public hooks, nav button, restore position ---------- */
  window.PZ = { active: false, key, enter, exit, get cur() { return cur; }, get step() { return k; }, steps: i => PLAN[i].length, plan: () => PLAN.map(g => g.length), rectOf: (i, j) => rect(PLAN[i][j]), title: i => title(sections[i]), next, prev, go: (i, kk) => go(i, kk, "top") };
  document.querySelectorAll(".pz-open").forEach(b => b.addEventListener("click", e => { e.preventDefault(); enter(); }));
  if (!location.hash) { const id = store("s", "eu-pres-slide"); const s = id && document.getElementById(id); if (s && sections.includes(s)) s.scrollIntoView({ behavior: "instant" }); }
})();
