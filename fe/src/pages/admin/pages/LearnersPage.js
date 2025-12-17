import React, { useState, useEffect } from "react";
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
  Pagination,
  Divider,
} from "@mui/material";
import {
  Search,
  School,
  CheckCircle,
  Cancel,
  Class,
  Schedule,
  Phone,
  EmojiEvents,
  TrendingUp,
  Edit,
  MoreVert,
  Lock,
  LockOpen,
} from "@mui/icons-material";
import "./style.css";
import learnerService from "../../../apiServices/learnerService";
import accountService from "../../../apiServices/accountService";
import { useAuth } from "../../../contexts/AuthContext";
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateFullName,
  validateConfirmPassword,
} from "../../../utils/validate";
import {
  handleStatusToggle,
  getStatusButtonLabel,
} from "../../../utils/statusToggle";
import UserFormModal from "../components/UserFormModal";

// Helper function để normalize status value
const normalizeStatusValue = (status) => {
  const lower = (status || "active").toLowerCase();
  if (lower === "banned" || lower === "inactive") return "banned";
  return lower;
};

const LearnersPage = () => {
  const { user } = useAuth();
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [statusInput, setStatusInput] = useState("all");
  const [showLearnerForm, setShowLearnerForm] = useState(false);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showClassesDialog, setShowClassesDialog] = useState(false);
  const [learnerClasses, setLearnerClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [formData, setFormData] = useState({
    FullName: "",
    Email: "",
    Phone: "",
    Password: "",
    Address: "",
    DateOfBirth: "",
    ProfilePicture: "",
    Gender: "other",
    Job: "",
  });
  const [newErrors, setNewErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLearners();
  }, []);

  const loadLearners = async () => {
    try {
      setLoading(true);
      // Gọi API để lấy danh sách học viên từ database
      const learnersList = await learnerService.getAllLearners();
      // Map Status từ account - backend trả về AccountStatus từ JOIN với account table
      const mappedLearners = learnersList.map((learner) => {
        const mappedStatus =
          learner.AccountStatus || learner.Status || "active";
        return {
          ...learner,
          // AccountStatus là trường từ account table qua JOIN
          Status: mappedStatus,
          // Đảm bảo Email, Phone và Gender có sẵn từ account table
          Email: learner.Email || learner.account?.Email || "",
          Phone: learner.Phone || learner.account?.Phone || "",
          Gender: learner.Gender || learner.account?.Gender || "other",
        };
      });

      setLearners(mappedLearners);
    } catch (error) {
      setLearners([]);
      alert("Không thể tải danh sách học viên từ database!");
    } finally {
      setLoading(false);
    }
  };

  const openLearnerModal = (learner) => {
    setSelectedLearner(learner);
    // Lấy Gender từ learner object (đã được map từ account trong loadLearners)
    // Gender đã được map trực tiếp vào learner object trong loadLearners()
    const learnerGender =
      learner?.Gender || learner?.account?.Gender || "other";
    setFormData({
      FullName: learner?.FullName || "",
      Email: learner?.Email || "",
      Phone: learner?.Phone || "",
      Password: "",
      ConfirmPassword: "",
      Address: learner?.Address || "",
      DateOfBirth: learner?.DateOfBirth
        ? learner.DateOfBirth.split("T")[0]
        : "",
      ProfilePicture: learner?.ProfilePicture || "",
      Gender: learnerGender,
      Job: learner?.Job || "",
    });
    setNewErrors({});
    setShowLearnerForm(true);
  };

  const closeLearnerModal = () => {
    setShowLearnerForm(false);
    setSelectedLearner(null);
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
      Job: "",
    });
    setNewErrors({});
  };

  const handleViewClasses = async (learner) => {
    try {
      setSelectedLearner(learner);
      setLoadingClasses(true);
      setShowClassesDialog(true);

      // Gọi API để lấy danh sách lớp học của học viên
      const data = await learnerService.getLearnerWithClasses(
        learner.LearnerID
      );

      // Backend trả về: { success: true, data: { ...learner, enrollments: [...] } }
      // Hoặc có thể là: { ...learner, enrollments: [...] }
      let enrollments = [];
      if (data?.data?.enrollments) {
        enrollments = data.data.enrollments;
      } else if (data?.enrollments) {
        enrollments = data.enrollments;
      } else if (data?.classes) {
        enrollments = data.classes;
      } else if (Array.isArray(data)) {
        enrollments = data;
      } else if (data?.data && Array.isArray(data.data)) {
        enrollments = data.data;
      }

      // Map dữ liệu từ enrollments để hiển thị thông tin lớp học
      // Backend enrollmentRepository.findByLearnerId trả về:
      // - e.* (tất cả trường từ enrollment)
      // - ClassName, ClassID, ClassStatus, OpendatePlan, Numofsession
      // - InstructorName
      // - CourseTitle, CourseDescription, etc.
      const mappedClasses = enrollments.map((enrollment) => {
        return {
          ClassID: enrollment.ClassID || "N/A",
          Name: enrollment.ClassName || enrollment.Name || "N/A",
          Instructor:
            enrollment.InstructorName || enrollment.Instructor || "N/A",
          Status: enrollment.ClassStatus || enrollment.Status || "N/A",
          ExpectedSessions:
            enrollment.Numofsession || enrollment.ExpectedSessions || 0,
          StartDate:
            enrollment.OpendatePlan ||
            enrollment.Opendate ||
            enrollment.StartDate ||
            "N/A",
          EnrollmentDate: enrollment.EnrollmentDate || "N/A",
          OrderCode: enrollment.OrderCode || "N/A",
          CourseTitle: enrollment.CourseTitle || "N/A",
          ClassFee: enrollment.ClassFee || 0,
        };
      });

      setLearnerClasses(mappedClasses);
    } catch (error) {
      setLearnerClasses([]);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tải danh sách lớp học từ database!"
      );
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleSubmitLearner = async () => {
    const errors = {};

    const fullNameError = validateFullName(formData.FullName);
    if (fullNameError) {
      errors.FullName = fullNameError;
    }

    const emailError = validateEmail(formData.Email);
    if (emailError) {
      errors.Email = emailError;
    }

    if (formData.Phone) {
      const phoneError = validatePhone(formData.Phone);
      if (phoneError) {
        errors.Phone = phoneError;
      }
    }

    if (formData.Password) {
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

    if (Object.keys(errors).length > 0) {
      setNewErrors(errors);
      return;
    }

    setNewErrors({});

    try {
      setSaving(true);
      if (!selectedLearner) {
        alert("Không tìm thấy thông tin học viên!");
        return;
      }

      // CẬP NHẬT học viên và account
      const learnerData = {
        FullName: formData.FullName.trim(),
        DateOfBirth: formData.DateOfBirth || null,
        ProfilePicture: formData.ProfilePicture || null,
        Job: formData.Job?.trim() || null,
        Address: formData.Address?.trim() || null,
      };

      await learnerService.updateLearner(
        selectedLearner.LearnerID,
        learnerData
      );

      // Account data (Email, Phone, Status từ account table)
      const accountData = {};

      const normalizedEmail = formData.Email.trim().toLowerCase();
      if (normalizedEmail !== (selectedLearner.Email || "").toLowerCase()) {
        accountData.Email = normalizedEmail;
      }

      const currentPhone = (selectedLearner.Phone || "").trim();
      const newPhone = (formData.Phone || "").trim();
      if (newPhone && newPhone !== currentPhone) {
        accountData.Phone = newPhone;
      }

      if (formData.Password && formData.Password.trim()) {
        accountData.Password = formData.Password;
      }

      // Cập nhật Gender nếu có thay đổi
      // Lấy Gender hiện tại từ selectedLearner (đã được map từ account trong loadLearners)
      // Gender đã được map trực tiếp vào learner object trong loadLearners()
      const currentGender = (
        selectedLearner.Gender ||
        selectedLearner.account?.Gender ||
        "other"
      ).toLowerCase();
      const newGender = (formData.Gender || "other").toLowerCase();
      if (newGender !== currentGender) {
        accountData.Gender = formData.Gender;
      }

      if (selectedLearner.AccID && Object.keys(accountData).length > 0) {
        try {
          await accountService.updateAccount(
            selectedLearner.AccID,
            accountData
          );
          alert("Cập nhật học viên và tài khoản thành công!");
        } catch (accountError) {
          const errorMessage =
            accountError.response?.data?.message ||
            accountError.message ||
            "Lỗi không xác định";
          alert(
            `Cập nhật học viên thành công, nhưng có lỗi khi cập nhật thông tin tài khoản:\n${errorMessage}`
          );
        }
      } else {
        alert("Cập nhật học viên thành công!");
      }

      closeLearnerModal();
      await loadLearners();
    } catch (error) {
      console.error("Save error:", error);
      alert(error?.message || "Không thể lưu dữ liệu");
    } finally {
      setSaving(false);
    }
  };

  const filteredLearners = learners.filter((learner) => {
    const name = learner.FullName?.toLowerCase() || "";
    const email = learner.Email?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    const matchesSearch = name.includes(search) || email.includes(search);
    // Status đã được map từ AccountStatus trong loadLearners
    const statusValue = normalizeStatusValue(learner.Status);
    const matchesStatus =
      statusFilter === "all" || statusValue === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Phân trang
  const paginatedLearners = React.useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredLearners.slice(startIndex, endIndex);
  }, [filteredLearners, page, pageSize]);

  const totalPages = Math.ceil(filteredLearners.length / pageSize) || 1;

  // Reset về trang 1 khi filter thay đổi
  React.useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const stats = {
    total: learners.length,
    // Status đã được map từ AccountStatus trong loadLearners
    active: learners.filter((l) => normalizeStatusValue(l.Status) === "active")
      .length,
    banned: learners.filter((l) => normalizeStatusValue(l.Status) === "banned")
      .length,
  };

  const statCards = [
    {
      label: "Tổng học viên",
      value: stats.total || 0,
      icon: <School sx={{ fontSize: 32 }} />,
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
      label: "Bị khóa",
      value: stats.banned || 0,
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
          Loading learners...
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
              Quản lý học
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Quản lý thông tin học viên
            </Typography>
          </Box>
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
            alignItems: { xs: "stretch", md: "center" },
          }}
        >
          <TextField
            placeholder="Tra cứu học viên..."
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
              label="Status"
              onChange={(e) => setStatusInput(e.target.value)}
              sx={{
                borderRadius: 2,
                backgroundColor: "#fff",
              }}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="active">Hoạt động</MenuItem>
              <MenuItem value="banned">Bị khóa</MenuItem>
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                setSearchTerm(searchInput.trim());
                setStatusFilter(statusInput);
              }}
              sx={{ textTransform: "none" }}
            >
              Lọc
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSearchInput("");
                setStatusInput("all");
                setSearchTerm("");
                setStatusFilter("all");
              }}
              sx={{ textTransform: "none" }}
            >
              Xóa lọc
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Learners Table */}
      {filteredLearners.length === 0 ? (
        <Paper
          sx={{
            p: 8,
            textAlign: "center",
            borderRadius: 3,
            backgroundColor: "#fff",
          }}
        >
          <School sx={{ fontSize: 64, color: "#94a3b8", mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, color: "#64748b" }}>
            No learners found
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>
            Try adjusting your search or add a new learner
          </Typography>
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
                  Họ và tên
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Email
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Số điện thoại
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Nghề nghiệp
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Địa chỉ
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Trạng thái
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, color: "#1e293b" }}
                  align="right"
                >
                  Hoạt động
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLearners.map((learner) => (
                <TableRow
                  key={learner.LearnerID}
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
                        {learner.FullName.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {learner.FullName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{learner.Email || "N/A"}</TableCell>
                  <TableCell>{learner.Phone || "N/A"}</TableCell>
                  <TableCell>{learner.Job || "N/A"}</TableCell>
                  <TableCell>{learner.Address || "N/A"}</TableCell>
                  <TableCell>
                    {(() => {
                      // Status đã được map từ AccountStatus trong loadLearners
                      const statusValue = normalizeStatusValue(learner.Status);
                      const isActive = statusValue === "active";
                      return (
                        <Chip
                          label={isActive ? "Hoạt động" : "Bị khóa"}
                          size="small"
                          sx={{
                            backgroundColor: isActive ? "#10b981" : "#ef4444",
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
                        setSelectedRow(learner);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredLearners.length > 0 && (
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
                  {Math.min(page * pageSize, filteredLearners.length)} trong
                  tổng số {filteredLearners.length} học viên
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
                  await handleStatusToggle(
                    selectedRow,
                    accountService,
                    loadLearners,
                    "learner"
                  );
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
            openLearnerModal(selectedRow);
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
              <Typography variant="h6">Lớp học đang tham gia</Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                {selectedLearner?.FullName} - Tổng: {learnerClasses.length} lớp
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {loadingClasses ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : learnerClasses.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Class sx={{ fontSize: 64, color: "#94a3b8", mb: 2 }} />
              <Typography variant="body1" sx={{ color: "#64748b" }}>
                Học viên này chưa tham gia lớp học nào
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
                  {learnerClasses.map((classItem) => (
                    <TableRow key={classItem.ClassID}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {classItem.Name}
                      </TableCell>
                      <TableCell>{classItem.Instructor}</TableCell>
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
                        {classItem.ExpectedSessions || 0} buổi
                      </TableCell>
                      <TableCell>{classItem.StartDate}</TableCell>
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

      {/* Learner Form Modal */}
      <UserFormModal
        open={showLearnerForm}
        onClose={closeLearnerModal}
        onSubmit={handleSubmitLearner}
        title="Chỉnh sửa học viên"
        formData={formData}
        setFormData={setFormData}
        errors={newErrors}
        setErrors={setNewErrors}
        saving={saving}
        isEditing={true}
        showInstructorFields={false}
        showLearnerStatus={true}
      />
    </Box>
  );
};

export default LearnersPage;
