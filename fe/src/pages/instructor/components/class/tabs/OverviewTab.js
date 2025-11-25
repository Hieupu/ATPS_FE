import React from "react";
import {
  Box,
  Typography,
  Stack,
  Grid,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import {
  Person,
  People,
  AttachMoney,
  CalendarToday,
  Schedule,
  AccessTime,
  VideoCall,
  CheckCircle,
  RadioButtonUnchecked,
} from "@mui/icons-material";

export default function OverviewTab({ classData }) {
  const {
    instructor,
    currentStudents,
    maxStudents,
    remainingSlots,
    fee,
    dates,
    scheduleSummary,
    nextSession,
    zoomMeetingId,
    zoomPassword,
    completedSessions,
    totalSessions,
    progress,
  } = classData;

  const zoomLink = zoomMeetingId
    ? `https://zoom.us/j/${zoomMeetingId}?pwd=${zoomPassword}`
    : null;
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Grid container spacing={5}>
      {/* Thông tin lớp */}
      <Grid item xs={12} lg={7}>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
          Thông tin lớp học
        </Typography>

        <Stack spacing={3}>
          {/* Giảng viên */}
          <InfoItem
            icon={<Person />}
            title="Giảng viên"
            value={instructor?.fullName || "Chưa có"}
          />

          {/* Sĩ số */}
          <InfoItem
            icon={<People />}
            title="Sĩ số"
            value={`${currentStudents} / ${maxStudents} học viên`}
            sub={`Còn ${remainingSlots} chỗ trống`}
          />

          {/* Học phí */}
          <InfoItem
            icon={<AttachMoney />}
            title="Học phí"
            value={
              <span style={{ color: "#2e7d32", fontWeight: 600 }}>
                {Number(fee).toLocaleString("vi-VN")} ₫
              </span>
            }
          />

          {/* Khai giảng */}
          <InfoItem
            icon={<CalendarToday />}
            title="Khai giảng"
            value={dates.openActual || dates.openPlan}
          />

          {/* Lịch học */}
          <InfoItem
            icon={<Schedule />}
            title="Lịch học"
            value={scheduleSummary}
          />

          {/* Buổi tiếp theo */}
          <InfoItem
            icon={<AccessTime />}
            title="Buổi học tiếp theo"
            value={nextSession}
          />

          {/* Nút Zoom */}
          {zoomLink && (
            <Button
              variant="contained"
              size="large"
              startIcon={<VideoCall />}
              href={zoomLink}
              target="_blank"
            >
              Vào lớp Zoom
            </Button>
          )}
        </Stack>
      </Grid>

      {/* Tiến độ khóa học */}
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

// Helper component
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
