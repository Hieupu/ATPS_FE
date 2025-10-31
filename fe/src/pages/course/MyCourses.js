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
  Chip,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { PlayArrow, AccessTime, Person } from "@mui/icons-material";
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

  const handleContinueLearning = (courseId, classId) => {
    if (courseId) return navigate(`/learning/${courseId}`);
    if (classId) return navigate(`/learning/class/${classId}`);
    return;
  };

  const handleViewCourse = (course) => {
    if (course.CourseID) return navigate(`/courses/${course.CourseID}`);
    return navigate(`/schedule`);
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
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="160"
                    image={imageUrl}
                    alt={course.Title}
                    sx={{ objectFit: "cover" }}
                    onClick={() => handleViewCourse(course)}
                    style={{ cursor: "pointer" }}
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
                        {formatDate(course.EnrollmentDate)}
                      </Typography>
                    </Box>

                    <Typography
                      variant="h6"
                      component="h2"
                      gutterBottom
                      sx={{
                        fontWeight: "bold",
                        cursor: "pointer",
                        "&:hover": { color: "primary.main" },
                      }}
                      onClick={() => handleViewCourse(course)}
                    >
                      {course.Title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
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
                        mb: 2,
                        p: 1,
                        bgcolor: "grey.50",
                        borderRadius: 1,
                      }}
                    >
                      <Box
                        src={course.InstructorAvatar || "/default-avatar.png"}
                        alt={course.InstructorName}
                        sx={{
                          width: 35,
                          height: 35,
                          borderRadius: "50%",
                          mr: 1,
                          bgcolor: "primary.light",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {course.InstructorName?.charAt(0)}
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          fontWeight="bold"
                          display="block"
                        >
                          {course.InstructorName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {course.InstructorMajor}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<PlayArrow />}
                        onClick={() =>
                          handleContinueLearning(
                            course.CourseID,
                            course.ClassID
                          )
                        }
                        disabled={
                          !["active", "Enrolled"].includes(
                            course.EnrollmentStatus
                          )
                        }
                        sx={{ flex: 1 }}
                      >
                        {["active", "Enrolled"].includes(
                          course.EnrollmentStatus
                        )
                          ? "Học tiếp"
                          : "Đã hoàn thành"}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => handleViewCourse(course)}
                        sx={{ flex: 0.5 }}
                      >
                        Xem
                      </Button>
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
