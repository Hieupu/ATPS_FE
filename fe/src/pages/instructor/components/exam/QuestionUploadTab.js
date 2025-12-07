import React, { useState } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import * as XLSX from "xlsx";

/* ===========================================
   🔥 NORMALIZE QUESTION — HỖ TRỢ TẤT CẢ LOẠI
   =========================================== */
const normalizeQuestion = (row, index) => {
  const type = row["Loại"]?.trim() || "";
  const correct = (row["Đáp án"] || "").toString().trim();

  /* --------------------------
     1️⃣ MATCHING
     -------------------------- */
  if (type === "matching") {
    const leftList = (row["Tùy chọn A"] || "").split("\n").filter(Boolean);
    const rightList = (row["Tùy chọn B"] || "").split("\n").filter(Boolean);

    const options = leftList.map((item, idx) => ({
      left: item,
      right: rightList[idx] || "",
    }));

    const correctAnswer = {};
    options.forEach(p => correctAnswer[p.left] = p.right);

    return {
      id: Date.now() + index,
      content: row["Nội dung"] || "",
      type,
      level: row["Mức độ"] || "",
      point: row["Điểm"] || 1,
      topic: row["Chủ đề"] || "",
      options,
      correctAnswer,
    };
  }

  /* --------------------------
     2️⃣ MULTIPLE CHOICE
     -------------------------- */
  const rawOptions = [
    row["Tùy chọn A"],
    row["Tùy chọn B"],
    row["Tùy chọn C"],
    row["Tùy chọn D"],
  ].filter(Boolean);

  const options = rawOptions.map((opt, idx) => ({
    content: opt,
    isCorrect:
      correct.includes(String.fromCharCode(65 + idx)) || // A B C D
      correct.toLowerCase() === opt?.toLowerCase(),      // hoặc text
  }));

  /* --------------------------
     3️⃣ OTHER QUESTION TYPES
     -------------------------- */
  return {
    id: Date.now() + index,
    content: row["Nội dung"] || "",
    type,
    level: row["Mức độ"] || "",
    point: row["Điểm"] || 1,
    topic: row["Chủ đề"] || "",
    options,
    correctAnswer: correct,
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

      {/* Danh sách câu hỏi */}
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

              {/* Preview Matching trong list */}
              {q.type === "matching" && (
                <Box mt={1}>
                  {q.options.map((pair, i) => (
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
