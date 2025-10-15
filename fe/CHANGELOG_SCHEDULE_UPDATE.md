# 🔄 Cập Nhật Lớn: Quản Lý Lịch Học V2.0

## 📅 Ngày: 15/10/2025

## ✨ Tính Năng Mới

### 1. 📅 Trang Quản Lý Lịch Học Riêng Biệt

- **Tách riêng** quản lý lịch học ra màn hình độc lập
- **Calendar View** hiển thị lịch theo tháng
- **Chọn ngày** trực quan để thêm/xóa lịch
- **3 buổi học**: Sáng (8h-12h), Chiều (13h-17h), Tối (18h-21h)

### 2. ➕ Thêm Lịch Hàng Loạt

- **Hằng ngày**: Thêm lịch cho mỗi ngày trong khoảng thời gian
- **Hằng tuần**: Chọn thứ cụ thể (VD: Thứ 2 hàng tuần)
- **Chọn nhiều buổi**: Có thể thêm nhiều buổi học trong một lần
- **Tiết kiệm thời gian** khi tạo lịch học dài hạn

### 3. 🎯 MUI Autocomplete cho Giảng Viên

- **Tìm kiếm nhanh**: Gõ tên hoặc chuyên môn để tìm
- **Gợi ý thông minh**: Hiển thị danh sách phù hợp
- **UX tốt hơn**: Thay thế dropdown cũ

## 🔧 Thay Đổi Kỹ Thuật

### Cấu Trúc Database

Đã điều chỉnh để phù hợp với schema MySQL:

```sql
-- Bảng course
course {
  CourseID, Title, Description, Duration,
  TuitionFee, Status
}

-- Bảng instructor
instructor {
  InstructorID, FullName, Major, ...
}

-- Bảng timeslot (lịch học)
timeslot {
  TimeslotID, StartTime, EndTime, Date,
  CourseID, LessonID
}
```

### Dependencies Mới

```json
{
  "@emotion/react": "^11.11.1",
  "@emotion/styled": "^11.11.0",
  "@mui/icons-material": "^5.15.0",
  "@mui/material": "^5.15.0",
  "date-fns": "^3.0.0"
}
```

### Files Mới

```
fe/src/
├── pages/admin/ScheduleManagementPage/
│   ├── ScheduleManagementPage.js  (MỚI)
│   └── style.css                   (MỚI)
└── CHANGELOG_SCHEDULE_UPDATE.md    (MỚI)
```

### Files Đã Sửa

```
✏️ package.json                    - Thêm MUI & date-fns
✏️ routes.js                       - Thêm route schedule
✏️ App.js                          - Import ScheduleManagementPage
✏️ ClassForm.js                    - Dùng MUI Autocomplete, bỏ ScheduleBuilder
✏️ ClassForm.css                   - Thêm style cho info-note
✏️ ClassList.js                    - Bỏ schedule preview, thêm navigate
✏️ ClassList.css                   - Style cho info-note
✏️ ClassManagementPage.js          - Bỏ handleViewSchedule
✏️ classService.js                 - Bỏ schedule từ mock data
✏️ index.js (components)           - Bỏ export ScheduleBuilder
```

### Files Không Còn Sử Dụng

```
❌ ScheduleBuilder.js              - Thay thế bởi ScheduleManagementPage
❌ ScheduleBuilder.css             - Không còn cần thiết
```

## 🎨 UI/UX Improvements

### Calendar View

- **Trực quan**: Nhìn toàn bộ lịch tháng
- **Màu sắc**: Phân biệt buổi sáng/chiều/tối
  - 🌅 Sáng: Vàng (#fff9c4)
  - 🌞 Chiều: Cam (#ffccbc)
  - 🌙 Tối: Tím (#b39ddb)

### Autocomplete

- **Search as you type**: Tìm kiếm tức thì
- **Display format**: "Tên - Chuyên môn"
- **No options text**: "Không tìm thấy giảng viên"

## 📖 Hướng Dẫn Sử Dụng

### Cài Đặt

```bash
cd fe
npm install
npm start
```

### Quản Lý Lịch Học

1. **Vào trang lớp học**: `/admin/classes`
2. **Click nút 📅 Lịch** trên card lớp học
3. **Chọn ngày** trên calendar
4. **Thêm buổi học**: Click "➕ Thêm" cho buổi sáng/chiều/tối

### Thêm Hàng Loạt

1. **Click "➕ Thêm hàng loạt"**
2. **Chọn loại**:
   - Hằng ngày: Mỗi ngày trong khoảng
   - Hằng tuần: Chỉ thứ X mỗi tuần
3. **Chọn khoảng thời gian**: Từ ngày - Đến ngày
4. **Chọn buổi học**: Sáng/Chiều/Tối (có thể chọn nhiều)
5. **Click "✅ Thêm lịch"**

### Chọn Giảng Viên (Form)

1. **Click vào ô Giảng viên**
2. **Gõ tên hoặc chuyên môn**
3. **Chọn từ danh sách gợi ý**

## 🔄 Migration Guide

### Nếu đang có dữ liệu cũ

```javascript
// Clear localStorage để reset data về format mới
localStorage.removeItem("atps_classes");
location.reload();
```

### Kết nối Backend

```javascript
// scheduleService.js (tạo mới)
import apiClient from "./apiClient";

const scheduleService = {
  getSchedulesByCourse: (courseId) => {
    return apiClient.get(`/timeslots?courseId=${courseId}`);
  },

  createTimeslot: (data) => {
    return apiClient.post("/timeslots", data);
  },

  deleteTimeslot: (id) => {
    return apiClient.delete(`/timeslots/${id}`);
  },
};
```

## 🐛 Breaking Changes

⚠️ **Lưu ý**: Các thay đổi này không tương thích ngược

1. **Bỏ trường `schedule`** trong class object
2. **ScheduleBuilder component** không còn được export
3. **ClassForm** không còn quản lý lịch học

## ✅ Checklist Triển Khai

- [x] Cài đặt MUI dependencies
- [x] Tạo ScheduleManagementPage
- [x] Refactor ClassForm với Autocomplete
- [x] Cập nhật routes
- [x] Bỏ schedule preview từ ClassList
- [x] Cập nhật mock data
- [ ] **TODO**: Kết nối API backend
- [ ] **TODO**: Migration dữ liệu production

## 📞 Support

Nếu gặp vấn đề:

1. Clear browser cache & localStorage
2. Chạy `npm install` lại
3. Check console log

## 🎯 Next Steps

### Phase 2.1 (Upcoming)

- [ ] Thêm chức năng duplicate schedule
- [ ] Export lịch học ra PDF/Excel
- [ ] Import lịch từ file
- [ ] Conflict detection (trùng lịch)

### Phase 2.2 (Future)

- [ ] Notification khi có lịch mới
- [ ] Sync với Google Calendar
- [ ] Recurring schedule templates
- [ ] Instructor availability check

---

**Version**: 2.0.0  
**Date**: 15/10/2025  
**Status**: ✅ Ready to Use  
**Migration Required**: Yes (localStorage)

**Built with ❤️ by ATPS Development Team**

