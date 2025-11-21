import React, { useState, useEffect, useMemo } from "react";
import { dayOfWeekToDay, getDayFromDate } from "../../../../utils/validate";
import "./ClassWizard.css";
import dayjs from "dayjs";

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

const ClassWizard = ({
  classData,
  onSubmit,
  onCancel,
  instructors = [],
  timeslots = [],
  variant = "modal", // "modal" | "page"
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    Name: "",
    InstructorID: null,
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
  const [selectedTimeslot, setSelectedTimeslot] = useState(null);
  const [previewSessions, setPreviewSessions] = useState([]);
  const [timeslotSearchTerm, setTimeslotSearchTerm] = useState(""); // Search cho timeslot

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

  useEffect(() => {
    if (classData) {
      setFormData({
        Name: classData.Name || classData.title || "",
        InstructorID: classData.InstructorID || classData.instructorId || null,
        Fee: classData.Fee || classData.tuitionFee || "",
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

      // Initialize selectedTimeslots from TimeslotIDs
      if (
        classData.schedule?.TimeslotIDs &&
        classData.schedule.TimeslotIDs.length > 0
      ) {
        const selected = timeslots.filter((t) =>
          classData.schedule.TimeslotIDs.includes(t.TimeslotID || t.id)
        );
        setSelectedTimeslot(selected.length === 1 ? selected[0] : null);
      } else if (classData.schedule?.TimeslotID || classData.timeslotId) {
        const timeslot = timeslots.find(
          (t) =>
            t.TimeslotID ===
              (classData.schedule?.TimeslotID || classData.timeslotId) ||
            t.id === (classData.schedule?.TimeslotID || classData.timeslotId)
        );
        setSelectedTimeslot(timeslot);
      }
    }
  }, [classData, instructors, timeslots]);

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
  // Logic mới: mỗi ngày trong tuần có thể có nhiều ca, lặp lại mỗi tuần
  const generatePreviewSessions = (
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

    while (currentDate <= end && sessionsCreated < maxSessions) {
      const dayOfWeek = currentDate.getDay();

      // Nếu là ngày học trong tuần
      if (daysOfWeek.includes(dayOfWeek)) {
        const dayTimeslotIDs = timeslotsByDay[dayOfWeek] || [];

        // Tạo session cho mỗi ca học trong ngày này
        for (let i = 0; i < dayTimeslotIDs.length; i++) {
          // Kiểm tra xem đã đủ số buổi chưa (chỉ tạo khi chưa đủ)
          if (sessionsCreated >= maxSessions) {
            break; // Dừng vòng lặp for
          }

          const timeslotID = dayTimeslotIDs[i];
          const timeslot = timeslots.find(
            (t) => (t.TimeslotID || t.id) === timeslotID
          );

          if (timeslot) {
            // Validate Date khớp với Day của Timeslot
            const timeslotDay = timeslot.Day || timeslot.day;
            // Format date string đúng cách (YYYY-MM-DD) để tránh timezone issues
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, "0");
            const day = String(currentDate.getDate()).padStart(2, "0");
            const currentDateStr = `${year}-${month}-${day}`;
            const currentDateDay = getDayFromDate(currentDateStr);

            console.log(
              `Checking session: Date ${currentDateStr} (${currentDateDay}) vs Timeslot Day (${timeslotDay}), dayOfWeek: ${dayOfWeek}`
            );

            if (timeslotDay && currentDateDay !== timeslotDay) {
              console.warn(
                `Session ${sessionNumber}: Date ${currentDateStr} (${currentDateDay}) không khớp với Timeslot Day (${timeslotDay}). Bỏ qua session này.`
              );
              // Bỏ qua session này vì Date không khớp với Day của Timeslot
              continue;
            }

            sessions.push({
              number: sessionNumber++,
              date: new Date(currentDate),
              dayOfWeek: dayOfWeek,
              timeslot: timeslot,
            });
            sessionsCreated++;

            // Kiểm tra lại sau khi tạo để đảm bảo không tạo thừa
            if (sessionsCreated >= maxSessions) {
              break;
            }
          }
        }
      }

      // Nếu đã đủ số buổi, dừng luôn
      if (sessionsCreated >= maxSessions) {
        break;
      }

      // Chuyển sang ngày tiếp theo
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setPreviewSessions(sessions);

    // Auto-update sessions in formData
    const sessionData = sessions.map((session, index) => {
      const existingSession = formData.sessions[index] || {};
      const dateISO = toISODateString(session.date);
      const timeslotRef = session.timeslot || {};
      return {
        SessionID: existingSession.SessionID || null,
        Title: existingSession.Title || `Session ${index + 1}`,
        Description: existingSession.Description || "",
        Date: dateISO,
        TimeslotID: timeslotRef.TimeslotID || timeslotRef.id,
        TimeslotDay: timeslotRef.Day || timeslotRef.day || null,
        TimeslotStart: timeslotRef.StartTime || timeslotRef.startTime || null,
        TimeslotEnd: timeslotRef.EndTime || timeslotRef.endTime || null,
      };
    });
    setFormData((prev) => ({ ...prev, sessions: sessionData }));
  };

  // Hàm tính ngày kết thúc tự động
  // Dựa trên: số buổi học, timeslotsByDay (số ca mỗi ngày), ngày bắt đầu, và ngày học trong tuần
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
    let lastSessionDate = new Date(start);
    const maxDate = new Date(start);
    maxDate.setDate(maxDate.getDate() + weeksNeeded * 7 + 7); // Thêm buffer 1 tuần

    // Duyệt qua từng ngày từ ngày bắt đầu
    while (sessionsCreated < totalSessions && currentDate <= maxDate) {
      const dayOfWeek = currentDate.getDay();

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

          // Đếm số timeslots hợp lệ (có Day khớp với currentDateDay)
          let validTimeslotsCount = 0;
          dayTimeslotIDs.forEach((timeslotID) => {
            const timeslot = timeslots.find(
              (t) => (t.TimeslotID || t.id) === timeslotID
            );
            if (timeslot) {
              const timeslotDay = timeslot.Day || timeslot.day;
              if (!timeslotDay || currentDateDay === timeslotDay) {
                validTimeslotsCount++;
              } else {
                console.warn(
                  `calculateEndDate: Date ${currentDateStr} (${currentDateDay}) không khớp với Timeslot Day (${timeslotDay}). Bỏ qua timeslot này.`
                );
              }
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

    // Thêm 1 ngày vào ngày của buổi cuối cùng để có ngày kết thúc
    const endDate = new Date(lastSessionDate);
    endDate.setDate(endDate.getDate() + 1);

    return endDate.toISOString().split("T")[0];
  };

  // Lọc timeslots theo Day cho từng ngày trong tuần
  // Trả về object với key là dayOfWeek, value là array timeslots của ngày đó
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

        // Lọc theo search term nếu có
        if (timeslotSearchTerm) {
          const searchLower = timeslotSearchTerm.toLowerCase();
          dayTimeslots = dayTimeslots.filter((timeslot) => {
            const startTime = (
              timeslot.StartTime ||
              timeslot.startTime ||
              ""
            ).toLowerCase();
            const endTime = (
              timeslot.EndTime ||
              timeslot.endTime ||
              ""
            ).toLowerCase();
            const day = (timeslot.Day || timeslot.day || "").toLowerCase();
            const description = (
              timeslot.Description ||
              timeslot.description ||
              ""
            ).toLowerCase();
            return (
              startTime.includes(searchLower) ||
              endTime.includes(searchLower) ||
              day.includes(searchLower) ||
              description.includes(searchLower)
            );
          });
        }

        result[dayOfWeek] = dayTimeslots;
      });
    }

    return result;
  }, [timeslots, formData.scheduleDetail.DaysOfWeek, timeslotSearchTerm]);

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

  // Update preview when schedule detail changes
  useEffect(() => {
    if (currentStep === 3) {
      generatePreviewSessions(
        formData.scheduleDetail.OpendatePlan || formData.schedule.OpendatePlan,
        formData.scheduleDetail.EnddatePlan,
        formData.scheduleDetail.DaysOfWeek,
        formData.scheduleDetail.TimeslotsByDay,
        formData.schedule.Numofsession
      );
    }
  }, [
    currentStep,
    formData.scheduleDetail.OpendatePlan,
    formData.schedule.OpendatePlan,
    formData.scheduleDetail.EnddatePlan,
    formData.scheduleDetail.DaysOfWeek,
    formData.scheduleDetail.TimeslotsByDay,
    formData.schedule.Numofsession,
    timeslots,
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

  // Validation
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.Name.trim()) {
        newErrors.Name = "Vui lòng nhập tên lớp học";
      } else if (formData.Name.length < 5) {
        newErrors.Name = "Tên lớp học phải có ít nhất 5 ký tự";
      }

      if (!formData.InstructorID) {
        newErrors.InstructorID = "Vui lòng chọn giảng viên";
      }

      // Fee is optional, but if provided must be valid
      if (formData.Fee && parseFloat(formData.Fee) < 0) {
        newErrors.Fee = "Học phí không thể nhỏ hơn 0";
      }

      // Maxstudent is required
      if (!formData.Maxstudent || parseInt(formData.Maxstudent) <= 0) {
        newErrors.Maxstudent = "Sĩ số tối đa phải lớn hơn 0";
      }

      // ZoomID validation (required)
      if (!formData.ZoomID || !formData.ZoomID.trim()) {
        newErrors.ZoomID = "Vui lòng nhập Zoom ID";
      } else if (formData.ZoomID.trim().length > 11) {
        newErrors.ZoomID = "Zoom ID không được quá 11 ký tự";
      }

      // Zoompass validation (required)
      if (!formData.Zoompass || !formData.Zoompass.trim()) {
        newErrors.Zoompass = "Vui lòng nhập mật khẩu Zoom";
      } else if (formData.Zoompass.trim().length > 6) {
        newErrors.Zoompass = "Mật khẩu Zoom không được quá 6 ký tự";
      }
    }

    if (step === 2) {
      if (!formData.schedule.OpendatePlan) {
        newErrors.OpendatePlan = "Vui lòng chọn ngày dự kiến bắt đầu";
      }

      if (
        !formData.schedule.Numofsession ||
        parseInt(formData.schedule.Numofsession) <= 0
      ) {
        newErrors.Numofsession = "Tổng số buổi học phải lớn hơn 0";
      }
    }

    if (step === 3) {
      if (!formData.scheduleDetail.OpendatePlan) {
        newErrors.scheduleDetailOpendatePlan =
          "Vui lòng chọn ngày dự kiến bắt đầu";
      }

      if (!formData.scheduleDetail.EnddatePlan) {
        newErrors.scheduleDetailEnddatePlan =
          "Ngày kết thúc chưa được tính toán. Vui lòng kiểm tra lại thông tin";
      }

      if (
        formData.scheduleDetail.OpendatePlan &&
        formData.scheduleDetail.EnddatePlan
      ) {
        const start = new Date(formData.scheduleDetail.OpendatePlan);
        const end = new Date(formData.scheduleDetail.EnddatePlan);
        if (end <= start) {
          newErrors.scheduleDetailEnddatePlan =
            "Ngày kết thúc phải sau ngày bắt đầu";
        }
      }

      if (formData.scheduleDetail.DaysOfWeek.length === 0) {
        newErrors.DaysOfWeek = "Vui lòng chọn ít nhất một ngày trong tuần";
      }

      // Kiểm tra TimeslotsByDay: mỗi ngày đã chọn phải có ít nhất 1 ca
      if (formData.scheduleDetail.DaysOfWeek.length > 0) {
        let hasAnyTimeslot = false;
        formData.scheduleDetail.DaysOfWeek.forEach((dayOfWeek) => {
          const dayTimeslots =
            formData.scheduleDetail.TimeslotsByDay?.[dayOfWeek] || [];
          if (dayTimeslots.length > 0) {
            hasAnyTimeslot = true;
          }
        });

        if (!hasAnyTimeslot) {
          newErrors.TimeslotsByDay =
            "Vui lòng chọn ít nhất một ca học cho các ngày đã chọn";
        }
      }

      if (previewSessions.length === 0) {
        newErrors.preview =
          "Không có buổi học nào được tạo. Vui lòng kiểm tra lại lịch học";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    // Bắt buộc phải hoàn thành cả 3 bước khi lưu nháp
    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);
    const step3Valid = validateStep(3);

    if (!step1Valid || !step2Valid || !step3Valid) {
      // Nếu chưa hoàn thành bước 3, chuyển đến bước 3 để người dùng hoàn thành
      if (!step3Valid && currentStep < 3) {
        setCurrentStep(3);
      }
      return;
    }

    // Đảm bảo có sessions trước khi submit
    if (!formData.sessions || formData.sessions.length === 0) {
      setErrors({
        preview: "Vui lòng hoàn thành bước 3 để tạo lịch học chi tiết",
      });
      setCurrentStep(3);
      return;
    }

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

    const submitData = {
      Name: formData.Name,
      InstructorID: formData.InstructorID,
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
      // Trường cũ (backward compatibility - sẽ bỏ khi backend cập nhật)
      StartDate: formData.schedule.OpendatePlan,
      ExpectedSessions: parseInt(formData.schedule.Numofsession),
      MaxLearners: parseInt(formData.Maxstudent),
      Status: "DRAFT",
      // Luôn gửi sessions khi lưu nháp - với đầy đủ thông tin bao gồm InstructorID
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
            Title: session.Title || `Session ${index + 1}`,
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

    onSubmit(submitData);
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
  const handleTimeslotToggle = (dayOfWeek, timeslotId) => {
    const currentDayTimeslots =
      formData.scheduleDetail.TimeslotsByDay?.[dayOfWeek] || [];
    const isSelected = currentDayTimeslots.includes(timeslotId);

    const newDayTimeslots = isSelected
      ? currentDayTimeslots.filter((id) => id !== timeslotId)
      : [...currentDayTimeslots, timeslotId];

    setFormData({
      ...formData,
      scheduleDetail: {
        ...formData.scheduleDetail,
        TimeslotsByDay: {
          ...formData.scheduleDetail.TimeslotsByDay,
          [dayOfWeek]: newDayTimeslots,
        },
      },
    });
  };

  return (
    <div
      className={
        variant === "modal" ? "class-wizard-overlay" : "class-wizard-page"
      }
    >
      <div className="class-wizard-container">
        <div className="wizard-header">
          <h2>{classData ? "Chỉnh sửa lớp học" : "Tạo lớp học mới"}</h2>
          {variant === "modal" && (
            <button className="close-btn" onClick={onCancel} title="Đóng">
              ×
            </button>
          )}
        </div>

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
            }`}
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
              <h3>Bước 1/4: Thông tin cơ bản</h3>

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
                />
                {errors.Name && (
                  <span className="error-message">{errors.Name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="InstructorID">
                  Giảng viên <span className="required">*</span>
                </label>
                <select
                  id="InstructorID"
                  value={formData.InstructorID || ""}
                  onChange={(e) => {
                    const value = e.target.value
                      ? parseInt(e.target.value)
                      : null;
                    setFormData({ ...formData, InstructorID: value });
                    const instructor = instructors.find(
                      (i) => (i.InstructorID || i.id) === value
                    );
                    setSelectedInstructor(instructor);
                  }}
                  className={errors.InstructorID ? "error" : ""}
                >
                  <option value="">-- Chọn giảng viên --</option>
                  {instructors.map((instructor) => (
                    <option
                      key={instructor.InstructorID || instructor.id}
                      value={instructor.InstructorID || instructor.id}
                    >
                      {instructor.FullName || instructor.fullName} -{" "}
                      {instructor.Major || instructor.major}
                    </option>
                  ))}
                </select>
                {errors.InstructorID && (
                  <span className="error-message">{errors.InstructorID}</span>
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
              <h3>Bước 2/4: Thông tin lịch học</h3>

              <div className="schedule-section">
                <div className="form-group">
                  <label htmlFor="OpendatePlan">
                    Ngày dự kiến bắt đầu <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="dd/mm/yyyy"
                    id="OpendatePlan"
                    value={dateInputs.scheduleStart}
                    onChange={(e) =>
                      handleDateInputChange(
                        "schedule",
                        "OpendatePlan",
                        "scheduleStart",
                        e.target.value
                      )
                    }
                    className={errors.OpendatePlan ? "error" : ""}
                  />
                  {errors.OpendatePlan && (
                    <span className="error-message">{errors.OpendatePlan}</span>
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
                  />
                  {errors.Numofsession && (
                    <span className="error-message">{errors.Numofsession}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Schedule Detail */}
          {currentStep === 3 && (
            <div className="wizard-step-content">
              <h3>Bước 3/4: Lịch học chi tiết</h3>

              <div className="schedule-section">
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label htmlFor="scheduleDetailOpendatePlan">
                    Ngày dự kiến bắt đầu <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="dd/mm/yyyy"
                    id="scheduleDetailOpendatePlan"
                    value={dateInputs.scheduleDetailStart}
                    onChange={(e) =>
                      handleDateInputChange(
                        "scheduleDetail",
                        "OpendatePlan",
                        "scheduleDetailStart",
                        e.target.value
                      )
                    }
                    className={errors.scheduleDetailOpendatePlan ? "error" : ""}
                  />
                  {errors.scheduleDetailOpendatePlan && (
                    <span className="error-message">
                      {errors.scheduleDetailOpendatePlan}
                    </span>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label>
                    Ngày học trong tuần <span className="required">*</span>
                  </label>
                  <div className="days-selector">
                    {daysOfWeekOptions.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        className={`day-button ${
                          formData.scheduleDetail.DaysOfWeek.includes(day.value)
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => handleDayToggle(day.value)}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  {errors.DaysOfWeek && (
                    <span className="error-message">{errors.DaysOfWeek}</span>
                  )}
                </div>

                {/* Hiển thị số ca học mỗi tuần (tự động tính) - chỉ hiển thị thông tin */}
                {formData.scheduleDetail.DaysOfWeek.length > 0 && (
                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label>Thông tin lịch học</label>
                    <div
                      style={{
                        padding: "12px",
                        backgroundColor: "#f0f4ff",
                        borderRadius: "8px",
                        fontSize: "14px",
                      }}
                    >
                      <div style={{ marginBottom: "4px" }}>
                        <strong>Số ca học mỗi tuần:</strong>{" "}
                        {(() => {
                          let totalSessions = 0;
                          formData.scheduleDetail.DaysOfWeek.forEach(
                            (dayOfWeek) => {
                              const dayTimeslots =
                                formData.scheduleDetail.TimeslotsByDay?.[
                                  dayOfWeek
                                ] || [];
                              totalSessions += dayTimeslots.length;
                            }
                          );
                          return totalSessions || 0;
                        })()}{" "}
                        ca/tuần
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        Tổng số buổi học: {formData.schedule.Numofsession || 0}{" "}
                        buổi
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label>
                    Chọn ca học cho từng ngày{" "}
                    <span className="required">*</span>
                  </label>

                  {/* Search box cho timeslot */}
                  <input
                    type="text"
                    placeholder="Tìm kiếm ca học (thời gian, ngày, mô tả)..."
                    value={timeslotSearchTerm}
                    onChange={(e) => setTimeslotSearchTerm(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginBottom: "12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  />

                  {formData.scheduleDetail.DaysOfWeek.length === 0 && (
                    <div
                      style={{
                        padding: "12px",
                        backgroundColor: "#fef3c7",
                        borderRadius: "8px",
                        marginBottom: "12px",
                        fontSize: "14px",
                        color: "#92400e",
                      }}
                    >
                      💡 Vui lòng chọn ngày học trong tuần trước để xem các ca
                      học phù hợp
                    </div>
                  )}

                  {/* Hiển thị ca học theo cột (mỗi cột là một ngày) */}
                  {formData.scheduleDetail.DaysOfWeek.length > 0 && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${formData.scheduleDetail.DaysOfWeek.length}, 1fr)`,
                        gap: "16px",
                        marginTop: "12px",
                      }}
                    >
                      {formData.scheduleDetail.DaysOfWeek.map((dayOfWeek) => {
                        const dayLabel =
                          daysOfWeekOptions.find((d) => d.value === dayOfWeek)
                            ?.label || `Thứ ${dayOfWeek + 2}`;
                        const dayTimeslots =
                          timeslotsByDayOfWeek[dayOfWeek] || [];
                        const selectedTimeslotIds =
                          formData.scheduleDetail.TimeslotsByDay?.[dayOfWeek] ||
                          [];

                        return (
                          <div
                            key={dayOfWeek}
                            style={{
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              padding: "12px",
                              backgroundColor: "#fff",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: "14px",
                                marginBottom: "12px",
                                color: "#1e293b",
                                textAlign: "center",
                                paddingBottom: "8px",
                                borderBottom: "2px solid #e2e8f0",
                              }}
                            >
                              {dayLabel}
                            </div>
                            {dayTimeslots.length === 0 ? (
                              <div
                                style={{
                                  padding: "12px",
                                  textAlign: "center",
                                  color: "#64748b",
                                  fontSize: "12px",
                                }}
                              >
                                {timeslotSearchTerm
                                  ? "Không tìm thấy ca học"
                                  : "Không có ca học cho ngày này"}
                              </div>
                            ) : (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "8px",
                                }}
                              >
                                {dayTimeslots.map((timeslot) => {
                                  const timeslotId =
                                    timeslot.TimeslotID || timeslot.id;
                                  const isSelected =
                                    selectedTimeslotIds.includes(timeslotId);
                                  return (
                                    <label
                                      key={timeslotId}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "10px",
                                        border: `2px solid ${
                                          isSelected ? "#667eea" : "#e2e8f0"
                                        }`,
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        backgroundColor: isSelected
                                          ? "#f0f4ff"
                                          : "#fff",
                                        transition: "all 0.2s",
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() =>
                                          handleTimeslotToggle(
                                            dayOfWeek,
                                            timeslotId
                                          )
                                        }
                                        style={{
                                          marginRight: "8px",
                                          width: "16px",
                                          height: "16px",
                                          cursor: "pointer",
                                        }}
                                      />
                                      <div
                                        style={{ flex: 1, fontSize: "13px" }}
                                      >
                                        <div style={{ fontWeight: 600 }}>
                                          {timeslot.StartTime ||
                                            timeslot.startTime}{" "}
                                          -{" "}
                                          {timeslot.EndTime || timeslot.endTime}
                                        </div>
                                        {timeslot.Description && (
                                          <div
                                            style={{
                                              fontSize: "11px",
                                              color: "#64748b",
                                              marginTop: "2px",
                                            }}
                                          >
                                            {timeslot.Description}
                                          </div>
                                        )}
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
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
                </div>

                {/* Ngày kết thúc - đặt ở cuối */}
                <div
                  className="form-group"
                  style={{ marginTop: "30px", marginBottom: "20px" }}
                >
                  <label htmlFor="scheduleDetailEnddatePlan">
                    Ngày dự kiến kết thúc <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="dd/mm/yyyy"
                    id="scheduleDetailEnddatePlan"
                    value={dateInputs.scheduleDetailEnd}
                    readOnly
                    disabled
                    className={errors.scheduleDetailEnddatePlan ? "error" : ""}
                    style={{
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
                    Ngày kết thúc được tính tự động dựa trên số buổi học (
                    {formData.schedule.Numofsession || 0} buổi), số ca học mỗi
                    tuần (tổng số ca đã chọn cho các ngày), và ngày bắt đầu.
                  </small>
                </div>

                {/* Preview Sessions Info */}
                {(() => {
                  // Tính tổng số ca đã chọn
                  let totalSelectedTimeslots = 0;
                  formData.scheduleDetail.DaysOfWeek.forEach((dayOfWeek) => {
                    const dayTimeslots =
                      formData.scheduleDetail.TimeslotsByDay?.[dayOfWeek] || [];
                    totalSelectedTimeslots += dayTimeslots.length;
                  });
                  return (
                    totalSelectedTimeslots > 0 &&
                    formData.scheduleDetail.DaysOfWeek.length > 0
                  );
                })() && (
                  <div
                    className="timeslot-info"
                    style={{
                      padding: "16px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    <strong>Thông tin lịch học:</strong>
                    <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                      <li>
                        Ca học đã chọn theo ngày:
                        <ul style={{ marginTop: "4px", paddingLeft: "20px" }}>
                          {formData.scheduleDetail.DaysOfWeek.map(
                            (dayOfWeek) => {
                              const dayLabel = daysOfWeekOptions.find(
                                (opt) => opt.value === dayOfWeek
                              )?.label;
                              const dayTimeslotIds =
                                formData.scheduleDetail.TimeslotsByDay?.[
                                  dayOfWeek
                                ] || [];
                              if (dayTimeslotIds.length === 0) return null;

                              const dayTimeslots = dayTimeslotIds
                                .map((id) => {
                                  const timeslot = timeslots.find(
                                    (t) => (t.TimeslotID || t.id) === id
                                  );
                                  return timeslot
                                    ? `${
                                        timeslot.StartTime || timeslot.startTime
                                      } - ${
                                        timeslot.EndTime || timeslot.endTime
                                      }`
                                    : null;
                                })
                                .filter(Boolean);

                              return (
                                <li key={dayOfWeek}>
                                  <strong>{dayLabel}:</strong>{" "}
                                  {dayTimeslots.join(", ")}
                                </li>
                              );
                            }
                          )}
                        </ul>
                      </li>
                      <li>
                        Ngày học trong tuần:{" "}
                        {formData.scheduleDetail.DaysOfWeek.map(
                          (d) =>
                            daysOfWeekOptions.find((opt) => opt.value === d)
                              ?.label
                        ).join(", ")}
                      </li>
                      <li>Tổng số buổi: {previewSessions.length} buổi</li>
                    </ul>
                  </div>
                )}

                {/* Preview Sessions List */}
                {previewSessions.length > 0 && (
                  <div
                    className="preview-sessions"
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "16px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: "16px",
                        fontWeight: 600,
                      }}
                    >
                      Lịch học sẽ được tạo: ({previewSessions.length} buổi)
                    </h4>
                    <div
                      className="sessions-list"
                      style={{ maxHeight: "300px", overflowY: "auto" }}
                    >
                      {previewSessions.slice(0, 20).map((session) => (
                        <div
                          key={session.number}
                          className="session-preview"
                          style={{
                            padding: "8px 12px",
                            marginBottom: "4px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "4px",
                            fontSize: "14px",
                          }}
                        >
                          • Buổi {session.number}:{" "}
                          {
                            daysOfWeekOptions.find(
                              (d) => d.value === session.dayOfWeek
                            )?.label
                          }
                          , {session.date.toLocaleDateString("vi-VN")}:{" "}
                          {session.timeslot.StartTime ||
                            session.timeslot.startTime}{" "}
                          -{" "}
                          {session.timeslot.EndTime || session.timeslot.endTime}
                        </div>
                      ))}
                      {previewSessions.length > 20 && (
                        <div
                          className="session-preview"
                          style={{
                            padding: "8px 12px",
                            color: "#64748b",
                            fontStyle: "italic",
                          }}
                        >
                          ... và {previewSessions.length - 20} buổi nữa
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {errors.preview && (
                  <div
                    style={{
                      color: "#dc3545",
                      fontSize: "14px",
                      marginTop: "8px",
                      textAlign: "center",
                    }}
                  >
                    {errors.preview}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="wizard-step-content">
              <h3>Bước 4/4: Xem lại</h3>

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
          {currentStep < 4 && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
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
          <button type="button" className="btn btn-cancel" onClick={onCancel}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassWizard;
