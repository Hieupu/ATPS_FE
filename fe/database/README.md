# 🗄️ Database Scripts - ATPS V2.0

## 📁 Nội dung thư mục

Thư mục này chứa các script SQL để cập nhật database schema cho phù hợp với frontend requirements.

---

## 📄 Danh sách files

### 1. **UPDATE_SCHEMA_V2.sql** ⭐⭐⭐⭐⭐

**Mục đích**: Script chính để cập nhật database schema.

**Chức năng**:

- Thêm 4 cột mới vào bảng `course`: `InstructorID`, `StartDate`, `EndDate`, `MaxStudents`
- Sửa bảng `timeslot`: Cho phép `LessonID` NULL
- Sửa các trường bắt buộc trong `instructor`, `learner` thành nullable
- Tự động kiểm tra cột đã tồn tại (idempotent)
- Transaction-safe

**Cách dùng**:

```bash
mysql -u root -p atps < UPDATE_SCHEMA_V2.sql
```

**Thời gian**: ~2 phút

---

### 2. **ROLLBACK_SCHEMA_V2.sql** ⚠️

**Mục đích**: Hoàn tác các thay đổi từ `UPDATE_SCHEMA_V2.sql`.

**Chức năng**:

- Xóa 4 cột đã thêm vào `course`
- Khôi phục `timeslot.LessonID` về NOT NULL
- Khôi phục composite primary key
- Khôi phục các trường NOT NULL

**Cảnh báo**:

- ⚠️ Sẽ **XÓA** tất cả timeslot có `LessonID = NULL`
- ⚠️ Chỉ dùng khi cần rollback

**Cách dùng**:

```bash
mysql -u root -p atps < ROLLBACK_SCHEMA_V2.sql
```

---

### 3. **HUONG_DAN_CAP_NHAT_DB.md** 📖

**Mục đích**: Hướng dẫn chi tiết từng bước bằng tiếng Việt.

**Nội dung**:

- Yêu cầu hệ thống
- Các bước thực hiện (6 bước)
- Cách backup & restore
- Test scenarios
- Troubleshooting
- Checklist

**Dành cho**: Admin, DBA, DevOps

---

## 🚀 QUICK START

### Cách nhanh nhất (3 lệnh)

```bash
# 1. Backup
mysqldump -u root -p atps > backup_atps.sql

# 2. Update
mysql -u root -p atps < UPDATE_SCHEMA_V2.sql

# 3. Verify
mysql -u root -p atps -e "DESC course; DESC timeslot;"
```

---

## 📊 So sánh Before/After

### Trước cập nhật

```sql
-- Bảng course (6 cột)
CREATE TABLE course (
  CourseID INT PRIMARY KEY,
  Title VARCHAR(255),
  Description TEXT,
  Duration INT,
  TuitionFee DECIMAL(10,2),
  Status VARCHAR(50)
);

-- Bảng timeslot
-- LessonID NOT NULL
-- Composite PK (TimeslotID, CourseID, LessonID)
```

### Sau cập nhật

```sql
-- Bảng course (10 cột) ✅
CREATE TABLE course (
  CourseID INT PRIMARY KEY,
  Title VARCHAR(255),
  Description TEXT,
  Duration INT,
  TuitionFee DECIMAL(10,2),
  Status VARCHAR(50),
  InstructorID INT NULL,      -- ✅ MỚI
  StartDate DATE NULL,         -- ✅ MỚI
  EndDate DATE NULL,           -- ✅ MỚI
  MaxStudents INT NULL,        -- ✅ MỚI
  FOREIGN KEY (InstructorID) REFERENCES instructor(InstructorID)
);

-- Bảng timeslot
-- LessonID NULL ✅
-- Simple PK (TimeslotID) ✅
```

---

## ✅ CHECKLIST

### Trước khi chạy script

- [ ] Đã đọc `DB_COMPATIBILITY_REPORT.md`
- [ ] Đã backup database
- [ ] Có quyền ALTER TABLE
- [ ] Không có user đang truy cập
- [ ] Đã kiểm tra phiên bản MySQL (>= 5.7)

### Sau khi chạy script

- [ ] Script chạy không lỗi
- [ ] `DESC course` hiển thị 10 cột
- [ ] `DESC timeslot` cho thấy LessonID nullable
- [ ] Test insert thành công
- [ ] Frontend vẫn hoạt động

---

## 🐛 Troubleshooting

### Lỗi: "Table 'atps.course' doesn't exist"

**Giải pháp**: Database chưa có bảng course. Chạy schema gốc trước.

### Lỗi: "Duplicate column name"

**Giải pháp**: Script tự động kiểm tra, có thể bỏ qua.

### Lỗi: "Cannot drop PRIMARY KEY"

**Giải pháp**:

```sql
SET FOREIGN_KEY_CHECKS=0;
-- Chạy lại script
SET FOREIGN_KEY_CHECKS=1;
```

---

## 📞 Hỗ trợ

- **Tài liệu chính**: `../DB_COMPATIBILITY_REPORT.md`
- **Quick fix**: `../DATABASE_QUICK_FIX.md`
- **README**: `../README.md`

---

## 🔍 Testing Script

Sau khi cập nhật, chạy script test:

```sql
-- Test script
USE atps;

-- Test 1: Insert course with new fields
INSERT INTO course
  (Title, Description, Duration, TuitionFee, Status, InstructorID, StartDate, EndDate, MaxStudents)
VALUES
  ('Test Course', 'Test', 60, 5000000, 'Active', 1, '2025-01-15', '2025-03-15', 30);

SET @courseId = LAST_INSERT_ID();

-- Test 2: Insert timeslot with NULL lessonId
INSERT INTO timeslot
  (StartTime, EndTime, Date, CourseID, LessonID)
VALUES
  ('08:00:00', '12:00:00', '2025-01-15', @courseId, NULL);

-- Test 3: Query join
SELECT
  c.CourseID,
  c.Title,
  c.StartDate,
  c.EndDate,
  c.MaxStudents,
  i.FullName AS InstructorName,
  t.Date AS TimeslotDate,
  t.StartTime
FROM course c
LEFT JOIN instructor i ON c.InstructorID = i.InstructorID
LEFT JOIN timeslot t ON c.CourseID = t.CourseID
WHERE c.CourseID = @courseId;

-- Cleanup
DELETE FROM timeslot WHERE CourseID = @courseId;
DELETE FROM course WHERE CourseID = @courseId;

SELECT '✅ All tests passed!' AS result;
```

---

## 📈 Version History

| Version | Date       | Changes                |
| ------- | ---------- | ---------------------- |
| 1.0     | 15/10/2025 | Initial release        |
| 1.1     | 15/10/2025 | Add idempotent checks  |
| 1.2     | 15/10/2025 | Add transaction safety |

---

**Last Updated**: 15/10/2025  
**Status**: ✅ Production Ready  
**Tested**: MySQL 8.0, 5.7

