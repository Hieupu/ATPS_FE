// Attendance Service - Attendance Management APIs
import apiClient from "./apiClient";

const attendanceService = {
  // ========== ATTENDANCE APIs ==========

  // Tạo attendance mới
  createAttendance: async (attendanceData) => {
    try {
      const result = await apiClient.post("/attendance", attendanceData);

      return {
        success: true,
        data: result.data,
        message: result.message || "Tạo attendance thành công",
      };
    } catch (error) {
      if (error.response?.data?.errors) {
        const validationError = new Error(
          error.response.data.message || "Validation failed"
        );
        validationError.success = false;
        validationError.errors = error.response.data.errors;
        throw validationError;
      }

      throw error;
    }
  },

  // Lấy attendance theo ID
  getAttendanceById: async (attendanceId) => {
    try {
      const result = await apiClient.get(`/attendance/${attendanceId}`);

      return {
        data: result.data,
      };
    } catch (error) {
      return { data: null };
    }
  },

  // Lấy attendance theo LearnerID
  getAttendanceByLearner: async (learnerId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/attendance/learner/${learnerId}?${queryString}`
      );

      return {
        data: result.data || [],
        pagination: result.pagination,
      };
    } catch (error) {
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
    }
  },

  // Lấy attendance theo SessionTimeslotID
  getAttendanceBySessionTimeslot: async (sessionTimeslotId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/attendance/session-timeslot/${sessionTimeslotId}?${queryString}`
      );

      return {
        data: result.data || [],
        pagination: result.pagination,
      };
    } catch (error) {
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
    }
  },

  // Lấy attendance theo ClassID
  getAttendanceByClass: async (classId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/attendance/class/${classId}?${queryString}`
      );

      return {
        data: result.data || [],
        pagination: result.pagination,
      };
    } catch (error) {
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
    }
  },

  // Cập nhật attendance
  updateAttendance: async (attendanceId, attendanceData) => {
    try {
      const result = await apiClient.put(
        `/attendance/${attendanceId}`,
        attendanceData
      );

      return {
        success: true,
        data: result.data,
        message: result.message || "Cập nhật attendance thành công",
      };
    } catch (error) {
      if (error.response?.data?.errors) {
        const validationError = new Error(
          error.response.data.message || "Validation failed"
        );
        validationError.success = false;
        validationError.errors = error.response.data.errors;
        throw validationError;
      }

      throw error;
    }
  },

  // Xóa attendance
  deleteAttendance: async (attendanceId) => {
    try {
      const result = await apiClient.delete(`/attendance/${attendanceId}`);

      return {
        success: true,
        message: result.message || "Xóa attendance thành công",
      };
    } catch (error) {
      throw error;
    }
  },

  // Lấy thống kê attendance theo ClassID
  getAttendanceStats: async (classId) => {
    try {
      const result = await apiClient.get(`/attendance/stats/${classId}`);

      return {
        data: result.data,
      };
    } catch (error) {
      return { data: null };
    }
  },
};

export default attendanceService;
