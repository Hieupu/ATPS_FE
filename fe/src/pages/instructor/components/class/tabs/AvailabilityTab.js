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
  { id: 2, label: "Ca 2 (10:20 - 12:20)", start: "10:20", end: "12:20" },
  { id: 3, label: "Ca 3 (13:00 - 15:00)", start: "13:00", end: "15:00" },
  { id: 4, label: "Ca 4 (15:20 - 17:20)", start: "15:20", end: "17:20" },
  { id: 5, label: "Ca 5 (17:40 - 19:40)", start: "17:40", end: "19:40" },
  { id: 6, label: "Ca 6 (20:00 - 22:00)", start: "20:00", end: "22:00" },
];

const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export default function AvailabilityTab({
  existingSessions,
  availabilitySlots,
  loading,
  saving,
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
    onFetchAvailability(startDateStr, endDateStr);
  }, [weekStart]);

  useEffect(() => {
    setLocalSlots(availabilitySlots);
  }, [availabilitySlots]);

  const handlePrevWeek = () => setCurrentDate((d) => addDays(d, -7));
  const handleNextWeek = () => setCurrentDate((d) => addDays(d, 7));

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value, 10);
    setSelectedYear(year);
    setCurrentDate((d) => setYear(d, year));
  };

  const handleToggleSlot = (dateStr, timeslotId) => {
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
      await onSaveAvailability(startDateStr, endDateStr, localSlots);
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
          <EventAvailableIcon color="primary" /> Đăng Ký Lịch Rảnh
        </Typography>

        <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Quy tắc đăng ký:
          </Typography>
          <Typography variant="body2" component="div" sx={{ lineHeight: 1.8 }}>
            1. Các ô{" "}
            <span
              style={{
                backgroundColor: "#f5f5f5",
                border: "1px solid #ccc",
                padding: "0 6px",
                borderRadius: "4px",
                fontSize: "0.85rem",
              }}
            >
              Màu xám
            </span>
            : Mặc định là <b>BẬN</b>.<br />
            2. Click vào ô để chuyển sang{" "}
            <span style={{ color: "#2e7d32", fontWeight: "bold" }}>
              Màu xanh
            </span>{" "}
            nếu bạn muốn <b>ĐĂNG KÝ RẢNH</b>.<br />
            3. Các ô{" "}
            <span style={{ color: "#0288d1", fontWeight: "bold" }}>
              Đang dạy
            </span>{" "}
            là lịch cố định, không thể thay đổi tại đây.
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
                  } else if (isRegistered) {
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
                          RẢNH
                        </Typography>
                      </Box>
                    );
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
                          bgcolor: !hasClass && cellHoverColor,
                          opacity: hasClass ? 1 : 0.9,
                        },
                        height: 60,
                      }}
                      onClick={() =>
                        !hasClass && handleToggleSlot(dateStr, slot.id)
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
