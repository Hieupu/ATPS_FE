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
import QuestionUploadTab from "./QuestionUploadTab";

const AddQuestionDialog = ({ open, onClose, onSave, examId, parentSectionId, childSectionId }) => {
  const [activeTab, setActiveTab] = useState(0);

  const [newQuestions, setNewQuestions] = useState([]);          // TAB 1
  const [selectedQuestions, setSelectedQuestions] = useState([]); // TAB 2
  const [uploadedQuestions, setUploadedQuestions] = useState([]); // TAB 3

  useEffect(() => {
    if (open) {
      setActiveTab(0);
      setNewQuestions([]);
      setSelectedQuestions([]);
      setUploadedQuestions([]);
    }
  }, [open]);

  const handleSave = () => {
    let result = [];

    if (activeTab === 0) result = newQuestions;
    if (activeTab === 1) result = selectedQuestions;
    if (activeTab === 2) result = uploadedQuestions;

    if (result.length === 0) {
      alert("Vui lòng thêm hoặc chọn ít nhất một câu hỏi");
      return;
    }

    onSave(result);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6">Thêm câu hỏi vào phân mục</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* TABS */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Tạo câu hỏi mới" />
          <Tab label="Ngân hàng câu hỏi" />
          <Tab label="Upload file Excel" />
        </Tabs>
      </Box>

      {/* CONTENT */}
      <DialogContent sx={{ minHeight: 500, p: 0 }}>
        {activeTab === 0 && (
          <CreateQuestionTab questions={newQuestions} setQuestions={setNewQuestions} />
        )}

        {activeTab === 1 && (
          <QuestionBankTab
            selectedQuestions={selectedQuestions}
            setSelectedQuestions={setSelectedQuestions}
          />
        )}

        {activeTab === 2 && (
          <QuestionUploadTab
            examId={examId}
            sectionId={childSectionId}
            uploadedQuestions={uploadedQuestions}
            setUploadedQuestions={setUploadedQuestions}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">Hủy</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={
            activeTab === 0 && newQuestions.length === 0 ||
            activeTab === 1 && selectedQuestions.length === 0 ||
            activeTab === 2 && uploadedQuestions.length === 0
          }
        >
          Lưu & Thêm vào phần thi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddQuestionDialog;
