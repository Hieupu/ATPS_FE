import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Assignment, Schedule, CheckCircle, AccessTime } from '@mui/icons-material';
import { getCourseAssignmentsApi, submitAssignmentApi } from '../../../apiServices/courseService';

const AssignmentList = ({ courseId }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const response = await getCourseAssignmentsApi(courseId);
        setAssignments(response.assignments || []);
      } catch (error) {
        console.error("Error fetching assignments:", error);
        setError(error.message || "Failed to load assignments");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchAssignments();
    }
  }, [courseId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'success';
      case 'late': return 'error';
      case 'not_submitted': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'submitted': return 'Đã nộp';
      case 'late': return 'Nộp trễ';
      case 'not_submitted': return 'Chưa nộp';
      default: return status;
    }
  };

  const handleSubmitClick = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmitDialogOpen(true);
  };

  const handleSubmitAssignment = async (submissionData) => {
    try {
      await submitAssignmentApi(selectedAssignment.AssignmentID, submissionData);
      // Refresh assignments list
      const response = await getCourseAssignmentsApi(courseId);
      setAssignments(response.assignments || []);
      setSubmitDialogOpen(false);
      setSelectedAssignment(null);
    } catch (error) {
      console.error("Submit assignment error:", error);
      alert(error.message || "Failed to submit assignment");
    }
  };

  const isAssignmentOverdue = (deadline) => {
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <Alert severity="info">
        Chưa có bài tập nào được giao cho khóa học này.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Bài tập ({assignments.length})
      </Typography>
      <Grid container spacing={3}>
        {assignments.map((assignment) => (
          <Grid item xs={12} key={assignment.AssignmentID}>
            <Card 
              variant="outlined"
              sx={{ 
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 2,
                  borderColor: 'primary.main'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                    <Assignment sx={{ mr: 2, mt: 0.5, color: 'primary.main' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {assignment.Title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {assignment.Description}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip 
                    label={assignment.Type} 
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Schedule sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      Hạn nộp: {new Date(assignment.Deadline).toLocaleDateString('vi-VN')}
                      {isAssignmentOverdue(assignment.Deadline) && (
                        <Chip 
                          label="Quá hạn" 
                          color="error" 
                          size="small" 
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                  </Box>
                  
                  {assignment.Submission ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircle sx={{ mr: 1, fontSize: 18, color: 'success.main' }} />
                      <Chip 
                        label={getStatusText(assignment.Submission.Status)} 
                        color={getStatusColor(assignment.Submission.Status)}
                        size="small"
                      />
                      {assignment.Submission.Score !== null && (
                        <Typography variant="body2" sx={{ ml: 1, fontWeight: 600 }}>
                          Điểm: {assignment.Submission.Score}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ mr: 1, fontSize: 18, color: 'warning.main' }} />
                      <Chip 
                        label="Chưa nộp" 
                        color="warning"
                        size="small"
                      />
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={() => handleSubmitClick(assignment)}
                    disabled={isAssignmentOverdue(assignment.Deadline) && !assignment.Submission}
                  >
                    {assignment.Submission ? 'Xem bài nộp' : 'Nộp bài'}
                  </Button>
                  
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

                {assignment.MaxDuration && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      ⏱️ Thời gian tối đa: {assignment.MaxDuration} phút
                    </Typography>
                  </Box>
                )}

                {assignment.Submission?.Feedback && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Nhận xét từ giảng viên:
                    </Typography>
                    <Typography variant="body2">
                      {assignment.Submission.Feedback}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog nộp bài (có thể phát triển thêm) */}
      <Dialog 
        open={submitDialogOpen} 
        onClose={() => setSubmitDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedAssignment?.Submission ? 'Bài nộp của bạn' : 'Nộp bài tập'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Tính năng nộp bài tập sẽ được phát triển ở phiên bản tiếp theo...
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialogOpen(false)}>Đóng</Button>
          {!selectedAssignment?.Submission && (
            <Button variant="contained" onClick={handleSubmitAssignment}>
              Nộp bài
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignmentList;