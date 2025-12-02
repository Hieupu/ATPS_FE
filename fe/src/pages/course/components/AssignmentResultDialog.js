import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  Chip,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Close,
  CheckCircle,
  Cancel,
  AccessTime,
  Grade,
  PlayArrow,
  Description,
} from "@mui/icons-material";
import { getAssignmentResultsApi } from "../../../apiServices/learnerassignmentService";
import { formatDate } from "./utils";

const AssignmentResultDialog = ({ open, onClose, assignment }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (open && assignment) {
      fetchResults();
    }
  }, [open, assignment]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAssignmentResultsApi(assignment.AssignmentID);
      setResults(response.results);
    } catch (err) {
      setError(err.message || "Không thể tải kết quả");
    } finally {
      setLoading(false);
    }
  };

  const renderSubmissionContent = () => {
    if (!results) return null;

    const { submission, assignment: assignmentData } = results;

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Score Card */}
        {submission.Score !== null && (
          <Card
            sx={{
              p: 3,
              bgcolor: "success.50",
              border: "2px solid",
              borderColor: "success.main",
              textAlign: "center",
            }}
          >
            <Grade sx={{ fontSize: 60, color: "success.main", mb: 1 }} />
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, color: "success.dark" }}
            >
              {Number(submission.Score).toFixed(2)}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Điểm số
            </Typography>
          </Card>
        )}

        {/* Submission Info */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            📊 Thông tin nộp bài
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <InfoRow
              label="Thời gian nộp"
              value={formatDate(submission.SubmissionDate)}
            />
            <InfoRow
              label="Trạng thái"
              value={
                <Chip
                  label={
                    submission.Status === "submitted" ? "Đúng hạn" : "Nộp muộn"
                  }
                  color={
                    submission.Status === "submitted" ? "success" : "warning"
                  }
                  size="small"
                />
              }
            />
            {submission.Feedback && (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Nhận xét:
                </Typography>
                <Alert severity="info">{submission.Feedback}</Alert>
              </Box>
            )}
          </Box>
        </Card>

        {/* Audio/Video/Document Submission */}
        {assignmentData.Type === "audio" && submission.AudioURL && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              🎤 Bài làm audio
            </Typography>
            <audio controls style={{ width: "100%" }}>
              <source src={submission.AudioURL} />
            </audio>
            {submission.DurationSec && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Thời lượng: {Math.floor(submission.DurationSec / 60)}:
                {(submission.DurationSec % 60).toString().padStart(2, "0")}
              </Typography>
            )}
          </Card>
        )}

        {assignmentData.Type === "video" && submission.FileURL && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              🎥 Bài làm video
            </Typography>
            <video
              controls
              style={{ width: "100%", maxHeight: 400, borderRadius: 8 }}
            >
              <source src={submission.FileURL} />
            </video>
          </Card>
        )}

        {assignmentData.Type === "document" && submission.FileURL && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              📄 Bài làm tài liệu
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Description />}
              href={submission.FileURL}
              target="_blank"
              fullWidth
            >
              Xem tài liệu đã nộp
            </Button>
          </Card>
        )}

        {/* Quiz Results with Answers */}
        {results.canShowAnswers && results.questions && results.userAnswers && (
          <QuizResults
            questions={results.questions}
            userAnswers={results.userAnswers}
          />
        )}

        {!results.canShowAnswers &&
          assignmentData.ShowAnswersAfter === "after_deadline" && (
            <Alert severity="info">
              Đáp án sẽ được hiển thị sau hạn nộp:{" "}
              {formatDate(assignmentData.Deadline)}
            </Alert>
          )}

        {!results.canShowAnswers &&
          assignmentData.ShowAnswersAfter === "never" && (
            <Alert severity="info">
              Đáp án không được hiển thị cho bài tập này
            </Alert>
          )}
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: "60vh" },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          📈 Kết quả bài tập
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          renderSubmissionContent()
        )}
      </DialogContent>

      <DialogActions
        sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider" }}
      >
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

const InfoRow = ({ label, value }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {label}:
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600 }}>
      {value}
    </Typography>
  </Box>
);

const QuizResults = ({ questions, userAnswers }) => {
  // Create answer map
  const answerMap = new Map();
  userAnswers.forEach((ans) => {
    answerMap.set(ans.AssignmentQuestionId, ans.Answer);
  });

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        📝 Chi tiết câu trả lời
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {questions.map((question, index) => {
          const userAnswer = answerMap.get(question.AssignmentQuestionId);
          const isCorrect = checkAnswer(question, userAnswer);

          return (
            <Box
              key={question.QuestionID}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: isCorrect ? "success.main" : "error.main",
                borderRadius: 2,
                bgcolor: isCorrect ? "success.50" : "error.50",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: isCorrect ? "success.main" : "error.main",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                  }}
                >
                  {index + 1}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    {question.Content}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <Chip
                      icon={isCorrect ? <CheckCircle /> : <Cancel />}
                      label={isCorrect ? "Đúng" : "Sai"}
                      color={isCorrect ? "success" : "error"}
                      size="small"
                    />
                    <Chip
                      label={`${question.Point} điểm`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="body2">
                  <strong>Câu trả lời của bạn:</strong>{" "}
                  {formatAnswer(question, userAnswer)}
                </Typography>
                {!isCorrect && (
                  <Typography variant="body2" sx={{ color: "success.dark" }}>
                    <strong>Đáp án đúng:</strong>{" "}
                    {formatCorrectAnswer(question)}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
};

const checkAnswer = (question, userAnswer) => {
  if (!userAnswer) return false;

  switch (question.Type) {
    case "multiple_choice":
      const correctOption = question.Options?.find(
        (opt) => opt.IsCorrect === 1
      );
      return correctOption && userAnswer === correctOption.OptionID.toString();
    case "true_false":
      return userAnswer === question.CorrectAnswer;
    case "fill_in_blank":
      return (
        userAnswer.toLowerCase().trim() ===
        question.CorrectAnswer.toLowerCase().trim()
      );
    default:
      return null;
  }
};

const formatAnswer = (question, answer) => {
  if (!answer) return "Chưa trả lời";

  if (question.Type === "multiple_choice") {
    const option = question.Options?.find(
      (opt) => opt.OptionID.toString() === answer
    );
    return option ? option.Content : answer;
  }

  return answer;
};

const formatCorrectAnswer = (question) => {
  if (question.Type === "multiple_choice") {
    const correctOption = question.Options?.find((opt) => opt.IsCorrect === 1);
    return correctOption ? correctOption.Content : question.CorrectAnswer;
  }

  return question.CorrectAnswer;
};

export default AssignmentResultDialog;
