import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  AccessTime,
  School,
  Percent,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import {
  getLearnerAttendanceApi,
  getAttendanceStatsApi,
} from "../../apiServices/attendanceService";
import { getLearnerIdFromAccount } from "../../utils/learnerUtils";
import AppHeader from "../../components/Header/AppHeader";

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const AttendancePage = () => {
  const { user, isLearner } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const accId = user.AccID || user.AccID || user.id || user.AccountID;
      console.log("User object:", user);

      if (!accId) {
        const errorMsg =
          "Không tìm thấy Account ID. Vui lòng đăng xuất và đăng nhập lại.";
        console.error("AccID not found in user object:", user);
        throw new Error(errorMsg);
      }

      console.log("Using AccID:", accId);
      const learnerId = await getLearnerIdFromAccount(accId);

      if (!learnerId) {
        throw new Error(
          "Không tìm thấy Learner ID. Hãy đảm bảo bạn đã có profile learner."
        );
      }

      console.log("LearnerID found:", learnerId);

      const [attendanceData, statsData] = await Promise.all([
        getLearnerAttendanceApi(learnerId),
        getAttendanceStatsApi(learnerId),
      ]);

      setAttendance(attendanceData.attendance || []);
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError(err.message || "Không thể tải thông tin điểm danh.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && isLearner) {
      fetchAttendance();
    } else {
      setError("Chỉ học viên mới có thể xem điểm danh");
      setLoading(false);
    }
  }, [user, isLearner, fetchAttendance]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f8f9fe",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fe" }}>
        <AppHeader />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </Box>
    );
  }

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

  const today = new Date();
  const upcomingAttendance = attendance.filter(
    (item) => new Date(item.Date) >= today
  );
  const pastAttendance = attendance.filter(
    (item) => new Date(item.Date) < today
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fe" }}>
      <AppHeader />
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, mb: 2, textAlign: "center" }}
          >
            Điểm danh
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "center", opacity: 0.9 }}
          >
            Theo dõi tình hình tham gia học tập
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Stats */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Percent color="primary" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.attendanceRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tỷ lệ điểm danh
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <CheckCircle color="success" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalPresent}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Có mặt
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Cancel color="error" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalAbsent}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vắng mặt
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Sắp tới" />
            <Tab label="Đã qua" />
          </Tabs>
        </Paper>

        {/* Attendance Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ngày</TableCell>
                <TableCell>Môn học</TableCell>
                <TableCell>Lớp</TableCell>
                <TableCell>Thời gian</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
                <TableCell>Ghi chú</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(tabValue === 0 ? upcomingAttendance : pastAttendance).map(
                (item) => (
                  <TableRow key={item.AttendanceID}>
                    <TableCell>
                      {new Date(item.Date).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>{item.CourseTitle}</TableCell>
                    <TableCell>{item.ClassName}</TableCell>
                    <TableCell>{item.Time}</TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={getStatusIcon(item.Status)}
                        label={item.StatusText}
                        color={getStatusColor(item.Status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{item.Notes || "-"}</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {attendance.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Chưa có thông tin điểm danh.
          </Alert>
        )}
      </Container>
    </Box>
  );
};

export default AttendancePage;
