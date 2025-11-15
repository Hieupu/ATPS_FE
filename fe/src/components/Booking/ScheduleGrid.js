import apiClient from "../../apiServices/apiClient";
import React, { useMemo, useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";

const ScheduleGrid = ({
  loading,
  weeklySchedule,
  selectedSlots,
  handleSlotClick,
  selectedCourseId,
  courseInfo,
  requiredNumberOfSessions,
}) => {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  
  const dayLabels = {
    Monday: "Thứ 2",
    Tuesday: "Thứ 3",
    Wednesday: "Thứ 4",
    Thursday: "Thứ 5",
    Friday: "Thứ 6",
    Saturday: "Thứ 7",
  };

  const [conflictAlert, setConflictAlert] = useState(null);
  const [checkingConflict, setCheckingConflict] = useState(false);

  console.log("kaka" , weeklySchedule)

  // Lấy danh sách các time slots
  const timeSlots = useMemo(() => {
    if (!weeklySchedule || weeklySchedule.length === 0) {
      return [
        "07:30", "09:00", "10:30", "12:00", "12:30", "14:00", 
        "15:30", "17:00", "17:30", "19:00", "20:30"
      ];
    }

    const startTimes = new Set();
    weeklySchedule.forEach((slot) => {
      if (slot.StartTime) {
        const timeStr = slot.StartTime.substring(0, 5);
        startTimes.add(timeStr);
      }
    });

    const sortedTimes = Array.from(startTimes).sort((a, b) => {
      const [h1, m1] = a.split(":").map(Number);
      const [h2, m2] = b.split(":").map(Number);
      return h1 * 60 + m1 - (h2 * 60 + m2);
    });

    return sortedTimes;
  }, [weeklySchedule]);

  // Tạo schedule map để dễ truy cập
  const scheduleMap = useMemo(() => {
    const map = new Map();
    weeklySchedule.forEach((slot) => {
      if (slot.StartTime) {
        const timeKey = slot.StartTime.substring(0, 5);
        const key = `${slot.Day}_${timeKey}`;
        map.set(key, slot);
      }
    });
    return map;
  }, [weeklySchedule]);

  // Helper function để normalize date
  const normalizeDate = (date) => {
    if (!date) return "";
    
    let normalizedDate;
    if (typeof date === "string") {
      if (date.includes('T')) {
        const dateObj = new Date(date);
        const year = dateObj.getUTCFullYear();
        const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getUTCDate()).padStart(2, '0');
        normalizedDate = `${year}-${month}-${day}`;
      } else {
        normalizedDate = date;
      }
    } else if (date instanceof Date) {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      normalizedDate = `${year}-${month}-${day}`;
    } else {
      normalizedDate = String(date);
    }
    
    return normalizedDate;
  };

  // Helper function để tính tuần
  const getWeekKey = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    const dayOfWeek = date.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(date);
    monday.setDate(date.getDate() - mondayOffset);
    return monday.toISOString().split("T")[0];
  };

  // Hàm kiểm tra trùng lịch với lịch học hiện tại - ĐÃ SỬA
  const checkScheduleConflict = async (slot) => {
    try {
      setCheckingConflict(true);
      
      // Gọi API kiểm tra trùng lịch với ngày cụ thể
      const conflictCheck = await checkScheduleConflictApi(slot.TimeslotID, normalizeDate(slot.Date));
      
      if (conflictCheck.hasConflict && conflictCheck.conflictingClasses.length > 0) {
        const conflict = conflictCheck.conflictingClasses[0];
        setConflictAlert({
          severity: "warning",
          message: `⚠️ Lịch học bị trùng với: ${conflict.ClassName} - ${conflict.Schedule}`,
          slot: slot
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking schedule conflict:", error);
      setConflictAlert({
        severity: "error",
        message: "Không thể kiểm tra lịch học. Vui lòng thử lại."
      });
      return false;
    } finally {
      setCheckingConflict(false);
    }
  };

  // Xử lý khi click vào slot - ĐÃ THÊM KIỂM TRA TRÙNG LỊCH
  const handleSlotClickWithConflictCheck = async (slot) => {
    if (slot.Status !== "available") return;

    // Kiểm tra xem slot đã được chọn chưa
    const slotDate = normalizeDate(slot.Date);
    const isSelected = selectedSlots.some(
      s => s.TimeslotID === slot.TimeslotID && normalizeDate(s.Date) === slotDate
    );

    // Nếu đang bỏ chọn slot, không cần kiểm tra trùng lịch
    if (isSelected) {
      handleSlotClick(slot);
      return;
    }

    // Kiểm tra trùng lịch trước khi chọn slot mới
    const hasConflict = await checkScheduleConflict(slot);
    
    if (!hasConflict) {
      // Nếu không trùng, cho phép chọn slot
      handleSlotClick(slot);
    }
  };

  // Đóng alert
  const handleCloseAlert = () => {
    setConflictAlert(null);
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, height: "100%" }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Lịch học
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Lịch học
      </Typography>

      {/* Alert thông báo trùng lịch */}
      <Snackbar
        open={!!conflictAlert}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={conflictAlert?.severity || "warning"} 
          onClose={handleCloseAlert}
          sx={{ width: '100%' }}
        >
          {conflictAlert?.message}
        </Alert>
      </Snackbar>

      <Box sx={{ overflowX: "auto" }}>
        <Box sx={{ minWidth: 600 }}>
          {/* Header - Các thứ trong tuần */}
          <Grid container spacing={0.5} sx={{ mb: 1 }}>
            <Grid item xs={2}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Giờ
              </Typography>
            </Grid>
            {days.map((day) => (
              <Grid item xs={10 / 6} key={day}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    textAlign: "center",
                    display: "block",
                  }}
                >
                  {dayLabels[day]}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Grid lịch học */}
          {timeSlots.map((time) => {
            const sampleSlot = weeklySchedule.find(
              (s) => s.StartTime && s.StartTime.substring(0, 5) === time
            );
            const endTime = sampleSlot
              ? sampleSlot.EndTime.substring(0, 5)
              : timeSlots[timeSlots.indexOf(time) + 1] || "20:30";
            const timeRange = `${time} - ${endTime}`;

            return (
              <Grid container spacing={0.5} key={time} sx={{ mb: 0.5 }}>
                <Grid item xs={2}>
                  <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                    {timeRange}
                  </Typography>
                </Grid>
                {days.map((day) => {
                  const slot = scheduleMap.get(`${day}_${time}`);
                  if (!slot) {
                    return (
                      <Grid item xs={10 / 6} key={`${day}_${time}`}>
                        <Box
                          sx={{
                            height: 40,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "grey.100",
                          }}
                        />
                      </Grid>
                    );
                  }

                  const slotDate = normalizeDate(slot.Date);
                  const isSelected = selectedSlots.some(
                    (s) =>
                      s.TimeslotID === slot.TimeslotID &&
                      normalizeDate(s.Date) === slotDate
                  );

                  // Kiểm tra số slots đã chọn trong cùng tuần
                  const currentWeekKey = getWeekKey(slotDate);
                  const slotsInSameWeek = selectedSlots.filter((s) => {
                    const sWeekKey = getWeekKey(normalizeDate(s.Date));
                    return sWeekKey === currentWeekKey;
                  });
                  const hasReachedMaxSlotsInWeek =
                    slotsInSameWeek.length >= 3 && !isSelected;

                  const isDisabled =
                    !selectedCourseId ||
                    !courseInfo ||
                    hasReachedMaxSlotsInWeek ||
                    slot.Status !== "available" ||
                    checkingConflict;
                  
                  const bgColor =
                    slot.Status === "busy"
                      ? "#f44336"
                      : slot.Status === "available"
                      ? "#4caf50"
                      : "#ffffff";
                  const color = slot.Status === "busy" ? "#fff" : "#000";

                  return (
                    <Grid item xs={10 / 6} key={`${day}_${time}`}>
                      <Box
                        onClick={() => handleSlotClickWithConflictCheck(slot)}
                        sx={{
                          height: 40,
                          border: isSelected ? "2px solid" : "1px solid",
                          borderColor: isSelected ? "primary.main" : "divider",
                          bgcolor: isSelected ? "primary.light" : bgColor,
                          color: isSelected ? "primary.main" : color,
                          cursor: !isDisabled ? "pointer" : "not-allowed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          "&:hover": !isDisabled
                            ? {
                                opacity: 0.8,
                                transform: "scale(1.02)",
                              }
                            : {},
                          opacity: isDisabled ? 0.5 : 1,
                          transition: "all 0.2s",
                        }}
                      >
                        {isSelected && (
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            ✓
                          </Typography>
                        )}
                        {checkingConflict && !isSelected && (
                          <CircularProgress size={16} />
                        )}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            );
          })}

          {/* Legend */}
          <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: "#4caf50",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              />
              <Typography variant="caption">Có sẵn</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: "#f44336",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              />
              <Typography variant="caption">Bận</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: "#ffffff",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              />
              <Typography variant="caption">Trống</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

// API function để kiểm tra trùng lịch - ĐÃ SỬA
const checkScheduleConflictApi = async (timeslotId, date) => {
  try {
    const response = await apiClient.get(`/schedule/check-conflict/timeslot/${timeslotId}?date=${date}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to check schedule conflict" };
  }
};

export default ScheduleGrid;