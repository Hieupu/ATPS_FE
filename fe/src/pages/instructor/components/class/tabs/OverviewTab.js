import React from "react";
import {
  Box,
  Typography,
  Stack,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
} from "@mui/material";
import {
  Person,
  People,
  AttachMoney,
  CalendarToday,
  Schedule,
  AccessTime,
  VideoCameraFront, // Đổi icon cho hợp với Instructor
  CheckCircle,
  RadioButtonUnchecked,
} from "@mui/icons-material";

// 1. Nhận thêm prop onStartZoom từ cha truyền xuống
export default function OverviewTab({ classData, onStartZoom }) {
  const {
    instructor,
    currentStudents,
    maxStudents,
    remainingSlots,
    fee,
    dates,
    scheduleSummary,
    nextSession,
    completedSessions,
    totalSessions,
    progress,
    status,
  } = classData;

  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const formatDateVN = (dateString) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "---";

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Parse lịch học từ scheduleSummary
  const parseSchedule = (scheduleStr) => {
    if (!scheduleStr) return [];
    return scheduleStr.split("|").map((s) => s.trim());
  };

  const scheduleItems = parseSchedule(scheduleSummary);

  return (
    <Grid container spacing={5}>
      {/* Thông tin lớp */}
      <Grid item xs={12} lg={7}>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
          Thông tin lớp học
        </Typography>

        <Stack spacing={3}>
          <InfoItem
            icon={<Person />}
            title="Giảng viên"
            value={instructor?.fullName || "Chưa có"}
          />

          <InfoItem
            icon={<People />}
            title="Sĩ số"
            value={`${currentStudents} / ${maxStudents} học viên`}
            sub={`Còn ${remainingSlots} chỗ trống`}
          />

          <InfoItem
            icon={<AttachMoney />}
            title="Học phí"
            value={
              <span style={{ color: "#2e7d32", fontWeight: 600 }}>
                {Number(fee).toLocaleString("vi-VN")} ₫
              </span>
            }
          />

          <InfoItem
            icon={<CalendarToday />}
            title="Khai giảng"
            value={formatDateVN(dates.openActual || dates.openPlan)}
          />

          <ScheduleInfoCard scheduleItems={scheduleItems} />

          <InfoItem
            icon={<AccessTime />}
            title="Buổi học tiếp theo"
            value={nextSession}
          />
        </Stack>
      </Grid>

      <Grid item xs={12} lg={5}>
        <Card
          elevation={0}
          sx={{
            bgcolor: "primary.lighter",
            border: 1,
            borderColor: "primary.light",
            height: "100%",
          }}
        >
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Tiến độ khóa học
            </Typography>

            <Box
              sx={{
                position: "relative",
                width: 180,
                height: 180,
                mx: "auto",
                my: 4,
              }}
            >
              <svg
                width="180"
                height="180"
                style={{ transform: "rotate(-90deg)" }}
              >
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="none"
                  stroke="#e0e0e0"
                  strokeWidth="12"
                />
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="none"
                  stroke="#1976d2"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                />
              </svg>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Typography variant="h2" fontWeight={800} color="primary.main">
                  {progress}%
                </Typography>
              </Box>
            </Box>

            <Typography variant="h6" fontWeight={600}>
              {completedSessions} / {totalSessions} buổi
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              đã hoàn thành
            </Typography>

            <Stack spacing={2} mt={3}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={1.5}
              >
                <CheckCircle sx={{ color: "success.main" }} />
                <Typography>{completedSessions} buổi đã học</Typography>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={1.5}
              >
                <RadioButtonUnchecked sx={{ color: "text.secondary" }} />
                <Typography color="text.secondary">
                  {totalSessions - completedSessions} buổi còn lại
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

function ScheduleInfoCard({ scheduleItems }) {
  return (
    <Box display="flex" alignItems="flex-start" gap={2}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: "grey.200",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Schedule sx={{ fontSize: 28, color: "primary.main" }} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Lịch học
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1} mt={0.5}>
          {scheduleItems.map((item, idx) => (
            <Chip
              key={idx}
              label={item}
              size="small"
              sx={{
                fontWeight: 500,
                bgcolor: "primary.lighter",
                color: "primary.main",
                border: "1px solid",
                borderColor: "primary.light",
              }}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

function InfoItem({ icon, title, value, sub }) {
  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: "grey.200",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {React.cloneElement(icon, {
          sx: { fontSize: 28, color: "primary.main" },
        })}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h6" fontWeight={600}>
          {value}
        </Typography>
        {sub && (
          <Typography variant="body2" color="text.secondary">
            {sub}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
