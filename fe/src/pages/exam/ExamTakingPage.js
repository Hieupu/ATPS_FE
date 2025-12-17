import React, { useEffect, useMemo, useState, useRef, memo, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Send,
  ArrowBack,
  Fullscreen,
  FullscreenExit,
  AccessTime,
  CheckCircle,
  Timer,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { debounce } from "lodash";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getExamToDoApi,
  saveAnswerApi,
  submitExamApi,
  hasRemainingAttempts,
  getRemainingAttempts,
  buildSubmitPayload,
  formatDurationText,
} from "../../apiServices/learnerExamService";
import { cloudinaryUpload } from "../../utils/cloudinaryUpload";
import { loadFileAsHtml } from "../../utils/fileToHtml";
import { QuestionRenderer } from "./QuestionComponents";
import "./ExamTaking.css";

const AudioPlayer = memo(
  ({ audioUrl }) => {
    const audioRef = useRef(null);
    if (!audioUrl) return null;

    return (
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 2,
          p: 3,
          mb: 3,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Typography variant="h6" sx={{ color: "white", mb: 2, textAlign: "center" }}>
          Audio Listening
        </Typography>
        <Box sx={{ bgcolor: "white", borderRadius: 2, p: 2 }}>
          <audio ref={audioRef} controls style={{ width: "100%" }} preload="metadata" key={audioUrl}>
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </Box>
      </Box>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.audioUrl === nextProps.audioUrl;
  }
);

AudioPlayer.displayName = "AudioPlayer";

const QuestionBlock = memo(
  ({ question, answers, onChange, onAudioUpload }) => {
    const value = answers[question.examQuestionId] || "";

    const handleChange = useCallback(
      (newValue) => {
        onChange(question.examQuestionId, newValue);
      },
      [question.examQuestionId, onChange]
    );

    return (
      <Card className="question-card" id={`q_${question.examQuestionId}`} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Chip label={`Question ${question.orderIndex + 1}`} color="primary" />
            <Typography variant="caption">{question.point} point</Typography>
          </Box>

          <Typography sx={{ mb: 2, fontWeight: 500 }}>{question.content}</Typography>

          <QuestionRenderer
            question={question}
            value={value}
            onChange={handleChange}
            onUpload={onAudioUpload}
          />
        </CardContent>
      </Card>
    );
  },
  (prevProps, nextProps) => {
    const prevValue = prevProps.answers[prevProps.question.examQuestionId];
    const nextValue = nextProps.answers[nextProps.question.examQuestionId];

    return (
      prevProps.question === nextProps.question &&
      prevValue === nextValue &&
      prevProps.onAudioUpload === nextProps.onAudioUpload
    );
  }
);

QuestionBlock.displayName = "QuestionBlock";

const LeftPane = memo(
  ({ audioUrl, htmlPassage, width }) => {
    return (
      <Box
        className="scroll-panel"
        sx={{
          width: `${width}%`,
          borderRight: "1px solid #ccc",
          background: "#fafafa",
          p: 3,
          overflowY: "auto",
        }}
      >
        {audioUrl && <AudioPlayer audioUrl={audioUrl} />}

        {htmlPassage ? (
          <div dangerouslySetInnerHTML={{ __html: htmlPassage }} />
        ) : (
          <Typography color="text.secondary">No passage content</Typography>
        )}
      </Box>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.audioUrl === nextProps.audioUrl &&
      prevProps.htmlPassage === nextProps.htmlPassage &&
      prevProps.width === nextProps.width
    );
  }
);

LeftPane.displayName = "LeftPane";

const ExamTakingPage = () => {
  const { instanceId } = useParams();
  const navigate = useNavigate();

  const [instance, setInstance] = useState(null);
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [activeChildSection, setActiveChildSection] = useState(null);
  const [htmlPassage, setHtmlPassage] = useState("");
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [startTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerIntervalRef = useRef(null);
  const elapsedTimerRef = useRef(null);
  const [leftWidth, setLeftWidth] = useState(42);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const currentAudioUrl = useMemo(() => {
    return activeChildSection?.audioUrl || null;
  }, [activeChildSection?.audioUrl]);

  useEffect(() => {
    const loadExam = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getExamToDoApi(instanceId);

        if (!data || !data.sections) {
          throw new Error("Không có dữ liệu bài thi");
        }

        if (!hasRemainingAttempts(data.instance)) {
          alert("Bạn đã hết lượt làm bài thi này");
          navigate(-1);
          return;
        }

        setInstance(data.instance);
        setSections(data.sections || []);

        const answerMap = {};
        data.sections.forEach((section) => {
          section.childSections?.forEach((child) => {
            child.questions?.forEach((q) => {
              if (q.learnerAnswer !== null && q.learnerAnswer !== undefined) {
                answerMap[q.examQuestionId] = q.learnerAnswer;
              }
            });
          });
        });

        setAnswers(answerMap);

        if (data.sections.length > 0) {
          const firstSection = data.sections[0];
          setActiveSection(firstSection);

          if (firstSection.childSections?.length > 0) {
            const firstChild = firstSection.childSections[0];
            setActiveChildSection(firstChild);
          }
        }

        if (data.instance?.examDuration) {
          const durationInSeconds = data.instance.examDuration * 60;
          setTimeLeft(durationInSeconds);
        }
      } catch (err) {
        setError(err.message || "Không thể tải bài thi");
        setShowError(true);
      } finally {
        setLoading(false);
      }
    };

    if (instanceId) {
      loadExam();
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current);
      }
    };
  }, [instanceId, navigate]);

  useEffect(() => {
    const loadPassage = async () => {
      if (!activeChildSection?.FileURL) {
        setHtmlPassage("");
        return;
      }

      try {
        const html = await loadFileAsHtml(activeChildSection.FileURL);
        setHtmlPassage(html);
      } catch (err) {
        console.error("Load passage error:", err);
        setHtmlPassage("");
      }
    };

    loadPassage();
  }, [activeChildSection?.FileURL]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timeLeft]);

  useEffect(() => {
    elapsedTimerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    if (seconds === null) return "--:--:--";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const debouncedSave = useMemo(
    () =>
      debounce(async (answersToSave) => {
        try {
          const answersArray = Object.entries(answersToSave).map(([examQuestionId, answer]) => ({
            examQuestionId: parseInt(examQuestionId),
            answer: answer || "",
          }));

          await saveAnswerApi(instanceId, answersArray);
        } catch (err) {
          console.error("Auto-save error:", err);
        }
      }, 1500),
    [instanceId]
  );

  const handleAnswerChange = useCallback(
    (examQuestionId, value) => {
      setAnswers((prev) => {
        const updated = { ...prev, [examQuestionId]: value };
        debouncedSave(updated);
        return updated;
      });
    },
    [debouncedSave]
  );

  const handleAudioUpload = useCallback(async (audioBlob) => {
    const url = await cloudinaryUpload(audioBlob);
    if (!url) {
      throw new Error("Không thể upload audio");
    }
    return url;
  }, []);

  const handleSubmit = () => {
    const answeredCount = Object.values(answers).filter((a) => a && a.trim()).length;
    const totalQuestions = sections.reduce((sum, sec) => {
      return (
        sum +
        (sec.childSections?.reduce((childSum, child) => {
          return childSum + (child.questions?.length || 0);
        }, 0) || 0)
      );
    }, 0);

    if (answeredCount < totalQuestions) {
      if (
        !window.confirm(
          `Bạn mới trả lời ${answeredCount}/${totalQuestions} câu. Bạn có chắc muốn nộp bài?`
        )
      ) {
        return;
      }
    }

    setSubmitDialogOpen(true);
  };

  const confirmSubmit = async () => {
    try {
      setSubmitting(true);
      setSubmitDialogOpen(false);

      const payload = buildSubmitPayload(
        Object.entries(answers).map(([examQuestionId, answer]) => ({
          examQuestionId: parseInt(examQuestionId),
          answer,
        })),
        startTime,
        {
          metadata: {
            totalQuestionsAttempted: Object.keys(answers).length,
          },
        }
      );

      const result = await submitExamApi(instanceId, payload);

      toast.success("Nộp bài thành công", { autoClose: 2000 });

      setTimeout(() => {
        navigate(`/exam/${instanceId}/result`, { replace: true });
      }, 1000);
    } catch (err) {
      console.error("Submit error:", err);
      alert(err.message || "Lỗi khi nộp bài");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    alert("Hết giờ! Bài thi sẽ được nộp tự động.");
    await confirmSubmit();
  };

  const handleSectionChange = async (section) => {
    setActiveSection(section);

    if (section.childSections?.length > 0) {
      const firstChild = section.childSections[0];
      setActiveChildSection(firstChild);
    }
  };

  const handleChildTabClickByIndex = async (index) => {
    if (!activeSection?.childSections || !activeSection.childSections[index]) {
      return;
    }

    const child = activeSection.childSections[index];
    setActiveChildSection(child);
    document.querySelector(".scroll-panel:last-child")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Đang tải bài thi...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Quay lại
        </Button>
      </Container>
    );
  }

  return (
    <>
      <ToastContainer />
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setShowError(false)} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: 1.5,
          background: "#fff",
          borderBottom: "1px solid #ddd",
          position: "sticky",
          top: 0,
          zIndex: 1100,
        }}
      >
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
          Quay lại
        </Button>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          {sections.map((section, idx) => {
            const sectionType =
              section.childSections?.[0]?.Type || section.Type || `Section ${idx + 1}`;

            return (
              <Button
                key={section.SectionId}
                variant={activeSection?.SectionId === section.SectionId ? "contained" : "outlined"}
                color="primary"
                onClick={() => handleSectionChange(section)}
              >
                {sectionType.toUpperCase()}
              </Button>
            );
          })}
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Chip
            icon={<Timer />}
            label={formatTime(elapsedTime)}
            color="info"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />

          {timeLeft !== null && (
            <Chip
              icon={<AccessTime />}
              label={formatTime(timeLeft)}
              color={timeLeft < 300 ? "error" : "primary"}
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          )}

          <Button
            variant="outlined"
            color="primary"
            onClick={toggleFullscreen}
            sx={{ minWidth: "auto", px: 1.5 }}
          >
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </Button>

          <Button
            variant="contained"
            color="success"
            startIcon={<Send />}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Đang nộp..." : "NỘP BÀI"}
          </Button>
        </Box>
      </Box>

      <Box
        ref={containerRef}
        sx={{
          display: "flex",
          width: "100%",
          height: "calc(100vh - 140px)",
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <LeftPane audioUrl={currentAudioUrl} htmlPassage={htmlPassage} width={leftWidth} />

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
            pb: 10,
            overflowY: "auto",
          }}
        >
          {activeChildSection?.questions?.length > 0 ? (
            activeChildSection.questions.map((q) => (
              <QuestionBlock
                key={q.examQuestionId}
                question={q}
                answers={answers}
                onChange={handleAnswerChange}
                onAudioUpload={handleAudioUpload}
              />
            ))
          ) : (
            <Alert severity="info">Không có câu hỏi</Alert>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          py: 1.5,
          borderTop: "1px solid #ddd",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          background: "#fff",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
          zIndex: 1000,
        }}
      >
        {activeSection?.childSections?.map((child, index) => {
          const partNumber =
            child.orderIndex !== undefined && child.orderIndex !== null ? child.orderIndex + 1 : index + 1;

          const isActive = activeChildSection?.childSectionId === child.childSectionId;

          return (
            <Button
              key={child.childSectionId || index}
              variant={isActive ? "contained" : "outlined"}
              color="primary"
              onClick={() => {
                handleChildTabClickByIndex(index);
              }}
              size="small"
            >
              Part {partNumber}
            </Button>
          );
        })}

        {activeChildSection?.questions?.length > 0 && (
          <Box sx={{ width: "2px", height: "32px", background: "#ddd", mx: 1 }} />
        )}

        {activeChildSection?.questions?.map((q, idx) => {
          const hasAnswer = answers[q.examQuestionId];
          return (
            <Button
              key={q.examQuestionId}
              variant={hasAnswer ? "contained" : "outlined"}
              color={hasAnswer ? "success" : "primary"}
              sx={{ minWidth: 40 }}
              size="small"
              onClick={() =>
                document.getElementById(`q_${q.examQuestionId}`)?.scrollIntoView({ behavior: "smooth" })
              }
            >
              {idx + 1}
            </Button>
          );
        })}
      </Box>

      <Dialog open={submitDialogOpen} onClose={() => setSubmitDialogOpen(false)}>
        <DialogTitle>Xác nhận nộp bài</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn nộp bài? Sau khi nộp, bạn không thể chỉnh sửa câu trả lời.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialogOpen(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={confirmSubmit} variant="contained" color="primary" disabled={submitting}>
            {submitting ? "Đang nộp..." : "Xác nhận nộp"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExamTakingPage;