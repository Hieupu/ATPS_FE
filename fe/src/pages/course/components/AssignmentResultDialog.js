import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
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
  IconButton,
} from "@mui/material";
import {
  EmojiEvents,
  Visibility,
  Refresh,
  Close,
  AccessTime,
  Assessment,
  PieChart,
} from "@mui/icons-material";
import {
  getExamResultApi,
  getExamReviewApi,
  formatDurationText,
  getSubmissionStatusText,
  getSubmissionStatusColor,
} from "../../../apiServices/learnerExamService";

const StatsBoxHorizontal = ({ value, label, color, bg }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      p: 1.5,
      bgcolor: bg,
      borderRadius: 2,
      border: "1px solid",
      borderColor: "divider",
      mb: 1,
    }}
  >
    <Typography variant="caption" fontWeight={700} color="text.secondary">
      {label}
    </Typography>
    <Typography
      variant="h6"
      fontWeight={800}
      sx={{ color: color, lineHeight: 1 }}
    >
      {value}
    </Typography>
  </Box>
);

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
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && assignmentId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const [res, rev] = await Promise.all([
            getExamResultApi(assignmentId),
            getExamReviewApi(assignmentId),
          ]);
          setResult(res);
          setReviewData(rev);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [open, assignmentId]);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, backgroundImage: "none" } }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Kết Quả Bài Tập
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, bgcolor: "#fcfcfc" }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 8,
            }}
          >
            <CircularProgress size={40} />
            <Typography sx={{ mt: 2 }} color="text.secondary">
              Đang tải kết quả...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : (
          <Grid container sx={{ minHeight: "350px" }}>
            <Grid
              item
              xs={12}
              md={5}
              sx={{
                p: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRight: { md: "1px solid #eee" },
                bgcolor: "white",
              }}
            >
              <EmojiEvents sx={{ fontSize: 70, color: "#ffb300", mb: 2 }} />
              <Typography
                variant="h5"
                fontWeight={800}
                align="center"
                gutterBottom
              >
                {result?.score >= 50 ? "Hoàn Thành!" : "Đã Kết Thúc"}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mb: 3 }}
              >
                {result?.examTitle}
              </Typography>

              <Box
                sx={{
                  width: "100%",
                  textAlign: "center",
                  p: 2,
                  bgcolor: "#f8faff",
                  borderRadius: 3,
                  border: "1px dashed #d0d7de",
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="primary"
                  sx={{ display: "block", mb: 0.5 }}
                >
                  ĐIỂM SỐ CHÍNH THỨC
                </Typography>
                <Typography variant="h3" fontWeight={900} color="primary.main">
                  {reviewData?.summary?.totalEarnedPoints}
                  <Typography
                    component="span"
                    variant="h5"
                    color="text.secondary"
                  >
                    /{reviewData?.summary?.totalMaxPoints}
                  </Typography>
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={result?.score || 0}
                  sx={{ height: 8, borderRadius: 4, mt: 1.5, mb: 1 }}
                />
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.secondary"
                >
                  Chính xác {result?.score}%
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={7} sx={{ p: 4 }}>
              <Typography
                variant="subtitle2"
                fontWeight={800}
                color="text.secondary"
                sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <PieChart fontSize="small" /> CHI TIẾT BÀI LÀM
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "white",
                      borderRadius: 2,
                      border: "1px solid #eee",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <AccessTime
                        sx={{ fontSize: 18, color: "text.secondary" }}
                      />
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color="text.secondary"
                      >
                        THỜI GIAN
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={800}>
                      {formatDurationText(result?.durationSec)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "white",
                      borderRadius: 2,
                      border: "1px solid #eee",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Assessment
                        sx={{ fontSize: 18, color: "text.secondary" }}
                      />
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color="text.secondary"
                      >
                        XẾP LOẠI
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      fontWeight={800}
                      color={
                        result?.score >= 50 ? "success.main" : "warning.main"
                      }
                    >
                      {result?.score >= 80
                        ? "Giỏi"
                        : result?.score >= 50
                        ? "Khá"
                        : "Trung bình"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <StatsBoxHorizontal
                  value={reviewData?.summary?.totalQuestions}
                  label="TỔNG CÂU HỎI"
                  color="#1976d2"
                  bg="#eff6ff"
                />
                <StatsBoxHorizontal
                  value={reviewData?.summary?.correctAnswers}
                  label="SỐ CÂU ĐÚNG"
                  color="#16a34a"
                  bg="#f0fdf4"
                />
                <StatsBoxHorizontal
                  value={
                    reviewData?.summary?.totalQuestions -
                    reviewData?.summary?.correctAnswers
                  }
                  label="SỐ CÂU SAI"
                  color="#dc2626"
                  bg="#fef2f2"
                />
                <StatsBoxHorizontal
                  value={getSubmissionStatusText(result?.submissionStatus)}
                  label="TRẠNG THÁI"
                  color="#4b5563"
                  bg="#f9fafb"
                />
              </Box>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, px: 4, gap: 2, bgcolor: "white" }}>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<Visibility />}
          onClick={() => onViewReview(assignmentId)}
          sx={{
            flex: 1,
            fontWeight: 700,
            borderRadius: 2,
            textTransform: "none",
            py: 1,
          }}
        >
          Xem lại bài
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Refresh />}
          onClick={onRetry}
          sx={{
            flex: 1,
            fontWeight: 700,
            borderRadius: 2,
            textTransform: "none",
            py: 1,
            boxShadow: "none",
          }}
        >
          Làm lại bài
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignmentResultDialog;
