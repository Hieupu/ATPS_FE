import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Box,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Divider,
  Grid,
  Paper,
} from "@mui/material";
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterIcon,
  List as ListIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import classService from "../../../../apiServices/classService";
import { weekdayLabelMap, formatDateForDisplay } from "./ClassWizard.constants";

// Map day index (0-6) sang day code backend (T2, T3, ..., CN) - dùng để gửi API
const dayIndexToCode = {
  0: "CN",
  1: "T2",
  2: "T3",
  3: "T4",
  4: "T5",
  5: "T6",
  6: "T7",
};

// Map day index (0-6) sang day name trong DB (Monday, Tuesday, ...)
const dayIndexToDBDay = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

// Map day index (0-6) sang label hiển thị - giống ClassWizard.js
const daysOfWeekOptions = [
  { value: 0, label: "Chủ Nhật" },
  { value: 1, label: "Thứ Hai" },
  { value: 2, label: "Thứ Ba" },
  { value: 3, label: "Thứ Tư" },
  { value: 4, label: "Thứ Năm" },
  { value: 5, label: "Thứ Sáu" },
  { value: 6, label: "Thứ Bảy" },
];

// Helper để lấy label từ day index
const getDayLabel = (dayIndex) => {
  const option = daysOfWeekOptions.find((opt) => opt.value === dayIndex);
  return option ? option.label : "";
};

/**
 * Modal đổi lịch buổi học
 * - Chỉ phục vụ đổi lịch (không có mode "add")
 * - Lọc theo: thứ, khoảng ngày, timeslot
 * - Không hiển thị: ngày trùng với các buổi hiện có, ngày HOLIDAY
 * - Dừng theo endDate: BE vẫn có thể trả dài, FE cắt theo khoảng [startDate, endDate]
 */
const ClassSessionScheduleModal = ({
  open,
  onClose,
  onConfirm,
  instructorId,
  classId,
  baseDate, // ngày tham chiếu (ví dụ ngày buổi hiện tại khi đổi lịch)
  timeslots = [],
  existingSessions = [],
  sessionToReschedule, // Buổi gốc đang được đổi lịch (optional)
  opendatePlan, // Ngày dự kiến bắt đầu mới để validate
}) => {
  const [selectedTimeslotId, setSelectedTimeslotId] = useState(null);
  const [selectedRangeKey, setSelectedRangeKey] = useState(null); // StartTime-EndTime được chọn
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [chosenSlotKey, setChosenSlotKey] = useState(null);
  const [dateError, setDateError] = useState("");

  // Tính buổi cuối cùng và thông tin lớp
  const lastSession = useMemo(() => {
    if (!Array.isArray(existingSessions) || existingSessions.length === 0) {
      return null;
    }
    // Lọc các buổi không bị disable và sắp xếp theo Date
    const activeSessions = existingSessions
      .filter((s) => !s.isDisabled && s.Date)
      .sort((a, b) => dayjs(b.Date).valueOf() - dayjs(a.Date).valueOf());
    return activeSessions.length > 0 ? activeSessions[0] : null;
  }, [existingSessions]);

  // Tính các thứ và ca đang được dùng trong lớp
  const classDaysAndTimeslots = useMemo(() => {
    if (!Array.isArray(existingSessions) || existingSessions.length === 0) {
      return { days: [], timeslots: [] };
    }
    const daysSet = new Set();
    const timeslotsSet = new Set();
    existingSessions
      .filter((s) => !s.isDisabled && s.Date && s.TimeslotID)
      .forEach((s) => {
        const d = dayjs(s.Date);
        if (d.isValid()) {
          daysSet.add(d.day());
        }
        timeslotsSet.add(s.TimeslotID);
      });
    return {
      days: Array.from(daysSet).sort(),
      timeslots: Array.from(timeslotsSet),
    };
  }, [existingSessions]);

  // Map từ TimeslotID → StartTime-EndTime (để hiển thị unique time ranges)
  const timeslotIdToTimeRange = useMemo(() => {
    const map = new Map();
    (timeslots || []).forEach((ts) => {
      const tsId = ts.TimeslotID || ts.id;
      const start = (ts.StartTime || ts.startTime || "").substring(0, 5);
      const end = (ts.EndTime || ts.endTime || "").substring(0, 5);
      if (tsId != null && start && end) {
        map.set(tsId, `${start}-${end}`);
      }
    });
    return map;
  }, [timeslots]);

  // Map từ (StartTime-EndTime, Day) → TimeslotID
  // Key: "StartTime-EndTime_Day" (ví dụ: "08:00-10:00_Monday")
  // Value: TimeslotID
  // Lưu ý: Day trong DB là "Monday", "Tuesday", ..., không phải "T2", "T3", ...
  const timeslotMap = useMemo(() => {
    const map = new Map();
    (timeslots || []).forEach((ts) => {
      const start = (ts.StartTime || ts.startTime || "").substring(0, 5);
      const end = (ts.EndTime || ts.endTime || "").substring(0, 5);
      const day = ts.Day || ts.day; // "Monday", "Tuesday", "Wednesday", ...
      const timeslotId = ts.TimeslotID || ts.id;
      if (start && end && day && timeslotId != null) {
        // Normalize day name: có thể là "Monday" hoặc "MONDAY" hoặc "monday"
        const normalizedDay =
          day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
        const key = `${start}-${end}_${normalizedDay}`;
        map.set(key, timeslotId);
      }
    });
    return map;
  }, [timeslots]);

  // Options cho dropdown: distinct StartTime-EndTime (không phụ thuộc Day)
  const timeslotOptions = useMemo(() => {
    const rangesSet = new Set();
    (timeslots || []).forEach((ts) => {
      const start = (ts.StartTime || ts.startTime || "").substring(0, 5);
      const end = (ts.EndTime || ts.endTime || "").substring(0, 5);
      if (start && end) {
        rangesSet.add(`${start}-${end}`);
      }
    });
    return Array.from(rangesSet)
      .sort()
      .map((rangeKey) => ({
        value: rangeKey,
        label: rangeKey.replace("-", " - "),
      }));
  }, [timeslots]);

  // Set mặc định khi mở modal (phải đặt sau khi timeslotOptions được khai báo)
  useEffect(() => {
    if (open) {
      setError("");
      setDateError("");
      setAvailableSlots([]);
      setChosenSlotKey(null);

      // Mặc định từ ngày = Date của buổi cuối cùng
      let defaultStartDate = baseDate ? dayjs(baseDate) : dayjs().add(1, "day");
      if (lastSession?.Date) {
        defaultStartDate = dayjs(lastSession.Date);
      }
      const baseStr = defaultStartDate.format("YYYY-MM-DD");
      const endStr = defaultStartDate.add(7, "day").format("YYYY-MM-DD");
      setStartDate(baseStr);
      setEndDate(endStr);

      // Nếu có sessionToReschedule, lấy timeslot từ đó và tìm rangeKey tương ứng
      if (sessionToReschedule?.TimeslotID) {
        const timeslotId = sessionToReschedule.TimeslotID;
        setSelectedTimeslotId(timeslotId);
        // Tìm rangeKey từ TimeslotID
        const timeslot = timeslots.find(
          (ts) => (ts.TimeslotID || ts.id) === timeslotId
        );
        if (timeslot) {
          const start = (
            timeslot.StartTime ||
            timeslot.startTime ||
            ""
          ).substring(0, 5);
          const end = (timeslot.EndTime || timeslot.endTime || "").substring(
            0,
            5
          );
          if (start && end) {
            setSelectedRangeKey(`${start}-${end}`);
          }
        }
      } else if (timeslotOptions && timeslotOptions.length > 0) {
        // Chọn ca đầu tiên (chưa set TimeslotID, sẽ set sau khi chọn Day)
        const firstOption = timeslotOptions[0];
        setSelectedRangeKey(firstOption.value);
      }

      // Mặc định thứ theo baseDate hoặc lastSession
      const dayIdx = lastSession?.Date
        ? dayjs(lastSession.Date).day()
        : defaultStartDate.day();
      setSelectedDayIndex(dayIdx);
    }
  }, [
    open,
    baseDate,
    timeslots,
    sessionToReschedule,
    lastSession,
    timeslotOptions,
  ]);

  // Tính min/max cho date pickers để disable các ngày không hợp lệ
  const startDateMin = useMemo(() => {
    // Không được trước ngày dự kiến bắt đầu
    if (opendatePlan) {
      return dayjs(opendatePlan).format("YYYY-MM-DD");
    }
    return null;
  }, [opendatePlan]);

  const endDateMin = useMemo(() => {
    // Phải >= startDate
    if (startDate) {
      const start = dayjs(startDate);
      if (start.isValid()) {
        return start.format("YYYY-MM-DD");
      }
    }
    return null;
  }, [startDate]);

  const endDateMax = useMemo(() => {
    if (!startDate) return null;
    const start = dayjs(startDate);
    if (!start.isValid()) return null;

    // Chỉ giới hạn bởi startDate + 7 ngày (không bị giới hạn bởi opendatePlan)
    const maxFromStart = start.add(7, "day");
    return maxFromStart.format("YYYY-MM-DD");
  }, [startDate]);

  // Tự động điều chỉnh endDate khi startDate thay đổi (tối đa 7 ngày)
  useEffect(() => {
    if (!startDate || !endDate) return;

    const start = dayjs(startDate);
    const end = dayjs(endDate);

    if (!start.isValid() || !end.isValid()) return;

    const maxEndDate = start.add(7, "day");

    // Nếu endDate vượt quá 7 ngày từ startDate, tự động set lại
    if (end.isAfter(maxEndDate)) {
      const newEndDate = maxEndDate.format("YYYY-MM-DD");
      console.log(
        `[Modal] Auto-adjust endDate from ${endDate} to ${newEndDate}`
      );
      setEndDate(newEndDate);
    }
  }, [startDate, endDate]);

  // Validate ngày (chỉ để hiển thị error nếu cần)
  useEffect(() => {
    if (!startDate || !endDate) {
      setDateError("");
      return;
    }
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    if (!start.isValid() || !end.isValid()) {
      setDateError("");
      return;
    }

    // Với disable trong date picker, chỉ cần check các trường hợp edge case
    setDateError("");
  }, [startDate, endDate]);

  // Các thứ có trong khoảng ngày đã chọn
  const availableDayIndices = useMemo(() => {
    if (!startDate || !endDate) return [];
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    if (!start.isValid() || !end.isValid() || end.isBefore(start)) return [];

    const set = new Set();
    let cur = start;
    // Giới hạn tối đa 31 ngày để tránh loop quá dài
    let guard = 0;
    while (!cur.isAfter(end) && guard < 31) {
      set.add(cur.day());
      cur = cur.add(1, "day");
      guard += 1;
    }
    return Array.from(set).sort();
  }, [startDate, endDate]);

  // Đảm bảo selectedDayIndex luôn nằm trong availableDayIndices
  useEffect(() => {
    if (!availableDayIndices || availableDayIndices.length === 0) {
      setSelectedDayIndex(null);
      return;
    }
    if (
      selectedDayIndex === null ||
      selectedDayIndex === undefined ||
      !availableDayIndices.includes(selectedDayIndex)
    ) {
      setSelectedDayIndex(availableDayIndices[0]);
    }
  }, [availableDayIndices, selectedDayIndex]);

  // Tự động cập nhật TimeslotID khi chọn StartTime-EndTime và Day
  useEffect(() => {
    if (
      selectedRangeKey &&
      selectedDayIndex !== null &&
      selectedDayIndex !== undefined
    ) {
      // Dùng dayIndexToDBDay để match với format trong DB ("Monday", "Tuesday", ...)
      const dbDay = dayIndexToDBDay[selectedDayIndex]; // "Monday", "Tuesday", ...
      const key = `${selectedRangeKey}_${dbDay}`;
      const timeslotId = timeslotMap.get(key);
      if (timeslotId) {
        setSelectedTimeslotId(timeslotId);
      } else {
        // Không tìm thấy timeslot với Day này → reset TimeslotID
        setSelectedTimeslotId(null);
      }
    } else {
      // Chưa chọn đủ StartTime-EndTime hoặc Day → reset TimeslotID
      setSelectedTimeslotId(null);
    }
  }, [selectedRangeKey, selectedDayIndex, timeslotMap]);

  const existingSlotsSet = useMemo(() => {
    const set = new Set();
    (existingSessions || []).forEach((s) => {
      if (!s.Date || !s.TimeslotID) return;
      // Bỏ qua buổi đã bị disable (đang được đổi lịch)
      if (s.isDisabled) return;
      const dateStr = dayjs(s.Date).format("YYYY-MM-DD");
      // Normalize TimeslotID (có thể là string hoặc number)
      const timeslotId = String(s.TimeslotID || s.timeslotId || "");
      const key = `${dateStr}_${timeslotId}`;
      set.add(key);
    });
    console.log("[Modal] existingSlotsSet:", Array.from(set));
    return set;
  }, [existingSessions]);

  // Helper để render thứ trong tuần đúng - dùng daysOfWeekOptions
  const getWeekdayLabel = (dayIndex) => {
    return getDayLabel(dayIndex);
  };

  // Helper để render timeslot label từ TimeslotID
  // Xử lý cả trường hợp timeslotId là string hoặc number
  const getTimeslotLabel = (timeslotId) => {
    if (!timeslotId) return "Không xác định";

    // Normalize timeslotId để so sánh (có thể là string hoặc number)
    const normalizedId =
      typeof timeslotId === "string" ? parseInt(timeslotId, 10) : timeslotId;

    // Tìm timeslot trong timeslots array
    const ts = timeslots.find((t) => {
      const tId = t.TimeslotID || t.id;
      const normalizedTId = typeof tId === "string" ? parseInt(tId, 10) : tId;
      return normalizedTId === normalizedId;
    });

    if (!ts) {
      // Nếu không tìm thấy trong timeslots, thử tìm trong timeslotMap (reverse lookup)
      // Tìm tất cả entries có TimeslotID khớp
      for (const [key, mapTimeslotId] of timeslotMap.entries()) {
        const normalizedMapId =
          typeof mapTimeslotId === "string"
            ? parseInt(mapTimeslotId, 10)
            : mapTimeslotId;
        if (normalizedMapId === normalizedId) {
          // Extract StartTime-EndTime từ key (format: "08:00-10:00_Monday")
          const [timeRange] = key.split("_");
          if (timeRange) {
            return timeRange.replace("-", " - ");
          }
        }
      }
      return `Ca ${timeslotId}`;
    }

    const start = (ts.StartTime || ts.startTime || "").substring(0, 5);
    const end = (ts.EndTime || ts.endTime || "").substring(0, 5);
    if (!start || !end) return `Ca ${timeslotId}`;
    return `${start} - ${end}`;
  };

  const handleSearch = async () => {
    setError("");
    setAvailableSlots([]);
    setChosenSlotKey(null);

    if (dateError) {
      setError(dateError);
      return;
    }

    if (!instructorId) {
      setError("Thiếu thông tin giảng viên.");
      return;
    }
    if (!selectedTimeslotId) {
      setError("Vui lòng chọn ca học.");
      return;
    }
    if (selectedDayIndex === null || selectedDayIndex === undefined) {
      setError("Vui lòng chọn thứ trong tuần.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Vui lòng chọn khoảng ngày.");
      return;
    }

    const start = dayjs(startDate);
    const end = dayjs(endDate);
    if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
      setError("Khoảng ngày không hợp lệ.");
      return;
    }

    setLoading(true);
    try {
      const dayValue = dayIndexToCode[selectedDayIndex];
      const payload = {
        InstructorID: String(instructorId),
        TimeslotID: String(selectedTimeslotId),
        Day: dayValue,
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
        numSuggestions: 20,
        excludeClassId: classId ? String(classId) : undefined,
        ClassID: classId ? String(classId) : undefined,
      };

      console.log("[Modal] findSlotsForEdit payload:", payload);
      console.log("[Modal] classId:", classId);

      // Dùng API riêng cho edit (không trả HOLIDAY)
      const result = await classService.findSlotsForEdit(payload);
      const suggestions = result?.data?.suggestions || [];

      // Lấy danh sách HOLIDAY trong khoảng ngày để filter
      const holidayDates = new Set();
      try {
        const leaveResult = await classService.getInstructorLeaves({
          InstructorID: String(instructorId),
          startDate: start.format("YYYY-MM-DD"),
          endDate: end.format("YYYY-MM-DD"),
        });
        const leaves = Array.isArray(leaveResult)
          ? leaveResult
          : leaveResult?.data || [];
        // Filter chỉ lấy HOLIDAY
        leaves.forEach((leave) => {
          if (leave.Date && leave.Status === "HOLIDAY") {
            const leaveDate = dayjs(leave.Date).format("YYYY-MM-DD");
            // Check xem có timeslot nào bị ảnh hưởng không
            // Nếu không có TimeslotID hoặc TimeslotID = null, nghĩa là cả ngày là HOLIDAY
            if (!leave.TimeslotID || leave.TimeslotID === null) {
              holidayDates.add(leaveDate);
            } else if (leave.TimeslotID === Number(selectedTimeslotId)) {
              // Nếu có TimeslotID và trùng với timeslot đang chọn, cũng là HOLIDAY
              holidayDates.add(leaveDate);
            }
          }
        });
        console.log("[Modal] Holiday dates:", Array.from(holidayDates));
      } catch (error) {
        console.error("[Modal] Error fetching holidays:", error);
      }

      // Map suggestions → slots với filter cơ bản:
      // - Trong khoảng [startDate, endDate]
      // - Không trùng existingSessions (bỏ qua buổi đã disable)
      // - Chỉ giữ các slot available = true (backend đã check conflict)
      // - Không có learnerConflicts (nếu có)
      // - Không HOLIDAY (nếu có status/reason)
      const candidateSlots = suggestions
        .map((s) => {
          const d = dayjs(s.date || s.Date);
          if (!d.isValid()) return null;
          const iso = d.format("YYYY-MM-DD");

          // Cắt theo khoảng ngày để không phải đợi đủ numSuggestions
          if (d.isBefore(start) || d.isAfter(end)) {
            return null;
          }

          const tsId = String(
            s.timeslotId || s.TimeslotID || selectedTimeslotId
          );
          const key = `${iso}_${tsId}`;

          // Bỏ slot trùng với các buổi hiện có (không tính buổi đã disable)
          if (existingSlotsSet.has(key)) {
            console.log(
              `[Modal] Slot ${key} trùng với existingSessions, bỏ qua`
            );
            return null;
          }

          // Chỉ giữ các slot available = true (backend đã check conflict cơ bản)
          if (s.available !== true) {
            return null;
          }

          // Bỏ HOLIDAY nếu backend trả status/reason hoặc nằm trong danh sách holidayDates
          if (
            s.status === "HOLIDAY" ||
            s.Status === "HOLIDAY" ||
            s.reason === "HOLIDAY" ||
            s.reason === "holiday" ||
            holidayDates.has(iso)
          ) {
            console.log(`[Modal] Slot ${key} là HOLIDAY, bỏ qua`);
            return null;
          }

          // Nếu có learnerConflicts và không rỗng, bỏ qua slot này
          // (có thể cho phép nếu cần, nhưng để an toàn thì bỏ qua)
          if (
            s.learnerConflicts &&
            Array.isArray(s.learnerConflicts) &&
            s.learnerConflicts.length > 0
          ) {
            return null;
          }

          return {
            key,
            date: iso,
            timeslotId: tsId,
          };
        })
        .filter(Boolean);

      // Filter các slot hợp lệ (đã filter HOLIDAY ở trên)
      const filtered = candidateSlots;

      setAvailableSlots(filtered);

      if (filtered.length === 0) {
        setError(
          "Không tìm thấy buổi học hợp lệ trong khoảng thời gian đã chọn."
        );
      }
    } catch (e) {
      console.error("[ClassSessionScheduleModal] Search error:", e);
      setError(
        e?.message ||
          e?.error ||
          "Có lỗi xảy ra khi tìm buổi học trống. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!chosenSlotKey) {
      setError("Vui lòng chọn một buổi học.");
      return;
    }
    const chosen = availableSlots.find((s) => s.key === chosenSlotKey);
    if (!chosen) {
      setError("Buổi học đã chọn không còn hợp lệ, vui lòng chọn lại.");
      return;
    }
    setError("");
    const payload = {
      Date: chosen.date,
      TimeslotID: chosen.timeslotId,
    };
    onConfirm && onConfirm(payload);
    onClose && onClose();
  };

  const handleClose = () => {
    setError("");
    setDateError("");
    setAvailableSlots([]);
    setChosenSlotKey(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}
      >
        <ScheduleIcon color="primary" />
        Đổi lịch buổi học
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Cột trái: Lựa chọn options */}
          <Grid item xs={12} md={5}>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <FilterIcon color="primary" />
                Chọn điều kiện tìm kiếm
              </Typography>

              <Stack spacing={2}>
                {/* Ca học */}
                <TextField
                  select
                  label="Ca học"
                  value={selectedRangeKey || ""}
                  onChange={(e) => {
                    const rangeKey = e.target.value;
                    setSelectedRangeKey(rangeKey || null);
                    // TimeslotID sẽ được tự động cập nhật bởi useEffect khi chọn Day
                  }}
                  fullWidth
                  required
                  helperText="Chọn khoảng thời gian (StartTime - EndTime)"
                >
                  <MenuItem value="">-- Chọn ca --</MenuItem>
                  {timeslotOptions.map((opt, index) => (
                    <MenuItem
                      key={`timeslot-opt-${opt.value}-${index}`}
                      value={opt.value}
                    >
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Thứ trong tuần */}
                <TextField
                  select
                  label="Thứ trong tuần"
                  value={
                    selectedDayIndex === null || selectedDayIndex === undefined
                      ? ""
                      : selectedDayIndex
                  }
                  onChange={(e) =>
                    setSelectedDayIndex(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  fullWidth
                  required
                  helperText="Chỉ hiển thị các thứ có trong khoảng ngày đã chọn."
                >
                  <MenuItem value="">-- Chọn thứ --</MenuItem>
                  {availableDayIndices.map((idx, index) => (
                    <MenuItem key={`day-opt-${idx}-${index}`} value={idx}>
                      {getWeekdayLabel(idx)}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Khoảng ngày */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label="Từ ngày"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: startDateMin || undefined,
                    }}
                    helperText={
                      opendatePlan
                        ? `Không được trước ngày dự kiến bắt đầu (${formatDateForDisplay(
                            opendatePlan
                          )})`
                        : undefined
                    }
                  />
                  <TextField
                    label="Đến ngày"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: endDateMin || undefined,
                      max: endDateMax || undefined,
                    }}
                    helperText={
                      startDate
                        ? "Tối đa 7 ngày từ ngày bắt đầu"
                        : "Vui lòng chọn ngày bắt đầu trước"
                    }
                    disabled={!startDate}
                  />
                </Stack>

                {/* Nút tìm kiếm */}
                <Button
                  variant="contained"
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <SearchIcon />
                  }
                  onClick={handleSearch}
                  disabled={loading || !startDate || !endDate}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  {loading ? "Đang tìm..." : "Tìm buổi phù hợp"}
                </Button>
              </Stack>
            </Box>
          </Grid>

          {/* Cột phải: Thông tin và danh sách buổi học */}
          <Grid item xs={12} md={7}>
            <Stack spacing={2}>
              {/* Thông tin buổi cần đổi và lớp */}
              <Paper elevation={1} sx={{ p: 2, bgcolor: "grey.50" }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                  color="primary"
                >
                  <InfoIcon fontSize="small" />
                  Thông tin
                </Typography>
                <Stack spacing={1.5}>
                  {/* Ngày cần đổi */}
                  {sessionToReschedule && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Ngày cần đổi:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatDateForDisplay(sessionToReschedule.Date)} (
                        {getWeekdayLabel(dayjs(sessionToReschedule.Date).day())}
                        ) - {getTimeslotLabel(sessionToReschedule.TimeslotID)}
                      </Typography>
                    </Box>
                  )}

                  {/* Các thứ và ca đang được dùng */}
                  {classDaysAndTimeslots.days.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Các thứ đang học:
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          flexWrap: "wrap",
                          mt: 0.5,
                        }}
                      >
                        {classDaysAndTimeslots.days.map((dayIdx, index) => (
                          <Chip
                            key={`day-${dayIdx}-${index}`}
                            label={getWeekdayLabel(dayIdx)}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {(() => {
                    // Gộp các TimeslotID có cùng StartTime-EndTime lại với nhau
                    // Chỉ hiển thị các ca khác nhau (unique time ranges)
                    const uniqueTimeRanges = new Set();
                    classDaysAndTimeslots.timeslots.forEach((tsId) => {
                      const timeRange = timeslotIdToTimeRange.get(tsId);
                      if (timeRange) {
                        uniqueTimeRanges.add(timeRange);
                      }
                    });
                    const sortedTimeRanges =
                      Array.from(uniqueTimeRanges).sort();

                    return sortedTimeRanges.length > 0 ? (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Các ca đang học:
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.5,
                            flexWrap: "wrap",
                            mt: 0.5,
                          }}
                        >
                          {sortedTimeRanges.map((timeRange, index) => (
                            <Chip
                              key={`time-range-${timeRange}-${index}`}
                              label={timeRange.replace("-", " - ")}
                              size="small"
                              variant="outlined"
                              color="secondary"
                            />
                          ))}
                        </Box>
                      </Box>
                    ) : null;
                  })()}

                  {/* Ngày cuối cùng */}
                  {lastSession && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Buổi cuối cùng hiện có:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatDateForDisplay(lastSession.Date)} (
                        {getWeekdayLabel(dayjs(lastSession.Date).day())}) -{" "}
                        {getTimeslotLabel(lastSession.TimeslotID)}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>

              <Divider />

              {/* Danh sách slot */}
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <ListIcon color="primary" />
                  Chọn buổi học mới
                </Typography>

                {availableSlots.length === 0 && !loading && (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 4,
                      color: "text.secondary",
                    }}
                  >
                    <CalendarIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                    <Typography variant="body2">
                      Chưa có gợi ý. Vui lòng chọn điều kiện và bấm &quot;Tìm
                      buổi phù hợp&quot;.
                    </Typography>
                  </Box>
                )}

                {loading && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      py: 4,
                    }}
                  >
                    <CircularProgress />
                    <Typography
                      variant="body2"
                      sx={{ mt: 2, color: "text.secondary" }}
                    >
                      Đang tải gợi ý...
                    </Typography>
                  </Box>
                )}

                {availableSlots.length > 0 && (
                  <List
                    sx={{
                      maxHeight: 400,
                      overflowY: "auto",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    {availableSlots.map((slot, index) => {
                      const d = dayjs(slot.date);
                      const display = d.isValid()
                        ? d.format("DD/MM/YYYY")
                        : slot.date;
                      const wk = getWeekdayLabel(d.day());
                      const timeLabel = getTimeslotLabel(
                        slot.timeslotId || selectedTimeslotId
                      );
                      const isSelected = chosenSlotKey === slot.key;

                      return (
                        <ListItem
                          key={`slot-${slot.key}-${index}`}
                          disablePadding
                        >
                          <ListItemButton
                            selected={isSelected}
                            onClick={() => setChosenSlotKey(slot.key)}
                            sx={{
                              borderRadius: 1,
                              mb: 0.5,
                              "&.Mui-selected": {
                                backgroundColor: "primary.main",
                                color: "primary.contrastText",
                                "&:hover": {
                                  backgroundColor: "primary.dark",
                                },
                              },
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Typography variant="body1" fontWeight={600}>
                                    {display}
                                  </Typography>
                                  {wk && (
                                    <Chip
                                      label={wk}
                                      size="small"
                                      color={isSelected ? "default" : "primary"}
                                      variant={
                                        isSelected ? "filled" : "outlined"
                                      }
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mt: 0.5,
                                  }}
                                >
                                  <ScheduleIcon sx={{ fontSize: 16 }} />
                                  <Typography variant="body2">
                                    {timeLabel}
                                  </Typography>
                                </Box>
                              }
                            />
                            {isSelected && (
                              <CheckCircleIcon sx={{ color: "white" }} />
                            )}
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={loading || !chosenSlotKey}
          startIcon={<CheckCircleIcon />}
        >
          Đổi lịch
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassSessionScheduleModal;
