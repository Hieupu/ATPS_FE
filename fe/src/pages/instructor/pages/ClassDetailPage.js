import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Box, Typography, CircularProgress } from "@mui/material";
import { toast } from "react-toastify"; // Import toast

import ClassDetailLayout from "../components/class/ClassDetailLayout";

import OverviewTab from "../components/class/tabs/OverviewTab";
import StudentsTab from "../components/class/tabs/StudentsTab";
import ScheduleTab from "../components/class/tabs/ScheduleTab";

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

export default function ClassDetailPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State cho dữ liệu
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [attendanceSheet, setAttendanceSheet] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const initialTab = parseInt(searchParams.get("tab")) || 0;
  const [activeTab, setActiveTab] = useState(initialTab);

  // 1. Lấy chi tiết lớp
  useEffect(() => {
    const fetchClassDetail = async () => {
      try {
        const res = await apiClient.get(`/classes/${classId}`);
        setClassData(res.data);
      } catch (err) {
        console.error(err);
        alert("Không thể tải thông tin lớp");
      }
    };
    fetchClassDetail();
  }, [classId]);

  // 3. Lấy danh sách học viên
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await apiClient.get(`/classes/${classId}/students`);
        setStudents(res.data.Students || []);
      } catch (err) {
        console.error("Lỗi tải danh sách học viên:", err);
      }
    };
    if (classId) fetchStudents();
  }, [classId]);

  // 4. Lấy thời khóa biểu (Đưa ra ngoài useEffect để dùng lại)
  const fetchSchedule = useCallback(async () => {
    try {
      const res = await apiClient.get(`/classes/${classId}/schedule`);
      setSessions(res.data.Sessions || []);
    } catch (err) {
      console.error("Lỗi tải lịch học:", err);
    }
  }, [classId]);

  useEffect(() => {
    if (classId) fetchSchedule();
  }, [fetchSchedule, classId]);

  // --- HÀM XỬ LÝ ĐỔI LỊCH (MỚI THÊM) ---
  const handleRequestChangeSchedule = async (payload) => {
    try {
      const res = await apiClient.post("/session/request-change", payload);
      toast.success(res.data.message || "Gửi yêu cầu đổi lịch thành công!");

      // Load lại lịch để hiện trạng thái Pending
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

  // 5. Mở modal điểm danh
  const openAttendanceModal = async (session) => {
    setSelectedSession(session);
    const sessionId = session.sessionId;

    if (!sessionId || sessionId <= 0) {
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

  // 6. Lưu điểm danh
  const saveAttendance = async (updatedList) => {
    setSaving(true);
    try {
      await apiClient.post(
        `/classes/${classId}/sessions/${selectedSession.sessionId}/attendance`,
        updatedList
      );
      alert("Điểm danh thành công!");

      await fetchSchedule(); // Load lại lịch sau khi điểm danh

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

  // Loading chung
  useEffect(() => {
    if (classData) setLoading(false);
  }, [classData]);

  //load zoom
  const handleStartZoom = () => {
    if (!classData || !classData.zoomMeetingId) {
      alert("Chưa có thông tin phòng Zoom cho lớp học này!");
      return;
    }

    const rawUser = localStorage.getItem("user");
    const currentUser = rawUser ? JSON.parse(rawUser) : {};

    const zoomPayload = {
      schedule: {
        ZoomID: classData.zoomMeetingId,
        Zoompass: classData.zoomPassword,
        ClassName: classData.className,
        CourseTitle: classData.course?.title,

        Date: new Date().toISOString().split("T")[0],
        StartTime: new Date().toTimeString().split(" ")[0],
      },

      userId: currentUser.id,
      userName: currentUser.username || currentUser.fullname || "Giảng viên",
      email: currentUser.email,
      userRole: currentUser.role || "instructor",

      timestamp: new Date().getTime(),
    };

    localStorage.setItem("zoomScheduleData", JSON.stringify(zoomPayload));

    setTimeout(() => {
      let url = `/zoom/${classData.zoomMeetingId}`;
      if (classData.zoomPassword) {
        url += `/${classData.zoomPassword}`;
      }
      window.open(url, "_blank");
    }, 100);
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Đang tải chi tiết lớp...</Typography>
      </Box>
    );
  }

  if (!classData) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="error">Không tìm thấy lớp học</Typography>
      </Box>
    );
  }

  return (
    <ClassDetailLayout
      classData={classData}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onBack={() => navigate(-1)}
    >
      {/* Tab 0: Tổng quan */}
      {activeTab === 0 && (
        <OverviewTab classData={classData} onStartZoom={handleStartZoom} />
      )}

      {/* Tab 1: Học viên */}
      {activeTab === 1 && <StudentsTab students={students} />}

      {/* Tab 2: Thời khóa biểu & Điểm danh */}
      {activeTab === 2 && (
        <ScheduleTab
          sessions={sessions}
          selectedSession={selectedSession}
          attendanceSheet={attendanceSheet}
          savingAttendance={saving}
          onOpenAttendance={openAttendanceModal}
          onSaveAttendance={saveAttendance}
          onCloseAttendance={closeAttendanceModal}
          onStartZoom={handleStartZoom}
          onRequestChangeSchedule={handleRequestChangeSchedule}
        />
      )}
    </ClassDetailLayout>
  );
}
