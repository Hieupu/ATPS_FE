// pages/ExamResultPage.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  LinearProgress,
  Paper,
  Divider,
  Grid,
} from '@mui/material';
import {
  EmojiEvents,
  CheckCircle,
  Cancel,
  ArrowBack,
  Refresh,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import AppHeader from '../../components/Header/AppHeader';
import {
  getExamResultApi,
  getDetailedAnswersApi,
  formatScore,
  QUESTION_TYPE_LABELS,
} from '../../apiServices/learnerExamService';

const QuestionReview = ({ number, question }) => {
  const isCorrect = question.isCorrect;
  const isObjective = ['multiple_choice', 'true_false', 'fill_in_blank'].includes(question.type);

  return (
    <Card
      sx={{
        mb: 2,
        border: '2px solid',
        borderColor: isCorrect ? 'success.main' : isObjective ? 'error.main' : 'grey.300',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Chip
            label={`Câu ${number}`}
            color={isCorrect ? 'success' : isObjective ? 'error' : 'default'}
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
              {question.content}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {QUESTION_TYPE_LABELS[question.type]} • {question.point} điểm
            </Typography>
          </Box>
          {isObjective && (
            <Chip
              icon={isCorrect ? <CheckCircle /> : <Cancel />}
              label={isCorrect ? 'Đúng' : 'Sai'}
              color={isCorrect ? 'success' : 'error'}
              size="small"
            />
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Câu trả lời của bạn:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: isCorrect ? 'success.main' : isObjective ? 'error.main' : 'text.primary',
                  fontWeight: 500,
                }}
              >
                {question.learnerAnswer || '(Không trả lời)'}
              </Typography>
            </Paper>
          </Grid>

          {isObjective && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: 'success.50' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Đáp án đúng:
                </Typography>
                <Typography variant="body2" sx={{ color: 'success.dark', fontWeight: 500 }}>
                  {question.correctAnswer}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Điểm: <strong>{isCorrect ? question.point : 0}</strong> / {question.point}
          </Typography>
          {!isObjective && (
            <Chip label="Cần chấm thủ công" size="small" color="info" />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const ExamResultPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [detailedAnswers, setDetailedAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResult();
  }, [examId]);

  const loadResult = async () => {
    try {
      setLoading(true);
      setError(null);

      const [resultData, answersData] = await Promise.all([
        getExamResultApi(examId),
        getDetailedAnswersApi(examId),
      ]);

      setResult(resultData);
      setDetailedAnswers(answersData);
    } catch (err) {
      console.error('Error loading result:', err);
      setError(err.message || 'Không thể tải kết quả bài thi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppHeader />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <LinearProgress />
          <Typography align="center" sx={{ mt: 2 }}>
            Đang tải kết quả...
          </Typography>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppHeader />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button onClick={() => navigate('/exams')} sx={{ mt: 2 }}>
            Quay lại danh sách bài thi
          </Button>
        </Container>
      </Box>
    );
  }

  if (!result) return null;

  const isPassed = result.score >= 50;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppHeader />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/exams')}
            sx={{ mb: 2 }}
          >
            Quay lại danh sách bài thi
          </Button>

          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            Kết quả bài thi
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {result.examTitle}
          </Typography>
        </Box>

        {/* Score Card */}
        <Card
          sx={{
            mb: 4,
            background: isPassed
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
          }}
        >
          <CardContent sx={{ py: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <EmojiEvents sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                {formatScore(result.score)}
              </Typography>
              <Chip
                icon={isPassed ? <CheckCircle /> : <Cancel />}
                label={isPassed ? 'ĐẠT' : 'CHƯA ĐẠT'}
                sx={{
                  bgcolor: 'white',
                  color: isPassed ? 'success.main' : 'error.main',
                  fontWeight: 600,
                  fontSize: '1rem',
                  px: 2,
                  py: 3,
                }}
              />
              <Typography variant="h6" sx={{ mt: 2, opacity: 0.9 }}>
                {result.feedback}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                Nộp bài lúc: {new Date(result.submissionDate).toLocaleString('vi-VN')}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Detailed Answers */}
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Chi tiết câu trả lời
        </Typography>

        {detailedAnswers.length === 0 ? (
          <Alert severity="info">Không có thông tin chi tiết câu trả lời</Alert>
        ) : (
          detailedAnswers.map((section) => (
            <Box key={section.sectionId} sx={{ mb: 4 }}>
              <Paper sx={{ p: 3, mb: 2, bgcolor: 'primary.50' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {section.sectionTitle}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {section.questions?.length || 0} câu hỏi
                </Typography>
              </Paper>

              {section.questions?.map((question, index) => (
                <QuestionReview
                  key={question.examquestionId}
                  number={index + 1}
                  question={question}
                />
              ))}
            </Box>
          ))
        )}

        {/* Actions */}
        <Paper sx={{ p: 3, textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/exams')}
            sx={{ mr: 2 }}
          >
            Quay lại danh sách
          </Button>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={() => navigate(`/exam/${examId}/take`)}
          >
            Làm lại bài thi
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default ExamResultPage;