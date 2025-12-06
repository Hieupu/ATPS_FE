import apiClient from "./apiClient";

const instructorService = {
  // Lấy danh sách tất cả giảng viên (Public endpoint)
  getAllInstructors: async () => {
    try {
      const response = await apiClient.get("/instructors");
      console.log("Instructors API raw response:", response.data);

      // Handle multiple response formats
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

      console.log("Instructors list sample:", instructorsList[0]);
      return instructorsList;
    } catch (error) {
      console.error("Get instructors error:", error);
      console.error("Error details:", error.response?.data);
      throw error.response?.data || { message: "Failed to fetch instructors" };
    }
  },

  // Lấy danh sách tất cả giảng viên (Admin-specific endpoint)
  // Format: { success: true, data: [...] }
  getAllInstructorsAdmin: async () => {
    try {
      const response = await apiClient.get("/instructors/admin/all");
      console.log("Admin Instructors API raw response:", response.data);

      // Admin endpoint always returns: { success: true, data: [...] }
      const instructorsList = response.data?.data || [];

      if (!Array.isArray(instructorsList)) {
        console.warn(
          "Admin instructors API returned non-array format:",
          response.data
        );
        return [];
      }

      console.log("Admin instructors list sample:", instructorsList[0]);
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

  // Lấy giảng viên kèm danh sách khóa học
  getInstructorWithCourses: async (instructorId) => {
    try {
      console.log(
        "[instructorService] getInstructorWithCourses called with instructorId:",
        instructorId
      );
      console.log(
        "[instructorService] instructorId type:",
        typeof instructorId
      );

      // Đảm bảo instructorId là số (InstructorID), không phải AccID
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
      console.log("[instructorService] Full API response:", response);
      console.log("[instructorService] response.data:", response.data);
      console.log(
        "[instructorService] response.data.data:",
        response.data?.data
      );

      // Backend trả về: { success: true, data: { InstructorID, ..., courses: [...] } }
      const result = response.data?.data || response.data;
      console.log("[instructorService] Final result:", result);
      console.log(
        "[instructorService] Result InstructorID:",
        result?.InstructorID
      );
      console.log("[instructorService] Courses in result:", result?.courses);
      console.log(
        "[instructorService] Courses count:",
        result?.courses?.length || 0
      );

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

  // Search instructors
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
      console.log("[searchInstructors] Raw API response:", {
        data: response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        hasItems: response.data?.items !== undefined,
        hasData: response.data?.data !== undefined,
        hasInstructors: response.data?.instructors !== undefined,
        keys: response.data ? Object.keys(response.data) : [],
      });

      // Backend trả về: { items: [], total: number, page: number, pageSize: number }
      // Hoặc: { success: true, data: { items, total } }
      // Hoặc: { instructors: [] } (khi không có filter)
      if (response.data?.items !== undefined) {
        // Format: { items, total, page, pageSize }
        console.log("[searchInstructors] Returning format: { items, total }", {
          itemsCount: response.data.items?.length || 0,
          total: response.data.total || 0,
        });
        return response.data;
      } else if (response.data?.data?.items !== undefined) {
        // Format: { success: true, data: { items, total } }
        return response.data.data;
      } else if (response.data?.instructors) {
        // Format: { instructors: [] }
        return {
          items: response.data.instructors,
          total: response.data.instructors.length,
          page: 1,
          pageSize: response.data.instructors.length,
        };
      } else if (Array.isArray(response.data)) {
        // Format: [] (array directly)
        return {
          items: response.data,
          total: response.data.length,
          page: 1,
          pageSize: response.data.length,
        };
      } else {
        // Fallback
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

  // Upload ảnh đại diện cho giảng viên
  uploadAvatar: async (file) => {
    try {
      console.log("[instructorService] uploadAvatar called with file:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      const formData = new FormData();
      formData.append("image", file);

      const url = "/instructors/upload-avatar";
      console.log("[instructorService] Uploading to:", url);

      const response = await apiClient.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("[instructorService] Upload response:", response.data);
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

  // Upload CV cho giảng viên
  uploadCV: async (file) => {
    try {
      console.log("[instructorService] uploadCV called with file:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      const formData = new FormData();
      formData.append("file", file);

      const url = "/instructors/upload-cv";
      console.log("[instructorService] Uploading to:", url);

      const response = await apiClient.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("[instructorService] Upload CV response:", response.data);
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

  // Lấy lịch bận để dạy của giảng viên
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

  // Lưu lịch bận để dạy của giảng viên
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
};

// Export default
export default instructorService;

// ========== NAMED EXPORTS (Compatibility) ==========
// Các named exports để tương thích với code cũ
export const getAllInstructorsApi = instructorService.getAllInstructors;
export const getAllInstructorsAdminApi =
  instructorService.getAllInstructorsAdmin;
export const getInstructorByIdApi = instructorService.getInstructorById;
export const getFeaturedInstructorsApi =
  instructorService.getFeaturedInstructors;
export const searchInstructorsApi = instructorService.searchInstructors;
export const createInstructorApi = instructorService.createInstructor;
export const updateInstructorApi = instructorService.updateInstructor;
export const deleteInstructorApi = instructorService.deleteInstructor;
export const getInstructorWithCoursesApi =
  instructorService.getInstructorWithCourses;
export const getInstructorScheduleApi = instructorService.getInstructorSchedule;
export const getInstructorStatisticsApi =
  instructorService.getInstructorStatistics;
export const uploadAvatarApi = instructorService.uploadAvatar;
export const uploadCVApi = instructorService.uploadCV;
export const getAvailabilityApi = instructorService.getAvailability;
export const saveAvailabilityApi = instructorService.saveAvailability;
