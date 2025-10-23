import apiClient from "./apiClient";

const sessionTimeslotService = {

  // Tạo sessiontimeslot mới
  createSessionTimeslot: async (sessionTimeslotData) => {
    try {
      const result = await apiClient.post(
        "/session-timeslots",
        sessionTimeslotData
      );

      return {
        success: true,
        data: result.data,
        message: result.message || "Tạo session timeslot thành công",
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

  // Gán timeslot cho session
  assignTimeslotToSession: async (sessionId, timeslotData) => {
    try {
      const result = await apiClient.post(
        `/session-timeslots/sessions/${sessionId}/assign`,
        timeslotData
      );

      return {
        success: true,
        data: result.data,
        message: result.message || "Gán timeslot cho session thành công",
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

  // Lấy timeslots của session
  getSessionTimeslots: async (sessionId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/session-timeslots/sessions/${sessionId}?${queryString}`
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

  // Lấy sessiontimeslot theo ID
  getSessionTimeslotById: async (sessionTimeslotId) => {
    try {
      const result = await apiClient.get(
        `/session-timeslots/${sessionTimeslotId}`
      );

      return {
        data: result.data,
      };
    } catch (error) {
      return { data: null };
    }
  },

  // Lấy sessiontimeslots theo ClassID
  getSessionTimeslotsByClassId: async (classId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/session-timeslots/class/${classId}?${queryString}`
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

  // Lấy lịch học của học viên
  getLearnerSchedule: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/session-timeslots/learner/schedule?${queryString}`
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

  // Cập nhật sessiontimeslot
  updateSessionTimeslot: async (sessionTimeslotId, sessionTimeslotData) => {
    try {
      const result = await apiClient.put(
        `/session-timeslots/${sessionTimeslotId}`,
        sessionTimeslotData
      );

      return {
        success: true,
        data: result.data,
        message: result.message || "Cập nhật session timeslot thành công",
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

  // Xóa sessiontimeslot
  deleteSessionTimeslot: async (sessionTimeslotId) => {
    try {
      const result = await apiClient.delete(
        `/session-timeslots/${sessionTimeslotId}`
      );

      return {
        success: true,
        message: result.message || "Xóa session timeslot thành công",
      };
    } catch (error) {
      throw error;
    }
  },
};

export default sessionTimeslotService;
