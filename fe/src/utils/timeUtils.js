// Utility functions for time calculations

/**
 * Tính toán thời gian bắt đầu và kết thúc từ session timeslots
 * @param {Array} schedule - Array của session timeslots
 * @returns {Object} - { startDate, endDate, hasSchedule }
 */
export const calculateClassTimeFromSchedule = (schedule) => {
  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
    return {
      startDate: null,
      endDate: null,
      hasSchedule: false,
    };
  }

  // Lấy tất cả các ngày từ schedule
  const dates = schedule
    .map((session) => {
      // Có thể có nhiều format khác nhau
      if (session.Date) return new Date(session.Date);
      if (session.date) return new Date(session.date);
      if (session.StartDate) return new Date(session.StartDate);
      if (session.startDate) return new Date(session.startDate);
      return null;
    })
    .filter((date) => date && !isNaN(date.getTime()));

  if (dates.length === 0) {
    return {
      startDate: null,
      endDate: null,
      hasSchedule: false,
    };
  }

  // Tìm ngày đầu tiên và cuối cùng
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
 */
export const getClassTimeDisplay = (classItem) => {
  // Nếu có StartDate và EndDate trực tiếp
  if (classItem.StartDate && classItem.EndDate) {
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
  return "Sẽ được tính từ session timeslots";
};
