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
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  VideoCall,
  Assignment,
  Edit,
  CalendarMonth,
  AccessTime,
  WarningAmber,
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
  { id: 1, start: "08:00", end: "10:00" },
  { id: 2, start: "10:20", end: "12:20" },
  { id: 3, start: "13:00", end: "15:00" },
  { id: 4, start: "15:20", end: "17:20" },
  { id: 5, start: "18:00", end: "20:00" },
  { id: 6, start: "20:00", end: "22:00" },
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
  onRequestChangeSchedule,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [openChangeModal, setOpenChangeModal] = useState(false);
  const [targetSession, setTargetSession] = useState(null);
  const [changeForm, setChangeForm] = useState({
    newDate: "",
    newStartTime: null,
    reason: "",
  });
  const [busySlotsInNewDate, setBusySlotsInNewDate] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        slotId: slot.id,
      });
    });
    return grid;
  }, [sessions]);

  const handlePrevWeek = () => setCurrentDate((d) => addDays(d, -7));
  const handleNextWeek = () => setCurrentDate((d) => addDays(d, 7));

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value, 10);
    setSelectedYear(year);
    setCurrentDate(new Date(year, 0, 1));
  };

  const handleWeekSelectChange = (e) => {
    const newDate = new Date(e.target.value);
    setCurrentDate(newDate);
  };

  const handleOpenChangeRequest = (session) => {
    setTargetSession(session);
    setChangeForm({
      newDate: "",
      newStartTime: null,
      reason: "",
    });
    setBusySlotsInNewDate([]);
    setOpenChangeModal(true);
  };

  const handleCloseChangeModal = () => {
    if (!isSubmitting) {
      setOpenChangeModal(false);
      setTargetSession(null);
    }
  };

  const handleNewDateChange = (e) => {
    const dateVal = e.target.value;

    const today = new Date();
    const tomorrow = addDays(today, 1);
    const minDateStr = format(tomorrow, "yyyy-MM-dd");

    if (dateVal && dateVal < minDateStr) {
      alert("Bạn chỉ có thể chọn lịch từ ngày mai trở đi!");
      setChangeForm((prev) => ({ ...prev, newDate: "" }));
      setBusySlotsInNewDate([]);
      return;
    }

    setChangeForm((prev) => ({
      ...prev,
      newDate: dateVal,
      newStartTime: null,
    }));

    if (dateVal) {
      const busySlotIds = sessions
        .filter((session) => {
          if (!session.date) return false;
          const sDateStr = format(new Date(session.date), "yyyy-MM-dd");
          return sDateStr === dateVal;
        })
        .map((session) => {
          const startTime = normalizeTime(session.startTime);
          const slot = ALL_TIME_SLOTS.find((s) => s.start === startTime);
          return slot ? slot.id : null;
        })
        .filter((id) => id !== null);

      setBusySlotsInNewDate(busySlotIds);
    } else {
      setBusySlotsInNewDate([]);
    }
  };

  const submitChangeRequest = async () => {
    if (!onRequestChangeSchedule) return;

    setIsSubmitting(true);

    const success = await onRequestChangeSchedule({
      sessionId: targetSession.sessionId,
      newDate: changeForm.newDate,
      newStartTime: changeForm.newStartTime,
      reason: changeForm.reason,
    });

    setIsSubmitting(false);

    if (success) {
      setOpenChangeModal(false);
      setTargetSession(null);
    }
  };

  const getStatusColor = (s) => {
    if (s.changeReqStatus === "PENDING") return "#ffa726";
    if (s.isFullyMarked) return "#4caf50";
    if (s.attendedCount > 0) return "#ff9800";
    return "#9e9e9e";
  };

  const getStatusLabel = (s) => {
    if (s.changeReqStatus === "PENDING") return "Chờ duyệt đổi lịch";
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

    const isFuture = sessionDate.getTime() > today.getTime();
    const isToday = sessionDate.getTime() === today.getTime();
    const diffTime = today.getTime() - sessionDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const isExpired = diffDays > 2;
    const isPendingChange = session.changeReqStatus === "PENDING";

    return (
      <Box
        key={session.sessionId || idx}
        sx={{
          p: "10px",
          mb: "8px",
          borderLeft: `4px solid ${getStatusColor(session)}`,
          bgcolor: isPendingChange ? "#fff8e1" : "#fff",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "box-shadow 0.2s",
          "&:hover": { boxShadow: "0 4px 8px rgba(0,0,0,0.15)" },
          position: "relative",
        }}
      >
        {(isFuture || isToday) && !isPendingChange && (
          <Tooltip title="Yêu cầu đổi lịch">
            <IconButton
              size="small"
              onClick={() => handleOpenChangeRequest(session)}
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                color: "#757575",
                "&:hover": { color: "#1976d2", bgcolor: "#e3f2fd" },
              }}
            >
              <CalendarMonth fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        <Box sx={{ pr: 3 }}>
          <Typography
            sx={{
              fontWeight: 600,
              color: "#1976d2",
              mb: "6px",
              fontSize: "0.8rem",
              lineHeight: "1.2",
            }}
          >
            {session.title || session.ClassName}
          </Typography>
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              padding: "2px 8px",
              bgcolor: getStatusColor(session),
              color: "white",
              borderRadius: "12px",
              fontSize: "0.65rem",
              fontWeight: 500,
              mb: "6px",
            }}
          >
            {isPendingChange && <WarningAmber sx={{ fontSize: 12 }} />}
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

          {isPendingChange ? (
            <Typography
              sx={{ fontSize: "0.7rem", color: "#f57c00", fontStyle: "italic" }}
            >
              Đang chờ Admin duyệt...
            </Typography>
          ) : (
            <>
              {diffDays <= 0 && onStartZoom && (
                <Button
                  onClick={() => onStartZoom(session)}
                  fullWidth
                  size="small"
                  sx={{
                    padding: "2px 8px",
                    bgcolor: "#ff9800",
                    color: "white",
                    fontSize: "0.7rem",
                    textTransform: "none",
                    mb: 0.5,
                    "&:hover": { bgcolor: "#f57c00" },
                  }}
                  startIcon={<VideoCall sx={{ width: 16, height: 16 }} />}
                >
                  Vào Zoom
                </Button>
              )}

              {!isExpired && session.totalStudents > 0 && (
                <Button
                  onClick={() => onOpenAttendance(session)}
                  fullWidth
                  disabled={isFuture}
                  size="small"
                  sx={{
                    padding: "2px 8px",
                    bgcolor: isFuture
                      ? "#9e9e9e"
                      : session.isFullyMarked
                      ? "#4caf50"
                      : "#1976d2",
                    color: "white",
                    fontSize: "0.7rem",
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: isFuture
                        ? "#9e9e9e"
                        : session.isFullyMarked
                        ? "#388e3c"
                        : "#1565c0",
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
                  {isFuture
                    ? "Điểm danh"
                    : session.isFullyMarked
                    ? "Cập nhật"
                    : "Điểm danh"}
                </Button>
              )}
            </>
          )}

          {isExpired && !isPendingChange && (
            <Typography
              sx={{
                fontSize: "0.7rem",
                color: "grey.500",
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              Đã khóa sổ
            </Typography>
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

      <Dialog
        open={openChangeModal}
        onClose={handleCloseChangeModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ bgcolor: "#f5f5f5", borderBottom: "1px solid #e0e0e0" }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1565c0" }}>
            Yêu cầu đổi lịch
          </Typography>
          {targetSession && (
            <Typography variant="body2" sx={{ color: "#666" }}>
              Lớp: {targetSession.title} | Lịch cũ:{" "}
              {format(new Date(targetSession.date), "dd/MM/yyyy")} (
              {targetSession.startTimeFormatted})
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                1. Chọn ngày mới mong muốn:
              </Typography>
              <TextField
                type="date"
                fullWidth
                size="small"
                value={changeForm.newDate}
                onChange={handleNewDateChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: format(addDays(new Date(), 1), "yyyy-MM-dd"),
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                * Chỉ được phép chọn từ ngày mai (
                {format(addDays(new Date(), 1), "dd/MM/yyyy")}) trở đi.
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                2. Chọn Ca học:
              </Typography>
              {!changeForm.newDate ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontStyle="italic"
                >
                  Vui lòng chọn ngày trước
                </Typography>
              ) : (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {ALL_TIME_SLOTS.map((slot) => {
                    const isBusy = busySlotsInNewDate.includes(slot.id);
                    const isSelected = changeForm.newStartTime === slot.start;

                    return (
                      <Chip
                        key={slot.id}
                        label={`Ca ${slot.id} (${slot.start})`}
                        onClick={() =>
                          !isBusy &&
                          setChangeForm({
                            ...changeForm,
                            newStartTime: slot.start,
                          })
                        }
                        color={isSelected ? "primary" : "default"}
                        variant={isSelected ? "filled" : "outlined"}
                        disabled={isBusy}
                        icon={isBusy ? <WarningAmber /> : <AccessTime />}
                        sx={{
                          cursor: isBusy ? "not-allowed" : "pointer",
                          opacity: isBusy ? 0.6 : 1,
                          borderColor: isSelected ? "primary.main" : "#e0e0e0",
                        }}
                      />
                    );
                  })}
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                3. Lý do đổi lịch:
              </Typography>
              <TextField
                multiline
                rows={3}
                fullWidth
                placeholder="Nhập lý do chi tiết..."
                value={changeForm.reason}
                onChange={(e) =>
                  setChangeForm({ ...changeForm, reason: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
          <Button
            onClick={handleCloseChangeModal}
            color="inherit"
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={submitChangeRequest}
            disabled={
              !changeForm.newDate ||
              !changeForm.newStartTime ||
              !changeForm.reason ||
              isSubmitting
            }
            startIcon={
              isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
          >
            {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
