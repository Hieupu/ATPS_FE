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

const AudioPlayer = memo(({ audioUrl }) => {
  if (!audioUrl) return null;
  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        bgcolor: "#f5f5f5",
        borderRadius: 2,
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Audio Listening
      </Typography>
      <audio controls style={{ width: "100%" }} key={audioUrl}>
        <source src={audioUrl} type="audio/mpeg" />
      </audio>
    </Box>
  );
});

const QuestionBlock = memo(({ question, answers, onChange }) => {
  const value = answers[question.examQuestionId] || "";
  const handleChange = useCallback(
    (val) => onChange(question.examQuestionId, val),
    [question.examQuestionId, onChange]
  );
  return (
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
          onUpload={async () => null}
        />
      </CardContent>
    </Card>
  );
});

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
  const [leftWidth, setLeftWidth] = useState(42);
  const [startTime, setStartTime] = useState(null);
  const containerRef = useRef(null);
  const elapsedTimerRef = useRef(null);
  const dragging = useRef(false);

  useEffect(() => {
    if (!open || !assignmentId) return;
    const loadAssignment = async () => {
      try {
        setLoading(true);
        const data = await getExamToDoApi(assignmentId);
        setSections(data.sections || []);
        if (data.sections.length > 0) {
          setActiveSection(data.sections[0]);
          setActiveChildSection(data.sections[0]?.childSections?.[0] || null);
        }
        const storageKey = `assignment_start_${assignmentId}`;
        let savedStart = localStorage.getItem(storageKey);
        if (!savedStart) {
          savedStart = Date.now();
          localStorage.setItem(storageKey, savedStart);
        }
        setStartTime(parseInt(savedStart));
        const answerMap = {};
        data.sections.forEach((s) =>
          s.childSections?.forEach((c) =>
            c.questions?.forEach((q) => {
              if (q.learnerAnswer !== null)
                answerMap[q.examQuestionId] = q.learnerAnswer;
            })
          )
        );
        setAnswers(answerMap);
      } catch (error) {
        toast.error("Lỗi: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    loadAssignment();
  }, [open, assignmentId]);

  useEffect(() => {
    if (activeChildSection?.FileURL) {
      loadFileAsHtml(activeChildSection.FileURL)
        .then(setHtmlPassage)
        .catch(() => setHtmlPassage(""));
    } else {
      setHtmlPassage("");
    }
  }, [activeChildSection]);

  useEffect(() => {
    if (open && startTime) {
      elapsedTimerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(elapsedTimerRef.current);
  }, [open, startTime]);

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
          console.error(error);
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

  const startDragging = () => {
    dragging.current = true;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", stopDragging);
  };

  const stopDragging = () => {
    dragging.current = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", stopDragging);
  };

  const onMouseMove = (e) => {
    if (!dragging.current || !containerRef.current) return;
    const newWidth = (e.clientX / containerRef.current.offsetWidth) * 100;
    if (newWidth > 20 && newWidth < 80) setLeftWidth(newWidth);
  };

  const handleConfirmSubmit = async () => {
    try {
      setSubmitting(true);
      const payload = buildSubmitPayload(
        Object.entries(answers).map(([id, ans]) => ({
          examQuestionId: Number(id),
          answer: ans,
        })),
        startTime,
        { metadata: { duration: elapsedTime } }
      );
      await submitExamApi(assignmentId, payload);
      localStorage.removeItem(`assignment_start_${assignmentId}`);
      toast.success("Nộp bài thành công!");
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} fullScreen onClose={onClose}>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #ddd",
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
                key={idx}
                variant={
                  activeSection?.sectionId === sec.sectionId
                    ? "contained"
                    : "outlined"
                }
                size="small"
                onClick={() => {
                  setActiveSection(sec);
                  setActiveChildSection(sec.childSections?.[0]);
                }}
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
          <Box ref={containerRef} sx={{ display: "flex", height: "100%" }}>
            <Box
              className="scroll-panel"
              sx={{
                width: `${leftWidth}%`,
                p: 3,
                borderRight: "1px solid #ddd",
                overflowY: "auto",
                bgcolor: "white",
              }}
            >
              <AudioPlayer audioUrl={activeChildSection?.audioUrl} />
              <div
                dangerouslySetInnerHTML={{
                  __html: htmlPassage || "Không có nội dung",
                }}
              />
            </Box>
            <Box
              onMouseDown={startDragging}
              sx={{
                width: "5px",
                cursor: "col-resize",
                background: "#ddd",
                "&:hover": { background: "#999" },
              }}
            />
            <Box
              className="scroll-panel"
              sx={{
                width: `${100 - leftWidth}%`,
                p: 3,
                overflowY: "auto",
                pb: 10,
              }}
            >
              {activeChildSection?.questions?.map((q) => (
                <QuestionBlock
                  key={q.examQuestionId}
                  question={q}
                  answers={answers}
                  onChange={handleAnswerChange}
                />
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 1.5,
          borderTop: "1px solid #ddd",
          flexDirection: "column",
          alignItems: "stretch",
          bgcolor: "#fff",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", gap: 4, mb: 1 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            {activeSection?.childSections?.map((child, index) => (
              <Button
                key={index}
                variant={
                  activeChildSection?.childSectionId === child.childSectionId
                    ? "contained"
                    : "outlined"
                }
                size="small"
                onClick={() => setActiveChildSection(child)}
              >
                Part {child.orderIndex + 1 || index + 1}
              </Button>
            ))}
          </Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {activeChildSection?.questions?.map((q, idx) => (
              <Button
                key={idx}
                variant={answers[q.examQuestionId] ? "contained" : "outlined"}
                color={answers[q.examQuestionId] ? "success" : "primary"}
                sx={{ minWidth: 36 }}
                size="small"
                onClick={() =>
                  document
                    .getElementById(`q_${q.examQuestionId}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" })
                }
              >
                {idx + 1}
              </Button>
            ))}
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            pt: 1,
            borderTop: "1px dashed #eee",
          }}
        >
          <Button onClick={onClose} color="inherit">
            Thoát
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Send />}
            onClick={() => setSubmitDialogOpen(true)}
          >
            Nộp bài
          </Button>
        </Box>
      </DialogActions>

      <Dialog
        open={submitDialogOpen}
        onClose={() => setSubmitDialogOpen(false)}
      >
        <DialogTitle>Xác nhận nộp bài?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setSubmitDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleConfirmSubmit} variant="contained">
            Đồng ý
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default AssignmentTakingDialog;
