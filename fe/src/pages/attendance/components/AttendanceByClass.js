import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  LinearProgress,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
} from "@mui/material";
import { Close, CheckCircle, Cancel, AccessTime, Person } from "@mui/icons-material";
import { getAttendanceByClassApi } from "../../../apiServices/attendanceService";

const AttendanceByClass = ({ learnerId, attendance }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  console.log("attendance", attendance);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true);
        const data = await getAttendanceByClassApi(learnerId);
        setClasses(data.classes || []);
      } catch (error) {
        console.error("Error loading classes:", error);
      } finally {
        setLoading(false);
      }
    };

    if (learnerId) {
      loadClasses();
    }
  }, [learnerId]);

  const handleClassClick = (cls) => {
    setSelectedClass(cls);
    setModalOpen(true);
    setFilterStatus("all");
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedClass(null);
  };

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const getClassSessions = () => {
    if (!selectedClass || !attendance) return [];
    
    return attendance.filter(item => {
      const matchesClass = item.ClassID === selectedClass.ClassID;
      const matchesStatus = filterStatus === "all" || item.Status?.toLowerCase() === filterStatus;
      return matchesClass && matchesStatus;
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "present":
        return "success";
      case "absent":
        return "error";
      case "late":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "present":
        return <CheckCircle />;
      case "absent":
        return <Cancel />;
      case "late":
        return <AccessTime />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!classes || classes.length === 0) {
    return <Alert severity="info">Chưa có lớp học nào.</Alert>;
  }

  const classSessions = getClassSessions();

  return (
    <>
      <Grid container spacing={3}>
        {classes.map((cls) => (
          <Grid item xs={12} md={6} key={cls.ClassID}>
            <Card 
              sx={{ 
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                }
              }}
              onClick={() => handleClassClick(cls)}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  {cls.CourseImage && (
                    <Avatar
                      src={cls.CourseImage}
                      sx={{ width: 56, height: 56, mr: 2 }}
                    />
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {cls.ClassName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {cls.CourseTitle}
                    </Typography>
                  </Box>
                  <Chip
                    label={cls.grade}
                    color={
                      cls.grade === "A"
                        ? "success"
                        : cls.grade === "B"
                        ? "primary"
                        : cls.grade === "C"
                        ? "warning"
                        : "error"
                    }
                    sx={{ fontWeight: 700, fontSize: "1rem" }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tỷ lệ tham gia
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {cls.AttendanceRate}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={cls.AttendanceRate}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "action.hover",
                      "& .MuiLinearProgress-bar": {
                        bgcolor:
                          cls.AttendanceRate >= 80
                            ? "success.main"
                            : cls.AttendanceRate >= 60
                            ? "warning.main"
                            : "error.main",
                      },
                    }}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h6" color="success.main">
                        {cls.PresentCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Có mặt
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h6" color="warning.main">
                        {cls.LateCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Đi muộn
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h6" color="error.main">
                        {cls.AbsentCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Vắng mặt
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="text.secondary">
                    Tổng số buổi: {cls.TotalSessions}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {cls.FirstSession && new Date(cls.FirstSession).toLocaleDateString("vi-VN")} -{" "}
                    {cls.LastSession && new Date(cls.LastSession).toLocaleDateString("vi-VN")}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modal chi tiết điểm danh */}
      <Dialog 
        open={modalOpen} 
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {selectedClass?.CourseImage && (
                <Avatar src={selectedClass.CourseImage} sx={{ width: 48, height: 48 }} />
              )}
              <Box>
                <Typography variant="h6">{selectedClass?.ClassName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedClass?.CourseTitle}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleCloseModal}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {/* Bộ lọc trạng thái */}
          <Box sx={{ mb: 2 }}>
            <TextField
              select
              size="small"
              value={filterStatus}
              onChange={handleFilterChange}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="all">Tất cả trạng thái</MenuItem>
              <MenuItem value="present">Có mặt</MenuItem>
              <MenuItem value="late">Đi muộn</MenuItem>
              <MenuItem value="absent">Vắng mặt</MenuItem>
            </TextField>
          </Box>

          {/* Bảng điểm danh */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ngày</TableCell>
                  <TableCell>Buổi học</TableCell>
                  <TableCell>Giảng viên</TableCell>
                  <TableCell>Thời gian</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classSessions.map((item) => (
                  <TableRow key={item.SessionID} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {new Date(item.SessionDate).toLocaleDateString("vi-VN")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.DayOfWeek}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{item.SessionTitle}</Typography>
                      {item.SessionDescription && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {item.SessionDescription}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar src={item.InstructorAvatar} sx={{ width: 32, height: 32 }}>
                          <Person />
                        </Avatar>
                        <Typography variant="body2">{item.InstructorName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{item.Time}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={getStatusIcon(item.Status)}
                        label={item.StatusText}
                        color={getStatusColor(item.Status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {classSessions.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Không có buổi học nào phù hợp với bộ lọc.
            </Alert>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AttendanceByClass;