import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  memo,
  useCallback,
} from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import { Send, Timer } from "@mui/icons-material";
import { debounce } from "lodash";
import { toast } from "react-toastify";

import "./Assignment.css";

import {
  getExamToDoApi,
  saveAnswerApi,
  submitExamApi,
  buildSubmitPayload,
} from "../../../apiServices/learnerExamService";

import { loadFileAsHtml } from "../../../utils/fileToHtml";
import { QuestionRenderer } from "../../exam/QuestionComponents";
// ----------------------------------

/* ================= AUDIO PLAYER ================= */

const AudioPlayer = memo(({ audioUrl }) => {
  if (!audioUrl) return null;

  return (
    <Box sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Audio Listening
      </Typography>
      <audio controls style={{ width: "100%" }}>
        <source src={audioUrl} type="audio/mpeg" />
        Trình duyệt không hỗ trợ audio.
      </audio>
    </Box>
  );
});
AudioPlayer.displayName = "AudioPlayer";

/* ================= QUESTION BLOCK ================= */

const QuestionBlock = memo(({ question, answers, onChange }) => {
  const value = answers[question.examQuestionId] || "";

  const handleChange = useCallback(
    (val) => onChange(question.examQuestionId, val),
    [question.examQuestionId, onChange]
  );

  const handleUpload = useCallback(async (file) => {
    console.warn("Chức năng upload chưa được bật trong Dialog này");
    return null;
  }, []);

  return (
    // Đã thêm lại className="question-card"
    <Card
      className="question-card"
      id={`q_${question.examQuestionId}`}
      sx={{ mb: 2 }}
      variant="outlined"
    >
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Chip
            label={`Câu ${question.orderIndex + 1}`}
            size="small"
            color="primary"
          />
          <Typography variant="caption">{question.point} điểm</Typography>
        </Box>

        <Typography sx={{ mb: 2, fontWeight: 500 }}>
          {question.content}
        </Typography>

        <QuestionRenderer
          question={question}
          value={value}
          onChange={handleChange}
          onUpload={handleUpload}
        />
      </CardContent>
    </Card>
  );
});
QuestionBlock.displayName = "QuestionBlock";

/* ================= MAIN COMPONENT ================= */

const AssignmentTakingDialog = ({ open, onClose, assignmentId }) => {
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [activeChildSection, setActiveChildSection] = useState(null);
  const [htmlPassage, setHtmlPassage] = useState("");
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime] = useState(Date.now());

  const elapsedTimerRef = useRef(null);

  // Load Data
  useEffect(() => {
    if (!open || !assignmentId) return;

    const loadAssignment = async () => {
      try {
        setLoading(true);
        const data = await getExamToDoApi(assignmentId);

        if (!data || !data.sections)
          throw new Error("Không có dữ liệu bài tập");

        setSections(data.sections || []);

        if (data.sections.length > 0) {
          const firstSec = data.sections[0];
          setActiveSection(firstSec);
          const firstChild = firstSec?.childSections?.[0] || null;
          setActiveChildSection(firstChild);
        }

        const answerMap = {};
        data.sections.forEach((s) =>
          s.childSections?.forEach((c) =>
            c.questions?.forEach((q) => {
              if (q.learnerAnswer !== null && q.learnerAnswer !== undefined) {
                answerMap[q.examQuestionId] = q.learnerAnswer;
              }
            })
          )
        );
        setAnswers(answerMap);
      } catch (error) {
        console.error(error);
        toast.error("Lỗi tải đề bài: " + (error.message || "Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    loadAssignment();
  }, [open, assignmentId]);

  // Load Passage HTML
  useEffect(() => {
    if (!activeChildSection?.FileURL) {
      setHtmlPassage("");
      return;
    }
    loadFileAsHtml(activeChildSection.FileURL)
      .then(setHtmlPassage)
      .catch((err) => console.error("Lỗi load bài đọc:", err));
  }, [activeChildSection]);

  // Timer
  useEffect(() => {
    if (open) {
      elapsedTimerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(elapsedTimerRef.current);
  }, [open]);

  // Auto Save
  const debouncedSave = useMemo(
    () =>
      debounce(async (dataToSave) => {
        try {
          const payload = Object.entries(dataToSave).map(([id, ans]) => ({
            examQuestionId: Number(id),
            answer: ans || "",
          }));
          await saveAnswerApi(assignmentId, payload);
        } catch (error) {
          console.error("Auto-save error:", error);
        }
      }, 1500),
    [assignmentId]
  );

  const handleAnswerChange = useCallback(
    (id, value) => {
      setAnswers((prev) => {
        const updated = { ...prev, [id]: value };
        debouncedSave(updated);
        return updated;
      });
    },
    [debouncedSave]
  );

  // Navigation Handlers
  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (section.childSections && section.childSections.length > 0) {
      setActiveChildSection(section.childSections[0]);
    } else {
      setActiveChildSection(null);
    }
  };

  const handleChildTabClick = (child) => {
    setActiveChildSection(child);
  };

  const scrollToQuestion = (questionId) => {
    const el = document.getElementById(`q_${questionId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Submit Logic
  const handleConfirmSubmit = async () => {
    try {
      setSubmitting(true);
      setSubmitDialogOpen(false);

      const payload = buildSubmitPayload(
        Object.entries(answers).map(([id, ans]) => ({
          examQuestionId: Number(id),
          answer: ans,
        })),
        startTime,
        { metadata: { duration: elapsedTime } }
      );

      await submitExamApi(assignmentId, payload);

      toast.success("Nộp bài thành công!");
      onClose();
    } catch (error) {
      toast.error(error.message || "Lỗi khi nộp bài");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} fullScreen onClose={onClose}>
      {/* HEADER */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #ddd",
          py: 1,
          bgcolor: "#fff",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Assignment
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            {sections.map((sec, idx) => (
              <Button
                key={sec.sectionId || idx}
                variant={
                  activeSection?.sectionId === sec.sectionId
                    ? "contained"
                    : "outlined"
                }
                size="small"
                onClick={() => handleSectionChange(sec)}
              >
                {(sec.Type || `Section ${idx + 1}`).toUpperCase()}
              </Button>
            ))}
          </Box>
        </Box>

        <Chip
          icon={<Timer />}
          label={`${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60)
            .toString()
            .padStart(2, "0")}`}
          color="primary"
          variant="outlined"
          sx={{ fontWeight: "bold" }}
        />
      </DialogTitle>

      {/* BODY */}
      <DialogContent sx={{ p: 0, bgcolor: "#f9f9f9", overflow: "hidden" }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: "flex", height: "100%" }}>
            {/* Cột Trái: Bài đọc + Audio */}
            <Box
              className="scroll-panel" // Đã thêm lại class này
              sx={{
                width: "40%",
                p: 3,
                borderRight: "1px solid #ddd",
                overflowY: "auto",
                bgcolor: "white",
              }}
            >
              <AudioPlayer audioUrl={activeChildSection?.audioUrl} />
              {htmlPassage ? (
                <div dangerouslySetInnerHTML={{ __html: htmlPassage }} />
              ) : (
                <Typography
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 5 }}
                >
                  Không có nội dung bài đọc
                </Typography>
              )}
            </Box>

            {/* Cột Phải: Danh sách câu hỏi */}
            <Box
              className="scroll-panel" // Đã thêm lại class này
              sx={{ width: "60%", p: 3, overflowY: "auto", pb: 10 }}
            >
              {activeChildSection?.questions?.length > 0 ? (
                activeChildSection.questions.map((q) => (
                  <QuestionBlock
                    key={q.examQuestionId}
                    question={q}
                    answers={answers}
                    onChange={handleAnswerChange}
                  />
                ))
              ) : (
                <Alert severity="info">Phần này không có câu hỏi nào.</Alert>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* FOOTER */}
      <DialogActions
        sx={{
          p: 1.5,
          borderTop: "1px solid #ddd",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: 1,
          bgcolor: "#fff",
        }}
      >
        {!loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              overflowX: "auto",
              gap: 4,
            }}
          >
            <Box sx={{ display: "flex", gap: 1, mr: 2 }}>
              {activeSection?.childSections?.map((child, index) => (
                <Button
                  key={child.childSectionId || index}
                  variant={
                    activeChildSection?.childSectionId === child.childSectionId
                      ? "contained"
                      : "outlined"
                  }
                  size="small"
                  onClick={() => handleChildTabClick(child)}
                >
                  Part{" "}
                  {child.orderIndex !== undefined
                    ? child.orderIndex + 1
                    : index + 1}
                </Button>
              ))}
            </Box>

            <Box sx={{ display: "flex", gap: 0.5 }}>
              {activeChildSection?.questions?.map((q, idx) => {
                const hasAnswer = answers[q.examQuestionId];
                return (
                  <Button
                    key={q.examQuestionId}
                    variant={hasAnswer ? "contained" : "outlined"}
                    color={hasAnswer ? "success" : "primary"}
                    sx={{ minWidth: 36, p: 0 }}
                    size="small"
                    onClick={() => scrollToQuestion(q.examQuestionId)}
                  >
                    {idx + 1}
                  </Button>
                );
              })}
            </Box>
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
            gap: 2,
            pt: 1,
            borderTop: "1px dashed #eee",
          }}
        >
          <Button onClick={onClose} color="inherit" disabled={submitting}>
            Thoát
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Send />}
            onClick={() => setSubmitDialogOpen(true)}
            disabled={submitting || loading}
          >
            {submitting ? "Đang nộp..." : "Nộp bài"}
          </Button>
        </Box>
      </DialogActions>

      {/* Confirm Dialog */}
      <Dialog
        open={submitDialogOpen}
        onClose={() => setSubmitDialogOpen(false)}
      >
        <DialogTitle>Xác nhận nộp bài?</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn đã trả lời {Object.keys(answers).length} câu hỏi. Bạn có chắc
            chắn muốn nộp bài ngay không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleConfirmSubmit} variant="contained" autoFocus>
            Đồng ý
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default AssignmentTakingDialog;
