import apiClient from "../../apiServices/apiClient";
import React, { useMemo, useState, useEffect } from "react";
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
  allTimeslots
}) => {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  
  const dayLabels = {
    Monday: "Thứ 2",
    Tuesday: "Thứ 3",
    Wednesday: "Thứ 4",
    Thursday: "Thứ 5",
    Friday: "Thứ 6",
    Saturday: "Thứ 7",
    Sunday: "Chủ nhật",
  };

  const [conflictAlert, setConflictAlert] = useState(null);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [checkingFutureSlots, setCheckingFutureSlots] = useState(false);
  const [futureSlotsAlert, setFutureSlotsAlert] = useState(null);

  console.log("weeklySchedule data:", weeklySchedule);
  console.log("allTimeslots data:", allTimeslots);

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

  // Helper function để lấy thứ trong tuần từ date
  const getDayOfWeekFromDate = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ...
    return dayOfWeek === 0 ? "Sunday" : days[dayOfWeek - 1];
  };

// Tính toán số tuần cần thiết dựa trên số slot đã chọn
const weeksNeeded = useMemo(() => {
  if (!requiredNumberOfSessions || selectedSlots.length === 0) return 0;
  
  // ⭐️ Xử lý trường hợp chỉ cần 1 buổi ⭐️
  if (requiredNumberOfSessions <= 1) {
    return 1;
  }
  
  // Nếu số buổi cần ≤ số buổi/tuần thì chỉ cần 1 tuần
  if (requiredNumberOfSessions <= selectedSlots.length) {
    return 1;
  }
  
  // Ngược lại tính toán bình thường
  return Math.ceil(requiredNumberOfSessions / selectedSlots.length);
}, [requiredNumberOfSessions, selectedSlots.length]);

  // Tính tổng số buổi sẽ có
  const totalSessionsIfSelected = useMemo(() => {
    if (selectedSlots.length === 0) return 0;
    return selectedSlots.length * weeksNeeded;
  }, [selectedSlots.length, weeksNeeded]);

  // Tính các ngày cụ thể trong tuần đã chọn
  const weekDates = useMemo(() => {
    if (!weeklySchedule || weeklySchedule.length === 0) return {};
    
    const dates = new Map();
    weeklySchedule.forEach(slot => {
      if (slot.Date && slot.Day && !dates.has(slot.Day)) {
        const dateStr = normalizeDate(slot.Date);
        dates.set(slot.Day, dateStr);
      }
    });
    
    return Object.fromEntries(dates);
  }, [weeklySchedule]);

  // Lấy thông tin slot đang xem xét (TimeslotID, Day, StartTime, EndTime)
  const getSlotInfo = (slot) => {
    if (!slot) return null;
    
    return {
      TimeslotID: slot.TimeslotID,
      Day: slot.Day, // Lấy từ dữ liệu weeklySchedule
      StartTime: slot.StartTime?.substring(0, 5) || "",
      EndTime: slot.EndTime?.substring(0, 5) || "",
      Date: normalizeDate(slot.Date),
      DayOfWeek: getDayOfWeekFromDate(normalizeDate(slot.Date))
    };
  };

  // Helper function: Tính ngày cụ thể cho một slot trong tuần target
  const calculateDateForSlotInWeek = (slotDetail, targetWeekDate) => {
    const originalDate = new Date(slotDetail.Date + "T00:00:00");
    const targetDate = new Date(targetWeekDate);
    
    // Lấy thứ trong tuần của slot gốc (0=Sunday, 1=Monday,...)
    const originalDayOfWeek = originalDate.getDay();
    
    // Đặt targetDate về cùng thứ trong tuần
    const targetDayOfWeek = targetDate.getDay();
    const dayDifference = originalDayOfWeek - targetDayOfWeek;
    targetDate.setDate(targetDate.getDate() + dayDifference);
    
    return targetDate;
  };

  // Kiểm tra xem tất cả các slot đã chọn có đủ trong tương lai không
// Sửa phần tính toán số tuần cần thiết
const checkAllSelectedSlotsFutureAvailability = async (newSlot) => {
  try {
    setCheckingFutureSlots(true);
    
    if (!allTimeslots || allTimeslots.length === 0) {
      throw new Error("Không có dữ liệu lịch học tương lai");
    }

    // Tạo danh sách tất cả slot cần kiểm tra (bao gồm slot mới)
    const slotsToCheck = [...selectedSlots, {
      TimeslotID: newSlot.TimeslotID,
      Date: normalizeDate(newSlot.Date)
    }];
    
    // Lấy thông tin chi tiết của từng slot từ weeklySchedule
    const slotDetails = slotsToCheck.map(slotItem => {
      const slotInSchedule = weeklySchedule.find(s => 
        s.TimeslotID === slotItem.TimeslotID && 
        normalizeDate(s.Date) === slotItem.Date
      );
      return slotInSchedule ? getSlotInfo(slotInSchedule) : null;
    }).filter(Boolean);

    if (slotDetails.length === 0) {
      return true; // Không có slot nào để kiểm tra
    }

    // ⭐️ QUAN TRỌNG: Xử lý trường hợp chỉ cần 1 buổi ⭐️
    if (requiredNumberOfSessions <= 1) {
      console.log("Chỉ cần 1 buổi học, không cần kiểm tra slot tương lai");
      return true; // Chỉ cần 1 buổi, không cần kiểm tra tương lai
    }

    const selectedSlotDate = new Date(normalizeDate(newSlot.Date) + "T00:00:00");
    
    // Lọc các slots trong tương lai từ allTimeslots
    const futureSlots = allTimeslots.filter(slot => {
      const slotDate = new Date(slot.Date + "T00:00:00");
      return slotDate > selectedSlotDate;
    });

    console.log("Checking future slots for", slotDetails.length, "selected slots");
    console.log("Total future slots available:", futureSlots.length);
    
    // ⭐️ SỬA: Tính toán chính xác số tuần cần thiết ⭐️
    const sessionsPerWeek = slotsToCheck.length;
    
    // Số tuần cần để đủ requiredNumberOfSessions
    let weeksNeededForNewSelection;
    if (requiredNumberOfSessions <= sessionsPerWeek) {
      // Nếu số buổi cần ≤ số buổi/tuần thì chỉ cần 1 tuần
      weeksNeededForNewSelection = 1;
    } else {
      // Ngược lại tính toán bình thường
      weeksNeededForNewSelection = Math.ceil(requiredNumberOfSessions / sessionsPerWeek);
    }
    
    // Số tuần TƯƠNG LAI cần kiểm tra
    const futureWeeksNeeded = weeksNeededForNewSelection - 1;
    
    console.log("Sessions per week:", sessionsPerWeek);
    console.log("Total weeks needed:", weeksNeededForNewSelection);
    console.log("Future weeks needed:", futureWeeksNeeded);

    // ⭐️ QUAN TRỌNG: Nếu không cần tuần tương lai nào, return true ngay ⭐️
    if (futureWeeksNeeded <= 0) {
      console.log("✅ Không cần kiểm tra slot tương lai");
      return true;
    }

    // Kiểm tra từng tuần trong tương lai
    let availableFutureWeeks = 0;
    const maxWeeksToCheck = Math.min(12, futureWeeksNeeded * 2); // Kiểm tra tối đa 12 tuần hoặc gấp đôi số tuần cần
    const availableWeeksDetails = [];
    
    for (let weekOffset = 1; weekOffset <= maxWeeksToCheck; weekOffset++) {
      const targetWeekDate = new Date(selectedSlotDate);
      targetWeekDate.setDate(selectedSlotDate.getDate() + (weekOffset * 7));
      
      // Kiểm tra xem tất cả slot có sẵn trong tuần này không
      const allSlotsAvailableInThisWeek = slotDetails.every(slotDetail => {
        // Tính ngày cụ thể cho slot này trong tuần target
        const slotDateInTargetWeek = calculateDateForSlotInWeek(slotDetail, targetWeekDate);
        const targetDateStr = normalizeDate(slotDateInTargetWeek);
        
        // Tìm slot trong futureSlots
        const foundSlot = futureSlots.find(futureSlot => {
          const futureSlotDay = getDayOfWeekFromDate(futureSlot.Date);
          
          return (
            futureSlot.TimeslotID === slotDetail.TimeslotID &&
            futureSlot.Status === "AVAILABLE" &&
            futureSlotDay === slotDetail.DayOfWeek &&
            futureSlot.StartTime?.substring(0, 5) === slotDetail.StartTime &&
            normalizeDate(futureSlot.Date) === targetDateStr
          );
        });
        
        return !!foundSlot;
      });
      
      if (allSlotsAvailableInThisWeek) {
        availableFutureWeeks++;
        availableWeeksDetails.push(weekOffset);
        console.log(`Week ${weekOffset}: All slots available`);
        
        if (availableFutureWeeks >= futureWeeksNeeded) {
          console.log("✅ Enough future weeks found!");
          return true;
        }
      } else {
        console.log(`Week ${weekOffset}: Not all slots available`);
      }
    }
    
    // Nếu không đủ tuần
    const missingWeeks = futureWeeksNeeded - availableFutureWeeks;
    const selectedSlotsCount = slotsToCheck.length;
    const currentTotalSessions = selectedSlotsCount * weeksNeededForNewSelection;
    
    let message = `Không đủ lịch trống trong tương lai.\n`; 
      message += `💡 Gợi ý: Thử chọn slot khác hoặc thời gian khác.`;

    
    setFutureSlotsAlert({
      severity: "warning",
      message: message,
      slot: newSlot,
      hasEnoughSlots: false,
      details: {
        selectedSlotsCount: selectedSlotsCount,
        sessionsPerWeek: sessionsPerWeek,
        weeksNeeded: weeksNeededForNewSelection,
        availableWeeks: availableFutureWeeks,
        missingWeeks: missingWeeks,
        availableWeeksDetails: availableWeeksDetails
      }
    });
    
    return false;
  } catch (error) {
    console.error("Error checking future slots:", error);
    setFutureSlotsAlert({
      severity: "error",
      message: "Không thể kiểm tra lịch học tương lai. Vui lòng thử lại.",
      hasEnoughSlots: false
    });
    return false;
  } finally {
    setCheckingFutureSlots(false);
  }
};
  // Hàm kiểm tra trùng lịch với lịch học hiện tại
  const checkScheduleConflict = async (slot) => {
    try {
      setCheckingConflict(true);
      
      const conflictCheck = await checkScheduleConflictApi(slot.TimeslotID, normalizeDate(slot.Date));
      
      if (conflictCheck.hasConflict && conflictCheck.conflictingClasses.length > 0) {
        const conflict = conflictCheck.conflictingClasses[0];
        setConflictAlert({
          severity: "warning",
          message: `Lịch học bị trùng với: ${conflict.ClassName} - ${conflict.Schedule.replace(/(\d{2}:\d{2}):\d{2}/g, "$1")}`,

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

// Xử lý khi click vào slot
const handleSlotClickWithConflictCheck = async (slot) => {
  if (slot.Status !== "available") return;

  const slotDate = normalizeDate(slot.Date);
  const isSelected = selectedSlots.some(
    s => s.TimeslotID === slot.TimeslotID && normalizeDate(s.Date) === slotDate
  );

  // Nếu đang bỏ chọn slot
  if (isSelected) {
    handleSlotClick(slot);
    return;
  }

  // Kiểm tra nếu đã chọn đủ 3 slot (giới hạn tối đa)
  if (selectedSlots.length >= 3) {
    setConflictAlert({
      severity: "warning",
      message: `Bạn chỉ được chọn tối đa 3 slot trong một tuần.`
    });
    return;
  }

  // Tính toán số buổi nếu thêm slot mới
  const newSelectedSlotsCount = selectedSlots.length + 1;
  let newWeeksNeeded;
  
  // ⭐️ Xử lý trường hợp chỉ cần 1 buổi ⭐️
  if (requiredNumberOfSessions <= 1) {
    newWeeksNeeded = 1;
  } else if (requiredNumberOfSessions <= newSelectedSlotsCount) {
    // Nếu số buổi cần ≤ số buổi/tuần thì chỉ cần 1 tuần
    newWeeksNeeded = 1;
  } else {
    // Ngược lại tính toán bình thường
    newWeeksNeeded = Math.ceil(requiredNumberOfSessions / newSelectedSlotsCount);
  }
  
  const newTotalSessions = newSelectedSlotsCount * newWeeksNeeded;
  
  // Kiểm tra nếu tổng số buổi vượt quá yêu cầu quá nhiều
  if (newTotalSessions > requiredNumberOfSessions + 2) { // Cho phép dư 2 buổi
    setConflictAlert({
      severity: "warning",
      message: `Nếu chọn thêm slot này, bạn sẽ có ${newTotalSessions} buổi, vượt quá yêu cầu ${requiredNumberOfSessions} buổi quá nhiều.`
    });
    return;
  }

  // Kiểm tra trùng lịch
  const hasConflict = await checkScheduleConflict(slot);
  if (hasConflict) {
    return;
  }

  // ⭐️ QUAN TRỌNG: Nếu chỉ cần 1 buổi, không cần kiểm tra tương lai ⭐️
  if (requiredNumberOfSessions <= 1) {
    console.log("Chỉ cần 1 buổi, cho phép chọn slot");
    handleSlotClick(slot);
    return;
  }

  // Kiểm tra tất cả slot đã chọn (kể cả slot mới) có đủ trong tương lai không
  const hasEnoughFutureSlots = await checkAllSelectedSlotsFutureAvailability(slot);
  
  if (hasEnoughFutureSlots) {
    handleSlotClick(slot);
  }
};

  const handleCloseAlert = () => {
    setConflictAlert(null);
  };

  const handleCloseFutureSlotsAlert = () => {
    setFutureSlotsAlert(null);
  };

  // Reset future slots alert khi selectedSlots thay đổi
  useEffect(() => {
    if (selectedSlots.length === 0) {
      setFutureSlotsAlert(null);
    }
  }, [selectedSlots]);

  // Lấy danh sách các time slots
  const timeSlots = useMemo(() => {
    if (!weeklySchedule || weeklySchedule.length === 0) {
      return [
        "08:00", "10:20", "13:00", "15:20", "17:40", "20:00"
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

  // Tạo schedule map theo DATE cụ thể + TIME
  const scheduleMap = useMemo(() => {
    const map = new Map();
    weeklySchedule.forEach((slot) => {
      if (slot.StartTime && slot.Date) {
        const timeKey = slot.StartTime.substring(0, 5);
        const dateStr = normalizeDate(slot.Date);
        const key = `${dateStr}_${timeKey}`;
        
        if (!map.has(key)) {
          map.set(key, slot);
        }
      }
    });
    return map;
  }, [weeklySchedule]);

  // Helper function để tính tuần
  const getWeekKey = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    const dayOfWeek = date.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(date);
    monday.setDate(date.getDate() - mondayOffset);
    return monday.toISOString().split("T")[0];
  };

  // Lấy thông tin các slot đã chọn
  const selectedSlotsInfo = useMemo(() => {
    return selectedSlots.map(slotItem => {
      const slotInSchedule = weeklySchedule.find(s => 
        s.TimeslotID === slotItem.TimeslotID && 
        normalizeDate(s.Date) === normalizeDate(slotItem.Date)
      );
      return slotInSchedule ? getSlotInfo(slotInSchedule) : null;
    }).filter(Boolean);
  }, [selectedSlots, weeklySchedule]);

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

      <Snackbar
        open={!!futureSlotsAlert}
        autoHideDuration={8000}
        onClose={handleCloseFutureSlotsAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={futureSlotsAlert?.severity || "warning"} 
          onClose={handleCloseFutureSlotsAlert}
          sx={{ width: '100%', whiteSpace: 'pre-line' }}
        >
          {futureSlotsAlert?.message}
        </Alert>
      </Snackbar>

      <Box sx={{ overflowX: "auto" }}>
        <Box sx={{ minWidth: 600 }}>

          {/* Header - Hiển thị ngày cụ thể cho mỗi thứ */}
          <Grid container spacing={0.5} sx={{ mb: 1 }}>
            <Grid item xs={2}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Giờ
              </Typography>
            </Grid>
            {days.map((day) => {
              const dayDate = weekDates[day];
              const displayDate = dayDate 
                ? new Date(dayDate + "T00:00:00").toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                  })
                : "";
              
              return (
                <Grid item xs={10 / 7} key={day}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      textAlign: "center",
                      display: "block",
                    }}
                  >
                    {dayLabels[day]}
                    {displayDate && (
                      <Box component="span" sx={{ display: "block", fontSize: "0.7rem", color: "text.secondary" }}>
                        {displayDate}
                      </Box>
                    )}
                  </Typography>
                </Grid>
              );
            })}
          </Grid>

          {/* Grid lịch học */}
          {timeSlots.map((time) => {
            const sampleSlot = weeklySchedule.find(
              (s) => s.StartTime && s.StartTime.substring(0, 5) === time
            );
            
            const timeEndMap = {
              "08:00": "10:00",
              "10:20": "12:20",
              "13:00": "15:00",
              "15:20": "17:20",
              "17:40": "19:40",
              "20:00": "22:00"
            };
            
            const endTime = sampleSlot
              ? sampleSlot.EndTime.substring(0, 5)
              : timeEndMap[time] || "22:00";
            const timeRange = `${time} - ${endTime}`;

            return (
              <Grid container spacing={0.5} key={time} sx={{ mb: 0.5 }}>
                <Grid item xs={2}>
                  <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                    {timeRange}
                  </Typography>
                </Grid>
                {days.map((day) => {
                  const dayDate = weekDates[day];
                  if (!dayDate) {
                    return (
                      <Grid item xs={10 / 7} key={`${day}_${time}`}>
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

                  const key = `${dayDate}_${time}`;
                  const slot = scheduleMap.get(key);
                  
                  if (!slot) {
                    return (
                      <Grid item xs={10 / 7} key={`${day}_${time}`}>
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
                    checkingConflict ||
                    checkingFutureSlots ||
                    (selectedSlots.length >= 3 && !isSelected);
                  
                  const bgColor = slot.Status === "available" ? "#4caf50" : "#ffffff";
                  const color = slot.Status === "busy" ? "#fff" : "#000";

                  // Kiểm tra xem slot này có trong danh sách cảnh báo không
                  const isWarningSlot = futureSlotsAlert?.slot && 
                    futureSlotsAlert.slot.TimeslotID === slot.TimeslotID &&
                    normalizeDate(futureSlotsAlert.slot.Date) === slotDate;

                  return (
                    <Grid item xs={10 / 7} key={`${day}_${time}`}>
                      <Box
                        onClick={() => handleSlotClickWithConflictCheck(slot)}
                        sx={{
                          height: 40,
                          border: isSelected ? "2px solid" : "1px solid",
                          borderColor: isSelected ? "primary.main" : 
                                     isWarningSlot ? "warning.main" : "divider",
                          bgcolor: isSelected ? "primary.light" : bgColor,
                          color: isSelected ? "primary.main" : color,
                          cursor: !isDisabled ? "pointer" : "not-allowed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
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
                        {(checkingConflict || checkingFutureSlots) && !isSelected && (
                          <CircularProgress size={16} />
                        )}
                        
                        {/* Hiển thị cảnh báo nếu slot không đủ trong tương lai */}
                        {isWarningSlot && !isSelected && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: -4,
                              right: -4,
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "warning.main",
                              border: "1px solid white"
                            }}
                          />
                        )}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
};

// API function để kiểm tra trùng lịch
const checkScheduleConflictApi = async (timeslotId, date) => {
  try {
    const response = await apiClient.get(`/schedule/check-conflict/timeslot/${timeslotId}?date=${date}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to check schedule conflict" };
  }
};

export default ScheduleGrid;