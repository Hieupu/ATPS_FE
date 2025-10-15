# 📅 Hướng Dẫn Sử Dụng Quản Lý Lịch Học - Final Version

## ✨ Tính Năng Chính

### 🎯 Điểm Nổi Bật

1. **Scroll xuống** khi click ngày (không popup)
2. **Thêm nhiều ca** cùng lúc
3. **Thời lượng thông minh**: Nhập giờ + phút → tự động tính giờ kết thúc
4. **Validation**: Check trùng ca, ngày đã qua
5. **View-only**: Không sửa/xóa lịch đã qua
6. **Auto-fill**: Từ ngày/đến ngày lấy từ thông tin lớp học

## 📖 Hướng Dẫn Chi Tiết

### 1. Thêm Lịch Cho Một Ngày - Nhiều Ca

**Bước 1**: Vào `/admin/classes`

**Bước 2**: Click **📅 Lịch** trên card lớp học

**Bước 3**: Click vào ngày trên calendar

→ Trang tự động **scroll xuống** phần "Lịch học ngày..."

**Bước 4**: Nhập thông tin ca học

```
Ca 1:
├─ Giờ bắt đầu: 08:00
├─ Thời lượng: 4 giờ 0 phút
└─ Kết thúc: 12:00 (tự động tính)
```

**Bước 5**: Click **➕ Thêm ca học** để thêm ca 2, 3...

```
Ca 2:
├─ Giờ bắt đầu: 13:00
├─ Thời lượng: 3 giờ 30 phút
└─ Kết thúc: 16:30 (tự động tính)
```

**Bước 6**: Click **✅ Lưu tất cả (2 ca)**

✅ **Kết quả**: Cả 2 ca được thêm vào ngày đã chọn!

### 2. Thêm Lịch Hàng Loạt

#### 🔹 Hằng Ngày (Trừ Cuối Tuần)

**Kịch bản**: "Học mỗi ngày T2-T6, 4 giờ/ngày"

```
1. Click "➕ Thêm hàng loạt"
2. Loại lịch: Hằng ngày
3. Từ ngày: 15/01/2025 (tự động điền)
4. Đến ngày: 15/03/2025 (tự động điền)
5. Loại trừ: ✅ Trừ cuối tuần
6. Giờ bắt đầu: 08:00
7. Thời lượng: 4 giờ 0 phút
8. → Giờ kết thúc hiển thị: 12:00
9. Click "✅ Thêm lịch"
```

✅ **Kết quả**: ~44 lịch (2 tháng × 22 ngày làm việc)

#### 🔹 Hằng Tuần (Nhiều Thứ)

**Kịch bản**: "Học T2-T4-T6, 3 giờ/buổi"

```
1. Click "➕ Thêm hàng loạt"
2. Loại lịch: Hằng tuần
3. Chọn các thứ: Click T2, T4, T6 (3 nút sáng)
4. Từ ngày: 01/02/2025
5. Đến ngày: 30/04/2025
6. Giờ bắt đầu: 18:00
7. Thời lượng: 3 giờ 0 phút
8. → Giờ kết thúc: 21:00
9. Click "✅ Thêm lịch"
```

✅ **Kết quả**: ~36 lịch (12 tuần × 3 ngày)

### 3. Validation & Protection

#### ⚠️ Ngày Đã Qua

**Hiện tượng**:

- Ngày hôm nay có border **xanh lá đậm**
- Ngày đã qua không thể thêm/xóa lịch
- Hiển thị badge **"Đã qua"**
- Hiển thị thông báo: "Ngày này đã qua. Chỉ có thể xem..."

**Ứng xử**:

```
Click ngày đã qua → Chỉ xem lịch
Nút "Xóa" bị ẩn
Không có form thêm lịch
```

#### ⚠️ Trùng Ca

**Validation**: Hệ thống check overlap giờ học

```
Đã có: 08:00 - 12:00
Thêm: 10:00 - 14:00
→ ❌ Lỗi: "Ca 1: Trùng với lịch khác (10:00-14:00)"
```

**Các trường hợp bị reject**:

- Ca mới **nằm trong** ca cũ
- Ca mới **overlap đầu** ca cũ
- Ca mới **overlap cuối** ca cũ
- Ca mới **bao trùm** ca cũ

#### ⚠️ Thời Lượng = 0

```
Giờ: 0 - Phút: 0
→ ❌ Lỗi: "Thời lượng phải lớn hơn 0"
```

### 4. Tính Năng Thời Lượng

#### Cách Hoạt Động

```
Input:
├─ Giờ bắt đầu: 08:00
├─ Thời lượng: 4 giờ 30 phút
│
Tính toán:
├─ 08:00 + 4h30m = 12:30
│
Output:
└─ Giờ kết thúc: 12:30
```

#### Ví Dụ

| Bắt đầu | Giờ | Phút | Kết thúc |
| ------- | --- | ---- | -------- |
| 08:00   | 4   | 0    | 12:00    |
| 13:00   | 3   | 30   | 16:30    |
| 18:00   | 2   | 45   | 20:45    |
| 20:00   | 5   | 15   | 01:15\*  |

\*Lưu ý: Nếu qua 24h sẽ wrap về ngày sau (01:15 = 01:15 sáng hôm sau)

#### Phút Mặc Định = 00

Nếu không nhập phút → tự động = 0

```
Nhập: Giờ = 3, Phút = (empty)
→ Hiểu là: 3 giờ 0 phút
```

## 🎨 Giao Diện Mới

### Calendar với Badge

```
┌─────────────────────────────┐
│ T2 │ T3 │ T4 │ T5 │ T6 │ T7 │ CN │
├────┼────┼────┼────┼────┼────┼────┤
│ 1  │ 2  │ 3  │ 4  │ 5  │ 6  │ 7  │
│    │08-│    │13-│    │    │    │
│    │12 │    │16 │    │    │    │
├────┼────┼────┼────┼────┼────┼────┤
│ 8  │ 9  │ 10 │ 11 │ 12 │ 13 │ 14 │
│    │08-│08-│    │    │    │    │
│    │12 │12 │    │    │    │    │
│    │    │13-│    │    │    │    │
│    │    │16 │    │    │    │    │
│    │    │+1 │    │    │    │    │
└────┴────┴────┴────┴────┴────┴────┘
       ↑
  Badge gradient
```

### Form Thêm Nhiều Ca

```
┌─────────────────────────────────────────┐
│ ➕ Thêm lịch học mới                    │
├─────────────────────────────────────────┤
│ ┌────┬──────────────────────────┐      │
│ │Ca 1│ Bắt đầu: [08:00]         │  ✕   │
│ │    │ Thời lượng: [4]giờ [0]phút│      │
│ │    │ Kết thúc: 12:00          │      │
│ └────┴──────────────────────────┘      │
│                                         │
│ ┌────┬──────────────────────────┐      │
│ │Ca 2│ Bắt đầu: [13:00]         │  ✕   │
│ │    │ Thời lượng: [3]giờ [30]phút│    │
│ │    │ Kết thúc: 16:30          │      │
│ └────┴──────────────────────────┘      │
│                                         │
│  [➕ Thêm ca học]  [✅ Lưu tất cả (2 ca)]│
└─────────────────────────────────────────┘
```

## 💡 Best Practices

### ✅ Nên Làm

1. **Thêm hàng loạt** cho lịch cố định

   ```
   VD: T2-T4-T6, 3 tháng
   → Dùng bulk add
   ```

2. **Thêm nhiều ca/ngày** cho ngày đặc biệt

   ```
   VD: Ngày 15/02 có cả sáng và chiều
   → Click ngày, thêm 2 ca
   ```

3. **Kiểm tra trước khi lưu**
   ```
   Xem "Giờ kết thúc" tự động
   Đảm bảo không overlap
   ```

### ❌ Không Nên

1. Thêm quá nhiều ca cùng lúc (>10 ca)
2. Quên check trùng giờ
3. Tạo lịch cho ngày đã qua
4. Set thời lượng > 12 giờ

## 🔧 Tính Năng Nâng Cao

### Thêm Lịch Phức Tạp

**Kịch bản**: "T2,T4 buổi tối 3h, T6 buổi sáng 4h"

**Cách 1**: Bulk Add 2 lần

```
Lần 1:
- Loại: Hằng tuần
- Thứ: T2, T4
- Giờ: 18:00
- Thời lượng: 3h 0m

Lần 2:
- Loại: Hằng tuần
- Thứ: T6
- Giờ: 08:00
- Thời lượng: 4h 0m
```

**Cách 2**: Thủ công từng tuần

```
Click ngày T2 → Thêm ca 18:00-21:00
Click ngày T4 → Thêm ca 18:00-21:00
Click ngày T6 → Thêm ca 08:00-12:00
...lặp lại
```

### Sửa Lịch

**Hiện tại**: Xóa và tạo lại

```
1. Click ngày cần sửa
2. Click "🗑️ Xóa" lịch cũ
3. Click "➕ Thêm lịch học mới"
4. Nhập thông tin mới
5. Lưu
```

**Roadmap**: Sẽ có nút "Edit" trực tiếp

## 📊 Validation Rules

### Rule 1: Không Trùng Ca

```javascript
// Check overlap
(newStart >= oldStart && newStart < oldEnd) ||  // Start trong ca cũ
(newEnd > oldStart && newEnd <= oldEnd) ||      // End trong ca cũ
(newStart <= oldStart && newEnd >= oldEnd)      // Bao trùm ca cũ
→ ❌ Reject
```

### Rule 2: Ngày Đã Qua

```javascript
selectedDate < today
→ ❌ Không cho thêm/xóa
→ ✅ Chỉ cho xem
```

### Rule 3: Thời Lượng > 0

```javascript
hours === 0 && minutes === 0
→ ❌ Reject
```

## 🎯 Ví Dụ Thực Tế

### VD 1: Lớp Học Full-time

**Yêu cầu**:

- T2-T6 hàng tuần
- Sáng: 8h-12h (4 giờ)
- Chiều: 13h-17h (4 giờ)
- Tổng: 8h/ngày × 5 ngày = 40h/tuần

**Cách làm**:

```
Bulk Add Lần 1 (Buổi sáng):
├─ Loại: Hằng ngày
├─ Loại trừ: ✅ Trừ cuối tuần
├─ Giờ: 08:00
├─ Thời lượng: 4h 0m
└─ Kết quả: 44 lịch sáng

Bulk Add Lần 2 (Buổi chiều):
├─ Loại: Hằng ngày
├─ Loại trừ: ✅ Trừ cuối tuần
├─ Giờ: 13:00
├─ Thời lượng: 4h 0m
└─ Kết quả: 44 lịch chiều

Tổng: 88 lịch = 352 giờ học (2 tháng)
```

### VD 2: Lớp Part-time Linh Hoạt

**Yêu cầu**:

- T2, T4: Tối 3h
- T7: Sáng 4h

**Cách làm**:

```
Bulk Add #1:
├─ Loại: Hằng tuần
├─ Thứ: T2, T4
├─ Giờ: 18:00
└─ Thời lượng: 3h 0m

Bulk Add #2:
├─ Loại: Hằng tuần
├─ Thứ: T7
├─ Giờ: 08:00
└─ Thời lượng: 4h 0m
```

### VD 3: Workshop Không Đều

**Yêu cầu**: Mỗi ngày khác nhau

**Cách làm**: Thêm thủ công

```
15/02:
├─ Ca 1: 08:00 - 2h 30m = 10:30
└─ Ca 2: 13:00 - 3h 0m = 16:00

20/02:
└─ Ca 1: 14:00 - 4h 0m = 18:00

25/02:
├─ Ca 1: 09:00 - 3h 0m = 12:00
├─ Ca 2: 13:00 - 2h 0m = 15:00
└─ Ca 3: 15:30 - 2h 30m = 18:00
```

## 🚫 Các Lỗi Thường Gặp

### Lỗi 1: Trùng Ca

```
❌ "Ca 2: Trùng với lịch khác (10:00-14:00)"
```

**Nguyên nhân**:

- Đã có lịch 08:00-12:00
- Thêm lịch 10:00-14:00
- → Overlap!

**Giải pháp**: Đổi giờ không overlap

### Lỗi 2: Ngày Đã Qua

```
❌ "Không thể thêm lịch cho ngày đã qua!"
```

**Nguyên nhân**: Chọn ngày < hôm nay

**Giải pháp**: Chọn ngày trong tương lai

### Lỗi 3: Thời Lượng = 0

```
❌ "Ca 1: Thời lượng phải lớn hơn 0"
```

**Nguyên nhân**: Cả giờ và phút đều = 0

**Giải pháp**: Nhập ít nhất 1

## 🔐 Database Mapping

### Cấu Trúc Timeslot

```sql
CREATE TABLE timeslot (
  TimeslotID INT PRIMARY KEY AUTO_INCREMENT,
  StartTime TIME NOT NULL,         -- HH:mm:ss
  EndTime TIME NOT NULL,           -- HH:mm:ss
  Date DATE NOT NULL,              -- YYYY-MM-DD
  CourseID INT NOT NULL,
  LessonID INT NOT NULL,
  FOREIGN KEY (CourseID) REFERENCES course(CourseID),
  FOREIGN KEY (LessonID) REFERENCES lesson(LessonID)
);
```

### LocalStorage → API

**Hiện tại** (LocalStorage):

```javascript
{
  id: 123456789,
  date: "2025-01-15",
  startTime: "08:00:00",
  endTime: "12:00:00",
  courseId: 1,
  lessonId: null
}
```

**Tương lai** (API):

```javascript
// POST /api/timeslots
{
  startTime: "08:00:00",
  endTime: "12:00:00",
  date: "2025-01-15",
  courseId: 1,
  lessonId: 5  // Gán sau khi tạo lesson
}
```

## 🎓 Tips & Tricks

### Tip 1: Tính Thời Lượng Nhanh

```
Bạn muốn: 08:00 → 11:30

Không cần tính:
├─ Bắt đầu: 08:00
├─ Giờ: 3
├─ Phút: 30
└─ → Tự động: 11:30 ✅
```

### Tip 2: Thêm Nhiều Ca Nhanh

```
Buổi sáng + chiều cùng ngày:

Ca 1: 08:00 + 4h = 12:00
Ca 2: 13:00 + 4h = 17:00
→ Lưu 1 lần = cả 2 ca ✅
```

### Tip 3: Bulk Add Thông Minh

```
Học T2-T5 (4 ngày), trừ lễ:

1. Bulk add T2-T5
2. Sau đó xóa những ngày lễ thủ công
```

### Tip 4: Kiểm Tra Nhanh

```
Muốn xem lớp có bao nhiêu giờ:

1. Vào calendar
2. Count số badge
3. Nhân với thời lượng/ca
```

## 📱 Responsive

### Desktop

- Form inline: Tất cả inputs 1 hàng
- Button remove: Góc phải trên

### Tablet

- Form: Wrap thành 2 hàng
- Inputs: Full width

### Mobile

- Form: Stack dọc
- Button remove: Full width dưới cùng
- Duration inputs: Thu nhỏ (50px)

## 🚀 Shortcuts & Hacks

### Hack 1: Thêm 100 Lịch Nhanh

```bash
# Bulk add: Hằng ngày, 3 tháng, trừ cuối tuần
→ ~66 lịch trong 1 click!
```

### Hack 2: Copy Lịch Từ Lớp Khác

```javascript
// Console (F12)
const from = 1,
  to = 2;
const source = JSON.parse(localStorage.getItem(`schedules_${from}`));
localStorage.setItem(`schedules_${to}`, JSON.stringify(source));
location.reload();
```

### Hack 3: Export Lịch

```javascript
// Console
const courseId = 1;
const schedules = JSON.parse(localStorage.getItem(`schedules_${courseId}`));
console.table(schedules);
// Hoặc
console.log(JSON.stringify(schedules, null, 2));
```

## 🔄 Workflow Hoàn Chỉnh

```
1. Tạo lớp học
   ↓
2. Vào quản lý lịch
   ↓
3. Bulk add lịch chính (T2-T4-T6)
   ↓
4. Thêm lịch đặc biệt (những ngày khác)
   ↓
5. Review calendar
   ↓
6. Xóa/sửa nếu cần
   ↓
7. Quay lại → Thêm học viên
   ↓
8. Done! ✅
```

## ✨ Improvements So Với V1

| Feature         | V1             | V2 Final       |
| --------------- | -------------- | -------------- |
| UI              | Modal popup    | Scroll inline  |
| Số ca/lần       | 1 ca           | Nhiều ca       |
| Thời gian       | Nhập start+end | Start+duration |
| Auto-calculate  | Không          | Có (end time)  |
| Check trùng     | Không          | Có             |
| Check ngày qua  | Không          | Có             |
| View-only past  | Không          | Có             |
| Multi-weekday   | 1 thứ          | Nhiều thứ      |
| Exclude weekend | Không          | Có (3 options) |

---

**Version**: 2.0.0 Final  
**Updated**: 15/10/2025  
**Status**: ✅ Production Ready

**Built with ❤️ by ATPS Team**

