-- =====================================================
-- SCRIPT ROLLBACK DATABASE ATPS V2.0
-- Mục đích: Hoàn tác các thay đổi từ UPDATE_SCHEMA_V2.sql
-- Ngày: 15/10/2025
-- CẢNH BÁO: Chỉ chạy script này nếu muốn hoàn tác!
-- =====================================================

USE `atps`;

START TRANSACTION;

-- =====================================================
-- PHẦN 1: ROLLBACK BẢNG COURSE
-- Xóa các trường đã thêm
-- =====================================================

-- Xóa foreign key constraint
SET @exist_fk := (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = 'atps' 
    AND TABLE_NAME = 'course' 
    AND CONSTRAINT_NAME = 'fk_course_instructor'
);

SET @sql_drop_fk = IF(
  @exist_fk > 0,
  'ALTER TABLE `course` DROP FOREIGN KEY `fk_course_instructor`',
  'SELECT ''Foreign key does not exist'' AS message'
);

PREPARE stmt FROM @sql_drop_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Xóa index
SET @exist_idx := (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = 'atps' 
    AND TABLE_NAME = 'course' 
    AND INDEX_NAME = 'fk_course_instructor_idx'
);

SET @sql_drop_idx = IF(
  @exist_idx > 0,
  'ALTER TABLE `course` DROP INDEX `fk_course_instructor_idx`',
  'SELECT ''Index does not exist'' AS message'
);

PREPARE stmt FROM @sql_drop_idx;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Xóa các cột
ALTER TABLE `course` DROP COLUMN IF EXISTS `MaxStudents`;
ALTER TABLE `course` DROP COLUMN IF EXISTS `EndDate`;
ALTER TABLE `course` DROP COLUMN IF EXISTS `StartDate`;
ALTER TABLE `course` DROP COLUMN IF EXISTS `InstructorID`;

-- =====================================================
-- PHẦN 2: ROLLBACK BẢNG TIMESLOT
-- Khôi phục LessonID NOT NULL và composite PK
-- =====================================================

-- Drop primary key hiện tại
ALTER TABLE `timeslot` DROP PRIMARY KEY;

-- Drop foreign key
ALTER TABLE `timeslot` DROP FOREIGN KEY `fk_timeslot_lesson1`;

-- Sửa LessonID về NOT NULL (cần xóa các record có NULL trước)
DELETE FROM `timeslot` WHERE `LessonID` IS NULL;

ALTER TABLE `timeslot`
  MODIFY COLUMN `LessonID` INT NOT NULL;

-- Tạo lại composite primary key
ALTER TABLE `timeslot`
  ADD PRIMARY KEY (`TimeslotID`, `CourseID`, `LessonID`);

-- Tạo lại foreign key
ALTER TABLE `timeslot`
  ADD CONSTRAINT `fk_timeslot_lesson1`
    FOREIGN KEY (`LessonID`)
    REFERENCES `lesson` (`LessonID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- =====================================================
-- PHẦN 3: ROLLBACK NULLABLE FIELDS
-- Khôi phục các trường NOT NULL
-- =====================================================

-- Instructor: Khôi phục NOT NULL (cần update dữ liệu trước)
UPDATE `instructor` 
SET 
  `DateOfBirth` = '1980-01-01' WHERE `DateOfBirth` IS NULL,
  `ProfilePicture` = 'default.jpg' WHERE `ProfilePicture` IS NULL,
  `Job` = 'N/A' WHERE `Job` IS NULL,
  `Address` = 'N/A' WHERE `Address` IS NULL,
  `CV` = 'N/A' WHERE `CV` IS NULL;

ALTER TABLE `instructor`
  MODIFY COLUMN `DateOfBirth` DATE NOT NULL,
  MODIFY COLUMN `ProfilePicture` VARCHAR(255) NOT NULL,
  MODIFY COLUMN `Job` VARCHAR(100) NOT NULL,
  MODIFY COLUMN `Address` VARCHAR(255) NOT NULL,
  MODIFY COLUMN `CV` VARCHAR(255) NOT NULL;

-- Learner: Khôi phục NOT NULL
UPDATE `learner` 
SET 
  `DateOfBirth` = '2000-01-01' WHERE `DateOfBirth` IS NULL,
  `ProfilePicture` = 'default.jpg' WHERE `ProfilePicture` IS NULL,
  `Job` = 'N/A' WHERE `Job` IS NULL,
  `Address` = 'N/A' WHERE `Address` IS NULL;

ALTER TABLE `learner`
  MODIFY COLUMN `DateOfBirth` DATE NOT NULL,
  MODIFY COLUMN `ProfilePicture` VARCHAR(255) NOT NULL,
  MODIFY COLUMN `Job` VARCHAR(100) NOT NULL,
  MODIFY COLUMN `Address` VARCHAR(255) NOT NULL;

-- =====================================================
-- COMMIT
-- =====================================================
COMMIT;

SELECT '⚠️ Database schema rolled back to original state!' AS message;

-- =====================================================
-- KẾT THÚC SCRIPT ROLLBACK
-- =====================================================


