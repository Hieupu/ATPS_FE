import apiClient from "./apiClient";

const certificateService = {
  // Lấy tất cả chứng chỉ (có thể filter theo instructorId và status)
  getAllCertificates: async ({
    instructorId = null,
    status = null,
    page = 1,
    pageSize = 10,
    search = null,
  } = {}) => {
    try {
      const params = new URLSearchParams();
      if (instructorId) params.append("instructorId", instructorId);
      if (status) params.append("status", status);
      if (page) params.append("page", page);
      if (pageSize) params.append("pageSize", pageSize);
      if (search) params.append("search", search);

      const queryString = params.toString();
      const url = `/certificates${queryString ? `?${queryString}` : ""}`;

      const response = await apiClient.get(url);
      return {
        data: response.data?.data || [],
        pagination: response.data?.pagination || {
          page: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0,
        },
      };
    } catch (error) {
      console.error("Get certificates error:", error);
      throw error.response?.data || { message: "Failed to fetch certificates" };
    }
  },

  // Lấy một chứng chỉ theo ID
  getCertificateById: async (certificateId) => {
    try {
      const response = await apiClient.get(`/certificates/${certificateId}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Get certificate error:", error);
      throw error.response?.data || { message: "Failed to fetch certificate" };
    }
  },

  // Cập nhật trạng thái chứng chỉ (APPROVED, REJECTED)
  updateCertificateStatus: async (certificateId, status) => {
    try {
      const response = await apiClient.put(
        `/certificates/${certificateId}/status`,
        {
          status,
        }
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Update certificate status error:", error);
      throw (
        error.response?.data || {
          message: "Failed to update certificate status",
        }
      );
    }
  },

  // Lấy chứng chỉ theo instructorId
  getCertificatesByInstructorId: async (
    instructorId,
    { page = 1, pageSize = 10, search = null, status = null } = {}
  ) => {
    try {
      const params = new URLSearchParams();
      if (page) params.append("page", page);
      if (pageSize) params.append("pageSize", pageSize);
      if (search) params.append("search", search);
      if (status) params.append("status", status);

      const queryString = params.toString();
      const url = `/certificates/instructor/${instructorId}${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await apiClient.get(url);
      return {
        data: response.data?.data || [],
        pagination: response.data?.pagination || {
          page: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0,
        },
      };
    } catch (error) {
      console.error("Get certificates by instructor ID error:", error);
      throw (
        error.response?.data || {
          message: "Failed to fetch certificates by instructor",
        }
      );
    }
  },
};

export default certificateService;
