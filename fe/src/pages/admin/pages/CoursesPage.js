import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert,
  Autocomplete,
} from "@mui/material";
import {
  Search,
  FilterList,
  MoreVert,
  People,
  Schedule,
  PlayCircle,
  Delete,
  Visibility,
  CheckCircle,
  HourglassEmpty,
  Class,
} from "@mui/icons-material";
import {
  getCoursesForAdmin,
  updateCourseStatus,
  getCourseClasses,
  checkCourseInUse,
} from "../../../apiServices/courseService";
import instructorService from "../../../apiServices/instructorService";
import "./style.css";

export default function CoursesPage() {
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [showClassesDialog, setShowClassesDialog] = useState(false);
  const [courseClasses, setCourseClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [appliedInstructor, setAppliedInstructor] = useState(null);

  useEffect(() => {
    loadCourses();
    loadInstructors();
  }, []);

  const loadInstructors = async () => {
    try {
      const data = await instructorService.getAllInstructors();
      setInstructors(data || []);
    } catch (error) {
      console.error("Unable to load instructors", error);
    }
  };

  const loadCourses = async () => {
    try {
      setLoading(true);
      // Admin chỉ lấy IN_REVIEW, APPROVED, PUBLISHED
      const data = await getCoursesForAdmin();
      const coursesData = Array.isArray(data) ? data : [];

      // Filter thêm ở frontend để đảm bảo (backend đã filter nhưng double-check)
      const allowedStatuses = ["IN_REVIEW", "APPROVED", "PUBLISHED"];
      const filtered = coursesData.filter((c) => {
        const status = (c.Status || c.status || "").toUpperCase();
        return allowedStatuses.includes(status);
      });

      setCourses(filtered);
    } catch (error) {
      console.error("Error loading courses:", error);
      setCourses([]);
      setSnackbar({
        open: true,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể tải danh sách khóa học",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const displayCourses = courses;

  // Helper để lấy status (hỗ trợ cả PascalCase và camelCase từ backend)
  const getStatus = (course) =>
    (course.Status || course.status || "").toUpperCase();

  // Filter courses by tab
  const getFilteredCourses = () => {
    let filtered = displayCourses;

    // Apply search filter (chỉ áp dụng khi có appliedSearchQuery)
    if (appliedSearchQuery.trim()) {
      const query = appliedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          (c.Title || c.title || "").toLowerCase().includes(query) ||
          (c.Description || c.description || "")
            .toLowerCase()
            .includes(query) ||
          (c.Category || c.category || "").toLowerCase().includes(query)
      );
    }

    // Apply instructor filter (chỉ áp dụng khi có appliedInstructor)
    if (appliedInstructor) {
      const instructorId =
        appliedInstructor.InstructorID || appliedInstructor.instructorId;
      filtered = filtered.filter((c) => {
        const courseInstructorId =
          c.InstructorID ||
          c.instructorId ||
          c.Instructor?.InstructorID ||
          c.instructor?.InstructorID;
        return courseInstructorId === instructorId;
      });
    }

    // Apply tab filter
    // Tab 0: Tất cả (đã filter IN_REVIEW, APPROVED, PUBLISHED ở loadCourses)
    // Tab 1: Đã duyệt (APPROVED, PUBLISHED)
    // Tab 2: Chờ duyệt (IN_REVIEW)
    switch (tabValue) {
      case 0:
        return filtered; // Tất cả (đã filter ở loadCourses)
      case 1:
        return filtered.filter(
          (c) => getStatus(c) === "APPROVED" || getStatus(c) === "PUBLISHED"
        );
      case 2:
        return filtered.filter((c) => getStatus(c) === "IN_REVIEW");
      default:
        return filtered;
    }
  };

  const handleMenuOpen = (event, course) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourse(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
      case "APPROVED":
      case "PUBLISHED":
        return { bg: "#dcfce7", color: "#16a34a" };
      case "COMPLETED":
        return { bg: "#dbeafe", color: "#2563eb" };
      case "DRAFT":
        return { bg: "#fef3c7", color: "#d97706" };
      case "IN_REVIEW":
        return { bg: "#e0e7ff", color: "#6366f1" };
      default:
        return { bg: "#f1f5f9", color: "#64748b" };
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
      case "APPROVED":
      case "PUBLISHED":
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case "COMPLETED":
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case "DRAFT":
      case "IN_REVIEW":
        return <HourglassEmpty sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  const handlePreview = (course) => {
    // TODO: Implement preview functionality
    console.log("Preview course:", course);
    setSnackbar({
      open: true,
      message: "Chức năng preview sẽ được triển khai sau",
      severity: "info",
    });
  };

  const handleApprove = async (course, action) => {
    try {
      const currentStatus = getStatus(course);
      let newStatus;
      let actionType;

      if (action === "APPROVE") {
        // IN_REVIEW → APPROVED
        newStatus = "APPROVED";
        actionType = "approve";
      } else if (action === "REJECT") {
        // IN_REVIEW → DRAFT
        newStatus = "DRAFT";
        actionType = "reject";
      } else {
        throw new Error("Action không hợp lệ");
      }

      await updateCourseStatus(
        course.CourseID || course.courseId,
        newStatus,
        actionType
      );
      setSnackbar({
        open: true,
        message:
          action === "APPROVE"
            ? "Duyệt khóa học thành công"
            : "Từ chối khóa học thành công",
        severity: "success",
      });
      loadCourses();
    } catch (error) {
      console.error("Error approving course:", error);
      setSnackbar({
        open: true,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể cập nhật trạng thái",
        severity: "error",
      });
    }
  };

  const handleStatusChange = async (course, newStatus, action = null) => {
    try {
      const currentStatus = getStatus(course);

      // Nếu chuyển từ PUBLISHED, kiểm tra lớp học đang sử dụng
      if (currentStatus === "PUBLISHED" && newStatus !== "PUBLISHED") {
        const checkResult = await checkCourseInUse(
          course.CourseID || course.courseId
        );
        if (checkResult.inUse) {
          const classNames = checkResult.classes
            .map((c) => c.Name || `ClassID: ${c.ClassID}`)
            .join(", ");
          setSnackbar({
            open: true,
            message: `Không thể chuyển trạng thái. Khóa học đang được sử dụng bởi ${checkResult.classes.length} lớp học: ${classNames}`,
            severity: "error",
          });
          return;
        }
      }

      await updateCourseStatus(
        course.CourseID || course.courseId,
        newStatus,
        action
      );
      setSnackbar({
        open: true,
        message: "Cập nhật trạng thái thành công",
        severity: "success",
      });
      loadCourses();
    } catch (error) {
      console.error("Error updating course status:", error);
      setSnackbar({
        open: true,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể cập nhật trạng thái",
        severity: "error",
      });
    }
  };

  const handleViewClasses = async (course) => {
    try {
      setLoadingClasses(true);
      setShowClassesDialog(true);
      const data = await getCourseClasses(course.CourseID || course.courseId);
      setCourseClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading classes:", error);
      setCourseClasses([]);
      setSnackbar({
        open: true,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể tải danh sách lớp học",
        severity: "error",
      });
    } finally {
      setLoadingClasses(false);
    }
  };

  const approvedCount = displayCourses.filter(
    (c) => getStatus(c) === "APPROVED" || getStatus(c) === "PUBLISHED"
  ).length;
  const inReviewCount = displayCourses.filter(
    (c) => getStatus(c) === "IN_REVIEW"
  ).length;

  return (
    <Box sx={{ p: 1, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Quản lý khóa học
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Quản lý, theo dõi khóa học trong hệ thống
            </Typography>
          </Box>
        </Box>

        {/* Search & Filter */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <TextField
            placeholder="Tra cứu theo tên khóa học..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              flex: 1,
              minWidth: 250,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#fff",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#94a3b8" }} />
                </InputAdornment>
              ),
            }}
          />
          <Autocomplete
            options={instructors}
            getOptionLabel={(option) =>
              `${option.FullName || option.fullName || ""} - ${
                option.Major || option.major || ""
              }`
            }
            value={selectedInstructor}
            onChange={(event, newValue) => {
              setSelectedInstructor(newValue);
            }}
            size="small"
            sx={{
              minWidth: 250,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#fff",
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Chọn giảng viên..."
                label="Giảng viên"
              />
            )}
            isOptionEqualToValue={(option, value) =>
              option.InstructorID === value?.InstructorID
            }
          />
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => {
              // Áp dụng filter khi nhấn nút "Lọc"
              setAppliedSearchQuery(searchQuery);
              setAppliedInstructor(selectedInstructor);
            }}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              borderColor: "#e2e8f0",
              color: "#64748b",
              "&:hover": {
                borderColor: "#667eea",
                backgroundColor: "#f0f4ff",
              },
            }}
          >
            Lọc
          </Button>
          {(appliedInstructor || appliedSearchQuery.trim()) && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                // Xóa cả input và applied filter
                setSelectedInstructor(null);
                setSearchQuery("");
                setAppliedInstructor(null);
                setAppliedSearchQuery("");
              }}
              sx={{
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              Xóa lọc
            </Button>
          )}
        </Box>

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "14px",
              minHeight: "48px",
            },
            "& .Mui-selected": {
              color: "#667eea",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#667eea",
            },
          }}
        >
          <Tab label={`Tất cả (${displayCourses.length})`} />
          <Tab label={`Đã duyệt (${approvedCount})`} />
          <Tab label={`Chờ duyệt (${inReviewCount})`} />
        </Tabs>
      </Box>

      {/* Course Grid */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography sx={{ color: "#64748b" }}>Loading courses...</Typography>
        </Box>
      ) : getFilteredCourses().length === 0 ? (
        <Paper
          sx={{
            p: 8,
            textAlign: "center",
            borderRadius: 3,
            backgroundColor: "#fff",
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, color: "#64748b" }}>
            No courses found
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>
            {searchQuery
              ? "Thử điều chỉnh từ khóa tìm kiếm"
              : "Chưa có khóa học nào"}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {getFilteredCourses().map((course, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={
                course.CourseID ||
                course.courseId ||
                course.id ||
                `course-${index}`
              }
            >
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  },
                }}
              >
                {/* Thumbnail */}
                <Box
                  sx={{
                    height: 160,
                    background: `linear-gradient(135deg, ${
                      course.thumbnail || "#667eea"
                    } 0%, ${course.thumbnail || "#667eea"}dd 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <PlayCircle
                    sx={{ fontSize: 64, color: "white", opacity: 0.9 }}
                  />
                  <IconButton
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "rgba(255,255,255,0.9)",
                      "&:hover": { backgroundColor: "white" },
                    }}
                    size="small"
                    onClick={(e) => handleMenuOpen(e, course)}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                <CardContent>
                  {/* Status & Category */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Chip
                      label={
                        getStatus(course) === "IN_REVIEW"
                          ? "Chờ duyệt"
                          : getStatus(course) === "DRAFT"
                          ? "Nháp"
                          : getStatus(course) === "APPROVED"
                          ? "Đã duyệt"
                          : getStatus(course) === "PUBLISHED"
                          ? "Đã xuất bản"
                          : getStatus(course) === "DELETED"
                          ? "Đã xóa"
                          : course.Status || course.status || "active"
                      }
                      size="small"
                      icon={getStatusIcon(course.Status || course.status)}
                      sx={{
                        backgroundColor: getStatusColor(
                          course.Status || course.status || "active"
                        ).bg,
                        color: getStatusColor(
                          course.Status || course.status || "active"
                        ).color,
                        fontWeight: 600,
                        textTransform: "capitalize",
                        height: 26,
                      }}
                    />
                    <Chip
                      label={course.Category || course.category || "General"}
                      size="small"
                      sx={{
                        backgroundColor: "#f1f5f9",
                        color: "#64748b",
                        fontWeight: 500,
                        fontSize: "11px",
                        height: 24,
                      }}
                    />
                  </Box>

                  {/* Title */}
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, mb: 1, fontSize: "16px" }}
                  >
                    {course.Title ||
                      course.title ||
                      course.Name ||
                      course.name ||
                      "Untitled Course"}
                  </Typography>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 2,
                      color: "#64748b",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: 1.5,
                      minHeight: "42px",
                    }}
                  >
                    {course.Description ||
                      course.description ||
                      "No description available"}
                  </Typography>

                  {/* Stats */}
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <People sx={{ fontSize: 16, color: "#64748b" }} />
                      <Typography variant="caption" sx={{ color: "#64748b" }}>
                        {course.Students ||
                          course.students ||
                          course.enrollmentCount ||
                          0}{" "}
                        học viên
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Schedule sx={{ fontSize: 16, color: "#64748b" }} />
                      <Typography variant="caption" sx={{ color: "#64748b" }}>
                        {course.Duration || course.duration || 0} giờ
                      </Typography>
                    </Box>
                  </Box>

                  {/* Fee */}
                  {(course.Fee || course.fee) && (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#667eea" }}
                      >
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(course.Fee || course.fee)}
                      </Typography>
                    </Box>
                  )}

                  {/* Progress */}
                  {course.progress !== undefined &&
                    getStatus(course) !== "DRAFT" &&
                    getStatus(course) !== "IN_REVIEW" && (
                      <Box sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: "#64748b" }}
                          >
                            Progress
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600 }}
                          >
                            {course.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={course.progress}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: "#e2e8f0",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: course.thumbnail || "#667eea",
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>
                    )}

                  {/* Action Buttons for IN_REVIEW Courses */}
                  {getStatus(course) === "IN_REVIEW" && (
                    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckCircle />}
                        onClick={() => handleApprove(course, "APPROVE")}
                        sx={{
                          flex: 1,
                          textTransform: "none",
                          backgroundColor: "#10b981",
                          "&:hover": {
                            backgroundColor: "#059669",
                          },
                        }}
                      >
                        Duyệt
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => handleApprove(course, "REJECT")}
                        sx={{
                          textTransform: "none",
                          borderColor: "#ef4444",
                          color: "#ef4444",
                          "&:hover": {
                            borderColor: "#dc2626",
                            backgroundColor: "#fef2f2",
                          },
                        }}
                      >
                        Từ chối
                      </Button>
                    </Box>
                  )}

                  {/* Action Buttons for APPROVED Courses */}
                  {getStatus(course) === "APPROVED" && (
                    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckCircle />}
                        onClick={() =>
                          handleStatusChange(course, "PUBLISHED", "publish")
                        }
                        sx={{
                          flex: 1,
                          textTransform: "none",
                          backgroundColor: "#667eea",
                          "&:hover": {
                            backgroundColor: "#5568d3",
                          },
                        }}
                      >
                        Công khai
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Delete />}
                        onClick={() =>
                          handleStatusChange(course, "DRAFT", "revert")
                        }
                        sx={{
                          textTransform: "none",
                          borderColor: "#f59e0b",
                          color: "#f59e0b",
                          "&:hover": {
                            borderColor: "#d97706",
                            backgroundColor: "#fef3c7",
                          },
                        }}
                      >
                        Về nháp
                      </Button>
                    </Box>
                  )}

                  {/* Action Buttons for PUBLISHED Courses */}
                  {getStatus(course) === "PUBLISHED" && (
                    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CheckCircle />}
                        onClick={() =>
                          handleStatusChange(course, "APPROVED", "unpublish")
                        }
                        sx={{
                          flex: 1,
                          textTransform: "none",
                          borderColor: "#06b6d4",
                          color: "#06b6d4",
                          "&:hover": {
                            borderColor: "#0891b2",
                            backgroundColor: "#cffafe",
                          },
                        }}
                      >
                        Hủy công khai
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Course Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            minWidth: 180,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handlePreview(selectedCourse);
            handleMenuClose();
          }}
        >
          <Visibility sx={{ fontSize: 18, mr: 1.5 }} />
          Xem chi tiết
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedCourse) {
              handleViewClasses(selectedCourse);
            }
            handleMenuClose();
          }}
        >
          <Class sx={{ fontSize: 18, mr: 1.5 }} />
          Xem lớp học
        </MenuItem>
      </Menu>

      {/* Classes Dialog */}
      <Dialog
        open={showClassesDialog}
        onClose={() => setShowClassesDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 700, pb: 2, borderBottom: "2px solid #e2e8f0" }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Class sx={{ color: "#667eea" }} />
            <Box>
              <Typography variant="h6">Lớp học liên quan</Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                {selectedCourse?.Title || selectedCourse?.title || "N/A"} -
                Tổng: {courseClasses.length} lớp
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {loadingClasses ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : courseClasses.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Class sx={{ fontSize: 64, color: "#94a3b8", mb: 2 }} />
              <Typography variant="body1" sx={{ color: "#64748b" }}>
                Khóa học này chưa có lớp học nào
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Tên lớp</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Giảng viên</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Số buổi</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Ngày bắt đầu</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courseClasses.map((classItem) => (
                    <TableRow key={classItem.ClassID}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {classItem.Name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {classItem.instructorName ||
                          classItem.InstructorName ||
                          "N/A"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            classItem.Status === "DRAFT"
                              ? "Nháp"
                              : classItem.Status === "PENDING_APPROVAL"
                              ? "Chờ duyệt"
                              : classItem.Status === "APPROVED"
                              ? "Đã duyệt"
                              : classItem.Status === "PUBLISHED"
                              ? "Đã xuất bản"
                              : classItem.Status || "N/A"
                          }
                          size="small"
                          sx={{
                            backgroundColor:
                              classItem.Status === "PUBLISHED"
                                ? "#10b981"
                                : classItem.Status === "APPROVED"
                                ? "#06b6d4"
                                : classItem.Status === "PENDING_APPROVAL"
                                ? "#f59e0b"
                                : "#94a3b8",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "11px",
                          }}
                        />
                      </TableCell>
                      <TableCell>{classItem.Numofsession || 0} buổi</TableCell>
                      <TableCell>
                        {classItem.OpendatePlan || classItem.Opendate || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={() => setShowClassesDialog(false)}
            sx={{
              textTransform: "none",
              color: "#64748b",
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
