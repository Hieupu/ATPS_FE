// src/components/class/ClassDetailLayout.jsx
import React from "react";
import {
  Box,
  Button,
  Tabs,
  Tab,
  Card,
  Typography,
  Avatar,
  Chip,
  Stack,
  Grid,
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
    // 1. Đổi nền thành white (hoặc bỏ luôn bgcolor) để đồng bộ màu
    <Box sx={{ minHeight: "100vh", bgcolor: "white" }}>
      {/* HEADER */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Box sx={{ maxWidth: 1400, mx: "auto", px: 4, py: 3 }}>
          <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mb: 3 }}>
            Quay lại
          </Button>

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md="auto">
              <Avatar
                src={course?.image}
                alt={course?.title}
                variant="rounded"
                sx={{
                  width: 200,
                  height: 120,
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                }}
                imgProps={{ sx: { objectFit: "cover" } }}
              />
            </Grid>

            <Grid item xs={12} md>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {className}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {course?.title}
              </Typography>
              <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
                {course?.level && (
                  <Chip label={getLevelLabel(course.level)} size="medium" />
                )}
                <Chip
                  label={status === "ACTIVE" ? "Đang diễn ra" : status}
                  color="success"
                  size="medium"
                />
                {hasSessionToday && (
                  <Chip label="Hôm nay có lớp" color="error" size="medium" />
                )}
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* TABS + CONTENT */}
      {/* Container này có maxWidth và px giống hệt Header ở trên -> Đảm bảo thẳng hàng */}
      <Box sx={{ maxWidth: 1400, mx: "auto", px: 4, py: 4 }}>
        <Card
          elevation={0}
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
            // Đảm bảo Card chiếm 100% width của Box chứa nó
            width: "100%",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, v) => onTabChange(v)}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "white", // 2. Bỏ màu nền xám
              px: 0, // 3. Đưa về 0 để Tab đầu tiên sát lề trái, thẳng hàng với Header
            }}
          >
            <Tab label="Tổng quan" />
            <Tab
              label={`Học viên (${currentStudents})`}
              icon={<People fontSize="small" />}
              iconPosition="start"
            />
            <Tab
              label="Thời khóa biểu & Điểm danh"
              icon={<CalendarMonth fontSize="small" />}
              iconPosition="start"
            />
          </Tabs>

          <Box sx={{ p: 3, minHeight: 400 }}>{children}</Box>
        </Card>
      </Box>
    </Box>
  );
}
