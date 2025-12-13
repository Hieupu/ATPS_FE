import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Stack,
} from "@mui/material";
import { ChevronLeft, ChevronRight, ArrowBack } from "@mui/icons-material";
import dayjs from "dayjs";
import classService from "../../../apiServices/classService";
import { getAttendanceByInstructorApi } from "../../../apiServices/attendanceService";

const InstructorSchedulePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const instructorId = searchParams.get("instructorId");
  const instructorName = searchParams.get("instructorName") || "";

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [sessions, setSessions] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [timeslots, setTimeslots] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy timeslots từ API
  useEffect(() => {
    const loadTimeslots = async () => {
      try {
        const response = await classService.getAllTimeslots({ limit: 500 });
        setTimeslots(response?.data || []);
      } catch (error) {
        // Silent fail for timeslots
      }
    };
    loadTimeslots();
  }, []);

  // Lấy sessions và leaves của instructor
  useEffect(() => {
    if (!instructorId) return;

    const loadSchedule = async () => {
      try {
        setLoading(true);
        setError(null);

        // Tính toán date range cho tuần hiện tại
        const weekStart = getWeekStart(currentDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const startDateStr = dayjs(weekStart).format("YYYY-MM-DD");
        const endDateStr = dayjs(weekEnd).format("YYYY-MM-DD");

        // Lấy sessions
        let sessionsData = [];
        try {
          sessionsData = await classService.getSessionsByInstructorId(
            instructorId
          );

          // Normalize data structure
          if (sessionsData?.data && Array.isArray(sessionsData.data)) {
            sessionsData = sessionsData.data;
          } else if (!Array.isArray(sessionsData)) {
            sessionsData = [];
          }
        } catch (sessionError) {
          // Kiểm tra nếu là lỗi connection
          if (
            sessionError?.code === "ERR_NETWORK" ||
            sessionError?.message?.includes("CONNECTION_REFUSED") ||
            sessionError?.message?.includes("Network Error")
          ) {
            setError(
              "Không thể kết nối đến server. Vui lòng kiểm tra backend server đã được khởi động chưa."
            );
            setSessions([]);
            setLeaves([]);
            setAttendanceData([]);
            return;
          }
          sessionsData = [];
        }

        // Filter sessions trong tuần hiện tại
        const filteredSessions = (sessionsData || []).filter((session) => {
          if (!session.Date) return false;
          const sessionDate = dayjs(session.Date).startOf("day");
          const start = dayjs(weekStart).startOf("day");
          const end = dayjs(weekEnd).startOf("day");
          return !sessionDate.isBefore(start) && !sessionDate.isAfter(end);
        });
        setSessions(filteredSessions);

        // Lấy leaves
        let leavesItems = [];
        try {
          const leavesData = await classService.getInstructorLeaves({
            InstructorID: instructorId,
            StartDate: startDateStr,
            EndDate: endDateStr,
            limit: 1000,
          });

          // Xử lý nhiều cấu trúc response có thể có
          if (leavesData?.data?.items) {
            leavesItems = leavesData.data.items;
          } else if (leavesData?.items) {
            leavesItems = leavesData.items;
          } else if (Array.isArray(leavesData)) {
            leavesItems = leavesData;
          } else if (leavesData?.data && Array.isArray(leavesData.data)) {
            leavesItems = leavesData.data;
          }
        } catch (leaveError) {
          // Không block nếu lỗi leaves
          leavesItems = [];
        }
        setLeaves(leavesItems);

        // Lấy attendance data (optional - không block nếu lỗi)
        try {
          const attendanceResponse = await getAttendanceByInstructorApi(
            instructorId
          );
          const attendanceList =
            attendanceResponse?.data || attendanceResponse || [];
          setAttendanceData(attendanceList);
        } catch (attendanceError) {
          // Không hiển thị lỗi nếu 404 - có thể chưa có attendance data
          setAttendanceData([]);
        }
      } catch (error) {
        setError(
          error?.message ||
            "Có lỗi xảy ra khi tải lịch giảng dạy. Vui lòng thử lại."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [instructorId, currentDate]);

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      return date;
    });
  }, [weekStart]);

  // Tạo timeSlots từ timeslots data
  const timeSlots = useMemo(() => {
    if (!timeslots.length) return [];

    // Nhóm timeslots theo thứ và sắp xếp theo StartTime
    const slotsByDay = {};
    timeslots.forEach((ts) => {
      const day = ts.Day || ts.day;
      if (!slotsByDay[day]) {
        slotsByDay[day] = [];
      }
      slotsByDay[day].push(ts);
    });

    // Lấy tất cả các timeslot unique (có thể có cùng StartTime/EndTime ở các thứ khác nhau)
    const uniqueSlots = [];
    const seenSlots = new Set();

    timeslots.forEach((ts) => {
      const key = `${ts.StartTime}-${ts.EndTime}`;
      if (!seenSlots.has(key)) {
        seenSlots.add(key);
        uniqueSlots.push({
          label: `${ts.StartTime} - ${ts.EndTime}`,
          start: ts.StartTime,
          end: ts.EndTime,
          timeslotId: ts.TimeslotID,
        });
      }
    });

    // Sắp xếp theo StartTime
    uniqueSlots.sort((a, b) => {
      const timeA = a.start.split(":").map(Number);
      const timeB = b.start.split(":").map(Number);
      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
    });

    return uniqueSlots;
  }, [timeslots]);

  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  // Map day label từ date sang format trong timeslots
  const getDayLabel = (date) => {
    const dayNames = {
      0: "SUN",
      1: "MON",
      2: "TUE",
      3: "WED",
      4: "THU",
      5: "FRI",
      6: "SAT",
    };
    const dayIndex = date.getDay();
    const dayName = dayNames[dayIndex];

    // Map sang format trong database (có thể là "Thứ 2", "T2", etc.)
    const dayMap = {
      MON: ["Thứ 2", "T2", "Monday", "MON"],
      TUE: ["Thứ 3", "T3", "Tuesday", "TUE"],
      WED: ["Thứ 4", "T4", "Wednesday", "WED"],
      THU: ["Thứ 5", "T5", "Thursday", "THU"],
      FRI: ["Thứ 6", "T6", "Friday", "FRI"],
      SAT: ["Thứ 7", "T7", "Saturday", "SAT"],
      SUN: ["Chủ nhật", "CN", "Sunday", "SUN"],
    };

    return dayMap[dayName] || [dayName];
  };

  // Tạo schedule grid từ sessions và leaves
  const scheduleGrid = useMemo(() => {
    const grid = {};

    // Tạo map TimeslotID -> timeslot data để lookup nhanh
    const timeslotMap = new Map();
    timeslots.forEach((ts) => {
      timeslotMap.set(ts.TimeslotID, ts);
    });

    // Helper function để normalize time format (HH:mm hoặc HH:mm:ss -> HH:mm)
    const normalizeTime = (timeStr) => {
      if (!timeStr) return "";
      // Lấy 5 ký tự đầu (HH:mm)
      return timeStr.substring(0, 5);
    };

    const attendanceMap = new Map();
    attendanceData.forEach((attendance) => {
      const sessionId = attendance.SessionID;
      if (sessionId) {
        if (!attendanceMap.has(sessionId)) {
          attendanceMap.set(sessionId, []);
        }
        attendanceMap.get(sessionId).push(attendance);
      }
    });

    // Thêm sessions vào grid
    sessions.forEach((session) => {
      const sessionDate = dayjs(session.Date);
      const dateStr = sessionDate.format("YYYY-MM-DD");

      // Lấy StartTime từ session hoặc từ timeslot
      let startTime = normalizeTime(session.StartTime) || "";

      // Nếu không có StartTime, thử lấy từ TimeslotID
      if (!startTime && session.TimeslotID) {
        const ts = timeslotMap.get(session.TimeslotID);
        if (ts) {
          startTime = normalizeTime(ts.StartTime) || "";
        }
      }

      if (startTime) {
        // Tìm slot index dựa trên StartTime (normalize cả hai để so sánh)
        const slotIndex = timeSlots.findIndex((slot) => {
          const slotStart = normalizeTime(slot.start);
          return slotStart === startTime;
        });

        if (slotIndex !== -1) {
          const key = `${dateStr}-${slotIndex}`;
          if (!grid[key]) grid[key] = [];

          const attendances = attendanceMap.get(session.SessionID) || [];
          const attendance = attendances.length > 0 ? attendances[0] : null;

          grid[key].push({
            type: "session",
            ...session,
            attendance: attendance,
          });
        }
      }
    });

    // Thêm leaves vào grid (chỉ khi không có session trong ca đó)
    // Sử dụng Set để tránh duplicate leaves
    const processedLeaves = new Set();

    leaves.forEach((leave) => {
      // Tạo unique key để tránh duplicate
      const leaveKey = `${leave.Date}-${leave.TimeslotID || "full"}-${
        leave.Status || ""
      }`;
      if (processedLeaves.has(leaveKey)) {
        return;
      }
      processedLeaves.add(leaveKey);

      const leaveDate = dayjs(leave.Date);
      const dateStr = leaveDate.format("YYYY-MM-DD");

      // Lấy StartTime từ leave hoặc từ timeslot dựa trên TimeslotID
      let startTime = normalizeTime(leave.StartTime) || "";

      if (!startTime && leave.TimeslotID) {
        const ts = timeslotMap.get(leave.TimeslotID);
        if (ts) {
          startTime = normalizeTime(ts.StartTime) || "";
        }
      }

      if (startTime) {
        // Leave có timeslot cụ thể
        const slotIndex = timeSlots.findIndex((slot) => {
          const slotStart = normalizeTime(slot.start);
          return slotStart === startTime;
        });

        if (slotIndex !== -1) {
          const key = `${dateStr}-${slotIndex}`;

          // Kiểm tra xem đã có session trong ca này chưa - nếu có thì không thêm leave
          const hasSession = grid[key]?.some((item) => item.type === "session");
          if (hasSession) {
            return;
          }

          if (!grid[key]) grid[key] = [];
          grid[key].push({
            type: "leave",
            ...leave,
          });
        }
      } else {
        // Leave chặn toàn bộ ngày - thêm vào tất cả slots của ngày đó (chỉ khi không có session)
        timeSlots.forEach((slot, slotIndex) => {
          const key = `${dateStr}-${slotIndex}`;

          // Kiểm tra xem đã có session trong ca này chưa - nếu có thì không thêm leave
          const hasSession = grid[key]?.some((item) => item.type === "session");
          if (hasSession) {
            return;
          }

          if (!grid[key]) grid[key] = [];
          grid[key].push({
            type: "leave",
            ...leave,
            isFullDay: true,
          });
        });
      }
    });

    return grid;
  }, [sessions, leaves, timeSlots, timeslots, attendanceData, weekDates]);

  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleYearChange = (event) => {
    const year = event.target.value;
    setSelectedYear(year);

    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
  };

  const formatDateRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${
      end.getMonth() + 1
    }/${end.getFullYear()}`;
  };

  const getAttendanceStatus = (session, attendance) => {
    if (!session || !session.Date) {
      return { text: "Chưa có dữ liệu", color: "#9e9e9e" };
    }

    const sessionDate = dayjs(session.Date);
    const today = dayjs().startOf("day");

    // Chưa đến ngày
    if (sessionDate.isAfter(today)) {
      return { text: "Not yet", color: "#9e9e9e" };
    }

    // Đã qua ngày - kiểm tra attendance
    if (attendance && attendance.Status) {
      const status = String(attendance.Status).toUpperCase();
      if (status === "PRESENT") {
        return { text: "Có mặt", color: "#2e7d32", fontWeight: 700 };
      } else if (status === "ABSENT") {
        return { text: "Vắng", color: "#d32f2f" };
      } else if (status === "LATE") {
        return { text: "Muộn", color: "#f57c00" };
      }
    }

    // Đã qua ngày nhưng không có attendance record = vắng
    return { text: "Vắng", color: "#d32f2f" };
  };

  const renderScheduleCard = (item, slot, idx) => {
    const isLeave = item.type === "leave";
    const isFullDayLeave = item.isFullDay;
    const isAvailable =
      isLeave && (item.Status === "AVAILABLE" || item.Status === "available");

    // Xác định màu sắc và text cho leave
    let leaveColor = "#f44336";
    let leaveBgColor = "#ffebee";
    let leaveText = "Bận riêng";

    if (isAvailable) {
      leaveColor = "#1976d2";
      leaveBgColor = "#e3f2fd";
      leaveText = "Đăng ký dạy thêm";
    } else if (item.Status === "HOLIDAY" || item.Status === "holiday") {
      leaveColor = "#ff9800";
      leaveBgColor = "#fff3e0";
      leaveText = "Nghỉ lễ";
    }

    const attendanceStatus = !isLeave
      ? getAttendanceStatus(item, item.attendance)
      : null;

    return (
      <Paper
        key={idx}
        elevation={2}
        sx={{
          p: 1.5,
          mb: 1,
          borderLeft: 4,
          borderColor: isLeave ? leaveColor : "#4caf50",
          bgcolor: isLeave ? leaveBgColor : "#e8f5e9",
          "&:hover": {
            boxShadow: 4,
          },
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: isLeave ? leaveColor : "#2e7d32",
            mb: 0.5,
            fontSize: "0.85rem",
          }}
        >
          {isLeave ? leaveText : item.ClassName || item.Name || "Lịch dạy"}
        </Typography>

        {!isLeave && (
          <>
            {/* Hiển thị attendance status ngay dưới tên lớp - luôn hiển thị cho session */}
            {attendanceStatus && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  color: attendanceStatus.color,
                  fontWeight: attendanceStatus.fontWeight || 500,
                  mb: 0.5,
                  fontSize: "0.75rem",
                }}
              >
                {attendanceStatus.text}
              </Typography>
            )}

            {item.Location && (
              <Typography
                variant="caption"
                sx={{ display: "block", color: "text.secondary", mt: 0.5 }}
              >
                tại {item.Location}
              </Typography>
            )}
          </>
        )}

        {isFullDayLeave && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "text.secondary",
              fontStyle: "italic",
            }}
          >
            Cả ngày
          </Typography>
        )}

        {isLeave && item.Note && (
          <Typography
            variant="caption"
            sx={{ display: "block", color: "text.secondary", mt: 0.5 }}
          >
            {item.Note}
          </Typography>
        )}
      </Paper>
    );
  };

  if (!instructorId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Không tìm thấy thông tin giảng viên. Vui lòng chọn giảng viên từ danh
          sách.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }} style={{ padding: "0px" }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/admin/users/instructors")}
        variant="outlined"
        size="small"
      >
        Quay lại
      </Button>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
            Lịch giảng dạy
          </Typography>
          {instructorName && (
            <Typography variant="body1" color="text.secondary">
              Giảng viên: <strong>{instructorName}</strong>
            </Typography>
          )}
        </Box>
      </Stack>

      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontWeight: 600, color: "#f44336", minWidth: 50 }}>
            NĂM
          </Typography>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={selectedYear}
              onChange={handleYearChange}
              sx={{ bgcolor: "white" }}
            >
              {[2023, 2024, 2025, 2026, 2027].map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontWeight: 600, minWidth: 50 }}>TUẦN</Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: "white",
              border: "1px solid #ccc",
              borderRadius: 1,
            }}
          >
            <IconButton onClick={handlePreviousWeek} size="small">
              <ChevronLeft />
            </IconButton>
            <Typography sx={{ px: 2, minWidth: 200, textAlign: "center" }}>
              {formatDateRange()}
            </Typography>
            <IconButton onClick={handleNextWeek} size="small">
              <ChevronRight />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 6,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ border: "1px solid #ddd" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ bgcolor: "#f5f5f5", fontWeight: 600, width: 150 }}
                >
                  Ca học
                </TableCell>
                {daysOfWeek.map((day, index) => (
                  <TableCell
                    key={day}
                    align="center"
                    sx={{
                      bgcolor:
                        day === "SAT" || day === "SUN" ? "#fce4ec" : "#e3f2fd",
                      fontWeight: 600,
                      py: 1,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {day}
                    </Typography>
                    <Typography variant="body2">
                      {weekDates[index].getDate()}/
                      {weekDates[index].getMonth() + 1}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {timeSlots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Đang tải dữ liệu ca học...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                timeSlots.map((slot, slotIndex) => (
                  <TableRow key={slotIndex}>
                    <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: 600 }}>
                      <Typography variant="body2">{slot.label}</Typography>
                    </TableCell>
                    {weekDates.map((date, dayIndex) => {
                      const dateStr = dayjs(date).format("YYYY-MM-DD");
                      const key = `${dateStr}-${slotIndex}`;
                      const cellSchedules = scheduleGrid[key] || [];

                      return (
                        <TableCell
                          key={dayIndex}
                          sx={{
                            p: 1,
                            verticalAlign: "top",
                            bgcolor:
                              cellSchedules.length > 0 ? "#fff" : "#fafafa",
                            minHeight: 80,
                          }}
                        >
                          {cellSchedules.length > 0 ? (
                            cellSchedules.map((schedule, idx) =>
                              renderScheduleCard(schedule, slot, idx)
                            )
                          ) : (
                            <Typography
                              variant="body2"
                              align="center"
                              sx={{ color: "#999" }}
                            >
                              -
                            </Typography>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              bgcolor: "#4caf50",
              borderRadius: 0.5,
            }}
          />
          <Typography variant="body2">Lịch dạy</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              bgcolor: "#1976d2",
              borderRadius: 0.5,
            }}
          />
          <Typography variant="body2">Đăng ký dạy thêm</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              bgcolor: "#ff9800",
              borderRadius: 0.5,
            }}
          />
          <Typography variant="body2">Nghỉ lễ</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default InstructorSchedulePage;
