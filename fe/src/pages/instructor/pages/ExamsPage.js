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
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  QuestionAnswer as QuestionIcon,
  AccessTime as TimeIcon,
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
  getExamInstancesApi,
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
  const [typeFilter, setTypeFilter] = useState("All");

  const STATUS_TABS = [
    { value: "Pending", label: "Chờ diễn ra", color: "#ff9800" },
    { value: "Ongoing", label: "Đang diễn ra", color: "#2196f3" },
    { value: "Completed", label: "Đã hoàn thành", color: "#4caf50" },
    { value: "Archived", label: "Đã lưu trữ", color: "#757575" },
  ];

  const STATUS_MAP = {
    "Pending": "Nháp",
    "Ongoing": "Đang diễn ra",
    "Completed": "Hoàn thành",
    "Archived": "Đã lưu trữ",
    "Draft": "Nháp",
    "Published": "Đã xuất bản",
    "Scheduled": "Đã lên lịch"
  };

  const currentStatus = STATUS_TABS[activeTab]?.value;

  const normalizeExamStatus = (exam) => {
    if (exam.Status === "Draft") {
      return { ...exam, Status: "Pending" };
    }
    return exam;
  };

  const currentExams = allExams
    .filter((x) => {
      if (x.Status !== currentStatus) return false;
      if (typeFilter === "All") return true;
      if (typeFilter === "Assignment") return x.Type === "Assignment";
      if (typeFilter === "Exam") return x.Type === "Exam";
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.CreatedAt || a.StartTime);
      const dateB = new Date(b.CreatedAt || b.StartTime);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const getStatusCount = (status) =>
    allExams.filter((exam) => exam.Status === status).length;

  const getTypeCount = (type) => {
    const filtered = allExams.filter((x) => x.Status === currentStatus);
    if (type === "All") return filtered.length;
    return filtered.filter((x) => x.Type === type).length;
  };

  useEffect(() => {
    if (location.state?.message) {
      toast[location.state.severity](location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const loadAllExams = async () => {
    setLoading(true);
    try {
      const [regular, archived] = await Promise.all([
        getExamsApi(),
        getArchivedExamsApi()
      ]);

      const loadExamWithInstances = async (exam) => {
        try {
          const instances = await getExamInstancesApi(exam.ExamID);
          
          if (!instances || instances.length === 0) {
            return {
              ...exam,
              StartTime: null,
              EndTime: null,
              ClassName: null,
              UnitName: null,
              CourseName: exam.CourseName || null,
              instances: []
            };
          }

          const firstInstance = instances[0];

          return {
            ...exam,
            StartTime: firstInstance.StartTime,
            EndTime: firstInstance.EndTime,
            ClassName: firstInstance.ClassName,
            UnitName: firstInstance.UnitName,
            CourseName: firstInstance.CourseName || exam.CourseName,
            instances: instances,
            TotalQuestions: instances.reduce((sum, inst) => 
              sum + (inst.TotalQuestions || 0), 0
            )
          };
        } catch (err) {
          console.error(`Failed to load instances for exam ${exam.ExamID}:`, err);
          return exam;
        }
      };

      const [regularWithInstances, archivedWithInstances] = await Promise.all([
        Promise.all((regular || []).map(loadExamWithInstances)),
        Promise.all((archived || []).map(loadExamWithInstances))
      ]);

      const cleanedRegular = regularWithInstances
        .filter((x) => x.Status !== "Archived")
        .map(normalizeExamStatus);

      const cleanedArchived = archivedWithInstances.map(normalizeExamStatus);

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
    if (!start) return { date: "Chưa đặt lịch", time: "" };
    const s = new Date(start);
    const e = end ? new Date(end) : null;
    const date = s.toLocaleDateString("vi-VN");
    const time = s.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const endTime = e?.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    return { date, time: e ? `${time} - ${endTime}` : time };
  };

  const getTotalQuestions = (exam) => {
    if (!exam.sections || !Array.isArray(exam.sections)) return 0;

    return exam.sections.reduce((total, section) => {
      if (section.childSections && Array.isArray(section.childSections)) {
        return total + section.childSections.reduce((childTotal, child) => {
          return childTotal + (child.TotalQuestions || child.QuestionCount || 0);
        }, 0);
      }
      return total + (section.TotalQuestions || section.QuestionCount || 0);
    }, 0);
  };

  const getAssignedInfo = (exam) => {
    const isAssignment = exam.Type === "Assignment";

    if (isAssignment) {
      if (exam.UnitName) return { type: "Unit", name: exam.UnitName };
      if (exam.unitName) return { type: "Unit", name: exam.unitName };
      return { type: "Unit", name: "Chưa gán" };
    } else {
      if (exam.ClassName) {
        const classCount = exam.ClassName.split(", ").length;
        return {
          type: "Lớp",
          name: classCount > 1 ? `${classCount} lớp` : exam.ClassName
        };
      }
      if (exam.classes && exam.classes.length > 0) {
        return {
          type: "Lớp",
          name: exam.classes.length > 1 ? `${exam.classes.length} lớp` : exam.classes[0].Name
        };
      }
      return { type: "Lớp", name: "Chưa gán" };
    }
  };

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

      {/* Status Tabs */}
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

      {/* Type Filter + Sort */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={1}>
          <Chip
            label={`Tất cả (${getTypeCount("All")})`}
            onClick={() => setTypeFilter("All")}
            color={typeFilter === "All" ? "primary" : "default"}
            variant={typeFilter === "All" ? "filled" : "outlined"}
            sx={{ 
              cursor: "pointer",
              fontWeight: typeFilter === "All" ? 600 : 400,
              '&:hover': { 
                bgcolor: typeFilter === "All" ? undefined : 'action.hover' 
              }
            }}
          />
          <Chip
            icon={<AssignmentIcon />}
            label={`Assignment (${getTypeCount("Assignment")})`}
            onClick={() => setTypeFilter("Assignment")}
            color={typeFilter === "Assignment" ? "secondary" : "default"}
            variant={typeFilter === "Assignment" ? "filled" : "outlined"}
            sx={{ 
              cursor: "pointer",
              fontWeight: typeFilter === "Assignment" ? 600 : 400,
              '&:hover': { 
                bgcolor: typeFilter === "Assignment" ? undefined : 'action.hover' 
              }
            }}
          />
          <Chip
            icon={<SchoolIcon />}
            label={`Exam (${getTypeCount("Exam")})`}
            onClick={() => setTypeFilter("Exam")}
            color={typeFilter === "Exam" ? "success" : "default"}
            variant={typeFilter === "Exam" ? "filled" : "outlined"}
            sx={{ 
              cursor: "pointer",
              fontWeight: typeFilter === "Exam" ? 600 : 400,
              '&:hover': { 
                bgcolor: typeFilter === "Exam" ? undefined : 'action.hover' 
              }
            }}
          />
        </Stack>

        {!loading && currentExams.length > 0 && (
          <Chip
            icon={<SortIcon />}
            label={sortOrder === "desc" ? "Mới nhất" : "Cũ nhất"}
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            sx={{ cursor: "pointer" }}
          />
        )}
      </Box>

      {/* Loading */}
      {loading ? (
        <Box textAlign="center" mt={10}>
          <CircularProgress size={60} />
        </Box>
      ) : currentExams.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: "center" }}>
          <Typography>
            {typeFilter === "All" 
              ? "Chưa có bài tập nào" 
              : `Chưa có ${typeFilter === "Assignment" ? "Assignment" : "Exam"} nào`
            }
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {currentExams.map((exam) => {
            const { date, time } = formatDateTime(exam.StartTime, exam.EndTime);
            const assignedInfo = getAssignedInfo(exam);
            const totalQuestions = getTotalQuestions(exam);

            return (
              <Grid item xs={12} md={6} lg={4} key={exam.ExamID}>
                <Card
                  sx={{
                    borderRadius: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    {/* ✅ Status + Type chips - Status tiếng Việt */}
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip
                        label={STATUS_MAP[currentStatus] || currentStatus}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        icon={exam.Type === "Assignment" ? <AssignmentIcon /> : <SchoolIcon />}
                        label={exam.Type || "Exam"}
                        size="small"
                        color={exam.Type === "Assignment" ? "secondary" : "success"}
                      />
                    </Stack>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      fontWeight="600"
                      sx={{
                        mb: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '3.6em'
                      }}
                    >
                      {exam.Title}
                    </Typography>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Course */}
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <SchoolIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {exam.CourseName || "Chưa có khóa học"}
                      </Typography>
                    </Stack>

                    {/* Assigned to (Class or Unit) */}
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <AssignmentIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {assignedInfo.type}: <strong>{assignedInfo.name}</strong>
                      </Typography>
                    </Stack>

                    {/* Date & Time */}
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TimeIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {date} {time && `• ${time}`}
                      </Typography>
                    </Stack>

                    {/* ✅ BỎ Total Questions */}
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                    <Tooltip title="Xem chi tiết">
                      <IconButton onClick={() => handleViewDetail(exam)} size="small">
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>

                    {exam.Status === "Pending" && (
                      <>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton onClick={() => handleEdit(exam)} size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Xóa">
                          <IconButton onClick={() => handleDelete(exam)} color="error" size="small">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}

                    {exam.Status === "Archived" ? (
                      <Tooltip title="Khôi phục">
                        <IconButton onClick={() => handleUnarchive(exam)} color="success" size="small">
                          <UnarchiveIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      exam.Status === "Completed" && (
                        <Tooltip title="Lưu trữ">
                          <IconButton onClick={() => handleArchive(exam)} size="small">
                            <ArchiveIcon />
                          </IconButton>
                        </Tooltip>
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

      {/* Detail Dialog */}
      {openDetailDialog && (
        <ExamDetailDialog
          open={openDetailDialog}
          onClose={() => setOpenDetailDialog(false)}
          exam={selectedExam}
        />
      )}

      <ToastContainer />
    </Box>
  );
};

export default ExamPage;