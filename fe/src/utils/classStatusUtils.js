// Utility functions for class status management

/**
 * Kiểm tra xem có session nào trong tương lai không
 * @param {Array} schedule - Array của session timeslots
 * @returns {boolean} - true nếu có session trong tương lai
 */
export const hasFutureSessions = (schedule) => {
  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
    return false;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Reset time to start of day

  return schedule.some((session) => {
    let sessionDate = null;

    // Có thể có nhiều format khác nhau
    if (session.Date) sessionDate = new Date(session.Date);
    if (session.date) sessionDate = new Date(session.date);
    if (session.StartDate) sessionDate = new Date(session.StartDate);
    if (session.startDate) sessionDate = new Date(session.startDate);

    if (!sessionDate || isNaN(sessionDate.getTime())) {
      return false;
    }

    sessionDate.setHours(0, 0, 0, 0); // Reset time to start of day
    return sessionDate >= now;
  });
};

/**
 * Kiểm tra xem có session nào đã diễn ra chưa
 * @param {Array} schedule - Array của session timeslots
 * @returns {boolean} - true nếu có session đã diễn ra
 */
export const hasPastSessions = (schedule) => {
  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
    return false;
  }

  const now = new Date();
  now.setHours(23, 59, 59, 999); // End of current day

  return schedule.some((session) => {
    let sessionDate = null;

    // Có thể có nhiều format khác nhau
    if (session.Date) sessionDate = new Date(session.Date);
    if (session.date) sessionDate = new Date(session.date);
    if (session.StartDate) sessionDate = new Date(session.StartDate);
    if (session.startDate) sessionDate = new Date(session.startDate);

    if (!sessionDate || isNaN(sessionDate.getTime())) {
      return false;
    }

    sessionDate.setHours(23, 59, 59, 999); // End of session day
    return sessionDate < now;
  });
};

/**
 * Tính toán trạng thái chính xác cho class dựa trên schedule
 * @param {Object} classItem - Class object
 * @returns {string} - Trạng thái chính xác
 */
export const calculateCorrectClassStatus = (classItem) => {
  // Nếu không có schedule, giữ nguyên trạng thái hiện tại
  if (
    !classItem.schedule ||
    !Array.isArray(classItem.schedule) ||
    classItem.schedule.length === 0
  ) {
    return classItem.Status || "Sắp khai giảng";
  }

  const hasFuture = hasFutureSessions(classItem.schedule);
  const hasPast = hasPastSessions(classItem.schedule);

  // Logic trạng thái:
  if (hasFuture && hasPast) {
    // Có cả session trong quá khứ và tương lai = Đang hoạt động
    return "Đang hoạt động";
  } else if (hasFuture && !hasPast) {
    // Chỉ có session trong tương lai = Sắp khai giảng
    return "Sắp khai giảng";
  } else if (!hasFuture && hasPast) {
    // Chỉ có session trong quá khứ = Đã kết thúc
    return "Đã kết thúc";
  } else {
    // Không có session nào (không nên xảy ra)
    return "Sắp khai giảng";
  }
};

/**
 * Kiểm tra và sửa trạng thái class nếu cần
 * @param {Object} classItem - Class object
 * @returns {Object} - Class object với trạng thái đã được sửa
 */
export const fixClassStatus = (classItem) => {
  const correctStatus = calculateCorrectClassStatus(classItem);

  if (classItem.Status !== correctStatus) {
    return {
      ...classItem,
      Status: correctStatus,
      _statusFixed: true, // Flag để biết đã được sửa
    };
  }

  return classItem;
};

/**
 * Sửa trạng thái cho tất cả classes trong danh sách
 * @param {Array} classes - Array của class objects
 * @returns {Array} - Array của class objects với trạng thái đã được sửa
 */
export const fixAllClassStatuses = (classes) => {
  if (!Array.isArray(classes)) {
    return classes;
  }

  return classes.map(fixClassStatus);
};
