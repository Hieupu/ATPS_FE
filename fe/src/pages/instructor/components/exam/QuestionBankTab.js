import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Paper,
  Stack,
  Typography,
  Checkbox,
  Chip,
  Slider,
  InputAdornment,
  CircularProgress,
  Alert,
  Button,
  Divider,
  IconButton,
  Badge,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getQuestionsApi } from "../../../../apiServices/instructorExamService";

const QUESTION_TYPES = [
  { value: "", label: "Tất cả" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "true_false", label: "True/False" },
  { value: "fill_in_blank", label: "Fill in Blank" },
  { value: "matching", label: "Matching" },
  { value: "essay", label: "Essay" },
  { value: "speaking", label: "Speaking" },
];

const QUESTION_LEVELS = [
  { value: "", label: "Tất cả" },
  { value: "Easy", label: "Easy" },
  { value: "Medium", label: "Medium" },
  { value: "Hard", label: "Hard" },
];

const QuestionBankTab = ({ selectedQuestions, setSelectedQuestions }) => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    topic: "",
    level: "",
    pointRange: [1, 10],
  });

  useEffect(() => {
    loadQuestions();
  }, [filters.type, filters.level, filters.topic]);

  const loadQuestions = async () => {
    setLoading(true);
    setError("");
    try {
      const filterParams = {
        type: filters.type || undefined,
        level: filters.level || undefined,
        topic: filters.topic || undefined,
      };

      const data = await getQuestionsApi(filterParams);
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load questions error:", err);
      setError("Không thể tải câu hỏi. Vui lòng thử lại.");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleQuestion = (question) => {
    const isSelected = selectedQuestions.some((q) => q.QuestionID === question.QuestionID);

    if (isSelected) {
      setSelectedQuestions((prev) =>
        prev.filter((q) => q.QuestionID !== question.QuestionID)
      );
    } else {
      const formattedQuestion = {
        id: question.QuestionID,
        QuestionID: question.QuestionID,
        Content: question.Content,
        Type: question.Type,
        Level: question.Level,
        Point: question.Point || 1,
        Topic: question.Topic,
        CorrectAnswer: question.CorrectAnswer,
        options: question.options || [],
        fromBank: true,
      };
      setSelectedQuestions((prev) => [...prev, formattedQuestion]);
    }
  };

  const handleRemoveSelected = (questionId) => {
    setSelectedQuestions((prev) =>
      prev.filter((q) => q.QuestionID !== questionId)
    );
  };

  const handleSelectAll = (filteredQuestions) => {
    const newSelections = filteredQuestions.map((q) => ({
      id: q.QuestionID,
      QuestionID: q.QuestionID,
      Content: q.Content,
      Type: q.Type,
      Level: q.Level,
      Point: q.Point || 1,
      Topic: q.Topic,
      CorrectAnswer: q.CorrectAnswer,
      options: q.options || [],
      fromBank: true,
    }));

    // Merge with existing selections (avoid duplicates)
    setSelectedQuestions((prev) => {
      const existingIds = new Set(prev.map((q) => q.QuestionID));
      const uniqueNew = newSelections.filter((q) => !existingIds.has(q.QuestionID));
      return [...prev, ...uniqueNew];
    });
  };

  const handleDeselectAll = () => {
    setSelectedQuestions([]);
  };

  // Apply client-side filters
  const filteredQuestions = questions.filter((q) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!q.Content?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Backend already filters Active, no need to check Status

    // Point range filter
    const point = q.Point || 1;
    if (point < filters.pointRange[0] || point > filters.pointRange[1]) {
      return false;
    }

    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Left Side - Filters */}
        <Grid item xs={12} md={3}>
          <Paper variant="outlined" sx={{ p: 2, position: "sticky", top: 16 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Bộ lọc
            </Typography>

            <Stack spacing={2} mt={2}>
              {/* Search */}
              <TextField
                fullWidth
                size="small"
                placeholder="Tìm kiếm câu hỏi..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Type */}
              <TextField
                select
                fullWidth
                size="small"
                label="Loại câu hỏi"
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              >
                {QUESTION_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>

              {/* Level */}
              <TextField
                select
                fullWidth
                size="small"
                label="Độ khó"
                value={filters.level}
                onChange={(e) => handleFilterChange("level", e.target.value)}
              >
                {QUESTION_LEVELS.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </TextField>

              {/* Topic */}
              <TextField
                fullWidth
                size="small"
                label="Chủ đề"
                value={filters.topic}
                onChange={(e) => handleFilterChange("topic", e.target.value)}
                placeholder="Ví dụ: Grammar"
              />

              {/* Point Range */}
              <Box>
                <Typography variant="body2" gutterBottom>
                  Điểm: {filters.pointRange[0]} - {filters.pointRange[1]}
                </Typography>
                <Slider
                  value={filters.pointRange}
                  onChange={(e, newValue) => handleFilterChange("pointRange", newValue)}
                  min={1}
                  max={10}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 1, label: "1" },
                    { value: 10, label: "10" },
                  ]}
                />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Middle - Available Questions */}
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            {/* Header */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body1" fontWeight={600}>
                  Danh sách câu hỏi ({filteredQuestions.length})
                </Typography>
                <Stack direction="row" spacing={1}>
                  {filteredQuestions.length > 0 && (
                    <Button
                      size="small"
                      onClick={() => handleSelectAll(filteredQuestions)}
                      variant="outlined"
                    >
                      Chọn tất cả
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Paper>

            {/* Loading */}
            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {/* Error */}
            {error && (
              <Alert severity="error" onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            {/* Questions List */}
            {!loading && !error && (
              <Box sx={{ maxHeight: 600, overflowY: "auto" }}>
                {filteredQuestions.length === 0 ? (
                  <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
                    <Typography color="text.secondary">
                      Không tìm thấy câu hỏi nào phù hợp
                    </Typography>
                  </Paper>
                ) : (
                  <Stack spacing={1.5}>
                    {filteredQuestions.map((question) => {
                      const isSelected = selectedQuestions.some(
                        (q) => q.QuestionID === question.QuestionID
                      );

                      return (
                        <Paper
                          key={question.QuestionID}
                          variant="outlined"
                          sx={{
                            p: 2,
                            cursor: "pointer",
                            border: isSelected ? "2px solid #1976d2" : "1px solid #e0e0e0",
                            bgcolor: isSelected ? "#e3f2fd" : "white",
                            transition: "all 0.2s",
                            "&:hover": {
                              bgcolor: isSelected ? "#e3f2fd" : "#f5f5f5",
                              boxShadow: 1,
                            },
                          }}
                          onClick={() => handleToggleQuestion(question)}
                        >
                          <Stack direction="row" spacing={2} alignItems="flex-start">
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleToggleQuestion(question)}
                              onClick={(e) => e.stopPropagation()}
                              sx={{ mt: -0.5 }}
                            />
                            <Box flex={1}>
                              <Typography variant="body1" gutterBottom>
                                {question.Content}
                              </Typography>
                              
                              {/* Improved chips layout - horizontal row */}
                              <Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap" useFlexGap>
                                <Chip
                                  label={question.Type}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                                {question.Level && (
                                  <Chip
                                    label={question.Level}
                                    size="small"
                                    color={
                                      question.Level === "Easy"
                                        ? "success"
                                        : question.Level === "Hard"
                                        ? "error"
                                        : "warning"
                                    }
                                    variant="outlined"
                                  />
                                )}
                                {question.Topic && (
                                  <Chip
                                    label={question.Topic}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                                <Chip
                                  label={`${question.Point || 1} điểm`}
                                  size="small"
                                  variant="outlined"
                                />
                              </Stack>
                            </Box>
                            
                            {/* Selected indicator */}
                            {isSelected && (
                              <CheckCircleIcon color="primary" fontSize="small" sx={{ mt: 0.5 }} />
                            )}
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Stack>
                )}
              </Box>
            )}
          </Stack>
        </Grid>

        {/* Right Side - Selected Questions */}
        <Grid item xs={12} md={4}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              position: "sticky", 
              top: 16,
              maxHeight: "calc(100vh - 32px)",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600}>
                <Badge badgeContent={selectedQuestions.length} color="primary" max={999}>
                  Đã chọn
                </Badge>
              </Typography>
              {selectedQuestions.length > 0 && (
                <Button
                  size="small"
                  onClick={handleDeselectAll}
                  color="error"
                  variant="text"
                >
                  Xóa tất cả
                </Button>
              )}
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {selectedQuestions.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography color="text.secondary" variant="body2">
                  Chưa chọn câu hỏi nào
                </Typography>
                <Typography color="text.secondary" variant="caption" sx={{ mt: 1, display: "block" }}>
                  Click vào câu hỏi bên trái để thêm
                </Typography>
              </Box>
            ) : (
              <Box sx={{ 
                overflowY: "auto", 
                flex: 1,
                pr: 1,
                // Custom scrollbar
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  bgcolor: "#f1f1f1",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "#888",
                  borderRadius: "4px",
                  "&:hover": {
                    bgcolor: "#555",
                  },
                },
              }}>
                <Stack spacing={1.5}>
                  {selectedQuestions.map((question, index) => (
                    <Paper
                      key={question.QuestionID}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        bgcolor: "#f8f9fa",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        {/* Index */}
                        <Box
                          sx={{
                            minWidth: 24,
                            height: 24,
                            borderRadius: "50%",
                            bgcolor: "#1976d2",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          {index + 1}
                        </Box>

                        <Box flex={1}>
                          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.4 }}>
                            {question.Content}
                          </Typography>
                          
                          {/* Compact chips */}
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                            <Chip
                              label={question.Type}
                              size="small"
                              color="primary"
                              sx={{ height: 20, fontSize: "0.7rem" }}
                            />
                            <Chip
                              label={question.Level}
                              size="small"
                              color={
                                question.Level === "Easy"
                                  ? "success"
                                  : question.Level === "Hard"
                                  ? "error"
                                  : "warning"
                              }
                              sx={{ height: 20, fontSize: "0.7rem" }}
                            />
                            {question.Topic && (
                              <Chip
                                label={question.Topic}
                                size="small"
                                sx={{ height: 20, fontSize: "0.7rem" }}
                              />
                            )}
                            <Chip
                              label={`${question.Point} đ`}
                              size="small"
                              sx={{ height: 20, fontSize: "0.7rem" }}
                            />
                          </Stack>
                        </Box>

                        {/* Remove button */}
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveSelected(question.QuestionID)}
                          sx={{
                            color: "error.main",
                            "&:hover": {
                              bgcolor: "error.lighter",
                            },
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}

            {selectedQuestions.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Tổng: <strong>{selectedQuestions.length}</strong> câu hỏi
                </Typography>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QuestionBankTab;