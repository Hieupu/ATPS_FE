import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Search, People, EditCalendar, Visibility } from "@mui/icons-material";
import ClassCardItem from "./ClassCardItem";

// --- HÀM HELPER SẮP XẾP (Đưa ra ngoài component để tái sử dụng) ---
const sortClassesForInstructor = (classList) => {
  const statusPriority = {
    ONGOING: 1, // Quan trọng nhất: Đang dạy
    ACTIVE: 2, // Cần chuẩn bị: Đã mở/Đang tuyển
    APPROVED: 3, // Sắp tới: Đã phân công
    CLOSE: 4, // Lịch sử
    CANCEL: 5, // Đã hủy
  };

  return [...classList].sort((a, b) => {
    // 1. So sánh theo Trạng thái (Priority)
    const priorityA = statusPriority[a.classStatus] || 99;
    const priorityB = statusPriority[b.classStatus] || 99;
    if (priorityA !== priorityB) return priorityA - priorityB;

    // 2. So sánh phụ
    // Nếu là lớp tương lai/đang học -> Lớp nào gần lịch học nhất lên đầu
    if (["ONGOING", "ACTIVE", "APPROVED"].includes(a.classStatus)) {
      const dateA = new Date(a.nextSessionDate || a.startDate || 0).getTime();
      const dateB = new Date(b.nextSessionDate || b.startDate || 0).getTime();
      // Tránh lỗi NaN nếu date null, đẩy date null xuống cuối
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA - dateB;
    }

    // Nếu là lớp đã đóng -> Mới kết thúc lên đầu
    const endA = new Date(a.endDate || 0).getTime();
    const endB = new Date(b.endDate || 0).getTime();
    return endB - endA;
  });
};

export default function ClassesLayout({
  classes = [],
  loading = false,
  tabValue,
  setTabValue,
  searchQuery,
  setSearchQuery,
}) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  // --- MENU ACTIONS ---
  const handleMenuOpen = (event, cls) => {
    setAnchorEl(event.currentTarget);
    setSelectedClass(cls);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClass(null);
  };

  const handleViewDetail = () => {
    if (selectedClass) {
      navigate(
        `/instructor/classes/${selectedClass.classId || selectedClass.id}`
      );
    }
    handleMenuClose();
  };

  const handleViewStudents = () => {
    if (selectedClass) {
      navigate(
        `/instructor/classes/${selectedClass.classId || selectedClass.id}?tab=1`
      );
    }
    handleMenuClose();
  };

  const handleViewSchedule = () => {
    if (selectedClass) {
      navigate(
        `/instructor/classes/${selectedClass.classId || selectedClass.id}?tab=2`
      );
    }
    handleMenuClose();
  };

  // --- LOGIC LỌC & SẮP XẾP ---

  // 1. Định nghĩa nhóm trạng thái cho Tab
  const isOngoing = (status) => status === "ONGOING";
  const isUpcoming = (status) =>
    ["APPROVED", "ACTIVE", "PENDING", "WAITING"].includes(status);
  const isCompleted = (status) => ["CLOSE", "CANCEL"].includes(status);

  // 2. Tính toán số lượng (Counts)
  const allCount = classes.length;
  const ongoingCount = classes.filter((c) => isOngoing(c.classStatus)).length;
  const upcomingCount = classes.filter((c) => isUpcoming(c.classStatus)).length;
  const completedCount = classes.filter((c) =>
    isCompleted(c.classStatus)
  ).length;

  // 3. Xử lý Filter chính
  // Dùng useMemo để tối ưu hiệu năng khi render lại
  const processedClasses = useMemo(() => {
    let filtered = [...classes];

    // A. Lọc theo Tab
    if (tabValue === 1) {
      filtered = filtered.filter((c) => isOngoing(c.classStatus));
    } else if (tabValue === 2) {
      filtered = filtered.filter((c) => isUpcoming(c.classStatus));
    } else if (tabValue === 3) {
      filtered = filtered.filter((c) => isCompleted(c.classStatus));
    }

    // B. Lọc theo Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          (c.className || "").toLowerCase().includes(q) ||
          (c.courseTitle || "").toLowerCase().includes(q) || // Lưu ý: ClassCardItem dùng courseTitle
          (c.classCode || "").toLowerCase().includes(q)
      );
    }

    // C. Sắp xếp kết quả cuối cùng
    return sortClassesForInstructor(filtered);
  }, [classes, tabValue, searchQuery]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Lớp học của tôi
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quản lý lịch giảng dạy, tài liệu và học viên các lớp được phân công.
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm theo tên lớp, môn học hoặc mã lớp..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 500,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "#fff",
              fieldset: { borderColor: "#e2e8f0" },
              "&:hover fieldset": { borderColor: "#cbd5e1" },
              "&.Mui-focused fieldset": { borderColor: "#6366f1" },
            },
          }}
        />
      </Box>

      {/* Tabs Navigation */}
      <Tabs
        value={tabValue}
        onChange={(_, v) => setTabValue(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 4,
          borderBottom: "1px solid #e2e8f0",
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: "15px",
            minWidth: "auto",
            px: 3,
            color: "#64748b",
            "&.Mui-selected": { color: "#6366f1" },
          },
          "& .MuiTabs-indicator": {
            height: 3,
            borderRadius: "3px 3px 0 0",
            backgroundColor: "#6366f1",
          },
        }}
      >
        <Tab label={`Tất cả (${allCount})`} />
        <Tab label={`Đang giảng dạy (${ongoingCount})`} />
        <Tab label={`Sắp khai giảng (${upcomingCount})`} />
        <Tab label={`Lịch sử / Đã hủy (${completedCount})`} />
      </Tabs>

      {/* Content Area */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress sx={{ color: "#6366f1" }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {processedClasses.length === 0 ? (
            <Grid item xs={12}>
              <Box
                sx={{
                  textAlign: "center",
                  py: 10,
                  bgcolor: "#f8fafc",
                  borderRadius: 4,
                  border: "1px dashed #cbd5e1",
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Không tìm thấy lớp học nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery
                    ? `Không có kết quả nào khớp với từ khóa "${searchQuery}"`
                    : "Hiện tại bạn chưa có lớp học nào ở trạng thái này."}
                </Typography>
              </Box>
            </Grid>
          ) : (
            processedClasses.map((cls) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={cls.classId || cls.id}
              >
                <ClassCardItem cls={cls} onMenuOpen={handleMenuOpen} />
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Menu Actions Popup */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            mt: 1,
            minWidth: 180,
            border: "1px solid #f1f5f9",
          },
        }}
      >
        <MenuItem
          onClick={handleViewDetail}
          sx={{ py: 1.5, fontSize: "14px", fontWeight: 500 }}
        >
          <Visibility sx={{ mr: 1.5, fontSize: 18, color: "#64748b" }} /> Xem
          chi tiết
        </MenuItem>
        <MenuItem
          onClick={handleViewStudents}
          sx={{ py: 1.5, fontSize: "14px", fontWeight: 500 }}
        >
          <People sx={{ mr: 1.5, fontSize: 18, color: "#64748b" }} /> Danh sách
          học viên
        </MenuItem>
        <MenuItem
          onClick={handleViewSchedule}
          sx={{ py: 1.5, fontSize: "14px", fontWeight: 500 }}
        >
          <EditCalendar sx={{ mr: 1.5, fontSize: 18, color: "#64748b" }} /> Thời
          Khóa Biểu
        </MenuItem>
      </Menu>
    </Box>
  );
}
