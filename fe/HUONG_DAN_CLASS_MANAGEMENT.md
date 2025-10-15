# 📚 Hướng Dẫn Module Quản Lý Lớp Học

## 📋 Tổng Quan

Module **Quản Lý Lớp Học** cho phép Admin:

- ✅ Xem danh sách tất cả lớp học
- ➕ Thêm lớp học mới
- ✏️ Chỉnh sửa thông tin lớp học
- 🗑️ Xóa lớp học
- 📅 Quản lý lịch học chi tiết
- 🧑‍🏫 Phân công giảng viên
- 👥 Quản lý học viên ghi danh

## 🚀 Cài Đặt

### 1. Cài đặt Dependencies

```bash
cd fe
npm install
```

Hoặc nếu dependencies chưa được cài:

```bash
npm install react-router-dom@^6.20.0 axios@^1.6.0
```

### 2. Chạy ứng dụng

```bash
npm start
```

Ứng dụng sẽ chạy tại: `http://localhost:3000`

## 📁 Cấu Trúc Thư Mục

```
fe/src/
├── apiServices/
│   ├── apiClient.js          # Axios instance với interceptors
│   └── classService.js        # Service quản lý lớp học (mock data)
│
├── components/
│   └── features/
│       └── class-management/
│           ├── ClassList.js          # Danh sách lớp học
│           ├── ClassList.css
│           ├── ClassForm.js          # Form thêm/sửa lớp học
│           ├── ClassForm.css
│           ├── ScheduleBuilder.js    # Quản lý lịch học
│           ├── ScheduleBuilder.css
│           ├── StudentSelector.js    # Quản lý học viên
│           ├── StudentSelector.css
│           └── index.js              # Export components
│
├── pages/
│   └── admin/
│       └── ClassManagementPage/
│           ├── ClassManagementPage.js
│           └── style.css
│
├── layouts/
│   ├── AdminLayout.js         # Layout chính cho Admin
│   └── AdminLayout.css
│
├── routingLayer/
│   └── routes.js              # Định nghĩa routes constants
│
├── App.js                     # Main App với routing
└── App.css                    # Global styles
```

## 🎯 Chức Năng Chi Tiết

### 1. Xem Danh Sách Lớp Học

- Hiển thị tất cả lớp học dạng card grid
- Thông tin mỗi lớp: Tên, mô tả, giảng viên, học phí, số học viên, lịch học
- Badge trạng thái: Đang hoạt động, Sắp khai giảng, Đã kết thúc
- Tìm kiếm theo tên, mô tả, giảng viên
- Lọc theo trạng thái

### 2. Thêm/Sửa Lớp Học

Modal form với các trường:

- **Thông tin cơ bản:**

  - Tên lớp học (\*)
  - Mô tả (\*)
  - Giảng viên (\*)
  - Trạng thái (\*)
  - Thời lượng (giờ) (\*)
  - Học phí (VNĐ) (\*)
  - Sĩ số tối đa (\*)
  - Ngày bắt đầu (\*)
  - Ngày kết thúc (\*)

- **Lịch học:**
  - Thêm nhiều lịch học
  - Mỗi lịch: Thứ, Giờ bắt đầu, Giờ kết thúc, Phòng học
  - Xóa lịch học

### 3. Quản Lý Học Viên

Modal quản lý học viên:

- Hiển thị thống kê: Đã ghi danh / Sĩ số tối đa / Còn lại
- Tìm kiếm học viên (tên, email, số điện thoại)
- Hai danh sách:
  - ✅ Học viên đã ghi danh
  - ➕ Học viên có thể thêm
- Thêm/Xóa học viên dễ dàng
- Kiểm tra sĩ số tối đa

### 4. Xem Lịch Học

Alert hiển thị chi tiết lịch học của lớp

### 5. Xóa Lớp Học

- Xác nhận trước khi xóa
- Cảnh báo hành động không thể hoàn tác

## 💾 Lưu Trữ Dữ Liệu

Hiện tại sử dụng **localStorage** để lưu mock data:

```javascript
// Keys được sử dụng
localStorage.setItem("atps_classes", JSON.stringify(classes));
localStorage.setItem("atps_instructors", JSON.stringify(instructors));
localStorage.setItem("atps_learners", JSON.stringify(learners));
```

### Mock Data Mặc Định

- **3 lớp học** với thông tin đầy đủ
- **5 giảng viên**
- **7 học viên**

## 🔗 Tích Hợp Backend Thật

Để kết nối với backend thật, cập nhật file `classService.js`:

```javascript
import apiClient from "./apiClient";

const classService = {
  getAllClasses: () => {
    return apiClient.get("/classes").then((res) => res.data);
  },

  getClassById: (id) => {
    return apiClient.get(`/classes/${id}`).then((res) => res.data);
  },

  createClass: (classData) => {
    return apiClient.post("/classes", classData).then((res) => res.data);
  },

  updateClass: (id, classData) => {
    return apiClient.put(`/classes/${id}`, classData).then((res) => res.data);
  },

  deleteClass: (id) => {
    return apiClient.delete(`/classes/${id}`).then((res) => res.data);
  },

  // ... các methods khác
};
```

Cấu hình API URL trong file `.env`:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

## 🎨 Customization

### Thay Đổi Màu Sắc

Màu chủ đạo trong các file CSS:

```css
/* Màu chính: Gradient tím */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Màu trạng thái */
.status-active {
  background: #28a745;
} /* Xanh lá */
.status-upcoming {
  background: #ffc107;
} /* Vàng */
.status-completed {
  background: #6c757d;
} /* Xám */
```

### Thay Đổi Layout

Sửa trong `AdminLayout.css`:

```css
.sidebar.open {
  width: 280px; /* Thay đổi độ rộng sidebar */
}
```

## 📱 Responsive Design

Module hỗ trợ đầy đủ responsive:

- **Desktop** (>968px): Grid 3 cột, sidebar mở rộng
- **Tablet** (768px-968px): Grid 2 cột
- **Mobile** (<768px): Grid 1 cột, sidebar có thể thu/mở

## 🐛 Xử Lý Lỗi

### Validation Form

- Kiểm tra các trường bắt buộc (\*)
- Validate số (thời lượng, học phí, sĩ số)
- Kiểm tra ngày (ngày kết thúc > ngày bắt đầu)
- Validate lịch học (giờ kết thúc > giờ bắt đầu)

### Error Messages

- Alert hiển thị lỗi rõ ràng bằng tiếng Việt
- Console.error để debug

## 🔐 Bảo Mật

- Token được lưu trong localStorage
- Axios interceptor tự động thêm Authorization header
- Xử lý 401 (Unauthorized) redirect về login

## 📊 Thống Kê

Dashboard hiển thị:

- 📊 Tổng số lớp
- ✅ Đang hoạt động
- ⏰ Sắp khai giảng
- 🎓 Đã kết thúc

## 🔄 Cập Nhật Trong Tương Lai

- [ ] Xuất báo cáo Excel/PDF
- [ ] Import danh sách học viên từ file
- [ ] Thông báo realtime
- [ ] Lịch học dạng calendar view
- [ ] Điểm danh tự động
- [ ] Gửi email thông báo

## 💡 Tips & Tricks

1. **Clear localStorage**: Mở Console và chạy:

   ```javascript
   localStorage.clear();
   ```

2. **Reset dữ liệu về mặc định**: Xóa localStorage và reload trang

3. **Debug**: Mở React DevTools để xem state và props

## 📞 Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:

1. Console log có lỗi không
2. Dependencies đã được cài đủ chưa
3. Port 3000 có bị chiếm không

## 📝 Ghi Chú Kỹ Thuật

- **React**: v19.2.0
- **React Router**: v6.20.0
- **Axios**: v1.6.0
- **Không sử dụng**: Redux, Context API (state local)
- **CSS**: Vanilla CSS (không dùng framework)

---

**Phát triển bởi**: ATPS Team  
**Ngày cập nhật**: 15/10/2025  
**Version**: 1.0.0
