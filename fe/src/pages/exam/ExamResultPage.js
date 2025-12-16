import React, { useEffect, useState } from 'react';
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
  Grid,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  EmojiEvents,
  CheckCircle,
  Cancel,
  ArrowBack,
  Refresh,
  Visibility,
  HourglassEmpty,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import AppHeader from '../../components/Header/AppHeader';
import {
  getExamResultApi,
  getExamReviewApi,
  retryExamApi,
  formatDurationText,
  getSubmissionStatusText,
  getSubmissionStatusColor,
} from '../../apiServices/learnerExamService';

const ExamResultPage = () => {
  const { instanceId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState(null);

  const loadResult = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getExamResultApi(instanceId);
      setResult(data);

      try {
        const review = await getExamReviewApi(instanceId);
        setReviewData(review);
      } catch (reviewErr) {
        console.warn('Could not load review data:', reviewErr);
      }

      if (!data || (!data.score && data.score !== 0)) {
        console.warn('No result data available yet');
      }
    } catch (err) {
      console.error('Load result error:', err);
      setError(err.response?.data?.message || err.message || 'Không thể tải kết quả bài thi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (instanceId) {
      loadResult();
    }
  }, [instanceId]);

  const handleRetry = async () => {
    if (!window.confirm('Bạn muốn làm lại bài thi này?')) return;

    try {
      setRetrying(true);
      await retryExamApi(instanceId);
      navigate(`/exam/${instanceId}/take`, { replace: true });
    } catch (err) {
      alert(err.message || 'Không thể reset bài thi');
    } finally {
      setRetrying(false);
    }
  };

  const handleViewReview = () => {
    navigate(`/exam/${instanceId}/review`);
  };

  return (
    <>
      <AppHeader />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Quay lại
        </Button>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Đang tải kết quả...</Typography>
          </Box>
        )}

        {!loading && error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <Button size="small" onClick={loadResult} sx={{ ml: 2 }}>
              Thử lại
            </Button>
          </Alert>
        )}

        {!loading && !error && result && (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmojiEvents sx={{ mr: 1 }} color="warning" />
                  <Typography variant="h6" fontWeight={600}>
                    {result.examTitle || 'Kết quả bài thi'}
                  </Typography>
                </Box>

                {result.isLate && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Bài nộp muộn - Status: {getSubmissionStatusText(result.submissionStatus)}
                  </Alert>
                )}

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Điểm
                    </Typography>
                    {reviewData && reviewData.summary ? (
                      <>
                        <Typography variant="h5" fontWeight={700}>
                          {reviewData.summary.totalEarnedPoints}/{reviewData.summary.totalMaxPoints}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={result.score ? parseFloat(result.score) : 0}
                          sx={{ mt: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {result.score}%
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography variant="h5" fontWeight={700}>
                          {result.score ? `${result.score}%` : '—'}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={result.score ? parseFloat(result.score) : 0}
                          sx={{ mt: 1 }}
                        />
                      </>
                    )}
                  </Grid>

                  {result.durationSec && (
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Thời gian làm bài
                      </Typography>
                      <Typography variant="h5">
                        {formatDurationText(result.durationSec)}
                      </Typography>
                    </Grid>
                  )}

                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Trạng thái
                    </Typography>
                    <Chip
                      label={getSubmissionStatusText(result.submissionStatus || 'submitted')}
                      color={getSubmissionStatusColor(result.submissionStatus || 'submitted')}
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                </Grid>

                {reviewData && reviewData.summary && (
                  <>
                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                      Thống kê chi tiết
                    </Typography>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                          <Typography variant="h4" fontWeight={700} color="primary">
                            {reviewData.summary.totalQuestions}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tổng số câu
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                          <Typography variant="h4" fontWeight={700} color="success.main">
                            {reviewData.summary.correctAnswers}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Câu đúng
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
                          <Typography variant="h4" fontWeight={700} color="error.main">
                            {reviewData.summary.totalQuestions - reviewData.summary.correctAnswers}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Câu sai
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fff3e0', borderRadius: 1 }}>
                          <Typography variant="h4" fontWeight={700} color="warning.main">
                            {reviewData.summary.accuracy}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Độ chính xác
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </>
                )}

                {result.submissionDate && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Thời gian nộp bài: {new Date(result.submissionDate).toLocaleString('vi-VN')}
                  </Typography>
                )}

                <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Visibility />}
                    onClick={handleViewReview}
                  >
                    Xem chi tiết
                  </Button>

                  {result.remainingAttempt > 0 && (
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<Refresh />}
                      onClick={handleRetry}
                      disabled={retrying}
                    >
                      Làm lại bài ({result.remainingAttempt} lượt còn lại)
                    </Button>
                  )}

                  {result.remainingAttempt === 0 && (
                    <Button variant="outlined" color="error" disabled>
                      Đã hết lượt làm bài
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </>
  );
};

export default ExamResultPage;