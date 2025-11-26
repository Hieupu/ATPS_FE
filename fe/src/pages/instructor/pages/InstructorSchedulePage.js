import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Paper,
} from "@mui/material";
import ScheduleTab from "../components/class/tabs/ScheduleTab";

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

  const [sessions, setSessions] = useState([]);
  const [attendanceSheet, setAttendanceSheet] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await apiClient.get(`/schedule`);

        setSessions(res.data.Sessions || []);
      } catch (err) {
        console.error("Lỗi tải lịch giảng dạy:", err);
        alert("Không thể tải lịch giảng dạy");
      } finally {
        setLoading(false);
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
      console.error("Lỗi tải bảng điểm danh:", err);
      alert("Không thể mở bảng điểm danh");
    }
  };

  // 3. Lưu điểm danh
  const saveAttendance = async (updatedList) => {
    setSaving(true);
    const classId = selectedSession.classId;
    const sessionId = selectedSession.sessionId;

    try {
      await apiClient.post(
        `/classes/${classId}/sessions/${sessionId}/attendance`,
        updatedList
      );
      alert("Điểm danh thành công!");

      // Refresh lại toàn bộ lịch
      const res = await apiClient.get(`/schedule`);
      setSessions(res.data.Sessions || []);

      setSelectedSession(null);
      setAttendanceSheet(null);
    } catch (err) {
      alert("Lưu điểm danh thất bại");
    } finally {
      setSaving(false);
    }
  };

  const closeAttendanceModal = () => {
    setSelectedSession(null);
    setAttendanceSheet(null);
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Đang tải lịch giảng dạy...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📅 Lịch Giảng Dạy
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Toàn bộ thời khóa biểu và điểm danh của bạn
          </Typography>
        </Box>

        {/* Schedule Tab - tái sử dụng component */}
        <ScheduleTab
          sessions={sessions}
          selectedSession={selectedSession}
          attendanceSheet={attendanceSheet}
          savingAttendance={saving}
          onOpenAttendance={openAttendanceModal}
          onSaveAttendance={saveAttendance}
          onCloseAttendance={closeAttendanceModal}
        />
      </Paper>
    </Container>
  );
}
