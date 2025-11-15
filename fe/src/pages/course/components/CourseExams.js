import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Quiz,
  AccessTime,
  EmojiEvents,
  Psychology,
  Schedule,
} from '@mui/icons-material';
import { 
  getExamsByCourseApi, 
  getExamQuestionsApi, 
  submitExamApi,
  getMyLatestExamResultApi 
} from "../../../apiServices/examService";

const ExamCard = ({ exam, latestResult, onStartExam }) => {
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

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
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
                <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2">
                  Bắt đầu: {formatDateTime(exam.StartTime)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2">
                  Kết thúc: {formatDateTime(exam.EndTime)}
                </Typography>
              </Box>
              {exam.Duration && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Psychology sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    Thời gian: {exam.Duration} phút
                  </Typography>
                </Box>
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
        <Button
          variant="contained"
          fullWidth
          startIcon={<Quiz />}
          onClick={() => onStartExam(exam)}
          disabled={statusInfo.status === 'closed' && !latestResult}
          color={latestResult ? 'secondary' : 'primary'}
        >
          {latestResult ? 'Làm lại bài thi' : 'Bắt đầu thi'}
        </Button>
      </CardContent>
    </Card>
  );
};

const ExamDialog = ({ 
  open, 
  exam, 
  questions, 
  answers, 
  onChangeAnswer,
  onSubmit,
  onClose,
  submitting,
  examResult 
}) => {
  const [timeLeft, setTimeLeft] = useState(exam?.Duration * 60 || 0);

  useEffect(() => {
    if (!open || !exam?.Duration) return;

    setTimeLeft(exam.Duration * 60);
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onSubmit(); // Auto submit when time's up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, exam, onSubmit]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {exam?.Title}
          </Typography>
          {exam?.Duration && (
            <Chip 
              icon={<AccessTime />}
              label={formatTime(timeLeft)}
              color={timeLeft < 300 ? 'error' : 'primary'}
              variant="filled"
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {examResult ? (
          // Show exam result
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <EmojiEvents sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
              {examResult.Score ?? examResult.score}%
            </Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {examResult.Feedback ?? examResult.feedback}
            </Typography>
            <Chip 
              label={(examResult.Score ?? examResult.score) >= 50 ? 'Chúc mừng bạn đã vượt qua bài thi!' : 'Cần cố gắng thêm!'} 
              color={(examResult.Score ?? examResult.score) >= 50 ? 'success' : 'error'}
              sx={{ fontSize: '1rem', py: 2 }}
            />
          </Box>
        ) : (
          // Show exam questions
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {questions.map((question, index) => (
              <Paper
                key={question.QuestionID}
                elevation={1}
                sx={{
                  p: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Câu {index + 1}: {question.Content}
                </Typography>
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  placeholder="Nhập câu trả lời của bạn..."
                  value={answers[question.QuestionID] || ''}
                  onChange={(e) => onChangeAnswer(question.QuestionID, e.target.value)}
                  helperText={`${(answers[question.QuestionID] || '').length} ký tự`}
                />
              </Paper>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {examResult ? 'Đóng' : 'Hủy'}
        </Button>
        {!examResult && (
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? 'Đang nộp...' : 'Nộp bài'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const CourseExams = ({ courseId }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examDialogOpen, setExamDialogOpen] = useState(false);
  const [activeExam, setActiveExam] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [latestExamResults, setLatestExamResults] = useState({});

  const fetchExams = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getExamsByCourseApi(courseId);
      const examsList = data.exams || [];
      setExams(examsList);

      // Fetch latest results for each exam
      const results = {};
      for (const exam of examsList) {
        try {
          const result = await getMyLatestExamResultApi(exam.ExamID);
          results[exam.ExamID] = result.result || null;
        } catch (err) {
          results[exam.ExamID] = null;
        }
      }
      setLatestExamResults(results);
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError(err.message || 'Không thể tải danh sách bài thi');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleStartExam = async (exam) => {
    setActiveExam(exam);
    setExamResult(null);
    setAnswers({});
    
    try {
      const data = await getExamQuestionsApi(exam.ExamID);
      setExamQuestions(data.questions || []);
      setExamDialogOpen(true);
    } catch (err) {
      console.error('Error fetching exam questions:', err);
      setExamQuestions([]);
      setExamDialogOpen(true);
    }
  };

  const handleChangeAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitExam = async () => {
    if (!activeExam) return;

    try {
      setSubmitting(true);
      const payload = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: Number(questionId),
        answer,
      }));

      const data = await submitExamApi(activeExam.ExamID, payload);
      setExamResult(data.result || null);
      
      // Update latest result
      if (data.result) {
        setLatestExamResults(prev => ({
          ...prev,
          [activeExam.ExamID]: data.result,
        }));
      }
    } catch (err) {
      console.error('Error submitting exam:', err);
      setExamResult({ 
        Score: 0, 
        Feedback: 'Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseExamDialog = () => {
    setExamDialogOpen(false);
    setActiveExam(null);
    setExamQuestions([]);
    setAnswers({});
    setExamResult(null);
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
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Bài kiểm tra ({exams.length} bài)
      </Typography>

      {exams.length === 0 ? (
        <Alert severity="info">
          Chưa có bài kiểm tra nào cho khóa học này.
        </Alert>
      ) : (
        <Box>
          {exams.map(exam => (
            <ExamCard
              key={exam.ExamID}
              exam={exam}
              latestResult={latestExamResults[exam.ExamID]}
              onStartExam={handleStartExam}
            />
          ))}
        </Box>
      )}

      {/* Exam Dialog */}
      <ExamDialog
        open={examDialogOpen}
        exam={activeExam}
        questions={examQuestions}
        answers={answers}
        onChangeAnswer={handleChangeAnswer}
        onSubmit={handleSubmitExam}
        onClose={handleCloseExamDialog}
        submitting={submitting}
        examResult={examResult}
      />
    </Box>
  );
};

export default CourseExams;