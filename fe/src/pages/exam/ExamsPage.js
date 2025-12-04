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
  Button,
} from '@mui/material';
import { Quiz, AccessTime, EmojiEvents, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../../components/Header/AppHeader';
import { 
  getAllExamsApi,
  EXAM_STATUS_LABELS,
  EXAM_STATUS_COLORS,
  TAB_FILTERS,
  formatScore
} from '../../apiServices/learnerExamService';

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

const ExamCard = ({ exam, onStartExam, onViewResult }) => {
  const navigate = useNavigate();

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCourseClick = () => {
    if (exam.courseId) {
      navigate(`/my-courses/${exam.courseId}`);
    }
  };

  // Determine button action
  const canTakeExam = exam.availabilityStatus === 'available' && !exam.isSubmitted;
  const canViewResult = exam.isSubmitted;

  return (
    <Card 
      sx={{ 
        mb: 2, 
        transition: 'all 0.3s ease',
        '&:hover': { 
          transform: 'translateY(-4px)',
          boxShadow: 6
        } 
      }}
    >
      <CardContent>
        {/* Course Info */}
        <Box 
          sx={{ 
            mb: 2, 
            p: 2, 
            bgcolor: 'primary.50', 
            borderRadius: 1, 
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'primary.100'
            }
          }} 
          onClick={handleCourseClick}
        >
          <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
            📚 {exam.courseName || 'Khóa học'}
          </Typography>
          {exam.className && (
            <Typography variant="caption" color="text.secondary">
              Lớp: {exam.className}
            </Typography>
          )}
        </Box>

        {/* Exam Title & Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Quiz sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {exam.title}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              {exam.description || 'Không có mô tả'}
            </Typography>
          </Box>

          <Chip 
            label={EXAM_STATUS_LABELS[exam.availabilityStatus] || exam.availabilityStatus} 
            color={EXAM_STATUS_COLORS[exam.availabilityStatus] || 'default'} 
            size="small"
            sx={{ ml: 2 }}
          />
        </Box>

        {/* Time Info */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Bắt đầu: {formatDateTime(exam.classStartTime || exam.startTime)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Kết thúc: {formatDateTime(exam.classEndTime || exam.endTime)}
            </Typography>
          </Box>
        </Box>

        {/* Result Display (if submitted) */}
        {exam.isSubmitted && exam.score !== null && exam.score !== undefined && (
          <Box sx={{ 
            p: 2, 
            bgcolor: exam.score >= 50 ? 'success.light' : 'error.light',
            borderRadius: 1, 
            mb: 2,
            border: '1px solid',
            borderColor: exam.score >= 50 ? 'success.main' : 'error.main'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <EmojiEvents sx={{ color: exam.score >= 50 ? 'success.main' : 'error.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Kết quả
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {formatScore(exam.score)}
              </Typography>
              <Chip 
                icon={<CheckCircle />}
                label={exam.score >= 50 ? 'Đạt' : 'Chưa đạt'} 
                color={exam.score >= 50 ? 'success' : 'error'}
                size="small"
              />
              {exam.submissionDate && (
                <Typography variant="caption" color="text.secondary">
                  Nộp lúc: {formatDateTime(exam.submissionDate)}
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {canTakeExam && (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<Quiz />}
              onClick={() => onStartExam(exam)}
              sx={{ fontWeight: 600 }}
            >
              Bắt đầu làm bài
            </Button>
          )}

          {canViewResult && (
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              startIcon={<EmojiEvents />}
              onClick={() => onViewResult(exam)}
              sx={{ fontWeight: 600 }}
            >
              Xem kết quả
            </Button>
          )}

          {exam.availabilityStatus === 'not_started' && (
            <Button
              variant="outlined"
              color="warning"
              fullWidth
              disabled
              sx={{ fontWeight: 600 }}
            >
              Chưa đến giờ thi
            </Button>
          )}

          {exam.availabilityStatus === 'expired' && !exam.isSubmitted && (
            <Button
              variant="outlined"
              color="error"
              fullWidth
              disabled
              sx={{ fontWeight: 600 }}
            >
              Đã hết hạn
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const ExamsPage = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchExams();
  }, [tabValue]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current tab filter
      const currentFilter = TAB_FILTERS[tabValue]?.value || 'all';
      
      // Fetch exams with filter
      const examsData = await getAllExamsApi(currentFilter);
      
      setExams(examsData);
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError(err.message || 'Không thể tải danh sách bài kiểm tra');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleStartExam = (exam) => {
    // Navigate to exam taking page
    navigate(`/exam/${exam.examId}/take`);
  };

  const handleViewResult = (exam) => {
    // Navigate to result page
    navigate(`/exam/${exam.examId}/result`);
  };

  // Calculate counts for each tab
  const getCounts = () => {
    const counts = {
      all: exams.length,
      ongoing: 0,
      upcoming: 0,
      completed: 0
    };

    // Note: Backend already filters by tab, so we just show the count
    // If you want to show total counts, you need to fetch all exams separately
    return counts;
  };

  const counts = getCounts();

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
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
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
              variant="fullWidth"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  fontWeight: 600
                }
              }}
            >
              {TAB_FILTERS.map((filter, index) => (
                <Tab 
                  key={filter.value}
                  label={`${filter.label} (${exams.length})`}
                  id={`exam-tab-${index}`}
                />
              ))}
            </Tabs>

            {/* Tab Panels */}
            <Box sx={{ p: 3, minHeight: 400 }}>
              {TAB_FILTERS.map((filter, index) => (
                <TabPanel key={filter.value} value={tabValue} index={index}>
                  {exams.length === 0 ? (
                    <Alert severity="info">
                      {filter.value === 'all' && 'Bạn chưa có bài kiểm tra nào từ các khóa học đã đăng ký.'}
                      {filter.value === 'ongoing' && 'Hiện không có bài kiểm tra nào đang mở.'}
                      {filter.value === 'upcoming' && 'Không có bài kiểm tra sắp diễn ra.'}
                      {filter.value === 'completed' && 'Bạn chưa hoàn thành bài kiểm tra nào.'}
                    </Alert>
                  ) : (
                    exams.map(exam => (
                      <ExamCard
                        key={exam.examId}
                        exam={exam}
                        onStartExam={handleStartExam}
                        onViewResult={handleViewResult}
                      />
                    ))
                  )}
                </TabPanel>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ExamsPage;