import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Alert,
  Button,
  CardContent,
} from "@mui/material";
import { useParams } from "react-router-dom";
import AppHeader from "../../components/Header/AppHeader";
import ClassList from "./components/ClassList";
import CourseCurriculum from "./components/CourseCurriculum";
import CourseMaterials from "./components/CourseMaterials";
import InstructorInfo from "./components/InstructorInfo";
import CourseReviews from "./components/CourseReviews";
import { useNavigate } from "react-router-dom";
// API imports
import {
  getCourseByIdApi,
  getClassesByCourseApi,
  getCourseCurriculumApi,
  getMyEnrolledCourses,
} from "../../apiServices/courseService";

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`course-tabpanel-${index}`}
    aria-labelledby={`course-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const CourseDetailPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [isEnrolledInCourse, setIsEnrolledInCourse] = useState(false);
  const navigate = useNavigate();
  // Format price
  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }),
    []
  );

  const formatPrice = useCallback(
    (price) => {
      if (price == null || isNaN(price)) {
        return "0 ₫";
      }
      return priceFormatter.format(price);
    },
    [priceFormatter]
  );

  // Fetch course data
  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCourseByIdApi(id);
      console.log("getCourseByIdApi", data);
      setCourse(data);
    } catch (error) {
      console.error("Error fetching course:", error);
      setError(error.message || "Failed to load course details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch classes
  const fetchClasses = useCallback(async () => {
    try {
      setLoadingClasses(true);
      const data = await getClassesByCourseApi(id);
      setClasses(data.classes || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  }, [id]);

  // Check enrollment
  const checkEnrollment = useCallback(async () => {
    if (!course?.CourseID) return;
    try {
      const res = await getMyEnrolledCourses();
      const list = res?.data || res?.items || res || [];
      const enrolled = (Array.isArray(list) ? list : []).some(
        (c) => c.CourseID === course.CourseID
      );
      setIsEnrolledInCourse(enrolled);
    } catch (e) {
      setIsEnrolledInCourse(false);
    }
  }, [course?.CourseID]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  useEffect(() => {
    if (course?.CourseID) {
      fetchClasses();
      checkEnrollment();
    }
  }, [course?.CourseID, fetchClasses, checkEnrollment]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRetry = () => {
    fetchCourse();
    fetchClasses();
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
        <AppHeader />
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#667eea" }} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
        <AppHeader />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={handleRetry}>
                Thử lại
              </Button>
            }
          >
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  if (!course) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
        <AppHeader />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="warning">Không tìm thấy khóa học</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
      <AppHeader />

      {/* Course Header */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)",
          color: "white",
          py: 8,
          position: "relative",
          overflow: "hidden",
          borderBottomLeftRadius: { xs: 40, md: 60 },
          borderBottomRightRadius: { xs: 40, md: 60 },
          boxShadow: "0 50px 100px rgba(102, 126, 234, 0.4)",
          "&::before": {
            content: '""',
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            background:
              "radial-gradient(circle at 15% 30%, rgba(255,255,255,0.25) 0%, transparent 60%)",
            zIndex: 1,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            right: 0,
            background:
              "radial-gradient(circle at 85% 70%, rgba(255,255,255,0.22) 0%, transparent 60%)",
            zIndex: 1,
          },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Chip
                label={course.Level || "BEGINNER"}
                sx={{
                  bgcolor: "rgba(255,255,255,0.25)",
                  color: "white",
                  mb: 3,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  px: 1,
                  height: 32,
                  borderRadius: 2,
                }}
              />
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  fontSize: { xs: "2rem", md: "3rem" },
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                {course.Title}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  opacity: 0.95,
                  mb: 4,
                  maxWidth: 650,
                  lineHeight: 1.6,
                  fontWeight: 400,
                  fontSize: "1.125rem",
                }}
              >
                {course.Description}
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={6} sm={4}>
                  <Box
                    sx={{
                      bgcolor: "rgba(255,255,255,0.15)",
                      borderRadius: 2,
                      p: 2,
                      textAlign: "center",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {course.TotalStudents || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Học viên
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Box
                    sx={{
                      bgcolor: "rgba(255,255,255,0.15)",
                      borderRadius: 2,
                      p: 2,
                      textAlign: "center",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {parseFloat(course.Duration || 0).toFixed(0)}h
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Thời lượng
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Box
                    sx={{
                      bgcolor: "rgba(255,255,255,0.15)",
                      borderRadius: 2,
                      p: 2,
                      textAlign: "center",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {course.ReviewCount || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Đánh giá
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Card
                sx={{
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "rgba(255,255,255,0.18)",
                  borderRadius: 4,
                  p: 3,
                  backdropFilter: "blur(12px)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                  zIndex: 2,
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.1)",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.25)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                }}
                onClick={() => navigate(`/instructors/${course.InstructorID}`)}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    p: "0 !important",
                    "&:last-child": { pb: 0 },
                  }}
                >
                  <Avatar
                    src={course.InstructorAvatar}
                    sx={{
                      width: 84,
                      height: 84,
                      mr: 3,
                      border: "4px solid rgba(255,255,255,0.35)",
                      fontSize: "2rem",
                    }}
                    alt={course.InstructorName}
                  >
                    {course.InstructorName?.charAt(0)}
                  </Avatar>

                  <Box>
                    <Typography
                      variant="body1"
                      sx={{ opacity: 0.85, mb: 0.8, fontSize: "1rem" }}
                    >
                      Giảng viên
                    </Typography>

                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 0.8,
                        fontSize: "1.8rem",
                      }}
                    >
                      {course.InstructorName}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{ opacity: 0.9, fontSize: "1.1rem" }}
                    >
                      {course.InstructorJob} • {course.InstructorMajor}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  position: "relative",
                  top: { md: 40 },
                  borderRadius: 3,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    p: 3,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    Bắt đầu học ngay
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Nâng cao kỹ năng của bạn ngay hôm nay
                  </Typography>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      mb: 2.5,
                      color: "#1f2937",
                    }}
                  >
                    Khóa học bao gồm:
                  </Typography>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 2,
                        bgcolor: "#f8fafc",
                        borderRadius: 2,
                        borderLeft: "4px solid #667eea",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#1f2937" }}
                        >
                          {course.UnitCount || 0} chương học
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                          Nội dung chi tiết
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 2,
                        bgcolor: "#f8fafc",
                        borderRadius: 2,
                        borderLeft: "4px solid #667eea",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#1f2937" }}
                        >
                          Học mọi lúc mọi nơi
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                          Truy cập không giới hạn
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 2,
                        bgcolor: "#f8fafc",
                        borderRadius: 2,
                        borderLeft: "4px solid #667eea",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#1f2937" }}
                        >
                          Chứng chỉ hoàn thành
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                          Được công nhận
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 2,
                        bgcolor: "#f8fafc",
                        borderRadius: 2,
                        borderLeft: "4px solid #667eea",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#1f2937" }}
                        >
                          Hỗ trợ trực tuyến
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                          Giải đáp 24/7
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Course Content Tabs */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="course information tabs"
            sx={{
              "& .MuiTab-root": {
                fontWeight: 600,
                fontSize: "1rem",
                textTransform: "none",
                minHeight: 64,
                color: "#6b7280",
                "&.Mui-selected": {
                  color: "#667eea",
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#667eea",
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            <Tab label="Lớp học" />
            <Tab label="Lộ trình học" />
            <Tab label="Giảng viên" />
            <Tab label="Đánh giá" />
            {isEnrolledInCourse && <Tab label="Tài liệu" />}
          </Tabs>
        </Box>

        {/* Class List Tab */}
        <TabPanel value={tabValue} index={0}>
          <ClassList
            classes={classes}
            loading={loadingClasses}
            courseId={course.CourseID}
            onEnrollmentChange={checkEnrollment}
          />
        </TabPanel>

        {/* Curriculum Tab */}
        <TabPanel value={tabValue} index={1}>
          <CourseCurriculum
            courseId={course.CourseID}
            isEnrolled={isEnrolledInCourse}
          />
        </TabPanel>

        {/* Instructor Tab */}
        <TabPanel value={tabValue} index={2}>
          <InstructorInfo instructor={course} />
        </TabPanel>

        {/* Reviews Tab */}
        <TabPanel value={tabValue} index={3}>
          <CourseReviews courseId={course.CourseID} />
        </TabPanel>

        {/* Materials Tab */}
        {isEnrolledInCourse && (
          <TabPanel value={tabValue} index={4}>
            <CourseMaterials courseId={course.CourseID} />
          </TabPanel>
        )}
      </Container>
    </Box>
  );
};

export default CourseDetailPage;
