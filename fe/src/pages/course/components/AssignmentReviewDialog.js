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
import { getExamReviewApi } from "../../../apiServices/learnerExamService";
import { loadFileAsHtml } from "../../../utils/fileToHtml";
import { QuestionRendererReadOnly } from "../../exam/QuestionComponentsReadOnly";

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
  const [leftWidth, setLeftWidth] = useState(40);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  useEffect(() => {
    if (open && assignmentId) {
      getExamReviewApi(assignmentId)
        .then((data) => {
          setReviewData(data);
          setSections(data.sections || []);
          if (data.sections?.length > 0) {
            setActiveSection(data.sections[0]);
            setActiveChildSection(data.sections[0].childSections?.[0]);
          }
        })
        .finally(() => setLoading(false));
    }
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

  const onMouseMove = (e) => {
    if (!dragging.current) return;
    const newWidth = (e.clientX / containerRef.current.offsetWidth) * 100;
    if (newWidth > 20 && newWidth < 80) setLeftWidth(newWidth);
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      fullScreen
      onClose={onClose}
      onMouseMove={onMouseMove}
      onMouseUp={() => (dragging.current = false)}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #ddd",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={onClose} color="inherit">
            Quay lại
          </Button>
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
                {(sec.type || `Section ${idx + 1}`).toUpperCase()}
              </Button>
            ))}
          </Box>
        </Box>
        {reviewData?.summary && (
          <Chip
            label={`Điểm: ${reviewData.summary.totalEarnedPoints}/${reviewData.summary.totalMaxPoints}`}
            color="primary"
            variant="outlined"
          />
        )}
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
        ) : (
          <Box ref={containerRef} sx={{ display: "flex", height: "100%" }}>
            <Box
              sx={{
                width: `${leftWidth}%`,
                bgcolor: "white",
                overflowY: "auto",
                p: 3,
                borderRight: "1px solid #ddd",
              }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: htmlPassage || "Không có nội dung",
                }}
              />
            </Box>
            <Box
              onMouseDown={() => (dragging.current = true)}
              sx={{ width: "6px", cursor: "col-resize", bgcolor: "#e0e0e0" }}
            />
            <Box
              sx={{
                width: `${100 - leftWidth}%`,
                p: 3,
                overflowY: "auto",
                pb: 10,
              }}
            >
              {activeChildSection?.questions?.map((q, idx) => (
                <QuestionCardReadOnly key={idx} question={q} number={idx + 1} />
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "flex-start",
          p: 1.5,
          borderTop: "1px solid #ddd",
          bgcolor: "white",
        }}
      >
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
              variant={q.isCorrect === false ? "contained" : "outlined"}
              color={
                q.isCorrect === true
                  ? "success"
                  : q.isCorrect === false
                  ? "error"
                  : "warning"
              }
              sx={{ minWidth: 36 }}
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
    </Dialog>
  );
};

export default AssignmentReviewDialog;
