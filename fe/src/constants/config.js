// Application Configuration

export const APP_CONFIG = {
  APP_NAME: "ATPS Admin Dashboard",
  APP_VERSION: "1.0.0",
  APP_DESCRIPTION: "Hệ thống Quản lý Đào tạo An toàn Thông tin",
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:3001/api",
  TIMEOUT: 10000,
};

// Feature Flags
export const FEATURES = {
  ENABLE_MOCK_DATA: process.env.REACT_APP_ENABLE_MOCK_DATA === "true" || true,
  ENABLE_NOTIFICATIONS: false,
  ENABLE_DARK_MODE: false,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// Date Format
export const DATE_FORMAT = {
  DISPLAY: "DD/MM/YYYY",
  API: "YYYY-MM-DD",
  DATETIME: "DD/MM/YYYY HH:mm",
};

// Status Constants
export const CLASS_STATUS = {
  ACTIVE: "Đang hoạt động",
  UPCOMING: "Sắp khai giảng",
  COMPLETED: "Đã kết thúc",
  PAUSED: "Tạm dừng",
};

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  INSTRUCTOR: "instructor",
  LEARNER: "learner",
  STAFF: "staff",
};

export default {
  APP_CONFIG,
  API_CONFIG,
  FEATURES,
  PAGINATION,
  DATE_FORMAT,
  CLASS_STATUS,
  USER_ROLES,
};

