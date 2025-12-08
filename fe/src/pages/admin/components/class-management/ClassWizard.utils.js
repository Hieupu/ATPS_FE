import dayjs from "dayjs";
import { dayOfWeekToDay } from "../../../../utils/validate";

// Utility functions để tính toán - Tránh lặp lại logic
export const calculateAllSelectedTimeslotIds = (
  selectedTimeslotIds,
  timeslotsByDay
) => {
  const all = new Set(selectedTimeslotIds);
  Object.values(timeslotsByDay || {}).forEach((dayTimeslots) => {
    dayTimeslots.forEach((timeslotId) => {
      all.add(timeslotId);
    });
  });
  return all;
};

export const calculateSessionsPerWeek = (daysOfWeek, timeslotsByDay) => {
  let total = 0;
  (daysOfWeek || []).forEach((day) => {
    const dayTimeslots = timeslotsByDay?.[day] || [];
    total += dayTimeslots.length;
  });
  return total;
};

// Parse date string (YYYY-MM-DD) thành Date object - Tránh timezone issues
export const parseDateString = (dateString) => {
  if (!dateString) return null;

  if (typeof dateString === "string") {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const date = new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10)
      );
      date.setHours(0, 0, 0, 0);
      return date;
    }
  }

  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date;
};

// Parse end date string và set time về cuối ngày (23:59:59)
export const parseEndDateString = (dateString) => {
  if (!dateString) return null;

  if (typeof dateString === "string") {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const date = new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10)
      );
      date.setHours(23, 59, 59, 999);
      return date;
    }
  }

  const date = new Date(dateString);
  date.setHours(23, 59, 59, 999);
  return date;
};

// Format Date object thành YYYY-MM-DD string
export const formatDateToString = (date) => {
  if (!date) return "";

  const dateObj = date instanceof Date ? date : new Date(date);
  if (!dateObj || isNaN(dateObj.getTime())) return "";

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Tìm timeslot cho một ngày cụ thể - Logic tìm timeslot có Day khớp hoặc không có Day
export const findTimeslotForDay = ({
  timeslots,
  selectedStartTime,
  selectedEndTime,
  targetDay,
  normalizeTimeString,
}) => {
  if (!timeslots || !selectedStartTime || !selectedEndTime) return null;

  // Ưu tiên tìm timeslot có Day khớp với ngày đó
  let dayTimeslot = timeslots.find((t) => {
    const startTime = normalizeTimeString(t.StartTime || t.startTime || "");
    const endTime = normalizeTimeString(t.EndTime || t.endTime || "");
    const timeslotDay = t.Day || t.day;
    return (
      startTime === selectedStartTime &&
      endTime === selectedEndTime &&
      timeslotDay === targetDay
    );
  });

  // Nếu không tìm thấy timeslot có Day khớp, tìm timeslot không có Day
  if (!dayTimeslot) {
    dayTimeslot = timeslots.find((t) => {
      const startTime = normalizeTimeString(t.StartTime || t.startTime || "");
      const endTime = normalizeTimeString(t.EndTime || t.endTime || "");
      const timeslotDay = t.Day || t.day;
      return (
        startTime === selectedStartTime &&
        endTime === selectedEndTime &&
        !timeslotDay
      );
    });
  }

  return dayTimeslot;
};

// Tính endDate ước tính dựa trên startDate và số buổi học
export const estimateEndDate = (startDate, numOfSessions, minWeeks = 12) => {
  if (!startDate || !numOfSessions) return null;

  const estimatedWeeks = Math.max(numOfSessions, minWeeks);
  return dayjs(startDate).add(estimatedWeeks, "week").format("YYYY-MM-DD");
};

// Lọc bỏ các timeslot bị LOCKED khỏi TimeslotsByDay
export const filterLockedTimeslots = ({
  timeslotsByDay,
  daysOfWeek,
  determineSlotStatus,
  scheduleStartDate,
  endDate,
  blockedDays,
  instructorBusySchedule,
  formData,
  sessionsPerWeek,
  requiredSlotsPerWeek,
  instructorType,
  parttimeAvailableSlotKeySet,
  lockedTimeslotId,
  isDraftClass,
}) => {
  if (!scheduleStartDate || !timeslotsByDay) {
    return { timeslotsByDay: {}, changed: false };
  }

  const newTimeslotsByDay = { ...timeslotsByDay };
  const currentDaysOfWeekSet = new Set(daysOfWeek || []);
  let changed = false;

  // Xóa các ca đã chọn cho ngày không còn trong DaysOfWeek
  Object.keys(newTimeslotsByDay).forEach((dayKey) => {
    const dayOfWeek = Number(dayKey);
    if (Number.isNaN(dayOfWeek)) return;

    if (!currentDaysOfWeekSet.has(dayOfWeek)) {
      // Ngày này không còn trong DaysOfWeek, xóa hết ca đã chọn
      delete newTimeslotsByDay[dayKey];
      changed = true;
    }
  });

  // Kiểm tra và bỏ chọn các timeslot bị LOCKED
  Object.entries(newTimeslotsByDay).forEach(([dayKey, slots]) => {
    const dayOfWeek = Number(dayKey);
    if (Number.isNaN(dayOfWeek) || !Array.isArray(slots)) return;

    const keptSlots = slots.filter((timeslotId) => {
      const status = determineSlotStatus({
        dayOfWeek,
        timeslotId,
        startDate: scheduleStartDate,
        endDate,
        blockedDays,
        instructorBusySchedule,
        formData,
        sessionsPerWeek,
        requiredSlotsPerWeek,
        instructorType,
        parttimeAvailableSlotKeySet,
        lockedTimeslotId,
        isDraftClass,
      });
      return status.status !== "LOCKED";
    });

    if (keptSlots.length !== slots.length) {
      changed = true;
      if (keptSlots.length > 0) {
        newTimeslotsByDay[dayKey] = keptSlots;
      } else {
        delete newTimeslotsByDay[dayKey];
      }
    }
  });

  return { timeslotsByDay: newTimeslotsByDay, changed };
};

export const normalizeBlockedDayValue = (value) => {
  if (Array.isArray(value)) {
    return { isDayBlocked: false, blockedTimeslots: value };
  }

  if (value && typeof value === "object") {
    const blockedTimeslots = Array.isArray(value.blockedTimeslots)
      ? value.blockedTimeslots
      : Array.isArray(value.timeslots)
      ? value.timeslots
      : [];

    return {
      isDayBlocked:
        value.isDayBlocked === true ||
        value.dayBlocked === true ||
        value.isBlocked === true,
      blockedTimeslots,
    };
  }

  const boolValue =
    value === true || value === "true" || value === 1 || value === "1";

  return {
    isDayBlocked: boolValue,
    blockedTimeslots: [],
  };
};

export const normalizeTimeslotId = (value) => {
  if (value === null || value === undefined) return "";
  const numberCandidate = Number(value);
  if (!Number.isNaN(numberCandidate)) {
    return String(numberCandidate);
  }
  return String(value).trim();
};

export const determineSlotStatus = ({
  dayOfWeek,
  timeslotId,
  startDate,
  endDate,
  blockedDays,
  instructorBusySchedule,
  formData,
  sessionsPerWeek,
  requiredSlotsPerWeek,
  instructorType = null, // 'fulltime' | 'parttime'
  parttimeAvailableSlotKeySet = null,
  lockedTimeslotId = null, // Logic mới: Timeslot đã chốt cho lớp DRAFT
  isDraftClass = false, // Logic mới: Class có Status = 'DRAFT'?
}) => {
  if (
    typeof dayOfWeek !== "number" ||
    !timeslotId ||
    !startDate ||
    !dayjs(startDate).isValid()
  ) {
    return { status: "AVAILABLE", reason: "", source: null, busyCount: 0 };
  }

  const normalizedTimeslotId = normalizeTimeslotId(timeslotId);



  const { isDayBlocked, blockedTimeslots } = normalizeBlockedDayValue(
    blockedDays?.[dayOfWeek]
  );


  // Nếu cả ngày bị block (theo phân tích thống kê), disable TẤT CẢ timeslot trong ngày đó
  if (isDayBlocked) {
    const result = {
      status: "LOCKED",
      reason: "Giảng viên bận định kỳ trong ngày học này",
      source: "blockedDays",
      busyCount: 0,
    };

    return result;
  }

  // Nếu backend trả về danh sách timeslot cụ thể bị block trong ngày
  const normalizedBlocked = (blockedTimeslots || []).map((id) =>
    normalizeTimeslotId(id)
  );

  if (normalizedBlocked.includes(normalizedTimeslotId)) {
    const result = {
      status: "LOCKED",
      reason: "Giảng viên bận định kỳ ở ca học này",
      source: "blockedDays",
      busyCount: 0,
    };

    return result;
  }

  if (instructorType === "parttime") {
    const slotKey = `${dayOfWeek}-${normalizedTimeslotId}`;
    const hasAvailableSlot =
      parttimeAvailableSlotKeySet &&
      typeof parttimeAvailableSlotKeySet.has === "function" &&
      parttimeAvailableSlotKeySet.size > 0 &&
      parttimeAvailableSlotKeySet.has(slotKey);
    if (!hasAvailableSlot) {
      const result = {
        status: "LOCKED",
        reason: "Giảng viên part-time chưa đăng ký ca này",
        source: "parttimeAvailability",
        busyCount: 0,
      };
      return result;
    }
  }

  const computedSessionsPerWeek =
    sessionsPerWeek ||
    requiredSlotsPerWeek ||
    Object.values(formData?.scheduleDetail?.TimeslotsByDay || {}).reduce(
      (sum, slots = []) => sum + slots.length,
      0
    ) ||
    1;

  const totalWeeks = Math.max(
    1,
    Math.ceil(
      (formData?.schedule?.Numofsession || 12) /
        Math.max(computedSessionsPerWeek, 1)
    )
  );

  const startDateObj = dayjs(startDate);
  let endDateObj =
    (endDate && dayjs(endDate).isValid() && dayjs(endDate)) ||
    startDateObj.add(totalWeeks * 7, "day");

  const weeksCovered = Math.max(
    1,
    Math.ceil(endDateObj.diff(startDateObj, "week", true))
  );
  const dayFormat = dayOfWeekToDay(dayOfWeek);

  // Tập các slot (Date + TimeslotID) thuộc chính class này (sessions hiện có trong formData)
  const ownSessionKeySet = new Set();
  if (formData?.sessions && Array.isArray(formData.sessions)) {
    formData.sessions.forEach((session) => {
      if (!session.Date || !session.TimeslotID) return;
      const dateObj = dayjs(session.Date);
      if (!dateObj.isValid()) return;
      const dateKey = dateObj.format("YYYY-MM-DD");
      const tsKey = normalizeTimeslotId(
        session.TimeslotID || session.timeslotId
      );
      if (dateKey && tsKey) {
        ownSessionKeySet.add(`${dateKey}-${tsKey}`);
      }
    });
  }

  const relevantBusy = (instructorBusySchedule || []).filter((busy) => {
    const busyDay = (busy.Day || busy.day || "").toUpperCase();
    const busyTimeslotId = normalizeTimeslotId(
      busy.TimeslotID || busy.timeslotId
    );
    if (busyDay !== dayFormat || busyTimeslotId !== normalizedTimeslotId) {
      return false;
    }

    // Logic mới: Nhận diện theo Status và SourceType
    const busyStatus = (busy.Status || "").toUpperCase();
    const sourceType = (busy.SourceType || "").toUpperCase();

    // Session conflict: Luôn là busy
    const hasSessionConflict =
      busy?.hasSession === true ||
      !!busy?.SessionID ||
      sourceType === "SESSION";

    // Instructortimeslot:
    // - HOLIDAY: Luôn busy (ngày nghỉ lễ)
    // - OTHER: Đã được book và chuyển vào session, busy
    // - AVAILABLE: Giảng viên chọn để dạy (parttime tự thêm lịch dạy), không busy
    const isHoliday = busyStatus === "HOLIDAY";
    const isOther = busyStatus === "OTHER" || busyStatus === "OTHERS"; // Backward compatibility với OTHERS
    const isAvailable = busyStatus === "AVAILABLE";
    const isInstructortimeslot = sourceType === "INSTRUCTORTIMESLOT";

    // Nếu là OTHER trong instructortimeslot nhưng trùng đúng slot (Date + TimeslotID) của
    // chính lớp này (tồn tại trong formData.sessions) thì KHÔNG coi là busy cho lớp đó.
    if (
      isOther &&
      isInstructortimeslot &&
      busy.Date &&
      ownSessionKeySet.size > 0
    ) {
      const busyDateObjForKey = dayjs(busy.Date);
      const dateKey = busyDateObjForKey.isValid()
        ? busyDateObjForKey.format("YYYY-MM-DD")
        : String(busy.Date);
      const keyForOwn = `${dateKey}-${busyTimeslotId}`;
      if (ownSessionKeySet.has(keyForOwn)) {
        // Đây là OTHER thuộc về chính lớp đang chỉnh sửa ⇒ bỏ qua, không tính busy
        return false;
      }
    }

    // Nếu có session conflict hoặc HOLIDAY hoặc OTHER → busy
    if (hasSessionConflict || isHoliday || isOther) {
      // Continue để check date
    } else if (isInstructortimeslot && isAvailable) {
      // AVAILABLE trong instructortimeslot: Không busy (parttime đã chọn ca này)
      return false;
    } else if (!isInstructortimeslot && !hasSessionConflict) {
      // Không phải instructortimeslot và không có session → không busy
      return false;
    }

    const busyDate = busy.Date || busy.date;
    if (!busyDate) {
      return true;
    }

    const busyDateObj = dayjs(busyDate);
    return (
      busyDateObj.isAfter(startDateObj.subtract(1, "day")) &&
      busyDateObj.isBefore(endDateObj.add(1, "day"))
    );
  });

  const busyCount = relevantBusy.length;

  // Logic mới: KHÔNG cho trùng buổi (busyCount > 0 là LOCKED)
  if (busyCount > 0) {
    // Xác định lý do cụ thể
    const hasSession = relevantBusy.some((b) => {
      const st = (b.SourceType || "").toUpperCase();
      return st === "SESSION" || !!b.SessionID;
    });
    const hasHoliday = relevantBusy.some(
      (b) => (b.Status || "").toUpperCase() === "HOLIDAY"
    );
    const hasOther = relevantBusy.some(
      (b) =>
        (b.Status || "").toUpperCase() === "OTHER" ||
        (b.Status || "").toUpperCase() === "OTHERS"
    );

    let reason = "Giảng viên đã bận ở ca này";
    if (hasSession) {
      reason = "Giảng viên đã có lịch dạy ở ca này";
    } else if (hasHoliday) {
      reason = "Giảng viên nghỉ lễ ở ca này";
    } else if (hasOther) {
      reason = "Ca này đã được book và chuyển vào session";
    }

    const result = {
      status: "LOCKED",
      reason: reason,
      source: "busySchedule",
      busyCount,
    };
    
    return result;
  }

  const result = { status: "AVAILABLE", reason: "", source: null, busyCount };
  return result;
};

/**
 * Xây lại pattern DaysOfWeek + TimeslotsByDay từ danh sách sessions DB
 * Dùng cho màn EDIT để hiển thị lại các tick ở Step 3.
 *
 * @param {Array} sessions - Danh sách session, mỗi phần tử có { Date, TimeslotID | timeslotId }
 * @returns {{ DaysOfWeek: number[], TimeslotsByDay: Record<string, number[]> }}
 */
export const buildSchedulePatternFromSessions = (sessions) => {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return {
      DaysOfWeek: [],
      TimeslotsByDay: {},
    };
  }

  const timeslotsByDay = {};
  const daysSet = new Set();

  sessions.forEach((session) => {
    const rawDate = session.Date || session.date;
    const rawTimeslotId = session.TimeslotID || session.timeslotId;

    if (!rawDate || !rawTimeslotId) {
      return;
    }

    const dateObj = dayjs(rawDate);
    if (!dateObj.isValid()) {
      return;
    }

    const dayOfWeek = dateObj.day(); // 0 = CN, 1 = T2, ..., 6 = T7
    const timeslotIdNum = Number(rawTimeslotId);
    if (!Number.isFinite(timeslotIdNum) || timeslotIdNum <= 0) {
      return;
    }

    const dayKey = String(dayOfWeek);
    if (!timeslotsByDay[dayKey]) {
      timeslotsByDay[dayKey] = [];
    }

    if (!timeslotsByDay[dayKey].includes(timeslotIdNum)) {
      timeslotsByDay[dayKey].push(timeslotIdNum);
    }

    daysSet.add(dayOfWeek);
  });

  const DaysOfWeek = Array.from(daysSet).sort((a, b) => a - b);

  // Sort từng mảng timeslot cho ổn định
  Object.keys(timeslotsByDay).forEach((key) => {
    timeslotsByDay[key].sort((a, b) => a - b);
  });

  return {
    DaysOfWeek,
    TimeslotsByDay: timeslotsByDay,
  };
};

/**
 * Tính danh sách session "mất" khi đổi OpendatePlan
 * - Các session cũ có Date < newStartDate (và newStartDate > originalStartDate)
 */
export const computeLostSessions = (
  originalSessions,
  originalStartDate,
  newStartDate
) => {
  if (!originalStartDate || !newStartDate || !Array.isArray(originalSessions)) {
    return [];
  }

  const originalStart = dayjs(originalStartDate);
  const newStart = dayjs(newStartDate);

  if (!originalStart.isValid() || !newStart.isValid()) {
    return [];
  }

  // Nếu không thực sự dời lên sau (newStart <= originalStart) thì không tính mất
  if (!newStart.isAfter(originalStart)) {
    return [];
  }

  return originalSessions.filter((session) => {
    if (!session.Date) return false;
    const sessionDate = dayjs(session.Date);
    return sessionDate.isValid() && sessionDate.isBefore(newStart);
  });
};

/**
 * So sánh 2 danh sách sessions để tìm:
 * - lostSessions: có trong oldSessions nhưng không còn trong newSessions
 * - newSessions: có trong newSessions nhưng không tồn tại trong oldSessions
 *
 * So sánh theo key "Date|TimeslotID"
 */
export const computeScheduleDiff = (oldSessions, newSessions) => {
  const result = {
    lostSessions: [],
    newSessions: [],
  };

  if (!Array.isArray(oldSessions) || !Array.isArray(newSessions)) {
    return result;
  }

  const makeKey = (s) => {
    const date = s.Date || s.date || "";
    const timeslotId = normalizeTimeslotId(s.TimeslotID || s.timeslotId || "");
    return `${date}|${timeslotId}`;
  };

  const oldMap = new Map();
  oldSessions.forEach((s) => {
    const key = makeKey(s);
    if (key) {
      oldMap.set(key, s);
    }
  });

  const newMap = new Map();
  newSessions.forEach((s) => {
    const key = makeKey(s);
    if (key) {
      newMap.set(key, s);
    }
  });

  // lost: có trong old nhưng không còn trong new
  oldMap.forEach((session, key) => {
    if (!newMap.has(key)) {
      result.lostSessions.push(session);
    }
  });

  // new: có trong new nhưng không tồn tại trong old
  newMap.forEach((session, key) => {
    if (!oldMap.has(key)) {
      result.newSessions.push(session);
    }
  });

  return result;
};
