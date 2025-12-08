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
  Add,
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
  Visibility,
  MoreVert,
} from "@mui/icons-material";
import "./style.css";
import learnerService from "../../../apiServices/learnerService";
import accountService from "../../../apiServices/accountService";
import uploadService from "../../../apiServices/uploadService";

// Helper function - dùng chung cho cả LearnersPage và LearnerForm
const normalizeStatusValue = (status) => {
  const lower = (status || "active").toLowerCase();
  if (lower === "banned" || lower === "inactive") return "banned";
  return lower;
};

const LearnersPage = () => {
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

  useEffect(() => {
    loadLearners();
  }, []);

  const loadLearners = async () => {
    try {
      setLoading(true);
      // Gọi API để lấy danh sách học viên từ database
      const learnersList = await learnerService.getAllLearners();
      console.log("Đã tải danh sách học viên từ DB:", learnersList.length);
      console.log("Sample learner data:", learnersList[0]);
      console.log("Sample AccountStatus:", learnersList[0]?.AccountStatus);

      // Map Status từ account - backend trả về AccountStatus từ JOIN với account table
      const mappedLearners = learnersList.map((learner) => {
        const mappedStatus =
          learner.AccountStatus || learner.Status || "active";
        return {
          ...learner,
          // AccountStatus là trường từ account table qua JOIN
          Status: mappedStatus,
          // Đảm bảo Email và Phone có sẵn
          Email: learner.Email || learner.account?.Email || "",
          Phone: learner.Phone || learner.account?.Phone || "",
        };
      });

      console.log("Mapped learners sample:", mappedLearners[0]);
      console.log("Mapped Status:", mappedLearners[0]?.Status);
      setLearners(mappedLearners);
    } catch (error) {
      console.error("Lỗi khi tải danh sách học viên:", error);
      console.error("Error response:", error.response);
      setLearners([]);
      alert("Không thể tải danh sách học viên từ database!");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLearner = () => {
    setSelectedLearner(null);
    setShowLearnerForm(true);
  };

  const handleEditLearner = (learner) => {
    setSelectedLearner(learner);
    setShowLearnerForm(true);
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

      console.log("[LearnersPage] getLearnerWithClasses response:", data);

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

      console.log("[LearnersPage] Parsed enrollments:", enrollments);

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
          Progress: enrollment.Progress || 0,
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
      console.error("Lỗi khi tải danh sách lớp học:", error);
      console.error("Error details:", error.response?.data || error.message);
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

  const handleSubmitLearner = async (formData) => {
    try {
      if (selectedLearner) {
        // CẬP NHẬT học viên và account
        // Backend whitelist cho learner update: FullName, DateOfBirth, ProfilePicture, Job, Address
        // KHÔNG được gửi: Email, Phone, Status, Level, Bio, Interests (không có trong bảng learner)
        const learnerData = {
          FullName: formData.FullName,
          DateOfBirth: formData.DateOfBirth || null,
          ProfilePicture: formData.ProfilePicture || null,
          Job: formData.Job || null,
          Address: formData.Address || null,
        };

        // Account data (Email, Phone, Status từ account table) - gửi riêng qua accountService
        // Chỉ gửi Email và Phone nếu chúng thay đổi (tránh lỗi unique constraint khi giữ nguyên)
        const accountData = {};

        // Chỉ gửi Email nếu thay đổi
        if (formData.Email !== selectedLearner.Email) {
          accountData.Email = formData.Email;
        }

        // Chỉ gửi Phone nếu thay đổi
        const currentPhone = selectedLearner.Phone || null;
        const newPhone = formData.Phone || null;
        if (newPhone !== currentPhone) {
          accountData.Phone = newPhone;
        }

        // Luôn gửi Status nếu có thay đổi hoặc cần update
        const currentStatus = selectedLearner.Status || "active";
        const newStatus = formData.Status || "active";
        // Normalize status để so sánh (active vs ACTIVE)
        const normalizedCurrentStatus = currentStatus.toLowerCase();
        const sanitizedCurrentStatus =
          normalizedCurrentStatus === "inactive" ||
          normalizedCurrentStatus === "banned"
            ? "banned"
            : normalizedCurrentStatus;
        const normalizedNewStatus = newStatus.toLowerCase();
        if (normalizedNewStatus !== sanitizedCurrentStatus) {
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

        // Update learner (chỉ các trường hợp lệ)
        await learnerService.updateLearner(
          selectedLearner.LearnerID,
          learnerData
        );

        // Update account (nếu có AccID và có data cần update)
        // Fallback: nếu endpoint không tồn tại, thử gửi account data cùng với learner data
        let accountUpdated = false;
        if (selectedLearner.AccID && Object.keys(accountData).length > 0) {
          console.log("Bắt đầu cập nhật account với data:", accountData);
          try {
            await accountService.updateAccount(
              selectedLearner.AccID,
              accountData
            );
            accountUpdated = true;
            console.log(
              "Đã cập nhật account thành công qua /accounts endpoint"
            );
          } catch (accountError) {
            console.error("Lỗi khi cập nhật account:", accountError);
            // Nếu endpoint không tồn tại, thử gửi account data cùng với learner data
            if (
              accountError.isEndpointNotFound ||
              accountError.response?.status === 404
            ) {
              console.warn(
                "Endpoint /accounts không tồn tại, thử gửi account data cùng với learner data"
              );
              // Thử gửi account data cùng với learner data
              // Backend whitelist sẽ lọc Email, Phone ra, nhưng có thể backend có logic đặc biệt
              // để update account khi nhận Email, Phone, Status trong request
              try {
                await learnerService.updateLearner(selectedLearner.LearnerID, {
                  ...learnerData,
                  ...accountData, // Gửi Email, Phone, Status cùng với learner data
                });
                accountUpdated = true;
                console.log(
                  "Đã cập nhật account thông qua learner endpoint (fallback)"
                );
              } catch (fallbackError) {
                console.error(
                  "Không thể cập nhật account: backend không hỗ trợ update account",
                  fallbackError
                );
                // Thông báo cho user biết account không được update
                alert(
                  "Cập nhật học viên thành công, nhưng không thể cập nhật thông tin tài khoản (Email, Phone, Status).\n\nVui lòng liên hệ backend để bổ sung endpoint PUT /api/accounts/:accId"
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
                `Cập nhật học viên thành công, nhưng có lỗi khi cập nhật thông tin tài khoản:\n${errorMessage}\n\nVui lòng kiểm tra lại.`
              );
            }
          }
        } else if (
          selectedLearner.AccID &&
          Object.keys(accountData).length === 0
        ) {
          console.log(
            "Không có thay đổi nào trong account data, bỏ qua update account"
          );
        }

        if (accountUpdated) {
          alert("Cập nhật học viên và tài khoản thành công!");
        } else {
          // Learner đã được update, chỉ account chưa
          // Alert đã được hiển thị ở trên
        }
      } else {
        // TẠO MỚI học viên và account
        if (!formData.Password || !formData.Password.trim()) {
          alert("Vui lòng nhập mật khẩu để tạo tài khoản!");
          return;
        }

        // Tạo learner với account data (backend sẽ tự tạo account)
        const learnerData = {
          FullName: formData.FullName,
          Job: formData.Job || null,
          Address: formData.Address || null,
          DateOfBirth: formData.DateOfBirth || null,
          ProfilePicture: formData.ProfilePicture || null,
          // Account fields để backend tạo account
          Email: formData.Email,
          Phone: formData.Phone || null,
          Password: formData.Password,
          Status: formData.Status || "active",
        };

        await learnerService.createLearner(learnerData);
        alert("Tạo học viên mới thành công!");
      }
      // Reload danh sách sau khi lưu
      await loadLearners();
      setShowLearnerForm(false);
    } catch (error) {
      console.error("Lỗi khi lưu học viên:", error);
      const errorMessage =
        error?.message ||
        error.response?.data?.message ||
        "Không thể lưu học viên!";
      alert(errorMessage);
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
            <InputLabel>Status</InputLabel>
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
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddLearner}
            sx={{
              backgroundColor: "#667eea",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#5568d3",
              },
            }}
          >
            Add First Learner
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
                  Name
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
                  Actions
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
        <MenuItem
          onClick={() => {
            handleEditLearner(selectedRow);
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
                    <TableCell sx={{ fontWeight: 700 }}>Tiến độ</TableCell>
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
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 80,
                              height: 8,
                              backgroundColor: "#e2e8f0",
                              borderRadius: 1,
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              sx={{
                                width: `${classItem.Progress || 0}%`,
                                height: "100%",
                                backgroundColor: "#667eea",
                              }}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{ color: "#64748b" }}
                          >
                            {classItem.Progress || 0}%
                          </Typography>
                        </Box>
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
      {showLearnerForm && (
        <LearnerForm
          learnerData={selectedLearner}
          onSubmit={handleSubmitLearner}
          onCancel={() => setShowLearnerForm(false)}
        />
      )}
    </Box>
  );
};

// Learner Form Component
const LearnerForm = ({ learnerData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    FullName: "",
    Email: "",
    Password: "",
    Phone: "",
    Job: "",
    Address: "",
    DateOfBirth: "",
    ProfilePicture: "",
    Status: "active",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (learnerData) {
      // Status đã được map từ AccountStatus trong loadLearners
      const normalizedStatus = normalizeStatusValue(learnerData.Status);
      console.log("[LearnerForm] learnerData.Status:", learnerData.Status);
      console.log("[LearnerForm] normalizedStatus:", normalizedStatus);
      setFormData({
        FullName: learnerData.FullName || "",
        Email: learnerData.Email || "",
        Password: "", // Don't populate password for edit
        Phone: learnerData.Phone || "",
        Job: learnerData.Job || "",
        Address: learnerData.Address || "",
        DateOfBirth: learnerData.DateOfBirth || "",
        ProfilePicture: learnerData.ProfilePicture || "",
        Status: normalizedStatus === "banned" ? "banned" : "active",
      });
    } else {
      // Reset form when creating new
      setFormData({
        FullName: "",
        Email: "",
        Password: "",
        Phone: "",
        Job: "",
        Address: "",
        DateOfBirth: "",
        ProfilePicture: "",
        Status: "active",
      });
    }
  }, [learnerData]);

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

    // Password is required only when creating new learner
    if (!learnerData && !formData.Password.trim()) {
      newErrors.Password = "Vui lòng nhập mật khẩu";
    } else if (formData.Password && formData.Password.length < 6) {
      newErrors.Password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.Phone.trim()) {
      newErrors.Phone = "Vui lòng nhập số điện thoại";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Only include password in submission if it was provided or if creating new
      const submitData = { ...formData };
      if (learnerData && !submitData.Password) {
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
          <h2>{learnerData ? " Chỉnh sửa học viên" : " Thêm học viên mới"}</h2>
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
                Mật khẩu {!learnerData ? "*" : ""}
              </label>
              <input
                type="password"
                id="Password"
                value={formData.Password}
                onChange={(e) =>
                  setFormData({ ...formData, Password: e.target.value })
                }
                className={errors.Password ? "error" : ""}
                placeholder={
                  learnerData
                    ? "Để trống nếu không đổi mật khẩu"
                    : "Nhập mật khẩu (tối thiểu 6 ký tự)"
                }
              />
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
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="Job">Nghề nghiệp</label>
              <input
                type="text"
                id="Job"
                value={formData.Job || ""}
                onChange={(e) =>
                  setFormData({ ...formData, Job: e.target.value })
                }
                placeholder="Ví dụ: Sinh viên, Developer"
              />
            </div>

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
          </div>

          <div className="form-row">
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
                  id="learnerAvatarFile"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const loadingMsg = document.createElement("div");
                      loadingMsg.textContent = "Đang tải ảnh lên...";
                      loadingMsg.style.cssText =
                        "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999;";
                      document.body.appendChild(loadingMsg);

                      try {
                        const result = await uploadService.uploadAvatar(file);
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
                  htmlFor="learnerAvatarFile"
                  size="small"
                  fullWidth
                >
                  Chọn ảnh đại diện
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
              <option value="banned">Bị khóa</option>
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
              {learnerData ? " Cập nhật" : " Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LearnersPage;
