import apiClient from "./apiClient";

const instructorService = {
  // Lấy danh sách tất cả giảng viên với xử lý nhiều format response
  getAllInstructors: async () => {
    try {
      const response = await apiClient.get("/instructors");

      let instructorsList = [];

      if (response.data) {
        // Format 1: { success: true, data: [...] }
        if (response.data.data && Array.isArray(response.data.data)) {
          instructorsList = response.data.data;
        }
        // Format 2: { items: [...], total, page, pageSize }
        else if (response.data.items && Array.isArray(response.data.items)) {
          instructorsList = response.data.items;
        }
        // Format 3: Direct array
        else if (Array.isArray(response.data)) {
          instructorsList = response.data;
        }
      }

      return instructorsList;
    } catch (error) {
      console.error("Get instructors error:", error);
      console.error("Error details:", error.response?.data);
      throw error.response?.data || { message: "Failed to fetch instructors" };
    }
  },

  // Lấy danh sách giảng viên cho admin với format cố định
  getAllInstructorsAdmin: async () => {
    try {
      const response = await apiClient.get("/instructors/admin/all");

      const instructorsList = response.data?.data || [];

      if (!Array.isArray(instructorsList)) {
        console.warn(
          "Admin instructors API returned non-array format:",
          response.data
        );
        return [];
      }

      return instructorsList;
    } catch (error) {
      console.error("Get admin instructors error:", error);
      console.error("Error details:", error.response?.data);
      throw error.response?.data || { message: "Failed to fetch instructors" };
    }
  },

  // Lấy thông tin chi tiết giảng viên
  getInstructorById: async (instructorId) => {
    try {
      const response = await apiClient.get(`/instructors/${instructorId}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Get instructor error:", error);
      throw error.response?.data || { message: "Failed to fetch instructor" };
    }
  },

  // Lấy giảng viên nổi bật
  getFeaturedInstructors: async (limit = 4) => {
    try {
      const response = await apiClient.get(
        `/instructors/featured?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Get featured instructors error:", error);
      throw (
        error.response?.data || {
          message: "Failed to fetch featured instructors",
        }
      );
    }
  },

  // Tạo giảng viên mới
  createInstructor: async (instructorData) => {
    try {
      const response = await apiClient.post("/instructors", instructorData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Create instructor error:", error);
      throw error.response?.data || { message: "Failed to create instructor" };
    }
  },

  // Cập nhật thông tin giảng viên
  updateInstructor: async (instructorId, instructorData) => {
    try {
      const response = await apiClient.put(
        `/instructors/${instructorId}`,
        instructorData
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Update instructor error:", error);
      throw error.response?.data || { message: "Failed to update instructor" };
    }
  },

  // Xóa giảng viên
  deleteInstructor: async (instructorId) => {
    try {
      const response = await apiClient.delete(`/instructors/${instructorId}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Delete instructor error:", error);
      throw error.response?.data || { message: "Failed to delete instructor" };
    }
  },

  // Lấy giảng viên kèm danh sách khóa học với validation
  getInstructorWithCourses: async (instructorId) => {
    try {
      const numericId = parseInt(instructorId);
      if (isNaN(numericId) || numericId <= 0) {
        console.error(
          "[instructorService] Invalid instructorId:",
          instructorId
        );
        throw new Error(
          "Invalid instructorId: must be a positive number (InstructorID)"
        );
      }

      const response = await apiClient.get(`/instructors/${numericId}/courses`);

      const result = response.data?.data || response.data;

      return result;
    } catch (error) {
      console.error("Get instructor with courses error:", error);
      console.error("Error response:", error.response);
      throw (
        error.response?.data || {
          message: "Failed to fetch instructor courses",
        }
      );
    }
  },

  // Lấy lịch dạy của giảng viên
  getInstructorSchedule: async (
    instructorId,
    startDate = null,
    endDate = null
  ) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const queryString = params.toString();
      const url = `/instructors/${instructorId}/schedule${
        queryString ? `?${queryString}` : ""
      }`;
      const response = await apiClient.get(url);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Get instructor schedule error:", error);
      throw (
        error.response?.data || {
          message: "Failed to fetch instructor schedule",
        }
      );
    }
  },

  // Lấy thống kê giảng viên
  getInstructorStatistics: async (instructorId) => {
    try {
      const response = await apiClient.get(
        `/instructors/${instructorId}/statistics`
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Get instructor statistics error:", error);
      throw (
        error.response?.data || {
          message: "Failed to fetch instructor statistics",
        }
      );
    }
  },

  // Search instructors với xử lý nhiều format response
  searchInstructors: async ({
    search = "",
    major = "",
    type = "",
    timeslots = [],
    minFee = 0,
    maxFee = 1000000,
    sort = "newest",
    page = 1,
    pageSize = 10,
  }) => {
    try {
      const params = new URLSearchParams({
        search,
        sort,
        page: String(page),
        pageSize: String(pageSize),
        minFee: String(minFee),
        maxFee: String(maxFee),
      });

      if (major) params.append("major", major);
      if (type) params.append("type", type);

      if (Array.isArray(timeslots) && timeslots.length > 0) {
        timeslots.forEach((ts) => params.append("timeslots", ts));
      }

      const response = await apiClient.get(`/instructors?${params.toString()}`);

      // Xử lý nhiều format response từ backend
      if (response.data?.items !== undefined) {
        return response.data;
      } else if (response.data?.data?.items !== undefined) {
        return response.data.data;
      } else if (response.data?.instructors) {
        return {
          items: response.data.instructors,
          total: response.data.instructors.length,
          page: 1,
          pageSize: response.data.instructors.length,
        };
      } else if (Array.isArray(response.data)) {
        return {
          items: response.data,
          total: response.data.length,
          page: 1,
          pageSize: response.data.length,
        };
      } else {
        return {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10,
        };
      }
    } catch (error) {
      console.error("Search instructors error:", error);
      throw error.response?.data || { message: "Failed to search instructors" };
    }
  },

  // Upload ảnh đại diện với logging chi tiết
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const url = "/instructors/upload-avatar";

      const response = await apiClient.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data?.data || response.data;
    } catch (error) {
      console.error("[instructorService] Upload avatar error:", error);
      console.error("[instructorService] Error response:", error.response);
      console.error("[instructorService] Error URL:", error.config?.url);
      throw (
        error.response?.data || {
          message: "Failed to upload avatar",
        }
      );
    }
  },

  // Upload CV với logging chi tiết
  uploadCV: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const url = "/instructors/upload-cv";

      const response = await apiClient.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data?.data || response.data;
    } catch (error) {
      console.error("[instructorService] Upload CV error:", error);
      console.error("[instructorService] Error response:", error.response);
      console.error("[instructorService] Error URL:", error.config?.url);
      throw (
        error.response?.data || {
          message: "Failed to upload CV",
        }
      );
    }
  },

  // Lấy lịch bận để dạy
  getAvailability: async (instructorId, startDate, endDate) => {
    try {
      const response = await apiClient.get(
        `/instructors/${instructorId}/availability?startDate=${startDate}&endDate=${endDate}`
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Get availability error:", error);
      throw (
        error.response?.data || {
          message: "Failed to fetch availability",
        }
      );
    }
  },

  // Lưu lịch bận để dạy
  saveAvailability: async (
    instructorId,
    startDate,
    endDate,
    slots,
    instructorType
  ) => {
    try {
      const response = await apiClient.post(
        `/instructors/${instructorId}/availability`,
        {
          startDate,
          endDate,
          slots,
          instructorType,
        }
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Save availability error:", error);
      throw (
        error.response?.data || {
          message: "Failed to save availability",
        }
      );
    }
  },

  // Check timeslot availability
  checkTimeslotAvailability: async (params) => {
    try {
      const response = await apiClient.post(
        "/instructors/check-timeslot-availability",
        params
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Check timeslot availability error:", error);
      throw (
        error.response?.data || {
          message: "Failed to check timeslot availability",
        }
      );
    }
  },
};

export default instructorService;
