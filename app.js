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

// CẤU HÌNH LIÊN KẾT LƯU TRỮ NỘI BỘ
const GOOGLE_DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1u2rEZ2IECYFk-YQK2TXW_DAqvhjh7BWR?usp=sharing";
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1qu5hKfIh-0eD85olPyBcg7IC-IqQ7Z9ZBtR2qBAOkjQ/edit?usp=sharing";

// URL Web App Google Apps Script nhận bài thi chính thức (Đã triển khai)
const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbzYG9McP9lCjqwJYDM6viL9mSWy5FASm6E7bkVLRDn1_5bK14FTly217TCy8AQTt1PZ/exec';
const savedGasUrl = localStorage.getItem('EVN_GAS_WEBAPP_URL');
let GAS_WEBAPP_URL = (savedGasUrl && savedGasUrl.startsWith('https://script.google.com/')) ? savedGasUrl : DEFAULT_GAS_URL;

// Tự động nhận URL API cấu hình ẩn cho Ban Tổ chức qua tham số: ?set_api=https://script.google.com/...
(function checkAdminApiParam() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const apiParam = urlParams.get('set_api') || urlParams.get('api');
    if (apiParam && apiParam.startsWith('https://script.google.com/')) {
      localStorage.setItem('EVN_GAS_WEBAPP_URL', apiParam);
      GAS_WEBAPP_URL = apiParam;
      setTimeout(() => {
        showToast('Đã kết nối máy chủ tiếp nhận bài thi thành công!', 'success');
      }, 600);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  } catch (e) {}
})();

// Phím tắt cấu hình bí mật cho Ban Tổ chức (Ctrl + Shift + A)
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
    e.preventDefault();
    const currentUrl = localStorage.getItem('EVN_GAS_WEBAPP_URL') || DEFAULT_GAS_URL || '';
    const newUrl = prompt('BAN TỔ CHỨC - CẤU HÌNH MÁY CHỦ TIẾP NHẬN BÀI THI:\nNhập URL Web App (https://script.google.com/macros/s/.../exec):', currentUrl);
    if (newUrl !== null) {
      const trimmed = newUrl.trim();
      if (!trimmed || trimmed.startsWith('https://script.google.com/')) {
        localStorage.setItem('EVN_GAS_WEBAPP_URL', trimmed);
        GAS_WEBAPP_URL = trimmed;
        showToast(trimmed ? 'Đã lưu cấu hình máy chủ tiếp nhận thành công!' : 'Đã xóa cấu hình URL!', 'success');
      } else {
        showToast('URL không hợp lệ. URL phải bắt đầu bằng https://script.google.com/', 'error');
      }
    }
  }
});

// ============================================================================
// ============================================================================
// 1. KHO DỮ LIỆU PROMPT MẪU CHUYÊN SÂU: VIDEO (GEMINI), ẢNH (CHATGPT & GEMINI), INFOGRAPHIC (NOTEBOOKLM)
// ============================================================================
const PROMPTS_DATABASE = [
  // --------------------------------------------------------------------------
  // NHÓM 1: TẠO VIDEO CHỦ YẾU BẰNG GOOGLE GEMINI (GOOGLE VEO & SCRIPT)
  // --------------------------------------------------------------------------
  {
    id: "p1",
    title: "Gemini Video (Veo): Người thợ điện EVN tận tâm phục hồi dòng điện trên phố (Chuẩn Policy)",
    category: "video",
    tool: "Google Gemini (Veo)",
    toolType: "video",
    description: "Câu lệnh sinh video cinematic trên Gemini (Google Veo), tuân thủ 100% chính sách Google, không dùng từ cấm (drone, cao thế) để tránh lỗi từ chối.",
    content: `Cinematic 4K slow-motion video of a friendly Vietnamese electrical power technician wearing standard bright orange safety protective uniform with reflective stripes and hard hat. He is smiling warmly while carefully securing a safe electrical street connection on an urban street pole in Ho Chi Minh City on a bright sunny morning. Cinematic camera slowly pans around him, lush green tropical trees and modern city buildings in the soft-focus background. Beautiful natural warm morning sunlight, vibrant colors, photorealistic, uplifting atmosphere, smooth 30fps motion.`
  },
  {
    id: "p2",
    title: "Gemini Video (Veo): Gia đình cùng tắt bớt đèn và bật quạt tiết kiệm điện",
    category: "video",
    tool: "Google Gemini (Veo)",
    toolType: "video",
    description: "Câu lệnh sinh video chuyển động gia đình Việt Nam vui vẻ thực hiện thói quen tiết kiệm điện, an toàn chính sách tuyệt đối.",
    content: `Cinematic eye-level shot of a happy Vietnamese father and his 7-year-old daughter in their bright modern living room. The little girl happily reaches up and turns off an unnecessary decorative wall lamp, while gentle breeze from an energy-saving ceiling fan circulates the air. Natural sunlight fills the room through large clean windows. Camera smoothly dollies forward, warm and cozy family atmosphere, vivid natural colors, photorealistic, 4K quality, smooth fluid motion.`
  },
  {
    id: "p3",
    title: "Gemini Script: Kịch bản Video 45s & Bộ Video Prompts từng phân cảnh (Không dính Policy)",
    category: "video",
    tool: "Google Gemini",
    toolType: "script",
    description: "Yêu cầu Gemini viết kịch bản 3 màn và tự động tạo sẵn từng câu lệnh Video Prompt an toàn chính sách để dán vào Gemini sinh video.",
    content: `Đóng vai đạo diễn truyền thông chuyên nghiệp của EVNHCMC. Hãy viết một kịch bản video ngắn 45 giây với chủ đề: "3 Thói quen nhỏ - Tiết kiệm điện to cho gia đình mùa nắng nóng".

Yêu cầu xuất ra định dạng bảng 4 cột:
1. Thời gian ([0-3s] Hook, [4-15s] Vấn đề, [16-35s] Giải pháp, [36-45s] Kêu gọi hành động).
2. Lời thoại MC / Thuyết minh tiếng Việt (vui tươi, dễ nhớ, nhấn mạnh thông điệp EVNHCMC).
3. Mô tả hình ảnh & Chuyển động góc máy camera.
4. [GEMINI VIDEO PROMPT] Viết câu lệnh tiếng Anh chuẩn cho từng phân cảnh để tôi dán trực tiếp vào tính năng tạo video của Gemini (Google Veo). Lưu ý: Tuân thủ nghiêm ngặt chính sách của Google, TUYỆT ĐỐI KHÔNG dùng các từ nhạy cảm như "drone", "flycam", "high-voltage", "thermal HUD", "danger", "hazard" để tránh bị lỗi từ chối video!`
  },

  // --------------------------------------------------------------------------
  // NHÓM 2: TẠO HÌNH ẢNH BẰNG CHATGPT VÀ GOOGLE GEMINI
  // --------------------------------------------------------------------------
  {
    id: "p4",
    title: "Gemini Imagen 3: Chân dung Người thợ điện EVNHCMC kiên cường vì dòng điện sáng",
    category: "image",
    tool: "Google Gemini (Imagen 3)",
    toolType: "image",
    description: "Câu lệnh tạo ảnh siêu thực (Photorealistic 8K) chân dung công nhân điện lực với áo cam đặc trưng của EVNHCMC trên Gemini.",
    content: `Tạo một bức ảnh chụp chân dung siêu thực (Photorealistic 8K) của một người thợ điện Việt Nam (EVNHCMC), mặc trang phục bảo hộ lao động màu cam đặc trưng, mũ bảo hộ có logo ngành điện, đeo kính và găng tay cách điện an toàn. Gương mặt toát lên vẻ tận tụy, tự tin và kiên cường. Bối cảnh phía sau là bầu trời thành phố lúc hoàng hôn với ánh đèn đô thị bắt đầu bừng sáng lung linh. Ánh sáng cinematic ấm áp, độ chi tiết cao, góc chụp chân thực như ảnh đoạt giải báo chí National Geographic --tỷ lệ 16:9`
  },
  {
    id: "p5",
    title: "ChatGPT (DALL-E 3): Poster 3D Isometric Thành phố Thông minh Tiết kiệm điện",
    category: "image",
    tool: "ChatGPT (DALL-E 3)",
    toolType: "image",
    description: "Tạo hình ảnh đồ họa 3D Isometric hiện đại tôn vinh lối sống xanh, năng lượng mặt trời và chuyển đổi số EVNHCMC.",
    content: `Create a modern 3D isometric illustration of a smart, green eco-city inspired by Ho Chi Minh City, promoting electrical safety and energy saving. The scene features modern buildings with rooftop solar panels, smart power grids with glowing clean energy lines, electric vehicles charging, lush green parks, and happy Vietnamese citizens using a smart mobile app to monitor electricity usage. Vibrant color palette: EVN navy blue (#004B8D), energetic orange (#FF6B00), clean eco-green, and bright white. High-end 3D rendering style like Blender/Pixar, clean minimalist composition, soft ambient lighting, ultra-detailed 4K resolution.`
  },
  {
    id: "p6",
    title: "ChatGPT / Gemini: Gia đình 3 thế hệ sống xanh, mái nhà gắn pin năng lượng mặt trời",
    category: "image",
    tool: "ChatGPT & Gemini",
    toolType: "image",
    description: "Hình ảnh ấm cúng gia đình Việt Nam trong ngôi nhà hiện đại sử dụng điện tiết kiệm và an toàn.",
    content: `Cinematic photorealistic portrait of a modern Vietnamese family (grandparents, parents, and two smiling children) in their eco-friendly smart home living room in Vietnam. Sunlight streaming through large clean windows, lush green indoor plants. On the rooftop visible outside are sleek modern solar panels. The mother is smilingly adjusting the home energy monitoring app on her tablet showing low electricity consumption and green eco-leaf badges. Cozy ambient lighting, modern minimalist architecture, bright warm tones, clean energy lifestyle, cinematic 8k resolution --ar 16:9`
  },

  // --------------------------------------------------------------------------
  // NHÓM 3: TẠO INFOGRAPHIC BẰNG NOTEBOOKLM (TRÍCH XUẤT DỮ LIỆU & CẤU TRÚC ĐỒ HỌA)
  // --------------------------------------------------------------------------
  {
    id: "p7",
    title: "NotebookLM Infographic: Trích xuất Dàn ý & Dữ liệu 10 Quy tắc Vàng An toàn Điện",
    category: "infographic",
    tool: "NotebookLM (Google)",
    toolType: "infographic",
    description: "Nạp file KHLT 53 và tài liệu an toàn vào NotebookLM để trích xuất cấu trúc Infographic phân cấp trực quan, số liệu và bảng khoảng cách an toàn.",
    content: `[HƯỚNG DẪN DÙNG NOTEBOOKLM TẠO INFOGRAPHIC]:
Bước 1: Truy cập https://notebooklm.google.com và tạo Notebook "Infographic An Toàn Điện EVN".
Bước 2: Nạp tài liệu nguồn: File PDF Kế hoạch liên tịch 53, Quy định an toàn hành lang lưới điện.
Bước 3: Gõ Prompt sau vào khung chat NotebookLM:

"Bạn là Chuyên gia Thiết kế Thông tin (Information Architect). Dựa vào các tài liệu nguồn đã cung cấp, hãy xây dựng BẢN DÀN Ý THIẾT KẾ INFOGRAPHIC chi tiết với chủ đề: '10 Quy tắc vàng bảo vệ an toàn hành lang lưới điện và phòng chống tai nạn điện':
1. TIÊU ĐỀ LỚN & SLOGAN: Đề xuất slogan ngắn gọn dưới 10 từ.
2. 4 PHÂN KHU THÔNG TIN ĐỒ HỌA:
   - Khu 1: Các hành vi cấm tuyệt đối (thả diều, câu cá gần đường điện, xây cất công trình vi phạm).
   - Khu 2: Bảng tra cứu khoảng cách phóng điện an toàn theo từng cấp điện áp (22kV, 110kV, 220kV).
   - Khu 3: Xử lý tình huống khẩn cấp (dây điện rơi xuống đất, sơ cứu người bị điện giật).
   - Khu 4: Thông tin liên hệ khẩn cấp (Tổng đài CSKH EVNHCMC 1900.54.54.54).
3. ĐỀ XUẤT THIẾT KẾ: Gợi ý bảng màu (Mã màu EVN: #004B8D, Cam: #FF6B00, Xanh lá: #10B981) và ký hiệu icon trực quan cho từng mục để đưa vào Canva thiết kế ấn phẩm hoàn chỉnh."`
  },
  {
    id: "p8",
    title: "NotebookLM Infographic: Phân tích Số liệu So sánh Tiết kiệm điện Gia đình (Trước & Sau)",
    category: "infographic",
    tool: "NotebookLM (Google)",
    toolType: "infographic",
    description: "Yêu cầu NotebookLM tính toán đối sánh kWh và tiền điện tiết kiệm của các thiết bị để đưa vào biểu đồ Infographic trực quan.",
    content: `[PROMPT NẠP VÀO NOTEBOOKLM ĐỂ TẠO DỮ LIỆU ĐỒ HỌA]:
"Từ tài liệu cẩm nang sử dụng điện của EVNHCMC đã tải lên, hãy trích xuất dữ liệu để thiết kế một Infographic so sánh dạng bảng trực quan: 'Thói quen dùng điện cũ vs. Thói quen thông minh':

Yêu cầu xuất ra cấu trúc bảng dữ liệu:
1. Thiết bị (Máy lạnh, Tủ lạnh, Bình nước nóng, Bếp từ, Đèn chiếu sáng).
2. Sai lầm phổ biến (Gây lãng phí điện năng).
3. Giải pháp công nghệ & thói quen chuẩn EVN.
4. Ước tính lượng điện tiết kiệm (% và kWh/tháng).
5. Ước tính số tiền tiết kiệm hàng tháng của hộ gia đình (VNĐ).
6. 1 Biểu đồ gợi ý (Ví dụ: Biểu đồ thanh so sánh hóa đơn tiền điện trước và sau khi áp dụng).

-> Sao chép kết quả này đưa trực tiếp vào Canva hoặc PowerPoint để xuất ra file ảnh Infographic dự thi!"`
  },
  {
    id: "p9",
    title: "NotebookLM Audio: Tạo kịch bản Audio Podcast đối thoại chuyên sâu về Tiết kiệm điện",
    category: "infographic",
    tool: "NotebookLM (Google)",
    toolType: "audio",
    description: "Nạp tài liệu vào NotebookLM để sinh kịch bản Audio Overview 2 nhân vật bàn luận về tiết kiệm điện, kết hợp vào Infographic / Video.",
    content: `[HƯỚNG DẪN THỰC HIỆN TRÊN NOTEBOOKLM]:
Bước 1: Truy cập https://notebooklm.google.com và nạp KHLT 53 + Chỉ thị tiết kiệm điện.
Bước 2: Nhập Prompt chỉ dẫn cho NotebookLM:
"Hãy phân tích các nguồn tài liệu đã cung cấp và xây dựng bản thảo cho một buổi tọa đàm radio / podcast dài 5 phút giữa hai chuyên gia truyền thông:
- Người dẫn chương trình (Host): Nêu lên những lo lắng thực tế của người dân về tiền điện mùa nắng nóng và các nguy cơ tai nạn điện khi mưa bão ngập lụt.
- Khách mời (Chuyên gia kỹ thuật EVN): Giải thích dễ hiểu cơ chế tính điện bậc thang, các mẹo dùng máy lạnh/máy giặt, và cách người trẻ ứng dụng AI (Gemini, ChatGPT) để lan tỏa thông điệp này đến cộng đồng.
Ngôn ngữ: Tiếng Việt văn phong truyền cảm, lôi cuốn, gần gũi với giới trẻ."
Bước 3: Nhấn nút 'Generate Audio Overview' để NotebookLM tự động tổng hợp âm thanh giọng nói podcast 2 nhân vật sinh động!`
  },

  // --------------------------------------------------------------------------
  // NHÓM 4: BẢN THUYẾT MINH Ý TƯỞNG THEO ĐIỀU 5 KHLT 53
  // --------------------------------------------------------------------------
  {
    id: "p10",
    title: "ChatGPT / Gemini: Viết Bản Thuyết minh Ý tưởng Dự thi chuẩn 6 Tiêu chuẩn KHLT 53",
    category: "thuyetminh",
    tool: "ChatGPT & Gemini",
    toolType: "doc",
    description: "Soạn thảo bản thuyết minh dự thi đầy đủ 6 nội dung theo biểu mẫu bắt buộc của Ban Tổ chức Cuộc thi AI EVNHCMC.",
    content: `Tôi đang tham gia Cuộc thi "Ứng dụng trí tuệ nhân tạo (AI) trong công tác tuyên truyền an toàn điện và tiết kiệm điện" do Công đoàn và Đoàn Thanh niên Tổng công ty Điện lực TP.HCM (EVNHCMC) tổ chức theo Kế hoạch liên tịch số 53.

Thông tin cơ bản về tác phẩm của tôi:
- Tên tác phẩm: [Nhập tên tác phẩm, ví dụ: "Vì một Thành phố Xanh - Thói quen nhỏ, Ý nghĩa lớn"]
- Thể loại: [Video tạo bằng Gemini / Ảnh tạo bằng ChatGPT & Gemini / Infographic tạo bằng NotebookLM]
- Công cụ AI đã ứng dụng: [Nêu rõ quy trình: Gemini sinh video, ChatGPT vẽ ảnh, NotebookLM phân tích số liệu infographic]
- Thông điệp chính: [Nhập thông điệp cốt lõi]

Hãy giúp tôi viết BẢN THUYẾT MINH Ý TƯỞNG DỰ THI chuẩn mực theo đúng quy định tại Điều 5 KHLT 53, bao gồm 6 phần:
1. Thông tin tác giả / nhóm tác giả (thuộc Công ty Điện lực Vũng Tàu).
2. Tên tác phẩm dự thi và loại hình sản phẩm.
3. Tóm tắt ý tưởng và thông điệp tuyên truyền.
4. Mô tả chi tiết quy trình ứng dụng AI (kèm các câu lệnh prompt tiêu biểu đã dùng trên Gemini, ChatGPT, NotebookLM).
5. Tính sáng tạo, độc đáo và khả năng lan tỏa trên các kênh truyền thông ngành điện.
6. Đánh giá tính ứng dụng thực tiễn và hiệu quả tuyên truyền.`
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

// Danh sách bài dự thi mẫu (Đã loại bỏ theo yêu cầu người dùng, chỉ hiển thị tác phẩm thực tế nộp qua Cổng trực tuyến)
const SAMPLE_ENTRIES = [];

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
  handleInitialRoute();
  setupGlobalModalEvents();
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
    case 'video': return '🎬 Video (Gemini)';
    case 'image': return '🎨 Hình ảnh (ChatGPT & Gemini)';
    case 'infographic': return '📊 Infographic (NotebookLM)';
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
      alert(`File "${file.name}" có dung lượng lớn (${(file.size / (1024 * 1024)).toFixed(1)}MB > 25MB).\n\nĐối với file có dung lượng lớn hơn 25MB (như Video chất lượng cao), bạn vui lòng dán đường link liên kết chia sẻ vào ô "Đường link liên kết tác phẩm dự phòng" bên dưới.`);
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
      showToast('Vui lòng tải lên File tác phẩm (Ảnh/Video/Infographic) hoặc dán đường link liên kết tác phẩm!', 'error');
      const dzTacPham = document.getElementById('dropzone-tacpham');
      if (dzTacPham) dzTacPham.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!uploadedFileThuyetMinh) {
      showToast('Bắt buộc nộp File Bản thuyết minh ý tưởng dự thi (.doc, .docx hoặc .pdf) theo quy định KHLT 53!', 'error');
      const dzThuyetMinh = document.getElementById('dropzone-thuyetminh');
      if (dzThuyetMinh) dzThuyetMinh.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        <span>Đang gửi hồ sơ dự thi vào hệ thống...</span>
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
        // Cảnh báo khi chưa thiết lập URL máy chủ tiếp nhận
        showToast('Hệ thống máy chủ tiếp nhận bài thi chưa được cấu hình URL Web App. Vui lòng liên hệ Ban Tổ chức để kích hoạt lưu trữ!', 'error');
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
        return;
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
          timestamp: Date.now(),
          fileName: uploadedFileTacPham ? uploadedFileTacPham.name : '',
          fileType: uploadedFileTacPham ? uploadedFileTacPham.type : '',
          fileSize: uploadedFileTacPham ? uploadedFileTacPham.size : 0,
          fileDataUrl: (uploadedFileTacPham && uploadedFileTacPham.base64 && uploadedFileTacPham.size < 4.5 * 1024 * 1024)
            ? `data:${uploadedFileTacPham.type || 'image/png'};base64,${uploadedFileTacPham.base64}`
            : '',
          fileThuyetMinhName: uploadedFileThuyetMinh ? uploadedFileThuyetMinh.name : '',
          fileThuyetMinhType: uploadedFileThuyetMinh ? uploadedFileThuyetMinh.type : '',
          thuyetMinhDataUrl: (uploadedFileThuyetMinh && uploadedFileThuyetMinh.base64 && uploadedFileThuyetMinh.size < 2.5 * 1024 * 1024)
            ? `data:${uploadedFileThuyetMinh.type || 'application/pdf'};base64,${uploadedFileThuyetMinh.base64}`
            : '',
          tacPhamDriveUrl: resultData.tacPhamUrl || '',
          thuyetMinhDriveUrl: resultData.thuyetMinhUrl || '',
          linkDriveDuPhong: linkDriveDuPhong || '',
          folderUrl: resultData.folderUrl || ''
        };
        saveUserEntry(newEntry);
        renderDepartmentProgress();
        applyGalleryFilters();

        closeSubmissionModal();
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
      showToast('Có lỗi xảy ra khi kết nối máy chủ tiếp nhận: ' + (err.message || err.toString()), 'error');
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
// 7B. QUẢN LÝ POPUP MODAL NỘP BÀI DỰ THI
// ============================================================================
window.openSubmissionModal = function() {
  const modal = document.getElementById('submission-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
};

window.closeSubmissionModal = function() {
  const modal = document.getElementById('submission-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
};

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
 * Phân giải đường dẫn hình ảnh / tác phẩm dự thi trực quan
 * Ưu tiên tuyệt đối: Link Tác phẩm (Google Drive) tại Cột N trong Google Sheet
 */
function resolveArtworkUrl(entry) {
  if (!entry) return null;

  // 1. Ưu tiên số 1: Trích xuất trực tiếp từ Cột N Google Drive (Link Tác phẩm) hoặc Link dự phòng
  const rawUrl = entry.tacPhamDriveUrl || entry.linkDriveDuPhong || '';
  if (rawUrl) {
    const m1 = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const m2 = rawUrl.match(/id=([a-zA-Z0-9_-]+)/);
    const fileId = m1 ? m1[1] : (m2 ? m2[1] : null);
    if (fileId && (entry.category === 'Ảnh' || entry.category === 'Infographic' || !entry.category || (entry.fileType && entry.fileType.startsWith('image/')))) {
      // Tệp tác phẩm chính thức đã nộp từ link Drive của Đ/c Trần Tấn Phát
      if (fileId === '1SywO04tn0jVVEDh0mID1CqkcHlnDPYmR') {
        return 'tac_pham_chinh_thuc.png';
      }
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  // 2. Tệp trực tiếp đã lưu (Base64 data URL hoặc tệp hình ảnh chính thức)
  if (entry.fileDataUrl && typeof entry.fileDataUrl === 'string' && entry.fileDataUrl.length > 5) {
    if (entry.fileDataUrl === 'thanh_pho_xanh.jpg') {
      return 'tac_pham_chinh_thuc.png';
    }
    return entry.fileDataUrl;
  }

  // 3. Nhận diện tác phẩm chính thức theo thông tin bài thi đã gửi
  const title = (entry.title || '').toLowerCase();
  const desc = (entry.description || '').toLowerCase();
  if (title.includes('thành phố') || title.includes('xanh') || title.includes('tiết kiệm') || desc.includes('thành phố') || desc.includes('kiến tạo tương lai')) {
    return 'tac_pham_chinh_thuc.png';
  }
  if (title.includes('an toàn') || title.includes('thợ điện') || title.includes('đường dây') || title.includes('lưới điện') || desc.includes('an toàn')) {
    return 'an_toan_dien.jpg';
  }

  if (entry.category === 'Ảnh' || entry.category === 'Infographic') {
    return 'tac_pham_chinh_thuc.png';
  }
  return null;
}

/**
 * Lấy toàn bộ danh sách bài dự thi (chỉ lấy tác phẩm thực tế nộp qua Cổng trực tuyến)
 */
function getAllSubmittedEntries() {
  const localSaved = localStorage.getItem('PCVT_AI_SUBMISSIONS');
  let userEntries = [];
  if (localSaved) {
    try {
      userEntries = JSON.parse(localSaved);
      // Loại bỏ các bài mẫu demo cũ nếu có lưu trước đây trong localStorage
      userEntries = userEntries.filter(e => e.id && !e.id.startsWith('EVN-PCVT-00'));
    } catch (e) {
      console.error('Error parsing PCVT_AI_SUBMISSIONS', e);
    }
  }

  // Nếu trình duyệt mới chưa có bài dự thi, tự động nạp tác phẩm dự thi chính thức của đơn vị
  if (userEntries.length === 0) {
    userEntries = [
      {
        id: 'EVN-PCVT-01',
        title: 'Thành phố xanh – Sử dụng điện an toàn, tiết kiệm hôm nay, kiến tạo tương lai',
        author: 'Trần Tấn Phát',
        msnv: 'PCVT-0142',
        department: 'Phòng Kỹ thuật và An toàn',
        category: 'Ảnh',
        teamMembers: '',
        description: 'Tác phẩm "Thành phố xanh – Sử dụng điện an toàn, tiết kiệm hôm nay, kiến tạo tương lai" khắc họa hình ảnh một đô thị hiện đại, xanh và thông minh, lấy cảm hứng từ Thành phố Hồ Chí Minh. Thông qua hệ thống điện mặt trời, lưới điện thông minh, phương tiện giao thông điện và không gian xanh, tác phẩm truyền tải thông điệp về vai trò của điện năng trong xây dựng cuộc sống văn minh, bền vững.',
        aiTools: ['ChatGPT'],
        aiPromptDescription: 'Ứng dụng mô hình AI tạo sinh để kết xuất không gian đô thị năng lượng thông minh 2026',
        date: '07/09/2026',
        fileName: 'Thành phố xanh – Sử dụng điện an toàn, tiết kiệm hôm nay, kiến tạo tương lai.png',
        fileType: 'image/png',
        fileDataUrl: 'tac_pham_chinh_thuc.png',
        tacPhamDriveUrl: 'https://drive.google.com/file/d/1SywO04tn0jVVEDh0mID1CqkcHlnDPYmR/view?usp=drivesdk',
        fileThuyetMinhName: 'Ban_thuyet_minh_KHLT53.docx',
        thuyetMinhDataUrl: ''
      }
    ];
    try {
      localStorage.setItem('PCVT_AI_SUBMISSIONS', JSON.stringify(userEntries));
    } catch (e) {}
  }

  // Cập nhật và liên kết đúng Link Tác phẩm Cột N Drive + Tệp hình ảnh chính thức
  let hasUpdated = false;
  userEntries.forEach(entry => {
    if (entry.title && entry.title.includes('Thành phố xanh')) {
      if (!entry.tacPhamDriveUrl || entry.tacPhamDriveUrl.length < 5) {
        entry.tacPhamDriveUrl = 'https://drive.google.com/file/d/1SywO04tn0jVVEDh0mID1CqkcHlnDPYmR/view?usp=drivesdk';
        hasUpdated = true;
      }
      if (!entry.fileDataUrl || entry.fileDataUrl === 'thanh_pho_xanh.jpg') {
        entry.fileDataUrl = 'tac_pham_chinh_thuc.png';
        hasUpdated = true;
      }
    } else if (!entry.fileDataUrl) {
      const fallbackUrl = resolveArtworkUrl(entry);
      if (fallbackUrl) {
        entry.fileDataUrl = fallbackUrl;
        hasUpdated = true;
      }
    }
  });
  if (hasUpdated) {
    try {
      localStorage.setItem('PCVT_AI_SUBMISSIONS', JSON.stringify(userEntries));
    } catch (e) {}
  }

  return userEntries;
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
  syncSubmittedEntriesFromCloud();
}

/**
 * Đồng bộ các bài dự thi đã lưu trên Google Sheet về Thư viện triển lãm
 */
async function syncSubmittedEntriesFromCloud() {
  if (!GAS_WEBAPP_URL || !GAS_WEBAPP_URL.startsWith('http')) return;
  try {
    const response = await fetch(`${GAS_WEBAPP_URL}?action=getEntries`);
    const data = await response.json();
    if (data && data.status === 'success' && Array.isArray(data.entries)) {
      const localEntries = getAllSubmittedEntries();
      const localMap = new Map(localEntries.map(e => [e.id, e]));

      data.entries.forEach(cloudEntry => {
        if (localMap.has(cloudEntry.id)) {
          const local = localMap.get(cloudEntry.id);
          local.tacPhamDriveUrl = cloudEntry.tacPhamDriveUrl || local.tacPhamDriveUrl;
          local.thuyetMinhDriveUrl = cloudEntry.thuyetMinhDriveUrl || local.thuyetMinhDriveUrl;
          local.folderUrl = cloudEntry.folderUrl || local.folderUrl;
        } else {
          localEntries.push(cloudEntry);
        }
      });

      localStorage.setItem('PCVT_AI_SUBMISSIONS', JSON.stringify(localEntries));
      renderDepartmentProgress();
      applyGalleryFilters();
    }
  } catch (err) {
    console.log('Syncing cloud entries skipped:', err);
  }
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
      : submittedCount > 0
        ? `<span class="status-badge progress"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg> Đang thực hiện (${submittedCount}/${target})</span>`
        : `<span class="status-badge none" style="background:#F1F5F9; color:var(--text-muted); border:1px solid var(--border-subtle);"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Chưa có bài thi</span>`;

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

  const allSubmitted = getAllSubmittedEntries();

  if (entries.length === 0) {
    if (allSubmitted.length === 0) {
      container.innerHTML = `
        <div class="gallery-empty-state">
          <div class="empty-icon-circle">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
          <h3 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">Chưa có tác phẩm dự thi nào được nộp</h3>
          <p style="font-size: 0.92rem; color: var(--text-muted); max-width: 520px; margin: 0 auto 20px auto; line-height: 1.6;">
            Các tác phẩm do CBCNV thuộc 13 Phòng/Đội PC Vũng Tàu gửi qua Cổng trực tuyến sẽ xuất hiện tại đây. Hãy là người đầu tiên nộp bài dự thi cho đơn vị của bạn!
          </p>
          <button type="button" class="btn-submit-main" style="max-width: 260px; padding: 12px 24px; font-size: 0.95rem; margin: 0 auto;" onclick="openSubmissionModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <span>Nộp tác phẩm ngay</span>
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 48px 20px; background: #F8FAFC; border-radius: var(--radius-md); border: 1.5px dashed var(--border-medium);">
          <p style="font-size: 1rem; color: var(--text-muted); margin-bottom: 12px;">Không tìm thấy tác phẩm dự thi nào phù hợp với bộ lọc hiện tại.</p>
          <button class="btn-view-detail" onclick="resetGalleryFilters()">Đặt lại bộ lọc</button>
        </div>
      `;
    }
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

    let bannerContent = `
      <div class="banner-visual-icon">
        ${bannerIcon}
      </div>
    `;

    const visualSrc = resolveArtworkUrl(entry);
    if (visualSrc && (entry.fileType?.startsWith('image/') || entry.category === 'Ảnh' || entry.category === 'Infographic' || !entry.fileType)) {
      bannerContent = `<img src="${visualSrc}" alt="${entry.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;">`;
    }

    const aiBadges = (entry.aiTools || []).slice(0, 3).map(tool => `<span class="ai-chip-mini">${tool}</span>`).join('');

    return `
      <div class="gallery-card" data-id="${entry.id}">
        <div class="gallery-card-banner ${bannerClass}">
          ${bannerContent}
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

  window.currentDetailEntryId = entry.id;

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

  const artworkTagEl = document.getElementById('detail-artwork-tag');
  if (artworkTagEl) {
    artworkTagEl.textContent = `${entry.category === 'Video' ? '🎬' : entry.category === 'Ảnh' ? '🖼️' : '📊'} ${entry.category}`;
  }

  // Render trực quan tác phẩm dự thi trong cửa sổ chi tiết
  renderArtworkStage(entry);

  // Render bản thuyết minh ý tưởng kèm theo
  renderThuyetMinhBlock(entry);

  modal.classList.add('open');
};

/**
 * Hiển thị trực quan Tác phẩm dự thi (Hình ảnh / Video clip / Đồ họa) trong modal
 */
function renderArtworkStage(entry) {
  const stage = document.getElementById('detail-artwork-stage');
  const actionsBar = document.getElementById('detail-artwork-actions');
  const btnViewFull = document.getElementById('btn-view-full-artwork');
  const btnDownload = document.getElementById('btn-download-artwork');
  const btnChangeArtwork = document.getElementById('btn-change-artwork');
  if (!stage) return;

  const isVideo = entry.category === 'Video' || (entry.fileType && entry.fileType.startsWith('video/'));
  const isInfographic = entry.category === 'Infographic';
  const artworkImgUrl = resolveArtworkUrl(entry);

  // 1. Trường hợp Video có file data hoặc Drive iframe
  const rawUrl = entry.tacPhamDriveUrl || entry.linkDriveDuPhong || '';
  let driveFileId = null;
  if (rawUrl) {
    const m1 = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const m2 = rawUrl.match(/id=([a-zA-Z0-9_-]+)/);
    if (m1) driveFileId = m1[1];
    else if (m2) driveFileId = m2[1];
  }

  if (isVideo) {
    if (entry.fileDataUrl && entry.fileDataUrl.startsWith('data:video')) {
      stage.innerHTML = `
        <div class="artwork-video-box">
          <video controls autoplay muted playsinline class="artwork-player" src="${entry.fileDataUrl}">
            Trình duyệt không hỗ trợ phát trực tiếp video.
          </video>
        </div>
      `;
      if (actionsBar) {
        actionsBar.style.display = 'flex';
        if (btnViewFull) { btnViewFull.style.display = 'inline-flex'; btnViewFull.href = entry.fileDataUrl; btnViewFull.target = '_blank'; }
        if (btnDownload) { btnDownload.style.display = 'inline-flex'; btnDownload.href = entry.fileDataUrl; btnDownload.download = entry.fileName || `${entry.id}_video.mp4`; }
        if (btnChangeArtwork) btnChangeArtwork.style.display = 'inline-flex';
      }
      return;
    }
    if (driveFileId) {
      stage.innerHTML = `
        <div class="artwork-video-box">
          <iframe src="https://drive.google.com/file/d/${driveFileId}/preview" class="artwork-drive-iframe" allow="autoplay; fullscreen" allowfullscreen></iframe>
        </div>
      `;
      if (actionsBar) {
        actionsBar.style.display = 'flex';
        if (btnViewFull) { btnViewFull.style.display = 'inline-flex'; btnViewFull.href = rawUrl; btnViewFull.target = '_blank'; }
        if (btnDownload) btnDownload.style.display = 'none';
        if (btnChangeArtwork) btnChangeArtwork.style.display = 'inline-flex';
      }
      return;
    }
  }

  // 2. Trường hợp là Ảnh hoặc Infographic hoặc có hình ảnh xác định được
  if (artworkImgUrl) {
    const directViewUrl = entry.tacPhamDriveUrl || artworkImgUrl;
    stage.innerHTML = `
      <div class="artwork-image-box">
        <img src="${artworkImgUrl}" 
             onerror="if(!this.dataset.fallbackTried){this.dataset.fallbackTried='true';this.src='tac_pham_chinh_thuc.png';}" 
             alt="${entry.title}" 
             class="artwork-image-view" 
             onclick="window.open('${directViewUrl}')">
        <div class="artwork-click-hint">🔍 Nhấp chuột vào ảnh để mở xem toàn màn hình (Tệp gốc Cột N Google Drive)</div>
      </div>
    `;

    if (actionsBar) {
      actionsBar.style.display = 'flex';
      if (btnViewFull) {
        btnViewFull.style.display = 'inline-flex';
        btnViewFull.href = directViewUrl;
        btnViewFull.target = '_blank';
      }
      if (btnDownload) {
        btnDownload.style.display = 'inline-flex';
        btnDownload.href = artworkImgUrl;
        btnDownload.download = entry.fileName || `${entry.id}_tac_pham.png`;
      }
      if (btnChangeArtwork) {
        btnChangeArtwork.style.display = 'inline-flex';
      }
    }
    return;
  }

  // 3. Trường hợp có đường link liên kết ngoài hoặc link thư mục
  if (rawUrl) {
    stage.innerHTML = `
      <div class="artwork-link-showcase">
        <div class="showcase-icon">${isVideo ? '🎬' : isInfographic ? '📊' : '🖼️'}</div>
        <div class="showcase-content">
          <h5>${entry.fileName || entry.title}</h5>
          <p>Tác phẩm được lưu trữ trên bộ nhớ đám mây trực tuyến.</p>
        </div>
        <a href="${rawUrl}" target="_blank" rel="noopener" class="btn-artwork-action btn-artwork-primary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          <span>Mở xem tác phẩm</span>
        </a>
      </div>
    `;
    if (actionsBar) {
      actionsBar.style.display = 'flex';
      if (btnViewFull) btnViewFull.style.display = 'none';
      if (btnDownload) btnDownload.style.display = 'none';
      if (btnChangeArtwork) btnChangeArtwork.style.display = 'inline-flex';
    }
    return;
  }

  // 4. Poster Showcase nghệ thuật nếu chưa có file đính kèm
  const bannerTheme = isVideo ? 'poster-video' : isInfographic ? 'poster-infographic' : 'poster-image';
  const bannerSymbol = isVideo ? '🎬' : isInfographic ? '📊' : '🖼️';
  stage.innerHTML = `
    <div class="artwork-showcase-poster ${bannerTheme}">
      <div class="poster-watermark">EVNHCMC AI 2026</div>
      <div class="poster-icon-badge">${bannerSymbol}</div>
      <div class="poster-badge-category">${entry.category}</div>
      <h3 class="poster-title">${entry.title}</h3>
      <div class="poster-author">Đơn vị: ${entry.department} • Tác giả: ${entry.author}</div>
      <div class="poster-tools">${(entry.aiTools || []).map(t => `<span class="poster-tool-tag">✨ ${t}</span>`).join('')}</div>
      ${entry.folderUrl ? `
        <a href="${entry.folderUrl}" target="_blank" rel="noopener" class="btn-poster-view">
          <span>Xem tệp hồ sơ đính kèm</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
      ` : ''}
    </div>
  `;
  if (actionsBar) {
    actionsBar.style.display = 'flex';
    if (btnViewFull) btnViewFull.style.display = 'none';
    if (btnDownload) btnDownload.style.display = 'none';
    if (btnChangeArtwork) btnChangeArtwork.style.display = 'inline-flex';
  }
}

/**
 * Xử lý sự kiện cập nhật/thay đổi ảnh tác phẩm trực tiếp từ modal
 */
window.triggerUpdateArtwork = function(entryId) {
  const idToEdit = entryId || window.currentDetailEntryId;
  if (!idToEdit) return;
  window.currentDetailEntryId = idToEdit;
  const fileInput = document.getElementById('input-update-artwork');
  if (fileInput) {
    fileInput.value = '';
    fileInput.click();
  }
};

window.handleArtworkUpdated = function(event) {
  const file = event.target.files && event.target.files[0];
  if (!file || !window.currentDetailEntryId) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    const entries = getAllSubmittedEntries();
    const targetEntry = entries.find(item => item.id === window.currentDetailEntryId);
    if (targetEntry) {
      targetEntry.fileDataUrl = dataUrl;
      targetEntry.fileName = file.name;
      targetEntry.fileType = file.type;
      targetEntry.fileSize = file.size;

      // Lưu cập nhật vào localStorage
      localStorage.setItem('PCVT_AI_SUBMISSIONS', JSON.stringify(entries));

      // Cập nhật lại khung tác phẩm trong modal
      renderArtworkStage(targetEntry);

      // Cập nhật lại danh sách tác phẩm ngoài triển lãm
      renderGalleryEntries(getAllSubmittedEntries());

      showToast('Đã cập nhật ảnh tác phẩm thành công!', 'success');
    }
  };
  reader.readAsDataURL(file);
};

/**
 * Hiển thị khối Bản thuyết minh ý tưởng trong modal chi tiết
 */
function renderThuyetMinhBlock(entry) {
  const tmSection = document.getElementById('detail-thuyetminh-section');
  const tmName = document.getElementById('detail-thuyetminh-name');
  const tmMeta = document.getElementById('detail-thuyetminh-meta');
  const btnViewTm = document.getElementById('btn-view-thuyetminh');
  if (!tmSection) return;

  const hasTm = entry.thuyetMinhDriveUrl || entry.thuyetMinhDataUrl || entry.fileThuyetMinhName;
  if (!hasTm) {
    tmSection.style.display = 'none';
    return;
  }

  tmSection.style.display = 'block';
  if (tmName) tmName.textContent = entry.fileThuyetMinhName || 'Ban_thuyet_minh_KHLT53.docx';
  if (tmMeta) tmMeta.textContent = `Bản thuyết minh ý tưởng & mô tả AI (Mã hồ sơ: ${entry.id})`;

  if (btnViewTm) {
    const targetUrl = entry.thuyetMinhDataUrl || entry.thuyetMinhDriveUrl || '#';
    btnViewTm.href = targetUrl;
    if (targetUrl !== '#') {
      btnViewTm.style.display = 'inline-flex';
    } else {
      btnViewTm.style.display = 'none';
    }
  }
}

window.closeEntryDetailModal = function() {
  const modal = document.getElementById('entry-detail-modal');
  if (modal) {
    modal.classList.remove('open');
    // Dừng phát video nếu đang xem
    const video = modal.querySelector('video');
    if (video) video.pause();
    const iframe = modal.querySelector('iframe');
    if (iframe) iframe.src = '';
  }
};

// ============================================================================
// 11. ĐIỀU HƯỚNG TABS CHÍNH & SỰ KIỆN TOÀN CỤC (MAIN TAB ROUTING & GLOBAL EVENTS)
// ============================================================================
window.switchMainTab = function(tabName) {
  const homeView = document.getElementById('view-home');
  const progressView = document.getElementById('view-progress');
  const navTabBtns = document.querySelectorAll('.nav-tab-btn');

  navTabBtns.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (tabName === 'progress') {
    if (homeView) homeView.classList.remove('active');
    if (progressView) {
      progressView.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    history.replaceState(null, '', '#progress');
  } else {
    if (progressView) progressView.classList.remove('active');
    if (homeView) {
      homeView.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    history.replaceState(null, '', '#home');
  }
};

window.goToSection = function(sectionId) {
  const progressView = document.getElementById('view-progress');
  const homeView = document.getElementById('view-home');

  if (progressView && progressView.classList.contains('active')) {
    progressView.classList.remove('active');
    if (homeView) homeView.classList.add('active');
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === 'home') btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }

  setTimeout(() => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 60);
};

function handleInitialRoute() {
  const hash = window.location.hash;
  if (hash === '#progress' || hash === '#department-progress') {
    switchMainTab('progress');
  } else if (hash === '#rules' || hash === '#ai-guide' || hash === '#prompts') {
    switchMainTab('home');
    setTimeout(() => {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  } else if (hash === '#submit') {
    openSubmissionModal();
  }
}

function setupGlobalModalEvents() {
  window.addEventListener('click', (e) => {
    const subModal = document.getElementById('submission-modal');
    if (e.target === subModal) {
      closeSubmissionModal();
    }
    const detailModal = document.getElementById('entry-detail-modal');
    if (e.target === detailModal) {
      closeEntryDetailModal();
    }
    const successModal = document.getElementById('success-modal');
    if (e.target === successModal) {
      closeSuccessModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSubmissionModal();
      closeEntryDetailModal();
      closeSuccessModal();
    }
  });
}
