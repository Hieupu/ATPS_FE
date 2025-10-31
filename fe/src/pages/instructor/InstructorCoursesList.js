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
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import CourseCard from "./componentCouserList/CourseCard";
import CourseModal from "./componentCouserList/CourseModal";
import CourseReview from "./componentCouserList/CourseReview";

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
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewCourse, setReviewCourse] = useState(null);

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
    } catch (err) {
      setError("Không thể tải chi tiết khóa học");
    }
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

  // ---------- Expand ----------
  const handleExpandCourse = (courseId) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
      setSelectedCourse(null);
    } else {
      setExpandedCourse(courseId);
      setSelectedCourse(courseId);
      fetchCourseDetails(courseId);
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
    } catch (err) {
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
      closeModal();
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
      setError("Không thể xóa unit");
    }
  };

  // ---------- LESSON CRUD ----------
  const handleCreateLesson = async () => {
    try {
      setLoading(true);
      await apiCall(`${API_BASE}/units/${formData.UnitID}/lessons`, {
        method: "POST",
        body: JSON.stringify({
          Title: formData.Title,
          Time: parseInt(formData.Time),
          Type: formData.Type ?? "video",
          FileURL: formData.FileURL,
        }),
      });
      await fetchCourseDetails(selectedCourse);
      closeModal();
    } catch (err) {
      setError("Không thể tạo bài học");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLesson = async () => {
    try {
      setLoading(true);
      await apiCall(
        `${API_BASE}/units/${formData.UnitID}/lessons/${formData.LessonID}`,
        {
          method: "PUT",
          body: JSON.stringify({
            Title: formData.Title,
            Time: parseInt(formData.Time),
            Type: formData.Type,
            FileURL: formData.FileURL,
          }),
        }
      );
      await fetchCourseDetails(selectedCourse);
      closeModal();
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
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

  // submit dispatcher
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
      approved: "success",
      deleted: "error",
    };
    return colors[status] || "default";
  };

  // ---------- Render ----------
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f7fa",
      }}
    >
      {/* Header Section với icon và gradient */}
      <Box
        sx={{
          bgcolor: "white",
          boxShadow: "0 2px 8px rgba(91, 91, 255, 0.08)",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Container maxWidth={false}>
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

      {/* Main Content */}
      <Container sx={{ width: "100%", px: 4, py: 4 }}>
        {/* Error Alert với animation */}
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

        {/* Loading State đẹp hơn */}
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
        ) : courses.length === 0 ? (
          // Empty State đẹp mắt
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
              Chưa có khóa học nào
            </Typography>
            <Typography variant="body1" sx={{ color: "#64748b", mb: 3 }}>
              Bắt đầu tạo khóa học đầu tiên của bạn
            </Typography>
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
                "&:hover": {
                  bgcolor: "#4a4acc",
                },
              }}
            >
              Tạo khóa học mới
            </Button>
          </Paper>
        ) : (
          // Courses Grid với animation
          <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid item xs={12} key={course.CourseID}>
                <Fade in timeout={300}>
                  <Box>
                    <CourseCard
                      course={course}
                      expandedCourse={expandedCourse}
                      units={units}
                      lessons={lessons}
                      materials={materials}
                      getStatusColor={getStatusColor}
                      onExpand={handleExpandCourse}
                      onOpenModal={openModal}
                      onDeleteCourse={handleDeleteCourse}
                      onSubmitCourse={handleSubmitCourse}
                      onDeleteUnit={handleDeleteUnit}
                      onDeleteLesson={handleDeleteLesson}
                      onDeleteMaterial={handleDeleteMaterial}
                      selectedCourse={selectedCourse}
                      onPreview={handlePreviewCourse}
                    />
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

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

      {/* Course Review Dialog với AppBar đẹp */}
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
              sx={{
                "&:hover": {
                  bgcolor: "#f1f5f9",
                },
              }}
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
