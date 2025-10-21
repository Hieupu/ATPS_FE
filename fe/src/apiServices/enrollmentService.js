// Enrollment Service - Enrollment Management APIs
import apiClient from "./apiClient";

const enrollmentService = {
  // ========== ENROLLMENT APIs ==========

  // Đăng ký lớp học (Admin)
  enrollClass: async (enrollmentData) => {
    try {
      const result = await apiClient.post(
        "/enrollments/enroll",
        enrollmentData
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

  // Học viên tự đăng ký
  selfEnroll: async (learnerId, enrollmentData) => {
    try {
      const result = await apiClient.post(
        `/enrollments/${learnerId}/self-enroll`,
        enrollmentData
      );

      return {
        success: true,
        data: result.data,
        message: result.message || "Tự đăng ký thành công",
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

  // Lấy enrollment theo ID
  getEnrollmentById: async (enrollmentId) => {
    try {
      const result = await apiClient.get(`/enrollments/${enrollmentId}`);

      return {
        data: result.data,
      };
    } catch (error) {
      return { data: null };
    }
  },

  // Hủy đăng ký
  cancelEnrollment: async (enrollmentId) => {
    try {
      const result = await apiClient.delete(`/enrollments/${enrollmentId}`);

      return {
        success: true,
        message: result.message || "Hủy đăng ký thành công",
      };
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách khóa học có thể đăng ký
  getAvailableCourses: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/enrollments/available-courses?${queryString}`
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

  // Lấy danh sách lớp học đã đăng ký
  getEnrolledClasses: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/enrollments/enrolled-classes?${queryString}`
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

  // Lấy danh sách đăng ký của học viên
  getLearnerEnrollments: async (learnerId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/enrollments/learner/${learnerId}?${queryString}`
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

  // Tham gia lớp học cụ thể
  joinClass: async (classId, joinData) => {
    try {
      const result = await apiClient.post(
        `/enrollments/classes/${classId}/join`,
        joinData
      );

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

  // Rời khỏi lớp học
  leaveClass: async (classId, leaveData) => {
    try {
      const result = await apiClient.delete(
        `/enrollments/classes/${classId}/leave`,
        { data: leaveData }
      );

      return {
        success: true,
        message: result.message || "Rời khỏi lớp học thành công",
      };
    } catch (error) {
      throw error;
    }
  },
};

export default enrollmentService;
