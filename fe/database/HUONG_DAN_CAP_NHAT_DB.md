# 📘 HƯỚNG DẪN CẬP NHẬT DATABASE CHO ATPS V2.0

## 🎯 Mục đích

Cập nhật database schema để đồng bộ 100% với frontend requirements, đảm bảo hệ thống hoạt động chính xác khi kết nối backend.

---

## ⚠️ QUAN TRỌNG - ĐỌC KỸ TRƯỚC KHI THỰC HIỆN

### Yêu cầu

- ✅ Quyền truy cập MySQL với quyền ALTER TABLE
- ✅ Đã backup database (xem phần Backup bên dưới)
- ✅ Không có user đang sử dụng hệ thống
- ✅ Đã đọc `DB_COMPATIBILITY_REPORT.md`

### Thời gian dự kiến

- **Backup**: 5 phút
- **Chạy script**: 2 phút
- **Kiểm tra**: 10 phút
- **Tổng**: ~20 phút

---

## 📋 CÁC BƯỚC THỰC HIỆN

### Bước 1: Backup Database (BẮT BUỘC) ⚠️

```bash
# Backup toàn bộ database
mysqldump -u root -p atps > backup_atps_$(date +%Y%m%d_%H%M%S).sql

# Hoặc chỉ backup các bảng cần sửa
mysqldump -u root -p atps course timeslot instructor learner > backup_tables_$(date +%Y%m%d_%H%M%S).sql
```

**Lưu file backup ở nơi an toàn!**

---

### Bước 2: Kiểm tra kết nối MySQL

```bash
# Đăng nhập MySQL
mysql -u root -p

# Kiểm tra database
SHOW DATABASES;
USE atps;
SHOW TABLES;
```

---

### Bước 3: Chạy Script Cập Nhật

#### Option A: Chạy từ command line (Khuyến nghị)

```bash
# Từ thư mục gốc của project
cd fe/database

# Chạy script
mysql -u root -p atps < UPDATE_SCHEMA_V2.sql
```

#### Option B: Chạy trong MySQL Workbench

1. Mở MySQL Workbench
2. Kết nối đến database `atps`
3. File → Open SQL Script → Chọn `UPDATE_SCHEMA_V2.sql`
4. Click ⚡ Execute (hoặc Ctrl+Shift+Enter)
5. Kiểm tra Output log

#### Option C: Copy-paste từng phần

```sql
-- Mở file UPDATE_SCHEMA_V2.sql
-- Copy từng section và chạy tuần tự
-- (Không khuyến nghị cho người mới)
```

---

### Bước 4: Kiểm tra kết quả

```sql
-- Kiểm tra bảng course đã có các trường mới
DESC course;

-- Kết quả mong đợi:
-- +---------------+--------------+------+-----+---------+
-- | Field         | Type         | Null | Key | Default |
-- +---------------+--------------+------+-----+---------+
-- | CourseID      | int          | NO   | PRI | NULL    |
-- | Title         | varchar(255) | NO   |     | NULL    |
-- | Description   | text         | NO   |     | NULL    |
-- | Duration      | int          | NO   |     | NULL    |
-- | TuitionFee    | decimal(10,2)| NO   |     | NULL    |
-- | Status        | varchar(50)  | NO   |     | NULL    |
-- | InstructorID  | int          | YES  | MUL | NULL    | ✅ MỚI
-- | StartDate     | date         | YES  |     | NULL    | ✅ MỚI
-- | EndDate       | date         | YES  |     | NULL    | ✅ MỚI
-- | MaxStudents   | int          | YES  |     | 30      | ✅ MỚI
-- +---------------+--------------+------+-----+---------+

-- Kiểm tra bảng timeslot
DESC timeslot;

-- LessonID phải là NULL allowed:
-- | LessonID   | int  | YES | MUL | NULL    | ✅ Có thể NULL

-- Kiểm tra foreign keys
SELECT
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'atps'
  AND TABLE_NAME IN ('course', 'timeslot');
```

---

### Bước 5: Test Insert Data

```sql
-- Test 1: Insert course với InstructorID
INSERT INTO `course`
  (`Title`, `Description`, `Duration`, `TuitionFee`, `Status`, `InstructorID`, `StartDate`, `EndDate`, `MaxStudents`)
VALUES
  ('Test Course V2', 'Test sau khi update schema', 60, 5000000.00, 'Đang hoạt động', 1, '2025-02-01', '2025-04-01', 25);

-- Kiểm tra
SELECT * FROM course WHERE Title = 'Test Course V2';

-- Test 2: Insert timeslot với LessonID = NULL
INSERT INTO `timeslot`
  (`StartTime`, `EndTime`, `Date`, `CourseID`, `LessonID`)
VALUES
  ('08:00:00', '12:00:00', '2025-02-01', LAST_INSERT_ID(), NULL);

-- Kiểm tra
SELECT * FROM timeslot WHERE Date = '2025-02-01';

-- Test 3: Query kết hợp
SELECT
  c.CourseID,
  c.Title,
  c.StartDate,
  c.EndDate,
  c.MaxStudents,
  i.FullName AS InstructorName,
  i.Major,
  COUNT(DISTINCT t.TimeslotID) AS TotalTimeslots
FROM course c
LEFT JOIN instructor i ON c.InstructorID = i.InstructorID
LEFT JOIN timeslot t ON c.CourseID = t.CourseID
WHERE c.Title = 'Test Course V2'
GROUP BY c.CourseID;

-- Dọn dẹp test data
DELETE FROM timeslot WHERE Date = '2025-02-01';
DELETE FROM course WHERE Title = 'Test Course V2';
```

---

### Bước 6: Update Frontend API Config (Sau khi có backend)

```javascript
// fe/src/constants/config.js

export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:3001/api",
  ENABLE_MOCK: process.env.REACT_APP_ENABLE_MOCK === "true",
  // ... other config
};
```

```javascript
// fe/src/apiServices/classService.js

// Thay localStorage bằng API calls:
const classService = {
  getAllClasses: async () => {
    if (API_CONFIG.ENABLE_MOCK) {
      // Mock data
      return JSON.parse(localStorage.getItem("atps_classes") || "[]");
    }
    // Real API
    const response = await apiClient.get("/courses");
    return response.data;
  },

  // ... other methods
};
```

---

## 🔄 ROLLBACK (Nếu có lỗi)

### Cách 1: Restore từ backup

```bash
# Khôi phục từ file backup
mysql -u root -p atps < backup_atps_20251015_143000.sql
```

### Cách 2: Chạy script rollback

```bash
# Chạy script hoàn tác
mysql -u root -p atps < ROLLBACK_SCHEMA_V2.sql
```

⚠️ **Lưu ý**: Script rollback sẽ XÓA tất cả dữ liệu trong `timeslot` có `LessonID = NULL`!

---

## ✅ CHECKLIST SAU KHI CẬP NHẬT

- [ ] Backup database thành công
- [ ] Script UPDATE_SCHEMA_V2.sql chạy không lỗi
- [ ] `DESC course` hiển thị đầy đủ 10 cột
- [ ] `DESC timeslot` cho thấy `LessonID` là nullable
- [ ] Test insert course thành công
- [ ] Test insert timeslot với NULL thành công
- [ ] Test query kết hợp course + instructor thành công
- [ ] Frontend vẫn hoạt động bình thường với localStorage
- [ ] Document đã được cập nhật

---

## 📊 SO SÁNH SCHEMA

### Trước khi cập nhật

```sql
CREATE TABLE `course` (
  `CourseID` INT NOT NULL AUTO_INCREMENT,
  `Title` VARCHAR(255) NOT NULL,
  `Description` TEXT NOT NULL,
  `Duration` INT NOT NULL,
  `TuitionFee` DECIMAL(10,2) NOT NULL,
  `Status` VARCHAR(50) NOT NULL,
  -- ❌ THIẾU 4 trường
  PRIMARY KEY (`CourseID`)
)
```

### Sau khi cập nhật

```sql
CREATE TABLE `course` (
  `CourseID` INT NOT NULL AUTO_INCREMENT,
  `Title` VARCHAR(255) NOT NULL,
  `Description` TEXT NOT NULL,
  `Duration` INT NOT NULL,
  `TuitionFee` DECIMAL(10,2) NOT NULL,
  `Status` VARCHAR(50) NOT NULL,
  `InstructorID` INT NULL,           -- ✅ MỚI
  `StartDate` DATE NULL,             -- ✅ MỚI
  `EndDate` DATE NULL,               -- ✅ MỚI
  `MaxStudents` INT NULL DEFAULT 30, -- ✅ MỚI
  PRIMARY KEY (`CourseID`),
  FOREIGN KEY (`InstructorID`) REFERENCES `instructor` (`InstructorID`)
)
```

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Duplicate column name 'InstructorID'"

**Nguyên nhân**: Cột đã tồn tại từ lần chạy trước.

**Giải pháp**: Script tự động kiểm tra, không cần xử lý.

---

### Lỗi: "Cannot drop index 'PRIMARY': needed in a foreign key constraint"

**Nguyên nhân**: Composite PK đang được reference.

**Giải pháp**:

```sql
-- Drop tất cả FK trước
ALTER TABLE timeslot DROP FOREIGN KEY fk_timeslot_course1;
ALTER TABLE timeslot DROP FOREIGN KEY fk_timeslot_lesson1;

-- Rồi mới drop PK
ALTER TABLE timeslot DROP PRIMARY KEY;

-- Tạo lại PK và FK
-- (script đã xử lý)
```

---

### Lỗi: "Data too long for column 'LessonID'"

**Nguyên nhân**: Có dữ liệu không hợp lệ.

**Giải pháp**:

```sql
-- Kiểm tra dữ liệu
SELECT * FROM timeslot WHERE LessonID IS NULL OR LessonID = 0;

-- Xóa hoặc sửa
DELETE FROM timeslot WHERE LessonID IS NULL;
```

---

### Lỗi: "Foreign key constraint fails"

**Nguyên nhân**: Dữ liệu reference không tồn tại.

**Giải pháp**:

```sql
-- Kiểm tra instructor IDs
SELECT DISTINCT InstructorID FROM course WHERE InstructorID IS NOT NULL;
SELECT InstructorID FROM instructor;

-- Sửa hoặc set NULL
UPDATE course SET InstructorID = NULL WHERE InstructorID NOT IN (SELECT InstructorID FROM instructor);
```

---

## 📞 HỖ TRỢ

### Liên hệ

- **Team**: ATPS Development Team
- **Email**: support@atps.edu.vn
- **Slack**: #atps-dev-support

### Tài liệu tham khảo

- `DB_COMPATIBILITY_REPORT.md` - Báo cáo chi tiết
- `UPDATE_SCHEMA_V2.sql` - Script chính
- `ROLLBACK_SCHEMA_V2.sql` - Script hoàn tác
- `README.md` - Tổng quan project

---

## ✨ KẾT LUẬN

Sau khi hoàn thành các bước trên, database sẽ **100% tương thích** với frontend. Bạn có thể:

✅ Kết nối backend API  
✅ Insert/Update/Delete data  
✅ Foreign key relationships hoạt động  
✅ Nullable fields linh hoạt  
✅ Production ready

---

**Version**: 1.0  
**Last Updated**: 15/10/2025  
**Status**: ✅ Ready for Production

