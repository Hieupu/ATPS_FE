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
  
  const [reservedSlots, setReservedSlots] = useState(new Set());
  const [myReservedSlots, setMyReservedSlots] = useState(new Set());
  const [checkingReservations, setCheckingReservations] = useState(false);

  // ⭐️ ANTI-SPAM: Theo dõi lịch sử reserve của từng slot
  const [slotReserveHistory, setSlotReserveHistory] = useState(() => {
    // Load từ localStorage nếu có
    const saved = localStorage.getItem('slotReserveHistory');
    return saved ? JSON.parse(saved) : {};
  });

  // ⭐️ ANTI-SPAM: Trạng thái bị khóa (banned)
  const [isBanned, setIsBanned] = useState(false);
  const [banEndTime, setBanEndTime] = useState(null);
  const [banTimeRemaining, setBanTimeRemaining] = useState(0);

  // ⭐️ ANTI-SPAM: Check trạng thái ban khi component mount
  useEffect(() => {
    const checkBanStatus = () => {
      const banData = localStorage.getItem('slotReserveBan');
      if (banData) {
        const { endTime } = JSON.parse(banData);
        const now = Date.now();
        
        if (now < endTime) {
          setIsBanned(true);
          setBanEndTime(endTime);
          setBanTimeRemaining(Math.ceil((endTime - now) / 1000));
        } else {
          // Hết thời gian ban, xóa
          localStorage.removeItem('slotReserveBan');
          setIsBanned(false);
          setBanEndTime(null);
        }
      }
    };

    checkBanStatus();
    
    // Check mỗi giây để update countdown
    const interval = setInterval(checkBanStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // ⭐️ ANTI-SPAM: Cleanup history cũ (sau 15 phút)
  useEffect(() => {
    const cleanupHistory = () => {
      const now = Date.now();
      const fifteenMinutes = 15 * 60 * 1000;
      
      setSlotReserveHistory(prev => {
        const cleaned = {};
        Object.keys(prev).forEach(key => {
          const history = prev[key].filter(timestamp => 
            now - timestamp < fifteenMinutes
          );
          if (history.length > 0) {
            cleaned[key] = history;
          }
        });
        
        // Save to localStorage
        localStorage.setItem('slotReserveHistory', JSON.stringify(cleaned));
        return cleaned;
      });
    };

    // Cleanup mỗi phút
    const interval = setInterval(cleanupHistory, 60000);
    return () => clearInterval(interval);
  }, []);

  // ⭐️ ANTI-SPAM: Function để check spam behavior
  const checkSpamBehavior = (slotKey) => {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    // Lấy lịch sử reserve của slot này trong 5 phút gần đây
    const recentHistory = (slotReserveHistory[slotKey] || []).filter(
      timestamp => now - timestamp < fiveMinutes
    );
    
    // Nếu đã reserve cùng 1 slot >= 5 lần trong 5 phút
    if (recentHistory.length >= 5) {
      // Ban user trong 10 phút
      const banUntil = now + (10 * 60 * 1000);
      localStorage.setItem('slotReserveBan', JSON.stringify({
        endTime: banUntil,
        reason: 'spam_reserve'
      }));
      
      setIsBanned(true);
      setBanEndTime(banUntil);
      
      setConflictAlert({
        severity: "error",
        message: `Bạn đã giữ slot này quá nhiều lần (${recentHistory.length} lần trong 5 phút). Bạn bị tạm khóa trong 10 phút.`
      });
      
      return true; // Spam detected
    }
    
    return false; // OK
  };

  // ⭐️ ANTI-SPAM: Record reserve action
  const recordReserveAction = (slotKey) => {
    const now = Date.now();
    
    setSlotReserveHistory(prev => {
      const updated = {
        ...prev,
        [slotKey]: [...(prev[slotKey] || []), now]
      };
      
      // Save to localStorage
      localStorage.setItem('slotReserveHistory', JSON.stringify(updated));
      return updated;
    });
  };

  const checkReservedSlots = useCallback(async () => {
    if (!weeklySchedule || weeklySchedule.length === 0) return;
    
    setCheckingReservations(true);
    try {
      const reserved = new Set();
      const expiredSlots = [];
      
      const checkPromises = weeklySchedule.map(async (slot) => {
        try {
          const result = await slotReservationApi.checkSlotStatus(
            slot.TimeslotID, 
            normalizeDate(slot.Date)
          );
          
          const key = `${slot.TimeslotID}_${normalizeDate(slot.Date)}`;
          
          if (result.data.reserved) {
            reserved.add(key);
          } else {
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
      
      if (expiredSlots.length > 0) {
        expiredSlots.forEach(slot => {
          const slotDate = normalizeDate(slot.Date);
          const slotKey = `${slot.TimeslotID}_${slotDate}`;
          
          setMyReservedSlots(prev => {
            const newSet = new Set(prev);
            newSet.delete(slotKey);
            return newSet;
          });
          
          handleSlotClick(slot);
        });
      }
    } catch (error) {
      console.error("Error checking reserved slots:", error);
    } finally {
      setCheckingReservations(false);
    }
  }, [weeklySchedule, myReservedSlots, handleSlotClick]);

  useEffect(() => {
    checkReservedSlots();
    
    const interval = setInterval(() => {
      checkReservedSlots();
    }, 5000);
    
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
    // ⭐️ ANTI-SPAM: Check nếu user bị ban
    if (isBanned) {
      const minutes = Math.floor(banTimeRemaining / 60);
      const seconds = banTimeRemaining % 60;
      setConflictAlert({
        severity: "error",
        message: `Bạn đã bị tạm khóa do spam. Vui lòng đợi ${minutes}:${seconds.toString().padStart(2, '0')}`
      });
      return;
    }

    const slotDate = normalizeDate(slot.Date);
    const slotKey = `${slot.TimeslotID}_${slotDate}`;
    
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

    // ⭐️ ANTI-SPAM: Check spam behavior TRƯỚC KHI reserve
    if (checkSpamBehavior(slotKey)) {
      return; // Đã spam, không cho tiếp tục
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

    try {
      const reserveResult = await slotReservationApi.reserveSlot(slot.TimeslotID, slotDate);
      
      if (reserveResult.success) {
        // ⭐️ ANTI-SPAM: Record reserve action
        recordReserveAction(slotKey);
        
        setReservedSlots(prev => new Set([...prev, slotKey]));
        setMyReservedSlots(prev => new Set([...prev, slotKey]));
        handleSlotClick(slot);
        
        // Hiển thị warning nếu gần đến giới hạn
        const recentCount = (slotReserveHistory[slotKey] || []).length + 1;
        if (recentCount >= 3) {
          setConflictAlert({
            severity: "warning",
            message: `Cảnh báo: Bạn đã giữ slot này ${recentCount} lần. Nếu giữ quá 5 lần trong 5 phút, bạn sẽ bị khóa 10 phút.`
          });
        }
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

  useEffect(() => {
    return () => {
      if (selectedSlots.length > 0) {
        slotReservationApi.releaseAllSlots().catch(console.error);
      }
    };
  }, []);

  const timeSlots = useMemo(() => {
    if (!weeklySchedule || weeklySchedule.length === 0) {
      return ["08:00", "10:20", "13:00", "15:20", "18:00", "20:00"];
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

      {/* ⭐️ ANTI-SPAM: Hiển thị thông báo ban */}
      {isBanned && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Bạn đã bị tạm khóa do spam. Thời gian còn lại: {Math.floor(banTimeRemaining / 60)}:{(banTimeRemaining % 60).toString().padStart(2, '0')}
        </Alert>
      )}

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
              "18:00": "20:00",
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

                  const isReservedByOthers = reservedSlots.has(slotKey) && !myReservedSlots.has(slotKey);

                  const currentWeekKey = getWeekKey(slotDate);
                  const slotsInSameWeek = selectedSlots.filter((s) => {
                    const sWeekKey = getWeekKey(normalizeDate(s.Date));
                    return sWeekKey === currentWeekKey;
                  });
                  const hasReachedMaxSlotsInWeek =
                    slotsInSameWeek.length >= 3 && !isSelected;

                  const isDisabled =
                    isBanned || // ⭐️ Disable khi bị ban
                    !selectedCourseId ||
                    !courseInfo ||
                    hasReachedMaxSlotsInWeek ||
                    isReservedByOthers ||
                    slot.Status !== "available" ||
                    checkingConflict ||
                    (selectedSlots.length >= 3 && !isSelected);
                  
                  let bgColor = slot.Status === "available" ? "#4caf50" : "#ffffff";
                  if (isReservedByOthers || slot.Status === "busy") {
                    bgColor = "#ffffff";
                  }
                  
                  const color = (slot.Status === "busy" || isReservedByOthers) ? "#000" : "#000";

                  return (
                    <Grid item xs={10 / 7} key={`${day}_${time}`}>
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