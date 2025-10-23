import apiClient from "./apiClient";

const commonService = {

  // Lấy danh sách giảng viên
  getInstructors: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/common/courses/instructors?${queryString}`
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

  // Lấy thông tin giảng viên
  getInstructorById: async (instructorId) => {
    try {
      const result = await apiClient.get(
        `/common/courses/instructors/${instructorId}`
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

  // Lấy danh sách học viên
  getLearners: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/common/courses/learners?${queryString}`
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

  // Lấy thông tin học viên
  getLearnerById: async (learnerId) => {
    try {
      const result = await apiClient.get(
        `/common/courses/learners/${learnerId}`
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

  // ========== COURSE APIs ==========

  // Lấy danh sách khóa học (public)
  getCourses: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(`/common/courses?${queryString}`);

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

  // Lấy khóa học có sẵn
  getAvailableCourses: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/common/courses/available?${queryString}`
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

  // Lấy chi tiết khóa học
  getCourseById: async (courseId) => {
    try {
      const result = await apiClient.get(`/common/courses/${courseId}`);

      return {
        data: result.data || {},
      };
    } catch (error) {
      return {
        data: {},
      };
    }
  },

  // ========== LEGACY COMPATIBILITY APIs ==========

  // Legacy: Lấy danh sách sessions (nếu cần)
  getAllSessions: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(`/common/sessions?${queryString}`);

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

  // Legacy: Lấy danh sách timeslots (nếu cần)
  getAllTimeslots: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(`/common/timeslots?${queryString}`);

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

  // ========== UTILITY FUNCTIONS ==========

  // Lấy thông tin tổng quan hệ thống
  getSystemOverview: async () => {
    try {
      // Fetch multiple endpoints in parallel
      const [coursesResult, instructorsResult, learnersResult] =
        await Promise.allSettled([
          this.getCourses({ limit: 5 }),
          this.getInstructors({ limit: 5 }),
          this.getLearners({ limit: 5 }),
        ]);

      const overview = {
        courses:
          coursesResult.status === "fulfilled" ? coursesResult.value.data : [],
        instructors:
          instructorsResult.status === "fulfilled"
            ? instructorsResult.value.data
            : [],
        learners:
          learnersResult.status === "fulfilled"
            ? learnersResult.value.data
            : [],
        stats: {
          totalCourses:
            coursesResult.status === "fulfilled"
              ? coursesResult.value.pagination?.total || 0
              : 0,
          totalInstructors:
            instructorsResult.status === "fulfilled"
              ? instructorsResult.value.pagination?.total || 0
              : 0,
          totalLearners:
            learnersResult.status === "fulfilled"
              ? learnersResult.value.pagination?.total || 0
              : 0,
        },
      };

      return {
        data: overview,
      };
    } catch (error) {
      return {
        data: {
          courses: [],
          instructors: [],
          learners: [],
          stats: {
            totalCourses: 0,
            totalInstructors: 0,
            totalLearners: 0,
          },
        },
      };
    }
  },

  // Kiểm tra health của API
  checkHealth: async () => {
    try {
      const result = await apiClient.get("/health");

      return {
        success: true,
        data: result.data || { status: "healthy" },
      };
    } catch (error) {
      return {
        success: false,
        data: { status: "unhealthy", error: error.message },
      };
    }
  },
};

export default commonService;
