import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  Search,
  MoreVert,
  People,
  Assignment,
  Assessment,
  EditCalendar,
  CloudUpload,
  NoteAlt,
  Poll,
  Visibility,
} from "@mui/icons-material";
import ClassCardItem from "./ClassCardItem";

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

  const handleMenuOpen = (event, cls) => {
    setAnchorEl(event.currentTarget);
    setSelectedClass(cls);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClass(null);
  };

  // Lọc theo tab + tìm kiếm
  const getFilteredClasses = () => {
    let filtered = [...classes];

    // Tab filter
    if (tabValue === 1)
      filtered = filtered.filter((c) => c.status === "ongoing");
    if (tabValue === 2)
      filtered = filtered.filter((c) => c.status === "upcoming");
    if (tabValue === 3)
      filtered = filtered.filter((c) => c.status === "completed");

    // Tìm kiếm
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          (c.className || "").toLowerCase().includes(q) ||
          (c.courseName || "").toLowerCase().includes(q)
      );
    }

    return filtered;
  };

  const handleViewDetail = () => {
    if (selectedClass) {
      navigate(
        `/instructor/classes/${selectedClass.classId || selectedClass.id}`
      );
    }
    handleMenuClose();
  };

  // Đếm số lượng cho từng tab
  const allCount = classes.length;
  const ongoingCount = classes.filter((c) => c.status === "ongoing").length;
  const upcomingCount = classes.filter((c) => c.status === "upcoming").length;
  const completedCount = classes.filter((c) => c.status === "completed").length;

  const filteredClasses = getFilteredClasses();

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Lớp học của tôi
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quản lý tất cả lớp học bạn đang giảng dạy
        </Typography>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm tên lớp hoặc khóa học..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 500,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "#fff",
            },
          }}
        />
      </Box>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={(_, v) => setTabValue(v)}
        sx={{
          mb: 4,
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            minWidth: "auto",
            px: 3,
          },
          "& .MuiTabs-indicator": {
            height: 3,
            borderRadius: "3px 3px 0 0",
            backgroundColor: "#6366f1",
          },
        }}
      >
        <Tab label={`Tất cả (${allCount})`} />
        <Tab label={`Đang diễn ra (${ongoingCount})`} />
        <Tab label={`Sắp khai giảng (${upcomingCount})`} />
        <Tab label={`Đã kết thúc (${completedCount})`} />
      </Tabs>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Danh sách lớp – Grid 4 cột */}
      {!loading && (
        <Grid container spacing={3}>
          {filteredClasses.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ textAlign: "center", py: 10 }}>
                <Typography color="text.secondary">
                  {searchQuery || tabValue !== 0
                    ? "Không tìm thấy lớp học nào phù hợp"
                    : "Bạn chưa có lớp học nào"}
                </Typography>
              </Box>
            </Grid>
          ) : (
            filteredClasses.map((cls) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={cls.id}>
                <ClassCardItem cls={cls} onMenuOpen={handleMenuOpen} />
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Menu hành động */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleViewDetail}>
          <Visibility sx={{ mr: 1.5, fontSize: 18 }} /> Xem chi tiết
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <People sx={{ mr: 1.5, fontSize: 18 }} /> Danh sách học viên
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <People sx={{ mr: 1.5, fontSize: 18 }} /> Điểm Danh
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditCalendar sx={{ mr: 1.5, fontSize: 18 }} /> Thời Khóa Biểu
        </MenuItem>
      </Menu>
    </Box>
  );
}
