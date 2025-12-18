import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Alert,
  Badge,
  IconButton,
  CircularProgress,
  LinearProgress,
  Button,
} from "@mui/material";
import {
  School,
  Group,
  Class,
  Assignment,
  TrendingUp,
  Warning,
  Notifications,
  CheckCircle,
  Schedule,
  BarChart as BarChartIcon,
  CalendarToday,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_API_URL}/instructors`;

const apiClient = axios.create({
  baseURL: BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function InstructorDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const instructorId = localStorage.getItem("instructorId") || 1;
        const response = await apiClient.get(`/${instructorId}/dashboard`);
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statusConfig = {
    APPROVED: {
      label: "Đã duyệt",
      bgcolor: "#2e7d32",
    },
    PENDING: {
      label: "Đang chờ",
      bgcolor: "#ed6c02",
    },
    REJECTED: {
      label: "Từ chối",
      bgcolor: "#d32f2f",
    },
  };

  const notificationTitleMap = {
    REQUEST_APPROVED: "Đổi lịch",
    enrollment: "Học viên đăng ký",
    certificate_status_change: "Yêu cầu cấp chứng chỉ",
  };

  const totalActiveCourses = useMemo(() => {
    if (!dashboardData) return 0;
    return dashboardData.courses.length;
  }, [dashboardData]);

  const activeClasses = useMemo(() => {
    if (!dashboardData) return 0;
    return dashboardData.classes.filter(
      (c) => c.status === "ACTIVE" || c.status === "ONGOING"
    ).length;
  }, [dashboardData]);

  const totalLearners = useMemo(() => {
    if (!dashboardData) return 0;
    return dashboardData.learners.length;
  }, [dashboardData]);

  const ungradedSubmissions = useMemo(() => {
    if (!dashboardData) return 0;
    return dashboardData.submissions.filter((s) => s.score === null).length;
  }, [dashboardData]);

  const averageScoreData = useMemo(() => {
    if (!dashboardData || !dashboardData.examResults) return [];

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const groupedByDate = dashboardData.examResults.reduce((acc, result) => {
      const dateStr = new Date(result.submittedAt).toLocaleDateString("vi-VN");
      const fullDate = new Date(result.submittedAt);

      if (fullDate >= sevenDaysAgo && fullDate <= today) {
        if (!acc[dateStr]) {
          acc[dateStr] = { sum: 0, count: 0, fullDate: fullDate };
        }
        acc[dateStr].sum += result.averageScore;
        acc[dateStr].count += 1;
      }
      return acc;
    }, {});

    return Object.keys(groupedByDate)
      .map((date) => ({
        date: date,
        score: Number(
          (groupedByDate[date].sum / groupedByDate[date].count).toFixed(2)
        ),
        fullDate: groupedByDate[date].fullDate,
      }))
      .sort((a, b) => a.fullDate - b.fullDate);
  }, [dashboardData]);

  const learnersByClass = useMemo(() => {
    if (!dashboardData) return [];
    const classMap = {};
    dashboardData.enrollments.forEach((e) => {
      if (!classMap[e.classId]) {
        classMap[e.classId] = 0;
      }
      classMap[e.classId]++;
    });

    return dashboardData.classes
      .filter((c) => classMap[c.classId])
      .map((c) => ({
        className: c.className,
        learners: classMap[c.classId] || 0,
      }));
  }, [dashboardData]);

  const upcomingSessions = useMemo(() => {
    if (!dashboardData) return [];
    return dashboardData.sessions
      .map((s) => {
        const cls = dashboardData.classes.find((c) => c.classId === s.classId);
        return {
          ...s,
          className: cls?.className || "",
          formattedDate: new Date(s.sessionDate).toLocaleDateString("vi-VN"),
        };
      })
      .slice(0, 5);
  }, [dashboardData]);

  const exams = dashboardData?.exams || [];

  const learnerWarnings = useMemo(() => {
    if (
      !dashboardData?.attendance ||
      !dashboardData?.classes ||
      !dashboardData?.learners ||
      !dashboardData?.examResults
    ) {
      return [];
    }

    const warnings = [];

    dashboardData.attendance.forEach((att) => {
      const cls = dashboardData.classes.find((c) => c.classId === att.classId);
      if (!cls) return;

      const learner = dashboardData.learners.find(
        (l) => l.learnerId === att.learnerId
      );
      if (!learner) return;

      const classExamIds = dashboardData.exams
        ? dashboardData.exams
            .filter((e) => e.classId === att.classId)
            .map((e) => e.examId)
        : [];

      const relevantResults = dashboardData.examResults.filter(
        (er) =>
          er.learnerId === att.learnerId &&
          (classExamIds.length === 0 || classExamIds.includes(er.examId))
      );

      const avgScore =
        relevantResults.length > 0
          ? relevantResults.reduce(
              (sum, r) => sum + Number(r.averageScore),
              0
            ) / relevantResults.length
          : null;

      const warningTypes = [];
      if (att.attendanceRate < 50) warningTypes.push("Chuyên cần thấp");
      if (avgScore !== null && avgScore < 5) warningTypes.push("Điểm thấp");

      if (warningTypes.length > 0) {
        warnings.push({
          learnerId: learner.learnerId,
          fullName: learner.fullName,
          classId: cls.classId,
          className: cls.className,
          attendanceRate: att.attendanceRate,
          averageScore: avgScore !== null ? avgScore.toFixed(1) : "N/A",
          warnings: warningTypes,
        });
      }
    });

    return warnings;
  }, [dashboardData]);

  const unreadNotifications = useMemo(() => {
    if (!dashboardData) return [];
    return dashboardData.notifications.filter((n) => n.isRead === "unread");
  }, [dashboardData]);

  const pendingRequests = useMemo(() => {
    if (!dashboardData || !dashboardData.sessionChangeRequests) return [];

    return dashboardData.sessionChangeRequests.filter(
      (req) => req.status === "PENDING"
    );
  }, [dashboardData]);

  const attendanceAlerts = useMemo(() => {
    if (!dashboardData || !dashboardData.missedAttendanceAlerts) {
      return [];
    }
    return dashboardData.missedAttendanceAlerts;
  }, [dashboardData]);

  const kpiCards = [
    {
      title: "Khóa học",
      value: totalActiveCourses,
      icon: <School sx={{ fontSize: 28 }} />,
      color: "#1976d2",
      bgColor: "#f5f5f5",
      trend: "+12%",
      isPositive: true,
    },
    {
      title: "Lớp hoạt động",
      value: activeClasses,
      icon: <Class sx={{ fontSize: 28 }} />,
      color: "#2e7d32",
      bgColor: "#f5f5f5",
      trend: "+8%",
      isPositive: true,
    },
    {
      title: "Học viên",
      value: totalLearners,
      icon: <Group sx={{ fontSize: 28 }} />,
      color: "#ed6c02",
      bgColor: "#f5f5f5",
      trend: "+23%",
      isPositive: true,
    },
    {
      title: "Bài chưa chấm",
      value: ungradedSubmissions,
      icon: <Assignment sx={{ fontSize: 28 }} />,
      color: "#d32f2f",
      bgColor: "#f5f5f5",
      trend: "-5%",
      isPositive: true,
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Không thể tải dữ liệu Dashboard.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#fafafa", minHeight: "100vh" }}>
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #e0e0e0",
          px: 3,
          py: 3,
        }}
      >
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Dashboard Giảng viên
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tổng quan hiệu quả giảng dạy và quản lý lớp học
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {kpiCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  border: "none",
                  borderRadius: 3,
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: `linear-gradient(90deg, ${card.color}, ${card.color}dd)`,
                  },
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                    "& .icon-box": {
                      transform: "scale(1.1) rotate(5deg)",
                    },
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 3,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 1.5,
                          color: "#64748b",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          color: "#0f172a",
                          fontSize: "2rem",
                        }}
                      >
                        {card.value}
                      </Typography>
                    </Box>
                    <Box
                      className="icon-box"
                      sx={{
                        background: `linear-gradient(135deg, ${card.color}ee, ${card.color})`,
                        borderRadius: 2.5,
                        p: 1.5,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 8px 20px ${card.color}40`,
                        transition: "all 0.3s ease",
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      pt: 2.5,
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        bgcolor: card.isPositive ? "#ecfdf5" : "#fef2f2",
                        borderRadius: 2,
                        px: 1.5,
                        py: 0.75,
                        mr: 1.5,
                      }}
                    >
                      {card.isPositive ? (
                        <ArrowUpward
                          sx={{ fontSize: 18, color: "#10b981", mr: 0.5 }}
                        />
                      ) : (
                        <ArrowDownward
                          sx={{ fontSize: 18, color: "#ef4444", mr: 0.5 }}
                        />
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          color: card.isPositive ? "#10b981" : "#ef4444",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                        }}
                      >
                        {card.trend}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#94a3b8",
                        fontSize: "0.813rem",
                        fontWeight: 500,
                      }}
                    >
                      so với tháng trước
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card
              elevation={0}
              sx={{
                bgcolor: "white",
                border: "1px solid #e0e0e0",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <TrendingUp sx={{ mr: 1.5, color: "#1976d2" }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Điểm trung bình bài kiểm tra
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Xu hướng điểm số của học viên
                    </Typography>
                  </Box>
                </Box>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={averageScoreData}>
                    <defs>
                      <linearGradient
                        id="colorScore"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#1976d2"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#1976d2"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      stroke="#999"
                      interval="preserveStartEnd"
                      minTickGap={10}
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis
                      domain={[0, 10]}
                      tick={{ fontSize: 12 }}
                      stroke="#999"
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 4,
                        border: "1px solid #e0e0e0",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#1976d2"
                      strokeWidth={2}
                      fill="url(#colorScore)"
                      name="Điểm TB"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              elevation={0}
              sx={{
                bgcolor: "white",
                border: "1px solid #e0e0e0",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <BarChartIcon sx={{ mr: 1.5, color: "#2e7d32" }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Số học viên theo lớp
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phân bố học viên trong các lớp học
                    </Typography>
                  </Box>
                </Box>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={learnersByClass}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="className"
                      tick={{ fontSize: 10 }}
                      stroke="#999"
                      interval={0}
                      tickFormatter={(value) =>
                        value.length > 15
                          ? `${value.substring(0, 15)}...`
                          : value
                      }
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="#999" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 4,
                        border: "1px solid #e0e0e0",
                      }}
                    />
                    <Bar
                      dataKey="learners"
                      fill="#2e7d32"
                      radius={[4, 4, 0, 0]}
                      name="Học viên"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {attendanceAlerts.length > 0 && (
          <Card
            elevation={0}
            sx={{
              mb: 3,
              bgcolor: "#fff5f5",
              border: "1px solid #ffcdd2",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2.5, borderBottom: "1px solid #ffcdd2" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      mr: 1.5,
                      color: "#d32f2f",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2L1 21h22M12 6l7.53 13H4.47M11 10v4h2v-4m-2 6v2h2v-2" />
                    </svg>
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={600} color="#d32f2f">
                      Cần điểm danh gấp
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bạn có {attendanceAlerts.length} lớp chưa điểm danh quá
                      hạn
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, bgcolor: "#ffebee" }}>
                        Lớp học
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: "#ffebee" }}>
                        Thời gian
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: "#ffebee" }}>
                        Ngày
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: "#ffebee" }}>
                        Hành động
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceAlerts.map((alert) => (
                      <TableRow key={alert.sessionId}>
                        <TableCell>
                          <Chip
                            label={alert.className}
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>{alert.slotTime}</TableCell>
                        <TableCell>{alert.displayDate}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() =>
                              (window.location.href = `/instructor/schedule`)
                            }
                            sx={{ textTransform: "none" }}
                          >
                            Điểm danh ngay
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
        <Card
          elevation={0}
          sx={{
            mb: 3,
            bgcolor: "white",
            border: "none",
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: "linear-gradient(90deg, #ed6c02, #ff9800)",
            },
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: "1px solid #f1f5f9" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    background: "linear-gradient(135deg, #ed6c02, #ff9800)",
                    borderRadius: 2,
                    p: 1.5,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <CalendarToday sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#0f172a",
                      mb: 0.5,
                    }}
                  >
                    Lịch giảng dạy sắp tới
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    {upcomingSessions.length} buổi học trong tuần này
                  </Typography>
                </Box>
              </Box>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        bgcolor: "#f8fafc",
                        color: "#475569",
                        fontSize: "0.813rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        borderBottom: "2px solid #e2e8f0",
                      }}
                    >
                      Lớp học
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        bgcolor: "#f8fafc",
                        color: "#475569",
                        fontSize: "0.813rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        borderBottom: "2px solid #e2e8f0",
                      }}
                    >
                      Buổi Học
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        bgcolor: "#f8fafc",
                        color: "#475569",
                        fontSize: "0.813rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        borderBottom: "2px solid #e2e8f0",
                      }}
                    >
                      Ngày
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        bgcolor: "#f8fafc",
                        color: "#475569",
                        fontSize: "0.813rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        borderBottom: "2px solid #e2e8f0",
                      }}
                    >
                      Giờ
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {upcomingSessions.map((session) => (
                    <TableRow
                      key={session.sessionId}
                      sx={{
                        "&:hover": {
                          bgcolor: "#f8fafc",
                        },
                      }}
                    >
                      <TableCell sx={{ borderBottom: "1px solid #f1f5f9" }}>
                        <Chip
                          label={session.className}
                          size="small"
                          sx={{
                            bgcolor: "#3b82f6",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.813rem",
                            height: 28,
                            borderRadius: 2,
                            "& .MuiChip-label": {
                              px: 1.5,
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: "1px solid #f1f5f9",
                          color: "#1e293b",
                          fontWeight: 500,
                        }}
                      >
                        {session.sessionTitle}
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: "1px solid #f1f5f9",
                          color: "#475569",
                          fontWeight: 500,
                        }}
                      >
                        {session.formattedDate}
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: "1px solid #f1f5f9",
                          color: "#64748b",
                          fontWeight: 500,
                          fontSize: "0.875rem",
                        }}
                      >
                        {session.startTime} - {session.endTime}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            mb: 3,
            bgcolor: "white",
            border: "none",
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: "linear-gradient(90deg, #d32f2f, #ef5350)",
            },
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: "1px solid #f1f5f9" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    background: "linear-gradient(135deg, #d32f2f, #ef5350)",
                    borderRadius: 2,
                    p: 1.5,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <Assignment sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#0f172a",
                      mb: 0.5,
                    }}
                  >
                    Trạng thái bài tập / bài thi
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    Theo dõi tiến độ chấm điểm
                  </Typography>
                </Box>
              </Box>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        bgcolor: "#f8fafc",
                        color: "#475569",
                        fontSize: "0.813rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        borderBottom: "2px solid #e2e8f0",
                        width: "40%",
                      }}
                    >
                      Tiêu đề
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        bgcolor: "#f8fafc",
                        color: "#475569",
                        fontSize: "0.813rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        borderBottom: "2px solid #e2e8f0",
                      }}
                    >
                      Loại
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        bgcolor: "#f8fafc",
                        color: "#475569",
                        fontSize: "0.813rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        borderBottom: "2px solid #e2e8f0",
                      }}
                    >
                      Lớp
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        bgcolor: "#f8fafc",
                        color: "#475569",
                        fontSize: "0.813rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        borderBottom: "2px solid #e2e8f0",
                      }}
                    >
                      Đã nộp
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        bgcolor: "#f8fafc",
                        color: "#475569",
                        fontSize: "0.813rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        borderBottom: "2px solid #e2e8f0",
                      }}
                    >
                      Tiến độ
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        bgcolor: "#f8fafc",
                        color: "#475569",
                        fontSize: "0.813rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        borderBottom: "2px solid #e2e8f0",
                      }}
                    >
                      Trạng thái
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exams.map((exam) => (
                    <TableRow
                      key={exam.examId}
                      sx={{
                        "&:hover": {
                          bgcolor: "#f8fafc",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: "#1e293b",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        {exam.title}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #f1f5f9" }}>
                        <Chip
                          label={exam.type}
                          size="small"
                          sx={{
                            bgcolor:
                              exam.type === "EXAM" ? "#dc2626" : "#3b82f6",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.813rem",
                            height: 28,
                            borderRadius: 2,
                            "& .MuiChip-label": {
                              px: 1.5,
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "#475569",
                          fontWeight: 500,
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        {exam.className}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 600,
                          color: "#1e293b",
                          fontSize: "1rem",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        {exam.submittedCount}/{exam.totalLearners}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #f1f5f9" }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <LinearProgress
                            variant="determinate"
                            value={exam.progress > 100 ? 100 : exam.progress}
                            sx={{
                              flex: 1,
                              height: 8,
                              borderRadius: 4,
                              bgcolor: "#e2e8f0",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 4,
                                bgcolor:
                                  exam.ungradedCount === 0
                                    ? "#10b981"
                                    : "#f59e0b",
                              },
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              minWidth: 40,
                              color: "#1e293b",
                              fontSize: "0.875rem",
                            }}
                          >
                            {exam.totalLearners > 0
                              ? Math.round(
                                  (exam.gradedCount / exam.totalLearners) * 100
                                )
                              : 0}
                            %
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #f1f5f9" }}>
                        {exam.submittedCount === 0 ? (
                          /* Trường hợp chưa có ai nộp bài */
                          <Chip
                            label="Chưa có bài nộp"
                            size="small"
                            icon={<Schedule sx={{ fontSize: 16 }} />}
                            sx={{
                              bgcolor: "#94a3b8", // Màu xám trung tính
                              color: "white",
                              fontWeight: 600,
                              fontSize: "0.813rem",
                              height: 28,
                              borderRadius: 2,
                              "& .MuiChip-label": { px: 1.5 },
                              "& .MuiChip-icon": { color: "white" },
                            }}
                          />
                        ) : (
                          /* Trường hợp đã có bài nộp, hiển thị theo trạng thái chấm điểm */
                          <Chip
                            label={exam.status}
                            size="small"
                            icon={
                              exam.status === "Đã chấm" ? (
                                <CheckCircle sx={{ fontSize: 16 }} />
                              ) : (
                                <Schedule sx={{ fontSize: 16 }} />
                              )
                            }
                            sx={{
                              bgcolor:
                                exam.status === "Đã chấm"
                                  ? "#10b981"
                                  : "#f59e0b",
                              color: "white",
                              fontWeight: 600,
                              fontSize: "0.813rem",
                              height: 28,
                              borderRadius: 2,
                              "& .MuiChip-label": { px: 1.5 },
                              "& .MuiChip-icon": { color: "white" },
                            }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            mb: 3,
            bgcolor: "white",
            border: "none",
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: "linear-gradient(90deg, #ed6c02, #ff9800)",
            },
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: "1px solid #f1f5f9" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    background: "linear-gradient(135deg, #ed6c02, #ff9800)",
                    borderRadius: 2,
                    p: 1.5,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <Warning sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#0f172a",
                      mb: 0.5,
                    }}
                  >
                    Cảnh báo học viên
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    {learnerWarnings.length} học viên cần chú ý
                  </Typography>
                </Box>
              </Box>
            </Box>
            {learnerWarnings.length === 0 ? (
              <Box sx={{ p: 3 }}>
                <Alert
                  severity="success"
                  icon={<CheckCircle />}
                  sx={{
                    borderRadius: 2,
                    bgcolor: "#ecfdf5",
                    border: "1px solid #d1fae5",
                    "& .MuiAlert-icon": {
                      color: "#10b981",
                    },
                    "& .MuiAlert-message": {
                      color: "#065f46",
                      fontWeight: 500,
                    },
                  }}
                >
                  Không có học viên cần chú ý
                </Alert>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          bgcolor: "#f8fafc",
                          color: "#475569",
                          fontSize: "0.813rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "2px solid #e2e8f0",
                        }}
                      >
                        Họ tên
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          bgcolor: "#f8fafc",
                          color: "#475569",
                          fontSize: "0.813rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "2px solid #e2e8f0",
                        }}
                      >
                        Lớp
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          bgcolor: "#f8fafc",
                          color: "#475569",
                          fontSize: "0.813rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "2px solid #e2e8f0",
                        }}
                      >
                        Chuyên cần
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          bgcolor: "#f8fafc",
                          color: "#475569",
                          fontSize: "0.813rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "2px solid #e2e8f0",
                        }}
                      >
                        Điểm TB
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          bgcolor: "#f8fafc",
                          color: "#475569",
                          fontSize: "0.813rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "2px solid #e2e8f0",
                        }}
                      >
                        Cảnh báo
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {learnerWarnings.map((warning, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:hover": {
                            bgcolor: "#f8fafc",
                          },
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            color: "#1e293b",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          {warning.fullName}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#475569",
                            fontWeight: 500,
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          {warning.className}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ borderBottom: "1px solid #f1f5f9" }}
                        >
                          <Chip
                            label={`${warning.attendanceRate}%`}
                            size="small"
                            sx={{
                              bgcolor:
                                warning.attendanceRate < 50
                                  ? "#dc2626"
                                  : "#10b981",
                              color: "white",
                              fontWeight: 600,
                              fontSize: "0.813rem",
                              height: 28,
                              borderRadius: 2,
                              "& .MuiChip-label": {
                                px: 1.5,
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ borderBottom: "1px solid #f1f5f9" }}
                        >
                          <Chip
                            label={warning.averageScore}
                            size="small"
                            sx={{
                              bgcolor:
                                warning.averageScore !== "N/A" &&
                                parseFloat(warning.averageScore) < 5
                                  ? "#dc2626"
                                  : "#64748b",
                              color: "white",
                              fontWeight: 600,
                              fontSize: "0.813rem",
                              height: 28,
                              borderRadius: 2,
                              "& .MuiChip-label": {
                                px: 1.5,
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #f1f5f9" }}>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 0.75,
                              flexWrap: "wrap",
                            }}
                          >
                            {warning.warnings.map((w, i) => (
                              <Chip
                                key={i}
                                label={w}
                                size="small"
                                sx={{
                                  bgcolor: "#f59e0b",
                                  color: "white",
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  height: 26,
                                  borderRadius: 2,
                                  "& .MuiChip-label": {
                                    px: 1.25,
                                  },
                                }}
                              />
                            ))}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card
              elevation={0}
              sx={{
                bgcolor: "white",
                border: "1px solid #e0e0e0",
                height: "100%",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Notifications sx={{ mr: 1.5, color: "#1976d2" }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        Thông báo
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {unreadNotifications.length} chưa đọc
                      </Typography>
                    </Box>
                  </Box>
                  <Badge
                    badgeContent={unreadNotifications.length}
                    color="error"
                  >
                    <IconButton size="small">
                      <Notifications />
                    </IconButton>
                  </Badge>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                  {dashboardData.notifications.map((notif) => (
                    <Box
                      key={notif.notificationId}
                      sx={{
                        p: 2,
                        mb: 1.5,
                        borderRadius: 1,
                        bgcolor:
                          notif.isRead === "read" ? "#fafafa" : "#e3f2fd",
                        border:
                          notif.isRead === "read"
                            ? "1px solid #e0e0e0"
                            : "1px solid #90caf9",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          sx={{ flex: 1 }}
                        >
                          {notificationTitleMap[notif.title] || "Thông báo"}
                        </Typography>

                        <Chip
                          label={notif.isRead === "read" ? "Đã đọc" : "Mới"}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: 11,
                            fontWeight: 500,
                            bgcolor:
                              notif.isRead === "read" ? "#e0e0e0" : "#1976d2",
                            color: notif.isRead === "read" ? "#666" : "white",
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {notif.content}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              elevation={0}
              sx={{
                bgcolor: "white",
                border: "1px solid #e0e0e0",
                height: "100%",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Schedule sx={{ mr: 1.5, color: "#ed6c02" }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        Yêu cầu đổi lịch
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {pendingRequests.length} đang chờ xử lý
                      </Typography>
                    </Box>
                  </Box>
                  <Badge badgeContent={pendingRequests.length} color="warning">
                    <IconButton size="small">
                      <Schedule />
                    </IconButton>
                  </Badge>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {pendingRequests.length === 0 ? (
                  <Alert severity="info">Không có yêu cầu đang chờ xử lý</Alert>
                ) : (
                  <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                    {pendingRequests.map((req) => (
                      <Box
                        key={req.requestId}
                        sx={{
                          p: 2,
                          mb: 1.5,
                          borderRadius: 1,
                          bgcolor: "#fff8e1",
                          border: "1px solid #ffe082",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Chip
                            label={req.className}
                            size="small"
                            sx={{
                              bgcolor: "#1976d2",
                              color: "white",
                              fontWeight: 500,
                            }}
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontWeight: 500 }}
                          >
                            {new Date(req.sessionDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {req.reason}
                        </Typography>
                        <Chip
                          label={statusConfig[req.status]?.label || req.status}
                          size="small"
                          sx={{
                            bgcolor:
                              statusConfig[req.status]?.bgcolor || "#64748b",
                            color: "white",
                            fontWeight: 500,
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
