import apiClient from "../../apiServices/apiClient";
import { slotReservationApi } from "../../apiServices/slotReservationApi";
import React, { useMemo, useState, useEffect, useCallback } from "react";
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
  
  // ⭐️ State để lưu các slot đang được reserved
  const [reservedSlots, setReservedSlots] = useState(new Set());
  const [myReservedSlots, setMyReservedSlots] = useState(new Set()); // Slot do mình reserve
  const [checkingReservations, setCheckingReservations] = useState(false);

// ⭐️ Function để check và cập nhật reserved slots
const checkReservedSlots = useCallback(async () => {
  if (!weeklySchedule || weeklySchedule.length === 0) return;
  
  setCheckingReservations(true);
  try {
    const reserved = new Set();
    const expiredSlots = []; // ⭐️ THÊM: Lưu các slot đã hết timeout
    
    // Check từng slot trong weeklySchedule
    const checkPromises = weeklySchedule.map(async (slot) => {
      try {
        const result = await slotReservationApi.checkSlotStatus(
          slot.TimeslotID, 
          normalizeDate(slot.Date)
        );
        
        const key = `${slot.TimeslotID}_${normalizeDate(slot.Date)}`;
        
        // Nếu slot đang được reserved
        if (result.data.reserved) {
          reserved.add(key);
        } else {
          // ⭐️ THÊM: Check nếu là slot của mình đã hết timeout
          if (myReservedSlots.has(key)) {
            expiredSlots.push(slot);
          }
        }
      } catch (error) {
        console.error("Error checking slot:", error);
      }
    });
    
    await Promise.all(checkPromises);
    setReservedSlots(reserved);
    
    // ⭐️ THÊM: Xử lý các slot đã hết timeout
    if (expiredSlots.length > 0) {
      expiredSlots.forEach(slot => {
        const slotDate = normalizeDate(slot.Date);
        const slotKey = `${slot.TimeslotID}_${slotDate}`;
        
        // Xóa khỏi myReservedSlots
        setMyReservedSlots(prev => {
          const newSet = new Set(prev);
          newSet.delete(slotKey);
          return newSet;
        });
        
        // Bỏ chọn slot
        handleSlotClick(slot);
      });
    }
  } catch (error) {
    console.error("Error checking reserved slots:", error);
  } finally {
    setCheckingReservations(false);
  }
}, [weeklySchedule, myReservedSlots, handleSlotClick]);

  // ⭐️ Auto refresh reserved slots mỗi 5 giây
  useEffect(() => {
    checkReservedSlots();
    
    const interval = setInterval(() => {
      checkReservedSlots();
    }, 5000); // Refresh mỗi 5 giây
    
    return () => clearInterval(interval);
  }, [checkReservedSlots]);

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

  const getDayOfWeekFromDate = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 ? "Sunday" : days[dayOfWeek - 1];
  };

  const weeksNeeded = useMemo(() => {
    if (!requiredNumberOfSessions || selectedSlots.length === 0) return 0;
    if (requiredNumberOfSessions <= 1) return 1;
    if (requiredNumberOfSessions <= selectedSlots.length) return 1;
    return Math.ceil(requiredNumberOfSessions / selectedSlots.length);
  }, [requiredNumberOfSessions, selectedSlots.length]);

  const totalSessionsIfSelected = useMemo(() => {
    if (selectedSlots.length === 0) return 0;
    return selectedSlots.length * weeksNeeded;
  }, [selectedSlots.length, weeksNeeded]);

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

  const getSlotInfo = (slot) => {
    if (!slot) return null;
    
    return {
      TimeslotID: slot.TimeslotID,
      Day: slot.Day,
      StartTime: slot.StartTime?.substring(0, 5) || "",
      EndTime: slot.EndTime?.substring(0, 5) || "",
      Date: normalizeDate(slot.Date),
      DayOfWeek: getDayOfWeekFromDate(normalizeDate(slot.Date))
    };
  };

  const calculateDateForSlotInWeek = (slotDetail, targetWeekDate) => {
    const originalDate = new Date(slotDetail.Date + "T00:00:00");
    const targetDate = new Date(targetWeekDate);
    
    const originalDayOfWeek = originalDate.getDay();
    const targetDayOfWeek = targetDate.getDay();
    const dayDifference = originalDayOfWeek - targetDayOfWeek;
    targetDate.setDate(targetDate.getDate() + dayDifference);
    
    return targetDate;
  };

  const checkAllSelectedSlotsFutureAvailability = async (newSlot) => {
    try {
      setCheckingFutureSlots(true);
      
      if (!allTimeslots || allTimeslots.length === 0) {
        throw new Error("Không có dữ liệu lịch học tương lai");
      }

      const slotsToCheck = [...selectedSlots, {
        TimeslotID: newSlot.TimeslotID,
        Date: normalizeDate(newSlot.Date)
      }];
      
      const slotDetails = slotsToCheck.map(slotItem => {
        const slotInSchedule = weeklySchedule.find(s => 
          s.TimeslotID === slotItem.TimeslotID && 
          normalizeDate(s.Date) === slotItem.Date
        );
        return slotInSchedule ? getSlotInfo(slotInSchedule) : null;
      }).filter(Boolean);

      if (slotDetails.length === 0) return true;
      if (requiredNumberOfSessions <= 1) return true;

      const selectedSlotDate = new Date(normalizeDate(newSlot.Date) + "T00:00:00");
      
      const futureSlots = allTimeslots.filter(slot => {
        const slotDate = new Date(slot.Date + "T00:00:00");
        return slotDate > selectedSlotDate;
      });
      
      const sessionsPerWeek = slotsToCheck.length;
      
      let weeksNeededForNewSelection;
      if (requiredNumberOfSessions <= sessionsPerWeek) {
        weeksNeededForNewSelection = 1;
      } else {
        weeksNeededForNewSelection = Math.ceil(requiredNumberOfSessions / sessionsPerWeek);
      }
      
      const futureWeeksNeeded = weeksNeededForNewSelection - 1;

      if (futureWeeksNeeded <= 0) return true;

      let availableFutureWeeks = 0;
      const maxWeeksToCheck = Math.min(12, futureWeeksNeeded * 2);
      
      for (let weekOffset = 1; weekOffset <= maxWeeksToCheck; weekOffset++) {
        const targetWeekDate = new Date(selectedSlotDate);
        targetWeekDate.setDate(selectedSlotDate.getDate() + (weekOffset * 7));
        
        const allSlotsAvailableInThisWeek = slotDetails.every(slotDetail => {
          const slotDateInTargetWeek = calculateDateForSlotInWeek(slotDetail, targetWeekDate);
          const targetDateStr = normalizeDate(slotDateInTargetWeek);
          
          const foundSlot = futureSlots.find(futureSlot => {
            const futureSlotDay = getDayOfWeekFromDate(futureSlot.Date);
            
            return (
              futureSlot.TimeslotID === slotDetail.TimeslotID &&
              (futureSlot.Status === "AVAILABLE" || futureSlot.Status === "available") &&
              futureSlotDay === slotDetail.DayOfWeek &&
              futureSlot.StartTime?.substring(0, 5) === slotDetail.StartTime &&
              normalizeDate(futureSlot.Date) === targetDateStr
            );
          });
          
          return !!foundSlot;
        });
        
        if (allSlotsAvailableInThisWeek) {
          availableFutureWeeks++;
          
          if (availableFutureWeeks >= futureWeeksNeeded) {
            return true;
          }
        }
      }
      
      let message = `Không đủ lịch trống trong tương lai.\n`; 
      message += `💡 Gợi ý: Thử chọn slot khác hoặc thời gian khác.`;

      setFutureSlotsAlert({
        severity: "warning",
        message: message,
        slot: newSlot,
        hasEnoughSlots: false
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

  const handleSlotClickWithConflictCheck = async (slot) => {
    const slotDate = normalizeDate(slot.Date);
    const slotKey = `${slot.TimeslotID}_${slotDate}`;
    
    // ⭐️ Check nếu slot đang được reserved bởi NGƯỜI KHÁC (không phải mình)
    if (reservedSlots.has(slotKey) && !myReservedSlots.has(slotKey)) {
      setConflictAlert({
        severity: "info",
        message: "Slot này đang được giữ bởi người dùng khác"
      });
      return;
    }

    if (slot.Status !== "available") return;

    const isSelected = selectedSlots.some(
      s => s.TimeslotID === slot.TimeslotID && normalizeDate(s.Date) === slotDate
    );

    // Nếu đang bỏ chọn slot
    if (isSelected) {
      try {
        await slotReservationApi.releaseSlot(slot.TimeslotID, slotDate);
        // ⭐️ Xóa khỏi cả 2 Set
        setReservedSlots(prev => {
          const newSet = new Set(prev);
          newSet.delete(slotKey);
          return newSet;
        });
        setMyReservedSlots(prev => {
          const newSet = new Set(prev);
          newSet.delete(slotKey);
          return newSet;
        });
      } catch (error) {
        console.error("Error releasing slot:", error);
      }
      handleSlotClick(slot);
      return;
    }

    if (selectedSlots.length >= 3) {
      setConflictAlert({
        severity: "warning",
        message: `Bạn chỉ được chọn tối đa 3 slot trong một tuần.`
      });
      return;
    }

    const newSelectedSlotsCount = selectedSlots.length + 1;
    let newWeeksNeeded;
    
    if (requiredNumberOfSessions <= 1) {
      newWeeksNeeded = 1;
    } else if (requiredNumberOfSessions <= newSelectedSlotsCount) {
      newWeeksNeeded = 1;
    } else {
      newWeeksNeeded = Math.ceil(requiredNumberOfSessions / newSelectedSlotsCount);
    }
    
    const newTotalSessions = newSelectedSlotsCount * newWeeksNeeded;
    
    if (newTotalSessions > requiredNumberOfSessions + 2) {
      setConflictAlert({
        severity: "warning",
        message: `Nếu chọn thêm slot này, bạn sẽ có ${newTotalSessions} buổi, vượt quá yêu cầu ${requiredNumberOfSessions} buổi quá nhiều.`
      });
      return;
    }

    const hasConflict = await checkScheduleConflict(slot);
    if (hasConflict) return;

    if (requiredNumberOfSessions > 1) {
      const hasEnoughFutureSlots = await checkAllSelectedSlotsFutureAvailability(slot);
      if (!hasEnoughFutureSlots) return;
    }

    // ⭐️ Giữ chỗ slot
    try {
      const reserveResult = await slotReservationApi.reserveSlot(slot.TimeslotID, slotDate);
      
      if (reserveResult.success) {
        // ⭐️ Thêm vào cả 2 Set
        setReservedSlots(prev => new Set([...prev, slotKey]));
        setMyReservedSlots(prev => new Set([...prev, slotKey])); // Đánh dấu là của mình
        handleSlotClick(slot);
      } else {
        setConflictAlert({
          severity: "warning",
          message: reserveResult.message || "Không thể giữ slot này"
        });
      }
    } catch (error) {
      console.error("Error reserving slot:", error);
      setConflictAlert({
        severity: "error",
        message: "Lỗi khi giữ chỗ slot. Vui lòng thử lại."
      });
    }
  };

  const handleCloseAlert = () => {
    setConflictAlert(null);
  };

  const handleCloseFutureSlotsAlert = () => {
    setFutureSlotsAlert(null);
  };

  // ⭐️ Cleanup khi unmount
  useEffect(() => {
    return () => {
      if (selectedSlots.length > 0) {
        slotReservationApi.releaseAllSlots().catch(console.error);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedSlots.length === 0) {
      setFutureSlotsAlert(null);
    }
  }, [selectedSlots]);

  const timeSlots = useMemo(() => {
    if (!weeklySchedule || weeklySchedule.length === 0) {
      return ["08:00", "10:20", "13:00", "15:20", "17:40", "20:00"];
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

  const getWeekKey = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    const dayOfWeek = date.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(date);
    monday.setDate(date.getDate() - mondayOffset);
    return monday.toISOString().split("T")[0];
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
                  const slotKey = `${slot.TimeslotID}_${slotDate}`;
                  
                  const isSelected = selectedSlots.some(
                    (s) =>
                      s.TimeslotID === slot.TimeslotID &&
                      normalizeDate(s.Date) === slotDate
                  );

                  // ⭐️ Check nếu slot đang được reserved bởi NGƯỜI KHÁC
                  const isReservedByOthers = reservedSlots.has(slotKey) && !myReservedSlots.has(slotKey);

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
                    isReservedByOthers ||
                    slot.Status !== "available" ||
                    checkingConflict ||
                    checkingFutureSlots ||
                    (selectedSlots.length >= 3 && !isSelected);
                  
                  // ⭐️ Slot reserved hiển thị như slot trắng
                  let bgColor = slot.Status === "available" ? "#4caf50" : "#ffffff";
                  if (isReservedByOthers || slot.Status === "busy") {
                    bgColor = "#ffffff"; // reserved/busy - trắng
                  }
                  
                  const color = (slot.Status === "busy" || isReservedByOthers) ? "#000" : "#000";

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

const checkScheduleConflictApi = async (timeslotId, date) => {
  try {
    const response = await apiClient.get(`/schedule/check-conflict/timeslot/${timeslotId}?date=${date}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to check schedule conflict" };
  }
};

export default ScheduleGrid;