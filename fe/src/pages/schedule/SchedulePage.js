import React, { useState, useEffect, useCallback } from "react";
import { Container, Box, Card, Tabs, Tab, Alert, CircularProgress } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { getLearnerScheduleApi } from "../../apiServices/scheduleService";
import { getLearnerIdFromAccount } from "../../utils/learnerUtils";
import AppHeader from "../../components/Header/AppHeader";
import ScheduleTabs from "./components/ScheduleTabs";
import ScheduleHeader from "./components/ScheduleHeader";
import { generateZoomLink, canJoinZoom, parseDate, groupSchedulesByDate } from "../../utils/scheduleUtils";

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

      const accId = user.AccID || user.AccID || user.id || user.AccountID;

      console.log("User object:", user);

      if (!accId) {
        const errorMsg =
          "Không tìm thấy Account ID. Vui lòng đăng xuất và đăng nhập lại để cập nhật thông tin.";
        console.error("AccID not found in user object:", user);
        throw new Error(errorMsg);
      }

      console.log("Using AccID:", accId);

      const actualLearnerId = await getLearnerIdFromAccount(accId);

      if (!actualLearnerId) {
        throw new Error(
          "Không tìm thấy Learner ID. Hãy đảm bảo bạn đã có profile learner."
        );
      }

      console.log("LearnerID found:", actualLearnerId);

      const data = await getLearnerScheduleApi(actualLearnerId);
      console.log("Schedule data from API:", data);
      
      if (data.schedules && data.schedules.length > 0) {
        console.log("First schedule item:", {
          SessionTitle: data.schedules[0].SessionTitle,
          ZoomID: data.schedules[0].ZoomID,
          ZoomUUID: data.schedules[0].ZoomUUID,
          Zoompass: data.schedules[0].Zoompass,
          GeneratedZoomLink: generateZoomLink(data.schedules[0])
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

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fe" }}>
      <AppHeader />
      <ScheduleHeader />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card>
          <ScheduleTabs
            tabValue={tabValue}
            onTabChange={handleTabChange}
            schedules={schedules}
            groupedSchedules={groupSchedulesByDate(schedules)}
            parseDate={parseDate}
            generateZoomLink={generateZoomLink}
            canJoinZoom={canJoinZoom}
          />
        </Card>
      </Container>
    </Box>
  );
};

export default SchedulePage;