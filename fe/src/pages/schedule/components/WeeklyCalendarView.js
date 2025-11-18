import React, { useState, useMemo, useEffect } from "react";
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
  Chip,
  Button,
  Tooltip,
  Paper
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  VideoCall,
} from "@mui/icons-material";

const WeeklyCalendarView = ({ schedules, attendanceData, generateZoomLink, canJoinZoom }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const timeSlots = [
    { label: "Slot 1", start: "07:30", end: "09:00" },
    { label: "Slot 2", start: "09:00", end: "10:30" },
    { label: "Slot 3", start: "10:30", end: "12:00" },
    { label: "Slot 4", start: "12:30", end: "14:00" },
    { label: "Slot 5", start: "14:00", end: "15:30" },
    { label: "Slot 6", start: "15:30", end: "17:00" },
    { label: "Slot 7", start: "17:30", end: "19:00" },
    { label: "Slot 8", start: "19:00", end: "20:30" }
  ];

  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

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

  const attendanceMap = useMemo(() => {
    const map = new Map();
    attendanceData.forEach(att => {
      map.set(att.SessionID, att);
    });
    return map;
  }, [attendanceData]);

  const scheduleGrid = useMemo(() => {
    const grid = {};
    
    schedules.forEach(schedule => {
      const scheduleDate = new Date(schedule.Date);
      const dateStr = scheduleDate.toISOString().split('T')[0];
      const startTime = schedule.StartTime?.substring(0, 5);
      
      const slotIndex = timeSlots.findIndex(slot => slot.start === startTime);
      
      if (slotIndex !== -1) {
        const key = `${dateStr}-${slotIndex}`;
        if (!grid[key]) grid[key] = [];
        
        const attendance = attendanceMap.get(schedule.SessionID);
        grid[key].push({
          ...schedule,
          attendance: attendance || null
        });
      }
    });
    
    return grid;
  }, [schedules, timeSlots, attendanceMap]);

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
    
    const schedulesInYear = schedules.filter(schedule => {
      const scheduleYear = new Date(schedule.Date).getFullYear();
      return scheduleYear === year;
    });
    
    if (schedulesInYear.length > 0) {
      const firstScheduleDate = new Date(schedulesInYear[0].Date);
      setCurrentDate(firstScheduleDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setFullYear(year);
      newDate.setMonth(0);
      newDate.setDate(1);
      setCurrentDate(newDate);
    }
  };

  const formatDateRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.getDate()}/${start.getMonth() + 1} To ${end.getDate()}/${end.getMonth() + 1}`;
  };

  const getAttendanceColor = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case 'present': return '#4caf50';
      case 'absent': return '#f44336';
      case 'late': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  const getAttendanceLabel = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case 'present': return 'attended';
      case 'absent': return 'absent';
      case 'late': return 'late';
      default: return 'pending';
    }
  };

  const handleJoinZoom = (schedule) => {
    sessionStorage.setItem('zoomScheduleData', JSON.stringify({
      schedule: schedule,
      timestamp: new Date().getTime()
    }));

    setTimeout(() => {
      window.open('/zoom', '_blank');
    }, 100);
  };

  const renderScheduleCard = (schedule, slot, idx) => (
    <Paper
      key={idx}
      elevation={2}
      sx={{
        p: 1.5,
        mb: 1,
        borderLeft: 4,
        borderColor: schedule.attendance 
          ? getAttendanceColor(schedule.attendance.Status)
          : '#9e9e9e',
        '&:hover': {
          boxShadow: 4
        }
      }}
    >
      <Typography 
        variant="body2" 
        sx={{ 
          fontWeight: 600, 
          color: '#1976d2',
          mb: 0.5,
          fontSize: '0.85rem'
        }}
      >
        {schedule.ClassName || schedule.CourseTitle}
      </Typography>

      {schedule.attendance && (
        <Chip
          label={getAttendanceLabel(schedule.attendance.Status)}
          size="small"
          sx={{
            bgcolor: getAttendanceColor(schedule.attendance.Status),
            color: 'white',
            fontWeight: 500,
            fontSize: '0.7rem',
            height: 20,
            mb: 0.5
          }}
        />
      )}

      <Typography 
        variant="caption" 
        sx={{ 
          display: 'block',
          color: '#4caf50',
          fontWeight: 500,
          mb: 0.5
        }}
      >
        ({slot.start}-{slot.end})
      </Typography>

      {schedule.Location && (
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
          at {schedule.Location}
        </Typography>
      )}

      {canJoinZoom(schedule) && (
        <Tooltip title="Tham gia Zoom">
          <Button
            variant="contained"
            size="small"
            startIcon={<VideoCall />}
            onClick={() => handleJoinZoom(schedule)}
            sx={{
              mt: 1,
              fontSize: '0.7rem',
              py: 0.5,
              px: 1,
              backgroundColor: '#ff9800',
              '&:hover': {
                backgroundColor: '#f57c00',
              }
            }}
            fullWidth
          >
            Zoom
          </Button>
        </Tooltip>
      )}
    </Paper>
  );

  const renderLegendItem = (color, label) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 20, height: 20, bgcolor: color, borderRadius: 0.5 }} />
      <Typography variant="body2">{label}</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontWeight: 600, color: '#f44336', minWidth: 50 }}>
            YEAR
          </Typography>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={selectedYear}
              onChange={handleYearChange}
              sx={{ bgcolor: 'white' }}
            >
              {[2023, 2024, 2025, 2026].map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontWeight: 600, minWidth: 50 }}>
            WEEK
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'white', border: '1px solid #ccc', borderRadius: 1 }}>
            <IconButton onClick={handlePreviousWeek} size="small">
              <ChevronLeft />
            </IconButton>
            <Typography sx={{ px: 2, minWidth: 140, textAlign: 'center' }}>
              {formatDateRange()}
            </Typography>
            <IconButton onClick={handleNextWeek} size="small">
              <ChevronRight />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ border: '1px solid #ddd' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 600, width: 100 }} />
              {daysOfWeek.map((day, index) => (
                <TableCell 
                  key={day} 
                  align="center" 
                  sx={{ 
                    bgcolor: day === 'SAT' || day === 'SUN' ? '#fce4ec' : '#e3f2fd',
                    fontWeight: 600,
                    py: 1
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {day}
                  </Typography>
                  <Typography variant="body2">
                    {weekDates[index].getDate()}/{weekDates[index].getMonth() + 1}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {timeSlots.map((slot, slotIndex) => (
              <TableRow key={slotIndex}>
                <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>
                  <Typography variant="body2">{slot.label}</Typography>
                </TableCell>
                {weekDates.map((date, dayIndex) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const key = `${dateStr}-${slotIndex}`;
                  const cellSchedules = scheduleGrid[key] || [];

                  return (
                    <TableCell 
                      key={dayIndex} 
                      sx={{ 
                        p: 1, 
                        verticalAlign: 'top',
                        bgcolor: cellSchedules.length > 0 ? '#fff' : '#fafafa',
                        minHeight: 80
                      }}
                    >
                      {cellSchedules.length > 0 ? (
                        cellSchedules.map((schedule, idx) => 
                          renderScheduleCard(schedule, slot, idx)
                        )
                      ) : (
                        <Typography variant="body2" align="center" sx={{ color: '#999' }}>
                          -
                        </Typography>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', gap: 3, justifyContent: 'center' }}>
        {renderLegendItem('#4caf50', 'Có mặt')}
        {renderLegendItem('#f44336', 'Vắng mặt')}
        {renderLegendItem('#ff9800', 'Đi muộn')}
        {renderLegendItem('#9e9e9e', 'Chưa điểm danh')}
      </Box>
    </Box>
  );
};

export default WeeklyCalendarView;