import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper
} from "@mui/material";

const QuestionPreviewDialog = ({ question, onClose }) => {
  if (!question) return null;

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Chi tiết câu hỏi</DialogTitle>

      <DialogContent dividers>
        <Typography variant="h6" gutterBottom>
          {question.content}
        </Typography>

        <Box mb={2}>
          <Typography variant="body2" sx={{ display: "inline-block", mr: 2 }}>
            <strong>Loại:</strong> {question.type}
          </Typography>

          <Typography variant="body2" sx={{ display: "inline-block", mr: 2 }}>
            <strong>Độ khó:</strong> {question.difficulty}
          </Typography>

          <Typography variant="body2" sx={{ display: "inline-block" }}>
            <strong>Điểm:</strong> {question.score}
          </Typography>
        </Box>

        {/* Options nếu có */}
        {question.options?.length > 0 && (
          <Box>
            <Typography fontWeight="bold">Đáp án:</Typography>
            <Paper sx={{ mt: 1, p: 2 }}>
              {question.options.map((opt, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 1,
                    borderBottom: idx < question.options.length - 1 ? "1px solid #eee" : "none"
                  }}
                >
                  {opt}
                </Box>
              ))}
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuestionPreviewDialog;
