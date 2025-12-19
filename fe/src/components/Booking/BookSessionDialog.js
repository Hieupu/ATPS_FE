import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Paper,
} from "@mui/material";
import { Event } from "@mui/icons-material";
import {
  getInstructorWeeklyScheduleApi,
  createOneOnOneBookingApi,
  getInstructorTimeslotsFromTodayApi 
} from "../../apiServices/scheduleService";
import { checkPromotionCodeApi } from "../../apiServices/paymentService";
import { slotReservationApi } from "../../apiServices/slotReservationApi";
// Import các component con
import BookingInfoForm from "./BookingInfoForm";
import ScheduleGrid from "./ScheduleGrid";
import PriceSummary from "./PriceSummary";
import PromoCodeInput from "./PromoCodeInput";

const BookSessionDialog = ({
  open,
  onClose,
  instructor,
  learnerId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState(null);
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplying, setPromoApplying] = useState(false);
  const [promoInfo, setPromoInfo] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [courseInfo, setCourseInfo] = useState(null);
  const [cachedSlotDuration, setCachedSlotDuration] = useState(null);
  const [allTimeslots, setAllTimeslots] = useState([]);
  const [checkingFutureSlots, setCheckingFutureSlots] = useState(false);

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Reset state khi đóng dialog
  useEffect(() => {
    if (!open) {
      setSelectedSlots([]);
      setSelectedCourseId("");
      setSelectedWeek("");
      setWeeklySchedule([]);
      setCachedSlotDuration(null);
      setPromoCode("");
      setPromoInfo(null);
      setError(null);
      setSuccessMessage(null);
    }
  }, [open]);

  // Tính số tuần có thể chọn (4 tuần sau kể từ hôm nay)
  useEffect(() => {
    if (open) {
      const weeks = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Bắt đầu từ tuần tiếp theo (không tính tuần hiện tại)
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + (7 - today.getDay() + 1) % 7 || 7);

      // Helper function để format date sang YYYY-MM-DD (local timezone)
      const formatLocalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      for (let i = 0; i < 4; i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + i * 7);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        weeks.push({
          value: formatLocalDate(weekStart), // ✅ Dùng local date
          label: `(${weekStart.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          })} - ${weekEnd.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          })})`,
          startDate: formatLocalDate(weekStart), // ✅ Dùng local date
        });
      }
      setAvailableWeeks(weeks);
      if (weeks.length > 0) {
        setSelectedWeek(weeks[0].value);
      }
    }
  }, [open]);

  const fetchAllTimeslots = async () => {
    const instructorId = instructor?.id || instructor?.InstructorID;
    
    if (!instructorId) return;

    try {
      setLoading(true);
      const response = await getInstructorTimeslotsFromTodayApi(instructorId);
      console.log("getInstructorTimeslotsFromTodayApi" , response)
      
      if (response.success) {
        setAllTimeslots(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching all timeslots:', error);
      // Không set error vì đây là optional data
    } finally {
      setLoading(false);
    }
  };

  // Load lịch học khi chọn tuần
  useEffect(() => {
    const fetchSchedule = async () => {
      const instructorId = instructor?.id || instructor?.InstructorID;
      
      console.log('=== FETCH SCHEDULE DEBUG ===');
      console.log('open:', open);
      console.log('instructor:', instructor);
      console.log('instructorId:', instructorId);
      console.log('selectedWeek:', selectedWeek);
      
      if (!open || !instructorId || !selectedWeek) {
        console.log('❌ Missing required data - skip fetch');
        return;
      }

      try {
        console.log('🔄 Starting to fetch schedule...');
        setLoading(true);
        setError(null);
        
        const data = await getInstructorWeeklyScheduleApi(
          instructorId,
          selectedWeek
        );
        
        console.log('✅ Schedule data received:', data);
        
        setWeeklySchedule(data.schedule || []);
        setSelectedSlots([]);
        
      } catch (e) {
        console.error('❌ Error fetching schedule:', e);
        setError(e.message || "Không thể tải lịch học");
      } finally {
        console.log('🏁 Fetch completed, setting loading to false');
        setLoading(false);
      }
    };
    
    fetchSchedule();
  }, [open, instructor?.id, instructor?.InstructorID, selectedWeek]);

  // Tính toán số buổi học và giá khi chọn khóa học
  useEffect(() => {
    if (selectedCourseId && instructor?.Courses) {
      const course = instructor.Courses.find(
        (c) => c.CourseID === parseInt(selectedCourseId)
      );
      if (course) {
        setCourseInfo(course);
      }
    } else {
      setCourseInfo(null);
    }
    setSelectedSlots([]);
  }, [selectedCourseId, instructor?.Courses]);

  // Cache slot duration từ weeklySchedule
  useEffect(() => {
    if (weeklySchedule.length > 0 && !cachedSlotDuration) {
      const firstAvailableSlot = weeklySchedule.find(
        (s) => s.Status === "available"
      );
      if (firstAvailableSlot) {
        const startTimeStr = firstAvailableSlot.StartTime || "00:00:00";
        const endTimeStr = firstAvailableSlot.EndTime || "00:00:00";
        const slotStartParts = startTimeStr.split(":").map(Number);
        const slotEndParts = endTimeStr.split(":").map(Number);
        const slotStartMinutes =
          (slotStartParts[0] || 0) * 60 + (slotStartParts[1] || 0);
        const slotEndMinutes =
          (slotEndParts[0] || 0) * 60 + (slotEndParts[1] || 0);
        const slotDurationMinutes = slotEndMinutes - slotStartMinutes;

        if (slotDurationMinutes > 0) {
          setCachedSlotDuration(slotDurationMinutes);
        }
      }
    }
  }, [weeklySchedule, cachedSlotDuration]);

  const requiredNumberOfSessions = useMemo(() => {
    if (!courseInfo || !cachedSlotDuration || cachedSlotDuration <= 0) {
      return 0;
    }

    let courseDuration = courseInfo.Duration || 0;
    if (courseDuration <= 0) return 0;

    const courseDurationInMinutes = courseDuration * 60;
    return Math.ceil(courseDurationInMinutes / cachedSlotDuration);
  }, [courseInfo, cachedSlotDuration]);

  const calculatePrice = useMemo(() => {
    if (
      !courseInfo ||
      !instructor?.InstructorFee ||
      requiredNumberOfSessions === 0
    ) {
      return { numberOfSessions: 0, totalPrice: 0 };
    }

    const numberOfSessions = requiredNumberOfSessions;
    const totalPrice = instructor.InstructorFee * numberOfSessions;

    return { numberOfSessions, totalPrice };
  }, [courseInfo, instructor?.InstructorFee, requiredNumberOfSessions]);

  const finalPrice = useMemo(() => {
    if (!promoInfo || !calculatePrice.totalPrice) {
      return calculatePrice.totalPrice;
    }
    return Math.round(
      calculatePrice.totalPrice * (1 - promoInfo.discountPercent / 100)
    );
  }, [calculatePrice.totalPrice, promoInfo]);

  // Xử lý chọn slot
  const handleSlotClick = (slot) => {
    console.log('Original slot data:', slot);
    console.log('Original slot.Date:', slot.Date);
    console.log('Type of slot.Date:', typeof slot.Date);
    if (slot.Status !== "available") return;

    const normalizeDate = (date) => {
      if (!date) return "";
      
      let normalizedDate;
      if (typeof date === "string") {
        // Nếu là string, giữ nguyên và chỉ lấy phần date
        normalizedDate = date.split("T")[0];
      } else if (date instanceof Date) {
        // Sử dụng UTC để tránh timezone issues
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        normalizedDate = `${year}-${month}-${day}`;
      } else {
        normalizedDate = String(date);
      }
      
      return normalizedDate;
    };

    const slotDate = normalizeDate(slot.Date);

    setSelectedSlots((prevSlots) => {
      const isSelected = prevSlots.some(
        (s) =>
          s.TimeslotID === slot.TimeslotID && normalizeDate(s.Date) === slotDate
      );

      if (isSelected) {
        setError(null);
        return prevSlots.filter(
          (s) =>
            !(
              s.TimeslotID === slot.TimeslotID &&
              normalizeDate(s.Date) === slotDate
            )
        );
      }

      if (!selectedCourseId || !courseInfo) {
        setError("Vui lòng chọn khóa học trước khi chọn slot");
        return prevSlots;
      }

      if (prevSlots.length >= requiredNumberOfSessions) {
        setError(
          `Bạn đã chọn đủ ${requiredNumberOfSessions} slot. Không thể chọn thêm.`
        );
        return prevSlots;
      }

      const slotsInWeek = prevSlots.filter(
        (s) => normalizeDate(s.Date) === slotDate
      );
      if (slotsInWeek.length >= 3) {
        setError("Bạn chỉ được chọn tối đa 3 slot trong một tuần");
        return prevSlots;
      }

      setError(null);
      return [...prevSlots, { TimeslotID: slot.TimeslotID, Date: slotDate }];
    });
  };

  // Áp dụng mã giảm giá
  const handleApplyPromo = async () => {
    if (!promoCode || !promoCode.trim()) {
      setPromoInfo(null);
      return;
    }
    try {
      setPromoApplying(true);
      const res = await checkPromotionCodeApi(promoCode.trim());
      if (res?.valid) {
        setPromoInfo({ code: res.code, discountPercent: res.discountPercent });
        setError(null);
      } else {
        setPromoInfo(null);
        setError(res?.message || "Mã giảm giá không hợp lệ");
      }
    } catch (e) {
      setPromoInfo(null);
      setError(e?.message || "Không áp dụng được mã giảm giá");
    } finally {
      setPromoApplying(false);
    }
  };

// ⭐️ SỬA LẠI: Function check future slots availability
const checkAllSelectedSlotsFutureAvailability = async () => {
  try {
    console.log("🔍 Bắt đầu kiểm tra lịch tương lai...");
    console.log("selectedSlots:", selectedSlots);
    console.log("allTimeslots count:", allTimeslots?.length);
    console.log("requiredNumberOfSessions:", requiredNumberOfSessions);
    
    if (!allTimeslots || allTimeslots.length === 0) {
      console.warn("Không có dữ liệu lịch học tương lai");
      return true; // Không có data thì cho phép booking
    }

    const normalizeDate = (date) => {
      if (!date) return "";
      
      // Nếu là string, chỉ lấy phần date
      if (typeof date === "string") {
        return date.split("T")[0];
      }
      
      // Nếu là Date object
      if (date instanceof Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      
      return String(date);
    };

    // Lấy thông tin chi tiết của các slot đã chọn
    const slotDetails = selectedSlots.map(slotItem => {
      const slotInSchedule = weeklySchedule.find(s => 
        s.TimeslotID === slotItem.TimeslotID && 
        normalizeDate(s.Date) === slotItem.Date
      );
      
      if (!slotInSchedule) return null;
      
      // Tạo date object để lấy thứ trong tuần
      const date = new Date(slotItem.Date + "T00:00:00");
      const dayOfWeek = date.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ...
      
      return {
        TimeslotID: slotItem.TimeslotID,
        Date: slotItem.Date,
        Day: dayOfWeek === 0 ? 7 : dayOfWeek, // Chuyển sang 1-7 (Thứ 2 = 1, ..., Chủ nhật = 7)
        StartTime: slotInSchedule.StartTime?.substring(0, 5) || "",
        EndTime: slotInSchedule.EndTime?.substring(0, 5) || "",
        rawData: slotInSchedule // Lưu cả data gốc để debug
      };
    }).filter(Boolean);

    console.log("slotDetails:", slotDetails);

    if (slotDetails.length === 0) {
      console.log("Không có slot details");
      return true;
    }

    // TÍNH TOÁN: Cần bao nhiêu buổi trong tương lai
    const slotsAlreadySelected = slotDetails.length;
    const slotsNeededInFuture = requiredNumberOfSessions - slotsAlreadySelected;
    
    console.log(`Đã chọn: ${slotsAlreadySelected}, Cần thêm: ${slotsNeededInFuture} buổi`);

    if (slotsNeededInFuture <= 0) {
      console.log("Đã chọn đủ số buổi, không cần check tương lai");
      return true;
    }

    // Xác định pattern của các slot đã chọn
    // Giả sử các slot đã chọn tạo thành một pattern (ví dụ: Thứ 2, 9:00)
    const slotPatterns = slotDetails.map(slot => ({
      TimeslotID: slot.TimeslotID,
      Day: slot.Day, // Thứ trong tuần (1-7)
      StartTime: slot.StartTime,
      EndTime: slot.EndTime
    }));

    console.log("slotPatterns:", slotPatterns);

    // Lấy ngày của slot đầu tiên đã chọn
    const firstSelectedDate = new Date(slotDetails[0].Date + "T00:00:00");
    console.log("Ngày đầu tiên đã chọn:", firstSelectedDate.toISOString().split('T')[0]);

    // Tìm các slot tương lai (sau ngày đầu tiên đã chọn)
    const futureTimeslots = allTimeslots.filter(slot => {
      const slotDate = new Date(slot.Date + "T00:00:00");
      return slotDate > firstSelectedDate && 
             (slot.Status === "AVAILABLE" || slot.Status === "available");
    });

    console.log(`Có ${futureTimeslots.length} slot trống trong tương lai`);

    if (futureTimeslots.length === 0) {
      console.log("Không có slot nào trống trong tương lai");
      return false;
    }

    // Nhóm các slot tương lai theo tuần
    const weeksMap = new Map();
    
    futureTimeslots.forEach(slot => {
      const slotDate = new Date(slot.Date + "T00:00:00");
      // Tính số tuần so với ngày đầu tiên
      const diffTime = slotDate - firstSelectedDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const weekNumber = Math.floor(diffDays / 7);
      
      if (weekNumber >= 1) { // Chỉ xét các tuần sau tuần đầu tiên
        if (!weeksMap.has(weekNumber)) {
          weeksMap.set(weekNumber, []);
        }
        
        // Lấy thứ trong tuần (1-7)
        const dayOfWeek = slotDate.getDay();
        const day = dayOfWeek === 0 ? 7 : dayOfWeek;
        
        weeksMap.get(weekNumber).push({
          ...slot,
          Day: day,
          StartTime: slot.StartTime?.substring(0, 5) || "",
          EndTime: slot.EndTime?.substring(0, 5) || ""
        });
      }
    });

    console.log("Số tuần có slot trống:", weeksMap.size);

    // Kiểm tra từng pattern slot
    const successfulWeeks = [];
    
    // Duyệt qua các tuần theo thứ tự
    const sortedWeeks = Array.from(weeksMap.keys()).sort((a, b) => a - b);
    
    for (const weekNumber of sortedWeeks) {
      const weekSlots = weeksMap.get(weekNumber);
      console.log(`\nTuần ${weekNumber}: có ${weekSlots.length} slot`);
      
      // Kiểm tra xem tất cả patterns có tồn tại trong tuần này không
      const allPatternsMatch = slotPatterns.every(pattern => {
        const foundSlot = weekSlots.find(slot => 
          slot.TimeslotID === pattern.TimeslotID &&
          slot.Day === pattern.Day &&
          slot.StartTime === pattern.StartTime
        );
        
        console.log(`Pattern ${pattern.TimeslotID} - Thứ ${pattern.Day} ${pattern.StartTime}: ${foundSlot ? 'CÓ' : 'KHÔNG'}`);
        return !!foundSlot;
      });
      
      if (allPatternsMatch) {
        successfulWeeks.push(weekNumber);
        console.log(`✅ Tuần ${weekNumber}: ĐỦ tất cả slots`);
        
        // Nếu đã đủ số tuần cần thiết
        if (successfulWeeks.length >= slotsNeededInFuture) {
          console.log(`🎉 ĐÃ TÌM ĐỦ ${slotsNeededInFuture} tuần trong tương lai`);
          return true;
        }
      }
    }
    
    console.log(`❌ Chỉ tìm được ${successfulWeeks.length} tuần, cần ${slotsNeededInFuture} tuần`);
    return false;
    
  } catch (error) {
    console.error("Error checking future slots:", error);
    return true; // Nếu có lỗi, cho phép booking để không block user
  }
};

  // ⭐️ CHỈNH SỬA: Đăng ký - Thêm check future slots ở đây
  const handleBook = async () => {
    if (selectedSlots.length === 0) {
      setError("Vui lòng chọn ít nhất một slot để đăng ký");
      return;
    }
    if (!selectedCourseId) {
      setError("Vui lòng chọn khóa học");
      return;
    }
    if (!selectedWeek) {
      setError("Vui lòng chọn tuần bắt đầu học");
      return;
    }

    // ⭐️ THÊM: Check future slots trước khi submit
    if (requiredNumberOfSessions > 1) {
      setCheckingFutureSlots(true);
      try {
        const hasEnoughFutureSlots = await checkAllSelectedSlotsFutureAvailability();
        
        if (!hasEnoughFutureSlots) {
          setError("Không đủ lịch trống trong tương lai.\n💡 Gợi ý: Thử chọn slot khác hoặc thời gian khác.");
          setCheckingFutureSlots(false);
          return;
        }
      } catch (error) {
        console.error("Error checking future slots:", error);
        setError("Không thể kiểm tra lịch học tương lai. Vui lòng thử lại.");
        setCheckingFutureSlots(false);
        return;
      } finally {
        setCheckingFutureSlots(false);
      }
    }

    try {
      setBooking(true);
      setError(null);
      const instructorId = instructor?.id || instructor?.InstructorID;

      const bookingRes = await createOneOnOneBookingApi({
        InstructorID: instructorId,
        CourseID: selectedCourseId,
        TimeslotIDs: selectedSlots.map((s) => s.TimeslotID),
        SelectedSlots: selectedSlots,
        bookingDate: selectedWeek,
      });

      const newClassId = bookingRes?.classId;
      if (!newClassId) {
        throw new Error("Không tạo được lớp học");
      }

      const paymentUrl = bookingRes?.paymentUrl;

      if (paymentUrl) {
        setSuccessMessage(
          `Đăng ký thành công! Đang chuyển đến trang thanh toán...\nMã đơn hàng: ${
            bookingRes?.orderCode || "N/A"
          }\nSau khi thanh toán thành công, bạn sẽ có lịch học ngay.`
        );

        setTimeout(() => {
          if (onSuccess) {
            onSuccess(bookingRes);
          }
          handleClose();
          window.location.href = paymentUrl;
        }, 1000);
      } else {
        setSuccessMessage(
          "Đăng ký thành công! Tuy nhiên, không thể tạo link thanh toán. Vui lòng liên hệ hỗ trợ."
        );

        setTimeout(() => {
          if (onSuccess) {
            onSuccess(bookingRes);
          }
          handleClose();
        }, 3000);
      }
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        err?.error ||
        err?.details ||
        (typeof err === "string" ? err : "Không thể đặt lịch");
      setError(serverMsg);
    } finally {
      setBooking(false);
    }
  };

  useEffect(() => {
    if (open && instructor) {
      fetchAllTimeslots();
    }
  }, [open, instructor]);

  const handleClose = async () => {
    // ⭐️ THÊM: Release tất cả slots đang giữ trước khi đóng
    if (selectedSlots.length > 0) {
      try {
        await slotReservationApi.releaseAllSlots();
      } catch (error) {
        console.error("Error releasing slots on close:", error);
      }
    }
    
    setError(null);
    setSuccessMessage(null);
    setWeeklySchedule([]);
    setSelectedSlots([]);
    setSelectedCourseId("");
    setSelectedWeek("");
    setPromoCode("");
    setPromoInfo(null);
    setCourseInfo(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Event color="primary" />
          <Typography variant="h6">
            Đặt lịch học 1-1 với {instructor?.FullName}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: "16px !important" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-line' }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography component="div" sx={{ whiteSpace: "pre-line" }}>
              {successMessage}
            </Typography>
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Form bên trái - Thông tin đăng ký */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Thông tin đăng ký
              </Typography>

              <BookingInfoForm
                instructor={instructor}
                selectedCourseId={selectedCourseId}
                setSelectedCourseId={setSelectedCourseId}
                selectedWeek={selectedWeek}
                setSelectedWeek={setSelectedWeek}
                availableWeeks={availableWeeks}
                courseInfo={courseInfo}
              />

              <PromoCodeInput
                promoCode={promoCode}
                setPromoCode={setPromoCode}
                promoApplying={promoApplying}
                handleApplyPromo={handleApplyPromo}
                promoInfo={promoInfo}
              />

              <PriceSummary
                finalPrice={finalPrice}
                formatCurrency={formatCurrency}
                courseInfo={courseInfo}
                instructor={instructor}
                selectedWeek={selectedWeek}
                availableWeeks={availableWeeks}
                requiredNumberOfSessions={requiredNumberOfSessions}
                selectedSlots={selectedSlots}
              />
            </Paper>
          </Grid>

          {/* Form bên phải - Lịch học */}
          <Grid item xs={12} md={7}>
            <ScheduleGrid
              loading={loading}
              weeklySchedule={weeklySchedule}
              selectedSlots={selectedSlots}
              handleSlotClick={handleSlotClick}
              selectedCourseId={selectedCourseId}
              courseInfo={courseInfo}
              requiredNumberOfSessions={requiredNumberOfSessions}
              allTimeslots={allTimeslots}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={booking || checkingFutureSlots}>
          Hủy
        </Button>
        <Button
          onClick={handleBook}
          variant="contained"
          disabled={booking || checkingFutureSlots || successMessage || selectedSlots.length === 0}
          startIcon={(booking || checkingFutureSlots) ? <CircularProgress size={20} /> : null}
        >
          {checkingFutureSlots
            ? "Đang kiểm tra..."
            : booking
            ? "Đang đăng ký..."
            : successMessage
            ? "Đã đăng ký"
            : "Đặt lịch học"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookSessionDialog;