// Conflict Utils - Utilities for handling timeslot conflicts
// Chạy: node conflictUtils.js

/**
 * Parse conflict error message từ backend
 * @param {string} errorMessage - Error message từ backend
 * @returns {object} Parsed conflict information
 */
export const parseConflictError = (errorMessage) => {
  // Format: "Instructor đã có ca học trùng thời gian: [ClassName] - [SessionTitle] ([Date] [StartTime]-[EndTime])"
  const match = errorMessage.match(
    /Instructor đã có ca học trùng thời gian: (.+?) - (.+?) \((.+?) (.+?)-(.+?)\)/
  );

  if (match) {
    return {
      className: match[1],
      sessionTitle: match[2],
      date: match[3],
      startTime: match[4],
      endTime: match[5],
    };
  }

  // Fallback nếu không parse được
  return {
    className: "Unknown",
    sessionTitle: "Unknown Session",
    date: "Unknown Date",
    startTime: "Unknown Time",
    endTime: "Unknown Time",
  };
};

/**
 * Hiển thị conflict error với thông tin chi tiết
 * @param {string} errorMessage - Error message từ backend
 * @returns {string} Formatted dialog message
 */
export const formatConflictError = (errorMessage) => {
  const conflictInfo = parseConflictError(errorMessage);

  return (
    `Trùng Ca Học\n\n` +
    `Instructor đã có ca học trùng thời gian tại:\n` +
    `• Lớp: ${conflictInfo.className}\n` +
    `• Session: ${conflictInfo.sessionTitle}\n` +
    `• Thời gian: ${conflictInfo.date} ${conflictInfo.startTime}-${conflictInfo.endTime}\n\n` +
    `Không thể tạo ca học mới vì trùng lịch với lớp "${conflictInfo.className}".\n` +
    `Vui lòng chọn thời gian khác để tránh trùng lịch.`
  );
};

/**
 * Kiểm tra xem error có phải là conflict error không
 * @param {string} errorMessage - Error message
 * @returns {boolean} True nếu là conflict error
 */
export const isConflictError = (errorMessage) => {
  if (!errorMessage) return false;

  // Kiểm tra các pattern conflict error từ backend
  const conflictPatterns = [
    "trùng thời gian",
    "trùng lịch",
    "conflict",
    "instructor đã có",
    "đã có ca học",
    "timeslot conflict",
    "schedule conflict",
  ];

  const lowerMessage = errorMessage.toLowerCase();
  return conflictPatterns.some((pattern) => lowerMessage.includes(pattern));
};

/**
 * Validate timeslot format trước khi gửi
 * @param {object} timeslot - Timeslot object
 * @returns {object} Validation result
 */
export const validateTimeslot = (timeslot) => {
  const { startTime, endTime, date } = timeslot;

  // Check format
  if (
    !/^\d{2}:\d{2}:\d{2}$/.test(startTime) ||
    !/^\d{2}:\d{2}:\d{2}$/.test(endTime)
  ) {
    return { valid: false, error: "Sai định dạng thời gian (HH:MM:SS)" };
  }

  // Check date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { valid: false, error: "Sai định dạng ngày (YYYY-MM-DD)" };
  }

  // Check time logic
  if (startTime >= endTime) {
    return {
      valid: false,
      error: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc",
    };
  }

  return { valid: true };
};

/**
 * Xử lý session creation error
 * @param {Error} error - Error object
 * @returns {object} Error handling result
 */
export const handleSessionCreationError = (error) => {
  if (isConflictError(error.message)) {
    return {
      type: "conflict",
      message: formatConflictError(error.message),
      action: "reschedule",
    };
  } else {
    return {
      type: "error",
      message: error.message || "Có lỗi xảy ra khi tạo session",
      action: "retry",
    };
  }
};

/**
 * Kiểm tra overlap thời gian
 * @param {string} start1 - Start time 1
 * @param {string} end1 - End time 1
 * @param {string} start2 - Start time 2
 * @param {string} end2 - End time 2
 * @returns {boolean} True nếu có overlap
 */
export const hasTimeOverlap = (start1, end1, start2, end2) => {
  return (
    (start1 <= start2 && end1 > start2) ||
    (start1 < end2 && end1 >= end2) ||
    (start1 >= start2 && end1 <= end2)
  );
};

/**
 * Format thời gian cho display
 * @param {string} time - Time string (HH:MM:SS)
 * @returns {string} Formatted time (HH:MM)
 */
export const formatTimeForDisplay = (time) => {
  return time.substring(0, 5); // Remove seconds
};

/**
 * Format ngày cho display
 * @param {string} date - Date string (YYYY-MM-DD)
 * @returns {string} Formatted date (DD/MM/YYYY)
 */
export const formatDateForDisplay = (date) => {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
};

export default {
  parseConflictError,
  formatConflictError,
  isConflictError,
  validateTimeslot,
  handleSessionCreationError,
  hasTimeOverlap,
  formatTimeForDisplay,
  formatDateForDisplay,

};
