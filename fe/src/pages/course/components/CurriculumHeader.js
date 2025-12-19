import React from "react";
import { Box, Typography, Stack, Avatar, Chip, Divider } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";

// Hàm format số (ví dụ: 1200 -> 1,200) cho chuyên nghiệp
const formatNumber = (num) => {
  return new Intl.NumberFormat("vi-VN").format(num);
};

const CurriculumHeader = ({
  totalUnits,
  totalLessons,
  totalAssignments,
  totalDuration,
  courseData,
}) => {
  const {
    Title,
    Description,
    InstructorName,
    InstructorAvatar,
    InstructorJob,
    Level,
    Code,
    TotalStudents = 0,
    Duration,
  } = courseData || {};

  return (
    <Box sx={{ mb: 4, mt: 1 }}>
      {/* --- PHẦN 1: HEADER INFO --- */}

      <Box>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "#1f1f1f", mb: 1.5, fontSize: "1rem" }}
        >
          Tổng quan khóa học
        </Typography>

   <Stack
  direction="row"
  alignItems="center"
  spacing={1}
  sx={{
    color: "#373a3c",
    fontSize: "0.875rem",
    flexWrap: "wrap",
    rowGap: 1,
  }}
>
  <MetaItem
    icon={<SchoolIcon fontSize="small" />}
    text={`${totalUnits} chương`}
  />
  <Separator />
  <MetaItem text={`${totalLessons} bài học`} />
  <Separator />
  <MetaItem text={`${totalAssignments} bài tập`} />
</Stack>

      </Box>
    </Box>
  );
};

// Component phụ
const Separator = () => (
  <Box
    component="span"
    sx={{
      width: 3,
      height: 3,
      borderRadius: "50%",
      bgcolor: "#8c8c8c",
      display: { xs: "none", sm: "inline-block" }, // Ẩn dấu chấm trên mobile nếu chật quá
      mx: 1,
    }}
  />
);

const MetaItem = ({ icon, text }) => (
  <Stack direction="row" alignItems="center" spacing={0.8} component="span">
    {icon && (
      <Box
        component="span"
        sx={{ display: "flex", color: "#555", opacity: 0.8 }}
      >
        {icon}
      </Box>
    )}
    <Typography variant="body2" component="span" sx={{ fontWeight: 500 }}>
      {text}
    </Typography>
  </Stack>
);

export default CurriculumHeader;
