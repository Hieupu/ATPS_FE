import apiClient from "./apiClient";

const refundService = {
  // Lấy tất cả yêu cầu hoàn tiền
  getAllRefunds: async (params = {}) => {
    try {
      const { page = 1, limit = 10, status, search } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) queryParams.append("status", status);
      if (search) queryParams.append("search", search);

      const response = await apiClient.get(
        `/refunds?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Get all refunds error:", error);
      throw error.response?.data || { message: "Failed to get refunds" };
    }
  },

  // Lấy yêu cầu hoàn tiền theo ID
  getRefundById: async (refundId) => {
    try {
      const response = await apiClient.get(`/refunds/${refundId}`);
      return response.data;
    } catch (error) {
      console.error("Get refund by id error:", error);
      throw error.response?.data || { message: "Failed to get refund" };
    }
  },

  // Tạo yêu cầu hoàn tiền
  createRefund: async (refundData) => {
    try {
      const response = await apiClient.post("/refunds", refundData);
      return response.data;
    } catch (error) {
      console.error("Create refund error:", error);
      throw error.response?.data || { message: "Failed to create refund" };
    }
  },

  // Cập nhật yêu cầu hoàn tiền
  updateRefund: async (refundId, updateData) => {
    try {
      const response = await apiClient.put(`/refunds/${refundId}`, updateData);
      return response.data;
    } catch (error) {
      console.error("Update refund error:", error);
      throw error.response?.data || { message: "Failed to update refund" };
    }
  },

  // Xóa yêu cầu hoàn tiền
  deleteRefund: async (refundId) => {
    try {
      const response = await apiClient.delete(`/refunds/${refundId}`);
      return response.data;
    } catch (error) {
      console.error("Delete refund error:", error);
      throw error.response?.data || { message: "Failed to delete refund" };
    }
  },

  // Lấy yêu cầu hoàn tiền theo trạng thái
  getRefundsByStatus: async (status) => {
    try {
      const response = await apiClient.get(`/refunds/status?status=${status}`);
      return response.data;
    } catch (error) {
      console.error("Get refunds by status error:", error);
      throw (
        error.response?.data || { message: "Failed to get refunds by status" }
      );
    }
  },

  // Duyệt yêu cầu hoàn tiền
  approveRefund: async (refundId) => {
    try {
      const response = await apiClient.post(`/refunds/${refundId}/approve`);
      return response.data;
    } catch (error) {
      console.error("Approve refund error:", error);
      throw error.response?.data || { message: "Failed to approve refund" };
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
      console.error("Reject refund error:", error);
      throw error.response?.data || { message: "Failed to reject refund" };
    }
  },

  // Hoàn tiền (approved -> completed)
  completeRefund: async (refundId) => {
    try {
      const response = await apiClient.post(`/refunds/${refundId}/complete`);
      return response.data;
    } catch (error) {
      console.error("Complete refund error:", error);
      throw error.response?.data || { message: "Failed to complete refund" };
    }
  },
};

export default refundService;
