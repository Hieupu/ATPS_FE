import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from "@mui/icons-material";
import { getAttendanceCalendarApi } from "../../../apiServices/attendanceService";

const AttendanceCalendar = ({ learnerId }) => {
  const [calendar, setCalendar] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const loadCalendar = useCallback(async () => {
    try {
      setLoading(true);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const data = await getAttendanceCalendarApi(learnerId, month, year);
      setCalendar(data.calendar || []);
    } catch (error) {
      console.error("Error loading calendar:", error);
    } finally {
      setLoading(false);
    }
  }, [learnerId, currentDate]);

  useEffect(() => {
    if (learnerId) {
      loadCalendar();
    }
  }, [learnerId, loadCalendar]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getAttendanceForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendar.filter(item => {
      const sessionDate = new Date(item.SessionDate).toISOString().split('T')[0];
      return sessionDate === dateStr;
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "present": return "#4caf50";
      case "absent": return "#f44336";
      case "late": return "#ff9800";
      default: return "#9e9e9e";
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <IconButton onClick={handlePrevMonth}>
            <KeyboardArrowLeft />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {currentDate.toLocaleString("vi-VN", { month: "long", year: "numeric" })}
          </Typography>
          <IconButton onClick={handleNextMonth}>
            <KeyboardArrowRight />
          </IconButton>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
              <Box
                key={day}
                sx={{
                  textAlign: "center",
                  fontWeight: 600,
                  color: "text.secondary",
                  py: 1,
                }}
              >
                {day}
              </Box>
            ))}

            {emptyDays.map((_, index) => (
              <Box key={`empty-${index}`} />
            ))}

            {days.map((day) => {
              const attendances = getAttendanceForDate(day);
              const hasAttendance = attendances.length > 0;

              return (
                <Tooltip
                  key={day}
                  title={
                    hasAttendance
                      ? attendances.map((a) => `${a.CourseTitle} - ${a.StatusText}`).join(", ")
                      : ""
                  }
                >
                  <Box
                    sx={{
                      aspectRatio: "1",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                      cursor: hasAttendance ? "pointer" : "default",
                      bgcolor: hasAttendance ? "action.hover" : "transparent",
                      position: "relative",
                      "&:hover": hasAttendance ? { bgcolor: "action.selected" } : {},
                    }}
                  >
                    <Typography variant="body2">{day}</Typography>
                    {hasAttendance && (
                      <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
                        {attendances.map((a, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              bgcolor: getStatusColor(a.Status),
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceCalendar;