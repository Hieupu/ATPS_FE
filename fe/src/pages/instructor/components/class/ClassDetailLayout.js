// src/components/class/ClassDetailLayout.jsx
import React from "react";
import {
  Box,
  Button,
  Tabs,
  Tab,
  Typography,
  Avatar,
  Chip,
  Stack,
  Grid,
  IconButton,
} from "@mui/material";
import { ArrowBack, People, CalendarMonth } from "@mui/icons-material";

export default function ClassDetailLayout({
  classData,
  activeTab,
  onTabChange,
  onBack,
  children,
}) {
  const { className, course, currentStudents, hasSessionToday, status } =
    classData;

  const getLevelLabel = (level) => {
    const map = {
      BEGINNER: "Cơ bản",
      INTERMEDIATE: "Trung cấp",
      ADVANCED: "Nâng cao",
    };
    return map[level] || level;
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "white", width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider", py: 1.5, px: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Nút Back đẹp hơn */}
          <IconButton
            onClick={onBack}
            sx={{
              bgcolor: "grey.100",
              "&:hover": { bgcolor: "grey.200" },
              width: 40,
              height: 40,
            }}
          >
            <ArrowBack fontSize="small" />
          </IconButton>

          {/* Ảnh khóa học */}
          <Avatar
            src={course?.image}
            alt={course?.title}
            variant="rounded"
            sx={{
              width: 160,
              height: 100,
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
            imgProps={{ sx: { objectFit: "cover" } }}
          />

          {/* Thông tin lớp học */}
          <Stack spacing={0.5} flex={1}>
            <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.3 }}>
              {className}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {course?.title}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mt: 0.5 }}
            >
              {course?.level && (
                <Chip
                  label={getLevelLabel(course.level)}
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 1.5 }}
                />
              )}
              <Chip
                label={
                  ["APPROVED", "ACTIVE"].includes(status)
                    ? "Đang diễn ra"
                    : ["WAITING", "PENDING", "ONGOING"].includes(status)
                    ? "Sắp khai giảng"
                    : status === "CLOSE"
                    ? "Đã kết thúc"
                    : status === "CANCEL"
                    ? "Đã hủy"
                    : status
                }
                color={
                  ["APPROVED", "ACTIVE"].includes(status)
                    ? "success"
                    : ["WAITING", "PENDING", "ONGOING"].includes(status)
                    ? "warning"
                    : status === "CANCEL"
                    ? "error"
                    : "default"
                }
                size="small"
                sx={{
                  borderRadius: 1.5,
                  fontWeight: 500,
                  ...(status === "CLOSE" && {
                    bgcolor: "#6366f1",
                    color: "white",
                  }),
                }}
              />
              {hasSessionToday && (
                <Chip
                  label="Hôm nay có lớp"
                  color="error"
                  size="small"
                  sx={{ borderRadius: 1.5, fontWeight: 500 }}
                />
              )}
            </Stack>
          </Stack>
        </Stack>
      </Box>

      {/* BODY & TABS: Full width, không bọc Card để tránh tràn lề */}
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => onTabChange(v)}
            // Chống tràn Tab: Cho phép scroll nếu màn hình nhỏ
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 48,
              "& .MuiTab-root": {
                minHeight: 48,
                textTransform: "none",
                fontSize: "15px",
                fontWeight: 500,
                mr: 2,
              },
            }}
          >
            <Tab label="Tổng quan" />
            <Tab
              label={`Học viên (${currentStudents || 0})`}
              icon={<People fontSize="small" sx={{ mb: 0, mr: 1 }} />}
              iconPosition="start"
            />
            <Tab
              label="Thời khóa biểu & Điểm danh"
              icon={<CalendarMonth fontSize="small" sx={{ mb: 0, mr: 1 }} />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Content bên dưới Tab: Full width, padding nhẹ để nội dung thoáng */}
        <Box sx={{ p: 3, width: "100%" }}>{children}</Box>
      </Box>
    </Box>
  );
}
