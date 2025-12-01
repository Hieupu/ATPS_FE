import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import ScheduleTab from "../components/class/tabs/ScheduleTab";
import AvailabilityTab from "../components/class/tabs/AvailabilityTab";

const BASE_URL = "http://localhost:9999/api/instructor";
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

export default function InstructorSchedulePage() {
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);

  const [sessions, setSessions] = useState([]);
  const [attendanceSheet, setAttendanceSheet] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [savingAttendance, setSavingAttendance] = useState(false);

  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await apiClient.get(`/schedule`);
        setSessions(res.data.Sessions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSchedule(false);
      }
    };
    fetchSchedule();
  }, []);

  const openAttendanceModal = async (session) => {
    setSelectedSession(session);
    const sessionId = session.sessionId;
    const classId = session.classId;

    if (!sessionId || sessionId <= 0 || !classId) {
      alert("Buổi học không có ID hợp lệ");
      return;
    }

    try {
      const res = await apiClient.get(
        `/classes/${classId}/sessions/${sessionId}/attendance`
      );
      setAttendanceSheet(res.data.AttendanceRecords || []);
    } catch (err) {
      console.error(err);
      alert("Không thể mở bảng điểm danh");
    }
  };

  const saveAttendance = async (updatedList) => {
    setSavingAttendance(true);
    const classId = selectedSession.classId;
    const sessionId = selectedSession.sessionId;

    try {
      await apiClient.post(
        `/classes/${classId}/sessions/${sessionId}/attendance`,
        updatedList
      );
      alert("Điểm danh thành công!");
      const res = await apiClient.get(`/schedule`);
      setSessions(res.data.Sessions || []);
      setSelectedSession(null);
      setAttendanceSheet(null);
    } catch (err) {
      alert("Lưu điểm danh thất bại");
    } finally {
      setSavingAttendance(false);
    }
  };

  const closeAttendanceModal = () => {
    setSelectedSession(null);
    setAttendanceSheet(null);
  };

  const handleFetchAvailability = async (startDate, endDate) => {
    setLoadingAvailability(true);
    try {
      const res = await apiClient.get("/availability", {
        params: { startDate, endDate },
      });
      setAvailabilitySlots(res.data.availability || []);
      setOccupiedSlots(res.data.occupied || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleSaveAvailability = async (startDate, endDate, slots) => {
    setSavingAvailability(true);
    try {
      await apiClient.post("/availability", {
        startDate,
        endDate,
        slots,
      });
      alert("Cập nhật lịch rảnh thành công!");
      await handleFetchAvailability(startDate, endDate);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu dữ liệu.");
    } finally {
      setSavingAvailability(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  if (loadingSchedule) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Đang tải dữ liệu...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📅 Quản Lý Thời Gian
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Xem lịch dạy và đăng ký thời gian rảnh của bạn
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tabIndex} onChange={handleTabChange}>
            <Tab label="Lịch Giảng Dạy (Teaching)" />
            <Tab label="Đăng Ký Lịch Rảnh (Availability)" />
          </Tabs>
        </Box>

        {tabIndex === 0 && (
          <ScheduleTab
            sessions={sessions}
            selectedSession={selectedSession}
            attendanceSheet={attendanceSheet}
            savingAttendance={savingAttendance}
            onOpenAttendance={openAttendanceModal}
            onSaveAttendance={saveAttendance}
            onCloseAttendance={closeAttendanceModal}
          />
        )}

        {tabIndex === 1 && (
          <AvailabilityTab
            existingSessions={occupiedSlots}
            availabilitySlots={availabilitySlots}
            loading={loadingAvailability}
            saving={savingAvailability}
            onFetchAvailability={handleFetchAvailability}
            onSaveAvailability={handleSaveAvailability}
          />
        )}
      </Paper>
    </Container>
  );
}
