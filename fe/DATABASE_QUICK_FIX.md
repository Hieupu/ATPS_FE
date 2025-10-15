# ⚡ DATABASE QUICK FIX - TÓM TẮT NHANH

## 🚨 VẤN ĐỀ

Frontend đã hoàn thiện nhưng **CHƯA TƯƠNG THÍCH 100%** với database MySQL hiện tại.

### ❌ Các lỗi sẽ xảy ra khi kết nối backend:

1. **Không lưu được `instructorId`, `startDate`, `endDate`, `maxStudents`** → Lỗi insert
2. **Không lưu được `timeslot` với `lessonId = null`** → Lỗi constraint vi phạm
3. **Thiếu thông tin enrollment** → Dữ liệu không đầy đủ

---

## ✅ GIẢI PHÁP - 3 BƯỚC (15 phút)

### Bước 1: Backup (2 phút)

```bash
mysqldump -u root -p atps > backup_atps_$(date +%Y%m%d).sql
```

### Bước 2: Cập nhật database (5 phút)

```bash
cd fe/database
mysql -u root -p atps < UPDATE_SCHEMA_V2.sql
```

### Bước 3: Kiểm tra (3 phút)

```sql
mysql -u root -p atps

-- Kiểm tra bảng course
DESC course;
-- Phải có: InstructorID, StartDate, EndDate, MaxStudents

-- Kiểm tra bảng timeslot
DESC timeslot;
-- LessonID phải là NULL allowed

-- Test insert
INSERT INTO course (Title, Description, Duration, TuitionFee, Status, InstructorID, StartDate, EndDate, MaxStudents)
VALUES ('Test', 'Test', 60, 5000000, 'Active', 1, '2025-01-15', '2025-03-15', 30);

INSERT INTO timeslot (StartTime, EndTime, Date, CourseID, LessonID)
VALUES ('08:00:00', '12:00:00', '2025-01-15', LAST_INSERT_ID(), NULL);

-- Xóa test data
DELETE FROM timeslot WHERE Date = '2025-01-15';
DELETE FROM course WHERE Title = 'Test';

SELECT '✅ Everything works!' AS result;
```

---

## 📊 THAY ĐỔI CỤ THỂ

### Bảng `course` - Thêm 4 cột mới

| Cột          | Kiểu dữ liệu | Mô tả                      |
| ------------ | ------------ | -------------------------- |
| InstructorID | INT NULL     | FK → instructor            |
| StartDate    | DATE NULL    | Ngày bắt đầu lớp học       |
| EndDate      | DATE NULL    | Ngày kết thúc lớp học      |
| MaxStudents  | INT NULL     | Sĩ số tối đa (default: 30) |

### Bảng `timeslot` - Sửa constraint

- **Trước**: `LessonID INT NOT NULL` (Composite PK)
- **Sau**: `LessonID INT NULL` (Simple PK = TimeslotID)

---

## 🔄 ROLLBACK (Nếu có lỗi)

```bash
# Phương án 1: Restore backup
mysql -u root -p atps < backup_atps_20251015.sql

# Phương án 2: Chạy script rollback
mysql -u root -p atps < database/ROLLBACK_SCHEMA_V2.sql
```

---

## 📖 TÀI LIỆU CHI TIẾT

| File                                  | Mô tả                              | Độ ưu tiên |
| ------------------------------------- | ---------------------------------- | ---------- |
| **DB_COMPATIBILITY_REPORT.md**        | Báo cáo đầy đủ, phân tích chi tiết | ⭐⭐⭐⭐⭐ |
| **database/HUONG_DAN_CAP_NHAT_DB.md** | Hướng dẫn từng bước                | ⭐⭐⭐⭐   |
| **database/UPDATE_SCHEMA_V2.sql**     | Script SQL cập nhật                | ⭐⭐⭐⭐⭐ |
| **database/ROLLBACK_SCHEMA_V2.sql**   | Script SQL rollback                | ⭐⭐⭐     |

---

## ⚠️ LƯU Ý

- ✅ Script **AN TOÀN**, tự động kiểm tra cột đã tồn tại
- ✅ Có thể chạy **NHIỀU LẦN** mà không lỗi
- ✅ **Transaction-safe** (COMMIT cuối cùng)
- ⚠️ **PHẢI BACKUP** trước khi chạy!
- ⚠️ Rollback sẽ **XÓA** timeslot có `LessonID = NULL`

---

## 🎯 KẾT QUẢ SAU KHI CẬP NHẬT

✅ Frontend hoạt động hoàn hảo với backend  
✅ Insert/Update/Delete không lỗi  
✅ Foreign keys hoạt động đúng  
✅ Dữ liệu đầy đủ, chính xác  
✅ **Production ready**

---

**Thời gian**: 15-20 phút  
**Độ khó**: ⭐⭐ (Dễ)  
**Rủi ro**: ⭐ (Thấp - có backup & rollback)

---

Cần hỗ trợ? Đọc `DB_COMPATIBILITY_REPORT.md` 📖

