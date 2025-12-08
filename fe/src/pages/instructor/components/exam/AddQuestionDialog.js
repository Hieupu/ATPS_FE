import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CreateQuestionTab from "./CreateQuestionTab";
import QuestionBankTab from "./QuestionBankTab";

const AddQuestionDialog = ({ open, onClose, onSave, parentSectionId, childSectionId }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [newQuestions, setNewQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  useEffect(() => {
    if (open) {
      setActiveTab(0);
      setNewQuestions([]);
      setSelectedQuestions([]);
    }
  }, [open]);

  const handleSave = () => {
    const questionsToSave =
      activeTab === 0
        ? newQuestions // From Create New tab
        : selectedQuestions; // From Question Bank tab

    if (questionsToSave.length === 0) {
      alert("Vui lòng tạo hoặc chọn ít nhất một câu hỏi");
      return;
    }

    onSave(questionsToSave);
    onClose();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={600}>
            Thêm câu hỏi vào phân mục
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab
            label="Tạo câu hỏi mới"
            sx={{
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: activeTab === 0 ? 600 : 400,
            }}
          />
          <Tab
            label="Ngân hàng câu hỏi"
            sx={{
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: activeTab === 1 ? 600 : 400,
            }}
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ minHeight: 500, p: 0 }}>
        {activeTab === 0 && (
          <CreateQuestionTab
            questions={newQuestions}
            setQuestions={setNewQuestions}
          />
        )}
        {activeTab === 1 && (
          <QuestionBankTab
            selectedQuestions={selectedQuestions}
            setSelectedQuestions={setSelectedQuestions}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #e0e0e0" }}>
        <Box flex={1}>
          {activeTab === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {newQuestions.length > 0
                ? `Đã tạo ${newQuestions.length} câu hỏi`
                : "Chưa có câu hỏi nào"}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {selectedQuestions.length > 0
                ? `Đã chọn ${selectedQuestions.length} câu hỏi`
                : "Chưa chọn câu hỏi nào"}
            </Typography>
          )}
        </Box>
        <Button onClick={onClose} variant="outlined">
          Hủy
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={
          activeTab === 0 ? newQuestions.length === 0 : selectedQuestions.length === 0
        }>
          Lưu & Thêm vào phần thi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddQuestionDialog;