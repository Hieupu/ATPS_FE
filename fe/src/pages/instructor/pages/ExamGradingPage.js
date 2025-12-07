import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  Tabs,
  Tab
} from "@mui/material";
import {
  Visibility as ViewIcon,
  CheckCircle as CheckIcon,
  Edit as EditIcon,
  AutoMode as AutoIcon
} from "@mui/icons-material";
import {
  getExamResultsApi,
  getLearnerSubmissionApi,
  autoGradeExamApi,
  manualGradeExamApi
} from "../../../apiServices/instructorExamService";

const ExamGradingPage = ({ examId, classId }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [openGradingDialog, setOpenGradingDialog] = useState(false);
  const [gradingMode, setGradingMode] = useState("view"); // "view" | "manual"
  
  // Manual grading form
  const [manualScore, setManualScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    loadResults();
  }, [examId, classId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const data = await getExamResultsApi(examId, classId);
      setResults(data.results || []);
    } catch (error) {
      showSnackbar(error.message || "Không thể tải kết quả thi", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmission = async (learnerId) => {
    try {
      setLoading(true);
      const submission = await getLearnerSubmissionApi(examId, learnerId);
      setSelectedSubmission(submission);
      setGradingMode("view");
      setOpenGradingDialog(true);
    } catch (error) {
      showSnackbar(error.message || "Không thể tải bài làm", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoGrade = async (learnerId) => {
    if (!window.confirm("Bạn có chắc chắn muốn chấm tự động bài thi này?")) {
      return;
    }

    try {
      setLoading(true);
      await autoGradeExamApi(examId, learnerId);
      showSnackbar("Chấm bài tự động thành công!", "success");
      loadResults();
    } catch (error) {
      showSnackbar(error.message || "Không thể chấm bài tự động", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleManualGrade = async (learnerId) => {
    try {
      setLoading(true);
      const submission = await getLearnerSubmissionApi(examId, learnerId);
      setSelectedSubmission(submission);
      setManualScore(submission.Score || 0);
      setFeedback(submission.Feedback || "");
      setGradingMode("manual");
      setOpenGradingDialog(true);
    } catch (error) {
      showSnackbar(error.message || "Không thể tải bài làm", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveManualGrade = async () => {
    try {
      setLoading(true);
      await manualGradeExamApi(
        examId,
        selectedSubmission.LearnerID,
        manualScore,
        feedback
      );
      showSnackbar("Chấm bài thành công!", "success");
      setOpenGradingDialog(false);
      loadResults();
    } catch (error) {
      showSnackbar(error.message || "Không thể lưu điểm", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: "info",
      graded: "success",
      pending: "warning",
      late: "error"
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      submitted: "Đã nộp",
      graded: "Đã chấm",
      pending: "Chờ chấm",
      late: "Nộp muộn"
    };
    return labels[status] || status;
  };

  const calculateStats = () => {
    const total = results.length;
    const graded = results.filter(r => r.Status === "graded").length;
    const pending = results.filter(r => r.Status === "pending" || r.Status === "submitted").length;
    const avgScore = results.length > 0
      ? results.reduce((sum, r) => sum + (r.Score || 0), 0) / results.length
      : 0;

    return { total, graded, pending, avgScore };
  };

  const stats = calculateStats();

  const renderSubmissionDetail = () => {
    if (!selectedSubmission) return null;

    return (
      <Box>
        {/* Learner Info */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Thông tin học viên
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Họ tên:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {selectedSubmission.LearnerName}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Thời gian nộp:
              </Typography>
              <Typography variant="body1">
                {new Date(selectedSubmission.SubmittedAt).toLocaleString("vi-VN")}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Answers */}
        <Typography variant="h6" gutterBottom>
          Bài làm
        </Typography>
        {selectedSubmission.Answers && selectedSubmission.Answers.map((answer, index) => (
          <Card key={index} sx={{ mb: 2 }} variant="outlined">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Câu {index + 1}
                </Typography>
                <Chip
                  label={answer.IsCorrect ? "Đúng" : "Sai"}
                  color={answer.IsCorrect ? "success" : "error"}
                  size="small"
                />
              </Box>
              
              <Typography variant="body2" paragraph>
                <strong>Câu hỏi:</strong> {answer.QuestionContent}
              </Typography>

              <Typography variant="body2" paragraph>
                <strong>Câu trả lời:</strong> {answer.AnswerText || "Chưa trả lời"}
              </Typography>

              {answer.CorrectAnswer && (
                <Typography variant="body2" color="success.main">
                  <strong>Đáp án đúng:</strong> {answer.CorrectAnswer}
                </Typography>
              )}

              {answer.Explanation && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="caption">
                    <strong>Giải thích:</strong> {answer.Explanation}
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Manual Grading Form */}
        {gradingMode === "manual" && (
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Chấm điểm
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Điểm *"
                  value={manualScore}
                  onChange={(e) => setManualScore(parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0, max: 100, step: 0.5 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nhận xét"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  multiline
                  rows={4}
                  placeholder="Nhập nhận xét cho học viên..."
                />
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Chấm bài thi
      </Typography>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng bài nộp
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main">
                {stats.graded}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đã chấm
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main">
                {stats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chờ chấm
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="info.main">
                {stats.avgScore.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Điểm trung bình
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Results Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>STT</TableCell>
                <TableCell>Học viên</TableCell>
                <TableCell>Thời gian nộp</TableCell>
                <TableCell>Điểm</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Chưa có bài nộp nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                results.map((result, index) => (
                  <TableRow key={result.LearnerID} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {result.LearnerName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {result.SubmittedAt
                        ? new Date(result.SubmittedAt).toLocaleString("vi-VN")
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={result.Score >= 50 ? "success.main" : "error.main"}
                      >
                        {result.Score !== null ? `${result.Score}/100` : "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(result.Status)}
                        color={getStatusColor(result.Status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleViewSubmission(result.LearnerID)}
                        title="Xem chi tiết"
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleAutoGrade(result.LearnerID)}
                        title="Chấm tự động"
                        disabled={result.Status === "graded"}
                      >
                        <AutoIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleManualGrade(result.LearnerID)}
                        title="Chấm thủ công"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Grading Dialog */}
      <Dialog
        open={openGradingDialog}
        onClose={() => setOpenGradingDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {gradingMode === "view" ? "Chi tiết bài làm" : "Chấm bài"}
        </DialogTitle>
        <DialogContent dividers>
          {renderSubmissionDetail()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGradingDialog(false)}>
            {gradingMode === "view" ? "Đóng" : "Hủy"}
          </Button>
          {gradingMode === "manual" && (
            <Button
              onClick={handleSaveManualGrade}
              variant="contained"
              disabled={loading}
            >
              {loading ? "Đang lưu..." : "Lưu điểm"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExamGradingPage;