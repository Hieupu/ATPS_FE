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
  const [scoreDetails, setScoreDetails] = useState(null);

  const calculateAccuracy = (reviewData) => {

    if (reviewData && reviewData.summary) {
      const { totalEarnedPoints, totalMaxPoints } = reviewData.summary; 
      if (totalMaxPoints > 0) {
        const percentage = ((totalEarnedPoints / totalMaxPoints) * 100).toFixed(2);
        
        const result = {
          earnedPoints: totalEarnedPoints,
          totalPoints: totalMaxPoints,
          percentage
        };
        return result;
      }
    }
    
    if (!reviewData || !reviewData.questions || reviewData.questions.length === 0) {
      return null;
    }

    let totalPoints = 0;
    let earnedPoints = 0;

    reviewData.questions.forEach((question, index) => {
      const questionPoints = question.point || question.weight || 1;
      const isCorrect = question.isCorrect || question.correct;
      
      totalPoints += questionPoints;
      if (isCorrect) {
        earnedPoints += questionPoints;
      }
    });

    if (totalPoints === 0) return null;
    
    const percentage = ((earnedPoints / totalPoints) * 100).toFixed(2);
    
    const result = {
      earnedPoints,
      totalPoints,
      percentage
    };
    return result;
  };

  const loadResult = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getExamResultApi(instanceId);
      setResult(data);

      try {
        const review = await getExamReviewApi(instanceId);
        setReviewData(review);
        
        const calculatedScore = calculateAccuracy(review);
        if (calculatedScore) {
          setScoreDetails(calculatedScore);
          setResult(prev => ({
            ...prev,
            score: calculatedScore.percentage,
            originalScore: data.score 
          }));
        }
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
      alert(err.message || "Không thể reset bài thi");
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
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
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
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Điểm số
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
                      {scoreDetails ? (
                        <>
                          <Typography variant="h4" fontWeight={700} color="primary">
                            {scoreDetails.earnedPoints}
                          </Typography>
                          <Typography variant="h5" color="text.secondary">
                            / {scoreDetails.totalPoints}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="h4" fontWeight={700}>
                          —
                        </Typography>
                      )}
                    </Box>
                  
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Độ chính xác
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="success.main" sx={{ mt: 0.5 }}>
                      {result.score ? `${result.score}%` : '—'}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={result.score ? parseFloat(result.score) : 0}
                      sx={{ mt: 1, height: 8, borderRadius: 1 }}
                    />
                  </Grid>

                  {result.durationSec && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Thời gian làm bài
                      </Typography>
                      <Typography variant="h5" sx={{ mt: 0.5 }}>
                        {formatDurationText(result.durationSec)}
                      </Typography>
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
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

                <Divider sx={{ my: 2 }} />

                {result.submissionDate && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    <strong>Thời gian nộp bài:</strong> {new Date(result.submissionDate).toLocaleString('vi-VN')}
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