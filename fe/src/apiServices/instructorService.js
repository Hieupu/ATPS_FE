import apiClient from "./apiClient";

const instructorService = {

  // Lấy tất cả giảng viên
  getAllInstructors: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(`/instructors?${queryString}`);

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

  // Lấy giảng viên theo ID
  getInstructorById: async (instructorId) => {
    try {
      const result = await apiClient.get(`/instructors/${instructorId}`);

      return {
        data: result.data,
      };
    } catch (error) {
      return { data: null };
    }
  },

  // Lấy các khóa học của giảng viên
  getInstructorCourses: async (instructorId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/instructors/${instructorId}/courses?${queryString}`
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
};

export default instructorService;
