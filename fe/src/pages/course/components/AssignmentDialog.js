import React, { useState, useEffect, useCallback, useRef } from "react";
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
  IconButton,
} from "@mui/material";
import { Close, Timer, Info } from "@mui/icons-material";
import {
  getAssignmentQuestionsApi,
  submitAssignmentApi,
} from "../../../apiServices/learnerassignmentService";
import QuizAssignment from "./QuizAssignment";
import AudioAssignment from "./AudioAssignment";
import VideoAssignment from "./VideoAssignment";
import DocumentAssignment from "./DocumentAssignment";
import SpeakingAssignment from "./SpeakingAssignment";

const AssignmentDialog = ({ open, onClose, assignment, onSubmitSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [assignmentData, setAssignmentData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);

  // Sử dụng ref để tránh stale closure
  const timeSpentRef = useRef(0);
  const answersRef = useRef({});
  const filesRef = useRef({});

  // Cập nhật refs khi state thay đổi
  useEffect(() => {
    answersRef.current = answers;
    filesRef.current = files;
  }, [answers, files]);

  // Fetch assignment questions - chỉ chạy khi open hoặc assignment thay đổi
  useEffect(() => {
    if (open && assignment?.AssignmentID) {
      fetchAssignmentQuestions();
      setTimeSpent(0);
      timeSpentRef.current = 0;
    }

    // Cleanup khi đóng dialog
    if (!open) {
      setAnswers({});
      setFiles({});
      setError(null);
      setTimeSpent(0);
      setAssignmentData(null);
      setTimeRemaining(null);
      timeSpentRef.current = 0;
    }
  }, [open, assignment?.AssignmentID]); // Chỉ phụ thuộc vào open và AssignmentID

  const fetchAssignmentQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAssignmentQuestionsApi(assignment.AssignmentID);
      console.log("câu hỏi assignment:", response);
      setAssignmentData(response);
    } catch (err) {
      setError(err.message || "Không thể tải bài tập");
    } finally {
      setLoading(false);
    }
  };

  // Memoize handleAutoSubmit để tránh tạo mới function
  const handleAutoSubmit = useCallback(() => {
    alert("Hết thời gian làm bài! Bài làm của bạn sẽ được tự động nộp.");
    handleSubmit();
  }, []); // Empty dependency vì handleSubmit được định nghĩa bên dưới

  // Timer countdown - effect riêng biệt với dependency rõ ràng
  useEffect(() => {
    if (!assignmentData?.assignment?.MaxDuration) return;

    // Chỉ set timeRemaining một lần khi assignmentData thay đổi
    setTimeRemaining(assignmentData.assignment.MaxDuration * 60);

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev !== null && prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev !== null ? prev - 1 : null;
      });

      setTimeSpent((prev) => {
        const newValue = prev + 1;
        timeSpentRef.current = newValue;
        return newValue;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    assignmentData?.assignment?.MaxDuration,
    assignmentData?.assignment?.AssignmentID,
  ]); // Chỉ chạy khi MaxDuration thay đổi

  const handleAnswerChange = useCallback((questionId, answer) => {
    console.log("đáp án thay đổi:", questionId, answer);
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  }, []);

  const handleFileChange = useCallback((fileType, file, duration = null) => {
    console.log("File changed:", fileType, file, duration);
    setFiles((prev) => ({
      ...prev,
      [fileType]: file,
      ...(duration && { durationSec: duration }),
    }));
  }, []);

  const validateSubmission = useCallback(() => {
    if (!assignmentData) return "Dữ liệu bài tập không tồn tại";

    const type = assignmentData.assignment.Type;
    const totalQuestions = assignmentData.questions?.length || 0;
    const answeredQuestions = Object.keys(answersRef.current).length;

    console.log(
      "Validation - Type:",
      type,
      "Total questions:",
      totalQuestions,
      "Answered:",
      answeredQuestions
    );

    if (totalQuestions > 0 && answeredQuestions < totalQuestions) {
      return `Bạn mới trả lời ${answeredQuestions}/${totalQuestions} câu hỏi. Bạn có chắc muốn nộp bài?`;
    }

    if (type === "audio") {
      const hasSpeaking = assignmentData.questions?.some(
        (q) => q.Type === "speaking"
      );
      if (hasSpeaking && !filesRef.current.audio) {
        return "Vui lòng ghi âm bài nói trước khi nộp bài";
      }
    }

    return null;
  }, [assignmentData]);

  const handleSubmit = useCallback(async () => {
    console.log("Starting submission...");
    console.log("Current answers:", answersRef.current);
    console.log("Current files:", filesRef.current);

    const validationError = validateSubmission();
    if (validationError) {
      if (
        validationError.includes("Bạn mới trả lời") &&
        !window.confirm(validationError)
      ) {
        return;
      }
      if (!validationError.includes("Bạn mới trả lời")) {
        setError(validationError);
        return;
      }
    }

    const confirmSubmit = window.confirm(
      "Bạn có chắc chắn muốn nộp bài? Sau khi nộp không thể sửa lại."
    );
    if (!confirmSubmit) return;

    try {
      setSubmitting(true);
      setError(null);

      const submissionData = {
        answers: answersRef.current,
        durationSec: timeSpentRef.current,
        content: "",
      };

      if (filesRef.current.audio) {
        submissionData.audioFile = filesRef.current.audio;
        submissionData.durationSec =
          filesRef.current.durationSec || timeSpentRef.current;
      }

      console.log("Submitting data:", submissionData);

      const response = await submitAssignmentApi(
        assignment.AssignmentID,
        submissionData
      );

      console.log("Submission successful:", response);
      alert("Nộp bài thành công!");
      onSubmitSuccess?.();
      onClose();
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message || "Không thể nộp bài. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }, [assignment?.AssignmentID, validateSubmission, onSubmitSuccess, onClose]);

  const formatTime = (seconds) => {
    if (seconds === null) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Memoize renderAssignmentContent để tránh render lại không cần thiết
  const renderAssignmentContent = useCallback(() => {
    if (!assignmentData) return null;

    const type = assignmentData.assignment.Type;
    const hasSpeaking = assignmentData.questions?.some(
      (q) => q.Type === "speaking"
    );

    const props = {
      assignmentData,
      answers,
      onAnswerChange: handleAnswerChange,
      onFileChange: handleFileChange,
    };

    console.log(
      "Rendering assignment - Type:",
      type,
      "Has speaking:",
      hasSpeaking
    );

    switch (type) {
      case "quiz":
        return <QuizAssignment {...props} />;
      case "audio":
        return hasSpeaking ? (
          <SpeakingAssignment {...props} />
        ) : (
          <AudioAssignment {...props} />
        );
      case "video":
        return <VideoAssignment {...props} />;
      case "document":
        return <DocumentAssignment {...props} />;
      default:
        return <Alert severity="warning">Loại bài tập không được hỗ trợ</Alert>;
    }
  }, [assignmentData, answers, handleAnswerChange, handleFileChange]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullScreen
      PaperProps={{
        sx: { minHeight: "80vh" },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {assignment?.Title}
          </Typography>
          {assignmentData?.assignment?.MaxDuration &&
            timeRemaining !== null && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor:
                    timeRemaining < 300 ? "error.light" : "warning.light",
                  color: timeRemaining < 300 ? "error.dark" : "warning.dark",
                }}
              >
                <Timer />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatTime(timeRemaining)}
                </Typography>
              </Box>
            )}
        </Box>
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
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            {assignmentData?.assignment?.Description && (
              <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
                {assignmentData.assignment.Description}
              </Alert>
            )}

            {assignmentData?.questions &&
              assignmentData.questions.length > 0 && (
                <Box
                  sx={{
                    mb: 2,
                    p: 1.5,
                    bgcolor: "success.50",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "success.200",
                  }}
                >
                  <Typography variant="body2" color="success.dark">
                    📝 Đã trả lời: {Object.keys(answers).length}/
                    {assignmentData.questions.length} câu hỏi
                  </Typography>
                </Box>
              )}

            {renderAssignmentContent()}
          </>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          justifyContent: "space-between",
        }}
      >
        <Button onClick={onClose} disabled={submitting}>
          Hủy
        </Button>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Thời gian làm: {formatTime(timeSpent)}
          </Typography>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || submitting}
            sx={{ minWidth: 120 }}
          >
            {submitting ? <CircularProgress size={24} /> : "Nộp bài"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AssignmentDialog;
