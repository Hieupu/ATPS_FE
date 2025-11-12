import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import {
  AccessTime,
  VideoCall,
  Person,
  School,
  Notifications,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { getLearnerScheduleApi } from "../../apiServices/scheduleService";
import { getLearnerIdFromAccount } from "../../utils/learnerUtils";
import AppHeader from "../../components/Header/AppHeader";
import { Link } from "react-router-dom";

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const SchedulePage = () => {
  const { user, isLearner } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const fetchLearnerSchedule = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get AccID từ user - kiểm tra các field có thể có
      const accId = user.AccID || user.AccID || user.id || user.AccountID;

      console.log("User object:", user);

      if (!accId) {
        const errorMsg =
          "Không tìm thấy Account ID. Vui lòng đăng xuất và đăng nhập lại để cập nhật thông tin.";
        console.error("AccID not found in user object:", user);
        throw new Error(errorMsg);
      }

      console.log("Using AccID:", accId);

      // Lấy LearnerID từ AccountID
      const actualLearnerId = await getLearnerIdFromAccount(accId);

      if (!actualLearnerId) {
        throw new Error(
          "Không tìm thấy Learner ID. Hãy đảm bảo bạn đã có profile learner."
        );
      }

      console.log("LearnerID found:", actualLearnerId);

      // Lấy lịch học với LearnerID thực
      const data = await getLearnerScheduleApi(actualLearnerId);
      console.log("Schedule data from API:", data);
      if (data.schedules && data.schedules.length > 0) {
        console.log("First schedule item:", {
          SessionTitle: data.schedules[0].SessionTitle,
          Description: data.schedules[0].Description,
          rescheduleInfo: data.schedules[0].rescheduleInfo,
          DescriptionLength: data.schedules[0].Description?.length || 0,
        });
      }
      setSchedules(data.schedules || []);
    } catch (err) {
      console.error("Error fetching schedule:", err);
      setError(
        err.message || "Không thể tải lịch học. Vui lòng đăng nhập lại."
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && isLearner) {
      // Lấy LearnerID từ API như trong MyCourses
      fetchLearnerSchedule();
    } else {
      setError("Chỉ học viên mới có thể xem lịch học");
      setLoading(false);
    }
  }, [user, isLearner, fetchLearnerSchedule]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // Group schedules by date
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const date = schedule.formattedDate || "Chưa có lịch";
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {});

  // Debug: Log today and schedule dates
  console.log("Today:", new Date().toLocaleDateString("vi-VN"));
  console.log("Grouped schedules dates:", Object.keys(groupedSchedules));

  // Set today to start of day for proper comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingSchedules = Object.entries(groupedSchedules)
    .filter(([date]) => {
      if (date === "Chưa có lịch") return false;

      // Parse dd/MM/yyyy format (vi-VN)
      const parts = date.split("/");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const year = parseInt(parts[2], 10);
        const scheduleDate = new Date(year, month, day);
        console.log(
          `Date: ${date}, scheduleDate: ${scheduleDate.toISOString()}, today: ${today.toISOString()}, isUpcoming: ${
            scheduleDate >= today
          }`
        );
        return scheduleDate >= today;
      }
      return false;
    })
    .sort(([a], [b]) => {
      const partsA = a.split("/").map(Number);
      const partsB = b.split("/").map(Number);
      return (
        new Date(partsA[2], partsA[1] - 1, partsA[0]) -
        new Date(partsB[2], partsB[1] - 1, partsB[0])
      );
    });

  const pastSchedules = Object.entries(groupedSchedules)
    .filter(([date]) => {
      if (date === "Chưa có lịch") return false;

      // Parse dd/MM/yyyy format (vi-VN)
      const parts = date.split("/");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const year = parseInt(parts[2], 10);
        const scheduleDate = new Date(year, month, day);
        return scheduleDate < today;
      }
      return false;
    })
    .sort(([a], [b]) => {
      const partsA = a.split("/").map(Number);
      const partsB = b.split("/").map(Number);
      return (
        new Date(partsB[2], partsB[1] - 1, partsB[0]) -
        new Date(partsA[2], partsA[1] - 1, partsA[0])
      );
    });

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
            Lịch học của tôi
          </Typography>
          <Typography variant="h6" sx={{ textAlign: "center", opacity: 0.9 }}>
            Xem lịch học và theo dõi các buổi học sắp tới
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab
                label={`Sắp tới (${upcomingSchedules.reduce(
                  (sum, [_, sessions]) => sum + sessions.length,
                  0
                )})`}
              />
              <Tab
                label={`Đã qua (${pastSchedules.reduce(
                  (sum, [_, sessions]) => sum + sessions.length,
                  0
                )})`}
              />
            </Tabs>
          </Box>

          {/* Tab Upcoming */}
          <TabPanel value={tabValue} index={0}>
            {upcomingSchedules.length === 0 ? (
              <Alert severity="info" sx={{ mt: 3 }}>
                Không có lịch học sắp tới
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {upcomingSchedules.map(([date, scheduleGroup]) => (
                  <Grid item xs={12} key={date}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                    >
                      {date}
                    </Typography>
                    {scheduleGroup.map((schedule, idx) => (
                      <Card
                        key={idx}
                        sx={{
                          mb: 2,
                          borderLeft: 4,
                          borderColor: "primary.main",
                        }}
                      >
                        <CardContent>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={8}>
                              <Typography
                                variant="h6"
                                sx={{ fontWeight: 600, mb: 1 }}
                              >
                                {schedule.SessionTitle}
                              </Typography>
                              {schedule.rescheduleInfo && (
                                <Box
                                  sx={{
                                    mb: 2,
                                    p: 2,
                                    bgcolor: "#fff7ed",
                                    borderLeft: 3,
                                    borderColor: "warning.main",
                                    borderRadius: 1,
                                  }}
                                >
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      fontWeight: 600,
                                      mb: 1,
                                      color: "warning.dark",
                                    }}
                                  >
                                    ⚠️ Đề xuất đổi lịch đang chờ phản hồi
                                  </Typography>
                                  {schedule.rescheduleInfo.oldSchedule && (
                                    <Typography
                                      variant="body2"
                                      sx={{ mb: 0.5 }}
                                    >
                                      <strong>Lịch cũ:</strong>{" "}
                                      {schedule.rescheduleInfo.oldSchedule}
                                    </Typography>
                                  )}
                                  {schedule.rescheduleInfo.newSchedule && (
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "primary.main" }}
                                    >
                                      <strong>Đề xuất lịch mới:</strong>{" "}
                                      {schedule.rescheduleInfo.newSchedule}
                                    </Typography>
                                  )}
                                </Box>
                              )}
                              {/* Chỉ hiển thị Description nếu không có rescheduleInfo để tránh trùng lặp */}
                              {schedule.Description &&
                                !schedule.rescheduleInfo && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 1 }}
                                  >
                                    {schedule.Description}
                                  </Typography>
                                )}
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1.5,
                                  flexWrap: "wrap",
                                  mt: 2,
                                }}
                              >
                                <Chip
                                  icon={<School />}
                                  label={
                                    schedule.CourseTitle &&
                                    schedule.CourseTitle.length > 30
                                      ? schedule.CourseTitle.substring(0, 30) +
                                        "..."
                                      : schedule.CourseTitle
                                  }
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                                <Chip
                                  icon={<AccessTime />}
                                  label={schedule.timeRange || "Chưa có giờ"}
                                  size="small"
                                />
                                <Chip
                                  icon={<Person />}
                                  label={schedule.InstructorName}
                                  size="small"
                                />
                              </Box>
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={4}
                              sx={{ textAlign: { xs: "left", md: "right" } }}
                            >
                              {schedule.hasZoom && (
                                <Button
                                  variant="contained"
                                  startIcon={<VideoCall />}
                                  href={schedule.ZoomURL}
                                  target="_blank"
                                  sx={{
                                    mb: 1,
                                    width: { xs: "100%", md: "auto" },
                                  }}
                                >
                                  Vào Zoom
                                </Button>
                              )}
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>

          {/* Tab Past */}
          <TabPanel value={tabValue} index={1}>
            {pastSchedules.length === 0 ? (
              <Alert severity="info" sx={{ mt: 3 }}>
                Không có lịch học đã qua
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {pastSchedules.map(([date, scheduleGroup]) => (
                  <Grid item xs={12} key={date}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, fontWeight: 600, color: "text.secondary" }}
                    >
                      {date}
                    </Typography>
                    {scheduleGroup.map((schedule, idx) => (
                      <Card key={idx} sx={{ mb: 2, bgcolor: "#f5f5f5" }}>
                        <CardContent>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={8}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 600,
                                  mb: 1,
                                  color: "text.secondary",
                                }}
                              >
                                {schedule.SessionTitle}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 2,
                                  flexWrap: "wrap",
                                }}
                              >
                                <Chip
                                  icon={<School />}
                                  label={schedule.CourseTitle}
                                  size="small"
                                  variant="outlined"
                                />
                                <Chip
                                  icon={<AccessTime />}
                                  label={schedule.timeRange}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
        </Card>
      </Container>
    </Box>
  );
};

export default SchedulePage;
