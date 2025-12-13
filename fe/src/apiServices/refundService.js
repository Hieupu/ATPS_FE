import apiClient from "./apiClient";

const refundService = {
  // Lấy tất cả yêu cầu hoàn tiền
  getAllRefunds: async (params = {}) => {
    try {
      const { page = 1, limit = 10, status, search, dateFrom, dateTo } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) queryParams.append("status", status);
      if (search) queryParams.append("search", search);
      if (dateFrom) queryParams.append("dateFrom", dateFrom);
      if (dateTo) queryParams.append("dateTo", dateTo);

      const response = await apiClient.get(
        `/refunds?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error.response?.data;
    }
  },

  // Lấy yêu cầu hoàn tiền theo ID
  getRefundById: async (refundId) => {
    try {
      const response = await apiClient.get(`/refunds/${refundId}`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error.response?.data;
    }
  },

  // Tạo yêu cầu hoàn tiền
  createRefund: async (refundData) => {
    try {
      const response = await apiClient.post("/refunds", refundData);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error.response?.data;
    }
  },

  // Cập nhật yêu cầu hoàn tiền
  updateRefund: async (refundId, updateData) => {
    try {
      const response = await apiClient.put(`/refunds/${refundId}`, updateData);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error.response?.data;
    }
  },

  // Xóa yêu cầu hoàn tiền
  deleteRefund: async (refundId) => {
    try {
      const response = await apiClient.delete(`/refunds/${refundId}`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error.response?.data;
    }
  },

  // Lấy yêu cầu hoàn tiền theo trạng thái
  getRefundsByStatus: async (status) => {
    try {
      const response = await apiClient.get(`/refunds/status?status=${status}`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error.response?.data;
    }
  },

  // Duyệt yêu cầu hoàn tiền
  approveRefund: async (refundId) => {
    try {
      const response = await apiClient.post(`/refunds/${refundId}/approve`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error.response?.data;
    }
  },

  // Từ chối yêu cầu hoàn tiền
  rejectRefund: async (refundId, rejectionReason = null) => {
    try {
      const response = await apiClient.post(`/refunds/${refundId}/reject`, {
        rejectionReason,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error.response?.data;
    }
  },

  // Lấy danh sách lớp liên quan để chuyển
  getRelatedClasses: async (refundId) => {
    try {
      const response = await apiClient.get(
        `/refunds/${refundId}/related-classes`
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error.response?.data;
    }
  },
  sendAccountInfoEmail: async (refundId) => {
    try {
      const response = await apiClient.post(
        `/refunds/${refundId}/request-account-info`
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error.response?.data;
    }
  },
};

export default refundService;
