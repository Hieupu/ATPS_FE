import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Chip,
  Alert,
  Tooltip,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardActions,
  Grid,
  Divider,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  QuestionAnswer as QuestionIcon,
  Groups as GroupsIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  Class as ClassIcon,
  SwapVert as SortIcon,
} from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getExamsApi,
  getExamDetailApi,
  deleteExamApi,
  archiveExamApi,
  unarchiveExamApi,
  getArchivedExamsApi,
} from "../../../apiServices/instructorExamService";
import ExamDetailDialog from "../components/exam/ExamDetailDialog";
import ExamSectionManager from "../components/exam/ExamSectionManager";

const ExamPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [allExams, setAllExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openSectionManager, setOpenSectionManager] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc"); // "desc" = newest first, "asc" = oldest first

  // Status tabs configuration with simple colors
  const STATUS_TABS = [
    {
      value: "Pending",
      label: "Chờ diễn ra",
      color: "#ff9800",
    },
    {
      value: "Ongoing",
      label: "Đang diễn ra",
      color: "#2196f3",
    },
    {
      value: "Completed",
      label: "Đã hoàn thành",
      color: "#4caf50",
    },
    {
      value: "Archived",
      label: "Đã lưu trữ",
      color: "#757575",
    },
  ];

  const currentStatus = STATUS_TABS[activeTab]?.value;
  
  // Filter and sort exams
  const currentExams = allExams
    .filter((exam) => exam.Status === currentStatus)
    .sort((a, b) => {
      // Prioritize CreatedAt if available, otherwise use StartTime
      const dateA = new Date(a.CreatedAt || a.StartTime);
      const dateB = new Date(b.CreatedAt || b.StartTime);
      
      if (sortOrder === "desc") {
        return dateB - dateA; // Newest first
      } else {
        return dateA - dateB; // Oldest first
      }
    });

  const getStatusCount = (status) => {
    return allExams.filter((exam) => exam.Status === status).length;
  };

  useEffect(() => {
    if (location.state?.message) {
      const { message, severity } = location.state;
      if (severity === "success") {
        toast.success(message);
      } else if (severity === "error") {
        toast.error(message);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const loadAllExams = async () => {
    setLoading(true);
    try {
      const regularExams = await getExamsApi();
      const archived = await getArchivedExamsApi();

      const filteredRegular = (regularExams || []).filter(
        (exam) => exam.Status !== "Archived"
      );

      const combined = [...filteredRegular, ...(archived || [])];
      setAllExams(combined);
    } catch (err) {
      console.error("Load exams error:", err);
      toast.error("Không thể tải danh sách bài thi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllExams();
  }, []);

  const handleOpenCreate = () => {
    navigate("/instructor/exams/create");
  };

  const handleEdit = (exam) => {
    navigate(`/instructor/exams/edit/${exam.ExamID}`);
  };

  const handleViewDetail = async (exam) => {
    try {
      const fullExamData = await getExamDetailApi(exam.ExamID);
      setSelectedExam(fullExamData);
      setOpenDetailDialog(true);
    } catch (err) {
      console.error("Error fetching exam detail:", err);
      toast.error("Không thể tải chi tiết bài thi");
    }
  };

  const handleOpenSectionManager = (exam) => {
    setSelectedExam(exam);
    setOpenSectionManager(true);
  };

  const handleDelete = (exam) => {
    setSelectedExam(exam);
    setOpenDeleteConfirm(true);
  };

  const confirmDeleteExam = async () => {
    try {
      await deleteExamApi(selectedExam.ExamID);
      toast.success("Xóa bài thi thành công!");
      loadAllExams();
    } catch (err) {
      toast.error("Xóa thất bại");
    } finally {
      setOpenDeleteConfirm(false);
      setSelectedExam(null);
    }
  };

  const handleArchive = async (exam) => {
    try {
      await archiveExamApi(exam.ExamID);
      toast.success("Đã lưu trữ bài thi");
      loadAllExams();
    } catch (err) {
      toast.error("Lưu trữ thất bại");
    }
  };

  const handleUnarchive = async (exam) => {
    try {
      await unarchiveExamApi(exam.ExamID);
      toast.success("Đã khôi phục bài thi");
      loadAllExams();
    } catch (err) {
      console.error("Unarchive error:", err);
      toast.error(err.message || "Khôi phục thất bại");
    }
  };

  const formatDateTime = (startTime, endTime) => {
    if (!startTime) return { date: "-", time: "-" };

    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;

    const date = start.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const startTimeStr = start.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (!end) {
      return { date, time: startTimeStr };
    }

    const endTimeStr = end.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (start.toDateString() === end.toDateString()) {
      return {
        date,
        time: `${startTimeStr} - ${endTimeStr}`,
      };
    }

    const endDate = end.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });

    return {
      date,
      time: `${startTimeStr} - ${endTimeStr} (${endDate})`,
    };
  };

  const getClassCount = (className) => {
    if (!className) return 0;
    return className.split(", ").length;
  };

  const getClassTooltip = (className) => {
    if (!className) return "Chưa có lớp học";
    const classes = className.split(", ");
    return classes.join("\n");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f7fa",
        p: 4,
      }}
    >
      {/* Header Section - Clean & Simple */}
      <Box sx={{ mb: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight="700"
              color="text.primary"
              sx={{ mb: 0.5 }}
            >
              Quản lý bài thi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tạo và quản lý các bài kiểm tra cho học viên
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{
              bgcolor: "#1976d2",
              borderRadius: 2,
              px: 3,
              py: 1.2,
              textTransform: "none",
              fontWeight: "600",
              "&:hover": {
                bgcolor: "#1565c0",
              },
            }}
          >
            Tạo bài thi mới
          </Button>
        </Stack>
      </Box>

      {/* Status Tabs - Clean Design */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: "white",
          borderRadius: 2,
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{
            "& .MuiTab-root": {
              fontSize: "0.95rem",
              fontWeight: "600",
              textTransform: "none",
              py: 2,
            },
            "& .Mui-selected": {
              color: "primary.main",
            },
            "& .MuiTabs-indicator": {
              height: 3,
            },
          }}
        >
          {STATUS_TABS.map((tab, index) => (
            <Tab
              key={tab.value}
              label={
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Typography fontWeight="600">{tab.label}</Typography>
                  <Chip
                    label={getStatusCount(tab.value)}
                    size="small"
                    sx={{
                      bgcolor: alpha(tab.color, 0.1),
                      color: tab.color,
                      fontWeight: "700",
                      minWidth: 28,
                      height: 24,
                    }}
                  />
                </Stack>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Sort Control - only show when there are exams */}
      {!loading && currentExams.length > 0 && (
        <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
          <Chip
            icon={<SortIcon />}
            label={sortOrder === "desc" ? "Mới nhất" : "Cũ nhất "}
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            sx={{
              cursor: "pointer",
              fontWeight: "600",
              "&:hover": {
                bgcolor: alpha("#1976d2", 0.1),
              },
            }}
          />
        </Box>
      )}

      {/* Loading State */}
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : currentExams.length === 0 ? (
        // Empty State
        <Paper
          elevation={0}
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            p: 6,
            textAlign: "center",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" fontWeight="600" color="text.secondary" gutterBottom>
            Chưa có bài thi nào
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Hãy tạo bài thi đầu tiên của bạn
          </Typography>
          {activeTab === 0 && (
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              sx={{
                bgcolor: "#1976d2",
                borderRadius: 2,
                px: 3,
                textTransform: "none",
                fontWeight: "600",
              }}
            >
              Tạo bài thi đầu tiên
            </Button>
          )}
        </Paper>
      ) : (
        // Card Grid Layout
        <Grid container spacing={3}>
          {currentExams.map((exam, index) => {
            const { date, time } = formatDateTime(exam.StartTime, exam.EndTime);
            const classCount = getClassCount(exam.ClassName);
            const currentTab = STATUS_TABS[activeTab];

            return (
              <Grid item xs={12} md={6} lg={4} key={exam.ExamID}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    bgcolor: "white",
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                      borderColor: currentTab.color,
                    },
                  }}
                >
                  <CardContent sx={{ pb: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Status Badge */}
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={currentTab.label}
                        size="small"
                        sx={{
                          bgcolor: alpha(currentTab.color, 0.1),
                          color: currentTab.color,
                          fontWeight: "600",
                          fontSize: "0.75rem",
                          borderRadius: 1.5,
                        }}
                      />
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      fontWeight="600"
                      sx={{
                        mb: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        lineHeight: 1.4,
                      }}
                    >
                      {exam.Title}
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    {/* Course & Class Info */}
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ClassIcon
                          sx={{ color: "text.secondary", fontSize: 18 }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {exam.CourseName || "Chưa có khóa học"}
                        </Typography>
                      </Stack>

                      {classCount > 0 && (
                        <Tooltip
                          title={
                            <Box sx={{ whiteSpace: "pre-line", p: 0.5 }}>
                              {getClassTooltip(exam.ClassName)}
                            </Box>
                          }
                          arrow
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ cursor: "help" }}
                          >
                            <GroupsIcon
                              sx={{ color: "text.secondary", fontSize: 18 }}
                            />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {classCount} lớp học
                            </Typography>
                          </Stack>
                        </Tooltip>
                      )}

                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 'auto !important' }}>
                        <ScheduleIcon
                          sx={{ color: "text.secondary", fontSize: 18 }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight="500"
                        >
                          {time}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarIcon
                          sx={{ color: "text.secondary", fontSize: 18 }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {date}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>

                  {/* Actions */}
                  <CardActions
                    sx={{
                      px: 2,
                      pb: 2,
                      pt: 1,
                      justifyContent: "flex-end",
                    }}
                  >
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetail(exam)}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {exam.Status === "Pending" && (
                        <>
                          <Tooltip title="Sửa">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(exam)}
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}

                      {exam.Status === "Archived" ? (
                        <Tooltip title="Khôi phục">
                          <IconButton
                            size="small"
                            onClick={() => handleUnarchive(exam)}
                            color="success"
                          >
                            <UnarchiveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : exam.Status === "Completed" ? (
                        // CHỈ cho lưu trữ bài thi ĐÃ HOÀN THÀNH
                        <Tooltip title="Lưu trữ">
                          <IconButton
                            size="small"
                            onClick={() => handleArchive(exam)}
                          >
                            <ArchiveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : null}

                      {exam.Status === "Pending" && (
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(exam)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Dialogs */}
      {selectedExam && (
        <>
          <ExamDetailDialog
            open={openDetailDialog}
            onClose={() => setOpenDetailDialog(false)}
            exam={selectedExam}
          />

          <ExamSectionManager
            open={openSectionManager}
            onClose={() => {
              setOpenSectionManager(false);
              loadAllExams();
            }}
            exam={selectedExam}
          />
        </>
      )}

      {/* Confirm Delete Dialog */}
      <Dialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "600" }}>
          Xác nhận xóa
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Bạn có chắc chắn muốn xóa bài thi{" "}
            <strong>"{selectedExam?.Title}"</strong>?
          </Typography>
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight="600">
              Hành động này không thể hoàn tác!
            </Typography>
            <Typography variant="body2">
              Bài thi sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpenDeleteConfirm(false)}
            sx={{
              textTransform: "none",
              fontWeight: "600",
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={confirmDeleteExam}
            variant="contained"
            color="error"
            sx={{
              textTransform: "none",
              fontWeight: "600",
              px: 3,
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </Box>
  );
};

export default ExamPage;