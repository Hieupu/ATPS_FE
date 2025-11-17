import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  CircularProgress,
  Chip,
  Button,
  Collapse,
  Divider,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  TrendingUp,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { 
  getLearnerProgressApi, 
  getCourseDetailProgressApi,
  getOverallStatisticsApi 
} from "../../apiServices/progressService";
import { getLearnerIdFromAccount } from "../../utils/learnerUtils";
import AppHeader from "../../components/Header/AppHeader";

const ProgressPage = () => {
  const { user, isLearner } = useAuth();
  const [progress, setProgress] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState({});
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
      console.log("progressRes", progressRes);
         console.log("statsRes", statsRes);

      setProgress(progressRes.data || []);
      setStatistics(statsRes.data || null);
    } catch (err) {
      console.error("Error fetching progress:", err);
      setError(err.message || "Không thể tải thông tin tiến độ.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchCourseDetails = async (courseId, learnerId) => {
    if (courseDetails[courseId]) return;

    try {
      const response = await getCourseDetailProgressApi(learnerId, courseId);
      setCourseDetails(prev => ({
        ...prev,
        [courseId]: response.data || []
      }));
    } catch (err) {
      console.error("Error fetching course details:", err);
    }
  };

  const handleExpandCourse = async (courseId) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
      const accId = user.AccID || user.id || user.AccountID;
      const learnerId = await getLearnerIdFromAccount(accId);
      await fetchCourseDetails(courseId, learnerId);
    }
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

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "success";
    if (percentage >= 50) return "warning";
    return "error";
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
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
            Tiến độ học tập của bạn
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "center", opacity: 0.95, fontSize: 18 }}
          >
            Theo dõi chi tiết quá trình học tập và thành tích của bạn
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Overall Statistics */}
        {statistics && (
          <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              <Assessment sx={{ mr: 1, verticalAlign: "middle" }} />
              Tổng quan thành tích
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <LibraryBooks sx={{ fontSize: 40, color: "#667eea", mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statistics.totalCourses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Khóa học đã tham gia
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
                    Tổng thời gian học
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
                        {item.totalEnrolledClasses > 1 && (
                          <Chip
                            label={`${item.totalEnrolledClasses} lớp học`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
                        <Chip
                          icon={<PersonOutline />}
                          label={item.instructor.name}
                          size="small"
                          sx={{ bgcolor: "#e3f2fd" }}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Chip
                        label={`${item.progress.overall}%`}
                        color={getProgressColor(item.progress.overall)}
                        sx={{ fontSize: 16, fontWeight: 700, mb: 1 }}
                      />
                      <Typography variant="caption" display="block" color="text.secondary">
                        {item.status.progress}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Main Progress Bar */}
                  <LinearProgress
                    variant="determinate"
                    value={item.progress.overall}
                    color={getProgressColor(item.progress.overall)}
                    sx={{ height: 10, borderRadius: 5, mb: 3 }}
                  />

                  {/* Thống kê từng lớp học */}
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    <ClassIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                    Thống kê theo lớp học
                  </Typography>
                  
                  {item.classesDetail && item.classesDetail.map((classItem, idx) => (
                    <Accordion key={idx} sx={{ mb: 2, boxShadow: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                          <School color="primary" />
                          <Typography sx={{ fontWeight: 600 }}>
                            {classItem.name}
                          </Typography>
                          <Chip
                            label={classItem.status}
                            size="small"
                            color={classItem.status === 'Enrolled' ? 'success' : 'default'}
                          />
                          <Box sx={{ ml: "auto" }}>
                            <Chip
                              label={`${classItem.progress}%`}
                              size="small"
                              color={getProgressColor(classItem.progress)}
                            />
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          {/* Thống kê chi tiết */}
                          <Grid item xs={6} md={3}>
                            <Paper sx={{ p: 2, bgcolor: "#f8f9fe", textAlign: "center" }}>
                              <Typography variant="caption" color="text.secondary">
                                Bài tập
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {classItem.stats.completedAssignments}/{classItem.stats.totalAssignments}
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={(classItem.stats.completedAssignments / classItem.stats.totalAssignments) * 100 || 0}
                                color="primary"
                                sx={{ mt: 1, height: 4, borderRadius: 2 }}
                              />
                            </Paper>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Paper sx={{ p: 2, bgcolor: "#e8f5e9", textAlign: "center" }}>
                              <Typography variant="caption" color="text.secondary">
                                Điểm TB
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {classItem.stats.avgScore}
                              </Typography>
                              <Chip
                                label={classItem.performanceLevel}
                                size="small"
                                color={getPerformanceColor(classItem.stats.avgScore)}
                                sx={{ mt: 1 }}
                              />
                            </Paper>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Paper sx={{ p: 2, bgcolor: "#e3f2fd", textAlign: "center" }}>
                              <Typography variant="caption" color="text.secondary">
                                Điểm danh
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {classItem.stats.attendedSessions}/{classItem.stats.totalSessions}
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={classItem.attendanceRate}
                                color="info"
                                sx={{ mt: 1, height: 4, borderRadius: 2 }}
                              />
                            </Paper>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Paper sx={{ p: 2, bgcolor: "#fff4e6", textAlign: "center" }}>
                              <Typography variant="caption" color="text.secondary">
                                Thời gian học
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {classItem.stats.totalStudyHours}h
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>
                        
                        {/* Thông tin thêm */}
                        <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <CalendarToday fontSize="small" color="action" />
                            <Typography variant="body2">
                              Bắt đầu: {new Date(classItem.dates.enrollmentDate).toLocaleDateString("vi-VN")}
                            </Typography>
                          </Box>
                          {classItem.dates.classStart && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <CalendarToday fontSize="small" color="action" />
                              <Typography variant="body2">
                                Lớp: {new Date(classItem.dates.classStart).toLocaleDateString("vi-VN")} - {new Date(classItem.dates.classEnd).toLocaleDateString("vi-VN")}
                              </Typography>
                            </Box>
                          )}
                          {classItem.stats.remainingAssignments > 0 && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Assignment fontSize="small" color="warning" />
                              <Typography variant="body2" color="warning.main">
                                Còn {classItem.stats.remainingAssignments} bài tập
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}

                  <Divider sx={{ my: 3 }} />

                  {/* Tổng quan khóa học */}
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    <TrendingUp sx={{ mr: 1, verticalAlign: "middle" }} />
                    Tổng quan khóa học
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 2, bgcolor: "#f8f9fe", textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">
                          Tổng bài tập
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {item.stats.completedAssignments}/{item.stats.totalAssignments}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 2, bgcolor: "#e8f5e9", textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">
                          Điểm TB chung
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {item.stats.avgAssignmentScore}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 2, bgcolor: "#e3f2fd", textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">
                          Tổng buổi học
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {item.stats.attendedSessions}/{item.stats.totalSessions}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper sx={{ p: 2, bgcolor: "#fff4e6", textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">
                          Tổng giờ học
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {item.stats.totalStudyHours}h
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  {/* Expand Button cho Unit */}
                  <Button
                    fullWidth
                    onClick={() => handleExpandCourse(item.courseId)}
                    endIcon={
                      expandedCourse === item.courseId ? <ExpandMore sx={{ transform: 'rotate(180deg)' }} /> : <ExpandMore />
                    }
                    sx={{ textTransform: "none" }}
                  >
                    {expandedCourse === item.courseId
                      ? "Thu gọn chi tiết Unit"
                      : "Xem chi tiết theo Unit"}
                  </Button>

                  {/* Detailed Progress by Units */}
                  <Collapse in={expandedCourse === item.courseId}>
                    <Box sx={{ mt: 3 }}>
                      {courseDetails[item.courseId] ? (
                        <Grid container spacing={2}>
                          {courseDetails[item.courseId].map((unit) => (
                            <Grid item xs={12} key={unit.unitId}>
                              <Paper sx={{ p: 2, bgcolor: "#fafafa" }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 1,
                                  }}
                                >
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                      Unit {unit.order}: {unit.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {unit.description}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    icon={unit.isCompleted ? <CheckCircle /> : null}
                                    label={`${unit.progress}%`}
                                    size="small"
                                    color={unit.isCompleted ? "success" : "default"}
                                  />
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={unit.progress}
                                  sx={{ height: 6, borderRadius: 3, mb: 1 }}
                                />
                                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                  <Typography variant="caption">
                                    {unit.stats.totalLessons} bài học
                                  </Typography>
                                  <Typography variant="caption">
                                    {unit.stats.completedAssignments}/{unit.stats.totalAssignments} bài tập
                                  </Typography>
                                  {unit.stats.avgScore > 0 && (
                                    <Typography variant="caption" color="primary">
                                      Điểm TB: {unit.stats.avgScore}
                                    </Typography>
                                  )}
                                </Box>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Box sx={{ textAlign: "center", py: 2 }}>
                          <CircularProgress size={30} />
                        </Box>
                      )}
                    </Box>
                  </Collapse>
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