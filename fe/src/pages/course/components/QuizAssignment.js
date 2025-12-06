import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  Box,
  Card,
  Typography,
  Grid,
  Paper,
  Divider,
  TextField,
  IconButton,
  Button,
} from "@mui/material";
import {
  Mic,
  Stop,
  PlayArrow,
  Delete,
  CheckCircle,
  RadioButtonUnchecked,
  Check,
  Close,
} from "@mui/icons-material";

// --- SUB-COMPONENT: MATCHING (NỐI) ---
const MatchingQuestion = ({ question, currentAnswer, onAnswerChange }) => {
  const containerRef = useRef(null);
  const [lines, setLines] = useState([]);
  const [drawingLine, setDrawingLine] = useState(null); // { startItem, startX, startY, currX, currY }
  const leftPoints = useRef({});
  const rightPoints = useRef({});

  const { leftItems, rightItems } = useMemo(() => {
    try {
      const pairs = JSON.parse(question.CorrectAnswer || "{}");
      const left = Object.keys(pairs);
      const right = Object.values(pairs).sort(() => Math.random() - 0.5);
      return { leftItems: left, rightItems: right };
    } catch {
      return { leftItems: [], rightItems: [] };
    }
  }, [question.CorrectAnswer]);

  useEffect(() => {
    if (!currentAnswer) {
      setLines([]);
      return;
    }
    try {
      const savedMatches = JSON.parse(currentAnswer);
      const newLines = Object.entries(savedMatches).map(([left, right]) => ({
        start: left,
        end: right,
      }));
      setLines(newLines);
    } catch {
      setLines([]);
    }
  }, [currentAnswer]);

  const getCoords = (element) => {
    if (!element || !containerRef.current) return { x: 0, y: 0 };
    const rect = element.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    return {
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top + rect.height / 2,
    };
  };

  const handleBoxClick = (side, item) => {
    // Logic: Click Left -> Start Drawing. Click Right -> Finish.
    if (side === "left") {
      const isAlreadyMatched = lines.some((l) => l.start === item);
      // Nếu đã nối, click lại để hủy nối cũ và bắt đầu nối mới
      const currentLines = isAlreadyMatched
        ? lines.filter((l) => l.start !== item)
        : lines;
      if (isAlreadyMatched) updateAnswer(currentLines);

      const coords = getCoords(leftPoints.current[item]);
      setDrawingLine({
        startItem: item,
        startX: coords.x,
        startY: coords.y,
        currX: coords.x,
        currY: coords.y,
      });
    } else if (side === "right" && drawingLine) {
      const newLines = lines.filter(
        (l) => l.start !== drawingLine.startItem && l.end !== item
      );
      newLines.push({ start: drawingLine.startItem, end: item });
      updateAnswer(newLines);
      setDrawingLine(null);
    }
  };

  const updateAnswer = (newLines) => {
    setLines(newLines);
    const answerObj = newLines.reduce((acc, line) => {
      acc[line.start] = line.end;
      return acc;
    }, {});
    onAnswerChange(JSON.stringify(answerObj));
  };

  const handleMouseMove = (e) => {
    if (!drawingLine || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    setDrawingLine((prev) => ({
      ...prev,
      currX: e.clientX - containerRect.left,
      currY: e.clientY - containerRect.top,
    }));
  };

  // Hủy vẽ nếu click ra ngoài vùng nối
  const handleContainerClick = (e) => {
    if (e.target === containerRef.current) {
      setDrawingLine(null);
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{ position: "relative", p: 2, minHeight: 300, userSelect: "none" }}
      onMouseMove={handleMouseMove}
      onClick={handleContainerClick}
    >
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        {lines.map((line) => {
          const start = getCoords(leftPoints.current[line.start]);
          const end = getCoords(rightPoints.current[line.end]);
          return (
            <line
              key={`${line.start}-${line.end}`}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="#2196f3"
              strokeWidth="3"
            />
          );
        })}
        {drawingLine && (
          <line
            x1={drawingLine.startX}
            y1={drawingLine.startY}
            x2={drawingLine.currX}
            y2={drawingLine.currY}
            stroke="#2196f3"
            strokeWidth="3"
            strokeDasharray="5"
          />
        )}
      </svg>

      <Grid
        container
        spacing={8}
        alignItems="center"
        sx={{ position: "relative", zIndex: 2 }}
      >
        <Grid item xs={5}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {leftItems.map((item) => {
              const isSelected = drawingLine?.startItem === item;
              const isMatched = lines.some((l) => l.start === item);
              return (
                <Paper
                  key={item}
                  elevation={isSelected ? 4 : 1}
                  onClick={() => handleBoxClick("left", item)}
                  sx={{
                    p: 1.5,
                    position: "relative",
                    cursor: "pointer",
                    bgcolor: isMatched || isSelected ? "primary.50" : "white",
                    border: "2px solid",
                    borderColor: isSelected
                      ? "primary.main"
                      : isMatched
                      ? "primary.light"
                      : "transparent",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      transform: "translateX(5px)",
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item}
                  </Typography>
                  <Box
                    ref={(el) => (leftPoints.current[item] = el)}
                    sx={{
                      position: "absolute",
                      right: -6,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor:
                        isMatched || isSelected ? "primary.main" : "grey.300",
                    }}
                  />
                </Paper>
              );
            })}
          </Box>
        </Grid>

        <Grid item xs={2} />

        <Grid item xs={5}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {rightItems.map((item) => {
              const isMatched = lines.some((l) => l.end === item);
              return (
                <Paper
                  key={item}
                  elevation={1}
                  onClick={() => handleBoxClick("right", item)}
                  sx={{
                    p: 1.5,
                    position: "relative",
                    cursor: "pointer",
                    bgcolor: isMatched ? "primary.50" : "white",
                    border: "2px solid",
                    borderColor: isMatched ? "primary.light" : "transparent",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      transform: "translateX(-5px)",
                    },
                  }}
                >
                  <Box
                    ref={(el) => (rightPoints.current[item] = el)}
                    sx={{
                      position: "absolute",
                      left: -6,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: isMatched ? "primary.main" : "grey.300",
                    }}
                  />
                  <Typography variant="body2" align="right">
                    {item}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

// --- SUB-COMPONENT: SPEAKING (GHI ÂM) ---
const SpeakingQuestion = ({ currentAnswer, onAnswerChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);

  const toggleRecord = () => {
    if (isRecording) {
      clearInterval(intervalRef.current);
      setIsRecording(false);
      onAnswerChange("dummy_audio_file.mp3"); // Giả lập đã lưu file
    } else {
      setTimer(0);
      setIsRecording(true);
      intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    }
  };

  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <Box
      sx={{
        textAlign: "center",
        p: 3,
        border: "1px dashed",
        borderColor: "grey.400",
        borderRadius: 2,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          fontFamily: "monospace",
          color: isRecording ? "error.main" : "text.secondary",
        }}
      >
        {formatTime(timer)}
      </Typography>

      {!currentAnswer ? (
        <Button
          variant="contained"
          color={isRecording ? "error" : "primary"}
          startIcon={isRecording ? <Stop /> : <Mic />}
          onClick={toggleRecord}
          sx={{ borderRadius: 10, px: 4, py: 1.5 }}
        >
          {isRecording ? "Dừng ghi âm" : "Bắt đầu nói"}
        </Button>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 1,
              px: 2,
              bgcolor: "primary.50",
              color: "primary.main",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CheckCircle fontSize="small" /> Đã ghi âm (0:15)
          </Paper>
          <IconButton color="error" onClick={() => onAnswerChange("")}>
            <Delete />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

// --- MAIN COMPONENT ---
const QuizAssignment = ({ assignmentData, answers, onAnswerChange }) => {
  const { questions = [] } = useMemo(
    () => assignmentData || {},
    [assignmentData]
  );

  const renderQuestionInput = (question) => {
    const qId = question.AssignmentQuestionId;
    const currentVal = answers?.[qId] || "";

    switch (question.Type) {
      case "multiple_choice":
        return (
          <Grid container spacing={2}>
            {question.Options?.map((opt) => {
              const isSelected = currentVal === opt.OptionID?.toString();
              return (
                <Grid item xs={12} sm={6} key={opt.OptionID}>
                  <Paper
                    elevation={0}
                    onClick={() =>
                      onAnswerChange(qId, opt.OptionID?.toString())
                    }
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      border: "1px solid",
                      borderRadius: 2,
                      borderColor: isSelected ? "primary.main" : "divider",
                      bgcolor: isSelected ? "primary.50" : "background.paper",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: isSelected ? "primary.50" : "grey.50",
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        color: isSelected ? "primary.main" : "text.disabled",
                      }}
                    >
                      {isSelected ? <CheckCircle /> : <RadioButtonUnchecked />}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: isSelected ? 600 : 400 }}
                    >
                      {opt.Content}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        );

      case "true_false":
        return (
          <Grid container spacing={2}>
            {[
              { val: "true", label: "Đúng", icon: <Check />, color: "success" },
              { val: "false", label: "Sai", icon: <Close />, color: "error" },
            ].map((opt) => {
              const isSelected = currentVal === opt.val;
              return (
                <Grid item xs={6} key={opt.val}>
                  <Paper
                    elevation={0}
                    onClick={() => onAnswerChange(qId, opt.val)}
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      textAlign: "center",
                      border: "1px solid",
                      borderRadius: 2,
                      borderColor: isSelected ? `${opt.color}.main` : "divider",
                      bgcolor: isSelected
                        ? `${opt.color}.50`
                        : "background.paper",
                      color: isSelected
                        ? `${opt.color}.main`
                        : "text.secondary",
                      transition: "all 0.2s",
                      "&:hover": { borderColor: `${opt.color}.main` },
                    }}
                  >
                    <Box sx={{ fontSize: 24, mb: 1 }}>{opt.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {opt.label}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        );

      case "matching":
        return (
          <MatchingQuestion
            question={question}
            currentAnswer={currentVal}
            onAnswerChange={(v) => onAnswerChange(qId, v)}
          />
        );

      case "speaking":
        return (
          <SpeakingQuestion
            currentAnswer={currentVal}
            onAnswerChange={(v) => onAnswerChange(qId, v)}
          />
        );

      case "fill_in_blank":
      case "essay":
        return (
          <TextField
            fullWidth
            multiline
            minRows={question.Type === "essay" ? 6 : 2}
            placeholder={
              question.Type === "essay"
                ? "Viết câu trả lời luận của bạn..."
                : "Điền vào chỗ trống..."
            }
            value={currentVal}
            onChange={(e) => onAnswerChange(qId, e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "grey.50",
              },
              "& .MuiOutlinedInput-root.Mui-focused": { bgcolor: "white" },
            }}
          />
        );

      default:
        return <Typography color="error">Loại câu hỏi không hỗ trợ</Typography>;
    }
  };

  if (!questions.length) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {questions.map((question, index) => (
        <Card
          key={question.QuestionID || index}
          elevation={0}
          sx={{
            p: 3,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                bgcolor: "primary.main",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: 14,
              }}
            >
              {index + 1}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {question.Content}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />
          {renderQuestionInput(question)}
        </Card>
      ))}
    </Box>
  );
};

export default React.memo(QuizAssignment);
