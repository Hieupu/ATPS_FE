import React, { useEffect, useState, useCallback } from "react";
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
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";

const BASE_URL = `${process.env.REACT_APP_API_URL}/instructor`;
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
  const user = useAuth();

  const [sessions, setSessions] = useState([]);
  const [attendanceSheet, setAttendanceSheet] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [savingAttendance, setSavingAttendance] = useState(false);

  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);

  const fetchSchedule = useCallback(async () => {
    try {
      const res = await apiClient.get(`/schedule`);
      setSessions(res.data.Sessions || []);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải thời khóa biểu");
    } finally {
      setLoadingSchedule(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

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
      await fetchSchedule();
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
      toast.success("Lưu lịch rảnh thành công!");
      await handleFetchAvailability(startDate, endDate);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu lịch rảnh.");
    } finally {
      setSavingAvailability(false);
    }
  };

  const handleAddAvailability = async (slots) => {
    setSavingAvailability(true);
    try {
      await apiClient.post("/availability/add", {
        slots,
      });
      toast.success(`Đã đăng ký thêm thành công ${slots.length} buổi!`);
      return true;
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "Lỗi khi đăng ký lịch";
      toast.error(message);
    } finally {
      setSavingAvailability(false);
    }
  };

  const handleRequestChangeSchedule = async (payload) => {
    try {
      const res = await apiClient.post("/session/request-change", payload);
      toast.success(res.data.message || "Gửi yêu cầu đổi lịch thành công!");
      await fetchSchedule();
      return true;
    } catch (err) {
      console.error("Change schedule error:", err);
      const message =
        err.response?.data?.message || "Lỗi khi gửi yêu cầu đổi lịch.";
      toast.error(message);
      return false;
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleStartZoom = async (session) => {
    if (!session) return;
    const start = new Date(`${session.date}T${session.startTime}`);
    const now = new Date();
    const isWithin15MinBefore =
      now >= new Date(start.getTime() - 15 * 60 * 1000);

    const rawUser = localStorage.getItem("user");
    const currentUser = rawUser ? JSON.parse(rawUser) : {};
    const userId = user?.user?.id;
    const role = user?.user?.role;

    if (!userId) {
      toast.warn("Không xác định được người dùng.");
      return;
    }
    if (role !== "instructor" && role !== "learner") {
      toast.warn("Bạn không có quyền truy cập vào buổi học này.");
      return;
    }
    // if (role === "instructor" && !isWithin15MinBefore) {
    //   toast.warn(
    //     "Giảng viên chỉ có thể vào phòng học trong vòng 15 phút trước giờ bắt đầu."
    //   );
    //   return;
    // }

    const zoomId = session.ZoomID || session.zoomID || session.zoomId;
    const zoomPass =
      session.ZoomPass || session.zoomPass || session.zoom_pass || "";
    const className =
      session.className || session.ClassName || session.title || "Lớp học";

    if (!zoomId) {
      alert("Lỗi: Không tìm thấy Zoom ID trong buổi học này.");
      return;
    }

    const zoomPayload = {
      schedule: {
        ZoomID: zoomId,
        Zoompass: zoomPass,
        SessionID: session.sessionId,
        ClassName: className,
        Date: session.Date || session.date,
        StartTime: session.StartTime || session.startTime,
      },
      userId: currentUser.id,
      userRole: currentUser.role || "instructor",
      userName: currentUser.username || currentUser.fullname || "Giảng viên",
      email: currentUser.email,
      timestamp: new Date().getTime(),
    };

    localStorage.setItem("zoomScheduleData", JSON.stringify(zoomPayload));

    await axios.post(`${process.env.REACT_APP_API_URL}/zoom/webhook`, {
          sessionId: session.sessionId,
          accId: userId,
          userRole: role,
          userName: user.user.username,
          startTime: session.startTime,
          endTime: session.endTime,
          date: session.date,
          zoomId: zoomId,
        });

    setTimeout(() => {
      let url = `/zoom?zoomId=${zoomId}`;
      window.open(url, "_blank");
    }, 100);
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
            Quản Lý Thời Khóa Biểu
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
            onStartZoom={handleStartZoom}
            onRequestChangeSchedule={handleRequestChangeSchedule}
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
            onAddAvailability={handleAddAvailability}
          />
        )}
      </Paper>
    </Container>
  );
}
