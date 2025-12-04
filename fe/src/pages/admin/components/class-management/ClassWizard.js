import React, { useState, useEffect, useMemo, useRef } from "react";
import dayjs from "dayjs";
import {
  dayOfWeekToDay,
  dayToDayOfWeek,
  getDayFromDate,
  getDayOfWeek,
} from "../../../../utils/validate";
import {
  validateStep1,
  validateStep2,
  validateStep3,
  // validateForm as validateFormUtil, // Không dùng
} from "../../../../utils/classWizardValidation";
import classService from "../../../../apiServices/classService";
import instructorService from "../../../../apiServices/instructorService";
import "./ClassWizard.css";
import {
  determineSlotStatus,
  // normalizeBlockedDayValue, // Không dùng
  normalizeTimeslotId,
  buildSchedulePatternFromSessions,
  computeLostSessions,
  computeScheduleDiff,
} from "./ClassWizard.utils";

const formatDateForDisplay = (value) => {
  if (!value) return "";
  if (value.includes("/")) return value;
  const parts = value.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return value;
};

const getWeekdayLabel = (dateStr) => {
  if (!dateStr) return "";
  const code = getDayFromDate(dateStr);
  return weekdayLabelMap[code] || code || "";
};

const parseDisplayDateToISO = (displayValue) => {
  if (!displayValue) return "";
  const normalized = displayValue.replace(/\s/g, "");
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(normalized)) {
    const [day, month, year] = normalized.split("/");
    return `${year}-${month}-${day}`;
  }
  return null;
};

const toISODateString = (value) => {
  if (!value) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      const [day, month, year] = trimmed.split("/");
      return `${year}-${month}-${day}`;
    }
  }
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
};

const formatTimeRange = (start, end) => {
  if (!start || !end) return "";
  const format = (time) => {
    if (typeof time !== "string") return "";
    const parts = time.split(":");
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : time;
  };
  return `${format(start)} - ${format(end)}`;
};

const normalizeTimeString = (value) => {
  if (!value) return "";
  const str = String(value).trim();
  const [timePart] = str.split(/[.\s]/); // Cắt phần đuôi (.000000) hoặc timezone
  if (/^\d{2}:\d{2}:\d{2}$/.test(timePart)) return timePart;
  if (/^\d{2}:\d{2}$/.test(timePart)) return `${timePart}:00`;
  return timePart;
};

// Không dùng cho logic mới
// const cloneTimeslotSelection = (source = {}, allowedDays) => {
//   const result = {};
//   const allowedSet = Array.isArray(allowedDays)
//     ? new Set(allowedDays.map((day) => Number(day)))
//     : null;

//   Object.keys(source || {}).forEach((dayKey) => {
//     const numericKey = Number(dayKey);
//     if (Number.isNaN(numericKey)) {
//       return;
//     }
//     if (allowedSet && !allowedSet.has(numericKey)) {
//       return;
//     }
//     const slots = source[dayKey];
//     if (Array.isArray(slots) && slots.length > 0) {
//       result[numericKey] = Array.from(new Set(slots));
//       return result;
//     }
//   });

//   return result;
// }; // Không dùng cho logic mới

const countSelectionSlots = (selection = {}) =>
  Object.values(selection || {}).reduce((total, slots) => {
    if (!Array.isArray(slots)) return total;
    return total + slots.length;
  }, 0);

// Không dùng cho logic mới
// const SEARCH_MODE_INITIAL_STATUS = {
//   loading: false,
//   success: false,
//   error: "",
//   date: null,
//   message: "",
// };

const weekdayLabelMap = {
  CN: "Chủ Nhật",
  T2: "Thứ 2",
  T3: "Thứ 3",
  T4: "Thứ 4",
  T5: "Thứ 5",
  T6: "Thứ 6",
  T7: "Thứ 7",
};

const ClassWizard = ({
  classData,
  onSubmit,
  onCancel,
  instructors = [],
  courses = [], // Thêm courses prop
  timeslots = [],
  variant = "modal", // "modal" | "page"
  readonly = false, // Mode chỉ xem (không cho chỉnh sửa)
  classId = null, // ClassID khi đang edit
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    Name: "",
    InstructorID: null,
    CourseID: null, // Thêm CourseID
    Fee: "",
    Maxstudent: "", // Đổi từ MaxLearners
    ZoomID: "", // Mới
    Zoompass: "", // Mới

    // Step 2: Schedule Info
    schedule: {
      OpendatePlan: "", // Đổi từ StartDate
      Numofsession: "", // Đổi từ ExpectedSessions
    },

    // Step 3: Sessions Detail
    scheduleDetail: {
      OpendatePlan: "", // Đổi từ StartDate
      EnddatePlan: "", // Đổi từ EndDate, sẽ tự tính
      DaysOfWeek: [],
      // Cấu trúc mới: mỗi ngày trong tuần có thể chọn nhiều ca
      // Format: { dayOfWeek: [timeslotIDs] }
      // Ví dụ: { 1: [1, 2], 3: [3], 5: [4, 5] } = T2 học ca 1,2; T4 học ca 3; T6 học ca 4,5
      TimeslotsByDay: {}, // Object với key là dayOfWeek (0-6), value là array timeslotIDs
      // SessionsPerWeek đã bỏ, tự động tính từ TimeslotsByDay
    },
    sessions: [],
  });

  const [errors, setErrors] = useState({});
  const [dateInputs, setDateInputs] = useState({
    scheduleStart: "",
    scheduleDetailStart: "",
    scheduleDetailEnd: "",
  });
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [previewSessions, setPreviewSessions] = useState([]);
  // const [timeslotSearchTerm, setTimeslotSearchTerm] = useState(""); // Search cho timeslot - Không dùng cho logic mới
  const [blockedDays, setBlockedDays] = useState({}); // {dayOfWeek: [timeslotIds]} - các timeslot bị khóa theo ngày
  const [instructorBusySchedule, setInstructorBusySchedule] = useState([]); // Lịch bận của instructor
  const [instructorType, setInstructorType] = useState(null); // 'fulltime' | 'parttime'
  const [parttimeAvailableSlotKeys, setParttimeAvailableSlotKeys] = useState(
    []
  );
  const parttimeAvailableSlotKeySet = useMemo(
    () => new Set(parttimeAvailableSlotKeys),
    [parttimeAvailableSlotKeys]
  );
  const [parttimeAvailableEntriesCount, setParttimeAvailableEntriesCount] =
    useState(null);
  const [parttimeAvailabilityError, setParttimeAvailabilityError] =
    useState("");
  const [instructorNameForError, setInstructorNameForError] = useState("");
  const [originalSessions, setOriginalSessions] = useState([]);
  const [impactedSessions, setImpactedSessions] = useState([]);
  // const [loadingBlockedDays, setLoadingBlockedDays] = useState(false); // Không dùng
  // const [skipWarningModal, setSkipWarningModal] = useState({
  //   open: false,
  //   skippedCount: 0,
  //   totalCount: 0,
  //   percentage: 0,
  // }); // Không dùng
  const [redirectModal, setRedirectModal] = useState({
    open: false,
    classId: null,
  }); // Modal chuyển hướng sau bước 2 khi đang edit/xem
  const [deleteSessionsModal, setDeleteSessionsModal] = useState({
    open: false,
    sessionsToDelete: [],
    newStartDate: null,
  }); // Modal cảnh báo xóa sessions khi lùi lịch
  const [cancelModal, setCancelModal] = useState({
    open: false,
  }); // Modal gợi ý xem lịch khi nhấn Hủy
  const [confirmEditModal, setConfirmEditModal] = useState({
    open: false,
    sessionsToDelete: [],
  }); // Modal xác nhận chỉnh sửa ở bước 2
  const [submittingFromStep2, setSubmittingFromStep2] = useState(false); // Track nếu đang submit từ bước 2
  // const [suggestedStartDates, setSuggestedStartDates] = useState([]); // Danh sách các ngày bắt đầu được gợi ý - Không dùng
  const [sessionsPerWeek, setSessionsPerWeek] = useState(0); // Số ca học mỗi tuần // Modal cảnh báo khi quá nhiều buổi bị SKIP
  const [originalStartDate, setOriginalStartDate] = useState(null); // Lưu ngày bắt đầu ban đầu để so sánh khi lùi lịch
  const [requiredSlotsPerWeek, setRequiredSlotsPerWeek] = useState(0); // Số ca học mong muốn mỗi tuần

  // Search dropdown states
  const [instructorSearchTerm, setInstructorSearchTerm] = useState("");
  const [instructorDropdownOpen, setInstructorDropdownOpen] = useState(false);
  const [courseSearchTerm, setCourseSearchTerm] = useState("");
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]); // Courses của instructor đã chọn
  const [loadingInstructorData, setLoadingInstructorData] = useState(false);
  const [slotAvailabilityStatus, setSlotAvailabilityStatus] = useState({
    checking: false,
    insufficient: false,
    requiredSlots: 0,
    availableSlots: 0,
    totalSlots: 0,
    suggestion: null,
  });
  // const [isSearchMode, setIsSearchMode] = useState(false); // Không dùng cho logic mới
  // const [searchModeSelections, setSearchModeSelections] = useState({}); // Không dùng cho logic mới
  // const [searchModeStatus, setSearchModeStatus] = useState(SEARCH_MODE_INITIAL_STATUS); // Không dùng cho logic mới
  // State để lưu lock reasons chi tiết cho tooltip - Không dùng cho logic mới (grid đã bị comment)
  // const [lockReasonsCache, setLockReasonsCache] = useState({}); // {`${dayOfWeek}-${timeslotId}`: {isLocked, reasons, summary}}
  // const [loadingLockReason, setLoadingLockReason] = useState(null); // `${dayOfWeek}-${timeslotId}` đang load
  // const [gridRefreshKey, setGridRefreshKey] = useState(0); // Key để force re-render grid khi blockedDays/instructorBusySchedule thay đổi - Không dùng cho logic mới
  // Logic mới: Chốt timeslot cho lớp DRAFT hoặc tạo mới
  const [lockedTimeslotId, setLockedTimeslotId] = useState(null); // Timeslot đã chốt cho toàn bộ lớp
  const [isDraftClass, setIsDraftClass] = useState(false); // Class có Status = 'DRAFT'?
  // Logic mới: Chọn timeslot trước → Disable các thứ bị trùng
  const [selectedTimeslotId, setSelectedTimeslotId] = useState(null); // Timeslot đã chọn trước
  const [availableDaysForTimeslot, setAvailableDaysForTimeslot] = useState([]); // Các ngày có timeslot giống và không bị trùng
  const [selectedTimeslotIds, setSelectedTimeslotIds] = useState(new Set()); // Các ca đã chọn (không cần ngày)
  const [shouldShowPreview, setShouldShowPreview] = useState(false); // Đã nhấn nút tính toán chưa
  // Loading / error tối thiểu cho analyzeBlockedDays ở Step 3
  const [loadingBlockedDays, setLoadingBlockedDays] = useState(false);
  const [blockedDaysError, setBlockedDaysError] = useState(null);
  const analyzeBlockedTimeoutRef = useRef(null);
  // State để quản lý việc tìm ngày bắt đầu khác
  const [alternativeStartDateSearch, setAlternativeStartDateSearch] = useState({
    loading: false,
    suggestions: [],
    error: null,
    showResults: false,
  });

  useEffect(() => {
    if (selectedInstructor) {
      setInstructorNameForError(
        selectedInstructor.FullName ||
          selectedInstructor.fullName ||
          "Giảng viên"
      );
    } else {
      setInstructorNameForError("");
    }
  }, [selectedInstructor]);

  const plannedStartDate =
    formData.scheduleDetail.OpendatePlan ||
    formData.schedule.OpendatePlan ||
    "";

  // const hasZeroAvailableSlots =
  //   !slotAvailabilityStatus.checking &&
  //   slotAvailabilityStatus.availableSlots === 0 &&
  //   (formData.scheduleDetail.DaysOfWeek?.length || 0) > 0; // Không dùng

  // Memo hóa tập tất cả TimeslotID đã chọn (dùng chung cho nhiều chỗ)
  // Phải định nghĩa trước khi sử dụng trong hasInsufficientSlots
  const allSelectedTimeslotIdsMemo = useMemo(() => {
    const all = new Set(selectedTimeslotIds);
    Object.values(formData.scheduleDetail.TimeslotsByDay || {}).forEach(
      (dayTimeslots) => {
        dayTimeslots.forEach((timeslotId) => {
          all.add(timeslotId);
        });
      }
    );
    return all;
  }, [selectedTimeslotIds, formData.scheduleDetail.TimeslotsByDay]);

  // Chỉ hiển thị cảnh báo khi:
  // 1. Đã chọn đủ ngày học (ít nhất 1 ngày)
  // 2. Đã chọn đủ ca học (ít nhất 1 ca)
  // 3. Không ở chế độ tìm kiếm ca mong muốn
  // 4. Có thiếu slot nhưng vẫn còn slot khả dụng
  const hasInsufficientSlots =
    !slotAvailabilityStatus.checking &&
    slotAvailabilityStatus.availableSlots > 0 &&
    slotAvailabilityStatus.availableSlots <
      (slotAvailabilityStatus.requiredSlots || 0) &&
    (formData.scheduleDetail.DaysOfWeek?.length || 0) > 0 &&
    (allSelectedTimeslotIdsMemo.size > 0 ||
      Object.keys(formData.scheduleDetail.TimeslotsByDay || {}).length > 0);

  // const searchModeSelectedCount = useMemo(
  //   () => countSelectionSlots(searchModeSelections),
  //   [searchModeSelections]
  // ); // Không dùng cho logic mới

  const selectedSlotCount = useMemo(
    () => countSelectionSlots(formData.scheduleDetail.TimeslotsByDay),
    [formData.scheduleDetail.TimeslotsByDay]
  );

  // Logic mới: Tự động chốt timeslot khi user chọn timeslot đầu tiên (cho DRAFT hoặc tạo mới)
  useEffect(() => {
    // Chỉ áp dụng cho tạo lớp mới (!classId) hoặc lớp DRAFT
    const shouldLockTimeslot = !classId || isDraftClass;
    if (!shouldLockTimeslot) {
      return;
    }

    const timeslotsByDay = formData.scheduleDetail.TimeslotsByDay || {};
    const allSelectedTimeslots = Object.values(timeslotsByDay)
      .flat()
      .map((id) => normalizeTimeslotId(id));
    const uniqueTimeslots = [...new Set(allSelectedTimeslots)];

    if (uniqueTimeslots.length === 0) {
      // Chưa chọn timeslot nào → reset lockedTimeslotId
      setLockedTimeslotId(null);
    } else if (uniqueTimeslots.length === 1) {
      // Chỉ có một timeslot duy nhất → chốt timeslot đó
      if (lockedTimeslotId !== uniqueTimeslots[0]) {
        setLockedTimeslotId(uniqueTimeslots[0]);
      }
    }
    // Nếu có nhiều timeslot khác nhau → giữ nguyên lockedTimeslotId (sẽ bị chặn ở handleTimeslotToggle)
  }, [
    formData.scheduleDetail.TimeslotsByDay,
    classId,
    isDraftClass,
    lockedTimeslotId,
  ]);

  // Logic mới: Tính toán các ngày hợp lệ dựa trên tất cả các ca đã chọn
  // KHÔNG tính toán khi đang ở chế độ tìm kiếm ca mong muốn
  useEffect(() => {
    // Không tính toán khi đang ở chế độ tìm kiếm
    if (alternativeStartDateSearch.showResults) {
      return;
    }

    // Nếu chưa chọn ca nào, disable tất cả các ngày
    if (
      allSelectedTimeslotIdsMemo.size === 0 ||
      !timeslots ||
      timeslots.length === 0
    ) {
      setAvailableDaysForTimeslot([]);
      return;
    }

    const startDate =
      formData.scheduleDetail.OpendatePlan ||
      formData.schedule.OpendatePlan ||
      "";

    if (!startDate) {
      setAvailableDaysForTimeslot([]);
      return;
    }

    // Tính endDate - nếu chưa có thì ước tính dựa trên số buổi học
    let endDate = formData.scheduleDetail.EnddatePlan;
    if (!endDate) {
      // Tính sessionsPerWeek từ TimeslotsByDay
      let sessionsPerWeekCalc = 0;
      Object.values(formData.scheduleDetail.TimeslotsByDay || {}).forEach(
        (dayTimeslots) => {
          sessionsPerWeekCalc += dayTimeslots.length;
        }
      );

      // Nếu chưa có TimeslotsByDay, tính từ tập allSelectedTimeslotIdsMemo và DaysOfWeek
      if (sessionsPerWeekCalc === 0 && allSelectedTimeslotIdsMemo.size > 0) {
        sessionsPerWeekCalc =
          allSelectedTimeslotIdsMemo.size *
          (formData.scheduleDetail.DaysOfWeek?.length || 1);
      }

      // Fallback: ít nhất 1 session/tuần
      if (sessionsPerWeekCalc === 0) {
        sessionsPerWeekCalc = 1;
      }

      const numOfSessions = formData.schedule?.Numofsession || 12;
      const totalWeeks = Math.ceil(numOfSessions / sessionsPerWeekCalc);
      endDate = dayjs(startDate).add(totalWeeks, "week").format("YYYY-MM-DD");
    }

    const availableDays = [];
    // Lấy danh sách các ngày đã được chọn (để luôn enable chúng)
    const selectedDays = formData.scheduleDetail.DaysOfWeek || [];

    // Duyệt qua các ngày trong tuần (T2-T7, bỏ chủ nhật)
    [1, 2, 3, 4, 5, 6].forEach((dayOfWeek) => {
      // Nếu ngày này đã được chọn, luôn enable (không check conflict)
      if (selectedDays.includes(dayOfWeek)) {
        availableDays.push(dayOfWeek);
        return;
      }

      const dayFormat = dayOfWeekToDay(dayOfWeek);

      // Kiểm tra xem có ít nhất 1 ca đã chọn hợp lệ với ngày này không
      let hasValidSlot = false;

      // Duyệt qua tất cả các ca đã chọn
      Array.from(allSelectedTimeslotIdsMemo).forEach((selectedTimeslotId) => {
        if (hasValidSlot) return; // Đã tìm thấy 1 ca hợp lệ, không cần check tiếp

        // Tìm timeslot trong DB
        const selectedTimeslot = timeslots.find(
          (t) =>
            normalizeTimeslotId(t.TimeslotID || t.id) ===
            normalizeTimeslotId(selectedTimeslotId)
        );

        if (!selectedTimeslot) return;

        const selectedStartTime = normalizeTimeString(
          selectedTimeslot.StartTime || selectedTimeslot.startTime || ""
        );
        const selectedEndTime = normalizeTimeString(
          selectedTimeslot.EndTime || selectedTimeslot.endTime || ""
        );

        // Tìm timeslot cho ngày này có cùng StartTime-EndTime
        // Ưu tiên tìm timeslot có Day khớp với ngày đó, nếu không có thì tìm timeslot không có Day
        // Điều này đảm bảo check conflict dùng đúng timeslotId của ngày đó
        let dayTimeslot = timeslots.find((t) => {
          const startTime = normalizeTimeString(
            t.StartTime || t.startTime || ""
          );
          const endTime = normalizeTimeString(t.EndTime || t.endTime || "");
          const timeslotDay = t.Day || t.day;
          // Ưu tiên tìm timeslot có Day khớp với ngày đó
          return (
            startTime === selectedStartTime &&
            endTime === selectedEndTime &&
            timeslotDay === dayFormat
          );
        });

        // Nếu không tìm thấy timeslot có Day khớp, tìm timeslot không có Day (có thể dùng cho mọi ngày)
        if (!dayTimeslot) {
          dayTimeslot = timeslots.find((t) => {
            const startTime = normalizeTimeString(
              t.StartTime || t.startTime || ""
            );
            const endTime = normalizeTimeString(t.EndTime || t.endTime || "");
            const timeslotDay = t.Day || t.day;
            // Tìm timeslot không có Day và có cùng StartTime-EndTime
            return (
              startTime === selectedStartTime &&
              endTime === selectedEndTime &&
              !timeslotDay
            );
          });
        }

        if (!dayTimeslot) return; // Ngày này không có timeslot cùng StartTime-EndTime

        const timeslotId = dayTimeslot.TimeslotID || dayTimeslot.id;

        // Logic mới: Fulltime mặc định rảnh T2-T7 (1-6), chỉ check conflict
        if (instructorType === "fulltime") {
          // Fulltime: chỉ check session conflict và HOLIDAY, không check parttime availability
          const slotStatus = getSlotStatus({
            dayOfWeek,
            timeslotId,
            startDate,
            endDate,
          });

          // Nếu không bị LOCKED, ngày này hợp lệ
          if (slotStatus.status !== "LOCKED") {
            hasValidSlot = true;
          }
        } else if (instructorType === "parttime") {
          // Parttime: phải có trong instructortimeslot với status AVAILABLE
          const slotKey = `${dayOfWeek}-${normalizeTimeslotId(timeslotId)}`;
          const hasAvailableSlot =
            parttimeAvailableSlotKeySet &&
            typeof parttimeAvailableSlotKeySet.has === "function" &&
            parttimeAvailableSlotKeySet.size > 0 &&
            parttimeAvailableSlotKeySet.has(slotKey);

          if (!hasAvailableSlot) return; // Parttime chưa đăng ký ca này → không rảnh

          // Nếu có AVAILABLE, tiếp tục check conflict (session, HOLIDAY)
          const slotStatus = getSlotStatus({
            dayOfWeek,
            timeslotId,
            startDate,
            endDate,
          });

          // Nếu không bị LOCKED, ngày này hợp lệ
          if (slotStatus.status !== "LOCKED") {
            hasValidSlot = true;
          }
        } else {
          // Chưa chọn instructor hoặc type chưa xác định → hợp lệ
          hasValidSlot = true;
        }
      });

      // Nếu có ít nhất 1 ca hợp lệ, thêm ngày vào danh sách
      if (hasValidSlot) {
        availableDays.push(dayOfWeek);
      }
    });

    setAvailableDaysForTimeslot(availableDays);
  }, [
    allSelectedTimeslotIdsMemo,
    formData.scheduleDetail.DaysOfWeek, // Thêm dependency để cập nhật khi chọn/bỏ chọn ngày
    formData.schedule?.Numofsession, // Thêm dependency để tính lại endDate khi Numofsession thay đổi
    timeslots,
    formData.scheduleDetail.OpendatePlan,
    formData.schedule.OpendatePlan,
    formData.scheduleDetail.EnddatePlan,
    blockedDays,
    instructorBusySchedule,
    instructorType,
    parttimeAvailableSlotKeySet,
  ]);

  const scheduleStartDate =
    formData.scheduleDetail.OpendatePlan ||
    formData.schedule.OpendatePlan ||
    "";
  const isEditMode = Boolean(classId);
  const classDisplayName =
    (formData.Name && formData.Name.trim()) ||
    classData?.Name?.trim() ||
    classData?.ClassName?.trim() ||
    (classId ? `Class ${classId}` : "Class chưa đặt tên");
  const requiredSessions = parseInt(formData.schedule.Numofsession, 10) || 0;
  const hasParttimeAvailabilityIssue =
    instructorType === "parttime" && Boolean(parttimeAvailabilityError);

  const timeslotMap = useMemo(() => {
    const map = {};
    (timeslots || []).forEach((slot) => {
      const key = normalizeTimeslotId(slot.TimeslotID || slot.id);
      if (key) {
        map[key] = slot;
      }
    });
    return map;
  }, [timeslots]);

  // const impactedSlotKeySet = useMemo(() => {
  //   if (!impactedSessions.length) return new Set();
  //   const set = new Set();
  //   impactedSessions.forEach((session) => {
  //     if (!session.Date) return;
  //     const dayNum = dayjs(session.Date).day();
  //     const key = `${dayNum}-${normalizeTimeslotId(
  //       session.TimeslotID || session.timeslotId
  //     )}`;
  //     set.add(key);
  //   });
  //   return set;
  // }, [impactedSessions]); // Không dùng

  const impactedSessionMessages = useMemo(() => {
    return impactedSessions.map((session) => {
      const dateDisplay = formatDateForDisplay(session.Date);
      const dayLabel = getWeekdayLabel(session.Date);
      const slot =
        timeslotMap[
          normalizeTimeslotId(session.TimeslotID || session.timeslotId)
        ];
      const slotLabel = slot
        ? `${slot.StartTime || slot.startTime || ""} - ${
            slot.EndTime || slot.endTime || ""
          }`
        : `Timeslot ${session.TimeslotID || session.timeslotId || ""}`;
      return `${dayLabel} | ${slotLabel} | ${dateDisplay}`;
    });
  }, [impactedSessions, timeslotMap]);

  // const impactedSessionsErrorMessage = impactedSessionMessages.length
  //   ? `Do thay đổi ngày bắt đầu dự kiến các ca sau sẽ phải chọn lại: ${impactedSessionMessages.join(
  //       "; "
  //     )}`
  //   : ""; // Không dùng

  // So sánh sessions cũ và previewSessions để xác định buổi "mất" / "bù thêm" theo diff
  // const scheduleDiff = useMemo(() => {
  //   if (!isEditMode || !originalSessions.length || !previewSessions.length) {
  //     return { lostSessions: [], newSessions: [] };
  //   }
  //   return computeScheduleDiff(originalSessions, previewSessions);
  // }, [isEditMode, originalSessions, previewSessions]); // Không dùng

  useEffect(() => {
    // Chỉ kiểm tra khi đã có thông tin instructor type
    if (!instructorType || instructorType !== "parttime") {
      setParttimeAvailabilityError("");
      return;
    }

    // Chờ parttimeAvailableEntriesCount được load (có thể là null khi đang load)
    // Nếu đã load xong (không phải null) và có requiredSessions
    if (
      parttimeAvailableEntriesCount !== null &&
      parttimeAvailableEntriesCount !== undefined &&
      requiredSessions > 0 &&
      parttimeAvailableEntriesCount < requiredSessions
    ) {
      const instructorName = instructorNameForError || "giảng viên part-time";
      const message = `Giảng viên ${instructorName} chưa tạo đủ số buổi cho ${requiredSessions} buổi học của lớp ${classDisplayName}`;
      setParttimeAvailabilityError(message);
    } else if (
      parttimeAvailableEntriesCount !== null &&
      parttimeAvailableEntriesCount !== undefined
    ) {
      // Đã load xong và không có vấn đề
      setParttimeAvailabilityError("");
    }
    // Nếu parttimeAvailableEntriesCount === null, có thể đang load hoặc chưa load, không set error
  }, [
    instructorType,
    parttimeAvailableEntriesCount,
    requiredSessions,
    instructorNameForError,
    classDisplayName,
  ]);

  // Tự động bỏ chọn ngày học khi không có ca học nào (mọi trường hợp)
  useEffect(() => {
    const hasSelectedTimeslots =
      selectedTimeslotIds.size > 0 ||
      (formData.scheduleDetail.TimeslotsByDay &&
        Object.values(formData.scheduleDetail.TimeslotsByDay).some(
          (arr) => arr && arr.length > 0
        ));

    // Nếu không có ca học nào được chọn, bỏ chọn tất cả các ngày
    if (
      !hasSelectedTimeslots &&
      formData.scheduleDetail.DaysOfWeek.length > 0
    ) {
      setFormData((prev) => ({
        ...prev,
        scheduleDetail: {
          ...prev.scheduleDetail,
          DaysOfWeek: [],
          TimeslotsByDay: {},
        },
      }));
    }
  }, [
    selectedTimeslotIds,
    formData.scheduleDetail.TimeslotsByDay,
    formData.scheduleDetail.DaysOfWeek,
  ]);

  useEffect(() => {
    if (
      !isEditMode ||
      !originalStartDate ||
      !formData.schedule?.OpendatePlan ||
      !originalSessions.length
    ) {
      setImpactedSessions([]);
      return;
    }

    const lost = computeLostSessions(
      originalSessions,
      originalStartDate,
      formData.schedule.OpendatePlan
    );
    setImpactedSessions(lost);
  }, [
    isEditMode,
    originalStartDate,
    originalSessions,
    formData.schedule?.OpendatePlan,
  ]);

  const hasSelectedDays = (formData.scheduleDetail.DaysOfWeek || []).length > 0;
  const hasSelectedSlots = hasSelectedDays && selectedSlotCount > 0;
  const hasScheduleCoreInfo =
    Boolean(formData.InstructorID) &&
    Number(formData.schedule?.Numofsession || 0) > 0 &&
    Boolean(scheduleStartDate);

  // Days of week options
  const daysOfWeekOptions = [
    { value: 0, label: "Chủ Nhật" },
    { value: 1, label: "Thứ Hai" },
    { value: 2, label: "Thứ Ba" },
    { value: 3, label: "Thứ Tư" },
    { value: 4, label: "Thứ Năm" },
    { value: 5, label: "Thứ Sáu" },
    { value: 6, label: "Thứ Bảy" },
  ];

  // Logic mới: Kiểm tra có buổi trùng không (cùng Date + TimeslotID)
  const hasDuplicateSessions = useMemo(() => {
    if (!hasScheduleCoreInfo || !hasSelectedSlots || !scheduleStartDate) {
      return false;
    }

    // Tạo map để check trùng: key = "Date-TimeslotID"
    const sessionMap = new Map();
    const numOfSessions = formData.schedule?.Numofsession || 0;
    const sessionsPerWeekCalc = sessionsPerWeek || requiredSlotsPerWeek || 1;
    const totalWeeks = Math.ceil(numOfSessions / sessionsPerWeekCalc);

    // Duyệt qua tất cả các buổi học sẽ được tạo
    let currentDate = dayjs(scheduleStartDate);
    for (let week = 0; week < totalWeeks; week++) {
      for (let day = 0; day < 7; day++) {
        const checkDate = currentDate.add(week * 7 + day, "day");
        const dayOfWeekNum = checkDate.day() === 0 ? 7 : checkDate.day(); // 1=T2, 7=CN
        const dayKey = String(dayOfWeekNum - 1); // Convert về 0-6

        const slots = formData.scheduleDetail.TimeslotsByDay?.[dayKey] || [];
        for (const timeslotId of slots) {
          const dateStr = checkDate.format("YYYY-MM-DD");
          const key = `${dateStr}-${timeslotId}`;

          if (sessionMap.has(key)) {
            return true; // Trùng buổi
          }
          sessionMap.set(key, true);
        }
      }
    }

    return false;
  }, [
    hasScheduleCoreInfo,
    hasSelectedSlots,
    scheduleStartDate,
    formData.schedule?.Numofsession,
    formData.scheduleDetail.TimeslotsByDay,
    sessionsPerWeek,
    requiredSlotsPerWeek,
  ]);

  // Kiểm tra xem có ít nhất 1 ca học AVAILABLE được chọn không (Logic mới: không check busyCount)
  const hasValidSelectedSlots = useMemo(() => {
    if (
      !hasScheduleCoreInfo ||
      !formData.scheduleDetail.TimeslotsByDay ||
      Object.keys(formData.scheduleDetail.TimeslotsByDay).length === 0
    ) {
      return false;
    }

    // Kiểm tra từng ca đã chọn xem có phải AVAILABLE không
    for (const [dayKey, slots] of Object.entries(
      formData.scheduleDetail.TimeslotsByDay
    )) {
      const dayOfWeek = Number(dayKey);
      if (Number.isNaN(dayOfWeek) || !Array.isArray(slots)) continue;

      for (const timeslotId of slots) {
        const status = determineSlotStatus({
          dayOfWeek,
          timeslotId,
          startDate: scheduleStartDate,
          endDate: formData.scheduleDetail.EnddatePlan,
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

        // Chỉ cần AVAILABLE (không check busyCount nữa)
        if (status.status === "AVAILABLE") {
          return true;
        }
      }
    }

    return false;
  }, [
    hasScheduleCoreInfo,
    formData.scheduleDetail.TimeslotsByDay,
    formData.scheduleDetail.EnddatePlan,
    scheduleStartDate,
    blockedDays,
    instructorBusySchedule,
    formData,
    sessionsPerWeek,
    requiredSlotsPerWeek,
    instructorType,
  ]);

  // Tính danh sách chi tiết các buổi trùng lịch (conflict details)
  const conflictDetails = useMemo(() => {
    if (
      !hasScheduleCoreInfo ||
      !hasSelectedSlots ||
      !formData.scheduleDetail.TimeslotsByDay ||
      !instructorBusySchedule ||
      instructorBusySchedule.length === 0
    ) {
      return [];
    }

    const details = [];
    const startDateObj = dayjs(scheduleStartDate);
    const endDateObj = formData.scheduleDetail.EnddatePlan
      ? dayjs(formData.scheduleDetail.EnddatePlan)
      : startDateObj.add(12, "week");

    Object.entries(formData.scheduleDetail.TimeslotsByDay).forEach(
      ([dayKey, slots]) => {
        const dayOfWeek = Number(dayKey);
        if (Number.isNaN(dayOfWeek) || !Array.isArray(slots)) return;

        const dayFormat = dayOfWeekToDay(dayOfWeek);
        const dayLabel =
          daysOfWeekOptions.find((d) => d.value === dayOfWeek)?.label || "";

        slots.forEach((timeslotId) => {
          const normalizedTimeslotId = normalizeTimeslotId(timeslotId);
          const matchingTimeslot = timeslots.find(
            (t) =>
              normalizeTimeslotId(t.TimeslotID || t.id) === normalizedTimeslotId
          );

          // Tìm các buổi trùng lịch cho timeslot này
          const conflicts = instructorBusySchedule.filter((busy) => {
            const busyDay = (busy.Day || busy.day || "").toUpperCase();
            const busyTimeslotId = normalizeTimeslotId(
              busy.TimeslotID || busy.timeslotId
            );
            if (
              busyDay !== dayFormat ||
              busyTimeslotId !== normalizedTimeslotId
            ) {
              return false;
            }

            const busyStatus = (busy.Status || "").toUpperCase();
            const isManualBusy =
              busyStatus === "OTHER" || busyStatus === "HOLIDAY";
            const hasSessionConflict =
              busy?.hasSession === true || !!busy?.SessionID;

            if (!isManualBusy && !hasSessionConflict) {
              return false;
            }

            const busyDate = busy.Date || busy.date;
            if (!busyDate) {
              return true; // Lịch nghỉ định kỳ (không có Date cụ thể)
            }

            const busyDateObj = dayjs(busyDate);
            return (
              busyDateObj.isAfter(startDateObj.subtract(1, "day")) &&
              busyDateObj.isBefore(endDateObj.add(1, "day"))
            );
          });

          // Thêm từng conflict vào danh sách chi tiết
          conflicts.forEach((conflict) => {
            const conflictDate = conflict.Date || conflict.date;
            const conflictStatus = conflict.Status || "";
            const source =
              conflictStatus.toUpperCase() === "OTHER" ||
              conflictStatus.toUpperCase() === "HOLIDAY"
                ? "Lịch nghỉ (OTHER/Holiday)"
                : conflict.SessionID || conflict.hasSession
                ? "Lịch dạy (Session)"
                : "Khác";

            const timeRange = matchingTimeslot
              ? formatTimeRange(
                  matchingTimeslot.StartTime || matchingTimeslot.startTime,
                  matchingTimeslot.EndTime || matchingTimeslot.endTime
                )
              : "";

            details.push({
              dayOfWeek,
              dayLabel,
              timeslotId,
              timeRange,
              date: conflictDate || "Định kỳ",
              source,
              status: conflictStatus,
              sessionId: conflict.SessionID || null,
              className: conflict.ClassName || null,
            });
          });
        });
      }
    );

    return details;
  }, [
    hasScheduleCoreInfo,
    hasSelectedSlots,
    formData.scheduleDetail.TimeslotsByDay,
    formData.scheduleDetail.EnddatePlan,
    scheduleStartDate,
    instructorBusySchedule,
    timeslots,
  ]);

  // Reset bảng chọn ca học khi thay đổi Ngày dự kiến hoặc Ngày học trong tuần
  useEffect(() => {
    if (currentStep !== 3) return;

    // Reset TimeslotsByDay khi OpendatePlan hoặc DaysOfWeek thay đổi
    setFormData((prev) => {
      const newOpendatePlan =
        prev.scheduleDetail.OpendatePlan || prev.schedule.OpendatePlan;
      const newDaysOfWeek = prev.scheduleDetail.DaysOfWeek || [];

      // Kiểm tra xem có thay đổi không
      const prevOpendatePlan =
        prev.scheduleDetail.OpendatePlan || prev.schedule.OpendatePlan;
      const prevDaysOfWeek = prev.scheduleDetail.DaysOfWeek || [];

      const opendatePlanChanged = prevOpendatePlan !== newOpendatePlan;
      const daysOfWeekChanged =
        JSON.stringify(prevDaysOfWeek.sort()) !==
        JSON.stringify(newDaysOfWeek.sort());

      if (opendatePlanChanged || daysOfWeekChanged) {
        // Reset TimeslotsByDay về rỗng
        return {
          ...prev,
          scheduleDetail: {
            ...prev.scheduleDetail,
            TimeslotsByDay: {},
          },
        };
      }

      return prev;
    });
  }, [
    currentStep,
    formData.scheduleDetail.OpendatePlan,
    formData.schedule.OpendatePlan,
    formData.scheduleDetail.DaysOfWeek,
  ]);

  // Khi blockedDays / lịch bận / ngày bắt đầu / DaysOfWeek thay đổi,
  // tự động bỏ chọn các timeslot đã chọn nhưng hiện tại bị LOCKED
  // Và xóa các ca đã chọn cho ngày không còn trong DaysOfWeek
  useEffect(() => {
    if (!scheduleStartDate) return;

    const newTimeslotsByDay = { ...formData.scheduleDetail.TimeslotsByDay };
    const currentDaysOfWeek = formData.scheduleDetail.DaysOfWeek || [];
    const currentDaysOfWeekSet = new Set(currentDaysOfWeek);
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
          endDate: formData.scheduleDetail.EnddatePlan,
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

    if (changed) {
      setFormData((prev) => ({
        ...prev,
        scheduleDetail: {
          ...prev.scheduleDetail,
          TimeslotsByDay: newTimeslotsByDay,
        },
      }));
    }

    // Clear error khi điều kiện thay đổi
    if (errors.preview) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.preview;
        return newErrors;
      });
    }
  }, [
    blockedDays,
    instructorBusySchedule,
    scheduleStartDate,
    formData.scheduleDetail.EnddatePlan,
    formData.scheduleDetail.DaysOfWeek,
    formData.schedule.Numofsession,
    sessionsPerWeek,
    requiredSlotsPerWeek,
  ]);

  const getSlotStatus = ({ dayOfWeek, timeslotId, startDate, endDate }) => {
    if (
      typeof dayOfWeek !== "number" ||
      !timeslotId ||
      !startDate ||
      !dayjs(startDate).isValid()
    ) {
      return { status: "AVAILABLE", reason: "", source: null, busyCount: 0 };
    }

    // Đảm bảo có đầy đủ thông tin trước khi check
    if (!hasScheduleCoreInfo) {
      return { status: "AVAILABLE", reason: "", source: null, busyCount: 0 };
    }

    return determineSlotStatus({
      dayOfWeek,
      timeslotId,
      startDate,
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
  };

  // Hàm fetch lock reasons chi tiết khi hover vào ô LOCKED - Không dùng cho logic mới (grid đã bị comment)
  // const fetchLockReason = async (dayOfWeek, timeslotId) => {
  //   if (!formData.InstructorID || !plannedStartDate) {
  //     return;
  //   }

  //   const cacheKey = `${dayOfWeek}-${timeslotId}`;

  //   // Nếu đã có trong cache, không fetch lại
  //   if (lockReasonsCache[cacheKey]) {
  //     return;
  //   }

  //   // Nếu đang load, không fetch lại
  //   if (loadingLockReason === cacheKey) {
  //     return;
  //   }

  //   setLoadingLockReason(cacheKey);

  //   try {
  //     const endDate = formData.scheduleDetail.EnddatePlan;
  //     if (!endDate) {
  //       // Ước tính endDate nếu chưa có
  //       const estimatedWeeks = Math.max(
  //         formData.schedule.Numofsession || 12,
  //         12
  //       );
  //       const estimatedEndDate = dayjs(plannedStartDate)
  //         .add(estimatedWeeks, "week")
  //         .format("YYYY-MM-DD");

  //       const reasons = await classService.getTimeslotLockReasons({
  //         InstructorID: formData.InstructorID,
  //         dayOfWeek,
  //         timeslotId,
  //         startDate: plannedStartDate,
  //         endDate: estimatedEndDate,
  //       });

  //       setLockReasonsCache((prev) => ({
  //         ...prev,
  //         [cacheKey]: reasons,
  //       }));
  //     } else {
  //       const reasons = await classService.getTimeslotLockReasons({
  //         InstructorID: formData.InstructorID,
  //         dayOfWeek,
  //         timeslotId,
  //         startDate: plannedStartDate,
  //         endDate,
  //       });

  //       setLockReasonsCache((prev) => ({
  //         ...prev,
  //         [cacheKey]: reasons,
  //       }));
  //     }
  //   } catch (error) {
  //     console.error("Error fetching lock reason:", error);
  //     // Không set error vào cache để có thể retry
  //   } finally {
  //     setLoadingLockReason(null);
  //   }
  // }; // Không dùng cho logic mới

  // const applySuggestedStartDate = (date) => {
  //   if (!date) return;
  //   setFormData((prev) => ({
  //     ...prev,
  //     scheduleDetail: {
  //       ...prev.scheduleDetail,
  //       OpendatePlan: date,
  //     },
  //     schedule: {
  //       ...prev.schedule,
  //       OpendatePlan: date,
  //     },
  //   }));
  // }; // Không dùng

  // Filtered instructors based on search
  const filteredInstructors = useMemo(() => {
    if (!instructorSearchTerm) return instructors;
    const searchLower = instructorSearchTerm.toLowerCase();
    return instructors.filter(
      (instructor) =>
        (instructor.FullName || instructor.fullName || "")
          .toLowerCase()
          .includes(searchLower) ||
        (instructor.Major || instructor.major || "")
          .toLowerCase()
          .includes(searchLower)
    );
  }, [instructors, instructorSearchTerm]);

  // Filtered courses based on search
  const filteredCourses = useMemo(() => {
    if (!courseSearchTerm) return availableCourses;
    const searchLower = courseSearchTerm.toLowerCase();
    return availableCourses.filter(
      (course) =>
        (course.Title || course.title || "")
          .toLowerCase()
          .includes(searchLower) ||
        (course.Description || course.description || "")
          .toLowerCase()
          .includes(searchLower)
    );
  }, [availableCourses, courseSearchTerm]);

  // Load courses của instructor khi chọn instructor
  useEffect(() => {
    const loadInstructorCourses = async () => {
      if (!formData.InstructorID) {
        setAvailableCourses([]);
        setFormData((prev) => ({ ...prev, CourseID: null }));
        setSelectedCourse(null);
        return;
      }

      setLoadingInstructorData(true);
      try {
        console.log(
          "[ClassWizard] Loading courses for InstructorID:",
          formData.InstructorID
        );

        // Gọi API để lấy danh sách môn học mà instructor này được dạy với status PUBLISHED
        const instructorWithCourses =
          await instructorService.getInstructorWithCourses(
            formData.InstructorID
          );

        console.log(
          "[ClassWizard] Instructor with courses response:",
          instructorWithCourses
        );
        console.log(
          "[ClassWizard] Response type:",
          typeof instructorWithCourses,
          Array.isArray(instructorWithCourses)
        );
        console.log(
          "[ClassWizard] Response keys:",
          instructorWithCourses ? Object.keys(instructorWithCourses) : "null"
        );

        // Lấy danh sách courses từ response
        // Backend trả về: { InstructorID, FullName, ..., courses: [...] }
        // Mỗi course có: { CourseID, Title, Status (mapped from CourseStatus), ... }
        let instructorCoursesList = [];

        if (instructorWithCourses) {
          // Thử nhiều cách để lấy courses
          instructorCoursesList =
            instructorWithCourses.courses ||
            instructorWithCourses.Courses ||
            (Array.isArray(instructorWithCourses) ? instructorWithCourses : []);
        }

        console.log(
          "[ClassWizard] Instructor courses list (raw):",
          instructorCoursesList,
          "Length:",
          instructorCoursesList?.length || 0
        );

        // Filter theo status PUBLISHED
        // Backend trả về Status (đã được map từ CourseStatus trong repository)
        const instructorCourses = (instructorCoursesList || []).filter(
          (course) => {
            const status =
              course.Status || course.CourseStatus || course.status;
            const isPublished =
              status === "PUBLISHED" ||
              status === "published" ||
              status === "Published";

            console.log(
              `[ClassWizard] Course ${
                course.CourseID || course.id
              } - Status: ${status}, IsPublished: ${isPublished}`
            );

            return isPublished;
          }
        );

        console.log(
          "[ClassWizard] Filtered PUBLISHED courses:",
          instructorCourses,
          "Length:",
          instructorCourses.length
        );

        setAvailableCourses(instructorCourses);

        // Reset CourseID khi đổi instructor (chỉ khi không phải edit/view mode)
        // Nếu đang edit/view (có classData) và InstructorID khớp với classData, giữ nguyên CourseID
        const isEditMode =
          classData && (classData.CourseID || classData.courseId);
        const isSameInstructor =
          isEditMode &&
          formData.InstructorID ===
            (classData.InstructorID || classData.instructorId);

        // Chỉ reset CourseID nếu không phải edit mode hoặc instructor đã thay đổi
        if (!isEditMode || !isSameInstructor) {
          setFormData((prev) => ({ ...prev, CourseID: null }));
          setSelectedCourse(null);
        }
      } catch (error) {
        console.error("Error loading instructor courses:", error);
        setAvailableCourses([]);
      } finally {
        setLoadingInstructorData(false);
      }
    };

    loadInstructorCourses();
  }, [formData.InstructorID, courses]);

  useEffect(() => {
    if (classData) {
      setFormData({
        Name: classData.Name || classData.title || "",
        InstructorID: classData.InstructorID || classData.instructorId || null,
        Fee: classData.Fee || classData.tuitionFee || "",
        CourseID: classData.CourseID || classData.courseId || null, // Thêm CourseID
        Maxstudent:
          classData.Maxstudent ||
          classData.MaxLearners ||
          classData.maxLearners ||
          "",
        ZoomID: classData.ZoomID || classData.zoomID || "",
        Zoompass: classData.Zoompass || classData.zoompass || "",
        schedule: {
          OpendatePlan:
            classData.OpendatePlan ||
            classData.StartDate ||
            classData.startDate ||
            "",
          Numofsession:
            classData.Numofsession ||
            classData.ExpectedSessions ||
            classData.expectedSessions ||
            "",
        },
        scheduleDetail: {
          OpendatePlan:
            classData.OpendatePlan ||
            classData.StartDate ||
            classData.startDate ||
            "",
          EnddatePlan:
            classData.EnddatePlan ||
            classData.EndDate ||
            classData.endDate ||
            "",
          DaysOfWeek: classData.schedule?.DaysOfWeek || [],
          TimeslotIDs:
            classData.schedule?.TimeslotIDs ||
            (classData.schedule?.TimeslotID
              ? [classData.schedule.TimeslotID]
              : []) ||
            [],
          // SessionsPerWeek đã bỏ, tự động tính từ TimeslotsByDay
        },
        sessions: classData.sessions || [],
      });

      if (classData.InstructorID || classData.instructorId) {
        const instructor = instructors.find(
          (i) =>
            i.InstructorID ===
              (classData.InstructorID || classData.instructorId) ||
            i.id === (classData.InstructorID || classData.instructorId)
        );
        setSelectedInstructor(instructor);
      }

      // Set selectedCourse khi có CourseID
      if (classData.CourseID || classData.courseId) {
        const courseId = classData.CourseID || classData.courseId;
        // Tìm course từ courses list (từ props)
        const course = courses.find(
          (c) =>
            (c.CourseID || c.id) === courseId ||
            (c.CourseID || c.id) === parseInt(courseId) ||
            String(c.CourseID || c.id) === String(courseId)
        );
        if (course) {
          setSelectedCourse(course);
          setCourseSearchTerm(course.Title || course.title || "");
          // Cập nhật formData.CourseID để validation pass
          // Ưu tiên course.CourseID hoặc course.id, nếu không có thì dùng courseId từ classData
          const finalCourseId = course.CourseID || course.id || courseId;
          setFormData((prev) => ({
            ...prev,
            CourseID: finalCourseId,
          }));
        } else {
          console.warn(
            `[ClassWizard] CourseID ${courseId} not found in courses list`,
            { coursesCount: courses.length, courseId }
          );
          // Vẫn set CourseID ngay cả khi không tìm thấy course để validation pass
          setFormData((prev) => ({
            ...prev,
            CourseID: courseId,
          }));
        }
      }

      // Lưu ngày bắt đầu ban đầu để so sánh khi lùi lịch
      const originalDate =
        classData.OpendatePlan ||
        classData.StartDate ||
        classData.startDate ||
        "";
      if (originalDate) {
        setOriginalStartDate(originalDate);
      }

      const sessionsFromClass = classData.sessions || [];
      setOriginalSessions(sessionsFromClass);

      // Logic mới: Xác định isDraftClass từ Status
      const classStatus = classData.Status || classData.status || "";
      const draftStatus = classStatus === "DRAFT" || classStatus === "draft";
      setIsDraftClass(draftStatus);

      // Rebuild DaysOfWeek + TimeslotsByDay từ sessions khi EDIT
      // Giúp hiển thị lại đúng các tick ở Step 3 ngay cả khi scheduleDetail chưa có pattern
      if (sessionsFromClass.length > 0) {
        const { DaysOfWeek, TimeslotsByDay } =
          buildSchedulePatternFromSessions(sessionsFromClass);

        if (DaysOfWeek.length > 0) {
          setFormData((prev) => {
            const hasExistingPattern =
              prev?.scheduleDetail?.TimeslotsByDay &&
              Object.keys(prev.scheduleDetail.TimeslotsByDay).length > 0;

            if (hasExistingPattern) {
              // Không ghi đè nếu đã có pattern từ trước (tránh mất lựa chọn người dùng)
              return prev;
            }

            return {
              ...prev,
              scheduleDetail: {
                ...(prev.scheduleDetail || {}),
                DaysOfWeek: DaysOfWeek,
                TimeslotsByDay: {
                  ...(prev.scheduleDetail?.TimeslotsByDay || {}),
                  ...TimeslotsByDay,
                },
              },
            };
          });

          // Logic mới: Xác định lockedTimeslotId từ TimeslotsByDay nếu là DRAFT
          // Nếu tất cả các ngày đều dùng cùng một timeslot → đó là timeslot đã chốt
          if (draftStatus) {
            const allTimeslots = Object.values(TimeslotsByDay || {})
              .flat()
              .map((id) => normalizeTimeslotId(id));
            const uniqueTimeslots = [...new Set(allTimeslots)];
            if (uniqueTimeslots.length === 1) {
              setLockedTimeslotId(uniqueTimeslots[0]);
            }
          }
        }
      }
    } else {
      // Tạo lớp mới → isDraftClass = true (mặc định)
      setIsDraftClass(true);
    }
  }, [classData, instructors, timeslots, courses]);

  // Kiểm tra khi lùi lịch (OpendatePlan thay đổi và nhỏ hơn originalStartDate)
  // Chỉ check khi đang edit (có classId) và không readonly
  useEffect(() => {
    if (
      classId &&
      !readonly &&
      originalStartDate &&
      formData.schedule.OpendatePlan &&
      formData.sessions &&
      formData.sessions.length > 0
    ) {
      const newStartDate = dayjs(formData.schedule.OpendatePlan);
      const originalDate = dayjs(originalStartDate);

      // Nếu ngày mới nhỏ hơn ngày cũ (lùi lịch)
      if (
        newStartDate.isValid() &&
        originalDate.isValid() &&
        newStartDate.isBefore(originalDate)
      ) {
        // Tìm các sessions sẽ bị xóa (có Date trước ngày mới)
        const sessionsToDelete = formData.sessions.filter((session) => {
          if (!session.Date) return false;
          const sessionDate = dayjs(session.Date);
          return sessionDate.isValid() && sessionDate.isBefore(newStartDate);
        });

        if (sessionsToDelete.length > 0 && !deleteSessionsModal.open) {
          setDeleteSessionsModal({
            open: true,
            sessionsToDelete,
            newStartDate: formData.schedule.OpendatePlan,
          });
        }
      }
    }
  }, [formData.schedule.OpendatePlan, classId, originalStartDate, readonly]);

  useEffect(() => {
    setDateInputs((prev) => ({
      ...prev,
      scheduleStart: formatDateForDisplay(formData.schedule.OpendatePlan),
    }));
  }, [formData.schedule.OpendatePlan]);

  useEffect(() => {
    setDateInputs((prev) => ({
      ...prev,
      scheduleDetailStart: formatDateForDisplay(
        formData.scheduleDetail.OpendatePlan || formData.schedule.OpendatePlan
      ),
    }));
  }, [formData.scheduleDetail.OpendatePlan, formData.schedule.OpendatePlan]);

  useEffect(() => {
    setDateInputs((prev) => ({
      ...prev,
      scheduleDetailEnd: formatDateForDisplay(
        formData.scheduleDetail.EnddatePlan
      ),
    }));
  }, [formData.scheduleDetail.EnddatePlan]);

  // Generate preview sessions from schedule detail
  // Logic "Nhảy cóc & Tịnh tiến": Xử lý lịch bận cục bộ (Status='Other' hoặc 'Holiday')
  // - Normal: Buổi học bình thường
  // - Skipped: Ngày trùng lịch bận cục bộ -> Bỏ qua, hiển thị "Nghỉ: GV bận"
  // - Extended: Buổi dôi ra ở cuối danh sách do thêm lại ca học
  const generatePreviewSessions = async (
    startDate,
    endDate,
    daysOfWeek,
    timeslotsByDay,
    totalSessionsNeeded
  ) => {
    console.log("generatePreviewSessions called with:", {
      startDate,
      endDate,
      daysOfWeek,
      timeslotsByDay,
      totalSessionsNeeded,
    });

    if (
      !startDate ||
      daysOfWeek.length === 0 ||
      !timeslotsByDay ||
      Object.keys(timeslotsByDay).length === 0
    ) {
      console.log(
        "generatePreviewSessions: Missing required data, clearing sessions"
      );
      setPreviewSessions([]);
      setFormData((prev) => ({ ...prev, sessions: [] }));
      return;
    }

    // Nếu không có endDate, tính toán dựa trên totalSessionsNeeded
    let calculatedEndDate = endDate;
    if (!endDate && totalSessionsNeeded) {
      calculatedEndDate = calculateEndDate(
        startDate,
        totalSessionsNeeded,
        timeslotsByDay,
        daysOfWeek,
        timeslots
      );
      console.log(
        "generatePreviewSessions: Calculated endDate:",
        calculatedEndDate
      );
    }

    if (!calculatedEndDate) {
      console.log(
        "generatePreviewSessions: No endDate available, clearing sessions"
      );
      setPreviewSessions([]);
      setFormData((prev) => ({ ...prev, sessions: [] }));
      return;
    }

    const sessions = [];

    // Parse startDate và endDate đúng cách để tránh timezone issues
    // new Date("YYYY-MM-DD") có thể bị ảnh hưởng bởi timezone
    let start, end;
    if (typeof startDate === "string") {
      const startParts = startDate.split("-");
      if (startParts.length === 3) {
        start = new Date(
          parseInt(startParts[0], 10),
          parseInt(startParts[1], 10) - 1,
          parseInt(startParts[2], 10)
        );
      } else {
        start = new Date(startDate);
      }
    } else {
      start = new Date(startDate);
    }

    if (typeof endDate === "string") {
      const endParts = endDate.split("-");
      if (endParts.length === 3) {
        end = new Date(
          parseInt(endParts[0], 10),
          parseInt(endParts[1], 10) - 1,
          parseInt(endParts[2], 10)
        );
        end.setHours(23, 59, 59, 999);
      } else {
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      }
    } else {
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }

    start.setHours(0, 0, 0, 0);

    // Sử dụng calculatedEndDate thay vì end
    if (typeof calculatedEndDate === "string") {
      const endParts = calculatedEndDate.split("-");
      if (endParts.length === 3) {
        end = new Date(
          parseInt(endParts[0], 10),
          parseInt(endParts[1], 10) - 1,
          parseInt(endParts[2], 10)
        );
        end.setHours(23, 59, 59, 999);
      } else {
        end = new Date(calculatedEndDate);
        end.setHours(23, 59, 59, 999);
      }
    } else {
      end = new Date(calculatedEndDate);
      end.setHours(23, 59, 59, 999);
    }

    let sessionNumber = 1;

    // Tính tổng số ca mỗi tuần
    // Logic cũ: Hỗ trợ multiple timeslots cho mỗi ngày (không dùng cho DRAFT)
    // Logic mới: Với DRAFT chỉ có một timeslot duy nhất, nhưng logic này vẫn hỗ trợ multiple timeslots
    //   cho trường hợp edit lịch không phải DRAFT (cho phép chọn timeslot linh hoạt)
    let sessionsPerWeek = 0;
    daysOfWeek.forEach((dayOfWeek) => {
      const dayTimeslots = timeslotsByDay[dayOfWeek] || [];
      sessionsPerWeek += dayTimeslots.length;
    });

    console.log("generatePreviewSessions: sessionsPerWeek =", sessionsPerWeek);

    if (sessionsPerWeek === 0) {
      console.log(
        "generatePreviewSessions: No sessions per week, clearing sessions"
      );
      setPreviewSessions([]);
      setFormData((prev) => ({ ...prev, sessions: [] }));
      return;
    }

    // Duyệt qua từng ngày từ ngày bắt đầu đến ngày kết thúc
    let currentDate = new Date(start);
    let sessionsCreated = 0;
    const maxSessions = totalSessionsNeeded || 9999; // Nếu không có totalSessionsNeeded thì tạo đến hết
    let validTimeslotsCount = 0; // Đếm số timeslots hợp lệ đã được tạo

    while (currentDate <= end && sessionsCreated < maxSessions) {
      const dayOfWeek = currentDate.getDay();

      // Nếu là ngày học trong tuần
      if (daysOfWeek.includes(dayOfWeek)) {
        const dayTimeslotIDs = timeslotsByDay[dayOfWeek] || [];

        // Format date string đúng cách (YYYY-MM-DD) để tránh timezone issues
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const day = String(currentDate.getDate()).padStart(2, "0");
        const currentDateStr = `${year}-${month}-${day}`;
        const currentDateDay = getDayFromDate(currentDateStr);

        // Lọc các timeslots hợp lệ cho ngày này (tìm timeslot cho ngày đó có cùng StartTime-EndTime)
        const validTimeslotsForDay = [];
        for (let i = 0; i < dayTimeslotIDs.length; i++) {
          const timeslotID = dayTimeslotIDs[i];
          const normalizedTimeslotID = normalizeTimeslotId(timeslotID);

          // Tìm timeslot gốc để lấy StartTime-EndTime
          const originalTimeslot = timeslots.find(
            (t) =>
              normalizeTimeslotId(t.TimeslotID || t.id) === normalizedTimeslotID
          );

          if (!originalTimeslot) continue;

          const selectedStartTime = normalizeTimeString(
            originalTimeslot.StartTime || originalTimeslot.startTime || ""
          );
          const selectedEndTime = normalizeTimeString(
            originalTimeslot.EndTime || originalTimeslot.endTime || ""
          );

          // QUAN TRỌNG: Dùng TimeslotID gốc (từ timeslot được chọn ban đầu)
          // để đảm bảo DRAFT class có cùng set TimeslotID cho tất cả các ngày
          // Backend sẽ xử lý việc map timeslot với ngày khi tạo sessions thực tế
          // Chỉ check xem timeslot có hợp lệ cho ngày này không (để cảnh báo nếu cần)
          const originalTimeslotId =
            originalTimeslot.TimeslotID || originalTimeslot.id;

          // Tìm timeslot cho ngày này có cùng StartTime-EndTime (để check conflict)
          // Ưu tiên tìm timeslot có Day khớp với ngày đó
          let dayTimeslot = timeslots.find((t) => {
            const startTime = normalizeTimeString(
              t.StartTime || t.startTime || ""
            );
            const endTime = normalizeTimeString(t.EndTime || t.endTime || "");
            const timeslotDay = t.Day || t.day;
            return (
              startTime === selectedStartTime &&
              endTime === selectedEndTime &&
              timeslotDay === currentDateDay
            );
          });

          // Nếu không tìm thấy timeslot có Day khớp, tìm timeslot không có Day
          if (!dayTimeslot) {
            dayTimeslot = timeslots.find((t) => {
              const startTime = normalizeTimeString(
                t.StartTime || t.startTime || ""
              );
              const endTime = normalizeTimeString(t.EndTime || t.endTime || "");
              const timeslotDay = t.Day || t.day;
              return (
                startTime === selectedStartTime &&
                endTime === selectedEndTime &&
                !timeslotDay
              );
            });
          }

          // Dùng TimeslotID gốc, nhưng dùng dayTimeslot (nếu tìm thấy) để lấy thông tin StartTime/EndTime
          // Nếu không tìm thấy dayTimeslot, dùng originalTimeslot
          const timeslotToUse = dayTimeslot || originalTimeslot;
          validTimeslotsForDay.push({
            timeslotID: originalTimeslotId, // Dùng TimeslotID gốc
            timeslot: timeslotToUse, // Dùng timeslot để lấy thông tin StartTime/EndTime
          });
        }

        // Tạo session cho mỗi ca học hợp lệ trong ngày này
        // Logic cũ: Hỗ trợ multiple timeslots cho mỗi ngày (không dùng cho DRAFT)
        // Logic mới: Với DRAFT chỉ có một timeslot duy nhất, nhưng logic này vẫn hỗ trợ multiple timeslots
        //   cho trường hợp edit lịch không phải DRAFT (cho phép chọn timeslot linh hoạt)
        for (let i = 0; i < validTimeslotsForDay.length; i++) {
          // Kiểm tra xem đã đủ số buổi chưa (chỉ tạo khi chưa đủ)
          if (sessionsCreated >= maxSessions) {
            break; // Dừng vòng lặp for
          }

          const { timeslotID, timeslot } = validTimeslotsForDay[i];

          // Kiểm tra lịch bận cục bộ (Status='Other' hoặc 'Holiday')
          // TODO: Gọi API để kiểm tra instructor có bận vào ngày này không
          // Tạm thời dùng instructorBusySchedule đã load
          const isBusy = instructorBusySchedule.some(
            (busy) =>
              busy.Date === currentDateStr &&
              busy.TimeslotID === timeslotID &&
              (busy.Status === "Other" || busy.Status === "Holiday")
          );

          if (isBusy) {
            // SKIPPED: Ngày trùng lịch bận cục bộ
            sessions.push({
              number: sessionNumber++,
              date: new Date(currentDate),
              dayOfWeek: dayOfWeek,
              timeslot: timeslot,
              type: "SKIPPED",
              reason: "GV bận",
            });
            // Không tăng sessionsCreated vì đây là buổi bị bỏ qua
          } else {
            // NORMAL: Buổi học bình thường
            sessions.push({
              number: sessionNumber++,
              date: new Date(currentDate),
              dayOfWeek: dayOfWeek,
              timeslot: timeslot,
              type: "NORMAL",
            });
            sessionsCreated++;
            validTimeslotsCount++;
          }

          // Kiểm tra lại sau khi tạo để đảm bảo không tạo thừa
          if (sessionsCreated >= maxSessions) {
            break;
          }
        }

        // Nếu không có timeslot nào cho ngày này (do không tìm thấy trong danh sách timeslots)
        if (validTimeslotsForDay.length === 0 && dayTimeslotIDs.length > 0) {
          console.warn(
            `generatePreviewSessions: Ngày ${currentDateStr} (${currentDateDay}) không tìm thấy timeslot nào trong danh sách. ` +
              `Các timeslot IDs được chọn: ${dayTimeslotIDs.join(", ")}`
          );
        }
      }

      // Nếu đã đủ số buổi, dừng luôn
      if (sessionsCreated >= maxSessions) {
        break;
      }

      // Chuyển sang ngày tiếp theo
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Hàm riêng: Tạo các buổi Extended theo logic "Tự động Tịnh tiến"
    // Hệ thống sẽ lấy ngày đúng lịch tiếp theo sau khi khóa học dự kiến kết thúc để làm buổi bù
    // Tịnh tiến theo toàn bộ lịch học (tất cả ca trong ngày), không phải từng ca riêng lẻ
    const createExtendedSessions = (
      skippedCount,
      normalSessions,
      lastNormalDate,
      daysOfWeek,
      timeslotsByDay,
      instructorBusySchedule,
      timeslots
    ) => {
      if (skippedCount === 0 || normalSessions.length === 0) {
        return [];
      }

      const extendedSessions = [];
      let extendedDate = new Date(lastNormalDate);
      extendedDate.setDate(extendedDate.getDate() + 1); // Bắt đầu từ ngày tiếp theo
      let extendedCreated = 0;
      const maxExtendedIterations = skippedCount * 20; // Giới hạn vòng lặp
      let extendedIterations = 0;

      // Tìm ngày theo đúng lịch học tiếp theo (tịnh tiến theo daysOfWeek và timeslotsByDay)
      while (
        extendedCreated < skippedCount &&
        extendedIterations < maxExtendedIterations
      ) {
        extendedIterations++;
        const extendedDayOfWeek = extendedDate.getDay();

        // Kiểm tra xem ngày này có trong lịch học không (daysOfWeek)
        if (daysOfWeek.includes(extendedDayOfWeek)) {
          const dayTimeslotIDs = timeslotsByDay[extendedDayOfWeek] || [];
          const year = extendedDate.getFullYear();
          const month = String(extendedDate.getMonth() + 1).padStart(2, "0");
          const day = String(extendedDate.getDate()).padStart(2, "0");
          const extendedDateStr = `${year}-${month}-${day}`;

          // Tạo TẤT CẢ các ca học trong ngày này (tịnh tiến theo toàn bộ lịch học)
          for (const timeslotID of dayTimeslotIDs) {
            if (extendedCreated >= skippedCount) break;

            const timeslot = timeslots.find(
              (t) => (t.TimeslotID || t.id) === timeslotID
            );

            if (timeslot) {
              // Validate Date khớp với Day của Timeslot
              const timeslotDay = timeslot.Day || timeslot.day;
              const currentDateDay = getDayFromDate(extendedDateStr);

              if (timeslotDay && currentDateDay !== timeslotDay) {
                // Bỏ qua nếu Date không khớp với Day của Timeslot
                continue;
              }

              // Kiểm tra xem ngày này có bận không (chỉ check OTHER/Holiday, không check session conflict)
              const isBusy = instructorBusySchedule.some(
                (busy) =>
                  busy.Date === extendedDateStr &&
                  busy.TimeslotID === timeslotID &&
                  (busy.Status === "Other" ||
                    busy.Status === "Holiday" ||
                    busy.Status === "OTHER" ||
                    busy.Status === "HOLIDAY")
              );

              if (!isBusy) {
                // Tạo buổi Extended - đây là ngày đúng lịch học tiếp theo
                extendedSessions.push({
                  number: sessionNumber++,
                  date: new Date(extendedDate),
                  dayOfWeek: extendedDayOfWeek,
                  timeslot: timeslot,
                  type: "EXTENDED",
                });
                extendedCreated++;
              }
            }
          }
        }

        // Chuyển sang ngày tiếp theo (tịnh tiến)
        extendedDate.setDate(extendedDate.getDate() + 1);
      }

      return extendedSessions;
    };

    // Logic "Tự động Tịnh tiến": Thêm các buổi Extended ở cuối theo đúng lịch học tiếp theo
    const skippedCount = sessions.filter((s) => s.type === "SKIPPED").length;
    const normalSessions = sessions.filter((s) => s.type === "NORMAL");
    let extendedSessions = [];

    if (skippedCount > 0 && normalSessions.length > 0) {
      // Tìm ngày cuối cùng của normal sessions
      const lastNormalDate = normalSessions.reduce((latest, session) => {
        return session.date > latest ? session.date : latest;
      }, normalSessions[0]?.date || new Date(start));

      // Gọi hàm riêng để tạo các buổi Extended
      extendedSessions = createExtendedSessions(
        skippedCount,
        normalSessions,
        lastNormalDate,
        daysOfWeek,
        timeslotsByDay,
        instructorBusySchedule,
        timeslots
      );
    }

    // Gộp tất cả sessions: Normal + Skipped + Extended
    const allSessions = [...sessions, ...extendedSessions];

    setPreviewSessions(allSessions);

    // Validation: Kiểm tra xem có quá nhiều buổi bị SKIP không (> 50%)
    const totalSessions = allSessions.length;
    const skippedSessionsList = allSessions.filter((s) => s.type === "SKIPPED");
    const skippedSessionsCount = skippedSessionsList.length;
    const skippedPercentage =
      totalSessions > 0 ? (skippedSessionsCount / totalSessions) * 100 : 0;

    // Nếu quá 50% buổi bị SKIP, hiển thị modal cảnh báo - Không dùng cho logic mới
    // if (skippedPercentage > 50) {
    //   setSkipWarningModal({
    //     open: true,
    //     skippedCount: skippedSessionsCount,
    //     totalCount: totalSessions,
    //     percentage: parseFloat(skippedPercentage.toFixed(2)),
    //   });
    // } else {
    //   setSkipWarningModal({
    //     open: false,
    //     skippedCount: 0,
    //     totalCount: 0,
    //     percentage: 0,
    //   });
    // }

    // Auto-update sessions trong formData (chỉ lấy Normal / Extended, bỏ qua Skipped)
    // Title: "Session for class {classDisplayName}"
    // Logic mới: Preserve ZoomUUID từ originalSessions khi edit mode
    const originalSessionsMap = new Map();
    if (isEditMode && originalSessions.length > 0) {
      originalSessions.forEach((origSession) => {
        const dateKey = toISODateString(origSession.Date);
        const timeslotId = normalizeTimeslotId(
          origSession.TimeslotID || origSession.timeslotId
        );
        const mapKey = `${dateKey}-${timeslotId}`;
        originalSessionsMap.set(mapKey, origSession);
      });
    }

    const sessionData = allSessions
      .filter((s) => s.type !== "SKIPPED")
      .map((session, index) => {
        const existingSession = formData.sessions[index] || {};
        const dateISO = toISODateString(session.date);
        const timeslotRef = session.timeslot || {};
        const timeslotId = normalizeTimeslotId(
          timeslotRef.TimeslotID || timeslotRef.id
        );

        // Logic mới: Tìm ZoomUUID từ originalSessions dựa trên Date và TimeslotID
        let preservedZoomUUID = null;
        if (isEditMode && originalSessionsMap.size > 0) {
          const mapKey = `${dateISO}-${timeslotId}`;
          const matchedOriginalSession = originalSessionsMap.get(mapKey);
          if (matchedOriginalSession) {
            preservedZoomUUID =
              matchedOriginalSession.ZoomUUID ||
              matchedOriginalSession.zoomUUID ||
              null;
          }
        }

        return {
          SessionID: existingSession.SessionID || null,
          Title: `Session for class ${classDisplayName}`,
          Description: existingSession.Description || "",
          Date: dateISO,
          TimeslotID: timeslotRef.TimeslotID || timeslotRef.id,
          TimeslotDay: timeslotRef.Day || timeslotRef.day || null,
          TimeslotStart: timeslotRef.StartTime || timeslotRef.startTime || null,
          TimeslotEnd: timeslotRef.EndTime || timeslotRef.endTime || null,
          ZoomUUID: preservedZoomUUID || existingSession.ZoomUUID || null, // Logic mới: Preserve ZoomUUID
          type: session.type || "NORMAL",
        };
      });
    setFormData((prev) => ({ ...prev, sessions: sessionData }));
  };

  // Hàm tính ngày kết thúc tự động
  // Dựa trên: số buổi học, timeslotsByDay (số ca mỗi ngày), ngày bắt đầu, và ngày học trong tuần
  // Logic cũ: Hỗ trợ multiple timeslots cho mỗi ngày (không dùng cho DRAFT)
  // Logic mới: Với DRAFT chỉ có một timeslot duy nhất, nhưng hàm này vẫn hỗ trợ multiple timeslots
  //   cho trường hợp edit lịch không phải DRAFT (cho phép chọn timeslot linh hoạt)
  const calculateEndDate = (
    startDate,
    numOfSessions,
    timeslotsByDay,
    daysOfWeek,
    timeslots = []
  ) => {
    if (
      !startDate ||
      !numOfSessions ||
      !timeslotsByDay ||
      Object.keys(timeslotsByDay).length === 0 ||
      daysOfWeek.length === 0
    ) {
      return "";
    }

    // Parse startDate đúng cách để tránh timezone issues
    let start;
    if (typeof startDate === "string") {
      const startParts = startDate.split("-");
      if (startParts.length === 3) {
        start = new Date(
          parseInt(startParts[0], 10),
          parseInt(startParts[1], 10) - 1,
          parseInt(startParts[2], 10)
        );
      } else {
        start = new Date(startDate);
      }
    } else {
      start = new Date(startDate);
    }
    start.setHours(0, 0, 0, 0);

    const totalSessions = parseInt(numOfSessions);

    if (totalSessions <= 0) {
      return "";
    }

    // Tính tổng số ca mỗi tuần từ timeslotsByDay
    // Logic cũ: Hỗ trợ multiple timeslots cho mỗi ngày (không dùng cho DRAFT)
    // Logic mới: Với DRAFT chỉ có một timeslot duy nhất, nhưng logic này vẫn hỗ trợ multiple timeslots
    //   cho trường hợp edit lịch không phải DRAFT (cho phép chọn timeslot linh hoạt)
    let sessionsPerWeek = 0;
    daysOfWeek.forEach((dayOfWeek) => {
      const dayTimeslots = timeslotsByDay[dayOfWeek] || [];
      sessionsPerWeek += dayTimeslots.length;
    });

    if (sessionsPerWeek === 0) {
      return "";
    }

    // Tính số tuần cần thiết (làm tròn lên)
    const weeksNeeded = Math.ceil(totalSessions / sessionsPerWeek);

    // Tìm ngày học cuối cùng bằng cách duyệt qua từng ngày
    let sessionsCreated = 0;
    let currentDate = new Date(start);
    let lastSessionDate = null; // Khởi tạo null để check xem có tạo được session nào không
    const maxDate = new Date(start);
    maxDate.setDate(maxDate.getDate() + weeksNeeded * 7 + 7); // Thêm buffer 1 tuần

    // Duyệt qua từng ngày từ ngày bắt đầu
    while (sessionsCreated < totalSessions && currentDate <= maxDate) {
      // Convert getDay() (0-6, 0=CN) sang format của daysOfWeek
      // getDay() trả về: 0=CN, 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7
      // daysOfWeek có thể là: 0=CN, 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7 (format 0-6)
      // HOẶC: 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7 (format 1-6, bỏ CN)
      const dayOfWeekJS = currentDate.getDay(); // 0-6, 0=CN, 1=T2, ..., 6=T7

      // Kiểm tra xem daysOfWeek dùng format nào
      const hasSunday = daysOfWeek.includes(0);
      let dayOfWeek = dayOfWeekJS;

      // Nếu daysOfWeek không chứa 0 (CN) và currentDate là CN, thì skip
      if (!hasSunday && dayOfWeekJS === 0) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Nếu daysOfWeek dùng format 1-6 (không có CN), convert: 1-6 giữ nguyên, 0 -> skip
      // Nếu daysOfWeek dùng format 0-6 (có CN), giữ nguyên
      // Hiện tại daysOfWeek dùng format 0-6 (0=CN, 1=T2, ..., 6=T7), nên giữ nguyên

      // Nếu là ngày học trong tuần
      if (daysOfWeek.includes(dayOfWeek)) {
        const dayTimeslotIDs = timeslotsByDay[dayOfWeek] || [];

        // Mỗi ca học trong ngày này = 1 session
        if (dayTimeslotIDs.length > 0) {
          // Validate Date khớp với Day của Timeslots trước khi tính
          // Format date string đúng cách (YYYY-MM-DD) để tránh timezone issues
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, "0");
          const day = String(currentDate.getDate()).padStart(2, "0");
          const currentDateStr = `${year}-${month}-${day}`;
          const currentDateDay = getDayFromDate(currentDateStr);

          // Đếm số timeslots hợp lệ (tìm timeslot cho ngày đó có cùng StartTime-EndTime)
          let validTimeslotsCount = 0;
          dayTimeslotIDs.forEach((timeslotID) => {
            // Tìm timeslot gốc để lấy StartTime-EndTime
            const originalTimeslot = timeslots.find(
              (t) => (t.TimeslotID || t.id) === timeslotID
            );
            if (!originalTimeslot) return;

            const selectedStartTime = normalizeTimeString(
              originalTimeslot.StartTime || originalTimeslot.startTime || ""
            );
            const selectedEndTime = normalizeTimeString(
              originalTimeslot.EndTime || originalTimeslot.endTime || ""
            );

            // Tìm timeslot cho ngày này có cùng StartTime-EndTime
            // Ưu tiên tìm timeslot có Day khớp với ngày đó
            let dayTimeslot = timeslots.find((t) => {
              const startTime = normalizeTimeString(
                t.StartTime || t.startTime || ""
              );
              const endTime = normalizeTimeString(t.EndTime || t.endTime || "");
              const timeslotDay = t.Day || t.day;
              return (
                startTime === selectedStartTime &&
                endTime === selectedEndTime &&
                timeslotDay === currentDateDay
              );
            });

            // Nếu không tìm thấy timeslot có Day khớp, tìm timeslot không có Day
            if (!dayTimeslot) {
              dayTimeslot = timeslots.find((t) => {
                const startTime = normalizeTimeString(
                  t.StartTime || t.startTime || ""
                );
                const endTime = normalizeTimeString(
                  t.EndTime || t.endTime || ""
                );
                const timeslotDay = t.Day || t.day;
                return (
                  startTime === selectedStartTime &&
                  endTime === selectedEndTime &&
                  !timeslotDay
                );
              });
            }

            // Nếu tìm thấy timeslot hợp lệ cho ngày này, đếm vào
            if (dayTimeslot) {
              validTimeslotsCount++;
            }
          });

          // Tính số ca sẽ tạo trong ngày này (chỉ tính các timeslots hợp lệ)
          const sessionsToAdd = validTimeslotsCount;

          // Nếu thêm các ca này sẽ vượt quá tổng số buổi, chỉ lấy số ca cần thiết
          if (sessionsToAdd > 0) {
            if (sessionsCreated + sessionsToAdd <= totalSessions) {
              // Có thể thêm tất cả các ca trong ngày này
              lastSessionDate = new Date(currentDate);
              sessionsCreated += sessionsToAdd;
            } else {
              // Chỉ có thể thêm một phần các ca trong ngày này
              // Vẫn cập nhật lastSessionDate vì đây là ngày có buổi cuối cùng
              lastSessionDate = new Date(currentDate);
              sessionsCreated = totalSessions; // Đặt bằng totalSessions để dừng
              break;
            }
          }
        }
      }

      // Chuyển sang ngày tiếp theo
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Nếu không tạo được session nào, trả về rỗng hoặc tính toán dựa trên weeksNeeded
    if (lastSessionDate === null) {
      // Fallback: tính toán dựa trên weeksNeeded
      const fallbackEndDate = new Date(start);
      fallbackEndDate.setDate(fallbackEndDate.getDate() + weeksNeeded * 7);
      return fallbackEndDate.toISOString().split("T")[0];
    }

    // Thêm 1 ngày vào ngày của buổi cuối cùng để có ngày kết thúc
    const endDate = new Date(lastSessionDate);
    endDate.setDate(endDate.getDate() + 1);

    return endDate.toISOString().split("T")[0];
  };

  // Logic cũ: Lọc timeslots theo Day cho từng ngày trong tuần (không dùng cho logic mới)
  // Logic mới: Chọn timeslot trước → không cần lọc timeslots theo ngày nữa
  // Vẫn giữ lại vì được dùng trong grid (logic cũ) cho edit mode không phải DRAFT
  const timeslotsByDayOfWeek = useMemo(() => {
    if (!timeslots || timeslots.length === 0) return {};

    const result = {};

    // Lọc theo Day nếu đã chọn ngày học trong tuần
    if (
      formData.scheduleDetail.DaysOfWeek &&
      formData.scheduleDetail.DaysOfWeek.length > 0
    ) {
      formData.scheduleDetail.DaysOfWeek.forEach((dayOfWeek) => {
        const dayFormat = dayOfWeekToDay(dayOfWeek);
        let dayTimeslots = timeslots.filter((timeslot) => {
          const timeslotDay = timeslot.Day || timeslot.day;
          return timeslotDay === dayFormat;
        });

        // Lọc theo search term nếu có - Không dùng cho logic mới
        // if (timeslotSearchTerm) {
        //   const searchLower = timeslotSearchTerm.toLowerCase();
        //   dayTimeslots = dayTimeslots.filter((timeslot) => {
        //     const startTime = (
        //       timeslot.StartTime ||
        //       timeslot.startTime ||
        //       ""
        //     ).toLowerCase();
        //     const endTime = (
        //       timeslot.EndTime ||
        //       timeslot.endTime ||
        //       ""
        //     ).toLowerCase();
        //     const day = (timeslot.Day || timeslot.day || "").toLowerCase();
        //     const description = (
        //       timeslot.Description ||
        //       timeslot.description ||
        //       ""
        //     ).toLowerCase();
        //     return (
        //       startTime.includes(searchLower) ||
        //       endTime.includes(searchLower) ||
        //       day.includes(searchLower) ||
        //       description.includes(searchLower)
        //     );
        //   });
        // }

        result[dayOfWeek] = dayTimeslots;
      });
    }

    return result;
  }, [timeslots, formData.scheduleDetail.DaysOfWeek]); // Bỏ timeslotSearchTerm - không dùng cho logic mới

  // Logic cũ: Tính toán các time range rows (không dùng cho logic mới)
  // Logic mới: Chọn timeslot trước → không cần tính time range rows nữa
  // Vẫn giữ lại vì được dùng trong grid (logic cũ) cho edit mode không phải DRAFT
  const timeRangeRows = useMemo(() => {
    if (
      !formData.scheduleDetail.DaysOfWeek ||
      formData.scheduleDetail.DaysOfWeek.length === 0
    ) {
      return [];
    }

    const rangeMap = new Map();

    formData.scheduleDetail.DaysOfWeek.forEach((dayOfWeek) => {
      const dayTimeslots = timeslotsByDayOfWeek[dayOfWeek] || [];
      dayTimeslots.forEach((slot) => {
        const start = normalizeTimeString(
          slot.StartTime || slot.startTime || ""
        );
        const end = normalizeTimeString(slot.EndTime || slot.endTime || "");
        if (!start || !end) return;
        const key = `${start}-${end}`;
        if (!rangeMap.has(key)) {
          rangeMap.set(key, {
            key,
            start,
            end,
            label: formatTimeRange(start, end),
          });
        }
      });
    });

    return Array.from(rangeMap.values()).sort((a, b) =>
      a.start.localeCompare(b.start)
    );
  }, [formData.scheduleDetail.DaysOfWeek, timeslotsByDayOfWeek]);

  // Logic cũ: Tính toán summary các timeslot đã chọn (không dùng cho logic mới)
  // Logic mới: Chọn timeslot trước → không cần summary nữa
  // Vẫn giữ lại vì được dùng trong grid (logic cũ) cho edit mode không phải DRAFT
  // const selectedTimeslotSummary = useMemo(() => {
  //   const summary = [];
  //   (formData.scheduleDetail.DaysOfWeek || []).forEach((dayOfWeek) => {
  //     const dayLabel =
  //       daysOfWeekOptions.find((day) => day.value === dayOfWeek)?.label || "";
  //     const dayTimeslots = timeslotsByDayOfWeek[dayOfWeek] || [];
  //     const selectedIds =
  //       formData.scheduleDetail.TimeslotsByDay?.[dayOfWeek] || [];

  //     selectedIds.forEach((timeslotId) => {
  //       const match = dayTimeslots.find(
  //         (slot) =>
  //           (slot.TimeslotID || slot.id || slot.timeslotId) === timeslotId
  //       );
  //       if (match) {
  //         const start = match.StartTime || match.startTime || "";
  //         const end = match.EndTime || match.endTime || "";
  //         summary.push(`${dayLabel} (${formatTimeRange(start, end)})`);
  //       }
  //     });
  //   });

  //   return {
  //     count: summary.length,
  //     labels: summary,
  //   };
  // }, [
  //   formData.scheduleDetail.DaysOfWeek,
  //   formData.scheduleDetail.TimeslotsByDay,
  //   timeslotsByDayOfWeek,
  //   daysOfWeekOptions,
  // ]); // Không dùng

  // Initialize scheduleDetail from schedule when entering step 3
  useEffect(() => {
    if (
      currentStep === 3 &&
      !formData.scheduleDetail.OpendatePlan &&
      formData.schedule.OpendatePlan
    ) {
      setFormData((prev) => ({
        ...prev,
        scheduleDetail: {
          ...prev.scheduleDetail,
          OpendatePlan: prev.schedule.OpendatePlan,
        },
      }));
    }
  }, [currentStep, formData.schedule.OpendatePlan]);

  // Tự động tính ngày kết thúc khi thay đổi số buổi, timeslotsByDay, ngày bắt đầu, hoặc ngày học trong tuần
  useEffect(() => {
    if (
      currentStep === 3 &&
      !alternativeStartDateSearch.showResults && // Không tính toán khi ở chế độ tìm kiếm
      formData.scheduleDetail.OpendatePlan &&
      formData.schedule.Numofsession &&
      formData.scheduleDetail.TimeslotsByDay &&
      Object.keys(formData.scheduleDetail.TimeslotsByDay).length > 0 &&
      formData.scheduleDetail.DaysOfWeek.length > 0
    ) {
      const calculatedEndDate = calculateEndDate(
        formData.scheduleDetail.OpendatePlan,
        formData.schedule.Numofsession,
        formData.scheduleDetail.TimeslotsByDay,
        formData.scheduleDetail.DaysOfWeek,
        timeslots
      );

      if (
        calculatedEndDate &&
        calculatedEndDate !== formData.scheduleDetail.EnddatePlan
      ) {
        setFormData((prev) => ({
          ...prev,
          scheduleDetail: {
            ...prev.scheduleDetail,
            EnddatePlan: calculatedEndDate,
          },
        }));
      }
    }
  }, [
    currentStep,
    formData.scheduleDetail.OpendatePlan,
    formData.schedule.Numofsession,
    formData.scheduleDetail.TimeslotsByDay,
    formData.scheduleDetail.DaysOfWeek,
  ]);

  // Gọi analyzeBlockedDays khi có đủ thông tin - GỌI NGAY KHI CHỌN NGÀY HỌC TRONG TUẦN
  // Thêm debounce + loading/error tối thiểu
  // KHÔNG gọi khi đang ở chế độ tìm kiếm ca mong muốn
  useEffect(() => {
    const analyzeBlocked = async () => {
      // Không gọi khi đang ở chế độ tìm kiếm
      if (alternativeStartDateSearch.showResults) {
        return;
      }

      if (
        currentStep === 3 &&
        hasScheduleCoreInfo &&
        hasSelectedDays && // ✅ Chỉ cần chọn ngày, không cần chọn ca để disable
        timeslots.length > 0
      ) {
        setBlockedDaysError(null);
        setLoadingBlockedDays(true);

        // Tính endDate - nếu chưa có thì ước tính dựa trên số buổi học
        let endDate = formData.scheduleDetail.EnddatePlan;
        if (!endDate && formData.schedule.Numofsession) {
          const estimatedWeeks = Math.max(formData.schedule.Numofsession, 12); // Tối thiểu 12 tuần
          endDate = dayjs(scheduleStartDate)
            .add(estimatedWeeks, "week")
            .format("YYYY-MM-DD");
        }

        if (!endDate) {
          setBlockedDays({});
          setLoadingBlockedDays(false);
          return;
        }

        try {
          const startDate = scheduleStartDate;

          // Xây TimeslotsByDay từ TẤT CẢ timeslots có sẵn (không chỉ ca đã chọn)
          const timeslotsByDayForAPI = {};
          let hasTimeslot = false;
          (formData.scheduleDetail.DaysOfWeek || []).forEach((dayOfWeek) => {
            const dayTimeslots = timeslotsByDayOfWeek[dayOfWeek] || [];
            const ids = dayTimeslots.map(
              (ts) => ts.TimeslotID || ts.id || ts.timeslotId
            );
            timeslotsByDayForAPI[dayOfWeek] = ids;
            if (Array.isArray(ids) && ids.length > 0) {
              hasTimeslot = true;
            }
          });

          if (!hasTimeslot) {
            setBlockedDays({});
            setLoadingBlockedDays(false);
            return;
          }

          console.log("🔍 analyzeBlockedDays called with:", {
            hasScheduleCoreInfo,
            hasSelectedDays,
            timeslotsByDayForAPI,
            InstructorID: formData.InstructorID,
            DaysOfWeek: formData.scheduleDetail.DaysOfWeek,
            startDate,
          });

          const result = await classService.analyzeBlockedDays({
            InstructorID: formData.InstructorID,
            OpendatePlan: startDate,
            Numofsession: formData.schedule.Numofsession || 12,
            DaysOfWeek: formData.scheduleDetail.DaysOfWeek,
            TimeslotsByDay: timeslotsByDayForAPI,
          });

          console.log("📊 analyzeBlockedDays result:", result);

          if (result && result.blockedDays) {
            console.log("✅ Setting blockedDays:", result.blockedDays);
            setBlockedDays(result.blockedDays);
          } else {
            console.log("❌ No blockedDays in result, setting empty");
            setBlockedDays({});
          }
        } catch (error) {
          console.error("Error analyzing blocked days:", error);
          setBlockedDays({});
          setBlockedDaysError("Không thể phân tích lịch bận của giảng viên.");
        } finally {
          setLoadingBlockedDays(false);
        }
      } else {
        setBlockedDays({});
        setBlockedDaysError(null);
        setLoadingBlockedDays(false);
      }
    };

    // Debounce: nếu user chọn/bỏ chọn ngày liên tục, chỉ gọi API sau 400ms im lặng
    if (analyzeBlockedTimeoutRef.current) {
      clearTimeout(analyzeBlockedTimeoutRef.current);
    }
    analyzeBlockedTimeoutRef.current = setTimeout(() => {
      analyzeBlocked();
    }, 400);

    return () => {
      if (analyzeBlockedTimeoutRef.current) {
        clearTimeout(analyzeBlockedTimeoutRef.current);
      }
    };
  }, [
    currentStep,
    hasScheduleCoreInfo,
    hasSelectedDays,
    scheduleStartDate,
    formData.scheduleDetail.EnddatePlan,
    formData.schedule.Numofsession,
    formData.scheduleDetail.DaysOfWeek,
    timeslots,
    timeslotsByDayOfWeek,
  ]);

  // Load lịch bận và lịch trùng của instructor - GỌI NGAY KHI CHỌN NGÀY HỌC TRONG TUẦN
  // KHÔNG gọi khi đang ở chế độ tìm kiếm ca mong muốn
  useEffect(() => {
    const loadInstructorSchedule = async () => {
      // Không gọi khi đang ở chế độ tìm kiếm
      if (alternativeStartDateSearch.showResults) {
        return;
      }

      if (!hasScheduleCoreInfo || currentStep !== 3 || !hasSelectedDays) {
        setInstructorBusySchedule([]);
        setParttimeAvailableSlotKeys([]);
        setParttimeAvailableEntriesCount(null);
        return;
      }

      try {
        // Gọi API để lấy lịch của giảng viên (bao gồm lịch bận và lịch đã có)
        const startDate = scheduleStartDate;

        if (!startDate) {
          setInstructorBusySchedule([]);
          return;
        }

        // Tính endDate - nếu chưa có thì ước tính dựa trên số buổi học
        let endDate = formData.scheduleDetail.EnddatePlan;
        if (!endDate && formData.schedule.Numofsession) {
          // Ước tính: giả sử mỗi tuần có ít nhất 1 ca học
          const estimatedWeeks = Math.max(formData.schedule.Numofsession, 12); // Tối thiểu 12 tuần
          endDate = dayjs(startDate)
            .add(estimatedWeeks, "week")
            .format("YYYY-MM-DD");
        }

        if (!endDate) {
          setInstructorBusySchedule([]);
          return;
        }

        const response = await instructorService.getInstructorSchedule(
          formData.InstructorID,
          startDate,
          endDate
        );

        // Backend trả về { schedule, instructorType, instructor }
        const schedule = response?.schedule || response || [];
        const type =
          response?.instructorType || response?.instructor?.type || null;
        const fetchedInstructorName =
          response?.instructor?.FullName ||
          response?.instructor?.fullName ||
          instructorNameForError ||
          selectedInstructor?.FullName ||
          selectedInstructor?.fullName ||
          "Giảng viên";
        setInstructorNameForError(fetchedInstructorName);

        // Lưu Type để dùng sau
        if (type) {
          setInstructorType(type);
        }

        // Logic mới: Filter busySchedule theo Type
        // Fulltime: Chỉ lấy session (đã book) và HOLIDAY
        // Parttime: Lấy session, HOLIDAY, CLOSE (đã book), và các ca KHÔNG có AVAILABLE
        const busySchedule = (schedule || []).filter((item) => {
          const status = (item.Status || "").toUpperCase();
          const sourceType = (item.SourceType || "").toUpperCase();
          const hasSession = !!item.SessionID || sourceType === "SESSION";

          if (type === "fulltime") {
            // Fulltime: Chỉ busy nếu có session hoặc HOLIDAY
            return hasSession || status === "HOLIDAY";
          } else {
            // Parttime: Busy nếu có session, HOLIDAY, OTHER, hoặc không có AVAILABLE
            if (hasSession) return true;
            if (status === "HOLIDAY") return true;
            if (sourceType === "INSTRUCTORTIMESLOT" && status === "AVAILABLE") {
              return false;
            }
            if (status === "OTHER") return true;
            return false;
          }
        });

        const availableEntries = (schedule || []).filter((item) => {
          const status = (item.Status || "").toUpperCase();
          const sourceType = (item.SourceType || "").toUpperCase();
          return sourceType === "INSTRUCTORTIMESLOT" && status === "AVAILABLE";
        });
        const availableKeys = [];
        (availableEntries || []).forEach((entry) => {
          const dayCode = (entry.Day || entry.day || "").toUpperCase();
          let dayNum = dayToDayOfWeek(dayCode);
          if (
            (dayNum === null || dayNum === undefined) &&
            entry.Date &&
            dayjs(entry.Date).isValid()
          ) {
            dayNum = dayjs(entry.Date).day();
          }
          const timeslotKey = normalizeTimeslotId(
            entry.TimeslotID || entry.timeslotId
          );
          if (dayNum !== null && dayNum !== undefined && timeslotKey) {
            availableKeys.push(`${dayNum}-${timeslotKey}`);
          }
        });

        // Loại bỏ các session bận thuộc chính class đang chỉnh sửa để không tự khóa ca của lớp đó
        const filteredBusySchedule = (busySchedule || []).filter((item) => {
          const busyClassId =
            item.ClassID || item.classId || item.ClassId || item.class_id;
          if (!busyClassId) return true;
          if (!classId) return true;
          return String(busyClassId) !== String(classId);
        });

        setInstructorBusySchedule(filteredBusySchedule);
        setParttimeAvailableSlotKeys(availableKeys);
        setParttimeAvailableEntriesCount(availableEntries.length);
        // Force re-render grid khi instructorBusySchedule thay đổi - Không dùng cho logic mới
        // setGridRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error("Error loading instructor schedule:", error);
        // Không throw error để không làm gián đoạn flow
        setInstructorBusySchedule([]);
        setParttimeAvailableSlotKeys([]);
        setParttimeAvailableEntriesCount(null);
        // setGridRefreshKey((prev) => prev + 1);
      }
    };

    loadInstructorSchedule();
  }, [
    currentStep,
    hasScheduleCoreInfo,
    hasSelectedDays,
    scheduleStartDate,
    formData.scheduleDetail.EnddatePlan,
    formData.schedule.Numofsession,
    formData.scheduleDetail.DaysOfWeek, // QUAN TRỌNG: Gọi ngay khi chọn DaysOfWeek
  ]);

  // Hàm riêng: Tìm ngày bắt đầu hợp lệ gần nhất (Logic mới: tất cả ca đều AVAILABLE, không trùng)
  const findValidStartDate = async (
    instructorId,
    daysOfWeek,
    timeslotsByDay,
    sessionsPerWeek,
    numOfSessions,
    requiredSlotsPerWeek,
    currentStartDate
  ) => {
    if (
      !instructorId ||
      !daysOfWeek ||
      daysOfWeek.length === 0 ||
      sessionsPerWeek === 0
    ) {
      return null;
    }

    try {
      // Bắt đầu từ ngày hiện tại hoặc currentStartDate
      let checkDate = dayjs(currentStartDate || dayjs().add(1, "day"));
      // Tìm trong vòng 2 năm (104 tuần) để có thể tìm sang năm sau
      const maxWeeksToCheck = 104;
      let weeksChecked = 0;

      // Tính tổng số timeslots đã chọn
      let totalSelectedSlots = 0;
      daysOfWeek.forEach((dow) => {
        const timeslotsForDay = timeslotsByDay[dow] || [];
        totalSelectedSlots += timeslotsForDay.length;
      });
      const requiredSlots = requiredSlotsPerWeek || sessionsPerWeek;
      const minRequiredSlots = Math.max(requiredSlots, totalSelectedSlots || 1);

      // Tìm ngày đầu tiên phù hợp
      while (weeksChecked < maxWeeksToCheck) {
        // Tìm ngày đầu tiên trong tuần này phù hợp với daysOfWeek
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          const candidateDate = checkDate.add(dayOffset, "day");
          const dateString = candidateDate.format("YYYY-MM-DD");
          const dayOfWeekNum = getDayOfWeek(dateString);

          // Kiểm tra xem ngày này có trong daysOfWeek không
          const dayOfWeekMatch = daysOfWeek.find((dow) => {
            if (typeof dow === "number") {
              return dow === dayOfWeekNum;
            }
            return dow === dayOfWeekToDay(dayOfWeekNum);
          });

          if (dayOfWeekMatch) {
            // Kiểm tra số slot khả dụng cho ngày này
            const { availableSlots, totalSlots } =
              await checkAvailableSlotsForDate(
                instructorId,
                dateString,
                daysOfWeek,
                timeslotsByDay,
                numOfSessions,
                sessionsPerWeek
              );

            // Logic mới: Chỉ suggest khi TẤT CẢ timeslots đều AVAILABLE
            // 1. Tất cả timeslots đều AVAILABLE (availableSlots === totalSlots)
            // 2. availableSlots >= minRequiredSlots (số timeslots đã chọn)
            if (
              availableSlots === totalSlots &&
              totalSlots >= minRequiredSlots &&
              totalSlots > 0
            ) {
              return {
                date: dateString,
                availableSlots,
                totalSlots,
                reason: `Đủ ${availableSlots} ca/tuần (tất cả ca đều hợp lệ)`,
              };
            }
          }
        }

        // Chuyển sang tuần tiếp theo
        checkDate = checkDate.add(7, "day");
        weeksChecked++;
      }

      return null; // Không tìm thấy ngày hợp lệ
    } catch (error) {
      console.error("Error finding valid start date:", error);
      return null;
    }
  };

  // Hàm kiểm tra số slot khả dụng cho một ngày bắt đầu cụ thể
  const checkAvailableSlotsForDate = async (
    instructorId,
    startDate,
    daysOfWeek,
    timeslotsByDay,
    numOfSessions,
    sessionsPerWeek
  ) => {
    try {
      // Lấy tất cả timeslot IDs đã chọn
      const allTimeslotIds = [];
      daysOfWeek.forEach((dayOfWeek) => {
        const timeslotsForDay = timeslotsByDay[dayOfWeek] || [];
        allTimeslotIds.push(...timeslotsForDay);
      });

      if (allTimeslotIds.length === 0) {
        return { availableSlots: 0, totalSlots: 0 };
      }

      // Tính endDate dựa trên số buổi và số ca/tuần
      const totalWeeks = Math.ceil(numOfSessions / sessionsPerWeek);
      const endDate = dayjs(startDate).add(totalWeeks * 7, "day");

      // Gọi API để kiểm tra blocked days cho khoảng thời gian này
      const blockedDaysResponse = await classService.analyzeBlockedDays({
        InstructorID: instructorId,
        OpendatePlan: dayjs(startDate).format("YYYY-MM-DD"),
        Numofsession: numOfSessions,
        DaysOfWeek: daysOfWeek,
        TimeslotsByDay: timeslotsByDay,
      });
      const blockedDaysResult =
        blockedDaysResponse?.blockedDays || blockedDaysResponse || {};

      // Lấy lịch bận của instructor
      const response = await instructorService.getInstructorSchedule(
        instructorId,
        dayjs(startDate).format("YYYY-MM-DD"),
        endDate.format("YYYY-MM-DD")
      );

      // Backend trả về { schedule, instructorType, instructor }
      const schedule = response?.schedule || response || [];
      const type =
        response?.instructorType || response?.instructor?.type || null;

      // Logic mới: Filter busySchedule theo Type
      const busySchedule = (schedule || []).filter((item) => {
        const status = (item.Status || "").toUpperCase();
        const sourceType = (item.SourceType || "").toUpperCase();
        const hasSession = !!item.SessionID || sourceType === "SESSION";

        if (type === "fulltime") {
          // Fulltime: Chỉ busy nếu có session hoặc HOLIDAY
          return hasSession || status === "HOLIDAY";
        } else {
          // Parttime: Busy nếu có session, HOLIDAY, OTHER
          if (hasSession) return true;
          if (status === "HOLIDAY") return true;

          // AVAILABLE trong instructortimeslot → không busy
          if (sourceType === "INSTRUCTORTIMESLOT" && status === "AVAILABLE") {
            return false;
          }
          // Backward compatibility: OTHER cũng là busy
          if (status === "OTHER") return true;
          return false;
        }
      });

      const availableEntriesForSearch = (schedule || []).filter((item) => {
        const status = (item.Status || "").toUpperCase();
        const sourceType = (item.SourceType || "").toUpperCase();
        return sourceType === "INSTRUCTORTIMESLOT" && status === "AVAILABLE";
      });
      const availableKeySetForSearch = new Set(
        availableEntriesForSearch
          .map((entry) => {
            const dayCode = (entry.Day || entry.day || "").toUpperCase();
            let dayNum = dayToDayOfWeek(dayCode);
            if (
              (dayNum === null || dayNum === undefined) &&
              entry.Date &&
              dayjs(entry.Date).isValid()
            ) {
              dayNum = dayjs(entry.Date).day();
            }
            const timeslotKey = normalizeTimeslotId(
              entry.TimeslotID || entry.timeslotId
            );
            if (dayNum === null || dayNum === undefined || !timeslotKey) {
              return null;
            }
            return `${dayNum}-${timeslotKey}`;
          })
          .filter(Boolean)
      );

      // Kiểm tra xem có đủ timeslot không bị block không
      // Logic mới: Chỉ cần AVAILABLE (không check busyCount)
      let availableSlots = 0;
      let totalSlots = 0;

      // Tạo formData tạm để check
      const tempFormData = {
        schedule: { Numofsession: numOfSessions },
        scheduleDetail: { TimeslotsByDay: timeslotsByDay },
      };

      daysOfWeek.forEach((dow) => {
        const timeslotsForDay = timeslotsByDay[dow] || [];
        timeslotsForDay.forEach((timeslotId) => {
          totalSlots++;

          // Sử dụng determineSlotStatus để check chính xác
          const status = determineSlotStatus({
            dayOfWeek: dow,
            timeslotId,
            startDate: dayjs(startDate).format("YYYY-MM-DD"),
            endDate: endDate.format("YYYY-MM-DD"),
            blockedDays: blockedDaysResult,
            instructorBusySchedule: busySchedule,
            formData: tempFormData,
            sessionsPerWeek,
            requiredSlotsPerWeek: sessionsPerWeek,
            instructorType: type,
            parttimeAvailableSlotKeySet: availableKeySetForSearch,
            lockedTimeslotId: null, // Search mode không áp dụng locked timeslot
            isDraftClass: false, // Search mode không áp dụng locked timeslot
          });

          // Logic mới: Chỉ tính là available nếu status === "AVAILABLE"
          if (status.status === "AVAILABLE") {
            availableSlots++;
          }
        });
      });

      return { availableSlots, totalSlots };
    } catch (error) {
      console.error("Error checking available slots:", error);
      return { availableSlots: 0, totalSlots: 0 };
    }
  };

  // Hàm tìm nhiều ngày bắt đầu gợi ý (sliding window)
  const findSuggestedStartDates = async (
    instructorId,
    daysOfWeek,
    timeslotsByDay,
    sessionsPerWeek,
    numOfSessions,
    requiredSlotsPerWeek,
    currentStartDate
  ) => {
    if (
      !instructorId ||
      !daysOfWeek ||
      daysOfWeek.length === 0 ||
      sessionsPerWeek === 0
    ) {
      return [];
    }

    try {
      const suggestions = [];
      // Bắt đầu từ tuần sau ngày hiện tại (sliding window)
      let checkDate = dayjs(currentStartDate || dayjs().add(1, "day"));
      // Tìm trong vòng 2 năm (104 tuần) để có thể tìm sang năm sau
      const maxWeeksToCheck = 104;
      let weeksChecked = 0;

      // Tìm ngày đầu tiên trong tuần phù hợp với daysOfWeek
      while (weeksChecked < maxWeeksToCheck) {
        // Tìm ngày đầu tiên trong tuần này phù hợp với daysOfWeek
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          const candidateDate = checkDate.add(dayOffset, "day");
          const dateString = candidateDate.format("YYYY-MM-DD");
          const dayOfWeekNum = getDayOfWeek(dateString);
          const dayOfWeekStr = dayOfWeekToDay(dayOfWeekNum);

          // Kiểm tra xem ngày này có trong daysOfWeek không
          const dayOfWeekMatch = daysOfWeek.find((dow) => {
            if (typeof dow === "number") {
              return dow === dayOfWeekNum;
            }
            return dow === dayOfWeekStr;
          });

          if (dayOfWeekMatch) {
            // Kiểm tra số slot khả dụng cho ngày này
            const { availableSlots, totalSlots } =
              await checkAvailableSlotsForDate(
                instructorId,
                dateString,
                daysOfWeek,
                timeslotsByDay,
                numOfSessions,
                sessionsPerWeek
              );

            // Logic mới: Chỉ suggest khi TẤT CẢ timeslots đều AVAILABLE
            const requiredSlots = requiredSlotsPerWeek || sessionsPerWeek;
            // Tính tổng số timeslots đã chọn
            let totalSelectedSlots = 0;
            daysOfWeek.forEach((dow) => {
              const timeslotsForDay = timeslotsByDay[dow] || [];
              totalSelectedSlots += timeslotsForDay.length;
            });
            // minRequiredSlots = số timeslots đã chọn (không ép tối thiểu 3, vì có thể chỉ chọn 1-2 ca)
            const minRequiredSlots = Math.max(
              requiredSlots,
              totalSelectedSlots || 1
            );
            // Chỉ suggest khi TẤT CẢ timeslots đều AVAILABLE
            if (
              availableSlots === totalSlots &&
              totalSlots >= minRequiredSlots &&
              totalSlots > 0
            ) {
              suggestions.push({
                date: dateString,
                availableSlots,
                totalSlots,
                reason: `Đủ ${availableSlots} ca/tuần (tất cả ca đều hợp lệ)`,
              });

              // Chỉ lấy tối đa 3 gợi ý
              if (suggestions.length >= 3) {
                return suggestions;
              }
            }
          }
        }

        // Chuyển sang tuần tiếp theo
        checkDate = checkDate.add(7, "day");
        weeksChecked++;
      }

      return suggestions;
    } catch (error) {
      console.error("Error finding suggested start dates:", error);
      return [];
    }
  };

  // const findBetterStartDate = async ({
  //   instructorId,
  //   daysOfWeek,
  //   timeslotsByDay,
  //   sessionsPerWeek,
  //   numOfSessions,
  //   requiredSlotsPerWeek,
  //   currentStartDate,
  // }) => {
  //   // Logic mới: Tìm ngày gần nhất hợp lệ (tất cả ca đều AVAILABLE, không trùng)
  //   const result = await findValidStartDate(
  //     instructorId,
  //     daysOfWeek,
  //     timeslotsByDay,
  //     sessionsPerWeek,
  //     numOfSessions,
  //     requiredSlotsPerWeek || sessionsPerWeek,
  //     currentStartDate
  //   );
  //   return result;
  // }; // Không dùng

  // Hàm tìm ngày bắt đầu gần nhất có thể (có đủ số ca không bị block) - Giữ lại để tương thích
  // const findEarliestAvailableStartDate = async (
  //   instructorId,
  //   daysOfWeek,
  //   timeslotsByDay,
  //   sessionsPerWeek,
  //   numOfSessions
  // ) => {
  //   const suggestions = await findSuggestedStartDates(
  //     instructorId,
  //     daysOfWeek,
  //     timeslotsByDay,
  //     sessionsPerWeek,
  //     numOfSessions,
  //     sessionsPerWeek,
  //     null
  //   );
  //   return suggestions.length > 0 ? suggestions[0].date : null;
  // }; // Không dùng

  // Tính toán số ca học mong muốn mỗi tuần (requiredSlotsPerWeek)
  useEffect(() => {
    if (currentStep === 3 && formData.scheduleDetail.TimeslotsByDay) {
      // Tính số ca học mong muốn từ TimeslotsByDay đã chọn
      let totalSelectedSlots = 0;
      formData.scheduleDetail.DaysOfWeek?.forEach((dayOfWeek) => {
        const timeslotsForDay =
          formData.scheduleDetail.TimeslotsByDay[dayOfWeek] || [];
        totalSelectedSlots += timeslotsForDay.length;
      });
      setRequiredSlotsPerWeek(totalSelectedSlots);
      setSessionsPerWeek(totalSelectedSlots);
    } else {
      setRequiredSlotsPerWeek(0);
      setSessionsPerWeek(0);
    }
  }, [
    currentStep,
    formData.scheduleDetail.TimeslotsByDay,
    formData.scheduleDetail.DaysOfWeek,
  ]);

  // Tìm ngày bắt đầu gợi ý khi tất cả timeslot bị khóa hoặc không đủ slot
  useEffect(() => {
    const findSuggestedDates = async () => {
      if (
        currentStep === 3 &&
        hasScheduleCoreInfo &&
        hasSelectedSlots &&
        sessionsPerWeek > 0
      ) {
        // Tìm nhiều gợi ý ngày bắt đầu
        const suggestions = await findSuggestedStartDates(
          formData.InstructorID,
          formData.scheduleDetail.DaysOfWeek,
          formData.scheduleDetail.TimeslotsByDay,
          sessionsPerWeek,
          formData.schedule.Numofsession,
          requiredSlotsPerWeek || sessionsPerWeek,
          formData.scheduleDetail.OpendatePlan || formData.schedule.OpendatePlan
        );
        // setSuggestedStartDates(suggestions); // Không dùng cho logic mới
      } else {
        // setSuggestedStartDates([]); // Không dùng cho logic mới
      }
    };

    findSuggestedDates();
  }, [
    currentStep,
    hasScheduleCoreInfo,
    hasSelectedSlots,
    sessionsPerWeek,
    formData.schedule.Numofsession,
    requiredSlotsPerWeek,
    blockedDays,
    instructorBusySchedule,
  ]);

  // Tự động kiểm tra khả dụng slot ngay khi bước 3 khởi chạy
  useEffect(() => {
    let cancelled = false;

    const autoCheckSlots = async () => {
      if (
        currentStep !== 3 ||
        !hasScheduleCoreInfo ||
        !hasSelectedSlots ||
        sessionsPerWeek === 0
      ) {
        if (!cancelled) {
          setSlotAvailabilityStatus({
            checking: false,
            insufficient: false,
            requiredSlots: requiredSlotsPerWeek || sessionsPerWeek || 0,
            availableSlots: 0,
            totalSlots: 0,
            suggestion: null,
          });
        }
        return;
      }

      const startDate = scheduleStartDate;

      setSlotAvailabilityStatus((prev) => ({
        ...prev,
        checking: true,
      }));

      try {
        const availability = await checkAvailableSlotsForDate(
          formData.InstructorID,
          startDate,
          formData.scheduleDetail.DaysOfWeek,
          formData.scheduleDetail.TimeslotsByDay,
          Number(formData.schedule.Numofsession),
          sessionsPerWeek
        );

        const required = requiredSlotsPerWeek || sessionsPerWeek || 0;
        let suggestion = null;

        if (required > 0 && availability.availableSlots < required) {
          // Sử dụng API chuyên dụng để tối ưu
          try {
            const result = await classService.searchTimeslots({
              InstructorID: formData.InstructorID,
              DaysOfWeek: formData.scheduleDetail.DaysOfWeek,
              TimeslotsByDay: formData.scheduleDetail.TimeslotsByDay,
              Numofsession: formData.schedule.Numofsession,
              sessionsPerWeek,
              requiredSlotsPerWeek: required,
              currentStartDate: startDate,
            });

            const suggestions = result?.suggestions || result || [];
            suggestion = suggestions.length > 0 ? suggestions[0] : null;
          } catch (error) {
            console.error("Error finding better start date:", error);
            // Fallback về null nếu có lỗi
            suggestion = null;
          }
        }

        if (!cancelled) {
          setSlotAvailabilityStatus({
            checking: false,
            insufficient:
              required > 0 && availability.availableSlots < required,
            requiredSlots: required,
            availableSlots: availability.availableSlots,
            totalSlots: availability.totalSlots,
            suggestion,
          });
        }
      } catch (error) {
        console.error("Error auto checking slots:", error);
        if (!cancelled) {
          setSlotAvailabilityStatus((prev) => ({
            ...prev,
            checking: false,
          }));
        }
      }
    };

    autoCheckSlots();

    return () => {
      cancelled = true;
    };
  }, [
    currentStep,
    hasScheduleCoreInfo,
    hasSelectedSlots,
    scheduleStartDate,
    formData.schedule.Numofsession,
    sessionsPerWeek,
    requiredSlotsPerWeek,
  ]);

  // Update preview when schedule detail changes - CHỈ KHI ĐÃ NHẤN NÚT TÍNH TOÁN
  useEffect(() => {
    if (currentStep !== 3 || !scheduleStartDate) {
      // Clear preview sessions nếu không ở step 3 hoặc không có startDate
      if (currentStep !== 3) {
        setPreviewSessions([]);
        setShouldShowPreview(false); // Reset khi rời step 3
      }
      return;
    }

    // Nếu không có slots hoặc days, clear preview sessions
    if (!hasSelectedSlots || !hasSelectedDays) {
      setPreviewSessions([]);
      setShouldShowPreview(false); // Reset khi không đủ điều kiện
      return;
    }

    // CHỈ TÍNH TOÁN KHI ĐÃ NHẤN NÚT TÍNH TOÁN
    if (!shouldShowPreview) {
      setPreviewSessions([]);
      return;
    }

    generatePreviewSessions(
      scheduleStartDate,
      formData.scheduleDetail.EnddatePlan,
      formData.scheduleDetail.DaysOfWeek,
      formData.scheduleDetail.TimeslotsByDay,
      formData.schedule.Numofsession
    );
  }, [
    currentStep,
    hasSelectedSlots,
    hasSelectedDays, // Thêm dependency để clear khi không có ngày
    scheduleStartDate,
    formData.scheduleDetail.EnddatePlan,
    formData.scheduleDetail.DaysOfWeek,
    formData.scheduleDetail.TimeslotsByDay,
    formData.schedule.Numofsession,
    timeslots,
    instructorBusySchedule,
    shouldShowPreview, // Thêm dependency shouldShowPreview
  ]);

  // Reset shouldShowPreview khi thay đổi ca học hoặc ngày học
  useEffect(() => {
    if (currentStep === 3) {
      setShouldShowPreview(false);
      setPreviewSessions([]);
    }
  }, [
    currentStep,
    selectedTimeslotIds,
    formData.scheduleDetail.DaysOfWeek,
    formData.scheduleDetail.TimeslotsByDay,
  ]);

  const handleDateInputChange = (group, field, displayKey, value) => {
    setDateInputs((prev) => ({
      ...prev,
      [displayKey]: value,
    }));
    const isoValue = parseDisplayDateToISO(value);
    if (isoValue !== null) {
      setFormData((prev) => ({
        ...prev,
        [group]: {
          ...prev[group],
          [field]: isoValue,
        },
      }));
    }
  };

  // Validation - Sử dụng validate từ file riêng
  const validateStep = (step) => {
    let result;

    if (step === 1) {
      result = validateStep1(formData);
    } else if (step === 2) {
      result = validateStep2(formData);
    } else if (step === 3) {
      console.log(
        "[ClassWizard] validateStep(3) - formData:",
        JSON.stringify(formData, null, 2)
      );
      console.log(
        "[ClassWizard] validateStep(3) - previewSessions:",
        previewSessions
      );
      console.log(
        "[ClassWizard] validateStep(3) - previewSessions.length:",
        previewSessions?.length || 0
      );
      console.log(
        "[ClassWizard] validateStep(3) - formData.sessions:",
        formData.sessions
      );
      console.log(
        "[ClassWizard] validateStep(3) - formData.sessions.length:",
        formData.sessions?.length || 0
      );

      result = validateStep3(formData, previewSessions);

      console.log(
        "[ClassWizard] validateStep(3) - result:",
        JSON.stringify(result, null, 2)
      );

      // Thêm validation: Phải chọn ít nhất 1 ca học
      const hasSelectedTimeslot =
        formData.scheduleDetail.TimeslotsByDay &&
        Object.keys(formData.scheduleDetail.TimeslotsByDay).some(
          (dayOfWeek) =>
            formData.scheduleDetail.TimeslotsByDay[dayOfWeek]?.length > 0
        );

      console.log(
        "[ClassWizard] validateStep(3) - hasSelectedTimeslot:",
        hasSelectedTimeslot
      );

      if (!hasSelectedTimeslot) {
        result.errors = result.errors || {};
        result.errors.TimeslotsByDay = "Vui lòng chọn ít nhất một ca học";
        result.isValid = false;
      }

      console.log(
        "[ClassWizard] validateStep(3) - final result:",
        JSON.stringify(result, null, 2)
      );
    } else {
      result = { isValid: true, errors: {} };
    }

    setErrors(result.errors || {});
    return result.isValid;
  };

  // Hàm xử lý khi nhấn nút "Sửa" ở bước 2 (chỉ hiển thị khi edit mode) - Không dùng
  // const handleEditSubmit = () => {
  //   if (!validateStep(2)) {
  //     return;
  //   }

  //   // Kiểm tra xem có lùi ngày không
  //   const newStartDate = formData.schedule.OpendatePlan;
  //   let sessionsToDelete = [];

  //   if (originalStartDate && newStartDate) {
  //     const originalDate = new Date(originalStartDate);
  //     const newDate = new Date(newStartDate);
  //     originalDate.setHours(0, 0, 0, 0);
  //     newDate.setHours(0, 0, 0, 0);

  //     // Nếu ngày mới sớm hơn ngày cũ (lùi ngày)
  //     if (newDate < originalDate) {
  //       sessionsToDelete = (formData.sessions || []).filter((s) => {
  //         if (!s.Date) return false;
  //         const sessionDate = new Date(s.Date);
  //         sessionDate.setHours(0, 0, 0, 0);
  //         return sessionDate < newDate;
  //       });
  //     }
  //   }

  //   setConfirmEditModal({
  //     open: true,
  //     sessionsToDelete: sessionsToDelete,
  //   });
  // }; // Không dùng

  const handleNext = () => {
    // Nếu đang ở bước 2 và đang xem (readonly), hiện modal chuyển hướng
    if (currentStep === 2 && readonly) {
      if (validateStep(2)) {
        setRedirectModal({ open: true, classId });
        return;
      }
    }

    // Nếu đang ở bước 3 thì kiểm tra thêm điều kiện
    if (currentStep === 3) {
      if (hasParttimeAvailabilityIssue) {
        setErrors((prev) => ({
          ...prev,
          preview: parttimeAvailabilityError,
        }));
        return;
      }
      // Kiểm tra có ít nhất 1 ca học phù hợp được chọn không
      if (!hasValidSelectedSlots) {
        setErrors((prev) => ({
          ...prev,
          preview:
            "Vui lòng chọn ít nhất một ca học phù hợp (không bị khóa do trùng lịch).",
        }));
        return;
      }

      // Logic mới: Kiểm tra có buổi trùng không
      if (hasDuplicateSessions) {
        setErrors((prev) => ({
          ...prev,
          preview:
            "Có buổi học trùng lịch (cùng ngày và cùng ca). Vui lòng chọn lại các ca học.",
        }));
        return;
      }

      // Logic mới: Kiểm tra số buổi/tuần có đủ không
      // Tính số buổi/tuần từ DaysOfWeek và TimeslotsByDay
      const sessionsPerWeekCalc = Object.values(
        formData.scheduleDetail.TimeslotsByDay || {}
      ).reduce((total, slots) => {
        if (!Array.isArray(slots)) return total;
        return total + slots.length;
      }, 0);

      const numOfSessions = parseInt(formData.schedule.Numofsession, 10) || 0;

      // Nếu chỉ tạo được 1 buổi/tuần và cần nhiều hơn 1 buổi → không đủ
      if (sessionsPerWeekCalc <= 1 && numOfSessions > 1) {
        const instructorName =
          selectedInstructor?.FullName ||
          selectedInstructor?.fullName ||
          "Giảng viên";
        setErrors((prev) => ({
          ...prev,
          preview: `Giảng viên ${instructorName} không đủ lịch trống để dạy cho ${numOfSessions} buổi. Vui lòng chọn thêm các ngày học trong tuần hoặc chọn giảng viên khác.`,
        }));
        return;
      }

      // Kiểm tra tổng số buổi có thể tạo được với số buổi/tuần hiện tại
      if (sessionsPerWeekCalc > 0 && numOfSessions > 0) {
        // Tính số tuần cần thiết để tạo đủ số buổi
        const totalWeeksNeeded = Math.ceil(numOfSessions / sessionsPerWeekCalc);
        // Tính số buổi tối đa có thể tạo được
        const maxSessionsPossible = sessionsPerWeekCalc * totalWeeksNeeded;

        // Nếu không đủ số buổi → báo lỗi
        if (maxSessionsPossible < numOfSessions) {
          const instructorName =
            selectedInstructor?.FullName ||
            selectedInstructor?.fullName ||
            "Giảng viên";
          setErrors((prev) => ({
            ...prev,
            preview: `Giảng viên ${instructorName} không đủ lịch trống để dạy cho ${numOfSessions} buổi. Vui lòng chọn thêm các ngày học trong tuần hoặc chọn giảng viên khác.`,
          }));
          return;
        }
      }
    }

    // Nếu đang ở bước 3 và readonly hoặc có classId, không cho chuyển sang bước 4
    if (currentStep === 3 && readonly) {
      setRedirectModal({ open: true, classId });
      return;
    }

    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    console.log("[ClassWizard] ========== handleSubmit START ==========");
    console.log("[ClassWizard] Current step:", currentStep);
    console.log("[ClassWizard] formData:", JSON.stringify(formData, null, 2));

    // Bắt buộc phải hoàn thành cả 3 bước khi lưu nháp
    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);
    const step3Valid = validateStep(3);

    console.log("[ClassWizard] Validation results:", {
      step1Valid,
      step2Valid,
      step3Valid,
    });

    if (!step1Valid || !step2Valid || !step3Valid) {
      console.warn("[ClassWizard] Validation failed, returning early");
      // Nếu chưa hoàn thành bước 3, chuyển đến bước 3 để người dùng hoàn thành
      if (!step3Valid && currentStep < 3) {
        setCurrentStep(3);
      }
      return;
    }

    // Logic mới: Không cho submit nếu có buổi trùng
    if (hasDuplicateSessions) {
      console.warn("[ClassWizard] Has duplicate sessions, returning early");
      setErrors((prev) => ({
        ...prev,
        preview:
          "Có buổi học trùng lịch (cùng ngày và cùng ca). Vui lòng chọn lại các ca học.",
      }));
      setCurrentStep(3);
      return;
    }

    if (hasParttimeAvailabilityIssue) {
      console.warn(
        "[ClassWizard] Has parttime availability issue, returning early"
      );
      setErrors((prev) => ({
        ...prev,
        preview: parttimeAvailabilityError,
      }));
      setCurrentStep(3);
      return;
    }

    // Đảm bảo có sessions trước khi submit
    if (!formData.sessions || formData.sessions.length === 0) {
      console.warn("[ClassWizard] No sessions found, returning early");
      console.warn("[ClassWizard] formData.sessions:", formData.sessions);
      setErrors({
        preview: "Vui lòng hoàn thành bước 3 để tạo lịch học chi tiết",
      });
      setCurrentStep(3);
      return;
    }

    console.log(
      "[ClassWizard] All validations passed, proceeding to build submitData"
    );

    // Kiểm tra InstructorID
    if (!formData.InstructorID) {
      setErrors({
        InstructorID: "Vui lòng chọn giảng viên",
      });
      setCurrentStep(1);
      return;
    }

    // Validate các trường bắt buộc trước khi gửi
    if (!formData.schedule.OpendatePlan) {
      setErrors({
        OpendatePlan: "Ngày dự kiến bắt đầu là bắt buộc",
      });
      setCurrentStep(2);
      return;
    }

    if (
      !formData.schedule.Numofsession ||
      parseInt(formData.schedule.Numofsession) <= 0
    ) {
      setErrors({
        Numofsession: "Số buổi học là bắt buộc và phải > 0",
      });
      setCurrentStep(2);
      return;
    }

    if (!formData.Maxstudent || parseInt(formData.Maxstudent) <= 0) {
      setErrors({
        Maxstudent: "Sĩ số tối đa là bắt buộc và phải > 0",
      });
      setCurrentStep(1);
      return;
    }

    if (!formData.scheduleDetail.EnddatePlan) {
      setErrors({
        scheduleDetailEnddatePlan: "Ngày dự kiến kết thúc là bắt buộc",
      });
      setCurrentStep(3);
      return;
    }

    if (!formData.ZoomID || !formData.ZoomID.trim()) {
      setErrors({
        ZoomID: "Zoom ID là bắt buộc",
      });
      setCurrentStep(1);
      return;
    }

    if (!formData.Zoompass || !formData.Zoompass.trim()) {
      setErrors({
        Zoompass: "Mật khẩu Zoom là bắt buộc",
      });
      setCurrentStep(1);
      return;
    }

    // Validate sessions trước khi submit
    if (!formData.sessions || formData.sessions.length === 0) {
      setErrors({
        preview: "Vui lòng hoàn thành bước 3 để tạo lịch học chi tiết",
      });
      setCurrentStep(3);
      return;
    }

    // Validate từng session có đầy đủ thông tin
    const invalidSessions = formData.sessions.filter(
      (s) => !s.Date || !s.TimeslotID
    );
    if (invalidSessions.length > 0) {
      setErrors({
        preview: `Có ${invalidSessions.length} buổi học thiếu thông tin (ngày hoặc ca học). Vui lòng kiểm tra lại.`,
      });
      setCurrentStep(3);
      return;
    }

    // Lấy className để tạo title cho sessions
    // const className = formData.Name || `Class ${formData.ClassID || ""}`; // Không dùng

    const submitData = {
      Name: formData.Name,
      InstructorID: formData.InstructorID,
      CourseID: formData.CourseID || null,
      Fee:
        formData.Fee && parseFloat(formData.Fee) > 0
          ? parseFloat(formData.Fee)
          : 0,
      // Trường mới (dbver5) - Đảm bảo không null/undefined
      OpendatePlan: formData.schedule.OpendatePlan,
      Numofsession: parseInt(formData.schedule.Numofsession),
      Maxstudent: parseInt(formData.Maxstudent),
      ZoomID: formData.ZoomID.trim(),
      Zoompass: formData.Zoompass.trim(),
      EnddatePlan: formData.scheduleDetail.EnddatePlan,
      Status: "DRAFT",
      // Luôn gửi sessions khi lưu nháp - với đầy đủ thông tin bao gồm InstructorID
      // Title: "Session for class {classDisplayName}"
      sessions: formData.sessions
        .filter((session) => session.Date && session.TimeslotID) // Chỉ lấy sessions hợp lệ
        .map((session, index) => {
          // Đảm bảo Date là string format YYYY-MM-DD
          const dateStr = toISODateString(session.Date);

          // Đảm bảo TimeslotID là số
          const timeslotId = parseInt(session.TimeslotID);

          // Validate Date format
          if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            console.warn(
              `Session ${index + 1} has invalid Date format:`,
              session.Date
            );
            return null;
          }

          // Validate TimeslotID
          if (isNaN(timeslotId) || timeslotId <= 0) {
            console.warn(
              `Session ${index + 1} has invalid TimeslotID:`,
              session.TimeslotID
            );
            return null;
          }

          // Validate Date khớp với Day của Timeslot (nếu có)
          const timeslot = timeslots.find(
            (t) => (t.TimeslotID || t.id) === timeslotId
          );
          if (timeslot) {
            const timeslotDay = timeslot.Day || timeslot.day;
            if (timeslotDay) {
              const sessionDay = getDayFromDate(dateStr);
              if (sessionDay !== timeslotDay) {
                console.warn(
                  `Session ${
                    index + 1
                  }: Date ${dateStr} (${sessionDay}) không khớp với Timeslot Day (${timeslotDay}). Session này có thể bị từ chối bởi backend.`
                );
                // Vẫn gửi nhưng cảnh báo - backend sẽ xử lý
              }
            }
          }

          return {
            Title: `Session for class ${classDisplayName}`,
            Description: session.Description || "",
            Date: dateStr, // YYYY-MM-DD string
            TimeslotID: timeslotId, // Integer
            InstructorID: formData.InstructorID, // Integer - Thêm InstructorID vào mỗi session
            TimeslotDay:
              session.TimeslotDay || timeslot?.Day || timeslot?.day || null,
            TimeslotStart:
              session.TimeslotStart ||
              timeslot?.StartTime ||
              timeslot?.startTime ||
              null,
            TimeslotEnd:
              session.TimeslotEnd ||
              timeslot?.EndTime ||
              timeslot?.endTime ||
              null,
            // ClassID sẽ được set sau khi class được tạo trong CreateClassPage
          };
        })
        .filter((s) => s !== null), // Loại bỏ sessions null
    };

    console.log("Submitting class with sessions:", {
      classInfo: {
        Name: submitData.Name,
        InstructorID: submitData.InstructorID,
        OpendatePlan: submitData.OpendatePlan,
        EnddatePlan: submitData.EnddatePlan,
        Numofsession: submitData.Numofsession,
      },
      sessionsCount: submitData.sessions.length,
      sessions: submitData.sessions,
    });

    // Nếu đang submit từ bước 2 (edit mode), đợi onSubmit hoàn thành rồi mới hiện modal chuyển hướng
    const wasSubmittingFromStep2 = submittingFromStep2;
    if (wasSubmittingFromStep2) {
      setSubmittingFromStep2(false);
    }

    try {
      // Gọi onSubmit và đợi kết quả
      await onSubmit(submitData);

      // Nếu submit từ bước 2 và thành công, hiện modal chuyển hướng
      if (wasSubmittingFromStep2 && classId) {
        setRedirectModal({ open: true, classId });
      }
    } catch (error) {
      console.error("Error submitting class:", error);
      // Nếu có lỗi, không hiện modal chuyển hướng
      // Error sẽ được xử lý bởi CreateClassPage
    }
  };

  // Handler để toggle chọn ngày học trong tuần
  const handleDayToggle = (dayValue) => {
    const isCurrentlySelected =
      formData.scheduleDetail.DaysOfWeek.includes(dayValue);
    const newDays = isCurrentlySelected
      ? formData.scheduleDetail.DaysOfWeek.filter((d) => d !== dayValue)
      : [...formData.scheduleDetail.DaysOfWeek, dayValue].sort();

    // Nếu bỏ chọn ngày, xóa các ca học của ngày đó
    const newTimeslotsByDay = { ...formData.scheduleDetail.TimeslotsByDay };
    if (isCurrentlySelected) {
      delete newTimeslotsByDay[dayValue];
    }

    // if (isSearchMode && isCurrentlySelected) {
    //   setSearchModeSelections((prev) => {
    //     const next = { ...prev };
    //     delete next[dayValue];
    //     return next;
    //   });
    // } // Không dùng cho logic mới

    setFormData({
      ...formData,
      scheduleDetail: {
        ...formData.scheduleDetail,
        DaysOfWeek: newDays,
        TimeslotsByDay: newTimeslotsByDay,
      },
    });
  };

  // Handler để toggle chọn ca học cho một ngày cụ thể
  // Logic cũ: Toggle timeslot cho từng ngày (không dùng cho logic mới)
  // Logic mới: Chọn timeslot trước → không cần toggle timeslot cho từng ngày nữa
  // Vẫn giữ lại vì được dùng trong grid (logic cũ) cho edit mode không phải DRAFT
  const handleTimeslotToggle = (dayOfWeek, timeslotId) => {
    const slotStatus = getSlotStatus({
      dayOfWeek,
      timeslotId,
      startDate: plannedStartDate,
      endDate: formData.scheduleDetail.EnddatePlan,
    });

    const isLocked = slotStatus.status === "LOCKED";

    // if (!isSearchMode && isLocked) {
    //   return;
    // } // Không dùng cho logic mới

    if (isLocked) {
      return;
    }

    // Logic mới: Kiểm tra chốt timeslot cho DRAFT hoặc tạo mới
    const shouldLockTimeslot = !classId || isDraftClass;
    const normalizedTimeslotId = normalizeTimeslotId(timeslotId);
    const normalizedLockedTimeslotId = lockedTimeslotId
      ? normalizeTimeslotId(lockedTimeslotId)
      : null;

    // const currentSelectionMap = isSearchMode
    //   ? searchModeSelections
    //   : formData.scheduleDetail.TimeslotsByDay || {}; // Không dùng cho logic mới
    const currentSelectionMap = formData.scheduleDetail.TimeslotsByDay || {};

    const currentDayTimeslots = currentSelectionMap?.[dayOfWeek] || [];
    const isSelected = currentDayTimeslots.includes(timeslotId);

    // Nếu đang bỏ chọn (untick) → cho phép
    if (isSelected) {
      // Cho phép bỏ chọn
    } else {
      // Đang chọn timeslot mới
      // Nếu đã chốt timeslot và timeslot mới khác timeslot đã chốt → không cho phép
      if (
        shouldLockTimeslot &&
        normalizedLockedTimeslotId &&
        normalizedTimeslotId !== normalizedLockedTimeslotId
      ) {
        // Tìm timeslot để hiển thị thông báo
        const lockedTimeslot = timeslots.find(
          (t) =>
            normalizeTimeslotId(t.TimeslotID || t.id) ===
            normalizedLockedTimeslotId
        );
        const timeslotLabel = lockedTimeslot
          ? `${lockedTimeslot.StartTime || ""}-${lockedTimeslot.EndTime || ""}`
          : normalizedLockedTimeslotId;
        setErrors((prev) => ({
          ...prev,
          TimeslotsByDay: `Lớp này đã chốt ca học ${timeslotLabel}. Vui lòng chọn cùng ca học cho tất cả các ngày.`,
        }));
        return;
      }
    }

    const newDayTimeslots = isSelected
      ? currentDayTimeslots.filter((id) => id !== timeslotId)
      : [...currentDayTimeslots, timeslotId];

    // if (isSearchMode) {
    //   setSearchModeSelections((prev) => {
    //     const next = { ...prev };
    //     if (newDayTimeslots.length > 0) {
    //       next[dayOfWeek] = newDayTimeslots;
    //     } else {
    //       delete next[dayOfWeek];
    //     }
    //     return next;
    //   });
    //   setSearchModeStatus((prev) =>
    //     prev.loading ? prev : { ...SEARCH_MODE_INITIAL_STATUS }
    //   );
    // } else {
    // Không dùng cho logic mới - bỏ search mode
    setFormData((prev) => {
      const updatedTimeslots =
        { ...(prev.scheduleDetail.TimeslotsByDay || {}) } || {};
      if (newDayTimeslots.length > 0) {
        updatedTimeslots[dayOfWeek] = newDayTimeslots;
      } else {
        delete updatedTimeslots[dayOfWeek];
      }

      return {
        ...prev,
        scheduleDetail: {
          ...prev.scheduleDetail,
          TimeslotsByDay: updatedTimeslots,
        },
      };
    });
    // Xóa lỗi khi đã chọn đúng timeslot
    if (
      shouldLockTimeslot &&
      normalizedTimeslotId === normalizedLockedTimeslotId
    ) {
      setErrors((prev) => {
        const next = { ...prev };
        if (next.TimeslotsByDay?.includes("đã chốt ca học")) {
          delete next.TimeslotsByDay;
        }
        return next;
      });
    }
    // } // Không dùng cho logic mới - đã bỏ search mode
  };

  // Hàm tìm ngày bắt đầu khác dựa trên ca học đã chọn
  const handleSearchAlternativeStartDate = async () => {
    // Nếu chưa ở chế độ tìm kiếm, chỉ bật chế độ tìm kiếm và reset để cho phép chọn lại
    if (!alternativeStartDateSearch.showResults) {
      setAlternativeStartDateSearch({
        loading: false,
        suggestions: [],
        error: null,
        showResults: true,
      });

      // Reset TimeslotsByDay và DaysOfWeek để cho phép chọn lại
      setFormData((prev) => ({
        ...prev,
        scheduleDetail: {
          ...prev.scheduleDetail,
          DaysOfWeek: [],
          TimeslotsByDay: {},
        },
      }));

      // Reset selectedTimeslotIds
      setSelectedTimeslotIds(new Set());
      return;
    }

    // Nếu đã ở chế độ tìm kiếm, kiểm tra và gọi API
    // Kiểm tra cả TimeslotsByDay và selectedTimeslotIds
    const hasDaysOfWeek =
      formData.scheduleDetail.DaysOfWeek &&
      formData.scheduleDetail.DaysOfWeek.length > 0;
    const hasTimeslotsByDay =
      formData.scheduleDetail.TimeslotsByDay &&
      Object.keys(formData.scheduleDetail.TimeslotsByDay).length > 0;
    const hasSelectedTimeslots = selectedTimeslotIds.size > 0;

    if (
      !hasScheduleCoreInfo ||
      (!hasDaysOfWeek && !hasSelectedTimeslots) ||
      (!hasTimeslotsByDay && !hasSelectedTimeslots)
    ) {
      setAlternativeStartDateSearch((prev) => ({
        ...prev,
        loading: false,
        error:
          "Vui lòng chọn ngày học và ca học trước khi tìm ngày bắt đầu khác.",
      }));
      return;
    }

    // Nếu đã chọn đủ, gọi API
    setAlternativeStartDateSearch((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      // Chuẩn hóa dữ liệu trước khi gửi: convert string sang number
      let normalizedDaysOfWeek = (formData.scheduleDetail.DaysOfWeek || []).map(
        (d) => (typeof d === "string" ? parseInt(d, 10) : d)
      );

      let normalizedTimeslotsByDay = {};

      // Nếu có TimeslotsByDay, dùng nó
      if (hasTimeslotsByDay) {
        Object.entries(formData.scheduleDetail.TimeslotsByDay || {}).forEach(
          ([dayKey, timeslotIds]) => {
            const normalizedDayKey =
              typeof dayKey === "string" ? parseInt(dayKey, 10) : dayKey;
            normalizedTimeslotsByDay[normalizedDayKey] = (
              timeslotIds || []
            ).map((id) => (typeof id === "string" ? parseInt(id, 10) : id));
          }
        );
      } else if (hasSelectedTimeslots && hasDaysOfWeek) {
        // Nếu không có TimeslotsByDay nhưng có selectedTimeslotIds và DaysOfWeek
        // Build TimeslotsByDay từ selectedTimeslotIds và DaysOfWeek
        normalizedDaysOfWeek.forEach((day) => {
          normalizedTimeslotsByDay[day] = Array.from(selectedTimeslotIds).map(
            (id) => (typeof id === "string" ? parseInt(id, 10) : id)
          );
        });
      } else if (hasSelectedTimeslots && !hasDaysOfWeek) {
        // Nếu chỉ có selectedTimeslotIds mà chưa chọn ngày
        setAlternativeStartDateSearch((prev) => ({
          ...prev,
          loading: false,
          error:
            "Vui lòng chọn ngày học trong tuần trước khi tìm ngày bắt đầu khác.",
        }));
        return;
      }

      // Tính sessionsPerWeek từ normalizedTimeslotsByDay
      let calculatedSessionsPerWeek = 0;
      Object.values(normalizedTimeslotsByDay).forEach((dayTimeslots) => {
        calculatedSessionsPerWeek += dayTimeslots.length;
      });

      // Nếu không có TimeslotsByDay, tính từ selectedTimeslotIds và DaysOfWeek
      if (
        calculatedSessionsPerWeek === 0 &&
        hasSelectedTimeslots &&
        hasDaysOfWeek
      ) {
        calculatedSessionsPerWeek =
          selectedTimeslotIds.size * normalizedDaysOfWeek.length;
      }

      // Fallback: ít nhất 1 session/tuần
      if (calculatedSessionsPerWeek === 0) {
        calculatedSessionsPerWeek = 1;
      }

      const payload = {
        InstructorID: parseInt(formData.InstructorID, 10),
        DaysOfWeek: normalizedDaysOfWeek,
        TimeslotsByDay: normalizedTimeslotsByDay,
        Numofsession: parseInt(formData.schedule.Numofsession, 10),
        sessionsPerWeek: calculatedSessionsPerWeek,
        requiredSlotsPerWeek: calculatedSessionsPerWeek, // Dùng cùng giá trị với sessionsPerWeek
        currentStartDate:
          scheduleStartDate && scheduleStartDate.trim() !== ""
            ? scheduleStartDate
            : null,
      };

      console.log(
        "[handleSearchAlternativeStartDate] Sending payload:",
        payload
      );

      const result = await classService.searchTimeslots(payload);

      const suggestions = result?.suggestions || result || [];
      setAlternativeStartDateSearch({
        loading: false,
        suggestions: Array.isArray(suggestions) ? suggestions : [],
        error:
          suggestions.length === 0
            ? "Không tìm thấy ngày bắt đầu phù hợp. Vui lòng thử chọn các ca học khác."
            : null,
        showResults: true,
      });
    } catch (error) {
      console.error("Error searching alternative start dates:", error);
      setAlternativeStartDateSearch({
        loading: false,
        suggestions: [],
        error:
          error.response?.data?.message ||
          error.message ||
          "Có lỗi xảy ra khi tìm ngày bắt đầu khác.",
        showResults: true,
      });
    }
  };

  // Hàm áp dụng ngày bắt đầu mới
  const handleApplyAlternativeStartDate = (newStartDate) => {
    if (!newStartDate) return;

    setFormData((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        OpendatePlan: newStartDate,
      },
      scheduleDetail: {
        ...prev.scheduleDetail,
        OpendatePlan: newStartDate,
        // Giữ nguyên DaysOfWeek và TimeslotsByDay để user có thể chọn lại
        // DaysOfWeek: prev.scheduleDetail.DaysOfWeek,
        // TimeslotsByDay: prev.scheduleDetail.TimeslotsByDay,
      },
    }));

    // Reset preview sessions khi thay đổi ngày bắt đầu
    setPreviewSessions([]);
    setShouldShowPreview(false);

    // Đóng kết quả tìm kiếm
    setAlternativeStartDateSearch({
      loading: false,
      suggestions: [],
      error: null,
      showResults: false,
    });

    // Không reset DaysOfWeek và TimeslotsByDay - để user có thể chọn lại nếu cần
    // User có thể giữ nguyên hoặc chọn lại ca học và ngày học trong tuần
  };

  // Không dùng cho logic mới - Search mode không cần thiết
  // const handleEnterSearchMode = () => {
  //   const clonedSelection = cloneTimeslotSelection(
  //     formData.scheduleDetail.TimeslotsByDay || {},
  //     formData.scheduleDetail.DaysOfWeek
  //   );
  //   setSearchModeSelections(clonedSelection);
  //   setSearchModeStatus({ ...SEARCH_MODE_INITIAL_STATUS });
  //   setIsSearchMode(true);
  // };

  // const handleExitSearchMode = () => {
  //   setIsSearchMode(false);
  //   setSearchModeSelections({});
  //   setSearchModeStatus({ ...SEARCH_MODE_INITIAL_STATUS });
  // };

  // const handleSearchModeSubmit = async () => {
  //   if (!formData.InstructorID) {
  //     setSearchModeStatus({
  //       loading: false,
  //       success: false,
  //       error: "Vui lòng chọn giảng viên trước khi tìm ngày.",
  //       date: null,
  //       message: "",
  //     });
  //     return;
  //   }

  //   if (
  //     !formData.schedule?.Numofsession ||
  //     Number(formData.schedule.Numofsession) <= 0
  //   ) {
  //     setSearchModeStatus({
  //       loading: false,
  //       success: false,
  //       error: "Vui lòng nhập tổng số buổi học trước khi tìm kiếm.",
  //       date: null,
  //       message: "",
  //     });
  //     return;
  //   }

  //   if (!formData.scheduleDetail.DaysOfWeek?.length) {
  //     setSearchModeStatus({
  //       loading: false,
  //       success: false,
  //       error: "Vui lòng chọn ngày học trong tuần trước khi tìm kiếm.",
  //       date: null,
  //       message: "",
  //     });
  //     return;
  //   }

  //   if (isEditMode && impactedSessionsErrorMessage) {
  //     setSearchModeStatus({
  //       loading: false,
  //       success: false,
  //       error: impactedSessionsErrorMessage,
  //       date: null,
  //       message: "",
  //     });
  //     return;
  //   }

  //   if (instructorType === "parttime" && parttimeAvailabilityError) {
  //     setSearchModeStatus({
  //       loading: false,
  //       success: false,
  //       error: parttimeAvailabilityError,
  //       date: null,
  //       message: "",
  //     });
  //     return;
  //   }

  //   const normalizedSelection = cloneTimeslotSelection(
  //     Object.keys(searchModeSelections).length > 0
  //       ? searchModeSelections
  //       : formData.scheduleDetail.TimeslotsByDay,
  //     formData.scheduleDetail.DaysOfWeek
  //   );

  //   const desiredSlotsPerWeek = countSelectionSlots(normalizedSelection);

  //   if (desiredSlotsPerWeek === 0) {
  //     setSearchModeStatus({
  //       loading: false,
  //       success: false,
  //       error: "Vui lòng chọn ít nhất 1 ca mong muốn để tìm ngày phù hợp.",
  //       date: null,
  //       message: "",
  //     });
  //     return;
  //   }

  //   setSearchModeStatus({
  //     loading: true,
  //     success: false,
  //     error: "",
  //     date: null,
  //     message: "",
  //   });

  //   try {
  //     // Sử dụng API chuyên dụng để tối ưu performance
  //     const result = await classService.searchTimeslots({
  //       InstructorID: formData.InstructorID,
  //       DaysOfWeek: formData.scheduleDetail.DaysOfWeek,
  //       TimeslotsByDay: normalizedSelection,
  //       Numofsession: formData.schedule.Numofsession,
  //       sessionsPerWeek: desiredSlotsPerWeek,
  //       requiredSlotsPerWeek: desiredSlotsPerWeek,
  //       currentStartDate:
  //         formData.scheduleDetail.OpendatePlan ||
  //         formData.schedule.OpendatePlan,
  //     });

  //     const suggestions = result?.suggestions || result || [];
  //     const suggestion = suggestions.length > 0 ? suggestions[0] : null;

  //     if (suggestion) {
  //       setSearchModeStatus({
  //         loading: false,
  //         success: true,
  //         error: "",
  //         date: suggestion.date,
  //         message:
  //           suggestion.reason || `Đủ ${suggestion.availableSlots} ca/tuần`,
  //       });
  //     } else {
  //       setSearchModeStatus({
  //         loading: false,
  //         success: false,
  //         error:
  //           "Không tìm thấy ngày nào đáp ứng các ca mong muốn trong thời gian kiểm tra.",
  //         date: null,
  //         message: "",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("handleSearchModeSubmit error:", error);
  //     setSearchModeStatus({
  //       loading: false,
  //       success: false,
  //       error:
  //         error?.message || "Không thể tìm ngày phù hợp. Vui lòng thử lại sau.",
  //       date: null,
  //       message: "",
  //     });
  //   }
  // }; // Không dùng cho logic mới

  // const handleApplySearchModeSuggestion = () => {
  //   if (!searchModeStatus.date) {
  //     return;
  //   }

  //   const normalizedSelection = cloneTimeslotSelection(
  //     Object.keys(searchModeSelections).length > 0
  //       ? searchModeSelections
  //       : formData.scheduleDetail.TimeslotsByDay,
  //     formData.scheduleDetail.DaysOfWeek
  //   );

  //   applySuggestedStartDate(searchModeStatus.date);

  //   if (Object.keys(normalizedSelection).length > 0) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       scheduleDetail: {
  //         ...prev.scheduleDetail,
  //         TimeslotsByDay: normalizedSelection,
  //       },
  //     }));
  //   }

  //   setSearchModeSelections({});
  //   setSearchModeStatus({ ...SEARCH_MODE_INITIAL_STATUS });
  //   setIsSearchMode(false);
  // }; // Không dùng cho logic mới

  return (
    <div
      className={
        variant === "modal" ? "class-wizard-overlay" : "class-wizard-page"
      }
    >
      <div className="class-wizard-container">
        {/* Progress Steps */}
        <div className="wizard-steps">
          <div
            className={`step ${currentStep >= 1 ? "active" : ""} ${
              currentStep > 1 ? "completed" : ""
            }`}
          >
            <div className="step-number">1</div>
            <div className="step-label">Thông tin cơ bản</div>
          </div>
          <div
            className={`step ${currentStep >= 2 ? "active" : ""} ${
              currentStep > 2 ? "completed" : ""
            }`}
          >
            <div className="step-number">2</div>
            <div className="step-label">Lên lịch học</div>
          </div>
          <div
            className={`step ${currentStep >= 3 ? "active" : ""} ${
              currentStep > 3 ? "completed" : ""
            } ${readonly ? "disabled" : ""}`}
            style={{
              opacity: readonly ? 0.5 : 1,
              cursor: readonly ? "not-allowed" : "pointer",
            }}
            onClick={() => {
              // Chỉ chặn khi đang ở chế độ readonly (xem chi tiết), còn edit mode vẫn cho vào Step 3
              if (readonly) {
                setRedirectModal({ open: true, classId });
              }
            }}
          >
            <div className="step-number">3</div>
            <div className="step-label">Lịch học</div>
          </div>
          <div
            className={`step ${currentStep >= 4 ? "active" : ""} ${
              currentStep > 4 ? "completed" : ""
            }`}
          >
            <div className="step-number">4</div>
            <div className="step-label">Xem lại</div>
          </div>
        </div>

        {/* Step Content */}
        <div className="wizard-content">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="wizard-step-content">
              <div className="form-group">
                <label htmlFor="Name">
                  Tên lớp học <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="Name"
                  value={formData.Name}
                  onChange={(e) =>
                    setFormData({ ...formData, Name: e.target.value })
                  }
                  placeholder="Nhập tên lớp học"
                  className={errors.Name ? "error" : ""}
                  disabled={readonly}
                  readOnly={readonly}
                />
                {errors.Name && (
                  <span className="error-message">{errors.Name}</span>
                )}
              </div>

              {/* Search Dropdown cho Giảng viên */}
              <div className="form-group">
                <label htmlFor="InstructorID">
                  Giảng viên <span className="required">*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    id="InstructorID"
                    value={
                      instructorSearchTerm ||
                      (selectedInstructor
                        ? `${
                            selectedInstructor.FullName ||
                            selectedInstructor.fullName
                          } - ${
                            selectedInstructor.Major || selectedInstructor.major
                          }`
                        : "")
                    }
                    onChange={(e) => {
                      if (readonly) return;
                      setInstructorSearchTerm(e.target.value);
                      setInstructorDropdownOpen(true);
                      if (!e.target.value) {
                        setFormData({ ...formData, InstructorID: null });
                        setSelectedInstructor(null);
                        setInstructorType(null);
                        setParttimeAvailableSlotKeys([]);
                        setParttimeAvailableEntriesCount(null);
                        setParttimeAvailabilityError("");
                      }
                    }}
                    onFocus={() => {
                      if (!readonly) setInstructorDropdownOpen(true);
                    }}
                    onBlur={() => {
                      // Delay để cho phép click vào dropdown item
                      setTimeout(() => setInstructorDropdownOpen(false), 200);
                    }}
                    placeholder="Tìm kiếm giảng viên..."
                    className={errors.InstructorID ? "error" : ""}
                    disabled={readonly}
                    readOnly={readonly}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                  {instructorDropdownOpen && filteredInstructors.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        marginTop: "4px",
                        maxHeight: "200px",
                        overflowY: "auto",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      }}
                    >
                      {filteredInstructors.map((instructor) => (
                        <div
                          key={instructor.InstructorID || instructor.id}
                          onClick={() => {
                            // Đảm bảo lấy đúng InstructorID, không phải AccID
                            // Backend trả về InstructorID từ bảng instructor
                            // AccID là foreign key đến bảng account, KHÔNG phải InstructorID
                            const value = instructor.InstructorID;

                            // Nếu không có InstructorID, thử id nhưng phải đảm bảo không phải AccID
                            const fallbackValue = instructor.id;

                            // Kiểm tra xem id có phải là AccID không (nếu có AccID và id === AccID thì bỏ qua)
                            const finalValue =
                              value ||
                              (fallbackValue &&
                              fallbackValue !== instructor.AccID
                                ? fallbackValue
                                : null);

                            console.log("[ClassWizard] Selected instructor:", {
                              instructor,
                              InstructorID: instructor.InstructorID,
                              id: instructor.id,
                              AccID: instructor.AccID,
                              selectedValue: finalValue,
                              isAccID: fallbackValue === instructor.AccID,
                            });

                            if (!finalValue) {
                              console.error(
                                "[ClassWizard] Cannot find InstructorID in instructor object:",
                                instructor
                              );
                              alert(
                                "Lỗi: Không tìm thấy InstructorID. Vui lòng thử lại."
                              );
                              return;
                            }

                            // Kiểm tra thêm: nếu finalValue === AccID thì báo lỗi
                            if (
                              instructor.AccID &&
                              finalValue === instructor.AccID
                            ) {
                              console.error(
                                "[ClassWizard] ERROR: Selected AccID instead of InstructorID!",
                                {
                                  AccID: instructor.AccID,
                                  InstructorID: instructor.InstructorID,
                                  selectedValue: finalValue,
                                }
                              );
                              alert(
                                "Lỗi: Đã chọn nhầm AccID thay vì InstructorID. Vui lòng thử lại."
                              );
                              return;
                            }

                            setFormData({
                              ...formData,
                              InstructorID: finalValue,
                              // Reset ca học và ngày học khi chọn lại giảng viên
                              scheduleDetail: {
                                ...formData.scheduleDetail,
                                DaysOfWeek: [],
                                TimeslotsByDay: {},
                              },
                            });
                            setSelectedInstructor(instructor);
                            setInstructorType(
                              instructor.Type || instructor.type || null
                            );
                            setParttimeAvailableSlotKeys([]);
                            setParttimeAvailableEntriesCount(null);
                            setParttimeAvailabilityError("");
                            setInstructorSearchTerm("");
                            setInstructorDropdownOpen(false);
                            setBlockedDays({});
                            // Reset selectedTimeslotIds khi chọn lại giảng viên
                            setSelectedTimeslotIds(new Set());
                            // Reset chế độ tìm kiếm
                            setAlternativeStartDateSearch({
                              loading: false,
                              suggestions: [],
                              error: null,
                              showResults: false,
                            });
                            // Bỏ hiển thị instructorAvailability
                          }}
                          style={{
                            padding: "10px 12px",
                            cursor: "pointer",
                            borderBottom: "1px solid #f1f5f9",
                            fontSize: "14px",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#fff";
                          }}
                        >
                          {instructor.FullName || instructor.fullName} -{" "}
                          {instructor.Major || instructor.major}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.InstructorID && (
                  <span className="error-message">{errors.InstructorID}</span>
                )}
              </div>

              {/* Search Dropdown cho Khóa/Môn */}
              <div className="form-group">
                <label htmlFor="CourseID">
                  Khóa/Môn <span className="required">*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    id="CourseID"
                    value={
                      courseSearchTerm ||
                      (selectedCourse
                        ? selectedCourse.Title || selectedCourse.title || ""
                        : "")
                    }
                    onChange={(e) => {
                      if (readonly) return;
                      setCourseSearchTerm(e.target.value);
                      setCourseDropdownOpen(true);
                      if (!e.target.value) {
                        setFormData({ ...formData, CourseID: null });
                        setSelectedCourse(null);
                      }
                    }}
                    onFocus={() => {
                      if (!readonly && formData.InstructorID) {
                        setCourseDropdownOpen(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setCourseDropdownOpen(false), 200);
                    }}
                    placeholder={
                      formData.InstructorID
                        ? "Tìm kiếm khóa học..."
                        : "Vui lòng chọn giảng viên trước"
                    }
                    disabled={readonly || !formData.InstructorID}
                    readOnly={readonly}
                    className={errors.CourseID ? "error" : ""}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      backgroundColor: formData.InstructorID
                        ? "#fff"
                        : "#f8fafc",
                      cursor: formData.InstructorID ? "text" : "not-allowed",
                    }}
                  />
                  {courseDropdownOpen &&
                    formData.InstructorID &&
                    (filteredCourses.length > 0 || loadingInstructorData) && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          zIndex: 1000,
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          marginTop: "4px",
                          maxHeight: "200px",
                          overflowY: "auto",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        }}
                      >
                        {loadingInstructorData ? (
                          <div
                            style={{
                              padding: "12px",
                              textAlign: "center",
                              color: "#64748b",
                              fontSize: "14px",
                            }}
                          >
                            Đang tải khóa học...
                          </div>
                        ) : filteredCourses.length === 0 ? (
                          <div
                            style={{
                              padding: "12px",
                              textAlign: "center",
                              color: "#64748b",
                              fontSize: "14px",
                            }}
                          >
                            Không có khóa học nào (PUBLISHED) cho giảng viên này
                          </div>
                        ) : (
                          filteredCourses.map((course) => (
                            <div
                              key={course.CourseID || course.id}
                              onClick={() => {
                                const value = course.CourseID || course.id;
                                setFormData({ ...formData, CourseID: value });
                                setSelectedCourse(course);
                                setCourseSearchTerm("");
                                setCourseDropdownOpen(false);
                              }}
                              style={{
                                padding: "10px 12px",
                                cursor: "pointer",
                                borderBottom: "1px solid #f1f5f9",
                                fontSize: "14px",
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#f8fafc";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "#fff";
                              }}
                            >
                              {course.Title ||
                                course.title ||
                                course.CourseTitle}
                              {(course.Description ||
                                course.CourseDescription) && (
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#64748b",
                                    marginTop: "2px",
                                  }}
                                >
                                  {course.Description ||
                                    course.CourseDescription}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                </div>
                {errors.CourseID && (
                  <span className="error-message">{errors.CourseID}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="Fee">
                  Học phí (VND)
                  <span className="optional">(Tùy chọn)</span>
                </label>
                <input
                  type="number"
                  id="Fee"
                  value={formData.Fee}
                  onChange={(e) =>
                    setFormData({ ...formData, Fee: e.target.value })
                  }
                  placeholder="Nhập học phí (để trống nếu miễn phí)"
                  min="0"
                  className={errors.Fee ? "error" : ""}
                  disabled={readonly}
                  readOnly={readonly}
                />
                {errors.Fee && (
                  <span className="error-message">{errors.Fee}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="Maxstudent">
                  Sĩ số tối đa <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="Maxstudent"
                  value={formData.Maxstudent}
                  onChange={(e) =>
                    setFormData({ ...formData, Maxstudent: e.target.value })
                  }
                  placeholder="Nhập sĩ số tối đa"
                  min="1"
                  className={errors.Maxstudent ? "error" : ""}
                  disabled={readonly}
                  readOnly={readonly}
                />
                {errors.Maxstudent && (
                  <span className="error-message">{errors.Maxstudent}</span>
                )}
              </div>

              <div
                className="form-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div className="form-group">
                  <label htmlFor="ZoomID">
                    Zoom ID <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="ZoomID"
                    value={formData.ZoomID}
                    onChange={(e) =>
                      setFormData({ ...formData, ZoomID: e.target.value })
                    }
                    placeholder="12345678901"
                    maxLength="11"
                    className={errors.ZoomID ? "error" : ""}
                    disabled={readonly}
                    readOnly={readonly}
                  />
                  {errors.ZoomID && (
                    <span className="error-message">{errors.ZoomID}</span>
                  )}
                  <small
                    style={{
                      color: "#64748b",
                      fontSize: "12px",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    ID phòng Zoom (tối đa 11 ký tự)
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="Zoompass">
                    Mật khẩu Zoom <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="Zoompass"
                    value={formData.Zoompass}
                    onChange={(e) =>
                      setFormData({ ...formData, Zoompass: e.target.value })
                    }
                    placeholder="123456"
                    maxLength="6"
                    className={errors.Zoompass ? "error" : ""}
                    disabled={readonly}
                    readOnly={readonly}
                  />
                  {errors.Zoompass && (
                    <span className="error-message">{errors.Zoompass}</span>
                  )}
                  <small
                    style={{
                      color: "#64748b",
                      fontSize: "12px",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    Mật khẩu phòng Zoom (tối đa 6 ký tự)
                  </small>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Schedule (theo DB schema) */}
          {currentStep === 2 && (
            <div className="wizard-step-content">
              <div className="schedule-section">
                <div className="form-group">
                  <label htmlFor="OpendatePlan">
                    Ngày dự kiến bắt đầu <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="OpendatePlan"
                    value={
                      formData.schedule.OpendatePlan
                        ? formData.schedule.OpendatePlan
                        : ""
                    }
                    min={dayjs().add(1, "day").format("YYYY-MM-DD")} // Mặc định: Ngày mai
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        schedule: {
                          ...prev.schedule,
                          OpendatePlan: dateValue,
                        },
                        scheduleDetail: {
                          ...prev.scheduleDetail,
                          OpendatePlan: dateValue,
                        },
                      }));
                    }}
                    className={errors.OpendatePlan ? "error" : ""}
                    disabled={readonly}
                    readOnly={readonly}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                  {errors.OpendatePlan && (
                    <span className="error-message">{errors.OpendatePlan}</span>
                  )}
                  <small
                    style={{
                      color: "#64748b",
                      fontSize: "12px",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    Mặc định: Ngày mai
                  </small>
                  {instructorType === "parttime" &&
                    parttimeAvailabilityError && (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "12px",
                          borderRadius: "8px",
                          backgroundColor: "#fef2f2",
                          border: "1px solid #fca5a5",
                          color: "#991b1b",
                          fontSize: "13px",
                        }}
                      >
                        {parttimeAvailabilityError}
                      </div>
                    )}
                  {isEditMode &&
                    !readonly &&
                    impactedSessionMessages.length > 0 && (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "12px",
                          borderRadius: "8px",
                          backgroundColor: "#fff7ed",
                          border: "1px solid #fdba74",
                          color: "#9a3412",
                          fontSize: "13px",
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>
                          Do thay đổi ngày bắt đầu dự kiến các ca sau sẽ phải
                          chọn lại:
                        </div>
                        <ul style={{ paddingLeft: 18, margin: 0 }}>
                          {impactedSessionMessages.map((msg, idx) => (
                            <li key={`impact-step2-${idx}`}>{msg}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>

                <div className="form-group">
                  <label htmlFor="Numofsession">
                    Tổng số buổi học <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="Numofsession"
                    value={formData.schedule.Numofsession}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        schedule: {
                          ...formData.schedule,
                          Numofsession: e.target.value,
                        },
                      })
                    }
                    placeholder="Nhập số buổi học dự kiến"
                    min="1"
                    className={errors.Numofsession ? "error" : ""}
                    disabled={readonly}
                    readOnly={readonly}
                  />
                  {errors.Numofsession && (
                    <span className="error-message">{errors.Numofsession}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Schedule Detail - Layout 2 cột */}
          {/* Disable bước 3 khi readonly */}
          {currentStep === 3 && !readonly && (
            <div className="wizard-step-content">
              <div className="schedule-section">
                {/* Ngày bắt đầu */}
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label htmlFor="scheduleDetailOpendatePlan">
                    Ngày dự kiến bắt đầu <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="scheduleDetailOpendatePlan"
                    value={
                      formData.scheduleDetail.OpendatePlan ||
                      formData.schedule.OpendatePlan ||
                      ""
                    }
                    min={dayjs().add(1, "day").format("YYYY-MM-DD")}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        scheduleDetail: {
                          ...prev.scheduleDetail,
                          OpendatePlan: dateValue,
                        },
                        schedule: {
                          ...prev.schedule,
                          OpendatePlan: dateValue,
                        },
                      }));
                    }}
                    className={errors.scheduleDetailOpendatePlan ? "error" : ""}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                  {errors.scheduleDetailOpendatePlan && (
                    <span className="error-message">
                      {errors.scheduleDetailOpendatePlan}
                    </span>
                  )}
                  {instructorType === "parttime" &&
                    parttimeAvailabilityError && (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "12px",
                          borderRadius: "8px",
                          backgroundColor: "#fef2f2",
                          border: "1px solid #fca5a5",
                          color: "#991b1b",
                          fontSize: "13px",
                        }}
                      >
                        {parttimeAvailabilityError}
                      </div>
                    )}
                  {/* Thông tin các buổi "mất" và "bù thêm" theo diff giữa lịch cũ và preview */}

                  {isEditMode &&
                    !readonly &&
                    impactedSessionMessages.length > 0 && (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "12px",
                          borderRadius: "8px",
                          backgroundColor: "#fff7ed",
                          border: "1px solid #fdba74",
                          color: "#9a3412",
                          fontSize: "13px",
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>
                          Do thay đổi ngày bắt đầu dự kiến các ca sau sẽ phải
                          chọn lại:
                        </div>
                        <ul style={{ paddingLeft: 18, margin: 0 }}>
                          {impactedSessionMessages.map((msg, idx) => (
                            <li key={`impact-step3-${idx}`}>{msg}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>

                {/* Tính năng tìm ngày bắt đầu khác - Đặt phía trên trường chọn ca học */}
                {currentStep === 3 &&
                  hasScheduleCoreInfo &&
                  formData.InstructorID &&
                  formData.schedule?.Numofsession &&
                  Number(formData.schedule.Numofsession) > 0 && (
                    <div
                      style={{
                        margin: "0 0 20px 0",
                        padding: "16px",
                        borderRadius: "8px",
                        backgroundColor: alternativeStartDateSearch.showResults
                          ? "#eef2ff"
                          : "#eff6ff",
                        border: "1px solid #c7d2fe",
                        fontSize: "13px",
                      }}
                    >
                      {!alternativeStartDateSearch.showResults ? (
                        <>
                          <div
                            style={{
                              marginBottom: "8px",
                              fontWeight: 600,
                              color: "#1d4ed8",
                            }}
                          >
                            Tìm ngày bắt đầu khác
                          </div>
                          <div
                            style={{ marginBottom: "12px", color: "#3b82f6" }}
                          >
                            Chọn ngày học và ca học, sau đó tìm ngày bắt đầu phù
                            hợp với các ca đã chọn.
                          </div>
                          <button
                            type="button"
                            onClick={handleSearchAlternativeStartDate}
                            style={{
                              padding: "10px 16px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: "#2563eb",
                              color: "#fff",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            🔍 Tìm ngày bắt đầu khác theo Ca mong muốn
                          </button>
                        </>
                      ) : (
                        <>
                          <div style={{ fontWeight: 600, color: "#312e81" }}>
                            Đang ở chế độ tìm kiếm theo ca mong muốn
                          </div>
                          <p style={{ margin: "8px 0", color: "#4338ca" }}>
                            Bạn có thể chọn các ca học mong muốn để làm tiêu chí
                            tìm ngày mới. Sau khi áp dụng ngày phù hợp.
                          </p>
                          <p style={{ margin: "4px 0", color: "#312e81" }}>
                            Đã chọn{" "}
                            <strong>
                              {(() => {
                                // Tính số ca/tuần từ TimeslotsByDay hiện tại
                                const totalSlotsFromTimeslotsByDay =
                                  Object.values(
                                    formData.scheduleDetail.TimeslotsByDay || {}
                                  ).reduce(
                                    (sum, arr) => sum + (arr?.length || 0),
                                    0
                                  );

                                // Nếu có trong TimeslotsByDay, dùng số đó
                                if (totalSlotsFromTimeslotsByDay > 0) {
                                  return totalSlotsFromTimeslotsByDay;
                                }

                                // Nếu không có trong TimeslotsByDay, tính từ selectedTimeslotIds và DaysOfWeek
                                const daysCount =
                                  formData.scheduleDetail.DaysOfWeek?.length ||
                                  0;
                                const slotsCount = selectedTimeslotIds.size;

                                if (daysCount > 0 && slotsCount > 0) {
                                  return daysCount * slotsCount;
                                }

                                // Nếu chỉ có selectedTimeslotIds mà chưa chọn ngày
                                if (slotsCount > 0) {
                                  return slotsCount;
                                }

                                return 0;
                              })()}{" "}
                              ca/tuần
                            </strong>{" "}
                            để tìm kiếm.
                          </p>
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              flexWrap: "wrap",
                              marginTop: "8px",
                            }}
                          >
                            <button
                              type="button"
                              onClick={handleSearchAlternativeStartDate}
                              disabled={alternativeStartDateSearch.loading}
                              style={{
                                padding: "8px 16px",
                                borderRadius: "6px",
                                border: "none",
                                backgroundColor: "#4c1d95",
                                color: "#fff",
                                fontWeight: 600,
                                cursor: alternativeStartDateSearch.loading
                                  ? "not-allowed"
                                  : "pointer",
                                opacity: alternativeStartDateSearch.loading
                                  ? 0.7
                                  : 1,
                              }}
                            >
                              {alternativeStartDateSearch.loading
                                ? "Đang tìm kiếm..."
                                : "Tìm ngày phù hợp"}
                            </button>
                            {!alternativeStartDateSearch.loading &&
                              alternativeStartDateSearch.suggestions.length >
                                0 &&
                              alternativeStartDateSearch.suggestions[0] && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleApplyAlternativeStartDate(
                                      alternativeStartDateSearch.suggestions[0]
                                        .date
                                    )
                                  }
                                  style={{
                                    padding: "8px 16px",
                                    borderRadius: "6px",
                                    border: "none",
                                    backgroundColor: "#16a34a",
                                    color: "#fff",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  Áp dụng ngày{" "}
                                  {formatDateForDisplay(
                                    alternativeStartDateSearch.suggestions[0]
                                      .date
                                  )}
                                </button>
                              )}
                            <button
                              type="button"
                              onClick={() => {
                                // Reset chế độ tìm kiếm
                                setAlternativeStartDateSearch({
                                  loading: false,
                                  suggestions: [],
                                  error: null,
                                  showResults: false,
                                });
                                // Bỏ chọn tất cả ca học và ngày học
                                setFormData((prev) => ({
                                  ...prev,
                                  scheduleDetail: {
                                    ...prev.scheduleDetail,
                                    DaysOfWeek: [],
                                    TimeslotsByDay: {},
                                  },
                                }));
                                // Reset selectedTimeslotIds
                                setSelectedTimeslotIds(new Set());
                              }}
                              disabled={alternativeStartDateSearch.loading}
                              style={{
                                padding: "8px 16px",
                                borderRadius: "6px",
                                border: "1px solid #cbd5f5",
                                backgroundColor: "#fff",
                                color: "#1e1b4b",
                                fontWeight: 500,
                                cursor: alternativeStartDateSearch.loading
                                  ? "not-allowed"
                                  : "pointer",
                              }}
                            >
                              Thoát chế độ tìm kiếm
                            </button>
                          </div>
                          {alternativeStartDateSearch.error && (
                            <div
                              style={{
                                marginTop: "10px",
                                padding: "8px",
                                borderRadius: "6px",
                                backgroundColor: "#fee2e2",
                                color: "#b91c1c",
                              }}
                            >
                              {alternativeStartDateSearch.error}
                            </div>
                          )}
                          {!alternativeStartDateSearch.loading &&
                            alternativeStartDateSearch.suggestions.length >
                              0 && (
                              <div
                                style={{
                                  marginTop: "10px",
                                  padding: "8px",
                                  borderRadius: "6px",
                                  backgroundColor: "#dcfce7",
                                  color: "#166534",
                                }}
                              >
                                Tìm thấy ngày bắt đầu mới:{" "}
                                <strong>
                                  {formatDateForDisplay(
                                    alternativeStartDateSearch.suggestions[0]
                                      .date
                                  )}
                                </strong>
                                {alternativeStartDateSearch.suggestions[0]
                                  .reason
                                  ? ` – ${alternativeStartDateSearch.suggestions[0].reason}`
                                  : ""}
                              </div>
                            )}
                        </>
                      )}
                    </div>
                  )}

                {/* Logic mới: Cho phép chọn 1 hoặc nhiều ca học */}
                {/* 4 lựa chọn fix cứng: 8-10h, 10-12h, 14-16h, 18-20h */}
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label>
                    Chọn ca học <span className="required">*</span>
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(6, 1fr)",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    {[
                      {
                        start: "08:00:00",
                        end: "10:00:00",
                        label: "8:00 - 10:00",
                      },
                      {
                        start: "10:20:00",
                        end: "12:20:00",
                        label: "10:20 - 12:20",
                      },
                      {
                        start: "13:00:00",
                        end: "15:00:00",
                        label: "13:00 - 15:00",
                      },
                      {
                        start: "15:20:00",
                        end: "17:20:00",
                        label: "15:20 - 17:20",
                      },
                      {
                        start: "17:40:00",
                        end: "19:40:00",
                        label:"17:40 - 19:40",                      
                      },    
{
                        start: "20:00:00",
                        end: "22:00:00",
                        label:"20:00 - 22:00",                      
                      },
                    ].map((timeSlot) => {
                      // Tìm timeslot trong DB có StartTime-EndTime tương ứng
                      const matchingTimeslot = timeslots.find((t) => {
                        const startTime = normalizeTimeString(
                          t.StartTime || t.startTime || ""
                        );
                        const endTime = normalizeTimeString(
                          t.EndTime || t.endTime || ""
                        );
                        return (
                          startTime === normalizeTimeString(timeSlot.start) &&
                          endTime === normalizeTimeString(timeSlot.end)
                        );
                      });

                      const timeslotId = matchingTimeslot
                        ? matchingTimeslot.TimeslotID || matchingTimeslot.id
                        : null;

                      // Kiểm tra xem ca này đã được chọn chưa (từ selectedTimeslotIds hoặc TimeslotsByDay)
                      const isSelected = timeslotId
                        ? selectedTimeslotIds.has(timeslotId) ||
                          Object.values(
                            formData.scheduleDetail.TimeslotsByDay || {}
                          ).some((dayTimeslots) =>
                            dayTimeslots.includes(timeslotId)
                          )
                        : false;

                      return (
                        <button
                          key={`${timeSlot.start}-${timeSlot.end}`}
                          type="button"
                          onClick={() => {
                            if (!matchingTimeslot) {
                              console.warn(
                                `Không tìm thấy timeslot cho ${timeSlot.label}`
                              );
                              return;
                            }

                            const clickedTimeslotId =
                              matchingTimeslot.TimeslotID ||
                              matchingTimeslot.id;

                            // Nếu đang ở chế độ tìm kiếm, clear suggestions và error khi thay đổi lựa chọn
                            if (alternativeStartDateSearch.showResults) {
                              setAlternativeStartDateSearch((prev) => ({
                                ...prev,
                                suggestions: [],
                                error: null,
                              }));
                            }

                            // Toggle: Nếu đã chọn thì bỏ chọn, nếu chưa chọn thì thêm vào
                            setSelectedTimeslotIds((prev) => {
                              const newSet = new Set(prev);
                              if (isSelected) {
                                newSet.delete(clickedTimeslotId);
                              } else {
                                newSet.add(clickedTimeslotId);
                              }
                              return newSet;
                            });

                            setFormData((prev) => {
                              const newTimeslotsByDay = {
                                ...prev.scheduleDetail.TimeslotsByDay,
                              };

                              // Nếu đã chọn, xóa khỏi tất cả các ngày
                              if (isSelected) {
                                Object.keys(newTimeslotsByDay).forEach(
                                  (day) => {
                                    newTimeslotsByDay[day] = newTimeslotsByDay[
                                      day
                                    ].filter((id) => id !== clickedTimeslotId);
                                    // Xóa ngày nếu không còn ca nào
                                    if (newTimeslotsByDay[day].length === 0) {
                                      delete newTimeslotsByDay[day];
                                    }
                                  }
                                );

                                // Xóa khỏi DaysOfWeek nếu ngày đó không còn ca nào
                                // Tính toán selectedTimeslotIds sau khi bỏ chọn
                                const remainingSelectedTimeslots = new Set(
                                  selectedTimeslotIds
                                );
                                remainingSelectedTimeslots.delete(
                                  clickedTimeslotId
                                );

                                // Ở chế độ bình thường, cần check xem còn ca nào khác được chọn cho ngày đó không
                                // Nếu không còn ca nào, bỏ tick ngày
                                const newDaysOfWeek =
                                  prev.scheduleDetail.DaysOfWeek.filter(
                                    (day) => {
                                      // Nếu ngày đó còn ca trong TimeslotsByDay, giữ lại
                                      if (
                                        newTimeslotsByDay[day] &&
                                        newTimeslotsByDay[day].length > 0
                                      ) {
                                        return true;
                                      }

                                      // Ở chế độ tìm kiếm, nếu còn ca nào trong selectedTimeslotIds, giữ lại ngày
                                      if (
                                        alternativeStartDateSearch.showResults &&
                                        remainingSelectedTimeslots.size > 0
                                      ) {
                                        return true;
                                      }

                                      // Ở chế độ bình thường, check xem còn ca nào khác được chọn cho ngày đó không
                                      if (
                                        !alternativeStartDateSearch.showResults &&
                                        remainingSelectedTimeslots.size > 0
                                      ) {
                                        // Tìm timeslot đã bỏ chọn để lấy StartTime-EndTime
                                        const removedTimeslot = timeslots.find(
                                          (t) =>
                                            normalizeTimeslotId(
                                              t.TimeslotID || t.id
                                            ) ===
                                            normalizeTimeslotId(
                                              clickedTimeslotId
                                            )
                                        );

                                        if (removedTimeslot) {
                                          const removedStartTime =
                                            normalizeTimeString(
                                              removedTimeslot.StartTime ||
                                                removedTimeslot.startTime ||
                                                ""
                                            );
                                          const removedEndTime =
                                            normalizeTimeString(
                                              removedTimeslot.EndTime ||
                                                removedTimeslot.endTime ||
                                                ""
                                            );

                                          // Check xem còn ca nào khác (từ remainingSelectedTimeslots) hợp lệ với ngày này không
                                          const dayFormat = dayOfWeekToDay(day);
                                          let hasOtherValidSlot = false;

                                          Array.from(
                                            remainingSelectedTimeslots
                                          ).forEach((otherTimeslotId) => {
                                            if (hasOtherValidSlot) return;

                                            const otherTimeslot =
                                              timeslots.find(
                                                (t) =>
                                                  normalizeTimeslotId(
                                                    t.TimeslotID || t.id
                                                  ) ===
                                                  normalizeTimeslotId(
                                                    otherTimeslotId
                                                  )
                                              );

                                            if (!otherTimeslot) return;

                                            const otherStartTime =
                                              normalizeTimeString(
                                                otherTimeslot.StartTime ||
                                                  otherTimeslot.startTime ||
                                                  ""
                                              );
                                            const otherEndTime =
                                              normalizeTimeString(
                                                otherTimeslot.EndTime ||
                                                  otherTimeslot.endTime ||
                                                  ""
                                              );

                                            // Tìm timeslot cho ngày này có cùng StartTime-EndTime
                                            let dayTimeslot = timeslots.find(
                                              (t) => {
                                                const startTime =
                                                  normalizeTimeString(
                                                    t.StartTime ||
                                                      t.startTime ||
                                                      ""
                                                  );
                                                const endTime =
                                                  normalizeTimeString(
                                                    t.EndTime || t.endTime || ""
                                                  );
                                                const timeslotDay =
                                                  t.Day || t.day;
                                                return (
                                                  startTime ===
                                                    otherStartTime &&
                                                  endTime === otherEndTime &&
                                                  timeslotDay === dayFormat
                                                );
                                              }
                                            );

                                            if (!dayTimeslot) {
                                              dayTimeslot = timeslots.find(
                                                (t) => {
                                                  const startTime =
                                                    normalizeTimeString(
                                                      t.StartTime ||
                                                        t.startTime ||
                                                        ""
                                                    );
                                                  const endTime =
                                                    normalizeTimeString(
                                                      t.EndTime ||
                                                        t.endTime ||
                                                        ""
                                                    );
                                                  const timeslotDay =
                                                    t.Day || t.day;
                                                  return (
                                                    startTime ===
                                                      otherStartTime &&
                                                    endTime === otherEndTime &&
                                                    !timeslotDay
                                                  );
                                                }
                                              );
                                            }

                                            if (dayTimeslot) {
                                              hasOtherValidSlot = true;
                                            }
                                          });

                                          // Nếu còn ca nào khác hợp lệ với ngày này, giữ lại ngày
                                          if (hasOtherValidSlot) {
                                            return true;
                                          }
                                        }
                                      }

                                      // Nếu không còn ca nào, bỏ chọn ngày
                                      return false;
                                    }
                                  );

                                return {
                                  ...prev,
                                  scheduleDetail: {
                                    ...prev.scheduleDetail,
                                    DaysOfWeek: newDaysOfWeek,
                                    TimeslotsByDay: newTimeslotsByDay,
                                  },
                                };
                              } else {
                                // Nếu chưa chọn, thêm vào tất cả các ngày đã chọn
                                // Khi ở chế độ tìm kiếm, nếu chưa chọn ngày nào, không thêm vào TimeslotsByDay
                                // Chỉ thêm vào selectedTimeslotIds để user có thể chọn ngày sau
                                const newDaysOfWeek =
                                  prev.scheduleDetail.DaysOfWeek.length > 0
                                    ? prev.scheduleDetail.DaysOfWeek
                                    : [];

                                // Nếu đang ở chế độ tìm kiếm và chưa chọn ngày, chỉ thêm vào selectedTimeslotIds
                                if (
                                  alternativeStartDateSearch.showResults &&
                                  newDaysOfWeek.length === 0
                                ) {
                                  // Chỉ cập nhật selectedTimeslotIds, không cập nhật TimeslotsByDay
                                  return prev;
                                }

                                // Nếu đã chọn ngày, thêm vào TimeslotsByDay cho các ngày đó
                                // Nhưng cần check xem ca này có bị trùng ở ngày nào không
                                // Nếu có, bỏ tick ngày đó
                                const startDate =
                                  prev.scheduleDetail.OpendatePlan ||
                                  prev.schedule.OpendatePlan ||
                                  "";
                                let endDate = prev.scheduleDetail.EnddatePlan;
                                if (!endDate && startDate) {
                                  const numOfSessions =
                                    prev.schedule?.Numofsession || 12;
                                  const sessionsPerWeekCalc =
                                    newDaysOfWeek.length * 1; // Ước tính
                                  const totalWeeks = Math.ceil(
                                    numOfSessions /
                                      Math.max(sessionsPerWeekCalc, 1)
                                  );
                                  endDate = dayjs(startDate)
                                    .add(totalWeeks, "week")
                                    .format("YYYY-MM-DD");
                                }

                                // Tìm timeslot cho ca vừa thêm
                                const addedTimeslot = timeslots.find(
                                  (t) =>
                                    normalizeTimeslotId(
                                      t.TimeslotID || t.id
                                    ) === normalizeTimeslotId(clickedTimeslotId)
                                );

                                const validDays = [];
                                newDaysOfWeek.forEach((day) => {
                                  // Tìm timeslot cho ngày này có cùng StartTime-EndTime
                                  const dayFormat = dayOfWeekToDay(day);
                                  let dayTimeslotId = null;

                                  if (addedTimeslot) {
                                    const selectedStartTime =
                                      normalizeTimeString(
                                        addedTimeslot.StartTime ||
                                          addedTimeslot.startTime ||
                                          ""
                                      );
                                    const selectedEndTime = normalizeTimeString(
                                      addedTimeslot.EndTime ||
                                        addedTimeslot.endTime ||
                                        ""
                                    );

                                    // Tìm timeslot cho ngày này có cùng StartTime-EndTime
                                    // Ưu tiên tìm timeslot có Day khớp với ngày đó, nếu không có thì tìm timeslot không có Day
                                    // Điều này đảm bảo check conflict dùng đúng timeslotId của ngày đó
                                    let dayTimeslot = timeslots.find((t) => {
                                      const startTime = normalizeTimeString(
                                        t.StartTime || t.startTime || ""
                                      );
                                      const endTime = normalizeTimeString(
                                        t.EndTime || t.endTime || ""
                                      );
                                      const timeslotDay = t.Day || t.day;
                                      // Ưu tiên tìm timeslot có Day khớp với ngày đó
                                      return (
                                        startTime === selectedStartTime &&
                                        endTime === selectedEndTime &&
                                        timeslotDay === dayFormat
                                      );
                                    });

                                    // Nếu không tìm thấy timeslot có Day khớp, tìm timeslot không có Day (có thể dùng cho mọi ngày)
                                    if (!dayTimeslot) {
                                      dayTimeslot = timeslots.find((t) => {
                                        const startTime = normalizeTimeString(
                                          t.StartTime || t.startTime || ""
                                        );
                                        const endTime = normalizeTimeString(
                                          t.EndTime || t.endTime || ""
                                        );
                                        const timeslotDay = t.Day || t.day;
                                        // Tìm timeslot không có Day và có cùng StartTime-EndTime
                                        return (
                                          startTime === selectedStartTime &&
                                          endTime === selectedEndTime &&
                                          !timeslotDay
                                        );
                                      });
                                    }

                                    if (dayTimeslot) {
                                      dayTimeslotId =
                                        dayTimeslot.TimeslotID ||
                                        dayTimeslot.id;
                                    }
                                  }

                                  // Check xem ca này có bị trùng ở ngày này không
                                  if (dayTimeslotId && startDate) {
                                    const slotStatus = getSlotStatus({
                                      dayOfWeek: day,
                                      timeslotId: dayTimeslotId,
                                      startDate,
                                      endDate,
                                    });

                                    // Nếu bị LOCKED, không thêm vào ngày này
                                    if (slotStatus.status === "LOCKED") {
                                      return; // Bỏ qua ngày này
                                    }
                                  }

                                  // Nếu không bị trùng, thêm vào
                                  validDays.push(day);
                                  if (!newTimeslotsByDay[day]) {
                                    newTimeslotsByDay[day] = [];
                                  }
                                  if (
                                    !newTimeslotsByDay[day].includes(
                                      clickedTimeslotId
                                    )
                                  ) {
                                    newTimeslotsByDay[day].push(
                                      clickedTimeslotId
                                    );
                                  }
                                });

                                // Bỏ tick các ngày bị trùng
                                const finalDaysOfWeek =
                                  prev.scheduleDetail.DaysOfWeek.filter((day) =>
                                    validDays.includes(day)
                                  );

                                return {
                                  ...prev,
                                  scheduleDetail: {
                                    ...prev.scheduleDetail,
                                    DaysOfWeek: finalDaysOfWeek,
                                    TimeslotsByDay: newTimeslotsByDay,
                                  },
                                };
                              }
                            });
                          }}
                          disabled={
                            readonly ||
                            !formData.scheduleDetail.OpendatePlan ||
                            !matchingTimeslot
                          }
                          style={{
                            padding: "16px",
                            border: `2px solid ${
                              isSelected ? "#667eea" : "#e2e8f0"
                            }`,
                            borderRadius: "8px",
                            backgroundColor: isSelected ? "#667eea" : "#fff",
                            color: isSelected ? "#fff" : "#1e293b",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor:
                              readonly || !matchingTimeslot
                                ? "not-allowed"
                                : "pointer",
                            opacity: readonly || !matchingTimeslot ? 0.5 : 1,
                            transition: "all 0.2s",
                          }}
                        >
                          {timeSlot.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chọn ngày học trong tuần */}
                {/* Logic cũ: Chọn ngày trước → hiển thị timeslot cho ngày đó */}
                {/* Logic mới: Chọn timeslot trước → chỉ bật các ngày có timeslot giống và không bị trùng */}
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label>
                    Ngày học trong tuần <span className="required">*</span>
                  </label>
                  <div className="days-selector">
                    {daysOfWeekOptions
                      .filter((day) => day.value !== 0) // Bỏ chủ nhật
                      .map((day) => {
                        // Logic mới: Mặc định disable, chỉ enable khi đã chọn ca và ngày đó hợp lệ
                        // Lấy tất cả các timeslot ID đã chọn
                        // Lấy tất cả các timeslot ID đã chọn (từ selectedTimeslotIds và TimeslotsByDay)
                        const allSelectedTimeslotIds = new Set(
                          selectedTimeslotIds
                        );
                        Object.values(
                          formData.scheduleDetail.TimeslotsByDay || {}
                        ).forEach((dayTimeslots) => {
                          dayTimeslots.forEach((timeslotId) => {
                            allSelectedTimeslotIds.add(timeslotId);
                          });
                        });

                        const hasSelectedTimeslots =
                          allSelectedTimeslotIds.size > 0;
                        // Khi đang ở chế độ tìm kiếm (showResults = true), cho phép chọn tất cả các ngày
                        const isInSearchMode =
                          alternativeStartDateSearch.showResults;
                        // Mặc định disable tất cả ngày học khi chưa chọn ca học
                        // Chỉ enable khi đã chọn ca học và ngày đó hợp lệ (có trong availableDaysForTimeslot)
                        const isDisabled =
                          readonly ||
                          (!isInSearchMode && !hasSelectedTimeslots) ||
                          (!isInSearchMode &&
                            hasSelectedTimeslots &&
                            !availableDaysForTimeslot.includes(day.value));
                        const isSelected =
                          formData.scheduleDetail.DaysOfWeek.includes(
                            day.value
                          );

                        return (
                          <button
                            key={day.value}
                            type="button"
                            className={`day-button ${
                              isSelected ? "selected" : ""
                            }`}
                            onClick={() => {
                              // Khi ở chế độ tìm kiếm, chỉ cho phép chọn/bỏ chọn ngày, không tự động thêm ca học
                              const isInSearchMode =
                                alternativeStartDateSearch.showResults;

                              // Nếu đang ở chế độ tìm kiếm, clear suggestions và error khi thay đổi lựa chọn
                              if (isInSearchMode) {
                                setAlternativeStartDateSearch((prev) => ({
                                  ...prev,
                                  suggestions: [],
                                  error: null,
                                }));
                              }

                              if (!isSelected) {
                                // Chọn ngày
                                if (isInSearchMode) {
                                  // Ở chế độ tìm kiếm: chỉ thêm ngày vào DaysOfWeek, không tự động thêm ca học
                                  setFormData((prev) => ({
                                    ...prev,
                                    scheduleDetail: {
                                      ...prev.scheduleDetail,
                                      DaysOfWeek: [
                                        ...prev.scheduleDetail.DaysOfWeek,
                                        day.value,
                                      ],
                                    },
                                  }));
                                } else {
                                  // Ở chế độ bình thường: tự động thêm tất cả các ca đã chọn vào ngày đó
                                  setFormData((prev) => {
                                    const newDaysOfWeek = [
                                      ...prev.scheduleDetail.DaysOfWeek,
                                      day.value,
                                    ];
                                    const newTimeslotsByDay = {
                                      ...prev.scheduleDetail.TimeslotsByDay,
                                    };
                                    if (!newTimeslotsByDay[day.value]) {
                                      newTimeslotsByDay[day.value] = [];
                                    }

                                    // Lấy tất cả các timeslot ID đã chọn từ selectedTimeslotIds và các ngày khác
                                    const allSelectedTimeslotIds = new Set(
                                      selectedTimeslotIds
                                    );
                                    Object.values(
                                      prev.scheduleDetail.TimeslotsByDay || {}
                                    ).forEach((dayTimeslots) => {
                                      dayTimeslots.forEach((timeslotId) => {
                                        allSelectedTimeslotIds.add(timeslotId);
                                      });
                                    });

                                    // Thêm tất cả các ca đã chọn vào ngày mới
                                    Array.from(allSelectedTimeslotIds).forEach(
                                      (timeslotId) => {
                                        const normalizedId =
                                          normalizeTimeslotId(timeslotId);
                                        if (
                                          !newTimeslotsByDay[
                                            day.value
                                          ].includes(normalizedId)
                                        ) {
                                          newTimeslotsByDay[day.value].push(
                                            normalizedId
                                          );
                                        }
                                      }
                                    );

                                    return {
                                      ...prev,
                                      scheduleDetail: {
                                        ...prev.scheduleDetail,
                                        DaysOfWeek: newDaysOfWeek,
                                        TimeslotsByDay: newTimeslotsByDay,
                                      },
                                    };
                                  });
                                }
                              } else {
                                // Bỏ chọn ngày
                                setFormData((prev) => {
                                  const newDaysOfWeek =
                                    prev.scheduleDetail.DaysOfWeek.filter(
                                      (d) => d !== day.value
                                    );
                                  const newTimeslotsByDay = {
                                    ...prev.scheduleDetail.TimeslotsByDay,
                                  };
                                  delete newTimeslotsByDay[day.value];
                                  return {
                                    ...prev,
                                    scheduleDetail: {
                                      ...prev.scheduleDetail,
                                      DaysOfWeek: newDaysOfWeek,
                                      TimeslotsByDay: newTimeslotsByDay,
                                    },
                                  };
                                });
                              }
                            }}
                            disabled={isDisabled}
                            style={{
                              opacity: isDisabled ? 0.5 : 1,
                              cursor: isDisabled ? "not-allowed" : "pointer",
                            }}
                            title={
                              isDisabled && selectedTimeslotId
                                ? "Ngày này không có ca học giống hoặc bị trùng lịch"
                                : ""
                            }
                          >
                            {day.label}
                          </button>
                        );
                      })}
                  </div>
                  {errors.DaysOfWeek && (
                    <span className="error-message">{errors.DaysOfWeek}</span>
                  )}
                  {selectedTimeslotId &&
                    availableDaysForTimeslot.length === 0 && (
                      <div
                        style={{
                          marginTop: "8px",
                          padding: "8px 12px",
                          backgroundColor: "#fef2f2",
                          border: "1px solid #fca5a5",
                          borderRadius: "6px",
                          fontSize: "13px",
                          color: "#991b1b",
                        }}
                      >
                        Không có ngày nào khả dụng cho ca học này. Vui lòng chọn
                        ca học khác.
                      </div>
                    )}
                  {/* Hiển thị số buổi/tuần */}
                  {(() => {
                    // Tính số buổi/tuần từ TimeslotsByDay và DaysOfWeek
                    let calculatedSessionsPerWeek = 0;
                    const selectedDays =
                      formData.scheduleDetail.DaysOfWeek || [];
                    selectedDays.forEach((day) => {
                      const dayTimeslots =
                        formData.scheduleDetail.TimeslotsByDay?.[day] || [];
                      calculatedSessionsPerWeek += dayTimeslots.length;
                    });

                    // Nếu chưa có TimeslotsByDay, tính từ selectedTimeslotIds và DaysOfWeek
                    if (
                      calculatedSessionsPerWeek === 0 &&
                      selectedTimeslotIds.size > 0 &&
                      selectedDays.length > 0
                    ) {
                      calculatedSessionsPerWeek =
                        selectedTimeslotIds.size * selectedDays.length;
                    }

                    const numOfSessions =
                      parseInt(formData.schedule?.Numofsession || "0", 10) || 0;
                    const isExceeding =
                      numOfSessions > 0 &&
                      calculatedSessionsPerWeek > numOfSessions;

                    if (calculatedSessionsPerWeek > 0) {
                      return (
                        <div
                          style={{
                            marginTop: "12px",
                            padding: "10px 12px",
                            backgroundColor: isExceeding
                              ? "#fef2f2"
                              : "#f0f9ff",
                            border: `1px solid ${
                              isExceeding ? "#fca5a5" : "#7dd3fc"
                            }`,
                            borderRadius: "6px",
                            fontSize: "13px",
                            color: isExceeding ? "#991b1b" : "#0c4a6e",
                          }}
                        >
                          <strong>Số buổi học/tuần:</strong>{" "}
                          {calculatedSessionsPerWeek} buổi
                          {numOfSessions > 0 && (
                            <>
                              {" / "}
                              <strong>Tổng số buổi của lớp:</strong>{" "}
                              {numOfSessions} buổi
                            </>
                          )}
                          {isExceeding && (
                            <div
                              style={{
                                marginTop: "6px",
                                color: "#991b1b",
                                fontWeight: 500,
                              }}
                            >
                              ⚠️ Số buổi học/tuần ({calculatedSessionsPerWeek})
                              không được lớn hơn tổng số buổi của lớp (
                              {numOfSessions}). Vui lòng giảm số ca học hoặc số
                              ngày học.
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Nút Tính toán */}
                {(() => {
                  const hasSelectedTimeslots =
                    allSelectedTimeslotIdsMemo.size > 0;
                  const hasSelectedDays =
                    formData.scheduleDetail.DaysOfWeek.length > 0;
                  const hasStartDate = Boolean(scheduleStartDate);
                  // Chỉ cho phép tính toán khi đã có: ngày bắt đầu + ca học + ngày học
                  // Disable khi ở chế độ tìm kiếm ca mong muốn
                  const isInSearchMode = alternativeStartDateSearch.showResults;
                  const canCalculate =
                    !isInSearchMode &&
                    hasSelectedTimeslots &&
                    hasSelectedDays &&
                    hasStartDate;

                  return (
                    <div
                      style={{
                        marginTop: "20px",
                        marginBottom: "20px",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setShouldShowPreview(true);
                        }}
                        disabled={!canCalculate || readonly}
                        style={{
                          padding: "12px 24px",
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "#fff",
                          backgroundColor: canCalculate ? "#667eea" : "#9ca3af",
                          border: "none",
                          borderRadius: "8px",
                          cursor: canCalculate ? "pointer" : "not-allowed",
                          transition: "all 0.2s",
                          boxShadow: canCalculate
                            ? "0 4px 6px rgba(102, 126, 234, 0.3)"
                            : "none",
                        }}
                        onMouseEnter={(e) => {
                          if (canCalculate) {
                            e.target.style.backgroundColor = "#5568d3";
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow =
                              "0 6px 12px rgba(102, 126, 234, 0.4)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (canCalculate) {
                            e.target.style.backgroundColor = "#667eea";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow =
                              "0 4px 6px rgba(102, 126, 234, 0.3)";
                          }
                        }}
                      >
                        {shouldShowPreview ? " Tạo buổi lại" : " Tạo buổi"}
                      </button>
                    </div>
                  );
                })()}

                {currentStep === 3 &&
                  formData.scheduleDetail.DaysOfWeek.length > 0 &&
                  (slotAvailabilityStatus.checking || loadingBlockedDays) && (
                    <div
                      style={{
                        margin: "12px 0",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        backgroundColor: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        color: "#1d4ed8",
                        fontSize: "13px",
                      }}
                    >
                      Hệ thống đang phân tích lịch bận của giảng viên để kiểm
                      tra các ca học khả dụng...
                    </div>
                  )}

                {currentStep === 3 && blockedDaysError && (
                  <div
                    style={{
                      margin: "8px 0",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      backgroundColor: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#b91c1c",
                      fontSize: "13px",
                    }}
                  >
                    {blockedDaysError}
                  </div>
                )}

                {/* CASE 2: Thiếu slot nhưng vẫn còn ô khả dụng */}
                {/* Ẩn khi ở chế độ tìm kiếm ca mong muốn */}
                {hasInsufficientSlots &&
                  !alternativeStartDateSearch.showResults && (
                    <div
                      style={{
                        margin: "12px 0",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        backgroundColor: "#fff7ed",
                        border: "1px solid #fdba74",
                        color: "#9a3412",
                        fontSize: "13px",
                      }}
                    >
                      Hệ thống phát hiện chỉ còn{" "}
                      <strong>{slotAvailabilityStatus.availableSlots}</strong>{" "}
                      ca có thể chọn trong khung thời gian này, cần tối thiểu{" "}
                      <strong>{slotAvailabilityStatus.requiredSlots}</strong>{" "}
                      ca. Vui lòng ưu tiên những ô còn trắng, các ô bị khóa đã
                      vượt giảng viên đã bận ở ca này.
                    </div>
                  )}

                {/* Không dùng cho logic mới - Search mode UI */}
                {/* {shouldShowSearchModeCTA && (
                  <div
                    style={{
                      margin: "12px 0",
                      padding: "16px",
                      borderRadius: "8px",
                      backgroundColor: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      color: "#1d4ed8",
                      fontSize: "13px",
                    }}
                  >
                    <div style={{ marginBottom: "8px", fontWeight: 600 }}>
                      Hệ thống không đủ ca trống cho khung thời gian này.
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      Bật <strong>Chế độ tìm kiếm</strong> để chọn các ca mong
                      muốn (kể cả ô đang bị khóa) và tìm ngày bắt đầu khác phù
                      hợp.
                    </div>
                    <button
                      type="button"
                      onClick={handleEnterSearchMode}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: "#2563eb",
                        color: "#fff",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      🔍 Tìm ngày bắt đầu khác theo Ca mong muốn
                    </button>
                  </div>
                )} */}

                {/* {isSearchMode && (
                  <div
                    style={{
                      margin: "12px 0",
                      padding: "16px",
                      borderRadius: "8px",
                      backgroundColor: "#eef2ff",
                      border: "1px solid #c7d2fe",
                      fontSize: "13px",
                    }}
                  >
                    <div style={{ fontWeight: 600, color: "#312e81" }}>
                      Đang ở chế độ tìm kiếm ca mong muốn
                    </div>
                    <p style={{ margin: "8px 0", color: "#4338ca" }}>
                      Bạn có thể tick cả những ca đang bị khóa để làm tiêu chí
                      tìm ngày mới. Sau khi áp dụng ngày phù hợp, các ca này sẽ
                      được tự động chọn lại.
                    </p>
                    <p style={{ margin: "4px 0", color: "#312e81" }}>
                      Đã chọn{" "}
                      <strong>{searchModeSelectedCount || 0} ca/tuần</strong> để
                      tìm kiếm.
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                        marginTop: "8px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={handleSearchModeSubmit}
                        disabled={searchModeStatus.loading}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "6px",
                          border: "none",
                          backgroundColor: "#4c1d95",
                          color: "#fff",
                          fontWeight: 600,
                          cursor: searchModeStatus.loading
                            ? "not-allowed"
                            : "pointer",
                          opacity: searchModeStatus.loading ? 0.7 : 1,
                        }}
                      >
                        {searchModeStatus.loading
                          ? "Đang tìm kiếm..."
                          : "Tìm ngày phù hợp"}
                      </button>
                      {searchModeStatus.success && (
                        <button
                          type="button"
                          onClick={handleApplySearchModeSuggestion}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: "#16a34a",
                            color: "#fff",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Áp dụng ngày{" "}
                          {formatDateForDisplay(searchModeStatus.date)}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleExitSearchMode}
                        disabled={searchModeStatus.loading}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "6px",
                          border: "1px solid #cbd5f5",
                          backgroundColor: "#fff",
                          color: "#1e1b4b",
                          fontWeight: 500,
                          cursor: searchModeStatus.loading
                            ? "not-allowed"
                            : "pointer",
                        }}
                      >
                        Thoát chế độ tìm kiếm
                      </button>
                    </div>
                    {searchModeStatus.error && (
                      <div
                        style={{
                          marginTop: "10px",
                          padding: "8px",
                          borderRadius: "6px",
                          backgroundColor: "#fee2e2",
                          color: "#b91c1c",
                        }}
                      >
                        {searchModeStatus.error}
                      </div>
                    )}
                    {searchModeStatus.success && (
                      <div
                        style={{
                          marginTop: "10px",
                          padding: "8px",
                          borderRadius: "6px",
                          backgroundColor: "#dcfce7",
                          color: "#166534",
                        }}
                      >
                        Tìm thấy ngày bắt đầu mới:{" "}
                        <strong>
                          {formatDateForDisplay(searchModeStatus.date)}
                        </strong>
                        {searchModeStatus.message
                          ? ` – ${searchModeStatus.message}`
                          : ""}
                      </div>
                    )}
                  </div>
                )}

                {/* Layout 2 cột: Grid bên trái, Preview list bên phải */}
                {/* Logic cũ: Hiển thị grid khi đã chọn ngày học trong tuần */}
                {/* Logic mới: Comment lại grid vì không dùng nữa - Logic ban/disable đã ở phần chọn "Ngày học trong tuần" */}
                {/* Comment lại toàn bộ grid - không dùng cho logic mới */}
                {false &&
                  selectedTimeslotId &&
                  formData.scheduleDetail.DaysOfWeek.length === 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: "20px",
                        marginTop: "20px",
                      }}
                    >
                      {/* Cột Trái: Lưới chọn lịch (Weekly Pattern Grid) */}
                      <div style={{ flex: 1 }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "12px",
                            fontWeight: 600,
                          }}
                        >
                          Chọn ca học <span className="required">*</span>
                        </label>

                        {/* Logic mới: Banner thông báo chốt timeslot cho DRAFT hoặc tạo mới */}
                        {(!classId || isDraftClass) && lockedTimeslotId && (
                          <div
                            style={{
                              padding: "12px 16px",
                              marginBottom: "12px",
                              backgroundColor: "#e0f2fe",
                              border: "1px solid #0ea5e9",
                              borderRadius: "8px",
                              fontSize: "14px",
                              color: "#0369a1",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span style={{ fontSize: "18px" }}>🔒</span>
                            <span>
                              Lớp này đã chốt ca học:{" "}
                              {(() => {
                                const lockedTimeslot = timeslots.find(
                                  (t) =>
                                    normalizeTimeslotId(
                                      t.TimeslotID || t.id
                                    ) === normalizeTimeslotId(lockedTimeslotId)
                                );
                                return lockedTimeslot
                                  ? `${lockedTimeslot.StartTime || ""}-${
                                      lockedTimeslot.EndTime || ""
                                    }`
                                  : lockedTimeslotId;
                              })()}
                              {" - "}Áp dụng cho tất cả các ngày
                            </span>
                          </div>
                        )}

                        {/* Search box cho timeslot - Không dùng cho logic mới */}
                        {/* <input
                        type="text"
                        placeholder="Tìm kiếm ca học..."
                        value={timeslotSearchTerm}
                          onChange={(e) =>
                            setTimeslotSearchTerm(e.target.value)
                          }
                        style={{
                          width: "100%",
                          padding: "10px",
                          marginBottom: "12px",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "14px",
                        }}
                        /> */}

                        {/* Weekly Pattern Grid: Bảng Matrix - Cột = Thứ, Dòng = Ca học */}
                        {/* Logic mới: Chỉ hiển thị khi đã chọn cả ca và ngày VÀ đã nhấn nút tính toán */}
                        {(() => {
                          // Kiểm tra xem đã chọn ca chưa (từ selectedTimeslotIds hoặc TimeslotsByDay)
                          const allSelectedTimeslotIds = new Set(
                            selectedTimeslotIds
                          );
                          Object.values(
                            formData.scheduleDetail.TimeslotsByDay || {}
                          ).forEach((dayTimeslots) => {
                            dayTimeslots.forEach((timeslotId) => {
                              allSelectedTimeslotIds.add(timeslotId);
                            });
                          });
                          const hasSelectedTimeslots =
                            allSelectedTimeslotIds.size > 0;
                          const hasSelectedDays =
                            formData.scheduleDetail.DaysOfWeek.length > 0;

                          return (
                            hasSelectedTimeslots &&
                            hasSelectedDays &&
                            shouldShowPreview
                          );
                        })() ? (
                          <div
                            style={{
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              overflow: "hidden",
                              backgroundColor: "#fff",
                              maxWidth: "100%",
                              overflowX: "auto",
                            }}
                          >
                            {(() => {
                              // Lấy tất cả các timeslot ID đã chọn từ TimeslotsByDay
                              const selectedTimeslotIds = new Set();
                              Object.values(
                                formData.scheduleDetail.TimeslotsByDay || {}
                              ).forEach((dayTimeslots) => {
                                dayTimeslots.forEach((timeslotId) => {
                                  selectedTimeslotIds.add(timeslotId);
                                });
                              });

                              // Tạo danh sách các ca đã chọn với thông tin StartTime-EndTime
                              const selectedTimeslots = Array.from(
                                selectedTimeslotIds
                              )
                                .map((timeslotId) => {
                                  // Tìm timeslot trong DB
                                  const timeslot = timeslots.find(
                                    (t) =>
                                      normalizeTimeslotId(
                                        t.TimeslotID || t.id
                                      ) === normalizeTimeslotId(timeslotId)
                                  );
                                  if (!timeslot) return null;
                                  return {
                                    id: timeslotId,
                                    start:
                                      timeslot.StartTime ||
                                      timeslot.startTime ||
                                      "",
                                    end:
                                      timeslot.EndTime ||
                                      timeslot.endTime ||
                                      "",
                                    label: `${timeslot.StartTime || ""}-${
                                      timeslot.EndTime || ""
                                    }`,
                                  };
                                })
                                .filter(Boolean)
                                .sort((a, b) => {
                                  // Sắp xếp theo StartTime
                                  return (a.start || "").localeCompare(
                                    b.start || ""
                                  );
                                });

                              if (selectedTimeslots.length === 0) {
                                return null;
                              }

                              return (
                                <div key="timeslot-preview-grid">
                                  {/* Header: Các thứ trong tuần */}
                                  <div
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns: `100px repeat(${formData.scheduleDetail.DaysOfWeek.length}, minmax(100px, 1fr))`,
                                      backgroundColor: "#f8fafc",
                                      borderBottom: "2px solid #e2e8f0",
                                      minWidth: "600px",
                                    }}
                                  >
                                    <div
                                      style={{
                                        padding: "12px",
                                        fontWeight: 600,
                                        fontSize: "13px",
                                        textAlign: "center",
                                      }}
                                    >
                                      Ca học
                                    </div>
                                    {formData.scheduleDetail.DaysOfWeek.map(
                                      (dayOfWeek) => {
                                        const dayLabel =
                                          daysOfWeekOptions.find(
                                            (d) => d.value === dayOfWeek
                                          )?.label || "";
                                        return (
                                          <div
                                            key={dayOfWeek}
                                            style={{
                                              padding: "12px",
                                              fontWeight: 600,
                                              fontSize: "13px",
                                              textAlign: "center",
                                              borderLeft: "1px solid #e2e8f0",
                                            }}
                                          >
                                            {dayLabel}
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>

                                  {/* Body: Các ca đã chọn */}
                                  {selectedTimeslots.map(
                                    (selectedSlot, slotIdx) => {
                                      return (
                                        <div
                                          key={slotIdx}
                                          style={{
                                            display: "grid",
                                            gridTemplateColumns: `100px repeat(${formData.scheduleDetail.DaysOfWeek.length}, minmax(100px, 1fr))`,
                                            borderBottom: "1px solid #e2e8f0",
                                            minWidth: "600px",
                                          }}
                                        >
                                          {/* Ca học label */}
                                          <div
                                            style={{
                                              padding: "12px",
                                              fontSize: "13px",
                                              textAlign: "center",
                                              backgroundColor: "#fafafa",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              fontWeight: 600,
                                            }}
                                          >
                                            {selectedSlot.label}
                                          </div>

                                          {/* Các ô cho từng thứ - Chỉ hiển thị preview, không có tick/lock */}
                                          {formData.scheduleDetail.DaysOfWeek.map(
                                            (dayOfWeek) => {
                                              const currentSelection =
                                                formData.scheduleDetail
                                                  .TimeslotsByDay?.[
                                                  dayOfWeek
                                                ] || [];
                                              const isSelected =
                                                currentSelection.includes(
                                                  selectedSlot.id
                                                );

                                              return (
                                                <div
                                                  key={dayOfWeek}
                                                  style={{
                                                    padding: "12px",
                                                    borderLeft:
                                                      "1px solid #e2e8f0",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    backgroundColor: isSelected
                                                      ? "#e0f2fe"
                                                      : "#fafafa",
                                                  }}
                                                >
                                                  {isSelected ? (
                                                    <div
                                                      style={{
                                                        width: "24px",
                                                        height: "24px",
                                                        borderRadius: "50%",
                                                        backgroundColor:
                                                          "#667eea",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                          "center",
                                                        color: "#fff",
                                                        fontSize: "12px",
                                                        fontWeight: 600,
                                                      }}
                                                    >
                                                      ✓
                                                    </div>
                                                  ) : (
                                                    <div
                                                      style={{
                                                        width: "24px",
                                                        height: "24px",
                                                        borderRadius: "50%",
                                                        backgroundColor:
                                                          "#f3f4f6",
                                                      }}
                                                    />
                                                  )}
                                                </div>
                                              );
                                            }
                                          )}
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <div
                            style={{
                              padding: "24px",
                              textAlign: "center",
                              color: "#64748b",
                              fontSize: "14px",
                            }}
                          >
                            {(() => {
                              const allSelectedTimeslotIds = new Set(
                                selectedTimeslotIds
                              );
                              Object.values(
                                formData.scheduleDetail.TimeslotsByDay || {}
                              ).forEach((dayTimeslots) => {
                                dayTimeslots.forEach((timeslotId) => {
                                  allSelectedTimeslotIds.add(timeslotId);
                                });
                              });
                              const hasSelectedTimeslots =
                                allSelectedTimeslotIds.size > 0;
                              const hasSelectedDays =
                                formData.scheduleDetail.DaysOfWeek.length > 0;

                              if (!hasSelectedTimeslots || !hasSelectedDays) {
                                return "Vui lòng chọn ca học và ngày học trong tuần để xem preview";
                              }
                              if (!shouldShowPreview) {
                                return "Vui lòng nhấn nút 'Tính toán' để xem preview bảng ca học và các buổi học dự kiến";
                              }
                              return "Vui lòng chọn ca học và ngày học trong tuần để xem preview";
                            })()}
                          </div>
                        )}

                        {errors.TimeslotsByDay && (
                          <span
                            className="error-message"
                            style={{ display: "block", marginTop: "8px" }}
                          >
                            {errors.TimeslotsByDay}
                          </span>
                        )}

                        {/* Hiển thị error khi không có ca phù hợp hoặc có buổi trùng lịch */}
                        {currentStep === 3 && errors.preview && (
                          <div
                            style={{
                              marginTop: "16px",
                              padding: "12px",
                              borderRadius: "8px",
                              backgroundColor: "#fef2f2",
                              border: "1px solid #fca5a5",
                              fontSize: "13px",
                              color: "#991b1b",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <span>⚠️</span>
                              <span>{errors.preview}</span>
                            </div>
                          </div>
                        )}

                        {/* Hiển thị cảnh báo buổi trùng lịch (Logic mới) */}
                        {hasSelectedSlots && hasDuplicateSessions && (
                          <div
                            style={{
                              marginTop: "16px",
                              padding: "12px",
                              borderRadius: "8px",
                              backgroundColor: "#fef2f2",
                              border: "1px solid #fca5a5",
                              fontSize: "13px",
                              color: "#991b1b",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom:
                                  conflictDetails.length > 0 ? "8px" : "0",
                              }}
                            >
                              <span>
                                <strong>⚠️ Có buổi học trùng lịch</strong>
                              </span>
                            </div>
                            <div
                              style={{
                                marginTop: "8px",
                                fontSize: "12px",
                              }}
                            >
                              Có các buổi học trùng lịch (cùng ngày và cùng ca).
                              Vui lòng chọn lại các ca học để tránh trùng.
                            </div>
                          </div>
                        )}

                        {/* Bảng chi tiết các buổi trùng lịch */}
                        {conflictDetails.length > 0 && (
                          <div
                            style={{
                              marginTop: "16px",
                              padding: "12px",
                              borderRadius: "8px",
                              backgroundColor: "#f8fafc",
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#1e293b",
                                marginBottom: "12px",
                              }}
                            >
                              Chi tiết các buổi trùng lịch (
                              {conflictDetails.length} buổi)
                            </div>
                            <div
                              style={{
                                maxHeight: "300px",
                                overflowY: "auto",
                                border: "1px solid #e2e8f0",
                                borderRadius: "6px",
                              }}
                            >
                              <table
                                style={{
                                  width: "100%",
                                  borderCollapse: "collapse",
                                  fontSize: "12px",
                                }}
                              >
                                <thead>
                                  <tr
                                    style={{
                                      backgroundColor: "#f1f5f9",
                                      borderBottom: "2px solid #e2e8f0",
                                    }}
                                  >
                                    <th
                                      style={{
                                        padding: "8px",
                                        textAlign: "left",
                                        fontWeight: 600,
                                        color: "#475569",
                                      }}
                                    >
                                      Ngày
                                    </th>
                                    <th
                                      style={{
                                        padding: "8px",
                                        textAlign: "left",
                                        fontWeight: 600,
                                        color: "#475569",
                                      }}
                                    >
                                      Thứ
                                    </th>
                                    <th
                                      style={{
                                        padding: "8px",
                                        textAlign: "left",
                                        fontWeight: 600,
                                        color: "#475569",
                                      }}
                                    >
                                      Ca học
                                    </th>
                                    <th
                                      style={{
                                        padding: "8px",
                                        textAlign: "left",
                                        fontWeight: 600,
                                        color: "#475569",
                                      }}
                                    >
                                      Nguồn
                                    </th>
                                    <th
                                      style={{
                                        padding: "8px",
                                        textAlign: "left",
                                        fontWeight: 600,
                                        color: "#475569",
                                      }}
                                    >
                                      Lớp/Session
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {conflictDetails.map((conflict, index) => (
                                    <tr
                                      key={index}
                                      style={{
                                        borderBottom: "1px solid #e2e8f0",
                                        backgroundColor:
                                          index % 2 === 0 ? "#fff" : "#f8fafc",
                                      }}
                                    >
                                      <td
                                        style={{
                                          padding: "8px",
                                          color: "#64748b",
                                        }}
                                      >
                                        {conflict.date === "Định kỳ"
                                          ? "Định kỳ"
                                          : formatDateForDisplay(conflict.date)}
                                      </td>
                                      <td
                                        style={{
                                          padding: "8px",
                                          color: "#64748b",
                                        }}
                                      >
                                        {conflict.dayLabel}
                                      </td>
                                      <td
                                        style={{
                                          padding: "8px",
                                          color: "#1e293b",
                                          fontWeight: 500,
                                        }}
                                      >
                                        {conflict.timeRange || "N/A"}
                                      </td>
                                      <td
                                        style={{
                                          padding: "8px",
                                          color: "#64748b",
                                        }}
                                      >
                                        {conflict.source}
                                      </td>
                                      <td
                                        style={{
                                          padding: "8px",
                                          color: "#64748b",
                                        }}
                                      >
                                        {conflict.className ||
                                          (conflict.sessionId
                                            ? `Session #${conflict.sessionId}`
                                            : "-")}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Cột Phải: Xem trước chi tiết (Session Preview List) */}
                      <div style={{ flex: 1 }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "12px",
                            fontWeight: 600,
                          }}
                        >
                          Xem trước lịch học
                        </label>

                        {/* Ngày kết thúc */}
                        <div
                          className="form-group"
                          style={{ marginBottom: "16px" }}
                        >
                          <label htmlFor="scheduleDetailEnddatePlan">
                            Ngày dự kiến kết thúc{" "}
                            <span className="required">*</span>
                          </label>
                          <input
                            type="date"
                            id="scheduleDetailEnddatePlan"
                            value={formData.scheduleDetail.EnddatePlan || ""}
                            readOnly
                            disabled
                            className={
                              errors.scheduleDetailEnddatePlan ? "error" : ""
                            }
                            style={{
                              width: "100%",
                              padding: "10px",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                              fontSize: "14px",
                              backgroundColor: "#f8fafc",
                              cursor: "not-allowed",
                            }}
                          />
                          {errors.scheduleDetailEnddatePlan && (
                            <span className="error-message">
                              {errors.scheduleDetailEnddatePlan}
                            </span>
                          )}
                          <small
                            style={{
                              color: "#64748b",
                              fontSize: "12px",
                              marginTop: "4px",
                              display: "block",
                            }}
                          >
                            Tự động tính dựa trên số buổi học
                          </small>
                        </div>

                        {/* Session Preview List - CHỈ HIỂN THỊ KHI ĐÃ NHẤN NÚT TÍNH TOÁN */}
                        {shouldShowPreview && (
                          <div
                            style={{
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              padding: "16px",
                              backgroundColor: "#fff",
                              maxHeight: "500px",
                              overflowY: "auto",
                            }}
                          >
                            {previewSessions.length === 0 ? (
                              <div
                                style={{
                                  padding: "20px",
                                  textAlign: "center",
                                  color: "#64748b",
                                  fontSize: "14px",
                                }}
                              >
                                Chưa có lịch học. Vui lòng chọn ca học và ngày
                                học trong tuần, sau đó nhấn nút "Tính toán".
                              </div>
                            ) : (
                              <>
                                <div
                                  style={{
                                    marginBottom: "12px",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                  }}
                                >
                                  Tổng: {previewSessions.length} buổi
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                  }}
                                >
                                  {previewSessions.map((session) => {
                                    const isSkipped =
                                      session.type === "SKIPPED";
                                    const isExtended =
                                      session.type === "EXTENDED";
                                    const dateStr =
                                      session.date.toLocaleDateString("vi-VN");

                                    return (
                                      <div
                                        key={session.number}
                                        style={{
                                          padding: "12px",
                                          borderRadius: "6px",
                                          fontSize: "13px",
                                          backgroundColor: isSkipped
                                            ? "#ffebee" // Màu đỏ nhạt cho SKIPPED
                                            : isExtended
                                            ? "#e8f5e9" // Màu xanh nhạt cho EXTENDED
                                            : "#f8f9fa", // Màu xám nhạt cho NORMAL
                                          border: `1px solid ${
                                            isSkipped
                                              ? "#ef5350"
                                              : isExtended
                                              ? "#66bb6a"
                                              : "#e2e8f0"
                                          }`,
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                          }}
                                        >
                                          <span
                                            style={{
                                              fontSize: "16px",
                                              fontWeight: 600,
                                            }}
                                          >
                                            {isSkipped
                                              ? "🔴"
                                              : isExtended
                                              ? "🟢"
                                              : "⚪"}
                                          </span>
                                          <div style={{ flex: 1 }}>
                                            <div
                                              style={{
                                                fontWeight: 600,
                                                textDecoration: isSkipped
                                                  ? "line-through"
                                                  : "none",
                                                color: isSkipped
                                                  ? "#c62828"
                                                  : "#1e293b",
                                              }}
                                            >
                                              Buổi {session.number}:{" "}
                                              {
                                                daysOfWeekOptions.find(
                                                  (d) =>
                                                    d.value ===
                                                    session.dayOfWeek
                                                )?.label
                                              }{" "}
                                              {dateStr}
                                            </div>
                                            <div
                                              style={{
                                                fontSize: "12px",
                                                color: "#64748b",
                                                marginTop: "4px",
                                              }}
                                            >
                                              {session.timeslot.StartTime ||
                                                session.timeslot.startTime}{" "}
                                              -{" "}
                                              {session.timeslot.EndTime ||
                                                session.timeslot.endTime}
                                              {isSkipped && (
                                                <span
                                                  style={{
                                                    marginLeft: "8px",
                                                    color: "#c62828",
                                                    fontWeight: 500,
                                                  }}
                                                >
                                                  - Nghỉ:{" "}
                                                  {session.reason || "GV bận"}
                                                </span>
                                              )}
                                              {isExtended && (
                                                <span
                                                  style={{
                                                    marginLeft: "8px",
                                                    color: "#2e7d32",
                                                    fontWeight: 500,
                                                  }}
                                                >
                                                  - Thêm lại ca học
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Logic mới: Hiển thị preview list khi đã chọn ca học và ngày học trong tuần VÀ đã nhấn nút tính toán */}
                {(() => {
                  const allSelectedTimeslotIds = new Set(selectedTimeslotIds);
                  Object.values(
                    formData.scheduleDetail.TimeslotsByDay || {}
                  ).forEach((dayTimeslots) => {
                    dayTimeslots.forEach((timeslotId) => {
                      allSelectedTimeslotIds.add(timeslotId);
                    });
                  });
                  const hasSelectedTimeslots = allSelectedTimeslotIds.size > 0;
                  const hasSelectedDays =
                    formData.scheduleDetail.DaysOfWeek.length > 0;

                  return (
                    (selectedTimeslotId || hasSelectedTimeslots) &&
                    hasSelectedDays &&
                    shouldShowPreview && (
                      <div className="form-group" style={{ marginTop: "20px" }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "12px",
                            fontWeight: 600,
                          }}
                        >
                          Xem trước lịch học
                        </label>
                        <div
                          style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            padding: "16px",
                            backgroundColor: "#fff",
                            maxHeight: "400px",
                            overflowY: "auto",
                          }}
                        >
                          {previewSessions.length === 0 ? (
                            <div
                              style={{
                                padding: "20px",
                                textAlign: "center",
                                color: "#64748b",
                                fontSize: "14px",
                              }}
                            >
                              Chưa có lịch học. Vui lòng chọn ca học và ngày học
                              trong tuần.
                            </div>
                          ) : (
                            <>
                              <div
                                style={{
                                  marginBottom: "12px",
                                  fontSize: "14px",
                                  fontWeight: 600,
                                }}
                              >
                                Tổng: {previewSessions.length} buổi
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "8px",
                                }}
                              >
                                {previewSessions.map((session) => {
                                  const isSkipped = session.type === "SKIPPED";
                                  const isExtended =
                                    session.type === "EXTENDED";
                                  const dateStr =
                                    session.date.toLocaleDateString("vi-VN");

                                  return (
                                    <div
                                      key={session.number}
                                      style={{
                                        padding: "12px",
                                        borderRadius: "6px",
                                        fontSize: "13px",
                                        backgroundColor: isSkipped
                                          ? "#ffebee"
                                          : isExtended
                                          ? "#e8f5e9"
                                          : "#f8f9fa",
                                        border: `1px solid ${
                                          isSkipped
                                            ? "#ef5350"
                                            : isExtended
                                            ? "#66bb6a"
                                            : "#e2e8f0"
                                        }`,
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "8px",
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontSize: "16px",
                                            fontWeight: 600,
                                          }}
                                        >
                                          {isSkipped
                                            ? "🔴"
                                            : isExtended
                                            ? "🟢"
                                            : "⚪"}
                                        </span>
                                        <div style={{ flex: 1 }}>
                                          <div
                                            style={{
                                              fontWeight: 600,
                                              textDecoration: isSkipped
                                                ? "line-through"
                                                : "none",
                                              color: isSkipped
                                                ? "#c62828"
                                                : "#1e293b",
                                            }}
                                          >
                                            Buổi {session.number}:{" "}
                                            {
                                              daysOfWeekOptions.find(
                                                (d) =>
                                                  d.value === session.dayOfWeek
                                              )?.label
                                            }{" "}
                                            {dateStr}
                                          </div>
                                          <div
                                            style={{
                                              fontSize: "12px",
                                              color: "#64748b",
                                              marginTop: "4px",
                                            }}
                                          >
                                            {session.timeslot.StartTime ||
                                              session.timeslot.startTime}{" "}
                                            -{" "}
                                            {session.timeslot.EndTime ||
                                              session.timeslot.endTime}
                                            {isSkipped && (
                                              <span
                                                style={{
                                                  marginLeft: "8px",
                                                  color: "#c62828",
                                                  fontWeight: 500,
                                                }}
                                              >
                                                - Nghỉ:{" "}
                                                {session.reason || "GV bận"}
                                              </span>
                                            )}
                                            {isExtended && (
                                              <span
                                                style={{
                                                  marginLeft: "8px",
                                                  color: "#2e7d32",
                                                  fontWeight: 500,
                                                }}
                                              >
                                                - Thêm lại ca học
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  );
                })()}

                {formData.scheduleDetail.DaysOfWeek.length === 0 && (
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      backgroundColor: "#fef3c7",
                      borderRadius: "8px",
                      color: "#92400e",
                    }}
                  >
                    💡 Vui lòng chọn ngày học trong tuần để xem lưới chọn lịch
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="wizard-step-content">
              <div className="review-section">
                <h4>Thông tin lớp:</h4>
                <ul>
                  <li>
                    <strong>Tên:</strong> {formData.Name}
                  </li>
                  <li>
                    <strong>Giảng viên:</strong>{" "}
                    {selectedInstructor
                      ? selectedInstructor.FullName ||
                        selectedInstructor.fullName
                      : "Chưa chọn"}
                  </li>
                  <li>
                    <strong>Khóa/Môn:</strong>{" "}
                    {selectedCourse
                      ? selectedCourse.Title || selectedCourse.title
                      : "Chưa chọn"}
                  </li>
                  <li>
                    <strong>Học phí:</strong>{" "}
                    {formData.Fee && parseFloat(formData.Fee) > 0
                      ? new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(formData.Fee)
                      : "Không có"}
                  </li>
                  <li>
                    <strong>Zoom ID:</strong> {formData.ZoomID || "Chưa có"}
                  </li>
                  <li>
                    <strong>Mật khẩu Zoom:</strong>{" "}
                    {formData.Zoompass || "Chưa có"}
                  </li>
                  <li>
                    <strong>Sĩ số tối đa:</strong>{" "}
                    {formData.Maxstudent || "Chưa có"}
                  </li>
                </ul>

                <h4>Thông tin lịch học:</h4>
                <ul>
                  <li>
                    <strong>Ngày dự kiến bắt đầu:</strong>{" "}
                    {formatDateForDisplay(formData.schedule.OpendatePlan) ||
                      "Chưa có"}
                  </li>
                  <li>
                    <strong>Ngày dự kiến kết thúc:</strong>{" "}
                    {formatDateForDisplay(
                      formData.scheduleDetail.EnddatePlan
                    ) || "Chưa có"}
                  </li>
                  <li>
                    <strong>Tổng số buổi học:</strong>{" "}
                    {formData.schedule.Numofsession || "Chưa có"}
                  </li>
                </ul>

                {/* Thông báo quan trọng về số buổi trùng lịch */}
                {(() => {
                  const skippedSessions = previewSessions.filter(
                    (s) => s.type === "SKIPPED"
                  );
                  const extendedSessions = previewSessions.filter(
                    (s) => s.type === "EXTENDED"
                  );

                  if (skippedSessions.length > 0) {
                    // Tính số ngày trễ hơn dự kiến
                    const originalEndDate = formData.scheduleDetail.EnddatePlan
                      ? dayjs(formData.scheduleDetail.EnddatePlan)
                      : null;
                    const actualEndDate =
                      extendedSessions.length > 0
                        ? dayjs(
                            extendedSessions[extendedSessions.length - 1].date
                          )
                        : originalEndDate;

                    const daysDelayed =
                      originalEndDate && actualEndDate
                        ? actualEndDate.diff(originalEndDate, "day")
                        : 0;

                    return (
                      <div
                        style={{
                          marginTop: "20px",
                          padding: "16px",
                          backgroundColor: "#fff3cd",
                          border: "1px solid #ffc107",
                          borderRadius: "8px",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "16px",
                            marginBottom: "8px",
                            color: "#856404",
                          }}
                        >
                          ⚠️ Thông báo quan trọng
                        </div>
                        <div style={{ fontSize: "14px", color: "#856404" }}>
                          Lớp học sẽ kết thúc trễ hơn dự kiến{" "}
                          <strong>{daysDelayed} ngày</strong> do có{" "}
                          <strong>{skippedSessions.length} buổi</strong> trùng
                          lịch giảng viên (Status='Other' hoặc 'Holiday').
                          {extendedSessions.length > 0 && (
                            <span>
                              {" "}
                              Các buổi thêm lại ca học (
                              {extendedSessions.length} buổi) sẽ được thêm vào
                              cuối lịch học.
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                <h4>Danh sách buổi học:</h4>
                {formData.sessions && formData.sessions.length > 0 ? (
                  <div
                    style={{
                      marginTop: "12px",
                      maxHeight: "320px",
                      overflowY: "auto",
                      paddingRight: "8px",
                    }}
                  >
                    {formData.sessions.map((session, index) => {
                      const timeslot = timeslots.find(
                        (t) => (t.TimeslotID || t.id) === session.TimeslotID
                      );
                      return (
                        <div
                          key={index}
                          style={{
                            padding: "12px",
                            marginBottom: "8px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "6px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                            Buổi {index + 1}: {session.Title}
                          </div>
                          <div style={{ fontSize: "14px", color: "#64748b" }}>
                            <div>
                              Ngày: {formatDateForDisplay(session.Date)}
                            </div>
                            {timeslot && (
                              <div>
                                Ca học:{" "}
                                {timeslot.StartTime || timeslot.startTime} -{" "}
                                {timeslot.EndTime || timeslot.endTime}
                              </div>
                            )}
                            {session.Description && (
                              <div>Mô tả: {session.Description}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: "#64748b", fontStyle: "italic" }}>
                    Chưa có buổi học nào
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="wizard-actions">
          {currentStep > 1 && currentStep < 4 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleBack}
            >
              Quay lại
            </button>
          )}
          {/* Ở bước 2, readonly chỉ hiển thị Quay lại và Hủy */}
          {currentStep === 2 && readonly
            ? null
            : currentStep < 4 && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={
                    (currentStep === 3 &&
                      alternativeStartDateSearch.showResults) || // Disable khi ở chế độ tìm kiếm
                    (currentStep === 3 && !hasValidSelectedSlots) ||
                    (currentStep === 3 && hasDuplicateSessions) ||
                    (currentStep === 3 && hasParttimeAvailabilityIssue) ||
                    (currentStep === 3 && readonly)
                  }
                  style={{
                    opacity:
                      (currentStep === 3 &&
                        (!hasValidSelectedSlots ||
                          hasDuplicateSessions ||
                          hasParttimeAvailabilityIssue)) ||
                      (currentStep === 3 && readonly)
                        ? 0.5
                        : 1,
                    cursor:
                      (currentStep === 3 &&
                        (!hasValidSelectedSlots ||
                          hasDuplicateSessions ||
                          hasParttimeAvailabilityIssue)) ||
                      (currentStep === 3 && readonly)
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Tiếp theo
                </button>
              )}
          {currentStep === 4 && (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleBack}
              >
                Quay lại
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSubmit}
              >
                Lưu nháp
              </button>
            </>
          )}
          <button
            type="button"
            className="btn btn-cancel"
            onClick={() => {
              // Nếu đang edit/xem (có classId), hiện modal gợi ý xem lịch
              if (classId) {
                setCancelModal({ open: true });
              } else {
                // Nếu đang tạo mới, gọi onCancel trực tiếp
                onCancel();
              }
            }}
          >
            Hủy
          </button>
        </div>
      </div>

      {/* Modal gợi ý xem lịch khi nhấn Hủy */}
      {cancelModal.open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
          onClick={() => setCancelModal({ ...cancelModal, open: false })}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontSize: "24px",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              ℹ️
            </div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "12px",
                textAlign: "center",
                color: "#1e40af",
              }}
            >
              Bạn có muốn xem lịch của lớp học này?
            </h3>
            <div
              style={{
                fontSize: "14px",
                color: "#64748b",
                marginBottom: "20px",
                lineHeight: "1.6",
              }}
            >
              <p>
                Bạn có thể chuyển sang màn quản lý lịch để xem chi tiết lịch học
                của lớp này.
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setCancelModal({ ...cancelModal, open: false });
                  // Điều hướng về màn quản lý lớp học
                  onCancel();
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f3f4f6",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#64748b",
                }}
              >
                Không, quay lại
              </button>
              <button
                type="button"
                onClick={() => {
                  setCancelModal({ ...cancelModal, open: false });
                  // Điều hướng sang màn quản lý lịch
                  if (classId) {
                    window.location.href = `/admin/classes/${classId}/schedule`;
                  } else {
                    onCancel();
                  }
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#1e40af",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#fff",
                }}
              >
                Có, xem lịch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận chỉnh sửa ở bước 2 */}
      {confirmEditModal.open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
          onClick={() =>
            setConfirmEditModal({ ...confirmEditModal, open: false })
          }
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "600px",
              width: "90%",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontSize: "24px",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              ✏️
            </div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "12px",
                textAlign: "center",
                color: "#1e40af",
              }}
            >
              Xác nhận chỉnh sửa lớp học
            </h3>
            <div
              style={{
                fontSize: "14px",
                color: "#64748b",
                marginBottom: "20px",
                lineHeight: "1.6",
              }}
            >
              <p>
                Bạn có chắc chắn muốn lưu các thay đổi cho lớp học này không?
              </p>
              {confirmEditModal.sessionsToDelete.length > 0 && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fca5a5",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#dc2626",
                      marginBottom: "8px",
                    }}
                  >
                    ⚠️ Cảnh báo: Các buổi học sau sẽ bị xóa
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#991b1b",
                      marginBottom: "8px",
                    }}
                  >
                    Bạn đã lùi ngày dự kiến bắt đầu, các buổi học trước ngày mới
                    sẽ bị xóa:
                  </div>
                  <div
                    style={{
                      maxHeight: "150px",
                      overflowY: "auto",
                      fontSize: "12px",
                      color: "#991b1b",
                    }}
                  >
                    {confirmEditModal.sessionsToDelete.map((session, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "4px 0",
                          borderBottom: "1px solid #fca5a5",
                        }}
                      >
                        {session.Title || `Buổi ${idx + 1}`} -{" "}
                        {session.Date
                          ? new Date(session.Date).toLocaleDateString("vi-VN")
                          : "N/A"}
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#dc2626",
                    }}
                  >
                    Tổng cộng: {confirmEditModal.sessionsToDelete.length} buổi
                    học
                  </div>
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setConfirmEditModal({ ...confirmEditModal, open: false })
                }
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f3f4f6",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#64748b",
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={async () => {
                  // Đóng modal trước
                  setConfirmEditModal({ ...confirmEditModal, open: false });

                  try {
                    // Xóa các sessions cần xóa trước
                    if (
                      confirmEditModal.sessionsToDelete.length > 0 &&
                      classId
                    ) {
                      const sessionIds = confirmEditModal.sessionsToDelete
                        .map((s) => s.SessionID || s.id)
                        .filter((id) => id);

                      for (const sessionId of sessionIds) {
                        await classService.deleteSession(sessionId);
                      }

                      // Cập nhật formData - xóa sessions khỏi danh sách
                      setFormData((prev) => ({
                        ...prev,
                        sessions: (prev.sessions || []).filter(
                          (s) =>
                            !confirmEditModal.sessionsToDelete.some(
                              (ds) =>
                                (ds.SessionID || ds.id) ===
                                (s.SessionID || s.id)
                            )
                        ),
                      }));

                      // Cập nhật originalStartDate
                      if (formData.schedule.OpendatePlan) {
                        setOriginalStartDate(formData.schedule.OpendatePlan);
                      }
                    }

                    // Set flag để biết đang submit từ bước 2
                    setSubmittingFromStep2(true);

                    // Gọi handleSubmit để lưu thay đổi (async, sẽ đợi trong handleSubmit)
                    await handleSubmit();
                  } catch (error) {
                    console.error("Error in confirm edit:", error);
                    alert("Có lỗi khi lưu thay đổi. Vui lòng thử lại.");
                  }
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#1e40af",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#fff",
                }}
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chuyển hướng sau bước 2 khi đang edit/xem */}
      {redirectModal.open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
          onClick={() => setRedirectModal({ ...redirectModal, open: false })}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontSize: "24px",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              ℹ️
            </div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "12px",
                textAlign: "center",
                color: "#1e40af",
              }}
            >
              Chuyển hướng quản lý lịch
            </h3>
            <div
              style={{
                fontSize: "14px",
                color: "#64748b",
                marginBottom: "20px",
                lineHeight: "1.6",
              }}
            >
              <p>
                Bạn đã hoàn thành bước 1 và bước 2. Để quản lý lịch học chi
                tiết, vui lòng chuyển sang màn quản lý lịch của lớp học này.
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setRedirectModal({ ...redirectModal, open: false })
                }
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f3f4f6",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#64748b",
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setRedirectModal({ ...redirectModal, open: false });
                  if (redirectModal.classId) {
                    window.location.href = `/admin/classes/${redirectModal.classId}/schedule`;
                  }
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#1e40af",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#fff",
                }}
              >
                Chuyển đến quản lý lịch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal cảnh báo xóa sessions khi lùi lịch */}
      {deleteSessionsModal.open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
          onClick={() =>
            setDeleteSessionsModal({ ...deleteSessionsModal, open: false })
          }
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "600px",
              width: "90%",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontSize: "24px",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              ⚠️
            </div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "12px",
                textAlign: "center",
                color: "#dc2626",
              }}
            >
              Cảnh báo: Lùi lịch sẽ xóa các buổi học
            </h3>
            <div
              style={{
                fontSize: "14px",
                color: "#64748b",
                marginBottom: "20px",
                lineHeight: "1.6",
              }}
            >
              <p>
                Bạn đang lùi ngày bắt đầu từ{" "}
                <strong>{formatDateForDisplay(originalStartDate)}</strong> về{" "}
                <strong>
                  {formatDateForDisplay(deleteSessionsModal.newStartDate)}
                </strong>
                .
              </p>
              <p style={{ marginTop: "12px" }}>
                Điều này sẽ xóa{" "}
                <strong style={{ color: "#dc2626" }}>
                  {deleteSessionsModal.sessionsToDelete.length} buổi học
                </strong>{" "}
                có ngày trước ngày bắt đầu mới:
              </p>
              <div
                style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  marginTop: "12px",
                  padding: "12px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "6px",
                }}
              >
                {deleteSessionsModal.sessionsToDelete.map((session, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid #e2e8f0",
                      fontSize: "13px",
                    }}
                  >
                    {session.Title || `Buổi ${index + 1}`} -{" "}
                    {formatDateForDisplay(session.Date)}
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  // Hủy - khôi phục ngày cũ
                  setFormData((prev) => ({
                    ...prev,
                    schedule: {
                      ...prev.schedule,
                      OpendatePlan: originalStartDate,
                    },
                  }));
                  setDeleteSessionsModal({
                    ...deleteSessionsModal,
                    open: false,
                  });
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f3f4f6",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#64748b",
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={async () => {
                  // Xác nhận - xóa các sessions
                  try {
                    const sessionIds = deleteSessionsModal.sessionsToDelete
                      .map((s) => s.SessionID)
                      .filter((id) => id);

                    if (sessionIds.length > 0 && classId) {
                      // Gọi API xóa sessions
                      for (const sessionId of sessionIds) {
                        await classService.deleteSession(sessionId);
                      }
                    }

                    // Cập nhật formData - xóa sessions khỏi danh sách
                    setFormData((prev) => ({
                      ...prev,
                      sessions: prev.sessions.filter(
                        (s) =>
                          !deleteSessionsModal.sessionsToDelete.some(
                            (ds) => ds.SessionID === s.SessionID
                          )
                      ),
                    }));

                    // Cập nhật originalStartDate
                    setOriginalStartDate(deleteSessionsModal.newStartDate);
                    setDeleteSessionsModal({
                      ...deleteSessionsModal,
                      open: false,
                    });
                  } catch (error) {
                    console.error("Error deleting sessions:", error);
                    alert("Có lỗi khi xóa các buổi học. Vui lòng thử lại.");
                  }
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#dc2626",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#fff",
                }}
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassWizard;
