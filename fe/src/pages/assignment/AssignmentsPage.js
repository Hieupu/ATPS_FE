// pages/AssignmentsPage.js
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { 
  Assignment, 
  Schedule, 
  CheckCircle, 
  AccessTime,
  Description 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../../components/Header/AppHeader';
import { getMyEnrolledCourses } from '../../apiServices/courseService';
import { getCourseAssignmentsApi, submitAssignmentApi } from '../../apiServices/courseService';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`assignment-tabpanel-${index}`}
    aria-labelledby={`assignment-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

// Sửa phần AssignmentCard component
const AssignmentCard = ({ assignment, course, onViewSubmission, onSubmitAssignment }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'success';
      case 'late': return 'error';
      case 'not_submitted': return 'warning';
      case 'graded': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'submitted': return 'Đã nộp';
      case 'late': return 'Nộp trễ';
      case 'not_submitted': return 'Chưa nộp';
      case 'graded': return 'Đã chấm';
      default: return status;
    }
  };

  const isAssignmentOverdue = (deadline) => {
    return new Date(deadline) < new Date();
  };

  const isAssignmentActive = (deadline) => {
    return new Date(deadline) > new Date();
  };

  const getAssignmentStatus = (assignment) => {
    // Sửa: Kiểm tra assignment.Submission tồn tại và không null
    if (assignment.Submission) {
      // Sửa: Kiểm tra Score tồn tại và không null
      if (assignment.Submission.Score !== null && assignment.Submission.Score !== undefined) {
        return 'graded';
      }
      return isAssignmentOverdue(assignment.Deadline) ? 'late' : 'submitted';
    }
    return isAssignmentOverdue(assignment.Deadline) ? 'late' : 'not_submitted';
  };

  const status = getAssignmentStatus(assignment);
  const isOverdue = isAssignmentOverdue(assignment.Deadline);
  const isActive = isAssignmentActive(assignment.Deadline);

  // Sửa: Kiểm tra assignment.Submission tồn tại trước khi truy cập
  const hasSubmission = assignment.Submission && typeof assignment.Submission === 'object';
  const submissionScore = hasSubmission ? assignment.Submission.Score : null;
  const submissionFeedback = hasSubmission ? assignment.Submission.Feedback : null;
  const submittedAt = hasSubmission ? assignment.Submission.SubmittedAt : null;
  const submissionFileUrl = hasSubmission ? assignment.Submission.FileURL : null;

  const handleCourseClick = () => {
    navigate(`/my-courses/${course.CourseID}`);
  };

  return (
    <Card sx={{ mb: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
      <CardContent>
        {/* Course Info */}
        <Box 
          sx={{ 
            mb: 2, 
            p: 2, 
            bgcolor: 'grey.50', 
            borderRadius: 1, 
            cursor: 'pointer',
            border: '1px solid',
            borderColor: 'divider'
          }} 
          onClick={handleCourseClick}
        >
          <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 600 }}>
            {course.Title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {course.InstructorName || 'Giảng viên'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Assignment sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {assignment.Title}
              </Typography>
              <Chip 
                label={assignment.Type} 
                color="primary"
                variant="outlined"
                size="small"
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              {assignment.Description}
            </Typography>

            {/* Assignment Details */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2">
                  Hạn nộp: {new Date(assignment.Deadline).toLocaleDateString('vi-VN')}
                  {isOverdue && !hasSubmission && (
                    <Chip 
                      label="Quá hạn" 
                      color="error" 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
              </Box>
              
              {/* Status */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {status === 'submitted' || status === 'graded' ? (
                  <CheckCircle sx={{ mr: 1, fontSize: 18, color: 'success.main' }} />
                ) : (
                  <AccessTime sx={{ mr: 1, fontSize: 18, color: 'warning.main' }} />
                )}
                <Chip 
                  label={getStatusText(status)} 
                  color={getStatusColor(status)}
                  size="small"
                />
                {/* Sửa: Chỉ hiển thị điểm nếu có */}
                {submissionScore !== null && submissionScore !== undefined && (
                  <Typography variant="body2" sx={{ ml: 1, fontWeight: 600, color: 'primary.main' }}>
                    Điểm: {submissionScore}
                  </Typography>
                )}
              </Box>

              {/* Max Duration */}
              {assignment.MaxDuration && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTime sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    Thời gian: {assignment.MaxDuration} phút
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {hasSubmission ? (
            <Button 
              variant="contained" 
              startIcon={<Description />}
              onClick={() => onViewSubmission(assignment)}
            >
              Xem bài nộp
            </Button>
          ) : (
            <Button 
              variant="contained" 
              startIcon={<Assignment />}
              onClick={() => onSubmitAssignment(assignment)}
              disabled={isOverdue}
              color={isOverdue ? "error" : "primary"}
            >
              {isOverdue ? 'Đã quá hạn' : 'Nộp bài'}
            </Button>
          )}
          
          {assignment.FileURL && (
            <Button 
              variant="outlined" 
              size="small"
              component="a"
              href={assignment.FileURL}
              target="_blank"
            >
              Tải đề bài
            </Button>
          )}

          {assignment.MediaURL && (
            <Button 
              variant="outlined" 
              size="small"
              component="a"
              href={assignment.MediaURL}
              target="_blank"
            >
              Xem tài liệu
            </Button>
          )}
        </Box>

        {/* Instructor Feedback - Sửa: Chỉ hiển thị nếu có feedback */}
        {submissionFeedback && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: 'success.light', 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'success.main'
          }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'success.dark' }}>
              Nhận xét từ giảng viên:
            </Typography>
            <Typography variant="body2" color="success.dark">
              {submissionFeedback}
            </Typography>
          </Box>
        )}

        {/* Submission Details - Sửa: Chỉ hiển thị nếu có submission */}
        {hasSubmission && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Thông tin bài nộp:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Thời gian nộp: {submittedAt ? new Date(submittedAt).toLocaleString('vi-VN') : 'Không xác định'}
            </Typography>
            {submissionFileUrl && (
              <Button 
                variant="text" 
                size="small"
                component="a"
                href={submissionFileUrl}
                target="_blank"
                sx={{ mt: 1 }}
              >
                Xem file đã nộp
              </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const SubmitAssignmentDialog = ({ 
  open, 
  assignment, 
  course, 
  onClose, 
  onSubmit 
}) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      // Mock submission data - bạn có thể thay bằng form thực tế
      const submissionData = {
        answer: "Bài làm của học viên...",
        fileUrl: "https://example.com/submission.pdf"
      };
      await onSubmit(assignment.AssignmentID, submissionData);
      onClose();
    } catch (error) {
      console.error("Submit error:", error);
      alert(error.message || "Lỗi khi nộp bài");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Nộp bài tập: {assignment?.Title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" paragraph>
          Khóa học: <strong>{course?.Title}</strong>
        </Typography>
        <Typography variant="body2" paragraph>
          {assignment?.Description}
        </Typography>
        
        {/* Form nộp bài - có thể phát triển thêm */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Tính năng nộp bài tập chi tiết sẽ được phát triển ở phiên bản tiếp theo.
            Hiện tại bạn có thể nộp bài bằng cách nhấn "Xác nhận nộp bài".
          </Typography>
        </Box>

        {assignment?.FileURL && (
          <Button 
            variant="outlined" 
            component="a"
            href={assignment.FileURL}
            target="_blank"
            sx={{ mt: 2 }}
          >
            Tải đề bài
          </Button>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Đang nộp...' : 'Xác nhận nộp bài'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AssignmentsPage = () => {
  const [courses, setCourses] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchAssignmentsData();
  }, []);

  const fetchAssignmentsData = async () => {
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

      // Lấy tất cả assignments từ các khóa học
      const assignmentsWithCourses = [];

      for (const course of enrolledCourses) {
        try {
          const assignmentsData = await getCourseAssignmentsApi(course.CourseID);
          const assignments = assignmentsData.assignments || assignmentsData || [];

          assignments.forEach(assignment => {
            assignmentsWithCourses.push({
              ...assignment,
              course: course
            });
          });
        } catch (err) {
          console.error(`Error fetching assignments for course ${course.CourseID}:`, err);
        }
      }

      setAllAssignments(assignmentsWithCourses);
    } catch (err) {
      console.error('Error fetching assignments data:', err);
      setError(err.message || 'Không thể tải danh sách bài tập');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSubmitAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setSelectedCourse(assignment.course);
    setSubmitDialogOpen(true);
  };

  const handleViewSubmission = (assignment) => {
    // Có thể mở dialog xem chi tiết bài nộp
    alert(`Xem bài nộp cho: ${assignment.Title}`);
  };

  const handleSubmitConfirm = async (assignmentId, submissionData) => {
    try {
      await submitAssignmentApi(assignmentId, submissionData);
      // Refresh data
      await fetchAssignmentsData();
      setSubmitDialogOpen(false);
      setSelectedAssignment(null);
      setSelectedCourse(null);
    } catch (error) {
      console.error("Submit assignment error:", error);
      throw error;
    }
  };

  const handleCloseDialog = () => {
    setSubmitDialogOpen(false);
    setSelectedAssignment(null);
    setSelectedCourse(null);
  };

  // Phân loại assignments
  const activeAssignments = allAssignments.filter(assignment => {
    const deadline = new Date(assignment.Deadline);
    const now = new Date();
    return deadline > now && !assignment.Submission;
  });

  const submittedAssignments = allAssignments.filter(assignment => 
    assignment.Submission
  );

  const overdueAssignments = allAssignments.filter(assignment => {
    const deadline = new Date(assignment.Deadline);
    const now = new Date();
    return deadline < now && !assignment.Submission;
  });

  const gradedAssignments = allAssignments.filter(assignment => 
    assignment.Submission?.Score !== null
  );

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
            Bài Tập Của Tôi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý và nộp tất cả bài tập từ các khóa học đã đăng ký
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <Card sx={{ flex: 1, minWidth: 200, bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {allAssignments.length}
              </Typography>
              <Typography variant="body2">
                Tổng số bài tập
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ flex: 1, minWidth: 200, bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {submittedAssignments.length}
              </Typography>
              <Typography variant="body2">
                Đã nộp
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ flex: 1, minWidth: 200, bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {activeAssignments.length}
              </Typography>
              <Typography variant="body2">
                Cần nộp
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ flex: 1, minWidth: 200, bgcolor: 'error.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {overdueAssignments.length}
              </Typography>
              <Typography variant="body2">
                Quá hạn
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Tabs */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="assignment tabs"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                px: 2
              }}
            >
              <Tab 
                label={`Tất cả (${allAssignments.length})`}
                id="assignment-tab-0"
              />
              <Tab 
                label={`Cần nộp (${activeAssignments.length})`}
                id="assignment-tab-1"
              />
              <Tab 
                label={`Đã nộp (${submittedAssignments.length})`}
                id="assignment-tab-2"
              />
              <Tab 
                label={`Đã chấm (${gradedAssignments.length})`}
                id="assignment-tab-3"
              />
              <Tab 
                label={`Quá hạn (${overdueAssignments.length})`}
                id="assignment-tab-4"
              />
            </Tabs>

            {/* Tab Panels */}
            <Box sx={{ p: 3 }}>
              <TabPanel value={tabValue} index={0}>
                {allAssignments.length === 0 ? (
                  <Alert severity="info">
                    Bạn chưa có bài tập nào từ các khóa học đã đăng ký.
                  </Alert>
                ) : (
                  allAssignments.map(assignment => (
                    <AssignmentCard
                      key={`${assignment.AssignmentID}-${assignment.course.CourseID}`}
                      assignment={assignment}
                      course={assignment.course}
                      onViewSubmission={handleViewSubmission}
                      onSubmitAssignment={handleSubmitAssignment}
                    />
                  ))
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                {activeAssignments.length === 0 ? (
                  <Alert severity="success">
                    Tuyệt vời! Bạn không có bài tập nào cần nộp.
                  </Alert>
                ) : (
                  activeAssignments.map(assignment => (
                    <AssignmentCard
                      key={`${assignment.AssignmentID}-${assignment.course.CourseID}`}
                      assignment={assignment}
                      course={assignment.course}
                      onViewSubmission={handleViewSubmission}
                      onSubmitAssignment={handleSubmitAssignment}
                    />
                  ))
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                {submittedAssignments.length === 0 ? (
                  <Alert severity="info">
                    Bạn chưa nộp bài tập nào.
                  </Alert>
                ) : (
                  submittedAssignments.map(assignment => (
                    <AssignmentCard
                      key={`${assignment.AssignmentID}-${assignment.course.CourseID}`}
                      assignment={assignment}
                      course={assignment.course}
                      onViewSubmission={handleViewSubmission}
                      onSubmitAssignment={handleSubmitAssignment}
                    />
                  ))
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                {gradedAssignments.length === 0 ? (
                  <Alert severity="info">
                    Chưa có bài tập nào được chấm điểm.
                  </Alert>
                ) : (
                  gradedAssignments.map(assignment => (
                    <AssignmentCard
                      key={`${assignment.AssignmentID}-${assignment.course.CourseID}`}
                      assignment={assignment}
                      course={assignment.course}
                      onViewSubmission={handleViewSubmission}
                      onSubmitAssignment={handleSubmitAssignment}
                    />
                  ))
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={4}>
                {overdueAssignments.length === 0 ? (
                  <Alert severity="success">
                    Tuyệt vời! Bạn không có bài tập nào quá hạn.
                  </Alert>
                ) : (
                  overdueAssignments.map(assignment => (
                    <AssignmentCard
                      key={`${assignment.AssignmentID}-${assignment.course.CourseID}`}
                      assignment={assignment}
                      course={assignment.course}
                      onViewSubmission={handleViewSubmission}
                      onSubmitAssignment={handleSubmitAssignment}
                    />
                  ))
                )}
              </TabPanel>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Submit Dialog */}
      <SubmitAssignmentDialog
        open={submitDialogOpen}
        assignment={selectedAssignment}
        course={selectedCourse}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitConfirm}
      />
    </Box>
  );
};

export default AssignmentsPage;