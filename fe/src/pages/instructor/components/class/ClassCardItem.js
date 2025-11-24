import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  IconButton,
} from "@mui/material";
import { MoreVert, People, Schedule, CalendarToday } from "@mui/icons-material";

export default function ClassCardItem({ cls, onMenuOpen }) {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.09)",
        transition: "all 0.3s ease",
        position: "relative",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.16)",
        },
      }}
    >
      {/* Badge Hôm nay có lớp */}
      {cls.isTodayClass && (
        <Chip
          label="HÔM NAY CÓ LỚP"
          color="error"
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 10,
            fontWeight: 900,
            fontSize: "11px",
            height: 30,
            borderRadius: 3,
          }}
        />
      )}

      {/* Ảnh khóa học */}
      <CardMedia
        component="img"
        height="150"
        image={cls.courseImage}
        alt={cls.courseName}
        sx={{ objectFit: "cover", bgcolor: "#f1f5f9" }}
      />

      {/* Nút More */}
      <IconButton
        size="small"
        onClick={(e) => onMenuOpen(e, cls)}
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          bgcolor: "rgba(255,255,255,0.95)",
          boxShadow: 2,
          "&:hover": { bgcolor: "white" },
        }}
      >
        <MoreVert fontSize="small" />
      </IconButton>

      <CardContent sx={{ flexGrow: 1, pb: 2 }}>
        {/* Tên lớp */}
        <Typography
          variant="h6"
          fontWeight={800}
          gutterBottom
          sx={{ fontSize: "15px" }}
        >
          {cls.className}
        </Typography>

        {/* Tên khóa học */}
        <Typography
          variant="body2"
          color="text.secondary"
          noWrap
          sx={{ mb: 1.5 }}
        >
          {cls.courseName}
        </Typography>

        {/* Lịch học cố định */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Schedule
            sx={{
              fontSize: 18,
              color: cls.schedule?.includes("Chưa") ? "#94a3b8" : "#6366f1",
            }}
          />
          <Typography
            variant="caption"
            fontWeight={600}
            color={
              cls.schedule?.includes("Chưa") ? "text.secondary" : "#4f46e5"
            }
          >
            {cls.schedule}
          </Typography>
        </Box>

        {/* Buổi tiếp theo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <CalendarToday
            sx={{
              fontSize: 18,
              color:
                cls.nextSession === "Hôm nay"
                  ? "#dc2626"
                  : cls.nextSession === "Ngày mai"
                  ? "#f59e0b"
                  : "#6366f1",
            }}
          />
          <Typography
            variant="caption"
            fontWeight={cls.nextSession === "Hôm nay" ? 900 : 700}
            color={
              cls.nextSession === "Hôm nay"
                ? "#dc2626"
                : cls.nextSession === "Ngày mai"
                ? "#f59e0b"
                : "inherit"
            }
            sx={{
              textTransform:
                cls.nextSession === "Hôm nay" ? "uppercase" : "none",
            }}
          >
            {cls.nextSession}
          </Typography>
        </Box>

        {/* Sĩ số */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <People
            sx={{
              fontSize: 19,
              color:
                cls.students >= cls.totalStudents * 0.9 ? "#dc2626" : "#10b981",
            }}
          />
          <Typography variant="body2" fontWeight={700}>
            {cls.students} / {cls.totalStudents} học viên
          </Typography>
        </Box>

        {/* Tiến độ */}
        {cls.totalSessions > 0 && (
          <Box sx={{ mt: "auto" }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
            >
              <Typography variant="caption" color="text.secondary">
                Đã học
              </Typography>
              <Typography variant="caption" fontWeight={700}>
                {cls.completedSessions} / {cls.totalSessions} buổi
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={cls.progress}
              sx={{
                height: 9,
                borderRadius: 4,
                bgcolor: "#e2e8f0",
                "& .MuiLinearProgress-bar": {
                  bgcolor: cls.isTodayClass ? "#dc2626" : "#6366f1",
                },
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
