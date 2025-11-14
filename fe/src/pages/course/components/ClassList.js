import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Schedule,
  People,
  VideoCall,
  Payment,
  LocalOffer,
  CalendarToday,
  AccessTime,
} from '@mui/icons-material';
import { createPaymentLinkApi, checkPromotionCodeApi } from "../../../apiServices/paymentService";
import { checkEnrollmentStatusApi } from "../../../apiServices/courseService";
import { checkScheduleConflictApi } from "../../../apiServices/scheduleService";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const ClassCard = ({ classItem, onEnroll }) => {
  const [enrollDialog, setEnrollDialog] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoInfo, setPromoInfo] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);
  const [scheduleConflict, setScheduleConflict] = useState(null);
  const [checkingConflict, setCheckingConflict] = useState(false);

  const { user, isLearner } = useAuth();

  console.log("classItem" , classItem)
  const navigate = useNavigate();

  // Hàm kiểm tra trạng thái đăng ký
  const checkEnrollmentStatus = async () => {
    if (!user || !isLearner) return false;
    
    try {
      setCheckingEnrollment(true);
      const response = await checkEnrollmentStatusApi(classItem.ClassID);
      setIsEnrolled(response.isEnrolled);
      return response.isEnrolled;
    } catch (error) {
      console.error("Error checking enrollment:", error);
      return false;
    } finally {
      setCheckingEnrollment(false);
    }
  };

  // Hàm kiểm tra trùng lịch - ĐÃ SỬA
  const checkScheduleConflict = async () => {
    try {
      setCheckingConflict(true);
      setEnrollError(null);
      const conflictCheck = await checkScheduleConflictApi(classItem.ClassID);
      console.log("conflictCheck", conflictCheck);
      
      if (conflictCheck.hasConflict) {
        setScheduleConflict(conflictCheck.conflictingClasses);
        return true;
      }
      setScheduleConflict(null);
      return false;
    } catch (error) {
      console.error("Error checking schedule conflict:", error);
      setEnrollError("Không thể kiểm tra lịch học. Vui lòng thử lại.");
      return false;
    } finally {
      setCheckingConflict(false);
    }
  };

  // Format price function
  const formatPrice = (price) => {
    if (price == null || isNaN(price)) return "Liên hệ";
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Xử lý khi nhấn nút đăng ký - ĐÃ SỬA
  const handleEnrollClick = async () => {
    if (!user) {
      window.location.href = "/auth/login";
      return;
    }
    
    if (!isLearner) {
      setEnrollError("Chỉ học viên mới có thể đăng ký lớp học");
      return;
    }

    // Kiểm tra xem đã đăng ký chưa
    const enrolled = await checkEnrollmentStatus();
    
    if (enrolled) {
      navigate(`/my-courses/${classItem.CourseID}`);
      return;
    }

    // Mở dialog và kiểm tra trùng lịch ngay
    setEnrollDialog(true);
    await checkScheduleConflict(); // Kiểm tra ngay khi mở dialog
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoInfo(null);
      return;
    }
    try {
      const res = await checkPromotionCodeApi(promoCode.trim());
      if (res?.valid) {
        setPromoInfo({ code: res.code, discountPercent: res.discountPercent });
        setEnrollError(null);
      } else {
        setPromoInfo(null);
        setEnrollError(res?.message || "Mã giảm giá không hợp lệ");
      }
    } catch (e) {
      setPromoInfo(null);
      setEnrollError(e?.message || "Không áp dụng được mã giảm giá");
    }
  };

  // Hàm enroll - ĐÃ SỬA
  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      setEnrollError(null);

      // Kiểm tra lại trùng lịch trước khi thanh toán
      const hasConflict = await checkScheduleConflict();
      if (hasConflict) {
        setEnrolling(false);
        return;
      }

      // Nếu không trùng, tiếp tục thanh toán
      const { paymentUrl } = await createPaymentLinkApi(
        classItem.ClassID,
        promoInfo?.code || promoCode || undefined
      );
      window.location.href = paymentUrl;
    } catch (error) {
      console.error("Payment error:", error);
      setEnrollError(error.message || "Không thể tạo liên kết thanh toán.");
    } finally {
      setEnrolling(false);
    }
  };

  // Reset state khi đóng dialog
  const handleCloseDialog = () => {
    if (!enrolling) {
      setEnrollDialog(false);
      setScheduleConflict(null);
      setEnrollError(null);
      setPromoCode('');
      setPromoInfo(null);
    }
  };

  const formatDateWithDay = (dateString) => {
  const date = new Date(dateString);
  const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

  const dayName = days[date.getDay()];
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${dayName}, ${day}/${month}/${year}`;
};

  return (
    <>
      <Card sx={{ height: '100%', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
        <CardContent sx={{ p: 3 }}>
          {/* Class Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
              {classItem.ClassName}
            </Typography>
            <Chip 
              label={formatPrice(classItem.Fee)} 
              color="primary" 
              variant="filled"
              sx={{ fontWeight: 600, fontSize: '1rem' }}
            />
          </Box>

          {/* Instructor */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Giảng viên: <strong>{classItem.InstructorName}</strong>
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
  Lịch khai giảng: <strong>{formatDateWithDay(classItem.Opendate)}</strong>
</Typography>


          {/* Schedule */}
          {classItem.weeklySchedule && classItem.weeklySchedule.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center' }}>
                <CalendarToday sx={{ fontSize: 16, mr: 1 }} />
                Lịch học hàng tuần:
              </Typography>
              {classItem.weeklySchedule.map((session, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
               <Chip 
  label={{
    Monday: "Thứ Hai",
    Tuesday: "Thứ Ba",
    Wednesday: "Thứ Tư",
    Thursday: "Thứ Năm",
    Friday: "Thứ Sáu",
    Saturday: "Thứ Bảy",
    Sunday: "Chủ Nhật"
  }[session.Day]}
  size="small"
  variant="outlined"
  sx={{ mr: 1, minWidth: 80 }}
/>

                  <Typography variant="body2">
                    {session.StartTime} - {session.EndTime}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* Class Info */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip
              icon={<People />}
              label={`${classItem.StudentCount || 0} học viên`}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<Schedule />}
              label={`${classItem.TotalSessions || 0} buổi`}
              size="small"
              variant="outlined"
            />
            {classItem.ZoomURL && (
              <Chip
                icon={<VideoCall />}
                label="Zoom"
                size="small"
                color="primary"
              />
            )}
          </Box>

          {/* Start Date */}
          {classItem.startDate && (
            <Box sx={{ mb: 2, p: 1, bgcolor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ color: 'primary.dark', fontWeight: 600 }}>
                🎉 Khai giảng: {new Date(classItem.startDate).toLocaleDateString('vi-VN')}
              </Typography>
            </Box>
          )}

          {/* Nút đăng ký */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleEnrollClick}
            disabled={checkingEnrollment}
            startIcon={checkingEnrollment ? <CircularProgress size={16} /> : <Payment />}
            sx={{ fontWeight: 600 }}
          >
            {checkingEnrollment ? 'Đang kiểm tra...' : (isEnrolled ? 'Vào học' : 'Đăng ký ngay')}
          </Button>
        </CardContent>
      </Card>

      {/* Enrollment Dialog */}
      <Dialog
        open={enrollDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Đăng ký lớp {classItem.ClassName}
          </Typography>
          {checkingConflict && (
            <Typography variant="caption" color="text.secondary">
              Đang kiểm tra lịch học...
            </Typography>
          )}
        </DialogTitle>
        
        <DialogContent>
          {/* Hiển thị thông báo trùng lịch */}
          {scheduleConflict && scheduleConflict.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
      ⚠️ Lịch học bị trùng!
    </Typography>

    {(() => {
      const conflict = scheduleConflict[0]; // Chỉ lấy 1 lớp trùng
      return (
        <Typography variant="body2" sx={{ mb: 1 }}>
          Lớp này trùng với:{" "}
          <strong>{conflict.ClassName}</strong> – {conflict.Schedule}
        </Typography>
      );
    })()}

    <Typography variant="body2" sx={{ fontWeight: 600, color: "warning.dark" }}>
      Vui lòng chọn lớp khác.
    </Typography>
  </Alert>
          )}

          {/* Hiển thị lỗi khác */}
          {enrollError && !scheduleConflict && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {enrollError}
            </Alert>
          )}

          {/* Price Summary - Ẩn khi có trùng lịch */}
          {(!scheduleConflict || scheduleConflict.length === 0) && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Học phí:
              </Typography>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                {formatPrice(classItem.Fee)}
              </Typography>
              {promoInfo && (
                <Typography variant="body2" color="success.main">
                  Đã áp dụng giảm {promoInfo.discountPercent}%
                </Typography>
              )}
            </Box>
          )}

          {/* Promotion Code - Ẩn khi có trùng lịch */}
          {(!scheduleConflict || scheduleConflict.length === 0) && (
            <TextField
              fullWidth
              label="Mã giảm giá"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocalOffer />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button 
                      size="small" 
                      onClick={handleApplyPromo}
                      disabled={!promoCode.trim()}
                    >
                      Áp dụng
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          )}

        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            disabled={enrolling}
          >
            {scheduleConflict ? 'Đã hiểu' : 'Hủy'}
          </Button>
          
          <Button
            variant="contained"
            onClick={handleEnroll}
            disabled={enrolling || checkingConflict || (scheduleConflict && scheduleConflict.length > 0)}
            startIcon={enrolling ? <CircularProgress size={16} /> : <Payment />}
          >
            {enrolling ? 'Đang xử lý...' : 'Thanh toán'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// ClassList component giữ nguyên
const ClassList = ({ classes, loading, courseId, onEnrollmentChange }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (classes.length === 0) {
    return (
      <Alert severity="info">
        Hiện chưa có lớp học nào cho khóa học này.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Danh sách lớp học ({classes.length} lớp)
      </Typography>
      
      <Grid container spacing={3}>
        {classes.map((classItem) => (
          <Grid item xs={12} md={6} key={classItem.ClassID}>
            <ClassCard 
              classItem={classItem} 
              onEnroll={onEnrollmentChange}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ClassList;