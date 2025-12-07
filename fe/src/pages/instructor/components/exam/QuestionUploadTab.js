import React, { useState } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import * as XLSX from "xlsx";

/* ===========================================
   🔥 NORMALIZE — TRẢ VỀ ĐÚNG FORMAT BACKEND
   =========================================== */
const normalizeQuestion = (row, index) => {
  const rawType = (row["Loại"] || "").toString().trim().toLowerCase();
  const tempId = Date.now() + index;

  // === CHUẨN HÓA TYPE ===
  let type = "";
  if (rawType.includes("multiple")) type = "multiple_choice";
  else if (rawType.includes("true") || rawType.includes("false")) type = "true_false";
  else if (rawType.includes("fill")) type = "fill_in_blank";
  else if (rawType.includes("match")) type = "matching";
  else if (rawType.includes("essay")) type = "essay";
  else if (rawType.includes("speak")) type = "speaking";
  else return null; // Bỏ dòng lỗi

  const content = row["Nội dung"] || "";
  const level = row["Mức độ"] || "Medium";
  const point = Number(row["Điểm"]) || 1;
  const topic = row["Chủ đề"] || "";

  // === XỬ LÝ THEO TYPE ===
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

  // === MULTIPLE CHOICE (mặc định nếu không khớp) ===
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


/* ===========================================
   🔥 COMPONENT UPLOAD FILE
   =========================================== */
const QuestionUploadTab = ({ uploadedQuestions = [], setUploadedQuestions }) => {
  const [loading, setLoading] = useState(false);

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
      <Typography variant="subtitle1" mb={2}>
        Tải file Excel chứa danh sách câu hỏi
      </Typography>

      <Button variant="outlined" component="label" disabled={loading} fullWidth>
        {loading ? <CircularProgress size={22} /> : "Chọn file Excel"}
        <input type="file" accept=".xlsx,.xls" hidden onChange={handleFileSelect} />
      </Button>

      {uploadedQuestions.length > 0 && (
        <Box mt={3}>
          <Typography fontWeight={600} mb={1}>
            Đã import {uploadedQuestions.length} câu hỏi
          </Typography>

          {uploadedQuestions.map((q, index) => (
            <Box
              key={index}
              sx={{
                p: 1.5,
                mb: 1,
                borderRadius: "6px",
                background: "#f5f5f5",
              }}
            >
              <Typography fontWeight={600}>
                Q{index + 1}: {q.content}
              </Typography>

              <Typography variant="body2">Loại: {q.type}</Typography>
              <Typography variant="body2">Độ khó: {q.level}</Typography>
              <Typography variant="body2">Điểm: {q.point}</Typography>

              {q.type === "matching" && (
                <Box mt={1}>
                  {q.matchingPairs.map((pair, i) => (
                    <Typography key={i} variant="body2">
                      {pair.left} → {pair.right}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default QuestionUploadTab;
