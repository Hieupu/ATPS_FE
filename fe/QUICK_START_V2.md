# 🚀 Quick Start - ATPS Class Management V2.0

## ⚡ Cài Đặt Nhanh (5 Phút)

### Bước 1: Cài Dependencies

```bash
cd fe
npm install
```

**Dependencies mới được thêm**:

- Material-UI (MUI): Autocomplete component
- date-fns: Xử lý ngày tháng
- React Router: Đã có

### Bước 2: Chạy App

```bash
npm start
```

Mở browser: `http://localhost:3000`

### Bước 3: Test Ngay

1. ✅ Tự động redirect `/admin`
2. ✅ Click **📚 Quản lý lớp học**
3. ✅ Thấy 3 lớp mẫu
4. ✅ Click nút **📅 Lịch** trên card
5. ✅ Test calendar view!

## 🎯 Các Tính Năng Chính

### 1️⃣ Quản Lý Lớp Học

**Route**: `/admin/classes`

**Chức năng**:

- ✅ Xem danh sách (grid responsive)
- ✅ Thêm/Sửa/Xóa lớp
- ✅ Tìm kiếm & lọc
- ✅ Quản lý học viên
- ✅ Navigate đến lịch học

**New**:

- 🎯 **MUI Autocomplete** cho chọn giảng viên
- 💡 **Info note** hướng dẫn user

### 2️⃣ Quản Lý Lịch Học (MỚI!)

**Route**: `/admin/classes/:id/schedule`

**Chức năng**:

- ✅ Calendar view theo tháng
- ✅ Click ngày → thêm lịch
- ✅ 3 mẫu nhanh: Sáng/Chiều/Tối
- ✅ Tùy chỉnh giờ bắt đầu/kết thúc
- ✅ Thêm hàng loạt:
  - Hằng ngày (với options trừ cuối tuần)
  - Hằng tuần (chọn nhiều thứ)
- ✅ Auto-fill từ thông tin lớp học

### 3️⃣ Quản Lý Học Viên

**Chức năng không đổi**:

- ✅ Modal quản lý học viên
- ✅ Tìm kiếm real-time
- ✅ Thêm/Xóa học viên
- ✅ Check sĩ số

## 🎨 Demo Workflow

### Workflow 1: Tạo Lớp Học Hoàn Chỉnh

```
1. Click "➕ Thêm lớp học mới"
   ↓
2. Điền thông tin:
   - Tên: "Lập trình Web"
   - Mô tả: "Khóa học..."
   - Giảng viên: Gõ "Nguyễn" → Chọn từ list
   - Thời lượng: 60 giờ
   - Học phí: 5,000,000
   - Sĩ số: 30
   - Ngày: 01/02 → 30/04
   ↓
3. Click "✅ Tạo mới"
   ↓
4. Quay lại danh sách → Tìm lớp vừa tạo
   ↓
5. Click "📅 Lịch"
   ↓
6. Click "➕ Thêm hàng loạt"
   ↓
7. Setup:
   - Loại: Hằng tuần
   - Thứ: T2, T4, T6
   - Giờ: 18:00 - 21:00
   ↓
8. Click "✅ Thêm lịch"
   ↓
9. Thấy calendar đầy lịch! 🎉
   ↓
10. Quay lại → Click "👥 HV"
    ↓
11. Thêm học viên
    ↓
12. Done! ✅
```

### Workflow 2: Sửa Lịch

```
1. Vào calendar của lớp
   ↓
2. Click vào ngày có lịch
   ↓
3. Xem danh sách lịch trong ngày
   ↓
4. Click "🗑️ Xóa" để xóa lịch không mong muốn
   ↓
5. Click "➕ Thêm lịch học mới"
   ↓
6. Chọn giờ mới
   ↓
7. Done! ✅
```

## 💾 Dữ Liệu Mock

### Classes (3 lớp)

```javascript
1. Lập trình Web Frontend
   - ID: 1
   - Giảng viên: Nguyễn Văn A
   - Học phí: 5,000,000 VNĐ
   - 3 học viên

2. An toàn thông tin mạng
   - ID: 2
   - Giảng viên: Trần Thị B
   - Học phí: 7,000,000 VNĐ
   - 3 học viên

3. Python cho Data Science
   - ID: 3
   - Giảng viên: Lê Văn C
   - Học phí: 6,000,000 VNĐ
   - 2 học viên
```

### Instructors (5 người)

```
1. Nguyễn Văn A - Công nghệ phần mềm
2. Trần Thị B - An toàn thông tin
3. Lê Văn C - Khoa học dữ liệu
4. Phạm Thị D - Trí tuệ nhân tạo
5. Hoàng Văn E - Mạng máy tính
```

### Learners (7 người)

```
1-7. Học viên Một đến Bảy
```

## 🎯 Test Cases

### Test 1: Autocomplete

```
1. Mở form thêm lớp
2. Click vào ô "Giảng viên"
3. Gõ "Nguyễn"
4. Thấy gợi ý "Nguyễn Văn A - Công nghệ phần mềm"
5. Click chọn
→ ✅ Pass nếu tên hiển thị đúng
```

### Test 2: Calendar Navigation

```
1. Vào schedule page
2. Click "Tháng sau ▶"
3. Calendar chuyển sang tháng 11
4. Click "◀ Tháng trước"
5. Quay lại tháng 10
→ ✅ Pass nếu navigation mượt
```

### Test 3: Bulk Add - Hằng Ngày

```
1. Click "➕ Thêm hàng loạt"
2. Loại: Hằng ngày
3. Từ: 01/02/2025, Đến: 28/02/2025
4. Trừ cuối tuần: ✅
5. Giờ: 08:00-12:00
6. Click "✅ Thêm lịch"
→ ✅ Pass nếu thêm đúng 20 lịch (28 ngày - 8 ngày cuối tuần)
```

### Test 4: Bulk Add - Hằng Tuần (Nhiều Thứ)

```
1. Click "➕ Thêm hàng loạt"
2. Loại: Hằng tuần
3. Chọn thứ: T2, T4, T6
4. Từ: 01/02/2025, Đến: 28/02/2025
5. Giờ: 18:00-21:00
6. Click "✅ Thêm lịch"
→ ✅ Pass nếu thêm đúng 12 lịch (4 tuần × 3 ngày)
```

### Test 5: Xóa Lịch

```
1. Click vào ngày có lịch
2. Click "🗑️ Xóa"
3. Confirm
4. Lịch biến mất khỏi calendar
→ ✅ Pass
```

## 🔧 Customization

### Thay Đổi Mẫu Thời Gian

Sửa trong `ScheduleManagementPage.js`:

```javascript
const DEFAULT_SESSION_TEMPLATES = {
  MORNING: {
    label: "Sáng",
    time: "07:00-11:00", // ← Thay đổi
    startTime: "07:00",
    endTime: "11:00",
  },
  // ... thêm mẫu mới
  CUSTOM: {
    label: "Tùy chỉnh",
    time: "14:00-16:00",
    startTime: "14:00",
    endTime: "16:00",
  },
};
```

### Thay Đổi Màu Calendar

Sửa trong `style.css`:

```css
.schedule-badge-custom {
  background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
  /* Đổi màu gradient */
}

.calendar-day.today {
  border-color: #ff6b6b; /* Màu cho ngày hôm nay */
}
```

## 🔗 Kết Nối Backend

### Step 1: Tạo scheduleService.js

```javascript
// fe/src/apiServices/scheduleService.js
import apiClient from "./apiClient";

const scheduleService = {
  getSchedulesByCourse: (courseId) => {
    return apiClient
      .get(`/timeslots`, {
        params: { courseId },
      })
      .then((res) => res.data);
  },

  createTimeslot: (data) => {
    return apiClient
      .post("/timeslots", {
        startTime: data.startTime,
        endTime: data.endTime,
        date: data.date,
        courseId: data.courseId,
        lessonId: data.lessonId,
      })
      .then((res) => res.data);
  },

  deleteTimeslot: (id) => {
    return apiClient.delete(`/timeslots/${id}`).then((res) => res.data);
  },
};

export default scheduleService;
```

### Step 2: Update ScheduleManagementPage.js

```javascript
// Thay localStorage bằng API calls
import scheduleService from "../../../apiServices/scheduleService";

const loadData = async () => {
  const classData = await classService.getClassById(courseId);
  const schedulesData = await scheduleService.getSchedulesByCourse(courseId);
  setSchedules(schedulesData);
};

const handleAddCustomSession = async () => {
  const newSchedule = {
    /* ... */
  };
  await scheduleService.createTimeslot(newSchedule);
  await loadData();
};
```

## 📚 Documentation

- 📖 [README.md](./README.md) - Tổng quan
- 📖 [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Cài đặt chi tiết
- 📖 [HUONG_DAN_LICH_HOC_V2.md](./HUONG_DAN_LICH_HOC_V2.md) - Hướng dẫn lịch học
- 📖 [CHANGELOG_SCHEDULE_UPDATE.md](./CHANGELOG_SCHEDULE_UPDATE.md) - Thay đổi

## ✨ Highlights V2.0

🎯 **MUI Autocomplete** - Tìm GV nhanh  
📅 **Calendar View** - Trực quan, đẹp mắt  
➕ **Bulk Add** - Tiết kiệm thời gian  
🔧 **Flexible Time** - Tùy chỉnh hoàn toàn  
🎨 **Modern UI** - Gradient, animations  
📱 **Responsive** - Mobile/Tablet/Desktop  
💾 **DB Ready** - Phù hợp schema MySQL

## 🎓 Ready to Demo!

Dự án đã sẵn sàng để:

- ✅ Demo cho stakeholders
- ✅ Development tiếp
- ✅ Tích hợp backend
- ✅ Deploy production

---

**Chúc bạn thành công! 🚀**

**Need help?** Đọc documentation hoặc check console log.

