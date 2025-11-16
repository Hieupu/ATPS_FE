// pages/ExamsPage.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Quiz, AccessTime, EmojiEvents } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../../components/Header/AppHeader';
import { getMyEnrolledCourses } from '../../apiServices/courseService';
import { getExamsByCourseApi, getMyLatestExamResultApi } from '../../apiServices/examService';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`exam-tabpanel-${index}`}
    aria-labelledby={`exam-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const ExamCard = ({ exam, course, latestResult, onStartExam }) => {
  const navigate = useNavigate();

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString('vi-VN');
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.StartTime);
    const endTime = new Date(exam.EndTime);

    if (now < startTime) {
      return { status: 'upcoming', color: 'warning', label: 'Sắp diễn ra' };
    } else if (now >= startTime && now <= endTime) {
      return { status: 'active', color: 'success', label: 'Đang mở' };
    } else {
      return { status: 'closed', color: 'error', label: 'Đã kết thúc' };
    }
  };

  const statusInfo = getExamStatus(exam);

  const handleCourseClick = () => {
    navigate(`/my-courses/${course.CourseID}`);
  };

  return (
    <Card sx={{ mb: 2, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
      <CardContent>
        {/* Course Info */}
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, cursor: 'pointer' }} onClick={handleCourseClick}>
          <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
            {course.Title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Quiz sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {exam.Title}
              </Typography>
              <Chip 
                label={statusInfo.label} 
                color={statusInfo.color} 
                size="small" 
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              {exam.Description}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {formatDateTime(exam.StartTime)} - {formatDateTime(exam.EndTime)}
                </Typography>
              </Box>
              {exam.Duration && (
                <Typography variant="body2" color="text.secondary">
                  Thời gian: {exam.Duration} phút
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Latest Result */}
        {latestResult && (
          <Box sx={{ 
            p: 2, 
            bgcolor: 'success.light', 
            borderRadius: 1, 
            mb: 2,
            border: '1px solid',
            borderColor: 'success.main'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <EmojiEvents sx={{ color: 'success.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.dark' }}>
                Kết quả gần nhất
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" sx={{ color: 'success.dark', fontWeight: 600 }}>
                {latestResult.Score ?? latestResult.score}%
              </Typography>
              <Typography variant="body2" sx={{ color: 'success.dark', flex: 1 }}>
                {latestResult.Feedback ?? latestResult.feedback}
              </Typography>
              <Chip 
                label={ 
                  (latestResult.Score ?? latestResult.score) >= 50 ? 'Đạt' : 'Chưa đạt' 
                } 
                color={ (latestResult.Score ?? latestResult.score) >= 50 ? 'success' : 'error' }
                size="small"
              />
            </Box>
          </Box>
        )}

        {/* Action Button */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box
            component="button"
            onClick={() => onStartExam(exam, course)}
            disabled={statusInfo.status === 'closed' && !latestResult}
            sx={{
              flex: 1,
              backgroundColor: latestResult ? 'secondary.main' : 'primary.main',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: 1,
              cursor: statusInfo.status === 'closed' && !latestResult ? 'not-allowed' : 'pointer',
              opacity: statusInfo.status === 'closed' && !latestResult ? 0.6 : 1,
              fontWeight: 600,
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: latestResult ? 'secondary.dark' : 'primary.dark',
              },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}
          >
            <Quiz />
            {latestResult ? 'Làm lại bài thi' : 'Bắt đầu thi'}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const ExamsPage = () => {
  const [courses, setCourses] = useState([]);
  const [allExams, setAllExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchExamsData();
  }, []);

  const fetchExamsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy danh sách khóa học đã đăng ký
      const enrolledCoursesResponse = await getMyEnrolledCourses();
      const enrolledCourses = enrolledCoursesResponse.data || enrolledCoursesResponse.items || [];
      
      if (!Array.isArray(enrolledCourses)) {
        throw new Error('Dữ liệu khóa học không hợp lệ');
      }

      setCourses(enrolledCourses);

      // Lấy tất cả exam từ các khóa học
      const examsWithCourses = [];
      const examResultsMap = {};

      for (const course of enrolledCourses) {
        try {
          const examsData = await getExamsByCourseApi(course.CourseID);
          const exams = examsData.exams || examsData || [];

          // Lấy kết quả mới nhất cho từng exam
          for (const exam of exams) {
            try {
              const result = await getMyLatestExamResultApi(exam.ExamID);
              examResultsMap[exam.ExamID] = result.result || null;
            } catch (err) {
              examResultsMap[exam.ExamID] = null;
            }

            examsWithCourses.push({
              ...exam,
              course: course,
              latestResult: examResultsMap[exam.ExamID]
            });
          }
        } catch (err) {
          console.error(`Error fetching exams for course ${course.CourseID}:`, err);
        }
      }

      setAllExams(examsWithCourses);
    } catch (err) {
      console.error('Error fetching exams data:', err);
      setError(err.message || 'Không thể tải danh sách bài kiểm tra');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleStartExam = (exam, course) => {
    // Điều hướng đến trang làm bài thi
    window.open(`/exam/${exam.ExamID}`, '_blank');
    // Hoặc: navigate(`/exam/${exam.ExamID}`);
  };

  // Phân loại exam
  const activeExams = allExams.filter(exam => {
    const now = new Date();
    const startTime = new Date(exam.StartTime);
    const endTime = new Date(exam.EndTime);
    return now >= startTime && now <= endTime;
  });

  const upcomingExams = allExams.filter(exam => {
    const now = new Date();
    const startTime = new Date(exam.StartTime);
    return now < startTime;
  });

  const completedExams = allExams.filter(exam => {
    const now = new Date();
    const endTime = new Date(exam.EndTime);
    return now > endTime || exam.latestResult;
  });

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppHeader />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppHeader />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
            Bài Kiểm Tra Của Tôi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý và tham gia tất cả bài kiểm tra từ các khóa học đã đăng ký
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="exam tabs"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                px: 2
              }}
            >
              <Tab 
                label={`Tất cả (${allExams.length})`}
                id="exam-tab-0"
              />
              <Tab 
                label={`Đang mở (${activeExams.length})`}
                id="exam-tab-1"
              />
              <Tab 
                label={`Sắp diễn ra (${upcomingExams.length})`}
                id="exam-tab-2"
              />
              <Tab 
                label={`Đã hoàn thành (${completedExams.length})`}
                id="exam-tab-3"
              />
            </Tabs>

            {/* Tab Panels */}
            <Box sx={{ p: 3 }}>
              <TabPanel value={tabValue} index={0}>
                {allExams.length === 0 ? (
                  <Alert severity="info">
                    Bạn chưa có bài kiểm tra nào từ các khóa học đã đăng ký.
                  </Alert>
                ) : (
                  allExams.map(exam => (
                    <ExamCard
                      key={`${exam.ExamID}-${exam.course.CourseID}`}
                      exam={exam}
                      course={exam.course}
                      latestResult={exam.latestResult}
                      onStartExam={handleStartExam}
                    />
                  ))
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                {activeExams.length === 0 ? (
                  <Alert severity="info">
                    Hiện không có bài kiểm tra nào đang mở.
                  </Alert>
                ) : (
                  activeExams.map(exam => (
                    <ExamCard
                      key={`${exam.ExamID}-${exam.course.CourseID}`}
                      exam={exam}
                      course={exam.course}
                      latestResult={exam.latestResult}
                      onStartExam={handleStartExam}
                    />
                  ))
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                {upcomingExams.length === 0 ? (
                  <Alert severity="info">
                    Không có bài kiểm tra sắp diễn ra.
                  </Alert>
                ) : (
                  upcomingExams.map(exam => (
                    <ExamCard
                      key={`${exam.ExamID}-${exam.course.CourseID}`}
                      exam={exam}
                      course={exam.course}
                      latestResult={exam.latestResult}
                      onStartExam={handleStartExam}
                    />
                  ))
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                {completedExams.length === 0 ? (
                  <Alert severity="info">
                    Bạn chưa hoàn thành bài kiểm tra nào.
                  </Alert>
                ) : (
                  completedExams.map(exam => (
                    <ExamCard
                      key={`${exam.ExamID}-${exam.course.CourseID}`}
                      exam={exam}
                      course={exam.course}
                      latestResult={exam.latestResult}
                      onStartExam={handleStartExam}
                    />
                  ))
                )}
              </TabPanel>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ExamsPage;