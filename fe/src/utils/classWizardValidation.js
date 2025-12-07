/**
 * Class Wizard Validation Utilities
 * Tách validate logic từ ClassWizard component ra file riêng
 */

/**
 * Validate Step 1: Thông tin cơ bản
 * @param {Object} formData - Dữ liệu form
 * @returns {Object} { isValid: boolean, errors: {} }
 */
export const validateStep1 = (formData) => {
  const errors = {};

  if (!formData.Name || !formData.Name.trim()) {
    errors.Name = "Vui lòng nhập tên lớp học";
  } else if (formData.Name.trim().length < 5) {
    errors.Name = "Tên lớp học phải có ít nhất 5 ký tự";
  }

  if (!formData.InstructorID) {
    errors.InstructorID = "Vui lòng chọn giảng viên";
  }

  if (!formData.CourseID) {
    errors.CourseID = "Vui lòng chọn khóa/môn học";
  }

  // Fee is optional, but if provided must be valid
  if (formData.Fee && parseFloat(formData.Fee) < 0) {
    errors.Fee = "Học phí không thể nhỏ hơn 0";
  }

  // Maxstudent is required
  if (!formData.Maxstudent || parseInt(formData.Maxstudent) <= 0) {
    errors.Maxstudent = "Sĩ số tối đa phải lớn hơn 0";
  }

  // ZoomID validation (required)
  if (!formData.ZoomID || !formData.ZoomID.trim()) {
    errors.ZoomID = "Vui lòng nhập Zoom ID";
  } else if (formData.ZoomID.trim().length > 11) {
    errors.ZoomID = "Zoom ID không được quá 11 ký tự";
  }

  // Zoompass validation (required)
  if (!formData.Zoompass || !formData.Zoompass.trim()) {
    errors.Zoompass = "Vui lòng nhập mật khẩu Zoom";
  } else if (formData.Zoompass.trim().length > 6) {
    errors.Zoompass = "Mật khẩu Zoom không được quá 6 ký tự";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Step 2: Kế hoạch
 * @param {Object} formData - Dữ liệu form
 * @returns {Object} { isValid: boolean, errors: {} }
 */
export const validateStep2 = (formData) => {
  const errors = {};

  if (!formData.schedule?.OpendatePlan) {
    errors.OpendatePlan = "Vui lòng chọn ngày dự kiến bắt đầu";
  } else {
    // Kiểm tra ngày phải >= hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.schedule.OpendatePlan);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      errors.OpendatePlan = "Ngày bắt đầu phải từ hôm nay trở đi";
    }
  }

  if (
    !formData.schedule?.Numofsession ||
    parseInt(formData.schedule.Numofsession) <= 0
  ) {
    errors.Numofsession = "Tổng số buổi học phải lớn hơn 0";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Step 3: Xếp lịch
 * @param {Object} formData - Dữ liệu form
 * @param {Array} previewSessions - Danh sách sessions preview
 * @returns {Object} { isValid: boolean, errors: {} }
 */
export const validateStep3 = (formData, previewSessions = []) => {
  console.log("[validateStep3] ========== START ==========");
  console.log("[validateStep3] formData.scheduleDetail:", formData.scheduleDetail);
  console.log("[validateStep3] previewSessions:", previewSessions);
  console.log("[validateStep3] previewSessions.length:", previewSessions?.length || 0);
  console.log("[validateStep3] formData.sessions:", formData.sessions);
  console.log("[validateStep3] formData.sessions.length:", formData.sessions?.length || 0);
  
  const errors = {};

  if (!formData.scheduleDetail?.OpendatePlan) {
    console.log("[validateStep3] ERROR: Missing OpendatePlan");
    errors.scheduleDetailOpendatePlan = "Vui lòng chọn ngày dự kiến bắt đầu";
  }

  if (!formData.scheduleDetail?.EnddatePlan) {
    console.log("[validateStep3] ERROR: Missing EnddatePlan");
    errors.scheduleDetailEnddatePlan =
      "Ngày kết thúc chưa được tính toán. Vui lòng kiểm tra lại thông tin";
  }

  if (
    formData.scheduleDetail?.OpendatePlan &&
    formData.scheduleDetail?.EnddatePlan
  ) {
    const start = new Date(formData.scheduleDetail.OpendatePlan);
    const end = new Date(formData.scheduleDetail.EnddatePlan);
    if (end <= start) {
      console.log("[validateStep3] ERROR: EnddatePlan <= OpendatePlan");
      errors.scheduleDetailEnddatePlan = "Ngày kết thúc phải sau ngày bắt đầu";
    }
  }

  if (
    !formData.scheduleDetail?.DaysOfWeek ||
    formData.scheduleDetail.DaysOfWeek.length === 0
  ) {
    console.log("[validateStep3] ERROR: Missing DaysOfWeek");
    errors.DaysOfWeek = "Vui lòng chọn ít nhất một ngày trong tuần";
  }

  // Kiểm tra TimeslotsByDay: mỗi ngày đã chọn phải có ít nhất 1 ca
  if (
    formData.scheduleDetail?.DaysOfWeek &&
    formData.scheduleDetail.DaysOfWeek.length > 0
  ) {
    let hasAnyTimeslot = false;
    formData.scheduleDetail.DaysOfWeek.forEach((dayOfWeek) => {
      const dayTimeslots =
        formData.scheduleDetail.TimeslotsByDay?.[dayOfWeek] || [];
      if (dayTimeslots.length > 0) {
        hasAnyTimeslot = true;
      }
    });

    if (!hasAnyTimeslot) {
      console.log("[validateStep3] ERROR: No timeslots selected");
      errors.TimeslotsByDay =
        "Vui lòng chọn ít nhất một ca học cho các ngày đã chọn";
    }
  }

  // Logic mới: Nếu có formData.sessions thì dùng nó thay vì previewSessions
  const sessionsToCheck = formData.sessions && formData.sessions.length > 0 
    ? formData.sessions 
    : previewSessions;
  
  console.log("[validateStep3] sessionsToCheck:", sessionsToCheck);
  console.log("[validateStep3] sessionsToCheck.length:", sessionsToCheck?.length || 0);

  if (sessionsToCheck.length === 0) {
    console.log("[validateStep3] ERROR: No sessions found");
    errors.preview =
      "Không có buổi học nào được tạo. Vui lòng kiểm tra lại lịch học";
  }

  console.log("[validateStep3] Final errors:", errors);
  console.log("[validateStep3] isValid:", Object.keys(errors).length === 0);
  console.log("[validateStep3] ========== END ==========");

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate toàn bộ form trước khi submit
 * @param {Object} formData - Dữ liệu form
 * @param {Array} previewSessions - Danh sách sessions preview
 * @returns {Object} { isValid: boolean, errors: {}, message: string }
 */
export const validateForm = (formData, previewSessions = []) => {
  // Validate từng bước
  const step1Result = validateStep1(formData);
  const step2Result = validateStep2(formData);
  const step3Result = validateStep3(formData, previewSessions);

  // Gộp tất cả errors
  const allErrors = {
    ...step1Result.errors,
    ...step2Result.errors,
    ...step3Result.errors,
  };

  // Kiểm tra các trường bắt buộc
  if (!formData.Name || !formData.Name.trim()) {
    return {
      isValid: false,
      errors: { Name: "Tên lớp không được để trống" },
      message: "Tên lớp không được để trống",
    };
  }

  if (!formData.InstructorID) {
    return {
      isValid: false,
      errors: { InstructorID: "Chưa chọn giảng viên" },
      message: "Chưa chọn giảng viên",
    };
  }

  if (!formData.sessions || formData.sessions.length === 0) {
    return {
      isValid: false,
      errors: { preview: "Chưa xếp lịch học" },
      message: "Chưa xếp lịch học",
    };
  }

  // Kiểm tra xem có quá nhiều buổi bị SKIP không (VD: > 50%)
  const skipped = formData.sessions.filter((s) => s.type === "SKIPPED").length;
  if (skipped > formData.sessions.length / 2) {
    return {
      isValid: false,
      errors: {
        preview:
          "Lịch học này trùng quá nhiều ngày bận, vui lòng chọn GV khác.",
      },
      message: "Lịch học này trùng quá nhiều ngày bận, vui lòng chọn GV khác.",
    };
  }

  return {
    isValid: Object.keys(allErrors).length === 0,
    errors: allErrors,
    message: null,
  };
};

/**
 * Validate từng session có đầy đủ thông tin
 * @param {Array} sessions - Danh sách sessions
 * @returns {Object} { isValid: boolean, errors: {} }
 */
export const validateSessions = (sessions) => {
  const errors = {};

  if (!sessions || sessions.length === 0) {
    errors.sessions = "Vui lòng hoàn thành bước 3 để tạo lịch học chi tiết";
    return { isValid: false, errors };
  }

  const invalidSessions = sessions.filter((s) => !s.Date || !s.TimeslotID);

  if (invalidSessions.length > 0) {
    errors.sessions = `Có ${invalidSessions.length} buổi học thiếu thông tin (ngày hoặc ca học). Vui lòng kiểm tra lại.`;
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
};

export default {
  validateStep1,
  validateStep2,
  validateStep3,
  validateForm,
  validateSessions,
};
