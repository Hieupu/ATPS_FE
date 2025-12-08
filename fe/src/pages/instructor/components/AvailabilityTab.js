import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  Tooltip,
  Alert,
  IconButton,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  EventAvailable as EventAvailableIcon,
} from "@mui/icons-material";
import { format, startOfWeek, addDays, setYear } from "date-fns";
import { toast } from "react-toastify";

const ALL_TIME_SLOTS = [
  { id: 1, label: "Ca 1 (08:00 - 10:00)", start: "08:00", end: "10:00" },
  { id: 2, label: "Ca 2 (10:00 - 12:00)", start: "10:00", end: "12:00" },
  { id: 3, label: "Ca 3 (14:00 - 16:00)", start: "14:00", end: "16:00" },
  { id: 4, label: "Ca 4 (18:00 - 20:00)", start: "18:00", end: "20:00" },
];

const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export default function AvailabilityTab({
  instructorId,
  instructorType = "parttime", // 'fulltime' hoặc 'parttime'
  existingSessions = [],
  availabilitySlots = [],
  loading = false,
  saving = false,
  onFetchAvailability,
  onSaveAvailability,
}) {
  const [localSlots, setLocalSlots] = useState([]);
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

  useEffect(() => {
    const startDateStr = format(weekDates[0], "yyyy-MM-dd");
    const endDateStr = format(weekDates[6], "yyyy-MM-dd");
    if (onFetchAvailability && instructorId) {
      onFetchAvailability(startDateStr, endDateStr);
    }
  }, [weekStart, instructorId, onFetchAvailability]);

  useEffect(() => {
    // Chỉ lấy các slot có status AVAILABLE (đã chọn ca học)
    const availableSlots = availabilitySlots
      .filter((slot) => slot.status === "AVAILABLE")
      .map((slot) => ({
        date: slot.date,
        timeslotId: slot.timeslotId,
      }));
    setLocalSlots(availableSlots);
  }, [availabilitySlots]);

  const handlePrevWeek = () => setCurrentDate((d) => addDays(d, -7));
  const handleNextWeek = () => setCurrentDate((d) => addDays(d, 7));

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value, 10);
    setSelectedYear(year);
    setCurrentDate((d) => setYear(d, year));
  };

  const handleToggleSlot = (dateStr, timeslotId) => {
    // Nếu là fulltime, chỉ cho phép chọn CN
    if (instructorType === "fulltime") {
      const dateObj = new Date(dateStr);
      const dayOfWeek = dateObj.getDay();
      if (dayOfWeek !== 0) {
        // Không phải CN
        toast.warning("Giảng viên fulltime mặc định đã có lịch T2-T7. Chỉ có thể chọn thêm Chủ nhật.");
        return;
      }
    }

    const existingIndex = localSlots.findIndex(
      (item) => item.date === dateStr && item.timeslotId === timeslotId
    );

    let newSlots = [...localSlots];
    if (existingIndex >= 0) {
      newSlots.splice(existingIndex, 1);
    } else {
      newSlots.push({ date: dateStr, timeslotId: timeslotId });
    }
    setLocalSlots(newSlots);
  };

  const handleSave = async () => {
    const startDateStr = format(weekDates[0], "yyyy-MM-dd");
    const endDateStr = format(weekDates[6], "yyyy-MM-dd");

    try {
      await onSaveAvailability(startDateStr, endDateStr, localSlots, instructorType);
      toast.success("Lưu lịch bận để dạy thành công");
    } catch (error) {
      toast.error("Lỗi khi lưu lịch. Vui lòng thử lại.");
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          fontWeight={700}
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <EventAvailableIcon color="primary" /> Đăng Ký Lịch Bận Để Dạy
        </Typography>

        <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Quy tắc đăng ký:
          </Typography>
          <Typography variant="body2" component="div" sx={{ lineHeight: 1.8 }}>
            {instructorType === "fulltime" ? (
              <>
                1. Giảng viên <b>fulltime</b> mặc định đã có lịch dạy <b>T2-T7, tất cả các ca</b>.<br />
                2. Nếu muốn dạy thêm <b>Chủ nhật</b>, click vào các ô CN để chọn ca học.<br />
                3. Các ô{" "}
                <span style={{ color: "#0288d1", fontWeight: "bold" }}>
                  Đang dạy
                </span>{" "}
                là lịch đã được book, không thể thay đổi tại đây.
              </>
            ) : (
              <>
                1. Giảng viên <b>parttime</b> chọn tay từng ca học trong tuần.<br />
                2. Click vào ô để chuyển sang{" "}
                <span style={{ color: "#2e7d32", fontWeight: "bold" }}>
                  Màu xanh
                </span>{" "}
                nếu bạn muốn <b>ĐĂNG KÝ CA HỌC NÀY</b>.<br />
                3. Các ô{" "}
                <span style={{ color: "#0288d1", fontWeight: "bold" }}>
                  Đang dạy
                </span>{" "}
                là lịch đã được book, không thể thay đổi tại đây.
              </>
            )}
          </Typography>
        </Alert>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select value={selectedYear} onChange={handleYearChange}>
                {yearsList.map((y) => (
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
                sx={{
                  px: 2,
                  fontWeight: 600,
                  minWidth: 140,
                  textAlign: "center",
                }}
              >
                {format(weekDates[0], "dd/MM")} -{" "}
                {format(weekDates[6], "dd/MM")}
              </Typography>
              <IconButton onClick={handleNextWeek}>
                <ChevronRight />
              </IconButton>
            </Box>
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving && <CircularProgress size={20} color="inherit" />}
          >
            {saving ? "Đang Lưu..." : "Lưu Thay Đổi"}
          </Button>
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        elevation={3}
        sx={{ maxHeight: "70vh" }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  bgcolor: "#f5f5f5",
                  fontWeight: 700,
                  width: 180,
                  zIndex: 10,
                }}
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
                    minWidth: 100,
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
            {ALL_TIME_SLOTS.map((slot) => (
              <TableRow key={slot.id} hover>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    bgcolor: "#f5f5f5",
                    position: "sticky",
                    left: 0,
                    zIndex: 5,
                    borderRight: "1px solid #eee",
                    whiteSpace: "nowrap",
                  }}
                >
                  {slot.label}
                </TableCell>

                {weekDates.map((dateObj) => {
                  const dateStr = format(dateObj, "yyyy-MM-dd");

                  const hasClass = existingSessions.some(
                    (s) => s.date === dateStr && s.timeslotId === slot.id
                  );

                  const isRegistered = localSlots.some(
                    (item) =>
                      item.date === dateStr && item.timeslotId === slot.id
                  );

                  // Nếu là fulltime và không phải CN, mặc định là đã chọn
                  const isFulltimeDefault =
                    instructorType === "fulltime" &&
                    dateObj.getDay() >= 1 &&
                    dateObj.getDay() <= 6;

                  let cellBgColor = "#fff";
                  let cellCursor = "pointer";
                  let cellContent = null;
                  let cellHoverColor = "#f5f5f5";

                  if (hasClass) {
                    cellBgColor = "#e1f5fe";
                    cellCursor = "not-allowed";
                    cellContent = (
                      <Tooltip title="Đã có lịch dạy cố định">
                        <Chip
                          icon={
                            <LockIcon sx={{ fontSize: "14px !important" }} />
                          }
                          label="Đang dạy"
                          size="small"
                          color="info"
                          variant="outlined"
                          sx={{
                            width: "100%",
                            height: 24,
                            fontSize: "0.75rem",
                            cursor: "not-allowed",
                          }}
                        />
                      </Tooltip>
                    );
                  } else if (isRegistered || isFulltimeDefault) {
                    cellBgColor = "#e8f5e9";
                    cellHoverColor = "#c8e6c9";
                    cellContent = (
                      <Box
                        sx={{
                          color: "success.main",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <CheckCircleIcon fontSize="small" />
                        <Typography variant="caption" fontWeight="bold">
                          {isFulltimeDefault ? "MẶC ĐỊNH" : "ĐÃ CHỌN"}
                        </Typography>
                      </Box>
                    );
                    // Nếu là fulltime default, không cho click
                    if (isFulltimeDefault) {
                      cellCursor = "not-allowed";
                    }
                  } else {
                    cellContent = (
                      <Box
                        sx={{
                          color: "text.disabled",
                          opacity: 0.2,
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <CancelIcon fontSize="small" />
                      </Box>
                    );
                  }

                  return (
                    <TableCell
                      key={`${dateStr}-${slot.id}`}
                      align="center"
                      sx={{
                        bgcolor: cellBgColor,
                        cursor: cellCursor,
                        border: isRegistered
                          ? "1px solid #81c784"
                          : "1px solid #f0f0f0",
                        transition: "all 0.1s",
                        "&:hover": {
                          bgcolor: !hasClass && !isFulltimeDefault && cellHoverColor,
                          opacity: hasClass || isFulltimeDefault ? 1 : 0.9,
                        },
                        height: 60,
                      }}
                      onClick={() =>
                        !hasClass && !isFulltimeDefault && handleToggleSlot(dateStr, slot.id)
                      }
                    >
                      {cellContent}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

