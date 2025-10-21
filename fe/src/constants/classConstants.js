
export const VALID_CLASS_STATUSES = [
  "Chưa phân giảng viên",
  "Sắp khai giảng",
  "Đang hoạt động",
  "Đã kết thúc",
  "Tạm dừng",
];

// Kiểm tra sĩ số lớp học (không có giới hạn trong database)
export const validateClassCapacity = (currentStudents) => {
  // Database không có giới hạn sĩ số, chỉ thông báo số lượng hiện tại
  return {
    isValid: true,
    message: `Hiện tại có ${currentStudents} học viên`,
  };
};

// Kiểm tra có thể thêm học viên vào lớp không (luôn true vì không có giới hạn)
export const canAddStudentToClass = () => {
  return true; // Không có giới hạn sĩ số trong database
};

// Lấy thông tin sĩ số hiện tại
export const getClassStudentInfo = (currentStudents) => {
  return {
    count: currentStudents,
    message: `${currentStudents} học viên`,
  };
};

// ========== CLASS UTILITIES ==========

// Lấy màu sắc hiển thị cho sĩ số (không có giới hạn)
export const getStudentCountColor = (currentStudents) => {
  // Màu xanh lá cho mọi trường hợp vì không có giới hạn
  return "#44bb44"; // Xanh lá - luôn có thể thêm học viên
};

// Lấy text hiển thị sĩ số
export const getStudentCountText = (currentStudents) => {
  return `${currentStudents} học viên`;
};

// ========== CLASS STATUS UTILITIES ==========

// Kiểm tra lớp có thể thay đổi trạng thái không
export const canChangeClassStatus = (
  currentStatus,
  newStatus,
  hasInstructor = true
) => {
  // Không thể chuyển sang "Đang hoạt động" nếu chưa có giảng viên
  if (newStatus === "Đang hoạt động" && !hasInstructor) {
    return {
      canChange: false,
      message:
        "Không thể chuyển lớp sang trạng thái 'Đang hoạt động' khi chưa có giảng viên",
    };
  }

  // Các chuyển đổi hợp lệ
  const validTransitions = {
    "Chưa phân giảng viên": ["Sắp khai giảng", "Tạm dừng"],
    "Sắp khai giảng": ["Đang hoạt động", "Tạm dừng", "Chưa phân giảng viên"],
    "Đang hoạt động": ["Đã kết thúc", "Tạm dừng"],
    "Đã kết thúc": [], // Không thể chuyển từ "Đã kết thúc"
    "Tạm dừng": ["Sắp khai giảng", "Đang hoạt động", "Chưa phân giảng viên"],
  };

  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    return {
      canChange: false,
      message: `Không thể chuyển từ trạng thái "${currentStatus}" sang "${newStatus}"`,
    };
  }

  return {
    canChange: true,
    message: "Có thể thay đổi trạng thái",
  };
};

// Lấy màu sắc cho trạng thái lớp học
export const getStatusColor = (status) => {
  const statusColors = {
    "Chưa phân giảng viên": "#ff6b6b",
    "Sắp khai giảng": "#4ecdc4",
    "Đang hoạt động": "#45b7d1",
    "Đã kết thúc": "#96ceb4",
    "Tạm dừng": "#feca57",
  };

  return statusColors[status] || "#95a5a6";
};

// ========== DATE UTILITIES ==========

// Lưu ý: StartDate và EndDate của Class sẽ được tính từ Session Timeslots
// Không cần validate ở frontend vì được tính tự động từ database

// Kiểm tra ngày session có hợp lệ không (cho Instructor khi tạo session)
export const validateSessionDate = (sessionDate, isEdit = false) => {
  const today = new Date();
  const session = new Date(sessionDate);

  // Reset time để chỉ so sánh ngày
  today.setHours(0, 0, 0, 0);
  session.setHours(0, 0, 0, 0);

  if (!isEdit && session < today) {
    return {
      isValid: false,
      message: "Không thể tạo session với ngày đã qua",
    };
  }

  return {
    isValid: true,
    message: "Ngày session hợp lệ",
  };
};

// ========== EXPORT ALL CONSTANTS ==========

export default {
  VALID_CLASS_STATUSES,
  validateClassCapacity,
  canAddStudentToClass,
  getClassStudentInfo,
  getStudentCountColor,
  getStudentCountText,
  canChangeClassStatus,
  getStatusColor,
  validateSessionDate,
};
