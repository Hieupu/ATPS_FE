import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import { MenuBook, Person, CalendarToday } from "@mui/icons-material";
import Chip from "@mui/material/Chip";

const BookingInfoForm = ({
  instructor,
  selectedCourseId,
  setSelectedCourseId,
  selectedWeek,
  setSelectedWeek,
  availableWeeks,
  courseInfo,
}) => {
  return (
    <Box>
      {/* Chọn khóa học */}
      <FormControl fullWidth required sx={{ mb: 2 }}>
        <InputLabel id="select-course-label">Chọn khóa học</InputLabel>
        <Select
          labelId="select-course-label"
          label="Chọn khóa học"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          startAdornment={
            <MenuBook sx={{ mr: 1, color: "text.secondary" }} />
          }
        >
          {instructor?.Courses && instructor.Courses.length > 0 ? (
       instructor.Courses.map((course) => (
  <MenuItem
    key={course.CourseID}
    value={course.CourseID}
    disabled={course.Status !== "PUBLISHED"} // khóa học không phải PUBLISHED sẽ không được chọn
  >
    {course.Title}
    {course.Status === "PUBLISHED" && (
      <Chip
        label="Mở"
        size="small"
        color="success"
        sx={{ ml: 1, height: 20 }}
      />
    )}
  </MenuItem>
))

          ) : (
            <MenuItem value="" disabled>
              Giảng viên chưa có khóa học nào
            </MenuItem>
          )}
        </Select>
      </FormControl>

      {/* Chọn giáo viên (hiển thị) */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Chọn giáo viên</InputLabel>
        <Select
          value={instructor?.InstructorID || ""}
          label="Chọn giáo viên"
          disabled
          startAdornment={
            <Person sx={{ mr: 1, color: "text.secondary" }} />
          }
        >
          <MenuItem value={instructor?.InstructorID || ""}>
            {instructor?.FullName || "N/A"}
          </MenuItem>
        </Select>
      </FormControl>

      {/* Chọn tuần bắt đầu học */}
      <FormControl fullWidth required sx={{ mb: 2 }}>
        <InputLabel id="select-week-label">Tuần bắt đầu học</InputLabel>
        <Select
          labelId="select-week-label"
          label="Tuần bắt đầu học"
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          startAdornment={
            <CalendarToday sx={{ mr: 1, color: "text.secondary" }} />
          }
        >
          {availableWeeks.map((week) => (
            <MenuItem key={week.value} value={week.value}>
              {week.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default BookingInfoForm;