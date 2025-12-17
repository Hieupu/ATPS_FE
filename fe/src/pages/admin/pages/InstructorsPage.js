import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Pagination,
  Divider,
} from "@mui/material";
import {
  Add,
  Search,
  Person,
  CheckCircle,
  Cancel,
  People,
  Star,
  Phone,
  School,
  Work,
  Class,
  Group,
  Edit,
  Book,
  MoreVert,
  CalendarToday,
  EventBusy,
  Verified,
  Lock,
  LockOpen,
} from "@mui/icons-material";
import "../pages/style.css";
import instructorService from "../../../apiServices/instructorServicead";
import classService from "../../../apiServices/classService";
import accountService from "../../../apiServices/accountService";
import certificateService from "../../../apiServices/certificateService";
import { useAuth } from "../../../contexts/AuthContext";
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateFullName,
  validateInstructorFee,
  validateConfirmPassword,
} from "../../../utils/validate";
import {
  handleStatusToggle,
  getStatusButtonLabel,
  toggleStatus,
} from "../../../utils/statusToggle";
import InstructorStatusChangeModal from "../components/InstructorStatusChangeModal";
import UserFormModal from "../components/UserFormModal";

const AdminInstructorsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [statusInput, setStatusInput] = useState("all");
  const [typeInput, setTypeInput] = useState("all");
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showClassesDialog, setShowClassesDialog] = useState(false);
  const [showCoursesDialog, setShowCoursesDialog] = useState(false);
  const [instructorClasses, setInstructorClasses] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [statusChangeInstructor, setStatusChangeInstructor] = useState(null);
  const [statusChangeClasses, setStatusChangeClasses] = useState([]);
  const [showInstructorForm, setShowInstructorForm] = useState(false);
  const [formData, setFormData] = useState({
    FullName: "",
    Email: "",
    Phone: "",
    Password: "",
    Address: "",
    DateOfBirth: "",
    ProfilePicture: "",
    Gender: "other",
    Major: "",
    Job: "",
    CV: "",
    InstructorFee: null,
    Type: "parttime",
  });
  const [newErrors, setNewErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInstructors();
  }, []);

  const loadInstructors = async () => {
    try {
      setLoading(true);
      // Gọi API admin-specific để lấy danh sách giảng viên từ database
      // Format: { success: true, data: [...] }
      const instructorsList = await instructorService.getAllInstructorsAdmin();

      const mappedInstructors = instructorsList.map((instructor) => ({
        ...instructor,
        Status: instructor.Status?.trim() || "active",
        Gender: instructor.Gender?.trim() || "other",
        Email: instructor.Email || instructor.account?.Email || "",
        Phone: instructor.Phone || instructor.account?.Phone || "",
      }));

      setInstructors(mappedInstructors);
    } catch (error) {
      setInstructors([]);
      alert("Không thể tải danh sách giảng viên từ database!");
    } finally {
      setLoading(false);
    }
  };

  const openInstructorModal = (instructor = null) => {
    setSelectedInstructor(instructor);
    setFormData({
      FullName: instructor?.FullName || "",
      Email: instructor?.Email || "",
      Phone: instructor?.Phone || "",
      Password: "",
      Address: instructor?.Address || "",
      DateOfBirth: instructor?.DateOfBirth
        ? instructor.DateOfBirth.split("T")[0]
        : "",
      ProfilePicture: instructor?.ProfilePicture || "",
      Gender: instructor?.Gender || "other",
      Major: instructor?.Major || "",
      Job: instructor?.Job || "",
      CV: instructor?.CV || "",
      InstructorFee: instructor?.InstructorFee || null,
      Type: instructor?.Type || instructor?.InstructorType || "parttime",
    });
    setNewErrors({});
    setShowInstructorForm(true);
  };

  const closeInstructorModal = () => {
    setShowInstructorForm(false);
    setSelectedInstructor(null);
    setFormData({
      FullName: "",
      Email: "",
      Phone: "",
      Password: "",
      ConfirmPassword: "",
      Address: "",
      DateOfBirth: "",
      ProfilePicture: "",
      Gender: "other",
      Major: "",
      Job: "",
      CV: "",
      InstructorFee: null,
      Type: "parttime",
    });
    setNewErrors({});
  };

  const handleSubmitInstructor = async () => {
    const errors = {};

    const fullNameError = validateFullName(formData.FullName);
    if (fullNameError) {
      errors.FullName = fullNameError;
    }

    const emailError = validateEmail(formData.Email);
    if (emailError) {
      errors.Email = emailError;
    }

    if (!selectedInstructor) {
      const passwordError = validatePassword(formData.Password, true);
      if (passwordError) {
        errors.Password = passwordError;
      }
      // Validate confirm password when creating
      const confirmPasswordError = validateConfirmPassword(
        formData.Password,
        formData.ConfirmPassword,
        true
      );
      if (confirmPasswordError) {
        errors.ConfirmPassword = confirmPasswordError;
      }
    } else if (formData.Password) {
      const passwordError = validatePassword(formData.Password, false);
      if (passwordError) {
        errors.Password = passwordError;
      }
      // Validate confirm password when updating (if password is provided)
      const confirmPasswordError = validateConfirmPassword(
        formData.Password,
        formData.ConfirmPassword,
        false
      );
      if (confirmPasswordError) {
        errors.ConfirmPassword = confirmPasswordError;
      }
    }

    if (formData.Phone) {
      const phoneError = validatePhone(formData.Phone);
      if (phoneError) {
        errors.Phone = phoneError;
      }
    }

    if (!formData.Major || !formData.Major.trim()) {
      errors.Major = "Vui lòng nhập chuyên môn";
    }

    if (!formData.CV || !formData.CV.trim()) {
      errors.CV = "Vui lòng tải CV";
    }

    // Validate InstructorFee nếu có giá trị
    if (
      formData.InstructorFee !== null &&
      formData.InstructorFee !== undefined &&
      formData.InstructorFee !== ""
    ) {
      const feeError = validateInstructorFee(formData.InstructorFee);
      if (feeError) {
        errors.InstructorFee = feeError;
      }
    }

    if (Object.keys(errors).length > 0) {
      setNewErrors(errors);
      return;
    }

    setNewErrors({});

    try {
      setSaving(true);
      if (selectedInstructor) {
        const instructorData = {
          FullName: formData.FullName.trim(),
          DateOfBirth: formData.DateOfBirth || null,
          ProfilePicture: formData.ProfilePicture || null,
          Job: formData.Job?.trim() || null,
          Address: formData.Address?.trim() || null,
          CV: formData.CV || null,
          Major: formData.Major?.trim() || null,
          InstructorFee: formData.InstructorFee
            ? parseFloat(formData.InstructorFee)
            : null,
        };

        await instructorService.updateInstructor(
          selectedInstructor.InstructorID,
          instructorData
        );

        const accountData = {};
        const normalizedEmail = formData.Email.trim().toLowerCase();
        if (
          normalizedEmail !== (selectedInstructor.Email || "").toLowerCase()
        ) {
          accountData.Email = normalizedEmail;
        }

        const currentPhone = (selectedInstructor.Phone || "").trim();
        const newPhone = (formData.Phone || "").trim();
        if (newPhone && newPhone !== currentPhone) {
          accountData.Phone = newPhone;
        }

        if (formData.Password && formData.Password.trim()) {
          accountData.Password = formData.Password;
        }

        if (
          formData.Gender &&
          formData.Gender !== (selectedInstructor.Gender || "other")
        ) {
          accountData.Gender = formData.Gender;
        }

        if (selectedInstructor.AccID && Object.keys(accountData).length > 0) {
          try {
            await accountService.updateAccount(
              selectedInstructor.AccID,
              accountData
            );
            alert("Cập nhật giảng viên và tài khoản thành công!");
          } catch (accountError) {
            const errorMessage =
              accountError.response?.data?.message ||
              accountError.message ||
              "Lỗi không xác định";
            alert(
              `Cập nhật giảng viên thành công, nhưng có lỗi khi cập nhật thông tin tài khoản:\n${errorMessage}`
            );
          }
        } else {
          alert("Cập nhật giảng viên thành công!");
        }
      } else {
        const instructorData = {
          FullName: formData.FullName.trim(),
          Major: formData.Major?.trim() || null,
          Job: formData.Job?.trim() || null,
          Address: formData.Address?.trim() || null,
          DateOfBirth: formData.DateOfBirth || null,
          ProfilePicture: formData.ProfilePicture || null,
          CV: formData.CV || null,
          InstructorFee: formData.InstructorFee
            ? parseFloat(formData.InstructorFee)
            : null,
          Type: formData.Type || "parttime",
          Email: formData.Email.trim().toLowerCase(),
          Phone: formData.Phone?.trim() || null,
          Password: formData.Password,
          Gender: formData.Gender || "other",
        };

        await instructorService.createInstructor(instructorData);
        alert("Tạo giảng viên mới thành công!");
      }

      closeInstructorModal();
      await loadInstructors();
    } catch (error) {
      console.error("Save error:", error);
      alert(error?.message || "Không thể lưu dữ liệu");
    } finally {
      setSaving(false);
    }
  };

  const handleViewClasses = async (instructor) => {
    try {
      setSelectedInstructor(instructor);
      // Gọi API để lấy danh sách lớp học của giảng viên từ database
      const classes = await classService.getClassesByInstructorId(
        instructor.InstructorID
      );

      // Map dữ liệu từ database theo schema dbver6.md
      const mappedClasses = Array.isArray(classes)
        ? classes.map((classItem) => ({
            ClassID: classItem.ClassID || classItem.id,
            Name: classItem.Name || classItem.ClassName || "N/A",
            Status: classItem.Status || classItem.status || "N/A",
            Fee: classItem.Fee || classItem.ClassFee || 0,
            Maxstudent: classItem.Maxstudent || classItem.MaxLearners || 0,
            Numofsession:
              classItem.Numofsession || classItem.ExpectedSessions || 0,
            OpendatePlan:
              classItem.OpendatePlan || classItem.StartDate || "N/A",
            EnddatePlan: classItem.EnddatePlan || classItem.EndDate || "N/A",
            CourseID: classItem.CourseID || null,
            CourseTitle:
              classItem.CourseTitle || classItem.Course?.Title || "N/A",
            // Tính số học viên đã đăng ký từ enrollments nếu có
            EnrolledStudents:
              classItem.enrolledStudents?.length ||
              classItem.EnrolledStudents ||
              0,
          }))
        : [];

      setInstructorClasses(mappedClasses);
      setShowClassesDialog(true);
    } catch (error) {
      setInstructorClasses([]);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tải danh sách lớp học từ database!"
      );
    }
  };

  const handleToggleInstructorStatus = async (instructor) => {
    try {
      // 1. Lấy danh sách lớp của instructor
      const classes = await classService.getClassesByInstructorId(
        instructor.InstructorID
      );

      // 2. Filter lớp (Status != "CANCEL")
      const activeClasses = classes.filter(
        (cls) => (cls.Status || "").toUpperCase() !== "CANCEL"
      );

      // 3. Nếu có lớp: mở modal với danh sách lớp
      if (activeClasses.length > 0) {
        setStatusChangeInstructor(instructor);
        setStatusChangeClasses(activeClasses);
        setShowStatusChangeModal(true);
      } else {
        // 4. Nếu không có lớp: update status trực tiếp
        const newStatus = toggleStatus(instructor.Status || "active", "instructor");
        await accountService.updateAccount(instructor.AccID, {
          Status: newStatus,
        });
        alert(
          `${getStatusButtonLabel(instructor.Status || "active")} thành công!`
        );
        await loadInstructors();
      }
    } catch (error) {
      console.error("Toggle instructor status error:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể đổi trạng thái"
      );
    }
  };

  const handleCancelInstructorClasses = async (classIds) => {
    try {
      const results = [];
      for (const classId of classIds) {
        try {
          await classService.cancelClass(classId);
          results.push({ classId, success: true });
        } catch (error) {
          results.push({
            classId,
            success: false,
            error: error.message || error.response?.data?.message,
          });
        }
      }

      const successCount = results.filter((r) => r.success).length;
      const failedCount = results.filter((r) => !r.success).length;

      if (failedCount > 0) {
        alert(
          `Đã hủy ${successCount} lớp, ${failedCount} lớp thất bại. Vui lòng kiểm tra lại.`
        );
      }
    } catch (error) {
      console.error("Cancel instructor classes error:", error);
      throw error;
    }
  };

  const handleConfirmStatusChange = async () => {
    try {
      if (!statusChangeInstructor) return;

      const newStatus = toggleStatus(
        statusChangeInstructor.Status || "active",
        "instructor"
      );
      await accountService.updateAccount(statusChangeInstructor.AccID, {
        Status: newStatus,
      });
      alert(
        `${getStatusButtonLabel(statusChangeInstructor.Status || "active")} thành công!`
      );
      await loadInstructors();
    } catch (error) {
      console.error("Update instructor status error:", error);
      throw error;
    }
  };

  const handleViewCourses = async (instructor) => {
    try {
      setSelectedInstructor(instructor);
      // Gọi API để lấy danh sách khóa học của giảng viên từ database
      const data = await instructorService.getInstructorWithCourses(
        instructor.InstructorID
      );

      // Backend trả về courses trong data theo schema dbver6.md
      const courses = data?.courses || data?.data?.courses || [];

      // Map dữ liệu từ database theo schema dbver6.md
      const mappedCourses = Array.isArray(courses)
        ? courses.map((course) => ({
            CourseID: course.CourseID || course.id,
            Title: course.Title || course.title || "N/A",
            Description: course.Description || course.description || "",
            Duration: course.Duration || course.duration || 0,
            Fee: course.Fee || course.fee || 0,
            Status: course.Status || course.status || "DRAFT",
            Level: course.Level || course.level || "BEGINNER",
            Code: course.Code || course.code || "",
            Image: course.Image || course.image || "",
            Objectives: course.Objectives || course.objectives || "",
            Requirements: course.Requirements || course.requirements || "",
          }))
        : [];

      setInstructorCourses(mappedCourses);
      setShowCoursesDialog(true);
    } catch (error) {
      setInstructorCourses([]);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tải danh sách khóa học từ database!"
      );
    }
  };

  const filteredInstructors = instructors.filter((instructor) => {
    const name = instructor.FullName?.toLowerCase() || "";
    const email = instructor.Email?.toLowerCase() || "";
    const major = instructor.Major?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      name.includes(search) || email.includes(search) || major.includes(search);
    const statusValue = (instructor.Status || "active").toLowerCase();
    const matchesStatus =
      statusFilter === "all" || statusValue === statusFilter.toLowerCase();

    const instructorType = instructor.Type || instructor.InstructorType || "";
    const matchesType =
      typeFilter === "all" || instructorType?.toLowerCase() === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Phân trang
  const paginatedInstructors = React.useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredInstructors.slice(startIndex, endIndex);
  }, [filteredInstructors, page, pageSize]);

  const totalPages = Math.ceil(filteredInstructors.length / pageSize) || 1;

  // Reset về trang 1 khi filter thay đổi
  React.useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, typeFilter]);

  const stats = {
    total: instructors.length,
    active: instructors.filter(
      (i) => (i.Status || "").toLowerCase() === "active"
    ).length,
    inactive: instructors.filter(
      (i) => (i.Status || "").toLowerCase() === "inactive"
    ).length,
    // totalStudents: computed từ enrollment, không có trong DB nên xóa
  };

  const statCards = [
    {
      label: "Tổng giảng viên",
      value: stats.total || 0,
      icon: <Person sx={{ fontSize: 32 }} />,
      color: "#667eea",
      bgColor: "#f0f4ff",
    },
    {
      label: "Đang hoạt động",
      value: stats.active || 0,
      icon: <CheckCircle sx={{ fontSize: 32 }} />,
      color: "#10b981",
      bgColor: "#f0fdf4",
    },
    {
      label: "Không hoạt động",
      value: stats.inactive || 0,
      icon: <Cancel sx={{ fontSize: 32 }} />,
      color: "#ef4444",
      bgColor: "#fef2f2",
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 8,
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
        }}
      >
        <CircularProgress sx={{ color: "#667eea" }} />
        <Typography sx={{ ml: 2, color: "#64748b" }}>
          Loading instructors...
        </Typography>
      </Box>
    );
  }

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
              Quản lý Giảng viên
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Quản lý thông tin và trạng thái của các giảng viên
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => openInstructorModal()}
            sx={{
              backgroundColor: "#667eea",
              textTransform: "none",
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#5568d3",
              },
            }}
          >
            Thêm giảng viên
          </Button>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
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
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        backgroundColor: stat.bgColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: stat.color,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#64748b", fontSize: "13px" }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Search and Filter */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: { xs: "stretch", lg: "center" },
          }}
        >
          <TextField
            placeholder="Tìm kiếm giảng viên..."
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{
              flex: 1,
              maxWidth: 400,
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
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusInput}
              label="Trạng thái"
              onChange={(e) => setStatusInput(e.target.value)}
              sx={{
                borderRadius: 2,
                backgroundColor: "#fff",
              }}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="active">Hoạt động</MenuItem>
              <MenuItem value="inactive">Không hoạt động</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Loại giảng viên</InputLabel>
            <Select
              value={typeInput}
              label="Loại giảng viên"
              onChange={(e) => setTypeInput(e.target.value)}
              sx={{
                borderRadius: 2,
                backgroundColor: "#fff",
              }}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="fulltime">Full-time</MenuItem>
              <MenuItem value="parttime">Part-time</MenuItem>
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                setSearchTerm(searchInput.trim());
                setStatusFilter(statusInput);
                setTypeFilter(typeInput);
              }}
              sx={{ textTransform: "none" }}
            >
              Áp dụng
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSearchInput("");
                setStatusInput("all");
                setTypeInput("all");
                setSearchTerm("");
                setStatusFilter("all");
                setTypeFilter("all");
              }}
              sx={{ textTransform: "none" }}
            >
              Xóa lọc
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Instructors Table */}
      {filteredInstructors.length === 0 ? (
        <Paper
          sx={{
            p: 8,
            textAlign: "center",
            borderRadius: 3,
            backgroundColor: "#fff",
          }}
        >
          <Person sx={{ fontSize: 64, color: "#94a3b8", mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, color: "#64748b" }}>
            Không tìm thấy giảng viên
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>
            Hãy thử thay đổi từ khóa tìm kiếm hoặc thêm giảng viên mới
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => openInstructorModal()}
            sx={{
              backgroundColor: "#667eea",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#5568d3",
              },
            }}
          >
            Thêm giảng viên đầu tiên
          </Button>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            border: "1px solid #e2e8f0",
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Họ tên
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Email
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Số điện thoại
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Chuyên môn
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Nghề nghiệp
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Trạng thái
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Chứng chỉ
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, color: "#1e293b" }}
                  align="right"
                >
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedInstructors.map((instructor) => (
                <TableRow
                  key={instructor.InstructorID}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#f8fafc",
                    },
                  }}
                >
                  <TableCell>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: "#667eea",
                          fontWeight: 600,
                          fontSize: 16,
                        }}
                      >
                        {instructor.FullName.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {instructor.FullName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{instructor.Email || "N/A"}</TableCell>
                  <TableCell>{instructor.Phone || "N/A"}</TableCell>
                  <TableCell>{instructor.Major || "N/A"}</TableCell>
                  <TableCell>{instructor.Job || "N/A"}</TableCell>
                  <TableCell>
                    {(() => {
                      const statusValue = (
                        instructor.Status || "active"
                      ).toLowerCase();
                      const isActive = statusValue === "active";
                      return (
                        <Chip
                          label={isActive ? "Hoạt động" : "Không hoạt động"}
                          size="small"
                          sx={{
                            backgroundColor: isActive ? "#10b981" : "#94a3b8",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "11px",
                          }}
                        />
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      // "Đã có" khi có ít nhất một chứng chỉ APPROVED
                      // "Chưa có" khi không có chứng chỉ nào, hoặc chỉ có PENDING/REJECTED
                      const hasApproved =
                        instructor.HasApprovedCertificate === true;

                      return (
                        <Chip
                          label={hasApproved ? "Đã có" : "Chưa có"}
                          size="small"
                          sx={{
                            backgroundColor: hasApproved
                              ? "#10b981"
                              : "#94a3b8",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "11px",
                          }}
                        />
                      );
                    })()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedRow(instructor);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredInstructors.length > 0 && (
            <>
              <Divider />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Hiển thị {(page - 1) * pageSize + 1} -{" "}
                  {Math.min(page * pageSize, filteredInstructors.length)} trong
                  tổng số {filteredInstructors.length} giảng viên
                </Typography>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  shape="rounded"
                />
              </Box>
            </>
          )}
        </TableContainer>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            minWidth: 180,
          },
        }}
      >
        {(() => {
          // Check if editing self
          if (!selectedRow || !user) return null;
          const currentUserAccID = user.AccID || user.accID || user.id;
          const selectedAccID = selectedRow.AccID || selectedRow.accID;
          const isEditingSelf =
            currentUserAccID &&
            selectedAccID &&
            currentUserAccID === selectedAccID;

          return !isEditingSelf ? (
            <MenuItem
              onClick={async () => {
                if (selectedRow) {
                  await handleToggleInstructorStatus(selectedRow);
                }
                setAnchorEl(null);
              }}
            >
              {(selectedRow?.Status || "active").toLowerCase() === "active" ? (
                <Lock sx={{ fontSize: 18, mr: 1.5 }} />
              ) : (
                <LockOpen sx={{ fontSize: 18, mr: 1.5 }} />
              )}
              {getStatusButtonLabel(selectedRow?.Status || "active")}
            </MenuItem>
          ) : null;
        })()}
        <MenuItem
          onClick={() => {
            openInstructorModal(selectedRow);
            setAnchorEl(null);
          }}
        >
          <Edit sx={{ fontSize: 18, mr: 1.5 }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedRow) {
              handleViewClasses(selectedRow);
            }
            setAnchorEl(null);
          }}
        >
          <Class sx={{ fontSize: 18, mr: 1.5 }} />
          Lớp học
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedRow) {
              handleViewCourses(selectedRow);
            }
            setAnchorEl(null);
          }}
        >
          <Book sx={{ fontSize: 18, mr: 1.5 }} />
          Khóa học
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedRow?.InstructorID) {
              const params = new URLSearchParams({
                instructorId: selectedRow.InstructorID,
                instructorName: selectedRow.FullName || "",
              });
              navigate(`/admin/instructor-calendar?${params.toString()}`);
            }
            setAnchorEl(null);
          }}
        >
          <CalendarToday sx={{ fontSize: 18, mr: 1.5 }} />
          Xem lịch giảng
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate(`/admin/instructor-leave`);
            setAnchorEl(null);
          }}
        >
          <EventBusy sx={{ fontSize: 18, mr: 1.5 }} />
          Quản lý lịch nghỉ
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedRow && selectedRow.InstructorID) {
              const instructorId = selectedRow.InstructorID;
              navigate(
                `/admin/instructor-certificates?instructorId=${instructorId}`
              );
            } else {
              alert("Không tìm thấy thông tin giảng viên");
            }
            setAnchorEl(null);
          }}
        >
          <Verified sx={{ fontSize: 18, mr: 1.5 }} />
          Quản lý chứng chỉ
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedRow && selectedRow.InstructorID) {
              const instructorId = selectedRow.InstructorID;
              navigate(
                `/admin/session-change-requests?instructorId=${instructorId}`
              );
            } else {
              alert("Không tìm thấy thông tin giảng viên");
            }
            setAnchorEl(null);
          }}
        >
          <Verified sx={{ fontSize: 18, mr: 1.5 }} />
          Yêu cầu chuyển lịch
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
              <Typography variant="h6">Lớp học của giảng viên</Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                {selectedInstructor?.FullName} - Tổng:{" "}
                {instructorClasses.length} lớp
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {instructorClasses.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Class sx={{ fontSize: 64, color: "#94a3b8", mb: 2 }} />
              <Typography variant="body1" sx={{ color: "#64748b" }}>
                Giảng viên này chưa có lớp học nào
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Tên lớp</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Học phí</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Học viên</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Số buổi</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Ngày bắt đầu</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {instructorClasses.map((classItem) => (
                    <TableRow key={classItem.ClassID}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {classItem.Name}
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
                              : classItem.Status
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
                      <TableCell>
                        {classItem.Fee
                          ? new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(classItem.Fee)
                          : "Miễn phí"}
                      </TableCell>
                      <TableCell>
                        {classItem.EnrolledStudents || 0}/
                        {classItem.Maxstudent || 0}
                      </TableCell>
                      <TableCell>{classItem.Numofsession || 0} buổi</TableCell>
                      <TableCell>{classItem.OpendatePlan || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            variant="outlined"
            onClick={() => {
              if (selectedInstructor?.InstructorID) {
                navigate(
                  `/admin/classes?instructorId=${selectedInstructor.InstructorID}`
                );
              }
            }}
            sx={{
              textTransform: "none",
              borderColor: "#667eea",
              color: "#667eea",
              "&:hover": {
                borderColor: "#5568d3",
                backgroundColor: "#f0f4ff",
              },
            }}
          >
            Xem tất cả lớp học
          </Button>
          <Box sx={{ flex: 1 }} />
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

      {/* Courses Dialog */}
      <Dialog
        open={showCoursesDialog}
        onClose={() => setShowCoursesDialog(false)}
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
            <Book sx={{ color: "#667eea" }} />
            <Box>
              <Typography variant="h6">Khóa học của giảng viên</Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                {selectedInstructor?.FullName} - Tổng:{" "}
                {instructorCourses.length} khóa học
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {instructorCourses.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Book sx={{ fontSize: 64, color: "#94a3b8", mb: 2 }} />
              <Typography variant="body1" sx={{ color: "#64748b" }}>
                Giảng viên này chưa có khóa học nào
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Tên khóa học</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Mô tả</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      Thời lượng (tuần)
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Học phí</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {instructorCourses.map((course) => (
                    <TableRow key={course.CourseID}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {course.Title}
                      </TableCell>
                      <TableCell>{course.Description}</TableCell>
                      <TableCell>{course.Duration || 0} tuần</TableCell>
                      <TableCell>
                        {course.Fee
                          ? new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(course.Fee)
                          : "Miễn phí"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            course.Status === "PUBLISHED"
                              ? "Đã xuất bản"
                              : course.Status === "APPROVED"
                              ? "Đã duyệt"
                              : course.Status === "IN_REVIEW"
                              ? "Chờ duyệt"
                              : course.Status === "DRAFT"
                              ? "Nháp"
                              : course.Status === "DELETED"
                              ? "Đã xóa"
                              : course.Status || "N/A"
                          }
                          size="small"
                          sx={{
                            backgroundColor:
                              course.Status === "PUBLISHED"
                                ? "#10b981"
                                : course.Status === "APPROVED"
                                ? "#06b6d4"
                                : course.Status === "IN_REVIEW"
                                ? "#f59e0b"
                                : "#94a3b8",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "11px",
                          }}
                        />
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
            variant="outlined"
            onClick={() => {
              if (selectedInstructor?.InstructorID) {
                navigate(
                  `/admin/courses?instructorId=${selectedInstructor.InstructorID}`
                );
              }
            }}
            sx={{
              textTransform: "none",
              borderColor: "#667eea",
              color: "#667eea",
              "&:hover": {
                borderColor: "#5568d3",
                backgroundColor: "#f0f4ff",
              },
            }}
          >
            Xem tất cả khóa học
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={() => setShowCoursesDialog(false)}
            sx={{
              textTransform: "none",
              color: "#64748b",
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Instructor Form Modal */}
      <UserFormModal
        open={showInstructorForm}
        onClose={closeInstructorModal}
        onSubmit={handleSubmitInstructor}
        title={
          selectedInstructor ? "Chỉnh sửa giảng viên" : "Thêm giảng viên mới"
        }
        formData={formData}
        setFormData={setFormData}
        errors={newErrors}
        setErrors={setNewErrors}
        saving={saving}
        isEditing={!!selectedInstructor}
        showInstructorFields={true}
        instructorService={instructorService}
      />

      {/* Instructor Status Change Modal */}
      <InstructorStatusChangeModal
        open={showStatusChangeModal}
        onClose={() => {
          setShowStatusChangeModal(false);
          setStatusChangeInstructor(null);
          setStatusChangeClasses([]);
        }}
        instructor={statusChangeInstructor}
        classes={statusChangeClasses}
        onConfirm={handleConfirmStatusChange}
        onCancelClasses={handleCancelInstructorClasses}
      />
    </Box>
  );
};

export default AdminInstructorsPage;
