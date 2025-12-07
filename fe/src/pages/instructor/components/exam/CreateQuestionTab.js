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
    matchingPairs: [
      { left: "", right: "" },
    ],
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

    if (!currentQuestion.type) {
      newErrors.type = "Vui lòng chọn loại câu hỏi";
    }

    switch (currentQuestion.type) {
      case "multiple_choice":
        if (currentQuestion.options.length < 2) {
          newErrors.options = "Phải có ít nhất 2 lựa chọn";
        } else {
          const hasCorrect = currentQuestion.options.some((o) => o.isCorrect);
          if (!hasCorrect) {
            newErrors.options = "Phải có ít nhất 1 đáp án đúng";
          }
          const emptyOption = currentQuestion.options.some((o) => !o.content?.trim());
          if (emptyOption) {
            newErrors.options = "Tất cả lựa chọn phải có nội dung";
          }
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
        if (currentQuestion.matchingPairs.length === 0) {
          newErrors.matchingPairs = "Phải có ít nhất 1 cặp ghép";
        } else {
          const emptyPair = currentQuestion.matchingPairs.some(
            (p) => !p.left?.trim() || !p.right?.trim()
          );
          if (emptyPair) {
            newErrors.matchingPairs = "Tất cả cặp ghép phải có nội dung";
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddQuestion = () => {
    if (!validate()) return;

    const questionToAdd = {
      ...currentQuestion,
      id: `q-${Date.now()}`,
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
        {/* Left Side - Form */}
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Tạo câu hỏi mới
            </Typography>

            <Stack spacing={3} mt={2}>
              {/* Question Type */}
              <TextField
                select
                fullWidth
                label="Loại câu hỏi *"
                value={currentQuestion.type}
                onChange={(e) => handleChange("type", e.target.value)}
                error={Boolean(errors.type)}
                helperText={errors.type}
              >
                {QUESTION_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>

              {/* Question Content */}
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Nội dung câu hỏi *"
                value={currentQuestion.content}
                onChange={(e) => handleChange("content", e.target.value)}
                error={Boolean(errors.content)}
                helperText={errors.content}
                placeholder="Nhập nội dung câu hỏi..."
              />

              {/* Level & Point - Using Stack for consistent spacing */}
              <Stack direction="row" spacing={2}>
                <TextField
                  select
                  fullWidth
                  label="Độ khó"
                  value={currentQuestion.level}
                  onChange={(e) => handleChange("level", e.target.value)}
                >
                  {QUESTION_LEVELS.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  type="number"
                  label="Điểm"
                  value={currentQuestion.point}
                  onChange={(e) => handleChange("point", parseInt(e.target.value) || 1)}
                  InputProps={{ inputProps: { min: 1, max: 100 } }}
                />
              </Stack>

              {/* Topic - Full width for consistency */}
              <TextField
                fullWidth
                label="Chủ đề (Tùy chọn)"
                value={currentQuestion.topic}
                onChange={(e) => handleChange("topic", e.target.value)}
                placeholder="Ví dụ: Grammar, Vocabulary, ..."
              />

              <Divider />

              {/* Type-specific fields */}
              {currentQuestion.type === "multiple_choice" && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Các lựa chọn *
                  </Typography>
                  {errors.options && (
                    <Typography variant="caption" color="error">
                      {errors.options}
                    </Typography>
                  )}
                  <Stack spacing={2} mt={1}>
                    {currentQuestion.options.map((option, index) => (
                      <Box key={index} display="flex" gap={1} alignItems="center">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={option.isCorrect}
                              onChange={(e) =>
                                handleOptionChange(index, "isCorrect", e.target.checked)
                              }
                              color="success"
                            />
                          }
                          label=""
                        />
                        <TextField
                          fullWidth
                          size="small"
                          placeholder={`Lựa chọn ${index + 1}`}
                          value={option.content}
                          onChange={(e) =>
                            handleOptionChange(index, "content", e.target.value)
                          }
                        />
                        <IconButton
                          size="small"
                          onClick={() => removeOption(index)}
                          disabled={currentQuestion.options.length <= 2}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addOption}
                      variant="outlined"
                      size="small"
                    >
                      Thêm lựa chọn
                    </Button>
                  </Stack>
                </Box>
              )}

              {currentQuestion.type === "true_false" && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Đáp án đúng *
                  </Typography>
                  <RadioGroup
                    value={currentQuestion.correctAnswer}
                    onChange={(e) => handleChange("correctAnswer", e.target.value)}
                  >
                    <FormControlLabel value="true" control={<Radio />} label="True" />
                    <FormControlLabel value="false" control={<Radio />} label="False" />
                  </RadioGroup>
                  {errors.correctAnswer && (
                    <Typography variant="caption" color="error">
                      {errors.correctAnswer}
                    </Typography>
                  )}
                </Box>
              )}

              {currentQuestion.type === "fill_in_blank" && (
                <TextField
                  fullWidth
                  label="Đáp án đúng *"
                  value={currentQuestion.correctAnswer}
                  onChange={(e) => handleChange("correctAnswer", e.target.value)}
                  error={Boolean(errors.correctAnswer)}
                  helperText={errors.correctAnswer || "Nhập đáp án điền vào chỗ trống"}
                  placeholder="Ví dụ: Paris"
                />
              )}

              {currentQuestion.type === "matching" && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Các cặp ghép *
                  </Typography>
                  {errors.matchingPairs && (
                    <Typography variant="caption" color="error">
                      {errors.matchingPairs}
                    </Typography>
                  )}
                  <Stack spacing={2} mt={1}>
                    {currentQuestion.matchingPairs.map((pair, index) => (
                      <Box key={index} display="flex" gap={1} alignItems="center">
                        <TextField
                          size="small"
                          placeholder="Cột A"
                          value={pair.left}
                          onChange={(e) =>
                            handleMatchingChange(index, "left", e.target.value)
                          }
                          sx={{ flex: 1 }}
                        />
                        <Typography>↔</Typography>
                        <TextField
                          size="small"
                          placeholder="Cột B"
                          value={pair.right}
                          onChange={(e) =>
                            handleMatchingChange(index, "right", e.target.value)
                          }
                          sx={{ flex: 1 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => removeMatchingPair(index)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addMatchingPair}
                      variant="outlined"
                      size="small"
                    >
                      Thêm cặp ghép
                    </Button>
                  </Stack>
                </Box>
              )}

              {(currentQuestion.type === "essay" || currentQuestion.type === "speaking") && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "#f5f5f5",
                    borderRadius: 1,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {currentQuestion.type === "essay"
                      ? "Câu hỏi tự luận sẽ được chấm thủ công"
                      : "Câu hỏi Speaking sẽ yêu cầu học viên ghi âm"}
                  </Typography>
                </Box>
              )}

              {/* Add Button */}
              <Button
                fullWidth
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleAddQuestion}
                size="large"
              >
                Lưu câu hỏi
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Right Side - Preview Questions */}
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 3, position: "sticky", top: 16 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Câu hỏi đã tạo ({questions.length})
            </Typography>

            {questions.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Chưa có câu hỏi nào
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2} mt={2} sx={{ maxHeight: 500, overflowY: "auto" }}>
                {questions.map((q, index) => (
                  <Paper key={q.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Typography variant="body2" fontWeight={600} gutterBottom>
                          Q{index + 1}. {q.content.substring(0, 60)}
                          {q.content.length > 60 && "..."}
                        </Typography>
                        <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
                          <Chip label={q.type} size="small" color="primary" variant="outlined" />
                          <Chip label={q.level} size="small" variant="outlined" />
                          {q.topic && <Chip label={q.topic} size="small" variant="outlined" />}
                          <Chip label={`${q.point} điểm`} size="small" variant="outlined" />
                        </Stack>
                      </Box>
                      <IconButton size="small" onClick={() => removeQuestion(index)} color="error">
                        <DeleteIcon fontSize="small" />
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