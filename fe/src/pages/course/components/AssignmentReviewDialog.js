import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { ArrowBack, CheckCircle, Cancel, Close } from "@mui/icons-material";

// --- IMPORT CHUẨN ---
import { getExamReviewApi } from "../../../apiServices/learnerExamService";
import { loadFileAsHtml } from "../../../utils/fileToHtml";

import { QuestionRendererReadOnly } from "../../exam/QuestionComponentsReadOnly";
// --------------------

// Component hiển thị thẻ câu hỏi (giữ nguyên logic của bạn)
const QuestionCardReadOnly = ({ question, number }) => {
  const result =
    question.isCorrect === true
      ? "correct"
      : question.isCorrect === false
      ? "wrong"
      : "pending";

  return (
    <Card
      id={`q_${question.examQuestionId}`}
      sx={{
        mb: 2,
        borderLeft: 6,
        borderColor:
          result === "correct"
            ? "success.main"
            : result === "wrong"
            ? "error.main"
            : "warning.main",
        boxShadow: 2,
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Chip label={`Câu ${number}`} color="primary" size="small" />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip
              label={`${question.point || 0} điểm`}
              size="small"
              variant="outlined"
            />
            {result === "correct" && (
              <Chip
                icon={<CheckCircle />}
                label="Đúng"
                color="success"
                size="small"
              />
            )}
            {result === "wrong" && (
              <Chip icon={<Cancel />} label="Sai" color="error" size="small" />
            )}
            {result === "pending" && (
              <Chip label="Chờ chấm" color="warning" size="small" />
            )}
          </Box>
        </Box>

        <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
          {question.content}
        </Typography>

        <QuestionRendererReadOnly question={question} />
      </CardContent>
    </Card>
  );
};

const AssignmentReviewDialog = ({ open, onClose, assignmentId }) => {
  const [reviewData, setReviewData] = useState(null);
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [activeChildSection, setActiveChildSection] = useState(null);
  const [htmlPassage, setHtmlPassage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [leftWidth, setLeftWidth] = useState(40); // Mặc định 40% cho bài đọc
  const containerRef = useRef(null);
  const dragging = useRef(false);

  // Load Review Data
  useEffect(() => {
    if (open && assignmentId) {
      loadReview();
    }
  }, [open, assignmentId]);

  const loadReview = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getExamReviewApi(assignmentId);

      setReviewData(data);
      setSections(data.sections || []);

      if (data.sections?.length > 0) {
        const firstSection = data.sections[0];
        setActiveSection(firstSection);

        if (firstSection.childSections?.length > 0) {
          const firstChild = firstSection.childSections[0];
          setActiveChildSection(firstChild);
        }
      }
    } catch (err) {
      console.error("Load review error:", err);
      setError(err.message || "Không thể tải bài xem lại");
    } finally {
      setLoading(false);
    }
  };

  // Load HTML Passage khi switch tab
  useEffect(() => {
    const loadPassage = async () => {
      if (activeChildSection?.FileURL) {
        try {
          const html = await loadFileAsHtml(activeChildSection.FileURL);
          setHtmlPassage(html);
        } catch (e) {
          console.error(e);
          setHtmlPassage("");
        }
      } else {
        setHtmlPassage("");
      }
    };
    loadPassage();
  }, [activeChildSection]);

  // Handlers
  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (section.childSections?.length > 0) {
      setActiveChildSection(section.childSections[0]);
    }
  };

  const handleChildTabClick = (childSectionId) => {
    const child = activeSection.childSections?.find(
      (c) => c.childSectionId === childSectionId
    );
    if (child) setActiveChildSection(child);
  };

  // Dragging Logic
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
    const containerWidth = containerRef.current.offsetWidth;
    const newLeftWidth = (e.clientX / containerWidth) * 100;
    if (newLeftWidth > 20 && newLeftWidth < 80) {
      setLeftWidth(newLeftWidth);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} fullScreen onClose={onClose}>
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #ddd",
          py: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={onClose} color="inherit">
            Quay lại
          </Button>
          <Typography variant="h6">Xem lại bài làm</Typography>
        </Box>

        {/* Section Tabs in Header */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {sections.map((section, idx) => (
            <Button
              key={section.sectionId || idx}
              variant={
                activeSection?.sectionId === section.sectionId
                  ? "contained"
                  : "outlined"
              }
              size="small"
              onClick={() => handleSectionChange(section)}
            >
              {(section.type || `Section ${idx + 1}`).toUpperCase()}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {reviewData?.summary && (
            <Chip
              label={`Điểm: ${reviewData.summary.totalEarnedPoints}/${reviewData.summary.totalMaxPoints}`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: "bold" }}
            />
          )}
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: "hidden", bgcolor: "#f5f5f5" }}>
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
        ) : error ? (
          <Alert severity="error" sx={{ m: 4 }}>
            {error}
          </Alert>
        ) : (
          <Box
            ref={containerRef}
            sx={{ display: "flex", height: "100%", width: "100%" }}
          >
            {/* LEFT PANE: PASSAGE */}
            <Box
              sx={{
                width: `${leftWidth}%`,
                bgcolor: "white",
                overflowY: "auto",
                p: 3,
                borderRight: "1px solid #ddd",
              }}
            >
              {htmlPassage ? (
                <div dangerouslySetInnerHTML={{ __html: htmlPassage }} />
              ) : (
                <Typography
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 5 }}
                >
                  Không có bài đọc cho phần này
                </Typography>
              )}
            </Box>

            {/* DRAG HANDLE */}
            <Box
              onMouseDown={startDragging}
              sx={{
                width: "6px",
                cursor: "col-resize",
                bgcolor: "#e0e0e0",
                "&:hover": { bgcolor: "#2196f3" },
                transition: "background-color 0.2s",
              }}
            />

            {/* RIGHT PANE: QUESTIONS */}
            <Box
              sx={{
                width: `${100 - leftWidth}%`,
                p: 3,
                overflowY: "auto",
                pb: 10, // Padding bottom for footer
              }}
            >
              {activeChildSection?.questions?.length > 0 ? (
                activeChildSection.questions.map((q, idx) => (
                  <QuestionCardReadOnly
                    key={q.examQuestionId}
                    question={q}
                    number={idx + 1}
                  />
                ))
              ) : (
                <Alert severity="info">
                  Không có câu hỏi nào trong phần này
                </Alert>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* FOOTER: Part Navigation & Question Links */}
      {!loading && !error && (
        <DialogActions
          sx={{
            justifyContent: "flex-start",
            p: 1.5,
            borderTop: "1px solid #ddd",
            bgcolor: "white",
            overflowX: "auto",
          }}
        >
          {/* Parts Tabs */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mr: 2,
              borderRight: "2px solid #ddd",
              pr: 2,
            }}
          >
            {activeSection?.childSections?.map((child, index) => (
              <Button
                key={child.childSectionId}
                variant={
                  activeChildSection?.childSectionId === child.childSectionId
                    ? "contained"
                    : "outlined"
                }
                size="small"
                onClick={() => handleChildTabClick(child.childSectionId)}
              >
                Part{" "}
                {child.orderIndex !== undefined
                  ? child.orderIndex + 1
                  : index + 1}
              </Button>
            ))}
          </Box>

          {/* Question Numbers */}
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "nowrap" }}>
            {activeChildSection?.questions?.map((q, idx) => (
              <Button
                key={q.examQuestionId}
                variant={q.isCorrect === false ? "contained" : "outlined"}
                color={
                  q.isCorrect === true
                    ? "success"
                    : q.isCorrect === false
                    ? "error"
                    : "warning"
                }
                sx={{
                  minWidth: 36,
                  height: 36,
                  p: 0,
                  bgcolor: q.isCorrect === false ? "error.main" : "transparent",
                  color: q.isCorrect === false ? "white" : "inherit",
                }}
                size="small"
                onClick={() =>
                  document
                    .getElementById(`q_${q.examQuestionId}`)
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {idx + 1}
              </Button>
            ))}
          </Box>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default AssignmentReviewDialog;
