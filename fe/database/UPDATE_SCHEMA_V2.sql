-- =====================================================
-- SCRIPT CẬP NHẬT DATABASE CHO ATPS V2.0
-- Mục đích: Đồng bộ database với frontend requirements
-- Ngày: 15/10/2025
-- =====================================================

-- Kiểm tra và sử dụng schema
USE `atps`;

-- Bắt đầu transaction để đảm bảo tính toàn vẹn
START TRANSACTION;

-- =====================================================
-- PHẦN 1: CẬP NHẬT BẢNG COURSE
-- Thêm các trường: InstructorID, StartDate, EndDate, MaxStudents
-- =====================================================

-- Kiểm tra xem cột đã tồn tại chưa (tránh lỗi khi chạy lại script)
SET @exist_instructor := (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'atps' 
    AND TABLE_NAME = 'course' 
    AND COLUMN_NAME = 'InstructorID'
);

-- Chỉ thêm cột nếu chưa tồn tại
SET @sql_add_instructor = IF(
  @exist_instructor = 0,
  'ALTER TABLE `course` ADD COLUMN `InstructorID` INT NULL COMMENT ''Giảng viên phụ trách'' AFTER `Status`',
  'SELECT ''Column InstructorID already exists'' AS message'
);

PREPARE stmt FROM @sql_add_instructor;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Thêm StartDate
SET @exist_startdate := (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'atps' 
    AND TABLE_NAME = 'course' 
    AND COLUMN_NAME = 'StartDate'
);

SET @sql_add_startdate = IF(
  @exist_startdate = 0,
  'ALTER TABLE `course` ADD COLUMN `StartDate` DATE NULL COMMENT ''Ngày bắt đầu lớp học'' AFTER `InstructorID`',
  'SELECT ''Column StartDate already exists'' AS message'
);

PREPARE stmt FROM @sql_add_startdate;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Thêm EndDate
SET @exist_enddate := (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'atps' 
    AND TABLE_NAME = 'course' 
    AND COLUMN_NAME = 'EndDate'
);

SET @sql_add_enddate = IF(
  @exist_enddate = 0,
  'ALTER TABLE `course` ADD COLUMN `EndDate` DATE NULL COMMENT ''Ngày kết thúc lớp học'' AFTER `StartDate`',
  'SELECT ''Column EndDate already exists'' AS message'
);

PREPARE stmt FROM @sql_add_enddate;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Thêm MaxStudents
SET @exist_maxstudents := (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'atps' 
    AND TABLE_NAME = 'course' 
    AND COLUMN_NAME = 'MaxStudents'
);

SET @sql_add_maxstudents = IF(
  @exist_maxstudents = 0,
  'ALTER TABLE `course` ADD COLUMN `MaxStudents` INT NULL DEFAULT 30 COMMENT ''Sĩ số tối đa'' AFTER `EndDate`',
  'SELECT ''Column MaxStudents already exists'' AS message'
);

PREPARE stmt FROM @sql_add_maxstudents;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Thêm foreign key constraint cho InstructorID
SET @exist_fk := (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = 'atps' 
    AND TABLE_NAME = 'course' 
    AND CONSTRAINT_NAME = 'fk_course_instructor'
);

SET @sql_add_fk = IF(
  @exist_fk = 0,
  'ALTER TABLE `course` 
    ADD INDEX `fk_course_instructor_idx` (`InstructorID` ASC),
    ADD CONSTRAINT `fk_course_instructor`
      FOREIGN KEY (`InstructorID`)
      REFERENCES `instructor` (`InstructorID`)
      ON DELETE SET NULL
      ON UPDATE CASCADE',
  'SELECT ''Foreign key fk_course_instructor already exists'' AS message'
);

PREPARE stmt FROM @sql_add_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- PHẦN 2: CẬP NHẬT BẢNG TIMESLOT
-- Cho phép LessonID NULL và sửa primary key
-- =====================================================

-- Drop primary key cũ nếu có
SET @exist_pk := (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
  WHERE TABLE_SCHEMA = 'atps' 
    AND TABLE_NAME = 'timeslot' 
    AND CONSTRAINT_TYPE = 'PRIMARY KEY'
    AND CONSTRAINT_NAME = 'PRIMARY'
);

-- Lưu ý: MySQL có thể có composite PK, cần drop và tạo lại
SET @sql_drop_pk = IF(
  @exist_pk > 0,
  'ALTER TABLE `timeslot` DROP PRIMARY KEY',
  'SELECT ''No primary key to drop'' AS message'
);

PREPARE stmt FROM @sql_drop_pk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop foreign key constraint cũ
SET @exist_fk_lesson := (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = 'atps' 
    AND TABLE_NAME = 'timeslot' 
    AND CONSTRAINT_NAME = 'fk_timeslot_lesson1'
);

SET @sql_drop_fk_lesson = IF(
  @exist_fk_lesson > 0,
  'ALTER TABLE `timeslot` DROP FOREIGN KEY `fk_timeslot_lesson1`',
  'SELECT ''Foreign key fk_timeslot_lesson1 does not exist'' AS message'
);

PREPARE stmt FROM @sql_drop_fk_lesson;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Sửa LessonID thành nullable
ALTER TABLE `timeslot`
  MODIFY COLUMN `LessonID` INT NULL COMMENT 'Liên kết với bài học (nullable khi chưa gán)';

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

-- =====================================================
-- PHẦN 3: SỬA CÁC TRƯỜNG BẮT BUỘC THÀNH NULLABLE
-- Cho phép mock data dễ dàng hơn
-- =====================================================

-- Instructor: Cho phép một số trường nullable
ALTER TABLE `instructor`
  MODIFY COLUMN `DateOfBirth` DATE NULL COMMENT 'Ngày sinh (nullable)',
  MODIFY COLUMN `ProfilePicture` VARCHAR(255) NULL COMMENT 'Ảnh đại diện (nullable)',
  MODIFY COLUMN `Job` VARCHAR(100) NULL COMMENT 'Nghề nghiệp (nullable)',
  MODIFY COLUMN `Address` VARCHAR(255) NULL COMMENT 'Địa chỉ (nullable)',
  MODIFY COLUMN `CV` VARCHAR(255) NULL COMMENT 'CV file (nullable)';

-- Learner: Cho phép một số trường nullable
ALTER TABLE `learner`
  MODIFY COLUMN `DateOfBirth` DATE NULL COMMENT 'Ngày sinh (nullable)',
  MODIFY COLUMN `ProfilePicture` VARCHAR(255) NULL COMMENT 'Ảnh đại diện (nullable)',
  MODIFY COLUMN `Job` VARCHAR(100) NULL COMMENT 'Nghề nghiệp (nullable)',
  MODIFY COLUMN `Address` VARCHAR(255) NULL COMMENT 'Địa chỉ (nullable)';

-- =====================================================
-- PHẦN 4: KIỂM TRA KẾT QUẢ
-- =====================================================

-- Hiển thị cấu trúc bảng course
SELECT 'Structure of course table:' AS info;
SHOW CREATE TABLE `course`;

-- Hiển thị cấu trúc bảng timeslot
SELECT 'Structure of timeslot table:' AS info;
SHOW CREATE TABLE `timeslot`;

-- Hiển thị các cột của bảng course
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  IS_NULLABLE, 
  COLUMN_DEFAULT,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'atps' AND TABLE_NAME = 'course'
ORDER BY ORDINAL_POSITION;

-- Hiển thị các cột của bảng timeslot
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  IS_NULLABLE, 
  COLUMN_DEFAULT,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'atps' AND TABLE_NAME = 'timeslot'
ORDER BY ORDINAL_POSITION;

-- =====================================================
-- COMMIT TRANSACTION
-- =====================================================
COMMIT;

-- =====================================================
-- TEST INSERT (Optional - comment out if not needed)
-- =====================================================

-- Test insert course với các trường mới
/*
INSERT INTO `course` 
  (`Title`, `Description`, `Duration`, `TuitionFee`, `Status`, `InstructorID`, `StartDate`, `EndDate`, `MaxStudents`)
VALUES
  ('Test Course Frontend', 'Test từ frontend', 60, 5000000.00, 'Đang hoạt động', 1, '2025-01-15', '2025-03-15', 30);

-- Test insert timeslot với LessonID = NULL
INSERT INTO `timeslot`
  (`StartTime`, `EndTime`, `Date`, `CourseID`, `LessonID`)
VALUES
  ('08:00:00', '12:00:00', '2025-01-15', LAST_INSERT_ID(), NULL);

SELECT 'Test inserts completed successfully!' AS result;
*/

-- =====================================================
-- KẾT THÚC SCRIPT
-- =====================================================

SELECT '✅ Database schema updated successfully for ATPS V2.0!' AS message;


