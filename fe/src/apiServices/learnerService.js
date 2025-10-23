import apiClient from "./apiClient";

const learnerService = {

  // Lấy tất cả học viên
  getAllLearners: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(`/learners?${queryString}`);

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

  // Lấy học viên theo ID
  getLearnerById: async (learnerId) => {
    try {
      const result = await apiClient.get(`/learners/${learnerId}`);

      return {
        data: result.data,
      };
    } catch (error) {
      return { data: null };
    }
  },

  // Lấy các khóa học của học viên
  getLearnerCourses: async (learnerId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/learners/${learnerId}/courses?${queryString}`
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

  // ========== LEARNER CLASS APIs ==========
  // ========== SELF-ENROLLMENT APIs ==========

  // Learner: Tự đăng ký vào lớp
  selfEnrollToClass: async (learnerId, classId) => {
    try {
      const result = await apiClient.post(
        `/learner/enrollments/self/${learnerId}`,
        {
          classId,
        }
      );

      return {
        success: true,
        data: result.data,
        message: result.message || "Đăng ký lớp học thành công",
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

  // Learner: Lấy danh sách lớp đã đăng ký
  getEnrolledClasses: async (learnerId, params = {}) => {
    try {
      const queryString = new URLSearchParams({
        learnerId,
        ...params,
      }).toString();
      const result = await apiClient.get(
        `/learner/classes/enrolled?${queryString}`
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

  // Learner: Hủy đăng ký lớp
  unenrollFromClass: async (enrollmentId) => {
    try {
      const result = await apiClient.delete(
        `/learner/enrollments/${enrollmentId}`
      );

      return {
        success: true,
        message: result.message || "Hủy đăng ký lớp học thành công",
      };
    } catch (error) {
      throw error;
    }
  },

  // ========== SCHEDULE & MATERIALS APIs ==========

  // Learner: Lấy lịch học cá nhân
  getPersonalSchedule: async (learnerId, params = {}) => {
    try {
      const queryString = new URLSearchParams({
        learnerId,
        ...params,
      }).toString();
      const result = await apiClient.get(`/learner/schedule?${queryString}`);

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

  // Learner: Lấy tài liệu của khóa học đã enroll
  getCourseMaterials: async (courseId, learnerId, params = {}) => {
    try {
      const queryString = new URLSearchParams({
        learnerId,
        ...params,
      }).toString();
      const result = await apiClient.get(
        `/learner/courses/${courseId}/materials?${queryString}`
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

  // Learner: Lấy lessons của session
  getSessionLessons: async (sessionId, learnerId, params = {}) => {
    try {
      const queryString = new URLSearchParams({
        learnerId,
        ...params,
      }).toString();
      const result = await apiClient.get(
        `/learner/sessions/${sessionId}/lessons?${queryString}`
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

  // ========== CLASS MANAGEMENT APIs ==========

  // Learner: Lấy danh sách lớp có sẵn
  getAvailableClasses: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/learner/classes/available?${queryString}`
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

  // Learner: Tham gia lớp học (alternative to self-enrollment)
  joinClass: async (classId, learnerId) => {
    try {
      const result = await apiClient.post(`/learner/classes/${classId}/join`, {
        learnerId,
      });

      return {
        success: true,
        data: result.data,
        message: result.message || "Tham gia lớp học thành công",
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

  // Learner: Rời khỏi lớp học
  leaveClass: async (classId, learnerId) => {
    try {
      const result = await apiClient.delete(
        `/learner/classes/${classId}/leave`,
        {
          data: { learnerId },
        }
      );

      return {
        success: true,
        message: result.message || "Rời khỏi lớp học thành công",
      };
    } catch (error) {
      throw error;
    }
  },

  // Learner: Lấy nội dung lớp học
  getClassContent: async (classId, learnerId, params = {}) => {
    try {
      const queryString = new URLSearchParams({
        learnerId,
        ...params,
      }).toString();
      const result = await apiClient.get(
        `/learner/classes/${classId}/content?${queryString}`
      );

      return {
        data: result.data || {},
      };
    } catch (error) {
      return {
        data: {},
      };
    }
  },
};

export default learnerService;
