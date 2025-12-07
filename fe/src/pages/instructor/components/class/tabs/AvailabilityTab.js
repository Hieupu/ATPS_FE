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
  Tooltip,
  Alert,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Menu,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  EventAvailable as EventAvailableIcon,
  Repeat as RepeatIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  Block as BlockIcon,
} from "@mui/icons-material";
import {
  format,
  startOfWeek,
  addDays,
  setYear,
  getDay,
  startOfYear,
  endOfYear,
  eachWeekOfInterval,
  endOfWeek,
  isSameWeek,
} from "date-fns";

// --- CẤU HÌNH ---
const ALL_TIME_SLOTS = [
  { id: 1, label: "Ca 1 (08:00 - 10:00)", start: "08:00", end: "10:00" },
  { id: 2, label: "Ca 2 (10:20 - 12:20)", start: "10:20", end: "12:20" },
  { id: 3, label: "Ca 3 (13:00 - 15:00)", start: "13:00", end: "15:00" },
  { id: 4, label: "Ca 4 (15:20 - 17:20)", start: "15:20", end: "17:20" },
  { id: 5, label: "Ca 5 (18:00 - 20:00)", start: "18:00", end: "20:00" },
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
  onAddAvailability,
}) {
  const [localSlots, setLocalSlots] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  const instructorType = useMemo(() => {
    if (availabilitySlots && availabilitySlots.length > 0) {
      return availabilitySlots[0].instructorType;
    }
    return "";
  }, [availabilitySlots]);

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

  // --- LOGIC MỚI: TẠO DANH SÁCH TUẦN TRONG NĂM ---
  const allWeeksInYear = useMemo(() => {
    const start = startOfYear(new Date(selectedYear, 0, 1));
    const end = endOfYear(new Date(selectedYear, 0, 1));
    // Tạo mảng các ngày đầu tuần (Thứ 2) của tất cả các tuần trong năm
    return eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
  }, [selectedYear]);

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
    // Khi đổi năm, reset về tuần đầu tiên của năm đó
    setCurrentDate(new Date(year, 0, 1));
  };

  // --- SỰ KIỆN CHỌN TUẦN TỪ DROPDOWN ---
  const handleWeekSelectChange = (e) => {
    // Value là timestamp của ngày đầu tuần
    const newDate = new Date(e.target.value);
    setCurrentDate(newDate);
  };

  const handleCellClick = (event, dateStr, timeslotId, isRestricted) => {
    if (isRestricted) return;
    setAnchorEl(event.currentTarget);
    setSelectedCell({ date: dateStr, timeslotId });
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedCell(null);
  };

  const generateRecurringSlots = (startDateStr, weeks) => {
    const slots = [];
    let current = new Date(startDateStr);
    for (let i = 0; i < weeks; i++) {
      slots.push({
        date: format(current, "yyyy-MM-dd"),
        timeslotId: selectedCell.timeslotId,
      });
      current = addDays(current, 7);
    }
    return slots;
  };

  const handleMenuSelect = async (option) => {
    if (!selectedCell) return;
    const { date, timeslotId } = selectedCell;
    handleCloseMenu();

    if (option === "single") {
      handleToggleSlotLocal(date, timeslotId);
    } else {
      const weeks = option === "month_1" ? 4 : 12;
      const slotsToAdd = generateRecurringSlots(date, weeks);
      try {
        await onAddAvailability(slotsToAdd);
        const startDateStr = format(weekDates[0], "yyyy-MM-dd");
        const endDateStr = format(weekDates[6], "yyyy-MM-dd");
        onFetchAvailability(startDateStr, endDateStr);
      } catch (error) {}
    }
  };

  const handleToggleSlotLocal = (dateStr, timeslotId) => {
    const existingIndex = localSlots.findIndex(
      (item) => item.date === dateStr && item.timeslotId === timeslotId
    );
    let newSlots = [...localSlots];
    if (existingIndex >= 0) {
      newSlots.splice(existingIndex, 1);
    } else {
      newSlots.push({
        date: dateStr,
        timeslotId: timeslotId,
        instructorType: instructorType,
      });
    }
    setLocalSlots(newSlots);
  };

  const handleSave = async () => {
    const startDateStr = format(weekDates[0], "yyyy-MM-dd");
    const endDateStr = format(weekDates[6], "yyyy-MM-dd");
    try {
      await onSaveAvailability(startDateStr, endDateStr, localSlots);
    } catch (error) {}
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
          {/* ... Phần nội dung Alert giữ nguyên ... */}
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Hướng dẫn & Quy tắc:
          </Typography>
          <Typography variant="body2" component="div" sx={{ lineHeight: 1.8 }}>
            1. Các ô{" "}
            <span
              style={{
                backgroundColor: "#f5f5f5",
                border: "1px solid #ccc",
                padding: "0 6px",
                borderRadius: "4px",
                color: "#666",
              }}
            >
              Màu xám
            </span>
            : BẬN. <br />
            2. Các ô{" "}
            <span
              style={{
                backgroundColor: "#e8f5e9",
                border: "1px solid #81c784",
                padding: "0 6px",
                borderRadius: "4px",
                color: "#2e7d32",
                fontWeight: "bold",
              }}
            >
              Màu xanh
            </span>
            : RẢNH. <br />
            3. Các ô{" "}
            <span style={{ color: "#0288d1", fontWeight: "bold" }}>
              Đang dạy
            </span>{" "}
            là lịch cố định. <br />
            {instructorType === "fulltime" && (
              <Box
                sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 1 }}
              >
                <span style={{ color: "#757575", fontWeight: "bold" }}>
                  * Các ô KHÓA
                </span>
                <span style={{ color: "#333" }}>
                  : Giáo viên Fulltime chỉ đăng ký lịch rảnh vào Chủ Nhật.
                </span>
              </Box>
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
          {/* --- KHU VỰC ĐIỀU HƯỚNG --- */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {/* Chọn năm */}
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={selectedYear}
                onChange={handleYearChange}
                sx={{ bgcolor: "white" }}
              >
                {yearsList.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Điều hướng tuần */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "white",
                borderRadius: 1,
                border: "1px solid #c4c4c4",
              }}
            >
              <IconButton onClick={handlePrevWeek}>
                <ChevronLeft />
              </IconButton>

              {/* --- DROPDOWN CHỌN TUẦN --- */}
              <FormControl variant="standard" sx={{ minWidth: 200 }}>
                <Select
                  value={weekStart.getTime()} // Dùng timestamp để làm value
                  onChange={handleWeekSelectChange}
                  disableUnderline
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    textAlign: "center",
                    ".MuiSelect-select": { py: 0.5, px: 1 },
                  }}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }} // Giới hạn chiều cao menu
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
            {saving ? "Đang Lưu..." : "Lưu Tuần Này"}
          </Button>
        </Box>
      </Box>

      {/* ... Phần Table và Menu giữ nguyên ... */}
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
                    bgcolor: i >= 5 ? "#fff8e1" : "#e3f2fd",
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
                  const dayOfWeek = getDay(dateObj);
                  const isFullTimeRestricted =
                    instructorType === "fulltime" && dayOfWeek !== 0;
                  const hasClass = existingSessions.some(
                    (s) => s.date === dateStr && s.timeslotId === slot.id
                  );
                  const isRegistered = localSlots.some(
                    (item) =>
                      item.date === dateStr && item.timeslotId === slot.id
                  );

                  let cellBgColor = "#fff";
                  let cellContent = null;
                  let isDisabled = false;

                  if (hasClass) {
                    cellBgColor = "#e1f5fe";
                    isDisabled = true;
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
                  } else if (isFullTimeRestricted) {
                    cellBgColor = "#eeeeee";
                    isDisabled = true;
                    cellContent = (
                      <Tooltip title="Fulltime - Chỉ được đăng ký Chủ Nhật">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#9e9e9e",
                            gap: 0.5,
                            opacity: 0.7,
                          }}
                        >
                          <BlockIcon sx={{ fontSize: 16 }} />
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            sx={{ fontSize: "0.7rem" }}
                          >
                            KHÓA
                          </Typography>
                        </Box>
                      </Tooltip>
                    );
                  } else if (isRegistered) {
                    cellBgColor = "#e8f5e9";
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
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        border: isRegistered
                          ? "1px solid #81c784"
                          : "1px solid #f0f0f0",
                        "&:hover": { bgcolor: !isDisabled && "#f5f5f5" },
                        height: 60,
                      }}
                      onClick={(e) =>
                        !isDisabled &&
                        handleCellClick(
                          e,
                          dateStr,
                          slot.id,
                          isFullTimeRestricted
                        )
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: "center", vertical: "top" }}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
      >
        <MenuItem onClick={() => handleMenuSelect("single")}>
          <ListItemIcon>
            <TodayIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Chỉ buổi này (Cần lưu)</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuSelect("month_1")}>
          <ListItemIcon>
            <RepeatIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="Đăng ký 1 tháng (4 tuần)"
            secondary="Tự động lưu ngay"
          />
        </MenuItem>
        <MenuItem onClick={() => handleMenuSelect("month_3")}>
          <ListItemIcon>
            <DateRangeIcon fontSize="small" color="secondary" />
          </ListItemIcon>
          <ListItemText
            primary="Đăng ký 3 tháng (12 tuần)"
            secondary="Tự động lưu ngay"
          />
        </MenuItem>
      </Menu>
    </Box>
  );
}
