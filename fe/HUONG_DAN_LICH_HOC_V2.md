# 📅 Hướng Dẫn Quản Lý Lịch Học V2.0

## ✨ Tính Năng Mới

### 🎯 Thay Đổi Chính

1. **Trang riêng cho lịch học**: Calendar view trực quan
2. **Thời gian tùy chọn**: Không còn fix cứng 3 buổi
3. **Thêm hàng loạt nâng cao**: Nhiều tùy chọn linh hoạt
4. **MUI Autocomplete**: Tìm kiếm giảng viên thông minh

## 📖 Hướng Dẫn Sử Dụng Chi Tiết

### 1. Thêm Lịch Cho Một Ngày

**Bước 1**: Vào trang quản lý lớp học `/admin/classes`

**Bước 2**: Click nút **📅 Lịch** trên card lớp học

**Bước 3**: Chọn ngày trên calendar (click vào ô ngày)

**Bước 4**: Modal hiện ra:

- 3 **Mẫu nhanh** để chọn:
  - 🌅 Sáng: 08:00-12:00
  - 🌞 Chiều: 13:00-17:00
  - 🌙 Tối: 18:00-21:00
- Hoặc **tự nhập** giờ bắt đầu & kết thúc

**Bước 5**: Click **✅ Thêm lịch**

### 2. Thêm Lịch Hàng Loạt

#### 🔹 Option A: Hằng Ngày

**Kịch bản**: "Thêm lịch mỗi ngày từ 15/01 đến 15/03, trừ cuối tuần"

1. Click **➕ Thêm hàng loạt**
2. Chọn **Loại lịch**: Hằng ngày
3. **Từ ngày**: 15/01/2025 (tự động điền từ lớp học)
4. **Đến ngày**: 15/03/2025 (tự động điền từ lớp học)
5. **Loại trừ**:
   - ✅ Trừ cuối tuần (Thứ 7 & Chủ nhật)
   - hoặc chọn riêng:
     - ☐ Trừ thứ 7
     - ☐ Trừ chủ nhật
6. **Mẫu thời gian**: Click "Sáng" hoặc tự nhập
7. **Giờ bắt đầu**: 08:00
8. **Giờ kết thúc**: 12:00
9. Click **✅ Thêm lịch**

✅ **Kết quả**: Tạo ~44 lịch học (2 tháng × 22 ngày làm việc)

#### 🔹 Option B: Hằng Tuần (Chọn Nhiều Thứ)

**Kịch bản**: "Thêm lịch mỗi Thứ 2, 4, 6 từ 01/02 đến 30/04"

1. Click **➕ Thêm hàng loạt**
2. Chọn **Loại lịch**: Hằng tuần
3. **Từ ngày**: 01/02/2025
4. **Đến ngày**: 30/04/2025
5. **Chọn các thứ**: Click vào nhiều nút
   - ✅ Thứ 2
   - ✅ Thứ 4
   - ✅ Thứ 6
6. **Mẫu thời gian**: Click "Tối"
7. **Giờ bắt đầu**: 18:00
8. **Giờ kết thúc**: 21:00
9. Click **✅ Thêm lịch**

✅ **Kết quả**: Tạo ~36 lịch học (3 tháng × 12 tuần × 3 ngày/tuần)

### 3. Xóa Lịch Học

**Cách 1**: Từ calendar

1. Click vào ngày có lịch
2. Xem danh sách lịch trong ngày
3. Click **🗑️ Xóa** bên cạnh lịch muốn xóa
4. Xác nhận

### 4. Xem Tổng Quan

**Calendar View** hiển thị:

- **Màu xanh đậm**: Ngày hôm nay
- **Badge gradient**: Lịch học (hiển thị giờ)
- **+N**: Nếu có nhiều hơn 2 lịch trong ngày

**Navigation**:

- **◀ Tháng trước**: Xem tháng trước
- **Tháng sau ▶**: Xem tháng sau

## 🎨 Giao Diện

### Calendar

```
┌─────────────────────────────────────┐
│   ◀ Tháng trước   Tháng 10 2025  ▶  │
├──┬──┬──┬──┬──┬──┬──┐
│T2│T3│T4│T5│T6│T7│CN│
├──┼──┼──┼──┼──┼──┼──┤
│ 1│ 2│ 3│ 4│ 5│ 6│ 7│
│  │08│  │13│  │  │  │
│  │-12│  │-17│  │  │  │
├──┼──┼──┼──┼──┼──┼──┤
│ 8│ 9│...
```

### Modal Thêm Hàng Loạt

```
┌────────────────────────────────┐
│ ➕ Thêm lịch hàng loạt         │
├────────────────────────────────┤
│ Loại: [Hằng ngày ▼]           │
│                                │
│ Từ ngày: [15/01/2025]          │
│ Đến ngày: [15/03/2025]         │
│                                │
│ Loại trừ:                      │
│ ☑️ Trừ cuối tuần               │
│                                │
│ Mẫu: [Sáng] [Chiều] [Tối]     │
│                                │
│ Giờ: [08:00] - [12:00]        │
│                                │
│      [❌ Hủy]  [✅ Thêm lịch]  │
└────────────────────────────────┘
```

## 💡 Tips & Best Practices

### 1. Tạo Lịch Nhanh

- Dùng **mẫu nhanh** (Sáng/Chiều/Tối) thay vì nhập thủ công
- **Bulk add** cho lịch dài hạn
- **Trừ cuối tuần** cho lớp học thông thường

### 2. Tổ Chức Lịch Tốt

- Một lớp nên có **2-3 buổi/tuần**
- Tránh lịch trùng giờ (hệ thống chưa check tự động)
- Nên set lịch **trước 1 tháng**

### 3. Kiểm Tra Lịch

- Dùng navigation tháng để xem tổng quan
- Click vào ngày để xem chi tiết
- Badge hiển thị giờ học

## 🔧 Kỹ Thuật

### Cấu Trúc Dữ Liệu

```javascript
// Timeslot (phù hợp DB schema)
{
  id: number,
  date: "YYYY-MM-DD",
  startTime: "HH:mm:ss",
  endTime: "HH:mm:ss",
  courseId: number,
  lessonId: number | null
}
```

### LocalStorage Keys

```javascript
localStorage.setItem(`schedules_${courseId}`, JSON.stringify(schedules));
```

Mỗi lớp học có key riêng: `schedules_1`, `schedules_2`, ...

### API Mapping (Khi kết nối backend)

```javascript
// GET /api/timeslots?courseId=1
[
  {
    timeslotId: 1,
    startTime: "08:00:00",
    endTime: "12:00:00",
    date: "2025-01-15",
    courseId: 1,
    lessonId: 5
  }
]

// POST /api/timeslots
{
  startTime: "08:00:00",
  endTime: "12:00:00",
  date: "2025-01-15",
  courseId: 1,
  lessonId: null
}

// DELETE /api/timeslots/:id
```

## 🎓 Ví Dụ Thực Tế

### Kịch Bản 1: Lớp Frontend (60 giờ)

**Yêu cầu**: Học Thứ 2, 4, 6 mỗi tuần, buổi tối

```
Loại: Hằng tuần
Thời gian: 01/02/2025 - 30/04/2025
Các thứ: ✅ T2  ✅ T4  ✅ T6
Giờ: 18:00 - 21:00 (3 giờ/buổi)

→ 12 tuần × 3 ngày × 3 giờ = 108 giờ
→ Tạo 36 lịch học
```

### Kịch Bản 2: Lớp An toàn thông tin (80 giờ)

**Yêu cầu**: Học mỗi ngày trừ cuối tuần, buổi sáng

```
Loại: Hằng ngày
Thời gian: 15/01/2025 - 15/03/2025
Loại trừ: ✅ Trừ cuối tuần
Giờ: 08:00 - 12:00 (4 giờ/buổi)

→ 2 tháng × 22 ngày × 4 giờ = 176 giờ
→ Tạo 44 lịch học
```

### Kịch Bản 3: Lớp Python (Flexible)

**Yêu cầu**: Học không đều, nhiều khung giờ

```
Cách làm: Thêm thủ công từng ngày
1. Click ngày 05/02 → Chọn 08:00-12:00
2. Click ngày 07/02 → Chọn 13:00-17:00
3. Click ngày 10/02 → Chọn 18:00-21:00
...
```

## ⚙️ Cài Đặt

### Dependencies Mới

```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled date-fns
```

### Import trong Code

```javascript
import { Autocomplete, TextField } from "@mui/material";
import { format, addDays } from "date-fns";
import { vi } from "date-fns/locale";
```

## 🔄 Migration từ V1

### Dữ Liệu Cũ

V1 lưu schedule trong class object:

```javascript
{
  id: 1,
  title: "Lớp A",
  schedule: [
    { day: "Thứ 2", startTime: "18:00", endTime: "20:00", room: "A101" }
  ]
}
```

### Dữ Liệu Mới

V2 tách riêng timeslots:

```javascript
// Class
{
  id: 1,
  title: "Lớp A",
  // Không còn field schedule
}

// Timeslots (localStorage riêng)
localStorage.getItem('schedules_1') = [
  {
    id: 123,
    date: "2025-01-15",
    startTime: "18:00:00",
    endTime: "20:00:00",
    courseId: 1
  }
]
```

### Script Migration

```javascript
// Chạy trong Console (F12)
function migrateSchedules() {
  const classes = JSON.parse(localStorage.getItem("atps_classes") || "[]");

  classes.forEach((cls) => {
    if (cls.schedule && cls.schedule.length > 0) {
      // Convert old format to new
      const timeslots = cls.schedule.map((sch, idx) => ({
        id: Date.now() + idx,
        date: cls.startDate, // Hoặc tính toán dựa trên day
        startTime: sch.startTime + ":00",
        endTime: sch.endTime + ":00",
        courseId: cls.id,
      }));

      localStorage.setItem(`schedules_${cls.id}`, JSON.stringify(timeslots));

      // Remove old schedule field
      delete cls.schedule;
    }
  });

  localStorage.setItem("atps_classes", JSON.stringify(classes));
  console.log("✅ Migration completed!");
  location.reload();
}

// Run migration
migrateSchedules();
```

## 🎯 Các Tùy Chọn Bulk Add

### Hằng Ngày - Options

| Tùy chọn       | Mô tả           | Ví dụ    |
| -------------- | --------------- | -------- |
| Không loại trừ | Tất cả các ngày | 60 ngày  |
| Trừ cuối tuần  | Chỉ T2-T6       | ~44 ngày |
| Trừ thứ 7      | T2-T6 + CN      | ~52 ngày |
| Trừ chủ nhật   | T2-T7           | ~52 ngày |

### Hằng Tuần - Chọn Nhiều Thứ

**Ví dụ Combinations**:

```
✅ T2 T4 T6          → 3 ngày/tuần (Mon-Wed-Fri pattern)
✅ T3 T5             → 2 ngày/tuần (Tue-Thu pattern)
✅ T7 CN             → Cuối tuần only
✅ T2 T3 T4 T5 T6    → 5 ngày/tuần (weekdays)
```

## 📊 So Sánh V1 vs V2

| Feature        | V1            | V2            |
| -------------- | ------------- | ------------- |
| Thêm lịch      | Trong form    | Trang riêng   |
| UI             | Input fields  | Calendar view |
| Thời gian      | Nhập thủ công | Mẫu + Custom  |
| Bulk add       | Không         | Có (nâng cao) |
| Trừ cuối tuần  | Không         | Có            |
| Chọn nhiều thứ | Không         | Có            |
| Tìm GV         | Dropdown      | Autocomplete  |
| Database ready | Không         | Có            |

## 🚀 Advanced Usage

### Tạo Lịch Cho Khóa 3 Tháng

**Scenario**:

- Thứ 2, 4: Buổi tối (18:00-21:00)
- Thứ 6: Buổi sáng (08:00-12:00)

**Cách làm**:

1. **Lần 1**: Bulk add Thứ 2, 4

   - Loại: Hằng tuần
   - Thứ: T2, T4
   - Giờ: 18:00-21:00

2. **Lần 2**: Bulk add Thứ 6
   - Loại: Hằng tuần
   - Thứ: T6
   - Giờ: 08:00-12:00

→ Tổng: ~36 lịch (T2,T4) + 12 lịch (T6) = 48 lịch

### Sửa Lịch Đã Tạo

**Hiện tại**: Chỉ có thể xóa và tạo lại

**Roadmap**: Sẽ có chức năng edit trong tương lai

## 🔐 Data Persistence

### LocalStorage Structure

```javascript
// schedules_1
[
  {
    id: 1697123456789,
    date: "2025-01-15",
    startTime: "08:00:00",
    endTime: "12:00:00",
    courseId: 1,
    lessonId: null,
  },
  // ... more schedules
];
```

### Backup Dữ Liệu

```javascript
// Export tất cả schedules
function exportSchedules() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("schedules_")) {
      data[key] = JSON.parse(localStorage.getItem(key));
    }
  }
  console.log(JSON.stringify(data, null, 2));
  // Copy từ console để backup
}
```

### Restore Dữ Liệu

```javascript
// Paste backup data vào biến backupData
const backupData = {
  /* ... */
};

function restoreSchedules(data) {
  Object.entries(data).forEach(([key, value]) => {
    localStorage.setItem(key, JSON.stringify(value));
  });
  console.log("✅ Restored!");
  location.reload();
}

restoreSchedules(backupData);
```

## 🐛 Troubleshooting

### Lỗi: "Không tìm thấy lớp học"

**Nguyên nhân**: courseId không hợp lệ

**Giải pháp**:

```javascript
// Check localStorage
const classes = JSON.parse(localStorage.getItem("atps_classes"));
console.log(classes);
```

### Lịch không hiển thị

**Nguyên nhân**: LocalStorage bị lỗi

**Giải pháp**:

```javascript
// Clear schedules
localStorage.removeItem("schedules_1");
location.reload();
```

### Date-fns lỗi locale

**Nguyên nhân**: Import sai

**Giải pháp**:

```javascript
import { vi } from "date-fns/locale";
format(date, "MMMM yyyy", { locale: vi });
```

## 📱 Responsive

### Desktop (>968px)

- Calendar: 7 cột rõ ràng
- Min height: 100px/ô
- Weekday selector: 1 hàng

### Tablet (768-968px)

- Calendar: Thu nhỏ
- Min height: 80px/ô
- Buttons wrap

### Mobile (<768px)

- Calendar: Compact
- Min height: 60px/ô
- Template buttons: Stack
- Weekday buttons: 2 hàng

## 🎓 Best Practices

### DO ✅

- Sử dụng mẫu nhanh cho tiết kiệm thời gian
- Bulk add cho lịch dài hạn
- Kiểm tra lịch trước khi lưu
- Backup localStorage định kỳ

### DON'T ❌

- Thêm quá nhiều lịch (>200) - có thể lag
- Quên trừ cuối tuần (nếu không học cuối tuần)
- Set thời gian kết thúc < bắt đầu
- Tạo lịch cho ngày đã qua

## 📞 Support

### Báo Lỗi

Nếu gặp lỗi, cung cấp:

1. Console log (F12)
2. LocalStorage data
3. Các bước tái hiện lỗi

### Feature Request

Gợi ý tính năng mới tại GitHub Issues

## 🔄 Roadmap

### Version 2.1

- [ ] Edit timeslot (không chỉ xóa)
- [ ] Conflict detection
- [ ] View lịch dạng list
- [ ] Filter theo thời gian

### Version 2.2

- [ ] Export PDF/Excel
- [ ] Import từ file
- [ ] Template lưu sẵn
- [ ] Copy lịch từ lớp khác

### Version 3.0

- [ ] Drag & drop schedule
- [ ] Recurring patterns
- [ ] Instructor conflict check
- [ ] Room booking system

---

**Version**: 2.0.0  
**Updated**: 15/10/2025  
**Author**: ATPS Team  
**Status**: ✅ Production Ready

