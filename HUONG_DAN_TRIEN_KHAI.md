# HƯỚNG DẪN TRIỂN KHAI & VẬN HÀNH WEBSITE CUỘC THI AI EVNHCMC 2026

Website đã được xây dựng hoàn chỉnh và sẵn sàng sử dụng tại thư mục:
`d:\5. CONG_VIEC\VŨNG TÀU\Antigraviti_PCVT\CuocThi_AI_EVNHCMC`

---

## 1. Các liên kết tài nguyên đã tích hợp sẵn
- **Thư mục Google Drive lưu tác phẩm**:  
  `https://drive.google.com/drive/folders/1u2rEZ2IECYFk-YQK2TXW_DAqvhjh7BWR?usp=sharing`  
  *(ID: `1u2rEZ2IECYFk-YQK2TXW_DAqvhjh7BWR`)*
- **Google Sheets nhận dữ liệu dự thi**:  
  `https://docs.google.com/spreadsheets/d/1qu5hKfIh-0eD85olPyBcg7IC-IqQ7Z9ZBtR2qBAOkjQ/edit?usp=sharing`  
  *(ID: `1qu5hKfIh-0eD85olPyBcg7IC-IqQ7Z9ZBtR2qBAOkjQ`)*

---

## 2. Kích hoạt Backend Google Apps Script (Chỉ mất 2 phút)

Để các bài nộp từ website được lưu thẳng vào Google Sheet và file tự động upload vào thư mục Google Drive:

1. **Mở Google Sheet dự thi**:
   Truy cập vào [Google Sheet](https://docs.google.com/spreadsheets/d/1qu5hKfIh-0eD85olPyBcg7IC-IqQ7Z9ZBtR2qBAOkjQ/edit?usp=sharing).
2. **Mở trình soạn thảo mã**:
   Trên thanh công cụ của Sheet, nhấn vào **Tiện ích mở rộng (Extensions)** ➔ Chọn **Apps Script**.
3. **Dán mã nguồn**:
   - Xóa hết mã mặc định trong file `Code.gs`.
   - Mở file `gas_backend.js` trong thư mục dự án, copy toàn bộ nội dung và dán vào.
   - Nhấn biểu tượng đĩa mềm **Save** (hoặc nhấn `Ctrl + S`).
4. **Khởi tạo bảng (Chỉ chạy 1 lần)**:
   - Ở thanh công cụ bên trên Apps Script, chọn hàm `initSheet` và nhấn **Run (Chạy)**.
   - Khi Google hỏi cấp quyền truy cập vào Sheet và Drive của bạn, chọn **Xem lại quyền (Review permissions)** ➔ Chọn tài khoản của bạn ➔ Nhấn **Nâng cao (Advanced)** ➔ Chọn **Đi tới dự án (không an toàn)** ➔ Nhấn **Cho phép (Allow)**.
   - Script sẽ tự động tạo bảng `BaiDuThi` với định dạng màu xanh EVN chuyên nghiệp và đầy đủ 18 cột tiêu đề chuẩn KHLT 53.
5. **Triển khai Web App (Deploy)**:
   - Nhấn nút **Triển khai (Deploy)** ở góc trên bên phải ➔ Chọn **Triển khai mới (New deployment)**.
   - Nhấn vào biểu tượng bánh răng ⚙️ bên cạnh "Chọn loại", chọn **Ứng dụng web (Web app)**.
   - Mô tả: `EVNHCMC AI Contest API`.
   - **Thực thi dưới dạng (Execute as)**: Chọn **Tôi (Me - email của bạn)**.
   - **Ai có quyền truy cập (Who has access)**: Chọn **Bất kỳ ai (Anyone)** *(Rất quan trọng để thí sinh gửi bài không cần đăng nhập tài khoản Google)*.
   - Nhấn nút **Triển khai (Deploy)**.
6. **Lấy URL Web App**:
   - Sao chép đường dẫn **URL ứng dụng web** (có dạng `https://script.google.com/macros/s/.../exec`).
7. **Kích hoạt trên Website**:
   - Mở trang web `index.html`.
   - Trên thanh menu góc phải, nhấn vào nút **⚙️ Cấu hình API**.
   - Dán URL vừa sao chép vào và nhấn **OK**. Trang web sẽ lưu cấu hình này và từ nay mọi bài thi sẽ gửi trực tiếp vào hệ thống của bạn!

---

## 3. Các tính năng nổi bật của Website

1. **Giao diện chuẩn UI/UX Pro Max**:
   - Tông màu công nghệ điện lực hiện đại: Xanh EVN, Cyan ánh điện `#00D2FF`, Xanh lá tiết kiệm điện `#10B981`, Vàng hổ phách `#F59E0B`.
   - Hiệu ứng phát sáng neon mượt mà, hỗ trợ tốt trên cả máy tính và điện thoại.
2. **Đồng hồ đếm ngược (Countdown Timer)**:
   - Tự động đếm lùi đến hạn chót nhận bài thi: 23:59:59 ngày **15/10/2026** theo KHLT 53.
3. **Cẩm nang AI Agent thực chiến (AI Master Hub)**:
   - Hướng dẫn chi tiết quy trình 3 bước sử dụng **ChatGPT, Google Gemini, NotebookLM, Kling AI, Canva, ElevenLabs**.
   - Mẹo đặc biệt khai thác tính năng tự động tạo **Audio Podcast đối thoại 2 người của NotebookLM** từ tài liệu ngành điện để đạt điểm sáng tạo cao nhất từ Ban Giám khảo.
4. **Thư viện Prompt mẫu chuyên ngành 1-Click Copy**:
   - Đầy đủ các prompt mẫu: Kịch bản video TikTok 45s an toàn mùa bão, mẹo dùng máy lạnh tiết kiệm điện 30%, prompt tạo ảnh người thợ điện EVN siêu thực, dàn ý Infographic 10 quy tắc hành lang an toàn điện, prompt soạn bản thuyết minh ý tưởng chuẩn Điều 5 KHLT 53.
   - Nút bấm **Sao chép Prompt** tức thì với thông báo toast mượt mà và làm nổi bật các biến số cần thay thế `[ ]`.
5. **Form nộp bài trực tuyến**:
   - Bám sát 100% mẫu quy định tại KHLT 53.
   - Hỗ trợ kéo thả tải file trực tiếp (lưu tự động vào Google Drive).
   - Hỗ trợ link Google Drive/OneDrive dự phòng cho các video lớn > 25MB theo đúng chỉ dẫn của Kế hoạch.
   - Tự động cấp mã dự thi duy nhất dạng `EVN-AI-001`, `EVN-AI-002`... sau khi nộp thành công.

---

## 4. Cách chạy và chia sẻ Website

- **Mở trực tiếp trên máy tính**: Chỉ cần nhấp đúp chuột vào file `index.html`.
- **Đưa lên mạng nội bộ hoặc Vercel / GitHub Pages**:
  - Toàn bộ source code chỉ gồm 3 file tĩnh: `index.html`, `style.css`, `app.js` (không cần cài đặt Node.js hay build phức tạp, chạy cực kỳ nhẹ và nhanh).
  - Bạn có thể đưa thư mục này lên GitHub Pages, Vercel, hoặc hosting nội bộ của EVNHCMC trong vòng chưa đầy 1 phút.
