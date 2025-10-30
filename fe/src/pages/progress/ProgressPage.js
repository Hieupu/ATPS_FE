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
} from "@mui/material";
import { TrendingUp, CheckCircle, School } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { getLearnerProgressApi } from "../../apiServices/progressService";
import { getLearnerIdFromAccount } from "../../utils/learnerUtils";
import AppHeader from "../../components/Header/AppHeader";

const ProgressPage = () => {
  const { user, isLearner } = useAuth();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgress = useCallback(async () => {
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
      const data = await getLearnerProgressApi(learnerId);

      setProgress(data.progress || []);
    } catch (err) {
      console.error("Error fetching progress:", err);
      setError(err.message || "Không thể tải thông tin tiến độ.");
    } finally {
      setLoading(false);
    }
  }, [user]);

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

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "success";
    if (percentage >= 50) return "warning";
    return "error";
  };

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
            Tiến độ học tập
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "center", opacity: 0.9 }}
          >
            Theo dõi tiến độ hoàn thành các khóa học
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {progress.map((course) => (
            <Grid item xs={12} key={course.CourseID}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        {course.CourseTitle}
                      </Typography>
                      <Chip
                        icon={<School />}
                        label={course.ClassName}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    </Box>
                    <Chip
                      label={`${course.ProgressPercentage}%`}
                      color={getProgressColor(course.ProgressPercentage)}
                      size="small"
                    />
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={course.ProgressPercentage}
                    color={getProgressColor(course.ProgressPercentage)}
                    sx={{ height: 8, borderRadius: 4, mb: 2 }}
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CheckCircle color="success" />
                        <Typography variant="body2">
                          {course.CompletedUnits}/{course.TotalUnits} bài học
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <TrendingUp color="primary" />
                        <Typography variant="body2">
                          {course.HoursSpent} giờ học
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        Trạng thái: {course.Status}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {progress.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Bạn chưa có khóa học nào để theo dõi tiến độ.
          </Alert>
        )}
      </Container>
    </Box>
  );
};

export default ProgressPage;
