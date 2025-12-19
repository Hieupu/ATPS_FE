import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
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
  Stack,
  Pagination,
} from "@mui/material";
import { Search, CheckCircle, Delete, Class } from "@mui/icons-material";
import {
  getCoursesForAdmin,
  updateCourseStatus,
  getCourseClasses,
  checkCourseInUse,
} from "../../../apiServices/courseService";
import instructorService from "../../../apiServices/instructorServicead";
import CoursesCardList from "../components/course/CoursesCardList";
import CourseReview from "../../instructor/components/course/CourseReview";
import "./style.css";

export default function CoursesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlInstructorId = searchParams.get("instructorId");

  const [tabValue, setTabValue] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showClassesDialog, setShowClassesDialog] = useState(false);
  const [courseClasses, setCourseClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [previewCourse, setPreviewCourse] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Xác nhận",
    confirmColor: "primary",
    onConfirm: null,
  });
  const [instructors, setInstructors] = useState([]);
  const [instructorInput, setInstructorInput] = useState(
    urlInstructorId || "all"
  );
  const [instructorFilter, setInstructorFilter] = useState(
    urlInstructorId || "all"
  );
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [courseToReject, setCourseToReject] = useState(null);

  // State cho Hoàn tác duyệt
  const [revertDialogOpen, setRevertDialogOpen] = useState(false);
  const [revertReason, setRevertReason] = useState("");
  const [courseToRevert, setCourseToRevert] = useState(null);

  // Mở dialog từ chối
  const handleOpenRejectDialog = (course) => {
    setCourseToReject(course);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  // Đóng dialog từ chối
  const handleCloseRejectDialog = () => {
    setRejectDialogOpen(false);
    setCourseToReject(null);
    setRejectReason("");
  };

  // Mở dialog hoàn tác duyệt
  const handleOpenRevertDialog = (course) => {
    setCourseToRevert(course);
    setRevertReason("");
    setRevertDialogOpen(true);
  };

  // Đóng dialog hoàn tác duyệt
  const handleCloseRevertDialog = () => {
    setRevertDialogOpen(false);
    setCourseToRevert(null);
    setRevertReason("");
  };

  // Xác nhận từ chối (Gọi API)
  const handleConfirmReject = async () => {
    const trimmedReason = rejectReason.trim();
    if (!trimmedReason) {
      setSnackbar({
        open: true,
        message: "Vui lòng nhập lý do từ chối",
        severity: "warning",
      });
      return;
    }

    if (!courseToReject) {
      handleCloseRejectDialog();
      return;
    }

    try {
      await updateCourseStatus(
        courseToReject.CourseID || courseToReject.courseId,
        "DRAFT", // Trạng thái trả về
        "reject", // Action
        trimmedReason // Lý do từ chối
      );

      setSnackbar({
        open: true,
        message: "Đã từ chối khóa học thành công",
        severity: "success",
      });

      loadCourses();
      handleCloseRejectDialog();
    } catch (error) {
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

  // Xác nhận hoàn tác duyệt (Gọi API)
  const handleConfirmRevert = async () => {
    const trimmedReason = revertReason.trim();
    if (!trimmedReason) {
      setSnackbar({
        open: true,
        message: "Vui lòng nhập lý do hoàn tác duyệt",
        severity: "warning",
      });
      return;
    }

    if (!courseToRevert) {
      handleCloseRevertDialog();
      return;
    }

    try {
      await updateCourseStatus(
        courseToRevert.CourseID || courseToRevert.courseId,
        "DRAFT", // Trạng thái trả về
        "revert", // Action
        trimmedReason // Lý do hoàn tác
      );

      setSnackbar({
        open: true,
        message: "Đã hoàn tác duyệt khóa học thành công",
        severity: "success",
      });

      loadCourses();
      handleCloseRevertDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể hoàn tác duyệt",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    loadCourses();
    loadInstructors();
  }, []);

  // Sync filters with URL params
  useEffect(() => {
    if (urlInstructorId) {
      setInstructorFilter(urlInstructorId);
      setInstructorInput(urlInstructorId);
    } else {
      setInstructorFilter("all");
      setInstructorInput("all");
    }
  }, [urlInstructorId]);

  const loadInstructors = async () => {
    try {
      // Sử dụng getAllInstructorsAdmin để lấy tất cả giảng viên (không giới hạn)
      const data = await instructorService.getAllInstructorsAdmin();
      setInstructors(data || []);
    } catch (error) {
      try {
        const fallbackData = await instructorService.getAllInstructors();
        setInstructors(fallbackData || []);
      } catch (fallbackError) {
        setInstructors([]);
      }
    }
  };

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await getCoursesForAdmin();
      const coursesData = Array.isArray(data) ? data : [];

      const allowedStatuses = ["IN_REVIEW", "APPROVED", "PUBLISHED"];
      const filtered = coursesData.filter((c) => {
        const status = (c.Status || c.status || "").toUpperCase();
        return allowedStatuses.includes(status);
      });

      setCourses(filtered);
    } catch (error) {
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

  // Handle search and filters
  const applyFilters = () => {
    setSearchTerm(searchInput);
    setInstructorFilter(instructorInput);

    // Update URL with filters
    const newParams = new URLSearchParams();
    if (instructorInput && instructorInput !== "all") {
      newParams.set("instructorId", instructorInput);
    }
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setInstructorInput("all");
    setInstructorFilter("all");

    // Navigate to base URL without query params
    navigate("/admin/courses");
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  // Filter courses by tab
  const getFilteredCourses = () => {
    let filtered = displayCourses;

    // Apply search filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          (c.Title || c.title || "").toLowerCase().includes(query) ||
          (c.Description || c.description || "")
            .toLowerCase()
            .includes(query) ||
          (c.Category || c.category || "").toLowerCase().includes(query)
      );
    }

    // Apply instructor filter
    if (instructorFilter && instructorFilter !== "all") {
      const instructorId = parseInt(instructorFilter);
      filtered = filtered.filter((c) => {
        const courseInstructorId =
          c.InstructorID ||
          c.instructorId ||
          c.Instructor?.InstructorID ||
          c.instructor?.InstructorID;
        return courseInstructorId === instructorId;
      });
    }

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

  useEffect(() => {
    setPage(1);
  }, [searchTerm, instructorFilter, tabValue]);

  const handlePreview = async (course) => {
    try {
      // Admin sử dụng trực tiếp dữ liệu từ danh sách courses đã có
      // Dữ liệu này đã được lấy từ getCoursesForAdmin() nên đầy đủ thông tin
      setPreviewCourse(course);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tải chi tiết khóa học";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const openConfirmDialog = ({
    title,
    message,
    confirmText = "Xác nhận",
    confirmColor = "primary",
    onConfirm,
  }) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      confirmText,
      confirmColor,
      onConfirm,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      title: "",
      message: "",
      confirmText: "Xác nhận",
      confirmColor: "primary",
      onConfirm: null,
    });
  };

  const handleConfirmDialogConfirm = () => {
    if (confirmDialog.onConfirm) {
      confirmDialog.onConfirm();
    }
    closeConfirmDialog();
  };

  const handleApprove = async (course, action) => {
    if (action === "APPROVE") {
      openConfirmDialog({
        title: "Duyệt khóa học",
        message: `Bạn có chắc muốn duyệt khóa học "${
          course.Title || course.title
        }"?`,
        confirmText: "Duyệt",
        confirmColor: "success",
        onConfirm: async () => {
          try {
            await updateCourseStatus(
              course.CourseID || course.courseId,
              "APPROVED",
              "approve" // Action để gửi notification
            );
            setSnackbar({
              open: true,
              message: "Duyệt khóa học thành công",
              severity: "success",
            });
            loadCourses();
          } catch (error) {
            setSnackbar({
              open: true,
              message: error?.message || "Lỗi khi duyệt",
              severity: "error",
            });
          }
        },
      });
    } else if (action === "REJECT") {
      handleOpenRejectDialog(course);
    }
  };

  const handleStatusChange = async (course, newStatus, action = null) => {
    const currentStatus = getStatus(course);
    let confirmTitle = "";
    let confirmMessage = "";
    let confirmColor = "primary";

    if (newStatus === "PUBLISHED") {
      confirmTitle = "Công khai khóa học";
      confirmMessage = `Bạn có chắc muốn công khai khóa học "${
        course.Title || course.title
      }"?`;
      confirmColor = "primary";
    } else if (newStatus === "APPROVED" && currentStatus === "PUBLISHED") {
      confirmTitle = "Hủy công khai khóa học";
      confirmMessage = `Bạn có chắc muốn hủy công khai khóa học "${
        course.Title || course.title
      }"?`;
      confirmColor = "warning";
    } else if (newStatus === "DRAFT") {
      confirmTitle = "Chuyển khóa học về nháp";
      confirmMessage = `Bạn có chắc muốn chuyển khóa học "${
        course.Title || course.title
      }" về trạng thái "Nháp"?`;
      confirmColor = "warning";
    }

    openConfirmDialog({
      title: confirmTitle,
      message: confirmMessage,
      confirmText: "Xác nhận",
      confirmColor,
      onConfirm: async () => {
        try {
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
          setSnackbar({
            open: true,
            message:
              error?.response?.data?.message ||
              error?.message ||
              "Không thể cập nhật trạng thái",
            severity: "error",
          });
        }
      },
    });
  };

  const handleViewClasses = async (course) => {
    try {
      setSelectedCourse(course);
      setLoadingClasses(true);
      setShowClassesDialog(true);
      const data = await getCourseClasses(course.CourseID || course.courseId);
      setCourseClasses(Array.isArray(data) ? data : []);
    } catch (error) {
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

  const filteredCourses = getFilteredCourses();
  const totalPages = Math.ceil(filteredCourses.length / pageSize);
  const paginatedCourses = filteredCourses.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <Box sx={{ p: 3, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(135deg, #8b47d6 0%, #5a95ff 100%)",
          color: "white",
          borderRadius: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Quản lý khóa học
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Quản lý, theo dõi khóa học trong hệ thống
          </Typography>
        </Box>
      </Paper>

      {/* Search & Filter */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          placeholder="Tìm kiếm khóa học (tên, mô tả)..."
          size="small"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleSearchKeyPress}
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
          size="small"
          options={[
            { InstructorID: "all", FullName: "Tất cả giảng viên" },
            ...instructors,
          ]}
          getOptionLabel={(option) =>
            typeof option === "string"
              ? option
              : option.FullName || option.fullName || ""
          }
          value={
            instructorInput === "all"
              ? { InstructorID: "all", FullName: "Tất cả giảng viên" }
              : instructors.find(
                  (i) => i.InstructorID === parseInt(instructorInput)
                ) || { InstructorID: "all", FullName: "Tất cả giảng viên" }
          }
          onChange={(event, newValue) => {
            if (newValue) {
              setInstructorInput(
                newValue.InstructorID === "all"
                  ? "all"
                  : newValue.InstructorID.toString()
              );
            } else {
              setInstructorInput("all");
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Giảng viên"
              placeholder="Tìm kiếm giảng viên..."
              sx={{
                minWidth: 200,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#fff",
                },
              }}
            />
          )}
          isOptionEqualToValue={(option, value) =>
            option.InstructorID === value.InstructorID
          }
        />
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            onClick={applyFilters}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
            }}
          >
            Áp dụng
          </Button>
          {(searchTerm || instructorFilter !== "all") && (
            <Button
              variant="outlined"
              onClick={resetFilters}
              sx={{
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              Xóa lọc
            </Button>
          )}
        </Stack>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{
          mb: 3,
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

      {/* Course Review Dialog */}
      <CourseReview
        course={previewCourse}
        onClose={() => setPreviewCourse(null)}
      />

      {/* Course List */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography sx={{ color: "#64748b" }}>Loading courses...</Typography>
        </Box>
      ) : filteredCourses.length === 0 ? (
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
            {searchTerm
              ? "Thử điều chỉnh từ khóa tìm kiếm"
              : "Chưa có khóa học nào"}
          </Typography>
        </Paper>
      ) : (
        <>
          <CoursesCardList
            courses={paginatedCourses}
            loading={false}
            onPreviewCourse={handlePreview}
            onViewClasses={handleViewClasses}
            onApprove={handleApprove}
            onReject={handleApprove}
            onPublish={(course) =>
              handleStatusChange(course, "PUBLISHED", "publish")
            }
            onUnpublish={(course) =>
              handleStatusChange(course, "APPROVED", "unpublish")
            }
            onRevert={(course) => handleOpenRevertDialog(course)}
            getStatus={getStatus}
          />
          {filteredCourses.length > pageSize && (
            <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}

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
                        {classItem.Name || classItem.ClassName || "N/A"}
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
                              ? "Đang tuyển sinh"
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

      {/* Confirm Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 2 }}>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={closeConfirmDialog}
            sx={{ textTransform: "none" }}
            color="inherit"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDialogConfirm}
            variant="contained"
            color={confirmDialog.confirmColor}
            sx={{ textTransform: "none" }}
          >
            {confirmDialog.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Reject Reason Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={handleCloseRejectDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 700, pb: 2, borderBottom: "2px solid #e2e8f0" }}
        >
          Từ chối khóa học
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {courseToReject && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2, color: "#64748b" }}>
                Bạn đang từ chối khóa học:{" "}
                <strong>{courseToReject.Title || courseToReject.title}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: "#64748b" }}>
                Vui lòng nhập lý do từ chối (sẽ gửi thông báo cho giảng viên):
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Nội dung bài 3 chưa rõ ràng, video bị lỗi âm thanh..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={handleCloseRejectDialog}
            sx={{
              textTransform: "none",
              color: "#64748b",
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmReject}
            variant="contained"
            color="error"
            sx={{
              textTransform: "none",
            }}
            disabled={!rejectReason || rejectReason.trim() === ""}
          >
            Xác nhận từ chối
          </Button>
        </DialogActions>
      </Dialog>

      {/* Revert Dialog - Hoàn tác duyệt */}
      <Dialog
        open={revertDialogOpen}
        onClose={handleCloseRevertDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 700, pb: 2, borderBottom: "2px solid #e2e8f0" }}
        >
          Hoàn tác duyệt khóa học
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {courseToRevert && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2, color: "#64748b" }}>
                Bạn đang hoàn tác duyệt khóa học:{" "}
                <strong>{courseToRevert.Title || courseToRevert.title}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: "#64748b" }}>
                Vui lòng nhập lý do hoàn tác (sẽ gửi thông báo cho giảng viên):
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={revertReason}
                onChange={(e) => setRevertReason(e.target.value)}
                placeholder="Ví dụ: Phát hiện vi phạm quy định, cần chỉnh sửa lại nội dung..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={handleCloseRevertDialog}
            sx={{
              textTransform: "none",
              color: "#64748b",
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmRevert}
            variant="contained"
            color="warning"
            sx={{
              textTransform: "none",
            }}
            disabled={!revertReason || revertReason.trim() === ""}
          >
            Xác nhận hoàn tác
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
