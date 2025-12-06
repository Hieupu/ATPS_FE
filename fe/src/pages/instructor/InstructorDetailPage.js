import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Alert,
  CardMedia,
  CardActionArea,
  Stack,
  Rating,
  Paper,
} from "@mui/material";
import {
  School,
  Business,
  LocationOn,
  Email,
  BusinessCenter,
  ArrowBack,
  CheckCircle,
  Phone,
  CalendarToday,
  AccessTime,
  AttachMoney,
  MenuBook,
  Star,
  Visibility,
  VerifiedUser,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { getInstructorByIdApi } from "../../apiServices/instructorService";
import AppHeader from "../../components/Header/AppHeader";
import BookSessionDialog from "../../components/Booking/BookSessionDialog";
import { useAuth } from "../../contexts/AuthContext";
import { getLearnerIdFromAccount } from "../../utils/learnerUtils";

const InstructorDetailSkeleton = () => (
  <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
    <Box sx={{ bgcolor: "grey.300", py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton
              variant="circular"
              width={150}
              height={150}
              sx={{ mb: 3 }}
            />
            <Skeleton variant="text" width="80%" height={50} />
            <Skeleton variant="text" width="60%" height={30} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  </Box>
);

const InstructorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLearner } = useAuth();
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [learnerId, setLearnerId] = useState(null);

  const fetchInstructor = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInstructorByIdApi(id);
      console.log("getInstructorByIdApi" , data)
      setInstructor(data.instructor);
    } catch (error) {
      console.error("Error fetching instructor:", error);
      setError(error.message || "Không thể tải thông tin giảng viên");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInstructor();
  }, [fetchInstructor]);

  // Get learner ID when user is logged in
  useEffect(() => {
    const fetchLearnerId = async () => {
      if (user && isLearner) {
        try {
          const accId = user.AccID || user.id;
          if (accId) {
            const id = await getLearnerIdFromAccount(accId);
            setLearnerId(id);
          }
        } catch (err) {
          console.error("Error fetching learner ID:", err);
        }
      }
    };
    fetchLearnerId();
  }, [user, isLearner]);

  const handleOpenBookingDialog = () => {
    if (!learnerId) {
      setError("Vui lòng đăng nhập để đặt lịch");
      return;
    }
    setBookingDialogOpen(true);
  };

  const handleBookingSuccess = () => {
    fetchInstructor(); // Refresh instructor data
    setBookingDialogOpen(false);
  };

  if (loading) {
    return <InstructorDetailSkeleton />;
  }

  if (error || !instructor) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Không tìm thấy giảng viên"}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate("/instructors")}
          startIcon={<ArrowBack />}
        >
          Quay lại danh sách giảng viên
        </Button>
      </Container>
    );
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

const formatDuration = (hours) => {
    if (hours < 1) return `${Math.round(hours * 60)} phút`;
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours} giờ ${minutes} phút` : `${wholeHours} giờ`;
};

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      <AppHeader />
      
      {/* Enhanced Header Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          color: "white",
          py: { xs: 4, md: 8 },
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/instructors")}
            sx={{
              mb: 3,
              color: "white",
              bgcolor: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
              borderRadius: 2,
              px: 2,
            }}
          >
            Quay lại
          </Button>

          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "center", sm: "flex-start" },
                  gap: 3,
                  mb: 4,
                }}
              >
                <Avatar
                  src={instructor.ProfilePicture}
                  sx={{
                    width: { xs: 120, md: 180 },
                    height: { xs: 120, md: 180 },
                    border: "6px solid white",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                  }}
                  alt={instructor.FullName}
                >
                  {instructor.FullName?.charAt(0)}
                </Avatar>
                <Box sx={{ textAlign: { xs: "center", sm: "left" }, flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "center", sm: "flex-start" }, gap: 1, mb: 1 }}>
                    <VerifiedUser sx={{ fontSize: 24, color: "#ffd700" }} />
                    <Typography
                      variant="h3"
                      component="h1"
                      sx={{
                        fontWeight: 800,
                        mb: 1,
                        fontSize: { xs: "1.75rem", md: "2.75rem" },
                        textShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      }}
                    >
                      {instructor.FullName}
                    </Typography>
                  </Box>
                  <Chip
                    icon={<Business />}
                    label={instructor.Job}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      mb: 1.5,
                      fontWeight: 600,
                      fontSize: "0.95rem",
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      justifyContent: { xs: "center", sm: "flex-start" },
                    }}
                  >
                    <School sx={{ fontSize: 22, opacity: 0.9 }} />
                    <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 500 }}>
                      {instructor.Major}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Enhanced Stats */}
              <Box
                sx={{
                  display: "flex",
                  gap: { xs: 2, md: 4 },
                  flexWrap: "wrap",
                  mb: 3,
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(10px)",
                    px: 3,
                    py: 2,
                    borderRadius: 2,
                    minWidth: 120,
                    textAlign: "center",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, mb: 0.5 }}
                  >
               {instructor?.Courses?.length ?? 0}

                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: "0.9rem" }}>
                    Khóa học
                  </Typography>
                </Paper>
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(10px)",
                    px: 3,
                    py: 2,
                    borderRadius: 2,
                    minWidth: 120,
                    textAlign: "center",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, mb: 0.5 }}
                  >
                    {instructor.TotalStudents || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: "0.9rem" }}>
                    Học sinh
                  </Typography>
                </Paper>
              </Box>

                <Box sx={{ mt: 3 }}>
               <Button
  variant="contained"
  size="large"
  startIcon={<CalendarToday />}
  onClick={() => {
    if (!user) {
      window.location.href = "/auth/login";
      return;
    }
    handleOpenBookingDialog();
  }}
  sx={{
    px: 5,
    py: 1.5,
    fontSize: "1.1rem",
    borderRadius: 3,
    bgcolor: "white",
    color: "primary.main",
    fontWeight: 700,
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    "&:hover": {
      bgcolor: "rgba(255,255,255,0.95)",
      transform: "translateY(-2px)",
      boxShadow: "0 6px 25px rgba(0,0,0,0.3)",
    },
    transition: "all 0.3s ease",
  }}
>
  Đặt lịch học 1-1
</Button>
                </Box>
            
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Grid container spacing={4}>
          {/* Left Column - Main Info */}
          <Grid item xs={12} md={8}>
            {/* Courses Section - Always visible */}
            <Card
              id="courses-section"
              sx={{
                mb: 4,
                borderRadius: 4,
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                overflow: "hidden",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <Box
                sx={{
                background: "linear-gradient(135deg, #9564caff 0%, #8a3cc6ff 100%)",
                  color: "white",
                  p: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <MenuBook sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Khóa học của giảng viên
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {instructor.Courses && instructor.Courses.length > 0
                      ? `${instructor.Courses.length} khóa học đang mở`
                      : "Chưa có khóa học nào"}
                  </Typography>
                </Box>
              </Box>
                 <CardContent sx={{ p: 3 }}>
  {instructor.Courses && instructor.Courses.filter(course => course.Status === "PUBLISHED").length > 0 ? (
    <Grid container spacing={3}>
      {instructor.Courses
        .filter(course => course.Status === "PUBLISHED")
        .map((course) => (
          <Grid item xs={12} sm={6} key={course.CourseID}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 3,
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                border: "1px solid rgba(0,0,0,0.08)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                },
                cursor: "pointer",
              }}
              onClick={() => navigate(`/courses/${course.CourseID}`)}
            >
              <CardActionArea>
                <Box
                  sx={{
                    height: 160,
                    bgcolor: "primary.main",
                    background: course.Image 
                      ? `url(${course.Image}) center/cover no-repeat`
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: course.Image ? "rgba(0,0,0,0.3)" : "transparent",
                    },
                  }}
                >
                  {!course.Image && (
                    <MenuBook sx={{ fontSize: 64, color: "white", opacity: 0.3, position: "relative", zIndex: 1 }} />
                  )}
                  <Chip
                    label="Đang Mở"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      bgcolor: "success.main",
                      color: "white",
                      fontWeight: 600,
                      zIndex: 2,
                    }}
                  />
                </Box>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      minHeight: 60,
                    }}
                  >
                    {course.Title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      minHeight: 40,
                    }}
                  >
                    {course.Description}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <AccessTime sx={{ fontSize: 18, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatDuration(course.Duration)}
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
  variant="text"
  fullWidth
  size="small"
  sx={{
    borderRadius: 2,
    textTransform: "none",
    fontWeight: 600,
    color: "grey.700",
    backgroundColor: "transparent",
    border: "1px solid transparent",
    transition: "all 0.2s ease",
    
    "&:hover": {
      backgroundColor: "rgba(124, 58, 237, 0.04)",
      color: "#7C3AED",
      borderColor: "rgba(124, 58, 237, 0.2)",
    },
  }}
  onClick={(e) => {
    e.stopPropagation();
    navigate(`/courses/${course.CourseID}`);
  }}
>
  Xem chi tiết
</Button>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
    </Grid>
  ) : (
    <Box
      sx={{
        textAlign: "center",
        py: 6,
        px: 3,
      }}
    >
      <MenuBook
        sx={{
          fontSize: 64,
          color: "text.secondary",
          opacity: 0.3,
          mb: 2,
        }}
      />
      <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
        Chưa có khóa học nào
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Giảng viên này chưa có khóa học nào đã xuất bản. Vui lòng quay lại sau.
      </Typography>
    </Box>
  )}
</CardContent>
            </Card>

            {/* About Section */}
            <Card
              sx={{
                mb: 4,
                borderRadius: 4,
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                  <BusinessCenter color="primary" />
                  Thông tin cá nhân
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "start",
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "grey.50",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "grey.100",
                        },
                      }}
                    >
                      <LocationOn color="primary" sx={{ mt: 0.5 }} />
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, mb: 0.5, color: "text.secondary" }}
                        >
                          Địa chỉ
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {instructor.Address || "Chưa cập nhật"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {instructor.Email && (
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "start",
                          gap: 2,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "grey.50",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: "grey.100",
                          },
                        }}
                      >
                        <Email color="primary" sx={{ mt: 0.5 }} />
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, mb: 0.5, color: "text.secondary" }}
                          >
                            Email
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {instructor.Email}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {instructor.Phone && (
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "start",
                          gap: 2,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "grey.50",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: "grey.100",
                          },
                        }}
                      >
                        <Phone color="primary" sx={{ mt: 0.5 }} />
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, mb: 0.5, color: "text.secondary" }}
                          >
                            Điện thoại
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {instructor.Phone}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {instructor.DateOfBirth && (
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "start",
                          gap: 2,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "grey.50",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: "grey.100",
                          },
                        }}
                      >
                        <CalendarToday color="primary" sx={{ mt: 0.5 }} />
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, mb: 0.5, color: "text.secondary" }}
                          >
                            Ngày sinh
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {new Date(instructor.DateOfBirth).toLocaleDateString(
                              "vi-VN",
                              { year: "numeric", month: "long", day: "numeric" }
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            {instructor.Reviews && instructor.Reviews.length > 0 && (
              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                    <Star color="primary" />
                    Đánh giá từ học viên ({instructor.Reviews.length})
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <List sx={{ p: 0 }}>
                    {instructor.Reviews.map((review, index) => (
                      <React.Fragment key={index}>
                        <ListItem
                          sx={{
                            alignItems: "flex-start",
                            py: 2.5,
                            px: 0,
                            borderRadius: 2,
                            "&:hover": {
                              bgcolor: "grey.50",
                            },
                            transition: "background-color 0.2s ease",
                          }}
                        >
                          <Avatar
                            src={review.LearnerAvatar}
                            sx={{
                              mr: 2,
                              width: 56,
                              height: 56,
                              border: "2px solid",
                              borderColor: "primary.light",
                            }}
                          >
                            {review.LearnerName?.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 700 }}
                              >
                                {review.LearnerName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontWeight: 500 }}
                              >
                                {new Date(review.ReviewDate).toLocaleDateString(
                                  "vi-VN",
                                  { year: "numeric", month: "long", day: "numeric" }
                                )}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ lineHeight: 1.7 }}
                            >
                              {review.Comment}
                            </Typography>
                          </Box>
                        </ListItem>
                        {index < instructor.Reviews.length - 1 && (
                          <Divider sx={{ mx: 0 }} />
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Right Column - Summary */}
<Grid item xs={12} md={4}>
  <Card
    sx={{
      position: { md: "sticky" },
      top: { md: 100 },
      borderRadius: 4,
      boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
      border: "1px solid rgba(0,0,0,0.05)",
      mb: 4,
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
        <CheckCircle color="primary" />
        Thông tin tóm tắt
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Stack spacing={2}>
        {/* Thêm phần học phí vào đây */}
       <Box
  sx={{
    display: "flex",
    alignItems: "center",
    gap: 2,
    p: 3,
    borderRadius: 3,
    background: "linear-gradient(135deg, #7c3cc0ff 0%, #603cceff 100%)",
    color: "white",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 4px 14px rgba(118, 86, 225, 0.3)",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      right: 0,
      width: "60%",
      height: "100%",
      background: "radial-gradient(circle at top right, rgba(255,255,255,0.15) 0%, transparent 70%)",
    },
  }}
>
  <Box sx={{ zIndex: 1, flex: 1 }}>
    <Typography 
      variant="caption" 
      sx={{ 
        fontWeight: 700, 
        opacity: 0.95,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        fontSize: "0.75rem",
      }}
    >
      Học phí 1 kèm 1
    </Typography>
    <Typography 
      variant="h5" 
      sx={{ 
        fontWeight: 800, 
        mt: 0.5,
        letterSpacing: "-0.02em",
      }}
    >
      {formatCurrency(instructor.InstructorFee)}/buổi
    </Typography>
  </Box>
</Box>


        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: "grey.50",
          }}
        >
          <School color="primary" />
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Chuyên ngành
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {instructor.Major}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: "grey.50",
          }}
        >
          <Business color="primary" />
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Công việc
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {instructor.Job}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: "grey.50",
          }}
        >
          <LocationOn color="primary" />
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Địa chỉ
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {instructor.Address || "Chưa cập nhật"}
            </Typography>
          </Box>
        </Box>
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ textAlign: "center" }}>
        <Chip
          icon={<VerifiedUser />}
          label="Giảng viên được xác nhận"
          color="success"
          sx={{
            fontWeight: 700,
            fontSize: "0.9rem",
            py: 2.5,
            px: 1,
          }}
        />
      </Box>
    </CardContent>
  </Card>
</Grid>
        </Grid>
      </Container>

      {/* Booking Dialog */}
      {learnerId && (
        <BookSessionDialog
          open={bookingDialogOpen}
          onClose={() => setBookingDialogOpen(false)}
          instructor={instructor}
          learnerId={learnerId}
          onSuccess={handleBookingSuccess}
        />
      )}
    </Box>
  );
};

export default InstructorDetailPage;
