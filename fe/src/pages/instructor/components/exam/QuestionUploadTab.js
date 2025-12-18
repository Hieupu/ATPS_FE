import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Chip,
  Divider,
  Alert,
  Stack,
  Card,
  CardContent,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import * as XLSX from "xlsx";

const normalizeQuestion = (row, index) => {
  const rawType = (row["Loại"] || "").toString().trim().toLowerCase();
  const tempId = Date.now() + index;

  let type = "";
  if (rawType.includes("multiple")) type = "multiple_choice";
  else if (rawType.includes("true") || rawType.includes("false")) type = "true_false";
  else if (rawType.includes("fill")) type = "fill_in_blank";
  else if (rawType.includes("match")) type = "matching";
  else if (rawType.includes("essay")) type = "essay";
  else if (rawType.includes("speak")) type = "speaking";
  else return null;

  const content = row["Nội dung"] || "";
  const level = row["Mức độ"] || "Medium";
  const point = Number(row["Điểm"]) || 1;
  const topic = row["Chủ đề"] || "";

  if (type === "matching") {
    const leftList = (row["Tùy chọn A"] || "").split("\n").map(s => s.trim()).filter(Boolean);
    const rightList = (row["Tùy chọn B"] || "").split("\n").map(s => s.trim()).filter(Boolean);
    const matchingPairs = leftList.map((left, idx) => ({
      left,
      right: rightList[idx] || "",
    }));
    const correctAnswer = Object.fromEntries(matchingPairs.map(p => [p.left, p.right]));

    return {
      id: tempId,
      QuestionID: null,
      content,
      type,
      level,
      point,
      topic,
      options: [],
      correctAnswer,
      matchingPairs,
    };
  }

  if (type === "true_false") {
    const correct = (row["Đáp án"] || "").toString().trim().toLowerCase();
    return {
      id: tempId,
      QuestionID: null,
      content,
      type,
      level,
      point,
      topic,
      options: [],
      correctAnswer: correct === "true" ? "true" : "false",
    };
  }

  if (type === "fill_in_blank") {
    return {
      id: tempId,
      QuestionID: null,
      content,
      type,
      level,
      point,
      topic,
      options: [],
      correctAnswer: (row["Đáp án"] || "").toString().trim(),
    };
  }

  if (["essay", "speaking"].includes(type)) {
    return {
      id: tempId,
      QuestionID: null,
      content,
      type,
      level,
      point,
      topic,
      options: [],
      correctAnswer: "",
      matchingPairs: [],
    };
  }

  const rawOptions = [
    row["Tùy chọn A"],
    row["Tùy chọn B"],
    row["Tùy chọn C"],
    row["Tùy chọn D"],
  ].filter(Boolean);

  const correctAnswer = (row["Đáp án"] || "").toString().trim();
  const correctLetters = correctAnswer.split(",").map(l => l.trim().toUpperCase());

  const options = rawOptions.map((opt, idx) => ({
    content: opt,
    isCorrect: correctLetters.includes(String.fromCharCode(65 + idx)),
  }));

  return {
    id: tempId,
    QuestionID: null,
    content,
    type: "multiple_choice",
    level,
    point,
    topic,
    options,
    correctAnswer,
    matchingPairs: [],
  };
};

const QuestionUploadTab = ({ uploadedQuestions = [], setUploadedQuestions }) => {
  const [loading, setLoading] = useState(false);

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templates/questions_template.xlsx';
    link.download = 'questions_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      if (rows.length === 0) {
        alert("File Excel không có dữ liệu hợp lệ!");
        return;
      }

      const parsed = rows.map((row, index) => normalizeQuestion(row, index));

      setUploadedQuestions(parsed);
    } catch (err) {
      console.error("Excel parse error:", err);
      alert("Không thể đọc file Excel!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          border: "2px dashed",
          borderColor: "grey.300",
          bgcolor: "grey.50",
          borderRadius: 2,
          textAlign: "center",
          mb: 3,
        }}
      >
        <UploadIcon sx={{ fontSize: 60, color: "grey.400", mb: 2 }} />
        <Typography variant="h6" mb={2}>
          Tải file Excel của bạn
        </Typography>

        <Button
          variant="contained"
          component="label"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
          sx={{ textTransform: "none" }}
        >
          {loading ? "Đang xử lý..." : "Chọn file Excel"}
          <input type="file" accept=".xlsx,.xls" hidden onChange={handleFileSelect} />
        </Button>
      </Paper>

      {uploadedQuestions.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            border: "2px dashed",
            borderColor: "primary.main",
            bgcolor: "primary.50",
            borderRadius: 2,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <DownloadIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" fontWeight={600} color="primary">
                Tải File Mẫu
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chưa biết cách tạo file Excel? Tải file mẫu về để tham khảo định dạng chuẩn.
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadTemplate}
            sx={{ textTransform: "none" }}
          >
            Tải File Mẫu
          </Button>
        </Paper>
      )}

      {uploadedQuestions.length > 0 && (
        <Box mt={4}>
          <Stack direction="row" spacing={1} alignItems="center" mb={3}>
            <CheckIcon color="success" sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight={600}>
              Đã import {uploadedQuestions.length} câu hỏi
            </Typography>
          </Stack>

          <Stack spacing={2}>
            {uploadedQuestions.map((q, index) => (
              <Card
                key={index}
                elevation={1}
                sx={{
                  transition: "all 0.3s",
                  "&:hover": {
                    boxShadow: 4,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Câu {index + 1}: {q.content}
                  </Typography>

                  <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
                    <Chip
                      label={`Loại: ${q.type}`}
                      color="primary"
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`Độ khó: ${q.level}`}
                      color="secondary"
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`Điểm: ${q.point}`}
                      color="success"
                      size="small"
                      variant="outlined"
                    />
                    {q.topic && (
                      <Chip
                        label={`Chủ đề: ${q.topic}`}
                        color="info"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Stack>

                  {q.type === "matching" && q.matchingPairs && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" fontWeight={600} mb={1}>
                        Các cặp ghép đôi:
                      </Typography>
                      <Box pl={2}>
                        {q.matchingPairs.map((pair, i) => (
                          <Typography key={i} variant="body2" color="text.secondary">
                            • {pair.left} → {pair.right}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {q.type === "multiple_choice" && q.options && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" fontWeight={600} mb={1}>
                        Các lựa chọn:
                      </Typography>
                      <Box pl={2}>
                        {q.options.map((opt, i) => (
                          <Typography
                            key={i}
                            variant="body2"
                            sx={{
                              color: opt.isCorrect ? "success.main" : "text.secondary",
                              fontWeight: opt.isCorrect ? 600 : 400,
                            }}
                          >
                            {String.fromCharCode(65 + i)}. {opt.content}{" "}
                            {opt.isCorrect}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {q.type === "true_false" && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" fontWeight={600} mb={1}>
                        Đáp án đúng:
                      </Typography>
                      <Box >
                        <Chip
                          label={q.correctAnswer === "true" ? "True" : "False"}
                          color="success"
                          size="small"
                        />
                      </Box>
                    </Box>
                  )}

                  {q.type === "fill_in_blank" && q.correctAnswer && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" fontWeight={600} mb={1}>
                        Đáp án đúng:
                      </Typography>
                      <Box>
                        <Typography variant="body2" color="success.main" fontWeight={600}>
                          "{q.correctAnswer}"
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default QuestionUploadTab;