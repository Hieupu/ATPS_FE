import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Grid,
  Typography,
  IconButton,
  Paper,
  Stack,
  Chip,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Divider,
} from "@mui/material";

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

const QUESTION_TYPES = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "true_false", label: "True/False" },
  { value: "fill_in_blank", label: "Fill in the Blank" },
  { value: "matching", label: "Matching" },
  { value: "essay", label: "Essay" },
  { value: "speaking", label: "Speaking" },
];

const QUESTION_LEVELS = [
  { value: "Easy", label: "Easy" },
  { value: "Medium", label: "Medium" },
  { value: "Hard", label: "Hard" },
];

const CreateQuestionTab = ({ questions, setQuestions }) => {
  const [currentQuestion, setCurrentQuestion] = useState({
    content: "",
    type: "multiple_choice",
    level: "Medium",
    point: 1,
    topic: "",
    options: [
      { content: "", isCorrect: false },
      { content: "", isCorrect: false },
    ],
    correctAnswer: "",
    matchingPairs: [{ left: "", right: "" }],
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setCurrentQuestion((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setCurrentQuestion((prev) => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: [...prev.options, { content: "", isCorrect: false }],
    }));
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length <= 2) {
      alert("Phải có ít nhất 2 lựa chọn");
      return;
    }
    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    setCurrentQuestion((prev) => ({ ...prev, options: newOptions }));
  };

  const handleMatchingChange = (index, field, value) => {
    const newPairs = [...currentQuestion.matchingPairs];
    newPairs[index] = { ...newPairs[index], [field]: value };
    setCurrentQuestion((prev) => ({ ...prev, matchingPairs: newPairs }));
  };

  const addMatchingPair = () => {
    setCurrentQuestion((prev) => ({
      ...prev,
      matchingPairs: [...prev.matchingPairs, { left: "", right: "" }],
    }));
  };

  const removeMatchingPair = (index) => {
    if (currentQuestion.matchingPairs.length <= 1) return;
    const newPairs = currentQuestion.matchingPairs.filter((_, i) => i !== index);
    setCurrentQuestion((prev) => ({ ...prev, matchingPairs: newPairs }));
  };

  const validate = () => {
    const newErrors = {};

    if (!currentQuestion.content?.trim()) {
      newErrors.content = "Nội dung câu hỏi là bắt buộc";
    }

    switch (currentQuestion.type) {
      case "multiple_choice":
        if (currentQuestion.options.length < 2) {
          newErrors.options = "Phải có ít nhất 2 lựa chọn";
        } else {
          const hasCorrect = currentQuestion.options.some((o) => o.isCorrect);
          const emptyOption = currentQuestion.options.some((o) => !o.content?.trim());
          if (!hasCorrect) newErrors.options = "Phải có ít nhất 1 đáp án đúng";
          if (emptyOption) newErrors.options = "Tất cả lựa chọn phải có nội dung";
        }
        break;

      case "true_false":
        if (!currentQuestion.correctAnswer) {
          newErrors.correctAnswer = "Vui lòng chọn đáp án đúng";
        }
        break;

      case "fill_in_blank":
        if (!currentQuestion.correctAnswer?.trim()) {
          newErrors.correctAnswer = "Đáp án đúng là bắt buộc";
        }
        break;

      case "matching":
        const emptyPair = currentQuestion.matchingPairs.some(
          (p) => !p.left?.trim() || !p.right?.trim()
        );
        if (emptyPair) newErrors.matchingPairs = "Tất cả cặp ghép phải có nội dung";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ======================================================
     ⭐ FIX CỰC QUAN TRỌNG:
     - KHÔNG BAO GIỜ dùng QuestionID = Date.now()
     - FE chỉ tạo ID tạm (id), còn QuestionID phải = null
     ====================================================== */
  const handleAddQuestion = () => {
    if (!validate()) return;

    const questionToAdd = {
      ...currentQuestion,
      id: Date.now(),   // 🔥 ID FE-only, an toàn
      QuestionID: null, // 🔥 FIX: BE sẽ sinh QuestionID thật
      createdAt: new Date().toISOString(),
    };

    setQuestions((prev) => [...prev, questionToAdd]);

    // Reset form
    setCurrentQuestion({
      content: "",
      type: "multiple_choice",
      level: "Medium",
      point: 1,
      topic: "",
      options: [
        { content: "", isCorrect: false },
        { content: "", isCorrect: false },
      ],
      correctAnswer: "",
      matchingPairs: [{ left: "", right: "" }],
    });

    setErrors({});
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* LEFT: Create Question Form */}
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              Tạo câu hỏi mới
            </Typography>

            <Stack spacing={3} mt={2}>
              {/* Question content */}
              <TextField
                select
                fullWidth
                label="Loại câu hỏi *"
                value={currentQuestion.type}
                onChange={(e) => handleChange("type", e.target.value)}
              >
                {QUESTION_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Nội dung câu hỏi *"
                value={currentQuestion.content}
                onChange={(e) => handleChange("content", e.target.value)}
                error={!!errors.content}
                helperText={errors.content}
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  select
                  fullWidth
                  label="Độ khó"
                  value={currentQuestion.level}
                  onChange={(e) => handleChange("level", e.target.value)}
                >
                  {QUESTION_LEVELS.map((l) => (
                    <MenuItem key={l.value} value={l.value}>
                      {l.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  type="number"
                  label="Điểm"
                  value={currentQuestion.point}
                  onChange={(e) => handleChange("point", parseInt(e.target.value) || 1)}
                />
              </Stack>

              <TextField
                fullWidth
                label="Chủ đề (Tùy chọn)"
                value={currentQuestion.topic}
                onChange={(e) => handleChange("topic", e.target.value)}
              />

              <Divider />

              {/* MULTIPLE CHOICE */}
              {currentQuestion.type === "multiple_choice" && (
                <>
                  <Typography fontWeight={600}>Các lựa chọn *</Typography>

                  {currentQuestion.options.map((opt, i) => (
                    <Stack direction="row" spacing={1} key={i}>
                      <Checkbox
                        checked={opt.isCorrect}
                        onChange={(e) =>
                          handleOptionChange(i, "isCorrect", e.target.checked)
                        }
                      />
                      <TextField
                        fullWidth
                        value={opt.content}
                        onChange={(e) =>
                          handleOptionChange(i, "content", e.target.value)
                        }
                        placeholder={`Lựa chọn ${i + 1}`}
                      />
                      <IconButton
                        disabled={currentQuestion.options.length <= 2}
                        onClick={() => removeOption(i)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  ))}

                  <Button onClick={addOption} startIcon={<AddIcon />}>
                    Thêm lựa chọn
                  </Button>

                  {errors.options && <Typography color="error">{errors.options}</Typography>}
                </>
              )}

              {/* TRUE / FALSE */}
              {currentQuestion.type === "true_false" && (
                <>
                  <Typography fontWeight={600}>Đáp án đúng</Typography>
                  <RadioGroup
                    value={currentQuestion.correctAnswer}
                    onChange={(e) => handleChange("correctAnswer", e.target.value)}
                  >
                    <FormControlLabel value="true" control={<Radio />} label="True" />
                    <FormControlLabel value="false" control={<Radio />} label="False" />
                  </RadioGroup>

                  {errors.correctAnswer && (
                    <Typography color="error">{errors.correctAnswer}</Typography>
                  )}
                </>
              )}

              {/* FILL IN BLANK */}
              {currentQuestion.type === "fill_in_blank" && (
                <TextField
                  fullWidth
                  label="Đáp án đúng *"
                  value={currentQuestion.correctAnswer}
                  onChange={(e) =>
                    handleChange("correctAnswer", e.target.value)
                  }
                  error={!!errors.correctAnswer}
                  helperText={errors.correctAnswer}
                />
              )}

              {/* MATCHING */}
              {currentQuestion.type === "matching" && (
                <>
                  <Typography fontWeight={600}>Các cặp ghép *</Typography>

                  {currentQuestion.matchingPairs.map((p, i) => (
                    <Stack direction="row" spacing={1} key={i}>
                      <TextField
                        value={p.left}
                        onChange={(e) =>
                          handleMatchingChange(i, "left", e.target.value)
                        }
                        placeholder="Cột A"
                      />
                      <Typography>↔</Typography>
                      <TextField
                        value={p.right}
                        onChange={(e) =>
                          handleMatchingChange(i, "right", e.target.value)
                        }
                        placeholder="Cột B"
                      />
                      <IconButton
                        disabled={currentQuestion.matchingPairs.length <= 1}
                        onClick={() => removeMatchingPair(i)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  ))}

                  <Button onClick={addMatchingPair} startIcon={<AddIcon />}>
                    Thêm cặp ghép
                  </Button>

                  {errors.matchingPairs && (
                    <Typography color="error">{errors.matchingPairs}</Typography>
                  )}
                </>
              )}

              {/* SAVE BUTTON */}
              <Button
                fullWidth
                variant="contained"
                onClick={handleAddQuestion}
                startIcon={<SaveIcon />}
              >
                Lưu câu hỏi
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* RIGHT: Preview */}
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography fontWeight={600}>
              Câu hỏi đã tạo ({questions.length})
            </Typography>

            {questions.length === 0 ? (
              <Typography mt={3} textAlign="center">
                Chưa có câu hỏi nào
              </Typography>
            ) : (
              <Stack spacing={2} mt={2}>
                {questions.map((q, i) => (
                  <Paper key={q.id} sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Box>
                        <Typography fontWeight={600}>
                          Q{i + 1}. {q.content.slice(0, 60)}
                          {q.content.length > 60 && "..."}
                        </Typography>

                        <Stack direction="row" spacing={1} mt={1}>
                          <Chip size="small" label={q.type} />
                          <Chip size="small" label={q.level} />
                          <Chip size="small" label={`${q.point} điểm`} />
                        </Stack>
                      </Box>

                      <IconButton color="error" onClick={() => removeQuestion(i)}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateQuestionTab;
