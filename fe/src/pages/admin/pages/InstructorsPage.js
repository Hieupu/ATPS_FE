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
  Visibility,
  VisibilityOff,
  Book,
  MoreVert,
  CalendarToday,
  EventBusy,
} from "@mui/icons-material";
import "../pages/style.css";
import instructorService from "../../../apiServices/instructorService";
import classService from "../../../apiServices/classService";
import accountService from "../../../apiServices/accountService";

const AdminInstructorsPage = () => {
  const navigate = useNavigate();
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [statusInput, setStatusInput] = useState("all");
  const [typeInput, setTypeInput] = useState("all");
  const [showInstructorForm, setShowInstructorForm] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showClassesDialog, setShowClassesDialog] = useState(false);
  const [showCoursesDialog, setShowCoursesDialog] = useState(false);
  const [instructorClasses, setInstructorClasses] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    loadInstructors();
  }, []);

  const loadInstructors = async () => {
    try {
      setLoading(true);
      // Gọi API admin-specific để lấy danh sách giảng viên từ database
      // Format: { success: true, data: [...] }
      const instructorsList = await instructorService.getAllInstructorsAdmin();
      console.log("Đã tải danh sách giảng viên từ DB:", instructorsList.length);
      console.log(
        "Sample instructor data (raw):",
        JSON.stringify(instructorsList[0], null, 2)
      );
      console.log("Sample instructor Status:", instructorsList[0]?.Status);
      console.log("Sample instructor Gender:", instructorsList[0]?.Gender);

      // Map Status và Gender từ account (đã được SELECT trong query và map trong repository)
      // Repository đã map AccountStatus -> Status và AccountGender -> Gender
      const mappedInstructors = instructorsList.map((instructor) => {
        const mapped = {
          ...instructor,
          // Status từ account table (đã được map trong repository từ AccountStatus)
          // Chỉ fallback nếu thực sự null/undefined/empty
          Status:
            instructor.Status && instructor.Status.trim()
              ? instructor.Status.trim()
              : "active",
          // Gender từ account table (đã được map trong repository từ AccountGender)
          // Chỉ fallback nếu thực sự null/undefined/empty
          Gender:
            instructor.Gender && instructor.Gender.trim()
              ? instructor.Gender.trim()
              : "other",
          // Đảm bảo Email và Phone có sẵn
          Email: instructor.Email || instructor.account?.Email || "",
          Phone: instructor.Phone || instructor.account?.Phone || "",
        };
        console.log(
          `Instructor ${mapped.InstructorID}: Status="${mapped.Status}", Gender="${mapped.Gender}"`
        );
        return mapped;
      });

      setInstructors(mappedInstructors);
    } catch (error) {
      console.error("Lỗi khi tải danh sách giảng viên:", error);
      console.error("Error response:", error.response);
      setInstructors([]);
      alert("Không thể tải danh sách giảng viên từ database!");
    } finally {
      setLoading(false);
    }
  };

  const handleAddInstructor = () => {
    setSelectedInstructor(null);
    setShowInstructorForm(true);
  };

  const handleEditInstructor = (instructor) => {
    setSelectedInstructor(instructor);
    setShowInstructorForm(true);
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
      console.error("Lỗi khi tải danh sách lớp học:", error);
      setInstructorClasses([]);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tải danh sách lớp học từ database!"
      );
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
      console.error("Lỗi khi tải danh sách khóa học:", error);
      setInstructorCourses([]);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tải danh sách khóa học từ database!"
      );
    }
  };

  const handleSubmitInstructor = async (formData) => {
    try {
      if (selectedInstructor) {
        // CẬP NHẬT giảng viên và account
        // Backend whitelist cho instructor update: FullName, DateOfBirth, ProfilePicture, Job, Address, CV, Major, InstructorFee
        // KHÔNG được gửi: Email, Phone (nằm trong bảng account)
        const instructorData = {
          FullName: formData.FullName,
          DateOfBirth: formData.DateOfBirth || null,
          ProfilePicture: formData.ProfilePicture || null,
          Job: formData.Job || null,
          Address: formData.Address || null,
          CV: formData.CV || null,
          Major: formData.Major || null,
          InstructorFee: formData.InstructorFee
            ? parseFloat(formData.InstructorFee)
            : null,
        };

        // Account data (Email, Phone, Status từ account table) - gửi riêng qua accountService
        // Chỉ gửi Email và Phone nếu chúng thay đổi (tránh lỗi unique constraint khi giữ nguyên)
        const accountData = {};

        // Chỉ gửi Email nếu thay đổi
        if (formData.Email !== selectedInstructor.Email) {
          accountData.Email = formData.Email;
        }

        // Chỉ gửi Phone nếu thay đổi
        const currentPhone = selectedInstructor.Phone || null;
        const newPhone = formData.Phone || null;
        if (newPhone !== currentPhone) {
          accountData.Phone = newPhone;
        }

        // Luôn gửi Status nếu có thay đổi hoặc cần update
        const currentStatus = selectedInstructor.Status || "active";
        const newStatus = formData.Status || "active";
        // Normalize status để so sánh (active vs ACTIVE)
        const normalizedCurrentStatus = currentStatus.toLowerCase();
        const normalizedNewStatus = newStatus.toLowerCase();
        if (normalizedNewStatus !== normalizedCurrentStatus) {
          accountData.Status = formData.Status;
        } else if (Object.keys(accountData).length === 0) {
          // Nếu không có field nào thay đổi nhưng Status vẫn cần được gửi để đảm bảo
          accountData.Status = formData.Status;
        }

        // Nếu có password mới, thêm vào accountData
        if (formData.Password && formData.Password.trim()) {
          accountData.Password = formData.Password;
        }

        console.log("Account data to update:", accountData);
        console.log("Current Status:", currentStatus, "New Status:", newStatus);

        // Update instructor (chỉ các trường hợp lệ)
        await instructorService.updateInstructor(
          selectedInstructor.InstructorID,
          instructorData
        );

        // Update account (nếu có AccID và có data cần update)
        // Fallback: nếu endpoint không tồn tại, thử gửi account data cùng với instructor data
        let accountUpdated = false;
        if (selectedInstructor.AccID && Object.keys(accountData).length > 0) {
          console.log("Bắt đầu cập nhật account với data:", accountData);
          try {
            await accountService.updateAccount(
              selectedInstructor.AccID,
              accountData
            );
            accountUpdated = true;
            console.log(
              "Đã cập nhật account thành công qua /accounts endpoint"
            );
          } catch (accountError) {
            console.error("Lỗi khi cập nhật account:", accountError);
            // Nếu endpoint không tồn tại, thử gửi account data cùng với instructor data
            if (
              accountError.isEndpointNotFound ||
              accountError.response?.status === 404
            ) {
              console.warn(
                "Endpoint /accounts không tồn tại, thử gửi account data cùng với instructor data"
              );
              // Thử gửi account data cùng với instructor data
              // Backend whitelist sẽ lọc Email, Phone ra, nhưng có thể backend có logic đặc biệt
              // để update account khi nhận Email, Phone, Status trong request
              try {
                await instructorService.updateInstructor(
                  selectedInstructor.InstructorID,
                  {
                    ...instructorData,
                    ...accountData, // Gửi Email, Phone, Status cùng với instructor data
                  }
                );
                accountUpdated = true;
                console.log(
                  "Đã cập nhật account thông qua instructor endpoint (fallback)"
                );
              } catch (fallbackError) {
                console.error(
                  "Không thể cập nhật account: backend không hỗ trợ update account",
                  fallbackError
                );
                // Thông báo cho user biết account không được update
                alert(
                  "Cập nhật giảng viên thành công, nhưng không thể cập nhật thông tin tài khoản (Email, Phone, Status).\n\nVui lòng liên hệ backend để bổ sung endpoint PUT /api/accounts/:accId"
                );
              }
            } else {
              // Các lỗi khác (400, 500, etc.)
              console.error("Lỗi khi cập nhật account:", accountError);
              const errorMessage =
                accountError.response?.data?.message ||
                accountError.message ||
                "Lỗi không xác định";
              // Thông báo cho user biết account không được update
              alert(
                `Cập nhật giảng viên thành công, nhưng có lỗi khi cập nhật thông tin tài khoản:\n${errorMessage}\n\nVui lòng kiểm tra lại.`
              );
            }
          }
        } else if (
          selectedInstructor.AccID &&
          Object.keys(accountData).length === 0
        ) {
          console.log(
            "Không có thay đổi nào trong account data, bỏ qua update account"
          );
        }

        if (accountUpdated) {
          alert("Cập nhật giảng viên và tài khoản thành công!");
        } else {
          // Instructor đã được update, chỉ account chưa
          // Alert đã được hiển thị ở trên
        }
      } else {
        // TẠO MỚI giảng viên và account
        if (!formData.Password || !formData.Password.trim()) {
          alert("Vui lòng nhập mật khẩu để tạo tài khoản!");
          return;
        }

        // Tạo instructor với account data (backend sẽ tự tạo account)
        const instructorData = {
          FullName: formData.FullName,
          Major: formData.Major || null,
          Job: formData.Job || null,
          Address: formData.Address || null,
          DateOfBirth: formData.DateOfBirth || null,
          ProfilePicture: formData.ProfilePicture || null,
          CV: formData.CV || null, // Thêm CV
          InstructorFee: formData.InstructorFee
            ? parseFloat(formData.InstructorFee)
            : null,
          Type: formData.Type || "parttime",
          // Account fields để backend tạo account
          Email: formData.Email,
          Phone: formData.Phone || null,
          Password: formData.Password,
          Status: formData.Status || "active",
          Gender: formData.Gender || "other",
        };

        await instructorService.createInstructor(instructorData);
        alert("Tạo giảng viên mới thành công!");
      }
      // Reload danh sách sau khi lưu
      await loadInstructors();
      setShowInstructorForm(false);
    } catch (error) {
      console.error("Lỗi khi lưu giảng viên:", error);

      // Xử lý error response chi tiết hơn
      let errorMessage = "Không thể lưu giảng viên!";

      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Nếu có nhiều lỗi validation
          errorMessage = `Dữ liệu không hợp lệ:\n${errorData.errors.join(
            "\n"
          )}`;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
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
            onClick={handleAddInstructor}
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
            onClick={handleAddInstructor}
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
        <MenuItem
          onClick={() => {
            handleEditInstructor(selectedRow);
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
      {showInstructorForm && (
        <InstructorForm
          instructorData={selectedInstructor}
          onSubmit={handleSubmitInstructor}
          onCancel={() => setShowInstructorForm(false)}
        />
      )}
    </Box>
  );
};

// Instructor Form Component
const InstructorForm = ({ instructorData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    FullName: "",
    Email: "",
    Password: "",
    Phone: "",
    Major: "",
    Job: "",
    Address: "",
    DateOfBirth: "",
    ProfilePicture: "",
    CV: "",
    InstructorFee: null,
    Status: "active",
    Type: "parttime",
    Gender: "other",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (instructorData) {
      setFormData({
        FullName: instructorData.FullName || "",
        Email: instructorData.Email || "",
        Password: "", // Don't populate password for edit
        Phone: instructorData.Phone || "",
        Major: instructorData.Major || "",
        Job: instructorData.Job || "",
        Address: instructorData.Address || "",
        DateOfBirth: instructorData.DateOfBirth || "",
        ProfilePicture: instructorData.ProfilePicture || "",
        CV: instructorData.CV || "",
        InstructorFee: instructorData.InstructorFee || null,
        Status: instructorData.Status || "active",
        Type:
          instructorData.Type || instructorData.InstructorType || "parttime",
        Gender: instructorData.Gender || "other",
      });
    } else {
      // Reset form when creating new
      setFormData({
        FullName: "",
        Email: "",
        Password: "",
        Phone: "",
        Major: "",
        Job: "",
        Address: "",
        DateOfBirth: "",
        ProfilePicture: "",
        CV: "",
        InstructorFee: null,
        Status: "active",
        Type: "parttime",
        Gender: "other",
      });
    }
  }, [instructorData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.FullName.trim()) {
      newErrors.FullName = "Vui lòng nhập họ tên";
    }

    if (!formData.Email.trim()) {
      newErrors.Email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(formData.Email)) {
      newErrors.Email = "Email không hợp lệ";
    }

    // Password is required only when creating new instructor
    if (!instructorData && !formData.Password.trim()) {
      newErrors.Password = "Vui lòng nhập mật khẩu";
    } else if (formData.Password && formData.Password.length < 6) {
      newErrors.Password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.Phone.trim()) {
      newErrors.Phone = "Vui lòng nhập số điện thoại";
    } else {
      // Validate phone format (Vietnam: 10-11 digits, có thể bắt đầu bằng 0 hoặc +84)
      const phoneRegex = /^(\+84|0)[1-9][0-9]{8,9}$/;
      const cleanedPhone = formData.Phone.replace(/\s+/g, "");
      if (!phoneRegex.test(cleanedPhone)) {
        newErrors.Phone =
          "Số điện thoại không hợp lệ (VD: 0123456789 hoặc +84123456789)";
      }
    }

    if (!formData.Major.trim()) {
      newErrors.Major = "Vui lòng nhập chuyên môn";
    }

    // Validate Type
    if (formData.Type && !["fulltime", "parttime"].includes(formData.Type)) {
      newErrors.Type = "Loại giảng viên phải là fulltime hoặc parttime";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Only include password in submission if it was provided or if creating new
      const submitData = { ...formData };
      if (instructorData && !submitData.Password) {
        // Remove password field if editing and password is empty
        delete submitData.Password;
      }
      onSubmit(submitData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>
            {instructorData ? " Chỉnh sửa giảng viên" : " Thêm giảng viên mới"}
          </h2>
          <button className="close-btn" onClick={onCancel}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-group">
            <label htmlFor="FullName">Họ và tên *</label>
            <input
              type="text"
              id="FullName"
              value={formData.FullName}
              onChange={(e) =>
                setFormData({ ...formData, FullName: e.target.value })
              }
              className={errors.FullName ? "error" : ""}
              placeholder="Nhập họ và tên"
            />
            {errors.FullName && (
              <span className="error-message">{errors.FullName}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="Email">Email *</label>
              <input
                type="email"
                id="Email"
                value={formData.Email}
                onChange={(e) =>
                  setFormData({ ...formData, Email: e.target.value })
                }
                className={errors.Email ? "error" : ""}
                placeholder="Nhập email"
              />
              {errors.Email && (
                <span className="error-message">{errors.Email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="Password">
                Mật khẩu {!instructorData ? "*" : ""}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="Password"
                  value={formData.Password}
                  onChange={(e) =>
                    setFormData({ ...formData, Password: e.target.value })
                  }
                  className={errors.Password ? "error" : ""}
                  placeholder={
                    instructorData
                      ? "Để trống nếu không đổi mật khẩu"
                      : "Nhập mật khẩu (tối thiểu 6 ký tự)"
                  }
                  style={{ paddingRight: "40px", width: "100%" }}
                />
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    padding: "4px",
                  }}
                >
                  {showPassword ? (
                    <VisibilityOff fontSize="small" />
                  ) : (
                    <Visibility fontSize="small" />
                  )}
                </IconButton>
              </div>
              {errors.Password && (
                <span className="error-message">{errors.Password}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="Phone">Số điện thoại *</label>
              <input
                type="tel"
                id="Phone"
                value={formData.Phone}
                onChange={(e) =>
                  setFormData({ ...formData, Phone: e.target.value })
                }
                className={errors.Phone ? "error" : ""}
                placeholder="Nhập số điện thoại"
              />
              {errors.Phone && (
                <span className="error-message">{errors.Phone}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="Type">Loại giảng viên *</label>
              <select
                id="Type"
                value={formData.Type}
                onChange={(e) =>
                  setFormData({ ...formData, Type: e.target.value })
                }
                className={errors.Type ? "error" : ""}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              >
                <option value="parttime">Part-time</option>
                <option value="fulltime">Full-time</option>
              </select>
              {errors.Type && (
                <span className="error-message">{errors.Type}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="Gender">Giới tính *</label>
              <select
                id="Gender"
                value={formData.Gender}
                onChange={(e) =>
                  setFormData({ ...formData, Gender: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="Major">Chuyên môn *</label>
              <input
                type="text"
                id="Major"
                value={formData.Major}
                onChange={(e) =>
                  setFormData({ ...formData, Major: e.target.value })
                }
                className={errors.Major ? "error" : ""}
                placeholder="Ví dụ: Full Stack Development"
              />
              {errors.Major && (
                <span className="error-message">{errors.Major}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="Job">Nghề nghiệp</label>
              <input
                type="text"
                id="Job"
                value={formData.Job || ""}
                onChange={(e) =>
                  setFormData({ ...formData, Job: e.target.value })
                }
                placeholder="Ví dụ: Giảng viên, Developer"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="Address">Địa chỉ</label>
              <input
                type="text"
                id="Address"
                value={formData.Address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, Address: e.target.value })
                }
                placeholder="Nhập địa chỉ"
              />
            </div>

            <div className="form-group">
              <label htmlFor="DateOfBirth">Ngày sinh</label>
              <input
                type="date"
                id="DateOfBirth"
                value={formData.DateOfBirth || ""}
                onChange={(e) =>
                  setFormData({ ...formData, DateOfBirth: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="InstructorFee">Phí giảng dạy (VND)</label>
              <input
                type="number"
                id="InstructorFee"
                value={formData.InstructorFee || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    InstructorFee: parseFloat(e.target.value) || null,
                  })
                }
                min="0"
                step="1000"
                placeholder="Ví dụ: 500000"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ProfilePicture">Ảnh đại diện</label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {formData.ProfilePicture && (
                  <div style={{ marginBottom: "10px" }}>
                    <img
                      src={formData.ProfilePicture}
                      alt="Avatar preview"
                      style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  id="avatarFile"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Hiển thị loading
                      const loadingMsg = document.createElement("div");
                      loadingMsg.textContent = "Đang tải ảnh lên...";
                      loadingMsg.style.cssText =
                        "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999;";
                      document.body.appendChild(loadingMsg);

                      try {
                        const result = await instructorService.uploadAvatar(
                          file
                        );
                        setFormData({
                          ...formData,
                          ProfilePicture: result.url || result.data?.url,
                        });
                        document.body.removeChild(loadingMsg);
                        alert("Tải ảnh thành công!");
                      } catch (error) {
                        if (document.body.contains(loadingMsg)) {
                          document.body.removeChild(loadingMsg);
                        }
                        alert(
                          error?.message || "Lỗi khi tải ảnh. Vui lòng thử lại."
                        );
                      }
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  component="label"
                  htmlFor="avatarFile"
                  size="small"
                  fullWidth
                >
                  Chọn ảnh đại diện
                </Button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="CV">CV</label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {formData.CV && (
                  <div style={{ marginBottom: "10px" }}>
                    <Typography variant="body2" color="text.secondary">
                      CV đã tải:{" "}
                      <a
                        href={formData.CV}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#1976d2" }}
                      >
                        Xem CV
                      </a>
                    </Typography>
                  </div>
                )}
                <input
                  type="file"
                  id="cvFile"
                  accept=".pdf,.doc,.docx,image/*"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Hiển thị loading
                      const loadingMsg = document.createElement("div");
                      loadingMsg.textContent = "Đang tải CV lên...";
                      loadingMsg.style.cssText =
                        "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999;";
                      document.body.appendChild(loadingMsg);

                      try {
                        const result = await instructorService.uploadCV(file);
                        setFormData({
                          ...formData,
                          CV: result.url || result.data?.url,
                        });
                        document.body.removeChild(loadingMsg);
                        alert("Tải CV thành công!");
                      } catch (error) {
                        if (document.body.contains(loadingMsg)) {
                          document.body.removeChild(loadingMsg);
                        }
                        alert(
                          error?.message || "Lỗi khi tải CV. Vui lòng thử lại."
                        );
                      }
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  component="label"
                  htmlFor="cvFile"
                  size="small"
                  fullWidth
                >
                  Chọn CV
                </Button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="Status">Trạng thái tài khoản *</label>
            <select
              id="Status"
              value={formData.Status}
              onChange={(e) =>
                setFormData({ ...formData, Status: e.target.value })
              }
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              {instructorData ? " Cập nhật" : " Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminInstructorsPage;
