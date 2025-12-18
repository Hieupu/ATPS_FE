import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  isSameDay,
  addDays,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { vi } from "date-fns/locale";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  Add,
  CalendarToday,
} from "@mui/icons-material";
import classService from "../../../apiServices/classService";
import { useAuth } from "../../../contexts/AuthContext";
import { dayOfWeekToDay, getDayFromDate } from "../../../utils/validate";
import SessionSuggestionModal from "../components/class-management/SessionSuggestionModal";
import ClassSessionScheduleModal from "../components/class-management/ClassSessionScheduleModal";
import dayjs from "dayjs";
import "./style.css";

const SchedulePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeslots, setTimeslots] = useState([]);

  // Xác định role hiện tại (admin / staff) dựa trên AuthContext + URL
  const userRole =
    user?.role || (location.pathname.startsWith("/staff") ? "staff" : "admin");
  const isStaff = userRole === "staff";

  // Reschedule modal state (dùng chung ClassSessionScheduleModal)
  const [rescheduleModal, setRescheduleModal] = useState({
    open: false,
    session: null, // schedule đang được đổi lịch
  });

  // Conflict modal state
  const [conflictModal, setConflictModal] = useState({
    open: false,
    type: "single", // 'single' or 'bulk'
    conflicts: [],
    created: [],
    summary: null,
  });

  // Suggestion modal state (cho bù tự động)
  const [suggestionModal, setSuggestionModal] = useState({
    open: false,
    suggestions: [],
    classId: null,
  });
  const [suggestionFetching, setSuggestionFetching] = useState(false);
  const [suggestionApplying, setSuggestionApplying] = useState(false);

  // Multiple sessions input for selected date - sử dụng TimeslotID
  const [sessions, setSessions] = useState([{ TimeslotID: "" }]);

  useEffect(() => {
    loadData();
  }, [courseId]);

  // Lọc timeslots theo Day của ngày được chọn (tương tự bước 3)
  const filteredTimeslots = useMemo(() => {
    if (!selectedDate || !timeslots || timeslots.length === 0) {
      return timeslots;
    }

    // Lấy Day của ngày được chọn
    const selectedDay = getDayFromDate(format(selectedDate, "yyyy-MM-dd"));

    // Lọc timeslots có Day trùng với ngày được chọn
    return timeslots.filter((timeslot) => {
      const timeslotDay = timeslot.Day || timeslot.day;
      return timeslotDay === selectedDay;
    });
  }, [selectedDate, timeslots]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load timeslots từ database (lấy tối đa 500 ca mỗi lần)
      const timeslotResponse = await classService.getAllTimeslots({
        limit: 500,
      });
      const timeslotsData = Array.isArray(timeslotResponse?.data)
        ? timeslotResponse.data
        : [];
      setTimeslots(timeslotsData);

      const classData = await classService.getClassById(courseId);
      setCourse(classData);

      // Load schedules từ API - sử dụng API đặc biệt cho frontend
      try {
        // Ưu tiên dùng API đặc biệt cho frontend (đã format sẵn StartTime, EndTime)
        const sessionsData = await classService.getClassSessionsForFrontend(
          courseId
        );
        if (Array.isArray(sessionsData) && sessionsData.length > 0) {
          // API này đã trả về StartTime và EndTime sẵn trong mỗi session
          const formattedSchedules = sessionsData.map((session) => ({
            id: session.SessionID || session.id,
            date: session.Date || session.date,
            startTime: session.StartTime || "",
            endTime: session.EndTime || "",
            courseId: parseInt(courseId),
            sessionId: session.SessionID || session.id,
            timeslotId: session.TimeslotID,
          }));
          setSchedules(formattedSchedules);
        } else {
          // Fallback: dùng API thông thường nếu API đặc biệt không có data
          const fallbackSessions = await classService.getSessionsByClassId(
            courseId
          );
          if (Array.isArray(fallbackSessions) && fallbackSessions.length > 0) {
            const formattedSchedules = fallbackSessions.map((session) => {
              const timeslot = timeslotsData?.find(
                (ts) =>
                  (ts.TimeslotID || ts.id) ===
                  (session.TimeslotID || session.Timeslot?.TimeslotID)
              );
              return {
                id: session.SessionID || session.id,
                date: session.Date || session.date,
                startTime: timeslot?.StartTime || session.StartTime || "",
                endTime: timeslot?.EndTime || session.EndTime || "",
                courseId: parseInt(courseId),
                sessionId: session.SessionID || session.id,
                timeslotId: session.TimeslotID,
              };
            });
            setSchedules(formattedSchedules);
          } else {
            setSchedules([]);
          }
        }
      } catch (error) {
        console.warn("Could not load sessions, using empty array");
        setSchedules([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      alert(" Không thể tải thông tin lớp học!");
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const getSchedulesForDate = (date) => {
    return schedules.filter((sch) => isSameDay(new Date(sch.date), date));
  };

  const handleDateClick = (date) => {
    if (!isSameMonth(date, currentMonth)) return;
    setSelectedDate(date);
    // Scroll xuống phần session-selector
    setTimeout(() => {
      document.querySelector(".session-selector")?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 100);
  };

  // Get timeslot by ID
  const getTimeslotById = (timeslotId) => {
    return timeslots.find((ts) => (ts.TimeslotID || ts.id) === timeslotId);
  };

  const isDatePast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  // Helper function để parse conflict từ error message
  const parseConflictFromMessage = (message, totalSessions) => {
    const conflicts = [];

    // Tìm pattern: "Session X: ..." hoặc lỗi conflict
    const sessionPattern = /Session\s+(\d+):\s*(.+?)(?=Session\s+\d+:|$)/g;
    let match;

    while ((match = sessionPattern.exec(message)) !== null) {
      const sessionIndex = parseInt(match[1]);
      const conflictText = match[2].trim();

      if (conflictText) {
        // Parse thông tin từ message
        const classNameMatch = conflictText.match(/Lớp\s+"([^"]+)"/);
        const sessionTitleMatch = conflictText.match(/session\s+"([^"]+)"/i);
        const dateMatch = conflictText.match(/(\d{4}-\d{2}-\d{2})/);
        const timeMatch = conflictText.match(
          /(\d{2}:\d{2}:\d{2})\s*-\s*(\d{2}:\d{2}:\d{2})/
        );
        const instructorMatch = conflictText.match(/Instructor/);

        conflicts.push({
          sessionIndex: sessionIndex,
          conflictType: instructorMatch ? "instructor" : "class",
          conflictInfo: {
            className: classNameMatch
              ? classNameMatch[1]
              : course?.Name || course?.title || "N/A",
            sessionTitle: sessionTitleMatch ? sessionTitleMatch[1] : "N/A",
            date: dateMatch ? dateMatch[1] : "N/A",
            startTime: timeMatch ? timeMatch[1] : "N/A",
            endTime: timeMatch ? timeMatch[2] : "N/A",
            message: conflictText,
            instructorName:
              course?.Instructor?.FullName || course?.InstructorName || "N/A",
          },
        });
      }
    }

    // Nếu không parse được theo pattern, tạo conflict chung
    if (conflicts.length === 0 && message) {
      conflicts.push({
        sessionIndex: 1,
        conflictType: "class",
        conflictInfo: {
          message: message,
        },
      });
    }

    return conflicts;
  };

  // Helper function để lấy InstructorID từ course object
  const getInstructorIdFromCourse = (courseObj) => {
    if (!courseObj) {
      console.warn("Course object is null or undefined");
      return null;
    }

    // Thử nhiều cách để lấy InstructorID
    const instructorId =
      courseObj.InstructorID ||
      courseObj.instructorId ||
      courseObj.Instructor?.InstructorID ||
      courseObj.Instructor?.id ||
      courseObj.instructor?.InstructorID ||
      courseObj.instructor?.id;

    if (!instructorId) {
      console.warn("InstructorID not found in course object:", courseObj);
    } else {
      console.log(
        "Found InstructorID:",
        instructorId,
        "from course:",
        courseObj
      );
    }

    return instructorId ? parseInt(instructorId) : null;
  };

  const handleAddSessions = async () => {
    if (!selectedDate) {
      alert(" Vui lòng chọn ngày!");
      return;
    }

    // Kiểm tra course đã được load chưa
    if (!course) {
      alert(" Đang tải thông tin lớp học. Vui lòng đợi...");
      return;
    }

    // Check ngày đã qua
    if (isDatePast(selectedDate)) {
      alert(" Không thể thêm lịch cho ngày đã qua!");
      return;
    }

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    // Chỉ validate cơ bản - kiểm tra thiếu TimeslotID
    // BỎ validation trùng ca - để backend xử lý conflicts
    const basicErrors = [];
    sessions.forEach((session, idx) => {
      if (!session.TimeslotID) {
        basicErrors.push(`Ca ${idx + 1}: Vui lòng chọn ca học`);
      }
    });

    if (basicErrors.length > 0) {
      alert(" Lỗi:\n" + basicErrors.join("\n"));
      return;
    }

    // Tạo sessions - tất cả sessions có TimeslotID đều được gửi
    // Backend sẽ xử lý conflicts
    const sessionsToCreate = sessions
      .filter((session) => session.TimeslotID)
      .map((session) => ({
        TimeslotID: session.TimeslotID,
        Date: dateStr,
        Title: `Session ${format(selectedDate, "dd/MM/yyyy")}`,
        Description: "",
      }));

    if (sessionsToCreate.length === 0) {
      alert(" Không có lịch nào được thêm!");
      return;
    }

    // Kiểm tra số buổi dự kiến trước khi tạo sessions
    const numofsession = course?.Numofsession || 0;
    const currentSessionsCount = schedules?.length || 0;
    const totalAfterAdd = currentSessionsCount + sessionsToCreate.length;

    if (numofsession > 0 && currentSessionsCount >= numofsession) {
      alert(
        ` Lớp học đã đủ số buổi dự kiến!\n\n` +
          `Số buổi dự kiến: ${numofsession}\n` +
          `Số buổi hiện tại: ${currentSessionsCount}\n\n` +
          `Không thể thêm buổi học nữa.`
      );
      return;
    }

    if (numofsession > 0 && totalAfterAdd > numofsession) {
      alert(
        ` Số buổi học vượt quá số buổi dự kiến!\n\n` +
          `Số buổi dự kiến: ${numofsession}\n` +
          `Số buổi hiện tại: ${currentSessionsCount}\n` +
          `Số buổi sẽ thêm: ${sessionsToCreate.length}\n` +
          `Tổng sau khi thêm: ${totalAfterAdd}\n\n` +
          `Vui lòng giảm số buổi cần thêm xuống còn tối đa ${
            numofsession - currentSessionsCount
          } buổi.`
      );
      return;
    }

    // Kiểm tra ClassID
    if (!courseId || isNaN(parseInt(courseId))) {
      alert(" Lỗi: Không có thông tin lớp học. Vui lòng thử lại!");
      return;
    }

    // Lấy InstructorID từ course object
    const instructorId = getInstructorIdFromCourse(course);
    if (!instructorId) {
      console.error("Course object:", course);
      alert(
        " Lỗi: Lớp học chưa có giảng viên được gán. Vui lòng kiểm tra lại thông tin lớp học!\n\nLớp học cần có InstructorID để tạo session."
      );
      return;
    }

    try {
      // Chuẩn bị data cho bulk create
      const sessionsForBulk = sessionsToCreate.map((sessionData, index) => {
        // Validate từng trường
        const title = sessionData.Title || `Session ${sessionData.Date || ""}`;
        const description = sessionData.Description || "";
        const classId = parseInt(courseId);
        const timeslotId = sessionData.TimeslotID;
        const date = sessionData.Date;

        // Logging chi tiết cho từng session
        console.log(`Validating session ${index + 1}:`, {
          Title: title,
          Description: description,
          ClassID: classId,
          TimeslotID: timeslotId,
          InstructorID: instructorId,
          Date: date,
        });

        // Kiểm tra tất cả các trường bắt buộc
        const missingFields = [];
        if (!title) missingFields.push("Title");
        if (!classId || isNaN(classId)) missingFields.push("ClassID");
        if (!timeslotId) missingFields.push("TimeslotID");
        if (!instructorId || isNaN(instructorId))
          missingFields.push("InstructorID");
        if (!date) missingFields.push("Date");

        if (missingFields.length > 0) {
          const errorMsg = `Session ${
            index + 1
          } thiếu các trường bắt buộc: ${missingFields.join(", ")}`;
          console.error(errorMsg, {
            Title: title,
            ClassID: classId,
            TimeslotID: timeslotId,
            InstructorID: instructorId,
            Date: date,
          });
          throw new Error(errorMsg);
        }

        return {
          Title: title,
          Description: description,
          ClassID: classId,
          TimeslotID: timeslotId,
          InstructorID: instructorId,
          Date: date,
        };
      });

      // Log dữ liệu trước khi gửi
      console.log("Sending sessions data:", sessionsForBulk);

      // Xử lý từng session một để không bị dừng khi gặp conflict
      const created = [];
      const conflicts = [];

      for (let i = 0; i < sessionsForBulk.length; i++) {
        const session = sessionsForBulk[i];

        // Kiểm tra số buổi dự kiến trước khi tạo từng session
        // (kiểm tra lại vì có thể đã có session được tạo thành công trước đó)
        const currentCount = currentSessionsCount + created.length;
        if (numofsession > 0 && currentCount >= numofsession) {
          // Đã đủ số buổi, không tạo thêm
          conflicts.push({
            sessionIndex: i + 1,
            sessionData: session,
            conflictInfo: {
              message: `Lớp học đã đủ số buổi dự kiến (${numofsession} buổi). Không thể thêm buổi học này.`,
            },
            message: "Đã đủ số buổi dự kiến",
          });
          console.log(
            ` Session ${
              i + 1
            } bị bỏ qua: Đã đủ số buổi dự kiến (${currentCount}/${numofsession})`
          );
          continue;
        }

        // Validate session trước khi gửi
        if (
          !session.InstructorID ||
          !session.ClassID ||
          !session.TimeslotID ||
          !session.Date
        ) {
          console.error(` Session ${i + 1} missing required fields:`, session);
          conflicts.push({
            sessionIndex: i + 1,
            sessionData: session,
            conflictInfo: {
              message: `Session thiếu thông tin bắt buộc: ${
                !session.InstructorID ? "InstructorID, " : ""
              }${!session.ClassID ? "ClassID, " : ""}${
                !session.TimeslotID ? "TimeslotID, " : ""
              }${!session.Date ? "Date" : ""}`,
            },
            message: "Session thiếu thông tin bắt buộc",
          });
          continue;
        }

        try {
          // Tạo từng session một
          const result = await classService.createSession(session);

          // Kiểm tra response có conflict không (trường hợp backend trả về 200 nhưng có conflict)
          if (
            result?.hasConflicts ||
            result?.conflicts?.length > 0 ||
            result?.success === false
          ) {
            // Backend trả về thành công nhưng có conflict hoặc failed - không thêm vào created
            const resultConflicts =
              result.conflicts || result.data?.conflicts || [];

            if (resultConflicts.length > 0) {
              resultConflicts.forEach((conflict) => {
                conflicts.push({
                  sessionIndex: i + 1,
                  sessionData: session,
                  conflictInfo: conflict.conflictInfo || conflict,
                  message: conflict.message || "Ca học bị trùng",
                });
              });
            } else {
              // Nếu không có conflict array nhưng success = false, vẫn là conflict
              conflicts.push({
                sessionIndex: i + 1,
                sessionData: session,
                conflictInfo: {
                  message: result.message || result.error || "Ca học bị trùng",
                },
                message: result.message || result.error || "Ca học bị trùng",
              });
            }
            console.log(
              ` Session ${i + 1} có conflict trong response:`,
              result
            );
          } else if (result?.success !== false && result?.SessionID) {
            // Thành công thật sự - phải có SessionID và success !== false
            created.push({
              sessionIndex: i + 1,
              sessionData: session,
              result: result,
            });
            console.log(
              ` Session ${i + 1} created successfully with ID:`,
              result.SessionID
            );
          } else {
            // Response không rõ ràng - coi như conflict để an toàn
            console.warn(` Session ${i + 1} response không rõ ràng:`, result);
            conflicts.push({
              sessionIndex: i + 1,
              sessionData: session,
              conflictInfo: {
                message: "Không thể xác định kết quả tạo session",
              },
              message: "Không thể xác định kết quả tạo session",
            });
          }
        } catch (error) {
          console.error(` Session ${i + 1} failed:`, error);
          console.error(
            ` Session ${i + 1} error response:`,
            error.response?.data
          );

          // Kiểm tra nếu là conflict error - LUÔN thêm vào conflicts
          const errorData = error.response?.data || error;
          const errorMessage =
            errorData?.error || errorData?.message || error?.message || "";

          console.log(` Session ${i + 1} error message:`, errorMessage);

          // Kiểm tra nhiều cách để phát hiện conflict
          const isConflictError =
            errorMessage.includes("trùng") ||
            errorMessage.includes("trùng thời gian") ||
            errorMessage.includes("trùng lịch") ||
            errorMessage.includes("conflict") ||
            errorMessage.includes("đã có ca học") ||
            errorMessage.includes("đã có session") ||
            errorMessage.includes("Instructor đã có") ||
            errorMessage.includes("Lớp") ||
            errorMessage.includes("đã có session") ||
            error.response?.status === 400 || // Conflict thường trả về 400
            error.response?.status === 409; // Hoặc 409 Conflict

          console.log(` Session ${i + 1} isConflictError:`, isConflictError);
          console.log(
            ` Session ${i + 1} error status:`,
            error.response?.status
          );

          // LUÔN thêm vào conflicts nếu có error - KHÔNG BAO GIỜ coi error là thành công
          if (isConflictError) {
            // Parse conflict info
            const parsedConflicts = parseConflictFromMessage(errorMessage, 1);

            if (parsedConflicts.length > 0) {
              conflicts.push({
                sessionIndex: i + 1,
                sessionData: session,
                conflictInfo: parsedConflicts[0].conflictInfo,
                message: errorMessage,
              });
            } else {
              conflicts.push({
                sessionIndex: i + 1,
                sessionData: session,
                conflictInfo: {
                  message: errorMessage || "Ca học bị trùng",
                },
                message: errorMessage || "Ca học bị trùng",
              });
            }
          } else {
            // Lỗi khác, cũng thêm vào conflicts để không báo thành công
            conflicts.push({
              sessionIndex: i + 1,
              sessionData: session,
              conflictInfo: {
                message: errorMessage || "Lỗi không xác định",
              },
              message: errorMessage || "Lỗi không xác định",
            });
          }

          // Đảm bảo không được thêm vào created
          console.log(
            ` Session ${
              i + 1
            } đã được thêm vào conflicts, KHÔNG thêm vào created`
          );
        }
      }

      // Log kết quả để debug
      console.log(" Kết quả tạo sessions:", {
        total: sessionsForBulk.length,
        created: created.length,
        conflicts: conflicts.length,
        createdSessions: created,
        conflictedSessions: conflicts,
      });

      // Hiển thị kết quả
      if (conflicts.length > 0) {
        // Có conflicts - LUÔN hiển thị modal
        console.log(" Có conflicts, hiển thị modal với:", conflicts);
        setConflictModal({
          open: true,
          type: conflicts.length > 1 ? "bulk" : "single",
          conflicts: conflicts,
          created: created,
          summary: {
            total: sessionsForBulk.length,
            success: created.length,
            conflicts: conflicts.length,
          },
        });

        // Hiển thị thông báo - CHỈ báo thành công nếu có sessions thật sự được tạo
        if (created.length > 0) {
          alert(
            ` Kết quả: ${created.length} lịch học thành công, ${conflicts.length} lịch học bị trùng/lỗi.\n\nVui lòng xem chi tiết trong modal.`
          );
        } else {
          // TẤT CẢ đều bị conflict - KHÔNG có gì được tạo
          alert(
            ` Không có lịch học nào được tạo!\n\n Tất cả ${conflicts.length} lịch học đều bị trùng hoặc lỗi.\n\nVui lòng xem chi tiết trong modal.`
          );
        }
      } else if (created.length > 0) {
        // Không có conflict, tất cả thành công
        console.log(" Tất cả sessions thành công, không có conflicts");
        alert(` Đã thêm ${created.length} lịch học thành công!`);
      } else {
        // Không có gì được tạo (trường hợp hiếm)
        console.log(" Không có sessions nào được tạo");
        alert(` Không có lịch học nào được tạo.`);
      }

      // Reload schedules
      await loadData();

      // Reset sessions
      setSessions([{ TimeslotID: "" }]);
    } catch (error) {
      // Lỗi validation hoặc lỗi khác trước khi xử lý sessions
      console.error("Lỗi khi tạo sessions:", error);
      const errorMessage =
        error?.message || "Không thể thêm lịch học. Vui lòng thử lại!";
      alert(` Lỗi: ${errorMessage}`);
    }
  };

  const handleAddSessionRow = () => {
    setSessions([...sessions, { TimeslotID: "" }]);
  };

  const handleRemoveSessionRow = (index) => {
    if (sessions.length === 1) {
      alert(" Phải có ít nhất một ca!");
      return;
    }
    setSessions(sessions.filter((_, idx) => idx !== index));
  };

  const handleSessionChange = (index, field, value) => {
    const updated = sessions.map((s, idx) =>
      idx === index ? { ...s, [field]: value } : s
    );
    setSessions(updated);
  };

  const getTimeslotMeta = (timeslotId) =>
    timeslots.find((t) => (t.TimeslotID || t.id) === timeslotId);

  const handleAutoMakeup = async () => {
    if (!course || !courseId) {
      alert(" Đang tải thông tin lớp học. Vui lòng đợi...");
      return;
    }

    const numofsession = course?.Numofsession || 0;
    const currentSessionsCount = schedules?.length || 0;
    const missingSessions = numofsession - currentSessionsCount;

    if (missingSessions <= 0) {
      alert(
        ` Lớp học đã đủ số buổi dự kiến!\n\n` +
          `Số buổi dự kiến: ${numofsession}\n` +
          `Số buổi hiện tại: ${currentSessionsCount}\n\n` +
          `Không cần bù thêm buổi học.`
      );
      return;
    }

    if (numofsession === 0) {
      alert(
        " Lớp học chưa có số buổi dự kiến. Vui lòng cập nhật thông tin lớp học trước."
      );
      return;
    }

    // Lấy InstructorID từ course
    const instructorId = getInstructorIdFromCourse(course);
    if (!instructorId) {
      alert(" Lớp học chưa có giảng viên được gán. Vui lòng kiểm tra lại!");
      return;
    }

    // Lấy timeslots từ các sessions hiện có của lớp
    const classTimeslots = [];
    const timeslotMap = new Map();
    schedules.forEach((schedule) => {
      const timeslotId = schedule.timeslotId;
      if (timeslotId && !timeslotMap.has(timeslotId)) {
        const timeslotMeta = getTimeslotMeta(timeslotId);
        if (timeslotMeta) {
          timeslotMap.set(timeslotId, {
            TimeslotID: timeslotId,
            Day: timeslotMeta.Day || timeslotMeta.day,
            StartTime: timeslotMeta.StartTime || timeslotMeta.startTime,
            EndTime: timeslotMeta.EndTime || timeslotMeta.endTime,
          });
          classTimeslots.push(timeslotMap.get(timeslotId));
        }
      }
    });

    if (classTimeslots.length === 0) {
      alert(
        " Lớp học chưa có ca học nào. Vui lòng thêm ca học trước khi sử dụng tính năng bù tự động."
      );
      return;
    }

    // Tìm buổi cuối cùng
    const maxDate = schedules.reduce((latest, schedule) => {
      if (!schedule?.date) return latest;
      const dateValue = dayjs(schedule.date);
      if (!dateValue.isValid()) return latest;
      if (!latest || dateValue.isAfter(latest)) {
        return dateValue;
      }
      return latest;
    }, null);
    let rollingStart = (maxDate || dayjs()).add(1, "day");

    setSuggestionFetching(true);
    try {
      const suggestionResults = [];

      // Tạo các "conflict" giả để tìm buổi bù (mỗi conflict = 1 buổi cần bù)
      for (let i = 0; i < missingSessions; i++) {
        // Chọn timeslot theo vòng (round-robin)
        const timeslot = classTimeslots[i % classTimeslots.length];

        let searchPointer = rollingStart.clone();
        let suggestion = null;
        let suggestionError = null;

        // Tìm slot rảnh cho timeslot này
        for (let attempt = 0; attempt < 6 && !suggestion; attempt++) {
          try {
            const response = await classService.findInstructorAvailableSlots({
              InstructorID: instructorId,
              TimeslotID: timeslot.TimeslotID,
              Day: timeslot.Day,
              startDate: searchPointer.format("YYYY-MM-DD"),
              numSuggestions: 1,
              excludeClassId: parseInt(courseId),
            });

            const allSuggestions = response?.data?.suggestions || [];
            const candidate =
              allSuggestions.find((item) => item.available) || null;

            if (candidate) {
              suggestion = {
                date: candidate.date,
                timeslotId: timeslot.TimeslotID,
                startTime: timeslot.StartTime || null,
                endTime: timeslot.EndTime || null,
                title: `Buổi ${currentSessionsCount + i + 1} (bù)`,
                description: `Buổi học bù tự động`,
              };
              rollingStart = dayjs(candidate.date).add(1, "day");
              break;
            } else {
              searchPointer = searchPointer.add(7, "day");
              suggestionError =
                "Không tìm thấy lịch trống phù hợp cho ca học này.";
            }
          } catch (error) {
            console.error(`[handleAutoMakeup] Lỗi khi tìm slot:`, error);
            suggestionError = error?.message || "Không thể lấy gợi ý.";
            break;
          }
        }

        suggestionResults.push({
          conflict: {
            sessionIndex: currentSessionsCount + i + 1,
            conflictInfo: {
              sessionTitle: `Buổi ${currentSessionsCount + i + 1}`,
            },
          },
          suggestion,
          error: suggestion ? null : suggestionError,
        });
      }

      setSuggestionModal({
        open: true,
        suggestions: suggestionResults,
        classId: parseInt(courseId),
      });
    } catch (error) {
      console.error("[handleAutoMakeup] Lỗi:", error);
      alert(
        ` Lỗi khi tìm buổi học bù: ${
          error?.message || "Không thể tạo gợi ý buổi học bù."
        }`
      );
    } finally {
      setSuggestionFetching(false);
    }
  };

  const handleApplySuggestions = async () => {
    if (!suggestionModal.classId) {
      setSuggestionModal({ ...suggestionModal, open: false });
      return;
    }

    // Kiểm tra số buổi dự kiến
    const numofsession = course?.Numofsession || 0;
    const currentSessionsCount = schedules?.length || 0;
    const suggestionsToAdd = suggestionModal.suggestions.filter(
      (item) => item.suggestion
    ).length;
    const totalAfterAdd = currentSessionsCount + suggestionsToAdd;

    if (numofsession > 0 && totalAfterAdd > numofsession) {
      alert(
        ` Số buổi học vượt quá số buổi dự kiến!\n\n` +
          `Số buổi dự kiến: ${numofsession}\n` +
          `Số buổi hiện tại: ${currentSessionsCount}\n` +
          `Số buổi sẽ thêm: ${suggestionsToAdd}\n` +
          `Tổng sau khi thêm: ${totalAfterAdd}\n\n` +
          `Vui lòng giảm số buổi cần thêm.`
      );
      return;
    }

    const payloads = suggestionModal.suggestions
      .filter((item) => item.suggestion)
      .map((item) => {
        const { suggestion, conflict } = item;
        return {
          Title:
            suggestion.title ||
            `${conflict.conflictInfo?.sessionTitle || "Buổi học"} (bù)`,
          Description: suggestion.description || `Buổi bù tự động`,
          Date: suggestion.date,
          TimeslotID: suggestion.timeslotId,
        };
      });

    if (payloads.length === 0) {
      setSuggestionModal({ ...suggestionModal, open: false });
      return;
    }

    setSuggestionApplying(true);
    try {
      const instructorId = getInstructorIdFromCourse(course);
      if (!instructorId) {
        alert(" Lớp học chưa có giảng viên được gán. Vui lòng kiểm tra lại!");
        return;
      }

      const classId = parseInt(courseId);
      const sessionsForBulk = payloads.map((payload) => ({
        Title: payload.Title,
        Description: payload.Description,
        ClassID: classId,
        TimeslotID: payload.TimeslotID,
        InstructorID: instructorId,
        Date: payload.Date,
      }));

      // Tạo từng session một
      const created = [];
      const conflicts = [];

      for (let i = 0; i < sessionsForBulk.length; i++) {
        const session = sessionsForBulk[i];
        try {
          const result = await classService.createSession(session);
          if (result?.success !== false && result?.SessionID) {
            created.push({ sessionIndex: i + 1, sessionData: session, result });
          } else {
            conflicts.push({
              sessionIndex: i + 1,
              sessionData: session,
              conflictInfo: {
                message: result?.message || result?.error || "Ca học bị trùng",
              },
            });
          }
        } catch (error) {
          conflicts.push({
            sessionIndex: i + 1,
            sessionData: session,
            conflictInfo: {
              message:
                error?.message ||
                error?.response?.data?.message ||
                "Lỗi khi tạo session",
            },
          });
        }
      }

      if (created.length > 0) {
        await loadData();
        alert(` Đã thêm ${created.length} buổi học bù thành công!`);
      }

      if (conflicts.length > 0) {
        alert(` Có ${conflicts.length} buổi học bù bị trùng hoặc lỗi.`);
      }

      setSuggestionModal({ ...suggestionModal, open: false });
    } catch (error) {
      console.error("[handleApplySuggestions] Lỗi:", error);
      alert(
        ` Lỗi khi thêm buổi học bù: ${
          error?.message || "Không thể thêm buổi học bù."
        }`
      );
    } finally {
      setSuggestionApplying(false);
    }
  };

  const handleOpenRescheduleModal = (schedule) => {
    // Check xem buổi học đã qua chưa
    if (isDatePast(schedule.date)) {
      alert(" Không thể đổi lịch học đã qua hoặc đang diễn ra!");
      return;
    }

    setRescheduleModal({
      open: true,
      session: schedule,
    });
  };

  // newSlot: { Date: "YYYY-MM-DD", TimeslotID: number|string }
  const handleRescheduleSession = async (newSlot) => {
    if (!newSlot || !newSlot.Date || !newSlot.TimeslotID) {
      alert(" Vui lòng chọn ngày và ca học mới!");
      return;
    }

    if (!rescheduleModal.session) {
      alert(" Lỗi: Không tìm thấy thông tin session. Vui lòng thử lại!");
      return;
    }

    const sessionId =
      rescheduleModal.session.sessionId ||
      rescheduleModal.session.id ||
      rescheduleModal.session.SessionID;
    if (!sessionId) {
      alert(" Lỗi: Không tìm thấy ID của session. Vui lòng thử lại!");
      return;
    }

    const newDateStr = newSlot.Date;
    const newTimeslotId = newSlot.TimeslotID;

    try {
      // Check learner conflict trước khi đổi lịch
      const learnerCheck =
        (await classService.checkLearnerConflicts(
          parseInt(courseId),
          newDateStr,
          newTimeslotId
        )) || {};
      if (learnerCheck?.conflicts?.length > 0 || learnerCheck?.hasConflicts) {
        alert(
          learnerCheck?.message ||
            "Học viên của lớp có buổi trùng lịch với ca học mới. Vui lòng chọn lịch khác."
        );
        return;
      }

      // Gọi API reschedule
      await classService.rescheduleSession(
        parseInt(sessionId),
        newDateStr,
        newTimeslotId
      );

      // Reload schedules
      await loadData();

      setRescheduleModal({
        open: false,
        session: null,
      });

      alert(" Đã đổi lịch học thành công!");
    } catch (error) {
      console.error("Lỗi khi đổi lịch session:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Không thể đổi lịch học. Vui lòng thử lại!";
      alert(` Lỗi: ${errorMessage}`);
      setRescheduleModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // REMOVED: handleBulkAdd và các hàm liên quan - không còn cần thiết vì khi tạo lớp đã tạo sessions tự động

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 8,
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
        }}
      >
        <CircularProgress sx={{ color: "#667eea" }} />
        <Typography sx={{ ml: 2, color: "#64748b" }}>
          Loading schedule...
        </Typography>
      </Box>
    );
  }

  if (!course) {
    return (
      <Box
        sx={{
          p: 4,
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card
          sx={{ borderRadius: 3, p: 4, textAlign: "center", maxWidth: 500 }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 600, mb: 2, color: "#ef4444" }}
          >
            Class not found
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/admin/classes")}
            sx={{
              backgroundColor: "#667eea",
              textTransform: "none",
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#5568d3",
              },
            }}
          >
            Go Back
          </Button>
        </Card>
      </Box>
    );
  }

  // Lớp đã kết thúc hoặc đã hủy → không cho thêm / đổi lịch
  const isClassFinal =
    course &&
    (course.Status === "CLOSE" ||
      course.Status === "CANCEL" ||
      course.status === "CLOSE" ||
      course.status === "CANCEL");

  // Với staff: chỉ cho phép thêm/đổi lịch khi lớp ở trạng thái DRAFT
  const isDraftClass =
    course &&
    (course.Status === "DRAFT" ||
      course.status === "DRAFT" ||
      course.Status === "Nháp" ||
      course.status === "Nháp");

  // Quyền chỉnh sửa lịch: admin luôn được (trừ khi lớp final),
  // staff chỉ được khi lớp DRAFT
  const canEditSchedule = !isStaff
    ? !isClassFinal
    : !isClassFinal && isDraftClass;

  const days = getDaysInMonth();
  const weekDays = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];
  const dayFilterOptions = [
    { value: "", label: "Theo ngày đã chọn" },
    { value: "MONDAY", label: "Thứ 2" },
    { value: "TUESDAY", label: "Thứ 3" },
    { value: "WEDNESDAY", label: "Thứ 4" },
    { value: "THURSDAY", label: "Thứ 5" },
    { value: "FRIDAY", label: "Thứ 6" },
    { value: "SATURDAY", label: "Thứ 7" },
    { value: "SUNDAY", label: "Chủ nhật" },
  ];

  return (
    <Box sx={{ p: 1, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Quản lý lịch học lớp
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Lớp: <strong>{course.title || course.Name}</strong>
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() =>
                navigate(isStaff ? "/staff/classes" : "/admin/classes")
              }
              sx={{
                textTransform: "none",
                borderRadius: 2,
                borderColor: "#e2e8f0",
                color: "#64748b",
                "&:hover": {
                  borderColor: "#667eea",
                  backgroundColor: "#f0f4ff",
                },
              }}
            >
              Trở về
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Calendar */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          border: "1px solid #e2e8f0",
          mb: 4,
        }}
      >
        <CardContent>
          {/* Calendar Navigation */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              pb: 2,
              borderBottom: "2px solid #e2e8f0",
            }}
          >
            <IconButton
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              sx={{
                color: "#667eea",
                "&:hover": {
                  backgroundColor: "#f0f4ff",
                },
              }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {format(currentMonth, "MMMM yyyy", { locale: vi })}
            </Typography>
            <IconButton
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              sx={{
                color: "#667eea",
                "&:hover": {
                  backgroundColor: "#f0f4ff",
                },
              }}
            >
              <ArrowForward />
            </IconButton>
          </Box>

          <div className="calendar-grid">
            {weekDays.map((day) => (
              <div key={day} className="calendar-weekday">
                {day}
              </div>
            ))}

            {days.map((date, idx) => {
              const daySchedules = getSchedulesForDate(date);
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());

              return (
                <div
                  key={idx}
                  className={`calendar-day ${
                    !isCurrentMonth ? "other-month" : ""
                  } ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
                  onClick={() => handleDateClick(date)}
                >
                  <div className="day-number">{format(date, "d")}</div>
                  <div className="day-schedules">
                    {daySchedules.map((sch) => (
                      <div key={sch.id} className="schedule-badge-custom">
                        {sch.startTime.substring(0, 5)} -{" "}
                        {sch.endTime.substring(0, 5)}
                      </div>
                    ))}
                    {daySchedules.length > 2 && (
                      <div className="schedule-count">
                        +{daySchedules.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <div className="session-selector">
          <div className="selector-header-inline">
            <h3>
              Lịch học ngày {format(selectedDate, "dd/MM/yyyy", { locale: vi })}
            </h3>
            {isDatePast(selectedDate) && (
              <span className="past-date-badge">Đã qua</span>
            )}
          </div>

          {/* Danh sách lịch đã có */}
          {getSchedulesForDate(selectedDate).length > 0 && (
            <div className="existing-schedules">
              <h4>
                📋 Lịch đã lên ({getSchedulesForDate(selectedDate).length})
              </h4>
              <div className="schedule-list">
                {getSchedulesForDate(selectedDate).map((sch) => {
                  const isPast = isDatePast(sch.date);
                  return (
                    <div
                      key={sch.id}
                      className={`schedule-item-card ${isPast ? "past" : ""}`}
                    >
                      <div className="schedule-time-display">
                        🕐 {sch.startTime.substring(0, 5)} -{" "}
                        {sch.endTime.substring(0, 5)}
                        {isPast && (
                          <span className="past-label"> (Đã qua)</span>
                        )}
                      </div>
                      {!isPast && canEditSchedule && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenRescheduleModal(sch)}
                        >
                          Đổi lịch
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form thêm nhiều ca */}
          {!isDatePast(selectedDate) && canEditSchedule && (
            <div className="add-sessions-form">
              <h4> Thêm lịch học mới</h4>

              {sessions.map((session, idx) => {
                const selectedTimeslot = getTimeslotById(session.TimeslotID);
                return (
                  <div key={idx} className="session-input-row">
                    <div className="session-number">Ca {idx + 1}</div>

                    <div className="session-inputs">
                      <FormControl
                        fullWidth
                        size="small"
                        sx={{ minWidth: 250 }}
                      >
                        <InputLabel>Chọn ca học</InputLabel>
                        <Select
                          value={session.TimeslotID || ""}
                          label="Chọn ca học"
                          onChange={(e) =>
                            handleSessionChange(
                              idx,
                              "TimeslotID",
                              parseInt(e.target.value)
                            )
                          }
                        >
                          {filteredTimeslots.length === 0 ? (
                            <MenuItem disabled>
                              Không có ca học cho{" "}
                              {selectedDate
                                ? dayOfWeekToDay(selectedDate.getDay())
                                : "ngày này"}
                            </MenuItem>
                          ) : (
                            filteredTimeslots.map((timeslot) => {
                              const id = timeslot.TimeslotID || timeslot.id;
                              const startTime =
                                timeslot.StartTime || timeslot.startTime || "";
                              const endTime =
                                timeslot.EndTime || timeslot.endTime || "";
                              const day = timeslot.Day || timeslot.day || "";
                              return (
                                <MenuItem key={id} value={id}>
                                  {startTime.substring(0, 5)} -{" "}
                                  {endTime.substring(0, 5)}
                                  {day && ` (${day})`}
                                </MenuItem>
                              );
                            })
                          )}
                        </Select>
                      </FormControl>

                      {selectedTimeslot && (
                        <div
                          className="form-group-inline end-time-display"
                          style={{ marginLeft: "16px" }}
                        >
                          <label>Ca học:</label>
                          <div className="calculated-time">
                            {selectedTimeslot.StartTime?.substring(0, 5) || ""}{" "}
                            - {selectedTimeslot.EndTime?.substring(0, 5) || ""}
                          </div>
                        </div>
                      )}

                      {sessions.length > 1 && (
                        <button
                          className="btn-remove-row"
                          onClick={() => handleRemoveSessionRow(idx)}
                          title="Xóa ca này"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="session-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddSessionRow}
                >
                  Thêm ca học
                </button>
                <button className="btn btn-primary" onClick={handleAddSessions}>
                  Lưu tất cả ({sessions.length} ca)
                </button>
              </div>
            </div>
          )}

          {isDatePast(selectedDate) && (
            <div className="past-date-notice">
              <p>Ngày này đã qua. Chỉ có thể xem lịch, không thể chỉnh sửa.</p>
            </div>
          )}
        </div>
      )}

      {/* Reschedule Modal */}
      {/* Reschedule Modal - dùng chung ClassSessionScheduleModal */}
      <ClassSessionScheduleModal
        open={rescheduleModal.open}
        onClose={() =>
          setRescheduleModal((prev) => ({
            ...prev,
            open: false,
            session: null,
          }))
        }
        onConfirm={async (newSlot) => {
          await handleRescheduleSession(newSlot);
        }}
        instructorId={getInstructorIdFromCourse(course)}
        classId={parseInt(courseId)}
        baseDate={
          rescheduleModal.session
            ? rescheduleModal.session.date
            : selectedDate || null
        }
        timeslots={timeslots}
        existingSessions={schedules.map((sch) => ({
          Date: sch.date,
          TimeslotID: sch.timeslotId,
          isDisabled:
            rescheduleModal.session &&
            (sch.sessionId === rescheduleModal.session.sessionId ||
              sch.id === rescheduleModal.session.id),
        }))}
        sessionToReschedule={
          rescheduleModal.session
            ? {
                Date: rescheduleModal.session.date,
                TimeslotID: rescheduleModal.session.timeslotId,
              }
            : null
        }
      />

      {/* Conflict Modal */}
      <Dialog
        open={conflictModal.open}
        onClose={() => setConflictModal({ ...conflictModal, open: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 600, color: "#dc3545" }}>
          Trùng ca học
        </DialogTitle>
        <DialogContent>
          {conflictModal.type === "single" ? (
            // Single conflict
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Ca học bạn đang tạo bị trùng với:
              </Typography>
              {conflictModal.conflicts[0]?.conflictInfo && (
                <Card
                  sx={{
                    p: 2,
                    backgroundColor: "#fff3cd",
                    border: "1px solid #ffc107",
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Giảng viên:</strong>{" "}
                    {conflictModal.conflicts[0].conflictInfo.instructorName}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Lớp:</strong>{" "}
                    {conflictModal.conflicts[0].conflictInfo.className}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Ca đang tồn tại:</strong>
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">
                      • Session:{" "}
                      {conflictModal.conflicts[0].conflictInfo.sessionTitle}
                    </Typography>
                    <Typography variant="body2">
                      • Ngày: {conflictModal.conflicts[0].conflictInfo.date}
                    </Typography>
                    <Typography variant="body2">
                      • Giờ:{" "}
                      {conflictModal.conflicts[0].conflictInfo.startTime?.substring(
                        0,
                        5
                      )}{" "}
                      -{" "}
                      {conflictModal.conflicts[0].conflictInfo.endTime?.substring(
                        0,
                        5
                      )}
                    </Typography>
                  </Box>
                  {conflictModal.conflicts[0].conflictInfo.message && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      {conflictModal.conflicts[0].conflictInfo.message}
                    </Alert>
                  )}
                </Card>
              )}
            </Box>
          ) : (
            // Bulk conflicts
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Có {conflictModal.conflicts.length} ca học bị trùng lịch:
              </Typography>
              <Box sx={{ maxHeight: "400px", overflowY: "auto" }}>
                {conflictModal.conflicts.map((conflict, index) => (
                  <Card
                    key={index}
                    sx={{
                      p: 2,
                      mb: 2,
                      backgroundColor: "#fff3cd",
                      border: "1px solid #ffc107",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Session {conflict.sessionIndex || index + 1}:
                    </Typography>
                    {conflict.sessionData && (
                      <Box sx={{ mb: 1, pl: 1 }}>
                        <Typography variant="body2">
                          • Giảng viên:{" "}
                          {conflict.sessionData.instructorName ||
                            conflict.conflictInfo?.instructorName}
                        </Typography>
                        <Typography variant="body2">
                          • Lớp:{" "}
                          {conflict.sessionData.className ||
                            conflict.conflictInfo?.className}
                        </Typography>
                      </Box>
                    )}
                    {conflict.conflictInfo && (
                      <Box sx={{ pl: 1 }}>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          • Ca tồn tại: {conflict.conflictInfo.sessionTitle}
                        </Typography>
                        <Typography variant="body2">
                          • Ngày: {conflict.conflictInfo.date} (
                          {conflict.conflictInfo.startTime?.substring(0, 5)} -{" "}
                          {conflict.conflictInfo.endTime?.substring(0, 5)})
                        </Typography>
                        {conflict.conflictInfo.message && (
                          <Alert severity="warning" sx={{ mt: 1 }}>
                            {conflict.conflictInfo.message}
                          </Alert>
                        )}
                      </Box>
                    )}
                  </Card>
                ))}
              </Box>
              {conflictModal.summary && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Tổng kết:</strong> {conflictModal.summary.success}/
                    {conflictModal.summary.total} sessions đã được tạo thành
                    công
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConflictModal({ ...conflictModal, open: false })}
            variant="contained"
            sx={{
              backgroundColor: "#667eea",
              "&:hover": {
                backgroundColor: "#5568d3",
              },
            }}
          >
            Quay lại
          </Button>
        </DialogActions>
      </Dialog>

      {/* Suggestion Modal (cho bù tự động) */}
      <SessionSuggestionModal
        open={suggestionModal.open}
        suggestions={suggestionModal.suggestions}
        onClose={() => setSuggestionModal({ ...suggestionModal, open: false })}
        onApply={handleApplySuggestions}
        applying={suggestionApplying}
      />
    </Box>
  );
};

export default SchedulePage;
