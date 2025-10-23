// Utility functions for time calculations

/**
 * Tính toán thời gian bắt đầu và kết thúc từ session timeslots
 * @param {Array} schedule - Array của session timeslots
 * @returns {Object} - { startDate, endDate, hasSchedule }
 * Updated: 2025-01-23 - Cải thiện xử lý session timeslots
 */
export const calculateClassTimeFromSchedule = (schedule) => {
  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
    return {
      startDate: null,
      endDate: null,
      hasSchedule: false,
    };
  }

  const dates = [];

  // Xử lý từng session trong schedule
  schedule.forEach((session) => {
    // Nếu session có Timeslots array
    if (session.Timeslots && Array.isArray(session.Timeslots)) {
      session.Timeslots.forEach((timeslot) => {
        if (timeslot.Date) {
          const date = new Date(timeslot.Date);
          if (!isNaN(date.getTime())) {
            dates.push(date);
          }
        }
      });
    }

    // Nếu session có Date trực tiếp
    if (session.Date) {
      const date = new Date(session.Date);
      if (!isNaN(date.getTime())) {
        dates.push(date);
      }
    }

    // Các format khác
    if (session.date) {
      const date = new Date(session.date);
      if (!isNaN(date.getTime())) {
        dates.push(date);
      }
    }
    if (session.StartDate) {
      const date = new Date(session.StartDate);
      if (!isNaN(date.getTime())) {
        dates.push(date);
      }
    }
    if (session.startDate) {
      const date = new Date(session.startDate);
      if (!isNaN(date.getTime())) {
        dates.push(date);
      }
    }
  });

  if (dates.length === 0) {
    return {
      startDate: null,
      endDate: null,
      hasSchedule: false,
    };
  }

  // Tìm ngày đầu tiên và cuối cùng từ tất cả session timeslots
  const startDate = new Date(Math.min(...dates));
  const endDate = new Date(Math.max(...dates));

  return {
    startDate: startDate.toISOString().split("T")[0], // Format: YYYY-MM-DD
    endDate: endDate.toISOString().split("T")[0], // Format: YYYY-MM-DD
    hasSchedule: true,
  };
};

/**
 * Format ngày tháng để hiển thị
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @returns {string} - Formatted date (DD/MM/YYYY)
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * Tính toán thời gian hiển thị cho class
 * @param {Object} classItem - Class object
 * @returns {string} - Formatted time string
 * Updated: 2025-01-21 - Fixed schedule data handling
 * Updated: 2025-01-23 - Sử dụng dữ liệu từ backend API mới
 * Updated: 2025-01-23 - Ưu tiên hiển thị ngày bắt đầu - ngày kết thúc từ session timeslots
 */
export const getClassTimeDisplay = (classItem) => {
  // Ưu tiên cao nhất: Sử dụng ngày bắt đầu và kết thúc từ session timeslots
  if (classItem.firstSessionDate && classItem.lastSessionDate) {
    return `${formatDate(classItem.firstSessionDate)} - ${formatDate(
      classItem.lastSessionDate
    )}`;
  }

  // Ưu tiên thứ hai: Sử dụng thông tin từ backend API mới
  if (classItem.sessionTimesList) {
    return classItem.sessionTimesList;
  }

  if (classItem.sessionDatesList) {
    return classItem.sessionDatesList;
  }

  // Nếu có StartDate và EndDate trực tiếp (chỉ khi không có schedule)
  if (classItem.StartDate && classItem.EndDate && !classItem.schedule) {
    return `${formatDate(classItem.StartDate)} - ${formatDate(
      classItem.EndDate
    )}`;
  }

  // Nếu có schedule, tính từ schedule
  if (
    classItem.schedule &&
    Array.isArray(classItem.schedule) &&
    classItem.schedule.length > 0
  ) {
    const { startDate, endDate, hasSchedule } = calculateClassTimeFromSchedule(
      classItem.schedule
    );
    if (hasSchedule) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
  }

  // Nếu có _original.schedule
  if (
    classItem._original?.schedule &&
    Array.isArray(classItem._original.schedule) &&
    classItem._original.schedule.length > 0
  ) {
    const { startDate, endDate, hasSchedule } = calculateClassTimeFromSchedule(
      classItem._original.schedule
    );
    if (hasSchedule) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
  }

  // Fallback
  return "Chưa có lịch học";
};
