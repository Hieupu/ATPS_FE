import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Container,
  Paper,
  Fade,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  School as SchoolIcon,
  Send as SendIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Timer as TimerIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

import CourseModal from "./componentCouserList/CourseModal";
import CourseReview from "./componentCouserList/CourseReview";
import CourseCard from "./componentCouserList/CourseCard";
import CourseDialog from "./componentCouserList/CourseDialog";
import UnitAccordion from "./componentCouserList/UnitAccordion";
import MaterialList from "./componentCouserList/MaterialList";

const API_BASE = "http://localhost:9999/api/instructor/courses";
const getToken = () => localStorage.getItem("token");

const apiCall = async (url, options = {}) => {
  const token = getToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
};

export default function InstructorCoursesList() {
  // ---------- States ----------
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [units, setUnits] = useState([]);
  const [lessons, setLessons] = useState({});
  const [materials, setMaterials] = useState([]);

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewCourse, setReviewCourse] = useState(null);

  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailCourse, setDetailCourse] = useState(null);

  // Filter & Search & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchCourses();
  }, []);

  // ---------- Fetchers ----------
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await apiCall(`${API_BASE}/courses`);
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetails = async (courseId) => {
    try {
      const [unitsData, materialsData] = await Promise.all([
        apiCall(`${API_BASE}/courses/${courseId}/units`),
        apiCall(`${API_BASE}/courses/${courseId}/materials`).catch(() => ({
          materials: [],
        })),
      ]);
      const u = unitsData.units || [];
      setUnits(u);
      setMaterials(materialsData.materials || []);

      const lessonsData = {};
      for (const unit of u) {
        const lr = await apiCall(`${API_BASE}/units/${unit.UnitID}/lessons`);
        lessonsData[unit.UnitID] = lr.lessons || [];
      }
      setLessons(lessonsData);
      return {
        units: u,
        lessons: lessonsData,
        materials: materialsData.materials || [],
      };
    } catch (err) {
      setError("Không thể tải chi tiết khóa học");
      return null;
    }
  };

  const handleOpenDetailDialog = async (course) => {
    setDetailCourse(course);
    setSelectedCourse(course.CourseID);
    setDetailDialogOpen(true);
    await fetchCourseDetails(course.CourseID);
  };

  const handlePreviewCourse = async (course) => {
    try {
      const [unitsData, materialsData] = await Promise.all([
        apiCall(`${API_BASE}/courses/${course.CourseID}/units`),
        apiCall(`${API_BASE}/courses/${course.CourseID}/materials`).catch(
          () => ({ materials: [] })
        ),
      ]);

      const u = unitsData.units || [];
      const lessonsData = {};
      for (const unit of u) {
        const lr = await apiCall(`${API_BASE}/units/${unit.UnitID}/lessons`);
        lessonsData[unit.UnitID] = lr.lessons || [];
      }
      const unitsWithLessons = u.map((unit) => ({
        ...unit,
        lessons: lessonsData[unit.UnitID] || [],
      }));

      setReviewCourse({
        ...course,
        units: unitsWithLessons,
        materials: materialsData.materials || [],
      });
      setIsReviewOpen(true);
    } catch (err) {
      console.error("Không thể tải dữ liệu xem trước:", err);
    }
  };

  // ---------- COURSE CRUD ----------
  const handleCreateCourse = async () => {
    try {
      setLoading(true);
      await apiCall(`${API_BASE}/courses`, {
        method: "POST",
        body: JSON.stringify({
          InstructorID: formData.InstructorID || 1,
          Title: formData.Title,
          Description: formData.Description,
          Duration: parseInt(formData.Duration),
          Fee: parseFloat(formData.Fee),
          Status: "draft",
        }),
      });
      await fetchCourses();
      closeModal();
    } catch {
      setError("Không thể tạo khóa học");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async () => {
    try {
      setLoading(true);
      await apiCall(`${API_BASE}/courses/${formData.CourseID}`, {
        method: "PUT",
        body: JSON.stringify({
          Title: formData.Title,
          Description: formData.Description,
          Duration: parseInt(formData.Duration),
          Fee: parseFloat(formData.Fee),
        }),
      });
      await fetchCourses();
      if (detailCourse && detailCourse.CourseID === formData.CourseID) {
        setDetailCourse({ ...detailCourse, ...formData });
      }
      closeModal();
    } catch {
      setError("Không thể cập nhật khóa học");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Bạn có chắc muốn xóa khóa học này?")) return;
    try {
      await apiCall(`${API_BASE}/courses/${courseId}`, { method: "DELETE" });
      await fetchCourses();
      if (detailDialogOpen && detailCourse?.CourseID === courseId)
        setDetailDialogOpen(false);
    } catch {
      setError("Không thể xóa khóa học");
    }
  };

  const handleSubmitCourse = async (courseId) => {
    try {
      await apiCall(`${API_BASE}/courses/${courseId}/submit`, {
        method: "POST",
      });
      await fetchCourses();
      alert("Khóa học đã được gửi để xét duyệt!");
    } catch {
      setError("Không thể gửi khóa học");
    }
  };

  // ---------- UNIT CRUD ----------
  const handleCreateUnit = async () => {
    try {
      setLoading(true);
      await apiCall(`${API_BASE}/courses/${selectedCourse}/units`, {
        method: "POST",
        body: JSON.stringify({
          Title: formData.Title,
          Description: formData.Description,
          Duration: formData.Duration,
        }),
      });
      await fetchCourseDetails(selectedCourse);
      closeModal();
    } catch {
      setError("Không thể tạo unit");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUnit = async () => {
    try {
      setLoading(true);
      await apiCall(`${API_BASE}/units/${formData.UnitID}`, {
        method: "PUT",
        body: JSON.stringify({
          Title: formData.Title,
          Description: formData.Description,
          Duration: formData.Duration,
        }),
      });
      await fetchCourseDetails(selectedCourse);
      closeModal();
    } catch {
      setError("Không thể cập nhật unit");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (!window.confirm("Bạn có chắc muốn xóa unit này?")) return;
    try {
      await apiCall(`${API_BASE}/units/${unitId}`, { method: "DELETE" });
      await fetchCourseDetails(selectedCourse);
    } catch {
      setError("Không thể xóa unit");
    }
  };

  // ---------- LESSON CRUD ----------
  const handleCreateLesson = async () => {
    try {
      setLoading(true);
      const formDataObj = new FormData();
      formDataObj.append("Title", formData.Title);
      formDataObj.append("Time", formData.Time); // GIỜ
      formDataObj.append("Type", formData.Type ?? "video");
      if (formData.file) formDataObj.append("file", formData.file);
      const token = getToken();
      await fetch(`${API_BASE}/units/${formData.UnitID}/lessons`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataObj,
      });
      await fetchCourseDetails(selectedCourse);
      closeModal();
    } catch {
      setError("Không thể tạo bài học");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLesson = async () => {
    try {
      setLoading(true);
      const formDataObj = new FormData();
      formDataObj.append("Title", formData.Title);
      formDataObj.append("Time", formData.Time); // GIỜ
      formDataObj.append("Type", formData.Type);
      if (formData.file) formDataObj.append("file", formData.file);
      const token = getToken();
      await fetch(
        `${API_BASE}/units/${formData.UnitID}/lessons/${formData.LessonID}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formDataObj,
        }
      );
      await fetchCourseDetails(selectedCourse);
      closeModal();
    } catch {
      setError("Không thể cập nhật bài học");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (unitId, lessonId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài học này?")) return;
    try {
      await apiCall(`${API_BASE}/units/${unitId}/lessons/${lessonId}`, {
        method: "DELETE",
      });
      await fetchCourseDetails(selectedCourse);
    } catch {
      setError("Không thể xóa bài học");
    }
  };

  // ---------- MATERIAL CRUD ----------
  const handleCreateMaterial = async () => {
    try {
      setLoading(true);
      await apiCall(`${API_BASE}/courses/${selectedCourse}/materials`, {
        method: "POST",
        body: JSON.stringify({
          Title: formData.Title,
          FileURL: formData.FileURL,
          Status: "active",
        }),
      });
      await fetchCourseDetails(selectedCourse);
      closeModal();
    } catch {
      setError("Không thể tạo tài liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMaterial = async () => {
    try {
      setLoading(true);
      await apiCall(`${API_BASE}/materials/${formData.MaterialID}`, {
        method: "PUT",
        body: JSON.stringify({
          Title: formData.Title,
          FileURL: formData.FileURL,
          Status: "active",
        }),
      });
      await fetchCourseDetails(selectedCourse);
      closeModal();
    } catch {
      setError("Không thể cập nhật tài liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài liệu này?")) return;
    try {
      await apiCall(`${API_BASE}/materials/${materialId}`, {
        method: "DELETE",
      });
      await fetchCourseDetails(selectedCourse);
    } catch {
      setError("Không thể xóa tài liệu");
    }
  };

  // ---------- Modal handlers ----------
  const openModal = (type, data = {}) => {
    setModalType(type);
    setFormData(data);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setModalType("");
    setFormData({});
  };

  const handleSubmit = () => {
    switch (modalType) {
      case "createCourse":
        return handleCreateCourse();
      case "updateCourse":
        return handleUpdateCourse();
      case "createUnit":
        return handleCreateUnit();
      case "updateUnit":
        return handleUpdateUnit();
      case "createLesson":
        return handleCreateLesson();
      case "updateLesson":
        return handleUpdateLesson();
      case "createMaterial":
        return handleCreateMaterial();
      case "updateMaterial":
        return handleUpdateMaterial();
      default:
        return;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "default",
      submitted: "info",
      pending: "warning",
      approved: "success",
      deleted: "error",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: "Bản nháp",
      submitted: "Đã gửi",
      pending: "Chờ duyệt",
      approved: "Đã duyệt",
      deleted: "Đã xóa",
    };
    return labels[status] || status;
  };

  // Filter & Pagination
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.Description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || course.Status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage) || 1;
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handlePageChange = (_e, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---------- Render ----------
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "white",
          boxShadow: "0 2px 8px rgba(91, 91, 255, 0.08)",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: "#5b5bff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SchoolIcon sx={{ color: "white", fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    color: "#1e293b",
                    fontWeight: 700,
                    letterSpacing: "-0.5px",
                  }}
                >
                  Quản lý khóa học
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                  Tạo và quản lý các khóa học của bạn
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openModal("createCourse")}
              sx={{
                bgcolor: "#5b5bff",
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontSize: 16,
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(91, 91, 255, 0.3)",
                "&:hover": {
                  bgcolor: "#4a4acc",
                  boxShadow: "0 6px 16px rgba(91, 91, 255, 0.4)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Tạo khóa học mới
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Main */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Error */}
        {error && (
          <Fade in>
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(220, 38, 38, 0.15)",
              }}
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Filter */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(91, 91, 255, 0.08)",
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm khóa học..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#64748b" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  label="Trạng thái"
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterListIcon sx={{ color: "#64748b", ml: 1 }} />
                    </InputAdornment>
                  }
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="draft">Bản nháp</MenuItem>
                  <MenuItem value="submitted">Đã gửi</MenuItem>
                  <MenuItem value="approved">Đã duyệt</MenuItem>
                  <MenuItem value="deleted">Đã xóa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography
                variant="body2"
                sx={{ color: "#64748b", textAlign: "right" }}
              >
                {filteredCourses.length} khóa học
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Content */}
        {loading && courses.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              py: 10,
            }}
          >
            <CircularProgress
              size={60}
              thickness={4}
              sx={{ color: "#5b5bff", mb: 2 }}
            />
            <Typography variant="body1" sx={{ color: "#64748b" }}>
              Đang tải khóa học...
            </Typography>
          </Box>
        ) : paginatedCourses.length === 0 ? (
          <Paper
            sx={{
              p: 8,
              borderRadius: 3,
              textAlign: "center",
              bgcolor: "white",
              boxShadow: "0 4px 16px rgba(91, 91, 255, 0.08)",
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                bgcolor: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              <SchoolIcon sx={{ fontSize: 60, color: "#cbd5e1" }} />
            </Box>
            <Typography
              variant="h5"
              sx={{ color: "#1e293b", fontWeight: 600, mb: 1 }}
            >
              {searchQuery || statusFilter !== "all"
                ? "Không tìm thấy khóa học"
                : "Chưa có khóa học nào"}
            </Typography>
            <Typography variant="body1" sx={{ color: "#64748b", mb: 3 }}>
              {searchQuery || statusFilter !== "all"
                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                : "Bắt đầu tạo khóa học đầu tiên của bạn"}
            </Typography>
            {!searchQuery && statusFilter === "all" && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openModal("createCourse")}
                sx={{
                  bgcolor: "#5b5bff",
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: 16,
                  fontWeight: 600,
                  "&:hover": { bgcolor: "#4a4acc" },
                }}
              >
                Tạo khóa học mới
              </Button>
            )}
          </Paper>
        ) : (
          <>
            <Grid container spacing={3}>
              {paginatedCourses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course.CourseID}>
                  <CourseCard
                    course={course}
                    getStatusColor={getStatusColor}
                    getStatusLabel={getStatusLabel}
                    onViewDetails={() => handleOpenDetailDialog(course)}
                    onEdit={() => openModal("updateCourse", course)}
                    onSubmit={() => handleSubmitCourse(course.CourseID)}
                    onDelete={() => handleDeleteCourse(course.CourseID)}
                    onPreview={() => handlePreviewCourse(course)}
                  />
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      borderRadius: 2,
                      fontWeight: 600,
                    },
                    "& .Mui-selected": { bgcolor: "#5b5bff !important" },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>

      {/* Course Detail Dialog */}
      <CourseDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        course={detailCourse}
        getStatusColor={getStatusColor}
        getStatusLabel={getStatusLabel}
        units={units}
        lessonsByUnit={lessons}
        materials={materials}
        onEditCourse={() => openModal("updateCourse", detailCourse)}
        onSubmitCourse={() => handleSubmitCourse(detailCourse.CourseID)}
        onPreviewCourse={() => handlePreviewCourse(detailCourse)}
        onAddUnit={() => openModal("createUnit")}
        onEditUnit={(unit) => openModal("updateUnit", unit)}
        onDeleteUnit={(unitId) => handleDeleteUnit(unitId)}
        onAddLesson={(unitId) => openModal("createLesson", { UnitID: unitId })}
        onEditLesson={(lesson, unitId) =>
          openModal("updateLesson", { ...lesson, UnitID: unitId })
        }
        onDeleteLesson={handleDeleteLesson}
        onAddMaterial={() => openModal("createMaterial")}
        onEditMaterial={(material) => openModal("updateMaterial", material)}
        onDeleteMaterial={(id) => handleDeleteMaterial(id)}
      />

      {/* Course Modal */}
      <CourseModal
        open={modalOpen}
        type={modalType}
        data={formData}
        onChange={setFormData}
        onClose={closeModal}
        onSubmit={handleSubmit}
        loading={loading}
      />

      {/* Course Review Dialog */}
      <Dialog
        open={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        fullScreen
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            backgroundColor: "#f8f9ff",
            boxShadow: "none",
            overflowY: "auto",
          },
        }}
      >
        <AppBar
          sx={{
            position: "sticky",
            bgcolor: "white",
            color: "#1e293b",
            boxShadow: "0 2px 8px rgba(91, 91, 255, 0.08)",
          }}
        >
          <Toolbar>
            <SchoolIcon sx={{ mr: 2, color: "#5b5bff" }} />
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, fontWeight: 600 }}
            >
              Xem trước khóa học
            </Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => setIsReviewOpen(false)}
              aria-label="close"
              sx={{ "&:hover": { bgcolor: "#f1f5f9" } }}
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CourseReview
            course={reviewCourse}
            onClose={() => setIsReviewOpen(false)}
          />
        </Box>
      </Dialog>
    </Box>
  );
}
