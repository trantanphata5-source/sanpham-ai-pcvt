/**
 * ============================================================================
 * CUỘC THI: "ỨNG DỤNG TRÍ TUỆ NHÂN TẠO (AI) TRONG CÔNG TÁC TUYÊN TRUYỀN
 *            AN TOÀN ĐIỆN VÀ TIẾT KIỆM ĐIỆN" - EVNHCMC 2026
 * ============================================================================
 * File: gas_backend.js
 * Chức năng: Backend API nhận bài thi, lưu file vào Google Drive, ghi dữ liệu vào Google Sheet.
 * 
 * HƯỚNG DẪN CÀI ĐẶT (2 PHÚT):
 * 1. Mở Google Sheet dự thi:
 *    https://docs.google.com/spreadsheets/d/1qu5hKfIh-0eD85olPyBcg7IC-IqQ7Z9ZBtR2qBAOkjQ/edit
 * 2. Trên thanh menu, chọn: Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. Xoá mã mặc định và dán toàn bộ nội dung file này vào.
 * 4. Nhấn nút "Save" (biểu tượng đĩa mềm hoặc Ctrl+S).
 * 5. Chọn hàm "initSheet" từ danh sách hàm bên trên và nhấn "Run" (Chạy) 1 lần để tạo sẵn tiêu đề các cột và cấp quyền.
 * 6. Nhấn nút "Deploy" (Triển khai) góc phải trên -> "New deployment" (Triển khai mới).
 *    - Chọn loại: Web app (Ứng dụng web).
 *    - Description: "AI Contest EVNHCMC API v1".
 *    - Execute as (Thực thi dưới dạng): "Me" (Tôi - tài khoản của bạn).
 *    - Who has access (Ai có quyền truy cập): "Anyone" (Bất kỳ ai).
 *    - Nhấn "Deploy" -> Chọn "Authorize access" (Ủy quyền truy cập) nếu được hỏi.
 * 7. Sao chép "Web App URL" (có dạng: https://script.google.com/macros/s/.../exec).
 * 8. Dán URL này vào phần cấu hình Web App (hoặc biến `GAS_WEBAPP_URL` trong file `app.js`).
 * ============================================================================
 */

// CẤU HÌNH ID GOOGLE SHEET & GOOGLE DRIVE ĐÃ ĐƯỢC CHỈ ĐỊNH
var SPREADSHEET_ID = '1qu5hKfIh-0eD85olPyBcg7IC-IqQ7Z9ZBtR2qBAOkjQ';
var DRIVE_FOLDER_ID = '1u2rEZ2IECYFk-YQK2TXW_DAqvhjh7BWR';
var SHEET_NAME = 'BaiDuThi';

// DANH SÁCH TIÊU ĐỀ CỘT
var HEADERS = [
  'Mã dự thi',
  'Thời gian nộp',
  'Tên tác phẩm',
  'Thể loại',
  'Tác giả / Trưởng nhóm',
  'MSNV',
  'Đơn vị công tác',
  'Số điện thoại',
  'Email',
  'Thành viên nhóm',
  'Tóm tắt ý tưởng & Thông điệp',
  'Thuyết minh ứng dụng AI',
  'Công cụ AI sử dụng',
  'Link Tác phẩm (Google Drive)',
  'Link Thuyết minh (Google Drive)',
  'Link Drive dự phòng / Video lớn (>25MB)',
  'Thư mục bài thi trên Drive',
  'Trạng thái thẩm định'
];

/**
 * Hàm khởi tạo tiêu đề Sheet và định dạng (Chạy 1 lần ban đầu)
 */
function initSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  // Đặt tiêu đề nếu chưa có
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  
  // Định dạng tiêu đề đẹp mắt, chuyên nghiệp
  var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#003366'); // Xanh EVN truyền thống
  headerRange.setFontColor('#FFFFFF');
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  headerRange.setWrap(true);
  
  sheet.setRowHeight(1, 40);
  sheet.setFrozenRows(1);
  
  // Tự động căn chỉnh độ rộng cột
  for (var i = 1; i <= HEADERS.length; i++) {
    sheet.setColumnWidth(i, 180);
  }
  sheet.setColumnWidth(1, 130); // Mã dự thi
  sheet.setColumnWidth(2, 150); // Thời gian nộp
  sheet.setColumnWidth(3, 240); // Tên tác phẩm
  sheet.setColumnWidth(11, 280); // Tóm tắt ý tưởng
  sheet.setColumnWidth(12, 280); // Thuyết minh AI
  
  Logger.log('Đã khởi tạo sheet ' + SHEET_NAME + ' thành công!');
  return 'Khởi tạo thành công!';
}

/**
 * Xử lý GET request (Dùng để kiểm tra trạng thái hoạt động hoặc lấy thống kê)
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'ping';
  var result = {};
  
  try {
    if (action === 'ping') {
      result = {
        status: 'online',
        message: 'EVNHCMC AI Contest Submission API is active!',
        timestamp: new Date().toISOString(),
        targetFolder: DRIVE_FOLDER_ID
      };
    } else if (action === 'getStats') {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet = ss.getSheetByName(SHEET_NAME);
      var total = sheet ? Math.max(0, sheet.getLastRow() - 1) : 0;
      result = {
        status: 'success',
        totalSubmissions: total
      };
    } else if (action === 'getEntries') {
      var ss2 = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet2 = ss2.getSheetByName(SHEET_NAME);
      var entriesList = [];
      if (sheet2 && sheet2.getLastRow() > 1) {
        var numRows = sheet2.getLastRow() - 1;
        var dataValues = sheet2.getRange(2, 1, numRows, HEADERS.length).getValues();
        for (var i = 0; i < dataValues.length; i++) {
          var r = dataValues[i];
          if (!r[0]) continue;
          entriesList.push({
            id: String(r[0]),
            date: r[1] ? String(r[1]).substring(0, 10) : '',
            title: r[2] || '',
            category: r[3] || 'Ảnh',
            author: r[4] || '',
            msnv: r[5] || '',
            department: r[6] || '',
            teamMembers: r[9] || '',
            description: r[10] || '',
            aiPromptDescription: r[11] || '',
            aiTools: r[12] ? String(r[12]).split(',').map(function(s){return s.trim();}) : [],
            tacPhamDriveUrl: r[13] || '',
            thuyetMinhDriveUrl: r[14] || '',
            linkDriveDuPhong: r[15] || '',
            folderUrl: r[16] || '',
            status: r[17] || 'Đã tiếp nhận'
          });
        }
      }
      result = {
        status: 'success',
        entries: entriesList,
        total: entriesList.length
      };
    } else {
      result = { status: 'unknown_action', action: action };
    }
  } catch (err) {
    result = { status: 'error', message: err.toString() };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Xử lý POST request: Nhận thông tin dự thi và lưu trữ
 */
function doPost(e) {
  var responseData = {};
  
  try {
    var rawContents = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var data = JSON.parse(rawContents);
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      initSheet();
      sheet = ss.getSheetByName(SHEET_NAME);
    }
    
    // Tạo Mã dự thi tự động định dạng: EVN-AI-001, EVN-AI-002...
    var lastRow = sheet.getLastRow();
    var submissionIndex = Math.max(1, lastRow); // Số thứ tự bài thi
    var indexFormatted = ('000' + submissionIndex).slice(-3);
    var submissionId = 'EVN-AI-' + indexFormatted;
    
    var timestamp = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');
    
    // Xử lý lưu trữ trên Google Drive
    var mainFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    
    // Tạo thư mục riêng cho từng tác phẩm để dễ quản lý: "[EVN-AI-001] Tên Tác Phẩm - Tên Tác Giả"
    var cleanTitle = (data.tenTacPham || 'TacPham').replace(/[/\\?%*:|"<>]/g, '_').substring(0, 40);
    var cleanAuthor = (data.hoTen || 'TacGia').replace(/[/\\?%*:|"<>]/g, '_').substring(0, 30);
    var subfolderName = '[' + submissionId + '] ' + cleanTitle + ' - ' + cleanAuthor;
    
    var submissionFolder = mainFolder.createFolder(subfolderName);
    var submissionFolderUrl = submissionFolder.getUrl();
    
    var tacPhamUrl = '';
    var thuyetMinhUrl = '';
    
    // Lưu file tác phẩm nếu gửi kèm dạng Base64
    if (data.fileTacPham && data.fileTacPham.base64) {
      try {
        var tpBytes = Utilities.base64Decode(data.fileTacPham.base64);
        var tpBlob = Utilities.newBlob(tpBytes, data.fileTacPham.type || 'application/octet-stream', data.fileTacPham.name || ('TacPham_' + submissionId));
        var tpFile = submissionFolder.createFile(tpBlob);
        try {
          tpFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        } catch (shareErr) {}
        tacPhamUrl = tpFile.getUrl();
      } catch (fErr) {
        tacPhamUrl = 'Lỗi lưu file: ' + fErr.toString();
      }
    }
    
    // Lưu file thuyết minh (.doc/.pdf) nếu có gửi kèm dạng Base64
    if (data.fileThuyetMinh && data.fileThuyetMinh.base64) {
      try {
        var tmBytes = Utilities.base64Decode(data.fileThuyetMinh.base64);
        var tmBlob = Utilities.newBlob(tmBytes, data.fileThuyetMinh.type || 'application/octet-stream', data.fileThuyetMinh.name || ('ThuyetMinh_' + submissionId));
        var tmFile = submissionFolder.createFile(tmBlob);
        try {
          tmFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        } catch (shareErr2) {}
        thuyetMinhUrl = tmFile.getUrl();
      } catch (fErr2) {
        thuyetMinhUrl = 'Lỗi lưu file: ' + fErr2.toString();
      }
    }
    
    // Chuẩn bị dữ liệu ghi vào hàng mới trên Google Sheet
    var rowData = [
      submissionId,                                  // Cột 1: Mã dự thi
      timestamp,                                     // Cột 2: Thời gian nộp
      data.tenTacPham || '',                         // Cột 3: Tên tác phẩm
      data.theLoai || '',                            // Cột 4: Thể loại (Ảnh / Video / Infographic)
      data.hoTen || '',                              // Cột 5: Tác giả / Trưởng nhóm
      data.msnv || '',                               // Cột 6: MSNV
      data.donVi || '',                              // Cột 7: Đơn vị công tác
      data.sdt || '',                                // Cột 8: Số điện thoại
      data.email || '',                              // Cột 9: Email
      data.thanhVienNhom || '',                      // Cột 10: Thành viên nhóm
      data.tomTatYTuong || '',                       // Cột 11: Tóm tắt ý tưởng & Thông điệp
      data.thuyetMinhAI || '',                       // Cột 12: Thuyết minh ứng dụng AI
      Array.isArray(data.congCuAI) ? data.congCuAI.join(', ') : (data.congCuAI || ''), // Cột 13: Công cụ AI
      tacPhamUrl,                                    // Cột 14: Link tác phẩm Drive
      thuyetMinhUrl,                                 // Cột 15: Link file thuyết minh Drive
      data.linkDriveDuPhong || '',                   // Cột 16: Link Drive dự phòng / Video lớn
      submissionFolderUrl,                           // Cột 17: Thư mục bài thi
      'Đã tiếp nhận hợp lệ'                         // Cột 18: Trạng thái ban đầu
    ];
    
    sheet.appendRow(rowData);
    
    // Căn giữa các cột thông tin ngắn
    var newRowIdx = sheet.getLastRow();
    sheet.getRange(newRowIdx, 1, 1, 2).setHorizontalAlignment('center');
    sheet.getRange(newRowIdx, 4, 1, 1).setHorizontalAlignment('center');
    sheet.getRange(newRowIdx, 6, 1, 1).setHorizontalAlignment('center');
    sheet.getRange(newRowIdx, 18, 1, 1).setHorizontalAlignment('center');
    
    responseData = {
      success: true,
      submissionId: submissionId,
      timestamp: timestamp,
      tenTacPham: data.tenTacPham,
      hoTen: data.hoTen,
      folderUrl: submissionFolderUrl,
      tacPhamUrl: tacPhamUrl,
      thuyetMinhUrl: thuyetMinhUrl,
      message: 'Nộp tác phẩm dự thi thành công!'
    };
    
  } catch (error) {
    responseData = {
      success: false,
      error: error.toString(),
      message: 'Có lỗi xảy ra trong quá trình xử lý: ' + error.toString()
    };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(responseData))
    .setMimeType(ContentService.MimeType.JSON);
}
