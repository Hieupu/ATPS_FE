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
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppHeader />
      
      {/* Course Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 2,
            }}
          >
            {course.Title}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ opacity: 0.9, maxWidth: 800 }}
          >
            {course.Description}
          </Typography>
        </Container>
      </Box>

      {/* Course Content với layout mới */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Tabs bên trái */}
          <Grid item xs={12} md={3}>
            <Card>
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
                      py: 2,
                      px: 3,
                      minHeight: '60px',
                      justifyContent: 'flex-start',
                    },
                    '& .Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.main',
                      fontWeight: 600,
                    }
                  }}
                >
                  <Tab 
                    label="Tài liệu" 
                    id="mycourse-tab-0"
                    aria-controls="mycourse-tabpanel-0"
                  />
                  <Tab 
                    label="Lớp học của tôi" 
                    id="mycourse-tab-1"
                    aria-controls="mycourse-tabpanel-1"
                  />
                  <Tab 
                    label="Lộ trình học" 
                    id="mycourse-tab-2"
                    aria-controls="mycourse-tabpanel-2"
                  />
                  <Tab 
                    label="Assignment" 
                    id="mycourse-tab-3"
                    aria-controls="mycourse-tabpanel-3"
                  />
                </Tabs>
              </CardContent>
            </Card>
          </Grid>

          {/* Content bên phải */}
          <Grid item xs={12} md={9}>
            <Card>
              <CardContent sx={{ p: 4, minHeight: '500px' }}>
                {/* Tài liệu Tab */}
                <TabPanel value={tabValue} index={0}>
                  <Typography variant="h5" gutterBottom>
                    Tài liệu khóa học
                  </Typography>
                  <CourseMaterials 
                    courseId={course.CourseID} 
                    isEnrolled={isEnrolled}
                  />
                </TabPanel>


                {/* Lớp học của tôi Tab */}
                <TabPanel value={tabValue} index={1}>
                  <Typography variant="h5" gutterBottom>
                    Lớp học của tôi
                  </Typography>
                  <MyClassList 
                    courseId={course.CourseID}
                  />
                </TabPanel>

                {/* Lộ trình học Tab */}
                <TabPanel value={tabValue} index={2}>
                  <Typography variant="h5" gutterBottom>
                    Lộ trình học
                  </Typography>
                  <CourseCurriculum 
                    courseId={course.CourseID}
                    isEnrolled={isEnrolled}
                  />
                </TabPanel>

                {/* Assignment Tab */}
                <TabPanel value={tabValue} index={3}>
                  <Typography variant="h5" gutterBottom>
                    Bài tập
                  </Typography>
                  <AssignmentList 
                    courseId={course.CourseID}
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