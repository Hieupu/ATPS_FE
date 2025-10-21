import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import classService from "../../../apiServices/classService";
import { formatDateForAPI, parseDateSafely } from "../../../utils/dateUtils";
import "./style.css";

const ScheduleManagementPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Multiple sessions input for selected date
  const [sessions, setSessions] = useState([
    { startTime: "08:00", durationHours: "4", durationMinutes: "0" },
  ]);

  // Bulk add state
  const [bulkConfig, setBulkConfig] = useState({
    type: "daily", // daily, weekly
    startDate: "",
    endDate: "",
    weekdays: [1, 2, 3, 4, 5], // Array of weekdays (1-5 = Thứ 2-6)
    excludeWeekend: true, // Trừ cuối tuần
    excludeSaturday: false, // Trừ thứ 7
    excludeSunday: false, // Trừ chủ nhật
  });

  // Bulk sessions (các ca học cho bulk add)
  const [bulkSessions, setBulkSessions] = useState([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const classData = await classService.getClassById(classId);
      setCourse(classData);

      // Auto-fill bulk config với thời gian từ lớp học
      if (classData) {
        setBulkConfig((prev) => ({
          ...prev,
          startDate: classData.startDate || "",
          endDate: classData.endDate || "",
        }));
      }

      // ✅ Load schedules from database instead of localStorage
      try {
        const sessionsResult = await classService.getClassSessions(classId);
        const databaseSchedules = sessionsResult.data || [];

        // Transform database format to frontend format
        const transformedSchedules = [];
        databaseSchedules.forEach((session) => {
          // Backend trả về session với Timeslots array
          if (session.Timeslots && session.Timeslots.length > 0) {
            session.Timeslots.forEach((timeslot) => {
              transformedSchedules.push({
                id: session.SessionID || session.id,
                date: timeslot.Date
                  ? timeslot.Date.split("T")[0]
                  : timeslot.date,
                startTime: timeslot.StartTime || timeslot.startTime,
                endTime: timeslot.EndTime || timeslot.endTime,
                courseId: classId,
                lessonId: null,
                sessionTitle: session.Title || session.sessionTitle,
                sessionDescription:
                  session.Description || session.sessionDescription,
                location: timeslot.Location || timeslot.location,
              });
            });
          } else {
            // Fallback cho format cũ
            transformedSchedules.push({
              id: session.SessionID || session.id,
              date: session.Date ? session.Date.split("T")[0] : session.date,
              startTime: session.StartTime || session.startTime,
              endTime: session.EndTime || session.endTime,
              courseId: classId,
              lessonId: null,
              sessionTitle: session.Title || session.sessionTitle,
              sessionDescription:
                session.Description || session.sessionDescription,
            });
          }
        });

        setSchedules(transformedSchedules);
        console.log("✅ Loaded schedules from database:", transformedSchedules);
      } catch (sessionError) {
        console.warn(
          "⚠️ Could not load sessions from database, using localStorage fallback:",
          sessionError
        );
        // Fallback to localStorage if database fails
        const savedSchedules = JSON.parse(
          localStorage.getItem(`schedules_${classId}`) || "[]"
        );
        setSchedules(savedSchedules);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      alert("❌ Không thể tải thông tin lớp học!");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

    // ✅ Use safe date handling - backend team guidance
    const safeDate = parseDateSafely(formatDateForAPI(date));
    console.log("🔍 Original date:", date);
    console.log("🔍 Safe date:", safeDate);
    console.log("🔍 Formatted for API:", formatDateForAPI(date));

    setSelectedDate(safeDate);
    // Scroll xuống phần session-selector
    setTimeout(() => {
      document.querySelector(".session-selector")?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 100);
  };

  const calculateEndTime = (startTime, hours, minutes) => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const totalMinutes =
      startHour * 60 + startMinute + parseInt(hours) * 60 + parseInt(minutes);
    const endHour = Math.floor(totalMinutes / 60) % 24;
    const endMinute = totalMinutes % 60;
    return `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(
      2,
      "0"
    )}`;
  };

  const isDatePast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  const handleAddSessions = async () => {
    if (!selectedDate) {
      alert("⚠️ Vui lòng chọn ngày!");
      return;
    }

    // Check ngày đã qua
    if (isDatePast(selectedDate)) {
      alert("⚠️ Không thể thêm lịch cho ngày đã qua!");
      return;
    }

    // ✅ Use safe date handling - backend team guidance
    const safeDateStr = formatDateForAPI(selectedDate);
    console.log("🔍 Selected date:", selectedDate);
    console.log("🔍 Safe date string:", safeDateStr);
    const existingSchedules = getSchedulesForDate(selectedDate);
    const newSchedules = [];
    const errors = [];

    sessions.forEach((session, idx) => {
      if (!session.startTime || !session.durationHours) {
        errors.push(`Ca ${idx + 1}: Thiếu thông tin`);
        return;
      }

      const hours = parseInt(session.durationHours) || 0;
      const minutes = parseInt(session.durationMinutes) || 0;

      if (hours === 0 && minutes === 0) {
        errors.push(`Ca ${idx + 1}: Thời lượng phải lớn hơn 0`);
        return;
      }

      const endTime = calculateEndTime(session.startTime, hours, minutes);
      const startTimeStr = session.startTime + ":00";
      const endTimeStr = endTime + ":00";

      // Check trùng ca
      const isDuplicate = existingSchedules.some((sch) => {
        const schStart = sch.startTime.substring(0, 5);
        const schEnd = sch.endTime.substring(0, 5);
        return (
          (session.startTime >= schStart && session.startTime < schEnd) ||
          (endTime > schStart && endTime <= schEnd) ||
          (session.startTime <= schStart && endTime >= schEnd)
        );
      });

      // Also check trong danh sách mới
      const isDuplicateInNew = newSchedules.some((ns) => {
        const nsStart = ns.startTime.substring(0, 5);
        const nsEnd = ns.endTime.substring(0, 5);
        return (
          (session.startTime >= nsStart && session.startTime < nsEnd) ||
          (endTime > nsStart && endTime <= nsEnd) ||
          (session.startTime <= nsStart && endTime >= nsEnd)
        );
      });

      if (isDuplicate || isDuplicateInNew) {
        errors.push(
          `Ca ${idx + 1}: Trùng với lịch khác (${session.startTime}-${endTime})`
        );
        return;
      }

      newSchedules.push({
        id: Date.now() + Math.random(),
        date: safeDateStr, // ✅ Sử dụng safe date string
        startTime: startTimeStr,
        endTime: endTimeStr,
        courseId: parseInt(classId),
        lessonId: null,
      });
    });

    if (errors.length > 0) {
      alert("❌ Lỗi:\n" + errors.join("\n"));
      return;
    }

    if (newSchedules.length === 0) {
      alert("⚠️ Không có lịch nào được thêm!");
      return;
    }

    // ✅ Lưu từng schedule vào database
    for (const schedule of newSchedules) {
      try {
        console.log("🔍 Schedule data to send:", schedule);
        console.log("🔍 Date being sent:", schedule.date);

        // Tạo session với timeslot trong một request (backend mới)
        await classService.createClassSession(classId, {
          title: schedule.sessionTitle || `Session ${schedules.length + 1}`,
          description: schedule.sessionDescription || "",
          timeslots: [
            {
              date: schedule.date,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              location: null,
            },
          ],
        });
      } catch (error) {
        console.error("Error saving schedule:", error);
        alert(`❌ Lỗi khi lưu lịch: ${error.message}`);
        return; // Stop if any schedule fails
      }
    }

    // Reload data từ database
    await loadData();

    // Reset sessions
    setSessions([
      { startTime: "08:00", durationHours: "4", durationMinutes: "0" },
    ]);
    alert(`✅ Đã thêm ${newSchedules.length} lịch học!`);
  };

  const handleAddSessionRow = () => {
    setSessions([
      ...sessions,
      { startTime: "08:00", durationHours: "4", durationMinutes: "0" },
    ]);
  };

  const handleRemoveSessionRow = (index) => {
    if (sessions.length === 1) {
      alert("⚠️ Phải có ít nhất một ca!");
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

  const handleRemoveSession = async (schedule) => {
    // Check xem buổi học đã qua chưa
    if (isDatePast(schedule.date)) {
      alert("⚠️ Không thể xóa lịch học đã qua hoặc đang diễn ra!");
      return;
    }

    if (!window.confirm("⚠️ Xóa lịch học này?")) return;

    try {
      // ✅ Xóa session từ database
      await classService.deleteClassSession(schedule.id);

      // Reload data từ database
      await loadData();
      alert("✅ Đã xóa lịch học!");
    } catch (error) {
      console.error("Error deleting schedule:", error);
      alert(`❌ Lỗi khi xóa lịch: ${error.message}`);
    }
  };

  const handleBulkAdd = async () => {
    if (!bulkConfig.startDate || !bulkConfig.endDate) {
      alert("⚠️ Vui lòng chọn khoảng thời gian!");
      return;
    }

    if (bulkSessions.length === 0) {
      alert("⚠️ Phải có ít nhất một ca học!");
      return;
    }

    // Validate từng ca
    const errors = [];
    bulkSessions.forEach((session, idx) => {
      if (!session.startTime) {
        errors.push(`Ca ${idx + 1}: Thiếu giờ bắt đầu`);
      }
      const hours = parseInt(session.durationHours) || 0;
      const minutes = parseInt(session.durationMinutes) || 0;
      if (hours === 0 && minutes === 0) {
        errors.push(`Ca ${idx + 1}: Thời lượng phải lớn hơn 0`);
      }
    });

    if (errors.length > 0) {
      alert("❌ Lỗi:\n" + errors.join("\n"));
      return;
    }

    const start = new Date(bulkConfig.startDate);
    const end = new Date(bulkConfig.endDate);
    const newSchedules = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let current = start;
    while (current <= end) {
      // Skip ngày đã qua
      if (current < today) {
        current = addDays(current, 1);
        continue;
      }

      let shouldAdd = false;
      const dayOfWeek = current.getDay();

      if (bulkConfig.type === "daily") {
        shouldAdd = true;
        if (bulkConfig.excludeWeekend) {
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            shouldAdd = false;
          }
        } else {
          if (bulkConfig.excludeSaturday && dayOfWeek === 6) {
            shouldAdd = false;
          }
          if (bulkConfig.excludeSunday && dayOfWeek === 0) {
            shouldAdd = false;
          }
        }
      } else if (bulkConfig.type === "weekly") {
        shouldAdd = bulkConfig.weekdays.includes(dayOfWeek);
      }

      if (shouldAdd) {
        // Capture current date to avoid unsafe reference
        const currentDate = new Date(current);

        // Thêm tất cả các ca cho ngày này
        bulkSessions.forEach((session) => {
          const hours = parseInt(session.durationHours) || 0;
          const minutes = parseInt(session.durationMinutes) || 0;
          const endTime = calculateEndTime(session.startTime, hours, minutes);

          newSchedules.push({
            id: Date.now() + Math.random(),
            date: format(currentDate, "yyyy-MM-dd"),
            startTime: session.startTime + ":00",
            endTime: endTime + ":00",
            courseId: parseInt(classId),
            lessonId: null,
          });
        });
      }

      current = addDays(current, 1);
    }

    if (newSchedules.length === 0) {
      alert("⚠️ Không có lịch nào được tạo!");
      return;
    }

    // ✅ Lưu từng schedule vào database
    for (const schedule of newSchedules) {
      try {
        console.log("🔍 Schedule data to send:", schedule);
        console.log("🔍 Date being sent:", schedule.date);

        // Tạo session với timeslot trong một request (backend mới)
        await classService.createClassSession(classId, {
          title: schedule.sessionTitle || `Session ${schedules.length + 1}`,
          description: schedule.sessionDescription || "",
          timeslots: [
            {
              date: schedule.date,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              location: null,
            },
          ],
        });
      } catch (error) {
        console.error("Error saving schedule:", error);
        alert(`❌ Lỗi khi lưu lịch: ${error.message}`);
        return; // Stop if any schedule fails
      }
    }

    // Reload data từ database
    await loadData();
    setShowBulkModal(false);
    setBulkSessions([]); // Reset bulk sessions
    alert(`✅ Đã thêm ${newSchedules.length} lịch học!`);
  };

  const handleAddBulkSession = () => {
    setBulkSessions([
      ...bulkSessions,
      { startTime: "08:00", durationHours: "4", durationMinutes: "0" },
    ]);
  };

  const handleRemoveBulkSession = (index) => {
    setBulkSessions(bulkSessions.filter((_, idx) => idx !== index));
  };

  const handleBulkSessionChange = (index, field, value) => {
    const updated = bulkSessions.map((s, idx) =>
      idx === index ? { ...s, [field]: value } : s
    );
    setBulkSessions(updated);
  };

  const handleWeekdayToggle = (day) => {
    setBulkConfig((prev) => ({
      ...prev,
      weekdays: prev.weekdays.includes(day)
        ? prev.weekdays.filter((d) => d !== day)
        : [...prev.weekdays, day].sort(),
    }));
  };

  if (loading) {
    return (
      <div className="schedule-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="schedule-page">
        <div className="error-container">
          <h2>❌ Không tìm thấy lớp học</h2>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/admin/classes")}
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  const days = getDaysInMonth();
  const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <div>
          <h1 className="schedule-title">📅 Quản Lý Lịch Học</h1>
          <p className="schedule-subtitle">
            Lớp: <strong>{course.ClassName || course.title}</strong>
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-success"
            onClick={() => setShowBulkModal(true)}
          >
            ➕ Thêm hàng loạt
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/admin/classes")}
          >
            ← Quay lại
          </button>
        </div>
      </div>

      <div className="calendar-container">
        <div className="calendar-nav">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            ◀ Tháng trước
          </button>
          <h2>{format(currentMonth, "MMMM yyyy", { locale: vi })}</h2>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            Tháng sau ▶
          </button>
        </div>

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
      </div>

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
                      {!isPast && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemoveSession(sch)}
                        >
                          🗑️ Xóa
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form thêm nhiều ca */}
          {!isDatePast(selectedDate) && (
            <div className="add-sessions-form">
              <h4>➕ Thêm lịch học mới</h4>

              {sessions.map((session, idx) => (
                <div key={idx} className="session-input-row">
                  <div className="session-number">Ca {idx + 1}</div>

                  <div className="session-inputs">
                    <div className="form-group-inline">
                      <label>Giờ bắt đầu:</label>
                      <input
                        type="time"
                        value={session.startTime}
                        onChange={(e) =>
                          handleSessionChange(idx, "startTime", e.target.value)
                        }
                      />
                    </div>

                    <div className="form-group-inline">
                      <label>Thời lượng:</label>
                      <div className="duration-inputs">
                        <input
                          type="number"
                          value={session.durationHours}
                          onChange={(e) =>
                            handleSessionChange(
                              idx,
                              "durationHours",
                              e.target.value
                            )
                          }
                          min="0"
                          max="12"
                          placeholder="Giờ"
                        />
                        <span>giờ</span>
                        <input
                          type="number"
                          value={session.durationMinutes}
                          onChange={(e) =>
                            handleSessionChange(
                              idx,
                              "durationMinutes",
                              e.target.value
                            )
                          }
                          min="0"
                          max="59"
                          placeholder="Phút"
                        />
                        <span>phút</span>
                      </div>
                    </div>

                    <div className="form-group-inline end-time-display">
                      <label>Kết thúc:</label>
                      <div className="calculated-time">
                        {calculateEndTime(
                          session.startTime,
                          session.durationHours,
                          session.durationMinutes
                        )}
                      </div>
                    </div>

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
              ))}

              <div className="session-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddSessionRow}
                >
                  ➕ Thêm ca học
                </button>
                <button className="btn btn-primary" onClick={handleAddSessions}>
                  ✅ Lưu tất cả ({sessions.length} ca)
                </button>
              </div>
            </div>
          )}

          {isDatePast(selectedDate) && (
            <div className="past-date-notice">
              <p>
                ⚠️ Ngày này đã qua. Chỉ có thể xem lịch, không thể chỉnh sửa.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal Bulk Add */}
      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>➕ Thêm lịch hàng loạt</h2>
              <button
                className="close-btn"
                onClick={() => setShowBulkModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Loại lịch:</label>
                <select
                  value={bulkConfig.type}
                  onChange={(e) =>
                    setBulkConfig({ ...bulkConfig, type: e.target.value })
                  }
                >
                  <option value="daily">Hằng ngày</option>
                  <option value="weekly">Hằng tuần</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Từ ngày:</label>
                  <input
                    type="date"
                    value={bulkConfig.startDate}
                    onChange={(e) =>
                      setBulkConfig({
                        ...bulkConfig,
                        startDate: e.target.value,
                      })
                    }
                  />
                  <small className="help-text">
                    Mặc định: Ngày bắt đầu lớp học
                  </small>
                </div>

                <div className="form-group">
                  <label>Đến ngày:</label>
                  <input
                    type="date"
                    value={bulkConfig.endDate}
                    onChange={(e) =>
                      setBulkConfig({ ...bulkConfig, endDate: e.target.value })
                    }
                  />
                  <small className="help-text">
                    Mặc định: Ngày kết thúc lớp học
                  </small>
                </div>
              </div>

              {bulkConfig.type === "daily" && (
                <div className="form-group">
                  <label>Loại trừ:</label>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={bulkConfig.excludeWeekend}
                        onChange={(e) =>
                          setBulkConfig({
                            ...bulkConfig,
                            excludeWeekend: e.target.checked,
                            excludeSaturday: false,
                            excludeSunday: false,
                          })
                        }
                      />
                      <span>Trừ cuối tuần (Thứ 7 & Chủ nhật)</span>
                    </label>

                    {!bulkConfig.excludeWeekend && (
                      <>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={bulkConfig.excludeSaturday}
                            onChange={(e) =>
                              setBulkConfig({
                                ...bulkConfig,
                                excludeSaturday: e.target.checked,
                              })
                            }
                          />
                          <span>Trừ thứ 7</span>
                        </label>

                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={bulkConfig.excludeSunday}
                            onChange={(e) =>
                              setBulkConfig({
                                ...bulkConfig,
                                excludeSunday: e.target.checked,
                              })
                            }
                          />
                          <span>Trừ chủ nhật</span>
                        </label>
                      </>
                    )}
                  </div>
                </div>
              )}

              {bulkConfig.type === "weekly" && (
                <div className="form-group">
                  <label>Chọn các thứ:</label>
                  <div className="weekday-selector">
                    {[
                      { value: 1, label: "Thứ 2" },
                      { value: 2, label: "Thứ 3" },
                      { value: 3, label: "Thứ 4" },
                      { value: 4, label: "Thứ 5" },
                      { value: 5, label: "Thứ 6" },
                      { value: 6, label: "Thứ 7" },
                      { value: 0, label: "CN" },
                    ].map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        className={`weekday-btn ${
                          bulkConfig.weekdays.includes(day.value)
                            ? "active"
                            : ""
                        }`}
                        onClick={() => handleWeekdayToggle(day.value)}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quản lý các ca học */}
              <div className="form-group">
                <div className="sessions-header">
                  <label>Các ca học:</label>
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    onClick={handleAddBulkSession}
                  >
                    ➕ Thêm ca
                  </button>
                </div>

                {bulkSessions.length === 0 ? (
                  <div className="no-sessions-notice">
                    <p>Chưa có ca học nào. Click "➕ Thêm ca" để bắt đầu.</p>
                  </div>
                ) : (
                  <div className="bulk-sessions-list">
                    {bulkSessions.map((session, idx) => (
                      <div key={idx} className="bulk-session-row">
                        <div className="bulk-session-number">Ca {idx + 1}</div>

                        <div className="bulk-session-inputs">
                          <div className="input-group-compact">
                            <label>Bắt đầu:</label>
                            <input
                              type="time"
                              value={session.startTime}
                              onChange={(e) =>
                                handleBulkSessionChange(
                                  idx,
                                  "startTime",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <div className="input-group-compact">
                            <label>Thời lượng:</label>
                            <div className="duration-inputs-compact">
                              <input
                                type="number"
                                value={session.durationHours}
                                onChange={(e) =>
                                  handleBulkSessionChange(
                                    idx,
                                    "durationHours",
                                    e.target.value
                                  )
                                }
                                min="0"
                                max="12"
                                placeholder="0"
                              />
                              <span>h</span>
                              <input
                                type="number"
                                value={session.durationMinutes}
                                onChange={(e) =>
                                  handleBulkSessionChange(
                                    idx,
                                    "durationMinutes",
                                    e.target.value
                                  )
                                }
                                min="0"
                                max="59"
                                placeholder="0"
                              />
                              <span>m</span>
                            </div>
                          </div>

                          <div className="bulk-end-time">
                            →{" "}
                            {calculateEndTime(
                              session.startTime,
                              session.durationHours,
                              session.durationMinutes
                            )}
                          </div>

                          <button
                            type="button"
                            className="btn-remove-bulk-session"
                            onClick={() => handleRemoveBulkSession(idx)}
                            title="Xóa ca này"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowBulkModal(false)}
              >
                ❌ Hủy
              </button>
              <button className="btn btn-primary" onClick={handleBulkAdd}>
                ✅ Thêm lịch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagementPage;
