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
 * Tính toán trạng thái chính xác cho class dựa trên session dates và ngày hiện tại
 * @param {Object} classItem - Class object
 * @returns {string} - Trạng thái chính xác
 * Updated: 2025-01-23 - Logic tự động cập nhật trạng thái theo yêu cầu
 */
export const calculateCorrectClassStatus = (classItem) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Reset time to start of day

  // Ưu tiên sử dụng dữ liệu từ API mới
  let firstSessionDate = null;
  let lastSessionDate = null;

  // 1. Sử dụng firstSessionDate và lastSessionDate từ API time-stats
  if (classItem.firstSessionDate && classItem.lastSessionDate) {
    firstSessionDate = new Date(classItem.firstSessionDate);
    lastSessionDate = new Date(classItem.lastSessionDate);
  }
  // 2. Fallback: Tính từ schedule data
  else if (
    classItem.schedule &&
    Array.isArray(classItem.schedule) &&
    classItem.schedule.length > 0
  ) {
    const allDates = [];
    classItem.schedule.forEach((session) => {
      if (session.Timeslots && Array.isArray(session.Timeslots)) {
        session.Timeslots.forEach((timeslot) => {
          if (timeslot.Date) {
            const date = new Date(timeslot.Date);
            if (!isNaN(date.getTime())) {
              allDates.push(date);
            }
          }
        });
      }
    });

    if (allDates.length > 0) {
      firstSessionDate = new Date(Math.min(...allDates));
      lastSessionDate = new Date(Math.max(...allDates));
    }
  }

  // Nếu không có dữ liệu ngày, giữ nguyên trạng thái hiện tại
  if (
    !firstSessionDate ||
    !lastSessionDate ||
    isNaN(firstSessionDate.getTime()) ||
    isNaN(lastSessionDate.getTime())
  ) {
    return classItem.Status || "Sắp khai giảng";
  }

  // Set time boundaries
  firstSessionDate.setHours(0, 0, 0, 0);
  lastSessionDate.setHours(23, 59, 59, 999);

  // Logic trạng thái tự động theo yêu cầu:

  // 1. Nếu chưa đến ngày bắt đầu session đầu tiên
  if (now < firstSessionDate) {
    return "Sắp khai giảng";
  }

  // 2. Nếu đã qua ngày kết thúc session cuối cùng
  if (now > lastSessionDate) {
    return "Đã kết thúc";
  }

  // 3. Nếu đang trong khoảng thời gian từ ngày đầu đến ngày cuối
  if (now >= firstSessionDate && now <= lastSessionDate) {
    // Kiểm tra xem có giảng viên không
    const hasInstructor =
      classItem.Instructor?.InstructorID ||
      classItem.InstructorID ||
      classItem.instructorName;

    if (hasInstructor) {
      return "Đang hoạt động";
    } else {
      return "Sắp khai giảng"; // Chưa có giảng viên
    }
  }

  // Fallback
  return classItem.Status || "Sắp khai giảng";
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
