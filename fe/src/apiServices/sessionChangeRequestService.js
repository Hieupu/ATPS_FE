import apiClient from "./apiClient";

const sessionChangeRequestService = {
  // Lấy danh sách tất cả yêu cầu đổi lịch
  getAllRequests: async () => {
    try {
      const response = await apiClient.get("/instructor/session/request");
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error("Get session change requests error:", error);
      throw error.response?.data || { message: "Failed to fetch requests" };
    }
  },

  // Lấy yêu cầu theo ID
  getRequestById: async (requestId) => {
    try {
      const response = await apiClient.get(
        `/instructor/session/request/${requestId}`
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Get session change request error:", error);
      throw error.response?.data || { message: "Failed to fetch request" };
    }
  },

  // Duyệt yêu cầu đổi lịch
  approveRequest: async (requestId) => {
    try {
      const response = await apiClient.put(
        `/instructor/session/request/${requestId}/approve`
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Approve request error:", error);
      throw error.response?.data || { message: "Failed to approve request" };
    }
  },

  // Từ chối yêu cầu đổi lịch
  rejectRequest: async (requestId, reason) => {
    try {
      const response = await apiClient.put(
        `/instructor/session/request/${requestId}/reject`,
        { reason }
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Reject request error:", error);
      throw error.response?.data || { message: "Failed to reject request" };
    }
  },
};

export default sessionChangeRequestService;
