import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Container,
  Grid,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { 
  getLearnerProgressApi, 
  getOverallStatisticsApi 
} from "../../apiServices/progressService";
import { getLearnerIdFromAccount } from "../../utils/learnerUtils";
import AppHeader from "../../components/Header/AppHeader";

// Import components
import HeroSection from "./components/HeroSection";
import OverallStatistics from "./components/OverallStatistics";
import CourseProgressCard from "./components/CourseProgressCard";
import EmptyState from "./components/EmptyState";

const ProgressPage = () => {
  const { user, isLearner } = useAuth();
  const [progress, setProgress] = useState([]);
  const [statistics, setStatistics] = useState(null);
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
      <HeroSection />

      <Container maxWidth="xl" sx={{ pb: 8 }} ref={contentRef}>
        {/* Overall Statistics */}
        <OverallStatistics statistics={statistics} />

        {/* Course Progress List */}
        <Grid container spacing={3}>
          {progress.map((item, index) => (
            <Grid item xs={12} key={item.courseId}>
              <CourseProgressCard item={item} index={index} />
            </Grid>
          ))}
        </Grid>

        {/* Empty State */}
        {progress.length === 0 && <EmptyState />}
      </Container>
    </Box>
  );
};

export default ProgressPage;