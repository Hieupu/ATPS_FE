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

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fe" }}>
      <AppHeader />
      {/* Header Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/instructors")}
            sx={{
              mb: 3,
              color: "white",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            Quay lại
          </Button>

          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}
              >
                <Avatar
                  src={instructor.ProfilePicture}
                  sx={{
                    width: 150,
                    height: 150,
                    border: "4px solid white",
                  }}
                  alt={instructor.FullName}
                >
                  {instructor.FullName?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      fontSize: { xs: "2rem", md: "2.5rem" },
                    }}
                  >
                    {instructor.FullName}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Business sx={{ fontSize: 20 }} />
                    <Typography variant="h6">{instructor.Job}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <School sx={{ fontSize: 20 }} />
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      {instructor.Major}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Stats */}
              <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {instructor.TotalCourses || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Khóa học
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {instructor.TotalStudents || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Học sinh
                  </Typography>
                </Box>
              </Box>

              {/* Book Session Button */}
              {isLearner && learnerId && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<CalendarToday />}
                    onClick={handleOpenBookingDialog}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: "1rem",
                      borderRadius: 2,
                    }}
                  >
                    Đặt lịch học 1-1
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Details Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Left Column - Main Info */}
          <Grid item xs={12} md={8}>
            {/* About Section */}
            <Card
              sx={{
                mb: 4,
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  Giới thiệu
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{ display: "flex", alignItems: "start", gap: 2, mb: 2 }}
                  >
                    <LocationOn color="primary" />
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        Địa chỉ
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {instructor.Address || "Chưa cập nhật"}
                      </Typography>
                    </Box>
                  </Box>

                  {instructor.Email && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "start",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Email color="primary" />
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          Email
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {instructor.Email}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {instructor.Phone && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "start",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Phone color="primary" />
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          Điện thoại
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {instructor.Phone}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {instructor.DateOfBirth && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "start",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <CalendarToday color="primary" />
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          Ngày sinh
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(instructor.DateOfBirth).toLocaleDateString(
                            "vi-VN"
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {instructor.CV && (
                    <Box sx={{ display: "flex", alignItems: "start", gap: 2 }}>
                      <BusinessCenter color="primary" />
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, mb: 1 }}
                        >
                          CV
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<BusinessCenter />}
                          href={instructor.CV}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Xem CV
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            {instructor.Reviews && instructor.Reviews.length > 0 && (
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                    Đánh giá từ học viên
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <List>
                    {instructor.Reviews.map((review, index) => (
                      <React.Fragment key={index}>
                        <ListItem
                          sx={{
                            alignItems: "flex-start",
                            py: 2,
                            px: 0,
                          }}
                        >
                          <Avatar
                            src={review.LearnerAvatar}
                            sx={{ mr: 2, width: 48, height: 48 }}
                          >
                            {review.LearnerName?.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 600 }}
                              >
                                {review.LearnerName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {new Date(review.ReviewDate).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {review.Comment}
                            </Typography>
                          </Box>
                        </ListItem>
                        {index < instructor.Reviews.length - 1 && <Divider />}
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
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Thông tin tóm tắt
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <School color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Chuyên ngành"
                      secondary={instructor.Major}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Business color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Công việc"
                      secondary={instructor.Job}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <LocationOn color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Địa chỉ"
                      secondary={instructor.Address || "Chưa cập nhật"}
                    />
                  </ListItem>
                </List>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ textAlign: "center" }}>
                  <Chip
                    icon={<CheckCircle />}
                    label="Giảng viên được xác nhận"
                    color="success"
                    sx={{ fontWeight: 600 }}
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
