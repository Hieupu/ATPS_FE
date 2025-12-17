import React, { useEffect, useState } from "react";
import {
  Box,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { EmojiEvents, Visibility, Refresh, Close } from "@mui/icons-material";

// --- IMPORT CHUẨN ---
import {
  getExamResultApi,
  getExamReviewApi,
  retryExamApi,
  formatDurationText,
  getSubmissionStatusText,
  getSubmissionStatusColor,
} from "../../../apiServices/learnerExamService";
// --------------------

const AssignmentResultDialog = ({
  open,
  onClose,
  assignmentId,
  onViewReview,
  onRetry,
}) => {
  const [result, setResult] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState(null);

  const loadResult = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getExamResultApi(assignmentId);
      setResult(data);

      try {
        const review = await getExamReviewApi(assignmentId);
        setReviewData(review);
      } catch (reviewErr) {
        console.warn("Could not load review data:", reviewErr);
      }
    } catch (err) {
      console.error("Load result error:", err);
      setError(
        err.response?.data?.message || err.message || "Không thể tải kết quả"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && assignmentId) {
      loadResult();
    }
  }, [open, assignmentId]);

  const handleRetry = async () => {
    if (!window.confirm("Bạn muốn làm lại bài tập này?")) return;

    try {
      setRetrying(true);
      await retryExamApi(assignmentId);
      // Gọi callback để cha xử lý (ví dụ: mở lại Dialog làm bài)
      if (onRetry) onRetry();
      onClose();
    } catch (err) {
      alert(err.message || "Không thể reset bài thi");
    } finally {
      setRetrying(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Kết quả bài làm
        <Button onClick={onClose} sx={{ minWidth: "auto" }}>
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: "#f5f5f5", py: 3 }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
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
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <EmojiEvents sx={{ mr: 1, fontSize: 30 }} color="warning" />
                <Typography variant="h5" fontWeight={600}>
                  {result.examTitle || "Kết quả bài tập"}
                </Typography>
              </Box>

              {result.isLate && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Nộp muộn - Trạng thái:{" "}
                  {getSubmissionStatusText(result.submissionStatus)}
                </Alert>
              )}

              <Grid container spacing={2} sx={{ mb: 3 }}>
                {/* Score Section */}
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Điểm số
                  </Typography>
                  {reviewData && reviewData.summary ? (
                    <>
                      <Typography variant="h4" fontWeight={700} color="primary">
                        {reviewData.summary.totalEarnedPoints}/
                        {reviewData.summary.totalMaxPoints}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={result.score ? parseFloat(result.score) : 0}
                        sx={{ mt: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {result.score}%
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="h4" fontWeight={700}>
                      {result.score ? `${result.score}%` : "—"}
                    </Typography>
                  )}
                </Grid>

                {/* Duration Section */}
                {result.durationSec !== undefined && (
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Thời gian làm bài
                    </Typography>
                    <Typography variant="h5">
                      {formatDurationText(result.durationSec)}
                    </Typography>
                  </Grid>
                )}

                {/* Status Section */}
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trạng thái
                  </Typography>
                  <Chip
                    label={getSubmissionStatusText(
                      result.submissionStatus || "submitted"
                    )}
                    color={getSubmissionStatusColor(
                      result.submissionStatus || "submitted"
                    )}
                    sx={{ mt: 1, fontWeight: "bold" }}
                  />
                </Grid>
              </Grid>

              {reviewData && reviewData.summary && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ mb: 2 }}
                  >
                    Thống kê chi tiết
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <StatsBox
                      value={reviewData.summary.totalQuestions}
                      label="Tổng câu hỏi"
                      color="primary"
                      bg="#e3f2fd"
                    />
                    <StatsBox
                      value={reviewData.summary.correctAnswers}
                      label="Câu đúng"
                      color="success.main"
                      bg="#e8f5e9"
                    />
                    <StatsBox
                      value={
                        reviewData.summary.totalQuestions -
                        reviewData.summary.correctAnswers
                      }
                      label="Câu sai"
                      color="error.main"
                      bg="#ffebee"
                    />
                    <StatsBox
                      value={`${reviewData.summary.accuracy}%`}
                      label="Độ chính xác"
                      color="warning.main"
                      bg="#fff3e0"
                    />
                  </Grid>
                </>
              )}

              {result.submissionDate && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2, textAlign: "right" }}
                >
                  Nộp lúc:{" "}
                  {new Date(result.submissionDate).toLocaleString("vi-VN")}
                </Typography>
              )}
            </CardContent>
          </Card>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {result && (
          <>
            {result.remainingAttempt > 0 ? (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Refresh />}
                onClick={handleRetry}
                disabled={retrying}
              >
                Làm lại ({result.remainingAttempt} lượt)
              </Button>
            ) : (
              <Button variant="outlined" color="error" disabled>
                Hết lượt làm lại
              </Button>
            )}

            <Button
              variant="contained"
              color="primary"
              startIcon={<Visibility />}
              onClick={() => onViewReview && onViewReview(assignmentId)}
            >
              Xem chi tiết bài làm
            </Button>
          </>
        )}
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

// Component con hiển thị hộp thống kê nhỏ
const StatsBox = ({ value, label, color, bg }) => (
  <Grid item xs={6} sm={3}>
    <Box sx={{ textAlign: "center", p: 2, bgcolor: bg, borderRadius: 2 }}>
      <Typography variant="h5" fontWeight={700} sx={{ color: color }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  </Grid>
);

export default AssignmentResultDialog;
