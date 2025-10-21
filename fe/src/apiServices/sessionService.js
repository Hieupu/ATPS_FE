// Session Service - Session Management APIs
import apiClient from "./apiClient";

const sessionService = {
  // ========== SESSION APIs ==========

  // Tạo session/lesson
  createSession: async (sessionData) => {
    try {
      const result = await apiClient.post("/sessions", sessionData);

      return {
        success: true,
        data: result.data,
        message: result.message || "Tạo session thành công",
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

  // Lấy session của lớp học
  getClassSessions: async (classId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/sessions/class/${classId}?${queryString}`
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

  // Lấy session theo InstructorID
  getInstructorSessions: async (instructorId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/sessions/instructor/${instructorId}?${queryString}`
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

  // Lấy session theo ID
  getSessionById: async (sessionId) => {
    try {
      const result = await apiClient.get(`/sessions/${sessionId}`);

      return {
        data: result.data,
      };
    } catch (error) {
      return { data: null };
    }
  },

  // Cập nhật session
  updateSession: async (sessionId, sessionData) => {
    try {
      const result = await apiClient.put(`/sessions/${sessionId}`, sessionData);

      return {
        success: true,
        data: result.data,
        message: result.message || "Cập nhật session thành công",
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

  // Xóa session
  deleteSession: async (sessionId) => {
    try {
      const result = await apiClient.delete(`/sessions/${sessionId}`);

      return {
        success: true,
        message: result.message || "Xóa session thành công",
      };
    } catch (error) {
      throw error;
    }
  },
};

export default sessionService;
