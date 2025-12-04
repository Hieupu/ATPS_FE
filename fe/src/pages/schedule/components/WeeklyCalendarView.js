import React, { useState, useMemo, useEffect } from "react";

const WeeklyCalendarView = ({ schedules, attendanceData, canJoinZoom }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(null);

  const timeSlots = [
    { label: "Ca 1", start: "08:00", end: "10:00" },
    { label: "Ca 2", start: "10:20", end: "12:20" },
    { label: "Ca 3", start: "13:00", end: "15:00" },
    { label: "Ca 4", start: "15:20", end: "17:20" },
    { label: "Ca 5", start: "18:00", end: "20:00" },
    { label: "Ca 6", start: "20:00", end: "22:00" }
  ];
  
const daysOfWeek = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];


  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const availableWeeks = useMemo(() => {
    const weeks = new Map();
    
    schedules.forEach(schedule => {
      const scheduleDate = new Date(schedule.Date);
      const scheduleYear = scheduleDate.getFullYear();
      
      if (scheduleYear === selectedYear) {
        const weekStart = getWeekStart(scheduleDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeks.has(weekKey)) {
          weeks.set(weekKey, {
            weekStart: weekStart,
            weekEnd: weekEnd,
            weekNumber: getWeekNumber(weekStart),
            label: `Tuần ${getWeekNumber(weekStart)} (${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1})`
          });
        }
      }
    });
    
    return Array.from(weeks.values()).sort((a, b) => a.weekStart - b.weekStart);
  }, [schedules, selectedYear]);

  useEffect(() => {
    if (availableWeeks.length > 0) {
      const now = new Date();
      const currentWeekStart = getWeekStart(now);
      
      let closestWeek = availableWeeks[0];
      let minDiff = Math.abs(currentWeekStart - availableWeeks[0].weekStart);
      
      availableWeeks.forEach(week => {
        const diff = Math.abs(currentWeekStart - week.weekStart);
        if (diff < minDiff) {
          minDiff = diff;
          closestWeek = week;
        }
      });
      
      setSelectedWeek(closestWeek.weekStart.toISOString().split('T')[0]);
      setCurrentDate(closestWeek.weekStart);
    }
  }, [availableWeeks]);

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

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const handleWeekChange = (e) => {
    const weekKey = e.target.value;
    setSelectedWeek(weekKey);
    const selectedWeekData = availableWeeks.find(w => w.weekStart.toISOString().split('T')[0] === weekKey);
    if (selectedWeekData) {
      setCurrentDate(selectedWeekData.weekStart);
    }
  };

  const getAttendanceColor = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case 'present': return '#4caf50';
      case 'absent': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getAttendanceLabel = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case 'present': return 'Attended';
      case 'absent': return 'Absent';
      default: return 'Not yet';
    }
  };

  const handleJoinZoom = (schedule) => {
    sessionStorage.setItem('zoomScheduleData', JSON.stringify({
      schedule: schedule,
      timestamp: new Date().getTime()
    }));

    setTimeout(() => {
      window.open(`/zoom/${schedule.ZoomID}/${schedule.Zoompass}`, '_blank');
    }, 100);
  };

  const renderScheduleCard = (schedule, slot, idx) => (
    <div
      key={idx}
      style={{
        padding: '12px',
        marginBottom: '8px',
        borderLeft: `4px solid ${getAttendanceColor(schedule.attendance?.Status)}`,
        backgroundColor: '#fff',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '180px',
        minHeight: '80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'box-shadow 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'}
    >
      <div>
        <div style={{
          fontWeight: 600,
          color: '#1976d2',
          marginBottom: '6px',
          fontSize: '0.8rem',
          lineHeight: '1.2',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {schedule.ClassName || schedule.CourseTitle}
        </div>

        <span style={{
          display: 'inline-block',
          padding: '2px 8px',
          backgroundColor: getAttendanceColor(schedule.attendance?.Status),
          color: 'white',
          borderRadius: '12px',
          fontSize: '0.65rem',
          fontWeight: 500,
          marginBottom: '6px'
        }}>
          {getAttendanceLabel(schedule.attendance?.Status)}
        </span>
      </div>

      <div>
        <div style={{
          display: 'block',
          color: '#4caf50',
          fontWeight: 500,
          fontSize: '0.75rem',
          marginBottom: '6px'
        }}>
          {slot.start}-{slot.end}
        </div>

        {canJoinZoom(schedule) && (
          <button
            onClick={() => handleJoinZoom(schedule)}
            style={{
              width: '100%',
              padding: '4px 8px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f57c00'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff9800'}
          >
            Tham gia Zoom
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{
              fontWeight: 700,
              color: '#d32f2f',
              minWidth: '50px',
              fontSize: '1.1rem'
            }}>
              NĂM
            </label>
            <select
              value={selectedYear}
              onChange={handleYearChange}
              style={{
                padding: '8px 12px',
                fontSize: '0.95rem',
                fontWeight: 600,
                border: '2px solid #d32f2f',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                minWidth: '100px'
              }}
            >
              {[2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{
              fontWeight: 700,
              color: '#1976d2',
              minWidth: '60px',
              fontSize: '1.1rem'
            }}>
              TUẦN
            </label>
            <select
              value={selectedWeek || ''}
              onChange={handleWeekChange}
              disabled={availableWeeks.length === 0}
              style={{
                padding: '8px 12px',
                fontSize: '0.95rem',
                fontWeight: 600,
                border: '2px solid #1976d2',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: availableWeeks.length === 0 ? 'not-allowed' : 'pointer',
                minWidth: '280px',
                opacity: availableWeeks.length === 0 ? 0.6 : 1
              }}
            >
              {availableWeeks.length === 0 ? (
                <option disabled>No schedules available for {selectedYear}</option>
              ) : (
                availableWeeks.map((week) => (
                  <option
                    key={week.weekStart.toISOString().split('T')[0]}
                    value={week.weekStart.toISOString().split('T')[0]}
                  >
                    {week.label}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      <div style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: 'white'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{
                backgroundColor: '#f1f8e9',
                fontWeight: 700,
                width: '100px',
                fontSize: '0.9rem',
                borderRight: '1px solid #e0e0e0',
                padding: '12px'
              }} />
              {daysOfWeek.map((day, index) => (
                <th
                  key={day}
                  style={{
                    backgroundColor: day === 'SAT' || day === 'SUN' ? '#fce4ec' : '#e3f2fd',
                    fontWeight: 700,
                    padding: '12px',
                    fontSize: '0.9rem',
                    borderRight: index < daysOfWeek.length - 1 ? '1px solid #e0e0e0' : 'none',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {day}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                    {weekDates[index].getDate()}/{weekDates[index].getMonth() + 1}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, slotIndex) => (
              <tr key={slotIndex}>
                <td style={{
                  backgroundColor: '#f1f8e9',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  borderRight: '1px solid #e0e0e0',
                  padding: '12px',
                  verticalAlign: 'top'
                }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{slot.label}</div>
                    <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '4px' }}>
                      {slot.start}-{slot.end}
                    </div>
                  </div>
                </td>
                {weekDates.map((date, dayIndex) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const key = `${dateStr}-${slotIndex}`;
                  const cellSchedules = scheduleGrid[key] || [];

                  return (
                    <td
                      key={dayIndex}
                      style={{
                        padding: '8px',
                        verticalAlign: 'top',
                        backgroundColor: cellSchedules.length > 0 ? '#fff' : '#fafafa',
                        minHeight: '120px',
                        width: '14.28%',
                        maxWidth: '200px',
                        borderRight: dayIndex < daysOfWeek.length - 1 ? '1px solid #e0e0e0' : 'none',
                        borderTop: '1px solid #e0e0e0'
                      }}
                    >
                      {cellSchedules.length > 0 ? (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}>
                          {cellSchedules.map((schedule, idx) =>
                            renderScheduleCard(schedule, slot, idx)
                          )}
                        </div>
                      ) : (
                        <div style={{ height: '100%', minHeight: '80px' }} />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeeklyCalendarView;