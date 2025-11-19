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
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Badge,
  TextField,
  MenuItem,
  Divider,
  Collapse,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  AccessTime,
  School,
  Percent,
  TrendingUp,
  CalendarMonth,
  ExpandMore,
  ExpandLess,
  VideoCall,
  Person,
  Class as ClassIcon,
  DateRange,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import {
  getLearnerAttendanceApi,
  getAttendanceStatsApi,
  getAttendanceByClassApi,
  getAttendanceCalendarApi,
} from "../../apiServices/attendanceService";
import { getLearnerIdFromAccount } from "../../utils/learnerUtils";
import AppHeader from "../../components/Header/AppHeader";

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const AttendanceCalendar = ({ learnerId }) => {
  const [calendar, setCalendar] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const loadCalendar = useCallback(async () => {
    try {
      setLoading(true);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const data = await getAttendanceCalendarApi(learnerId, month, year);
      setCalendar(data.calendar || []);
    } catch (error) {
      console.error("Error loading calendar:", error);
    } finally {
      setLoading(false);
    }
  }, [learnerId, currentDate]);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getAttendanceForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendar.filter(item => {
      const sessionDate = new Date(item.SessionDate).toISOString().split('T')[0];
      return sessionDate === dateStr;
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "present": return "#4caf50";
      case "absent": return "#f44336";
      case "late": return "#ff9800";
      default: return "#9e9e9e";
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <IconButton onClick={handlePrevMonth}>
            <KeyboardArrowLeft />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {currentDate.toLocaleString("vi-VN", { month: "long", year: "numeric" })}
          </Typography>
          <IconButton onClick={handleNextMonth}>
            <KeyboardArrowRight />
          </IconButton>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
              <Box
                key={day}
                sx={{
                  textAlign: "center",
                  fontWeight: 600,
                  color: "text.secondary",
                  py: 1,
                }}
              >
                {day}
              </Box>
            ))}

            {emptyDays.map((_, index) => (
              <Box key={`empty-${index}`} />
            ))}

            {days.map((day) => {
              const attendances = getAttendanceForDate(day);
              const hasAttendance = attendances.length > 0;

              return (
                <Tooltip
                  key={day}
                  title={
                    hasAttendance
                      ? attendances.map((a) => `${a.CourseTitle} - ${a.StatusText}`).join(", ")
                      : ""
                  }
                >
                  <Box
                    sx={{
                      aspectRatio: "1",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                      cursor: hasAttendance ? "pointer" : "default",
                      bgcolor: hasAttendance ? "action.hover" : "transparent",
                      position: "relative",
                      "&:hover": hasAttendance ? { bgcolor: "action.selected" } : {},
                    }}
                  >
                    <Typography variant="body2">{day}</Typography>
                    {hasAttendance && (
                      <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
                        {attendances.map((a, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              bgcolor: getStatusColor(a.Status),
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const AttendanceByClass = ({ learnerId }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedClass, setExpandedClass] = useState(null);

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

    loadClasses();
  }, [learnerId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {classes.map((cls) => (
        <Grid item xs={12} md={6} key={cls.ClassID}>
          <Card>
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

      {classes.length === 0 && (
        <Grid item xs={12}>
          <Alert severity="info">Chưa có lớp học nào.</Alert>
        </Grid>
      )}
    </Grid>
  );
};

const AttendancePage = () => {
  const { user, isLearner } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [filterStatus, setFilterStatus] = useState("all");
  const [learnerId, setLearnerId] = useState(null);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const accId = user.AccID || user.id || user.AccountID;

      if (!accId) {
        throw new Error("Không tìm thấy Account ID. Vui lòng đăng xuất và đăng nhập lại.");
      }

      const learnerIdValue = await getLearnerIdFromAccount(accId);

      if (!learnerIdValue) {
        throw new Error("Không tìm thấy Learner ID. Hãy đảm bảo bạn đã có profile learner.");
      }

      setLearnerId(learnerIdValue);

      const [attendanceData, statsData] = await Promise.all([
        getLearnerAttendanceApi(learnerIdValue),
        getAttendanceStatsApi(learnerIdValue),
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
        <CircularProgress size={60} />
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
  today.setHours(0, 0, 0, 0);

  const upcomingAttendance = attendance.filter((item) => {
    const sessionDate = new Date(item.SessionDate);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate >= today;
  });

  const pastAttendance = attendance.filter((item) => {
    const sessionDate = new Date(item.SessionDate);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate < today;
  });

  const filteredAttendance = (tabValue === 0 ? upcomingAttendance : pastAttendance).filter(
    (item) => filterStatus === "all" || item.Status.toLowerCase() === filterStatus
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
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, textAlign: "center" }}>
            📊 Điểm danh
          </Typography>
          <Typography variant="body1" sx={{ textAlign: "center", opacity: 0.9 }}>
            Theo dõi chi tiết tình hình tham gia học tập của bạn
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Percent sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.attendanceRate}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Tỷ lệ điểm danh
                  </Typography>
                  <Chip
                    label={stats.grade}
                    sx={{
                      mt: 1,
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontWeight: 700,
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
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

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <AccessTime color="warning" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalLate}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đi muộn
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
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

        {/* Main Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab
              icon={<DateRange />}
              iconPosition="start"
              label={`Sắp tới (${upcomingAttendance.length})`}
            />
            <Tab
              icon={<School />}
              iconPosition="start"
              label={`Đã qua (${pastAttendance.length})`}
            />
            <Tab icon={<ClassIcon />} iconPosition="start" label="Theo lớp" />
            <Tab icon={<CalendarMonth />} iconPosition="start" label="Lịch" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2 }}>
            <TextField
              select
              size="small"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="all">Tất cả trạng thái</MenuItem>
              <MenuItem value="present">Có mặt</MenuItem>
              <MenuItem value="late">Đi muộn</MenuItem>
              <MenuItem value="absent">Vắng mặt</MenuItem>
            </TextField>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ngày</TableCell>
                  <TableCell>Buổi học</TableCell>
                  <TableCell>Môn học / Lớp</TableCell>
                  <TableCell>Giảng viên</TableCell>
                  <TableCell>Thời gian</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                  <TableCell align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAttendance.map((item) => (
                  <TableRow key={item.AttendanceID} hover>
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
                        <Typography variant="caption" color="text.secondary">
                          {item.SessionDescription}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {item.CourseImage && (
                          <Avatar src={item.CourseImage} sx={{ width: 32, height: 32 }} />
                        )}
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.CourseTitle}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.ClassName}
                          </Typography>
                        </Box>
                      </Box>
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
                    <TableCell align="center">
                      {item.ZoomID && (
                        <Tooltip title="Tham gia Zoom">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() =>
                              window.open(
                                `https://zoom.us/j/${item.ZoomID}?pwd=${item.Zoompass}`,
                                "_blank"
                              )
                            }
                          >
                            <VideoCall />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredAttendance.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Không có buổi học nào phù hợp với bộ lọc.
            </Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2 }}>
            <TextField
              select
              size="small"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="all">Tất cả trạng thái</MenuItem>
              <MenuItem value="present">Có mặt</MenuItem>
              <MenuItem value="late">Đi muộn</MenuItem>
              <MenuItem value="absent">Vắng mặt</MenuItem>
            </TextField>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ngày</TableCell>
                  <TableCell>Buổi học</TableCell>
                  <TableCell>Môn học / Lớp</TableCell>
                  <TableCell>Giảng viên</TableCell>
                  <TableCell>Thời gian</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                  <TableCell align="center">Sĩ số</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAttendance.map((item) => (
                  <TableRow key={item.AttendanceID} hover>
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
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {item.CourseImage && (
                          <Avatar src={item.CourseImage} sx={{ width: 32, height: 32 }} />
                        )}
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.CourseTitle}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.ClassName}
                          </Typography>
                        </Box>
                      </Box>
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
                    <TableCell align="center">
                      <Chip
                        label={`${item.TotalPresent}/${item.TotalLearners}`}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredAttendance.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Không có buổi học nào phù hợp với bộ lọc.
            </Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {learnerId && <AttendanceByClass learnerId={learnerId} />}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {learnerId && <AttendanceCalendar learnerId={learnerId} />}
        </TabPanel>
      </Container>
    </Box>
  );
};

export default AttendancePage;