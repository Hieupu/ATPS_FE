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
  Divider,
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
import { checkEnrollmentStatusApi} from "../../../apiServices/courseService";
import { useAuth } from "../../../contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

const ClassCard = ({ classItem, onEnroll }) => {
  const [enrollDialog, setEnrollDialog] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoInfo, setPromoInfo] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);

  const { user, isLearner } = useAuth();
  const navigate = useNavigate(); // Thêm hook navigate

  // Hàm kiểm tra trạng thái đăng ký
  const checkEnrollmentStatus = async () => {
    if (!user || !isLearner) return false;
    
    try {
      setCheckingEnrollment(true);
      const response = await checkEnrollmentStatusApi(classItem.ClassID);
      console.log("haha" , response)
      setIsEnrolled(response.isEnrolled);
      return response.isEnrolled;
    } catch (error) {
      console.error("Error checking enrollment:", error);
      return false;
    } finally {
      setCheckingEnrollment(false);
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

    console.log("ClassItem data:", classItem);

  // Xử lý khi nhấn nút đăng ký
  const handleEnrollClick = async () => {
    if (!user) {
      window.location.href = "/auth/login";
      return;
    }
    
    if (!isLearner) {
      // Có thể thêm thông báo hoặc xử lý khác nếu cần
      return;
    }

    // Kiểm tra xem đã đăng ký chưa
    const enrolled = await checkEnrollmentStatus();
    
    if (enrolled) {
      // Nếu đã đăng ký, chuyển hướng đến trang chi tiết khóa học
      navigate(`/my-courses/${classItem.CourseID}`);
      return;
    }

    // Nếu chưa đăng ký, mở dialog đăng ký
    setEnrollDialog(true);
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

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      setEnrollError(null);

      const { paymentUrl } = await createPaymentLinkApi(
        classItem.ClassID,
        promoInfo?.code || promoCode || undefined
      );
      window.location.href = paymentUrl;
    } catch (error) {
      console.error("Payment error:", error);
      setEnrollError(error.message || "Failed to start payment.");
    } finally {
      setEnrolling(false);
    }
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
                    label={session.Day} 
                    size="small" 
                    variant="outlined"
                    sx={{ mr: 1, minWidth: 60 }}
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
        onClose={() => !enrolling && setEnrollDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Đăng ký lớp {classItem.ClassName}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {enrollError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {enrollError}
            </Alert>
          )}

          {/* Price Summary */}
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

          {/* Promotion Code */}
          <TextField
            fullWidth
            label="Mã giảm giá"
            placeholder="Nhập mã giảm giá (nếu có)"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocalOffer color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button size="small" onClick={handleApplyPromo}>
                    Áp dụng
                  </Button>
                </InputAdornment>
              ),
            }}
          />

          {/* Class Schedule */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Lịch học:
            </Typography>
            {classItem.weeklySchedule?.map((session, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Chip 
                  label={session.Day} 
                  size="small" 
                  sx={{ mr: 1, minWidth: 60 }}
                />
                <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {session.StartTime} - {session.EndTime}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEnrollDialog(false)}
            disabled={enrolling}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleEnroll}
            disabled={enrolling}
            startIcon={enrolling ? <CircularProgress size={16} /> : <Payment />}
            sx={{ minWidth: 140 }}
          >
            {enrolling ? 'Đang xử lý...' : 'Thanh toán'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

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