import React, { useState } from "react";
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
  Stack,
} from "@mui/material";
import {
  Schedule,
  People,
  VideoCall,
  Payment,
  LocalOffer,
  CalendarToday,
  AccessTime,
  PersonOutline,
  EventAvailable,
  ErrorOutline,
} from "@mui/icons-material";
import {
  createPaymentLinkApi,
  checkPromotionCodeApi,
} from "../../../apiServices/paymentService";
import { checkEnrollmentStatusApi } from "../../../apiServices/courseService";
import { checkScheduleConflictApi } from "../../../apiServices/scheduleService";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const ClassCard = ({ classItem, onEnroll }) => {
  const [enrollDialog, setEnrollDialog] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoInfo, setPromoInfo] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);
  const [scheduleConflict, setScheduleConflict] = useState(null);
  const [checkingConflict, setCheckingConflict] = useState(false);


  const { user, isLearner } = useAuth();
  const navigate = useNavigate();

    const isNotLearner = user && ["admin", "staff", "instructor"].includes(user.role);
const shouldShowEnrollButton = !isNotLearner;

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

  const checkScheduleConflict = async () => {
    try {
      setCheckingConflict(true);
      setEnrollError(null);
      const conflictCheck = await checkScheduleConflictApi(classItem.ClassID);

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

  const formatPrice = (price) => {
    if (price == null || isNaN(price)) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleEnrollClick = async () => {
    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    if (!isLearner) {
      setEnrollError("Chỉ học viên mới có thể đăng ký lớp học");
      return;
    }

    const enrolled = await checkEnrollmentStatus();

    if (enrolled) {
      navigate(`/my-courses/${classItem.CourseID}`);
      return;
    }

    setEnrollDialog(true);
    await checkScheduleConflict();
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

      const hasConflict = await checkScheduleConflict();
      if (hasConflict) {
        setEnrolling(false);
        return;
      }

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

  const handleCloseDialog = () => {
    if (!enrolling) {
      setEnrollDialog(false);
      setScheduleConflict(null);
      setEnrollError(null);
      setPromoCode("");
      setPromoInfo(null);
    }
  };

  const formatDateWithDay = (dateString) => {
    const date = new Date(dateString);
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const dayName = days[date.getDay()];
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${dayName}, ${day}/${month}/${date.getFullYear()}`;
  };

  const dayMap = {
    Monday: "T2",
    Tuesday: "T3",
    Wednesday: "T4",
    Thursday: "T5",
    Friday: "T6",
    Saturday: "T7",
    Sunday: "CN",
  };

  return (
    <>
      <Card
        sx={{
          height: "100%",
          borderRadius: 2,
          border: "1px solid #f0f0f0",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            borderColor: "#e0e0e0",
          },
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          {/* Header - Tên lớp và giá */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "#1a1a1a",
                flex: 1,
                lineHeight: 1.3,
              }}
            >
              {classItem.ClassName}
            </Typography>
            <Chip
              label={formatPrice(classItem.Fee)}
              sx={{
                fontWeight: 700,
                fontSize: "0.95rem",
                bgcolor: "#667eea",
                color: "white",
                height: 32,
                "& .MuiChip-label": { px: 1.5 },
              }}
            />
          </Box>

          {/* Instructor */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5, gap: 1 }}>
            <PersonOutline sx={{ fontSize: 18, color: "#666" }} />
            <Typography
              variant="body2"
              sx={{ color: "#666", fontSize: "0.9rem" }}
            >
              GV:{" "}
              <strong style={{ color: "#1a1a1a" }}>
                {classItem.InstructorName}
              </strong>
            </Typography>
          </Box>

          {/* Ngày khai giảng */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
            <EventAvailable sx={{ fontSize: 18, color: "#667eea" }} />
            <Typography
              variant="body2"
              sx={{ color: "#666", fontSize: "0.9rem" }}
            >
              Khai giảng:{" "}
              <strong style={{ color: "#667eea" }}>
                {formatDateWithDay(classItem.OpendatePlan)}
              </strong>
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Lịch học tuần */}
          {classItem.weeklySchedule && classItem.weeklySchedule.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  fontSize: "0.85rem",
                  color: "#666",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Lịch học hàng tuần
              </Typography>
              <Stack spacing={0.75}>
                {classItem.weeklySchedule.map((session, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      bgcolor: "#f8f8f8",
                      borderRadius: 1,
                      p: 1,
                      gap: 1.5,
                    }}
                  >
                    <Chip
                      label={dayMap[session.Day]}
                      size="small"
                      sx={{
                        minWidth: 40,
                        height: 24,
                        bgcolor: "white",
                        border: "1px solid #e0e0e0",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.85rem",
                        color: "#333",
                        fontWeight: 500,
                      }}
                    >
                      {session.StartTime.slice(0, 5)} -{" "}
                      {session.EndTime.slice(0, 5)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Thông tin lớp */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2.5 }}>
            <Chip
              icon={<People sx={{ fontSize: 16 }} />}
              label={
                classItem.Maxstudent - (classItem.StudentCount || 0) > 0
                  ? `Còn ${
                      classItem.Maxstudent - (classItem.StudentCount || 0)
                    } chỗ`
                  : "Hết chỗ"
              }
              size="small"
              sx={{
                fontSize: "0.8rem",
                height: 28,
                // Đổi màu khi hết chỗ
                ...(classItem.Maxstudent - (classItem.StudentCount || 0) <= 0
                  ? {
                      bgcolor: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#dc2626",
                      fontWeight: 600,
                    }
                  : classItem.Maxstudent - (classItem.StudentCount || 0) <= 3
                  ? {
                      bgcolor: "#fffbeb",
                      border: "1px solid #fde68a",
                      color: "#d97706",
                      fontWeight: 600,
                    }
                  : {
                      bgcolor: "#f5f5f5",
                      border: "1px solid #e0e0e0",
                    }),
              }}
            />
            <Chip
              icon={<Schedule sx={{ fontSize: 16 }} />}
              label={`${classItem.TotalSessions || 0} buổi`}
              size="small"
              sx={{
                bgcolor: "#f5f5f5",
                border: "1px solid #e0e0e0",
                fontSize: "0.8rem",
                height: 28,
              }}
            />
            {classItem.ZoomURL && (
              <Chip
                icon={<VideoCall sx={{ fontSize: 16 }} />}
                label="Online"
                size="small"
                sx={{
                  bgcolor: "#e0e7ff",
                  color: "#4f46e5",
                  border: "1px solid #c7d2fe",
                  fontSize: "0.8rem",
                  height: 28,
                  fontWeight: 600,
                }}
              />
            )}
          </Box>

       {shouldShowEnrollButton && (
          <Button
            fullWidth
            variant="contained"
            size="medium"
            onClick={handleEnrollClick}
            disabled={
              checkingEnrollment ||
              classItem.Maxstudent - (classItem.StudentCount || 0) <= 0
            }
            startIcon={
              checkingEnrollment ? <CircularProgress size={16} /> : null
            }
            sx={{
              fontWeight: 600,
              bgcolor: "#667eea",
              py: 1.2,
              borderRadius: 1.5,
              textTransform: "none",
              fontSize: "0.95rem",
              boxShadow: "0 2px 8px rgba(102, 126, 234, 0.2)",
              "&:hover": {
                bgcolor: "#5a67d8",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
              },
              // Style khi disabled vì hết chỗ
              "&.Mui-disabled": {
                bgcolor: "#e5e7eb",
                color: "#9ca3af",
                boxShadow: "none",
              },
            }}
          >
            {checkingEnrollment
              ? "Đang kiểm tra..."
              : isEnrolled
              ? "Vào học ngay"
              : "Đăng ký ngay"}
          </Button>
          )}
        </CardContent>
      </Card>

      {/* Dialog đăng ký */}
      <Dialog
        open={enrollDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
            Đăng ký lớp {classItem.ClassName}
          </Typography>
          {checkingConflict && (
            <Typography
              variant="caption"
              sx={{
                color: "#666",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mt: 0.5,
              }}
            >
              <CircularProgress size={12} />
              Đang kiểm tra lịch học...
            </Typography>
          )}
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {/* Thông báo trùng lịch */}
          {scheduleConflict && scheduleConflict.length > 0 && (
            <Alert
              severity="error"
              icon={<ErrorOutline />}
              sx={{
                mb: 2,
                borderRadius: 1.5,
                "& .MuiAlert-message": { width: "100%" },
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, mb: 1, color: "#dc2626" }}
              >
                ⚠️ Lịch học bị trùng!
              </Typography>
              {(() => {
                const conflict = scheduleConflict[0];
                return (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Lớp này trùng với: <strong>{conflict.ClassName}</strong> –{" "}
                    {conflict.Schedule}
                  </Typography>
                );
              })()}
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#b91c1c" }}
              >
                Vui lòng chọn lớp khác hoặc điều chỉnh lịch học.
              </Typography>
            </Alert>
          )}

          {/* Lỗi khác */}
          {enrollError && !scheduleConflict && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
              {enrollError}
            </Alert>
          )}

          {/* Tóm tắt giá */}
{(!scheduleConflict || scheduleConflict.length === 0) && (
  <Box
    sx={{
      mb: 3,
      p: 2.5,
      bgcolor: "#fafafa",
      borderRadius: 2,
      border: "1px solid #f0f0f0",
    }}
  >
    <Typography
      variant="body2"
      sx={{ color: "#666", mb: 0.5, fontSize: "0.85rem" }}
    >
      Học phí
    </Typography>
    
    {/* HIỂN THỊ GIÁ SAU KHI GIẢM */}
    {promoInfo ? (
      <>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 0.5 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: "#999",
              textDecoration: "line-through",
              fontSize: "0.9rem",
            }}
          >
            {formatPrice(classItem.Fee)}
          </Typography>
          <Chip
            label={`Giảm ${promoInfo.discountPercent}%`}
            size="small"
            sx={{
              bgcolor: "#dcfce7",
              color: "#166534",
              fontWeight: 600,
              fontSize: "0.75rem",
              height: 24,
            }}
          />
        </Box>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: "#667eea" }}
        >
          {formatPrice(
            classItem.Fee * (1 - promoInfo.discountPercent / 100)
          )}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "#059669", fontWeight: 600, display: "block", mt: 0.5 }}
        >
          Tiết kiệm: {formatPrice(
            classItem.Fee * (promoInfo.discountPercent / 100)
          )}
        </Typography>
      </>
    ) : (
      <>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: "#667eea", mb: 0.5 }}
        >
          {formatPrice(classItem.Fee)}
        </Typography>
      </>
    )}
  </Box>
)}

          {/* Mã giảm giá */}
          {(!scheduleConflict || scheduleConflict.length === 0) && (
            <TextField
              fullWidth
              label="Mã giảm giá (nếu có)"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocalOffer sx={{ color: "#999" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      size="small"
                      onClick={handleApplyPromo}
                      disabled={!promoCode.trim()}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        color: "#667eea",
                      }}
                    >
                      Áp dụng
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={handleCloseDialog}
            disabled={enrolling}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#666",
              px: 2.5,
            }}
          >
            {scheduleConflict ? "Đã hiểu" : "Hủy"}
          </Button>

          <Button
            variant="contained"
            onClick={handleEnroll}
            disabled={
              enrolling ||
              checkingConflict ||
              (scheduleConflict && scheduleConflict.length > 0)
            }
            startIcon={enrolling ? <CircularProgress size={16} /> : <Payment />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#667eea",
              px: 3,
              "&:hover": {
                bgcolor: "#5a67d8",
              },
            }}
          >
            {enrolling ? "Đang xử lý..." : "Thanh toán"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const ClassList = ({ classes, loading, courseId, onEnrollmentChange }) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress sx={{ color: "#667eea" }} />
      </Box>
    );
  }

  if (classes.length === 0) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        Hiện chưa có lớp học nào cho khóa học này.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, mb: 3, color: "#1a1a1a" }}
      >
        Danh sách lớp học
        <Chip
          label={`${classes.length} lớp`}
          size="small"
          sx={{
            ml: 1.5,
            bgcolor: "#e0e7ff",
            color: "#4f46e5",
            fontWeight: 600,
          }}
        />
      </Typography>

      <Grid container spacing={2.5}>
        {classes.map((classItem) => (
          <Grid item xs={12} md={6} lg={4} key={classItem.ClassID}>
            <ClassCard classItem={classItem} onEnroll={onEnrollmentChange} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ClassList;
