// Timeslot Service - Admin Timeslot Management
import apiClient from "./apiClient";

const timeslotService = {
  // Admin: Create timeslot
  createTimeslot: async (timeslotData) => {
    try {
      const result = await apiClient.post("/admin/timeslots", timeslotData);

      // Backend mới trả về format: { success, message, data }
      return {
        success: true,
        data: result.data,
        message: result.message || "Tạo lịch học thành công",
      };
    } catch (error) {
      // Handle backend validation errors
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

  // Admin: Get timeslots
  getTimeslots: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(`/admin/timeslots?${queryString}`);

      // Backend mới trả về format: { success, message, data, pagination }
      return {
        data: result.data || [],
        pagination: result.pagination,
      };
    } catch (error) {
      // Fallback to mock data if backend not ready
      return {
        success: true,
        data: [
          {
            TimeslotID: 1,
            StartTime: "09:00:00",
            EndTime: "11:00:00",
            Date: "2025-01-15",
            IsAssigned: false,
          },
          {
            TimeslotID: 2,
            StartTime: "14:00:00",
            EndTime: "16:00:00",
            Date: "2025-01-15",
            IsAssigned: true,
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };
    }
  },

  // Admin: Get timeslot by ID
  getTimeslotById: async (timeslotId) => {
    try {
      const result = await apiClient.get(`/admin/timeslots/${timeslotId}`);
      return result.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Update timeslot
  updateTimeslot: async (timeslotId, timeslotData) => {
    try {
      const result = await apiClient.put(
        `/admin/timeslots/${timeslotId}`,
        timeslotData
      );
      return result.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Delete timeslot
  deleteTimeslot: async (timeslotId) => {
    try {
      const result = await apiClient.delete(`/admin/timeslots/${timeslotId}`);
      return result.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Assign timeslot to session
  assignTimeslotToSession: async (sessionId, timeslotId) => {
    try {
      const result = await apiClient.post(
        `/admin/sessions/${sessionId}/timeslots`,
        {
          TimeslotID: timeslotId,
        }
      );
      return result.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Get session timeslots
  getSessionTimeslots: async (sessionId) => {
    try {
      const result = await apiClient.get(
        `/admin/sessions/${sessionId}/timeslots`
      );
      return result.data;
    } catch (error) {
      // Fallback to mock data
      return {
        success: true,
        data: [
          {
            sessiontimeslotID: 1,
            SessionID: sessionId,
            TimeslotID: 1,
            StartTime: "09:00:00",
            EndTime: "11:00:00",
            Date: "2025-01-15",
          },
        ],
      };
    }
  },

  // Admin: Get class schedule
  getClassSchedule: async (classId) => {
    try {
      const result = await apiClient.get(`/admin/classes/${classId}/schedule`);
      return result.data;
    } catch (error) {
      // Fallback to mock data
      return {
        success: true,
        data: {
          ClassID: classId,
          ClassName: "Lớp Java 2024",
          Sessions: [
            {
              SessionID: 1,
              SessionTitle: "Giới thiệu Java",
              Timeslots: [
                {
                  sessiontimeslotID: 1,
                  TimeslotID: 1,
                  StartTime: "09:00:00",
                  EndTime: "11:00:00",
                  Date: "2025-01-15",
                },
              ],
            },
          ],
        },
      };
    }
  },

  // Admin: Remove timeslot assignment
  removeTimeslotAssignment: async (sessionId, assignmentId) => {
    try {
      const result = await apiClient.delete(
        `/admin/sessions/${sessionId}/timeslots/${assignmentId}`
      );
      return result.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Lấy lịch học của lớp
  getClassTimeslots: async (classId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/admin/timeslots/class/${classId}?${queryString}`
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

  // Admin: Lấy lịch học của khóa học
  getCourseTimeslots: async (courseId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/admin/timeslots/course/${courseId}?${queryString}`
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

  // Admin: Lấy lịch học cá nhân của học viên
  getLearnerSchedule: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/admin/timeslots/learner/schedule?${queryString}`
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

  // Admin: Lấy ca học đã có sẵn của lớp (API mới)
  getExistingTimeslots: async (classId) => {
    try {
      const result = await apiClient.get(
        `/admin/timeslots/class/${classId}/existing-timeslots`
      );
      return {
        success: true,
        data: result.data || [],
        message: result.message || "Lấy ca học đã có sẵn thành công",
      };
    } catch (error) {
      throw error;
    }
  },
};

export default timeslotService;
