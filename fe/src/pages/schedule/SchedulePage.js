import React, { useState, useEffect, useCallback } from "react";
import { Container, Box, Card, Tabs, Tab, Alert, CircularProgress, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { CalendarMonth, ViewList } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { getLearnerScheduleApi } from "../../apiServices/scheduleService";
import { getLearnerAttendanceApi } from "../../apiServices/attendanceService";
import { getLearnerIdFromAccount } from "../../utils/learnerUtils";
import AppHeader from "../../components/Header/AppHeader";
import ScheduleTabs from "./components/ScheduleTabs";
import ScheduleHeader from "./components/ScheduleHeader";
import WeeklyCalendarView from "./components/WeeklyCalendarView";
import { generateZoomLink, canJoinZoom, parseDate, groupSchedulesByDate } from "../../utils/scheduleUtils";

const SchedulePage = () => {
  const { user, isLearner } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'

  const fetchLearnerData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const accId = user.AccID || user.id || user.AccountID;

      if (!accId) {
        throw new Error("Không tìm thấy Account ID. Vui lòng đăng xuất và đăng nhập lại.");
      }

      const actualLearnerId = await getLearnerIdFromAccount(accId);

      if (!actualLearnerId) {
        throw new Error("Không tìm thấy Learner ID. Hãy đảm bảo bạn đã có profile learner.");
      }

      // Fetch both schedule and attendance data
      const [scheduleData, attendanceResult] = await Promise.all([
        getLearnerScheduleApi(actualLearnerId),
        getLearnerAttendanceApi(actualLearnerId)
      ]);

      console.log("Schedule data:", scheduleData);
      console.log("Attendance data:", attendanceResult);

      setSchedules(scheduleData.schedules || []);
      setAttendanceData(attendanceResult.attendance || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Không thể tải dữ liệu. Vui lòng đăng nhập lại.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && isLearner) {
      fetchLearnerData();
    } else {
      setError("Chỉ học viên mới có thể xem lịch học");
      setLoading(false);
    }
  }, [user, isLearner, fetchLearnerData]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
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
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            size="small"
          >
            <ToggleButton value="calendar" aria-label="calendar view">
              <CalendarMonth sx={{ mr: 1 }} />
              Lịch tuần
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <ViewList sx={{ mr: 1 }} />
              Danh sách
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Card>
          {viewMode === 'calendar' ? (
            <WeeklyCalendarView 
              schedules={schedules}
              attendanceData={attendanceData}
              generateZoomLink={generateZoomLink}
              canJoinZoom={canJoinZoom}
            />
          ) : (
            <ScheduleTabs
              tabValue={tabValue}
              onTabChange={handleTabChange}
              schedules={schedules}
              attendanceData={attendanceData}
              groupedSchedules={groupSchedulesByDate(schedules)}
              parseDate={parseDate}
              generateZoomLink={generateZoomLink}
              canJoinZoom={canJoinZoom}
            />
          )}
        </Card>
      </Container>
    </Box>
  );
};

export default SchedulePage;