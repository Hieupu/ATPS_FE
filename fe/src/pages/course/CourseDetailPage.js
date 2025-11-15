import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
} from '@mui/material';
import {
  People,
  Schedule,
  Star,
  WorkspacePremium,
  Language,
  PlayCircle,
  AccessTime,
  Payment,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import AppHeader from '../../components/Header/AppHeader';
import ClassList from './components/ClassList';
import CourseCurriculum from './components/CourseCurriculum';
import CourseMaterials from './components/CourseMaterials';
import CourseExams from './components/CourseExams';
import InstructorInfo from './components/InstructorInfo';
import CourseReviews from './components/CourseReviews';

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
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <AppHeader />
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
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
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <AppHeader />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="warning">Không tìm thấy khóa học</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppHeader />
      
      {/* Course Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Chip
                label={course.Category || "Programming"}
                sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", mb: 2 }}
              />
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: "2rem", md: "3rem" },
                }}
              >
                {course.Title}
              </Typography>
              <Typography
                variant="h6"
                sx={{ opacity: 0.9, mb: 3, maxWidth: 600 }}
              >
                {course.Description}
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <People sx={{ mr: 1 }} />
                  <Typography>
                    {course.EnrollmentCount || 0} học viên
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Schedule sx={{ mr: 1 }} />
                  <Typography>{course.Duration || 0} giờ học</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Star sx={{ mr: 1 }} />
                  <Typography>
                    {course.AverageRating
                      ? course.AverageRating.toFixed(1)
                      : "N/A"}{" "}
                    đánh giá
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  src={course.InstructorAvatar}
                  sx={{ width: 56, height: 56, mr: 2 }}
                  alt={course.InstructorName}
                >
                  {course.InstructorName?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {course.InstructorName}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {course.InstructorJob} • {course.InstructorMajor}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ position: "relative", top: { md: 40 } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Typography variant="h6" color="text.secondary">
                      Bắt đầu học ngay
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: "left" }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Khóa học bao gồm:
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <PlayCircle color="primary" sx={{ mr: 1 }} />
                        <Typography>{course.UnitCount || 0} chương học</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <AccessTime color="primary" sx={{ mr: 1 }} />
                        <Typography>Học mọi lúc mọi nơi</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <WorkspacePremium color="primary" sx={{ mr: 1 }} />
                        <Typography>Chứng chỉ hoàn thành</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Language color="primary" sx={{ mr: 1 }} />
                        <Typography>Hỗ trợ trực tuyến</Typography>
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
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="course information tabs"
        >
          <Tab label="Lớp học" />
          <Tab label="Lộ trình học" />
          <Tab label="Giảng viên" />
          <Tab label="Đánh giá" />
          {isEnrolledInCourse && <Tab label="Tài liệu" />}
          {isEnrolledInCourse && <Tab label="Bài kiểm tra" />}
        </Tabs>

        <Divider />

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

        {/* Exams Tab */}
        {isEnrolledInCourse && (
          <TabPanel value={tabValue} index={5}>
            <CourseExams courseId={course.CourseID} />
          </TabPanel>
        )}
      </Container>
    </Box>
  );
};

export default CourseDetailPage;