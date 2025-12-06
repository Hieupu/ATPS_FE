import React from "react";
import { Box, Typography, Chip } from "@mui/material";

// Danh sách timeslot (giữ nguyên)
const timeslots = {
  1: { start: "08:00", end: "10:00", day: "Monday", dayVi: "Thứ 2" },
  2: { start: "10:20", end: "12:20", day: "Monday", dayVi: "Thứ 2" },
  3: { start: "13:00", end: "15:00", day: "Monday", dayVi: "Thứ 2" },
  4: { start: "15:20", end: "17:20", day: "Monday", dayVi: "Thứ 2" },
  5: { start: "17:40", end: "19:40", day: "Monday", dayVi: "Thứ 2" },
  6: { start: "20:00", end: "22:00", day: "Monday", dayVi: "Thứ 2" },
  7: { start: "08:00", end: "10:00", day: "Tuesday", dayVi: "Thứ 3" },
  8: { start: "10:20", end: "12:20", day: "Tuesday", dayVi: "Thứ 3" },
  9: { start: "13:00", end: "15:00", day: "Tuesday", dayVi: "Thứ 3" },
  10: { start: "15:20", end: "17:20", day: "Tuesday", dayVi: "Thứ 3" },
  11: { start: "17:40", end: "19:40", day: "Tuesday", dayVi: "Thứ 3" },
  12: { start: "20:00", end: "22:00", day: "Tuesday", dayVi: "Thứ 3" },
  13: { start: "08:00", end: "10:00", day: "Wednesday", dayVi: "Thứ 4" },
  14: { start: "10:20", end: "12:20", day: "Wednesday", dayVi: "Thứ 4" },
  15: { start: "13:00", end: "15:00", day: "Wednesday", dayVi: "Thứ 4" },
  16: { start: "15:20", end: "17:20", day: "Wednesday", dayVi: "Thứ 4" },
  17: { start: "17:40", end: "19:40", day: "Wednesday", dayVi: "Thứ 4" },
  18: { start: "20:00", end: "22:00", day: "Wednesday", dayVi: "Thứ 4" },
  19: { start: "08:00", end: "10:00", day: "Thursday", dayVi: "Thứ 5" },
  20: { start: "10:20", end: "12:20", day: "Thursday", dayVi: "Thứ 5" },
  21: { start: "13:00", end: "15:00", day: "Thursday", dayVi: "Thứ 5" },
  22: { start: "15:20", end: "17:20", day: "Thursday", dayVi: "Thứ 5" },
  23: { start: "17:40", end: "19:40", day: "Thursday", dayVi: "Thứ 5" },
  24: { start: "20:00", end: "22:00", day: "Thursday", dayVi: "Thứ 5" },
  25: { start: "08:00", end: "10:00", day: "Friday", dayVi: "Thứ 6" },
  26: { start: "10:20", end: "12:20", day: "Friday", dayVi: "Thứ 6" },
  27: { start: "13:00", end: "15:00", day: "Friday", dayVi: "Thứ 6" },
  28: { start: "15:20", end: "17:20", day: "Friday", dayVi: "Thứ 6" },
  29: { start: "17:40", end: "19:40", day: "Friday", dayVi: "Thứ 6" },
  30: { start: "20:00", end: "22:00", day: "Friday", dayVi: "Thứ 6" },
  31: { start: "08:00", end: "10:00", day: "Saturday", dayVi: "Thứ 7" },
  32: { start: "10:20", end: "12:20", day: "Saturday", dayVi: "Thứ 7" },
  33: { start: "13:00", end: "15:00", day: "Saturday", dayVi: "Thứ 7" },
  34: { start: "15:20", end: "17:20", day: "Saturday", dayVi: "Thứ 7" },
  35: { start: "17:40", end: "19:40", day: "Saturday", dayVi: "Thứ 7" },
  36: { start: "20:00", end: "22:00", day: "Saturday", dayVi: "Thứ 7" },
  37: { start: "08:00", end: "10:00", day: "Sunday", dayVi: "Chủ nhật" },
  38: { start: "10:20", end: "12:20", day: "Sunday", dayVi: "Chủ nhật" },
  39: { start: "13:00", end: "15:00", day: "Sunday", dayVi: "Chủ nhật" },
  40: { start: "15:20", end: "17:20", day: "Sunday", dayVi: "Chủ nhật" },
  41: { start: "17:40", end: "19:40", day: "Sunday", dayVi: "Chủ nhật" },
  42: { start: "20:00", end: "22:00", day: "Sunday", dayVi: "Chủ nhật" }
};

// Thứ tự sắp xếp các ngày trong tuần
const dayOrder = {
  "Thứ 2": 1,
  "Thứ 3": 2, 
  "Thứ 4": 3,
  "Thứ 5": 4,
  "Thứ 6": 5,
  "Thứ 7": 6,
  "Chủ nhật": 7
};

const PriceSummary = ({
  finalPrice,
  formatCurrency,
  courseInfo,
  instructor,
  selectedWeek,
  availableWeeks,
  requiredNumberOfSessions,
  selectedSlots,
}) => {
  // Hàm tính ngày bắt đầu và kết thúc với lịch cố định
  const calculateCourseDates = () => {
    if (!selectedSlots || selectedSlots.length === 0 || !requiredNumberOfSessions) return null;
    
    const startDate = new Date(Math.min(...selectedSlots.map(slot => new Date(slot.Date))));
    const sessionsPerWeek = selectedSlots.length;
    const totalWeeksNeeded = Math.ceil(requiredNumberOfSessions / sessionsPerWeek);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + ((totalWeeksNeeded - 1) * 7));
    
    return { 
      startDate, 
      endDate, 
      totalSessions: requiredNumberOfSessions,
      sessionsPerWeek,
      totalWeeks: totalWeeksNeeded
    };
  };

  // Hàm định dạng ngày
  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Hàm lấy thông tin slot chi tiết
  const getSlotInfo = (timeslotId) => {
    return timeslots[timeslotId] || { start: "N/A", end: "N/A", dayVi: "N/A" };
  };

  // Hàm lấy ngày cụ thể từ slot
  const getSlotDate = (slot) => {
    const date = new Date(slot.Date);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Sắp xếp selectedSlots theo thứ tự trong tuần
  const getSortedSlots = () => {
    return [...selectedSlots].sort((a, b) => {
      const aInfo = getSlotInfo(a.TimeslotID);
      const bInfo = getSlotInfo(b.TimeslotID);
      
      const aDayOrder = dayOrder[aInfo.dayVi] || 8;
      const bDayOrder = dayOrder[bInfo.dayVi] || 8;
      
      if (aDayOrder === bDayOrder) {
        return aInfo.start.localeCompare(bInfo.start);
      }
      
      return aDayOrder - bDayOrder;
    });
  };

  const courseDates = calculateCourseDates();
  const sortedSlots = getSortedSlots();

  return (
    <>
      {/* Tổng tiền khóa học */}
     <Box
  sx={{
    p: 2,
    mb: 2,
    bgcolor: "grey.50",
    borderRadius: 2,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid",
    borderColor: "divider",
  }}
>
  <Typography variant="body1" sx={{ fontWeight: 600 }}>
    Tổng tiền khóa học:
  </Typography>
  <Typography
    variant="h6"
    sx={{ fontWeight: 700, color: "text.primary" }}
  >
    {formatCurrency(finalPrice)}
  </Typography>
</Box>

      {/* Tóm tắt lựa chọn */}
      {courseInfo && selectedWeek && (
        <Box
          sx={{
            p: 2.5,
            bgcolor: "white",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: "text.primary" }}>
            Tóm tắt lựa chọn:
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 0.5, color: "text.secondary" }}>
            <strong>Khóa học:</strong> {courseInfo?.Title || "N/A"}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
            <strong>Giáo viên:</strong> {instructor?.FullName || "N/A"}
          </Typography>
          
          {/* Thông tin lịch học cố định - NỀN TRẮNG */}
          {courseDates && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: "white", 
              borderRadius: 1.5,
              border: "2px solid #e3f2fd"
            }}>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 700, 
                mb: 2, 
                color: "primary.main",
                fontSize: "0.95rem"
              }}>
                📅 LỊCH HỌC CỐ ĐỊNH
              </Typography>
              
              {/* Ngày bắt đầu và kết thúc trên 1 dòng */}
              <Box sx={{ 
                display: 'flex', 
                gap: 3, 
                mb: 1.5,
                flexWrap: 'wrap'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label="Bắt đầu" 
                    size="small" 
                    sx={{ 
                      bgcolor: '#e8f5e9',
                      color: '#2e7d32',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }} 
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                    {formatDate(courseDates.startDate)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label="Kết thúc" 
                    size="small" 
                    sx={{ 
                      bgcolor: '#fce4ec',
                      color: '#c2185b',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }} 
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                    {formatDate(courseDates.endDate)}
                  </Typography>
                </Box>
              </Box>
              
              {/* Số tuần và buổi/tuần trên 1 dòng */}
              <Box sx={{ 
                display: 'flex', 
                gap: 3, 
                flexWrap: 'wrap'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label="Số tuần" 
                    size="small" 
                    sx={{ 
                      bgcolor: '#e3f2fd',
                      color: '#1565c0',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }} 
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                    {courseDates.totalWeeks} tuần
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label="Buổi/tuần" 
                    size="small" 
                    sx={{ 
                      bgcolor: '#fff3e0',
                      color: '#e65100',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }} 
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                    {courseDates.sessionsPerWeek} buổi
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label="Tổng buổi" 
                    size="small" 
                    sx={{ 
                      bgcolor: '#f3e5f5',
                      color: '#6a1b9a',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }} 
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                    {courseDates.totalSessions} buổi
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
          
          {/* Lịch học hàng tuần */}
          {sortedSlots.length > 0 && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: "white", 
              borderRadius: 1.5,
              border: "2px solid #e1f5fe"
            }}>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 700, 
                mb: 2, 
                color: "info.dark",
                fontSize: "0.95rem"
              }}>
                🗓️ LỊCH HỌC HÀNG TUẦN
              </Typography>
              
              {sortedSlots.map((slot, index) => {
                const slotInfo = getSlotInfo(slot.TimeslotID);
                const slotDate = getSlotDate(slot);
                
                return (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5, 
                      mb: 1.5,
                      p: 1.5,
                      bgcolor: '#fafafa',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0',
                      '&:last-child': { mb: 0 }
                    }}
                  >
                    <Chip 
                      label={`${index + 1}`} 
                      size="small" 
                      sx={{ 
                        minWidth: '32px',
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontWeight: 700
                      }}
                    />
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.3, color: "text.primary" }}>
                        {slotInfo.dayVi}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, mb: 0.3 }}>
                        {slotInfo.start} - {slotInfo.end}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
          
        </Box>
      )}
    </>
  );
};

export default PriceSummary;