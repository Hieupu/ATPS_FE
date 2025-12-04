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
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {Level && (
            <Chip
              label={Level}
              size="small"
              icon={<SignalCellularAltIcon style={{ fontSize: 16 }} />}
              sx={{
                bgcolor: "#e4f0ff",
                color: "#0056d2",
                fontWeight: 700,
                fontSize: "0.7rem",
                borderRadius: "4px",
                height: "24px",
                border: "1px solid rgba(0, 86, 210, 0.1)",
              }}
            />
          )}
          {Code && (
            <Chip
              label={Code}
              size="small"
              sx={{
                bgcolor: "transparent",
                color: "#636363",
                border: "1px solid #e0e0e0",
                fontWeight: 500,
                fontSize: "0.7rem",
                borderRadius: "4px",
                height: "24px",
              }}
            />
          )}
        </Stack>

        {/* Title & Description */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: "#1f1f1f",
            mb: 1.5,
            lineHeight: 1.2,
            fontSize: { xs: "1.75rem", md: "2.125rem" }, // Responsive font size
          }}
        >
          {Title || "Đang tải tiêu đề..."}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "#373a3c",
            mb: 3,
            maxWidth: "800px",
            lineHeight: 1.6,
            fontSize: "1rem",
          }}
        >
          {Description}
        </Typography>

        {/* --- KHU VỰC INFO GIẢNG VIÊN & HỌC VIÊN (ĐÃ FIX) --- */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 2, sm: 3 }}
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          {/* Block Giảng viên */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              src={InstructorAvatar}
              alt={InstructorName}
              sx={{ width: 44, height: 44, border: "1px solid #eee" }} // Tăng size avatar chút cho đẹp
            />
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: "#1f1f1f", lineHeight: 1.2 }}
              >
                {InstructorName}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#666", fontSize: "0.75rem" }}
              >
                {InstructorJob || "Giảng viên"}
              </Typography>
            </Box>
          </Stack>

          {/* Dải ngăn cách dọc (chỉ hiện trên màn hình to) */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              display: { xs: "none", sm: "block" },
              height: "24px",
              alignSelf: "center",
              borderColor: "#e0e0e0",
            }}
          />

          {/* Block Học viên (Đã Fix: Không dùng icon, tập trung vào số liệu) */}
          <Box>
            <Typography
              variant="h6"
              component="span"
              sx={{
                fontWeight: 800,
                color: "#1f1f1f",
                mr: 0.5,
                fontSize: "1.1rem",
              }}
            >
              {formatNumber(TotalStudents)}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#666", fontSize: "0.85rem" }}
            >
              học viên đang học cùng bạn
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ mb: 3, borderColor: "#ebebeb" }} />

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
          <Separator />
          <MetaItem
            icon={<AccessTimeIcon fontSize="small" />}
            text={`${Math.round(Duration || totalDuration / 60)} giờ nội dung`}
          />
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
