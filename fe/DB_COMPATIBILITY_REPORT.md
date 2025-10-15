# 🔍 BÁO CÁO TƯƠNG THÍCH DATABASE

## 📅 Ngày: 15/10/2025

## ❌ CÁC VẤN ĐỀ PHÁT HIỆN

### 🚨 Vấn đề nghiêm trọng

#### 1. Bảng `course` thiếu các trường quan trọng

**Frontend đang sử dụng**:

```javascript
{
  id: 1,                    // ✅ Tương ứng CourseID
  courseId: 101,            // ⚠️ Duplicate/không rõ mục đích
  title: "...",             // ✅ Tương ứng Title
  description: "...",       // ✅ Tương ứng Description
  duration: 60,             // ✅ Tương ứng Duration
  tuitionFee: 5000000,      // ✅ Tương ứng TuitionFee
  status: "...",            // ✅ Tương ứng Status
  instructorId: 1,          // ❌ KHÔNG TỒN TẠI trong bảng course
  instructorName: "...",    // ❌ Derived field, không nên lưu
  enrolledStudents: [1,2],  // ❌ Nên dùng bảng enrollment
  maxStudents: 30,          // ❌ KHÔNG TỒN TẠI trong bảng course
  startDate: "2025-01-15",  // ❌ KHÔNG TỒN TẠI trong bảng course
  endDate: "2025-03-15"     // ❌ KHÔNG TỒN TẠI trong bảng course
}
```

**Database schema hiện tại**:

```sql
CREATE TABLE `course` (
  `CourseID` INT NOT NULL AUTO_INCREMENT,
  `Title` VARCHAR(255) NOT NULL,
  `Description` TEXT NOT NULL,
  `Duration` INT NOT NULL,
  `TuitionFee` DECIMAL(10,2) NOT NULL,
  `Status` VARCHAR(50) NOT NULL,
  -- ❌ THIẾU: InstructorID, StartDate, EndDate, MaxStudents
  PRIMARY KEY (`CourseID`)
)
```

**Hậu quả**: Khi kết nối API, không thể lưu được các trường `instructorId`, `startDate`, `endDate`, `maxStudents`.

---

#### 2. Bảng `timeslot` có constraint NOT NULL cho `LessonID`

**Frontend đang tạo timeslot**:

```javascript
{
  id: 123456789,
  date: "2025-01-15",
  startTime: "08:00:00",
  endTime: "12:00:00",
  courseId: 1,
  lessonId: null,  // ❌ KHÔNG HỢP LỆ! DB yêu cầu NOT NULL
}
```

**Database constraint**:

```sql
CREATE TABLE `timeslot` (
  `TimeslotID` INT NOT NULL AUTO_INCREMENT,
  `StartTime` TIME NOT NULL,
  `EndTime` TIME NOT NULL,
  `Date` DATE NOT NULL,
  `CourseID` INT NOT NULL,
  `LessonID` INT NOT NULL,  -- ❌ KHÔNG CHO PHÉP NULL
  PRIMARY KEY (`TimeslotID`, `CourseID`, `LessonID`),
  FOREIGN KEY (`LessonID`) REFERENCES `lesson` (`LessonID`)
)
```

**Hậu quả**:

- Insert sẽ **LỖI** vì vi phạm constraint NOT NULL
- Primary key composite bao gồm `LessonID` → không thể NULL

---

#### 3. Quản lý enrollment không đúng schema

**Frontend** đang lưu mảng trong class:

```javascript
{
  id: 1,
  enrolledStudents: [1, 2, 3]  // ❌ Không phù hợp với bảng enrollment
}
```

**Database** yêu cầu dùng bảng riêng:

```sql
CREATE TABLE `enrollment` (
  `EnrollmentID` INT NOT NULL AUTO_INCREMENT,
  `EnrollmentDate` DATE NOT NULL,     -- ❌ Frontend không có
  `Status` VARCHAR(50) NOT NULL,      -- ❌ Frontend không có
  `LearnerID` INT NOT NULL,
  `CourseID` INT NOT NULL,
  PRIMARY KEY (`EnrollmentID`)
)
```

**Hậu quả**: Thiếu thông tin `EnrollmentDate`, `Status` khi thêm học viên.

---

### ⚠️ Vấn đề cần lưu ý

#### 4. Thiếu các trường bắt buộc cho Instructor

**Frontend đang dùng**:

```javascript
{
  id: 1,
  fullName: "Nguyễn Văn A",
  major: "Công nghệ phần mềm",
  email: "nguyenvana@example.com"
}
```

**Database yêu cầu**:

```sql
CREATE TABLE `instructor` (
  `InstructorID` INT NOT NULL AUTO_INCREMENT,
  `FullName` VARCHAR(100) NOT NULL,
  `DateOfBirth` DATE NOT NULL,        -- ❌ Frontend không có
  `ProfilePicture` VARCHAR(255) NOT NULL,  -- ❌ Frontend không có
  `Job` VARCHAR(100) NOT NULL,        -- ❌ Frontend không có
  `Address` VARCHAR(255) NOT NULL,    -- ❌ Frontend không có
  `CV` VARCHAR(255) NOT NULL,         -- ❌ Frontend không có
  `AccID` INT NOT NULL,               -- ❌ Frontend không có
  `Major` VARCHAR(45) NOT NULL
)
```

---

#### 5. Thiếu các trường bắt buộc cho Learner

**Frontend**:

```javascript
{
  id: 1,
  fullName: "Học viên Một",
  email: "hocvien1@example.com",
  phone: "0901234567"
}
```

**Database**:

```sql
CREATE TABLE `learner` (
  `LearnerID` INT NOT NULL AUTO_INCREMENT,
  `FullName` VARCHAR(100) NOT NULL,
  `DateOfBirth` DATE NOT NULL,        -- ❌ Frontend không có
  `ProfilePicture` VARCHAR(255) NOT NULL,  -- ❌ Frontend không có
  `Job` VARCHAR(100) NOT NULL,        -- ❌ Frontend không có
  `Address` VARCHAR(255) NOT NULL,    -- ❌ Frontend không có
  `AccID` INT NOT NULL                -- ❌ Frontend không có
)
```

---

## 💡 GIẢI PHÁP ĐỀ XUẤT

### ✅ Phương án A: Sửa Database Schema (KHUYẾN NGHỊ)

Đây là phương án tốt nhất vì:

- ✅ Giữ nguyên logic frontend đã xây dựng
- ✅ Phù hợp với yêu cầu nghiệp vụ
- ✅ Tránh refactor lại toàn bộ frontend

#### Thay đổi cần thực hiện:

**1. Sửa bảng `course` - Thêm các trường**:

```sql
ALTER TABLE `atps`.`course`
  ADD COLUMN `InstructorID` INT NULL AFTER `Status`,
  ADD COLUMN `StartDate` DATE NULL AFTER `InstructorID`,
  ADD COLUMN `EndDate` DATE NULL AFTER `StartDate`,
  ADD COLUMN `MaxStudents` INT NULL DEFAULT 30 AFTER `EndDate`,
  ADD INDEX `fk_course_instructor_idx` (`InstructorID` ASC),
  ADD CONSTRAINT `fk_course_instructor`
    FOREIGN KEY (`InstructorID`)
    REFERENCES `atps`.`instructor` (`InstructorID`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;
```

**2. Sửa bảng `timeslot` - Cho phép `LessonID` NULL**:

```sql
ALTER TABLE `atps`.`timeslot`
  DROP PRIMARY KEY,
  DROP FOREIGN KEY `fk_timeslot_lesson1`,
  MODIFY COLUMN `LessonID` INT NULL,
  ADD PRIMARY KEY (`TimeslotID`),
  ADD CONSTRAINT `fk_timeslot_lesson1`
    FOREIGN KEY (`LessonID`)
    REFERENCES `atps`.`lesson` (`LessonID`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;
```

**3. Sửa mock data Instructor**:

```sql
-- Thêm các trường mặc định cho mock data
UPDATE `atps`.`instructor`
SET
  `DateOfBirth` = '1985-01-01',
  `ProfilePicture` = 'default.jpg',
  `Job` = 'Giảng viên',
  `Address` = 'Hà Nội',
  `CV` = 'cv_default.pdf',
  `AccID` = 1  -- Cần tạo account tương ứng
WHERE `DateOfBirth` IS NULL;
```

**4. Sửa mock data Learner**:

```sql
UPDATE `atps`.`learner`
SET
  `DateOfBirth` = '2000-01-01',
  `ProfilePicture` = 'default.jpg',
  `Job` = 'Sinh viên',
  `Address` = 'Hà Nội',
  `AccID` = 2  -- Cần tạo account tương ứng
WHERE `DateOfBirth` IS NULL;
```

---

### ⚙️ Phương án B: Sửa Frontend (Không khuyến nghị)

Nếu KHÔNG thể thay đổi DB, cần refactor toàn bộ:

**1. Tách `course` thành 2 entity**:

- `course`: Template khóa học (chung)
- `class`: Instance lớp học cụ thể (với GV, ngày, sĩ số)

**2. Tạo `lesson` trước khi tạo `timeslot`**:

```javascript
// Phải tạo lesson trước
const lesson = await lessonService.create({
  title: "Buổi học 1",
  sessionId: 1,
  unitId: 1,
});

// Rồi mới tạo timeslot
const timeslot = {
  startTime: "08:00:00",
  endTime: "12:00:00",
  date: "2025-01-15",
  courseId: 1,
  lessonId: lesson.LessonID, // Bắt buộc
};
```

**3. Sửa enrollment management**:

```javascript
// Thay vì lưu mảng
enrolledStudents: [1, 2, 3];

// Phải tạo enrollment riêng
await enrollmentService.create({
  enrollmentDate: "2025-01-15",
  status: "Active",
  learnerId: 1,
  courseId: 1,
});
```

**Hậu quả**:

- ❌ Phải refactor toàn bộ `ClassForm`, `ClassList`, `StudentSelector`
- ❌ Phải tạo `LessonService`, `EnrollmentService`, `ClassService`
- ❌ Logic phức tạp hơn nhiều
- ❌ Mất 5-10 ngày công

---

## 📋 SCRIPT SQL HOÀN CHỈNH (Phương án A)

```sql
-- =====================================================
-- SCRIPT CẬP NHẬT DATABASE CHO ATPS V2.0
-- =====================================================

USE `atps`;

-- -----------------------------------------------------
-- 1. Sửa bảng COURSE - Thêm các trường cần thiết
-- -----------------------------------------------------
ALTER TABLE `course`
  ADD COLUMN `InstructorID` INT NULL COMMENT 'Giảng viên phụ trách' AFTER `Status`,
  ADD COLUMN `StartDate` DATE NULL COMMENT 'Ngày bắt đầu lớp học' AFTER `InstructorID`,
  ADD COLUMN `EndDate` DATE NULL COMMENT 'Ngày kết thúc lớp học' AFTER `StartDate`,
  ADD COLUMN `MaxStudents` INT NULL DEFAULT 30 COMMENT 'Sĩ số tối đa' AFTER `EndDate`;

-- Thêm foreign key constraint
ALTER TABLE `course`
  ADD INDEX `fk_course_instructor_idx` (`InstructorID` ASC),
  ADD CONSTRAINT `fk_course_instructor`
    FOREIGN KEY (`InstructorID`)
    REFERENCES `instructor` (`InstructorID`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- -----------------------------------------------------
-- 2. Sửa bảng TIMESLOT - Cho phép LessonID NULL
-- -----------------------------------------------------
-- Drop primary key cũ (composite)
ALTER TABLE `timeslot`
  DROP PRIMARY KEY;

-- Drop foreign key constraint cũ
ALTER TABLE `timeslot`
  DROP FOREIGN KEY `fk_timeslot_lesson1`;

-- Sửa LessonID thành nullable
ALTER TABLE `timeslot`
  MODIFY COLUMN `LessonID` INT NULL COMMENT 'Liên kết với bài học (có thể null khi chưa gán)';

-- Tạo primary key mới (chỉ TimeslotID)
ALTER TABLE `timeslot`
  ADD PRIMARY KEY (`TimeslotID`);

-- Tạo lại foreign key với ON DELETE SET NULL
ALTER TABLE `timeslot`
  ADD CONSTRAINT `fk_timeslot_lesson1`
    FOREIGN KEY (`LessonID`)
    REFERENCES `lesson` (`LessonID`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- Giữ nguyên foreign key với course
-- (không cần thay đổi)

-- -----------------------------------------------------
-- 3. Sửa các trường bắt buộc thành nullable (nếu cần)
-- -----------------------------------------------------

-- Instructor: Cho phép một số trường nullable cho mock data
ALTER TABLE `instructor`
  MODIFY COLUMN `DateOfBirth` DATE NULL,
  MODIFY COLUMN `ProfilePicture` VARCHAR(255) NULL,
  MODIFY COLUMN `Job` VARCHAR(100) NULL,
  MODIFY COLUMN `Address` VARCHAR(255) NULL,
  MODIFY COLUMN `CV` VARCHAR(255) NULL;

-- Learner: Cho phép một số trường nullable
ALTER TABLE `learner`
  MODIFY COLUMN `DateOfBirth` DATE NULL,
  MODIFY COLUMN `ProfilePicture` VARCHAR(255) NULL,
  MODIFY COLUMN `Job` VARCHAR(100) NULL,
  MODIFY COLUMN `Address` VARCHAR(255) NULL;

-- -----------------------------------------------------
-- 4. Kiểm tra thay đổi
-- -----------------------------------------------------
SHOW CREATE TABLE `course`;
SHOW CREATE TABLE `timeslot`;
SHOW CREATE TABLE `instructor`;
SHOW CREATE TABLE `learner`;

-- =====================================================
-- KẾT THÚC SCRIPT
-- =====================================================
```

---

## 🧪 TESTING PLAN

### Test 1: Insert Course với InstructorID

```sql
INSERT INTO `course`
  (`Title`, `Description`, `Duration`, `TuitionFee`, `Status`, `InstructorID`, `StartDate`, `EndDate`, `MaxStudents`)
VALUES
  ('Test Course', 'Test Description', 60, 5000000.00, 'Active', 1, '2025-01-15', '2025-03-15', 30);
```

### Test 2: Insert Timeslot với LessonID = NULL

```sql
INSERT INTO `timeslot`
  (`StartTime`, `EndTime`, `Date`, `CourseID`, `LessonID`)
VALUES
  ('08:00:00', '12:00:00', '2025-01-15', 1, NULL);
```

### Test 3: Query kết hợp Course + Instructor

```sql
SELECT
  c.CourseID,
  c.Title,
  c.InstructorID,
  i.FullName AS InstructorName,
  i.Major,
  c.StartDate,
  c.EndDate,
  c.MaxStudents
FROM `course` c
LEFT JOIN `instructor` i ON c.InstructorID = i.InstructorID;
```

---

## 📊 MAPPING TABLE

### Frontend ↔ Database Field Mapping

| Frontend Field       | Database Table | Database Field | Status | Note                               |
| -------------------- | -------------- | -------------- | ------ | ---------------------------------- |
| `id`                 | `course`       | `CourseID`     | ✅     | Primary key                        |
| `courseId`           | -              | -              | ⚠️     | Có thể bỏ (duplicate)              |
| `title`              | `course`       | `Title`        | ✅     |                                    |
| `description`        | `course`       | `Description`  | ✅     |                                    |
| `duration`           | `course`       | `Duration`     | ✅     |                                    |
| `tuitionFee`         | `course`       | `TuitionFee`   | ✅     |                                    |
| `status`             | `course`       | `Status`       | ✅     |                                    |
| `instructorId`       | `course`       | `InstructorID` | ✅     | **Cần thêm vào DB**                |
| `instructorName`     | -              | -              | ⚠️     | Derived, không lưu DB              |
| `startDate`          | `course`       | `StartDate`    | ✅     | **Cần thêm vào DB**                |
| `endDate`            | `course`       | `EndDate`      | ✅     | **Cần thêm vào DB**                |
| `maxStudents`        | `course`       | `MaxStudents`  | ✅     | **Cần thêm vào DB**                |
| `enrolledStudents[]` | `enrollment`   | `LearnerID`    | ⚠️     | Dùng bảng enrollment               |
| -                    | -              | -              | -      | -                                  |
| **Timeslot**         |                |                |        |                                    |
| `id`                 | `timeslot`     | `TimeslotID`   | ✅     |                                    |
| `date`               | `timeslot`     | `Date`         | ✅     |                                    |
| `startTime`          | `timeslot`     | `StartTime`    | ✅     | Format: HH:mm:ss                   |
| `endTime`            | `timeslot`     | `EndTime`      | ✅     | Format: HH:mm:ss                   |
| `courseId`           | `timeslot`     | `CourseID`     | ✅     |                                    |
| `lessonId`           | `timeslot`     | `LessonID`     | ❌     | **NULL không hợp lệ - cần sửa DB** |

---

## ✅ CHECKLIST TRIỂN KHAI

### Phase 1: Sửa Database (1 ngày)

- [ ] Backup database hiện tại
- [ ] Chạy script ALTER TABLE cho `course`
- [ ] Chạy script ALTER TABLE cho `timeslot`
- [ ] Chạy script MODIFY COLUMN cho `instructor`, `learner`
- [ ] Test insert/update/delete
- [ ] Verify foreign key constraints

### Phase 2: Update Frontend Services (2 giờ)

- [ ] Cập nhật `classService.js` mapping
- [ ] Cập nhật API payload format
- [ ] Thêm xử lý `instructorName` (derived field)
- [ ] Test localStorage → API migration

### Phase 3: Testing (1 ngày)

- [ ] Test create class với instructor
- [ ] Test create timeslot với lessonId = null
- [ ] Test update class
- [ ] Test delete class (cascade)
- [ ] Test enrollment add/remove
- [ ] Integration test E2E

### Phase 4: Documentation (2 giờ)

- [ ] Update API documentation
- [ ] Update database schema docs
- [ ] Update README with new fields

---

## 🎯 KẾT LUẬN

### Khuyến nghị: **Phương án A - Sửa Database**

**Lý do**:

1. ✅ Frontend đã hoàn thiện, logic chuẩn
2. ✅ Chỉ cần 1 ngày để sửa DB
3. ✅ Phù hợp với yêu cầu nghiệp vụ
4. ✅ Dễ maintain trong tương lai

**Công việc cần làm**:

1. Chạy script SQL (10 phút)
2. Test thủ công (2 giờ)
3. Update documentation (1 giờ)

**Tổng thời gian**: ~1 ngày làm việc

---

**Prepared by**: ATPS Development Team  
**Date**: 15/10/2025  
**Version**: 1.0

