// Hàm tạo link Zoom thực tế
export const generateZoomLink = (schedule) => {
  if (schedule.ZoomUUID && schedule.ZoomUUID.startsWith('http')) {
    return schedule.ZoomUUID; // Nếu đã là link đầy đủ
  }
  
  if (schedule.ZoomID && schedule.Zoompass) {
    // Tạo link Zoom với ID và password
    return `https://zoom.us/j/${schedule.ZoomID}?pwd=${schedule.Zoompass}`;
  }
  
  if (schedule.ZoomID) {
    // Chỉ có ID không có password
    return `https://zoom.us/j/${schedule.ZoomID}`;
  }
  
  if (schedule.ZoomUUID) {
    // Sử dụng ZoomUUID nếu không có ZoomID
    return `https://zoom.us/j/${schedule.ZoomUUID}`;
  }
  
  return null;
};

// Hàm kiểm tra có thể tham gia Zoom không
export const canJoinZoom = (schedule) => {
  return schedule.ZoomID || schedule.ZoomUUID || schedule.hasZoom;
};

// Hàm parse date từ string
export const parseDate = (dateString) => {
  if (dateString === "Chưa có lịch") return null;
  
  const parts = dateString.split("/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day, 12, 0, 0);
  }
  return null;
};

// Hàm group schedules theo date
export const groupSchedulesByDate = (schedules) => {
  return schedules.reduce((acc, schedule) => {
    const date = schedule.formattedDate || "Chưa có lịch";
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {});
};