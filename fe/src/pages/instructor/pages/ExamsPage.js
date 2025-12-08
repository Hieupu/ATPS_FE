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
  const [sortOrder, setSortOrder] = useState("desc");

  const STATUS_TABS = [
    { value: "Pending", label: "Chờ diễn ra", color: "#ff9800" },
    { value: "Ongoing", label: "Đang diễn ra", color: "#2196f3" },
    { value: "Completed", label: "Đã hoàn thành", color: "#4caf50" },
    { value: "Archived", label: "Đã lưu trữ", color: "#757575" },
  ];

  const currentStatus = STATUS_TABS[activeTab]?.value;

  /** ---------------------------------------------------------
   * FIX LỚN NHẤT: Draft → Pending để bài mới tạo hiển thị
   * --------------------------------------------------------- */
  const normalizeExamStatus = (exam) => {
    if (exam.Status === "Draft") {
      return { ...exam, Status: "Pending" };
    }
    return exam;
  };

  const currentExams = allExams
    .filter((x) => x.Status === currentStatus)
    .sort((a, b) => {
      const dateA = new Date(a.CreatedAt || a.StartTime);
      const dateB = new Date(b.CreatedAt || b.StartTime);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const getStatusCount = (status) =>
    allExams.filter((exam) => exam.Status === status).length;

  // Hiển thị toast từ redirect state
  useEffect(() => {
    if (location.state?.message) {
      toast[location.state.severity](location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Load danh sách bài thi
  const loadAllExams = async () => {
    setLoading(true);
    try {
      const regular = await getExamsApi();
      const archived = await getArchivedExamsApi();

      const cleanedRegular = (regular || [])
        .filter((x) => x.Status !== "Archived")
        .map(normalizeExamStatus); // ⬅ FIX: convert Draft → Pending

      const cleanedArchived = (archived || []).map(normalizeExamStatus);

      setAllExams([...cleanedRegular, ...cleanedArchived]);
    } catch (err) {
      console.error("Load exams error:", err);
      toast.error("Không thể tải danh sách bài tập");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllExams();
  }, []);

  // CRUD Handlers
  const handleOpenCreate = () => navigate("/instructor/exams/create");
  const handleEdit = (exam) => navigate(`/instructor/exams/edit/${exam.ExamID}`);

  const handleViewDetail = async (exam) => {
    try {
      const detail = await getExamDetailApi(exam.ExamID);
      setSelectedExam(detail);
      setOpenDetailDialog(true);
    } catch {
      toast.error("Không thể tải chi tiết bài tập");
    }
  };

  const handleDelete = (exam) => {
    setSelectedExam(exam);
    setOpenDeleteConfirm(true);
  };

  const confirmDeleteExam = async () => {
    try {
      await deleteExamApi(selectedExam.ExamID);
      toast.success("Xóa bài tập thành công!");
      loadAllExams();
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setOpenDeleteConfirm(false);
      setSelectedExam(null);
    }
  };

  const handleArchive = async (exam) => {
    try {
      await archiveExamApi(exam.ExamID);
      toast.success("Đã lưu trữ bài tập");
      loadAllExams();
    } catch {
      toast.error("Lưu trữ thất bại");
    }
  };

  const handleUnarchive = async (exam) => {
    try {
      await unarchiveExamApi(exam.ExamID);
      toast.success("Đã khôi phục bài tập");
      loadAllExams();
    } catch {
      toast.error("Khôi phục thất bại");
    }
  };

  const formatDateTime = (start, end) => {
    if (!start) return { date: "-", time: "-" };
    const s = new Date(start);
    const e = end ? new Date(end) : null;
    const date = s.toLocaleDateString("vi-VN");
    const time = s.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const endTime = e?.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    return { date, time: e ? `${time} - ${endTime}` : time };
  };

  const getClassCount = (names) => (!names ? 0 : names.split(", ").length);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa", p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight="700">
              Quản lý bài tập 
            </Typography>
            <Typography color="text.secondary">
              Tạo và quản lý các bài tập cho học viên
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Tạo bài tập
          </Button>
        </Stack>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
          {STATUS_TABS.map((tab) => (
            <Tab
              key={tab.value}
              label={
                <Stack direction="row" spacing={1}>
                  <span>{tab.label}</span>
                  <Chip
                    label={getStatusCount(tab.value)}
                    size="small"
                    sx={{
                      bgcolor: alpha(tab.color, 0.12),
                      color: tab.color,
                      fontWeight: "700",
                    }}
                  />
                </Stack>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Sort */}
      {!loading && currentExams.length > 0 && (
        <Box sx={{ mb: 2, textAlign: "right" }}>
          <Chip
            icon={<SortIcon />}
            label={sortOrder === "desc" ? "Mới nhất" : "Cũ nhất"}
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            sx={{ cursor: "pointer" }}
          />
        </Box>
      )}

      {/* Loading */}
      {loading ? (
        <Box textAlign="center" mt={10}>
          <CircularProgress size={60} />
        </Box>
      ) : currentExams.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: "center" }}>
          <Typography>Chưa có bài tập nào</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {currentExams.map((exam) => {
            const { date, time } = formatDateTime(exam.StartTime, exam.EndTime);

            return (
              <Grid item xs={12} md={6} lg={4} key={exam.ExamID}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Chip label={currentStatus} size="small" sx={{ mb: 2 }} />

                    <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                      {exam.Title}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="body2" color="text.secondary">
                      {exam.CourseName}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {date} - {time}
                    </Typography>
                  </CardContent>

                  <CardActions>
                    <IconButton onClick={() => handleViewDetail(exam)}>
                      <ViewIcon />
                    </IconButton>

                    {exam.Status === "Pending" && (
                      <>
                        <IconButton onClick={() => handleEdit(exam)}>
                          <EditIcon />
                        </IconButton>

                        <IconButton onClick={() => handleDelete(exam)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}

                    {exam.Status === "Archived" ? (
                      <IconButton onClick={() => handleUnarchive(exam)} color="success">
                        <UnarchiveIcon />
                      </IconButton>
                    ) : (
                      exam.Status === "Completed" && (
                        <IconButton onClick={() => handleArchive(exam)}>
                          <ArchiveIcon />
                        </IconButton>
                      )
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Delete Dialog */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>Bạn có chắc muốn xóa bài tập này?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteConfirm(false)}>Hủy</Button>
          <Button onClick={confirmDeleteExam} color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </Box>
  );
};

export default ExamPage;
