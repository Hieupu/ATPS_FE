/**
 * Class Status Constants - Database Version 5
 * 
 * Trạng thái Quản trị (Admin & Giảng viên):
 * - DRAFT: Nháp (admin tạo lớp)
 * - WAITING: Admin gửi lớp cho instructor (chờ instructor xem xét)
 * - PENDING: Instructor gửi lại cho admin (chờ admin duyệt)
 * - APPROVED: Đã duyệt
 * 
 * Trạng thái Công khai (Public & Học viên):
 * - ACTIVE: Đang tuyển sinh (thay thế OPEN)
 * - ON_GOING: Đang diễn ra
 * 
 * Trạng thái Kết thúc:
 * - CLOSE: Đã kết thúc (thay thế CLOSED)
 * - CANCEL: Đã hủy (thay thế CANCELLED)
 */

export const CLASS_STATUS = {
  // Trạng thái Quản trị
  DRAFT: "DRAFT",
  WAITING: "WAITING",
  PENDING: "PENDING",
  PENDING_APPROVAL: "PENDING", // Alias cho PENDING (backward compatibility)
  APPROVED: "APPROVED",
  
  // Trạng thái Công khai
  ACTIVE: "ACTIVE",
  OPEN: "ACTIVE", // Alias cho ACTIVE (backward compatibility)
  PUBLISHED: "ACTIVE", // Alias cho ACTIVE (backward compatibility)
  ON_GOING: "ON_GOING",
  
  // Trạng thái Kết thúc
  CLOSE: "CLOSE",
  CLOSED: "CLOSE", // Alias cho CLOSE (backward compatibility)
  DONE: "CLOSE", // Alias cho CLOSE
  COMPLETED: "CLOSE", // Alias cho CLOSE
  CANCEL: "CANCEL",
  CANCELLED: "CANCEL", // Alias cho CANCEL (backward compatibility)
};

/**
 * Status Labels (Tiếng Việt)
 */
export const CLASS_STATUS_LABELS = {
  [CLASS_STATUS.DRAFT]: "Nháp",
  [CLASS_STATUS.WAITING]: "Chờ giảng viên",
  [CLASS_STATUS.PENDING]: "Chờ duyệt",
  [CLASS_STATUS.APPROVED]: "Đã duyệt",
  [CLASS_STATUS.ACTIVE]: "Đang tuyển sinh",
  [CLASS_STATUS.ON_GOING]: "Đang diễn ra",
  [CLASS_STATUS.CLOSE]: "Đã kết thúc",
  [CLASS_STATUS.CANCEL]: "Đã hủy",
};

/**
 * Status Colors (cho UI)
 */
export const CLASS_STATUS_COLORS = {
  [CLASS_STATUS.DRAFT]: {
    color: "#f59e0b",
    bgColor: "#fffbeb",
    label: "Nháp",
  },
  [CLASS_STATUS.WAITING]: {
    color: "#06b6d4",
    bgColor: "#f0fdfa",
    label: "Chờ giảng viên",
  },
  [CLASS_STATUS.PENDING]: {
    color: "#3b82f6",
    bgColor: "#eff6ff",
    label: "Chờ duyệt",
  },
  [CLASS_STATUS.APPROVED]: {
    color: "#10b981",
    bgColor: "#f0fdf4",
    label: "Đã duyệt",
  },
  [CLASS_STATUS.ACTIVE]: {
    color: "#3b82f6",
    bgColor: "#eff6ff",
    label: "Đang tuyển sinh",
  },
  [CLASS_STATUS.ON_GOING]: {
    color: "#8b5cf6",
    bgColor: "#faf5ff",
    label: "Đang diễn ra",
  },
  [CLASS_STATUS.CLOSE]: {
    color: "#6b7280",
    bgColor: "#f9fafb",
    label: "Đã kết thúc",
  },
  [CLASS_STATUS.CANCEL]: {
    color: "#ef4444",
    bgColor: "#fef2f2",
    label: "Đã hủy",
  },
};

/**
 * Get status color và label
 */
export const getStatusInfo = (status) => {
  // Normalize status (hỗ trợ alias)
  const normalizedStatus = normalizeStatus(status);
  
  return (
    CLASS_STATUS_COLORS[normalizedStatus] || {
      color: "#6b7280",
      bgColor: "#f9fafb",
      label: status || "Unknown",
    }
  );
};

/**
 * Normalize status (chuyển alias về status chính)
 */
export const normalizeStatus = (status) => {
  if (!status) return null;
  
  // Chuyển về uppercase để so sánh
  const upperStatus = String(status).toUpperCase().trim();
  
  // Map alias về status chính
  const aliasMap = {
    "PENDING_APPROVAL": CLASS_STATUS.PENDING,
    "PUBLISHED": CLASS_STATUS.ACTIVE,
    "OPEN": CLASS_STATUS.ACTIVE,
    "DONE": CLASS_STATUS.CLOSE,
    "COMPLETED": CLASS_STATUS.CLOSE,
    "CLOSED": CLASS_STATUS.CLOSE,
    "CANCEL": CLASS_STATUS.CANCEL,
    "CANCELLED": CLASS_STATUS.CANCEL,
  };
  
  // Kiểm tra trong aliasMap trước
  if (aliasMap[upperStatus]) {
    return aliasMap[upperStatus];
  }
  
  // Nếu là một trong các status chính, trả về trực tiếp
  const validStatuses = [
    CLASS_STATUS.DRAFT,
    CLASS_STATUS.WAITING,
    CLASS_STATUS.PENDING,
    CLASS_STATUS.APPROVED,
    CLASS_STATUS.ACTIVE,
    CLASS_STATUS.ON_GOING,
    CLASS_STATUS.CLOSE,
    CLASS_STATUS.CANCEL,
  ];
  
  if (validStatuses.includes(upperStatus)) {
    return upperStatus;
  }
  
  // Fallback: trả về status gốc (uppercase)
  return upperStatus;
};

/**
 * Check if status is in a category
 */
export const isAdminStatus = (status) => {
  const normalized = normalizeStatus(status);
  return [
    CLASS_STATUS.DRAFT,
    CLASS_STATUS.WAITING,
    CLASS_STATUS.PENDING,
    CLASS_STATUS.APPROVED,
  ].includes(normalized);
};

export const isPublicStatus = (status) => {
  const normalized = normalizeStatus(status);
  return [
    CLASS_STATUS.ACTIVE,
    CLASS_STATUS.ON_GOING,
  ].includes(normalized);
};

export const isEndStatus = (status) => {
  const normalized = normalizeStatus(status);
  return [
    CLASS_STATUS.CLOSE,
    CLASS_STATUS.CANCEL,
  ].includes(normalized);
};

/**
 * Check if can transition to target status
 */
export const canTransitionTo = (currentStatus, targetStatus) => {
  const current = normalizeStatus(currentStatus);
  const target = normalizeStatus(targetStatus);
  
  // Không thể chuyển từ trạng thái kết thúc
  if (isEndStatus(current)) {
    return false;
  }
  
  // Flow chuyển đổi hợp lệ
  const validTransitions = {
    [CLASS_STATUS.DRAFT]: [
      CLASS_STATUS.WAITING,
      CLASS_STATUS.CANCEL,
    ],
    [CLASS_STATUS.WAITING]: [
      CLASS_STATUS.PENDING,
      CLASS_STATUS.DRAFT, // Instructor từ chối, trả về DRAFT
      CLASS_STATUS.CANCEL,
    ],
    [CLASS_STATUS.PENDING]: [
      CLASS_STATUS.APPROVED,
      CLASS_STATUS.DRAFT, // Admin từ chối, trả về DRAFT
      CLASS_STATUS.CANCEL,
    ],
    [CLASS_STATUS.APPROVED]: [
      CLASS_STATUS.ACTIVE,
      CLASS_STATUS.CANCEL,
    ],
    [CLASS_STATUS.ACTIVE]: [
      CLASS_STATUS.ON_GOING,
      CLASS_STATUS.CANCEL,
    ],
    [CLASS_STATUS.ON_GOING]: [
      CLASS_STATUS.CLOSE,
      CLASS_STATUS.CANCEL,
    ],
  };
  
  return validTransitions[current]?.includes(target) || false;
};

export default {
  CLASS_STATUS,
  CLASS_STATUS_LABELS,
  CLASS_STATUS_COLORS,
  getStatusInfo,
  normalizeStatus,
  isAdminStatus,
  isPublicStatus,
  isEndStatus,
  canTransitionTo,
};

