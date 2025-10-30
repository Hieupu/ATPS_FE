## ATPS Frontend – Ghi chú tương thích với schema/backend mới (Tiếng Việt)

Frontend vẫn tương thích sau khi backend/schema thay đổi. Các điểm chạm chính và kỳ vọng dữ liệu:

### 1) Giá tiền – TuitionFee

- Backend lưu giá ở `course.Fee` nhưng trả ra FE là `TuitionFee`.
- FE tiếp tục dùng `course.TuitionFee` ở mọi nơi.
- Đã thêm định dạng an toàn để giá trị null/undefined hiển thị `0 ₫`.
  - File:
    - `src/pages/course/CourseCard.js`
    - `src/pages/course/CoursesPage.js`
    - `src/pages/course/CourseDetailPage.js`

### 2) Tên lớp – ClassName

- DB dùng `class.Name`; backend alias thành `ClassName` để FE không cần đổi code.
- FE tiếp tục render `ClassName` bình thường.
  - View sử dụng:
    - ProgressPage, AttendancePage, CourseDetailPage (danh sách lớp)

### 3) Lịch và đặt lịch

- API slot trả `Day`, `StartTime`, `EndTime`.
- Booking cần `Date` ở backend; FE hiện tự gửi ngày hôm nay khi đặt lịch 1‑1.
- Group trong `BookSessionDialog` theo `Day` (chuỗi) thay vì parse sang Date.
  - File: `src/components/Booking/BookSessionDialog.js`

### 4) Thanh toán

- Tạo link thanh toán chỉ cần `classID`.
- Server tạo `Enrollment` ở trạng thái Pending và trả `orderCode = EnrollmentID`.
  - Trang sử dụng:
    - CourseDetailPage – gọi `createPaymentLinkApi(selectedClass.ClassID)`

### 5) Không có thay đổi phá vỡ UI

- API giữ các field FE đang dùng (`TuitionFee`, `ClassName`).
- Chi tiết session phía backend trả một object `Timeslot`; FE không phụ thuộc trực tiếp trừ các trang admin.

### 6) Checklist QA

- Danh sách/chi tiết khóa học hiển thị tiền tệ hợp lệ (không NaN).
- Danh sách lớp trong chi tiết khóa học đúng.
- Hộp thoại đặt lịch hiển thị slot theo Day; đặt lịch thành công.
- Link thanh toán hoạt động, điều hướng đúng trang success/failed.
