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
  Button,
  FormControl, // Thêm FormControl
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  VideoCall,
  Assignment,
  Edit,
} from "@mui/icons-material";
import {
  format,
  startOfWeek,
  addDays,
  startOfYear,
  endOfYear,
  eachWeekOfInterval,
  endOfWeek,
} from "date-fns";
import AttendanceModal from "../AttendanceModal";

const ALL_TIME_SLOTS = [
  { start: "08:00", end: "10:00" },
  { start: "10:20", end: "12:20" },
  { start: "13:00", end: "15:00" },
  { start: "15:20", end: "17:20" },
  { start: "18:00", end: "20:00" },
  { start: "20:00", end: "22:00" },
];

const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export default function ScheduleTab({
  sessions = [],
  selectedSession,
  attendanceSheet,
  savingAttendance,
  onOpenAttendance,
  onSaveAttendance,
  onCloseAttendance,
  onStartZoom,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const yearsList = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 3;
    const endYear = currentYear + 1;
    const list = [];
    for (let i = startYear; i <= endYear; i++) {
      list.push(i);
    }
    return list;
  }, []);

  const weekStart = useMemo(() => {
    return startOfWeek(currentDate, { weekStartsOn: 1 });
  }, [currentDate]);

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // --- 1. LOGIC TẠO DANH SÁCH TUẦN TRONG NĂM ---
  const allWeeksInYear = useMemo(() => {
    const start = startOfYear(new Date(selectedYear, 0, 1));
    const end = endOfYear(new Date(selectedYear, 0, 1));
    return eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
  }, [selectedYear]);

  const normalizeTime = (timeStr) => {
    if (!timeStr) return null;
    return timeStr.split(":").slice(0, 2).join(":");
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
    const year = parseInt(e.target.value, 10);
    setSelectedYear(year);
    // Reset về ngày đầu năm khi đổi năm
    setCurrentDate(new Date(year, 0, 1));
  };

  // --- 2. SỰ KIỆN CHỌN TUẦN ---
  const handleWeekSelectChange = (e) => {
    const newDate = new Date(e.target.value);
    setCurrentDate(newDate);
  };

  const getStatusColor = (s) => {
    if (s.isFullyMarked) return "#4caf50";
    if (s.attendedCount > 0) return "#ff9800";
    return "#9e9e9e";
  };

  const getStatusLabel = (s) => {
    if (s.isFullyMarked) return "Hoàn thành";
    if (s.attendedCount > 0)
      return `Đã điểm danh ${s.attendedCount}/${s.totalStudents}`;
    return "Chưa điểm danh";
  };

  const renderSessionCard = (session, idx) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);
    const isPast = sessionDate.getTime() < today.getTime();

    return (
      <Box
        key={session.sessionId || idx}
        sx={{
          p: "12px",
          mb: "8px",
          borderLeft: `4px solid ${getStatusColor(session)}`,
          bgcolor: "#fff",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "box-shadow 0.2s",
          "&:hover": { boxShadow: "0 4px 8px rgba(0,0,0,0.15)" },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontWeight: 600,
              color: "#1976d2",
              mb: "6px",
              fontSize: "0.8rem",
              lineHeight: "1.2",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {session.title || session.ClassName}
          </Typography>

          <Box
            component="span"
            sx={{
              display: "inline-block",
              padding: "2px 8px",
              bgcolor: getStatusColor(session),
              color: "white",
              borderRadius: "12px",
              fontSize: "0.65rem",
              fontWeight: 500,
              mb: "6px",
            }}
          >
            {getStatusLabel(session)}
          </Box>
        </Box>

        <Box>
          <Typography
            sx={{
              display: "block",
              color: "#4caf50",
              fontWeight: 500,
              fontSize: "0.75rem",
              mb: "6px",
            }}
          >
            {session.startTimeFormatted} - {session.endTimeFormatted}
          </Typography>

          {!isPast && onStartZoom && (
            <Button
              onClick={() => onStartZoom(session)}
              fullWidth
              size="small"
              sx={{
                padding: "2px 8px",
                bgcolor: "#ff9800",
                color: "white",
                fontSize: "0.7rem",
                fontWeight: 500,
                textTransform: "none",
                minWidth: "unset",
                mb: 0.5,
                "&:hover": { bgcolor: "#f57c00" },
              }}
              startIcon={<VideoCall sx={{ width: 16, height: 16 }} />}
            >
              Vào Zoom
            </Button>
          )}

          {!isPast && session.totalStudents > 0 && (
            <Button
              onClick={() => onOpenAttendance(session)}
              fullWidth
              size="small"
              sx={{
                padding: "2px 8px",
                bgcolor: session.isFullyMarked ? "#4caf50" : "#1976d2",
                color: "white",
                fontSize: "0.7rem",
                fontWeight: 500,
                textTransform: "none",
                minWidth: "unset",
                "&:hover": {
                  bgcolor: session.isFullyMarked ? "#388e3c" : "#1565c0",
                },
              }}
              startIcon={
                session.isFullyMarked ? (
                  <Edit sx={{ width: 14, height: 14 }} />
                ) : (
                  <Assignment sx={{ width: 14, height: 14 }} />
                )
              }
            >
              {session.isFullyMarked ? "Cập nhật" : "Điểm danh"}
            </Button>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {/* --- CHỌN NĂM --- */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{ fontWeight: 700, color: "#d32f2f", fontSize: "1.1rem" }}
            >
              NĂM
            </Typography>
            <Select
              value={selectedYear}
              onChange={handleYearChange}
              size="small"
              sx={{
                bgcolor: "white",
                fontWeight: 600,
                border: "2px solid #d32f2f",
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                borderRadius: "4px",
                minWidth: "100px",
                height: "40px",
              }}
            >
              {yearsList.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* --- CHỌN TUẦN (MỚI) --- */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{ fontWeight: 700, color: "#1976d2", fontSize: "1.1rem" }}
            >
              TUẦN
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "white",
                border: "2px solid #1976d2",
                borderRadius: "4px",
                height: "40px",
                px: 1,
              }}
            >
              <IconButton size="small" onClick={handlePrevWeek}>
                <ChevronLeft />
              </IconButton>

              <FormControl variant="standard" sx={{ minWidth: 200 }}>
                <Select
                  value={weekStart.getTime()}
                  onChange={handleWeekSelectChange}
                  disableUnderline
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    textAlign: "center",
                    ".MuiSelect-select": { py: 0.5, px: 1 },
                  }}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                >
                  {allWeeksInYear.map((startOfWeekDate, index) => {
                    const endOfWeekDate = endOfWeek(startOfWeekDate, {
                      weekStartsOn: 1,
                    });
                    const label = `Tuần ${index + 1} (${format(
                      startOfWeekDate,
                      "dd/MM"
                    )} - ${format(endOfWeekDate, "dd/MM")})`;
                    return (
                      <MenuItem
                        key={startOfWeekDate.getTime()}
                        value={startOfWeekDate.getTime()}
                      >
                        {label}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              <IconButton size="small" onClick={handleNextWeek}>
                <ChevronRight />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* --- TABLE CONTENT (GIỮ NGUYÊN) --- */}
      <TableContainer
        component={Box}
        sx={{
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",

          overflowX: "auto",
        }}
      >
        <Table sx={{ minWidth: 800, borderCollapse: "collapse" }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  bgcolor: "#f1f8e9",
                  width: 100,
                  borderRight: "1px solid #e0e0e0",
                  p: "12px",
                }}
              />
              {DAYS.map((day, i) => (
                <TableCell
                  key={day}
                  align="center"
                  sx={{
                    bgcolor: i >= 5 ? "#fce4ec" : "#e3f2fd",
                    borderRight: i < 6 ? "1px solid #e0e0e0" : "none",
                    p: "12px",
                  }}
                >
                  <Typography
                    sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#000" }}
                  >
                    {day}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "0.8rem", color: "#666", mt: 0.5 }}
                  >
                    {format(weekDates[i], "dd/MM")}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {ALL_TIME_SLOTS.map((slot, slotIndex) => {
              const slotStart = slot.start;
              return (
                <TableRow key={slotStart}>
                  <TableCell
                    sx={{
                      bgcolor: "#f1f8e9",
                      borderRight: "1px solid #e0e0e0",
                      verticalAlign: "top",
                      p: "12px",
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
                      Ca {slotIndex + 1}
                    </Typography>
                    <Typography
                      sx={{ color: "#666", fontSize: "0.75rem", mt: 0.5 }}
                    >
                      {slot.start}-{slot.end}
                    </Typography>
                  </TableCell>

                  {weekDates.map((date, dateIndex) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const key = `${dateStr}-${slotStart}`;
                    const cellSessions = scheduleGrid[key] || [];
                    const hasData = cellSessions.length > 0;

                    return (
                      <TableCell
                        key={dateStr}
                        sx={{
                          p: "8px",
                          verticalAlign: "top",
                          bgcolor: hasData ? "#fff" : "#fafafa",
                          borderRight:
                            dateIndex < 6 ? "1px solid #e0e0e0" : "none",
                          borderTop: "1px solid #e0e0e0",
                          minHeight: "120px",
                          width: "14.28%",
                        }}
                      >
                        {hasData ? (
                          cellSessions.map((session, idx) =>
                            renderSessionCard(session, idx)
                          )
                        ) : (
                          <Box sx={{ minHeight: "80px" }} />
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
