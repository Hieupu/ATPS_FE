import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Chip,
  CircularProgress,
} from "@mui/material";

import { Send, ArrowBack } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { debounce } from "lodash";
import {
  getExamToDoApi,
  saveAnswerApi,
  submitExamApi,
} from "../../apiServices/learnerExamService";

import { loadFileAsHtml } from "../../utils/fileToHtml"; // Bạn cần chắc chắn rằng loadFileAsHtml có thể xử lý file URL
import "./ExamTaking.css";

// ===================================================================
// QUESTION BLOCK
// ===================================================================
const QuestionBlock = ({ question, answers, onChange }) => {
  const value = answers[question.examQuestionId] || "";

  const isMCQ = question.type === "multiple_choice";
  const isTF = question.type === "true_false";

  return (
    <Card className="question-card" id={`q_${question.examQuestionId}`} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Chip label={`Question ${question.orderIndex + 1}`} color="primary" />
          <Typography variant="caption">{question.point} point</Typography>
        </Box>

        <Typography sx={{ mb: 2 }}>{question.content}</Typography>

        {isMCQ && (
          <RadioGroup
            value={value}
            onChange={(e) => onChange(question.examQuestionId, e.target.value)}
          >
            {question.options?.map((o) => (
              <FormControlLabel
                key={o.optionId}
                value={o.content}
                control={<Radio />}
                label={o.content}
              />
            ))}
          </RadioGroup>
        )}

        {isTF && (
          <RadioGroup
            value={value}
            onChange={(e) => onChange(question.examQuestionId, e.target.value)}
          >
            <FormControlLabel value="True" control={<Radio />} label="True" />
            <FormControlLabel value="False" control={<Radio />} label="False" />
          </RadioGroup>
        )}

        {!isMCQ && !isTF && (
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={value}
            onChange={(e) => onChange(question.examQuestionId, e.target.value)}
            placeholder="Nhập câu trả lời..."
          />
        )}
      </CardContent>
    </Card>
  );
};

// ===================================================================
// MAIN PAGE
// ===================================================================
const ExamTakingPage = () => {
  const { instanceId } = useParams();
  const navigate = useNavigate();

  const [instance, setInstance] = useState(null);
  const [sections, setSections] = useState([]);
  const [answers, setAnswers] = useState({});
  const [activeChildSection, setActiveChildSection] = useState(null);
  const [htmlPassage, setHtmlPassage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [leftWidth, setLeftWidth] = useState(42);

  const containerRef = useRef(null);
  const leftPaneRef = useRef(null);
  const rightPaneRef = useRef(null);
  const dragging = useRef(false);

  // ===================================================================
  // LOAD EXAM
  // ===================================================================
  const loadExam = async () => {
    try {
      setLoading(true);

      const data = await getExamToDoApi(instanceId);

      setInstance(data.instance);
      setSections(data.sections || []);

      // Lấy file URL từ childSections của section con
      if (data.sections?.[0]?.childSections?.length > 0) {
        setActiveChildSection(data.sections[0].childSections[0]);
        if (data.sections[0].childSections[0].FileURL) {
          // Tải nội dung của file URL
          loadFileAsHtml(data.sections[0].childSections[0].FileURL).then(setHtmlPassage);
        }
      }

      const init = {};
      data.sections?.forEach((sec) => {
        sec.childSections?.forEach((child) => {
          child.questions?.forEach((q) => {
            if (q.learnerAnswer) init[q.examQuestionId] = q.learnerAnswer;
          });
        });
      });

      setAnswers(init);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExam();
  }, [instanceId]);

  // ===================================================================
  // AUTO SAVE
  // ===================================================================
  const debouncedSave = useMemo(
    () =>
      debounce(async (questionId, answer) => {
        await saveAnswerApi(instanceId, [
          { examQuestionId: questionId, answer },
        ]);
      }, 350),
    []
  );

  const handleAnswerChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    debouncedSave(id, value);
  };

  // ===================================================================
  // RESIZER DRAG
  // ===================================================================
  const startDragging = (e) => {
    dragging.current = true;

    const containerWidth = containerRef.current.offsetWidth;
    const startX = e.clientX;
    const startLeftPx = (leftWidth / 100) * containerWidth;

    const onMouseMove = (ev) => {
      if (!dragging.current) return;

      const delta = ev.clientX - startX;
      let newLeftPx = startLeftPx + delta;

      newLeftPx = Math.max(
        containerWidth * 0.2,
        Math.min(containerWidth * 0.8, newLeftPx)
      );

      const newPercent = (newLeftPx / containerWidth) * 100;

      leftPaneRef.current.style.width = `${newPercent}%`;
      rightPaneRef.current.style.width = `${100 - newPercent}%`;
    };

    const stopDragging = () => {
      dragging.current = false;
      const finalLeft = leftPaneRef.current.offsetWidth;
      setLeftWidth((finalLeft / containerWidth) * 100);

      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopDragging);
  };

  // ===================================================================
  // SUBMIT
  // ===================================================================
  const handleSubmit = async () => {
    if (!window.confirm("Bạn chắc chắn muốn nộp bài?")) return;

    setSubmitting(true);

    const payload = Object.entries(answers).map(([id, ans]) => ({
      examQuestionId: Number(id),
      answer: ans,
    }));

    await submitExamApi(instanceId, payload);
    navigate(`/exam/${instanceId}/result`);
  };

  // ===================================================================
  // RENDER UI
  // ===================================================================
  return (
    <>
      <Container maxWidth={false} sx={{ mt: 2, mb: 2, px: 2 }}>
        {/* ================= HEADER - BACK AND SUBMIT BUTTONS ================= */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
            Quay lại
          </Button>

          {/* Button for Section Type */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {sections[0]?.Type && (
              <Button variant="outlined" color="primary">
                {sections[0]?.Type}
              </Button>
            )}

            {/* Submit Button */}
            {!loading && instance && (
              <Button
                variant="contained"
                color="primary"
                endIcon={<Send />}
                onClick={handleSubmit}
                disabled={submitting}
              >
                Submit
              </Button>
            )}
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          instance && (
            <>
              {/* Main Layout */}
              <Box
                ref={containerRef}
                sx={{
                  display: "flex",
                  width: "100%",
                  height: "70vh",
                  mt: 2,
                  overflow: "hidden",
                }}
              >
                {/* Left Panel */}
                <Box
                  ref={leftPaneRef}
                  sx={{
                    width: `${leftWidth}%`,
                    borderRight: "1px solid #ccc",
                    display: "flex",
                    flexDirection: "column",
                    pr: 1,
                    overflowY: "auto",
                  }}
                >
                  {htmlPassage ? (
                    <Box
                      dangerouslySetInnerHTML={{ __html: htmlPassage }}
                      sx={{ fontSize: "16px", lineHeight: "1.6" }}
                    />
                  ) : (
                    <Typography>Đang tải nội dung...</Typography>
                  )}
                </Box>

                {/* Resizer */}
                <Box
                  onMouseDown={startDragging}
                  sx={{
                    width: "6px",
                    cursor: "col-resize",
                    background: "#c8c8c8",
                    "&:hover": { background: "#999" },
                  }}
                />

                {/* Right Panel */}
                <Box
                  ref={rightPaneRef}
                  sx={{
                    width: `${100 - leftWidth}%`,
                    pl: 1,
                    overflowY: "auto",
                  }}
                >
                  <Box id="questionScrollBox" sx={{ pr: 1 }}>
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
              </Box>

              {/* Combined Part and Question Navigator */}
              <Box
                sx={{
                  width: "100%",
                  mt: 1,
                  py: 1,
                  borderTop: "1px solid #ddd",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1,
                  background: "#fff",
                }}
              >
                {/* Part Navigator */}
                {sections[0]?.childSections?.map((child) => (
                  <Button
                    key={child.SectionId}
                    variant={
                      activeChildSection?.SectionId === child.SectionId
                        ? "contained"
                        : "outlined"
                    }
                    onClick={() => {
                      setActiveChildSection(child);
                      document.getElementById("questionScrollBox")?.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                  >
                    Part {child.OrderIndex + 1}
                  </Button>
                ))}

                {/* Separator */}
                <Box sx={{ width: "2px", height: "32px", background: "#ddd", mx: 1 }} />

                {/* Question Navigator */}
                {activeChildSection?.questions?.map((q, idx) => (
                  <Button
                    key={q.examQuestionId}
                    variant={answers[q.examQuestionId] ? "contained" : "outlined"}
                    color={answers[q.examQuestionId] ? "success" : "primary"}
                    sx={{ minWidth: 40 }}
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
            </>
          )
        )}
      </Container>
    </>
  );
};

export default ExamTakingPage;
