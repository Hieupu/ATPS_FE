import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from "@mui/material";
import { DateRange, School, Class, CalendarMonth } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import {
  getLearnerAttendanceApi,
  getAttendanceStatsApi,
} from "../../apiServices/attendanceService";
import { getLearnerIdFromAccount } from "../../utils/learnerUtils";
import AppHeader from "../../components/Header/AppHeader";
import AttendanceTable from "./components/AttendanceTable";
import PageHeader from "./components/PageHeader";
import AttendanceByClass from "./components/AttendanceByClass";
import AttendanceCalendar from "./components/AttendanceCalendar";

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

// Hàm dịch trạng thái sang tiếng Việt
const translateStatus = (status) => {
  switch (status?.toLowerCase()) {
    case 'present':
      return 'Có mặt';
    case 'absent':
      return 'Vắng';
    case 'notyet':
      return 'Chưa điểm danh';
    default:
      return status || 'Không xác định';
  }
};

// Hàm sắp xếp dữ liệu theo ngày tăng dần (sớm nhất đến muộn nhất)
const sortAttendanceByDate = (attendanceData) => {
  return [...attendanceData].sort((a, b) => {
    const dateA = new Date(a.SessionDate);
    const dateB = new Date(b.SessionDate);
    return dateA - dateB; // Sắp xếp tăng dần (sớm nhất trước)
  });
};

// Hàm xử lý dữ liệu: sắp xếp và dịch trạng thái
const processAttendanceData = (attendanceData) => {
  if (!attendanceData || !Array.isArray(attendanceData)) return [];
  
  // Sắp xếp theo ngày tăng dần
  const sortedData = sortAttendanceByDate(attendanceData);
  
  // Dịch trạng thái sang tiếng Việt
  return sortedData.map(item => ({
    ...item,
    StatusText: translateStatus(item.Status)
  }));
};

const AttendancePage = () => {
  const { user, isLearner } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [processedAttendance, setProcessedAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [filterStatus, setFilterStatus] = useState("all");
  const [learnerId, setLearnerId] = useState(null);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const accId = user.AccID || user.id || user.AccountID;

      if (!accId) {
        throw new Error("Không tìm thấy Account ID. Vui lòng đăng xuất và đăng nhập lại.");
      }

      const learnerIdValue = await getLearnerIdFromAccount(accId);

      if (!learnerIdValue) {
        throw new Error("Không tìm thấy Learner ID. Hãy đảm bảo bạn đã có profile learner.");
      }

      setLearnerId(learnerIdValue);

      const [attendanceData, statsData] = await Promise.all([
        getLearnerAttendanceApi(learnerIdValue),
        getAttendanceStatsApi(learnerIdValue),
      ]);

      console.log("attendanceData", attendanceData);

      // Lưu dữ liệu gốc
      setAttendance(attendanceData.attendance || []);
      
      // Xử lý dữ liệu: sắp xếp và dịch
      const processedData = processAttendanceData(attendanceData.attendance || []);
      setProcessedAttendance(processedData);
      
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError(err.message || "Không thể tải thông tin điểm danh.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && isLearner) {
      fetchAttendance();
    } else {
      setError("Chỉ học viên mới có thể xem điểm danh");
      setLoading(false);
    }
  }, [user, isLearner, fetchAttendance]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  // Phân loại dữ liệu đã xử lý
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAttendance = processedAttendance.filter((item) => {
    const sessionDate = new Date(item.SessionDate);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate >= today;
  });

  const pastAttendance = processedAttendance.filter((item) => {
    const sessionDate = new Date(item.SessionDate);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate < today;
  });

  const filteredUpcoming = upcomingAttendance.filter(
    (item) => filterStatus === "all" || item.Status.toLowerCase() === filterStatus
  );

  const filteredPast = pastAttendance.filter(
    (item) => filterStatus === "all" || item.Status.toLowerCase() === filterStatus
  );

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

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fe" }}>
      <AppHeader />
      <PageHeader />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab
              icon={<DateRange />}
              iconPosition="start"
              label={`Sắp tới (${upcomingAttendance.length})`}
            />
            <Tab
              icon={<School />}
              iconPosition="start"
              label={`Đã qua (${pastAttendance.length})`}
            />
            <Tab icon={<Class />} iconPosition="start" label="Theo lớp" />
            <Tab icon={<CalendarMonth />} iconPosition="start" label="Lịch" />
          </Tabs>
        </Paper>

        <TabPanel value={tabValue} index={0}>
          <AttendanceTable
            attendance={filteredUpcoming}
            filterStatus={filterStatus}
            onFilterChange={handleFilterChange}
            isPast={false}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <AttendanceTable
            attendance={filteredPast}
            filterStatus={filterStatus}
            onFilterChange={handleFilterChange}
            isPast={true}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {learnerId && (
            <AttendanceByClass
              learnerId={learnerId}
              attendance={processedAttendance} // Truyền dữ liệu đã xử lý
            />
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {learnerId && <AttendanceCalendar learnerId={learnerId} />}
        </TabPanel>
      </Container>
    </Box>
  );
};

export default AttendancePage;