import React, { useState, useEffect, useCallback } from "react";
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

      console.log("progressRes", progressRes)

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

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fe" }}>
      <AppHeader />

      {/* Header Section */}
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
            <School sx={{ fontSize: 48, mb: 1 }} />
            <br />
            Báo Cáo Học Tập
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "center", opacity: 0.95, fontSize: 18 }}
          >
            Theo dõi chi tiết điểm số, bài tập và điểm danh
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Overall Statistics */}
        {statistics && (
          <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              <Assessment sx={{ mr: 1, verticalAlign: "middle" }} />
              Tổng Quan Thành Tích
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <LibraryBooks sx={{ fontSize: 40, color: "#667eea", mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statistics.totalCourses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Khóa học
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Timer sx={{ fontSize: 40, color: "#f093fb", mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statistics.totalHoursLearned}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Giờ học
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Assignment sx={{ fontSize: 40, color: "#4facfe", mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statistics.totalSubmissions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bài tập đã nộp
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Star sx={{ fontSize: 40, color: "#feca57", mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statistics.overallAvgScore}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Điểm trung bình
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Course Progress List */}
        <Grid container spacing={3}>
          {progress.map((item) => (
            <Grid item xs={12} key={item.courseId}>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent>
                  {/* Course Header */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {item.course.title}
                        </Typography>
                        <Chip
                          label={item.course.level}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
                        <Chip
                          icon={<PersonOutline />}
                          label={item.instructor.name}
                          size="small"
                          sx={{ bgcolor: "#e3f2fd" }}
                        />
                        <Chip
                          label={`${item.totalEnrolledClasses} lớp học`}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Thống kê tổng quan */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 2, bgcolor: "#f8f9fe", textAlign: "center" }}>
                        <Assignment color="primary" sx={{ mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {item.stats.completedAssignments}/{item.stats.totalAssignments}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Bài tập
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 2, bgcolor: "#e8f5e9", textAlign: "center" }}>
                        <Star color="warning" sx={{ mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {item.stats.avgAssignmentScore}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Điểm TB Assignment
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 2, bgcolor: "#e3f2fd", textAlign: "center" }}>
                        <EventAvailable color="info" sx={{ mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {item.stats.attendedSessions}/{item.stats.totalSessions}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Điểm danh
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 2, bgcolor: "#fff4e6", textAlign: "center" }}>
                        <Timer color="action" sx={{ mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {item.stats.totalStudyHours}h
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Giờ học
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Accordion cho từng lớp */}
                  {item.classesDetail && item.classesDetail.map((classItem, idx) => (
                    <Accordion 
                      key={idx} 
                      sx={{ mb: 2, boxShadow: 1 }}
                      expanded={expandedCourse === `${item.courseId}-${idx}`}
                      onChange={() => handleExpandCourse(`${item.courseId}-${idx}`)}
                    >
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                          <ClassIcon color="primary" />
                          <Typography sx={{ fontWeight: 600 }}>
                            {classItem.name}
                          </Typography>
                          <Chip
                            label={classItem.status}
                            size="small"
                            color={classItem.status === 'Enrolled' ? 'success' : 'default'}
                          />
                          <Box sx={{ ml: "auto", display: "flex", gap: 2 }}>
                            <Chip
                              label={`Điểm trung bình: ${classItem.stats.avgScore}`}
                              size="small"
                              sx={{ bgcolor: "#e8f5e9" }}
                            />
                            <Chip
                              label={`Điểm danh: ${classItem.stats.attendedSessions}/${classItem.stats.totalSessions}`}
                              size="small"
                              color={getAttendanceColor(classItem.attendanceRate)}
                            />
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {/* Tabs cho các loại báo cáo */}
                        <Tabs
                          value={selectedTab[`${item.courseId}-${idx}`] || 0}
                          onChange={(e, v) => handleTabChange(`${item.courseId}-${idx}`, v)}
                          sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
                        >
                          <Tab label="Bài Tập (Assignments)" icon={<Assignment />} iconPosition="start" />
                          <Tab label="Kiểm Tra (Exams)" icon={<Quiz />} iconPosition="start" />
                          <Tab label="Điểm Danh" icon={<EventAvailable />} iconPosition="start" />
                        </Tabs>

                        {/* Tab Content: Assignments */}
                        {(selectedTab[`${item.courseId}-${idx}`] || 0) === 0 && (
                          <Box>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                              Báo Cáo Bài Tập
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                              <Table size="small">
                                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                                  <TableRow>
                                    <TableCell><strong>Trạng thái</strong></TableCell>
                                    <TableCell align="center"><strong>Số lượng</strong></TableCell>
                                    <TableCell align="right"><strong>Điểm TB</strong></TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow>
                                    <TableCell>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <CheckCircle color="success" fontSize="small" />
                                        Đã hoàn thành
                                      </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Chip 
                                        label={classItem.stats.completedAssignments} 
                                        size="small" 
                                        color="success"
                                      />
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography 
                                        sx={{ 
                                          fontWeight: 700, 
                                          color: getScoreColor(classItem.stats.avgScore) 
                                        }}
                                      >
                                        {classItem.stats.avgScore}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Cancel color="warning" fontSize="small" />
                                        Chưa hoàn thành
                                      </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Chip 
                                        label={classItem.stats.remainingAssignments} 
                                        size="small" 
                                        color="warning"
                                      />
                                    </TableCell>
                                    <TableCell align="right">-</TableCell>
                                  </TableRow>
                                  <TableRow sx={{ bgcolor: "#f9f9f9" }}>
                                    <TableCell><strong>Tổng cộng</strong></TableCell>
                                    <TableCell align="center">
                                      <Chip 
                                        label={classItem.stats.totalAssignments} 
                                        size="small"
                                      />
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography sx={{ fontWeight: 700 }}>
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
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                              Báo Cáo Kiểm Tra
                            </Typography>
                            <Alert severity="info" sx={{ mb: 2 }}>
                              Điểm kiểm tra được tính trong điểm trung bình chung của khóa học
                            </Alert>
                            <TableContainer component={Paper} variant="outlined">
                              <Table size="small">
                                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                                  <TableRow>
                                    <TableCell><strong>Loại</strong></TableCell>
                                    <TableCell align="center"><strong>Số lượng</strong></TableCell>
                                    <TableCell align="right"><strong>Điểm TB</strong></TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow>
                                    <TableCell>Bài kiểm tra đã làm</TableCell>
                                    <TableCell align="center">
                                      <Chip 
                                        label={item.stats.completedExams || 0} 
                                        size="small" 
                                        color="primary"
                                      />
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography 
                                        sx={{ 
                                          fontWeight: 700, 
                                          color: getScoreColor(item.stats.avgExamScore || 0) 
                                        }}
                                      >
                                        {item.stats.avgExamScore || 0}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>Chưa làm</TableCell>
                                    <TableCell align="center">
                                      <Chip 
                                        label={item.stats.remainingExams || 0} 
                                        size="small" 
                                        color="default"
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
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                              Báo Cáo Điểm Danh
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                              <Table size="small">
                                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                                  <TableRow>
                                    <TableCell><strong>Trạng thái</strong></TableCell>
                                    <TableCell align="center"><strong>Số buổi</strong></TableCell>
                                    <TableCell align="right"><strong>Thời gian</strong></TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow>
                                    <TableCell>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <CheckCircle color="success" fontSize="small" />
                                        Có mặt
                                      </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Chip 
                                        label={classItem.stats.attendedSessions} 
                                        size="small" 
                                        color="success"
                                      />
                                    </TableCell>
                                    <TableCell align="right">
                                      {classItem.stats.totalStudyHours}h
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Cancel color="error" fontSize="small" />
                                        Vắng mặt
                                      </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Chip 
                                        label={classItem.stats.absentSessions} 
                                        size="small" 
                                        color="error"
                                      />
                                    </TableCell>
                                    <TableCell align="right">-</TableCell>
                                  </TableRow>
                                  <TableRow sx={{ bgcolor: "#f9f9f9" }}>
                                    <TableCell><strong>Tổng cộng</strong></TableCell>
                                    <TableCell align="center">
                                      <Chip 
                                        label={classItem.stats.totalSessions} 
                                        size="small"
                                      />
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography sx={{ fontWeight: 700 }}>
                                        Tỷ lệ: {classItem.attendanceRate}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                            
                            {/* Thông tin thời gian */}
                            <Box sx={{ mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                <CalendarToday fontSize="small" sx={{ verticalAlign: "middle", mr: 1 }} />
                                <strong>Ngày đăng ký:</strong> {new Date(classItem.dates.enrollmentDate).toLocaleDateString("vi-VN")}
                              </Typography>
                              {classItem.dates.classStart && (
                                <Typography variant="body2">
                                  <CalendarToday fontSize="small" sx={{ verticalAlign: "middle", mr: 1 }} />
                                  <strong>Thời gian lớp học:</strong> {new Date(classItem.dates.classStart).toLocaleDateString("vi-VN")} - {new Date(classItem.dates.classEnd).toLocaleDateString("vi-VN")}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {progress.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Bạn chưa có khóa học nào để theo dõi tiến độ. Hãy đăng ký khóa học để bắt đầu!
          </Alert>
        )}
      </Container>
    </Box>
  );
};

export default ProgressPage;