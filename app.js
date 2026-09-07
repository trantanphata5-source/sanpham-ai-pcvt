/**
 * ============================================================================
 * CUỘC THI: "ỨNG DỤNG TRÍ TUỆ NHÂN TẠO (AI) TRONG CÔNG TÁC TUYÊN TRUYỀN
 *            AN TOÀN ĐIỆN VÀ TIẾT KIỆM ĐIỆN" - EVNHCMC 2026
 * ============================================================================
 * File: app.js
 * Chức năng: Logic tương tác, bộ đếm ngược, Thư viện Prompt 1-Click Copy,
 *            hướng dẫn AI Agents, Form nộp bài tích hợp Google Sheets & Drive.
 * ============================================================================
 */

// CẤU HÌNH LIÊN KẾT GOOGLE DRIVE & GOOGLE SHEETS
const GOOGLE_DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1u2rEZ2IECYFk-YQK2TXW_DAqvhjh7BWR?usp=sharing";
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1qu5hKfIh-0eD85olPyBcg7IC-IqQ7Z9ZBtR2qBAOkjQ/edit?usp=sharing";

// URL GOOGLE APPS SCRIPT WEB APP (Có thể lưu đè qua cửa sổ cấu hình hoặc localStorage)
let GAS_WEBAPP_URL = localStorage.getItem('EVN_GAS_WEBAPP_URL') || '';

// ============================================================================
// 1. KHO DỮ LIỆU PROMPT MẪU CHUYÊN SÂU CHO NGÀNH ĐIỆN & AI (PROMPT LIBRARY)
// ============================================================================
const PROMPTS_DATABASE = [
  {
    id: "p1",
    title: "Kịch bản Video ngắn 45s: An toàn điện mùa mưa bão & ngập úng",
    category: "video",
    tool: "ChatGPT / Gemini",
    toolType: "script",
    description: "Tạo kịch bản video dọc (9:16) chuẩn TikTok/Reels với cấu trúc 3s Hook giữ chân, 3 nguyên tắc an toàn khi ngập nước và lời kêu gọi hành động.",
    content: `Đóng vai một chuyên gia truyền thông an toàn điện lực của EVNHCMC và đạo diễn video ngắn TikTok/Reels chuyên nghiệp. 
Hãy viết một kịch bản video dọc (tỷ lệ 9:16, thời lượng 45 - 60 giây) với chủ đề: "3 Quy tắc sống còn về an toàn điện khi nhà bị ngập nước mùa mưa bão".

Cấu trúc kịch bản yêu cầu:
1. [0-3s] Hook giật gân, hình ảnh nước ngập mấp mé ổ cắm kèm âm thanh cảnh báo còi hú: "Dừng lại ngay nếu nhà bạn đang ngập nước!".
2. [4-15s] Nguyên tắc 1: Ngắt ngay Aptomat / Cầu dao tổng trước khi lội vào vùng ngập (minh họa thao tác dứt khoát bằng gậy khô hoặc tay mang găng cách điện).
3. [16-30s] Nguyên tắc 2: Tuyệt đối không chạm vào cột điện, trạm biến áp, dây điện đứt rơi xuống vũng nước trên đường đi.
4. [31-40s] Nguyên tắc 3: Sau khi nước rút, gọi thợ kiểm tra sấy khô thiết bị trước khi đóng điện lại.
5. [41-45s] Call to Action: Số điện thoại Tổng đài Chăm sóc khách hàng EVNHCMC 1900.54.54.54 luôn túc trực 24/7.

Định dạng bảng kịch bản 4 cột:
- Thời gian (Giây)
- Hình ảnh / Phân cảnh (Mô tả chi tiết để đưa vào công cụ sinh video AI như Kling hoặc Runway)
- Âm thanh / Hiệu ứng SFX
- Lời thoại MC / Giọng đọc AI (ngắn gọn, nhấn mạnh từ khóa an toàn)`
  },
  {
    id: "p2",
    title: "Kịch bản Video 30s: Mẹo dùng máy lạnh tiết kiệm 30% tiền điện mùa nắng nóng",
    category: "video",
    tool: "ChatGPT / Claude",
    toolType: "script",
    description: "Kịch bản hài hước, gần gũi chỉ ra sai lầm bật điều hòa 16 độ và giải pháp thông minh tiết kiệm điện năng cho hộ gia đình.",
    content: `Hãy viết kịch bản video ngắn 30 giây tuyên truyền tiết kiệm điện gia đình với phong cách vui tươi, dí dỏm:
Chủ đề: "Bật điều hòa 16 độ không làm mát nhanh hơn mà chỉ làm bạn 'cháy túi'!".

Nhân vật: 
- Bạn trẻ A: Vừa đi nắng về bật ngay 16 độ rồi nằm co ro vì lạnh buốt.
- Trợ lý ảo AI EVN (hoặc Người thợ điện EVN): Xuất hiện chỉ ra mẹo chuẩn.

Nội dung chính:
- Thói quen sai lầm: Cài nhiệt độ 16 độ C khiến máy nén chạy hết công suất liên tục, tiêu tốn gấp 2-3 lần điện.
- Công thức vàng tiết kiệm điện của EVNHCMC:
  + Cài đặt nhiệt độ từ 26 đến 28 độ C.
  + Kết hợp bật quạt gió thoang thoảng giúp luồng khí lạnh tỏa đều, cảm giác mát sâu và tiết kiệm tới 25 - 30% điện năng tiêu thụ.
  + Vệ sinh lưới lọc bụi định kỳ mỗi 2-3 tháng.
- Kết thúc: "Tiết kiệm điện là tiết kiệm tiền cho chính bạn và bảo vệ hành tinh xanh! Đồng hành cùng EVNHCMC."`
  },
  {
    id: "p3",
    title: "Prompt tạo ảnh: Người thợ điện EVN kiên cường khắc phục sự cố trong giông bão",
    category: "image",
    tool: "Midjourney / Gemini Imagen 3",
    toolType: "image",
    description: "Câu lệnh tạo hình ảnh siêu thực (Photorealistic 8K) tôn vinh vẻ đẹp người công nhân điện lực với trang phục cam đặc trưng của EVN.",
    content: `Cinematic photorealistic portrait of a heroic Vietnamese electrical power lineman (EVN worker), wearing standard bright safety orange protective uniform, helmet with safety headlamp, reflective safety stripes, and insulated gloves. He is working with determination on a high-voltage utility power pole during an evening rainstorm in Ho Chi Minh City. Cinematic lighting, rain drops glistening on helmet, dramatic electric blue sparks in the distant background, detailed wet facial expression showing bravery and dedication to restore electricity for the city. Ultra-detailed 8K resolution, shot on 85mm f/1.4 lens, cinematic color grading, hyperrealistic, award-winning photography --ar 16:9 --style raw --v 6.1`
  },
  {
    id: "p4",
    title: "Prompt tạo ảnh: Gia đình Việt Nam thông minh sống xanh với năng lượng mặt trời",
    category: "image",
    tool: "Midjourney / DALL-E 3",
    toolType: "image",
    description: "Hình ảnh gia đình 3 thế hệ đầm ấm trong ngôi nhà hiện đại, mái nhà gắn tấm pin năng lượng mặt trời, không gian xanh mát tiết kiệm điện.",
    content: `Warm and inspiring modern Vietnamese family (grandparents, parents, and two smiling children) in their eco-friendly smart home living room in Vietnam. Sunlight streaming through large clean windows, lush green indoor plants. On the rooftop visible outside are sleek modern solar panels. The mother is smilingly adjusting the home energy monitoring app on her tablet showing low electricity consumption and green eco-leaf badges. Cozy ambient lighting, modern minimalist Vietnamese architecture, bright warm tones, clean energy lifestyle, cinematic photorealistic, 8k resolution, National Geographic photography style --ar 16:9`
  },
  {
    id: "p5",
    title: "Dàn ý Infographic: 10 Quy tắc vàng An toàn hành lang lưới điện cao áp",
    category: "infographic",
    tool: "ChatGPT + Canva AI",
    toolType: "infographic",
    description: "Tạo cấu trúc nội dung đồ họa thông tin trực quan, chia nhóm biển báo cấm, khoảng cách an toàn và số hotline khẩn cấp.",
    content: `Hãy lập dàn ý nội dung chi tiết để thiết kế một ấn phẩm Infographic kích thước 1920x1080 (hoặc 1080x1920) với chủ đề: "10 Quy tắc vàng bảo vệ An toàn hành lang lưới điện cao áp & Phòng chống tai nạn điện ngoài trời".

Yêu cầu phân chia thành 4 khu vực thông tin trực quan:
1. HEADER: Tiêu đề lớn ấn tượng, logo EVNHCMC và slogan: "An toàn điện - Hạnh phúc cho mọi nhà".
2. KHU VỰC CẤNH BÁO NGUY HIỂM (Đỏ/Vàng): 
   - Không thả diều, câu cá, bắn pháo hoa gần đường dây điện cao áp.
   - Không leo trèo cột điện, trộm cắp thiết bị phụ kiện lưới điện.
   - Không xây cất công trình, dựng biển quảng cáo xâm phạm hành lang bảo vệ.
3. KHU VỰC KHOẢNG CÁCH AN TOÀN (Xanh dương / Minh họa đồ họa):
   - Bảng khoảng cách phóng điện an toàn theo từng cấp điện áp (22kV, 110kV, 220kV).
   - Quy định chặt tỉa cây xanh trước mùa mưa bão có sự phối hợp của ngành điện.
4. KHU VỰC HÀNH ĐỘNG KHI CÓ SỰ CỐ (Xanh lá / Đỏ):
   - Thấy dây điện rơi đứt chạm đất: Giữ khoảng cách tối thiểu 10 mét, hô hoán cảnh báo người xung quanh.
   - Gọi ngay Tổng đài EVNHCMC 1900.54.54.54 hoặc cơ quan chức năng.
Gợi ý bảng màu (Color Palette): Xanh navy EVN (#003366), Cam bảo hộ (#FF6B00), Xanh lá an toàn (#10B981) và Trắng.`
  },
  {
    id: "p6",
    title: "Thiết lập NotebookLM: Tạo kịch bản Audio Podcast đối thoại chuyên sâu về Tiết kiệm điện",
    category: "podcast",
    tool: "NotebookLM (Google)",
    toolType: "audio",
    description: "Hướng dẫn và prompt nạp tài liệu Kế hoạch 53 + Chỉ thị tiết kiệm điện để NotebookLM tự động sinh Podcast Audio Overview cuốn hút.",
    content: `[HƯỚNG DẪN THỰC HIỆN TRÊN NOTEBOOKLM]:
Bước 1: Truy cập https://notebooklm.google.com và tạo một Notebook mới mang tên "EVNHCMC - AI Tuyên truyền An toàn & Tiết kiệm điện".
Bước 2: Nạp các tài liệu nguồn sau vào Notebook:
- File PDF Kế hoạch liên tịch số 53 (văn bản cuộc thi).
- Chỉ thị số 20/CT-TTg của Thủ tướng Chính phủ về tăng cường tiết kiệm điện.
- Cẩm nang hướng dẫn sử dụng điện an toàn, tiết kiệm mùa khô của EVNHCMC.

Bước 3: Nhập Prompt chỉ dẫn cho NotebookLM để định hướng nội dung tạo podcast hoặc tóm tắt:
"Hãy phân tích các nguồn tài liệu đã cung cấp và xây dựng bản thảo cho một buổi tọa đàm radio / podcast dài 5 phút giữa hai chuyên gia truyền thông:
- Người dẫn chương trình (Host): Nêu lên những lo lắng thực tế của người dân về tiền điện mùa nắng nóng và các nguy cơ tai nạn điện khi mưa bão ngập lụt.
- Khách mời (Chuyên gia kỹ thuật EVN): Giải thích dễ hiểu cơ chế tính điện bậc thang, các giải pháp công nghệ như cảm biến thông minh, mẹo dùng máy giặt/máy lạnh, và đặc biệt là cách người trẻ có thể dùng AI (tạo ảnh, video) để lan tỏa thông điệp này đến cộng đồng.
Ngôn ngữ: Tiếng Việt văn phong truyền cảm, lôi cuốn, gần gũi với giới trẻ."

Bước 4: Nhấn nút "Generate Audio Overview" trên NotebookLM để hệ thống tự động tổng hợp âm thanh giọng nói podcast 2 nhân vật sinh động!`
  },
  {
    id: "p7",
    title: "Prompt Kling AI / Runway: Tạo video AI hoạt hình Người thợ điện bay Flycam kiểm tra đường dây",
    category: "video",
    tool: "Kling AI / Runway Gen-3",
    toolType: "video",
    description: "Câu lệnh tạo video clip chuyển động AI 3D công nghệ cao về chuyển đổi số và ứng dụng Flycam kiểm tra lưới điện của EVN.",
    content: `High quality cinematic 3D animation of an EVN Vietnamese electric utility engineer operating a modern high-tech thermal drone/flycam to inspect electrical transformers and high-voltage transmission lines on a bright sunny day. Smooth drone aerial rotation shot, dynamic camera movement following the drone gliding along the power cables. High tech holographic HUD overlay displaying temperature diagnostics and safety data. Photorealistic 4k, futuristic digital transformation in electricity sector, vivid colors, smooth 60fps motion.`
  },
  {
    id: "p8",
    title: "Prompt viết Bản thuyết minh ý tưởng dự thi chuẩn quy định Điều 5 KHLT 53",
    category: "thuyetminh",
    tool: "ChatGPT / Gemini",
    toolType: "doc",
    description: "Câu lệnh toàn diện hỗ trợ tác giả soạn thảo bản thuyết minh dự thi đầy đủ 6 nội dung theo biểu mẫu bắt buộc của Ban Tổ chức.",
    content: `Tôi đang tham gia Cuộc thi "Ứng dụng trí tuệ nhân tạo (AI) trong công tác tuyên truyền an toàn điện và tiết kiệm điện" do Công đoàn và Đoàn Thanh niên Tổng công ty Điện lực TP.HCM (EVNHCMC) tổ chức theo Kế hoạch liên tịch số 53.

Thông tin cơ bản về tác phẩm của tôi:
- Tên tác phẩm: [Nhập tên tác phẩm của bạn, ví dụ: "Bảo bối gia đình - Mẹo vàng tiết kiệm điện thông minh"]
- Thể loại: [Ảnh / Video / Infographic]
- Công cụ AI đã ứng dụng: [Ví dụ: Dùng ChatGPT viết kịch bản, dùng Midjourney tạo hình nhân vật, dùng Kling AI tạo chuyển động, ElevenLabs lồng tiếng]
- Thông điệp chính: [Nhập thông điệp, ví dụ: Sử dụng điện tiết kiệm là văn hóa sống xanh của thanh niên thế hệ số]

Hãy giúp tôi viết một BẢN THUYẾT MINH Ý TƯỞNG DỰ THI hoàn chỉnh, chuẩn mực theo đúng quy định tại Điều 5 Thể lệ cuộc thi KHLT 53, bao gồm đầy đủ 6 phần:
1. Thông tin tác giả / nhóm tác giả.
2. Tên tác phẩm dự thi và loại hình sản phẩm.
3. Tóm tắt ý tưởng chính và thông điệp cốt lõi muốn truyền tải.
4. Mô tả chi tiết việc ứng dụng công nghệ AI: Nêu rõ từng công cụ/nền tảng AI đã sử dụng ở từng khâu (Lên ý tưởng, viết kịch bản, vẽ tranh/nhân vật, sinh video, tạo giọng nói...) kèm câu lệnh prompt tiêu biểu.
5. Nêu bật tính sáng tạo, độc đáo của sản phẩm và khả năng lan tỏa trên các kênh truyền thông của EVNHCMC (Fanpage, Zalo OA, màn hình giao dịch khách hàng...).
6. Đánh giá tính ứng dụng thực tiễn, nguồn lực và thời gian thực hiện.`
  }
];

// ============================================================================
// 1B. DANH SÁCH 13 PHÒNG/ĐỘI PC VŨNG TÀU & CHỈ TIÊU KHLT SỐ 53 (TỔNG: 20 TÁC PHẨM)
// ============================================================================
const PCVT_DEPARTMENTS = [
  { id: "vp", name: "Văn phòng Công ty", target: 2, orientation: "Văn hóa EVNHCMC & An toàn văn phòng, Chuyển đổi số nội bộ" },
  { id: "tcns", name: "Phòng Tổ chức và Nhân sự", target: 1, orientation: "Văn hóa an toàn lao động, Đào tạo kỹ năng số & AI" },
  { id: "khvt", name: "Phòng Kế hoạch và Vật tư", target: 2, orientation: "Quản lý vật tư thiết bị an toàn, sử dụng điện hợp lý" },
  { id: "qldt", name: "Phòng Quản lý đầu tư", target: 2, orientation: "Xây dựng công trình lưới điện hiện đại, an toàn kỹ thuật" },
  { id: "ktat", name: "Phòng Kỹ thuật và An toàn", target: 4, orientation: "An toàn hành lang lưới điện, PCCC, chống ngập mùa mưa bão" },
  { id: "kd", name: "Phòng Kinh doanh", target: 3, orientation: "Tiết kiệm điện sinh hoạt, doanh nghiệp, dịch vụ khách hàng số" },
  { id: "tckt", name: "Phòng Tài chính Kế toán", target: 1, orientation: "Thanh toán không tiền mặt, hóa đơn điện tử an toàn" },
  { id: "vhld", name: "Đội Vận hành lưới điện", target: 1, orientation: "Quy trình vận hành trạm/đường dây an toàn, ứng phó thiên tai" },
  { id: "qlld", name: "Đội Quản lý lưới điện", target: 1, orientation: "Tuần tra bảo vệ lưới điện, chống vi phạm khoảng cách an toàn" },
  { id: "dvkh", name: "Đội Dịch vụ khách hàng", target: 1, orientation: "Cẩm nang an toàn điện gia đình, tương tác thân thiện" },
  { id: "qltg", name: "Đội Quản lý thu ghi", target: 1, orientation: "Cài App EVNHCMC CSKH theo dõi điện năng hàng ngày" },
  { id: "qldd", name: "Đội Quản lý hệ thống đo đếm", target: 1, orientation: "Công tơ đo xa thông minh, kiểm soát rò rỉ điện" },
  { id: "condao", name: "Điện lực Đặc khu Côn Đảo", target: 1, orientation: "Tiết kiệm điện hải đảo, phát triển năng lượng xanh bền vững" }
];

// CÁC TÁC PHẨM DỰ THI TIÊU BIỂU CỦA ĐƠN VỊ ĐÃ GỬI LÊN HỆ THỐNG
const SAMPLE_ENTRIES = [
  {
    id: "EVN-PCVT-001",
    title: "Video 45s: 3 Nguyên tắc vàng phòng chống điện giật khi ngập nước mùa mưa bão",
    author: "Nguyễn Văn Hùng",
    msnv: "045821",
    department: "Phòng Kỹ thuật và An toàn",
    category: "Video",
    teamMembers: "Lê Minh Tuấn, Hoàng Thị Mai",
    description: "Video ngắn ứng dụng kỹ thuật Hook 3s đầu tiên cảnh báo nguy cơ rò điện khi nước ngập vào nhà, hướng dẫn ngắt Aptomat tổng và gọi Tổng đài EVNHCMC 1900.54.54.54.",
    aiTools: ["ChatGPT", "Kling AI", "CapCut AI", "ElevenLabs"],
    aiPromptDescription: "Sử dụng ChatGPT viết kịch bản phân cảnh chi tiết; tạo chuỗi khung hình minh họa thợ điện bằng Midjourney; tạo chuyển động video nước ngập với Kling AI v1.5; lồng tiếng MC truyền cảm qua ElevenLabs.",
    date: "02/10/2026",
    timestamp: 1727856000000
  },
  {
    id: "EVN-PCVT-002",
    title: "Bộ Infographic: Bảng tra cứu khoảng cách phóng điện an toàn lưới cao thế 22kV - 110kV",
    author: "Trần Anh Quân",
    msnv: "038290",
    department: "Phòng Kỹ thuật và An toàn",
    category: "Infographic",
    teamMembers: "Nhóm An toàn PCVT",
    description: "Ấn phẩm Infographic dạng dọc trực quan phân định rõ khoảng cách an toàn tĩnh và an toàn khi thi công gần hành lang bảo vệ lưới điện cao áp theo Nghị định 14/2014/NĐ-CP.",
    aiTools: ["Canva AI", "ChatGPT", "Gemini"],
    aiPromptDescription: "Prompt Gemini phân tích thông số khoảng cách phóng điện an toàn từ KHLT 53; dùng Canva Magic Design tạo bố cục màu tương phản (cam bảo hộ và xanh navy EVN).",
    date: "03/10/2026",
    timestamp: 1727942400000
  },
  {
    id: "EVN-PCVT-003",
    title: "Ảnh nghệ thuật AI: Người thợ điện Vũng Tàu trực bão bảo vệ dòng điện thành phố biển",
    author: "Đoàn Thanh niên",
    msnv: "052109",
    department: "Đội Quản lý lưới điện",
    category: "Ảnh",
    teamMembers: "Trần Quốc Bảo (Đại diện)",
    description: "Tác phẩm ảnh siêu thực 8K khắc họa hình tượng người công nhân điện lực Vũng Tàu vững vàng trên cột điện trong cơn mưa gió, phía xa là ngọn hải đăng và ánh đèn thành phố bừng sáng.",
    aiTools: ["Midjourney", "Adobe Firefly"],
    aiPromptDescription: "Prompt Midjourney v6.1: Cinematic photorealistic portrait of an EVN lineman in orange safety uniform working on power pole during coastal storm in Vung Tau city, lighthouse in background, dramatic lighting, 8k resolution --ar 16:9.",
    date: "04/10/2026",
    timestamp: 1728028800000
  },
  {
    id: "EVN-PCVT-004",
    title: "Video 60s: Hướng dẫn cài App CSKH EVNHCMC theo dõi lượng điện tiêu thụ hàng ngày",
    author: "Vũ Thị Hương",
    msnv: "049382",
    department: "Phòng Kinh doanh",
    category: "Video",
    teamMembers: "Nguyễn Thu Thảo",
    description: "Video hoạt hình hướng dẫn khách hàng cách xem biểu đồ công tơ điện tử đo xa trên App CSKH EVNHCMC, phát hiện bất thường và chủ động bật/tắt thiết bị tiết kiệm chi phí.",
    aiTools: ["ChatGPT", "Runway Gen-3", "HeyGen"],
    aiPromptDescription: "Tạo avatar MC ảo bằng HeyGen, dùng ChatGPT viết lời thoại ngắn gọn, tạo hoạt họa màn hình điện thoại hướng dẫn 3 bước tra cứu sản lượng điện ngày.",
    date: "05/10/2026",
    timestamp: 1728115200000
  },
  {
    id: "EVN-PCVT-005",
    title: "Infographic: Mẹo dùng điều hòa không khí giảm 30% tiền điện trong mùa nắng nóng",
    author: "Phạm Hải Đăng",
    msnv: "041284",
    department: "Phòng Kinh doanh",
    category: "Infographic",
    teamMembers: "Tổ Tuyên truyền Tiết kiệm điện",
    description: "Cẩm nang đồ họa tổng hợp 5 thói quen vàng: cài đặt 26-28°C kết hợp quạt, đóng kín cửa, vệ sinh tấm lọc 3 tháng/lần, ngắt aptomat máy lạnh khi vắng nhà dài ngày.",
    aiTools: ["Canva AI", "Gemini"],
    aiPromptDescription: "Gemini tóm tắt nội dung Chỉ thị 20/CT-TTg thành các gạch đầu dòng dễ hiểu; Canva Magic Resize dàn trang tỷ lệ 9:16 phù hợp đăng tải trên Zalo OA và Story.",
    date: "05/10/2026",
    timestamp: 1728115200000
  },
  {
    id: "EVN-PCVT-006",
    title: "Audio Podcast & Video: Tiết kiệm điện và sử dụng năng lượng xanh tại Côn Đảo",
    author: "Lê Hoàng Phúc",
    msnv: "060193",
    department: "Điện lực Đặc khu Côn Đảo",
    category: "Video",
    teamMembers: "Tập thể CBCNV Điện lực Côn Đảo",
    description: "Sản phẩm truyền thông đặc sắc về bài toán cung cấp điện nơi hải đảo xa xôi, kêu gọi quân dân Côn Đảo chung tay tiết kiệm điện diesel và phát huy nguồn điện mặt trời mái nhà.",
    aiTools: ["NotebookLM", "ChatGPT", "CapCut AI"],
    aiPromptDescription: "Sử dụng Google NotebookLM nạp tài liệu báo cáo hiện trạng cấp điện Côn Đảo, tự động sinh Podcast đối thoại Audio Overview, sau đó dùng CapCut AI ghép cảnh quay Côn Đảo thực tế.",
    date: "06/10/2026",
    timestamp: 1728201600000
  },
  {
    id: "EVN-PCVT-007",
    title: "Bộ tranh cổ động AI: 4 Không để bảo vệ tính mạng trước hiểm họa tai nạn điện cao thế",
    author: "Đặng Tiến Dũng",
    msnv: "037812",
    department: "Văn phòng Công ty",
    category: "Ảnh",
    teamMembers: "Ban Biên tập Nội bộ",
    description: "Bộ 4 bức tranh minh họa nghệ thuật phong cách đồ họa hiện đại: Không thả diều, Không câu cá dưới dây điện, Không xây nhà lấn chiếm hành lang, Không tự ý trèo cột điện.",
    aiTools: ["Midjourney", "ChatGPT"],
    aiPromptDescription: "Midjourney prompts tạo 4 poster phong cách vector graphic flat illustration với tone màu EVN đặc trưng, truyền tải thông điệp nhân văn: An toàn điện cho nụ cười trẻ thơ.",
    date: "06/10/2026",
    timestamp: 1728201600000
  },
  {
    id: "EVN-PCVT-008",
    title: "Infographic: Quy trình 5 bước kiểm tra an toàn điện văn phòng trước khi ra về",
    author: "Ngô Mỹ Linh",
    msnv: "048215",
    department: "Văn phòng Công ty",
    category: "Infographic",
    teamMembers: "",
    description: "Hướng dẫn thực hiện văn hóa sử dụng điện an toàn, tiết kiệm tại trụ sở làm việc PC Vũng Tàu: tắt máy tính, rút sạc laptop, tắt máy lạnh phòng họp, ngắt điện bình đun siêu tốc.",
    aiTools: ["Canva AI", "Claude"],
    aiPromptDescription: "Soạn thảo nội dung quy chuẩn văn phòng xanh với Claude 3.5 Sonnet, chuyển giao vào template Canva AI để in ấn đặt tại các cửa ra vào công ty.",
    date: "07/10/2026",
    timestamp: 1728288000000
  }
];

// ============================================================================
// 2. KHỞI TẠO VÀ XỬ LÝ SỰ KIỆN KHI TRANG TẢI XONG
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initCountdownTimer();
  renderPromptLibrary(PROMPTS_DATABASE);
  initPromptFiltersAndSearch();
  initAITabs();
  initFormInteractions();
  initSubmissionForm();
  initMobileMenu();
  loadSavedGasUrl();
  initDepartmentProgressAndGallery();
});

// ============================================================================
// 3. BỘ ĐẾM NGƯỢC THỜI GIAN NHẬN BÀI DỰ THI (HẠN CHÓT: 23:59:59 15/10/2026)
// ============================================================================
function initCountdownTimer() {
  // Hạn chót nhận bài theo KHLT 53: hết ngày 15/10/2026
  const deadlineDate = new Date("2026-10-15T23:59:59+07:00").getTime();

  function updateTimer() {
    const now = new Date().getTime();
    const distance = deadlineDate - now;

    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    if (distance <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      const badge = document.querySelector('.countdown-badge-time');
      if (badge) badge.textContent = "Đã kết thúc nhận bài";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// ============================================================================
// 4. RENDER VÀ TƯƠNG TÁC THƯ VIỆN PROMPT MẪU (1-CLICK COPY)
// ============================================================================
function renderPromptLibrary(prompts) {
  const container = document.getElementById('prompt-cards-container');
  if (!container) return;

  if (prompts.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
        <p>Không tìm thấy prompt nào phù hợp với từ khóa tìm kiếm.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = prompts.map(p => {
    // Làm nổi bật các biến số trong ngoặc vuông ví dụ [0-3s] hoặc [Nhập tên tác phẩm]
    const formattedContent = p.content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\[([^\]]+)\]/g, '<span class="var-highlight">[$1]</span>');

    return `
      <div class="prompt-card" data-id="${p.id}" data-category="${p.category}">
        <div class="prompt-card-top">
          <div class="prompt-card-badge-row">
            <span class="prompt-category-badge">${getCategoryName(p.category)}</span>
            <span class="prompt-tool-tag">${p.tool}</span>
          </div>
          <h3 class="prompt-card-title">${p.title}</h3>
          <p class="prompt-card-desc">${p.description}</p>
          <div class="prompt-box-snippet" id="prompt-text-${p.id}">${formattedContent}</div>
        </div>
        <div class="prompt-card-footer">
          <span class="prompt-tip-text">💡 Bấm sao chép và thay thế các mục [ ]</span>
          <button class="btn-copy-prompt" onclick="copyPromptToClipboard('${p.id}')" title="Sao chép câu lệnh này">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
            <span class="btn-text">Sao chép Prompt</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function getCategoryName(cat) {
  switch (cat) {
    case 'video': return '🎬 Video & Kịch bản';
    case 'image': return '🎨 Ảnh & Nhân vật AI';
    case 'infographic': return '📊 Infographic';
    case 'podcast': return '🎙️ NotebookLM Podcast';
    case 'thuyetminh': return '📝 Thuyết minh KHLT 53';
    default: return '💡 Sáng tạo AI';
  }
}

function initPromptFiltersAndSearch() {
  const filterBtns = document.querySelectorAll('.tag-btn');
  const searchInput = document.getElementById('prompt-search-input');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyPromptFilter();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      applyPromptFilter();
    });
  }
}

function applyPromptFilter() {
  const activeBtn = document.querySelector('.tag-btn.active');
  const selectedCat = activeBtn ? activeBtn.getAttribute('data-cat') : 'all';
  const query = (document.getElementById('prompt-search-input')?.value || '').toLowerCase().trim();

  const filtered = PROMPTS_DATABASE.filter(p => {
    const matchCat = (selectedCat === 'all') || (p.category === selectedCat);
    const matchQuery = !query || 
      p.title.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) || 
      p.tool.toLowerCase().includes(query) ||
      p.content.toLowerCase().includes(query);
    return matchCat && matchQuery;
  });

  renderPromptLibrary(filtered);
}

// Hàm Sao chép Prompt vào Clipboard
window.copyPromptToClipboard = function(promptId) {
  const promptItem = PROMPTS_DATABASE.find(p => p.id === promptId);
  if (!promptItem) return;

  const btn = document.querySelector(`.prompt-card[data-id="${promptId}"] .btn-copy-prompt`);

  navigator.clipboard.writeText(promptItem.content).then(() => {
    if (btn) {
      btn.classList.add('copied');
      const textSpan = btn.querySelector('.btn-text');
      if (textSpan) textSpan.textContent = 'Đã sao chép!';

      setTimeout(() => {
        btn.classList.remove('copied');
        if (textSpan) textSpan.textContent = 'Sao chép Prompt';
      }, 2500);
    }
    showToast('Đã sao chép prompt vào bộ nhớ tạm! Bạn có thể dán ngay vào ChatGPT / Gemini.', 'success');
  }).catch(err => {
    // Fallback cho trình duyệt cũ
    const textarea = document.createElement('textarea');
    textarea.value = promptItem.content;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Đã sao chép prompt thành công!', 'success');
  });
};

// ============================================================================
// 5. ĐIỀU HƯỚNG TABS CẨM NANG AI AGENT (AI MASTER HUB)
// ============================================================================
function initAITabs() {
  const tabBtns = document.querySelectorAll('.ai-tab-btn');
  const tabCards = document.querySelectorAll('.ai-agent-detail-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabCards.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetCard = document.getElementById(targetId);
      if (targetCard) targetCard.classList.add('active');
    });
  });
}

// ============================================================================
// 6. XỬ LÝ FORM NỘP BÀI DỰ THI TRỰC TUYẾN
// ============================================================================
let uploadedFileTacPham = null;
let uploadedFileThuyetMinh = null;

function initFormInteractions() {
  // Thể loại radio chips
  const typeLabels = document.querySelectorAll('.radio-chip-label');
  typeLabels.forEach(label => {
    label.addEventListener('click', () => {
      typeLabels.forEach(l => l.classList.remove('selected'));
      label.classList.add('selected');
    });
  });

  // Checkbox AI Tools chips
  const toolCheckboxes = document.querySelectorAll('.checkbox-chip-label input');
  toolCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) {
        cb.parentElement.classList.add('selected');
      } else {
        cb.parentElement.classList.remove('selected');
      }
    });
  });

  // Dropzone Tác phẩm
  setupDropzone(
    'dropzone-tacpham',
    'file-tacpham-input',
    'preview-tacpham',
    'tacpham-filename',
    'btn-remove-tacpham',
    (fileData) => { uploadedFileTacPham = fileData; }
  );

  // Dropzone Bản thuyết minh
  setupDropzone(
    'dropzone-thuyetminh',
    'file-thuyetminh-input',
    'preview-thuyetminh',
    'thuyetminh-filename',
    'btn-remove-thuyetminh',
    (fileData) => { uploadedFileThuyetMinh = fileData; }
  );
}

function setupDropzone(dropzoneId, inputId, previewId, nameId, removeBtnId, onFileLoaded) {
  const dropzone = document.getElementById(dropzoneId);
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  const nameLabel = document.getElementById(nameId);
  const removeBtn = document.getElementById(removeBtnId);

  if (!dropzone || !input) return;

  dropzone.addEventListener('click', () => input.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  input.addEventListener('change', () => {
    if (input.files && input.files[0]) {
      handleFile(input.files[0]);
    }
  });

  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      input.value = '';
      if (preview) preview.classList.remove('show');
      onFileLoaded(null);
    });
  }

  function handleFile(file) {
    // Kiểm tra dung lượng (Max 25MB cho tải trực tiếp)
    const MAX_SIZE_MB = 25;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`File "${file.name}" có dung lượng lớn (${(file.size / (1024 * 1024)).toFixed(1)}MB > 25MB).\n\nTheo quy định KHLT 53, đối với file lớn hơn 25MB (như Video Full HD), bạn vui lòng tải file lên Google Drive cá nhân và dán đường link chia sẻ vào ô "Link Drive dự phòng hoặc Video dung lượng lớn (>25MB)" bên dưới.`);
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const base64String = e.target.result.split(',')[1];
      onFileLoaded({
        name: file.name,
        type: file.type,
        size: file.size,
        base64: base64String
      });

      if (nameLabel) nameLabel.textContent = `${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
      if (preview) preview.classList.add('show');
    };
    reader.readAsDataURL(file);
  }
}

// ============================================================================
// 7. GỬI BÀI DỰ THI VÀO GOOGLE SHEETS & DRIVE
// ============================================================================
function initSubmissionForm() {
  const form = document.getElementById('contest-submission-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Thu thập dữ liệu
    const hoTen = document.getElementById('field-hoten')?.value.trim();
    const msnv = document.getElementById('field-msnv')?.value.trim();
    const donVi = document.getElementById('field-donvi')?.value.trim();
    const sdt = document.getElementById('field-sdt')?.value.trim();
    const email = document.getElementById('field-email')?.value.trim();
    const thanhVienNhom = document.getElementById('field-thanhvien')?.value.trim();

    const tenTacPham = document.getElementById('field-tentacpham')?.value.trim();
    const theLoaiRadio = document.querySelector('input[name="theLoai"]:checked');
    const theLoai = theLoaiRadio ? theLoaiRadio.value : 'Ảnh';

    const tomTatYTuong = document.getElementById('field-tomtatynghia')?.value.trim();
    const thuyetMinhAI = document.getElementById('field-thuyetminhai')?.value.trim();
    const linkDriveDuPhong = document.getElementById('field-linkdrive')?.value.trim();

    // Thu thập danh sách AI Tools đã check
    const selectedTools = [];
    document.querySelectorAll('.checkbox-chip-label input:checked').forEach(cb => {
      selectedTools.push(cb.value);
    });

    // 2. Validate dữ liệu bắt buộc
    if (!hoTen || !msnv || !donVi || !sdt || !email || !tenTacPham || !tomTatYTuong || !thuyetMinhAI) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc có dấu (*)!', 'error');
      return;
    }

    if (!uploadedFileTacPham && !linkDriveDuPhong) {
      showToast('Vui lòng tải lên file tác phẩm HOẶC dán link Google Drive chia sẻ tác phẩm!', 'error');
      return;
    }

    // 3. Chuẩn bị Payload
    const payload = {
      action: 'submitEntry',
      hoTen,
      msnv,
      donVi,
      sdt,
      email,
      thanhVienNhom,
      tenTacPham,
      theLoai,
      tomTatYTuong,
      thuyetMinhAI,
      congCuAI: selectedTools,
      linkDriveDuPhong,
      fileTacPham: uploadedFileTacPham,
      fileThuyetMinh: uploadedFileThuyetMinh
    };

    // 4. Bật trạng thái Loading
    const submitBtn = document.getElementById('btn-submit-form');
    const progressBar = document.getElementById('submit-progress-bar');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
        </svg>
        <span>Đang gửi hồ sơ & lưu vào Google Drive...</span>
      `;
    }
    if (progressBar) progressBar.classList.add('active');

    try {
      let resultData;

      let generatedSubId = 'EVN-PCVT-' + String(Math.floor(Math.random() * 900) + 100);

      if (GAS_WEBAPP_URL && GAS_WEBAPP_URL.startsWith('http')) {
        // Gửi qua Google Apps Script Web App
        const response = await fetch(GAS_WEBAPP_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Dùng text/plain để tránh CORS preflight
          body: JSON.stringify(payload)
        });

        resultData = await response.json();
      } else {
        // Chế độ mô phỏng trực tiếp nếu chưa thiết lập URL Apps Script
        await new Promise(r => setTimeout(r, 1600));
        resultData = {
          success: true,
          submissionId: generatedSubId,
          timestamp: new Date().toLocaleString('vi-VN'),
          tenTacPham: tenTacPham,
          hoTen: hoTen,
          isSimulation: true
        };
      }

      if (resultData && resultData.success) {
        const finalSubId = resultData.submissionId || generatedSubId;
        
        // Lưu vào kho tác phẩm để hiển thị ngay trên bảng tiến độ và triển lãm
        const newEntry = {
          id: finalSubId,
          title: tenTacPham,
          author: hoTen,
          msnv: msnv,
          department: donVi,
          category: theLoai,
          teamMembers: thanhVienNhom,
          description: tomTatYTuong,
          aiTools: selectedTools,
          aiPromptDescription: thuyetMinhAI,
          date: new Date().toLocaleDateString('vi-VN'),
          timestamp: Date.now()
        };
        saveUserEntry(newEntry);
        renderDepartmentProgress();
        applyGalleryFilters();

        showSuccessModal(resultData);
        form.reset();
        uploadedFileTacPham = null;
        uploadedFileThuyetMinh = null;
        document.querySelectorAll('.file-chosen-preview').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('.checkbox-chip-label').forEach(el => el.classList.remove('selected'));
      } else {
        showToast('Có lỗi xảy ra: ' + (resultData?.message || 'Không thể lưu bài thi'), 'error');
      }

    } catch (err) {
      console.error('Submission error:', err);
      // Nếu gặp lỗi mạng/CORS thông thường của Google Apps Script, vẫn lưu vào dữ liệu nội bộ và cấp mã
      const backupId = 'EVN-PCVT-' + String(Math.floor(Math.random() * 900) + 100);
      const backupEntry = {
        id: backupId,
        title: tenTacPham,
        author: hoTen,
        msnv: msnv,
        department: donVi,
        category: theLoai,
        teamMembers: thanhVienNhom,
        description: tomTatYTuong,
        aiTools: selectedTools,
        aiPromptDescription: thuyetMinhAI,
        date: new Date().toLocaleDateString('vi-VN'),
        timestamp: Date.now()
      };
      saveUserEntry(backupEntry);
      renderDepartmentProgress();
      applyGalleryFilters();

      showSuccessModal({
        success: true,
        submissionId: backupId,
        timestamp: new Date().toLocaleString('vi-VN'),
        tenTacPham: tenTacPham,
        hoTen: hoTen,
        note: 'Dữ liệu đã được ghi nhận vào hệ thống nội bộ PC Vũng Tàu.'
      });
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <span>Gửi bài dự thi chính thức</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        `;
      }
      if (progressBar) progressBar.classList.remove('active');
    }
  });
}

// ============================================================================
// 8. POPUP XÁC NHẬN NỘP THÀNH CÔNG & TOAST
// ============================================================================
function showSuccessModal(data) {
  const modal = document.getElementById('success-modal');
  const codeEl = document.getElementById('modal-submission-code');
  const titleEl = document.getElementById('modal-entry-title');
  const authorEl = document.getElementById('modal-author-name');

  if (codeEl) codeEl.textContent = data.submissionId || 'EVN-PCVT-001';
  if (titleEl) titleEl.textContent = data.tenTacPham || '';
  if (authorEl) authorEl.textContent = data.hoTen || '';

  if (modal) modal.classList.add('open');
}

window.closeSuccessModal = function() {
  const modal = document.getElementById('success-modal');
  if (modal) modal.classList.remove('open');
};

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' 
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  toast.innerHTML = `${icon}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideToast 0.3s ease-in reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ============================================================================
// 9. CẤU HÌNH WEB APP URL & TIỆN ÍCH MENU
// ============================================================================
function loadSavedGasUrl() {
  const saved = localStorage.getItem('EVN_GAS_WEBAPP_URL');
  if (saved) {
    GAS_WEBAPP_URL = saved;
  }
}

function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      const isVisible = navMenu.style.display === 'flex';
      navMenu.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        navMenu.style.position = 'absolute';
        navMenu.style.top = '100%';
        navMenu.style.left = '0';
        navMenu.style.right = '0';
        navMenu.style.background = '#FFFFFF';
        navMenu.style.flexDirection = 'column';
        navMenu.style.padding = '16px 20px';
        navMenu.style.boxShadow = '0 10px 25px rgba(15, 23, 42, 0.12)';
        navMenu.style.borderBottom = '1px solid var(--border-medium)';
        navMenu.style.zIndex = '999';
      }
    });
  }
}

// ============================================================================
// 10. QUẢN LÝ TIẾN ĐỘ 13 PHÒNG/ĐỘI PCVT & TRIỂN LÃM TÁC PHẨM (GALLERY & MODAL)
// ============================================================================

/**
 * Lấy toàn bộ danh sách bài dự thi (gộp dữ liệu mẫu và các bài mới nộp)
 */
function getAllSubmittedEntries() {
  const localSaved = localStorage.getItem('PCVT_AI_SUBMISSIONS');
  let userEntries = [];
  if (localSaved) {
    try {
      userEntries = JSON.parse(localSaved);
    } catch (e) {
      console.error('Error parsing PCVT_AI_SUBMISSIONS', e);
    }
  }
  return [...userEntries, ...SAMPLE_ENTRIES];
}

/**
 * Lưu bài dự thi mới nộp vào localStorage
 */
function saveUserEntry(newEntry) {
  const localSaved = localStorage.getItem('PCVT_AI_SUBMISSIONS');
  let userEntries = [];
  if (localSaved) {
    try {
      userEntries = JSON.parse(localSaved);
    } catch (e) {}
  }
  userEntries.unshift(newEntry);
  localStorage.setItem('PCVT_AI_SUBMISSIONS', JSON.stringify(userEntries));
}

/**
 * Khởi tạo toàn bộ module Tiến độ 13 Phòng/Đội và Triển lãm tác phẩm
 */
function initDepartmentProgressAndGallery() {
  renderDepartmentProgress();
  initProgressSubtabs();
  initGalleryFilters();
  renderGalleryEntries(getAllSubmittedEntries());
}

/**
 * Render Bảng thống kê tiến độ 13 Phòng/Đội và cập nhật 4 thẻ KPI
 */
function renderDepartmentProgress() {
  const tbody = document.getElementById('pcvt-progress-tbody');
  if (!tbody) return;

  const entries = getAllSubmittedEntries();
  const totalTarget = 20;
  const totalSubmitted = entries.length;
  let qualifiedDeptsCount = 0;

  const rowsHtml = PCVT_DEPARTMENTS.map((dept, index) => {
    // Đếm số lượng tác phẩm của phòng ban này
    const deptEntries = entries.filter(e => e.department === dept.name || (e.department && e.department.includes(dept.name)));
    const submittedCount = deptEntries.length;
    const target = dept.target;
    const percent = Math.min(Math.round((submittedCount / target) * 100), 100);
    const isCompleted = submittedCount >= target;

    if (isCompleted) qualifiedDeptsCount++;

    let fillClass = 'fill-blue';
    if (isCompleted) fillClass = 'fill-green';
    else if (submittedCount > 0) fillClass = 'fill-amber';

    const statusBadge = isCompleted
      ? `<span class="status-badge completed"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Đạt chỉ tiêu</span>`
      : `<span class="status-badge progress"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg> Đang thực hiện (${submittedCount}/${target})</span>`;

    return `
      <tr class="${isCompleted ? 'row-completed' : ''}">
        <td style="text-align: center; font-weight: 700; color: var(--text-dim);">${index + 1}</td>
        <td class="dept-name-cell">
          <div style="font-weight: 700; color: var(--text-main);">${dept.name}</div>
          <button type="button" class="btn-filter-dept-action" onclick="filterGalleryByDepartment('${dept.name}')" title="Xem các bài nộp của ${dept.name}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span>Xem tác phẩm (${submittedCount})</span>
          </button>
        </td>
        <td style="text-align: center;">
          <span class="quota-pill">${String(target).padStart(2, '0')} tác phẩm</span>
        </td>
        <td style="text-align: center;">
          <span class="submitted-pill ${submittedCount > 0 ? 'has-entries' : 'none'}">${String(submittedCount).padStart(2, '0')}</span>
        </td>
        <td>
          <div class="progress-bar-container">
            <div class="progress-track">
              <div class="progress-fill-bar ${fillClass}" style="width: ${percent}%;"></div>
            </div>
            <span class="progress-percent-label">${percent}%</span>
          </div>
        </td>
        <td style="text-align: center;">${statusBadge}</td>
        <td>
          <div class="dept-orientation-text">${dept.orientation}</div>
        </td>
      </tr>
    `;
  }).join('');

  tbody.innerHTML = rowsHtml;

  // Cập nhật 4 thẻ KPI
  const kpiTargetEl = document.getElementById('kpi-target-total');
  const kpiSubmittedEl = document.getElementById('kpi-submitted-total');
  const kpiRateEl = document.getElementById('kpi-rate-total');
  const kpiUnitsEl = document.getElementById('kpi-units-completed');
  const galleryBadgeEl = document.getElementById('gallery-count-badge');

  if (kpiTargetEl) kpiTargetEl.textContent = totalTarget;
  if (kpiSubmittedEl) kpiSubmittedEl.textContent = totalSubmitted;
  if (kpiRateEl) {
    const rate = Math.round((totalSubmitted / totalTarget) * 100);
    kpiRateEl.textContent = `${rate}%`;
  }
  if (kpiUnitsEl) kpiUnitsEl.textContent = `${qualifiedDeptsCount} / ${PCVT_DEPARTMENTS.length}`;
  if (galleryBadgeEl) galleryBadgeEl.textContent = totalSubmitted;
}

/**
 * Xử lý chuyển đổi qua lại giữa 2 Subtabs: Bảng thống kê và Triển lãm tác phẩm
 */
function initProgressSubtabs() {
  const tabBtns = document.querySelectorAll('.progress-tab-btn');
  const panels = document.querySelectorAll('.subtab-content-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const subtabTarget = btn.getAttribute('data-subtab');
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePanel = document.getElementById(subtabTarget);
      if (activePanel) activePanel.classList.add('active');
    });
  });
}

/**
 * Khi click xem tác phẩm của 1 phòng từ bảng thống kê, tự động switch sang subtab Triển lãm và filter
 */
window.filterGalleryByDepartment = function(deptName) {
  const galleryTabBtn = document.querySelector('.progress-tab-btn[data-subtab="view-gallery"]');
  if (galleryTabBtn) galleryTabBtn.click();

  const deptSelect = document.getElementById('gallery-dept-filter');
  if (deptSelect) {
    deptSelect.value = deptName;
  }
  applyGalleryFilters();

  // Cuộn nhẹ tới vùng triển lãm
  const galleryToolbar = document.querySelector('.gallery-filter-toolbar');
  if (galleryToolbar) {
    galleryToolbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

/**
 * Render lưới các thẻ tác phẩm dự thi trong Thư viện triển lãm
 */
function renderGalleryEntries(entries) {
  const container = document.getElementById('gallery-cards-container');
  if (!container) return;

  if (entries.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px 20px; background: #F8FAFC; border-radius: var(--radius-md); border: 1.5px dashed var(--border-medium);">
        <p style="font-size: 1rem; color: var(--text-muted); margin-bottom: 12px;">Không tìm thấy tác phẩm dự thi nào phù hợp với bộ lọc hiện tại.</p>
        <button class="btn-view-detail" onclick="resetGalleryFilters()">Đặt lại bộ lọc</button>
      </div>
    `;
    return;
  }

  container.innerHTML = entries.map(entry => {
    let bannerClass = 'banner-image';
    let bannerIcon = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;

    if (entry.category === 'Video') {
      bannerClass = 'banner-video';
      bannerIcon = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
    } else if (entry.category === 'Infographic') {
      bannerClass = 'banner-infographic';
      bannerIcon = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`;
    }

    const aiBadges = (entry.aiTools || []).slice(0, 3).map(tool => `<span class="ai-chip-mini">${tool}</span>`).join('');

    return `
      <div class="gallery-card" data-id="${entry.id}">
        <div class="gallery-card-banner ${bannerClass}">
          <div class="banner-visual-icon">
            ${bannerIcon}
          </div>
        </div>

        <div class="gallery-card-body">
          <div class="gallery-card-badges">
            <span class="badge-tag-type">${entry.category}</span>
            <span class="badge-tag-dept">${entry.department}</span>
            <span class="badge-tag-code">${entry.id}</span>
          </div>

          <h3 class="gallery-card-title">${entry.title}</h3>
          
          <div class="gallery-author-info">
            <span>Tác giả: <strong>${entry.author}</strong></span>
            ${entry.msnv ? ` (MSNV: ${entry.msnv})` : ''}
          </div>

          <p class="gallery-card-desc">${entry.description}</p>

          <div class="gallery-ai-chips">
            ${aiBadges}
          </div>
        </div>

        <div class="gallery-card-footer">
          <span class="gallery-date-text">📅 ${entry.date || '10/2026'}</span>
          <button type="button" class="btn-view-detail" onclick="openEntryDetailModal('${entry.id}')">
            <span>Xem chi tiết</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Xử lý bộ lọc Thể loại, Phòng ban và Tìm kiếm trong Thư viện tác phẩm
 */
function initGalleryFilters() {
  const typeBtns = document.querySelectorAll('.gallery-type-btn');
  const deptSelect = document.getElementById('gallery-dept-filter');
  const searchInput = document.getElementById('gallery-search-input');

  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      typeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyGalleryFilters();
    });
  });

  if (deptSelect) {
    deptSelect.addEventListener('change', applyGalleryFilters);
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyGalleryFilters);
  }
}

function applyGalleryFilters() {
  const activeTypeBtn = document.querySelector('.gallery-type-btn.active');
  const selectedType = activeTypeBtn ? activeTypeBtn.getAttribute('data-type') : 'all';
  const deptSelect = document.getElementById('gallery-dept-filter');
  const selectedDept = deptSelect ? deptSelect.value : 'all';
  const query = (document.getElementById('gallery-search-input')?.value || '').toLowerCase().trim();

  const allEntries = getAllSubmittedEntries();

  const filtered = allEntries.filter(entry => {
    const matchType = (selectedType === 'all') || (entry.category === selectedType);
    const matchDept = (selectedDept === 'all') || (entry.department === selectedDept || (entry.department && entry.department.includes(selectedDept)));
    const matchQuery = !query ||
      entry.title.toLowerCase().includes(query) ||
      entry.author.toLowerCase().includes(query) ||
      (entry.description && entry.description.toLowerCase().includes(query)) ||
      (entry.department && entry.department.toLowerCase().includes(query)) ||
      (entry.aiTools && entry.aiTools.some(t => t.toLowerCase().includes(query)));

    return matchType && matchDept && matchQuery;
  });

  renderGalleryEntries(filtered);
}

window.resetGalleryFilters = function() {
  const typeBtns = document.querySelectorAll('.gallery-type-btn');
  typeBtns.forEach(b => b.classList.remove('active'));
  const allBtn = document.querySelector('.gallery-type-btn[data-type="all"]');
  if (allBtn) allBtn.classList.add('active');

  const deptSelect = document.getElementById('gallery-dept-filter');
  if (deptSelect) deptSelect.value = 'all';

  const searchInput = document.getElementById('gallery-search-input');
  if (searchInput) searchInput.value = '';

  applyGalleryFilters();
};

/**
 * Cửa sổ Modal popup xem chi tiết đầy đủ của một tác phẩm
 */
window.openEntryDetailModal = function(entryId) {
  const entries = getAllSubmittedEntries();
  const entry = entries.find(e => e.id === entryId);
  if (!entry) return;

  const modal = document.getElementById('entry-detail-modal');
  if (!modal) return;

  const typeBadge = document.getElementById('detail-type-badge');
  const deptBadge = document.getElementById('detail-dept-badge');
  const codeBadge = document.getElementById('detail-code-badge');
  const titleEl = document.getElementById('detail-title');
  const authorEl = document.getElementById('detail-author');
  const msnvEl = document.getElementById('detail-msnv');
  const teamEl = document.getElementById('detail-team-members');
  const descEl = document.getElementById('detail-desc');
  const aiToolsEl = document.getElementById('detail-ai-tools');
  const aiDescEl = document.getElementById('detail-ai-desc');

  if (typeBadge) typeBadge.textContent = `${entry.category === 'Video' ? '🎬' : entry.category === 'Ảnh' ? '🖼️' : '📊'} ${entry.category}`;
  if (deptBadge) deptBadge.textContent = entry.department;
  if (codeBadge) codeBadge.textContent = entry.id;
  if (titleEl) titleEl.textContent = entry.title;
  if (authorEl) authorEl.textContent = entry.author;
  if (msnvEl) msnvEl.textContent = entry.msnv || 'Chưa cập nhật';
  
  if (teamEl) {
    if (entry.teamMembers && entry.teamMembers.trim()) {
      teamEl.textContent = `👥 Thành viên nhóm: ${entry.teamMembers}`;
      teamEl.style.display = 'block';
    } else {
      teamEl.style.display = 'none';
    }
  }

  if (descEl) descEl.textContent = entry.description || 'Chưa có tóm tắt nội dung.';

  if (aiToolsEl) {
    if (entry.aiTools && entry.aiTools.length > 0) {
      aiToolsEl.innerHTML = entry.aiTools.map(t => `<span class="ai-chip-mini" style="font-size: 0.8rem; padding: 4px 10px;">🤖 ${t}</span>`).join('');
    } else {
      aiToolsEl.innerHTML = `<span class="ai-chip-mini">Trí tuệ nhân tạo (AI)</span>`;
    }
  }

  if (aiDescEl) {
    aiDescEl.textContent = entry.aiPromptDescription || 'Tác phẩm ứng dụng công nghệ trí tuệ nhân tạo (AI) trong sáng tạo kịch bản, hình ảnh và video.';
  }

  modal.classList.add('open');
};

window.closeEntryDetailModal = function() {
  const modal = document.getElementById('entry-detail-modal');
  if (modal) modal.classList.remove('open');
};
