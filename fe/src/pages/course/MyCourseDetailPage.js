import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import AppHeader from '../../components/Header/AppHeader';
import CourseMaterials from './components/CourseMaterials';
import CourseCurriculum from './components/CourseCurriculum';
import MyClassList from './components/MyClassList';
import AssignmentList from './components/AssignmentList';

// API imports
import {
  getCourseByIdApi, 
  getMyEnrolledCourses,
  getMyClassesInCourseApi,
  getCourseAssignmentsApi 
} from "../../apiServices/courseService";

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`mycourse-tabpanel-${index}`}
    aria-labelledby={`mycourse-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const MyCourseDetailPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Fetch course data và kiểm tra enrollment
  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Lấy thông tin khóa học
      const courseData = await getCourseByIdApi(id);
      setCourse(courseData);

      // Kiểm tra xem user có đăng ký khóa học này không
      const enrolledCourses = await getMyEnrolledCourses();
      const list = enrolledCourses?.data || enrolledCourses?.items || enrolledCourses || [];
      const enrolled = Array.isArray(list) ? list.some(c => c.CourseID === parseInt(id)) : false;
      setIsEnrolled(enrolled);

      if (!enrolled) {
        setError("Bạn chưa đăng ký khóa học này");
      }

    } catch (error) {
      console.error("Error fetching course data:", error);
      setError(error.message || "Failed to load course details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRetry = () => {
    fetchCourseData();
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

  if (error && !isEnrolled) {
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
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fe" }}>
      <AppHeader />
      
      {/* Course Header - Enhanced */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)",
          color: "white",
          py: { xs: 4, md: 5 },
          mb: 4,
          position: "relative",
          overflow: "hidden",
          borderBottomLeftRadius: { xs: 40, md: 60 },
          borderBottomRightRadius: { xs: 40, md: 60 },
          boxShadow: "0 30px 60px rgba(102, 126, 234, 0.35)",
          "&::before": {
            content: '""',
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            background:
              "radial-gradient(circle at 15% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)",
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
              "radial-gradient(circle at 85% 70%, rgba(255,255,255,0.18) 0%, transparent 60%)",
            zIndex: 1,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 3,
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(255,255,255,0.3)",
              }}
            >
              📖
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 800,
                  fontFamily: "'Poppins', sans-serif",
                  textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  fontSize: { xs: "1.5rem", md: "2rem" },
                }}
              >
                {course.Title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  opacity: 0.92,
                  maxWidth: 900,
                  mt: 1,
                  lineHeight: 1.6,
                }}
              >
                {course.Description}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Course Content với layout mới */}
      <Container maxWidth="lg" sx={{ pb: 6 }}>
        <Grid container spacing={3}>
          {/* Tabs bên trái */}
          <Grid item xs={12} md={3}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid rgba(99,102,241,0.15)",
                boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                position: "sticky",
                top: 100,
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  orientation="vertical"
                  aria-label="my course tabs"
                  sx={{
                    '& .MuiTab-root': {
                      alignItems: 'flex-start',
                      textAlign: 'left',
                      py: 2.5,
                      px: 3,
                      minHeight: '64px',
                      justifyContent: 'flex-start',
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      borderLeft: "3px solid transparent",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: "#f8f9fe",
                      },
                    },
                    '& .Mui-selected': {
                      background: "linear-gradient(90deg, rgba(102,126,234,0.1) 0%, rgba(255,255,255,0) 100%)",
                      color: 'primary.main',
                      fontWeight: 700,
                      borderLeftColor: "primary.main",
                    }
                  }}
                >
                  <Tab 
                    label="📚 Tài liệu" 
                    id="mycourse-tab-0"
                    aria-controls="mycourse-tabpanel-0"
                  />
                  <Tab 
                    label="👥 Lớp học của tôi" 
                    id="mycourse-tab-1"
                    aria-controls="mycourse-tabpanel-1"
                  />
                  <Tab 
                    label="🎯 Lộ trình học" 
                    id="mycourse-tab-2"
                    aria-controls="mycourse-tabpanel-2"
                  />
                </Tabs>
              </CardContent>
            </Card>
          </Grid>

          {/* Content bên phải */}
          <Grid item xs={12} md={9}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid rgba(99,102,241,0.15)",
                boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 }, minHeight: '500px' }}>
                {/* Tài liệu Tab */}
                <TabPanel value={tabValue} index={0}>
                  <CourseMaterials 
                    courseId={course.CourseID} 
                    isEnrolled={isEnrolled}
                  />
                </TabPanel>

                {/* Lớp học của tôi Tab */}
                <TabPanel value={tabValue} index={1}>
                  <MyClassList 
                    courseId={course.CourseID}
                  />
                </TabPanel>

                {/* Lộ trình học Tab */}
                <TabPanel value={tabValue} index={2}>
                  <CourseCurriculum 
                    courseId={course.CourseID}
                    isEnrolled={isEnrolled}
                  />
                </TabPanel>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default MyCourseDetailPage;