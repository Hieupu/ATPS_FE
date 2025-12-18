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

  const getInstructorId = (slot) => {
    // Kiểm tra các trường có thể chứa instructorId
    return slot.InstructorID || slot.InstructorId || slot.instructorId || 
           slot.Instructor?.InstructorID || slot.teacherId || null;
  };

  const getSlotKey = (slot) => {
    const slotDate = normalizeDate(slot.Date);
    const instructorId = getInstructorId(slot);
    return `${instructorId}_${slot.TimeslotID}_${slotDate}`;
  };

  // ⭐️ FIX: Tách riêng slot key để check selected (không cần instructorId)
  const getSlotKeyForSelected = (slot) => {
    const slotDate = normalizeDate(slot.Date);
    return `${slot.TimeslotID}_${slotDate}`;
  };

  // ⭐️ ANTI-SPAM: Theo dõi lịch sử reserve của từng slot
  const [slotReserveHistory, setSlotReserveHistory] = useState(() => {
    const saved = localStorage.getItem('slotReserveHistory');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Cleanup ngay khi load
        const now = Date.now();
        const fifteenMinutes = 15 * 60 * 1000;
        const cleaned = {};
        Object.keys(data).forEach(key => {
          const history = data[key].filter(ts => now - ts < fifteenMinutes);
          if (history.length > 0) cleaned[key] = history;
        });
        return cleaned;
      } catch {
        return {};
      }
    }
    return {};
  });

  // ⭐️ FIX: Theo dõi tổng số clicks trong 1 phút - sửa lỗi state initialization
  const [clickHistory, setClickHistory] = useState([]);

  // ⭐️ ANTI-SPAM: Trạng thái bị khóa (banned)
  const [isBanned, setIsBanned] = useState(false);
  const [banEndTime, setBanEndTime] = useState(null);
  const [banTimeRemaining, setBanTimeRemaining] = useState(0);
  const [banReason, setBanReason] = useState('');

  // ⭐️ FIX: Thêm useEffect để load click history
  useEffect(() => {
    const saved = localStorage.getItem('clickHistory');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const now = Date.now();
        // Chỉ giữ lại clicks trong 1 phút gần đây
        const filtered = data.filter(ts => now - ts < 60000);
        setClickHistory(filtered);
      } catch {
        setClickHistory([]);
      }
    }
  }, []);

  useEffect(() => {
    const checkBanStatus = () => {
      const banData = localStorage.getItem('slotReserveBan');
      if (banData) {
        try {
          const { endTime, reason } = JSON.parse(banData);
          const now = Date.now();
          
          if (now < endTime) {
            // ⭐️ THÊM: Giải phóng tất cả slot khi bị ban
            if (selectedSlots.length > 0) {
              slotReservationApi.releaseAllSlots().catch(console.error);
              // Xóa selected slots
              selectedSlots.forEach(slot => {
                const key = getSlotKey(slot);
                setMyReservedSlots(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(key);
                  return newSet;
                });
                handleSlotClick(slot); // Bỏ chọn slot
              });
            }
            
            setIsBanned(true);
            setBanEndTime(endTime);
            setBanTimeRemaining(Math.ceil((endTime - now) / 1000));
            setBanReason(reason || 'spam');
          } else {
            // Hết thời gian ban, xóa và reset
            localStorage.removeItem('slotReserveBan');
            setIsBanned(false);
            setBanEndTime(null);
            setBanReason('');
          }
        } catch {
          localStorage.removeItem('slotReserveBan');
        }
      }
    };

    checkBanStatus();
    
    const interval = setInterval(checkBanStatus, 1000);
    return () => clearInterval(interval);
  }, [selectedSlots, handleSlotClick]);

  // ⭐️ ANTI-SPAM: Cleanup history - tối ưu hơn
  useEffect(() => {
    const cleanupHistory = () => {
      const now = Date.now();
      const fifteenMinutes = 15 * 60 * 1000;
      const oneMinute = 60000;
      
      // Cleanup slot reserve history
      setSlotReserveHistory(prev => {
        let needUpdate = false;
        const cleaned = {};
        
        Object.keys(prev).forEach(key => {
          const history = prev[key].filter(ts => now - ts < fifteenMinutes);
          if (history.length > 0) {
            cleaned[key] = history;
            if (history.length !== prev[key].length) needUpdate = true;
          } else {
            needUpdate = true;
          }
        });
        
        if (needUpdate) {
          localStorage.setItem('slotReserveHistory', JSON.stringify(cleaned));
          return cleaned;
        }
        return prev;
      });

      // Cleanup click history
      setClickHistory(prev => {
        const cleaned = prev.filter(ts => now - ts < oneMinute);
        if (cleaned.length !== prev.length) {
          localStorage.setItem('clickHistory', JSON.stringify(cleaned));
          return cleaned;
        }
        return prev;
      });
    };

    // Cleanup ngay lập tức khi mount
    cleanupHistory();
    
    // Cleanup mỗi 10 giây
    const interval = setInterval(cleanupHistory, 10000);
    return () => clearInterval(interval);
  }, []);

  // ⭐️ ANTI-SPAM: Function để check spam behavior
  const checkSpamBehavior = useCallback((slotKey) => {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    const oneMinute = 60000;
    
    // CHECK 1: Kiểm tra tổng số clicks trong 1 phút (giới hạn 20)
    const recentClicks = clickHistory.filter(ts => now - ts < oneMinute);
    if (recentClicks.length >= 20) {
      const banUntil = now + (10 * 60 * 1000);
      const banData = {
        endTime: banUntil,
        reason: 'too_many_clicks'
      };
      localStorage.setItem('slotReserveBan', JSON.stringify(banData));
      
      setIsBanned(true);
      setBanEndTime(banUntil);
      setBanReason('too_many_clicks');
      
      setConflictAlert({
        severity: "error",
        message: `Bạn đã click quá nhiều (${recentClicks.length} lần trong 1 phút). Bạn bị tạm khóa 10 phút.`
      });
      
      return true;
    }
    
    // CHECK 2: Kiểm tra reserve cùng 1 slot nhiều lần (giới hạn 5 lần/5 phút)
    const recentSlotHistory = (slotReserveHistory[slotKey] || []).filter(
      ts => now - ts < fiveMinutes
    );
    
    if (recentSlotHistory.length >= 5) {
      const banUntil = now + (10 * 60 * 1000);
      const banData = {
        endTime: banUntil,
        reason: 'spam_reserve'
      };
      localStorage.setItem('slotReserveBan', JSON.stringify(banData));
      
      setIsBanned(true);
      setBanEndTime(banUntil);
      setBanReason('spam_reserve');
      
      setConflictAlert({
        severity: "error",
        message: `Bạn đã giữ slot này quá nhiều lần (${recentSlotHistory.length} lần trong 15 phút). Bạn bị tạm khóa 10 phút.`
      });
      
      return true;
    }
    
    return false;
  }, [clickHistory, slotReserveHistory]);

  // ⭐️ ANTI-SPAM: Record click và reserve action
  const recordClickAction = useCallback(() => {
    const now = Date.now();
    
    setClickHistory(prev => {
      const updated = [...prev, now];
      localStorage.setItem('clickHistory', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const recordReserveAction = useCallback((slotKey) => {
    const now = Date.now();
    
    setSlotReserveHistory(prev => {
      const updated = {
        ...prev,
        [slotKey]: [...(prev[slotKey] || []), now]
      };
      localStorage.setItem('slotReserveHistory', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const checkReservedSlots = useCallback(async () => {
    if (!weeklySchedule || weeklySchedule.length === 0) return;
    
    setCheckingReservations(true);
    try {
      const reserved = new Set();
      const expiredSlots = [];
      
      const checkPromises = weeklySchedule.map(async (slot) => {
        try {
          const slotDate = normalizeDate(slot.Date);
          const instructorId = getInstructorId(slot);
          
          if (!instructorId) {
            console.warn("No instructorId found for slot:", slot);
            return;
          }
          
          const result = await slotReservationApi.checkSlotStatus(
            slot.TimeslotID, 
            slotDate,
            instructorId
          );
          
          const key = getSlotKey(slot);
          
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
          const key = getSlotKey(slot);
          
          setMyReservedSlots(prev => {
            const newSet = new Set(prev);
            newSet.delete(key);
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
    // ⭐️ ANTI-SPAM: Record click ngay lập tức
    recordClickAction();

    // ⭐️ ANTI-SPAM: Check nếu user bị ban
    if (isBanned) {
      const minutes = Math.floor(banTimeRemaining / 60);
      const seconds = banTimeRemaining % 60;
      const reasonText = banReason === 'too_many_clicks' 
        ? 'click quá nhiều' 
        : 'spam giữ slot';
      setConflictAlert({
        severity: "error",
        message: `Bạn đã bị tạm khóa do ${reasonText}. Vui lòng đợi ${minutes}:${seconds.toString().padStart(2, '0')}`
      });
      return;
    }

    const slotDate = normalizeDate(slot.Date);
    const instructorId = getInstructorId(slot);
    const slotKey = getSlotKey(slot);
    const selectedKey = getSlotKeyForSelected(slot);
    
    if (reservedSlots.has(slotKey) && !myReservedSlots.has(slotKey)) {
      setConflictAlert({
        severity: "info",
        message: "Slot này đang được giữ bởi người dùng khác"
      });
      return;
    }

    if (slot.Status !== "available") return;

    // ⭐️ FIX: Sử dụng selectedKey để check (không có instructorId)
    const isSelected = selectedSlots.some(
      s => getSlotKeyForSelected(s) === selectedKey
    );

    // Nếu đang bỏ chọn slot
    if (isSelected) {
      try {
        if (!instructorId) {
          throw new Error("Không tìm thấy instructorId");
        }
        
        await slotReservationApi.releaseSlot(
          slot.TimeslotID, 
          slotDate,
          instructorId
        );
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
        setConflictAlert({
          severity: "error",
          message: "Lỗi khi hủy giữ chỗ: " + (error.message || "Không tìm thấy instructor")
        });
        return;
      }
      handleSlotClick(slot);
      return;
    }

    // ⭐️ ANTI-SPAM: Check spam behavior TRƯỚC KHI reserve
    if (checkSpamBehavior(slotKey)) {
      return; // Đã spam, không cho tiếp tục
    }

    if (selectedSlots.length >= 6) {
      setConflictAlert({
        severity: "warning",
        message: `Bạn chỉ được chọn tối đa 6 slot trong một tuần.`
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
      if (!instructorId) {
        throw new Error("Không tìm thấy instructorId");
      }
      
      const reserveResult = await slotReservationApi.reserveSlot(
        slot.TimeslotID, 
        slotDate,
        instructorId
      );
      
      if (reserveResult.success) {
        // ⭐️ ANTI-SPAM: Record reserve action
        recordReserveAction(slotKey);
        
        setReservedSlots(prev => new Set([...prev, slotKey]));
        setMyReservedSlots(prev => new Set([...prev, slotKey]));
        handleSlotClick(slot);
        
        // Hiển thị warning nếu gần đến giới hạn
        const now = Date.now();
        const recentSlotCount = (slotReserveHistory[slotKey] || [])
          .filter(ts => now - ts < 5 * 60 * 1000).length + 1;
        
        if (recentSlotCount >= 3) {
          setConflictAlert({
            severity: "warning",
            message: `Bạn đã giữ slot này ${recentSlotCount} lần trong 15 phút. Giới hạn: 5 lần.`
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
        message: "Lỗi khi giữ chỗ slot: " + (error.message || "Vui lòng thử lại.")
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

      {/* ⭐️ ANTI-SPAM: Hiển thị thông báo ban với thông tin chi tiết */}
      {isBanned && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>Tài khoản tạm thời bị khóa</strong>
          <br />
          Lý do: {banReason === 'too_many_clicks' ? 'Click quá nhanh' : 'Giữ slot quá nhiều lần (>5 lần/15 phút)'}
          <br />
          Thời gian còn lại: <strong>{Math.floor(banTimeRemaining / 60)}:{(banTimeRemaining % 60).toString().padStart(2, '0')}</strong>
        </Alert>
      )}

      {/* ⭐️ FIX: Hiển thị cảnh báo khi gần đạt giới hạn */}
      {!isBanned && clickHistory.length > 15 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Bạn đã click {clickHistory.filter(ts => Date.now() - ts < 60000).length}/20 lần trong phút này. Hãy chậm lại!
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

                  const slotKey = getSlotKey(slot);
                  const selectedKey = getSlotKeyForSelected(slot);
                  
                  // ⭐️ FIX: Sử dụng selectedKey để check (không có instructorId)
                  const isSelected = selectedSlots.some(
                    s => getSlotKeyForSelected(s) === selectedKey
                  );

                  const isReservedByOthers = reservedSlots.has(slotKey) && !myReservedSlots.has(slotKey);

                  const currentWeekKey = getWeekKey(normalizeDate(slot.Date));
                  const slotsInSameWeek = selectedSlots.filter((s) => {
                    const sWeekKey = getWeekKey(normalizeDate(s.Date));
                    return sWeekKey === currentWeekKey;
                  });
                  const hasReachedMaxSlotsInWeek =
                    slotsInSameWeek.length >= 6 && !isSelected;

                  const isDisabled =
                    isBanned ||
                    !selectedCourseId ||
                    !courseInfo ||
                    hasReachedMaxSlotsInWeek ||
                    isReservedByOthers ||
                    slot.Status !== "available" ||
                    checkingConflict ||
                    (selectedSlots.length >= 6 && !isSelected);
                  
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