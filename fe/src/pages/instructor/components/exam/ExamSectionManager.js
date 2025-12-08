import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Collapse,
  TextField,
  Paper,
  Divider,
  Chip,
  Alert,
  Menu,
  MenuItem
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  DragIndicator as DragIcon,
  MoreVert as MoreIcon
} from "@mui/icons-material";
import {
  getSectionsApi,
  createExamSectionApi,
  updateExamSectionApi,
  deleteExamSectionApi,
  getQuestionsApi,
  addQuestionsToSectionApi,
  removeQuestionFromSectionApi
} from "../../../../apiServices/instructorExamService";

const ExamSectionManager = ({ open, onClose, exam }) => {
  const [sections, setSections] = useState([]);
  const [expandedSections, setExpandedSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Section Form
  const [openSectionForm, setOpenSectionForm] = useState(false);
  const [sectionFormMode, setSectionFormMode] = useState("create");
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionFormData, setSectionFormData] = useState({
    title: "",
    description: "",
    orderIndex: 0
  });

  // Question Selection
  const [openQuestionSelector, setOpenQuestionSelector] = useState(false);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuSection, setMenuSection] = useState(null);

  useEffect(() => {
    if (open && exam) {
      loadSections();
    }
  }, [open, exam]);

  const loadSections = async () => {
    try {
      setLoading(true);
      const data = await getSectionsApi(exam.ExamID);
      setSections(data);
    } catch (error) {
      showSnackbar(error.message || "Không thể tải danh sách phần thi", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableQuestions = async () => {
    try {
      const data = await getQuestionsApi();
      setAvailableQuestions(data);
    } catch (error) {
      showSnackbar(error.message || "Không thể tải danh sách câu hỏi", "error");
    }
  };

  const handleToggleSection = (sectionId) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleCreateSection = () => {
    setSectionFormMode("create");
    setSectionFormData({
      title: "",
      description: "",
      orderIndex: sections.length
    });
    setOpenSectionForm(true);
  };

  const handleEditSection = (section) => {
    setSectionFormMode("edit");
    setSelectedSection(section);
    setSectionFormData({
      title: section.Title,
      description: section.Description || "",
      orderIndex: section.OrderIndex
    });
    setOpenSectionForm(true);
  };

  const handleSaveSection = async () => {
    try {
      setLoading(true);
      if (sectionFormMode === "create") {
        await createExamSectionApi(exam.ExamID, sectionFormData);
        showSnackbar("Tạo phần thi thành công!", "success");
      } else {
        await updateExamSectionApi(
          exam.ExamID,
          selectedSection.SectionID,
          sectionFormData
        );
        showSnackbar("Cập nhật phần thi thành công!", "success");
      }
      setOpenSectionForm(false);
      loadSections();
    } catch (error) {
      showSnackbar(error.message || "Có lỗi xảy ra", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (section) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phần "${section.Title}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await deleteExamSectionApi(exam.ExamID, section.SectionID);
      showSnackbar("Xóa phần thi thành công!", "success");
      loadSections();
    } catch (error) {
      showSnackbar(error.message || "Không thể xóa phần thi", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestions = (section) => {
    setSelectedSection(section);
    setSelectedQuestions([]);
    loadAvailableQuestions();
    setOpenQuestionSelector(true);
  };

  const handleSaveQuestions = async () => {
    try {
      setLoading(true);
      await addQuestionsToSectionApi(
        exam.ExamID,
        selectedSection.SectionID,
        selectedQuestions
      );
      showSnackbar("Thêm câu hỏi thành công!", "success");
      setOpenQuestionSelector(false);
      loadSections();
    } catch (error) {
      showSnackbar(error.message || "Không thể thêm câu hỏi", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveQuestion = async (section, questionId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này khỏi phần thi?")) {
      return;
    }

    try {
      setLoading(true);
      await removeQuestionFromSectionApi(exam.ExamID, section.SectionID, questionId);
      showSnackbar("Xóa câu hỏi thành công!", "success");
      loadSections();
    } catch (error) {
      showSnackbar(error.message || "Không thể xóa câu hỏi", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMenuOpen = (event, section) => {
    setAnchorEl(event.currentTarget);
    setMenuSection(section);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuSection(null);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Quản lý phần thi - {exam?.Title}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateSection}
            >
              Thêm phần thi
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {sections.length === 0 ? (
            <Alert severity="info">
              Chưa có phần thi nào. Hãy tạo phần thi đầu tiên!
            </Alert>
          ) : (
            <List>
              {sections.map((section, index) => {
                const isExpanded = expandedSections.includes(section.SectionID);
                return (
                  <Paper key={section.SectionID} sx={{ mb: 2 }} variant="outlined">
                    <ListItem
                      secondaryAction={
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleSection(section.SectionID)}
                          >
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, section)}
                          >
                            <MoreIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <DragIcon sx={{ mr: 2, color: "text.secondary" }} />
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="medium">
                            {index + 1}. {section.Title}
                          </Typography>
                        }
                        secondary={
                          <Box display="flex" gap={1} mt={0.5}>
                            <Chip
                              label={`${section.Questions?.length || 0} câu hỏi`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            {section.Description && (
                              <Typography variant="caption" color="text.secondary">
                                {section.Description}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>

                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <Divider />
                      <Box sx={{ p: 2 }}>
                        {section.Questions && section.Questions.length > 0 ? (
                          <List dense>
                            {section.Questions.map((question, qIndex) => (
                              <ListItem
                                key={question.QuestionID}
                                secondaryAction={
                                  <IconButton
                                    edge="end"
                                    size="small"
                                    color="error"
                                    onClick={() =>
                                      handleRemoveQuestion(section, question.QuestionID)
                                    }
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                }
                              >
                                <ListItemText
                                  primary={`${qIndex + 1}. ${question.Content}`}
                                  secondary={
                                    <Box display="flex" gap={1} mt={0.5}>
                                      <Chip
                                        label={question.Type}
                                        size="small"
                                        variant="outlined"
                                      />
                                      <Chip
                                        label={`${question.Points || 0} điểm`}
                                        size="small"
                                        variant="outlined"
                                      />
                                    </Box>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            textAlign="center"
                          >
                            Chưa có câu hỏi nào
                          </Typography>
                        )}
                        <Box display="flex" justifyContent="center" mt={2}>
                          <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => handleAddQuestions(section)}
                            size="small"
                          >
                            Thêm câu hỏi
                          </Button>
                        </Box>
                      </Box>
                    </Collapse>
                  </Paper>
                );
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Section Form Dialog */}
      <Dialog
        open={openSectionForm}
        onClose={() => setOpenSectionForm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {sectionFormMode === "create" ? "Tạo phần thi mới" : "Chỉnh sửa phần thi"}
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              fullWidth
              label="Tiêu đề *"
              value={sectionFormData.title}
              onChange={(e) =>
                setSectionFormData({ ...sectionFormData, title: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Mô tả"
              value={sectionFormData.description}
              onChange={(e) =>
                setSectionFormData({ ...sectionFormData, description: e.target.value })
              }
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              type="number"
              label="Thứ tự"
              value={sectionFormData.orderIndex}
              onChange={(e) =>
                setSectionFormData({
                  ...sectionFormData,
                  orderIndex: parseInt(e.target.value) || 0
                })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSectionForm(false)}>Hủy</Button>
          <Button onClick={handleSaveSection} variant="contained" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Question Selector Dialog */}
      <Dialog
        open={openQuestionSelector}
        onClose={() => setOpenQuestionSelector(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chọn câu hỏi cho phần "{selectedSection?.Title}"</DialogTitle>
        <DialogContent dividers>
          <List>
            {availableQuestions.map((question) => (
              <ListItem
                key={question.QuestionID}
                button
                selected={selectedQuestions.includes(question.QuestionID)}
                onClick={() => {
                  setSelectedQuestions((prev) =>
                    prev.includes(question.QuestionID)
                      ? prev.filter((id) => id !== question.QuestionID)
                      : [...prev, question.QuestionID]
                  );
                }}
              >
                <ListItemText
                  primary={question.Content}
                  secondary={
                    <Box display="flex" gap={1}>
                      <Chip label={question.Type} size="small" variant="outlined" />
                      <Chip
                        label={question.Level}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
          {availableQuestions.length === 0 && (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Không có câu hỏi nào
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQuestionSelector(false)}>Hủy</Button>
          <Button
            onClick={handleSaveQuestions}
            variant="contained"
            disabled={selectedQuestions.length === 0 || loading}
          >
            Thêm ({selectedQuestions.length})
          </Button>
        </DialogActions>
      </Dialog>

      {/* Section Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            handleEditSection(menuSection);
            handleMenuClose();
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDeleteSection(menuSection);
            handleMenuClose();
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Xóa
        </MenuItem>
      </Menu>
    </>
  );
};

export default ExamSectionManager;