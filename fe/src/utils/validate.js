// Validation Utilities

/**
 * Kiểm tra email hợp lệ
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Kiểm tra số điện thoại Việt Nam
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^(0|\+84)[0-9]{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Kiểm tra chuỗi không rỗng
 */
export const isNotEmpty = (str) => {
  return str && str.trim().length > 0;
};

/**
 * Kiểm tra số dương
 */
export const isPositiveNumber = (num) => {
  return !isNaN(num) && Number(num) > 0;
};

/**
 * Kiểm tra ngày hợp lệ (YYYY-MM-DD)
 */
export const isValidDate = (dateStr) => {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
};

/**
 * Kiểm tra ngày sau ngày khác
 */
export const isDateAfter = (dateStr1, dateStr2) => {
  const date1 = new Date(dateStr1);
  const date2 = new Date(dateStr2);
  return date1 > date2;
};

/**
 * Validate form lớp học
 */
export const validateClassForm = (formData) => {
  const errors = {};

  if (!isNotEmpty(formData.title)) {
    errors.title = "Vui lòng nhập tên lớp học";
  }

  if (!isNotEmpty(formData.description)) {
    errors.description = "Vui lòng nhập mô tả";
  }

  if (!isPositiveNumber(formData.duration)) {
    errors.duration = "Thời lượng phải lớn hơn 0";
  }

  if (!isPositiveNumber(formData.tuitionFee)) {
    errors.tuitionFee = "Học phí không hợp lệ";
  }

  if (!formData.instructorId) {
    errors.instructorId = "Vui lòng chọn giảng viên";
  }

  if (!isPositiveNumber(formData.maxStudents)) {
    errors.maxStudents = "Số lượng học viên phải lớn hơn 0";
  }

  if (!isValidDate(formData.startDate)) {
    errors.startDate = "Ngày bắt đầu không hợp lệ";
  }

  if (!isValidDate(formData.endDate)) {
    errors.endDate = "Ngày kết thúc không hợp lệ";
  }

  if (
    formData.startDate &&
    formData.endDate &&
    !isDateAfter(formData.endDate, formData.startDate)
  ) {
    errors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
  }

  if (!formData.schedule || formData.schedule.length === 0) {
    errors.schedule = "Vui lòng thêm ít nhất một lịch học";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Format currency VND
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (dateStr, format = "DD/MM/YYYY") => {
  if (!dateStr) return "";
  const date = new Date(dateStr);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return format.replace("DD", day).replace("MM", month).replace("YYYY", year);
};

/**
 * Sanitize HTML
 */
export const sanitizeHTML = (str) => {
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
};

/**
 * Chuyển đổi thời gian thành phút để so sánh
 * @param {string} timeStr - Chuỗi thời gian (format: "HH:MM" hoặc "HH:MM:SS")
 * @returns {number|null} - Số phút từ 00:00, hoặc null nếu không hợp lệ
 */
export const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return null;
  const parts = timeStr.substring(0, 5).split(":");
  if (parts.length !== 2) return null;
  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

/**
 * Kiểm tra 2 ca học có trùng thời gian không (overlap)
 * @param {Object} timeslot1 - Ca học thứ nhất {StartTime, EndTime}
 * @param {Object} timeslot2 - Ca học thứ hai {StartTime, EndTime}
 * @returns {boolean} - true nếu trùng thời gian, false nếu không
 */
export const isTimeOverlap = (timeslot1, timeslot2) => {
  if (!timeslot1 || !timeslot2) return false;

  const start1 = timeToMinutes(timeslot1.StartTime || timeslot1.startTime);
  const end1 = timeToMinutes(timeslot1.EndTime || timeslot1.endTime);
  const start2 = timeToMinutes(timeslot2.StartTime || timeslot2.startTime);
  const end2 = timeToMinutes(timeslot2.EndTime || timeslot2.endTime);

  if (!start1 || !end1 || !start2 || !end2) return false;

  // Kiểm tra overlap: (start1 < end2) && (start2 < end1)
  return start1 < end2 && start2 < end1;
};

/**
 * Validate form khi thêm sessions
 * @param {Array} sessionsToValidate - Mảng các session cần validate {TimeslotID, Date}
 * @param {Date} selectedDate - Ngày được chọn
 * @param {Array} existingSchedules - Mảng các lịch đã có [{date, timeslotId, TimeslotID}]
 * @param {Function} getTimeslotById - Hàm để lấy timeslot theo ID
 * @param {Function} formatDate - Hàm format ngày (từ date-fns format)
 * @returns {{errors: Array, warnings: Array}} - Mảng lỗi và cảnh báo
 */
export const validateSessionsForm = (
  sessionsToValidate,
  selectedDate,
  existingSchedules = [],
  getTimeslotById,
  formatDate
) => {
  const errors = [];
  const warnings = [];
  const dateStr = formatDate(selectedDate, "yyyy-MM-dd");

  // Kiểm tra từng session
  sessionsToValidate.forEach((session, idx) => {
    const sessionNum = idx + 1;

    // 1. Kiểm tra TimeslotID có được chọn không
    if (!session.TimeslotID) {
      errors.push(`Ca ${sessionNum}: Vui lòng chọn ca học`);
      return;
    }

    // 2. Kiểm tra timeslot có tồn tại không
    const timeslot = getTimeslotById(session.TimeslotID);
    if (!timeslot) {
      errors.push(`Ca ${sessionNum}: Không tìm thấy thông tin ca học`);
      return;
    }

    const startTime = timeslot.StartTime || timeslot.startTime || "";
    const endTime = timeslot.EndTime || timeslot.endTime || "";

    // 3. Kiểm tra thời gian hợp lệ
    if (!startTime || !endTime) {
      errors.push(`Ca ${sessionNum}: Thời gian ca học không hợp lệ`);
      return;
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    if (!startMinutes || !endMinutes || startMinutes >= endMinutes) {
      errors.push(
        `Ca ${sessionNum}: Thời gian ca học không hợp lệ (${startTime} - ${endTime})`
      );
      return;
    }

    // 4. Kiểm tra trùng ca với lịch đã có (cùng ngày, cùng timeslot)
    // CHỈ CHECK NẾU existingSchedules được truyền vào (không phải empty array)
    // Nếu existingSchedules = [], bỏ qua check này để backend xử lý conflicts
    if (existingSchedules && existingSchedules.length > 0) {
      const isDuplicateWithExisting = existingSchedules.some((sch) => {
        const schTimeslotId = sch.timeslotId || sch.TimeslotID;
        const schDateStr = sch.date
          ? formatDate(new Date(sch.date), "yyyy-MM-dd")
          : null;
        return schTimeslotId === session.TimeslotID && schDateStr === dateStr;
      });

      if (isDuplicateWithExisting) {
        errors.push(
          `Ca ${sessionNum}: Ca học ${startTime.substring(
            0,
            5
          )}-${endTime.substring(0, 5)} đã được thêm vào ngày ${formatDate(
            selectedDate,
            "dd/MM/yyyy"
          )}`
        );
        return;
      }
    }

    // 5. Kiểm tra trùng ca trong danh sách mới (cùng ngày, cùng timeslot)
    const isDuplicateInNew = sessionsToValidate
      .slice(0, idx)
      .some((prevSession, prevIdx) => {
        return prevSession.TimeslotID === session.TimeslotID;
      });

    if (isDuplicateInNew) {
      errors.push(
        `Ca ${sessionNum}: Ca học ${startTime.substring(
          0,
          5
        )}-${endTime.substring(0, 5)} đã được thêm ở ca ${
          sessionsToValidate.findIndex(
            (s, i) => i < idx && s.TimeslotID === session.TimeslotID
          ) + 1
        }`
      );
      return;
    }

    // 6. Kiểm tra trùng thời gian với lịch đã có (cùng ngày, thời gian overlap)
    // CHỈ CHECK NẾU existingSchedules được truyền vào (không phải empty array)
    // Nếu existingSchedules = [], bỏ qua check này để backend xử lý conflicts
    if (existingSchedules && existingSchedules.length > 0) {
      const isTimeConflictWithExisting = existingSchedules.some((sch) => {
        const schDateStr = sch.date
          ? formatDate(new Date(sch.date), "yyyy-MM-dd")
          : null;
        if (schDateStr !== dateStr) return false;
        const schTimeslot = getTimeslotById(sch.timeslotId || sch.TimeslotID);
        if (!schTimeslot) return false;
        return isTimeOverlap(timeslot, schTimeslot);
      });

      if (isTimeConflictWithExisting) {
        warnings.push(
          `Ca ${sessionNum}: Thời gian ${startTime.substring(
            0,
            5
          )}-${endTime.substring(
            0,
            5
          )} có thể trùng với ca học khác trong ngày ${formatDate(
            selectedDate,
            "dd/MM/yyyy"
          )}`
        );
      }
    }

    // 7. Kiểm tra trùng thời gian trong danh sách mới
    const isTimeConflictInNew = sessionsToValidate
      .slice(0, idx)
      .some((prevSession, prevIdx) => {
        if (prevSession.TimeslotID === session.TimeslotID) return false; // Đã check duplicate ở trên
        const prevTimeslot = getTimeslotById(prevSession.TimeslotID);
        if (!prevTimeslot) return false;
        return isTimeOverlap(timeslot, prevTimeslot);
      });

    if (isTimeConflictInNew) {
      warnings.push(
        `Ca ${sessionNum}: Thời gian ${startTime.substring(
          0,
          5
        )}-${endTime.substring(0, 5)} trùng với ca ${
          sessionsToValidate.findIndex((s, i) => {
            if (i >= idx) return false;
            const prevTimeslot = getTimeslotById(s.TimeslotID);
            return prevTimeslot && isTimeOverlap(timeslot, prevTimeslot);
          }) + 1
        }`
      );
    }
  });

  return { errors, warnings };
};

/**
 * Chuyển đổi thứ trong tuần (0-6) sang format Day (T2, T3, ..., CN)
 * @param {number} dayOfWeek - Thứ trong tuần (0 = Chủ Nhật, 1 = Thứ Hai, ..., 6 = Thứ Bảy)
 * @returns {string} - Day format (T2, T3, T4, T5, T6, T7, CN)
 */
export const dayOfWeekToDay = (dayOfWeek) => {
  const dayMap = {
    0: "CN", // Chủ Nhật
    1: "T2", // Thứ Hai
    2: "T3", // Thứ Ba
    3: "T4", // Thứ Tư
    4: "T5", // Thứ Năm
    5: "T6", // Thứ Sáu
    6: "T7", // Thứ Bảy
  };
  return dayMap[dayOfWeek] || null;
};

/**
 * Lấy thứ trong tuần từ Date string
 * @param {string} dateStr - Ngày (format: YYYY-MM-DD)
 * @returns {string|null} - Day format (T2, T3, T4, T5, T6, T7, CN) hoặc null
 */
export const getDayFromDate = (dateStr) => {
  if (!dateStr) return null;

  // Parse date string YYYY-MM-DD để tránh timezone issues
  // new Date("YYYY-MM-DD") có thể bị ảnh hưởng bởi timezone
  const parts = dateStr.split("-");
  if (parts.length !== 3) {
    // Fallback nếu format không đúng
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return dayOfWeekToDay(date.getDay());
  }

  // Tạo Date với UTC để tránh timezone issues
  // new Date(year, monthIndex, day) - monthIndex bắt đầu từ 0
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // monthIndex từ 0-11
  const day = parseInt(parts[2], 10);

  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return null;

  return dayOfWeekToDay(date.getDay());
};

/**
 * Kiểm tra Date có khớp với Day của timeslot không
 * @param {string} dateStr - Ngày (format: YYYY-MM-DD)
 * @param {Object} timeslot - Timeslot object có trường Day
 * @returns {boolean} - true nếu khớp, false nếu không
 */
export const validateDateDayMatch = (dateStr, timeslot) => {
  if (!dateStr || !timeslot) return false;
  const dateDay = getDayFromDate(dateStr);
  const timeslotDay = timeslot.Day || timeslot.day;
  return dateDay === timeslotDay;
};

/**
 * Lấy thứ trong tuần từ Date string (trả về số 0-6)
 * @param {string} dateStr - Ngày (format: YYYY-MM-DD)
 * @returns {number|null} - Thứ trong tuần (0-6) hoặc null
 */
export const getDayOfWeek = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length !== 3) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.getDay();
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return null;
  return date.getDay();
};

/**
 * Chuyển đổi Day format (T2, T3, ...) sang thứ trong tuần (0-6)
 * @param {string} day - Day format (T2, T3, T4, T5, T6, T7, CN)
 * @returns {number|null} - Thứ trong tuần (0-6) hoặc null
 */
export const dayToDayOfWeek = (day) => {
  const dayMap = {
    CN: 0, // Chủ Nhật
    T2: 1, // Thứ Hai
    T3: 2, // Thứ Ba
    T4: 3, // Thứ Tư
    T5: 4, // Thứ Năm
    T6: 5, // Thứ Sáu
    T7: 6, // Thứ Bảy
  };
  return dayMap[day] !== undefined ? dayMap[day] : null;
};

/**
 * Lọc timeslots theo Day
 * @param {Array} timeslots - Mảng timeslots
 * @param {string} day - Day format (T2, T3, T4, T5, T6, T7, CN)
 * @returns {Array} - Mảng timeslots có Day khớp
 */
export const filterTimeslotsByDay = (timeslots, day) => {
  if (!timeslots || !Array.isArray(timeslots)) return [];
  return timeslots.filter((ts) => (ts.Day || ts.day) === day);
};

/**
 * Nhóm timeslots theo Day
 * @param {Array} timeslots - Mảng timeslots
 * @returns {Object} - Object với key là Day, value là mảng timeslots
 */
export const groupTimeslotsByDay = (timeslots) => {
  if (!timeslots || !Array.isArray(timeslots)) return {};
  const grouped = {};
  timeslots.forEach((ts) => {
    const day = ts.Day || ts.day;
    if (day) {
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push(ts);
    }
  });
  return grouped;
};

export default {
  isValidEmail,
  isValidPhone,
  isNotEmpty,
  isPositiveNumber,
  isValidDate,
  isDateAfter,
  validateClassForm,
  formatCurrency,
  formatDate,
  sanitizeHTML,
  timeToMinutes,
  isTimeOverlap,
  validateSessionsForm,
  dayOfWeekToDay,
  getDayFromDate,
  validateDateDayMatch,
  dayToDayOfWeek,
  filterTimeslotsByDay,
  groupTimeslotsByDay,
};
