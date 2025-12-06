import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  LinearProgress,
  Fade,
  Button,
} from "@mui/material";
import {
  School,
  Assignment,
  Timer,
  Star,
  LibraryBooks,
  Assessment,
  ExpandMore,
  PersonOutline,
  CalendarToday,
  CheckCircle,
  Class as ClassIcon,
  EventAvailable,
  Quiz,
  Cancel,
  TrendingUp,
  RocketLaunchRounded,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { 
  getLearnerProgressApi, 
  getOverallStatisticsApi 
} from "../../apiServices/progressService";
import { getLearnerIdFromAccount } from "../../utils/learnerUtils";
import AppHeader from "../../components/Header/AppHeader";

const ProgressPage = () => {
  const { user, isLearner } = useAuth();
  const [progress, setProgress] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [selectedTab, setSelectedTab] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const accId = user.AccID || user.id || user.AccountID;
      
      if (!accId) {
        throw new Error(
          "Không tìm thấy Account ID. Vui lòng đăng xuất và đăng nhập lại."
        );
      }

      const learnerId = await getLearnerIdFromAccount(accId);

      if (!learnerId) {
        throw new Error(
          "Không tìm thấy Learner ID. Hãy đảm bảo bạn đã có profile learner."
        );
      }

      const [progressRes, statsRes] = await Promise.all([
        getLearnerProgressApi(learnerId),
        getOverallStatisticsApi(learnerId)
      ]);

      console.log("Full progressRes:", progressRes);
      console.log("Progress data:", progressRes.data);
      if (progressRes.data && progressRes.data.length > 0) {
        console.log("First course stats:", progressRes.data[0].stats);
      }

      setProgress(progressRes.data || []);
      setStatistics(statsRes.data || null);
    } catch (err) {
      console.error("Error fetching progress:", err);
      setError(err.message || "Không thể tải thông tin tiến độ.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleExpandCourse = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const handleTabChange = (courseId, newValue) => {
    setSelectedTab(prev => ({ ...prev, [courseId]: newValue }));
  };

  useEffect(() => {
    if (user && isLearner) {
      fetchProgress();
    } else {
      setError("Chỉ học viên mới có thể xem tiến độ");
      setLoading(false);
    }
  }, [user, isLearner, fetchProgress]);

  const getScoreColor = (score) => {
    if (score >= 8) return "success.main";
    if (score >= 6.5) return "warning.main";
    return "error.main";
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 80) return "success";
    if (rate >= 60) return "warning";
    return "error";
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "success";
    if (percentage >= 50) return "info";
    return "warning";
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
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fe" }}>
        <AppHeader />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fe" }}>
      <AppHeader />

      {/* Hero Section - Enhanced */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)",
          color: "white",
          py: { xs: 3, md: 4 },
          mb: 5,
          position: "relative",
          overflow: "hidden",
          borderBottomLeftRadius: { xs: 40, md: 60 },
          borderBottomRightRadius: { xs: 40, md: 60 },
          boxShadow: "0 50px 100px rgba(102, 126, 234, 0.4)",
          "&::before": {
            content: '""',
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            background:
              "radial-gradient(circle at 15% 30%, rgba(255,255,255,0.25) 0%, transparent 60%)",
            zIndex: 1,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            right: 0,
            background:
              "radial-gradient(circle at 85% 70%, rgba(255,255,255,0.22) 0%, transparent 60%)",
            zIndex: 1,
          },
        }}
      >
        {/* Decorative Background Icons */}
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            opacity: 0.12,
            zIndex: 0,
          }}
        >
          <Box sx={{ position: "absolute", fontSize: "4rem", top: "15%", left: "8%", transform: "rotate(-15deg)" }}>
            📊
          </Box>
          <Box sx={{ position: "absolute", fontSize: "3.5rem", top: "65%", left: "12%", transform: "rotate(25deg)" }}>
            ✅
          </Box>
          <Box sx={{ position: "absolute", fontSize: "3rem", top: "25%", right: "10%", transform: "rotate(15deg)" }}>
            📈
          </Box>
          <Box sx={{ position: "absolute", fontSize: "3.5rem", top: "70%", right: "15%", transform: "rotate(-20deg)" }}>
            🎯
          </Box>
          <Box sx={{ position: "absolute", fontSize: "4rem", top: "45%", left: "5%", transform: "rotate(10deg)" }}>
            💯
          </Box>
          <Box sx={{ position: "absolute", fontSize: "3.5rem", top: "50%", right: "8%", transform: "rotate(-12deg)" }}>
            🏆
          </Box>
        </Box>

        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* Hero Icon */}
          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: "24px",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.18))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 35px 90px rgba(0,0,0,0.35), 0 0 80px rgba(255,255,255,0.35), inset 0 1px 1px rgba(255,255,255,0.5)",
              backdropFilter: "blur(25px)",
              fontSize: "2.5rem",
              border: "3px solid rgba(255,255,255,0.35)",
            }}
          >
            📊
          </Box>

          {/* Title */}
          <Typography
            component="h1"
            sx={{
              fontFamily: "'Poppins', 'Inter', sans-serif",
              fontWeight: 900,
              textAlign: "center",
              mb: 0.5,
              letterSpacing: "-0.5px",
              fontSize: { xs: "1.6rem", sm: "2rem", md: "2.5rem" },
              textShadow: "0 20px 40px rgba(0,0,0,0.3)",
              lineHeight: 1.2,
            }}
          >
            Báo Cáo Tiến Độ Học Tập
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              opacity: 0.92,
              maxWidth: 700,
              mx: "auto",
              fontWeight: 300,
              lineHeight: 1.7,
              fontSize: { xs: "0.9rem", md: "1rem" },
              fontFamily: "'Inter', 'Segoe UI', sans-serif",
              letterSpacing: "0.2px",
            }}
          >
            Theo dõi chi tiết điểm số, bài tập và điểm danh của bạn
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ pb: 8 }} ref={contentRef}>
        {/* Overall Statistics */}
        {statistics && (
          <Fade in={true} timeout={500}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                mb: 5,
                borderRadius: 4,
                border: "1px solid rgba(99,102,241,0.15)",
                boxShadow: "0 20px 50px rgba(15,23,42,0.1)",
                background: "white",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
                <Assessment sx={{ color: "primary.main", fontSize: 32 }} />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Tổng Quan Thành Tích
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Card
                    elevation={0}
                    sx={{
                      textAlign: "center",
                      p: 3,
                      borderRadius: 4,
                      background: "linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)",
                      border: "1px solid rgba(99,102,241,0.2)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 15px 35px rgba(99,102,241,0.2)",
                      },
                    }}
                  >
                    <LibraryBooks sx={{ fontSize: 48, color: "#667eea", mb: 2 }} />
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                      {statistics.totalCourses}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Khóa học
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card
                    elevation={0}
                    sx={{
                      textAlign: "center",
                      p: 3,
                      borderRadius: 4,
                      background: "linear-gradient(135deg, rgba(240,147,251,0.1) 0%, rgba(245,175,251,0.1) 100%)",
                      border: "1px solid rgba(240,147,251,0.3)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 15px 35px rgba(240,147,251,0.2)",
                      },
                    }}
                  >
                    <Timer sx={{ fontSize: 48, color: "#f093fb", mb: 2 }} />
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                      {statistics.totalHoursLearned}h
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Giờ học
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card
                    elevation={0}
                    sx={{
                      textAlign: "center",
                      p: 3,
                      borderRadius: 4,
                      background: "linear-gradient(135deg, rgba(79,172,254,0.1) 0%, rgba(0,242,254,0.1) 100%)",
                      border: "1px solid rgba(79,172,254,0.3)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 15px 35px rgba(79,172,254,0.2)",
                      },
                    }}
                  >
                    <Assignment sx={{ fontSize: 48, color: "#4facfe", mb: 2 }} />
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                      {statistics.totalSubmissions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Bài tập đã nộp
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card
                    elevation={0}
                    sx={{
                      textAlign: "center",
                      p: 3,
                      borderRadius: 4,
                      background: "linear-gradient(135deg, rgba(254,202,87,0.15) 0%, rgba(255,177,66,0.15) 100%)",
                      border: "1px solid rgba(254,202,87,0.4)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 15px 35px rgba(254,202,87,0.3)",
                      },
                    }}
                  >
                    <Star sx={{ fontSize: 48, color: "#feca57", mb: 2 }} />
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                      {statistics.overallAvgScore}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Điểm trung bình
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Fade>
        )}

        {/* Course Progress List */}
        <Grid container spacing={3}>
          {progress.map((item, index) => {
            const assignmentProgress = item.stats.totalAssignments > 0
              ? (item.stats.completedAssignments / item.stats.totalAssignments) * 100
              : 0;
            const attendanceProgress = item.stats.totalSessions > 0
              ? (item.stats.attendedSessions / item.stats.totalSessions) * 100
              : 0;

            return (
              <Grid item xs={12} key={item.courseId}>
                <Fade in={true} timeout={300 + index * 100}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 4,
                      border: "1px solid rgba(99,102,241,0.15)",
                      boxShadow: "0 15px 40px rgba(15,23,42,0.08)",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 20px 50px rgba(99,102,241,0.15)",
                        transform: "translateY(-4px)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      {/* Course Header with Gradient */}
                      <Box
                        sx={{
                          p: 3,
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 800,
                              fontFamily: "'Poppins', sans-serif",
                              flex: 1,
                            }}
                          >
                            {item.course.title}
                          </Typography>
                          <Chip
                            label={item.course.level}
                            size="small"
                            sx={{
                              bgcolor: "rgba(255,255,255,0.25)",
                              color: "white",
                              fontWeight: 700,
                              backdropFilter: "blur(10px)",
                            }}
                          />
                        </Box>
                        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
                          <Chip
                            icon={<PersonOutline sx={{ color: "white !important" }} />}
                            label={item.instructor.name}
                            size="small"
                            sx={{
                              bgcolor: "rgba(255,255,255,0.2)",
                              color: "white",
                              fontWeight: 600,
                              backdropFilter: "blur(5px)",
                            }}
                          />
                          <Chip
                            label={`${item.totalEnrolledClasses} lớp học`}
                            size="small"
                            sx={{
                              bgcolor: "rgba(255,255,255,0.2)",
                              color: "white",
                              fontWeight: 600,
                              backdropFilter: "blur(5px)",
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Stats Summary with Progress Bars */}
                      <Box sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                          {/* Assignment Progress */}
                          <Grid item xs={12} md={6}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2.5,
                                borderRadius: 3,
                                bgcolor: "#f8f9fe",
                                border: "1px solid rgba(99,102,241,0.1)",
                              }}
                            >
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Assignment sx={{ color: "primary.main" }} />
                                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    Bài Tập
                                  </Typography>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>
                                  {item.stats.completedAssignments}/{item.stats.totalAssignments}
                                </Typography>
                              </Box>
                              
                              {item.stats.totalAssignments > 0 ? (
                                <>
                                  <LinearProgress
                                    variant="determinate"
                                    value={assignmentProgress}
                                    sx={{
                                      height: 12,
                                      borderRadius: 999,
                                      bgcolor: "rgba(99,102,241,0.1)",
                                      "& .MuiLinearProgress-bar": {
                                        borderRadius: 999,
                                        background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                                      },
                                    }}
                                  />
                                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Tiến độ hoàn thành
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
                                      {Math.round(assignmentProgress)}%
                                    </Typography>
                                  </Box>
                                  <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                                    <Typography variant="body2" color="text.secondary">
                                      Điểm trung bình:
                                    </Typography>
                                    <Typography
                                      variant="body1"
                                      sx={{
                                        fontWeight: 800,
                                        color: getScoreColor(item.stats.avgAssignmentScore),
                                      }}
                                    >
                                      {item.stats.avgAssignmentScore}
                                    </Typography>
                                  </Box>
                                </>
                              ) : (
                                <Alert
                                  severity="info"
                                  sx={{
                                    borderRadius: 2,
                                    border: "1px solid rgba(33,150,243,0.2)",
                                  }}
                                >
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    Khóa học này chưa có bài tập nào
                                  </Typography>
                                </Alert>
                              )}
                            </Paper>
                          </Grid>

                          {/* Attendance Progress */}
                          <Grid item xs={12} md={6}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2.5,
                                borderRadius: 3,
                                bgcolor: "#f8f9fe",
                                border: "1px solid rgba(99,102,241,0.1)",
                              }}
                            >
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <EventAvailable sx={{ color: "success.main" }} />
                                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    Điểm Danh
                                  </Typography>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: "success.main" }}>
                                  {item.stats.attendedSessions}/{item.stats.totalSessions}
                                </Typography>
                              </Box>
                              
                              {item.stats.totalSessions > 0 ? (
                                <>
                                  <LinearProgress
                                    variant="determinate"
                                    value={attendanceProgress}
                                    color={getProgressColor(attendanceProgress)}
                                    sx={{
                                      height: 12,
                                      borderRadius: 999,
                                      bgcolor: "rgba(76,175,80,0.1)",
                                      "& .MuiLinearProgress-bar": {
                                        borderRadius: 999,
                                      },
                                    }}
                                  />
                                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Tỷ lệ tham gia
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: "success.main" }}>
                                      {Math.round(attendanceProgress)}%
                                    </Typography>
                                  </Box>
                                  <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                                    <Typography variant="body2" color="text.secondary">
                                      Tổng giờ học:
                                    </Typography>
                                    <Typography
                                      variant="body1"
                                      sx={{
                                        fontWeight: 800,
                                        color: "primary.main",
                                      }}
                                    >
                                      {item.stats.totalStudyHours}h
                                    </Typography>
                                  </Box>
                                </>
                              ) : (
                                <Alert
                                  severity="info"
                                  sx={{
                                    borderRadius: 2,
                                    border: "1px solid rgba(33,150,243,0.2)",
                                  }}
                                >
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    Chưa có buổi học nào được ghi nhận
                                  </Typography>
                                </Alert>
                              )}
                            </Paper>
                          </Grid>
                        </Grid>
                      </Box>

                      {/* Accordion cho từng lớp */}
                      <Box sx={{ px: 3, pb: 3 }}>
                        {item.classesDetail && item.classesDetail.map((classItem, idx) => {
                          const classAssignmentProgress = classItem.stats.totalAssignments > 0
                            ? (classItem.stats.completedAssignments / classItem.stats.totalAssignments) * 100
                            : 0;

                          return (
                            <Accordion 
                              key={idx} 
                              elevation={0}
                              sx={{
                                mb: 2,
                                borderRadius: 3,
                                border: "1px solid rgba(99,102,241,0.1)",
                                "&:before": { display: "none" },
                                overflow: "hidden",
                              }}
                              expanded={expandedCourse === `${item.courseId}-${idx}`}
                              onChange={() => handleExpandCourse(`${item.courseId}-${idx}`)}
                            >
                              <AccordionSummary
                                expandIcon={
                                  <ExpandMore
                                    sx={{
                                      bgcolor: "rgba(102,126,234,0.1)",
                                      borderRadius: "50%",
                                      p: 0.5,
                                    }}
                                  />
                                }
                                sx={{
                                  bgcolor: "#f8f9fe",
                                  "&:hover": {
                                    bgcolor: "#eef0ff",
                                  },
                                }}
                              >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1, flexWrap: "wrap" }}>
                                  <ClassIcon sx={{ color: "primary.main" }} />
                                  <Typography sx={{ fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>
                                    {classItem.name}
                                  </Typography>
                                  <Chip
                                    label={classItem.status}
                                    size="small"
                                    color={classItem.status === 'Enrolled' || classItem.status === 'enrolled' ? 'success' : 'default'}
                                    sx={{ fontWeight: 600 }}
                                  />
                                  <Box sx={{ ml: "auto", display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                                    <Chip
                                      icon={<Star sx={{ fontSize: 16 }} />}
                                      label={`Điểm: ${classItem.stats.avgScore}`}
                                      size="small"
                                      sx={{
                                        bgcolor: "rgba(254,202,87,0.2)",
                                        color: "warning.dark",
                                        fontWeight: 700,
                                      }}
                                    />
                                    <Chip
                                      icon={<CheckCircle sx={{ fontSize: 16 }} />}
                                      label={`${classItem.stats.attendedSessions}/${classItem.stats.totalSessions}`}
                                      size="small"
                                      color={getAttendanceColor(classItem.attendanceRate)}
                                      sx={{ fontWeight: 700 }}
                                    />
                                  </Box>
                                </Box>
                              </AccordionSummary>
                              <AccordionDetails sx={{ p: 3, bgcolor: "white" }}>
                                {/* Progress Overview for Class */}
                                <Box sx={{ mb: 3 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                                    📊 Tiến Độ Lớp Học
                                  </Typography>
                                  <Box
                                    sx={{
                                      p: 2.5,
                                      borderRadius: 3,
                                      background: "linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)",
                                      border: "1px solid rgba(99,102,241,0.15)",
                                    }}
                                  >
                                    {/* Tỷ lệ điểm danh */}
                                    {classItem.stats.totalSessions > 0 ? (
                                      <>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            ✅ Tỷ lệ điểm danh ({classItem.stats.attendedSessions}/{classItem.stats.totalSessions})
                                          </Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 800, color: "success.main" }}>
                                            {classItem.attendanceRate}%
                                          </Typography>
                                        </Box>
                                        <LinearProgress
                                          variant="determinate"
                                          value={parseFloat(classItem.attendanceRate)}
                                          color={getProgressColor(parseFloat(classItem.attendanceRate))}
                                          sx={{
                                            height: 10,
                                            borderRadius: 999,
                                            "& .MuiLinearProgress-bar": {
                                              borderRadius: 999,
                                            },
                                          }}
                                        />
                                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, pt: 2, borderTop: "1px solid rgba(99,102,241,0.1)" }}>
                                          <Typography variant="caption" color="text.secondary">
                                            📅 Số buổi học đã tham gia
                                          </Typography>
                                          <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
                                               {classItem.stats.attendedSessions}/{classItem.stats.totalSessions}
                                          </Typography>
                                        </Box>
                                      </>
                                    ) : (
                                      <Alert
                                        severity="info"
                                        icon={<EventAvailable />}
                                        sx={{ borderRadius: 2 }}
                                      >
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                          Chưa có buổi học nào được ghi nhận
                                        </Typography>
                                      </Alert>
                                    )}
                                  </Box>

                                  {/* Note về assignments */}
                                  <Alert
                                    severity="info"
                                    icon={<Assignment />}
                                    sx={{ mt: 2, borderRadius: 2, bgcolor: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.1)" }}
                                  >
                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                      📝 Bài tập thuộc khóa học
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Tiến độ bài tập được hiển thị ở cấp độ khóa học (xem phần trên), không phải từng lớp học
                                    </Typography>
                                  </Alert>
                                </Box>

                                {/* Tabs cho các loại báo cáo */}
                                <Tabs
                                  value={selectedTab[`${item.courseId}-${idx}`] || 0}
                                  onChange={(e, v) => handleTabChange(`${item.courseId}-${idx}`, v)}
                                  sx={{
                                    mb: 3,
                                    borderBottom: "2px solid",
                                    borderColor: "divider",
                                    "& .MuiTab-root": {
                                      fontWeight: 600,
                                      textTransform: "none",
                                      fontSize: "0.95rem",
                                    },
                                    "& .Mui-selected": {
                                      color: "primary.main",
                                    },
                                  }}
                                >
                                  <Tab label="📝 Bài Tập" />
                                  <Tab label="📋 Kiểm Tra" />
                                  <Tab label="✅ Điểm Danh" />
                                </Tabs>

                                {/* Tab Content: Assignments */}
                                {(selectedTab[`${item.courseId}-${idx}`] || 0) === 0 && (
                                  <Box>
                                    <TableContainer
                                      component={Paper}
                                      elevation={0}
                                      sx={{
                                        borderRadius: 3,
                                        border: "1px solid rgba(99,102,241,0.1)",
                                      }}
                                    >
                                      <Table>
                                        <TableHead sx={{ bgcolor: "#f8f9fe" }}>
                                          <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700 }}>Số lượng</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700 }}>Điểm TB</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          <TableRow sx={{ "&:hover": { bgcolor: "#f8f9fe" } }}>
                                            <TableCell>
                                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <CheckCircle color="success" fontSize="small" />
                                                <Typography sx={{ fontWeight: 600 }}>Đã hoàn thành</Typography>
                                              </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                              <Chip 
                                                label={classItem.stats.completedAssignments} 
                                                size="small" 
                                                color="success"
                                                sx={{ fontWeight: 700 }}
                                              />
                                            </TableCell>
                                            <TableCell align="right">
                                              <Typography 
                                                sx={{ 
                                                  fontWeight: 800, 
                                                  fontSize: "1.1rem",
                                                  color: getScoreColor(classItem.stats.avgScore) 
                                                }}
                                              >
                                                {classItem.stats.avgScore}
                                              </Typography>
                                            </TableCell>
                                          </TableRow>
                                          <TableRow sx={{ "&:hover": { bgcolor: "#f8f9fe" } }}>
                                            <TableCell>
                                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Cancel color="warning" fontSize="small" />
                                                <Typography sx={{ fontWeight: 600 }}>Chưa hoàn thành</Typography>
                                              </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                              <Chip 
                                                label={classItem.stats.remainingAssignments} 
                                                size="small" 
                                                color="warning"
                                                sx={{ fontWeight: 700 }}
                                              />
                                            </TableCell>
                                            <TableCell align="right">-</TableCell>
                                          </TableRow>
                                          <TableRow sx={{ bgcolor: "#f8f9fe" }}>
                                            <TableCell sx={{ fontWeight: 800 }}>Tổng cộng</TableCell>
                                            <TableCell align="center">
                                              <Chip 
                                                label={classItem.stats.totalAssignments} 
                                                size="small"
                                                sx={{ fontWeight: 700, bgcolor: "primary.light", color: "primary.dark" }}
                                              />
                                            </TableCell>
                                            <TableCell align="right">
                                              <Typography sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
                                                {classItem.stats.avgScore}
                                              </Typography>
                                            </TableCell>
                                          </TableRow>
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  </Box>
                                )}

                                {/* Tab Content: Exams */}
                                {(selectedTab[`${item.courseId}-${idx}`] || 0) === 1 && (
                                  <Box>
                                    <Alert
                                      severity="info"
                                      sx={{
                                        mb: 3,
                                        borderRadius: 3,
                                        border: "1px solid rgba(33,150,243,0.2)",
                                      }}
                                    >
                                      Điểm kiểm tra được tính trong điểm trung bình chung của khóa học
                                    </Alert>
                                    <TableContainer
                                      component={Paper}
                                      elevation={0}
                                      sx={{
                                        borderRadius: 3,
                                        border: "1px solid rgba(99,102,241,0.1)",
                                      }}
                                    >
                                      <Table>
                                        <TableHead sx={{ bgcolor: "#f8f9fe" }}>
                                          <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>Loại</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700 }}>Số lượng</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700 }}>Điểm TB</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          <TableRow sx={{ "&:hover": { bgcolor: "#f8f9fe" } }}>
                                            <TableCell>
                                              <Typography sx={{ fontWeight: 600 }}>Bài kiểm tra đã làm</Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                              <Chip 
                                                label={item.stats.completedExams || 0} 
                                                size="small" 
                                                color="primary"
                                                sx={{ fontWeight: 700 }}
                                              />
                                            </TableCell>
                                            <TableCell align="right">
                                              <Typography 
                                                sx={{ 
                                                  fontWeight: 800, 
                                                  fontSize: "1.1rem",
                                                  color: getScoreColor(item.stats.avgExamScore || 0) 
                                                }}
                                              >
                                                {item.stats.avgExamScore || 0}
                                              </Typography>
                                            </TableCell>
                                          </TableRow>
                                          <TableRow sx={{ "&:hover": { bgcolor: "#f8f9fe" } }}>
                                            <TableCell>
                                              <Typography sx={{ fontWeight: 600 }}>Chưa làm</Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                              <Chip 
                                                label={item.stats.remainingExams || 0} 
                                                size="small" 
                                                sx={{ fontWeight: 700 }}
                                              />
                                            </TableCell>
                                            <TableCell align="right">-</TableCell>
                                          </TableRow>
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  </Box>
                                )}

                                {/* Tab Content: Attendance */}
                                {(selectedTab[`${item.courseId}-${idx}`] || 0) === 2 && (
                                  <Box>
                                    <TableContainer
                                      component={Paper}
                                      elevation={0}
                                      sx={{
                                        mb: 3,
                                        borderRadius: 3,
                                        border: "1px solid rgba(99,102,241,0.1)",
                                      }}
                                    >
                                      <Table>
                                        <TableHead sx={{ bgcolor: "#f8f9fe" }}>
                                          <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700 }}>Số buổi</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700 }}>Thời gian</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          <TableRow sx={{ "&:hover": { bgcolor: "#f8f9fe" } }}>
                                            <TableCell>
                                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <CheckCircle color="success" fontSize="small" />
                                                <Typography sx={{ fontWeight: 600 }}>Có mặt</Typography>
                                              </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                              <Chip 
                                                label={classItem.stats.attendedSessions} 
                                                size="small" 
                                                color="success"
                                                sx={{ fontWeight: 700 }}
                                              />
                                            </TableCell>
                                            <TableCell align="right">
                                              <Typography sx={{ fontWeight: 700 }}>
                                                {classItem.stats.totalStudyHours}h
                                              </Typography>
                                            </TableCell>
                                          </TableRow>
                                          <TableRow sx={{ "&:hover": { bgcolor: "#f8f9fe" } }}>
                                            <TableCell>
                                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Cancel color="error" fontSize="small" />
                                                <Typography sx={{ fontWeight: 600 }}>Vắng mặt</Typography>
                                              </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                              <Chip 
                                                label={classItem.stats.absentSessions} 
                                                size="small" 
                                                color="error"
                                                sx={{ fontWeight: 700 }}
                                              />
                                            </TableCell>
                                            <TableCell align="right">-</TableCell>
                                          </TableRow>
                                          <TableRow sx={{ bgcolor: "#f8f9fe" }}>
                                            <TableCell sx={{ fontWeight: 800 }}>Tổng cộng</TableCell>
                                            <TableCell align="center">
                                              <Chip 
                                                label={classItem.stats.totalSessions} 
                                                size="small"
                                                sx={{ fontWeight: 700, bgcolor: "primary.light", color: "primary.dark" }}
                                              />
                                            </TableCell>
                                            <TableCell align="right">
                                              <Typography sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
                                                {classItem.attendanceRate}%
                                              </Typography>
                                            </TableCell>
                                          </TableRow>
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                    
                                    {/* Thông tin thời gian */}
                                    <Paper
                                      elevation={0}
                                      sx={{
                                        p: 2.5,
                                        bgcolor: "#f8f9fe",
                                        borderRadius: 3,
                                        border: "1px solid rgba(99,102,241,0.1)",
                                      }}
                                    >
                                      <Typography variant="body2" sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                                        <CalendarToday fontSize="small" sx={{ color: "primary.main" }} />
                                        <strong>Ngày đăng ký:</strong> {new Date(classItem.dates.enrollmentDate).toLocaleDateString("vi-VN")}
                                      </Typography>
                                      {classItem.dates.classStart && (
                                        <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                          <CalendarToday fontSize="small" sx={{ color: "primary.main" }} />
                                          <strong>Thời gian lớp học:</strong> {new Date(classItem.dates.classStart).toLocaleDateString("vi-VN")} - {new Date(classItem.dates.classEnd).toLocaleDateString("vi-VN")}
                                        </Typography>
                                      )}
                                    </Paper>
                                  </Box>
                                )}
                              </AccordionDetails>
                            </Accordion>
                          );
                        })}
                      </Box>

                      {item.classesDetail && item.classesDetail.some(classItem => 
  classItem.stats.attendedSessions + classItem.stats.absentSessions >= classItem.stats.totalSessions
) && (
  <Box 
    sx={{ 
      px: 3, 
      pb: 3,
      borderTop: "2px solid",
      borderColor: "success.light",
      background: "linear-gradient(135deg, rgba(76,175,80,0.05) 0%, rgba(56,142,60,0.05) 100%)",
      mt: 2
    }}
  >
    <Box sx={{ textAlign: "center", py: 2 }}>
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 800, 
          color: "success.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1
        }}
      >
        <RocketLaunchRounded sx={{ fontSize: 28 }} />
        🎉 Chúc mừng bạn đã hoàn thành khóa học!
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ 
          color: "success.dark",
          mt: 1,
          fontWeight: 600
        }}
      >
        Bạn đã hoàn thành tất cả các buổi học của khóa học này
      </Typography>
    </Box>
  </Box>
)}
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            );
          })}
        </Grid>

        {/* Empty State */}
        {progress.length === 0 && (
          <Fade in={true} timeout={500}>
            <Box
              sx={{
                textAlign: "center",
                py: 10,
                px: 2,
              }}
            >
              <Box sx={{ fontSize: "6rem", mb: 2 }}>📊</Box>
              <Typography
                variant="h5"
                color="text.primary"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                Chưa có dữ liệu tiến độ
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Bạn chưa có khóa học nào để theo dõi tiến độ. Hãy đăng ký khóa học để bắt đầu!
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => window.location.href = "/courses"}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                }}
              >
                Khám phá khóa học
              </Button>
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default ProgressPage;
