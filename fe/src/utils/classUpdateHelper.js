export const classifyClassUpdate = (submitData, originalClassData = null) => {
  // Metadata fields (không ảnh hưởng sessions)
  const metadataFields = ["Name", "Fee", "Maxstudent", "Status", "CourseID"];

  // Schedule fields (ảnh hưởng sessions)
  const scheduleFields = [
    "OpendatePlan",
    "EnddatePlan",
    "Numofsession",
    "sessions",
  ];

  // Instructor field
  const instructorField = "InstructorID";

  const metadata = {};
  const schedule = {};
  let instructor = null;

  // Phân loại fields
  Object.keys(submitData || {}).forEach((key) => {
    if (metadataFields.includes(key)) {
      metadata[key] = submitData[key];
    } else if (scheduleFields.includes(key)) {
      schedule[key] = submitData[key];
    } else if (key === instructorField) {
      instructor = submitData[key];
    }
  });

  // Kiểm tra có thay đổi schedule không
  const hasScheduleChange = originalClassData
    ? schedule.OpendatePlan !== originalClassData.OpendatePlan ||
      schedule.EnddatePlan !== originalClassData.EnddatePlan ||
      schedule.Numofsession !== originalClassData.Numofsession ||
      (schedule.sessions && schedule.sessions.length > 0)
    : schedule.OpendatePlan ||
      schedule.EnddatePlan ||
      schedule.Numofsession ||
      (schedule.sessions && schedule.sessions.length > 0);

  // Kiểm tra có thay đổi instructor không
  const hasInstructorChange = originalClassData
    ? instructor !== originalClassData.InstructorID
    : !!instructor;

  return {
    metadata,
    schedule,
    instructor,
    hasScheduleChange,
    hasInstructorChange,
  };
};

export const classifyScheduleChange = (submitData, originalClassData) => {
  if (!originalClassData) {
    // Tạo mới
    return {
      changeType: "CREATE",
      sessionsToDelete: [],
      sessionsToCreate: submitData.sessions || [],
      sessionsToUpdate: [],
    };
  }

  const originalSessions = originalClassData.sessions || [];
  const newSessions = submitData.sessions || [];

  // Map sessions theo key: Date-TimeslotID
  const originalMap = new Map();
  originalSessions.forEach((s) => {
    const key = `${s.Date || s.date}-${s.TimeslotID || s.timeslotId}`;
    originalMap.set(key, s);
  });

  const newMap = new Map();
  newSessions.forEach((s) => {
    const key = `${s.Date || s.date}-${s.TimeslotID || s.timeslotId}`;
    newMap.set(key, s);
  });

  // Sessions cần xóa (có trong original nhưng không có trong new)
  const sessionsToDelete = originalSessions.filter((s) => {
    const key = `${s.Date || s.date}-${s.TimeslotID || s.timeslotId}`;
    return !newMap.has(key);
  });

  // Sessions cần tạo (có trong new nhưng không có trong original)
  const sessionsToCreate = newSessions.filter((s) => {
    const key = `${s.Date || s.date}-${s.TimeslotID || s.timeslotId}`;
    return !originalMap.has(key);
  });

  // Sessions cần update (có trong cả 2 nhưng thay đổi Date hoặc TimeslotID hoặc ZoomUUID)
  const sessionsToUpdate = newSessions.filter((s) => {
    const key = `${s.Date || s.date}-${s.TimeslotID || s.timeslotId}`;
    const original = originalMap.get(key);
    if (!original) return false;

    return (
      (original.Date || original.date) !== (s.Date || s.date) ||
      (original.TimeslotID || original.timeslotId) !==
        (s.TimeslotID || s.timeslotId) ||
      (original.ZoomUUID || original.zoomUUID) !== (s.ZoomUUID || s.zoomUUID)
    );
  });

  // Xác định changeType
  let changeType = "NONE";
  if (
    sessionsToDelete.length > 0 ||
    sessionsToCreate.length > 0 ||
    sessionsToUpdate.length > 0
  ) {
    if (
      sessionsToDelete.length === originalSessions.length &&
      sessionsToCreate.length > 0
    ) {
      changeType = "REPLACE_ALL"; // Thay thế toàn bộ
    } else if (sessionsToDelete.length > 0 || sessionsToCreate.length > 0) {
      changeType = "PARTIAL_UPDATE"; // Cập nhật một phần
    } else if (sessionsToUpdate.length > 0) {
      changeType = "RESCHEDULE"; // Chỉ reschedule
    }
  }

  return {
    changeType,
    sessionsToDelete,
    sessionsToCreate,
    sessionsToUpdate,
  };
};

export const calculateWeeklyDaysFromSessions = (sessions) => {
  if (!sessions || sessions.length === 0) return "";

  const dayMap = {
    Monday: "2",
    Tuesday: "3",
    Wednesday: "4",
    Thursday: "5",
    Friday: "6",
    Saturday: "7",
    Sunday: "1",
  };

  const daySet = new Set();
  sessions.forEach((session) => {
    if (session.Date || session.date) {
      const date = new Date(session.Date || session.date);
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      if (dayMap[dayName]) {
        daySet.add(dayMap[dayName]);
      }
    } else if (session.TimeslotDay || session.timeslotDay) {
      const dayName = (session.TimeslotDay || session.timeslotDay)
        .toUpperCase()
        .replace("DAY", "")
        .trim();
      const fullDayName = dayName + "day";
      if (dayMap[fullDayName]) {
        daySet.add(dayMap[fullDayName]);
      }
    }
  });

  return Array.from(daySet)
    .sort((a, b) => Number(a) - Number(b))
    .join(",");
};

/**
 * Detect metadata changes (không ảnh hưởng sessions)
 * @param {Object} newData - Dữ liệu mới
 * @param {Object} oldData - Dữ liệu cũ
 * @returns {Object} Object chỉ chứa các trường thay đổi
 */
export const detectMetadataChanges = (newData, oldData) => {
  if (!oldData) {
    // Nếu không có oldData, return tất cả metadata fields từ newData
    const metadataFields = ["Name", "Fee", "Maxstudent", "CourseID", "Status"];
    const changes = {};
    metadataFields.forEach((field) => {
      if (newData[field] !== undefined && newData[field] !== null) {
        changes[field] = newData[field];
      }
    });
    return changes;
  }

  const metadataFields = ["Name", "Fee", "Maxstudent", "CourseID", "Status"];
  const changes = {};

  metadataFields.forEach((field) => {
    const newValue = newData[field];
    const oldValue = oldData[field];

    // So sánh (xử lý cả string và number)
    if (newValue !== oldValue) {
      // Normalize để so sánh (convert string sang number nếu cần)
      const normalizedNew =
        typeof newValue === "string" && !isNaN(newValue)
          ? Number(newValue)
          : newValue;
      const normalizedOld =
        typeof oldValue === "string" && !isNaN(oldValue)
          ? Number(oldValue)
          : oldValue;

      if (normalizedNew !== normalizedOld) {
        changes[field] = newValue;
      }
    }
  });

  return changes;
};

/**
 * Detect schedule changes và phân loại: update, create, delete, reschedule
 * @param {Array} newSessions - Sessions mới
 * @param {Array} oldSessions - Sessions cũ
 * @returns {Object} { update: [], create: [], delete: [], reschedule: [] }
 */
export const detectScheduleChanges = (newSessions, oldSessions) => {
  const result = {
    update: [],
    create: [],
    delete: [],
    reschedule: [],
  };

  if (!oldSessions || oldSessions.length === 0) {
    // Nếu không có sessions cũ, tất cả sessions mới đều là create
    result.create = (newSessions || []).map((s) => ({
      Date: s.Date || s.date,
      TimeslotID: s.TimeslotID || s.timeslotId,
      InstructorID: s.InstructorID || s.instructorId,
      ClassID: s.ClassID || s.classId,
      Title: s.Title || s.title,
      Description: s.Description || s.description,
      ZoomUUID: s.ZoomUUID || s.zoomUUID,
    }));
    return result;
  }

  if (!newSessions || newSessions.length === 0) {
    // Nếu không có sessions mới, tất cả sessions cũ đều là delete
    result.delete = (oldSessions || [])
      .map((s) => s.SessionID || s.sessionId || s.id)
      .filter((id) => id != null);
    return result;
  }

  // Normalize sessions: đảm bảo có SessionID, Date, TimeslotID
  const normalizeSession = (s) => ({
    SessionID: s.SessionID || s.sessionId || s.id,
    Date: s.Date || s.date,
    TimeslotID: s.TimeslotID || s.timeslotId,
    InstructorID: s.InstructorID || s.instructorId,
    ClassID: s.ClassID || s.classId,
    Title: s.Title || s.title,
    Description: s.Description || s.description,
    ZoomUUID: s.ZoomUUID || s.zoomUUID,
    originalSessionID: s.originalSessionID || s.originalSessionId,
    isRescheduled: s.isRescheduled || false,
  });

  const normalizedNew = (newSessions || []).map(normalizeSession);
  const normalizedOld = (oldSessions || []).map(normalizeSession);

  // Tạo maps để so sánh
  const oldMapBySessionId = new Map();
  normalizedOld.forEach((s) => {
    if (s.SessionID) {
      oldMapBySessionId.set(Number(s.SessionID), s);
    }
  });

  const oldMapByKey = new Map();
  normalizedOld.forEach((s) => {
    const key = `${s.Date}-${s.TimeslotID}`;
    oldMapByKey.set(key, s);
  });

  const newMapByKey = new Map();
  normalizedNew.forEach((s) => {
    const key = `${s.Date}-${s.TimeslotID}`;
    newMapByKey.set(key, s);
  });

  // Phân loại sessions mới
  normalizedNew.forEach((newSession) => {
    const sessionId = newSession.SessionID
      ? Number(newSession.SessionID)
      : null;
    const key = `${newSession.Date}-${newSession.TimeslotID}`;
    const oldSession = oldMapByKey.get(key);
    const oldSessionById = sessionId ? oldMapBySessionId.get(sessionId) : null;

    if (newSession.isRescheduled && newSession.originalSessionID) {
      // RESCHEDULE: Có originalSessionID và isRescheduled flag
      result.reschedule.push({
        originalSessionID: Number(newSession.originalSessionID),
        Date: newSession.Date,
        TimeslotID: Number(newSession.TimeslotID),
        InstructorID: Number(newSession.InstructorID),
        ClassID: Number(newSession.ClassID),
        Title: newSession.Title,
        Description: newSession.Description,
        ZoomUUID: newSession.ZoomUUID,
      });
    } else if (sessionId && oldSessionById) {
      // UPDATE: Có SessionID và session tồn tại trong DB
      // Kiểm tra xem có thay đổi Date hoặc TimeslotID không
      if (
        oldSessionById.Date !== newSession.Date ||
        Number(oldSessionById.TimeslotID) !== Number(newSession.TimeslotID)
      ) {
        result.update.push({
          SessionID: sessionId,
          Date: newSession.Date,
          TimeslotID: Number(newSession.TimeslotID),
          InstructorID: Number(newSession.InstructorID),
          Title: newSession.Title,
          Description: newSession.Description,
        });
      }
      // Nếu không thay đổi gì, không cần update
    } else if (!sessionId && !oldSession) {
      // CREATE: Không có SessionID và không match với session cũ nào
      result.create.push({
        Date: newSession.Date,
        TimeslotID: Number(newSession.TimeslotID),
        InstructorID: Number(newSession.InstructorID),
        ClassID: Number(newSession.ClassID),
        Title: newSession.Title,
        Description: newSession.Description,
        ZoomUUID: newSession.ZoomUUID,
      });
    }
  });

  // Tìm sessions cần DELETE: Có trong old nhưng không có trong new
  normalizedOld.forEach((oldSession) => {
    const sessionId = oldSession.SessionID
      ? Number(oldSession.SessionID)
      : null;
    if (!sessionId) return;

    // Kiểm tra xem session này có bị reschedule không (có trong reschedule list)
    const isRescheduled = result.reschedule.some(
      (r) => Number(r.originalSessionID) === sessionId
    );

    // Kiểm tra xem session này có trong newSessions không
    const key = `${oldSession.Date}-${oldSession.TimeslotID}`;
    const existsInNew = newMapByKey.has(key);

    // Nếu không bị reschedule và không tồn tại trong new → DELETE
    if (!isRescheduled && !existsInNew) {
      result.delete.push(sessionId);
    }
  });

  return result;
};

/**
 * Xác định loại thay đổi
 * @param {Object} metadataChanges - Metadata changes
 * @param {Object} scheduleChanges - Schedule changes
 * @returns {string} "METADATA_ONLY" | "SCHEDULE_ONLY" | "BOTH" | "NONE"
 */
export const determineChangeType = (metadataChanges, scheduleChanges) => {
  const hasMetadataChanges = Object.keys(metadataChanges || {}).length > 0;
  const hasScheduleChanges =
    (scheduleChanges?.update?.length || 0) > 0 ||
    (scheduleChanges?.create?.length || 0) > 0 ||
    (scheduleChanges?.delete?.length || 0) > 0 ||
    (scheduleChanges?.reschedule?.length || 0) > 0;

  if (hasMetadataChanges && hasScheduleChanges) {
    return "BOTH";
  } else if (hasMetadataChanges) {
    return "METADATA_ONLY";
  } else if (hasScheduleChanges) {
    return "SCHEDULE_ONLY";
  } else {
    return "NONE";
  }
};

/**
 * Tính toán vùng thời gian bị ảnh hưởng
 * @param {Object} scheduleChanges - Schedule changes
 * @returns {Object} { start: string, end: string } hoặc null
 */
export const calculateAffectedDateRange = (scheduleChanges) => {
  const allDates = [];

  // Lấy dates từ update
  if (scheduleChanges?.update) {
    scheduleChanges.update.forEach((s) => {
      if (s.Date) allDates.push(s.Date);
    });
  }

  // Lấy dates từ create
  if (scheduleChanges?.create) {
    scheduleChanges.create.forEach((s) => {
      if (s.Date) allDates.push(s.Date);
    });
  }

  // Lấy dates từ reschedule
  if (scheduleChanges?.reschedule) {
    scheduleChanges.reschedule.forEach((s) => {
      if (s.Date) allDates.push(s.Date);
    });
  }

  if (allDates.length === 0) {
    return null;
  }

  const sortedDates = allDates.sort();
  return {
    start: sortedDates[0],
    end: sortedDates[sortedDates.length - 1],
  };
};

/**
 * Build payload metadata (chỉ chứa metadata changes)
 * @param {Object} changes - Metadata changes
 * @returns {Object} Payload cho updateClass()
 */
export const buildMetadataPayload = (changes) => {
  return { ...changes };
};

/**
 * Build payload schedule với cấu trúc mới
 * @param {Object} scheduleChanges - Schedule changes { update, create, delete, reschedule }
 * @param {Object} metadataChanges - Metadata changes (nếu có OpendatePlan, Numofsession, InstructorID)
 * @returns {Object} Payload cho updateClassSchedule()
 */
export const buildSchedulePayload = (scheduleChanges, metadataChanges = {}) => {
  const payload = {
    sessions: {
      update: scheduleChanges.update || [],
      create: scheduleChanges.create || [],
      delete: scheduleChanges.delete || [],
      reschedule: scheduleChanges.reschedule || [],
    },
  };

  // Thêm metadata changes nếu có (OpendatePlan, Numofsession, InstructorID)
  if (metadataChanges.OpendatePlan) {
    payload.OpendatePlan = metadataChanges.OpendatePlan;
  }
  if (metadataChanges.EnddatePlan) {
    payload.EnddatePlan = metadataChanges.EnddatePlan;
  }
  if (metadataChanges.Numofsession) {
    payload.Numofsession = metadataChanges.Numofsession;
  }
  if (metadataChanges.InstructorID) {
    payload.InstructorID = metadataChanges.InstructorID;
  }

  return payload;
};

/**
 * Chuẩn hóa session object trước khi gửi
 * @param {Object} session - Session object
 * @returns {Object} Normalized session
 */
export const normalizeSessionForPayload = (session) => {
  return {
    SessionID: session.SessionID || session.sessionId || session.id || null,
    Date: session.Date || session.date,
    TimeslotID: Number(session.TimeslotID || session.timeslotId),
    InstructorID: Number(session.InstructorID || session.instructorId),
    ClassID: Number(session.ClassID || session.classId),
    Title: session.Title || session.title || null,
    Description: session.Description || session.description || null,
    ZoomUUID: session.ZoomUUID || session.zoomUUID || null,
    originalSessionID:
      session.originalSessionID || session.originalSessionId || null,
  };
};
