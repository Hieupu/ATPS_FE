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
// Import các Step components
import ClassWizardStep1 from "./ClassWizardStep1";
import ClassWizardStep2 from "./ClassWizardStep2";
import ClassWizardStep3 from "./ClassWizardStep3";
import ClassWizardStep4 from "./ClassWizardStep4";
// Import constants
import {
  weekdayLabelMap,
  formatDateForDisplay,
  getWeekdayLabel,
  parseDisplayDateToISO,
  toISODateString,
  formatTimeRange,
  normalizeTimeString,
  countSelectionSlots,
} from "./ClassWizard.constants";

// Utility functions và constants đã được tách ra ClassWizard.constants.js

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
    applied: false, // Flag để đánh dấu đã áp dụng gợi ý
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

    // Nếu chưa có instructor hoặc instructorType, enable tất cả các ngày (T2-CN: 1-6, 0)
    if (!instructorType) {
      [1, 2, 3, 4, 5, 6, 0].forEach((day) => {
        if (!availableDays.includes(day)) {
          availableDays.push(day);
        }
      });
      setAvailableDaysForTimeslot(availableDays);
      return;
    }

    // Với fulltime, nếu chưa có đủ thông tin (blockedDays, instructorBusySchedule), enable tất cả
    if (
      instructorType === "fulltime" &&
      (!blockedDays || !instructorBusySchedule)
    ) {
      [1, 2, 3, 4, 5, 6, 0].forEach((day) => {
        if (!availableDays.includes(day)) {
          availableDays.push(day);
        }
      });
      setAvailableDaysForTimeslot(availableDays);
      return;
    }

    // Duyệt qua các ngày trong tuần (T2-CN: 1-6, 0)
    [1, 2, 3, 4, 5, 6, 0].forEach((dayOfWeek) => {
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

        // Tìm timeslot trong DB - có thể là ID hoặc string format "08:00-10:00"
        let selectedTimeslot = timeslots.find(
          (t) =>
            normalizeTimeslotId(t.TimeslotID || t.id) ===
            normalizeTimeslotId(selectedTimeslotId)
        );

        // Nếu không tìm thấy bằng ID, có thể selectedTimeslotId là format "08:00-10:00"
        // Tìm bằng StartTime-EndTime
        if (
          !selectedTimeslot &&
          typeof selectedTimeslotId === "string" &&
          selectedTimeslotId.includes("-")
        ) {
          const [startTime, endTime] = selectedTimeslotId.split("-");
          selectedTimeslot = timeslots.find((t) => {
            const tStartTime = normalizeTimeString(
              t.StartTime || t.startTime || ""
            );
            const tEndTime = normalizeTimeString(t.EndTime || t.endTime || "");
            return tStartTime === startTime && tEndTime === endTime;
          });
        }

        if (!selectedTimeslot) {
          // Nếu vẫn không tìm thấy, có thể timeslot chưa được load hoặc format khác
          // Với logic mới: nếu không tìm thấy timeslot cụ thể, vẫn cho phép chọn ngày
          // (vì có thể timeslot sẽ được tạo sau)
          if (!instructorType || instructorType === "fulltime") {
            // Fulltime hoặc chưa chọn instructor → mặc định hợp lệ
            hasValidSlot = true;
          }
          return;
        }

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

        // Nếu không tìm thấy dayTimeslot, vẫn có thể hợp lệ nếu có selectedTimeslot
        // (vì timeslot có thể dùng cho mọi ngày)
        if (!dayTimeslot) {
          dayTimeslot = selectedTimeslot;
        }

        const timeslotId = dayTimeslot.TimeslotID || dayTimeslot.id;

        // Logic mới: Fulltime mặc định rảnh T2-CN (1-6, 0), chỉ check conflict
        if (instructorType === "fulltime") {
          // Fulltime: mặc định hợp lệ cho tất cả các ngày T2-CN
          // Chỉ check conflict nếu có đủ thông tin (startDate, endDate, và các dependencies)
          // Nhưng nếu không có đủ thông tin, vẫn cho phép (vì fulltime mặc định rảnh)
          hasValidSlot = true;

          // Nếu có đủ thông tin, check conflict để chính xác hơn
          if (
            startDate &&
            endDate &&
            blockedDays &&
            instructorBusySchedule &&
            getSlotStatus
          ) {
            try {
              const slotStatus = getSlotStatus({
                dayOfWeek,
                timeslotId,
                startDate,
                endDate,
              });

              // Nếu bị LOCKED, ngày này không hợp lệ
              if (slotStatus && slotStatus.status === "LOCKED") {
                hasValidSlot = false;
              }
            } catch (error) {
              // Nếu có lỗi khi gọi getSlotStatus, mặc định hợp lệ (fallback)
              console.warn(
                "Error calling getSlotStatus in availableDays calculation:",
                error
              );
              // Giữ nguyên hasValidSlot = true
            }
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
          try {
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
          } catch (error) {
            // Nếu có lỗi khi gọi getSlotStatus, mặc định hợp lệ (fallback)
            console.warn("Error calling getSlotStatus:", error);
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
    alternativeStartDateSearch.showResults, // Thêm dependency để reset khi vào/ra chế độ tìm kiếm
    // Không thêm getSlotStatus vào dependencies vì nó được định nghĩa sau useEffect này
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

        // Sắp xếp validTimeslotsForDay theo StartTime để đảm bảo thứ tự đúng
        validTimeslotsForDay.sort((a, b) => {
          const startTimeA =
            a.timeslot?.StartTime || a.timeslot?.startTime || "";
          const startTimeB =
            b.timeslot?.StartTime || b.timeslot?.startTime || "";
          return startTimeA.localeCompare(startTimeB);
        });

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
    let allSessions = [...sessions, ...extendedSessions];

    // Sắp xếp sessions theo thứ tự thời gian: Date trước, sau đó StartTime
    allSessions.sort((a, b) => {
      // So sánh Date trước
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) {
        return dateA - dateB;
      }

      // Nếu cùng ngày, so sánh StartTime
      const startTimeA = a.timeslot?.StartTime || a.timeslot?.startTime || "";
      const startTimeB = b.timeslot?.StartTime || b.timeslot?.startTime || "";
      if (startTimeA && startTimeB) {
        return startTimeA.localeCompare(startTimeB);
      }

      return 0;
    });

    // Đánh số lại sessions sau khi sắp xếp
    allSessions = allSessions.map((session, index) => ({
      ...session,
      number: index + 1,
    }));

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
        // Giữ nguyên DaysOfWeek và TimeslotsByDay khi áp dụng gợi ý
      },
    }));

    // Reset preview sessions khi thay đổi ngày bắt đầu
    setPreviewSessions([]);
    setShouldShowPreview(false);

    // Đóng kết quả tìm kiếm và đánh dấu đã áp dụng
    setAlternativeStartDateSearch({
      loading: false,
      suggestions: [],
      error: null,
      showResults: false,
      applied: true, // Đánh dấu đã áp dụng gợi ý
    });

    // Giữ nguyên DaysOfWeek và TimeslotsByDay khi đã áp dụng gợi ý
  };

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
            <ClassWizardStep1
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              readonly={readonly}
              instructors={instructors}
              filteredInstructors={filteredInstructors}
              instructorSearchTerm={instructorSearchTerm}
              setInstructorSearchTerm={setInstructorSearchTerm}
              instructorDropdownOpen={instructorDropdownOpen}
              setInstructorDropdownOpen={setInstructorDropdownOpen}
              selectedInstructor={selectedInstructor}
              setSelectedInstructor={setSelectedInstructor}
              setInstructorType={setInstructorType}
              setParttimeAvailableSlotKeys={setParttimeAvailableSlotKeys}
              setParttimeAvailableEntriesCount={
                setParttimeAvailableEntriesCount
              }
              setParttimeAvailabilityError={setParttimeAvailabilityError}
              setBlockedDays={setBlockedDays}
              setSelectedTimeslotIds={setSelectedTimeslotIds}
              setAlternativeStartDateSearch={setAlternativeStartDateSearch}
              availableCourses={availableCourses}
              filteredCourses={filteredCourses}
              courseSearchTerm={courseSearchTerm}
              setCourseSearchTerm={setCourseSearchTerm}
              courseDropdownOpen={courseDropdownOpen}
              setCourseDropdownOpen={setCourseDropdownOpen}
              selectedCourse={selectedCourse}
              setSelectedCourse={setSelectedCourse}
              loadingInstructorData={loadingInstructorData}
            />
          )}

          {/* Step 2: Schedule (theo DB schema) */}
          {currentStep === 2 && (
            <ClassWizardStep2
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              readonly={readonly}
              instructorType={instructorType}
              parttimeAvailabilityError={parttimeAvailabilityError}
              isEditMode={isEditMode}
              impactedSessionMessages={impactedSessionMessages}
            />
          )}

          {/* Step 3: Schedule Detail - Layout 2 cột */}
          {/* Disable bước 3 khi readonly */}
          {currentStep === 3 && !readonly && (
            <ClassWizardStep3
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              readonly={readonly}
              timeslots={timeslots}
              daysOfWeekOptions={daysOfWeekOptions}
              availableDaysForTimeslot={availableDaysForTimeslot}
              selectedTimeslotIds={selectedTimeslotIds}
              setSelectedTimeslotIds={setSelectedTimeslotIds}
              alternativeStartDateSearch={alternativeStartDateSearch}
              setAlternativeStartDateSearch={setAlternativeStartDateSearch}
              handleSearchAlternativeStartDate={
                handleSearchAlternativeStartDate
              }
              handleApplyAlternativeStartDate={handleApplyAlternativeStartDate}
              handleDayToggle={handleDayToggle}
              handleTimeslotToggle={handleTimeslotToggle}
              previewSessions={previewSessions}
              setPreviewSessions={setPreviewSessions}
              generatePreviewSessions={generatePreviewSessions}
              blockedDays={blockedDays}
              blockedDaysError={blockedDaysError}
              hasValidSelectedSlots={hasValidSelectedSlots}
              hasDuplicateSessions={hasDuplicateSessions}
              hasParttimeAvailabilityIssue={hasParttimeAvailabilityIssue}
              sessionsPerWeek={sessionsPerWeek}
              requiredSlotsPerWeek={requiredSlotsPerWeek}
              instructorType={instructorType}
              parttimeAvailabilityError={parttimeAvailabilityError}
              isEditMode={isEditMode}
              impactedSessionMessages={impactedSessionMessages}
              scheduleStartDate={scheduleStartDate}
              allSelectedTimeslotIdsMemo={allSelectedTimeslotIdsMemo}
              shouldShowPreview={shouldShowPreview}
              setShouldShowPreview={setShouldShowPreview}
              slotAvailabilityStatus={slotAvailabilityStatus}
              loadingBlockedDays={loadingBlockedDays}
              hasInsufficientSlots={hasInsufficientSlots}
              formatDateForDisplay={formatDateForDisplay}
              normalizeTimeString={normalizeTimeString}
              normalizeTimeslotId={normalizeTimeslotId}
              dayOfWeekToDay={dayOfWeekToDay}
              getSlotStatus={getSlotStatus}
              dayjs={dayjs}
              hasScheduleCoreInfo={hasScheduleCoreInfo}
              selectedTimeslotId={selectedTimeslotId}
              conflictDetails={conflictDetails}
              hasSelectedSlots={hasSelectedSlots}
            />
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <ClassWizardStep4
              formData={formData}
              selectedInstructor={selectedInstructor}
              selectedCourse={selectedCourse}
              previewSessions={previewSessions}
              timeslots={timeslots}
              formatDateForDisplay={formatDateForDisplay}
            />
          )}
        </div>

        {/* Navigation Buttons */}

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
