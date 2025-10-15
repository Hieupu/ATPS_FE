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
};

