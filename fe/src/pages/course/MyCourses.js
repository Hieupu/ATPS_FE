// pages/MyCourses.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { AccessTime, Person } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getMyEnrolledCourses } from "../../apiServices/courseService";
import { useAuth } from "../../contexts/AuthContext";

const courseImages = [
  "https://wp-s3-edilume-test-bucket.s3.ap-southeast-1.amazonaws.com/wp-content/uploads/2022/12/31183122/IELTS_new_thumbnail.png",
  "https://top-courses.org/wp-content/uploads/2022/07/IELTS-TEST_Speaking-and-Writing.jpg",
  "https://www.focusedu.org/wp-content/uploads/2021/03/Top-Reasons-Why-IELTS-Coaching-Is-Important.jpg",
];

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isLearner } = useAuth();

  useEffect(() => {
    if (!isLearner) {
      setError("Chỉ người học mới có thể truy cập trang này");
      setLoading(false);
      return;
    }

    fetchEnrolledCourses();
  }, [isLearner]);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await getMyEnrolledCourses();
      setCourses(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to load enrolled courses");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (course) => {
    // Điều hướng đến trang MyCourseDetail với courseId
    navigate(`/my-courses/${course.CourseID}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (!isLearner) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Bạn không có quyền truy cập trang này. Chỉ người học mới có thể xem
          khóa học đã đăng ký.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Đang tải khóa học của bạn...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: "bold" }}
      >
        Khóa Học Của Tôi
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {courses.length === 0 && !loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Bạn chưa đăng ký khóa học nào
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/courses")}
            sx={{ mt: 2 }}
          >
            Khám phá khóa học
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => {
            const imageUrl =
              courseImages[course.CourseID % courseImages.length];
            return (
              <Grid item xs={12} md={6} lg={4} key={course.CourseID}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s",
                    cursor: "pointer", // Thêm cursor pointer
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => handleCourseClick(course)} // Click toàn bộ card
                >
                  <CardMedia
                    component="img"
                    height="160"
                    image={imageUrl}
                    alt={course.Title}
                    sx={{ objectFit: "cover" }}
                  />

                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Đăng ký: {formatDate(course.EnrollmentDate)}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: course.EnrollmentStatus === 'Enrolled' ? 'success.main' : 'text.secondary',
                          fontWeight: 'bold'
                        }}
                      >
                        {course.EnrollmentStatus === 'Enrolled' ? 'Đang học' : course.EnrollmentStatus}
                      </Typography>
                    </Box>

                    <Typography
                      variant="h6"
                      component="h2"
                      gutterBottom
                      sx={{
                        fontWeight: "bold",
                        minHeight: '64px', // Đảm bảo tiêu đề có chiều cao cố định
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {course.Title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ 
                        mb: 2,
                        minHeight: '40px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {course.Description?.substring(0, 100)}...
                    </Typography>

                    {/* Course Stats */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <AccessTime
                          sx={{
                            fontSize: 16,
                            mr: 0.5,
                            color: "text.secondary",
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {course.Duration} giờ
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Person
                          sx={{
                            fontSize: 16,
                            mr: 0.5,
                            color: "text.secondary",
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {course.UnitCount} bài học
                        </Typography>
                      </Box>

                      <Typography variant="caption" color="text.secondary">
                        {course.TotalEnrollments} học viên
                      </Typography>
                    </Box>

                    {/* Instructor Info */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 1,
                        bgcolor: "grey.50",
                        borderRadius: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 35,
                          height: 35,
                          borderRadius: "50%",
                          mr: 1,
                          bgcolor: "primary.light",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "14px"
                        }}
                      >
                        {course.InstructorName?.charAt(0) || 'G'}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          fontWeight="bold"
                          display="block"
                        >
                          {course.InstructorName || "Giảng viên"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {course.InstructorMajor || "Chuyên gia"}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default MyCourses;