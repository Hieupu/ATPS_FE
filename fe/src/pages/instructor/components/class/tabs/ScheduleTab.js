import React, { useState, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Button,
  Paper,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  VideoCall,
  Assignment,
  Edit, // Import thêm icon Edit cho nút cập nhật
} from "@mui/icons-material";
import { format, startOfWeek, addDays } from "date-fns";
import AttendanceModal from "../AttendanceModal";

// Tất cả các slot có thể có trong hệ thống
const ALL_TIME_SLOTS = [
  { start: "08:00", end: "10:00" },
  { start: "10:20", end: "12:20" },
  { start: "13:00", end: "15:00" },
  { start: "15:20", end: "17:20" },
  { start: "17:40", end: "19:40" },
  { start: "20:00", end: "22:00" },
];

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function ScheduleTab({
  sessions = [],
  selectedSession,
  attendanceSheet,
  savingAttendance,
  onOpenAttendance,
  onSaveAttendance,
  onCloseAttendance,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Tuần bắt đầu từ thứ Hai
  const weekStart = useMemo(() => {
    return startOfWeek(currentDate, { weekStartsOn: 1 });
  }, [currentDate]);

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const normalizeTime = (timeStr) => {
    if (!timeStr) return null;
    const normalized = timeStr.split(":").slice(0, 2).join(":");
    return normalized;
  };

  const scheduleGrid = useMemo(() => {
    const grid = {};

    sessions.forEach((session) => {
      const sessionDate = new Date(session.date);
      const dateStr = format(sessionDate, "yyyy-MM-dd");
      const startTime = normalizeTime(session.startTime);

      const slot = ALL_TIME_SLOTS.find((s) => s.start === startTime);
      if (!slot) return;

      const key = `${dateStr}-${startTime}`;
      if (!grid[key]) grid[key] = [];

      grid[key].push({
        ...session,
        startTimeFormatted: startTime,
        endTimeFormatted: normalizeTime(session.endTime),
      });
    });

    return grid;
  }, [sessions]);

  const handlePrevWeek = () => setCurrentDate((d) => addDays(d, -7));
  const handleNextWeek = () => setCurrentDate((d) => addDays(d, 7));
  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    setCurrentDate((d) => new Date(d.setFullYear(year)));
  };

  const getStatusColor = (s) => {
    if (s.isFullyMarked) return "#4caf50";
    if (s.attendedCount > 0) return "#ff9800";
    return "#9e9e9e";
  };

  const getStatusLabel = (s) => {
    if (s.isFullyMarked) return "Đã điểm danh";
    if (s.attendedCount > 0)
      return `Đã điểm danh ${s.attendedCount}/${s.totalStudents}`;
    return "Chưa điểm danh";
  };

  const renderSessionCard = (session) => (
    <Paper
      key={session.sessionId}
      elevation={3}
      sx={{
        p: 1.5,
        borderLeft: `5px solid ${getStatusColor(session)}`,
        bgcolor: "background.paper",
        "&:hover": { boxShadow: 8 },
        fontSize: "0.85rem",
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} color="primary">
        {session.title}
      </Typography>

      <Chip
        label={getStatusLabel(session)}
        size="small"
        sx={{
          mt: 0.5,
          bgcolor: getStatusColor(session),
          color: "white",
          fontSize: "0.7rem",
          height: 22,
        }}
      />

      <Typography
        variant="caption"
        display="block"
        mt={0.5}
        color="success.main"
        fontWeight={500}
      >
        {session.startTimeFormatted} - {session.endTimeFormatted}
      </Typography>

      <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {session.totalStudents > 0 && (
          <Button
            size="small"
            variant={session.isFullyMarked ? "outlined" : "contained"} // Đổi style để phân biệt
            color={session.isFullyMarked ? "success" : "primary"}
            startIcon={
              session.isFullyMarked ? (
                <Edit fontSize="small" />
              ) : (
                <Assignment fontSize="small" />
              )
            }
            onClick={() => onOpenAttendance(session)}
          >
            {session.isFullyMarked ? "Cập nhật" : "Điểm danh"}
          </Button>
        )}

        {session.zoomLink && (
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            startIcon={<VideoCall fontSize="small" />}
            onClick={() =>
              window.open(`https://zoom.us/j/${session.zoomLink}`, "_blank")
            }
          >
            Zoom
          </Button>
        )}
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Thời khóa biểu
      </Typography>

      {/* Điều khiển tuần */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
          alignItems: "center",
        }}
      >
        <FormControl size="small">
          <Select value={selectedYear} onChange={handleYearChange}>
            {[2024, 2025, 2026, 2027].map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "white",
            borderRadius: 1,
            border: "1px solid #ddd",
          }}
        >
          <IconButton onClick={handlePrevWeek}>
            <ChevronLeft />
          </IconButton>
          <Typography
            sx={{ px: 3, fontWeight: 600, minWidth: 180, textAlign: "center" }}
          >
            {format(weekDates[0], "dd/MM")} -{" "}
            {format(weekDates[6], "dd/MM/yyyy")}
          </Typography>
          <IconButton onClick={handleNextWeek}>
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      {/* Bảng lịch */}
      <TableContainer component={Paper} elevation={3}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ bgcolor: "#f5f5f5", fontWeight: 700, width: 120 }}
              >
                Giờ
              </TableCell>
              {DAYS.map((day, i) => (
                <TableCell
                  key={day}
                  align="center"
                  sx={{
                    bgcolor: i >= 5 ? "#fce4ec" : "#e3f2fd",
                    fontWeight: 700,
                  }}
                >
                  <Typography variant="subtitle2">{day}</Typography>
                  <Typography variant="body2">
                    {format(weekDates[i], "dd/MM")}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {ALL_TIME_SLOTS.map((slot) => {
              const slotStart = slot.start;
              return (
                <TableRow key={slotStart}>
                  <TableCell
                    sx={{
                      bgcolor: "#f5f5f5",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    {slotStart} - {slot.end}
                  </TableCell>
                  {weekDates.map((date) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const key = `${dateStr}-${slotStart}`;
                    const cellSessions = scheduleGrid[key] || [];

                    return (
                      <TableCell
                        key={dateStr}
                        sx={{
                          p: 1,
                          verticalAlign: "top",
                          minHeight: 100,
                          bgcolor:
                            cellSessions.length > 0
                              ? "#fffde7"
                              : "background.paper",
                        }}
                      >
                        {cellSessions.map(renderSessionCard)}
                        {cellSessions.length === 0 && (
                          <Typography color="#ddd" align="center">
                            —
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Chú thích */}
      <Box
        sx={{
          mt: 3,
          display: "flex",
          justifyContent: "center",
          gap: 3,
          flexWrap: "wrap",
        }}
      >
        <Chip
          label="Đã điểm danh"
          sx={{ bgcolor: "#4caf50", color: "white" }}
        />
        <Chip
          label="Đang điểm danh"
          sx={{ bgcolor: "#ff9800", color: "white" }}
        />
        <Chip
          label="Chưa điểm danh"
          sx={{ bgcolor: "#9e9e9e", color: "white" }}
        />
      </Box>

      <AttendanceModal
        open={!!selectedSession}
        session={selectedSession}
        attendanceSheet={attendanceSheet}
        saving={savingAttendance}
        onClose={onCloseAttendance}
        onSave={onSaveAttendance}
      />
    </Box>
  );
}
