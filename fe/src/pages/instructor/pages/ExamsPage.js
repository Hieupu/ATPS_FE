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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
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
  AccessTime as AccessTimeIcon,
  SwapVert as SortIcon,
  MoreVert as MoreVertIcon,
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
  openExamInstanceNowApi,
  closeExamInstanceNowApi,
} from "../../../apiServices/instructorExamService";

import ExamDetailDialog from "../components/exam/ExamDetailDialog";

const ExamPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openArchiveConfirm, setOpenArchiveConfirm] = useState(false);
  const [examToArchive, setExamToArchive] = useState(null);
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("desc");
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuItem, setMenuItem] = useState(null);

  const STATUS_TABS = [

    { value: "Scheduled", label: "Đã lên lịch", color: "#ff9800" },
    { value: "Open", label: "Đang mở", color: "#2196f3" },
    { value: "Closed", label: "Đã đóng", color: "#4caf50" },
    { value: "Archived", label: "Đã lưu trữ", color: "#757575" },
  ];

  const currentStatus = STATUS_TABS[activeTab]?.value;
  const getActualStatus = (item) => {
    if (item.isTemplate) return "Draft";
    if (item.isArchived) return "Archived";
    return item.Status;
  };

  const currentItems = allItems
    .filter((item) => {
      const actualStatus = getActualStatus(item);
      if (actualStatus !== currentStatus) return false;
      if (typeFilter === "All") return true;
      return item.examType === typeFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.StartTime || a.CreatedAt || 0);
      const dateB = new Date(b.StartTime || b.CreatedAt || 0);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const getStatusCount = (status) =>
    allItems.filter((i) => getActualStatus(i) === status).length;

  const getTypeCount = (type) => {
    const filtered = allItems.filter((i) => getActualStatus(i) === currentStatus);

    if (type === "All") return filtered.length;
    return filtered.filter((i) => i.examType === type).length;
  };

  useEffect(() => {
    loadAllExamsAndInstances();
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      toast[location.state.severity || "success"](location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);


  const loadAllExamsAndInstances = async () => {
    setLoading(true);
    try {
      const regularExams = await getExamsApi();
      const items = [];
      const processedExamIds = new Set();

      for (const exam of regularExams) {
        if (processedExamIds.has(exam.ExamID)) continue;

        try {
          const instances = await getExamInstancesApi(exam.ExamID);
          if (instances && instances.length > 0) {
            instances.forEach((inst) => {
              items.push({
                ...inst,
                examTitle: exam.Title,
                examType: exam.Type,
                examStatus: exam.Status,
                ExamID: exam.ExamID,
                isTemplate: false,
                isArchived: exam.Status === "Archived",
              });
            });
          } else {
            if (exam.Status === "Draft") {
              items.push({
                ExamID: exam.ExamID,
                examTitle: exam.Title,
                examType: exam.Type,
                examStatus: exam.Status,
                Status: "Draft",
                isTemplate: true,
                isArchived: false,
              });
            }
          }

          processedExamIds.add(exam.ExamID);
        } catch (err) {
          if (exam.Status === "Draft") {
            items.push({
              ExamID: exam.ExamID,
              examTitle: exam.Title,
              examType: exam.Type,
              examStatus: exam.Status,
              Status: "Draft",
              isTemplate: true,
              isArchived: false,
            });
          }
        }
      }
      setAllItems(items);
    } catch (error) {
      toast.error("Không thể tải danh sách bài thi");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNow = async (examId, instanceId) => {
    if (!window.confirm("Mở bài thi ngay lập tức? Học viên sẽ có thể làm bài ngay.")) return;
    try {
      await openExamInstanceNowApi(examId, instanceId);
      toast.success("Đã mở bài thi thành công!");
      loadAllExamsAndInstances();
    } catch (err) {
      toast.error(err.message || "Lỗi khi mở bài thi");
    }
  };

  const handleCloseNow = async (examId, instanceId) => {
    if (!window.confirm("Đóng bài thi ngay lập tức? Học viên sẽ không thể tiếp tục.")) return;
    try {
      await closeExamInstanceNowApi(examId, instanceId);
      toast.success("Đã đóng bài thi thành công!");
      loadAllExamsAndInstances();
    } catch (err) {
      toast.error(err.message || "Lỗi khi đóng bài thi");
    }
  };

  const handleViewDetail = async (exam) => {
    try {
      const detail = await getExamDetailApi(exam.ExamID);
      setSelectedExam(detail);
      setOpenDetailDialog(true);
    } catch {
      toast.error("Không thể tải chi tiết");
    }
  };

  const handleEdit = (exam) => {
    navigate(`/instructor/exams/edit/${exam.ExamID}`);
  };

  const handleArchive = (exam) => {
    setExamToArchive(exam);
    setOpenArchiveConfirm(true);
  };

  const confirmArchiveExam = async () => {
    try {
      await archiveExamApi(examToArchive.ExamID);
      toast.success("Đã lưu trữ bài thi thành công!");
      loadAllExamsAndInstances();
    } catch {
      toast.error("Lưu trữ thất bại");
    } finally {
      setOpenArchiveConfirm(false);
      setExamToArchive(null);
    }
  };

  const handleUnarchive = async (exam) => {
    try {
      await unarchiveExamApi(exam.ExamID);
      toast.success("Đã khôi phục bài thi");
      loadAllExamsAndInstances();
    } catch {
      toast.error("Khôi phục thất bại");
    }
  };

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setMenuItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItem(null);
  };

  const handleMenuAction = (action) => {
    handleMenuClose();

    switch (action) {
      case 'view':
        handleViewDetail(menuItem);
        break;
      case 'edit':
        handleEdit(menuItem);
        break;
      case 'archive':
        handleArchive(menuItem);
        break;
      case 'open':
        handleOpenNow(menuItem.ExamID, menuItem.InstanceId);
        break;
      case 'close':
        handleCloseNow(menuItem.ExamID, menuItem.InstanceId);
        break;
      case 'unarchive':
        handleUnarchive({ ExamID: menuItem.ExamID });
        break;
      default:
        break;
    }
  };

  const formatDateTime = (start, end) => {
    if (!start) return { displayText: "Chưa đặt lịch" };

    const s = new Date(start);
    const startDate = s.toLocaleDateString("vi-VN");
    const startTime = s.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    if (!end) {
      return { displayText: `${startDate} ${startTime}` };
    }

    const e = new Date(end);
    const endDate = e.toLocaleDateString("vi-VN");
    const endTime = e.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    return { displayText: ` ${startTime} ${startDate} - ${endTime} ${endDate} ` };
  };

  const getAssignedInfo = (item) => {
    if (item.isTemplate) return { type: "Chưa gán", name: "-" };
    if (item.ClassName) {
      const classCount = item.ClassName.split(", ").length;
      return {
        type: "Lớp",
        name: classCount > 1 ? `${classCount} lớp` : item.ClassName
      };
    }

    if (item.UnitId) {
      return {
        type: "Unit",
        name: item.UnitName || `Unit #${item.UnitId}`
      };
    }

    return { type: "Chưa gán", name: "-" };
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa", p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="700">
              Quản lý Bài thi & Bài tập
            </Typography>
            <Typography color="text.secondary">
              Tạo và quản lý các bài thi, bài tập cho học viên
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/instructor/exams/create")}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Tạo bài thi mới
          </Button>
        </Stack>
      </Box>
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
                    sx={{ bgcolor: alpha(tab.color, 0.12), color: tab.color, fontWeight: 700 }}
                  />
                </Stack>
              }
            />
          ))}
        </Tabs>
      </Paper>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" spacing={1}>
          <Chip
            label={`Tất cả (${getTypeCount("All")})`}
            onClick={() => setTypeFilter("All")}
            color={typeFilter === "All" ? "primary" : "default"}
            variant={typeFilter === "All" ? "filled" : "outlined"}
            clickable
          />
          <Chip
            icon={<AssignmentIcon />}
            label={`Assignment (${getTypeCount("Assignment")})`}
            onClick={() => setTypeFilter("Assignment")}
            color={typeFilter === "Assignment" ? "secondary" : "default"}
            variant={typeFilter === "Assignment" ? "filled" : "outlined"}
            clickable
          />
          <Chip
            icon={<SchoolIcon />}
            label={`Exam (${getTypeCount("Exam")})`}
            onClick={() => setTypeFilter("Exam")}
            color={typeFilter === "Exam" ? "success" : "default"}
            variant={typeFilter === "Exam" ? "filled" : "outlined"}
            clickable
          />
        </Stack>

        {!loading && currentItems.length > 0 && (
          <Chip
            icon={<SortIcon />}
            label={sortOrder === "desc" ? "Mới nhất" : "Cũ nhất"}
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            clickable
            sx={{ cursor: "pointer" }}
          />
        )}
      </Box>
      {loading ? (
        <Box textAlign="center" mt={10}>
          <CircularProgress size={60} />
        </Box>
      ) : currentItems.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            {currentStatus === "Draft"
              ? "Chưa có bài thi nháp nào"
              : `Không có bài thi nào ở trạng thái ${STATUS_TABS.find(t => t.value === currentStatus)?.label.toLowerCase()}`}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {currentItems.map((item) => {
            const isTemplate = item.isTemplate;
            const status = getActualStatus(item);
            const { displayText } = formatDateTime(item.StartTime, item.EndTime); const assignedInfo = getAssignedInfo(item);

            return (
              <Grid item xs={12} md={6} lg={4} key={isTemplate ? `${item.ExamID}-template` : `${item.InstanceId}-instance`}>
                <Card
                  sx={{
                    borderRadius: 2,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s",
                    "&:hover": { boxShadow: 6, transform: "translateY(-4px)" },
                    borderLeft: `5px solid ${status === "Open"
                      ? "#2196f3"
                      : status === "Scheduled"
                        ? "#ff9800"
                        : status === "Closed"
                          ? "#4caf50"
                          : status === "Draft"
                            ? "#9e9e9e"
                            : "#757575"
                      }`,
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, pb: 1, position: 'relative' }}>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1
                      }}
                      onClick={(e) => handleMenuOpen(e, item)}
                    >
                      <MoreVertIcon />
                    </IconButton>

                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip
                        label={
                          status === "Open"
                            ? "Đang mở"
                            : status === "Scheduled"
                              ? "Đã lên lịch"
                              : status === "Closed"
                                ? "Đã đóng"
                                : status === "Draft"
                                  ? "Nháp"
                                  : "Lưu trữ"
                        }
                        size="small"
                        color={
                          status === "Open"
                            ? "primary"
                            : status === "Scheduled"
                              ? "warning"
                              : status === "Closed"
                                ? "success"
                                : "default"
                        }
                        variant="outlined"
                      />
                      <Chip
                        icon={item.examType === "Assignment" ? <AssignmentIcon /> : <SchoolIcon />}
                        label={item.examType || "Exam"}
                        size="small"
                        color={item.examType === "Assignment" ? "secondary" : "success"}
                      />
                    </Stack>

                    <Typography
                      variant="h6"
                      fontWeight="600"
                      sx={{
                        mb: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: "3.6em",
                      }}
                    >
                      {item.examTitle}
                    </Typography>

                    <Divider sx={{ my: 1.5 }} />

                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <SchoolIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          <strong>{assignedInfo.type}: {assignedInfo.name}</strong>
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {displayText}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>

                  {status === "Scheduled" && (
                    <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => handleOpenNow(item.ExamID, item.InstanceId)}
                      >
                        Mở ngay
                      </Button>
                    </CardActions>
                  )}

                  {status === "Open" && (
                    <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        color="error"
                        fullWidth
                        onClick={() => handleCloseNow(item.ExamID, item.InstanceId)}
                      >
                        Đóng ngay
                      </Button>
                    </CardActions>
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >

        {menuItem && (menuItem.isTemplate || menuItem.Status === "Scheduled") && (
          <MenuItem onClick={() => handleMenuAction('edit')}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Chỉnh sửa</ListItemText>
          </MenuItem>
        )}
        {menuItem && (menuItem.isTemplate || menuItem.Status === "Scheduled" || menuItem.Status === "Closed") && (
          <MenuItem onClick={() => handleMenuAction('archive')}>
            <ListItemIcon>
              <ArchiveIcon fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText>Lưu trữ</ListItemText>
          </MenuItem>
        )}
        {menuItem && menuItem.isArchived && (
          <MenuItem onClick={() => handleMenuAction('unarchive')}>
            <ListItemIcon>
              <UnarchiveIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>Khôi phục</ListItemText>
          </MenuItem>
        )}
      </Menu>
      <Dialog open={openArchiveConfirm} onClose={() => setOpenArchiveConfirm(false)}>
        <DialogTitle>Xác nhận lưu trữ</DialogTitle>
        <DialogContent>
          Bạn có chắc muốn lưu trữ bài thi này? Bạn có thể khôi phục sau trong tab "Đã lưu trữ".
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenArchiveConfirm(false)}>Hủy</Button>
          <Button onClick={confirmArchiveExam} color="warning" variant="contained">
            Lưu trữ
          </Button>
        </DialogActions>
      </Dialog>

      {openDetailDialog && selectedExam && (
        <ExamDetailDialog
          open={openDetailDialog}
          onClose={() => setOpenDetailDialog(false)}
          exam={selectedExam}
        />
      )}

      <ToastContainer position="bottom-right" />
    </Box>
  );
};

export default ExamPage;